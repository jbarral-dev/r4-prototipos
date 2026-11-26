// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4InputText (era VUE en el catálogo). API = tabla de Confluence "Input Text" (2798649391, de enero 2025,
// pendiente de actualizar): label, caption, required, placeholder, status (Default | Error | Success; la doc añade Warning, que Figma no tiene en R4InputText).
// showLabel/showCaption de Figma se deducen de label/caption. Extras necesarios que la tabla no lista: modelValue (v-model), disabled y readonly.
// `type` (Jon: «R4InputText type=number / type=datepicker»; la tabla de Confluence no lo lista): text (por defecto) | number | datepicker. Leídas en Figma (Primitivos 1.2, componente R4InputText 6023:2393, variantes Number 6046:61086 y DataPicker 10253:2667):
//   number → campo con stepper de 24 px a la derecha (fondo surface/muted, chevron arriba / línea / chevron abajo), radio 4. En Figma el campo mide 59 px de ancho (hug): aquí ocupa el 100 % de su contenedor (DISCREPANCIA a validar: un
//   importe mínimo/máximo no cabe en 59 px) y el número va alineado a la derecha. Extra: `step` (1).
//   datepicker → texto «dd/mm/aaaa» alineado a la derecha y pestaña de 40×40 con el icono de calendario (`ic-calendar`, fondo surface/muted); al pulsar el campo o la pestaña se abre la capa del calendario (`_DatePickerMenu`),
//   que se monta en la capa de superposición de la Template (`overlay`) y se coloca bajo el campo (o encima si no cabe). Se cierra al elegir un día, con clic fuera, con Escape (sin cerrar lo que haya debajo) o al hacer scroll. También se puede escribir la fecha.
// NO reconstruido (no leído a fondo): las otras 7 variantes (Amount, IBAN, Phone, User, NIF, Password, E-mail),
// iconos izquierdo/derecho, prefijo/sufijo, contador (showCount), botón del label y de la caption, y los _Text Info/Warning
// (no existen como Status de R4InputText).
import { defineComponent, computed, ref, nextTick, onMounted, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import DatePickerMenu from './_DatePickerMenu.js'

let uid = 0

export default defineComponent({
  name: 'R4InputText',
  components: { Icon, DatePickerMenu },
  props: {
    type: { type: String, default: 'text', validator: (v) => ['text', 'number', 'datepicker'].includes(v) },
    hideOptional: { type: Boolean, default: false }, // extra del prototipo: no muestra «(opcional)» en el label aunque el campo no sea obligatorio (sin aria-required)
    step: { type: Number, default: 1 }, // type=number: incremento de las flechas
    calendar: { type: Boolean, default: true }, // type=datepicker (extra): false = sin capa de calendario (lo muestra el padre junto al campo; el icono solo da foco al campo)
    externalCalendar: { type: Boolean, default: false }, // type=datepicker (extra): no abre la capa; emite `calendar` para que lo muestre otra pantalla (mobile: pantalla propia de un R4Sheet). El campo pasa a solo lectura.
    overlay: { type: String, default: '.template-detail__overlay > .r4-layout-modes' }, // type=datepicker: dónde se monta la capa del calendario
    modelValue: { type: String, default: '' },
    label: { type: String, default: undefined }, // la doc lo marca obligatorio; con aria-label se puede omitir el visible
    caption: { type: String, default: undefined },
    required: { type: Boolean, default: false }, // false → el label muestra "(opcional)" (tabla de la doc; el texto de la doc dice lo contrario)
    status: { type: String, default: 'Default', validator: (v) => ['Default', 'Error', 'Success'].includes(v) },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    name: { type: String, default: undefined },
  },
  inheritAttrs: false, // aria-label y demás atributos van al <input>, no al contenedor
  emits: ['update:modelValue', 'calendar'],
  setup(props, { emit, attrs }) {
    const id = `r4-input-text-${++uid}`
    const classes = computed(() => ['r4-input-text', `r4-input-text--${props.status.toLowerCase()}`, `r4-input-text--${props.type}`, { 'r4-input-text--disabled': props.disabled }])
    const onInput = (e) => emit('update:modelValue', e.target.value)
    // — type=number —
    const paso = (dir) => { const n = parseFloat(props.modelValue); emit('update:modelValue', String(Math.round(((Number.isFinite(n) ? n : 0) + dir * props.step) * 1e6) / 1e6)) }
    // — type=datepicker: capa del calendario —
    const fieldEl = ref(null)
    const layerEl = ref(null)
    const abierto = ref(false)
    const destino = ref(null)
    const pos = ref({ top: '0px', left: '0px' })
    const colocar = () => {
      const f = fieldEl.value; const l = layerEl.value
      if (!f || !l) return
      const gap = 8
      const host = f.closest('.r4-popover, .r4-sheet') // dentro de un popover o de un sheet, el calendario sale a su lado (derecha; si no cabe, izquierda) y no lo tapa
      l.style.setProperty('--r4-datepicker-avail', document.documentElement.clientWidth - gap * 2 + 'px') // ancho útil (sin la barra de scroll) para que el calendario no se salga
      const r = f.getBoundingClientRect(); const w = l.offsetWidth; const h = l.offsetHeight
      const cw = document.documentElement.clientWidth
      if (host) {
        const hr = host.getBoundingClientRect()
        const left = hr.right + gap + w <= cw - gap ? hr.right + gap : hr.left - gap - w >= gap ? hr.left - gap - w : Math.max(gap, Math.min(r.left, cw - w - gap))
        const top = Math.max(gap, Math.min(hr.top, window.innerHeight - h - gap))
        pos.value = { top: top + 'px', left: left + 'px' }
        return
      }
      const left = Math.max(gap, Math.min(r.left, cw - w - gap))
      const top = r.bottom + gap + h <= window.innerHeight || r.top - gap - h < 0 ? r.bottom + gap : r.top - gap - h
      pos.value = { top: top + 'px', left: left + 'px' }
    }
    const cerrar = () => { abierto.value = false }
    let anchoAlAbrir = 0
    const abrir = async () => { if (!props.calendar) return; if (props.disabled || props.readonly) return; if (props.externalCalendar) { emit('calendar'); return }; anchoAlAbrir = window.innerWidth; destino.value = document.querySelector(props.overlay); abierto.value = true; await nextTick(); colocar() }
    const inputEl = ref(null)
    const alternar = () => { if (!props.calendar) { inputEl.value && inputEl.value.focus(); return } abierto.value ? cerrar() : abrir() }
    const elegir = (f) => { emit('update:modelValue', f); cerrar() }
    const onDoc = (e) => { if (abierto.value && !e.composedPath().some((el) => el.classList && el.classList.contains('r4-datepicker-layer')) && !(fieldEl.value && e.composedPath().includes(fieldEl.value))) cerrar() }
    // Solo un cambio de ANCHO cierra la capa: en móvil el teclado cambia el alto de la ventana y la cerraba nada más abrirla
    const onResize = () => { if (abierto.value && window.innerWidth !== anchoAlAbrir) cerrar() }
    const onKey = (e) => { if (e.key === 'Escape' && abierto.value) { e.stopPropagation(); cerrar() } }
    const onScroll = (e) => { if (abierto.value && !(e.target.closest && e.target.closest('.r4-datepicker-layer'))) cerrar() }
    onMounted(() => { document.addEventListener('click', onDoc); document.addEventListener('keydown', onKey, true); window.addEventListener('scroll', onScroll, true); window.addEventListener('resize', onResize) })
    onBeforeUnmount(() => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey, true); window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onResize) })
    const inputAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== "class" && k !== "style")))
    return { inputEl, id, classes, onInput, inputAttrs, paso, fieldEl, layerEl, abierto, destino, pos, abrir, cerrar, alternar, elegir }
  },
  template: `
    <div :class="[classes, $attrs.class]" :style="$attrs.style">
      <label v-if="label" class="r4-input-text__label" :for="id">
        <span class="r4-input-text__label-text">{{ label }}</span>
        <span v-if="!required && !hideOptional" class="r4-input-text__optional">(opcional)</span>
      </label>
      <div ref="fieldEl" class="r4-input-text__field">
        <input ref="inputEl" class="r4-input-text__input" :id="id" :type="type === 'number' ? 'number' : 'text'" :step="type === 'number' ? step : undefined" :inputmode="type === 'datepicker' ? 'numeric' : undefined" :name="name" :value="modelValue" :placeholder="placeholder || (type === 'datepicker' ? 'dd/mm/aaaa' : ' ')"
                   :disabled="disabled" :readonly="readonly || (type === 'datepicker' && externalCalendar)" :aria-required="required ? 'true' : undefined"
               :aria-invalid="status === 'Error' ? 'true' : undefined" :aria-describedby="caption ? id + '-caption' : undefined"
               v-bind="inputAttrs" @input="onInput" @click="type === 'datepicker' && abrir()" />
        <span v-if="type === 'number'" class="r4-input-text__stepper">
          <button type="button" class="r4-input-text__step r4-input-text__step--up" tabindex="-1" aria-label="Aumentar" :disabled="disabled || readonly" @click="paso(1)"><Icon name="chevron-down" /></button>
          <button type="button" class="r4-input-text__step" tabindex="-1" aria-label="Disminuir" :disabled="disabled || readonly" @click="paso(-1)"><Icon name="chevron-down" /></button>
        </span>
        <button v-if="type === 'datepicker'" type="button" class="r4-input-text__post" aria-label="Abrir calendario" aria-haspopup="dialog" :aria-expanded="abierto ? 'true' : 'false'" :disabled="disabled || readonly" @click="alternar"><Icon name="ic-calendar" /></button>
      </div>
      <Teleport v-if="type === 'datepicker' && abierto && destino" :to="destino">
        <div ref="layerEl" class="r4-datepicker-layer" :style="pos"><DatePickerMenu :model-value="modelValue" @select="elegir" /></div>
      </Teleport>
      <p v-if="caption" :id="id + '-caption'" class="r4-input-text__caption">{{ caption }}</p>
    </div>
  `,
})
