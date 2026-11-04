// DATOS DE EJEMPLO del prototipo «Menú hamburguesa (Cliente logado)». Figma «Navegación - Potenciales» (bYhmzXdiu7ugIr8U2vY8Hp), nodos 1572:13077 (nivel 1) y 1668:2393 (nivel 2 de «Tu cuenta»).
// Del Figma salen: usuario, el primer nivel y el segundo nivel de «Tu cuenta». Todo lo demás (segundo nivel del resto de secciones y los terceros niveles) es INVENTADO para poder probar la interacción;
// los destinos (href) son hashes ficticios: en producción vendrán del backend / AEM.
const h = (id) => '#/' + id

export const clienteLogado = {
  user: { name: 'Álex Rodríguez Sanz', description: 'Minorista', href: h('tu-perfil') },
  items: [
    { id: 'tu-cuenta', title: 'Tu cuenta', href: h('tu-cuenta'), children: [
      { id: 'transferencias', title: 'Transferencias', href: h('tu-cuenta/transferencias'), children: [
        { title: 'Nueva transferencia', href: h('tu-cuenta/transferencias/nueva') },
        { title: 'Transferencias programadas', href: h('tu-cuenta/transferencias/programadas') },
        { title: 'Histórico de transferencias', href: h('tu-cuenta/transferencias/historico') },
        { title: 'Cuentas de destino', href: h('tu-cuenta/transferencias/destinos') },
      ] },
      { title: 'Traspasos', href: h('tu-cuenta/traspasos') },
      { id: 'movimientos', title: 'Movimientos e informes', href: h('tu-cuenta/movimientos'), children: [
        { title: 'Movimientos de efectivo', href: h('tu-cuenta/movimientos/efectivo') },
        { title: 'Movimientos de valores', href: h('tu-cuenta/movimientos/valores') },
        { title: 'Informes fiscales', href: h('tu-cuenta/movimientos/fiscales') },
        { title: 'Extractos', href: h('tu-cuenta/movimientos/extractos') },
      ] },
      { title: 'Asesoramiento', href: h('tu-cuenta/asesoramiento') },
      { title: 'Planificación financiera', href: h('tu-cuenta/planificacion') },
      { id: 'otras-operaciones', title: 'Otras operaciones y consultas', href: h('tu-cuenta/otras-operaciones'), children: [
        { title: 'Datos personales', href: h('tu-cuenta/otras/datos') },
        { title: 'Certificados', href: h('tu-cuenta/otras/certificados') },
        { title: 'Contratos y documentos', href: h('tu-cuenta/otras/documentos') },
      ] },
      { title: '40 Aniversario', href: h('tu-cuenta/40-aniversario') },
    ] },
    { title: 'Carteras gestionadas', href: h('carteras-gestionadas') },
    { id: 'fondos', title: 'Fondos y planes', href: h('fondos-y-planes'), children: [
      { title: 'Fondos de inversión', href: h('fondos/fondos') },
      { title: 'Planes de pensiones', href: h('fondos/planes') },
      { title: 'Buscador de fondos', href: h('fondos/buscador') },
    ] },
    { id: 'bolsas', title: 'Bolsas y derivados', href: h('bolsas-y-derivados'), children: [
      { title: 'Bolsas', href: h('bolsas/bolsas') },
      { title: 'ETFs', href: h('bolsas/etfs') },
      { title: 'CFDs', href: h('bolsas/cfds') },
      { title: 'Derivados', href: h('bolsas/derivados') },
      { title: 'Warrants', href: h('bolsas/warrants') },
      { title: 'Criptoactivos', href: h('bolsas/criptoactivos') },
    ] },
    { id: 'renta-fija', title: 'Renta fija', href: h('renta-fija'), children: [
      { title: 'Letras del Tesoro', href: h('renta-fija/letras') },
      { title: 'Bonos y obligaciones', href: h('renta-fija/bonos') },
      { title: 'Renta fija corporativa', href: h('renta-fija/corporativa') },
    ] },
    { title: 'Soluciones Easy', href: h('soluciones-easy') },
    { title: 'Análisis e ideas', href: h('analisis-e-ideas') },
  ],
  favoritos: { title: 'Favoritos', href: h('favoritos'), icon: 'ic-star' },
}

// DATOS DE EJEMPLO del prototipo «Menú hamburguesa con idiomas (Luxemburgo)». Los textos de navegación son los del site de Renta 4 Luxemburgo (captura de Jon, 2026-11-04);
// los destinos (href) son hashes ficticios. Usuario potencial (no logado): sin caja de perfil, sin favoritos y sin niveles inferiores.
export const potencialLuxemburgo = {
  languages: { ariaLabel: 'Idioma', value: 'es', items: [{ label: 'ES', value: 'es' }, { label: 'EN', value: 'en' }] },
  items: [
    { title: 'Quiénes somos', href: h('quienes-somos') },
    { title: 'Nuestros Servicios', href: h('nuestros-servicios') },
    { title: 'Nuestros Valores', href: h('nuestros-valores') },
    { title: 'Fondos Alternativos', href: h('fondos-alternativos') },
    { title: 'Renta 4 (SICAV)', href: h('renta-4-sicav') },
    { title: 'Noticias de interés', href: h('noticias-de-interes') },
  ],
  sites: { ariaLabel: 'Otros sitios de Renta 4', items: [
    { title: 'Renta 4 Banco', href: h('sitios/banco') },
    { title: 'Renta 4 Wealth', href: h('sitios/wealth') },
    { title: 'Renta 4 Gestora', href: h('sitios/gestora') },
    { title: 'Renta 4 Pensiones', href: h('sitios/pensiones') },
  ] },
  ctaText: 'Contáctanos',
  secondaryText: 'Cómo contratar',
}
