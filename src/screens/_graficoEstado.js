// Estado del prototipo de los controles del gráfico de la ficha de acción (R4ChartLine): Comparar, Configurar y tipo de gráfico. No es un componente: es lógica de pantalla (el R4ChartLine y
// sus chips son presentacionales). Figma "Proyectos - Fichas de Productos": desktop 2813:74279 y mobile 2816:98718. Datos de ejemplo en src/data/ficha-accion.js (graficoControles).
// Reglas de interacción (indicadas por Jon):
// - Comparar (chip multiple): abre un R4Popover (desktop) o un R4Sheet bottom (mobile/tablet) con un buscador; solo se comparan acciones. Elegir un valor añade una serie al gráfico (que pasa a % de variación)
//   y entra en el modo «comparar»: se deshabilitan Configurar y el selector de tipo de gráfico (no los periodos). Debajo aparecen los chips de las series; la aspa del valor comparado sale del modo.
//   Se pueden comparar hasta 4 series en total (la principal + 3; máximo de R4ChartLine): se busca un valor, se añade, se ve el gráfico, se vuelve a pulsar Comparar y se añade otro. El badge del chip es el
//   número de series; al llegar a 4 el chip se deshabilita. Cada serie conserva su color (2–4). Quitar una con su aspa; al quedar solo la principal se sale del modo. El modo comparar quita los indicadores y fuerza líneas.
// - Tipo de gráfico (R4SegmentedControls): Líneas (por defecto) | Velas. En mobile es un R4Button solo icono que alterna.
// - Configurar (chip multiple): popover (desktop) con checkboxes de datos, medias móviles y estudios. Al marcar uno salta un R4Spinner sobre el gráfico y se pinta; el chip muestra un badge con el
//   número de indicadores. En el sheet de mobile se edita un borrador y se aplica con «Guardar ajustes» (aparece al haber cambios; «Cancelar» lo descarta).
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'

const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const MAX_SERIES = 4 // R4ChartLine admite de 1 a 4 series (Confluence): la principal + hasta 3 comparadas
const LOAD_MS = 1000 // duración de la carga simulada de un indicador (el R4Spinner aparece a los 300 ms)

// Marcas «redondas» (1, 2, 5 × 10ⁿ) para el eje vertical en %: de arriba a abajo, con 2 decimales y coma (formato español de la doc de R4ChartLine).
const ticks = (lo, hi) => {
  const raw = (hi - lo) / 4 || 1
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = ([1, 2, 5, 10].find((m) => m * mag >= raw) || 10) * mag
  const bottom = Math.floor(lo / step) * step
  const top = Math.ceil(hi / step) * step
  const labels = []
  for (let v = top; v >= bottom - step / 1000; v -= step) labels.push(`${v.toFixed(2).replace('.', ',')}%`)
  return { domain: [bottom, top], labels }
}
const pct = (arr) => arr.map((v) => (v / arr[0] - 1) * 100)

export function useGraficoControles(datos, ctrl, period) {
  const visualization = ref('line')
  const panel = ref(null) // popover abierto (desktop): 'compare' | 'config' | null
  const sheet = ref(null) // sheet abierto (mobile / tablet): 'compare' | 'config' | null
  const query = ref('')
  const compared = ref([]) // valores comparados (hasta MAX_SERIES − 1), cada uno con su color de serie (2–4)
  const selected = ref([]) // indicadores elegidos (lo que cuenta el badge)
  const drawn = ref([]) // indicadores pintados (se actualizan al terminar la carga)
  const draft = ref([]) // borrador del sheet
  const loading = ref(false)
  let timer = 0

  const comparing = computed(() => compared.value.length > 0)
  const full = computed(() => 1 + compared.value.length >= MAX_SERIES)
  const dirty = computed(() => draft.value.length !== selected.value.length || draft.value.some((v) => !selected.value.includes(v)))

  const serie = computed(() => datos.series[period.value] || datos.series['1d']) // serie del periodo elegido en el selector
  const adjusted = (pts, a) => pts.map((v, i) => v * (1 - a + (a * i) / (pts.length - 1))) // «Ajuste de dividendos» (ejemplo): los precios antiguos se ajustan a la baja
  const basePoints = computed(() => (drawn.value.includes('ajuste') ? adjusted(serie.value.points, serie.value.ajuste) : serie.value.points))

  const chart = computed(() => {
    if (!compared.value.length) return { points: basePoints.value, domain: serie.value.domain, yLabels: serie.value.yLabels, compareSeries: [] }
    const main = pct(serie.value.points)
    const others = compared.value.map((c) => ({ id: c.ticker, points: pct(ctrl.pointsFor(c, period.value)), color: c.color }))
    const { domain, labels } = ticks(Math.min(...main, ...others.flatMap((o) => o.points)), Math.max(...main, ...others.flatMap((o) => o.points)))
    return { points: main, domain, yLabels: labels, compareSeries: others }
  })
  const overlays = computed(() => {
    if (comparing.value) return []
    return drawn.value.filter((id) => serie.value.overlays[id]).map((id) => {
      const o = serie.value.overlays[id]
      return { id, ...o, ...(o.type === 'band' ? { span: [0, serie.value.progress] } : {}) }
    })
  })
  const results = computed(() => {
    const q = plain(query.value.trim())
    if (q.length < 2) return []
    return ctrl.comparables.filter((c) => !compared.value.some((x) => x.ticker === c.ticker) && [c.name, c.ticker, c.isin].some((t) => plain(t).includes(q)))
  })

  const close = () => { panel.value = null; sheet.value = null; query.value = '' }
  const open = async (kind) => {
    if (panel.value === kind || sheet.value === kind) { close(); return }
    query.value = ''
    if (kind === 'config') draft.value = [...selected.value]
    panel.value = kind
    sheet.value = kind
    await nextTick()
    // El CSS decide cuál se ve (popover en ≥ 1024, bottom sheet por debajo): se descarta el que quede oculto para no duplicar estado (como «En otros mercados»)
    const pop = document.querySelector('.ficha__chart-popover')
    if (pop && getComputedStyle(pop).display === 'none') panel.value = null
    else sheet.value = null
  }

  const load = (list) => {
    selected.value = list
    loading.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { drawn.value = [...list]; loading.value = false }, LOAD_MS)
  }
  const setIndicators = (list) => { if (!comparing.value) load(list) } // desktop: se aplica al marcar
  const saveDraft = () => { load([...draft.value]); close() } // mobile: «Guardar ajustes»

  const compare = (c) => {
    if (full.value) return
    const color = [2, 3, 4].find((k) => !compared.value.some((x) => x.color === k))
    compared.value = [...compared.value, { ...c, color }]
    visualization.value = 'line'
    clearTimeout(timer)
    loading.value = false
    selected.value = []
    drawn.value = []
    close()
  }
  const uncompare = (ticker) => { compared.value = compared.value.filter((c) => c.ticker !== ticker) }
  const toggleVisualization = () => { if (!comparing.value) visualization.value = visualization.value === 'line' ? 'candle' : 'line' }

  // Cierre al hacer clic fuera / Escape (los popovers viven junto a su chip: `.ficha__chart-anchor`)
  const onDocClick = (e) => { if (panel.value && !e.target.closest('.ficha__chart-anchor')) close() }
  const onKey = (e) => { if (e.key === 'Escape' && panel.value) { const k = panel.value; close(); document.querySelector(`.ficha__chart-anchor--${k} .r4-chip`)?.focus() } }
  onMounted(() => { document.addEventListener('click', onDocClick); document.addEventListener('keydown', onKey) })
  onBeforeUnmount(() => { document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey); clearTimeout(timer) })

  return { xLabels: computed(() => serie.value.xLabels), progress: computed(() => serie.value.progress), candles: computed(() => serie.value.candles), visualization, panel, sheet, query, compared, selected, draft, loading, comparing, full, dirty, chart, overlays, results, open, close, setIndicators, saveDraft, compare, uncompare, toggleVisualization }
}
