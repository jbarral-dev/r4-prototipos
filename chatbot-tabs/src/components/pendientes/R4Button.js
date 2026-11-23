// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo). API = tabla "API componente" de Confluence (R4Button, 2798387263):
// type (primary | secondary | text), size (large | medium), width (auto | full-width), disabled, icon, text.
// content (text | iconAndText | icon) y el estado (interaction) NO son props: se deducen de icon/text y los resuelve el CSS.
// Siempre un <button> nativo. Con solo icono hay que pasar aria-label (atributo). La navegación va por @click.
// Reconstruido: type primary | secondary | text · size large | medium · estados default/hover/focused/pressed/disabled.
// size medium (32 px, padding 12, texto 16 px) se leyó en Figma solo en interaction=default (las interacciones reutilizan los colores de large).
// type=text con texto va subrayado en todos los estados (Figma: textDecoration UNDERLINE, large y medium).
// secondary solo leída con content text e icon.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4Button',
  components: { Icon },
  props: {
    type: { type: String, default: 'primary', validator: (v) => ['primary', 'secondary', 'text'].includes(v) },
    size: { type: String, default: 'large', validator: (v) => ['large', 'medium'].includes(v) },
    width: { type: String, default: 'auto', validator: (v) => ['auto', 'full-width'].includes(v) },
    disabled: { type: Boolean, default: false },
    pressed: { type: Boolean, default: false }, // extra: fuerza el estado pressed (botones que abren un popover/sheet y lo mantienen mientras está abierto)
    icon: { type: String, default: undefined }, // nombre del icono (componente de Figma). Obligatorio si no hay text
    text: { type: String, default: undefined }, // obligatorio si no hay icon
  },
  emits: ['click'],
  setup(props) {
    const content = computed(() => (props.icon && props.text ? 'iconAndText' : props.icon ? 'icon' : 'text'))
    const classes = computed(() => ['r4-button', `r4-button--${props.type}`, `r4-button--${props.size}`, `r4-button--content-${content.value}`, { 'r4-button--full-width': props.width === 'full-width', 'r4-button--pressed': props.pressed }])
    return { content, classes }
  },
  template: `
    <button :class="classes" type="button" :disabled="disabled" @click="$emit('click', $event)">
      <span class="r4-button__content">
        <Icon v-if="icon" :name="icon" />
        <span v-if="text" class="r4-button__text">{{ text }}</span>
      </span>
    </button>
  `,
})
