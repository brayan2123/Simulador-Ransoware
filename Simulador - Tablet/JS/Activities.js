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

    const ordenColumnas = {};

    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const drawer = $("activityDrawer");
    const filas = $$("#activityRows tr");

    const edades = [0.1, 0.3, 0.6, 2.5, 5.5, 6.7, 7, 8, 8.3];

    filas.forEach(function (fila, indice) {
        fila.dataset.age = String(edades[indice] ?? 12);
        fila.dataset.originalIndex = String(indice);
    });

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
                "button, .side-link, select, input"
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
       RELOJ DE SIMULACIÓN
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

    /* ========================================
       MENÚ LATERAL
    ======================================== */

    function cerrarMenu() {
        document.body.classList.remove("menu-abierto");
    }

    $("btnAbrirMenu")?.addEventListener("click", function () {
        document.body.classList.toggle("menu-abierto");
    });

    $("sidebarBackdrop")?.addEventListener("click", cerrarMenu);

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
            "Filtra los registros y selecciona una actividad para ver sus detalles."
        );
    });

    $("btnNotificaciones")?.addEventListener("click", function () {
        toast(
            "FIN-014 fue aislado y el incidente cambió a Investigating."
        );
    });

    /* ========================================
       FILTROS
    ======================================== */

    function coincide(valorFiltro, valorFila) {
        return valorFiltro === "all" ||
            valorFiltro === valorFila;
    }

    function aplicarFiltros() {
        const categoria =
            $("activityCategory")?.value || "all";

        const tipo =
            $("activityType")?.value || "all";

        const usuario =
            $("activityUser")?.value || "all";

        const endpoint =
            $("activityEndpoint")?.value || "all";

        const rango = Number(
            $("activityDate")?.value || 12
        );

        let visibles = 0;

        filas.forEach(function (fila) {
            const coincideCategoria = coincide(
                categoria,
                fila.dataset.category
            );

            const coincideTipo = coincide(
                tipo,
                fila.dataset.type
            );

            const coincideUsuario = coincide(
                usuario,
                fila.dataset.user
            );

            const coincideEndpoint =
                endpoint === "all" ||
                fila.dataset.endpoint === endpoint;

            const coincideFecha =
                Number(fila.dataset.age) <= rango;

            const visible =
                coincideCategoria &&
                coincideTipo &&
                coincideUsuario &&
                coincideEndpoint &&
                coincideFecha;

            fila.hidden = !visible;

            if (visible) {
                visibles += 1;
            }
        });

        if ($("activityCount")) {
            $("activityCount").textContent =
                visibles +
                (visibles === 1
                    ? " registro"
                    : " registros");
        }

        if ($("activityEmpty")) {
            $("activityEmpty").hidden = visibles !== 0;
        }
    }

    [
        "activityCategory",
        "activityType",
        "activityUser",
        "activityEndpoint",
        "activityDate"
    ].forEach(function (id) {
        $(id)?.addEventListener("change", aplicarFiltros);
    });

    /* ========================================
       DETALLES DE ACTIVIDAD
    ======================================== */

    function abrirDetalle(fila) {
        if (!fila) return;

        filaActiva = fila;

        filas.forEach(function (item) {
            item.classList.toggle(
                "selected",
                item === fila
            );
        });

        if ($("activityDetailTitle")) {
            $("activityDetailTitle").textContent =
                fila.dataset.title;
        }

        if ($("activityDetailDescription")) {
            $("activityDetailDescription").textContent =
                fila.dataset.description;
        }

        if ($("activityDetailAction")) {
            $("activityDetailAction").textContent =
                fila.dataset.action;
        }

        if ($("activityDetailUser")) {
            $("activityDetailUser").textContent =
                fila.dataset.username;
        }

        if ($("activityDetailEndpoint")) {
            $("activityDetailEndpoint").textContent =
                fila.dataset.endpointName;
        }

        if ($("activityDetailTime")) {
            $("activityDetailTime").textContent =
                fila.children[0]?.textContent.trim() || "—";
        }

        if ($("activityDetailResult")) {
            $("activityDetailResult").textContent =
                fila.dataset.action === "Scanning"
                    ? "In progress"
                    : "Completed";
        }

        if ($("btnOpenActivityTarget")) {
            $("btnOpenActivityTarget").textContent =
                fila.dataset.endpoint === "fin-014"
                    ? "Abrir FIN-014"
                    : "Abrir Inventory";
        }

        drawer?.classList.add("open");
        drawer?.setAttribute("aria-hidden", "false");
    }

    function cerrarDetalle() {
        drawer?.classList.remove("open");
        drawer?.setAttribute("aria-hidden", "true");

        filas.forEach(function (fila) {
            fila.classList.remove("selected");
        });

        filaActiva = null;
    }

    filas.forEach(function (fila) {
        fila.addEventListener("click", function () {
            abrirDetalle(this);
        });
    });

    $("closeActivityDrawer")?.addEventListener(
        "click",
        cerrarDetalle
    );

    $("closeActivityBackdrop")?.addEventListener(
        "click",
        cerrarDetalle
    );

    $("btnOpenActivityTarget")?.addEventListener(
        "click",
        function () {
            if (!filaActiva) return;

            window.location.href =
                filaActiva.dataset.type === "incident"
                    ? "Alerts.html"
                    : "inventory.html";
        }
    );

    $("btnCopyActivity")?.addEventListener(
        "click",
        function () {
            if (!filaActiva) return;

            const texto = [
                filaActiva.dataset.title,
                filaActiva.dataset.description,
                "Usuario: " + filaActiva.dataset.username,
                "Endpoint: " + filaActiva.dataset.endpointName,
                "Acción: " + filaActiva.dataset.action
            ].join("\n");

            if (navigator.clipboard?.writeText) {
                navigator.clipboard
                    .writeText(texto)
                    .then(function () {
                        toast("Detalles copiados.");
                    })
                    .catch(function () {
                        toast(
                            "Los detalles están listos para copiar."
                        );
                    });
            } else {
                toast(
                    "Los detalles están listos para copiar."
                );
            }
        }
    );

    /* ========================================
       ORDENAMIENTO
    ======================================== */

    function valorOrden(fila, columna) {
        if (columna === "time") {
            return Number(fila.dataset.age);
        }

        if (columna === "type") {
            return fila.dataset.type;
        }

        if (columna === "user") {
            return fila.dataset.username;
        }

        if (columna === "endpoint") {
            return fila.dataset.endpointName;
        }

        return Number(fila.dataset.originalIndex);
    }

    $$("[data-sort]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            const columna = this.dataset.sort;

            ordenColumnas[columna] =
                !ordenColumnas[columna];

            const ascendente =
                ordenColumnas[columna];

            const cuerpo = $("activityRows");

            if (!cuerpo) return;

            const ordenadas = [...filas].sort(
                function (a, b) {
                    const valorA =
                        valorOrden(a, columna);

                    const valorB =
                        valorOrden(b, columna);

                    if (
                        typeof valorA === "number" &&
                        typeof valorB === "number"
                    ) {
                        return ascendente
                            ? valorA - valorB
                            : valorB - valorA;
                    }

                    return ascendente
                        ? String(valorA).localeCompare(
                              String(valorB)
                          )
                        : String(valorB).localeCompare(
                              String(valorA)
                          );
                }
            );

            ordenadas.forEach(function (fila) {
                cuerpo.appendChild(fila);
            });

            toast(
                "Registros ordenados por " +
                columna +
                "."
            );
        });
    });

    /* ========================================
       ACTUALIZAR ACTIVIDADES
    ======================================== */

    $("btnRefreshActivities")?.addEventListener(
        "click",
        function () {
            const boton = this;

            boton.classList.add("loading");
            boton.disabled = true;

            window.setTimeout(function () {
                boton.classList.remove("loading");
                boton.disabled = false;

                aplicarFiltros();

                toast(
                    "Registro de actividades actualizado."
                );
            }, 700);
        }
    );

    /* ========================================
       DESCARGAR CSV
    ======================================== */

    $("btnDownloadActivities")?.addEventListener(
        "click",
        function () {
            const visibles = filas.filter(function (fila) {
                return !fila.hidden;
            });

            const contenido = [
                "Time,Activity Type,Description,Action,Username,Endpoint"
            ];

            visibles.forEach(function (fila) {
                const valores = [
                    fila.children[0]?.textContent.trim(),
                    fila.children[1]?.textContent.trim(),
                    fila.dataset.description,
                    fila.dataset.action,
                    fila.dataset.username,
                    fila.dataset.endpointName
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

                contenido.push(valores.join(","));
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
                "nerium-activity-logs.csv";

            document.body.appendChild(enlace);
            enlace.click();
            enlace.remove();

            URL.revokeObjectURL(enlace.href);

            toast("Registro CSV descargado.");
        }
    );

    /* ========================================
       TECLA ESCAPE
    ======================================== */

    document.addEventListener("keydown", function (evento) {
        if (evento.key !== "Escape") return;

        cerrarDetalle();
        cerrarMenu();
        overlayConfig?.classList.remove("activo");

        if (
            overlayPausa?.classList.contains("activo")
        ) {
            cerrarPausa();
        }
    });

    aplicarFiltros();
});