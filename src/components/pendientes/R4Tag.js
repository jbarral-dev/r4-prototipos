// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-16547). API = "API componente" de Confluence (R4Tag, 2831843570):
// text (obligatorio), color (red | blue | green | amber | neutralDark | neutralLight; por defecto red), size (small | medium; por defecto small),
// bordered (boolean), icon (nombre del icono). <span> inline, icono decorativo (aria-hidden), sin interacción.
// Reconstruido: color neutralDark, neutralLight y blue (sin borde; blue leído solo en small), size small y medium. NO reconstruido (no leído): red, green, amber y bordered=true;
// si se piden se avisa por consola.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4Tag',
  components: { Icon },
  props: {
    text: { type: String, required: true },
    color: { type: String, default: 'red', validator: (v) => ['red', 'blue', 'green', 'amber', 'neutralDark', 'neutralLight'].includes(v) },
    size: { type: String, default: 'small', validator: (v) => ['small', 'medium'].includes(v) },
    bordered: { type: Boolean, default: false },
    icon: { type: String, default: undefined },
  },
  setup(props) {
    if (!['neutralDark', 'neutralLight', 'blue'].includes(props.color) || props.bordered) {
      console.warn('R4Tag: solo están reconstruidos color neutralDark, neutralLight y blue sin borde')
    }
  },
  template: `
    <span class="r4-tag" :class="['r4-tag--' + size, 'r4-tag--' + color]">
      <Icon v-if="icon" :name="icon" />
      <span class="r4-tag__text">{{ text }}</span>
    </span>
  `,
})
