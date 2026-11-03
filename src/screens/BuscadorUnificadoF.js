// Pantalla de PROTOTIPO DE INVESTIGACIÓN (Flujo B, sin diseño en Figma): variante F del plan «fusionar buscador y chat en r4.com» — conversación primero, sin pestañas ni modo elegido.
// Mismo escenario y mismo disparador que la variante E (ficha de acción; enlace «Busca o pregunta» del Menu / lupa de la barra compacta). Lo que cambia es lo que se abre:
//  · Desktop: R4Sheet side con el saludo, una descripción y la caja del prompt centrados en vertical. Tablet y mobile: capa a pantalla completa con el mismo contenido.
//  · Lo que escribe el usuario lo resuelve la conversación: una pregunta abre un diálogo; un nombre concreto (p. ej. «Telefónica») devuelve una lista de resultados dentro de la propia conversación.
// Un solo estado compartido (screens/_chatEstado.js): el Sheet y la capa lo pintan; el CSS muestra el que toca. Datos de ejemplo: src/data/buscador-unificado.js. Facilitador: abajo a la izquierda (?f=0 lo oculta).
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import FichaAccion from './FichaAccion.js'
import R4Sheet from '../components/pendientes/R4Sheet.js'
import Icon from '../icons/_Icon.js'
import _ChatSearchPanel from '../components/pendientes/_ChatSearchPanel.js'
import { crearEstadoChat } from './_chatEstado.js'
import { casosFijos } from '../data/buscador-unificado.js'

export default defineComponent({
  name: 'BuscadorUnificadoF',
  components: { Icon, FichaAccion, R4Sheet, ChatSearchPanel: _ChatSearchPanel },
  setup() {
    const api = crearEstadoChat()
    const sheetPanel = ref(null)
    const mobilePanel = ref(null)
    const trigger = ref(null)
    const mostrarFacilitador = new URLSearchParams(location.search).get('f') !== '0'
    const casos = Object.entries(casosFijos)
    const placeholder = 'Busca o pregunta'
    onMounted(() => { document.title = 'Buscador unificado · Variante F · Prototipo' })

    // Foco en la caja del prompt que se ve (el CSS oculta la otra por container query). R4Sheet enfoca su botón de cierre al abrir: el prompt va después.
    const focusVisible = async () => {
      await nextTick(); await nextTick()
      for (const p of [mobilePanel.value, sheetPanel.value]) {
        const el = p && p.$el
        if (el && el.getClientRects().length) { p.focus(); return }
      }
    }
    watch(() => api.open, (o) => { if (o) focusVisible() })
    // Al abrir la capa de mobile se bloquea el scroll de la página de debajo (solo con la capa visible)
    watch(() => api.open, async (o) => {
      await nextTick()
      const capa = document.querySelector('.usearch-mobile')
      document.documentElement.classList.toggle('usearch-lock', !!(o && capa && getComputedStyle(capa).display !== 'none'))
    })

    const cerrarYDevolverFoco = () => { api.cerrar(); const t = trigger.value; if (t && t.offsetParent !== null) t.focus() }
    // composedPath y no e.target: un botón puede desaparecer del DOM antes de que el clic llegue al documento
    const onDocClick = (e) => { if (api.open && !e.composedPath().some((n) => n.matches && n.matches('.usearch, .usearch-mobile, .r4-sheet, .menu__compact-button, .facil'))) api.cerrar() }
    // Los enlaces «#» de la maqueta recargarían el prototipo por el router de hash: se neutralizan
    const onDocLink = (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault() }
    const onKey = (e) => { if (e.key === 'Escape' && api.open) cerrarYDevolverFoco() }
    // Teclado nativo: la capa de mobile sigue al viewport visual (si no, queda por detrás del teclado)
    const vv = window.visualViewport
    const ajustarVV = () => { const s = document.documentElement.style; s.setProperty('--usearch-vvh', vv.height + 'px'); s.setProperty('--usearch-vvt', vv.offsetTop + 'px') }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('click', onDocLink); document.addEventListener('keydown', onKey); if (vv) { ajustarVV(); vv.addEventListener('resize', ajustarVV); vv.addEventListener('scroll', ajustarVV) } })
    onBeforeUnmount(() => { if (vv) { vv.removeEventListener('resize', ajustarVV); vv.removeEventListener('scroll', ajustarVV); document.documentElement.style.removeProperty('--usearch-vvh'); document.documentElement.style.removeProperty('--usearch-vvt') } document.removeEventListener('click', onDocClick); document.removeEventListener('click', onDocLink); document.removeEventListener('keydown', onKey); document.documentElement.classList.remove('usearch-lock') })

    return { api, sheetPanel, mobilePanel, trigger, placeholder, cerrarYDevolverFoco, mostrarFacilitador, casos }
  },
  template: `
    <FichaAccion search-icon="ic-search-ai" @search="api.abrir()">
      <template #search>
        <div class="usearch">
          <button ref="trigger" type="button" class="menu__search usearch__trigger" aria-haspopup="dialog" :aria-expanded="api.open ? 'true' : 'false'" :aria-label="placeholder" :title="placeholder" @click="api.open ? cerrarYDevolverFoco() : api.abrir()"><Icon name="ic-search-ai" /></button>
        </div>
      </template>

      <template #overlay>
        <div v-if="api.open" class="usearch-scrim" aria-hidden="true"></div>

        <!-- Desktop: R4Sheet side con la conversación. El CSS lo oculta en tablet y mobile, donde manda la capa a pantalla completa -->
        <div class="usearch-sheet">
          <R4Sheet position="side" :title="placeholder" :open="api.open" @close="cerrarYDevolverFoco()">
            <div class="csearch-sheet__body"><ChatSearchPanel ref="sheetPanel" :api="api" /></div>
          </R4Sheet>
        </div>

        <!-- Tablet y mobile: capa a pantalla completa (barra con título y cierre + conversación) -->
        <Transition name="usearch-layer">
          <div v-if="api.open" class="usearch-mobile" role="dialog" aria-modal="true" aria-labelledby="csearch-mobile-title">
            <div class="csearch-mobile__bar">
              <h2 id="csearch-mobile-title" class="csearch-mobile__title">{{ placeholder }}</h2>
              <button type="button" class="csearch-mobile__close" aria-label="Cerrar" @click="cerrarYDevolverFoco()"><Icon name="close" /></button>
            </div>
            <div class="usearch-mobile__panel"><ChatSearchPanel ref="mobilePanel" :api="api" /></div>
          </div>
        </Transition>

        <div v-if="api.toast" class="buscador__toast" role="status">{{ api.toast }}</div>

        <details v-if="mostrarFacilitador" class="facil">
          <summary>Facilitador</summary>
          <div class="facil__body">
            <fieldset class="facil__group"><legend>Mensajes de ejemplo</legend>
              <ul class="facil__cases"><li v-for="[k, c] in casos" :key="k"><button type="button" @click="api.usarTexto(k, 'caso del facilitador')"><b>{{ k }}</b> → {{ c.mode === 'chat' ? 'texto' : 'resultados' }}<em v-if="c.fallo"> · fallo a propósito</em></button></li></ul>
              <ul class="facil__cases"><li><button type="button" @click="api.usarTexto('¿Cómo funcionan los planes de pensiones?', 'pregunta')"><b>¿Cómo funcionan los planes de pensiones?</b> → texto</button></li></ul>
            </fieldset>
            <fieldset class="facil__group"><legend>Estado de partida</legend>
              <button type="button" class="facil__reset" @click="api.cargarEstado('nuevo')">Usuario sin conversaciones previas</button>
              <button type="button" class="facil__reset" @click="api.cargarEstado('historial')">Usuario con historial</button>
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
