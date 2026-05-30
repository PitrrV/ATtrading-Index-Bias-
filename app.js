// ─── Demo data (fallback když není API key nebo selže fetch) ───────────────────
// POZOR: premarketAt14 = hodnota k 14:00 CZ (08:00 ET) — baseline pro momentum
// Weights jsou orientační (NQ100/SPX/DJI se rebalancují čtvrtletně)
const demoData = {
  lastUpdate: new Date().toLocaleTimeString('cs-CZ'),
  indices: [
    {
      id: 'US100', name: 'NASDAQ-100',
      futuresSymbol: 'NQ=F',
      prevClose: 21200.00, premarketPrice: 21350.00,
      atr5d: 285, prevSession: { high: 21480, low: 21060, close: 21380, closePosition: 0.76 },
      vixChangePct: null,
      stocks: [
        { ticker:'MSFT',  name:'Microsoft',  weight:8.0, premarketAt14:0.0, premarketNow:0.6,  sector:'TECH'     },
        { ticker:'AAPL',  name:'Apple',      weight:7.5, premarketAt14:0.0, premarketNow:0.4,  sector:'TECH'     },
        { ticker:'NVDA',  name:'NVIDIA',     weight:7.0, premarketAt14:0.0, premarketNow:1.4,  sector:'SEMIS'    },
        { ticker:'AMZN',  name:'Amazon',     weight:5.2, premarketAt14:0.0, premarketNow:-0.2, sector:'CONSUMER' },
        { ticker:'META',  name:'Meta',       weight:4.5, premarketAt14:0.0, premarketNow:0.9,  sector:'TECH'     },
        { ticker:'AVGO',  name:'Broadcom',   weight:4.0, premarketAt14:0.0, premarketNow:1.1,  sector:'SEMIS'    },
        { ticker:'TSLA',  name:'Tesla',      weight:3.5, premarketAt14:0.0, premarketNow:-0.8, sector:'CONSUMER' },
        { ticker:'GOOGL', name:'Alphabet A', weight:3.1, premarketAt14:0.0, premarketNow:0.3,  sector:'TECH'     },
        { ticker:'COST',  name:'Costco',     weight:2.7, premarketAt14:0.0, premarketNow:0.1,  sector:'CONSUMER' },
        { ticker:'NFLX',  name:'Netflix',    weight:2.3, premarketAt14:0.0, premarketNow:0.5,  sector:'TECH'     },
        { ticker:'AMD',   name:'AMD',        weight:2.0, premarketAt14:0.0, premarketNow:0.7,  sector:'SEMIS'    },
        { ticker:'ADBE',  name:'Adobe',      weight:1.8, premarketAt14:0.0, premarketNow:0.2,  sector:'TECH'     }
      ],
      sectors: [
        { name:'TECH', change:0.0 }, { name:'SEMIS', change:0.0 }, { name:'CONSUMER', change:0.0 }
      ],
      events: [],
      flow: [0,0,0,0,0,0,0,0,0,0]
    },
    {
      id: 'US500', name: 'S&P 500',
      futuresSymbol: 'ES=F',
      prevClose: 5800.00, premarketPrice: 5828.00,
      atr5d: 72, prevSession: { high: 5840, low: 5762, close: 5820, closePosition: 0.74 },
      vixChangePct: null,
      stocks: [
        { ticker:'MSFT',  name:'Microsoft',  weight:6.5, premarketAt14:0.0, premarketNow:0.6,  sector:'TECH'     },
        { ticker:'AAPL',  name:'Apple',      weight:6.0, premarketAt14:0.0, premarketNow:0.4,  sector:'TECH'     },
        { ticker:'NVDA',  name:'NVIDIA',     weight:5.5, premarketAt14:0.0, premarketNow:1.4,  sector:'SEMIS'    },
        { ticker:'AMZN',  name:'Amazon',     weight:3.8, premarketAt14:0.0, premarketNow:-0.2, sector:'CONSUMER' },
        { ticker:'META',  name:'Meta',       weight:2.6, premarketAt14:0.0, premarketNow:0.9,  sector:'TECH'     },
        { ticker:'GOOGL', name:'Alphabet A', weight:2.1, premarketAt14:0.0, premarketNow:0.3,  sector:'TECH'     },
        { ticker:'LLY',   name:'Eli Lilly',  weight:1.6, premarketAt14:0.0, premarketNow:0.1,  sector:'HEALTH'   },
        { ticker:'JPM',   name:'JPMorgan',   weight:1.5, premarketAt14:0.0, premarketNow:0.2,  sector:'FIN'      },
        { ticker:'AVGO',  name:'Broadcom',   weight:1.4, premarketAt14:0.0, premarketNow:1.1,  sector:'SEMIS'    },
        { ticker:'TSLA',  name:'Tesla',      weight:1.3, premarketAt14:0.0, premarketNow:-0.8, sector:'CONSUMER' },
        { ticker:'V',     name:'Visa',       weight:1.2, premarketAt14:0.0, premarketNow:0.1,  sector:'FIN'      },
        { ticker:'XOM',   name:'ExxonMobil', weight:1.1, premarketAt14:0.0, premarketNow:-0.1, sector:'ENERGY'   }
      ],
      sectors: [
        { name:'TECH', change:0.0 }, { name:'SEMIS', change:0.0 }, { name:'FIN', change:0.0 }
      ],
      events: [],
      flow: [0,0,0,0,0,0,0,0,0,0]
    },
    {
      id: 'US30', name: 'Dow Jones',
      futuresSymbol: 'YM=F',
      prevClose: 41500.00, premarketPrice: 41580.00,
      atr5d: 430, prevSession: { high: 41720, low: 41280, close: 41650, closePosition: 0.83 },
      vixChangePct: null,
      stocks: [
        { ticker:'UNH',  name:'UnitedHealth', weight:8.8, premarketAt14:0.0, premarketNow:-0.3, sector:'HEALTH'   },
        { ticker:'GS',   name:'Goldman Sachs',weight:7.8, premarketAt14:0.0, premarketNow:0.4,  sector:'FIN'      },
        { ticker:'MSFT', name:'Microsoft',    weight:7.5, premarketAt14:0.0, premarketNow:0.6,  sector:'TECH'     },
        { ticker:'HD',   name:'Home Depot',   weight:5.6, premarketAt14:0.0, premarketNow:-0.1, sector:'CONSUMER' },
        { ticker:'CAT',  name:'Caterpillar',  weight:5.4, premarketAt14:0.0, premarketNow:0.0,  sector:'INDUSTRIAL'},
        { ticker:'AMGN', name:'Amgen',        weight:5.1, premarketAt14:0.0, premarketNow:0.1,  sector:'HEALTH'   },
        { ticker:'MCD',  name:'McDonald\'s',  weight:4.8, premarketAt14:0.0, premarketNow:0.0,  sector:'CONSUMER' },
        { ticker:'V',    name:'Visa',         weight:4.4, premarketAt14:0.0, premarketNow:0.1,  sector:'FIN'      },
        { ticker:'AXP',  name:'AmericanExpress',weight:4.2,premarketAt14:0.0,premarketNow:0.2, sector:'FIN'      },
        { ticker:'JPM',  name:'JPMorgan',     weight:3.8, premarketAt14:0.0, premarketNow:0.2,  sector:'FIN'      }
      ],
      sectors: [
        { name:'TECH', change:0.0 }, { name:'FIN', change:0.0 }, { name:'HEALTH', change:0.0 }
      ],
      events: [],
      flow: [0,0,0,0,0,0,0,0,0,0]
    }
  ]
};

// ─── Konstanty ────────────────────────────────────────────────────────────────
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// Futures symboly pro Yahoo Finance (přímé ceny indexů, bez ETF proxy)
const FUTURES_MAP = { 'NQ=F':'US100', 'ES=F':'US500', 'YM=F':'US30' };

// Top stocks pro volume fetch (Yahoo Finance 1m candles)
// Maximálně 9 unique symbolů napříč všemi indexy = 9 extra requestů
const VOLUME_SYMBOLS = ['NVDA','MSFT','AAPL','META','AMZN','UNH','GS','HD','CAT'];
// Normalizační konstanta: premarket je typicky ~10% průměrného denního objemu
const PREMARKET_VOL_FRACTION = 0.10;

// Sector ETF → sector name mapping
const SECTOR_ETF_MAP = {
  XLK: 'TECH', SOXX: 'SEMIS', XLF: 'FIN', XLV: 'HEALTH', XLC: 'COMM'
};

// VIX proxy
const VIX_PROXY = 'UVXY';

// Všechny stock tickery pro Finnhub fetch
const STOCK_SYMBOLS = [...new Set(demoData.indices.flatMap(i => i.stocks.map(s => s.ticker)))];
const SECTOR_SYMBOLS = Object.keys(SECTOR_ETF_MAP);
const ALL_FINNHUB_SYMBOLS = [...STOCK_SYMBOLS, ...SECTOR_SYMBOLS, VIX_PROXY];

// ─── Storage ──────────────────────────────────────────────────────────────────
const storage = {
  get key()       { return localStorage.getItem('FINNHUB_API_KEY') || ''; },
  set key(v)      { v ? localStorage.setItem('FINNHUB_API_KEY', v.trim()) : localStorage.removeItem('FINNHUB_API_KEY'); },
  get baselines() { try { return JSON.parse(localStorage.getItem('PREMARKET_BASELINES_14CZ') || '{}'); } catch { return {}; } },
  set baselines(v){ localStorage.setItem('PREMARKET_BASELINES_14CZ', JSON.stringify(v)); },
  get history()   { try { return JSON.parse(localStorage.getItem('AT_TRADING_HISTORY_V10') || '{}'); } catch { return {}; } },
  set history(v)  { localStorage.setItem('AT_TRADING_HISTORY_V10', JSON.stringify(v)); }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().slice(0,10); }

function czHour()  {
  return Number(new Intl.DateTimeFormat('cs-CZ', { timeZone:'Europe/Prague', hour:'2-digit', hour12:false }).format(new Date()));
}
function czMinute() {
  return Number(new Intl.DateTimeFormat('cs-CZ', { timeZone:'Europe/Prague', minute:'2-digit' }).format(new Date()));
}

// Konverze ET → CZ (rozdíl vždy 6 hodin)
function etTimeToCZ(finnhubTime) {
  if (!finnhubTime) return '?:??';
  const match = finnhubTime.match(/(\d{2}):(\d{2})/);
  if (!match) return '?:??';
  const czH = (parseInt(match[1]) + 6) % 24;
  return `${String(czH).padStart(2,'0')}:${match[2]}`;
}
function parseTimeET(finnhubTime) {
  if (!finnhubTime) return null;
  const m = finnhubTime.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}

function todayNYDate() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const o = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${o.year}-${o.month}-${o.day}`;
}

const signed = n => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const fmt    = n => n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });

// ─── UI status ────────────────────────────────────────────────────────────────
function setApiStatus(html, ok=true) {
  const el = document.getElementById('apiStatus');
  if (el) el.innerHTML = `<span class="${ok ? 'live-dot' : 'err-dot'}">●</span> ${html}`;
  const label = document.getElementById('dataModeLabel');
  if (label) label.textContent = storage.key ? 'LIVE API' : 'DEMO';
  const badge = document.getElementById('dataModeBadge');
  if (badge) {
    badge.textContent = storage.key ? '● LIVE' : '⚠ DEMO';
    badge.className = `data-mode-badge ${storage.key ? 'live' : 'demo'}`;
  }
}

// ─── Normalizace událostí z Finnhub ───────────────────────────────────────────
function normalizeEventDirection(e) {
  const name     = String(e.event || '').toLowerCase();
  const actual   = Number(e.actual);
  const estimate = Number(e.estimate ?? e.forecast ?? e.consensus);
  if (!Number.isFinite(actual) || !Number.isFinite(estimate)) return 0;
  const higherBad  = ['cpi','inflation','pce','ppi','rate','yield','wage','jobless','unemployment','claims'];
  const higherGood = ['payroll','employment','gdp','retail sales','confidence','pmi','ism','housing'];
  if (higherBad.some(x  => name.includes(x))) return actual > estimate ? -1 : actual < estimate ? 1 : 0;
  if (higherGood.some(x => name.includes(x))) return actual > estimate ?  1 : actual < estimate ? -1 : 0;
  return 0;
}

function normalizeEventImpact(e) {
  const raw  = String(e.impact || e.importance || '').toUpperCase();
  const name = String(e.event || '').toLowerCase();
  if (raw.includes('HIGH') || ['fomc','interest rate','cpi','pce','nonfarm','nfp','payroll','fed decision'].some(x => name.includes(x))) return 'HIGH';
  if (raw.includes('LOW')) return 'LOW';
  return 'MEDIUM';
}

// ─── Fetch: Yahoo Finance Futures ────────────────────────────────────────────
// NQ=F, ES=F, YM=F — přímé futures ceny (ne ETF proxy)
async function fetchYahooFutures() {
  const symbols = Object.keys(FUTURES_MAP);
  const results = [];
  for (const sym of symbols) {
    const encoded = sym.replace('=', '%3D'); // NQ%3DF
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1m&range=1d`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`Yahoo Finance ${r.status} pro ${sym}`);
    const d = await r.json();
    const meta = d.chart?.result?.[0]?.meta;
    if (!meta) throw new Error(`Prázdná data z Yahoo Finance pro ${sym}`);
    const price     = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || meta.regularMarketPreviousClose;
    results.push({
      symbol: sym,
      indexId: FUTURES_MAP[sym],
      price,
      prevClose,
      changePct: ((price - prevClose) / prevClose) * 100
    });
  }
  return results;
}

// ─── Fetch: Yahoo Finance Historical Candles (pro ATR + prevSession) ──────────
async function fetchYahooHistory(symbol) {
  const encoded = symbol.replace('=', '%3D');
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1mo`;
  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`Yahoo history ${r.status} pro ${symbol}`);
  const d = await r.json();
  const result = d.chart?.result?.[0];
  if (!result) throw new Error(`Prázdná history data pro ${symbol}`);
  const q  = result.indicators?.quote?.[0];
  const ts = result.timestamp || [];
  return ts.map((t, i) => ({
    date:   new Date(t * 1000),
    open:   q.open?.[i],  high:   q.high?.[i],
    low:    q.low?.[i],   close:  q.close?.[i],
    volume: q.volume?.[i]
  })).filter(c => c.close != null && c.high != null && c.low != null);
}

// Výpočet ATR (Average True Range) z denních svíček
function calcATR(candles, period = 5) {
  if (candles.length < 2) return null;
  const trs = [];
  for (let i = 1; i < candles.length; i++) {
    const { high: h, low: l } = candles[i];
    const pc = candles[i - 1].close;
    if (h == null || l == null || pc == null) continue;
    trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  if (!trs.length) return null;
  const recent = trs.slice(-period);
  return recent.reduce((s, v) => s + v, 0) / recent.length;
}

// Previous session context — kde jsme zavřeli v včerejším range
function getPrevSession(candles) {
  // Vezmeme předposlední svíčku (yesterday — last fully completed session)
  if (candles.length < 2) return null;
  const prev = candles[candles.length - 2];
  if (!prev.high || !prev.low || !prev.close) return null;
  const range = prev.high - prev.low;
  const closePosition = range > 0 ? (prev.close - prev.low) / range : 0.5;
  return { high: prev.high, low: prev.low, close: prev.close, closePosition };
}

// ─── Fetch: Premarket Volume (Yahoo Finance 1m svíčky) ──────────────────────
async function fetchPremarketVolume(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
  const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) return null;
  const d = await r.json();
  const result = d.chart?.result?.[0];
  if (!result) return null;
  const ts = result.timestamp || [];
  const vol = result.indicators?.quote?.[0]?.volume || [];
  const etFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false
  });
  let premarketVol = 0;
  for (let i = 0; i < ts.length; i++) {
    const parts = etFmt.formatToParts(new Date(ts[i] * 1000));
    const etH = parseInt(parts.find(p => p.type === 'hour').value);
    const etM = parseInt(parts.find(p => p.type === 'minute').value);
    const etMin = etH * 60 + etM;
    if (etMin >= 240 && etMin < 570) { // 04:00–09:30 ET
      premarketVol += vol[i] || 0;
    }
  }
  return premarketVol > 0 ? premarketVol : null;
}

// Průměrný denní volume z historických svíček
function calcAvgDailyVolume(candles, period = 20) {
  const recent = candles.slice(-period);
  const vols = recent.map(c => c.volume).filter(v => v != null && v > 0);
  if (!vols.length) return null;
  return vols.reduce((s, v) => s + v, 0) / vols.length;
}

// ─── Fetch: Finnhub Quote ──────────────────────────────────────────────────────
async function fetchFinnhubQuote(symbol, token) {
  const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Finnhub ${r.status} pro ${symbol}`);
  const d = await r.json();
  if (!d || !d.c || !d.pc) throw new Error(`Prázdná quote data pro ${symbol}`);
  return { symbol, current: d.c, prevClose: d.pc, changePct: ((d.c - d.pc) / d.pc) * 100 };
}

// ─── Fetch: Finnhub Ekonomický kalendář ──────────────────────────────────────
// Filtr: POUZE eventy co reálně hýbou US100/US500/US30
// HIGH: CPI, PCE, NFP, FOMC, GDP, Retail Sales, ISM PMI, PPI, Powell
// MEDIUM (whitelist): Jobless Claims, Michigan Sentiment, ADP
const HIGH_IMPACT_KEYWORDS = [
  'cpi','core cpi','pce','core pce','personal consumption',
  'nonfarm','non-farm','nfp','payroll',
  'unemployment rate',
  'fomc','federal funds rate','interest rate decision','fed decision',
  'powell','fed chair',
  'gdp','gross domestic',
  'retail sales',
  'ism manufacturing','ism services','ism non-manufacturing',
  'ppi','producer price'
];
const MEDIUM_WHITELIST = [
  'jobless claims','initial claims','continuing claims',
  'michigan','consumer sentiment','umich',
  'adp employment','adp nonfarm'
];

async function fetchFinnhubCalendar(token) {
  try {
    const today = todayNYDate();
    const url = `${FINNHUB_BASE}/calendar/economic?from=${today}&to=${today}&token=${encodeURIComponent(token)}`;
    const r = await fetch(url);
    if (!r.ok) return [];
    const d = await r.json();
    const raw = d.economicCalendar || d.data || [];
    return raw
      .filter(e => e.country === 'US' && e.event)
      .map(e => {
        const name   = String(e.event || '').toLowerCase();
        const impact = normalizeEventImpact(e);
        const isHigh = impact === 'HIGH' || HIGH_IMPACT_KEYWORDS.some(k => name.includes(k));
        const isMedOK = impact === 'MEDIUM' && MEDIUM_WHITELIST.some(k => name.includes(k));
        if (!isHigh && !isMedOK) return null;
        return {
          timeET:    parseTimeET(e.time),
          timeCZ:    etTimeToCZ(e.time),
          name:      e.event,
          expected:  e.estimate ?? '—',
          previous:  e.prev ?? '—',
          actual:    (e.actual !== '' && e.actual !== null && e.actual !== undefined) ? e.actual : null,
          impact:    isHigh ? 'HIGH' : 'MEDIUM',
          direction: normalizeEventDirection(e)
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.timeET || '').localeCompare(b.timeET || ''));
  } catch {
    return [];
  }
}

// ─── Aplikace živých dat do modelu ────────────────────────────────────────────
function applyLiveData(futures, quotes, calendar, historyMap = {}) {
  const q      = Object.fromEntries(quotes.map(x => [x.symbol, x]));
  const baseAll = storage.baselines[todayKey()] || {};
  const isAfter14 = czHour() >= 14;

  // VIX proxy — UVXY changePct
  const uvxy = q[VIX_PROXY];
  const vixChangePct = uvxy ? uvxy.changePct : null;

  demoData.indices.forEach(index => {
    // 1. Cena indexu z futures (přesná, žádný multiplikátor)
    const fut = futures.find(f => f.indexId === index.id);
    if (fut) {
      index.prevClose      = fut.prevClose;
      index.premarketPrice = fut.price;
      index.futuresChangePct = fut.changePct;
      index.dataSource     = 'LIVE_FUTURES';
    }
    // ATR, Previous Session a Volume z Yahoo history
    const hist = historyMap[index.id];
    if (hist?.atr5d)       index.atr5d       = Math.round(hist.atr5d * 10) / 10;
    if (hist?.prevSession) index.prevSession  = hist.prevSession;

    // Volume ratio: průměr top 5 akcií indexu
    const volumeMap = historyMap._volumeMap || {};
    const top5 = [...index.stocks].sort((a, b) => b.weight - a.weight).slice(0, 5);
    const stockVolRatios = [];
    top5.forEach(s => {
      const pmVol    = volumeMap[s.ticker];
      const avgVol   = hist?.avgDailyVol;
      if (pmVol && avgVol && avgVol > 0) {
        const ratio = pmVol / (avgVol * PREMARKET_VOL_FRACTION);
        s.volumeRatio = Math.round(ratio * 100) / 100;
        stockVolRatios.push(ratio);
      } else {
        s.volumeRatio = null;
      }
    });
    // Zbytek akcií nemá volume data
    index.stocks.forEach(s => {
      if (!top5.find(t => t.ticker === s.ticker)) s.volumeRatio = null;
    });
    index.volumeRatio = stockVolRatios.length
      ? Math.round((stockVolRatios.reduce((a, b) => a + b, 0) / stockVolRatios.length) * 100) / 100
      : null;

    // 2. VIX kontext
    index.vixChangePct = vixChangePct;

    // 3. Stocks — premarketNow + baseline
    index.stocks.forEach(s => {
      const quote = q[s.ticker];
      if (!quote) return;
      const now = Math.round(quote.changePct * 100) / 100;

      // Automaticky nastav baseline při prvním refreshi po 14:00 pokud ještě není
      if (baseAll[s.ticker] === undefined && isAfter14) {
        const b = storage.baselines;
        b[todayKey()] = b[todayKey()] || {};
        b[todayKey()][s.ticker] = now;
        storage.baselines = b;
        baseAll[s.ticker] = now;
      }

      s.premarketAt14 = baseAll[s.ticker] ?? 0;
      s.premarketNow  = now;
    });

    // 4. Sector ETF data
    index.sectors.forEach(sec => {
      const etfTicker = Object.entries(SECTOR_ETF_MAP).find(([, name]) => name === sec.name)?.[0];
      if (etfTicker && q[etfTicker]) {
        sec.change = Math.round(q[etfTicker].changePct * 100) / 100;
      }
    });

    // 5. Ekonomický kalendář — sdílené eventy pro všechny indexy
    index.events = calendar;

    // 6. Flow array update
    const flowNow = index.stocks.reduce((sum,s) => sum + (s.weight/100)*s.premarketNow, 0);
    index.flow.push(Math.round(flowNow*100)/100);
    if (index.flow.length > 30) index.flow.shift();
  });
}

// ─── Baseline manuální uložení ────────────────────────────────────────────────
function saveBaselineFromCurrent() {
  const key = todayKey();
  const b = storage.baselines;
  b[key] = {};
  demoData.indices.forEach(index =>
    index.stocks.forEach(s => { b[key][s.ticker] = s.premarketNow; })
  );
  storage.baselines = b;
  setApiStatus('Baseline 14:00 uložená. Momentum se měří od tohoto bodu.', true);
}

// ─── Demo refresh (bez API) ───────────────────────────────────────────────────
function simulateDemoRefresh() {
  // Simuluje korelované pohyby — tech táhne ostatní
  const techMove = (Math.random() - 0.48) * 0.3;
  demoData.indices.forEach(index => {
    index.stocks.forEach(s => {
      const sectorBias = s.sector === 'TECH' || s.sector === 'SEMIS' ? techMove : techMove * 0.4;
      s.premarketNow = Math.round((s.premarketNow + sectorBias + (Math.random()-0.5)*0.15) * 100) / 100;
    });
    // Sector ETFs update
    index.sectors.forEach(sec => {
      const base = sec.name === 'TECH' || sec.name === 'SEMIS' ? techMove * 2 : techMove * 0.6;
      sec.change = Math.round((sec.change + base + (Math.random()-0.5)*0.1)*100)/100;
    });
    const flowNow = index.stocks.reduce((sum,s) => sum + (s.weight/100)*s.premarketNow, 0);
    index.flow.push(Math.round(flowNow*100)/100);
    if (index.flow.length > 30) index.flow.shift();
  });
}

// ─── Hlavní refresh ───────────────────────────────────────────────────────────
async function refreshLiveData() {
  const token = storage.key;
  if (!token) {
    simulateDemoRefresh();
    setApiStatus('Demo mode — vlož Finnhub API key pro live data.', false);
    return { source: 'DEMO' };
  }

  setApiStatus('Načítám futures z Yahoo Finance…', true);

  // 1. Futures + History (Yahoo Finance) — s fallback na demo ceny
  let futures = [];
  let futuresSource = 'YAHOO';
  const historyMap = {}; // indexId → { atr5d, prevSession }
  try {
    futures = await fetchYahooFutures();
    // Stáhni historii pro ATR a prevSession (paralelně)
    const histResults = await Promise.allSettled(
      Object.keys(FUTURES_MAP).map(async sym => {
        const candles    = await fetchYahooHistory(sym);
        const atr5d      = calcATR(candles, 5);
        const prev       = getPrevSession(candles);
        const avgDailyVol = calcAvgDailyVolume(candles, 20);
        return { indexId: FUTURES_MAP[sym], atr5d, prevSession: prev, avgDailyVol };
      })
    );
    histResults.forEach(r => {
      if (r.status === 'fulfilled' && r.value) {
        historyMap[r.value.indexId] = {
          atr5d: r.value.atr5d,
          prevSession: r.value.prevSession,
          avgDailyVol: r.value.avgDailyVol
        };
      }
    });

    // Stáhni premarket volume pro top stocks (paralelně, max 9 symbolů)
    setApiStatus('Načítám premarket volume...', true);
    const volResults = await Promise.allSettled(
      VOLUME_SYMBOLS.map(async sym => {
        const pmVol = await fetchPremarketVolume(sym);
        return { symbol: sym, pmVol };
      })
    );
    const volumeMap = {};
    volResults.forEach(r => {
      if (r.status === 'fulfilled' && r.value?.pmVol) {
        volumeMap[r.value.symbol] = r.value.pmVol;
      }
    });
    historyMap._volumeMap = volumeMap;
  } catch(e) {
    console.warn('Yahoo Finance nedostupné:', e.message);
    futuresSource = 'FALLBACK';
    futures = demoData.indices.map(i => ({
      symbol: i.futuresSymbol, indexId: i.id,
      price: i.premarketPrice, prevClose: i.prevClose,
      changePct: ((i.premarketPrice - i.prevClose) / i.prevClose) * 100
    }));
  }

  // 2. Stocks + Sector ETFs + VIX proxy (Finnhub)
  setApiStatus('Načítám stock quotes z Finnhub…', true);
  const quotes = [];
  for (const symbol of ALL_FINNHUB_SYMBOLS) {
    try { quotes.push(await fetchFinnhubQuote(symbol, token)); }
    catch(e) { console.warn(e.message); }
  }

  // 3. Ekonomický kalendář (Finnhub)
  setApiStatus('Načítám ekonomický kalendář…', true);
  const calendar = await fetchFinnhubCalendar(token);

  if (!quotes.length) throw new Error('Nepodařilo se načíst žádné quotes. Zkontroluj API key.');

  applyLiveData(futures, quotes, calendar, historyMap);

  const releasedCount = calendar.filter(e => e.actual !== null).length;
  const upcomingHigh  = calendar.filter(e => e.impact === 'HIGH' && e.actual === null).length;
  setApiStatus(
    `Live: ${quotes.length}/${ALL_FINNHUB_SYMBOLS.length} quotes | Futures: ${futuresSource} | ` +
    `Kalendář: ${calendar.length} eventů (${releasedCount} vydaných, ${upcomingHigh} HIGH čeká)`,
    true
  );
  return { source: 'LIVE', futuresSource, quotesLoaded: quotes.length, calendarEvents: calendar.length };
}

// ─── Historie ─────────────────────────────────────────────────────────────────
function recordHistorySnapshot(reason='refresh') {
  const h = storage.history;
  const date = todayKey();
  h[date] = h[date] || [];
  const snap = {
    t: new Date().toISOString(),
    localTime: new Date().toLocaleTimeString('cs-CZ'),
    reason,
    indices: demoData.indices.map(i => ({
      id: i.id,
      price: i.premarketPrice,
      flow: i.flow[i.flow.length-1],
      stocks: i.stocks.map(s => ({ ticker:s.ticker, weight:s.weight, now:s.premarketNow, at14:s.premarketAt14 }))
    }))
  };
  const last = h[date][h[date].length-1];
  if (!last || (new Date(snap.t) - new Date(last.t)) > 45000 || reason === 'baseline') {
    h[date].push(snap);
  }
  if (h[date].length > 240) h[date] = h[date].slice(-240);
  const dates = Object.keys(h).sort();
  while (dates.length > 90) { delete h[dates.shift()]; }
  storage.history = h;
}

function getHistorySeries(indexId, days=1) {
  const h = storage.history;
  const dates = Object.keys(h).sort().slice(-days);
  const out = [];
  dates.forEach(d => (h[d]||[]).forEach(snap => {
    const x = snap.indices.find(i => i.id === indexId);
    if (x) out.push({ date:d, t:snap.localTime, iso:snap.t, value:x.flow });
  }));
  return out;
}

// ─── State ────────────────────────────────────────────────────────────────────
let results  = demoData.indices.map(i => window.IndexBiasEngine.calculateIndexBias(i));
let selected = results[0];
// Expose globally for tab navigation
window._results  = results;
window._selected = selected;

// ─── Render helpers ───────────────────────────────────────────────────────────
const modeClass = bias => bias.includes('LONG') ? 'bull' : bias.includes('SHORT') ? 'bear' : 'neutral';

function chartColor(id) {
  return id === 'US100' ? '#80ff38' : id === 'US500' ? '#35a7ff' : '#ffc42e';
}

function sparkSvg(data, cls='bull') {
  const min=Math.min(-1,...data), max=Math.max(1,...data);
  const w=320,h=70,p=8;
  const pts = data.map((v,i)=>{
    const x=p+i*((w-p*2)/(Math.max(1,data.length-1)));
    const y=h-p-((v-min)/(max-min))*(h-p*2);
    return `${x},${y}`;
  }).join(' ');
  const c = cls==='bear'?'#ff4343':cls==='neutral'?'#ffc42e':'#80ff38';
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${pts}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="0" y1="${h/2}" x2="${w}" y2="${h/2}" stroke="#26384f" stroke-dasharray="5 6"/>
  </svg>`;
}

function makeLinePoints(data,min,max,width,height,pad) {
  return data.map((v,i)=>{
    const x=pad+i*((width-pad*2)/(Math.max(1,data.length-1)));
    const y=height-pad-((v-min)/(max-min))*(height-pad*2);
    return `${x},${y}`;
  }).join(' ');
}

// ─── Fundamental Freeze Banner ────────────────────────────────────────────────
function renderFreezeBanner() {
  const el = document.getElementById('freezeBanner');
  if (!el) return;
  const freeze = selected.freeze;
  const released = (selected.events||[]).filter(e => e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual)));

  if (freeze?.frozen) {
    el.innerHTML = `<div class="freeze-alert warn">⏳ <b>${freeze.event.name}</b> za <b>${freeze.minutesLeft} min</b> (${freeze.event.timeCZ} CZ) — Bias zmražen, počkej na výsledek.</div>`;
    el.style.display = 'block';
  } else if (released.length > 0) {
    const last = released[released.length-1];
    const dir  = last.direction > 0 ? '✅ BULLISH BEAT' : last.direction < 0 ? '🔴 BEARISH MISS' : '➡️ IN-LINE';
    el.innerHTML = `<div class="freeze-alert released">📊 <b>${last.name}</b> vydáno: <b>${last.actual}</b> vs exp <b>${last.expected}</b> — ${dir} | Bias přepočítán.</div>`;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

// ─── Render: Primary Decision ────────────────────────────────────────────────
function renderPrimary() {
  const cls = modeClass(selected.bias);
  const deltaRead = selected.momentumRaw < -0.15 ? 'SLÁBNE / FADE' : selected.momentumRaw > 0.15 ? 'POSILUJE' : 'STABILNÍ';
  const priceLabel = selected.dataSource === 'LIVE_FUTURES'
    ? `<span class="mini-note">${selected.futuresSymbol} futures (přesná cena)</span>`
    : `<span class="mini-note">demo cena</span>`;
  document.getElementById('primaryDecision').innerHTML = `
    <article class="decision-card">
      <div class="label">Primary decision</div>
      <div class="big-signal ${cls}">${selected.id}: ${selected.bias}</div>
      <div class="mini">Cena: <b>${fmt(selected.premarketPrice)}</b><br>${priceLabel}</div>
    </article>
    <article class="decision-card">
      <div class="label">Confidence</div>
      <div class="metric ${cls}">${selected.confidence}%</div>
      <div class="mini">Score: ${selected.totalScore.toFixed(2)} / rozsah -2 až +2${selected.freeze?.frozen ? '<br><b class="neutral">⏳ Zmražen před eventem</b>' : ''}</div>
    </article>
    <article class="decision-card">
      <div class="label">Momentum od 14:00 CZ</div>
      <div class="metric ${selected.momentumRaw >= 0 ? 'bull' : 'bear'}">${signed(selected.momentumRaw)}</div>
      <div class="mini">${deltaRead}</div>
    </article>
    <article class="decision-card">
      <div class="label">Scénář</div>
      <div class="metric ${selected.scenario.mode === 'bull' ? 'bull' : selected.scenario.mode === 'bear' ? 'bear' : 'neutral'}" style="font-size:17px;line-height:1.3">${selected.scenario.name}</div>
      <div class="mini">Pravděpodobnost: ${selected.scenario.probability}%</div>
    </article>`;
}

// ─── Render: Index Cards ──────────────────────────────────────────────────────
function renderIndexCards() {
  document.getElementById('indexGrid').innerHTML = results.map(r => {
    const cls = modeClass(r.bias);
    const change = ((r.premarketPrice - r.prevClose) / r.prevClose) * 100;
    const vixNote = r.vixChangePct !== null
      ? `<div class="stat"><span>VIX proxy</span><b class="${r.vixChangePct > 5 ? 'bear' : r.vixChangePct < -5 ? 'bull' : 'neutral'}">${signed(r.vixChangePct)}</b></div>`
      : '';
    return `<article class="index-card" data-id="${r.id}">
      <div class="index-head"><h3>${r.id} <span class="mini">/ ${r.name}</span></h3><span class="bias-pill ${cls}">${r.bias}</span></div>
      <div class="gauge"><span class="${cls}" style="width:${r.confidence}%"></span></div>
      <div class="sparkline">${sparkSvg(r.flow, cls)}</div>
      <div class="index-stats">
        <div class="stat"><span>Cena (futures)</span><b>${fmt(r.premarketPrice)}</b></div>
        <div class="stat"><span>Change</span><b class="${change >= 0 ? 'bull' : 'bear'}">${signed(change)}</b></div>
        <div class="stat"><span>Confidence</span><b class="${cls}">${r.confidence}%</b></div>
        <div class="stat"><span>Momentum</span><b class="${r.momentumRaw>=0?'bull':'bear'}">${signed(r.momentumRaw)}</b></div>
        ${vixNote}
      </div>
    </article>`;
  }).join('');
  document.querySelectorAll('.index-card').forEach(card =>
    card.addEventListener('click', () => {
      selected = results.find(r => r.id === card.dataset.id);
      renderAll(false);
    })
  );
}

// ─── Render: Premarket Command ────────────────────────────────────────────────
function renderPremarketCommand() {
  const tabs = document.getElementById('chartTabs');
  if (tabs) {
    tabs.innerHTML = results.map(r =>
      `<button class="chart-tab ${r.id===selected.id?'active':''}" data-id="${r.id}">${r.id} ${signed(r.momentumRaw)}</button>`
    ).join('');
    tabs.querySelectorAll('.chart-tab').forEach(b =>
      b.addEventListener('click', () => { selected = results.find(r=>r.id===b.dataset.id)||selected; renderAll(false); })
    );
  }
  const all=results.flatMap(r=>r.flow);
  const min=Math.min(-1,...all), max=Math.max(1,...all);
  const w=980,h=310,p=40;
  const zeroY=h-p-((0-min)/(max-min))*(h-p*2);
  const lines=results.map(r =>
    `<polyline points="${makeLinePoints(r.flow,min,max,w,h,p)}" fill="none" stroke="${chartColor(r.id)}" stroke-width="${r.id===selected.id?6:3}" stroke-linecap="round" stroke-linejoin="round" opacity="${r.id===selected.id?1:.55}"/>`
  ).join('');
  const last = (() => { const pts=selected.flow; return { v:pts[pts.length-1], x:p+(pts.length-1)*((w-p*2)/(Math.max(1,pts.length-1))), y:h-p-((pts[pts.length-1]-min)/(max-min))*(h-p*2) }; })();
  document.getElementById('multiFlowChart').innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs><linearGradient id="gf" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="${chartColor(selected.id)}" stop-opacity=".13"/><stop offset="100%" stop-color="${chartColor(selected.id)}" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#gf)"/>
    <line x1="${p}" y1="${zeroY}" x2="${w-p}" y2="${zeroY}" stroke="#344760" stroke-dasharray="7 8"/>
    ${[-1,0,1].map(v=>{const y=h-p-((v-min)/(max-min))*(h-p*2);return `<text x="8" y="${y+5}" fill="#8ea1bb" font-size="14">${v>0?'+':''}${v}%</text>`;}).join('')}
    ${lines}
    <circle cx="${last.x}" cy="${last.y}" r="8" fill="${chartColor(selected.id)}"/>
    <text x="${Math.max(55,last.x-130)}" y="${Math.max(30,last.y-16)}" fill="${chartColor(selected.id)}" font-size="22" font-weight="900">${selected.id} ${signed(last.v)}</text>
    <text x="${p}" y="28" fill="#8ea1bb" font-size="16">Baseline 14:00 CZ</text>
    <text x="${w-p-50}" y="28" fill="#8ea1bb" font-size="16">Now</text>
  </svg>
  <div class="chart-legend">${results.map(r=>`<span><i class="legend-dot" style="background:${chartColor(r.id)}"></i>${r.id}: <b>${signed(r.flow[r.flow.length-1])}</b></span>`).join('')}</div>`;
  document.getElementById('miniCharts').innerHTML = results.map(r => {
    const cls=modeClass(r.bias);
    const read=r.momentumRaw<-0.15?'FADE / slábne':r.momentumRaw>0.15?'STRENGTH / sílí':'CHOP / stabilní';
    return `<article class="mini-chart-card"><div class="mini-chart-top"><b>${r.id}</b><span class="${r.momentumRaw>=0?'bull':'bear'}">${signed(r.momentumRaw)}</span></div><div class="spark">${sparkSvg(r.flow,cls)}</div><div class="mini">${read} • ${r.bias} • ${r.confidence}%</div></article>`;
  }).join('');
}

// ─── Render: Breakdown ────────────────────────────────────────────────────────
function renderBreakdown() {
  const rows = [
    ['Premarket',     selected.premarketScore,    '28%', selected.premarketScore    * 0.28],
    ['Momentum',      selected.momentumScore,     '15%', selected.momentumScore     * 0.15],
    ['Top Stocks',    selected.topStockScore,     '10%', selected.topStockScore     * 0.10],
    ['Fundament',     selected.fundamentalScore,  '20%', selected.fundamentalScore  * 0.20],
    ['Gap/ATR',       selected.gapContextScore,   '15%', selected.gapContextScore   * 0.15],
    ['Prev Session',  selected.prevSessionScore,  '8%',  selected.prevSessionScore  * 0.08],
    ['Sector',        selected.sectorScore,       '4%',  selected.sectorScore       * 0.04]
  ];
  document.getElementById('breakdown').innerHTML =
    `<div class="break-row head"><span>Modul</span><span>Raw</span><span>Váha</span><span>Dopad</span></div>` +
    rows.map(([name,raw,weight,impact]) => {
      const cls=impact>0?'bull':impact<0?'bear':'neutral';
      const note = name === 'Gap/ATR' && raw < -0.5 ? '<small class="bear"> fade</small>' : name === 'Gap/ATR' && raw > 0 ? '<small class="bull"> cont.</small>' : '';
    return `<div class="break-row"><b>${name}${note}</b><span class="${cls}">${raw.toFixed(2)}</span><span>${weight}</span><b class="${cls}">${impact>0?'+':''}${impact.toFixed(2)}</b></div>`;
    }).join('');
}

// ─── Render: Flow Chart ───────────────────────────────────────────────────────
function renderFlowChart() {
  const data=selected.flow;
  const min=Math.min(-1,...data), max=Math.max(1,...data);
  const width=900,height=260,pad=28;
  const points=data.map((v,i)=>{
    const x=pad+i*((width-pad*2)/(data.length-1));
    const y=height-pad-((v-min)/(max-min))*(height-pad*2);
    return `${x},${y}`;
  }).join(' ');
  const zeroY=height-pad-((0-min)/(max-min))*(height-pad*2);
  const color=selected.momentumRaw>=0?'#24f36c':'#ff4343';
  document.getElementById('flowChart').innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <line x1="20" y1="${zeroY}" x2="880" y2="${zeroY}" stroke="#31445f" stroke-dasharray="6 6"/>
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="30" y="35" fill="#8ea1bb" font-size="16">14:00 CZ</text>
    <text x="790" y="35" fill="#8ea1bb" font-size="16">Now</text>
    <text x="760" y="70" fill="${color}" font-size="28" font-weight="800">${signed(selected.momentumRaw)}</text>
  </svg>`;
  const status=selected.momentumRaw<-0.15?'Fade / slábne':selected.momentumRaw>0.15?'Strength / posiluje':'Stabilní';
  const badge=document.getElementById('flowBadge');
  if(badge){ badge.textContent=status; badge.className=`pill ${selected.momentumRaw<-0.15?'warn':''}`; }
  document.getElementById('flowRead').innerHTML = `
    <div><span class="mini">Baseline 14:00</span><br><b>${signed(selected.flow[0])}</b></div>
    <div><span class="mini">Aktuální flow</span><br><b>${signed(selected.flow[selected.flow.length-1])}</b></div>
    <div><span class="mini">Read</span><br><b class="${selected.momentumRaw>=0?'bull':'bear'}">${status}</b></div>`;
}

// ─── Render: Stocks ───────────────────────────────────────────────────────────
function renderStocks() {
  const sorted=[...selected.stocks].sort((a,b)=>b.weight-a.weight);
  document.getElementById('stocksTable').innerHTML =
    `<div class="stock-row head"><span>Ticker</span><span>Váha</span><span>14:00</span><span>Now</span><span>Impact</span><span>Volume</span></div>` +
    sorted.map(s => {
      const impact=(s.weight/100)*s.premarketNow;
      const cls=impact>=0?'bull':'bear';
      const barWidth=Math.min(100,Math.abs(impact)/0.18*100);
      const fade=s.premarketNow-s.premarketAt14;
      const volLbl = window.IndexBiasEngine?.volumeConvictionLabel(s.volumeRatio);
      const volStr = s.volumeRatio != null
        ? `<span class="${volLbl.cls}">${s.volumeRatio.toFixed(1)}× ${volLbl.icon}</span>`
        : `<span class="muted">—</span>`;
      return `<div class="stock-row"><b>${s.ticker}</b><span>${s.weight}%</span><span>${signed(s.premarketAt14)}</span><span class="${s.premarketNow>=0?'bull':'bear'}">${signed(s.premarketNow)}</span><div><b class="${cls}">${impact>0?'+':''}${impact.toFixed(3)}</b><div class="impact-bar"><span style="width:${barWidth}%;background:${impact>=0?'var(--green)':'var(--red)'}"></span></div><small>${fade<-0.3?'📉 fade':fade>0.3?'📈 strength':'stable'}</small></div>${volStr}</div>`;
    }).join('');
}

// ─── Render: Trade Plan ───────────────────────────────────────────────────────
function renderTradePlan() {
  document.getElementById('tradePlan').innerHTML = `
    <div class="callout main"><b>Nejpravděpodobnější scénář:</b><br>${selected.scenario.name} <span class="${selected.scenario.mode==='bear'?'bear':selected.scenario.mode==='bull'?'bull':'neutral'}">${selected.scenario.probability}%</span></div>
    <div class="callout"><b>Plán:</b><br>${selected.plan.action}</div>
    <div class="callout warn"><b>Invalidace:</b><br>${selected.plan.invalidation}</div>
    <div class="callout danger"><b>Kontext:</b><br>${selected.plan.warning}</div>`;
}

// ─── Render: Fundamentals ─────────────────────────────────────────────────────
function renderFundamentals() {
  const events = selected.events || [];
  if (!events.length) {
    document.getElementById('fundamentalBox').innerHTML =
      `<div class="callout">Žádné US macro eventy z Finnhub kalendáře pro dnešek.<br><small>Pokud máš API key a data se nenačítají, kalendář neobsahuje pro dnešek eventy.</small></div>`;
    return;
  }
  document.getElementById('fundamentalBox').innerHTML = events.map(e => {
    const isReleased = e.actual !== null && e.actual !== undefined && Number.isFinite(Number(e.actual));
    const cls = isReleased ? (e.direction > 0 ? 'bull' : e.direction < 0 ? 'bear' : 'neutral') : 'neutral';
    const dir = isReleased
      ? (e.direction > 0 ? '✅ Bullish beat' : e.direction < 0 ? '🔴 Bearish miss' : '➡️ In-line')
      : (e.impact === 'HIGH' ? '⏳ Čeká se' : 'Pending');
    const actualStr = isReleased ? ` → <b class="${cls}">${e.actual}</b>` : '';
    return `<div class="event-row">
      <b>${e.timeCZ} CZ</b>
      <span class="${e.impact==='HIGH'?'bear':e.impact==='MEDIUM'?'neutral':'muted'}">${e.impact}</span>
      <span>${e.name}<br><small>Exp: ${e.expected} | Prev: ${e.previous}${actualStr}</small></span>
      <b class="${cls}">${dir}</b>
    </div>`;
  }).join('');
}

// ─── Render: Weekly Outlook ───────────────────────────────────────────────────
function renderWeekly() {
  const b=selected.confidence;
  const bullish = selected.bias.includes('LONG')  ? Math.min(70,b-5) : selected.bias.includes('SHORT') ? Math.max(20,100-b-10) : 38;
  const bearish  = selected.bias.includes('SHORT') ? Math.min(70,b-5) : selected.bias.includes('LONG')  ? Math.max(18,100-b-14) : 30;
  const neutral  = Math.max(100-bullish-bearish,12);
  document.getElementById('weeklyOutlook').innerHTML = `
    <div class="weekly-row"><div><b>Bullish continuation</b><br><small>tech drží, fundament supportuje</small></div><b class="bull">${bullish}%</b></div>
    <div class="weekly-row"><div><b>Neutral / range</b><br><small>čekání na data, earnings, FOMC tón</small></div><b class="neutral">${neutral}%</b></div>
    <div class="weekly-row"><div><b>Bearish pullback</b><br><small>premarket fade pokračuje, USD/yields tlačí risk-off</small></div><b class="bear">${bearish}%</b></div>`;
}

// ─── Render: History ──────────────────────────────────────────────────────────
function historyLineSvg(series, color='#80ff38') {
  const data=series.map(x=>x.value);
  if(data.length<2) return `<div class="empty-history">Dej pár refreshů — history se začne plnit.</div>`;
  const min=Math.min(-1,...data), max=Math.max(1,...data), w=920,h=200,p=28;
  const pts=data.map((v,i)=>{
    const x=p+i*((w-p*2)/(Math.max(1,data.length-1)));
    const y=h-p-((v-min)/(max-min))*(h-p*2);
    return `${x},${y}`;
  }).join(' ');
  const zeroY=h-p-((0-min)/(max-min))*(h-p*2);
  const last=series[series.length-1];
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <line x1="${p}" y1="${zeroY}" x2="${w-p}" y2="${zeroY}" stroke="#31445f" stroke-dasharray="6 7"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${p}" y="22" fill="#8ea1bb" font-size="14">${data.length} bodů dnes</text>
    <text x="${w-p-200}" y="22" fill="${color}" font-size="20" font-weight="900">${last.t} • ${last.value>0?'+':''}${last.value.toFixed(2)}%</text>
  </svg>`;
}

function renderHistoryPanel() {
  const el=document.getElementById('historyPanel');
  if(!el) return;
  const h=storage.history;
  const today=(h[todayKey()]||[]).length;
  const days=Object.keys(h).length;
  const selectedSeries=getHistorySeries(selected.id,1);
  const allToday=results.map(r=>getHistorySeries(r.id,1));
  el.innerHTML = `
    <div class="panel-head"><div><h3>Historie premarket flow</h3><p>Ukládá se při každém refreshi.</p></div><span class="pill green-pill">${today} bodů dnes • ${days} dnů</span></div>
    <div class="history-chart">${historyLineSvg(selectedSeries,chartColor(selected.id))}</div>
    <div class="history-grid">${results.map((r,idx)=>{
      const s=allToday[idx]; const last=s[s.length-1]; const first=s[0];
      const delta=last&&first?last.value-first.value:0;
      return `<article class="history-card"><b>${r.id}</b><span class="${delta>=0?'bull':'bear'}">${delta>=0?'+':''}${delta.toFixed(2)}%</span><small>${s.length} bodů dnes</small></article>`;
    }).join('')}</div>
    <div class="history-actions"><button id="exportHistoryBtn">Export JSON</button><button id="clearHistoryBtn">Smazat historii</button></div>`;
  document.getElementById('exportHistoryBtn')?.addEventListener('click', () => {
    const blob=new Blob([JSON.stringify(storage.history,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download='at-trading-history.json'; a.click(); URL.revokeObjectURL(url);
  });
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    if(confirm('Smazat celou lokální historii?')){ storage.history={}; renderAll(false); }
  });
}

// ─── renderAll ────────────────────────────────────────────────────────────────
// ─── Render: Stocks tabs ──────────────────────────────────────────────────────
function renderStocksTabs() {
  const el = document.getElementById('stocksTabs');
  if (!el) return;
  el.innerHTML = results.map(r =>
    `<button class="chart-tab ${r.id===selected.id?'active':''}" data-id="${r.id}">${r.id}</button>`
  ).join('');
  el.querySelectorAll('.chart-tab').forEach(b =>
    b.addEventListener('click', () => { selected = results.find(r=>r.id===b.dataset.id)||selected; renderAll(false); })
  );
}

// ─── Render: Trade Plan Full (for trade plan tab) ─────────────────────────────
function renderTradePlanFull() {
  const el = document.getElementById('tradePlanFull');
  if (el) el.innerHTML = document.getElementById('tradePlan')?.innerHTML || '';
}

function renderAll(updateTime=true) {
  if (updateTime) demoData.lastUpdate = new Date().toLocaleTimeString('cs-CZ');
  document.getElementById('lastUpdate').textContent = demoData.lastUpdate;
  // Sync global state for tab navigation
  window._results  = results;
  window._selected = selected;
  // Update labels
  const pLabel = document.getElementById('planIndexLabel');
  const sLabel = document.getElementById('flowIndexLabel');
  if (pLabel) pLabel.textContent = selected.id;
  if (sLabel) sLabel.textContent = selected.id;
  renderFreezeBanner();
  renderPrimary();
  renderIndexBar();
  renderPremarketCommand();
  renderBreakdown();
  renderFlowChart();
  renderStocksTabs();
  renderStocks();
  renderTradePlan();
  renderTradePlanFull();
  renderFundamentals();
  renderWeekly();
  renderHistoryPanel();
}
window.renderAll = renderAll;

// ─── Event Listeners ──────────────────────────────────────────────────────────
document.getElementById('refreshBtn').addEventListener('click', async () => {
  try {
    await refreshLiveData();
  } catch(e) {
    setApiStatus(e.message, false);
    simulateDemoRefresh();
  }
  results = demoData.indices.map(i => window.IndexBiasEngine.calculateIndexBias(i));
  recordHistorySnapshot('refresh');
  selected = results.find(r => r.id === selected.id) || results[0];
  renderAll(true);
});

function openApiModal() {
  document.getElementById('apiModal').classList.add('show');
  document.getElementById('finnhubKey').value = storage.key;
  setApiStatus(storage.key ? 'API key uložený.' : 'Demo mode.', !!storage.key);
}
document.getElementById('apiBtn')?.addEventListener('click', openApiModal);
document.getElementById('apiNavBtn')?.addEventListener('click', openApiModal);
document.getElementById('closeApiModal')?.addEventListener('click', () => document.getElementById('apiModal').classList.remove('show'));
document.getElementById('saveApiKey')?.addEventListener('click', () => { storage.key = document.getElementById('finnhubKey').value; setApiStatus('Klíč uložen. Dej Refresh.', true); });
document.getElementById('clearApiKey')?.addEventListener('click', () => { storage.key=''; document.getElementById('finnhubKey').value=''; setApiStatus('Klíč smazán. Demo mode.', false); });
document.getElementById('testApiKey')?.addEventListener('click', async () => {
  storage.key = document.getElementById('finnhubKey').value;
  try {
    await refreshLiveData();
    results = demoData.indices.map(i => window.IndexBiasEngine.calculateIndexBias(i));
    recordHistorySnapshot('test');
    selected = results.find(r => r.id === selected.id) || results[0];
    renderAll(true);
  } catch(e) { setApiStatus(e.message, false); }
});
document.getElementById('baselineBtn')?.addEventListener('click', () => {
  saveBaselineFromCurrent();
  recordHistorySnapshot('baseline');
  renderAll(false);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
renderAll();
setApiStatus(storage.key ? 'API key nalezen. Dej Refresh pro live data.' : 'Demo mode. Otevři API Settings a vlož Finnhub key.', !!storage.key);

// ═══════════════════════════════════════════════════════════════════════════════
// CHART ANALYSIS — AI Vision (OpenRouter free vision models)
// Stejná logika jako FX Analyzer V5 — adaptováno pro US indexy
// ═══════════════════════════════════════════════════════════════════════════════

const AI_INDEX_SYSTEM_PROMPT = `You are a professional US equity index futures analyst with deep expertise in ICT (Inner Circle Trader) / Smart Money Concepts AND classical technical analysis. You specialize in NQ100 (NASDAQ-100), SPX500 (S&P 500) and DJ30 (Dow Jones) futures charts. Analyze the provided chart image and return ONLY a single valid JSON object — no markdown, no explanation, no text outside the JSON.

Use this exact structure:
{
  "bias": "BULLISH"|"BEARISH"|"SIDEWAYS",
  "confidence": <0-100>,
  "timeframe_context": "<one sentence>",
  "market_structure": {
    "trend": "UPTREND"|"DOWNTREND"|"RANGING",
    "description": "<2-3 sentences>",
    "bos_choch": "<BOS/CHoCH or None visible>",
    "swing_points": {"hh":<n>,"hl":<n>,"lh":<n>,"ll":<n>}
  },
  "key_levels": [{"type":"RESISTANCE"|"SUPPORT","zone":"<label>","strength":"STRONG"|"MEDIUM"|"WEAK","notes":"<why>"}],
  "ict_smc": {
    "order_blocks":[{"type":"BULLISH"|"BEARISH","location":"<desc>","status":"UNTESTED"|"TESTED"|"MITIGATED","significance":"HIGH"|"MEDIUM"|"LOW"}],
    "fvg":[{"type":"BULLISH"|"BEARISH","location":"<desc>","status":"OPEN"|"PARTIALLY_FILLED"|"FILLED"}],
    "liquidity":[{"type":"BSL"|"SSL","location":"<desc>","notes":"<equal highs/lows etc>"}],
    "premium_discount":"<price position in range>"
  },
  "classical_ta": {
    "trendlines":"<describe or None identified>",
    "patterns":"<patterns or None identified>",
    "ema_structure":"<EMA alignment or Not visible>",
    "momentum":"<momentum description>"
  },
  "entry_setup": {
    "direction":"BUY"|"SELL"|"WAIT",
    "entry_zone":"<where to enter>",
    "entry_trigger":"<confirmation signal>",
    "stop_loss":"<placement logic>",
    "tp1":"<first target>",
    "tp2":"<second target>",
    "rr_estimate":"<e.g. 1:2>",
    "confluence_factors":["<factor1>","<factor2>"],
    "invalidation":"<what invalidates>"
  },
  "algo_confluence": "<does chart confirm or contradict current algorithmic bias? explain>",
  "risk_warnings":["<warning>"],
  "summary":"<3-4 sentence professional summary in Czech>"
}`;

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const OR_FALLBACK_MODELS = [
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'meta-llama/llama-3.2-90b-vision-instruct:free',
  'qwen/qwen-2-vl-7b-instruct:free',
  'meta-llama/llama-4-maverick:free',
  'meta-llama/llama-4-scout:free',
  'google/gemini-2.0-flash-exp:free'
];

async function runChartAnalysis() {
  const orKey   = localStorage.getItem('or_key') || '';
  const imgFile = window._chartImgFile;
  const indexId = document.getElementById('caIndexSelect')?.value || 'US100';
  const tf      = document.getElementById('caTfSelect')?.value   || '15m';
  const notes   = document.getElementById('caNotes')?.value      || '';
  const setLoading = on => {
    const btn = document.getElementById('caAnalyzeBtn');
    btn.disabled = on;
    btn.textContent = on ? '⟳ Analyzuji...' : '⚡ SPUSTIT AI ANALÝZU';
  };
  const setError = msg => {
    const el = document.getElementById('caError');
    el.textContent = msg; el.style.display = msg ? 'block' : 'none';
  };
  if (!orKey) { setError('Chybí OpenRouter API klíč — přidej ho v API Settings (zdarma na openrouter.ai).'); return; }
  if (!imgFile) { setError('Nejprve nahraj screenshot grafu.'); return; }
  setLoading(true); setError('');
  renderChartResult(null, true);
  try {
    const currentResult = results.find(r => r.id === indexId) || results[0];
    const biasCtx = currentResult
      ? `Algorithmic bias: ${currentResult.id} ${currentResult.bias}, confidence ${currentResult.confidence}%, score ${currentResult.totalScore.toFixed(2)}, momentum from 14:00 CZ: ${currentResult.momentumRaw.toFixed(2)}%.`
      : '';
    const ctx = [`Index: ${indexId}, Timeframe: ${tf}`, biasCtx, notes ? `Trader notes: ${notes}` : null, 'Return ONLY the JSON.'].filter(Boolean).join('\n');
    const b64 = await fileToBase64(imgFile);
    const mt  = imgFile.type || 'image/png';
    let visionModels = [];
    try {
      const mResp = await fetch('https://openrouter.ai/api/v1/models', { headers: { 'Authorization': `Bearer ${orKey}` } });
      const mData = await mResp.json();
      visionModels = (mData.data || []).filter(m => m.id.endsWith(':free') && (m.architecture?.modality || '').includes('image')).sort((a, b) => (b.context_length||0)-(a.context_length||0)).map(m => m.id);
    } catch(e) { console.warn('Models fetch:', e); }
    const manualModel = localStorage.getItem('or_model') || '';
    const modelsToTry = [manualModel, ...visionModels, ...OR_FALLBACK_MODELS].filter(Boolean).filter((v,i,a) => a.indexOf(v) === i);
    let raw = '', usedModel = '', lastErr = '';
    for (const model of modelsToTry) {
      try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orKey}`, 'HTTP-Referer': 'https://attrading.netlify.app', 'X-Title': 'AT Trading Daily Bias Index' },
          body: JSON.stringify({ model, messages: [{ role: 'system', content: AI_INDEX_SYSTEM_PROMPT }, { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mt};base64,${b64}` } }, { type: 'text', text: ctx }] }], max_tokens: 2048 })
        });
        const d = await r.json();
        if (d.error) { lastErr = `${model}: ${d.error.message||JSON.stringify(d.error)}`; continue; }
        const candidate = d.choices?.[0]?.message?.content || '';
        if (candidate) { raw = candidate; usedModel = model; break; }
      } catch(e) { lastErr = `${model}: ${e.message}`; continue; }
    }
    if (!raw) throw new Error('Žádný free vision model není dostupný. Zkus to za pár minut.\n' + lastErr);
    console.log('✓ Analýza OK, model:', usedModel);
    const clean = raw.replace(/```json|```/g, '').trim();
    const si = clean.indexOf('{'), ei = clean.lastIndexOf('}');
    renderChartResult(JSON.parse(si >= 0 && ei > si ? clean.slice(si, ei+1) : clean), false, indexId, tf, usedModel);
  } catch(e) {
    setError('Analýza selhala: ' + (e?.message || String(e)));
    renderChartResult(null, false);
  }
  setLoading(false);
}

function renderChartResult(result, loading=false, indexId='', tf='', model='') {
  const el = document.getElementById('caResult');
  if (!el) return;
  if (loading) {
    el.innerHTML = `<div class="ca-loading"><div class="ca-spinner"></div><div><b class="bull">AI analyzuje graf...</b><br><small>Market Structure · Order Blocks · FVG · Liquidity · Entry Setup</small></div></div>`;
    return;
  }
  if (!result) {
    el.innerHTML = `<div class="ca-empty"><div style="font-size:38px;margin-bottom:12px">🤖</div><b>Nahrej screenshot a spusť analýzu</b><p>AI identifikuje tržní strukturu, Order Blocks, FVG, Liquidity a navrhne entry setup s SL/TP.</p><div class="ca-tags">${['Market Structure','Order Blocks','FVG','Liquidity','BOS/CHoCH','S/R Zóny','Entry Setup','RR Ratio','Algo Confluence'].map(t=>`<span>✓ ${t}</span>`).join('')}</div></div>`;
    return;
  }
  const bc = result.bias === 'BULLISH' ? 'var(--green)' : result.bias === 'BEARISH' ? 'var(--red)' : '#ffc42e';
  const trendCls = result.market_structure?.trend === 'UPTREND' ? 'bull' : result.market_structure?.trend === 'DOWNTREND' ? 'bear' : 'neutral';
  const cfCls = result.confidence >= 70 ? 'bull' : result.confidence >= 45 ? 'neutral' : 'bear';
  const rkl = type => (result.key_levels||[]).filter(l=>l.type===type).map(l=>`<div class="ca-level ${type==='RESISTANCE'?'ca-res':'ca-sup'}"><div class="ca-level-top"><b>${type==='RESISTANCE'?'RES':'SUP'}</b><span>${l.strength==='STRONG'?'●●●':l.strength==='MEDIUM'?'●●○':'●○○'}</span></div><div>${l.zone}</div>${l.notes?`<small>${l.notes}</small>`:''}</div>`).join('');
  const rOB = () => (result.ict_smc?.order_blocks||[]).map(ob=>`<div class="ca-smc-row"><span class="ca-pill ${ob.type==='BULLISH'?'bull-pill':'bear-pill'}">${ob.type} OB</span><span class="ca-pill ${ob.significance==='HIGH'?'high-pill':'med-pill'}">${ob.significance}</span><span>${ob.location}</span><small>${ob.status}</small></div>`).join('');
  const rFVG = () => (result.ict_smc?.fvg||[]).map(f=>`<div class="ca-smc-row"><span class="ca-pill ${f.type==='BULLISH'?'bull-pill':'bear-pill'}">${f.type} FVG</span><span>${f.location}</span><small>${f.status}</small></div>`).join('');
  const rLiq = () => (result.ict_smc?.liquidity||[]).map(l=>`<div class="ca-smc-row"><span class="ca-pill ${l.type==='BSL'?'bull-pill':'bear-pill'}">${l.type}</span><span>${l.location}</span>${l.notes?`<small>${l.notes}</small>`:''}</div>`).join('');
  el.innerHTML = `
    <div class="ca-card ca-header-card">
      <div class="ca-bias-box" style="border-color:${bc}44;background:${bc}11"><small>AI BIAS</small><b style="color:${bc};font-size:18px">${result.bias==='BULLISH'?'▲ BULL':result.bias==='BEARISH'?'▼ BEAR':'◆ SIDE'}</b></div>
      <div class="ca-conf-box"><small>KONF.</small><b class="${cfCls}" style="font-size:22px">${result.confidence}</b><small>/100</small></div>
      <div class="ca-summary-box">
        <div class="ca-pills"><span class="ca-pill info-pill">${indexId}</span><span class="ca-pill info-pill">${tf}</span>${model?`<span class="ca-pill model-pill">${model.split('/')[1]||model}</span>`:''}</div>
        <p>${result.summary||''}</p>
        ${result.algo_confluence?`<div class="ca-confluence">${result.algo_confluence}</div>`:''}
      </div>
    </div>
    ${result.risk_warnings?.length?`<div class="ca-warn-bar">⚠ ${result.risk_warnings.join(' · ')}</div>`:''}
    <div class="ca-grid-2">
      <div class="ca-card"><h4>🏗 Market Structure</h4>
        ${result.market_structure?.trend?`<span class="ca-pill ${trendCls==='bull'?'bull-pill':trendCls==='bear'?'bear-pill':'neut-pill'}" style="margin-bottom:8px;display:inline-block">${result.market_structure.trend}</span>`:''}
        <p>${result.market_structure?.description||''}</p>
        ${result.market_structure?.bos_choch&&result.market_structure.bos_choch!=='None visible'?`<div class="ca-bos">🔷 ${result.market_structure.bos_choch}</div>`:''}
        ${result.market_structure?.swing_points?`<div class="ca-swing-grid">${[{l:'HH',v:result.market_structure.swing_points.hh,c:'bull'},{l:'HL',v:result.market_structure.swing_points.hl,c:'bull'},{l:'LH',v:result.market_structure.swing_points.lh,c:'bear'},{l:'LL',v:result.market_structure.swing_points.ll,c:'bear'}].map(({l,v,c})=>`<div class="ca-swing ca-swing-${c}"><small>${l}</small><b>${v??'—'}</b></div>`).join('')}</div>`:''}
      </div>
      <div class="ca-card"><h4>📐 Classical TA</h4>
        ${[{l:'TRENDLINES',v:result.classical_ta?.trendlines},{l:'PATTERNS',v:result.classical_ta?.patterns},{l:'EMA STRUKTURA',v:result.classical_ta?.ema_structure},{l:'MOMENTUM',v:result.classical_ta?.momentum}].filter(({v})=>v&&v!=='None identified'&&!String(v).toLowerCase().includes('not visible')).map(({l,v})=>`<div class="ca-ta-row"><small>${l}</small><span>${v}</span></div>`).join('')}
      </div>
    </div>
    ${(result.key_levels?.length>0)?`<div class="ca-card"><h4>📏 Key Levels — S/R Zóny</h4><div class="ca-grid-2"><div><small class="bear">RESISTANCE</small><div style="margin-top:5px">${rkl('RESISTANCE')||'<small class="muted">—</small>'}</div></div><div><small class="bull">SUPPORT</small><div style="margin-top:5px">${rkl('SUPPORT')||'<small class="muted">—</small>'}</div></div></div></div>`:''}
    <div class="ca-card"><h4>🧠 ICT / Smart Money Concepts</h4>
      ${result.ict_smc?.premium_discount?`<div class="ca-pd">📍 ${result.ict_smc.premium_discount}</div>`:''}
      <div class="ca-smc-section"><b>Order Blocks</b>${rOB()||'<small class="muted">—</small>'}</div>
      <div class="ca-smc-section"><b>Fair Value Gaps</b>${rFVG()||'<small class="muted">—</small>'}</div>
      <div class="ca-smc-section"><b>Liquidity</b>${rLiq()||'<small class="muted">—</small>'}</div>
    </div>
    ${result.entry_setup?`<div class="ca-card ca-entry-card">
      <div class="ca-entry-header"><h4>⚡ Entry Setup</h4><span class="ca-pill ${result.entry_setup.direction==='BUY'?'bull-pill':result.entry_setup.direction==='SELL'?'bear-pill':'neut-pill'}" style="font-size:14px;padding:5px 14px">${result.entry_setup.direction==='BUY'?'▲ BUY':result.entry_setup.direction==='SELL'?'▼ SELL':'⏳ WAIT'}</span>${result.entry_setup.rr_estimate?`<span class="ca-pill info-pill">RR ${result.entry_setup.rr_estimate}</span>`:''}</div>
      <div class="ca-entry-grid">${[{l:'Entry Zone',v:result.entry_setup.entry_zone},{l:'Trigger',v:result.entry_setup.entry_trigger},{l:'Stop Loss',v:result.entry_setup.stop_loss},{l:'TP1',v:result.entry_setup.tp1},{l:'TP2',v:result.entry_setup.tp2}].map(({l,v})=>v?`<div class="ca-entry-row"><small>${l}</small><span>${v}</span></div>`:'').join('')}</div>
      ${result.entry_setup.confluence_factors?.length?`<div class="ca-confluence-list"><b>Confluence:</b> ${result.entry_setup.confluence_factors.map(f=>`<span>${f}</span>`).join('')}</div>`:''}
      ${result.entry_setup.invalidation?`<div class="ca-invalidation">⚡ Invalidace: ${result.entry_setup.invalidation}</div>`:''}
    </div>`:''}`;
}

function initChartAnalysis() {
  const dropZone  = document.getElementById('caDropZone');
  const fileInput = document.getElementById('caFileInput');
  const preview   = document.getElementById('caPreview');
  const removeBtn = document.getElementById('caRemoveImg');
  if (!dropZone) return;
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    window._chartImgFile = file;
    preview.src = URL.createObjectURL(file); preview.style.display = 'block';
    dropZone.querySelector('.ca-drop-hint').style.display = 'none';
    removeBtn.style.display = 'inline-block';
    document.getElementById('caError').style.display = 'none';
  }
  dropZone.addEventListener('click',     () => fileInput.click());
  dropZone.addEventListener('dragover',  e  => { e.preventDefault(); dropZone.classList.add('drag'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
  dropZone.addEventListener('drop',      e  => { e.preventDefault(); dropZone.classList.remove('drag'); handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change',   e  => { handleFile(e.target.files[0]); e.target.value = ''; });
  removeBtn.addEventListener('click', e => {
    e.stopPropagation(); window._chartImgFile = null;
    preview.src = ''; preview.style.display = 'none';
    dropZone.querySelector('.ca-drop-hint').style.display = 'flex';
    removeBtn.style.display = 'none'; renderChartResult(null);
  });
  document.getElementById('caAnalyzeBtn')?.addEventListener('click', runChartAnalysis);
  document.getElementById('saveOrKey')?.addEventListener('click', () => {
    const keyVal   = document.getElementById('orKey')?.value?.trim();
    const modelVal = document.getElementById('orModel')?.value?.trim();
    if (keyVal) localStorage.setItem('or_key', keyVal);
    if (modelVal) localStorage.setItem('or_model', modelVal);
    else localStorage.removeItem('or_model');
    document.getElementById('orKeyStatus').textContent = '✅ Uloženo.';
  });
  const orKeyEl = document.getElementById('orKey');
  if (orKeyEl) orKeyEl.value = localStorage.getItem('or_key') || '';
  const orModelEl = document.getElementById('orModel');
  if (orModelEl) orModelEl.value = localStorage.getItem('or_model') || '';
  renderChartResult(null);
}

document.addEventListener('DOMContentLoaded', initChartAnalysis);
