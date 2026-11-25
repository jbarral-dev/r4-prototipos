// PENDIENTE-IT: no oficial. Prototipo de investigación (variante E: un solo campo decide el modo). NO es un componente del catálogo ni tiene diseño en Figma ni página en Confluence:
// es una COMPOSICIÓN de componentes reconstruidos (R4Tabs, R4Chip, R4Button, _SearchResultItem) con tokens semánticos; lo que no cubre ningún componente
// (burbujas de mensaje, tarjeta «Preguntar», filas de ejemplos) son estilos propios mínimos y se avisan en «Pendiente / dudas».
// Contrato: recibe el estado compartido (`api`, ver screens/_buscadorEstado.js) y pinta, bajo el campo, el panel según el modo: vacío (ejemplos) · Resultados · Conversación.
// Hace visible y corregible el modo: selector Resultados | Conversación (siempre que haya modo) + frase que explica por qué se activó + región aria-live que lo anuncia.
// Patrón «Búsqueda y selección de elementos» (Confluence 3950968833): sin coincidencias → estado vacío que dice qué se buscó y ofrece salida (aquí, preguntar al asistente).
import { defineComponent, computed, ref, watch, nextTick } from '../../../vendor/vue.esm-browser.prod.js'
import R4Tabs from './R4Tabs.js'
import R4Chip from './R4Chip.js'
import R4NavigationItems from './R4NavigationItems.js'
import R4Button from './R4Button.js'
import R4Text from './R4Text.js'
import R4Link from './R4Link.js'
import R4BrandTypes from './R4BrandTypes.js'
import R4ListIcon from './R4ListIcon.js'
import R4Notification from './R4Notification.js'
import _ChatComposer from './_ChatComposer.js'
import _SearchResultItem from './_SearchResultItem.js'
import R4SearchResults from './R4SearchResults.js'
import Icon from '../../icons/_Icon.js'

let panelUid = 0

export default defineComponent({
  name: '_UnifiedSearchPanel',
  components: { R4Link, R4BrandTypes, R4Text, R4ListIcon, R4Tabs, R4Chip, R4NavigationItems, R4Button, R4Notification, ChatComposer: _ChatComposer, R4SearchResults, SearchResultItem: _SearchResultItem, Icon },
  props: { api: { type: Object, required: true } },
  setup(props) {
    const uid = ++panelUid // el panel se monta dos veces (desplegable y capa a pantalla completa): ids únicos
    const bodyId = 'usearch-body-' + uid
    const modeTabs = [
      { label: 'Buscador', id: 'usearch-tab-search-' + uid, panelId: bodyId },
      { label: 'Chat', id: 'usearch-tab-chat-' + uid, panelId: bodyId },
    ]
    const activeTab = computed(() => (props.api.mode === 'chat' ? 1 : 0))
    const onTab = (i) => props.api.setMode(i === 1 ? 'chat' : 'search')
    // Pregunta a medio escribir (el enrutado ya la ve como pregunta): se mantiene la pantalla inicial hasta que el usuario pulsa Intro
    const preguntaPendiente = computed(() => props.api.mode === 'chat' && !props.api.thread.length && !props.api.locked && !!props.api.query.trim())
    const vacio = computed(() => !props.api.mode || preguntaPendiente.value || (props.api.mode === 'search' && !props.api.searchTerm))
    const valores = computed(() => props.api.results.filter((r) => r.kind !== 'ayuda'))
    const ayuda = computed(() => props.api.results.filter((r) => r.kind === 'ayuda'))
    const anuncio = computed(() => {
      const a = props.api
      if (!a.mode) return ''
      if (a.mode === 'chat') return a.thread.length ? 'Modo conversación.' : 'Modo conversación: pulsa Intro para preguntar al asistente.'
      return `Modo resultados: ${a.results.length} resultados.`
    })
    const body = ref(null)
    watch(() => [props.api.thread.length, props.api.pending], async () => { await nextTick(); if (body.value) body.value.scrollTop = body.value.scrollHeight })
    // El prompt tiene el foco en cuanto se pinta la conversación (el panel se monta dos veces; el campo del host oculto no admite foco)
    const composer = ref(null)
        // Enlaces del asistente: uno suelto (R4Link standalone) o varios en lista con viñetas; nunca varios en fila
    const enlacesLista = (m) => m.lista || (m.links && m.links.length > 1 ? m.links : null)
    const pick = (name, e) => { e.preventDefault(); props.api.abrirResultado(name) }
    // Estado inicial: con historial se muestran las búsquedas y preguntas del usuario (icono de histórico); sin historial, sugerencias (lupa y comentario)
    const hayBusquedas = computed(() => props.api.historial.busquedas.length > 0)
    const busquedas = computed(() => (hayBusquedas.value ? props.api.historial.busquedas : props.api.populares).map((t) => ({ texto: t, icon: hayBusquedas.value ? 'ic-history' : 'ic-search' })))
    const tituloBusquedas = computed(() => (hayBusquedas.value ? 'Tus últimas búsquedas' : 'Búsquedas frecuentes'))
    const tituloPreguntas = computed(() => (props.api.historial.conversaciones.length ? 'Tus conversaciones' : 'Conversaciones frecuentes'))
    const preguntas = computed(() => (props.api.historial.conversaciones.length
      ? props.api.historial.conversaciones.map((c) => ({ texto: c.titulo, conv: c, icon: 'ic-history' }))
      : props.api.ejemplosPregunta.slice(0, 3).map((t) => ({ texto: t, icon: 'ic-comments-alt' }))))
    // Filas de «Preguntas»: R4NavigationItems (sin icono en caja ni flecha); `conv` / `texto` viajan en el ítem para saber qué abrir
    // «Últimas preguntas»: las 5 más recientes y, si hay más, «Ver todas» (abre el listado completo del histórico)
    const hayMas = computed(() => props.api.historial.conversaciones.length > 5)
    const historialItems = computed(() => props.api.historial.conversaciones.map((c) => ({ title: c.titulo, description: c.fecha, icon: 'ic-history', linkHref: '#', showLink: false, conv: c })))
    const enListado = computed(() => props.api.vista === 'historial' && vacio.value)
    const onListado = (it, e) => { e.preventDefault(); props.api.abrirConversacion(it.conv, 'historial') }
    const preguntaItems = computed(() => preguntas.value.slice(0, 5).map((q) => ({ title: q.texto, icon: q.icon, linkHref: '#', showLink: false, conv: q.conv })))
    const onPregunta = (it, e) => { e.preventDefault(); if (it.conv) props.api.abrirConversacion(it.conv); else props.api.preguntar(it.title) }
    // Props del searchResultItem (diseño con mercado) a partir de una fila del catálogo; `highlight` = lo buscado
    // Pantalla de inicio del usuario nuevo (Figma «Proyectos - Chatbot» 58:2443): ilustración, título y 2 viñetas (R4ListIcon medium). Con historial se mantienen sus búsquedas y preguntas.
    const hayHistorial = computed(() => props.api.historial.busquedas.length > 0 || props.api.historial.conversaciones.length > 0)
    const ilustracion = new URL('../../assets/illustrations/il-search-ai.svg', import.meta.url).href
    const introItems = [
      { icon: 'ic-search', text: 'Busca un producto introduciendo su nombre o ISIN.' },
      { icon: 'ic-comments-alt', text: 'Formula una pregunta, pulsa “Enter” y comenzaremos un chat.' },
    ]
    // Barra «¿No encuentras lo que buscas?»: fija abajo con los resultados a la vista (como en «Chatbot»)
    const mostrarBarra = computed(() => false) // sin barra fija de «¿No encuentras…?»: la pestaña Chat lleva al asistente
    const itemProps = (r) => ({ name: r.name, logoSrc: r.logoSrc, logoText: r.logoText, metadata1: r.metadata1, metadata2: r.metadata2, market: r.market, marketFlag: r.marketFlag, type: r.type, highlight: props.api.searchTerm })
    return { hayMas, historialItems, enListado, onListado, enlacesLista, hayHistorial, ilustracion, introItems, mostrarBarra, itemProps, uid, bodyId, modeTabs, activeTab, onTab, vacio, preguntaPendiente, valores, ayuda, anuncio, body, composer, pick, busquedas, preguntas, preguntaItems, onPregunta, tituloBusquedas, tituloPreguntas }
  },
  template: `
    <div class="usearch-panel" :class="{ 'usearch-panel--chat': api.chatView }" role="region" aria-label="Buscar o preguntar">
      <p class="usearch-panel__live" role="status" aria-live="polite">{{ anuncio }}</p>

      <div v-if="api.mode && !preguntaPendiente" class="usearch-panel__modebar">
        <R4Tabs layout="fixed" :tabs="modeTabs" :active-tab="activeTab" aria-label="Modo de la consulta" @change="onTab" />
      </div>

      <div ref="body" class="usearch-panel__body" :id="bodyId" :role="api.mode && !preguntaPendiente ? 'tabpanel' : undefined" :aria-labelledby="api.mode && !preguntaPendiente ? modeTabs[activeTab].id : undefined">
        <!-- Vacío: campo sin texto. Estado «usuario nuevo» (sugerencias) o «usuario con historial» (lo suyo, con icono de histórico) -->
        <div v-if="enListado" class="usearch-panel__group">
          <R4NavigationItems size="medium" :items="historialItems" :icon-is-boxed="false" aria-label="Todas las conversaciones" @select="onListado" />
        </div>
        <div v-else-if="vacio && !hayHistorial" class="usearch-panel__intro">
          <img class="usearch-panel__intro-il" :src="ilustracion" alt="" width="96" height="96" />
          <div class="usearch-panel__intro-body">
            <R4Text size="large" font-style="strong" class="usearch-panel__intro-title" text="¿Puedo ayudarte a encontrar algo?" />
            <R4ListIcon size="medium" :items="introItems" />
          </div>
        </div>
        <div v-else-if="vacio" class="usearch-panel__start">
          <R4Notification v-if="api.opciones.caption" type="info" :dismissible="false" text="Escribe el nombre de un producto para buscarlo, o una pregunta para hablar con el asistente." />
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-rec-' + uid">
            <h3 :id="'usearch-rec-' + uid" class="usearch-panel__heading">{{ tituloBusquedas }}</h3>
            <div class="usearch-panel__chips">
              <R4Chip v-for="b in busquedas" :key="b.texto" size="small" :label="b.texto" :icon="b.icon" @click="api.abrirBusqueda(b.texto)" />
            </div>
          </section>
          <section v-if="api.opciones.ejemplos" class="usearch-panel__section" :aria-labelledby="'usearch-ej-' + uid">
            <h3 :id="'usearch-ej-' + uid" class="usearch-panel__heading">{{ tituloPreguntas }}</h3>
            <R4NavigationItems size="medium" :items="preguntaItems" :icon-is-boxed="false" :aria-label="tituloPreguntas" @select="onPregunta" />
            <R4Button v-if="hayMas" type="text" size="medium" width="full-width" text="Ver todas" @click="api.verHistorial()" />
          </section>
        </div>

        <!-- Resultados -->
        <template v-else-if="api.mode === 'search'">
          <template v-if="api.results.length">
            <section v-if="valores.length" class="usearch-panel__section" aria-label="Resultados">
              <R4SearchResults class="usearch-panel__results"><SearchResultItem v-for="(r, i) in valores" :key="i" v-bind="itemProps(r)" size="medium" @select="pick(r.name, $event)" /></R4SearchResults>
            </section>
            <section v-if="ayuda.length" class="usearch-panel__section" aria-label="Centro de ayuda">
              <R4SearchResults class="usearch-panel__results"><SearchResultItem v-for="(r, i) in ayuda" :key="i" v-bind="itemProps(r)" size="medium" @select="pick(r.name, $event)" /></R4SearchResults>
            </section>
          </template>
          <div v-else class="usearch-panel__empty">
            <Icon class="usearch-panel__empty-icon" name="ic-file-search" />
            <div class="usearch-panel__empty-texts">
              <p class="usearch-panel__empty-title">Sin coincidencias para tu búsqueda</p>
              <p>Comprueba que «{{ api.searchTerm }}» esté bien escrito.</p>
              <p>También puedes probar preguntando a nuestro asistente.</p>
            </div>
            <R4Button type="secondary" size="medium" icon="ic-comment-alt-dots" text="Preguntar al asistente" @click="api.setMode('chat')" />
          </div>
        </template>

        <!-- Conversación -->
        <template v-else>
          <div v-if="!api.thread.length && api.query.trim() && !api.chatView" class="usearch-panel__ask">
            <p class="usearch-panel__ask-label">Vas a preguntar al asistente</p>
            <p class="usearch-panel__ask-text">«{{ api.query.trim() }}»</p>
            <div class="usearch-panel__ask-actions">
              <R4Button type="primary" size="medium" icon="ic-paper-plane" text="Preguntar" @click="api.enviar()" />
              <span class="usearch-panel__hint">o pulsa Intro</span>
            </div>
          </div>
          <ol v-if="api.thread.length" class="usearch-panel__thread" aria-label="Conversación">
            <li v-for="(m, i) in api.thread" :key="i" class="usearch-row" :class="'usearch-row--' + m.role">
              <R4BrandTypes v-if="m.role !== 'user'" class="usearch-row__logo" variant="Red" aria-hidden="true" />
              <div class="usearch-msg" :class="'usearch-msg--' + m.role">
                <span class="usearch-msg__who">{{ m.role === 'user' ? 'Tú' : 'Asistente' }}</span>
                <p v-if="m.legal" class="usearch-msg__text">Este chat utiliza inteligencia artificial para ayudarte con la operativa y gestión de tu cuenta en Renta 4, recuerda que puede cometer errores. Para mejorar tu experiencia, nuestro equipo puede revisar las conversaciones. Proporciona solo los detalles necesarios y evita incluir datos personales. Si deseas más información, lee <R4Link type="inline" size="medium" href="https://jbarral-dev.github.io/r4-prototipos/chatbot/#" target="_blank" rel="noopener">nuestra información de protección de datos</R4Link>.</p>
                <p v-else class="usearch-msg__text">{{ m.text }}</p>
 <R4SearchResults v-if="m.resultados" class="usearch-panel__results usearch-msg__results" aria-label="Resultados"><SearchResultItem v-for="(r, i) in m.resultados" :key="i" v-bind="itemProps(r)" size="small" :highlight="''" @select="pick(r.name, $event)" /></R4SearchResults>
                <ul v-if="enlacesLista(m)" class="usearch-msg__list"><li v-for="l in enlacesLista(m)" :key="l.label"><R4Link size="medium" href="#" @click.prevent="api.accion(l)">{{ l.label }}</R4Link></li></ul>
                <div v-else-if="m.links" class="usearch-msg__links"><R4Link v-for="l in m.links" :key="l.label" size="medium" href="#" @click.prevent="api.accion(l)">{{ l.label }}</R4Link></div>
              </div>
            </li>
            <li v-if="api.pending" class="usearch-row usearch-row--assistant" aria-live="polite"><R4BrandTypes class="usearch-row__logo" variant="Red" aria-hidden="true" /><div class="usearch-msg usearch-msg--assistant usearch-msg--pending"><span class="usearch-msg__who">Asistente</span><p class="usearch-msg__text">Escribiendo…</p></div></li>
          </ol>
          <ol v-if="api.chatView && !api.thread.some((m) => m.role === 'user')" class="usearch-panel__thread" aria-label="Chat">
            <li v-if="api.legalPendiente" class="usearch-row usearch-row--assistant"><R4BrandTypes class="usearch-row__logo" variant="Red" aria-hidden="true" /><div class="usearch-msg usearch-msg--assistant"><span class="usearch-msg__who">Asistente</span><p class="usearch-msg__text">Este chat utiliza inteligencia artificial para ayudarte con la operativa y gestión de tu cuenta en Renta 4, recuerda que puede cometer errores. Para mejorar tu experiencia, nuestro equipo puede revisar las conversaciones. Proporciona solo los detalles necesarios y evita incluir datos personales. Si deseas más información, lee <R4Link type="inline" size="medium" href="https://jbarral-dev.github.io/r4-prototipos/chatbot/#" target="_blank" rel="noopener">nuestra información de protección de datos</R4Link>.</p></div></li>
            <li class="usearch-row usearch-row--assistant"><R4BrandTypes class="usearch-row__logo" variant="Red" aria-hidden="true" /><div class="usearch-msg usearch-msg--assistant"><span class="usearch-msg__who">Asistente</span><p class="usearch-msg__text">¡Hola! Soy tu asistente de Renta 4. Cuéntame qué necesitas y te echo una mano.</p></div></li>
          </ol>
        </template>
      </div>

      <!-- Acceso al chat desde los resultados: barra fija abajo, a todo el ancho (texto small muted + R4Button secondary large con ic-ai), como en «Chatbot» -->
      <div v-if="mostrarBarra" class="usearch-panel__bar">
        <p class="usearch-panel__bar-text">¿No encuentras lo que buscas?</p>
        <R4Button type="secondary" size="large" width="full-width" icon="ic-ai" text="Pregunta al asistente" @click="api.setMode('chat')" />
      </div>

      <!-- Con la conversación pintada el campo de arriba queda disabled y el prompt se escribe aquí, fijo bajo el contenido -->
      <div v-if="api.chatView" ref="composer" class="usearch-panel__composer">
        <ChatComposer :api="api" />
      </div>
    </div>
  `,
})
