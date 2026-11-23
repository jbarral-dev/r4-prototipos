// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (R4InputPhone era VUE en el catálogo; en Figma es R4InputText Variant=Phone, campo `_Phone`).
// Doc de Confluence "Input Text (variante Phone)" (ene 2025): Pre Tab "+34" siempre, placeholder "000 000 000", el formato incorrecto se
// indica en el caption. No hay tabla de API: se usa la de R4InputText (label, caption, required, placeholder, status, modelValue).
// Reconstruido: Pre Tab "+34" con chevron-down (solo visual: no hay selector de prefijo definido), estados default/hover/focused/typing/
// filled/disabled/error. Por decisión de Jon (el `_Phone` de Figma es un componente viejo): el campo ocupa el 100 % del padre y usa los
// tokens nuevos (component/input/*, feedback/*) como R4InputText, no los antiguos "Interaction/Input/*" de `_Phone`.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

let uid = 0

export default defineComponent({
  name: 'R4InputPhone',
  components: { Icon },
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: 'Teléfono' },
    caption: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    status: { type: String, default: 'Default', validator: (v) => ['Default', 'Error'].includes(v) },
    placeholder: { type: String, default: '000 000 000' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    const id = `r4-input-phone-${++uid}`
    const classes = computed(() => ['r4-input-text', 'r4-input-phone', `r4-input-phone--${props.status.toLowerCase()}`, { 'r4-input-phone--disabled': props.disabled }])
    const inputAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== 'class' && k !== 'style')))
    const onInput = (e) => emit('update:modelValue', e.target.value)
    return { id, classes, inputAttrs, onInput }
  },
  template: `
    <div :class="[classes, $attrs.class]" :style="$attrs.style">
      <label v-if="label" class="r4-input-text__label" :for="id">
        <span class="r4-input-text__label-text">{{ label }}</span>
        <span v-if="!required" class="r4-input-text__optional">(opcional)</span>
      </label>
      <div class="r4-input-phone__field">
        <span class="r4-input-phone__tab"><span class="r4-input-phone__prefix"><span class="r4-input-phone__sr">Prefijo </span>+34</span><Icon name="chevron-down" /></span>
        <input class="r4-input-phone__input" :id="id" type="tel" inputmode="tel" autocomplete="tel-national" :value="modelValue" :placeholder="placeholder"
               :disabled="disabled" :aria-required="required ? 'true' : undefined" :aria-invalid="status === 'Error' ? 'true' : undefined"
               :aria-describedby="caption ? id + '-caption' : undefined" v-bind="inputAttrs" @input="onInput" />
      </div>
      <p v-if="caption" :id="id + '-caption'" class="r4-input-text__caption">{{ caption }}</p>
    </div>
  `,
})
