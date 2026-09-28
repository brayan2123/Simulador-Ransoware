document.addEventListener(
  'DOMContentLoaded',
  () => {
    'use strict';

    const KEY =
      'nerium-fin014-v1';

    let resultShown = false;

    function getState() {
      try {
        return JSON.parse(
          localStorage.getItem(KEY)
        );
      } catch {
        return null;
      }
    }

    function formatTime(milliseconds) {
      const totalSeconds = Math.max(
        0,
        Math.floor(
          milliseconds / 1000
        )
      );

      const minutes = String(
        Math.floor(totalSeconds / 60)
      ).padStart(2, '0');

      const seconds = String(
        totalSeconds % 60
      ).padStart(2, '0');

      return `${minutes}:${seconds}`;
    }

    function calculateScore(
      elapsed,
      errors,
      hints
    ) {
      const seconds =
        Math.floor(elapsed / 1000);

      let score = 100;

      score -= errors * 8;
      score -= hints * 3;

      if (seconds <= 300) {
        score += 5;
      } else if (seconds > 480) {
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
          title:
            'Desempeño excelente',
          message:
            'Mitigaste el incidente de forma rápida, precisa y con muy poca asistencia.'
        };
      }

      if (score >= 75) {
        return {
          title:
            'Muy buen desempeño',
          message:
            'Tomaste buenas decisiones y completaste correctamente la contención.'
        };
      }

      if (score >= 60) {
        return {
          title:
            'Amenaza contenida',
          message:
            'Completaste el incidente, aunque algunas decisiones pueden mejorar.'
        };
      }

      return {
        title:
          'Misión completada',
        message:
          'Lograste contener la amenaza, pero necesitas mejorar la precisión y el uso del tiempo.'
      };
    }

    function createReport(
      elapsed,
      errors,
      hints
    ) {
      const seconds =
        Math.floor(elapsed / 1000);

      const report = [];

      if (seconds <= 300) {
        report.push(
          'Identificaste y mitigaste la amenaza con rapidez.'
        );
      } else if (seconds <= 480) {
        report.push(
          'Completaste la mitigación dentro de un tiempo adecuado.'
        );
      } else {
        report.push(
          'La amenaza fue contenida, pero el proceso de investigación puede ser más rápido.'
        );
      }

      if (errors === 0) {
        report.push(
          'No cometiste errores durante la investigación.'
        );
      } else if (errors <= 2) {
        report.push(
          `Cometiste ${errors} ${
            errors === 1
              ? 'error'
              : 'errores'
          }, pero corregiste las decisiones a tiempo.`
        );
      } else {
        report.push(
          `Cometiste ${errors} errores. Debes revisar mejor la evidencia antes de actuar.`
        );
      }

      if (hints === 0) {
        report.push(
          'Completaste el escenario sin utilizar pistas.'
        );
      } else {
        report.push(
          `Utilizaste ${hints} ${
            hints === 1
              ? 'pista'
              : 'pistas'
          } durante la misión.`
        );
      }

      return report;
    }

    function createRecommendations(
      elapsed,
      errors,
      hints
    ) {
      const seconds =
        Math.floor(elapsed / 1000);

      const recommendations = [];

      if (seconds > 480) {
        recommendations.push(
          'Prioriza primero las alertas críticas y evita investigar eventos que no estén relacionados con FIN-014.'
        );
      } else {
        recommendations.push(
          'Mantén el orden de investigación: alerta, eventos, alcance, relaciones y contención.'
        );
      }

      if (errors > 2) {
        recommendations.push(
          'Antes de ejecutar una acción, revisa el equipo afectado, el proceso y el orden de los eventos.'
        );
      } else {
        recommendations.push(
          'Continúa revisando la evidencia antes de confirmar cada decisión.'
        );
      }

      if (hints > 3) {
        recommendations.push(
          'Repite el escenario para reconocer cada etapa utilizando menos pistas.'
        );
      } else {
        recommendations.push(
          'Intenta completar nuevamente la simulación sin utilizar pistas.'
        );
      }

      return recommendations;
    }

    function addStyles() {
      if (
        document.querySelector(
          '#finalResultStyles'
        )
      ) {
        return;
      }

      const style =
        document.createElement(
          'style'
        );

      style.id =
        'finalResultStyles';

      style.textContent = `
        .final-result-overlay {
          position: fixed;
          inset: 0;
          z-index: 50000;
          display: grid;
          place-items: center;
          padding: 24px;
          background:
            radial-gradient(
              circle at top,
              rgba(123, 47, 247, 0.3),
              rgba(13, 8, 22, 0.96) 58%
            );
          backdrop-filter: blur(9px);
          animation:
            finalOverlayIn 350ms ease;
        }

        .final-result-card {
          width: min(850px, 100%);
          max-height:
            calc(100vh - 48px);
          overflow-y: auto;
          border: 1px solid
            rgba(178, 134, 255, 0.7);
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 35px 90px
            rgba(0, 0, 0, 0.45);
          animation:
            finalCardIn 420ms
            cubic-bezier(
              0.2,
              0.8,
              0.2,
              1
            );
        }

        .final-result-header {
          padding: 40px 38px 32px;
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
          width: 74px;
          height: 74px;
          display: grid;
          place-items: center;
          margin: 0 auto 16px;
          border: 2px solid
            rgba(255,255,255,.55);
          border-radius: 50%;
          background:
            rgba(255,255,255,.14);
          font-size: 36px;
        }

        .final-result-header span {
          display: block;
          margin-bottom: 8px;
          color: #d8c1ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .final-result-header h2 {
          margin: 0;
          font-size:
            clamp(27px, 4vw, 40px);
        }

        .final-result-header p {
          max-width: 610px;
          margin: 13px auto 0;
          color: #eee5ff;
          line-height: 1.6;
        }

        .final-result-body {
          padding: 32px 36px 38px;
        }

        .final-score-section {
          display: grid;
          grid-template-columns:
            170px 1fr;
          gap: 28px;
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
              #7b2ff7
              var(--score-angle),
              #eee8f8 0
            );
        }

        .final-score-inner {
          width: 116px;
          height: 116px;
          display: grid;
          place-items: center;
          align-content: center;
          border-radius: 50%;
          background: white;
        }

        .final-score-inner strong {
          color: #35105e;
          font-size: 36px;
        }

        .final-score-inner span {
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
          line-height: 1.6;
        }

        .final-statistics {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 13px;
          margin-top: 28px;
        }

        .final-stat {
          padding: 19px;
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
          text-transform: uppercase;
        }

        .final-stat strong {
          color: #35105e;
          font-size: 27px;
        }

        .final-report {
          margin-top: 24px;
          padding: 22px;
          border: 1px solid #e5dcef;
          border-radius: 14px;
        }

        .final-report h3 {
          margin: 0 0 14px;
          color: #271a31;
        }

        .final-report ul {
          display: grid;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .final-report li {
          position: relative;
          padding-left: 27px;
          color: #5e5863;
          line-height: 1.5;
        }

        .final-report li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #7b2ff7;
          font-weight: 900;
        }

        .final-actions {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 12px;
          margin-top: 26px;
        }

        .final-actions button {
          min-height: 48px;
          border: 1px solid #7b2ff7;
          border-radius: 9px;
          background: white;
          color: #6c27da;
          font: inherit;
          font-weight: 750;
          cursor: pointer;
        }

        .final-actions button.primary {
          background: #7b2ff7;
          color: white;
        }

        .final-actions button:hover {
          transform:
            translateY(-1px);
        }

        @keyframes finalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes finalCardIn {
          from {
            opacity: 0;
            transform:
              translateY(30px)
              scale(.96);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @media (max-width: 650px) {
          .final-score-section {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .final-statistics,
          .final-actions {
            grid-template-columns: 1fr;
          }

          .final-result-body {
            padding: 25px 18px;
          }
        }
      `;

      document.head.appendChild(
        style
      );
    }

    function showResult(state) {
      if (resultShown) return;

      resultShown = true;

      const attackStart =
        (state.started || Date.now()) +
        20000;

      const completedAt =
        state.completedAt ||
        Date.now();

      const elapsed = Math.max(
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
          hints
        );

      addStyles();

      const overlay =
        document.createElement('div');

      overlay.className =
        'final-result-overlay';

      overlay.innerHTML = `
        <article
          class="final-result-card"
          role="dialog"
          aria-modal="true"
        >
          <header
            class="final-result-header"
          >
            <div
              class="final-result-icon"
            >
              ✓
            </div>

            <span>
              MISIÓN COMPLETADA
            </span>

            <h2>
              ¡Felicidades! Has mitigado la amenaza
            </h2>

            <p>
              FIN-014 fue aislado,
              PowerShell fue detenido y
              no se confirmó cifrado en
              FIN-021.
            </p>
          </header>

          <div
            class="final-result-body"
          >
            <section
              class="final-score-section"
            >
              <div
                class="final-score-circle"
                style="--score-angle: ${
                  score * 3.6
                }deg"
              >
                <div
                  class="final-score-inner"
                >
                  <strong>
                    ${score}
                  </strong>

                  <span>
                    de 100
                  </span>
                </div>
              </div>

              <div
                class="final-performance"
              >
                <h3>
                  ${performance.title}
                </h3>

                <p>
                  ${performance.message}
                </p>
              </div>
            </section>

            <section
              class="final-statistics"
            >
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

            <section
              class="final-report"
            >
              <h3>
                Reporte de desempeño
              </h3>

              <ul>
                ${report
                  .map(
                    item =>
                      `<li>${item}</li>`
                  )
                  .join('')}
              </ul>
            </section>

            <section
              class="final-report"
            >
              <h3>
                Recomendaciones
              </h3>

              <ul>
                ${recommendations
                  .map(
                    item =>
                      `<li>${item}</li>`
                  )
                  .join('')}
              </ul>
            </section>

            <footer
              class="final-actions"
            >
              <button
                type="button"
                id="finalRestart"
              >
                Volver a jugar
              </button>

              <button
                class="primary"
                type="button"
                id="finalDashboard"
              >
                Regresar al dashboard
              </button>
            </footer>
          </div>
        </article>
      `;

      document.body.appendChild(
        overlay
      );

      $('#finalRestart')
        ?.addEventListener(
          'click',
          () => {
            localStorage.removeItem(KEY);

            window.location.href =
              'Simulador.html';
          }
        );

      $('#finalDashboard')
        ?.addEventListener(
          'click',
          () => {
            window.location.href =
              'Simulador.html';
          }
        );
    }

    function checkResult() {
      const state = getState();

      if (
        state?.resolved &&
        state?.completedAt
      ) {
        showResult(state);
      }
    }

    document.addEventListener(
      'neriumMissionCompleted',
      event => {
        showResult(
          event.detail || getState()
        );
      }
    );

    setInterval(
      checkResult,
      300
    );

    checkResult();
  }
);