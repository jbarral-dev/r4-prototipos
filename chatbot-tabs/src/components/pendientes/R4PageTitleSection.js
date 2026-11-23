// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma (Específicos 1.0, nodo 1444:1056; VUE+AEM en el catálogo; Changelog SM-22066 «Crear nuevo componente», sin evolutivos). API = «API componente» de
// Confluence (R4PageTitleSection, 3677683730): title (obligatorio, siempre <h1>), description, breadcrumb (R4BreadcrumbProps = { items, homeHref }), helpButtonURL y helpLabel ('Ayuda').
// - mediaQuery, showNavigation, showHelpButton y showDescription (Figma) NO existen en código: el breakpoint lo resuelve el CSS (container query `r4page`) y cada parte se muestra si hay su dato.
// - Desktop/tablet: breadcrumb completo; mobile: el propio R4Breadcrumb muestra solo el enlace de retroceso (lo resuelve su CSS).
// - Orden DOM/AT: breadcrumb → título → HelpButton → descripción. Foco: breadcrumb → HelpButton.
// - Dependencias: R4Breadcrumb y R4Button (type=text, icono ic-question-circle--solid, size=large).
// NO reconstruido: la capa `Actions` de Figma (oculta por defecto, con R4Button) no está en la API de la doc; el HelpButton en mobile es medium en Figma y aquí sigue siendo large (la doc dice large; el tamaño es una prop de R4Button, no de CSS).
// Analítica (eventos Impression/HelpClick/BreadcrumbClick/BackLinkClick): no se implementa en el prototipo.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import R4Breadcrumb from './R4Breadcrumb.js'
import R4Button from './R4Button.js'

export default defineComponent({
  name: 'R4PageTitleSection',
  components: { R4Breadcrumb, R4Button },
  props: {
    title: { type: String, required: true },
    description: { type: String, default: undefined },
    breadcrumb: { type: Object, default: undefined }, // R4BreadcrumbProps: { items, homeHref? }
    helpButtonURL: { type: String, default: undefined },
    helpLabel: { type: String, default: 'Ayuda' },
  },
  emits: ['help'],
  setup(props, { emit }) {
    const openHelp = (e) => {
      emit('help', e)
      if (props.helpButtonURL) window.open(props.helpButtonURL, '_blank', 'noopener')
    }
    return { openHelp }
  },
  template: `
    <header class="r4-page-title-section">
      <R4Breadcrumb v-if="breadcrumb" v-bind="breadcrumb" />
      <div class="r4-page-title-section__headlines">
        <div class="r4-page-title-section__title-row">
          <h1 class="r4-page-title-section__title">{{ title }}</h1>
          <R4Button v-if="helpButtonURL" type="text" icon="ic-question-circle--solid" size="large" :aria-label="helpLabel" @click="openHelp" />
        </div>
        <p v-if="description" class="r4-page-title-section__description">{{ description }}</p>
      </div>
    </header>
  `,
})
