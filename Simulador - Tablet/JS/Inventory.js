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
    const endpointDrawer = $("endpointDrawer");
    const actionsLayer = $("inventoryActionsLayer");

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

    document.addEventListener("pointerdown", reproducirMusica, {
        once: true
    });

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
       MENSAJES Y RELOJ
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

    $("sidebarBackdrop")?.addEventListener("click", cerrarMenu);

    $$('.side-link:not(.active):not([data-ready="true"])').forEach(
        function (enlace) {
            enlace.addEventListener("click", function (evento) {
                evento.preventDefault();
                cerrarMenu();

                toast(
                    "Este módulo se conectará cuando construyamos su pantalla."
                );
            });
        }
    );

    const menuSearch = $("menuSearch");

    menuSearch?.addEventListener("input", function () {
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
            menuSearch?.focus();
        }
    });

    $("btnAyuda")?.addEventListener("click", function () {
        toast(
            "Busca FIN-014 y FIN-021. Analiza ambos equipos y compara los resultados."
        );
    });

    $("btnNotificaciones")?.addEventListener("click", function () {
        toast(
            "FIN-014 fue aislado. Verifica si el cifrado alcanzó a FIN-021."
        );
    });

    /* =========================================
       FILTROS
    ========================================= */

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function aplicarFiltros() {
        const busqueda = normalizar(
            $("assetSearch")?.value.trim()
        );

        const campo =
            $("assetSearchField")?.value || "asset";

        const os =
            $("filterOSVersion")?.value || "all";

        const agente =
            $("filterAgentVersion")?.value || "all";

        const operativo =
            $("filterOperational")?.value || "all";

        const infeccion =
            $("filterInfection")?.value || "all";

        const tag =
            $("filterTag")?.value || "all";

        let visibles = 0;

        $$("#inventoryRows tr").forEach(function (fila) {
            const asset = normalizar(fila.dataset.asset);
            const ip = normalizar(
                fila.children[7]?.textContent
            );

            const osTexto = normalizar(
                fila.children[2]?.textContent
            );

            let textoBusqueda = asset;

            if (campo === "ip") {
                textoBusqueda = ip;
            }

            if (campo === "os") {
                textoBusqueda = osTexto;
            }

            const coincideBusqueda =
                !busqueda ||
                textoBusqueda.includes(busqueda);

            const coincideOS =
                os === "all" ||
                fila.dataset.os === os;

            const coincideAgente =
                agente === "all" ||
                fila.dataset.agent === agente;

            const coincideOperativo =
                operativo === "all" ||
                fila.dataset.state === operativo;

            const coincideInfeccion =
                infeccion === "all" ||
                fila.dataset.infection === infeccion;

            const coincideTag =
                tag === "all" ||
                normalizar(fila.dataset.tag).includes(tag);

            const visible =
                coincideBusqueda &&
                coincideOS &&
                coincideAgente &&
                coincideOperativo &&
                coincideInfeccion &&
                coincideTag;

            fila.hidden = !visible;

            if (visible) {
                visibles += 1;
            }
        });

        if ($("inventoryVisibleCount")) {
            $("inventoryVisibleCount").textContent =
                String(visibles);
        }

        actualizarSeleccion();
    }

    $("assetSearch")?.addEventListener(
        "input",
        aplicarFiltros
    );

    [
        "assetSearchField",
        "filterOSVersion",
        "filterAgentVersion",
        "filterOperational",
        "filterInfection",
        "filterTag"
    ].forEach(function (id) {
        $(id)?.addEventListener(
            "change",
            aplicarFiltros
        );
    });

    function limpiarFiltros() {
        if ($("assetSearch")) {
            $("assetSearch").value = "";
        }

        [
            "filterOSVersion",
            "filterAgentVersion",
            "filterOperational",
            "filterInfection",
            "filterTag"
        ].forEach(function (id) {
            if ($(id)) {
                $(id).value = "all";
            }
        });

        aplicarFiltros();
    }

    function alternarFiltrosExtra() {
        const panel = $("inventoryExtraFilters");

        if (!panel) return;

        if (panel.hasAttribute("hidden")) {
            panel.removeAttribute("hidden");
        } else {
            panel.setAttribute("hidden", "");
        }
    }

    $("btnInventoryFilter")?.addEventListener(
        "click",
        alternarFiltrosExtra
    );

    $("btnAddInventoryFilter")?.addEventListener(
        "click",
        alternarFiltrosExtra
    );

    $$("[data-fast-filter]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            const filtro = this.dataset.fastFilter;

            limpiarFiltros();

            if (
                filtro === "infected" &&
                $("filterInfection")
            ) {
                $("filterInfection").value =
                    "infected";
            }

            if (
                filtro === "disconnected" &&
                $("filterOperational")
            ) {
                $("filterOperational").value =
                    "disconnected";
            }

            if (
                filtro === "windows" &&
                $("filterOSVersion")
            ) {
                $("filterOSVersion").value =
                    "windows";
            }

            aplicarFiltros();

            toast(
                filtro === "all"
                    ? "Filtros eliminados."
                    : "Filtro rápido aplicado: " +
                          filtro +
                          "."
            );
        });
    });

    $("inventoryTime")?.addEventListener(
        "change",
        function () {
            toast(
                "Rango actualizado a " +
                    this.options[
                        this.selectedIndex
                    ].text +
                    "."
            );
        }
    );

    /* =========================================
       TARJETAS DEL RESUMEN
    ========================================= */

    function seleccionarTarjeta(tarjeta) {
        const seleccionada =
            tarjeta.classList.contains("selected");

        $$(".interactive-inventory-card").forEach(
            function (item) {
                item.classList.remove("selected");
            }
        );

        limpiarFiltros();

        if (seleccionada) return;

        tarjeta.classList.add("selected");

        const filtro = tarjeta.dataset.cardFilter;

        if (
            filtro === "infected" &&
            $("filterInfection")
        ) {
            $("filterInfection").value =
                "infected";
        }

        if (
            filtro === "disconnected" &&
            $("filterOperational")
        ) {
            $("filterOperational").value =
                "disconnected";
        }

        if (
            filtro === "windows" &&
            $("filterOSVersion")
        ) {
            $("filterOSVersion").value =
                "windows";
        }

        if (
            filtro === "pending" &&
            $("assetSearch")
        ) {
            $("assetSearch").value =
                "Carlos MacBook";
        }

        aplicarFiltros();
        toast("Resumen aplicado al inventario.");
    }

    $$(".interactive-inventory-card").forEach(
        function (tarjeta) {
            tarjeta.addEventListener(
                "click",
                function () {
                    seleccionarTarjeta(this);
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
                        seleccionarTarjeta(this);
                    }
                }
            );
        }
    );

    $("toggleInventorySummary")?.addEventListener(
        "change",
        function () {
            $("inventorySummary")?.classList.toggle(
                "collapsed",
                !this.checked
            );
        }
    );

    /* =========================================
       PESTAÑAS
    ========================================= */

    $$("[data-tab]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            $$("[data-tab]").forEach(
                function (item) {
                    item.classList.remove("active");
                }
            );

            this.classList.add("active");

            const tab = this.dataset.tab;

            if (tab === "endpoint") {
                limpiarFiltros();
                toast(
                    "Inventario de endpoints activo."
                );
            } else if (tab === "all") {
                limpiarFiltros();
                toast(
                    "Mostrando todos los activos disponibles."
                );
            } else {
                toast(
                    "Vista de aplicaciones preparada para una pantalla posterior."
                );
            }
        });
    });

    /* =========================================
       SELECCIÓN Y ACCIONES
    ========================================= */

    function actualizarSeleccion() {
        const seleccionados =
            $$(".inventory-check:checked");

        const boton =
            $("btnInventoryActions");

        if (boton) {
            boton.disabled =
                seleccionados.length === 0;

            boton.textContent =
                seleccionados.length
                    ? "Actions (" +
                      seleccionados.length +
                      ")⌄"
                    : "Actions⌄";
        }

        $$("#inventoryRows tr").forEach(
            function (fila) {
                fila.classList.toggle(
                    "selected",
                    Boolean(
                        fila.querySelector(
                            ".inventory-check"
                        )?.checked
                    )
                );
            }
        );
    }

    $$(".inventory-check").forEach(
        function (checkbox) {
            checkbox.addEventListener(
                "change",
                actualizarSeleccion
            );
        }
    );

    $("selectAllInventory")?.addEventListener(
        "change",
        function () {
            const seleccionar = this.checked;

            $$(
                "#inventoryRows tr:not([hidden]) .inventory-check"
            ).forEach(function (checkbox) {
                checkbox.checked = seleccionar;
            });

            actualizarSeleccion();
        }
    );

    function abrirAcciones() {
        const seleccionados =
            $$(".inventory-check:checked");

        if (!seleccionados.length) return;

        if ($("inventoryActionsCount")) {
            $("inventoryActionsCount").textContent =
                seleccionados.length +
                (seleccionados.length === 1
                    ? " endpoint seleccionado"
                    : " endpoints seleccionados");
        }

        actionsLayer?.classList.add("open");

        actionsLayer?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarAcciones() {
        actionsLayer?.classList.remove("open");

        actionsLayer?.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    $("btnInventoryActions")?.addEventListener(
        "click",
        abrirAcciones
    );

    $("closeInventoryActions")?.addEventListener(
        "click",
        cerrarAcciones
    );

    $("closeActionsBackdrop")?.addEventListener(
        "click",
        cerrarAcciones
    );

    function marcarAislada(fila) {
        if (!fila) return;

        fila.dataset.state = "disconnected";
        fila.dataset.infection = "isolated";

        fila.classList.remove(
            "incident-endpoint"
        );

        fila.classList.add(
            "isolated-endpoint"
        );

        const nota =
            fila.querySelector(".asset-name small");

        if (nota) {
            nota.textContent =
                "Isolated endpoint";
        }
    }

    $$("[data-bulk-action]").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const seleccionados =
                        $$(".inventory-check:checked");

                    const accion =
                        this.dataset.bulkAction;

                    seleccionados.forEach(
                        function (checkbox) {
                            const fila =
                                checkbox.closest("tr");

                            if (
                                accion === "isolate"
                            ) {
                                marcarAislada(fila);
                            }

                            if (
                                accion === "tag" &&
                                fila
                            ) {
                                fila.dataset.tag +=
                                    " critical";
                            }

                            checkbox.checked = false;
                        }
                    );

                    cerrarAcciones();
                    actualizarSeleccion();
                    aplicarFiltros();

                    const mensajes = {
                        scan:
                            "Análisis iniciado en los endpoints seleccionados.",

                        isolate:
                            "Los endpoints seleccionados fueron aislados.",

                        tag:
                            "Etiqueta del incidente #2026-001 aplicada."
                    };

                    toast(mensajes[accion]);
                }
            );
        }
    );

    $("btnScopeActions")?.addEventListener(
        "click",
        function () {
            toast(
                "Selecciona uno o más equipos para aplicar acciones."
            );
        }
    );

    /* =========================================
       DETALLE DEL ENDPOINT
    ========================================= */

    function primerIP(fila) {
        return (
            fila
                .querySelector(".ip-pill")
                ?.textContent.trim() ||
            "Sin IP"
        );
    }

    function abrirEndpoint(fila) {
        if (!fila) return;

        filaActiva = fila;

        const nombre = fila.dataset.asset;
        const estado = fila.dataset.infection;

        const conectado =
            fila.dataset.state === "connected"
                ? "Connected"
                : "Disconnected";

        const usuario =
            fila.dataset.user ||
            "Sin usuario";

        const os =
            fila.children[2]?.textContent.trim() ||
            "Desconocido";

        const agente =
            fila
                .querySelector(".agent-version")
                ?.textContent.replace("↗", "")
                .trim() ||
            "Desconocido";

        if ($("drawerEndpointName")) {
            $("drawerEndpointName").textContent =
                nombre;
        }

        if ($("drawerEndpointConnection")) {
            $("drawerEndpointConnection").textContent =
                conectado;
        }

        if ($("drawerEndpointUser")) {
            $("drawerEndpointUser").textContent =
                usuario;
        }

        if ($("drawerEndpointOS")) {
            $("drawerEndpointOS").textContent =
                os;
        }

        if ($("drawerEndpointAgent")) {
            $("drawerEndpointAgent").textContent =
                agente;
        }

        if ($("drawerEndpointIP")) {
            $("drawerEndpointIP").textContent =
                primerIP(fila);
        }

        const estadoElemento =
            $("drawerEndpointState");

        const warning =
            $("endpointWarning");

        const aislar =
            $("btnIsolateInventoryEndpoint");

        if (estadoElemento) {
            estadoElemento.textContent =
                estado.toUpperCase();

            estadoElemento.className =
                estado === "clean"
                    ? "clean"
                    : estado === "isolated"
                    ? "isolated"
                    : "";
        }

        if (warning) {
            warning.classList.toggle(
                "clean",
                estado === "clean"
            );

            const titulo =
                warning.querySelector("strong");

            const texto =
                warning.querySelector("p");

            if (titulo) {
                titulo.textContent =
                    estado === "infected"
                        ? "Ransomware detectado"
                        : estado === "isolated"
                        ? "Endpoint aislado"
                        : "Sin amenazas activas";
            }

            if (texto) {
                texto.textContent =
                    estado === "infected"
                        ? "El equipo presenta actividad de cifrado y debe aislarse para detener la propagación."
                        : estado === "isolated"
                        ? "El equipo no puede comunicarse con otros dispositivos, pero conserva conexión con SentinelOne."
                        : "El endpoint no presenta actividad maliciosa en esta simulación.";
            }
        }

        if (aislar) {
            const aislado =
                estado === "isolated";

            aislar.disabled = aislado;

            aislar.classList.toggle(
                "done",
                aislado
            );

            aislar.textContent = aislado
                ? "Endpoint aislado ✓"
                : "Aislar endpoint";
        }

        endpointDrawer?.classList.add("open");

        endpointDrawer?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarEndpoint() {
        endpointDrawer?.classList.remove("open");

        endpointDrawer?.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    $$(".asset-name").forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                abrirEndpoint(
                    this.closest("tr")
                );
            }
        );
    });

    $$(".agent-version").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    abrirEndpoint(
                        this.closest("tr")
                    );
                }
            );
        }
    );

    $("closeEndpointDrawer")?.addEventListener(
        "click",
        cerrarEndpoint
    );

    $("closeEndpointBackdrop")?.addEventListener(
        "click",
        cerrarEndpoint
    );

    $("btnScanEndpoint")?.addEventListener(
        "click",
        function () {
            if (!filaActiva) return;

            this.textContent = "Analizando...";

            const boton = this;
            const nombreAnalizado = filaActiva.dataset.asset;

            window.setTimeout(function () {
                boton.textContent =
                    "Análisis completado ✓";

                toast(
                    "Análisis completado en " +
                        nombreAnalizado +
                        "."
                );
            }, 650);
        }
    );

    $("btnIsolateInventoryEndpoint")?.addEventListener(
        "click",
        function () {
            if (
                !filaActiva ||
                filaActiva.dataset.infection ===
                    "isolated"
            ) {
                return;
            }

            marcarAislada(filaActiva);

            this.disabled = true;
            this.classList.add("done");
            this.textContent =
                "Endpoint aislado ✓";

            if ($("drawerEndpointState")) {
                $("drawerEndpointState").textContent =
                    "ISOLATED";

                $("drawerEndpointState").className =
                    "isolated";
            }

            if ($("drawerEndpointConnection")) {
                $("drawerEndpointConnection").textContent =
                    "Disconnected";
            }

            const warning =
                $("endpointWarning");

            if (warning) {
                const titulo =
                    warning.querySelector("strong");

                const texto =
                    warning.querySelector("p");

                if (titulo) {
                    titulo.textContent =
                        "Endpoint aislado";
                }

                if (texto) {
                    texto.textContent =
                        "La propagación fue detenida. El equipo conserva comunicación únicamente con SentinelOne.";
                }
            }

            aplicarFiltros();

            toast(
                filaActiva.dataset.asset +
                    " fue aislado correctamente."
            );
        }
    );

    /* =========================================
       AGRUPACIÓN Y EXPORTACIÓN
    ========================================= */

    $("groupInventory")?.addEventListener(
        "change",
        function () {
            const cuerpo =
                $("inventoryRows");

            if (!cuerpo) return;

            const filas =
                $$("tr", cuerpo);

            if (this.checked) {
                filas.sort(function (a, b) {
                    return (
                        a.dataset.os.localeCompare(
                            b.dataset.os
                        ) ||
                        a.dataset.asset.localeCompare(
                            b.dataset.asset
                        )
                    );
                });

                toast(
                    "Endpoints agrupados por sistema operativo."
                );
            } else {
                filas.sort(function (a, b) {
                    return a.dataset.asset.localeCompare(
                        b.dataset.asset
                    );
                });

                toast(
                    "Agrupación desactivada."
                );
            }

            filas.forEach(function (fila) {
                cuerpo.appendChild(fila);
            });
        }
    );

    $("btnInventoryExport")?.addEventListener(
        "click",
        function () {
            const filas =
                $$("#inventoryRows tr:not([hidden])");

            const contenido = [
                "Asset,OS,Agent Version,Disk Usage,Last Active,IP,State,Infection"
            ];

            filas.forEach(function (fila) {
                const valores = [
                    fila.dataset.asset,

                    fila.children[2]?.textContent.trim(),

                    fila
                        .querySelector(
                            ".agent-version"
                        )
                        ?.textContent.replace(
                            "↗",
                            ""
                        )
                        .trim(),

                    fila.children[5]?.textContent.trim(),

                    fila.children[6]?.textContent.trim(),

                    primerIP(fila),

                    fila.dataset.state,

                    fila.dataset.infection
                ].map(function (valor) {
                    return (
                        '"' +
                        String(valor || "").replace(
                            /"/g,
                            '""'
                        ) +
                        '"'
                    );
                });

                contenido.push(
                    valores.join(",")
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
                "nerium-inventory.csv";

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();

            URL.revokeObjectURL(
                enlace.href
            );

            toast(
                "Inventario exportado correctamente."
            );
        }
    );

    /* =========================================
       BOTONES SUPERIORES
    ========================================= */

    $$(".inventory-header-right nav button").forEach(
        function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    toast(
                        this.textContent.trim() +
                            " seleccionado."
                    );
                }
            );
        }
    );

    $("btnInventorySettings")?.addEventListener(
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

            cerrarEndpoint();
            cerrarAcciones();
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