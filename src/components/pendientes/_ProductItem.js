// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Hijo de R4ProductList (`productItem`). Fila de producto: nombre (enlace a la ficha del producto), metadatos y, según la versión, precio y variación (`showPrice`) o la etiqueta del tipo de producto (`showType`).
// Look & feel y hover = los del resultado de búsqueda con mercado (searchResultItem · rich, Figma «Fichas de Productos» 1117:20355): fila de padding 12/4 (8/4 en mobile), gap 12, nombre body/m SemiBold, línea secundaria
// body/s text/muted; hover = fondo surface/subtle y divisor inferior border/subtle (el último no lo lleva). La fila entera es clicable con UN solo elemento interactivo (el nombre se estira con ::after) y NO hay botón de compra:
// la fila lleva a la ficha del producto, no a contratar (decisión de la prueba de Jon, 2026-11-14).
// Componente NUEVO de la prueba de «Productos relacionados» (no está en Figma, ni en Confluence ni en el catálogo): la parte de precio y variación se toma del diseño anterior de la fila de la ficha (precio body/m Bold text/subdued,
// variación body/xs SemiBold en chart/positive|negative|text/muted).
// Props: name (obligatorio), meta (string[]), type (texto de la etiqueta), price, variation, tone (auto | muted), logo (nombre de icono, p. ej. una bandera en «En otros mercados»), href, showPrice, showType, showDivider.
// Evento: select.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Tag from './R4Tag.js'

export default defineComponent({
  name: 'productItem',
  components: { Icon, R4Tag },
  props: {
    name: { type: String, required: true },
    meta: { type: Array, default: () => [] },
    type: { type: String, default: undefined },
    price: { type: String, default: undefined },
    variation: { type: String, default: undefined },
    tone: { type: String, default: 'auto', validator: (v) => ['auto', 'muted'].includes(v) },
    logo: { type: String, default: undefined },
    href: { type: String, default: '#' },
    showPrice: { type: Boolean, default: true },
    showType: { type: Boolean, default: undefined }, // por defecto, solo en la versión sin precio
    showDivider: { type: Boolean, default: true },
  },
  emits: ['select'],
  setup(props) {
    const variationClass = computed(() => {
      if (props.tone === 'muted' || !props.variation) return 'is-muted'
      return props.variation.trim().startsWith('-') || props.variation.trim().startsWith('−') ? 'is-negative' : 'is-positive'
    })
    const typeVisible = computed(() => (props.showType === undefined ? !props.showPrice : props.showType) && !!props.type)
    const priceVisible = computed(() => props.showPrice && !!props.price)
    return { variationClass, typeVisible, priceVisible }
  },
  template: `
    <li class="r4-productitem" :class="{ 'has-divider': showDivider }">
      <Icon v-if="logo" class="r4-productitem__logo" :name="logo" />
      <div class="r4-productitem__content">
        <div class="r4-productitem__left">
          <a class="r4-productitem__name" :href="href" @click="$emit('select', $event)">{{ name }}</a>
          <span v-if="meta.length" class="r4-productitem__meta"><span v-for="(m, i) in meta" :key="i">{{ m }}</span></span>
        </div>
        <div v-if="priceVisible" class="r4-productitem__right">
          <span class="r4-productitem__price">{{ price }}</span>
          <span v-if="variation" class="r4-productitem__variation" :class="variationClass">{{ variation }}</span>
        </div>
        <div v-else-if="typeVisible" class="r4-productitem__info"><R4Tag color="blue" size="small" :text="type" /></div>
      </div>
    </li>
  `,
})
