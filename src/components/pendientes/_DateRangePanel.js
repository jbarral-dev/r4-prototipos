// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Selector de rango de fechas del filtro «Personalizado» de R4Table v2 (prueba de Jon, 2026-11-27). NO está en Figma como componente: compone dos R4InputText `type=datepicker` («Desde» y «Hasta») y, debajo, el calendario `_DatePicker Menu`, siempre visible.
// Interacción (Jon, 2026-11-28): sin pulsar ningún campo, el 1.er clic en el calendario rellena «Desde» y el 2.º «Hasta» (los días anteriores a «Desde» van en `Disabled`); con los dos rellenos, un nuevo clic reinicia el rango y pone esa fecha en «Desde». Pulsar un campo lo elige como destino del siguiente clic (solo ese). No se aplica solo: «Aplicar» (`showApply`) emite `done`; «Reiniciar» vacía ambos campos.
// Los campos son de solo lectura (no sale el teclado en móvil). Se emite `update:modelValue` ([desde, hasta]) en cada cambio, también incompleto. Props: initial ([desde, hasta]; si cambia desde fuera, se sincroniza), validate (campos vacíos en error: «La fecha es obligatoria»), showApply (botones «Aplicar» y «Reiniciar» bajo el calendario), autoFocus (por defecto false). Eventos: update:modelValue, done.
import { defineComponent, ref, watch, onMounted, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4Button from './R4Button.js'
import R4InputText from './R4InputText.js'
import DatePickerMenu, { leerFecha } from './_DatePickerMenu.js'

export default defineComponent({
  name: '_DateRangePanel',
  components: { R4Button, R4InputText, DatePickerMenu },
  props: { initial: { type: Array, default: () => ['', ''] }, showApply: { type: Boolean, default: false }, autoFocus: { type: Boolean, default: false }, validate: { type: Boolean, default: false } },
  emits: ['update:modelValue', 'done'],
  setup(props, { emit }) {
    const root = ref(null)
    const desde = ref(props.initial[0] || '')
    const hasta = ref(props.initial[1] || '')
    const objetivo = ref(null) // campo elegido para el siguiente clic del calendario: null (automático) | 0 (Desde) | 1 (Hasta)
    watch(() => props.initial.join('|'), () => { desde.value = props.initial[0] || ''; hasta.value = props.initial[1] || '' })
    const campo = (i) => root.value && root.value.querySelectorAll('.r4-daterange__fields input')[i]
    const enfocar = (i) => { const c = campo(i); if (c) c.focus({ preventScroll: true }) }
    onMounted(async () => { await nextTick(); if (props.autoFocus) enfocar(0) })
    const emitir = () => emit('update:modelValue', [desde.value, hasta.value])
    // A qué campo irá el siguiente clic: el elegido o, en automático, «Desde» (vacío o rango completo) / «Hasta» (solo hay «Desde»)
    const destino = () => (objetivo.value !== null ? objetivo.value : (desde.value && !hasta.value ? 1 : 0))
    const elegir = (i) => { objetivo.value = i; enfocar(i) }
    const onSelect = (fecha) => {
      const i = destino()
      if (i === 0) {
        const completo = objetivo.value === null && desde.value && hasta.value
        desde.value = fecha
        const d = leerFecha(fecha); const h = leerFecha(hasta.value)
        if (completo || (h && d && h < d)) hasta.value = '' // rango completo: nuevo rango; «Desde» posterior a «Hasta»: «Hasta» se vacía
      } else {
        hasta.value = fecha
      }
      objetivo.value = null
      emitir()
    }
    const reiniciar = () => { desde.value = ''; hasta.value = ''; objetivo.value = null; emitir() }
    const error = (i) => (props.validate && !(i === 0 ? desde.value : hasta.value) ? 'La fecha es obligatoria' : undefined)
    return { root, desde, hasta, objetivo, destino, elegir, onSelect, reiniciar, error }
  },
  template: `
    <div ref="root" class="r4-daterange">
      <div class="r4-daterange__fields">
        <div class="r4-daterange__field" @click="elegir(0)" @keydown.enter.prevent="elegir(0)" @keydown.space.prevent="elegir(0)">
          <R4InputText type="datepicker" required readonly :calendar="false" label="Desde" aria-label="Fecha desde" :model-value="desde" :status="error(0) ? 'Error' : 'Default'" :caption="error(0)" />
        </div>
        <div class="r4-daterange__field" @click="elegir(1)" @keydown.enter.prevent="elegir(1)" @keydown.space.prevent="elegir(1)">
          <R4InputText type="datepicker" required readonly :calendar="false" label="Hasta" aria-label="Fecha hasta" :model-value="hasta" :status="error(1) ? 'Error' : 'Default'" :caption="error(1)" />
        </div>
      </div>
      <DatePickerMenu inline model-value="" :range-start="desde" :range-end="hasta" :min-date="destino() === 1 ? desde : ''" @select="onSelect" />
      <div v-if="showApply" class="r4-daterange__actions">
        <R4Button type="primary" size="large" width="full-width" text="Aplicar" @click="$emit('done')" />
        <R4Button type="text" size="large" width="full-width" text="Reiniciar" :disabled="!desde && !hasta" @click="reiniciar" />
      </div>
    </div>
  `,
})
