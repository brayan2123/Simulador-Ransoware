(() => {
"use strict";

const KEY = "nerium-fin014-v1";
const WAIT = 20000;
const LIMIT = 600000;

const $ = (selector) =>
document.querySelector(selector);

function read() {
try {
return JSON.parse(
localStorage.getItem(KEY)
) || null;
} catch {
return null;
}
}

let state = read();

function save() {
localStorage.setItem(
KEY,
JSON.stringify(state)
);

render();
}

function start() {
const now = Date.now();

state = {
started: now,
deadline: now + WAIT + LIMIT,
evidence: [],
mistakes: 0,
hintsUsed: 0,
hintProgress: {},
resolved: false
};

save();
}

function createInstructionsModal() {
if ($("#scenarioInstructions")) return;

const styles =
document.createElement("style");

styles.textContent = `
.instructions-overlay {
position: fixed;
inset: 0;
z-index: 10050;
display: grid;
place-items: center;
padding: 22px;
background: rgba(10, 6, 18, 0.78);
backdrop-filter: blur(5px);
}

.instructions-overlay[hidden] {
display: none;
}

.instructions-card {
width: min(720px, 100%);
max-height: calc(100vh - 44px);
overflow-y: auto;
padding: 34px;
border: 1px solid #9d70ff;
border-radius: 18px;
background: #ffffff;
color: #20172a;
box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
}

.instructions-label {
display: block;
margin-bottom: 8px;
color: #7b2ff7;
font-size: 12px;
font-weight: 800;
letter-spacing: 1.2px;
}

.instructions-card h2 {
margin: 0 0 10px;
color: #35105e;
font-size: clamp(25px, 4vw, 34px);
}

.instructions-intro {
margin: 0 0 22px;
color: #554c60;
line-height: 1.6;
}

.instructions-grid {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 12px;
margin: 0 0 22px;
}

.instruction-item {
position: relative;
overflow: hidden;
padding: 15px;
border: 1px solid #e5dcf2;
border-radius: 11px;
background: #faf8fd;
}

.instruction-item::before {
content: "";
position: absolute;
top: 0;
left: 0;
right: 0;
height: 3px;
background: #7b2ff7;
}

.instruction-item strong {
display: block;
margin-bottom: 5px;
color: #35105e;
}

/* Tiempo límite */
.instruction-item:nth-child(1)::before {
background: #2563eb;
}

.instruction-item:nth-child(1) strong {
color: #2563eb;
}

/* Alerta inicial */
.instruction-item:nth-child(2)::before {
background: #f59e0b;
}

.instruction-item:nth-child(2) strong {
color: #d97706;
}

/* Pistas */
.instruction-item:nth-child(3)::before {
background: #7b2ff7;
}

.instruction-item:nth-child(3) strong {
color: #7b2ff7;
}

/* Errores */
.instruction-item:nth-child(4)::before {
background: #dc2626;
}

.instruction-item:nth-child(4) strong {
color: #dc2626;
}

.instruction-item span {
color: #62596b;
font-size: 14px;
line-height: 1.45;
}

.instructions-route {
margin: 0 0 24px;
padding: 14px 16px;
border-left: 4px solid #7b2ff7;
border-radius: 8px;
background: #f2ebff;
color: #35105e;
font-size: 14px;
font-weight: 700;
line-height: 1.5;
}

.instructions-actions {
display: flex;
justify-content: flex-end;
}

.instructions-start {
min-height: 48px;
padding: 0 26px;
border: 0;
border-radius: 9px;
background: #7b2ff7;
color: #ffffff;
font: inherit;
font-weight: 800;
cursor: pointer;
}

.instructions-start:hover {
background: #35105e;
}

@media (max-width: 650px) {
.instructions-card {
padding: 24px 20px;
}

.instructions-grid {
grid-template-columns: 1fr;
}

.instructions-start {
width: 100%;
}
}
`;

document.head.appendChild(styles);

const overlay =
document.createElement("div");

overlay.id = "scenarioInstructions";
overlay.className =
"instructions-overlay";
overlay.hidden = true;

overlay.innerHTML = `
<section
class="instructions-card"
role="dialog"
aria-modal="true"
aria-labelledby="instructionsTitle"
>
<span class="instructions-label">
INCIDENTE FIN-014
</span>

<h2 id="instructionsTitle">
Instrucciones de la misión
</h2>

<p class="instructions-intro">
Investiga el ataque de ransomware,
identifica cómo comenzó y contiene la
amenaza antes de que termine el tiempo.
</p>

<div class="instructions-grid">
<div class="instruction-item">
<strong>
⏱ Tiempo límite
</strong>

<span>
Tendrás 10 minutos para completar
toda la misión.
</span>
</div>

<div class="instruction-item">
<strong>
⚠ Alerta inicial
</strong>

<span>
La alerta de ransomware aparecerá
20 segundos después de comenzar.
</span>
</div>

<div class="instruction-item">
<strong>
💡 Pistas
</strong>

<span>
Puedes solicitar pistas según tu
progreso. Cada una descuenta
5 segundos.
</span>
</div>

<div class="instruction-item">
<strong>
✕ Errores
</strong>

<span>
Las decisiones incorrectas
penalizan tu tiempo y afectan
el resultado final.
</span>
</div>
</div>

<div class="instructions-route">
Ruta de investigación:
Alerts → Event Search → Inventory →
Graph Explorer → RemoteOps.
</div>

<div class="instructions-actions">
<button
id="scenarioBeginMission"
class="instructions-start"
type="button"
>
Comenzar misión
</button>
</div>
</section>
`;

document.body.appendChild(overlay);
}

function showInstructions() {
createInstructionsModal();

const overlay =
$("#scenarioInstructions");

if (overlay) {
overlay.hidden = false;
}
}

function detectarEtapaPerdida(estado) {
if (
estado?.remoteCollected ||
estado?.remoteStopped
) {
return {
nombre: "RemoteOps",
faltante:
"Faltó terminar la respuesta final, detener el proceso sospechoso y confirmar que no aparecieran archivos cifrados nuevos.",
siguiente:
"Recopila primero los indicadores, después detén PowerShell y finalmente verifica la contención en FIN-014."
};
}

if (
estado?.graphVerified ||
(estado?.graphInvestigated
?.length || 0) > 0
) {
return {
nombre: "Graph Explorer",
faltante:
"Faltó completar la reconstrucción de la cadena del ataque y avanzar a las acciones remotas.",
siguiente:
"Sigue el orden Documento, PowerShell, Cifrado y SMB; después confirma la secuencia y continúa a RemoteOps."
};
}

if (
estado?.inventoryVerified ||
(estado?.inventoryScanned
?.length || 0) > 0
) {
return {
nombre: "Inventory",
faltante:
"Faltó comprobar el alcance del incidente y distinguir el equipo de origen del equipo solamente expuesto.",
siguiente:
"Analiza FIN-014 y FIN-021, compara la evidencia y confirma a FIN-014 como origen del cifrado."
};
}

if (
estado?.processIdentified ||
(estado?.eventValidated
?.length || 0) > 0
) {
return {
nombre: "Event Search",
faltante:
"Faltó validar la secuencia completa de eventos e identificar el proceso responsable del cifrado.",
siguiente:
"Revisa el documento, el comando codificado de PowerShell y el evento de cifrado en orden cronológico."
};
}

if (
estado?.isolated ||
estado?.evidence?.includes(
"alert"
)
) {
return {
nombre: "Alerts",
faltante:
"Faltó completar la contención inicial o continuar con la investigación de los eventos relacionados.",
siguiente:
"Registra la hipótesis correcta, aísla FIN-014 y continúa inmediatamente a Event Search."
};
}

return {
nombre: "Monitoreo inicial",
faltante:
"No se alcanzó a iniciar la investigación de la alerta crítica en FIN-014.",
siguiente:
"Abre la alerta cuando aparezca y comienza por identificar el equipo y la secuencia inicial del ataque."
};
}

function calcularProgreso(estado) {
let avance = 0;

if (
estado?.isolated ||
estado?.evidence?.includes(
"alert"
)
) {
avance += 1;
}

if (estado?.processIdentified) {
avance += 1;
}

if (estado?.inventoryVerified) {
avance += 1;
}

if (estado?.graphVerified) {
avance += 1;
}

if (estado?.remoteCollected) {
avance += 0.5;
}

if (estado?.remoteStopped) {
avance += 0.5;
}

return Math.min(
100,
Math.round(
(avance / 5) * 100
)
);
}

function calcularPuntuacionDerrota(
estado
) {
const progreso =
calcularProgreso(estado);

const errores =
Number(
estado?.mistakes || 0
);

const pistas =
Number(
estado?.hintsUsed || 0
);

return Math.max(
0,
Math.min(
99,
Math.round(
progreso * 0.8 +
Math.max(
0,
20 -
errores * 4 -
pistas * 2
)
)
)
);
}

function crearRecomendacionesDerrota(
estado,
etapa
) {
const recomendaciones = [
etapa.siguiente
];

const errores =
Number(
estado?.mistakes || 0
);

const pistas =
Number(
estado?.hintsUsed || 0
);

if (errores >= 3) {
recomendaciones.push(
"Antes de confirmar una acción, compara el endpoint, el proceso y la secuencia temporal para reducir errores."
);
} else {
recomendaciones.push(
"Mantén el orden de investigación y confirma cada hallazgo antes de avanzar al siguiente módulo."
);
}

if (pistas >= 4) {
recomendaciones.push(
"Usa las pistas solamente cuando hayas revisado la evidencia visible; cada solicitud reduce el tiempo disponible."
);
} else {
recomendaciones.push(
"Si te bloqueas, solicita una pista temprano para evitar perder más tiempo buscando en una sección incorrecta."
);
}

return recomendaciones;
}

function createLossModal() {
if ($("#scenarioLossOverlay")) {
return;
}

const styles =
document.createElement(
"style"
);

styles.textContent = `
.loss-overlay {
position: fixed;
inset: 0;
z-index: 13000;
display: grid;
place-items: center;
padding: 20px;
background: rgba(9, 5, 15, 0.84);
backdrop-filter: blur(6px);
}

.loss-overlay[hidden] {
display: none;
}

.loss-card {
width: min(860px, 100%);
max-height: calc(100vh - 40px);
overflow-y: auto;
padding: 34px;
border: 1px solid #e35b75;
border-radius: 20px;
background: #ffffff;
color: #241a2c;
box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
}

.loss-heading {
display: flex;
align-items: flex-start;
gap: 16px;
margin-bottom: 24px;
}

.loss-icon {
display: grid;
flex: 0 0 54px;
width: 54px;
height: 54px;
place-items: center;
border-radius: 50%;
background: #ffe8ed;
color: #b42345;
font-size: 28px;
font-weight: 900;
}

.loss-label {
display: block;
margin-bottom: 5px;
color: #bd2345;
font-size: 12px;
font-weight: 900;
letter-spacing: 1.2px;
}

.loss-card h2 {
margin: 0 0 6px;
color: #35105e;
font-size: clamp(25px, 4vw, 36px);
}

.loss-subtitle {
margin: 0;
color: #665b70;
line-height: 1.5;
}

.loss-stats {
display: grid;
grid-template-columns: repeat(4, minmax(0, 1fr));
gap: 12px;
margin-bottom: 22px;
}

.loss-stat {
padding: 16px;
border: 1px solid #e8e0ef;
border-radius: 12px;
background: #faf8fc;
}

.loss-stat span {
display: block;
margin-bottom: 6px;
color: #73677e;
font-size: 12px;
font-weight: 700;
}

.loss-stat strong {
color: #35105e;
font-size: 22px;
}

.loss-progress {
height: 9px;
margin: 8px 0 24px;
overflow: hidden;
border-radius: 999px;
background: #eee8f2;
}

.loss-progress span {
display: block;
height: 100%;
border-radius: inherit;
background: linear-gradient(90deg, #7b2ff7, #bd2345);
}

.loss-section {
margin-top: 14px;
padding: 17px 18px;
border: 1px solid #e7deee;
border-radius: 12px;
background: #fbf9fd;
}

.loss-section.warning {
border-left: 4px solid #bd2345;
background: #fff5f7;
}

.loss-section h3 {
margin: 0 0 8px;
color: #35105e;
font-size: 16px;
}

.loss-section p,
.loss-section li {
color: #5d5267;
font-size: 14px;
line-height: 1.6;
}

.loss-section p,
.loss-section ul {
margin-top: 0;
margin-bottom: 0;
}

.loss-section ul {
padding-left: 20px;
}

.loss-actions {
display: flex;
justify-content: flex-end;
gap: 12px;
margin-top: 25px;
}

.loss-button {
min-height: 46px;
padding: 0 21px;
border-radius: 9px;
font: inherit;
font-weight: 800;
cursor: pointer;
}

.loss-button.secondary {
border: 1px solid #7b2ff7;
background: #ffffff;
color: #5a1bb1;
}

.loss-button.primary {
border: 0;
background: #7b2ff7;
color: #ffffff;
}

.loss-button:hover {
transform: translateY(-1px);
}

@media (max-width: 760px) {
.loss-card {
padding: 25px 20px;
}

.loss-stats {
grid-template-columns: repeat(2, minmax(0, 1fr));
}

.loss-actions {
flex-direction: column-reverse;
}

.loss-button {
width: 100%;
}
}
`;

document.head.appendChild(
styles
);

const overlay =
document.createElement(
"div"
);

overlay.id =
"scenarioLossOverlay";

overlay.className =
"loss-overlay";

overlay.hidden = true;

document.body.appendChild(
overlay
);
}

function mostrarResultadoDerrotaFinal() {
if (!state?.started) return;

const seenKey =
"nerium-loss-seen-" +
state.started;

if (
sessionStorage.getItem(
seenKey
)
) {
return;
}

createLossModal();

const overlay =
$("#scenarioLossOverlay");

if (!overlay) return;

const etapa =
detectarEtapaPerdida(state);

const errores = Number(
state.mistakes || 0
);

const pistas = Number(
state.hintsUsed || 0
);

const progreso =
calcularProgreso(state);

const puntuacion =
calcularPuntuacionDerrota(
state
);

const tiempoReal = Math.max(
0,
Date.now() -
(state.started + WAIT)
);

const recomendaciones =
crearRecomendacionesDerrota(
state,
etapa
);

overlay.innerHTML = `
<section
class="loss-card"
role="dialog"
aria-modal="true"
aria-labelledby="lossTitle"
>
<div class="loss-heading">
<div class="loss-icon">✕</div>

<div>
<span class="loss-label">
MISIÓN FALLIDA · TIEMPO AGOTADO
</span>

<h2 id="lossTitle">
La amenaza no fue contenida
</h2>

<p class="loss-subtitle">
El ransomware continuó activo antes de que se completara la respuesta al incidente.
</p>
</div>
</div>

<div class="loss-stats">
<div class="loss-stat">
<span>Tiempo utilizado</span>
<strong>${clock(tiempoReal)}</strong>
</div>

<div class="loss-stat">
<span>Errores</span>
<strong>${errores}</strong>
</div>

<div class="loss-stat">
<span>Pistas utilizadas</span>
<strong>${pistas}</strong>
</div>

<div class="loss-stat">
<span>Puntuación</span>
<strong>${puntuacion}/100</strong>
</div>
</div>

<strong>Progreso de la misión: ${progreso}%</strong>

<div class="loss-progress" aria-label="Progreso ${progreso}%">
<span style="width: ${progreso}%"></span>
</div>

<section class="loss-section warning">
<h3>Etapa alcanzada: ${etapa.nombre}</h3>
<p>${etapa.faltante}</p>
</section>

<section class="loss-section">
<h3>Reporte del desempeño</h3>
<p>
Se completó el ${progreso}% del procedimiento. La investigación avanzó hasta ${etapa.nombre}, pero el tiempo disponible terminó antes de verificar la contención completa de FIN-014.
</p>
</section>

<section class="loss-section">
<h3>Recomendaciones</h3>
<ul>
${recomendaciones
.map(
(texto) =>
`<li>${texto}</li>`
)
.join("")}
</ul>
</section>

<div class="loss-actions">
<button
id="lossDashboard"
class="loss-button secondary"
type="button"
>
Volver al dashboard
</button>

<button
id="lossRetry"
class="loss-button primary"
type="button"
>
Intentar de nuevo
</button>
</div>
</section>
`;

overlay.hidden = false;

sessionStorage.setItem(
seenKey,
"1"
);
}

/* =========================================================
CINEMÁTICA DE DERROTA · TIEMPO AGOTADO
========================================================= */

let cinematicaDerrotaActiva = false;

function crearCinematicaDerrota() {

if (
document.querySelector(
"#scenarioLossCinematic"
)
) {
return;
}

const estilos =
document.createElement("style");

estilos.id =
"scenarioLossCinematicStyles";

estilos.textContent = `

body.loss-cinematic-active {
overflow: hidden !important;
}

body.loss-cinematic-active
.application-shell,

body.loss-cinematic-active
.topbar {
pointer-events: none !important;
user-select: none !important;
}

.loss-cinematic {
position: fixed;
inset: 0;
z-index: 12950;
display: grid;
place-items: center;
overflow: hidden;
background: rgba(9, 3, 12, 0);
opacity: 0;
pointer-events: all;
transition: opacity .15s ease;
}

.loss-cinematic[hidden] {
display: none !important;
}

.loss-cinematic.is-active {
opacity: 1;
}

.loss-cinematic-red {
position: absolute;
inset: 0;
background: rgba(215, 10, 47, 0);
box-shadow:
inset 0 0 0
rgba(235, 17, 58, 0);
pointer-events: none;
}

.loss-cinematic.is-active
.loss-cinematic-red {
animation:
lossFinalRedFlash
1.55s ease-out forwards;
}

@keyframes lossFinalRedFlash {
0% {
background:
rgba(255, 15, 55, 0);

box-shadow:
inset 0 0 0
rgba(255, 20, 60, 0);
}

6% {
background:
rgba(255, 20, 60, .72);

box-shadow:
inset 0 0 160px
rgba(255, 35, 70, .95);
}

14% {
background:
rgba(150, 0, 32, .18);

box-shadow:
inset 0 0 90px
rgba(255, 25, 65, .48);
}

24% {
background:
rgba(235, 16, 55, .48);

box-shadow:
inset 0 0 130px
rgba(255, 25, 65, .78);
}

42% {
background:
rgba(72, 0, 20, .32);

box-shadow:
inset 0 0 110px
rgba(210, 15, 50, .50);
}

70% {
background:
rgba(24, 3, 12, .62);

box-shadow:
inset 0 0 140px
rgba(170, 7, 38, .32);
}

100% {
background:
rgba(8, 3, 10, .88);

box-shadow:
inset 0 0 160px
rgba(125, 0, 28, .25);
}
}

.loss-cinematic-vignette {
position: absolute;
inset: -30px;
opacity: 0;

background:
radial-gradient(
circle at center,
transparent 22%,
rgba(30, 0, 10, .15) 53%,
rgba(70, 0, 18, .72) 100%
);

pointer-events: none;
}

.loss-cinematic.is-active
.loss-cinematic-vignette {
animation:
lossVignette
1.5s ease forwards;
}

@keyframes lossVignette {
0% {
opacity: 0;
transform: scale(1.16);
}

35% {
opacity: .65;
}

100% {
opacity: 1;
transform: scale(1);
}
}

body.loss-cinematic-active
.application-shell {
animation:
lossScreenImpact
.52s cubic-bezier(.36,.07,.19,.97);
}

@keyframes lossScreenImpact {
0% {
transform:
translate(0, 0)
scale(1);
}

10% {
transform:
translate(-7px, 3px)
scale(1.006);
}

20% {
transform:
translate(7px, -3px)
scale(1.006);
}

32% {
transform:
translate(-5px, -2px);
}

45% {
transform:
translate(4px, 2px);
}

60% {
transform:
translate(-2px, 1px);
}

78% {
transform:
translate(2px, -1px);
}

100% {
transform:
translate(0, 0)
scale(1);
}
}

.loss-cinematic-message {
position: relative;
z-index: 4;

width:
min(
620px,
calc(100vw - 40px)
);

padding: 35px 30px;
color: #ffffff;
text-align: center;
opacity: 0;

transform:
scale(.72)
translateY(16px);
}

.loss-cinematic.show-message
.loss-cinematic-message {
animation:
lossMessageImpact
.58s
cubic-bezier(.18,.89,.32,1.28)
forwards;
}

@keyframes lossMessageImpact {
0% {
opacity: 0;

transform:
scale(.70)
translateY(20px);
}

55% {
opacity: 1;

transform:
scale(1.08)
translateY(-3px);
}

78% {
transform:
scale(.97)
translateY(1px);
}

100% {
opacity: 1;

transform:
scale(1)
translateY(0);
}
}

.loss-cinematic-icon {
width: 68px;
height: 68px;
display: grid;
place-items: center;
margin: 0 auto 17px;

border:
2px solid
rgba(255,255,255,.82);

border-radius: 50%;

background:
rgba(179, 13, 48, .55);

color: #ffffff;
font-size: 34px;
font-weight: 900;

box-shadow:
0 0 0 8px
rgba(220, 23, 59, .10),

0 0 38px
rgba(235, 20, 60, .55);
}

.loss-cinematic-label {
display: block;
margin-bottom: 7px;
color: #ff8096;
font-size: 11px;
font-weight: 900;
letter-spacing: 2.3px;
}

.loss-cinematic-message h2 {
margin: 0;
color: #ffffff;

font-size:
clamp(
32px,
6vw,
60px
);

font-weight: 900;
line-height: 1;
letter-spacing: -1.6px;

text-shadow:
0 0 25px
rgba(230, 25, 65, .55);
}

.loss-cinematic-message p {
margin: 15px auto 0;
max-width: 460px;

color:
rgba(255,255,255,.82);

font-size: 15px;
font-weight: 600;
line-height: 1.5;
}

.loss-cinematic-line {
width: 0;
height: 2px;
margin: 22px auto 0;

background:
linear-gradient(
90deg,
transparent,
#ff3159,
#ffffff,
#ff3159,
transparent
);

box-shadow:
0 0 17px
rgba(255, 38, 80, .85);
}

.loss-cinematic.show-message
.loss-cinematic-line {
animation:
lossLineExpand
.6s .22s ease forwards;
}

@keyframes lossLineExpand {
from {
width: 0;
opacity: 0;
}

to {
width: 250px;
opacity: 1;
}
}

.loss-cinematic.fade-out
.loss-cinematic-message {
animation:
lossMessageExit
.32s ease-in forwards;
}

@keyframes lossMessageExit {
to {
opacity: 0;
transform:
scale(1.08);
filter:
blur(5px);
}
}

#scenarioLossOverlay.cinematic-arrival {
animation:
lossBackdropArrival
.35s ease-out both;
}

#scenarioLossOverlay.cinematic-arrival
.loss-card {
animation:
lossCardArrival
.58s
cubic-bezier(.18,.89,.32,1.22)
both;
}

@keyframes lossBackdropArrival {
from {
opacity: 0;
}

to {
opacity: 1;
}
}

@keyframes lossCardArrival {
0% {
opacity: 0;

transform:
scale(.78)
translateY(35px);

filter:
blur(3px);
}

55% {
opacity: 1;

transform:
scale(1.035)
translateY(-5px);

filter:
blur(0);
}

78% {
transform:
scale(.985)
translateY(2px);
}

100% {
opacity: 1;

transform:
scale(1)
translateY(0);
}
}

@media (max-width: 600px) {
.loss-cinematic-message {
padding:
25px 18px;
}

.loss-cinematic-icon {
width: 58px;
height: 58px;
font-size: 28px;
}

.loss-cinematic-message p {
font-size: 13px;
}
}

@media (
prefers-reduced-motion: reduce
) {
.loss-cinematic-red,
.loss-cinematic-vignette,
.loss-cinematic-message,
.loss-cinematic-line,
body.loss-cinematic-active
.application-shell,
#scenarioLossOverlay.cinematic-arrival
.loss-card {
animation-duration:
.01ms !important;
}
}
`;

document.head.appendChild(
estilos
);

const overlay =
document.createElement("div");

overlay.id =
"scenarioLossCinematic";

overlay.className =
"loss-cinematic";

overlay.hidden = true;

overlay.innerHTML = `
<div
class="loss-cinematic-red">
</div>

<div
class="loss-cinematic-vignette">
</div>

<section
class="loss-cinematic-message"
aria-live="assertive"
>
<div
class="loss-cinematic-icon">
!
</div>

<span
class="loss-cinematic-label">
INCIDENT RESPONSE FAILED
</span>

<h2>
TIEMPO AGOTADO
</h2>

<p>
La amenaza continúa propagándose.
La contención no se completó
dentro del tiempo disponible.
</p>

<div
class="loss-cinematic-line">
</div>
</section>
`;

document.body.appendChild(
overlay
);
}

function showLossModal() {

if (!state?.started) {
return;
}

const seenKey =
"nerium-loss-seen-" +
state.started;

if (
sessionStorage.getItem(
seenKey
)
) {
return;
}

if (cinematicaDerrotaActiva) {
return;
}

cinematicaDerrotaActiva = true;

crearCinematicaDerrota();

const cinematica =
document.querySelector(
"#scenarioLossCinematic"
);

if (!cinematica) {
cinematicaDerrotaActiva = false;

mostrarResultadoDerrotaFinal();

return;
}

const timer =
document.querySelector(
"#scenarioTimer"
);

if (timer) {
timer.textContent =
"Mitigación 00:00";
}

document.body.classList.add(
"loss-cinematic-active"
);

cinematica.classList.remove(
"is-active",
"show-message",
"fade-out"
);

cinematica.hidden = false;

requestAnimationFrame(
function () {
requestAnimationFrame(
function () {
cinematica.classList.add(
"is-active"
);
}
);
}
);

setTimeout(
function () {
cinematica.classList.add(
"show-message"
);
},
180
);

setTimeout(
function () {
cinematica.classList.add(
"fade-out"
);
},
1380
);

setTimeout(
function () {

cinematica.hidden = true;

cinematica.classList.remove(
"is-active",
"show-message",
"fade-out"
);

document.body.classList.remove(
"loss-cinematic-active"
);

mostrarResultadoDerrotaFinal();

const resultado =
document.querySelector(
"#scenarioLossOverlay"
);

if (resultado) {
resultado.classList.add(
"cinematic-arrival"
);
}

cinematicaDerrotaActiva =
false;

},
1750
);
}

function phase() {
if (!state) return "idle";
if (state.resolved) return "won";

if (
Date.now() >=
state.deadline
) {
return "lost";
}

if (
Date.now() >=
state.started + WAIT
) {
return "attack";
}

return "waiting";
}

function clock(milliseconds) {
const seconds = Math.max(
0,
Math.ceil(
milliseconds / 1000
)
);

const minutes = String(
Math.floor(seconds / 60)
).padStart(2, "0");

const remainingSeconds =
String(
seconds % 60
).padStart(2, "0");

return (
minutes +
":" +
remainingSeconds
);
}

function notice(message) {
const element =
$("#scenarioNotice");

if (!element) return;

element.textContent =
message;

element.hidden = false;
}

function prepareRansomwareAlert(
modal
) {
if (!modal) return;

if (
!document.getElementById(
"ransomwareImpactStyles"
)
) {
const style =
document.createElement(
"style"
);

style.id =
"ransomwareImpactStyles";

style.textContent = `
#scenarioModal.ransomware-impact-modal {
isolation: isolate;
overflow: hidden;
background:
radial-gradient(
circle at center,
rgba(190, 12, 52, .28),
rgba(4, 2, 7, .96) 62%
) !important;
backdrop-filter: blur(7px);
animation:
ransomwareBackdrop
.45s
ease-out
both;
}

#scenarioModal.ransomware-impact-modal::before {
content: "";
position: fixed;
inset: 0;
z-index: -1;
pointer-events: none;
border: 9px solid rgba(255, 36, 80, .18);
box-shadow:
inset 0 0 100px rgba(235, 20, 63, .22);
animation:
ransomwareEdge
1.05s
ease-in-out
infinite;
}

.ransomware-impact-card {
width: min(590px, calc(100vw - 36px));
overflow: hidden;
border: 2px solid #ff3d66;
border-radius: 17px;
background:
linear-gradient(
145deg,
#2b0813,
#15070e 62%,
#09060a
);
color: #ffffff;
box-shadow:
0 0 55px rgba(239, 25, 70, .38),
0 30px 100px rgba(0, 0, 0, .76);
animation:
ransomwareImpact
.66s
cubic-bezier(.18,.9,.25,1.16)
both,
ransomwareTension
1.55s
.75s
ease-in-out
infinite;
}

.ransomware-impact-strip {
padding: 11px 18px;
background:
repeating-linear-gradient(
-45deg,
#d01540 0 13px,
#a90b30 13px 26px
);
color: #ffffff;
font-size: 11px;
font-weight: 900;
letter-spacing: 1px;
text-align: center;
}

.ransomware-impact-content {
padding: 31px 34px 34px;
}

.ransomware-impact-label {
display: flex;
align-items: center;
gap: 10px;
margin-bottom: 11px;
color: #ff7592;
font-size: 12px;
font-weight: 900;
letter-spacing: 1px;
}

.ransomware-impact-icon {
display: grid;
width: 29px;
height: 29px;
place-items: center;
border: 1px solid #ff6685;
border-radius: 50%;
background: rgba(226, 20, 62, .20);
color: #ffffff;
font-size: 18px;
animation:
ransomwareIcon
.72s
ease-in-out
infinite;
}

.ransomware-impact-card h2 {
margin: 0 0 14px;
color: #ffffff;
font-size: clamp(29px, 4.8vw, 39px);
line-height: 1.08;
letter-spacing: -.7px;
}

.ransomware-impact-card p {
margin: 0 0 19px;
color: #f6dde4;
font-size: 16px;
line-height: 1.55;
}

.ransomware-live-status {
display: flex;
align-items: center;
gap: 10px;
margin-bottom: 22px;
padding: 12px 14px;
border: 1px solid rgba(255, 83, 118, .36);
border-radius: 9px;
background: rgba(157, 8, 42, .23);
color: #ffe0e7;
font-size: 13px;
font-weight: 800;
}

.ransomware-live-dot {
flex: 0 0 auto;
width: 9px;
height: 9px;
border-radius: 50%;
background: #ff315c;
animation:
ransomwareDot
1s
ease-out
infinite;
}

#scenarioDismiss.ransomware-impact-button {
width: 100%;
min-height: 53px;
border: 1px solid #ff829c;
border-radius: 9px;
background:
linear-gradient(
135deg,
#df1748,
#9e0b32
);
color: #ffffff;
box-shadow:
0 11px 25px rgba(199, 10, 53, .32);
font: inherit;
font-size: 15px;
font-weight: 900;
cursor: pointer;
}

#scenarioDismiss.ransomware-impact-button:hover {
background:
linear-gradient(
135deg,
#ef2a58,
#b90f3d
);
transform: translateY(-1px);
}

@keyframes ransomwareBackdrop {
from {
opacity: 0;
background-color: rgba(255, 0, 45, .32);
}

to {
opacity: 1;
}
}

@keyframes ransomwareImpact {
0% {
opacity: 0;
transform:
translateY(36px)
scale(.86);
}

58% {
opacity: 1;
transform:
translateY(-5px)
scale(1.025);
}

72% {
transform: translateX(-6px);
}

83% {
transform: translateX(6px);
}

100% {
opacity: 1;
transform: translateX(0);
}
}

@keyframes ransomwareTension {
0%, 100% {
box-shadow:
0 0 38px rgba(239, 25, 70, .29),
0 30px 100px rgba(0, 0, 0, .76);
}

50% {
box-shadow:
0 0 68px rgba(239, 25, 70, .48),
0 30px 100px rgba(0, 0, 0, .76);
}
}

@keyframes ransomwareEdge {
0%, 100% { opacity: .42; }
50% { opacity: 1; }
}

@keyframes ransomwareIcon {
0%, 100% { transform: scale(1); }
50% { transform: scale(1.14); }
}

@keyframes ransomwareDot {
0% {
box-shadow:
0 0 0 0 rgba(255, 49, 92, .68);
}

100% {
box-shadow:
0 0 0 9px rgba(255, 49, 92, 0);
}
}

@media (max-width: 620px) {
.ransomware-impact-content {
padding: 25px 22px 27px;
}

.ransomware-impact-strip {
font-size: 9px;
}
}

@media (prefers-reduced-motion: reduce) {
#scenarioModal.ransomware-impact-modal,
#scenarioModal.ransomware-impact-modal::before,
.ransomware-impact-card,
.ransomware-impact-icon,
.ransomware-live-dot {
animation: none !important;
}
}
`;

document.head.appendChild(
style
);
}

if (
modal.dataset
.ransomwareImpactReady
) {
return;
}

modal.dataset.ransomwareImpactReady =
"true";

modal.classList.add(
"ransomware-impact-modal"
);

modal.innerHTML = `
<section
class="ransomware-impact-card"
role="document">

<div
class="ransomware-impact-strip">
⚠ INCIDENTE EN CURSO · PROPAGACIÓN DETECTADA ⚠
</div>

<div
class="ransomware-impact-content">

<div
class="ransomware-impact-label">
<span
class="ransomware-impact-icon"
aria-hidden="true">
!
</span>

<span>
ALERTA CRÍTICA · RANSOMWARE ACTIVO
</span>
</div>

<h2 id="scenarioTitle">
¡Cifrado masivo detectado!
</h2>

<p>
El cifrado ya comenzó en FIN-014 y puede propagarse a otros equipos. Tienes 10 minutos para identificar el proceso responsable, detenerlo y comprobar la contención. Cada segundo cuenta.
</p>

<div
class="ransomware-live-status"
aria-live="assertive">
<span
class="ransomware-live-dot"
aria-hidden="true">
</span>

<span>
126 archivos modificados · Propagación en curso
</span>
</div>

<button
id="scenarioDismiss"
class="ransomware-impact-button"
type="button">
Investigar ahora →
</button>
</div>
</section>
`;
}

function render() {
state = read();

const currentPhase =
phase();

const endGameButton =
Array.from(
document.querySelectorAll(
"a, button"
)
).find(
(element) =>
element.textContent
.trim()
.replace(/\s+/g, " ")
.startsWith(
"Ir a Alerts"
)
);

if (endGameButton) {
endGameButton.id =
"scenarioEndGame";

endGameButton.textContent =
"Terminar juego";

endGameButton.setAttribute(
"href",
"#"
);

endGameButton.setAttribute(
"aria-label",
"Terminar juego y volver al inicio"
);
}

document.body.dataset.scenario =
currentPhase;

if (
currentPhase === "lost"
) {
showLossModal();
}

const timer =
$("#scenarioTimer");

if (timer) {
if (
currentPhase ===
"waiting"
) {
timer.textContent =
"Alerta en " +
clock(
state.started +
WAIT -
Date.now()
);

} else if (
currentPhase ===
"attack"
) {
timer.textContent =
"Mitigación " +
clock(
state.deadline -
Date.now()
);

} else if (
currentPhase ===
"lost"
) {
timer.textContent =
"Tiempo agotado";

} else if (
currentPhase ===
"won"
) {
timer.textContent =
"Contenido";

} else {
timer.textContent =
"Sin iniciar";
}
}

const startButton =
$("#scenarioStart");

if (startButton) {
startButton.hidden =
currentPhase !== "idle";
}

const restartButton =
$("#scenarioRestart");

if (restartButton) {
restartButton.hidden =
currentPhase === "idle";
}

const banner =
$("#scenarioBanner");

if (banner) {
banner.hidden =
currentPhase === "idle";

const messages = {
waiting:
"El entorno está en observación. Una alerta puede llegar en cualquier momento.",

attack:
"ALERTA CRÍTICA · Cifrado detectado en FIN-014. Analiza la evidencia y determina qué proceso detener y qué equipo aislar.",

lost:
"El ransomware se propagó. Tiempo agotado: revisa las pistas y reinicia el ejercicio.",

won:
"Amenaza contenida: identificaste el proceso y aislaste el equipo correcto."
};

banner.textContent =
messages[currentPhase] ||
"";
}

const modal =
$("#scenarioModal");

if (
modal &&
currentPhase ===
"attack" &&
!sessionStorage.getItem(
"nerium-alert-seen-" +
state.started
)
) {
prepareRansomwareAlert(
modal
);

modal.hidden = false;

modal.removeAttribute(
"inert"
);
}

if (
modal &&
currentPhase !==
"attack"
) {
modal.hidden = true;
}

document
.querySelectorAll(
"[data-evidence]"
)
.forEach(
(element) => {
element.classList.toggle(
"is-found",
Boolean(
state
?.evidence
?.includes(
element.dataset
.evidence
)
)
);
}
);

const evidenceCount =
$("#evidenceCount");

if (evidenceCount) {
evidenceCount.textContent =
`${
state
?.evidence
?.length || 0
}/3 pistas verificadas`;
}

const submitButton =
$("#scenarioSubmit");

if (submitButton) {
submitButton.disabled =
currentPhase !==
"attack" ||
(
state
?.evidence
?.length || 0
) < 3;
}

document
.querySelectorAll(
"[data-locked]"
)
.forEach(
(element) => {
element.disabled =
currentPhase !==
"attack";
}
);
}

document.addEventListener(
"click",
(event) => {
state = read();

if (
event.target.closest(
"#scenarioStart"
)
) {
showInstructions();
return;
}

if (
event.target.closest(
"#scenarioRestart"
)
) {
showInstructions();
return;
}

if (
event.target.closest(
"#scenarioEndGame"
)
) {
event.preventDefault();

const confirmed =
window.confirm(
"¿Seguro que deseas terminar el juego? Se perderá el progreso de esta partida."
);

if (!confirmed) {
return;
}

window.neriumAmbiente
?.stop?.();

if (state?.started) {
sessionStorage.removeItem(
"nerium-alert-seen-" +
state.started
);

sessionStorage.removeItem(
"nerium-loss-seen-" +
state.started
);
}

sessionStorage.removeItem(
"nerium-ambiente-posicion"
);

sessionStorage.removeItem(
"nerium-ambiente-momento"
);

localStorage.removeItem(
KEY
);

window.location.href =
"Inicio.html";

return;
}

if (
event.target.closest(
"#scenarioBeginMission"
)
) {
sessionStorage.setItem(
"nerium-ambiente-activo",
"1"
);

if (state?.started) {
sessionStorage.removeItem(
"nerium-alert-seen-" +
state.started
);
}

const instructions =
$("#scenarioInstructions");

if (instructions) {
instructions.hidden =
true;
}

start();
return;
}

if (
event.target.closest(
"#lossRetry"
)
) {
if (state?.started) {
sessionStorage.removeItem(
"nerium-loss-seen-" +
state.started
);
}

localStorage.removeItem(
KEY
);

sessionStorage.setItem(
"nerium-open-instructions",
"1"
);

window.location.href =
"Simulador.html";

return;
}

if (
event.target.closest(
"#lossDashboard"
)
) {
window.location.href =
"Simulador.html";

return;
}

if (
event.target.closest(
"#scenarioDismiss"
)
) {
sessionStorage.setItem(
"nerium-alert-seen-" +
state.started,
"1"
);

const modal =
$("#scenarioModal");

if (modal) {
modal.hidden =
true;
}

location.href =
"Alerts.html";
}

const clue =
event.target.closest(
"[data-evidence]"
);

if (
clue &&
phase() === "attack"
) {
const id =
clue.dataset.evidence;

state.evidence ||= [];

if (
!state.evidence.includes(
id
)
) {
state.evidence.push(
id
);

save();
}

notice(
clue.dataset.detail
);
}

if (
event.target.closest(
"#scenarioSubmit"
)
) {
if (
phase() !== "attack" ||
(
state.evidence
?.length || 0
) < 3
) {
return;
}

const process =
$("#choiceProcess")
?.value;

const host =
$("#choiceHost")
?.value;

const reason =
$("#choiceReason")
?.value;

if (
!process ||
!host ||
!reason
) {
notice(
"Selecciona proceso, equipo y razón. Comprueba las tres pistas antes de actuar."
);

return;
}

if (
process ===
"powershell" &&
host ===
"fin014" &&
reason ===
"chain"
) {
state.resolved =
true;

save();

notice(
"Contención confirmada: powershell.exe detenido y FIN-014 aislado antes de la propagación."
);

} else {
state.mistakes =
(
state.mistakes ||
0
) + 1;

state.deadline -=
25000;

save();

notice(
"La acción no detuvo el cifrado. Perdiste 25 segundos. " +
"Revisa el proceso padre, la secuencia temporal y la conexión de red. " +
`Intentos fallidos: ${state.mistakes}.`
);
}
}
}
);

createInstructionsModal();
createLossModal();

if (
sessionStorage.getItem(
"nerium-open-instructions"
) === "1"
) {
sessionStorage.removeItem(
"nerium-open-instructions"
);

showInstructions();
}

setInterval(
render,
250
);

render();
})();


/* =========================================================
MÚSICA AMBIENTAL DE LA MISIÓN
Archivo: Audio/Ambiente.mp3
========================================================= */

(() => {
"use strict";

const STORAGE_KEY =
"nerium-fin014-v1";

const POSITION_KEY =
"nerium-ambiente-posicion";

const POSITION_TIME_KEY =
"nerium-ambiente-momento";

const WAIT_TIME = 20000;
const AMBIENT_VOLUME = 0.08;

const ambiente = new Audio(
"Audio/Ambiente.mp3"
);

ambiente.loop = true;
ambiente.preload = "auto";
ambiente.volume = AMBIENT_VOLUME;

function leerEstadoMusica() {
try {
return JSON.parse(
localStorage.getItem(
STORAGE_KEY
)
);
} catch {
return null;
}
}

function misionEnCurso() {
const estado =
leerEstadoMusica();

const ambienteAutorizado =
sessionStorage.getItem(
"nerium-ambiente-activo"
) === "1";

if (
!ambienteAutorizado ||
!estado ||
!estado.started ||
estado.resolved ||
Date.now() >= estado.deadline
) {
return false;
}

return (
Date.now() >=
estado.started + WAIT_TIME
);
}

function guardarPosicionMusica() {
if (
ambiente.paused ||
!Number.isFinite(
ambiente.currentTime
)
) {
return;
}

sessionStorage.setItem(
POSITION_KEY,
String(
ambiente.currentTime
)
);

sessionStorage.setItem(
POSITION_TIME_KEY,
String(Date.now())
);
}

function restaurarPosicionMusica() {
const posicionGuardada =
Number(
sessionStorage.getItem(
POSITION_KEY
)
) || 0;

const momentoGuardado =
Number(
sessionStorage.getItem(
POSITION_TIME_KEY
)
) || Date.now();

const segundosTranscurridos =
Math.max(
0,
(
Date.now() -
momentoGuardado
) / 1000
);

let nuevaPosicion =
posicionGuardada +
segundosTranscurridos;

if (
Number.isFinite(
ambiente.duration
) &&
ambiente.duration > 0
) {
nuevaPosicion =
nuevaPosicion %
ambiente.duration;
}

if (
Number.isFinite(
nuevaPosicion
)
) {
ambiente.currentTime =
Math.max(
0,
nuevaPosicion
);
}
}

async function reproducirAmbiente() {
if (!misionEnCurso()) {
return;
}

if (!ambiente.paused) {
return;
}

ambiente.volume =
AMBIENT_VOLUME;

try {
await ambiente.play();
} catch {
// Si el navegador bloquea el audio,
// comenzará con la primera interacción.
}
}

function detenerAmbiente(
borrarPosicion = true
) {
ambiente.pause();

if (borrarPosicion) {
sessionStorage.removeItem(
POSITION_KEY
);

sessionStorage.removeItem(
POSITION_TIME_KEY
);
}
}

function actualizarAmbiente() {
if (misionEnCurso()) {
reproducirAmbiente();
return;
}

detenerAmbiente(true);
}

ambiente.addEventListener(
"loadedmetadata",
function () {
restaurarPosicionMusica();
actualizarAmbiente();
}
);

document.addEventListener(
"pointerdown",
reproducirAmbiente
);

document.addEventListener(
"keydown",
reproducirAmbiente
);

document.addEventListener(
"visibilitychange",
function () {
if (document.hidden) {
guardarPosicionMusica();
return;
}

restaurarPosicionMusica();
actualizarAmbiente();
}
);

window.addEventListener(
"pagehide",
guardarPosicionMusica
);

window.addEventListener(
"beforeunload",
guardarPosicionMusica
);

window.addEventListener(
"storage",
function (event) {
if (
event.key === STORAGE_KEY
) {
actualizarAmbiente();
}
}
);

setInterval(
function () {
actualizarAmbiente();

if (!ambiente.paused) {
guardarPosicionMusica();
}
},
500
);

window.neriumAmbiente = {
play: reproducirAmbiente,

pause: function () {
guardarPosicionMusica();
ambiente.pause();
},

stop: detenerAmbiente,

setVolume: function (volumen) {
ambiente.volume =
Math.min(
1,
Math.max(
0,
Number(volumen) || 0
)
);
}
};

actualizarAmbiente();
})();


/* =====================================================
SISTEMA DE PISTAS DINÁMICAS
Cada pista descuenta 5 segundos
===================================================== */

document.addEventListener(
"DOMContentLoaded",
function () {
"use strict";

const STORAGE_KEY =
"nerium-fin014-v1";

const PENALIZACION_PISTA =
5000;

const rutaActual =
window.location.pathname
.toLowerCase()
.replace(/\\/g, "/");

function leerEstado() {
try {
return JSON.parse(
localStorage.getItem(
STORAGE_KEY
)
);
} catch {
return null;
}
}

function guardarEstado(
estado
) {
if (!estado) return;

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(
estado
)
);
}

function escenarioActual() {

if (
rutaActual.includes(
"remoteops"
)
) {
return "remoteops";
}

if (
rutaActual.includes(
"graph-explorer"
) ||
rutaActual.includes(
"graph"
)
) {
return "graph";
}

if (
rutaActual.includes(
"inventory"
)
) {
return "inventory";
}

if (
rutaActual.includes(
"event"
)
) {
return "event";
}

if (
rutaActual.includes(
"alerts"
)
) {
return "alerts";
}

if (
rutaActual.includes(
"simulador"
)
) {
return "simulador";
}

return null;
}

function crearPista(
id,
titulo,
mensajes
) {
return {
id,
titulo,
mensajes
};
}

function pistaSegunProgreso(
estado
) {
const escenario =
escenarioActual();

const evidencia =
estado?.evidence || [];

if (
escenario ===
"alerts"
) {
if (
!evidencia.includes(
"alert"
)
) {
return crearPista(
"alerts-hipotesis",
"Analiza la alerta",
[
"Revisa la línea de tiempo y busca qué actividad ocurrió antes del cifrado.",

"Compara el documento abierto, la ejecución del proceso y el inicio del cifrado.",

"Selecciona la hipótesis que conecta los eventos en una misma secuencia.",

"Marca la opción relacionada con la cadena completa del ataque y presiona Registrar hipótesis.",

"Busca la opción de cadena del ataque; después pulsa Registrar hipótesis."
]
);
}

if (
!estado?.isolated
) {
return crearPista(
"alerts-aislar",
"Contén la propagación",
[
"La hipótesis ya está registrada. Ahora evita que el equipo afectado siga comunicándose.",

"Abre las opciones de mitigación y busca una acción dirigida al endpoint comprometido.",

"La acción debe cortar la comunicación de FIN-014 sin borrar todavía la evidencia.",

"En Mitigate, selecciona la acción para aislar el endpoint FIN-014.",

"Presiona Mitigate y después la opción Isolate endpoint."
]
);
}

return crearPista(
"alerts-continuar",
"Continúa la investigación",
[
"FIN-014 ya está aislado. El siguiente paso es investigar el proceso responsable.",

"Busca el botón que permite continuar con la investigación de eventos.",

"La siguiente sección del recorrido es Event Search.",

"Presiona el botón para continuar a Event Search.",

"Pulsa Continue investigation o el enlace Event Search."
]
);
}

if (
escenario ===
"event"
) {
const validados =
estado
?.eventValidated ||
[];

const faltantes = [
"document",
"powershell",
"cipher"
].filter(
(id) =>
!validados.includes(
id
)
);

if (
faltantes.length
) {
const siguiente =
faltantes[0];

const datos = {
document: [
"el inicio de la cadena",
"el documento abierto en FIN-014",
"la fila de Factura_Q3.docm"
],

powershell: [
"el proceso que ejecutó un comando codificado",
"PowerShell en FIN-014",
"la fila del comando PowerShell codificado"
],

cipher: [
"la consecuencia posterior al comando",
"el evento de cifrado de Finanzas",
"la fila del archivo cifrado"
]
}[siguiente];

return crearPista(
"event-" +
siguiente,
"Verifica el siguiente evento",
[
`Ya llevas ${validados.length} de 3 eventos. Busca ${datos[0]}.`,

`Compara los horarios y localiza ${datos[1]}.`,

`El siguiente evento correcto está relacionado con ${datos[2]}.`,

`Marca la casilla de ${datos[2]} y abre Actions.`,

`Selecciona ${datos[2]} y presiona Investigate.`
]
);
}

if (
!estado
?.processIdentified
) {
return crearPista(
"event-proceso",
"Identifica el proceso",
[
"Los tres eventos ya están verificados. Ahora determina qué proceso ejecutó el comando.",

"Revisa el evento que aparece entre el documento abierto y el cifrado.",

"El proceso sospechoso es el intérprete que ejecutó el comando codificado.",

"En Suspect process selecciona PowerShell.",

"Selecciona powershell.exe y presiona Confirmar proceso."
]
);
}

return crearPista(
"event-continuar",
"Comprueba el alcance",
[
"El proceso ya fue identificado. Ahora debes revisar los equipos involucrados.",

"Continúa hacia el inventario de endpoints.",

"La siguiente sección es Inventory.",

"Presiona el enlace para continuar a Inventory.",

"Pulsa Continue to Inventory."
]
);
}

if (
escenario ===
"inventory"
) {
const analizados =
estado
?.inventoryScanned ||
[];

if (
!analizados.includes(
"FIN-014"
)
) {
return crearPista(
"inventory-fin014",
"Analiza el equipo de origen",
[
"Comienza por el endpoint donde se detectó el cifrado.",

"Busca el equipo que ya fue aislado en Alerts.",

"Abre los detalles de FIN-014.",

"Selecciona la fila FIN-014 y abre su panel lateral.",

"En FIN-014 presiona Scan endpoint."
]
);
}

if (
!analizados.includes(
"FIN-021"
)
) {
return crearPista(
"inventory-fin021",
"Compara el segundo equipo",
[
"FIN-014 ya fue analizado. Ahora revisa el destino de su conexión SMB.",

"Busca el equipo que recibió la conexión desde FIN-014.",

"Abre los detalles de FIN-021.",

"Selecciona la fila FIN-021 y abre su panel lateral.",

"En FIN-021 presiona Scan endpoint."
]
);
}

if (
!estado
?.inventoryVerified
) {
return crearPista(
"inventory-verificar",
"Confirma el alcance",
[
"Ya analizaste ambos equipos. Compara dónde hubo cifrado y dónde solo hubo conexión.",

"Identifica el origen del cifrado usando el orden de los eventos.",

"FIN-014 mostró cifrado; FIN-021 únicamente recibió la conexión.",

"Selecciona la conclusión de origen y la evidencia basada en la secuencia.",

"Elige FIN-014 como origen y la secuencia temporal como evidencia; después confirma."
]
);
}

return crearPista(
"inventory-continuar",
"Reconstruye la cadena",
[
"El alcance ya está confirmado. Ahora relaciona visualmente todos los eventos.",

"Continúa hacia el explorador de relaciones.",

"La siguiente sección es Graph Explorer.",

"Presiona el enlace para abrir Graph Explorer.",

"Pulsa Continue to Graph Explorer."
]
);
}

if (
escenario ===
"graph"
) {
const investigados =
estado
?.graphInvestigated ||
[];

const orden = [
"document",
"powershell",
"cipher",
"network"
];

const faltante =
orden.find(
(id) =>
!investigados.includes(
id
)
);

if (faltante) {
const nombres = {
document:
"Factura_Q3.docm abierto en FIN-014",

powershell:
"PowerShell codificado ejecutado",

cipher:
"archivos financieros cifrados",

network:
"conexión SMB enviada a FIN-021"
};

return crearPista(
"graph-" +
faltante,
"Investiga el siguiente nodo",
[
`Llevas ${investigados.length} de 4 nodos. Sigue el orden temporal de la cadena.`,

`El siguiente nodo está relacionado con ${nombres[faltante]}.`,

`Busca en el grafo el nodo ${nombres[faltante]}.`,

`Selecciona el nodo ${nombres[faltante]} y abre sus detalles.`,

`Haz clic en ${nombres[faltante]} y después en Investigate node.`
]
);
}

if (
!estado
?.graphVerified
) {
return crearPista(
"graph-verificar",
"Confirma la secuencia",
[
"Los cuatro nodos ya están investigados. Ahora interpreta su orden y conclusión.",

"La secuencia comienza con el documento y termina con la conexión SMB.",

"La conexión a FIN-021 no demuestra que ese equipo también haya cifrado archivos.",

"Selecciona la secuencia cronológica y la conclusión de equipo expuesto sin cifrado confirmado.",

"Elige Documento → PowerShell → Cifrado → SMB y FIN-021 expuesto; después confirma."
]
);
}

return crearPista(
"graph-continuar",
"Ejecuta la respuesta final",
[
"La cadena ya está confirmada. Ahora debes detener el proceso responsable.",

"Continúa hacia las acciones remotas.",

"La siguiente sección es RemoteOps.",

"Presiona el enlace para abrir RemoteOps.",

"Pulsa Continue to RemoteOps."
]
);
}

if (
escenario ===
"remoteops"
) {
if (
!estado
?.remoteCollected
) {
return crearPista(
"remote-collect",
"Recopila indicadores",
[
"Antes de detener el proceso, conserva evidencia de lo ocurrido.",

"Busca un script de recopilación relacionado con ransomware.",

"El script que necesitas menciona Ransomware Indicators.",

"Localiza la fila Collect Ransomware Indicators en Library.",

"Presiona el triángulo de Actions junto a Collect Ransomware Indicators."
]
);
}

if (
!estado
?.remoteStopped
) {
return crearPista(
"remote-stop",
"Detén el proceso",
[
"La evidencia ya fue recopilada. Ahora detén el proceso sospechoso.",

"Busca un script de acción relacionado con PowerShell.",

"El script correcto menciona Suspicious PowerShell.",

"Escribe Stop Suspicious PowerShell en el buscador.",

"Presiona el triángulo de Actions junto a Stop Suspicious PowerShell."
]
);
}

if (
!estado?.resolved
) {
return crearPista(
"remote-verify",
"Verifica la contención",
[
"El proceso ya fue detenido. Confirma el equipo y la evidencia final.",

"El resultado debe comprobar que el origen permanece aislado y sin nuevas escrituras.",

"Confirma el resultado en el equipo donde comenzó el cifrado.",

"Selecciona FIN-014 y la evidencia que menciona PowerShell detenido y sin archivos .locked nuevos.",

"Elige FIN-014, selecciona la primera evidencia y presiona Confirmar contención."
]
);
}

return crearPista(
"remote-final",
"Incidente contenido",
[
"La misión ya terminó correctamente.",

"Puedes revisar el resultado final o volver al dashboard.",

"Busca el botón para regresar al dashboard.",

"Presiona Volver al dashboard.",

"La simulación está completa; pulsa Volver al dashboard."
]
);
}

if (
escenario ===
"simulador"
) {
if (!estado) {
return crearPista(
"simulador-iniciar",
"Inicia la simulación",
[
"Primero debes comenzar el ejercicio.",

"Busca el control que inicia el incidente.",

"El botón se encuentra en el dashboard principal.",

"Presiona Iniciar simulación.",

"Haz clic en el botón Iniciar simulación."
]
);
}

if (
Date.now() <
estado.started +
20000
) {
return crearPista(
"simulador-esperar",
"Espera la alerta",
[
"El monitoreo ya comenzó. Mantente atento a una alerta.",

"La alerta aparecerá automáticamente después de unos segundos.",

"No necesitas presionar otra opción todavía.",

"Espera a que el contador de alerta llegue a cero.",

"Cuando aparezca la ventana crítica, presiona Revisar alerta."
]
);
}

return crearPista(
"simulador-alerta",
"Abre la alerta",
[
"El incidente ya comenzó. Revisa la alerta crítica.",

"Busca el aviso de cifrado detectado en FIN-014.",

"Abre la ventana o módulo de Alerts.",

"Presiona Revisar alerta para comenzar la investigación.",

"Haz clic en Revisar alerta; te llevará a Alerts."
]
);
}

return null;
}

function indiceDePista(
estado,
pista
) {
if (!estado) {
const clave =
"nerium-hint-" +
pista.id;

const cantidad =
Number(
sessionStorage.getItem(
clave
) || 0
);

const total =
pista.mensajes
.length;

const nivel =
cantidad + 1;

const indice =
nivel < total
? nivel
: total -
2 +
(
(
nivel -
total
) %
2
);

sessionStorage.setItem(
clave,
String(
cantidad + 1
)
);

return Math.max(
0,
indice
);
}

estado.hintProgress ||= {};

const cantidad =
estado.hintProgress[
pista.id
] || 0;

const total =
pista.mensajes.length;

const nivel =
cantidad + 1;

let indice;

if (nivel < total) {
indice =
nivel;
} else {
indice =
total -
2 +
(
(
nivel -
total
) %
2
);
}

estado.hintProgress[
pista.id
] =
cantidad + 1;

return Math.max(
0,
indice
);
}

function descontarTiempo(
estado
) {
if (
!estado ||
!estado.deadline
) {
return false;
}

if (
estado.resolved ||
Date.now() >=
estado.deadline
) {
return false;
}

estado.deadline -=
PENALIZACION_PISTA;

estado.hintsUsed =
(
estado.hintsUsed ||
0
) + 1;

guardarEstado(
estado
);

return true;
}

function crearEstilos() {
const estilos =
document.createElement(
"style"
);

estilos.textContent = `
.hint-button {
position: fixed;
right: 22px;
bottom: 22px;
z-index: 9998;
display: flex;
align-items: center;
gap: 8px;
min-height: 44px;
padding: 0 18px;
border: 1px solid #9d70ff;
border-radius: 8px;
background: #35105e;
color: #ffffff;
font-family: inherit;
font-size: 14px;
font-weight: 700;
cursor: pointer;

box-shadow:
0 8px 25px
rgba(
53,
16,
94,
0.28
);

transition:
transform 160ms ease,
background 160ms ease;
}

.hint-button:hover {
background: #7b2ff7;
transform:
translateY(-2px);
}

.hint-button:active {
transform:
translateY(0);
}

.hint-button-icon {
font-size: 18px;
}

.hint-overlay {
position: fixed;
inset: 0;
z-index: 9999;
display: grid;
place-items: center;
padding: 20px;

background:
rgba(
12,
8,
20,
0.68
);

backdrop-filter:
blur(3px);
}

.hint-overlay[hidden] {
display: none;
}

.hint-modal {
width:
min(
440px,
100%
);

padding: 28px;

border:
1px solid
#a87cff;

border-radius:
14px;

background:
#ffffff;

color:
#1f1729;

box-shadow:
0 22px 60px
rgba(
0,
0,
0,
0.3
);
}

.hint-modal-label {
display: block;
margin-bottom: 8px;
color: #7b2ff7;
font-size: 12px;
font-weight: 800;
letter-spacing: 1px;
}

.hint-modal h2 {
margin:
0 0 14px;

font-size:
23px;

color:
#35105e;
}

.hint-modal p {
margin: 0;
font-size: 15px;
line-height: 1.6;
}

.hint-penalty {
display: block;

margin-top:
16px;

padding:
10px 12px;

border-radius:
7px;

background:
#fff2f5;

color:
#a31538;

font-size:
13px;

font-weight:
700;
}

.hint-close {
width: 100%;

min-height:
42px;

margin-top:
20px;

border: 0;

border-radius:
7px;

background:
#7b2ff7;

color:
#ffffff;

font-family:
inherit;

font-weight:
700;

cursor:
pointer;
}

.hint-close:hover {
background:
#35105e;
}

@media (
max-width: 700px
) {
.hint-button {
right: 14px;
bottom: 14px;
padding:
0 14px;
}

.hint-modal {
padding:
22px;
}
}
`;

document.head.appendChild(
estilos
);
}

function crearVentanaPista() {
const ventana =
document.createElement(
"div"
);

ventana.className =
"hint-overlay";

ventana.id =
"scenarioHintOverlay";

ventana.hidden =
true;

ventana.innerHTML = `
<section
class="hint-modal"
role="dialog"
aria-modal="true"
aria-labelledby="scenarioHintTitle"
>
<span
class="hint-modal-label"
>
AYUDA DEL SIMULADOR
</span>

<h2
id="scenarioHintTitle"
>
Pista
</h2>

<p
id="scenarioHintText"
></p>

<span
class="hint-penalty"
id="scenarioHintPenalty"
></span>

<button
class="hint-close"
id="scenarioHintClose"
type="button"
>
Entendido
</button>
</section>
`;

document.body.appendChild(
ventana
);

const closeButton =
document.querySelector(
"#scenarioHintClose"
);

closeButton
?.addEventListener(
"click",
function () {
ventana.hidden =
true;
}
);

ventana.addEventListener(
"click",
function (event) {
if (
event.target ===
ventana
) {
ventana.hidden =
true;
}
}
);

document.addEventListener(
"keydown",
function (event) {
if (
event.key ===
"Escape"
) {
ventana.hidden =
true;
}
}
);
}

function crearBotonPista() {
const boton =
document.createElement(
"button"
);

boton.type =
"button";

boton.className =
"hint-button";

boton.id =
"scenarioHintButton";

boton.innerHTML = `
<span
class="hint-button-icon"
>
💡
</span>

<span>
Pista
</span>

<small>
−5 s
</small>
`;

boton.setAttribute(
"aria-label",
"Mostrar pista. Penalización de cinco segundos"
);

boton.addEventListener(
"click",
function () {
const estado =
leerEstado();

const pista =
pistaSegunProgreso(
estado
);

if (!pista) {
return;
}

const indice =
indiceDePista(
estado,
pista
);

const texto =
pista.mensajes[
indice
];

if (estado) {
guardarEstado(
estado
);
}

const tiempoDescontado =
descontarTiempo(
estado
);

const title =
document.querySelector(
"#scenarioHintTitle"
);

const text =
document.querySelector(
"#scenarioHintText"
);

const penalty =
document.querySelector(
"#scenarioHintPenalty"
);

const overlay =
document.querySelector(
"#scenarioHintOverlay"
);

if (title) {
title.textContent =
pista.titulo;
}

if (text) {
text.textContent =
texto;
}

if (penalty) {
penalty.textContent =
tiempoDescontado
? "Se descontaron 5 segundos del cronómetro."
: "La pista está disponible, pero el cronómetro no está activo.";
}

if (overlay) {
overlay.hidden =
false;
}
}
);

document.body.appendChild(
boton
);
}

if (!escenarioActual()) {
return;
}

crearEstilos();
crearVentanaPista();
crearBotonPista();
}
);


/* =====================================================
BLOQUEO DE NAVEGACIÓN DEL SIMULADOR
- Antes de iniciar: solamente Dashboard
- Durante los 20 segundos: solamente Dashboard
- Durante la misión: únicamente las páginas del juego
- Las demás secciones permanecen bloqueadas
===================================================== */

(() => {
"use strict";

const STORAGE_KEY =
"nerium-fin014-v1";

const WAIT_TIME = 20000;

const GAME_ROUTES = new Set([
"dashboard",
"alerts",
"event-search",
"inventory",
"graph-explorer",
"remoteops"
]);

function readNavigationState() {
try {
return JSON.parse(
localStorage.getItem(
STORAGE_KEY
)
);
} catch {
return null;
}
}

function normalizeRoute(link) {
const configuredRoute =
link.dataset.route;

if (configuredRoute) {
return configuredRoute
.toLowerCase()
.trim();
}

const href =
link.getAttribute("href") || "";

const fileName = href
.split("?")[0]
.split("#")[0]
.split("/")
.pop()
.toLowerCase();

const routeByFile = {
"simulador.html": "dashboard",
"alerts.html": "alerts",
"event-search.html": "event-search",
"inventory.html": "inventory",
"graph-explorer.html": "graph-explorer",
"remoteops.html": "remoteops",
"vulnerabilities.html": "vulnerabilities",
"misconfigurations.html": "misconfigurations",
"activities.html": "activities",
"detections.html": "detections",
"agent-management.html": "agent-management",
"reports.html": "reports",
"policies-settings.html": "policies-settings"
};

return routeByFile[fileName] ||
fileName.replace(/\.html?$/, "");
}

function navigationPhase() {
const navigationState =
readNavigationState();

if (!navigationState?.started) {
return "idle";
}

if (
Date.now() <
Number(navigationState.started) +
WAIT_TIME
) {
return "waiting";
}

return "active";
}

function isRouteLocked(
route,
currentPhase
) {
if (route === "dashboard") {
return false;
}

if (!GAME_ROUTES.has(route)) {
return true;
}

return currentPhase !== "active";
}

function lockReason(route) {
const currentPhase =
navigationPhase();

if (!GAME_ROUTES.has(route)) {
return "Esta sección no forma parte de la misión.";
}

if (currentPhase === "waiting") {
return "Espera a que termine el conteo de 20 segundos y aparezca la alerta.";
}

return "Primero presiona Reiniciar juego para comenzar la misión.";
}

function createNavigationStyles() {
if (
document.getElementById(
"scenarioNavigationLockStyles"
)
) {
return;
}

const style =
document.createElement("style");

style.id =
"scenarioNavigationLockStyles";

style.textContent = `
.side-link.is-scenario-locked {
position: relative;
opacity: 0.46;
cursor: not-allowed !important;
filter: grayscale(0.35);
user-select: none;
}

.side-link.is-scenario-locked:hover {
background: transparent !important;
color: inherit !important;
}

.side-link.is-scenario-locked::after {
content: "🔒";
margin-left: auto;
padding-left: 8px;
font-size: 11px;
line-height: 1;
filter: none;
}

.scenario-navigation-notice {
position: fixed;
z-index: 12000;
left: 50%;
bottom: 24px;
width: min(460px, calc(100% - 32px));
padding: 13px 18px;
border: 1px solid #9d70ff;
border-radius: 10px;
background: #27113f;
color: #ffffff;
box-shadow: 0 14px 35px rgba(20, 8, 34, 0.28);
font-size: 14px;
font-weight: 700;
line-height: 1.4;
text-align: center;
transform: translate(-50%, 18px);
opacity: 0;
pointer-events: none;
transition: opacity 180ms ease,
transform 180ms ease;
}

.scenario-navigation-notice.is-visible {
opacity: 1;
transform: translate(-50%, 0);
}
`;

document.head.appendChild(style);
}

let noticeTimer = null;

function showNavigationNotice(message) {
let notice =
document.getElementById(
"scenarioNavigationNotice"
);

if (!notice) {
notice =
document.createElement("div");

notice.id =
"scenarioNavigationNotice";

notice.className =
"scenario-navigation-notice";

notice.setAttribute(
"role",
"status"
);

document.body.appendChild(notice);
}

notice.textContent = message;
notice.classList.add("is-visible");

clearTimeout(noticeTimer);

noticeTimer = setTimeout(
function () {
notice.classList.remove(
"is-visible"
);
},
2600
);
}

function updateNavigationLocks() {
const currentPhase =
navigationPhase();

document
.querySelectorAll("a.side-link")
.forEach(function (link) {
const route =
normalizeRoute(link);

const locked =
isRouteLocked(
route,
currentPhase
);

link.classList.toggle(
"is-scenario-locked",
locked
);

link.setAttribute(
"aria-disabled",
String(locked)
);

if (locked) {
link.dataset.scenarioLockReason =
lockReason(route);

link.setAttribute(
"tabindex",
"-1"
);
} else {
delete link.dataset
.scenarioLockReason;

link.removeAttribute(
"aria-disabled"
);

link.removeAttribute(
"tabindex"
);
}
});
}

document.addEventListener(
"click",
function (event) {
const link =
event.target.closest(
"a.side-link"
);

if (
!link ||
!link.classList.contains(
"is-scenario-locked"
)
) {
return;
}

event.preventDefault();
event.stopImmediatePropagation();

showNavigationNotice(
link.dataset
.scenarioLockReason ||
"Esta sección está bloqueada durante la misión."
);
},
true
);

function initializeNavigationLock() {
createNavigationStyles();
updateNavigationLocks();

setInterval(
updateNavigationLocks,
250
);
}

if (
document.readyState === "loading"
) {
document.addEventListener(
"DOMContentLoaded",
initializeNavigationLock,
{ once: true }
);
} else {
initializeNavigationLock();
}
})();


/* =========================================================
SISTEMA DE PRESIÓN · ERRORES + CUENTA REGRESIVA
========================================================= */

document.addEventListener(
"DOMContentLoaded",
function () {
"use strict";

const STORAGE_KEY =
"nerium-fin014-v1";

let ultimoNumeroErrores =
0;

let errorInicializado =
false;

let timeoutError =
null;

let ultimoSegundoCritico =
null;

const estilosPresion =
document.createElement(
"style"
);

estilosPresion.textContent = `

#scenarioPressureOverlay {
position: fixed;
inset: 0;
z-index: 9990;
pointer-events: none;
opacity: 0;
border: 0 solid transparent;
box-shadow:
inset 0 0 0
transparent;
}

body.scenario-error-flash
#scenarioPressureOverlay {
animation:
scenarioErrorFlash
0.75s ease-out;
}

body.scenario-error-flash
.main-content {
animation:
scenarioErrorShake
0.42s ease;
}

body.scenario-error-flash
#scenarioTimer {
animation:
scenarioTimerError
0.55s ease;
}

@keyframes scenarioErrorFlash {
0% {
opacity: 0;
background:
transparent;

box-shadow:
inset 0 0 0
rgba(
225,
32,
66,
0
);
}

15% {
opacity: 1;

background:
rgba(
210,
15,
50,
0.18
);

box-shadow:
inset 0 0 75px
rgba(
230,
20,
55,
0.72
);
}

35% {
opacity:
0.35;
}

52% {
opacity:
0.9;

background:
rgba(
210,
15,
50,
0.10
);

box-shadow:
inset 0 0 55px
rgba(
230,
20,
55,
0.48
);
}

100% {
opacity: 0;

background:
transparent;

box-shadow:
inset 0 0 0
rgba(
230,
20,
55,
0
);
}
}

@keyframes scenarioErrorShake {
0%,
100% {
transform:
translateX(0);
}

20% {
transform:
translateX(-5px);
}

40% {
transform:
translateX(5px);
}

60% {
transform:
translateX(-3px);
}

80% {
transform:
translateX(3px);
}
}

@keyframes scenarioTimerError {
0%,
100% {
transform:
scale(1);
}

35% {
transform:
scale(1.16);

background:
#c41635;

color:
#ffffff;

box-shadow:
0 0 0 4px
rgba(
227,
38,
75,
0.20
),
0 0 22px
rgba(
227,
38,
75,
0.65
);
}
}

body.pressure-warning
#scenarioPressureOverlay {
opacity: 1;

box-shadow:
inset 0 0 38px
rgba(
255,
119,
0,
0.14
);

animation:
pressureWarningPulse
2.8s
ease-in-out
infinite;
}

body.pressure-warning
#scenarioTimer {
color:
#ffd2a3
!important;

box-shadow:
0 0 0 1px
rgba(
255,
149,
44,
0.28
);
}

@keyframes pressureWarningPulse {
0%,
100% {
opacity:
0.32;
}

50% {
opacity:
0.82;
}
}

body.pressure-critical
#scenarioPressureOverlay {
opacity: 1;

box-shadow:
inset 0 0 60px
rgba(
219,
33,
66,
0.24
);

animation:
pressureCriticalPulse
1.45s
ease-in-out
infinite;
}

body.pressure-critical
#scenarioTimer {
background:
#6f1830
!important;

color:
#ffffff
!important;

box-shadow:
0 0 0 1px
rgba(
255,
92,
116,
0.35
),
0 0 15px
rgba(
216,
30,
64,
0.32
);

animation:
scenarioTimerCritical
1.45s
ease-in-out
infinite;
}

@keyframes pressureCriticalPulse {
0%,
100% {
opacity:
0.38;
}

50% {
opacity:
1;
}
}

@keyframes scenarioTimerCritical {
0%,
100% {
transform:
scale(1);
}

50% {
transform:
scale(1.055);
}
}

body.pressure-emergency
#scenarioPressureOverlay {
opacity: 1;

box-shadow:
inset 0 0 90px
rgba(
219,
20,
57,
0.36
);

animation:
pressureEmergencyPulse
0.72s
ease-in-out
infinite;
}

body.pressure-emergency
#scenarioTimer {
background:
#a31535
!important;

color:
#ffffff
!important;

box-shadow:
0 0 0 2px
rgba(
255,
72,
105,
0.30
),
0 0 22px
rgba(
214,
24,
61,
0.52
);

animation:
scenarioTimerEmergency
0.72s
ease-in-out
infinite;
}

body.pressure-emergency
.simulation-state {
border-color:
rgba(
255,
78,
105,
0.38
);

background:
rgba(
160,
20,
50,
0.18
);
}

@keyframes pressureEmergencyPulse {
0%,
100% {
opacity:
0.46;
}

50% {
opacity:
1;
}
}

@keyframes scenarioTimerEmergency {
0%,
100% {
transform:
scale(1);
}

50% {
transform:
scale(1.09);
}
}

body.pressure-final
#scenarioPressureOverlay {
opacity: 1;

background:
rgba(
155,
0,
32,
0.025
);

box-shadow:
inset 0 0 120px
rgba(
235,
15,
54,
0.52
);

animation:
pressureFinalPulse
0.36s
ease-in-out
infinite;
}

body.pressure-final
#scenarioTimer {
background:
#c31237
!important;

color:
#ffffff
!important;

box-shadow:
0 0 0 3px
rgba(
255,
66,
101,
0.28
),
0 0 30px
rgba(
229,
15,
55,
0.78
);

animation:
scenarioTimerFinal
0.36s
ease-in-out
infinite;
}

body.pressure-final
.topbar {
animation:
pressureTopbarFinal
0.72s
ease-in-out
infinite;
}

@keyframes pressureFinalPulse {
0%,
100% {
opacity:
0.50;
}

50% {
opacity:
1;
}
}

@keyframes scenarioTimerFinal {
0%,
100% {
transform:
scale(1);
}

50% {
transform:
scale(1.13);
}
}

@keyframes pressureTopbarFinal {
0%,
100% {
box-shadow:
0 0 0
rgba(
235,
16,
55,
0
);
}

50% {
box-shadow:
0 4px 26px
rgba(
235,
16,
55,
0.42
);
}
}

body.pressure-final
#scenarioTimer.scenario-second-hit {
animation:
scenarioSecondHit
0.28s ease-out;
}

@keyframes scenarioSecondHit {
0% {
transform:
scale(1);
}

45% {
transform:
scale(1.18);
}

100% {
transform:
scale(1);
}
}

@media (
prefers-reduced-motion:
reduce
) {
body.scenario-error-flash
.main-content,

body.scenario-error-flash
#scenarioTimer,

body.pressure-warning
#scenarioPressureOverlay,

body.pressure-critical
#scenarioPressureOverlay,

body.pressure-emergency
#scenarioPressureOverlay,

body.pressure-final
#scenarioPressureOverlay,

body.pressure-warning
#scenarioTimer,

body.pressure-critical
#scenarioTimer,

body.pressure-emergency
#scenarioTimer,

body.pressure-final
#scenarioTimer,

body.pressure-final
.topbar {
animation:
none
!important;
}
}
`;

document.head.appendChild(
estilosPresion
);

function crearOverlayPresion() {

if (
document.querySelector(
"#scenarioPressureOverlay"
)
) {
return;
}

const overlay =
document.createElement(
"div"
);

overlay.id =
"scenarioPressureOverlay";

overlay.setAttribute(
"aria-hidden",
"true"
);

document.body.appendChild(
overlay
);
}

crearOverlayPresion();

function leerEstado() {
try {
return JSON.parse(
localStorage.getItem(
STORAGE_KEY
)
);

} catch (error) {
return null;
}
}

function activarErrorVisual() {
const body =
document.body;

if (!body) return;

body.classList.remove(
"scenario-error-flash"
);

void body.offsetWidth;

body.classList.add(
"scenario-error-flash"
);

clearTimeout(
timeoutError
);

timeoutError =
setTimeout(
function () {
body.classList.remove(
"scenario-error-flash"
);
},
760
);
}

function limpiarPresion() {
document.body
.classList.remove(
"pressure-warning",
"pressure-critical",
"pressure-emergency",
"pressure-final"
);

document.body
.dataset
.pressure =
"normal";

ultimoSegundoCritico =
null;
}

function actualizarPresion(
estado
) {
if (
!estado ||
!estado.deadline ||
estado.resolved
) {
limpiarPresion();
return;
}

const inicioAtaque =
Number(
estado.started || 0
) + 20000;

const ahora =
Date.now();

if (
ahora < inicioAtaque ||
ahora >=
estado.deadline
) {
limpiarPresion();
return;
}

const restante =
Math.max(
0,
estado.deadline -
ahora
);

const body =
document.body;

body.classList.remove(
"pressure-warning",
"pressure-critical",
"pressure-emergency",
"pressure-final"
);

if (
restante <= 120000 &&
restante > 60000
) {
body.classList.add(
"pressure-warning"
);

body.dataset.pressure =
"warning";

return;
}

if (
restante <= 60000 &&
restante > 30000
) {
body.classList.add(
"pressure-critical"
);

body.dataset.pressure =
"critical";

return;
}

if (
restante <= 30000 &&
restante > 10000
) {
body.classList.add(
"pressure-emergency"
);

body.dataset.pressure =
"emergency";

return;
}

if (
restante <= 10000
) {
body.classList.add(
"pressure-final"
);

body.dataset.pressure =
"final";

const segundo =
Math.ceil(
restante /
1000
);

if (
segundo !==
ultimoSegundoCritico
) {
ultimoSegundoCritico =
segundo;

const timer =
document.querySelector(
"#scenarioTimer"
);

if (timer) {
timer.classList.remove(
"scenario-second-hit"
);

void timer.offsetWidth;

timer.classList.add(
"scenario-second-hit"
);

setTimeout(
function () {
timer.classList.remove(
"scenario-second-hit"
);
},
300
);
}
}

return;
}

limpiarPresion();
}

function revisarErrores(
estado
) {
const erroresActuales =
Number(
estado?.mistakes ||
0
);

if (
!errorInicializado
) {
ultimoNumeroErrores =
erroresActuales;

errorInicializado =
true;

return;
}

if (
erroresActuales >
ultimoNumeroErrores
) {
activarErrorVisual();
}

ultimoNumeroErrores =
erroresActuales;
}

function actualizarSistemaPresion() {
const estado =
leerEstado();

revisarErrores(
estado
);

actualizarPresion(
estado
);
}

setInterval(
actualizarSistemaPresion,
250
);

actualizarSistemaPresion();

window.addEventListener(
"storage",
function (event) {
if (
event.key ===
STORAGE_KEY
) {
actualizarSistemaPresion();
}
}
);
}
);