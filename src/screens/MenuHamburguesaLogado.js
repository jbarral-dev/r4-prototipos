// Pantalla: menú hamburguesa · Cliente logado. Figma «Navegación - Potenciales» (bYhmzXdiu7ugIr8U2vY8Hp), sección «Mobile - Menu - Cliente Logado» (1555:1109):
//   página vacía con cabecera (1555:1110), capa de nivel 1 (1572:13077) y capa de segundo nivel de «Tu cuenta» (1668:2393). Tablet y desktop: no hay diseño.
// Composición (TemplateDetail, superficie gris, sin Footer): Menu type=default + Main VACÍO (así lo pide Jon) + el panel _MenuHamburguesa en la capa `overlay`.
// Responsive: la hamburguesa y el panel solo existen en mobile (< 600, por decisión de Jon). En tablet la barra compacta se queda sin hamburguesa (Menu `burgerOnlyMobile`):
//   queda por resolver con diseño cómo se navega en tablet. Si se ensancha la ventana con el panel abierto, se cierra y se libera el scroll.
// Interacción: hamburguesa ⇄ aspa · panel y capas entran por la derecha · los destinos son hashes ficticios (#/tu-perfil…): al navegar se cierra el panel y cambia el hash de la URL.
// Datos de ejemplo: src/data/menu-hamburguesa.js.
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from '../../vendor/vue.esm-browser.prod.js'
import TemplateDetail from '../templates/TemplateDetail.js'
import Menu from '../components/pendientes/Menu.js'
import _MenuHamburguesa from '../components/pendientes/_MenuHamburguesa.js'
import { clienteLogado } from '../data/menu-hamburguesa.js'

export default defineComponent({
  name: 'MenuHamburguesaLogado',
  components: { TemplateDetail, Menu, MenuHamburguesa: _MenuHamburguesa },
  setup() {
    document.title = 'Menú hamburguesa · Cliente logado · Prototipo R4'
    const abierto = ref(false)
    const toggle = () => { abierto.value = !abierto.value }
    const navegar = (item) => { if (item && item.href) location.hash = item.href.replace(/^#/, '') }

    // El panel bloquea el scroll de la página mientras está abierto, y se cierra si la ventana deja de ser mobile
    watch(abierto, (v) => { document.documentElement.style.overflow = v ? 'hidden' : '' })
    const mq = window.matchMedia('(min-width: 600px)')
    const onMq = () => { if (mq.matches) abierto.value = false }
    onMounted(() => mq.addEventListener('change', onMq))
    onBeforeUnmount(() => { mq.removeEventListener('change', onMq); document.documentElement.style.overflow = '' })

    return { abierto, toggle, navegar, clienteLogado }
  },
  template: `
    <TemplateDetail>
      <template #header>
        <Menu type="default" burger-only-mobile :menu-open="abierto" menu-controls="menu-hamburguesa" @menu="toggle" />
      </template>
      <template #overlay>
        <MenuHamburguesa id="menu-hamburguesa" :open="abierto" :user="clienteLogado.user" :items="clienteLogado.items" :favoritos="clienteLogado.favoritos"
                         @close="abierto = false" @navigate="navegar" />
      </template>
    </TemplateDetail>
  `,
})
