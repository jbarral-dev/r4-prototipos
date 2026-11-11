// DATOS DE EJEMPLO (prototipo) de la ficha de acción. En producción vendrían de backend. Los valores salen de los textos del Figma
// ("Proyectos - Fichas de Productos", frames cl-ficha-accion--dk y ficha-accion--mb); lo que no estaba en el diseño se ha inventado y se marca con «(inventado)».
// Los logos se resuelven respecto a este módulo (no al documento): cada prototipo vive en su propia carpeta
const logo = (f) => new URL('../assets/logos/' + f, import.meta.url).href

export const accion = {
  producto: {
    productName: 'IBERDROLA',
    logoURL: logo('iso-ibe.svg'),
    price: 20.49,
    currency: 'EUR',
    variation: 0.74,
    updated: '11:39h',
    market: { name: 'BME', flag: 'flag-spain' },
    priceTarget: { label: 'Precio objetivo R4', value: '20,10 €', recommendation: 'Mantener' },
    breadcrumbs: [
      { label: 'Bolsas y derivados', href: '#' },
      { label: 'Bolsas', href: '#' },
      { label: 'Bolsa Nacional', href: '#' },
      { label: 'IBERDROLA' }, // sin href = página actual
    ],
    ctaText: 'Contratar',
    // En la doc de R4PageTitleProduct la única acción restante de Acciones es «Configurar tiempo real»
    secondaryActions: [{ label: 'Configurar tiempo real', icon: 'ic-clock', showLink: false }],
  },

  // Caja de riesgo (_RiskBox): «6 / 6» en el Figma de la ficha de acción (el mismo 6/6 de la fila «Riesgo» del Resumen)
  riesgo: { riskLevel: 6, maxRisk: 6 },

  // Capa fija al hacer scroll (fixedProductTitleLayer): muestra el mercado del producto (BME), igual que el título
  capaFija: { market: { name: 'BME', flag: 'flag-spain' } },

  tabs: [
    { label: 'Detalle' },
    { label: 'Informes' },
    { label: 'Análisis técnico' },
    { label: 'Fundamentales & estimaciones' },
    { label: 'Informes R4' },
  ],

  // Gráfico intradía. La serie son los 7 vértices de la línea del Figma (valores en €, inventados a partir de la forma); las etiquetas del eje Y son las del mobile (precio en €):
  // el desktop del Figma conserva «120K…70K» de otro gráfico (patrimonio).
  grafico: {
    points: [17.1, 18.4, 20.1, 19.9, 20.0, 20.5, 20.49],
    domain: [15, 20.5],
    progress: 0.607,
    yLabels: ['20,0€', '19,0€', '18,0€', '17,0€', '16,0€', '15,0€'],
    xLabels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    periods: [
      { label: '1 día', shortLabel: '1D', value: '1d' },
      { label: '5 días', shortLabel: '5D', value: '5d' },
      { label: '1 mes', shortLabel: '1M', value: '1m' },
      { label: '6 meses', shortLabel: '6M', value: '6m' },
      { label: '2026', shortLabel: '2026', value: 'ytd' },
      { label: '1 año', shortLabel: '1A', value: '1y' },
      { label: '2 años', shortLabel: '2A', value: '2y' },
      { label: 'Todo', shortLabel: 'Todo', value: 'all' },
    ],
  },

  resumen: [
    { concept: 'Tipo de producto', value: 'Acción' },
    { concept: 'Ticker', value: 'IBE' },
    { concept: 'ISIN', value: 'ES0144580Y14' },
    { concept: 'Riesgo', value: '6/6', info: { label: 'Más información sobre el riesgo' } },
    { concept: 'Mercado', value: 'BME', valueIcon: 'flag-spain', action: { icon: 'ic-angle-down', iconPressed: 'ic-angle-up', label: 'Ver el producto en otros mercados' } },
  ],

  derivados: {
    categorias: [
      { id: 'cfds', label: 'CFDs (1)' },
      { id: 'futuros', label: 'Futuros (10)' },
      { id: 'opciones', label: 'Opciones (48)' },
      { id: 'warrants', label: 'Warrants (48)' },
    ],
    items: {
      cfds: [{ name: 'CFD de IBERDROLA', meta: ['Garantía:', '20%'], price: '20,49 €', variation: '-2,56%', tone: 'auto' }],
      futuros: [ // (inventado: el Figma de la acción solo muestra CFDs y opciones)
        { name: 'Futuro Iberdrola Dic-26', meta: ['Vence', '18/12/26'], price: '20,52 €', variation: '+0,6 %', tone: 'muted', action: true },
        { name: 'Futuro Iberdrola Mar-27', meta: ['Vence', '19/03/27'], price: '20,61 €', variation: '+0,5 %', tone: 'muted', action: true },
      ],
      opciones: [
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '4,10 €', variation: '+2,5 %', tone: 'muted', action: true },
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '1,60 €', variation: '-3,1 %', tone: 'muted', action: true },
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '0,45 €', variation: '-8,0 %', tone: 'muted', action: true },
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '1,20 €', variation: '-4,0 %', tone: 'muted', action: true },
      ],
      warrants: [ // (inventado)
        { name: 'Warrant Iberdrola Put 18 €', meta: ['Vence', '20/11/26'], price: '0,32 €', variation: '+1,2 %', tone: 'muted', action: true },
      ],
    },
    verTodos: { opciones: 'Ver todas las opciones' },
  },

  recomendacion: {
    gaugeAngle: 0,
    tag: 'Mantener',
    rows: [
      { concept: 'Precio objetivo', value: '20,10 €' },
      { concept: 'Precio actual', value: '29,27 €' },
      { concept: 'Variación vs. precio actual', value: '-43,2%' },
      { concept: 'Fecha del análisis', value: '15 junio 2026' },
    ],
    cta: 'Ver análisis',
  },

  otrosMercados: [{ logo: 'flag-germany', name: 'XETRA', meta: ['Vol.:', '10.975'], price: '20,47 €', variation: '+0,79%', tone: 'auto' }],
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Controles del gráfico (R4ChartLine): Comparar, Configurar y tipo de gráfico. Figma "Proyectos - Fichas de Productos": desktop sección «Acciones Gráfico (Desktop)» 2813:74279 y
// mobile «Acciones Gráfico (Mobile)» 2816:98718. Los textos y la estructura salen del Figma; TODOS los valores numéricos son de ejemplo (inventados) y se marcan así.
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Velas del gráfico intradía (inventado): 14 velas que siguen la forma de la línea (grafico.points), con subidas y bajadas. Los máximos no pasan de 20,5 (dominio del eje).
const velas = (() => {
  const pts = [17.1, 18.4, 20.1, 19.9, 20.0, 20.5, 20.49]
  const n = 14
  const out = []
  let prev = pts[0]
  for (let i = 0; i < n; i++) {
    const t = ((i + 1) / n) * (pts.length - 1)
    const k = Math.min(Math.floor(t), pts.length - 2)
    const base = pts[k] + (pts[k + 1] - pts[k]) * (t - k)
    const c = +(base + Math.sin(i * 2.3) * 0.18).toFixed(2)
    const o = prev
    const h = +Math.min(Math.max(o, c) + 0.1 + Math.abs(Math.sin(i * 1.7)) * 0.14, 20.5).toFixed(2)
    const l = +(Math.min(o, c) - 0.1 - Math.abs(Math.cos(i * 1.3)) * 0.14).toFixed(2)
    out.push({ o, h, l, c })
    prev = c
  }
  return out
})()

export const graficoControles = {
  ticker: 'IBE', // ticker del producto de la ficha (Resumen), el chip de la serie principal al comparar
  candles: velas,
  // Valores con los que se puede comparar (inventados; el Figma muestra «Prosegur» y «Prosegur Cash» con sus ISIN). `points`: precios de ejemplo en las mismas 7 marcas de tiempo que la serie principal.
  comparables: [
    { name: 'Prosegur', ticker: 'PSG', isin: 'ES0175438003', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoText: 'P', points: [2.48, 2.36, 2.4, 2.37, 2.43, 2.52, 2.47] },
    { name: 'Prosegur Cash', ticker: 'CASH', isin: 'ES0105229001', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoText: 'P', points: [0.58, 0.57, 0.6, 0.59, 0.61, 0.6, 0.62] },
    { name: 'Repsol', ticker: 'REP', isin: 'ES0173516115', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoText: 'R', points: [13.9, 14.2, 14.8, 14.6, 15.1, 15.4, 15.2] },
    { name: 'Telefónica', ticker: 'TEF', isin: 'ES0178430E18', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoText: 'T', points: [3.9, 3.8, 3.95, 3.9, 4.0, 4.1, 4.05] },
    { name: 'Banco Santander', ticker: 'SAN', isin: 'ES0113900J37', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoText: 'S', points: [5.1, 5.25, 5.3, 5.2, 5.4, 5.5, 5.45] },
    { name: 'Inditex', ticker: 'ITX', isin: 'ES0148396007', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoText: 'I', points: [42.1, 43.0, 43.8, 43.2, 44.5, 44.9, 44.6] },
  ],
  // Grupos de «Configuración» (textos del Figma). Los `value` son ids internos.
  configuracion: [
    { id: 'datos', ariaLabel: 'Datos del gráfico', options: [{ label: 'Volumen', value: 'volumen' }, { label: 'Dividendos', value: 'dividendos' }, { label: 'Ajuste de dividendos', value: 'ajuste' }] },
    { id: 'medias', title: 'Medias móviles', options: [{ label: 'MM 50', value: 'mm50' }, { label: 'MM 200', value: 'mm200' }] },
    { id: 'estudios', title: 'Estudios', options: [{ label: 'Bollinger', value: 'bollinger' }, { label: 'MACD', value: 'macd' }, { label: 'RSI', value: 'rsi' }] },
  ],
  // Lo que se pinta por indicador (valores de ejemplo, en € como la serie). Solo la media móvil está diseñada en Figma (recta verde oscura de punta a punta); el resto es interpretación.
  // MACD y RSI son estudios con panel propio: no se dibujan (sin diseño). `span` de bollinger lo pone la pantalla (hasta `grafico.progress`).
  overlays: {
    mm50: { type: 'line', tone: 'average-1', points: [16.6, 18.7] },
    mm200: { type: 'line', tone: 'average-2', points: [15.9, 17.3] },
    bollinger: { type: 'band', tone: 'average-3', upper: [18.3, 19.6, 20.3, 20.45, 20.4, 20.5, 20.5], lower: [15.9, 17.2, 18.0, 18.2, 18.9, 19.4, 19.5] },
    volumen: { type: 'bars', values: [0.5, 0.7, 0.9, 0.6, 0.4, 0.55, 0.45, 0.35, 0.5, 0.4, 0.3, 0.45, 0.6, 0.5] },
    dividendos: { type: 'markers', at: [2, 5] },
  },
}
