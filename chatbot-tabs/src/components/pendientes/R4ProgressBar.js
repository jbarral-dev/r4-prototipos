// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo). API = "API componente" de Confluence (R4ProgressBar, 3879829506):
// title, currentStep (1-indexed), totalSteps, showClose y los callbacks onBack / onClose (aquí, eventos `back` y `close`).
// Accesibilidad según la doc: back "Volver al paso anterior", close "Cerrar proceso", role="progressbar" con
// aria-valuemin=1, aria-valuenow, aria-valuemax y aria-label "Progreso del proceso: paso N de M". Iconos chevron-left y close de Figma.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4ProgressBar',
  components: { Icon },
  props: {
    title: { type: String, required: true },
    currentStep: { type: Number, default: 1 },
    totalSteps: { type: Number, default: 3 },
    showClose: { type: Boolean, default: true },
  },
  emits: ['back', 'close'],
  template: `
    <div class="r4-progress-bar">
      <div class="r4-progress-bar__process">
        <button class="r4-progress-bar__action" type="button" aria-label="Volver al paso anterior" @click="$emit('back')"><Icon name="chevron-left" /></button>
        <span class="r4-progress-bar__title">{{ title }}</span>
        <button v-if="showClose" class="r4-progress-bar__action" type="button" aria-label="Cerrar proceso" @click="$emit('close')"><Icon name="close" /></button>
        <span v-else class="r4-progress-bar__action r4-progress-bar__action--empty"></span>
      </div>
      <div class="r4-progress-bar__track" role="progressbar" aria-valuemin="1" :aria-valuemax="totalSteps" :aria-valuenow="currentStep"
           :aria-label="'Progreso del proceso: paso ' + currentStep + ' de ' + totalSteps">
        <span v-for="n in totalSteps" :key="n" class="r4-progress-bar__segment" :class="{ 'r4-progress-bar__segment--done': n <= currentStep }"></span>
      </div>
    </div>
  `,
})
