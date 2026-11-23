// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (Confluence R4Popover, 3797057537; no está en el catálogo). API = "API componente": width (narrow | default | wide | wider; por defecto narrow)
// y density (default | none; por defecto default) + slot por defecto. Es solo la superficie (surface): NO gestiona apertura, cierre ni posición; eso lo hace el padre
// (aquí, _ProductActionsMenu). Anchos: narrow 184 · default 240 · wide 320 · wider 480; padding 12; gap del slot 16 (density default) o 0 (none).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Popover',
  props: {
    width: { type: String, default: 'narrow', validator: (v) => ['narrow', 'default', 'wide', 'wider'].includes(v) },
    density: { type: String, default: 'default', validator: (v) => ['default', 'none'].includes(v) },
  },
  template: `
    <div class="r4-popover" :class="['r4-popover--' + width, 'r4-popover--density-' + density]"><slot /></div>
  `,
})
