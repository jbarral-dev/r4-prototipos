// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción del átomo `_Switch` de R4InputSwitch (Figma Primitivos 1.2, component set `_Switch` 7064:4045, leído con use_figma: value off | on | disable × type default | withText) con la
// accesibilidad de la página de Confluence R4InputSwitch (2820997140): `<input type="checkbox" role="switch">` nativo, `aria-checked`, Tab para el foco y Espacio para alternar, foco visible, disabled fuera del orden de tabulación.
// NO reconstruido: el wrapper R4InputSwitch (label de grupo, descripción lateral y caption); aquí el nombre accesible lo da quien lo usa (`ariaLabel` / `ariaLabelledby`, p. ej. el concepto de una fila de R4ListDetail).
// Props (las de la API de Confluence que aplican al átomo): checked (false), disabled (false), showText (false: «Sí»/«No» dentro del track). Extra: ariaLabel, ariaLabelledby. Evento: update:checked.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Switch',
  props: {
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    showText: { type: Boolean, default: false },
    ariaLabel: { type: String, default: undefined },
    ariaLabelledby: { type: String, default: undefined },
  },
  emits: ['update:checked'],
  template: `
    <span class="r4-switch" :class="{ 'is-checked': checked, 'is-disabled': disabled, 'r4-switch--text': showText }">
      <input class="r4-switch__input" type="checkbox" role="switch" :checked="checked" :disabled="disabled" :aria-checked="checked ? 'true' : 'false'" :aria-label="ariaLabel" :aria-labelledby="ariaLabelledby"
             @change="$emit('update:checked', $event.target.checked)" />
      <span class="r4-switch__track" aria-hidden="true">
        <span v-if="showText" class="r4-switch__text">{{ checked ? 'Sí' : 'No' }}</span>
        <span class="r4-switch__handle"></span>
      </span>
    </span>
  `,
})
