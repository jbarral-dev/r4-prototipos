# Catálogo de componentes R4 — estado Figma / Vue / AEM

> **Fuente de este catálogo:** CSV exportado de la base de datos "Lista de componentes" de Confluence (DIS, página
> `3145597151`), **actualizado el 2026-10-29** (76 componentes). Sustituye al dashboard "Estado Junio 2026".
> **Es una foto, no la verdad en vivo.** Si algo no cuadra con Figma o con la librería Vue, avisa a Jon; no lo resuelvas en silencio.
> Para refrescarlo: Jon exporta de nuevo el CSV de la database y se regenera este archivo.

**Resumen:** 76 componentes · 59 con Vue (51 VUE + 8 VUE+AEM) · 0 EN PROGRESO · 7 SIN VUE · 10 solo AEM (4 de ellos sin Figma).

> Versión del CSV usada: "Lista de componentes (8)", ya con las correcciones de Jon (R4Jumbo y R4Popover hechos en Vue; enlaces de Figma y Storybook de R4HighlightMedia, R4ProgressBar y R4Sheet arreglados; R4HeroHome en WIP).

## Cómo leer este catálogo

El estado sale de las columnas del CSV: **Vue** (Hecho / WIP / No) y **AEM** (Sí / No).

| Estado | Criterio (CSV) | Qué haces |
|---|---|---|
| **VUE** | Vue = Hecho, AEM = No | Impórtalo y úsalo. **Nunca lo reconstruyas** (salvo la fase actual sin repo de IT: ver `CLAUDE.md`) |
| **VUE+AEM** | Vue = Hecho, AEM = Sí | Igual que VUE |
| **EN PROGRESO** | Vue = WIP | Trátalo como "sin Vue" (ver flujo en `CLAUDE.md`) |
| **SIN VUE** | Vue = No, AEM = No | Diseñado en Figma, sin desarrollo: flujo "Figma sin Vue" de `CLAUDE.md` |
| **AEM** | Vue = No, AEM = Sí | Solo web pública (empresa externa). No hay Vue. Para y avisa |
| **SIN FIGMA** | Diseño = No y sin enlace Figma | Para y avisa. No hay fuente de verdad visual |

- **Tipo:** Simple · Compuesto · Específico (clasificación de la database).
- **Diseño:** Hecho · WIP · No (estado del diseño en Figma según la database).
- **Figma:** nodo en `P` = Primitivos 1.2 (`LXKe53jePjDEAVhdYCU4ed`) o `E` = Específicos 1.0 (`J199oWCLWyL9mly6xNdUcR`). `—` = sin enlace.
- **Doc:** título de la página de Confluence (espacio DIS). `falta` = sin página. `desact.` = la database marca "Documentación desactualizada". `(OLD)` = la database enlaza una página con ese sufijo.
- **SB:** ✔ = tiene página en Storybook (https://storybook-dev.renta4.es/). Las URLs concretas están en el CSV de la database.
- Si la doc de Confluence está desactualizada o falta, **manda Figma**.
- **Notas:** comentarios de la database y, con ⚠️, cambios del Changelog (solo se pidieron; no implica que estén en Vue).

---

## 1. Existen en Vue (59)

| Componente | Tipo | Diseño | Estado | Doc | SB | Figma | Notas |
|---|---|---|---|---|---|---|---|
| R4Accordion | Compuesto | Hecho | VUE | R4Accordion | ✔ | P `11594:4354` | |
| R4AccountSwitch | Específico | Hecho | VUE | R4AccountSwitch | ✔ | E `83:5783` | |
| R4Article | Compuesto | Hecho | VUE | R4Article | ✔ | P `15718:128` | El Changelog lo llama R4CardArticle (SM-18984): mismo componente |
| R4Avatar | Simple | Hecho | VUE | R4Avatar | ✔ | P `14502:139` | |
| R4Banner | Compuesto | Hecho | VUE+AEM | Banner (OLD) · desact. | ✔ | P `6441:3600` | Documentación desactualizada |
| R4Breadcrumb | Compuesto | Hecho | VUE | R4Breadcrumb | ✔ | P `14244:3125` | ⚠️ Se eliminó `HomeLabel`. Solo se muestra en páginas de nivel 2+ |
| R4Button | Simple | Hecho | VUE | R4Button | ✔ | P `376:26847` | |
| R4BuyButton | Específico | Hecho | VUE | R4BuyButton | ✔ | E `11:40` | |
| R4CardAccount | Específico | Hecho | VUE | R4CardAccount | ✔ | E `5162:145` | ¿Cambiar a AccountSelector, para que pueda ir con y sin card? Pendiente: border |
| R4CardAdvisor | Específico | Hecho | VUE | R4CardAdvisor | ✔ | E `5147:2041` | |
| R4CardImage | Compuesto | Hecho | VUE | R4CardImage | ✔ | P `15157:716` | |
| R4CardProduct | Específico | Hecho | VUE+AEM | R4CardProduct | ✔ | E `544:589` | |
| R4CardProductSelection | Compuesto | Hecho | VUE | R4CardProductSelection | ✔ | P `18080:5543` | |
| R4Carousel | Compuesto | Hecho | VUE+AEM | R4Carousel | ✔ | P `15606:1302` | |
| R4Chip | Compuesto | Hecho | VUE | R4Chip | ✔ | P `12719:162` | |
| R4FAQ | Específico | Hecho | VUE+AEM | R4FAQ | ✔ | E `2126:4671` | |
| R4Feature | Compuesto | WIP | VUE | R4Feature | ✔ | P `16394:2134` | Antiguo R4CardIcon. Diseño en WIP. Ver `r4feature-interactividad.md`. Changelog SM-23564 |
| R4Hero | Específico | Hecho | VUE+AEM | R4Hero | ✔ | E `2168:4073` | Excluyente con R4PageTitle* |
| R4Icon | Simple | Hecho | VUE | R4Icon | ✔ | P `16399:2937` | |
| R4InputAmount | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4InputCheckbox | Compuesto | Hecho | VUE | R4InputCheckbox | ✔ | P `26128:2792` | |
| R4InputDate | Compuesto | Hecho | VUE | Input DatePicker · desact. | ✔ | P `6023:2393` | Documentación desactualizada |
| R4InputEmail | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4InputIban | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4InputNIF | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4InputNumber | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4InputOTP | Compuesto | Hecho | VUE | R4InputOTP | ✔ | P `6592:1817` | |
| R4InputPassword | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4InputPhone | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4InputRadio | Compuesto | Hecho | VUE | R4InputRadio | ✔ | P `26128:4017` | |
| R4InputSearch | Compuesto | Hecho | VUE | R4InputSearch | ✔ | P `12757:4372` | |
| R4InputSelect | Compuesto | Hecho | VUE | R4InputSelect · desact. | ✔ | P `6046:24572` | Documentación desactualizada |
| R4InputSwitch | Compuesto | Hecho | VUE | R4InputSwitch | ✔ | P `26148:6666` | |
| R4InputText | Compuesto | Hecho | VUE | Input Text · desact. | ✔ | P `6023:2393` | Documentación desactualizada |
| R4InputTextarea | Compuesto | Hecho | VUE | R4InputTextarea · desact. | ✔ | P `6063:14983` | Documentación desactualizada |
| R4InputUser | Compuesto | Hecho | VUE | falta | ✔ | P `6023:2393` | Falta documentación |
| R4Jumbo | Compuesto | Hecho | VUE | R4Jumbo | ✔ | P `16269:2269` | Sustituye a BannerSimple de AEM; recoge la variante `backgroundImage` de R4HighlightMedia (Changelog SM-24142) |
| R4Link | Simple | Hecho | VUE | R4Link (OLD) | ✔ | P `4089:81270` | La database enlaza la página `R4Link_OLD` |
| R4ListDetail | Compuesto | Hecho | VUE | R4ListDetail | ✔ | P `12792:151881` | |
| R4ListIcon | Compuesto | Hecho | VUE | R4ListIcon | ✔ | P `12637:1496` | |
| R4Modal | Compuesto | Hecho | VUE | R4Modal | ✔ | P `9871:2378` | Contiene Dialog |
| R4NavigationItems | Compuesto | Hecho | VUE | R4NavigationItems | ✔ | P `20834:9392` | Antiguo R4CardLink |
| R4Notification | Compuesto | Hecho | VUE | R4Notification | ✔ | P `1648:44617` | |
| R4PageTitleAccount | Específico | Hecho | VUE | R4PageTitleAccount | ✔ | E `5155:385` | |
| R4PageTitleSection | Específico | Hecho | VUE+AEM | R4PageTitleSection | ✔ | E `1444:1056` | Excluyente con R4Hero |
| R4Popover | Simple | Hecho | VUE | R4Popover | ✔ | P `23283:113` | Nuevo respecto al dashboard de junio |
| R4ProgressBar | Compuesto | Hecho | VUE | R4ProgressBar | ✔ | E `1134:1091` | La página lo describe como cabecera de proceso completa (ver `lectura-confluence.md`, punto 17) |
| R4Result | Compuesto | Hecho | VUE | R4Result · desact. | ✔ | P `423:364` | Evolución a R4Feedback. Documentación desactualizada |
| R4RiskBox | Específico | Hecho | VUE+AEM | R4RiskBox | ✔ | E `3847:1419` | |
| R4Section | Compuesto | Hecho | VUE | R4Section | ✔ | P `14424:530` | ⚠️ Changelog SM-24225: nueva prop `backgroundColor`; `style` pasa a controlar solo la estructura. Renombre de `style` a `variant` solo era candidato: **leer el código** |
| R4SegmentedControls | Compuesto | Hecho | VUE | R4SegmentedControls | ✔ | P `11838:59196` | |
| R4Sheet | Compuesto | Hecho | VUE | R4Sheet | ✔ | P `14424:530` | |
| R4Splash | Específico | Hecho | VUE | R4Splash · desact. | ✔ | E `56:4892` | Documentación desactualizada. Es un R4Modal con imagen: habría que fusionarlos |
| R4Steps | Compuesto | Hecho | VUE | R4Steps | ✔ | P `20981:200` | ⚠️ Changelog SM-24485: versión `medium` más compacta (indicador 40→32 px, gap 16→12, padding-top de textos 8→4) y nueva prop `showTitle` |
| R4Table | Compuesto | Hecho | VUE+AEM | R4Table | ✔ | P `6321:2` | La database aún marca "Falta documentación", pero hay página (con dos APIs: ver `lectura-confluence.md`). Nodo Figma truncado en el CSV |
| R4Tabs | Compuesto | Hecho | VUE | R4Tabs | ✔ | P `12959:4762` | El CSV (8) cambió el nodo; antes `13591:3199` (el de `r4tabs-layout-y-slot.md`): comprobar cuál es el vigente. ⚠️ Eje `layout` (`scrollable`/`fixed`); `Show Item1…8` sustituidos por **slot** (cambio rompedor). Ver `r4tabs-layout-y-slot.md` |
| R4Tag | Simple | Hecho | VUE | R4Tag | ✔ | P `412:13524` | |
| R4Text | Simple | Hecho | VUE | R4Text | ✔ | P `4089:77298` | |
| R4Title | Simple | Hecho | VUE | R4Title | ✔ | P `6191:40114` | API (Confluence 2798944260, leído 2026-10-05): `text`, `level` (1-6, obligatorio), `size` (extraLarge2\|extraLarge\|large\|medium\|small), `align` (left\|center), `tag`. Sin `type`: Subtitle y Pretitle son estilos tipográficos |

## 2. Solo AEM — no hay Vue (10)

Fuera del paraguas Vue. **No los uses ni los recrees sin que Jon lo pida.**

| Componente | Tipo | Diseño | Estado | Doc | Figma | Notas |
|---|---|---|---|---|---|---|
| R4ChartColumn | Específico | Hecho | AEM | R4ChartColumn | E `5484:113` | |
| R4ChartTimeseries | Específico | No | AEM · SIN FIGMA | ChartTimeseries | — | No está en Figma |
| R4Documents | Específico | Hecho | AEM | R4Documents | E `5810:677` | |
| R4FormLead | Específico | No | AEM · SIN FIGMA | falta | — | No está en Figma |
| R4Grid | Específico | No | AEM · SIN FIGMA | Grid (específico) | — | No es la grid de la página. JB propone unificarlo con R4HighlightGrid |
| R4HeroHome | Específico | WIP | AEM | R4HeroHome | E `2071:2223` | Diseño en WIP |
| R4HighlightGrid | Específico | WIP | AEM | R4HighlightGrid | E `2126:2882` | Hay que refactorizar y añadirle un layout vertical |
| R4HighlightMedia | Específico | Hecho | AEM | R4HighlightMedia | E `4048:9407` | Prop `background` pendiente de deprecar (la banda de color la pone el Wrapper) |
| R4PageTitleProduct | Específico | Hecho | AEM | R4PageTitleProduct | E `8158:3676` | Excluyente con R4Hero |
| R4Strip | Compuesto | No | AEM · SIN FIGMA | falta | — | "Cintillo". No está en Figma |

## 3. Sin desarrollo Vue (7)

Existen en Figma. No hay Vue utilizable.

| Componente | Tipo | Diseño | Estado | Doc | Figma | Notas |
|---|---|---|---|---|---|---|
| R4Badge | Simple | Hecho | SIN VUE | R4Badge | P `12646:3668` | |
| R4ButtonDock | Compuesto | Hecho | SIN VUE | falta | — | ¿Cambiar el nombre a Dock? Duda abierta: ¿componente o patrón de layout? |
| R4PageTitleProcess | Específico | Hecho | SIN VUE | R4PageTitleProcess | E `1572:63` | |
| R4Skeleton | Simple | Hecho | SIN VUE | R4Skeleton | P `26305:7381` | |
| R4Spinner | Simple | Hecho | SIN VUE | R4Spinner | P `16359:6669` | |
| R4Stats | Compuesto | Hecho | SIN VUE | R4Stats | P `25682:69` | Diseñado, no publicado. Ver `r4stats-y-ejes-agnosticos.md` (parcialmente obsoleto) y `CLAUDE.md`. El nodo del CSV (`25682:69`) difiere del que se manejaba (`27472:816`): comprobar |
| R4Tooltip | Simple | WIP | SIN VUE | R4Tooltip | P `12962:1983` | Falta documentación y completar el diseño |

## 4. No incluidos en la database

No aparecen en el CSV pero se usan en documentos o en Figma. **Estado Vue desconocido: confirmar con IT / Jon antes de asumir nada.**

| Componente | Figma | Notas |
|---|---|---|
| R4StatItem | P `25682:70` | Hijo de R4Stats (ya no es fila propia de la database). Diseñado, no publicado |
| R4Subtitle / R4Pretitle | — | **No son componentes**: estilos tipográficos de Figma (Jon, 2026-10-05) |
| R4Shortcuts | ? | Aparece en el Changelog (SM-18982) y tiene página en Confluence |
| R4CardIcon | ? | Nombre antiguo: lo sustituye R4Feature |
| R4HeroMini | — | Estaba en el dashboard de junio (AEM, SIN FIGMA, candidato a eliminar); **ya no aparece**: se da por retirado, confirmar |
| Wrapper (R4Wrapper) | ? | Changelog SM-23967: creación de nuevo componente. Ver `templates-y-wrapper.md` |
| Templates v2 | ? | Propuesta pendiente de validar. Ver `templates-y-wrapper.md` |
| _TabItem | P `13416:5227` | Privado. Hijo de R4Tabs |
| _FeatureLeading | P `26945:225` | Privado. Hijo de R4Feature |
| CardContainer | ? | Superficie de card con estados. La usan R4Feature y R4StatItem |
| Menu | ? | Archivo Figma "Templates 1.0" (antiguo, de uso vigente). En proceso: `Type=Process`, incluye R4ProgressBar. Se reconstruye en `pendientes/` |
| Footer (`_Footer Default`) | ? | Archivo Figma "Templates 1.0" (antiguo, vigente). Las páginas de proceso no lo llevan |
| R4ChartLine · R4RichText · HeaderProduct | ? | Tienen página en Confluence (Específicos) pero no están en la database |

---

## Cambios respecto al catálogo anterior (dashboard de junio)

- **Pasan a VUE:** R4Icon, R4NavigationItems, R4Steps, R4CardProductSelection (antes EN PROGRESO); R4InputSearch (antes SIN VUE); R4Feature (antes SIN VUE).
- **Pasan a VUE+AEM:** R4Hero, R4FAQ, R4Carousel, R4PageTitleSection, R4RiskBox, R4Table (antes AEM); R4CardProduct (antes SIN VUE).
- **Pasa de EN PROGRESO a SIN VUE:** R4Tooltip.
- **Nuevos en la lista:** R4Jumbo y R4Popover (ambos VUE, según Jon).
- **Salen de la lista:** R4HeroMini, R4StatItem (queda como hijo de R4Stats).
- **Sin cambios de estado:** el resto.

## Incidencias del CSV a revisar con Jon

1. **Enlaces de Figma repetidos:** R4InputAmount, Date, Email, Iban, NIF, Number, Password, Phone, Text y User apuntan todos a `6023:2393`; R4Section y R4Sheet a `14424:530`.
2. **Storybook:** R4InputRadio cuelga de `atomos-inputs`; R4CardAccount (Específico) está en la rama de primitivos.
3. **R4Table:** nodo Figma truncado (`6321:2`); la database sigue diciendo "Falta documentación" aunque hay página.
4. **R4Tabs:** nodo nuevo `12959:4762` frente a `13591:3199` (anterior).
5. **R4Stats:** nodo `25682:69` frente a `27472:816` (anterior).

## Fuente complementaria: Changelog

`Changelog cambios` (Confluence, DIS, página `3832610825`) registra los cambios pedidos por tickets de Jira Service
Management, con su tipo (`NUEVO`, `EVOLUTIVO`, `CANCELADO`), el enlace al ticket y, cuando existe, al de AEM. **No indica si un cambio ya está en la librería Vue**,
solo que se solicitó. Úsalo para saber qué ha cambiado en un componente, no para deducir su estado de desarrollo.

## Pendiente de completar

1. **Import** (ruta/paquete en la librería Vue de IT) y **mapeo de props Figma → Vue**: cuando haya acceso al repo de IT.
2. **Estado real de Vue**: la database dice "Hecho", pero sin acceso al repo no se puede comprobar. Confirmar con IT.
