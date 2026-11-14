// HERRAMIENTA DEL PROTOTIPO (no es del Design System ni de Figma): panel «Facilitador» que permite reproducir los use cases del prototipo cambiando variables de contexto.
// Mismo planteamiento que el panel del buscador unificado (BuscadorUnificadoE/F, clases .facil): un <details> flotante abajo a la izquierda, plegado por defecto. `?f=0` en la URL lo oculta.
// Props: variables = [{ id, label, options: [{ value, label }] }] y values = { [id]: value } (v-model:values). Cada variable se pinta como un grupo de radios. Cada cambio emite `change` ({ id, value }).
// El estado NO se guarda en la URL (decisión de Jon, 2026-11-14): cada carga parte de la opción por defecto de cada variable.
import { defineComponent, ref } from '../../../vendor/vue.esm-browser.prod.js'

// Valor inicial de cada variable: la opción marcada `default` o la primera
export const valoresPorDefecto = (variables) => Object.fromEntries(variables.map((v) => [v.id, (v.options.find((o) => o.default) || v.options[0]).value]))

export default defineComponent({
  name: 'Facilitador',
  props: {
    variables: { type: Array, required: true },
    values: { type: Object, required: true },
    title: { type: String, default: 'Facilitador' },
  },
  emits: ['update:values', 'change'],
  setup(props, { emit }) {
    const visible = ref(new URLSearchParams(location.search).get('f') !== '0')
    const set = (id, value) => {
      emit('update:values', { ...props.values, [id]: value })
      emit('change', { id, value })
    }
    return { visible, set }
  },
  template: `
    <details v-if="visible" class="facilitador">
      <summary>{{ title }}</summary>
      <div class="facilitador__body">
        <fieldset v-for="v in variables" :key="v.id" class="facilitador__group">
          <legend>{{ v.label }}</legend>
          <label v-for="o in v.options" :key="o.value" class="facilitador__option">
            <input type="radio" :name="'facilitador-' + v.id" :value="o.value" :checked="values[v.id] === o.value" @change="set(v.id, o.value)" />
            <span>{{ o.label }}</span>
          </label>
        </fieldset>
      </div>
    </details>
  `,
})
