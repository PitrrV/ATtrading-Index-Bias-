// Index Bias Engine V4
// Changes vs V3:
//   - WEIGHTS: premarket 50%→40%, fundamentals 10%→20%
//   - normalizeMomentum: discrete jumps → linear (0.5% = score 1)
//   - calculateTopStockDominance: threshold 0.15% → 0.30%
//   - confidenceFromScore: min 50% → min 35% (realističtější)
//   - VIX modifier: UVXY změna ovlivňuje celkový score
//   - getFundamentalFreezeInfo: detekuje HIGH event do 45 min
//   - calculateFundamentalScore: počítá POUZE vydané eventy (actual ≠ null)
//   - premarketAt12 → premarketAt14 (baseline 14:00 CZ = 08:00 ET)

const WEIGHTS = {
  premarket:    0.40,
  momentum:     0.20,
  topStocks:    0.15,
  fundamentals: 0.20,
  sector:       0.05
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function normalizePremarket(weightedMovePct) {
  return clamp(weightedMovePct, -2, 2);
}

// Lineární normalizace: 0.5% delta = score 1, 1.0% = score 2
function normalizeMomentum(deltaFrom14Pct) {
  return clamp(deltaFrom14Pct / 0.5, -2, 2);
}

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
  const avgWeighted = top.reduce((sum, s) => sum + (s.weight / 100) * s.premarketNow, 0);
  if (positive >= 4 && avgWeighted > 0) return 2;
  if (positive >= 3 && avgWeighted > 0) return 1;
  if (negative >= 4 && avgWeighted < 0) return -2;
  if (negative >= 3 && avgWeighted < 0) return -1;
  return 0;
}

// Počítá POUZE vydané eventy — actual !== null
function calculateFundamentalScore(events) {
  const impactMap = { HIGH: 1.5, MEDIUM: 1.0, LOW: 0.5 };
  const released = events.filter(e =>
    e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual))
  );
  const raw = released.reduce((sum, e) => sum + (e.direction * (impactMap[e.impact] || 0)), 0);
  return clamp(raw, -2, 2);
}

function calculateSectorScore(sectors) {
  const tech = sectors.find(s => s.name === 'TECH')?.change ?? 0;
  const semi = sectors.find(s => s.name === 'SEMIS')?.change ?? 0;
  const avg = (tech + semi) / 2;
  if (avg > 0.35) return 1;
  if (avg < -0.35) return -1;
  return 0;
}

// VIX proxy (UVXY) modifikátor — spike = snížit jistotu, pokles = zvýšit
function applyVixModifier(score, vixChangePct) {
  if (vixChangePct === null || vixChangePct === undefined) return score;
  if (vixChangePct > 15) return score * 0.60;
  if (vixChangePct > 8)  return score * 0.78;
  if (vixChangePct < -10) return score * 1.12;
  if (vixChangePct < -5)  return score * 1.06;
  return score;
}

// Detekuje HIGH IMPACT event přicházející do 45 minut
function getFundamentalFreezeInfo(events) {
  const now = new Date();
  const etFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false
  });
  const etParts = etFormatter.formatToParts(now);
  const etHour = parseInt(etParts.find(p => p.type === 'hour').value);
  const etMin  = parseInt(etParts.find(p => p.type === 'minute').value);
  const nowMinET = etHour * 60 + etMin;

  for (const e of events) {
    if (e.impact !== 'HIGH') continue;
    if (e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual))) continue;
    if (!e.timeET) continue;
    const [h, m] = e.timeET.split(':').map(Number);
    const diff = (h * 60 + m) - nowMinET;
    if (diff > 0 && diff <= 45) {
      return { frozen: true, event: e, minutesLeft: diff };
    }
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

function confidenceFromScore(score) {
  const abs = Math.abs(score);
  if (abs < 0.30) return 35;
  if (abs < 0.70) return 50;
  return Math.round(50 + Math.min(40, (abs - 0.70) / 1.30 * 40));
}

function scenarioFrom(score, momentumRaw, fundamentalScore, freeze) {
  if (freeze?.frozen) {
    return {
      name: `ČEKEJ — ${freeze.event.name} za ${freeze.minutesLeft} min`,
      probability: 50, mode: 'neutral'
    };
  }
  const bias = classifyBias(score);
  if (bias.includes('LONG') && momentumRaw > 0.20 && fundamentalScore >= 0)
    return { name: 'POKRAČOVÁNÍ LONG', probability: confidenceFromScore(score), mode: 'bull' };
  if (bias.includes('LONG') && momentumRaw < -0.15)
    return { name: 'PULLBACK / VWAP TEST', probability: Math.max(48, confidenceFromScore(score) - 8), mode: 'neutral' };
  if (bias.includes('SHORT') && momentumRaw < -0.20 && fundamentalScore <= 0)
    return { name: 'POKRAČOVÁNÍ SHORT', probability: confidenceFromScore(score), mode: 'bear' };
  if (bias.includes('SHORT') && momentumRaw > 0.15)
    return { name: 'SHORT SQUEEZE RISK', probability: Math.max(48, confidenceFromScore(score) - 10), mode: 'neutral' };
  return { name: 'CHOP / ČEKEJ NA POTVRZENÍ', probability: 50, mode: 'neutral' };
}

function buildTradePlan(bias, scenario, momentumRaw, events, freeze) {
  if (freeze?.frozen) {
    return {
      action: `Nestupuj před ${freeze.event.name}. Čekej na výsledek a potvrzení směru.`,
      invalidation: 'Bias se aktivuje po vydání čísla — actual vs expected určí směr.',
      warning: `⚠️ HIGH IMPACT event za ${freeze.minutesLeft} min — možný silný pohyb oběma směry.`
    };
  }
  const released = events.find(e =>
    e.impact === 'HIGH' && e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual))
  );
  const releasedNote = released
    ? `${released.name}: actual ${released.actual} vs exp ${released.expected} — ${released.direction > 0 ? '✅ BULLISH BEAT' : released.direction < 0 ? '🔴 BEARISH MISS' : '➡️ IN-LINE'}`
    : 'Bez vydaného high-impact eventu.';

  if (bias.includes('LONG')) return {
    action: momentumRaw < 0
      ? 'Nechaseovat open. Čekat pullback k VWAP / liquidity a potvrzení.'
      : 'Long-only bias. Hledat buy dips, ne shortovat první sílu.',
    invalidation: 'Ztráta premarket low + top stocks přepnou do negativního weighted impactu.',
    warning: releasedNote
  };
  if (bias.includes('SHORT')) return {
    action: momentumRaw > 0
      ? 'Neprodávat naslepo. Čekat failed push / lower high.'
      : 'Short-only bias. Hledat sell rallies do VWAP / resistance.',
    invalidation: 'Break premarket high + NVDA/MSFT/AAPL otočí weighted impact do plusu.',
    warning: releasedNote
  };
  return {
    action: 'No-trade bias. Čekat až struktura po open ukáže směr.',
    invalidation: 'Bias se aktivuje při jasném momentum breaku po datech / open.',
    warning: releasedNote
  };
}

function calculateIndexBias(index) {
  const weightedPremarket = calculateWeightedPremarket(index.stocks);
  const premarketScore    = normalizePremarket(weightedPremarket);
  const momentumRaw       = calculateMomentum(index.stocks);
  const momentumScore     = normalizeMomentum(momentumRaw);
  const topStockScore     = calculateTopStockDominance(index.stocks);
  const fundamentalScore  = calculateFundamentalScore(index.events);
  const sectorScore       = calculateSectorScore(index.sectors);
  const freeze            = getFundamentalFreezeInfo(index.events);

  let totalScore =
    premarketScore   * WEIGHTS.premarket +
    momentumScore    * WEIGHTS.momentum +
    topStockScore    * WEIGHTS.topStocks +
    fundamentalScore * WEIGHTS.fundamentals +
    sectorScore      * WEIGHTS.sector;

  totalScore = applyVixModifier(totalScore, index.vixChangePct ?? null);
  totalScore = clamp(totalScore, -2, 2);

  const bias       = classifyBias(totalScore);
  const confidence = freeze.frozen
    ? Math.min(48, confidenceFromScore(totalScore))
    : confidenceFromScore(totalScore);
  const scenario   = scenarioFrom(totalScore, momentumRaw, fundamentalScore, freeze);
  const plan       = buildTradePlan(bias, scenario, momentumRaw, index.events, freeze);

  return {
    ...index,
    weightedPremarket, momentumRaw,
    premarketScore, momentumScore, topStockScore, fundamentalScore, sectorScore,
    totalScore, bias, confidence, scenario, plan, freeze
  };
}

window.IndexBiasEngine = {
  WEIGHTS, calculateIndexBias, calculateWeightedPremarket,
  calculateMomentum, calculateFundamentalScore, calculateSectorScore
};
