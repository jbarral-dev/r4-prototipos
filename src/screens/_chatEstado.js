// Auxiliar del prototipo (NO es un componente del sistema): estado y lógica del buscador unificado, variante F (conversación primero).
// Reglas del prototipo (para el facilitador):
//  · No hay pestañas ni modo elegido: el panel es SIEMPRE una conversación. Cada mensaje del usuario se enruta (enrutar) y la respuesta del asistente es de uno de dos tipos:
//      texto (pregunta o frase → respuesta guionizada) · resultados (nombre o palabra concreta con coincidencias → lista de _SearchResultItem dentro de la conversación).
//  · La derivación entre uno y otro la hace la propia conversación: una respuesta de texto puede ofrecer «Ver resultados»; unos resultados ofrecen «Preguntar al asistente» (corrige un enrutado
//    equivocado sin repetir el mensaje). Una búsqueda sin coincidencias se contesta con texto.
//  · Intro envía. Al cerrar el panel la conversación se descarta (como en la variante E).
//  · Se registra cada acción en `log` (y en window.__buscadorLog) para el facilitador.
import { reactive, ref } from '../../vendor/vue.esm-browser.prod.js'
import { enrutar, buscar, responder } from '../data/buscador-unificado.js'

export function crearEstadoChat() {
  const t0 = Date.now()
  const open = ref(false)
  const prompt = ref('')
  const thread = ref([]) // { id, role: 'user' | 'assistant', kind: 'text' | 'results', text, links?, term?, items? }
  const pending = ref(false)
  const toast = ref('')
  const log = ref([])
  let gen = 0 // se incrementa al reiniciar el panel: descarta la respuesta del asistente que llegue tarde
  let seq = 0

  const anotar = (evento, detalle = '') => {
    const row = { t: ((Date.now() - t0) / 1000).toFixed(1), evento, detalle }
    log.value.push(row)
    ;(window.__buscadorLog = window.__buscadorLog || []).push(row)
  }
  let toastTimer
  const avisar = (msg) => { toast.value = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 2600) }

  const limpiar = () => { gen++; prompt.value = ''; thread.value = []; pending.value = false }
  const abrir = () => { if (!open.value) { open.value = true; anotar('abre panel') } }
  const cerrar = () => { if (open.value) { open.value = false; limpiar(); anotar('cierra panel') } }

  // La respuesta llega tras una breve espera (la de texto simula al asistente; los resultados, casi inmediatos)
  const contestar = (turno, ms) => {
    pending.value = true
    const g = gen
    setTimeout(() => { if (g !== gen) return; thread.value.push({ id: ++seq, role: 'assistant', ...turno }); pending.value = false }, ms)
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
    thread.value.push({ id: ++seq, role: 'user', kind: 'text', text })
    const ruta = enrutar(text)
    anotar('envía', `«${text}» → ${ruta.mode === 'search' ? 'resultados' : 'texto'}${ruta.fallo ? ' (fallo a propósito)' : ''}`)
    if (ruta.mode === 'search') contestar(turnoResultados(text), 350)
    else contestar({ kind: 'text', ...responder(text) }, 900)
  }
  // Salidas de una respuesta a la otra
  const verResultados = (term) => { anotar('texto → resultados', term); contestar(turnoResultados(term), 350) }
  const preguntarSobre = (term) => { if (pending.value) return; anotar('resultados → texto', term); contestar({ kind: 'text', ...responder(term) }, 900) }

  const abrirResultado = (name) => { anotar('abre resultado', name); avisar(`Prototipo: se abriría «${name}»`); cerrar() }
  const accion = (link) => {
    anotar('acción del asistente', link.label)
    if (link.toast === '__resultados__') { const q = [...thread.value].reverse().find((m) => m.role === 'user'); verResultados(q ? q.text : '') }
    else { avisar(`Prototipo: ${link.toast}`); cerrar() }
  }
  const usarTexto = (text, origen) => { abrir(); anotar('elige ' + origen, text); enviar(text) }
  const reiniciar = () => { open.value = false; toast.value = ''; log.value = []; window.__buscadorLog = []; limpiar(); anotar('reinicia sesión') }

  return reactive({ open, prompt, thread, pending, toast, log, abrir, cerrar, limpiar, enviar, verResultados, preguntarSobre, abrirResultado, accion, usarTexto, reiniciar, avisar, anotar })
}
