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
    const eventDrawer = $("eventDrawer");
    const graphLayer = $("graphLayer");
    const queryLibrary = $("queryLibrary");

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
        reproducirMusica,
        { once: true }
    );

    function sonidoBoton() {
        if (silenciado || volumenEfectos === 0) {
            return;
        }

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

    $("btnPausa")?.addEventListener(
        "click",
        abrirPausa
    );

    $("btnContinuar")?.addEventListener(
        "click",
        cerrarPausa
    );

    $("btnConfiguracion")?.addEventListener(
        "click",
        abrirConfig
    );

    $("cerrarConfig")?.addEventListener(
        "click",
        cerrarConfig
    );

    $("guardarConfig")?.addEventListener(
        "click",
        cerrarConfig
    );

    $("btnRegresar")?.addEventListener(
        "click",
        regresarInicio
    );

    $("btnInicioPausa")?.addEventListener(
        "click",
        regresarInicio
    );

    $("btnConfigPausa")?.addEventListener(
        "click",
        function () {
            overlayPausa?.classList.remove("activo");
            abrirConfig();
        }
    );

    $("volumenMusica")?.addEventListener(
        "input",
        function () {
            volumenMusica =
                Number(this.value) / 100;

            if ($("valorMusica")) {
                $("valorMusica").textContent =
                    this.value + "%";
            }

            if (musica && !silenciado) {
                musica.volume = volumenMusica;
            }
        }
    );

    $("volumenEfectos")?.addEventListener(
        "input",
        function () {
            volumenEfectos =
                Number(this.value) / 100;

            if ($("valorEfectos")) {
                $("valorEfectos").textContent =
                    this.value + "%";
            }
        }
    );

    $("silenciar")?.addEventListener(
        "change",
        function () {
            silenciado = this.checked;

            if (silenciado) {
                musica?.pause();
            } else {
                reproducirMusica();
            }
        }
    );

    /* =========================================
       MENÚ LATERAL
    ========================================= */

    function cerrarMenu() {
        document.body.classList.remove(
            "menu-abierto"
        );
    }

    $("btnAbrirMenu")?.addEventListener(
        "click",
        function () {
            document.body.classList.toggle(
                "menu-abierto"
            );
        }
    );

    $("sidebarBackdrop")?.addEventListener(
        "click",
        cerrarMenu
    );

    $(
        "btnAbrirMenu"
    );

    $$('.side-link:not(.active):not([data-ready="true"])')
        .forEach(function (enlace) {
            enlace.addEventListener(
                "click",
                function (evento) {
                    evento.preventDefault();

                    cerrarMenu();

                    toast(
                        "Este módulo se conectará cuando construyamos su pantalla."
                    );
                }
            );
        });

    const menuSearch = $("menuSearch");

    menuSearch?.addEventListener(
        "input",
        function () {
            const termino = this.value
                .trim()
                .toLowerCase();

            $$(".side-link").forEach(
                function (enlace) {
                    const texto = (
                        enlace.dataset.menuText ||
                        enlace.textContent
                    ).toLowerCase();

                    enlace.hidden =
                        Boolean(termino) &&
                        !texto.includes(termino);
                }
            );
        }
    );

    document.addEventListener(
        "keydown",
        function (evento) {
            if (
                (evento.ctrlKey || evento.metaKey) &&
                evento.key.toLowerCase() === "k"
            ) {
                evento.preventDefault();
                menuSearch?.focus();
            }
        }
    );

    $("btnAyuda")?.addEventListener(
        "click",
        function () {
            toast(
                "Escribe una consulta o selecciona un campo para investigar FIN-014."
            );
        }
    );

    $("btnNotificaciones")?.addEventListener(
        "click",
        function () {
            toast(
                "Se detectaron 11 eventos relacionados con el ransomware."
            );
        }
    );

    /* =========================================
       CAMPOS Y CONSULTAS
    ========================================= */

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    $("fieldSearch")?.addEventListener(
        "input",
        function () {
            const termino = normalizar(
                this.value.trim()
            );

            let visibles = 0;

            $$("#fieldList button").forEach(
                function (boton) {
                    const coincide =
                        !termino ||
                        normalizar(
                            boton.dataset.field
                        ).includes(termino);

                    boton.hidden = !coincide;

                    if (coincide) {
                        visibles += 1;
                    }
                }
            );

            if ($("fieldCount")) {
                $("fieldCount").textContent =
                    String(visibles);
            }
        }
    );

    $$("#fieldList button").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const entrada =
                        $("queryInput");

                    if (!entrada) return;

                    $$("#fieldList button").forEach(
                        function (item) {
                            item.classList.remove(
                                "active"
                            );
                        }
                    );

                    this.classList.add("active");

                    const campo =
                        this.dataset.field;

                    const separador =
                        entrada.value.trim()
                            ? " AND "
                            : "";

                    entrada.value +=
                        separador +
                        campo +
                        " = ''";

                    entrada.focus();

                    entrada.setSelectionRange(
                        entrada.value.length - 1,
                        entrada.value.length - 1
                    );

                    toast(
                        campo +
                            " agregado a la consulta."
                    );
                }
            );
        }
    );

    function determinarTipoConsulta(consulta) {
        const texto = normalizar(consulta);

        if (!texto) {
            return "all";
        }

        if (
            texto.includes("powershell") ||
            texto.includes("command") ||
            texto.includes("process")
        ) {
            return "command";
        }

        if (
            texto.includes("dns") ||
            texto.includes("chatgpt")
        ) {
            return "dns";
        }

        if (
            texto.includes("165.227") ||
            texto.includes("ip.address") ||
            texto.includes("network")
        ) {
            return "network";
        }

        if (
            texto.includes("file") ||
            texto.includes("locked") ||
            texto.includes("restore")
        ) {
            return "file";
        }

        if (
            texto.includes("fin-014") ||
            texto.includes("endpoint.name")
        ) {
            return "endpoint";
        }

        return "text";
    }

    function ejecutarBusqueda(
        mostrarMensaje = true
    ) {
        const entrada = $("queryInput");

        const consulta =
            entrada?.value.trim() || "";

        const tipo =
            determinarTipoConsulta(consulta);

        const texto = normalizar(
            consulta.replace(/[='"()]/g, " ")
        );

        let visibles = 0;

        $$("#eventRows tr").forEach(
            function (fila) {
                let coincide = true;

                if (
                    tipo === "command" ||
                    tipo === "dns" ||
                    tipo === "network" ||
                    tipo === "file"
                ) {
                    coincide =
                        fila.dataset.event === tipo;
                } else if (tipo === "endpoint") {
                    coincide =
                        fila.dataset.endpoint ===
                        "FIN-014";
                } else if (tipo === "text") {
                    const terminos = texto
                        .split(/\s+/)
                        .filter(function (termino) {
                            return (
                                termino.length > 2 &&
                                ![
                                    "and",
                                    "contains",
                                    "event",
                                    "src",
                                    "dst"
                                ].includes(termino)
                            );
                        });

                    const contenido = normalizar(
                        fila.textContent
                    );

                    coincide = terminos.some(
                        function (termino) {
                            return contenido.includes(
                                termino
                            );
                        }
                    );
                }

                fila.hidden = !coincide;

                if (coincide) {
                    visibles += 1;
                }
            }
        );

        const totalSimulado =
            tipo === "all"
                ? 382941
                : visibles * 1247 + 86;

        if ($("matchingRecords")) {
            $("matchingRecords").textContent =
                totalSimulado.toLocaleString(
                    "en-US"
                ) + " matching records";
        }

        if (mostrarMensaje) {
            toast(
                visibles +
                    " eventos visibles en la simulación."
            );
        }

        actualizarSeleccion();
    }

    $("btnSearchEvents")?.addEventListener(
        "click",
        function () {
            const boton = this;

            boton.classList.add("searching");
            boton.textContent = "Searching...";

            window.setTimeout(function () {
                ejecutarBusqueda();

                boton.classList.remove(
                    "searching"
                );

                boton.textContent = "▶ Search";
            }, 420);
        }
    );

    $("queryInput")?.addEventListener(
        "keydown",
        function (evento) {
            if (evento.key === "Enter") {
                evento.preventDefault();

                $("btnSearchEvents")?.click();
            }
        }
    );

    $("timeRange")?.addEventListener(
        "change",
        function () {
            const horas = Number(this.value);

            if ($("rangeLabel")) {
                $("rangeLabel").textContent =
                    horas === 4
                        ? "12:10 PM – 4:10 PM"
                        : "Últimas " +
                          horas +
                          " horas";
            }

            toast(
                "Rango actualizado a " +
                    this.options[
                        this.selectedIndex
                    ].text +
                    "."
            );
        }
    );

    $("btnNewQuery")?.addEventListener(
        "click",
        function () {
            if ($("queryInput")) {
                $("queryInput").value = "";
            }

            $$("#fieldList button").forEach(
                function (boton) {
                    boton.classList.remove(
                        "active"
                    );
                }
            );

            ejecutarBusqueda(false);
            $("queryInput")?.focus();

            toast(
                "Nueva consulta preparada."
            );
        }
    );

    /* =========================================
       BIBLIOTECA DE CONSULTAS
    ========================================= */

    function abrirBiblioteca() {
        queryLibrary?.classList.add("open");

        queryLibrary?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarBiblioteca() {
        queryLibrary?.classList.remove("open");

        queryLibrary?.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    $("btnQueryLibrary")?.addEventListener(
        "click",
        abrirBiblioteca
    );

    $("closeQueryLibrary")?.addEventListener(
        "click",
        cerrarBiblioteca
    );

    $("closeLibraryBackdrop")
        ?.addEventListener(
            "click",
            cerrarBiblioteca
        );

    $$("[data-query]").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    if ($("queryInput")) {
                        $("queryInput").value =
                            this.dataset.query;
                    }

                    cerrarBiblioteca();
                    ejecutarBusqueda();
                }
            );
        }
    );

    /* =========================================
       TIMELINE
    ========================================= */

    $("toggleTimeline")?.addEventListener(
        "change",
        function () {
            const timeline =
                $("eventTimeline");

            if (!timeline) return;

            timeline.hidden = !this.checked;

            toast(
                this.checked
                    ? "Línea de tiempo activada."
                    : "Línea de tiempo oculta."
            );
        }
    );

    /* =========================================
       GRÁFICA
    ========================================= */

    function abrirGraph() {
        graphLayer?.classList.add("open");

        graphLayer?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarGraph() {
        graphLayer?.classList.remove("open");

        graphLayer?.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    $("btnShowGraph")?.addEventListener(
        "click",
        abrirGraph
    );

    $("closeGraph")?.addEventListener(
        "click",
        cerrarGraph
    );

    $("closeGraphBackdrop")?.addEventListener(
        "click",
        cerrarGraph
    );

    /* =========================================
       SELECCIÓN DE EVENTOS
    ========================================= */

    function actualizarSeleccion() {
        const seleccionados =
            $$(".event-check:checked");

        const boton =
            $("btnEventActions");

        if (boton) {
            boton.disabled =
                seleccionados.length === 0;

            boton.textContent =
                seleccionados.length
                    ? "Investigate (" +
                      seleccionados.length +
                      ")"
                    : "Actions";
        }

        if ($("selectionLabel")) {
            $("selectionLabel").textContent =
                seleccionados.length
                    ? seleccionados.length +
                      " items selected"
                    : "No items selected";
        }

        $$("#eventRows tr").forEach(
            function (fila) {
                fila.classList.toggle(
                    "selected",
                    Boolean(
                        fila.querySelector(
                            ".event-check"
                        )?.checked
                    )
                );
            }
        );
    }

    $$(".event-check").forEach(
        function (checkbox) {
            checkbox.addEventListener(
                "change",
                function (evento) {
                    evento.stopPropagation();
                    actualizarSeleccion();
                }
            );
        }
    );

    $("selectAllEvents")?.addEventListener(
        "change",
        function () {
            const seleccionado = this.checked;

            $$("#eventRows tr:not([hidden]) .event-check")
                .forEach(function (checkbox) {
                    checkbox.checked =
                        seleccionado;
                });

            actualizarSeleccion();
        }
    );

    $("btnEventActions")?.addEventListener(
        "click",
        function () {
            const seleccionados =
                $$(".event-check:checked");

            if (!seleccionados.length) {
                return;
            }

            seleccionados.forEach(
                function (checkbox) {
                    checkbox
                        .closest("tr")
                        ?.classList.add(
                            "investigated"
                        );

                    checkbox.checked = false;
                }
            );

            actualizarSeleccion();

            toast(
                seleccionados.length +
                    " eventos agregados a la investigación."
            );
        }
    );

    /* =========================================
       DETALLES DEL EVENTO
    ========================================= */

    const analisisPorTipo = {
        dns:
            "La resolución DNS puede indicar comunicación previa con infraestructura externa.",

        file:
            "La actividad sobre archivos coincide con la fase de cifrado del ransomware.",

        command:
            "El comando forma parte de la ejecución y preparación del ataque.",

        network:
            "La conexión externa puede corresponder al servidor de comando y control."
    };

    function abrirDetalleEvento(fila) {
        if (!fila) return;

        filaActiva = fila;

        const celdas = fila.children;

        const tipoEvento =
            celdas[3]?.textContent.trim() ||
            "Event";

        const tiempo =
            celdas[1]?.textContent.trim() ||
            "";

        const fuente =
            celdas[4]
                ?.querySelector("span")
                ?.textContent.trim() ||
            "";

        const objetivo =
            celdas[6]
                ?.querySelector("strong")
                ?.textContent.trim() ||
            "";

        if ($("eventDrawerTitle")) {
            $("eventDrawerTitle").textContent =
                tipoEvento;
        }

        if ($("drawerEventTime")) {
            $("drawerEventTime").textContent =
                tiempo;
        }

        if ($("drawerEventSource")) {
            $("drawerEventSource").textContent =
                fuente;
        }

        if ($("drawerEventTarget")) {
            $("drawerEventTarget").textContent =
                objetivo;
        }

        if ($("drawerEventAnalysis")) {
            $("drawerEventAnalysis").textContent =
                analisisPorTipo[
                    fila.dataset.event
                ] ||
                "Esta actividad forma parte de la secuencia detectada en FIN-014.";
        }

        const investigado =
            fila.classList.contains(
                "investigated"
            );

        const boton =
            $("btnInvestigateEvent");

        if (boton) {
            boton.classList.toggle(
                "done",
                investigado
            );

            boton.textContent = investigado
                ? "Agregado a investigación ✓"
                : "Agregar a investigación";
        }

        eventDrawer?.classList.add("open");

        eventDrawer?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarDetalleEvento() {
        eventDrawer?.classList.remove("open");

        eventDrawer?.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    const cuerpoEventos = $("eventRows");

    function prepararFilasSeleccionables() {
        $$("tr", cuerpoEventos).forEach(
            function (fila) {
                fila.style.cursor = "pointer";
                fila.setAttribute("tabindex", "0");
                fila.setAttribute(
                    "aria-label",
                    "Seleccionar evento"
                );
            }
        );
    }

    prepararFilasSeleccionables();

    cuerpoEventos?.addEventListener(
        "click",
        function (evento) {
            if (
                evento.target.closest(
                    "input, button, a, select, label"
                )
            ) {
                return;
            }

            const fila = evento.target.closest("tr");

            if (!fila || !cuerpoEventos.contains(fila)) {
                return;
            }

            const checkbox =
                fila.querySelector(".event-check");

            if (!checkbox || checkbox.disabled) {
                return;
            }

            evento.preventDefault();
            evento.stopPropagation();

            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );
        },
        true
    );

    cuerpoEventos?.addEventListener(
        "keydown",
        function (evento) {
            if (
                evento.key !== "Enter" &&
                evento.key !== " "
            ) {
                return;
            }

            const fila = evento.target.closest("tr");

            if (!fila || !cuerpoEventos.contains(fila)) {
                return;
            }

            const checkbox =
                fila.querySelector(".event-check");

            if (!checkbox || checkbox.disabled) {
                return;
            }

            evento.preventDefault();

            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );
        }
    );

    $$(".related-link").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function (evento) {
                    evento.stopPropagation();

                    abrirDetalleEvento(
                        this.closest("tr")
                    );
                }
            );
        }
    );

    $("closeEventDrawer")?.addEventListener(
        "click",
        cerrarDetalleEvento
    );

    $("closeEventBackdrop")?.addEventListener(
        "click",
        cerrarDetalleEvento
    );

    $("btnInvestigateEvent")?.addEventListener(
        "click",
        function () {
            if (!filaActiva) return;

            filaActiva.classList.add(
                "investigated"
            );

            this.classList.add("done");

            this.textContent =
                "Agregado a investigación ✓";

            toast(
                "Evento agregado al incidente #2026-001."
            );
        }
    );

    /* =========================================
       ORDENAR EVENTOS
    ========================================= */

    function ordenarEventos(orden) {
        const cuerpo = $("eventRows");

        if (!cuerpo) return;

        const filas = $$("tr", cuerpo);

        filas.sort(function (a, b) {
            const diferencia =
                Number(a.dataset.time) -
                Number(b.dataset.time);

            return orden === "recent"
                ? -diferencia
                : diferencia;
        });

        filas.forEach(function (fila) {
            cuerpo.appendChild(fila);
        });
    }

    $("sortEvents")?.addEventListener(
        "change",
        function () {
            ordenarEventos(this.value);

            toast(
                this.options[
                    this.selectedIndex
                ].text + "."
            );
        }
    );

    $("btnOldest")?.addEventListener(
        "click",
        function () {
            ordenarEventos("oldest");

            if ($("sortEvents")) {
                $("sortEvents").value =
                    "oldest";
            }

            $("eventRows")
                ?.firstElementChild
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
        }
    );

    $("btnRecent")?.addEventListener(
        "click",
        function () {
            ordenarEventos("recent");

            if ($("sortEvents")) {
                $("sortEvents").value =
                    "recent";
            }

            $("eventRows")
                ?.firstElementChild
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
        }
    );

    /* =========================================
       EXPORTAR CSV
    ========================================= */

    $("btnExportEvents")?.addEventListener(
        "click",
        function () {
            const filas =
                $$("#eventRows tr:not([hidden])");

            const contenido = [
                "Event Time,Name,Event Type,Event Source,Event Target"
            ];

            filas.forEach(function (fila) {
                const columnas = [
                    fila.children[1]
                        ?.textContent.trim(),

                    fila.children[2]
                        ?.textContent.trim(),

                    fila.children[3]
                        ?.textContent.trim(),

                    fila.children[4]
                        ?.textContent.trim(),

                    fila.children[6]
                        ?.textContent.trim()
                ].map(function (valor) {
                    return (
                        '"' +
                        String(valor || "")
                            .replace(
                                /"/g,
                                '""'
                            ) +
                        '"'
                    );
                });

                contenido.push(
                    columnas.join(",")
                );
            });

            const blob = new Blob(
                [contenido.join("\n")],
                {
                    type:
                        "text/csv;charset=utf-8"
                }
            );

            const enlace =
                document.createElement("a");

            enlace.href =
                URL.createObjectURL(blob);

            enlace.download =
                "nerium-event-search.csv";

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();

            URL.revokeObjectURL(
                enlace.href
            );

            toast(
                "Reporte de eventos generado correctamente."
            );
        }
    );

    /* =========================================
       ACCIONES SUPERIORES
    ========================================= */

    $("btnCopyLink")?.addEventListener(
        "click",
        function () {
            const url =
                window.location.href;

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                navigator.clipboard
                    .writeText(url)
                    .then(function () {
                        toast(
                            "Enlace de la consulta copiado."
                        );
                    })
                    .catch(function () {
                        toast(
                            "Consulta preparada para compartir."
                        );
                    });
            } else {
                toast(
                    "Consulta preparada para compartir."
                );
            }
        }
    );

    $("btnPageActions")?.addEventListener(
        "click",
        function () {
            toast(
                "Selecciona eventos para habilitar acciones de investigación."
            );
        }
    );

    $("btnDocumentation")?.addEventListener(
        "click",
        function () {
            toast(
                "Usa campos, operadores AND y filtros para crear una consulta."
            );
        }
    );

    $("btnPreferences")?.addEventListener(
        "click",
        abrirConfig
    );

    $("btnTableView")?.addEventListener(
        "click",
        function () {
            toast(
                "Vista de tabla activa."
            );
        }
    );

    $("btnTableSettings")?.addEventListener(
        "click",
        function () {
            toast(
                "Columnas principales: tiempo, evento, origen y objetivo."
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

            cerrarDetalleEvento();
            cerrarGraph();
            cerrarBiblioteca();
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

    actualizarSeleccion();
});
