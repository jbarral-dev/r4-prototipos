// Auxiliar del prototipo (NO es R4Icon): pinta un icono de Figma por el nombre de su componente. Hereda el color (currentColor).
// R4Icon (EN PROGRESO en el catálogo) no está reconstruido. `iconComponent(name)` devuelve un componente de icono, que es lo que
// las APIs de la documentación esperan en iconLeft / iconRight (Component | null).
import { defineComponent, computed, h } from '../../vendor/vue.esm-browser.prod.js'
import { icons } from './icons.js'
import './icons.ficha.js' // registra los iconos de la ficha de producto en el mismo registro
import './icons.buscador.js' // registra los iconos del buscador unificado
import './icons.menu.js' // registra los iconos del Menu (type=default)

const Icon = defineComponent({
  name: '_Icon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 0 }, // px; 0 = tamaño nativo del icono en Figma (o el que ponga el CSS del componente)
  },
  setup(props) {
    const def = computed(() => {
      const d = icons[props.name]
      if (!d) throw new Error(`Icono "${props.name}" no registrado en src/icons/icons.js`)
      return d
    })
    const px = computed(() => props.size || def.value.size)
    return { def, px }
  },
  template: `<svg class="r4-icon" :width="px" :height="px" :viewBox="'0 0 ' + def.size + ' ' + def.size" fill="none" aria-hidden="true" focusable="false" v-html="def.markup"></svg>`,
})

const cache = new Map()
export const iconComponent = (name) => {
  if (!cache.has(name)) cache.set(name, defineComponent({ name: `Icon(${name})`, render: () => h(Icon, { name }) }))
  return cache.get(name)
}

export default Icon
