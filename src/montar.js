// Arranque común de los prototipos: cada prototipo (prototipos/<nombre>/index.html) importa solo su pantalla y la monta aquí.
import { createApp } from '../vendor/vue.esm-browser.prod.js'

export function montar(Pantalla) {
  createApp(Pantalla).mount('#app')
}
