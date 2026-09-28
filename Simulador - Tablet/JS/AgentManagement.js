document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const $ = (id) => document.getElementById(id);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    let pausado = false;
    let silenciado = false;
    let volumenMusica = 0.25;
    let volumenEfectos = 0.5;
    let segundosSimulacion = 0;
    let temporizadorToast;
    let paginaActual = 1;
    let direccionOrden = 1;
    let endpointActivo = null;
    let filtroTagConstruido = null;

    const seleccionados = new Set();
    const musica = $("musicaFondo");
    const overlayPausa = $("overlayPausa");
    const overlayConfig = $("overlayConfig");
    const endpointDrawer = $("endpointDrawer");

    const endpoints = [
        crearEndpoint("ep-001", "Mike", "Windows", "Laptop", "26.1.1.163", "mblan", "nerium", "Complete", "WORKGROUP", "Online", "192.168.1.87", [], "SSD", false),
        crearEndpoint("ep-002", "Leslie-Nerium", "Windows", "Laptop", "25.2.3.407", "llope", "Test", "Complete", "WORKGROUP", "Online", "192.168.1.103", [], "SSD", false),
        crearEndpoint("ep-003", "America-Nerium", "Windows", "Laptop", "26.1.1.163", "areye", "Default Group", "Complete", "WORKGROUP", "Online", "192.168.1.121", ["finance"], "SSD", false),
        crearEndpoint("ep-004", "Karla-Nerium", "Windows", "Laptop", "26.1.1.163", "knegrette", "Default Group", "Complete", "WORKGROUP", "Online", "192.168.1.9", [], "SSD", false),
        crearEndpoint("ep-005", "AYCO", "Windows", "Desktop", "25.2.3.407", "adona", "Default Group", "Complete", "WORKGROUP", "Online", "192.168.1.108", [], "HDD", false),
        crearEndpoint("ep-006", "Carlos's MacBook Pro M5", "macOS", "Laptop", "22.3.3.6466", "carlosmarin", "Default Group", "Complete", "NERIUM.LOCAL", "Online", "192.168.1.127", ["pending"], "SSD", true),
        crearEndpoint("ep-007", "jhernandez", "Windows", "Laptop", "25.2.3.407", "jhern", "Default Group", "Complete", "WORKGROUP", "Online", "192.168.1.172", [], "SSD", false),
        crearEndpoint("ep-008", "CompuClaus", "Windows", "Desktop", "25.2.5.437", "claudi", "Default Group", "Complete", "WORKGROUP", "Online", "192.168.1.11", [], "HDD", false),
        crearEndpoint("ep-009", "Fernanda-Sanchez", "macOS", "Laptop", "25.4.2.8594", "fsanchez", "Default Group", "Complete", "NERIUM.LOCAL", "Online", "192.168.1.216", [], "SSD", false),
        crearEndpoint("ep-010", "FIN-014", "Windows", "Laptop", "26.1.1.163", "Carlos Hernández", "Default Group", "Complete", "WORKGROUP", "Isolated", "192.168.0.23", ["critical", "finance", "pending"], "SSD", true),
        crearEndpoint("ep-011", "NERIUM-SRV01", "Windows", "Server", "24.1.6.313", "svc_backup", "Servers", "Complete", "NERIUM.LOCAL", "Online", "192.168.0.5", ["critical"], "HDD", false),
        crearEndpoint("ep-012", "BrayanNerium", "Windows", "Laptop", "26.1.1.163", "bcastaneda", "nerium", "Complete", "WORKGROUP", "Online", "192.168.1.42", [], "SSD", false),
        crearEndpoint("ep-013", "Claudia-Nerium", "Windows", "Laptop", "25.2.5.437", "claudia", "Default Group", "Complete", "WORKGROUP", "Offline", "192.168.1.90", [], "SSD", false),
        crearEndpoint("ep-014", "BACKUP-REPO", "Windows", "Server", "26.1.1.163", "svc_bcdr", "Servers", "Complete", "NERIUM.LOCAL", "Online", "192.168.0.8", ["critical"], "HDD", false),
        crearEndpoint("ep-015", "MARKETING-02", "Windows", "Desktop", "25.2.3.407", "marketing", "Default Group", "Complete", "WORKGROUP", "Online", "192.168.1.64", [], "SSD", false)
    ];

    function crearEndpoint(id, name, os, type, version, user, group, product, domain, status, ip, tags, storage, pending) {
        return {
            id,
            name,
            os,
            type,
            version,
            user,
            group,
            product,
            domain,
            status,
            ip,
            tags,
            storage,
            pending
        };
    }

    /* Audio, reloj y mensajes */

    function reproducirMusica() {
        if (!musica || silenciado || pausado) return;
        musica.volume = volumenMusica;
        musica.play().catch(function () {});
    }

    if (musica) {
        musica.volume = volumenMusica;
        musica.play().catch(function () {});
    }

    document.addEventListener("pointerdown", reproducirMusica, { once: true });

    function sonidoBoton() {
        if (silenciado || volumenEfectos === 0) return;
        const sonido = new Audio("Audio/Boton.mp3");
        sonido.volume = volumenEfectos;
        sonido.play().catch(function () {});
    }

    document.addEventListener("click", function (evento) {
        if (evento.target.closest("button, .side-link, select, input")) sonidoBoton();
    });

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

    function formatearTiempo(total) {
        const horas = String(Math.floor(total / 3600)).padStart(2, "0");
        const minutos = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
        const segundos = String(total % 60).padStart(2, "0");
        return horas + ":" + minutos + ":" + segundos;
    }

    window.setInterval(function () {
        if (!pausado) segundosSimulacion += 1;
        if ($("relojSimulacion")) $("relojSimulacion").textContent = formatearTiempo(segundosSimulacion);
    }, 1000);

    /* Pausa y configuración */

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
        if (pausado) overlayPausa?.classList.add("activo");
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
        $("valorMusica").textContent = this.value + "%";
        if (musica && !silenciado) musica.volume = volumenMusica;
    });

    $("volumenEfectos")?.addEventListener("input", function () {
        volumenEfectos = Number(this.value) / 100;
        $("valorEfectos").textContent = this.value + "%";
    });

    $("silenciar")?.addEventListener("change", function () {
        silenciado = this.checked;
        if (silenciado) musica?.pause();
        else reproducirMusica();
    });

    /* Menú lateral */

    function cerrarMenu() {
        document.body.classList.remove("menu-abierto");
    }

    $("btnAbrirMenu")?.addEventListener("click", function () {
        document.body.classList.toggle("menu-abierto");
    });

    $("sidebarBackdrop")?.addEventListener("click", cerrarMenu);

    $$('.side-link:not(.active):not([data-ready="true"])').forEach(function (enlace) {
        enlace.addEventListener("click", function (evento) {
            evento.preventDefault();
            cerrarMenu();
            toast("Este módulo se conectará cuando construyamos su pantalla.");
        });
    });

    $("menuSearch")?.addEventListener("input", function () {
        const termino = this.value.trim().toLowerCase();
        $$(".side-link").forEach(function (enlace) {
            const texto = (enlace.dataset.menuText || enlace.textContent).toLowerCase();
            enlace.hidden = Boolean(termino) && !texto.includes(termino);
        });
    });

    document.addEventListener("keydown", function (evento) {
        if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
            evento.preventDefault();
            $("menuSearch")?.focus();
        }
        if (evento.key === "Escape") {
            cerrarDrawer();
            $("relatedMenu").hidden = true;
            $("agentActionsMenu").hidden = true;
            $("scopeActionsMenu").hidden = true;
        }
    });

    $("btnAyuda")?.addEventListener("click", function () {
        toast("Selecciona un endpoint para aislarlo, analizarlo o revisar su agente.");
    });

    $("btnNotificaciones")?.addEventListener("click", function () {
        const pendientes = endpoints.filter(function (endpoint) { return endpoint.pending; }).length;
        toast(pendientes + (pendientes === 1 ? " endpoint tiene acciones pendientes." : " endpoints tienen acciones pendientes."));
    });

    /* Encabezado y pestañas */

    $("btnRelatedPages")?.addEventListener("click", function () {
        $("relatedMenu").hidden = !$("relatedMenu").hidden;
    });

    $$('[data-agent-tab]').forEach(function (boton) {
        boton.addEventListener("click", function () {
            $$('[data-agent-tab]').forEach(function (tab) { tab.classList.remove("active"); });
            this.classList.add("active");
            if (this.dataset.agentTab === "Endpoints") {
                toast("Mostrando los endpoints administrados.");
            } else {
                toast(this.dataset.agentTab + " disponible dentro de la simulación.");
            }
        });
    });

    document.addEventListener("click", function (evento) {
        if (!evento.target.closest("#btnRelatedPages, #relatedMenu")) $("relatedMenu").hidden = true;
    });

    /* Filtros */

    function valoresSeleccionados(selector) {
        return $$(selector + ":checked").map(function (control) {
            return control.dataset.filterOs || control.dataset.filterVersion || control.dataset.filterType || control.dataset.filterGroup || control.value;
        });
    }

    function datosFiltrados() {
        const termino = $("endpointSearch").value.trim().toLowerCase();
        const campo = $("searchField").value;
        const tag = $("tagFilter").value;
        const os = $("osFilter").value;
        const version = $("versionFilter").value;
        const tipo = $("typeFilter").value;
        const storage = $("storageFilter").value;
        const osChecks = valoresSeleccionados("[data-filter-os]");
        const versionChecks = valoresSeleccionados("[data-filter-version]");
        const typeChecks = valoresSeleccionados("[data-filter-type]");
        const groupChecks = valoresSeleccionados("[data-filter-group]");

        return endpoints.filter(function (endpoint) {
            const valorBusqueda = campo === "user" ? endpoint.user : campo === "group" ? endpoint.group : endpoint.name;
            if (termino && !valorBusqueda.toLowerCase().includes(termino)) return false;
            if (tag !== "all" && !endpoint.tags.includes(tag)) return false;
            if (os !== "all" && endpoint.os !== os) return false;
            if (version !== "all" && endpoint.version !== version) return false;
            if (tipo !== "all" && endpoint.type !== tipo) return false;
            if (storage !== "all" && endpoint.storage !== storage) return false;
            if (osChecks.length && !osChecks.includes(endpoint.os)) return false;
            if (versionChecks.length && !versionChecks.includes(endpoint.version)) return false;
            if (typeChecks.length && !typeChecks.includes(endpoint.type)) return false;
            if (groupChecks.length && !groupChecks.includes(endpoint.group)) return false;
            if (filtroTagConstruido && !endpoint.tags.includes(filtroTagConstruido)) return false;
            return true;
        }).sort(function (a, b) {
            return a.name.localeCompare(b.name) * direccionOrden;
        });
    }

    ["endpointSearch", "searchField", "tagFilter", "osFilter", "versionFilter", "typeFilter", "storageFilter"].forEach(function (id) {
        const elemento = $(id);
        const evento = elemento?.tagName === "INPUT" ? "input" : "change";
        elemento?.addEventListener(evento, function () {
            paginaActual = 1;
            seleccionados.clear();
            renderizarTabla();
        });
    });

    $$('[data-filter-os], [data-filter-version], [data-filter-type], [data-filter-group]').forEach(function (control) {
        control.addEventListener("change", function () {
            paginaActual = 1;
            seleccionados.clear();
            renderizarTabla();
        });
    });

    $("btnCollapseAgentFilters")?.addEventListener("click", function () {
        $("agentFilters").classList.toggle("collapsed");
    });

    $("btnExtraFilters")?.addEventListener("click", function () {
        $("agentFilters").classList.toggle("collapsed");
        toast($("agentFilters").classList.contains("collapsed") ? "Filtros avanzados ocultos." : "Filtros avanzados visibles.");
    });

    $("btnLoadFilter")?.addEventListener("click", function () {
        $("tagFilter").value = "pending";
        paginaActual = 1;
        toast("Filtro guardado: acciones pendientes.");
        renderizarTabla();
    });

    $("btnSaveFilter")?.addEventListener("click", function () {
        toast("La configuración actual de filtros fue guardada.");
    });

    const opcionesTag = {
        critical: ["critical"],
        department: ["finance"],
        location: ["Tijuana"]
    };

    $("tagKey")?.addEventListener("change", function () {
        const valores = opcionesTag[this.value] || [];
        $("tagValue").innerHTML = valores.length ? valores.map(function (valor) { return '<option value="' + valor + '">' + valor + "</option>"; }).join("") : "<option>Select a value</option>";
        $("tagValue").disabled = valores.length === 0;
        $("btnAddTag").disabled = valores.length === 0;
    });

    $("btnAddTag")?.addEventListener("click", function () {
        filtroTagConstruido = $("tagValue").value;
        paginaActual = 1;
        toast("Filtro por etiqueta agregado: " + filtroTagConstruido + ".");
        renderizarTabla();
    });

    /* Tabla */

    function escapar(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function etiquetaVisible(tag) {
        if (tag === "critical") return "S1_Asset_criticality: high";
        if (tag === "finance") return "Department: finance";
        if (tag === "pending") return "Pending actions";
        return tag;
    }

    function iconoEndpoint(endpoint) {
        return endpoint.type === "Laptop" ? "#i-laptop" : "#i-device";
    }

    function renderizarTabla() {
        const cuerpo = $("endpointRows");
        const datos = datosFiltrados();
        const porPagina = Number($("endpointsPerPage").value);
        const totalPaginas = Math.max(1, Math.ceil(datos.length / porPagina));
        paginaActual = Math.min(paginaActual, totalPaginas);
        const inicio = (paginaActual - 1) * porPagina;
        const visibles = datos.slice(inicio, inicio + porPagina);

        cuerpo.innerHTML = visibles.map(function (endpoint) {
            const seleccionado = seleccionados.has(endpoint.id);
            const etiquetas = endpoint.tags.filter(function (tag) { return tag !== "pending"; }).map(function (tag) {
                return '<span class="endpoint-tag ' + (tag === "finance" ? "finance" : "") + '">' + escapar(etiquetaVisible(tag)) + "</span>";
            }).join(" ") || "—";
            const estadoClase = endpoint.status === "Offline" ? "offline" : endpoint.status === "Isolated" ? "isolated" : "";

            return '<tr data-endpoint-id="' + endpoint.id + '" class="' + (seleccionado ? "selected" : "") + '">' +
                '<td><input class="endpoint-checkbox" type="checkbox" aria-label="Seleccionar ' + escapar(endpoint.name) + '" ' + (seleccionado ? "checked" : "") + "></td>" +
                '<td><button class="endpoint-name ' + (endpoint.pending ? "pending" : "") + '" type="button"><svg><use href="' + iconoEndpoint(endpoint) + '"></use></svg><span>' + escapar(endpoint.name) + (endpoint.pending ? "<small>Pending actions</small>" : "") + "</span></button></td>" +
                "<td>" + etiquetas + "</td>" +
                "<td>Pax8, Partners</td>" +
                "<td>nerium - c6f35b</td>" +
                "<td>" + escapar(endpoint.user) + "</td>" +
                "<td>" + escapar(endpoint.group) + "</td>" +
                "<td>" + escapar(endpoint.product) + "</td>" +
                "<td>" + escapar(endpoint.domain) + "</td>" +
                '<td><span class="endpoint-status ' + estadoClase + '"><i></i>' + escapar(endpoint.status) + "</span></td>" +
                '<td><span class="endpoint-ip">' + escapar(endpoint.ip) + "</span></td>" +
                "</tr>";
        }).join("");

        $("agentEmpty").hidden = datos.length !== 0;
        cuerpo.closest("table").hidden = datos.length === 0;
        $("endpointCount").textContent = datos.length + (datos.length === 1 ? " Item" : " Items");
        renderizarPaginacion(totalPaginas);
        actualizarSeleccion(datos);
    }

    function renderizarPaginacion(totalPaginas) {
        const contenedor = $("endpointPageButtons");
        contenedor.innerHTML = "";
        for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.textContent = pagina;
            boton.classList.toggle("active", pagina === paginaActual);
            boton.addEventListener("click", function () {
                paginaActual = pagina;
                renderizarTabla();
            });
            contenedor.appendChild(boton);
        }
        $("previousEndpointPage").disabled = paginaActual === 1;
        $("nextEndpointPage").disabled = paginaActual === totalPaginas;
    }

    function actualizarSeleccion(datos) {
        const ids = datos.map(function (endpoint) { return endpoint.id; });
        const cantidad = ids.filter(function (id) { return seleccionados.has(id); }).length;
        $("selectAllEndpoints").checked = ids.length > 0 && cantidad === ids.length;
        $("selectAllEndpoints").indeterminate = cantidad > 0 && cantidad < ids.length;
        $("btnAgentActions").disabled = seleccionados.size === 0;
    }

    function buscarEndpoint(id) {
        return endpoints.find(function (endpoint) { return endpoint.id === id; });
    }

    $("endpointRows")?.addEventListener("click", function (evento) {
        const fila = evento.target.closest("tr[data-endpoint-id]");
        if (!fila) return;
        const endpoint = buscarEndpoint(fila.dataset.endpointId);
        if (!endpoint) return;

        if (evento.target.closest(".endpoint-checkbox")) {
            if (evento.target.checked) seleccionados.add(endpoint.id);
            else seleccionados.delete(endpoint.id);
            renderizarTabla();
            return;
        }

        abrirDrawer(endpoint);
    });

    $("selectAllEndpoints")?.addEventListener("change", function () {
        const datos = datosFiltrados();
        if (this.checked) datos.forEach(function (endpoint) { seleccionados.add(endpoint.id); });
        else datos.forEach(function (endpoint) { seleccionados.delete(endpoint.id); });
        renderizarTabla();
    });

    $("endpointsPerPage")?.addEventListener("change", function () {
        paginaActual = 1;
        renderizarTabla();
    });

    $("previousEndpointPage")?.addEventListener("click", function () {
        if (paginaActual > 1) paginaActual -= 1;
        renderizarTabla();
    });

    $("nextEndpointPage")?.addEventListener("click", function () {
        const total = Math.ceil(datosFiltrados().length / Number($("endpointsPerPage").value));
        if (paginaActual < total) paginaActual += 1;
        renderizarTabla();
    });

    $$('[data-sort="name"]').forEach(function (boton) {
        boton.addEventListener("click", function () {
            direccionOrden *= -1;
            renderizarTabla();
        });
    });

    /* Acciones */

    $("btnAgentActions")?.addEventListener("click", function () {
        if (this.disabled) return;
        $("agentActionsMenu").hidden = !$("agentActionsMenu").hidden;
        $("scopeActionsMenu").hidden = true;
    });

    $("btnScopeActions")?.addEventListener("click", function () {
        $("scopeActionsMenu").hidden = !$("scopeActionsMenu").hidden;
        $("agentActionsMenu").hidden = true;
    });

    $$('[data-agent-action]').forEach(function (boton) {
        boton.addEventListener("click", function () {
            aplicarAccion(this.dataset.agentAction);
        });
    });

    function aplicarAccion(accion) {
        const afectados = endpoints.filter(function (endpoint) { return seleccionados.has(endpoint.id); });
        if (!afectados.length) return;

        afectados.forEach(function (endpoint) {
            if (accion === "isolate") endpoint.status = "Isolated";
            if (accion === "connect") endpoint.status = "Online";
            if (accion === "scan") endpoint.pending = true;
            if (accion === "restart") endpoint.pending = true;
        });

        const mensajes = {
            isolate: "Endpoints aislados. La propagación fue bloqueada.",
            connect: "Endpoints reconectados a la red.",
            scan: "Análisis completo enviado a los agentes.",
            restart: "Reinicio de agentes programado."
        };
        toast(mensajes[accion]);
        seleccionados.clear();
        $("agentActionsMenu").hidden = true;
        renderizarTabla();
    }

    $$('[data-scope-action]').forEach(function (boton) {
        boton.addEventListener("click", function () {
            const accion = this.dataset.scopeAction;
            if (accion === "scan") {
                datosFiltrados().forEach(function (endpoint) { endpoint.pending = true; });
                toast("Análisis enviado a todos los endpoints visibles.");
            } else if (accion === "update") {
                toast("Política de agentes actualizada correctamente.");
            } else {
                toast("Conectividad de todos los agentes actualizada.");
            }
            $("scopeActionsMenu").hidden = true;
            renderizarTabla();
        });
    });

    document.addEventListener("click", function (evento) {
        if (!evento.target.closest("#btnAgentActions, #agentActionsMenu")) $("agentActionsMenu").hidden = true;
        if (!evento.target.closest("#btnScopeActions, #scopeActionsMenu")) $("scopeActionsMenu").hidden = true;
    });

    /* Detalle */

    function abrirDrawer(endpoint) {
        endpointActivo = endpoint;
        $("endpointDetailName").textContent = endpoint.name;
        $("endpointDetailStatus").textContent = endpoint.status;
        $("endpointDetailProtection").textContent = endpoint.status === "Online" ? "Agent protected" : endpoint.status === "Isolated" ? "Network access blocked" : "Agent disconnected";
        $("endpointDetailOs").textContent = endpoint.os + " · " + endpoint.type;
        $("endpointDetailVersion").textContent = endpoint.version;
        $("endpointDetailUser").textContent = endpoint.user;
        $("endpointDetailGroup").textContent = endpoint.group;
        $("endpointDetailIp").textContent = endpoint.ip;
        $("endpointDetailPending").textContent = endpoint.pending ? "Action queued" : "None";
        const salud = document.querySelector(".endpoint-health");
        salud.classList.toggle("isolated", endpoint.status === "Isolated");
        salud.classList.toggle("offline", endpoint.status === "Offline");
        $("btnIsolateEndpoint").innerHTML = '<svg><use href="#i-shield"></use></svg> ' + (endpoint.status === "Isolated" ? "Reconnect endpoint" : "Isolate endpoint");
        endpointDrawer.classList.add("open");
        endpointDrawer.setAttribute("aria-hidden", "false");
    }

    function cerrarDrawer() {
        endpointDrawer?.classList.remove("open");
        endpointDrawer?.setAttribute("aria-hidden", "true");
    }

    $("closeEndpointDrawer")?.addEventListener("click", cerrarDrawer);
    $("closeEndpointBackdrop")?.addEventListener("click", cerrarDrawer);

    $("btnScanEndpoint")?.addEventListener("click", function () {
        if (!endpointActivo) return;
        endpointActivo.pending = true;
        toast("Análisis completo enviado a " + endpointActivo.name + ".");
        abrirDrawer(endpointActivo);
        renderizarTabla();
    });

    $("btnIsolateEndpoint")?.addEventListener("click", function () {
        if (!endpointActivo) return;
        endpointActivo.status = endpointActivo.status === "Isolated" ? "Online" : "Isolated";
        toast(endpointActivo.status === "Isolated" ? "Endpoint aislado correctamente." : "Endpoint reconectado correctamente.");
        abrirDrawer(endpointActivo);
        renderizarTabla();
    });

    /* Exportación */

    $("btnDownloadCsv")?.addEventListener("click", function () {
        const filas = datosFiltrados();
        const encabezado = ["Endpoint Name", "OS", "Type", "Agent Version", "User", "Group", "Status", "IP Address"];
        const contenido = [encabezado].concat(filas.map(function (endpoint) {
            return [endpoint.name, endpoint.os, endpoint.type, endpoint.version, endpoint.user, endpoint.group, endpoint.status, endpoint.ip];
        })).map(function (fila) {
            return fila.map(function (valor) { return '"' + String(valor).replace(/"/g, '""') + '"'; }).join(",");
        }).join("\n");
        const archivo = new Blob([contenido], { type: "text/csv;charset=utf-8" });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(archivo);
        enlace.download = "nerium-endpoints.csv";
        enlace.click();
        URL.revokeObjectURL(enlace.href);
        toast("Reporte CSV de endpoints descargado.");
    });

    renderizarTabla();
});