// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4Wrapper (Changelog SM-23967). API = "Propiedades componente" de Confluence (R4Wrapper v1.2, 11 nov 2026, 3767762951):
// backgroundColor (none | grey | brandPrimary | brandSecondary | white; por defecto none), density (relaxed | default | compact; por defecto default),
// layout (12 | 8-4 | 6 | 4; por defecto 12), slot por defecto = hijos de la Grid.
// Anatomía (v1.2): DOS niveles, R4Wrapper (ancho completo, fondo y padding vertical) y Grid (se centra, limita su ancho máximo, aplica el padding horizontal y reparte en columnas).
//   Ya no hay Slot/contenedor intermedio. R4Wrapper SIEMPRE lleva su Grid: ninguna pantalla debe añadir una propia dentro del contenido.
// - mediaQuery/breakpoint (Figma) NO existe en código: lo resuelve el CSS por el ancho de la Template (tokens por modo).
// - El primer R4Wrapper de cada página usa siempre wrapper/paddingTopFirstWrapper (48/40/32): lo aplica el CSS (:first-child), sin prop.
// - El gap vertical de la Grid apunta al mismo token que el padding vertical (--r4-wrapper-gap).
// - `layout` reparte las columnas de los hijos DIRECTOS, por orden (un Wrapper = un layout: para otro reparto, otro Wrapper). Desktop 12 col · tablet 8 · mobile 4:
//     '12'  → cada hijo a ancho completo.   '8-4' → impares a 8 (desde la 1) y pares a 4 (desde la 9); en tablet y mobile, apilados a ancho completo.
//     '6'   → 6 de 12 centrado (4–9) · tablet 6 de 8 (2–7) · mobile 4 de 4.   '4' → 4 de 12 centrado (5–8) · tablet 6 de 8 (2–7) · mobile 4 de 4.
// No se reconstruye: la rejilla de 12 columnas como referencia visual cuando no hay contenido (solo ayuda de diseño en Figma).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Wrapper',
  props: {
    backgroundColor: { type: String, default: 'none', validator: (v) => ['none', 'grey', 'brandPrimary', 'brandSecondary', 'white'].includes(v) },
    density: { type: String, default: 'default', validator: (v) => ['relaxed', 'default', 'compact'].includes(v) },
    layout: { type: String, default: '12', validator: (v) => ['12', '8-4', '6', '4'].includes(v) },
  },
  template: `
    <div class="r4-wrapper" :class="['r4-wrapper--density-' + density, 'r4-wrapper--bg-' + backgroundColor]">
      <div class="r4-grid r4-wrapper__grid" :class="'r4-wrapper__grid--' + layout"><slot /></div>
    </div>
  `,
})
