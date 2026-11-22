// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (R4Prompt, archivo «Proyectos - Chatbot» 0eUPLYaq9ac7CduNphDNPe, nodo 37:1423; componente nuevo, SIN VUE y fuera del catálogo; NO se ha leído página de Confluence: no hay API documentada, se deduce de Figma).
// Figma: interaction = default | focused. default = caja de mínimo 48 con trazo border/default, placeholder en text/muted y botón de enviar deshabilitado; focused = trazo border/inverse + sombra de foco (InputFocusShadow),
// texto en text/default y botón primary activo. El botón (R4Button primary medium, solo icono ic-arrow-up, radio 4) va dentro de la caja, abajo a la derecha (7 px de cada borde).
// API deducida: modelValue (v-model), placeholder (por defecto «Escribe tu pregunta»), ariaLabel (etiqueta del campo), sendLabel (aria-label del botón; por defecto «Enviar»), maxRows (6; EXTRA: la caja crece con el texto hasta ese alto y luego hace scroll)
// y sendDisabled (EXTRA del prototipo: deshabilita el envío mientras el asistente «escribe»). Eventos: update:modelValue y submit (Intro o clic en el botón; Mays+Intro inserta salto de línea). Expone focus().
// Interaction (default/focused) la resuelve el CSS con :focus-within; el botón se deshabilita solo si el campo está vacío o con sendDisabled.
// Accesibilidad: <textarea> con aria-label (un único punto de foco para escribir) y botón con aria-label; el foco visible del campo es la sombra de foco.
import { defineComponent, computed, ref, watch, nextTick, onMounted } from '../../../vendor/vue.esm-browser.prod.js'
import R4Button from './R4Button.js'

export default defineComponent({
  name: 'R4Prompt',
  components: { R4Button },
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Escribe tu pregunta' },
    ariaLabel: { type: String, default: undefined },
    sendLabel: { type: String, default: 'Enviar' },
    maxRows: { type: Number, default: 6 },
    sendDisabled: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }, // EXTRA del prototipo (Figma 42:1516: caja con fondo input/bg/disabled y botón deshabilitado): primer uso del chat, hasta aceptar el aviso legal
  },
  inheritAttrs: false, // class / style al raíz
  emits: ['update:modelValue', 'submit'],
  setup(props, { emit }) {
    const el = ref(null)
    const vacio = computed(() => !props.modelValue.trim())
    const grow = () => { const t = el.value; if (!t) return; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }
    const onInput = (e) => { emit('update:modelValue', e.target.value); grow() }
    const enviar = (e) => { if (!vacio.value && !props.sendDisabled && !props.disabled) emit('submit', e) }
    const onKeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); enviar(e) } }
    const focus = () => el.value?.focus()
    watch(() => props.modelValue, async () => { await nextTick(); grow() })
    onMounted(grow)
    return { el, vacio, onInput, onKeydown, enviar, focus }
  },
  template: `
    <div class="r4-prompt" :class="[$attrs.class, { 'r4-prompt--disabled': disabled }]" :style="[$attrs.style, { '--r4-prompt-max-rows': maxRows }]">
      <textarea ref="el" class="r4-prompt__input" rows="1" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :aria-label="ariaLabel || placeholder" @input="onInput" @keydown="onKeydown"></textarea>
      <R4Button class="r4-prompt__send" type="primary" size="medium" icon="ic-arrow-up" :aria-label="sendLabel" :disabled="disabled || vacio || sendDisabled" @click="enviar" />
    </div>
  `,
})
