// Prototipo «Ficha de acción (CAIFE)»: la misma pantalla que FichaAccion con los datos de una acción elegible para la Cuenta de Ahorro e Inversión Financia Europa
// (Figma "Proyectos - Fichas de Productos", 3369:9753): tag «Europa» en el título, fila «Elegible Cuenta Europa» (botón de información + tag) al final del Resumen y R4Popover al pulsarlo.
import { defineComponent, h } from '../../vendor/vue.esm-browser.prod.js'
import FichaAccion from './FichaAccion.js'
import { accionCaife } from '../data/ficha-accion.js'

export default defineComponent({
  name: 'FichaAccionCaife',
  render: () => h(FichaAccion, { data: accionCaife }),
})
