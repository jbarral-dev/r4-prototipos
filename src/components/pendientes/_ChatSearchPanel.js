// PENDIENTE-IT: no oficial. Prototipo de investigación (variante F: conversación primero). NO es un componente del catálogo ni tiene diseño en Figma ni página en Confluence:
// es una COMPOSICIÓN de componentes reconstruidos (R4InputTextarea, R4Button, _SearchResultItem) con tokens semánticos; lo que no cubre ningún componente
// (saludo inicial, burbujas de mensaje) son estilos propios mínimos y se avisan en «Pendiente / dudas».
// Contrato: recibe el estado compartido (`api`, ver screens/_chatEstado.js). Sin pestañas ni modo: pantalla inicial (saludo + descripción + caja del prompt, centrado en vertical) y,
// al enviar el primer mensaje, conversación con el prompt fijo abajo. Las respuestas del asistente son texto o una lista de resultados (mismo _SearchResultItem que el buscador).
// Accesibilidad: región aria-live que anuncia cada respuesta; la conversación es una lista con nombre; la caja del prompt tiene aria-label y el botón de enviar también.
import { defineComponent, computed, ref, watch, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4Button from './R4Button.js'
import R4InputTextarea from './R4InputTextarea.js'
import _SearchResultItem from './_SearchResultItem.js'

export default defineComponent({
  name: '_ChatSearchPanel',
  components: { R4Button, R4InputTextarea, SearchResultItem: _SearchResultItem },
  props: { api: { type: Object, required: true } },
  setup(props) {
    const body = ref(null)
    const promptEl = ref(null)
    const vacio = computed(() => !props.api.thread.length)
    const anuncio = computed(() => {
      const last = props.api.thread[props.api.thread.length - 1]
      if (props.api.pending) return 'El asistente está escribiendo.'
      if (!last || last.role === 'user') return ''
      return last.kind === 'results' ? `${last.items.length} resultados para ${last.term}.` : 'Respuesta del asistente.'
    })
    const valores = (t) => t.items.filter((r) => r.kind !== 'ayuda')
    const ayuda = (t) => t.items.filter((r) => r.kind === 'ayuda')
    const itemProps = (r, t) => ({ name: r.name, logoSrc: r.logoSrc, logoText: r.logoText, metadata1: r.metadata1, metadata2: r.metadata2, market: r.market, marketFlag: r.marketFlag, type: r.type, highlight: t.term })
    const pick = (name, e) => { e.preventDefault(); props.api.abrirResultado(name) }
    // Con cada turno nuevo: texto → hasta el final; resultados → se ve desde el mensaje del usuario que los motivó (la lista puede ser larga)
    watch(() => [props.api.thread.length, props.api.pending], async () => {
      await nextTick()
      const el = body.value
      if (!el) return
      const turnos = el.querySelectorAll(':scope > .csearch-thread > .csearch-turn')
      const last = props.api.thread[props.api.thread.length - 1]
      if (last && last.kind === 'results' && turnos.length > 1) el.scrollTop = turnos[turnos.length - 2].offsetTop - el.offsetTop
      else el.scrollTop = el.scrollHeight
    })
    const focus = () => promptEl.value?.focus()
    return { body, promptEl, vacio, anuncio, valores, ayuda, itemProps, pick, focus }
  },
  template: `
    <div class="csearch" :class="{ 'csearch--empty': vacio }" role="region" aria-label="Asistente de búsqueda">
      <p class="csearch__live" role="status" aria-live="polite">{{ anuncio }}</p>

      <!-- Primera carga: saludo y descripción; la caja del prompt (abajo) forma con ellos un bloque centrado en vertical -->
      <div v-if="vacio" class="csearch__hero">
        <h3 class="csearch__greeting">Hola, ¿en qué puedo ayudarte?</h3>
        <p class="csearch__lead">Pregúntame lo que necesites sobre Renta 4 o escribe el nombre de un producto para encontrarlo.</p>
      </div>

      <div v-else ref="body" class="csearch__body">
        <ol class="csearch-thread" aria-label="Conversación">
          <li v-for="m in api.thread" :key="m.id" class="csearch-turn" :class="['csearch-turn--' + m.role, m.kind === 'results' ? 'csearch-turn--results' : '']">
            <template v-if="m.kind !== 'results'">
              <div class="usearch-msg" :class="'usearch-msg--' + m.role">
                <span class="usearch-msg__who">{{ m.role === 'user' ? 'Tú' : 'Asistente' }}</span>
                <p class="usearch-msg__text">{{ m.text }}</p>
                <div v-if="m.links" class="usearch-msg__links"><R4Button v-for="l in m.links" :key="l.label" type="text" size="medium" :text="l.label" @click="api.accion(l)" /></div>
              </div>
            </template>
            <template v-else>
              <span class="usearch-msg__who">Asistente</span>
              <p class="csearch-turn__intro">{{ m.items.length === 1 ? 'Esto es lo que he encontrado' : 'Esto es lo que he encontrado (' + m.items.length + ')' }} para «{{ m.term }}»:</p>
              <ul v-if="valores(m).length" class="usearch-panel__results" aria-label="Resultados"><SearchResultItem v-for="(r, i) in valores(m)" :key="'v' + i" v-bind="itemProps(r, m)" @select="pick(r.name, $event)" /></ul>
              <template v-if="ayuda(m).length">
                <p class="csearch-turn__group">Centro de ayuda</p>
                <ul class="usearch-panel__results" aria-label="Centro de ayuda"><SearchResultItem v-for="(r, i) in ayuda(m)" :key="'a' + i" v-bind="itemProps(r, m)" @select="pick(r.name, $event)" /></ul>
              </template>
              <div class="csearch-turn__exit">
                <span>¿Buscabas otra cosa?</span>
                <R4Button type="text" size="medium" icon="ic-comment-alt-dots" text="Preguntar al asistente" :disabled="api.pending" @click="api.preguntarSobre(m.term)" />
              </div>
            </template>
          </li>
          <li v-if="api.pending" class="csearch-turn csearch-turn--assistant" aria-hidden="true">
            <div class="usearch-msg usearch-msg--assistant usearch-msg--pending"><span class="usearch-msg__who">Asistente</span><p class="usearch-msg__text">Escribiendo…</p></div>
          </li>
        </ol>
      </div>

      <div class="csearch__composer">
        <R4InputTextarea ref="promptEl" class="csearch__prompt" :model-value="api.prompt" auto-grow :max-rows="6" font-size="medium" :resizable="false" submit-on-enter
                         placeholder="Pregunta o busca un producto" aria-label="Tu pregunta o búsqueda" @update:model-value="api.prompt = $event" @submit="api.enviar()">
          <R4Button type="primary" size="medium" icon="ic-arrow-up" aria-label="Enviar" :disabled="!api.prompt.trim() || api.pending" @click="api.enviar()" />
        </R4InputTextarea>
      </div>
    </div>
  `,
})
