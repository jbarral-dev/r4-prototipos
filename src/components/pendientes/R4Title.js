// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de R4Title (Primitivos; era VUE en el catálogo). API = tabla «Propiedades componente» de Confluence (R4Title, 2798944260, v1.1.0, act. 2026-10-29, leída el 2026-11-14); NO se ha releído el componente en Figma
// (conector sin respuesta): los tamaños salen de la tabla de la doc y de los tokens de Typography (que ya cambian solos por breakpoint: móvil < 600, tablet desde 600, desktop desde 1024).
// Props: h (1 a 5; el nivel del encabezado, obligatorio y no cambia el aspecto), size (small | medium | large | extraLarge | extraLarge2; por defecto medium; es independiente de `h`), textAlign (left | center; por defecto left),
// loading (esqueleto de carga). El texto va en el slot por defecto (la doc: «solo texto, el del título»).
// NO reconstruido: `loading` (el Skeleton externo / R4Skeleton no está reconstruido; se avisa por consola).
// NOTA: el catálogo y las notas del repo decían `level` y `align`; la doc vigente usa `h` y `textAlign` (se ha seguido la doc). Sin `type` ni `tag` (la doc ya no los tiene).
import { defineComponent, h as vh } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Title',
  props: {
    h: { type: Number, required: true, validator: (v) => [1, 2, 3, 4, 5].includes(v) },
    size: { type: String, default: 'medium', validator: (v) => ['small', 'medium', 'large', 'extraLarge', 'extraLarge2'].includes(v) },
    textAlign: { type: String, default: 'left', validator: (v) => ['left', 'center'].includes(v) },
    loading: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    if (props.loading) console.warn('R4Title: `loading` (esqueleto) no está reconstruido')
    return () => vh('h' + props.h, { class: ['r4-title', 'r4-title--' + props.size, 'r4-title--align-' + props.textAlign] }, slots.default ? slots.default() : [])
  },
})
