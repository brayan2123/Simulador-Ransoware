document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       CONFIGURACIÓN DE AUDIO
    ========================================== */

    let volumenEfectos = 0.5;
    let volumenMusica = 0.25;
    let silenciado = false;


    /* =========================================
       MÚSICA DE FONDO
    ========================================== */

    const musicaFondo =
        document.getElementById("musicaFondo");

    if (musicaFondo) {

        musicaFondo.volume = volumenMusica;

        musicaFondo.play().catch(function () {
            console.log("Esperando interacción del usuario...");
        });


        // Activar música después del primer clic
        document.addEventListener(
            "click",
            function iniciarMusica() {

                if (!silenciado) {
                    musicaFondo.play().catch(function () {});
                }

                document.removeEventListener(
                    "click",
                    iniciarMusica
                );

            }
        );

    }


    /* =========================================
       SONIDO DE LOS BOTONES
    ========================================== */

    const botones =
        document.querySelectorAll(".menu-btn");


    botones.forEach(function (boton) {

        boton.addEventListener(
            "click",
            function () {

                if (silenciado) {
                    return;
                }

                const sonido =
                    new Audio("Audio/Boton.mp3");

                sonido.volume =
                    volumenEfectos;

                sonido.play().catch(function (error) {

                    console.log(
                        "No se pudo reproducir el sonido:",
                        error
                    );

                });

            }
        );

    });


    /* =========================================
       BOTÓN INICIAR
    ========================================== */

    const btnIniciar =
        document.getElementById("btnIniciar");


    if (btnIniciar) {

        btnIniciar.addEventListener(
            "click",
            function () {

                window.location.href =
                    "Simulador.Html";

            }
        );

    }


    /* =========================================
       AJUSTES
    ========================================== */

    const btnAjustes =
        document.getElementById("btnAjustes");

    const panelAjustes =
        document.getElementById("panelAjustes");

    const cerrarAjustes =
        document.getElementById("cerrarAjustes");

    const volumenEfectosControl =
        document.getElementById("volumenEfectos");

    const volumenMusicaControl =
        document.getElementById("volumenMusica");

    const silenciar =
        document.getElementById("silenciar");


    /* =========================================
       ABRIR AJUSTES
    ========================================== */

    if (btnAjustes && panelAjustes) {

        btnAjustes.addEventListener(
            "click",
            function () {

                panelAjustes.style.display = "block";

            }
        );

    }


    /* =========================================
       CERRAR AJUSTES
    ========================================== */

    if (cerrarAjustes && panelAjustes) {

        cerrarAjustes.addEventListener(
            "click",
            function () {

                panelAjustes.style.display = "none";

            }
        );

    }


    /* =========================================
       VOLUMEN DE EFECTOS
    ========================================== */

    if (volumenEfectosControl) {

        volumenEfectosControl.addEventListener(
            "input",
            function () {

                volumenEfectos =
                    this.value / 100;

            }
        );

    }


    /* =========================================
       VOLUMEN DE MÚSICA
    ========================================== */

    if (volumenMusicaControl) {

        volumenMusicaControl.addEventListener(
            "input",
            function () {

                volumenMusica =
                    this.value / 100;

                if (musicaFondo) {

                    musicaFondo.volume =
                        volumenMusica;

                }

            }
        );

    }


    /* =========================================
       SILENCIAR TODO
    ========================================== */

    if (silenciar) {

        silenciar.addEventListener(
            "change",
            function () {

                silenciado =
                    this.checked;

                if (silenciado) {

                    if (musicaFondo) {
                        musicaFondo.volume = 0;
                    }

                } else {

                    if (musicaFondo) {
                        musicaFondo.volume =
                            volumenMusica;
                    }

                }

            }
        );

    }


    /* =========================================
       CRÉDITOS
    ========================================== */

    const btnCreditos =
        document.getElementById("btnCreditos");

    const panelCreditos =
        document.getElementById("panelCreditos");

    const cerrarCreditos =
        document.getElementById("cerrarCreditos");


    /* =========================================
       ABRIR CRÉDITOS
    ========================================== */

    if (btnCreditos && panelCreditos) {

        btnCreditos.addEventListener(
            "click",
            function () {

                panelCreditos.style.display =
                    "block";

            }
        );

    }


    /* =========================================
       CERRAR CRÉDITOS
    ========================================== */

    if (cerrarCreditos && panelCreditos) {

        cerrarCreditos.addEventListener(
            "click",
            function () {

                panelCreditos.style.display =
                    "none";

            }
        );

    }

});
