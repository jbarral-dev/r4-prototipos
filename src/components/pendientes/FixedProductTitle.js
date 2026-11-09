// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de `fixedProductTitleLayer` (componente local del archivo "Proyectos - Fichas de Productos", 2756:76562; variantes mediaQuery = mobile | desktop; sin página de
// Confluence ni entrada en el catálogo). Es la capa que, al hacer scroll y salir R4PageTitleProduct del viewport, queda fija justo debajo de la cabecera.
//   · mobile (< 600): logo 24 + nombre del producto (truncado) a la izquierda; variación (12) y precio (16) a la derecha.
//   · desktop y tablet (≥ 600; tablet no tiene diseño): logo 32, nombre en body/l, separador y mercado (bandera 16 + nombre del índice/mercado), variación (12), precio (20) y botón «Contratar» medium.
//     (Releído el 2026-11-09 tras los ajustes de Jon en Figma: alto 56, antes 72.)
// mediaQuery NO es una prop (decisión de Jon): lo resuelve el CSS por el ancho del contenedor `r4page`; se renderizan los elementos de ambas variantes y el CSS oculta los que no tocan.
// Asociada a R4PageTitleProduct (Jon): la pantalla la muestra cuando el título emite `visible-change = false`; va en la cabecera sticky, debajo del Menu. Aparece y desaparece con fundido
// (0,2 s; sin animación con prefers-reduced-motion).
// Props (propias del prototipo; sin API definida): productName, logoURL, price, currency, variation (número, % con signo), market ({ name, flag }), ctaText, visible. Evento `cta`.
// El botón «Contratar» es el único elemento interactivo y solo existe en la variante desktop (en mobile las acciones van en el R4ButtonDock).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import R4Button from './R4Button.js'
import Icon from '../../icons/_Icon.js'

const fmt = (n) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export default defineComponent({
  name: 'FixedProductTitle',
  components: { R4Button, Icon },
  props: {
    productName: { type: String, required: true },
    logoURL: { type: String, default: undefined },
    price: { type: Number, required: true },
    currency: { type: String, default: 'EUR' },
    variation: { type: Number, default: undefined },
    market: { type: Object, default: undefined }, // { name, flag }
    ctaText: { type: String, default: 'Contratar' },
    visible: { type: Boolean, default: false },
  },
  emits: ['cta'],
  setup(props) {
    const symbol = computed(() => ({ EUR: '€', USD: '$', GBP: '£' }[props.currency] || props.currency))
    const sign = computed(() => (props.variation >= 0 ? '+' : '-'))
    return { symbol, sign, fmt }
  },
  template: `
    <Transition name="r4-fixedproducttitle">
    <div v-show="visible" class="r4-fixedproducttitle" :aria-hidden="visible ? undefined : 'true'">
      <div class="r4-fixedproducttitle__inner">
        <div class="r4-fixedproducttitle__left">
          <img v-if="logoURL" class="r4-fixedproducttitle__logo" :src="logoURL" alt="" aria-hidden="true" />
          <span class="r4-fixedproducttitle__name">{{ productName }}</span>
          <span v-if="market" class="r4-fixedproducttitle__market">
            <Icon v-if="market.flag" :name="market.flag" />
            <span>{{ market.name }}</span>
          </span>
        </div>
        <div class="r4-fixedproducttitle__right">
          <span class="r4-fixedproducttitle__figures">
            <span v-if="variation !== undefined" class="r4-fixedproducttitle__variation" :class="variation >= 0 ? 'is-positive' : 'is-negative'">({{ sign }}{{ fmt(Math.abs(variation)) }}%)</span>
            <span class="r4-fixedproducttitle__price">{{ fmt(price) }}{{ symbol }}</span>
          </span>
          <R4Button class="r4-fixedproducttitle__cta" type="primary" size="medium" :text="ctaText" @click="$emit('cta')" />
        </div>
      </div>
    </div>
    </Transition>
  `,
})
