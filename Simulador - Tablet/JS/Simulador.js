document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    let pausado = false;
    let volumenMusica = 0.25;
    let volumenEfectos = 0.5;
    let silenciado = false;
    let endpointAislado = false;
    let configuracionDesdePausa = false;
    let temporizadorToast = null;

    const $ = (id) => document.getElementById(id);

    const $$ = (selector, contexto = document) =>
        Array.from(contexto.querySelectorAll(selector));

    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const estadoEndpoint = $("estadoEndpoint");
    const btnAislar = $("btnAislar");
    const volumenMusicaControl = $("volumenMusica");
    const volumenEfectosControl = $("volumenEfectos");
    const silenciarControl = $("silenciar");

    /* =========================================
       AUDIO
    ========================================= */

    if (musica) {
        musica.volume = volumenMusica;
        musica.play().catch(() => {});
    }

    document.addEventListener(
        "pointerdown",
        function iniciarMusica() {
            if (musica && !silenciado && !pausado) {
                musica.play().catch(() => {});
            }
        },
        { once: true }
    );

    function sonidoBoton() {
        if (silenciado || volumenEfectos === 0) {
            return;
        }

        const sonido = new Audio("Audio/Boton.mp3");

        sonido.volume = volumenEfectos;
        sonido.play().catch(() => {});
    }

    document.addEventListener("click", function (evento) {
        if (
            evento.target.closest(
                "button, .side-link, .incident-strip a"
            )
        ) {
            sonidoBoton();
        }
    });

    /* =========================================
       MENSAJES
    ========================================= */

    function mostrarToast(mensaje) {
        const toast = $("toast");
        const texto = $("toastTexto");

        if (!toast || !texto) {
            return;
        }

        texto.textContent = mensaje;

        toast.classList.add("activo");

        clearTimeout(temporizadorToast);

        temporizadorToast = setTimeout(function () {
            toast.classList.remove("activo");
        }, 3200);
    }

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

        if (musica && !silenciado) {
            musica.play().catch(() => {});
        }
    }

    function abrirConfig(desdePausa = false) {
        configuracionDesdePausa = desdePausa;

        if (desdePausa) {
            overlayPausa?.classList.remove("activo");
        }

        overlayConfig?.classList.add("activo");
    }

    function cerrarConfig(guardar = false) {
        overlayConfig?.classList.remove("activo");

        if (guardar) {
            mostrarToast(
                "Configuración guardada correctamente"
            );
        }

        if (
            pausado &&
            configuracionDesdePausa
        ) {
            overlayPausa?.classList.add("activo");
        }

        configuracionDesdePausa = false;
    }

    function regresarInicio() {
        window.location.href = "Inicio.html";
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
        function () {
            abrirConfig(false);
        }
    );

    $("btnMenuConfig")?.addEventListener(
        "click",
        function () {
            abrirConfig(false);
        }
    );

    $("cerrarConfig")?.addEventListener(
        "click",
        function () {
            cerrarConfig(false);
        }
    );

    $("guardarConfig")?.addEventListener(
        "click",
        function () {
            cerrarConfig(true);
        }
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
            abrirConfig(true);
        }
    );

    volumenMusicaControl?.addEventListener(
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

    volumenEfectosControl?.addEventListener(
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

    silenciarControl?.addEventListener(
        "change",
        function () {
            silenciado = this.checked;

            if (!musica) {
                return;
            }

            if (silenciado) {
                musica.pause();
            } else {
                musica.volume = volumenMusica;

                if (!pausado) {
                    musica.play().catch(() => {});
                }
            }
        }
    );

    /* =========================================
       MENÚ RESPONSIVE
    ========================================= */

    function abrirMenu() {
        document.body.classList.add(
            "menu-abierto"
        );
    }

    function cerrarMenu() {
        document.body.classList.remove(
            "menu-abierto"
        );
    }

    $("btnAbrirMenu")?.addEventListener(
        "click",
        abrirMenu
    );

    $("sidebarBackdrop")?.addEventListener(
        "click",
        cerrarMenu
    );

    /* =========================================
       BUSCADOR DEL MENÚ
    ========================================= */

    const menuSearch = $("menuSearch");
    const enlacesMenu = $$(".side-link");
    const seccionesMenu = $$(".menu-section");

    function normalizarTexto(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    menuSearch?.addEventListener(
        "input",
        function () {
            const busqueda =
                normalizarTexto(this.value);

            enlacesMenu.forEach(
                function (enlace) {
                    const contenido =
                        normalizarTexto(
                            (enlace.dataset.menuText || "") +
                            " " +
                            enlace.textContent
                        );

                    enlace.hidden =
                        !contenido.includes(
                            busqueda
                        );
                }
            );

            seccionesMenu.forEach(
                function (seccion) {
                    if (!busqueda) {
                        seccion.hidden = false;
                        return;
                    }

                    let elemento =
                        seccion.nextElementSibling;

                    let tieneResultados = false;

                    while (
                        elemento &&
                        !elemento.classList.contains(
                            "menu-section"
                        )
                    ) {
                        if (
                            elemento.classList.contains(
                                "side-link"
                            ) &&
                            !elemento.hidden
                        ) {
                            tieneResultados = true;
                        }

                        elemento =
                            elemento.nextElementSibling;
                    }

                    seccion.hidden =
                        !tieneResultados;
                }
            );
        }
    );

    document.addEventListener(
        "keydown",
        function (evento) {
            if (
                (evento.ctrlKey ||
                    evento.metaKey) &&
                evento.key.toLowerCase() === "k"
            ) {
                evento.preventDefault();

                menuSearch?.focus();
            }

            if (evento.key === "Escape") {
                cerrarMenu();

                if (
                    overlayConfig?.classList.contains(
                        "activo"
                    )
                ) {
                    cerrarConfig(false);
                } else if (
                    overlayPausa?.classList.contains(
                        "activo"
                    )
                ) {
                    cerrarPausa();
                }
            }
        }
    );

    /* =========================================
       NAVEGACIÓN DEL MENÚ
    ========================================= */

    /*
        IMPORTANTE:
        NO usamos preventDefault().

        Cada enlace del menú utiliza directamente
        el href definido en el HTML.

        Esto permite navegar libremente entre:
        Dashboard
        Alerts
        Vulnerabilities
        Misconfigurations
        Event Search
        Inventory
        Graph Explorer
        Activities
        RemoteOps
        Detections
        Agent Management
        Reports
        Policies and Settings
    */

    $$(".side-link").forEach(
        function (enlace) {

            enlace.addEventListener(
                "click",
                function () {

                    cerrarMenu();

                }
            );

        }
    );

    /* =========================================
       PESTAÑAS DASHBOARD
    ========================================= */

    $$(".dashboard-tab").forEach(
        function (pestana) {

            pestana.addEventListener(
                "click",
                function () {

                    $$(".dashboard-tab").forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                    this.classList.add(
                        "active"
                    );

                    mostrarToast(
                        "Vista seleccionada: " +
                        this.textContent.trim()
                    );

                }
            );

        }
    );

    /* =========================================
       FILTRO SEVERIDAD
    ========================================= */

    $("filtroSeveridad")
        ?.addEventListener(
            "change",
            function () {

                const valor =
                    this.value;

                const filas =
                    $$(".alert-row");

                filas.forEach(
                    function (fila) {

                        if (
                            valor === "all"
                        ) {

                            fila.hidden = false;

                            return;

                        }

                        fila.hidden =
                            fila.dataset.severity !==
                            valor;

                    }
                );

            }
        );

    /* =========================================
       ESTADO SIMULACIÓN
    ========================================= */

    const estado = {
        iniciada: false,
        fase: 0,
        puntos: 0,
        aislado: false,
        procesoTerminado: false,
        cuarentena: false,
        recuperado: false,
        eventos: 3
    };

    /* =========================================
       PUNTUACIÓN
    ========================================= */

    function animarNumero(
        elemento,
        destino,
        duracion = 400
    ) {

        if (!elemento) {
            return;
        }

        const inicio =
            Number(elemento.textContent) || 0;

        const diferencia =
            destino - inicio;

        const inicioTiempo =
            performance.now();

        function actualizar(tiempo) {

            const progreso =
                Math.min(
                    (tiempo - inicioTiempo) /
                        duracion,
                    1
                );

            elemento.textContent =
                Math.round(
                    inicio +
                    diferencia * progreso
                );

            if (progreso < 1) {
                requestAnimationFrame(
                    actualizar
                );
            }

        }

        requestAnimationFrame(
            actualizar
        );

    }

    function sumarPuntos(puntos) {

        estado.puntos += puntos;

        animarNumero(
            $("puntuacion"),
            estado.puntos
        );

    }

    /* =========================================
       ACTIVIDAD
    ========================================= */

    const feed =
        $("activityFeed");

    const feedInicial =
        feed
            ? feed.innerHTML
            : "";

    function agregarActividad(
        titulo,
        descripcion,
        tipo = "neutral"
    ) {

        if (!feed) {
            return;
        }

        estado.eventos++;

        const elemento =
            document.createElement(
                "article"
            );

        elemento.className =
            "activity-item " + tipo;

        elemento.innerHTML = `
            <span class="activity-dot"></span>

            <div>
                <strong>${titulo}</strong>
                <small>${descripcion}</small>
            </div>
        `;

        feed.prepend(
            elemento
        );

        if (
            $("contadorEventos")
        ) {
            $("contadorEventos")
                .textContent =
                estado.eventos +
                " eventos";
        }

    }

    /* =========================================
       ETAPAS
    ========================================= */

    function actualizarEtapas() {

        $$(".simulation-step")
            .forEach(
                function (
                    paso,
                    indice
                ) {

                    paso.classList.remove(
                        "active",
                        "completed"
                    );

                    if (
                        indice <
                        estado.fase
                    ) {
                        paso.classList.add(
                            "completed"
                        );
                    }

                    if (
                        indice ===
                        estado.fase
                    ) {
                        paso.classList.add(
                            "active"
                        );
                    }

                }
            );

    }

    /* =========================================
       MENSAJE DE DECISIÓN
    ========================================= */

    function mostrarMensaje(
        mensaje
    ) {

        mostrarToast(
            mensaje
        );

    }

    function actualizarResultado(
        titulo,
        texto
    ) {

        const resultado =
            $("resultadoDecision");

        if (!resultado) {
            return;
        }

        resultado.hidden =
            false;

        resultado.innerHTML = `
            <strong>${titulo}</strong>
            <span>${texto}</span>
        `;

    }

    /* =========================================
       INICIAR INVESTIGACIÓN
    ========================================= */

    $("btnIniciarSimulacion")
        ?.addEventListener(
            "click",
            function () {

                if (
                    estado.iniciada
                ) {
                    return;
                }

                estado.iniciada =
                    true;

                estado.fase =
                    1;

                if (
                    $("estadoInvestigacion")
                ) {
                    $("estadoInvestigacion")
                        .textContent =
                        "INVESTIGATING";
                }

                if (
                    $("tituloSimulacion")
                ) {
                    $("tituloSimulacion")
                        .textContent =
                        "Investigando FIN-014";
                }

                this.textContent =
                    "Investigación activa";

                this.disabled =
                    true;

                sumarPuntos(
                    100
                );

                agregarActividad(
                    "Investigation started",
                    "El analista comenzó la investigación del incidente FIN-014.",
                    "neutral"
                );

                actualizarEtapas();

                mostrarMensaje(
                    "Investigación iniciada"
                );

            }
        );

    /* =========================================
       AISLAR ENDPOINT
    ========================================= */

    btnAislar?.addEventListener(
        "click",
        function () {

            if (
                estado.aislado
            ) {
                return;
            }

            estado.aislado =
                true;

            endpointAislado =
                true;

            estado.fase =
                Math.max(
                    estado.fase,
                    2
                );

            this.classList.remove(
                "recommended"
            );

            this.classList.add(
                "done"
            );

            this.disabled =
                true;

            const texto =
                this.querySelector(
                    "span"
                );

            if (texto) {
                texto.innerHTML = `
                    Endpoint aislado

                    <small>
                        FIN-014 contenido
                    </small>
                `;
            }

            if (
                estadoEndpoint
            ) {
                estadoEndpoint.textContent =
                    "ISOLATED";

                estadoEndpoint.classList.add(
                    "isolated"
                );
            }

            sumarPuntos(
                250
            );

            agregarActividad(
                "Endpoint isolated",
                "FIN-014 fue aislado de la red para evitar propagación.",
                "success"
            );

            actualizarResultado(
                "Endpoint aislado",
                "FIN-014 ya no puede comunicarse con otros dispositivos de la red."
            );

            actualizarEtapas();

            verificarRecuperacion();

        }
    );

    /* =========================================
       TERMINAR PROCESO
    ========================================= */

    $("btnTerminarProceso")
        ?.addEventListener(
            "click",
            function () {

                if (
                    estado.procesoTerminado
                ) {
                    return;
                }

                estado.procesoTerminado =
                    true;

                this.classList.add(
                    "done"
                );

                this.disabled =
                    true;

                const small =
                    this.querySelector(
                        "small"
                    );

                if (small) {
                    small.textContent =
                        "Proceso detenido";
                }

                sumarPuntos(
                    200
                );

                agregarActividad(
                    "Malicious process terminated",
                    "El proceso sospechoso de ransomware fue detenido.",
                    "success"
                );

                actualizarResultado(
                    "Proceso terminado",
                    "El cifrado activo fue detenido en FIN-014."
                );

                verificarRecuperacion();

            }
        );

    /* =========================================
       CUARENTENA
    ========================================= */

    $("btnCuarentena")
        ?.addEventListener(
            "click",
            function () {

                if (
                    estado.cuarentena
                ) {
                    return;
                }

                estado.cuarentena =
                    true;

                this.classList.add(
                    "done"
                );

                this.disabled =
                    true;

                const small =
                    this.querySelector(
                        "small"
                    );

                if (small) {
                    small.textContent =
                        "Archivo bloqueado";
                }

                sumarPuntos(
                    200
                );

                agregarActividad(
                    "Threat quarantined",
                    "El archivo malicioso fue enviado a cuarentena.",
                    "success"
                );

                actualizarResultado(
                    "Amenaza en cuarentena",
                    "El ejecutable malicioso ya no puede volver a ejecutarse."
                );

                verificarRecuperacion();

            }
        );

    /* =========================================
       RECUPERACIÓN
    ========================================= */

    function verificarRecuperacion() {

        const btnRecuperar =
            $("btnRecuperar");

        if (!btnRecuperar) {
            return;
        }

        if (
            estado.aislado &&
            estado.procesoTerminado &&
            estado.cuarentena
        ) {

            btnRecuperar.disabled =
                false;

            const texto =
                btnRecuperar.querySelector(
                    "span"
                );

            if (texto) {
                texto.innerHTML = `
                    Recuperar respaldo

                    <small>
                        Contención completada
                    </small>
                `;
            }

            estado.fase =
                Math.max(
                    estado.fase,
                    3
                );

            actualizarEtapas();

        }

    }

    $("btnRecuperar")
        ?.addEventListener(
            "click",
            function () {

                if (
                    estado.recuperado
                ) {
                    return;
                }

                estado.recuperado =
                    true;

                estado.fase =
                    4;

                this.classList.add(
                    "done"
                );

                this.disabled =
                    true;

                const texto =
                    this.querySelector(
                        "span"
                    );

                if (texto) {
                    texto.innerHTML = `
                        Sistema recuperado

                        <small>
                            Backup restaurado
                        </small>
                    `;
                }

                sumarPuntos(
                    450
                );

                agregarActividad(
                    "System recovered",
                    "FIN-014 fue restaurado desde un respaldo limpio.",
                    "success"
                );

                actualizarResultado(
                    "Incidente mitigado",
                    "La amenaza fue contenida y el endpoint fue recuperado correctamente."
                );

                if (
                    $("estadoInvestigacion")
                ) {
                    $("estadoInvestigacion")
                        .textContent =
                        "RESOLVED";
                }

                if (
                    $("tituloSimulacion")
                ) {
                    $("tituloSimulacion")
                        .textContent =
                        "Incidente resuelto: FIN-014";
                }

                document
                    .querySelector(
                        ".simulation-console"
                    )
                    ?.classList.add(
                        "completed"
                    );

                document
                    .querySelector(
                        ".incident-strip"
                    )
                    ?.classList.add(
                        "resolved"
                    );

                actualizarEtapas();

                mostrarMensaje(
                    "Ataque mitigado correctamente"
                );

            }
        );

    /* =========================================
       DRAWER DE INCIDENTE
    ========================================= */

    const drawer =
        $("incidentDrawer");

    const drawerBackdrop =
        $("drawerBackdrop");

    function abrirDrawer() {

        drawer?.classList.add(
            "open"
        );

        drawerBackdrop
            ?.classList.add(
                "active"
            );

    }

    function cerrarDrawer() {

        drawer?.classList.remove(
            "open"
        );

        drawerBackdrop
            ?.classList.remove(
                "active"
            );

    }

    $("btnVerIncidente")
        ?.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                abrirDrawer();

            }
        );

    $("cerrarDrawer")
        ?.addEventListener(
            "click",
            cerrarDrawer
        );

    drawerBackdrop
        ?.addEventListener(
            "click",
            cerrarDrawer
        );

    /* =========================================
       NOTIFICACIONES
    ========================================= */

    const notificaciones =
        $("panelNotificaciones");

    function cerrarNotificaciones() {

        if (
            notificaciones
        ) {
            notificaciones.hidden =
                true;
        }

    }

    $("btnNotificaciones")
        ?.addEventListener(
            "click",
            function () {

                if (
                    !notificaciones
                ) {

                    mostrarMensaje(
                        "1 incidente crítico pendiente"
                    );

                    return;
                }

                notificaciones.hidden =
                    !notificaciones.hidden;

            }
        );

    /* =========================================
       REINICIAR SIMULACIÓN
    ========================================= */

    $("btnReiniciarSimulacion")
        ?.addEventListener(
            "click",
            function () {

                Object.assign(
                    estado,
                    {
                        iniciada: false,
                        fase: 0,
                        puntos: 0,
                        aislado: false,
                        procesoTerminado:
                            false,
                        cuarentena: false,
                        recuperado: false,
                        eventos: 3
                    }
                );

                endpointAislado =
                    false;

                cerrarDrawer();

                animarNumero(
                    $("puntuacion"),
                    0
                );

                if (feed) {
                    feed.innerHTML =
                        feedInicial;
                }

                if (
                    $("contadorEventos")
                ) {
                    $("contadorEventos")
                        .textContent =
                        "3 eventos";
                }

                if (
                    $("tituloSimulacion")
                ) {
                    $("tituloSimulacion")
                        .textContent =
                        "Incidente activo: FIN-014";
                }

                if (
                    $("btnIniciarSimulacion")
                ) {
                    $("btnIniciarSimulacion")
                        .textContent =
                        "Iniciar investigación";

                    $("btnIniciarSimulacion")
                        .disabled =
                        false;
                }

                if (
                    $("estadoInvestigacion")
                ) {
                    $("estadoInvestigacion")
                        .textContent =
                        "NEW";
                }

                if (
                    $("instruccionDecision")
                ) {
                    $("instruccionDecision")
                        .textContent =
                        "La contención rápida reduce el impacto y evita la propagación.";
                }

                if (
                    $("resultadoDecision")
                ) {
                    $("resultadoDecision")
                        .hidden =
                        true;
                }

                $$(".decision-button")
                    .forEach(
                        function (boton) {

                            boton.classList.remove(
                                "done",
                                "recommended"
                            );

                            boton.disabled =
                                false;

                        }
                    );

                $("btnAislar")
                    ?.classList.add(
                        "recommended"
                    );

                $("btnRecuperar")
                    ?.setAttribute(
                        "disabled",
                        "true"
                    );

                if (
                    $("btnAislar")
                ) {
                    $("btnAislar")
                        .querySelector(
                            "span"
                        ).innerHTML = `
                            Aislar endpoint

                            <small>
                                Recomendado
                            </small>
                        `;
                }

                if (
                    $("btnTerminarProceso")
                ) {
                    $("btnTerminarProceso")
                        .querySelector(
                            "small"
                        ).textContent =
                        "Detener cifrado";
                }

                if (
                    $("btnCuarentena")
                ) {
                    $("btnCuarentena")
                        .querySelector(
                            "small"
                        ).textContent =
                        "Bloquear archivo";
                }

                if (
                    $("btnRecuperar")
                ) {
                    $("btnRecuperar")
                        .querySelector(
                            "span"
                        ).innerHTML = `
                            Recuperar respaldo

                            <small>
                                Disponible tras contener
                            </small>
                        `;
                }

                document
                    .querySelector(
                        ".simulation-console"
                    )
                    ?.classList.remove(
                        "completed"
                    );

                document
                    .querySelector(
                        ".incident-strip"
                    )
                    ?.classList.remove(
                        "resolved"
                    );

                actualizarEtapas();

                mostrarMensaje(
                    "Simulación reiniciada"
                );

            }
        );

    /* =========================================
       TARJETAS INTERACTIVAS
    ========================================= */

    function activarTarjeta(
        tarjeta
    ) {

        const yaEstabaAbierta =
            tarjeta.classList.contains(
                "selected"
            );

        $$(".interactive-card")
            .forEach(
                function (item) {

                    item.classList.remove(
                        "selected"
                    );

                }
            );

        if (
            yaEstabaAbierta
        ) {

            mostrarMensaje(
                "Detalle cerrado"
            );

            return;

        }

        tarjeta.classList.add(
            "selected"
        );

        const filtro =
            tarjeta.dataset.cardFilter;

        if (
            filtro === "critical" &&
            $("filtroSeveridad")
        ) {

            $("filtroSeveridad")
                .value =
                "critical";

            $("filtroSeveridad")
                .dispatchEvent(
                    new Event(
                        "change"
                    )
                );

            mostrarMensaje(
                "Filtro aplicado: alertas críticas"
            );

        }

        else if (
            filtro === "all" &&
            $("filtroSeveridad")
        ) {

            $("filtroSeveridad")
                .value =
                "all";

            $("filtroSeveridad")
                .dispatchEvent(
                    new Event(
                        "change"
                    )
                );

            mostrarMensaje(
                "Mostrando todas las alertas"
            );

        }

        else if (
            filtro === "unassigned" &&
            $("filtroAsignado")
        ) {

            $("filtroAsignado")
                .value =
                "unassigned";

            mostrarMensaje(
                "Filtro aplicado: alertas sin asignar"
            );

        }

        else {

            mostrarMensaje(
                "Panel seleccionado: " +
                filtro
            );

        }

    }

    $$(".interactive-card")
        .forEach(
            function (tarjeta) {

                tarjeta.addEventListener(
                    "click",
                    function () {

                        activarTarjeta(
                            tarjeta
                        );

                    }
                );

                tarjeta.addEventListener(
                    "keydown",
                    function (evento) {

                        if (
                            evento.key ===
                                "Enter" ||
                            evento.key ===
                                " "
                        ) {

                            evento.preventDefault();

                            activarTarjeta(
                                tarjeta
                            );

                        }

                    }
                );

            }
        );

    /* =========================================
       ACTUALIZACIÓN
    ========================================= */

    $("btnActualizar")
        ?.addEventListener(
            "click",
            function () {

                setTimeout(
                    function () {

                        agregarActividad(
                            "Console synchronized",
                            "La información de los agentes fue actualizada.",
                            "neutral"
                        );

                    },
                    720
                );

            }
        );

    /* =========================================
       AYUDA
    ========================================= */

    document
        .querySelector(
            ".top-text-button"
        )
        ?.addEventListener(
            "click",
            function () {

                mostrarMensaje(
                    "Consejo: investiga, contiene y después recupera"
                );

            }
        );

    /* =========================================
       ESCAPE
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

            if (
                drawer?.classList.contains(
                    "open"
                )
            ) {

                cerrarDrawer();

            }

            else if (
                notificaciones &&
                !notificaciones.hidden
            ) {

                cerrarNotificaciones();

            }

        }
    );

    /* =========================================
       ANIMACIÓN INICIAL
    ========================================= */

    actualizarEtapas();

    setTimeout(
        function () {

            document.body.classList.add(
                "ready"
            );

            animarNumero(
                $("totalAlertas"),
                37,
                650
            );

            animarNumero(
                $("alertasSinAsignar"),
                18,
                650
            );

        },
        80
    );

});