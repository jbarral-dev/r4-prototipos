// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (R4InputTextarea, 6063:14983; era VUE en el catálogo). API = "API componente" de Confluence (R4InputTextarea, 2832695297, "API propuesta, validar con IT"):
// label, placeholder, value, caption, captionStatus (default | error), maxLength, rows (3), resizable (true), disabled, required.
// `value` se expone como `modelValue` (v-model), igual que R4InputText. variant=Error de Figma = captionStatus="error" (borde y caption en feedback/error + aria-invalid).
// showLabel / showCaption de Figma se deducen de label / caption. required=false → "(opcional)" en el label, como R4InputText.
// Accesibilidad según la doc: <textarea> nativo con <label for/id>, caption con aria-describedby, un único punto de foco.
// EXTRAS DEL PROTOTIPO (no están en la API de la doc; para el prompt del asistente del buscador unificado), todos opcionales y desactivados por defecto:
//   · autoGrow + maxRows: el alto crece con el texto hasta maxRows líneas y luego hace scroll.
//   · fontSize="medium" (body/m 16/24) en lugar del body/l 18/26 de Figma.
//   · submitOnEnter: Intro emite `submit` y Mays+Intro inserta salto de línea (la doc dice que Intro inserta salto: aquí solo con submitOnEnter).
//   · slot por defecto `actions`: contenido (un R4Button) dentro de la caja, fijo abajo a la derecha.
// NO reconstruido: estados disabled/hover leídos solo por analogía con R4InputText (mismos tokens component/input/*), contador de caracteres restantes (maxLength sin contador), resizer propio (se usa el nativo).
import { defineComponent, computed, ref, watch, nextTick, onMounted } from '../../../vendor/vue.esm-browser.prod.js'

let uid = 0

export default defineComponent({
  name: 'R4InputTextarea',
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: '' },
    caption: { type: String, default: undefined },
    captionStatus: { type: String, default: 'default', validator: (v) => ['default', 'error'].includes(v) },
    maxLength: { type: Number, default: undefined },
    rows: { type: Number, default: 3 },
    resizable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    // extras del prototipo
    autoGrow: { type: Boolean, default: false },
    maxRows: { type: Number, default: 6 },
    fontSize: { type: String, default: 'large', validator: (v) => ['large', 'medium'].includes(v) },
    submitOnEnter: { type: Boolean, default: false },
  },
  inheritAttrs: false, // aria-label y demás atributos van al <textarea>
  emits: ['update:modelValue', 'submit'],
  setup(props, { emit, attrs, slots }) {
    const id = `r4-textarea-${++uid}`
    const el = ref(null)
    const error = computed(() => props.captionStatus === 'error')
    const classes = computed(() => ['r4-textarea', 'r4-textarea--font-' + props.fontSize, { 'r4-textarea--error': error.value, 'r4-textarea--disabled': props.disabled, 'r4-textarea--grow': props.autoGrow, 'r4-textarea--has-actions': !!slots.default, 'r4-textarea--resizable': props.resizable && !props.autoGrow }])
    const grow = () => { const t = el.value; if (!props.autoGrow || !t) return; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }
    const onInput = (e) => { emit('update:modelValue', e.target.value); grow() }
    const onKeydown = (e) => { if (props.submitOnEnter && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); emit('submit', e) } }
    const focus = () => el.value?.focus()
    watch(() => props.modelValue, async () => { await nextTick(); grow() })
    onMounted(grow)
    const textareaAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== 'class' && k !== 'style')))
    return { id, el, classes, error, onInput, onKeydown, focus, textareaAttrs }
  },
  template: `
    <div :class="[classes, $attrs.class]" :style="$attrs.style">
      <label v-if="label" class="r4-textarea__label" :for="id">
        <span class="r4-textarea__label-text">{{ label }}</span>
        <span v-if="!required" class="r4-textarea__optional">(opcional)</span>
      </label>
      <div class="r4-textarea__field">
        <textarea ref="el" class="r4-textarea__input" :id="id" :rows="autoGrow ? 1 : rows" :style="autoGrow ? { '--r4-textarea-max-rows': maxRows } : undefined" :value="modelValue" :placeholder="placeholder"
                  :maxlength="maxLength" :disabled="disabled" :aria-required="required ? 'true' : undefined" :aria-invalid="error ? 'true' : undefined"
                  :aria-describedby="caption ? id + '-caption' : undefined" v-bind="textareaAttrs" @input="onInput" @keydown="onKeydown"></textarea>
        <div v-if="$slots.default" class="r4-textarea__actions"><slot /></div>
      </div>
      <p v-if="caption" :id="id + '-caption'" class="r4-textarea__caption">{{ caption }}</p>
    </div>
  `,
})
