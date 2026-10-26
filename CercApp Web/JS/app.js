"use strict";

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // Menú hamburguesa para pantallas pequeñas
    const menuToggle = $("#menuToggle");
    const mobileNav = $("#mobileNav");
    menuToggle.addEventListener("click", () => {
      const willOpen = mobileNav.classList.contains("hidden");
      mobileNav.classList.toggle("hidden", !willOpen);
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Cerrar menú" : "Abrir menú");
      $("#menuIcon").innerHTML = willOpen
        ? '<path d="m6 6 12 12M18 6 6 18"/>'
        : '<path d="M4 6h16M4 12h16M4 18h16"/>';
    });
    $$("#mobileNav a").forEach(link => link.addEventListener("click", () => {
      mobileNav.classList.add("hidden");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      $("#menuIcon").innerHTML = '<path d="M4 6h16M4 12h16M4 18h16"/>';
    }));

    // Alternar tema claro/oscuro y recordar la preferencia en este navegador
    const themeToggle = $("#themeToggle");
    function setTheme(isDark) {
      document.documentElement.classList.toggle("dark", isDark);
      themeToggle.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
      $("#themeIcon").innerHTML = isDark
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>'
        : '<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/>';
      try { localStorage.setItem("cercapp-theme", isDark ? "dark" : "light"); } catch (_) {}
    }
    let savedTheme = null;
    try { savedTheme = localStorage.getItem("cercapp-theme"); } catch (_) {}
    setTheme(savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    themeToggle.addEventListener("click", () => setTheme(!document.documentElement.classList.contains("dark")));

    // Toast accesible reutilizable
    let toastTimer;
    function showToast(title, message) {
      $("#toastTitle").textContent = title;
      $("#toastMessage").textContent = message;
      const toast = $("#toast");
      toast.classList.remove("hidden");
      toast.classList.add("toast-enter");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.add("hidden"), 5000);
    }
    $("#closeToast").addEventListener("click", () => $("#toast").classList.add("hidden"));

    // Filtros combinados por texto, especialidad y barrio
    const specialtyFilter = $("#specialtyFilter");
    const neighborhoodFilter = $("#neighborhoodFilter");
    const quickSearch = $("#quickSearch");
    let selectedService = "";
    let selectedArea = "";

    function applyFilters() {
      const text = quickSearch.value.trim().toLocaleLowerCase("es");
      const specialty = specialtyFilter.value || selectedService;
      const neighborhood = neighborhoodFilter.value || selectedArea;
      let visible = 0;
      $$(".professional-card").forEach(card => {
        const matchesText = !text || (card.dataset.specialty + " " + card.querySelector("h3").textContent).toLocaleLowerCase("es").includes(text);
        const matchesSpecialty = !specialty || card.dataset.specialty === specialty;
        const matchesArea = !neighborhood || card.dataset.neighborhood === neighborhood;
        const show = matchesText && matchesSpecialty && matchesArea;
        card.classList.toggle("hidden", !show);
        if (show) visible++;
      });
      $("#emptyResults").classList.toggle("hidden", visible !== 0);
      $("#areaCount").textContent = `${visible} ${visible === 1 ? "profesional" : "profesionales"}`;
      $("#areaSpecialties").textContent = visible === 1 ? "1 disponible" : `${visible} disponibles`;
      const currentArea = neighborhood || "Toda Neiva";
      $("#activeAreaName").textContent = currentArea;
      $("#activeAreaDescription").textContent = neighborhood
        ? `Mostrando perfiles de ejemplo en ${neighborhood}.`
        : "Explora perfiles de muestra en distintos sectores de la ciudad.";
      $("#areaTitle").textContent = currentArea;
      $("#areaCopy").textContent = neighborhood
        ? `Consulta los perfiles de ejemplo ubicados en ${neighborhood} y compara su especialidad, calificación y tarifa base.`
        : "Consulta opciones en distintos barrios de la ciudad y elige el profesional que mejor se adapte a tu necesidad.";
      $$(".area-btn").forEach(button => {
        const active = button.dataset.area === neighborhood;
        button.classList.toggle("border-sky-200", active);
        button.classList.toggle("bg-sky-50", active);
        button.classList.toggle("text-cerc-blue-dark", active);
        button.classList.toggle("font-bold", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    $$(".service-card").forEach(button => button.addEventListener("click", () => {
      selectedService = selectedService === button.dataset.service ? "" : button.dataset.service;
      specialtyFilter.value = selectedService;
      $$(".service-card").forEach(item => item.setAttribute("aria-pressed", String(item.dataset.service === selectedService)));
      $("#explorar").scrollIntoView({ behavior: "smooth" });
      applyFilters();
    }));
    specialtyFilter.addEventListener("change", () => { selectedService = specialtyFilter.value; applyFilters(); });
    neighborhoodFilter.addEventListener("change", () => { selectedArea = neighborhoodFilter.value; applyFilters(); });
    quickSearch.addEventListener("input", applyFilters);
    $("#searchForm").addEventListener("submit", event => {
      event.preventDefault();
      applyFilters();
      $("#explorar").scrollIntoView({ behavior: "smooth" });
      if (!quickSearch.value.trim()) showToast("¿Qué estás buscando?", "Escribe una especialidad o selecciona un servicio popular.");
    });
    $$(".area-btn").forEach(button => button.addEventListener("click", () => {
      selectedArea = button.dataset.area;
      neighborhoodFilter.value = selectedArea;
      applyFilters();
    }));
    $("#clearFilters").addEventListener("click", () => {
      selectedService = ""; selectedArea = "";
      specialtyFilter.value = ""; neighborhoodFilter.value = ""; quickSearch.value = "";
      $$(".service-card").forEach(item => item.setAttribute("aria-pressed", "false"));
      applyFilters();
    });
    $("#showAreaPros").addEventListener("click", () => $("#explorar").scrollIntoView({ behavior: "smooth" }));

    // Modal de perfil con cierre por botón, fondo y tecla Escape
    const modal = $("#profileModal");
    let lastFocusedElement = null;
    let modalService = "";
    function openProfile(button) {
    lastFocusedElement = document.activeElement;
    $("#modalName").textContent = button.dataset.name;
    $("#modalJob").textContent = button.dataset.job;
    $("#modalRating").textContent = `★ ${button.dataset.rating} / 5`;
    $("#modalPrice").textContent = button.dataset.price;
    $("#modalArea").textContent = `${button.dataset.area} · ${button.dataset.distance}`;
    $("#modalBio").textContent = button.dataset.bio;
    modalService = button.closest(".professional-card").dataset.specialty;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    $("#closeModal").focus();
    }
    function closeProfile() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
    if (lastFocusedElement) lastFocusedElement.focus();
    }
    $$(".profile-btn").forEach(button => button.addEventListener("click", () => openProfile(button)));
    $("#closeModal").addEventListener("click", closeProfile);
    modal.addEventListener("click", event => { if (event.target === modal) closeProfile(); });
    document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) closeProfile();
      // Ciclo de foco básico dentro del modal para navegación con teclado
    if (event.key === "Tab" && !modal.classList.contains("hidden")) {
        const focusables = $$('button:not([disabled]), a[href], input, select, textarea', modal).filter(el => el.offsetParent !== null);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    });
    $("#modalRequest").addEventListener("click", () => {
    closeProfile();
    $("#serviceType").value = modalService;
    $("#solicitud").scrollIntoView({ behavior: "smooth" });
    $("#serviceType").focus({ preventScroll: true });
    });
    $$(".request-btn").forEach(button => button.addEventListener("click", () => {
    $("#serviceType").value = button.dataset.service;
    $("#solicitud").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#serviceType").focus({ preventScroll: true }), 450);
    }));

    // Validación personalizada del formulario de solicitud
    const form = $("#requestForm");
    const fieldRules = {
    serviceType: () => $("#serviceType").value ? "" : "Selecciona el tipo de labor.",
    requestNeighborhood: () => $("#requestNeighborhood").value ? "" : "Selecciona el barrio.",
    description: () => {
        const value = $("#description").value.trim();
        if (value.length < 10) return "Describe el problema con al menos 10 caracteres.";
        if (value.length > 600) return "La descripción no puede superar 600 caracteres.";
        return "";
    },
    requestDate: () => {
        const value = $("#requestDate").value;
        if (!value) return "Selecciona una fecha.";
        const chosen = new Date(`${value}T00:00:00`);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return chosen < today ? "La fecha no puede estar en el pasado." : "";
    },
    requestTime: () => $("#requestTime").value ? "" : "Selecciona una hora.",
    address: () => {
        const value = $("#address").value.trim();
        if (value.length < 8) return "Escribe una dirección más completa (mínimo 8 caracteres).";
        if (!/[0-9]/.test(value)) return "Incluye el número de la dirección.";
        return "";
    },
    customerName: () => /^[\p{L}\s'-]{2,80}$/u.test($("#customerName").value.trim()) ? "" : "Escribe un nombre válido de al menos 2 letras.",
    customerPhone: () => /^3\d{9}$/.test($("#customerPhone").value.trim()) ? "" : "Ingresa un celular colombiano de 10 dígitos que empiece por 3."
    };
    function validateField(id) {
    const field = document.getElementById(id);
    const error = document.getElementById(`${id}Error`);
    const message = fieldRules[id]();
    error.textContent = message;
    error.classList.toggle("hidden", !message);
    field.setAttribute("aria-invalid", String(Boolean(message)));
    field.classList.toggle("border-cerc-red", Boolean(message));
    field.classList.toggle("border-slate-300", !message);
    field.classList.toggle("dark:border-slate-700", !message);
    return !message;
    }
    Object.keys(fieldRules).forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener("blur", () => validateField(id));
    field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") validateField(id); });
    field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateField(id); });
    });
    $("#description").addEventListener("input", () => $("#charCount").textContent = `${$("#description").value.length}/600`);
    $("#customerPhone").addEventListener("input", event => { event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10); });
    // Evitar que se seleccione una fecha anterior a hoy
    function setMinimumDate() {
    const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $("#requestDate").min = localDate;
    }
    setMinimumDate();

    let requestCount = 0;
    form.addEventListener("submit", event => {
    event.preventDefault();
    const valid = Object.keys(fieldRules).map(validateField).every(Boolean);
    if (!valid) {
        const firstInvalid = $("#requestForm [aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        $("#formSummary").classList.add("hidden");
        showToast("Revisa el formulario", "Hay campos por corregir antes de continuar.");
        return;
    }
    requestCount++;
    $("#requestCount").textContent = String(requestCount);
    const date = new Date(`${$("#requestDate").value}T00:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    const summary = $("#formSummary");
    summary.innerHTML = "";
    const title = document.createElement("p");
    title.className = "font-extrabold";
    title.textContent = "¡Solicitud de prueba registrada en esta pantalla!";
    const detail = document.createElement("p");
    detail.className = "mt-1 leading-6";
    detail.textContent = `${$("#serviceType").value} · ${$("#requestNeighborhood").value} · ${date} a las ${$("#requestTime").value}. Dirección: ${$("#address").value.trim()}.`;
    summary.append(title, detail);
    summary.classList.remove("hidden");
    showToast("¡Solicitud lista!", "Los datos pasaron la validación. Este prototipo no envía la solicitud a un servidor.");
    form.reset();
    });
    $("#charCount").textContent = "0/600";
    Object.keys(fieldRules).forEach(id => {
        const field = document.getElementById(id);
        field.setAttribute("aria-invalid", "false");
        field.classList.remove("border-cerc-red");
        const error = document.getElementById(`${id}Error`);
        error.textContent = ""; error.classList.add("hidden");
    });
    setMinimumDate();

    // Sistema de calificación con estrellas seleccionables
    let selectedRating = 0;
    const ratingLabels = ["", "Muy mala", "Mala", "Aceptable", "Buena", "¡Excelente!"];
    function updateStars(value) {
    selectedRating = value;
    $$(".star-button").forEach(button => {
        const active = Number(button.dataset.rating) <= value;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(Number(button.dataset.rating) === value));
    });
    $("#ratingLabel").textContent = value ? `${value} de 5 estrellas · ${ratingLabels[value]}` : "Selecciona una puntuación.";
    }
    $$(".star-button").forEach(button => {
    button.addEventListener("click", () => updateStars(Number(button.dataset.rating)));
    button.addEventListener("keydown", event => {
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = Math.min(5, Number(button.dataset.rating) + 1);
        updateStars(next); $(`.star-button[data-rating="${next}"]`).focus();
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = Math.max(1, Number(button.dataset.rating) - 1);
        updateStars(next); $(`.star-button[data-rating="${next}"]`).focus();
        }
    });
    });
    $("#ratingForm").addEventListener("submit", event => {
    event.preventDefault();
    if (!selectedRating) {
        $("#ratingLabel").textContent = "Selecciona de 1 a 5 estrellas para continuar.";
        $("#starRating").focus();
        showToast("Falta tu calificación", "Selecciona una cantidad de estrellas.");
        return;
    }
    const name = $("#ratingProfessional").value.split(" · ")[0];
    $("#ratingMessage").textContent = `Gracias. Tu calificación de ${selectedRating} ${selectedRating === 1 ? "estrella" : "estrellas"} para ${name} se registró solo como demostración.`;
    $("#ratingMessage").classList.remove("hidden");
    showToast("¡Gracias por calificar!", "Tu opinión de prueba se mostró correctamente.");
    });

    // Año automático y estado inicial de filtros
    $("#currentYear").textContent = new Date().getFullYear();
    applyFilters();