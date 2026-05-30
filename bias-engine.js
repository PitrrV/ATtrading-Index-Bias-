// Index Bias Engine V5 — Professional Trader Edition
// vs V4:
//   - 7 faktorů místo 5: přidány Gap/ATR Context + Previous Session (nezávislé signály)
//   - Váhy rebalancovány pro nižší korelaci mezi faktory
//   - Gap/ATR: >0.7× ATR = fade pravděpodobný, <0.25× ATR = žádný edge
//   - Previous Session: kde jsme zavřeli v včerejším range (bullish/bearish close)
//   - "Signal Strength" místo "Confidence" (méně zavádějící název)
//   - Sector: divergence detekce místo prosté konfirmace, váha snížena
//   - scenarioFrom: rozlišuje gap-fade vs continuation scénář

const WEIGHTS = {
  premarket:    0.28,  // ↓ z 0.40 (méně dominantní, koreluje s topStocks a sector)
  momentum:     0.15,  // ↓ z 0.20
  topStocks:    0.10,  // ↓ z 0.15
  fundamentals: 0.20,  // stejné
  gapContext:   0.15,  // NOVÉ — Gap/ATR analýza
  prevSession:  0.08,  // NOVÉ — Previous session close context
  sector:       0.04   // ↓ z 0.05 (jen divergence, ne konfirmace)
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function normalizePremarket(weightedMovePct) { return clamp(weightedMovePct, -2, 2); }

// Lineární: 0.5% = score 1
function normalizeMomentum(deltaFrom14Pct) { return clamp(deltaFrom14Pct / 0.5, -2, 2); }

function calculateWeightedPremarket(stocks) {
  return stocks.reduce((sum, s) => sum + (s.weight / 100) * s.premarketNow, 0);
}

function calculateMomentum(stocks) {
  return stocks.reduce((sum, s) => {
    const delta = s.premarketNow - (s.premarketAt14 ?? s.premarketNow);
    return sum + (s.weight / 100) * delta;
  }, 0);
}

function calculateTopStockDominance(stocks) {
  const top = [...stocks].sort((a, b) => b.weight - a.weight).slice(0, 5);
  const positive = top.filter(s => s.premarketNow > 0.30).length;
  const negative = top.filter(s => s.premarketNow < -0.30).length;
  const avgW = top.reduce((sum, s) => sum + (s.weight / 100) * s.premarketNow, 0);
  if (positive >= 4 && avgW > 0) return 2;
  if (positive >= 3 && avgW > 0) return 1;
  if (negative >= 4 && avgW < 0) return -2;
  if (negative >= 3 && avgW < 0) return -1;
  return 0;
}

function calculateFundamentalScore(events) {
  const impactMap = { HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5 };
  const released = events.filter(e =>
    e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual))
  );
  return clamp(
    released.reduce((sum, e) => sum + (e.direction * (impactMap[e.impact] || 0)), 0),
    -2, 2
  );
}

// ── NOVÉ: Gap/ATR analýza ────────────────────────────────────────────────────
// Gap vs 5-denní ATR určuje jestli je pravděpodobnější fade nebo continuation.
// Logika: velký gap je "expensive" — trh je přetažený a první hodina ho často
// smaže. Malý gap naopak signalizuje nízké conviction a žádný edge.
//
// ratio = |gapPct| / atr5dPct
// >1.0   → Major gap → silná fade pravděpodobnost (-2 ve směru gapového pohybu)
// >0.70  → Large gap → fade bias (-1.5)
// >0.50  → Medium-large gap → mírná fade (-0.5)
// >0.25  → Normal gap → mírná continuation (+0.5)
// <0.25  → Small gap → žádný edge (0)
function calculateGapATRScore(gapPct, atr5dPct) {
  if (!atr5dPct || atr5dPct <= 0) return 0;
  const ratio = Math.abs(gapPct) / atr5dPct;
  const dir   = gapPct >= 0 ? 1 : -1;
  if (ratio > 1.00) return dir * (-2.0);
  if (ratio > 0.70) return dir * (-1.5);
  if (ratio > 0.50) return dir * (-0.5);
  if (ratio > 0.25) return dir * (0.5);
  return 0;
}

// Gap read label pro UI
function gapReadLabel(gapPct, atr5dPct) {
  if (!atr5dPct || atr5dPct <= 0) return { label: 'ATR data chybí', cls: 'neutral', ratio: null };
  const ratio = Math.abs(gapPct) / atr5dPct;
  if (ratio > 1.00) return { label: 'MAJOR FADE RISK', cls: 'bear',    ratio };
  if (ratio > 0.70) return { label: 'POTENTIAL FADE',  cls: 'bear',    ratio };
  if (ratio > 0.50) return { label: 'WATCH FADE',      cls: 'neutral', ratio };
  if (ratio > 0.25) return { label: 'CONTINUATION',    cls: 'bull',    ratio };
  return                    { label: 'SMALL GAP',       cls: 'neutral', ratio };
}

// ── NOVÉ: Previous Session Context ──────────────────────────────────────────
// Kde jsme zavřeli v včerejším range je nezávislý signál — nekoreluje s premarketem.
// Close v top 25% = institucionální zájem nakupovat přes den → bullish kontext.
// Close v bottom 25% = distribuce, sellers kontrolují → bearish kontext.
//
// closePosition: (close - low) / (high - low) → 0.0 = bottom, 1.0 = top
function calculatePrevSessionScore(prevSession) {
  if (!prevSession) return 0;
  const cp = prevSession.closePosition;
  if (cp >= 0.75) return  1.0;
  if (cp >= 0.55) return  0.5;
  if (cp <= 0.25) return -1.0;
  if (cp <= 0.45) return -0.5;
  return 0;
}

// Sector: pouze divergence/konfirmace — nízká váha
// Pokud akcie jdou nahoru ale sector ETF dolů = divergence = snížit signal
function calculateSectorScore(sectors, weightedPremarket) {
  const rel = sectors.filter(s => ['TECH', 'SEMIS'].includes(s.name));
  if (!rel.length) return 0;
  const avgSector = rel.reduce((s, sec) => s + sec.change, 0) / rel.length;
  const premDir = weightedPremarket > 0.2 ? 1 : weightedPremarket < -0.2 ? -1 : 0;
  const sectDir = avgSector > 0.2 ? 1 : avgSector < -0.2 ? -1 : 0;
  if (premDir !== 0 && sectDir !== 0 && premDir !== sectDir) return -0.5; // divergence
  if (premDir !== 0 && premDir === sectDir) return premDir * 0.5;          // konfirmace
  return 0;
}

// ── Volume Ratio modifier ────────────────────────────────────────────────────
// volumeRatio = dnešní premarket volume / normální premarket volume
// < 0.3  → THIN MARKET — šum, signal netlumit ale snížit konvikci
// < 0.6  → Podprůměrný objem — mírné snížení
// 0.6–1.5 → Normální — beze změny
// > 2.0  → Nadprůměrný objem — silná konvikce, mírné zvýšení
// > 3.0  → Institucionální pohyb — maximum zvýšení
function applyVolumeModifier(score, volumeRatio) {
  if (volumeRatio === null || volumeRatio === undefined) return score;
  if (volumeRatio < 0.30) return score * 0.65;
  if (volumeRatio < 0.60) return score * 0.82;
  if (volumeRatio > 3.00) return score * 1.22;
  if (volumeRatio > 2.00) return score * 1.12;
  return score;
}

// Volume conviction label pro UI
function volumeConvictionLabel(ratio) {
  if (ratio === null || ratio === undefined) return { label: '—', cls: 'neutral', icon: '' };
  if (ratio < 0.30) return { label: 'THIN MARKET',    cls: 'bear',    icon: '⚠' };
  if (ratio < 0.60) return { label: 'LOW VOLUME',     cls: 'neutral', icon: '↓' };
  if (ratio < 1.50) return { label: 'NORMAL',         cls: 'neutral', icon: '—' };
  if (ratio < 2.50) return { label: 'HIGH VOLUME',    cls: 'bull',    icon: '↑' };
  return                   { label: 'STRONG CONV.',   cls: 'bull',    icon: '↑↑' };
}

function applyVixModifier(score, vixChangePct) {
  if (vixChangePct === null || vixChangePct === undefined) return score;
  if (vixChangePct > 15) return score * 0.60;
  if (vixChangePct > 8)  return score * 0.78;
  if (vixChangePct < -10) return score * 1.12;
  if (vixChangePct < -5)  return score * 1.06;
  return score;
}

function getFundamentalFreezeInfo(events) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = fmt.formatToParts(now);
  const etH = parseInt(parts.find(p => p.type === 'hour').value);
  const etM = parseInt(parts.find(p => p.type === 'minute').value);
  const nowMin = etH * 60 + etM;
  for (const e of events) {
    if (e.impact !== 'HIGH') continue;
    if (e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual))) continue;
    if (!e.timeET) continue;
    const [h, m] = e.timeET.split(':').map(Number);
    const diff = (h * 60 + m) - nowMin;
    if (diff > 0 && diff <= 45) return { frozen: true, event: e, minutesLeft: diff };
  }
  return { frozen: false };
}

function classifyBias(score) {
  if (score >= 1.4)  return 'STRONG LONG';
  if (score >= 0.5)  return 'LONG';
  if (score <= -1.4) return 'STRONG SHORT';
  if (score <= -0.5) return 'SHORT';
  return 'NEUTRAL';
}

// Signal Strength — pojmenování záměrně nevolí "confidence" (zavádějící číslo)
function signalStrength(score) {
  const abs = Math.abs(score);
  if (abs < 0.30) return { value: 30, label: 'LOW',         cls: 'neutral' };
  if (abs < 0.60) return { value: 45, label: 'MEDIUM',      cls: 'neutral' };
  if (abs < 1.00) return { value: Math.round(50 + (abs - 0.60) / 0.40 * 15), label: 'MEDIUM-HIGH', cls: 'bull' };
  return              { value: Math.round(65 + Math.min(25, (abs - 1.00) / 1.00 * 25)), label: 'HIGH', cls: 'bull' };
}

function scenarioFrom(score, momentumRaw, fundamentalScore, freeze, gapContextScore) {
  if (freeze?.frozen)
    return { name: `ČEKEJ — ${freeze.event.name} za ${freeze.minutesLeft} min`, probability: 50, mode: 'neutral' };

  const bias        = classifyBias(score);
  const isFadeBias  = gapContextScore < -0.5;

  if (bias.includes('LONG') && isFadeBias)
    return { name: 'GAP FILL FIRST — pak long', probability: 52, mode: 'neutral' };
  if (bias.includes('LONG') && momentumRaw > 0.20 && fundamentalScore >= 0)
    return { name: 'POKRAČOVÁNÍ LONG', probability: signalStrength(score).value, mode: 'bull' };
  if (bias.includes('LONG') && momentumRaw < -0.15)
    return { name: 'PULLBACK / VWAP TEST', probability: Math.max(48, signalStrength(score).value - 8), mode: 'neutral' };
  if (bias.includes('SHORT') && isFadeBias)
    return { name: 'GAP FILL FIRST — pak short', probability: 52, mode: 'neutral' };
  if (bias.includes('SHORT') && momentumRaw < -0.20 && fundamentalScore <= 0)
    return { name: 'POKRAČOVÁNÍ SHORT', probability: signalStrength(score).value, mode: 'bear' };
  if (bias.includes('SHORT') && momentumRaw > 0.15)
    return { name: 'SHORT SQUEEZE RISK', probability: Math.max(48, signalStrength(score).value - 10), mode: 'neutral' };
  return { name: 'CHOP / ČEKEJ NA POTVRZENÍ', probability: 50, mode: 'neutral' };
}

function buildTradePlan(bias, scenario, momentumRaw, events, freeze, gapRead) {
  if (freeze?.frozen) return {
    action: `Nestupuj před ${freeze.event.name}. Čekej na výsledek a potvrzení.`,
    invalidation: 'Bias aktivuje po vydání čísla — actual vs expected určí směr.',
    warning: `⚠️ HIGH IMPACT za ${freeze.minutesLeft} min — možný silný pohyb oběma směry.`
  };

  const released = events.find(e =>
    e.impact === 'HIGH' && e.actual !== null && Number.isFinite(Number(e.actual))
  );
  const relNote = released
    ? `${released.name}: actual ${released.actual} vs exp ${released.expected} — ${released.direction > 0 ? '✅ BEAT' : released.direction < 0 ? '🔴 MISS' : '➡️ IN-LINE'}`
    : 'Bez vydaného high-impact eventu.';

  const isBigGap = gapRead?.ratio > 0.70;
  const gapNote  = isBigGap
    ? `⚠️ Gap/ATR ${gapRead.ratio.toFixed(2)}× — ${gapRead.label}. Nechaseovat open, čekat první 5–15 min.`
    : null;

  if (bias.includes('LONG')) return {
    action: isBigGap
      ? 'Čekej na gap fill / první reverzi dolů. Hledej long entry na VWAP nebo demand zóně po potvrzení H/L.'
      : momentumRaw < 0
        ? 'Nechaseovat open. Čekat pullback k VWAP / liquidity a potvrzení.'
        : 'Long-only bias. Hledat buy dips, ne shortovat první sílu.',
    invalidation: 'Ztráta premarket low + top stocks přepnou do negativního weighted impactu.',
    warning: gapNote || relNote
  };
  if (bias.includes('SHORT')) return {
    action: isBigGap
      ? 'Čekej na gap fill / první odraz nahoru. Hledej short entry na VWAP nebo supply zóně po potvrzení LH.'
      : momentumRaw > 0
        ? 'Neprodávat naslepo. Čekat failed push / lower high.'
        : 'Short-only bias. Hledat sell rallies do VWAP / resistance.',
    invalidation: 'Break premarket high + NVDA/MSFT/AAPL otočí weighted impact do plusu.',
    warning: gapNote || relNote
  };
  return {
    action: 'No-trade bias. Čekat až struktura po open ukáže jasný směr.',
    invalidation: 'Bias aktivuje při jasném momentum breaku po datech / open.',
    warning: gapNote || relNote
  };
}

function calculateIndexBias(index) {
  const weightedPremarket = calculateWeightedPremarket(index.stocks);
  const premarketScore    = normalizePremarket(weightedPremarket);
  const momentumRaw       = calculateMomentum(index.stocks);
  const momentumScore     = normalizeMomentum(momentumRaw);
  const topStockScore     = calculateTopStockDominance(index.stocks);
  const fundamentalScore  = calculateFundamentalScore(index.events);
  const sectorScore       = calculateSectorScore(index.sectors, weightedPremarket);
  const freeze            = getFundamentalFreezeInfo(index.events);

  // Gap/ATR
  const gapPct   = index.prevClose > 0
    ? ((index.premarketPrice - index.prevClose) / index.prevClose) * 100 : 0;
  const atr5dPct = index.prevClose > 0 && index.atr5d > 0
    ? (index.atr5d / index.prevClose) * 100 : null;
  const gapContextScore = calculateGapATRScore(gapPct, atr5dPct);
  const gapRead         = gapReadLabel(gapPct, atr5dPct);

  // Previous Session
  const prevSessionScore = calculatePrevSessionScore(index.prevSession ?? null);

  let totalScore =
    premarketScore    * WEIGHTS.premarket    +
    momentumScore     * WEIGHTS.momentum     +
    topStockScore     * WEIGHTS.topStocks    +
    fundamentalScore  * WEIGHTS.fundamentals +
    gapContextScore   * WEIGHTS.gapContext   +
    prevSessionScore  * WEIGHTS.prevSession  +
    sectorScore       * WEIGHTS.sector;

  totalScore = applyVixModifier(totalScore, index.vixChangePct ?? null);
  totalScore = applyVolumeModifier(totalScore, index.volumeRatio ?? null);
  totalScore = clamp(totalScore, -2, 2);

  const bias     = classifyBias(totalScore);
  const strength = freeze.frozen
    ? { value: Math.min(42, signalStrength(totalScore).value), label: 'FROZEN', cls: 'neutral' }
    : signalStrength(totalScore);
  const scenario = scenarioFrom(totalScore, momentumRaw, fundamentalScore, freeze, gapContextScore);
  const plan     = buildTradePlan(bias, scenario, momentumRaw, index.events, freeze, gapRead);

  return {
    ...index,
    weightedPremarket, momentumRaw,
    premarketScore, momentumScore, topStockScore, fundamentalScore,
    gapContextScore, prevSessionScore, sectorScore,
    gapPct, atr5dPct, gapRead,
    totalScore, bias,
    strength,
    confidence: strength.value, // backward compat pro render funkce
    scenario, plan, freeze
  };
}

window.IndexBiasEngine = {
  WEIGHTS, calculateIndexBias, calculateWeightedPremarket,
  calculateMomentum, calculateFundamentalScore,
  calculateGapATRScore, calculatePrevSessionScore, gapReadLabel,
  applyVolumeModifier, volumeConvictionLabel
};
