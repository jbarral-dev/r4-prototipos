// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-23914: paleta neutra en el estado activo, iconos, tamaños, slot).
// API = "API componente" de Confluence (R4SegmentedControls, 3122004026): items ({ label, value, icon?, disabled? }[]), selectedValue, size
// (small | medium | large; por defecto small), type (text | icon | iconAndText; por defecto text), ariaLabel. Evento `select` (value).
// Extra del prototipo: cada item admite `shortLabel` (etiqueta abreviada, p. ej. "1D" en lugar de "1 día"): el CSS muestra una u otra según el ancho
// del contenedor, porque el diseño cambia la etiqueta entre desktop y mobile (R4ChartLine); el nombre accesible es siempre `label`.
// Accesibilidad según la doc: role=tablist con aria-label · cada segmento role=tab + aria-selected · roving tabindex (←/→, Home/End), selección automática.
// Estados leídos en Figma (18 variantes del segmento): default · hover · focused · pressed · selected · disabled.
// "En mobile NUNCA debe ocupar más del 100 % ni hacer scroll horizontal" (doc): los segmentos se reparten el ancho (flex 1 1 0).
import { defineComponent, ref, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4SegmentedControls',
  components: { Icon },
  props: {
    items: { type: Array, required: true },
    selectedValue: { type: String, default: undefined },
    size: { type: String, default: 'small', validator: (v) => ['small', 'medium', 'large'].includes(v) },
    type: { type: String, default: 'text', validator: (v) => ['text', 'icon', 'iconAndText'].includes(v) },
    ariaLabel: { type: String, default: undefined },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const list = ref(null)
    const idx = () => Math.max(0, props.items.findIndex((i) => i.value === props.selectedValue))
    const choose = (i) => { const it = props.items[i]; if (it && !it.disabled && it.value !== props.selectedValue) emit('select', it.value) }
    const onKeydown = (e) => {
      const n = props.items.length
      let next = null
      if (e.key === 'ArrowRight') next = (idx() + 1) % n
      else if (e.key === 'ArrowLeft') next = (idx() - 1 + n) % n
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = n - 1
      if (next === null) return
      e.preventDefault()
      choose(next)
      nextTick(() => list.value?.querySelectorAll('[role=tab]')[next]?.focus())
    }
    return { list, choose, onKeydown }
  },
  template: `
    <div class="r4-segmented" :class="['r4-segmented--' + size, 'r4-segmented--' + type]">
      <div ref="list" class="r4-segmented__slot" role="tablist" :aria-label="ariaLabel" @keydown="onKeydown">
        <button v-for="(it, i) in items" :key="it.value" type="button" role="tab" class="r4-segmented__item"
                :class="{ 'is-selected': it.value === selectedValue }" :aria-selected="it.value === selectedValue ? 'true' : 'false'"
                :aria-label="type === 'icon' || it.shortLabel ? it.label : undefined" :tabindex="it.value === selectedValue ? 0 : -1" :disabled="it.disabled" @click="choose(i)">
          <Icon v-if="it.icon && type !== 'text'" :name="it.icon" />
          <span v-if="type !== 'icon'" class="r4-segmented__label" :aria-hidden="it.shortLabel ? 'true' : undefined">
            <span class="r4-segmented__long">{{ it.label }}</span><span v-if="it.shortLabel" class="r4-segmented__short">{{ it.shortLabel }}</span>
          </span>
        </button>
      </div>
    </div>
  `,
})
