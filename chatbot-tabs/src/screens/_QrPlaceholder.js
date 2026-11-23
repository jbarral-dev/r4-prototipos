// Datos de prototipo, NO es un componente del sistema de diseño: QR de ejemplo (no escaneable). El real lo genera backend.
import { defineComponent, computed } from '../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: '_QrPlaceholder',
  props: { size: { type: Number, default: 160 } },
  setup() {
    const n = 29
    const cells = computed(() => {
      let seed = 7
      const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
      const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)
      const out = []
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) out.push({ x, y })
      return out
    })
    const finders = [[0, 0], [n - 7, 0], [0, n - 7]]
    return { n, cells, finders }
  },
  template: `
    <svg class="qr-placeholder" :width="size" :height="size" :viewBox="'0 0 ' + n + ' ' + n" role="img" aria-label="Código QR de ejemplo" shape-rendering="crispEdges">
      <rect :width="n" :height="n" fill="#fff" />
      <rect v-for="c in cells" :key="c.x + '-' + c.y" :x="c.x" :y="c.y" width="1" height="1" fill="#000" />
      <g v-for="f in finders" :key="f[0] + '-' + f[1]">
        <rect :x="f[0]" :y="f[1]" width="7" height="7" fill="#000" />
        <rect :x="f[0] + 1" :y="f[1] + 1" width="5" height="5" fill="#fff" />
        <rect :x="f[0] + 2" :y="f[1] + 2" width="3" height="3" fill="#000" />
      </g>
    </svg>
  `,
})
