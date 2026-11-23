// PENDIENTE-IT: no oficial. TabBar de la App (solo mobile) para el prototipo del buscador unificado, usuario «App». Fuente: Figma «R4 Design System | Templates | 1.0» TabBar 12468:57, variante menuOpened=no
// (12135:4909, 390 × 64). Se reconstruye SOLO la barra: el menú que se despliega (menuOpened=yes) no se reproduce; el botón central emite `menu` y la pantalla avisa de que es una maqueta.
// Anatomía: barra surface/default de 64 con 4 pestañas (_TabBarItem: icono 20 + etiqueta 11/16, gap 4; la actual lleva 2 px arriba en accent/border y color accent/text; el resto text/muted) y un hueco central de 48;
// botón CTA circular de 56 (accent/default, icono ic-grip-horizontal de 24) que sobresale 20 px, sobre un halo blanco de 64 que sobresale 24; sombra de la barra hacia arriba (0 -4 2, negro 10 %) y del CTA (0 4 6, accent 50 %).
// Props: items = [{ label, icon, current? }] (por defecto las 4 de Figma: Tu cuenta · Bolsas · Fondos · Tu perfil), menuLabel. Eventos: select (item), menu. Fija abajo (position: fixed).
// Accesibilidad (no hay frames de accesibilidad en Figma): <nav> con lista; la pestaña actual lleva aria-current="page"; el CTA es un <button> con aria-label.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

const ITEMS = [
  { label: 'Tu cuenta', icon: 'app-tab-home', current: true },
  { label: 'Bolsas', icon: 'app-tab-chart-line' },
  { label: 'Fondos', icon: 'app-tab-chart-mixed' },
  { label: 'Tu perfil', icon: 'app-tab-user' },
]

export default defineComponent({
  name: '_AppTabBar',
  components: { Icon },
  props: {
    items: { type: Array, default: () => ITEMS },
    menuLabel: { type: String, default: 'Menú' },
  },
  emits: ['select', 'menu'],
  template: `
    <div class="app-tabbar">
      <span class="app-tabbar__halo" aria-hidden="true"></span>
      <nav class="app-tabbar__bar" aria-label="Principal de la App">
        <ul class="app-tabbar__list">
          <template v-for="(it, i) in items" :key="it.label">
            <li v-if="i === 2" class="app-tabbar__gap" aria-hidden="true"></li>
            <li class="app-tabbar__li"><a class="app-tabbar__item" :class="{ 'is-current': it.current }" href="#" :aria-current="it.current ? 'page' : undefined" @click.prevent="$emit('select', it)"><Icon :name="it.icon" /><span class="app-tabbar__label">{{ it.label }}</span></a></li>
          </template>
        </ul>
      </nav>
      <button type="button" class="app-tabbar__cta" :aria-label="menuLabel" @click="$emit('menu')"><Icon name="ic-grip-horizontal" /></button>
    </div>
  `,
})
