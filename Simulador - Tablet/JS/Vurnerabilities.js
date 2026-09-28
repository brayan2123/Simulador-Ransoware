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
    let filaActiva = null;

    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const drawer = $("vulnerabilityDrawer");

    /* =========================================
       NAVEGACIÓN
    ========================================= */

    document.querySelectorAll("[data-route]").forEach(function (enlace) {
        enlace.addEventListener("click", function (evento) {
            const ruta = this.getAttribute("href");

            if (!ruta || ruta === "#") {
                evento.preventDefault();
                return;
            }

            evento.preventDefault();
            window.location.href = ruta;
        });
    });

    /* =========================================
       AUDIO
    ========================================= */

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
        function iniciarMusica() {
            reproducirMusica();
        },
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
                "button, .side-link, input[type='checkbox']"
            )
        ) {
            sonidoBoton();
        }
    });

    /* =========================================
       MENSAJES
    ========================================= */

    function toast(mensaje) {
        const elemento = $("toast");
        const texto = $("toastTexto");

        if (!elemento || !texto) return;

        texto.textContent = mensaje;
        elemento.classList.add("activo");

        clearTimeout(temporizadorToast);

        temporizadorToast = setTimeout(function () {
            elemento.classList.remove("activo");
        }, 2800);
    }

    /* =========================================
       TEMPORIZADOR
    ========================================= */

    function formatearTiempo(total) {
        const horas = String(
            Math.floor(total / 3600)
        ).padStart(2, "0");

        const minutos = String(
            Math.floor((total % 3600) / 60)
        ).padStart(2, "0");

        const segundos = String(
            total % 60
        ).padStart(2, "0");

        return horas + ":" + minutos + ":" + segundos;
    }

    setInterval(function () {
        if (!pausado) {
            segundosSimulacion += 1;
        }

        if ($("relojSimulacion")) {
            $("relojSimulacion").textContent =
                formatearTiempo(segundosSimulacion);
        }
    }, 1000);

    /* =========================================
       PAUSA Y CONFIGURACIÓN
    ========================================= */

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
            $("valorEfectos").textContent = this.value + "%";
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

    /* =========================================
       MENÚ LATERAL
    ========================================= */

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

    const menuSearch = $("menuSearch");

    menuSearch?.addEventListener("input", function () {
        const termino = this.value
            .trim()
            .toLowerCase();

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
            menuSearch?.focus();
        }
    });

    $("btnAyuda")?.addEventListener("click", function () {
        toast(
            "Filtra los hallazgos, abre un CVE y aplica una mitigación."
        );
    });

    $("btnNotificaciones")?.addEventListener(
        "click",
        function () {
            toast(
                "FIN-014 tiene 3 vulnerabilidades relacionadas con el incidente."
            );
        }
    );

    /* =========================================
       PANEL DE FILTROS
    ========================================= */

    const extraFilters = $("extraFilters");

    function alternarFiltros() {
        const abrir =
            extraFilters?.hasAttribute("hidden");

        if (abrir) {
            extraFilters.removeAttribute("hidden");
        } else {
            extraFilters?.setAttribute("hidden", "");
        }

        $("btnLoadFilter")?.classList.toggle(
            "open",
            Boolean(abrir)
        );
    }

    $("btnLoadFilter")?.addEventListener(
        "click",
        alternarFiltros
    );

    $("btnAddFilter")?.addEventListener(
        "click",
        alternarFiltros
    );

    $("btnCollapseFilters")?.addEventListener(
        "click",
        alternarFiltros
    );

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function aplicarFiltros() {
        const busqueda = normalizar(
            $("vulnerabilitySearch")?.value.trim()
        );

        const campo =
            $("searchField")?.value || "all";

        const severidad =
            $("filterSeverity")?.value || "all";

        const activo =
            $("filterAsset")?.value || "all";

        const estado =
            $("filterStatus")?.value || "all";

        const os =
            $("filterOS")?.value || "all";

        const mostrarResueltos =
            $("showResolved")?.checked || false;

        let visibles = 0;

        $$("#vulnerabilityRows tr").forEach(
            function (fila) {
                const cve = normalizar(
                    fila.dataset.id
                );

                const assetName = normalizar(
                    fila.querySelector(".asset-link")
                        ?.textContent
                );

                const software = normalizar(
                    fila.dataset.software
                );

                let textoBusqueda = cve;

                if (campo === "asset") {
                    textoBusqueda = assetName;
                }

                if (campo === "software") {
                    textoBusqueda = software;
                }

                const coincideBusqueda =
                    !busqueda ||
                    textoBusqueda.includes(busqueda);

                const coincideSeveridad =
                    severidad === "all" ||
                    fila.dataset.severity === severidad;

                const coincideActivo =
                    activo === "all" ||
                    fila.dataset.asset === activo;

                const coincideEstado =
                    estado === "all" ||
                    fila.dataset.status === estado;

                const coincideOS =
                    os === "all" ||
                    fila.dataset.os === os;

                const coincideResuelto =
                    mostrarResueltos ||
                    fila.dataset.status !== "resolved" ||
                    estado === "resolved";

                const visible =
                    coincideBusqueda &&
                    coincideSeveridad &&
                    coincideActivo &&
                    coincideEstado &&
                    coincideOS &&
                    coincideResuelto;

                fila.hidden = !visible;

                if (visible) {
                    visibles += 1;
                }
            }
        );

        if ($("visibleVulnerabilities")) {
            $("visibleVulnerabilities").textContent =
                String(visibles);
        }
    }

    [
        "vulnerabilitySearch",
        "filterSeverity",
        "filterAsset",
        "filterStatus",
        "filterOS",
        "showResolved"
    ].forEach(function (id) {
        const evento =
            id === "vulnerabilitySearch"
                ? "input"
                : "change";

        $(id)?.addEventListener(
            evento,
            aplicarFiltros
        );
    });

    $("searchField")?.addEventListener(
        "change",
        function () {
            if (!$("vulnerabilitySearch")) return;

            const placeholders = {
                all: "Search CVE",
                asset: "Search asset",
                software: "Search software"
            };

            $("vulnerabilitySearch").placeholder =
                placeholders[this.value];

            aplicarFiltros();
        }
    );

    $$("[data-quick-filter]").forEach(
        function (boton) {
            boton.addEventListener("click", function () {
                if ($("filterSeverity")) {
                    $("filterSeverity").value =
                        this.dataset.quickFilter;
                }

                aplicarFiltros();
            });
        }
    );

    /* =========================================
       TARJETAS INTERACTIVAS
    ========================================= */

    function seleccionarResumen(tarjeta) {
        const yaSeleccionada =
            tarjeta.classList.contains("selected");

        $$(".interactive-summary").forEach(
            function (item) {
                item.classList.remove("selected");
            }
        );

        if (yaSeleccionada) {
            if ($("filterSeverity")) {
                $("filterSeverity").value = "all";
            }

            if ($("filterOS")) {
                $("filterOS").value = "all";
            }

            aplicarFiltros();
            return;
        }

        tarjeta.classList.add("selected");

        const filtro =
            tarjeta.dataset.summaryFilter;

        if (
            filtro === "critical" &&
            $("filterSeverity")
        ) {
            $("filterSeverity").value =
                "critical";

            aplicarFiltros();

            toast(
                "Filtro aplicado: vulnerabilidades críticas."
            );
        } else if (
            (filtro === "macos" ||
                filtro === "windows") &&
            $("filterOS")
        ) {
            $("filterOS").value = filtro;

            aplicarFiltros();

            toast(
                "Filtro aplicado: " + filtro + "."
            );
        } else {
            toast(
                "Detalle de correcciones disponibles."
            );
        }
    }

    $$(".interactive-summary").forEach(
        function (tarjeta) {
            tarjeta.addEventListener(
                "click",
                function () {
                    seleccionarResumen(this);
                }
            );

            tarjeta.addEventListener(
                "keydown",
                function (evento) {
                    if (
                        evento.key === "Enter" ||
                        evento.key === " "
                    ) {
                        evento.preventDefault();
                        seleccionarResumen(this);
                    }
                }
            );
        }
    );

    $("toggleSummary")?.addEventListener(
        "change",
        function () {
            $("summaryDashboard")?.classList.toggle(
                "collapsed",
                !this.checked
            );
        }
    );

    /* =========================================
       SELECCIÓN DE TABLA
    ========================================= */

    function actualizarSeleccion() {
        const seleccionadas =
            $$(".row-check:checked");

        const boton = $("btnActions");

        if (boton) {
            boton.disabled =
                seleccionadas.length === 0;

            boton.textContent =
                seleccionadas.length > 0
                    ? "Mitigate selected (" +
                      seleccionadas.length +
                      ")"
                    : "Actions⌄";
        }

        $$("#vulnerabilityRows tr").forEach(
            function (fila) {
                fila.classList.toggle(
                    "selected",
                    Boolean(
                        fila.querySelector(".row-check")
                            ?.checked
                    )
                );
            }
        );
    }

    $$(".row-check").forEach(function (checkbox) {
        checkbox.addEventListener(
            "change",
            actualizarSeleccion
        );
    });

    $("selectAll")?.addEventListener(
        "change",
        function () {
            const seleccionar = this.checked;

            $$("#vulnerabilityRows tr:not([hidden]) .row-check")
                .forEach(function (checkbox) {
                    checkbox.checked = seleccionar;
                });

            actualizarSeleccion();
        }
    );

    function marcarResuelta(fila) {
        if (!fila) return;

        fila.dataset.status = "resolved";
        fila.classList.add("resolved-row");

        const estado =
            fila.querySelector(".status");

        if (estado) {
            estado.className = "status resolved";
            estado.textContent = "Resolved";
        }
    }

    $("btnActions")?.addEventListener(
        "click",
        function () {
            const seleccionadas =
                $$(".row-check:checked");

            if (!seleccionadas.length) return;

            seleccionadas.forEach(
                function (checkbox) {
                    marcarResuelta(
                        checkbox.closest("tr")
                    );

                    checkbox.checked = false;
                }
            );

            if ($("showResolved")) {
                $("showResolved").checked = true;
            }

            actualizarSeleccion();
            aplicarFiltros();

            toast(
                seleccionadas.length +
                    " vulnerabilidades fueron mitigadas."
            );
        }
    );

    /* =========================================
       DETALLE DE VULNERABILIDAD
    ========================================= */

    const detalles = {
        "CVE-2026-74956": {
            score: "CVSS 9.6",
            summary:
                "Un atacante puede evadir la política de mismo origen y acceder a datos sensibles del navegador."
        },

        "CVE-2026-74938": {
            score: "CVSS 9.4",
            summary:
                "La vulnerabilidad permite eludir controles de mitigación mediante código JavaScript especialmente diseñado."
        },

        "CVE-2026-74979": {
            score: "CVSS 9.8",
            summary:
                "La vulnerabilidad permite ejecutar código mediante contenido especialmente diseñado y puede facilitar la ejecución del ransomware."
        },

        "CVE-2026-74990": {
            score: "CVSS 9.8",
            summary:
                "Un documento malicioso puede provocar ejecución remota de código en el endpoint vulnerable."
        }
    };

    function abrirDetalle(fila) {
        if (!fila) return;

        filaActiva = fila;

        const id = fila.dataset.id;

        const descripcion =
            fila.children[2]?.textContent.trim() ||
            "Vulnerability detected";

        const severidad =
            fila.dataset.severity;

        const asset =
            fila.querySelector(".asset-link")
                ?.textContent.trim() ||
            "Unknown asset";

        const software =
            fila.children[8]?.textContent.trim() +
            " " +
            fila.children[9]?.textContent.trim();

        const estado =
            fila.dataset.status === "resolved"
                ? "Resolved"
                : "New";

        const detalle =
            detalles[id] || {
                score:
                    severidad === "critical"
                        ? "CVSS 9.2"
                        : "CVSS 7.8",

                summary:
                    "El hallazgo puede aumentar la superficie de ataque y requiere una mitigación prioritaria."
            };

        if ($("drawerCveId")) {
            $("drawerCveId").textContent = id;
        }

        if ($("drawerDescription")) {
            $("drawerDescription").textContent =
                descripcion;
        }

        if ($("drawerSeverity")) {
            $("drawerSeverity").textContent =
                severidad.toUpperCase();

            $("drawerSeverity").className =
                severidad;
        }

        if ($("drawerScore")) {
            $("drawerScore").textContent =
                detalle.score;
        }

        if ($("drawerSummary")) {
            $("drawerSummary").textContent =
                detalle.summary;
        }

        if ($("drawerAsset")) {
            $("drawerAsset").textContent =
                asset;
        }

        if ($("drawerSoftware")) {
            $("drawerSoftware").textContent =
                software;
        }

        if ($("drawerStatus")) {
            $("drawerStatus").textContent =
                estado;
        }

        const boton = $("btnRemediate");

        if (boton) {
            const resuelta =
                fila.dataset.status === "resolved";

            boton.classList.toggle(
                "done",
                resuelta
            );

            boton.innerHTML = resuelta
                ? '<svg><use href="#i-shield"></use></svg> Mitigación aplicada'
                : '<svg><use href="#i-shield"></use></svg> Aplicar mitigación';
        }

        drawer?.classList.add("open");
        drawer?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarDetalle() {
        drawer?.classList.remove("open");

        drawer?.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    $$(".cve-link, .asset-link").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    abrirDetalle(
                        this.closest("tr")
                    );
                }
            );
        }
    );

    $("closeVulnerability")?.addEventListener(
        "click",
        cerrarDetalle
    );

    $("closeVulnerabilityBackdrop")
        ?.addEventListener(
            "click",
            cerrarDetalle
        );

    $("btnRemediate")?.addEventListener(
        "click",
        function () {
            if (!filaActiva) return;

            if (
                filaActiva.dataset.status ===
                "resolved"
            ) {
                toast(
                    "Esta vulnerabilidad ya fue mitigada."
                );

                return;
            }

            marcarResuelta(filaActiva);

            if ($("drawerStatus")) {
                $("drawerStatus").textContent =
                    "Resolved";
            }

            this.classList.add("done");

            this.innerHTML =
                '<svg><use href="#i-shield"></use></svg> Mitigación aplicada';

            if ($("showResolved")) {
                $("showResolved").checked = true;
            }

            aplicarFiltros();

            toast(
                filaActiva.dataset.id +
                    " fue mitigada correctamente."
            );
        }
    );

    /* =========================================
       EXPORTAR CSV
    ========================================= */

    $("btnExport")?.addEventListener(
        "click",
        function () {
            const filas =
                $$("#vulnerabilityRows tr:not([hidden])");

            const contenido = [
                "CVE,Description,Severity,Status,Asset,Software"
            ];

            filas.forEach(function (fila) {
                contenido.push(
                    [
                        fila.dataset.id,

                        '"' +
                            fila.children[2]
                                .textContent
                                .trim()
                                .replace(/"/g, '""') +
                            '"',

                        fila.dataset.severity,
                        fila.dataset.status,

                        '"' +
                            fila
                                .querySelector(".asset-link")
                                .textContent.trim() +
                            '"',

                        fila.children[8]
                            .textContent.trim()
                    ].join(",")
                );
            });

            const blob = new Blob(
                [contenido.join("\n")],
                {
                    type: "text/csv;charset=utf-8"
                }
            );

            const enlace =
                document.createElement("a");

            enlace.href =
                URL.createObjectURL(blob);

            enlace.download =
                "nerium-vulnerabilities.csv";

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();

            URL.revokeObjectURL(enlace.href);

            toast(
                "Reporte CSV generado correctamente."
            );
        }
    );

    /* =========================================
       AGRUPAR POR ACTIVO
    ========================================= */

    $("groupAssets")?.addEventListener(
        "change",
        function () {
            const cuerpo =
                $("vulnerabilityRows");

            if (!cuerpo) return;

            const filas = $$("tr", cuerpo);

            if (this.checked) {
                filas.sort(function (a, b) {
                    return a
                        .querySelector(".asset-link")
                        .textContent.localeCompare(
                            b.querySelector(".asset-link")
                                .textContent
                        );
                });

                filas.forEach(function (fila) {
                    cuerpo.appendChild(fila);
                });

                toast(
                    "Vulnerabilidades agrupadas por activo."
                );
            } else {
                filas.sort(function (a, b) {
                    return a.dataset.id.localeCompare(
                        b.dataset.id
                    );
                });

                filas.forEach(function (fila) {
                    cuerpo.appendChild(fila);
                });

                toast(
                    "Agrupación desactivada."
                );
            }
        }
    );

    /* =========================================
       BOTONES ADICIONALES
    ========================================= */

    $$(
        ".vulnerabilities-header nav button, .table-footer button:not(:disabled)"
    ).forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                toast(
                    this.textContent.trim() +
                        " seleccionado."
                );
            }
        );
    });

    $("btnHeaderSettings")?.addEventListener(
        "click",
        function () {
            toast(
                "Opciones del resumen disponibles."
            );
        }
    );

    /* =========================================
       TECLA ESCAPE
    ========================================= */

    document.addEventListener(
        "keydown",
        function (evento) {
            if (evento.key !== "Escape") return;

            cerrarDetalle();
            cerrarMenu();

            overlayConfig?.classList.remove(
                "activo"
            );

            if (
                overlayPausa?.classList.contains(
                    "activo"
                )
            ) {
                cerrarPausa();
            }
        }
    );

    aplicarFiltros();
});