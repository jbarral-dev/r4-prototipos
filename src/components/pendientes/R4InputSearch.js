// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (R4InputSearch, 12757:4372; era VUE en el catálogo; Changelog SM-23182: estados :focus en «Borrar» y en cerrar). API = "API componente" de Confluence
// (R4InputSearch, 3870687244): modelValue, placeholder, size (medium | large; por defecto medium), disabled, ariaLabel, showErase (por defecto true). Evento `close` (× cierra el contexto de búsqueda).
// Accesibilidad según la doc: raíz role="search" · <input type="search"> con aria-label (no solo placeholder) · lupa aria-hidden · «Borrar» limpia y devuelve el foco al campo ·
// «Cerrar búsqueda» cierra y Escape también · «Borrar» y cerrar visibles solo con foco o texto (focused/active) · orden de foco: input → Borrar → Cerrar.
// EXTRAS DEL PROTOTIPO (no están en la API de la doc): `icon` (nombre de icono en lugar de la lupa; el buscador unificado cambia de icono según el modo), slot `status` (entre el valor y las acciones:
//   indicador del modo activo) y los eventos `focus`, `submit` (Intro) y `clear`. Estados leídos en Figma: default · hover · focused · active · disabled (medium y large).
// NO reconstruido: _ButtonClose como componente propio (se pinta como botón circular de 24 con el icono `close`).
import { defineComponent, ref, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4InputSearch',
  components: { Icon },
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Buscar producto' },
    size: { type: String, default: 'medium', validator: (v) => ['small', 'medium', 'large'].includes(v) }, // `small` (32) es extra del prototipo
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: undefined },
    showErase: { type: Boolean, default: true },
    icon: { type: String, default: 'search' }, // extra del prototipo
    reserveActions: { type: Boolean, default: false }, // extra del prototipo: reserva el hueco de «cerrar» para que el campo no cambie de ancho al enfocarlo
  },
  emits: ['update:modelValue', 'close', 'focus', 'submit', 'clear'],
  setup(props, { emit, attrs }) {
    const input = ref(null)
    const focused = ref(false)
    const hasValue = computed(() => props.modelValue.length > 0)
    const showActions = computed(() => !props.disabled && (hasValue.value || focused.value))
    const onInput = (e) => emit('update:modelValue', e.target.value)
    const erase = () => { emit('update:modelValue', ''); emit('clear'); input.value?.focus() }
    const onKeydown = (e) => { if (e.key === 'Enter') emit('submit', e); else if (e.key === 'Escape') { e.stopPropagation(); emit('close') } }
    const onFocus = (e) => { focused.value = true; emit('focus', e) }
    const onFocusout = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) focused.value = false }
    const focus = () => input.value?.focus()
    const inputAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== 'class' && k !== 'style')))
    return { input, focused, hasValue, showActions, onInput, erase, onKeydown, onFocus, onFocusout, inputAttrs, focus }
  },
  template: `
    <div role="search" class="r4-inputsearch" :class="[$attrs.class, 'r4-inputsearch--' + size, { 'is-focused': focused, 'is-active': hasValue, 'is-disabled': disabled }]" :style="$attrs.style" @focusout="onFocusout">
      <Icon class="r4-inputsearch__icon" :name="icon" />
      <input ref="input" v-bind="inputAttrs" class="r4-inputsearch__input" type="search" :value="modelValue" :placeholder="placeholder" :aria-label="ariaLabel || placeholder" :disabled="disabled"
             autocomplete="off" @input="onInput" @focus="onFocus" @keydown="onKeydown" />
      <slot name="status" />
      <div v-if="showActions || reserveActions" class="r4-inputsearch__actions" :class="{ 'is-idle': !showActions }" :inert="!showActions">
        <button v-if="showErase && hasValue" type="button" class="r4-inputsearch__erase" @click="erase">Borrar</button>
        <button type="button" class="r4-inputsearch__close" aria-label="Cerrar búsqueda" @click="$emit('close')"><Icon name="close" /></button>
      </div>
    </div>
  `,
})
