// Index Bias Engine V6 — Macro Edition
// Nové vs V5:
//   - MACRO faktor: 10Y výnosy (^TNX) + dolar (DX=F), citlivost dle indexu
//   - BREADTH faktor: relativní síla NQ vs ES vs small caps (IWM) — kvalita biasu
//   - SEASONALITY faktor: turn-of-month, day-of-week, OpEx týden
//   - VIX TERM STRUCTURE modifier: VIX/VIX3M místo prosté UVXY změny
//   - Volume Profile POC/VAH/VAL se zobrazuje v úrovních (počítá app.js)
//   - 9 scored faktorů + 2 modifiery

const WEIGHTS = {
  premarket:    0.22,
  fundamentals: 0.18,
  macro:        0.12,  // NOVÉ — výnosy + dolar
  gapContext:   0.12,
  momentum:     0.11,
  breadth:      0.09,  // NOVÉ — inter-index relativní síla
  topStocks:    0.06,
  prevSession:  0.06,
  seasonality:  0.04   // NOVÉ — kalendářní efekty
};

// Citlivost indexu na makro (výnosy/dolar): tech nejcitlivější, Dow nejméně
const MACRO_SENSITIVITY = { US100: 1.0, US500: 0.6, US30: 0.35 };

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function normalizePremarket(p) { return clamp(p, -2, 2); }
function normalizeMomentum(d) { return clamp(d / 0.5, -2, 2); }

function calculateWeightedPremarket(stocks) {
  return stocks.reduce((s, x) => s + (x.weight / 100) * x.premarketNow, 0);
}
function calculateMomentum(stocks) {
  return stocks.reduce((s, x) => {
    const d = x.premarketNow - (x.premarketAt14 ?? x.premarketNow);
    return s + (x.weight / 100) * d;
  }, 0);
}
function calculateTopStockDominance(stocks) {
  const top = [...stocks].sort((a, b) => b.weight - a.weight).slice(0, 5);
  const pos = top.filter(s => s.premarketNow > 0.30).length;
  const neg = top.filter(s => s.premarketNow < -0.30).length;
  const avg = top.reduce((s, x) => s + (x.weight / 100) * x.premarketNow, 0);
  if (pos >= 4 && avg > 0) return 2;
  if (pos >= 3 && avg > 0) return 1;
  if (neg >= 4 && avg < 0) return -2;
  if (neg >= 3 && avg < 0) return -1;
  return 0;
}
function calculateFundamentalScore(events) {
  const m = { HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5 };
  const rel = events.filter(e => e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual)));
  return clamp(rel.reduce((s, e) => s + e.direction * (m[e.impact] || 0), 0), -2, 2);
}

function calculateGapATRScore(gapPct, atr5dPct) {
  if (!atr5dPct || atr5dPct <= 0) return 0;
  const r = Math.abs(gapPct) / atr5dPct;
  const dir = gapPct >= 0 ? 1 : -1;
  if (r > 1.00) return dir * -2.0;
  if (r > 0.70) return dir * -1.5;
  if (r > 0.50) return dir * -0.5;
  if (r > 0.25) return dir *  0.5;
  return 0;
}
function gapReadLabel(gapPct, atr5dPct) {
  if (!atr5dPct || atr5dPct <= 0) return { label: 'ATR data chybí', cls: 'neutral', ratio: null };
  const r = Math.abs(gapPct) / atr5dPct;
  if (r > 1.00) return { label: 'MAJOR FADE RISK', cls: 'bear', ratio: r };
  if (r > 0.70) return { label: 'POTENTIAL FADE', cls: 'bear', ratio: r };
  if (r > 0.50) return { label: 'WATCH FADE', cls: 'neutral', ratio: r };
  if (r > 0.25) return { label: 'CONTINUATION', cls: 'bull', ratio: r };
  return { label: 'SMALL GAP', cls: 'neutral', ratio: r };
}

function calculatePrevSessionScore(ps) {
  if (!ps) return 0;
  const cp = ps.closePosition;
  if (cp >= 0.75) return  1.0;
  if (cp >= 0.55) return  0.5;
  if (cp <= 0.25) return -1.0;
  if (cp <= 0.45) return -0.5;
  return 0;
}

function calculateSectorScore(sectors, wp) {
  const rel = sectors.filter(s => ['TECH', 'SEMIS'].includes(s.name));
  if (!rel.length) return 0;
  const avg = rel.reduce((s, x) => s + x.change, 0) / rel.length;
  const pd = wp > 0.2 ? 1 : wp < -0.2 ? -1 : 0;
  const sd = avg > 0.2 ? 1 : avg < -0.2 ? -1 : 0;
  if (pd !== 0 && sd !== 0 && pd !== sd) return -0.5;
  if (pd !== 0 && pd === sd) return pd * 0.5;
  return 0;
}

// ── NOVÉ: MACRO — výnosy (10Y) + dolar (DXY) ────────────────────────────────
// Rostoucí výnosy = bearish pro akcie (hlavně tech). Silný dolar = mírně bearish.
// Citlivost dle indexu: US100 plně, US500 střed, US30 málo.
function calculateMacroScore(yieldsChangePct, dxyChangePct, indexId) {
  const sens = MACRO_SENSITIVITY[indexId] || 0.6;
  let s = 0;
  if (yieldsChangePct != null) {
    if (yieldsChangePct >  2) s -= 1.5;
    else if (yieldsChangePct >  1) s -= 0.8;
    else if (yieldsChangePct < -2) s += 1.5;
    else if (yieldsChangePct < -1) s += 0.8;
  }
  if (dxyChangePct != null) {
    if (dxyChangePct >  0.5) s -= 0.5;
    else if (dxyChangePct < -0.5) s += 0.5;
  }
  return clamp(s * sens, -2, 2);
}
function macroReadLabel(yieldsChangePct, dxyChangePct) {
  if (yieldsChangePct == null) return { label: '—', cls: 'neutral' };
  if (yieldsChangePct > 1.5)  return { label: 'YIELDS↑ headwind', cls: 'bear' };
  if (yieldsChangePct < -1.5) return { label: 'YIELDS↓ tailwind', cls: 'bull' };
  if (yieldsChangePct > 0.5)  return { label: 'Yields mírně ↑', cls: 'neutral' };
  if (yieldsChangePct < -0.5) return { label: 'Yields mírně ↓', cls: 'neutral' };
  return { label: 'Yields klid', cls: 'neutral' };
}

// ── NOVÉ: BREADTH — inter-index relativní síla ──────────────────────────────
// Small caps (IWM) potvrzují pohyb velkých indexů? Broad = silný bias.
// Divergence (NQ nahoru, small caps dolů) = úzký, křehký pohyb = varování.
function calculateBreadthScore(indexChangePct, smallCapChangePct, allAligned) {
  const dir = indexChangePct > 0.1 ? 1 : indexChangePct < -0.1 ? -1 : 0;
  if (dir === 0) return 0;
  let mag = 0;
  if (smallCapChangePct != null) {
    const sc = smallCapChangePct > 0.1 ? 1 : smallCapChangePct < -0.1 ? -1 : 0;
    if (sc === dir) mag += 1;
    else if (sc === -dir) mag -= 1.5;
  }
  if (allAligned) mag += 0.5;
  return clamp(dir * mag, -2, 2);
}
function breadthReadLabel(indexChangePct, smallCapChangePct) {
  if (smallCapChangePct == null) return { label: '—', cls: 'neutral' };
  const dir = indexChangePct > 0.1 ? 1 : indexChangePct < -0.1 ? -1 : 0;
  const sc  = smallCapChangePct > 0.1 ? 1 : smallCapChangePct < -0.1 ? -1 : 0;
  if (dir === 0) return { label: 'Flat', cls: 'neutral' };
  if (sc === dir)  return { label: 'BROAD — small caps potvrzují', cls: 'bull' };
  if (sc === -dir) return { label: 'NARROW — small caps diverguji', cls: 'bear' };
  return { label: 'Mixed breadth', cls: 'neutral' };
}

// ── NOVÉ: SEASONALITY — kalendářní efekty ───────────────────────────────────
function getThirdFriday(year, month) {
  const d = new Date(year, month, 1);
  let fridays = 0;
  while (d.getMonth() === month) {
    if (d.getDay() === 5) { fridays++; if (fridays === 3) return new Date(d); }
    d.setDate(d.getDate() + 1);
  }
  return null;
}
function calculateSeasonalityScore() {
  const now = new Date();
  const dom = now.getDate();
  const dow = now.getDay();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let s = 0;
  // Turn of month — institucionální flows (bullish bias)
  if (dom <= 2 || dom >= dim - 2) s += 0.5;
  // Day of week — Monday effect (historicky nejslabší)
  if (dow === 1) s -= 0.2;
  // OpEx týden — zvýšená volatilita, mírná opatrnost na směr
  const tf = getThirdFriday(now.getFullYear(), now.getMonth());
  if (tf) {
    const diff = (tf - now) / 86400000;
    if (diff >= 0 && diff <= 4) s -= 0.15; // týden před OpEx
  }
  return clamp(s, -1, 1);
}
function seasonalityLabel() {
  const now = new Date();
  const dom = now.getDate();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const tags = [];
  if (dom <= 2 || dom >= dim - 2) tags.push('Turn-of-month +');
  if (now.getDay() === 1) tags.push('Monday −');
  const tf = getThirdFriday(now.getFullYear(), now.getMonth());
  if (tf) { const diff = (tf - now) / 86400000; if (diff >= 0 && diff <= 4) tags.push('OpEx týden'); }
  return tags.length ? tags.join(' · ') : 'Neutrální';
}

// ── Modifiery ───────────────────────────────────────────────────────────────
function applyVixTermModifier(score, vix, vix3m, fallbackUvxyChange) {
  if (vix && vix3m && vix3m > 0) {
    const r = vix / vix3m;
    if (r > 1.05) return score * 0.70;  // backwardation = stress
    if (r > 1.00) return score * 0.85;  // mild backwardation
    if (r < 0.90) return score * 1.05;  // steep contango = klid
    return score;
  }
  // Fallback na UVXY změnu (V5 chování)
  if (fallbackUvxyChange != null) {
    if (fallbackUvxyChange > 15) return score * 0.60;
    if (fallbackUvxyChange > 8)  return score * 0.78;
    if (fallbackUvxyChange < -10) return score * 1.12;
  }
  return score;
}
function vixTermLabel(vix, vix3m) {
  if (!vix || !vix3m) return { label: '—', cls: 'neutral', ratio: null };
  const r = vix / vix3m;
  if (r > 1.05) return { label: 'BACKWARDATION — stres', cls: 'bear', ratio: r };
  if (r > 1.00) return { label: 'Mírná backwardation', cls: 'neutral', ratio: r };
  if (r < 0.90) return { label: 'CONTANGO — klid', cls: 'bull', ratio: r };
  return { label: 'Normální contango', cls: 'neutral', ratio: r };
}

function applyVolumeModifier(score, vr) {
  if (vr === null || vr === undefined) return score;
  if (vr < 0.30) return score * 0.65;
  if (vr < 0.60) return score * 0.82;
  if (vr > 3.00) return score * 1.22;
  if (vr > 2.00) return score * 1.12;
  return score;
}
function volumeConvictionLabel(r) {
  if (r === null || r === undefined) return { label: '—', cls: 'neutral', icon: '' };
  if (r < 0.30) return { label: 'THIN MARKET', cls: 'bear', icon: '⚠' };
  if (r < 0.60) return { label: 'LOW VOLUME', cls: 'neutral', icon: '↓' };
  if (r < 1.50) return { label: 'NORMAL', cls: 'neutral', icon: '—' };
  if (r < 2.50) return { label: 'HIGH VOLUME', cls: 'bull', icon: '↑' };
  return { label: 'STRONG CONV.', cls: 'bull', icon: '↑↑' };
}

function getFundamentalFreezeInfo(events) {
  const now = new Date();
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false });
  const p = f.formatToParts(now);
  const nowMin = parseInt(p.find(x => x.type === 'hour').value) * 60 + parseInt(p.find(x => x.type === 'minute').value);
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

function classifyBias(s) {
  if (s >= 1.4)  return 'STRONG LONG';
  if (s >= 0.5)  return 'LONG';
  if (s <= -1.4) return 'STRONG SHORT';
  if (s <= -0.5) return 'SHORT';
  return 'NEUTRAL';
}
function signalStrength(s) {
  const a = Math.abs(s);
  if (a < 0.30) return { value: 30, label: 'LOW', cls: 'neutral' };
  if (a < 0.60) return { value: 45, label: 'MEDIUM', cls: 'neutral' };
  if (a < 1.00) return { value: Math.round(50 + (a - 0.60) / 0.40 * 15), label: 'MEDIUM-HIGH', cls: 'bull' };
  return { value: Math.round(65 + Math.min(25, (a - 1.00) / 1.00 * 25)), label: 'HIGH', cls: 'bull' };
}

function scenarioFrom(score, momRaw, fund, freeze, gapCtx) {
  if (freeze?.frozen) return { name: `ČEKEJ — ${freeze.event.name} za ${freeze.minutesLeft} min`, probability: 50, mode: 'neutral' };
  const bias = classifyBias(score);
  const fade = gapCtx < -0.5;
  if (bias.includes('LONG') && fade) return { name: 'GAP FILL FIRST — pak long', probability: 52, mode: 'neutral' };
  if (bias.includes('LONG') && momRaw > 0.20 && fund >= 0) return { name: 'POKRAČOVÁNÍ LONG', probability: signalStrength(score).value, mode: 'bull' };
  if (bias.includes('LONG') && momRaw < -0.15) return { name: 'PULLBACK / VWAP TEST', probability: Math.max(48, signalStrength(score).value - 8), mode: 'neutral' };
  if (bias.includes('SHORT') && fade) return { name: 'GAP FILL FIRST — pak short', probability: 52, mode: 'neutral' };
  if (bias.includes('SHORT') && momRaw < -0.20 && fund <= 0) return { name: 'POKRAČOVÁNÍ SHORT', probability: signalStrength(score).value, mode: 'bear' };
  if (bias.includes('SHORT') && momRaw > 0.15) return { name: 'SHORT SQUEEZE RISK', probability: Math.max(48, signalStrength(score).value - 10), mode: 'neutral' };
  return { name: 'CHOP / ČEKEJ NA POTVRZENÍ', probability: 50, mode: 'neutral' };
}

function buildTradePlan(bias, scenario, momRaw, events, freeze, gapRead, breadthRead) {
  if (freeze?.frozen) return {
    action: `Nestupuj před ${freeze.event.name}. Čekej na výsledek a potvrzení.`,
    invalidation: 'Bias aktivuje po vydání čísla — actual vs expected určí směr.',
    warning: `⚠️ HIGH IMPACT za ${freeze.minutesLeft} min — možný silný pohyb oběma směry.`
  };
  const rel = events.find(e => e.impact === 'HIGH' && e.actual !== null && Number.isFinite(Number(e.actual)));
  const relNote = rel ? `${rel.name}: ${rel.actual} vs exp ${rel.expected} — ${rel.direction > 0 ? '✅ BEAT' : rel.direction < 0 ? '🔴 MISS' : '➡️ IN-LINE'}` : 'Bez vydaného high-impact eventu.';
  const bigGap = gapRead?.ratio > 0.70;
  const narrow = breadthRead?.cls === 'bear';
  const notes = [];
  if (bigGap)  notes.push(`Gap/ATR ${gapRead.ratio.toFixed(2)}× — ${gapRead.label}, čekat první 5–15 min.`);
  if (narrow)  notes.push('Breadth diverguje — úzký pohyb, opatrně s velikostí pozice.');
  const warning = notes.length ? '⚠️ ' + notes.join(' ') : relNote;

  if (bias.includes('LONG')) return {
    action: bigGap ? 'Čekej na gap fill / reverzi dolů. Long entry na VWAP nebo demand zóně po potvrzení.'
                   : momRaw < 0 ? 'Nechaseovat open. Čekat pullback k VWAP a potvrzení.'
                   : 'Long-only bias. Hledat buy dips, ne shortovat první sílu.',
    invalidation: 'Ztráta premarket low + top stocks přepnou do negativního weighted impactu.',
    warning
  };
  if (bias.includes('SHORT')) return {
    action: bigGap ? 'Čekej na gap fill / odraz nahoru. Short entry na VWAP nebo supply zóně po potvrzení.'
                   : momRaw > 0 ? 'Neprodávat naslepo. Čekat failed push / lower high.'
                   : 'Short-only bias. Hledat sell rallies do VWAP / resistance.',
    invalidation: 'Break premarket high + NVDA/MSFT/AAPL otočí weighted impact do plusu.',
    warning
  };
  return {
    action: 'No-trade bias. Čekat až struktura po open ukáže směr.',
    invalidation: 'Bias aktivuje při jasném momentum breaku po datech / open.',
    warning
  };
}

function calculateIndexBias(index) {
  const wp     = calculateWeightedPremarket(index.stocks);
  const pmScore = normalizePremarket(wp);
  const momRaw  = calculateMomentum(index.stocks);
  const momScore = normalizeMomentum(momRaw);
  const topScore = calculateTopStockDominance(index.stocks);
  const fundScore = calculateFundamentalScore(index.events);
  const sectorScore = calculateSectorScore(index.sectors, wp);
  const freeze   = getFundamentalFreezeInfo(index.events);

  // Gap/ATR
  const gapPct   = index.prevClose > 0 ? ((index.premarketPrice - index.prevClose) / index.prevClose) * 100 : 0;
  const atr5dPct = index.prevClose > 0 && index.atr5d > 0 ? (index.atr5d / index.prevClose) * 100 : null;
  const gapContextScore = calculateGapATRScore(gapPct, atr5dPct);
  const gapRead  = gapReadLabel(gapPct, atr5dPct);

  // Prev session
  const prevSessionScore = calculatePrevSessionScore(index.prevSession ?? null);

  // Macro (yields + dollar)
  const macroScore = calculateMacroScore(index.yieldsChangePct ?? null, index.dxyChangePct ?? null, index.id);
  const macroRead  = macroReadLabel(index.yieldsChangePct ?? null, index.dxyChangePct ?? null);

  // Breadth (inter-index RS)
  const allAligned = index.allAligned ?? false;
  const breadthScore = calculateBreadthScore(gapPct, index.smallCapChangePct ?? null, allAligned);
  const breadthRead  = breadthReadLabel(gapPct, index.smallCapChangePct ?? null);

  // Seasonality
  const seasonalityScore = calculateSeasonalityScore();
  const seasonRead = seasonalityLabel();

  let totalScore =
    pmScore         * WEIGHTS.premarket    +
    fundScore       * WEIGHTS.fundamentals +
    macroScore      * WEIGHTS.macro        +
    gapContextScore * WEIGHTS.gapContext   +
    momScore        * WEIGHTS.momentum     +
    breadthScore    * WEIGHTS.breadth      +
    topScore        * WEIGHTS.topStocks    +
    prevSessionScore* WEIGHTS.prevSession  +
    seasonalityScore* WEIGHTS.seasonality;

  // Modifiery
  totalScore = applyVixTermModifier(totalScore, index.vix ?? null, index.vix3m ?? null, index.vixChangePct ?? null);
  totalScore = applyVolumeModifier(totalScore, index.volumeRatio ?? null);
  totalScore = clamp(totalScore, -2, 2);

  const vixTerm = vixTermLabel(index.vix ?? null, index.vix3m ?? null);
  const bias = classifyBias(totalScore);
  const strength = freeze.frozen
    ? { value: Math.min(42, signalStrength(totalScore).value), label: 'FROZEN', cls: 'neutral' }
    : signalStrength(totalScore);
  const scenario = scenarioFrom(totalScore, momRaw, fundScore, freeze, gapContextScore);
  const plan = buildTradePlan(bias, scenario, momRaw, index.events, freeze, gapRead, breadthRead);

  return {
    ...index,
    weightedPremarket: wp, momentumRaw: momRaw,
    premarketScore: pmScore, momentumScore: momScore, topStockScore: topScore,
    fundamentalScore: fundScore, gapContextScore, prevSessionScore, sectorScore,
    macroScore, breadthScore, seasonalityScore,
    macroRead, breadthRead, seasonRead, vixTerm,
    gapPct, atr5dPct, gapRead,
    totalScore, bias, strength, confidence: strength.value,
    scenario, plan, freeze
  };
}

window.IndexBiasEngine = {
  WEIGHTS, calculateIndexBias, calculateWeightedPremarket, calculateMomentum,
  calculateFundamentalScore, calculateGapATRScore, calculatePrevSessionScore,
  calculateMacroScore, calculateBreadthScore, calculateSeasonalityScore,
  gapReadLabel, volumeConvictionLabel, vixTermLabel, macroReadLabel, breadthReadLabel
};
