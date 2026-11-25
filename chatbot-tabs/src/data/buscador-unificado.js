// DATOS DE PROTOTIPO (no reales): buscador unificado, variante E (un solo campo decide el modo). Plan de investigación «fusionar buscador y chat en r4.com».
// El enrutado es una SIMULACIÓN con casos fijados de antemano (el plan dice: se evalúa el concepto, no la regla; en producto sería una clasificación de intención).
// Para cambiar un caso, edita `casosFijos`. Los dos casos de enrutado FALLIDO a propósito llevan `fallo: true` (el plan pide incluir dos).

// Los logos se resuelven respecto a este módulo (no al documento): cada prototipo vive en su propia carpeta
const logo = (f) => new URL('../assets/logos/' + f, import.meta.url).href

export const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim()

// Casos fijados: texto normalizado → modo. `nota` explica el caso al facilitador.
export const casosFijos = {
  telefonica: { mode: 'search', nota: 'Nombre de valor: resultados (tarea 4)' },
  fidelity: { mode: 'search', nota: 'Nombre de gestora: resultados' },
  iberdrola: { mode: 'search', nota: 'Nombre de valor: resultados' },
  // Fallo 1 (a propósito): una palabra ambigua. Decisión provisional: las palabras ambiguas van a RESULTADOS (el modo «seguro» para quien busca algo concreto);
  // quien quería orientación debe darse cuenta y cambiar a Conversación.
  jubilacion: { mode: 'search', fallo: true, nota: 'FALLO a propósito: palabra ambigua → resultados; el usuario de la tarea 7 quería orientación' },
  comisiones: { mode: 'search', fallo: true, nota: 'FALLO a propósito: palabra ambigua → resultados; el usuario quizá quería preguntar' },
  // Fallo 2 (a propósito): nombre de producto largo que el heurístico trataría como frase → conversación.
  'fondo fidelity renta variable europea': { mode: 'chat', fallo: true, nota: 'FALLO a propósito: es un producto (tarea 1) y se envía a conversación' },
}

const interrogativas = ['que', 'como', 'cual', 'cuales', 'cuanto', 'cuando', 'donde', 'por que', 'puedo', 'podria', 'quiero', 'necesito', 'tengo', 'me ', 'no me', 'hay ', 'es ', 'se puede']

// Heurístico para lo no fijado: pregunta o frase (≥ 4 palabras, «?» o arranque interrogativo/en primera persona) → conversación; palabra o nombre corto → resultados.
export function enrutar(texto) {
  const t = norm(texto)
  if (!t) return { mode: null, nota: '' }
  if (casosFijos[t]) return { ...casosFijos[t], fijo: true }
  const palabras = t.split(' ').length
  const pregunta = /[?¿]/.test(texto) || interrogativas.some((p) => t === p.trim() || t.startsWith(p)) || palabras >= 4
  return pregunta ? { mode: 'chat', nota: 'Heurístico: parece una pregunta o una frase' } : { mode: 'search', nota: 'Heurístico: parece un nombre o una palabra' }
}

// ── Catálogo de resultados (modo Resultados) ──
// Campos según el componente searchResultItem de Figma: name, metadata1 (ticker), metadata2 (ISIN o vencimiento), market + marketFlag (icono de bandera), type (etiqueta), logoText (inicial: el logo real no es un asset disponible).
// Logos: iso-* de «Resources - Logos» (Figma YGLS4oEvLsYd8H13Kfylx5, página Isos). Fidelity no está en ese recurso: se queda la inicial (logoText).
// DATOS DE EJEMPLO: ISIN, tickers, mercados y vencimientos son ilustrativos, no reales.
export const catalogo = [
  { kind: 'valor', name: 'Telefónica', logoSrc: logo('iso-tef.svg'), metadata1: 'TEF', metadata2: 'ES0178430E18', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', keys: ['telefonica', 'accion', 'acciones'] },
  { kind: 'valor', name: 'Telefónica', logoSrc: logo('iso-tef.svg'), metadata1: 'O2D', metadata2: 'DE000A1J5RX9', market: 'XETRA', marketFlag: 'flag-germany', type: 'Acción', keys: ['telefonica', 'accion', 'acciones'] },
  { kind: 'valor', name: 'Telefónica', logoSrc: logo('iso-tef.svg'), metadata1: 'TEF', metadata2: 'Garantía 20 %', market: 'MEFF', marketFlag: 'flag-spain', type: 'CFD', keys: ['telefonica', 'cfd'] },
  { kind: 'valor', name: 'Futuro Telefónica', logoSrc: logo('iso-tef.svg'), metadata2: 'Mar 2027 · Entregas', market: 'MEFF', marketFlag: 'flag-spain', type: 'Futuro', keys: ['telefonica', 'futuro', 'futuros'] },
  { kind: 'valor', name: 'Futuro Telefónica', logoSrc: logo('iso-tef.svg'), metadata2: 'Jun 2027 · Diferencia', market: 'MEFF', marketFlag: 'flag-spain', type: 'Futuro', keys: ['telefonica', 'futuro', 'futuros'] },
  { kind: 'valor', name: 'Iberdrola', logoSrc: logo('iso-ibe.svg'), metadata1: 'IBE', metadata2: 'ES0144580Y14', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', keys: ['iberdrola', 'accion', 'acciones'] },
  { kind: 'valor', name: 'Iberdrola', logoSrc: logo('iso-ibe.svg'), metadata1: 'IBE', metadata2: 'Garantía 20 %', market: 'MEFF', marketFlag: 'flag-spain', type: 'CFD', keys: ['iberdrola', 'cfd'] },
  { kind: 'valor', name: 'Futuro Iberdrola', logoSrc: logo('iso-ibe.svg'), metadata2: 'Mar 2027 · Entregas', market: 'MEFF', marketFlag: 'flag-spain', type: 'Futuro', keys: ['iberdrola', 'futuro', 'futuros'] },
  { kind: 'valor', name: 'Banco Santander', logoSrc: logo('iso-san.svg'), metadata1: 'SAN', metadata2: 'ES0113900J37', market: 'BME', marketFlag: 'flag-spain', type: 'Acción', keys: ['santander', 'accion', 'acciones'] },
  { kind: 'fondo', name: 'Fidelity European Growth Fund', logoText: 'F', metadata1: 'Renta variable europea', metadata2: 'LU0296857971', type: 'Fondo', keys: ['fidelity', 'fondo', 'fondos', 'europa', 'europeo', 'renta variable'] },
  { kind: 'fondo', name: 'Fidelity World Fund', logoText: 'F', metadata1: 'Renta variable global', metadata2: 'LU0346388373', type: 'Fondo', keys: ['fidelity', 'fondo', 'fondos', 'global'] },
  { kind: 'fondo', name: 'Renta 4 Pegasus', logoSrc: logo('iso-r4.svg'), metadata1: 'Renta variable mixta', metadata2: 'ES0173319115', type: 'Fondo', keys: ['pegasus', 'fondo', 'fondos', 'renta 4'] },
  { kind: 'fondo', name: 'Plan de pensiones Renta 4 Jubilación', logoSrc: logo('iso-r4.svg'), metadata1: 'Plan de pensiones', metadata2: 'N5012', type: 'Plan de pensiones', keys: ['jubilacion', 'pensiones', 'plan de pensiones', 'ahorro'] },
  // Tipos añadidos según la tabla de la documentación (Confluence 4095606798 §3.3): logo, código y mercado por tipo. El «código» de Futuro es «vencimiento, tipo de contrato» (Entregas | Diferencia); el de Opción, «vencimiento, strike» (en €); el de CFD, «garantía» (metadata2). Datos de EJEMPLO. Logos de cripto: «Resources - Cryptocurrency Logos» (Figma 8jbsiGYTKPZ8nf8le8wKgt). Sin logo (gestoras de ETF, bonos del Estado, índices) se pinta la ficha con iniciales.
  { kind: 'valor', name: 'Santander Ibex 35 ETF', logoSrc: logo('iso-san.svg'), metadata1: 'SANIBEX', metadata2: 'ES0105046009', market: 'BME', marketFlag: 'flag-spain', type: 'ETF', keys: ['santander', 'etf', 'etfs', 'ibex'] },
  { kind: 'valor', name: 'Bono Santander 2030', logoSrc: logo('iso-san.svg'), metadata1: 'Renta fija privada', metadata2: 'XS2345678901', type: 'Renta fija', keys: ['santander', 'bono', 'bonos', 'renta fija'] },
  { kind: 'valor', name: 'Letras del Tesoro 12 meses', logoText: 'LT', metadata1: 'Renta fija pública', metadata2: 'ES0000012L78', type: 'Renta fija', keys: ['letras', 'tesoro', 'bono', 'bonos', 'renta fija'] },
  { kind: 'valor', name: 'Bitcoin', logoSrc: logo('crypto-btc.svg'), metadata1: 'BTC', type: 'Cripto', keys: ['bitcoin', 'btc', 'cripto', 'criptomonedas'] },
  { kind: 'valor', name: 'Ethereum', logoSrc: logo('crypto-eth.svg'), metadata1: 'ETH', type: 'Cripto', keys: ['ethereum', 'eth', 'cripto', 'criptomonedas'] },
  { kind: 'valor', name: 'Opción Telefónica', logoSrc: logo('iso-tef.svg'), metadata2: 'Jun 2027 · 4,00 €', market: 'MEFF', marketFlag: 'flag-spain', type: 'Opción', keys: ['telefonica', 'opcion', 'opciones'] },
  { kind: 'valor', name: 'Opción Ibex 35', logoText: 'IB', metadata2: 'Jun 2027 · 12.000 €', market: 'MEFF', marketFlag: 'flag-spain', type: 'Opción', keys: ['ibex', 'opcion', 'opciones'] },
  { kind: 'ayuda', name: '¿Cómo abrir una cuenta en Renta 4?', metadata1: 'Centro de ayuda', type: 'Ayuda', keys: ['cuenta', 'abrir', 'alta', 'cliente'] },
  { kind: 'ayuda', name: 'Comisiones de custodia y de mantenimiento', metadata1: 'Centro de ayuda', type: 'Ayuda', keys: ['comisiones', 'custodia', 'tarifas'] },
  { kind: 'ayuda', name: 'No me llega el código de verificación al móvil', metadata1: 'Centro de ayuda', type: 'Ayuda', keys: ['codigo', 'sms', 'movil', 'verificacion', 'firma'] },
  { kind: 'ayuda', name: 'Guía: ahorrar para la jubilación', metadata1: 'Centro de ayuda', type: 'Ayuda', keys: ['jubilacion', 'ahorro', 'pensiones'] },
]

export function buscar(texto) {
  const t = norm(texto)
  if (!t) return []
  const tokens = t.split(' ').filter((w) => w.length > 3 && !['renta', 'variable', 'fondo', 'fondos', 'para', 'como', 'unos', 'esta'].includes(w))
  return catalogo.filter((it) => {
    const nombre = norm(it.name)
    return nombre.includes(t) || it.keys.some((k) => t.includes(k) || k.includes(t)) || tokens.some((w) => nombre.includes(w) || it.keys.includes(w))
  })
}

// ── Estado vacío ──
export const populares = ['Telefónica', 'Santander', 'Iberdrola', 'Fidelity'] // búsquedas populares: se muestran a quien aún no ha buscado nada
export const ejemplosPregunta = [
  '¿Qué necesito para abrir una cuenta?',
  '¿Cómo funcionan los planes de pensiones?',
  'No me llega el código al móvil',
]

// ── Respuestas de la conversación (GUIONIZADAS: idénticas en todas las condiciones; no se evalúa la calidad de la IA) ──
const respuestas = [
  {
    match: (t) => t.includes('fidelity') && (t.includes('europ') || t.includes('renta variable')),
    text: 'Sí. Puedes invertir en el Fidelity European Growth Fund desde Renta 4, en tu cuenta de valores. Tiene una inversión mínima de 1.000 € y su riesgo es 6 sobre 7.',
    links: [{ label: 'Ver ficha del fondo', toast: 'Ficha de Fidelity European Growth Fund' }],
  },
  {
    match: (t) => t.includes('abrir una cuenta') || t.includes('pasarte') || t.includes('empezar') || t.includes('tener a mano') || t.includes('alta'),
    text: 'Para darte de alta necesitas tu DNI o NIE en vigor, un móvil para recibir un código de verificación y tu número de cuenta de otro banco. Son unos 10 minutos.',
    links: [{ label: 'Empezar el alta', toast: 'Inicio del alta de cuenta' }],
  },
  {
    match: (t) => t.includes('codigo') || t.includes('sms'),
    text: 'Comprueba que tienes cobertura y que tu número de móvil está actualizado. Si pasados 2 minutos no llega, puedes pedir un nuevo código o hablar con una persona del equipo.',
    links: [{ label: 'Pedir un nuevo código', toast: 'Nuevo código solicitado' }, { label: 'Hablar con una persona', toast: 'Contacto con una persona del equipo' }],
  },
  {
    match: (t) => t.includes('jubilacion') || t.includes('pension') || t.includes('ahorr'),
    text: 'Tienes tres formas habituales: planes de pensiones (ventaja fiscal, dinero poco líquido), fondos de inversión (flexibles y traspasables) y planes de ahorro sistemáticos (aportaciones periódicas). ¿Quieres ver alguno en concreto?',
    links: [{ label: 'Ver planes de pensiones', toast: 'Listado de planes de pensiones' }, { label: 'Ver fondos de inversión', toast: 'Listado de fondos' }],
    // Enfoque buscador: los enlaces van como lista de R4Link con viñetas (el Enfoque chat sigue usando `links`)
    lista: [{ label: 'Ver planes de pensiones', toast: 'Listado de planes de pensiones' }, { label: 'Ver fondos de inversión', toast: 'Listado de fondos' }, { label: 'Ver planes de ahorro sistemático', toast: 'Listado de planes de ahorro' }],
  },
  {
    match: (t) => t.includes('capital riesgo'),
    text: 'Los fondos de capital riesgo requieren un perfil de inversor con experiencia y un mínimo elevado. Con tu perfil actual podrías acceder a algunos de ellos.',
    links: [{ label: 'Revisar mi perfil', toast: 'Perfil de inversor' }],
  },
]
const respuestaPorDefecto = {
  text: 'Esta es una respuesta de ejemplo del prototipo: el asistente real contestaría aquí. ¿Quieres que te muestre resultados relacionados?',
  links: [{ label: 'Ver resultados', toast: '__resultados__' }], // solo el Enfoque chat (su panel de resultados propio)
}
// Respuesta genérica del Enfoque buscador: un enlace lleva directo a su URL y un listado de productos va como lista de resultados (_SearchResultItem), nunca un enlace «Ver resultados» (Jon, 2026-11-22)
const respuestaGenerica = (t) => {
  const afines = buscar(t).filter((r) => r.kind === 'valor').slice(0, 3)
  return { text: 'Esta es una respuesta de ejemplo del prototipo: el asistente real contestaría aquí. Estos son algunos productos que pueden interesarte:', resultados: afines.length ? afines : ['Telefónica', 'Iberdrola', 'Banco Santander'].map((n) => catalogo.find((r) => r.type === 'Acción' && r.name === n)) }
}

export function responder(texto, enfoque = 'buscador') {
  const t = norm(texto)
  return respuestas.find((r) => r.match(t)) || (enfoque === 'chat' ? respuestaPorDefecto : respuestaGenerica(texto))
}

// ── Respuestas de demostración (panel Facilitador · bloque «Conversación») ──
// Un enlace · varios enlaces (lista con viñetas) · resultados (searchResultItem sin agrupar). Mismo guion en todas las condiciones.
export const preguntasDemo = {
  enlace: '¿Qué necesito para abrir una cuenta?',
  varios: '¿Cómo funcionan los planes de pensiones?',
  resultados: '¿Qué productos de Telefónica puedo contratar?',
}
export function respuestaDemo(tipo) {
  if (tipo === 'varios') return responder(preguntasDemo.varios)
  if (tipo === 'resultados') return { text: 'Estos son los productos de Telefónica que puedes contratar desde Renta 4:', resultados: catalogo.filter((r) => r.name === 'Telefónica') }
  return responder(preguntasDemo.enlace)
}

// ── Histórico de conversaciones de ejemplo (Facilitador «Tiene histórico de conversaciones»): 12 para ver el scroll del listado ──
export const preguntasHistorico = [
  '¿Cómo funcionan los planes de pensiones?',
  '¿Puedo invertir en Fidelity de renta variable europea?',
  '¿Qué necesito para abrir una cuenta?',
  'No me llega el código al móvil',
  '¿Qué comisiones tiene la custodia de valores?',
  '¿Cómo traspaso un plan de pensiones a Renta 4?',
  '¿Puedo contratar ETFs desde la app?',
  '¿Qué diferencia hay entre un fondo y un plan de pensiones?',
  '¿Cómo cambio mi perfil de inversor?',
  '¿Qué es un futuro sobre una acción?',
  '¿Cuándo se cobran los dividendos de Telefónica?',
  '¿Puedo invertir en fondos de capital riesgo?',
]
