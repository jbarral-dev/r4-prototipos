// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (era VUE en el catálogo; Changelog SM-18981, SM-18293 y SM-22167 —reducción de paddings de cabecera y contenedor—). API = "API componente"
// de Confluence (R4Sheet, 3509616693): position (bottom | side; por defecto bottom), title, backLinkURL, primaryActionURL / primaryActionLabel,
// secondaryActionURL / secondaryActionLabel y slot por defecto.
// Extras del prototipo (la doc dice que lo abre/cierra el padre y no define la API): `open` (boolean) y el evento `close`.
// Accesibilidad según la doc: role="dialog" aria-modal="true" aria-labelledby (título) · botón de cierre con aria-label "Cerrar" · Escape cierra · foco al botón de cierre al abrir,
// focus trap mientras está abierto y el foco vuelve al disparador al cerrar · foco visible manual en el botón de cierre.
// Reconstruido (leído en Figma): position bottom y side, cabecera con título y botón de cierre, slot de contenido y el bloque de acciones (showActions: primaryActionLabel + secondaryActionLabel, R4Button
// primary large + text large a ancho completo, padding 16, gap 8, borde superior border/subtle; extra: eventos `primary` y `secondary` en lugar de las URLs). NO reconstruido: showBackLink (ic-arrow-left) ; la animación es una transición propia (Figma no define movimiento) y no hay velo de fondo (Figma no lo define).
// bottom/side los decide el CSS del contenedor en la ficha (la doc: bottom para móvil/tablet, side para escritorio): la pantalla monta una de cada y el CSS oculta la que no toca.
import { defineComponent, ref, watch, nextTick, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4Button from './R4Button.js'

let uid = 0

export default defineComponent({
  name: 'R4Sheet',
  components: { Icon, R4Button },
  props: {
    position: { type: String, default: 'bottom', validator: (v) => ['bottom', 'side'].includes(v) },
    title: { type: String, default: undefined },
    open: { type: Boolean, default: false },
    primaryActionLabel: { type: String, default: undefined }, // con label hay bloque de acciones (showActions)
    secondaryActionLabel: { type: String, default: undefined },
  },
  emits: ['close', 'primary', 'secondary'],
  setup(props, { emit }) {
    const titleId = `r4-sheet-title-${++uid}`
    const root = ref(null)
    const closeBtn = ref(null)
    let opener = null

    const focusables = () => [...root.value.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    const visible = () => root.value && getComputedStyle(root.value).display !== 'none' // el CSS oculta la variante que no toca (offsetParent no sirve con position: fixed)

    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); emit('close'); return }
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    watch(() => props.open, async (isOpen) => {
      if (isOpen) {
        opener = document.activeElement
        await nextTick()
        if (visible()) closeBtn.value?.focus()
      } else if (opener && typeof opener.focus === 'function') {
        opener.focus()
        opener = null
      }
    })
    onBeforeUnmount(() => { opener = null })

    return { titleId, root, closeBtn, onKeydown }
  },
  template: `
    <Transition :name="'r4-sheet-' + position">
      <div v-if="open" ref="root" class="r4-sheet" :class="['r4-sheet--' + position, { 'has-actions': primaryActionLabel || secondaryActionLabel }]" role="dialog" aria-modal="true" :aria-labelledby="title ? titleId : undefined" @keydown="onKeydown">
        <div class="r4-sheet__header">
          <h2 :id="titleId" class="r4-sheet__title">{{ title }}</h2>
          <button ref="closeBtn" type="button" class="r4-sheet__close" aria-label="Cerrar" @click="$emit('close')"><Icon name="close" /></button>
        </div>
        <div class="r4-sheet__content"><div class="r4-sheet__slot"><slot /></div></div>
        <div v-if="primaryActionLabel || secondaryActionLabel" class="r4-sheet__actions">
          <R4Button v-if="primaryActionLabel" type="primary" size="large" width="full-width" :text="primaryActionLabel" @click="$emit('primary', $event)" />
          <R4Button v-if="secondaryActionLabel" type="text" size="large" width="full-width" :text="secondaryActionLabel" @click="$emit('secondary', $event)" />
        </div>
      </div>
    </Transition>
  `,
})
