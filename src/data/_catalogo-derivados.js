// Catálogo DE EJEMPLO (inventado, determinista) de los productos relacionados con la acción, para la tab «Productos relacionados» de la ficha: 1 CFD + 10 futuros + 48 opciones + 48 warrants = 107, que son los
// contadores de los chips de la sección del Resumen. Cada producto lleva los datos que ya muestra esa sección (CFD: garantía; el resto: vencimiento), precio y variación. Nada de esto viene de backend ni de Figma.
const fmt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt1 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'always' })
const eur = (v) => `${fmt.format(v)} €`
const rng = (seed) => () => { // mulberry32
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const VENCIMIENTOS_OPCIONES = [{ f: '16/12/26', meses: 1 }, { f: '19/03/27', meses: 4 }, { f: '18/06/27', meses: 7 }, { f: '17/09/27', meses: 10 }]
const VENCIMIENTOS_WARRANTS = [{ f: '20/11/26', meses: 0.3 }, { f: '19/02/27', meses: 3 }, { f: '21/05/27', meses: 6 }, { f: '20/08/27', meses: 9 }]
const STRIKES = [20, 21, 22, 23, 24, 25]
const FUTUROS = [['Dic-26', '18/12/26'], ['Mar-27', '19/03/27'], ['Jun-27', '18/06/27'], ['Sep-27', '17/09/27'], ['Dic-27', '17/12/27'], ['Mar-28', '17/03/28'], ['Jun-28', '16/06/28'], ['Sep-28', '15/09/28'], ['Dic-28', '15/12/28'], ['Mar-29', '16/03/29']]

// Prima aproximada: valor intrínseco + valor temporal que crece con el plazo y decae lejos del strike
const prima = (spot, strike, meses, call) => {
  const intrinseco = Math.max(call ? spot - strike : strike - spot, 0)
  return intrinseco + 0.45 * Math.sqrt(Math.max(meses, 0.1) / 3) * Math.exp(-Math.abs(spot - strike) / 1.6) + 0.02
}

export const crearCatalogo = (spot, nombre = 'Iberdrola') => {
  const r = rng(2026)
  const variacion = () => fmt1.format((r() - 0.5) * 16) + ' %'
  const out = []
  out.push({ tipo: 'CFD', name: `CFD de ${nombre.toUpperCase()}`, meta: ['Garantía:', '20%'], price: eur(spot), variation: '-2,56%' })
  FUTUROS.forEach(([etiqueta, fecha], i) => out.push({ tipo: 'Futuro', name: `Futuro ${nombre} ${etiqueta}`, meta: ['Vence', fecha], price: eur(spot * (1 + 0.006 * (i + 1))), variation: variacion() }))
  ;[true, false].forEach((call) => VENCIMIENTOS_OPCIONES.forEach((v) => STRIKES.forEach((k) => out.push({ tipo: 'Opción', name: `${nombre} ${call ? 'Call' : 'Put'} ${k} €`, meta: ['Vence', v.f], price: eur(prima(spot, k, v.meses, call)), variation: variacion() }))))
  ;[true, false].forEach((call) => VENCIMIENTOS_WARRANTS.forEach((v) => STRIKES.forEach((k) => out.push({ tipo: 'Warrant', name: `Warrant ${nombre} ${call ? 'Call' : 'Put'} ${k} €`, meta: ['Vence', v.f], price: eur(Math.max(prima(spot, k, v.meses, call) / 10, 0.01)), variation: variacion() }))))
  return out
}
