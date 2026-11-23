// VERSIÓN 2 (nuevo enfoque tras la reunión de equipo del 2026-11-04; arranca como copia de la v1, que se conserva sin cambios). Pantalla: menú hamburguesa con selector de idioma · caso Renta 4 Luxemburgo (usuario potencial, no logado). Sin diseño en Figma: se compone con lo ya reconstruido (Flujo B).
// Diseño: Figma «Navegación - Potenciales» (bYhmzXdiu7ugIr8U2vY8Hp), sección «Mobile - Menu - idiomas y Sites» (1714:11479): tras la navegación, dos NavigationItem con card (idioma actual con ic-flag-alt y site
// actual con ic-globe) que abren una capa con R4InputRadio type=button («Idiomas» / «Otros sites»). Al cambiar de opción se cierra el menú y se navega al site o a la versión del idioma elegidos.
// Mismo Menu y misma interacción que «Cliente logado» (hamburguesa ⇄ aspa, solo mobile, panel por la derecha). Sin caja de perfil (usuario potencial). Main vacío (Jon).
// Datos de ejemplo: src/data/menu-hamburguesa.js (potencialLuxemburgo). El cambio de idioma solo cambia el valor seleccionado (no traduce los textos) y el atributo lang de la página;
// elegir otro site solo cambia el hash de la URL (los destinos son ficticios), así que el site actual sigue siendo Luxemburgo.
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import _MenuHamburguesa from '../components/pendientes/_MenuHamburguesa.js'
import { potencialLuxemburgo } from '../data/menu-hamburguesa.js'

export default defineComponent({
  name: 'MenuHamburguesaIdiomasV2',
  components: { TemplateDetail, Menu, MenuHamburguesa: _MenuHamburguesa },
  setup() {
    document.title = 'Menú hamburguesa con idiomas · Luxemburgo · v2 · Prototipo R4'
    const abierto = ref(false)
    const idioma = ref(potencialLuxemburgo.languages.value)
    const languages = () => ({ ...potencialLuxemburgo.languages, value: idioma.value }) // el idioma elegido es el único estado que cambia; el site actual es siempre Luxemburgo
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
                         :cta-text="potencialLuxemburgo.ctaText" :cta-icon="potencialLuxemburgo.ctaIcon" :secondary-text="potencialLuxemburgo.secondaryText" :secondary-icon="potencialLuxemburgo.secondaryIcon"
                         @close="abierto = false" @navigate="navegar" @language="cambiarIdioma" />
      </template>
    </TemplateDetail>
  `,
})
