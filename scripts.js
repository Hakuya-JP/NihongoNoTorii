// ==========================================================================
// SECCIÓN 1: CONFIGURACIÓN GLOBAL Y PERSISTENCIA (ANKI)
// ==========================================================================
let ankiConfig = {
  enabled: localStorage.getItem("anki_enabled") !== "false",
  deck: localStorage.getItem("anki_deck") || "Default",
  model: localStorage.getItem("anki_model") || "ToriiTV",
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
        window.currentVideoFile = file;
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

  // Carga de Subtítulos (Japonés)
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
          asociarTraduccionesES();
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

  // Carga opcional de Subtítulos en Español (para tarjetas de Anki)
  const inputSubEs = document.getElementById("input-sub-es");
  let subtitulosES = [];

  if (inputSubEs) {
    inputSubEs.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();
        reader.onload = function(evt) {
          const textoCrudo = evt.target.result;
          subtitulosES = (extension === "ass" || extension === "ssa") ? parseASS(textoCrudo) : parseSRT(textoCrudo);
          asociarTraduccionesES();
          mostrarToast("💬 Subtítulo en español cargado para Anki");
        };
        reader.readAsText(file);
      }
    });
  }

  function asociarTraduccionesES() {
    if (!subtitulos || subtitulos.length === 0 || !subtitulosES || subtitulosES.length === 0) return;
    subtitulos.forEach(subJP => {
      const coincidencia = subtitulosES.find(subES => 
        (subES.inicio <= subJP.fin && subES.fin >= subJP.inicio)
      );
      if (coincidencia) {
        subJP.traduccion = coincidencia.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
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
    const fractionStr = (secondsParts[1] || "0").trim();
    const fraction = parseFloat("0." + fractionStr) || 0;

    return (parseInt(parts[0], 10) || 0) * 3600 + 
           (parseInt(parts[1], 10) || 0) * 60 + 
           sec + fraction;
  }

  function assTimeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    const secParts = parts[2].split('.');
    const sec = parseInt(secParts[0], 10) || 0;
    const fractionStr = (secParts[1] || "0").trim();
    const fraction = parseFloat("0." + fractionStr) || 0;

    return ((parseInt(parts[0], 10) || 0) * 3600) + 
           ((parseInt(parts[1], 10) || 0) * 60) + 
           sec + fraction;
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

          // Asegurar traducción al español para la tarjeta de Anki
          if (!sub.traduccion) {
            const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
            sub.traduccion = await obtenerTraduccionRapida(fraseLimpia);
          }

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
  const btnSubMinusFast = document.getElementById("btn-sub-minus-fast");
  const btnSubPlusFast = document.getElementById("btn-sub-plus-fast");

  const updateSyncOffset = (delta) => {
    timeOffset += delta;
    window.toriiTimeOffset = timeOffset;
    actualizarTiemposUI();
    const sign = timeOffset > 0 ? "+" : "";
    mostrarToast(`⏱️ Desfase de Sincro: ${sign}${timeOffset.toFixed(1)}s`);
  };

  if (btnSubPlusFast) btnSubPlusFast.addEventListener("click", () => updateSyncOffset(0.5));
  if (btnSubPlus) btnSubPlus.addEventListener("click", () => updateSyncOffset(0.1));
  if (btnSubMinus) btnSubMinus.addEventListener("click", () => updateSyncOffset(-0.1));
  if (btnSubMinusFast) btnSubMinusFast.addEventListener("click", () => updateSyncOffset(-0.5));

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
  const btnConnectAnki = document.getElementById("btn-connect-anki");
  const settingsGroup = document.getElementById("anki-settings-group");
  const btnSaveAnki = document.getElementById("btn-save-anki");
  const btnRefreshDecks = document.getElementById("btn-refresh-decks");
  const toggleEnabled = document.getElementById("anki-enabled-toggle");
  const inputUrl = document.getElementById("anki-url-input");
  const selectModel = document.getElementById("anki-model-select");

  if (toggleEnabled) toggleEnabled.checked = ankiConfig.enabled;
  if (inputUrl) inputUrl.value = ankiConfig.url || "http://127.0.0.1:8765";
  if (selectModel && ankiConfig.model) selectModel.value = ankiConfig.model;

  // Botón de Conexión Inicial (Desencadena el cartel emergente de permiso)
  if (btnConnectAnki) {
    btnConnectAnki.addEventListener("click", async () => {
      btnConnectAnki.innerHTML = "<span>⏳ Solicitando conexión con Anki...</span>";
      await cargarMazosAnki();
    });
  }

  if (btnRefreshDecks) {
    btnRefreshDecks.addEventListener("click", cargarMazosAnki);
  }

  if (btnToggleAnki && panelAnki) {
    btnToggleAnki.addEventListener("click", (e) => {
      e.stopPropagation();
      panelAnki.classList.toggle("oculto");
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

      ankiConfig.enabled = toggleEnabled ? toggleEnabled.checked : true;
      ankiConfig.deck = selectDeck ? selectDeck.value : "Default";
      ankiConfig.model = selectModel ? selectModel.value : "ToriiDeck";
      ankiConfig.url = inputUrl && inputUrl.value.trim() ? inputUrl.value.trim() : "http://127.0.0.1:8765";

      localStorage.setItem("anki_enabled", ankiConfig.enabled);
      localStorage.setItem("anki_deck", ankiConfig.deck);
      localStorage.setItem("anki_model", ankiConfig.model);
      localStorage.setItem("anki_url", ankiConfig.url);

      if (panelAnki) panelAnki.classList.add("oculto");
      mostrarToast("⚙️ Ajustes de Anki guardados");
    });
  }
}

async function cargarMazosAnki() {
  const selectDeck = document.getElementById("anki-deck-select");
  const statusIndicator = document.getElementById("anki-status-indicator");
  const helpInfo = document.getElementById("anki-help-info");
  const btnConnectAnki = document.getElementById("btn-connect-anki");
  const settingsGroup = document.getElementById("anki-settings-group");

  if (!selectDeck) return;

  const resDecks = await invokeAnki("deckNames");

  if (resDecks.error || !resDecks.result) {
    selectDeck.innerHTML = '<option value="Default">Default (Offline)</option>';

    if (statusIndicator) {
      statusIndicator.textContent = "● Desconectado";
      statusIndicator.className = "anki-status offline";
    }

    if (btnConnectAnki) {
      btnConnectAnki.style.display = "flex";
      btnConnectAnki.innerHTML = "<span>🔗 Reintentar Conexión a Anki</span>";
    }

    if (settingsGroup) settingsGroup.style.display = "none";

    if (helpInfo) {
      helpInfo.style.display = "block";
      if (resDecks.errorType === "MIXED_CONTENT") {
        helpInfo.innerHTML = `<strong>⚠️ Solicitud de Permiso / Conexión:</strong> Si el navegador o Anki abrió una ventana emergente pidiendo permiso, haz clic en <strong>Permitir</strong>.<br><br>💡 Si usas HTTPS, abre la app desde <strong>http://</strong> o permite contenido no seguro en los ajustes de URL.`;
      } else {
        helpInfo.innerHTML = `<strong>⚠️ Anki no responde:</strong><br>1. Asegúrate de tener Anki abierto.<br>2. Revisa que el complemento <strong>AnkiConnect</strong> (código: <code>2055492159</code>) esté instalado.`;
      }
    }
    return;
  }

  // Conexión exitosa
  if (statusIndicator) {
    statusIndicator.textContent = "● Conectado";
    statusIndicator.className = "anki-status online";
  }

  if (btnConnectAnki) {
    btnConnectAnki.style.display = "none";
  }

  if (settingsGroup) {
    settingsGroup.style.display = "block";
  }

  if (helpInfo) {
    helpInfo.style.display = "none";
    helpInfo.innerHTML = "";
  }

  // Cargar Mazos detectados de Anki
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

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return window.btoa(binary);
}

async function capturarAudioConMediaRecorder(videoSource, startSec, durationSec) {
  return new Promise((resolve) => {
    try {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "auto";
      tempVideo.muted = false;
      tempVideo.volume = 0.0001;

      const objectUrl = (videoSource instanceof File || videoSource instanceof Blob) 
        ? URL.createObjectURL(videoSource) 
        : videoSource;
      
      tempVideo.src = objectUrl;

      const cleanup = () => {
        try {
          tempVideo.pause();
          tempVideo.removeAttribute("src");
          tempVideo.load();
          if (typeof objectUrl === "string" && objectUrl.startsWith("blob:")) {
            URL.revokeObjectURL(objectUrl);
          }
        } catch (e) {}
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, Math.max(6000, (durationSec + 4) * 1000));

      tempVideo.addEventListener("loadedmetadata", () => {
        tempVideo.currentTime = Math.max(0, startSec);
      });

      tempVideo.addEventListener("seeked", () => {
        try {
          const stream = tempVideo.captureStream ? tempVideo.captureStream() : (tempVideo.mozCaptureStream ? tempVideo.mozCaptureStream() : null);
          if (!stream || stream.getAudioTracks().length === 0) {
            clearTimeout(timeout);
            cleanup();
            resolve(null);
            return;
          }

          const audioStream = new MediaStream(stream.getAudioTracks());
          let mimeType = "";
          if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
          else if (MediaRecorder.isTypeSupported("audio/ogg")) mimeType = "audio/ogg";
          else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";

          const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
          const chunks = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = async () => {
            clearTimeout(timeout);
            cleanup();
            if (chunks.length === 0) {
              resolve(null);
              return;
            }
            const audioBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const base64 = arrayBufferToBase64(arrayBuffer);
            const ext = (recorder.mimeType || "").includes("ogg") ? "ogg" : ((recorder.mimeType || "").includes("mp4") ? "m4a" : "webm");
            resolve({ base64, ext });
          };

          recorder.start();
          tempVideo.play().catch(() => {});

          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, Math.max(500, durationSec * 1000));

        } catch (errCapture) {
          clearTimeout(timeout);
          cleanup();
          resolve(null);
        }
      }, { once: true });

    } catch (errSetup) {
      resolve(null);
    }
  });
}

// Recorte de fragmentos de Audio (Intento 1: WebAudio API / Intento 2: MediaRecorder captureStream)
async function extraerAudioSubtitulo(file, inicioSec, finSec) {
  if (!file || typeof inicioSec !== "number" || typeof finSec !== "number" || finSec <= inicioSec) return null;
  
  const padding = 0.25;
  const startReal = Math.max(0, inicioSec - padding);
  const endReal = finSec + padding;
  const durationSec = endReal - startReal;

  // Intento 1: Decodificación directa de AudioContext
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();

    const audioBuffer = await new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(arrayBuffer.slice(0), resolve, err => reject(err));
    });

    if (audioBuffer) {
      const sampleRate = audioBuffer.sampleRate;
      const channels = audioBuffer.numberOfChannels;
      const startSample = Math.max(0, Math.floor(startReal * sampleRate));
      const endSample = Math.min(audioBuffer.length, Math.ceil(endReal * sampleRate));
      const frameCount = endSample - startSample;

      if (frameCount > 0) {
        const bytesPerSample = 2;
        const blockAlign = channels * bytesPerSample;
        const dataSize = frameCount * blockAlign;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        const writeString = (v, offset, str) => {
          for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i));
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        let offset = 44;
        const channelData = [];
        for (let c = 0; c < channels; c++) channelData.push(audioBuffer.getChannelData(c));

        for (let i = 0; i < frameCount; i++) {
          for (let c = 0; c < channels; c++) {
            const sample = Math.max(-1, Math.min(1, channelData[c][startSample + i] || 0));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
          }
        }
        return { base64: arrayBufferToBase64(buffer), ext: "wav" };
      }
    }
  } catch (errDecode) {
    console.warn("Intento 1 (decodeAudioData) omitido por formato de contenedor video. Ejecutando Intento 2 (MediaRecorder capture)...");
  }

  // Intento 2: Captura en segundo plano con MediaRecorder
  try {
    const resCapture = await capturarAudioConMediaRecorder(file, startReal, durationSec);
    if (resCapture && resCapture.base64) {
      return resCapture;
    }
  } catch (errCap) {
    console.warn("Fallo en Intento 2 de captura de audio:", errCap);
  }

  return null;
}

// Expuesto globalmente para exportar a AnkiConnect
async function asegurarModeloToriiTVEnAnki(userModels) {
  const yaExiste = userModels.some(m => m.toLowerCase().replace(/[\s_]/g, "") === "toriitv");
  if (yaExiste) return "ToriiTV";

  try {
    const resCreate = await invokeAnki("createModel", 6, {
      modelName: "ToriiTV",
      inOrderFields: ["Indice", "Instrucciones", "Oracion", "Furigana", "Audio", "Imagen", "Traduccion"],
      css: `.card { font-family: "Segoe UI", "Noto Sans JP", sans-serif; background-color: #0b2f3a; color: #ffffff; text-align: center; }\n.flashcard { max-width: 100%; margin: 0 auto; background: #103f4f; border-radius: 28px; padding: 35px; box-shadow: 0 10px 20px rgba(0,0,0,.35); position: relative; box-sizing: border-box; }\n.instructions { font-size: 20px; margin-bottom: 20px; padding: 12px 18px; background: rgba(255, 255, 255, 0.08); border-radius: 14px; line-height: 1.5; color: #FFDEBD; font-weight: 600; }\n.sentence-front { font-size: 42px; line-height: 1.7; font-weight: bold; color: #ffffff; margin: 20px 0; }\nimg { max-width: 75%; max-height: 420px; object-fit: contain; border-radius: 16px; margin: 20px auto; display: block; box-shadow: 0 6px 16px rgba(0,0,0,0.3); }\n.sentenceBox { position: relative; margin-top: 24px; padding: 10px 60px 18px; }\n.sentence { font-size: 38px; line-height: 1.8; text-align: center; word-break: keep-all; }\nruby rt { font-size: 20px; color: #FFDEBD; }\n.buttonsColumn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 12px; }\n.icon { width: 38px; height: 38px; border-radius: 50%; background: #146482; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; transition: transform 0.2s ease, background 0.2s ease; }\n.icon:hover { background: #ff9447; transform: scale(1.08); }\n.audio-hidden { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; overflow: hidden; }\n.translation { font-size: 24px; line-height: 1.6; color: #FFDEBD; margin-top: 16px; }\n.hidden { display: none !important; }\n.card-index-badge { position: absolute; bottom: 12px; left: 20px; font-size: 13px; opacity: 0.5; color: #93c0de; }\n@media (max-width: 750px) { .flashcard { padding: 20px; } .instructions { font-size: 16px; } .sentence-front { font-size: 26px; } .sentenceBox { padding: 5px; } .sentence { font-size: 22px; line-height: 1.7; white-space: normal; word-break: keep-all; } ruby rt { font-size: 11px; } .buttonsColumn { position: static; transform: none; flex-direction: row; justify-content: center; margin-top: 16px; } .icon { width: 36px; height: 36px; } .translation { font-size: 18px; } }`,
      cardTemplates: [
        {
          Name: "ToriiTV",
          Front: `<div class="flashcard">\n  {{#Instrucciones}}\n  <div class="instructions">\n    {{Instrucciones}}\n  </div>\n  {{/Instrucciones}}\n  <div class="front">\n    <div class="sentence-front">{{Oracion}}</div>\n  </div>\n</div>`,
          Back: `<div class="flashcard">\n  <div class="front">\n    <div class="sentence-front">{{Oracion}}</div>\n  </div>\n  <div class="back">\n    {{#Imagen}}\n    <div class="imageBox">\n      {{Imagen}}\n    </div>\n    {{/Imagen}}\n    <div class="sentenceBox">\n      <div id="sentencePlain" class="sentence">\n        {{Oracion}}\n      </div>\n      <div id="sentenceFuri" class="sentence hidden">\n        {{furigana:Furigana}}\n      </div>\n      <div class="buttonsColumn">\n        <div class="icon" onclick="toggleFuri()" title="Mostrar/Ocultar Furigana">👁</div>\n        {{#Audio}}<div class="icon" onclick="playAudio()" title="Reproducir Audio">▶</div>{{/Audio}}\n        {{#Traduccion}}<div class="icon" onclick="toggleTrad()" title="Mostrar Traducción">ES</div>{{/Traduccion}}\n      </div>\n    </div>\n    {{#Audio}}\n    <div id="audio" class="audio-hidden">\n      {{Audio}}\n    </div>\n    {{/Audio}}\n    {{#Traduccion}}\n    <div id="trad" class="translation hidden">\n      {{Traduccion}}\n    </div>\n    {{/Traduccion}}\n    {{#Indice}}\n    <div class="card-index-badge">#{{Indice}}</div>\n    {{/Indice}}\n  </div>\n</div>\n<script>\nfunction toggleFuri() { var plain = document.getElementById("sentencePlain"); var furi = document.getElementById("sentenceFuri"); if (plain && furi) { var estaOculto = furi.classList.contains("hidden"); plain.classList.toggle("hidden", estaOculto); furi.classList.toggle("hidden", !estaOculto); } }\nfunction playAudio() { var btn = document.querySelector("#audio .soundLink, #audio .replaybutton, #audio .replay-button, #audio a"); if (btn) { btn.click(); } }\nfunction toggleTrad() { var t = document.getElementById("trad"); if (t) { t.classList.toggle("hidden"); } }\n</script>`
        }
      ]
    });
    if (resCreate && !resCreate.error) {
      console.log("¡Modelo ToriiTV creado automáticamente en Anki!");
      return "ToriiTV";
    }
  } catch (err) {
    console.warn("No se pudo auto-crear el modelo ToriiTV en Anki:", err);
  }
  return null;
}

window.enviarObjetoAAnki = async function(sub) {
  if (!ankiConfig || !ankiConfig.enabled) {
    throw new Error("La función de Anki está desactivada en los ajustes.");
  }

  let selectedPreset = ankiConfig.model || "ToriiTV";
  
  // Obtener todos los modelos existentes en el Anki del usuario
  const allModelsRes = await invokeAnki("modelNames");
  if (allModelsRes.error || !allModelsRes.result || allModelsRes.result.length === 0) {
    throw new Error("No se pudieron consultar los tipos de tarjeta en Anki.");
  }

  const userModels = allModelsRes.result;
  
  // Intentar asegurar/crear automáticamente el modelo ToriiTV en Anki si no existe
  let realModelName = await asegurarModeloToriiTVEnAnki(userModels);

  if (!realModelName) {
    realModelName = userModels.find(m => 
      m.toLowerCase().replace(/[\s_]/g, "") === selectedPreset.toLowerCase().replace(/[\s_]/g, "")
    );
  }

  // Si el preestablecido no existe exactamente con ese nombre, buscar alternativos estándar
  if (!realModelName) {
    if (selectedPreset === "ToriiTV" || selectedPreset === "ToriiDeck") {
      realModelName = userModels.find(m => ["toriitv", "toriideck", "basic", "basico", "básico"].includes(m.toLowerCase()));
    } else if (selectedPreset === "Basic" || selectedPreset === "BasicImage") {
      realModelName = userModels.find(m => ["basic", "basico", "básico"].includes(m.toLowerCase()));
    } else if (selectedPreset === "Japanese") {
      realModelName = userModels.find(m => ["japanese", "japones", "japonés"].includes(m.toLowerCase()));
    }
  }

  // Si aún no se encuentra, usar el primer modelo disponible en Anki
  if (!realModelName) {
    realModelName = userModels[0];
  }

  // Obtener la lista real de campos del modelo elegido
  const modelFieldsRes = await invokeAnki("modelFieldNames", 6, { modelName: realModelName });
  if (modelFieldsRes.error || !modelFieldsRes.result) {
    throw new Error(`Error al leer los campos del modelo "${realModelName}": ${modelFieldsRes.error}`);
  }

  const camposReales = modelFieldsRes.result;
  let fieldsObj = {};

  camposReales.forEach((campo) => { fieldsObj[campo] = ""; });

  const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
  const timestamp = Date.now();
  const numeroIndice = (minedCardsList ? minedCardsList.length + 1 : 1);

  const encontrarCampo = (posiblesNombres) => {
    return camposReales.find((c) =>
      posiblesNombres.some((p) =>
        c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]/g, "") ===
        p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]/g, "")
      )
    );
  };

  const campoIndice = encontrarCampo(["Indice", "Index", "ID", "Counter", "Numero"]);
  const campoInstrucciones = encontrarCampo(["Instrucciones", "Instructions", "Instruccion", "Indicacion"]);
  const campoOracion = encontrarCampo(["Oracion", "Sentence", "Expression", "Texto", "Japones", "Japanese", "Front", "Pregunta", "Frente"]);
  const campoFurigana = encontrarCampo(["Furigana", "Reading", "Lectura", "Back", "Respuesta", "Meaning", "Traduccion", "Reverso"]);
  const campoImagen = encontrarCampo(["Imagen", "Image", "Picture", "Snapshot", "Screenshot", "Fotograma", "Captura", "Media"]);
  const campoAudio = encontrarCampo(["Audio", "Sonido", "Sound"]);
  const campoTraduccion = encontrarCampo(["Traduccion", "Translation", "Significado", "Español", "Spanish"]);

  if (campoIndice) fieldsObj[campoIndice] = `${numeroIndice}`;
  if (campoInstrucciones) fieldsObj[campoInstrucciones] = "¿Qué significa la siguiente palabra o frase?";
  if (campoOracion) fieldsObj[campoOracion] = fraseLimpia;
  if (campoFurigana) fieldsObj[campoFurigana] = sub.texto;
  if (campoTraduccion && sub.traduccion) fieldsObj[campoTraduccion] = sub.traduccion;

  // Fallbacks si los nombres no coincidieron exactamente
  if (camposReales[0] && !fieldsObj[camposReales[0]]) {
    fieldsObj[camposReales[0]] = fraseLimpia;
  }
  // Extracción del fragmento de Audio del video en tiempo real (aplicando desfase de sincronización)
  const videoEl = document.getElementById("main-video");
  let videoSource = window.currentVideoFile;
  if (!videoSource && videoEl && videoEl.src && videoEl.src.startsWith("blob:")) {
    try {
      const resp = await fetch(videoEl.src);
      videoSource = await resp.blob();
    } catch (errBlob) {
      console.warn("No se pudo obtener el blob del video para la extracción de audio:", errBlob);
    }
  }

  const destinoAudioCampo = campoAudio || campoFurigana || campoOracion || (camposReales[1] || camposReales[0]);

  if (videoSource && destinoAudioCampo && typeof sub.inicio === "number" && typeof sub.fin === "number") {
    try {
      const currentOffset = window.toriiTimeOffset || 0;
      const audioRes = await extraerAudioSubtitulo(videoSource, sub.inicio + currentOffset, sub.fin + currentOffset);
      if (audioRes && audioRes.base64) {
        const ext = audioRes.ext || "wav";
        const audioFilename = `toriitv_audio_${timestamp}.${ext}`;
        const resAudio = await invokeAnki("storeMediaFile", 6, {
          filename: audioFilename,
          data: audioRes.base64
        });
        if (resAudio && !resAudio.error) {
          const soundTag = `[sound:${audioFilename}]`;
          if (campoAudio) {
            fieldsObj[campoAudio] = soundTag;
          } else {
            fieldsObj[destinoAudioCampo] = fieldsObj[destinoAudioCampo] ? `${fieldsObj[destinoAudioCampo]}<br>${soundTag}` : soundTag;
          }
          console.log(`🔊 Audio recortado adjuntado exitosamente en el campo "${destinoAudioCampo}": ${soundTag}`);
        } else {
          console.warn("AnkiConnect devolvió error al guardar archivo de medio audio:", resAudio ? resAudio.error : "Sin respuesta");
        }
      } else {
        console.warn("extraerAudioSubtitulo devolvió null (fallo de decodificación de audio)");
      }
    } catch (errAudio) {
      console.warn("No se pudo extraer o guardar el audio del subtítulo:", errAudio);
    }
  } else {
    console.warn("No se inició la extracción de audio:", {
      tieneVideoSource: !!videoSource,
      destinoAudioCampo: destinoAudioCampo,
      subInicio: sub.inicio,
      subFin: sub.fin
    });
  }

  const notePayload = {
    deckName: ankiConfig.deck || "Default",
    modelName: realModelName,
    fields: fieldsObj,
    tags: ["ToriiTV"],
    options: { allowDuplicate: true }
  };

  const imgBase64 = capturarFotogramaVideo();
  if (imgBase64 && campoImagen) {
    notePayload.picture = [{
      data: imgBase64,
      filename: `toriitv_${timestamp}.jpg`,
      fields: [campoImagen]
    }];
  }

  const res = await invokeAnki("addNote", 6, { note: notePayload });

  if (res.error) {
    console.error("Error devuelto por AnkiConnect:", res.error);
    throw new Error(res.error);
  }

  return res.result;
};


// ==========================================================================
// SECCIÓN 6: MÓDULO PERFIL DEL ESTUDIANTE Y PERSONALIZACIÓN
// ==========================================================================
let userProfile = {
  nombre: "Estudiante Torii",
  avatar: "⛩️",
  nivelObjetivo: "JLPT N5",
  lema: "¡Paso a paso hacia el dominio del japonés! ⛩️",
  metaDiariaMin: 15,
  rachaDias: 1,
  ultimaFechaAcceso: new Date().toISOString().split("T")[0],
  tiempoEstudioSegundos: 0,
  totalTarjetasMinadas: 0,
  logros: []
};

let avatarSeleccionadoTemporal = null;

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
  renderUserProfileUI();

  // Listeners del modal de personalización de perfil
  const btnOpenEditModal = document.getElementById("btn-open-edit-modal");
  const btnEditAvatarBadge = document.getElementById("btn-edit-profile");
  const modalEditProfile = document.getElementById("edit-profile-modal");
  const btnCloseEditModal = document.getElementById("btn-close-edit-modal");
  const btnCancelEdit = document.getElementById("btn-cancel-edit-profile");

  if (btnOpenEditModal) btnOpenEditModal.addEventListener("click", abrirModalEditarPerfil);
  if (btnEditAvatarBadge) btnEditAvatarBadge.addEventListener("click", abrirModalEditarPerfil);
  if (btnCloseEditModal) btnCloseEditModal.addEventListener("click", cerrarModalEditarPerfil);
  if (btnCancelEdit) btnCancelEdit.addEventListener("click", cerrarModalEditarPerfil);

  if (modalEditProfile) {
    modalEditProfile.addEventListener("click", (e) => {
      if (e.target === modalEditProfile) {
        cerrarModalEditarPerfil();
      }
    });
  }

  // Selector de avatares predefinidos
  const avatarButtons = document.querySelectorAll(".avatar-option-btn");
  avatarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      avatarButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      avatarSeleccionadoTemporal = btn.getAttribute("data-avatar");
      const customInput = document.getElementById("input-custom-avatar");
      if (customInput) customInput.value = "";
    });
  });

  // Listener para subida de imagen de archivo local
  const inputFileAvatar = document.getElementById("input-file-avatar");
  if (inputFileAvatar) {
    inputFileAvatar.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          avatarSeleccionadoTemporal = evt.target.result;
          avatarButtons.forEach(b => b.classList.remove("selected"));
          const customInput = document.getElementById("input-custom-avatar");
          if (customInput) customInput.value = "";
          mostrarToast("🖼️ Imagen local cargada");
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function abrirModalEditarPerfil() {
  const modal = document.getElementById("edit-profile-modal");
  if (!modal) return;

  const inputName = document.getElementById("input-profile-name");
  const selectLevel = document.getElementById("select-profile-level");
  const inputMotto = document.getElementById("input-profile-motto");
  const selectGoal = document.getElementById("select-profile-goal");
  const customAvatarInput = document.getElementById("input-custom-avatar");

  if (inputName) inputName.value = userProfile.nombre || "Estudiante Torii";
  if (selectLevel) selectLevel.value = userProfile.nivelObjetivo || "JLPT N5";
  if (inputMotto) inputMotto.value = userProfile.lema || "";
  if (selectGoal) selectGoal.value = userProfile.metaDiariaMin || 15;
  
  avatarSeleccionadoTemporal = userProfile.avatar || "⛩️";

  // Resaltar botón de avatar activo
  const avatarButtons = document.querySelectorAll(".avatar-option-btn");
  let encontrado = false;
  avatarButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (btn.getAttribute("data-avatar") === avatarSeleccionadoTemporal) {
      btn.classList.add("selected");
      encontrado = true;
    }
  });

  if (!encontrado && customAvatarInput) {
    customAvatarInput.value = avatarSeleccionadoTemporal;
  } else if (customAvatarInput) {
    customAvatarInput.value = "";
  }

  modal.classList.add("active");
}

function cerrarModalEditarPerfil() {
  const modal = document.getElementById("edit-profile-modal");
  if (modal) modal.classList.remove("active");
}

function guardarEdicionPerfil() {
  const inputName = document.getElementById("input-profile-name");
  const selectLevel = document.getElementById("select-profile-level");
  const inputMotto = document.getElementById("input-profile-motto");
  const selectGoal = document.getElementById("select-profile-goal");
  const customAvatarInput = document.getElementById("input-custom-avatar");

  const nuevoNombre = inputName && inputName.value.trim() ? inputName.value.trim() : "Estudiante Torii";
  const nuevoNivel = selectLevel ? selectLevel.value : "JLPT N5";
  const nuevoLema = inputMotto ? inputMotto.value.trim() : "";
  const nuevaMeta = selectGoal ? parseInt(selectGoal.value, 10) : 15;

  let nuevoAvatar = avatarSeleccionadoTemporal || "⛩️";
  if (customAvatarInput && customAvatarInput.value.trim()) {
    nuevoAvatar = customAvatarInput.value.trim();
  }

  userProfile.nombre = nuevoNombre;
  userProfile.nivelObjetivo = nuevoNivel;
  userProfile.lema = nuevoLema;
  userProfile.metaDiariaMin = nuevaMeta;
  userProfile.avatar = nuevoAvatar;

  guardarPerfil();
  cerrarModalEditarPerfil();
  renderUserProfileUI();
  mostrarToast("✨ ¡Perfil personalizado con éxito!");
}

function guardarPerfil() {
  localStorage.setItem("torii_user_profile", JSON.stringify(userProfile));
}

function registrarTiempoEstudio(segundos) {
  userProfile.tiempoEstudioSegundos = (userProfile.tiempoEstudioSegundos || 0) + segundos;
  guardarPerfil();
  verificarLogros();
  renderUserProfileUI();
}

function registrarTarjetaMinadaEnPerfil() {
  userProfile.totalTarjetasMinadas = (userProfile.totalTarjetasMinadas || 0) + 1;
  guardarPerfil();
  verificarLogros();
  renderUserProfileUI();
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
  const avatarDisplay = document.getElementById("profile-avatar-display");
  const nameText = document.getElementById("profile-name-text");
  const targetLevel = document.getElementById("profile-target-level");
  const mottoText = document.getElementById("profile-motto-text");
  const streakBadge = document.getElementById("profile-streak-badge");
  const goalBadge = document.getElementById("profile-goal-badge");

  const cardsMined = document.getElementById("stat-cards-mined");
  const streakDays = document.getElementById("stat-streak-days");
  const studyTime = document.getElementById("stat-study-time");
  const dailyProgressText = document.getElementById("stat-daily-progress-text");
  const dailyProgressBar = document.getElementById("stat-daily-progress-bar");

  const badgesGrid = document.getElementById("badges-grid");
  const badgesUnlockedCount = document.getElementById("badges-unlocked-count");

  // Renderizar Avatar de la página principal (perfil.html)
  if (avatarDisplay) {
    const isUrl = userProfile.avatar && (userProfile.avatar.startsWith("http://") || userProfile.avatar.startsWith("https://") || userProfile.avatar.startsWith("data:image/"));
    if (isUrl) {
      avatarDisplay.innerHTML = `<img src="${userProfile.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      avatarDisplay.textContent = userProfile.avatar || "⛩️";
    }
  }

  // Renderizar Avatar en la barra de navegación superior (Global en todas las páginas)
  const navAvatarBox = document.getElementById("nav-avatar-box");
  if (navAvatarBox) {
    const isUrl = userProfile.avatar && (userProfile.avatar.startsWith("http://") || userProfile.avatar.startsWith("https://") || userProfile.avatar.startsWith("data:image/"));
    if (isUrl) {
      navAvatarBox.innerHTML = `<img src="${userProfile.avatar}" alt="Perfil" class="nav-avatar-img">`;
    } else {
      navAvatarBox.textContent = userProfile.avatar || "⛩️";
    }
  }

  if (nameText) nameText.textContent = userProfile.nombre || "Estudiante Torii";
  if (targetLevel) targetLevel.textContent = `Objetivo: ${userProfile.nivelObjetivo || "JLPT N5"}`;
  if (mottoText) mottoText.textContent = userProfile.lema ? `"${userProfile.lema}"` : '"¡Paso a paso hacia el aprendizaje del japonés! ⛩️"';
  
  if (streakBadge) streakBadge.textContent = `🔥 ${userProfile.rachaDias || 1} día${(userProfile.rachaDias || 1) > 1 ? "s" : ""} de racha`;
  if (goalBadge) goalBadge.textContent = `🎯 Meta: ${userProfile.metaDiariaMin || 15} min/día`;

  if (cardsMined) cardsMined.textContent = userProfile.totalTarjetasMinadas || 0;
  if (streakDays) streakDays.textContent = `${userProfile.rachaDias || 1} día${(userProfile.rachaDias || 1) > 1 ? "s" : ""}`;
  
  const minutosEstudio = Math.floor((userProfile.tiempoEstudioSegundos || 0) / 60);
  if (studyTime) {
    studyTime.textContent = `${minutosEstudio} min`;
  }

  // Progreso de meta diaria
  const metaMin = userProfile.metaDiariaMin || 15;
  const porcentajeMeta = Math.min(100, Math.round((minutosEstudio / metaMin) * 100));
  if (dailyProgressText) dailyProgressText.textContent = `${porcentajeMeta}%`;
  if (dailyProgressBar) dailyProgressBar.style.width = `${porcentajeMeta}%`;

  // Logros y Medallas
  if (badgesGrid) {
    badgesGrid.innerHTML = "";
    let desbloqueados = 0;
    LOGROS_DEFINICION.forEach(logro => {
      const desbloqueado = (userProfile.logros || []).includes(logro.id);
      if (desbloqueado) desbloqueados++;
      const card = document.createElement("div");
      card.className = `badge-card ${desbloqueado ? "unlocked" : ""}`;
      card.title = logro.desc;
      card.innerHTML = `
        <div class="badge-icon">${logro.icono}</div>
        <div class="badge-title">${logro.titulo}</div>
        <div class="badge-desc">${logro.desc}</div>
      `;
      badgesGrid.appendChild(card);
    });

    if (badgesUnlockedCount) {
      badgesUnlockedCount.textContent = `${desbloqueados} / ${LOGROS_DEFINICION.length} desbloqueados`;
    }
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

async function obtenerTraduccionRapida(textoJapones) {
  if (!textoJapones || !textoJapones.trim()) return "";
  try {
    const frase = textoJapones.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=es&dt=t&q=${encodeURIComponent(frase)}`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0].map(item => item[0]).filter(Boolean).join(" ");
    }
  } catch (err) {
    console.warn("No se pudo obtener la traducción automática:", err);
  }
  return "";
}

function agregarTarjetaMinadaLocal(sub) {
  const timestamp = Date.now();
  const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

  const nuevaTarjeta = {
    id: `ToriiTV_${timestamp}`,
    oracion: fraseLimpia,
    furigana: sub.texto,
    traduccion: sub.traduccion || "",
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
    const tradHtml = tarjeta.traduccion ? `<div class="mined-card-trad" style="font-size: 0.85rem; opacity: 0.85; color: var(--crema2); margin-top: 4px;">ES: ${tarjeta.traduccion}</div>` : '';
    cardDiv.innerHTML = `
      <button class="mined-card-del" title="Eliminar de la lista" onclick="eliminarTarjetaMinadaLocal('${tarjeta.id}')">&times;</button>
      <span class="mined-card-time">⏱️ ${tarjeta.fecha || "Captura"}</span>
      <div class="mined-card-text">${tarjeta.furigana}</div>
      ${tradHtml}
    `;
    gridContainer.appendChild(cardDiv);
  });
}

function exportarListaAAnkiTxt() {
  if (minedCardsList.length === 0) {
    alert("No tienes ninguna tarjeta en tu lista para exportar.");
    return;
  }

  let contenido = "#separator:Tab\n#html:true\n#columns:Indice\tOracion\tFurigana\tTraduccion\tTags\n";

  minedCardsList.forEach(t => {
    contenido += `${t.id}\t${t.oracion}\t${t.furigana}\t${t.traduccion || ""}\tToriiTV\n`;
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