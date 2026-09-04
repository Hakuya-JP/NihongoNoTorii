// ==========================================================================
// SECCIÓN 6 (PERFIL): MÓDULO PERFIL DEL ESTUDIANTE
// ==========================================================================
let userProfile = {
  nombre: "はくや（白夜）",
  tag: "hakuya_mitsumine",
  avatar: "⛩️",
  nivelObjetivo: "JLPT N5",
  lema: "明日のことは、明日にならないとわからない。わからないからこそ、生きている意味があるのかもしれない 🍥",
  hudTheme: "torii-sunset",
  hudCustomBg: "",
  metaDiariaMin: 15,
  rachaDias: 1,
  ultimaFechaAcceso: new Date().toISOString().split("T")[0],
  tiempoEstudioSegundos: 0,
  totalTarjetasMinadas: 0,
  logros: [],
  xp: 0,
  soundEnabled: true,
  musicEnabled: true,
  currentMusicIndex: 0,
  musicVolume: 0.35,
  misionesDiarias: [],
  ultimaFechaMisiones: ""
};

let avatarSeleccionadoTemporal = null;

function initUserProfileModule() {
  const guardado = localStorage.getItem("torii_user_profile");
  if (guardado) {
    try {
      userProfile = { ...userProfile, ...JSON.parse(guardado) };
    } catch (e) {
      console.warn("Error al cargar perfil de usuario:", e);
    }
  }

  // Garantizar que el tema por defecto sea Torii y aplicar el tema global
  if (!userProfile.hudTheme || userProfile.hudTheme === "custom") {
    userProfile.hudTheme = localStorage.getItem("torii_theme") || "torii-sunset";
  }
  if (typeof aplicarTemaGlobal === "function") {
    aplicarTemaGlobal(userProfile.hudTheme);
  }

  // Actualizar racha diaria y conceder XP
  const hoy = new Date().toISOString().split("T")[0];
  if (userProfile.ultimaFechaAcceso !== hoy) {
    const fechaUltima = new Date(userProfile.ultimaFechaAcceso || hoy);
    const fechaHoy = new Date(hoy);
    const diffDias = Math.round((fechaHoy - fechaUltima) / (1000 * 60 * 60 * 24));
    
    if (diffDias === 1) {
      userProfile.rachaDias = (userProfile.rachaDias || 0) + 1;
      if (typeof concederXP === "function") concederXP(10, "🔥 Racha Diaria Manteniéndose");
    } else if (diffDias > 1) {
      userProfile.rachaDias = 1;
      if (typeof concederXP === "function") concederXP(10, "🔥 Racha Diaria Reiniciada");
    }
    userProfile.ultimaFechaAcceso = hoy;
    guardarPerfil();
  }

  verificarLogros();
  renderUserProfileUI();
  asegurarModalEditarPerfilEnDOM();

  // Listeners del botón de editar en la página de perfil (si existen)
  const btnOpenEditModal = document.getElementById("btn-open-edit-modal");
  const btnEditAvatarBadge = document.getElementById("btn-edit-profile");
  const btnOpenThemesModal = document.getElementById("btn-open-themes-modal");
  if (btnOpenEditModal) btnOpenEditModal.addEventListener("click", abrirModalEditarPerfil);
  if (btnEditAvatarBadge) btnEditAvatarBadge.addEventListener("click", abrirModalEditarPerfil);
  if (btnOpenThemesModal) btnOpenThemesModal.addEventListener("click", abrirModalTemas);
}

function asegurarModalEditarPerfilEnDOM() {
  let modal = document.getElementById("edit-profile-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "edit-profile-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="edit-profile-modal-content">
        <button id="btn-close-edit-modal" class="modal-close-btn" aria-label="Cerrar modal" onclick="cerrarModalEditarPerfil()">&times;</button>
        
        <div class="modal-header">
          <h2>✏️ Personalizar Mi Perfil</h2>
          <p>Adapta tu nombre, avatar y metas de aprendizaje</p>
        </div>

        <form id="form-edit-profile" onsubmit="event.preventDefault(); guardarEdicionPerfil();">
          
          <!-- SELECCIÓN DE AVATAR -->
          <div class="form-group">
            <label class="form-label">Elige tu Avatar o Icono</label>
            <div class="avatar-picker-grid">
              <button type="button" class="avatar-option-btn" data-avatar="⛩️">⛩️</button>
              <button type="button" class="avatar-option-btn" data-avatar="🦊">🦊</button>
              <button type="button" class="avatar-option-btn" data-avatar="🥷">🥷</button>
              <button type="button" class="avatar-option-btn" data-avatar="🌸">🌸</button>
              <button type="button" class="avatar-option-btn" data-avatar="🎏">🎏</button>
              <button type="button" class="avatar-option-btn" data-avatar="👺">👺</button>
              <button type="button" class="avatar-option-btn" data-avatar="🍙">🍙</button>
              <button type="button" class="avatar-option-btn" data-avatar="🗾">🗾</button>
              <button type="button" class="avatar-option-btn" data-avatar="⚔️">⚔️</button>
              <button type="button" class="avatar-option-btn" data-avatar="🍵">🍵</button>
              <button type="button" class="avatar-option-btn" data-avatar="🎓">🎓</button>
              <button type="button" class="avatar-option-btn" data-avatar="🎎">🎎</button>
            </div>
            
            <div class="form-subinput" style="margin-top: 10px;">
              <input type="text" id="input-custom-avatar" class="form-control" placeholder="O escribe tu propio emoji o URL de imagen..." />
            </div>
            
            <div class="form-subinput" style="margin-top: 10px;">
              <label for="input-file-avatar" class="form-label" style="font-size: 0.8rem; opacity: 0.85;">📁 O carga una imagen desde tu dispositivo:</label>
              <input type="file" id="input-file-avatar" accept="image/*" class="form-control" />
            </div>
          </div>

          <!-- NOMBRE DEL ESTUDIANTE -->
          <div class="form-group">
            <label for="input-profile-name" class="form-label">Nombre o Apodo (氏名 / Name)</label>
            <input type="text" id="input-profile-name" class="form-control" required placeholder="Ej: はくや（白夜）, SATOU UTSUJI..." maxlength="40" />
          </div>

          <!-- TAG O HANDLE DE USUARIO -->
          <div class="form-group">
            <label for="input-profile-tag" class="form-label">Usuario / Tag (@handle)</label>
            <input type="text" id="input-profile-tag" class="form-control" placeholder="Ej: hakuya_mitsumine" maxlength="30" />
          </div>

          <!-- TEMA Y COLOR GENERAL DEL SITIO -->
          <div class="form-group">
            <label for="select-profile-hud-theme" class="form-label">🎨 Tema y Colores del Sitio (Estilo Windows)</label>
            <select id="select-profile-hud-theme" class="form-control">
              <option value="torii-sunset" selected>⛩️ Noche Torii (Torii Sunset - Por defecto)</option>
              <option value="sakura-night">🌸 Sakura Blossom (Cerezos en Flor)</option>
              <option value="emerald-bamboo">🍃 Bosque Esmeralda (Bambú Teal)</option>
              <option value="cyber-tokyo">🌌 Cyber Tokio (Neon Glow)</option>
              <option value="floral-navy">🌸 Follaje Nocturno (Floral Navy)</option>
              <option value="fuji-dawn">🗻 Monte Fuji (Dawn Mist)</option>
              <option value="matcha-zen">🍵 Matcha Zen (Té Verde)</option>
              <option value="kyoto-autumn">🍁 Otoño Momiji (Kioto Carmesí)</option>
              <option value="amethyst-magic">🔮 Amatista Púrpura (Mystic)</option>
              <option value="golden-shrine">✨ Santuario Dorado (Kinkaku-ji)</option>
              <option value="ocean-breeze">🌊 Océano Kanagawa (Gran Ola)</option>
              <option value="torii-classic">🖤 Torii Oscuro (Dark Slate)</option>
              <option value="custom">📁 Imagen Personalizada (Solo Barra)</option>
            </select>
          </div>

          <!-- FECHA DE NACIMIENTO -->
          <div class="form-group">
            <label for="input-profile-dob" class="form-label">Fecha de Nacimiento (生年月日 y/m/d)</label>
            <input type="date" id="input-profile-dob" class="form-control" />
          </div>

          <!-- PAÍS DEL EXAMEN -->
          <div class="form-group">
            <label for="select-profile-country" class="form-label">País donde rinde el Examen (受験地 / Lugar del examen)</label>
            <select id="select-profile-country" class="form-control">
              <option value="Mexico">メキシコ  MEXICO</option>
              <option value="Spain">スペイン  SPAIN</option>
              <option value="Argentina">アルゼンチン  ARGENTINA</option>
              <option value="Colombia">コロンビア  COLOMBIA</option>
              <option value="Peru">ペルー  PERU</option>
              <option value="Chile">チリ  CHILE</option>
              <option value="Venezuela">ベネズエラ  VENEZUELA</option>
              <option value="Ecuador">エクアドル  ECUADOR</option>
              <option value="Guatemala">グアテマラ  GUATEMALA</option>
              <option value="Costa Rica">コスタリカ  COSTA RICA</option>
              <option value="Dominican Republic">ドミニカ共和国  DOMINICAN REP.</option>
              <option value="Bolivia">ボリビア  BOLIVIA</option>
              <option value="Uruguay">ウルグアイ  URUGUAY</option>
              <option value="Paraguay">パラグアイ  PARAGUAY</option>
              <option value="Panama">パナマ  PANAMA</option>
              <option value="USA">アメリカ  U.S.A.</option>
              <option value="UK">イギリス  U.K.</option>
              <option value="Japan">日本  JAPAN</option>
            </select>
          </div>

          <!-- NIVEL OBJETIVO JLPT -->
          <div class="form-group">
            <label for="select-profile-level" class="form-label">Nivel Objetivo JLPT / Nivel</label>
            <select id="select-profile-level" class="form-control">
              <option value="JLPT N5">JLPT N5 (Principiante)</option>
              <option value="JLPT N4">JLPT N4 (Básico)</option>
              <option value="JLPT N3">JLPT N3 (Intermedio)</option>
              <option value="JLPT N2">JLPT N2 (Avanzado)</option>
              <option value="JLPT N1">JLPT N1 (Nativo / Experto)</option>
              <option value="Inmersión Libre">Inmersión Libre</option>
            </select>
          </div>

          <!-- LEMA / FRASE DE MOTIVACIÓN -->
          <div class="form-group">
            <label for="input-profile-motto" class="form-label">Lema o Frase de Motivación</label>
            <input type="text" id="input-profile-motto" class="form-control" placeholder="Ej: ¡Practicando todos los días sin falta! 🌸" maxlength="80" />
          </div>

          <!-- META DIARIA DE ESTUDIO -->
          <div class="form-group">
            <label for="select-profile-goal" class="form-label">Meta Diaria de Estudio</label>
            <select id="select-profile-goal" class="form-control">
              <option value="5">5 minutos al día (Relajado)</option>
              <option value="15">15 minutos al día (Recomendado)</option>
              <option value="30">30 minutos al día (Constante)</option>
              <option value="45">45 minutos al día (Intenso)</option>
              <option value="60">60 minutos al día (Modo Bestia)</option>
            </select>
          </div>

          <!-- BOTONES DE ACCIÓN -->
          <div class="modal-footer-btns">
            <button type="button" id="btn-cancel-edit-profile" class="btn btn-secondary" onclick="cerrarModalEditarPerfil()">Cancelar</button>
            <button type="submit" class="btn btn-primary">💾 Guardar Cambios</button>
          </div>

        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Vincular eventos internos del modal (avatares, subida de archivos y cierre)
  vincularEventosModalPerfil(modal);
  return modal;
}

function vincularEventosModalPerfil(modal) {
  if (!modal) return;

  const btnClose = modal.querySelector("#btn-close-edit-modal");
  const btnCancel = modal.querySelector("#btn-cancel-edit-profile");
  if (btnClose) btnClose.onclick = cerrarModalEditarPerfil;
  if (btnCancel) btnCancel.onclick = cerrarModalEditarPerfil;

  modal.onclick = (e) => {
    if (e.target === modal) {
      cerrarModalEditarPerfil();
    }
  };

  // Selector de avatares predefinidos
  const avatarButtons = modal.querySelectorAll(".avatar-option-btn");
  avatarButtons.forEach(btn => {
    btn.onclick = () => {
      avatarButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      avatarSeleccionadoTemporal = btn.getAttribute("data-avatar");
      const customInput = modal.querySelector("#input-custom-avatar");
      if (customInput) customInput.value = "";
    };
  });

  // Listener para subida de imagen de avatar local
  const inputFileAvatar = modal.querySelector("#input-file-avatar");
  if (inputFileAvatar) {
    inputFileAvatar.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          avatarSeleccionadoTemporal = evt.target.result;
          avatarButtons.forEach(b => b.classList.remove("selected"));
          const customInput = modal.querySelector("#input-custom-avatar");
          if (customInput) customInput.value = "";
          if (typeof mostrarToast === "function") mostrarToast("🖼️ Imagen de avatar cargada");
        };
        reader.readAsDataURL(file);
      }
    };
  }

  // Previsualización en vivo del tema seleccionado
  const selectThemeEl = modal.querySelector("#select-profile-hud-theme");
  if (selectThemeEl) {
    selectThemeEl.onchange = () => {
      const val = selectThemeEl.value;
      if (typeof aplicarTemaGlobal === "function") {
        aplicarTemaGlobal(val);
      }
    };
  }
}

function abrirModalEditarPerfil() {
  const modal = asegurarModalEditarPerfilEnDOM();
  if (!modal) return;

  const inputName = modal.querySelector("#input-profile-name");
  const inputTag = modal.querySelector("#input-profile-tag");
  const selectLevel = modal.querySelector("#select-profile-level");
  const inputMotto = modal.querySelector("#input-profile-motto");
  const selectGoal = modal.querySelector("#select-profile-goal");
  const customAvatarInput = modal.querySelector("#input-custom-avatar");
  const inputDob = modal.querySelector("#input-profile-dob");
  const selectCountry = modal.querySelector("#select-profile-country");
  const selectTheme = modal.querySelector("#select-profile-hud-theme");

  if (inputName) inputName.value = userProfile.nombre || "はくや（白夜）";
  if (inputTag) inputTag.value = userProfile.tag || "hakuya_mitsumine";
  if (selectLevel) selectLevel.value = userProfile.nivelObjetivo || "JLPT N5";
  if (inputMotto) inputMotto.value = userProfile.lema || "";
  if (selectGoal) selectGoal.value = userProfile.metaDiariaMin || 15;
  if (inputDob) inputDob.value = userProfile.fechaNacimiento || "1993-09-26";
  if (selectCountry) selectCountry.value = userProfile.paisExamen || "UK";
  if (selectTheme) selectTheme.value = userProfile.hudTheme || "torii-sunset";
  
  avatarSeleccionadoTemporal = userProfile.avatar || "⛩️";

  // Resaltar botón de avatar activo
  const avatarButtons = modal.querySelectorAll(".avatar-option-btn");
  let encontrado = false;
  avatarButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (btn.getAttribute("data-avatar") === avatarSeleccionadoTemporal) {
      btn.classList.add("selected");
      encontrado = true;
    }
  });

  if (!encontrado && customAvatarInput) {
    customAvatarInput.value = avatarSeleccionadoTemporal;
  } else if (customAvatarInput) {
    customAvatarInput.value = "";
  }

  modal.classList.add("active");
}

function cerrarModalEditarPerfil() {
  const modal = document.getElementById("edit-profile-modal");
  if (modal) modal.classList.remove("active");
  // Restaurar el tema guardado del perfil si se canceló sin guardar
  if (typeof aplicarTemaGlobal === "function" && typeof userProfile !== "undefined") {
    aplicarTemaGlobal(userProfile.hudTheme || "torii-sunset");
  }
}

function guardarEdicionPerfil() {
  const modal = document.getElementById("edit-profile-modal") || document;
  const inputName = modal.querySelector("#input-profile-name");
  const inputTag = modal.querySelector("#input-profile-tag");
  const selectLevel = modal.querySelector("#select-profile-level");
  const inputMotto = modal.querySelector("#input-profile-motto");
  const selectGoal = modal.querySelector("#select-profile-goal");
  const customAvatarInput = modal.querySelector("#input-custom-avatar");
  const inputDob = modal.querySelector("#input-profile-dob");
  const selectCountry = modal.querySelector("#select-profile-country");
  const selectTheme = modal.querySelector("#select-profile-hud-theme");

  const nuevoNombre = inputName && inputName.value.trim() ? inputName.value.trim() : "はくや（白夜）";
  const nuevoTag = inputTag && inputTag.value.trim() ? inputTag.value.trim().replace(/^@/, '') : "hakuya_mitsumine";
  const nuevoNivel = selectLevel ? selectLevel.value : "JLPT N5";
  const nuevoLema = inputMotto ? inputMotto.value.trim() : "";
  const nuevaMeta = selectGoal ? parseInt(selectGoal.value, 10) : 15;
  const nuevaFechaNac = inputDob && inputDob.value ? inputDob.value : "1993-09-26";
  const nuevoPais = selectCountry ? selectCountry.value : "UK";
  const nuevoTema = selectTheme ? selectTheme.value : (userProfile.hudTheme || "torii-sunset");

  let nuevoAvatar = avatarSeleccionadoTemporal || "⛩️";
  if (customAvatarInput && customAvatarInput.value.trim()) {
    nuevoAvatar = customAvatarInput.value.trim();
  }

  userProfile.nombre = nuevoNombre;
  userProfile.tag = nuevoTag;
  userProfile.nivelObjetivo = nuevoNivel;
  userProfile.lema = nuevoLema;
  userProfile.metaDiariaMin = nuevaMeta;
  userProfile.avatar = nuevoAvatar;
  userProfile.fechaNacimiento = nuevaFechaNac;
  userProfile.paisExamen = nuevoPais;
  userProfile.hudTheme = nuevoTema;

  guardarPerfil();
  if (typeof aplicarTemaGlobal === "function") {
    aplicarTemaGlobal(nuevoTema);
  }
  cerrarModalEditarPerfil();
  
  if (typeof renderUserProfileUI === "function") renderUserProfileUI();
  if (typeof renderHeaderRPG_HUD === "function") renderHeaderRPG_HUD();
  if (typeof mostrarToast === "function") mostrarToast("✨ ¡Perfil personalizado con éxito!");
}

function guardarPerfil() {
  localStorage.setItem("torii_user_profile", JSON.stringify(userProfile));
}

function registrarTarjetaMinadaEnPerfil() {
  userProfile.totalTarjetasMinadas = (userProfile.totalTarjetasMinadas || 0) + 1;
  if (typeof registrarActividadHoy === "function") registrarActividadHoy(0, 0, 1);
  guardarPerfil();
  verificarLogros();
  renderUserProfileUI();
}

function verificarLogros() {
  let nuevosLogros = false;
  if (!userProfile.logros) userProfile.logros = [];

  if (userProfile.totalTarjetasMinadas >= 1 && !userProfile.logros.includes("primer_minado")) {
    userProfile.logros.push("primer_minado");
    nuevosLogros = true;
    if (typeof mostrarToast === "function") mostrarToast("🏆 ¡Logro desbloqueado: Primer Paso!");
  }

  if (userProfile.totalTarjetasMinadas >= 10 && !userProfile.logros.includes("minero_novato")) {
    userProfile.logros.push("minero_novato");
    nuevosLogros = true;
    if (typeof mostrarToast === "function") mostrarToast("🏆 ¡Logro desbloqueado: Coleccionista!");
  }

  if (userProfile.totalTarjetasMinadas >= 50 && !userProfile.logros.includes("torii_master")) {
    userProfile.logros.push("torii_master");
    nuevosLogros = true;
    if (typeof mostrarToast === "function") mostrarToast("🏆 ¡Logro desbloqueado: Torii Master!");
  }

  if (userProfile.tiempoEstudioSegundos >= 600 && !userProfile.logros.includes("cinefilo")) {
    userProfile.logros.push("cinefilo");
    nuevosLogros = true;
    if (typeof mostrarToast === "function") mostrarToast("🏆 ¡Logro desbloqueado: Cinéfilo Japanese!");
  }

  if (userProfile.rachaDias >= 3 && !userProfile.logros.includes("racha_constante")) {
    userProfile.logros.push("racha_constante");
    nuevosLogros = true;
    if (typeof mostrarToast === "function") mostrarToast("🏆 ¡Logro desbloqueado: Constancia!");
  }

  if (nuevosLogros) {
    guardarPerfil();
  }
}

function renderUserProfileUI() {
  const avatarDisplay = document.getElementById("profile-avatar-display");
  const nameText = document.getElementById("profile-name-text");
  const targetLevel = document.getElementById("profile-target-level");
  const mottoText = document.getElementById("profile-motto-text");
  const streakBadge = document.getElementById("profile-streak-badge");
  const goalBadge = document.getElementById("profile-goal-badge");

  const cardsMined = document.getElementById("stat-cards-mined");
  const streakDays = document.getElementById("stat-streak-days");
  const studyTime = document.getElementById("stat-study-time");
  const dailyProgressText = document.getElementById("stat-daily-progress-text");
  const dailyProgressBar = document.getElementById("stat-daily-progress-bar");

  const badgesGrid = document.getElementById("badges-grid");
  const badgesUnlockedCount = document.getElementById("badges-unlocked-count");

  const infoNivel = typeof calcularInfoNivel === "function" ? calcularInfoNivel(userProfile.xp || 0) : { level: 1, titulo: "Aprendiz" };

  // Renderizar Avatar de la página principal (perfil.html)
  if (avatarDisplay) {
    const isUrl = userProfile.avatar && (userProfile.avatar.startsWith("http://") || userProfile.avatar.startsWith("https://") || userProfile.avatar.startsWith("data:image/"));
    if (isUrl) {
      avatarDisplay.innerHTML = `<img src="${userProfile.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      avatarDisplay.textContent = userProfile.avatar || "⛩️";
    }
  }

  // Renderizar Avatar en la barra de navegación superior (Global en todas las páginas)
  const navAvatarBox = document.getElementById("nav-avatar-box");
  if (navAvatarBox) {
    const isUrl = userProfile.avatar && (userProfile.avatar.startsWith("http://") || userProfile.avatar.startsWith("https://") || userProfile.avatar.startsWith("data:image/"));
    if (isUrl) {
      navAvatarBox.innerHTML = `<img src="${userProfile.avatar}" alt="Perfil" class="nav-avatar-img">`;
    } else {
      navAvatarBox.textContent = userProfile.avatar || "⛩️";
    }
  }

  if (nameText) nameText.textContent = userProfile.nombre || "Estudiante Torii";
  if (targetLevel) targetLevel.textContent = `Nivel RPG: Lv. ${infoNivel.level} (${infoNivel.titulo})`;
  if (mottoText) mottoText.textContent = userProfile.lema ? `"${userProfile.lema}"` : '"¡Paso a paso hacia el aprendizaje del japonés! ⛩️"';
  
  if (streakBadge) streakBadge.textContent = `🔥 ${userProfile.rachaDias || 1} día${(userProfile.rachaDias || 1) > 1 ? "s" : ""} de racha`;
  if (goalBadge) goalBadge.textContent = `⚡ Total: ${userProfile.xp || 0} XP`;

  if (cardsMined) cardsMined.textContent = userProfile.totalTarjetasMinadas || 0;
  if (streakDays) streakDays.textContent = `${userProfile.rachaDias || 1} día${(userProfile.rachaDias || 1) > 1 ? "s" : ""}`;
  
  const minutosEstudio = Math.floor((userProfile.tiempoEstudioSegundos || 0) / 60);
  if (studyTime) {
    studyTime.textContent = `${minutosEstudio} min`;
  }

  // Progreso de meta diaria
  const metaMin = userProfile.metaDiariaMin || 15;
  const porcentajeMeta = Math.min(100, Math.round((minutosEstudio / metaMin) * 100));
  if (dailyProgressText) dailyProgressText.textContent = `${porcentajeMeta}%`;
  if (dailyProgressBar) dailyProgressBar.style.width = `${porcentajeMeta}%`;

  // Renderizar Heatmap de Actividad en Perfil
  if (typeof renderActivityHeatmap === "function") renderActivityHeatmap();

  // Logros y Medallas
  if (badgesGrid && typeof LOGROS_DEFINICION !== "undefined") {
    badgesGrid.innerHTML = "";
    let desbloqueados = 0;
    LOGROS_DEFINICION.forEach(logro => {
      const desbloqueado = (userProfile.logros || []).includes(logro.id);
      if (desbloqueado) desbloqueados++;
      const card = document.createElement("div");
      card.className = `badge-card ${desbloqueado ? "unlocked" : ""}`;
      card.title = logro.desc;
      card.innerHTML = `
        <div class="badge-icon">${logro.icono}</div>
        <div class="badge-title">${logro.titulo}</div>
        <div class="badge-desc">${logro.desc}</div>
      `;
      badgesGrid.appendChild(card);
    });

    if (badgesUnlockedCount) {
      badgesUnlockedCount.textContent = `${desbloqueados} / ${LOGROS_DEFINICION.length} desbloqueados`;
    }
  }

  // Renderizar Galería de Certificados JLPT en perfil
  if (typeof renderizarGaleriaCertificadosPerfil === "function") {
    renderizarGaleriaCertificadosPerfil();
  }
}

// ==========================================================================
// SECCIÓN 7: CATÁLOGO Y GESTIÓN DE VENTANA MODAL DE TEMAS (ESTILO WINDOWS)
// ==========================================================================
const TORII_THEMES_CATALOG = [
  {
    id: "torii-sunset",
    nombre: "Noche Torii",
    emoji: "⛩️",
    desc: "Bermellón santuario y azul profundo (Predeterminado)",
    primaryColor: "#146482",
    accentColor: "#ff9447",
    surfaceLight: "#ffeedb",
    surfaceDark: "#0a425d"
  },
  {
    id: "sakura-night",
    nombre: "Sakura Blossom",
    emoji: "🌸",
    desc: "Flor de cerezo rosada y ciruela nocturna",
    primaryColor: "#b83264",
    accentColor: "#e8437a",
    surfaceLight: "#fae8ee",
    surfaceDark: "#2e1226"
  },
  {
    id: "emerald-bamboo",
    nombre: "Bosque Esmeralda",
    emoji: "🍃",
    desc: "Jade de bambú japonés y menta brillante",
    primaryColor: "#1b5e4b",
    accentColor: "#10b981",
    surfaceLight: "#e5f4ec",
    surfaceDark: "#0b3328"
  },
  {
    id: "cyber-tokyo",
    nombre: "Cyber Tokio",
    emoji: "🌌",
    desc: "Violeta de neón y destellos cian de Shinjuku",
    primaryColor: "#5b21b6",
    accentColor: "#06b6d4",
    surfaceLight: "#f3e8ff",
    surfaceDark: "#161130"
  },
  {
    id: "floral-navy",
    nombre: "Follaje Nocturno",
    emoji: "🌸",
    desc: "Azul marino real con acentos ámbar dorado",
    primaryColor: "#1e3a8a",
    accentColor: "#f59e0b",
    surfaceLight: "#e2e8f0",
    surfaceDark: "#0b1c36"
  },
  {
    id: "fuji-dawn",
    nombre: "Monte Fuji",
    emoji: "🗻",
    desc: "Neblina azul matinal y amanecer coral",
    primaryColor: "#2563eb",
    accentColor: "#f43f5e",
    surfaceLight: "#e0e7ff",
    surfaceDark: "#172033"
  },
  {
    id: "matcha-zen",
    nombre: "Matcha Zen",
    emoji: "🍵",
    desc: "Verde matcha natural y corteza de cedro",
    primaryColor: "#4d7c0f",
    accentColor: "#84cc16",
    surfaceLight: "#ecfccb",
    surfaceDark: "#1d2a13"
  },
  {
    id: "kyoto-autumn",
    nombre: "Otoño Momiji",
    emoji: "🍁",
    desc: "Carmesí de arce otoñal y brasas doradas",
    primaryColor: "#991b1b",
    accentColor: "#ea580c",
    surfaceLight: "#fee2e2",
    surfaceDark: "#2e1010"
  },
  {
    id: "amethyst-magic",
    nombre: "Amatista Púrpura",
    emoji: "🔮",
    desc: "Amatista noble y brillo estelar místico",
    primaryColor: "#6b21a8",
    accentColor: "#a855f7",
    surfaceLight: "#e9d5ff",
    surfaceDark: "#22103a"
  },
  {
    id: "golden-shrine",
    nombre: "Santuario Dorado",
    emoji: "✨",
    desc: "Ocre Kinkaku-ji y resplandor solar ámbar",
    primaryColor: "#854d0e",
    accentColor: "#d97706",
    surfaceLight: "#fef9c3",
    surfaceDark: "#291f0a"
  },
  {
    id: "ocean-breeze",
    nombre: "Océano Kanagawa",
    emoji: "🌊",
    desc: "Azul oleaje y turquesa de la Gran Ola",
    primaryColor: "#0369a1",
    accentColor: "#0284c7",
    surfaceLight: "#bae6fd",
    surfaceDark: "#0a2942"
  },
  {
    id: "torii-classic",
    nombre: "Torii Oscuro",
    emoji: "🖤",
    desc: "Pizarra carbón minimalista con chispa carmesí",
    primaryColor: "#343a40",
    accentColor: "#e03131",
    surfaceLight: "#dee2e6",
    surfaceDark: "#1f2226"
  }
];

function asegurarModalTemasEnDOM() {
  let modal = document.getElementById("themes-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "themes-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="themes-modal-content">
        <button id="btn-close-themes-modal" class="modal-close-btn" onclick="cerrarModalTemas()" aria-label="Cerrar ventana de temas">&times;</button>
        
        <div class="modal-header">
          <h2>🎨 Personalización de Temas</h2>
          <p>Elige tu estilo visual favorito. Los colores se aplicarán a todo Nihongo no Torii al estilo de Windows.</p>
        </div>

        <div class="themes-config-top-bar">
          <div class="current-theme-indicator">
            <span class="indicator-lbl">Tema actual:</span>
            <span id="themes-modal-current-badge" class="current-theme-pill">⛩️ Noche Torii</span>
          </div>

          <div class="theme-mode-switch-group">
            <span class="mode-lbl">Modo:</span>
            <button type="button" id="btn-theme-mode-light" class="theme-mode-btn" onclick="seleccionarModoTema('light')">☀️ Claro</button>
            <button type="button" id="btn-theme-mode-dark" class="theme-mode-btn" onclick="seleccionarModoTema('dark')">🌙 Oscuro</button>
          </div>
        </div>

        <div class="themes-catalog-grid" id="themes-catalog-grid"></div>

        <div class="modal-footer-btns">
          <button type="button" id="btn-reset-default-theme" class="btn btn-secondary" onclick="restablecerTemaPorDefecto()">🔄 Restablecer a Torii</button>
          <button type="button" id="btn-close-themes-modal-action" class="btn btn-primary" onclick="cerrarModalTemas()">✓ Listo</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      cerrarModalTemas();
    }
  };

  return modal;
}

function abrirModalTemas(event) {
  if (event) event.stopPropagation();
  
  // Cerrar otros popouts o modales si están abiertos
  const editModal = document.getElementById("edit-profile-modal");
  if (editModal) editModal.classList.remove("active");
  const profilePopout = document.getElementById("torii-profile-popout");
  if (profilePopout) profilePopout.classList.remove("open");

  const modal = asegurarModalTemasEnDOM();
  renderThemesCatalogGrid();
  actualizarBarraModoTemaModal();

  modal.classList.add("active");
}

function cerrarModalTemas() {
  const modal = document.getElementById("themes-modal");
  if (modal) modal.classList.remove("active");
}

function renderThemesCatalogGrid() {
  const grid = document.getElementById("themes-catalog-grid");
  if (!grid) return;

  const currentTheme = (typeof userProfile !== "undefined" && userProfile.hudTheme) ? userProfile.hudTheme : (localStorage.getItem("torii_theme") || "torii-sunset");
  const isDarkMode = document.body.classList.contains("dark-mode");

  grid.innerHTML = TORII_THEMES_CATALOG.map(t => {
    const isActive = t.id === currentTheme;
    const surfaceTone = isDarkMode ? t.surfaceDark : t.surfaceLight;

    return `
      <div class="theme-catalog-card ${isActive ? 'active' : ''}" onclick="seleccionarTemaDesdeModal('${t.id}')">
        <!-- Mockup Visual simulado de la interfaz -->
        <div class="theme-mockup-preview" style="background: ${surfaceTone};">
          <div class="theme-mockup-header" style="background: ${t.primaryColor};">
            <div class="theme-mockup-dots">
              <span class="mockup-dot"></span>
              <span class="mockup-dot"></span>
              <span class="mockup-dot"></span>
            </div>
            <span style="font-size: 0.65rem; color: #ffffff; opacity: 0.9;">${t.emoji}</span>
          </div>
          <div class="theme-mockup-body">
            <div class="theme-mockup-card-shape" style="border: 1px solid ${t.primaryColor}40;"></div>
            <div class="theme-mockup-accent-shape" style="background: ${t.accentColor};"></div>
          </div>
        </div>

        <div class="theme-card-info">
          <div class="theme-card-title-row">
            <span class="theme-card-title">${t.emoji} ${t.nombre}</span>
            <span class="theme-card-check">✓ Activo</span>
          </div>
          <span class="theme-card-desc">${t.desc}</span>
        </div>
      </div>
    `;
  }).join("");

  // Actualizar pill indicador del tema actual
  const currentBadge = document.getElementById("themes-modal-current-badge");
  if (currentBadge) {
    const found = TORII_THEMES_CATALOG.find(t => t.id === currentTheme) || TORII_THEMES_CATALOG[0];
    currentBadge.innerHTML = `${found.emoji} ${found.nombre}`;
  }
}

function seleccionarTemaDesdeModal(themeId) {
  if (typeof userProfile !== "undefined") {
    userProfile.hudTheme = themeId;
    if (typeof guardarPerfil === "function") guardarPerfil();
  }
  
  if (typeof aplicarTemaGlobal === "function") {
    aplicarTemaGlobal(themeId);
  }

  // Refrescar tarjetas visuales y badge
  renderThemesCatalogGrid();

  // Sincronizar select si existe
  const selectTheme = document.getElementById("select-profile-hud-theme");
  if (selectTheme) selectTheme.value = themeId;

  // Actualizar RPG HUD bar si está renderizada
  if (typeof renderHeaderRPG_HUD === "function") renderHeaderRPG_HUD();

  const found = TORII_THEMES_CATALOG.find(t => t.id === themeId);
  const nombre = found ? `${found.emoji} ${found.nombre}` : themeId;
  if (typeof mostrarToast === "function") mostrarToast(`🎨 Tema aplicado: ${nombre}`);
}

function actualizarBarraModoTemaModal() {
  const isDarkMode = document.body.classList.contains("dark-mode");
  const btnLight = document.getElementById("btn-theme-mode-light");
  const btnDark = document.getElementById("btn-theme-mode-dark");

  if (btnLight) btnLight.classList.toggle("active", !isDarkMode);
  if (btnDark) btnDark.classList.toggle("active", isDarkMode);
}

function seleccionarModoTema(mode) {
  const body = document.body;
  const html = document.documentElement;
  const btnHeaderToggle = document.getElementById("dark-mode-toggle");

  if (mode === "dark") {
    body.classList.add("dark-mode");
    html.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    if (btnHeaderToggle) btnHeaderToggle.innerText = "☀️";
  } else {
    body.classList.remove("dark-mode");
    html.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    if (btnHeaderToggle) btnHeaderToggle.innerText = "🌙";
  }

  actualizarBarraModoTemaModal();
  renderThemesCatalogGrid();
  if (typeof mostrarToast === "function") mostrarToast(`🌓 Modo ${mode === 'dark' ? 'Oscuro' : 'Claro'} activado`);
}

function restablecerTemaPorDefecto() {
  seleccionarTemaDesdeModal("torii-sunset");
  if (typeof mostrarToast === "function") mostrarToast("⛩️ Tema restablecido a Noche Torii por defecto");
}

window.abrirModalTemas = abrirModalTemas;
window.cerrarModalTemas = cerrarModalTemas;
window.seleccionarTemaDesdeModal = seleccionarTemaDesdeModal;
window.seleccionarModoTema = seleccionarModoTema;
window.restablecerTemaPorDefecto = restablecerTemaPorDefecto;
