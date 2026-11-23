// PENDIENTE-IT: no oficial. Plantilla de proceso (docs/templates-y-wrapper.md y "Páginas de Procesos"): superficie gris,
// Header (Menu Type=Process, con R4ProgressBar) FIJO al hacer scroll, Main con Wrappers, sin Footer.
// La Template es el contenedor `r4page`: sus modos (Desktop / Tablet / Mobile) los resuelve el CSS por el ancho del contenedor
// (variables en tokens.css). Sin JS de breakpoints.
import { defineComponent } from '../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'TemplateProcess',
  template: `
    <div class="template-process">
      <div class="template-process__page r4-layout-modes">
        <div class="template-process__header"><slot name="header" /></div>
        <main class="template-process__main"><slot /></main>
      </div>
    </div>
  `,
})
