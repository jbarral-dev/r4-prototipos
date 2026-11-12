// Generador de las series DE EJEMPLO del gráfico de la ficha de acción (R4ChartLine), una por periodo del selector. En producción vendrían de backend.
// Todo es INVENTADO salvo los anclajes que salen de la ficha pública de IBERDROLA en r4.com (ES0144580Y14/MCO, 2026-11-12): precio actual 23,35 € (último punto de todas las series),
// apertura 23,25 € (inicio del 1 día) y rentabilidad a 12 meses del 35,34 % (inicio del 1 año = 23,35 / 1,3534). El resto de inicios (5D, 1M, 6M, 2026, 2A, Todo) están inventados.
// Las series son deterministas (misma semilla → mismo gráfico): paseo aleatorio «puente» que parte del valor inicial y acaba exactamente en el valor final.
// Ejes según Confluence R4ChartLine (3512008717): marcas «redondas» (1, 2, 5 × 10ⁿ), decimales justos (paso ≥ 1 → 0; 0,1–0,9 → 1; menor → 2), formato español.
// Eje X: 1 día = horas; 5 días = días; el resto, la frecuencia de la tabla de la doc (meses abreviados en minúscula, sin punto). «Todo» se toma como 10 años (supuesto). Las etiquetas se reparten
// a partes iguales (R4ChartLine no las coloca por fecha), así que la posición es aproximada.

const seedOf = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7)
const rng = (seed) => () => { // mulberry32
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Configuración por periodo: número de puntos, «ajuste de dividendos» (fracción máxima que baja lo antiguo), volatilidad relativa del trazo, número de velas, dividendos (fracciones de la serie) y etiquetas del eje X.
export const PERIODOS_CFG = {
  '1d': { n: 48, vol: 0.0016, velas: 14, dividendos: [], x: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'], progress: 0.607, ajuste: 0.002 },
  '5d': { n: 50, vol: 0.0035, velas: 20, dividendos: [], ajuste: 0.004, x: ['6 nov', '9 nov', '10 nov', '11 nov', '12 nov'] },
  '1m': { n: 22, vol: 0.008, velas: 22, dividendos: [], ajuste: 0.01, x: ['12 oct', '19 oct', '26 oct', '2 nov', '9 nov'] },
  '6m': { n: 60, vol: 0.012, velas: 26, dividendos: [0.45], ajuste: 0.02, x: ['jul 2026', 'sep 2026', 'nov 2026'] },
  ytd: { n: 70, vol: 0.014, velas: 30, dividendos: [0.2, 0.75], ajuste: 0.03, x: ['ene 2026', 'abr 2026', 'jul 2026', 'oct 2026'] },
  '1y': { n: 90, vol: 0.016, velas: 26, dividendos: [0.3, 0.8], ajuste: 0.04, x: ['ene 2026', 'abr 2026', 'jul 2026', 'oct 2026'] },
  '2y': { n: 110, vol: 0.02, velas: 26, dividendos: [0.15, 0.4, 0.65, 0.9], ajuste: 0.06, x: ['ene 2025', 'jul 2025', 'ene 2026', 'jul 2026'] },
  all: { n: 120, vol: 0.03, velas: 30, dividendos: [0.1, 0.25, 0.4, 0.55, 0.7, 0.85], ajuste: 0.08, x: ['2018', '2020', '2022', '2024', '2026'] },
}
// Relación inicio/fin de cada periodo para la acción principal (inicio = precio × ratio)
const INICIO_PRINCIPAL = { '1d': 23.25 / 23.35, '5d': 22.8 / 23.35, '1m': 21.9 / 23.35, '6m': 19.4 / 23.35, ytd: 18.1 / 23.35, '1y': 1 / 1.3534, '2y': 12.9 / 23.35, all: 6.2 / 23.35 }
// Escala del movimiento de un valor comparado en cada periodo (× su deriva)
const ESCALA = { '1d': 0.01, '5d': 0.03, '1m': 0.06, '6m': 0.15, ytd: 0.22, '1y': 0.3, '2y': 0.5, all: 1.2 }

const walk = (cfg, start, end, seedKey, vol) => {
  const r = rng(seedOf(seedKey))
  const n = cfg.n
  let w = 0
  const raw = Array.from({ length: n }, () => (w += r() - 0.5))
  const last = raw[n - 1]
  return raw.map((v, i) => {
    const t = i / (n - 1)
    const bridge = v - t * last // puente: 0 en los dos extremos
    return +(start + (end - start) * t + (bridge / Math.sqrt(n)) * vol * end * 5).toFixed(4)
  })
}

// Serie de otro valor (para comparar), con el mismo número de puntos que la principal del periodo
export const serieComparada = (periodo, fin, deriva, clave) => {
  const cfg = PERIODOS_CFG[periodo]
  const start = fin / Math.max(0.2, 1 + deriva * ESCALA[periodo])
  return walk(cfg, start, fin, clave + periodo, cfg.vol)
}

const fmtTick = (v, dec) => `${v.toFixed(dec).replace('.', ',')}€`
const ticks = (lo, hi) => {
  const raw = (hi - lo) / 5 || 1
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = ([1, 2, 5, 10].find((m) => m * mag >= raw) || 10) * mag
  const bottom = Math.floor(lo / step + 1e-9) * step
  const top = Math.ceil(hi / step - 1e-9) * step
  const dec = step >= 1 ? 0 : step >= 0.1 ? 1 : 2
  const labels = []
  for (let v = top; v >= bottom - step / 1000; v -= step) labels.push(fmtTick(v, dec))
  return { domain: [bottom, top], labels }
}

const candlesOf = (pts, m, vol, key) => {
  const r = rng(seedOf(key + 'velas'))
  const end = pts[pts.length - 1]
  let prev = pts[0]
  return Array.from({ length: m }, (_, i) => {
    const c = pts[Math.round(((i + 1) / m) * (pts.length - 1))]
    const o = prev
    const wick = vol * end * (0.5 + r() * 1.2)
    prev = c
    return { o: +o.toFixed(3), c: +c.toFixed(3), h: +(Math.max(o, c) + wick).toFixed(3), l: +(Math.min(o, c) - wick).toFixed(3) }
  })
}

export const crearSeriePrincipal = (precio, clave) => Object.fromEntries(Object.entries(PERIODOS_CFG).map(([id, cfg]) => {
  const start = precio * INICIO_PRINCIPAL[id]
  const points = walk(cfg, start, precio, clave + id, cfg.vol)
  const n = points.length
  const last = points[n - 1]
  const first = points[0]
  const velas = candlesOf(points, cfg.velas, cfg.vol, clave + id)
  const r = rng(seedOf(clave + id + 'ov'))
  const bw = cfg.vol * last * 3
  const samples = Array.from({ length: 7 }, (_, k) => points[Math.round((k * (n - 1)) / 6)])
  const overlays = {
    mm50: { type: 'line', tone: 'average-1', points: [+(first + (last - first) * 0.15).toFixed(3), +(last * 0.985).toFixed(3)] },
    mm200: { type: 'line', tone: 'average-2', points: [+(first * 0.97).toFixed(3), +(last * 0.95).toFixed(3)] },
    bollinger: { type: 'band', tone: 'average-3', upper: samples.map((v) => +(v + bw).toFixed(3)), lower: samples.map((v) => +(v - bw).toFixed(3)) },
    volumen: { type: 'bars', values: Array.from({ length: 14 }, () => +(0.3 + r() * 0.65).toFixed(2)) },
    dividendos: { type: 'markers', at: cfg.dividendos.map((f) => Math.round(f * (n - 1))) },
  }
  // Dominio = todo lo que puede llegar a dibujarse (puntos, velas, indicadores y el «ajuste de dividendos»), para que activar un indicador no reescale el eje
  const all = [...points, ...points.map((v) => v * (1 - cfg.ajuste)), ...velas.flatMap((c) => [c.h, c.l]), ...overlays.mm50.points, ...overlays.mm200.points, ...overlays.bollinger.upper, ...overlays.bollinger.lower]
  const { domain, labels } = ticks(Math.min(...all), Math.max(...all))
  return [id, { points, domain, yLabels: labels, xLabels: cfg.x, progress: cfg.progress ?? 1, ajuste: cfg.ajuste, candles: velas, overlays }]
}))
