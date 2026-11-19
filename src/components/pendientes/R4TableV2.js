// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// R4Table (v2) — EVOLUTIVO en definición (Confluence PND «1. Objetivos - R4Table (v2)», 4064870412: «vistas y filtrar por columnas»; «2.1 Competencia», 4090494983: Airbnb y Booking.com). NO existe en Figma de Primitivos ni en la doc de API:
// la visual sale de Figma «Proyectos - Tablas» (frame 668:23386: Filters and View + R4Section con filas y columnas) y la interacción de la descripción de Jon (2026-11-19). La tabla es R4Table (Storybook de IT; Figma ↔ Storybook: manda Storybook).
// API provisional (propuesta, a validar con IT/PO): `views` ({ value, label, columns, filters, initial }[]), `data`, `dataKey`, `rows` (filas por página, 10), `ariaLabel`, `overlay` (selector de la capa de superposición de la Template donde se montan los R4Sheet).
//   Un filtro = { id, label, type: 'single' | 'multiple', icon?, highlighted?, options: { value, label }[], predicate(row, valoresSeleccionados) }. Los filtros son POR COLUMNA/vista. Slots `body-<field>` ({ data, value }) para las celdas que no son texto.
// Composición: «Filters and Views» (chips + R4SegmentedControls) + R4Section boxed blanca con R4Table. Los filtros destacados (`highlighted`) son R4Chip type=multiple con R4Popover debajo (a 8 px) en ≥ 1024 px y R4Sheet bottom por debajo
//   (patrón Progressive disclosure, Confluence 4016603138). «Todos los filtros» abre un R4Sheet (side en ≥ 1024, bottom por debajo) con R4Accordion: el primero lista los filtros aplicados en R4Chip `dismissable`; el resto, un grupo de R4InputCheckbox (multiselección)
//   o R4InputRadio type=default (selección única) por filtro. Nada se aplica hasta pulsar el primario «Ver N resultados» (N se actualiza en vivo); «Quitar filtros» vacía la selección del sheet (también sin aplicar).
//   Al aplicar (sheet o popover) un R4Spinner se superpone a la tabla (que pierde opacidad) y 1 s después se pinta con los nuevos resultados. Cambiar de vista recarga toda la capa (filtros + vistas + tabla) con el mismo spinner.
// Chip de categoría: sin selección = nombre de la categoría; con una = su texto; con varias = la primera + «+N». «Todos los filtros» lleva badge con el nº de filtros seleccionados (valores) y pasa a selected.
// Decisiones inferidas: «Limpiar» (popover) vacía la selección del popover y hay que pulsar «Aplicar» para aplicar (disabled si no hay nada); categorías con AND entre sí y OR dentro; el estado aplicado es por vista; el tiempo de recarga (1 s) es el pedido.
// Extras / NO oficial: R4Chip `dismissable`/`hideChevron`, R4Accordion `defaultOpen`, R4Table `sortable`/`defaultSort`/slot `empty` (ver cada archivo). Mobile y tablet: sin diseño; se adapta con el patrón de la doc (chips en una fila con scroll, sheets bottom).
import { defineComponent, ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import R4Chip from './R4Chip.js'
import R4SegmentedControls from './R4SegmentedControls.js'
import R4Section from './R4Section.js'
import R4Table from './R4Table.js'
import R4Text from './R4Text.js'
import R4Spinner from './R4Spinner.js'
import R4Popover from './R4Popover.js'
import R4Sheet from './R4Sheet.js'
import R4Accordion from './R4Accordion.js'
import R4InputCheckbox from './R4InputCheckbox.js'
import R4InputRadio from './R4InputRadio.js'
import R4Button from './R4Button.js'

const RECARGA_MS = 1000 // tiempo de recarga pedido por Jon

const pluralResultados = (n) => (n === 1 ? 'Ver 1 resultado' : `Ver ${n} resultados`)

// Contenido de una categoría de filtro (popover y sheet de categoría): título R4Text large strong + checkboxes o radios (+ botones en el popover)
const _TableFilterPanel = defineComponent({
  name: '_TableFilterPanel',
  components: { R4Text, R4InputCheckbox, R4InputRadio, R4Button },
  props: { filter: { type: Object, required: true }, modelValue: { type: Array, required: true }, showTitle: { type: Boolean, default: true }, showActions: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'apply', 'clear'],
  template: `
    <div class="r4-table-v2__panel">
      <R4Text v-if="showTitle" size="large" font-style="strong" tag="p" :text="filter.label" />
      <div class="r4-table-v2__options">
        <R4InputCheckbox v-if="filter.type === 'multiple'" :options="filter.options" :model-value="modelValue" :aria-label="filter.label" @update:model-value="$emit('update:modelValue', $event)" />
        <R4InputRadio v-else type="default" :options="filter.options" :selected-value="modelValue[0]" @change="$emit('update:modelValue', [$event])" />
      </div>
      <div v-if="showActions" class="r4-table-v2__panel-actions">
        <R4Button type="primary" size="medium" width="full-width" text="Aplicar" @click="$emit('apply')" />
        <R4Button type="text" size="medium" width="full-width" text="Limpiar" :disabled="!modelValue.length" @click="$emit('clear')" />
      </div>
    </div>
  `,
})

export default defineComponent({
  name: 'R4TableV2',
  components: { R4Chip, R4SegmentedControls, R4Section, R4Table, R4Text, R4Spinner, R4Popover, R4Sheet, R4Accordion, R4InputCheckbox, R4InputRadio, R4Button, TableFilterPanel: _TableFilterPanel },
  props: {
    views: { type: Array, required: true },
    data: { type: Array, required: true },
    dataKey: { type: String, required: true },
    rows: { type: Number, default: 10 },
    ariaLabel: { type: String, default: undefined },
    overlay: { type: String, default: '.template-detail__overlay > .r4-layout-modes' },
  },
  setup(props) {
    const vistaPorValor = (v) => props.views.find((x) => x.value === v) || props.views[0]
    const selectedView = ref(props.views[0].value) // lo que marca el control de vistas (inmediato)
    const contentView = ref(props.views[0].value) // lo que se ve (cambia al terminar la recarga)
    const view = computed(() => vistaPorValor(contentView.value))
    const aplicados = reactive(Object.fromEntries(props.views.map((v) => [v.value, { ...(v.initial || {}) }]))) // { vista: { filtroId: [valores] } }
    const actuales = computed(() => aplicados[contentView.value])
    const loading = ref(null) // null | 'table' | 'all'
    const target = ref(null) // capa de superposición (donde se montan los sheets)
    let timer = null

    const filtrar = (filters, sel) => props.data.filter((r) => filters.every((f) => !(sel[f.id] || []).length || f.predicate(r, sel[f.id])))
    const filasMostradas = ref(filtrar(view.value.filters, actuales.value)) // se actualiza al terminar la recarga
    const recargar = (scope, alTerminar) => {
      clearTimeout(timer)
      loading.value = scope
      timer = setTimeout(() => { alTerminar(); filasMostradas.value = filtrar(view.value.filters, actuales.value); loading.value = null }, RECARGA_MS)
    }
    onBeforeUnmount(() => clearTimeout(timer))

    // — Chips de categoría y popover —
    const seleccion = (f) => actuales.value[f.id] || []
    const etiquetas = (f, vals) => vals.map((v) => f.options.find((o) => o.value === v)?.label ?? v)
    const chipLabel = (f) => { const l = etiquetas(f, seleccion(f)); return !l.length ? f.label : l.length > 1 ? `${l[0]} +${l.length - 1}` : l[0] }
    const destacados = computed(() => view.value.filters.filter((f) => f.highlighted))
    const totalAplicados = computed(() => view.value.filters.reduce((n, f) => n + seleccion(f).length, 0))
    const catAbierta = ref(null) // id del filtro con popover/sheet abierto
    const catDraft = ref([])
    const abrirCategoria = (f) => { if (catAbierta.value === f.id) { catAbierta.value = null; return } sheetOpen.value = false; catAbierta.value = f.id; catDraft.value = [...seleccion(f)] }
    const filtroAbierto = computed(() => view.value.filters.find((f) => f.id === catAbierta.value))
    const cerrarCategoria = () => { catAbierta.value = null }
    const aplicarCategoria = (f) => {
      aplicados[contentView.value] = { ...actuales.value, [f.id]: [...catDraft.value] }
      cerrarCategoria()
      recargar('table', () => {})
    }

    // — Sheet «Todos los filtros» —
    const sheetOpen = ref(false)
    const draft = reactive({}) // { filtroId: [valores] } (sin aplicar)
    const abrirSheet = () => { cerrarCategoria(); view.value.filters.forEach((f) => { draft[f.id] = [...seleccion(f)] }); sheetOpen.value = true }
    const cerrarSheet = () => { sheetOpen.value = false }
    const draftTotal = computed(() => view.value.filters.reduce((n, f) => n + (draft[f.id] || []).length, 0))
    const chipsDraft = computed(() => view.value.filters.flatMap((f) => (draft[f.id] || []).map((v) => ({ filtro: f.id, value: v, label: etiquetas(f, [v])[0] }))))
    const nResultados = computed(() => (sheetOpen.value ? filtrar(view.value.filters, draft).length : filasMostradas.value.length))
    const primaria = computed(() => pluralResultados(nResultados.value))
    const quitarChip = (c) => { draft[c.filtro] = draft[c.filtro].filter((v) => v !== c.value); nextTick(() => (document.querySelector('.r4-table-v2__applied .r4-chip') || document.querySelector('.r4-table-v2__applied'))?.focus?.()) }
    const quitarFiltros = () => { view.value.filters.forEach((f) => { draft[f.id] = [] }) }
    const aplicarSheet = () => {
      aplicados[contentView.value] = Object.fromEntries(view.value.filters.map((f) => [f.id, [...(draft[f.id] || [])]]))
      cerrarSheet()
      recargar('table', () => {})
    }
    const accordionItems = computed(() => [{ title: 'Filtros seleccionados' }, ...view.value.filters.map((f) => ({ title: f.label, filter: f }))])

    // — Vistas —
    const itemsVistas = computed(() => props.views.map((v) => ({ label: v.label, value: v.value })))
    const cambiarVista = (v) => { selectedView.value = v; cerrarCategoria(); cerrarSheet(); recargar('all', () => { contentView.value = v }) }

    // Cierre del popover: clic fuera y Escape
    const onDocClick = (e) => { if (catAbierta.value && !e.target.closest('.r4-table-v2__anchor, .r4-sheet-layer')) cerrarCategoria() }
    const onKey = (e) => { if (e.key === 'Escape') cerrarCategoria() }
    onMounted(() => { target.value = document.querySelector(props.overlay); document.addEventListener('click', onDocClick); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey) })
    watch(contentView, () => {}, { flush: 'post' })

    const estado = computed(() => (loading.value ? 'Cargando resultados' : `${filasMostradas.value.length} resultados`))
    return { selectedView, contentView, view, loading, target, filasMostradas, seleccion, chipLabel, destacados, totalAplicados, catAbierta, catDraft, abrirCategoria, filtroAbierto, cerrarCategoria, aplicarCategoria,
      sheetOpen, draft, abrirSheet, cerrarSheet, draftTotal, chipsDraft, primaria, quitarChip, quitarFiltros, aplicarSheet, accordionItems, itemsVistas, cambiarVista, estado }
  },
  template: `
    <div class="r4-table-v2" :aria-busy="loading ? 'true' : undefined">
      <div class="r4-table-v2__bar" :class="{ 'is-loading': loading === 'all' }" :inert="loading === 'all'">
        <div class="r4-table-v2__filters" role="group" aria-label="Filtros de la tabla">
          <div class="r4-table-v2__all">
            <R4Chip type="multiple" hide-chevron icon="ic-sliders-h" label="Todos los filtros" :selected="totalAplicados > 0" :badge="totalAplicados || undefined" :badge-aria-label="totalAplicados + ' filtros aplicados'"
                    aria-haspopup="dialog" @click="abrirSheet" />
          </div>
          <div class="r4-table-v2__highlighted">
            <div v-for="f in destacados" :key="f.id" class="r4-table-v2__anchor">
              <R4Chip type="multiple" :icon="f.icon" :label="chipLabel(f)" :selected="seleccion(f).length > 0" :expanded="catAbierta === f.id" aria-haspopup="dialog" @click="abrirCategoria(f)" />
              <div v-if="catAbierta === f.id" class="r4-table-v2__popover" role="dialog" :aria-label="f.label">
                <R4Popover width="default">
                  <TableFilterPanel :filter="f" v-model="catDraft" @apply="aplicarCategoria(f)" @clear="catDraft = []" />
                </R4Popover>
              </div>
            </div>
          </div>
        </div>
        <R4SegmentedControls class="r4-table-v2__views" size="medium" aria-label="Vistas de la tabla" :items="itemsVistas" :selected-value="selectedView" @select="cambiarVista" />
      </div>

      <div class="r4-table-v2__table" :class="{ 'is-loading': loading }" :inert="!!loading">
        <R4Section appearance="boxed" background-color="white">
          <R4Table :key="contentView" :data="filasMostradas" :columns="view.columns" :data-key="dataKey" paginator :rows="rows" :aria-label="ariaLabel"
                   :default-sort="view.defaultSort">
            <template v-for="c in view.columns" #[\`body-\${c.field}\`]="slotProps">
              <slot :name="'body-' + c.field" v-bind="slotProps"><R4Text :text="c.format ? c.format(slotProps.value, slotProps.data) : (slotProps.value ?? '')" /></slot>
            </template>
          </R4Table>
        </R4Section>
      </div>
      <div v-if="loading" class="r4-table-v2__spinner" :class="'is-' + loading"><R4Spinner size="medium" /></div>
      <p class="r4-table-v2__sr" role="status" aria-live="polite">{{ estado }}</p>

      <Teleport v-if="target" :to="target">
        <R4Sheet v-for="pos in ['side', 'bottom']" :key="pos" class="r4-table-v2__sheet" :class="'r4-table-v2__sheet--' + pos" :position="pos" title="Todos los filtros" :open="sheetOpen"
                 :primary-action-label="primaria" secondary-action-label="Quitar filtros" @primary="aplicarSheet" @secondary="quitarFiltros" @close="cerrarSheet">
          <R4Accordion :items="accordionItems" multiple :default-open="[0]">
            <template #content="{ item, index }">
              <div v-if="index === 0" class="r4-table-v2__applied" tabindex="-1">
                <R4Chip v-for="c in chipsDraft" :key="c.filtro + c.value" size="small" :label="c.label" dismissable @dismiss="quitarChip(c)" />
                <R4Text v-if="!chipsDraft.length" variant="paragraph" text="No hay filtros seleccionados" />
              </div>
              <TableFilterPanel v-else :filter="item.filter" :show-title="false" :show-actions="false" :model-value="draft[item.filter.id] || []" @update:model-value="draft[item.filter.id] = $event" />
            </template>
          </R4Accordion>
        </R4Sheet>
        <R4Sheet v-if="filtroAbierto" class="r4-table-v2__sheet r4-table-v2__sheet--category" position="bottom" :title="filtroAbierto.label" :open="true" @close="cerrarCategoria">
          <TableFilterPanel :filter="filtroAbierto" :show-title="false" v-model="catDraft" @apply="aplicarCategoria(filtroAbierto)" @clear="catDraft = []" />
        </R4Sheet>
      </Teleport>
    </div>
  `,
})
