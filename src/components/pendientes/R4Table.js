// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de R4Table (catálogo: VUE+AEM) a partir del Storybook de IT (https://storybook-dev.renta4.es, R4Table v1.0.3, Primitivos 1.2; lo observado: props, medidas y paginador) y de la página de Confluence (R4Table,
// 3001581575, de mar 2026 y con dos APIs que se contradicen: se ha seguido la del Vue/Storybook). NO se ha releído en Figma (conector sin respuesta).
// Props reconstruidas (nombres del Storybook): data (Record[]), columns ({ field, header, align?: 'left' | 'right', frozen? }[]), dataKey (campo único de cada fila), size (small | medium | large; por defecto medium),
// paginator (boolean) + rows (filas por página; 10 por defecto aquí), showHeader (por defecto true), hideLastRowBorder, ariaLabel (extra: nombre accesible de la tabla). Slots por columna `body-<field>` ({ data, value }): el contenido
// de la celda (enlaces, tags, botones…); sin slot, se pinta el valor como texto (R4Text). Columna `frozen`: queda fija a la izquierda al hacer scroll horizontal (así se resuelve mobile, como pide la doc: «en Mobile frozen column»).
// Medidas (Storybook): padding de celda 8 / 12 / 16 según size; cabecera con borde inferior negro de 1 px y texto bold; filas con borde inferior de 1 px (border/subtle) y fondo surface/subtle al pasar el ratón (Confluence);
// paginador centrado con botones circulares de 40 y gap 4, la página actual con fondo gris (Storybook: 0 8/16 de padding).
// Extra: `width` por columna (porcentaje): fija el ancho de las columnas (table-layout: fixed) para que no cambie con el contenido al filtrar o paginar; con anchos fijos la tabla tiene un ancho mínimo y en mobile hace scroll horizontal.
// Extra: `srHeader` (texto oculto visualmente para una columna sin título visible, p. ej. una columna de botones: mantiene el nombre accesible de la columna).
// R4Table v2 (prototipo «R4Table (v2)»): `sortable` por columna (API del Vue en Confluence 3001581575): botón en la cabecera con el icono «Icon Arrow» de Figma (Proyectos - Tablas): doble flecha sin ordenar, flecha abajo = ascendente y arriba = descendente (así lo pinta Figma;
// la Confluence dice lo contrario —asc = arriba—: discrepancia a validar); a la izquierda del texto en columnas alineadas a la derecha. Orden en cliente; clic: asc → desc → sin orden. Extras: `defaultSort` ({ field, order }), evento `sort-change` ({ field, order }; lo usa R4TableV2 para conservar el orden al cambiar de vista) y slot `empty`
// (filas vacías: «No hay resultados»; en Storybook no se ha podido comprobar el comportamiento sin datos). aria-sort en la cabecera.
// `loading` (Storybook: vídeo de Jon): la cabecera se mantiene y las filas pasan a R4Skeleton: `rows` filas con una barra por celda a todo el ancho de la celda (alto = línea de texto, 24; esquinas redondeadas) en todas las columnas; sin paginador, con aria-busy y texto oculto «Cargando contenido».
// NO reconstruido: stickyHeader, expandableOn y filas expandibles (nested/children), loading (esqueleto), orden de columnas (sortable), filtros, vistas, agrupaciones y los tipos de columna de Confluence (link, tag, button… se hacen por slot).
// Extras del prototipo: ariaLabel y el paginador propio (`<nav>` con botones; el del Storybook es el de PrimeVue). El icono «siguiente» es el chevron izquierdo girado (no hay chevron derecho registrado).
import { defineComponent, ref, computed, watch } from '../../../vendor/vue.esm-browser.prod.js'
import R4Text from './R4Text.js'
import R4Skeleton from './R4Skeleton.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4Table',
  components: { R4Text, R4Skeleton, Icon },
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
    defaultSort: { type: Object, default: undefined },
    loading: { type: Boolean, default: false }, // Storybook (R4Table › Loading, grabación de Jon 2026-11-24): «se muestra un skeleton con el número de filas definido en `rows`; respeta la configuración de columnas, mostrando el mismo nº de celdas por fila»
  },
  emits: ['sort-change'],
  setup(props, { emit }) {
    const page = ref(1)
    const sort = ref(props.defaultSort ? { ...props.defaultSort } : { field: null, order: null })
    const sorted = computed(() => {
      const { field, order } = sort.value
      if (!field || !order) return props.data
      const dir = order === 'asc' ? 1 : -1
      return [...props.data].sort((a, b) => {
        const x = a[field], y = b[field]
        if (x === y) return 0
        if (x === undefined || x === null) return 1
        if (y === undefined || y === null) return -1
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es', { numeric: true })) * dir
      })
    })
    const toggleSort = (field) => {
      const s = sort.value
      sort.value = s.field !== field ? { field, order: 'asc' } : s.order === 'asc' ? { field, order: 'desc' } : { field: null, order: null }
    }
    const sortIcon = (field) => (sort.value.field === field ? 'icon-arrow' : 'icon-arrow--unsorted')
    const ariaSort = (c) => (!c.sortable ? undefined : sort.value.field === c.field ? (sort.value.order === 'asc' ? 'ascending' : 'descending') : 'none')
    const pageCount = computed(() => (props.paginator ? Math.max(1, Math.ceil(sorted.value.length / props.rows)) : 1))
    const visibles = computed(() => (props.paginator ? sorted.value.slice((page.value - 1) * props.rows, page.value * props.rows) : sorted.value))
    // Ventana de 5 páginas alrededor de la actual (como pageLinkSize=5 de PrimeVue)
    const paginas = computed(() => {
      const total = pageCount.value
      const ini = Math.max(1, Math.min(page.value - 2, total - 4))
      return Array.from({ length: Math.min(5, total) }, (_, i) => ini + i)
    })
    const ir = (n) => { page.value = Math.min(pageCount.value, Math.max(1, n)) }
    watch(() => props.data, () => { page.value = 1 })
    watch(sort, (s) => { page.value = 1; emit('sort-change', { ...s }) }) // al cambiar los datos (p. ej. otro filtro) se vuelve a la primera página
    const filasSkeleton = computed(() => Array.from({ length: props.rows }, (_, i) => i))
    return { filasSkeleton, page, pageCount, visibles, paginas, ir, sort, toggleSort, sortIcon, ariaSort }
  },
  template: `
    <div class="r4-table" :class="['r4-table--' + size, { 'r4-table--hide-last-border': hideLastRowBorder, 'r4-table--has-sort': columns.some((c) => c.sortable) }]">
      <div class="r4-table__scroll" role="region" tabindex="0" :aria-label="ariaLabel" :aria-busy="loading ? 'true' : undefined">
        <table class="r4-table__table" :class="{ 'r4-table__table--fixed': columns.some((c) => c.width) }">
          <colgroup v-if="columns.some((c) => c.width)"><col v-for="c in columns" :key="c.field" :style="{ width: c.width }" /></colgroup>
          <thead v-if="showHeader">
            <tr>
              <th v-for="c in columns" :key="c.field" scope="col" class="r4-table__th" :class="['r4-table__cell--' + (c.align || 'left'), { 'r4-table__frozen': c.frozen }]" :aria-sort="ariaSort(c)">
                <button v-if="c.sortable" type="button" class="r4-table__sort" :class="'r4-table__sort--' + (c.align || 'left')" @click="toggleSort(c.field)">
                  <span>{{ c.header }}</span><Icon class="r4-table__sort-icon" :class="{ 'is-desc': sort.field === c.field && sort.order === 'desc' }" :name="sortIcon(c.field)" />
                </button>
                <template v-else>{{ c.header }}<span v-if="!c.header && c.srHeader" class="r4-table__sr">{{ c.srHeader }}</span></template>
              </th>
            </tr>
          </thead>
          <tbody v-if="loading">
            <tr v-for="i in filasSkeleton" :key="'sk' + i" class="r4-table__row r4-table__row--skeleton">
              <td v-for="c in columns" :key="c.field" class="r4-table__td" :class="['r4-table__cell--' + (c.align || 'left'), { 'r4-table__frozen': c.frozen }]">
                <span class="r4-table__skeleton-cell"><R4Skeleton shape="paragraph" width="100%" height="100%" /></span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-if="!visibles.length" class="r4-table__row r4-table__row--empty"><td class="r4-table__td r4-table__empty" :colspan="columns.length"><slot name="empty"><R4Text text="No hay resultados" /></slot></td></tr>
            <tr v-for="row in visibles" :key="row[dataKey]" class="r4-table__row">
              <td v-for="c in columns" :key="c.field" class="r4-table__td" :class="['r4-table__cell--' + (c.align || 'left'), { 'r4-table__frozen': c.frozen }]">
                <slot :name="'body-' + c.field" :data="row" :value="row[c.field]"><R4Text :text="row[c.field] === undefined || row[c.field] === null ? '' : String(row[c.field])" /></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="loading" class="r4-table__sr" role="status">Cargando contenido</p>
      <nav v-if="paginator && pageCount > 1 && !loading" class="r4-table__paginator" aria-label="Paginación">
        <button type="button" class="r4-table__page" aria-label="Página anterior" :disabled="page === 1" @click="ir(page - 1)"><Icon name="chevron-left" /></button>
        <button v-for="p in paginas" :key="p" type="button" class="r4-table__page" :class="{ 'is-current': p === page }" :aria-label="'Página ' + p" :aria-current="p === page ? 'page' : undefined" @click="ir(p)">{{ p }}</button>
        <button type="button" class="r4-table__page r4-table__page--next" aria-label="Página siguiente" :disabled="page === pageCount" @click="ir(page + 1)"><Icon name="chevron-left" /></button>
      </nav>
    </div>
  `,
})
