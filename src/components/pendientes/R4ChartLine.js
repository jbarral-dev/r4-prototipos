// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4ChartLine (Específicos; no aparece en el catálogo; Confluence R4ChartLine 3512008717, de feb 2026, actualizada oct 2026, NO tiene tabla de API).
// Figma/Confluence: Interaction (default | hover), mediaQuery, Timeline (periods | today), visualization (line | candle) y, en "Proyectos - Fichas de Productos", la fila "Chart Configuration" con R4Chip
// y R4SegmentedControls sobre el gráfico. Aquí:
// - mediaQuery NO existe en código (decisión de Jon): lo resuelve el CSS por el ancho del contenedor `r4page` (alturas, separaciones, tamaño del selector de periodos y de los chips,
//   etiquetas del eje X —en mobile solo las de las horas pares— y etiquetas abreviadas de los periodos).
// - Sin tabla de API → props deducidas de Figma + datos que en producción vendrían de backend (extras del prototipo, avisados):
//   timeline ('today' | 'periods'), points (valores de la serie), domain, yLabels (de arriba a abajo), xLabels, progress (fracción del ancho que ocupa la serie, 0–1),
//   periods ({ label, shortLabel, value }[]) y selectedPeriod. Evento `period` (value).
//   visualization ('line' | 'candle') con `candles` ({ o, h, l, c }[]); compareSeries ({ id, points, color 2–4 }[]: las series que se comparan con la principal, que es la 1; con ellas desaparece el área);
//   overlays (indicadores: { id, type: 'line' | 'band' | 'bars' | 'markers', ... } ver más abajo); loading (muestra un R4Spinner sobre el gráfico).
// - Los controles de la fila superior son slots (Figma: están dentro del componente): `filters` (R4Chip a la izquierda), `visualization` (selector de tipo de gráfico a la derecha) y `comparing`
//   (fila de chips de las series comparadas, debajo). Quien lo usa decide qué hay y gestiona sus popovers/sheets; el gráfico solo los dispone (gap 16 entre grupos, 20 hasta la fila de series).
// - Overlays: { type: 'line', points, tone: 'average-1' | 'average-2' | 'average-3', span?: [0–1, 0–1] } (recta o curva a lo ancho, valores en el mismo dominio) ·
//   { type: 'band', upper, lower, tone, span? } (banda con relleno y bordes discontinuos) · { type: 'bars', values (0–1) } (barras al pie, p. ej. volumen) ·
//   { type: 'markers', at: índices de la serie principal } (puntos sobre la línea, p. ej. dividendos). Colores: chart/average/* (Theme) y chart/series/*; el Figma solo diseña la media móvil
//   (línea recta verde oscura de punta a punta), el resto de overlays es INTERPRETACIÓN del prototipo.
// - Desktop y mobile usan el R4SegmentedControls de Figma: large (48) en desktop, medium (40) en mobile (se gobierna con --r4-segmented-height).
// Reconstruido: estado Interaction=default con el indicador en el último punto de cada serie, líneas y velas. NO reconstruido: Interaction=hover (tooltip con valores y línea de seguimiento),
// la serie de "Entradas/Salidas" ni la leyenda (de la variante de patrimonio de la doc), Timeline=periods con etiquetas de meses, los estados singlePoint y error.
// Hover/toque estilo Coinbase (props pointLabels, valueFormat, seriesNames): ver el comentario del bloque Hover en setup.
// Al cargar y al cambiar de visualización, de series o de periodo, la serie se dibuja de izquierda a derecha y el punto indicador recorre la línea hasta el último dato (JS con requestAnimationFrame, 1,4 s;
// sin animación con prefers-reduced-motion).
// El gráfico es informativo: role="img" con aria-label; los datos exactos deberían ofrecerse también como texto (pendiente de accesibilidad en la doc).
import { defineComponent, computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import R4SegmentedControls from './R4SegmentedControls.js'
import R4Spinner from './R4Spinner.js'
import R4Popover from './R4Popover.js'

let uid = 0

export default defineComponent({
  name: 'R4ChartLine',
  components: { R4SegmentedControls, R4Spinner, R4Popover },
  props: {
    timeline: { type: String, default: 'today', validator: (v) => ['today', 'periods'].includes(v) },
    points: { type: Array, required: true },
    yLabels: { type: Array, required: true },
    xLabels: { type: Array, required: true },
    progress: { type: Number, default: 1 },
    periods: { type: Array, default: () => [] },
    selectedPeriod: { type: String, default: undefined },
    ariaLabel: { type: String, default: undefined },
    domain: { type: Array, default: undefined }, // [mín, máx] de los valores; por defecto los de las series
    visualization: { type: String, default: 'line', validator: (v) => ['line', 'candle'].includes(v) },
    candles: { type: Array, default: () => [] },
    compareSeries: { type: Array, default: () => [] },
    overlays: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    loadingLabel: { type: String, default: 'Cargando datos del gráfico' },
    // Hover (estilo Coinbase; extras del prototipo): fecha y hora de cada punto, formato del valor y nombre de cada serie para el popover.
    pointLabels: { type: Array, default: () => [] }, // { date, time? }[] alineado con `points`
    valueFormat: { type: Function, default: (v) => String(v) },
    seriesNames: { type: Object, default: () => ({}) }, // id de serie → nombre (se muestra cuando hay más de una serie)
  },
  emits: ['period'],
  setup(props, { slots }) {
    const gradientId = `r4-chartline-area-${++uid}`
    const series = computed(() => [{ id: 'main', points: props.points, color: 1 }, ...props.compareSeries.map((s, i) => ({ ...s, color: s.color || i + 2 }))])
    const range = computed(() => {
      if (props.domain) return props.domain
      const all = series.value.flatMap((s) => s.points)
      return [Math.min(...all), Math.max(...all)]
    })
    // Coordenadas normalizadas 0–100 (el SVG se estira con preserveAspectRatio="none"; el trazo es vector-effect: non-scaling-stroke).
    const yOf = (v) => 100 - ((v - range.value[0]) / (range.value[1] - range.value[0] || 1)) * 100
    const path = (xs, ys) => xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${ys[i].toFixed(2)}`).join(' ')
    const geometry = computed(() => series.value.map((s) => {
      const n = s.points.length
      const xs = s.points.map((_, i) => (n > 1 ? (i / (n - 1)) * props.progress * 100 : 0))
      const ys = s.points.map(yOf)
      const line = path(xs, ys)
      return { id: s.id, color: s.color, line, area: `${line} L${xs[n - 1].toFixed(2)} 100 L0 100 Z`, xs, ys, last: { x: xs[n - 1], y: ys[n - 1] } }
    }))
    const main = computed(() => geometry.value[0])
    const showArea = computed(() => props.compareSeries.length === 0)

    // Velas: una cada (progress / n) del ancho, centradas en su ranura.
    const candleBoxes = computed(() => {
      const n = props.candles.length
      return props.candles.map((c, i) => {
        const x = ((i + 0.5) / n) * props.progress * 100
        const yh = yOf(c.h), yl = yOf(c.l), yo = yOf(c.o), yc = yOf(c.c)
        return { x, up: c.c >= c.o, wickTop: yh, wickH: Math.max(0, yl - yh), bodyTop: Math.min(yo, yc), bodyH: Math.max(0.6, Math.abs(yc - yo)) }
      })
    })

    // Overlays (indicadores)
    const ovGeometry = computed(() => props.overlays.map((o, k) => {
      const [s0, s1] = o.span || [0, 1]
      const xsOf = (arr) => arr.map((_, i) => (arr.length > 1 ? s0 + (i / (arr.length - 1)) * (s1 - s0) : s0) * 100)
      if (o.type === 'line') { const xs = xsOf(o.points); return { ...o, k, d: path(xs, o.points.map(yOf)) } }
      if (o.type === 'band') {
        const xs = xsOf(o.upper)
        const up = o.upper.map(yOf), lo = o.lower.map(yOf)
        const back = xs.map((x, i) => `L${x.toFixed(2)} ${lo[i].toFixed(2)}`).reverse().join(' ')
        return { ...o, k, dUpper: path(xs, up), dLower: path(xs, lo), dArea: `${path(xs, up)} ${back} Z` }
      }
      if (o.type === 'bars') {
        const m = o.values.length
        return { ...o, k, bars: o.values.map((v, i) => ({ x: ((i + 0.5) / m) * props.progress * 100, h: v * 20 })), w: (props.progress * 100 / m) * 0.5 }
      }
      if (o.type === 'markers') return { ...o, k, dots: o.at.map((i) => ({ x: main.value.xs[i], y: main.value.ys[i] })) }
      return { ...o, k }
    }))

    // Animación de carga de izquierda a derecha: `reveal` (0 → 1) avanza por el trazo; los puntos recorren las líneas (interpolando entre vértices) y todo se descubre detrás.
    const reveal = ref(0)
    let raf = 0
    const play = () => {
      cancelAnimationFrame(raf)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { reveal.value = 1; return }
      reveal.value = 0
      const start = performance.now()
      const duration = 1400
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration)
        reveal.value = 1 - Math.pow(1 - t, 3) // ease-out
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    onMounted(play)
    watch(() => [props.visualization, props.compareSeries.length, props.points], play) // también al cambiar de periodo (otra serie)
    onBeforeUnmount(() => cancelAnimationFrame(raf))

    const headX = computed(() => reveal.value * main.value.last.x)
    const yAt = (g, x) => {
      const { xs, ys, last } = g
      let i = 1
      while (i < xs.length - 1 && xs[i] < x) i++
      const span = xs[i] - xs[i - 1] || 1
      return xs.length > 1 ? ys[i - 1] + ((ys[i] - ys[i - 1]) * Math.min(1, Math.max(0, (x - xs[i - 1]) / span))) : last.y
    }
    const heads = computed(() => geometry.value.map((g) => ({ id: g.id, color: g.color, y: yAt(g, headX.value) })))
    const lineTop = computed(() => Math.min(...heads.value.map((h) => h.y)))
    const revealStyle = computed(() => (reveal.value >= 1 ? undefined : { clipPath: `inset(0 ${(100 - headX.value).toFixed(2)}% 0 0)` }))
    // Hover / toque (Coinbase): línea vertical en el punto más cercano al puntero, la parte derecha de la serie se atenúa y un R4Popover (valor, fecha y hora) queda SIEMPRE arriba del gráfico,
    // sobre la línea. En mobile aparece al pulsar el gráfico y sigue al dedo mientras se arrastra (touch-action: pan-y deja el scroll vertical); al soltar se oculta. También con teclado
    // (flechas, Inicio y Fin con el gráfico enfocado). Solo en visualización de líneas.
    const plotEl = ref(null)
    const tipEl = ref(null)
    const hoverIndex = ref(null)
    const tipLeft = ref(0)
    const canHover = computed(() => props.visualization === 'line' && props.pointLabels.length === props.points.length && props.points.length > 1 && !props.loading)
    const hover = computed(() => {
      const i = hoverIndex.value
      if (i === null || !canHover.value || i >= props.points.length) return null
      const label = props.pointLabels[i]
      const rows = geometry.value.map((g, k) => ({ id: g.id, color: g.color, y: g.ys[i], value: props.valueFormat(series.value[k].points[i], g.id), name: props.seriesNames[g.id] }))
      return { i, x: geometry.value[0].xs[i], label, rows }
    })
    const place = () => {
      const plot = plotEl.value
      if (!plot || !hover.value) return
      const w = tipEl.value ? tipEl.value.offsetWidth : 0
      const px = (hover.value.x / 100) * plot.clientWidth
      tipLeft.value = Math.max(0, Math.min(px - w / 2, plot.clientWidth - w))
    }
    const setFromEvent = (e) => {
      const plot = plotEl.value
      if (!plot || !canHover.value) return
      const r = plot.getBoundingClientRect()
      const f = (e.clientX - r.left) / r.width / (props.progress || 1)
      hoverIndex.value = Math.round(Math.min(1, Math.max(0, f)) * (props.points.length - 1))
      nextTick(place)
    }
    const onDown = (e) => { if (e.pointerType === 'touch') { try { e.currentTarget.setPointerCapture(e.pointerId) } catch (err) { /* sin captura */ } setFromEvent(e) } }
    const onMove = (e) => { if (e.pointerType !== 'touch' || e.pressure > 0 || e.buttons) setFromEvent(e) }
    const onEnd = () => { hoverIndex.value = null }
    const onKeydown = (e) => {
      const n = props.points.length
      const k = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity }[e.key]
      if (k === undefined || !canHover.value) return
      e.preventDefault()
      const cur = hoverIndex.value === null ? n - 1 : hoverIndex.value
      hoverIndex.value = k === -Infinity ? 0 : k === Infinity ? n - 1 : Math.min(n - 1, Math.max(0, cur + k))
      nextTick(place)
    }
    const liveText = computed(() => (hover.value ? `${hover.value.rows.map((r) => (r.name ? r.name + ' ' : '') + r.value).join(', ')}, ${hover.value.label.date}${hover.value.label.time ? ', ' + hover.value.label.time : ''}` : ''))
    watch(() => [props.points, props.visualization, props.loading], () => { hoverIndex.value = null })
    const hasToolbar = computed(() => !!(slots.filters || slots.visualization))
    return { plotEl, tipEl, hover, tipLeft, onDown, onMove, onEnd, onKeydown, liveText, gradientId, geometry, showArea, candleBoxes, ovGeometry, headX, heads, lineTop, revealStyle, hasToolbar }
  },
  template: `
    <div class="r4-chartline">
      <div v-if="hasToolbar || $slots.comparing" class="r4-chartline__top">
        <div v-if="hasToolbar" class="r4-chartline__toolbar">
          <div class="r4-chartline__filters"><slot name="filters" /></div>
          <div class="r4-chartline__visualization"><slot name="visualization" /></div>
        </div>
        <slot name="comparing" />
      </div>
      <div class="r4-chartline__chart" role="img" :aria-label="ariaLabel" :tabindex="pointLabels.length ? 0 : undefined" @keydown="onKeydown" @blur="onEnd">
        <div class="r4-chartline__y" aria-hidden="true"><span v-for="(l, i) in yLabels" :key="i">{{ l }}</span></div>
        <div class="r4-chartline__plot-col">
          <div ref="plotEl" class="r4-chartline__plot" :class="{ 'is-hovering': hover }" aria-hidden="true" @pointerdown="onDown" @pointermove="onMove" @pointerup="onEnd" @pointercancel="onEnd" @pointerleave="onEnd">
            <div class="r4-chartline__reveal" :style="revealStyle">
              <svg class="r4-chartline__svg" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                <defs>
                  <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" class="r4-chartline__stop-top" />
                    <stop offset="1" class="r4-chartline__stop-bottom" />
                  </linearGradient>
                </defs>
                <path v-if="visualization === 'line' && showArea" class="r4-chartline__area" :d="geometry[0].area" :fill="'url(#' + gradientId + ')'" />
                <template v-for="o in ovGeometry" :key="o.k">
                  <g v-if="o.type === 'band'" :class="'r4-chartline__ov r4-chartline__ov--' + o.tone">
                    <path class="r4-chartline__ov-area" :d="o.dArea" /><path class="r4-chartline__ov-line r4-chartline__ov-line--dashed" :d="o.dUpper" /><path class="r4-chartline__ov-line r4-chartline__ov-line--dashed" :d="o.dLower" />
                  </g>
                  <path v-else-if="o.type === 'line'" :class="'r4-chartline__ov r4-chartline__ov-line r4-chartline__ov--' + o.tone" :d="o.d" />
                </template>
                <template v-if="visualization === 'line'">
                  <path v-for="g in geometry" :key="g.id" class="r4-chartline__line" :class="'r4-chartline__s--' + g.color" :d="g.line" />
                </template>
              </svg>
              <template v-for="o in ovGeometry" :key="'h' + o.k">
                <template v-if="o.type === 'bars'"><span v-for="(b, i) in o.bars" :key="i" class="r4-chartline__bar" :style="{ left: b.x + '%', height: b.h + '%', width: o.w + '%' }"></span></template>
                <template v-else-if="o.type === 'markers' && visualization === 'line'"><span v-for="(d, i) in o.dots" :key="i" class="r4-chartline__marker" :style="{ left: d.x + '%', top: d.y + '%' }"></span></template>
              </template>
              <template v-if="visualization === 'candle'">
                <span v-for="(c, i) in candleBoxes" :key="i" class="r4-chartline__candle" :class="c.up ? 'is-up' : 'is-down'" :style="{ left: c.x + '%' }">
                  <span class="r4-chartline__wick" :style="{ top: c.wickTop + '%', height: c.wickH + '%' }"></span>
                  <span class="r4-chartline__body" :style="{ top: c.bodyTop + '%', height: c.bodyH + '%' }"></span>
                </span>
              </template>
            </div>
            <div v-if="hover" class="r4-chartline__dim" :style="{ left: hover.x + '%' }"></div>
            <div v-if="hover" class="r4-chartline__hover" :style="{ left: hover.x + '%' }">
              <span v-for="r in hover.rows" :key="r.id" class="r4-chartline__indicator-dot" :class="'r4-chartline__s--' + r.color" :style="{ '--r4-dot-y': r.y }"></span>
            </div>
            <div v-if="visualization === 'line'" class="r4-chartline__indicator" :style="{ left: headX + '%', '--r4-y': lineTop }">
              <span v-for="h in heads" :key="h.id" class="r4-chartline__indicator-dot" :class="'r4-chartline__s--' + h.color" :style="{ '--r4-dot-y': h.y }"></span>
            </div>
            <div v-if="loading" class="r4-chartline__loading"><R4Spinner size="medium" :aria-label="loadingLabel" /></div>
          </div>
          <div v-if="hover" ref="tipEl" class="r4-chartline__tip" :style="{ left: tipLeft + 'px' }">
            <R4Popover width="narrow" density="none">
              <div class="r4-chartline__tip-body">
                <p v-if="hover.rows.length === 1" class="r4-chartline__tip-value">{{ hover.rows[0].value }}</p>
                <template v-else><p v-for="r in hover.rows" :key="r.id" class="r4-chartline__tip-row"><span class="r4-chartline__tip-dot" :class="'r4-chartline__s--' + r.color"></span><span class="r4-chartline__tip-name">{{ r.name }}</span><span class="r4-chartline__tip-value">{{ r.value }}</span></p></template>
                <p class="r4-chartline__tip-meta">{{ hover.label.date }}</p>
                <p v-if="hover.label.time" class="r4-chartline__tip-meta">{{ hover.label.time }}</p>
              </div>
            </R4Popover>
          </div>
          <p class="r4-chartline__live" aria-live="polite">{{ liveText }}</p>
          <div class="r4-chartline__x" aria-hidden="true"><span v-for="(l, i) in xLabels" :key="i">{{ l }}</span></div>
        </div>
      </div>
      <R4SegmentedControls v-if="periods.length" class="r4-chartline__periods" size="large" :items="periods" :selected-value="selectedPeriod" aria-label="Periodo del gráfico" @select="$emit('period', $event)" />
    </div>
  `,
})
