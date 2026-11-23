// Variante B del prototipo «R4Table (v2)»: filtros y vistas en filas distintas (los filtros en una fila y, 16 px debajo, «N resultados» a la izquierda y las vistas a la derecha, en desktop, tablet y mobile). Misma pantalla que la A con `variante="b"`.
import { defineComponent, h } from '../../vendor/vue.esm-browser.prod.js'
import Pantalla from './R4TableV2.js'

export default defineComponent({ name: 'R4TableV2B', render: () => h(Pantalla, { variante: 'b' }) })
