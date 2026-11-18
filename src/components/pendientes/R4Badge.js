// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (SIN VUE en el catálogo). Confluence R4Badge (3606544393), releída el 2026-11-18 (Jon la actualizó): propuesta de API pendiente de validar con IT, con tres estilos.
// Figma: outline (Yes | No), style (Positive | Negative | Highlight), values (Units | Tens | None) y label. API de la doc: `label`, `style` (positive | negative | highlight; por defecto positive), `outline` (por defecto true),
// `ariaLabel` y `decorative` (aria-hidden; obligatorio en el dot). Aquí `style` se llama `tone` (`style` es un atributo HTML y el padre pasa estilos al raíz: --r4-badge-bg; mismo motivo que R4Section): DISCREPANCIA con la doc, a decidir con Jon.
// `values` se deduce: sin label es el punto (None, 12×12); units/tens lo resuelve el CSS por el ancho del texto.
// Accesibilidad según la doc: informativo = <span> con aria-label y aria-live="polite"; el punto y `decorative` llevan aria-hidden="true"; sin foco ni eventos.
// Reconstruido: positive, negative y highlight, con y sin outline, units/tens/none. El color del punto lo puede fijar el padre con --r4-badge-bg (los puntos de las series del gráfico).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Badge',
  props: {
    label: { type: [String, Number], default: undefined },
    tone: { type: String, default: 'positive', validator: (v) => ['positive', 'negative', 'highlight'].includes(v) },
    outline: { type: Boolean, default: true },
    ariaLabel: { type: String, default: undefined },
    decorative: { type: Boolean, default: false }, // aria-hidden="true": obligatorio en el dot y cuando el contenedor ya comunica el conteo
  },
  setup(props) {
    const dot = computed(() => props.label === undefined || props.label === null || props.label === '')
    const hidden = computed(() => dot.value || props.decorative)
    return { dot, hidden }
  },
  template: `
    <span class="r4-badge" :class="['r4-badge--' + tone, { 'r4-badge--dot': dot, 'r4-badge--outline': outline }]" :aria-hidden="hidden ? 'true' : undefined"
          :aria-label="hidden ? undefined : ariaLabel" :aria-live="hidden ? undefined : 'polite'">{{ dot ? '' : label }}</span>
  `,
})
