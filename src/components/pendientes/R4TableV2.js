// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// R4Table (v2) — EVOLUTIVO en definición (Confluence PND «1. Objetivos - R4Table (v2)», 4064870412: «vistas y filtrar por columnas»; «2.1 Competencia», 4090494983: Airbnb y Booking.com). NO existe en Figma de Primitivos ni en la doc de API:
// la visual sale de Figma «Proyectos - Tablas» (frame 668:23386: Filters and View + R4Section con filas y columnas) y la interacción de la descripción de Jon (2026-11-19). La tabla es R4Table (Storybook de IT; Figma ↔ Storybook: manda Storybook).
// API provisional (propuesta, a validar con IT/PO): `views` ({ value, label, columns, filters, initial }[]), `data`, `dataKey`, `rows` (filas por página, 25), `ariaLabel`, `overlay` (selector de la capa de superposición de la Template donde se montan los R4Sheet).
//   Un filtro = { id, label, type: 'single' | 'multiple', icon?, highlighted?, options: { value, label }[], predicate(row, valoresSeleccionados) }. Los filtros son POR COLUMNA/vista. Slots `body-<field>` ({ data, value }) para las celdas que no son texto.
// Composición: «Filters and Views» (chips + R4SegmentedControls) + R4Section boxed blanca con R4Table. Los filtros destacados (`highlighted`) son R4Chip type=multiple con R4Popover debajo (a 8 px) en ≥ 1024 px y R4Sheet bottom por debajo
//   (patrón Progressive disclosure, Confluence 4016603138). «Todos los filtros» abre un R4Sheet (side en ≥ 1024, bottom por debajo) con R4Accordion: el primero lista los filtros aplicados en R4Chip `dismissable`; el resto, un grupo de R4InputCheckbox (multiselección)
//   o R4InputRadio type=default (selección única) por filtro. Nada se aplica hasta pulsar el primario «Ver N resultados» (N se actualiza en vivo); «Quitar filtros» vacía la selección del sheet (también sin aplicar).
//   Al aplicar (sheet o popover) la tabla muestra R4Skeleton (Jon, 2026-11-24; antes R4Spinner con opacidad) y 1 s después se pinta con los nuevos resultados. Cambiar de vista es instantáneo (sin spinner): cambian a la vez las columnas y los filtros.
// Variante B (`layout="stacked"`): los filtros ocupan una fila (en tablet y mobile con scroll horizontal; sus categorías se abren en bottom sheet) y, 16 px debajo, «N resultados» (nº total de filas) a la izquierda y las vistas a la derecha.
// Tablet y mobile (≤ 1023 px; Jon, 2026-11-24; el chip de la vista es size small): filtros y vistas en una línea: «Filtros» (R4Chip con icono y badge) a la izquierda y la vista actual (R4Chip multiple) a la derecha, que abre un R4Sheet bottom con las vistas (R4InputRadio). Los filtros destacados de la fila ancha solo se alcanzan desde «Filtros».
// Cada opción de filtro lleva entre paréntesis su nº de resultados (también las que dan 0). El título de cada acordeón lleva su nº (opciones de la categoría; en «Filtros seleccionados», los filtros activos) en una R4Tag small blue (Jon, 2026-11-24; antes neutralLight).
// Acordeones del sheet: size small en todos los anchos (desktop incluido, Jon 2026-11-23); «Filtros seleccionados» solo aparece si hay filtros activos; abiertos los filtros destacados y cerrados el resto; el botón primario muestra un spinner de 800 ms cada vez que cambia N.
// El orden de columna (R4Table `sortable`) se conserva al cambiar de vista: si la columna ordenada existe en la nueva vista (p. ej. Nombre), sigue ordenada igual.
// Chip de categoría: sin selección = nombre de la categoría; con una = su texto; con varias = la primera + «+N». «Todos los filtros» lleva badge con el nº de filtros seleccionados (valores) y pasa a selected.
// Decisiones inferidas: «Limpiar» (popover) vacía la selección del popover y hay que pulsar «Aplicar» para aplicar (disabled si no hay nada); categorías con AND entre sí y OR dentro; el estado aplicado es por vista; el tiempo de recarga (1 s) es el pedido.
// Filtros de selección única (R4InputRadio): nunca se pueden limpiar (sin botón «Limpiar» en el popover); si el filtro es `required` (Fecha) siempre hay uno marcado y no cuenta como filtro aplicado.
// Extras / NO oficial: R4Chip `dismissable`/`hideChevron`, R4Accordion `defaultOpen`, R4Table `sortable`/`defaultSort`/slot `empty` (ver cada archivo). Mobile y tablet: sin diseño; se adapta con el patrón de la doc (chips en una fila con scroll, sheets bottom).
import { defineComponent, ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import R4Chip from './R4Chip.js'
import R4SegmentedControls from './R4SegmentedControls.js'
import R4Section from './R4Section.js'
import R4Table from './R4Table.js'
import R4Text from './R4Text.js'
import R4Popover from './R4Popover.js'
import R4Sheet from './R4Sheet.js'
import R4Accordion from './R4Accordion.js'
import R4InputCheckbox from './R4InputCheckbox.js'
import R4InputRadio from './R4InputRadio.js'
import R4Button from './R4Button.js'
import R4Tag from './R4Tag.js'

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
        <R4Button v-if="filter.type !== 'single'" type="text" size="medium" width="full-width" text="Limpiar" :disabled="!modelValue.length" @click="$emit('clear')" />
      </div>
    </div>
  `,
})

export default defineComponent({
  name: 'R4TableV2',
  components: { R4Chip, R4SegmentedControls, R4Section, R4Table, R4Text, R4Popover, R4Sheet, R4Accordion, R4InputCheckbox, R4InputRadio, R4Button, R4Tag, TableFilterPanel: _TableFilterPanel },
  props: {
    views: { type: Array, required: true },
    data: { type: Array, required: true },
    dataKey: { type: String, required: true },
    rows: { type: Number, default: 25 },
    ariaLabel: { type: String, default: undefined },
    footnote: { type: String, default: undefined }, // (se oculta cuando la tabla no tiene resultados) nota al pie bajo la tabla (R4Table v1.1.0 de Confluence: «Footnote»); extra aquí: se pinta con R4Text small
    layout: { type: String, default: 'inline', validator: (v) => ['inline', 'stacked'].includes(v) }, // inline (A): filtros y vistas en la misma fila · stacked (B): filtros en una fila y, 16 px debajo, «N resultados» + vistas
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
    const orden = ref(props.views[0].defaultSort ? { ...props.views[0].defaultSort } : { field: null, order: null }) // el orden elegido se conserva al cambiar de vista
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

    // — Opciones con resultados —
    // Cada opción lleva entre paréntesis las filas que devuelve (con el resto de categorías ya seleccionadas en `sel`). Se muestran TODAS, también las que dan (0) (Jon, 2026-11-25; el 2026-11-24 se ocultaban)
    const conteoOpcion = (f, o, sel) => {
      const otros = view.value.filters.filter((x) => x.id !== f.id && (sel[x.id] || []).length)
      return props.data.filter((r) => otros.every((x) => x.predicate(r, sel[x.id])) && f.predicate(r, [o.value])).length
    }
    const opcionesDe = (f, sel) => ({ ...f, options: f.options.map((o) => ({ value: o.value, label: `${o.label} (${conteoOpcion(f, o, sel)})`, n: conteoOpcion(f, o, sel) })) })
    const opcionesCategoria = (f) => opcionesDe(f, { ...actuales.value, [f.id]: catDraft.value }) // popover / sheet de una categoría
    const opcionesSheet = (f) => opcionesDe(f, draft) // sheet «Todos los filtros»

    // — Chips de categoría y popover —
    const seleccion = (f) => actuales.value[f.id] || []
    const etiquetas = (f, vals) => vals.map((v) => f.options.find((o) => o.value === v)?.label ?? v)
    const chipLabel = (f) => { const l = etiquetas(f, seleccion(f)); return !l.length ? f.label : l.length > 1 ? `${l[0]} +${l.length - 1}` : l[0] }
    const destacados = computed(() => view.value.filters.filter((f) => f.highlighted))
    // Los filtros `required` (selección única que siempre tiene uno marcado, p. ej. Fecha) no cuentan como «filtro aplicado»: ni en el badge, ni en «Filtros seleccionados», ni se pueden quitar (Quitar filtros los devuelve a su valor inicial)
    const totalAplicados = computed(() => view.value.filters.filter((f) => !f.required).reduce((n, f) => n + seleccion(f).length, 0))
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
    const draftTotal = computed(() => view.value.filters.filter((f) => !f.required).reduce((n, f) => n + (draft[f.id] || []).length, 0))
    const chipsDraft = computed(() => view.value.filters.filter((f) => !f.required).flatMap((f) => (draft[f.id] || []).map((v) => ({ filtro: f.id, value: v, label: etiquetas(f, [v])[0] }))))
    const nResultados = computed(() => (sheetOpen.value ? filtrar(view.value.filters, draft).length : filasMostradas.value.length))
    const primaria = computed(() => pluralResultados(nResultados.value))
    const quitarChip = (c) => { draft[c.filtro] = draft[c.filtro].filter((v) => v !== c.value); nextTick(() => { // el foco no se pierde: siguiente chip o, si ya no quedan, la cabecera del primer acordeón (solo entre los elementos visibles; hay un sheet por posición)
        const visible = (s) => [...document.querySelectorAll(s)].find((e) => e.getClientRects().length)
        ;(visible('.r4-table-v2__applied .r4-chip') || visible('.r4-sheet .r4-accordion__header'))?.focus?.()
      }) }
    const quitarFiltros = () => { view.value.filters.forEach((f) => { draft[f.id] = f.required ? [...((view.value.initial || {})[f.id] || [])] : [] }) }
    const aplicarSheet = () => {
      aplicados[contentView.value] = Object.fromEntries(view.value.filters.map((f) => [f.id, [...(draft[f.id] || [])]]))
      cerrarSheet()
      recargar('table', () => {})
    }
    // Acordeones del sheet: «Filtros seleccionados» solo existe si hay algún filtro activo (en la selección del sheet, en vivo); abiertos los filtros que se ven sobre la tabla (destacados) y cerrados los demás
    // El nº (de filtros seleccionados o de opciones de la categoría) va en una R4Tag small en el slot `title` del acordeón
    const accordionItems = computed(() => [
      ...(draftTotal.value ? [{ id: 'aplicados', title: 'Filtros seleccionados', count: draftTotal.value }] : []),
      ...view.value.filters.map((f) => ({ id: f.id, title: f.label, count: opcionesSheet(f).options.length, filter: f })),
    ])
    const abiertos = computed(() => ['aplicados', ...view.value.filters.filter((f) => f.highlighted).map((f) => f.id)])
    // «Ver N resultados»: al cambiar N con el sheet abierto, spinner de 800 ms en el botón
    const contando = ref(false)
    let timerContar = null
    watch(() => (sheetOpen.value ? filtrar(view.value.filters, draft).length : null), (n, antes) => {
      if (n === null || antes === null || antes === undefined) return
      contando.value = true; clearTimeout(timerContar); timerContar = setTimeout(() => { contando.value = false }, 800)
    })
    onBeforeUnmount(() => clearTimeout(timerContar))

    // — Vistas —
    const vistaOpen = ref(false)
    const vistaActual = computed(() => vistaPorValor(selectedView.value))
    const itemsVistas = computed(() => props.views.map((v) => ({ label: v.label, value: v.value })))
    // El cambio de vista es instantáneo (Jon, 2026-11-23): sin spinner ni recarga; solo al aplicar filtros hay recarga de 1 s
    const cambiarVista = (v) => {
      clearTimeout(timer); loading.value = null
      selectedView.value = v; contentView.value = v; cerrarCategoria(); cerrarSheet()
      filasMostradas.value = filtrar(view.value.filters, actuales.value)
    }

    // Cierre del popover: clic fuera y Escape
    const onDocClick = (e) => { if (catAbierta.value && !e.target.closest('.r4-table-v2__anchor, .r4-sheet-layer')) cerrarCategoria() }
    const onKey = (e) => { if (e.key === 'Escape') cerrarCategoria() }
    onMounted(() => { target.value = document.querySelector(props.overlay); document.addEventListener('click', onDocClick); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey) })
    watch(contentView, () => {}, { flush: 'post' })

    const estado = computed(() => (loading.value ? 'Cargando resultados' : `${filasMostradas.value.length} resultados`))
    return { selectedView, contentView, view, loading, target, filasMostradas, seleccion, chipLabel, destacados, totalAplicados, catAbierta, catDraft, abrirCategoria, filtroAbierto, cerrarCategoria, aplicarCategoria,
      opcionesCategoria, opcionesSheet, contando, abiertos, vistaOpen, vistaActual, orden, sheetOpen, draft, abrirSheet, cerrarSheet, draftTotal, chipsDraft, primaria, quitarChip, quitarFiltros, aplicarSheet, accordionItems, itemsVistas, cambiarVista, estado }
  },
  template: `
    <div class="r4-table-v2" :class="'r4-table-v2--' + layout" :aria-busy="loading ? 'true' : undefined">
      <!-- Variante B (stacked): fila de filtros y, debajo (16 px), «N resultados» a la izquierda y las vistas a la derecha (R4SegmentedControls en desktop; R4Chip multiple en tablet y mobile) -->
      <div v-if="layout === 'stacked'" class="r4-table-v2__toolbar">
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
                  <TableFilterPanel :filter="opcionesCategoria(f)" v-model="catDraft" @apply="aplicarCategoria(f)" @clear="catDraft = []" />
                </R4Popover>
              </div>
            </div>
          </div>
        </div>
        <div class="r4-table-v2__meta">
          <R4Text class="r4-table-v2__count" aria-hidden="true" :text="filasMostradas.length === 1 ? '1 resultado' : filasMostradas.length + ' resultados'" />
          <R4SegmentedControls class="r4-table-v2__views r4-table-v2__views--segmented" size="medium" aria-label="Vistas de la tabla" :items="itemsVistas" :selected-value="selectedView" @select="cambiarVista" />
          <R4Chip class="r4-table-v2__views-chip" type="multiple" size="small" :label="vistaActual.label" selected :expanded="vistaOpen" aria-haspopup="dialog" @click="vistaOpen = true" />
        </div>
      </div>

      <template v-else>
      <div class="r4-table-v2__bar r4-table-v2__bar--wide" :class="{ 'is-loading': loading === 'all' }" :inert="loading === 'all'">
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
                  <TableFilterPanel :filter="opcionesCategoria(f)" v-model="catDraft" @apply="aplicarCategoria(f)" @clear="catDraft = []" />
                </R4Popover>
              </div>
            </div>
          </div>
        </div>
        <R4SegmentedControls class="r4-table-v2__views" size="medium" aria-label="Vistas de la tabla" :items="itemsVistas" :selected-value="selectedView" @select="cambiarVista" />
      </div>

      <!-- Tablet y mobile (≤ 1023 px): filtros y vistas en una sola línea. A la izquierda «Filtros» (icono + texto; con badge si hay filtros aplicados) y a la derecha un R4Chip multiple con la vista actual, que abre un sheet para elegir vista -->
      <div class="r4-table-v2__bar r4-table-v2__bar--compact">
        <R4Chip type="multiple" hide-chevron icon="ic-sliders-h" label="Filtros" :selected="totalAplicados > 0" :badge="totalAplicados || undefined" :badge-aria-label="totalAplicados + ' filtros aplicados'" aria-haspopup="dialog" @click="abrirSheet" />
        <R4Chip type="multiple" size="small" :label="vistaActual.label" selected :expanded="vistaOpen" aria-haspopup="dialog" @click="vistaOpen = true" />
      </div>
      </template>

      <div class="r4-table-v2__table" :class="{ 'is-loading': loading }" :inert="!!loading">
        <R4Section appearance="boxed" background-color="white">
          <R4Table :key="contentView" :loading="!!loading" :data="filasMostradas" :columns="view.columns" :data-key="dataKey" paginator :rows="rows" :aria-label="ariaLabel"
                   :default-sort="orden" @sort-change="orden = $event">
            <template v-for="c in view.columns" #[\`body-\${c.field}\`]="slotProps">
              <slot :name="'body-' + c.field" v-bind="slotProps"><R4Text :text="c.format ? c.format(slotProps.value, slotProps.data) : (slotProps.value ?? '')" /></slot>
            </template>
          </R4Table>
          <R4Text v-if="footnote && filasMostradas.length" class="r4-table-v2__footnote" size="small" variant="paragraph" :text="footnote" />
        </R4Section>
      </div>
      <p class="r4-table-v2__sr" role="status" aria-live="polite">{{ estado }}</p>

      <Teleport v-if="target" :to="target">
        <R4Sheet v-for="pos in ['side', 'bottom']" :key="pos" class="r4-table-v2__sheet" :class="'r4-table-v2__sheet--' + pos" :position="pos" title="Todos los filtros" :open="sheetOpen"
                 :primary-action-label="primaria" :primary-action-loading="contando" secondary-action-label="Quitar filtros" secondary-action-icon="ic-trash-alt" :secondary-action-disabled="draftTotal === 0" @primary="aplicarSheet" @secondary="quitarFiltros" @close="cerrarSheet">
          <R4Accordion :items="accordionItems" multiple size="small" :default-open="abiertos">
            <template #title="{ item }"><span class="r4-table-v2__acc-title">{{ item.title }}<R4Tag size="small" color="blue" :text="String(item.count)" /></span></template>
            <template #content="{ item }">
              <div v-if="item.id === 'aplicados'" class="r4-table-v2__applied" tabindex="-1">
                <R4Chip v-for="c in chipsDraft" :key="c.filtro + c.value" size="small" :label="c.label" dismissable @dismiss="quitarChip(c)" />
              </div>
              <TableFilterPanel v-else :filter="opcionesSheet(item.filter)" :show-title="false" :show-actions="false" :model-value="draft[item.filter.id] || []" @update:model-value="draft[item.filter.id] = $event" />
            </template>
          </R4Accordion>
        </R4Sheet>
        <R4Sheet class="r4-table-v2__sheet r4-table-v2__sheet--view" position="bottom" title="Vista" :open="vistaOpen" @close="vistaOpen = false">
          <R4InputRadio type="default" :options="itemsVistas" :selected-value="selectedView" @change="cambiarVista($event); vistaOpen = false" />
        </R4Sheet>
        <R4Sheet v-if="filtroAbierto" class="r4-table-v2__sheet r4-table-v2__sheet--category" position="bottom" :title="filtroAbierto.label" :open="true" @close="cerrarCategoria">
          <TableFilterPanel :filter="opcionesCategoria(filtroAbierto)" :show-title="false" v-model="catDraft" @apply="aplicarCategoria(filtroAbierto)" @clear="catDraft = []" />
        </R4Sheet>
      </Teleport>
    </div>
  `,
})
