// PENDIENTE-IT: no oficial. Plantilla de detalle (docs/templates-y-wrapper.md → TemplateDetail; en WIP como el resto de Templates): superficie gris, Header (Menu type=default, Cliente=Logado),
// Main con Wrappers y, opcionalmente, una capa de acciones fija abajo (R4ButtonDock) y una capa de superposición (R4Sheet). SIN Footer: los frames de las fichas en Figma no lo llevan
// (la doc de Templates sí lo incluye en Detail: se deja anotado en «Pendiente / dudas»).
// La Template es el contenedor `r4page`: sus modos (Desktop / Tablet / Mobile) los resuelve el CSS por el ancho del contenedor (variables en tokens.css). Sin JS de breakpoints.
// Slots: `header` (Menu), `header-extra` (barra fija bajo el Menu, p. ej. FixedProductTitle), por defecto (Main), `dock` (capa fija inferior) y `overlay` (sheets/modales).
// Por qué `overlay` es otro contenedor y no un hijo de la página: container-type convierte al contenedor en bloque contenedor de los `position: fixed`; la capa de superposición es un
// contenedor del mismo nombre (`r4page`) a tamaño de viewport, así los fixed se colocan sobre la ventana y los container queries siguen funcionando dentro.
import { defineComponent } from '../../vendor/vue.esm-browser.prod.js'

// Extra del prototipo: `headerSticky` = 'all' (por defecto: toda la cabecera queda fija al hacer scroll) | 'main' (solo queda fija la barra principal del Menu, `.menu__main`; en tablet y mobile,
// `.menu__compact`; la franja de usuario y el submenú se van con el scroll, y la capa `header-extra` se pega justo debajo de la barra).
export default defineComponent({
  name: 'TemplateDetail',
  props: { headerSticky: { type: String, default: 'all', validator: (v) => ['all', 'main'].includes(v) } },
  template: `
    <div class="template-detail">
      <div class="template-detail__container">
        <div class="template-detail__page r4-layout-modes">
          <div class="template-detail__header" :class="{ 'template-detail__header--main': headerSticky === 'main' }"><slot name="header" /><div class="template-detail__header-extra"><slot name="header-extra" /></div></div>
          <main class="template-detail__main"><slot /></main>
          <slot name="dock" />
        </div>
      </div>
      <div class="template-detail__overlay"><div class="r4-layout-modes"><slot name="overlay" /></div></div>
    </div>
  `,
})
