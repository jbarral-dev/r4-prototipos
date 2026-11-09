// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de `_RiskBox` (componente remoto, privado: archivo "Proyectos - Fichas de Productos", instancia I3369:9952;22563:6;3369:9914; set con eje mediaQuery = desktop | mobile).
// OJO: NO es R4RiskBox (Específicos, catálogo VUE+AEM, escala visual 1-7): `_RiskBox` es la caja compacta de la ficha: «nivel / máximo» + texto explicativo. No está en el catálogo ni tiene página
// de Confluence propia; para la API y la accesibilidad se toma la de R4RiskBox (Confluence 3879993346): riskLevel (obligatorio) y maxRisk (por defecto 7; las fichas de acción usan 6).
// Accesibilidad (R4RiskBox): <section aria-label="Indicador de riesgo">; el nivel es role="img" con aria-label «Nivel de riesgo: N de M» (no se comunica solo por color); texto en <p>; sin foco.
// Reconstruido: la variante horizontal (la que usan la ficha desktop y la mobile): una fila de 40 de alto, con el nivel a la izquierda y el texto a la derecha.
// NO reconstruido: la variante `mediaQuery=desktop` (264 de ancho, vertical: nivel centrado sobre el texto). Ninguna ficha de Acciones la usa, y `mediaQuery` no existe en código.
// El texto es el del Figma, con «6» sustituido por maxRisk (datos de prototipo).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'RiskBox',
  props: {
    riskLevel: { type: Number, required: true },
    maxRisk: { type: Number, default: 7 },
  },
  template: `
    <section class="r4-riskbox" aria-label="Indicador de riesgo">
      <span class="r4-riskbox__level" role="img" :aria-label="'Nivel de riesgo: ' + riskLevel + ' de ' + maxRisk">
        <span class="r4-riskbox__value">{{ riskLevel }}</span><span class="r4-riskbox__separator">/</span><span class="r4-riskbox__max">{{ maxRisk }}</span>
      </span>
      <p class="r4-riskbox__text">Este número es indicativo del riesgo del producto, siendo 1/{{ maxRisk }} indicativo de menor riesgo y {{ maxRisk }}/{{ maxRisk }} de mayor riesgo.</p>
    </section>
  `,
})
