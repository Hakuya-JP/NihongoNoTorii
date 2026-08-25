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
      if (typeof concederXP === "function") {
        concederXP(2, "👁️ Practicar respuesta", boton);
        if (typeof actualizarProgresoMision === "function") {
          actualizarProgresoMision("practica", 1);
        }
      }
    }
  }
}

// Menú Hamburguesa Móvil
function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) {
    menu.classList.toggle("menu-open");
    menu.classList.toggle("active");
    if (menu.classList.contains("menu-open") || menu.classList.contains("active")) {
      registrarEstadoAbierto();
    }
  }
}
window.toggleMenu = toggleMenu;

// Interruptor Dark Mode
function toggleDarkMode() {
  const body = document.body;
  const html = document.documentElement;
  const btn = document.getElementById('dark-mode-toggle');
  
  body.classList.toggle('dark-mode');
  html.classList.toggle('dark-mode');
  
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

// Filtros Biblioteca (Soporte Faceteado por Secciones y Reseteo)
function aplicarFiltrosBiblioteca() {
  const buscador = document.getElementById('buscador-libros');
  const query = buscador ? buscador.value.trim().toLowerCase() : "";
  const libros = document.getElementsByClassName('libro-card');
  const botones = document.getElementsByClassName('filter-btn');

  // Organizar filtros activos por grupo
  const gruposFiltros = {};

  for (let btn of botones) {
    if (btn.classList.contains('active')) {
      const grupo = btn.getAttribute('data-grupo') || 'general';
      const cat = btn.getAttribute('data-categoria-filtro') || 
                  (btn.getAttribute('onclick')?.match(/filtrarCategoria\('([^']+)'/)?.[1]) || '';
      if (cat && cat !== 'todos') {
        if (!gruposFiltros[grupo]) gruposFiltros[grupo] = [];
        gruposFiltros[grupo].push(cat);
      }
    }
  }

  const nombresGrupos = Object.keys(gruposFiltros);

  for (let i = 0; i < libros.length; i++) {
    const libro = libros[i];
    const titulo = (libro.getElementsByTagName('h3')[0]?.innerText || "").toLowerCase();
    const descripcion = (libro.querySelector('p')?.innerText || "").toLowerCase();
    const catLibroStr = libro.getAttribute('data-categoria') || "";
    const listaCategoriasLibro = catLibroStr.split(" ").map(c => c.trim()).filter(Boolean);

    // Coincidencia con texto de búsqueda
    const coincideTexto = !query || titulo.includes(query) || descripcion.includes(query);

    // Coincidencia faceteada: Para cada grupo activo, el libro debe tener al menos UNA de las etiquetas de ese grupo (OR dentro de grupo, AND entre grupos)
    const coincideGrupos = nombresGrupos.every(grupo => {
      const tagsGrupo = gruposFiltros[grupo];
      return tagsGrupo.some(tag => listaCategoriasLibro.includes(tag));
    });

    if (coincideTexto && coincideGrupos) {
      libro.style.display = "block";
    } else {
      libro.style.display = "none";
    }
  }

  actualizarContadoresFiltros();
}

function toggleGrupoFiltro(headerElement) {
  const targetGroup = headerElement.closest('.filter-group');
  if (!targetGroup) return;

  const isCurrentlyOpen = targetGroup.classList.contains('open');

  // Cerrar todos los demás grupos para que no queden encimados
  const todosGrupos = document.querySelectorAll('.filter-group');
  todosGrupos.forEach(grupo => {
    grupo.classList.add('collapsed');
    grupo.classList.remove('open');
  });

  // Si el grupo seleccionado no estaba abierto, abrirlo
  if (!isCurrentlyOpen) {
    targetGroup.classList.remove('collapsed');
    targetGroup.classList.add('open');
  }
}

function actualizarContadoresFiltros() {
  const grupos = document.querySelectorAll('.filter-group');
  grupos.forEach(grupo => {
    const badge = grupo.querySelector('.filter-badge-count');
    if (!badge) return;

    const botonesActivos = grupo.querySelectorAll('.filter-btn.active:not([data-categoria-filtro="todos"])');
    const cantidad = botonesActivos.length;

    if (cantidad > 0) {
      badge.innerText = cantidad;
      badge.classList.add('visible');
    } else {
      badge.innerText = '0';
      badge.classList.remove('visible');
    }
  });
}

function filtrarLibros() {
  aplicarFiltrosBiblioteca();
}

function filtrarCategoria(categoria, botonPresionado) {
  const botones = document.getElementsByClassName('filter-btn');
  let btnTodos = null;

  for (let btn of botones) {
    const cat = btn.getAttribute('data-categoria-filtro') || 
                (btn.getAttribute('onclick')?.match(/filtrarCategoria\('([^']+)'/)?.[1]) || '';
    if (cat === 'todos') {
      btnTodos = btn;
      break;
    }
  }
  if (!btnTodos && botones.length > 0) btnTodos = botones[0];

  if (categoria === 'todos') {
    for (let btn of botones) {
      const grupo = btn.getAttribute('data-grupo');
      if (grupo === 'tipo' || !grupo) {
        btn.classList.remove('active');
      }
    }
    if (btnTodos) btnTodos.classList.add('active');
  } else {
    if (botonPresionado) {
      botonPresionado.classList.toggle('active');
    }

    if (btnTodos && btnTodos.classList.contains('active')) {
      btnTodos.classList.remove('active');
    }

    let algunTipoActivo = false;
    for (let btn of botones) {
      const grupo = btn.getAttribute('data-grupo');
      const cat = btn.getAttribute('data-categoria-filtro') || '';
      if ((grupo === 'tipo' || !grupo) && cat !== 'todos' && btn.classList.contains('active')) {
        algunTipoActivo = true;
        break;
      }
    }

    if (!algunTipoActivo && btnTodos) {
      btnTodos.classList.add('active');
    }
  }

  aplicarFiltrosBiblioteca();
}

function resetearTodosLosFiltros() {
  const buscador = document.getElementById('buscador-libros');
  if (buscador) buscador.value = "";

  const botones = document.getElementsByClassName('filter-btn');
  for (let btn of botones) {
    btn.classList.remove('active');
  }

  let btnTodos = null;
  for (let btn of botones) {
    const cat = btn.getAttribute('data-categoria-filtro') || '';
    if (cat === 'todos') {
      btnTodos = btn;
      break;
    }
  }
  if (btnTodos) btnTodos.classList.add('active');

  aplicarFiltrosBiblioteca();
}

function resetearBotonesFiltro() {
  resetearTodosLosFiltros();
}

function initBibliotecaFiltrosUrl() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat') || params.get('tipo');
  if (catParam) {
    const cats = catParam.split(',').map(c => c.trim()).filter(Boolean);
    const botones = document.getElementsByClassName('filter-btn');
    let algunaCoincidencia = false;

    for (let btn of botones) {
      const catFiltro = btn.getAttribute('data-categoria-filtro') || 
                        (btn.getAttribute('onclick')?.match(/filtrarCategoria\('([^']+)'/)?.[1]) || '';
      if (cats.includes(catFiltro)) {
        btn.classList.add('active');
        algunaCoincidencia = true;
      }
    }

    if (algunaCoincidencia) {
      for (let btn of botones) {
        const catFiltro = btn.getAttribute('data-categoria-filtro') || '';
        if (catFiltro === 'todos') {
          btn.classList.remove('active');
        }
      }
      aplicarFiltrosBiblioteca();
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
