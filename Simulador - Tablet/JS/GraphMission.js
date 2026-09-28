document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const KEY = 'nerium-fin014-v1';

  const REQUIRED = [
    'document',
    'powershell',
    'cipher',
    'network'
  ];

  const LABELS = {
    document: 'Factura_Q3.docm abierto en FIN-014',
    powershell: 'PowerShell codificado ejecutado',
    cipher: 'Archivos financieros cifrados',
    network: 'Conexión SMB enviada a FIN-021'
  };

  const $ = selector =>
    document.querySelector(selector);

  const $$ = selector =>
    [...document.querySelectorAll(selector)];

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

  function feedback(message) {
    const element =
      $('#graphMissionFeedback');

    if (!element) return;

    element.textContent = message;
    element.hidden = false;
  }

  function sync() {
    const state = get();

    const investigated =
      state?.graphInvestigated || [];

    const found = REQUIRED.filter(id =>
      investigated.includes(id)
    );

    const completed =
      found.length === REQUIRED.length;

    const progress =
      Math.round(
        (found.length / REQUIRED.length) *
          100
      );

    const progressText =
      $('#graphMissionProgress');

    const progressPercent =
      $('#graphMissionPercent');

    const progressBar =
      $('#graphMissionBar');

    const decisionPanel =
      $('#graphDecisionPanel');

    const verifyButton =
      $('#graphVerify');

    const missionDone =
      $('#graphMissionDone');

    if (progressText) {
      progressText.textContent =
        `${found.length} de 4 nodos verificados`;
    }

    if (progressPercent) {
      progressPercent.textContent =
        `${progress}%`;
    }

    if (progressBar) {
      progressBar.style.width =
        `${progress}%`;
    }

    /*
     * Muestra las preguntas únicamente
     * al completar los cuatro nodos.
     */
    if (decisionPanel) {
      if (completed) {
        decisionPanel.hidden = false;

        decisionPanel.removeAttribute(
          'hidden'
        );

        decisionPanel.style.removeProperty(
          'display'
        );

        decisionPanel.classList.add(
          'graph-questions-visible'
        );
      } else {
        decisionPanel.hidden = true;

        decisionPanel.setAttribute(
          'hidden',
          ''
        );

        decisionPanel.classList.remove(
          'graph-questions-visible'
        );
      }
    }

    const log =
      $('#graphMissionLog');

    const signature =
      found.join('|');

    if (
      log &&
      log.dataset.rendered !== signature
    ) {
      log.replaceChildren();

      found.forEach(id => {
        const item =
          document.createElement('span');

        item.textContent =
          `✓ ${LABELS[id]}`;

        log.append(item);
      });

      log.dataset.rendered =
        signature;
    }

    $$('[data-mission-node]').forEach(
      node => {
        const id =
          node.dataset.missionNode;

        if (found.includes(id)) {
          node.classList.remove(
            'mission-wrong'
          );

          node.classList.add(
            'mission-correct'
          );
        }
      }
    );

    if (verifyButton) {
      verifyButton.disabled =
        !active(state) ||
        !state?.inventoryVerified ||
        !completed ||
        Boolean(state?.graphVerified);
    }

    if (missionDone) {
      missionDone.hidden =
        !state?.graphVerified;
    }

    if (state?.graphVerified) {
      const sequence =
        $('#graphSequence');

      const conclusion =
        $('#graphConclusion');

      if (sequence) {
        sequence.value = 'correct';
        sequence.disabled = true;

        sequence.classList.remove(
          'mission-wrong'
        );

        sequence.classList.add(
          'mission-correct'
        );
      }

      if (conclusion) {
        conclusion.value = 'exposed';
        conclusion.disabled = true;

        conclusion.classList.remove(
          'mission-wrong'
        );

        conclusion.classList.add(
          'mission-correct'
        );
      }

      verifyButton?.classList.add(
        'mission-correct'
      );
    }
  }

  const investigateButton =
    $('#btnInvestigateNode');

  investigateButton?.addEventListener(
    'click',
    () => {
      const state = get();

      const node =
        $('.graph-node.selected');

      if (!state) {
        feedback(
          'Primero inicia el simulador desde el Dashboard.'
        );
        return;
      }

      if (!active(state)) {
        feedback(
          'La misión no está activa o el tiempo se agotó.'
        );
        return;
      }

      if (!state.inventoryVerified) {
        feedback(
          'Completa la verificación de alcance en Inventory antes de correlacionar el grafo.'
        );
        return;
      }

      if (!node) {
        feedback(
          'Selecciona un nodo del mapa y después pulsa Investigar nodo.'
        );
        return;
      }

      const id =
        node.dataset.missionNode;

      if (REQUIRED.includes(id)) {
        state.graphInvestigated ||= [];

        if (
          !state.graphInvestigated.includes(
            id
          )
        ) {
          state.graphInvestigated.push(id);
        }

        node.classList.remove(
          'mission-wrong'
        );

        node.classList.add(
          'mission-correct'
        );

        save(state);

        const total =
          REQUIRED.filter(requiredId =>
            state.graphInvestigated.includes(
              requiredId
            )
          ).length;

        if (total === 4) {
          feedback(
            'Los cuatro nodos fueron verificados. Ahora contesta las preguntas para confirmar la cadena del ataque.'
          );
        } else {
          feedback(
            `${LABELS[id]}: nodo registrado. Continúa investigando los nodos relacionados con el incidente.`
          );
        }
      } else {
        state.mistakes =
          (state.mistakes || 0) + 1;

        state.deadline -= 5000;

        save(state);

        node.classList.remove(
          'mission-correct'
        );

        node.classList.add(
          'mission-wrong'
        );

        feedback(
          'Esta alerta no demuestra la cadena del incidente. −5 segundos.'
        );
      }

      sync();
    }
  );

  const verifyButton =
    $('#graphVerify');

  verifyButton?.addEventListener(
    'click',
    () => {
      const state = get();

      if (
        !state ||
        !active(state) ||
        !state.inventoryVerified
      ) {
        return;
      }

      const allNodesVerified =
        REQUIRED.every(id =>
          state.graphInvestigated?.includes(
            id
          )
        );

      if (!allNodesVerified) {
        feedback(
          'Investiga primero los cuatro nodos correctos.'
        );
        return;
      }

      const sequence =
        $('#graphSequence');

      const conclusion =
        $('#graphConclusion');

      if (
        !sequence?.value ||
        !conclusion?.value
      ) {
        feedback(
          'Contesta las dos preguntas antes de confirmar la relación.'
        );
        return;
      }

      const correctSequence =
        sequence.value === 'correct';

      const correctConclusion =
        conclusion.value === 'exposed';

      sequence.classList.toggle(
        'mission-correct',
        correctSequence
      );

      sequence.classList.toggle(
        'mission-wrong',
        !correctSequence
      );

      conclusion.classList.toggle(
        'mission-correct',
        correctConclusion
      );

      conclusion.classList.toggle(
        'mission-wrong',
        !correctConclusion
      );

      if (
        correctSequence &&
        correctConclusion
      ) {
        state.graphVerified = true;
        state.evidence ||= [];

        if (
          !state.evidence.includes(
            'graph'
          )
        ) {
          state.evidence.push('graph');
        }

        save(state);

        feedback(
          'Cadena confirmada. FIN-021 recibió una conexión, pero no hay evidencia de cifrado en ese equipo. Continúa a RemoteOps.'
        );
      } else {
        state.mistakes =
          (state.mistakes || 0) + 1;

        state.deadline -= 5000;

        save(state);

        feedback(
          'Revisa los campos en rojo y compara el orden de los horarios. −5 segundos.'
        );
      }

      sync();
    }
  );

  setInterval(sync, 500);
  sync();
});