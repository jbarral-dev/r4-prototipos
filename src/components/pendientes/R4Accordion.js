// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de R4Accordion (catálogo: VUE; Changelog SM-18975 y SM-22839 —paddings y sizes medium/small—). API = «Propiedades componente» de Confluence (R4Accordion, 3509420069, v1.1.0, leída el 2026-11-19):
// items ({ title, content?, id? }[]; `id` es extra: identifica el panel aunque cambie la lista; obligatoria: da el nº de paneles), size (medium | small; por defecto medium), multiple (por defecto false), disabled (por defecto false), divider (por defecto true), loading.
// Contenido propio (sección «Contenido» de la doc): slots con ámbito `title` y `content` ({ item, index }); sin slot se pintan los textos de `items`. El icono de flecha se mantiene siempre.
// Medidas y tokens: los de la tabla de la doc (spacing/4 · /2 de cabecera, contenedor del icono 48 · 40, línea border/subtle, título semibold text/default, contenido text/subdued). La doc no da el tamaño del glifo de la flecha: 20 (como el chevron del R4Chip).
// Estados (doc): hover = fondo surface/subtle y radio button/radius en el contenedor del icono · foco de teclado = anillo CardFocusOutline en el panel y fondo surface/subtle en el contenido abierto (en small también la cabecera) · disabled = text/disabled, sin interacción
// · la flecha gira 180° en 200 ms. Accesibilidad según la doc/Figma de roles: cabecera <button> con aria-expanded y aria-controls, contenido role="region" aria-labelledby, flecha aria-hidden, disabled → aria-disabled + tabindex -1.
// Extra (NO está en la API: la doc dice que «todos los paneles empiezan cerrados» y que no hay forma de abrir uno): `defaultOpen` (índices abiertos al montar), necesario para el acordeón «Filtros seleccionados» del R4Sheet de R4TableV2. Propuesta a validar con diseño.
// NO reconstruido: `loading` (esqueleto: R4Skeleton no está reconstruido) ni R4Text como componente (se pinta con sus tokens: título extraLarge/medium semibold; contenido medium/small).
import { defineComponent, ref, watch } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

let uid = 0

export default defineComponent({
  name: 'R4Accordion',
  components: { Icon },
  props: {
    items: { type: Array, required: true },
    size: { type: String, default: 'medium', validator: (v) => ['medium', 'small'].includes(v) },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    divider: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    defaultOpen: { type: Array, default: () => [] }, // extra (ver cabecera)
  },
  setup(props) {
    if (props.loading) console.warn('R4Accordion: `loading` (esqueleto) no está reconstruido')
    const base = `r4-accordion-${++uid}`
    const keyOf = (item, i) => item.id ?? i
    const keys = () => props.items.map(keyOf)
    const inicial = props.defaultOpen.filter((k) => keys().includes(k))
    const open = ref(new Set(props.multiple ? inicial : inicial.slice(0, 1)))
    // un panel que aparece después (extra `id`) se abre si está en defaultOpen
    watch(keys, (now, before) => { const nuevos = now.filter((k) => !before.includes(k) && props.defaultOpen.includes(k)); if (nuevos.length) open.value = new Set([...open.value, ...nuevos]) })
    const isOpen = (i) => open.value.has(keyOf(props.items[i], i))
    const toggle = (i) => {
      if (props.disabled) return
      const k = keyOf(props.items[i], i)
      const next = new Set(open.value)
      if (next.has(k)) next.delete(k)
      else { if (!props.multiple) next.clear(); next.add(k) }
      open.value = next
    }
    return { base, isOpen, toggle }
  },
  template: `
    <div class="r4-accordion" :class="['r4-accordion--' + size, { 'r4-accordion--disabled': disabled, 'r4-accordion--divider': divider }]">
      <div v-for="(item, i) in items" :key="item.id ?? i" class="r4-accordion__panel" :class="{ 'is-open': isOpen(i) }">
        <button type="button" :id="base + '-header-' + i" class="r4-accordion__header" :aria-expanded="isOpen(i) ? 'true' : 'false'" :aria-controls="base + '-panel-' + i"
                :aria-disabled="disabled ? 'true' : undefined" :tabindex="disabled ? -1 : undefined" @click="toggle(i)">
          <span class="r4-accordion__title"><slot name="title" :item="item" :index="i">{{ item.title }}</slot></span>
          <span class="r4-accordion__icon"><Icon :name="'ic-angle-down'" /></span>
        </button>
        <div v-show="isOpen(i)" :id="base + '-panel-' + i" class="r4-accordion__content" role="region" :aria-labelledby="base + '-header-' + i">
          <slot name="content" :item="item" :index="i">{{ item.content }}</slot>
        </div>
      </div>
    </div>
  `,
})
