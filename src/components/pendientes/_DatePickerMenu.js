// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción de `_DatePicker Menu` (la capa del calendario de R4InputText › Variant=DataPicker; Figma Primitivos 1.2, component set 10252:2731 con Variant = Day | Month | Year y `_DatePicker Menu Item` 10246:2653 con
// Variant = Active | Inactive | Disabled × Interaction = Default | Hover; leídos con use_figma). La página de Confluence R4InputDate (2801729671) solo dice que «al seleccionar el componente se desplegará un calendario» y enlaza a Figma 1.0.
// Vista Day: cabecera «Mes Año» (negrita) con flechas ‹ › (mes anterior / siguiente), días de la semana «Do Lu Ma Mi Ju Vi Sa» (la semana empieza en domingo, como en Figma) y 6 filas de 7 días; los días de otros meses van en `Disabled`.
// Hoy y futuro: se marca el día de hoy con el estilo `Active` (Figma no define un estilo propio de «hoy») mientras el campo no tenga fecha; con fecha, `Active` es la elegida. Todo lo posterior a hoy (días, meses y años) va en `Disabled` y no se puede elegir.
// Vista Month: cabecera «Año» con flechas (año anterior / siguiente) y 12 meses abreviados en 3 columnas. Vista Year: cabecera «2020 - 2029» con flechas (década) y 12 años (el anterior y el siguiente de la década en `Disabled`).
// Pulsar el título de la cabecera sube de vista (día → mes → año); elegir un año baja a la vista de meses; elegir un mes baja a la de días; elegir un día emite `select` («dd/mm/aaaa») y cierra.
// Props: modelValue («dd/mm/aaaa» o ''). Eventos: select, close. NO reconstruido: el pie (`Footer`, oculto en Figma), rango de fechas ni fechas mínima/máxima.
// Medidas: ancho máx. 429 en Day (Figma) y 321 en Month/Year; en pantallas estrechas se adapta al ancho disponible. Sombra: la de R4Popover (Figma trae 3 sombras de una generación antigua).
import { defineComponent, ref, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const pad = (n) => String(n).padStart(2, '0')
export const formatearFecha = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
// «dd/mm/aaaa» → Date (o null si no es una fecha válida)
export const leerFecha = (s) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((s || '').trim())
  if (!m) return null
  const d = new Date(+m[3], +m[2] - 1, +m[1])
  return d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? d : null
}

export default defineComponent({
  name: '_DatePickerMenu',
  components: { Icon },
  props: {
    modelValue: { type: String, default: '' },
    inline: { type: Boolean, default: false }, // extra: el calendario ocupa el 100 % de su contenedor y sin sombra (pantalla propia de un R4Sheet en mobile)
  },
  emits: ['select', 'close'],
  setup(props, { emit }) {
    const hoy = new Date()
    const hoy0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const sel = computed(() => leerFecha(props.modelValue))
    const base = sel.value || hoy
    const vista = ref('day') // day | month | year
    const año = ref(base.getFullYear())
    const mes = ref(base.getMonth())

    const decada = computed(() => Math.floor(año.value / 10) * 10)
    const titulo = computed(() => (vista.value === 'day' ? `${MESES[mes.value]} ${año.value}` : vista.value === 'month' ? `${año.value}` : `${decada.value} - ${decada.value + 9}`))
    const mover = (n) => {
      if (vista.value === 'day') { const d = new Date(año.value, mes.value + n, 1); año.value = d.getFullYear(); mes.value = d.getMonth() }
      else if (vista.value === 'month') año.value += n
      else año.value += n * 10
    }
    const subir = () => { vista.value = vista.value === 'day' ? 'month' : vista.value === 'month' ? 'year' : 'year' }

    // 6 filas × 7 días (los de otros meses, deshabilitados)
    const dias = computed(() => {
      const primero = new Date(año.value, mes.value, 1)
      const inicio = new Date(año.value, mes.value, 1 - primero.getDay())
      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
        const fuera = d.getMonth() !== mes.value
        const esHoy = d.getTime() === hoy0.getTime()
        return { d, n: d.getDate(), fuera, futuro: d > hoy0, esHoy, activo: !fuera && (sel.value ? d.getTime() === sel.value.getTime() : esHoy),
          etiqueta: `${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()} de ${d.getFullYear()}${esHoy ? ' (hoy)' : ''}` }
      })
    })
    const refMes = computed(() => sel.value || hoy0) // mes y año marcados: el de la fecha elegida o, si no hay, el de hoy
    const meses = computed(() => MESES_CORTOS.map((t, i) => ({ i, t, futuro: año.value > hoy0.getFullYear() || (año.value === hoy0.getFullYear() && i > hoy0.getMonth()), activo: refMes.value.getFullYear() === año.value && refMes.value.getMonth() === i, etiqueta: `${MESES[i]} de ${año.value}` })))
    const años = computed(() => Array.from({ length: 12 }, (_, i) => { const y = decada.value - 1 + i; return { y, fuera: i === 0 || i === 11 || y > hoy0.getFullYear(), activo: refMes.value.getFullYear() === y } }))

    const elegirDia = (c) => { if (c.fuera || c.futuro) return; emit('select', formatearFecha(c.d)) }
    const elegirMes = (m) => { if (m.futuro) return; mes.value = m.i; vista.value = 'day' }
    const elegirAño = (a) => { if (a.fuera) return; año.value = a.y; vista.value = 'month' }
    const etiquetaMover = computed(() => (vista.value === 'day' ? ['Mes anterior', 'Mes siguiente'] : vista.value === 'month' ? ['Año anterior', 'Año siguiente'] : ['Década anterior', 'Década siguiente']))
    return { vista, titulo, mover, subir, dias, meses, años, DIAS, elegirDia, elegirMes, elegirAño, etiquetaMover }
  },
  template: `
    <div class="r4-datepicker" :class="['r4-datepicker--' + vista, { 'r4-datepicker--inline': inline }]" role="dialog" aria-label="Calendario">
      <div class="r4-datepicker__header">
        <button type="button" class="r4-datepicker__nav" :aria-label="etiquetaMover[0]" @click="mover(-1)"><Icon name="chevron-left" /></button>
        <button type="button" class="r4-datepicker__title" :class="{ 'r4-datepicker__title--static': vista === 'year' }" :disabled="vista === 'year'" :aria-label="vista === 'year' ? titulo : titulo + ' (cambiar de vista)'" @click="subir">{{ titulo }}</button>
        <button type="button" class="r4-datepicker__nav r4-datepicker__nav--next" :aria-label="etiquetaMover[1]" @click="mover(1)"><Icon name="chevron-left" /></button>
      </div>
      <div v-if="vista === 'day'" class="r4-datepicker__content">
        <div class="r4-datepicker__row r4-datepicker__weekdays" aria-hidden="true"><span v-for="d in DIAS" :key="d" class="r4-datepicker__cell"><span class="r4-datepicker__weekday">{{ d }}</span></span></div>
        <div class="r4-datepicker__grid r4-datepicker__grid--days">
          <span v-for="(c, i) in dias" :key="i" class="r4-datepicker__cell">
            <button type="button"  class="r4-datepicker__item" :class="{ 'is-active': c.activo, 'is-disabled': c.fuera || c.futuro }" :disabled="c.fuera || c.futuro" :aria-label="c.etiqueta" :aria-pressed="c.activo ? 'true' : 'false'" @click="elegirDia(c)">{{ c.n }}</button>
          </span>
        </div>
      </div>
      <div v-else-if="vista === 'month'" class="r4-datepicker__content">
        <div class="r4-datepicker__grid r4-datepicker__grid--cols3">
          <span v-for="m in meses" :key="m.i" class="r4-datepicker__cell">
            <button type="button" class="r4-datepicker__item" :class="{ 'is-active': m.activo, 'is-disabled': m.futuro }" :disabled="m.futuro" :aria-label="m.etiqueta" :aria-pressed="m.activo ? 'true' : 'false'" @click="elegirMes(m)">{{ m.t }}</button>
          </span>
        </div>
      </div>
      <div v-else class="r4-datepicker__content">
        <div class="r4-datepicker__grid r4-datepicker__grid--cols3">
          <span v-for="a in años" :key="a.y" class="r4-datepicker__cell">
            <button type="button" class="r4-datepicker__item" :class="{ 'is-active': a.activo, 'is-disabled': a.fuera }" :disabled="a.fuera" :aria-pressed="a.activo ? 'true' : 'false'" @click="elegirAño(a)">{{ a.y }}</button>
          </span>
        </div>
      </div>
    </div>
  `,
})
