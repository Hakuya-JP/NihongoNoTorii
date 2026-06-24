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

// Menú Hamburguesa Móvil
function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu) menu.classList.toggle('menu-open');
}

// Revelar Respuestas en Vocales y Kana (Cambiando el texto del botón)
function toggleV(id) {
  const el = document.getElementById(id);
  if (el) {
    // 1. Buscamos el botón que está justo arriba de la respuesta
    const boton = event.currentTarget; 

    if (el.style.display === "block") {
      el.style.display = "none";
      // 2. Si se oculta, el botón vuelve a decir "Ver respuesta"
      if (boton && boton.tagName === "BUTTON") boton.innerText = "Ver respuesta";
    } else {
      el.style.display = "block";
      // 3. Si se muestra, el botón cambia a "Ocultar respuesta"
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
function verDetalle(titulo, imagen, descripcion, linkPdf, linkExtra) {
    const sidebar = document.getElementById('sidebar-detalle');
    const mainContainer = document.querySelector('.biblioteca-main');
    
    if (!sidebar || !mainContainer) return;

    // Inyectar la información seleccionada
    document.getElementById('det-titulo').innerText = titulo;
    document.getElementById('det-portada').src = imagen;
    document.getElementById('det-descripcion').innerText = descripcion;
    document.getElementById('link-pdf').href = linkPdf;
    document.getElementById('link-extra').href = linkExtra;
    
    // Abrir barra lateral y aplicar clase contenedora
    sidebar.classList.add('open');
    mainContainer.classList.add('sidebar-abierto');
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
    
    // Reseteamos los botones de categorías a "Todos"
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

    // Cambiar estado activo en los botones
    const botones = document.getElementsByClassName('filter-btn');
    for (let btn of botones) {
        btn.classList.remove('active');
    }
    
    // Asigna la clase activo de forma segura si se pasa el elemento
    if (botonPresionado) {
      botonPresionado.classList.add('active');
    }

    // Mostrar u ocultar las tarjetas según el data-categoria
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
    if (botones[0]) botones[0].classList.add('active'); // Regresa a "Todos"
}

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
        btnExtra.style.display = "block"; // Se muestra si hay link
    } else {
        btnExtra.style.display = "none";  // ¡OCULTADO si pones '#'!
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

// --- CERRAR SIDEBAR AL HACER CLIC FUERA DE ÉL ---
document.addEventListener('click', function(evento) {
    const sidebar = document.getElementById('sidebar-detalle');
    const mainContainer = document.querySelector('.biblioteca-main');
    
    // Si la barra lateral no existe o no está abierta (no tiene la clase 'open'), no hacemos nada
    if (!sidebar || !sidebar.classList.contains('open')) return;

    // Comprobamos si el clic se hizo DENTRO de la barra lateral
    const clicDentroDelSidebar = sidebar.contains(evento.target);
    
    // Comprobamos si el clic se hizo en una tarjeta de libro (para evitar que se cierre al intentar abrir uno)
    const clicEnTarjetaLibro = evento.target.closest('.libro-card');

    // Si el usuario hizo clic fuera de la barra lateral Y NO tocó ninguna tarjeta de libro, cerramos
    if (!clicDentroDelSidebar && !clicEnTarjetaLibro) {
        cerrarDetalle();
    }
});

// --- CERRAR MENÚ HAMBURGUESA AL HACER CLIC FUERA ---
document.addEventListener('click', function(evento) {
    const menu = document.getElementById('menu');
    const botonHamburguesa = document.querySelector('.hamburger');
    
    // Si el menú no está abierto, no hacemos nada
    if (!menu || !menu.classList.contains('menu-open')) return;
    
    // Verificamos si el clic fue dentro del menú o en el botón de la hamburguesa
    const clicDentroDelMenu = menu.contains(evento.target);
    const clicEnHamburguesa = botonHamburguesa.contains(evento.target);
    
    // Si el clic fue fuera de ambos, cerramos el menú quitando la clase
    if (!clicDentroDelMenu && !clicEnHamburguesa) {
        menu.classList.remove('menu-open');
    }
});

// --- CONTROL DEL BOTÓN "ATRÁS" DEL CELULAR ---

// 1. Cada vez que abres un menú o la biblioteca, inyectamos un "estado" falso en el historial
function registrarEstadoAbierto() {
    // Esto le dice al navegador: "añade un paso ficticio en el historial"
    history.pushState({ panelAbierto: true }, "");
}

// Modificamos ligeramente tu función de abrir la biblioteca para que use este registro
// (Solo añade esta línea al final de tu función verDetalle actual)
// registrarEstadoAbierto();

// Modificamos tu función del menú hamburguesa para que también lo registre al abrirse
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
        menu.classList.toggle('menu-open');
        // Si se abrió, registramos el estado
        if (menu.classList.contains('menu-open')) {
            registrarEstadoAbierto();
        }
    }
}

// 2. Escuchamos cuando el usuario presiona el botón "Atrás" (evento popstate)
window.addEventListener('popstate', function(evento) {
    const sidebar = document.getElementById('sidebar-detalle');
    const mainContainer = document.querySelector('.biblioteca-main');
    const menu = document.getElementById('menu');
    
    let seCerróAlgo = false;

    // Si la barra de la biblioteca está abierta, la cerramos
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (mainContainer) mainContainer.classList.remove('sidebar-abierto');
        seCerróAlgo = true;
    }
    
    // Si el menú hamburguesa está abierto, lo cerramos
    if (menu && menu.classList.contains('menu-open')) {
        menu.classList.remove('menu-open');
        seCerróAlgo = true;
    }

    // Si no había nada abierto y el usuario dio atrás, lo dejamos navegar normalmente
    if (!seCerróAlgo) {
        // No hacemos nada, el navegador retrocederá de página de forma natural
    }
});