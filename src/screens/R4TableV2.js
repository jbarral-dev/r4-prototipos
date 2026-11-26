// Pantalla: prototipo «R4Table (v2)». Visual: Figma «Proyectos - Tablas» (sfu1WbUrgAfeaoJxPYylWy), frame r4table-v2-muchos-filtros--dk (668:23386; solo hay diseño desktop; tablet y mobile se adaptan con las guías).
// Contenido: tabla «Acciones · Mercado continuo» de r4.com (pantallazo de Jon, 2026-11-19) y logos de «Resources - Logos» (Figma).
// Composición (TemplateDetail, superficie gris, sin Footer como en el frame): Header (Menu type=default, Cliente=Logado) · Main: [R4Wrapper compact: R4PageTitleSection «Acciones», sin botones de acción]
// · [R4Wrapper compact: R4TableV2]. El R4TableV2 lleva «Filters and Views» + R4Section con la tabla (R4Table de Storybook). Interacción de filtros y vistas: ver la cabecera de R4TableV2.js.
// Facilitador: bloque «Escenarios» (Acciones · Movimientos · Fondos; parámetro de URL ?escenario=movimientos). Los datos de «Movimientos» son inventados.
// Los enlaces de cada fila y el botón de compra no navegan (prototipo).
import { defineComponent, ref, computed } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4PageTitleSection from '../components/pendientes/R4PageTitleSection.js'
import R4TableV2 from '../components/pendientes/R4TableV2.js'
import R4Text from '../components/pendientes/R4Text.js'
import R4Button from '../components/pendientes/R4Button.js'
import ProductDefaultLogo from '../components/pendientes/_ProductDefaultLogo.js'
import R4Variation from '../components/pendientes/_Variation.js'
import R4Rating from '../components/pendientes/_Rating.js'
import R4Tag from '../components/pendientes/R4Tag.js'
import Facilitador, { valoresPorDefecto } from '../components/prototipo/Facilitador.js'
import { filas, vistas, movimientos, vistasMovimientos, logosCripto, fondos, vistasFondos } from '../data/r4table-v2.js'

// Escenarios reproducibles con el panel Facilitador (herramienta del prototipo): «Acciones» (por defecto) y «Movimientos». (Jon pidió «3 opciones» pero solo enumeró estas dos.)
const FACILITADOR = [
  { label: 'Escenarios', controls: [{ id: 'escenario', type: 'radio', options: [{ value: 'acciones', label: 'Acciones', default: true }, { value: 'movimientos', label: 'Movimientos' }, { value: 'fondos', label: 'Fondos' }] }] },
  { label: 'Vistas', controls: [{ id: 'vistas', type: 'radio', param: 'vistas', options: [{ value: 'una-fila', label: 'En 1 fila, con los filtros', default: true }, { value: 'dos-filas', label: 'En 2 filas' }, { value: 'dentro-tabla', label: 'Dentro de la tabla' }] }] }, // disposición de las vistas y del nº de resultados (antes, prototipos A y B)
]
const LAYOUTS = { 'una-fila': 'inline', 'dos-filas': 'stacked', 'dentro-tabla': 'inside' } // valor del Facilitador → `layout` de R4TableV2
const ESCENARIOS = {
  acciones: { titulo: 'Acciones', breadcrumb: { items: [{ label: 'Invertir', href: '#' }, { label: 'Acciones' }] }, views: vistas, data: filas, aria: 'Acciones del Mercado continuo', footnote: 'Cotizaciones en tiempo real. Datos obtenidos a 19/1/2026 18:14:58. Horario peninsular.' },
  fondos: { titulo: 'Fondos', breadcrumb: { items: [{ label: 'Fondos y planes', href: '#' }, { label: 'Fondos' }] }, views: vistasFondos, data: fondos, aria: 'Fondos', footnote: undefined, menuActual: 2 }, // Menu: «Fondos y planes» activo
  movimientos: { titulo: 'Movimientos', breadcrumb: { items: [{ label: 'Tu cuenta', href: '#' }, { label: 'Movimientos' }] }, views: vistasMovimientos, data: movimientos, aria: 'Movimientos de la cuenta', footnote: undefined },
}
const logoPorNombre = { ...Object.fromEntries(filas.map((f) => [f.name, f.logoURL])), ...logosCripto }
const colorTipo = { Acciones: 'blue', Criptoactivos: 'blue', ETFs: 'blue', Fondos: 'blue' } // el tipo de producto es siempre R4Tag blue
const tipoVar = (v) => (v > 0 ? 'positive' : v < 0 ? 'negative' : 'neutral') // _Variation: type según el signo
const partesPct = (s) => { const n = /^-/.test(s); const f = s.replace(/^-/, '').replace(/\s*%$/, ''); return { type: n ? 'negative' : /^0,00$/.test(f) ? 'neutral' : 'positive', figure: f, unit: '%' } } // «-3,13%» → negative · 3,13 · %
const fmtE = (v) => nf(2).format(v) + '\u2009€'

const navItemsDe = (actual) => ['Tu cuenta', 'Carteras gestionadas', 'Fondos y planes', 'Bolsas y derivados', 'Renta fija', 'Soluciones Easy', 'Análisis e ideas'].map((label, i) => ({ label, current: i === actual })) // Figma: Menu Cliente=Logado con «Tu cuenta» activo y sin submenú; en Fondos, «Fondos y planes»

// Como en r4.com: separador de miles también en 4 cifras (1.558) y decimales según el valor (191,5 · 3,356 · 0,0817)
const nf = (d) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d, useGrouping: 'always' })
const fmt = (v) => (v === null || v === undefined ? '-' : nf(Math.abs(v) < 1 ? 4 : Math.abs(v) < 10 ? 3 : 2).format(v))
const fmtN = (v) => (v === null || v === undefined ? '-' : nf(0).format(v))
const signo = (v, s) => (v > 0 ? '+ ' : v < 0 ? '- ' : '') + s
const tono = (v) => (v > 0 ? 'success' : v < 0 ? 'error' : 'normal')

export default defineComponent({
  name: 'R4TableV2Prototipo',
  components: { TemplateDetail, Menu, R4Wrapper, R4PageTitleSection, R4TableV2, R4Text, R4Button, R4Tag, ProductDefaultLogo, Facilitador, R4Variation, R4Rating },
  setup(props) {
    document.title = 'R4Table (v2) · Prototipo R4'
    const caso = ref(valoresPorDefecto(FACILITADOR))
    const esc = computed(() => ESCENARIOS[caso.value.escenario])
    const navItems = computed(() => navItemsDe(esc.value.menuActual ?? 0))
    return { LAYOUTS, partesPct, tipoVar, caso, esc, FACILITADOR, logoPorNombre, colorTipo, fmtE, breadcrumb: null, navItems, filas, vistas, fmt, fmtN, signo, tono, abs: Math.abs, nf }
  },
  template: `
    <TemplateDetail>
      <template #header><Menu type="default" client="logado" :nav-items="navItems" :sub-nav-items="[]" /></template>

      <R4Wrapper density="compact" layout="12"><R4PageTitleSection :title="esc.titulo" :breadcrumb="esc.breadcrumb" /></R4Wrapper>

      <R4Wrapper density="compact" layout="12">
        <R4TableV2 :key="caso.escenario + caso.vistas" :layout="LAYOUTS[caso.vistas]" :views="esc.views" :data="esc.data" data-key="id" :aria-label="esc.aria" :footnote="esc.footnote">
          <template #body-name="{ data }">
            <span class="r4tv2__nombre"><img v-if="data.logoURL" class="r4tv2__logo" :src="data.logoURL" alt="" /><ProductDefaultLogo v-else :name="data.name" size="extraSmall" /><a class="r4tv2__link" href="#" @click.prevent>{{ data.name }}</a></span>
          </template>
          <template #body-last="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-dif="{ value }"><R4Variation :type="tipoVar(value)" :figure="fmt(abs(value))" /></template>
          <template #body-difPct="{ data }"><R4Variation :type="tipoVar(data.difPct)" :figure="nf(2).format(abs(data.difPct)).replace(/^(\\d+)$/, '$1,00')" unit="%" /></template>
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
          <template #body-fecha="{ value }"><R4Text :text="value" /></template>
          <template #body-valor="{ data }">
            <R4Text v-if="data.esDetalle" class="r4tv2__detalle" :text="data.valor" />
            <span v-else class="r4tv2__nombre"><img v-if="logoPorNombre[data.valor]" class="r4tv2__logo" :src="logoPorNombre[data.valor]" alt="" /><ProductDefaultLogo v-else :name="data.valor" size="extraSmall" /><a class="r4tv2__link" href="#" @click.prevent>{{ data.valor }}</a></span>
          </template>
          <template #body-descripcion="{ value }"><R4Text :text="value" /></template>
          <template #body-tipo="{ value }"><R4Tag size="small" :color="colorTipo[value]" :text="value" /></template>
          <template #body-importe="{ value }"><R4Text :text="signo(value, fmtE(abs(value)))" :variant="tono(value)" /></template>
          <template #body-saldo="{ value }"><R4Text :text="fmtE(value)" /></template>
          <template #body-cantidad="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-precio="{ value }"><R4Text :text="fmtE(value)" /></template>
          <template #body-comision="{ value }"><R4Text :text="fmtE(value)" /></template>
          <!-- Fondos: porcentajes con variación (verde / rojo) y rating en estrellas; el resto son textos y números tal cual -->
          <template v-for="campo in ['rentAnio', 'rent1m', 'rent3m', 'rent6m', 'rent1a', 'rent3a', 'rent5a']" #[\`body-\${campo}\`]="{ value }"><R4Variation v-if="value" v-bind="partesPct(value)" /></template>
          <template #body-rating="{ value }"><R4Rating :rating="value" /></template>
          <template #body-accion="{ data }"><R4Button type="text" size="medium" icon="ic-shopping-cart" :aria-label="'Comprar ' + data.name" /></template>
        </R4TableV2>
      </R4Wrapper>
      <template #overlay><Facilitador v-model:values="caso" :groups="FACILITADOR" /></template>
    </TemplateDetail>
  `,
})
