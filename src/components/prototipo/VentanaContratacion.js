// HERRAMIENTA DEL PROTOTIPO (no es del Design System ni de Figma, y NO es R4Modal: R4Modal es el aviso pequeño con título, texto y acciones): ventana modal que ocupa casi toda la pantalla y simula la
// ventana de contratación actual de la web («Contratación Bolsa Nacional»). Al abrirse muestra un R4Spinner `spinnerMs` (1 s) y después la captura de esa ventana (src/assets/contratacion-bolsa-nacional.webp, que aporta Jon).
// Props: open (boolean), title (nombre accesible; por defecto «Contratación Bolsa Nacional»), spinnerMs (1000), image (URL; por defecto la captura). Evento: close (aspa, Escape o clic en el velo).
// Accesibilidad: role="dialog" aria-modal, aria-labelledby, foco al botón de cierre al abrir, focus trap, Escape cierra y el foco vuelve al disparador; mientras está abierta la página no hace scroll (r4-scroll-lock, como R4Sheet).
import { defineComponent, ref, watch, nextTick, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Spinner from '../pendientes/R4Spinner.js'

let uid = 0
const CAPTURA = new URL('../../assets/contratacion-bolsa-nacional.webp', import.meta.url).href

export default defineComponent({
  name: 'VentanaContratacion',
  components: { Icon, R4Spinner },
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: 'Contratación Bolsa Nacional' },
    spinnerMs: { type: Number, default: 1000 },
    image: { type: String, default: CAPTURA },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const titleId = `r4-ventana-title-${++uid}`
    const root = ref(null)
    const closeBtn = ref(null)
    const loading = ref(true)
    let opener = null
    let timer = null
    let savedY = 0
    let locked = false
    const lock = (on) => {
      if (on === locked) return
      locked = on
      if (on) { savedY = window.scrollY; document.documentElement.classList.add('r4-scroll-lock'); document.body.style.top = `-${savedY}px` }
      else { document.documentElement.classList.remove('r4-scroll-lock'); document.body.style.top = ''; window.scrollTo(0, savedY) }
    }
    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); emit('close'); return }
      if (e.key !== 'Tab') return
      const f = [...root.value.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (!f.length) return
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
    }
    watch(() => props.open, async (isOpen) => {
      clearTimeout(timer)
      if (isOpen) {
        opener = document.activeElement
        loading.value = true
        timer = setTimeout(() => { loading.value = false }, props.spinnerMs)
        await nextTick()
        lock(true)
        closeBtn.value?.focus()
      } else {
        lock(false)
        if (opener && typeof opener.focus === 'function') opener.focus()
        opener = null
      }
    })
    onBeforeUnmount(() => { clearTimeout(timer); lock(false) })
    return { titleId, root, closeBtn, loading, onKeydown }
  },
  template: `
    <Transition name="r4-ventana" :duration="200">
      <div v-if="open" class="r4-ventana" @click.self="$emit('close')">
        <div ref="root" class="r4-ventana__dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId" :aria-busy="loading ? 'true' : 'false'" @keydown="onKeydown">
          <h2 :id="titleId" class="r4-ventana__title">{{ title }}</h2>
          <button ref="closeBtn" type="button" class="r4-ventana__close" aria-label="Cerrar" @click="$emit('close')"><Icon name="close" /></button>
          <div class="r4-ventana__body" tabindex="0" :aria-label="loading ? undefined : title">
            <div v-if="loading" class="r4-ventana__loading"><R4Spinner size="large" aria-label="Cargando la contratación" /></div>
            <img v-else class="r4-ventana__img" :src="image" alt="Ventana de contratación de Bolsa Nacional con el formulario de la orden, la ficha del valor, la cartera y las órdenes realizadas" />
          </div>
        </div>
      </div>
    </Transition>
  `,
})
