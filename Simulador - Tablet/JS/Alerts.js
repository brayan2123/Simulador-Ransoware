document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const $ = (id) => document.getElementById(id);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    let pausado = false;
    let silenciado = false;
    let volumenMusica = 0.25;
    let volumenEfectos = 0.5;
    let segundosSimulacion = 0;
    let alertaActual = "ransomware";
    let temporizadorToast;

    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const mitigationLayer = $("mitigationLayer");

    /* =========================================
       REGRESAR A DASHBOARDS
    ========================================= */

    document.addEventListener(
        "click",
        function (evento) {
            const enlaceDashboard =
                evento.target.closest(
                    '.side-link[href="Simulado.html"], ' +
                    '.side-link[href="./Simulado.html"]'
                );

            if (!enlaceDashboard) {
                return;
            }

            evento.preventDefault();
            evento.stopImmediatePropagation();

            window.location.href =
                "Simulado.html";
        },
        true
    );

    /* =========================================
       INFORMACIÓN DE LAS ALERTAS
    ========================================= */

    const alertas = {
        ransomware: {
            title:
                "Ransomware encryption behavior detected",

            scope:
                "NeriumTech / Finance / FIN-014",

            mitigation:
                "Unmitigated",

            severity:
                "Critical",

            engine:
                "Behavioral AI",

            time:
                "Aug 24, 2026 09:42:17",

            status:
                "New",

            assigned:
                "Unassigned",

            fileName:
                "Facturas_Q3.docm",

            filePath:
                "C:\\Users\\Carlos\\Downloads\\Facturas_Q3.docm",

            processName:
                "powershell.exe -EncodedCommand JABwAGEAeQBsAG8AYQBkAA==",

            fileHash:
                "A9D8F1C07E2B6E530A8D7D34E9A142F9",

            publisher:
                "Unsigned",

            endpointName:
                "FIN-014 · Carlos Hernández",

            activityCount:
                "5",

            activityTitle:
                "Alert generated",

            activityText:
                "SentinelOne Behavioral AI creó una alerta crítica por cifrado masivo.",

            activityTime:
                "09:42:22",

            rawData:
                "event.type: ransomware_detection\n" +
                "endpoint.name: FIN-014\n" +
                "src.process.name: powershell.exe\n" +
                "file.name: Facturas_Q3.docm\n" +
                "confidence: 98.7\n" +
                "files.modified: 126\n" +
                "mitigation.status: unmitigated",

            completed:
                new Set()
        },

        powershell: {
            title:
                "Suspicious PowerShell encoded command",

            scope:
                "NeriumTech / Finance / FIN-014",

            mitigation:
                "Unmitigated",

            severity:
                "High",

            engine:
                "Behavioral AI",

            time:
                "Aug 24, 2026 09:42:12",

            status:
                "New",

            assigned:
                "Unassigned",

            fileName:
                "powershell.exe",

            filePath:
                "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",

            processName:
                "powershell.exe -NoP -W Hidden -EncodedCommand",

            fileHash:
                "7D8C2F12AA09C87540B620D24A1596EC",

            publisher:
                "Microsoft Windows",

            endpointName:
                "FIN-014 · Carlos Hernández",

            activityCount:
                "3",

            activityTitle:
                "Encoded command detected",

            activityText:
                "El agente identificó contenido codificado y ejecución oculta.",

            activityTime:
                "09:42:12",

            rawData:
                "event.type: suspicious_process\n" +
                "endpoint.name: FIN-014\n" +
                "src.process.name: powershell.exe\n" +
                "command.line: -NoP -W Hidden -EncodedCommand\n" +
                "confidence: 92.4\n" +
                "mitigation.status: unmitigated",

            completed:
                new Set()
        },

        dll: {
            title:
                "Xshell-8.0.0086p.exe - DLL Hijacking detected",

            scope:
                "NeriumTech / IT / IT-006",

            mitigation:
                "Benign",

            severity:
                "High",

            engine:
                "Behavioral AI",

            time:
                "Aug 23, 2026 15:30:23",

            status:
                "Resolved",

            assigned:
                "SOC Nerium",

            fileName:
                "Xshell-8.0.0086p.exe",

            filePath:
                "C:\\Users\\admin\\Downloads\\Xshell-8.0.0086p.exe",

            processName:
                "Xshell-8.0.0086p.exe",

            fileHash:
                "DD57360CE5A15E8798F1FCD17B8F59A2",

            publisher:
                "NETSARANG COMPUTER, INC.",

            endpointName:
                "IT-006 · Mesa de soporte",

            activityCount:
                "5",

            activityTitle:
                "Analyst verdict",

            activityText:
                "El analista cambió el veredicto a falso positivo.",

            activityTime:
                "15:36:36",

            rawData:
                "event.type: dll_hijacking\n" +
                "endpoint.name: IT-006\n" +
                "src.process.name: Xshell-8.0.0086p.exe\n" +
                "signature: signed_and_verified\n" +
                "analyst.verdict: false_positive\n" +
                "mitigation.status: benign",

            completed:
                new Set([
                    "isolate",
                    "kill",
                    "quarantine",
                    "rollback"
                ])
        },

        macro: {
            title:
                "Unusual document macro execution",

            scope:
                "NeriumTech / Human Resources / HR-022",

            mitigation:
                "Mitigated",

            severity:
                "Medium",

            engine:
                "Document AI",

            time:
                "Aug 22, 2026 11:18:07",

            status:
                "Resolved",

            assigned:
                "SOC Nerium",

            fileName:
                "Onboarding_Agosto.docm",

            filePath:
                "C:\\Users\\rrhh\\Documents\\Onboarding_Agosto.docm",

            processName:
                "winword.exe /mAutoOpen",

            fileHash:
                "98A631CDB4F1C971A53F123841D0A561",

            publisher:
                "Unknown macro publisher",

            endpointName:
                "HR-022 · Recursos Humanos",

            activityCount:
                "4",

            activityTitle:
                "Macro blocked",

            activityText:
                "La política de documentos bloqueó la macro antes de ejecutar el payload.",

            activityTime:
                "11:18:09",

            rawData:
                "event.type: macro_execution\n" +
                "endpoint.name: HR-022\n" +
                "src.process.name: winword.exe\n" +
                "macro.name: AutoOpen\n" +
                "confidence: 81.1\n" +
                "mitigation.status: mitigated",

            completed:
                new Set([
                    "isolate",
                    "kill",
                    "quarantine",
                    "rollback"
                ])
        },

        network: {
            title:
                "Outbound connection to suspicious IP",

            scope:
                "NeriumTech / Operations / OPS-009",

            mitigation:
                "Unmitigated",

            severity:
                "High",

            engine:
                "Network AI",

            time:
                "Aug 21, 2026 18:05:44",

            status:
                "New",

            assigned:
                "Unassigned",

            fileName:
                "svchost32.exe",

            filePath:
                "C:\\ProgramData\\SystemCache\\svchost32.exe",

            processName:
                "svchost32.exe --connect 165.227.248.56:443",

            fileHash:
                "AE1B90F0A0F82271B2E10432CC3D671E",

            publisher:
                "Unsigned",

            endpointName:
                "OPS-009 · Operaciones",

            activityCount:
                "2",

            activityTitle:
                "C2 connection detected",

            activityText:
                "Conexión TLS hacia una IP asociada con infraestructura de comando y control.",

            activityTime:
                "18:05:44",

            rawData:
                "event.type: ip_connect\n" +
                "endpoint.name: OPS-009\n" +
                "destination.ip: 165.227.248.56\n" +
                "destination.port: 443\n" +
                "confidence: 89.6\n" +
                "mitigation.status: unmitigated",

            completed:
                new Set()
        }
    };

    /* =========================================
       AUDIO
    ========================================= */

    function reproducirMusica() {
        if (
            !musica ||
            silenciado ||
            pausado
        ) {
            return;
        }

        musica.volume =
            volumenMusica;

        musica
            .play()
            .catch(function () {});
    }

    if (musica) {
        musica.volume =
            volumenMusica;

        musica
            .play()
            .catch(function () {});
    }

    document.addEventListener(
        "pointerdown",
        function iniciarMusica() {
            reproducirMusica();

            document.removeEventListener(
                "pointerdown",
                iniciarMusica
            );
        },
        { once: true }
    );

    function sonidoBoton() {
        if (silenciado) {
            return;
        }

        const sonido =
            new Audio(
                "Audio/Boton.mp3"
            );

        sonido.volume =
            volumenEfectos;

        sonido
            .play()
            .catch(function () {});
    }

    $$("button").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                sonidoBoton
            );
        }
    );

    /* =========================================
       MENSAJES
    ========================================= */

    function toast(mensaje) {
        const elemento =
            $("toast");

        const texto =
            $("toastTexto");

        if (!elemento || !texto) {
            return;
        }

        texto.textContent =
            mensaje;

        elemento.classList.add(
            "activo"
        );

        clearTimeout(
            temporizadorToast
        );

        temporizadorToast =
            setTimeout(function () {
                elemento.classList.remove(
                    "activo"
                );
            }, 2800);
    }

    /* =========================================
       TEMPORIZADOR
    ========================================= */

    function formatearTiempo(
        totalSegundos
    ) {
        const horas = String(
            Math.floor(
                totalSegundos / 3600
            )
        ).padStart(2, "0");

        const minutos = String(
            Math.floor(
                (totalSegundos % 3600) /
                    60
            )
        ).padStart(2, "0");

        const segundos = String(
            totalSegundos % 60
        ).padStart(2, "0");

        return (
            horas +
            ":" +
            minutos +
            ":" +
            segundos
        );
    }

    setInterval(function () {
        if (!pausado) {
            segundosSimulacion += 1;
        }

        if ($("relojSimulacion")) {
            $(
                "relojSimulacion"
            ).textContent =
                formatearTiempo(
                    segundosSimulacion
                );
        }
    }, 1000);

    /* =========================================
       PAUSA Y CONFIGURACIÓN
    ========================================= */

    function abrirPausa() {
        pausado = true;

        overlayPausa?.classList.add(
            "activo"
        );

        musica?.pause();
    }

    function cerrarPausa() {
        pausado = false;

        overlayPausa?.classList.remove(
            "activo"
        );

        reproducirMusica();
    }

    function abrirConfig() {
        overlayConfig?.classList.add(
            "activo"
        );
    }

    function cerrarConfig() {
        overlayConfig?.classList.remove(
            "activo"
        );

        if (pausado) {
            overlayPausa?.classList.add(
                "activo"
            );
        }
    }

    function regresarInicio() {
        window.location.href =
            "index.html";
    }

    $("btnPausa")
        ?.addEventListener(
            "click",
            abrirPausa
        );

    $("btnContinuar")
        ?.addEventListener(
            "click",
            cerrarPausa
        );

    $("btnConfiguracion")
        ?.addEventListener(
            "click",
            abrirConfig
        );

    $("cerrarConfig")
        ?.addEventListener(
            "click",
            cerrarConfig
        );

    $("guardarConfig")
        ?.addEventListener(
            "click",
            cerrarConfig
        );

    $("btnRegresar")
        ?.addEventListener(
            "click",
            regresarInicio
        );

    $("btnInicioPausa")
        ?.addEventListener(
            "click",
            regresarInicio
        );

    $("btnConfigPausa")
        ?.addEventListener(
            "click",
            function () {
                overlayPausa
                    ?.classList.remove(
                        "activo"
                    );

                abrirConfig();
            }
        );

    $("volumenMusica")
        ?.addEventListener(
            "input",
            function () {
                volumenMusica =
                    Number(
                        this.value
                    ) / 100;

                if ($("valorMusica")) {
                    $(
                        "valorMusica"
                    ).textContent =
                        this.value +
                        "%";
                }

                if (
                    musica &&
                    !silenciado
                ) {
                    musica.volume =
                        volumenMusica;
                }
            }
        );

    $("volumenEfectos")
        ?.addEventListener(
            "input",
            function () {
                volumenEfectos =
                    Number(
                        this.value
                    ) / 100;

                if ($("valorEfectos")) {
                    $(
                        "valorEfectos"
                    ).textContent =
                        this.value +
                        "%";
                }
            }
        );

    $("silenciar")
        ?.addEventListener(
            "change",
            function () {
                silenciado =
                    this.checked;

                if (silenciado) {
                    musica?.pause();
                } else {
                    reproducirMusica();
                }
            }
        );

    /* =========================================
       MENÚ RESPONSIVE
    ========================================= */

    function cerrarMenu() {
        document.body.classList.remove(
            "menu-abierto"
        );
    }

    $("btnAbrirMenu")
        ?.addEventListener(
            "click",
            function () {
                document.body
                    .classList.toggle(
                        "menu-abierto"
                    );
            }
        );

    $("sidebarBackdrop")
        ?.addEventListener(
            "click",
            cerrarMenu
        );

    /*
       Solamente bloquea las pantallas
       que todavía no están listas.

       Dashboard no se bloquea porque
       tiene data-ready="true".
    */

    $$(
        '.side-link:not(.active):not([data-ready="true"])'
    ).forEach(function (enlace) {
        enlace.addEventListener(
            "click",
            function (evento) {
                evento.preventDefault();

                cerrarMenu();

                toast(
                    "Este módulo se habilitará en la siguiente pantalla de la simulación."
                );
            }
        );
    });

    /* =========================================
       BUSCADOR DEL MENÚ
    ========================================= */

    const menuSearch =
        $("menuSearch");

    function filtrarMenu() {
        const termino = (
            menuSearch?.value || ""
        )
            .trim()
            .toLowerCase();

        $$(".side-link").forEach(
            function (enlace) {
                const texto = (
                    enlace.dataset
                        .menuText ||
                    enlace.textContent
                ).toLowerCase();

                enlace.hidden =
                    Boolean(termino) &&
                    !texto.includes(
                        termino
                    );
            }
        );
    }

    menuSearch?.addEventListener(
        "input",
        filtrarMenu
    );

    document.addEventListener(
        "keydown",
        function (evento) {
            if (
                (evento.ctrlKey ||
                    evento.metaKey) &&
                evento.key.toLowerCase() ===
                    "k"
            ) {
                evento.preventDefault();

                menuSearch?.focus();
            }
        }
    );

    $("btnAyuda")
        ?.addEventListener(
            "click",
            function () {
                toast(
                    "Selecciona una alerta, revisa la evidencia y aplica las mitigaciones correctas."
                );
            }
        );

    $("btnNotificaciones")
        ?.addEventListener(
            "click",
            function () {
                toast(
                    "1 alerta crítica nueva en FIN-014."
                );
            }
        );

    /* =========================================
       FILTROS
    ========================================= */

    const panelFiltros =
        $("panelFiltros");

    const btnMostrarFiltros =
        $("btnMostrarFiltros");

    btnMostrarFiltros
        ?.addEventListener(
            "click",
            function () {
                const abrir =
                    panelFiltros
                        ?.hasAttribute(
                            "hidden"
                        );

                if (abrir) {
                    panelFiltros
                        .removeAttribute(
                            "hidden"
                        );
                } else {
                    panelFiltros
                        ?.setAttribute(
                            "hidden",
                            ""
                        );
                }

                btnMostrarFiltros
                    .classList.toggle(
                        "abierto",
                        Boolean(abrir)
                    );
            }
        );

    function normalizar(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );
    }

    function aplicarFiltros() {
        const termino =
            normalizar(
                $("buscarAlerta")
                    ?.value.trim() || ""
            );

        const severidad =
            $("filtroSeverity")
                ?.value || "all";

        const estadoFiltro =
            $("filtroEstado")
                ?.value || "all";

        let visibles = 0;

        $$(".alert-list-item")
            .forEach(
                function (fila) {
                    const coincideTexto =
                        !termino ||
                        normalizar(
                            fila.textContent
                        ).includes(
                            termino
                        );

                    const coincideSeveridad =
                        severidad ===
                            "all" ||
                        fila.dataset
                            .severity ===
                            severidad;

                    const coincideEstado =
                        estadoFiltro ===
                            "all" ||
                        fila.dataset
                            .status ===
                            estadoFiltro;

                    const visible =
                        coincideTexto &&
                        coincideSeveridad &&
                        coincideEstado;

                    fila.hidden =
                        !visible;

                    if (visible) {
                        visibles += 1;
                    }
                }
            );

        if ($("visibleAlerts")) {
            $(
                "visibleAlerts"
            ).textContent =
                String(visibles);
        }

        const activa =
            document.querySelector(
                ".alert-list-item.active"
            );

        if (
            !activa ||
            activa.hidden
        ) {
            const primeraVisible =
                document.querySelector(
                    ".alert-list-item:not([hidden])"
                );

            primeraVisible?.click();
        }
    }

    $("buscarAlerta")
        ?.addEventListener(
            "input",
            aplicarFiltros
        );

    $("filtroSeverity")
        ?.addEventListener(
            "change",
            aplicarFiltros
        );

    $("filtroEstado")
        ?.addEventListener(
            "change",
            aplicarFiltros
        );

    $$("[data-quick-severity]")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const valor =
                        this.dataset
                            .quickSeverity;

                    if (
                        $("filtroSeverity")
                    ) {
                        $(
                            "filtroSeverity"
                        ).value =
                            valor;
                    }

                    aplicarFiltros();
                }
            );
        });

    /* =========================================
       DATOS DE ALERTAS
    ========================================= */

    function definirTexto(
        id,
        valor
    ) {
        if ($(id)) {
            $(id).textContent =
                valor;
        }
    }

    function actualizarProgresoMitigacion() {
        const datos =
            alertas[alertaActual];

        const completadas =
            datos.completed.size;

        $$("[data-mitigation]")
            .forEach(
                function (boton) {
                    boton.classList.toggle(
                        "completada",
                        datos.completed.has(
                            boton.dataset
                                .mitigation
                        )
                    );
                }
            );

        if (
            $("mitigationProgress")
        ) {
            $(
                "mitigationProgress"
            ).style.width =
                completadas * 25 +
                "%";
        }

        if (
            $("mitigationResult")
        ) {
            $(
                "mitigationResult"
            ).textContent =
                completadas === 4
                    ? "Amenaza contenida · endpoint protegido"
                    : completadas +
                      " de 4 acciones completadas";

            $(
                "mitigationResult"
            ).classList.toggle(
                "exito",
                completadas === 4
            );
        }
    }

    function actualizarFilaSeleccionada(
        datos
    ) {
        const fila =
            document.querySelector(
                '[data-alert-id="' +
                    alertaActual +
                    '"]'
            );

        if (!fila) {
            return;
        }

        fila.dataset.status =
            datos.status.toLowerCase();

        const etiquetaEstado =
            fila.querySelector(
                ".alert-meta b"
            );

        const etiquetaMitigacion =
            fila.querySelector(
                ".alert-meta em"
            );

        if (etiquetaEstado) {
            etiquetaEstado.textContent =
                datos.status;

            etiquetaEstado.className =
                datos.status ===
                "Resolved"
                    ? "status-resolved"
                    : "status-new";
        }

        if (
            etiquetaMitigacion
        ) {
            etiquetaMitigacion
                .textContent =
                datos.mitigation;
        }
    }

    function mostrarAlerta(id) {
        const datos =
            alertas[id];

        if (!datos) {
            return;
        }

        alertaActual = id;

        $$(".alert-list-item")
            .forEach(
                function (fila) {
                    fila.classList.toggle(
                        "active",
                        fila.dataset
                            .alertId ===
                            id
                    );
                }
            );

        definirTexto(
            "detailTitle",
            datos.title
        );

        definirTexto(
            "detailScope",
            datos.scope
        );

        definirTexto(
            "detailMitigation",
            datos.mitigation
        );

        definirTexto(
            "detailSeverity",
            datos.severity
        );

        definirTexto(
            "detailEngine",
            datos.engine
        );

        definirTexto(
            "detailTime",
            datos.time
        );

        definirTexto(
            "fileName",
            datos.fileName
        );

        definirTexto(
            "filePath",
            datos.filePath
        );

        definirTexto(
            "processName",
            datos.processName
        );

        definirTexto(
            "fileHash",
            datos.fileHash
        );

        definirTexto(
            "publisher",
            datos.publisher
        );

        definirTexto(
            "endpointName",
            datos.endpointName
        );

        definirTexto(
            "activityCount",
            datos.activityCount
        );

        definirTexto(
            "rawData",
            datos.rawData
        );

        const severity =
            $("detailSeverity");

        if (severity) {
            severity.className =
                "summary-" +
                datos.severity
                    .toLowerCase();
        }

        if ($("detailStatus")) {
            $("detailStatus").value =
                datos.status;
        }

        if ($("detailAssigned")) {
            $("detailAssigned").value =
                datos.assigned;
        }

        const actividad =
            $("analystActivity");

        if (actividad) {
            actividad.innerHTML =
                "<time>" +
                datos.activityTime +
                "</time>" +
                "<strong>" +
                datos.activityTitle +
                "</strong>" +
                "<p>" +
                datos.activityText +
                "</p>";
        }

        const mitigada =
            datos.completed.size === 4;

        definirTexto(
            "mitigationTitle",
            mitigada
                ? "Threat mitigated"
                : "Mitigation required"
        );

        definirTexto(
            "mitigationText",
            mitigada
                ? "Las acciones de contención y recuperación fueron completadas."
                : "Aísla el endpoint y bloquea el archivo para detener el ataque."
        );

        actualizarProgresoMitigacion();
    }

    $$(".alert-list-item")
        .forEach(function (fila) {
            fila.addEventListener(
                "click",
                function () {
                    mostrarAlerta(
                        this.dataset
                            .alertId
                    );
                }
            );
        });

    /* =========================================
       PESTAÑAS
    ========================================= */

    function activarTab(nombre) {
        $$("[data-detail-tab]")
            .forEach(
                function (boton) {
                    boton.classList.toggle(
                        "active",
                        boton.dataset
                            .detailTab ===
                            nombre
                    );
                }
            );

        $$("[data-panel]")
            .forEach(
                function (panel) {
                    const activo =
                        panel.dataset
                            .panel ===
                        nombre;

                    panel.hidden =
                        !activo;

                    panel.classList.toggle(
                        "active",
                        activo
                    );
                }
            );
    }

    $$("[data-detail-tab]")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    activarTab(
                        this.dataset
                            .detailTab
                    );
                }
            );
        });

    $("btnStoryline")
        ?.addEventListener(
            "click",
            function () {
                activarTab("graph");

                toast(
                    "Storyline reconstruido desde el documento hasta el cifrado."
                );
            }
        );

    $("btnEventSearch")
        ?.addEventListener(
            "click",
            function () {
                toast(
                    "Consulta creada con los indicadores de esta alerta."
                );
            }
        );

    $("btnActions")
        ?.addEventListener(
            "click",
            function () {
                const datos =
                    alertas[
                        alertaActual
                    ];

                datos.assigned =
                    "SOC Nerium";

                if (
                    $("detailAssigned")
                ) {
                    $(
                        "detailAssigned"
                    ).value =
                        datos.assigned;
                }

                toast(
                    "Alerta asignada al equipo SOC Nerium."
                );
            }
        );

    $("detailAssigned")
        ?.addEventListener(
            "change",
            function () {
                alertas[
                    alertaActual
                ].assigned =
                    this.value;

                toast(
                    "Responsable actualizado a " +
                        this.value +
                        "."
                );
            }
        );

    $("detailStatus")
        ?.addEventListener(
            "change",
            function () {
                const datos =
                    alertas[
                        alertaActual
                    ];

                datos.status =
                    this.value;

                actualizarFilaSeleccionada(
                    datos
                );

                aplicarFiltros();

                toast(
                    "Estado de la alerta actualizado a " +
                        this.value +
                        "."
                );
            }
        );

    $("btnGuardarNota")
        ?.addEventListener(
            "click",
            function () {
                const nota =
                    $("analystNote")
                        ?.value.trim();

                if (!nota) {
                    toast(
                        "Escribe una nota antes de guardarla."
                    );

                    return;
                }

                const contador =
                    document.querySelector(
                        '[data-detail-tab="notes"] b'
                    );

                if (contador) {
                    contador.textContent =
                        "1";
                }

                $("analystNote").value =
                    "";

                toast(
                    "Nota del analista guardada."
                );
            }
        );

    $("campoBusqueda")
        ?.addEventListener(
            "change",
            function () {
                const input =
                    $("buscarAlerta");

                if (input) {
                    input.placeholder =
                        this.value ===
                        "Endpoint"
                            ? "FIN-014"
                            : "Search";
                }
            }
        );

    $(
        ".properties-card header button"
    );

    $$(".properties-card header button")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    toast(
                        "Archivo preparado para análisis forense."
                    );
                }
            );
        });

    /* =========================================
       MITIGACIÓN
    ========================================= */

    function abrirMitigacion() {
        mitigationLayer
            ?.classList.add(
                "activo"
            );

        mitigationLayer
            ?.setAttribute(
                "aria-hidden",
                "false"
            );

        actualizarProgresoMitigacion();
    }

    function cerrarMitigacion() {
        mitigationLayer
            ?.classList.remove(
                "activo"
            );

        mitigationLayer
            ?.setAttribute(
                "aria-hidden",
                "true"
            );
    }

    $("btnMitigar")
        ?.addEventListener(
            "click",
            abrirMitigacion
        );

    $$("[data-open-mitigation]")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                abrirMitigacion
            );
        });

    $("cerrarMitigation")
        ?.addEventListener(
            "click",
            cerrarMitigacion
        );

    $("cerrarMitigationBackdrop")
        ?.addEventListener(
            "click",
            cerrarMitigacion
        );

    const textosMitigacion = {
        isolate:
            "Endpoint aislado de la red.",

        kill:
            "Proceso malicioso terminado.",

        quarantine:
            "Archivo movido a cuarentena.",

        rollback:
            "Cambios del ransomware revertidos."
    };

    $$("[data-mitigation]")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const datos =
                        alertas[
                            alertaActual
                        ];

                    const accion =
                        this.dataset
                            .mitigation;

                    if (
                        datos.completed.has(
                            accion
                        )
                    ) {
                        toast(
                            "Esta acción ya fue completada."
                        );

                        return;
                    }

                    datos.completed.add(
                        accion
                    );

                    actualizarProgresoMitigacion();

                    toast(
                        textosMitigacion[
                            accion
                        ]
                    );

                    if (
                        datos.completed
                            .size === 4
                    ) {
                        datos.mitigation =
                            "Mitigated";

                        datos.status =
                            "Resolved";

                        definirTexto(
                            "detailMitigation",
                            datos.mitigation
                        );

                        if (
                            $("detailStatus")
                        ) {
                            $(
                                "detailStatus"
                            ).value =
                                datos.status;
                        }

                        definirTexto(
                            "mitigationTitle",
                            "Threat mitigated"
                        );

                        definirTexto(
                            "mitigationText",
                            "Las acciones de contención y recuperación fueron completadas."
                        );

                        actualizarFilaSeleccionada(
                            datos
                        );

                        setTimeout(
                            function () {
                                cerrarMitigacion();

                                toast(
                                    "Amenaza contenida. FIN-014 está protegido."
                                );
                            },
                            700
                        );
                    }
                }
            );
        });

    /* =========================================
       CONTROLES SECUNDARIOS
    ========================================= */

    $$(".alerts-tabs button")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    $$(
                        ".alerts-tabs button"
                    ).forEach(
                        function (otro) {
                            otro.classList.remove(
                                "active"
                            );
                        }
                    );

                    this.classList.add(
                        "active"
                    );

                    toast(
                        this.textContent.trim() +
                            " alerts seleccionadas."
                    );
                }
            );
        });

    $$(".view-switch button")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    $$(
                        ".view-switch button"
                    ).forEach(
                        function (otro) {
                            otro.classList.remove(
                                "active"
                            );
                        }
                    );

                    this.classList.add(
                        "active"
                    );

                    toast(
                        "Vista de alertas actualizada."
                    );
                }
            );
        });

    /* =========================================
       TECLA ESCAPE
    ========================================= */

    document.addEventListener(
        "keydown",
        function (evento) {
            if (
                evento.key !==
                "Escape"
            ) {
                return;
            }

            cerrarMitigacion();
            cerrarMenu();

            overlayConfig
                ?.classList.remove(
                    "activo"
                );

            if (
                overlayPausa
                    ?.classList.contains(
                        "activo"
                    )
            ) {
                cerrarPausa();
            }
        }
    );

    /* =========================================
       ALERTA INICIAL
    ========================================= */

    mostrarAlerta(
        alertaActual
    );
});