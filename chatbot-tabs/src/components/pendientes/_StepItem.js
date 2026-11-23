// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Hijo privado de R4Steps (en Figma: stepItem). No se usa fuera del contenedor. Props como en Figma, derivadas por R4Steps:
// stepNumber, title (showTitle), description (showDescription), icon (indicator=icon), isLastItem (yes | no), slot (showSlot).
// Tamaño (medium | large) heredado de R4Steps. Título = <h3>; el indicador es aria-hidden.
import { defineComponent, inject, computed, ref } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: '_StepItem',
  props: {
    stepNumber: { type: [Number, String], default: 1 },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    icon: { type: [Object, Function], default: null },
    isLastItem: { type: String, default: 'no', validator: (v) => ['yes', 'no'].includes(v) },
  },
  setup(props, { slots }) {
    const size = inject('r4StepsSize', ref('medium'))
    const hasSlot = computed(() => !!slots.default)
    return { size, hasSlot }
  },
  template: `
    <li class="r4-step-item" :class="['r4-step-item--' + size, { 'r4-step-item--last': isLastItem === 'yes' }]">
      <div class="r4-step-item__indicator-and-line">
        <span class="r4-step-item__indicator" aria-hidden="true">
          <component :is="icon" v-if="icon" class="r4-step-item__icon" />
          <span v-else class="r4-step-item__number">{{ stepNumber }}</span>
        </span>
        <span v-if="isLastItem === 'no'" class="r4-step-item__line" aria-hidden="true"></span>
      </div>
      <div class="r4-step-item__content">
        <div class="r4-step-item__texts">
          <h3 v-if="title" class="r4-step-item__title">{{ title }}</h3>
          <p v-if="description" class="r4-step-item__description">{{ description }}</p>
        </div>
        <div v-if="hasSlot" class="r4-step-item__slot"><slot /></div>
      </div>
    </li>
  `,
})
