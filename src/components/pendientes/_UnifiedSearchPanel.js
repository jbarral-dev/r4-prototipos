// PENDIENTE-IT: no oficial. Prototipo de investigación (variante E: un solo campo decide el modo). NO es un componente del catálogo ni tiene diseño en Figma ni página en Confluence:
// es una COMPOSICIÓN de componentes reconstruidos (R4Tabs, R4Chip, R4Button, _SearchResultItem) con tokens semánticos; lo que no cubre ningún componente
// (burbujas de mensaje, tarjeta «Preguntar», filas de ejemplos) son estilos propios mínimos y se avisan en «Pendiente / dudas».
// Contrato: recibe el estado compartido (`api`, ver screens/_buscadorEstado.js) y pinta, bajo el campo, el panel según el modo: vacío (ejemplos) · Resultados · Conversación.
// Hace visible y corregible el modo: selector Resultados | Conversación (siempre que haya modo) + frase que explica por qué se activó + región aria-live que lo anuncia.
// Patrón «Búsqueda y selección de elementos» (Confluence 3950968833): sin coincidencias → estado vacío que dice qué se buscó y ofrece salida (aquí, preguntar al asistente).
import { defineComponent, computed, ref, watch, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4Tabs from './R4Tabs.js'
import R4Chip from './R4Chip.js'
import R4Button from './R4Button.js'
import R4InputText from './R4InputText.js'
import _SearchResultItem from './_SearchResultItem.js'
import Icon from '../../icons/_Icon.js'

let panelUid = 0

export default defineComponent({
  name: '_UnifiedSearchPanel',
  components: { R4Tabs, R4Chip, R4Button, R4InputText, SearchResultItem: _SearchResultItem, Icon },
  props: { api: { type: Object, required: true } },
  setup(props) {
    const uid = ++panelUid // el panel se monta dos veces (desplegable y capa a pantalla completa): ids únicos
    const bodyId = 'usearch-body-' + uid
    const modeTabs = [
      { label: 'Resultados', id: 'usearch-tab-search-' + uid, panelId: bodyId },
      { label: 'Conversación', id: 'usearch-tab-chat-' + uid, panelId: bodyId },
    ]
    const activeTab = computed(() => (props.api.mode === 'chat' ? 1 : 0))
    const onTab = (i) => props.api.setMode(i === 1 ? 'chat' : 'search')
    const vacio = computed(() => !props.api.mode || (props.api.mode === 'search' && !props.api.searchTerm))
    const valores = computed(() => props.api.results.filter((r) => r.kind !== 'ayuda'))
    const ayuda = computed(() => props.api.results.filter((r) => r.kind === 'ayuda'))
    const anuncio = computed(() => {
      const a = props.api
      if (!a.mode) return ''
      if (a.mode === 'chat') return a.thread.length ? 'Modo conversación.' : 'Modo conversación: pulsa Intro para preguntar al asistente.'
      return `Modo resultados: ${a.results.length} resultados.`
    })
    const body = ref(null)
    watch(() => [props.api.thread.length, props.api.pending], async () => { await nextTick(); if (body.value) body.value.scrollTop = body.value.scrollHeight })
    // El prompt tiene el foco en cuanto se pinta la conversación (el panel se monta dos veces; el campo del host oculto no admite foco)
    const composer = ref(null)
    const promptEl = ref(null)
    // El prompt crece con el texto (hasta el máximo del CSS, luego scroll) y el botón de enviar queda abajo a la derecha
    const grow = () => { const t = promptEl.value; if (!t) return; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }
    const onPromptInput = (e) => { props.api.prompt = e.target.value; grow() }
    watch(() => props.api.prompt, async () => { await nextTick(); grow() })
    watch(() => props.api.chatView, async (v) => { if (v) { await nextTick(); grow(); promptEl.value?.focus() } })
    const pick = (name, e) => { e.preventDefault(); props.api.abrirResultado(name) }
    // Estado inicial: con historial se muestran las búsquedas y preguntas del usuario (icono de histórico); sin historial, sugerencias (lupa y comentario)
    const hayBusquedas = computed(() => props.api.historial.busquedas.length > 0)
    const busquedas = computed(() => (hayBusquedas.value ? props.api.historial.busquedas : props.api.populares).map((t) => ({ texto: t, icon: hayBusquedas.value ? 'ic-history' : 'ic-search' })))
    const preguntas = computed(() => (props.api.historial.conversaciones.length
      ? props.api.historial.conversaciones.map((c) => ({ texto: c.titulo, conv: c, icon: 'ic-history' }))
      : [{ texto: props.api.ejemplosPregunta[0], icon: 'ic-comments-alt' }]))
    // Props del searchResultItem (diseño con mercado) a partir de una fila del catálogo; `highlight` = lo buscado
    const itemProps = (r) => ({ name: r.name, logoSrc: r.logoSrc, logoText: r.logoText, metadata1: r.metadata1, metadata2: r.metadata2, market: r.market, marketFlag: r.marketFlag, type: r.type, highlight: props.api.searchTerm })
    return { itemProps, uid, bodyId, modeTabs, activeTab, onTab, vacio, valores, ayuda, anuncio, body, composer, promptEl, onPromptInput, pick, busquedas, preguntas }
  },
  template: `
    <div class="usearch-panel" :class="{ 'usearch-panel--chat': api.chatView }" role="region" aria-label="Buscar o preguntar">
      <p class="usearch-panel__live" role="status" aria-live="polite">{{ anuncio }}</p>

      <div v-if="api.mode" class="usearch-panel__modebar">
        <R4Tabs layout="fixed" :tabs="modeTabs" :active-tab="activeTab" aria-label="Modo de la consulta" @change="onTab" />
      </div>

      <div ref="body" class="usearch-panel__body" :id="bodyId" :role="api.mode ? 'tabpanel' : undefined" :aria-labelledby="api.mode ? modeTabs[activeTab].id : undefined">
        <!-- Vacío: campo sin texto. Estado «usuario nuevo» (sugerencias) o «usuario con historial» (lo suyo, con icono de histórico) -->
        <template v-if="vacio">
          <p v-if="api.opciones.caption" class="usearch-panel__caption">Escribe el nombre de un producto para buscarlo, o una pregunta para hablar con el asistente.</p>
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-rec-' + uid">
            <h3 :id="'usearch-rec-' + uid" class="usearch-panel__heading">Búsquedas</h3>
            <div class="usearch-panel__chips">
              <R4Chip v-for="b in busquedas" :key="b.texto" size="small" :label="b.texto" :icon="b.icon" @click="api.abrirBusqueda(b.texto)" />
            </div>
          </section>
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-ej-' + uid">
            <h3 :id="'usearch-ej-' + uid" class="usearch-panel__heading">Preguntas</h3>
            <ul class="usearch-panel__examples">
              <li v-for="q in preguntas" :key="q.texto"><button type="button" class="usearch-panel__example" @click="q.conv ? api.abrirConversacion(q.conv) : api.preguntar(q.texto)"><Icon :name="q.icon" /><span>{{ q.texto }}</span></button></li>
            </ul>
          </section>
        </template>

        <!-- Resultados -->
        <template v-else-if="api.mode === 'search'">
          <template v-if="api.results.length">
            <section v-if="valores.length" class="usearch-panel__section" aria-label="Resultados">
              <ul class="usearch-panel__results"><SearchResultItem v-for="(r, i) in valores" :key="i" v-bind="itemProps(r)" @select="pick(r.name, $event)" /></ul>
            </section>
            <section v-if="ayuda.length" class="usearch-panel__section" :aria-labelledby="'usearch-ay-' + uid">
              <h3 :id="'usearch-ay-' + uid" class="usearch-panel__heading">Centro de ayuda</h3>
              <ul class="usearch-panel__results"><SearchResultItem v-for="(r, i) in ayuda" :key="i" v-bind="itemProps(r)" @select="pick(r.name, $event)" /></ul>
            </section>
            <div class="usearch-panel__exit">
              <span>¿No encuentras lo que buscas?</span>
              <R4Button type="text" size="medium" icon="ic-comment-alt-dots" text="Pregúntaselo al asistente" @click="api.setMode('chat')" />
            </div>
          </template>
          <div v-else class="usearch-panel__empty">
            <p class="usearch-panel__empty-title">No hay resultados para «{{ api.searchTerm }}»</p>
            <p>Prueba con otro nombre o cuéntaselo al asistente.</p>
            <R4Button type="secondary" size="medium" icon="ic-comment-alt-dots" text="Preguntar al asistente" @click="api.setMode('chat')" />
          </div>
        </template>

        <!-- Conversación -->
        <template v-else>
          <div v-if="!api.thread.length && api.query.trim()" class="usearch-panel__ask">
            <p class="usearch-panel__ask-label">Vas a preguntar al asistente</p>
            <p class="usearch-panel__ask-text">«{{ api.query.trim() }}»</p>
            <div class="usearch-panel__ask-actions">
              <R4Button type="primary" size="medium" icon="ic-paper-plane" text="Preguntar" @click="api.enviar()" />
              <span class="usearch-panel__hint">o pulsa Intro</span>
            </div>
          </div>
          <ol v-if="api.thread.length" class="usearch-panel__thread" aria-label="Conversación">
            <li v-for="(m, i) in api.thread" :key="i" class="usearch-msg" :class="'usearch-msg--' + m.role">
              <span class="usearch-msg__who">{{ m.role === 'user' ? 'Tú' : 'Asistente' }}</span>
              <p class="usearch-msg__text">{{ m.text }}</p>
              <div v-if="m.links" class="usearch-msg__links"><R4Button v-for="l in m.links" :key="l.label" type="text" size="medium" :text="l.label" @click="api.accion(l)" /></div>
            </li>
            <li v-if="api.pending" class="usearch-msg usearch-msg--assistant usearch-msg--pending" aria-live="polite"><span class="usearch-msg__who">Asistente</span><p class="usearch-msg__text">Escribiendo…</p></li>
          </ol>
          <p v-if="api.chatView && !api.thread.length" class="usearch-panel__hint">Escribe tu pregunta para hablar con el asistente.</p>
          <R4Button v-if="api.thread.length" class="usearch-panel__reset" type="text" size="medium" icon="ic-undo" text="Nueva conversación" @click="api.nuevaConversacion()" />
        </template>
      </div>

      <!-- Con la conversación pintada el campo de arriba queda disabled y el prompt se escribe aquí, fijo bajo el contenido -->
      <div v-if="api.chatView" ref="composer" class="usearch-panel__composer">
        <div class="usearch-panel__prompt">
          <textarea ref="promptEl" class="usearch-panel__prompt-input" rows="1" :value="api.prompt" placeholder="Escribe tu pregunta" aria-label="Tu pregunta al asistente"
                    @input="onPromptInput" @keydown.enter.exact.prevent="api.enviarPrompt()"></textarea>
          <R4Button type="primary" size="medium" icon="ic-arrow-up" aria-label="Enviar pregunta" :disabled="!api.prompt.trim() || api.pending" @click="api.enviarPrompt()" />
        </div>
      </div>
    </div>
  `,
})
