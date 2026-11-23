// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (SIN VUE en el catálogo). API = "API componente" de Confluence (R4PageTitleProcess, 3879370753):
// title (obligatorio, siempre <h1>) y description (opcional). showDescription y mediaQuery son solo de Figma: en código la
// descripción se muestra si hay `description` y el breakpoint lo resuelve el CSS (container query `r4page`).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4PageTitleProcess',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: undefined },
  },
  template: `
    <div class="r4-page-title-process">
      <h1 class="r4-page-title-process__title">{{ title }}</h1>
      <p v-if="description" class="r4-page-title-process__description">{{ description }}</p>
    </div>
  `,
})
