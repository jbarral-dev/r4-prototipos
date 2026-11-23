// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma: componente "R4 / Brand / Types" (Menu, archivo Templates 1.0). SVG exportado tal cual.
// Props como en Figma: Theme (Light | Dark), Variant (Black | Red | White), Content (Imagotype | Isotype).
// Reconstruido: Content=Isotype para Light/Black, Light/Red y Dark/White (las exportadas). NO reconstruido: Imagotype ni el
// resto de combinaciones (el logotipo completo del Menu en desktop es el hijo privado _MenuBranding).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

const ISOTYPE_PATH = 'M0 0V31.7433H32.246V0H0ZM10.6305 12.1001V25.7271H6.12722V11.7712C6.12722 8.64706 8.6585 6.10557 11.8135 6.02543C11.8639 6.0246 11.9136 6.0246 11.964 6.0246H18.6365L16.5046 10.4577H12.2553C11.3547 10.4815 10.6305 11.2073 10.6305 12.1001ZM24.4737 17.8463C24.4877 17.8463 24.503 17.8463 24.5165 17.8476C25.0427 17.8605 25.5083 18.113 25.8051 18.4987C25.8157 18.5141 25.828 18.53 25.8398 18.5459C25.8598 18.5751 25.8801 18.6051 25.8988 18.6356C26.0531 18.8844 26.1413 19.1761 26.1413 19.4888V25.7275H21.6393V21.6241H16.293C16.1625 21.6241 16.0344 21.6091 15.9127 21.5807C15.1745 21.4108 14.6255 20.7601 14.6255 19.9821C14.6255 19.7317 14.6823 19.4938 14.7853 19.2809L14.843 19.1603L15.6329 17.5178H15.6337L21.161 6.02502H26.1426L20.4699 17.8463H24.4737Z'

const FILLS = {
  'Light/Black': { fill: 'black', opacity: '0.88' },
  'Light/Red': { fill: '#8C2F3F' },
  'Dark/White': { fill: 'white' },
}

export default defineComponent({
  name: 'R4BrandTypes',
  props: {
    theme: { type: String, default: 'Light', validator: (v) => ['Light', 'Dark'].includes(v) },
    variant: { type: String, default: 'Black', validator: (v) => ['Black', 'Red', 'White'].includes(v) },
    content: { type: String, default: 'Isotype', validator: (v) => ['Imagotype', 'Isotype'].includes(v) },
  },
  setup(props) {
    const key = computed(() => `${props.theme}/${props.variant}`)
    const paint = computed(() => FILLS[key.value])
    if (props.content !== 'Isotype' || !FILLS[`${props.theme}/${props.variant}`]) {
      console.warn('R4BrandTypes: solo están reconstruidos Content=Isotype con Light/Black, Light/Red y Dark/White')
    }
    return { paint, path: ISOTYPE_PATH }
  },
  template: `
    <svg class="r4-brand-types" width="32.246" height="31.743" viewBox="0 0 33 32" fill="none" role="img" aria-label="Renta 4">
      <path :d="path" :fill="paint ? paint.fill : 'currentColor'" :fill-opacity="paint && paint.opacity" />
    </svg>
  `,
})
