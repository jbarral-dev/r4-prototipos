// PENDIENTE-IT: no oficial. Cabecera de la App (solo mobile) para el prototipo del buscador unificado, usuario «App». Fuente: Figma «Proyectos - Chatbot» 54:1612 (390 × 56), que es una IMAGEN recortada de la App:
// no hay capas ni variables que leer, así que las medidas se leyeron de la captura (menú hamburguesa · isotipo rojo de R4 · título centrado «Inicio» · lupa) y el color del título es una inferencia (text/subdued).
// Se sustituye el icono de lupa de la App por el nuevo acceso `ic-search-ai` (documentación 3.1: «App · Icono lupa IA»), con el badge de conversación activa como en el Menu.
// Props: title (por defecto «Inicio»), searchBadge, searchIcon (por defecto ic-search-ai). Eventos: search, menu. Fija arriba (sticky) al hacer scroll.
import { defineComponent } from '../../../vendor/vue.esm-browser.prod.js'
import Icon from '../../icons/_Icon.js'
import R4BrandTypes from './R4BrandTypes.js'
import R4Badge from './R4Badge.js'

export default defineComponent({
  name: '_AppHeader',
  components: { Icon, R4BrandTypes, R4Badge },
  props: {
    title: { type: String, default: 'Inicio' },
    searchBadge: { type: Boolean, default: false },
    searchIcon: { type: String, default: 'ic-search-ai' },
  },
  emits: ['search', 'menu'],
  template: `
    <header class="app-header">
      <button type="button" class="app-header__button app-header__menu" aria-label="Abrir menú" @click="$emit('menu')"><Icon name="ic-bars" /></button>
      <a class="app-header__logo" href="#" aria-label="Renta 4 Banco, inicio"><R4BrandTypes content="Isotype" variant="Red" /></a>
      <p class="app-header__title">{{ title }}</p>
      <button type="button" class="app-header__button app-header__search" aria-haspopup="dialog" :aria-label="searchBadge ? 'Buscar (conversación activa)' : 'Buscar'" @click="$emit('search')">
        <Icon :name="searchIcon" /><R4Badge v-if="searchBadge" class="app-header__badge" tone="highlight" :outline="false" decorative />
      </button>
    </header>
  `,
})
