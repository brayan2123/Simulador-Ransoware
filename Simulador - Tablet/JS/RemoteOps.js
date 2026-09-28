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
    let temporizadorToast;
    let pestañaActual = "library";
    let paginaActual = 1;
    let scriptActivo = null;
    let scriptEditando = null;
    let direccionOrden = 1;
    let columnaOrden = "name";

    const seleccionados = new Set();
    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const scriptDrawer = $("scriptDrawer");
    const scriptModal = $("scriptModal");

    const libraryItems = [
        crearScript(
            "ro-001",
            "Prompt Security Agent Uninstall (Windows)",
            "Action",
            "Windows",
            "1.0.0",
            "SentinelOne",
            "Mar 22, 2026 6:00 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Removes the Prompt Security agent from a Windows endpoint."
        ),
        crearScript(
            "ro-002",
            "Prompt Security Agent Uninstall (macOS)",
            "Action",
            "macOS",
            "1.0.0",
            "SentinelOne",
            "Mar 22, 2026 6:00 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Removes the Prompt Security agent from a macOS endpoint."
        ),
        crearScript(
            "ro-003",
            "Prompt Security Agent Install (Windows)",
            "Action",
            "Windows",
            "1.0.0",
            "SentinelOne",
            "Mar 22, 2026 6:00 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Installs the Prompt Security agent on Windows."
        ),
        crearScript(
            "ro-004",
            "Prompt Security Agent Install (macOS)",
            "Action",
            "macOS",
            "1.0.0",
            "SentinelOne",
            "Mar 22, 2026 6:00 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Installs the Prompt Security agent on macOS."
        ),
        crearScript(
            "ro-005",
            "Prompt Security Extension Uninstall",
            "Action",
            "Windows",
            "1.0.0",
            "SentinelOne",
            "Feb 5, 2026 12:52 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Uninstalls the browser security extension."
        ),
        crearScript(
            "ro-006",
            "Prompt Security Extension Uninstall (macOS)",
            "Action",
            "macOS",
            "1.0.0",
            "SentinelOne",
            "Feb 5, 2026 12:52 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Uninstalls the browser security extension from macOS."
        ),
        crearScript(
            "ro-007",
            "Prompt Security Extension Install",
            "Action",
            "Windows",
            "1.0.0",
            "SentinelOne",
            "Feb 5, 2026 12:52 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Deploys the Prompt Security extension."
        ),
        crearScript(
            "ro-008",
            "Prompt Security Extension Install (macOS)",
            "Action",
            "macOS",
            "1.0.0",
            "SentinelOne",
            "Feb 5, 2026 12:52 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Deploys the Prompt Security extension to macOS."
        ),
        crearScript(
            "ro-009",
            "Identity Agent Uninstaller",
            "Action",
            "Windows",
            "5.5.4.128",
            "SentinelOne",
            "Sep 1, 2024 12:04 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Removes the Identity agent."
        ),
        crearScript(
            "ro-010",
            "Find File by Drive",
            "Data Collection",
            "Windows",
            "1.0.0",
            "SentinelOne",
            "Mar 19, 2023 1:42 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Searches a drive for files matching a name or hash."
        ),
        crearScript(
            "ro-011",
            "Move File",
            "Action",
            "Windows",
            "1.0.0",
            "SentinelOne",
            "Mar 19, 2023 1:42 AM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Moves a suspicious file into quarantine."
        ),
        crearScript(
            "ro-012",
            "Beta: Remove Installed Application",
            "Action",
            "Windows",
            "0.0.1",
            "SentinelOne",
            "Oct 22, 2022 11:15 PM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Removes an installed application."
        ),
        crearScript(
            "ro-013",
            "Download File (Windows)",
            "Data Collection",
            "Windows",
            "1.0.0",
            "SentinelOne",
            "Aug 13, 2022 11:42 PM",
            "May 10, 2026 3:49 AM",
            "Global",
            "Retrieves a file for forensic analysis."
        ),
        crearScript(
            "ro-014",
            "Collect Ransomware Indicators",
            "Data Collection",
            "Windows",
            "2.1.0",
            "NeriumTech",
            "Aug 21, 2026 8:44 AM",
            "Aug 21, 2026 9:12 AM",
            "Brayan",
            "Collects processes, hashes and file changes from FIN-014."
        ),
        crearScript(
            "ro-015",
            "Stop Suspicious PowerShell",
            "Action",
            "Windows",
            "1.4.2",
            "NeriumTech",
            "Aug 21, 2026 8:48 AM",
            "Aug 21, 2026 9:20 AM",
            "Brayan",
            "Stops suspicious PowerShell processes."
        ),
        crearScript(
            "ro-016",
            "Verify Backup Connectivity",
            "Data Collection",
            "All",
            "1.2.0",
            "NeriumTech",
            "Aug 21, 2026 9:02 AM",
            "Aug 21, 2026 9:18 AM",
            "Karla",
            "Checks connectivity with the protected backup."
        ),
        crearScript(
            "ro-017",
            "Restore Network Adapter",
            "Action",
            "Windows",
            "1.0.3",
            "NeriumTech",
            "Aug 21, 2026 9:05 AM",
            "Aug 21, 2026 9:19 AM",
            "Carlos",
            "Restores the network adapter after recovery."
        ),
        crearScript(
            "ro-018",
            "Memory Snapshot Collector",
            "Data Collection",
            "All",
            "3.0.1",
            "SentinelOne",
            "Jul 15, 2026 7:18 AM",
            "Aug 10, 2026 6:30 AM",
            "Global",
            "Creates a memory snapshot for investigation."
        )
    ];

    const scheduledItems = [
        crearTask(
            "sc-001",
            "Daily ransomware indicator collection",
            "Data Collection",
            "Windows",
            "2.1.0",
            "NeriumTech",
            "Aug 22, 2026 2:00 AM",
            "Scheduled",
            "FIN-014",
            "Collect Ransomware Indicators"
        ),
        crearTask(
            "sc-002",
            "Verify backup connectivity",
            "Data Collection",
            "All",
            "1.2.0",
            "NeriumTech",
            "Aug 22, 2026 3:00 AM",
            "Scheduled",
            "Finance group",
            "Verify Backup Connectivity"
        ),
        crearTask(
            "sc-003",
            "Weekly memory snapshot",
            "Data Collection",
            "All",
            "3.0.1",
            "SentinelOne",
            "Aug 24, 2026 1:30 AM",
            "Scheduled",
            "Default Group",
            "Memory Snapshot Collector"
        ),
        crearTask(
            "sc-004",
            "Re-enable FIN-014 network adapter",
            "Action",
            "Windows",
            "1.0.3",
            "NeriumTech",
            "Waiting for approval",
            "Paused",
            "FIN-014",
            "Restore Network Adapter"
        )
    ];

    const pendingItems = [
        crearTask(
            "ex-001",
            "Collect indicators on FIN-014",
            "Data Collection",
            "Windows",
            "2.1.0",
            "NeriumTech",
            "Aug 21, 2026 4:18 PM",
            "Running",
            "FIN-014",
            "Collect Ransomware Indicators"
        ),
        crearTask(
            "ex-002",
            "Stop suspicious PowerShell",
            "Action",
            "Windows",
            "1.4.2",
            "NeriumTech",
            "Aug 21, 2026 4:05 PM",
            "Completed",
            "FIN-014",
            "Stop Suspicious PowerShell"
        ),
        crearTask(
            "ex-003",
            "Verify backup connectivity",
            "Data Collection",
            "All",
            "1.2.0",
            "NeriumTech",
            "Aug 21, 2026 3:54 PM",
            "Failed",
            "Finance group",
            "Verify Backup Connectivity"
        )
    ];

    function crearScript(
        id,
        name,
        type,
        os,
        version,
        author,
        upload,
        updated,
        updatedBy,
        description
    ) {
        return {
            id,
            name,
            type,
            os,
            version,
            author,
            upload,
            updated,
            updatedBy,
            description,
            status: "Ready",
            target: "Library"
        };
    }

    function crearTask(
        id,
        name,
        type,
        os,
        version,
        author,
        updated,
        status,
        target,
        sourceName
    ) {
        return {
            id,
            name,
            type,
            os,
            version,
            author,
            upload: updated,
            updated,
            updatedBy: "Nerium SOC",
            description:
                sourceName + " configured for " + target + ".",
            status,
            target
        };
    }

    /* ========================================
       AUDIO
    ======================================== */

    function reproducirMusica() {
        if (!musica || silenciado || pausado) return;

        musica.volume = volumenMusica;
        musica.play().catch(function () {});
    }

    if (musica) {
        musica.volume = volumenMusica;
        musica.play().catch(function () {});
    }

    document.addEventListener(
        "pointerdown",
        reproducirMusica,
        { once: true }
    );

    function sonidoBoton() {
        if (silenciado || volumenEfectos === 0) return;

        const sonido = new Audio("Audio/Boton.mp3");
        sonido.volume = volumenEfectos;
        sonido.play().catch(function () {});
    }

    document.addEventListener("click", function (evento) {
        if (
            evento.target.closest(
                "button, .side-link, select, input, textarea"
            )
        ) {
            sonidoBoton();
        }
    });

    /* ========================================
       NOTIFICACIONES
    ======================================== */

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

    /* ========================================
       RELOJ
    ======================================== */

    function formatearTiempo(total) {
        const horas = String(
            Math.floor(total / 3600)
        ).padStart(2, "0");

        const minutos = String(
            Math.floor((total % 3600) / 60)
        ).padStart(2, "0");

        const segundos = String(total % 60).padStart(2, "0");

        return horas + ":" + minutos + ":" + segundos;
    }

    window.setInterval(function () {
        if (!pausado) {
            segundosSimulacion += 1;
        }

        if ($("relojSimulacion")) {
            $("relojSimulacion").textContent =
                formatearTiempo(segundosSimulacion);
        }
    }, 1000);

    /* ========================================
       PAUSA Y CONFIGURACIÓN
    ======================================== */

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

        if (pausado) {
            overlayPausa?.classList.add("activo");
        }
    }

    function regresarInicio() {
        window.location.href = "index.html";
    }

    $("btnPausa")?.addEventListener("click", abrirPausa);
    $("btnContinuar")?.addEventListener("click", cerrarPausa);
    $("btnConfiguracion")?.addEventListener(
        "click",
        abrirConfig
    );
    $("cerrarConfig")?.addEventListener("click", cerrarConfig);
    $("guardarConfig")?.addEventListener("click", cerrarConfig);
    $("btnRegresar")?.addEventListener("click", regresarInicio);
    $("btnInicioPausa")?.addEventListener(
        "click",
        regresarInicio
    );

    $("btnConfigPausa")?.addEventListener("click", function () {
        overlayPausa?.classList.remove("activo");
        abrirConfig();
    });

    $("volumenMusica")?.addEventListener("input", function () {
        volumenMusica = Number(this.value) / 100;

        if ($("valorMusica")) {
            $("valorMusica").textContent = this.value + "%";
        }

        if (musica && !silenciado) {
            musica.volume = volumenMusica;
        }
    });

    $("volumenEfectos")?.addEventListener("input", function () {
        volumenEfectos = Number(this.value) / 100;

        if ($("valorEfectos")) {
            $("valorEfectos").textContent =
                this.value + "%";
        }
    });

    $("silenciar")?.addEventListener("change", function () {
        silenciado = this.checked;

        if (silenciado) {
            musica?.pause();
        } else {
            reproducirMusica();
        }
    });

    /* ========================================
       MENÚ LATERAL
    ======================================== */

    function cerrarMenu() {
        document.body.classList.remove("menu-abierto");
    }

    $("btnAbrirMenu")?.addEventListener("click", function () {
        document.body.classList.toggle("menu-abierto");
    });

    $("sidebarBackdrop")?.addEventListener(
        "click",
        cerrarMenu
    );

    $$('.side-link:not(.active):not([data-ready="true"])')
        .forEach(function (enlace) {
            enlace.addEventListener("click", function (evento) {
                evento.preventDefault();
                cerrarMenu();

                toast(
                    "Este módulo se conectará cuando construyamos su pantalla."
                );
            });
        });

    $("menuSearch")?.addEventListener("input", function () {
        const termino = this.value.trim().toLowerCase();

        $$(".side-link").forEach(function (enlace) {
            const texto = (
                enlace.dataset.menuText ||
                enlace.textContent
            ).toLowerCase();

            enlace.hidden =
                Boolean(termino) &&
                !texto.includes(termino);
        });
    });

    document.addEventListener("keydown", function (evento) {
        if (
            (evento.ctrlKey || evento.metaKey) &&
            evento.key.toLowerCase() === "k"
        ) {
            evento.preventDefault();
            $("menuSearch")?.focus();
        }
    });

    $("btnAyuda")?.addEventListener("click", function () {
        toast(
            "Selecciona un script para ver sus datos, editarlo o ejecutarlo."
        );
    });

    $("btnNotificaciones")?.addEventListener(
        "click",
        function () {
            const pendientes = pendingItems.filter(
                function (item) {
                    return item.status === "Running";
                }
            ).length;

            toast(
                pendientes +
                (pendientes === 1
                    ? " ejecución activa."
                    : " ejecuciones activas.")
            );
        }
    );

    $("btnAgentTasks")?.addEventListener("click", function () {
        toast(
            "Agent Tasks quedará conectado en la pantalla Agent management."
        );
    });

    /* ========================================
       DATOS
    ======================================== */

    function datosActuales() {
        if (pestañaActual === "scheduled") {
            return scheduledItems;
        }

        if (pestañaActual === "pending") {
            return pendingItems;
        }

        return libraryItems;
    }

    function escapar(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function iconoOS(os) {
        if (os === "macOS") {
            return `
                <span class="os-icon" aria-label="macOS">
                    <svg><use href="#i-apple"></use></svg>
                </span>
            `;
        }

        if (os === "All") {
            return `
                <span class="os-icon" aria-label="Windows y macOS">
                    <svg><use href="#i-device"></use></svg>
                </span>
            `;
        }

        return `
            <span class="os-icon" aria-label="Windows">
                <svg><use href="#i-windows"></use></svg>
            </span>
        `;
    }

    function claseEstado(status) {
        const estado = status.toLowerCase();

        if (estado.includes("running")) {
            return "running";
        }

        if (
            estado.includes("completed") ||
            estado.includes("scheduled")
        ) {
            return "completed";
        }

        if (
            estado.includes("failed") ||
            estado.includes("paused")
        ) {
            return "failed";
        }

        return "";
    }

    function datosFiltrados() {
        const busqueda = (
            $("scriptSearch")?.value || ""
        ).trim().toLowerCase();

        const tipo =
            $("typeFilter")?.value || "all";

        const sistema =
            $("osFilter")?.value || "all";

        const filtrados = datosActuales().filter(
            function (item) {
                const coincideTexto =
                    !busqueda ||
                    [
                        item.name,
                        item.type,
                        item.author,
                        item.id,
                        item.target
                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(busqueda);

                const coincideTipo =
                    tipo === "all" ||
                    item.type === tipo;

                const coincideOS =
                    sistema === "all" ||
                    item.os === sistema ||
                    item.os === "All";

                return (
                    coincideTexto &&
                    coincideTipo &&
                    coincideOS
                );
            }
        );

        filtrados.sort(function (a, b) {
            const valorA = String(
                a[columnaOrden] || ""
            ).toLowerCase();

            const valorB = String(
                b[columnaOrden] || ""
            ).toLowerCase();

            return (
                valorA.localeCompare(valorB) *
                direccionOrden
            );
        });

        return filtrados;
    }

    /* ========================================
       CREAR FILAS
    ======================================== */

    function filaHTML(item) {
        const seleccionado =
            seleccionados.has(item.id);

        const tieneEstado =
            pestañaActual !== "library";

        const tipoCelda = tieneEstado
            ? `
                <span class="status-pill ${claseEstado(
                    item.status
                )}">
                    ${escapar(item.status)}
                </span>
            `
            : escapar(item.type);

        return `
            <tr
                data-script-id="${escapar(item.id)}"
                class="${seleccionado ? "selected" : ""} ${
                    item.status === "Running"
                        ? "running"
                        : ""
                }"
            >
                <td>
                    <input
                        class="row-select"
                        type="checkbox"
                        aria-label="Seleccionar ${escapar(
                            item.name
                        )}"
                        ${seleccionado ? "checked" : ""}
                    >
                </td>

                <td>
                    <div class="row-actions">
                        <button
                            type="button"
                            data-action="run"
                            aria-label="Ejecutar"
                        >
                            <svg>
                                <use href="#i-play"></use>
                            </svg>
                        </button>

                        <button
                            type="button"
                            data-action="edit"
                            aria-label="Editar"
                        >
                            <svg>
                                <use href="#i-edit"></use>
                            </svg>
                        </button>

                        <button
                            class="delete"
                            type="button"
                            data-action="delete"
                            aria-label="Eliminar"
                        >
                            <svg>
                                <use href="#i-trash"></use>
                            </svg>
                        </button>
                    </div>
                </td>

                <td>
                    <button
                        class="script-name-button"
                        type="button"
                        data-action="detail"
                    >
                        ${escapar(item.name)}
                    </button>
                </td>

                <td>${tipoCelda}</td>

                <td>${iconoOS(item.os)}</td>

                <td>${escapar(item.version)}</td>

                <td>${escapar(item.author)}</td>

                <td>
                    <span class="script-id">
                        ${escapar(
                            item.id.toUpperCase()
                        )}-${escapar(
                            String(item.name.length * 18492)
                        )}
                    </span>
                </td>

                <td>${escapar(item.upload)}</td>
                <td>${escapar(item.updated)}</td>
                <td>${escapar(item.updatedBy)}</td>
            </tr>
        `;
    }

    /* ========================================
       SELECCIÓN
    ======================================== */

    function actualizarControlesSeleccion() {
        const visibles = $$(
            "#remoteRows .row-select"
        );

        const marcados = visibles.filter(
            function (input) {
                return input.checked;
            }
        ).length;

        const seleccionarTodos =
            $("selectAllScripts");

        if (seleccionarTodos) {
            seleccionarTodos.checked =
                visibles.length > 0 &&
                marcados === visibles.length;

            seleccionarTodos.indeterminate =
                marcados > 0 &&
                marcados < visibles.length;
        }

        if ($("btnDeleteSelected")) {
            $("btnDeleteSelected").disabled =
                seleccionados.size === 0;
        }
    }

    function actualizarBadgePendientes() {
        const activos = pendingItems.filter(
            function (item) {
                return item.status === "Running";
            }
        ).length;

        if ($("pendingBadge")) {
            $("pendingBadge").textContent =
                String(activos);
        }
    }

    /* ========================================
       PAGINACIÓN
    ======================================== */

    function renderPaginacion(totalPaginas) {
        const contenedor = $("pageButtons");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        for (
            let pagina = 1;
            pagina <= totalPaginas;
            pagina += 1
        ) {
            const boton =
                document.createElement("button");

            boton.type = "button";
            boton.textContent = String(pagina);

            boton.classList.toggle(
                "active",
                pagina === paginaActual
            );

            boton.addEventListener("click", function () {
                paginaActual = pagina;
                renderTabla();
            });

            contenedor.appendChild(boton);
        }

        if ($("previousPage")) {
            $("previousPage").disabled =
                paginaActual <= 1;
        }

        if ($("nextPage")) {
            $("nextPage").disabled =
                paginaActual >= totalPaginas;
        }
    }

    /* ========================================
       MOSTRAR TABLA
    ======================================== */

    function renderTabla() {
        const filtrados = datosFiltrados();

        const porPagina = Number(
            $("rowsPerPage")?.value || 12
        );

        const totalPaginas = Math.max(
            1,
            Math.ceil(filtrados.length / porPagina)
        );

        paginaActual = Math.min(
            paginaActual,
            totalPaginas
        );

        const inicio =
            (paginaActual - 1) * porPagina;

        const pagina = filtrados.slice(
            inicio,
            inicio + porPagina
        );

        const cuerpo = $("remoteRows");

        if (cuerpo) {
            cuerpo.innerHTML =
                pagina.map(filaHTML).join("");
        }

        if ($("remoteEmpty")) {
            $("remoteEmpty").hidden =
                pagina.length !== 0;
        }

        if ($("remoteItemCount")) {
            if (
                pestañaActual === "library" &&
                filtrados.length === libraryItems.length
            ) {
                $("remoteItemCount").textContent =
                    "45 Items";
            } else {
                $("remoteItemCount").textContent =
                    filtrados.length +
                    (filtrados.length === 1
                        ? " Item"
                        : " Items");
            }
        }

        renderPaginacion(totalPaginas);
        actualizarControlesSeleccion();
        actualizarBadgePendientes();
    }

    /* ========================================
       PESTAÑAS
    ======================================== */

    $$("[data-remote-tab]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            pestañaActual =
                this.dataset.remoteTab;

            paginaActual = 1;
            seleccionados.clear();

            $$("[data-remote-tab]").forEach(
                function (item) {
                    item.classList.toggle(
                        "active",
                        item === boton
                    );
                }
            );

            if ($("btnUploadScript")) {
                $("btnUploadScript").innerHTML =
                    pestañaActual === "library"
                        ? `
                            <svg>
                                <use href="#i-upload"></use>
                            </svg>
                            Upload New Script
                        `
                        : `
                            <svg>
                                <use href="#i-play"></use>
                            </svg>
                            Create Task
                        `;
            }

            renderTabla();
        });
    });

    /* ========================================
       BÚSQUEDA Y FILTROS
    ======================================== */

    $("scriptSearch")?.addEventListener(
        "input",
        function () {
            paginaActual = 1;
            renderTabla();
        }
    );

    [
        "rowsPerPage",
        "typeFilter",
        "osFilter"
    ].forEach(function (id) {
        $(id)?.addEventListener("change", function () {
            paginaActual = 1;
            renderTabla();
        });
    });

    /* ========================================
       ORDENAMIENTO
    ======================================== */

    $$("[data-sort]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            if (
                columnaOrden === this.dataset.sort
            ) {
                direccionOrden *= -1;
            } else {
                columnaOrden =
                    this.dataset.sort;

                direccionOrden = 1;
            }

            renderTabla();

            toast(
                "Items ordered by " +
                columnaOrden +
                "."
            );
        });
    });

    $("previousPage")?.addEventListener(
        "click",
        function () {
            if (paginaActual > 1) {
                paginaActual -= 1;
                renderTabla();
            }
        }
    );

    $("nextPage")?.addEventListener(
        "click",
        function () {
            paginaActual += 1;
            renderTabla();
        }
    );

    /* ========================================
       SELECCIONAR TODOS
    ======================================== */

    $("selectAllScripts")?.addEventListener(
        "change",
        function () {
            $$("#remoteRows tr").forEach(
                function (fila) {
                    const id =
                        fila.dataset.scriptId;

                    if (!id) return;

                    if (
                        $("selectAllScripts").checked
                    ) {
                        seleccionados.add(id);
                    } else {
                        seleccionados.delete(id);
                    }
                }
            );

            renderTabla();
        }
    );

    $("remoteRows")?.addEventListener(
        "change",
        function (evento) {
            const selector =
                evento.target.closest(
                    ".row-select"
                );

            if (!selector) return;

            const fila =
                selector.closest("tr");

            const id =
                fila?.dataset.scriptId;

            if (!id) return;

            if (selector.checked) {
                seleccionados.add(id);
            } else {
                seleccionados.delete(id);
            }

            fila.classList.toggle(
                "selected",
                selector.checked
            );

            actualizarControlesSeleccion();
        }
    );

    /* ========================================
       ACCIONES DE FILA
    ======================================== */

    $("remoteRows")?.addEventListener(
        "click",
        function (evento) {
            if (
                evento.target.closest(
                    ".row-select"
                )
            ) {
                return;
            }

            const fila =
                evento.target.closest("tr");

            const accion =
                evento.target.closest(
                    "[data-action]"
                )?.dataset.action;

            const item = datosActuales().find(
                function (script) {
                    return (
                        script.id ===
                        fila?.dataset.scriptId
                    );
                }
            );

            if (!item) return;

            if (accion === "run") {
                ejecutarScript(item);
            } else if (accion === "edit") {
                abrirFormulario(item);
            } else if (accion === "delete") {
                eliminarItem(item);
            } else {
                abrirDetalle(item);
            }
        }
    );

    /* ========================================
       ELIMINAR
    ======================================== */

    $("btnDeleteSelected")?.addEventListener(
        "click",
        function () {
            const lista = datosActuales();
            let eliminados = 0;

            for (
                let indice = lista.length - 1;
                indice >= 0;
                indice -= 1
            ) {
                if (
                    seleccionados.has(
                        lista[indice].id
                    )
                ) {
                    lista.splice(indice, 1);
                    eliminados += 1;
                }
            }

            seleccionados.clear();
            renderTabla();

            toast(
                eliminados +
                (eliminados === 1
                    ? " item deleted."
                    : " items deleted.")
            );
        }
    );

    function eliminarItem(item) {
        const lista = datosActuales();

        const indice = lista.findIndex(
            function (actual) {
                return actual.id === item.id;
            }
        );

        if (indice < 0) return;

        lista.splice(indice, 1);
        seleccionados.delete(item.id);

        cerrarDetalle();
        renderTabla();

        toast("Item deleted from RemoteOps.");
    }

    /* ========================================
       DETALLES DEL SCRIPT
    ======================================== */

    function abrirDetalle(item) {
        scriptActivo = item;

        if ($("scriptDetailName")) {
            $("scriptDetailName").textContent =
                item.name;
        }

        if ($("scriptDetailType")) {
            $("scriptDetailType").textContent =
                item.type;
        }

        if ($("scriptDetailStatus")) {
            $("scriptDetailStatus").textContent =
                item.status === "Ready"
                    ? "Ready to execute"
                    : item.status;
        }

        if ($("scriptDetailDescription")) {
            $("scriptDetailDescription").textContent =
                item.description;
        }

        if ($("scriptDetailOS")) {
            $("scriptDetailOS").textContent =
                item.os;
        }

        if ($("scriptDetailVersion")) {
            $("scriptDetailVersion").textContent =
                item.version;
        }

        if ($("scriptDetailAuthor")) {
            $("scriptDetailAuthor").textContent =
                item.author;
        }

        if ($("scriptDetailId")) {
            $("scriptDetailId").textContent =
                item.id.toUpperCase();
        }

        if ($("scriptDetailUpdated")) {
            $("scriptDetailUpdated").textContent =
                item.updated;
        }

        scriptDrawer?.classList.add("open");

        scriptDrawer?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarDetalle() {
        scriptDrawer?.classList.remove("open");

        scriptDrawer?.setAttribute(
            "aria-hidden",
            "true"
        );

        scriptActivo = null;
    }

    $("closeScriptDrawer")?.addEventListener(
        "click",
        cerrarDetalle
    );

    $("closeScriptBackdrop")?.addEventListener(
        "click",
        cerrarDetalle
    );

    $("btnEditDrawer")?.addEventListener(
        "click",
        function () {
            if (scriptActivo) {
                abrirFormulario(scriptActivo);
            }
        }
    );

    $("btnRunDrawer")?.addEventListener(
        "click",
        function () {
            if (scriptActivo) {
                ejecutarScript(scriptActivo);
            }
        }
    );

    /* ========================================
       EJECUTAR SCRIPT
    ======================================== */

    function ejecutarScript(item) {
        if (item.status === "Running") {
            toast(
                "This execution is already running."
            );

            return;
        }

        const ejecucion = crearTask(
            "ex-" + String(Date.now()).slice(-6),
            item.name + " on FIN-014",
            item.type,
            item.os,
            item.version,
            item.author,
            "Aug 21, 2026 4:24 PM",
            "Running",
            "FIN-014",
            item.name
        );

        pendingItems.unshift(ejecucion);

        cerrarDetalle();
        actualizarBadgePendientes();

        toast(
            item.name +
            " started on FIN-014."
        );

        window.setTimeout(function () {
            ejecucion.status = "Completed";
            ejecucion.updated =
                "Aug 21, 2026 4:25 PM";

            if (pestañaActual === "pending") {
                renderTabla();
            }

            actualizarBadgePendientes();

            toast(
                "RemoteOps execution completed successfully."
            );
        }, 3200);
    }

    /* ========================================
       FORMULARIO
    ======================================== */

    function abrirFormulario(item = null) {
        scriptEditando = item;

        if ($("scriptFormTitle")) {
            $("scriptFormTitle").textContent =
                item
                    ? "Edit Script"
                    : pestañaActual === "library"
                    ? "Upload New Script"
                    : "Create RemoteOps Task";
        }

        if ($("scriptName")) {
            $("scriptName").value =
                item?.name || "";
        }

        if ($("scriptType")) {
            $("scriptType").value =
                item?.type || "Action";
        }

        if ($("scriptOS")) {
            $("scriptOS").value =
                item?.os || "Windows";
        }

        if ($("scriptVersion")) {
            $("scriptVersion").value =
                item?.version || "1.0.0";
        }

        if ($("scriptDescription")) {
            $("scriptDescription").value =
                item?.description || "";
        }

        cerrarDetalle();

        scriptModal?.classList.add("activo");

        window.setTimeout(function () {
            $("scriptName")?.focus();
        }, 50);
    }

    function cerrarFormulario() {
        scriptModal?.classList.remove("activo");
        scriptEditando = null;

        $("scriptForm")?.reset();

        if ($("scriptVersion")) {
            $("scriptVersion").value = "1.0.0";
        }
    }

    $("btnUploadScript")?.addEventListener(
        "click",
        function () {
            abrirFormulario();
        }
    );

    $("closeScriptModal")?.addEventListener(
        "click",
        cerrarFormulario
    );

    $("cancelScriptModal")?.addEventListener(
        "click",
        cerrarFormulario
    );

    $("scriptForm")?.addEventListener(
        "submit",
        function (evento) {
            evento.preventDefault();

            const nombre =
                $("scriptName")?.value.trim();

            if (!nombre) return;

            if (scriptEditando) {
                scriptEditando.name = nombre;

                scriptEditando.type =
                    $("scriptType")?.value ||
                    "Action";

                scriptEditando.os =
                    $("scriptOS")?.value ||
                    "Windows";

                scriptEditando.version =
                    $("scriptVersion")?.value.trim() ||
                    "1.0.0";

                scriptEditando.description =
                    $("scriptDescription")?.value.trim() ||
                    "RemoteOps automation script.";

                scriptEditando.updated =
                    "Aug 21, 2026 4:24 PM";

                toast(
                    "Script updated successfully."
                );
            } else if (
                pestañaActual === "library"
            ) {
                libraryItems.unshift(
                    crearScript(
                        "ro-" +
                            String(Date.now()).slice(-6),
                        nombre,
                        $("scriptType")?.value ||
                            "Action",
                        $("scriptOS")?.value ||
                            "Windows",
                        $("scriptVersion")
                            ?.value.trim() ||
                            "1.0.0",
                        "NeriumTech",
                        "Aug 21, 2026 4:24 PM",
                        "Aug 21, 2026 4:24 PM",
                        "Brayan",
                        $("scriptDescription")
                            ?.value.trim() ||
                            "RemoteOps automation script."
                    )
                );

                toast(
                    "New script uploaded to the library."
                );
            } else {
                scheduledItems.unshift(
                    crearTask(
                        "sc-" +
                            String(Date.now()).slice(-6),
                        nombre,
                        $("scriptType")?.value ||
                            "Action",
                        $("scriptOS")?.value ||
                            "Windows",
                        $("scriptVersion")
                            ?.value.trim() ||
                            "1.0.0",
                        "NeriumTech",
                        "Aug 22, 2026 2:00 AM",
                        "Scheduled",
                        "FIN-014",
                        nombre
                    )
                );

                pestañaActual = "scheduled";

                $$("[data-remote-tab]").forEach(
                    function (boton) {
                        boton.classList.toggle(
                            "active",
                            boton.dataset.remoteTab ===
                                "scheduled"
                        );
                    }
                );

                toast(
                    "RemoteOps task scheduled."
                );
            }

            paginaActual = 1;

            cerrarFormulario();
            renderTabla();
        }
    );

       /* ========================================
       TECLA ESCAPE
    ======================================== */

    document.addEventListener("keydown", function (evento) {
        if (evento.key !== "Escape") return;

        cerrarDetalle();
        cerrarFormulario();
        cerrarMenu();

        overlayConfig?.classList.remove("activo");

        if (overlayPausa?.classList.contains("activo")) {
            cerrarPausa();
        }
    });

    renderTabla();
});