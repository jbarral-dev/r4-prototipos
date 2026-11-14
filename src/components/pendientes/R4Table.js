// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de R4Table (catálogo: VUE+AEM) a partir del Storybook de IT (https://storybook-dev.renta4.es, R4Table v1.0.3, Primitivos 1.2; lo observado: props, medidas y paginador) y de la página de Confluence (R4Table,
// 3001581575, de mar 2026 y con dos APIs que se contradicen: se ha seguido la del Vue/Storybook). NO se ha releído en Figma (conector sin respuesta).
// Props reconstruidas (nombres del Storybook): data (Record[]), columns ({ field, header, align?: 'left' | 'right', frozen? }[]), dataKey (campo único de cada fila), size (small | medium | large; por defecto medium),
// paginator (boolean) + rows (filas por página; 10 por defecto aquí), showHeader (por defecto true), hideLastRowBorder, ariaLabel (extra: nombre accesible de la tabla). Slots por columna `body-<field>` ({ data, value }): el contenido
// de la celda (enlaces, tags, botones…); sin slot, se pinta el valor como texto (R4Text). Columna `frozen`: queda fija a la izquierda al hacer scroll horizontal (así se resuelve mobile, como pide la doc: «en Mobile frozen column»).
// Medidas (Storybook): padding de celda 8 / 12 / 16 según size; cabecera con borde inferior negro de 1 px y texto bold; filas con borde inferior de 1 px (border/subtle) y fondo surface/subtle al pasar el ratón (Confluence);
// paginador centrado con botones circulares de 40 y gap 4, la página actual con fondo gris (Storybook: 0 8/16 de padding).
// NO reconstruido: stickyHeader, expandableOn y filas expandibles (nested/children), loading (esqueleto), orden de columnas (sortable), filtros, vistas, agrupaciones y los tipos de columna de Confluence (link, tag, button… se hacen por slot).
// Extras del prototipo: ariaLabel y el paginador propio (`<nav>` con botones; el del Storybook es el de PrimeVue). El icono «siguiente» es el chevron izquierdo girado (no hay chevron derecho registrado).
import { defineComponent, ref, computed, watch } from '../../../vendor/vue.esm-browser.prod.js'
import R4Text from './R4Text.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4Table',
  components: { R4Text, Icon },
  props: {
    data: { type: Array, required: true },
    columns: { type: Array, required: true },
    dataKey: { type: String, required: true },
    size: { type: String, default: 'medium', validator: (v) => ['small', 'medium', 'large'].includes(v) },
    paginator: { type: Boolean, default: false },
    rows: { type: Number, default: 10 },
    showHeader: { type: Boolean, default: true },
    hideLastRowBorder: { type: Boolean, default: false },
    ariaLabel: { type: String, default: undefined },
  },
  setup(props) {
    const page = ref(1)
    const pageCount = computed(() => (props.paginator ? Math.max(1, Math.ceil(props.data.length / props.rows)) : 1))
    const visibles = computed(() => (props.paginator ? props.data.slice((page.value - 1) * props.rows, page.value * props.rows) : props.data))
    // Ventana de 5 páginas alrededor de la actual (como pageLinkSize=5 de PrimeVue)
    const paginas = computed(() => {
      const total = pageCount.value
      const ini = Math.max(1, Math.min(page.value - 2, total - 4))
      return Array.from({ length: Math.min(5, total) }, (_, i) => ini + i)
    })
    const ir = (n) => { page.value = Math.min(pageCount.value, Math.max(1, n)) }
    watch(() => props.data, () => { page.value = 1 }) // al cambiar los datos (p. ej. otro filtro) se vuelve a la primera página
    return { page, pageCount, visibles, paginas, ir }
  },
  template: `
    <div class="r4-table" :class="['r4-table--' + size, { 'r4-table--hide-last-border': hideLastRowBorder }]">
      <div class="r4-table__scroll" role="region" tabindex="0" :aria-label="ariaLabel">
        <table class="r4-table__table">
          <thead v-if="showHeader">
            <tr>
              <th v-for="c in columns" :key="c.field" scope="col" class="r4-table__th" :class="['r4-table__cell--' + (c.align || 'left'), { 'r4-table__frozen': c.frozen }]">{{ c.header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in visibles" :key="row[dataKey]" class="r4-table__row">
              <td v-for="c in columns" :key="c.field" class="r4-table__td" :class="['r4-table__cell--' + (c.align || 'left'), { 'r4-table__frozen': c.frozen }]">
                <slot :name="'body-' + c.field" :data="row" :value="row[c.field]"><R4Text :text="row[c.field] === undefined || row[c.field] === null ? '' : String(row[c.field])" /></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav v-if="paginator && pageCount > 1" class="r4-table__paginator" aria-label="Paginación">
        <button type="button" class="r4-table__page" aria-label="Página anterior" :disabled="page === 1" @click="ir(page - 1)"><Icon name="chevron-left" /></button>
        <button v-for="p in paginas" :key="p" type="button" class="r4-table__page" :class="{ 'is-current': p === page }" :aria-label="'Página ' + p" :aria-current="p === page ? 'page' : undefined" @click="ir(p)">{{ p }}</button>
        <button type="button" class="r4-table__page r4-table__page--next" aria-label="Página siguiente" :disabled="page === pageCount" @click="ir(page + 1)"><Icon name="chevron-left" /></button>
      </nav>
    </div>
  `,
})
