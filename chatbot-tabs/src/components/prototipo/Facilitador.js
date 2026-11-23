// HERRAMIENTA DEL PROTOTIPO (no es del Design System ni de Figma): panel «Facilitador» que permite reproducir los use cases del prototipo cambiando variables de contexto.
// Mismo planteamiento que el panel del buscador unificado (BuscadorUnificadoE/F, clases .facil): un <details> flotante abajo a la izquierda, plegado por defecto. `?f=0` en la URL lo oculta.
// Props: groups = [{ label, controls: [{ id, type: 'radio' | 'switch', param?, label?, options?, default? }] }] y values = { [id]: valor } (v-model:values).
//   · radio: `options` = [{ value, label, default? }]; el valor es el `value` elegido (por defecto, el marcado `default` o el primero).
//   · switch: interruptor con `label` (texto del interruptor) y `default` (true/false); el valor es booleano.
// Un grupo (fieldset con su `label` como leyenda) puede llevar varios controles, para añadir variantes del mismo bloque. Cada cambio emite `change` ({ id, value }).
// URL (Jon, 2026-11-14, sustituye a la decisión anterior de no guardar el estado): cada control tiene un parámetro (`param`, por defecto su `id`; p. ej. `usuario=potencial`, `tab-productos=tabla`, `precios=0`). Al cargar se lee de la URL
// (si el valor es válido) y al cambiar se escribe con replaceState; el valor por defecto no ensucia la URL. Los interruptores van como 1 / 0. Se conservan los demás parámetros (f, tab…).
import { defineComponent, ref } from '../../../vendor/vue.esm-browser.prod.js'

const paramDe = (c) => c.param || c.id
const defectoDe = (c) => (c.type === 'switch' ? !!c.default : (c.options.find((o) => o.default) || c.options[0]).value)

// Escribe (o borra, si coincide con el valor por defecto) un parámetro de la URL sin recargar ni añadir historial
export const escribirParam = (nombre, valor, defecto) => {
  const q = new URLSearchParams(location.search)
  if (valor === defecto || valor === undefined || valor === null) q.delete(nombre); else q.set(nombre, String(valor))
  history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash)
}

// Valor inicial de cada control: el de la URL si es válido; si no, el marcado `default` (radio: o la primera opción; switch: `default`, false si no se indica)
export const valoresPorDefecto = (groups) => {
  const q = new URLSearchParams(location.search)
  return Object.fromEntries(groups.flatMap((g) => g.controls).map((c) => {
    const crudo = q.get(paramDe(c))
    if (c.type === 'switch') return [c.id, crudo === '1' ? true : crudo === '0' ? false : defectoDe(c)]
    return [c.id, c.options.some((o) => o.value === crudo) ? crudo : defectoDe(c)]
  }))
}

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
      const c = props.groups.flatMap((g) => g.controls).find((x) => x.id === id)
      escribirParam(paramDe(c), c.type === 'switch' ? (value ? 1 : 0) : value, c.type === 'switch' ? (defectoDe(c) ? 1 : 0) : defectoDe(c))
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
