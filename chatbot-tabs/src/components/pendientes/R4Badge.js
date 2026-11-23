// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (SIN VUE en el catálogo; Confluence R4Badge, 3606544393, NO tiene tabla de API: se usan las propiedades de Figma deducidas).
// Figma: outline (Yes | No), style (Positive | Negative), values (Units | Tens | None) y label. Aquí: `outline` (por defecto true), `style` → `tone` (positive | negative; `style` es atributo
// HTML, mismo motivo que R4Section), `label` (string) y `values` se deduce: sin label es el punto (None, 12×12); units/tens lo resuelve el CSS por el ancho del texto.
// Accesibilidad según la doc: informativo = <span> con aria-label y aria-live="polite" (pasa `ariaLabel`); el punto lleva aria-hidden="true"; sin foco ni eventos.
// Reconstruido: positive y negative, con y sin outline, units/tens/none. El color del punto lo puede fijar el padre con --r4-badge-bg (los puntos de las series del gráfico).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Badge',
  props: {
    label: { type: [String, Number], default: undefined },
    tone: { type: String, default: 'positive', validator: (v) => ['positive', 'negative'].includes(v) },
    outline: { type: Boolean, default: true },
    ariaLabel: { type: String, default: undefined },
  },
  setup(props) {
    const dot = computed(() => props.label === undefined || props.label === null || props.label === '')
    return { dot }
  },
  template: `
    <span class="r4-badge" :class="['r4-badge--' + tone, { 'r4-badge--dot': dot, 'r4-badge--outline': outline }]" :aria-hidden="dot ? 'true' : undefined"
          :aria-label="dot ? undefined : ariaLabel" :aria-live="dot ? undefined : 'polite'">{{ dot ? '' : label }}</span>
  `,
})
