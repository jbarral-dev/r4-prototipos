// PENDIENTE-IT: no oficial. Prototipo de investigación (variante E: un solo campo decide el modo). NO es un componente del catálogo ni tiene diseño en Figma ni página en Confluence:
// es una COMPOSICIÓN de componentes reconstruidos (R4SegmentedControls, R4Chip, R4Button, R4Notification, _SearchResultItem) con tokens semánticos; lo que no cubre ningún componente
// (burbujas de mensaje, tarjeta «Preguntar», filas de ejemplos) son estilos propios mínimos y se avisan en «Pendiente / dudas».
// Contrato: recibe el estado compartido (`api`, ver screens/_buscadorEstado.js) y pinta, bajo el campo, el panel según el modo: vacío (ejemplos) · Resultados · Conversación.
// Hace visible y corregible el modo: selector Resultados | Conversación (siempre que haya modo) + frase que explica por qué se activó + región aria-live que lo anuncia.
// Patrón «Búsqueda y selección de elementos» (Confluence 3950968833): sin coincidencias → estado vacío que dice qué se buscó y ofrece salida (aquí, preguntar al asistente).
import { defineComponent, computed, ref, watch, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4SegmentedControls from './R4SegmentedControls.js'
import R4Chip from './R4Chip.js'
import R4Button from './R4Button.js'
import R4Notification from './R4Notification.js'
import _SearchResultItem from './_SearchResultItem.js'
import Icon from '../../icons/_Icon.js'
import { recientes, ejemplosPregunta } from '../../data/buscador-unificado.js'

let panelUid = 0

export default defineComponent({
  name: '_UnifiedSearchPanel',
  components: { R4SegmentedControls, R4Chip, R4Button, R4Notification, SearchResultItem: _SearchResultItem, Icon },
  props: { api: { type: Object, required: true } },
  setup(props) {
    const modeItems = [
      { label: 'Resultados', value: 'search', icon: 'search' },
      { label: 'Conversación', value: 'chat', icon: 'ic-comment-alt-dots' },
    ]
    const vacio = computed(() => !props.api.mode || (props.api.mode === 'search' && !props.api.searchTerm))
    const valores = computed(() => props.api.results.filter((r) => r.kind !== 'ayuda'))
    const ayuda = computed(() => props.api.results.filter((r) => r.kind === 'ayuda'))
    const why = computed(() => {
      const a = props.api
      if (a.locked) return `Has elegido ${a.locked === 'chat' ? 'Conversación' : 'Resultados'}.`
      if (a.thread.length) return 'Tienes una conversación abierta con el asistente.'
      return a.mode === 'chat' ? 'Lo has escrito como una pregunta, así que hablas con el asistente.' : 'Lo has escrito como un nombre, así que te mostramos resultados.'
    })
    const anuncio = computed(() => {
      const a = props.api
      if (!a.mode) return ''
      if (a.mode === 'chat') return a.thread.length ? 'Modo conversación.' : 'Modo conversación: pulsa Intro para preguntar al asistente.'
      return `Modo resultados: ${a.results.length} resultados.`
    })
    const body = ref(null)
    watch(() => [props.api.thread.length, props.api.pending], async () => { await nextTick(); if (body.value) body.value.scrollTop = body.value.scrollHeight })
    const pick = (name, e) => { e.preventDefault(); props.api.abrirResultado(name) }
    const uid = ++panelUid // el panel se monta dos veces (desplegable y capa a pantalla completa): ids únicos
    // Props del searchResultItem (diseño con mercado) a partir de una fila del catálogo; `highlight` = lo buscado
    const itemProps = (r) => ({ name: r.name, logoSrc: r.logoSrc, logoText: r.logoText, metadata1: r.metadata1, metadata2: r.metadata2, market: r.market, marketFlag: r.marketFlag, type: r.type, highlight: props.api.searchTerm })
    return { itemProps, uid, modeItems, vacio, valores, ayuda, why, anuncio, body, pick, recientes, ejemplosPregunta }
  },
  template: `
    <div class="usearch-panel" role="region" aria-label="Buscar o preguntar">
      <p class="usearch-panel__live" role="status" aria-live="polite">{{ anuncio }}</p>

      <div v-if="api.mode" class="usearch-panel__modebar">
        <R4SegmentedControls size="small" type="iconAndText" :items="modeItems" :selected-value="api.mode" aria-label="Modo de la consulta" @select="api.setMode" />
        <p v-if="api.opciones.explicacion" class="usearch-panel__why">{{ why }}</p>
      </div>

      <div ref="body" class="usearch-panel__body">
        <!-- Vacío: campo sin texto -->
        <template v-if="vacio">
          <p v-if="api.opciones.caption" class="usearch-panel__caption">Escribe el nombre de un producto para buscarlo, o una pregunta para hablar con el asistente.</p>
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-rec-' + uid">
            <h3 :id="'usearch-rec-' + uid" class="usearch-panel__heading">Búsquedas recientes</h3>
            <div class="usearch-panel__chips">
              <R4Chip v-for="r in recientes" :key="r" size="small" :label="r" @click="api.usarTexto(r, 'reciente')" />
            </div>
          </section>
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-ej-' + uid">
            <h3 :id="'usearch-ej-' + uid" class="usearch-panel__heading">Preguntas frecuentes</h3>
            <ul class="usearch-panel__examples">
              <li v-for="q in ejemplosPregunta" :key="q"><button type="button" class="usearch-panel__example" @click="api.usarTexto(q, 'pregunta de ejemplo')"><Icon name="ic-comment-alt-dots" /><span>{{ q }}</span></button></li>
            </ul>
          </section>
        </template>

        <!-- Resultados -->
        <template v-else-if="api.mode === 'search'">
          <template v-if="api.results.length">
            <p class="usearch-panel__count">{{ api.results.length }} {{ api.results.length === 1 ? 'resultado' : 'resultados' }} para «{{ api.searchTerm }}»</p>
            <section v-if="valores.length" class="usearch-panel__section" :aria-labelledby="'usearch-val-' + uid">
              <h3 :id="'usearch-val-' + uid" class="usearch-panel__heading">Valores y fondos</h3>
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
          <R4Notification class="usearch-panel__ai" type="info" :dismissible="false" text="Responde una inteligencia artificial y puede cometer errores." />
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
          <p v-if="api.thread.length && api.query.trim()" class="usearch-panel__hint">Pulsa Intro para enviar tu mensaje.</p>
          <R4Button v-if="api.thread.length" class="usearch-panel__reset" type="text" size="medium" icon="ic-undo" text="Nueva conversación" @click="api.nuevaConversacion()" />
        </template>
      </div>
    </div>
  `,
})
