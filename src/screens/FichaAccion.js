// Pantalla: ficha de producto · Acción (IBERDROLA). Figma "Proyectos - Fichas de Productos" (anbsZ1mpaxogwUM7dzbcPn):
//   desktop cl-ficha-accion--dk (2463:42378; variantes con Derivados = Opciones: 2478:41029 y 2481:36427) · mobile ficha-accion--mb (2448:15016; con Opciones: 2454:15572;
//   con el sheet «En otros mercados» sheetOtherMarkets 2454:15486 y la caja fija FixedProductTitle del frame «Efecto Scroll» 2612:141963).
//   Tablet: no hay diseño (nunca se diseña tablet): se apila como mobile con los tokens de modo Tablet y la rejilla de 8 columnas.
// Composición (TemplateDetail con headerSticky="main": solo la barra del Menu queda fija; superficie gris, sin Footer): 4 R4Wrapper density=compact con la prop `layout` (presets ya documentados en Confluence R4Wrapper v1.2).
//   [layout 12: R4PageTitleProduct] · [layout 12: R4Tabs] · [layout 8-4 (tabpanel): R4ChartLine | R4Stack gap=lg (_RiskBox + Resumen)] · [layout 8-4: Productos relacionados | Recomendación].
//   _RiskBox (caja de riesgo «6 / 6») va encima del Resumen, a 24 px (R4Stack gap=lg), como en el Figma desktop. En mobile y tablet (≤ 1023; mobile Figma 2816:102389, tablet extrapolado por decisión de Jon, 2026-11-11) sube a un PRIMER R4Wrapper (`ficha__w0`, antes del título):
//   se renderiza dos veces y el CSS muestra solo una (la oculta con display:none no se anuncia). Con `ficha__w0` oculto, el título (`ficha__w1`) recupera
//   el padding-top del primer Wrapper (token) porque `main > :first-child` lo seguiría siendo el oculto.
//   (El título del bloque Derivados es «Productos relacionados» por decisión de Jon, 2026-11-07; el Figma aún dice «Derivados».)
//   Un Wrapper = una fila-patrón, así que las tabs ya no comparten Wrapper con el gráfico (en el Figma sí): entre ambos queda el espacio natural de dos Wrappers (2 × density), sin corregir.
//   Mobile: el Figma parte los wrappers de otra manera ([título + tabs + gráfico] · [resumen + derivados + recomendación]); como el DOM es único se mantiene el reparto de desktop y el
//   espaciado vertical es solo el de los R4Wrapper (paddings y gap de la density compact), sin márgenes verticales en la pantalla.
// Controles del gráfico (Figma «Acciones Gráfico», desktop 2813:74279 y mobile 2816:98718; estado y reglas en _graficoEstado.js): R4Chip «Comparar» y «Configurar» (type=multiple, con badge) + selector de tipo
//   Líneas | Velas (R4SegmentedControls; en mobile, R4Button de icono). Comparar: R4Popover (≥ 1024) o R4Sheet bottom con buscador y resultados; al elegir un valor se añade su serie (eje en %), se deshabilitan
//   Configurar y el tipo de gráfico y salen los chips de series (_ChartComparativeChip); su aspa sale del modo. Configurar: R4Popover o R4Sheet con indicadores; al aplicarlos salta un R4Spinner y se pintan.
// Interacciones: tabs (solo «Detalle» tiene contenido diseñado) · periodos del gráfico (la serie no cambia: datos de ejemplo) · chips de Derivados (muestran los derivados de esa categoría,
//   como en la variante con Opciones del Figma) · «Mercado» del Resumen abre el sheet «En otros mercados» (bottom en <1024, side en ≥1024) · en mobile el título del producto, al salir del
//   viewport, deja fija bajo la cabecera la capa fixedProductTitleLayer (Figma 2756:76562, variantes mobile y desktop) y las acciones van en el R4ButtonDock.
// Datos de ejemplo: src/data/ficha-accion.js.
import { defineComponent, ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import FixedProductTitle from '../components/pendientes/FixedProductTitle.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4Stack from '../components/pendientes/R4Stack.js'
import _RiskBox from '../components/pendientes/_RiskBox.js'
import R4Section from '../components/pendientes/R4Section.js'
import R4PageTitleProduct from '../components/pendientes/R4PageTitleProduct.js'
import R4Tabs from '../components/pendientes/R4Tabs.js'
import R4ChartLine from '../components/pendientes/R4ChartLine.js'
import R4ListDetail from '../components/pendientes/R4ListDetail.js'
import R4Chip from '../components/pendientes/R4Chip.js'
import R4SegmentedControls from '../components/pendientes/R4SegmentedControls.js'
import _ChartComparativeChip from '../components/pendientes/_ChartComparativeChip.js'
import _ChartConfigPanel from '../components/pendientes/_ChartConfigPanel.js'
import _ChartComparePanel from '../components/pendientes/_ChartComparePanel.js'
import R4Tag from '../components/pendientes/R4Tag.js'
import R4Button from '../components/pendientes/R4Button.js'
import R4Link from '../components/pendientes/R4Link.js'
import R4Sheet from '../components/pendientes/R4Sheet.js'
import R4Popover from '../components/pendientes/R4Popover.js'
import R4NavigationItems from '../components/pendientes/R4NavigationItems.js'
import R4ButtonDock from '../components/pendientes/R4ButtonDock.js'
import _ProductActionsMenu from '../components/pendientes/_ProductActionsMenu.js'
import _SearchResultItem from '../components/pendientes/_SearchResultItem.js'
import _ChartGauge from '../components/pendientes/_ChartGauge.js'
import { iconComponent } from '../icons/_Icon.js'
import { accion, graficoControles } from '../data/ficha-accion.js'
import { useGraficoControles } from './_graficoEstado.js'
import dragScroll from '../directives/dragScroll.js'

const IcArrowRight = iconComponent('ic-arrow-right')

export default defineComponent({
  name: 'FichaAccion',
  // Extras para el prototipo del buscador unificado (BuscadorUnificadoE): evento `search` (lupa de la barra compacta) y slots `search` (campo en la franja superior del Menu, desktop) y `overlay` (capas propias).
  emits: ['search'],
  props: { searchIcon: { type: String, default: undefined } },
  directives: { dragScroll },
  components: {
    TemplateDetail, Menu, FixedProductTitle, R4Wrapper, R4Stack, RiskBox: _RiskBox, R4Section, R4PageTitleProduct, R4Tabs, R4ChartLine, R4ListDetail, R4Chip, R4Tag, R4Button, R4Link,
    R4Sheet, R4Popover, R4NavigationItems, R4ButtonDock, ProductActionsMenu: _ProductActionsMenu, SearchResultItem: _SearchResultItem, ChartGauge: _ChartGauge,
    R4SegmentedControls, ChartComparativeChip: _ChartComparativeChip, ChartConfigPanel: _ChartConfigPanel, ChartComparePanel: _ChartComparePanel,
  },
  setup() {
    document.title = `${accion.producto.productName} · Acciones · Renta 4`
    const d = accion
    const tab = ref(0)
    const period = ref('1d')
    const categoria = ref('cfds')
    const sheetOpen = ref(false)
    const titleVisible = ref(true)

    const derivados = computed(() => d.derivados.items[categoria.value].map((it) => ({ ...it, action: it.action ? { icon: 'ic-shopping-cart', label: `Comprar ${it.name}` } : undefined })))
    const verTodos = computed(() => d.derivados.verTodos[categoria.value])
    const tabIds = d.tabs.map((_, i) => ({ id: `ficha-tab-${i}`, panelId: 'ficha-panel', label: d.tabs[i].label }))
    const popover = ref(null) // { top, right } del popover «En otros mercados» (desktop), relativo al Resumen
    const actionsSheetOpen = ref(false)
    const closePopover = () => { popover.value = null }
    const mercadoOpen = computed(() => !!popover.value || sheetOpen.value)
    const resumen = computed(() => d.resumen.map((r) => (r.action ? { ...r, action: { ...r.action, haspopup: true, pressed: mercadoOpen.value } } : r)))
    const onResumenAction = async (it, e) => {
      if (it.concept !== 'Mercado') return
      if (mercadoOpen.value) { popover.value = null; sheetOpen.value = false; return } // segundo clic: cierra
      const btn = e && e.currentTarget
      const box = btn && btn.closest('.ficha__resumen')
      if (box) { const b = btn.getBoundingClientRect(); const s = box.getBoundingClientRect(); popover.value = { top: b.bottom - s.top + 8, right: s.right - b.right } }
      sheetOpen.value = true
      await nextTick()
      // El CSS decide cuál se ve (popover en ≥ 1024, bottom sheet por debajo): se descarta el que quede oculto para no duplicar estado
      const sheet = document.querySelector('.ficha__sheet--market')
      if (sheet && getComputedStyle(sheet).display === 'none') sheetOpen.value = false
      else popover.value = null
    }
    const onDocClick = (e) => { if (popover.value && !e.target.closest('.ficha__market-popover, .ficha__resumen .r4-listdetail__action')) closePopover() }
    const onKey = (e) => { if (e.key === 'Escape') closePopover() }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey) })
    const actionItems = d.producto.secondaryActions.map((a) => ({ title: a.label, icon: a.icon, showLink: a.showLink, linkHref: '#' }))

    // Controles del gráfico (Comparar · Configurar · tipo de gráfico): estado y reglas en _graficoEstado.js
    const gc = graficoControles
    const gr = reactive(useGraficoControles(d.grafico, gc))
    const vizItems = computed(() => [
      { label: 'Líneas', value: 'line', icon: 'ic-chart-line', disabled: gr.comparing },
      { label: 'Velas', value: 'candle', icon: 'ic-chart-candlestick', disabled: gr.comparing },
    ])
    const chartLabel = computed(() => (gr.comparing
      ? `Comparación de la variación porcentual de ${d.producto.productName} con ${gr.compared.map((c) => c.name).join(", ")} en el día de hoy`
      : `${gr.visualization === 'candle' ? 'Velas' : 'Evolución'} del precio de ${d.producto.productName} en el día de hoy`))

    return { resumen, popover, actionsSheetOpen, actionItems, d, tab, period, categoria, sheetOpen, titleVisible, derivados, verTodos, tabIds, onResumenAction, IcArrowRight, gc, gr, vizItems, chartLabel }
  },
  template: `
    <TemplateDetail header-sticky="main">
      <template #header>
        <Menu type="default" :search-icon="searchIcon" @search="$emit('search')"><template v-if="$slots.search" #search><slot name="search" /></template></Menu>
      </template>
      <template #header-extra>
        <FixedProductTitle :visible="!titleVisible" :product-name="d.producto.productName" :logo-u-r-l="d.producto.logoURL" :price="d.producto.price" :currency="d.producto.currency" :variation="d.producto.variation" :market="d.capaFija.market" :cta-text="d.producto.ctaText" />
      </template>

      <R4Wrapper v-if="tab === 0" density="compact" layout="12" class="ficha__w0">
        <RiskBox v-bind="d.riesgo" />
      </R4Wrapper>

      <R4Wrapper density="compact" layout="12" class="ficha__w1">
        <R4PageTitleProduct v-bind="d.producto" @visible-change="titleVisible = $event" />
      </R4Wrapper>

      <R4Wrapper density="compact" layout="12" class="ficha__w2">
        <R4Tabs :tabs="tabIds" :active-tab="tab" type="title" layout="scrollable" aria-label="Secciones del producto" @change="tab = $event" />
      </R4Wrapper>

      <R4Wrapper id="ficha-panel" density="compact" :layout="tab === 0 ? '8-4' : '12'" class="ficha__w3" role="tabpanel" :aria-labelledby="'ficha-tab-' + tab">
        <template v-if="tab === 0">
          <div class="ficha__chart">
            <R4ChartLine timeline="today" :points="gr.chart.points" :domain="gr.chart.domain" :progress="d.grafico.progress" :y-labels="gr.chart.yLabels" :x-labels="d.grafico.xLabels"
                         :visualization="gr.visualization" :candles="gc.candles" :compare-series="gr.chart.compareSeries" :overlays="gr.overlays" :loading="gr.loading"
                         :periods="d.grafico.periods" :selected-period="period" :aria-label="chartLabel" @period="period = $event">
              <template #filters>
                <div class="ficha__chart-anchor ficha__chart-anchor--compare">
                  <R4Chip type="multiple" icon="ic-exchange" label="Comparar" :selected="gr.panel === 'compare' || gr.sheet === 'compare' || gr.comparing" :expanded="gr.panel === 'compare' || gr.sheet === 'compare'"
                          :badge="gr.comparing ? 1 + gr.compared.length : undefined" :badge-aria-label="1 + gr.compared.length + ' valores en el gráfico'" :disabled="gr.full" aria-haspopup="dialog" @click="gr.open('compare')" />
                  <div v-if="gr.panel === 'compare'" class="ficha__chart-popover" role="dialog" aria-label="Comparar valores">
                    <R4Popover width="wider">
                      <ChartComparePanel v-model="gr.query" :results="gr.results" @select="gr.compare($event)" @close="gr.close()" />
                    </R4Popover>
                  </div>
                </div>
                <div class="ficha__chart-anchor ficha__chart-anchor--config">
                  <R4Chip type="multiple" icon="ic-cog" label="Configurar" :selected="gr.panel === 'config' || gr.sheet === 'config' || gr.selected.length > 0" :expanded="gr.panel === 'config' || gr.sheet === 'config'"
                          :badge="gr.selected.length || undefined" :badge-aria-label="gr.selected.length + ' indicadores aplicados'" :disabled="gr.comparing" aria-haspopup="dialog" @click="gr.open('config')" />
                  <div v-if="gr.panel === 'config'" class="ficha__chart-popover" role="dialog" aria-label="Configuración del gráfico">
                    <R4Popover width="wide">
                      <ChartConfigPanel :model-value="gr.selected" :groups="gc.configuracion" @update:model-value="gr.setIndicators($event)" />
                    </R4Popover>
                  </div>
                </div>
              </template>
              <template #visualization>
                <R4SegmentedControls class="ficha__viz-segmented" size="medium" type="iconAndText" aria-label="Tipo de gráfico" :items="vizItems" :selected-value="gr.visualization" @select="gr.visualization = $event" />
                <R4Button class="ficha__viz-button" type="secondary" size="medium" :icon="gr.visualization === 'line' ? 'ic-chart-candlestick' : 'ic-chart-line'"
                          :aria-label="gr.visualization === 'line' ? 'Ver gráfico de velas' : 'Ver gráfico de líneas'" :disabled="gr.comparing" @click="gr.toggleVisualization()" />
              </template>
              <template v-if="gr.comparing" #comparing>
                <ul class="r4-chartline__comparing" aria-label="Series del gráfico">
                  <ChartComparativeChip :ticker="gc.ticker" :color="1" />
                  <ChartComparativeChip v-for="c in gr.compared" :key="c.ticker" :ticker="c.ticker" :color="c.color" removable :remove-label="'Quitar ' + c.name + ' de la comparación'" @remove="gr.uncompare(c.ticker)" />
                </ul>
              </template>
            </R4ChartLine>
          </div>
          <R4Stack gap="lg">
            <RiskBox class="ficha__riskbox-inline" v-bind="d.riesgo" />
            <R4Section class="ficha__resumen" appearance="boxed" background-color="white" title="Resumen">
              <R4ListDetail size="medium" :items="resumen" @action="onResumenAction" />
              <div v-if="popover" class="ficha__market-popover" role="dialog" aria-label="En otros mercados" :style="{ top: popover.top + 'px', right: popover.right + 'px' }">
                <R4Popover width="wide">
                  <p class="ficha__market-title">En otros mercados</p>
                  <ul class="ficha__results"><SearchResultItem v-for="m in d.otrosMercados" :key="m.name" v-bind="m" /></ul>
                </R4Popover>
              </div>
            </R4Section>
          </R4Stack>
        </template>
        <p v-else class="ficha__placeholder">Contenido de «{{ d.tabs[tab].label }}» no incluido en el prototipo.</p>
      </R4Wrapper>

      <R4Wrapper v-if="tab === 0" density="compact" layout="8-4" class="ficha__w4">
        <R4Section class="ficha__derivados" appearance="boxed" background-color="white" title="Productos relacionados">
          <div v-drag-scroll class="ficha__filters" role="group" aria-label="Tipo de derivado">
            <R4Chip v-for="c in d.derivados.categorias" :key="c.id" size="small" :label="c.label" :selected="categoria === c.id" @click="categoria = c.id" />
          </div>
          <ul class="ficha__results">
            <SearchResultItem v-for="(it, i) in derivados" :key="categoria + i" :name="it.name" :meta="it.meta" :price="it.price" :variation="it.variation" :tone="it.tone" :action="it.action" />
          </ul>
          <template v-if="verTodos">
            <R4Button class="ficha__ver-todos-desktop" type="text" size="medium" icon="ic-external-link" :text="verTodos" />
            <R4Link class="ficha__ver-todos-mobile" type="standalone" size="medium" href="#" :icon-right="IcArrowRight">{{ verTodos }}</R4Link>
          </template>
        </R4Section>

        <R4Section class="ficha__reco" appearance="boxed" background-color="white" title="Recomendación Renta 4">
          <div class="ficha__gauge"><ChartGauge :angle="d.recomendacion.gaugeAngle" :aria-label="'Recomendación: ' + d.recomendacion.tag" /></div>
          <R4Tag class="ficha__reco-tag" color="neutralDark" size="medium" :text="d.recomendacion.tag" />
          <R4ListDetail size="medium" :items="d.recomendacion.rows" />
          <R4Button class="ficha__reco-cta" type="text" size="medium" width="full-width" icon="ic-file-alt" :text="d.recomendacion.cta" />
        </R4Section>
      </R4Wrapper>

      <template #dock>
        <R4ButtonDock>
          <ProductActionsMenu :actions="d.producto.secondaryActions" as-sheet @open="actionsSheetOpen = true" />
          <R4Button type="primary" :text="d.producto.ctaText" />
        </R4ButtonDock>
      </template>

      <template #overlay>
        <slot name="overlay" />
        <R4Sheet class="ficha__sheet ficha__sheet--market" position="bottom" title="En otros mercados" :open="sheetOpen" @close="sheetOpen = false">
          <ul class="ficha__results"><SearchResultItem v-for="m in d.otrosMercados" :key="m.name" v-bind="m" /></ul>
        </R4Sheet>
        <R4Sheet class="ficha__sheet ficha__sheet--chart" position="bottom" title="Comparar valores" :open="gr.sheet === 'compare'" @close="gr.close()">
          <ChartComparePanel v-model="gr.query" placeholder="Buscar por valor, símbolo o ISIN" :results="gr.results" @select="gr.compare($event)" @close="gr.close()" />
        </R4Sheet>
        <R4Sheet class="ficha__sheet ficha__sheet--chart" position="bottom" title="Configuración del gráfico" :open="gr.sheet === 'config'" :primary-action-label="gr.dirty ? 'Guardar ajustes' : undefined"
                 :secondary-action-label="gr.dirty ? 'Cancelar' : undefined" @primary="gr.saveDraft()" @secondary="gr.close()" @close="gr.close()">
          <ChartConfigPanel v-model="gr.draft" :groups="gc.configuracion" />
        </R4Sheet>
        <R4Sheet class="ficha__sheet ficha__sheet--actions" position="bottom" title="Más acciones" :open="actionsSheetOpen" @close="actionsSheetOpen = false">
          <R4NavigationItems size="medium" density="narrow" :icon-is-boxed="false" :items="actionItems" aria-label="Más acciones" @select="actionsSheetOpen = false" />
        </R4Sheet>
      </template>
    </TemplateDetail>
  `,
})
