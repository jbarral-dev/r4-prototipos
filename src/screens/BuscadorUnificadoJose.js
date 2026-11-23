// Pantalla de PROTOTIPO DE INVESTIGACIÓN (Flujo B, sin diseño en Figma): variante E del plan «fusionar buscador y chat en r4.com» — un solo campo que decide el modo según lo escrito
// (pregunta → conversación; palabra o nombre → resultados), con el modo visible y corregible. Se evalúa el ACCESO desde la cabecera y lo que despliega.
// Escenario real: la ficha de producto · Acción (FichaAccion, con su Menu y su contenido) más el buscador unificado. El campo R4InputSearch ocupa el sitio del enlace «Buscador» de la franja
// superior del Menu (desktop) y es el disparador: al enfocarlo se abre el contenido dentro de un R4Popover anclado al campo. En tablet y mobile el disparador es la lupa de la barra compacta y el
// contenido va en una capa por encima de la página que baja desde arriba (animación propia: Figma no define movimiento).
// Un solo estado compartido (screens/_buscadorEstado.js): los dos hosts (popover de desktop y capa de tablet/mobile) lo pintan; el CSS muestra el que toca.
// Datos de ejemplo: src/data/buscador-unificado.js (casos de enrutado fijados, resultados y respuestas guionizadas). Panel del facilitador: abajo a la izquierda (se oculta con ?f=0).
import { defineComponent, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import FichaAccion from './FichaAccion.js'
import Facilitador, { valoresPorDefecto, escribirParam } from '../components/prototipo/Facilitador.js'
import { seguirTeclado } from '../components/prototipo/seguirTeclado.js'
import R4InputSearch from '../components/pendientes/R4InputSearch.js'
import R4Button from '../components/pendientes/R4Button.js'
import R4Popover from '../components/pendientes/R4Popover.js'
import _AssistantAccess from '../components/pendientes/_AssistantAccessJose.js'
import _ChatComposer from '../components/pendientes/_ChatComposerJose.js'
import _AppTabBar from '../components/pendientes/_AppTabBarJose.js'
import _AppHeader from '../components/pendientes/_AppHeaderJose.js'
import R4Badge from '../components/pendientes/R4Badge.js'
import R4Sheet from '../components/pendientes/R4Sheet.js'
import Icon from '../icons/_Icon.js'
import _UnifiedSearchPanel from '../components/pendientes/_UnifiedSearchPanelJose.js'
import { crearEstado } from './_buscadorEstadoJose.js'

export default defineComponent({
  name: 'BuscadorUnificadoJose',
  components: { Icon, FichaAccion, Facilitador, R4Badge, AssistantAccess: _AssistantAccess, ChatComposer: _ChatComposer, AppTabBar: _AppTabBar, AppHeaderJose: _AppHeader, R4Button, R4InputSearch, R4Popover, R4Sheet, UnifiedSearchPanel: _UnifiedSearchPanel },
  setup() {
    const api = crearEstado()
    // Use cases del prototipo (panel Facilitador, URL `?usuario=potencial&primera=no`; el valor por defecto no ensucia la URL)
    const FACILITADOR = [
      { label: 'Tipo de usuario', controls: [{ id: 'usuario', type: 'radio', options: [
        { value: 'potencial', label: 'Potencial' },
        { value: 'sinLogar', label: 'Cliente no logado' },
        { value: 'logado', label: 'Cliente logado', default: true },
        { value: 'app', label: 'App (solo mobile)' },
      ] }] }, // elige la cabecera (prop `client` del Menu)
      { label: '¿Primera interacción con el chatbot?', controls: [{ id: 'primera', type: 'radio', options: [
        { value: 'si', label: 'Sí', default: true },
        { value: 'no', label: 'No, ya tiene búsquedas y preguntas previas', disabled: (v) => v.usuario === 'potencial' }, // un potencial no puede tener búsquedas ni preguntas previas
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
    const corregirPotencial = () => { if (caso.value.usuario === 'potencial' && caso.value.primera === 'no') { caso.value = { ...caso.value, primera: 'si' }; escribirParam('primera', 'si', 'si'); return true } return false }
    corregirPotencial()
    api.cargarEstado(caso.value.primera === 'no' ? 'historial' : 'nuevo')
    if (caso.value.historico) api.setHistorico(true)
    if (caso.value.conversacion) api.setConversacionActiva(true)
    if (caso.value.respuesta !== 'ninguna') onMounted(() => nextTick(() => api.cargarRespuesta(caso.value.respuesta)))
    const onCaso = ({ id, value }) => { if (id === 'usuario' && corregirPotencial()) { api.cargarEstado('nuevo'); return } if (id === 'primera') api.cargarEstado(value === 'no' ? 'historial' : 'nuevo'); else if (id === 'conversacion') api.setConversacionActiva(value); else if (id === 'respuesta') api.cargarRespuesta(value); else if (id === 'historico') api.setHistorico(value) }
    // Si el usuario deja una conversación a medias (cierra el panel) o empieza otra, el interruptor del Facilitador sigue al estado real
    watch(() => api.hayConversacion, (v) => { if (caso.value.conversacion !== v) { caso.value = { ...caso.value, conversacion: v }; escribirParam('conversacion', v ? 1 : 0, 0) } })
    // Contenedor del contenido en desktop (tablet y mobile mantienen siempre la capa a pantalla completa): R4Popover bajo el campo · R4Sheet side con el campo dentro. Se elige con ?c=popover (por defecto, Sheet side).
    const contenedor = ref(new URLSearchParams(location.search).get('c') === 'popover' ? 'popover' : 'sheet')
    const desktopField = ref(null)
    const sheetField = ref(null)
    const trigger = ref(null)
    const mobileField = ref(null)
    const placeholder = 'Busca o pregunta'
    // Título del R4Sheet según la pantalla: conversación → «Chat» · listado del histórico → «Histórico» · resto → «Busca o pregunta»
    const tituloCapa = computed(() => (api.chatView ? 'Chat' : api.vista === 'historial' ? 'Histórico' : placeholder))
    onMounted(() => { document.title = 'Chatbot (Jose) · Prototipo R4' })

    // Chatbot (Jose): en tablet y mobile (R4Sheet bottom) al abrir la capa el R4InputSearch SÍ recibe el foco y sale el teclado (en el prototipo «Chatbot» no). En desktop (R4Sheet side) no se enfoca.
    // R4Sheet enfoca su botón de cierre al abrir (accesibilidad): el foco al campo se pide después. Si se reanuda una conversación no hay campo (va el prompt) y no se enfoca nada.
    // Teclado en móvil real: iOS/Android solo abren el teclado si el foco se pide DENTRO del gesto del toque, y la capa aún no existe en ese momento. Truco: un input invisible recibe el foco de forma síncrona en el toque
    // y, cuando la capa ya está pintada, el foco pasa al R4InputSearch (el teclado se queda abierto). Si no hay campo (se reanuda una conversación), se suelta.
    const proxy = ref(null)
    const compacto = () => !trigger.value || trigger.value.offsetParent === null // el botón de desktop está oculto: tablet y mobile
    const abrirDesdeCabecera = () => { if (!api.open && compacto()) proxy.value?.focus({ preventScroll: true }); api.abrir() }
    watch(() => api.open, async (abierta) => {
      if (!abierta) {
        // Al cerrar, R4Sheet devuelve el foco al elemento que lo tenía al abrir: aquí era el input invisible, y el teclado seguía a la vista. Se suelta y el foco va a la lupa (un botón no abre el teclado).
        await nextTick(); await nextTick()
        const a = document.activeElement
        if (a && a.matches && a.matches('input, textarea')) {
          a.blur()
          const lupa = [...document.querySelectorAll('.menu__compact-button--search, .japp-header__search')].find((e) => e.getClientRects().length)
          if (lupa) lupa.focus()
        }
        return
      }
      await nextTick(); await nextTick()
      const el = mobileField.value?.$el
      if (el && el.getClientRects().length) mobileField.value.focus()
      else if (document.activeElement === proxy.value) proxy.value.blur()
    })
    const cerrarYDevolverFoco = () => { api.cerrar(); const t = trigger.value; if (t && t.offsetParent !== null) t.focus() }
    // composedPath y no e.target: al pulsar «Borrar» el botón desaparece del DOM antes de que el clic llegue al documento y e.target.closest() no lo encontraría dentro del panel
    const onDocClick = (e) => { if (api.open && !e.composedPath().some((n) => n.matches && n.matches('.jusearch, .jusearch-desk, .r4-sheet, .menu__compact-button, .japp-header__search, .facilitador'))) api.cerrar() }
    // Los enlaces «#» de la maqueta recargarían el prototipo por el router de hash: se neutralizan
    const onDocLink = (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault() }
    const onKey = (e) => { if (e.key === 'Escape' && api.open) cerrarYDevolverFoco() }
    const onFocusOut = (e) => { // Tab fuera del campo y del popover (desktop): cierra
      const host = e.currentTarget
      if (api.open && e.relatedTarget && !host.contains(e.relatedTarget) && !e.relatedTarget.closest('.r4-sheet, .jusearch')) api.cerrar()
    }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('click', onDocLink); document.addEventListener('keydown', onKey) })
    // Teclado del móvil: la capa bottom sigue al viewport visual (ver seguirTeclado.js)
    let dejarDeSeguir = () => {}
    // Con el teclado a la vista, la barra «¿No encuentras lo que buscas?» (acciones del R4Sheet en resultados) no se muestra; aparece cuando el teclado desaparece. El prompt del chat sí se queda.
    const tecladoVisible = ref(false)
    onMounted(() => { dejarDeSeguir = seguirTeclado((v) => { tecladoVisible.value = v }) })
    onBeforeUnmount(() => { dejarDeSeguir(); document.removeEventListener('click', onDocClick); document.removeEventListener('click', onDocLink); document.removeEventListener('keydown', onKey) })

    // «Volver» (chat y listado del histórico) va en la cabecera del R4Sheet (slot `header`): al chat lo saca a la pantalla inicial (la conversación queda activa) y, desde el listado, también a la inicial. El foco pasa al aspa de cerrar (sin abrir el teclado en mobile)
    const volver = async (e) => { const sheet = e.currentTarget.closest('.r4-sheet'); if (api.chatView) api.volver(); else api.vista = 'inicio'; await nextTick(); sheet?.querySelector('.r4-sheet__close')?.focus() }
    const hayVolver = () => api.chatView || api.vista === 'historial'
    // El bloque Actions del chat (prompt + texto legal) tiene alto variable: el cuerpo cede el alto REAL medido (si no, el panel no hace scroll por dentro)
    let ro = null
    const medirAcciones = async () => {
      await nextTick(); ro?.disconnect(); if (!window.ResizeObserver) return
      ro = new ResizeObserver((entries) => entries.forEach((en) => { const h = Math.round(en.target.getBoundingClientRect().height); const sheet = en.target.closest('.r4-sheet'); if (sheet && h) sheet.style.setProperty('--jusearch-actions-live', h + 'px') }))
      document.querySelectorAll('.jusearch-sheet .r4-sheet__actions, .jusearch-sheetbottom .r4-sheet__actions').forEach((el) => ro.observe(el))
    }
    watch(() => [api.open, api.chatView, api.barra, api.vista], medirAcciones, { flush: 'post' })
    onBeforeUnmount(() => ro && ro.disconnect())
    return { api, tituloCapa, tecladoVisible, proxy, abrirDesdeCabecera, volver, hayVolver, caso, FACILITADOR, onCaso, contenedor, sheetField, desktopField, trigger, mobileField, placeholder, cerrarYDevolverFoco, onFocusOut }
  },
  template: `
    <FichaAccion :client="caso.usuario" :app-header="$options.components.AppHeaderJose" search-icon="ic-search-ai" :search-badge="api.hayConversacion" :facilitator="false" @search="abrirDesdeCabecera()">
      <template #search>
        <div class="jusearch">
          <button ref="trigger" type="button" class="menu__search jusearch__trigger" aria-haspopup="dialog" :aria-expanded="api.open ? 'true' : 'false'" :aria-label="api.hayConversacion ? placeholder + ' (conversación activa)' : placeholder" :title="tituloCapa" @click="api.open ? cerrarYDevolverFoco() : api.abrir()"><Icon class="menu__search-ai" name="ic-search-ai" /><R4Badge v-if="api.hayConversacion" class="menu__badge" tone="highlight" :outline="false" decorative /></button>
        </div>
      </template>

      <template #overlay>
        <!-- Desktop: capa blanca sobre la franja negra del Menu; campo centrado (máx. 800) y el popover debajo, a 8 px -->
        <div v-if="api.open" class="jusearch-scrim" aria-hidden="true"></div>
        <div v-if="api.open && contenedor === 'popover'" class="jusearch-desk" role="dialog" aria-label="Buscar o preguntar" @focusout="onFocusOut">
          <div class="jusearch-desk__center">
            <div v-if="!api.chatView && api.vista !== 'historial'" class="jusearch__fieldrow">
              <R4InputSearch ref="desktopField" :model-value="api.query" @update:model-value="api.escribir" size="medium" :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                             @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
              </R4InputSearch>
            </div>
            <div v-else class="jusearch__chatbar"><button type="button" class="jusearch__chatclose" aria-label="Cerrar" @click="cerrarYDevolverFoco()"><Icon name="close" /></button></div>
            <div class="jusearch-desk__pop">
              <R4Popover width="wider" density="none">
                <div class="jusearch__pop"><UnifiedSearchPanel :api="api" /><div v-if="api.barra" class="jusearch-actions"><AssistantAccess @ask="api.preguntarLoEscrito()" /></div></div>
              </R4Popover>
            </div>
          </div>
        </div>

        <!-- Desktop con Sheet: R4Sheet side (520) con el campo arriba y el panel debajo. El CSS lo oculta en tablet y mobile, donde manda la capa a pantalla completa -->
        <div v-if="contenedor === 'sheet'" class="jusearch-sheet">
          <R4Sheet position="side" :title="tituloCapa" :open="api.open" :show-actions="(api.barra && !tecladoVisible) || api.chatView" @close="cerrarYDevolverFoco()">
            <div class="jusearch-sheet__body" :class="{ 'jusearch-sheet__body--actions': (api.barra && !tecladoVisible) || api.chatView, 'jusearch-sheet__body--prompt': api.chatView }">
              <div v-if="!api.chatView && api.vista !== 'historial'" class="jusearch__fieldrow">
                <R4InputSearch ref="sheetField" :model-value="api.query" @update:model-value="api.escribir" size="medium" placeholder="Busca un producto o pregunta al asistente" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" :with-composer="false" />
            </div>
            <template #header="{ titleId }"><div class="jusearch-sheet-head"><button v-if="hayVolver()" type="button" class="jusearch-sheet-head__back" aria-label="Volver" @click="volver"><Icon name="ic-arrow-left" /></button><h2 :id="titleId" class="r4-sheet__title">{{ tituloCapa }}</h2></div></template>
            <template #actions><ChatComposer v-if="api.chatView" :api="api" /><AssistantAccess v-else @ask="api.preguntarLoEscrito()" /></template>
          </R4Sheet>
        </div>

        <!-- Tablet y mobile (≤ 1023): R4Sheet bottom con el título «Busca o pregunta» y el aspa de cerrar, y dentro el campo y el panel. El CSS lo oculta en desktop, donde manda el popover o el Sheet side -->
        <div class="jusearch-sheetbottom">
          <R4Sheet position="bottom" full-height :title="tituloCapa" :open="api.open" :show-actions="(api.barra && !tecladoVisible) || api.chatView" @close="cerrarYDevolverFoco()">
            <div class="jusearch-sheetbottom__body" :class="{ 'jusearch-sheetbottom__body--actions': (api.barra && !tecladoVisible) || api.chatView, 'jusearch-sheetbottom__body--prompt': api.chatView }">
              <div v-if="!api.chatView && api.vista !== 'historial'" class="jusearch__fieldrow">
                <R4InputSearch ref="mobileField" :model-value="api.query" @update:model-value="api.escribir" size="large" placeholder="Busca un producto o pregunta al asistente" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" :with-composer="false" />
            </div>
            <template #header="{ titleId }"><div class="jusearch-sheet-head"><button v-if="hayVolver()" type="button" class="jusearch-sheet-head__back" aria-label="Volver" @click="volver"><Icon name="ic-arrow-left" /></button><h2 :id="titleId" class="r4-sheet__title">{{ tituloCapa }}</h2></div></template>
            <template #actions><ChatComposer v-if="api.chatView" :api="api" /><AssistantAccess v-else @ask="api.preguntarLoEscrito()" /></template>
          </R4Sheet>
        </div>

        <div v-if="api.toast" class="buscador__toast" role="status">{{ api.toast }}</div>

        <input ref="proxy" class="jusearch-focus-proxy" type="text" inputmode="search" tabindex="-1" autocomplete="off" aria-hidden="true" />

        <!-- Usuario «App» (solo mobile): TabBar fija abajo; el menú que despliega su botón central no se reproduce -->
        <AppTabBar v-if="caso.usuario === 'app'" @select="api.avisar('Prototipo: se abriría «' + $event.label + '»')" @menu="api.avisar('Prototipo: se abriría el menú de la App')" />

        <Facilitador v-model:values="caso" :groups="FACILITADOR" @change="onCaso" />

      </template>
    </FichaAccion>
  `,
})
