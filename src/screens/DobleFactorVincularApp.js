// Pantalla: alta del doble factor · vincular app. Figma 1N0hwfNDDXiA788hCBr3bD:
//   desktop cl-alta-2-factor-vincular-app--dk (42:21938) · mobile cl-alta-2-factor-vincular-app--mb (68:11691). Tablet: no hay diseño
//   (nunca se diseña tablet): usa el contenido de desktop con los tokens de modo Tablet y la rejilla de 8 columnas.
// El contenido cambia entre desktop y mobile (en mobile no hay QR: se copia el código). Todo el responsive lo resuelve el CSS
// (container query `r4page`): se renderizan ambas variantes y el CSS oculta la que no toca (display: none → fuera del árbol de AT).
// Datos de ejemplo (prototipo): QR y clave manual; vendrían de backend.
import { defineComponent, ref, h } from '../../vendor/vue.esm-browser.prod.js'
import TemplateProcess from '../templates/TemplateProcess.js'
import Menu from '../components/pendientes/Menu.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4PageTitleProcess from '../components/pendientes/R4PageTitleProcess.js'
import R4Section from '../components/pendientes/R4Section.js'
import R4Steps from '../components/pendientes/R4Steps.js'
import R4Link from '../components/pendientes/R4Link.js'
import R4Notification from '../components/pendientes/R4Notification.js'
import R4Button from '../components/pendientes/R4Button.js'
import R4InputText from '../components/pendientes/R4InputText.js'
import _QrPlaceholder from './_QrPlaceholder.js'

const claveManual = 'NGK3ZGB3ADVAD4BO3ZTSWLV2JZLLB7FR'
const queEsLink = () => h(R4Link, { href: '#', size: 'small', type: 'standalone' }, () => '¿Qué es una app de autenticación?')

const Content = defineComponent({
  name: 'DobleFactorVincularAppContent',
  components: { R4Wrapper, R4PageTitleProcess, R4Section, R4Steps, R4Notification, R4Button, R4InputText, QrPlaceholder: _QrPlaceholder },
  setup() {
    const copiado = ref(false)
    const copiar = async () => {
      try { await navigator.clipboard.writeText(claveManual); copiado.value = true } catch (e) { copiado.value = false }
    }
    const stepsDesktop = [
      { description: 'Abre tu app de autenticación.', slot: queEsLink() },
      { description: 'Escanea el código QR.' },
      { description: 'Vuelve aquí y pulsa en “Continuar”.' },
    ]
    const stepsMobile = [
      { description: 'Copia este código en tu aplicación de autenticación.', slot: queEsLink() },
      { description: 'Vuelve aquí y pulsa en “Continuar”.' },
    ]
    return { claveManual, copiado, copiar, stepsDesktop, stepsMobile, textoNotificacion: `Si no puedes escanear el QR, introduce esta clave tu aplicación: ${claveManual}` }
  },
  // Orden del DOM = orden de lectura (título → contenido → acción); la rejilla coloca cada bloque en sus columnas.
  template: `
    <R4Wrapper layout="6">
        <div class="screen-2fa__col">
          <div class="screen-2fa__only-wide"><R4PageTitleProcess title="Asocia Renta 4 a un autenticador" /></div>
          <div class="screen-2fa__only-narrow"><R4PageTitleProcess title="Asocia Renta 4 a tu autenticador" /></div>
        </div>

        <div class="screen-2fa__col screen-2fa__content screen-2fa__only-wide">
          <R4Section appearance="boxed" background-color="white">
            <div class="screen-2fa__qr-steps">
              <QrPlaceholder :size="160" />
              <R4Steps class="screen-2fa__steps" size="medium" :steps="stepsDesktop" />
            </div>
          </R4Section>
          <R4Notification type="info" :dismissible="false" :text="textoNotificacion" />
        </div>

        <div class="screen-2fa__col screen-2fa__content screen-2fa__content--narrow screen-2fa__only-narrow">
          <R4Section>
            <R4Steps class="screen-2fa__steps" size="medium" :steps="stepsMobile" />
            <div class="screen-2fa__key">
              <R4InputText class="screen-2fa__key-input" :model-value="claveManual" readonly aria-label="Código de autenticación" />
              <R4Button type="secondary" icon="ic-copy" aria-label="Copiar código" @click="copiar" />
            </div>
          </R4Section>
          <p class="screen-2fa__sr-only" role="status" aria-live="polite">{{ copiado ? 'Código copiado' : '' }}</p>
        </div>

        <div class="screen-2fa__col"><R4Button text="Continuar" width="full-width" /></div>
    </R4Wrapper>
  `,
})

export default defineComponent({
  name: 'DobleFactorVincularApp',
  components: { TemplateProcess, Menu, Content },
  template: `
    <TemplateProcess>
      <template #header>
        <Menu type="process" process-title="Activación doble factor" :current-step="1" :total-steps="2" />
      </template>
      <Content />
    </TemplateProcess>
  `,
})
