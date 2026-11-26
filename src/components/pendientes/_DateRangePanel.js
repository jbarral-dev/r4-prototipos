// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Selector de rango de fechas del filtro «Personalizado» de R4Table v2 (prueba de Jon, 2026-11-26). NO está en Figma como componente: compone dos R4InputText `type=datepicker` («Desde» y «Hasta») y, debajo, el calendario `_DatePicker Menu`
// con el rango pintado (`Active` en los extremos, `InRange` entre ellos).
// Interacción: al abrirse el foco está en «Desde». Al elegir una fecha en el calendario ese campo se rellena y el foco pasa a «Hasta» (todos los días siguen disponibles, salvo los futuros). Al elegir «Hasta» se emite `done` a los 100 ms; si la fecha elegida es anterior a «Desde», se intercambian (el rango queda de la más antigua a la más reciente).
// Pulsar un campo cambia el que se está eligiendo; volver a elegir «Desde» vacía «Hasta». Los campos son de solo lectura (no sale el teclado en móvil): se rellenan con el calendario.
// Props: modelValue = [desde, hasta] («dd/mm/aaaa» o ''), validate (campos vacíos en error: «La fecha es obligatoria»). Eventos: update:modelValue, done.
import { defineComponent, ref, computed, onMounted, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4InputText from './R4InputText.js'
import DatePickerMenu, { leerFecha } from './_DatePickerMenu.js'

export default defineComponent({
  name: '_DateRangePanel',
  components: { R4InputText, DatePickerMenu },
  props: { modelValue: { type: Array, default: () => ['', ''] }, validate: { type: Boolean, default: false } },
  emits: ['update:modelValue', 'done'],
  setup(props, { emit }) {
    const root = ref(null)
    const desde = computed(() => props.modelValue[0] || '')
    const hasta = computed(() => props.modelValue[1] || '')
    const activo = ref(desde.value && !hasta.value ? 1 : 0) // campo que se está eligiendo: 0 = Desde, 1 = Hasta
    const enfocar = (i) => { const c = root.value && root.value.querySelectorAll('.r4-daterange__fields input'); if (c && c[i]) c[i].focus({ preventScroll: true }) }
    onMounted(async () => { await nextTick(); enfocar(activo.value) })
    const onSelect = (fecha) => {
      if (activo.value === 0 || !desde.value) { // «Desde»: se vacía «Hasta» y el foco pasa a «Hasta»
        emit('update:modelValue', [fecha, ''])
        activo.value = 1
        nextTick(() => enfocar(1))
      } else { // «Hasta»: se cierra a los 100 ms; si es anterior a «Desde», se intercambian
        const d = leerFecha(desde.value); const h = leerFecha(fecha)
        emit('update:modelValue', d && h && h < d ? [fecha, desde.value] : [desde.value, fecha])
        setTimeout(() => emit('done'), 100)
      }
    }
    const error = (i) => (props.validate && !(i === 0 ? desde.value : hasta.value) ? 'La fecha es obligatoria' : undefined)
    return { root, desde, hasta, activo, onSelect, error }
  },
  template: `
    <div ref="root" class="r4-daterange">
      <div class="r4-daterange__fields">
        <R4InputText type="datepicker" required readonly :calendar="false" label="Desde" aria-label="Fecha desde" :model-value="desde" :status="error(0) ? 'Error' : 'Default'" :caption="error(0)" @focus="activo = 0" />
        <R4InputText type="datepicker" required readonly :calendar="false" label="Hasta" aria-label="Fecha hasta" :model-value="hasta" :status="error(1) ? 'Error' : 'Default'" :caption="error(1)" @focus="activo = 1" />
      </div>
      <DatePickerMenu inline model-value="" :range-start="desde" :range-end="hasta" @select="onSelect" />
    </div>
  `,
})
