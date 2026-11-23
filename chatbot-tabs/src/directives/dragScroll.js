// Directiva del prototipo: scroll horizontal arrastrando con el ratón (con táctil el navegador ya hace scroll nativo; los scrollbars están ocultos en Tabs y chips, así que sin esto
// el ratón no puede desplazar la barra). No es un componente del sistema. Evita el clic si hubo arrastre.
export default {
  mounted(el) {
    let down = false, startX = 0, startLeft = 0, moved = false
    el.style.touchAction = 'pan-x pan-y'
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return
      down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft
    })
    window.addEventListener('pointermove', (e) => {
      if (!down) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 5) moved = true
      if (moved) el.scrollLeft = startLeft - dx
    })
    window.addEventListener('pointerup', () => { down = false })
    el.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false } }, true)
    el.addEventListener('wheel', (e) => { if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { el.scrollLeft += e.deltaY; e.preventDefault() } }, { passive: false })
  },
}
