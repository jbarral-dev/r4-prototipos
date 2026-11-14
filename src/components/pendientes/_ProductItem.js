// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Hijo de R4ProductList (`productItem`). Fila de producto: nombre (enlace a la ficha del producto), metadatos y, según la versión, precio y variación (`showPrice`) o el mercado (`showMarket`).
// Look & feel y hover = los del resultado de búsqueda con mercado (searchResultItem · rich, Figma «Fichas de Productos» 1117:20355): fila de padding 12/4 (8/4 en mobile), gap 12, nombre body/m SemiBold, línea secundaria
// body/s text/muted; hover = fondo surface/subtle y divisor inferior border/subtle (el último no lo lleva). La fila entera es clicable con UN solo elemento interactivo (el nombre se estira con ::after). Por defecto NO hay botón de compra
// (la fila lleva a la ficha, decisión de la prueba de Jon, 2026-11-14). EXCEPCIÓN explícita añadida por Jon el 2026-11-14: `showAction` reabre el botón de compra del diseño anterior de la fila (_SearchResultItem, ya eliminado) como
// botón «Contratar» (R4Button secondary medium, icono ic-shopping-cart; en mobile solo icono), a la derecha del precio/mercado y por encima del enlace estirado (z-index:1, no navega). Con showAction=false se mantiene el comportamiento actual.
// Componente NUEVO de la prueba de «Productos relacionados» (no está en Figma, ni en Confluence ni en el catálogo): la parte de precio y variación se toma del diseño anterior de la fila de la ficha (precio body/m Bold text/subdued,
// variación body/s SemiBold en chart/positive o chart/negative según el signo).
// Props: name (obligatorio), meta (string[]), market y marketFlag (mercado: nombre y bandera, como el searchResultItem), price, variation, logo (nombre de icono, p. ej. una bandera en «En otros mercados») y logoSrc (URL del logotipo de la empresa: refuerza que son productos de ese emisor; mismo logo en todas las filas), href, showPrice, showMarket, showDivider, showAction (por defecto false).
// Eventos: select; action ({ name, href, event }: el evento DOM va dentro del objeto) al pulsar «Contratar».
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Button from './R4Button.js'

export default defineComponent({
  name: 'productItem',
  components: { Icon, R4Button },
  props: {
    name: { type: String, required: true },
    meta: { type: Array, default: () => [] },
    market: { type: String, default: undefined },
    marketFlag: { type: String, default: undefined }, // nombre de icono de bandera
    price: { type: String, default: undefined },
    variation: { type: String, default: undefined },
    logo: { type: String, default: undefined },
    logoSrc: { type: String, default: undefined }, // URL del logotipo (p. ej. el de la empresa del producto); mismo tratamiento que en searchResultItem
    href: { type: String, default: '#' },
    showPrice: { type: Boolean, default: true },
    showMarket: { type: Boolean, default: undefined }, // por defecto, solo en la versión sin precio
    showDivider: { type: Boolean, default: true },
    showAction: { type: Boolean, default: false }, // botón «Contratar» opcional (Jon, 2026-11-14)
  },
  emits: ['select', 'action'],
  setup(props, { emit }) {
    const variationClass = computed(() => {
      // El color lo da siempre el signo (chart/positive o chart/negative), en todas las listas; no hay tono atenuado
      const v = (props.variation || '').trim()
      return v.startsWith('-') || v.startsWith('−') ? 'is-negative' : 'is-positive'
    })
    const marketVisible = computed(() => (props.showMarket === undefined ? !props.showPrice : props.showMarket) && !!props.market)
    const priceVisible = computed(() => props.showPrice && !!props.price)
    const onAction = (e) => emit('action', { name: props.name, href: props.href, event: e })
    return { variationClass, marketVisible, priceVisible, onAction }
  },
  template: `
    <li class="r4-productitem" :class="{ 'has-divider': showDivider }">
      <img v-if="logoSrc" class="r4-productitem__logo r4-productitem__logo--img" :src="logoSrc" alt="" />
      <Icon v-else-if="logo" class="r4-productitem__logo" :name="logo" />
      <div class="r4-productitem__content">
        <div class="r4-productitem__left">
          <a class="r4-productitem__name" :href="href" @click="$emit('select', $event)">{{ name }}</a>
          <span v-if="meta.length" class="r4-productitem__meta"><span v-for="(m, i) in meta" :key="i">{{ m }}</span></span>
        </div>
        <div v-if="priceVisible" class="r4-productitem__right">
          <span class="r4-productitem__price">{{ price }}</span>
          <span v-if="variation" class="r4-productitem__variation" :class="variationClass">{{ variation }}</span>
        </div>
        <div v-else-if="marketVisible" class="r4-productitem__market"><Icon v-if="marketFlag" :name="marketFlag" /><span>{{ market }}</span></div>
        <template v-if="showAction">
          <R4Button class="r4-productitem__action r4-productitem__action--text" type="secondary" size="medium" icon="ic-shopping-cart" text="Contratar" :aria-label="'Contratar ' + name" @click="onAction" />
          <R4Button class="r4-productitem__action r4-productitem__action--icon" type="secondary" size="medium" icon="ic-shopping-cart" :aria-label="'Contratar ' + name" @click="onAction" />
        </template>
      </div>
    </li>
  `,
})
