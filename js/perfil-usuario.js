// ==========================================================================
// SECCIÓN 6 (PERFIL): MÓDULO PERFIL DEL ESTUDIANTE
// ==========================================================================
let userProfile = {
  nombre: "Estudiante Torii",
  avatar: "⛩️",
  nivelObjetivo: "JLPT N5",
  lema: "¡Paso a paso hacia el dominio del japonés! ⛩️",
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

  // Listeners del modal de personalización de perfil
  const btnOpenEditModal = document.getElementById("btn-open-edit-modal");
  const btnEditAvatarBadge = document.getElementById("btn-edit-profile");
  const modalEditProfile = document.getElementById("edit-profile-modal");
  const btnCloseEditModal = document.getElementById("btn-close-edit-modal");
  const btnCancelEdit = document.getElementById("btn-cancel-edit-profile");

  if (btnOpenEditModal) btnOpenEditModal.addEventListener("click", abrirModalEditarPerfil);
  if (btnEditAvatarBadge) btnEditAvatarBadge.addEventListener("click", abrirModalEditarPerfil);
  if (btnCloseEditModal) btnCloseEditModal.addEventListener("click", cerrarModalEditarPerfil);
  if (btnCancelEdit) btnCancelEdit.addEventListener("click", cerrarModalEditarPerfil);

  if (modalEditProfile) {
    modalEditProfile.addEventListener("click", (e) => {
      if (e.target === modalEditProfile) {
        cerrarModalEditarPerfil();
      }
    });
  }

  // Selector de avatares predefinidos
  const avatarButtons = document.querySelectorAll(".avatar-option-btn");
  avatarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      avatarButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      avatarSeleccionadoTemporal = btn.getAttribute("data-avatar");
      const customInput = document.getElementById("input-custom-avatar");
      if (customInput) customInput.value = "";
    });
  });

  // Listener para subida de imagen de archivo local
  const inputFileAvatar = document.getElementById("input-file-avatar");
  if (inputFileAvatar) {
    inputFileAvatar.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          avatarSeleccionadoTemporal = evt.target.result;
          avatarButtons.forEach(b => b.classList.remove("selected"));
          const customInput = document.getElementById("input-custom-avatar");
          if (customInput) customInput.value = "";
          if (typeof mostrarToast === "function") mostrarToast("🖼️ Imagen local cargada");
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function abrirModalEditarPerfil() {
  const modal = document.getElementById("edit-profile-modal");
  if (!modal) return;

  const inputName = document.getElementById("input-profile-name");
  const selectLevel = document.getElementById("select-profile-level");
  const inputMotto = document.getElementById("input-profile-motto");
  const selectGoal = document.getElementById("select-profile-goal");
  const customAvatarInput = document.getElementById("input-custom-avatar");
  const inputDob = document.getElementById("input-profile-dob");
  const selectCountry = document.getElementById("select-profile-country");

  if (inputName) inputName.value = userProfile.nombre || "SATOU UTSUJI";
  if (selectLevel) selectLevel.value = userProfile.nivelObjetivo || "JLPT N5";
  if (inputMotto) inputMotto.value = userProfile.lema || "";
  if (selectGoal) selectGoal.value = userProfile.metaDiariaMin || 15;
  if (inputDob) inputDob.value = userProfile.fechaNacimiento || "1993-09-26";
  if (selectCountry) selectCountry.value = userProfile.paisExamen || "UK";
  
  avatarSeleccionadoTemporal = userProfile.avatar || "⛩️";

  // Resaltar botón de avatar activo
  const avatarButtons = document.querySelectorAll(".avatar-option-btn");
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
}

function guardarEdicionPerfil() {
  const inputName = document.getElementById("input-profile-name");
  const selectLevel = document.getElementById("select-profile-level");
  const inputMotto = document.getElementById("input-profile-motto");
  const selectGoal = document.getElementById("select-profile-goal");
  const customAvatarInput = document.getElementById("input-custom-avatar");
  const inputDob = document.getElementById("input-profile-dob");
  const selectCountry = document.getElementById("select-profile-country");

  const nuevoNombre = inputName && inputName.value.trim() ? inputName.value.trim() : "SATOU UTSUJI";
  const nuevoNivel = selectLevel ? selectLevel.value : "JLPT N5";
  const nuevoLema = inputMotto ? inputMotto.value.trim() : "";
  const nuevaMeta = selectGoal ? parseInt(selectGoal.value, 10) : 15;
  const nuevaFechaNac = inputDob && inputDob.value ? inputDob.value : "1993-09-26";
  const nuevoPais = selectCountry ? selectCountry.value : "UK";

  let nuevoAvatar = avatarSeleccionadoTemporal || "⛩️";
  if (customAvatarInput && customAvatarInput.value.trim()) {
    nuevoAvatar = customAvatarInput.value.trim();
  }

  userProfile.nombre = nuevoNombre;
  userProfile.nivelObjetivo = nuevoNivel;
  userProfile.lema = nuevoLema;
  userProfile.metaDiariaMin = nuevaMeta;
  userProfile.avatar = nuevoAvatar;
  userProfile.fechaNacimiento = nuevaFechaNac;
  userProfile.paisExamen = nuevoPais;

  guardarPerfil();
  cerrarModalEditarPerfil();
  renderUserProfileUI();
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
