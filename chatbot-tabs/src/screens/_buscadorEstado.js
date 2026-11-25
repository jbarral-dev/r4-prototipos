// Auxiliar del prototipo (NO es un componente del sistema): estado y lógica del buscador unificado, variante E (un solo campo decide el modo según lo escrito).
// Reglas del prototipo (para el facilitador):
//  · Mientras se escribe, el modo se calcula en vivo (enrutar) y se ve en el campo (icono + etiqueta) y en el panel (selector + frase «por qué»). No se envía nada hasta pulsar Intro.
//  · Chat: Intro envía la pregunta; el campo sigue siendo la entrada de la conversación (con una conversación abierta el modo es Conversación aunque se escriba una sola palabra).
//  · Resultados: se actualizan mientras se escribe.
//  · Corregir un enrutado: el selector de modo del panel (Resultados | Conversación). Al elegir a mano el modo queda FIJADO hasta vaciar el campo (sin conversación) o cerrar el panel.
//    De Conversación a Resultados, el campo recupera la última pregunta enviada para buscarla.
//  · Se registra cada acción en `log` (y en window.__buscadorLog) para el facilitador.
import { reactive, ref, computed, watch } from '../../vendor/vue.esm-browser.prod.js'
import { enrutar, buscar, responder, respuestaDemo, preguntasDemo, preguntasHistorico, norm, populares, ejemplosPregunta } from '../data/buscador-unificado.js'

export function crearEstado() {
  const t0 = Date.now()
  const open = ref(false)
  const query = ref('')
  const prompt = ref('') // texto del campo de prompt de la conversación (abajo del popover)
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
  const opciones = reactive({ ejemplos: true })
  const desdeListado = ref(false) // el chat abierto viene del listado completo: «Volver» regresa al listado, no al inicio
  const vista = ref('inicio') // 'inicio' (estado inicial) | 'historial' (listado completo de conversaciones: «Ver todas»)
  const historicoOn = ref(false) // Facilitador «Tiene histórico de conversaciones»: 12 conversaciones en lugar de las 2 de ejemplo
  // Mensaje legal: primera burbuja del asistente en el primer chat del usuario nuevo (después viene la pregunta del usuario y la respuesta). `legalVisto`: ya se mostró (o el usuario ya ha usado el chat).
  const legalVisto = ref(false)
  const filtro = ref('todos') // chip de tipo activo en el autocompletado (Todos · Acciones · CFDs · Futuros · Fondos · Centro de ayuda)

  const ruta = computed(() => enrutar(query.value))
  const mode = computed(() => locked.value || (thread.value.length ? 'chat' : ruta.value.mode)) // null = campo vacío sin conversación
  const searchTerm = computed(() => query.value.trim() || lastSent.value)
  const results = computed(() => buscar(searchTerm.value).filter((r) => r.kind !== 'ayuda')) // los enlaces al centro de ayuda no se muestran nunca en los resultados (Jon, 2026-11-20)
  const autocompletar = computed(() => searchTerm.value.trim().length >= 2) // el autocompletado (resultados + filtros) aparece con al menos 2 caracteres
  // Conversación «pintada»: hay mensajes o se eligió la pestaña a mano. Entonces el campo de arriba queda disabled y se escribe en el prompt de abajo.
  const chatView = computed(() => mode.value === 'chat' && (thread.value.length > 0 || locked.value === 'chat'))
  // Acceso al chat desde el buscador (bloque Actions del R4Sheet): visible con el autocompletado y resultados
  // Chat recién abierto sin preguntar aún (p. ej. «Pregunta al asistente» sin texto): el aviso legal se pinta ya, antes del saludo; se guarda en la conversación al enviar la primera pregunta
  const legalPendiente = computed(() => chatView.value && !legalVisto.value && !thread.value.some((m) => m.legal))
  const barra = computed(() => mode.value === 'search' && autocompletar.value && results.value.length > 0)
  const auto = computed(() => !locked.value && !thread.value.length && !!ruta.value.mode)

  const anotar = (evento, detalle = '') => {
    const row = { t: ((Date.now() - t0) / 1000).toFixed(1), evento, detalle }
    log.value.push(row)
    ;(window.__buscadorLog = window.__buscadorLog || []).push(row)
  }
  let toastTimer
  const avisar = (msg) => { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 2600) }

  watch(query, (q, prev) => {
    if (q && !prev) anotar('escribe', '')
  })
  watch(mode, (m, prev) => { if (m !== prev && m) anotar('modo', `${m}${auto.value ? ' (automático: ' + ruta.value.nota + ')' : locked.value ? ' (fijado)' : ''}`) })

  // Estado inicial del panel (campo vacío, sin modo ni conversación). Lo usan «Borrar», vaciar el campo y cerrar la capa.
  const limpiar = () => { vista.value = 'inicio'; desdeListado.value = false; gen++; filtro.value = 'todos'; query.value = ''; prompt.value = ''; locked.value = null; thread.value = []; convActual = null; lastSent.value = ''; pending.value = false }
  // Cambios del campo hechos por el usuario (enviar() vacía `query` sin pasar por aquí, para no perder la conversación)
  const escribir = (v) => { if (v) query.value = v; else { limpiar(); anotar('vacía el campo') } }

  // Conversación en marcha (se mantiene al cerrar el panel): pinta el badge en la lupa de la cabecera y, al abrir, el panel reanuda ese chat. La activa el Facilitador o el propio usuario al cerrar con un chat empezado.
  const convActiva = ref(null)
  const hayConversacion = computed(() => !!convActiva.value)
  const abriendo = ref(false) // true un instante tras abrir: el panel no enfoca el prompt al reanudar un chat (la caja no recibe foco al abrir)
  const abrir = () => { if (!open.value) { open.value = true; abriendo.value = true; setTimeout(() => { abriendo.value = false }, 600); anotar('abre panel'); if (convActiva.value) abrirConversacion(convActiva.value) } }
  const cerrar = () => {
    if (!open.value) return
    if (chatView.value && thread.value.some((m) => m.role === 'user')) convActiva.value = convActual || { titulo: thread.value.find((m) => m.role === 'user').text, thread: thread.value }
    open.value = false; limpiar(); anotar('cierra panel')
  }

  const enviar = () => {
    const text = query.value.trim()
    if (!text || pending.value) return
    if (!convActual) { convActual = { titulo: text, fecha: formatoFecha(new Date()), thread: thread.value }; historial.conversaciones.unshift(convActual); historial.conversaciones.splice(50) }
    if (!legalVisto.value && !thread.value.some((m) => m.legal)) { thread.value.push({ role: 'assistant', legal: true }); legalVisto.value = true; anotar('aviso legal', 'primera burbuja del asistente') }
    thread.value.push({ role: 'user', text })
    lastSent.value = text
    query.value = text // el campo conserva siempre la cadena (también al cambiar de pestaña); en mobile mantiene así la X para cerrar la capa
    pending.value = true
    anotar('envía pregunta', text)
    const g = gen
    const th = thread.value // si el panel se reinicia antes de que conteste, la respuesta se guarda igualmente en su conversación del historial
    setTimeout(() => { th.push({ role: 'assistant', ...responder(text) }); if (g === gen) pending.value = false }, 900)
  }
  const enviarOBuscar = () => {
    if (mode.value === 'chat') { if (!thread.value.length || query.value.trim() !== lastSent.value) enviar() } // el campo conserva la pregunta enviada: Intro sin cambiarla no la repite
    else if (query.value.trim()) { anotar('intro en resultados', query.value.trim()); if (results.value.length) registrarBusqueda(query.value.trim()) }
  }

  const setMode = (m) => {
    if (m === mode.value) return
    anotar('CORRIGE modo', `${mode.value} → ${m}${query.value ? ` · «${query.value}»` : lastSent.value ? ` · «${lastSent.value}»` : ''}`)
    locked.value = m
    if (m === 'chat' && query.value.trim() && query.value.trim() !== lastSent.value) {
      // el hilo conserva lo que ya se veía en el chat vacío (aviso legal + saludo) y a continuación van la pregunta y la respuesta
      if (!thread.value.length) {
        if (!legalVisto.value) { thread.value.push({ role: 'assistant', legal: true }); legalVisto.value = true }
        thread.value.push({ role: 'assistant', text: '¡Hola! Soy tu asistente de Renta 4. Cuéntame qué necesitas y te echo una mano.' })
      }
      enviar()
    }
    if (m === 'search' && !query.value) { const t = prompt.value.trim() || lastSent.value; if (t) { query.value = t; prompt.value = '' } } // vuelve a la búsqueda con lo último escrito
  }

  const nuevaConversacion = () => { gen++; thread.value = []; convActual = null; lastSent.value = ''; pending.value = false; locked.value = null; anotar('nueva conversación') }
  // «Pregunta al asistente» del estado inicial: lleva directo al chat (conversación vacía con el saludo y el prompt)
  const irAlChat = () => { locked.value = 'chat'; anotar('abre el chat', 'desde «Pregunta al asistente»') }
  // Volver (desde el chat) a la pantalla inicial: la conversación en marcha se conserva como activa (badge en la lupa; se reanuda al reabrir)
  const volver = () => { const alListado = desdeListado.value; if (thread.value.some((m) => m.role === 'user')) convActiva.value = convActual || { titulo: thread.value.find((m) => m.role === 'user').text, thread: thread.value }; limpiar(); if (alListado) vista.value = 'historial'; anotar(alListado ? 'vuelve al listado de conversaciones' : 'vuelve al inicio') }
  const usarTexto = (text, origen) => { query.value = text; abrir(); anotar('elige ' + origen, text) }
  const registrarBusqueda = (term) => { const k = norm(term); historial.busquedas = [term, ...historial.busquedas.filter((b) => norm(b) !== k)].slice(0, 4) }
  // Chip de «Búsquedas frecuentes» / «Últimas búsquedas»: mete el término en la caja y pinta el listado de resultados de esa consulta (el panel sigue abierto)
  const buscarTermino = (term) => { anotar('elige búsqueda', term); registrarBusqueda(term); query.value = term }
  // Fila de «Preguntas»: con historial se pinta la conversación completa; sin historial se abre una conversación nueva con la pregunta ya formulada
  const abrirConversacion = (conv, desde = 'inicio') => { vista.value = 'inicio'; desdeListado.value = desde === 'historial'; gen++; locked.value = null; legalVisto.value = true; convActual = conv; thread.value = conv.thread; lastSent.value = ([...conv.thread].reverse().find((m) => m.role === 'user') || {}).text || ''; query.value = lastSent.value; pending.value = false; anotar('abre conversación del historial', conv.titulo) }
  const enviarPrompt = () => { const t = prompt.value.trim(); if (!t || pending.value) return; prompt.value = ''; query.value = t; enviar() }
  const preguntarLoEscrito = () => { const t = query.value.trim() || lastSent.value; if (t) preguntar(t); else irAlChat() } // el botón del acceso al chat envía lo escrito en la caja
  const preguntar = (texto) => { limpiar(); query.value = texto; anotar('elige pregunta de ejemplo', texto); enviar() }
  const abrirResultado = (name) => { if (query.value.trim()) registrarBusqueda(query.value.trim()); anotar('abre resultado', name); avisar(`Prototipo: se abriría «${name}»`); cerrar() }
  const accion = (link) => {
    anotar('acción del asistente', link.label)
    avisar(`Prototipo: ${link.toast}`); cerrar() // un enlace del asistente navega directamente a su URL (aquí simulado) y cierra la capa
  }
  const reiniciar = () => { open.value = false; toast.value = ''; log.value = []; window.__buscadorLog = []; cargarEstado(partida.value) }
  // Los dos estados de partida del prototipo: usuario que aún no ha interactuado · usuario con búsquedas y conversaciones previas
  // Fecha y hora de cada conversación (DATOS DE EJEMPLO): las del histórico retroceden desde el 18/11/2026 10:42; la que se crea en la sesión lleva la hora actual
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const formatoFecha = (d) => `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} h` // «26 Ene 2026 · 10:42 h»
  const fechaEjemplo = (i) => formatoFecha(new Date(new Date(2026, 10, 18, 10, 42).getTime() - i * (27 * 60 + 13) * 60000))
  const conversacionEjemplo = (q, i = 0) => ({ titulo: q, fecha: fechaEjemplo(i), thread: [{ role: 'user', text: q }, { role: 'assistant', ...responder(q) }] })
  const partida = ref('nuevo') // use case cargado (el del Facilitador): «Reiniciar sesión» vuelve a él
  // Facilitador «¿Conversación activa?»: sí = hay un chat de ejemplo en marcha; no = ninguno
  const setConversacionActiva = (on) => { convActiva.value = on ? conversacionEjemplo('¿Cómo funcionan los planes de pensiones?') : null; anotar('conversación activa', on ? 'sí' : 'no') }
  // Facilitador «Conversación»: abre el panel con una conversación de ejemplo (pregunta + respuesta del tipo elegido: enlace · varios · resultados)
  const cargarRespuesta = (tipo) => {
    if (!preguntasDemo[tipo]) return
    limpiar(); open.value = true
    abrirConversacion({ titulo: preguntasDemo[tipo], thread: [{ role: 'user', text: preguntasDemo[tipo] }, { role: 'assistant', ...respuestaDemo(tipo) }] })
    anotar('respuesta de ejemplo', tipo)
  }
  const setHistorico = (on) => { historicoOn.value = on; cargarEstado(partida.value) }
  const verHistorial = () => { vista.value = 'historial'; anotar('ver todas las conversaciones') }
  const cargarEstado = (tipo) => {
    partida.value = tipo
    limpiar()
    legalVisto.value = tipo === 'historial'
    historial.busquedas = tipo === 'historial' ? ['Telefónica', 'Iberdrola'] : []
    historial.conversaciones = historicoOn.value ? preguntasHistorico.map((q, i) => conversacionEjemplo(q, i)) : tipo === 'historial' ? [conversacionEjemplo('¿Cómo funcionan los planes de pensiones?', 0), conversacionEjemplo('¿Puedo invertir en Fidelity de renta variable europea?', 1)] : []
    anotar('estado de partida', tipo)
  }

  return reactive({
    open, query, locked, thread, pending, lastSent, toast, log, opciones, prompt, chatView, legalPendiente, legalVisto, historial, populares, ejemplosPregunta, ruta, mode, auto, searchTerm, results, autocompletar, filtro,
    abrir, cerrar, limpiar, escribir, enviar, enviarOBuscar, setMode, nuevaConversacion, volver, irAlChat, preguntarLoEscrito, barra, cargarRespuesta, vista, setHistorico, verHistorial, abriendo, hayConversacion, setConversacionActiva, usarTexto, abrirResultado, buscarTermino, abrirBusqueda: buscarTermino, abrirConversacion, preguntar, enviarPrompt, cargarEstado, accion, reiniciar, avisar, anotar,
  })
}
