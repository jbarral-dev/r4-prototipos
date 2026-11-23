// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (EN PROGRESO en el catálogo; Changelog SM-21626 y SM-24193 —flecha/línea opcionales y estado disabled—). API = "API componente" de Confluence
// (R4NavigationItems, 3577118735): items (NavigationItem[] = { title, description?, icon, linkHref }), density (default | narrow | relaxed; por defecto narrow),
// size (large | medium; obligatorio), hasCardContainer (boolean, false), iconIsBoxed (boolean, true).
// Semántica según la doc: <nav> > <ul> > <li> con <a> (el foco cae en el ítem completo; iconos y chevron decorativos).
// Reconstruido (leído en Figma): size medium, hasCardContainer=false (ítem plano con línea inferior), estados default / hover / focused / pressed / disabled.
// Extras del prototipo del menú hamburguesa (Figma «Navegación - Potenciales», 1614:673): cada ítem admite showLine (false oculta la línea inferior; en Figma showLine) y hasCardContainer=true se
//   reconstruye solo en size medium y estado default (CardContainer: surface/default, trazo border/subtle de 1, radio card/radius = 0, padding 16; estados default / hover / focused / pressed / disabled leídos del CardContainer; no se reconstruye el estado selected, de 2 px).
// NO reconstruido: size large, hasCardContainer=true con otros estados, density default/relaxed solo como gap.
// Extra: cada ítem admite showLink (false oculta el chevron; en Figma showLink, Changelog SM-24193; la API de la doc no lo recoge). El icono es obligatorio en la API; en el menú de acciones lleva ic-clock sin flecha (Jon).
import { defineComponent, computed } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'R4NavigationItems',
  components: { Icon },
  props: {
    items: { type: Array, required: true },
    density: { type: String, default: 'narrow', validator: (v) => ['default', 'narrow', 'relaxed'].includes(v) },
    size: { type: String, required: true, validator: (v) => ['large', 'medium'].includes(v) },
    hasCardContainer: { type: Boolean, default: false },
    iconIsBoxed: { type: Boolean, default: true },
    ariaLabel: { type: String, default: undefined },
  },
  emits: ['select'],
  setup(props) {
    if (props.size !== 'medium') console.warn('R4NavigationItems: solo está reconstruido size="medium"')
    const classes = computed(() => ['r4-navitems', 'r4-navitems--' + props.density, { 'r4-navitems--card': props.hasCardContainer }])
    return { classes }
  },
  template: `
    <nav :aria-label="ariaLabel">
      <ul :class="classes">
        <li v-for="(it, i) in items" :key="i" class="r4-navitems__li">
          <a class="r4-navitems__item" :class="{ 'is-disabled': it.disabled, 'has-no-line': it.showLine === false }" :href="it.disabled ? undefined : it.linkHref" :aria-disabled="it.disabled ? 'true' : undefined"
             @click="$emit('select', it, $event)">
            <span v-if="it.icon" class="r4-navitems__icon" :class="{ 'r4-navitems__icon--boxed': iconIsBoxed }"><Icon :name="it.icon" /></span>
            <span class="r4-navitems__text">
              <span class="r4-navitems__title">{{ it.title }}</span>
              <span v-if="it.description" class="r4-navitems__description">{{ it.description }}</span>
            </span>
            <Icon v-if="it.showLink !== false" class="r4-navitems__chevron" name="ic-angle-right" />
          </a>
        </li>
      </ul>
    </nav>
  `,
})
