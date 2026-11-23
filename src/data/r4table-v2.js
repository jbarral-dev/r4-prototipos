// DATOS DE EJEMPLO (prototipo «R4Table (v2)»). En producción vendrían de backend.
// Contenido de la tabla «Bolsa Nacional · Mercado continuo» de r4.com, transcrito del pantallazo que aportó Jon (2026-11-19; cotizaciones del 19/1/2026 18:14:58, horario peninsular). El pantallazo es de baja resolución:
// algún dígito puede no coincidir con el original (el Dif.% se recalcula a partir de Último y Dif.). Logos: Figma «Resources - Logos» (YGLS4oEvLsYd8H13Kfylx5, «BME Isos»); las empresas sin logo allí dejan el hueco vacío.
// INVENTADO: la pertenencia a índices distintos del IBEX 35 (solo unas pocas del Euro Stoxx 50), y todos los datos de la «Vista adicional» (máx./mín. 52 semanas, capitalización, PER y rentabilidad YTD; el pantallazo solo trae la vista básica).
const logo = (f) => new URL('../assets/logos/' + f, import.meta.url).href
const LOGOS = new Set('a3m acs acx adx aena alm alnt ams ana ane art azk bbva bkt cabk caf cbav cie cirsa clnx col coxg dia dom ebro edr ele enc eng eno fae fcc fdr fer gest gre grf gsj hbx home iag ibe idr itx lda log map mcm mdf mel mrl mvc mts ntgy nxt ohla ory phm psg puig r4 red rep rovi sab san scyr slr tef tlgo tre tub uni vid vis voc amp cev'.split(' '))

const BRUTO = `ACCIONA|ANA|191,5|-5,8|9|190,6|200|9|96.186|18:00:00
ACERINOX|ACX|15,2|0,07|66|15,14|15,6|320|924.607|18:00:00
ACS CONST.|ACS|86,7|-1,5|500|86,65|88,9|30|281.785|18:00:00
A. DOMINGUEZ|ADZ|6,25|-0,4|81|6,15|6,5|1.558|9.052|18:00:00
AEDAS HOMES|AEDAS|23,8|0|1.607|23,8|23,9|9.334|868|18:00:00
AENA|AENA|27,7|-0,52|500|27,5|27,6|1.375|1.192.030|18:00:00
AIRBUS|AIR|208,3|2,6|30|196,8|210|300|971|18:00:00
AIRTIFICIAL|AI|0,0817|0,0024|18.600|0,0783|0,082|142.000|1.107.147|18:00:00
ALANTRA|ALNT|8,75|-0,06|350|8,64|8,9|779|6.034|18:00:00
ALMIRALL|ALM|10,22|-0,1|750|10,18|10,36|300|112.479|18:00:00
AMADEUS IT|AMS|60,64|-0,48|165|60,24|63|318|518.429|18:00:00
AMPER|AMP|4,44|-0,025|5|4,425|4,5|1.158|262.071|18:00:00
AMREST HOLDI|EAT|2,085|0,005|364|2,02|2,085|894|8.536|18:00:00
APERAM|APAM|33,4|0,6|642|32,4|34,16|100|2.352|18:00:00
ARCEL.MITTAL|MTS|54,74|-0,26|46|54,5|55,1|1.158|102.496|18:00:00
ARIMA|ARM|13,4|0,2|100|12,5|13,6|88|1.254|18:00:00
ARTECHE|ART|28,2|1|1|27,4|29,3|1.168|38.057|18:00:00
ATRESMEDIA|A3M|6,03|-0,09|150|6,02|6,12|20.000|882.696|18:00:00
ATRYS|ATRY|2,55|-0,065|1.700|2,53|2,66|5.000|73.168|18:00:00
AUDAX RENOV|ADX|1,07|0,006|674|1,052|1,1|17.739|195.034|18:00:00
AZKOYEN|AZK|10,5|0,2|4.895|10,3|10,6|11.000|15.995|18:00:00
BBVA|BBVA|22,59|-0,18|3.200|22,55|23,01|2.100|7.201.357|18:00:00
B. SABADELL|SAB|3,681|-0,026|13.200|3,63|3,685|5.000|9.991.546|18:00:00
SANTANDER|SAN|10,558|-0,082|16.560|10,58|10,6|3.821|18.783.452|18:00:00
BANKINTER|BKT|14,135|-0,15|168|14,05|14,41|672|1.194.308|18:00:00
BERKELEY ENE|BKY|0,47|0,003|12.300|0,4685|0,475|65.237|1.533.652|18:00:00
B.RIOJANAS|RIO|0,805|-0,015|314|0,805|0,82|15.525|2.162|18:00:00
CAIXABANK|CABK|11,706|-0,015|673|11,7|11,87|248|3.877.933|18:00:00
CELLNEX|CLNX|25,09|-0,31|198|25,04|25,41|258|1.010.033|18:00:00
CEVASA|CEV|8,85|0|327|8,5|9,1|100|0|18:00:00
CIE AUTOMOT.|CIE|26|0|240|25,8|26,2|1.000|26.400|18:00:00
CIRSA|CIRSA|18,66|-0,26|500|18,88|18,96|120|47.068|18:00:00
CLIN BAVIERA|CBAV|56|-0,4|300|51,6|57|120|2.473|18:00:00
LOGISTA|LOG|36,4|-0,5|62|36,3|37,04|1.200|118.028|18:00:00
CCEP|CCEP|106,8|0|50|101|108,8|25|447|18:00:00
CLEOP|CLEO|1,15|0|-|-|-|-|0|17:35:11
AUXIL. FF.CC|CAF|64,7|-0,6|7|63,4|66,2|50|20.272|18:00:00
ACCIONA ENER|ANE|19,37|-0,05|160|19,28|20|100|590.430|18:00:00
COX GROUP|COXG|10,85|0|3.574|10,8|11,15|399|1.529|18:00:00
CAJA A.MEDIT|CAM|1,54|0|-|-|-|-|0|17:35:11
DESLEO|OLE|0,281|-0,007|3.619|0,28|0,284|4.996|1.091.461|18:00:00
D.E. ANCLAJE|DESA|21,6|0|1.199|20|22|3|100|18:00:00
DIA|DIA|47,7|0,5|501|46,6|47,95|80|18.392|18:00:00
D. FELGUERA|MDF|0,2045|0,004|96.381|0,2|0,205|50.000|19.456|18:00:00
EBRO FOODS|EBRO|17,74|-0,18|254|17,7|18,14|400|47.093|18:00:00
EDREAMS ODIG|EDR|4,805|0,085|2.000|4,65|4,84|658|601.322|18:00:00
ELECNOR|ENO|31,05|-0,7|10|30,8|31,95|237|70.457|18:00:00
ENAGAS|ENG|17,53|-0,19|1.410|17,53|17,7|1.108|507.536|18:00:00
ENCE|ENC|2,194|-0,048|250|2,19|2,232|6.500|276.845|18:00:00
ENDESA|ELE|43,06|-0,21|822|42,5|43,27|69|544.992|18:00:00
FAES|FAE|4,88|-0,105|300|4,84|5,02|2.223|146.464|18:00:00
FCC|FCC|10,56|0,04|1.000|10,52|10,72|126|4.088|18:00:00
FERROVIAL N.|FER|54,14|-1,14|92|54,1|55,8|31|880.072|18:00:00
FLUIDRA|FDR|18,42|-0,37|500|18,4|18,97|208|317.659|18:00:00
GRAL.ALQ.MAQ|GAM|1,36|0|3.350|1,36|1,365|2.341|0|18:00:00
GESTAMP|GEST|2,9|0,045|3.000|2,8|2,9|2.006|755.297|18:00:00
GL. DOMINION|DOM|2,625|0,04|5.054|2,605|2,69|3.000|281.441|18:00:00
GRENERGY|GRE|55|-5,7|20|54,5|57,2|37|472.758|18:00:00
GRIFOLS|GRF|11,06|-0,35|907|11,03|11,4|495|1.860.989|18:00:00
GRIFOLS B|GRF.P|7,57|-0,25|1.111|7,01|7,95|358|90.167|18:00:00
ECOENER|ENER|3,2|-0,03|175|3,2|3,32|2.612|4.622|18:00:00
G.E.SAN JOSE|GSJ|6,94|-0,16|2.500|6,9|7,12|1.000|47.081|18:00:00
EZENTIS|EZE|0,0559|-0,0021|23.110|0,0557|0,0579|27.106|3.708.559|18:00:00
HBX GROUP|HBX|8,015|-0,15|2.593|7,95|8,21|7.688|201.688|18:00:00
IBERDROLA|IBE|22,59|-0,17|130|22,5|22,7|100|5.611.000|18:00:00
IBERPAPEL|IBG|16,6|-0,4|154|16,3|17,5|208|5.471|18:00:00
INDRA A|IDR|51,4|-0,34|150|51,32|52,5|101|688.086|18:00:00
INDITEX|ITX|58,44|-0,92|255|58,16|59,8|258|1.773.025|18:00:00
COLONIAL SFL|COL|4,912|-0,118|2.400|4,91|5,015|18|1.213.905|18:00:00
INM. DEL SUR|ISUR|16,85|0|37|16,7|16,9|217|354|18:00:00
INMOCEMENTO|IMC|3,62|-0,03|150|3,62|3,74|500|5.239|18:00:00
INM. SOLUTIO|ISE|0,505|0|-|-|-|-|0|17:35:11
INT.AIR L.GRP|IAG|5,356|-0,006|190|5,32|5,39|1.000|3.565.520|18:00:00
IZERTIS|IZER|7,1|-0,02|400|6,96|7,12|1.000|16.368|18:00:00
REIG JOFRE|RJF|2,62|0,01|884|2,56|2,64|265|21.611|18:00:00
LABORAT.ROVI|ROVI|66,1|-1,5|100|65,1|69|68|95.354|18:00:00
LIBERTAS 7|LIB|3,04|0,06|1.500|2,94|3,05|2.000|669|18:00:00
LINEA DIRECT|LDA|1,236|-0,018|1.689|1,236|1,264|88.000|310.978|18:00:00
LINGOTES ESP|LGT|5,16|-0,12|300|5,12|5,32|600|2.901|18:00:00
MAPFRE|MAP|4,106|-0,058|6.472|4,1|4,1|1.628|1.657.898|18:00:00
MEDIAFOREURO|MFEA|1,96|-0,09|1.000|1,915|1,998|475|79.733|18:00:00
MELIA HOTELS|MEL|11,27|-0,14|580|10,93|11,44|248|163.105|18:00:00
MERLIN PROP.|MRL|11,34|-0,09|16.574|11,3|11,68|2.000|1.085.926|18:00:00
METROVACESA|MVC|11,5|-0,08|450|11,4|11,62|75|182.457|18:00:00
MIQUEL COST.|MCM|9,9|-0,1|1.000|9,9|10,1|221|17.513|18:00:00
MONTEBALITO|MTB|2|0|600|1,93|2,06|9.076|0|18:00:00
NATURGY|NTGY|30|-0,36|153|29,98|30,22|117|825.222|18:00:00
NATURHOUSE|NTH|2,12|-0,01|3.730|2,1|2,22|1.500|46.530|18:00:00
NEINOR H.|HOME|18,84|-0,3|100|18,45|18,85|62.000|402.951|18:00:00
CORREA|NEA|10,1|-0,05|250|9,9|10,6|644|3.508|18:00:00
NEXTIL|NXT|0,881|-0,017|7.200|0,88|0,885|10.000|396.183|18:00:00
NYESA VALORE|NYE|0,0028|0|61.258.000|0,0027|0,0027|16.605.700|11.771.458|18:00:00
OHLA|OHLA|0,349|-0,0136|118.038|0,346|0,352|3.000|6.891.087|18:00:00
ORYZON GENOM|ORY|2,474|0,15|450|2,35|2,484|5.400|973.682|18:00:00
PESCANOVA|PVA|0,225|0,005|6.600|0,218|0,229|47.308|132.164|18:00:00
PHARMA MAR|PHM|58,2|-2,85|525|58|61|100|89.286|18:00:00
PRIM|PRM|12,25|-0,05|805|12,25|12,55|1.628|684|18:00:00
PRISA|PRS|2,12|0,05|296|2,08|2,235|1.297|3.664|18:00:00
PROSEGUR|PSG|3,085|-0,015|4.007|3,05|3,15|9.858|79.201|18:00:00
PROSEG. CASH|CASH|0,671|-0,009|32.940|0,67|0,674|2.248|143.668|18:00:00
PUIG BRANDS|PUIG|19,76|-0,24|500|19,7|20,84|88|257.273|18:00:00
REALIA|RLIA|1,005|0|8.285|0,97|1,02|194|9.399|18:00:00
REDEIA CORPO|RED|15,92|-0,21|1.200|15,91|16,1|778|950.677|18:00:00
RENTA 4 BCO.|R4|21,4|0,1|448|21,2|21,7|324|877|18:00:00
RENTA CORP.|REN|0,81|-0,038|5.007|0,81|0,836|2.500|82.622|18:00:00
REPSOL|REP|28,65|-0,06|143|28,36|29,15|1.000|3.049.187|18:00:00
SACYR|SCYR|4,168|-0,046|4.723|4,15|4,24|3.500|2.990.658|18:00:00
SOLARIA|SLR|14,16|-0,81|372|14,16|14,25|1.728|3.683.773|18:00:00
SOLTEC|SOL|0,422|-0,028|1.700|0,42|0,444|27.423|1.173.602|18:00:00
SQUIRREL MED|SQRL|1,88|-0,005|200|1,865|1,945|2.000|14.107|18:00:00
TALGO|TLGO|2,2|-0,01|911|2,2|2,23|728|72.687|18:00:00
TEC.REUNIDAS|TRE|30|0,34|1.000|29,54|31,94|500|128.774|18:00:00
TELEFONICA|TEF|3,356|-0,03|23.399|3,33|3,356|365|11.488.977|18:00:00
TUBACEX|TUB|2,8|-0,015|1.028|2,79|2,85|5.000|143.979|18:00:00
UNICAJA|UNI|3,316|-0,02|1.199|3,3|3,38|13.000|2.559.490|18:00:00
URBAS|UBS|0,0032|0|-|-|-|-|0|17:35:11
VIDRALA|VID|88,9|-0,1|11|88,5|90,6|36|12.361|18:00:00
VISCOFAN|VIS|54,6|-0,9|230|54,5|56|1.400|88.614|18:00:00
VOCENTO|VOC|0,79|-0,01|375|0,78|0,81|2.639|12.175|18:00:00`

const IBEX35 = new Set('ACS ACX ANA ANE AENA AMS BBVA BKT CABK CLNX COL ELE ENG FER FDR GRF IAG IBE IDR ITX LOG MAP MRL MTS NTGY PUIG RED REP ROVI SAB SAN SCYR SLR TEF UNI'.split(' '))
const EUROSTOXX50 = new Set('AMS BBVA IBE ITX SAN'.split(' ')) // inventado (muestra)

const num = (s) => (s === '-' ? null : Number(s.replace(/\./g, '').replace(',', '.')))
const rnd = (i, k) => { const x = Math.sin(i * 9301 + k * 49297) * 233280; return x - Math.floor(x) } // determinista: los datos no cambian entre cargas

export const filas = BRUTO.split('\n').map((l, i) => {
  const [name, symbol, last, dif, volC, compra, venta, volV, volumen, hora] = l.split('|')
  const u = num(last), d = num(dif)
  const lg = symbol.replace('.P', '').toLowerCase()
  return {
    id: symbol, name, symbol, logoURL: LOGOS.has(lg) ? logo('iso-' + lg + '.svg') : undefined,
    last: u, dif: d, difPct: d === 0 ? 0 : +(d / (u - d) * 100).toFixed(2), volC: num(volC), compra: num(compra), venta: num(venta), volV: num(volV), volumen: num(volumen), hora,
    mercado: 'Mercado Continuo', indices: [...(IBEX35.has(symbol) ? ['Ibex 35'] : []), ...(EUROSTOXX50.has(symbol) ? ['DJ EuroStoxx 50'] : [])],
    max52: +(u * (1.1 + rnd(i, 7) * 0.5)).toFixed(u < 1 ? 4 : 2), min52: +(u * (0.5 + rnd(i, 8) * 0.4)).toFixed(u < 1 ? 4 : 2),
    cap: Math.round(20 + rnd(i, 9) * 40000), per: +(5 + rnd(i, 10) * 30).toFixed(1), ytd: +((rnd(i, 11) - 0.35) * 60).toFixed(2),
  }
})

const opc = (...v) => v.map((x) => (Array.isArray(x) ? { value: x[0], label: x[1] } : { value: x, label: x }))
const fMercados = { id: 'mercados', label: 'Mercados', type: 'multiple', highlighted: true,
  options: opc('Mercado Continuo', 'NASDAQ', 'NYSE', 'AMEX', 'Amsterdam', 'Bruselas', 'Estocolmo', 'Frankfurt', 'Helsinki', 'Lisboa', 'Londres', 'Milán', 'París', 'Suiza'),
  predicate: (r, vs) => vs.includes(r.mercado) }
const fIndices = { id: 'indices', label: 'Índices', type: 'multiple', highlighted: true,
  options: opc('Ibex 35', 'Latibex', 'DJ EuroStoxx 50', 'Dow Jones', 'S&P 500', 'PSI 20', 'OMX S30', 'OMX H25', 'NASDAQ 100', 'ITA40', 'UK100', 'DAX 40', 'CAC 40', 'BEL 20', 'AEX', 'SMI'),
  predicate: (r, vs) => r.indices.some((i) => vs.includes(i)) }
// Filtros solo en el panel «Todos los filtros» (inventados; el encargo solo define los destacados): son por columna, así que cada vista trae los suyos
const fVariacion = { id: 'variacion', label: 'Variación diaria', type: 'single', options: opc(['alza', 'Al alza'], ['baja', 'A la baja'], ['igual', 'Sin cambios']),
  predicate: (r, [v]) => (v === 'alza' ? r.dif > 0 : v === 'baja' ? r.dif < 0 : r.dif === 0) }
const fYtd = { id: 'ytd', label: 'Rentabilidad YTD', type: 'single', options: opc(['pos', 'Positiva'], ['neg', 'Negativa']), predicate: (r, [v]) => (v === 'pos' ? r.ytd >= 0 : r.ytd < 0) }
const fCap = { id: 'cap', label: 'Capitalización', type: 'multiple', options: opc(['peq', 'Pequeña (menos de 500 M€)'], ['med', 'Mediana (500 M€ - 5.000 M€)'], ['gran', 'Grande (más de 5.000 M€)']),
  predicate: (r, vs) => vs.includes(r.cap < 500 ? 'peq' : r.cap <= 5000 ? 'med' : 'gran') }

// Ordenar columnas (`sortable` de R4Table): disponible en la reconstrucción y en Figma, pero NO está desarrollado todavía → de momento ninguna columna es ordenable (sin iconos de orden en la cabecera). Se activa añadiendo `sortable: true`.
const nombre = { field: 'name', header: 'Nombre', frozen: true, width: '13%' }
const num_ = (field, header, width) => ({ field, header, align: 'right', width })
const accion = { field: 'accion', header: '', srHeader: 'Acciones', align: 'right', width: '5%' }
export const vistas = [
  { value: 'basica', label: 'Vista básica',
    columns: [{ ...nombre, width: '20%' }, num_('last', 'Último', '10%'), num_('dif', 'Dif.', '9%'), num_('difPct', 'Dif.%', '10%'), num_('volC', 'VolC', '9%'), num_('compra', 'Compra', '9%'), num_('venta', 'Venta', '9%'), num_('volV', 'VolV', '8%'), num_('volumen', 'Volumen', '10%'), { ...accion, width: '6%' }],
    filters: [fMercados, fIndices, fVariacion],
    initial: { indices: ['Ibex 35'] }, defaultSort: { field: 'name', order: 'asc' } },
  { value: 'adicional', label: 'Vista adicional',
    columns: [{ ...nombre, width: '30%' }, num_('max52', 'Máx. 52 s', '15%'), num_('min52', 'Mín. 52 s', '15%'), num_('cap', 'Cap. (M€)', '13%'), num_('per', 'PER', '9%'), num_('ytd', 'YTD', '12%'), { ...accion, width: '6%' }],
    filters: [fMercados, fIndices, fYtd, fCap],
    initial: { indices: ['Ibex 35'] } },
]

// ───────────────────────── Escenario «Movimientos» (Facilitador › Escenarios) ─────────────────────────
// Tabla de movimientos de una cuenta. Visual y filtros de la primera versión del Figma «Proyectos - Tablas» (frame 668:23386: Fecha «Últimos 3 meses», Tipo «Criptoactivos», Valor; columnas Fecha · Valor · Descripción · Tipo · Importe · Saldo).
// TODOS los datos son INVENTADOS (el encargo no trae contenido de esta tabla): fechas relativas a hoy, importes y saldos acumulados coherentes entre sí.
const HOY = new Date()
const fechaDe = (dias) => { const d = new Date(HOY); d.setDate(d.getDate() - dias); return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
// [días atrás, valor, tipo, operación, cantidad, precio]
const MOV = [
  [0, 'Bitcoin', 'Criptoactivos', 'Compra', 0.05, 86420.5], [1, 'SANTANDER', 'Acciones', 'Dividendo', 400, 0.11], [2, 'Ethereum', 'Criptoactivos', 'Compra', 1.2, 2985.3],
  [3, 'iShares Core S&P 500', 'ETFs', 'Compra', 6, 612.4], [5, 'Solana', 'Criptoactivos', 'Venta', 14, 128.74], [6, 'TELEFONICA', 'Acciones', 'Venta', 900, 3.356],
  [9, 'Magallanes Value Iberia', 'Fondos', 'Suscripción', 120, 42.5], [11, 'XRP', 'Criptoactivos', 'Compra', 1500, 2.18], [14, 'IBERDROLA', 'Acciones', 'Compra', 250, 22.59],
  [17, 'Bitcoin', 'Criptoactivos', 'Venta', 0.02, 84100], [21, 'BBVA', 'Acciones', 'Dividendo', 300, 0.3], [25, 'Dogecoin', 'Criptoactivos', 'Compra', 9000, 0.163],
  [30, 'Ethereum', 'Criptoactivos', 'Venta', 0.6, 3050], [36, 'Vanguard FTSE All-World', 'ETFs', 'Compra', 25, 138.7], [41, 'SANTANDER', 'Acciones', 'Compra', 1200, 10.4],
  [48, 'Cobas Selección', 'Fondos', 'Reembolso', 80, 19.8], [55, 'Solana', 'Criptoactivos', 'Compra', 22, 119.9], [63, 'Bitcoin', 'Criptoactivos', 'Compra', 0.04, 79800],
  [72, 'TELEFONICA', 'Acciones', 'Dividendo', 900, 0.15], [80, 'XRP', 'Criptoactivos', 'Venta', 800, 2.4], [88, 'IBERDROLA', 'Acciones', 'Venta', 120, 23.1],
  [105, 'Ethereum', 'Criptoactivos', 'Compra', 0.8, 2700], [130, 'BBVA', 'Acciones', 'Compra', 500, 21.8], [160, 'Amundi MSCI World', 'ETFs', 'Venta', 10, 515], [210, 'Bitcoin', 'Criptoactivos', 'Compra', 0.03, 66200],
  [260, 'Azvalor Internacional', 'Fondos', 'Suscripción', 60, 31.2], [320, 'SANTANDER', 'Acciones', 'Dividendo', 800, 0.1],
]
const SALIDAS = new Set(['Compra', 'Suscripción'])
let saldoAcum = 60000
const _movs = [...MOV].reverse().map(([dias, valor, tipo, operacion, cantidad, precio], i) => {
  const bruto = +(cantidad * precio).toFixed(2)
  const comision = operacion === 'Dividendo' ? 0 : +Math.max(1.5, bruto * 0.0035).toFixed(2)
  const importe = SALIDAS.has(operacion) ? -(bruto + comision) : operacion === 'Dividendo' ? bruto : bruto - comision
  saldoAcum = +(saldoAcum + importe).toFixed(2)
  return { id: `mov-${i}`, dias, fecha: fechaDe(dias), valor, tipo, operacion, descripcion: `${operacion} de ${tipo === 'Criptoactivos' ? 'criptoactivos' : tipo === 'Acciones' ? 'acciones' : tipo === 'ETFs' ? 'ETF' : 'fondo'}`, cantidad, precio, comision, importe: +importe.toFixed(2), saldo: saldoAcum }
}).reverse() // más recientes primero

export const movimientos = _movs
const FECHAS = { hoy: 0, '1w': 7, '1m': 30, '3m': 90, '1y': 365 }
const fFechaM = { id: 'fecha', label: 'Fecha', type: 'single', icon: 'ic-calendar', highlighted: true,
  options: opc(['hoy', 'Hoy'], ['1w', 'Última semana'], ['1m', 'Último mes'], ['3m', 'Últimos 3 meses'], ['1y', 'Último año']),
  predicate: (r, [v]) => r.dias <= FECHAS[v] }
const fTipoM = { id: 'tipo', label: 'Tipo', type: 'multiple', highlighted: true, options: opc('Acciones', 'Criptoactivos', 'ETFs', 'Fondos'), predicate: (r, vs) => vs.includes(r.tipo) }
const fValorM = { id: 'valor', label: 'Valor', type: 'multiple', highlighted: true, options: opc(...[...new Set(_movs.map((m) => m.valor))].sort((a, b) => a.localeCompare(b, 'es')).map((n) => [n, n])), predicate: (r, vs) => vs.includes(r.valor) }
const fOperacion = { id: 'operacion', label: 'Operación', type: 'multiple', options: opc('Compra', 'Venta', 'Dividendo', 'Suscripción', 'Reembolso'), predicate: (r, vs) => vs.includes(r.operacion) }
const fSigno = { id: 'signo', label: 'Importe', type: 'single', options: opc(['entrada', 'Entradas de dinero'], ['salida', 'Salidas de dinero']), predicate: (r, [v]) => (v === 'entrada' ? r.importe > 0 : r.importe < 0) }
export const vistasMovimientos = [
  { value: 'basica', label: 'Vista básica',
    columns: [{ field: 'fecha', header: 'Fecha', width: '14%' }, { field: 'valor', header: 'Valor', frozen: true, width: '24%' }, { field: 'descripcion', header: 'Descripción', width: '22%' }, { field: 'tipo', header: 'Tipo', width: '14%' }, num_('importe', 'Importe', '13%'), num_('saldo', 'Saldo', '13%')],
    filters: [fFechaM, fTipoM, fValorM, fOperacion],
    initial: { fecha: ['3m'], tipo: ['Criptoactivos'] } },
  { value: 'adicional', label: 'Vista adicional',
    columns: [{ field: 'fecha', header: 'Fecha', width: '14%' }, { field: 'valor', header: 'Valor', frozen: true, width: '26%' }, num_('cantidad', 'Cantidad', '14%'), num_('precio', 'Precio', '14%'), num_('comision', 'Comisión', '14%'), num_('importe', 'Importe', '18%')],
    filters: [fFechaM, fTipoM, fValorM, fSigno],
    initial: { fecha: ['3m'], tipo: ['Criptoactivos'] } },
]
