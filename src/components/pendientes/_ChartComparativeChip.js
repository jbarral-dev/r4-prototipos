// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Componente adhoc de Figma (`_chartComparativeChip`, "Proyectos - Fichas de Productos", interaction=default): chip de la serie que se está comparando en R4ChartLine.
// Anatomía leída: punto de color de la serie (R4Badge values=none, outline Yes, relleno chart/series/N/solid) + ticker + aspa opcional (ic-times) para quitar la serie.
// No es el R4Chip: no es un toggle ni se selecciona; es una etiqueta de leyenda. La primera serie (el producto de la ficha) no lleva aspa; la comparada, sí.
// Props deducidas: ticker, color (1–4: la serie del gráfico), removable (por defecto false) y removeLabel (nombre accesible del aspa). Evento `remove`.
// Accesibilidad (no hay frames de Figma): <li> de una lista de series; el aspa es un <button> con aria-label.
// NO reconstruido: estados hover / focused del aspa (Figma solo tiene interaction=default).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Badge from './R4Badge.js'

export default defineComponent({
  name: '_ChartComparativeChip',
  components: { Icon, R4Badge },
  props: {
    ticker: { type: String, required: true },
    color: { type: Number, default: 1, validator: (v) => v >= 1 && v <= 4 },
    removable: { type: Boolean, default: false },
    removeLabel: { type: String, default: undefined },
  },
  emits: ['remove'],
  template: `
    <li class="r4-chartcomparativechip">
      <R4Badge class="r4-chartcomparativechip__dot" :style="{ '--r4-badge-bg': 'var(--chart-series-' + color + '-solid)' }" />
      <span class="r4-chartcomparativechip__ticker">{{ ticker }}</span>
      <button v-if="removable" type="button" class="r4-chartcomparativechip__remove" :aria-label="removeLabel || 'Quitar ' + ticker" @click="$emit('remove', $event)"><Icon name="close" /></button>
    </li>
  `,
})
