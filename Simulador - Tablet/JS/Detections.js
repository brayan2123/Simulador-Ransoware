document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const $ = (id) => document.getElementById(id);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    let pausado = false;
    let silenciado = false;
    let volumenMusica = 0.25;
    let volumenEfectos = 0.5;
    let segundosSimulacion = 0;
    let temporizadorToast;
    let fuenteActual = "custom";
    let paginaActual = 1;
    let columnaOrden = "name";
    let direccionOrden = 1;
    let reglaActiva = null;
    let herenciaActiva = true;

    const seleccionadas = new Set();
    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const ruleDrawer = $("ruleDrawer");
    const automaticModal = $("automaticModal");

    const reglas = [
        crearRegla("det-001", "custom", "Enabled", "Browser Launch with Suspicious Arguments", "High", "Detects creation of a new web browser process with suspicious command-line arguments.", ["Emerging threat", "Core"], 0, false, "Execution (T1059)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-002", "custom", "Enabled", "Calendaromatic API Access", "High", "Detects requests to Calendaromatic infrastructure from an unusual parent process.", ["Emerging threat", "Core"], 0, false, "Command and Control (T1071)", "STAR", "SentinelOne"),
        crearRegla("det-003", "custom", "Enabled", "Claude Code DLL Sideloading", "High", "Detects attempts to abuse a trusted executable to load an untrusted dynamic library.", ["Core"], 0, false, "Stealth (T1574)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-004", "custom", "Enabled", "ClickFix Command Proxy Execution", "High", "Detects abuse of the Program Compatibility Assistant to proxy command execution.", ["Core"], 0, false, "Execution (T1204)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-005", "custom", "Enabled", "ClickFix Command Script Execution", "High", "Detects PowerShell commands commonly associated with ClickFix social-engineering campaigns.", ["Core"], 0, false, "Execution (T1059)", "STAR", "SentinelOne"),
        crearRegla("det-006", "custom", "Enabled", "ClickFix Explorer-Spawned Command", "High", "Detects a command interpreter launched by Windows Explorer after suspicious clipboard activity.", ["Core"], 0, false, "Execution (T1059)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-007", "custom", "Enabled", "ClickFix Payload Execution", "High", "Detects activity consistent with execution of a downloaded ClickFix payload.", ["Core"], 0, false, "Execution (T1059)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-008", "custom", "Enabled", "ClickFix PowerShell BXO", "High", "Detects event patterns consistent with browser-to-PowerShell execution.", ["Core"], 0, false, "Execution (T1059)", "STAR", "SentinelOne"),
        crearRegla("det-009", "custom", "Enabled", "ClickFix PowerShell Obfuscation", "High", "Detects PowerShell execution containing encoded or heavily obfuscated commands.", ["Core"], 0, false, "Execution (T1059)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-010", "custom", "Enabled", "ClickFix Terminal-Spawned Command", "High", "Detects a command interpreter launched from a suspicious terminal workflow.", ["Core"], 0, false, "Execution (T1059)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-011", "custom", "Enabled", "Ransomware Mass File Encryption", "Critical", "Detects rapid encryption and renaming of business documents on FIN-014.", ["Ransomware", "Core"], 4, true, "Impact (T1486)", "Behavioral AI", "Nerium XDR"),
        crearRegla("det-012", "custom", "Enabled", "Suspicious PowerShell from Office", "Critical", "Detects an encoded PowerShell process spawned by a document application.", ["Ransomware"], 2, true, "Execution (T1059)", "STAR", "Nerium XDR"),
        crearRegla("det-013", "custom", "Enabled", "Shadow Copy Deletion", "Critical", "Detects deletion of Windows shadow copies before ransomware encryption.", ["Ransomware", "Core"], 1, true, "Impact (T1490)", "Behavioral AI", "Nerium XDR"),
        crearRegla("det-014", "custom", "Enabled", "Lateral Movement via SMB", "High", "Detects abnormal SMB connections from the compromised finance endpoint.", ["Ransomware"], 3, true, "Lateral Movement (T1021)", "Cloud Funnel", "Nerium XDR"),
        crearRegla("det-015", "library", "Enabled", "Credential Dumping Attempt", "Critical", "Detects access to credential material and LSASS process memory.", ["Core"], 1, false, "Credential Access (T1003)", "Behavioral AI", "SentinelOne"),
        crearRegla("det-016", "library", "Disabled", "Backup Repository Tampering", "Critical", "Detects attempts to stop backup services or modify protected recovery repositories.", ["Ransomware"], 0, false, "Impact (T1490)", "STAR", "Nerium XDR"),
        crearRegla("det-017", "library", "Enabled", "FIN-014 Network Propagation", "High", "Detects repeated connections from FIN-014 to multiple internal endpoints.", ["Ransomware", "Emerging threat"], 2, true, "Lateral Movement (T1021)", "Cloud Funnel", "Nerium XDR"),
        crearRegla("det-018", "library", "Enabled", "Ransom Note Creation", "High", "Detects creation of ransom-note files across multiple protected folders.", ["Ransomware"], 1, true, "Impact (T1486)", "Behavioral AI", "SentinelOne")
    ];

    function crearRegla(id, source, state, name, severity, description, labels, alerts, response, mitre, type, dataSource) {
        return { id, source, state, name, severity, description, labels, alerts, response, mitre, type, dataSource };
    }

    function reproducirMusica() {
        if (!musica || silenciado || pausado) return;
        musica.volume = volumenMusica;
        musica.play().catch(function () {});
    }

    if (musica) {
        musica.volume = volumenMusica;
        musica.play().catch(function () {});
    }

    document.addEventListener("pointerdown", reproducirMusica, { once: true });

    function sonidoBoton() {
        if (silenciado || volumenEfectos === 0) return;
        const sonido = new Audio("Audio/Boton.mp3");
        sonido.volume = volumenEfectos;
        sonido.play().catch(function () {});
    }

    document.addEventListener("click", function (evento) {
        if (evento.target.closest("button, .side-link, select, input")) sonidoBoton();
    });

    function toast(mensaje) {
        const elemento = $("toast");
        const texto = $("toastTexto");
        if (!elemento || !texto) return;
        texto.textContent = mensaje;
        elemento.classList.add("activo");
        clearTimeout(temporizadorToast);
        temporizadorToast = window.setTimeout(function () {
            elemento.classList.remove("activo");
        }, 2800);
    }

    function formatearTiempo(total) {
        const horas = String(Math.floor(total / 3600)).padStart(2, "0");
        const minutos = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
        const segundos = String(total % 60).padStart(2, "0");
        return horas + ":" + minutos + ":" + segundos;
    }

    window.setInterval(function () {
        if (!pausado) segundosSimulacion += 1;
        if ($("relojSimulacion")) $("relojSimulacion").textContent = formatearTiempo(segundosSimulacion);
    }, 1000);

    function abrirPausa() {
        pausado = true;
        overlayPausa?.classList.add("activo");
        musica?.pause();
    }

    function cerrarPausa() {
        pausado = false;
        overlayPausa?.classList.remove("activo");
        reproducirMusica();
    }

    function abrirConfig() {
        overlayConfig?.classList.add("activo");
    }

    function cerrarConfig() {
        overlayConfig?.classList.remove("activo");
        if (pausado) overlayPausa?.classList.add("activo");
    }

    function regresarInicio() {
        window.location.href = "index.html";
    }

    $("btnPausa")?.addEventListener("click", abrirPausa);
    $("btnContinuar")?.addEventListener("click", cerrarPausa);
    $("btnConfiguracion")?.addEventListener("click", abrirConfig);
    $("cerrarConfig")?.addEventListener("click", cerrarConfig);
    $("guardarConfig")?.addEventListener("click", cerrarConfig);
    $("btnRegresar")?.addEventListener("click", regresarInicio);
    $("btnInicioPausa")?.addEventListener("click", regresarInicio);

    $("btnConfigPausa")?.addEventListener("click", function () {
        overlayPausa?.classList.remove("activo");
        abrirConfig();
    });

    $("volumenMusica")?.addEventListener("input", function () {
        volumenMusica = Number(this.value) / 100;
        if ($("valorMusica")) $("valorMusica").textContent = this.value + "%";
        if (musica && !silenciado) musica.volume = volumenMusica;
    });

    $("volumenEfectos")?.addEventListener("input", function () {
        volumenEfectos = Number(this.value) / 100;
        if ($("valorEfectos")) $("valorEfectos").textContent = this.value + "%";
    });

    $("silenciar")?.addEventListener("change", function () {
        silenciado = this.checked;
        if (silenciado) musica?.pause();
        else reproducirMusica();
    });

    function cerrarMenu() {
        document.body.classList.remove("menu-abierto");
    }

    $("btnAbrirMenu")?.addEventListener("click", function () {
        document.body.classList.toggle("menu-abierto");
    });

    $("sidebarBackdrop")?.addEventListener("click", cerrarMenu);

    $$('.side-link:not(.active):not([data-ready="true"])').forEach(function (enlace) {
        enlace.addEventListener("click", function (evento) {
            evento.preventDefault();
            cerrarMenu();
            toast("Este módulo se conectará cuando construyamos su pantalla.");
        });
    });

    $("menuSearch")?.addEventListener("input", function () {
        const termino = this.value.trim().toLowerCase();
        $$(".side-link").forEach(function (enlace) {
            const texto = (enlace.dataset.menuText || enlace.textContent).toLowerCase();
            enlace.hidden = Boolean(termino) && !texto.includes(termino);
        });
    });

    document.addEventListener("keydown", function (evento) {
        if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
            evento.preventDefault();
            $("menuSearch")?.focus();
        }
        if (evento.key === "Escape") {
            cerrarDrawer();
            automaticModal?.classList.remove("activo");
            $("actionsMenu").hidden = true;
        }
    });

    $("btnAyuda")?.addEventListener("click", function () {
        toast("Busca una regla, cambia su estado o abre sus detalles para investigarla.");
    });

    $("btnNotificaciones")?.addEventListener("click", function () {
        const alertas = reglas.reduce(function (total, regla) { return total + regla.alerts; }, 0);
        toast(alertas + " alertas relacionadas con reglas de detección.");
    });

    function escapar(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function claseEtiqueta(etiqueta) {
        if (etiqueta === "Emerging threat") return "emerging";
        if (etiqueta === "Ransomware") return "ransomware";
        return "";
    }

    function datosFiltrados() {
        const termino = $("ruleSearch").value.trim().toLowerCase();
        const campo = $("searchField").value;
        const estado = $("statusFilter").value;
        const severidad = $("severityFilter").value;
        const tipo = $("ruleTypeFilter").value;
        const origen = $("dataSourceFilter").value;
        const etiqueta = $("labelFilter").value;
        const mitre = $("mitreFilter").value;

        return reglas.filter(function (regla) {
            if (regla.source !== fuenteActual) return false;
            const textoBusqueda = campo === "name" ? regla.name : campo === "description" ? regla.description : regla.name + " " + regla.description;
            if (termino && !textoBusqueda.toLowerCase().includes(termino)) return false;
            if (estado !== "all" && regla.state !== estado) return false;
            if (severidad !== "all" && regla.severity !== severidad) return false;
            if (tipo !== "all" && regla.type !== tipo) return false;
            if (origen !== "all" && regla.dataSource !== origen) return false;
            if (etiqueta !== "all" && !regla.labels.includes(etiqueta)) return false;
            if (mitre !== "all" && !regla.mitre.startsWith(mitre)) return false;
            return true;
        }).sort(function (a, b) {
            const valorA = String(a[columnaOrden]).toLowerCase();
            const valorB = String(b[columnaOrden]).toLowerCase();
            return valorA.localeCompare(valorB) * direccionOrden;
        });
    }

    function renderizarTabla() {
        const cuerpo = $("detectionRows");
        if (!cuerpo) return;

        const datos = datosFiltrados();
        const porPagina = Number($("rulesPerPage").value);
        const totalPaginas = Math.max(1, Math.ceil(datos.length / porPagina));
        paginaActual = Math.min(paginaActual, totalPaginas);
        const inicio = (paginaActual - 1) * porPagina;
        const visibles = datos.slice(inicio, inicio + porPagina);

        cuerpo.innerHTML = visibles.map(function (regla) {
            const etiquetas = regla.labels.map(function (etiqueta) {
                return '<span class="rule-label ' + claseEtiqueta(etiqueta) + '">' + escapar(etiqueta) + "</span>";
            }).join("");
            const seleccionada = seleccionadas.has(regla.id);
            const habilitada = regla.state === "Enabled";

            return '<tr data-rule-id="' + regla.id + '" class="' + (seleccionada ? "selected" : "") + '">' +
                '<td><input class="rule-checkbox" type="checkbox" aria-label="Seleccionar ' + escapar(regla.name) + '" ' + (seleccionada ? "checked" : "") + "></td>" +
                '<td><div class="rule-actions"><button type="button" data-row-action="edit" aria-label="Editar"><svg><use href="#i-edit"></use></svg></button><button type="button" data-row-action="duplicate" aria-label="Duplicar"><svg><use href="#i-copy"></use></svg></button><button type="button" data-row-action="details" aria-label="Ver detalles"><svg><use href="#i-list"></use></svg></button></div></td>' +
                '<td><button class="state-button ' + (habilitada ? "" : "disabled") + '" type="button" data-row-action="state"><i><svg><use href="' + (habilitada ? "#i-check" : "#i-x") + '"></use></svg></i>' + escapar(regla.state) + "</button></td>" +
                '<td><button class="rule-name-button" type="button" data-row-action="details">' + escapar(regla.name) + "</button></td>" +
                '<td><span class="severity ' + regla.severity.toLowerCase() + '"><i>⌃</i>' + escapar(regla.severity) + "</span></td>" +
                '<td title="' + escapar(regla.description) + '">' + escapar(regla.description) + "</td>" +
                '<td><div class="labels">' + etiquetas + "</div></td>" +
                '<td class="text-center">' + regla.alerts + "</td>" +
                '<td><button class="active-response ' + (regla.response ? "on" : "") + '" type="button" data-row-action="response"><i>' + (regla.response ? "✓" : "−") + "</i>" + (regla.response ? "On" : "Off") + "</button></td>" +
                '<td><span class="mitre-pill">' + escapar(regla.mitre) + "</span></td>" +
                '<td><span class="data-source"><svg><use href="#i-sentinel"></use></svg>' + escapar(regla.dataSource) + "</span></td>" +
                "</tr>";
        }).join("");

        $("detectionsEmpty").hidden = datos.length !== 0;
        cuerpo.closest("table").hidden = datos.length === 0;
        $("ruleCount").textContent = contarResultados(datos.length);
        renderizarPaginacion(totalPaginas);
        actualizarSeleccion(datos);
    }

    function contarResultados(cantidad) {
        const sinFiltros = !$("ruleSearch").value.trim() && ["statusFilter", "severityFilter", "ruleTypeFilter", "dataSourceFilter", "labelFilter", "mitreFilter"].every(function (id) {
            return $(id).value === "all";
        });
        if (sinFiltros) return fuenteActual === "custom" ? "2,243 Items" : "1,168 Items";
        return cantidad + (cantidad === 1 ? " Item" : " Items");
    }

    function renderizarPaginacion(totalPaginas) {
        const contenedor = $("rulePageButtons");
        contenedor.innerHTML = "";
        for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.textContent = pagina;
            boton.classList.toggle("active", pagina === paginaActual);
            boton.addEventListener("click", function () {
                paginaActual = pagina;
                renderizarTabla();
            });
            contenedor.appendChild(boton);
        }
        $("previousRulePage").disabled = paginaActual === 1;
        $("nextRulePage").disabled = paginaActual === totalPaginas;
    }

    function actualizarSeleccion(datos) {
        const idsVisibles = datos.map(function (regla) { return regla.id; });
        const seleccionadasVisibles = idsVisibles.filter(function (id) { return seleccionadas.has(id); }).length;
        const seleccionarTodo = $("selectAllRules");
        seleccionarTodo.checked = idsVisibles.length > 0 && seleccionadasVisibles === idsVisibles.length;
        seleccionarTodo.indeterminate = seleccionadasVisibles > 0 && seleccionadasVisibles < idsVisibles.length;
        $("btnEnableSelected").disabled = seleccionadas.size === 0;
    }

    function buscarRegla(id) {
        return reglas.find(function (regla) { return regla.id === id; });
    }

    $("detectionRows")?.addEventListener("click", function (evento) {
        const fila = evento.target.closest("tr[data-rule-id]");
        if (!fila) return;
        const regla = buscarRegla(fila.dataset.ruleId);
        if (!regla) return;

        if (evento.target.closest(".rule-checkbox")) {
            if (evento.target.checked) seleccionadas.add(regla.id);
            else seleccionadas.delete(regla.id);
            renderizarTabla();
            return;
        }

        const accion = evento.target.closest("[data-row-action]")?.dataset.rowAction;
        if (!accion) return;
        if (accion === "state") {
            regla.state = regla.state === "Enabled" ? "Disabled" : "Enabled";
            toast(regla.name + ": " + regla.state + ".");
            renderizarTabla();
        } else if (accion === "response") {
            regla.response = !regla.response;
            toast("Respuesta activa " + (regla.response ? "habilitada." : "deshabilitada."));
            renderizarTabla();
        } else if (accion === "duplicate") {
            duplicarRegla(regla);
        } else if (accion === "edit") {
            abrirDrawer(regla);
            toast("Abriendo la configuración de la regla.");
        } else if (accion === "details") {
            abrirDrawer(regla);
        }
    });

    function abrirDrawer(regla) {
        reglaActiva = regla;
        $("ruleDetailName").textContent = regla.name;
        $("ruleDetailState").textContent = regla.state;
        $("ruleDetailSeverity").textContent = regla.severity + " severity";
        $("ruleDetailDescription").textContent = regla.description;
        $("ruleDetailType").textContent = regla.type;
        $("ruleDetailMitre").textContent = regla.mitre;
        $("ruleDetailSource").textContent = regla.dataSource;
        $("ruleDetailAlerts").textContent = regla.alerts;
        $("ruleDetailResponse").textContent = regla.response ? "On" : "Off";
        $("btnToggleDrawer").innerHTML = '<svg><use href="#i-power"></use></svg> ' + (regla.state === "Enabled" ? "Disable rule" : "Enable rule");
        ruleDrawer.classList.add("open");
        ruleDrawer.setAttribute("aria-hidden", "false");
    }

    function cerrarDrawer() {
        ruleDrawer?.classList.remove("open");
        ruleDrawer?.setAttribute("aria-hidden", "true");
    }

    $("closeRuleDrawer")?.addEventListener("click", cerrarDrawer);
    $("closeRuleBackdrop")?.addEventListener("click", cerrarDrawer);

    $("btnToggleDrawer")?.addEventListener("click", function () {
        if (!reglaActiva) return;
        reglaActiva.state = reglaActiva.state === "Enabled" ? "Disabled" : "Enabled";
        toast("Regla " + reglaActiva.state.toLowerCase() + ".");
        abrirDrawer(reglaActiva);
        renderizarTabla();
    });

    $("btnDuplicateDrawer")?.addEventListener("click", function () {
        if (reglaActiva) duplicarRegla(reglaActiva);
    });

    function duplicarRegla(regla) {
        const copia = Object.assign({}, regla, {
            id: "det-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
            name: regla.name + " (copy)",
            labels: regla.labels.slice(),
            alerts: 0,
            source: fuenteActual
        });
        reglas.push(copia);
        toast("Regla duplicada correctamente.");
        cerrarDrawer();
        renderizarTabla();
    }

    $$('[data-detection-source]').forEach(function (boton) {
        boton.addEventListener("click", function () {
            fuenteActual = this.dataset.detectionSource;
            paginaActual = 1;
            seleccionadas.clear();
            $$('[data-detection-source]').forEach(function (control) {
                control.classList.toggle("active", control.dataset.detectionSource === fuenteActual);
            });
            renderizarTabla();
        });
    });

    ["ruleSearch", "searchField", "statusFilter", "severityFilter", "ruleTypeFilter", "dataSourceFilter", "labelFilter", "mitreFilter"].forEach(function (id) {
        const elemento = $(id);
        const evento = elemento?.tagName === "INPUT" ? "input" : "change";
        elemento?.addEventListener(evento, function () {
            paginaActual = 1;
            seleccionadas.clear();
            renderizarTabla();
        });
    });

    $("rulesPerPage")?.addEventListener("change", function () {
        paginaActual = 1;
        renderizarTabla();
    });

    $("previousRulePage")?.addEventListener("click", function () {
        if (paginaActual > 1) paginaActual -= 1;
        renderizarTabla();
    });

    $("nextRulePage")?.addEventListener("click", function () {
        const total = Math.ceil(datosFiltrados().length / Number($("rulesPerPage").value));
        if (paginaActual < total) paginaActual += 1;
        renderizarTabla();
    });

    $$('[data-sort]').forEach(function (boton) {
        boton.addEventListener("click", function () {
            const columna = this.dataset.sort;
            direccionOrden = columnaOrden === columna ? direccionOrden * -1 : 1;
            columnaOrden = columna;
            renderizarTabla();
        });
    });

    $("selectAllRules")?.addEventListener("change", function () {
        const datos = datosFiltrados();
        if (this.checked) datos.forEach(function (regla) { seleccionadas.add(regla.id); });
        else datos.forEach(function (regla) { seleccionadas.delete(regla.id); });
        renderizarTabla();
    });

    function aplicarAccionMasiva(accion) {
        if (seleccionadas.size === 0) {
            toast("Selecciona al menos una regla.");
            return;
        }

        if (accion === "delete") {
            for (let indice = reglas.length - 1; indice >= 0; indice -= 1) {
                if (seleccionadas.has(reglas[indice].id)) reglas.splice(indice, 1);
            }
            toast("Reglas seleccionadas eliminadas del simulador.");
        } else if (accion === "duplicate") {
            const copias = reglas.filter(function (regla) { return seleccionadas.has(regla.id); }).map(function (regla, indice) {
                return Object.assign({}, regla, { id: "det-copy-" + Date.now() + "-" + indice, name: regla.name + " (copy)", labels: regla.labels.slice(), alerts: 0 });
            });
            reglas.push.apply(reglas, copias);
            toast(copias.length + " reglas duplicadas.");
        } else {
            const estado = accion === "enable" ? "Enabled" : "Disabled";
            reglas.forEach(function (regla) {
                if (seleccionadas.has(regla.id)) regla.state = estado;
            });
            toast("Reglas seleccionadas: " + estado + ".");
        }

        seleccionadas.clear();
        $("actionsMenu").hidden = true;
        renderizarTabla();
    }

    $("btnEnableSelected")?.addEventListener("click", function () {
        aplicarAccionMasiva("enable");
    });

    $("btnDetectionActions")?.addEventListener("click", function () {
        $("actionsMenu").hidden = !$("actionsMenu").hidden;
    });

    $$('[data-bulk-action]').forEach(function (boton) {
        boton.addEventListener("click", function () {
            aplicarAccionMasiva(this.dataset.bulkAction);
        });
    });

    document.addEventListener("click", function (evento) {
        if (!evento.target.closest("#btnDetectionActions, #actionsMenu")) $("actionsMenu").hidden = true;
    });

    $("btnMoreFilters")?.addEventListener("click", function () {
        const panel = $("extraFilters");
        panel.hidden = !panel.hidden;
        this.innerHTML = panel.hidden ? '<svg><use href="#i-plus"></use></svg> Add/remove filters' : '<svg><use href="#i-x"></use></svg> Remove extra filters';
    });

    $("btnCollapseFilters")?.addEventListener("click", function () {
        document.querySelector(".detections-filters")?.classList.toggle("collapsed");
    });

    $("btnInheritance")?.addEventListener("click", function () {
        herenciaActiva = !herenciaActiva;
        $("inheritanceNotice").classList.toggle("disabled", !herenciaActiva);
        $("inheritanceText").textContent = herenciaActiva ? "Inheriting settings from: Pax8, Partners scope" : "Using local NeriumTech detection settings";
        this.textContent = herenciaActiva ? "Disable inheritance" : "Enable inheritance";
        toast(herenciaActiva ? "Herencia de reglas activada." : "Configuración local activada.");
    });

    $("btnAutomaticTypes")?.addEventListener("click", function () {
        automaticModal?.classList.add("activo");
    });

    $("closeAutomaticModal")?.addEventListener("click", function () {
        automaticModal?.classList.remove("activo");
    });

    $("saveAutomaticTypes")?.addEventListener("click", function () {
        const activas = $$(".automatic-toggle:checked", automaticModal).length;
        $("automaticCount").textContent = activas;
        automaticModal?.classList.remove("activo");
        toast(activas + " detecciones automáticas activas.");
    });

    automaticModal?.addEventListener("click", function (evento) {
        if (evento.target === automaticModal) automaticModal.classList.remove("activo");
    });

    renderizarTabla();
});