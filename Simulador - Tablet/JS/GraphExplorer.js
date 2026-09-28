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
    let nodoActivo = null;
    let filtroCriticoActivo = false;

    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const workspace = $("graphWorkspace");
    const viewport = $("graphViewport");
    const detalles = $("nodeDetails");
    const queryMenu = $("queryMenu");


    /* =========================================
       AUDIO
    ========================================= */

    function reproducirMusica() {
        if (!musica || silenciado || pausado) {
            return;
        }

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
        if (
            silenciado ||
            volumenEfectos === 0
        ) {
            return;
        }

        const sonido = new Audio(
            "Audio/Boton.mp3"
        );

        sonido.volume =
            volumenEfectos;

        sonido.play().catch(
            function () {}
        );
    }

    document.addEventListener(
        "click",
        function (evento) {
            if (
                evento.target.closest(
                    "button, .side-link, input"
                )
            ) {
                sonidoBoton();
            }
        }
    );


    /* =========================================
       MENSAJES Y RELOJ
    ========================================= */

    function toast(mensaje) {
        const elemento =
            $("toast");

        const texto =
            $("toastTexto");

        if (
            !elemento ||
            !texto
        ) {
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
            window.setTimeout(
                function () {
                    elemento.classList.remove(
                        "activo"
                    );
                },
                2800
            );
    }

    function formatearTiempo(total) {
        const horas = String(
            Math.floor(total / 3600)
        ).padStart(2, "0");

        const minutos = String(
            Math.floor(
                (total % 3600) / 60
            )
        ).padStart(2, "0");

        const segundos = String(
            total % 60
        ).padStart(2, "0");

        return (
            horas +
            ":" +
            minutos +
            ":" +
            segundos
        );
    }

    window.setInterval(
        function () {
            if (!pausado) {
                segundosSimulacion += 1;
            }

            if ($("relojSimulacion")) {
                $("relojSimulacion")
                    .textContent =
                    formatearTiempo(
                        segundosSimulacion
                    );
            }
        },
        1000
    );


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
            "Inicio.html";
    }

    $("btnPausa")?.addEventListener(
        "click",
        abrirPausa
    );

    $("btnContinuar")?.addEventListener(
        "click",
        cerrarPausa
    );

    $("btnConfiguracion")
        ?.addEventListener(
            "click",
            abrirConfig
        );

    $("cerrarConfig")?.addEventListener(
        "click",
        cerrarConfig
    );

    $("guardarConfig")
        ?.addEventListener(
            "click",
            cerrarConfig
        );

    $("btnRegresar")?.addEventListener(
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

                if (
                    $("valorMusica")
                ) {
                    $("valorMusica")
                        .textContent =
                        this.value + "%";
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

                if (
                    $("valorEfectos")
                ) {
                    $("valorEfectos")
                        .textContent =
                        this.value + "%";
                }
            }
        );

    $("silenciar")?.addEventListener(
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
       MENÚ LATERAL
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

    $$(
        '.side-link:not(.active):not([data-ready="true"])'
    ).forEach(function (enlace) {
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

    const menuSearch =
        $("menuSearch");

    menuSearch?.addEventListener(
        "input",
        function () {
            const termino =
                this.value
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
                        Boolean(
                            termino
                        ) &&
                        !texto.includes(
                            termino
                        );
                }
            );
        }
    );

    document.addEventListener(
        "keydown",
        function (evento) {
            if (
                (
                    evento.ctrlKey ||
                    evento.metaKey
                ) &&
                evento.key
                    .toLowerCase() ===
                    "k"
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
                "Selecciona un nodo para investigar la cadena del ransomware en FIN-014."
            );
        }
    );

    $("btnNotificaciones")
        ?.addEventListener(
            "click",
            function () {
                toast(
                    "Revisa los nodos de FIN-014 y la conexión hacia FIN-021."
                );
            }
        );


    /* =========================================
       CONSTRUCTOR DE CONSULTAS
    ========================================= */

    $("toggleQueryBuilder")
        ?.addEventListener(
            "click",
            function () {
                const builder =
                    $("queryBuilder");

                builder?.classList.toggle(
                    "collapsed"
                );

                const colapsado =
                    builder?.classList
                        .contains(
                            "collapsed"
                        );

                const indicador =
                    this.querySelector(
                        "span"
                    );

                if (indicador) {
                    indicador.textContent =
                        colapsado
                            ? "›"
                            : "⌄";
                }
            }
        );

    $("btnAddQueryItem")
        ?.addEventListener(
            "click",
            function (evento) {
                evento.stopPropagation();

                if (!queryMenu) {
                    return;
                }

                queryMenu.hidden =
                    !queryMenu.hidden;
            }
        );

    $$("[data-query-type]")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const tipo =
                        this.dataset
                            .queryType;

                    if (
                        $("queryChipText")
                    ) {
                        $("queryChipText")
                            .textContent =
                            tipo;
                    }

                    if (
                        $("queryChip")
                    ) {
                        $("queryChip")
                            .hidden =
                            false;
                    }

                    queryMenu.hidden =
                        true;

                    $$(".graph-node")
                        .forEach(
                            function (
                                nodo
                            ) {
                                nodo.hidden =
                                    nodo
                                        .classList
                                        .contains(
                                            "extra-node"
                                        );
                            }
                        );

                    if (
                        tipo ===
                        "Endpoints"
                    ) {
                        $$(".graph-node")
                            .forEach(
                                function (
                                    nodo
                                ) {
                                    nodo.hidden =
                                        nodo
                                            .dataset
                                            .endpoint !==
                                        "FIN-014";
                                }
                            );

                        toast(
                            "Consulta aplicada: endpoint FIN-014."
                        );
                    } else if (
                        tipo ===
                        "Processes"
                    ) {
                        $$(".graph-node")
                            .forEach(
                                function (
                                    nodo
                                ) {
                                    nodo.hidden =
                                        !/powershell|cmd|xshell/i
                                            .test(
                                                nodo
                                                    .dataset
                                                    .process
                                            );
                                }
                            );

                        toast(
                            "Consulta aplicada: procesos relacionados."
                        );
                    } else if (
                        tipo ===
                        "Users"
                    ) {
                        $$(".graph-node")
                            .forEach(
                                function (
                                    nodo
                                ) {
                                    nodo.hidden =
                                        nodo
                                            .dataset
                                            .endpoint !==
                                        "FIN-014";
                                }
                            );

                        toast(
                            "Actividad asociada con Carlos Hernández."
                        );
                    } else {
                        toast(
                            "Mostrando todas las alertas del incidente."
                        );
                    }
                }
            );
        });

    function limpiarConsulta() {
        if ($("queryChip")) {
            $("queryChip").hidden =
                true;
        }

        $$(".graph-node")
            .forEach(
                function (nodo) {
                    nodo.hidden =
                        nodo.classList
                            .contains(
                                "extra-node"
                            );
                }
            );

        workspace?.classList.remove(
            "filter-critical"
        );

        filtroCriticoActivo =
            false;

        toast(
            "Consulta eliminada. Agrega una condición para continuar."
        );
    }

    $("removeQueryChip")
        ?.addEventListener(
            "click",
            limpiarConsulta
        );

    $("btnClearQuery")
        ?.addEventListener(
            "click",
            limpiarConsulta
        );

    document.addEventListener(
        "click",
        function (evento) {
            if (
                !evento.target.closest(
                    "#btnAddQueryItem, #queryMenu"
                ) &&
                queryMenu
            ) {
                queryMenu.hidden =
                    true;
            }
        }
    );

    $("btnSaveQuery")
        ?.addEventListener(
            "click",
            function () {
                const nombre =
                    "Investigación FIN-014";

                const lista =
                    $("savedQueryList");

                if (
                    lista &&
                    !lista.querySelector(
                        '[data-saved-query="' +
                            nombre +
                            '"]'
                    )
                ) {
                    const boton =
                        document
                            .createElement(
                                "button"
                            );

                    boton.type =
                        "button";

                    boton.dataset
                        .savedQuery =
                        nombre;

                    boton.innerHTML =
                        "<strong>" +
                        nombre +
                        "</strong>" +
                        "<span>Alerts · FIN-014 · Ransomware</span>" +
                        "<small>Guardada ahora</small>";

                    lista.prepend(
                        boton
                    );

                    conectarConsultaGuardada(
                        boton
                    );
                }

                toast(
                    "Consulta guardada en la biblioteca."
                );
            }
        );

    $("btnPinQuery")
        ?.addEventListener(
            "click",
            function () {
                this.classList.toggle(
                    "active"
                );

                toast(
                    this.classList.contains(
                        "active"
                    )
                        ? "Consulta fijada."
                        : "Consulta desfijada."
                );
            }
        );


    /* =========================================
       PESTAÑAS Y BIBLIOTECA
    ========================================= */

    function mostrarPestana(nombre) {
        const biblioteca =
            nombre === "library";

        if ($("queryBuilder")) {
            $("queryBuilder").hidden =
                biblioteca;
        }

        if (workspace) {
            workspace.hidden =
                biblioteca;
        }

        if (
            $("queryLibraryView")
        ) {
            $("queryLibraryView")
                .hidden =
                !biblioteca;
        }

        $$("[data-graph-tab]")
            .forEach(
                function (boton) {
                    boton.classList.toggle(
                        "active",
                        boton.dataset
                            .graphTab ===
                            nombre
                    );
                }
            );
    }

    $$("[data-graph-tab]")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    mostrarPestana(
                        this.dataset
                            .graphTab
                    );
                }
            );
        });

    $("btnQueryLibrary")
        ?.addEventListener(
            "click",
            function () {
                mostrarPestana(
                    "library"
                );
            }
        );

    $("btnBackToGraph")
        ?.addEventListener(
            "click",
            function () {
                mostrarPestana(
                    "graph"
                );
            }
        );

    function conectarConsultaGuardada(
        boton
    ) {
        boton.addEventListener(
            "click",
            function () {
                const nombre =
                    this.dataset
                        .savedQuery;

                mostrarPestana(
                    "graph"
                );

                if (
                    $("queryChip")
                ) {
                    $("queryChip")
                        .hidden =
                        false;
                }

                if (
                    $("queryChipText")
                ) {
                    $("queryChipText")
                        .textContent =
                        nombre;
                }

                filtroCriticoActivo =
                    /critical/i.test(
                        nombre
                    );

                workspace
                    ?.classList.toggle(
                        "filter-critical",
                        filtroCriticoActivo
                    );

                toast(
                    "Consulta cargada: " +
                        nombre +
                        "."
                );
            }
        );
    }

    $$("[data-saved-query]")
        .forEach(
            conectarConsultaGuardada
        );


    /* =========================================
       POSICIÓN DEL CUADRO DE DETALLES
    ========================================= */

    function posicionarDetalle(nodo) {
        if (
            !nodo ||
            !detalles ||
            !viewport
        ) {
            return;
        }

        const nodoRect =
            nodo.getBoundingClientRect();

        const viewportRect =
            viewport
                .getBoundingClientRect();

        const anchoDetalle =
            detalles.offsetWidth ||
            292;

        const altoDetalle =
            detalles.offsetHeight ||
            330;

        const separacion = 16;
        const margen = 12;

        let izquierda =
            nodoRect.right -
            viewportRect.left +
            viewport.scrollLeft +
            separacion;

        let arriba =
            nodoRect.top -
            viewportRect.top +
            viewport.scrollTop;

        const limiteDerecho =
            viewport.scrollLeft +
            viewport.clientWidth -
            anchoDetalle -
            margen;

        if (
            izquierda >
            limiteDerecho
        ) {
            izquierda =
                nodoRect.left -
                viewportRect.left +
                viewport.scrollLeft -
                anchoDetalle -
                separacion;
        }

        izquierda = Math.max(
            viewport.scrollLeft +
                margen,
            izquierda
        );

        const limiteInferior =
            viewport.scrollTop +
            viewport.clientHeight -
            altoDetalle -
            margen;

        arriba = Math.min(
            arriba,
            limiteInferior
        );

        arriba = Math.max(
            viewport.scrollTop +
                margen,
            arriba
        );

        detalles.style.left =
            izquierda + "px";

        detalles.style.top =
            arriba + "px";
    }


    /* =========================================
       NODOS Y DETALLES
    ========================================= */

    function abrirDetalle(nodo) {
        nodoActivo = nodo;

        $$(".graph-node").forEach(
            function (item) {
                item.classList.toggle(
                    "selected",
                    item === nodo
                );
            }
        );

        const severidad =
            nodo.dataset.severity ||
            "high";

        if ($("detailSeverity")) {
            $("detailSeverity")
                .textContent =
                severidad
                    .toUpperCase() +
                " ALERT";

            $("detailSeverity")
                .className =
                severidad;
        }

        if ($("detailTitle")) {
            $("detailTitle")
                .textContent =
                nodo.dataset.title;
        }

        if (
            $("detailDescription")
        ) {
            $("detailDescription")
                .textContent =
                nodo.dataset
                    .description;
        }

        if ($("detailEndpoint")) {
            $("detailEndpoint")
                .textContent =
                nodo.dataset
                    .endpoint;
        }

        if ($("detailProcess")) {
            $("detailProcess")
                .textContent =
                nodo.dataset
                    .process;
        }

        if ($("detailTime")) {
            $("detailTime")
                .textContent =
                nodo.dataset.time;
        }

        posicionarDetalle(
            nodo
        );

        detalles?.classList.add(
            "open"
        );

        detalles?.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    function cerrarDetalle() {
        detalles?.classList.remove(
            "open"
        );

        detalles?.setAttribute(
            "aria-hidden",
            "true"
        );

        $$(".graph-node").forEach(
            function (item) {
                item.classList.remove(
                    "selected"
                );
            }
        );

        nodoActivo = null;
    }

    $$(".graph-node").forEach(
        function (nodo) {
            nodo.addEventListener(
                "click",
                function () {
                    abrirDetalle(
                        this
                    );
                }
            );
        }
    );

    $("closeNodeDetails")
        ?.addEventListener(
            "click",
            cerrarDetalle
        );

    $("btnOpenAlert")
        ?.addEventListener(
            "click",
            function () {
                window.location.href =
                    "Alerts.html";
            }
        );

    $("btnInvestigateNode")
        ?.addEventListener(
            "click",
            function () {
                if (!nodoActivo) {
                    return;
                }

                nodoActivo.classList.add(
                    "investigating"
                );

                this.textContent =
                    "Investigando ✓";

                toast(
                    nodoActivo.dataset
                        .title +
                        " añadido a la investigación."
                );
            }
        );


    /* =========================================
       HERRAMIENTAS DEL GRÁFICO
    ========================================= */

    $$("[data-graph-tool]")
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    const herramienta =
                        this.dataset
                            .graphTool;

                    if (
                        herramienta ===
                        "connections"
                    ) {
                        workspace
                            ?.classList.toggle(
                                "connections-off"
                            );

                        this.classList.toggle(
                            "active"
                        );

                        toast(
                            workspace
                                ?.classList
                                .contains(
                                    "connections-off"
                                )
                                ? "Conexiones ocultas."
                                : "Conexiones visibles."
                        );
                    }

                    if (
                        herramienta ===
                        "labels"
                    ) {
                        workspace
                            ?.classList.toggle(
                                "labels-hidden"
                            );

                        this.classList.toggle(
                            "active"
                        );

                        toast(
                            workspace
                                ?.classList
                                .contains(
                                    "labels-hidden"
                                )
                                ? "Etiquetas ocultas."
                                : "Etiquetas visibles."
                        );
                    }

                    if (
                        herramienta ===
                        "filter"
                    ) {
                        filtroCriticoActivo =
                            !filtroCriticoActivo;

                        workspace
                            ?.classList.toggle(
                                "filter-critical",
                                filtroCriticoActivo
                            );

                        this.classList.toggle(
                            "active",
                            filtroCriticoActivo
                        );

                        toast(
                            filtroCriticoActivo
                                ? "Mostrando únicamente alertas críticas."
                                : "Mostrando todas las severidades."
                        );
                    }

                    if (
                        herramienta ===
                        "fit"
                    ) {
                        restablecerVista();

                        toast(
                            "Vista ajustada al contenido."
                        );
                    }
                }
            );
        });

    function actualizarZoom(valor) {
        const numero =
            Number(valor);

        if ($("zoomValue")) {
            $("zoomValue")
                .textContent =
                numero + "%";
        }

        if ($("graphNodes")) {
            $("graphNodes")
                .style
                .setProperty(
                    "--graph-scale",
                    String(
                        numero / 100
                    )
                );
        }
    }

    $("graphZoom")
        ?.addEventListener(
            "input",
            function () {
                actualizarZoom(
                    this.value
                );
            }
        );

    function restablecerVista() {
        if ($("graphZoom")) {
            $("graphZoom").value =
                "100";
        }

        actualizarZoom(100);

        viewport?.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }

    $("btnGraphMinimap")
        ?.addEventListener(
            "click",
            function () {
                restablecerVista();

                toast(
                    "Posición y zoom restablecidos."
                );
            }
        );

    $("btnLoadMoreNodes")
        ?.addEventListener(
            "click",
            function () {
                const extras =
                    $$(".extra-node");

                const ocultos =
                    extras.filter(
                        function (nodo) {
                            return nodo.hidden;
                        }
                    );

                if (
                    !ocultos.length
                ) {
                    toast(
                        "No hay más nodos para cargar."
                    );

                    return;
                }

                ocultos.forEach(
                    function (nodo) {
                        nodo.hidden =
                            false;
                    }
                );

                this.textContent =
                    "All nodes loaded";

                this.disabled =
                    true;

                toast(
                    extras.length +
                        " alertas adicionales cargadas."
                );
            }
        );


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

            cerrarDetalle();
            cerrarMenu();

            if (queryMenu) {
                queryMenu.hidden =
                    true;
            }

            overlayConfig
                ?.classList.remove(
                    "activo"
                );

            if (
                overlayPausa
                    ?.classList
                    .contains(
                        "activo"
                    )
            ) {
                cerrarPausa();
            }
        }
    );

    actualizarZoom(100);
});