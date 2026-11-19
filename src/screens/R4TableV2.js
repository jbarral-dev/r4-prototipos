// Pantalla: prototipo «R4Table (v2)». Figma «Proyectos - Tablas» (sfu1WbUrgAfeaoJxPYylWy), frame r4table-v2-muchos-filtros--dk (668:23386; solo hay diseño desktop; tablet y mobile se adaptan con las guías).
// Composición (TemplateDetail, superficie gris, sin Footer como en el frame): Header (Menu type=default, Cliente=Logado) · Main: [R4Wrapper compact: R4PageTitleProduct (IBEX 35)] · [R4Wrapper compact: R4Tabs] · [R4Wrapper compact: R4TableV2].
// El R4TableV2 (lo que se trabaja aquí) lleva «Filters and Views» + R4Section con la tabla (R4Table de Storybook). Interacción de filtros y vistas: ver la cabecera de R4TableV2.js.
// Datos de ejemplo: src/data/r4table-v2.js (cabecera del IBEX 35: cifras del Figma). El enlace de cada fila y el botón de compra no navegan (prototipo).
import { defineComponent, ref } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4PageTitleProduct from '../components/pendientes/R4PageTitleProduct.js'
import R4Tabs from '../components/pendientes/R4Tabs.js'
import R4TableV2 from '../components/pendientes/R4TableV2.js'
import R4Text from '../components/pendientes/R4Text.js'
import R4Tag from '../components/pendientes/R4Tag.js'
import R4Button from '../components/pendientes/R4Button.js'
import { filas, vistas } from '../data/r4table-v2.js'

const flag = new URL('../assets/logos/flag-spain.svg', import.meta.url).href
const indice = {
  productName: 'IBEX 35', logoURL: flag, price: 19476.6, currency: 'EUR', variation: -0.21, updated: '16:28:32', ctaText: '',
  breadcrumbs: [{ label: 'Invertir', href: '#' }, { label: 'Bolsas', href: '#' }, { label: 'Bolsa nacional', href: '#' }, { label: 'Índices', href: '#' }, { label: 'IBEX 35' }],
}
const tabs = [{ label: 'Detalle', id: 'tabla-tab-0', panelId: 'tabla-panel' }, { label: 'Miembros', id: 'tabla-tab-1', panelId: 'tabla-panel' }, { label: 'Análisis técnico', id: 'tabla-tab-2', panelId: 'tabla-panel' }]

// Como en Figma: separador de miles también en 4 cifras (2.739) y decimales según el valor (214 · 22,18 · 3,652; sin decimales desde 1.000)
const navItems = ['Tu cuenta', 'Carteras gestionadas', 'Fondos y planes', 'Bolsas y derivados', 'Renta fija', 'Soluciones Easy', 'Análisis e ideas'].map((label, i) => ({ label, current: i === 0 })) // Figma: Menu Cliente=Logado con «Tu cuenta» activo y sin submenú
const nf = (d) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d, useGrouping: 'always' })
const fmt = (v) => (v === null || v === undefined ? '–' : nf(Math.abs(v) >= 1000 ? 0 : Math.abs(v) < 10 && !Number.isInteger(v) ? 3 : 2).format(v))
const fmtN = (v) => nf(0).format(v)
const signo = (v, s) => (v > 0 ? '+ ' : v < 0 ? '- ' : '') + s
const tono = (v) => (v > 0 ? 'success' : v < 0 ? 'error' : 'normal')
const colorTipo = { Acciones: 'blue', Criptoactivos: 'amber', ETFs: 'green', Fondos: 'neutralDark' }

export default defineComponent({
  name: 'R4TableV2Prototipo',
  components: { TemplateDetail, Menu, R4Wrapper, R4PageTitleProduct, R4Tabs, R4TableV2, R4Text, R4Tag, R4Button },
  setup() {
    document.title = 'R4Table (v2) · Prototipo R4'
    const tab = ref(1) // Miembros (el de Figma)
    return { tab, navItems, indice, tabs, filas, vistas, fmt, fmtN, signo, tono, colorTipo, abs: Math.abs }
  },
  template: `
    <TemplateDetail>
      <template #header><Menu type="default" client="logado" :nav-items="navItems" :sub-nav-items="[]" /></template>

      <R4Wrapper density="compact" layout="12"><R4PageTitleProduct v-bind="indice" /></R4Wrapper>
      <R4Wrapper density="compact" layout="12"><R4Tabs :tabs="tabs" :active-tab="tab" type="title" layout="scrollable" aria-label="Secciones del índice" @change="tab = $event" /></R4Wrapper>

      <R4Wrapper id="tabla-panel" density="compact" layout="12" role="tabpanel" :aria-labelledby="'tabla-tab-' + tab">
        <R4TableV2 v-show="tab === 1" :views="vistas" :data="filas" data-key="id" aria-label="Miembros del IBEX 35">
          <template #body-name="{ data }">
            <span class="r4tv2__nombre"><img v-if="data.logoURL" class="r4tv2__logo" :src="data.logoURL" alt="" /><span v-else class="r4tv2__logo" aria-hidden="true"></span><a class="r4tv2__link" href="#" @click.prevent>{{ data.name }}</a></span>
          </template>
          <template #body-last="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-dif="{ value }"><R4Text :text="signo(value, fmt(abs(value)))" :variant="tono(value)" /></template>
          <template #body-difPct="{ data }"><R4Text :text="signo(data.difPct, fmt(abs(data.difPct)) + ' %')" :variant="tono(data.difPct)" /></template>
          <template #body-volC="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-compra="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-venta="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-volV="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-volumen="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-tipo="{ value }"><R4Tag size="small" :color="colorTipo[value]" :text="value" /></template>
          <template #body-max52="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-min52="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-cap="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-per="{ value }"><R4Text :text="value === null ? '–' : fmt(value)" /></template>
          <template #body-ytd="{ value }"><R4Text :text="signo(value, fmt(abs(value)) + ' %')" :variant="tono(value)" /></template>
          <template #body-accion="{ data }"><R4Button type="text" size="medium" icon="ic-shopping-cart" :aria-label="'Comprar ' + data.name" /></template>
        </R4TableV2>
        <p v-if="tab !== 1" class="r4tv2__placeholder">Contenido de «{{ tabs[tab].label }}» no incluido en el prototipo.</p>
      </R4Wrapper>
    </TemplateDetail>
  `,
})
