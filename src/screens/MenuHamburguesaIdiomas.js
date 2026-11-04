// Pantalla: menú hamburguesa con selector de idioma · caso Renta 4 Luxemburgo (usuario potencial, no logado). Sin diseño en Figma: se compone con lo ya reconstruido (Flujo B).
// Referencia de la web de Luxemburgo (captura de Jon) y benchmark PSG (Figma «Navegación - Potenciales», 1624:566): el PSG pone las entradas secundarias en una banda superior y el idioma abajo,
// en una capa propia; aquí, por decisión de Jon, el idioma va ARRIBA de la capa (R4SegmentedControls ES | EN) y la navegación entre sites es una lista aparte bajo la navegación principal.
// Mismo Menu y misma interacción que «Cliente logado» (hamburguesa ⇄ aspa, solo mobile, panel por la derecha). Sin caja de perfil. Main vacío (Jon).
// Datos de ejemplo: src/data/menu-hamburguesa.js (potencialLuxemburgo). El cambio de idioma solo cambia el valor seleccionado (no traduce los textos) y el atributo lang de la página.
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import _MenuHamburguesa from '../components/pendientes/_MenuHamburguesa.js'
import { potencialLuxemburgo } from '../data/menu-hamburguesa.js'

export default defineComponent({
  name: 'MenuHamburguesaIdiomas',
  components: { TemplateDetail, Menu, MenuHamburguesa: _MenuHamburguesa },
  setup() {
    document.title = 'Menú hamburguesa con idiomas · Luxemburgo · Prototipo R4'
    const abierto = ref(false)
    const idioma = ref(potencialLuxemburgo.languages.value)
    const languages = () => ({ ...potencialLuxemburgo.languages, value: idioma.value })
    const toggle = () => { abierto.value = !abierto.value }
    const navegar = (item) => { if (item && item.href) location.hash = item.href.replace(/^#/, '') }
    const cambiarIdioma = (v) => { idioma.value = v; document.documentElement.lang = v }

    watch(abierto, (v) => { document.documentElement.style.overflow = v ? 'hidden' : '' })
    const mq = window.matchMedia('(min-width: 600px)')
    const onMq = () => { if (mq.matches) abierto.value = false }
    onMounted(() => mq.addEventListener('change', onMq))
    onBeforeUnmount(() => { mq.removeEventListener('change', onMq); document.documentElement.style.overflow = '' })

    return { abierto, toggle, navegar, cambiarIdioma, languages, potencialLuxemburgo }
  },
  template: `
    <TemplateDetail>
      <template #header>
        <Menu type="default" burger-only-mobile :menu-open="abierto" menu-controls="menu-hamburguesa" @menu="toggle" />
      </template>
      <template #overlay>
        <MenuHamburguesa id="menu-hamburguesa" :open="abierto" :items="potencialLuxemburgo.items" :languages="languages()" :sites="potencialLuxemburgo.sites"
                         :cta-text="potencialLuxemburgo.ctaText" cta-icon="" :secondary-text="potencialLuxemburgo.secondaryText"
                         @close="abierto = false" @navigate="navegar" @language="cambiarIdioma" />
      </template>
    </TemplateDetail>
  `,
})
