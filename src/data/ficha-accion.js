// DATOS DE EJEMPLO (prototipo) de la ficha de acción. Precio, variación, hora, precio objetivo y Datos de cotización: de la ficha pública de r4.com (ES0144580Y14/MCO, 2026-11-12). En producción vendrían de backend. Los valores salen de los textos del Figma
// ("Proyectos - Fichas de Productos", frames cl-ficha-accion--dk y ficha-accion--mb); lo que no estaba en el diseño se ha inventado y se marca con «(inventado)».
// Los logos se resuelven respecto a este módulo (no al documento): cada prototipo vive en su propia carpeta
const logo = (f) => new URL('../assets/logos/' + f, import.meta.url).href
import { crearSeriePrincipal, serieComparada } from './_serie-grafico.js'
import { crearCatalogo } from './_catalogo-derivados.js'

export const accion = {
  producto: {
    productName: 'IBERDROLA',
    logoURL: logo('iso-ibe.svg'),
    price: 23.35,
    currency: 'EUR',
    variation: 0.65,
    updated: '17:19h',
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
    { label: 'Resumen' },
    { label: 'Productos relacionados' },
    { label: 'Análisis R4' },
    { label: 'Valoración' },
    { label: 'Dividendos' },
    { label: 'Salud financiera' },
  ],

  // Gráfico: una serie de ejemplo por periodo del selector (generadas en _serie-grafico.js; anclajes: precio 23,35 €, apertura 23,25 € y rentabilidad a 12 meses del ficha pública de r4.com).
  grafico: {
    series: crearSeriePrincipal(23.35, 'IBE'),
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
    catalogo: crearCatalogo(23.35), // todos los productos relacionados (tab «Productos relacionados»): 1 CFD + 10 futuros + 48 opciones + 48 warrants; ejemplo inventado
    categorias: [
      { id: 'cfds', label: 'CFDs (1)', mercado: { name: 'BME', flag: 'flag-spain' } },
      { id: 'futuros', label: 'Futuros (10)', mercado: { name: 'MEFF', flag: 'flag-spain' } },
      { id: 'opciones', label: 'Opciones (48)', mercado: { name: 'MEFF', flag: 'flag-spain' } },
      { id: 'warrants', label: 'Warrants (48)', mercado: { name: 'BME', flag: 'flag-spain' } },
    ],
    items: {
      cfds: [{ name: 'CFD de IBERDROLA', meta: ['Garantía:', '20%'], price: '23,35 €', variation: '-2,56%' }],
      futuros: [ // (inventado: el Figma de la acción solo muestra CFDs y opciones)
        { name: 'Futuro Iberdrola Dic-26', meta: ['Vence', '18/12/26'], price: '20,52 €', variation: '+0,6%', action: true },
        { name: 'Futuro Iberdrola Mar-27', meta: ['Vence', '19/03/27'], price: '20,61 €', variation: '+0,5%', action: true },
      ],
      opciones: [
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '4,10 €', variation: '+2,5%', action: true },
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '1,60 €', variation: '-3,1%', action: true },
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '0,45 €', variation: '-8,0%', action: true },
        { name: 'Iberdrola Call 80 €', meta: ['Vence', '16/10/26'], price: '1,20 €', variation: '-4,0%', action: true },
      ],
      warrants: [ // (inventado)
        { name: 'Warrant Iberdrola Put 18 €', meta: ['Vence', '20/11/26'], price: '0,32 €', variation: '+1,2%', action: true },
      ],
    },
    verTodos: { opciones: 'Ver todas las opciones' },
  },

  // «Datos de cotización» (sustituye al bloque «Recomendación Renta 4», Jon 2026-11-12): valores del bloque homónimo de la ficha pública de IBERDROLA en r4.com (ES0144580Y14/MCO), leída el 2026-11-12.
  cotizacion: [
    { concept: 'Apertura', value: '23,25 €' },
    { concept: 'Rango diario', value: '23,14 - 23,41 €' },
    { concept: 'Volumen', value: '1.889.898' },
    { concept: 'Rango 52 semanas', value: '16,96 - 23,22 €' },
    { concept: 'Rentabilidad 12 meses', value: '35,34%' },
  ],

  // (precio de XETRA inventado, coherente con el de BME)
  otrosMercados: [{ logo: 'flag-germany', name: 'XETRA', meta: ['Vol.:', '10.975'], price: '23,33 €', variation: '+0,79%' }],
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Controles del gráfico (R4ChartLine): Comparar, Configurar y tipo de gráfico. Figma "Proyectos - Fichas de Productos": desktop sección «Acciones Gráfico (Desktop)» 2813:74279 y
// mobile «Acciones Gráfico (Mobile)» 2816:98718. Los textos y la estructura salen del Figma; TODOS los valores numéricos son de ejemplo (inventados) y se marcan así.
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const graficoControles = {
  ticker: 'IBE', // ticker del producto de la ficha (Resumen), el chip de la serie principal al comparar
  // Valores con los que se puede comparar (inventados; el Figma muestra «Prosegur» y «Prosegur Cash» con sus ISIN). `price` (precio actual) y `drift` (deriva relativa de su serie) son de ejemplo; su serie por periodo la genera `pointsFor`.
  // Serie de un valor comparado en un periodo, con el mismo número de puntos que la principal.
  pointsFor: (c, periodo) => serieComparada(periodo, c.price, c.drift, c.ticker),
  comparables: [
    { name: 'Prosegur', ticker: 'PSG', isin: 'ES0175438003', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoSrc: logo('iso-psg.svg'), price: 2.47, drift: 0.1 },
    { name: 'Prosegur Cash', ticker: 'CASH', isin: 'ES0105229001', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoSrc: logo('iso-psg.svg'), price: 0.62, drift: 0.4 },
    { name: 'Repsol', ticker: 'REP', isin: 'ES0173516115', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoSrc: logo('iso-rep.svg'), price: 15.2, drift: 0.7 },
    { name: 'Telefónica', ticker: 'TEF', isin: 'ES0178430E18', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoSrc: logo('iso-tef.svg'), price: 4.05, drift: -0.5 },
    { name: 'Banco Santander', ticker: 'SAN', isin: 'ES0113900J37', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoSrc: logo('iso-san.svg'), price: 5.45, drift: 1.0 },
    { name: 'Inditex', ticker: 'ITX', isin: 'ES0148396007', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', logoSrc: logo('iso-itx.svg'), price: 44.6, drift: 0.6 },
  ],
  // Grupos de «Configuración» (textos del Figma). Los `value` son ids internos.
  configuracion: [
    { id: 'datos', ariaLabel: 'Datos del gráfico', options: [{ label: 'Volumen', value: 'volumen' }, { label: 'Dividendos', value: 'dividendos' }, { label: 'Ajuste de dividendos', value: 'ajuste' }] },
    { id: 'medias', title: 'Medias móviles', options: [{ label: 'MM 50', value: 'mm50' }, { label: 'MM 200', value: 'mm200' }] },
    { id: 'estudios', title: 'Estudios', options: [{ label: 'Bollinger', value: 'bollinger' }, { label: 'MACD', value: 'macd' }, { label: 'RSI', value: 'rsi' }] },
  ],
}

// Variante CAIFE (Figma "Proyectos - Fichas de Productos", sección «Acción - CAIFE (Desktop)» 3369:9753): la acción es elegible para la Cuenta de Ahorro e Inversión Financia Europa.
// Implica: tag «Europa» (R4Tag blue, con borde e icono ic-europe--solid) junto al mercado en el título, y una fila más al final del Resumen («Elegible Cuenta Europa» con botón de
// información + tag «Europa»). El botón de información abre un R4Popover (3369:10004). El texto del enlace «Más información» y su destino no están en el diseño (href de ejemplo).
const tagEuropa = { text: 'Europa', color: 'blue', bordered: true, icon: 'ic-europe--solid' }
export const accionCaife = {
  ...accion,
  producto: { ...accion.producto, showTagCaife: true },
  resumen: [...accion.resumen, { concept: 'Elegible Cuenta Europa', value: 'Europa', tag: tagEuropa, info: { label: 'Más información sobre la Cuenta Europa (CAIFE)' } }],
  caife: {
    concept: 'Elegible Cuenta Europa',
    title: 'Elegible Cuenta Europa',
    intro: 'Este producto cumple los requisitos para incluirse la ',
    introStrong: 'Cuenta de Ahorro e Inversión Financia Europa (CAIFE)',
    description: 'Se trata de una cuenta para invertir a largo plazo en activos europeos.',
    linkText: 'Más información',
    linkHref: '#', // (inventado)
  },
}
