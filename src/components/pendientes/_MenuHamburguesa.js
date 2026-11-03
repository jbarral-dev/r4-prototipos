// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma: «Menu Layer» + «Button Group» del archivo «Navegación - Potenciales» (bYhmzXdiu7ugIr8U2vY8Hp; nivel 1 = 1572:13077, nivel 2 = 1668:2393). Es el panel del menú hamburguesa
// (Menu en mobile). No hay doc de API en Confluence ni componente propio en el catálogo: se compone solo con R4NavigationItems, R4Link y R4Button. La capa «Header» del frame de Figma NO se construye
// (es solo una limitación de Figma, Jon): la cabecera real es el Menu, que con el panel abierto muestra el aspa (Menu `menuOpen`).
// Interacción (la define Jon; el diseño solo muestra dos niveles estáticos): el panel entra desde la derecha ocupando todo el ancho y el alto bajo la cabecera; cada ítem con hijos abre otra capa
// que entra desde la derecha (cualquier profundidad, mismo patrón); «Volver» la devuelve a la derecha y vuelve a la anterior; la capa de un ítem con hijos lleva un enlace con su nombre a su propia página
// (cierra el panel y navega); el ítem de usuario navega a «Tu perfil» y cierra; los CTA («Contratar», «Cerrar sesión») quedan fijos abajo.
// Props (extras del prototipo, no vienen de ninguna API): `open`, `user` { name, description, href }, `items` árbol { title, href, children? }, `favoritos`, `ctaText`, `logoutText`, `id`.
// Eventos: `close` (el panel pide cerrarse), `navigate` (item).
// Accesibilidad (decisión propia, sin guía en la doc): panel con role="region" y aria-label «Menú»; solo la capa superior es interactiva (las de debajo, `inert`); al abrir una capa el foco va a «Volver»,
// al volver, al ítem que la abrió; Escape retrocede una capa o, en la primera, cierra. No hay focus trap: el aspa de la cabecera, que sigue visible, es la salida natural.
// Movimiento: transición propia de 0,28 s (como R4Sheet; Figma no define movimiento) y sin ella con prefers-reduced-motion.
import { defineComponent, ref, computed, watch, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4NavigationItems from './R4NavigationItems.js'
import R4Link from './R4Link.js'
import R4Button from './R4Button.js'
import { iconComponent } from '../../icons/_Icon.js'

const IcArrowLeft = iconComponent('ic-arrow-left')

export default defineComponent({
  name: '_MenuHamburguesa',
  components: { R4NavigationItems, R4Link, R4Button },
  props: {
    open: { type: Boolean, default: false },
    id: { type: String, default: 'menu-hamburguesa' },
    user: { type: Object, default: null },
    items: { type: Array, required: true },
    favoritos: { type: Object, default: null },
    ctaText: { type: String, default: 'Contratar' },
    logoutText: { type: String, default: 'Cerrar sesión' },
  },
  emits: ['close', 'navigate'],
  setup(props, { emit }) {
    const path = ref([]) // nodos abiertos, de nivel 2 en adelante
    const root = ref(null)
    let openers = [] // elemento que abrió cada capa, para devolverle el foco

    const toItem = (it, extra) => ({ title: it.title, icon: it.icon, linkHref: it.href || '#', showLink: !!(it.children && it.children.length), ...extra, node: it })
    const userItems = computed(() => (props.user ? [{ title: props.user.name, description: props.user.description, icon: 'ic-user', linkHref: props.user.href, showLink: true, user: true }] : []))
    const mainItems = computed(() => props.items.map((it) => toItem(it, { showLine: false })))
    const favItems = computed(() => (props.favoritos ? [toItem(props.favoritos, { showLine: false })] : []))
    const levelItems = (node) => node.children.map((it, i) => toItem(it, { showLine: i < node.children.length - 1 }))

    const panes = computed(() => [{ key: 'root', node: null }, ...path.value.map((n, i) => ({ key: 'n' + i + n.title, node: n }))])

    const focusPane = async (target) => {
      await nextTick()
      const pane = root.value && root.value.querySelector('.menu-hamburguesa__pane:last-child')
      const el = target ? target(pane) : pane && pane.querySelector('a')
      if (el) el.focus({ preventScroll: true })
    }
    const go = (node, e) => { emit('navigate', node); emit('close') }
    const select = (it, e) => {
      e.preventDefault()
      if (it.node && it.node.children && it.node.children.length) {
        openers.push(e.currentTarget)
        path.value = [...path.value, it.node]
        focusPane()
      } else {
        emit('navigate', it.user ? { title: props.user.name, href: props.user.href } : it.node)
        emit('close')
      }
    }
    const back = () => {
      if (!path.value.length) return
      path.value = path.value.slice(0, -1)
      const opener = openers.pop()
      nextTick().then(() => opener && opener.isConnected && opener.focus({ preventScroll: true }))
    }
    const onKeydown = (e) => { if (e.key === 'Escape' && props.open) { e.stopPropagation(); path.value.length ? back() : emit('close') } }
    // Al cerrarse el panel se vuelve al primer nivel (cuando termina la transición de salida)
    const reset = () => { path.value = []; openers = [] }
    watch(() => props.open, (v) => { if (v) { reset() } })

    return { root, path, panes, userItems, mainItems, favItems, levelItems, select, back, go, onKeydown, reset, IcArrowLeft }
  },
  template: `
    <Transition name="menu-hamburguesa" @after-leave="reset">
      <div v-if="open" :id="id" ref="root" class="menu-hamburguesa" role="region" aria-label="Menú" @keydown="onKeydown">
        <div class="menu-hamburguesa__stage">
          <TransitionGroup name="menu-pane" tag="div" class="menu-hamburguesa__panes">
            <div v-for="(p, i) in panes" :key="p.key" class="menu-hamburguesa__pane" :inert="i < panes.length - 1">
              <template v-if="!p.node">
                <R4NavigationItems v-if="userItems.length" size="medium" has-card-container :items="userItems" aria-label="Tu perfil" @select="select" />
                <R4NavigationItems size="medium" :icon-is-boxed="false" :items="mainItems" aria-label="Secciones" @select="select" />
                <R4NavigationItems v-if="favItems.length" size="medium" :icon-is-boxed="false" :items="favItems" aria-label="Accesos directos" @select="select" />
              </template>
              <template v-else>
                <R4Link class="menu-hamburguesa__back" type="standalone" size="medium" href="#" :icon-left="IcArrowLeft" @click.prevent="back">Volver</R4Link>
                <div class="menu-hamburguesa__section">
                  <R4Link class="menu-hamburguesa__title" type="standalone" size="large" :href="p.node.href" @click.prevent="go(p.node)">{{ p.node.title }}</R4Link>
                  <R4NavigationItems size="medium" :icon-is-boxed="false" :items="levelItems(p.node)" :aria-label="p.node.title" @select="select" />
                </div>
              </template>
            </div>
          </TransitionGroup>
        </div>
        <div class="menu-hamburguesa__actions">
          <R4Button type="primary" size="large" width="full-width" icon="ic-plus-square" :text="ctaText" />
          <R4Button type="secondary" size="large" width="full-width" icon="ic-power-off" :text="logoutText" @click="$emit('close')" />
        </div>
      </div>
    </Transition>
  `,
})
