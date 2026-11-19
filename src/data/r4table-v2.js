// DATOS DE EJEMPLO (prototipo «R4Table (v2)»). En producción vendrían de backend. Estructura visual: Figma «Proyectos - Tablas» (frame r4table-v2-muchos-filtros--dk, 668:23386): cabecera de IBEX 35, tabs y tabla con columnas
// Nombre · Último · Dif. · Dif.% · VolC · Compra · Venta · VolV · Volumen · Hora (+ botón de compra). Las cifras de las 10 primeras acciones son las del Figma; el resto de filas (acciones, criptoactivos, ETFs y fondos), la fecha
// de última operación y los datos de la «Vista adicional» están INVENTADOS para que los filtros de Fecha, Tipo y Valor tengan sobre qué actuar (el Figma solo trae una vista y filas de acciones).
const logo = (f) => new URL('../assets/logos/' + f, import.meta.url).href

// [nombre, tipo, sector, divisa, último, dif.%, días desde la última operación, logo]
const BASE = [
  ['ACCIONA', 'Acciones', 'Construcción', 'EUR', 214, 1.42, 0, 'iso-ana.svg'],
  ['ACCIONA ENER', 'Acciones', 'Energía', 'EUR', 22.18, 0.64, 0, null],
  ['ACERINOX', 'Acciones', 'Industria', 'EUR', 17.27, 0.47, 0, null],
  ['ACS CONST.', 'Acciones', 'Construcción', 'EUR', 91.45, -1.08, 0, null],
  ['AENA', 'Acciones', 'Infraestructuras', 'EUR', 25.56, 0, 0, null],
  ['AMADEUS IT', 'Acciones', 'Tecnología', 'EUR', 51.92, -1.07, 0, null],
  ['ARCEL.MITTAL', 'Acciones', 'Industria', 'EUR', 59.5, -0.57, 0, null],
  ['BBVA', 'Acciones', 'Banca', 'EUR', 24.95, -0.91, 0, null],
  ['B. SABADELL', 'Acciones', 'Banca', 'EUR', 3.652, -0.41, 0, null],
  ['SANTANDER', 'Acciones', 'Banca', 'EUR', 12.362, -1.18, 0, 'iso-san.svg'],
  ['TELEFÓNICA', 'Acciones', 'Telecomunicaciones', 'EUR', 3.96, 0.31, 3, 'iso-tef.svg'],
  ['IBERDROLA', 'Acciones', 'Energía', 'EUR', 23.35, 0.65, 6, 'iso-ibe.svg'],
  ['INDITEX', 'Acciones', 'Consumo', 'EUR', 48.2, 0.88, 40, 'iso-itx.svg'],
  ['REPSOL', 'Acciones', 'Energía', 'EUR', 12.1, -0.22, 120, 'iso-rep.svg'],
  ['Bitcoin', 'Criptoactivos', 'Criptomonedas', 'EUR', 86420.5, 1.84, 0, null],
  ['Ethereum', 'Criptoactivos', 'Criptomonedas', 'EUR', 2985.3, 2.31, 0, null],
  ['Solana', 'Criptoactivos', 'Criptomonedas', 'EUR', 128.74, -0.95, 1, null],
  ['XRP', 'Criptoactivos', 'Criptomonedas', 'EUR', 2.18, 0.42, 2, null],
  ['Cardano', 'Criptoactivos', 'Criptomonedas', 'EUR', 0.612, -1.7, 5, null],
  ['Polkadot', 'Criptoactivos', 'Criptomonedas', 'EUR', 4.35, 0.18, 9, null],
  ['Chainlink', 'Criptoactivos', 'Criptomonedas', 'EUR', 15.82, 3.05, 14, null],
  ['Litecoin', 'Criptoactivos', 'Criptomonedas', 'EUR', 94.6, -0.36, 28, null],
  ['Avalanche', 'Criptoactivos', 'Criptomonedas', 'EUR', 31.4, 1.12, 52, null],
  ['Dogecoin', 'Criptoactivos', 'Criptomonedas', 'EUR', 0.163, -2.4, 75, null],
  ['Polygon', 'Criptoactivos', 'Criptomonedas', 'EUR', 0.481, 0.77, 160, null],
  ['Stellar', 'Criptoactivos', 'Criptomonedas', 'EUR', 0.248, -0.12, 300, null],
  ['iShares Core S&P 500', 'ETFs', 'Renta variable global', 'USD', 612.4, 0.28, 0, null],
  ['Vanguard FTSE All-World', 'ETFs', 'Renta variable global', 'USD', 138.7, 0.19, 2, null],
  ['Amundi MSCI World', 'ETFs', 'Renta variable global', 'EUR', 521.3, -0.05, 20, null],
  ['iShares Core MSCI EM', 'ETFs', 'Renta variable emergente', 'USD', 56.9, 0.64, 70, null],
  ['Lyxor IBEX 35', 'ETFs', 'Renta variable España', 'EUR', 15.3, -0.21, 200, null],
  ['Magallanes Value Iberia', 'Fondos', 'Renta variable España', 'EUR', 42.5, 0.12, 1, null],
  ['Cobas Selección', 'Fondos', 'Renta variable global', 'EUR', 19.8, 0.33, 4, null],
  ['Azvalor Internacional', 'Fondos', 'Renta variable global', 'EUR', 31.2, -0.08, 35, null],
  ['Horos Value Internacional', 'Fondos', 'Renta variable global', 'EUR', 24.9, 0.21, 88, null],
  ['Santander Small Caps España', 'Fondos', 'Renta variable España', 'EUR', 11.6, -0.4, 250, null],
]

const pad = (n) => String(n).padStart(2, '0')
const rnd = (i, k) => { const x = Math.sin(i * 9301 + k * 49297) * 233280; return x - Math.floor(x) } // determinista: los datos no cambian entre cargas

export const filas = BASE.map(([name, tipo, sector, divisa, last, difPct, dias, logoFile], i) => {
  const dif = +(last * difPct / (100 + difPct)).toFixed(last < 10 ? 3 : 2)
  const spread = last < 1 ? 0.002 : last < 100 ? 0.02 : last < 1000 ? 0.2 : 2
  const hora = `${pad(9 + Math.floor(rnd(i, 1) * 8))}:${pad(Math.floor(rnd(i, 2) * 60))}:${pad(Math.floor(rnd(i, 3) * 60))}`
  return {
    id: `${tipo}-${name}`,
    name, tipo, sector, divisa, last, dif, difPct, dias, logoURL: logoFile ? logo(logoFile) : undefined,
    volC: Math.round(200 + rnd(i, 4) * 40000), compra: +(last - spread).toFixed(last < 10 ? 3 : 2), venta: +(last + spread).toFixed(last < 10 ? 3 : 2),
    volV: Math.round(200 + rnd(i, 5) * 20000), volumen: Math.round(20000 + rnd(i, 6) * 14000000), hora,
    max52: +(last * (1.08 + rnd(i, 7) * 0.4)).toFixed(last < 10 ? 3 : 2), min52: +(last * (0.55 + rnd(i, 8) * 0.35)).toFixed(last < 10 ? 3 : 2),
    cap: Math.round(500 + rnd(i, 9) * 90000), per: tipo === 'Acciones' ? +(6 + rnd(i, 10) * 24).toFixed(1) : null, ytd: +((rnd(i, 11) - 0.35) * 60).toFixed(2),
  }
})

const opc = (...pares) => pares.map(([value, label]) => ({ value, label }))
const FECHAS = { hoy: 0, '1w': 7, '1m': 30, '3m': 90, '1y': 365 }
const fFecha = { id: 'fecha', label: 'Fecha', type: 'single', icon: 'ic-calendar', highlighted: true,
  options: opc(['hoy', 'Hoy'], ['1w', 'Última semana'], ['1m', 'Último mes'], ['3m', 'Últimos 3 meses'], ['1y', 'Último año']),
  predicate: (r, [v]) => r.dias <= FECHAS[v] }
const fTipo = { id: 'tipo', label: 'Tipo', type: 'multiple', highlighted: true,
  options: opc(['Acciones', 'Acciones'], ['Criptoactivos', 'Criptoactivos'], ['ETFs', 'ETFs'], ['Fondos', 'Fondos']),
  predicate: (r, vs) => vs.includes(r.tipo) }
const fValor = { id: 'valor', label: 'Valor', type: 'multiple', highlighted: true,
  options: opc(...['SANTANDER', 'BBVA', 'TELEFÓNICA', 'IBERDROLA', 'Bitcoin', 'Ethereum', 'Solana', 'XRP', 'Dogecoin', 'iShares Core S&P 500'].map((n) => [n, n])),
  predicate: (r, vs) => vs.includes(r.name) }
const fVariacion = { id: 'variacion', label: 'Variación diaria', type: 'single',
  options: opc(['alza', 'Al alza'], ['baja', 'A la baja'], ['igual', 'Sin cambios']),
  predicate: (r, [v]) => (v === 'alza' ? r.difPct > 0 : v === 'baja' ? r.difPct < 0 : r.difPct === 0) }
const fDivisa = { id: 'divisa', label: 'Divisa', type: 'multiple', highlighted: true, options: opc(['EUR', 'Euro (EUR)'], ['USD', 'Dólar (USD)']), predicate: (r, vs) => vs.includes(r.divisa) }
const fYtd = { id: 'ytd', label: 'Rentabilidad YTD', type: 'single', highlighted: true, options: opc(['pos', 'Positiva'], ['neg', 'Negativa']), predicate: (r, [v]) => (v === 'pos' ? r.ytd >= 0 : r.ytd < 0) }
const fSector = { id: 'sector', label: 'Sector', type: 'multiple',
  options: opc(...['Banca', 'Construcción', 'Consumo', 'Criptomonedas', 'Energía', 'Industria', 'Infraestructuras', 'Renta variable global', 'Tecnología', 'Telecomunicaciones'].map((s) => [s, s])), predicate: (r, vs) => vs.includes(r.sector) }

// Columnas de cada vista. Los filtros son por columna (Jon): cada vista trae los suyos. `format` / `tone` los resuelve R4TableV2 (R4Text); `slot` = hay slot `body-<field>` en la pantalla.
const nombre = { field: 'name', header: 'Nombre', sortable: true, frozen: true, width: '16%' }
const nombreAncho = { ...nombre, width: '25%' }
const num = (field, header, width) => ({ field, header, sortable: true, align: 'right', width })
export const vistas = [
  { value: 'basica', label: 'Vista básica',
    columns: [nombre, num('last', 'Último', '9%'), num('dif', 'Dif.', '8%'), num('difPct', 'Dif.%', '9%'), num('volC', 'VolC', '8%'), num('compra', 'Compra', '9%'), num('venta', 'Venta', '9%'), num('volV', 'VolV', '8%'), num('volumen', 'Volumen', '10%'), num('hora', 'Hora', '9%'), { field: 'accion', header: '', srHeader: 'Acciones', align: 'right', width: '5%' }],
    filters: [fFecha, fTipo, fValor, fVariacion],
    initial: { fecha: ['3m'], tipo: ['Criptoactivos'] }, defaultSort: { field: 'name', order: 'asc' } },
  { value: 'adicional', label: 'Vista adicional',
    columns: [nombreAncho, { field: 'tipo', header: 'Tipo', sortable: true, width: '13%' }, { field: 'divisa', header: 'Divisa', sortable: true, width: '9%' }, num('max52', 'Máx. 52 s', '10%'), num('min52', 'Mín. 52 s', '10%'), num('cap', 'Cap. (M)', '10%'), num('per', 'PER', '8%'), num('ytd', 'YTD', '9%'), { field: 'accion', header: '', srHeader: 'Acciones', align: 'right', width: '5%' }],
    filters: [fTipo, fDivisa, fYtd, fSector],
    initial: {} },
]
