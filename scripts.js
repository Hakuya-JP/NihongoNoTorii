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
// MÓDULO DEL REPRODUCTOR DE SUBTÍTULOS INTERACTIVO
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
    subListContainer.addEventListener("click", () => {
      if (subtitulos.length === 0 && inputSub) inputSub.click(); 
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
              <p class="sub-placeholder" style="margin: 0; font-weight: bold; font-size: 0.95rem;"><h2>✅ Video cargado.</h2></p>
              <p class="sub-placeholder" style="margin-top: 6px; font-size: 0.85rem; opacity: 0.8;"><h3>Da clic aquí para subir los subtítulos (.srt, .vtt, .ass)</h3></p>
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
    return (parseInt(parts[0], 10) || 0) * 3600 + 
           (parseInt(parts[1], 10) || 0) * 60 + 
           (parseInt(secondsParts[0], 10) || 0) + 
           (parseInt(secondsParts[1], 10) || 0) / 1000;
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
        <div>${sub.texto}</div>
      `;

      lineDiv.addEventListener("click", () => {
        video.currentTime = sub.inicio + timeOffset;
        video.play();
      });

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
  
  // Alternar visibilidad de fondo
  if (btnToggleBg && overlaySub) {
    btnToggleBg.addEventListener("click", () => {
      overlaySub.classList.toggle("sin-fondo");
      btnToggleBg.classList.toggle("active-tool");
    });
  }
  
  if (fontSelect && overlaySub) fontSelect.addEventListener("change", (e) => overlaySub.style.fontFamily = e.target.value);
  
  // Modificar color de fondo dinámicamente mediante Variable CSS
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

  // Atajo de teclado: Tecla 'F'
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

  // ==========================================================================
  // NAVEGACIÓN DE SUBTÍTULOS CON FLECHAS DEL TECLADO (CORREGIDA)
  // ==========================================================================
  document.addEventListener("keydown", (e) => {
    // 1. Desactivar si el usuario escribe en un campo editable
    const activeElement = document.activeElement;
    if (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.tagName === "SELECT"
    ) {
      return;
    }

    // 2. Comprobar que existan subtítulos cargados
    if (!subtitulos || subtitulos.length === 0) return;

    const currentTime = video.currentTime;

    // Flecha Derecha: Ir al SIGUIENTE diálogo
    if (e.key === "ArrowRight") {
      e.preventDefault();
      
      // Quitar el foco del video para evitar que HTML5 sobreescriba la acción
      if (document.activeElement === video) video.blur();

      const nextSub = subtitulos.find(
        (sub) => (sub.inicio + timeOffset) > currentTime + 0.1
      );

      if (nextSub) {
        video.currentTime = nextSub.inicio + timeOffset;
      }
    }

    // Flecha Izquierda: Ir al diálogo ANTERIOR / REPETIR diálogo actual
    if (e.key === "ArrowLeft") {
      e.preventDefault();

      if (document.activeElement === video) video.blur();

      // Busca el último subtítulo cuyo inicio esté antes del tiempo actual
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

});