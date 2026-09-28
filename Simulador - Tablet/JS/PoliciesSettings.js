document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =========================================
       HELPERS
    ========================================== */

    const $ = (id) =>
        document.getElementById(id);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));


    /* =========================================
       VARIABLES GENERALES
    ========================================== */

    let pausado = false;

    let silenciado = false;

    let volumenMusica = 0.25;

    let volumenEfectos = 0.50;

    let segundosSimulacion = 0;

    let temporizadorToast = null;


    const musica =
        $("musicaFondo");


    /* =========================================
       CONFIGURACIÓN DE POLÍTICA
    ========================================== */

    const politicaDefault = {

        detect: true,

        killProcess: true,

        quarantine: true,

        isolation: false,

        rollback: false,

        responseMode: "protect"

    };


    let politica =
        cargarPolitica();


    /* =========================================
       CARGAR POLITICA
    ========================================== */

    function cargarPolitica() {

        try {

            const guardada =
                localStorage.getItem(
                    "neriumRansomwarePolicy"
                );


            if (!guardada) {

                return {
                    ...politicaDefault
                };

            }


            return {

                ...politicaDefault,

                ...JSON.parse(
                    guardada
                )

            };

        }

        catch (error) {

            return {
                ...politicaDefault
            };

        }

    }


    /* =========================================
       GUARDAR POLITICA
    ========================================== */

    function guardarPolitica() {

        politica = {

            detect:
                $("policyDetect")
                    .checked,

            killProcess:
                $("policyKill")
                    .checked,

            quarantine:
                $("policyQuarantine")
                    .checked,

            isolation:
                $("policyIsolation")
                    .checked,

            rollback:
                $("policyRollback")
                    .checked,

            responseMode:
                $("responseMode")
                    .value

        };


        localStorage.setItem(
            "neriumRansomwarePolicy",
            JSON.stringify(
                politica
            )
        );


        actualizarAdvertencia();


        toast(
            "Ransomware protection policy guardada."
        );

    }


    /* =========================================
       APLICAR POLITICA
    ========================================== */

    function aplicarPoliticaFormulario() {

        $("policyDetect")
            .checked =
            politica.detect;


        $("policyKill")
            .checked =
            politica.killProcess;


        $("policyQuarantine")
            .checked =
            politica.quarantine;


        $("policyIsolation")
            .checked =
            politica.isolation;


        $("policyRollback")
            .checked =
            politica.rollback;


        $("responseMode")
            .value =
            politica.responseMode;


        actualizarAdvertencia();

    }


    /* =========================================
       AUDIO
    ========================================== */

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
        reproducirMusica,
        {
            once: true
        }
    );


    function sonidoBoton() {

        if (
            silenciado ||
            volumenEfectos === 0
        ) {

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


    document.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target.closest(
                    "button, .side-link, .settings-card, select, input"
                )
            ) {

                sonidoBoton();

            }

        }
    );


    /* =========================================
       TOAST
    ========================================== */

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
            setTimeout(
                function () {

                    elemento.classList.remove(
                        "activo"
                    );

                },
                2800
            );

    }


    /* =========================================
       RELOJ
    ========================================== */

    function formatearTiempo(total) {

        const horas =
            String(
                Math.floor(
                    total / 3600
                )
            ).padStart(2, "0");


        const minutos =
            String(
                Math.floor(
                    (total % 3600) / 60
                )
            ).padStart(2, "0");


        const segundos =
            String(
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


    setInterval(
        function () {

            if (!pausado) {

                segundosSimulacion++;

            }


            if (
                $("relojSimulacion")
            ) {

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
       MENU
    ========================================== */

    function cerrarMenu() {

        document.body
            .classList.remove(
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


    $("menuSearch")
        ?.addEventListener(
            "input",
            function () {

                const termino =
                    this.value
                        .trim()
                        .toLowerCase();


                $$(".side-link")
                    .forEach(
                        function (enlace) {

                            const texto =
                                (
                                    enlace.dataset.menuText ||
                                    enlace.textContent
                                )
                                    .toLowerCase();


                            enlace.hidden =
                                termino &&
                                !texto.includes(
                                    termino
                                );

                        }
                    );

            }
        );


    /* =========================================
       BUSQUEDA SETTINGS
    ========================================== */

    $("settingsSearch")
        ?.addEventListener(
            "input",
            function () {

                const termino =
                    this.value
                        .trim()
                        .toLowerCase();


                let visibles = 0;


                $$(".settings-card")
                    .forEach(
                        function (card) {

                            const texto =
                                (
                                    card.dataset.search +
                                    " " +
                                    card.textContent
                                )
                                    .toLowerCase();


                            const mostrar =
                                !termino ||
                                texto.includes(
                                    termino
                                );


                            card.classList.toggle(
                                "hidden-setting",
                                !mostrar
                            );


                            if (mostrar) {

                                visibles++;

                            }

                        }
                    );


                $("settingsEmpty")
                    .hidden =
                    visibles !== 0;

            }
        );


    /* =========================================
       DRAWER
    ========================================== */

    function abrirPolicyDrawer() {

        $("policyDrawer")
            .classList.add(
                "active"
            );


        $("drawerBackdrop")
            .classList.add(
                "active"
            );


        $("policyDrawer")
            .setAttribute(
                "aria-hidden",
                "false"
            );


        aplicarPoliticaFormulario();

    }


    function cerrarPolicyDrawer() {

        $("policyDrawer")
            .classList.remove(
                "active"
            );


        $("drawerBackdrop")
            .classList.remove(
                "active"
            );


        $("policyDrawer")
            .setAttribute(
                "aria-hidden",
                "true"
            );

    }


    $("closePolicyDrawer")
        ?.addEventListener(
            "click",
            cerrarPolicyDrawer
        );


    $("drawerBackdrop")
        ?.addEventListener(
            "click",
            cerrarPolicyDrawer
        );


    /* =========================================
       TARJETAS
    ========================================== */

    $$(".settings-card")
        .forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        const setting =
                            this.dataset.setting;


                        if (
                            setting ===
                            "policy"
                        ) {

                            abrirPolicyDrawer();

                            return;

                        }


                        const titulos = {

                            console:
                                "Console settings",

                            users:
                                "User management",

                            scope:
                                "Scopes",

                            integrations:
                                "Integrations",

                            api:
                                "API Tokens",

                            cloud:
                                "Cloud Security",

                            visibility:
                                "Visibility"

                        };


                        toast(
                            titulos[setting] +
                            " disponible dentro de la simulación."
                        );

                    }
                );

            }
        );


    /* =========================================
       WARNING POLICY
    ========================================== */

    function actualizarAdvertencia() {

        const warning =
            $("policyWarning");


        if (!warning) {

            return;

        }


        const isolation =
            $("policyIsolation")
                .checked;


        const kill =
            $("policyKill")
                .checked;


        const quarantine =
            $("policyQuarantine")
                .checked;


        const mode =
            $("responseMode")
                .value;


        warning.classList.remove(
            "safe"
        );


        if (
            mode === "automatic" &&
            isolation &&
            kill &&
            quarantine
        ) {

            warning.textContent =
                "Full automatic protection enabled. The EDR will terminate the malicious process, quarantine the file and isolate the affected endpoint.";

            warning.classList.add(
                "safe"
            );

            return;

        }


        if (!isolation) {

            warning.textContent =
                "Automatic network isolation is disabled. During an attack, analyst intervention may be required.";

            return;

        }


        if (!kill) {

            warning.textContent =
                "Automatic process termination is disabled. Ransomware may continue encrypting files until the analyst responds.";

            return;

        }


        if (!quarantine) {

            warning.textContent =
                "Automatic quarantine is disabled. The malicious executable may remain accessible on the endpoint.";

            return;

        }


        warning.textContent =
            "Protection is enabled, but some analyst intervention may still be required.";

    }


    [
        "policyDetect",
        "policyKill",
        "policyQuarantine",
        "policyIsolation",
        "policyRollback"
    ]
        .forEach(
            function (id) {

                $(id)
                    ?.addEventListener(
                        "change",
                        actualizarAdvertencia
                    );

            }
        );


    $("responseMode")
        ?.addEventListener(
            "change",
            actualizarAdvertencia
        );


    /* =========================================
       SAVE
    ========================================== */

    $("savePolicy")
        ?.addEventListener(
            "click",
            function () {

                guardarPolitica();

                setTimeout(
                    cerrarPolicyDrawer,
                    450
                );

            }
        );


    /* =========================================
       RESET
    ========================================== */

    $("resetPolicy")
        ?.addEventListener(
            "click",
            function () {

                politica = {
                    ...politicaDefault
                };


                aplicarPoliticaFormulario();


                toast(
                    "Policy restaurada a valores predeterminados."
                );

            }
        );


    /* =========================================
       TOPBAR
    ========================================== */

    $("btnRegresar")
        ?.addEventListener(
            "click",
            function () {

                window.location.href =
                    "index.html";

            }
        );


    $("btnPausa")
        ?.addEventListener(
            "click",
            function () {

                pausado =
                    !pausado;


                if (pausado) {

                    musica?.pause();

                    toast(
                        "Simulación pausada."
                    );

                }

                else {

                    reproducirMusica();

                    toast(
                        "Simulación reanudada."
                    );

                }

            }
        );


    $("btnConfiguracion")
        ?.addEventListener(
            "click",
            function () {

                toast(
                    "Estás dentro de Policies and settings."
                );

            }
        );


    $("btnAyuda")
        ?.addEventListener(
            "click",
            function () {

                toast(
                    "Configura Policy para modificar la respuesta automática del EDR."
                );

            }
        );


    $("btnNotificaciones")
        ?.addEventListener(
            "click",
            function () {

                toast(
                    "1 incidente crítico pendiente."
                );

            }
        );


    /* =========================================
       KEYBOARD
    ========================================== */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                (
                    evento.ctrlKey ||
                    evento.metaKey
                ) &&
                evento.key
                    .toLowerCase() === "k"
            ) {

                evento.preventDefault();

                $("menuSearch")
                    ?.focus();

            }


            if (
                evento.key ===
                "Escape"
            ) {

                cerrarMenu();

                cerrarPolicyDrawer();

            }

        }
    );


    /* =========================================
       INICIAR
    ========================================== */

    aplicarPoliticaFormulario();

});