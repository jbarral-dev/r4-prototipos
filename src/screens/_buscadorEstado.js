// Auxiliar del prototipo (NO es un componente del sistema): estado y lógica del buscador unificado, variante E (un solo campo decide el modo según lo escrito).
// Reglas del prototipo (para el facilitador):
//  · Mientras se escribe, el modo se calcula en vivo (enrutar) y se ve en el campo (icono + etiqueta) y en el panel (selector + frase «por qué»). No se envía nada hasta pulsar Intro.
//  · Chat: Intro envía la pregunta; el campo sigue siendo la entrada de la conversación (con una conversación abierta el modo es Conversación aunque se escriba una sola palabra).
//  · Resultados: se actualizan mientras se escribe.
//  · Corregir un enrutado: el selector de modo del panel (Resultados | Conversación). Al elegir a mano el modo queda FIJADO hasta vaciar el campo (sin conversación) o cerrar el panel.
//    De Conversación a Resultados, el campo recupera la última pregunta enviada para buscarla.
//  · Se registra cada acción en `log` (y en window.__buscadorLog) para el facilitador.
import { reactive, ref, computed, watch } from '../../vendor/vue.esm-browser.prod.js'
import { enrutar, buscar, responder, norm, populares, ejemplosPregunta } from '../data/buscador-unificado.js'

export function crearEstado() {
  const t0 = Date.now()
  const open = ref(false)
  const query = ref('')
  const locked = ref(null) // 'search' | 'chat' | null: modo elegido a mano
  const thread = ref([]) // { role: 'user' | 'assistant', text, links? }
  const pending = ref(false)
  const lastSent = ref('')
  const toast = ref('')
  const log = ref([])
  // Historial del usuario (sobrevive a cerrar el panel): búsquedas hechas y conversaciones con el asistente. Vacío = usuario que aún no ha interactuado.
  const historial = reactive({ busquedas: [], conversaciones: [] })
  let convActual = null // conversación del historial que se está pintando (los mensajes nuevos se añaden a ella)
  let gen = 0 // se incrementa al reiniciar el panel: descarta la respuesta del asistente que llegue tarde
  const opciones = reactive({ ejemplos: true, caption: true })

  const ruta = computed(() => enrutar(query.value))
  const mode = computed(() => locked.value || (thread.value.length ? 'chat' : ruta.value.mode)) // null = campo vacío sin conversación
  const searchTerm = computed(() => query.value.trim() || lastSent.value)
  const results = computed(() => buscar(searchTerm.value))
  const auto = computed(() => !locked.value && !thread.value.length && !!ruta.value.mode)

  const anotar = (evento, detalle = '') => {
    const row = { t: ((Date.now() - t0) / 1000).toFixed(1), evento, detalle }
    log.value.push(row)
    ;(window.__buscadorLog = window.__buscadorLog || []).push(row)
  }
  let toastTimer
  const avisar = (msg) => { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 2600) }

  watch(query, (q, prev) => {
    if (!q && !thread.value.length) locked.value = null
    if (q && !prev) anotar('escribe', '')
  })
  watch(mode, (m, prev) => { if (m !== prev && m) anotar('modo', `${m}${auto.value ? ' (automático: ' + ruta.value.nota + ')' : locked.value ? ' (fijado)' : ''}`) })

  // Estado inicial del panel (campo vacío, sin modo ni conversación). Lo usan «Borrar», vaciar el campo y cerrar la capa.
  const limpiar = () => { gen++; query.value = ''; locked.value = null; thread.value = []; convActual = null; lastSent.value = ''; pending.value = false }
  // Cambios del campo hechos por el usuario (enviar() vacía `query` sin pasar por aquí, para no perder la conversación)
  const escribir = (v) => { if (v) query.value = v; else { limpiar(); anotar('vacía el campo') } }

  const abrir = () => { if (!open.value) { open.value = true; anotar('abre panel') } }
  const cerrar = () => { if (open.value) { open.value = false; limpiar(); anotar('cierra panel') } }

  const enviar = () => {
    const text = query.value.trim()
    if (!text || pending.value) return
    if (!convActual) { convActual = { titulo: text, thread: thread.value }; historial.conversaciones.unshift(convActual); historial.conversaciones.splice(3) }
    thread.value.push({ role: 'user', text })
    lastSent.value = text
    query.value = ''
    pending.value = true
    anotar('envía pregunta', text)
    const g = gen
    const th = thread.value // si el panel se reinicia antes de que conteste, la respuesta se guarda igualmente en su conversación del historial
    setTimeout(() => { th.push({ role: 'assistant', ...responder(text) }); if (g === gen) pending.value = false }, 900)
  }
  const enviarOBuscar = () => {
    if (mode.value === 'chat') enviar()
    else if (query.value.trim()) { anotar('intro en resultados', query.value.trim()); if (results.value.length) registrarBusqueda(query.value.trim()) }
  }

  const setMode = (m) => {
    if (m === mode.value) return
    anotar('CORRIGE modo', `${mode.value} → ${m}${query.value ? ` · «${query.value}»` : lastSent.value ? ` · «${lastSent.value}»` : ''}`)
    locked.value = m
    if (m === 'search' && !query.value && lastSent.value) query.value = lastSent.value
  }

  const nuevaConversacion = () => { gen++; thread.value = []; convActual = null; lastSent.value = ''; pending.value = false; locked.value = null; anotar('nueva conversación') }
  const usarTexto = (text, origen) => { query.value = text; abrir(); anotar('elige ' + origen, text) }
  const registrarBusqueda = (term) => { const k = norm(term); historial.busquedas = [term, ...historial.busquedas.filter((b) => norm(b) !== k)].slice(0, 4) }
  // Chip de «Búsquedas»: lleva a la ficha del primer resultado de esa búsqueda
  const abrirBusqueda = (term) => { anotar('elige búsqueda', term); registrarBusqueda(term); const r = buscar(term)[0]; abrirResultado(r ? r.name : term) }
  // Fila de «Preguntas»: con historial se pinta la conversación completa; sin historial se abre una conversación nueva con la pregunta ya formulada
  const abrirConversacion = (conv) => { gen++; query.value = ''; locked.value = null; convActual = conv; thread.value = conv.thread; lastSent.value = ([...conv.thread].reverse().find((m) => m.role === 'user') || {}).text || ''; pending.value = false; anotar('abre conversación del historial', conv.titulo) }
  const preguntar = (texto) => { limpiar(); query.value = texto; anotar('elige pregunta de ejemplo', texto); enviar() }
  const abrirResultado = (name) => { if (query.value.trim()) registrarBusqueda(query.value.trim()); anotar('abre resultado', name); avisar(`Prototipo: se abriría «${name}»`); cerrar() }
  const accion = (link) => {
    anotar('acción del asistente', link.label)
    if (link.toast === '__resultados__') setMode('search')
    else { avisar(`Prototipo: ${link.toast}`); cerrar() }
  }
  const reiniciar = () => { open.value = false; toast.value = ''; log.value = []; window.__buscadorLog = []; cargarEstado('nuevo') }
  // Los dos estados de partida del prototipo: usuario que aún no ha interactuado · usuario con búsquedas y conversaciones previas
  const conversacionEjemplo = (q) => ({ titulo: q, thread: [{ role: 'user', text: q }, { role: 'assistant', ...responder(q) }] })
  const cargarEstado = (tipo) => {
    limpiar()
    historial.busquedas = tipo === 'historial' ? ['Telefónica', 'Iberdrola'] : []
    historial.conversaciones = tipo === 'historial' ? [conversacionEjemplo('¿Cómo funcionan los planes de pensiones?'), conversacionEjemplo('¿Puedo invertir en Fidelity de renta variable europea?')] : []
    anotar('estado de partida', tipo)
  }
  if (new URLSearchParams(location.search).get('u') === 'historial') cargarEstado('historial')

  return reactive({
    open, query, locked, thread, pending, lastSent, toast, log, opciones, historial, populares, ejemplosPregunta, ruta, mode, auto, searchTerm, results,
    abrir, cerrar, limpiar, escribir, enviar, enviarOBuscar, setMode, nuevaConversacion, usarTexto, abrirResultado, abrirBusqueda, abrirConversacion, preguntar, cargarEstado, accion, reiniciar, avisar, anotar,
  })
}
