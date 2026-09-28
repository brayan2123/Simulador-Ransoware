(() => {
  "use strict";

  const KEY = "nerium-fin014-v1";
  const REQUIRED = [
    "document",
    "powershell",
    "cipher"
  ];

  const LABELS = {
    document: "Documento abierto en FIN-014",
    powershell: "Comando PowerShell codificado",
    cipher: "Archivo de Finanzas cifrado"
  };

  const $ = (selector) =>
    document.querySelector(selector);

  const $$ = (selector) =>
    Array.from(
      document.querySelectorAll(selector)
    );

  let showingInstructions = false;

  const get = () => {
    try {
      return JSON.parse(
        localStorage.getItem(KEY)
      );
    } catch {
      return null;
    }
  };

  const save = (state) => {
    localStorage.setItem(
      KEY,
      JSON.stringify(state)
    );
  };

  const active = (state) =>
    Boolean(state) &&
    !state.resolved &&
    Date.now() >= state.started + 20000 &&
    Date.now() < state.deadline;

  function feedback(message) {
    const element =
      $("#eventMissionFeedback");

    if (!element) return;

    element.textContent = message;
    element.hidden = false;
  }

  function updateSelection() {
    const count = $$(
      "#eventRows .event-check:checked"
    ).length;

    const button =
      $("#btnEventActions");

    const selectionLabel =
      $("#selectionLabel");

    const state = get();

    const canInvestigate =
      active(state) &&
      Boolean(state?.isolated) &&
      Boolean(
        state?.eventInvestigationStarted
      ) &&
      !state?.chainVerified;

    if (button) {
      button.disabled =
        count === 0 ||
        !canInvestigate;

      button.textContent = count
        ? `Investigate (${count})`
        : "Actions⌄";
    }

    if (selectionLabel) {
      selectionLabel.textContent = count
        ? `${count} ${
            count === 1
              ? "item"
              : "items"
          } selected`
        : "No items selected";
    }

    $$("#eventRows tr").forEach(
      (row) => {
        const checkbox =
          row.querySelector(
            ".event-check"
          );

        if (checkbox) {
          checkbox.disabled =
            !canInvestigate;
        }

        row.style.cursor =
          canInvestigate
            ? "pointer"
            : "default";

        row.classList.toggle(
          "selected",
          Boolean(
            row.querySelector(
              ".event-check:checked"
            )
          )
        );
      }
    );
  }

  function renderStage(state) {
    const instructionsView =
      $("#eventInstructionsView");

    const investigationView =
      $("#eventInvestigationView");

    const processDecision =
      $("#eventProcessDecision");

    const started = Boolean(
      state?.eventInvestigationStarted
    );

    const chainComplete = Boolean(
      state?.chainVerified
    );

    const showInstructions =
      showingInstructions ||
      (!started && !chainComplete);

    if (instructionsView) {
      instructionsView.hidden =
        !showInstructions;
    }

    if (investigationView) {
      investigationView.hidden =
        showInstructions ||
        chainComplete;
    }

    if (processDecision) {
      processDecision.hidden =
        showInstructions ||
        !chainComplete;
    }
  }

  function renderProgress(state) {
    const validated =
      state?.eventValidated || [];

    const found = REQUIRED.filter(
      (id) =>
        validated.includes(id)
    );

    const progressText =
      $("#eventProgressText");

    const progressBar =
      $("#eventProgressBar");

    const mistakeText =
      $("#eventMistakeText");

    const log =
      $("#eventMissionLog");

    if (progressText) {
      progressText.textContent =
        `${found.length} de 3 eventos verificados`;
    }

    if (progressBar) {
      progressBar.style.width =
        `${(found.length / 3) * 100}%`;
    }

    if (mistakeText) {
      mistakeText.textContent =
        state?.eventSelectionErrors
          ? `${state.eventSelectionErrors} ${
              state.eventSelectionErrors === 1
                ? "intento incorrecto"
                : "intentos incorrectos"
            } · −5 s cada uno`
          : "Sin errores de selección";
    }

    if (log) {
      log.replaceChildren();

      found.forEach((id) => {
        const item =
          document.createElement("li");

        item.textContent =
          `✓ ${LABELS[id]}`;

        log.append(item);
      });
    }

    $$(
      "#eventRows tr[data-mission-event]"
    ).forEach((row) => {
      if (
        validated.includes(
          row.dataset.missionEvent
        )
      ) {
        row.classList.remove(
          "mission-wrong"
        );

        row.classList.add(
          "mission-correct",
          "investigated"
        );
      }
    });
  }

  function sync() {
    updateSelection();

    const state = get();

    renderProgress(state);
    renderStage(state);

    const missionNext =
      $("#eventMissionNext");

    const identifyButton =
      $("#btnIdentifyProcess");

    if (missionNext) {
      missionNext.hidden =
        !state?.processIdentified;
    }

    if (identifyButton) {
      identifyButton.disabled =
        !active(state) ||
        Boolean(
          state?.processIdentified
        );
    }

    if (state?.processIdentified) {
      const suspectProcess =
        $("#suspectProcess");

      if (suspectProcess) {
        suspectProcess.value =
          "powershell";

        suspectProcess.disabled =
          true;

        suspectProcess.classList.add(
          "mission-correct"
        );
      }

      identifyButton?.classList.add(
        "mission-correct"
      );
    }
  }

  $("#btnStartEventInvestigation")
    ?.addEventListener(
      "click",
      () => {
        const state = get();

        if (!state) return;

        state.eventInvestigationStarted =
          true;

        showingInstructions = false;

        save(state);

        feedback(
          "Ahora selecciona en la tabla los tres registros relacionados con el ataque y presiona Investigate."
        );

        sync();
      }
    );

  $("#btnStageInstructions")
    ?.addEventListener(
      "click",
      () => {
        showingInstructions = true;

        sync();

        $("#eventMission")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      }
    );

  document.addEventListener(
    "change",
    (event) => {
      if (
        event.target.matches(
          ".event-check, #selectAllEvents"
        )
      ) {
        setTimeout(
          updateSelection,
          0
        );
      }
    }
  );

  document.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest(
          "input, button, a, select, label, .related-link"
        )
      ) {
        return;
      }

      const row =
        event.target.closest(
          "#eventRows tr"
        );

      if (!row) return;

      const checkbox =
        row.querySelector(
          ".event-check"
        );

      if (
        !checkbox ||
        checkbox.disabled
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      checkbox.checked =
        !checkbox.checked;

      checkbox.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true
          }
        )
      );

      updateSelection();
    },
    true
  );

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "#btnEventActions"
        );

      if (
        !button ||
        button.disabled
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      const state = get();

      if (
        !active(state) ||
        !state.isolated ||
        !state.eventInvestigationStarted ||
        state.chainVerified
      ) {
        feedback(
          !state?.eventInvestigationStarted
            ? "Primero presiona Comenzar investigación y sigue las instrucciones de esta etapa."
            : "Primero aísla FIN-014 desde Alerts para investigar este incidente."
        );

        return;
      }

      const rows = $$(
        "#eventRows .event-check:checked"
      ).map(
        (input) =>
          input.closest("tr")
      );

      state.eventValidated ||= [];

      let correct = 0;
      let wrong = 0;

      rows.forEach((row) => {
        const id =
          row.dataset.missionEvent;

        if (
          REQUIRED.includes(id)
        ) {
          correct++;

          if (
            !state.eventValidated.includes(
              id
            )
          ) {
            state.eventValidated.push(
              id
            );
          }

          row.classList.remove(
            "mission-wrong"
          );

          row.classList.add(
            "mission-correct",
            "investigated"
          );
        } else {
          wrong++;

          row.classList.remove(
            "mission-correct"
          );

          row.classList.add(
            "mission-wrong"
          );
        }

        const checkbox =
          row.querySelector(
            ".event-check"
          );

        if (checkbox) {
          checkbox.checked = false;
        }
      });

      if (wrong > 0) {
        state.mistakes =
          (state.mistakes || 0) + 1;

        state.eventSelectionErrors =
          (
            state.eventSelectionErrors ||
            0
          ) + 1;

        state.deadline -= 5000;
      }

      if (
        REQUIRED.every(
          (id) =>
            state.eventValidated.includes(
              id
            )
        )
      ) {
        state.chainVerified = true;
        state.evidence ||= [];

        if (
          !state.evidence.includes(
            "process"
          )
        ) {
          state.evidence.push(
            "process"
          );
        }
      }

      save(state);
      sync();

      const remaining =
        REQUIRED.length -
        state.eventValidated.length;

      if (state.chainVerified) {
        feedback(
          `Cadena completa: ${state.eventValidated.length}/3 eventos correctos. ` +
          (
            wrong
              ? "La selección también incluyó eventos incorrectos: −5 segundos. "
              : ""
          ) +
          "Identifica ahora el proceso que ejecutó el comando."
        );
      } else {
        feedback(
          `${correct} ${
            correct === 1
              ? "evento correcto"
              : "eventos correctos"
          } en este intento; ${wrong} ${
            wrong === 1
              ? "incorrecto"
              : "incorrectos"
          }. ` +
          (
            wrong
              ? "Se descontaron 5 segundos. "
              : ""
          ) +
          `Faltan ${remaining} ${
            remaining === 1
              ? "evento"
              : "eventos"
          } para completar la cadena.`
        );
      }
    },
    true
  );

  $("#btnIdentifyProcess")
    ?.addEventListener(
      "click",
      () => {
        const state = get();

        if (
          !active(state) ||
          !state.chainVerified
        ) {
          return;
        }

        const input =
          $("#suspectProcess");

        const button =
          $("#btnIdentifyProcess");

        if (!input?.value) {
          feedback(
            "Selecciona un proceso antes de confirmar."
          );

          return;
        }

        if (
          input.value ===
          "powershell"
        ) {
          state.processIdentified =
            true;

          save(state);

          input.classList.remove(
            "mission-wrong"
          );

          input.classList.add(
            "mission-correct"
          );

          button?.classList.remove(
            "mission-wrong"
          );

          button?.classList.add(
            "mission-correct"
          );

          feedback(
            "Proceso identificado: powershell.exe. Verifica el alcance en Inventory antes de ejecutar más acciones."
          );
        } else {
          state.mistakes =
            (state.mistakes || 0) + 1;

          state.deadline -= 5000;

          save(state);

          input.classList.add(
            "mission-wrong"
          );

          button?.classList.add(
            "mission-wrong"
          );

          feedback(
            "Proceso incorrecto: −5 segundos. Comprueba cuál ejecutó el comando codificado antes del cifrado."
          );
        }

        sync();
      }
    );

  setInterval(sync, 500);
  sync();
})();