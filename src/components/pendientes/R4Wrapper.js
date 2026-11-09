// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4Wrapper (Changelog SM-23967). API = "API del componente" de Confluence (R4Wrapper, 3767762951):
// backgroundColor (none | grey | brandPrimary | brandSecondary | white), density (relaxed | default | compact), slot por defecto.
// - mediaQuery (Figma y tabla de la doc) NO existe en código: lo resuelve el CSS por el ancho de la Template (tokens por modo).
// - El primer R4Wrapper de cada página usa siempre wrapper/paddingTopFirstWrapper (48/40/32): lo aplica el CSS (:first-child), sin prop.
//   (docs/templates-y-wrapper.md proponía una prop `isFirst`; la doc de Confluence, más reciente, no la tiene: se sigue Confluence.)
// - El gap vertical de la Grid interior apunta al mismo token que el padding vertical (--r4-wrapper-gap).
// EXTRA (no está en la API de Confluence; propuesta de Jon, 2026-11-09, pendiente de llevar al Sistema de Diseño): prop `layout` con presets de reparto de columnas.
//   Con `layout` el Wrapper pinta él la Grid y coloca sus hijos DIRECTOS por orden; sin `layout` (valor por defecto) se comporta como antes: el slot va tal cual y la pantalla pone su `.r4-grid`.
//   Un Wrapper = una fila-patrón: para otro reparto, otro Wrapper. Valores (desktop 12 col · tablet 8 · mobile 4):
//     '12'  → cada hijo a 12 columnas (ancho completo) en todos los anchos.
//     '8-4' → hijos impares a 8 columnas (desde la 1) y pares a 4 (desde la 9); en tablet y mobile, todos a ancho completo y apilados.
//     '6'   → cada hijo a 6 columnas centrado (4–9) · tablet: 6 de 8 centrado (2–7) · mobile: 4 de 4 («Páginas de Procesos», Confluence 3497656350).
//     '4'   → cada hijo a 4 columnas centrado (5–8) · tablet: 6 de 8 centrado (INFERIDO: la doc solo da 4/12, y 6/12 a 1024) · mobile: 4 de 4.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Wrapper',
  props: {
    backgroundColor: { type: String, default: 'none', validator: (v) => ['none', 'grey', 'brandPrimary', 'brandSecondary', 'white'].includes(v) },
    density: { type: String, default: 'default', validator: (v) => ['relaxed', 'default', 'compact'].includes(v) },
    layout: { type: String, default: undefined, validator: (v) => ['12', '8-4', '6', '4'].includes(v) },
  },
  template: `
    <div class="r4-wrapper" :class="['r4-wrapper--density-' + density, 'r4-wrapper--bg-' + backgroundColor]">
      <div class="r4-wrapper__container"><div class="r4-wrapper__slot">
        <div v-if="layout" class="r4-grid r4-wrapper__grid" :class="'r4-wrapper__grid--' + layout"><slot /></div>
        <slot v-else />
      </div></div>
    </div>
  `,
})
