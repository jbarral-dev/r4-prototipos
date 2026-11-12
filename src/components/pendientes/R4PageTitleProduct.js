// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4PageTitleProduct (Específicos; catálogo: AEM, «Figma en progreso»; Confluence 3876028437, act. 8 oct 2026). Componente viejo/sin revisar:
// Figma y la doc traen `mediaQuery` y toda la visibilidad con booleanos (showLogo, showTicker…): en código NO existen (decisión de Jon: sin mediaQuery, lo resuelve el CSS
// por el ancho del contenedor `r4page`; lo opcional se deduce de los datos).
// API = tabla "API componente" (propuesta, «validar con IT»): productName (obligatorio), ticker, isin, index, price (number), currency ('EUR'), riskLevel, logoURL, breadcrumbs
// ({ label, href }[]), derivativeOptions, ctaText ('Contratar'), secondaryActions ({ label, onClick }[]).
// Extras del prototipo (datos que la tabla no recoge pero Figma muestra; avisados): tags ({ text, color, bordered?, icon? }[]: R4Tag tras el mercado, p. ej. «Europa» de CAIFE), variation (número, % con signo), updated ('11:39h'), market ({ name, flag }),
// priceTarget ({ label, value, recommendation }), favourite (boolean) y eventos `favourite` / `cta` / `visible-change` (el producto entra/sale del viewport:
// lo usa la Template para mostrar FixedProductTitle en mobile).
// NO reconstruido: riskLevel (R4RiskBox/_RiskIndicator), ticker/isin/index/gestora/Morningstar (metadatos de otras fichas), combo de derivados (R4Chip multiple),
// secondary action de la doc (p. ej. «Crear plan» en fondos).
// Accesibilidad según la doc: breadcrumb <nav>; nombre del producto = <h1>; logo decorativo (aria-hidden); favorito con aria-pressed; la rentabilidad lleva el signo (+/-).
// Mobile (Figma): las acciones se muestran en el R4ButtonDock (capa fija); aquí quedan ocultas por CSS por debajo de 600 px. La Template monta el dock.
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import R4Breadcrumb from './R4Breadcrumb.js'
import R4Button from './R4Button.js'
import R4Tag from './R4Tag.js'
import _ProductActionsMenu from './_ProductActionsMenu.js'
import Icon from '../../icons/_Icon.js'

const fmt = (n, d = 2) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n)

export default defineComponent({
  name: 'R4PageTitleProduct',
  components: { R4Breadcrumb, R4Button, R4Tag, ProductActionsMenu: _ProductActionsMenu, Icon },
  props: {
    productName: { type: String, required: true },
    price: { type: Number, default: undefined },
    currency: { type: String, default: 'EUR' },
    logoURL: { type: String, default: undefined },
    breadcrumbs: { type: Array, default: () => [] },
    ctaText: { type: String, default: 'Contratar' },
    secondaryActions: { type: Array, default: () => [] },
    // extras del prototipo
    variation: { type: Number, default: undefined },
    updated: { type: String, default: undefined },
    market: { type: Object, default: undefined }, // { name, flag }
    tags: { type: Array, default: () => [] }, // R4Tag de metadatos: { text, color, bordered, icon }
    priceTarget: { type: Object, default: undefined }, // { label, value, recommendation }
    favourite: { type: Boolean, default: false },
  },
  emits: ['favourite', 'cta', 'visible-change'],
  setup(props, { emit }) {
    const root = ref(null)
    const isFav = ref(props.favourite)
    const toggleFav = () => { isFav.value = !isFav.value; emit('favourite', isFav.value) }
    const symbol = computed(() => ({ EUR: '€', USD: '$', GBP: '£' }[props.currency] || props.currency))
    const priceText = computed(() => (props.price === undefined ? '' : fmt(props.price, props.price < 1 ? 3 : 2)))
    const variationText = computed(() => (props.variation === undefined ? '' : fmt(Math.abs(props.variation))))
    const sign = computed(() => (props.variation >= 0 ? '+' : '−'))
    const tone = computed(() => (props.variation >= 0 ? 'positive' : 'negative'))

    // Avisa a la Template cuando el bloque sale del viewport (por debajo de la cabecera fija) para mostrar FixedProductTitle (todos los anchos).
    // El margen superior es la altura real del Menu (134 en desktop, 56 en tablet/mobile); se recalcula al cambiar el tamaño de la ventana.
    let io = null
    const observe = () => {
      if (io) io.disconnect()
      // Con la cabecera `headerSticky="main"` solo la barra principal queda fija (el .menu es display: contents y no tiene caja): se mide esa barra.
      const bar = [...document.querySelectorAll('.template-detail__header--main .menu__main, .template-detail__header--main .menu__compact')].find((el) => el.getClientRects().length)
      const menu = root.value.closest('.template-detail__header, body')?.querySelector('.menu')
      const top = bar ? bar.getBoundingClientRect().height : menu ? menu.getBoundingClientRect().height : parseFloat(getComputedStyle(root.value).getPropertyValue('--r4-menu-height')) || 0
      io = new IntersectionObserver(([e]) => emit('visible-change', e.isIntersecting), { rootMargin: `-${Math.round(top)}px 0px 0px 0px` })
      io.observe(root.value)
    }
    onMounted(() => { observe(); window.addEventListener('resize', observe) })
    onBeforeUnmount(() => { window.removeEventListener('resize', observe); io && io.disconnect() })

    return { root, isFav, toggleFav, symbol, priceText, variationText, sign, tone }
  },
  template: `
    <div ref="root" class="r4-pagetitleproduct">
      <R4Breadcrumb v-if="breadcrumbs.length" :items="breadcrumbs" />
      <div class="r4-pagetitleproduct__title">
        <div class="r4-pagetitleproduct__data">
          <img v-if="logoURL" class="r4-pagetitleproduct__logo" :src="logoURL" alt="" aria-hidden="true" />
          <div class="r4-pagetitleproduct__info">
            <div class="r4-pagetitleproduct__name">
              <h1 class="r4-pagetitleproduct__heading">{{ productName }}</h1>
              <button type="button" class="r4-pagetitleproduct__fav" :class="{ 'is-added': isFav }" :aria-pressed="isFav ? 'true' : 'false'" :aria-label="isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'" @click="toggleFav">
                <Icon :name="isFav ? 'ic-star-24--solid' : 'ic-star-24'" />
              </button>
            </div>
            <div v-if="market || tags.length" class="r4-pagetitleproduct__metadata">
              <span v-if="market" class="r4-pagetitleproduct__market"><Icon v-if="market.flag" :name="market.flag" /><span>{{ market.name }}</span></span>
              <R4Tag v-for="t in tags" :key="t.text" size="small" v-bind="t" />
            </div>
          </div>
        </div>

        <div class="r4-pagetitleproduct__price-actions">
          <div class="r4-pagetitleproduct__left">
            <div class="r4-pagetitleproduct__price">
              <span class="r4-pagetitleproduct__amount"><span class="r4-pagetitleproduct__amount-value">{{ priceText }}</span><span class="r4-pagetitleproduct__currency">{{ symbol }}</span></span>
              <span v-if="variation !== undefined" class="r4-pagetitleproduct__variation" :class="'is-' + tone"><span>{{ sign }}</span><span class="r4-pagetitleproduct__variation-value">{{ variationText }}</span><span class="r4-pagetitleproduct__variation-unit">%</span></span>
              <span v-if="updated" class="r4-pagetitleproduct__updated">{{ updated }}</span>
            </div>
            <div v-if="priceTarget" class="r4-pagetitleproduct__target">
              <span class="r4-pagetitleproduct__target-info">
                <Icon name="ic-bullseye-arrow" />
                <span class="r4-pagetitleproduct__target-label">{{ priceTarget.label }}</span>
                <span class="r4-pagetitleproduct__target-value">{{ priceTarget.value }}</span>
              </span>
              <R4Tag v-if="priceTarget.recommendation" size="small" color="neutralDark" icon="ic-tachometer-average" :text="priceTarget.recommendation" />
            </div>
          </div>
          <div class="r4-pagetitleproduct__actions">
            <ProductActionsMenu v-if="secondaryActions.length" :actions="secondaryActions" placement="down" />
            <R4Button type="primary" icon="ic-shopping-cart" :text="ctaText" @click="$emit('cta')" />
          </div>
        </div>
      </div>
    </div>
  `,
})
