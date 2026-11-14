// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Contenedor de la dupla R4SearchResults + searchResultItem (el hijo es _SearchResultItem.js: diseño con mercado del buscador, sin precio). Es solo la lista semántica (<ul>): los resultados (searchResultItem) van en el slot
// por defecto. Hasta ahora cada panel escribía su propio <ul>; `class` y `aria-label` pasan al <ul>, así el DOM y el CSS de cada panel no cambian.
// Nombre propuesto (Jon, 2026-11-14): R4SearchResults + searchResultItem (no está en Confluence ni en el catálogo).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4SearchResults',
  template: `<ul class="r4-searchresults"><slot /></ul>`,
})
