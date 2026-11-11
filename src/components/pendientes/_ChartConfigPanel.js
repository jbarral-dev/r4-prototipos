// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Contenido adhoc de Figma del popover (desktop) y del R4Sheet (mobile) de «Configuración» del gráfico ("Proyectos - Fichas de Productos", 2813:74423 y 2816:99265): grupos de
// R4InputCheckbox (sin label, el título del grupo es un R4Text strong medium) separados por una línea border/subtle. No es un componente del catálogo.
// Props: groups ({ id, title?, options: { label, value }[] }[]) y modelValue (valores marcados de todos los grupos; v-model). El primer grupo del Figma no lleva título (Volumen, Dividendos,
// Ajuste de dividendos): se nombra para lectores de pantalla con `ariaLabel` del grupo.
// Accesibilidad: cada grupo es el <fieldset> de R4InputCheckbox, nombrado por su título (aria-labelledby) o por el aria-label del grupo; los títulos son <p> (como el R4Text del Figma), no encabezados,
// para no alterar la jerarquía de encabezados de la página.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import R4InputCheckbox from './R4InputCheckbox.js'

let uid = 0

export default defineComponent({
  name: '_ChartConfigPanel',
  components: { R4InputCheckbox },
  props: {
    groups: { type: Array, required: true },
    modelValue: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const id = `r4-chartconfig-${++uid}`
    const inGroup = (g) => props.modelValue.filter((v) => g.options.some((o) => o.value === v))
    const update = (g, values) => {
      const keep = props.modelValue.filter((v) => !g.options.some((o) => o.value === v))
      emit('update:modelValue', [...keep, ...values])
    }
    return { id, inGroup, update }
  },
  template: `
    <div class="r4-chartconfig">
      <template v-for="(g, i) in groups" :key="g.id">
        <hr v-if="i" class="r4-chartconfig__divider" />
        <section class="r4-chartconfig__group">
          <p v-if="g.title" :id="id + '-' + g.id" class="r4-chartconfig__title">{{ g.title }}</p>
          <R4InputCheckbox :model-value="inGroup(g)" :options="g.options" :aria-labelledby="g.title ? id + '-' + g.id : undefined" :aria-label="g.title ? undefined : g.ariaLabel" @update:model-value="update(g, $event)" />
        </section>
      </template>
    </div>
  `,
})
