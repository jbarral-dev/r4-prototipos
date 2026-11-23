// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma de R4Section (era VUE en el catálogo; Changelog SM-24225, SM-22065). API = "API componente" de
// Confluence (R4Section, 3506929667): title, appearance (plain | boxed), backgroundColor (transparent | white | subtleGrey),
// helpButtonURL, moreLinkURL, moreLinkLabel ('Ver todos') y slot por defecto.
// - Figma tiene showHeader / showHelpButton / showMoreLink / mediaQuery: en código NO existen. La cabecera se muestra si hay `title`;
//   el HelpButton si hay `helpButtonURL`; el enlace si hay `moreLinkURL`. Los breakpoints (desktop / tablet / mobile) los resuelve el
//   CSS (container query `r4page`).
// - Semántica: <section aria-labelledby> + <h2>. Orden DOM/AT: título → enlace → slot; foco: HelpButton → enlace → slot.
// - Se han leído sus 12 variantes de Figma. Dependencias: R4Button (type=text, icono ic-question-circle--solid) y R4Link (standalone, medium, ic-angle-right).
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import R4Button from './R4Button.js'
import R4Link from './R4Link.js'
import { iconComponent } from '../../icons/_Icon.js'

let uid = 0
const IcAngleRight = iconComponent('ic-angle-right')

export default defineComponent({
  name: 'R4Section',
  components: { R4Button, R4Link },
  props: {
    title: { type: String, default: null },
    appearance: { type: String, default: 'plain', validator: (v) => ['plain', 'boxed'].includes(v) },
    backgroundColor: { type: String, default: 'transparent', validator: (v) => ['transparent', 'white', 'subtleGrey'].includes(v) },
    helpButtonURL: { type: String, default: undefined },
    moreLinkURL: { type: String, default: undefined },
    moreLinkLabel: { type: String, default: 'Ver todos' },
  },
  emits: ['help', 'more'],
  setup(props, { emit }) {
    const titleId = `r4-section-title-${++uid}`
    const openHelp = (e) => {
      emit('help', e)
      if (props.helpButtonURL) window.open(props.helpButtonURL, '_blank', 'noopener')
    }
    return { titleId, openHelp, IcAngleRight }
  },
  template: `
    <section class="r4-section" :class="['r4-section--' + appearance, appearance === 'boxed' ? 'r4-section--bg-' + backgroundColor : null]"
             :aria-labelledby="title ? titleId : undefined">
      <header v-if="title" class="r4-section__header">
        <div class="r4-section__title-wrapper">
          <h2 :id="titleId" class="r4-section__title">{{ title }}</h2>
          <R4Button v-if="helpButtonURL" type="text" icon="ic-question-circle--solid" size="large" :aria-label="'Ayuda: ' + title" @click="openHelp" />
        </div>
        <R4Link v-if="moreLinkURL" class="r4-section__more" type="standalone" size="medium" :href="moreLinkURL" :icon-right="IcAngleRight" @click="$emit('more', $event)">{{ moreLinkLabel }}</R4Link>
      </header>
      <div class="r4-section__slot"><slot /></div>
    </section>
  `,
})
