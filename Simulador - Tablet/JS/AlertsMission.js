(() => {
  "use strict";

  const KEY = "nerium-fin014-v1";
  const $ = (selector) => document.querySelector(selector);

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  }

  function saveState(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function active(state) {
    return Boolean(state) &&
      !state.resolved &&
      Date.now() >= state.started + 20000 &&
      Date.now() < state.deadline;
  }

  function feedback(message) {
    const element = $("#scenarioNotice");

    if (!element) return;

    element.textContent = message;
    element.hidden = false;
  }

  function renderInvestigationState(state) {
    const reviewedStep = $(
      '[data-investigation-step="reviewed"]'
    );

    const hypothesisStep = $(
      '[data-investigation-step="hypothesis"]'
    );

    const readyStep = $(
      '[data-investigation-step="ready"]'
    );

    const analyzed = Boolean(
      state?.evidence?.includes("alert")
    );

    const isolated = Boolean(
      state?.isolated
    );

    [
      reviewedStep,
      hypothesisStep,
      readyStep
    ].forEach((step) => {
      step?.classList.remove(
        "active",
        "completed"
      );
    });

    if (isolated) {
      reviewedStep?.classList.add(
        "completed"
      );

      hypothesisStep?.classList.add(
        "completed"
      );

      readyStep?.classList.add(
        "active"
      );

      return;
    }

    if (analyzed) {
      reviewedStep?.classList.add(
        "completed"
      );

      hypothesisStep?.classList.add(
        "active"
      );

      return;
    }

    reviewedStep?.classList.add(
      "active"
    );
  }

  function sync() {
    const state = getState();
    const ready = active(state);

    const analyzed = Boolean(
      state?.evidence?.includes("alert")
    );

    const isolated = Boolean(
      state?.isolated
    );

    const hypothesisButton = $(
      "#verifyHypothesis"
    );

    renderInvestigationState(state);

    if (hypothesisButton) {
      hypothesisButton.disabled =
        !ready || analyzed;

      hypothesisButton.textContent =
        analyzed
          ? "Hipótesis registrada"
          : "Registrar hipótesis";
    }

    document
      .querySelectorAll(
        'input[name="hypothesis"]'
      )
      .forEach((input) => {
        input.disabled =
          !ready || analyzed;
      });

    const mitigateButton = $(
      "#btnMitigar"
    );

    if (mitigateButton) {
      mitigateButton.disabled =
        !ready ||
        !analyzed ||
        isolated;
    }

    document
      .querySelectorAll(
        "[data-open-mitigation]"
      )
      .forEach((button) => {
        button.disabled =
          !ready ||
          !analyzed ||
          isolated;
      });

    document
      .querySelectorAll(
        "[data-mitigation]"
      )
      .forEach((button) => {
        button.disabled =
          !ready ||
          !analyzed ||
          isolated;
      });

    const nextInvestigation = $(
      "#nextInvestigation"
    );

    if (nextInvestigation) {
      nextInvestigation.hidden =
        !isolated;
    }

    if (isolated) {
      const isolateButton = $(
        '[data-mitigation="isolate"]'
      );

      isolateButton?.classList.add(
        "mission-correct"
      );

      const mitigationTitle = $(
        "#mitigationTitle"
      );

      const mitigationText = $(
        "#mitigationText"
      );

      const detailMitigation = $(
        "#detailMitigation"
      );

      if (mitigationTitle) {
        mitigationTitle.textContent =
          "Endpoint isolated";
      }

      if (mitigationText) {
        mitigationText.textContent =
          "FIN-014 está aislado. Sigue la investigación para identificar y detener el proceso responsable.";
      }

      if (detailMitigation) {
        detailMitigation.textContent =
          "Contained · investigating";
      }
    }
  }

  $("#verifyHypothesis")
    ?.addEventListener(
      "click",
      () => {
        const state = getState();

        if (!active(state)) return;

        const choice =
          document.querySelector(
            'input[name="hypothesis"]:checked'
          )?.value;

        if (!choice) {
          feedback(
            "Selecciona una respuesta antes de registrar tu hipótesis."
          );

          return;
        }

        if (choice === "chain") {
          state.evidence ||= [];

          if (
            !state.evidence.includes(
              "alert"
            )
          ) {
            state.evidence.push(
              "alert"
            );
          }

          saveState(state);

          feedback(
            "Hipótesis registrada. Ahora abre Mitigate en la alerta de FIN-014 y selecciona la acción que detenga la propagación."
          );
        } else {
          state.mistakes =
            (state.mistakes || 0) + 1;

          state.deadline -= 15000;

          saveState(state);

          feedback(
            "Esa señal no demuestra qué ocurrió antes del cifrado. Perdiste 15 segundos; revisa nuevamente la secuencia."
          );
        }

        sync();
      }
    );

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-mitigation]"
        );

      if (
        !button ||
        button.disabled
      ) {
        return;
      }

      const state = getState();

      const analyzed = Boolean(
        state?.evidence?.includes(
          "alert"
        )
      );

      if (
        !active(state) ||
        !analyzed ||
        state.isolated
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      if (
        button.dataset.mitigation ===
        "isolate"
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      state.mistakes =
        (state.mistakes || 0) + 1;

      state.deadline -= 15000;

      saveState(state);

      button.classList.add(
        "mission-wrong"
      );

      button.classList.remove(
        "completada"
      );

      feedback(
        "Acción incorrecta: FIN-014 sigue comunicándose con la red. Perdiste 15 segundos."
      );

      const result = $(
        "#mitigationResult"
      );

      if (result) {
        result.textContent =
          "Acción incorrecta · −15 segundos. Revisa el origen de la propagación.";
      }

      sync();
    },
    true
  );

  const isolateButton = $(
    '[data-mitigation="isolate"]'
  );

  isolateButton?.addEventListener(
    "click",
    () => {
      const state = getState();

      const analyzed = Boolean(
        state?.evidence?.includes(
          "alert"
        )
      );

      if (
        !active(state) ||
        !analyzed ||
        state.isolated
      ) {
        return;
      }

      state.isolated = true;

      saveState(state);

      isolateButton.classList.add(
        "mission-correct"
      );

      feedback(
        "FIN-014 quedó aislado. Ahora selecciona Ir a Event Search para continuar la investigación."
      );

      setTimeout(sync, 0);
    }
  );

  setInterval(sync, 500);
  sync();
})();