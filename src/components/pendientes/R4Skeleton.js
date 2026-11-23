// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de R4Skeleton (catálogo: SIN VUE; Confluence 3165159428, leída el 2026-11-24; Figma Primitivos 1.2 26305:7381). Formas primitivas de carga que se combinan libremente: `shape` = title (240×20) · paragraph (320×14) · image (200×140, radio 8) ·
// circle (40, radio completo) · chip (80×28, radio de chip); por defecto title. Relleno: degradado horizontal surface/subtle → surface/muted (Figma: #f7f7f7 → #e0e0e0) con animación shimmer en código (un brillo que recorre la forma); con
// prefers-reduced-motion queda el degradado estático. Puramente visual: aria-hidden; quien lo usa pone aria-busy en la región y un texto oculto «Cargando contenido». El tamaño se puede sobrescribir con `width` y `height` (extra: la doc pide «mismas dimensiones que el contenido real»).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Skeleton',
  props: {
    shape: { type: String, default: 'title', validator: (v) => ['title', 'paragraph', 'image', 'circle', 'chip'].includes(v) },
    width: { type: String, default: undefined },
    height: { type: String, default: undefined },
  },
  setup(props) { return { style: computed(() => ({ ...(props.width ? { width: props.width } : {}), ...(props.height ? { height: props.height } : {}) })) } },
  template: `<span class="r4-skeleton" :class="'r4-skeleton--' + shape" :style="style" aria-hidden="true"></span>`,
})
