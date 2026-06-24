document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================================
  // 1. PREPARACIÓN DEL CARRUSEL INFINITO
  // ==========================================================================
  const track = document.querySelector('.slider-track');
  if (track) {
    // Duplicamos el contenido una vez para tener el "espejo" del loop
    const clones = track.innerHTML;
    track.innerHTML += clones;
  }

  // 2. COMPROBACIÓN INICIAL DEL MODO OSCURO
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const btnDark = document.getElementById('dark-mode-toggle');
  
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    if (btnDark) btnDark.innerText = "☀️";
  }
  
}); // Cierra DOMContentLoaded


// ================================================================
// FUNCIONES GLOBALES (Menú, Videos, Biblioteca y Modo Oscuro)
// ================================================================

// Revelar Respuestas en Vocales y Kana (Cambiando el texto del botón)
function toggleV(id) {
  const el = document.getElementById(id);
  if (el) {
    const boton = event.currentTarget; 

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

    // Inyectar la información básica
    document.getElementById('det-titulo').innerText = titulo;
    document.getElementById('det-portada').src = imagen;
    document.getElementById('det-descripcion').innerText = descripcion;
    
    // El PDF siempre se queda porque es el principal
    document.getElementById('link-pdf').href = linkPdf;
    
    // --- CONTROL DE BOTONES OPCIONALES (SE OCULTAN SI ES '#') ---
    const btnExtra = document.getElementById('link-extra');
    const btnAudio = document.getElementById('link-audio');
    const btnRespuestas = document.getElementById('link-respuestas');

    // Control para Material Extra
    if (linkExtra && linkExtra !== '#') {
        btnExtra.href = linkExtra;
        btnExtra.style.display = "block";
    } else {
        btnExtra.style.display = "none";
    }

    // Control para Audios
    if (linkAudio && linkAudio !== '#') {
        btnAudio.href = linkAudio;
        btnAudio.style.display = "block";
    } else {
        btnAudio.style.display = "none";
    }

    // Control para Solucionario
    if (linkRespuestas && linkRespuestas !== '#') {
        btnRespuestas.href = linkRespuestas;
        btnRespuestas.style.display = "block";
    } else {
        btnRespuestas.style.display = "none";
    }
    
    // Abrir barra lateral
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

// --- FILTRO DE BÚSQUEDA POR TEXTO (TIEMPO REAL) ---
function filtrarLibros() {
    const buscador = document.getElementById('buscador-libros');
    if (!buscador) return;

    const input = buscador.value.toLowerCase();
    const libros = document.getElementsByClassName('libro-card');
    
    resetearBotonesFiltro();

    for (let i = 0; i < libros.length; i++) {
        let titulo = libros[i].getElementsByTagName('h3')[0].innerText.toLowerCase();
        if (titulo.includes(input)) {
            libros[i].style.display = "block";
        } else {
            libros[i].style.display = "none";
        }
    }
}

// --- FILTRO POR CATEGORÍAS (BOTONES) ---
function filtrarCategoria(categoria, botonPresionado) {
    const libros = document.getElementsByClassName('libro-card');
    const buscador = document.getElementById('buscador-libros');
    
    if (buscador) buscador.value = "";

    const botones = document.getElementsByClassName('filter-btn');
    for (let btn of botones) {
        btn.classList.remove('active');
    }
    
    if (botonPresionado) {
      botonPresionado.classList.add('active');
    }

    for (let i = 0; i < libros.length; i++) {
        let catLibro = libros[i].getAttribute('data-categoria');
        if (categoria === 'todos' || catLibro === categoria) {
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

// ==========================================================================
// DETECTOR ÚNICO PARA CERRAR ELEMENTOS AL HACER CLIC FUERA (Optimizado)
// ==========================================================================
document.addEventListener('click', function(evento) {
    // 1. CONTROL DE LA BIBLIOTECA
    const sidebar = document.getElementById('sidebar-detalle');
    const mainContainer = document.querySelector('.biblioteca-main');
    
    if (sidebar && sidebar.classList.contains('open')) {
        const clicDentroDelSidebar = sidebar.contains(evento.target);
        const clicEnTarjetaLibro = evento.target.closest('.libro-card');
        
        if (!clicDentroDelSidebar && !clicEnTarjetaLibro) {
            cerrarDetalle();
        }
    }

    // 2. CONTROL DEL MENÚ HAMBURGUESA
    const menu = document.getElementById('menu');
    const botonHamburguesa = document.querySelector('.hamburger');
    
    if (menu && menu.classList.contains('menu-open')) {
        const clicDentroDelMenu = menu.contains(evento.target);
        const clicEnHamburguesa = (botonHamburguesa && botonHamburguesa.contains(evento.target));
        
        if (!clicDentroDelMenu && !clicEnHamburguesa) {
            menu.classList.remove('menu-open');
        }
    }
});

// --- CONTROL DEL BOTÓN "ATRÁS" DEL CELULAR ---

function registrarEstadoAbierto() {
    history.pushState({ panelAbierto: true }, "");
}

// Función del Menú Hamburguesa Adaptada para el Botón Atrás
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
        menu.classList.toggle('menu-open');
        if (menu.classList.contains('menu-open')) {
            registrarEstadoAbierto();
        }
    }
}

// Escuchador del botón físico/gesto "Atrás"
window.addEventListener('popstate', function(evento) {
    const sidebar = document.getElementById('sidebar-detalle');
    const mainContainer = document.querySelector('.biblioteca-main');
    const menu = document.getElementById('menu');
    
    let seCerróAlgo = false;

    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (mainContainer) mainContainer.classList.remove('sidebar-abierto');
        seCerróAlgo = true;
    }
    
    if (menu && menu.classList.contains('menu-open')) {
        menu.classList.remove('menu-open');
        seCerróAlgo = true;
    }
});