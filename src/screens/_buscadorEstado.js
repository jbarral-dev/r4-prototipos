// Auxiliar del prototipo (NO es un componente del sistema): estado y lógica del buscador unificado, variante E (un solo campo decide el modo según lo escrito).
// Reglas del prototipo (para el facilitador):
//  · Mientras se escribe, el modo se calcula en vivo (enrutar) y se ve en el campo (icono + etiqueta) y en el panel (selector + frase «por qué»). No se envía nada hasta pulsar Intro.
//  · Chat: Intro envía la pregunta; el campo sigue siendo la entrada de la conversación (con una conversación abierta el modo es Conversación aunque se escriba una sola palabra).
//  · Resultados: se actualizan mientras se escribe.
//  · Corregir un enrutado: el selector de modo del panel (Resultados | Conversación). Al elegir a mano el modo queda FIJADO hasta vaciar el campo (sin conversación) o cerrar el panel.
//    De Conversación a Resultados, el campo recupera la última pregunta enviada para buscarla.
//  · Se registra cada acción en `log` (y en window.__buscadorLog) para el facilitador.
import { reactive, ref, computed, watch } from '../../vendor/vue.esm-browser.prod.js'
import { enrutar, buscar, responder } from '../data/buscador-unificado.js'

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
  const opciones = reactive({ ejemplos: true, explicacion: true, caption: true })

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

  const abrir = () => { if (!open.value) { open.value = true; anotar('abre panel') } }
  const cerrar = () => { if (open.value) { open.value = false; if (!thread.value.length) locked.value = null; anotar('cierra panel') } }

  const enviar = () => {
    const text = query.value.trim()
    if (!text || pending.value) return
    thread.value.push({ role: 'user', text })
    lastSent.value = text
    query.value = ''
    pending.value = true
    anotar('envía pregunta', text)
    setTimeout(() => { thread.value.push({ role: 'assistant', ...responder(text) }); pending.value = false }, 900)
  }
  const enviarOBuscar = () => {
    if (mode.value === 'chat') enviar()
    else if (query.value.trim()) anotar('intro en resultados', query.value.trim())
  }

  const setMode = (m) => {
    if (m === mode.value) return
    anotar('CORRIGE modo', `${mode.value} → ${m}${query.value ? ` · «${query.value}»` : lastSent.value ? ` · «${lastSent.value}»` : ''}`)
    locked.value = m
    if (m === 'search' && !query.value && lastSent.value) query.value = lastSent.value
  }

  const nuevaConversacion = () => { thread.value = []; lastSent.value = ''; pending.value = false; locked.value = null; anotar('nueva conversación') }
  const usarTexto = (text, origen) => { query.value = text; abrir(); anotar('elige ' + origen, text) }
  const abrirResultado = (name) => { anotar('abre resultado', name); avisar(`Prototipo: se abriría «${name}»`); cerrar() }
  const accion = (link) => {
    anotar('acción del asistente', link.label)
    if (link.toast === '__resultados__') setMode('search')
    else { avisar(`Prototipo: ${link.toast}`); cerrar() }
  }
  const reiniciar = () => { open.value = false; query.value = ''; locked.value = null; thread.value = []; lastSent.value = ''; pending.value = false; toast.value = ''; log.value = []; window.__buscadorLog = [] }

  return reactive({
    open, query, locked, thread, pending, lastSent, toast, log, opciones, ruta, mode, auto, searchTerm, results,
    abrir, cerrar, enviar, enviarOBuscar, setMode, nuevaConversacion, usarTexto, abrirResultado, accion, reiniciar, avisar, anotar,
  })
}
