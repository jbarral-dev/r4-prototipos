// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4ButtonDock (catálogo: SIN VUE, doc "falta"; duda abierta del catálogo: ¿componente o patrón de layout?). No hay página en Confluence:
// se usan las props de Figma — ninguna: es una capa con slot por defecto (en Figma: acción secundaria de icono + acción primaria que ocupa el resto).
// Es la «capa fija en la parte inferior de la pantalla» de la doc de R4PageTitleProduct («En versión Mobile las acciones se muestran en una capa fija»).
// Solo mobile (el CSS la oculta a partir de 600 px; en tablet/desktop las acciones van inline en R4PageTitleProduct).
// Decisión de montaje (Jon: "decide tú"): la pantalla la coloca al final de la Template (slot `dock`), donde queda pegada abajo con position: sticky.
// No usa position: fixed porque la Template es un contenedor de container queries (container-type) y eso es el bloque contenedor de los fixed.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'

export default defineComponent({
  name: 'R4ButtonDock',
  template: `<div class="r4-buttondock" role="group" aria-label="Acciones del producto"><slot /></div>`,
})
