// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Pseudocomponente `ProductDefaultLogo` de Figma (Específicos 1.0, nodo 10648:1455; lo usa R4PageTitleProduct): logo de relleno cuando un producto no tiene logotipo. Cuadrado (radio 0) sobre surface/muted con la inicial del nombre
// en mayúsculas (Exo 2 Light, text/default). Props de Figma: `name` (texto; aquí se usa su primera letra) y `size` (large 80 · medium 64 · small 40 · extraSmall 24; por defecto large). Tamaños de letra de Figma: 48 · 40 · 24 · 16 (line-height 20 en extraSmall).
// Decorativo: aria-hidden (el nombre del producto ya lo anuncia quien lo usa).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: '_ProductDefaultLogo',
  props: {
    name: { type: String, default: '' },
    size: { type: String, default: 'large', validator: (v) => ['large', 'medium', 'small', 'extraSmall'].includes(v) },
  },
  setup(props) { return { initial: computed(() => (props.name || '').trim().charAt(0)) } },
  template: `<span class="product-default-logo" :class="'product-default-logo--' + size" aria-hidden="true"><span class="product-default-logo__initial">{{ initial }}</span></span>`,
})
