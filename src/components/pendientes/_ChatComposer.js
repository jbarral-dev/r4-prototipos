// PENDIENTE-IT: no oficial. Prototipo de investigación (Enfoque buscador). Prompt del chat (R4Prompt) con su lógica de foco, para colocarlo en la capa de acciones del R4Sheet (fijo abajo, bajo el contenido que hace scroll).
// Recibe el estado compartido (`api`, screens/_buscadorEstado.js). Disabled mientras se muestra el aviso legal del primer uso (Figma «Proyectos - Chatbot» 42:1516).
import { defineComponent, ref, watch, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4Prompt from './R4Prompt.js'

export default defineComponent({
  name: '_ChatComposer',
  components: { R4Prompt },
  props: { api: { type: Object, required: true } },
  setup(props) {
    const promptEl = ref(null)
    // El prompt tiene el foco en cuanto se pinta la conversación y está habilitado (el componente se monta una vez por host: el campo del host oculto no admite foco).
    // En el R4Sheet bottom de mobile/tablet NO se enfoca: se suelta el foco del campo de arriba para que el teclado nativo se cierre y la caja quede visible; el teclado vuelve al pulsar en la caja
    const enfocarPrompt = async () => {
      await nextTick()
      const capa = promptEl.value?.$el?.closest('.usearch-sheetbottom')
      if (capa) { if (capa.querySelector('.r4-sheet')?.getClientRects().length) document.activeElement?.blur(); return }
      promptEl.value?.focus()
    }
    watch(() => props.api.chatView, (v) => { if (v && !props.api.abriendo) enfocarPrompt() })
    return { promptEl }
  },
  template: `
    <R4Prompt ref="promptEl" class="usearch-composer" :model-value="api.prompt" aria-label="Tu pregunta al asistente" send-label="Enviar pregunta" :send-disabled="api.pending"
              @update:model-value="api.prompt = $event" @submit="api.enviarPrompt()" />
  `,
})
