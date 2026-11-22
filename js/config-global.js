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

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
})();

// ==========================================================================
// SECCIÓN 0.1: SINCRONIZACIÓN Y CONTROL DE LÁMPARA CHOCHIN Y MODO OSCURO
// ==========================================================================
function syncLanternUI(isDark, animate = false) {
  const assembly = document.getElementById('lantern-assembly');
  const kanji = document.getElementById('lantern-kanji');
  
  if (assembly) {
    if (animate) {
      assembly.classList.remove('lantern-pulled');
      // Uso de requestAnimationFrame para reiniciar la animación sin forzar reflow sincrónico (Layout Thrashing)
      requestAnimationFrame(() => {
        assembly.classList.add('lantern-pulled');
      });
    }

    if (isDark) {
      assembly.classList.remove('is-lit');
      assembly.classList.add('is-unlit');
    } else {
      assembly.classList.remove('is-unlit');
      assembly.classList.add('is-lit');
    }
  }

  if (kanji) {
    // 明 (Luz / Modo Claro) vs 暗 (Oscuridad / Modo Oscuro)
    kanji.textContent = isDark ? '暗' : '明';
  }

  // Fallback seguro solo si NO tiene el ensamblaje de la lámpara
  const btnDark = document.getElementById('dark-mode-toggle');
  if (btnDark && !assembly && !btnDark.querySelector('.lantern-assembly')) {
    btnDark.innerText = isDark ? "☀️" : "🌙";
  }
}
window.syncLanternUI = syncLanternUI;

function toggleDarkMode(animate = true) {
  const body = document.body;
  const html = document.documentElement;
  
  body.classList.toggle('dark-mode');
  html.classList.toggle('dark-mode');
  
  const isDark = body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Actualizar Lámpara Chochin
  syncLanternUI(isDark, animate);

  // Sincronizar modal de temas ÚNICAMENTE si está abierto y visible
  const modalTemas = document.getElementById("themes-modal");
  const modalAbierto = modalTemas && modalTemas.classList.contains("active");
  if (modalAbierto) {
    if (typeof actualizarBarraModoTemaModal === "function") {
      actualizarBarraModoTemaModal();
    }
    if (typeof renderThemesCatalogGrid === "function") {
      renderThemesCatalogGrid();
    }
  }
}
window.toggleDarkMode = toggleDarkMode;
window.toggleLantern = toggleDarkMode;

// ==========================================================================
// SECCIÓN 1: CONFIGURACIÓN GLOBAL Y PERSISTENCIA (ANKI)
// ==========================================================================
let ankiConfig = {
  enabled: localStorage.getItem("anki_enabled") !== "false",
  deck: localStorage.getItem("anki_deck") || "Default",
  model: (localStorage.getItem("anki_model") === "ToriiDeckImage" || localStorage.getItem("anki_model") === "ToriiDeck" || localStorage.getItem("anki_model") === "ToriiTV") ? "ToriiDeckImage" : "ToriiDeckVideo",
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
  syncLanternUI(isDark, false);

  // --- 2.3 HIGHLIGHT MENÚ NAVEGACIÓN ---
  const normalizarRuta = (p) => (p || "").split("/").pop().replace(/\.html$/, "").toLowerCase();
  const paginaActual = normalizarRuta(window.location.pathname);
  const enlacesMenu = document.querySelectorAll(".top-nav a");

  enlacesMenu.forEach(enlace => {
    const rutaEnlace = normalizarRuta(enlace.getAttribute("href"));
    if (paginaActual && rutaEnlace && paginaActual === rutaEnlace) {
      enlace.classList.add("active");
    } else if ((paginaActual === "" || paginaActual === "index") && (rutaEnlace === "" || rutaEnlace === "index")) {
      enlace.classList.add("active");
    }
  });

  // --- 2.4 INICIALIZACIÓN DE MÓDULOS ---
  initPageTransitions();   // Transición suave entre páginas
  if (typeof initVideoPlayerModule === "function") initVideoPlayerModule(); // Módulo ToriiTV
  if (typeof initSubtitleEditorModule === "function") initSubtitleEditorModule(); // Módulo Estudio de Subtítulos
  if (typeof initAnkiConfigModule === "function") initAnkiConfigModule();  // Módulo Anki
  if (typeof initUserProfileModule === "function") initUserProfileModule(); // Módulo Perfil
  if (typeof initMinedCardsModule === "function") initMinedCardsModule();  // Módulo Tarjetas Minadas
  if (typeof initRpgSystemModule === "function") initRpgSystemModule();   // Módulo Sistema RPG (Gamificación)
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

// ==========================================================================
// NAVEGACIÓN GLOBAL Y UTILIDADES DE INTERFAZ
// ==========================================================================
function toggleV(id, botonPresionado = null) {
  const el = document.getElementById(id);
  if (el) {
    const boton = botonPresionado || (typeof event !== "undefined" ? event.currentTarget : null); 
    if (el.style.display === "block") {
      el.style.display = "none";
      if (boton && boton.tagName === "BUTTON") boton.innerText = "Ver respuesta";
    } else {
      el.style.display = "block";
      if (boton && boton.tagName === "BUTTON") boton.innerText = "Ocultar respuesta";
      if (typeof concederXP === "function") {
        concederXP(2, "👁️ Practicar respuesta", boton);
        if (typeof actualizarProgresoMision === "function") {
          actualizarProgresoMision("practica", 1);
        }
      }
    }
  }
}
window.toggleV = toggleV;

function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) {
    menu.classList.toggle("menu-open");
    menu.classList.toggle("active");
  }
}
window.toggleMenu = toggleMenu;

// Cerrar menú móvil al hacer clic fuera
document.addEventListener('click', function(e) {
  const menu = document.getElementById('menu');
  const botonHamburguesa = document.querySelector('.hamburger');
  if (menu && menu.classList.contains('menu-open')) {
    if (!menu.contains(e.target) && (!botonHamburguesa || !botonHamburguesa.contains(e.target))) {
      menu.classList.remove('menu-open');
      menu.classList.remove('active');
    }
  }
});

window.addEventListener('popstate', function() {
  const menu = document.getElementById('menu');
  if (menu && menu.classList.contains('menu-open')) {
    menu.classList.remove('menu-open');
    menu.classList.remove('active');
  }
});

// ==========================================================================
// SECCIÓN: MODAL GLOBAL DE TÉRMINOS Y CONDICIONES / DESCARGO DE RESPONSABILIDAD
// ==========================================================================
function openTermsModal() {
  let modal = document.getElementById('modal-terms-disclaimer');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-terms-disclaimer';
    modal.className = 'torii-terms-modal-overlay';
    modal.innerHTML = `
      <div class="torii-terms-modal-card" role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">
        <div class="torii-terms-modal-header">
          <h3 id="terms-modal-title" style="margin:0; font-size:1.05rem; display:flex; align-items:center; gap:8px;">
            <span>⚖️</span> Términos y Condiciones de Uso
          </h3>
          <button type="button" class="torii-terms-modal-close" aria-label="Cerrar">&#x2715;</button>
        </div>
        <div class="torii-terms-modal-body">
          <p style="margin:0 0 10px; font-weight:700; color:var(--accent, #38bdf8); font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px;">
            Descargo de Responsabilidad (Disclaimer)
          </p>
          <p style="margin:0; font-size:0.9rem; line-height:1.65; opacity:0.92;">
            Nihongo no Torii es una herramienta educativa y visor de lectura y video local para el estudio del idioma japonés. Esta aplicación no aloja, distribuye ni comercializa contenido protegido por derechos de autor en sus servidores. Todo el procesamiento y almacenamiento se realiza exclusivamente de forma local en el navegador del usuario para fines de estudio privado.
          </p>
        </div>
        <div class="torii-terms-modal-footer">
          <button type="button" class="torii-terms-modal-btn">Entendido</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.torii-terms-modal-close');
    const confirmBtn = modal.querySelector('.torii-terms-modal-btn');
    const closeModal = () => modal.classList.remove('active');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (confirmBtn) confirmBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }
  modal.classList.add('active');
}
window.openTermsModal = openTermsModal;

// Delegación global para cualquier botón o enlace con .torii-footer-btn, .torii-footer-link o #btn-open-terms-modal
document.addEventListener('click', function(e) {
  const target = e.target.closest('.torii-footer-btn, .torii-footer-link, #btn-open-terms-modal');
  if (target) {
    e.preventDefault();
    openTermsModal();
  }
});
