// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (SIN VUE en el catálogo; Confluence R4Spinner, 3160408139, v1.0.0). API = "API componente": size (small | medium | large; por defecto medium),
// label (texto visible debajo; sin él no se muestra) y ariaLabel (nombre accesible; por defecto el label y, si no hay, «Cargando»).
// Anatomía (Figma, size=medium 48): anillo base (surface/muted al 30 % de opacidad) + arco (accent/default) con el radio interior al 80 %, es decir, un grosor del 10 % del tamaño; el arco
// barre 270° (de 0° a −90° en Figma) y gira una vuelta por segundo a velocidad constante. Texto: R4Text del mismo size, a spacing/2.
// Accesibilidad según la doc: role="status" aria-live="polite"; track y arco decorativos; sin foco. Con movimiento reducido el arco no gira (WCAG 2.3.3).
// Comportamiento según la doc: aparece tras ~300 ms (animación con retardo) para no mostrarse en acciones instantáneas; lo retira quien lo usa (v-if).
// Reconstruido: los 3 sizes y label. NO reconstruido: el R4Text como componente (se pinta con los tokens de su estilo body del mismo size).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4Spinner',
  props: {
    size: { type: String, default: 'medium', validator: (v) => ['small', 'medium', 'large'].includes(v) },
    label: { type: String, default: undefined },
    ariaLabel: { type: String, default: undefined },
  },
  setup(props) {
    const name = computed(() => props.ariaLabel || props.label || 'Cargando')
    return { name }
  },
  // r=21.6 con trazo 4.8 sobre 48: anillo exterior 24 e interior 19,2 (80 %). Arco de 270°: 3/4 de la circunferencia (2π·21,6 ≈ 135,72).
  template: `
    <div class="r4-spinner" :class="'r4-spinner--' + size" role="status" aria-live="polite" :aria-label="name">
      <svg class="r4-spinner__svg" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
        <circle class="r4-spinner__track" cx="24" cy="24" r="21.6" stroke-width="4.8" />
        <circle class="r4-spinner__arc" cx="24" cy="24" r="21.6" stroke-width="4.8" stroke-dasharray="101.79 33.93" />
      </svg>
      <span v-if="label" class="r4-spinner__label" aria-hidden="true">{{ label }}</span>
    </div>
  `,
})
