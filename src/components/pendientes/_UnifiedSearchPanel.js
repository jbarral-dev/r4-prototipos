// PENDIENTE-IT: no oficial. Prototipo de investigación (variante E: un solo campo decide el modo). NO es un componente del catálogo ni tiene diseño en Figma ni página en Confluence:
// es una COMPOSICIÓN de componentes reconstruidos (R4Tabs, R4Chip, R4Button, _SearchResultItem) con tokens semánticos; lo que no cubre ningún componente
// (burbujas de mensaje, tarjeta «Preguntar», filas de ejemplos) son estilos propios mínimos y se avisan en «Pendiente / dudas».
// Contrato: recibe el estado compartido (`api`, ver screens/_buscadorEstado.js) y pinta, bajo el campo, el panel según el modo: vacío (ejemplos) · Resultados · Conversación.
// Hace visible y corregible el modo: selector Resultados | Conversación (siempre que haya modo) + frase que explica por qué se activó + región aria-live que lo anuncia.
// Patrón «Búsqueda y selección de elementos» (Confluence 3950968833): sin coincidencias → estado vacío que dice qué se buscó y ofrece salida (aquí, preguntar al asistente).
import { defineComponent, computed, ref, watch, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4BrandTypes from './R4BrandTypes.js'
import R4Chip from './R4Chip.js'
import R4NavigationItems from './R4NavigationItems.js'
import R4Button from './R4Button.js'
import R4InputTextarea from './R4InputTextarea.js'
import _SearchResultItem from './_SearchResultItem.js'
import R4SearchResults from './R4SearchResults.js'
import Icon from '../../icons/_Icon.js'

let panelUid = 0

export default defineComponent({
  name: '_UnifiedSearchPanel',
  components: { R4BrandTypes, R4Chip, R4NavigationItems, R4Button, R4InputTextarea, R4SearchResults, SearchResultItem: _SearchResultItem, Icon },
  props: { api: { type: Object, required: true } },
  setup(props) {
    const uid = ++panelUid // el panel se monta dos veces (desplegable y capa a pantalla completa): ids únicos
    const bodyId = 'usearch-body-' + uid
    // Pregunta a medio escribir (el enrutado ya la ve como pregunta): se mantiene la pantalla inicial hasta que el usuario pulsa Intro
    const preguntaPendiente = computed(() => props.api.mode === 'chat' && !props.api.thread.length && !props.api.locked && !!props.api.query.trim())
    const vacio = computed(() => !props.api.mode || preguntaPendiente.value || (props.api.mode === 'search' && !props.api.searchTerm))
    const valores = computed(() => props.api.results.filter((r) => r.kind !== 'ayuda'))
    const ayuda = computed(() => props.api.results.filter((r) => r.kind === 'ayuda'))
    const anuncio = computed(() => {
      const a = props.api
      if (!a.mode) return ''
      if (a.mode === 'chat') return a.thread.length ? 'Modo conversación.' : 'Modo conversación: pulsa Intro para preguntar al asistente.'
      return `Modo resultados: ${a.results.length} resultados.`
    })
    // Al final de la última respuesta del asistente: «Nuevo chat» y «Nueva búsqueda»
    const mostrarAcciones = computed(() => { const t = props.api.thread; return t.length > 0 && !props.api.pending && t[t.length - 1].role === 'assistant' })
    const body = ref(null)
    watch(() => [props.api.thread.length, props.api.pending, mostrarAcciones.value], async () => { await nextTick(); if (body.value) body.value.scrollTop = body.value.scrollHeight })
    // El prompt tiene el foco en cuanto se pinta la conversación (el panel se monta dos veces; el campo del host oculto no admite foco)
    const composer = ref(null)
    const promptEl = ref(null) // R4InputTextarea (crece con el texto; el botón de enviar queda abajo a la derecha)
    // En el R4Sheet bottom de mobile/tablet NO se enfoca el prompt: se suelta el foco del campo de arriba para que el teclado nativo se cierre y la caja quede visible; el teclado vuelve al pulsar en la caja
    const enfocarPrompt = async () => {
      await nextTick()
      const capa = promptEl.value?.$el?.closest('.usearch-sheetbottom')
      if (capa) { if (capa.querySelector('.r4-sheet')?.getClientRects().length) document.activeElement?.blur(); return }
      promptEl.value?.focus()
    }
    watch(() => props.api.chatView, (v) => { if (v) enfocarPrompt() })
    const nuevoChat = () => { props.api.nuevoChat(); enfocarPrompt() }
    const pick = (name, e) => { e.preventDefault(); props.api.abrirResultado(name) }
    // Estado inicial: con historial se muestran las búsquedas y preguntas del usuario (icono de histórico); sin historial, sugerencias (lupa y comentario)
    const hayBusquedas = computed(() => props.api.historial.busquedas.length > 0)
    const busquedas = computed(() => (hayBusquedas.value ? props.api.historial.busquedas : props.api.populares).map((t) => ({ texto: t, icon: hayBusquedas.value ? 'ic-history' : 'ic-search' })))
    const preguntas = computed(() => (props.api.historial.conversaciones.length
      ? props.api.historial.conversaciones.map((c) => ({ texto: c.titulo, conv: c, icon: 'ic-history' }))
      : props.api.ejemplosPregunta.slice(0, 3).map((t) => ({ texto: t, icon: 'ic-comments-alt' }))))
    // Filas de «Preguntas»: R4NavigationItems (sin icono en caja ni flecha); `conv` / `texto` viajan en el ítem para saber qué abrir
    // Títulos de sección: lo propio del usuario con historial («Últimas…») o lo sugerido al que entra por primera vez («…frecuentes»)
    const tituloBusquedas = computed(() => (hayBusquedas.value ? 'Últimas búsquedas' : 'Búsquedas frecuentes'))
    const tituloPreguntas = computed(() => (props.api.historial.conversaciones.length ? 'Últimas preguntas' : 'Preguntas frecuentes'))
    const preguntaItems = computed(() => preguntas.value.map((q) => ({ title: q.texto, icon: q.icon, linkHref: '#', showLink: false, conv: q.conv })))
    const onPregunta = (it, e) => { e.preventDefault(); if (it.conv) props.api.abrirConversacion(it.conv); else props.api.preguntar(it.title) }
    // Props del searchResultItem (diseño con mercado) a partir de una fila del catálogo; `highlight` = lo buscado
    const itemProps = (r) => ({ name: r.name, logoSrc: r.logoSrc, logoText: r.logoText, metadata1: r.metadata1, metadata2: r.metadata2, market: r.market, marketFlag: r.marketFlag, type: r.type, highlight: props.api.searchTerm })
    return { itemProps, uid, bodyId, vacio, preguntaPendiente, valores, ayuda, anuncio, body, composer, promptEl, pick, busquedas, preguntas, preguntaItems, onPregunta, tituloBusquedas, tituloPreguntas, mostrarAcciones, nuevoChat }
  },
  template: `
    <div class="usearch-panel" :class="{ 'usearch-panel--chat': api.chatView }" role="region" aria-label="Buscar o preguntar">
      <p class="usearch-panel__live" role="status" aria-live="polite">{{ anuncio }}</p>

      <div ref="body" class="usearch-panel__body" :id="bodyId">
        <!-- Vacío: campo sin texto. Use case «primera vez» (Búsquedas / Preguntas frecuentes) o «ya ha entrado» (Últimas búsquedas / Últimas preguntas, con icono de histórico) -->
        <div v-if="vacio" class="usearch-panel__start">
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-rec-' + uid">
            <h3 :id="'usearch-rec-' + uid" class="usearch-panel__heading">{{ tituloBusquedas }}</h3>
            <div class="usearch-panel__chips">
              <R4Chip v-for="b in busquedas" :key="b.texto" size="small" :label="b.texto" :icon="b.icon" @click="api.abrirBusqueda(b.texto)" />
            </div>
          </section>
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-ej-' + uid">
            <h3 :id="'usearch-ej-' + uid" class="usearch-panel__heading">{{ tituloPreguntas }}</h3>
            <R4NavigationItems size="medium" :items="preguntaItems" :icon-is-boxed="false" :aria-label="tituloPreguntas" @select="onPregunta" />
          </section>
        </div>

        <!-- Resultados -->
        <template v-else-if="api.mode === 'search'">
          <template v-if="api.results.length">
            <section v-if="valores.length" class="usearch-panel__section" aria-label="Resultados">
              <R4SearchResults class="usearch-panel__results"><SearchResultItem v-for="(r, i) in valores" :key="i" v-bind="itemProps(r)" @select="pick(r.name, $event)" /></R4SearchResults>
            </section>
            <section v-if="ayuda.length" class="usearch-panel__section" aria-label="Centro de ayuda">
              <R4SearchResults class="usearch-panel__results"><SearchResultItem v-for="(r, i) in ayuda" :key="i" v-bind="itemProps(r)" @select="pick(r.name, $event)" /></R4SearchResults>
            </section>
          </template>
          <div v-else class="usearch-panel__empty">
            <Icon class="usearch-panel__empty-icon" name="ic-file-search" />
            <div class="usearch-panel__empty-texts">
              <p class="usearch-panel__empty-title">Sin coincidencias para tu búsqueda</p>
              <p>Comprueba que «{{ api.searchTerm }}» esté bien escrito.</p>
              <p>También puedes probar preguntando a nuestro asistente.</p>
            </div>
            <R4Button type="secondary" size="medium" icon="ic-comment-alt-dots" text="Preguntar al asistente" @click="api.setMode('chat')" />
          </div>
        </template>

        <!-- Conversación -->
        <template v-else>
          <div v-if="!api.thread.length && api.query.trim() && !api.chatView" class="usearch-panel__ask">
            <p class="usearch-panel__ask-label">Vas a preguntar al asistente</p>
            <p class="usearch-panel__ask-text">«{{ api.query.trim() }}»</p>
            <div class="usearch-panel__ask-actions">
              <R4Button type="primary" size="medium" icon="ic-paper-plane" text="Preguntar" @click="api.enviar()" />
              <span class="usearch-panel__hint">o pulsa Intro</span>
            </div>
          </div>
          <ol v-if="api.thread.length" class="usearch-panel__thread" aria-label="Conversación">
            <li v-for="(m, i) in api.thread" :key="i" class="usearch-row" :class="'usearch-row--' + m.role">
              <R4BrandTypes v-if="m.role !== 'user'" class="usearch-row__logo" variant="Red" aria-hidden="true" />
              <div class="usearch-msg" :class="'usearch-msg--' + m.role">
                <span class="usearch-msg__who">{{ m.role === 'user' ? 'Tú' : 'Asistente' }}</span>
                <p class="usearch-msg__text">{{ m.text }}</p>
                <div v-if="m.links" class="usearch-msg__links"><R4Button v-for="l in m.links" :key="l.label" type="text" size="medium" :text="l.label" @click="api.accion(l)" /></div>
              </div>
            </li>
            <li v-if="api.pending" class="usearch-row usearch-row--assistant" aria-live="polite"><R4BrandTypes class="usearch-row__logo" variant="Red" aria-hidden="true" /><div class="usearch-msg usearch-msg--assistant usearch-msg--pending"><span class="usearch-msg__who">Asistente</span><p class="usearch-msg__text">Escribiendo…</p></div></li>
          </ol>
 <div v-if="mostrarAcciones" class="usearch-panel__chat-actions">
            <R4Button type="secondary" size="medium" icon="ic-plus" text="Nuevo chat" @click="nuevoChat" />
            <R4Button type="secondary" size="medium" icon="ic-search" text="Nueva búsqueda" @click="api.nuevaBusqueda()" />
          </div>
          <ol v-if="api.chatView && !api.thread.length" class="usearch-panel__thread" aria-label="Chat">
            <li class="usearch-row usearch-row--assistant"><R4BrandTypes class="usearch-row__logo" variant="Red" aria-hidden="true" /><div class="usearch-msg usearch-msg--assistant"><span class="usearch-msg__who">Asistente</span><p class="usearch-msg__text">¡Hola! Soy tu asistente de Renta 4. Cuéntame qué necesitas y te echo una mano.</p></div></li>
          </ol>
        </template>
      </div>

      <!-- Con la conversación pintada el campo de arriba queda disabled y el prompt se escribe aquí, fijo bajo el contenido -->
      <div v-if="api.chatView" ref="composer" class="usearch-panel__composer">
        <R4InputTextarea ref="promptEl" class="usearch-panel__prompt" :model-value="api.prompt" auto-grow :max-rows="6" font-size="medium" :resizable="false" submit-on-enter
                         placeholder="Escribe tu pregunta" aria-label="Tu pregunta al asistente" @update:model-value="api.prompt = $event" @submit="api.enviarPrompt()">
          <R4Button type="primary" size="medium" icon="ic-arrow-up" aria-label="Enviar pregunta" :disabled="!api.prompt.trim() || api.pending" @click="api.enviarPrompt()" />
        </R4InputTextarea>
      </div>
    </div>
  `,
})
