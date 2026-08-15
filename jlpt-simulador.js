// ==========================================================================
// SECCIÓN: LÓGICA Y MOTOR DEL SIMULADOR JLPT
// ==========================================================================

let estadoSimulador = {
  nivelActual: "N5",
  examenActualKey: "examen-1",
  examenActual: null,
  listaPreguntas: [], // Arreglo plano de todas las preguntas del examen
  respuestasUsuario: {}, // { indexPregunta: indiceOpcion }
  preguntasMarcadas: {}, // { indexPregunta: boolean }
  indexPreguntaActual: 0,
  tiempoRestanteSegundos: 0,
  timerInterval: null,
  examenCompletado: false
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("jlpt-simulador-app")) {
    initSimuladorJLPT();
  }
});

function initSimuladorJLPT() {
  renderNivelSelector();
  seleccionarNivel("N5");
}

// --------------------------------------------------------------------------
// 1. RENDERIZADO Y NAVEGACIÓN EN PANTALLA SELECTORA
// --------------------------------------------------------------------------
function renderNivelSelector() {
  const container = document.getElementById("nivel-cards-container");
  if (!container) return;

  const niveles = [
    { id: "N5", nombre: "JLPT N5", badge: "Principiante", desc: "Vocabulario básico, Hiragana, Katakana y Kanjis elementales." },
    { id: "N4", nombre: "JLPT N4", badge: "Elemental", desc: "Japonés básico cotidiano y estructuras gramaticales fundamentales." },
    { id: "N3", nombre: "JLPT N3", badge: "Intermedio", desc: "Puente hacia el nivel avanzado con lectura de textos cotidianos." },
    { id: "N2", nombre: "JLPT N2", badge: "Avanzado", desc: "Comprensión fluida en situaciones de la vida diaria y negocios." },
    { id: "N1", nombre: "JLPT N1", badge: "Maestría", desc: "Dominio fluido y comprensión en una amplia variedad de circunstancias." }
  ];

  container.innerHTML = niveles.map(n => `
    <div class="jlpt-level-card ${n.id === estadoSimulador.nivelActual ? 'active' : ''}" onclick="seleccionarNivel('${n.id}')">
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
  
  // Actualizar UI nivel activo
  const cards = document.querySelectorAll(".jlpt-level-card");
  cards.forEach(card => card.classList.remove("active"));
  const activeCard = Array.from(cards).find(c => c.innerHTML.includes(`JLPT ${nivelKey}`));
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

  // Contar total preguntas
  let totalPreguntas = 0;
  examData.secciones.forEach(sec => totalPreguntas += sec.preguntas.length);

  infoContainer.innerHTML = `
    <div class="preview-info-grid">
      <div class="preview-item">
        <span class="preview-icon">⏱️</span>
        <div>
          <strong>Tiempo Límite:</strong>
          <p>${examData.tiempoMinutos} Minutos</p>
        </div>
      </div>
      <div class="preview-item">
        <span class="preview-icon">📝</span>
        <div>
          <strong>Total Preguntas:</strong>
          <p>${totalPreguntas} Reactivos</p>
        </div>
      </div>
      <div class="preview-item">
        <span class="preview-icon">🧩</span>
        <div>
          <strong>Secciones:</strong>
          <p>${examData.secciones.map(s => s.nombre).join(" • ")}</p>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 2. INICIO Y EJECUCIÓN DEL EXAMEN
// --------------------------------------------------------------------------
function comenzarSimulacro() {
  const examData = JLPT_DATA[estadoSimulador.nivelActual]?.[estadoSimulador.examenActualKey];
  if (!examData) return;

  estadoSimulador.examenActual = examData;
  estadoSimulador.listaPreguntas = [];
  estadoSimulador.respuestasUsuario = {};
  estadoSimulador.preguntasMarcadas = {};
  estadoSimulador.indexPreguntaActual = 0;
  estadoSimulador.examenCompletado = false;
  estadoSimulador.tiempoRestanteSegundos = examData.tiempoMinutos * 60;

  // Aplanar preguntas asociándoles su sección
  examData.secciones.forEach(sec => {
    sec.preguntas.forEach(p => {
      estadoSimulador.listaPreguntas.push({
        ...p,
        seccionNombre: sec.nombre,
        seccionIcono: sec.icono || "📝"
      });
    });
  });

  // Ocultar selector y mostrar pantalla de examen
  document.getElementById("jlpt-selector-screen").style.display = "none";
  document.getElementById("jlpt-results-screen").style.display = "none";
  document.getElementById("jlpt-exam-screen").style.display = "block";

  document.getElementById("exam-runner-title").innerText = examData.titulo;

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
      alert("⏱️ El tiempo ha finalizado. Se entregará el examen automáticamente.");
      finalizarYEntregarExamen();
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

  if (estadoSimulador.tiempoRestanteSegundos < 300) {
    timerBadge.classList.add("warning-timer");
  } else {
    timerBadge.classList.remove("warning-timer");
  }
}

// --------------------------------------------------------------------------
// 3. RENDERIZADO DE PREGUNTA Y PALETA
// --------------------------------------------------------------------------
function renderPreguntaActual() {
  const container = document.getElementById("pregunta-card-container");
  const idx = estadoSimulador.indexPreguntaActual;
  const total = estadoSimulador.listaPreguntas.length;
  const pregunta = estadoSimulador.listaPreguntas[idx];

  if (!container || !pregunta) return;

  // Actualizar barra de progreso
  const progressPercent = ((idx + 1) / total) * 100;
  document.getElementById("progress-bar-fill").style.width = `${progressPercent}%`;
  document.getElementById("progress-text").innerText = `Pregunta ${idx + 1} de ${total}`;

  const respuestaGuardada = estadoSimulador.respuestasUsuario[idx];
  const estaMarcada = estadoSimulador.preguntasMarcadas[idx] || false;

  container.innerHTML = `
    <div class="question-header-tag">
      <span>${pregunta.seccionIcono} ${pregunta.seccionNombre}</span>
      <button class="btn-flag-question ${estaMarcada ? 'flagged' : ''}" onclick="toggleMarcarPregunta(${idx})">
        ${estaMarcada ? '📌 Marcada para revisión' : '📍 Marcar pregunta'}
      </button>
    </div>

    ${pregunta.contexto ? `<div class="question-context-box">${pregunta.contexto}</div>` : ''}

    <div class="question-text">${pregunta.pregunta}</div>

    ${pregunta.audioUrl ? `
      <div class="question-audio-player">
        <audio controls src="${pregunta.audioUrl}"></audio>
      </div>
    ` : ''}

    ${pregunta.imagenUrl ? `
      <div class="question-image-box">
        <img src="${pregunta.imagenUrl}" alt="Apoyo gráfico">
      </div>
    ` : ''}

    <div class="question-options-list">
      ${pregunta.opciones.map((opcionStr, opcIdx) => `
        <div class="option-chip ${respuestaGuardada === opcIdx ? 'selected' : ''}" onclick="seleccionarRespuesta(${idx}, ${opcIdx})">
          <span class="option-radio">${respuestaGuardada === opcIdx ? '🔘' : '⚪'}</span>
          <span class="option-text">${opcionStr}</span>
        </div>
      `).join("")}
    </div>
  `;

  // Actualizar botones de navegación
  const btnPrev = document.getElementById("btn-prev-question");
  const btnNext = document.getElementById("btn-next-question");
  if (btnPrev) btnPrev.disabled = (idx === 0);
  if (btnNext) btnNext.disabled = (idx === total - 1);

  actualizarEstadoPaleta();
}

function seleccionarRespuesta(preguntaIdx, opcionIdx) {
  estadoSimulador.respuestasUsuario[preguntaIdx] = opcionIdx;
  renderPreguntaActual();
}

function toggleMarcarPregunta(preguntaIdx) {
  estadoSimulador.preguntasMarcadas[preguntaIdx] = !estadoSimulador.preguntasMarcadas[preguntaIdx];
  renderPreguntaActual();
}

function anteriorPregunta() {
  if (estadoSimulador.indexPreguntaActual > 0) {
    estadoSimulador.indexPreguntaActual--;
    renderPreguntaActual();
  }
}

function siguientePregunta() {
  if (estadoSimulador.indexPreguntaActual < estadoSimulador.listaPreguntas.length - 1) {
    estadoSimulador.indexPreguntaActual++;
    renderPreguntaActual();
  }
}

function irAPregunta(idx) {
  if (idx >= 0 && idx < estadoSimulador.listaPreguntas.length) {
    estadoSimulador.indexPreguntaActual = idx;
    renderPreguntaActual();
  }
}

function renderPaletaNavegacion() {
  const container = document.getElementById("paleta-preguntas-grid");
  if (!container) return;

  const total = estadoSimulador.listaPreguntas.length;
  let html = "";

  for (let i = 0; i < total; i++) {
    html += `<button id="palette-btn-${i}" class="palette-num-btn" onclick="irAPregunta(${i})">${i + 1}</button>`;
  }

  container.innerHTML = html;
  actualizarEstadoPaleta();
}

function actualizarEstadoPaleta() {
  const total = estadoSimulador.listaPreguntas.length;
  for (let i = 0; i < total; i++) {
    const btn = document.getElementById(`palette-btn-${i}`);
    if (!btn) continue;

    btn.className = "palette-num-btn";
    if (i === estadoSimulador.indexPreguntaActual) btn.classList.add("current");
    if (estadoSimulador.respuestasUsuario[i] !== undefined) btn.classList.add("answered");
    if (estadoSimulador.preguntasMarcadas[i]) btn.classList.add("flagged");
  }
}

// --------------------------------------------------------------------------
// 4. CÁLCULO DE RESULTADOS Y ENTREGA
// --------------------------------------------------------------------------
function finalizarYEntregarExamen() {
  if (estadoSimulador.timerInterval) clearInterval(estadoSimulador.timerInterval);

  estadoSimulador.examenCompletado = true;

  const total = estadoSimulador.listaPreguntas.length;
  let correctas = 0;

  // Desglose por sección
  const desgloseSecciones = {};

  estadoSimulador.listaPreguntas.forEach((p, idx) => {
    const respUser = estadoSimulador.respuestasUsuario[idx];
    const esCorrecta = (respUser === p.respuestaCorrecta);

    if (esCorrecta) correctas++;

    if (!desgloseSecciones[p.seccionNombre]) {
      desgloseSecciones[p.seccionNombre] = { total: 0, correctas: 0 };
    }
    desgloseSecciones[p.seccionNombre].total++;
    if (esCorrecta) desgloseSecciones[p.seccionNombre].correctas++;
  });

  const porcentaje = Math.round((correctas / total) * 100);
  const aprobado = porcentaje >= 60;

  // Conceder XP si la función RPG existe
  if (typeof concederXP === "function" && aprobado) {
    concederXP(50, "🏆 Aprobaste el Simulacro JLPT");
  }

  mostrarPantallaResultados(correctas, total, porcentaje, aprobado, desgloseSecciones);
}

function mostrarPantallaResultados(correctas, total, porcentaje, aprobado, desgloseSecciones) {
  document.getElementById("jlpt-exam-screen").style.display = "none";
  document.getElementById("jlpt-results-screen").style.display = "block";

  const banner = document.getElementById("results-banner");
  if (banner) {
    banner.className = `results-banner ${aprobado ? 'pass' : 'fail'}`;
    banner.innerHTML = `
      <div class="banner-icon">${aprobado ? '🏆' : '⚠️'}</div>
      <h2>${aprobado ? '¡FELICITACIONES! APROBASTE EL SIMULACRO' : 'NO HAZ ALCANZADO EL PUNTAJE DE APROBACIÓN'}</h2>
      <p>${aprobado ? 'Has demostrado los conocimientos requeridos para este nivel JLPT.' : 'Sigue practicando las lecciones y vuelve a intentarlo pronto.'}</p>
    `;
  }

  document.getElementById("result-score-number").innerText = `${correctas} / ${total}`;
  document.getElementById("result-percentage").innerText = `${porcentaje}%`;

  // Renderizar desglose por sección
  const containerDesglose = document.getElementById("results-sections-breakdown");
  if (containerDesglose) {
    containerDesglose.innerHTML = Object.keys(desgloseSecciones).map(secNombre => {
      const item = desgloseSecciones[secNombre];
      const pSec = Math.round((item.correctas / item.total) * 100);
      return `
        <div class="section-score-card">
          <h4>${secNombre}</h4>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width: ${pSec}%"></div>
          </div>
          <span>${item.correctas} de ${item.total} (${pSec}%)</span>
        </div>
      `;
    }).join("");
  }

  // Renderizar revisión pregunta por pregunta
  const containerRevision = document.getElementById("results-questions-review");
  if (containerRevision) {
    containerRevision.innerHTML = estadoSimulador.listaPreguntas.map((p, idx) => {
      const respUser = estadoSimulador.respuestasUsuario[idx];
      const esCorrecta = (respUser === p.respuestaCorrecta);
      const respUserStr = (respUser !== undefined) ? p.opciones[respUser] : "Sin responder";
      const respCorrectaStr = p.opciones[p.respuestaCorrecta];

      return `
        <div class="review-question-card ${esCorrecta ? 'correct' : 'incorrect'}">
          <div class="review-card-header">
            <span class="review-q-num">Pregunta ${idx + 1} (${p.seccionNombre})</span>
            <span class="review-q-status">${esCorrecta ? '✅ Correcta' : '❌ Incorrecta'}</span>
          </div>
          <div class="review-q-text">${p.pregunta}</div>
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
  document.getElementById("jlpt-exam-screen").style.display = "none";
  document.getElementById("jlpt-results-screen").style.display = "none";
  document.getElementById("jlpt-selector-screen").style.display = "block";
}
