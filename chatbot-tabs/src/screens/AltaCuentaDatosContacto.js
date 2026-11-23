// Pantalla (Flujo B, sin diseño en Figma): alta de cuenta · Datos de contacto. Página de proceso genérica (con formulario).
// Composición: TemplateProcess (gris, Menu Process con R4ProgressBar fijo, sin Footer) → R4Wrapper (primero) → Grid →
//   R4PageTitleProcess (sin descripción) · formulario (R4InputEmail, R4InputPhone, R4InputCheckbox legal) · R4Button "Continuar".
// Contenido de las columnas según "Páginas de Procesos": 6 de 12 · 6 de 8 · 4 de 4 (todo por CSS, container query `r4page`).
// Comportamiento: "Continuar" desactivado hasta aceptar el check legal. Los campos se validan al perder el foco (decisión INFERIDA: la única doc que lo decía estaba en la carpeta "Borrar", que se ignora; sin fuente vigente).
// Decisiones inferidas: ver el resumen de la tarea (paso del proceso, textos de error, separación entre campos).
import { defineComponent, reactive, ref, computed } from '../../vendor/vue.esm-browser.prod.js'
import TemplateProcess from '../templates/TemplateProcess.js'
import Menu from '../components/pendientes/Menu.js'
import R4Wrapper from '../components/pendientes/R4Wrapper.js'
import R4PageTitleProcess from '../components/pendientes/R4PageTitleProcess.js'
import R4InputEmail from '../components/pendientes/R4InputEmail.js'
import R4InputPhone from '../components/pendientes/R4InputPhone.js'
import R4InputCheckbox from '../components/pendientes/R4InputCheckbox.js'
import R4Button from '../components/pendientes/R4Button.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[6-9]\d{8}$/ // móvil/teléfono español de 9 dígitos, sin prefijo

const validators = {
  email: (v) => (!v.trim() ? 'El e-mail es obligatorio' : !EMAIL_RE.test(v.trim()) ? 'El formato del e-mail no es correcto' : ''),
  phone: (v) => {
    const digits = v.replace(/\s/g, '')
    return !digits ? 'El teléfono es obligatorio' : !PHONE_RE.test(digits) ? 'El formato del teléfono no es correcto' : ''
  },
}

const Content = defineComponent({
  name: 'AltaCuentaDatosContactoContent',
  components: { R4Wrapper, R4PageTitleProcess, R4InputEmail, R4InputPhone, R4InputCheckbox, R4Button },
  setup() {
    const form = reactive({ email: '', phone: '', legal: [] })
    const errors = reactive({ email: '', phone: '' })
    const validate = (field) => { errors[field] = validators[field](form[field]) }
    const aceptado = computed(() => form.legal.includes('legal'))
    const continuar = () => {
      validate('email'); validate('phone')
      if (errors.email || errors.phone) return
      // Prototipo: aquí iría la navegación al siguiente paso del alta.
      console.info('Datos de contacto válidos', { email: form.email, phone: form.phone })
    }
    return { form, errors, validate, aceptado, continuar, legalOptions: [{ value: 'legal', label: 'Acepto el uso de datos personales por parte de Renta 4 Banco' }] }
  },
  // Orden del DOM = orden de lectura = orden de foco: título → email → teléfono → check legal → Continuar.
  template: `
    <R4Wrapper layout="6">
      <div class="alta__col"><R4PageTitleProcess title="Datos de contacto" /></div>
      <form class="alta__col alta__form" novalidate @submit.prevent="continuar">
        <R4InputEmail v-model="form.email" required :status="errors.email ? 'Error' : 'Default'" :caption="errors.email || undefined" @blur="validate('email')" />
        <R4InputPhone v-model="form.phone" required :status="errors.phone ? 'Error' : 'Default'" :caption="errors.phone || undefined" @blur="validate('phone')" />
        <R4InputCheckbox v-model="form.legal" :options="legalOptions" required />
      </form>
      <div class="alta__col"><R4Button text="Continuar" width="full-width" :disabled="!aceptado" @click="continuar" /></div>
    </R4Wrapper>
  `,
})

export default defineComponent({
  name: 'AltaCuentaDatosContacto',
  components: { TemplateProcess, Menu, Content },
  template: `
    <TemplateProcess>
      <template #header>
        <Menu type="process" process-title="Alta de cuenta" :current-step="1" :total-steps="3" />
      </template>
      <Content />
    </TemplateProcess>
  `,
})
