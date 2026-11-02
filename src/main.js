import { createApp } from '../vendor/vue.esm-browser.prod.js'
import DobleFactorVincularApp from './screens/DobleFactorVincularApp.js'
import AltaCuentaDatosContacto from './screens/AltaCuentaDatosContacto.js'
import FichaAccion from './screens/FichaAccion.js'
import BuscadorUnificadoE from './screens/BuscadorUnificadoE.js'

// Prototipo sin router: la pantalla se elige con el hash (#alta-cuenta · #doble-factor · #ficha-accion). Por defecto, doble factor.
const screens = { 'doble-factor': DobleFactorVincularApp, 'alta-cuenta': AltaCuentaDatosContacto, 'ficha-accion': FichaAccion, 'buscador-e': BuscadorUnificadoE }
const name = location.hash.replace('#', '')
createApp(screens[name] || DobleFactorVincularApp).mount('#app')
window.addEventListener('hashchange', () => location.reload())
