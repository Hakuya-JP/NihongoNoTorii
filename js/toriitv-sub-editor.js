// ==========================================================================
// MÓDULO: ESTUDIO Y EDITOR AVANZADO DE SUBTÍTULOS DE TORIITV
// Nihongo no Torii - Herramienta de Creación, Edición y Sincronización Inteligente
// ==========================================================================

let subtitleEditorInitialized = false;

window.toggleSubtitleEditor = function(forzarAbrir) {
  if (!subtitleEditorInitialized) {
    initSubtitleEditorModule();
  }
  const section = document.getElementById("sub-editor-section");
  const btnToggleEditor = document.getElementById("btn-toggle-sub-editor");
  if (!section) return;

  const estaOculto = section.classList.contains("oculto");
  const debeAbrir = (typeof forzarAbrir === "boolean") ? forzarAbrir : estaOculto;

  if (debeAbrir) {
    section.classList.remove("oculto");
    if (btnToggleEditor) btnToggleEditor.classList.add("active-tool");
    if (typeof window.toriiCerrarBarraIzquierda === "function") {
      window.toriiCerrarBarraIzquierda();
    }
    if (typeof window.toriiCargarEnEditor === "function") {
      window.toriiCargarEnEditor();
    }
    setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  } else {
    section.classList.add("oculto");
    if (btnToggleEditor) btnToggleEditor.classList.remove("active-tool");
  }
};

function initSubtitleEditorModule() {
  if (subtitleEditorInitialized) return;
  const section = document.getElementById("sub-editor-section");
  if (!section) return;
  subtitleEditorInitialized = true;

  const btnToggleEditor = document.getElementById("btn-toggle-sub-editor");
  const tableBody = document.getElementById("sub-editor-tbody");
  const subCountBadge = document.getElementById("sub-editor-count-badge");
  const searchInput = document.getElementById("sub-editor-search");

  // Botones principales de la barra de herramientas del editor
  const btnNewProject = document.getElementById("btn-sub-new-project");
  const btnAddLine = document.getElementById("btn-sub-add-line");
  const btnImportText = document.getElementById("btn-sub-import-text");
  const btnSyncModal = document.getElementById("btn-sub-sync-tools");
  const btnApplyToPlayer = document.getElementById("btn-sub-apply-player");
  const btnExportModal = document.getElementById("btn-sub-export");
  const btnRestoreDraft = document.getElementById("btn-sub-restore-draft");
  const btnFixOverlaps = document.getElementById("btn-sub-fix-overlaps");

  // Modales
  const modalSync = document.getElementById("sub-modal-sync");
  const modalImport = document.getElementById("sub-modal-import");
  const modalExport = document.getElementById("sub-modal-export");

  // Estado del editor
  let editorSubs = [];
  let selectedIndex = -1;
  let prelisteningTimeout = null;

  // Clave para almacenamiento en localStorage
  const DRAFT_KEY = "toriitv_sub_editor_draft";

  // ------------------------------------------------------------------
  // UTILIDADES DE TIEMPO
  // ------------------------------------------------------------------
  function secondsToHMS(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);

    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    const mss = ms.toString().padStart(3, "0");

    if (h > 0) {
      const hh = h.toString().padStart(2, "0");
      return `${hh}:${mm}:${ss}.${mss}`;
    }
    return `${mm}:${ss}.${mss}`;
  }

  function parseHMSToSeconds(str) {
    if (!str || typeof str !== "string") return 0;
    str = str.trim().replace(",", ".");
    const parts = str.split(":");
    let sec = 0;

    if (parts.length === 3) {
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      const s = parseFloat(parts[2]) || 0;
      sec = h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const m = parseFloat(parts[0]) || 0;
      const s = parseFloat(parts[1]) || 0;
      sec = m * 60 + s;
    } else if (parts.length === 1) {
      sec = parseFloat(parts[0]) || 0;
    }
    return Math.max(0, Math.round(sec * 1000) / 1000);
  }

  function formatDuration(inicio, fin) {
    const dur = Math.max(0, fin - inicio);
    return `${dur.toFixed(2)}s`;
  }

  function mostrarAviso(msg) {
    if (typeof mostrarToast === "function") {
      mostrarToast(msg);
    } else {
      console.log("[SubEditor]", msg);
    }
  }

  function getVideoElement() {
    return (typeof window.toriiGetVideo === "function")
      ? window.toriiGetVideo()
      : document.getElementById("main-video");
  }

  // ------------------------------------------------------------------
  // GESTIÓN DE BORRADORES Y SINCRONIZACIÓN CON EL REPRODUCTOR
  // ------------------------------------------------------------------
  function guardarBorradorLocal() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(editorSubs));
      if (btnRestoreDraft) {
        btnRestoreDraft.style.display = editorSubs.length > 0 ? "inline-flex" : "none";
      }
    } catch (e) {
      console.warn("No se pudo guardar borrador local de subtítulos:", e);
    }
  }

  function verificarBorradorExistente() {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed) && parsed.length > 0 && btnRestoreDraft) {
          btnRestoreDraft.style.display = "inline-flex";
          btnRestoreDraft.title = `Restaurar borrador guardado (${parsed.length} líneas)`;
        }
      }
    } catch (e) {}
  }

  function cargarDesdeReproductor(forzar = false) {
    const subsPlayer = (typeof window.toriiGetSubtitles === "function")
      ? window.toriiGetSubtitles()
      : (window.subtitlesData || []);

    if (subsPlayer && subsPlayer.length > 0) {
      if (editorSubs.length > 0 && !forzar) {
        return; // Preservar edición actual a menos que se fuerce
      }
      editorSubs = subsPlayer.map((s, idx) => ({
        id: idx + 1,
        inicio: Number(s.inicio) || 0,
        fin: Number(s.fin) || 0,
        texto: (s.texto || "").replace(/<br\s*\/?>/gi, " ").trim(),
        textoFurigana: s.textoFurigana || "",
        traduccion: s.traduccion || ""
      }));
      renderTable();
      guardarBorradorLocal();
    }
  }

  window.toriiCargarEnEditor = function(forzar = false) {
    cargarDesdeReproductor(forzar);
  };

  // Escuchar cuando el usuario carga un subtítulo en ToriiTV desde archivo
  window.toriiNotificarSubtitulosActualizados = function(subsActualizados) {
    if (subsActualizados && Array.isArray(subsActualizados)) {
      editorSubs = subsActualizados.map((s, idx) => ({
        id: idx + 1,
        inicio: Number(s.inicio) || 0,
        fin: Number(s.fin) || 0,
        texto: (s.texto || "").replace(/<br\s*\/?>/gi, " ").trim(),
        textoFurigana: s.textoFurigana || "",
        traduccion: s.traduccion || ""
      }));
      renderTable();
      guardarBorradorLocal();
    }
  };

  function aplicarCambiosAlReproductor(silencioso = false) {
    if (typeof window.toriiSetSubtitles === "function") {
      const subsParaReproductor = editorSubs.map((s, idx) => {
        const furigana = (typeof window.toriiAgregarFurigana === "function")
          ? window.toriiAgregarFurigana(s.texto)
          : s.texto;
        return {
          id: idx + 1,
          inicio: s.inicio,
          fin: s.fin,
          texto: s.texto,
          textoFurigana: furigana,
          traduccion: s.traduccion || ""
        };
      });

      window.toriiSetSubtitles(subsParaReproductor, true);
      guardarBorradorLocal();
      if (!silencioso) {
        mostrarAviso(`✅ ${editorSubs.length} subtítulos aplicados al reproductor`);
      }
    }
  }

  // ------------------------------------------------------------------
  // RENDERIZADO DE LA TABLA DEL EDITOR
  // ------------------------------------------------------------------
  function renderTable(filtroTexto = "") {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (editorSubs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 45px 20px; opacity: 0.88;">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">🎬✨</div>
            <p style="font-weight: 700; font-size: 1.05rem; margin: 0 0 6px; color: var(--color-h3);">No hay subtítulos en el editor</p>
            <p style="font-size: 0.88rem; margin: 0 auto 16px; max-width: 520px; opacity: 0.85; line-height: 1.5;">
              Carga un archivo (.srt / .ass), pulsa <strong>✨ Iniciar Proyecto Vacío</strong> para crearlos mientras ves el video, o importa una letra/guion en texto plano.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button id="btn-empty-new-sub" class="btn-tool"><span>✨ Iniciar Proyecto Vacío</span></button>
              <button id="btn-empty-import" class="btn-tool btn-secundario-tool"><span>📋 Importar Letra / Guion</span></button>
            </div>
          </td>
        </tr>
      `;
      const btnEmptyNew = tableBody.querySelector("#btn-empty-new-sub");
      if (btnEmptyNew) btnEmptyNew.addEventListener("click", nuevoProyectoVacio);
      const btnEmptyImp = tableBody.querySelector("#btn-empty-import");
      if (btnEmptyImp) btnEmptyImp.addEventListener("click", () => abrirModal(modalImport));
      if (subCountBadge) subCountBadge.textContent = "0 líneas";
      return;
    }

    const query = (filtroTexto || "").toLowerCase().trim();
    let visibles = 0;

    editorSubs.forEach((sub, index) => {
      const matchJp = (sub.texto || "").toLowerCase().includes(query);
      const matchEs = (sub.traduccion || "").toLowerCase().includes(query);
      if (query && !matchJp && !matchEs) return;

      visibles++;
      const tr = document.createElement("tr");
      tr.className = "sub-editor-row";
      if (index === selectedIndex) tr.classList.add("selected-row");
      tr.dataset.index = index;

      tr.innerHTML = `
        <td class="col-num">${index + 1}</td>
        <td class="col-time">
          <div class="time-input-wrap">
            <input type="text" class="input-sub-time input-sub-start" value="${secondsToHMS(sub.inicio)}" data-index="${index}" data-field="inicio" title="Tiempo de inicio (hh:mm:ss.ms)" />
            <button class="btn-time-snap btn-snap-start" data-index="${index}" title="Fijar con el segundo actual del video">⏱️</button>
          </div>
        </td>
        <td class="col-time">
          <div class="time-input-wrap">
            <input type="text" class="input-sub-time input-sub-end" value="${secondsToHMS(sub.fin)}" data-index="${index}" data-field="fin" title="Tiempo de fin (hh:mm:ss.ms)" />
            <button class="btn-time-snap btn-snap-end" data-index="${index}" title="Fijar con el segundo actual del video">⏱️</button>
          </div>
        </td>
        <td class="col-dur">
          <span class="sub-dur-pill">${formatDuration(sub.inicio, sub.fin)}</span>
        </td>
        <td class="col-text-jp">
          <textarea class="sub-textarea sub-text-jp" data-index="${index}" data-field="texto" placeholder="Escribe el subtítulo en japonés..." rows="1">${sub.texto || ""}</textarea>
        </td>
        <td class="col-text-es">
          <textarea class="sub-textarea sub-text-es" data-index="${index}" data-field="traduccion" placeholder="Traducción al español (para Anki)..." rows="1">${sub.traduccion || ""}</textarea>
        </td>
        <td class="col-actions">
          <div class="sub-row-actions">
            <button class="btn-sub-act btn-sub-play" data-index="${index}" title="Preescuchar solo este fragmento en el video">▶️</button>
            <button class="btn-sub-act btn-sub-split" data-index="${index}" title="Dividir este subtítulo en dos partes">✂️</button>
            <button class="btn-sub-act btn-sub-merge" data-index="${index}" title="Unir con la siguiente línea">🔗</button>
            <button class="btn-sub-act btn-sub-del" data-index="${index}" title="Eliminar este subtítulo">🗑️</button>
          </div>
        </td>
      `;

      // Evento de selección de fila
      tr.addEventListener("click", (e) => {
        if (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea")) return;
        seleccionarFila(index);
      });

      tableBody.appendChild(tr);
    });

    if (subCountBadge) {
      subCountBadge.textContent = query 
        ? `${visibles} de ${editorSubs.length} líneas` 
        : `${editorSubs.length} líneas`;
    }

    autoResizeTextareas();
  }

  function autoResizeTextareas() {
    const textareas = tableBody.querySelectorAll(".sub-textarea");
    textareas.forEach(t => {
      t.style.height = "auto";
      t.style.height = `${Math.max(34, t.scrollHeight)}px`;
    });
  }

  function seleccionarFila(index) {
    selectedIndex = index;
    const rows = tableBody.querySelectorAll(".sub-editor-row");
    rows.forEach(r => {
      if (parseInt(r.dataset.index, 10) === index) {
        r.classList.add("selected-row");
      } else {
        r.classList.remove("selected-row");
      }
    });

    const sub = editorSubs[index];
    const video = getVideoElement();
    if (sub && video && !isNaN(sub.inicio)) {
      video.currentTime = sub.inicio;
    }
  }

  // ------------------------------------------------------------------
  // ACCIONES CRUD DE SUBTÍTULOS
  // ------------------------------------------------------------------
  function nuevoProyectoVacio() {
    if (editorSubs.length > 0) {
      const confirma = confirm("¿Deseas iniciar un nuevo proyecto de subtítulos? Se limpiará la lista actual (puedes restaurar el borrador si lo necesitas).");
      if (!confirma) return;
    }

    const video = getVideoElement();
    const tiempoActual = (video && !isNaN(video.currentTime)) ? Math.round(video.currentTime * 10) / 10 : 0;

    editorSubs = [
      {
        id: 1,
        inicio: tiempoActual,
        fin: tiempoActual + 2.5,
        texto: "新規字幕 (Escribe tu subtítulo aquí)",
        textoFurigana: "",
        traduccion: ""
      }
    ];

    selectedIndex = 0;
    renderTable();
    aplicarCambiosAlReproductor(true);
    mostrarAviso("✨ Nuevo proyecto creado. ¡Comienza a añadir subtítulos!");
  }

  function agregarLinea(posicion = "fin") {
    const video = getVideoElement();
    const tiempoActual = (video && !isNaN(video.currentTime)) ? Math.round(video.currentTime * 10) / 10 : 0;

    let nuevoInicio = tiempoActual;
    let nuevoFin = tiempoActual + 2.5;

    if (posicion === "despues" && selectedIndex >= 0 && editorSubs[selectedIndex]) {
      const subActual = editorSubs[selectedIndex];
      nuevoInicio = Math.round((subActual.fin + 0.1) * 10) / 10;
      nuevoFin = Math.round((nuevoInicio + 2.5) * 10) / 10;
      editorSubs.splice(selectedIndex + 1, 0, {
        id: editorSubs.length + 1,
        inicio: nuevoInicio,
        fin: nuevoFin,
        texto: "",
        textoFurigana: "",
        traduccion: ""
      });
      selectedIndex = selectedIndex + 1;
    } else {
      if (editorSubs.length > 0) {
        const ult = editorSubs[editorSubs.length - 1];
        if (tiempoActual <= ult.fin) {
          nuevoInicio = Math.round((ult.fin + 0.1) * 10) / 10;
          nuevoFin = Math.round((nuevoInicio + 2.5) * 10) / 10;
        }
      }
      editorSubs.push({
        id: editorSubs.length + 1,
        inicio: nuevoInicio,
        fin: nuevoFin,
        texto: "",
        textoFurigana: "",
        traduccion: ""
      });
      selectedIndex = editorSubs.length - 1;
    }

    renderTable();
    aplicarCambiosAlReproductor(true);

    setTimeout(() => {
      const targetRow = tableBody.querySelector(`.sub-editor-row[data-index="${selectedIndex}"]`);
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const txt = targetRow.querySelector(".sub-text-jp");
        if (txt) txt.focus();
      }
    }, 50);
  }

  function eliminarLinea(index) {
    if (index < 0 || index >= editorSubs.length) return;
    editorSubs.splice(index, 1);
    if (selectedIndex >= editorSubs.length) {
      selectedIndex = editorSubs.length - 1;
    }
    renderTable();
    aplicarCambiosAlReproductor(true);
    mostrarAviso("🗑️ Línea eliminada");
  }

  function dividirLinea(index) {
    if (index < 0 || index >= editorSubs.length) return;
    const sub = editorSubs[index];
    const dur = sub.fin - sub.inicio;
    if (dur < 0.4) {
      mostrarAviso("⚠️ Subtítulo demasiado corto para dividir");
      return;
    }

    const video = getVideoElement();
    let splitTime = (video && video.currentTime > sub.inicio && video.currentTime < sub.fin)
      ? video.currentTime
      : sub.inicio + (dur / 2);

    splitTime = Math.round(splitTime * 1000) / 1000;

    const texto1 = sub.texto.slice(0, Math.ceil(sub.texto.length / 2)).trim();
    const texto2 = sub.texto.slice(Math.ceil(sub.texto.length / 2)).trim();

    const parte1 = {
      id: index + 1,
      inicio: sub.inicio,
      fin: splitTime,
      texto: texto1,
      textoFurigana: "",
      traduccion: sub.traduccion ? "(1/2) " + sub.traduccion : ""
    };

    const parte2 = {
      id: index + 2,
      inicio: splitTime,
      fin: sub.fin,
      texto: texto2,
      textoFurigana: "",
      traduccion: sub.traduccion ? "(2/2) " + sub.traduccion : ""
    };

    editorSubs.splice(index, 1, parte1, parte2);
    selectedIndex = index + 1;
    renderTable();
    aplicarCambiosAlReproductor(true);
    mostrarAviso("✂️ Subtítulo dividido en dos partes");
  }

  function unirConSiguiente(index) {
    if (index < 0 || index >= editorSubs.length - 1) {
      mostrarAviso("⚠️ No hay siguiente línea para fusionar");
      return;
    }

    const sub1 = editorSubs[index];
    const sub2 = editorSubs[index + 1];

    sub1.fin = sub2.fin;
    sub1.texto = `${sub1.texto} ${sub2.texto}`.trim();
    if (sub1.traduccion || sub2.traduccion) {
      sub1.traduccion = `${sub1.traduccion || ""} ${sub2.traduccion || ""}`.trim();
    }

    editorSubs.splice(index + 1, 1);
    renderTable();
    aplicarCambiosAlReproductor(true);
    mostrarAviso("🔗 Líneas unificadas");
  }

  function preescucharSegmento(index) {
    if (index < 0 || index >= editorSubs.length) return;
    const sub = editorSubs[index];
    const video = getVideoElement();
    if (!video) return;

    if (prelisteningTimeout) {
      clearTimeout(prelisteningTimeout);
      prelisteningTimeout = null;
    }

    video.currentTime = sub.inicio;
    video.play().catch(() => {});

    const duracionMs = Math.max(300, (sub.fin - sub.inicio) * 1000);

    const btnPlay = tableBody.querySelector(`.btn-sub-play[data-index="${index}"]`);
    if (btnPlay) btnPlay.textContent = "🔊";

    prelisteningTimeout = setTimeout(() => {
      video.pause();
      if (btnPlay) btnPlay.textContent = "▶️";
    }, duracionMs);
  }

  // ------------------------------------------------------------------
  // DELEGACIÓN DE EVENTOS EN LA TABLA
  // ------------------------------------------------------------------
  if (tableBody) {
    tableBody.addEventListener("change", (e) => {
      const input = e.target.closest(".input-sub-time");
      if (input) {
        const index = parseInt(input.dataset.index, 10);
        const field = input.dataset.field;
        const segundos = parseHMSToSeconds(input.value);
        if (!isNaN(index) && editorSubs[index]) {
          editorSubs[index][field] = segundos;
          if (editorSubs[index].fin < editorSubs[index].inicio) {
            editorSubs[index].fin = editorSubs[index].inicio + 1.0;
          }
          input.value = secondsToHMS(editorSubs[index][field]);
          const row = input.closest("tr");
          if (row) {
            const pill = row.querySelector(".sub-dur-pill");
            if (pill) pill.textContent = formatDuration(editorSubs[index].inicio, editorSubs[index].fin);
          }
          aplicarCambiosAlReproductor(true);
        }
      }
    });

    tableBody.addEventListener("input", (e) => {
      const textarea = e.target.closest(".sub-textarea");
      if (textarea) {
        const index = parseInt(textarea.dataset.index, 10);
        const field = textarea.dataset.field;
        if (!isNaN(index) && editorSubs[index]) {
          editorSubs[index][field] = textarea.value;
          textarea.style.height = "auto";
          textarea.style.height = `${Math.max(34, textarea.scrollHeight)}px`;
          aplicarCambiosAlReproductor(true);
        }
      }
    });

    tableBody.addEventListener("click", (e) => {
      const btnSnapStart = e.target.closest(".btn-snap-start");
      const btnSnapEnd = e.target.closest(".btn-snap-end");
      const btnPlay = e.target.closest(".btn-sub-play");
      const btnSplit = e.target.closest(".btn-sub-split");
      const btnMerge = e.target.closest(".btn-sub-merge");
      const btnDel = e.target.closest(".btn-sub-del");

      const video = getVideoElement();
      const currentVideoTime = (video && !isNaN(video.currentTime)) ? Math.round(video.currentTime * 1000) / 1000 : 0;

      if (btnSnapStart) {
        const index = parseInt(btnSnapStart.dataset.index, 10);
        if (editorSubs[index]) {
          editorSubs[index].inicio = currentVideoTime;
          if (editorSubs[index].fin <= editorSubs[index].inicio) {
            editorSubs[index].fin = Math.round((editorSubs[index].inicio + 2.0) * 1000) / 1000;
          }
          renderTable(searchInput ? searchInput.value : "");
          aplicarCambiosAlReproductor(true);
          mostrarAviso(`⏱️ Inicio fijado: ${secondsToHMS(currentVideoTime)}`);
        }
      } else if (btnSnapEnd) {
        const index = parseInt(btnSnapEnd.dataset.index, 10);
        if (editorSubs[index]) {
          if (currentVideoTime <= editorSubs[index].inicio) {
            mostrarAviso("⚠️ El fin no puede ser anterior al inicio");
            return;
          }
          editorSubs[index].fin = currentVideoTime;
          renderTable(searchInput ? searchInput.value : "");
          aplicarCambiosAlReproductor(true);
          mostrarAviso(`⏱️ Fin fijado: ${secondsToHMS(currentVideoTime)}`);
        }
      } else if (btnPlay) {
        const index = parseInt(btnPlay.dataset.index, 10);
        preescucharSegmento(index);
      } else if (btnSplit) {
        const index = parseInt(btnSplit.dataset.index, 10);
        dividirLinea(index);
      } else if (btnMerge) {
        const index = parseInt(btnMerge.dataset.index, 10);
        unirConSiguiente(index);
      } else if (btnDel) {
        const index = parseInt(btnDel.dataset.index, 10);
        eliminarLinea(index);
      }
    });
  }

  // ------------------------------------------------------------------
  // ALGORITMOS AVANZADOS DE SINCRONIZACIÓN
  // ------------------------------------------------------------------
  function aplicarSincronizacion2Puntos(idxA, realTimeA, idxB, realTimeB) {
    if (editorSubs.length < 2) {
      mostrarAviso("⚠️ Se necesitan al menos 2 subtítulos para interpolar");
      return false;
    }

    if (idxA < 0 || idxA >= editorSubs.length || idxB < 0 || idxB >= editorSubs.length || idxA === idxB) {
      mostrarAviso("⚠️ Selecciona dos puntos diferentes para la sincronización");
      return false;
    }

    const subA = editorSubs[idxA];
    const subB = editorSubs[idxB];

    const origTimeA = subA.inicio;
    const origTimeB = subB.inicio;

    if (origTimeB === origTimeA) {
      mostrarAviso("⚠️ Los tiempos originales de los puntos son idénticos");
      return false;
    }

    const scale = (realTimeB - realTimeA) / (origTimeB - origTimeA);

    editorSubs.forEach(s => {
      s.inicio = Math.max(0, Math.round((realTimeA + (s.inicio - origTimeA) * scale) * 1000) / 1000);
      s.fin = Math.max(s.inicio + 0.1, Math.round((realTimeA + (s.fin - origTimeA) * scale) * 1000) / 1000);
    });

    editorSubs.sort((a, b) => a.inicio - b.inicio);

    renderTable();
    aplicarCambiosAlReproductor();
    mostrarAviso(`⚡ Sincronización por 2 puntos aplicada (Escala: ${(scale * 100).toFixed(1)}%)`);
    return true;
  }

  function aplicarDesfaseTramo(desdeIndex, deltaSegundos) {
    if (desdeIndex < 0 || desdeIndex >= editorSubs.length) {
      mostrarAviso("⚠️ Índice de inicio no válido");
      return false;
    }

    let modificados = 0;
    for (let i = desdeIndex; i < editorSubs.length; i++) {
      editorSubs[i].inicio = Math.max(0, Math.round((editorSubs[i].inicio + deltaSegundos) * 1000) / 1000);
      editorSubs[i].fin = Math.max(editorSubs[i].inicio + 0.1, Math.round((editorSubs[i].fin + deltaSegundos) * 1000) / 1000);
      modificados++;
    }

    renderTable();
    aplicarCambiosAlReproductor();
    const signo = deltaSegundos > 0 ? "+" : "";
    mostrarAviso(`⏩ ${signo}${deltaSegundos.toFixed(2)}s aplicados a ${modificados} líneas (desde la #${desdeIndex + 1})`);
    return true;
  }

  function aplicarDesfaseGlobal(deltaSegundos) {
    if (editorSubs.length === 0) return;
    editorSubs.forEach(s => {
      s.inicio = Math.max(0, Math.round((s.inicio + deltaSegundos) * 1000) / 1000);
      s.fin = Math.max(s.inicio + 0.1, Math.round((s.fin + deltaSegundos) * 1000) / 1000);
    });
    renderTable();
    aplicarCambiosAlReproductor();
    const signo = deltaSegundos > 0 ? "+" : "";
    mostrarAviso(`⏱️ Desfase global de ${signo}${deltaSegundos.toFixed(2)}s aplicado`);
  }

  function corregirSolapamientos() {
    if (editorSubs.length < 2) return;
    editorSubs.sort((a, b) => a.inicio - b.inicio);

    let corregidos = 0;
    for (let i = 0; i < editorSubs.length - 1; i++) {
      if (editorSubs[i].fin > editorSubs[i + 1].inicio) {
        editorSubs[i].fin = Math.max(editorSubs[i].inicio + 0.2, Math.round((editorSubs[i + 1].inicio - 0.05) * 1000) / 1000);
        corregidos++;
      }
    }

    renderTable();
    aplicarCambiosAlReproductor();
    mostrarAviso(corregidos > 0 ? `🛡️ Se corrigieron ${corregidos} solapamientos de tiempo` : "✅ No se detectaron solapamientos");
  }

  // ------------------------------------------------------------------
  // ASISTENTE DE IMPORTACIÓN DE TEXTO / LETRA (LYRICS IMPORTER)
  // ------------------------------------------------------------------
  function importarTextoPlano(textoCrudo, duracionPorLinea = 2.8, iniciarEnTiempoVideo = true) {
    if (!textoCrudo || !textoCrudo.trim()) {
      mostrarAviso("⚠️ Pega el texto o la letra que deseas importar");
      return;
    }

    const video = getVideoElement();
    let tiempoCursor = (iniciarEnTiempoVideo && video && !isNaN(video.currentTime)) 
      ? Math.round(video.currentTime * 10) / 10 
      : 0;

    const lineas = textoCrudo.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lineas.length === 0) return;

    const nuevos = lineas.map((linea, idx) => {
      const inicio = tiempoCursor;
      const fin = Math.round((inicio + duracionPorLinea) * 1000) / 1000;
      tiempoCursor = Math.round((fin + 0.15) * 1000) / 1000;

      return {
        id: (editorSubs.length + idx + 1),
        inicio: inicio,
        fin: fin,
        texto: linea,
        textoFurigana: "",
        traduccion: ""
      };
    });

    if (editorSubs.length === 0 || confirm("¿Deseas reemplazar el proyecto actual con estas líneas importadas? (Cancelar para agregarlas al final)")) {
      editorSubs = nuevos;
    } else {
      editorSubs = editorSubs.concat(nuevos);
    }

    selectedIndex = 0;
    renderTable();
    aplicarCambiosAlReproductor(true);
    mostrarAviso(`📋 ¡${nuevos.length} líneas importadas con éxito!`);
  }

  // ------------------------------------------------------------------
  // EXPORTADOR UNIVERSAL (SRT, VTT, ASS)
  // ------------------------------------------------------------------
  function formatSRTTime(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, "0");
    return `${h}:${m}:${s},${ms}`;
  }

  function formatVTTTime(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600).toString().padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, "0");
    return `${h}:${m}:${s}.${ms}`;
  }

  function formatASSTime(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const cs = Math.floor((sec % 1) * 100).toString().padStart(2, "0");
    return `${h}:${m}:${s}.${cs}`;
  }

  function descargarArchivo(contenido, nombreArchivo, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportarSRT(incluirEspanol = false) {
    if (editorSubs.length === 0) {
      mostrarAviso("⚠️ No hay subtítulos para exportar");
      return;
    }
    let res = "";
    editorSubs.forEach((s, idx) => {
      const inicio = formatSRTTime(s.inicio);
      const fin = formatSRTTime(s.fin);
      let texto = s.texto;
      if (incluirEspanol && s.traduccion) {
        texto += `\n${s.traduccion}`;
      }
      res += `${idx + 1}\n${inicio} --> ${fin}\n${texto}\n\n`;
    });
    descargarArchivo(res, "toriitv_subtitulos.srt");
    mostrarAviso("💾 Archivo .SRT descargado");
  }

  function exportarVTT(incluirEspanol = false) {
    if (editorSubs.length === 0) {
      mostrarAviso("⚠️ No hay subtítulos para exportar");
      return;
    }
    let res = "WEBVTT\n\n";
    editorSubs.forEach((s, idx) => {
      const inicio = formatVTTTime(s.inicio);
      const fin = formatVTTTime(s.fin);
      let texto = s.texto;
      if (incluirEspanol && s.traduccion) {
        texto += `\n${s.traduccion}`;
      }
      res += `${idx + 1}\n${inicio} --> ${fin}\n${texto}\n\n`;
    });
    descargarArchivo(res, "toriitv_subtitulos.vtt");
    mostrarAviso("💾 Archivo .VTT descargado");
  }

  function exportarASS(incluirEspanol = false) {
    if (editorSubs.length === 0) {
      mostrarAviso("⚠️ No hay subtítulos para exportar");
      return;
    }
    let header = `[Script Info]
; Script generado por ToriiTV Subtitle Studio - Nihongo no Torii
Title: ToriiTV Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.601
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans JP,55,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2.5,1.5,2,20,20,30,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    let events = "";
    editorSubs.forEach(s => {
      const inicio = formatASSTime(s.inicio);
      const fin = formatASSTime(s.fin);
      let texto = s.texto;
      if (incluirEspanol && s.traduccion) {
        texto += `\\N{\\fs36\\c&HFFDEBD&}${s.traduccion}`;
      }
      events += `Dialogue: 0,${inicio},${fin},Default,,0,0,0,,${texto}\n`;
    });

    descargarArchivo(header + events, "toriitv_subtitulos.ass");
    mostrarAviso("💾 Archivo .ASS descargado");
  }

  // ------------------------------------------------------------------
  // CONFIGURACIÓN DE LOS MODALES
  // ------------------------------------------------------------------
  function configurarModalSincronizacion() {
    if (!modalSync) return;

    const selectPointA = document.getElementById("sync-point-a-select");
    const inputRealA = document.getElementById("sync-real-a");
    const btnCaptureA = document.getElementById("btn-sync-capture-a");

    const selectPointB = document.getElementById("sync-point-b-select");
    const inputRealB = document.getElementById("sync-real-b");
    const btnCaptureB = document.getElementById("btn-sync-capture-b");

    const btnApply2Points = document.getElementById("btn-apply-2points-sync");

    const inputShiftFrom = document.getElementById("sync-shift-from-index");
    const inputShiftDelta = document.getElementById("sync-shift-delta");
    const btnApplyShift = document.getElementById("btn-apply-shift-from");

    window.actualizarSelectsSincronizacion = function() {
      if (!selectPointA || !selectPointB) return;
      selectPointA.innerHTML = "";
      selectPointB.innerHTML = "";

      editorSubs.forEach((s, idx) => {
        const preview = (s.texto || "").slice(0, 30);
        const optA = document.createElement("option");
        optA.value = idx;
        optA.textContent = `#${idx + 1} (${secondsToHMS(s.inicio)}) - ${preview}`;
        selectPointA.appendChild(optA);

        const optB = document.createElement("option");
        optB.value = idx;
        optB.textContent = `#${idx + 1} (${secondsToHMS(s.inicio)}) - ${preview}`;
        selectPointB.appendChild(optB);
      });

      if (editorSubs.length > 0) {
        selectPointA.selectedIndex = 0;
        selectPointB.selectedIndex = editorSubs.length - 1;

        if (inputRealA) inputRealA.value = secondsToHMS(editorSubs[0].inicio);
        if (inputRealB && editorSubs.length > 1) {
          inputRealB.value = secondsToHMS(editorSubs[editorSubs.length - 1].inicio);
        }
      }

      if (inputShiftFrom) {
        inputShiftFrom.max = editorSubs.length;
        inputShiftFrom.value = selectedIndex >= 0 ? (selectedIndex + 1) : 1;
      }
    };

    if (btnCaptureA) {
      btnCaptureA.addEventListener("click", () => {
        const video = getVideoElement();
        if (video && inputRealA) {
          inputRealA.value = secondsToHMS(video.currentTime);
          mostrarAviso(`📍 Punto A fijado al video actual: ${secondsToHMS(video.currentTime)}`);
        }
      });
    }

    if (btnCaptureB) {
      btnCaptureB.addEventListener("click", () => {
        const video = getVideoElement();
        if (video && inputRealB) {
          inputRealB.value = secondsToHMS(video.currentTime);
          mostrarAviso(`📍 Punto B fijado al video actual: ${secondsToHMS(video.currentTime)}`);
        }
      });
    }

    if (btnApply2Points) {
      btnApply2Points.addEventListener("click", () => {
        const idxA = parseInt(selectPointA.value, 10);
        const realA = parseHMSToSeconds(inputRealA.value);
        const idxB = parseInt(selectPointB.value, 10);
        const realB = parseHMSToSeconds(inputRealB.value);

        if (aplicarSincronizacion2Puntos(idxA, realA, idxB, realB)) {
          cerrarModales();
        }
      });
    }

    if (btnApplyShift) {
      btnApplyShift.addEventListener("click", () => {
        const desdeIndex = Math.max(0, (parseInt(inputShiftFrom.value, 10) || 1) - 1);
        const delta = parseFloat(inputShiftDelta.value) || 0;
        if (delta === 0) {
          mostrarAviso("⚠️ Ingresa un valor de desfase distinto de cero");
          return;
        }
        if (aplicarDesfaseTramo(desdeIndex, delta)) {
          cerrarModales();
        }
      });
    }

    const btnsGlobalShift = modalSync.querySelectorAll(".btn-shift-quick");
    btnsGlobalShift.forEach(btn => {
      btn.addEventListener("click", () => {
        const delta = parseFloat(btn.dataset.delta) || 0;
        aplicarDesfaseGlobal(delta);
      });
    });
  }

  function configurarModalImportacion() {
    if (!modalImport) return;
    const txtImport = document.getElementById("sub-import-raw-text");
    const durInput = document.getElementById("sub-import-duration");
    const chkStartAtVideo = document.getElementById("sub-import-start-at-video");
    const btnDoImport = document.getElementById("btn-do-import-text");

    if (btnDoImport) {
      btnDoImport.addEventListener("click", () => {
        const texto = txtImport ? txtImport.value : "";
        const dur = durInput ? parseFloat(durInput.value) || 2.8 : 2.8;
        const startAt = chkStartAtVideo ? chkStartAtVideo.checked : true;

        importarTextoPlano(texto, dur, startAt);
        if (txtImport) txtImport.value = "";
        cerrarModales();
      });
    }
  }

  function configurarModalExportacion() {
    if (!modalExport) return;
    const btnExpSrt = document.getElementById("btn-exp-format-srt");
    const btnExpVtt = document.getElementById("btn-exp-format-vtt");
    const btnExpAss = document.getElementById("btn-exp-format-ass");
    const chkIncludeEs = document.getElementById("chk-export-include-es");

    if (btnExpSrt) btnExpSrt.addEventListener("click", () => exportarSRT(chkIncludeEs ? chkIncludeEs.checked : false));
    if (btnExpVtt) btnExpVtt.addEventListener("click", () => exportarVTT(chkIncludeEs ? chkIncludeEs.checked : false));
    if (btnExpAss) btnExpAss.addEventListener("click", () => exportarASS(chkIncludeEs ? chkIncludeEs.checked : false));
  }

  function abrirModal(modal) {
    if (!modal) return;
    modal.classList.add("active");
    if (modal === modalSync && typeof window.actualizarSelectsSincronizacion === "function") {
      window.actualizarSelectsSincronizacion();
    }
  }

  function cerrarModales() {
    const modales = document.querySelectorAll(".sub-editor-modal");
    modales.forEach(m => m.classList.remove("active"));
  }

  document.querySelectorAll(".sub-editor-modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("sub-modal-close")) {
        cerrarModales();
      }
    });
  });

  // ------------------------------------------------------------------
  // ATAJOS DE TECLADO PARA EL EDITOR
  // ------------------------------------------------------------------
  document.addEventListener("keydown", (e) => {
    if (section.classList.contains("oculto")) return;

    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);

    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      agregarLinea("despues");
      return;
    }

    if (isTyping) return;

    const video = getVideoElement();

    if (e.key === "[" && selectedIndex >= 0 && editorSubs[selectedIndex] && video) {
      e.preventDefault();
      editorSubs[selectedIndex].inicio = Math.round(video.currentTime * 1000) / 1000;
      if (editorSubs[selectedIndex].fin <= editorSubs[selectedIndex].inicio) {
        editorSubs[selectedIndex].fin = Math.round((editorSubs[selectedIndex].inicio + 2.0) * 1000) / 1000;
      }
      renderTable(searchInput ? searchInput.value : "");
      aplicarCambiosAlReproductor(true);
      mostrarAviso(`⏱️ Inicio: ${secondsToHMS(video.currentTime)}`);
    }

    if (e.key === "]" && selectedIndex >= 0 && editorSubs[selectedIndex] && video) {
      e.preventDefault();
      if (video.currentTime > editorSubs[selectedIndex].inicio) {
        editorSubs[selectedIndex].fin = Math.round(video.currentTime * 1000) / 1000;
        renderTable(searchInput ? searchInput.value : "");
        aplicarCambiosAlReproductor(true);
        mostrarAviso(`⏱️ Fin: ${secondsToHMS(video.currentTime)}`);
        if (selectedIndex < editorSubs.length - 1) {
          seleccionarFila(selectedIndex + 1);
        }
      }
    }
  });

  // ------------------------------------------------------------------
  // LISTENERS DE BOTONES SUPERIORES DEL EDITOR
  // ------------------------------------------------------------------
  if (btnToggleEditor) {
    btnToggleEditor.onclick = (e) => {
      if (e) e.preventDefault();
      window.toggleSubtitleEditor();
    };
  }

  if (btnNewProject) btnNewProject.addEventListener("click", nuevoProyectoVacio);
  if (btnAddLine) btnAddLine.addEventListener("click", () => agregarLinea("despues"));
  if (btnImportText) btnImportText.addEventListener("click", () => abrirModal(modalImport));
  if (btnSyncModal) btnSyncModal.addEventListener("click", () => abrirModal(modalSync));
  if (btnApplyToPlayer) btnApplyToPlayer.addEventListener("click", () => aplicarCambiosAlReproductor());
  if (btnExportModal) btnExportModal.addEventListener("click", () => abrirModal(modalExport));
  if (btnFixOverlaps) btnFixOverlaps.addEventListener("click", corregirSolapamientos);

  if (btnRestoreDraft) {
    btnRestoreDraft.addEventListener("click", () => {
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          editorSubs = JSON.parse(draft);
          selectedIndex = 0;
          renderTable();
          aplicarCambiosAlReproductor(true);
          mostrarAviso(`♻️ Borrador restaurado (${editorSubs.length} líneas)`);
        }
      } catch (e) {
        mostrarAviso("⚠️ No se pudo restaurar el borrador");
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderTable(e.target.value);
    });
  }

  configurarModalSincronizacion();
  configurarModalImportacion();
  configurarModalExportacion();
  verificarBorradorExistente();

  setTimeout(() => {
    cargarDesdeReproductor();
  }, 300);
}

// Inicialización segura sin duplicados
if (document.readyState === "complete" || document.readyState === "interactive") {
  initSubtitleEditorModule();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    initSubtitleEditorModule();
  });
}
