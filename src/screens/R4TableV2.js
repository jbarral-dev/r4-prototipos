// Pantalla: prototipo «R4Table (v2)». Visual: Figma «Proyectos - Tablas» (sfu1WbUrgAfeaoJxPYylWy), frame r4table-v2-muchos-filtros--dk (668:23386; solo hay diseño desktop; tablet y mobile se adaptan con las guías).
// Contenido: tabla «Acciones · Mercado continuo» de r4.com (pantallazo de Jon, 2026-11-19) y logos de «Resources - Logos» (Figma).
// Composición (TemplateDetail, superficie gris, sin Footer como en el frame): Header (Menu type=default, Cliente=Logado) · Main: [R4Wrapper compact: R4PageTitleSection «Acciones», sin botones de acción]
// · [R4Wrapper compact: R4TableV2]. El R4TableV2 lleva «Filters and Views» + R4Section con la tabla (R4Table de Storybook). Interacción de filtros y vistas: ver la cabecera de R4TableV2.js.
// Los enlaces de cada fila y el botón de compra no navegan (prototipo).
import { defineComponent } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4PageTitleSection from '../components/pendientes/R4PageTitleSection.js'
import R4TableV2 from '../components/pendientes/R4TableV2.js'
import R4Text from '../components/pendientes/R4Text.js'
import R4Button from '../components/pendientes/R4Button.js'
import ProductDefaultLogo from '../components/pendientes/_ProductDefaultLogo.js'
import { filas, vistas } from '../data/r4table-v2.js'

const navItems = ['Tu cuenta', 'Carteras gestionadas', 'Fondos y planes', 'Bolsas y derivados', 'Renta fija', 'Soluciones Easy', 'Análisis e ideas'].map((label, i) => ({ label, current: i === 0 })) // Figma: Menu Cliente=Logado con «Tu cuenta» activo y sin submenú

// Como en r4.com: separador de miles también en 4 cifras (1.558) y decimales según el valor (191,5 · 3,356 · 0,0817)
const nf = (d) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d, useGrouping: 'always' })
const fmt = (v) => (v === null || v === undefined ? '-' : nf(Math.abs(v) < 1 ? 4 : Math.abs(v) < 10 ? 3 : 2).format(v))
const fmtN = (v) => (v === null || v === undefined ? '-' : nf(0).format(v))
const signo = (v, s) => (v > 0 ? '+ ' : v < 0 ? '- ' : '') + s
const tono = (v) => (v > 0 ? 'success' : v < 0 ? 'error' : 'normal')

export default defineComponent({
  name: 'R4TableV2Prototipo',
  components: { TemplateDetail, Menu, R4Wrapper, R4PageTitleSection, R4TableV2, R4Text, R4Button, ProductDefaultLogo },
  setup() {
    document.title = 'R4Table (v2) · Prototipo R4'
    const breadcrumb = { items: [{ label: 'Invertir', href: '#' }, { label: 'Acciones' }] } // 🏠 › Invertir › Acciones (la página actual, sin enlace)
    return { breadcrumb, navItems, filas, vistas, fmt, fmtN, signo, tono, abs: Math.abs, nf }
  },
  template: `
    <TemplateDetail>
      <template #header><Menu type="default" client="logado" :nav-items="navItems" :sub-nav-items="[]" /></template>

      <R4Wrapper density="compact" layout="12"><R4PageTitleSection title="Acciones" :breadcrumb="breadcrumb" /></R4Wrapper>

      <R4Wrapper density="compact" layout="12">
        <R4TableV2 :views="vistas" :data="filas" data-key="id" aria-label="Acciones del Mercado continuo" footnote="Cotizaciones en tiempo real. Datos obtenidos a 19/1/2026 18:14:58. Horario peninsular.">
          <template #body-name="{ data }">
            <span class="r4tv2__nombre"><img v-if="data.logoURL" class="r4tv2__logo" :src="data.logoURL" alt="" /><ProductDefaultLogo v-else :name="data.name" size="extraSmall" /><a class="r4tv2__link" href="#" @click.prevent>{{ data.name }}</a></span>
          </template>
          <template #body-last="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-dif="{ value }"><R4Text :text="signo(value, fmt(abs(value)))" :variant="tono(value)" /></template>
          <template #body-difPct="{ data }"><R4Text :text="signo(data.difPct, nf(2).format(abs(data.difPct)).replace(/^(\\d+)$/, '$1,00') + ' %')" :variant="tono(data.difPct)" /></template>
          <template #body-volC="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-compra="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-venta="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-volV="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-volumen="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-max52="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-min52="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-cap="{ value }"><R4Text :text="fmtN(value)" /></template>
          <template #body-per="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-ytd="{ value }"><R4Text :text="signo(value, fmt(abs(value)) + ' %')" :variant="tono(value)" /></template>
          <template #body-accion="{ data }"><R4Button type="text" size="medium" icon="ic-shopping-cart" :aria-label="'Comprar ' + data.name" /></template>
        </R4TableV2>
      </R4Wrapper>
    </TemplateDetail>
  `,
})
