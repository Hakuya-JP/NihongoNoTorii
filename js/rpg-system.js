// ==========================================================================
// SECCIÓN 6 (RPG): MÓDULO SISTEMA RPG Y REPRODUCTOR BGM
// ==========================================================================

const BGM_PLAYLIST = [
  { title: "Un Pensamiento", src: "audio/musicafondo/Light Ambience 1.mp3" },
  { title: "Curiosa Obsesión", src: "audio/musicafondo/Light Ambience 2.mp3" },
  { title: "Anochecer", src: "audio/musicafondo/Light Ambience 3.mp3" },
  { title: "Epilogo", src: "audio/musicafondo/Light Ambience 4.mp3" },
  { title: "Una Oportunidad", src: "audio/musicafondo/Light Ambience 5.mp3" },
  { title: "Ecos de soledad", src: "audio/musicafondo/Ambient 6.mp3" },
  { title: "Suave anochecer", src: "audio/musicafondo/Ambient 10.mp3" },
  { title: "Camino luminoso", src: "audio/musicafondo/Ambient 5.mp3" },
  { title: "Nube roja", src: "audio/musicafondo/Ambient 1.mp3" },
  { title: "Cielo", src: "audio/musicafondo/Ambient 2.mp3" }
];

// ==========================================================================
// SECCIÓN BGM AUDIO SYSTEM: REPRODUCTOR DE MÚSICA DE FONDO CON PERSISTENCIA
// ==========================================================================

let bgmAudioObject = null;

function guardarEstadoPlaybackBGM() {
  if (!bgmAudioObject) return;
  try {
    sessionStorage.setItem("bgm_track_index", (typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0);
    sessionStorage.setItem("bgm_time", bgmAudioObject.currentTime || 0);
    sessionStorage.setItem("bgm_timestamp", Date.now());
  } catch (e) {
    console.warn("No se pudo guardar estado BGM en sessionStorage", e);
  }
}

function initBgmPlayer() {
  if (!bgmAudioObject) {
    bgmAudioObject = new Audio();
    bgmAudioObject.volume = (typeof userProfile !== "undefined" && userProfile.musicVolume !== undefined) ? userProfile.musicVolume : 0.35;

    // Listeners de actualización de estado para sincronizar la UI del HUD inmediatamente
    bgmAudioObject.addEventListener("play", () => {
      if (typeof userProfile !== "undefined") {
        userProfile.musicEnabled = true;
        userProfile.soundEnabled = true;
        if (typeof guardarPerfil === "function") guardarPerfil();
      }
      sessionStorage.setItem("user_has_interacted", "true");
      renderHeaderRPG_HUD();
    });

    bgmAudioObject.addEventListener("pause", () => {
      renderHeaderRPG_HUD();
    });

    bgmAudioObject.addEventListener("volumechange", () => {
      renderHeaderRPG_HUD();
    });

    bgmAudioObject.addEventListener("timeupdate", () => {
      guardarEstadoPlaybackBGM();
    });

    // BUCLE INFINITO DE PLAYLIST: al terminar una canción, pasa automáticamente a la siguiente
    bgmAudioObject.addEventListener("ended", () => {
      sessionStorage.setItem("bgm_time", 0);
      siguienteCancionBGM(true);
    });

    bgmAudioObject.addEventListener("error", (e) => {
      console.warn("No se pudo cargar la canción de fondo BGM:", e);
    });

    window.addEventListener("beforeunload", () => {
      guardarEstadoPlaybackBGM();
    });
  }

  cargarCancionActualBGM();

  // Restaurar tiempo exacto de reproducción entre páginas
  const savedTime = parseFloat(sessionStorage.getItem("bgm_time"));
  const savedTimestamp = parseInt(sessionStorage.getItem("bgm_timestamp"), 10);
  let initialSeekTime = 0;

  if (!isNaN(savedTime) && !isNaN(savedTimestamp)) {
    const elapsed = (Date.now() - savedTimestamp) / 1000;
    initialSeekTime = Math.max(0, savedTime + elapsed);
  }

  const applySeekTime = () => {
    if (bgmAudioObject && initialSeekTime > 0) {
      if (bgmAudioObject.duration && initialSeekTime >= bgmAudioObject.duration) {
        sessionStorage.setItem("bgm_time", 0);
      } else {
        try {
          bgmAudioObject.currentTime = initialSeekTime;
        } catch (err) {
          console.log("No se pudo asignar currentTime:", err);
        }
      }
    }
  };

  bgmAudioObject.addEventListener("loadedmetadata", applySeekTime, { once: true });

  const userHasInteracted = sessionStorage.getItem("user_has_interacted") === "true";
  const shouldPlay = typeof userProfile !== "undefined" && userProfile.musicEnabled !== false && (userProfile.musicVolume === undefined || userProfile.musicVolume > 0);

  if (shouldPlay) {
    if (userHasInteracted) {
      bgmAudioObject.play().then(() => {
        applySeekTime();
        renderHeaderRPG_HUD();
      }).catch(e => {
        console.log("Esperando interacción inicial para BGM");
      });
    }
  } else {
    bgmAudioObject.pause();
  }

  const registrarInteraccionGlobal = () => {
    sessionStorage.setItem("user_has_interacted", "true");
    if (typeof userProfile !== "undefined" && userProfile.musicEnabled !== false && bgmAudioObject && bgmAudioObject.paused && (userProfile.musicVolume === undefined || userProfile.musicVolume > 0)) {
      bgmAudioObject.play().then(() => {
        applySeekTime();
        renderHeaderRPG_HUD();
      }).catch(e => console.log("Error al reproducir BGM en interacción"));
    }
  };

  document.addEventListener("click", registrarInteraccionGlobal, { once: true });
}

function cargarCancionActualBGM() {
  if (!bgmAudioObject) return;
  let idx = (typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0;
  if (idx < 0 || idx >= BGM_PLAYLIST.length) idx = 0;
  
  const song = BGM_PLAYLIST[idx];
  const relativeSrc = song.src;

  if (!bgmAudioObject.src.endsWith(encodeURI(relativeSrc)) && !bgmAudioObject.src.endsWith(relativeSrc)) {
    bgmAudioObject.src = relativeSrc;
  }
}

function reproducirOPausarBGM() {
  if (!bgmAudioObject) initBgmPlayer();
  cargarCancionActualBGM();

  if (bgmAudioObject.paused) {
    if (typeof userProfile !== "undefined") {
      userProfile.musicEnabled = true;
      userProfile.soundEnabled = true;
      if (typeof guardarPerfil === "function") guardarPerfil();
    }
    sessionStorage.setItem("user_has_interacted", "true");
    bgmAudioObject.play().catch(e => console.log("BGM autoplay prevenido"));
  } else {
    if (typeof userProfile !== "undefined") {
      userProfile.musicEnabled = false;
      userProfile.soundEnabled = false;
      if (typeof guardarPerfil === "function") guardarPerfil();
    }
    bgmAudioObject.pause();
  }
  renderHeaderRPG_HUD();
}

function cambiarVolumenBGM(nuevoVolumen) {
  let vol = parseFloat(nuevoVolumen);
  if (isNaN(vol)) vol = 0.35;
  vol = Math.max(0, Math.min(1, vol));

  if (typeof userProfile !== "undefined") {
    userProfile.musicVolume = vol;

    if (vol > 0 && userProfile.musicEnabled === false) {
      userProfile.musicEnabled = true;
      userProfile.soundEnabled = true;
    } else if (vol === 0) {
      userProfile.musicEnabled = false;
    }
    if (typeof guardarPerfil === "function") guardarPerfil();
  }

  if (!bgmAudioObject) initBgmPlayer();
  if (bgmAudioObject) {
    bgmAudioObject.volume = vol;
    if (vol > 0 && bgmAudioObject.paused && (typeof userProfile === "undefined" || userProfile.musicEnabled !== false)) {
      sessionStorage.setItem("user_has_interacted", "true");
      bgmAudioObject.play().catch(e => console.log("BGM play error"));
    } else if (vol === 0 && !bgmAudioObject.paused) {
      bgmAudioObject.pause();
    }
  }
  renderHeaderRPG_HUD();
}

function siguienteCancionBGM(autoPlay = true) {
  sessionStorage.setItem("bgm_time", 0);
  let idx = ((typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0) + 1;
  if (idx >= BGM_PLAYLIST.length) idx = 0;
  
  if (typeof userProfile !== "undefined") {
    userProfile.currentMusicIndex = idx;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  cargarCancionActualBGM();

  if (autoPlay && (typeof userProfile === "undefined" || userProfile.musicEnabled !== false) && bgmAudioObject) {
    bgmAudioObject.play().catch(e => console.log("Error BGM play"));
  }
  renderHeaderRPG_HUD();
  if (typeof mostrarToast === "function") mostrarToast(`🎵 Sonando: ${BGM_PLAYLIST[idx].title}`);
}

function cambiarCancionPorIndice(idx) {
  if (idx < 0 || idx >= BGM_PLAYLIST.length) return;
  sessionStorage.setItem("bgm_time", 0);
  if (typeof userProfile !== "undefined") {
    userProfile.currentMusicIndex = idx;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  cargarCancionActualBGM();
  if ((typeof userProfile === "undefined" || userProfile.musicEnabled !== false) && bgmAudioObject) {
    bgmAudioObject.play().catch(e => console.log("Error BGM play"));
  }
  renderHeaderRPG_HUD();
  if (typeof mostrarToast === "function") mostrarToast(`🎵 Selección: ${BGM_PLAYLIST[idx].title}`);
}

const RPG_NIVELES = [
  { level: 1, minXp: 0, maxXp: 249, titulo: "Aprendiz Novato ⛩️", desc: "Introducción al idioma japonés" },
  { level: 2, minXp: 250, maxXp: 699, titulo: "Iniciado en Hiragana 🌸", desc: "La Familia de los 46 Hiraganas" },
  { level: 3, minXp: 700, maxXp: 1499, titulo: "Estudiante de Hiragana 🎏", desc: "Desbloquea los sonidos impuros ゛゜y Combinaciones" },
  { level: 4, minXp: 1500, maxXp: 2499, titulo: "Dominio de Kana ⛩️", desc: "Aprende Katakana" },
  { level: 5, minXp: 2500, maxXp: 4999, titulo: "Guerrero JLPT N5 ⚔️", desc: "Completa el dominio básico y desbloquea N5" },
  { level: 6, minXp: 5000, maxXp: 9999, titulo: "Ronin JLPT N4 🏯", desc: "Desbloquea JLPT N4" },
  { level: 7, minXp: 10000, maxXp: 19999, titulo: "Samurái JLPT N3 🗡️", desc: "Desbloquea JLPT N3" },
  { level: 8, minXp: 20000, maxXp: 29999, titulo: "Bushi JLPT N2 📜", desc: "Desbloquea JLPT N2" },
  { level: 9, minXp: 30000, maxXp: 49999, titulo: "Daimyo JLPT N1 🎋", desc: "Desbloquea JLPT N1" },
  { level: 10, minXp: 50000, maxXp: Infinity, titulo: "Maestro Torii 👑", desc: "Perfeccionamiento del idioma" }
];

const LOGROS_DEFINICION = [
  { id: "primer_minado", titulo: "Primer Paso", desc: "Minar tu primera tarjeta", icono: "🥉" },
  { id: "minero_novato", titulo: "Coleccionista", desc: "Minar 10 tarjetas", icono: "🥈" },
  { id: "torii_master", titulo: "Torii Master", desc: "Minar 50 tarjetas", icono: "🥇" },
  { id: "cinefilo", titulo: "Cinéfilo Japanese", desc: "Ver 10 min de video en ToriiTV", icono: "🎬" },
  { id: "racha_constante", titulo: "Constancia", desc: "Mantener 3 días de racha", icono: "🔥" }
];

function calcularInfoNivel(xp) {
  const currentXp = Math.max(0, xp || 0);
  let index = RPG_NIVELES.findIndex(n => currentXp >= n.minXp && currentXp <= n.maxXp);
  if (index === -1) index = RPG_NIVELES.length - 1;
  const nivelActual = RPG_NIVELES[index];
  const siguienteNivel = RPG_NIVELES[index + 1] || null;

  let porcentaje = 100;
  let xpEnEsteNivel = currentXp - nivelActual.minXp;
  let xpRequeridaNivel = (siguienteNivel ? siguienteNivel.minXp : nivelActual.maxXp) - nivelActual.minXp;

  if (siguienteNivel && xpRequeridaNivel > 0) {
    porcentaje = Math.min(100, Math.max(0, Math.round((xpEnEsteNivel / xpRequeridaNivel) * 100)));
  }

  return {
    level: nivelActual.level,
    titulo: nivelActual.titulo,
    desc: nivelActual.desc,
    xpTotal: currentXp,
    xpEnEsteNivel,
    xpRequeridaNivel,
    porcentaje,
    siguienteNivel
  };
}

function playRpgSound(tipo) {
  if (typeof userProfile !== "undefined" && userProfile.soundEnabled === false) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (tipo === "xp") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (tipo === "levelup") {
      const notas = [523.25, 659.25, 783.99, 1046.50];
      notas.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } else if (tipo === "claim") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.warn("Error en Web Audio RPG:", e);
  }
}

function concederXP(cantidad, razon = "Experiencia ganada", elementoOrigen = null) {
  if (typeof cantidad !== "number" || cantidad <= 0) return;

  const xpActual = typeof userProfile !== "undefined" ? (userProfile.xp || 0) : 0;
  const infoAnt = calcularInfoNivel(xpActual);
  if (typeof userProfile !== "undefined") {
    userProfile.xp = xpActual + cantidad;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  const infoNue = calcularInfoNivel(typeof userProfile !== "undefined" ? userProfile.xp : 0);

  mostrarPopFlotanteXP(cantidad, elementoOrigen);
  playRpgSound("xp");

  registrarActividadHoy(cantidad, 0, 0);

  renderHeaderRPG_HUD();
  if (typeof renderUserProfileUI === "function") renderUserProfileUI();
  actualizarBloqueoContenidoUI();

  if (infoNue.level > infoAnt.level) {
    playRpgSound("levelup");
    mostrarModalLevelUp(infoNue, infoAnt);
  }
}

function mostrarPopFlotanteXP(cantidad, elementoOrigen) {
  const elPop = document.createElement("div");
  elPop.className = "floating-xp-pop";
  elPop.textContent = `+${cantidad} XP ✨`;

  let posX = window.innerWidth / 2 - 40;
  let posY = window.innerHeight / 2;

  if (elementoOrigen && elementoOrigen.getBoundingClientRect) {
    const rect = elementoOrigen.getBoundingClientRect();
    posX = rect.left + rect.width / 2 - 30;
    posY = rect.top - 10;
  }

  elPop.style.left = `${Math.max(10, Math.min(window.innerWidth - 100, posX))}px`;
  elPop.style.top = `${Math.max(10, posY)}px`;

  document.body.appendChild(elPop);

  setTimeout(() => {
    if (elPop.parentNode) {
      elPop.parentNode.removeChild(elPop);
    }
  }, 1400);
}

function mostrarModalLevelUp(newInfo) {
  let modalOverlay = document.getElementById("rpg-level-up-modal");
  if (!modalOverlay) {
    modalOverlay = document.createElement("div");
    modalOverlay.id = "rpg-level-up-modal";
    modalOverlay.className = "level-up-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="level-up-card">
        <div class="level-up-header-badge">⛩️🎉</div>
        <div class="level-up-title">¡LEVEL UP!</div>
        <div id="level-up-new-title" class="level-up-new-level">Nivel 2 - Iniciado en Hiragana</div>
        <p style="font-size: 0.95rem; opacity: 0.9;">¡Excelente trabajo! Has demostrado constancia en tu aprendizaje del japonés.</p>
        <div class="level-up-unlock-list">
          <div class="level-up-unlock-title">🔓 ¡Nuevo Contenido Desbloqueado!</div>
          <div id="level-up-unlocked-desc" class="level-up-unlock-item">✨ Acceso a nuevos ejercicios y lecciones</div>
        </div>
        <button id="btn-close-level-up" class="btn-level-up-continue">¡Continuar Aventura! ⚔️</button>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector("#btn-close-level-up").addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });
  }

  const titleEl = modalOverlay.querySelector("#level-up-new-title");
  const descEl = modalOverlay.querySelector("#level-up-unlocked-desc");

  if (titleEl) titleEl.textContent = `Nivel ${newInfo.level} - ${newInfo.titulo}`;
  if (descEl) descEl.textContent = `✨ ${newInfo.desc}`;

  setTimeout(() => {
    modalOverlay.classList.add("active");
  }, 100);
}

function renderHeaderRPG_HUD() {
  let hud = document.getElementById("rpg-hud-bar");
  const header = document.querySelector(".main-header");
  
  if (!hud && header) {
    hud = document.createElement("div");
    hud.id = "rpg-hud-bar";
    hud.className = "rpg-hud-bar";
    header.parentNode.insertBefore(hud, header.nextSibling);
  }

  if (!hud) return;

  const currentXp = typeof userProfile !== "undefined" ? (userProfile.xp || 0) : 0;
  const info = calcularInfoNivel(currentXp);
  const currentSongIdx = typeof userProfile !== "undefined" ? (userProfile.currentMusicIndex || 0) : 0;
  const currentVolume = typeof userProfile !== "undefined" && userProfile.musicVolume !== undefined ? userProfile.musicVolume : 0.35;
  const isPlaying = bgmAudioObject && !bgmAudioObject.paused;
  const soundActive = typeof userProfile !== "undefined" && userProfile.musicEnabled !== false && userProfile.soundEnabled !== false;
  const isMuted = !soundActive || !isPlaying || currentVolume === 0;

  let volIcon = "🔊";
  if (isMuted) volIcon = "🔇";
  else if (currentVolume < 0.35) volIcon = "🔈";
  else if (currentVolume < 0.7) volIcon = "🔉";

  const questsContainer = document.getElementById("daily-quests-container");
  const isExpanded = questsContainer && questsContainer.classList.contains("expanded");

  hud.innerHTML = `
    <div class="rpg-hud-left">
      <span class="hud-level-badge">Lv. ${info.level}</span>
      <span class="hud-level-title">${info.titulo}</span>
    </div>

    <div class="rpg-hud-center interactive-hud-progress" id="hud-level-progress-btn" title="Haz clic para desplegar / ocultar las Misiones Diarias del Aprendiz 📜">
      <div class="hud-xp-info">
        <span>Progreso de Nivel <span class="hud-quest-toggle-arrow">${isExpanded ? "📜 Misiones ▲" : "📜 Misiones ▼"}</span></span>
        <span>${info.siguienteNivel ? `${info.xpEnEsteNivel} / ${info.xpRequeridaNivel} XP (${info.porcentaje}%)` : `MAX XP (${currentXp})`}</span>
      </div>
      <div class="hud-xp-track">
        <div class="hud-xp-fill" style="width: ${info.porcentaje}%;"></div>
      </div>
    </div>

    <div class="rpg-hud-right">
      <!-- REPRODUCTOR, SELECTOR Y CONTROL UNIFICADO DE VOLUMEN/MUTEO BGM EN EL HUD -->
      <div class="hud-bgm-container" title="Canciones de fondo en bucle">
        <span class="bgm-icon">🎵</span>
        <select id="rpg-music-select" class="hud-music-select" title="Escoge la canción de fondo">
          ${BGM_PLAYLIST.map((song, i) => `
            <option value="${i}" ${i === currentSongIdx ? 'selected' : ''}>${song.title}</option>
          `).join("")}
        </select>
        <button id="btn-next-music" class="hud-bgm-btn" title="Siguiente canción de la lista">⏭️</button>

        <div class="hud-volume-box" title="Ajustar volumen / Silenciar (${Math.round(currentVolume * 100)}%)">
          <button id="btn-toggle-rpg-sound" class="hud-sound-btn" title="Reproducir / Silenciar Música">${volIcon}</button>
          <input type="range" id="rpg-volume-slider" class="hud-volume-slider" min="0" max="1" step="0.05" value="${currentVolume}">
        </div>
      </div>

      <span class="hud-stat-pill" title="Puntos de Experiencia Totales">⚡ ${currentXp} XP</span>
      <span class="hud-stat-pill" title="Racha Diaria">🔥 ${typeof userProfile !== "undefined" ? (userProfile.rachaDias || 1) : 1}d</span>
    </div>
  `;

  const btnProgress = hud.querySelector("#hud-level-progress-btn");
  if (btnProgress) {
    btnProgress.addEventListener("click", () => {
      const isPerfil = document.body.classList.contains("page-perfil") || window.location.pathname.includes("perfil.html");
      if (isPerfil) {
        const qContainer = document.getElementById("daily-quests-container");
        if (qContainer) {
          qContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        toggleDailyQuestsPanel();
      }
    });
  }

  const btnSound = hud.querySelector("#btn-toggle-rpg-sound");
  if (btnSound) {
    btnSound.addEventListener("click", () => {
      reproducirOPausarBGM();
    });
  }

  const selectMusic = hud.querySelector("#rpg-music-select");
  if (selectMusic) {
    selectMusic.addEventListener("change", (e) => {
      const idx = parseInt(e.target.value, 10);
      cambiarCancionPorIndice(idx);
    });
  }

  const btnNext = hud.querySelector("#btn-next-music");
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      siguienteCancionBGM(true);
    });
  }

  const sliderVol = hud.querySelector("#rpg-volume-slider");
  if (sliderVol) {
    sliderVol.addEventListener("input", (e) => {
      cambiarVolumenBGM(e.target.value);
    });
  }
}

function toggleDailyQuestsPanel() {
  let container = document.getElementById("daily-quests-container");
  const hud = document.getElementById("rpg-hud-bar");

  if (!container && hud) {
    container = document.createElement("div");
    container.id = "daily-quests-container";
    hud.parentNode.insertBefore(container, hud.nextSibling);
  }

  if (!container) return;

  const isPerfil = document.body.classList.contains("page-perfil") || window.location.pathname.includes("perfil.html");
  if (!isPerfil) {
    container.classList.add("collapsible-quests-panel");
  }

  container.classList.toggle("expanded");
  renderDailyQuestsUI();
  
  const arrow = document.querySelector(".hud-quest-toggle-arrow");
  if (arrow) {
    arrow.textContent = container.classList.contains("expanded") ? "📜 Misiones ▲" : "📜 Misiones ▼";
  }
}

function actualizarBloqueoContenidoUI() {
  const currentXp = typeof userProfile !== "undefined" ? (userProfile.xp || 0) : 0;
  const infoNivel = calcularInfoNivel(currentXp);
  const currentLevel = infoNivel.level;

  // 1. LECCIONES (lecciones.html)
  const leccionesCards = document.querySelectorAll(".grid-lecciones .card");
  leccionesCards.forEach(card => {
    const titleText = (card.querySelector("h3") ? card.querySelector("h3").innerText : "").toUpperCase();
    let requiredLevel = 1;
    let requiredXp = 0;

    if (titleText.includes("N5")) {
      requiredLevel = 1; requiredXp = 0;
    } else if (titleText.includes("N4")) {
      requiredLevel = 6; requiredXp = 5000;
    } else if (titleText.includes("N3")) {
      requiredLevel = 7; requiredXp = 10000;
    } else if (titleText.includes("N2")) {
      requiredLevel = 8; requiredXp = 20000;
    } else if (titleText.includes("N1")) {
      requiredLevel = 9; requiredXp = 30000;
    }

    aplicarEstadoBloqueoTarjeta(card, currentLevel, requiredLevel, currentXp, requiredXp);
  });

  // 2. KANA (kana.html)
  const kanaCards = document.querySelectorAll(".kana-list .kana-card");
  kanaCards.forEach(card => {
    const h3Text = (card.querySelector("h3") ? card.querySelector("h3").innerText : "").toLowerCase();
    let requiredLevel = 2;
    let requiredXp = 250;

    if (h3Text.includes("vocales") && !h3Text.includes("katakana")) {
      requiredLevel = 1; requiredXp = 0;
    } else {
      requiredLevel = 2; requiredXp = 250;
    }

    aplicarEstadoBloqueoTarjeta(card, currentLevel, requiredLevel, currentXp, requiredXp);
  });
}

function aplicarEstadoBloqueoTarjeta(cardElem, currentLevel, requiredLevel, currentXp, requiredXp) {
  let lockBadge = cardElem.querySelector(".lock-overlay-badge");
  let lockBox = cardElem.querySelector(".lock-progress-box");

  if (currentLevel < requiredLevel) {
    cardElem.classList.add("card-locked");

    if (!lockBadge) {
      lockBadge = document.createElement("div");
      lockBadge.className = "lock-overlay-badge";
      cardElem.appendChild(lockBadge);
    }
    lockBadge.innerHTML = `🔒 Requiere Nivel ${requiredLevel}`;

    if (!lockBox) {
      lockBox = document.createElement("div");
      lockBox.className = "lock-progress-box";
      cardElem.appendChild(lockBox);
    }

    const pct = Math.min(100, Math.round((currentXp / requiredXp) * 100));

    const isKanaCard = cardElem.classList.contains("kana-card") || window.location.pathname.includes("kana.html");
    const titleText = (cardElem.querySelector("h3") ? cardElem.querySelector("h3").innerText : "").toUpperCase();
    
    let jlptKey = "N4";
    let examLabel = "JLPT N4";

    if (isKanaCard) {
      jlptKey = "KANA";
      examLabel = "de KANA";
    } else if (titleText.includes("N3")) {
      jlptKey = "N3";
      examLabel = "JLPT N3";
    } else if (titleText.includes("N2")) {
      jlptKey = "N2";
      examLabel = "JLPT N2";
    } else if (titleText.includes("N1")) {
      jlptKey = "N1";
      examLabel = "JLPT N1";
    }

    lockBox.innerHTML = `
      <div class="lock-progress-text">
        <span>Progreso de XP</span>
        <span>${currentXp} / ${requiredXp} XP (${pct}%)</span>
      </div>
      <div class="lock-progress-track">
        <div class="lock-progress-fill" style="width: ${pct}%;"></div>
      </div>
      <div style="margin-top: 10px;">
        <a href="jlpt-simulador.html?level=${jlptKey}&autoExam=true" class="btn-unlock-exam" title="Rendir examen ${examLabel} para desbloquear este nivel de inmediato">
          ✍️ Desbloquear con Examen ${examLabel}
        </a>
      </div>
    `;

    const btn = cardElem.querySelector(".btn:not(.btn-unlock-exam)");
    if (btn) {
      btn.classList.add("disabled");
      btn.style.pointerEvents = "none";
      btn.style.background = "#64748b";
      btn.innerText = `🔒 Requisito: Nivel ${requiredLevel}`;
    }
  } else {
    cardElem.classList.remove("card-locked");
    if (lockBadge) lockBadge.remove();
    if (lockBox) lockBox.remove();

    const btn = cardElem.querySelector(".btn");
    if (btn) {
      btn.classList.remove("disabled");
      btn.style.pointerEvents = "auto";
      btn.style.background = "";
      if (btn.innerText.includes("🔒")) {
        btn.innerText = "Ver";
      }
    }
  }
}

function initDailyQuests() {
  const hoy = new Date().toISOString().split("T")[0];

  if (typeof userProfile !== "undefined") {
    if (userProfile.ultimaFechaMisiones !== hoy || !userProfile.misionesDiarias || userProfile.misionesDiarias.length === 0) {
      userProfile.ultimaFechaMisiones = hoy;
      userProfile.misionesDiarias = [
        { id: "mision_practica", titulo: "Practicar 3 Respuestas", tipo: "practica", meta: 3, actual: 0, recompensaXP: 15, completada: false, reclamada: false },
        { id: "mision_estudio", titulo: "Estudiar 10 Minutos", tipo: "estudio", meta: 10, actual: 0, recompensaXP: 25, completada: false, reclamada: false },
        { id: "mision_minado", titulo: "Minar 2 Tarjetas", tipo: "minado", meta: 2, actual: 0, recompensaXP: 20, completada: false, reclamada: false }
      ];
      if (typeof guardarPerfil === "function") guardarPerfil();
    }
  }

  renderDailyQuestsUI();
}

function actualizarProgresoMision(tipo, incremento = 1) {
  if (typeof userProfile === "undefined" || !userProfile.misionesDiarias) return;
  let cambio = false;

  userProfile.misionesDiarias.forEach(m => {
    if (m.tipo === tipo && !m.completada) {
      m.actual = Math.min(m.meta, m.actual + incremento);
      if (m.actual >= m.meta) {
        m.completada = true;
        if (typeof mostrarToast === "function") mostrarToast(`📜 ¡Misión diaria completada: ${m.titulo}!`);
      }
      cambio = true;
    }
  });

  if (cambio) {
    if (typeof guardarPerfil === "function") guardarPerfil();
    renderDailyQuestsUI();
  }
}

function reclamarMisionDiaria(index) {
  if (typeof userProfile === "undefined" || !userProfile.misionesDiarias || !userProfile.misionesDiarias[index]) return;
  const mision = userProfile.misionesDiarias[index];

  if (mision.completada && !mision.reclamada) {
    mision.reclamada = true;
    if (typeof guardarPerfil === "function") guardarPerfil();
    concederXP(mision.recompensaXP, `📜 Misión reclamada: ${mision.titulo}`);
    playRpgSound("claim");
    renderDailyQuestsUI();
  }
}

function renderDailyQuestsUI() {
  let container = document.getElementById("daily-quests-container");
  const isPerfil = document.body.classList.contains("page-perfil") || window.location.pathname.includes("perfil.html");

  if (!container && !isPerfil) {
    const hud = document.getElementById("rpg-hud-bar");
    if (hud) {
      container = document.createElement("div");
      container.id = "daily-quests-container";
      container.className = "collapsible-quests-panel";
      hud.parentNode.insertBefore(container, hud.nextSibling);
    }
  }

  if (!container) return;

  if (!isPerfil && !container.classList.contains("collapsible-quests-panel")) {
    container.classList.add("collapsible-quests-panel");
  }

  if (typeof userProfile === "undefined" || !userProfile.misionesDiarias || userProfile.misionesDiarias.length === 0) return;

  container.innerHTML = `
    <div class="daily-quests-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h2 class="seccion-titulo" style="margin: 0; font-size: 1.3rem;">📜 Misiones Diarias del Aprendiz</h2>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.8rem; opacity: 0.8;">Se reinician cada día</span>
          ${!isPerfil ? `<button onclick="toggleDailyQuestsPanel()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; line-height: 1;" title="Cerrar panel">&times;</button>` : ''}
        </div>
      </div>
      <div class="quests-grid">
        ${userProfile.misionesDiarias.map((m, idx) => {
          const pct = Math.min(100, Math.round((m.actual / m.meta) * 100));
          return `
            <div class="quest-card">
              <div>
                <div class="quest-header">
                  <span class="quest-title">${m.reclamada ? "✅" : (m.completada ? "🎁" : "📜")} ${m.titulo}</span>
                  <span class="quest-reward-badge">+${m.recompensaXP} XP</span>
                </div>
                <div class="quest-desc">Progreso: ${m.actual} / ${m.meta}</div>
              </div>
              <div class="quest-footer">
                <div class="quest-progress-track">
                  <div class="quest-progress-fill" style="width: ${pct}%; background: ${m.completada ? '#22c55e' : '#3b82f6'};"></div>
                </div>
                <button class="btn-claim-quest" ${(!m.completada || m.reclamada) ? 'disabled' : ''} onclick="reclamarMisionDiaria(${idx})">
                  ${m.reclamada ? 'Reclamado' : (m.completada ? 'Reclamar' : `${pct}%`)}
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function initRpgSystemModule() {
  initBgmPlayer();
  renderHeaderRPG_HUD();
  actualizarBloqueoContenidoUI();
  initDailyQuests();
}

function registrarActividadHoy(xpDelta = 0, minutosDelta = 0, tarjetasDelta = 0) {
  if (typeof userProfile === "undefined") return;
  const hoy = new Date().toISOString().split("T")[0];
  if (!userProfile.historialActividad) {
    userProfile.historialActividad = {};
  }
  if (!userProfile.historialActividad[hoy]) {
    userProfile.historialActividad[hoy] = { xp: 0, minutos: 0, tarjetas: 0 };
  }

  if (xpDelta > 0) userProfile.historialActividad[hoy].xp += xpDelta;
  if (minutosDelta > 0) userProfile.historialActividad[hoy].minutos += minutosDelta;
  if (tarjetasDelta > 0) userProfile.historialActividad[hoy].tarjetas += tarjetasDelta;

  if (typeof guardarPerfil === "function") guardarPerfil();
  renderActivityHeatmap();
}

function renderActivityHeatmap() {
  const gridContainer = document.getElementById("heatmap-grid-container");
  const monthsRow = document.getElementById("heatmap-months-row");
  if (!gridContainer) return;

  const historial = typeof userProfile !== "undefined" ? (userProfile.historialActividad || {}) : {};

  // Asegurar que hoy esté registrado al menos con 0 actividad para renderizar
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];
  if (!historial[hoyStr]) {
    historial[hoyStr] = { xp: 0, minutos: 0, tarjetas: 0 };
  }

  // Generar 52 semanas x 7 días
  const diaSemanaHoy = hoy.getDay(); // 0 es Domingo
  const numSemanas = 52;
  const totalDias = numSemanas * 7;

  // Ajustar fecha de inicio hace (52 semanas - offset)
  const fechaInicio = new Date(hoy);
  fechaInicio.setDate(hoy.getDate() - totalDias + (7 - diaSemanaHoy));

  gridContainer.innerHTML = "";
  if (monthsRow) monthsRow.innerHTML = "";

  let mesActualStr = "";
  const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  let diasActivos = 0;
  let totalXp = 0;
  let rachaContador = 0;
  let mejorRacha = 0;

  for (let sem = 0; sem < numSemanas; sem++) {
    const colDiv = document.createElement("div");
    colDiv.className = "heatmap-week-col";

    const primerDiaSemana = new Date(fechaInicio);
    primerDiaSemana.setDate(fechaInicio.getDate() + (sem * 7));
    const nombreMes = mesesNombres[primerDiaSemana.getMonth()];

    if (monthsRow) {
      const monthLabel = document.createElement("span");
      monthLabel.className = "heatmap-month-label";
      if (nombreMes !== mesActualStr && (sem === 0 || primerDiaSemana.getDate() <= 7)) {
        monthLabel.textContent = nombreMes;
        mesActualStr = nombreMes;
      } else {
        monthLabel.textContent = "";
      }
      monthsRow.appendChild(monthLabel);
    }

    for (let d = 0; d < 7; d++) {
      const fechaDia = new Date(fechaInicio);
      fechaDia.setDate(fechaInicio.getDate() + (sem * 7) + d);

      const fechaIso = fechaDia.toISOString().split("T")[0];
      const datosDia = historial[fechaIso] || { xp: 0, minutos: 0, tarjetas: 0 };
      const xpDia = datosDia.xp || 0;
      const minDia = datosDia.minutos || 0;
      const tarjDia = datosDia.tarjetas || 0;

      if (xpDia > 0 || minDia > 0 || tarjDia > 0) {
        diasActivos++;
        rachaContador++;
        if (rachaContador > mejorRacha) mejorRacha = rachaContador;
      } else {
        rachaContador = 0;
      }
      totalXp += xpDia;

      let level = 0;
      if (xpDia >= 50) level = 4;
      else if (xpDia >= 31) level = 3;
      else if (xpDia >= 16) level = 2;
      else if (xpDia >= 1) level = 1;

      const square = document.createElement("div");
      square.className = `heatmap-day-square level-${level}`;

      const fechaFormateada = fechaDia.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
      let infoTooltip = `${fechaFormateada}\n`;
      if (xpDia > 0 || minDia > 0 || tarjDia > 0) {
        infoTooltip += `⚡ ${xpDia} XP  |  ⏱️ ${minDia} min  |  📇 ${tarjDia} tarjetas`;
      } else {
        infoTooltip += `Sin actividad registrada`;
      }

      square.setAttribute("data-tooltip", infoTooltip);
      colDiv.appendChild(square);
    }

    gridContainer.appendChild(colDiv);
  }

  // Actualizar estadísticas en UI
  const elActiveDays = document.getElementById("heatmap-stat-active-days");
  const elCurrentStreak = document.getElementById("heatmap-stat-current-streak");
  const elBestStreak = document.getElementById("heatmap-stat-best-streak");
  const elTotalXp = document.getElementById("heatmap-stat-total-xp");
  const elStreakSummary = document.getElementById("heatmap-streak-summary");

  const rachaDias = typeof userProfile !== "undefined" ? (userProfile.rachaDias || 1) : 1;

  if (elActiveDays) elActiveDays.textContent = diasActivos;
  if (elCurrentStreak) elCurrentStreak.textContent = rachaDias;
  if (elBestStreak) elBestStreak.textContent = Math.max(rachaDias, mejorRacha);
  if (elTotalXp) elTotalXp.textContent = `${totalXp} XP`;
  if (elStreakSummary) elStreakSummary.textContent = `🔥 ${diasActivos} día${diasActivos !== 1 ? 's' : ''} activo${diasActivos !== 1 ? 's' : ''} este año`;

  // Configurar tooltip flotante global que no se corta por desbordamiento de marco/contenedor
  const scrollContainer = document.querySelector(".heatmap-scroll-container");
  if (scrollContainer && !scrollContainer.dataset.tooltipBound) {
    scrollContainer.dataset.tooltipBound = "true";

    const updateTooltipPos = (e) => {
      const sq = e.target.closest(".heatmap-day-square");
      let tooltip = document.getElementById("heatmap-global-tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "heatmap-global-tooltip";
        tooltip.className = "heatmap-global-tooltip";
        document.body.appendChild(tooltip);
      }

      if (sq && sq.getAttribute("data-tooltip")) {
        tooltip.textContent = sq.getAttribute("data-tooltip");
        tooltip.classList.add("visible");

        const rect = sq.getBoundingClientRect();
        const toolRect = tooltip.getBoundingClientRect();

        let left = rect.left + (rect.width / 2) - (toolRect.width / 2);
        let top = rect.top - toolRect.height - 10;

        if (top < 10) top = rect.bottom + 10;
        if (left < 10) left = 10;
        if (left + toolRect.width > window.innerWidth - 10) {
          left = window.innerWidth - toolRect.width - 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      } else {
        tooltip.classList.remove("visible");
      }
    };

    scrollContainer.addEventListener("mousemove", updateTooltipPos);
    scrollContainer.addEventListener("mouseleave", () => {
      const tooltip = document.getElementById("heatmap-global-tooltip");
      if (tooltip) tooltip.classList.remove("visible");
    });
  }
}

function registrarTiempoEstudio(segundos) {
  if (typeof userProfile === "undefined") return;
  const prevSeg = userProfile.tiempoEstudioSegundos || 0;
  userProfile.tiempoEstudioSegundos = prevSeg + segundos;

  const minPrev = Math.floor(prevSeg / 60);
  const minNue = Math.floor(userProfile.tiempoEstudioSegundos / 60);
  if (minNue > minPrev) {
    const diffMin = minNue - minPrev;
    registrarActividadHoy(0, diffMin, 0);
    concederXP(diffMin * 1, "⏱️ Tiempo de estudio");
    actualizarProgresoMision("estudio", diffMin);
  }

  if (typeof guardarPerfil === "function") guardarPerfil();
  if (typeof verificarLogros === "function") verificarLogros();
  if (typeof renderUserProfileUI === "function") renderUserProfileUI();
}
