// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-20127). La página de Confluence (R4Chip, 3614408732) NO tiene tabla de API:
// se usan las props de Figma deducidas — label, size (medium | small), type (simple | multiple), selected (= interaction=selected), disabled (= interaction=disabled),
// icon (= showIcon + icon) y badge (= showBadge + contador). Las demás interacciones (default / hover / focused / pressed) las resuelve el CSS.
// Semántica según la doc: <button> con aria-pressed (simple) y aria-disabled en disabled (tabindex -1).
// type=multiple (chip desplegable): chevron ic-angle-down / ic-angle-up según `expanded` (extra: = el panel que abre está desplegado) y badge de contador (solo con `selected` y `badge`).
//   Como abre un panel, usa aria-expanded en lugar de aria-pressed (la propia doc lo señala como pendiente: «aria-pressed donde debería ser aria-expanded»); aria-haspopup / aria-controls
//   los pasa quien lo usa (atributos).
// Reconstruido: type simple y multiple, size small y medium, icono opcional (a la izquierda; 16 en medium y 14 en small, gap 8 y 4, color icon/subdued), chevron y badge.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Badge from './R4Badge.js'

export default defineComponent({
  name: 'R4Chip',
  components: { Icon, R4Badge },
  props: {
    label: { type: String, required: true },
    icon: { type: String, default: undefined }, // = showIcon + icon de Figma (INSTANCE_SWAP): nombre del icono del registro; sin él no hay icono
    type: { type: String, default: 'simple', validator: (v) => ['simple', 'multiple'].includes(v) },
    size: { type: String, default: 'medium', validator: (v) => ['medium', 'small'].includes(v) },
    selected: { type: Boolean, default: false },
    expanded: { type: Boolean, default: false }, // extra (solo multiple): el panel que abre está desplegado → chevron hacia arriba y aria-expanded
    badge: { type: [String, Number], default: undefined }, // contador del badge (solo multiple + selected)
    badgeAriaLabel: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props) {
    const multiple = computed(() => props.type === 'multiple')
    const showBadge = computed(() => multiple.value && props.selected && props.badge !== undefined && props.badge !== null && props.badge !== '')
    return { multiple, showBadge }
  },
  template: `
    <button type="button" class="r4-chip" :class="['r4-chip--' + size, { 'r4-chip--multiple': multiple, 'is-selected': selected }]"
            :aria-pressed="multiple ? undefined : (selected ? 'true' : 'false')" :aria-expanded="multiple ? (expanded ? 'true' : 'false') : undefined"
            :aria-disabled="disabled ? 'true' : undefined" :tabindex="disabled ? -1 : undefined" @click="!disabled && $emit('click', $event)">
      <template v-if="multiple">
        <span class="r4-chip__left">
          <Icon v-if="icon" class="r4-chip__icon" :name="icon" />
          <span class="r4-chip__label">{{ label }}</span>
          <R4Badge v-if="showBadge" :label="badge" :outline="false" :aria-label="badgeAriaLabel" />
        </span>
        <Icon class="r4-chip__chevron" :name="expanded ? 'ic-angle-up' : 'ic-angle-down'" />
      </template>
      <template v-else>
        <Icon v-if="icon" class="r4-chip__icon" :name="icon" />
        <span class="r4-chip__label">{{ label }}</span>
      </template>
    </button>
  `,
})
