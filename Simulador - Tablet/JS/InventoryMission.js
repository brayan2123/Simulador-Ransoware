document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const KEY = "nerium-fin014-v1";
  const REQUIRED = ["FIN-014", "FIN-021"];

  const RESULTS = {
    "FIN-014":
      "FIN-014 · Cifrado confirmado a las 09:42:17. Conexión SMB saliente hacia FIN-021 a las 09:42:22. Equipo aislado.",

    "FIN-021":
      "FIN-021 · Conexión SMB entrante desde FIN-014 a las 09:42:22. Sin proceso de cifrado ni escrituras masivas confirmadas."
  };

  const $ = selector =>
    document.querySelector(selector);

  const $$ = selector =>
    Array.from(document.querySelectorAll(selector));

  let showingInstructions = false;


  /* =========================================
     ESTADO DEL JUEGO
  ========================================= */

  const get = () => {
    try {
      return JSON.parse(
        localStorage.getItem(KEY)
      );
    } catch {
      return null;
    }
  };

  const save = state => {
    localStorage.setItem(
      KEY,
      JSON.stringify(state)
    );
  };

  const active = state =>
    Boolean(state) &&
    !state.resolved &&
    Date.now() >= state.started + 20000 &&
    Date.now() < state.deadline;


  /* =========================================
     MENSAJES
  ========================================= */

  function feedback(message) {
    const element =
      $("#inventoryMissionFeedback");

    if (!element) return;

    element.textContent = message;
    element.hidden = false;
  }


  /* =========================================
     EQUIPOS ANALIZADOS
  ========================================= */

  function analyzedEndpoints(state) {
    return (
      state?.inventoryScanned || []
    ).filter(id =>
      REQUIRED.includes(id)
    );
  }


  /* =========================================
     CAMBIAR ENTRE INSTRUCCIONES,
     ANÁLISIS Y PREGUNTA
  ========================================= */

  function renderStage(state) {
    const instructionsView =
      $("#inventoryInstructionsView");

    const analysisView =
      $("#inventoryAnalysisView");

    const decisionView =
      $("#inventoryDecisionView");

    const started = Boolean(
      state?.inventoryAnalysisStarted
    );

    const complete =
      analyzedEndpoints(state).length === 2;

    const showInstructions =
      showingInstructions ||
      (!started && !complete);

    if (instructionsView) {
      instructionsView.hidden =
        !showInstructions;
    }

    if (analysisView) {
      analysisView.hidden =
        showInstructions || complete;
    }

    if (decisionView) {
      decisionView.hidden =
        showInstructions || !complete;
    }
  }


  /* =========================================
     PROGRESO DE LA MISIÓN
  ========================================= */

  function renderProgress(state) {
    const analyzed =
      analyzedEndpoints(state);

    const count = analyzed.length;
    const percent = count * 50;

    const progressText =
      $("#inventoryMissionProgress");

    const progressBar =
      $("#inventoryMissionBar");

    const percentLabel =
      $(
        ".inventory-mission-progress-head strong"
      );

    if (progressText) {
      progressText.textContent =
        `${count} de 2 equipos analizados`;
    }

    if (progressBar) {
      progressBar.style.width =
        `${percent}%`;
    }

    if (percentLabel) {
      percentLabel.textContent =
        `${percent}%`;
    }

    const steps = $$(
      ".inventory-mission-steps .mission-step"
    );

    steps.forEach(step => {
      step.classList.remove(
        "active",
        "is-complete"
      );
    });

    if (count < 2) {
      steps[0]?.classList.add(
        "active"
      );
    } else if (!state?.inventoryVerified) {
      steps[0]?.classList.add(
        "is-complete"
      );

      steps[1]?.classList.add(
        "is-complete"
      );

      steps[2]?.classList.add(
        "active"
      );
    } else {
      steps.forEach(step => {
        step.classList.add(
          "is-complete"
        );
      });
    }
  }


  /* =========================================
     RESULTADOS DEL ANÁLISIS
  ========================================= */

  function renderResults(state) {
    const analyzed =
      analyzedEndpoints(state);

    const list =
      $("#inventoryScanResults");

    if (!list) return;

    const content =
      analyzed.join("|");

    if (
      list.dataset.rendered === content
    ) {
      return;
    }

    list.replaceChildren();

    analyzed.forEach(id => {
      const item =
        document.createElement("p");

      item.textContent =
        RESULTS[id];

      list.append(item);
    });

    list.dataset.rendered =
      content;
  }


  /* =========================================
     ACTUALIZAR TODA LA INTERFAZ
  ========================================= */

  function sync() {
    const state = get();

    const analyzed =
      analyzedEndpoints(state);

    const complete =
      analyzed.length === 2;

    const isolatedRow = $(
      '#inventoryRows tr[data-asset="FIN-014"]'
    );

    if (
      state?.isolated &&
      isolatedRow?.dataset.infection ===
        "infected"
    ) {
      isolatedRow.dataset.infection =
        "isolated";

      isolatedRow.classList.remove(
        "incident-endpoint"
      );

      isolatedRow.classList.add(
        "isolated-endpoint"
      );

      const label =
        isolatedRow.querySelector(
          ".asset-name small"
        );

      if (label) {
        label.textContent =
          "Isolated · ransomware detected";
      }
    }

    renderStage(state);
    renderProgress(state);
    renderResults(state);

    const currentEndpoint =
      $("#drawerEndpointName")
        ?.textContent.trim();

    const scanButton =
      $("#btnScanEndpoint");

    if (scanButton) {
      scanButton.disabled =
        !active(state) ||
        !state?.processIdentified ||
        !state?.inventoryAnalysisStarted ||
        !RESULTS[currentEndpoint] ||
        analyzed.includes(
          currentEndpoint
        ) ||
        complete;

      if (
        analyzed.includes(
          currentEndpoint
        )
      ) {
        scanButton.textContent =
          "Endpoint analizado ✓";
      } else {
        scanButton.textContent =
          "Analizar endpoint";
      }
    }

    const verifyButton =
      $("#inventoryVerify");

    if (verifyButton) {
      verifyButton.disabled =
        !active(state) ||
        !state?.processIdentified ||
        !complete ||
        Boolean(
          state?.inventoryVerified
        );
    }

    const missionDone =
      $("#inventoryMissionDone");

    if (missionDone) {
      missionDone.hidden =
        !state?.inventoryVerified;
    }

    if (state?.inventoryVerified) {
      const scope =
        $("#inventoryScope");

      const basis =
        $("#inventoryBasis");

      if (scope) {
        scope.value = "origin";
        scope.disabled = true;

        scope.classList.add(
          "mission-correct"
        );
      }

      if (basis) {
        basis.value = "sequence";
        basis.disabled = true;

        basis.classList.add(
          "mission-correct"
        );
      }

      verifyButton?.classList.add(
        "mission-correct"
      );
    }
  }


  /* =========================================
     COMENZAR EL ANÁLISIS
  ========================================= */

  $("#btnStartInventoryAnalysis")
    ?.addEventListener(
      "click",
      () => {
        const state = get();

        if (!state) return;

        if (
          !state.processIdentified
        ) {
          feedback(
            "Primero identifica el proceso responsable en Event Search."
          );

          return;
        }

        state.inventoryAnalysisStarted =
          true;

        showingInstructions =
          false;

        save(state);

        feedback(
          "Busca FIN-014 y FIN-021 en la tabla. Abre cada equipo y presiona Analizar endpoint."
        );

        sync();
      }
    );


  /* =========================================
     MOSTRAR INSTRUCCIONES
  ========================================= */

  $("#btnStageInstructions")
    ?.addEventListener(
      "click",
      () => {
        showingInstructions =
          true;

        sync();

        $("#inventoryMission")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      }
    );


  /* =========================================
     ANALIZAR ENDPOINT
  ========================================= */

  $("#btnScanEndpoint")
    ?.addEventListener(
      "click",
      () => {
        const id =
          $("#drawerEndpointName")
            ?.textContent.trim();

        const state = get();

        if (
          !RESULTS[id] ||
          !active(state) ||
          !state?.processIdentified ||
          !state?.inventoryAnalysisStarted
        ) {
          feedback(
            !state?.inventoryAnalysisStarted
              ? "Primero presiona Comenzar análisis y sigue las instrucciones de esta etapa."
              : "Primero identifica el proceso en Event Search."
          );

          return;
        }

        setTimeout(() => {
          const latest = get();

          if (
            !active(latest) ||
            !latest?.processIdentified ||
            !latest?.inventoryAnalysisStarted
          ) {
            return;
          }

          latest.inventoryScanned ||=
            [];

          if (
            !latest.inventoryScanned
              .includes(id)
          ) {
            latest.inventoryScanned
              .push(id);
          }

          save(latest);

          const remaining =
            2 -
            analyzedEndpoints(
              latest
            ).length;

          feedback(
            remaining
              ? `${id} analizado. Falta analizar ${remaining} endpoint.`
              : "Los dos endpoints fueron analizados. Ahora responde la pregunta para determinar el alcance."
          );

          sync();
        }, 700);
      }
    );


  /* =========================================
     CONFIRMAR ALCANCE
  ========================================= */

  $("#inventoryVerify")
    ?.addEventListener(
      "click",
      () => {
        const state = get();

        if (
          !active(state) ||
          !state?.processIdentified ||
          !REQUIRED.every(id =>
            state.inventoryScanned
              ?.includes(id)
          )
        ) {
          return;
        }

        const scope =
          $("#inventoryScope");

        const basis =
          $("#inventoryBasis");

        if (
          !scope?.value ||
          !basis?.value
        ) {
          feedback(
            "Selecciona una conclusión y la evidencia que la respalda."
          );

          return;
        }

        if (
          scope.value === "origin" &&
          basis.value === "sequence"
        ) {
          state.inventoryVerified =
            true;

          state.evidence ||= [];

          if (
            !state.evidence.includes(
              "network"
            )
          ) {
            state.evidence.push(
              "network"
            );
          }

          save(state);

          scope.classList.remove(
            "mission-wrong"
          );

          basis.classList.remove(
            "mission-wrong"
          );

          feedback(
            "Correcto: FIN-014 originó el cifrado y FIN-021 solo recibió la conexión. La investigación puede continuar."
          );
        } else {
          state.mistakes =
            (state.mistakes || 0) + 1;

          state.deadline -= 5000;

          save(state);

          scope.classList.toggle(
            "mission-wrong",
            scope.value !== "origin"
          );

          basis.classList.toggle(
            "mission-wrong",
            basis.value !== "sequence"
          );

          scope.classList.toggle(
            "mission-correct",
            scope.value === "origin"
          );

          basis.classList.toggle(
            "mission-correct",
            basis.value === "sequence"
          );

          feedback(
            "Revisa los campos en rojo y vuelve a comparar los análisis. −5 segundos."
          );
        }

        sync();
      }
    );


  /* =========================================
     ACTUALIZACIÓN AUTOMÁTICA
  ========================================= */

  setInterval(sync, 500);

  sync();
});