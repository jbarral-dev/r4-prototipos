// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Componente NUEVO (propuesta de Jon, 2026-11-14; sin Figma, Confluence ni catálogo): lista de productos. Contenedor `R4ProductList` + hijo `productItem` (_ProductItem.js). Look & feel del resultado de búsqueda
// (R4SearchResults / searchResultItem). Dos versiones por prop, para probar las dos posturas de «Productos relacionados»: con precio y variación (`showPrice`) o sin precio, con el mercado (`showMarket`).
// Props (propuesta): items ({ name, meta?, market?, marketFlag?, price?, variation?, tone?, logo?, href? }[]), showPrice (por defecto true), showMarket (por defecto, solo sin precio), ariaLabel, showAction (por defecto false: botón «Contratar» por fila, añadido por Jon el 2026-11-14; reabre el botón de compra que se había quitado de las filas, la rama por defecto no cambia). Eventos: select (item, evento); action (item, evento) al pulsar «Contratar».
// Semántica: <ul> con <li> por producto; cada fila lleva a la ficha del producto (no a contratar).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import _ProductItem from './_ProductItem.js'

export default defineComponent({
  name: 'R4ProductList',
  components: { ProductItem: _ProductItem },
  props: {
    items: { type: Array, required: true },
    showPrice: { type: Boolean, default: true },
    showMarket: { type: Boolean, default: undefined },
    showAction: { type: Boolean, default: false },
    ariaLabel: { type: String, default: undefined },
  },
  emits: ['select', 'action'],
  template: `
    <ul class="r4-productlist" :aria-label="ariaLabel">
      <ProductItem v-for="(it, i) in items" :key="i" v-bind="it" :show-price="showPrice" :show-market="showMarket" :show-divider="true" :show-action="showAction" @select="$emit('select', it, $event)" @action="$emit('action', it, $event.event)" />
    </ul>
  `,
})
