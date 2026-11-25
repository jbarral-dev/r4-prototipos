// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de `searchResultItem` (hijo de R4SearchResults, el contenedor es R4SearchResults.js): resultado de búsqueda con mercado, SIN precio (buscador unificado y comparar valores del gráfico).
// No es un componente del catálogo ni tiene página: solo el patrón «Búsqueda y selección de elementos» (Confluence 3950968833), que habla de buscadores y de mostrar los no disponibles con su motivo.
// Diseño con mercado (se leyó en Figma "Proyectos - Fichas de Productos" 1117:20355 —variantes size small | large × interaction default | hover— y en la lista de resultados de "Proyectos - Contratar" 10083:12582).
// El diseño «con precio» (derivados y «En otros mercados» de la ficha) YA NO está aquí: pasó a R4ProductList / productItem (2026-11-14), un componente distinto. Props del componente de Figma: name, logoText*, metadata1, metadata2, market, marketFlag (nombre de icono de bandera), type (texto de la
//    etiqueta; showType = hay type), showDivider (por defecto true) — más `highlight` (texto buscado: la coincidencia del nombre va en text/search-highlight, SemiBold).
//    size small | large NO es prop: lo resuelve el CSS por el ancho de la propia fila (container query): large (una línea: logo 28 · nombre · ISIN · mercado · etiqueta) a partir de 480 px;
//    small (dos líneas: nombre y «metadata1 · metadata2» a la izquierda; mercado y etiqueta a la derecha). interaction hover lo resuelve el CSS. En large Figma solo muestra metadata2.
//    `logoSrc` (URL del iso-* del recurso «Resources - Logos») y `logoText` son EXTRAS del prototipo: el _Logo de Figma es una instancia de imagen; si no hay logo se pinta el pseudocomponente ProductDefaultLogo (_ProductDefaultLogo.js, Figma 10648:1455: cuadrado sobre surface/muted con la inicial), con la letra de la variante extraSmall y el mismo cuadrado que el logo (28 / 32 px) para alinear las filas.
// ACTUALIZADO (Figma 1117:20355, tamaños): medium = el antiguo «small» (fila de 56-60, logo 32, columna izquierda nombre + metadatos, derecha mercado con bandera + etiqueta) y small = versión COMPACTA nueva (sin logo, nombre 16/24 y una línea
//    «metadata1 · metadata2 · mercado» en body/xs muted; a la derecha solo la etiqueta); large mantiene su estructura (logo 32 ahora, antes 28). La prop `size` es del prototipo: sin ella manda la anchura (container query).
// Interactividad (CLAUDE.md: un solo elemento interactivo): el nombre es el <a> y se estira con ::after para que toda la fila sea clicable; la acción de mobile queda por encima.
// NO reconstruido: showBuyButton en el diseño con mercado (el botón «Comprar» del hover en large está oculto en Figma).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Tag from './R4Tag.js'
import ProductDefaultLogo from './_ProductDefaultLogo.js'

const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default defineComponent({
  name: '_SearchResultItem',
  components: { Icon, R4Tag, ProductDefaultLogo },
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
    size: { type: String, default: undefined, validator: (v) => ['large', 'medium', 'small'].includes(v) }, // Figma 1117:20355: large · medium (antes «small») · small (compacta, sin logo). Sin `size`: automático por la anchura de la fila (large ≥ 480, si no medium)
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
    const small = computed(() => props.size === 'small')
    // small: una sola línea de metadatos con «metadata1 · metadata2 · mercado» (mercado solo texto, sin bandera) y, a la derecha, solo la etiqueta
    const subItems = computed(() => [props.metadata1, props.metadata2, small.value ? props.market : undefined].filter(Boolean))
    return { rich, parts, small, subItems }
  },
  template: `
    <li class="r4-searchresult" :class="[{ 'r4-searchresult--rich': rich, 'has-divider': rich && showDivider }, size ? 'r4-searchresult--' + size : 'r4-searchresult--auto']">
      <img v-if="logoSrc && !small" class="r4-searchresult__logo r4-searchresult__logo--img" :src="logoSrc" alt="" />
      <ProductDefaultLogo v-else-if="logoText && !small && !logoSrc" class="r4-searchresult__logo r4-searchresult__logo--default" size="extraSmall" :name="logoText" />
      <div class="r4-searchresult__content">
        <div class="r4-searchresult__left">
          <a class="r4-searchresult__name" :href="href" @click="$emit('select', $event)"><template v-for="(p, i) in parts" :key="i"><span v-if="p.hl" class="r4-searchresult__hl">{{ p.t }}</span><template v-else>{{ p.t }}</template></template></a>
          <span v-if="rich && subItems.length" class="r4-searchresult__sub"><template v-for="(t, i) in subItems" :key="i"><span v-if="i" aria-hidden="true">·</span><span>{{ t }}</span></template></span>
        </div>
        <div v-if="rich && (small ? type : (metadata2 || market || type))" class="r4-searchresult__info">
          <span v-if="metadata2 && !small" class="r4-searchresult__id">{{ metadata2 }}</span>
          <span v-if="market && !small" class="r4-searchresult__market"><Icon v-if="marketFlag" :name="marketFlag" /><span>{{ market }}</span></span>
          <R4Tag v-if="type" color="blue" size="small" :text="type" />
        </div>
      </div>
    </li>
  `,
})
