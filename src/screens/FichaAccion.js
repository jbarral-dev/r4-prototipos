// Pantalla: ficha de producto · Acción (IBERDROLA). Figma "Proyectos - Fichas de Productos" (anbsZ1mpaxogwUM7dzbcPn):
//   desktop cl-ficha-accion--dk (2463:42378; variantes con Derivados = Opciones: 2478:41029 y 2481:36427) · mobile ficha-accion--mb (2448:15016; con Opciones: 2454:15572;
//   con el sheet «En otros mercados» sheetOtherMarkets 2454:15486 y la caja fija FixedProductTitle del frame «Efecto Scroll» 2612:141963).
//   Tablet: no hay diseño (nunca se diseña tablet): se apila como mobile con los tokens de modo Tablet y la rejilla de 8 columnas.
// Composición (TemplateDetail con headerSticky="main": solo la barra del Menu queda fija; superficie gris, sin Footer): 4 R4Wrapper density=compact con la prop `layout` (presets, extra pendiente de llevar al Sistema).
//   [layout 12: R4PageTitleProduct] · [layout 12: R4Tabs] · [layout 8-4 (tabpanel): R4ChartLine | Resumen] · [layout 8-4: Productos relacionados | Recomendación].
//   (El título del bloque Derivados es «Productos relacionados» por decisión de Jon, 2026-11-07; el Figma aún dice «Derivados».)
//   Un Wrapper = una fila-patrón, así que las tabs ya no comparten Wrapper con el gráfico (en el Figma sí): el espacio tabs → gráfico se corrige con un margen derivado de la density (ver FichaAccion.css).
//   Mobile: el Figma parte los wrappers de otra manera ([título + tabs + gráfico] · [resumen + derivados + recomendación]); como el DOM es único se mantiene el reparto de desktop y se
//   corrigen en mobile/tablet los espacios entre wrappers con márgenes derivados de la density (ver FichaAccion.css).
// Interacciones: tabs (solo «Detalle» tiene contenido diseñado) · periodos del gráfico (la serie no cambia: datos de ejemplo) · chips de Derivados (muestran los derivados de esa categoría,
//   como en la variante con Opciones del Figma) · «Mercado» del Resumen abre el sheet «En otros mercados» (bottom en <1024, side en ≥1024) · en mobile el título del producto, al salir del
//   viewport, deja fija bajo la cabecera la capa fixedProductTitleLayer (Figma 2756:76562, variantes mobile y desktop) y las acciones van en el R4ButtonDock.
// Datos de ejemplo: src/data/ficha-accion.js.
import { defineComponent, ref, computed, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import FixedProductTitle from '../components/pendientes/FixedProductTitle.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4Section from '../components/pendientes/R4Section.js'
import R4PageTitleProduct from '../components/pendientes/R4PageTitleProduct.js'
import R4Tabs from '../components/pendientes/R4Tabs.js'
import R4ChartLine from '../components/pendientes/R4ChartLine.js'
import R4ListDetail from '../components/pendientes/R4ListDetail.js'
import R4Chip from '../components/pendientes/R4Chip.js'
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
import { accion } from '../data/ficha-accion.js'
import dragScroll from '../directives/dragScroll.js'

const IcArrowRight = iconComponent('ic-arrow-right')

export default defineComponent({
  name: 'FichaAccion',
  // Extras para el prototipo del buscador unificado (BuscadorUnificadoE): evento `search` (lupa de la barra compacta) y slots `search` (campo en la franja superior del Menu, desktop) y `overlay` (capas propias).
  emits: ['search'],
  props: { searchIcon: { type: String, default: undefined } },
  directives: { dragScroll },
  components: {
    TemplateDetail, Menu, FixedProductTitle, R4Wrapper, R4Section, R4PageTitleProduct, R4Tabs, R4ChartLine, R4ListDetail, R4Chip, R4Tag, R4Button, R4Link,
    R4Sheet, R4Popover, R4NavigationItems, R4ButtonDock, ProductActionsMenu: _ProductActionsMenu, SearchResultItem: _SearchResultItem, ChartGauge: _ChartGauge,
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

    return { resumen, popover, actionsSheetOpen, actionItems, d, tab, period, categoria, sheetOpen, titleVisible, derivados, verTodos, tabIds, onResumenAction, IcArrowRight }
  },
  template: `
    <TemplateDetail header-sticky="main">
      <template #header>
        <Menu type="default" :search-icon="searchIcon" @search="$emit('search')"><template v-if="$slots.search" #search><slot name="search" /></template></Menu>
      </template>
      <template #header-extra>
        <FixedProductTitle :visible="!titleVisible" :product-name="d.producto.productName" :logo-u-r-l="d.producto.logoURL" :price="d.producto.price" :currency="d.producto.currency" :variation="d.producto.variation" :market="d.capaFija.market" :cta-text="d.producto.ctaText" />
      </template>

      <R4Wrapper density="compact" layout="12" class="ficha__w1">
        <R4PageTitleProduct v-bind="d.producto" @visible-change="titleVisible = $event" />
      </R4Wrapper>

      <R4Wrapper density="compact" layout="12" class="ficha__w2">
        <R4Tabs :tabs="tabIds" :active-tab="tab" type="title" layout="scrollable" aria-label="Secciones del producto" @change="tab = $event" />
      </R4Wrapper>

      <R4Wrapper id="ficha-panel" density="compact" :layout="tab === 0 ? '8-4' : '12'" class="ficha__w3" role="tabpanel" :aria-labelledby="'ficha-tab-' + tab">
        <template v-if="tab === 0">
          <div class="ficha__chart">
            <R4ChartLine timeline="today" :points="d.grafico.points" :domain="d.grafico.domain" :progress="d.grafico.progress" :y-labels="d.grafico.yLabels" :x-labels="d.grafico.xLabels"
                         :periods="d.grafico.periods" :selected-period="period" aria-label="Evolución del precio de IBERDROLA en el día de hoy" @period="period = $event" />
          </div>
          <R4Section class="ficha__resumen" appearance="boxed" background-color="white" title="Resumen">
            <R4ListDetail size="medium" :items="resumen" @action="onResumenAction" />
            <div v-if="popover" class="ficha__market-popover" role="dialog" aria-label="En otros mercados" :style="{ top: popover.top + 'px', right: popover.right + 'px' }">
              <R4Popover width="wide">
                <p class="ficha__market-title">En otros mercados</p>
                <ul class="ficha__results"><SearchResultItem v-for="m in d.otrosMercados" :key="m.name" v-bind="m" /></ul>
              </R4Popover>
            </div>
          </R4Section>
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
        <R4Sheet class="ficha__sheet ficha__sheet--actions" position="bottom" title="Más acciones" :open="actionsSheetOpen" @close="actionsSheetOpen = false">
          <R4NavigationItems size="medium" density="narrow" :icon-is-boxed="false" :items="actionItems" aria-label="Más acciones" @select="actionsSheetOpen = false" />
        </R4Sheet>
      </template>
    </TemplateDetail>
  `,
})
