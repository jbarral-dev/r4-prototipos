// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de _Rating (privado de R4TableCell › Type=Rating; Figma Primitivos 1.2, componente `_Rating`, leído con use_figma).
// Props: rating (1-5; Figma solo tiene variantes 1 a 5). Pinta SOLO las estrellas llenas (sin estrellas vacías), 16 px, gap 2, color icon/subdued. Sin rating (0) no pinta nada.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4Rating',
  components: { Icon },
  props: { rating: { type: Number, default: 0 } },
  template: `<span v-if="rating > 0" class="r4-rating" role="img" :aria-label="rating + ' de 5 estrellas'"><Icon v-for="n in rating" :key="n" name="star-filled" /></span>`,
})
