// ==========================================================================
// SECCIÓN 1: CONFIGURACIÓN GLOBAL Y PERSISTENCIA (ANKI)
// ==========================================================================
let ankiConfig = {
  enabled: localStorage.getItem("anki_enabled") !== "false",
  deck: localStorage.getItem("anki_deck") || "Default",
  model: localStorage.getItem("anki_model") || "ToriiDeck",
  url: localStorage.getItem("anki_url") || "http://127.0.0.1:8765"
};


// ==========================================================================
// SECCIÓN 2: INICIALIZACIÓN PRINCIPAL (DOM CONTENT LOADED)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {

  // --- 2.1 CARRUSEL INFINITO ---
  const track = document.querySelector('.slider-track');
  if (track) {
    const clones = track.innerHTML;
    track.innerHTML += clones;
  }

  // --- 2.2 MODO OSCURO (INICIALIZACIÓN) ---
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const btnDark = document.getElementById('dark-mode-toggle');
  
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (btnDark) btnDark.innerText = "☀️";
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
  initVideoPlayerModule(); // Módulo ToriiTV
  initAnkiConfigModule();  // Módulo Anki
  initUserProfileModule(); // Módulo Perfil
  initMinedCardsModule();  // Módulo Tarjetas Minadas
});


// ==========================================================================
// SECCIÓN 3: INTERFAZ GENERAL Y NAVEGACIÓN (SITIO WEB / BIBLIOTECA)
// ==========================================================================

// Revelar Respuestas
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

// Interruptor Dark Mode
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

// Sidebar Biblioteca - Detalle
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

// Filtros Biblioteca
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

function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.classList.toggle('menu-open');
    if (menu.classList.contains('menu-open')) {
      registrarEstadoAbierto();
    }
  }
}

function registrarEstadoAbierto() {
  history.pushState({ panelAbierto: true }, "");
}

// LISTENERS GLOBALES (CLIC Y NAVEGACIÓN)
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
// SECCIÓN 4: MÓDULO TORIITV (REPRODUCTOR DE VIDEO Y SUBTÍTULOS)
// ==========================================================================
function initVideoPlayerModule() {
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

  if (!video) return;

  let subtitulos = [];
  let timeOffset = 0;
  let fontSizeOverlay = 1.4;

  if (!video.getAttribute("src") && overlaySub) {
    overlaySub.innerText = "🎬 Da clic aquí para cargar el video";
    overlaySub.classList.add("centrado");
  }

  video.addEventListener("click", () => {
    if (!video.getAttribute("src") && inputVideo) inputVideo.click();
  });

  if (subListContainer) {
    subListContainer.addEventListener("click", (e) => {
      if (subtitulos.length === 0 && inputSub && !e.target.closest('.sub-line')) {
        inputSub.click(); 
      }
    });
  }

  // Carga de archivo de Video
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

  // Carga de Subtítulos
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

          // 1. Siempre guardar copia de respaldo en la lista local de la web
          agregarTarjetaMinadaLocal(sub);
          starBtn.innerText = "★";
          starBtn.classList.add("active");

          // 2. Enviar directamente a Anki vía AnkiConnect
          if (ankiConfig && ankiConfig.enabled) {
            try {
              const resId = await window.enviarObjetoAAnki(sub);
              mostrarToast("📇 ¡Tarjeta enviada directamente a Anki!");
              starBtn.title = `¡Enviada a Anki (ID: ${resId}) y guardada en tu lista!`;
            } catch (error) {
              console.warn("AnkiConnect no respondió (quedó guardada en tu lista web):", error.message);
              mostrarToast("⭐ Guardada en tu lista web (Anki offline)");
              starBtn.title = "¡Añadida a tu lista de la web!";
            }
          } else {
            mostrarToast("⭐ Guardada en tu lista web");
            starBtn.title = "¡Añadida a tu lista de la web!";
          }
        });
      }

      subListContainer.appendChild(lineDiv);
    });
  }

  // Sincronización continua de Video y Subtítulos + Contador de Tiempo de Estudio
  let ultimoContadorTiempo = Date.now();
  video.addEventListener("timeupdate", () => {
    // Registrar tiempo de estudio acumulado cada 5 segundos de reproducción activa
    const ahora = Date.now();
    if (!video.paused && (ahora - ultimoContadorTiempo) >= 5000) {
      if (typeof registrarTiempoEstudio === "function") {
        registrarTiempoEstudio(5);
      }
      ultimoContadorTiempo = ahora;
    }

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

  // Ajustes de Desfase de Subtítulos y Estilos de Texto
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

  // Pantalla Completa
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

  // Atajos de Teclado
  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    const isEditingText = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT';

    if (isEditingText) return;

    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      togglePantallaCompleta();
    }

    if (!subtitulos || subtitulos.length === 0) return;

    const currentTime = video.currentTime;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (document.activeElement === video) video.blur();

      const nextSub = subtitulos.find(sub => (sub.inicio + timeOffset) > currentTime + 0.1);
      if (nextSub) video.currentTime = nextSub.inicio + timeOffset;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (document.activeElement === video) video.blur();

      const prevSub = subtitulos.slice().reverse().find(sub => (sub.inicio + timeOffset) < currentTime - 0.5);
      if (prevSub) {
        video.currentTime = prevSub.inicio + timeOffset;
      } else if (subtitulos.length > 0) {
        video.currentTime = subtitulos[0].inicio + timeOffset;
      }
    }
  });

  // Exportar SRT
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

  // Panel Configuración Ajustes
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
}


// ==========================================================================
// SECCIÓN 5: MÓDULO INTEGRACIÓN ANKI Y CAPTURA
// ==========================================================================
async function invokeAnki(action, version = 6, params = {}) {
  const isHttpsSite = window.location.protocol === "https:";
  const targetUrl = (ankiConfig.url || "http://127.0.0.1:8765").trim();

  // Lista de URLs candidatas a intentar (URL configurada + fallbacks locales)
  const candidateUrls = [targetUrl];
  if (targetUrl.includes("127.0.0.1") && !candidateUrls.includes(targetUrl.replace("127.0.0.1", "localhost"))) {
    candidateUrls.push(targetUrl.replace("127.0.0.1", "localhost"));
  } else if (targetUrl.includes("localhost") && !candidateUrls.includes(targetUrl.replace("localhost", "127.0.0.1"))) {
    candidateUrls.push(targetUrl.replace("localhost", "127.0.0.1"));
  }

  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, version, params }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      lastError = err;
      if (err.name === "AbortError") {
        console.warn(`AnkiConnect: Tiempo de espera agotado (3s) en ${url}`);
      } else {
        console.warn(`AnkiConnect: Error al conectar con ${url}:`, err);
      }
    }
  }

  let errorType = "OFFLINE";
  let mensajeError = "No se pudo conectar con Anki. Asegúrate de que Anki esté abierto y AnkiConnect (puerto 8765) activo.";

  if (lastError && lastError.name === "AbortError") {
    errorType = "TIMEOUT";
    mensajeError = "Tiempo de espera agotado (3s) al intentar conectar con Anki.";
  } else if (isHttpsSite) {
    errorType = "MIXED_CONTENT";
    mensajeError = "No se pudo conectar con Anki. Es posible que el navegador haya bloqueado la solicitud o estés esperando permitir el permiso.";
  }

  return {
    error: mensajeError,
    errorType: errorType,
    details: lastError ? lastError.message : undefined
  };
}

function initAnkiConfigModule() {
  const btnToggleAnki = document.getElementById("btn-toggle-anki-config");
  const panelAnki = document.getElementById("anki-config-panel");
  const btnSaveAnki = document.getElementById("btn-save-anki");
  const btnRefreshDecks = document.getElementById("btn-refresh-decks");
  const toggleEnabled = document.getElementById("anki-enabled-toggle");
  const inputUrl = document.getElementById("anki-url-input");

  if (toggleEnabled) toggleEnabled.checked = ankiConfig.enabled;
  if (inputUrl) inputUrl.value = ankiConfig.url || "http://127.0.0.1:8765";

  if (btnRefreshDecks) {
    btnRefreshDecks.addEventListener("click", cargarMazosAnki);
  }

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
      const selectDeck = document.getElementById("anki-deck-select");
      const selectModel = document.getElementById("anki-model-select");

      ankiConfig.enabled = toggleEnabled ? toggleEnabled.checked : true;
      ankiConfig.deck = selectDeck ? selectDeck.value : "Default";
      ankiConfig.model = selectModel ? selectModel.value : "ToriiDeck";
      ankiConfig.url = inputUrl && inputUrl.value.trim() ? inputUrl.value.trim() : "http://127.0.0.1:8765";

      localStorage.setItem("anki_enabled", ankiConfig.enabled);
      localStorage.setItem("anki_deck", ankiConfig.deck);
      localStorage.setItem("anki_model", ankiConfig.model);
      localStorage.setItem("anki_url", ankiConfig.url);

      if (panelAnki) panelAnki.classList.add("oculto");
      alert("¡Configuración de Anki guardada!");
      cargarMazosAnki();
    });
  }

  // Carga inicial
  cargarMazosAnki();
}

async function cargarMazosAnki() {
  const selectDeck = document.getElementById("anki-deck-select");
  const selectModel = document.getElementById("anki-model-select");
  const statusIndicator = document.getElementById("anki-status-indicator");
  const helpInfo = document.getElementById("anki-help-info");

  if (!selectDeck) return;

  const [resDecks, resModels] = await Promise.all([
    invokeAnki("deckNames"),
    invokeAnki("modelNames")
  ]);

  if (resDecks.error || !resDecks.result) {
    selectDeck.innerHTML = '<option value="Default">Default (Offline)</option>';
    if (selectModel) selectModel.innerHTML = '<option value="ToriiDeck">ToriiDeck (Offline)</option>';

    if (statusIndicator) {
      if (resDecks.errorType === "MIXED_CONTENT") {
        statusIndicator.textContent = "● Error HTTPS (Mixed Content)";
        statusIndicator.className = "anki-status warning";
      } else {
        statusIndicator.textContent = "● Sin conexión";
        statusIndicator.className = "anki-status offline";
      }
    }

    if (helpInfo) {
      helpInfo.style.display = "block";
      if (resDecks.errorType === "MIXED_CONTENT") {
        helpInfo.innerHTML = `<strong>⚠️ Bloqueo HTTPS / Mixed Content:</strong> Estás accediendo por HTTPS y el navegador bloquea <code>${ankiConfig.url}</code>.<br><br>💡 <em>Solución:</em> Abre la app web usando <strong>http://</strong> o utiliza un túnel/proxy HTTPS.`;
      } else {
        helpInfo.innerHTML = `<strong>⚠️ Sin conexión a AnkiConnect:</strong><br>1. Asegúrate de tener Anki abierto.<br>2. Instala el plugin <strong>AnkiConnect</strong> (código: <code>2055492159</code>).<br>3. En Anki -> Herramientas -> Complementos -> AnkiConnect -> Configuración, verifica que <code>webCorsOriginList</code> contenga <code>"*"</code>.`;
      }
    }
    return;
  }

  // Conexión exitosa
  if (statusIndicator) {
    statusIndicator.textContent = "● Conectado";
    statusIndicator.className = "anki-status online";
  }

  if (helpInfo) {
    helpInfo.style.display = "none";
    helpInfo.innerHTML = "";
  }

  // Cargar Mazos
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

  // Cargar Modelos (Note Types)
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

// Captura de fotograma
function capturarFotogramaVideo() {
  const videoEl = document.getElementById("main-video");
  if (!videoEl || videoEl.readyState < 2 || !videoEl.videoWidth) {
    console.warn("El video no está listo para captura de fotograma.");
    return null;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 360;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg", 0.85);
    return dataURL.replace(/^data:image\/jpeg;base64,/, "");
  } catch (err) {
    console.warn("No se pudo capturar el fotograma (posible bloqueo CORS o lienzo sucio):", err);
    return null;
  }
}

// Expuesto globalmente para exportar a AnkiConnect
window.enviarObjetoAAnki = async function(sub) {
  if (!ankiConfig || !ankiConfig.enabled) {
    throw new Error("La función de Anki está desactivada en los ajustes.");
  }

  const targetModel = ankiConfig.model || "ToriiDeck";

  // Obtener la lista real de campos del modelo configurado en Anki
  const modelFieldsRes = await invokeAnki("modelFieldNames", 6, { modelName: targetModel });

  if (modelFieldsRes.error || !modelFieldsRes.result) {
    throw new Error(`El modelo "${targetModel}" no existe en Anki: ${modelFieldsRes.error}`);
  }

  const camposReales = modelFieldsRes.result;
  let fieldsObj = {};

  // Inicializar todos los campos vacíos
  camposReales.forEach((campo) => { fieldsObj[campo] = ""; });

  // Limpieza de subtítulo para oración plana sin HTML
  const fraseLimpia = sub.texto
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .trim();

  const timestamp = Date.now();

  // Helper para coincidencia inteligente de nombres de campo (sin acentos, minúsculas y sin espacios)
  const encontrarCampo = (posiblesNombres) => {
    return camposReales.find((c) =>
      posiblesNombres.some((p) =>
        c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]/g, "") ===
        p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]/g, "")
      )
    );
  };

  // 1. Buscamos campos para Oración / Frente
  const campoIndice = encontrarCampo(["Indice", "Index", "ID", "Timestamp"]);
  const campoOracion = encontrarCampo(["Oracion", "Japones", "Japanese", "Front", "Texto", "Expression", "Sentence", "Pregunta", "Word", "Vocabulario"]);
  
  // 2. Buscamos campos para Lectura / Furigana / Reverso
  const campoFurigana = encontrarCampo(["Furigana", "Lectura", "Reading", "Back", "Respuesta", "Meaning", "Traduccion", "Contexto"]);
  
  // 3. Buscamos campos para Imagen / Captura
  const campoImagen = encontrarCampo(["Imagen", "Image", "Picture", "Snapshot", "Screenshot", "Fotograma", "Captura", "Media"]);

  // Asignaciones prioritarias
  if (campoIndice) fieldsObj[campoIndice] = `ToriiTV_${timestamp}`;
  if (campoOracion) fieldsObj[campoOracion] = fraseLimpia;
  if (campoFurigana) fieldsObj[campoFurigana] = sub.texto;

  // Garantía de no campos vacíos: Si el primer campo obligatorio sigue vacío, asignar la frase limpia
  if (camposReales[0] && !fieldsObj[camposReales[0]]) {
    fieldsObj[camposReales[0]] = fraseLimpia;
  }

  // Si existe un segundo campo y está vacío, asignar el furigana/texto completo
  if (camposReales[1] && !fieldsObj[camposReales[1]]) {
    fieldsObj[camposReales[1]] = sub.texto;
  }

  // Estructura principal de la nota
  const notePayload = {
    deckName: ankiConfig.deck || "Default",
    modelName: targetModel,
    fields: fieldsObj,
    tags: ["ToriiTV"],
    options: { allowDuplicate: true }
  };

  // Adjuntar fotograma en base64 si existe un campo de imagen
  const imgBase64 = capturarFotogramaVideo();
  if (imgBase64 && campoImagen) {
    notePayload.picture = [{
      data: imgBase64,
      filename: `toriideck_${timestamp}.jpg`,
      fields: [campoImagen]
    }];
  }

  // Envío final a AnkiConnect
  const res = await invokeAnki("addNote", 6, { note: notePayload });

  if (res.error) {
    console.error("Error devuelto por AnkiConnect:", res.error);
    throw new Error(res.error);
  }

  return res.result;
};


// ==========================================================================
// SECCIÓN 6: MÓDULO PERFIL DEL ESTUDIANTE Y LOGROS
// ==========================================================================
let userProfile = {
  nombre: "Estudiante Torii",
  avatar: "⛩️",
  nivelObjetivo: "JLPT N5",
  rachaDias: 1,
  ultimaFechaAcceso: new Date().toISOString().split("T")[0],
  tiempoEstudioSegundos: 0,
  totalTarjetasMinadas: 0,
  logros: []
};

const LOGROS_DEFINICION = [
  { id: "primer_minado", titulo: "Primer Paso", desc: "Minar tu primera tarjeta", icono: "🥉" },
  { id: "minero_novato", titulo: "Coleccionista", desc: "Minar 10 tarjetas", icono: "🥈" },
  { id: "torii_master", titulo: "Torii Master", desc: "Minar 50 tarjetas", icono: "🥇" },
  { id: "cinefilo", titulo: "Cinéfilo Japanese", desc: "Ver 10 min de video en ToriiTV", icono: "🎬" },
  { id: "racha_constante", titulo: "Constancia", desc: "Mantener 3 días de racha", icono: "🔥" }
];

function initUserProfileModule() {
  const guardado = localStorage.getItem("torii_user_profile");
  if (guardado) {
    try {
      userProfile = { ...userProfile, ...JSON.parse(guardado) };
    } catch (e) {
      console.warn("Error al cargar perfil de usuario:", e);
    }
  }

  // Actualizar racha diaria
  const hoy = new Date().toISOString().split("T")[0];
  if (userProfile.ultimaFechaAcceso !== hoy) {
    const fechaUltima = new Date(userProfile.ultimaFechaAcceso || hoy);
    const fechaHoy = new Date(hoy);
    const diffDias = Math.round((fechaHoy - fechaUltima) / (1000 * 60 * 60 * 24));
    
    if (diffDias === 1) {
      userProfile.rachaDias = (userProfile.rachaDias || 0) + 1;
    } else if (diffDias > 1) {
      userProfile.rachaDias = 1;
    }
    userProfile.ultimaFechaAcceso = hoy;
    guardarPerfil();
  }

  verificarLogros();

  // Listeners del modal de perfil
  const btnOpenProfile = document.getElementById("btn-open-profile");
  const modalProfile = document.getElementById("user-profile-modal");
  const btnCloseProfile = document.getElementById("btn-close-profile");

  if (btnOpenProfile && modalProfile) {
    btnOpenProfile.addEventListener("click", (e) => {
      e.preventDefault();
      renderUserProfileUI();
      modalProfile.classList.add("active");
    });
  }

  if (btnCloseProfile && modalProfile) {
    btnCloseProfile.addEventListener("click", () => {
      modalProfile.classList.remove("active");
    });
  }

  if (modalProfile) {
    modalProfile.addEventListener("click", (e) => {
      if (e.target === modalProfile) {
        modalProfile.classList.remove("active");
      }
    });
  }
}

function guardarPerfil() {
  localStorage.setItem("torii_user_profile", JSON.stringify(userProfile));
}

function registrarTiempoEstudio(segundos) {
  userProfile.tiempoEstudioSegundos = (userProfile.tiempoEstudioSegundos || 0) + segundos;
  guardarPerfil();
  verificarLogros();
}

function registrarTarjetaMinadaEnPerfil() {
  userProfile.totalTarjetasMinadas = (userProfile.totalTarjetasMinadas || 0) + 1;
  guardarPerfil();
  verificarLogros();
}

function verificarLogros() {
  let nuevosLogros = false;
  if (!userProfile.logros) userProfile.logros = [];

  if (userProfile.totalTarjetasMinadas >= 1 && !userProfile.logros.includes("primer_minado")) {
    userProfile.logros.push("primer_minado");
    nuevosLogros = true;
    mostrarToast("🏆 ¡Logro desbloqueado: Primer Paso!");
  }

  if (userProfile.totalTarjetasMinadas >= 10 && !userProfile.logros.includes("minero_novato")) {
    userProfile.logros.push("minero_novato");
    nuevosLogros = true;
    mostrarToast("🏆 ¡Logro desbloqueado: Coleccionista!");
  }

  if (userProfile.totalTarjetasMinadas >= 50 && !userProfile.logros.includes("torii_master")) {
    userProfile.logros.push("torii_master");
    nuevosLogros = true;
    mostrarToast("🏆 ¡Logro desbloqueado: Torii Master!");
  }

  if (userProfile.tiempoEstudioSegundos >= 600 && !userProfile.logros.includes("cinefilo")) {
    userProfile.logros.push("cinefilo");
    nuevosLogros = true;
    mostrarToast("🏆 ¡Logro desbloqueado: Cinéfilo Japanese!");
  }

  if (userProfile.rachaDias >= 3 && !userProfile.logros.includes("racha_constante")) {
    userProfile.logros.push("racha_constante");
    nuevosLogros = true;
    mostrarToast("🏆 ¡Logro desbloqueado: Constancia!");
  }

  if (nuevosLogros) {
    guardarPerfil();
  }
}

function renderUserProfileUI() {
  const nameText = document.getElementById("profile-name-text");
  const targetLevel = document.getElementById("profile-target-level");
  const cardsMined = document.getElementById("stat-cards-mined");
  const streakDays = document.getElementById("stat-streak-days");
  const studyTime = document.getElementById("stat-study-time");
  const badgesGrid = document.getElementById("badges-grid");

  if (nameText) nameText.textContent = userProfile.nombre || "Estudiante Torii";
  if (targetLevel) targetLevel.textContent = `Objetivo: ${userProfile.nivelObjetivo || "JLPT N5"}`;
  if (cardsMined) cardsMined.textContent = userProfile.totalTarjetasMinadas || 0;
  if (streakDays) streakDays.textContent = `${userProfile.rachaDias || 1} día${(userProfile.rachaDias || 1) > 1 ? "s" : ""}`;
  
  if (studyTime) {
    const mins = Math.floor((userProfile.tiempoEstudioSegundos || 0) / 60);
    studyTime.textContent = `${mins} min`;
  }

  if (badgesGrid) {
    badgesGrid.innerHTML = "";
    LOGROS_DEFINICION.forEach(logro => {
      const desbloqueado = (userProfile.logros || []).includes(logro.id);
      const card = document.createElement("div");
      card.className = `badge-card ${desbloqueado ? "unlocked" : ""}`;
      card.title = logro.desc;
      card.innerHTML = `
        <div class="badge-icon">${logro.icono}</div>
        <div class="badge-title">${logro.titulo}</div>
      `;
      badgesGrid.appendChild(card);
    });
  }
}


// ==========================================================================
// SECCIÓN 7: MÓDULO DE TARJETAS MINADAS Y EXPORTADOR ANKI
// ==========================================================================
let minedCardsList = [];

function initMinedCardsModule() {
  const guardado = localStorage.getItem("torii_mined_cards");
  if (guardado) {
    try {
      minedCardsList = JSON.parse(guardado);
    } catch (e) {
      console.warn("Error al cargar tarjetas minadas:", e);
      minedCardsList = [];
    }
  }

  renderMinedCardsUI();

  const btnExportTxt = document.getElementById("btn-export-anki-txt");
  const btnClearMined = document.getElementById("btn-clear-mined");

  if (btnExportTxt) {
    btnExportTxt.addEventListener("click", exportarListaAAnkiTxt);
  }

  if (btnClearMined) {
    btnClearMined.addEventListener("click", () => {
      if (minedCardsList.length === 0) return;
      if (confirm("¿Estás seguro de vaciar todas las tarjetas minadas de tu lista?")) {
        minedCardsList = [];
        guardarTarjetasMinadas();
        renderMinedCardsUI();
        mostrarToast("🗑️ Lista de tarjetas minadas vaciada");
      }
    });
  }
}

function guardarTarjetasMinadas() {
  localStorage.setItem("torii_mined_cards", JSON.stringify(minedCardsList));
}

function agregarTarjetaMinadaLocal(sub) {
  const timestamp = Date.now();
  const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

  const nuevaTarjeta = {
    id: `ToriiTV_${timestamp}`,
    oracion: fraseLimpia,
    furigana: sub.texto,
    tiempo: sub.inicio ? sub.inicio : 0,
    fecha: new Date().toLocaleDateString()
  };

  // Evitar duplicados exactos
  const yaExiste = minedCardsList.some(t => t.oracion === nuevaTarjeta.oracion);
  if (!yaExiste) {
    minedCardsList.unshift(nuevaTarjeta);
    guardarTarjetasMinadas();
    renderMinedCardsUI();
    registrarTarjetaMinadaEnPerfil();
  }

  mostrarToast("⭐ ¡Tarjeta agregada a tu lista!");
}

function eliminarTarjetaMinadaLocal(id) {
  minedCardsList = minedCardsList.filter(t => t.id !== id);
  guardarTarjetasMinadas();
  renderMinedCardsUI();
  mostrarToast("🗑️ Tarjeta eliminada de la lista");
}

function renderMinedCardsUI() {
  const badgeCount = document.getElementById("mined-count-badge");
  const gridContainer = document.getElementById("mined-cards-grid");

  if (badgeCount) {
    badgeCount.textContent = `${minedCardsList.length} tarjeta${minedCardsList.length !== 1 ? "s" : ""}`;
  }

  if (!gridContainer) return;

  if (minedCardsList.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-mined-msg" style="grid-column: 1 / -1;">
        <p>No tienes tarjetas minadas aún. Haz clic en la estrella <strong>⭐</strong> en los subtítulos para agregarlas a tu lista.</p>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = "";
  minedCardsList.forEach(tarjeta => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "mined-card-item";
    cardDiv.innerHTML = `
      <button class="mined-card-del" title="Eliminar de la lista" onclick="eliminarTarjetaMinadaLocal('${tarjeta.id}')">&times;</button>
      <span class="mined-card-time">⏱️ ${tarjeta.fecha || "Captura"}</span>
      <div class="mined-card-text">${tarjeta.furigana}</div>
    `;
    gridContainer.appendChild(cardDiv);
  });
}

function exportarListaAAnkiTxt() {
  if (minedCardsList.length === 0) {
    alert("No tienes ninguna tarjeta en tu lista para exportar.");
    return;
  }

  let contenido = "#separator:Tab\n#html:true\n#columns:Indice\tOracion\tFurigana\tTags\n";

  minedCardsList.forEach(t => {
    contenido += `${t.id}\t${t.oracion}\t${t.furigana}\tToriiTV\n`;
  });

  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ToriiTV_Tarjetas_Anki_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  mostrarToast("📥 Archivo para Anki descargado con éxito");
}

function mostrarToast(mensaje) {
  let toast = document.getElementById("torii-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "torii-toast";
    toast.className = "torii-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = mensaje;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Expuestos globalmente
window.eliminarTarjetaMinadaLocal = eliminarTarjetaMinadaLocal;