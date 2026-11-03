// Auxiliar del prototipo (NO es un componente del sistema): estado y lógica del buscador unificado, variante F (conversación primero).
// Reglas del prototipo (para el facilitador):
//  · No hay pestañas ni modo elegido: el panel es SIEMPRE una conversación. Cada mensaje del usuario se enruta (enrutar) y la respuesta del asistente es de uno de dos tipos:
//      texto (pregunta o frase → respuesta guionizada) · resultados (nombre o palabra concreta con coincidencias → lista de _SearchResultItem dentro de la conversación).
//    Una respuesta de texto puede ofrecer «Ver resultados». Una búsqueda sin coincidencias se contesta con texto.
//  · Intro envía. «Nueva conversación» abre un chat en blanco; la anterior queda en el historial (se registra al enviar su primer mensaje) y se recupera desde «Historial».
//  · Al cerrar el panel la conversación en curso se cierra (sigue en el historial); al abrirlo vuelve el saludo inicial. El historial dura lo que la sesión del prototipo.
//  · Se registra cada acción en `log` (y en window.__buscadorLog) para el facilitador.
import { reactive, ref } from '../../vendor/vue.esm-browser.prod.js'
import { enrutar, buscar, responder } from '../data/buscador-unificado.js'

export function crearEstadoChat() {
  const t0 = Date.now()
  const open = ref(false)
  const prompt = ref('')
  const thread = ref([]) // { id, role: 'user' | 'assistant', kind: 'text' | 'results', text, links?, term?, items? }
  const pending = ref(false)
  const vista = ref('chat') // 'chat' | 'historial'
  const nueva = ref(false) // chat en blanco abierto con «Nueva conversación»: otro saludo
  const conversaciones = ref([]) // historial: { id, titulo, thread } (la más reciente primero)
  const toast = ref('')
  const log = ref([])
  let actual = null // conversación del historial que se está pintando (los mensajes nuevos se añaden a ella)
  let gen = 0 // se incrementa al cambiar de conversación o reiniciar: descarta el «escribiendo» de la respuesta que llegue tarde
  let seq = 0

  const anotar = (evento, detalle = '') => {
    const row = { t: ((Date.now() - t0) / 1000).toFixed(1), evento, detalle }
    log.value.push(row)
    ;(window.__buscadorLog = window.__buscadorLog || []).push(row)
  }
  let toastTimer
  const avisar = (msg) => { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 2600) }

  const limpiar = () => { gen++; prompt.value = ''; thread.value = []; actual = null; pending.value = false; nueva.value = false; vista.value = 'chat' }
  const abrir = () => { if (!open.value) { open.value = true; anotar('abre panel') } }
  const cerrar = () => { if (open.value) { open.value = false; limpiar(); anotar('cierra panel') } }

  // La respuesta llega tras una breve espera (la de texto simula al asistente; los resultados, casi inmediatos). Se guarda en SU conversación aunque el usuario cambie de chat mientras tanto.
  const contestar = (turno, ms) => {
    pending.value = true
    const g = gen
    const th = thread.value
    setTimeout(() => { th.push({ id: ++seq, role: 'assistant', ...turno }); if (g === gen) pending.value = false }, ms)
  }
  const turnoResultados = (term) => {
    const items = buscar(term)
    if (!items.length) return { kind: 'text', text: `No he encontrado nada para «${term}». Cuéntame un poco más de lo que necesitas y te ayudo.` }
    return { kind: 'results', term, items }
  }

  const enviar = (texto) => {
    const text = (texto ?? prompt.value).trim()
    if (!text || pending.value) return
    prompt.value = ''
    nueva.value = false
    if (!actual) { actual = { id: ++seq, titulo: text, thread: thread.value }; conversaciones.value.unshift(actual) }
    thread.value.push({ id: ++seq, role: 'user', kind: 'text', text })
    const ruta = enrutar(text)
    anotar('envía', `«${text}» → ${ruta.mode === 'search' ? 'resultados' : 'texto'}${ruta.fallo ? ' (fallo a propósito)' : ''}`)
    if (ruta.mode === 'search') contestar(turnoResultados(text), 350)
    else contestar({ kind: 'text', ...responder(text) }, 900)
  }
  const verResultados = (term) => { anotar('texto → resultados', term); contestar(turnoResultados(term), 350) }

  // Conversaciones: nueva (la actual queda en el historial) · abrir una del historial
  const nuevaConversacion = () => {
    anotar('nueva conversación')
    gen++; thread.value = []; actual = null; pending.value = false; prompt.value = ''
    nueva.value = true; vista.value = 'chat'
  }
  const abrirConversacion = (c) => {
    anotar('abre conversación del historial', c.titulo)
    gen++; actual = c; thread.value = c.thread; pending.value = false; prompt.value = ''
    nueva.value = false; vista.value = 'chat'
  }
  const verHistorial = () => { anotar('abre historial'); vista.value = 'historial' }
  const volverAlChat = () => { vista.value = 'chat' }

  const abrirResultado = (name) => { anotar('abre resultado', name); avisar(`Prototipo: se abriría «${name}»`); cerrar() }
  const accion = (link) => {
    anotar('acción del asistente', link.label)
    if (link.toast === '__resultados__') { const q = [...thread.value].reverse().find((m) => m.role === 'user'); verResultados(q ? q.text : '') }
    else { avisar(`Prototipo: ${link.toast}`); cerrar() }
  }
  const usarTexto = (text, origen) => { abrir(); anotar('elige ' + origen, text); enviar(text) }

  // Dos estados de partida: historial vacío (usuario que aún no ha conversado) o con conversaciones previas
  const conversacionEjemplo = (q) => ({ id: ++seq, titulo: q, thread: [{ id: ++seq, role: 'user', kind: 'text', text: q }, { id: ++seq, role: 'assistant', kind: 'text', ...responder(q) }] })
  const cargarEstado = (tipo) => {
    limpiar()
    conversaciones.value = tipo === 'historial' ? [conversacionEjemplo('¿Cómo funcionan los planes de pensiones?'), conversacionEjemplo('No me llega el código al móvil'), conversacionEjemplo('¿Qué necesito para abrir una cuenta?')] : []
    anotar('estado de partida', tipo)
  }
  const reiniciar = () => { open.value = false; toast.value = ''; log.value = []; window.__buscadorLog = []; cargarEstado('nuevo') }
  if (new URLSearchParams(location.search).get('u') === 'historial') cargarEstado('historial')

  return reactive({
    open, prompt, thread, pending, vista, nueva, conversaciones, toast, log,
    abrir, cerrar, limpiar, enviar, verResultados, nuevaConversacion, abrirConversacion, verHistorial, volverAlChat, abrirResultado, accion, usarTexto, cargarEstado, reiniciar, avisar, anotar,
  })
}
