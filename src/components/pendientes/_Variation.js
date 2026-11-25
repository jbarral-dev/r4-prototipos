// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de _Variation (privado de R4TableCell › Type=Percentage; Figma Primitivos 1.2, componente `_Variation`, leído con use_figma).
// Props (las de Figma; _Variation no tiene página de API en Confluence): type (negative | positive | neutral), figure (texto ya formateado, p. ej. «3,15»), unit (p. ej. «%»).
// Anatomía: [signo] [cifra] [unidad], gap 2, Open Sans SemiBold 16; negative → signo «-» y chart/negative; positive → «+» y chart/positive; neutral → sin signo y text/muted.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Variation',
  props: {
    type: { type: String, default: 'neutral', validator: (v) => ['negative', 'positive', 'neutral'].includes(v) },
    figure: { type: String, required: true },
    unit: { type: String, default: '' },
  },
  setup(props) {
    const sign = computed(() => (props.type === 'negative' ? '-' : props.type === 'positive' ? '+' : ''))
    return { sign }
  },
  template: `<span :class="['r4-variation', 'r4-variation--' + type]"><span v-if="sign" class="r4-variation__sign">{{ sign }}</span><span>{{ figure }}</span><span v-if="unit">{{ unit }}</span></span>`,
})
