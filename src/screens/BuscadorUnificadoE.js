// Pantalla de PROTOTIPO DE INVESTIGACIÓN (Flujo B, sin diseño en Figma): variante E del plan «fusionar buscador y chat en r4.com» — un solo campo que decide el modo según lo escrito
// (pregunta → conversación; palabra o nombre → resultados), con el modo visible y corregible. Se evalúa el ACCESO desde la cabecera y lo que despliega.
// Escenario real: la ficha de producto · Acción (FichaAccion, con su Menu y su contenido) más el buscador unificado. El campo R4InputSearch ocupa el sitio del enlace «Buscador» de la franja
// superior del Menu (desktop) y es el disparador: al enfocarlo se abre el contenido dentro de un R4Popover anclado al campo. En tablet y mobile el disparador es la lupa de la barra compacta y el
// contenido va en una capa por encima de la página que baja desde arriba (animación propia: Figma no define movimiento).
// Un solo estado compartido (screens/_buscadorEstado.js): los dos hosts (popover de desktop y capa de tablet/mobile) lo pintan; el CSS muestra el que toca.
// Datos de ejemplo: src/data/buscador-unificado.js (casos de enrutado fijados, resultados y respuestas guionizadas). Panel del facilitador: abajo a la izquierda (se oculta con ?f=0).
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import FichaAccion from './FichaAccion.js'
import R4InputSearch from '../components/pendientes/R4InputSearch.js'
import R4Popover from '../components/pendientes/R4Popover.js'
import _UnifiedSearchPanel from '../components/pendientes/_UnifiedSearchPanel.js'
import { crearEstado } from './_buscadorEstado.js'
import { casosFijos } from '../data/buscador-unificado.js'

export default defineComponent({
  name: 'BuscadorUnificadoE',
  components: { FichaAccion, R4InputSearch, R4Popover, UnifiedSearchPanel: _UnifiedSearchPanel },
  setup() {
    const api = crearEstado()
    const desktopField = ref(null)
    const mobileField = ref(null)
    const mostrarFacilitador = new URLSearchParams(location.search).get('f') !== '0'
    const casos = Object.entries(casosFijos)
    const placeholder = 'Busca o pregunta'
    onMounted(() => { document.title = 'Buscador unificado · Variante E · Prototipo' })

    // Foco en el campo que se ve (el CSS oculta el otro por container query)
    const focusVisible = async () => {
      await nextTick()
      for (const f of [mobileField.value, desktopField.value]) {
        const el = f && f.$el
        if (el && el.offsetParent !== null && getComputedStyle(el.closest('.usearch-mobile') || el).display !== 'none') { f.focus(); return }
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

    const cerrarYDevolverFoco = () => { api.cerrar(); const f = desktopField.value; if (f && f.$el.offsetParent !== null) f.focus() }
    const onDocClick = (e) => { if (api.open && !e.target.closest('.usearch, .usearch-mobile, .menu__compact-button, .facil')) api.cerrar() }
    // Los enlaces «#» de la maqueta recargarían el prototipo por el router de hash: se neutralizan
    const onDocLink = (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault() }
    const onKey = (e) => { if (e.key === 'Escape' && api.open) cerrarYDevolverFoco() }
    const onFocusOut = (e) => { // Tab fuera del campo y del popover (desktop): cierra
      const host = e.currentTarget
      if (api.open && e.relatedTarget && !host.contains(e.relatedTarget) && !e.relatedTarget.closest('.usearch-mobile')) api.cerrar()
    }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('click', onDocLink); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('click', onDocLink); document.removeEventListener('keydown', onKey); document.documentElement.classList.remove('usearch-lock') })

    return { api, desktopField, mobileField, placeholder, cerrarYDevolverFoco, onFocusOut, mostrarFacilitador, casos }
  },
  template: `
    <FichaAccion search-icon="ic-search-ai" @search="api.abrir()">
      <template #search>
        <div class="usearch" @focusout="onFocusOut">
          <R4InputSearch ref="desktopField" v-model="api.query" size="small" reserve-actions :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                         @focus="api.abrir()" @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
            <template #status><span v-if="api.mode" class="usearch__mode" aria-hidden="true">{{ api.mode === 'chat' ? 'Conversación' : 'Resultados' }}</span></template>
          </R4InputSearch>
          <div v-if="api.open" class="usearch__dropdown"><R4Popover width="wider" density="none"><UnifiedSearchPanel :api="api" /></R4Popover></div>
        </div>
      </template>

      <template #overlay>
        <Transition name="usearch-layer">
          <div v-if="api.open" class="usearch-mobile" role="dialog" aria-modal="true" aria-label="Buscar o preguntar">
            <div class="usearch-mobile__bar">
              <R4InputSearch ref="mobileField" v-model="api.query" size="large" :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" icon="ic-search-ai"
                             @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                <template #status><span v-if="api.mode" class="usearch__mode" aria-hidden="true">{{ api.mode === 'chat' ? 'Conversación' : 'Resultados' }}</span></template>
              </R4InputSearch>
            </div>
            <div class="usearch-mobile__panel"><UnifiedSearchPanel :api="api" /></div>
          </div>
        </Transition>

        <div v-if="api.toast" class="buscador__toast" role="status">{{ api.toast }}</div>

        <details v-if="mostrarFacilitador" class="facil">
          <summary>Facilitador</summary>
          <div class="facil__body">
            <fieldset class="facil__group"><legend>Panel</legend>
              <label><input type="checkbox" v-model="api.opciones.caption" /> Frase explicativa del campo vacío</label>
              <label><input type="checkbox" v-model="api.opciones.ejemplos" /> Recientes y preguntas de ejemplo</label>
              <label><input type="checkbox" v-model="api.opciones.explicacion" /> Frase «por qué este modo»</label>
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
