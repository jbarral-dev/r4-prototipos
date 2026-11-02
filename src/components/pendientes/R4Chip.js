// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-20127). La página de Confluence (R4Chip, 3614408732) NO tiene tabla de API:
// se usan las props de Figma deducidas — label, size (medium | small), selected (= interaction=selected), disabled (= interaction=disabled)
// y type (simple). Las demás interacciones (default / hover / focused / pressed) las resuelve el CSS.
// Semántica según la doc: <button> con aria-pressed (selected) y aria-disabled en disabled (tabindex -1).
// Reconstruido: type=simple, size small y medium, con icono opcional (prop `icon`, a la izquierda; 16 en medium y 14 en small, gap 8 y 4, color icon/subdued). NO reconstruido: type=multiple (chip desplegable con chevron y badge), showBadge.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4Chip',
  components: { Icon },
  props: {
    label: { type: String, required: true },
    icon: { type: String, default: undefined }, // = showIcon + icon de Figma (INSTANCE_SWAP): nombre del icono del registro; sin él no hay icono
    type: { type: String, default: 'simple', validator: (v) => v === 'simple' },
    size: { type: String, default: 'medium', validator: (v) => ['medium', 'small'].includes(v) },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  template: `
    <button type="button" class="r4-chip" :class="['r4-chip--' + size, { 'is-selected': selected }]" :aria-pressed="selected ? 'true' : 'false'"
            :aria-disabled="disabled ? 'true' : undefined" :tabindex="disabled ? -1 : undefined" @click="!disabled && $emit('click', $event)">
      <Icon v-if="icon" class="r4-chip__icon" :name="icon" />
      <span class="r4-chip__label">{{ label }}</span>
    </button>
  `,
})
