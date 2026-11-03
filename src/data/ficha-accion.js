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
      { label: 'Invertir', href: '#' },
      { label: 'Bolsas', href: '#' },
      { label: 'Bolsa Nacional', href: '#' },
      { label: 'IBERDROLA' }, // sin href = página actual
    ],
    ctaText: 'Contratar',
    // En la doc de R4PageTitleProduct la única acción restante de Acciones es «Configurar tiempo real»
    secondaryActions: [{ label: 'Configurar tiempo real', icon: 'ic-clock', showLink: false }],
  },

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
