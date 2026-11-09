// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Componente utility de layout NUEVO: no está en el catálogo, ni en Figma, ni en Confluence todavía. API y reglas = especificación de Jon «R4Stack · Especificación del componente» (5 nov 2026,
// R4Stack.md; propuesta, «validar con IT»): apila sus hijos en vertical u horizontal con UN espacio entre ellos, tomado de 5 tokens (alias de la escala `spacing`, ver pending.css).
//   direction: vertical | horizontal (por defecto vertical) · gap: tight (4) | snug (8) | default (16) | loose (24) | section (32) (por defecto default) ·
//   align: start | center | end | stretch (por defecto stretch; eje transversal) · wrap: boolean (solo con horizontal; mismo gap en ambos ejes) · divider: boolean (línea de 1 px centrada en el gap) ·
//   slot por defecto = children.
// Reglas de la spec: el espacio lo decide el contenedor, nunca los hijos (sin márgenes); sin padding, fondo, borde ni radio; solo espacio entre hermanos (el espacio entre filas de página es del R4Wrapper).
// Implementación (spec: «flex y gap, sin márgenes en los hijos»): flex + gap. Con `divider` el gap se reparte como padding del propio separador (sin márgenes), de modo que la distancia total sigue siendo el gap.
// El color del divider no está decidido en la spec (propuesta: neutral gray-200): se usa border/subtle (gray-200 en Light). Sin rol ni texto alternativo: el divider es decorativo (aria-hidden).
// El orden de los hijos es el orden del DOM y del foco: R4Stack no reordena.
import { defineComponent, h, Fragment, Comment, Text } from '../../../vendor/vue.esm-browser.prod.js'

const GAPS = ['tight', 'snug', 'default', 'loose', 'section']
const ALIGNS = ['start', 'center', 'end', 'stretch']

// Aplana los fragmentos del slot (v-for, v-if) y descarta comentarios y texto vacío
const flatten = (nodes) => nodes.flatMap((n) => {
  if (n.type === Fragment) return flatten(n.children || [])
  if (n.type === Comment) return []
  if (n.type === Text && !String(n.children).trim()) return []
  return [n]
})

export default defineComponent({
  name: 'R4Stack',
  props: {
    direction: { type: String, default: 'vertical', validator: (v) => ['vertical', 'horizontal'].includes(v) },
    gap: { type: String, default: 'default', validator: (v) => GAPS.includes(v) },
    align: { type: String, default: 'stretch', validator: (v) => ALIGNS.includes(v) },
    wrap: { type: Boolean, default: false },
    divider: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => {
      const kids = flatten(slots.default ? slots.default() : [])
      const items = props.divider
        ? kids.flatMap((k, i) => (i ? [h('span', { class: 'r4-stack__divider', 'aria-hidden': 'true' }), k] : [k]))
        : kids
      return h('div', {
        class: ['r4-stack', 'r4-stack--' + props.direction, 'r4-stack--gap-' + props.gap, 'r4-stack--align-' + props.align,
          { 'r4-stack--wrap': props.wrap && props.direction === 'horizontal', 'r4-stack--divider': props.divider }],
      }, items)
    }
  },
})
