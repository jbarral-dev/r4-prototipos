// Pantalla: prototipo «R4Table (v2)». Visual: Figma «Proyectos - Tablas» (sfu1WbUrgAfeaoJxPYylWy), frame r4table-v2-muchos-filtros--dk (668:23386; solo hay diseño desktop; tablet y mobile se adaptan con las guías).
// Contenido: tabla «Acciones · Mercado continuo» de r4.com (pantallazo de Jon, 2026-11-19) y logos de «Resources - Logos» (Figma).
// Composición (TemplateDetail, superficie gris, sin Footer como en el frame): Header (Menu type=default, Cliente=Logado) · Main: [R4Wrapper compact: R4PageTitleSection «Acciones», sin botones de acción]
// · [R4Wrapper compact: R4TableV2]. El R4TableV2 lleva «Filters and Views» + R4Section con la tabla (R4Table de Storybook). Interacción de filtros y vistas: ver la cabecera de R4TableV2.js.
// Facilitador: bloque «Escenarios» (Acciones · Movimientos; parámetro de URL ?escenario=movimientos). Los datos de «Movimientos» son inventados.
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
import R4Tag from '../components/pendientes/R4Tag.js'
import Facilitador, { valoresPorDefecto } from '../components/prototipo/Facilitador.js'
import { filas, vistas, movimientos, vistasMovimientos } from '../data/r4table-v2.js'

// Escenarios reproducibles con el panel Facilitador (herramienta del prototipo): «Acciones» (por defecto) y «Movimientos». (Jon pidió «3 opciones» pero solo enumeró estas dos.)
const FACILITADOR = [
  { label: 'Escenarios', controls: [{ id: 'escenario', type: 'radio', options: [{ value: 'acciones', label: 'Acciones', default: true }, { value: 'movimientos', label: 'Movimientos' }] }] },
]
const ESCENARIOS = {
  acciones: { titulo: 'Acciones', breadcrumb: { items: [{ label: 'Invertir', href: '#' }, { label: 'Acciones' }] }, views: vistas, data: filas, aria: 'Acciones del Mercado continuo', footnote: 'Cotizaciones en tiempo real. Datos obtenidos a 19/1/2026 18:14:58. Horario peninsular.' },
  movimientos: { titulo: 'Movimientos', breadcrumb: { items: [{ label: 'Tu cuenta', href: '#' }, { label: 'Movimientos' }] }, views: vistasMovimientos, data: movimientos, aria: 'Movimientos de la cuenta', footnote: undefined },
}
const logoPorNombre = Object.fromEntries(filas.map((f) => [f.name, f.logoURL]))
const colorTipo = { Acciones: 'blue', Criptoactivos: 'neutralDark', ETFs: 'neutralLight', Fondos: 'neutralLight' } // R4Tag solo tiene reconstruidos blue, neutralDark y neutralLight
const fmtE = (v) => nf(2).format(v) + '\u2009€'

const navItems = ['Tu cuenta', 'Carteras gestionadas', 'Fondos y planes', 'Bolsas y derivados', 'Renta fija', 'Soluciones Easy', 'Análisis e ideas'].map((label, i) => ({ label, current: i === 0 })) // Figma: Menu Cliente=Logado con «Tu cuenta» activo y sin submenú

// Como en r4.com: separador de miles también en 4 cifras (1.558) y decimales según el valor (191,5 · 3,356 · 0,0817)
const nf = (d) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d, useGrouping: 'always' })
const fmt = (v) => (v === null || v === undefined ? '-' : nf(Math.abs(v) < 1 ? 4 : Math.abs(v) < 10 ? 3 : 2).format(v))
const fmtN = (v) => (v === null || v === undefined ? '-' : nf(0).format(v))
const signo = (v, s) => (v > 0 ? '+ ' : v < 0 ? '- ' : '') + s
const tono = (v) => (v > 0 ? 'success' : v < 0 ? 'error' : 'normal')

export default defineComponent({
  name: 'R4TableV2Prototipo',
  props: { variante: { type: String, default: 'a', validator: (v) => ['a', 'b'].includes(v) } }, // a = filtros y vistas en la misma fila · b = en filas distintas (con «N resultados»)
  components: { TemplateDetail, Menu, R4Wrapper, R4PageTitleSection, R4TableV2, R4Text, R4Button, R4Tag, ProductDefaultLogo, Facilitador },
  setup(props) {
    document.title = `R4Table (v2) - ${props.variante.toUpperCase()} · Prototipo R4`
    const caso = ref(valoresPorDefecto(FACILITADOR))
    const esc = computed(() => ESCENARIOS[caso.value.escenario])
    return { caso, esc, FACILITADOR, logoPorNombre, colorTipo, fmtE, breadcrumb: null, navItems, filas, vistas, fmt, fmtN, signo, tono, abs: Math.abs, nf }
  },
  template: `
    <TemplateDetail>
      <template #header><Menu type="default" client="logado" :nav-items="navItems" :sub-nav-items="[]" /></template>

      <R4Wrapper density="compact" layout="12"><R4PageTitleSection :title="esc.titulo" :breadcrumb="esc.breadcrumb" /></R4Wrapper>

      <R4Wrapper density="compact" layout="12">
        <R4TableV2 :key="caso.escenario" :layout="variante === 'b' ? 'stacked' : 'inline'" :views="esc.views" :data="esc.data" data-key="id" :aria-label="esc.aria" :footnote="esc.footnote">
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
          <template #body-fecha="{ value }"><R4Text :text="value" /></template>
          <template #body-valor="{ data }">
            <span class="r4tv2__nombre"><img v-if="logoPorNombre[data.valor]" class="r4tv2__logo" :src="logoPorNombre[data.valor]" alt="" /><ProductDefaultLogo v-else :name="data.valor" size="extraSmall" /><a class="r4tv2__link" href="#" @click.prevent>{{ data.valor }}</a></span>
          </template>
          <template #body-descripcion="{ value }"><R4Text :text="value" /></template>
          <template #body-tipo="{ value }"><R4Tag size="small" :color="colorTipo[value]" :text="value" /></template>
          <template #body-importe="{ value }"><R4Text :text="signo(value, fmtE(abs(value)))" :variant="tono(value)" /></template>
          <template #body-saldo="{ value }"><R4Text :text="fmtE(value)" /></template>
          <template #body-cantidad="{ value }"><R4Text :text="fmt(value)" /></template>
          <template #body-precio="{ value }"><R4Text :text="fmtE(value)" /></template>
          <template #body-comision="{ value }"><R4Text :text="fmtE(value)" /></template>
          <template #body-accion="{ data }"><R4Button type="text" size="medium" icon="ic-shopping-cart" :aria-label="'Comprar ' + data.name" /></template>
        </R4TableV2>
      </R4Wrapper>
      <template #overlay><Facilitador v-model:values="caso" :groups="FACILITADOR" /></template>
    </TemplateDetail>
  `,
})
