# R4 Design System — Front-end (Renta 4 Banco)

Construyes el front-end de pantallas diseñadas en Figma, siendo **100 % fiel** a los componentes, la anatomía
y las guías del Design System R4. Responde a Jon en español, de forma concisa. Infiere decisiones razonables de
contexto, pero si una inferencia afecta a un componente o a una regla de este archivo, dilo.


> **FASE ACTUAL: PROTOTIPADO, TEMPORAL.** El objetivo ahora es generar **prototipos funcionales** de las pantallas diseñadas en Figma.
> Todavía no hay acceso al repo de la librería Vue de IT, así que los componentes se **reconstruyen desde Figma** en
> `src/components/pendientes/`. **Esto es provisional**: cuando haya acceso al repo o paquete de IT, esos componentes se
> sustituirán por los oficiales (ver "Transición al repo de IT"). Construye pensando en esa sustitución.

## Los 3 ámbitos del sistema de diseño

El sistema de diseño de Renta 4 tiene tres ámbitos:

- **Figma** → librería de componentes UI, variables y foundations.
- **Storybook** → repositorio de los componentes ya pasados a código (Vue.js).
- **Confluence** → toda la documentación.

No todos los componentes diseñados en Figma están desarrollados en Vue: de ahí el flujo obligatorio de más abajo.

## Recursos

### Confluence (espacio DIS)

- Arquitectura de tokens → https://renta4.atlassian.net/wiki/spaces/DIS/pages/3694592029/Arquitectura+de+tokens
- Explicación de la estructura de los componentes → https://renta4.atlassian.net/wiki/spaces/DIS/pages/2524512346/Componentes
- Listado de los actuales componentes → https://renta4.atlassian.net/wiki/spaces/DIS/database/3145597151?atl_f=PAGETREE
  (página de tipo *database*: el conector solo devuelve metadatos). **El listado ya está volcado en `docs/design-system/catalogo.md`
  y es la fuente que se usa. No pidas a Jon un CSV ni el listado: está en la documentación.**
- Carpeta padre de Primitivos → https://renta4.atlassian.net/wiki/spaces/DIS/pages/2846457858/Primitivos
- Carpeta padre de Específicos → https://renta4.atlassian.net/wiki/spaces/DIS/pages/2822045728/Espec+ficos
- Anatomía de páginas de procesos → https://renta4.atlassian.net/wiki/spaces/DIS/pages/3497656350/P+ginas+de+Procesos
- Componente Wrapper → https://renta4.atlassian.net/wiki/spaces/DIS/pages/3767762951/Wrapper
- **Changelog de cambios** (cambios solicitados a componentes vía Jira Service Management; página estándar, legible por MCP) → https://renta4.atlassian.net/wiki/spaces/DIS/pages/3832610825/Changelog+cambios
  Indica qué se pidió cambiar, **no** si ya está implementado en Vue.
  Lectura por MCP de Atlassian: `getConfluencePage` con `cloudId: renta4.atlassian.net`, `pageId: 3832610825`,
  `contentFormat: markdown` (funciona; hay que cargar la herramienta con ToolSearch). `catalogo.md` solo resume sus entradas
  clave: **para cada componente, léelo en vivo** (paso 0 del flujo) y no vuelvas a preguntar a Jon por él.

### Figma

- **Primitivos 1.2** (el principal: variables, foundations y componentes principales) →
  https://www.figma.com/design/LXKe53jePjDEAVhdYCU4ed/R4-Design-System-%7C-Primitivos-%7C-1.2?node-id=14244-3125&t=gV2kzVq7Ys0nN3fA-0
- **Específicos 1.0** (componentes específicos / compuestos) →
  https://www.figma.com/design/J199oWCLWyL9mly6xNdUcR/R4-Design-System-%7C-Espec%C3%ADficos-%7C-1.0?node-id=1444-1056&t=cgztn1axadR05tF5-0

### Storybook (librería Vue de IT)

- https://storybook-dev.renta4.es/

## Decisiones cerradas (no volver a preguntar)

- **Catálogo y Changelog:** ver Recursos. El catálogo es `catalogo.md`; el Changelog se lee en vivo por MCP.
- **Figma:** usar el conector de Figma ya cargado (`get_metadata`, `get_design_context`, `get_screenshot`, `get_variable_defs`).
  Los conectores `plugin:design:*` pueden fallar por proxy: ignóralos.
- **Menu y Footer** son componentes del archivo Figma **"R4 Design System | Templates | 1.0"** (generación antigua, pero se
  siguen usando de momento). No están en el catálogo. Se reconstruyen desde ese archivo en `pendientes/`, como no oficiales.
  En páginas de proceso el Menu es `Type=Process` y no hay Footer (la pantalla del doble factor no lo lleva: es coherente).
  `_Browser` es solo marco de presentación: **no se construye**.
- **Stack del prototipo:** lo único conocido de IT es que usa **Vue.js**; Jon no sabe más hasta dar acceso al repo. **En el
  equipo de Jon no se puede instalar Node.js ni usar npm** (proxy corporativo y sin admin): no propongas nada que lo requiera.
  Stack **sin build**: Vue 3 como módulo ES local (`vendor/vue.esm-browser.prod.js`, descargado una vez por Jon), componentes
  como módulos `.js` (`defineComponent` + `template`, mismas props y nombres que en Figma), CSS plano con variables CSS
  (tokens semánticos) y container queries. Se sirve con `serve.ps1` (PowerShell, localhost). Sin Tailwind, Router ni Pinia.
  Provisional: al llegar el repo de IT, cada componente se migra a su formato (SFC) o se sustituye por el oficial.
- **Un prototipo = una carpeta con su URL** (decisión de Jon, 2026-11-03). Estructura: `prototipos/<nombre>/index.html` (solo importa su pantalla y su CSS, y la monta con
  `src/montar.js`); lo compartido (tokens, `styles/componentes.css`, componentes, iconos, data) vive en `src/` y es el mismo para todos. La portada `index.html` lista los
  prototipos: **al crear uno nuevo, añádelo ahí**. Rutas de recursos (logos…) respecto al módulo con `new URL(…, import.meta.url)`, nunca relativas al documento.
  Un componente nuevo o una variante nueva (p. ej. Menu mobile) se añade a `src/components/pendientes/` por props, sin cambiar el comportamiento de los prototipos existentes.
- **Hasta tener acceso al repo de IT, creas tú todos los componentes** (incluso los `VUE` del catálogo), en `pendientes/`.
- **Tokens = cascada de 6 capas con alias, NO una lista plana de hex.** Lee la página de Confluence "Arquitecturas de tokens"
  (3694592029) antes de tocar tokens. Colecciones de Primitivos 1.2 (`LXKe53jePjDEAVhdYCU4ed`): Foundations (literales) →
  Brand (Renta4 | Colombia) → Theme (Light | Dark) → Components; Typography (Desktop/Tablet/Mobile) y Layout (Desktop XL/Desktop/Tablet/Mobile).
  Hasta tener el repo de IT, **este repo las declara** (excepción a "no copies contenido de Figma") en `src/tokens/`, **conservando los alias**
  (`--surface-subtle: var(--color-neutral-gray-100)`; `--accent-default: var(--brand-accent-default)`). Reglas:
  - **Nunca** vuelques valores resueltos (`get_variable_defs` devuelve hex ya resueltos: sirve para consultar, no para generar tokens).
  - Los componentes consumen la capa **más alta posible**: Components > Theme > Brand > Foundations. Nunca hex ni literales; si no existe
    token, se pregunta o va a `src/tokens/pending.css` (manual, prefijo `--r4-`) con el motivo. Los estilos de efecto de Figma van en `effects.css`.
  - `foundations/brand/theme/components/typography/layout.css` están **GENERADOS** (no se editan): fuente `tools/tokens/*.txt` + `tools/generate-tokens.ps1`.
    Para actualizar desde Figma: volcar la colección con `use_figma` (nombre, modos, valor o alias `→Colección:nombre` por modo vía
    `figma.variables.getLocalVariableCollectionsAsync()` / `valuesByMode`), reemplazar el `.txt` y ejecutar
    `powershell -ExecutionPolicy Bypass -File tools/generate-tokens.ps1`.
  - **Tampoco literales de tamaño** (`40px`, `16px`, `1px`…): usa la escala de Foundations (`--spacing-*`, `--radius-*`) o el token de componente
    (`--component-button-size-large`, `--component-checkbox-size`…); medidas sin token se derivan (`calc(var(--spacing-2) + var(--spacing-05))`)
    o van a `pending.css`. Únicas excepciones: el tamaño intrínseco de un asset (svg del check, QR de ejemplo) y utilidades técnicas (`sr-only`).
  - Brand lleva prefijo `--brand-` (Theme reusa sus nombres). Tema y marca por atributo en `<html>`: `data-theme="dark"`, `data-brand="colombia"`.
  - Typography y Layout por modo se aplican sobre `.r4-layout-modes` con container queries del contenedor `r4page` (Tablet ≤ 1023, Mobile ≤ 599: el cambio a tablet es a partir de 600 px; 768 solo es el tamaño del frame de Figma que representa tablet).
  Cuando llegue el repo de IT, se sustituyen por los suyos.
- **Iconos y logotipo: siempre los de Figma, nunca dibujados ni inventados.** Los iconos son componentes de Primitivos 1.2 (página
  "↳ Icons"). Se obtienen con `use_figma` (solo lectura; cargar antes el skill `figma-use` con `get_figma_skill`,
  `uri: skill://figma/figma-use/SKILL.md`) exportando el nodo con `exportAsync({ format: 'SVG_STRING' })`, y se registran en
  `src/icons/icons.js` con el nombre del componente de Figma (color fijo → `currentColor`). El logotipo es `R4 / Brand / Types`
  (`R4BrandTypes`). `curl` a figma.com y a nodejs.org falla por el proxy corporativo (407): no lo intentes.
- **Reconstruir un componente = leerlo entero en Figma, no solo la variante que usa la pantalla:** props, variantes, estados
  (hover, focus, pressed, disabled), tokens (con `use_figma` y `variable.resolveForConsumer(node)`, porque `get_variable_defs`
  falla con componentes de librería) y valores por mediaQuery. Lo que no se reconstruya se declara en la cabecera del archivo
  y en el resumen final. No inventes estilos: si Figma no lo dice, léelo; si no se puede leer, pregunta.
- **Header de página:** todo lo que en Figma entra en la capa `Header` (Menu + R4ProgressBar; se omite `Browser`) queda **fijo
  (`position: sticky; top: 0`)** al hacer scroll. Lo hace `TemplateProcess`.
- **Responsive de las páginas de proceso** (Confluence "Páginas de Procesos", 3497656350, leída en vivo; tabla por ancho de
  referencia 1024 · 768 · 390): columnas 12 / 8 / 4; contenido 6 de 12 · 6 de 8 · 4 de 4; padding vertical y espacio entre bloques
  48 / 40 / 32; padding horizontal 24 / 24 / 12; ancho máx. 1368. Se implementa con las **variables de modo de Figma**
  (colecciones Layout, Typography y 1. Grid: Desktop XL / Desktop / Tablet / Mobile) en `src/tokens/tokens.css`, aplicadas por el
  ancho del **contenedor** `r4page` (la Template) con container queries. Umbrales 1024 / 768: inferidos de esa tabla.
  El contenido de la pantalla puede **cambiar** entre breakpoints (p. ej. mobile del doble factor: sin QR, con campo + botón copiar):
  pide siempre el Figma de cada breakpoint; si falta (hoy: tablet), extrapola con los tokens y la tabla y **dilo**.
- **Componentes viejos en Figma:** `_Phone` (variante Phone de R4InputText) es antiguo: el campo ocupa el **100 % del padre** y usa los
  **tokens nuevos** (`component/input/*`, `feedback/*`), no los de la generación `Interaction/Input/*`. Si un componente de Figma mezcla
  generaciones de tokens o anchos fijos incoherentes, usa los nuevos, aplica la lógica del sistema y **lista la discrepancia** en el resumen.
- **Checkbox:** SÍ hay página de Confluence con tabla de API (R4InputCheckbox, 2810708014); una búsqueda por título parcial no la encontró. Para localizar docs usa `docs/design-system/fuentes-confluence.md` (solo páginas autorizadas), no búsquedas por título.
- **Flujo B (lección de la 1.ª prueba):** antes de componer, contrasta Figma y Confluence (solo las páginas autorizadas de `fuentes-confluence.md`) en anchos de contenido y tokens: en la 1.ª prueba hubo que decidir entre dos anchos de columnas y se siguió "Páginas de Procesos" (la más reciente); deja las discrepancias en "Pendiente / dudas".
- **Decisiones de Jon sobre contradicciones de la documentación (2026-10-05) — ya NO son dudas:**
  - Ancho máximo del contenedor: **1368 px**. Padding horizontal: **24 (desktop/tablet) / 12 (mobile)**.
  - Breakpoints: **tablet empieza en 600 px** (mobile < 600); los 768 px son solo el tamaño del *frame* de Figma que representa tablet. Desktop desde 1024.
  - Fondo de página `surface/page` Light = **#F7F7F7** (la variable de Figma manda; la página de tokens se corrige).
  - Se mantiene la propiedad `type` en las APIs aunque la regla de Nomenclatura (antigua) la desaconseje; puede revisarse.
  - Foco visible: **doble anillo 6 px negro + 4 px blanco** (`--effect-card-focus-outline`).
  - Regla de áreas táctiles 44×44: **obviarla de momento**.
  - R4Subtitle y R4Pretitle **no son componentes**: son estilos tipográficos de Figma. `R4Title` ya no lleva `type` (Confluence actualizado).
  - TemplateProcess y los modelos de Template del repo están **en WIP**: se dejan como están (Confluence usa Template 1/2/3).
  - **Específicos** son componentes en general viejos y sin revisar: de momento se dejan como están. Al implementar uno, si ves contradicciones con las reglas
    del sistema (`mediaQuery`, fondo/padding propio, varios elementos interactivos…), **levanta la mano ANTES de hacer nada**.
  - Qué página está "completa" lo decide Jon, no la ausencia de una sección: no declares "incompletas" páginas por no tener tabla "API componente". R4Divider no existe como componente.
- **Orden en el DOM:** manda el orden de lectura lógico (título → contenido → acción), no el orden de capas de Figma.
- **Datos de prototipo** (QR, claves, textos que vendrían de backend): usa valores de ejemplo y señálalos.

## Fuentes de verdad

| Fuente | Qué es | Autoridad para |
|---|---|---|
| **Figma** | Componentes UI, variables, foundations | Visual, anatomía, ejes, tokens |
| **Librería Vue de IT** (Storybook: https://storybook-dev.renta4.es/) | Componentes ya desarrollados | **API real** (props, slots, eventos) de lo que existe |
| **Confluence** (espacio DIS, renta4.atlassian.net) | Documentación | Guías y razonamiento. **Puede estar desactualizada** |
| `docs/design-system/` | Decisiones ya tomadas | Reglas de composición |

- Archivos Figma: Primitivos `LXKe53jePjDEAVhdYCU4ed` · Específicos `J199oWCLWyL9mly6xNdUcR`.
- Si Figma, el código Vue y Confluence **discrepan**: no resuelvas en silencio. Señálalo a Jon con la diferencia concreta.
- Accede a Figma y Confluence **por MCP, en vivo**. No copies su contenido a este repo.
- Nunca escribas credenciales ni tokens en archivos del repo. Usa variables de entorno.

## Primeros pasos (mientras el proyecto no esté montado)

Si en esta carpeta todavía **no hay proyecto Vue** (`package.json`, `src/`), sigue este orden y **no empieces con pantallas reales hasta completar los pasos 1 a 3**:

1. **Control de versiones.** Si la carpeta no es un repositorio git, ejecuta `git init` y haz un primer commit con la documentación (`CLAUDE.md` y `docs/`).
2. **Proyecto base.** Antes de crearlo, **propón a Jon el stack** (Vite + Vue, versión de Vue, TypeScript sí/no, enfoque de estilos y cómo cargar los tokens) y espera su confirmación. Si Jon indica el stack que usa IT, úsalo. Crea el proyecto con la carpeta `src/components/pendientes/` ya preparada.
3. **Prueba de humo con una pantalla pequeña.** Pide a Jon el enlace de Figma de una pantalla sencilla (por ejemplo, una de proceso con pocos componentes: R4PageTitleProcess, R4InputText, R4Button). Constrúyela siguiendo el flujo obligatorio y comprueba, antes de dar nada por bueno, que has:
   - leído el Changelog y el catálogo para cada componente;
   - respetado Template y Wrapper (todo dentro de un Wrapper, `isFirst`, density);
   - guardado los componentes reconstruidos en `src/components/pendientes/`;
   - listado al final lo que has reconstruido y cuáles eran `VUE` en el catálogo.
4. **Revisión con Jon.** Muéstrale el resultado con una captura y las decisiones que hayas tenido que inferir. Si algo no encaja, propón el cambio concreto para este `CLAUDE.md` en lugar de corregirlo solo en esta sesión.
5. **Después**, pantallas más grandes (fichas de producto, Tu Cuenta, doble factor), reutilizando los componentes ya guardados en `pendientes/`.

Cuando el proyecto base exista y la prueba esté validada, esta sección deja de aplicar: Jon puede borrarla.

## Estado actual: sin acceso al código de IT

**Todavía no hay repo ni paquete de la librería Vue de IT en este proyecto.** Mientras sea así, no puedes importar
ningún componente, ni siquiera los marcados como `VUE` en el catálogo. Aplica esto:

- Trata **todos** los componentes de Figma como "existe en Figma pero no en Vue" (rama 2 del flujo): constrúyelos desde Figma en `src/components/pendientes/`.
- Para los marcados `VUE`, aun así consulta el catálogo y el Changelog: te dicen qué existe de verdad en la librería oficial y qué cambios se han pedido.
- No inventes la API de un componente que el catálogo da como existente en Vue: sin acceso al código, **no conoces sus props reales**. Construye según Figma y avisa de que es una reconstrucción.
- Los componentes `AEM`, `SIN FIGMA` o ausentes del catálogo siguen siendo "para y avisa".
- Al terminar cada tarea, lista qué componentes has reconstruido y cuáles eran `VUE` en el catálogo, para que se puedan sustituir cuando haya acceso al repo.

### Transición al repo de IT (cuando Jon lo indique)

1. Jon te dará acceso al repo o al paquete. Hasta que lo diga expresamente, esta sección sigue vigente.
2. Lee la API real de cada componente oficial y completa en el catálogo las columnas Import y mapeo de props.
3. Por cada componente de `src/components/pendientes/` que ya exista en la librería: **sustitúyelo por el oficial**, adapta las pantallas a sus props reales y elimina el archivo reconstruido. Avisa de las diferencias de API o de comportamiento.
4. Lo que siga sin existir en la librería se queda en `pendientes/`, marcado como no oficial.
5. Borra la sección "Estado actual" y el aviso de fase temporal del inicio de este archivo.

Para que la sustitución sea fácil: la **API del componente reconstruido es la de la tabla "API componente" de su página de Confluence** (espacio DIS; búscala con `searchConfluenceUsingCql`: `space = DIS AND title ~ "R4Nombre"`), **no las props de Figma**: la doc lo dice ("no se corresponden 1:1 con la API en código"). Las props de Figma que solo existen para diseñar (`showHeader`, `showX`, `mediaQuery`, `interaction`/estados, `content`) se **deducen o las resuelve el CSS**. Si una página no tiene tabla de API, usa las props de Figma y dilo. No añadas API propia (si hace falta un extra, como `v-model`, márcalo en la cabecera) y no mezcles lógica de pantalla dentro de los componentes.
Lee **siempre** la página de Confluence del componente (API, accesibilidad: roles, orden de foco, `aria-*`) antes de reconstruirlo, además de Figma.

## Flujo obligatorio para cada pieza de UI

Antes de escribir markup, consulta el catálogo (importado aquí abajo) y sigue este orden:

-3. **Comprobación de accesos al empezar una sesión (antes de cualquier tarea que use Confluence o Figma).** El acceso NO está garantizado: depende de los conectores
   de la cuenta de Jon, de su autenticación y de la red corporativa (en la 1.ª sesión los conectores `plugin:design:*` fallaron con "407 Proxy Authentication Required";
   funcionaron los conectores de Atlassian y de Figma a nivel de cuenta). Haz una llamada barata a cada uno: Atlassian → `getAccessibleAtlassianResources` (o
   `getConfluencePage` con una página de `fuentes-confluence.md`); Figma → `whoami` o `get_metadata` de un nodo conocido. Si alguno falla, **díselo a Jon con el error literal
   y no continúes con datos de memoria ni con páginas alternativas**. Usa siempre los tools `mcp__<id>__...` que respondan; los `plugin:design:*` pueden fallar por proxy.
-2. **REGLA CRÍTICA — FUENTES DE CONFLUENCE AUTORIZADAS.** La documentación de Confluence no está 100 % actualizada: **solo son fuente válida las páginas
   listadas en `docs/design-system/fuentes-confluence.md`** (decisión de Jon, 2026-10-05): Sistema de diseño, Componentes, el listado de componentes (database),
   Changelog cambios, Arquitecturas de tokens, Grids, Nomenclatura, Storybook, Control de Versiones, **todo lo que cuelga de** Primitivos y de Específicos,
   **todo lo de** la carpeta Anatomía de páginas y **todo lo de** Patrones. **Todo lo demás del espacio DIS se ignora** (no se lee, no se cita, no se usa de
   base), aunque salga en una búsqueda: en especial la carpeta **"Borrar"**, las páginas "Revisión…", "Seguimiento…", "Archived…", "_OLD", etc.
   Si algo que necesitas no está en la lista, **dilo y pregunta** a Jon; no lo rellenes con una página no autorizada. Si dos páginas autorizadas se contradicen, señálalo.
-1. **Lectura previa obligatoria de documentación (en TODA tarea, Flujo A o B).** Antes de escribir una línea: abre `docs/design-system/fuentes-confluence.md`,
   identifica **todas** las páginas autorizadas que afectan a la tarea (tokens, grid, anatomía de la página, patrones, nomenclatura, y la página de **cada
   componente** con su tabla "API componente") y léelas **en vivo**, completas. Es independiente de lo que "ya sepas" o de que `CLAUDE.md`/`docs/` resuman algo.
   En el resumen final incluye la lista **"Documentación leída"** (título + id) y las páginas autorizadas que no has podido leer. Si no la has leído, no la cites.
0. **Antes de usar cualquier componente, busca su nombre en el Changelog** (Confluence, enlazado en Recursos; léelo por MCP en vivo, no de memoria). Si hay cambios recientes (`EVOLUTIVO`, `NUEVO`), tenlos en cuenta y avisa a Jon de las diferencias con lo que ves en el código o en Figma. El Changelog dice qué se pidió cambiar, no si ya está implementado en Vue.
1. **Existe en Vue (VUE / VUE+AEM):** impórtalo y úsalo. **Prohibido** reconstruirlo o imitarlo con HTML propio.
   Si sus props no coinciden con los ejes de Figma, usa el mapeo del catálogo; si no hay mapeo, lee el código del componente.
   Si la columna "Cambios posteriores a junio" tiene aviso, compara Figma con el componente antes de usarlo y avisa de diferencias.
2. **Existe en Figma pero no en Vue (SIN VUE / EN PROGRESO):** puedes crearlo, con estas condiciones:
   - **Antes de construir, mira si ya existe en `src/components/pendientes/`. Si existe, reutilízalo; no lo recrees.** Un componente se construye una sola vez y se importa desde ahí en todas las pantallas. Si Figma ha cambiado respecto a la versión guardada, actualiza el archivo existente en lugar de crear otro, y avisa de qué ha cambiado.
   - Ubícalo en `src/components/pendientes/`, **nunca** mezclado con la librería oficial.
   - Obtén anatomía y estilos con `get_design_context`, `get_variable_defs` y `get_screenshot`.
   - Usa tokens semánticos (nunca primitivos), prefijo `R4`, props en camelCase y slots donde Figma use SLOT.
   - Primera línea del archivo: `// PENDIENTE-IT: no oficial. Sustituir cuando exista en la librería Vue.`
   - Al terminar la tarea, **lista los componentes que has tenido que crear**.
3. **Solo AEM, SIN FIGMA, o no aparece en el catálogo:** **para y avisa a Jon.** No inventes el componente.
4. Si una pantalla necesita algo que no cubre ningún componente, no lo improvises con HTML suelto: pregunta.

## Dos flujos de trabajo

- **Flujo A — desde Figma:** Jon da un enlace de Figma y se desarrolla ese diseño (flujo obligatorio de arriba + reglas de este archivo).
- **Flujo B — desde prompt:** Jon describe una página o pieza **sin diseño** y se desarrolla con el conocimiento del Sistema de Diseño.
  Se activa cuando el encargo no trae enlace de Figma. Todas las reglas de este archivo siguen vigentes; el Flujo B añade lo siguiente.

### Flujo B: desarrollo desde prompt

**Principio:** no se diseña, se **compone**. Solo con componentes del catálogo, tokens semánticos y reglas de página. Si el prompt
exige algo que el sistema no cubre, se para y se pregunta (regla 3 y 4 del flujo obligatorio): nunca se inventa HTML suelto,
estilos ni componentes. Sin diseño no hay "interpretación visual libre": lo que no se pueda justificar con el sistema, se pregunta o se marca.

**Pasos (en este orden):**

1. **Interpretar el prompt.** Extrae: tipo de página, objetivo del usuario, contenido (textos, datos), acciones, estados (vacío, error,
   cargando, éxito), si es página de proceso, de feedback, de detalle, landing…, y si hay mobile/tablet específico. Lo que falte y
   **afecte a la composición**, se pregunta en una sola tanda (máx. 4 preguntas); lo demás se infiere y se lista al final.
2. **Elegir la anatomía de página.** Con `templates-y-wrapper.md` y Confluence (Páginas de Procesos, R4Wrapper): Template
   (Process / Landing / Detail / Post / States), Menu y Footer según el tipo, superficie (`app` gris / `marketing` blanca) y estructura
   Wrapper → Slot → Grid. Si no hay anatomía para ese tipo (dashboard, listados, autenticación…), **proponla a Jon antes de construir**.
3. **Mapear necesidades → componentes.** Haz la tabla "necesidad → componente → estado en catálogo → ¿ya en `pendientes/`?".
   Usa el catálogo y el Changelog (en vivo) y la página de Confluence de cada componente (API, accesibilidad). Reglas:
   - Reutiliza lo de `pendientes/`; no lo recrees.
   - Si existe en Figma y no está reconstruido: léelo entero (Figma + Confluence) y reconstrúyelo como en el flujo obligatorio (rama 2).
   - Si es solo AEM, SIN FIGMA o no aparece: **para y avisa** con la alternativa más cercana del sistema.
   - Preferencia por componentes específicos del sistema antes que combinar primitivos a mano.
4. **Componer con las reglas de página**, sin saltárselas: todo dentro de un Wrapper; primer Wrapper automático; una sola density;
   banda de color en el Wrapper; no dos Wrappers consecutivos con el mismo fondo; Hero y PageTitle excluyentes; interactividad con un
   solo elemento interactivo; un solo `<h1>` y jerarquía de encabezados correcta; ancho de contenido y columnas por la Template.
   Espaciado, color y tipografía **solo con tokens semánticos**; si falta un token, extráelo de Primitivos antes de usarlo.
5. **Derivar el responsive** (desktop 12 col, tablet 8, mobile 4) de las guidelines: columnas, paddings, tokens por modo y los ejes
   semánticos de cada componente (`size`, `columns`, `density`, `layout`). Sin diseño de mobile/tablet, **adapta de forma consistente**
   (mismo contenido y orden salvo que el sistema indique otra cosa) y no pidas el diseño.
6. **Contenido.** Usa los textos del prompt tal cual. Lo que falte: texto de ejemplo claramente marcado (datos de prototipo) y respetando
   la guía de contenido de cada componente (p. ej. botones en infinitivo, títulos orientados a la acción).
7. **Accesibilidad.** Aplica la de cada componente (roles, orden de foco y de lectura, `aria-*`) y la de página (landmarks, un `<h1>`,
   foco visible, `aria-live` en estados dinámicos).
8. **Verificar.** Arranca `serve.ps1` (preview), comprueba sin errores de consola y revisa a **1512, 800 y 390 px**: sin scroll horizontal,
   cabecera fija si es de proceso, contenido correcto por breakpoint. Mide con el DOM lo que se pueda contrastar con las guías de
   Confluence (columnas, paddings, tamaños). Hazlo antes de dar nada por bueno.
9. **Entregar.** Commit. Y el resumen final, siempre con estas tres listas:
   - **Decisiones inferidas** (qué has elegido sin que el prompt lo dijera y por qué, citando la regla o doc del sistema).
   - **Componentes**: reutilizados · reconstruidos en `pendientes/` (y cuáles eran `VUE` en el catálogo) · lo que no se reconstruyó de cada uno.
   - **Pendiente / dudas**: lo que habría que validar con Jon o con diseño (p. ej. variantes que no existen, copys, tablet).

**Qué NO hacer en el Flujo B:** inventar componentes, props o variantes; usar valores literales de color/espaciado; mezclar más de
un estilo de Wrapper/density; copiar patrones de otro producto; dar por válido sin verificar a los tres anchos; tratar los datos de
ejemplo como reales.

**Formato recomendado del prompt** (Jon puede darlo incompleto; se pregunta lo imprescindible):
`tipo de página` · `objetivo` · `contenido y textos` · `acciones principales` · `componentes que sí/no quiere` · `estados a cubrir` ·
`datos reales vs de ejemplo` · `nivel de la página (para el breadcrumb)`.

## Convenciones

- Componentes `R4Nombre`; subelementos internos con `_` (`_TabItem`). Props y valores de variante en camelCase.
- Colores, espaciado y tipografía **solo con tokens semánticos**. Arquitectura de tokens en Confluence: "Arquitectura de tokens".
- Composición por **slots**, no por listas de booleanos (`Show Item1…8` ya no existe).
- R4Section: el Changelog indica `backgroundColor` nueva y `style` limitada a la estructura. Se barajó renombrar `style` a `variant` por conflicto con el atributo HTML, sin confirmar: **lee la API real del componente en el código**.
- Frames de Figma: `cl-ficha-[tipo]--dk/mb` para fichas de producto desktop/mobile.

## Reglas de composición de página

Detalle y razonamiento en el documento importado al final. Estado: **propuesta v2 montada en Figma, pendiente de validar**.
Aplícala por defecto y avisa si Figma muestra otra cosa.

- Todo contenido vive dentro de un **Wrapper**. Nada suelto en `Main`. Un Wrapper = un bloque (salvo layouts de columnas explícitos).
- El **primer Wrapper** abre con `spacing/page-start` (48/40/32), que ignora la `density`. En la API: `isFirst`. El último sigue la `density`.
- Escala `density` (tabla responsive de la página R4Wrapper, la fuente de los valores): `compact` 32/28/24 · `default` 48/40/32 · `relaxed` 64/56/48 (desktop/tablet/mobile). Una sola density por página (excluyendo el primero).
  **Qué density usar** lo decide el contexto/Template (página "Templates" + R4Wrapper): **web pública → `relaxed`** (64 arriba y abajo en desktop) · **área de clientes → `compact`** (32) ·
  procesos, fichas de producto y posts → `default` (48). No son valores en conflicto: "Templates" da el valor de dos contextos y R4Wrapper los nombra y escala por breakpoint.
  **Confirmado por Jon:** todo proceso (incluido "Alta de cuenta") cuenta como proceso → `default`, nunca como área de clientes.
  El padding-top del **primer** Wrapper de cualquier template es siempre el token `--wrapper-paddingtopfirstwrapper` (48/40/32), con cualquier density;
  debe **apuntar a ese token** (hoy: `main > .r4-wrapper:first-child` en `R4Wrapper.css`), nunca a un valor ni a la density.
- La **banda de color la pone siempre el Wrapper**; los bloques (R4HighlightMedia…) van con `background=none`.
- Ningún Wrapper con `backgroundColor` igual a la superficie de página. `app` = gris (`none`, `white`, `brandPrimary`, `brandSecondary`). `marketing` = blanco (`none`, `grey`, `brandPrimary`, `brandSecondary`).
- Nunca dos Wrappers consecutivos con el mismo `backgroundColor` distinto de `none`.
- Los componentes dentro de un Wrapper **no llevan padding vertical propio**.
- **R4Hero y R4PageTitle son excluyentes.** Con Hero, los títulos de sección usan R4Title.
- El breadcrumb de R4PageTitle solo aparece en páginas de nivel 2 o más.
- Las páginas de proceso no llevan Footer.
- El ancho de contenido lo fija la template, no la pantalla.

## Responsive: ejes agnósticos al dispositivo

Detalle en el documento de ejes agnósticos importado al final.

- **`mediaQuery` no existe en desarrollo** (es una limitación de Figma): **el CSS controla los media/container queries**. Ningún componente tiene prop `mediaQuery` (ni Template, Wrapper, Menu o Footer); los ejes de dispositivo de Figma se resuelven con el ancho del contenedor `r4page` y las variables por modo (Layout, Typography, 1. Grid). Dentro se usan ejes semánticos (`size`, `columns`, `density`).
- **Tablet: nunca se diseña.** Solo hay las guidelines responsive (breakpoints, paddings; Confluence "Páginas de Procesos" y R4Wrapper) y las variables de Typography por modo. Adapta tablet tú, **de forma consistente** con desktop y mobile (mismo contenido que desktop salvo que la doc diga otra cosa, tokens de modo Tablet, rejilla de 8 columnas) y no vuelvas a preguntar por ello.
- El comportamiento responsive se resuelve con **container queries** (ancho del contenedor, no del viewport).
- R4Stats (según Confluence, 21 sept 2026; sustituye a la receta anterior con `columns`, que se descartó): R4Stats lleva `orientation` horizontal|vertical y un slot de 2 a 4 `statItem`; las columnas emergen del ancho y del `minWidth` del item (large 280 · small 240): 1320 px → 4 por fila · 1024 → 3 · 768 → 2 · 390 → 1. El statItem tiene `style` plain|boxed (`hasCard` en código). Sin `mediaQuery`.
- R4Tabs (detalle en el documento importado al final): `fixed` mientras ninguna etiqueta necesite truncarse; si no, `scrollable`. Mobile con 2–3 tabs → `fixed`.

## Interactividad y accesibilidad

Detalle en el documento de interactividad importado al final.

- **Un solo elemento interactivo por componente.** Nunca superficie clicable y R4Link a la vez. Nunca `<a>` dentro de `<a>` (axe: `nested-interactive`).
- Cinco combinaciones válidas (`interactivity`): `cardStatic`, `plainStatic`, `cardClickable`, `cardLink`, `plainLink`. `plainClickable` no existe.
- `cardClickable`: el `<a>` envuelve el **título** y se estira con `::after`; la card es un `<div>`. Nunca envuelvas la card entera en un `<a>`.
- CTA visible + card clicable: `cardClickable` + chevron decorativo `aria-hidden="true"`.
- ~~Áreas táctiles de 44 px~~ — **regla en suspenso por decisión de Jon (2026-10-05): obviarla de momento.** Usa los tamaños de Figma/Confluence de cada componente.
- Respeta roles, orden de lectura y orden de foco definidos en los frames de accesibilidad de Figma de cada componente.

## Comandos

- Instalar / arrancar / build / test / Storybook: **[PENDIENTE: completar cuando se conozca el repo o paquete de IT]**

## Cuando haya duda

Para y pregunta antes de inventar. Es preferible una pregunta corta a un componente que luego IT tenga que rehacer.

## Documentos importados (se cargan en cada sesión)

Catálogo de componentes y estado Figma / Vue / AEM:

@docs/design-system/catalogo.md

Templates y componente Wrapper:

@docs/design-system/templates-y-wrapper.md

Ejes agnósticos al dispositivo (R4Stats):

@docs/design-system/r4stats-y-ejes-agnosticos.md

R4Tabs (eje `layout` y slot):

@docs/design-system/r4tabs-layout-y-slot.md

R4Feature (modelo de interactividad):

@docs/design-system/r4feature-interactividad.md

Fuentes de Confluence autorizadas (mapa de qué leer):

@docs/design-system/fuentes-confluence.md

Hallazgos de la lectura completa y contradicciones resueltas/pendientes:

@docs/design-system/lectura-confluence.md
