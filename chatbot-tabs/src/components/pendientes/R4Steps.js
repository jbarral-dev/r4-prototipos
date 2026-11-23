// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (EN PROGRESO en el catálogo). API = "API componente" de Confluence (R4Steps, 3632758924):
// size ('large' | 'medium', por defecto 'large') y steps: StepItem[] con { title, description, icon, slot }.
// La numeración y isLastItem (sin línea en el último) se generan automáticamente; indicator = icon si hay `icon`;
// showTitle / showDescription / showSlot se deducen de title / description / slot. `slot` = Component | VNode.
// `icon` = componente de icono (iconComponent('ic-check')); R4Icon no está reconstruido y se pinta con el icono directo (16 px medium, 20 px large).
// Semántica: <ol> con <li>; título = <h3>; indicador aria-hidden. Changelog SM-24485 (medium compacta) ya aplicado en Figma.
import { defineComponent, provide, computed } from '../../../vendor/vue.esm-browser.prod.js'
import _StepItem from './_StepItem.js'

// Un VNode no es un componente: se envuelve en un componente funcional para poder usarlo con <component :is>
const asComponent = (slot) => (slot && slot.__v_isVNode ? () => slot : slot)

export default defineComponent({
  name: 'R4Steps',
  components: { StepItem: _StepItem },
  props: {
    size: { type: String, default: 'large', validator: (v) => ['large', 'medium'].includes(v) },
    steps: { type: Array, required: true },
  },
  setup(props) {
    provide('r4StepsSize', computed(() => props.size))
    return { asComponent }
  },
  template: `
    <ol class="r4-steps" :class="'r4-steps--' + size">
      <StepItem v-for="(step, i) in steps" :key="i" :step-number="i + 1" :title="step.title" :description="step.description"
                :icon="step.icon" :is-last-item="i === steps.length - 1 ? 'yes' : 'no'">
        <template v-if="step.slot" #default><component :is="asComponent(step.slot)" /></template>
      </StepItem>
    </ol>
  `,
})
