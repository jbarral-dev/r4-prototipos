// PENDIENTE-IT: no oficial. COPIA PARA «Chatbot (Jose)» (fork del prototipo «Chatbot»; clases CSS con prefijo j para no interferir con el original). Composición del prototipo del chatbot (no es un componente del catálogo ni tiene diseño propio en Figma): contenido del bloque Actions del R4Sheet (Figma 11:8773, «Proyectos - Chatbot»)
// para el acceso al chat desde el buscador: un R4Text small en text/muted («¿No encuentras lo que buscas?») y, a 8 px, un R4Button secondary large a ancho completo con ic-ai («Pregunta al asistente»).
// Los espaciados (padding 16, gap 8, borde superior de 1 px border/subtle, fondo surface/default) los pone el bloque Actions del R4Sheet (`.r4-sheet__actions`); en el R4Popover los reproduce `.jusearch-actions`.
// Evento: `ask` (el padre decide qué se envía al chat).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import R4Text from './R4Text.js'
import R4Button from './R4Button.js'

export default defineComponent({
  name: '_AssistantAccessJose',
  components: { R4Text, R4Button },
  emits: ['ask'],
  template: `
    <R4Text size="small" class="jusearch-actions__text" text="¿No encuentras lo que buscas?" />
    <R4Button type="secondary" size="large" width="full-width" icon="ic-ai" text="Pregunta al asistente" @click="$emit('ask')" />
  `,
})
