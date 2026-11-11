# Templates y componente Wrapper — modelo v2

> **Actualización 2026-11-11:** este documento es la propuesta original. La página de Confluence R4Wrapper **v1.2** (3767762951) manda en lo siguiente y lo sustituye:
> anatomía de dos niveles (R4Wrapper → Grid, sin Slot intermedio); prop `layout` (`12` · `8-4` · `6` · `4`, por defecto `12`) como API oficial; **no hay prop `isFirst`** (el primer Wrapper usa siempre `wrapper/paddingTopFirstWrapper`, token que sustituye al `spacing/page-start` de abajo);
> ancho máximo de la Grid 1176 (desde 1176) y 1368 (desde 1440). Las secciones 1 (escala de densidades: aún válida), 3, 4 y 5 siguen vigentes; la `isFirst` de la sección 2 y el «Slot» de las anatomías están obsoletos.

Estado: propuesta montada en Figma (Anatomy → página Templates). Pendiente de validar y de decidir su ubicación definitiva.

## 1. Escala de densidades del Wrapper

La documentación actual del Wrapper se contradice: la tabla de propiedades dice `relaxed` = 64/56/48, la tabla responsive dice 48/40/32. Lo que el componente tiene realmente construido es **48px** en desktop. Es decir, el valor intermedio ya existe con el nombre del extremo.

Escala propuesta:

| density | Desktop | Tablet | Mobile |
|---|---|---|---|
| `none` | 0 | 0 | 0 |
| `compact` | 32 | 28 | 24 |
| `default` | 48 | 40 | 32 |
| `relaxed` | 64 | 56 | 48 |

**Migración:** no añadir `default` como valor nuevo. Renombrar en Figma `relaxed` → `default` (las instancias siguen el rename) y crear después un `relaxed` nuevo de 64px. Añadir `default` sin renombrar inflaría todas las páginas existentes al redefinir `relaxed`.

`none` es necesario para bandas a sangre y componentes con espaciado propio.

El gap de la grid está atado a la density, así que un nivel nuevo implica también su gap.

## 2. Regla de apertura de página

> El padding superior del primer Wrapper de `Main` es constante en todas las templates. No lo marca la `density`, lo marca el sistema.

Razón: `density` responde a "qué ritmo tiene esta página entre secciones"; la apertura responde a "dónde empieza el contenido bajo la cabecera", que es una constante de producto. El Header es una barra fina sin masa visual, así que la distancia hasta el primer contenido se lee como el arranque de la página.

- Token propio `spacing/page-start` = 48 / 40 / 32. Hoy coincide con `default` pero no debe aliasarse a él: son conceptos distintos.
- En la API del Wrapper: booleano `isFirst`. Cuando es `true` el padding superior usa `spacing/page-start` e ignora la `density`. Se prefiere al desdoble `paddingTop`/`paddingBottom` porque codifica la regla en la API en vez de dejarla en la documentación.
- El cierre (último Wrapper → Footer) sigue la `density`. El footer tiene fondo y padding propios, así que resuelve visualmente la transición; la cabecera no.

Invariante derivada: los componentes que van dentro del Wrapper (R4PageTitleProduct / Section / Process, R4Hero, bloques de Específicos) **no llevan padding vertical propio**.

## 3. Superficie de página y bandas de color

La Template es la dueña del color de fondo, pero no debe escribir el primitivo.

- La template declara un contexto y ese contexto resuelve `surface/page`.

| | `app` | `marketing` |
|---|---|---|
| `surface/page` | gray-100 | white |

- Lienzo gris = lenguaje de contención: la jerarquía la crean superficies blancas que flotan encima. El Wrapper es `none` por defecto y `white` cuando hace de hoja.
- Lienzo blanco = lenguaje editorial: la jerarquía la crean el ritmo vertical y las bandas de color a ancho completo.

**Invariante A:** ningún Wrapper puede llevar un `backgroundColor` igual al `surface/page` de su template. De ahí se deriva qué fondos son legales en cada contexto:

- Sobre gris: `none`, `white`, `brandPrimary`, `brandSecondary`.
- Sobre blanco: `none`, `grey`, `brandPrimary`, `brandSecondary`.

**Invariante B:** la banda de color la pone **siempre el Wrapper**, nunca el componente de bloque. Varios bloques de Específicos traen su propia prop `background` (R4HighlightMedia: `none | grey | primary`), que pinta solo dentro del ancho de contenido y no llega a sangre. Con la banda en el Wrapper el color va de borde a borde, que es el patrón correcto. En las templates esos bloques van con `background=none`.

> Punto a revisar en el sistema: esa prop `background` de los bloques duplica una responsabilidad que ya es del Wrapper. Valorar deprecarla.

## 4. Templates montadas

Archivo Anatomy → página Templates. Ancho **desktop 1512** (el ancho natural de la variante desktop del Wrapper). Anatomía fija:

```
COMPONENT
├── Header                 frame
│    ├── Browser           frame + instancia Browser
│    └── Menu              instancia del componente Menu
├── Main                   nodo SLOT nativo, propiedad de componente, solo admite Wrapper
│    └── Wrapper…
└── Footer                 instancia real de _Footer Default (Size=DesktopXL)
```

**Process no lleva Footer**: termina en `Main`.

| Template | Superficie | Menu | Footer | Contenido de los Wrappers |
|---|---|---|---|---|
| TemplateProcess | gris | Type=Process, Logado | — | R4PageTitleProcess + R4InputText + R4Button, a 6/12 columnas centradas, ritmo interno 48px |
| TemplateLanding | blanca | Type=Default, Sin logar | sí | R4Hero · R4HighlightMedia (banda gris en el Wrapper) · R4HighlightGrid · R4FAQ, un bloque por Wrapper a 12 columnas |
| TemplateDetail | gris | Type=Default, Logado | sí | W1 R4PageTitleProduct (12) · W2 R4Tabs (12) + CardContainer (8) + CardContainer (4) |
| TemplatePost | gris | Type=Default, Logado | sí | Contenido 8 col (R4PageTitleSection + R4Text) + gap 1 col + anclajes 3 col |
| TemplateStates | gris | Type=Default, Logado | sí | R4Result a 4/12 columnas centradas |

El slot `Main` tiene `preferredValues` apuntando al component set Wrapper, así que al insertar se sugiere el Wrapper.

Verificado: una instancia de la template acepta Wrappers adicionales dentro de `Main` sin desacoplar.

### Regla: Hero y PageTitle son excluyentes

Si la página lleva **R4Hero**, no puede llevar ningún **R4PageTitle**: el Hero hace de título de página. Los títulos de sección de esa página usan **R4Title**.

Relacionado: el breadcrumb que incorpora R4PageTitle solo se muestra en páginas de nivel 2 hacia abajo. Ver [R4Breadcrumb · Casos de uso](https://renta4.atlassian.net/wiki/spaces/DIS/pages/3634266177/R4Breadcrumb#Casos-de-uso).

### Composición de una landing

Un Wrapper = un bloque. Los bloques salen de Específicos: R4Hero, R4HighlightMedia, R4HighlightGrid, R4FAQ, R4CardProduct, R4ChartColumn. El ritmo lo marca la density del Wrapper y el color, su `backgroundColor`.

### Nota técnica: posicionamiento en la grid

La API de Figma no deja anclar hijos por columna mientras el grid tenga posicionamiento automático (`gridColumnAnchorIndex` es read-only y `setGridChildPosition` se rechaza). Para el contenido que no arranca en la columna 1 se usan frames vacíos sin relleno como offset: `Offset · 3 col` en Process, `Offset · 4 col` en States, `Gap · 1 col` en Post.

Además, al añadir contenido que ocupa más de una fila hay que subir `gridRowCount` a mano; si no, el grid se queda a una fila y recorta lo que sobra.

## 5. Invariantes para un agente

- Todo contenido vive dentro de un Wrapper. Nada suelto en `Main`.
- Un Wrapper = un bloque, salvo layouts de columnas explícitos (Post, Process).
- El primer Wrapper abre con `spacing/page-start`.
- Una sola density por página (excluyendo el primero).
- Nunca dos Wrappers consecutivos con el mismo `backgroundColor` distinto de `none`.
- Ningún Wrapper con el `backgroundColor` igual al `surface/page` de la template.
- La banda de color la pone el Wrapper; los bloques van con `background=none`.
- Si hay R4Hero, no hay R4PageTitle: los títulos de sección son R4Title.
- El ancho de contenido lo fija la template, no el diseñador.

## 6. Pendiente

- **Dos generaciones de templates vivas.** El archivo `R4 Design System | Templates | 1.0` tiene 11 templates de la generación anterior (`Desktop XL / Full width`, `Desktop / Main with side`, `Tablet / Process`…). No usan Wrapper, no tienen propiedades ni slots, y su instrucción de uso es desacoplarlas. Hay que decidir si la v2 las sustituye y deprecarlas.
- Aplicar la escala de densidades y el token `spacing/page-start` en Primitivos.
- Valorar deprecar la prop `background` de los bloques de Específicos (solapa con el Wrapper).
- Post: 8 columnas de contenido son ~870px de línea (~110 caracteres). Bajar a 6–7 columnas o capar la medida del párrafo.
- Templates que faltan: Dashboard/Overview, Listado/Resultados, Auth, Índice de artículos. Feedback de proceso como variante de Process.
- Variantes tablet y mobile de cada template.
