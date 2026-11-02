// Pantalla de PROTOTIPO DE INVESTIGACIÓN (Flujo B, sin diseño en Figma): variante E del plan «fusionar buscador y chat en r4.com» — un solo campo en la cabecera que decide el modo según lo escrito
// (pregunta → conversación; palabra o nombre → resultados), con el modo visible y corregible. Se evalúa el ACCESO desde la cabecera y lo que despliega; el contenido de la página es de relleno.
// Composición (TemplateDetail, superficie gris, sin Footer, como las fichas): Menu type=default (Cliente=Logado) con el campo R4InputSearch en el slot `search` de la franja superior (desktop) ·
//   en tablet/mobile, la lupa de la barra compacta abre una capa a pantalla completa con el mismo campo y panel · R4Wrapper density=compact × 3 con cajas grises.
// Un solo estado compartido (screens/_buscadorEstado.js): los dos hosts (desplegable de desktop y capa de tablet/mobile) lo pintan; el CSS muestra el que toca.
// Datos de ejemplo: src/data/buscador-unificado.js (casos de enrutado fijados, resultados y respuestas guionizadas). Panel del facilitador: abajo a la izquierda (se oculta con ?f=0).
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4InputSearch from '../components/pendientes/R4InputSearch.js'
import R4Popover from '../components/pendientes/R4Popover.js'
import R4Button from '../components/pendientes/R4Button.js'
import _UnifiedSearchPanel from '../components/pendientes/_UnifiedSearchPanel.js'
import Icon from '../icons/_Icon.js'
import { crearEstado } from './_buscadorEstado.js'
import { casosFijos } from '../data/buscador-unificado.js'

export default defineComponent({
  name: 'BuscadorUnificadoE',
  components: { TemplateDetail, Menu, R4Wrapper, R4InputSearch, R4Popover, R4Button, UnifiedSearchPanel: _UnifiedSearchPanel, Icon },
  setup() {
    document.title = 'Buscador unificado · Variante E · Prototipo'
    const api = crearEstado()
    const desktopField = ref(null)
    const mobileField = ref(null)
    const mostrarFacilitador = new URLSearchParams(location.search).get('f') !== '0'
    const casos = Object.entries(casosFijos)

    // Foco en el campo que se ve (el CSS oculta el otro por container query)
    const focusVisible = async () => {
      await nextTick()
      for (const f of [mobileField.value, desktopField.value]) {
        const el = f && f.$el
        if (el && el.offsetParent !== null && getComputedStyle(el.closest('.usearch-mobile') || el).display !== 'none') { f.focus(); return }
      }
    }
    watch(() => api.open, (o) => { if (o) focusVisible() })

    const placeholder = 'Busca o pregunta'
    const cerrarYDevolverFoco = () => { api.cerrar(); const f = desktopField.value; if (f && f.$el.offsetParent !== null) f.focus() }
    const onDocClick = (e) => { if (api.open && !e.target.closest('.usearch, .usearch-mobile, .menu__compact-button, .facil')) api.cerrar() }
    // Los enlaces «#» del Menú (maqueta) recargarían el prototipo por el router de hash: se neutralizan
    const onDocLink = (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault() }
    const onKey = (e) => { if (e.key === 'Escape' && api.open) cerrarYDevolverFoco() }
    const onFocusOut = (e) => { // Tab fuera del campo y del panel: cierra (solo desktop; en la capa a pantalla completa el foco queda atrapado en ella)
      const host = e.currentTarget
      if (api.open && e.relatedTarget && !host.contains(e.relatedTarget) && !e.relatedTarget.closest('.usearch-mobile')) api.cerrar()
    }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('click', onDocLink); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('click', onDocLink); document.removeEventListener('keydown', onKey) })

    return { api, desktopField, mobileField, placeholder, cerrarYDevolverFoco, onFocusOut, mostrarFacilitador, casos }
  },
  template: `
    <TemplateDetail>
      <template #header>
        <Menu type="default" @search="api.abrir()">
          <template #search>
            <div class="usearch" @focusout="onFocusOut">
              <R4InputSearch ref="desktopField" v-model="api.query" :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" :icon="api.mode === 'chat' ? 'ic-comment-alt-dots' : 'search'"
                             @focus="api.abrir()" @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
                <template #status><span v-if="api.mode" class="usearch__mode" aria-hidden="true">{{ api.mode === 'chat' ? 'Conversación' : 'Resultados' }}</span></template>
              </R4InputSearch>
              <div v-if="api.open" class="usearch__dropdown"><R4Popover width="wider" density="none"><UnifiedSearchPanel :api="api" /></R4Popover></div>
            </div>
          </template>
        </Menu>
      </template>

      <R4Wrapper density="compact">
        <div class="r4-grid"><div class="buscador__col">
          <div class="buscador__box buscador__box--tall"><h1 class="buscador__title">Página de ejemplo</h1><p>Contenido de relleno: el estudio evalúa solo el acceso del buscador unificado en la cabecera y lo que despliega.</p></div>
        </div></div>
      </R4Wrapper>
      <R4Wrapper density="compact">
        <div class="r4-grid"><div class="buscador__col buscador__row">
          <div class="buscador__box"></div><div class="buscador__box"></div><div class="buscador__box"></div>
        </div></div>
      </R4Wrapper>
      <R4Wrapper density="compact">
        <div class="r4-grid"><div class="buscador__col"><div class="buscador__box buscador__box--tall"></div></div></div>
      </R4Wrapper>

      <template #overlay>
        <div v-if="api.open" class="usearch-mobile" role="dialog" aria-modal="true" aria-label="Buscar o preguntar">
          <div class="usearch-mobile__bar">
            <R4InputSearch ref="mobileField" v-model="api.query" size="large" :placeholder="placeholder" aria-label="Buscar un producto o preguntar al asistente" :icon="api.mode === 'chat' ? 'ic-comment-alt-dots' : 'search'"
                           @submit="api.enviarOBuscar()" @close="cerrarYDevolverFoco()">
              <template #status><span v-if="api.mode" class="usearch__mode" aria-hidden="true">{{ api.mode === 'chat' ? 'Conversación' : 'Resultados' }}</span></template>
            </R4InputSearch>
          </div>
          <div class="usearch-mobile__panel"><UnifiedSearchPanel :api="api" /></div>
        </div>

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
    </TemplateDetail>
  `,
})
