// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de R4Text (Primitivos; era VUE en el catálogo). API = tabla «Propiedades componente» de Confluence (R4Text, 2802843707, v1.1.1, leída el 2026-11-12); NO se ha releído el
// componente en Figma (estilos y tokens salen de la tabla de la doc).
// Props: text, size (small | medium | large | extraLarge; por defecto medium), variant (normal | paragraph | disabled | success | warning | error | mark), fontStyle (normal | italic |
// strikethrough | strong | extraStrong), tag ('p' por defecto), ariaLabel, ariaLive (off | polite | assertive), role. Sin `text`, muestra el slot por defecto. Ocupa el ancho de su contenido.
// NO reconstruido: `loading` (Skeleton: R4Skeleton no está reconstruido; se avisa por consola) y el peso 800 de extraStrong (sin token: se usa bold).
// Diferencias doc ↔ Figma que la doc señala: line-height medium 24 (22 en el bundle); text/disabled #ababab en Figma (#707070 en el bundle): aquí el token del tema.
import { defineComponent, h } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Text',
  props: {
    text: { type: String, default: undefined },
    size: { type: String, default: 'medium', validator: (v) => ['small', 'medium', 'large', 'extraLarge'].includes(v) },
    variant: { type: String, default: 'normal', validator: (v) => ['normal', 'paragraph', 'disabled', 'success', 'warning', 'error', 'mark'].includes(v) },
    fontStyle: { type: String, default: 'normal', validator: (v) => ['normal', 'italic', 'strikethrough', 'strong', 'extraStrong'].includes(v) },
    loading: { type: Boolean, default: false },
    tag: { type: String, default: 'p' },
    ariaLabel: { type: String, default: undefined },
    ariaLive: { type: String, default: 'off', validator: (v) => ['off', 'polite', 'assertive'].includes(v) },
    role: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    if (props.loading) console.warn('R4Text: `loading` (Skeleton) no está reconstruido')
    return () => h(props.tag, {
      class: ['r4-text', 'r4-text--' + props.size, 'r4-text--' + props.variant, 'r4-text--' + props.fontStyle],
      'aria-label': props.ariaLabel && props.ariaLabel !== props.text ? props.ariaLabel : undefined,
      'aria-live': props.ariaLive !== 'off' ? props.ariaLive : undefined,
      'aria-disabled': props.variant === 'disabled' ? 'true' : undefined,
      role: props.role,
    }, props.text !== undefined ? props.text : slots.default ? slots.default() : [])
  },
})
