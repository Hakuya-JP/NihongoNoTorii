document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================================
  // 1. PREPARACIÓN DEL CARRUSEL INFINITO
  // ==========================================================================
  const track = document.querySelector('.slider-track');
  if (track) {
    const clones = track.innerHTML;
    track.innerHTML += clones;
  }

  // ==========================================================================
  // 2. COMPROBACIÓN INICIAL DEL MODO OSCURO
  // ==========================================================================
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const btnDark = document.getElementById('dark-mode-toggle');
  
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (btnDark) btnDark.innerText = "☀️";
  }

  // ==========================================================================
  // 3. HIGHLIGHT EN EL MENÚ DE NAVEGACIÓN
  // ==========================================================================
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

}); // Fin DOMContentLoaded Inicial


// ================================================================
// FUNCIONES GLOBALES (Menú, Videos, Biblioteca y Modo Oscuro)
// ================================================================

// Revelar Respuestas en Vocales y Kana
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
    }
  }
}

// Interruptor de Modo Oscuro / Claro
function toggleDarkMode() {
  const body = document.body;
  const btn = document.getElementById('dark-mode-toggle');
  
  body.classList.toggle('dark-mode');
  
  if (body.classList.contains('dark-mode')) {
    if (btn) btn.innerText = "☀️";
    localStorage.setItem('theme', 'dark');
  } else {
    if (btn) btn.innerText = "🌙";
    localStorage.setItem('theme', 'light');
  }
}

// --- FUNCIONES DE LA BARRA LATERAL (SIDEBAR BIBLIOTECA) ---
function verDetalle(titulo, imagen, descripcion, linkPdf, linkExtra, linkAudio, linkRespuestas) {
  const sidebar = document.getElementById('sidebar-detalle');
  const mainContainer = document.querySelector('.biblioteca-main');
  
  if (!sidebar || !mainContainer) return;

  document.getElementById('det-titulo').innerText = titulo;
  document.getElementById('det-portada').src = imagen;
  document.getElementById('det-descripcion').innerText = descripcion;
  document.getElementById('link-pdf').href = linkPdf;
  
  const btnExtra = document.getElementById('link-extra');
  const btnAudio = document.getElementById('link-audio');
  const btnRespuestas = document.getElementById('link-respuestas');

  if (btnExtra) {
    btnExtra.style.display = (linkExtra && linkExtra !== '#') ? "block" : "none";
    if (linkExtra !== '#') btnExtra.href = linkExtra;
  }

  if (btnAudio) {
    btnAudio.style.display = (linkAudio && linkAudio !== '#') ? "block" : "none";
    if (linkAudio !== '#') btnAudio.href = linkAudio;
  }

  if (btnRespuestas) {
    btnRespuestas.style.display = (linkRespuestas && linkRespuestas !== '#') ? "block" : "none";
    if (linkRespuestas !== '#') btnRespuestas.href = linkRespuestas;
  }
  
  sidebar.classList.add('open');
  mainContainer.classList.add('sidebar-abierto');
  registrarEstadoAbierto();
}

function cerrarDetalle() {
  const sidebar = document.getElementById('sidebar-detalle');
  const mainContainer = document.querySelector('.biblioteca-main');
  
  if (sidebar) sidebar.classList.remove('open');
  if (mainContainer) mainContainer.classList.remove('sidebar-abierto');
}

// --- FILTROS DE BÚSQUEDA ---
function filtrarLibros() {
  const buscador = document.getElementById('buscador-libros');
  if (!buscador) return;

  const input = buscador.value.toLowerCase();
  const libros = document.getElementsByClassName('libro-card');
  
  resetearBotonesFiltro();

  for (let i = 0; i < libros.length; i++) {
    let titulo = libros[i].getElementsByTagName('h3')[0].innerText.toLowerCase();
    libros[i].style.display = titulo.includes(input) ? "block" : "none";
  }
}

function filtrarCategoria(categoria, botonPresionado) {
  const libros = document.getElementsByClassName('libro-card');
  const buscador = document.getElementById('buscador-libros');
  
  if (buscador) buscador.value = "";

  const botones = document.getElementsByClassName('filter-btn');
  for (let btn of botones) {
    btn.classList.remove('active');
  }
  
  if (botonPresionado) botonPresionado.classList.add('active');

  for (let i = 0; i < libros.length; i++) {
    let catLibro = libros[i].getAttribute('data-categoria') || "";
    const listaCategorias = catLibro.split(" ");

    if (categoria === 'todos' || listaCategorias.includes(categoria)) {
      libros[i].style.display = "block";
    } else {
      libros[i].style.display = "none";
    }
  }
}

function resetearBotonesFiltro() {
  const botones = document.getElementsByClassName('filter-btn');
  for (let btn of botones) {
    btn.classList.remove('active');
  }
  if (botones[0]) botones[0].classList.add('active');
}

// --- CIERRE AL HACER CLIC FUERA ---
document.addEventListener('click', function(evento) {
  const sidebar = document.getElementById('sidebar-detalle');
  const menu = document.getElementById('menu');
  const botonHamburguesa = document.querySelector('.hamburger');
  
  if (sidebar && sidebar.classList.contains('open')) {
    const clicDentroDelSidebar = sidebar.contains(evento.target);
    const clicEnTarjetaLibro = evento.target.closest('.libro-card');
    
    if (!clicDentroDelSidebar && !clicEnTarjetaLibro) {
      cerrarDetalle();
    }
  }

  if (menu && menu.classList.contains('menu-open')) {
    const clicDentroDelMenu = menu.contains(evento.target);
    const clicEnHamburguesa = (botonHamburguesa && botonHamburguesa.contains(evento.target));
    
    if (!clicDentroDelMenu && !clicEnHamburguesa) {
      menu.classList.remove('menu-open');
    }
  }
});

// --- HISTORIAL Y BOTÓN ATRÁS ---
function registrarEstadoAbierto() {
  history.pushState({ panelAbierto: true }, "");
}

function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.classList.toggle('menu-open');
    if (menu.classList.contains('menu-open')) {
      registrarEstadoAbierto();
    }
  }
}

window.addEventListener('popstate', function() {
  const sidebar = document.getElementById('sidebar-detalle');
  const mainContainer = document.querySelector('.biblioteca-main');
  const menu = document.getElementById('menu');
  
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    if (mainContainer) mainContainer.classList.remove('sidebar-abierto');
  }
  
  if (menu && menu.classList.contains('menu-open')) {
    menu.classList.remove('menu-open');
  }
});

// ==========================================================================
// MÓDULO DEL REPRODUCTOR DE SUBTÍTULOS INTERACTIVO + INTEGRACIÓN ANKI (ToriiDeck)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("main-video");
  const videoWrapper = document.getElementById("video-wrapper");
  const inputVideo = document.getElementById("input-video");
  const inputSub = document.getElementById("input-sub");
  const overlaySub = document.getElementById("overlay-subtitles");
  const subListContainer = document.getElementById("subtitles-list");
  const subCount = document.getElementById("sub-count");
  const colorPicker = document.getElementById("sub-color-picker");
  const btnToggleBg = document.getElementById("btn-toggle-bg");
  const fontSelect = document.getElementById("sub-font-family");
  const bgColorPicker = document.getElementById("sub-bg-color-picker");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  
  const btnSubMinus = document.getElementById("btn-sub-minus");
  const btnSubPlus = document.getElementById("btn-sub-plus");
  const btnTextMinus = document.getElementById("btn-text-minus");
  const btnTextPlus = document.getElementById("btn-text-plus");

  let subtitulos = [];
  let timeOffset = 0;
  let fontSizeOverlay = 1.4;

  if (!video) return; 

  if (!video.getAttribute("src") && overlaySub) {
    overlaySub.innerText = "🎬 Da clic aquí para cargar el video";
    overlaySub.classList.add("centrado");
  }

  video.addEventListener("click", () => {
    if (!video.getAttribute("src") && inputVideo) inputVideo.click();
  });

  if (subListContainer) {
    subListContainer.addEventListener("click", (e) => {
      // Previene abrir el cargador de subtítulos si hace clic en líneas existentes
      if (subtitulos.length === 0 && inputSub && !e.target.closest('.sub-line')) {
        inputSub.click(); 
      }
    });
  }

  // 1. CARGAR VIDEO LOCAL
  if (inputVideo) {
    inputVideo.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        video.src = URL.createObjectURL(file);
        if (overlaySub) {
          overlaySub.innerText = "";
          overlaySub.classList.remove("centrado");
        }
        
        if (subtitulos.length === 0 && subListContainer) {
          subListContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; cursor: pointer;">
              <p class="sub-placeholder" style="margin: 0; font-weight: bold; font-size: 0.95rem;">✅ Video cargado.</p>
              <p class="sub-placeholder" style="margin-top: 6px; font-size: 0.85rem; opacity: 0.8;">Da clic aquí para subir los subtítulos (.srt, .vtt, .ass)</p>
            </div>
          `;
        }
      }
    });
  }

  // 2. CARGAR SUBTÍTULOS
  if (inputSub) {
    inputSub.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();
        
        reader.onload = function(evt) {
          const textoCrudo = evt.target.result;
          subtitulos = (extension === "ass" || extension === "ssa") ? parseASS(textoCrudo) : parseSRT(textoCrudo);
          window.subtitlesData = subtitulos;
          renderSidebarSubtitles();
          
          if (video.getAttribute("src") && overlaySub) {
            overlaySub.innerText = ""; 
            overlaySub.classList.remove("centrado");
          }
        };
        reader.readAsText(file);
      }
    });
  }

  function parseSRT(data) {
    data = data.replace(/\r\n/g, '\n').trim() + '\n\n';
    const regex = /(?:\d+\n)?(\d\d:\d\d:\d\d[,.]\d\d\d) --> (\d\d:\d\d:\d\d[,.]\d\d\d)\n([\s\S]*?)(?=\n\n)/g;
    let result = [];
    let match;

    while ((match = regex.exec(data)) !== null) {
      result.push({
        id: result.length + 1,
        inicio: timeToSeconds(match[1]),
        fin: timeToSeconds(match[2]),
        texto: match[3].replace(/\n/g, "<br>")
      });
    }

    if (subCount) subCount.innerText = `${result.length} líneas`;
    return result;
  }

  function parseASS(data) {
    let result = [];
    const lines = data.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith("Dialogue:")) {
        const parts = line.split(',');
        if (parts.length >= 10) {
          const startStr = parts[1].trim(); 
          const endStr = parts[2].trim();
          let text = parts.slice(9).join(',').trim();
          
          text = text.replace(/\{\\[^}]+\}/g, '');
          text = text.replace(/\\N/g, '<br>').replace(/\\n/g, '<br>');

          result.push({
            id: result.length + 1,
            inicio: assTimeToSeconds(startStr),
            fin: assTimeToSeconds(endStr),
            texto: text
          });
        }
      }
    });
    
    if (subCount) subCount.innerText = `${result.length} líneas (.ass)`;
    return result;
  }

  function timeToSeconds(timeStr) {
    timeStr = timeStr.replace('.', ','); 
    const parts = timeStr.split(":");
    const secondsParts = parts[2].split(",");

    const sec = parseInt(secondsParts[0], 10) || 0;
    const ms = parseInt(secondsParts[1], 10) || 0;

    return (parseInt(parts[0], 10) || 0) * 3600 + 
           (parseInt(parts[1], 10) || 0) * 60 + 
           sec + (ms / 1000);
  }

  function assTimeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    const secParts = parts[2].split('.');
    return ((parseInt(parts[0], 10) || 0) * 3600) + 
           ((parseInt(parts[1], 10) || 0) * 60) + 
           (parseInt(secParts[0], 10) || 0) + 
           ((parseInt(secParts[1], 10) || 0) / 100);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // RENDERIZADO DE SUBTÍTULOS Y BOTÓN DE ANKI
  function renderSidebarSubtitles() {
    if (!subListContainer) return;
    subListContainer.innerHTML = "";
    
    subtitulos.forEach((sub, index) => {
      const lineDiv = document.createElement("div");
      lineDiv.classList.add("sub-line");
      lineDiv.dataset.index = index;
      lineDiv.innerHTML = `
        <span class="sub-time">${formatTime(sub.inicio + timeOffset)}</span>
        <div class="sub-text">${sub.texto}</div>
        <button class="btn-anki-star" title="Enviar minado a Anki">☆</button>
      `;

      lineDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-anki-star")) return;
        video.currentTime = sub.inicio + timeOffset;
        video.play();
      });

      const starBtn = lineDiv.querySelector(".btn-anki-star");
      if (starBtn) {
        starBtn.addEventListener("click", async (e) => {
          e.stopPropagation();

          starBtn.innerText = "⏳";

          try {
            await enviarObjetoAAnki(sub);
            starBtn.innerText = "★";
            starBtn.classList.add("active");
            starBtn.title = "¡Añadida a Anki!";
          } catch (error) {
            alert("No se pudo enviar a Anki: " + error.message);
            starBtn.innerText = "☆";
          }
        });
      }

      subListContainer.appendChild(lineDiv);
    });
  }

  // 3. SINCRONIZACIÓN EN TIEMPO REAL
  video.addEventListener("timeupdate", () => {
    if (subtitulos.length === 0) return;

    const currentTime = video.currentTime;
    const subActual = subtitulos.find(s => currentTime >= (s.inicio + timeOffset) && currentTime <= (s.fin + timeOffset));

    if (overlaySub) {
      if (subActual) {
        overlaySub.innerHTML = subActual.texto;
      } else if (video.getAttribute("src") && video.currentTime > 0) {
        overlaySub.innerHTML = "";
      }
    }

    if (subListContainer) {
      const activeDiv = subListContainer.querySelector(".sub-line.active");
      if (activeDiv) activeDiv.classList.remove("active");

      if (subActual) {
        const index = subtitulos.indexOf(subActual);
        const targetDiv = subListContainer.children[index];
        if (targetDiv) {
          targetDiv.classList.add("active");
          targetDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  });

  // 4. CONTROLES Y HERRAMIENTAS
  if (btnSubPlus) btnSubPlus.addEventListener("click", () => { timeOffset += 0.5; actualizarTiemposUI(); });
  if (btnSubMinus) btnSubMinus.addEventListener("click", () => { timeOffset -= 0.5; actualizarTiemposUI(); });

  function actualizarTiemposUI() {
    if (!subListContainer) return;
    const lines = subListContainer.querySelectorAll(".sub-line");
    lines.forEach((line, i) => {
      const timeSpan = line.querySelector(".sub-time");
      if (timeSpan && subtitulos[i]) {
        timeSpan.innerText = formatTime(subtitulos[i].inicio + timeOffset);
      }
    });
  }

  if (btnTextPlus) btnTextPlus.addEventListener("click", () => { fontSizeOverlay += 0.2; if(overlaySub) overlaySub.style.fontSize = `${fontSizeOverlay}rem`; });
  if (btnTextMinus) btnTextMinus.addEventListener("click", () => { if (fontSizeOverlay > 0.8) fontSizeOverlay -= 0.2; if(overlaySub) overlaySub.style.fontSize = `${fontSizeOverlay}rem`; });

  if (colorPicker && overlaySub) colorPicker.addEventListener("input", (e) => overlaySub.style.color = e.target.value);
  
  if (btnToggleBg && overlaySub) {
    btnToggleBg.addEventListener("click", () => {
      overlaySub.classList.toggle("sin-fondo");
      btnToggleBg.classList.toggle("active-tool");
    });
  }
  
  if (fontSelect && overlaySub) fontSelect.addEventListener("change", (e) => overlaySub.style.fontFamily = e.target.value);
  
  if (bgColorPicker && overlaySub) {
    bgColorPicker.addEventListener("input", (e) => {
      const hex = e.target.value;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      overlaySub.style.setProperty('--bg-sub-color', `rgba(${r}, ${g}, ${b}, 0.8)`);
      overlaySub.classList.remove("sin-fondo");
      if (btnToggleBg) btnToggleBg.classList.add("active-tool");
    });
  }

  // 5. CONTROL PANTALLA COMPLETA
  function togglePantallaCompleta() {
    const contenedor = videoWrapper || video;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (contenedor.requestFullscreen) contenedor.requestFullscreen();
      else if (contenedor.webkitRequestFullscreen) contenedor.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  if (btnFullscreen) btnFullscreen.addEventListener("click", togglePantallaCompleta);
  video.addEventListener("dblclick", togglePantallaCompleta);

  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    const isEditingText = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
    if ((e.key === 'f' || e.key === 'F') && !isEditingText) {
      e.preventDefault();
      togglePantallaCompleta();
    }
  });

  // 6. DESCARGAR SUBTÍTULOS (.SRT)
  const btnExport = document.getElementById("btn-export-sub");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      if (subtitulos.length === 0) {
        alert("No hay subtítulos cargados para descargar.");
        return;
      }
      
      let contenidoSRT = "";
      subtitulos.forEach((s, idx) => {
        const inicio = formatSRTTime(s.inicio + timeOffset);
        const fin = formatSRTTime(s.fin + timeOffset);
        const textoLimpio = s.texto.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "");
        contenidoSRT += `${idx + 1}\n${inicio} --> ${fin}\n${textoLimpio}\n\n`;
      });

      const blob = new Blob([contenidoSRT], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subtitulos_sincronizados.srt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function formatSRTTime(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
    return `${h}:${m}:${s},${ms}`;
  }

  // 7. PANEL DE CONFIGURACIÓN DEL VIDEO
  const btnConfig = document.getElementById('btn-toggle-config');
  const configPanel = document.getElementById('video-config-panel');

  if (btnConfig && configPanel) {
    btnConfig.addEventListener('click', (e) => {
      e.stopPropagation();
      configPanel.classList.toggle('oculto');
    });

    if (videoWrapper) {
      videoWrapper.addEventListener('click', (e) => {
        if (!configPanel.contains(e.target) && e.target !== btnConfig) {
          configPanel.classList.add('oculto');
        }
      });
    }
  }

  // NAVEGACIÓN DE SUBTÍTULOS CON FLECHAS
  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    if (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.tagName === "SELECT"
    ) {
      return;
    }

    if (!subtitulos || subtitulos.length === 0) return;

    const currentTime = video.currentTime;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (document.activeElement === video) video.blur();

      const nextSub = subtitulos.find(
        (sub) => (sub.inicio + timeOffset) > currentTime + 0.1
      );

      if (nextSub) {
        video.currentTime = nextSub.inicio + timeOffset;
      }
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (document.activeElement === video) video.blur();

      const prevSub = subtitulos
        .slice()
        .reverse()
        .find((sub) => (sub.inicio + timeOffset) < currentTime - 0.5);

      if (prevSub) {
        video.currentTime = prevSub.inicio + timeOffset;
      } else if (subtitulos.length > 0) {
        video.currentTime = subtitulos[0].inicio + timeOffset;
      }
    }
  });
// ==========================================================================
// MÓDULO INTEGRACIÓN AVANZADA ANKI (ToriiDeck / AnkiConnect Estándar)
// ==========================================================================

const ANKI_URL = "http://127.0.0.1:8765";

// Referencias del DOM
const btnToggleAnki = document.getElementById("btn-toggle-anki-config");
const panelAnki = document.getElementById("anki-config-panel");
const btnSaveAnki = document.getElementById("btn-save-anki");
const btnRefreshDecks = document.getElementById("btn-refresh-decks");

const selectDeck = document.getElementById("anki-deck-select");
const selectModel = document.getElementById("anki-model-select");
const toggleEnabled = document.getElementById("anki-enabled-toggle");
const statusIndicator = document.getElementById("anki-status-indicator");

// Configuración persistente en LocalStorage
let ankiConfig = {
  enabled: localStorage.getItem("anki_enabled") !== "false",
  deck: localStorage.getItem("anki_deck") || "Default",
  model: localStorage.getItem("anki_model") || "ToriiDeck"
};

if (toggleEnabled) toggleEnabled.checked = ankiConfig.enabled;

// 1. INVOCADOR OFICIAL ANKICONNECT
async function invokeAnki(action, version = 6, params = {}) {
  try {
    const response = await fetch(ANKI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version, params })
    });
    return await response.json();
  } catch (error) {
    console.warn("AnkiConnect no responde:", error);
    return { error: "No se pudo conectar con Anki. Asegúrate de que Anki esté abierto y AnkiConnect activo." };
  }
}

// 2. OBTENER Y RENDERIZAR LISTA DE MAZOS Y MODELOS
async function cargarMazosAnki() {
  if (!selectDeck) return;

  const [resDecks, resModels] = await Promise.all([
    invokeAnki("deckNames"),
    invokeAnki("modelNames")
  ]);

  if (resDecks.error || !resDecks.result) {
    selectDeck.innerHTML = '<option value="Default">Default (Offline)</option>';
    if (statusIndicator) {
      statusIndicator.textContent = "● Sin conexión";
      statusIndicator.className = "anki-status offline";
    }
    return;
  }

  if (statusIndicator) {
    statusIndicator.textContent = "● Conectado";
    statusIndicator.className = "anki-status online";
  }

  // Rellenar Mazos
  selectDeck.innerHTML = "";
  resDecks.result.forEach((deckName) => {
    const option = document.createElement("option");
    option.value = deckName;
    option.textContent = deckName;
    selectDeck.appendChild(option);
  });
  if (ankiConfig.deck && resDecks.result.includes(ankiConfig.deck)) {
    selectDeck.value = ankiConfig.deck;
  }

  // Rellenar Tipos de Nota (Modelos)
  if (selectModel && resModels.result) {
    selectModel.innerHTML = "";
    resModels.result.forEach((modelName) => {
      const option = document.createElement("option");
      option.value = modelName;
      option.textContent = modelName;
      selectModel.appendChild(option);
    });
    if (ankiConfig.model && resModels.result.includes(ankiConfig.model)) {
      selectModel.value = ankiConfig.model;
    }
  }
}

if (btnRefreshDecks) {
  btnRefreshDecks.addEventListener("click", cargarMazosAnki);
}

// 3. EVENTOS DE DESPLEGABLE Y CONFIGURACIÓN
if (btnToggleAnki && panelAnki) {
  btnToggleAnki.addEventListener("click", (e) => {
    e.stopPropagation();
    panelAnki.classList.toggle("oculto");
    if (!panelAnki.classList.contains("oculto")) {
      cargarMazosAnki();
    }
  });

  document.addEventListener("click", (e) => {
    if (!panelAnki.contains(e.target) && e.target !== btnToggleAnki) {
      panelAnki.classList.add("oculto");
    }
  });
}

if (btnSaveAnki) {
  btnSaveAnki.addEventListener("click", () => {
    ankiConfig.enabled = toggleEnabled ? toggleEnabled.checked : true;
    ankiConfig.deck = selectDeck ? selectDeck.value : "Default";
    ankiConfig.model = selectModel ? selectModel.value : "ToriiDeck";

    localStorage.setItem("anki_enabled", ankiConfig.enabled);
    localStorage.setItem("anki_deck", ankiConfig.deck);
    localStorage.setItem("anki_model", ankiConfig.model);

    if (panelAnki) panelAnki.classList.add("oculto");
    alert("¡Configuración de Anki guardada!");
  });
}

// 4. CAPTURAR PANTALLA EN BASE64 PURO
function capturarFotogramaVideo() {
  const videoEl = document.getElementById("main-video");
  if (!videoEl || videoEl.readyState < 2) return null;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 360;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg", 0.85);
    return dataURL.replace(/^data:image\/jpeg;base64,/, "");
  } catch (err) {
    console.warn("No se pudo capturar fotograma:", err);
    return null;
  }
}

// 5. ENVIAR NOTA A ANKI (EXPUESTA GLOBALMENTE EN WINDOW)
window.enviarObjetoAAnki = async function(sub) {
  if (!ankiConfig.enabled) {
    throw new Error("La función de Anki está desactivada en los ajustes.");
  }

  const targetModel = ankiConfig.model || "ToriiDeck";

  // A. Obtener los nombres de campos del modelo en Anki
  const modelFieldsRes = await invokeAnki("modelFieldNames", 6, {
    modelName: targetModel
  });

  if (modelFieldsRes.error || !modelFieldsRes.result) {
    throw new Error(`El modelo "${targetModel}" no existe en Anki: ${modelFieldsRes.error}`);
  }

  const camposReales = modelFieldsRes.result;
  let fieldsObj = {};

  // Inicializar todos los campos en blanco por seguridad
  camposReales.forEach((campo) => {
    fieldsObj[campo] = "";
  });

  // B. Búsqueda insensible a mayúsculas/acentos
  const encontrarCampo = (posiblesNombres) => {
    return camposReales.find((c) =>
      posiblesNombres.some(
        (p) =>
          c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
          p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      )
    );
  };

  const campoOracion = encontrarCampo(["Japones", "Japanese", "Oracion", "Oración", "Frase", "Front", "Texto", "Expression", "Sentence"]);
  const campoFurigana = encontrarCampo(["Furigana", "Lectura", "Reading", "Back"]);
  const campoImagen = encontrarCampo(["Imagen", "Image", "Picture", "Snapshot", "Screenshot"]);

  // C. Limpieza del texto
  const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

  // D. Asignación de valores
  if (campoOracion) {
    fieldsObj[campoOracion] = fraseLimpia;
  } else {
    fieldsObj[camposReales[0]] = fraseLimpia; // Fallback al primer campo disponible
  }

  if (campoFurigana) {
    fieldsObj[campoFurigana] = sub.texto;
  }

  // E. Construcción de la nota según la spec oficial de AnkiConnect
  const notePayload = {
    deckName: ankiConfig.deck || "Default",
    modelName: targetModel,
    fields: fieldsObj,
    tags: ["ToriiTV"],
    options: {
      allowDuplicate: true
    }
  };

  // F. Adjuntar captura fotográfica si existe un campo para imágenes
  const imgBase64 = capturarFotogramaVideo();
  if (imgBase64 && campoImagen) {
    notePayload.picture = [{
      data: imgBase64,
      filename: `toriideck_${Date.now()}.jpg`,
      fields: [campoImagen]
    }];
  }

  // G. Envío final
  const res = await invokeAnki("addNote", 6, { note: notePayload });

  if (res.error) {
    console.error("Error devuelto por AnkiConnect:", res.error);
    throw new Error(res.error);
  }

  console.log("¡Nota añadida exitosamente con ID:", res.result);
  return res.result;
};

// Cargar la lista inicial de mazos/modelos al iniciar el DOM
cargarMazosAnki();


});