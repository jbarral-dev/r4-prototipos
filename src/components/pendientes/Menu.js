// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma: componente "Menu" del archivo "R4 Design System | Templates | 1.0" (nodo 11704:13876, el que está EN PRODUCCIÓN según Jon, 2026-11-03; sustituye a la
// versión más nueva de las fichas, que está lejos de implementarse). No hay doc de API en Confluence. Mezcla generaciones de tokens: se usan los nuevos (ver Menu.css).
// Eje Device (Desktop XL | Desktop | Tablet | Mobile) resuelto por el CSS (container query `r4page`), no por prop.
// Reconstruido: type=process (Cliente=Logado: Menu + R4ProgressBar; sin tocar en esta revisión) y type=default (Cliente=Logado):
//   · Desktop (≥ 1024): franja de usuario (favoritos · perfil · cerrar sesión) + barra principal (isotipo · ítems · buscar · «Contratar») + submenú (enlaces de la sección).
//   · Tablet (600–1023): barra compacta de 76 (isotipo · buscar · hamburguesa roja 48). Mobile (≤ 599): barra de 56 (isotipo · buscar 56 · hamburguesa 56 a sangre).
// NO reconstruido: Type Blocked, Cliente=Sin logar y Potencial, el menú desplegable (megamenú de desktop y panel del hamburguesa: no se ha leído) ni los submenús de cada ítem; estados pressed y disabled
//   de los ítems de la barra (Figma solo da color al hover: #707070). Leídos: ítem de la barra Default/Hover/Current y ítem del submenú Default/Active (texto y trazo inferior de 2 en accent).
// Discrepancias de Figma (generación antigua): el «Desktop» de 1024 solapa los ítems con la lupa y el botón (no caben en 1024: se deja scroll horizontal en los ítems); el botón «Contratar» pasa a solo icono
//   (ic-plus-square) por debajo de 1280 como en esa variante; la pestaña activa lleva un trazo superior #3b3b3b literal (no tiene variable).
// Datos de ejemplo (prototipo): navItems, subNavItems, userName.
// Extra del prototipo del buscador unificado: slot `search` (sustituye al botón de la lupa de la barra principal en desktop; en tablet/mobile el botón de la lupa emite `search`) y `searchIcon`.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import R4ProgressBar from './R4ProgressBar.js'
import R4BrandTypes from './R4BrandTypes.js'
import R4Button from './R4Button.js'
import _MenuBranding from './_MenuBranding.js'
import Icon from '../../icons/_Icon.js'

export default defineComponent({
  name: 'Menu',
  components: { R4ProgressBar, R4BrandTypes, R4Button, MenuBranding: _MenuBranding, Icon },
  props: {
    type: { type: String, default: 'process', validator: (v) => ['process', 'default'].includes(v) },
    // type=process
    processTitle: { type: String, default: '' },
    currentStep: { type: Number, default: 1 },
    totalSteps: { type: Number, default: 3 },
    showClose: { type: Boolean, default: true },
    // type=default
    navItems: { type: Array, default: () => [{ label: 'Tu cuenta' }, { label: 'Carteras gestionadas' }, { label: 'Fondos y planes' }, { label: 'Bolsas y derivados', current: true }, { label: 'Renta fija' }, { label: 'Soluciones Easy' }, { label: 'Análisis e ideas' }] }, // { label, href?, current? }
    subNavItems: { type: Array, default: () => [
      { label: 'Bolsas', href: 'https://www.r4.com/portal?TX=goto&FWD=MAIN11&PORTLET=BLS002&PAG=1', current: true },
      { label: 'ETFs', href: 'https://www.r4.com/productos-inversion/etfs' },
      { label: 'CFDs', href: 'https://www.r4.com/portal?TX=carteras&OPC=37&HOJA=4&INT=7&CAB=10&PAG=11' },
      { label: 'Derivados', href: 'https://www.r4.com/portal?TX=carteras&CTD=FYO&OPC=37&INT=4&PAG=8&HOJA=1&CAB=8' },
      { label: 'Warrants', href: 'https://www.r4.com/portal?TX=carteras&OPC=37&PAG=8&HOJA=5&CAB=7&INT=3' },
      { label: 'Criptoactivos', href: 'https://www.r4.com/productos-inversion/cripto' },
    ] }, // { label, href?, current? }: hijos de la sección actual (Bolsas y derivados)
    ctaText: { type: String, default: 'Contratar' },
    userName: { type: String, default: 'Alex' },
    // Extras del prototipo del menú hamburguesa (Figma «Navegación - Potenciales», 1572:13100): con el panel abierto la hamburguesa pasa a aspa (ic-times-thin, derivado de la hamburguesa: no es de Figma) y aria-expanded=true;
    // burgerOnlyMobile oculta la hamburguesa por encima de 599 (por decisión de Jon el panel es solo mobile); menuControls = id del panel (aria-controls).
    menuOpen: { type: Boolean, default: false },
    burgerOnlyMobile: { type: Boolean, default: false },
    menuControls: { type: String, default: undefined },
    searchIcon: { type: String, default: undefined }, // extra del prototipo del buscador unificado: icono propio para los botones de búsqueda (por defecto, los de Figma)
  },
  emits: ['back', 'close', 'menu', 'search'],
  template: `
    <header class="menu" :class="['menu--' + type, { 'menu--burger-mobile': burgerOnlyMobile }]">
      <template v-if="type === 'process'">
        <div class="menu__bar">
          <div class="menu__bar-content">
            <div class="menu__branding">
              <MenuBranding class="menu__branding-logotype" />
              <R4BrandTypes class="menu__branding-isotype" content="Isotype" theme="Dark" variant="White" />
            </div>
            <a class="menu__help" href="#">
              <Icon name="ic-question-circle" />
              <span>Ayuda</span>
            </a>
          </div>
        </div>
        <R4ProgressBar :title="processTitle" :current-step="currentStep" :total-steps="totalSteps" :show-close="showClose" @back="$emit('back')" @close="$emit('close')" />
      </template>

      <template v-else>
        <div class="menu__desktop">
          <div class="menu__user">
            <div class="menu__user-content">
              <R4Button type="text" size="large" icon="star" aria-label="Favoritos" />
              <span class="menu__divider" aria-hidden="true"></span>
              <a class="menu__profile" href="#">
                <span class="menu__profile-main"><Icon name="ic-user-circle" /><span class="menu__profile-name">Hola, {{ userName }}</span></span>
                <Icon name="chevron-down" />
              </a>
              <a class="menu__logout" href="#" aria-label="Cerrar sesión"><Icon name="ic-power-off" /></a>
            </div>
          </div>
          <div class="menu__main">
            <div class="menu__main-content">
              <div class="menu__left">
                <a class="menu__isotype-link" href="#" aria-label="Renta 4 Banco, inicio"><R4BrandTypes class="menu__isotype" content="Isotype" theme="Dark" variant="White" /></a>
                <nav class="menu__nav-wrap" aria-label="Principal">
                  <ul class="menu__nav">
                    <li v-for="(it, i) in navItems" :key="i"><a class="menu__nav-item" :class="{ 'menu__nav-item--current': it.current }" :href="it.href || '#'" :aria-current="it.current ? 'page' : undefined">{{ it.label }}</a></li>
                  </ul>
                </nav>
              </div>
              <div class="menu__right">
                <slot name="search"><button type="button" class="menu__search" aria-label="Buscar" @click="$emit('search')"><Icon :class="{ 'menu__search-ai': searchIcon }" :name="searchIcon || 'ic-search-24'" /></button></slot>
                <R4Button class="menu__cta" type="primary" size="large" icon="ic-plus-square" :text="ctaText" />
                <R4Button class="menu__cta menu__cta--icon" type="primary" size="large" icon="ic-plus-square" :aria-label="ctaText" />
              </div>
            </div>
          </div>
          <div class="menu__sub">
            <nav class="menu__sub-content" aria-label="Secundaria">
              <ul class="menu__sub-list">
                <li v-for="(it, i) in subNavItems" :key="i"><a class="menu__sub-item" :class="{ 'menu__sub-item--current': it.current }" :href="it.href || '#'" :aria-current="it.current ? 'page' : undefined">{{ it.label }}</a></li>
              </ul>
            </nav>
          </div>
        </div>

        <div class="menu__compact">
          <a class="menu__isotype-link" href="#" aria-label="Renta 4 Banco, inicio"><R4BrandTypes class="menu__isotype" content="Isotype" theme="Dark" variant="White" /></a>
          <div class="menu__compact-actions">
            <button type="button" class="menu__compact-button menu__compact-button--search" aria-label="Buscar" @click="$emit('search')">
              <Icon v-if="searchIcon" class="menu__icon-custom" :name="searchIcon" />
              <template v-else><Icon class="menu__icon-tablet" name="ic-search-24" /><Icon class="menu__icon-mobile" name="search" /></template>
            </button>
            <button type="button" class="menu__compact-button menu__compact-button--burger" :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'" :aria-expanded="menuOpen ? 'true' : 'false'" :aria-controls="menuControls" @click="$emit('menu')"><Icon :name="menuOpen ? 'ic-times-thin' : 'ic-bars'" /></button>
          </div>
        </div>
      </template>
    </header>
  `,
})
