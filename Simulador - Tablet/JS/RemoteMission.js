document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const KEY = "nerium-fin014-v1";
  const $ = selector => document.querySelector(selector);
  const running = new Set();

  function saveState(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  }

  function feedback(message) {
    const element = $("#remoteMissionFeedback");

    if (!element) return;

    element.textContent = message;
    element.hidden = false;
  }

  function penalty(state, message, row) {
    state.mistakes = (state.mistakes || 0) + 1;
    state.deadline = (state.deadline || Date.now()) - 5000;

    saveState(state);

    row?.classList.add("mission-wrong");

    feedback(`${message} −5 segundos.`);

    sync();
  }

  function getScriptId(button) {
    const row = button.closest("tr");

    if (row?.dataset.scriptId) {
      return row.dataset.scriptId
        .trim()
        .toLowerCase();
    }

    return (
      $("#scriptDetailId")?.textContent || ""
    )
      .trim()
      .toLowerCase();
  }

  function sync() {
    const state = readState();

    if (!state) return;

    const collectStatus =
      $("#remoteCollectStatus");

    const stopStatus =
      $("#remoteStopStatus");

    const verifyStatus =
      $("#remoteVerifyStatus");

    const finalDecision =
      $("#remoteFinalDecision");

    const oldResult =
      $("#remoteMissionResult");

    const progressCount =
      $("#remoteProgressCount");

    const progressBar =
      $("#remoteProgressBar");

    const completedActions = [
      Boolean(state.remoteCollected),
      Boolean(state.remoteStopped),
      Boolean(state.resolved)
    ].filter(Boolean).length;

    if (progressCount) {
      progressCount.textContent =
        `${completedActions} de 3 acciones completadas`;
    }

    if (progressBar) {
      progressBar.style.width =
        `${(completedActions / 3) * 100}%`;
    }

    if (collectStatus) {
      collectStatus.textContent =
        state.remoteCollected
          ? "✓ Indicadores recopilados en FIN-014"
          : "Pendiente · recopilar indicadores";

      collectStatus.classList.toggle(
        "mission-correct",
        Boolean(state.remoteCollected)
      );
    }

    if (stopStatus) {
      stopStatus.textContent =
        state.remoteStopped
          ? "✓ PowerShell sospechoso detenido"
          : "Pendiente · detener proceso";

      stopStatus.classList.toggle(
        "mission-correct",
        Boolean(state.remoteStopped)
      );
    }

    if (verifyStatus) {
      verifyStatus.textContent =
        state.resolved
          ? "✓ Contención verificada"
          : "Pendiente · verificar contención";

      verifyStatus.classList.toggle(
        "mission-correct",
        Boolean(state.resolved)
      );
    }

    if (finalDecision) {
      finalDecision.hidden =
        !state.remoteStopped ||
        Boolean(state.resolved);
    }

    /*
     * Oculta el antiguo resultado pequeño.
     * Ahora se utilizará el cuadro grande.
     */
    if (oldResult) {
      oldResult.hidden = true;
    }

    document
      .querySelectorAll("#remoteRows tr")
      .forEach(row => {
        const id =
          row.dataset.scriptId
            ?.trim()
            .toLowerCase();

        const completed =
          (
            id === "ro-014" &&
            state.remoteCollected
          ) ||
          (
            id === "ro-015" &&
            state.remoteStopped
          );

        row.classList.toggle(
          "mission-correct",
          Boolean(completed)
        );

        if (completed) {
          row.classList.remove(
            "mission-wrong"
          );
        }
      });
  }

  document.addEventListener(
    "click",
    event => {
      const button =
        event.target.closest(
          '#btnRunDrawer, #remoteRows [data-action="run"]'
        );

      if (!button) return;

      const id = getScriptId(button);
      const row = button.closest("tr");
      const state = readState();

      if (!state) {
        event.preventDefault();
        event.stopImmediatePropagation();

        feedback(
          "Primero inicia el juego desde el Dashboard."
        );

        return;
      }

      if (!state.graphVerified) {
        event.preventDefault();
        event.stopImmediatePropagation();

        feedback(
          "Primero confirma las dos respuestas en Graph Explorer."
        );

        return;
      }

      if (Date.now() >= state.deadline) {
        event.preventDefault();
        event.stopImmediatePropagation();

        feedback(
          "El tiempo terminó. Reinicia el juego para volver a intentarlo."
        );

        return;
      }

      if (running.has(id)) {
        event.preventDefault();
        event.stopImmediatePropagation();

        feedback(
          "La ejecución ya está en proceso. Espera el resultado."
        );

        return;
      }

      if (
        id !== "ro-014" &&
        id !== "ro-015"
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        penalty(
          state,
          "Ese script no contribuye a detener el ransomware",
          row
        );

        return;
      }

      if (
        id === "ro-015" &&
        !state.remoteCollected
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        penalty(
          state,
          "Primero ejecuta Collect Ransomware Indicators",
          row
        );

        return;
      }

      if (
        id === "ro-014" &&
        state.remoteCollected
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        feedback(
          "La recopilación de indicadores ya fue completada. Ejecuta Stop Suspicious PowerShell."
        );

        return;
      }

      if (
        id === "ro-015" &&
        state.remoteStopped
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        feedback(
          "PowerShell ya fue detenido. Continúa con la verificación final."
        );

        return;
      }

      running.add(id);

      feedback(
        id === "ro-014"
          ? "Recopilando indicadores de FIN-014…"
          : "Deteniendo PowerShell sospechoso en FIN-014…"
      );

      window.setTimeout(() => {
        const latest = readState();

        running.delete(id);

        if (!latest) return;

        if (id === "ro-014") {
          latest.remoteCollected = true;

          feedback(
            "Indicadores recopilados: PowerShell codificado, archivos .locked y conexión SMB. Ahora ejecuta Stop Suspicious PowerShell."
          );
        }

        if (id === "ro-015") {
          latest.remoteStopped = true;

          feedback(
            "PowerShell detenido. Ahora selecciona el equipo afectado y la evidencia para verificar la contención."
          );
        }

        saveState(latest);
        sync();
      }, 1200);
    },
    true
  );

  $("#remoteFinish")?.addEventListener(
    "click",
    () => {
      const state = readState();

      if (!state) return;

      if (
        !state.remoteCollected ||
        !state.remoteStopped
      ) {
        feedback(
          "Completa primero las dos ejecuciones de RemoteOps."
        );

        return;
      }

      const target =
        $("#remoteTarget");

      const evidence =
        $("#remoteEvidence");

      if (
        !target?.value ||
        !evidence?.value
      ) {
        feedback(
          "Selecciona el equipo y la evidencia antes de confirmar."
        );

        return;
      }

      const correctTarget =
        target.value === "fin014";

      const correctEvidence =
        evidence.value === "correct";

      target.classList.toggle(
        "mission-correct",
        correctTarget
      );

      target.classList.toggle(
        "mission-wrong",
        !correctTarget
      );

      evidence.classList.toggle(
        "mission-correct",
        correctEvidence
      );

      evidence.classList.toggle(
        "mission-wrong",
        !correctEvidence
      );

      if (
        correctTarget &&
        correctEvidence
      ) {
        state.resolved = true;
        state.completedAt = Date.now();

        saveState(state);

        feedback(
          "Incidente contenido. FIN-014 permanece aislado y ya no se detectan nuevas escrituras cifradas."
        );

        showFinalResult(state);
      } else {
        penalty(
          state,
          "Revisa los campos marcados en rojo: la conexión hacia FIN-021 no confirma cifrado en ese equipo"
        );
      }

      sync();
    }
  );

  function formatTime(milliseconds) {
    const totalSeconds =
      Math.max(
        0,
        Math.floor(milliseconds / 1000)
      );

    const minutes =
      String(
        Math.floor(totalSeconds / 60)
      ).padStart(2, "0");

    const seconds =
      String(
        totalSeconds % 60
      ).padStart(2, "0");

    return `${minutes}:${seconds}`;
  }

  function calculateScore(
    elapsedMilliseconds,
    errors,
    hints
  ) {
    const elapsedSeconds =
      Math.floor(
        elapsedMilliseconds / 1000
      );

    let score = 100;

    score -= errors * 8;
    score -= hints * 3;

    if (elapsedSeconds <= 300) {
      score += 5;
    } else if (elapsedSeconds > 480) {
      score -= 5;
    }

    return Math.max(
      0,
      Math.min(100, score)
    );
  }

  function getPerformance(score) {
    if (score >= 90) {
      return {
        level: "Desempeño excelente",
        message:
          "Mitigaste el incidente de forma rápida, precisa y con muy poca asistencia."
      };
    }

    if (score >= 75) {
      return {
        level: "Muy buen desempeño",
        message:
          "Tomaste buenas decisiones y completaste correctamente la contención."
      };
    }

    if (score >= 60) {
      return {
        level: "Amenaza contenida",
        message:
          "Completaste el incidente, aunque algunas decisiones podrían mejorar."
      };
    }

    return {
      level: "Misión completada",
      message:
        "Lograste contener la amenaza, pero necesitas mejorar la precisión y el uso del tiempo."
    };
  }

  function createReport(
    elapsedMilliseconds,
    errors,
    hints
  ) {
    const report = [];

    const elapsedSeconds =
      Math.floor(
        elapsedMilliseconds / 1000
      );

    if (elapsedSeconds <= 300) {
      report.push(
        "Identificaste y mitigaste la amenaza con rapidez."
      );
    } else if (elapsedSeconds <= 480) {
      report.push(
        "Completaste la mitigación dentro de un tiempo adecuado."
      );
    } else {
      report.push(
        "La amenaza fue contenida, pero el proceso de investigación puede ser más rápido."
      );
    }

    if (errors === 0) {
      report.push(
        "No cometiste errores durante la investigación."
      );
    } else if (errors <= 2) {
      report.push(
        `Cometiste ${errors} ${
          errors === 1
            ? "error"
            : "errores"
        }, pero corregiste las decisiones a tiempo.`
      );
    } else {
      report.push(
        `Cometiste ${errors} errores. Conviene revisar mejor la evidencia antes de actuar.`
      );
    }

    if (hints === 0) {
      report.push(
        "Completaste el escenario sin utilizar pistas."
      );
    } else if (hints <= 3) {
      report.push(
        `Utilizaste ${hints} ${
          hints === 1
            ? "pista"
            : "pistas"
        } de manera moderada.`
      );
    } else {
      report.push(
        `Utilizaste ${hints} pistas. Intenta depender menos de la ayuda en el próximo intento.`
      );
    }

    return report;
  }

  function createRecommendations(
    elapsedMilliseconds,
    errors,
    hints,
    score
  ) {
    const recommendations = [];

    const elapsedSeconds =
      Math.floor(
        elapsedMilliseconds / 1000
      );

    if (elapsedSeconds > 480) {
      recommendations.push(
        "Prioriza primero las alertas críticas y evita revisar eventos que no estén relacionados con FIN-014."
      );
    } else if (elapsedSeconds > 300) {
      recommendations.push(
        "Puedes mejorar tu tiempo identificando más rápido la relación entre el documento, PowerShell y el cifrado."
      );
    } else {
      recommendations.push(
        "Tu tiempo fue muy bueno. Mantén la rapidez sin aumentar los errores."
      );
    }

    if (errors >= 4) {
      recommendations.push(
        "Antes de ejecutar una acción, revisa el equipo afectado, el proceso involucrado y el orden de los eventos."
      );
    } else if (errors > 0) {
      recommendations.push(
        "Revisa con mayor atención la evidencia antes de confirmar una decisión."
      );
    } else {
      recommendations.push(
        "Tus decisiones fueron precisas. Conserva este nivel de análisis."
      );
    }

    if (hints >= 5) {
      recommendations.push(
        "Practica nuevamente el recorrido para depender menos de las pistas."
      );
    } else if (hints > 0) {
      recommendations.push(
        "En el próximo intento trata de completar más etapas sin ayuda."
      );
    } else {
      recommendations.push(
        "Completaste la simulación sin pistas. Estás listo para una dificultad mayor."
      );
    }

    if (score >= 90) {
      recommendations.push(
        "Reto recomendado: completa nuevamente la simulación en menos tiempo y sin utilizar pistas."
      );
    } else if (score >= 75) {
      recommendations.push(
        "Reto recomendado: reduce tus errores y utiliza como máximo una pista."
      );
    } else if (score >= 60) {
      recommendations.push(
        "Reto recomendado: repite el escenario siguiendo cuidadosamente el orden de la investigación."
      );
    } else {
      recommendations.push(
        "Repasa el flujo: analizar, aislar, investigar, comprobar el alcance y contener."
      );
    }

    return recommendations;
  }

  function createFinalStyles() {
    if (
      document.querySelector(
        "#finalResultStyles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id = "finalResultStyles";

    style.textContent = `
      .final-result-overlay {
        position: fixed;
        inset: 0;
        z-index: 20000;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(
            circle at top,
            rgba(123, 47, 247, 0.28),
            rgba(13, 8, 22, 0.94) 55%
          );
        backdrop-filter: blur(8px);
        animation: finalOverlayIn 350ms ease;
      }

      .final-result-card {
        width: min(820px, 100%);
        max-height: calc(100vh - 48px);
        overflow-y: auto;
        border: 1px solid rgba(178, 134, 255, 0.7);
        border-radius: 22px;
        background: #ffffff;
        box-shadow: 0 35px 90px rgba(0, 0, 0, 0.42);
        animation:
          finalCardIn 420ms
          cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      .final-result-header {
        position: relative;
        overflow: hidden;
        padding: 42px 42px 34px;
        background:
          linear-gradient(
            135deg,
            #1d102d,
            #35105e 55%,
            #7b2ff7
          );
        color: #ffffff;
        text-align: center;
      }

      .final-result-icon {
        position: relative;
        z-index: 1;
        width: 76px;
        height: 76px;
        display: grid;
        place-items: center;
        margin: 0 auto 18px;
        border: 2px solid rgba(255, 255, 255, 0.55);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.14);
        font-size: 37px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .final-result-header span {
        position: relative;
        z-index: 1;
        display: block;
        margin-bottom: 8px;
        color: #d8c1ff;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.6px;
      }

      .final-result-header h2 {
        position: relative;
        z-index: 1;
        margin: 0;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1.12;
      }

      .final-result-header p {
        position: relative;
        z-index: 1;
        max-width: 570px;
        margin: 14px auto 0;
        color: #eee5ff;
        font-size: 15px;
        line-height: 1.6;
      }

      .final-result-body {
        padding: 34px 38px 38px;
      }

      .final-score-row {
        display: grid;
        grid-template-columns: 170px minmax(0, 1fr);
        gap: 30px;
        align-items: center;
      }

      .final-score-circle {
        width: 150px;
        height: 150px;
        display: grid;
        place-items: center;
        margin: auto;
        border-radius: 50%;
        background:
          conic-gradient(
            #7b2ff7 var(--score-angle),
            #eee8f8 0
          );
        box-shadow:
          0 14px 32px rgba(84, 42, 143, 0.17);
      }

      .final-score-inner {
        width: 118px;
        height: 118px;
        display: grid;
        place-items: center;
        align-content: center;
        border-radius: 50%;
        background: #ffffff;
      }

      .final-score-inner strong {
        color: #35105e;
        font-size: 36px;
        line-height: 1;
      }

      .final-score-inner span {
        margin-top: 5px;
        color: #77717e;
        font-size: 12px;
      }

      .final-performance h3 {
        margin: 0 0 8px;
        color: #24152f;
        font-size: 25px;
      }

      .final-performance p {
        margin: 0;
        color: #67616c;
        font-size: 14px;
        line-height: 1.6;
      }

      .final-statistics {
        display: grid;
        grid-template-columns:
          repeat(3, minmax(0, 1fr));
        gap: 14px;
        margin-top: 30px;
      }

      .final-stat {
        padding: 20px;
        border: 1px solid #e5dcef;
        border-radius: 12px;
        background: #faf7ff;
        text-align: center;
      }

      .final-stat span {
        display: block;
        margin-bottom: 7px;
        color: #7c7482;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
      }

      .final-stat strong {
        color: #35105e;
        font-size: 27px;
      }

      .final-report {
        margin-top: 28px;
        padding: 24px;
        border: 1px solid #e5dcef;
        border-radius: 14px;
        background: #ffffff;
      }

      .final-report h3 {
        margin: 0 0 16px;
        color: #271a31;
        font-size: 18px;
      }

      .final-report ul {
        display: grid;
        gap: 11px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .final-report li {
        position: relative;
        padding-left: 27px;
        color: #5e5863;
        font-size: 14px;
        line-height: 1.5;
      }

      .final-report li::before {
        content: "✓";
        position: absolute;
        top: 0;
        left: 0;
        width: 19px;
        height: 19px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #eee4ff;
        color: #7b2ff7;
        font-size: 11px;
        font-weight: 900;
      }

      .final-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 28px;
      }

      .final-actions button {
        min-height: 48px;
        border: 1px solid #7b2ff7;
        border-radius: 9px;
        background: #ffffff;
        color: #6c27da;
        font-family: inherit;
        font-size: 14px;
        font-weight: 750;
        cursor: pointer;
        transition: 160ms ease;
      }

      .final-actions button:hover {
        background: #f3ebff;
        transform: translateY(-1px);
      }

      .final-actions button.primary {
        background: #7b2ff7;
        color: #ffffff;
      }

      .final-actions button.primary:hover {
        background: #35105e;
      }

      @keyframes finalOverlayIn {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      @keyframes finalCardIn {
        from {
          opacity: 0;
          transform:
            translateY(30px)
            scale(0.96);
        }

        to {
          opacity: 1;
          transform:
            translateY(0)
            scale(1);
        }
      }

      @media (max-width: 650px) {
        .final-result-overlay {
          padding: 10px;
        }

        .final-result-header {
          padding: 30px 20px 25px;
        }

        .final-result-body {
          padding: 25px 18px;
        }

        .final-score-row {
          grid-template-columns: 1fr;
          text-align: center;
        }

        .final-statistics {
          grid-template-columns: 1fr;
        }

        .final-actions {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  let finalResultShown = false;

  function showFinalResult(state) {
    if (finalResultShown) return;

    finalResultShown = true;

    const attackStart =
      (state.started || Date.now()) + 20000;

    const completedAt =
      state.completedAt || Date.now();

    const elapsed =
      Math.max(
        0,
        completedAt - attackStart
      );

    const errors =
      state.mistakes || 0;

    const hints =
      state.hintsUsed || 0;

    const score =
      calculateScore(
        elapsed,
        errors,
        hints
      );

    const performance =
      getPerformance(score);

    const report =
      createReport(
        elapsed,
        errors,
        hints
      );

    const recommendations =
      createRecommendations(
        elapsed,
        errors,
        hints,
        score
      );

    createFinalStyles();

    document
      .querySelector(
        "#finalResultOverlay"
      )
      ?.remove();

    const overlay =
      document.createElement("div");

    overlay.className =
      "final-result-overlay";

    overlay.id =
      "finalResultOverlay";

    overlay.innerHTML = `
      <article
        class="final-result-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="finalResultTitle"
      >
        <header class="final-result-header">
          <div class="final-result-icon">
            ✓
          </div>

          <span>
            MISIÓN COMPLETADA
          </span>

          <h2 id="finalResultTitle">
            ¡Felicidades! Has mitigado la amenaza
          </h2>

          <p>
            FIN-014 fue aislado, el proceso de
            PowerShell fue detenido y no se confirmó
            cifrado en FIN-021.
          </p>
        </header>

        <div class="final-result-body">
          <section class="final-score-row">
            <div
              class="final-score-circle"
              style="--score-angle: ${
                score * 3.6
              }deg"
            >
              <div class="final-score-inner">
                <strong>
                  ${score}
                </strong>

                <span>
                  de 100
                </span>
              </div>
            </div>

            <div class="final-performance">
              <h3>
                ${performance.level}
              </h3>

              <p>
                ${performance.message}
              </p>
            </div>
          </section>

          <section class="final-statistics">
            <div class="final-stat">
              <span>
                Tiempo utilizado
              </span>

              <strong>
                ${formatTime(elapsed)}
              </strong>
            </div>

            <div class="final-stat">
              <span>
                Errores
              </span>

              <strong>
                ${errors}
              </strong>
            </div>

            <div class="final-stat">
              <span>
                Pistas utilizadas
              </span>

              <strong>
                ${hints}
              </strong>
            </div>
          </section>

          <section class="final-report">
            <h3>
              Reporte de desempeño
            </h3>

            <ul>
              ${report
                .map(
                  item =>
                    `<li>${item}</li>`
                )
                .join("")}
            </ul>
          </section>

          <section class="final-report">
            <h3>
              Recomendaciones para mejorar
            </h3>

            <ul>
              ${recommendations
                .map(
                  item =>
                    `<li>${item}</li>`
                )
                .join("")}
            </ul>
          </section>

          <footer class="final-actions">
            <button
              type="button"
              id="finalRestart"
            >
              Jugar de nuevo
            </button>

            <button
              type="button"
              class="primary"
              id="finalDashboard"
            >
              Volver al dashboard
            </button>
          </footer>
        </div>
      </article>
    `;

    document.body.appendChild(overlay);

    $("#finalDashboard")
      ?.addEventListener(
        "click",
        () => {
          window.location.href =
            "Simulador.html";
        }
      );

    $("#finalRestart")
      ?.addEventListener(
        "click",
        () => {
          localStorage.removeItem(KEY);

          Object.keys(
            sessionStorage
          ).forEach(key => {
            if (
              key.startsWith("nerium-")
            ) {
              sessionStorage.removeItem(
                key
              );
            }
          });

          window.location.href =
            "Simulador.html";
        }
      );
  }

  function checkFinalResult() {
    const state = readState();

    if (
      !state ||
      !state.resolved ||
      !state.completedAt
    ) {
      return;
    }

    showFinalResult(state);
  }

  window.setInterval(sync, 500);
  window.setInterval(
    checkFinalResult,
    300
  );

  sync();
  checkFinalResult();
});