// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-19075: variante standalone). API = "API componente" de
// Confluence (R4Link, 3750526981): type (standalone | inline), size (small | medium | large), href (obligatorio), disabled,
// iconLeft / iconRight (Component | null; solo en standalone). El texto va en el slot por defecto. Los estados
// (default/hover/focus/disabled) los resuelve el CSS. disabled → aria-disabled="true" + tabindex="-1" (sin href).
// Los estados hover/focus/disabled se han leído en Figma para small y medium; large reutiliza el mismo patrón sin haberse leído.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Link',
  props: {
    type: { type: String, default: 'standalone', validator: (v) => ['standalone', 'inline'].includes(v) },
    size: { type: String, default: 'small', validator: (v) => ['small', 'medium', 'large'].includes(v) },
    href: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    iconLeft: { type: [Object, Function], default: null },
    iconRight: { type: [Object, Function], default: null },
  },
  setup(props) {
    const standalone = computed(() => props.type === 'standalone')
    return { standalone }
  },
  template: `
    <a class="r4-link" :class="['r4-link--' + size, 'r4-link--' + type, { 'r4-link--disabled': disabled }]"
       :href="disabled ? undefined : href" :aria-disabled="disabled ? 'true' : undefined" :tabindex="disabled ? -1 : undefined">
      <component :is="iconLeft" v-if="standalone && iconLeft" />
      <span class="r4-link__text"><slot /></span>
      <component :is="iconRight" v-if="standalone && iconRight" />
    </a>
  `,
})
