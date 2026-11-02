// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.
// Reconstrucción desde Figma: componente "Menu" del archivo "Templates | 1.0" (antiguo, vigente) y, para las fichas de producto, el `Header` desktop (Cliente - Logado) y el `Menu`
// mobile (Type=Default, Cliente=Logado) del archivo "Proyectos - Fichas de Productos". No hay doc de API en Confluence.
// Eje Device (Desktop XL | Desktop | Tablet | Mobile) resuelto por el CSS (container query `r4page`), no por prop.
// Reconstruido: type=process (Cliente=Logado: Menu + R4ProgressBar) y type=default (Cliente=Logado).
//   · Desktop (≥ 1024): franja superior (Favoritos · Buscador · Tu asesor) + barra principal (isotipo · navegación · «Invertir» · perfil).
//   · Tablet y mobile (≤ 1023): barra compacta de 56 px (isotipo · buscar · hamburguesa roja). Tablet no tiene diseño: se usa la barra compacta porque la navegación de desktop no cabe.
// NO reconstruido: Type Blocked, Cliente=Sin logar, el menú desplegable (megamenú de desktop y panel del hamburguesa: no están en el diseño), la foto del asesor (es una imagen del
//   diseño: se pinta una inicial), los submenús (los ítems con `hasChildren` solo llevan la flecha).
// Datos de ejemplo (prototipo): navItems, userName, advisor.
// Extra del prototipo del buscador unificado: slot `search` (sustituye al enlace «Buscador» de la franja superior en desktop; en tablet/mobile el botón de la lupa emite `search`).
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
    navItems: { type: Array, default: () => [{ label: 'Mi cuenta' }, { label: 'Análisis' }, { label: 'Asesoramiento' }] }, // { label, href?, hasChildren? }
    ctaText: { type: String, default: 'Invertir' },
    userName: { type: String, default: 'ROBERTO' },
    hasNotifications: { type: Boolean, default: true },
    advisorLabel: { type: String, default: 'Tu asesor' },
    searchIcon: { type: String, default: 'search' }, // extra del prototipo del buscador unificado: icono del botón de búsqueda de la barra compacta
  },
  emits: ['back', 'close', 'menu', 'search'],
  template: `
    <header class="menu" :class="'menu--' + type">
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
          <div class="menu__top">
            <div class="menu__top-content">
              <a class="menu__top-item" href="#"><Icon name="ic-star" /><span>Favoritos</span></a>
              <slot name="search"><a class="menu__top-item" href="#"><Icon name="search" /><span>Buscador</span></a></slot>
              <a class="menu__top-item menu__top-item--advisor" href="#"><span class="menu__avatar menu__avatar--small" aria-hidden="true">A</span><span>{{ advisorLabel }}</span></a>
            </div>
          </div>
          <div class="menu__main">
            <div class="menu__main-content">
              <div class="menu__left">
                <a class="menu__isotype-link" href="#" aria-label="Renta 4 Banco, inicio"><R4BrandTypes class="menu__isotype" content="Isotype" theme="Dark" variant="White" /></a>
                <nav aria-label="Principal">
                  <ul class="menu__nav">
                    <li v-for="(it, i) in navItems" :key="i"><a class="menu__nav-item" :href="it.href || '#'"><span>{{ it.label }}</span><Icon v-if="it.hasChildren" name="ic-angle-down" /></a></li>
                  </ul>
                </nav>
              </div>
              <div class="menu__right">
                <R4Button type="secondary" :text="ctaText" />
                <a class="menu__profile" href="#" :aria-label="'Perfil de ' + userName">
                  <span class="menu__avatar" aria-hidden="true">{{ userName.charAt(0) }}<span v-if="hasNotifications" class="menu__avatar-dot"></span></span>
                  <span class="menu__profile-name"><span>Hola, {{ userName }}</span><Icon name="ic-angle-down" /></span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="menu__compact">
          <a class="menu__isotype-link" href="#" aria-label="Renta 4 Banco, inicio"><R4BrandTypes class="menu__isotype" content="Isotype" theme="Dark" variant="White" /></a>
          <div class="menu__compact-actions">
            <button type="button" class="menu__compact-button" aria-label="Buscar" @click="$emit('search')"><Icon :name="searchIcon" /></button>
            <button type="button" class="menu__compact-button menu__compact-button--burger" aria-label="Menú" aria-haspopup="true" aria-expanded="false" @click="$emit('menu')"><Icon name="ic-bars" /></button>
          </div>
        </div>
      </template>
    </header>
  `,
})
