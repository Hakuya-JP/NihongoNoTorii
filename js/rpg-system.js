// ==========================================================================
// SECCIÓN 6 (RPG): MÓDULO SISTEMA RPG Y REPRODUCTOR BGM
// ==========================================================================

const BGM_DEFAULT_PLAYLIST = [
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

let BGM_CUSTOM_PLAYLIST = [];

function getBgmPlaylist() {
  return [...BGM_CUSTOM_PLAYLIST, ...BGM_DEFAULT_PLAYLIST];
}

// ==========================================================================
// ALMACENAMIENTO INDEXEDDB PARA PISTAS DE AUDIO LOCALES
// ==========================================================================
const TORII_DB_NAME = "ToriiAudioStore";
const TORII_DB_VERSION = 1;
const TORII_STORE_NAME = "custom_tracks";

let _customSongsPromise = null;

function abrirDBMusica() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(TORII_DB_NAME, TORII_DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(TORII_STORE_NAME)) {
          db.createObjectStore(TORII_STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

function cargarCancionesPersonalizadasDB() {
  if (!_customSongsPromise) {
    _customSongsPromise = new Promise(async (resolve) => {
      try {
        const db = await abrirDBMusica();
        if (!db) {
          try {
            const guardadas = localStorage.getItem("torii_custom_tracks");
            if (guardadas) BGM_CUSTOM_PLAYLIST = JSON.parse(guardadas);
          } catch(e) {}
          const hud = document.getElementById("rpg-hud-bar");
          if (hud) renderHeaderRPG_HUD();
          actualizarEstadoVisualBGM();
          resolve(BGM_CUSTOM_PLAYLIST);
          return;
        }
        const tx = db.transaction(TORII_STORE_NAME, "readonly");
        const store = tx.objectStore(TORII_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            BGM_CUSTOM_PLAYLIST = req.result.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
          }
          const hud = document.getElementById("rpg-hud-bar");
          if (hud) renderHeaderRPG_HUD();
          actualizarEstadoVisualBGM();
          resolve(BGM_CUSTOM_PLAYLIST);
        };
        req.onerror = () => {
          const hud = document.getElementById("rpg-hud-bar");
          if (hud) renderHeaderRPG_HUD();
          actualizarEstadoVisualBGM();
          resolve(BGM_CUSTOM_PLAYLIST);
        };
      } catch (e) {
        console.warn("Error al cargar canciones personalizadas de DB:", e);
        const hud = document.getElementById("rpg-hud-bar");
        if (hud) renderHeaderRPG_HUD();
        actualizarEstadoVisualBGM();
        resolve(BGM_CUSTOM_PLAYLIST);
      }
    });
  }
  return _customSongsPromise;
}

async function guardarCancionEnDB(cancion) {
  try {
    const db = await abrirDBMusica();
    if (db) {
      const tx = db.transaction(TORII_STORE_NAME, "readwrite");
      const store = tx.objectStore(TORII_STORE_NAME);
      store.put(cancion);
    }
  } catch (e) {
    console.warn("Error al guardar canción en DB:", e);
  }
}

async function borrarCancionDeDB(id) {
  try {
    const db = await abrirDBMusica();
    if (db) {
      const tx = db.transaction(TORII_STORE_NAME, "readwrite");
      const store = tx.objectStore(TORII_STORE_NAME);
      store.delete(id);
    }
  } catch (e) {
    console.warn("Error al borrar canción de DB:", e);
  }
}

// Iniciar carga de DB inmediatamente
cargarCancionesPersonalizadasDB();

// ==========================================================================
// SECCIÓN BGM AUDIO SYSTEM: REPRODUCTOR DE MÚSICA DE FONDO CON PERSISTENCIA
// ==========================================================================

let bgmAudioObject = null;

function guardarEstadoPlaybackBGM() {
  if (!bgmAudioObject) return;
  try {
    const playlist = getBgmPlaylist();
    const currentSongIdx = (typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0;
    const currentSong = playlist[currentSongIdx];

    sessionStorage.setItem("bgm_track_index", currentSongIdx);
    if (currentSong) {
      sessionStorage.setItem("bgm_track_id", currentSong.id || currentSong.src);
      sessionStorage.setItem("bgm_track_title", currentSong.title || "");
      sessionStorage.setItem("bgm_track_is_custom", currentSong.isCustom ? "true" : "false");
    }
    sessionStorage.setItem("bgm_is_playing", (!bgmAudioObject.paused).toString());
    sessionStorage.setItem("bgm_time", bgmAudioObject.currentTime || 0);
    sessionStorage.setItem("bgm_timestamp", Date.now().toString());
  } catch (e) {
    console.warn("No se pudo guardar estado BGM en sessionStorage", e);
  }
}

async function initBgmPlayer() {
  // Asegurar que las canciones personalizadas en DB se hayan cargado antes de iniciar
  await cargarCancionesPersonalizadasDB();

  if (!bgmAudioObject) {
    bgmAudioObject = new Audio();
    bgmAudioObject.volume = (typeof userProfile !== "undefined" && userProfile.musicVolume !== undefined) ? userProfile.musicVolume : 0.35;

    // Listeners de actualización de estado para sincronizar la UI del HUD de forma fluida
    bgmAudioObject.addEventListener("play", () => {
      if (typeof userProfile !== "undefined") {
        userProfile.musicEnabled = true;
        userProfile.soundEnabled = true;
        if (typeof guardarPerfil === "function") guardarPerfil();
      }
      sessionStorage.setItem("user_has_interacted", "true");
      sessionStorage.setItem("bgm_is_playing", "true");
      actualizarEstadoVisualBGM();
    });

    bgmAudioObject.addEventListener("pause", () => {
      sessionStorage.setItem("bgm_is_playing", "false");
      actualizarEstadoVisualBGM();
    });

    bgmAudioObject.addEventListener("volumechange", () => {
      actualizarEstadoVisualBGM();
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
      console.warn("Aviso BGM:", e);
    });

    window.addEventListener("beforeunload", guardarEstadoPlaybackBGM);
    window.addEventListener("pagehide", guardarEstadoPlaybackBGM);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        guardarEstadoPlaybackBGM();
      }
    });
  }

  cargarCancionActualBGM();

  // Restaurar tiempo exacto de reproducción entre páginas (continuidad fluida)
  const savedTime = parseFloat(sessionStorage.getItem("bgm_time"));
  const savedTimestamp = parseInt(sessionStorage.getItem("bgm_timestamp"), 10);
  const wasPlaying = sessionStorage.getItem("bgm_is_playing") === "true";
  let initialSeekTime = 0;

  if (!isNaN(savedTime) && !isNaN(savedTimestamp)) {
    const elapsed = (Date.now() - savedTimestamp) / 1000;
    if (elapsed >= 0 && elapsed < 8) {
      initialSeekTime = Math.max(0, savedTime + elapsed);
    } else {
      initialSeekTime = Math.max(0, savedTime);
    }
  }

  const applySeekTime = () => {
    if (bgmAudioObject && initialSeekTime > 0) {
      if (bgmAudioObject.duration && initialSeekTime >= bgmAudioObject.duration) {
        sessionStorage.setItem("bgm_time", 0);
      } else {
        try {
          bgmAudioObject.currentTime = initialSeekTime;
        } catch (err) {}
      }
    }
  };

  bgmAudioObject.addEventListener("loadedmetadata", applySeekTime, { once: true });
  bgmAudioObject.addEventListener("canplay", applySeekTime, { once: true });

  const userHasInteracted = sessionStorage.getItem("user_has_interacted") === "true";
  const shouldPlay = typeof userProfile !== "undefined" && userProfile.musicEnabled !== false && (userProfile.musicVolume === undefined || userProfile.musicVolume > 0);

  if (shouldPlay && (userHasInteracted || wasPlaying)) {
    bgmAudioObject.play().then(() => {
      applySeekTime();
      actualizarEstadoVisualBGM();
    }).catch(e => {
      console.log("Autoplay de BGM esperando interacción del usuario");
    });
  } else if (!shouldPlay) {
    bgmAudioObject.pause();
  }

  const registrarInteraccionGlobal = () => {
    sessionStorage.setItem("user_has_interacted", "true");
    if (typeof userProfile !== "undefined" && userProfile.musicEnabled !== false && bgmAudioObject && bgmAudioObject.paused && (userProfile.musicVolume === undefined || userProfile.musicVolume > 0)) {
      bgmAudioObject.play().then(() => {
        applySeekTime();
        actualizarEstadoVisualBGM();
      }).catch(e => console.log("Error al reproducir BGM en interacción"));
    }
  };

  document.addEventListener("click", registrarInteraccionGlobal, { once: true });

  actualizarEstadoVisualBGM();
}

function actualizarEstadoVisualBGM() {
  const isPlaying = bgmAudioObject && !bgmAudioObject.paused;
  const currentVolume = (typeof userProfile !== "undefined" && userProfile.musicVolume !== undefined) ? userProfile.musicVolume : 0.35;
  const soundActive = (typeof userProfile !== "undefined" && userProfile.musicEnabled !== false && userProfile.soundEnabled !== false);
  const isMuted = !soundActive || !isPlaying || currentVolume === 0;
  const playlist = getBgmPlaylist();
  const currentSongIdx = (typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0;
  const currentSong = playlist[currentSongIdx] || { title: "Música" };

  // 1. Botón de sonido en el dock
  const soundBtn = document.getElementById("btn-toggle-rpg-sound");
  if (soundBtn) {
    soundBtn.className = `torii-icon-btn ${isMuted ? 'muted' : 'active'}`;
    soundBtn.textContent = isMuted ? '🔇' : '🎧';
    soundBtn.title = isMuted ? 'Reproducir música de fondo' : 'Pausar música de fondo';
  }

  // 2. Información en el popout de música
  const playIcon = document.querySelector(".torii-bgm-playing-icon");
  if (playIcon) {
    playIcon.textContent = isPlaying ? '▶️' : '⏸️';
  }

  const titleEl = document.querySelector(".torii-bgm-current-title");
  if (titleEl) {
    titleEl.textContent = currentSong.title;
  }

  const statusEl = document.querySelector(".torii-bgm-current-status");
  if (statusEl) {
    statusEl.textContent = isPlaying ? 'Reproduciendo en bucle' : 'En pausa';
  }

  // 3. Botón Play/Pause en los controles
  const playBtn = document.querySelector(".torii-ctrl-btn.play-btn");
  if (playBtn) {
    playBtn.textContent = isPlaying ? '⏸️' : '▶️';
    playBtn.title = isPlaying ? 'Pausar' : 'Reproducir';
  }

  // 4. Porcentaje y slider de volumen
  const volPercent = document.getElementById("torii-volume-percent");
  if (volPercent) {
    volPercent.textContent = `${Math.round(currentVolume * 100)}%`;
  }
  const slider = document.getElementById("rpg-volume-slider");
  if (slider && document.activeElement !== slider) {
    slider.value = currentVolume;
  }

  // 5. Playlist items activos
  const playlistItems = document.querySelectorAll(".torii-playlist-item");
  playlistItems.forEach((item, i) => {
    if (i === currentSongIdx) {
      item.classList.add("active");
      const eq = item.querySelector(".torii-track-eq") || item.querySelector("span:last-child");
      if (eq && eq !== item.querySelector(".torii-track-num") && eq !== item.querySelector(".torii-track-name")) {
        eq.textContent = isPlaying ? '🎵' : '⏸️';
      }
    } else {
      item.classList.remove("active");
      const eq = item.querySelector(".torii-track-eq") || item.querySelector("span:last-child");
      if (eq && eq !== item.querySelector(".torii-track-num") && eq !== item.querySelector(".torii-track-name")) {
        eq.textContent = '';
      }
    }
  });
}

function cargarCancionActualBGM(forzarIndex = null) {
  if (!bgmAudioObject) return;
  const playlist = getBgmPlaylist();
  if (playlist.length === 0) return;

  let idx = -1;

  if (typeof forzarIndex === "number" && forzarIndex >= 0 && forzarIndex < playlist.length) {
    idx = forzarIndex;
  } else {
    // Buscar por ID guardado en sessionStorage si existe
    const savedTrackId = sessionStorage.getItem("bgm_track_id");
    if (savedTrackId) {
      idx = playlist.findIndex(s => (s.id && s.id === savedTrackId) || s.src === savedTrackId);
    }
    if (idx === -1) {
      idx = (typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0;
    }
  }

  if (idx < 0 || idx >= playlist.length) idx = 0;

  if (typeof userProfile !== "undefined") {
    userProfile.currentMusicIndex = idx;
  }

  const song = playlist[idx];
  if (!song) return;

  sessionStorage.setItem("bgm_track_index", idx);
  sessionStorage.setItem("bgm_track_id", song.id || song.src);
  sessionStorage.setItem("bgm_track_title", song.title || "");
  sessionStorage.setItem("bgm_track_is_custom", song.isCustom ? "true" : "false");

  const finalSrc = song.isCustom ? song.src : ((window.TORII_BASE_PATH || "") + song.src);

  if (bgmAudioObject.src !== finalSrc && !bgmAudioObject.src.endsWith(encodeURI(song.src)) && !bgmAudioObject.src.endsWith(song.src)) {
    bgmAudioObject.src = finalSrc;
  }
}

function reproducirOPausarBGM(event) {
  if (event) event.stopPropagation();
  if (!bgmAudioObject) initBgmPlayer();
  cargarCancionActualBGM();

  if (bgmAudioObject.paused) {
    if (typeof userProfile !== "undefined") {
      userProfile.musicEnabled = true;
      userProfile.soundEnabled = true;
      if (typeof guardarPerfil === "function") guardarPerfil();
    }
    sessionStorage.setItem("user_has_interacted", "true");
    bgmAudioObject.play().then(() => {
      actualizarEstadoVisualBGM();
    }).catch(e => console.log("BGM autoplay prevenido"));
  } else {
    if (typeof userProfile !== "undefined") {
      userProfile.musicEnabled = false;
      userProfile.soundEnabled = false;
      if (typeof guardarPerfil === "function") guardarPerfil();
    }
    bgmAudioObject.pause();
    actualizarEstadoVisualBGM();
  }
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
      bgmAudioObject.play().then(() => {
        actualizarEstadoVisualBGM();
      }).catch(e => console.log("BGM play error"));
    } else if (vol === 0 && !bgmAudioObject.paused) {
      bgmAudioObject.pause();
    }
  }

  actualizarEstadoVisualBGM();
}

function siguienteCancionBGM(autoPlay = true) {
  sessionStorage.setItem("bgm_time", 0);
  const playlist = getBgmPlaylist();
  let idx = ((typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0) + 1;
  if (idx >= playlist.length) idx = 0;
  
  if (typeof userProfile !== "undefined") {
    userProfile.currentMusicIndex = idx;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  cargarCancionActualBGM(idx);
  guardarEstadoPlaybackBGM();

  if (autoPlay && (typeof userProfile === "undefined" || userProfile.musicEnabled !== false) && bgmAudioObject) {
    bgmAudioObject.play().then(() => {
      actualizarEstadoVisualBGM();
    }).catch(e => console.log("Error BGM play"));
  } else {
    actualizarEstadoVisualBGM();
  }
  renderHeaderRPG_HUD();
  if (typeof mostrarToast === "function") mostrarToast(`🎵 Sonando: ${playlist[idx].title}`);
}

function anteriorCancionBGM(autoPlay = true) {
  sessionStorage.setItem("bgm_time", 0);
  const playlist = getBgmPlaylist();
  let idx = ((typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0) - 1;
  if (idx < 0) idx = playlist.length - 1;
  
  if (typeof userProfile !== "undefined") {
    userProfile.currentMusicIndex = idx;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  cargarCancionActualBGM(idx);
  guardarEstadoPlaybackBGM();

  if (autoPlay && (typeof userProfile === "undefined" || userProfile.musicEnabled !== false) && bgmAudioObject) {
    bgmAudioObject.play().then(() => {
      actualizarEstadoVisualBGM();
    }).catch(e => console.log("Error BGM play"));
  } else {
    actualizarEstadoVisualBGM();
  }
  renderHeaderRPG_HUD();
  if (typeof mostrarToast === "function") mostrarToast(`🎵 Sonando: ${playlist[idx].title}`);
}

function cambiarCancionPorIndice(idx) {
  const playlist = getBgmPlaylist();
  if (idx < 0 || idx >= playlist.length) return;
  sessionStorage.setItem("bgm_time", 0);
  if (typeof userProfile !== "undefined") {
    userProfile.currentMusicIndex = idx;
    userProfile.musicEnabled = true;
    userProfile.soundEnabled = true;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  cargarCancionActualBGM(idx);
  guardarEstadoPlaybackBGM();

  sessionStorage.setItem("user_has_interacted", "true");
  sessionStorage.setItem("bgm_is_playing", "true");

  if (bgmAudioObject) {
    bgmAudioObject.play().then(() => {
      actualizarEstadoVisualBGM();
    }).catch(e => console.log("Error BGM play"));
  }
  actualizarEstadoVisualBGM();
  renderHeaderRPG_HUD();
  if (typeof mostrarToast === "function") mostrarToast(`🎵 Selección: ${playlist[idx].title}`);
}

function agregarCancionPersonalizada(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const fileName = file.name.replace(/\.[^/.]+$/, "");
  const reader = new FileReader();

  reader.onload = async function(e) {
    const dataUrl = e.target.result;
    const nuevaPista = {
      id: "custom_" + Date.now(),
      title: fileName,
      src: dataUrl,
      isCustom: true,
      dateAdded: Date.now()
    };

    // Agregar al inicio de la lista
    BGM_CUSTOM_PLAYLIST.unshift(nuevaPista);
    await guardarCancionEnDB(nuevaPista);

    // Seleccionar y reproducir inmediatamente al inicio
    if (typeof userProfile !== "undefined") {
      userProfile.currentMusicIndex = 0;
      userProfile.musicEnabled = true;
      userProfile.soundEnabled = true;
      if (typeof guardarPerfil === "function") guardarPerfil();
    }

    sessionStorage.setItem("user_has_interacted", "true");
    sessionStorage.setItem("bgm_time", 0);
    sessionStorage.setItem("bgm_track_id", nuevaPista.id);
    sessionStorage.setItem("bgm_track_title", nuevaPista.title);
    sessionStorage.setItem("bgm_track_is_custom", "true");
    sessionStorage.setItem("bgm_is_playing", "true");

    if (!bgmAudioObject) initBgmPlayer();
    if (bgmAudioObject) {
      bgmAudioObject.src = dataUrl;
      bgmAudioObject.play().then(() => {
        actualizarEstadoVisualBGM();
      }).catch(err => console.log("BGM play err:", err));
    }

    renderHeaderRPG_HUD();
    if (typeof mostrarToast === "function") {
      mostrarToast(`🎶 ¡"${fileName}" agregada al inicio de tu lista!`);
    }
  };

  reader.readAsDataURL(file);
  event.target.value = "";
}

function eliminarCancionPersonalizada(event, id) {
  if (event) event.stopPropagation();
  const idx = BGM_CUSTOM_PLAYLIST.findIndex(p => p.id === id);
  if (idx === -1) return;

  const cancion = BGM_CUSTOM_PLAYLIST[idx];
  BGM_CUSTOM_PLAYLIST.splice(idx, 1);
  borrarCancionDeDB(id);

  if (typeof userProfile !== "undefined") {
    const playlist = getBgmPlaylist();
    if (userProfile.currentMusicIndex >= playlist.length) {
      userProfile.currentMusicIndex = 0;
    }
    if (typeof guardarPerfil === "function") guardarPerfil();
  }

  cargarCancionActualBGM();
  if (bgmAudioObject && !bgmAudioObject.paused) {
    bgmAudioObject.play().catch(e => {});
  }
  renderHeaderRPG_HUD();
  if (typeof mostrarToast === "function") {
    mostrarToast(`🗑️ "${cancion.title}" eliminada de tu lista`);
  }
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
  
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "rpg-hud-bar";
    document.body.appendChild(hud);
  }

  if (!hud) return;

  // Recordar el estado abierto de los popouts antes de re-renderizar el innerHTML
  const prevBgmPopout = document.getElementById("torii-bgm-popout");
  const wasBgmOpen = prevBgmPopout ? prevBgmPopout.classList.contains("open") : false;

  const prevProfilePopout = document.getElementById("torii-profile-popout");
  const wasProfileOpen = prevProfilePopout ? prevProfilePopout.classList.contains("open") : false;

  const currentXp = typeof userProfile !== "undefined" ? (userProfile.xp || 0) : 0;
  const info = calcularInfoNivel(currentXp);
  const currentSongIdx = typeof userProfile !== "undefined" ? (userProfile.currentMusicIndex || 0) : 0;
  const currentVolume = typeof userProfile !== "undefined" && userProfile.musicVolume !== undefined ? userProfile.musicVolume : 0.35;
  const isPlaying = bgmAudioObject && !bgmAudioObject.paused;
  const soundActive = typeof userProfile !== "undefined" && userProfile.musicEnabled !== false && userProfile.soundEnabled !== false;
  const isMuted = !soundActive || !isPlaying || currentVolume === 0;

  const userName = (typeof userProfile !== "undefined" && userProfile.nombre) ? userProfile.nombre : "はくや（白夜）";
  const userTag = (typeof userProfile !== "undefined" && userProfile.tag) ? userProfile.tag : "hakuya_mitsumine";
  const userAvatar = (typeof userProfile !== "undefined" && userProfile.avatar) ? userProfile.avatar : "⛩️";
  const userLema = (typeof userProfile !== "undefined" && userProfile.lema) ? userProfile.lema : "明日のことは、明日にならないとわからない。わからないからこそ、生きている意味があるのかもしれない 🍥";
  const userRacha = (typeof userProfile !== "undefined" ? (userProfile.rachaDias || 1) : 1);
  const userTarget = (typeof userProfile !== "undefined" ? (userProfile.nivelObjetivo || "JLPT N5") : "JLPT N5");
  const hudTheme = (typeof userProfile !== "undefined" && userProfile.hudTheme) ? userProfile.hudTheme : "floral-navy";
  const hudCustomBg = (typeof userProfile !== "undefined" && userProfile.hudCustomBg) ? userProfile.hudCustomBg : "";

  const isAvatarUrl = userAvatar.startsWith("http://") || userAvatar.startsWith("https://") || userAvatar.startsWith("data:image/");
  const perfilUrl = (window.TORII_BASE_PATH || "") + "perfil.html";

  // Clase de tema para la barra
  hud.className = `rpg-hud-bar torii-hud-dock theme-${hudTheme}`;
  if (hudTheme === 'custom' && hudCustomBg) {
    hud.style.backgroundImage = `linear-gradient(rgba(10, 16, 28, 0.78), rgba(10, 16, 28, 0.85)), url('${hudCustomBg}')`;
    hud.style.backgroundSize = 'cover';
    hud.style.backgroundPosition = 'center';
  } else {
    hud.style.backgroundImage = '';
  }

  // Verificar si hay misiones listas para reclamar
  let hasClaimableQuest = false;
  if (typeof userProfile !== "undefined" && userProfile.misionesDiarias) {
    hasClaimableQuest = userProfile.misionesDiarias.some(m => m.completada && !m.reclamada);
  }

  hud.innerHTML = `
    <!-- DECORACIÓN DE FONDO SEGÚN EL TEMA -->
    <div class="torii-hud-bg-decor"></div>

    <!-- SECCIÓN IZQUIERDA: PERFIL (AVATAR + NOMBRE + NIVEL/XP) - CLIC ABRE POPOUT -->
    <div class="torii-user-pill" id="torii-user-pill-btn" onclick="toggleToriiProfilePopout(event)" title="Ver opciones de perfil (${userName})">
      <div class="torii-avatar-container">
        <div class="torii-avatar">
          ${isAvatarUrl ? `<img src="${userAvatar}" alt="Avatar">` : `<span>${userAvatar}</span>`}
        </div>
      </div>

      <div class="torii-user-details">
        <div class="torii-username">${userName}</div>
        <div class="torii-user-status">
          <span class="torii-lvl-tag">Lv.${info.level}</span>
          <span class="torii-xp-text">${info.siguienteNivel ? `${info.xpEnEsteNivel}/${info.xpRequeridaNivel} XP` : 'MAX XP'}</span>
        </div>
        <div class="torii-mini-xp-track" title="Progreso hacia el siguiente nivel: ${info.porcentaje}%">
          <div class="torii-mini-xp-fill" style="width: ${info.porcentaje}%;"></div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN DERECHA: BOTONES DE ACCIÓN (AUDIO / MISIONES / PERFIL) -->
    <div class="torii-actions-group">
      <!-- BOTÓN BGM / AUDIO (Estilo Music Pill) -->
      <div class="torii-audio-btn-wrapper">
        <button id="btn-toggle-rpg-sound" class="torii-icon-btn ${isMuted ? 'muted' : 'active'}" onclick="reproducirOPausarBGM(event)" title="${isMuted ? 'Reproducir música de fondo' : 'Pausar música de fondo'}">
          ${isMuted ? '🔇' : '🎧'}
        </button>
        <button id="btn-open-bgm-popout" class="torii-arrow-btn" onclick="toggleToriiBgmPopout(event)" title="Abrir lista de canciones">▾</button>

        <!-- POPOUT DE AUDIO FLOTANTE COMPLETO -->
        <div id="torii-bgm-popout" class="torii-bgm-popout theme-${hudTheme} ${wasBgmOpen ? 'open' : ''}" ${hudTheme === 'custom' && hudCustomBg ? `style="background-image: linear-gradient(rgba(10, 16, 28, 0.85), rgba(10, 16, 28, 0.9)), url('${hudCustomBg}'); background-size: cover; background-position: center;"` : ''} onclick="event.stopPropagation()">
          <div class="torii-popout-header">
            <span>🎵 Música de Fondo</span>
            <button type="button" class="torii-popout-close-btn-small" onclick="toggleToriiBgmPopout(event)">&times;</button>
          </div>

          <div class="torii-bgm-now-playing">
            <span class="torii-bgm-playing-icon">${isPlaying ? '▶️' : '⏸️'}</span>
            <div class="torii-bgm-song-info">
              <span class="torii-bgm-current-title">${(getBgmPlaylist()[currentSongIdx] || {}).title || 'Música'}</span>
              <span class="torii-bgm-current-status">${isPlaying ? 'Reproduciendo en bucle' : 'En pausa'}</span>
            </div>
          </div>

          <!-- CONTROLES DE REPRODUCCIÓN -->
          <div class="torii-bgm-controls-row">
            <button type="button" class="torii-ctrl-btn" onclick="anteriorCancionBGM()" title="Canción anterior">⏮️</button>
            <button type="button" class="torii-ctrl-btn play-btn" onclick="reproducirOPausarBGM(event)" title="${isPlaying ? 'Pausar' : 'Reproducir'}">
              ${isPlaying ? '⏸️' : '▶️'}
            </button>
            <button type="button" class="torii-ctrl-btn" onclick="siguienteCancionBGM(true)" title="Siguiente canción">⏭️</button>
          </div>

          <!-- CONTROL DE VOLUMEN -->
          <div class="torii-volume-row" onclick="event.stopPropagation()">
            <span>🔊</span>
            <input type="range" id="rpg-volume-slider" class="torii-volume-slider" min="0" max="1" step="0.01" value="${currentVolume}" oninput="cambiarVolumenBGM(this.value)" onclick="event.stopPropagation()">
            <span id="torii-volume-percent" style="font-size:0.75rem; color:#94a3b8; min-width:32px; text-align:right;">${Math.round(currentVolume * 100)}%</span>
          </div>

          <div class="torii-popout-divider"></div>

          <!-- LISTA DE CANCIONES (PLAYLIST) -->
          <div class="torii-playlist-header-row">
            <div class="torii-playlist-label">📜 Escoge una canción (${getBgmPlaylist().length}):</div>
            <button type="button" class="torii-add-song-btn" onclick="document.getElementById('torii-bgm-file-input').click()" title="Agregar canción desde tu ordenador">
              ➕ Agregar
            </button>
          </div>
          <!-- INPUT OCULTO PARA AGREGAR CANCIONES LOCALES -->
          <input type="file" id="torii-bgm-file-input" accept="audio/*" style="display:none;" onchange="agregarCancionPersonalizada(event)">

          <div class="torii-bgm-playlist-list">
            ${getBgmPlaylist().map((song, i) => `
              <div class="torii-playlist-item ${i === currentSongIdx ? 'active' : ''}" onclick="cambiarCancionPorIndice(${i})">
                <span class="torii-track-num">${i + 1}.</span>
                <span class="torii-track-name" title="${song.title}">
                  ${song.title}
                  ${song.isCustom ? '<span style="font-size:0.62rem; background:rgba(56,189,248,0.2); color:#38bdf8; padding:1px 5px; border-radius:4px; margin-left:4px; font-weight:800;">MÍA</span>' : ''}
                </span>
                ${song.isCustom ? `<button type="button" class="torii-del-song-btn" onclick="eliminarCancionPersonalizada(event, '${song.id}')" title="Eliminar de mi lista">🗑️</button>` : ''}
                ${i === currentSongIdx ? (isPlaying ? '<span class="torii-track-eq">🎵</span>' : '<span>⏸️</span>') : ''}
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- BOTÓN DE MISIONES DIARIAS -->
      <button id="btn-hud-quests-toggle" class="torii-icon-btn ${hasClaimableQuest ? 'quest-notify' : ''}" onclick="toggleDailyQuestsPanel(event)" title="Misiones Diarias del Aprendiz 📜">
        📜
        ${hasClaimableQuest ? '<span class="torii-quest-dot"></span>' : ''}
      </button>

      <!-- BOTÓN DE AJUSTES / PERFIL -->
      <a href="${perfilUrl}" class="torii-icon-btn" title="Configurar Perfil">
        ⚙️
      </a>
    </div>

    <!-- POPOUT COMPLETO DE PERFIL TRANSLÚCIDO -->
    <div id="torii-profile-popout" class="torii-profile-popout theme-${hudTheme} ${wasProfileOpen ? 'open' : ''}" ${hudTheme === 'custom' && hudCustomBg ? `style="background-image: linear-gradient(rgba(10, 16, 28, 0.88), rgba(10, 16, 28, 0.94)), url('${hudCustomBg}'); background-size: cover; background-position: center;"` : ''} onclick="event.stopPropagation()">
      <button type="button" class="torii-popout-close-btn" onclick="toggleToriiProfilePopout(event)" aria-label="Cerrar">&times;</button>

      <div class="torii-popout-avatar-row">
        <div class="torii-popout-avatar">
          ${isAvatarUrl ? `<img src="${userAvatar}" alt="Avatar">` : `<span>${userAvatar}</span>`}
        </div>
      </div>

      <div class="torii-popout-body">
        <div class="torii-popout-name">${userName}</div>
        <div class="torii-popout-tag">@${userTag}</div>

        <div class="torii-popout-badges">
          <span class="torii-badge lvl" title="Nivel del estudiante">⛩️ Lv. ${info.level}</span>
          <span class="torii-badge xp" title="Puntos de experiencia">⚡ ${currentXp} XP</span>
          <span class="torii-badge streak" title="Racha de estudio diario">🔥 ${userRacha}d</span>
          <span class="torii-badge target" title="Objetivo JLPT">🎯 ${userTarget}</span>
        </div>

        <div class="torii-popout-bio" title="Lema de aprendizaje">
          ${userLema}
        </div>

        <div class="torii-popout-divider"></div>

        <div class="torii-popout-menu">
          <!-- BOTÓN EDITAR PERFIL -->
          <button type="button" class="torii-menu-item" onclick="abrirModalEditarDesdePopout()">
            <span class="torii-menu-icon">✏️</span>
            <div class="torii-menu-text">
              <span class="torii-menu-title">Editar perfil</span>
              <span class="torii-menu-subtitle">Nombre, avatar, lema y metas</span>
            </div>
            <span class="torii-menu-arrow">›</span>
          </button>

          <!-- SELECTOR RÁPIDO DE TEMAS HUD -->
          <div class="torii-menu-item-theme">
            <div class="torii-theme-header">
              <span class="torii-menu-icon">🎨</span>
              <span class="torii-menu-title">Personalizar</span>
            </div>
            <div class="torii-theme-pills">
              <button type="button" class="theme-pill-btn ${hudTheme === 'floral-navy' ? 'active' : ''}" onclick="cambiarTemaHUD('floral-navy')" title="Follaje Azul Marino">🌸 Follaje</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'torii-sunset' ? 'active' : ''}" onclick="cambiarTemaHUD('torii-sunset')" title="Atardecer Carmesí">⛩️ Torii</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'sakura-night' ? 'active' : ''}" onclick="cambiarTemaHUD('sakura-night')" title="Noche de Sakura">🌸 Sakura</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'emerald-bamboo' ? 'active' : ''}" onclick="cambiarTemaHUD('emerald-bamboo')" title="Bambú Esmeralda">🍃 Bambú</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'cyber-tokyo' ? 'active' : ''}" onclick="cambiarTemaHUD('cyber-tokyo')" title="Cyberpunk Neón">🌌 Cyber</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'fuji-dawn' ? 'active' : ''}" onclick="cambiarTemaHUD('fuji-dawn')" title="Monte Fuji al Amanecer">🗻 Fuji</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'matcha-zen' ? 'active' : ''}" onclick="cambiarTemaHUD('matcha-zen')" title="Matcha Zen">🍵 Matcha</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'kyoto-autumn' ? 'active' : ''}" onclick="cambiarTemaHUD('kyoto-autumn')" title="Otoño Momiji en Kioto">🍁 Momiji</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'amethyst-magic' ? 'active' : ''}" onclick="cambiarTemaHUD('amethyst-magic')" title="Amatista Púrpura">🔮 Amatista</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'golden-shrine' ? 'active' : ''}" onclick="cambiarTemaHUD('golden-shrine')" title="Santuario Dorado">✨ Santuario</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'ocean-breeze' ? 'active' : ''}" onclick="cambiarTemaHUD('ocean-breeze')" title="Océano Kanagawa">🌊 Océano</button>
              <button type="button" class="theme-pill-btn ${hudTheme === 'torii-classic' || hudTheme === 'discord-classic' ? 'active' : ''}" onclick="cambiarTemaHUD('torii-classic')" title="Carbón Oscuro">🖤 Oscuro</button>
              <button type="button" class="theme-pill-btn custom-img-btn ${hudTheme === 'custom' ? 'active' : ''}" onclick="document.getElementById('torii-hud-bg-file').click()" title="Subir fondo personalizado (imagen)">➕</button>
            </div>
            <!-- INPUT OCULTO PARA SUBIR IMAGEN DESDE EL PC -->
            <input type="file" id="torii-hud-bg-file" accept="image/*" style="display:none;" onchange="cargarImagenFondoHUD(event)">
          </div>

          <!-- ENLACE A PERFIL COMPLETO -->
          <a href="${perfilUrl}" class="torii-menu-item">
            <span class="torii-menu-icon">⛩️</span>
            <div class="torii-menu-text">
              <span class="torii-menu-title">Ver perfil completo</span>
              <span class="torii-menu-subtitle">Estadísticas, certificados y tarjetas</span>
            </div>
            <span class="torii-menu-arrow">›</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

// Controladores globales de Popouts Torii
function toggleToriiProfilePopout(event) {
  if (event) event.stopPropagation();
  const profilePopout = document.getElementById("torii-profile-popout");
  const bgmPopout = document.getElementById("torii-bgm-popout");
  const qContainer = document.getElementById("daily-quests-container");

  if (bgmPopout) bgmPopout.classList.remove("open");
  if (qContainer) qContainer.classList.remove("expanded");

  if (profilePopout) {
    profilePopout.classList.toggle("open");
  }
}

function toggleToriiBgmPopout(event) {
  if (event) event.stopPropagation();
  const profilePopout = document.getElementById("torii-profile-popout");
  const bgmPopout = document.getElementById("torii-bgm-popout");
  const qContainer = document.getElementById("daily-quests-container");

  if (profilePopout) profilePopout.classList.remove("open");
  if (qContainer) qContainer.classList.remove("expanded");

  if (bgmPopout) {
    bgmPopout.classList.toggle("open");
  }
}

function abrirModalEditarDesdePopout() {
  const profilePopout = document.getElementById("torii-profile-popout");
  if (profilePopout) profilePopout.classList.remove("open");
  
  if (typeof abrirModalEditarPerfil === "function") {
    abrirModalEditarPerfil();
  } else {
    window.location.href = (window.TORII_BASE_PATH || "") + "perfil.html";
  }
}

function anteriorCancionBGM() {
  sessionStorage.setItem("bgm_time", 0);
  let idx = ((typeof userProfile !== "undefined" ? userProfile.currentMusicIndex : 0) || 0) - 1;
  if (idx < 0) idx = BGM_PLAYLIST.length - 1;
  
  if (typeof userProfile !== "undefined") {
    userProfile.currentMusicIndex = idx;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  cargarCancionActualBGM();

  if (bgmAudioObject) {
    bgmAudioObject.play().then(() => {
      actualizarEstadoVisualBGM();
    }).catch(e => console.log("Error BGM play"));
  } else {
    actualizarEstadoVisualBGM();
  }
  if (typeof mostrarToast === "function") mostrarToast(`🎵 Sonando: ${BGM_PLAYLIST[idx].title}`);
}

function cambiarTemaHUD(nuevoTema) {
  if (typeof userProfile !== "undefined") {
    userProfile.hudTheme = nuevoTema;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  renderHeaderRPG_HUD();
  renderDailyQuestsUI();
  if (typeof mostrarToast === "function") mostrarToast(`🎨 Tema aplicado: ${nuevoTema}`);
}

function cargarImagenFondoHUD(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    if (typeof userProfile !== "undefined") {
      userProfile.hudCustomBg = dataUrl;
      userProfile.hudTheme = "custom";
      if (typeof guardarPerfil === "function") guardarPerfil();
    }
    renderHeaderRPG_HUD();
    if (typeof mostrarToast === "function") mostrarToast("🖼️ ¡Imagen de fondo personalizada cargada!");
  };
  reader.readAsDataURL(file);
}

function copiarInfoUsuario() {
  const currentXp = typeof userProfile !== "undefined" ? (userProfile.xp || 0) : 0;
  const info = calcularInfoNivel(currentXp);
  const nombre = (typeof userProfile !== "undefined" && userProfile.nombre) ? userProfile.nombre : "はくや（白夜）";
  const texto = `⛩️ ${nombre} | ${info.titulo} (Lv. ${info.level} · ${currentXp} XP) - Nihongo no Torii`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(() => {
      if (typeof mostrarToast === "function") mostrarToast("📋 ¡ID de estudiante copiado al portapapeles!");
    });
  } else {
    if (typeof mostrarToast === "function") mostrarToast(`📋 Estudiante: ${nombre} (Lv. ${info.level})`);
  }
}

function toggleDailyQuestsPanel(event) {
  if (event) event.stopPropagation();
  let container = document.getElementById("daily-quests-container");
  const hud = document.getElementById("rpg-hud-bar");

  const profilePopout = document.getElementById("torii-profile-popout");
  const bgmPopout = document.getElementById("torii-bgm-popout");
  if (profilePopout) profilePopout.classList.remove("open");
  if (bgmPopout) bgmPopout.classList.remove("open");

  if (!container && hud) {
    container = document.createElement("div");
    container.id = "daily-quests-container";
    container.className = "collapsible-quests-panel torii-floating-quests";
    document.body.appendChild(container);
  }

  if (!container) return;

  const isPerfil = document.body.classList.contains("page-perfil") || window.location.pathname.includes("perfil.html");
  if (!isPerfil) {
    container.classList.add("collapsible-quests-panel", "torii-floating-quests");
  }

  container.classList.toggle("expanded");
  renderDailyQuestsUI();
}

// Listener global para cerrar popouts al hacer clic fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest("#torii-profile-popout") && !e.target.closest("#torii-user-pill-btn")) {
    const p = document.getElementById("torii-profile-popout");
    if (p) p.classList.remove("open");
  }
  if (!e.target.closest("#torii-bgm-popout") && !e.target.closest(".torii-audio-btn-wrapper")) {
    const b = document.getElementById("torii-bgm-popout");
    if (b) b.classList.remove("open");
  }
});

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
      container.className = "collapsible-quests-panel torii-floating-quests";
      hud.parentNode.insertBefore(container, hud.nextSibling);
    }
  }

  if (!container) return;

  const hudTheme = (typeof userProfile !== "undefined" && userProfile.hudTheme) ? userProfile.hudTheme : "floral-navy";
  const hudCustomBg = (typeof userProfile !== "undefined" && userProfile.hudCustomBg) ? userProfile.hudCustomBg : "";
  const isExpanded = container.classList.contains("expanded");

  if (!isPerfil) {
    container.className = `collapsible-quests-panel torii-floating-quests theme-${hudTheme} ${isExpanded ? 'expanded' : ''}`;
    if (hudTheme === 'custom' && hudCustomBg) {
      container.style.backgroundImage = `linear-gradient(rgba(10, 16, 28, 0.88), rgba(10, 16, 28, 0.94)), url('${hudCustomBg}')`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
    } else {
      container.style.backgroundImage = '';
    }
  }

  if (typeof userProfile === "undefined" || !userProfile.misionesDiarias || userProfile.misionesDiarias.length === 0) return;

  container.innerHTML = `
    <div class="daily-quests-section theme-${hudTheme}">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 class="seccion-titulo" style="margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
          <span>📜</span> Misiones Diarias del Aprendiz
        </h2>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.78rem; opacity: 0.8;">Se reinician cada día</span>
          ${!isPerfil ? `<button type="button" onclick="toggleDailyQuestsPanel()" class="torii-popout-close-btn-small" title="Cerrar panel">&times;</button>` : ''}
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
                  <div class="quest-progress-fill" style="width: ${pct}%;"></div>
                </div>
                <button class="btn-claim-quest ${m.completada && !m.reclamada ? 'claimable' : ''}" ${(!m.completada || m.reclamada) ? 'disabled' : ''} onclick="reclamarMisionDiaria(${idx})">
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

async function initRpgSystemModule() {
  await cargarCancionesPersonalizadasDB();
  await initBgmPlayer();
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
