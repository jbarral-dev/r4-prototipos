// DATOS DE PROTOTIPO (no reales): buscador unificado, variante E (un solo campo decide el modo). Plan de investigación «fusionar buscador y chat en r4.com».
// El enrutado es una SIMULACIÓN con casos fijados de antemano (el plan dice: se evalúa el concepto, no la regla; en producto sería una clasificación de intención).
// Para cambiar un caso, edita `casosFijos`. Los dos casos de enrutado FALLIDO a propósito llevan `fallo: true` (el plan pide incluir dos).

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
export const catalogo = [
  { kind: 'valor', name: 'Telefónica', meta: ['Acción', 'BME', 'ES0178430E18'], price: '4,12 €', variation: '+0,85 %', keys: ['telefonica', 'accion', 'acciones'] },
  { kind: 'valor', name: 'Telefónica Deutschland', meta: ['Acción', 'XETRA'], price: '2,38 €', variation: '−0,21 %', keys: ['telefonica'] },
  { kind: 'valor', name: 'Iberdrola', meta: ['Acción', 'BME', 'ES0144580Y14'], price: '13,64 €', variation: '+1,12 %', keys: ['iberdrola', 'accion', 'acciones'] },
  { kind: 'valor', name: 'Banco Santander', meta: ['Acción', 'BME'], price: '4,87 €', variation: '+0,32 %', keys: ['santander', 'accion', 'acciones'] },
  { kind: 'fondo', name: 'Fidelity European Growth Fund', meta: ['Fondo', 'Renta variable europea', 'LU0296857971'], price: '28,41 €', variation: '+0,44 %', keys: ['fidelity', 'fondo', 'fondos', 'europa', 'europeo', 'renta variable'] },
  { kind: 'fondo', name: 'Fidelity World Fund', meta: ['Fondo', 'Renta variable global'], price: '19,07 €', variation: '+0,18 %', keys: ['fidelity', 'fondo', 'fondos', 'global'] },
  { kind: 'fondo', name: 'Renta 4 Pegasus', meta: ['Fondo', 'Renta variable mixta'], price: '16,92 €', variation: '+0,06 %', keys: ['pegasus', 'fondo', 'fondos', 'renta 4'] },
  { kind: 'fondo', name: 'Plan de pensiones Renta 4 Jubilación', meta: ['Plan de pensiones'], price: '12,30 €', variation: '+0,10 %', keys: ['jubilacion', 'pensiones', 'plan de pensiones', 'ahorro'] },
  { kind: 'ayuda', name: '¿Cómo abrir una cuenta en Renta 4?', meta: ['Centro de ayuda'], keys: ['cuenta', 'abrir', 'alta', 'cliente'] },
  { kind: 'ayuda', name: 'Comisiones de custodia y de mantenimiento', meta: ['Centro de ayuda'], keys: ['comisiones', 'custodia', 'tarifas'] },
  { kind: 'ayuda', name: 'No me llega el código de verificación al móvil', meta: ['Centro de ayuda'], keys: ['codigo', 'sms', 'movil', 'verificacion', 'firma'] },
  { kind: 'ayuda', name: 'Guía: ahorrar para la jubilación', meta: ['Centro de ayuda'], keys: ['jubilacion', 'ahorro', 'pensiones'] },
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
export const recientes = ['Telefónica', 'Fidelity']
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
  },
  {
    match: (t) => t.includes('capital riesgo'),
    text: 'Los fondos de capital riesgo requieren un perfil de inversor con experiencia y un mínimo elevado. Con tu perfil actual podrías acceder a algunos de ellos.',
    links: [{ label: 'Revisar mi perfil', toast: 'Perfil de inversor' }],
  },
]
const respuestaPorDefecto = {
  text: 'Esta es una respuesta de ejemplo del prototipo: el asistente real contestaría aquí. ¿Quieres que te muestre resultados relacionados?',
  links: [{ label: 'Ver resultados', toast: '__resultados__' }],
}

export function responder(texto) {
  const t = norm(texto)
  return respuestas.find((r) => r.match(t)) || respuestaPorDefecto
}
