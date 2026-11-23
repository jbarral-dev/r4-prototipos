// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Contenido adhoc de Figma del popover (desktop, R4Popover wider 480; 2813:74891 y 2813:75024) y del R4Sheet (mobile, «Comparar valores»; 2816:99285 y 2816:99329) para comparar valores en el
// gráfico: R4InputSearch + (sin búsqueda) estado vacío «Busca valores» o (con ≥ 2 caracteres) lista de `searchResultItem` con el diseño con mercado (_SearchResultItem). No es un componente del catálogo.
// Props: modelValue (texto buscado; v-model), results ({ name, ticker, isin, market, marketFlag, type, logoText }[], ya filtrados por quien lo usa), placeholder, minChars (por defecto 2) y
// emptyTitle / emptyText. Eventos: `select` (el resultado elegido) y `close` (× del buscador o Escape). Con la búsqueda sin coincidencias se muestra el mismo bloque con «Sin resultados»
// (INFERIDO: Figma no tiene ese estado).
// Accesibilidad: R4InputSearch (role=search, aria-label); la lista es un <ul> de resultados con un único elemento interactivo por fila (el nombre); `aria-live="polite"` en el estado vacío / sin resultados.
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4InputSearch from './R4InputSearch.js'
import _SearchResultItem from './_SearchResultItem.js'
import R4SearchResults from './R4SearchResults.js'

export default defineComponent({
  name: '_ChartComparePanel',
  components: { Icon, R4InputSearch, R4SearchResults, SearchResultItem: _SearchResultItem },
  props: {
    modelValue: { type: String, default: '' },
    results: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Nombre, ticker o ISIN...' },
    minChars: { type: Number, default: 2 },
    emptyTitle: { type: String, default: 'Busca valores' },
    emptyText: { type: String, default: 'Escribe al menos 2 caracteres para buscar por nombre del valor, ticker o ISIN.' },
  },
  emits: ['update:modelValue', 'select', 'close'],
  setup(props, { emit }) {
    const q = computed(() => props.modelValue.trim())
    const state = computed(() => (q.value.length < props.minChars ? 'empty' : props.results.length ? 'results' : 'none'))
    const pick = (r, e) => { e.preventDefault(); emit("select", r) }
    return { state, pick }
  },
  template: `
    <div class="r4-comparepanel">
      <R4InputSearch :model-value="modelValue" :placeholder="placeholder" aria-label="Buscar valor para comparar" @update:model-value="$emit('update:modelValue', $event)" @close="$emit('close')" />
      <R4SearchResults v-if="state === 'results'" class="r4-comparepanel__results" aria-label="Resultados de la búsqueda">
        <SearchResultItem v-for="(r, i) in results" :key="r.ticker" :name="r.name" :logo-src="r.logoSrc" :logo-text="r.logoText" :metadata2="r.isin" :market="r.market" :market-flag="r.marketFlag"
                          :type="r.type" :highlight="modelValue" :show-divider="i < results.length - 1" @select="pick(r, $event)" />
      </R4SearchResults>
      <div v-else class="r4-comparepanel__empty" aria-live="polite">
        <Icon v-if="state === 'empty'" class="r4-comparepanel__empty-icon" name="ic-search" />
        <div class="r4-comparepanel__empty-texts">
          <p class="r4-comparepanel__empty-title">{{ state === 'empty' ? emptyTitle : 'Sin resultados' }}</p>
          <p class="r4-comparepanel__empty-text">{{ state === 'empty' ? emptyText : 'No hay ningún valor que coincida con «' + modelValue.trim() + '».' }}</p>
        </div>
      </div>
    </div>
  `,
})
