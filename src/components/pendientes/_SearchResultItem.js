// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de `searchResultItem` + `searchResultsList` (patrón de resultados: derivados y «En otros mercados» de la ficha, y la lista de resultados del buscador en el popover).
// No es un componente del catálogo ni tiene página: solo el patrón «Búsqueda y selección de elementos» (Confluence 3950968833), que habla de buscadores y de mostrar los no disponibles con su motivo.
// DOS DISEÑOS en un mismo componente (el segundo se leyó en Figma "Proyectos - Fichas de Productos" 1117:20355 —variantes size small | large × interaction default | hover— y en la lista de
//   resultados de "Proyectos - Contratar" 10083:12582):
//  · Con precio (ficha: derivados y «En otros mercados»): logo, name, meta (string[]), price, variation, tone, action ({ icon, label }: botón de icono, solo mobile).
//  · Con mercado (resultados del buscador, Figma actual): props del componente de Figma — name, logoText*, metadata1, metadata2, market, marketFlag (nombre de icono de bandera), type (texto de la
//    etiqueta; showType = hay type), showDivider (por defecto true) — más `highlight` (texto buscado: la coincidencia del nombre va en text/search-highlight, SemiBold).
//    size small | large NO es prop: lo resuelve el CSS por el ancho de la propia fila (container query): large (una línea: logo 28 · nombre · ISIN · mercado · etiqueta) a partir de 480 px;
//    small (dos líneas: nombre y «metadata1 · metadata2» a la izquierda; mercado y etiqueta a la derecha). interaction hover lo resuelve el CSS. En large Figma solo muestra metadata2.
//    *`logoText` es EXTRA del prototipo: el logo real (_Logo, imagen de la empresa) no se tiene como asset; se pinta una ficha oscura con la inicial. Datos de ejemplo.
// Interactividad (CLAUDE.md: un solo elemento interactivo): el nombre es el <a> y se estira con ::after para que toda la fila sea clicable; la acción de mobile queda por encima.
// NO reconstruido: showBuyButton en el diseño con mercado (el botón «Comprar» del hover en large está oculto en Figma).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Button from './R4Button.js'
import R4Tag from './R4Tag.js'

const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default defineComponent({
  name: '_SearchResultItem',
  components: { Icon, R4Button, R4Tag },
  props: {
    logo: { type: String, default: undefined },
    logoText: { type: String, default: undefined },
    name: { type: String, required: true },
    meta: { type: Array, default: () => [] },
    price: { type: String, default: undefined },
    variation: { type: String, default: undefined },
    tone: { type: String, default: 'auto', validator: (v) => ['auto', 'muted'].includes(v) },
    metadata1: { type: String, default: undefined },
    metadata2: { type: String, default: undefined },
    market: { type: String, default: undefined },
    marketFlag: { type: String, default: undefined },
    type: { type: String, default: undefined },
    showDivider: { type: Boolean, default: true },
    highlight: { type: String, default: '' },
    href: { type: String, default: '#' },
    action: { type: Object, default: undefined },
  },
  emits: ['select', 'action'],
  setup(props) {
    const variationClass = computed(() => {
      if (props.tone === 'muted' || !props.variation) return 'is-muted'
      return props.variation.trim().startsWith('-') || props.variation.trim().startsWith('−') ? 'is-negative' : 'is-positive'
    })
    const rich = computed(() => !!(props.type || props.market || props.metadata2 || props.logoText))
    // Coincidencia sin acentos ni mayúsculas: se resalta la consulta completa o, si no está, la palabra más larga que aparezca
    const parts = computed(() => {
      const n = props.name
      const hay = plain(n)
      const q = plain(props.highlight.trim())
      if (!q) return [{ t: n }]
      const tokens = [q, ...q.split(/\s+/).sort((a, b) => b.length - a.length)].filter((t) => t.length > 1)
      for (const t of tokens) {
        const i = hay.indexOf(t)
        if (i >= 0) return [{ t: n.slice(0, i) }, { t: n.slice(i, i + t.length), hl: true }, { t: n.slice(i + t.length) }].filter((p) => p.t)
      }
      return [{ t: n }]
    })
    return { variationClass, rich, parts }
  },
  template: `
    <li class="r4-searchresult" :class="{ 'has-action': action, 'r4-searchresult--rich': rich, 'has-divider': rich && showDivider }">
      <span v-if="logoText" class="r4-searchresult__logo r4-searchresult__logo--tile" aria-hidden="true">{{ logoText }}</span>
      <Icon v-else-if="logo" class="r4-searchresult__logo" :name="logo" />
      <div class="r4-searchresult__content">
        <div class="r4-searchresult__left">
          <a class="r4-searchresult__name" :href="href" @click="$emit('select', $event)"><template v-for="(p, i) in parts" :key="i"><span v-if="p.hl" class="r4-searchresult__hl">{{ p.t }}</span><template v-else>{{ p.t }}</template></template></a>
          <span v-if="meta.length" class="r4-searchresult__meta"><span v-for="(m, i) in meta" :key="i">{{ m }}</span></span>
          <span v-if="rich && (metadata1 || metadata2)" class="r4-searchresult__sub"><span v-if="metadata1">{{ metadata1 }}</span><span v-if="metadata1 && metadata2" aria-hidden="true">·</span><span v-if="metadata2">{{ metadata2 }}</span></span>
        </div>
        <div v-if="price" class="r4-searchresult__right">
          <span class="r4-searchresult__price">{{ price }}</span>
          <span v-if="variation" class="r4-searchresult__variation" :class="variationClass">{{ variation }}</span>
        </div>
        <div v-if="rich && (metadata2 || market || type)" class="r4-searchresult__info">
          <span v-if="metadata2" class="r4-searchresult__id">{{ metadata2 }}</span>
          <span v-if="market" class="r4-searchresult__market"><Icon v-if="marketFlag" :name="marketFlag" /><span>{{ market }}</span></span>
          <R4Tag v-if="type" color="blue" size="small" :text="type" />
        </div>
      </div>
      <R4Button v-if="action" class="r4-searchresult__action" type="text" :icon="action.icon" :aria-label="action.label" @click="$emit('action', $event)" />
    </li>
  `,
})
