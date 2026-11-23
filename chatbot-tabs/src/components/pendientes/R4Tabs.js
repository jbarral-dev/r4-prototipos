// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-24288: eje `layout`, slot en vez de showItem1–8, minWidth 90).
// API = "API componente" de Confluence (R4Tabs, 3507912853): tabs ({ label, icon?, disabled? }[], 2–8), activeTab (índice, por defecto 0),
// type (divider | title), layout (scrollable | fixed), evento `change` (índice) — en Vue el callback onChange es el evento.
// Extras mínimos para enlazar los tabpanel (la doc exige aria-controls/aria-labelledby): cada tab puede traer `id` y `panelId` (si no, se generan).
// Accesibilidad según la doc: role=tablist / tab (aria-selected) / tabpanel (lo pone la pantalla); roving tabindex, ←/→, Home/End, activación automática.
// _TabItem (hijo privado) va dentro de este archivo. Estados leídos en Figma (12 variantes): default · hover · focused × active/inactive × divider/title.
// Reconstruido: type divider y title, layout scrollable y fixed. El icono por pestaña (showIcon) se admite si el nombre está en el registro de iconos.
import { defineComponent, ref, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import dragScroll from '../../directives/dragScroll.js'

let uid = 0

export default defineComponent({
  name: 'R4Tabs',
  components: { Icon },
  directives: { dragScroll },
  props: {
    tabs: { type: Array, required: true },
    activeTab: { type: Number, default: 0 },
    type: { type: String, default: 'divider', validator: (v) => ['divider', 'title'].includes(v) },
    layout: { type: String, default: 'scrollable', validator: (v) => ['scrollable', 'fixed'].includes(v) },
    ariaLabel: { type: String, default: undefined },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const base = `r4-tabs-${++uid}`
    const tabId = (i) => props.tabs[i].id || `${base}-tab-${i}`
    const panelId = (i) => props.tabs[i].panelId || `${base}-panel-${i}`
    const list = ref(null)
    const select = (i) => { if (!props.tabs[i].disabled && i !== props.activeTab) emit('change', i) }
    const focusTab = async (i) => { await nextTick(); list.value?.querySelectorAll('[role=tab]')[i]?.focus() }
    const onKeydown = (e) => {
      const n = props.tabs.length
      let next = null
      if (e.key === 'ArrowRight') next = (props.activeTab + 1) % n
      else if (e.key === 'ArrowLeft') next = (props.activeTab - 1 + n) % n
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = n - 1
      if (next === null) return
      e.preventDefault()
      select(next)
      focusTab(next)
    }
    return { list, tabId, panelId, select, onKeydown }
  },
  template: `
    <div class="r4-tabs" :class="['r4-tabs--' + type, 'r4-tabs--' + layout]">
      <div ref="list" v-drag-scroll class="r4-tabs__list" role="tablist" :aria-label="ariaLabel" @keydown="onKeydown">
        <button v-for="(t, i) in tabs" :key="i" type="button" role="tab" class="r4-tabs__item" :class="{ 'is-active': i === activeTab }"
                :id="tabId(i)" :aria-selected="i === activeTab ? 'true' : 'false'" :aria-controls="panelId(i)"
                :tabindex="i === activeTab ? 0 : -1" :disabled="t.disabled" @click="select(i)">
          <Icon v-if="t.icon" :name="t.icon" />
          <span class="r4-tabs__label">{{ t.label }}</span>
        </button>
      </div>
    </div>
  `,
})
