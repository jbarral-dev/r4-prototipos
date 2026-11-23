// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (R4InputEmail era VUE en el catálogo; en Figma es R4InputText Variant=E-mail, cuyo campo _Email es un
// _Text normal). No hay página de Confluence con API de R4InputEmail: se usa la API de R4InputText (label, caption, required,
// placeholder, status, modelValue). Añade type="email", inputmode="email" y autocomplete="email". Los atributos (aria-*, @blur…) pasan al <input>.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import R4InputText from './R4InputText.js'

export default defineComponent({
  name: 'R4InputEmail',
  components: { R4InputText },
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: 'E-mail' },
    caption: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    status: { type: String, default: 'Default' },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  template: `
    <R4InputText v-bind="$attrs" type="email" inputmode="email" autocomplete="email" :model-value="modelValue" :label="label" :caption="caption"
                 :required="required" :status="status" :placeholder="placeholder" @update:model-value="$emit('update:modelValue', $event)" />
  `,
})
