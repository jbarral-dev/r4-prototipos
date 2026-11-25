// Pantalla de PROTOTIPO DE INVESTIGACIÓN (Flujo B, sin diseño en Figma): variante E del plan «fusionar buscador y chat en r4.com» — un solo campo que decide el modo según lo escrito
// (pregunta → conversación; palabra o nombre → resultados), con el modo visible y corregible. Se evalúa el ACCESO desde la cabecera y lo que despliega.
// Escenario real: la ficha de producto · Acción (FichaAccion, con su Menu y su contenido) más el buscador unificado. El campo R4InputSearch ocupa el sitio del enlace «Buscador» de la franja
// superior del Menu (desktop) y es el disparador: al enfocarlo se abre el contenido dentro de un R4Popover anclado al campo. En tablet y mobile el disparador es la lupa de la barra compacta y el
// contenido va en una capa por encima de la página que baja desde arriba (animación propia: Figma no define movimiento).
// Un solo estado compartido (screens/_buscadorEstado.js): los dos hosts (popover de desktop y capa de tablet/mobile) lo pintan; el CSS muestra el que toca.
// Datos de ejemplo: src/data/buscador-unificado.js (casos de enrutado fijados, resultados y respuestas guionizadas). Panel del facilitador: abajo a la izquierda (se oculta con ?f=0).
import { defineComponent, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import FichaAccion from './FichaAccion.js'
import R4InputSearch from '../components/pendientes/R4InputSearch.js'
import R4Button from '../components/pendientes/R4Button.js'
import R4Popover from '../components/pendientes/R4Popover.js'
import R4Sheet from '../components/pendientes/R4Sheet.js'
import Icon from '../icons/_Icon.js'
import _UnifiedSearchPanel from '../components/pendientes/_UnifiedSearchPanel.js'
import { crearEstado } from './_buscadorEstado.js'
import { seguirTeclado } from '../components/prototipo/seguirTeclado.js'
import Facilitador, { valoresPorDefecto, escribirParam } from '../components/prototipo/Facilitador.js'
import _AppTabBar from '../components/pendientes/_AppTabBar.js'

export default defineComponent({
  name: 'BuscadorUnificadoE',
  components: { Icon, Facilitador, AppTabBar: _AppTabBar, FichaAccion, R4Button, R4InputSearch, R4Popover, R4Sheet, UnifiedSearchPanel: _UnifiedSearchPanel },
  setup() {
    const api = crearEstado()
    // Contenedor del contenido en desktop (tablet y mobile mantienen siempre la capa a pantalla completa): R4Popover bajo el campo · R4Sheet side con el campo dentro. Se elige en el facilitador o con ?c=sheet.
    const contenedor = ref(new URLSearchParams(location.search).get('c') === 'popover' ? 'popover' : 'sheet')
    const desktopField = ref(null)
    const sheetField = ref(null)
    const trigger = ref(null)
    const mobileField = ref(null)
    const placeholder = 'Busca o pregunta'
    // Listado del histórico: título «Histórico» y «Volver» en la cabecera del R4Sheet (slot header), como en «Chatbot»
    const tituloCapa = computed(() => (api.vista === 'historial' ? 'Histórico' : placeholder))
    const hayVolver = () => api.vista === 'historial'
    const volver = async (e) => { const sheet = e.currentTarget.closest('.r4-sheet'); api.vista = 'inicio'; await nextTick(); sheet?.querySelector('.r4-sheet__close')?.focus() }
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
    onMounted(() => { document.title = 'Chatbot (tabs) · Prototipo R4' })

    // Foco en el campo que se ve (el CSS oculta el otro por container query)
    const focusVisible = async () => {
      await nextTick()
      await nextTick() // R4Sheet (side y bottom) enfoca su botón de cierre al abrir: el campo va después
      for (const f of [mobileField.value, desktopField.value, sheetField.value]) {
        const el = f && f.$el
        if (el && el.offsetParent !== null && getComputedStyle(el.closest('.usearch-sheetbottom') || el).display !== 'none') { f.focus(); return }
      }
    }
    watch(() => api.open, (o) => { if (o) focusVisible() })
    // Al abrir la capa de mobile se bloquea el scroll de la página de debajo
    // (solo con la capa visible: en desktop quitar la barra de scroll desplazaba la página al abrir el popover)
    watch(() => api.open, async (o) => {
      await nextTick()
      const capa = document.querySelector('.usearch-mobile')
      document.documentElement.classList.toggle('usearch-lock', !!(o && capa && getComputedStyle(capa).display !== 'none'))
    })

    const cerrarYDevolverFoco = () => { api.cerrar(); const t = trigger.value; if (t && t.offsetParent !== null) t.focus() }
    // composedPath y no e.target: al pulsar «Borrar» el botón desaparece del DOM antes de que el clic llegue al documento y e.target.closest() no lo encontraría dentro del panel
    const onDocClick = (e) => { if (api.open && !e.composedPath().some((n) => n.matches && n.matches('.usearch, .usearch-desk, .usearch-mobile, .r4-sheet, .menu__compact-button, .app-header__search, .facilitador, .facil'))) api.cerrar() }
    // Los enlaces «#» de la maqueta recargarían el prototipo por el router de hash: se neutralizan
    const onDocLink = (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault() }
    const onKey = (e) => { if (e.key === 'Escape' && api.open) cerrarYDevolverFoco() }
    const onFocusOut = (e) => { // Tab fuera del campo y del popover (desktop): cierra
      const host = e.currentTarget
      if (api.open && e.relatedTarget && !host.contains(e.relatedTarget) && !e.relatedTarget.closest('.usearch-mobile, .usearch')) api.cerrar()
    }
    // Teclado nativo: la capa de mobile sigue al viewport visual (si no, queda por detrás del teclado y el final del contenido no se alcanza con scroll)
    let dejarDeSeguir = () => {}
    const vv = null // (sustituido por seguirTeclado: la capa de mobile es ahora un R4Sheet bottom)
    const ajustarVV = () => { const s = document.documentElement.style; s.setProperty('--usearch-vvh', vv.height + 'px'); s.setProperty('--usearch-vvt', vv.offsetTop + 'px') }
    onMounted(() => { dejarDeSeguir = seguirTeclado(); document.addEventListener('click', onDocClick); document.addEventListener('click', onDocLink); document.addEventListener('keydown', onKey); if (vv) { ajustarVV(); vv.addEventListener('resize', ajustarVV); vv.addEventListener('scroll', ajustarVV) } })
    onBeforeUnmount(() => { dejarDeSeguir(); if (vv) { vv.removeEventListener('resize', ajustarVV); vv.removeEventListener('scroll', ajustarVV); document.documentElement.style.removeProperty('--usearch-vvh'); document.documentElement.style.removeProperty('--usearch-vvt') } document.removeEventListener('click', onDocClick); document.removeEventListener('click', onDocLink); document.removeEventListener('keydown', onKey); document.documentElement.classList.remove('usearch-lock') })

    return { api, tituloCapa, hayVolver, volver, contenedor, sheetField, desktopField, trigger, mobileField, placeholder, cerrarYDevolverFoco, onFocusOut, caso, FACILITADOR, onCaso }
  },
  template: `
    <FichaAccion :client="caso.usuario" search-icon="ic-search-ai" :search-badge="api.hayConversacion" :facilitator="false" @search="api.abrir()">
      <template #search>
        <div class="usearch">
          <button ref="trigger" type="button" class="menu__search usearch__trigger" aria-haspopup="dialog" :aria-expanded="api.open ? 'true' : 'false'" :aria-label="placeholder" :title="placeholder" @click="api.open ? cerrarYDevolverFoco() : api.abrir()"><Icon class="menu__search-ai" name="ic-search-ai" /></button>
        </div>
      </template>

      <template #overlay>
        <!-- Desktop: capa blanca sobre la franja negra del Menu; campo centrado (máx. 800) y el popover debajo, a 8 px -->
        <div v-if="api.open" class="usearch-scrim" aria-hidden="true"></div>
        <div v-if="api.open && contenedor === 'popover'" class="usearch-desk" role="dialog" aria-label="Buscar o preguntar" @focusout="onFocusOut">
          <div class="usearch-desk__center">
            <div v-if="!api.chatView" class="usearch__fieldrow">
              <R4InputSearch ref="desktopField" :show-erase="false" :model-value="api.query" @update:model-value="api.escribir" size="medium" :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                             @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
              </R4InputSearch>
            </div>
            <div v-else class="usearch__chatbar"><button type="button" class="usearch__chatclose" aria-label="Cerrar" @click="cerrarYDevolverFoco()"><Icon name="close" /></button></div>
            <div class="usearch-desk__pop">
              <R4Popover width="wider" density="none">
                <div class="usearch__pop"><UnifiedSearchPanel :api="api" /></div>
              </R4Popover>
            </div>
          </div>
        </div>

        <!-- Desktop con Sheet: R4Sheet side (520) con el campo arriba y el panel debajo. El CSS lo oculta en tablet y mobile, donde manda la capa a pantalla completa -->
        <div v-if="contenedor === 'sheet'" class="usearch-sheet">
          <R4Sheet position="side" :title="tituloCapa" :open="api.open" @close="cerrarYDevolverFoco()">
            <div class="usearch-sheet__body">
              <div v-if="!api.chatView" class="usearch__fieldrow">
                <R4InputSearch ref="sheetField" :show-erase="false" :model-value="api.query" @update:model-value="api.escribir" size="medium" placeholder="" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" />
            </div>
            <template #header="{ titleId }"><div class="usearch-sheet-head"><button v-if="hayVolver()" type="button" class="usearch-sheet-head__back" aria-label="Volver" @click="volver"><Icon name="ic-arrow-left" /></button><h2 :id="titleId" class="r4-sheet__title">{{ tituloCapa }}</h2></div></template>
          </R4Sheet>
        </div>

        <!-- Tablet y mobile (≤ 1023): R4Sheet bottom (alto completo, 90 %) con título «Busca o pregunta» y aspa de cerrar; dentro, el campo y el panel con las tabs. El CSS lo oculta en desktop -->
        <div class="usearch-sheetbottom">
          <R4Sheet position="bottom" full-height :title="tituloCapa" :open="api.open" @close="cerrarYDevolverFoco()">
            <div class="usearch-sheetbottom__body">
              <div v-if="!api.chatView" class="usearch__fieldrow">
                <R4InputSearch ref="mobileField" :show-erase="false" :model-value="api.query" @update:model-value="api.escribir" size="large" :placeholder="placeholder" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" />
            </div>
            <template #header="{ titleId }"><div class="usearch-sheet-head"><button v-if="hayVolver()" type="button" class="usearch-sheet-head__back" aria-label="Volver" @click="volver"><Icon name="ic-arrow-left" /></button><h2 :id="titleId" class="r4-sheet__title">{{ tituloCapa }}</h2></div></template>
          </R4Sheet>
        </div>

        <div v-if="api.toast" class="buscador__toast" role="status">{{ api.toast }}</div>

        <!-- Usuario «App» (solo mobile): TabBar fija abajo; el menú que despliega su botón central no se reproduce -->
        <AppTabBar v-if="caso.usuario === 'app'" @select="api.avisar('Prototipo: se abriría «' + $event.label + '»')" @menu="api.avisar('Prototipo: se abriría el menú de la App')" />

        <Facilitador v-model:values="caso" :groups="FACILITADOR" @change="onCaso" />
      </template>
    </FichaAccion>
  `,
})
