

document.addEventListener("DOMContentLoaded", () => {

  // 1. Mostrar / ocultar significado KANA
  document.querySelectorAll('.vocal-item').forEach(item => {
    const btn = item.querySelector('.btn-show');
    const resp = item.querySelector('.significado');
    if (!btn || !resp) return;

    btn.addEventListener('click', () => {
      resp.style.display = (resp.style.display === 'block') ? 'none' : 'block';
    });
  });

  // 2. DUPLICAR IMÁGENES PARA LOOP INFINITO
  const track = document.querySelector('.slider-track');
  if (track) {
    const clones = track.innerHTML;
    track.innerHTML += clones; // Duplica las imágenes
  }

  // Movimiento automático del slider
  if (track) {
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

  // 3. COMPROBACIÓN INICIAL DEL MODO OSCURO
  // Revisa si el usuario ya tenía el tema oscuro guardado en su navegador
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

function toggleMenu() {
  document.getElementById('menu').classList.toggle('menu-open');
}

function toggleV(id) {
  const el = document.getElementById(id);
  el.style.display = (el.style.display === "block") ? "none" : "block";
}

// --- INTERRUPTOR MODO OSCURO / CLARO ---
function toggleDarkMode() {
  const body = document.body;
  const btn = document.getElementById('dark-mode-toggle');
  
  body.classList.toggle('dark-mode');
  
  if (body.classList.contains('dark-mode')) {
    btn.innerText = "☀️"; // Cambia a sol si está oscuro
    localStorage.setItem('theme', 'dark');
  } else {
    btn.innerText = "🌙"; // Cambia a luna si está claro
    localStorage.setItem('theme', 'light');
  }
}

// --- FUNCIONES DE LA BARRA LATERAL (SIDEBAR) ---
function verDetalle(titulo, imagen, descripcion, linkPdf, linkExtra) {
    const sidebar = document.getElementById('sidebar-detalle');
    const mainContainer = document.querySelector('.biblioteca-main');
    
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
    document.getElementById('sidebar-detalle').classList.remove('open');
    document.querySelector('.biblioteca-main').classList.remove('sidebar-abierto');
}

// --- FILTRO DE BÚSQUEDA POR TEXTO (TIEMPO REAL) ---
function filtrarLibros() {
    const input = document.getElementById('buscador-libros').value.toLowerCase();
    const libros = document.getElementsByClassName('libro-card');
    
    // Si se escribe en el buscador, reseteamos los botones de categorías a "Todos"
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
function filtrarCategoria(categoria) {
    const libros = document.getElementsByClassName('libro-card');
    
    // Limpiar input de búsqueda escrita
    document.getElementById('buscador-libros').value = "";

    // Cambiar estado activo en los botones
    const botones = document.getElementsByClassName('filter-btn');
    for (let btn of botones) {
        btn.classList.remove('active');
    }
    event.target.classList.add('active');

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