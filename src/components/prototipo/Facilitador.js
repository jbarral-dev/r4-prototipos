// HERRAMIENTA DEL PROTOTIPO (no es del Design System ni de Figma): panel «Facilitador» que permite reproducir los use cases del prototipo cambiando variables de contexto.
// Mismo planteamiento que el panel del buscador unificado (BuscadorUnificadoE/F, clases .facil): un <details> flotante abajo a la izquierda, plegado por defecto. `?f=0` en la URL lo oculta.
// Props: variables = [{ id, label, options: [{ value, label }] }] y values = { [id]: value } (v-model:values). Cada variable se pinta como un grupo de radios. Cada cambio emite `change` ({ id, value }).
// El estado inicial también puede venir de la URL (?<id>=<valor>): lo resuelve la pantalla con `leerDeUrl` (exportado aquí) y se refleja en la URL al cambiar, para poder compartir un caso.
import { defineComponent, ref } from '../../../vendor/vue.esm-browser.prod.js'

// Lee de la URL el valor de cada variable (si es una de sus opciones); si no, el primero marcado `default` o la primera opción
export const leerDeUrl = (variables) => {
  const q = new URLSearchParams(location.search)
  return Object.fromEntries(variables.map((v) => {
    const fromUrl = q.get(v.id)
    const ok = v.options.some((o) => o.value === fromUrl)
    return [v.id, ok ? fromUrl : (v.options.find((o) => o.default) || v.options[0]).value]
  }))
}

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
      const q = new URLSearchParams(location.search)
      const def = props.variables.find((v) => v.id === id)
      const defecto = (def.options.find((o) => o.default) || def.options[0]).value
      if (value === defecto) q.delete(id); else q.set(id, value)
      history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash)
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
