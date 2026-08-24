// ==========================================================================
// SECCIÓN: LÓGICA Y MOTOR DEL SIMULADOR JLPT POR SECCIONES
// ==========================================================================

/* ==========================================================================
   PANEL DE CONTROL Y CONFIGURACIÓN DE AUDIOS DEL SIMULADOR JLPT
   --------------------------------------------------------------------------
   Desde este panel puedes controlar todos los audios del examen:
   - audioHabilitadoGlobal: true / false (Apaga o enciende todos los sonidos).
   - activo: true / false (Enciende o apaga un sonido en específico).
   - archivo: Ruta del archivo de audio MP3/WAV.
   - volumen: Nivel de volumen de 0.0 (silencio) a 1.0 (máximo).
   - duracionSegundos: null (reproduce la canción/sonido completa) o un número
     de segundos para cortar la reproducción automáticamente (ej. 3 para 3s).
   ========================================================================== */
const CONFIGURACION_AUDIO_JLPT = {
  audioHabilitadoGlobal: true,

  eventos: {
    // 1. Mensaje / Modal de Inicio del Examen
    inicioExamen: {
      activo: false,
      archivo: "audio/sonidos/Campanajaponesa.mp3",
      volumen: 0.8,
      duracionSegundos: null // null = completo, o número de segundos (ej: 4)
    },

    // 2. Al comenzar cada Sección (Sección 1, Sección 2, Sección 3)
    inicioSeccion: {
      activo: true,
      archivo: "audio/sonidos/Campanajaponesa.mp3",
      volumen: 0.8,
      duracionSegundos: null
    },

    // 3. Al iniciar el descanso de 15 minutos entre secciones
    inicioDescanso: {
      activo: true,
      archivo: "audio/sonidos/Campanajaponesa.mp3",
      volumen: 0.8,
      duracionSegundos: null
    },

    // 4. Al finalizar u omitir el descanso para pasar a la siguiente sección
    finDescanso: {
      activo: true,
      archivo: "audio/sonidos/Campanajaponesa.mp3",
      volumen: 0.8,
      duracionSegundos: null
    },

    // 5. Al finalizar y entregar todo el examen
    finalExamen: {
      activo: true,
      archivo: "audio/sonidos/Campanajaponesa.mp3",
      volumen: 0.8,
      duracionSegundos: null
    },

    // 6. Al agotarse el tiempo del temporizador de una sección
    tiempoAgotado: {
      activo: true,
      archivo: "audio/sonidos/Campanajaponesa.mp3",
      volumen: 0.8,
      duracionSegundos: null
    }
  }
};

let estadoSimulador = {
  nivelActual: "N5",
  examenActualKey: "examen-1",
  examenActual: null,
  seccionActualIndex: 0,
  listaPreguntasSeccion: [],   // Preguntas de la sección activa
  listaPreguntasTodas: [],     // Arreglo global de preguntas (para evaluación final)
  respuestasUsuario: {},       // { indexPreguntaGlobal: indiceOpcion }
  preguntasMarcadas: {},       // { indexPreguntaGlobal: boolean }
  indexPreguntaActual: 0,      // Índice dentro de la sección actual
  tiempoRestanteSegundos: 0,
  timerInterval: null,
  descansoTimerInterval: null,
  tiempoDescansoRestante: 0,
  tiempoDescansoObligatorioRestante: 0,
  examenCompletado: false
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("jlpt-simulador-app")) {
    initSimuladorJLPT();
  }
});

function initSimuladorJLPT() {
  renderNivelSelector();

  const params = new URLSearchParams(window.location.search);
  const targetLevel = (params.get("level") || "N5").toUpperCase();
  const autoExam = params.get("autoExam") === "true";

  if (["KANA", "N5", "N4", "N3", "N2", "N1"].includes(targetLevel)) {
    seleccionarNivel(targetLevel);
  } else {
    seleccionarNivel("N5");
  }

  if (autoExam) {
    setTimeout(() => {
      comenzarSimulacro();
    }, 200);
  }
}

// --------------------------------------------------------------------------
// MOTOR DE REPRODUCCIÓN Y CONTROL DE AUDIO CONFIGURABLE
// --------------------------------------------------------------------------
function reproducirAudioEvento(nombreEvento) {
  if (!CONFIGURACION_AUDIO_JLPT || !CONFIGURACION_AUDIO_JLPT.audioHabilitadoGlobal) return;

  const cfg = CONFIGURACION_AUDIO_JLPT.eventos?.[nombreEvento];
  if (!cfg || !cfg.activo || !cfg.archivo) return;

  try {
    const audio = new Audio(cfg.archivo);
    audio.volume = (typeof cfg.volumen === "number") ? Math.max(0, Math.min(1, cfg.volumen)) : 0.8;
    
    audio.play().then(() => {
      if (typeof cfg.duracionSegundos === "number" && cfg.duracionSegundos > 0) {
        setTimeout(() => {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        }, cfg.duracionSegundos * 1000);
      }
    }).catch(err => console.log(`Audio (${nombreEvento}) no reproducido (requiere interacción previa):`, err));

  } catch (e) {
    console.log(`Error al reproducir audio del evento '${nombreEvento}':`, e);
  }
}

function reproducirCampanaJLPT() {
  reproducirAudioEvento("inicioExamen");
}

// --------------------------------------------------------------------------
// 1. RENDERIZADO Y NAVEGACIÓN EN PANTALLA SELECTORA
// --------------------------------------------------------------------------
function renderNivelSelector() {
  const container = document.getElementById("nivel-cards-container");
  if (!container) return;

  const niveles = [
    { id: "KANA", nombre: "KANA", imagen: "image/kana.png", badge: "Silabarios", desc: "Examen de dominio de Hiragana, Katakana, sonidos impuros y diptongales." },
    { id: "N5", nombre: "JLPT N5", imagen: "image/n5.png", badge: "Principiante", desc: "Vocabulario básico, Hiragana, Katakana y Kanjis elementales." },
    { id: "N4", nombre: "JLPT N4", imagen: "image/n4.png", badge: "Elemental", desc: "Japonés básico cotidiano y estructuras gramaticales fundamentales." },
    { id: "N3", nombre: "JLPT N3", imagen: "image/n3.png", badge: "Intermedio", desc: "Puente hacia el nivel avanzado con lectura de textos cotidianos." },
    { id: "N2", nombre: "JLPT N2", imagen: "image/n2.png", badge: "Avanzado", desc: "Comprensión fluida en situaciones de la vida diaria y negocios." },
    { id: "N1", nombre: "JLPT N1", imagen: "image/n1.png", badge: "Maestría", desc: "Dominio fluido y comprensión en una amplia variedad de circunstancias." }
  ];

  container.innerHTML = niveles.map(n => `
    <div class="card jlpt-level-card ${n.id === estadoSimulador.nivelActual ? 'active' : ''}" onclick="seleccionarNivel('${n.id}')">
      <img src="${n.imagen}" alt="${n.nombre}" class="jlpt-card-img" />
      <div class="level-card-header">
        <h3>${n.nombre}</h3>
        <span class="level-badge">${n.badge}</span>
      </div>
      <p>${n.desc}</p>
    </div>
  `).join("");
}

function seleccionarNivel(nivelKey) {
  estadoSimulador.nivelActual = nivelKey;
  estadoSimulador.examenActualKey = "examen-1";
  
  const cards = document.querySelectorAll(".jlpt-level-card");
  cards.forEach(card => card.classList.remove("active"));
  const searchStr = nivelKey === "KANA" ? "KANA" : `JLPT ${nivelKey}`;
  const activeCard = Array.from(cards).find(c => c.innerHTML.includes(searchStr));
  if (activeCard) activeCard.classList.add("active");

  renderExamenesDisponibles();
}

function renderExamenesDisponibles() {
  const selectExamen = document.getElementById("select-version-examen");
  const infoContainer = document.getElementById("examen-info-preview");
  if (!selectExamen || !infoContainer) return;

  const examenesNivel = JLPT_DATA[estadoSimulador.nivelActual] || {};
  const examKeys = Object.keys(examenesNivel);

  selectExamen.innerHTML = examKeys.map(key => `
    <option value="${key}">${examenesNivel[key].titulo}</option>
  `).join("");

  selectExamen.value = estadoSimulador.examenActualKey;
  actualizarExamenPreview();
}

function cambiarExamenSeleccionado() {
  const selectExamen = document.getElementById("select-version-examen");
  if (selectExamen) {
    estadoSimulador.examenActualKey = selectExamen.value;
    actualizarExamenPreview();
  }
}

function actualizarExamenPreview() {
  const infoContainer = document.getElementById("examen-info-preview");
  const examData = JLPT_DATA[estadoSimulador.nivelActual]?.[estadoSimulador.examenActualKey];

  if (!examData || !infoContainer) return;

  let totalPreguntas = 0;
  examData.secciones.forEach(sec => {
    if (sec.mondais && Array.isArray(sec.mondais)) {
      sec.mondais.forEach(m => totalPreguntas += (m.preguntas ? m.preguntas.length : 0));
    } else if (sec.preguntas) {
      totalPreguntas += sec.preguntas.length;
    }
  });

  infoContainer.innerHTML = `
    <div class="preview-info-grid">
      <div class="preview-item">
        <span class="preview-icon">⏱️</span>
        <div>
          <strong>Tiempo Examen:</strong>
          <p>${examData.tiempoMinutos} Min (3 Secciones)</p>
        </div>
      </div>
      <div class="preview-item">
        <span class="preview-icon">☕</span>
        <div>
          <strong>Descansos:</strong>
          <p>15 Min entre Secciones (2 Min obligatorios)</p>
        </div>
      </div>
      <div class="preview-item">
        <span class="preview-icon">📝</span>
        <div>
          <strong>Total Preguntas:</strong>
          <p>${totalPreguntas} Reactivos</p>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 2. MODAL DE INICIO DE EXAMEN
// --------------------------------------------------------------------------
function comenzarSimulacro() {
  const examData = JLPT_DATA[estadoSimulador.nivelActual]?.[estadoSimulador.examenActualKey];
  if (!examData) return;

  estadoSimulador.examenActual = examData;
  estadoSimulador.seccionActualIndex = 0;
  estadoSimulador.respuestasUsuario = {};
  estadoSimulador.preguntasMarcadas = {};
  estadoSimulador.examenCompletado = false;

  // Aplanar todas las preguntas asignándoles un ID global plano y heredando metadatos de 'mondais' si existen
  estadoSimulador.listaPreguntasTodas = [];
  let globalIndex = 0;

  examData.secciones.forEach((sec, sIdx) => {
    if (sec.mondais && Array.isArray(sec.mondais)) {
      sec.mondais.forEach(m => {
        if (m.preguntas && Array.isArray(m.preguntas)) {
          m.preguntas.forEach(p => {
            estadoSimulador.listaPreguntasTodas.push({
              ...p,
              mondai: p.mondai || m.titulo || m.mondai,
              mondaiInstruccion: p.mondaiInstruccion || m.instruccion || m.mondaiInstruccion,
              mondaiImagen: p.mondaiImagen || m.imagen || m.mondaiImagen,
              mondaiEjemplo: p.mondaiEjemplo || m.ejemplo || m.mondaiEjemplo,
              globalIndex: globalIndex++,
              seccionIndex: sIdx,
              seccionNombre: sec.nombre,
              seccionIcono: sec.icono || "📝"
            });
          });
        }
      });
    } else if (sec.preguntas && Array.isArray(sec.preguntas)) {
      sec.preguntas.forEach(p => {
        estadoSimulador.listaPreguntasTodas.push({
          ...p,
          globalIndex: globalIndex++,
          seccionIndex: sIdx,
          seccionNombre: sec.nombre,
          seccionIcono: sec.icono || "📝"
        });
      });
    }
  });

  abrirModalInicio();
}

function abrirModalInicio() {
  reproducirAudioEvento("inicioExamen");

  const modal = document.getElementById("jlpt-start-modal");
  const title = document.getElementById("start-modal-title");
  const subtitle = document.getElementById("start-modal-subtitle");
  const btnStart = document.getElementById("btn-iniciar-seccion-1");

  if (title) title.innerText = `⛩️ Inicio del Examen ${estadoSimulador.nivelActual}`;
  if (subtitle) subtitle.innerText = estadoSimulador.examenActual.titulo;

  const listContainer = document.querySelector(".sections-list-preview");
  if (listContainer) {
    const totalMinGeneral = estadoSimulador.examenActual.tiempoMinutos || 90;
    const totalPregGlobal = estadoSimulador.listaPreguntasTodas.length || 1;

    listContainer.innerHTML = estadoSimulador.examenActual.secciones.map((sec, idx) => {
      let count = 0;
      if (sec.mondais) {
        sec.mondais.forEach(m => count += (m.preguntas ? m.preguntas.length : 0));
      } else if (sec.preguntas) {
        count = sec.preguntas.length;
      }
      const secMin = sec.tiempoMinutos || Math.max(10, Math.round(totalMinGeneral * (count / totalPregGlobal)));
      return `
        <li>
          <span class="sec-num">${idx + 1}</span> 
          <strong>${sec.nombre}</strong> (${count} reactivos • ⏱️ ${secMin} min)
        </li>
      `;
    }).join("");
  }

  const primeraSeccionNombre = estadoSimulador.examenActual.secciones[0]?.nombre || "Vocabulario (文字・語彙)";
  if (btnStart) {
    btnStart.innerHTML = `🔔 Comenzar Sección 1: ${primeraSeccionNombre}`;
  }

  if (modal) modal.style.display = "flex";
}

// --------------------------------------------------------------------------
// 3. EJECUCIÓN DE SECCIÓN Y TEMPORIZADOR
// --------------------------------------------------------------------------
function iniciarSeccionActual() {
  const startModal = document.getElementById("jlpt-start-modal");
  const breakModal = document.getElementById("jlpt-break-modal");
  if (startModal) startModal.style.display = "none";
  if (breakModal) breakModal.style.display = "none";

  if (estadoSimulador.descansoTimerInterval) {
    clearInterval(estadoSimulador.descansoTimerInterval);
  }

  // Ocultar HUD, Banner y Misiones
  const hudBar = document.getElementById("rpg-hud-bar");
  if (hudBar) hudBar.style.display = "none";

  const heroBanner = document.querySelector(".jlpt-hero-banner");
  if (heroBanner) heroBanner.style.display = "none";

  const questsContainer = document.getElementById("daily-quests-container");
  if (questsContainer) questsContainer.style.display = "none";

  // Mostrar runner de examen
  document.getElementById("jlpt-selector-screen").style.display = "none";
  document.getElementById("jlpt-results-screen").style.display = "none";
  document.getElementById("jlpt-exam-screen").style.display = "block";

  reproducirAudioEvento("inicioSeccion");

  const secData = estadoSimulador.examenActual.secciones[estadoSimulador.seccionActualIndex];
  estadoSimulador.listaPreguntasSeccion = estadoSimulador.listaPreguntasTodas.filter(
    p => p.seccionIndex === estadoSimulador.seccionActualIndex
  );
  estadoSimulador.indexPreguntaActual = 0;

  // Asignar tiempo de la sección
  const totalMinutos = estadoSimulador.examenActual.tiempoMinutos || 90;
  const totalPreguntasGlobal = estadoSimulador.listaPreguntasTodas.length;
  const preguntasSeccionCount = estadoSimulador.listaPreguntasSeccion.length;

  const minutosSeccion = secData.tiempoMinutos || Math.max(10, Math.round(totalMinutos * (preguntasSeccionCount / totalPreguntasGlobal)));
  estadoSimulador.tiempoRestanteSegundos = minutosSeccion * 60;

  // Actualizar encabezado del examen
  document.getElementById("exam-runner-title").innerText = estadoSimulador.examenActual.titulo;
  const secBadge = document.getElementById("exam-section-badge");
  if (secBadge) {
    secBadge.innerText = `Sección ${estadoSimulador.seccionActualIndex + 1} de ${estadoSimulador.examenActual.secciones.length}: ${secData.nombre}`;
  }

  iniciarTemporizador();
  renderPreguntaActual();
  renderPaletaNavegacion();
}

function iniciarTemporizador() {
  if (estadoSimulador.timerInterval) clearInterval(estadoSimulador.timerInterval);

  actualizarDisplayTimer();
  estadoSimulador.timerInterval = setInterval(() => {
    if (estadoSimulador.tiempoRestanteSegundos > 0) {
      estadoSimulador.tiempoRestanteSegundos--;
      actualizarDisplayTimer();
    } else {
      clearInterval(estadoSimulador.timerInterval);
      reproducirAudioEvento("tiempoAgotado");
      alert("⏱️ El tiempo de esta sección ha finalizado.");
      finalizarSeccionActual();
    }
  }, 1000);
}

function actualizarDisplayTimer() {
  const timerBadge = document.getElementById("timer-badge-text");
  if (!timerBadge) return;

  const min = Math.floor(estadoSimulador.tiempoRestanteSegundos / 60);
  const seg = estadoSimulador.tiempoRestanteSegundos % 60;
  const minStr = String(min).padStart(2, '0');
  const segStr = String(seg).padStart(2, '0');

  timerBadge.innerText = `${minStr}:${segStr}`;

  if (estadoSimulador.tiempoRestanteSegundos < 180) {
    timerBadge.classList.add("warning-timer");
  } else {
    timerBadge.classList.remove("warning-timer");
  }
}

// --------------------------------------------------------------------------
// 4. RENDERIZADO DE PREGUNTA, MONDAI Y PALETA
// --------------------------------------------------------------------------
function renderPreguntaActual() {
  const container = document.getElementById("pregunta-card-container");
  const idx = estadoSimulador.indexPreguntaActual;
  const totalSec = estadoSimulador.listaPreguntasSeccion.length;
  const pregunta = estadoSimulador.listaPreguntasSeccion[idx];

  if (!container || !pregunta) return;

  // Barra de progreso
  const progressPercent = ((idx + 1) / totalSec) * 100;
  document.getElementById("progress-bar-fill").style.width = `${progressPercent}%`;
  document.getElementById("progress-text").innerText = `Pregunta ${idx + 1} de ${totalSec} (Sección ${estadoSimulador.seccionActualIndex + 1})`;

  const respuestaGuardada = estadoSimulador.respuestasUsuario[pregunta.globalIndex];
  const estaMarcada = estadoSimulador.preguntasMarcadas[pregunta.globalIndex] || false;

  const imgUrl = pregunta.imagenUrl || pregunta.imagen || pregunta.image;
  const audioUrl = pregunta.audioUrl || pregunta.audio;
  const instruccionTexto = pregunta.instruccion || pregunta.contexto;

  // Detección de bloque de もんだい (Mondai)
  const hasMondai = pregunta.mondai || pregunta.mondaiInstruccion || pregunta.mondaiImagen || pregunta.mondaiEjemplo;
  const mondaiTitulo = pregunta.mondai || "もんだい";
  const mondaiInstruccionText = pregunta.mondaiInstruccion;
  const mondaiImg = pregunta.mondaiImagen;
  const mondaiEjemploText = pregunta.mondaiEjemplo;

  container.innerHTML = `
    <div class="question-header-tag">
      <span>${pregunta.seccionIcono} ${pregunta.seccionNombre}</span>
      <button class="btn-flag-question ${estaMarcada ? 'flagged' : ''}" onclick="toggleMarcarPregunta(${pregunta.globalIndex})">
        ${estaMarcada ? '📌 Marcada para revisión' : '📍 Marcar pregunta'}
      </button>
    </div>

    ${hasMondai ? `
      <div class="mondai-instruction-card">
        <div class="mondai-card-header">
          <span class="mondai-header-badge">📌 ${mondaiTitulo}</span>
        </div>
        ${mondaiInstruccionText ? `<div class="mondai-instruction-text">${mondaiInstruccionText}</div>` : ''}
        ${mondaiImg ? `
          <div class="mondai-image-box">
            <div class="mondai-image-wrapper" onclick="abrirModalImagen('${mondaiImg}')" title="Haz clic para ampliar la instrucción/ejemplo del もんだい">
              <img src="${mondaiImg}" alt="Instrucción de ${mondaiTitulo}">
              <span class="image-zoom-hint">🔍 Haz clic para ampliar instrucción/ejemplo</span>
            </div>
          </div>
        ` : ''}
        ${mondaiEjemploText ? `
          <div class="mondai-example-box">
            <span class="example-badge">💡 (もんだいれい / Ejemplo):</span>
            <div class="example-body">${mondaiEjemploText}</div>
          </div>
        ` : ''}
      </div>
    ` : ''}

    ${instruccionTexto ? `
      <div class="question-instruction-box">
        <span class="instruction-badge">📋 Instrucción / Contexto:</span>
        <div class="instruction-body">${instruccionTexto}</div>
      </div>
    ` : ''}

    <div class="question-sentence-card">
      <div class="question-text">${pregunta.pregunta}</div>
    </div>

    ${audioUrl ? `
      <div class="question-audio-player">
        <audio controls src="${audioUrl}"></audio>
      </div>
    ` : ''}

    ${imgUrl ? `
      <div class="question-image-box">
        <div class="question-image-wrapper" onclick="abrirModalImagen('${imgUrl}')" title="Haz clic para ampliar la imagen">
          <img src="${imgUrl}" alt="Imagen de apoyo para la pregunta">
          <span class="image-zoom-hint">🔍 Haz clic para ampliar</span>
        </div>
      </div>
    ` : ''}

    <div class="question-options-list">
      ${pregunta.opciones.map((opcionStr, opcIdx) => `
        <div class="option-chip ${respuestaGuardada === opcIdx ? 'selected' : ''}" onclick="seleccionarRespuesta(${pregunta.globalIndex}, ${opcIdx})">
          <span class="option-radio">${respuestaGuardada === opcIdx ? '🔘' : '⚪'}</span>
          <span class="option-text">${opcionStr}</span>
        </div>
      `).join("")}
    </div>
  `;

  // Actualizar botones de navegación inferior
  const btnPrev = document.getElementById("btn-prev-question");
  const btnNext = document.getElementById("btn-next-question");
  if (btnPrev) btnPrev.disabled = (idx === 0);
  if (btnNext) btnNext.disabled = (idx === totalSec - 1);

  actualizarEstadoPaleta();
}

function seleccionarRespuesta(globalIdx, opcionIdx) {
  estadoSimulador.respuestasUsuario[globalIdx] = opcionIdx;
  renderPreguntaActual();
}

function toggleMarcarPregunta(globalIdx) {
  estadoSimulador.preguntasMarcadas[globalIdx] = !estadoSimulador.preguntasMarcadas[globalIdx];
  renderPreguntaActual();
}

function anteriorPregunta() {
  if (estadoSimulador.indexPreguntaActual > 0) {
    estadoSimulador.indexPreguntaActual--;
    renderPreguntaActual();
  }
}

function siguientePregunta() {
  if (estadoSimulador.indexPreguntaActual < estadoSimulador.listaPreguntasSeccion.length - 1) {
    estadoSimulador.indexPreguntaActual++;
    renderPreguntaActual();
  }
}

function irAPregunta(idxRelativo) {
  if (idxRelativo >= 0 && idxRelativo < estadoSimulador.listaPreguntasSeccion.length) {
    estadoSimulador.indexPreguntaActual = idxRelativo;
    renderPreguntaActual();
  }
}

function renderPaletaNavegacion() {
  const container = document.getElementById("paleta-preguntas-grid");
  if (!container) return;

  const total = estadoSimulador.listaPreguntasSeccion.length;
  let html = "";

  for (let i = 0; i < total; i++) {
    html += `<button id="palette-btn-${i}" class="palette-num-btn" onclick="irAPregunta(${i})">${i + 1}</button>`;
  }

  container.innerHTML = html;

  // Actualizar botón de entregar de la paleta
  const submitBtn = document.querySelector(".btn-submit-exam");
  if (submitBtn) {
    const esUltimaSeccion = (estadoSimulador.seccionActualIndex === estadoSimulador.examenActual.secciones.length - 1);
    if (esUltimaSeccion) {
      submitBtn.innerHTML = "🏁 Finalizar y Entregar Examen";
      submitBtn.onclick = () => finalizarSeccionActual();
    } else {
      submitBtn.innerHTML = `☕ Completar Sección ${estadoSimulador.seccionActualIndex + 1}`;
      submitBtn.onclick = () => finalizarSeccionActual();
    }
  }

  actualizarEstadoPaleta();
}

function actualizarEstadoPaleta() {
  const total = estadoSimulador.listaPreguntasSeccion.length;
  for (let i = 0; i < total; i++) {
    const btn = document.getElementById(`palette-btn-${i}`);
    if (!btn) continue;

    const preg = estadoSimulador.listaPreguntasSeccion[i];
    btn.className = "palette-num-btn";
    if (i === estadoSimulador.indexPreguntaActual) btn.classList.add("current");
    if (estadoSimulador.respuestasUsuario[preg.globalIndex] !== undefined) btn.classList.add("answered");
    if (estadoSimulador.preguntasMarcadas[preg.globalIndex]) btn.classList.add("flagged");
  }
}

// --------------------------------------------------------------------------
// 5. FINALIZAR SECCIÓN Y SISTEMA DE DESCANSO DE 15 MINUTOS
// --------------------------------------------------------------------------
function finalizarSeccionActual() {
  if (estadoSimulador.timerInterval) clearInterval(estadoSimulador.timerInterval);

  const esUltimaSeccion = (estadoSimulador.seccionActualIndex >= estadoSimulador.examenActual.secciones.length - 1);

  if (esUltimaSeccion) {
    finalizarYEntregarExamen();
  } else {
    abrirModalDescanso();
  }
}

function abrirModalDescanso() {
  if (estadoSimulador.timerInterval) clearInterval(estadoSimulador.timerInterval);

  reproducirAudioEvento("inicioDescanso");

  // Ocultar runner y mostrar modal de descanso
  document.getElementById("jlpt-exam-screen").style.display = "none";
  const breakModal = document.getElementById("jlpt-break-modal");
  if (breakModal) breakModal.style.display = "flex";

  const secCompletada = estadoSimulador.examenActual.secciones[estadoSimulador.seccionActualIndex];
  const secSiguiente = estadoSimulador.examenActual.secciones[estadoSimulador.seccionActualIndex + 1];

  const titleCompleted = document.getElementById("break-completed-sec-title");
  const titleNext = document.getElementById("break-next-section-title");

  if (titleCompleted) {
    titleCompleted.innerText = `¡Has completado la Sección ${estadoSimulador.seccionActualIndex + 1}: ${secCompletada.nombre}!`;
  }
  if (titleNext) {
    titleNext.innerText = `Sección ${estadoSimulador.seccionActualIndex + 2}: ${secSiguiente.nombre}`;
  }

  // 15 minutos (900 seg) total, 2 minutos (120 seg) obligatorios
  estadoSimulador.tiempoDescansoRestante = 15 * 60;
  estadoSimulador.tiempoDescansoObligatorioRestante = 2 * 60;

  actualizarDisplayDescanso();

  if (estadoSimulador.descansoTimerInterval) clearInterval(estadoSimulador.descansoTimerInterval);

  estadoSimulador.descansoTimerInterval = setInterval(() => {
    if (estadoSimulador.tiempoDescansoRestante > 0) {
      estadoSimulador.tiempoDescansoRestante--;
      if (estadoSimulador.tiempoDescansoObligatorioRestante > 0) {
        estadoSimulador.tiempoDescansoObligatorioRestante--;
      }
      actualizarDisplayDescanso();
    } else {
      clearInterval(estadoSimulador.descansoTimerInterval);
      omitirDescanso();
    }
  }, 1000);
}

function actualizarDisplayDescanso() {
  const clock = document.getElementById("break-timer-clock");
  const mandClock = document.getElementById("break-mandatory-clock");
  const mandStatus = document.getElementById("break-mandatory-status");
  const btnSkip = document.getElementById("btn-skip-break");

  const minD = Math.floor(estadoSimulador.tiempoDescansoRestante / 60);
  const segD = estadoSimulador.tiempoDescansoRestante % 60;
  if (clock) {
    clock.innerText = `${String(minD).padStart(2, '0')}:${String(segD).padStart(2, '0')}`;
  }

  const minO = Math.floor(estadoSimulador.tiempoDescansoObligatorioRestante / 60);
  const segO = estadoSimulador.tiempoDescansoObligatorioRestante % 60;
  const timeObligStr = `${String(minO).padStart(2, '0')}:${String(segO).padStart(2, '0')}`;

  if (mandClock) mandClock.innerText = timeObligStr;

  const secSiguiente = estadoSimulador.examenActual.secciones[estadoSimulador.seccionActualIndex + 1];

  if (estadoSimulador.tiempoDescansoObligatorioRestante > 0) {
    if (mandStatus) {
      mandStatus.className = "break-mandatory-status mandatory-active";
      mandStatus.innerHTML = `⏳ Tiempo obligatorio de descanso: <strong>${timeObligStr}</strong> restantes para poder omitir.`;
    }
    if (btnSkip) {
      btnSkip.disabled = true;
      btnSkip.innerHTML = `🔒 Omitir descanso (Disponible en ${timeObligStr})`;
    }
  } else {
    if (mandStatus) {
      mandStatus.className = "break-mandatory-status mandatory-done";
      mandStatus.innerHTML = `✅ ¡Has cumplido el tiempo obligatorio de descanso! Puedes continuar cuando desees.`;
    }
    if (btnSkip) {
      btnSkip.disabled = false;
      btnSkip.innerHTML = `⏩ Omitir descanso e iniciar Sección ${estadoSimulador.seccionActualIndex + 2}: ${secSiguiente?.nombre || ''}`;
    }
  }
}

function omitirDescanso() {
  if (estadoSimulador.descansoTimerInterval) {
    clearInterval(estadoSimulador.descansoTimerInterval);
  }

  reproducirAudioEvento("finDescanso");

  estadoSimulador.seccionActualIndex++;
  iniciarSeccionActual();
}

// --------------------------------------------------------------------------
// 6. RESULTADOS GLOBALES Y REVISIÓN DE LAS 3 SECCIONES
// --------------------------------------------------------------------------
function finalizarYEntregarExamen() {
  if (estadoSimulador.timerInterval) clearInterval(estadoSimulador.timerInterval);
  if (estadoSimulador.descansoTimerInterval) clearInterval(estadoSimulador.descansoTimerInterval);

  reproducirAudioEvento("finalExamen");

  estadoSimulador.examenCompletado = true;

  const total = estadoSimulador.listaPreguntasTodas.length;
  let correctas = 0;
  const desgloseSecciones = {};

  estadoSimulador.listaPreguntasTodas.forEach(p => {
    const respUser = estadoSimulador.respuestasUsuario[p.globalIndex];
    const esCorrecta = (respUser === p.respuestaCorrecta);

    if (esCorrecta) correctas++;

    if (!desgloseSecciones[p.seccionNombre]) {
      desgloseSecciones[p.seccionNombre] = { total: 0, correctas: 0, icono: p.seccionIcono };
    }
    desgloseSecciones[p.seccionNombre].total++;
    if (esCorrecta) desgloseSecciones[p.seccionNombre].correctas++;
  });

  const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;
  const aprobado = porcentaje >= 60;

  const XP_REQUERIDA_POR_NIVEL = {
    "KANA": 250,
    "N5": 0,
    "N4": 5000,
    "N3": 10000,
    "N2": 20000,
    "N1": 30000
  };

  const lvlKey = estadoSimulador.nivelActual;
  const xpRequerida = XP_REQUERIDA_POR_NIVEL[lvlKey] || 0;

  let certGenerado = null;
  if (aprobado) {
    if (typeof concederXP === "function") {
      const currentXp = (window.userProfile && window.userProfile.xp) ? window.userProfile.xp : 0;
      if (currentXp < xpRequerida) {
        const xpBonus = xpRequerida - currentXp;
        concederXP(xpBonus, `🏆 Examen JLPT ${lvlKey} Aprobado - Nivel Desbloqueado`);
      } else {
        concederXP(100, `🏆 Examen JLPT ${lvlKey} Aprobado`);
      }
    }

    if (typeof generarYGuardarCertificadoJLPT === "function") {
      certGenerado = generarYGuardarCertificadoJLPT(correctas, total, porcentaje, desgloseSecciones);
    }
  }

  mostrarPantallaResultados(correctas, total, porcentaje, aprobado, desgloseSecciones, certGenerado);
}

function mostrarPantallaResultados(correctas, total, porcentaje, aprobado, desgloseSecciones, certGenerado = null) {
  document.getElementById("jlpt-exam-screen").style.display = "none";
  document.getElementById("jlpt-results-screen").style.display = "block";

  // Restaurar HUD, Hero Banner y Misiones
  const hudBar = document.getElementById("rpg-hud-bar");
  if (hudBar) hudBar.style.display = "flex";

  const heroBanner = document.querySelector(".jlpt-hero-banner");
  if (heroBanner) heroBanner.style.display = "block";

  const questsContainer = document.getElementById("daily-quests-container");
  if (questsContainer) questsContainer.style.display = "";

  const banner = document.getElementById("results-banner");
  if (banner) {
    const lvlKey = estadoSimulador.nivelActual;
    banner.className = `results-banner ${aprobado ? 'pass' : 'fail'}`;

    let certBtnHtml = "";
    if (aprobado) {
      const certIdToOpen = (certGenerado && certGenerado.id) ? certGenerado.id : "";
      certBtnHtml = `
        <div style="margin-top: 18px;">
          <button class="btn btn-primary" onclick="abrirModalCertificadoPorId('${certIdToOpen}')" style="font-size: 1.05rem; padding: 12px 24px; background: linear-gradient(135deg, #b8860b 0%, #8b6508 100%); border: none; box-shadow: 0 4px 15px rgba(184, 134, 11, 0.4); cursor: pointer;">
            📜 Ver y Descargar mi Certificado Oficial JLPT ${lvlKey}
          </button>
        </div>
      `;
    }

    banner.innerHTML = `
      <div class="banner-icon">${aprobado ? '🏆' : '⚠️'}</div>
      <h2>${aprobado ? `¡FELICITACIONES! APROBASTE EL EXAMEN JLPT ${lvlKey}` : 'NO HAS ALCANZADO EL PUNTAJE DE APROBACIÓN'}</h2>
      <p>${aprobado ? `¡Has completado las 3 secciones con éxito, obteniendo tu certificado oficial y los XP de este nivel! 🔓` : 'Sigue practicando las 3 secciones del examen y vuelve a intentarlo.'}</p>
      ${certBtnHtml}
    `;
  }

  document.getElementById("result-score-number").innerText = `${correctas} / ${total}`;
  document.getElementById("result-percentage").innerText = `${porcentaje}%`;

  // Desglose por sección
  const containerDesglose = document.getElementById("results-sections-breakdown");
  if (containerDesglose) {
    containerDesglose.innerHTML = Object.keys(desgloseSecciones).map(secNombre => {
      const item = desgloseSecciones[secNombre];
      const pSec = item.total > 0 ? Math.round((item.correctas / item.total) * 100) : 0;
      return `
        <div class="section-score-card">
          <h4>${item.icono || '📝'} ${secNombre}</h4>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width: ${pSec}%"></div>
          </div>
          <span>${item.correctas} de ${item.total} (${pSec}%)</span>
        </div>
      `;
    }).join("");
  }

  // Revisión detallada de preguntas de todas las secciones
  const containerRevision = document.getElementById("results-questions-review");
  if (containerRevision) {
    containerRevision.innerHTML = estadoSimulador.listaPreguntasTodas.map((p, idx) => {
      const respUser = estadoSimulador.respuestasUsuario[p.globalIndex];
      const esCorrecta = (respUser === p.respuestaCorrecta);
      const respUserStr = (respUser !== undefined) ? p.opciones[respUser] : "Sin responder";
      const respCorrectaStr = p.opciones[p.respuestaCorrecta];

      const imgUrl = p.imagenUrl || p.imagen || p.image;
      const audioUrl = p.audioUrl || p.audio;
      const instruccionTexto = p.instruccion || p.contexto;

      const hasMondai = p.mondai || p.mondaiInstruccion || p.mondaiImagen || p.mondaiEjemplo;
      const mondaiTitulo = p.mondai || "もんだい";
      const mondaiInstruccionText = p.mondaiInstruccion;
      const mondaiImg = p.mondaiImagen;

      return `
        <div class="review-question-card ${esCorrecta ? 'correct' : 'incorrect'}">
          <div class="review-card-header">
            <span class="review-q-num">Pregunta ${idx + 1} (${p.seccionNombre})</span>
            <span class="review-q-status">${esCorrecta ? '✅ Correcta' : '❌ Incorrecta'}</span>
          </div>

          ${hasMondai ? `
            <div class="mondai-instruction-card" style="margin-bottom: 14px;">
              <div class="mondai-card-header">
                <span class="mondai-header-badge">📌 ${mondaiTitulo}</span>
              </div>
              ${mondaiInstruccionText ? `<div class="mondai-instruction-text" style="font-size: 1.05rem;">${mondaiInstruccionText}</div>` : ''}
              ${mondaiImg ? `
                <div class="mondai-image-box" style="margin-top: 8px;">
                  <div class="mondai-image-wrapper" onclick="abrirModalImagen('${mondaiImg}')" title="Haz clic para ampliar">
                    <img src="${mondaiImg}" alt="Instrucción de ${mondaiTitulo}">
                    <span class="image-zoom-hint">🔍 Ampliar instrucción</span>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${instruccionTexto ? `
            <div class="question-instruction-box" style="margin-bottom: 12px; padding: 10px 14px; font-size: 1.05rem;">
              <span class="instruction-badge">📋 Instrucción / Contexto:</span>
              <div class="instruction-body">${instruccionTexto}</div>
            </div>
          ` : ''}

          <div class="review-q-text">${p.pregunta}</div>

          ${audioUrl ? `
            <div class="question-audio-player" style="margin-bottom: 12px;">
              <audio controls src="${audioUrl}"></audio>
            </div>
          ` : ''}

          ${imgUrl ? `
            <div class="question-image-box" style="margin-bottom: 14px;">
              <div class="question-image-wrapper" onclick="abrirModalImagen('${imgUrl}')" title="Haz clic para ampliar">
                <img src="${imgUrl}" alt="Imagen de apoyo">
                <span class="image-zoom-hint">🔍 Ampliar</span>
              </div>
            </div>
          ` : ''}

          <div class="review-answers-box">
            <p><strong>Tu respuesta:</strong> <span class="${esCorrecta ? 'text-correct' : 'text-incorrect'}">${respUserStr}</span></p>
            ${!esCorrecta ? `<p><strong>Respuesta correcta:</strong> <span class="text-correct">${respCorrectaStr}</span></p>` : ''}
          </div>
          ${p.explicacion ? `<div class="review-explanation"><strong>Explicación:</strong> ${p.explicacion}</div>` : ''}
        </div>
      `;
    }).join("");
  }
}

function volverAlSelectorJLPT() {
  if (estadoSimulador.timerInterval) clearInterval(estadoSimulador.timerInterval);
  if (estadoSimulador.descansoTimerInterval) clearInterval(estadoSimulador.descansoTimerInterval);

  const startModal = document.getElementById("jlpt-start-modal");
  const breakModal = document.getElementById("jlpt-break-modal");
  if (startModal) startModal.style.display = "none";
  if (breakModal) breakModal.style.display = "none";

  document.getElementById("jlpt-exam-screen").style.display = "none";
  document.getElementById("jlpt-results-screen").style.display = "none";
  document.getElementById("jlpt-selector-screen").style.display = "block";

  // Restaurar HUD, Hero Banner y Misiones
  const hudBar = document.getElementById("rpg-hud-bar");
  if (hudBar) hudBar.style.display = "flex";

  const heroBanner = document.querySelector(".jlpt-hero-banner");
  if (heroBanner) heroBanner.style.display = "block";

  const questsContainer = document.getElementById("daily-quests-container");
  if (questsContainer) questsContainer.style.display = "";
}

// --------------------------------------------------------------------------
// 7. MODAL LIGHTBOX DE IMÁGENES
// --------------------------------------------------------------------------
function abrirModalImagen(src) {
  const modal = document.getElementById("jlpt-image-modal");
  const modalImg = document.getElementById("jlpt-modal-img");
  if (modal && modalImg) {
    modalImg.src = src;
    modal.classList.add("active");
  }
}

function cerrarModalImagen(event) {
  if (!event || event.target.id === "jlpt-image-modal" || event.target.classList.contains("jlpt-image-modal-close")) {
    const modal = document.getElementById("jlpt-image-modal");
    if (modal) {
      modal.classList.remove("active");
    }
  }
}
