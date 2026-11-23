// HERRAMIENTA DEL PROTOTIPO (no es del Design System): hace que un R4Sheet bottom siga al VIEWPORT VISUAL cuando se abre el teclado del móvil.
// Problema: con el teclado abierto, iOS desplaza el viewport visual (y Android lo encoge) pero los elementos `position: fixed` siguen anclados al viewport de diseño: la capa queda empujada/tapada
// y no se ve la caja de búsqueda. Solución: se publican en <html> dos variables CSS (--r4-vv-bottom: lo que tapa el teclado por abajo · --r4-vv-height: alto visible) y la clase `r4-teclado`; el CSS de cada
// prototipo sube la capa por encima del teclado y calcula su alto sobre el espacio visible. Sin teclado (diferencia < 120 px) se limpia todo. `alCambiar(visible)` (opcional) avisa cuando el teclado aparece o desaparece. Devuelve la función que deja de escuchar.
export function seguirTeclado(alCambiar) {
  const vv = window.visualViewport
  if (!vv) return () => {}
  const root = document.documentElement
  const aplicar = () => {
    const tapado = window.innerHeight - vv.height
    if (tapado > 120) {
      root.style.setProperty('--r4-vv-bottom', Math.max(0, window.innerHeight - vv.offsetTop - vv.height) + 'px')
      root.style.setProperty('--r4-vv-height', vv.height + 'px')
      root.classList.add('r4-teclado'); alCambiar && alCambiar(true)
    } else {
      root.style.removeProperty('--r4-vv-bottom'); root.style.removeProperty('--r4-vv-height'); root.classList.remove('r4-teclado'); alCambiar && alCambiar(false)
    }
  }
  vv.addEventListener('resize', aplicar); vv.addEventListener('scroll', aplicar); aplicar()
  return () => { vv.removeEventListener('resize', aplicar); vv.removeEventListener('scroll', aplicar); root.style.removeProperty('--r4-vv-bottom'); root.style.removeProperty('--r4-vv-height'); root.classList.remove('r4-teclado') }
}
