// ==========================================================================
// SECCIÓN 0: GESTIÓN GLOBAL DE TEMAS Y PERSONALIZACIÓN (ESTILO WINDOWS)
// ==========================================================================
function aplicarTemaGlobal(themeId) {
  if (!themeId || themeId === "custom") {
    themeId = "torii-sunset";
  }
  document.documentElement.setAttribute("data-theme", themeId);
  if (document.body) {
    document.body.setAttribute("data-theme", themeId);
  }
  localStorage.setItem("torii_theme", themeId);
  
  // Sincronizar select de temas si existe en el DOM
  const selectTheme = document.getElementById("select-profile-hud-theme");
  if (selectTheme && selectTheme.value !== themeId) {
    selectTheme.value = themeId;
  }
}
window.aplicarTemaGlobal = aplicarTemaGlobal;

// Aplicación inmediata del tema antes de renderizar para evitar destellos
(function() {
  let temaGuardado = localStorage.getItem("torii_theme");
  if (!temaGuardado) {
    try {
      const perfilGuardado = localStorage.getItem("torii_user_profile");
      if (perfilGuardado) {
        const parsed = JSON.parse(perfilGuardado);
        if (parsed && parsed.hudTheme) temaGuardado = parsed.hudTheme;
      }
    } catch(e) {}
  }
  if (!temaGuardado || temaGuardado === "custom") temaGuardado = "torii-sunset";
  document.documentElement.setAttribute("data-theme", temaGuardado);
})();

// ==========================================================================
// SECCIÓN 1: CONFIGURACIÓN GLOBAL Y PERSISTENCIA (ANKI)
// ==========================================================================
let ankiConfig = {
  enabled: localStorage.getItem("anki_enabled") !== "false",
  deck: localStorage.getItem("anki_deck") || "Default",
  model: localStorage.getItem("anki_model") || "ToriiDeckVideo",
  url: localStorage.getItem("anki_url") || "http://127.0.0.1:8765"
};


// ==========================================================================
// SECCIÓN 2: INICIALIZACIÓN PRINCIPAL (DOM CONTENT LOADED)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {

  // --- 2.0 APLICAR TEMA GLOBAL ---
  const temaActual = document.documentElement.getAttribute("data-theme") || localStorage.getItem("torii_theme") || "torii-sunset";
  aplicarTemaGlobal(temaActual);

  // --- 2.1 CARRUSEL INFINITO ---
  const track = document.querySelector('.slider-track');
  if (track) {
    const clones = track.innerHTML;
    track.innerHTML += clones;
  }

  // --- 2.2 MODO OSCURO (INICIALIZACIÓN) ---
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const html = document.documentElement;
  const isDark = savedTheme === 'dark';
  
  if (isDark) {
    body.classList.add('dark-mode');
    html.classList.add('dark-mode');
  }

  // Sincronizar Chochin (Lámpara Japonesa)
  if (typeof syncLanternUI === "function") {
    syncLanternUI(isDark, false);
  } else {
    const btnDark = document.getElementById('dark-mode-toggle');
    if (btnDark) btnDark.innerText = isDark ? "☀️" : "🌙";
  }

  // --- 2.3 HIGHLIGHT MENÚ NAVEGACIÓN ---
  const paginaActual = window.location.pathname.split("/").pop();
  const enlacesMenu = document.querySelectorAll(".top-nav a");

  enlacesMenu.forEach(enlace => {
    const rutaEnlace = enlace.getAttribute("href");
    if (paginaActual === rutaEnlace) {
      enlace.classList.add("active");
    } else if ((paginaActual === "" || paginaActual === "index.html") && rutaEnlace === "index.html") {
      enlace.classList.add("active");
    }
  });

  // --- 2.4 INICIALIZACIÓN DE MÓDULOS ---
  initPageTransitions();   // Transición suave entre páginas
  if (typeof initVideoPlayerModule === "function") initVideoPlayerModule(); // Módulo ToriiTV
  if (typeof initAnkiConfigModule === "function") initAnkiConfigModule();  // Módulo Anki
  if (typeof initUserProfileModule === "function") initUserProfileModule(); // Módulo Perfil
  if (typeof initMinedCardsModule === "function") initMinedCardsModule();  // Módulo Tarjetas Minadas
  if (typeof initRpgSystemModule === "function") initRpgSystemModule();   // Módulo Sistema RPG (Gamificación)
  if (typeof initBibliotecaFiltrosUrl === "function") initBibliotecaFiltrosUrl(); // Filtro URL Biblioteca
});

function initPageTransitions() {
  let overlay = document.getElementById("page-transition-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "page-transition-overlay";
    document.body.appendChild(overlay);
  }

  setTimeout(() => {
    overlay.classList.remove("active");
  }, 50);

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || link.target === "_blank") return;

    if (link.origin === window.location.origin) {
      e.preventDefault();
      if (typeof guardarEstadoPlaybackBGM === "function") {
        guardarEstadoPlaybackBGM();
      }
      overlay.classList.add("active");
      setTimeout(() => {
        window.location.href = href;
      }, 100);
    }
  });

  window.addEventListener("pageshow", () => {
    if (overlay) overlay.classList.remove("active");
  });
}
