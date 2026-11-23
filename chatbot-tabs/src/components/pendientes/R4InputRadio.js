// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo). API = tabla "API componente" de Confluence (R4InputRadio, 2819883025; «API propuesta para Vue.js. Validar con IT»):
// type (default | button | buttonWithDescription), orientation (vertical | horizontal), label, caption, captionStatus (default | error), options [{ label, value, description?, disabled? }], selectedValue, required.
// Figma: R4InputRadio = _Input Label/Default + _Radio Button Group (de `_Radio Button`) + _Input Caption. Evento `change` (value) = analítica «R4InputRadio/Change» de la doc.
// Reconstruido: type=button, orientation=vertical, estados de cada opción (Inactive/Active × Default/Hover/Focused/Pressed/Disabled), captionStatus default y error (aria-describedby + aria-invalid).
// NO reconstruido (no leído): type=default (radio clásico, _RadioWithLabel/_Radio), type=buttonWithDescription, orientation=horizontal, el icono opcional de la opción (IconBlock) y `description`.
// Accesibilidad según la doc: fieldset + legend con role=radiogroup; <input type=radio> nativo con `name` compartido (un solo stop de Tab; flechas mueven el foco Y seleccionan: roving tabindex nativo).
// Discrepancia de Figma: _Radio Button mezcla tokens de generación antigua (Space/Padding/*, Space/Margin/*) con los nuevos; se usan sus equivalentes de la escala nueva (spacing-3 = 12, spacing-5 = 20, spacing-2 = 8, spacing-1 = 4).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

let uid = 0

export default defineComponent({
  name: 'R4InputRadio',
  components: { Icon },
  props: {
    options: { type: Array, required: true },
    selectedValue: { type: String, default: undefined },
    label: { type: String, default: undefined },
    caption: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    type: { type: String, default: 'button', validator: (v) => v === 'button' },
    orientation: { type: String, default: 'vertical', validator: (v) => v === 'vertical' },
    captionStatus: { type: String, default: 'default', validator: (v) => ['default', 'error'].includes(v) },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const id = `r4-input-radio-${++uid}`
    const classes = computed(() => ['r4-input-radio', `r4-input-radio--${props.captionStatus}`])
    const onChange = (value) => { if (value !== props.selectedValue) emit('change', value) }
    return { id, classes, onChange }
  },
  template: `
    <fieldset :class="classes" role="radiogroup" :aria-describedby="caption ? id + '-caption' : undefined" :aria-invalid="captionStatus === 'error' ? 'true' : undefined" :aria-required="required ? 'true' : undefined">
      <legend v-if="label" class="r4-input-radio__legend">
        <span class="r4-input-radio__legend-text">{{ label }}</span>
        <span v-if="!required" class="r4-input-radio__optional">(opcional)</span>
      </legend>
      <div class="r4-input-radio__group">
        <label v-for="option in options" :key="option.value" class="r4-input-radio__option" :class="{ 'r4-input-radio__option--disabled': option.disabled }">
          <input class="r4-input-radio__input" type="radio" :name="id" :value="option.value" :checked="option.value === selectedValue" :disabled="option.disabled" @change="onChange(option.value)" />
          <span class="r4-input-radio__text">{{ option.label }}</span>
          <Icon class="r4-input-radio__check" name="check" aria-hidden="true" />
        </label>
      </div>
      <p v-if="caption" :id="id + '-caption'" class="r4-input-radio__caption">{{ caption }}</p>
    </fieldset>
  `,
})
