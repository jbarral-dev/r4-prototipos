// Pantalla de PROTOTIPO DE INVESTIGACIÓN (Flujo B, sin diseño en Figma): variante E del plan «fusionar buscador y chat en r4.com» — un solo campo que decide el modo según lo escrito
// (pregunta → conversación; palabra o nombre → resultados), con el modo visible y corregible. Se evalúa el ACCESO desde la cabecera y lo que despliega.
// Escenario real: la ficha de producto · Acción (FichaAccion, con su Menu y su contenido) más el buscador unificado. El campo R4InputSearch ocupa el sitio del enlace «Buscador» de la franja
// superior del Menu (desktop) y es el disparador: al enfocarlo se abre el contenido dentro de un R4Popover anclado al campo. En tablet y mobile el disparador es la lupa de la barra compacta y el
// contenido va en una capa por encima de la página que baja desde arriba (animación propia: Figma no define movimiento).
// Un solo estado compartido (screens/_buscadorEstado.js): los dos hosts (popover de desktop y capa de tablet/mobile) lo pintan; el CSS muestra el que toca.
// Datos de ejemplo: src/data/buscador-unificado.js (casos de enrutado fijados, resultados y respuestas guionizadas). Panel del facilitador: abajo a la izquierda (se oculta con ?f=0).
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import FichaAccion from './FichaAccion.js'
import Facilitador, { valoresPorDefecto } from '../components/prototipo/Facilitador.js'
import R4InputSearch from '../components/pendientes/R4InputSearch.js'
import R4Button from '../components/pendientes/R4Button.js'
import R4Popover from '../components/pendientes/R4Popover.js'
import R4Sheet from '../components/pendientes/R4Sheet.js'
import Icon from '../icons/_Icon.js'
import _UnifiedSearchPanel from '../components/pendientes/_UnifiedSearchPanel.js'
import { crearEstado } from './_buscadorEstado.js'
import { casosFijos } from '../data/buscador-unificado.js'

export default defineComponent({
  name: 'BuscadorUnificadoE',
  components: { Icon, FichaAccion, Facilitador, R4Button, R4InputSearch, R4Popover, R4Sheet, UnifiedSearchPanel: _UnifiedSearchPanel },
  setup() {
    const api = crearEstado()
    // Use cases del prototipo (panel Facilitador, URL `?usuario=historial`; el valor por defecto no ensucia la URL)
    const FACILITADOR = [
      { label: 'Tipo de usuario', controls: [{ id: 'usuario', type: 'radio', options: [
        { value: 'nuevo', label: 'Entra por primera vez al chatbot', default: true },
        { value: 'historial', label: 'Ya ha entrado (tiene búsquedas y preguntas previas)' },
      ] }] },
    ]
    const caso = ref(valoresPorDefecto(FACILITADOR))
    api.cargarEstado(caso.value.usuario)
    const onCaso = ({ id, value }) => { if (id === 'usuario') api.cargarEstado(value) }
    // Contenedor del contenido en desktop (tablet y mobile mantienen siempre la capa a pantalla completa): R4Popover bajo el campo · R4Sheet side con el campo dentro. Se elige en el facilitador o con ?c=sheet.
    const contenedor = ref(new URLSearchParams(location.search).get('c') === 'popover' ? 'popover' : 'sheet')
    const desktopField = ref(null)
    const sheetField = ref(null)
    const trigger = ref(null)
    const mobileField = ref(null)
    const mostrarFacilitador = new URLSearchParams(location.search).get('f') !== '0'
    const casos = Object.entries(casosFijos)
    const placeholder = 'Busca o pregunta'
    onMounted(() => { document.title = 'Enfoque buscador · Prototipo R4' })

    // Foco en el campo que se ve (el CSS oculta el otro por container query)
    const focusVisible = async () => {
      await nextTick()
      await nextTick() // R4Sheet enfoca su botón de cierre al abrir: el campo va después
      for (const f of [mobileField.value, desktopField.value, sheetField.value]) {
        const el = f && f.$el
        if (el && el.getClientRects().length) { f.focus(); return }
      }
    }
    watch(() => api.open, (o) => { if (o) focusVisible() })
    watch(() => api.chatView, (v, antes) => { if (!v && antes && api.open) focusVisible() }) // «Nueva búsqueda»: vuelve el campo y recibe el foco
    const cerrarYDevolverFoco = () => { api.cerrar(); const t = trigger.value; if (t && t.offsetParent !== null) t.focus() }
    // composedPath y no e.target: al pulsar «Borrar» el botón desaparece del DOM antes de que el clic llegue al documento y e.target.closest() no lo encontraría dentro del panel
    const onDocClick = (e) => { if (api.open && !e.composedPath().some((n) => n.matches && n.matches('.usearch, .usearch-desk, .r4-sheet, .menu__compact-button, .facil, .facilitador'))) api.cerrar() }
    // Los enlaces «#» de la maqueta recargarían el prototipo por el router de hash: se neutralizan
    const onDocLink = (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault() }
    const onKey = (e) => { if (e.key === 'Escape' && api.open) cerrarYDevolverFoco() }
    const onFocusOut = (e) => { // Tab fuera del campo y del popover (desktop): cierra
      const host = e.currentTarget
      if (api.open && e.relatedTarget && !host.contains(e.relatedTarget) && !e.relatedTarget.closest('.r4-sheet, .usearch')) api.cerrar()
    }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('click', onDocLink); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('click', onDocLink); document.removeEventListener('keydown', onKey) })

    return { api, caso, FACILITADOR, onCaso, contenedor, sheetField, desktopField, trigger, mobileField, placeholder, cerrarYDevolverFoco, onFocusOut, mostrarFacilitador, casos }
  },
  template: `
    <FichaAccion search-icon="ic-search-ai" :facilitator="false" @search="api.abrir()">
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
              <R4InputSearch ref="desktopField" :model-value="api.query" @update:model-value="api.escribir" size="medium" :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
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
          <R4Sheet position="side" :title="placeholder" :open="api.open" @close="cerrarYDevolverFoco()">
            <div class="usearch-sheet__body">
              <div v-if="!api.chatView" class="usearch__fieldrow">
                <R4InputSearch ref="sheetField" :model-value="api.query" @update:model-value="api.escribir" size="medium" placeholder="" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" />
            </div>
          </R4Sheet>
        </div>

        <!-- Tablet y mobile (≤ 1023): R4Sheet bottom con el título «Busca o pregunta» y el aspa de cerrar, y dentro el campo y el panel. El CSS lo oculta en desktop, donde manda el popover o el Sheet side -->
        <div class="usearch-sheetbottom">
          <R4Sheet position="bottom" full-height :title="placeholder" :open="api.open" @close="cerrarYDevolverFoco()">
            <div class="usearch-sheetbottom__body">
              <div v-if="!api.chatView" class="usearch__fieldrow">
                <R4InputSearch ref="mobileField" :model-value="api.query" @update:model-value="api.escribir" size="large" placeholder="" :show-close="false" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                               @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                </R4InputSearch>
              </div>
              <UnifiedSearchPanel :api="api" />
            </div>
          </R4Sheet>
        </div>

        <div v-if="api.toast" class="buscador__toast" role="status">{{ api.toast }}</div>

        <Facilitador v-model:values="caso" :groups="FACILITADOR" @change="onCaso" />

        <details v-if="mostrarFacilitador" class="facil">
          <summary>Opciones y registro</summary>
          <div class="facil__body">
            <fieldset class="facil__group"><legend>Contenedor (desktop)</legend>
              <label><input type="radio" value="popover" v-model="contenedor" /> R4Popover bajo el campo</label>
              <label><input type="radio" value="sheet" v-model="contenedor" /> R4Sheet lateral (side)</label>
            </fieldset>
            <fieldset class="facil__group"><legend>Panel</legend>
              <label><input type="checkbox" v-model="api.opciones.ejemplos" /> Búsquedas y preguntas del estado inicial</label>
            </fieldset>
            <fieldset class="facil__group"><legend>Casos de enrutado fijados</legend>
              <ul class="facil__cases"><li v-for="[k, c] in casos" :key="k"><button type="button" @click="api.usarTexto(k, 'caso del facilitador')"><b>{{ k }}</b> → {{ c.mode === 'chat' ? 'conversación' : 'resultados' }}<em v-if="c.fallo"> · fallo a propósito</em></button></li></ul>
            </fieldset>
            <fieldset class="facil__group"><legend>Registro ({{ api.log.length }})</legend>
              <ol class="facil__log"><li v-for="(l, i) in api.log" :key="i"><span>{{ l.t }}s</span> <b>{{ l.evento }}</b> {{ l.detalle }}</li></ol>
            </fieldset>
            <button type="button" class="facil__reset" @click="api.reiniciar()">Reiniciar sesión</button>
          </div>
        </details>
      </template>
    </FichaAccion>
  `,
})
