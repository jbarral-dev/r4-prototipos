// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo). API = "API componente" de Confluence (R4Notification, 2799370241):
// type ('error' | 'info' | 'warning' | 'success'), title, text, dismissible (por defecto true), primaryAction, secondaryAction.
// Roles según la doc: info y success → role="status"; error y warning → role="alert". Icono decorativo (aria-hidden).
// Reconstruido: type info, con title y text, en Device Desktop y Mobile (el CSS lo resuelve por el ancho del contenedor r4page, sin prop; Tablet usa Desktop porque Figma solo define esos dos). NO reconstruido (no leído): error, warning y success, el botón de cierre
// (dismissible) y las acciones primaria/secundaria; si se piden se avisa por consola.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4Notification',
  components: { Icon },
  props: {
    type: { type: String, default: 'error', validator: (v) => ['error', 'info', 'warning', 'success'].includes(v) },
    title: { type: String, default: undefined },
    text: { type: String, default: undefined },
    dismissible: { type: Boolean, default: true },
    primaryAction: { type: Object, default: undefined },
    secondaryAction: { type: Object, default: undefined },
  },
  setup(props) {
    const role = computed(() => (props.type === 'error' || props.type === 'warning' ? 'alert' : 'status'))
    if (props.type !== 'info' || props.dismissible || props.primaryAction || props.secondaryAction) {
      console.warn('R4Notification: solo está reconstruido type="info" sin botón de cierre ni acciones (usa :dismissible="false")')
    }
    return { role }
  },
  template: `
    <div class="r4-notification" :class="'r4-notification--' + type" :role="role">
      <Icon class="r4-notification__icon" name="info-circle" />
      <div class="r4-notification__body">
        <p v-if="title" class="r4-notification__title">{{ title }}</p>
        <p v-if="text" class="r4-notification__text">{{ text }}</p>
      </div>
    </div>
  `,
})
