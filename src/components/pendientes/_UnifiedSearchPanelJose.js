// PENDIENTE-IT: no oficial. COPIA PARA «Chatbot (Jose)» (fork del prototipo «Chatbot»; clases CSS con prefijo j para no interferir con el original). Prototipo de investigación (variante E: un solo campo decide el modo). NO es un componente del catálogo ni tiene diseño en Figma ni página en Confluence:
// es una COMPOSICIÓN de componentes reconstruidos (R4Tabs, R4Chip, R4Button, _SearchResultItem) con tokens semánticos; lo que no cubre ningún componente
// (burbujas de mensaje, tarjeta «Preguntar», filas de ejemplos) son estilos propios mínimos y se avisan en «Pendiente / dudas».
// Contrato: recibe el estado compartido (`api`, ver screens/_buscadorEstado.js) y pinta, bajo el campo, el panel según el modo: vacío (ejemplos) · Resultados · Conversación.
// Hace visible y corregible el modo: selector Resultados | Conversación (siempre que haya modo) + frase que explica por qué se activó + región aria-live que lo anuncia.
// Patrón «Búsqueda y selección de elementos» (Confluence 3950968833): sin coincidencias → estado vacío que dice qué se buscó y ofrece salida (aquí, preguntar al asistente).
import { defineComponent, computed, ref, watch, nextTick, onBeforeUnmount } from '../../../vendor/vue.esm-browser.prod.js'
import R4BrandTypes from './R4BrandTypes.js'
import R4Chip from './R4Chip.js'
import R4NavigationItems from './R4NavigationItems.js'
import R4Button from './R4Button.js'
import R4Link from './R4Link.js'
import R4Text from './R4Text.js'
import R4Spinner from './R4Spinner.js'
import _ChatComposer from './_ChatComposerJose.js'
import _SearchResultItem from './_SearchResultItem.js'
import R4SearchResults from './R4SearchResults.js'
import Icon from '../../icons/_Icon.js'

let panelUid = 0

export default defineComponent({
  name: '_UnifiedSearchPanelJose',
  components: { R4Spinner, R4BrandTypes, R4Chip, R4Text, R4Link, R4NavigationItems, R4Button, ChatComposer: _ChatComposer, R4SearchResults, SearchResultItem: _SearchResultItem, Icon },
  props: { api: { type: Object, required: true }, withComposer: { type: Boolean, default: true } }, // withComposer=false: el prompt va en la capa de acciones del R4Sheet (lo pinta el host)
  setup(props) {
    const uid = ++panelUid // el panel se monta dos veces (desplegable y capa a pantalla completa): ids únicos
    const bodyId = 'jusearch-body-' + uid
    // Pregunta a medio escribir (el enrutado ya la ve como pregunta): se mantiene la pantalla inicial hasta que el usuario pulsa Intro
    const preguntaPendiente = computed(() => props.api.mode === 'chat' && !props.api.thread.length && !props.api.locked && !!props.api.query.trim())
    const vacio = computed(() => !props.api.mode || (props.api.mode === 'search' && !props.api.autocompletar))
    // Pregunta en curso (el enrutado la ve como pregunta): mientras el usuario escribe se muestra el spinner; si deja de escribir 0,3 s, el mensaje «Para consultas más complejas» con el CTA «Pregunta al asistente». Intro envía la pregunta al chat.
    const escribiendo = ref(false)
    let idle = null
    watch(() => props.api.query, () => { escribiendo.value = true; clearTimeout(idle); idle = setTimeout(() => { escribiendo.value = false }, 300) })
    onBeforeUnmount(() => clearTimeout(idle))
    // Autocompletado: resultados agrupados por tipo, en este orden (Fondos es una agrupación añadida por el prototipo: el catálogo de ejemplo también trae fondos y planes; sin Centro de ayuda: no se muestra en los resultados)
    const GRUPOS = [
      { id: 'acciones', label: 'Acciones', test: (r) => r.type === 'Acción' },
      { id: 'cfds', label: 'CFDs', test: (r) => r.type === 'CFD' },
      { id: 'futuros', label: 'Futuros', test: (r) => r.type === 'Futuro' },
      { id: 'opciones', label: 'Opciones', test: (r) => r.type === 'Opción' },
      { id: 'etfs', label: 'ETFs', test: (r) => r.type === 'ETF' },
      { id: 'fondos', label: 'Fondos', test: (r) => r.type === 'Fondo' || r.type === 'Plan de pensiones' },
      { id: 'renta-fija', label: 'Renta fija', test: (r) => r.type === 'Renta fija' },
      { id: 'cripto', label: 'Criptomonedas', test: (r) => r.type === 'Cripto' },
    ]
    const grupos = computed(() => GRUPOS.map((g) => ({ ...g, items: props.api.results.filter(g.test) })).filter((g) => g.items.length))
    const filtroActivo = computed(() => (grupos.value.some((g) => g.id === props.api.filtro) ? props.api.filtro : 'todos'))
    const gruposVisibles = computed(() => grupos.value.filter((g) => filtroActivo.value === 'todos' || g.id === filtroActivo.value))
    const mostrarFiltros = computed(() => props.api.barra && grupos.value.length > 1) // filtros por tipo: con el autocompletado y resultados de más de un tipo (si la búsqueda da un solo tipo no se muestran: documentación 3.3)
    const anuncio = computed(() => {
      const a = props.api
      if (!a.mode) return ''
      if (a.mode === 'chat') return a.thread.length ? 'Modo conversación.' : 'Modo conversación: pulsa Intro para preguntar al asistente.'
      return `Modo resultados: ${a.results.length} resultados.`
    })
    const body = ref(null)
    watch(() => [props.api.thread.length, props.api.pending], async () => { await nextTick(); if (body.value) body.value.scrollTop = body.value.scrollHeight })
    // Barra inferior: va al chat con la burbuja del usuario ya enviada con lo escrito en la caja
    // Volver: al inicio (la conversación queda activa) y el foco no se pierde: pasa al botón de cierre del R4Sheet, sin abrir el teclado
    const volver = async () => { if (props.api.chatView) props.api.volver(); else props.api.vista = 'inicio'; await nextTick(); body.value?.closest('.r4-sheet')?.querySelector('.r4-sheet__close')?.focus() }
    const preguntarLoEscrito = () => { const t = props.api.query.trim() || props.api.lastSent; if (t) props.api.preguntar(t); else props.api.irAlChat() }
    // Enlaces del asistente: uno suelto (R4Link standalone) o varios en lista con viñetas; nunca varios en fila (documentación 3.4)
    const enlacesLista = (m) => m.lista || (m.links && m.links.length > 1 ? m.links : null)
    // Mobile: en la pantalla de resultados, en cuanto el dedo hace scroll sobre el panel, o pulsa en el contenido, el teclado se oculta (el campo pierde el foco)
    const ocultarTeclado = () => { if (!props.api.barra) return; const a = document.activeElement; if (a && a.matches && a.matches('input, textarea')) a.blur() }
    const pick = (name, e) => { e.preventDefault(); props.api.abrirResultado(name) }
    // Estado inicial: con historial se muestran las búsquedas y preguntas del usuario (icono de histórico); sin historial, sugerencias (lupa y comentario)
    const hayBusquedas = computed(() => props.api.historial.busquedas.length > 0)
    const busquedas = computed(() => (hayBusquedas.value ? props.api.historial.busquedas : props.api.populares).map((t) => ({ texto: t, icon: hayBusquedas.value ? 'ic-history' : 'ic-search' })))
    const preguntas = computed(() => (props.api.historial.conversaciones.length
      ? props.api.historial.conversaciones.map((c) => ({ texto: c.titulo, conv: c, icon: 'ic-history' }))
      : props.api.ejemplosPregunta.slice(0, 3).map((t) => ({ texto: t, icon: 'ic-comments-alt' }))))
    // Filas de «Preguntas»: R4NavigationItems (sin icono en caja ni flecha); `conv` / `texto` viajan en el ítem para saber qué abrir
    // Títulos de sección: lo propio del usuario con historial («Últimas…») o lo sugerido al que entra por primera vez («…frecuentes»)
    const tituloBusquedas = computed(() => (hayBusquedas.value ? 'Últimas búsquedas' : 'Búsquedas frecuentes'))
    const tituloPreguntas = computed(() => (props.api.historial.conversaciones.length ? 'Últimas preguntas' : 'Preguntas frecuentes'))
    // «Últimas preguntas»: las 5 más recientes y, si hay más, «Ver todas» (abre el listado completo)
    const hayMas = computed(() => props.api.historial.conversaciones.length > 5)
    const preguntaItems = computed(() => preguntas.value.slice(0, 5).map((q) => ({ title: q.texto, icon: q.icon, linkHref: '#', showLink: false, conv: q.conv })))
    // Listado completo de conversaciones (R4NavigationItems; al pulsar una se carga el chat con ella)
    const historialItems = computed(() => props.api.historial.conversaciones.map((c) => ({ title: c.titulo, description: c.fecha, icon: 'ic-history', linkHref: '#', showLink: false, conv: c })))
    const enListado = computed(() => props.api.vista === 'historial' && vacio.value)
    // Desde el listado completo: el chat que se abre recuerda de dónde viene (Volver lleva de vuelta al listado)
    const onListado = (it, e) => { e.preventDefault(); props.api.abrirConversacion(it.conv, 'historial') }
    const onPregunta = (it, e) => { e.preventDefault(); if (it.conv) props.api.abrirConversacion(it.conv); else props.api.preguntar(it.title) }
    // Props del searchResultItem (diseño con mercado) a partir de una fila del catálogo; `highlight` = lo buscado. SOLO lo que define la documentación (Confluence 4095606798, «_SearchResultItem»): logo, nombre, código (ISIN o código DGS; `metadata2`) y mercado. Sin ticker, descripción, vencimiento ni etiqueta de tipo
    const itemProps = (r) => ({ name: r.name, logoSrc: r.logoSrc, logoText: r.logoText, metadata2: r.metadata2, market: r.market, marketFlag: r.marketFlag, highlight: props.api.searchTerm })
    return { itemProps, uid, bodyId, vacio, preguntaPendiente, escribiendo, grupos, gruposVisibles, filtroActivo, mostrarFiltros, anuncio, body, enlacesLista, pick, hayBusquedas, ocultarTeclado, busquedas, preguntas, preguntaItems, onPregunta, onListado, hayMas, historialItems, enListado, tituloBusquedas, tituloPreguntas, volver }
  },
  template: `
    <div class="jusearch-panel" :class="{ 'jusearch-panel--chat': api.chatView }" role="region" aria-label="Buscar o preguntar" @touchmove.passive="ocultarTeclado" @click="ocultarTeclado">
      <p class="jusearch-panel__live" role="status" aria-live="polite">{{ anuncio }}</p>

      <div ref="body" class="jusearch-panel__body" :id="bodyId">
        <!-- Vacío: campo sin texto. Use case «primera vez» (Búsquedas / Preguntas frecuentes) o «ya ha entrado» (Últimas búsquedas / Últimas preguntas, con icono de histórico) -->
        <div v-if="enListado" class="jusearch-panel__group">
          <R4NavigationItems size="medium" :items="historialItems" :icon-is-boxed="false" aria-label="Todas las preguntas" @select="onListado" />
        </div>
        <!-- Pregunta en curso: spinner mientras escribe; a 0,3 s sin escribir, el mensaje y el CTA (Figma «Proyectos - Chatbot» 22:13453) -->
        <div v-else-if="preguntaPendiente" class="jusearch-panel__complex">
          <R4Spinner v-if="escribiendo" size="medium" aria-label="Escribiendo tu pregunta" />
          <template v-else>
            <R4Text size="medium" class="jusearch-panel__complex-text" text="Para consultas más complejas" />
            <R4Button type="secondary" size="large" width="full-width" icon="ic-ai" text="Pregunta al asistente" @click="api.preguntarLoEscrito()" />
          </template>
        </div>
        <div v-else-if="vacio" class="jusearch-panel__start">
          <section v-if="api.opciones.ejemplos && hayBusquedas" class="jusearch-panel__section" :aria-labelledby="'jusearch-rec-' + uid">
            <h3 :id="'jusearch-rec-' + uid" class="jusearch-panel__heading">{{ tituloBusquedas }}</h3>
            <div class="jusearch-panel__chips">
              <R4Chip v-for="b in busquedas" :key="b.texto" size="small" :label="b.texto" :icon="b.icon" @click="api.buscarTermino(b.texto)" />
            </div>
          </section>
          <section v-if="api.opciones.ejemplos && api.historial.conversaciones.length" class="jusearch-panel__section" :aria-labelledby="'jusearch-ej-' + uid">
            <h3 :id="'jusearch-ej-' + uid" class="jusearch-panel__heading">{{ tituloPreguntas }}</h3>
            <R4NavigationItems size="medium" :items="preguntaItems" :icon-is-boxed="false" :aria-label="tituloPreguntas" @select="onPregunta" />
            <R4Button v-if="hayMas" type="text" size="medium" width="full-width" text="Ver todas" @click="api.verHistorial()" />
          </section>
        </div>

        <!-- Resultados -->
        <template v-else-if="api.mode === 'search'">
          <div v-if="api.results.length" class="jusearch-panel__groups">
            <section v-for="g in gruposVisibles" :key="g.id" class="jusearch-panel__group" :aria-labelledby="'jusearch-g-' + g.id + '-' + uid">
              <R4Text :id="'jusearch-g-' + g.id + '-' + uid" tag="h3" size="medium" font-style="strong" class="jusearch-panel__group-title" :text="g.label + ' (' + g.items.length + ')'" />
              <R4SearchResults class="jusearch-panel__results"><SearchResultItem v-for="(r, i) in g.items" :key="i" v-bind="itemProps(r)" @select="pick(r.name, $event)" /></R4SearchResults>
            </section>
          </div>
          <div v-else class="jusearch-panel__empty">
            <Icon class="jusearch-panel__empty-icon" name="ic-file-search" />
            <div class="jusearch-panel__empty-texts">
              <R4Text size="large" font-style="strong" text="Sin coincidencias" />
              <R4Text size="medium" :text="'Comprueba que «' + api.searchTerm + '» esté bien escrito. También puedes probar preguntando a nuestro asistente.'" />
            </div>
            <R4Button type="secondary" size="medium" icon="ic-ai" text="Pregunta al asistente" @click="api.setMode('chat')" />
          </div>
        </template>

        <!-- Conversación -->
        <template v-else>
          <div v-if="!api.thread.length && api.query.trim() && !api.chatView" class="jusearch-panel__ask">
            <p class="jusearch-panel__ask-label">Vas a preguntar al asistente</p>
            <p class="jusearch-panel__ask-text">«{{ api.query.trim() }}»</p>
            <div class="jusearch-panel__ask-actions">
              <R4Button type="primary" size="medium" icon="ic-paper-plane" text="Preguntar" @click="api.enviar()" />
              <span class="jusearch-panel__hint">o pulsa Intro</span>
            </div>
          </div>
          <ol v-if="api.thread.length" class="jusearch-panel__thread" aria-label="Conversación">
            <li v-for="(m, i) in api.thread" :key="i" class="jusearch-row" :class="'jusearch-row--' + m.role">
              <R4BrandTypes v-if="m.role !== 'user'" class="jusearch-row__logo" variant="Red" aria-hidden="true" />
              <div class="jusearch-msg" :class="'jusearch-msg--' + m.role">
                <span class="jusearch-msg__who">{{ m.role === 'user' ? 'Tú' : 'Asistente' }}</span>
                <p v-if="m.legal" class="jusearch-msg__text">Este chat utiliza inteligencia artificial para ayudarte con la operativa y gestión de tu cuenta en Renta 4, recuerda que puede cometer errores. Para mejorar tu experiencia, nuestro equipo puede revisar las conversaciones. Proporciona solo los detalles necesarios y evita incluir datos personales. Si deseas más información, lee <R4Link type="inline" size="medium" href="https://jbarral-dev.github.io/r4-prototipos/chatbot-jose/#" target="_blank" rel="noopener">nuestra información de protección de datos</R4Link>.</p>
                <p v-else class="jusearch-msg__text">{{ m.text }}</p>
 <R4SearchResults v-if="m.resultados" class="jusearch-panel__results jusearch-msg__results" aria-label="Resultados"><SearchResultItem v-for="(r, i) in m.resultados" :key="i" v-bind="itemProps(r)" :highlight="''" @select="pick(r.name, $event)" /></R4SearchResults>
                <ul v-if="enlacesLista(m)" class="jusearch-msg__list"><li v-for="l in enlacesLista(m)" :key="l.label"><R4Link size="medium" href="#" @click.prevent="api.accion(l)">{{ l.label }}</R4Link></li></ul>
                <div v-else-if="m.links" class="jusearch-msg__links"><R4Link v-for="l in m.links" :key="l.label" size="medium" href="#" @click.prevent="api.accion(l)">{{ l.label }}</R4Link></div>
              </div>
            </li>
            <li v-if="api.pending" class="jusearch-row jusearch-row--assistant" aria-live="polite"><R4BrandTypes class="jusearch-row__logo" variant="Red" aria-hidden="true" /><div class="jusearch-msg jusearch-msg--assistant jusearch-msg--pending"><span class="jusearch-msg__who">Asistente</span><p class="jusearch-msg__text">Escribiendo…</p></div></li>
          </ol>
          <ol v-if="api.chatView && !api.thread.some((m) => m.role === 'user')" class="jusearch-panel__thread" aria-label="Chat">
            <li v-if="api.legalPendiente" class="jusearch-row jusearch-row--assistant"><R4BrandTypes class="jusearch-row__logo" variant="Red" aria-hidden="true" /><div class="jusearch-msg jusearch-msg--assistant"><span class="jusearch-msg__who">Asistente</span><p class="jusearch-msg__text">Este chat utiliza inteligencia artificial para ayudarte con la operativa y gestión de tu cuenta en Renta 4, recuerda que puede cometer errores. Para mejorar tu experiencia, nuestro equipo puede revisar las conversaciones. Proporciona solo los detalles necesarios y evita incluir datos personales. Si deseas más información, lee <R4Link type="inline" size="medium" href="https://jbarral-dev.github.io/r4-prototipos/chatbot-jose/#" target="_blank" rel="noopener">nuestra información de protección de datos</R4Link>.</p></div></li>
            <li class="jusearch-row jusearch-row--assistant"><R4BrandTypes class="jusearch-row__logo" variant="Red" aria-hidden="true" /><div class="jusearch-msg jusearch-msg--assistant"><span class="jusearch-msg__who">Asistente</span><p class="jusearch-msg__text">¡Hola! Soy tu asistente de Renta 4. Cuéntame qué necesitas y te echo una mano.</p></div></li>
          </ol>
        </template>
      </div>

      <!-- Con la conversación pintada el campo de arriba queda disabled y el prompt se escribe aquí, fijo bajo el contenido -->
      <div v-if="api.chatView && withComposer" class="jusearch-panel__composer"><ChatComposer :api="api" /></div>
    </div>
  `,
})
