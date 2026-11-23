// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo). API = tabla "API componente" de Confluence (R4InputCheckbox, 2810708014):
// type, orientation, label, caption, captionStatus, options [{ label, value, description?, disabled?, checked? }], required. Extra: modelValue (v-model).
// Figma: R4InputCheckbox = _Input Label/Default + _Checkbox Group (de `_CheckBox with Label`) + _Input Caption.
// Reconstruido: type=default; estados default/hover/focused/disabled; captionStatus default y error (aria-describedby + aria-invalid). Se ignoran description y checked (usa v-model).
// NO reconstruido: type button y buttonWithDescription, estado indeterminate y el tooltip (showTooltip).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

let uid = 0

export default defineComponent({
  name: 'R4InputCheckbox',
  props: {
    modelValue: { type: Array, default: () => [] },
    options: { type: Array, required: true },
    label: { type: String, default: undefined },
    caption: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    type: { type: String, default: 'default', validator: (v) => v === 'default' },
    captionStatus: { type: String, default: 'default', validator: (v) => ['default', 'error'].includes(v) },
    orientation: { type: String, default: 'vertical', validator: (v) => ['vertical', 'horizontal'].includes(v) },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const id = `r4-input-checkbox-${++uid}`
    const isChecked = (value) => props.modelValue.includes(value)
    const toggle = (value, checked) => {
      const next = checked ? [...props.modelValue, value] : props.modelValue.filter((v) => v !== value)
      emit('update:modelValue', next)
    }
    const classes = computed(() => ['r4-input-checkbox', `r4-input-checkbox--${props.captionStatus}`])
    return { id, isChecked, toggle, classes }
  },
  template: `
    <fieldset :class="classes" :aria-describedby="caption ? id + '-caption' : undefined" :aria-invalid="captionStatus === 'error' ? 'true' : undefined">
      <legend v-if="label" class="r4-input-checkbox__legend">
        <span class="r4-input-checkbox__legend-text">{{ label }}</span>
        <span v-if="!required" class="r4-input-checkbox__optional">(opcional)</span>
      </legend>
      <div class="r4-input-checkbox__group" :class="'r4-input-checkbox__group--' + orientation">
        <label v-for="(option, i) in options" :key="option.value" class="r4-input-checkbox__option" :class="{ 'r4-input-checkbox__option--disabled': option.disabled }">
          <input class="r4-input-checkbox__box" type="checkbox" :value="option.value" :checked="isChecked(option.value)" :disabled="option.disabled"
                 @change="toggle(option.value, $event.target.checked)" />
          <span class="r4-input-checkbox__text">{{ option.label }}</span>
        </label>
      </div>
      <p v-if="caption" :id="id + '-caption'" class="r4-input-checkbox__caption">{{ caption }}</p>
    </fieldset>
  `,
})
