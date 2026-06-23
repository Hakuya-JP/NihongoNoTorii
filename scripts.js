document.addEventListener("DOMContentLoaded", () => {

  // 1. DUPLICAR IMÁGENES PARA LOOP INFINITO (CARRUSEL)
  const track = document.querySelector('.slider-track');
  if (track) {
    const clones = track.innerHTML;
    track.innerHTML += clones; // Duplica las imágenes

    let offset = 0;
    setInterval(() => {
      offset -= 2;

      // Cuando llegue al final de la primera mitad, reinicia
      if (Math.abs(offset) >= track.scrollWidth / 2) {
        offset = 0;
      }

      track.style.transform = `translateX(${offset}px)`;
    }, 30);
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