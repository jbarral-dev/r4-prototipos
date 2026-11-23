// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4InputText (era VUE en el catálogo). API = tabla de Confluence "Input Text" (2798649391, de enero 2025,
// pendiente de actualizar): label, caption, required, placeholder, status (Default | Error | Success; la doc añade Warning, que Figma no tiene en R4InputText).
// showLabel/showCaption de Figma se deducen de label/caption. Extras necesarios que la tabla no lista: modelValue (v-model), disabled y readonly.
// NO reconstruido (no leído a fondo): las otras 9 variantes (Amount, IBAN, Phone, User, NIF, Password, E-mail, DataPicker, Number),
// iconos izquierdo/derecho, prefijo/sufijo, contador (showCount), botón del label y de la caption, y los _Text Info/Warning
// (no existen como Status de R4InputText).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

let uid = 0

export default defineComponent({
  name: 'R4InputText',
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: undefined }, // la doc lo marca obligatorio; con aria-label se puede omitir el visible
    caption: { type: String, default: undefined },
    required: { type: Boolean, default: false }, // false → el label muestra "(opcional)" (tabla de la doc; el texto de la doc dice lo contrario)
    status: { type: String, default: 'Default', validator: (v) => ['Default', 'Error', 'Success'].includes(v) },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    name: { type: String, default: undefined },
  },
  inheritAttrs: false, // aria-label y demás atributos van al <input>, no al contenedor
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    const id = `r4-input-text-${++uid}`
    const classes = computed(() => ['r4-input-text', `r4-input-text--${props.status.toLowerCase()}`, { 'r4-input-text--disabled': props.disabled }])
    const onInput = (e) => emit('update:modelValue', e.target.value)
    const inputAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "class" && k !== "style")))
    return { id, classes, onInput, inputAttrs }
  },
  template: `
    <div :class="[classes, $attrs.class]" :style="$attrs.style">
      <label v-if="label" class="r4-input-text__label" :for="id">
        <span class="r4-input-text__label-text">{{ label }}</span>
        <span v-if="!required" class="r4-input-text__optional">(opcional)</span>
      </label>
      <div class="r4-input-text__field">
        <input class="r4-input-text__input" :id="id" type="text" :name="name" :value="modelValue" :placeholder="placeholder || ' '"
               :disabled="disabled" :readonly="readonly" :aria-required="required ? 'true' : undefined"
               :aria-invalid="status === 'Error' ? 'true' : undefined" :aria-describedby="caption ? id + '-caption' : undefined"
               v-bind="inputAttrs" @input="onInput" />
      </div>
      <p v-if="caption" :id="id + '-caption'" class="r4-input-text__caption">{{ caption }}</p>
    </div>
  `,
})
