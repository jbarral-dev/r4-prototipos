// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Selector de rango de fechas del filtro «Personalizado» de R4Table v2 (prueba de Jon, 2026-11-27). NO está en Figma como componente: compone dos R4InputText `type=datepicker` («Desde» y «Hasta») y, debajo, el calendario `_DatePicker Menu`.
// Por pasos: al abrirse solo se ven los campos (vacíos: es un proceso nuevo cada vez). Pulsar un campo muestra el calendario debajo; al elegir una fecha el calendario se oculta y el campo se rellena. Al elegir «Hasta» los días anteriores a «Desde» van en `Disabled`.
// Con las dos fechas elegidas se emite `update:modelValue` ([desde, hasta]) y, a los 100 ms, `done`. Si se elige «Desde» posterior a una «Hasta» ya puesta, esta se vacía. Los campos son de solo lectura (no sale el teclado en móvil): se abren con clic, Enter o Espacio.
// Escape con el calendario visible lo oculta (sin cerrar lo que haya debajo). Props: validate (campos vacíos en error: «La fecha es obligatoria»). Eventos: update:modelValue, done.
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4InputText from './R4InputText.js'
import DatePickerMenu, { leerFecha } from './_DatePickerMenu.js'

export default defineComponent({
  name: '_DateRangePanel',
  components: { R4InputText, DatePickerMenu },
  props: { validate: { type: Boolean, default: false } },
  emits: ['update:modelValue', 'done'],
  setup(props, { emit }) {
    const root = ref(null)
    const desde = ref('')
    const hasta = ref('')
    const abierto = ref(null) // campo cuyo calendario se ve: null | 0 (Desde) | 1 (Hasta)
    const campo = (i) => root.value && root.value.querySelectorAll('.r4-daterange__fields input')[i]
    const enfocar = (i) => { const c = campo(i); if (c) c.focus({ preventScroll: true }) }
    onMounted(async () => { await nextTick(); enfocar(0) })
    const abrir = (i) => { abierto.value = abierto.value === i ? null : i }
    const completar = () => {
      if (desde.value && hasta.value) { emit('update:modelValue', [desde.value, hasta.value]); setTimeout(() => emit('done'), 100) }
    }
    const onSelect = (fecha) => {
      const i = abierto.value
      abierto.value = null
      if (i === 0) {
        desde.value = fecha
        const d = leerFecha(fecha); const h = leerFecha(hasta.value)
        if (h && d && h < d) hasta.value = ''
        nextTick(() => enfocar(0))
      } else {
        hasta.value = fecha
        nextTick(() => enfocar(1))
      }
      completar()
    }
    const error = (i) => (props.validate && !(i === 0 ? desde.value : hasta.value) ? 'La fecha es obligatoria' : undefined)
    const onKey = (e) => { if (e.key === 'Escape' && abierto.value !== null) { e.stopPropagation(); const i = abierto.value; abierto.value = null; nextTick(() => enfocar(i)) } }
    onMounted(() => document.addEventListener('keydown', onKey, true))
    onBeforeUnmount(() => document.removeEventListener('keydown', onKey, true))
    return { root, desde, hasta, abierto, abrir, onSelect, error }
  },
  template: `
    <div ref="root" class="r4-daterange">
      <div class="r4-daterange__fields">
        <div class="r4-daterange__field" @click="abrir(0)" @keydown.enter.prevent="abrir(0)" @keydown.space.prevent="abrir(0)">
          <R4InputText type="datepicker" required readonly :calendar="false" label="Desde" aria-label="Fecha desde" :model-value="desde" :status="error(0) ? 'Error' : 'Default'" :caption="error(0)" />
        </div>
        <div class="r4-daterange__field" @click="abrir(1)" @keydown.enter.prevent="abrir(1)" @keydown.space.prevent="abrir(1)">
          <R4InputText type="datepicker" required readonly :calendar="false" label="Hasta" aria-label="Fecha hasta" :model-value="hasta" :status="error(1) ? 'Error' : 'Default'" :caption="error(1)" />
        </div>
      </div>
      <DatePickerMenu v-if="abierto !== null" inline model-value="" :range-start="desde" :range-end="hasta" :min-date="abierto === 1 ? desde : ''" @select="onSelect" />
    </div>
  `,
})
