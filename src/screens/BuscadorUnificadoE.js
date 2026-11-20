// Pantalla de PROTOTIPO DE INVESTIGACIÓN (Flujo B, sin diseño en Figma): variante E del plan «fusionar buscador y chat en r4.com» — un solo campo que decide el modo según lo escrito
// (pregunta → conversación; palabra o nombre → resultados), con el modo visible y corregible. Se evalúa el ACCESO desde la cabecera y lo que despliega.
// Escenario real: la ficha de producto · Acción (FichaAccion, con su Menu y su contenido) más el buscador unificado. El campo R4InputSearch ocupa el sitio del enlace «Buscador» de la franja
// superior del Menu (desktop) y es el disparador: al enfocarlo se abre el contenido dentro de un R4Popover anclado al campo. En tablet y mobile el disparador es la lupa de la barra compacta y el
// contenido va en una capa por encima de la página que baja desde arriba (animación propia: Figma no define movimiento).
// Un solo estado compartido (screens/_buscadorEstado.js): los dos hosts (popover de desktop y capa de tablet/mobile) lo pintan; el CSS muestra el que toca.
// Datos de ejemplo: src/data/buscador-unificado.js (casos de enrutado fijados, resultados y respuestas guionizadas). Panel del facilitador: abajo a la izquierda (se oculta con ?f=0).
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import FichaAccion from './FichaAccion.js'
import Facilitador, { valoresPorDefecto, escribirParam } from '../components/prototipo/Facilitador.js'
import R4InputSearch from '../components/pendientes/R4InputSearch.js'
import R4Button from '../components/pendientes/R4Button.js'
import R4Popover from '../components/pendientes/R4Popover.js'
import _AssistantAccess from '../components/pendientes/_AssistantAccess.js'
import R4Badge from '../components/pendientes/R4Badge.js'
import R4Sheet from '../components/pendientes/R4Sheet.js'
import Icon from '../icons/_Icon.js'
import _UnifiedSearchPanel from '../components/pendientes/_UnifiedSearchPanel.js'
import { crearEstado } from './_buscadorEstado.js'

export default defineComponent({
  name: 'BuscadorUnificadoE',
  components: { Icon, FichaAccion, Facilitador, R4Badge, AssistantAccess: _AssistantAccess, R4Button, R4InputSearch, R4Popover, R4Sheet, UnifiedSearchPanel: _UnifiedSearchPanel },
  setup() {
    const api = crearEstado()
    // Use cases del prototipo (panel Facilitador, URL `?usuario=historial`; el valor por defecto no ensucia la URL)
    const FACILITADOR = [
      { label: 'Tipo de usuario', controls: [{ id: 'usuario', type: 'radio', options: [
        { value: 'nuevo', label: 'Entra por primera vez al chatbot', default: true },
        { value: 'historial', label: 'Ya ha entrado (tiene búsquedas y preguntas previas)' },
      ] }] },
      { label: 'Conversación', controls: [{ id: 'respuesta', type: 'radio', options: [
        { value: 'ninguna', label: 'Ninguna (flujo normal)', default: true },
        { value: 'enlace', label: 'Un enlace' },
        { value: 'varios', label: 'Varios enlaces' },
        { value: 'resultados', label: 'Resultados' },
      ] }] },
      { label: 'Histórico', controls: [{ id: 'historico', type: 'switch', label: 'Tiene histórico de conversaciones', default: false }] },
      { label: '¿Conversación activa?', controls: [{ id: 'conversacion', type: 'switch', label: 'Sí (badge en la lupa; al abrir, se reanuda el chat)', default: false }] },
    ]
    const caso = ref(valoresPorDefecto(FACILITADOR))
    api.cargarEstado(caso.value.usuario)
    if (caso.value.historico) api.setHistorico(true)
    if (caso.value.conversacion) api.setConversacionActiva(true)
    if (caso.value.respuesta !== 'ninguna') onMounted(() => nextTick(() => api.cargarRespuesta(caso.value.respuesta)))
    const onCaso = ({ id, value }) => { if (id === 'usuario') api.cargarEstado(value); else if (id === 'conversacion') api.setConversacionActiva(value); else if (id === 'respuesta') api.cargarRespuesta(value); else if (id === 'historico') api.setHistorico(value) }
    // Si el usuario deja una conversación a medias (cierra el panel) o empieza otra, el interruptor del Facilitador sigue al estado real
    watch(() => api.hayConversacion, (v) => { if (caso.value.conversacion !== v) { caso.value = { ...caso.value, conversacion: v }; escribirParam('conversacion', v ? 1 : 0, 0) } })
    // Contenedor del contenido en desktop (tablet y mobile mantienen siempre la capa a pantalla completa): R4Popover bajo el campo · R4Sheet side con el campo dentro. Se elige con ?c=popover (por defecto, Sheet side).
    const contenedor = ref(new URLSearchParams(location.search).get('c') === 'popover' ? 'popover' : 'sheet')
    const desktopField = ref(null)
    const sheetField = ref(null)
    const trigger = ref(null)
    const mobileField = ref(null)
    const placeholder = 'Busca o pregunta'
    onMounted(() => { document.title = 'Enfoque buscador · Prototipo R4' })

    // Al abrir la capa NO se enfoca la caja (Jon, 2026-11-19): el usuario la ve y entra en ella cuando quiere. (R4Sheet sí enfoca su botón de cierre, como pide su accesibilidad.)
    const cerrarYDevolverFoco = () => { api.cerrar(); const t = trigger.value; if (t && t.offsetParent !== null) t.focus() }
    // composedPath y no e.target: al pulsar «Borrar» el botón desaparece del DOM antes de que el clic llegue al documento y e.target.closest() no lo encontraría dentro del panel
    const onDocClick = (e) => { if (api.open && !e.composedPath().some((n) => n.matches && n.matches('.usearch, .usearch-desk, .r4-sheet, .menu__compact-button, .facilitador'))) api.cerrar() }
    // Los enlaces «#» de la maqueta recargarían el prototipo por el router de hash: se neutralizan
    const onDocLink = (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault() }
    const onKey = (e) => { if (e.key === 'Escape' && api.open) cerrarYDevolverFoco() }
    const onFocusOut = (e) => { // Tab fuera del campo y del popover (desktop): cierra
      const host = e.currentTarget
      if (api.open && e.relatedTarget && !host.contains(e.relatedTarget) && !e.relatedTarget.closest('.r4-sheet, .usearch')) api.cerrar()
    }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('click', onDocLink); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('click', onDocLink); document.removeEventListener('keydown', onKey) })

    return { api, caso, FACILITADOR, onCaso, contenedor, sheetField, desktopField, trigger, mobileField, placeholder, cerrarYDevolverFoco, onFocusOut }
  },
  template: `
    <FichaAccion search-icon="ic-search-ai" :search-badge="api.hayConversacion" :facilitator="false" @search="api.abrir()">
      <template #search>
        <div class="usearch">
          <button ref="trigger" type="button" class="menu__search usearch__trigger" aria-haspopup="dialog" :aria-expanded="api.open ? 'true' : 'false'" :aria-label="api.hayConversacion ? placeholder + ' (conversación activa)' : placeholder" :title="placeholder" @click="api.open ? cerrarYDevolverFoco() : api.abrir()"><Icon class="menu__search-ai" name="ic-search-ai" /><R4Badge v-if="api.hayConversacion" class="menu__badge" tone="highlight" decorative /></button>
        </div>
      </template>

      <template #overlay>
        <!-- Desktop: capa blanca sobre la franja negra del Menu; campo centrado (máx. 800) y el popover debajo, a 8 px -->
        <div v-if="api.open" class="usearch-scrim" aria-hidden="true"></div>
        <div v-if="api.open && contenedor === 'popover'" class="usearch-desk" role="dialog" aria-label="Buscar o preguntar" @focusout="onFocusOut">
          <div class="usearch-desk__center">
            <div v-if="!api.chatView && api.vista !== 'historial'" class="usearch__fieldrow">
              <R4InputSearch ref="desktopField" :model-value="api.query" @update:model-value="api.escribir" size="medium" :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                             @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
              </R4InputSearch>
            </div>
            <div v-else class="usearch__chatbar"><button type="button" class="usearch__chatclose" aria-label="Cerrar" @click="cerrarYDevolverFoco()"><Icon name="close" /></button></div>
            <div class="usearch-desk__pop">
              <R4Popover width="wider" density="none">
                <div class="usearch__pop"><UnifiedSearchPanel :api="api" /><div v-if="api.barra" class="usearch-actions"><AssistantAccess @ask="api.preguntarLoEscrito()" /></div></div>
              </R4Popover>
            </div>
          </div>
        </div>

        <!-- Desktop con Sheet: R4Sheet side (520) con el campo arriba y el panel debajo. El CSS lo oculta en tablet y mobile, donde manda la capa a pantalla completa -->
        <div v-if="contenedor === 'sheet'" class="usearch-sheet">
          <R4Sheet position="side" :title="placeholder" :open="api.open" :show-actions="api.barra" @close="cerrarYDevolverFoco()">
            <div class="usearch-sheet__body" :class="{ 'usearch-sheet__body--actions': api.barra }">
              <div v-if="!api.chatView && api.vista !== 'historial'" class="usearch__fieldrow">
                <R4InputSearch ref="sheetField" :model-value="api.query" @update:model-value="api.escribir" size="medium" placeholder="Busca un producto o pregunta al asistente" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" />
            </div>
            <template #actions><AssistantAccess @ask="api.preguntarLoEscrito()" /></template>
          </R4Sheet>
        </div>

        <!-- Tablet y mobile (≤ 1023): R4Sheet bottom con el título «Busca o pregunta» y el aspa de cerrar, y dentro el campo y el panel. El CSS lo oculta en desktop, donde manda el popover o el Sheet side -->
        <div class="usearch-sheetbottom">
          <R4Sheet position="bottom" full-height :title="placeholder" :open="api.open" :show-actions="api.barra" @close="cerrarYDevolverFoco()">
            <div class="usearch-sheetbottom__body" :class="{ 'usearch-sheetbottom__body--actions': api.barra }">
              <div v-if="!api.chatView && api.vista !== 'historial'" class="usearch__fieldrow">
                <R4InputSearch ref="mobileField" :model-value="api.query" @update:model-value="api.escribir" size="large" placeholder="Busca un producto o pregunta al asistente" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" />
            </div>
            <template #actions><AssistantAccess @ask="api.preguntarLoEscrito()" /></template>
          </R4Sheet>
        </div>

        <div v-if="api.toast" class="buscador__toast" role="status">{{ api.toast }}</div>

        <Facilitador v-model:values="caso" :groups="FACILITADOR" @change="onCaso" />

      </template>
    </FichaAccion>
  `,
})
