# Lectura completa de las fuentes autorizadas de Confluence — hallazgos (2026-10-05)

> Se leyeron las 98 páginas autorizadas de `fuentes-confluence.md` (todas `current`; la database del listado de componentes no es legible por el conector).
> Esto NO es una copia de la documentación: es la lista de **reglas que afectan a quien construye** y de **contradicciones entre páginas autorizadas** que Jon debe resolver.
> Origen: 4 lecturas en paralelo + verificación propia del caso R4Stats. Las afirmaciones marcadas «(doc)» salen de las lecturas y deben contrastarse con la página antes de apoyarse en ellas.

## 1. Reglas firmes (consistentes entre páginas)
- Tokens: cascada Foundations → Brand → Theme → Components (+ Typography y Layout por modo); capa más alta posible; nunca hex.
- Grid: 12 / 8 / 4 columnas, gutter 24. Contenido de procesos: 6/12 · 6/8 · 4/4. Resultados: 4/12 (6/12 a 1024 px).
- R4Wrapper (v1.2, 11 nov 2026): `density` relaxed 64/56/48 · default 48/40/32 · compact 32/28/24; gap de la grid = padding; primer Wrapper → `--wrapper-paddingTopFirstWrapper`; sin prop `isFirst`; sin `mediaQuery` en código; anatomía R4Wrapper → Grid (sin Slot); prop `layout` (12 · 8-4 · 6 · 4); Grid con ancho máx. 1176 (desde 1176) y 1368 (desde 1440).
- R4Stack (v1.2): `gap` xs/sm/md/lg/xl (4/8/16/24/32), `direction`, `align`, `wrap` (por defecto true), `divider`; vive dentro de las celdas de la Grid del Wrapper.
- Procesos: R4ProgressBar entre Header y Main; sin Footer.
- Nomenclatura: componentes `R4PascalCase`; props y valores `camelCase`.
- La API de código está en la tabla «API componente» de cada página, no en las props de Figma (que existen solo para diseñar: `showX`, `mediaQuery`, `interaction`…).

## 2. Contradicciones entre páginas autorizadas — RESUELTAS por Jon (2026-10-05) donde se indica
1. **Ancho máximo del contenedor:** RESUELTO → 1368 px; **actualizado 2026-11-11 (R4Wrapper v1.2): 1176 desde 1176 px y 1368 desde 1440 px**, fluida por debajo.
2. **Padding horizontal:** RESUELTO → **24 (desktop/tablet) / 12 (mobile)**.
3. **Tablet:** RESUELTO → el cambio a tablet es a partir de **600 px**; 768 es solo el tamaño del frame de Figma que representa tablet.
4. **`surface/page` (Light):** RESUELTO → **#F7F7F7** (Figma); Jon corrige la página de tokens.
5. **Nomenclatura prohíbe `style`, `type` y `device`:** RESUELTO de momento → se mantiene `type` (regla antigua, quizá se revise).
6. **Foco visible:** RESUELTO → doble anillo 6 + 4.
7. **Áreas táctiles 44×44:** en suspenso por decisión de Jon.
8. **R4Stats** (Confluence, 21 sept 2026): ya no hay `columns`; `orientation` + slot de 2–4 statItem y columnas por `minWidth`; statItem tiene `style` plain|boxed. **`docs/` y `CLAUDE.md` estaban obsoletos → actualizados.**
9. **R4Title:** RESUELTO → Subtitle y Pretitle son estilos tipográficos de Figma; la página se limpió el 2026-10-05 (sin menciones a subtitle/pretitle y `size` por defecto `extraLarge2` en Figma y API).
10. **`density`** significa cosas distintas: Wrapper none/compact/default/relaxed (la doc de API solo lista relaxed/default/compact), R4NavigationItems default/narrow/relaxed, R4Popover default/none.
11. **Defaults Figma ≠ API:** R4Title (`extraLarge2` vs `medium`), R4ListDetail (`large` vs `extraLarge`), R4ListIcon, R4NavigationItems (`hasCardContainer` yes vs false). Fijar el de la API.
12. **Específicos (componentes viejos sin revisar; se dejan como están y se levanta la mano antes de implementar uno) con `mediaQuery`/`device` o padding/fondo propios** (doc): R4FAQ (padding vertical 64/48), Hero, HeroHome, HighlightMedia (`background`), RichText, PageTitle*, CardAdvisor, ChartLine, RiskBox, R4Jumbo (alto fijo y fondo propio), Notification, Modal, Title. Chocan con «el Wrapper pone la banda de color/padding» y con «sin mediaQuery».
13. **Interactividad (un solo elemento interactivo):** R4CardImage (card clicable + R4Link), R4Article (`<a>` envolvente), R4CardAccount (`role=button` con `dl`), R4CardAdvisor, R4CardProduct, R4Documents combinan superficie clicable y enlaces/CTA.
14. **(RETIRADO)** La lista de «páginas incompletas» que se dio salió de resúmenes de los lectores sin verificar y era errónea (p. ej. R4Chip está completa y R4Divider no existe como componente). La completitud la decide Jon. Pendiente real: R4Table con dos APIs.
15. **Input Text y variantes** (ene 2025, Figma 1.0): errores de copy-paste (placeholder «Usuario» en Amount/IBAN, label «NIF / CIF» en User, lógica del IBAN invertida), `required` default False en la tabla pero «todos obligatorios» en el texto, sin API Vue ni a11y. Página «Inputs de texto» vacía.
16. **Catálogo vs Confluence:** R4ChartLine, R4RichText, HeaderProduct y Grid (específico) no están en `catalogo.md`; nombres que no coinciden (R4BlockHighlightMedia, R4ListConsents, R4Notificacion, R4CardList, R4Input/R4Select). «Nueva taxonomía» (jun 2026) clasifica como primitivos componentes que el catálogo da como AEM o sin Vue.
17. **R4ProgressBar:** el catálogo lo da como VUE, pero la página lo describe como cabecera de proceso completa; Figma limita `progress` a 1–3 y la API tiene `totalSteps` libre. Puede no ser el Vue existente.
18. **Templates:** de momento se deja (TemplateProcess en WIP).
19. **Changelog:** la columna Fecha está vacía en todas las filas.
20. **Varios:** analítica con prefijos/canales distintos (`[Channel]`, `App`, sin `R4`); snippets que invierten `eventLink`/`eventText`; Storybook en `next.renta4.es:10001` (R4Button, R4AccountSwitch) distinto del documentado; R4Chip `aria-pressed` donde debería ser `aria-expanded`; R4Divider Plain|Text vs Plain|Title; R4Icon `extraSmall` no contado en variantes; R4Section: `appearance` (API/Figma) frente a `style` (Changelog); R4Steps: catálogo 40→32 px y página large = 48.

## 3. Dónde está el detalle
Los resúmenes por página (API, accesibilidad, valores literales) se generaron en un directorio temporal y no se versionan. Se vuelven a leer en vivo con `getConfluencePage` según `fuentes-confluence.md`.
