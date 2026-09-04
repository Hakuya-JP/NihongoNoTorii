// ==========================================================================
// SECCIÓN 7: MÓDULO DE TARJETAS MINADAS Y EXPORTADOR ANKI
// ==========================================================================
let minedCardsList = [];

let minedSortRecentFirst = true;
let minedExpanded = false;

function initMinedCardsModule() {
  const guardado = localStorage.getItem("torii_mined_cards");
  if (guardado) {
    try {
      minedCardsList = JSON.parse(guardado);
    } catch (e) {
      console.warn("Error al cargar tarjetas minadas:", e);
      minedCardsList = [];
    }
  }

  renderMinedCardsUI();

  const btnExportTxt = document.getElementById("btn-export-anki-txt");
  const btnClearMined = document.getElementById("btn-clear-mined");
  const btnSortMined = document.getElementById("btn-sort-mined");
  const btnToggleExpand = document.getElementById("btn-toggle-expand-mined");

  if (btnExportTxt) {
    btnExportTxt.addEventListener("click", exportarListaAAnkiTxt);
  }

  if (btnClearMined) {
    btnClearMined.addEventListener("click", () => {
      if (minedCardsList.length === 0) return;
      if (confirm("¿Estás seguro de vaciar todas las tarjetas minadas de tu lista?")) {
        minedCardsList = [];
        guardarTarjetasMinadas();
        renderMinedCardsUI();
        if (typeof mostrarToast === "function") mostrarToast("🗑️ Lista de tarjetas minadas vaciada");
      }
    });
  }

  if (btnSortMined) {
    btnSortMined.addEventListener("click", () => {
      minedSortRecentFirst = !minedSortRecentFirst;
      renderMinedCardsUI();
      if (typeof mostrarToast === "function") mostrarToast(minedSortRecentFirst ? "🔃 Ordenado: Más recientes primero" : "🔃 Ordenado: Más antiguas primero");
    });
  }

  if (btnToggleExpand) {
    btnToggleExpand.addEventListener("click", () => {
      minedExpanded = !minedExpanded;
      renderMinedCardsUI();
    });
  }
}

function guardarTarjetasMinadas() {
  localStorage.setItem("torii_mined_cards", JSON.stringify(minedCardsList));
}

async function obtenerTraduccionRapida(textoJapones) {
  if (!textoJapones || !textoJapones.trim()) return "";
  try {
    const frase = textoJapones.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=es&dt=t&q=${encodeURIComponent(frase)}`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0].map(item => item[0]).filter(Boolean).join(" ");
    }
  } catch (err) {
    console.warn("No se pudo obtener la traducción automática:", err);
  }
  return "";
}

function agregarTarjetaMinadaLocal(sub, tipo) {
  const timestamp = Date.now();
  const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

  const nuevaTarjeta = {
    id: `ToriiTV_${timestamp}`,
    oracion: fraseLimpia,
    furigana: sub.texto,
    traduccion: sub.traduccion || "",
    tiempo: sub.inicio ? sub.inicio : 0,
    tipo: tipo || (typeof ankiConfig !== "undefined" && (ankiConfig.model === "ToriiDeckVideo" || ankiConfig.model === "ToriiVideo") ? "video" : "imagen"),
    fecha: new Date().toLocaleDateString()
  };

  // Evitar duplicados exactos
  const yaExiste = minedCardsList.some(t => t.oracion === nuevaTarjeta.oracion);
  if (!yaExiste) {
    minedCardsList.unshift(nuevaTarjeta);
    guardarTarjetasMinadas();
    renderMinedCardsUI();
    if (typeof registrarTarjetaMinadaEnPerfil === "function") registrarTarjetaMinadaEnPerfil();
    if (typeof concederXP === "function") {
      concederXP(5, "📇 Tarjeta minada");
      if (typeof actualizarProgresoMision === "function") {
        actualizarProgresoMision("minado", 1);
      }
    }
  }

  if (typeof mostrarToast === "function") mostrarToast("⭐ ¡Tarjeta agregada a tu lista!");
}

function eliminarTarjetaMinadaLocal(id) {
  minedCardsList = minedCardsList.filter(t => t.id !== id);
  guardarTarjetasMinadas();
  renderMinedCardsUI();
  if (typeof mostrarToast === "function") mostrarToast("🗑️ Tarjeta eliminada de la lista");
}

function renderMinedCardsUI() {
  const badgeCount = document.getElementById("mined-count-badge");
  const gridContainer = document.getElementById("mined-cards-grid");
  const btnSortMined = document.getElementById("btn-sort-mined");
  const btnToggleExpand = document.getElementById("btn-toggle-expand-mined");

  if (badgeCount) {
    badgeCount.textContent = `${minedCardsList.length} tarjeta${minedCardsList.length !== 1 ? "s" : ""}`;
  }

  if (btnSortMined) {
    btnSortMined.innerHTML = minedSortRecentFirst ? "<span>🔃 Recientes primero</span>" : "<span>🔃 Antiguas primero</span>";
  }

  if (btnToggleExpand) {
    btnToggleExpand.innerHTML = minedExpanded ? "<span>Mostrar menos 🔺</span>" : "<span>Mostrar más 🔻</span>";
    btnToggleExpand.style.display = minedCardsList.length > 3 ? "inline-flex" : "none";
  }

  if (!gridContainer) return;

  const wrapper = gridContainer.closest(".mined-cards-wrapper");

  if (minedExpanded) {
    gridContainer.classList.remove("collapsed");
    if (wrapper) wrapper.classList.add("expanded");
  } else {
    gridContainer.classList.add("collapsed");
    if (wrapper) wrapper.classList.remove("expanded");
  }

  if (minedCardsList.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-mined-msg" style="grid-column: 1 / -1;">
        <p>No tienes tarjetas minadas aún. Haz clic en la estrella <strong>⭐</strong> en los subtítulos para agregarlas a tu lista.</p>
      </div>
    `;
    return;
  }

  // Copia ordenada para renderizar
  const listaParaMostrar = [...minedCardsList];
  if (!minedSortRecentFirst) {
    listaParaMostrar.reverse();
  }

  gridContainer.innerHTML = "";
  listaParaMostrar.forEach(tarjeta => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "mined-card-item";
    const tradHtml = tarjeta.traduccion ? `<div class="mined-card-trad" style="font-size: 0.85rem; opacity: 0.85; color: var(--crema2); margin-top: 4px;">ES: ${tarjeta.traduccion}</div>` : '';
    const badgeTipo = tarjeta.tipo === "video" 
      ? `<span style="background: rgba(255,140,0,0.18); color: var(--naranja, #ff8c00); padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: bold; margin-left: 6px;">🎬 Video</span>`
      : `<span style="background: rgba(20,100,130,0.15); color: var(--azul, #146482); padding: 2px 7px; border-radius: 6px; font-size: 0.72rem; font-weight: bold; margin-left: 6px;">🖼️ Imagen</span>`;
    cardDiv.innerHTML = `
      <button class="mined-card-del" title="Eliminar de la lista" onclick="eliminarTarjetaMinadaLocal('${tarjeta.id}')">&times;</button>
      <span class="mined-card-time">⏱️ ${tarjeta.fecha || "Captura"} ${badgeTipo}</span>
      <div class="mined-card-text">${tarjeta.furigana}</div>
      ${tradHtml}
    `;
    gridContainer.appendChild(cardDiv);
  });
}

function exportarListaAAnkiTxt() {
  if (minedCardsList.length === 0) {
    alert("No tienes ninguna tarjeta en tu lista para exportar.");
    return;
  }

  let contenido = "#separator:Tab\n#html:true\n#columns:Indice\tOracion\tFurigana\tTraduccion\tTags\n";

  minedCardsList.forEach(t => {
    contenido += `${t.id}\t${t.oracion}\t${t.furigana}\t${t.traduccion || ""}\tToriiTV\n`;
  });

  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ToriiTV_Tarjetas_Anki_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  if (typeof mostrarToast === "function") mostrarToast("📥 Archivo para Anki descargado con éxito");
}

function mostrarToast(mensaje) {
  let toast = document.getElementById("torii-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "torii-toast";
    toast.className = "torii-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = mensaje;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Expuestos globalmente
window.eliminarTarjetaMinadaLocal = eliminarTarjetaMinadaLocal;

function toggleV(id) {
  const elem = document.getElementById(id);
  if (elem) {
    elem.classList.toggle("visible");
    if (elem.style.display === "block") {
      elem.style.display = "none";
    } else {
      elem.style.display = "block";
    }
  }
}
window.toggleV = toggleV;
