// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-21629 y SM-23760). API = "API componente" de Confluence
// (R4Breadcrumb, 3634266177): items (BreadcrumbItem[] = { label, href?, ariaLabel? }). El ÚLTIMO item, sin href, es la página actual
// (en Figma es el texto `currentPage`). El enlace Home es fijo (ic-home-alt, aria-label "Inicio").
// - mediaQuery (Figma) NO existe en código: lo resuelve el CSS (container query `r4page`).
//   Desktop/tablet: Home › niveles › página actual. Mobile (≤ 599): solo el enlace de retroceso "← [nivel padre]" (último nivel intermedio).
// - Changelog SM-23760 quitó el string "Volver a" y showHomeLabel; la página de Confluence (estados) aún dice «Volver a [parentName]»: se sigue Figma/Changelog.
// - Semántica según la doc: <nav aria-label="Breadcrumb"> > <ol> > <li>; la página actual es <span aria-current="page">; separadores y iconos aria-hidden.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import { iconComponent } from '../../icons/_Icon.js'

const IcHome = iconComponent('ic-home-alt')
const IcSep = iconComponent('ic-angle-right')
const IcBack = iconComponent('ic-arrow-left')

export default defineComponent({
  name: 'R4Breadcrumb',
  components: { IcHome, IcSep, IcBack },
  props: {
    items: { type: Array, default: () => [] }, // BreadcrumbItem[]: { label, href?, ariaLabel? }
    homeHref: { type: String, default: '#' }, // extra del prototipo: la API no define el destino de Home
  },
  setup(props) {
    const current = computed(() => (props.items.length && !props.items[props.items.length - 1].href ? props.items[props.items.length - 1] : null))
    const levels = computed(() => (current.value ? props.items.slice(0, -1) : props.items))
    return { current, levels }
  },
  template: `
    <nav class="r4-breadcrumb" aria-label="Breadcrumb">
      <ol class="r4-breadcrumb__list">
        <li class="r4-breadcrumb__item r4-breadcrumb__item--home">
          <a class="r4-breadcrumb__home" :href="homeHref" aria-label="Inicio"><IcHome /></a>
          <IcSep class="r4-breadcrumb__sep" />
        </li>
        <li v-for="(it, i) in levels" :key="it.href + i" class="r4-breadcrumb__item" :class="{ 'r4-breadcrumb__item--parent': i === levels.length - 1 }">
          <a class="r4-breadcrumb__link" :href="it.href" :aria-label="it.ariaLabel">
            <IcBack class="r4-breadcrumb__back" />
            <span>{{ it.label }}</span>
          </a>
          <IcSep class="r4-breadcrumb__sep" />
        </li>
        <li v-if="current" class="r4-breadcrumb__item r4-breadcrumb__item--current">
          <span class="r4-breadcrumb__current" aria-current="page">{{ current.label }}</span>
        </li>
      </ol>
    </nav>
  `,
})
