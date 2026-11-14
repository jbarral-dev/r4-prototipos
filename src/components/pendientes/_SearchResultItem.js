// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de `searchResultItem` (hijo de R4SearchResults, el contenedor es R4SearchResults.js): resultado de búsqueda con mercado, SIN precio (buscador unificado y comparar valores del gráfico).
// No es un componente del catálogo ni tiene página: solo el patrón «Búsqueda y selección de elementos» (Confluence 3950968833), que habla de buscadores y de mostrar los no disponibles con su motivo.
// Diseño con mercado (se leyó en Figma "Proyectos - Fichas de Productos" 1117:20355 —variantes size small | large × interaction default | hover— y en la lista de resultados de "Proyectos - Contratar" 10083:12582).
// El diseño «con precio» (derivados y «En otros mercados» de la ficha) YA NO está aquí: pasó a R4ProductList / productItem (2026-11-14), un componente distinto. Props del componente de Figma: name, logoText*, metadata1, metadata2, market, marketFlag (nombre de icono de bandera), type (texto de la
//    etiqueta; showType = hay type), showDivider (por defecto true) — más `highlight` (texto buscado: la coincidencia del nombre va en text/search-highlight, SemiBold).
//    size small | large NO es prop: lo resuelve el CSS por el ancho de la propia fila (container query): large (una línea: logo 28 · nombre · ISIN · mercado · etiqueta) a partir de 480 px;
//    small (dos líneas: nombre y «metadata1 · metadata2» a la izquierda; mercado y etiqueta a la derecha). interaction hover lo resuelve el CSS. En large Figma solo muestra metadata2.
//    `logoSrc` (URL del iso-* del recurso «Resources - Logos») y `logoText` son EXTRAS del prototipo: el _Logo de Figma es una instancia de imagen; si no hay logo en el recurso se pinta una ficha oscura con la inicial.
// Interactividad (CLAUDE.md: un solo elemento interactivo): el nombre es el <a> y se estira con ::after para que toda la fila sea clicable; la acción de mobile queda por encima.
// NO reconstruido: showBuyButton en el diseño con mercado (el botón «Comprar» del hover en large está oculto en Figma).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Tag from './R4Tag.js'

const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default defineComponent({
  name: '_SearchResultItem',
  components: { Icon, R4Tag },
  props: {
    logoSrc: { type: String, default: undefined }, // URL del logo (recurso «Resources - Logos», iso-*)
    logoText: { type: String, default: undefined },
    name: { type: String, required: true },
    metadata1: { type: String, default: undefined },
    metadata2: { type: String, default: undefined },
    market: { type: String, default: undefined },
    marketFlag: { type: String, default: undefined },
    type: { type: String, default: undefined },
    showDivider: { type: Boolean, default: true },
    highlight: { type: String, default: '' },
    href: { type: String, default: '#' },
  },
  emits: ['select'],
  setup(props) {
    const rich = computed(() => !!(props.type || props.market || props.metadata2 || props.logoText || props.logoSrc))
    // Coincidencia sin acentos ni mayúsculas: se resalta la consulta completa o, si no está, la palabra más larga que aparezca
    const parts = computed(() => {
      const n = props.name
      const hay = plain(n)
      const q = plain(props.highlight.trim())
      if (!q) return [{ t: n }]
      const tokens = [q, ...q.split(/\s+/).sort((a, b) => b.length - a.length)].filter((t) => t.length > 1)
      for (const t of tokens) {
        const i = hay.indexOf(t)
        if (i >= 0) return [{ t: n.slice(0, i) }, { t: n.slice(i, i + t.length), hl: true }, { t: n.slice(i + t.length) }].filter((p) => p.t)
      }
      return [{ t: n }]
    })
    return { rich, parts }
  },
  template: `
    <li class="r4-searchresult" :class="{ 'r4-searchresult--rich': rich, 'has-divider': rich && showDivider }">
      <img v-if="logoSrc" class="r4-searchresult__logo r4-searchresult__logo--img" :src="logoSrc" alt="" />
      <span v-else-if="logoText" class="r4-searchresult__logo r4-searchresult__logo--tile" aria-hidden="true">{{ logoText }}</span>
      <div class="r4-searchresult__content">
        <div class="r4-searchresult__left">
          <a class="r4-searchresult__name" :href="href" @click="$emit('select', $event)"><template v-for="(p, i) in parts" :key="i"><span v-if="p.hl" class="r4-searchresult__hl">{{ p.t }}</span><template v-else>{{ p.t }}</template></template></a>
          <span v-if="rich && (metadata1 || metadata2)" class="r4-searchresult__sub"><span v-if="metadata1">{{ metadata1 }}</span><span v-if="metadata1 && metadata2" aria-hidden="true">·</span><span v-if="metadata2">{{ metadata2 }}</span></span>
        </div>
        <div v-if="rich && (metadata2 || market || type)" class="r4-searchresult__info">
          <span v-if="metadata2" class="r4-searchresult__id">{{ metadata2 }}</span>
          <span v-if="market" class="r4-searchresult__market"><Icon v-if="marketFlag" :name="marketFlag" /><span>{{ market }}</span></span>
          <R4Tag v-if="type" color="blue" size="small" :text="type" />
        </div>
      </div>
    </li>
  `,
})
