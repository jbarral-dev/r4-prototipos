// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// R4Table (v2) — EVOLUTIVO en definición (Confluence PND «1. Objetivos - R4Table (v2)», 4064870412: «vistas y filtrar por columnas»; «2.1 Competencia», 4090494983: Airbnb y Booking.com). NO existe en Figma de Primitivos ni en la doc de API:
// la visual sale de Figma «Proyectos - Tablas» (frame 668:23386: Filters and View + R4Section con filas y columnas) y la interacción de la descripción de Jon (2026-11-19). La tabla es R4Table (Storybook de IT; Figma ↔ Storybook: manda Storybook).
// API provisional (propuesta, a validar con IT/PO): `views` ({ value, label, columns, filters, initial }[]), `data`, `dataKey`, `rows` (filas por página, 25), `ariaLabel`, `overlay` (selector de la capa de superposición de la Template donde se montan los R4Sheet).
//   Un filtro = { id, label, type: 'single' | 'multiple', icon?, highlighted?, options: { value, label }[], predicate(row, valoresSeleccionados) }. Los filtros son POR COLUMNA/vista. Slots `body-<field>` ({ data, value }) para las celdas que no son texto.
// Composición: «Filters and Views» (chips + R4SegmentedControls) + R4Section boxed blanca con R4Table. Los filtros destacados (`highlighted`) son R4Chip type=multiple con R4Popover debajo (a 8 px) en ≥ 1024 px y R4Sheet bottom por debajo
//   (patrón Progressive disclosure, Confluence 4016603138). «Todos los filtros» abre un R4Sheet (side en ≥ 1024, bottom por debajo) con R4Accordion: el primero lista los filtros aplicados en R4Chip `dismissable`; el resto, un grupo de R4InputCheckbox (multiselección)
//   o R4InputRadio type=default (selección única) por filtro. Nada se aplica hasta pulsar el primario «Ver N resultados» (N se actualiza en vivo); «Restablecer» devuelve la selección del sheet a su estado inicial (también sin aplicar).
//   Al aplicar (sheet o popover) la tabla muestra R4Skeleton (Jon, 2026-11-24; antes R4Spinner con opacidad) y 1 s después se pinta con los nuevos resultados. Cambiar de vista es instantáneo (sin spinner): cambian a la vez las columnas y los filtros.
// Variante A (`inline`) en desktop: las vistas van en un R4Chip multiple con la vista actual (Jon, 2026-11-25; antes R4SegmentedControls) que abre un R4Popover con las vistas; en la B siguen siendo un R4SegmentedControls.
// Variante B (`layout="stacked"`): los filtros ocupan una fila (en tablet y mobile con scroll horizontal; sus categorías se abren en bottom sheet) y, 16 px debajo, «N resultados» (nº total de filas) a la izquierda y las vistas a la derecha.
// Tablet y mobile (≤ 1023 px; Jon, 2026-11-24): filtros y vistas en una línea, las dos chips size medium (Jon, 2026-11-26: también en tablet), a mitad y mitad con 16 px entre ellas (Jon, 2026-11-26): «Filtros» (R4Chip con icono y badge) a la izquierda y la vista actual (R4Chip multiple) a la derecha, que abre un R4Sheet bottom con las vistas (R4InputRadio). Los filtros destacados de la fila ancha solo se alcanzan desde «Filtros».
// Cada opción de filtro lleva entre paréntesis su nº de resultados (las que dan 0 salen deshabilitadas, Jon 2026-11-25). Los títulos de los acordeones van sin contador (Jon, 2026-11-25; antes llevaban el nº en una R4Tag blue).
// Acordeones del sheet: size small en todos los anchos (desktop incluido, Jon 2026-11-23); «Filtros seleccionados» solo aparece si hay filtros activos; abiertos los filtros destacados y cerrados el resto; el botón primario muestra un spinner de 800 ms cada vez que cambia N.
// El orden de columna (R4Table `sortable`) se conserva al cambiar de vista: si la columna ordenada existe en la nueva vista (p. ej. Nombre), sigue ordenada igual.
// Chip de categoría: sin selección = nombre de la categoría; con una = su texto; con varias = la primera + «+N». «Todos los filtros» lleva badge con el nº de filtros seleccionados (valores) y pasa a selected.
// Decisiones inferidas: «Restablecer» (popover) devuelve la selección del popover a su estado inicial y hay que pulsar «Aplicar» para aplicar (disabled si ya está en el inicial); categorías con AND entre sí y OR dentro; los filtros aplicados son de la tabla y se conservan al cambiar de vista (Confluence, apartado 3); el tiempo de recarga (1 s) es el pedido.
// Filtros de selección única (R4InputRadio): no se restablecen en el popover (sin botón «Restablecer»); si el filtro es `required` (Fecha) siempre hay uno marcado y no cuenta como filtro aplicado.
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
import R4ListDetail from './R4ListDetail.js'
import R4Link from './R4Link.js'
import R4InputText from './R4InputText.js'
import DatePickerMenu, { leerFecha } from './_DatePickerMenu.js'

// «Personalizado» (fecha): los dos límites son obligatorios y deben ser fechas válidas, con «Desde» ≤ «Hasta». Si no, no se aplica y el campo muestra el error en línea.
const personalizadoInvalido = (f, vals) => f.type === 'single' && f.options.some((o) => o.custom) && vals[0] === 'custom' && (!leerFecha(vals[1]) || !leerFecha(vals[2]) || leerFecha(vals[1]) > leerFecha(vals[2]))

const RECARGA_MS = 1000 // tiempo de recarga pedido por Jon

const pluralResultados = (n) => (n === 1 ? 'Ver 1 resultado' : `Ver ${n} resultados`)

// Contenido de una categoría de filtro (popover y sheet de categoría): título R4Text large strong + checkboxes o radios (+ botones en el popover)
const _TableFilterPanel = defineComponent({
  name: '_TableFilterPanel',
  components: { R4Text, R4InputCheckbox, R4InputRadio, R4Button, R4InputText },
  props: { filter: { type: Object, required: true }, modelValue: { type: Array, required: true }, initial: { type: Array, default: () => [] }, navigate: { type: Boolean, default: false }, validate: { type: Boolean, default: false }, buttonSize: { type: String, default: 'medium' }, showTitle: { type: Boolean, default: true }, showActions: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'apply', 'reset', 'calendar'],
  setup(props, { emit }) {
    // Intervalo numérico (type 'range'): valor = [mínimo, máximo] (texto) o [] si no hay ninguno. Se pueden dejar vacíos (sin límite) y el mínimo no puede superar al máximo.
    const rango = computed(() => [props.modelValue[0] ?? '', props.modelValue[1] ?? ''])
    const setRango = (i, v) => { const r = [...rango.value]; r[i] = v; emit('update:modelValue', r[0] === '' && r[1] === '' ? [] : r) }
    const rangoInvalido = computed(() => rango.value[0] !== '' && rango.value[1] !== '' && Number(rango.value[0]) > Number(rango.value[1]))
    // Fecha personalizada (single con opción `custom`): valor = ['custom', desde, hasta] («dd/mm/aaaa»)
    const esPersonalizado = computed(() => props.filter.type === 'single' && props.filter.options.some((o) => o.custom) && props.modelValue[0] === 'custom')
    const fechas = computed(() => [props.modelValue[1] ?? '', props.modelValue[2] ?? ''])
    const setFecha = (i, v) => { const f = [...fechas.value]; f[i] = v; emit('update:modelValue', ['custom', f[0], f[1]]) }
    const fechaMal = (v) => v !== '' && !leerFecha(v)
    const desdeMayor = computed(() => !!leerFecha(fechas.value[0]) && !!leerFecha(fechas.value[1]) && leerFecha(fechas.value[0]) > leerFecha(fechas.value[1]))
    // Error en línea de cada campo de fecha: formato incorrecto, vacío (solo tras intentar aplicar) o «Hasta» anterior a «Desde»
    const errorFecha = (i) => (fechaMal(fechas.value[i]) ? 'La fecha no es correcta' : fechas.value[i] === '' && props.validate ? 'La fecha es obligatoria' : i === 1 && desdeMayor.value ? 'La fecha «Hasta» no puede ser anterior a «Desde»' : undefined)
    const elegir = (v) => emit('update:modelValue', v === 'custom' ? ['custom', ...(props.modelValue[0] === 'custom' ? fechas.value : ['', ''])] : [v])
    return { rango, setRango, rangoInvalido, esPersonalizado, fechas, setFecha, fechaMal, desdeMayor, errorFecha, elegir }
  },
  template: `
    <div class="r4-table-v2__panel">
      <R4Text v-if="showTitle" size="large" font-style="strong" tag="p" :text="filter.label" />
      <div v-if="filter.type === 'range'" class="r4-table-v2__range">
        <R4InputText type="number" label="Mínimo" :aria-label="filter.label + ': mínimo'" placeholder="0" :model-value="rango[0]" @update:model-value="setRango(0, $event)" />
        <R4InputText type="number" label="Máximo" :aria-label="filter.label + ': máximo'" placeholder="0" :model-value="rango[1]" :status="rangoInvalido ? 'Error' : 'Default'" :caption="rangoInvalido ? 'El máximo no puede ser menor que el mínimo' : undefined" @update:model-value="setRango(1, $event)" />
      </div>
      <template v-else>
      <div class="r4-table-v2__options">
        <R4InputCheckbox v-if="filter.type === 'multiple'" :options="filter.options" :model-value="modelValue" :aria-label="filter.label" @update:model-value="$emit('update:modelValue', $event)" />
        <R4InputRadio v-else type="default" :options="filter.options" :selected-value="modelValue[0]" @change="elegir($event)" />
      </div>
      <div v-if="esPersonalizado" class="r4-table-v2__range r4-table-v2__range--dates">
        <R4InputText type="datepicker" required label="Desde" aria-label="Fecha desde" :external-calendar="navigate" :model-value="fechas[0]" :status="errorFecha(0) ? 'Error' : 'Default'" :caption="errorFecha(0)" @update:model-value="setFecha(0, $event)" @calendar="$emit('calendar', 0)" />
        <R4InputText type="datepicker" required label="Hasta" aria-label="Fecha hasta" :external-calendar="navigate" :model-value="fechas[1]" :status="errorFecha(1) ? 'Error' : 'Default'" :caption="errorFecha(1)" @update:model-value="setFecha(1, $event)" @calendar="$emit('calendar', 1)" />
      </div>
      </template>
      <div v-if="showActions" class="r4-table-v2__panel-actions">
        <R4Button type="primary" :size="buttonSize" width="full-width" text="Aplicar" @click="$emit('apply')" />
        <R4Button v-if="filter.type !== 'single'" type="text" :size="buttonSize" width="full-width" text="Restablecer" :disabled="modelValue.length === initial.length && modelValue.every((x) => initial.includes(x))" @click="$emit('reset')" />
      </div>
    </div>
  `,
})

// Filtro booleano (type: 'boolean'; Confluence apartado 2 «Booleanos»): una fila de R4ListDetail con el concepto (+ botón de información) y un toggle como valor. Solo en «Todos los filtros» (acordeón).
// Marcado = [valor de la única opción]; sin marcar = []. El botón de información abre un popover en ≥ 1024 px y un R4Sheet bottom por debajo (patrón Progressive disclosure › «Icono de info (ayuda breve)»).
// `filter.ayuda` = { label (nombre accesible del botón), title, intro, introStrong, description, linkText, linkHref }.
const _TableFilterBoolean = defineComponent({
  name: '_TableFilterBoolean',
  components: { R4ListDetail, R4Popover, R4Sheet, R4Link },
  props: { filter: { type: Object, required: true }, modelValue: { type: Array, required: true }, target: { default: null } },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const popover = ref(null) // { top, left } relativos a la fila (≥ 1024 px)
    const popoverEl = ref(null)
    const sheet = ref(false) // < 1024 px
    const open = computed(() => !!popover.value || sheet.value)
    const cerrar = () => { popover.value = null; sheet.value = false }
    const items = computed(() => [{ concept: props.filter.options[0].label, info: { label: props.filter.ayuda.label, haspopup: true, pressed: open.value }, switch: { checked: props.modelValue.length > 0 } }])
    const onSwitch = (it, checked) => emit('update:modelValue', checked ? [props.filter.options[0].value] : [])
    const onInfo = async (it, e) => {
      if (open.value) { cerrar(); return }
      const btn = e && e.currentTarget
      const box = btn && btn.closest('.r4-table-v2__bool')
      if (!box) return
      const b = btn.getBoundingClientRect(); const r = box.getBoundingClientRect()
      const width = 320
      popover.value = { top: b.bottom - r.top + 8, left: Math.max(0, Math.min(b.left - r.left, r.width - width)) }
      await nextTick()
      // El CSS decide cuál se ve (popover en ≥ 1024, bottom sheet por debajo): si el popover queda oculto se abre el sheet
      if (popoverEl.value && getComputedStyle(popoverEl.value).display === 'none') { popover.value = null; sheet.value = true }
    }
    const onDocClick = (e) => { if (popover.value && !e.target.closest('.r4-table-v2__help-popover, .r4-table-v2__bool .r4-listdetail__info')) cerrar() }
    // Escape cierra primero el aviso (popover o sheet de ayuda) sin cerrar el sheet «Todos los filtros» que tiene debajo
    const onKey = (e) => { if (e.key === 'Escape' && open.value) { e.stopPropagation(); cerrar() } }
    onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('keydown', onKey, true) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey, true) })
    return { popover, popoverEl, sheet, items, onSwitch, onInfo, cerrar }
  },
  template: `
    <div class="r4-table-v2__bool">
      <R4ListDetail size="medium" :aria-label="filter.label" :items="items" @info="onInfo" @switch="onSwitch" />
      <div v-if="popover" ref="popoverEl" class="r4-table-v2__help-popover" role="dialog" :aria-label="filter.ayuda.title" :style="{ top: popover.top + 'px', left: popover.left + 'px' }">
        <R4Popover width="wide">
          <div class="r4-table-v2__help">
            <p class="r4-table-v2__help-title">{{ filter.ayuda.title }}</p>
            <div class="r4-table-v2__help-text"><p>{{ filter.ayuda.intro }}<strong>{{ filter.ayuda.introStrong }}</strong>.</p><p>{{ filter.ayuda.description }}</p></div>
            <R4Link type="standalone" size="medium" :href="filter.ayuda.linkHref">{{ filter.ayuda.linkText }}</R4Link>
          </div>
        </R4Popover>
      </div>
      <Teleport v-if="target" :to="target">
        <R4Sheet class="r4-table-v2__sheet r4-table-v2__sheet--help" position="bottom" :title="filter.ayuda.title" :open="sheet" @close="sheet = false">
          <div class="r4-table-v2__help">
            <div class="r4-table-v2__help-text"><p>{{ filter.ayuda.intro }}<strong>{{ filter.ayuda.introStrong }}</strong>.</p><p>{{ filter.ayuda.description }}</p></div>
            <R4Link type="standalone" size="medium" :href="filter.ayuda.linkHref">{{ filter.ayuda.linkText }}</R4Link>
          </div>
        </R4Sheet>
      </Teleport>
    </div>
  `,
})

export default defineComponent({
  name: 'R4TableV2',
  components: { DatePickerMenu, R4Chip, R4SegmentedControls, R4Section, R4Table, R4Text, R4Popover, R4Sheet, R4Accordion, R4InputCheckbox, R4InputRadio, R4Button, TableFilterPanel: _TableFilterPanel, TableFilterBoolean: _TableFilterBoolean },
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
    // Los filtros aplicados son de la tabla, no de la vista (Confluence «Definición - R4Table (v2)», apartado 3: todas las vistas comparten los mismos filtros y al cambiar de vista no se pierden)
    const inicial = Object.assign({}, ...props.views.map((v) => v.initial || {})) // estado inicial de los filtros: { filtroId: [valores] }
    const inicialDe = (f) => inicial[f.id] || []
    const igualSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x))
    const aplicados = reactive(Object.fromEntries(Object.entries(inicial).map(([k, v]) => [k, [...v]]))) // { filtroId: [valores] }
    const actuales = computed(() => aplicados)
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
    // Cada opción lleva entre paréntesis las filas que devuelve (con el resto de categorías ya seleccionadas en `sel`). Se muestran TODAS; las que dan (0) salen deshabilitadas salvo que ya estén marcadas (Jon, 2026-11-25)
    const conteoOpcion = (f, o, sel) => {
      const otros = view.value.filters.filter((x) => x.id !== f.id && (sel[x.id] || []).length)
      return props.data.filter((r) => otros.every((x) => x.predicate(r, sel[x.id])) && f.predicate(r, [o.value])).length
    }
    const opcionesDe = (f, sel) => ({ ...f, options: f.options.map((o) => { if (o.custom) return { value: o.value, label: o.label, custom: true, n: 1, disabled: false }; const n = conteoOpcion(f, o, sel); return { value: o.value, label: `${o.label} (${n})`, n, disabled: n === 0 && !(sel[f.id] || []).includes(o.value) } }) }) // las de 0 resultados se deshabilitan (si ya estaba marcada sigue habilitada para poder desmarcarla)
    const opcionesCategoria = (f) => opcionesDe(f, { ...actuales.value, [f.id]: catDraft.value }) // popover / sheet de una categoría
    const opcionesSheet = (f) => opcionesDe(f, draft) // sheet «Todos los filtros»

    // — Chips de categoría y popover —
    const seleccion = (f) => actuales.value[f.id] || []
    // Texto de los valores: intervalo numérico → «Importe: de 100 a 500 €»; fecha personalizada → «dd/mm/aaaa - dd/mm/aaaa»; el resto, el texto de cada opción
    const textoRango = (f, [mn = '', mx = '']) => (mn !== '' && mx !== '' ? `de ${mn} a ${mx}` : mn !== '' ? `desde ${mn}` : `hasta ${mx}`) + (f.unit ? ` ${f.unit}` : '')
    const textoFechas = ([, d = '', h = '']) => (d && h ? `${d} - ${h}` : d ? `Desde ${d}` : h ? `Hasta ${h}` : 'Personalizado')
    const etiquetas = (f, vals) => (f.type === 'range' ? (vals.length ? [`${f.label}: ${textoRango(f, vals)}`] : []) : vals[0] === 'custom' ? [textoFechas(vals)] : vals.map((v) => f.options.find((o) => o.value === v)?.label ?? v))
    const cuenta = (f, vals) => (f.type === 'range' ? (vals.length ? 1 : 0) : vals.length) // un intervalo cuenta como un solo filtro
    const chipLabel = (f) => { const l = f.type === 'range' && seleccion(f).length ? [textoRango(f, seleccion(f))] : etiquetas(f, seleccion(f)); return !l.length ? f.label : l.length > 1 ? `${l[0]} +${l.length - 1}` : l[0] }
    const destacados = computed(() => view.value.filters.filter((f) => f.highlighted))
    // Los filtros `required` (selección única que siempre tiene uno marcado, p. ej. Fecha) no cuentan como «filtro aplicado»: ni en el badge, ni en «Filtros seleccionados», ni se pueden quitar (Restablecer los devuelve a su valor inicial)
    const totalAplicados = computed(() => view.value.filters.filter((f) => !f.required).reduce((n, f) => n + cuenta(f, seleccion(f)), 0))
    const catAbierta = ref(null) // id del filtro con popover/sheet abierto
    const catDraft = ref([])
    const intentoCat = ref(false) // se pulsó «Aplicar» en el popover con una fecha personalizada incompleta: se muestran los errores en línea
    const intentoSheet = ref(false)
    const pantalla = ref(null) // mobile: pantalla propia del calendario dentro del sheet { filtro, campo } (0 = inicio, 1 = fin)
    const abrirCategoria = (f) => { intentoCat.value = false; vistaPopover.value = false; if (catAbierta.value === f.id) { catAbierta.value = null; return } sheetOpen.value = false; catAbierta.value = f.id; catDraft.value = [...seleccion(f)] }
    const filtroAbierto = computed(() => view.value.filters.find((f) => f.id === catAbierta.value))
    const cerrarCategoria = () => { catAbierta.value = null }
    const aplicarCategoria = (f) => {
      if (personalizadoInvalido(f, catDraft.value)) { intentoCat.value = true; return } // no se aplica nada
      aplicados[f.id] = [...catDraft.value]
      cerrarCategoria()
      recargar('table', () => {})
    }

    // — Sheet «Todos los filtros» —
    const sheetOpen = ref(false)
    const draft = reactive({}) // { filtroId: [valores] } (sin aplicar)
    const abrirSheet = () => { intentoSheet.value = false; pantalla.value = null; cerrarCategoria(); view.value.filters.forEach((f) => { draft[f.id] = [...seleccion(f)] }); sheetOpen.value = true }
    const cerrarSheet = () => { sheetOpen.value = false; pantalla.value = null }
    const draftTotal = computed(() => view.value.filters.filter((f) => !f.required).reduce((n, f) => n + cuenta(f, draft[f.id] || []), 0))
    const chipsDraft = computed(() => view.value.filters.filter((f) => !f.required).flatMap((f) => (f.type === 'range' ? ((draft[f.id] || []).length ? [{ filtro: f.id, value: '__rango', label: etiquetas(f, draft[f.id])[0] }] : []) : (draft[f.id] || []).map((v) => ({ filtro: f.id, value: v, label: etiquetas(f, [v])[0] })))))
    const nResultados = computed(() => (sheetOpen.value ? filtrar(view.value.filters, draft).length : filasMostradas.value.length))
    const primaria = computed(() => pluralResultados(nResultados.value))
    // Pantalla del calendario (side y bottom): sustituye a los acordeones dentro del R4Sheet (siguen montados, ocultos) y al volver se recupera la posición del scroll y el foco en el campo que la abrió
    const contenidoVisible = () => [...document.querySelectorAll('.r4-table-v2__sheet .r4-sheet__content')].find((e) => e.getClientRects().length)
    const abrirCalendario = (f, campo) => { const c = contenidoVisible(); pantalla.value = { filtro: f.id, campo, scroll: c ? c.scrollTop : 0 } }
    const volverDeCalendario = async () => {
      const p = pantalla.value; if (!p) return
      pantalla.value = null
      await nextTick()
      const c = contenidoVisible(); if (c) c.scrollTop = p.scroll
      const campos = [...document.querySelectorAll('.r4-table-v2__sheet .r4-table-v2__range--dates .r4-input-text input')].filter((e) => e.getClientRects().length)
      const el = campos[p.campo]; if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ block: 'nearest' }) }
    }
    const pantallaTitulo = () => (pantalla.value ? (pantalla.value.campo === 0 ? 'Elige fecha de inicio' : 'Elige fecha de fin') : 'Todos los filtros')
    const fechaPantalla = computed(() => (pantalla.value ? (draft[pantalla.value.filtro] || [])[1 + pantalla.value.campo] || '' : ''))
    const elegirFechaPantalla = (fecha) => { const p = pantalla.value; const v = [...(draft[p.filtro] || ['custom', '', ''])]; v[1 + p.campo] = fecha; draft[p.filtro] = v; volverDeCalendario() }
    const quitarChip = (c) => { draft[c.filtro] = c.value === '__rango' ? [] : draft[c.filtro].filter((v) => v !== c.value); nextTick(() => { // el foco no se pierde: siguiente chip o, si ya no quedan, la cabecera del primer acordeón (solo entre los elementos visibles; hay un sheet por posición)
        const visible = (s) => [...document.querySelectorAll(s)].find((e) => e.getClientRects().length)
        ;(visible('.r4-table-v2__applied .r4-chip') || visible('.r4-sheet .r4-accordion__header'))?.focus?.()
      }) }
    // «Restablecer» (Confluence apartado 2): devuelve los filtros del sheet a su estado inicial (sin aplicar hasta pulsar «Ver N resultados»)
    const restablecer = () => { view.value.filters.forEach((f) => { draft[f.id] = [...inicialDe(f)] }) }
    const draftEsInicial = computed(() => view.value.filters.every((f) => igualSet(draft[f.id] || [], inicialDe(f))))
    const aplicarSheet = () => {
      if (view.value.filters.some((f) => personalizadoInvalido(f, draft[f.id] || []))) { // no se aplica nada: errores en línea y foco en el primer campo con error
        intentoSheet.value = true
        nextTick(() => { const visibles = [...document.querySelectorAll('.r4-sheet .r4-input-text--error input')].filter((e) => e.getClientRects().length); const el = visibles[0]; if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ block: 'center', behavior: 'smooth' }) } })
        return
      }
      Object.assign(aplicados, Object.fromEntries(view.value.filters.map((f) => [f.id, [...(draft[f.id] || [])]])))
      cerrarSheet()
      recargar('table', () => {})
    }
    // Acordeones del sheet: «Filtros seleccionados» solo existe si hay algún filtro activo (en la selección del sheet, en vivo); abiertos los filtros que se ven sobre la tabla (destacados) y cerrados los demás
    const accordionItems = computed(() => [
      ...(draftTotal.value ? [{ id: 'aplicados', title: 'Filtros seleccionados' }] : []),
      ...view.value.filters.map((f) => ({ id: f.id, title: f.label, filter: f })),
    ])
    const abiertos = computed(() => ['aplicados', ...view.value.filters.filter((f) => f.highlighted || f.expanded).map((f) => f.id)]) // abiertos: los destacados y los que se marcan `expanded` (p. ej. «Tipos de filtro» de Fondos)
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
    const vistaPopover = ref(false) // popover de vistas (variante A, desktop)
    const alternarVistaPopover = () => { cerrarCategoria(); vistaPopover.value = !vistaPopover.value }
    const vistaActual = computed(() => vistaPorValor(selectedView.value))
    const itemsVistas = computed(() => props.views.map((v) => ({ label: v.label, value: v.value })))
    // El cambio de vista es instantáneo (Jon, 2026-11-23): sin spinner ni recarga; solo al aplicar filtros hay recarga de 1 s
    const cambiarVista = (v) => {
      clearTimeout(timer); loading.value = null; vistaPopover.value = false
      selectedView.value = v; contentView.value = v; cerrarCategoria(); cerrarSheet()
      filasMostradas.value = filtrar(view.value.filters, actuales.value)
    }

    // Cierre del popover: clic fuera y Escape
    const onDocClick = (e) => { if ((catAbierta.value || vistaPopover.value) && !e.target.closest('.r4-table-v2__anchor, .r4-sheet-layer, .r4-datepicker-layer')) { cerrarCategoria(); vistaPopover.value = false } }
    const onKey = (e) => { if (e.key === 'Escape') { cerrarCategoria(); vistaPopover.value = false } }
    onMounted(() => { target.value = document.querySelector(props.overlay); document.addEventListener('click', onDocClick); document.addEventListener('keydown', onKey) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey) })
    watch(contentView, () => {}, { flush: 'post' })

    const estado = computed(() => (loading.value ? 'Cargando resultados' : `${filasMostradas.value.length} resultados`))
    return { selectedView, contentView, view, loading, target, filasMostradas, seleccion, chipLabel, destacados, totalAplicados, catAbierta, catDraft, abrirCategoria, filtroAbierto, cerrarCategoria, aplicarCategoria,
      opcionesCategoria, opcionesSheet, contando, abiertos, vistaOpen, vistaActual, vistaPopover, alternarVistaPopover, orden, sheetOpen, draft, abrirSheet, cerrarSheet, draftTotal, chipsDraft, primaria, quitarChip, restablecer, draftEsInicial, inicialDe, aplicarSheet, intentoCat, intentoSheet, pantalla, abrirCalendario, volverDeCalendario, pantallaTitulo, fechaPantalla, elegirFechaPantalla, accordionItems, itemsVistas, cambiarVista, estado }
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
                  <TableFilterPanel :filter="opcionesCategoria(f)" :initial="inicialDe(f)" :validate="intentoCat" v-model="catDraft" @apply="aplicarCategoria(f)" @reset="catDraft = [...inicialDe(f)]" />
                </R4Popover>
              </div>
            </div>
          </div>
        </div>
        <div class="r4-table-v2__meta">
          <R4Text class="r4-table-v2__count" aria-hidden="true" :text="filasMostradas.length === 1 ? '1 resultado' : filasMostradas.length + ' resultados'" />
          <R4SegmentedControls class="r4-table-v2__views r4-table-v2__views--segmented" size="medium" aria-label="Vistas de la tabla" :items="itemsVistas" :selected-value="selectedView" @select="cambiarVista" />
          <R4Chip class="r4-table-v2__views-chip" type="multiple" icon="ic-th-list" :label="vistaActual.label" selected :expanded="vistaOpen" aria-haspopup="dialog" @click="vistaOpen = true" />
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
                  <TableFilterPanel :filter="opcionesCategoria(f)" :initial="inicialDe(f)" :validate="intentoCat" v-model="catDraft" @apply="aplicarCategoria(f)" @reset="catDraft = [...inicialDe(f)]" />
                </R4Popover>
              </div>
            </div>
          </div>
        </div>
        <!-- Variante A, desktop: las vistas en un R4Chip multiple (la vista actual, seleccionada) que abre un R4Popover con las vistas (R4InputRadio); elegir una cambia la vista al instante -->
        <div class="r4-table-v2__anchor r4-table-v2__anchor--views">
          <R4Chip type="multiple" icon="ic-th-list" :label="vistaActual.label" selected :expanded="vistaPopover" aria-haspopup="dialog" @click="alternarVistaPopover" />
          <div v-if="vistaPopover" class="r4-table-v2__popover r4-table-v2__popover--end" role="dialog" aria-label="Vista">
            <R4Popover width="default">
              <div class="r4-table-v2__panel">
                <R4Text size="large" font-style="strong" tag="p" text="Vista" />
                <R4InputRadio type="default" :options="itemsVistas" :selected-value="selectedView" @change="cambiarVista($event); vistaPopover = false" />
              </div>
            </R4Popover>
          </div>
        </div>
      </div>

      <!-- Tablet y mobile (≤ 1023 px): filtros y vistas en una sola línea. A la izquierda «Filtros» (icono + texto; con badge si hay filtros aplicados) y a la derecha un R4Chip multiple con la vista actual, que abre un sheet para elegir vista -->
      <div class="r4-table-v2__bar r4-table-v2__bar--compact">
        <R4Chip class="r4-table-v2__filtros-chip" type="multiple" :expanded="sheetOpen" icon="ic-sliders-h" label="Filtros" :selected="totalAplicados > 0" :badge="totalAplicados || undefined" :badge-aria-label="totalAplicados + ' filtros aplicados'" aria-haspopup="dialog" @click="abrirSheet" />
        <R4Chip type="multiple" icon="ic-th-list" :label="vistaActual.label" selected :expanded="vistaOpen" aria-haspopup="dialog" @click="vistaOpen = true" />
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
        <R4Sheet v-for="pos in ['side', 'bottom']" :key="pos" class="r4-table-v2__sheet" :class="'r4-table-v2__sheet--' + pos" :position="pos" :title="pantallaTitulo()" :open="sheetOpen" :show-back-link="!!pantalla" back-link-label="Volver a los filtros" @back="volverDeCalendario()"
                 :primary-action-label="pantalla ? undefined : primaria" :primary-action-loading="contando" :secondary-action-label="pantalla ? undefined : 'Restablecer'" secondary-action-icon="ic-undo" :secondary-action-disabled="draftEsInicial" @primary="aplicarSheet" @secondary="restablecer" @close="cerrarSheet">
          <R4Accordion v-show="!pantalla" :items="accordionItems" multiple size="small" :default-open="abiertos">
            <template #content="{ item }">
              <div v-if="item.id === 'aplicados'" class="r4-table-v2__applied" tabindex="-1">
                <R4Chip v-for="c in chipsDraft" :key="c.filtro + c.value" size="small" :label="c.label" dismissable @dismiss="quitarChip(c)" />
              </div>
              <TableFilterBoolean v-else-if="item.filter.type === 'boolean'" :filter="item.filter" :target="target" :model-value="draft[item.filter.id] || []" @update:model-value="draft[item.filter.id] = $event" />
               <TableFilterPanel v-else :filter="opcionesSheet(item.filter)" :navigate="true" :validate="intentoSheet" @calendar="abrirCalendario(item.filter, $event)" :show-title="false" :show-actions="false" :model-value="draft[item.filter.id] || []" @update:model-value="draft[item.filter.id] = $event" />
            </template>
          </R4Accordion>
          <DatePickerMenu v-if="pantalla" inline :model-value="fechaPantalla" @select="elegirFechaPantalla" />
        </R4Sheet>
        <R4Sheet class="r4-table-v2__sheet r4-table-v2__sheet--view" position="bottom" title="Vista" :open="vistaOpen" @close="vistaOpen = false">
          <R4InputRadio type="default" :options="itemsVistas" :selected-value="selectedView" @change="cambiarVista($event); vistaOpen = false" />
        </R4Sheet>
        <R4Sheet v-if="filtroAbierto" class="r4-table-v2__sheet r4-table-v2__sheet--category" position="bottom" :title="filtroAbierto.label" :open="true" @close="cerrarCategoria">
          <TableFilterPanel :filter="opcionesCategoria(filtroAbierto)" :initial="inicialDe(filtroAbierto)" :validate="intentoCat" button-size="large" :show-title="false" v-model="catDraft" @apply="aplicarCategoria(filtroAbierto)" @reset="catDraft = [...inicialDe(filtroAbierto)]" />
        </R4Sheet>
      </Teleport>
    </div>
  `,
})
