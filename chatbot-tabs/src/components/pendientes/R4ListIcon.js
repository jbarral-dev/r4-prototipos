// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (R4ListIcon, Primitivos 1.2 `12637:1496`; era VUE en el catálogo) leyendo las 8 variantes (color × size) con `use_figma`. API = tabla «API componente» de Confluence (R4ListIcon, 3875897346, propuesta «validar con IT»):
// items = [{ icon, text, tag?: { text, color } }] (obligatorio), size (extraLarge | large | medium | small; por defecto large) y color (black | darkGray; por defecto black). Las props de Figma que solo sirven para diseñar
// (showListItemIcon 1–7, showIcon) se deducen del contenido de `items`. Sin interactividad ni estados.
// Medidas de Figma (gap entre ítems · gap icono-texto · icono · tipografía): extraLarge 24 · 20 · 28 · 20/28 | large 20 · 16 · 26 · 18/26 | medium 16 · 12 · 22 · 16/24 | small 16 · 8 · 20 · 14/20.
// Color: black = text/default e icon/default; darkGray = text/subdued e icon/subdued. Discrepancia doc ↔ Figma: el size por defecto es `large` en la API y `extraLarge` en Figma (se usa el de la API).
// Accesibilidad según la doc: <ul> + <li>; iconos decorativos (aria-hidden); el R4Tag se lee como parte del ítem. NO reconstruido: nada de lo leído (el R4Tag opcional usa el R4Tag reconstruido, size small).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Tag from './R4Tag.js'

export default defineComponent({
  name: 'R4ListIcon',
  components: { Icon, R4Tag },
  props: {
    items: { type: Array, required: true },
    size: { type: String, default: 'large', validator: (v) => ['extraLarge', 'large', 'medium', 'small'].includes(v) },
    color: { type: String, default: 'black', validator: (v) => ['black', 'darkGray'].includes(v) },
  },
  template: `
    <ul class="r4-listicon" :class="['r4-listicon--' + size, 'r4-listicon--' + color]">
      <li v-for="(it, i) in items" :key="i" class="r4-listicon__item">
        <Icon class="r4-listicon__icon" :name="it.icon" />
        <span class="r4-listicon__content"><span class="r4-listicon__text">{{ it.text }}</span><R4Tag v-if="it.tag" :color="it.tag.color" size="small" :text="it.tag.text" /></span>
      </li>
    </ul>
  `,
})
