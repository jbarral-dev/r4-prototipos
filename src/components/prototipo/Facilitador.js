// HERRAMIENTA DEL PROTOTIPO (no es del Design System ni de Figma): panel «Facilitador» que permite reproducir los use cases del prototipo cambiando variables de contexto.
// Mismo planteamiento que el panel del buscador unificado (BuscadorUnificadoE/F, clases .facil): un <details> flotante abajo a la izquierda, plegado por defecto. `?f=0` en la URL lo oculta.
// Props: groups = [{ label, controls: [{ id, type: 'radio' | 'switch', label?, options?, default? }] }] y values = { [id]: valor } (v-model:values).
//   · radio: `options` = [{ value, label, default? }]; el valor es el `value` elegido (por defecto, el marcado `default` o el primero).
//   · switch: interruptor con `label` (texto del interruptor) y `default` (true/false); el valor es booleano.
// Un grupo (fieldset con su `label` como leyenda) puede llevar varios controles, para añadir variantes del mismo bloque. Cada cambio emite `change` ({ id, value }).
// El estado NO se guarda en la URL (decisión de Jon, 2026-11-14): cada carga parte del valor por defecto de cada control.
import { defineComponent, ref } from '../../../vendor/vue.esm-browser.prod.js'

// Valor inicial de cada control: radio → la opción marcada `default` o la primera; switch → su `default` (false si no se indica)
export const valoresPorDefecto = (groups) => Object.fromEntries(groups.flatMap((g) => g.controls).map((c) => [
  c.id,
  c.type === 'switch' ? !!c.default : (c.options.find((o) => o.default) || c.options[0]).value,
]))

export default defineComponent({
  name: 'Facilitador',
  props: {
    groups: { type: Array, required: true },
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
        <fieldset v-for="(g, gi) in groups" :key="gi" class="facilitador__group">
          <legend>{{ g.label }}</legend>
          <template v-for="c in g.controls" :key="c.id">
            <label v-if="c.type === 'switch'" class="facilitador__switch">
              <span>{{ c.label }}</span>
              <input type="checkbox" role="switch" class="facilitador__switch-input" :checked="values[c.id]" :aria-checked="values[c.id] ? 'true' : 'false'" @change="set(c.id, $event.target.checked)" />
            </label>
            <template v-else>
              <label v-for="o in c.options" :key="c.id + o.value" class="facilitador__option">
              <input type="radio" :name="'facilitador-' + c.id" :value="o.value" :checked="values[c.id] === o.value" @change="set(c.id, o.value)" />
              <span>{{ o.label }}</span>
              </label>
            </template>
          </template>
        </fieldset>
      </div>
    </details>
  `,
})
