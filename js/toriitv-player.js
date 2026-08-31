// ==========================================================================
// SECCIÓN 4: MÓDULO TORIITV (REPRODUCTOR DE VIDEO Y SUBTÍTULOS)
// ==========================================================================
function initVideoPlayerModule() {
  const video = document.getElementById("main-video");
  const videoWrapper = document.getElementById("video-wrapper");
  const inputVideo = document.getElementById("input-video");
  const inputSub = document.getElementById("input-sub");
  const overlaySub = document.getElementById("overlay-subtitles");
  const subListContainer = document.getElementById("subtitles-list");
  const subCount = document.getElementById("sub-count");
  const colorPicker = document.getElementById("sub-color-picker");
  const btnToggleBg = document.getElementById("btn-toggle-bg");
  const fontSelect = document.getElementById("sub-font-family");
  const bgColorPicker = document.getElementById("sub-bg-color-picker");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  
  const btnSubMinus = document.getElementById("btn-sub-minus");
  const btnSubPlus = document.getElementById("btn-sub-plus");
  const btnTextMinus = document.getElementById("btn-text-minus");
  const btnTextPlus = document.getElementById("btn-text-plus");

  if (!video) return;

  let subtitulos = [];
  let timeOffset = 0;
  let fontSizeOverlay = 1.4;

  // ------------------------------------------------------------------
  // FURIGANA: MOTOR NATIVO ULTRA-RÁPIDO TORII (CARGA BAJO DEMANDA Y PROGRESO)
  // ------------------------------------------------------------------
  let furiganaDictMap = null;
  let furiganaWordMap = null;
  let isDownloadingFurigana = false;

  function abrirModalFurigana() {
    const modal = document.getElementById("furigana-confirm-modal");
    if (modal) modal.classList.add("active");
  }

  function cerrarModalFurigana() {
    const modal = document.getElementById("furigana-confirm-modal");
    if (modal) modal.classList.remove("active");
  }

  function actualizarProgresoFurigana(pct, statusText, detailText) {
    const widget = document.getElementById("furigana-download-widget");
    const bar = document.getElementById("furigana-progress-bar");
    const percentSpan = document.getElementById("furigana-dl-percent");
    const statusSpan = document.getElementById("furigana-dl-status");
    const detailSpan = document.getElementById("furigana-dl-detail");
    const spinner = document.getElementById("furigana-spinner-icon");

    if (widget) widget.classList.add("visible");
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    if (percentSpan) percentSpan.textContent = `${Math.round(pct)}%`;
    if (statusSpan && statusText) statusSpan.textContent = statusText;
    if (detailSpan && detailText) detailSpan.textContent = detailText;
    if (spinner && pct >= 100) spinner.textContent = "✅";
    else if (spinner) spinner.textContent = "⏳";
  }

  function ocultarProgresoFurigana(delay = 2500) {
    setTimeout(() => {
      const widget = document.getElementById("furigana-download-widget");
      if (widget) widget.classList.remove("visible");
    }, delay);
  }

  async function iniciarDescargaFurigana() {
    if (isDownloadingFurigana || furiganaDictMap) return;
    isDownloadingFurigana = true;
    cerrarModalFurigana();

    actualizarProgresoFurigana(10, "Conectando con repositorio...", "Descargando tablas de caracteres...");

    try {
      const basePath = window.TORII_BASE_PATH || "";
      const kanjiUrl = `${basePath}diccionarios/kanjidic_spanish/kanji_bank_1.json`;
      const termUrl = `${basePath}diccionarios/jmdict_spanish/term_bank_1.json`;

      // 1. Descargar Diccionario Kanji con flujo de progreso en tiempo real
      const res = await fetch(kanjiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: No se pudo cargar kanji_bank_1.json`);

      const contentLength = res.headers.get("content-length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 1480000;
      let loadedBytes = 0;

      let reader;
      const chunks = [];

      if (res.body && res.body.getReader) {
        reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loadedBytes += value.length;
          const pct = Math.min(80, Math.round((loadedBytes / totalBytes) * 75) + 10);
          actualizarProgresoFurigana(
            pct,
            "Descargando diccionario...",
            `${(loadedBytes / 1024).toFixed(0)} KB descargados (${pct}%)`
          );
        }
      }

      actualizarProgresoFurigana(85, "Indexando caracteres...", "Procesando lecturas ON/KUN...");

      let textData;
      if (chunks.length > 0) {
        const blob = new Blob(chunks);
        textData = await blob.text();
      } else {
        textData = await res.text();
      }

      const kanjiArray = JSON.parse(textData);
      furiganaDictMap = new Map();

      // Construir mapa de kanji: { on: [], kun: [] }
      kanjiArray.forEach(item => {
        if (Array.isArray(item) && item[0]) {
          const char = item[0];
          const onStr = item[1] || "";
          const kunStr = item[2] || "";
          furiganaDictMap.set(char, {
            on: onStr.split(" ").filter(Boolean).map(katakanaToHiragana),
            kun: kunStr.split(" ").filter(Boolean)
          });
        }
      });

      // 2. Intentar cargar palabras comunes si es posible (no bloqueante)
      try {
        actualizarProgresoFurigana(92, "Cargando vocabulario común...", "Optimizando palabras compuestas...");
        const termRes = await fetch(termUrl);
        if (termRes.ok) {
          const termsData = await termRes.json();
          furiganaWordMap = new Map();
          termsData.forEach(t => {
            if (Array.isArray(t) && t[0] && t[1] && t[0] !== t[1]) {
              const word = t[0];
              const reading = t[1];
              if (!furiganaWordMap.has(word)) {
                furiganaWordMap.set(word, reading);
              }
            }
          });
        }
      } catch (errTerms) {
        console.log("Vocabulario compuesto opcional omitido, usando diccionario base:", errTerms);
      }

      actualizarProgresoFurigana(100, "✅ ¡Furigana listo!", "Diccionario inicializado con éxito.");
      isDownloadingFurigana = false;
      ocultarProgresoFurigana(2500);

      // Enriquecer subtítulos actuales si ya hay subtítulos cargados
      if (subtitulos && subtitulos.length > 0) {
        subtitulos.forEach(s => {
          s.textoFurigana = agregarFurigana(s.texto);
        });
        window.subtitlesData = subtitulos;
        renderSidebarSubtitles();

        if (overlaySub && video) {
          const currentTime = video.currentTime;
          const subActual = subtitulos.find(s => currentTime >= (s.inicio + timeOffset) && currentTime <= (s.fin + timeOffset));
          if (subActual) {
            overlaySub.innerHTML = subActual.textoFurigana || subActual.texto;
          }
        }
      }

      // Activar visualmente el Furigana
      document.body.classList.remove("sin-furigana");
      const btnFuri = document.getElementById("btn-toggle-furigana");
      if (btnFuri) btnFuri.classList.add("active-tool");
      if (typeof mostrarToast === "function") mostrarToast("🌸 ¡Furigana generado y activado!");

    } catch (e) {
      isDownloadingFurigana = false;
      console.error("Error al cargar diccionario furigana:", e);
      actualizarProgresoFurigana(100, "⚠️ Error de descarga", "No se pudo cargar el archivo local.");
      ocultarProgresoFurigana(3500);
      if (typeof mostrarToast === "function") mostrarToast("⚠️ No se pudo inicializar el diccionario de Furigana");
    }
  }

  // Listeners de modal de furigana
  const btnCloseFuriModal = document.getElementById("btn-close-furigana-modal");
  const btnCancelFuriDl = document.getElementById("btn-cancel-furigana-dl");
  const btnConfirmFuriDl = document.getElementById("btn-confirm-furigana-dl");
  const modalFurigana = document.getElementById("furigana-confirm-modal");

  if (btnCloseFuriModal) btnCloseFuriModal.addEventListener("click", cerrarModalFurigana);
  if (btnCancelFuriDl) btnCancelFuriDl.addEventListener("click", cerrarModalFurigana);
  if (btnConfirmFuriDl) btnConfirmFuriDl.addEventListener("click", iniciarDescargaFurigana);
  if (modalFurigana) {
    modalFurigana.addEventListener("click", (e) => {
      if (e.target === modalFurigana) cerrarModalFurigana();
    });
  }

  /** Convierte katakana a hiragana */
  function katakanaToHiragana(str) {
    if (!str) return "";
    return str.replace(/[\u30A1-\u30F6]/g, ch =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );
  }

  /** Devuelve true si el carácter es un kanji CJK */
  function esKanji(ch) {
    if (!ch) return false;
    const c = ch.charCodeAt(0);
    return (c >= 0x4E00 && c <= 0x9FAF) || (c >= 0x3400 && c <= 0x4DBF);
  }

  /**
   * Procesa una cadena de texto y genera <ruby> sobre los kanji usando el mapa indexado
   */
  function procesarTextoAFurigana(textoPlano) {
    if (!textoPlano || !furiganaDictMap) return textoPlano;

    let res = "";
    let i = 0;
    const len = textoPlano.length;

    while (i < len) {
      const ch = textoPlano[i];

      if (esKanji(ch)) {
        // Agrupar kanjis consecutivos
        let kanjiGroup = ch;
        let j = i + 1;
        while (j < len && esKanji(textoPlano[j])) {
          kanjiGroup += textoPlano[j];
          j++;
        }

        // 1. Revisar si coincide con una palabra conocida en el mapa de vocabulario
        if (furiganaWordMap && furiganaWordMap.has(kanjiGroup)) {
          const reading = furiganaWordMap.get(kanjiGroup);
          res += `<ruby>${kanjiGroup}<rt>${reading}</rt></ruby>`;
          i = j;
          continue;
        }

        // Mirar el okurigana siguiente (caracteres hiragana que le siguen)
        let okuriRestante = "";
        let k = j;
        while (k < len && !esKanji(textoPlano[k]) && /[\u3040-\u309F]/.test(textoPlano[k])) {
          okuriRestante += textoPlano[k];
          k++;
        }

        // 2. Si es un solo kanji
        if (kanjiGroup.length === 1) {
          const kanjiInfo = furiganaDictMap.get(kanjiGroup);
          if (kanjiInfo) {
            let lecturaElegida = null;

            // Probar lecturas KUN con okurigana coincidente
            if (kanjiInfo.kun && kanjiInfo.kun.length > 0) {
              for (const kun of kanjiInfo.kun) {
                if (kun.includes(".")) {
                  const [raiz, sufijo] = kun.split(".");
                  if (okuriRestante && (okuriRestante.startsWith(sufijo) || (sufijo && okuriRestante.startsWith(sufijo[0])))) {
                    lecturaElegida = raiz.replace(/^-|-$/g, "");
                    break;
                  }
                }
              }

              if (!lecturaElegida) {
                const primeraKun = kanjiInfo.kun[0];
                if (primeraKun) {
                  lecturaElegida = primeraKun.split(".")[0].replace(/^-|-$/g, "");
                }
              }
            }

            // Usar lectura ON como alternativa
            if (!lecturaElegida && kanjiInfo.on && kanjiInfo.on.length > 0) {
              lecturaElegida = kanjiInfo.on[0];
            }

            if (lecturaElegida) {
              res += `<ruby>${kanjiGroup}<rt>${lecturaElegida}</rt></ruby>`;
              i = j;
              continue;
            }
          }
        } else {
          // Múltiples kanjis consecutivos (compuesto)
          let grupoRuby = "";
          for (const kChar of kanjiGroup) {
            const kInfo = furiganaDictMap.get(kChar);
            let l = "";
            if (kInfo) {
              if (kInfo.on && kInfo.on.length > 0) l = kInfo.on[0];
              else if (kInfo.kun && kInfo.kun.length > 0) l = kInfo.kun[0].split(".")[0].replace(/^-|-$/g, "");
            }
            if (l) {
              grupoRuby += `<ruby>${kChar}<rt>${l}</rt></ruby>`;
            } else {
              grupoRuby += kChar;
            }
          }
          res += grupoRuby;
          i = j;
          continue;
        }

        res += kanjiGroup;
        i = j;
      } else {
        res += ch;
        i++;
      }
    }

    return res;
  }

  /**
   * Procesa el texto de un subtítulo y devuelve HTML con <ruby> sobre cada kanji.
   * Preserva los saltos de línea (<br>) y el resto del HTML intacto.
   */
  function agregarFurigana(texto) {
    if (!furiganaDictMap || !texto) return texto;

    // Si ya contiene etiquetas <ruby>, respetarlas
    if (texto.includes("<ruby") || texto.includes("<rt>")) {
      return texto;
    }

    const partes = texto.split(/(<[^>]+>)/g);

    const resultado = partes.map(parte => {
      if (parte.startsWith("<") && parte.endsWith(">")) {
        return parte;
      }
      return procesarTextoAFurigana(parte);
    });

    return resultado.join("");
  }


  // Furigana desactivado por defecto
  document.body.classList.add("sin-furigana");

  if (!video.getAttribute("src") && overlaySub) {
    overlaySub.innerText = "🎬 Da clic aquí para cargar el video";
    overlaySub.classList.add("centrado");
  }

  video.addEventListener("click", () => {
    if (!video.getAttribute("src") && inputVideo) inputVideo.click();
  });

  if (subListContainer) {
    subListContainer.addEventListener("click", (e) => {
      if (subtitulos.length === 0 && inputSub && !e.target.closest('.sub-line')) {
        inputSub.click(); 
      }
    });
  }

  // Carga de archivo de Video
  if (inputVideo) {
    inputVideo.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        window.currentVideoFile = file;
        video.src = URL.createObjectURL(file);
        if (overlaySub) {
          overlaySub.innerText = "";
          overlaySub.classList.remove("centrado");
        }
        
        if (subtitulos.length === 0 && subListContainer) {
          subListContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; cursor: pointer;">
              <p class="sub-placeholder" style="margin: 0; font-weight: bold; font-size: 0.95rem;">✅ Video cargado.</p>
              <p class="sub-placeholder" style="margin-top: 6px; font-size: 0.85rem; opacity: 0.8;">Da clic aquí para subir los subtítulos (.srt, .vtt, .ass)</p>
            </div>
          `;
        }
      }
    });
  }

  // Carga de Subtítulos (Japonés)
  if (inputSub) {
    inputSub.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();
        
        reader.onload = function(evt) {
          const textoCrudo = evt.target.result;
          subtitulos = (extension === "ass" || extension === "ssa") ? parseASS(textoCrudo) : parseSRT(textoCrudo);
          
          // Enriquecer cada subtítulo con furigana sobre los kanji
          subtitulos.forEach(s => { s.textoFurigana = agregarFurigana(s.texto); });
          
          window.subtitlesData = subtitulos;
          asociarTraduccionesES();
          renderSidebarSubtitles();
          
          if (video.getAttribute("src") && overlaySub) {
            overlaySub.innerText = ""; 
            overlaySub.classList.remove("centrado");
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // Carga opcional de Subtítulos en Español (para tarjetas de Anki)
  const inputSubEs = document.getElementById("input-sub-es");
  let subtitulosES = [];

  if (inputSubEs) {
    inputSubEs.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();
        reader.onload = function(evt) {
          const textoCrudo = evt.target.result;
          subtitulosES = (extension === "ass" || extension === "ssa") ? parseASS(textoCrudo) : parseSRT(textoCrudo);
          asociarTraduccionesES();
          if (typeof mostrarToast === "function") mostrarToast("💬 Subtítulo en español cargado para Anki");
        };
        reader.readAsText(file);
      }
    });
  }

  function asociarTraduccionesES() {
    if (!subtitulos || subtitulos.length === 0 || !subtitulosES || subtitulosES.length === 0) return;
    subtitulos.forEach(subJP => {
      const coincidencia = subtitulosES.find(subES => 
        (subES.inicio <= subJP.fin && subES.fin >= subJP.inicio)
      );
      if (coincidencia) {
        subJP.traduccion = coincidencia.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
      }
    });
  }

  function parseSRT(data) {
    data = data.replace(/\r\n/g, '\n').trim() + '\n\n';
    const regex = /(?:\d+\n)?(\d\d:\d\d:\d\d[,.]\d\d\d) --> (\d\d:\d\d:\d\d[,.]\d\d\d)\n([\s\S]*?)(?=\n\n)/g;
    let result = [];
    let match;

    while ((match = regex.exec(data)) !== null) {
      result.push({
        id: result.length + 1,
        inicio: timeToSeconds(match[1]),
        fin: timeToSeconds(match[2]),
        texto: match[3].replace(/\n/g, "<br>")
      });
    }

    if (subCount) subCount.innerText = `${result.length} líneas`;
    return result;
  }

  function parseASS(data) {
    let result = [];
    const lines = data.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith("Dialogue:")) {
        const parts = line.split(',');
        if (parts.length >= 10) {
          const startStr = parts[1].trim(); 
          const endStr = parts[2].trim();
          let text = parts.slice(9).join(',').trim();
          
          text = text.replace(/\{\\[^}]+\}/g, '');
          text = text.replace(/\\N/g, '<br>').replace(/\\n/g, '<br>');

          result.push({
            id: result.length + 1,
            inicio: assTimeToSeconds(startStr),
            fin: assTimeToSeconds(endStr),
            texto: text
          });
        }
      }
    });
    
    if (subCount) subCount.innerText = `${result.length} líneas (.ass)`;
    return result;
  }

  function timeToSeconds(timeStr) {
    timeStr = timeStr.replace('.', ','); 
    const parts = timeStr.split(":");
    const secondsParts = parts[2].split(",");

    const sec = parseInt(secondsParts[0], 10) || 0;
    const fractionStr = (secondsParts[1] || "0").trim();
    const fraction = parseFloat("0." + fractionStr) || 0;

    return (parseInt(parts[0], 10) || 0) * 3600 + 
           (parseInt(parts[1], 10) || 0) * 60 + 
           sec + fraction;
  }

  function assTimeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    const secParts = parts[2].split('.');
    const sec = parseInt(secParts[0], 10) || 0;
    const fractionStr = (secParts[1] || "0").trim();
    const fraction = parseFloat("0." + fractionStr) || 0;

    return ((parseInt(parts[0], 10) || 0) * 3600) + 
           ((parseInt(parts[1], 10) || 0) * 60) + 
           sec + fraction;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function renderSidebarSubtitles() {
    if (!subListContainer) return;
    subListContainer.innerHTML = "";
    
    subtitulos.forEach((sub, index) => {
      const lineDiv = document.createElement("div");
      lineDiv.classList.add("sub-line");
      lineDiv.dataset.index = index;

      lineDiv.innerHTML = `
        <span class="sub-time">${formatTime(sub.inicio + timeOffset)}</span>
        <div class="sub-text">${sub.textoFurigana || sub.texto}</div>
        <button class="btn-anki-star" title="Enviar minado a Anki">☆</button>
      `;

      lineDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-anki-star")) return;
        video.currentTime = sub.inicio + timeOffset;
        video.play().catch(() => {});
      });

      const starBtn = lineDiv.querySelector(".btn-anki-star");
      if (starBtn) {
        starBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          starBtn.innerText = "⏳";

          // Asegurar traducción al español para la tarjeta de Anki
          if (!sub.traduccion && typeof obtenerTraduccionRapida === "function") {
            const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
            sub.traduccion = await obtenerTraduccionRapida(fraseLimpia);
          }

          // 1. Siempre guardar copia de respaldo en la lista local de la web
          if (typeof agregarTarjetaMinadaLocal === "function") {
            agregarTarjetaMinadaLocal(sub);
          }
          starBtn.innerText = "★";
          starBtn.classList.add("active");

          // 2. Enviar directamente a Anki vía AnkiConnect
          if (typeof window.enviarObjetoAAnki === "function" && typeof ankiConfig !== "undefined" && ankiConfig.enabled) {
            try {
              const resId = await window.enviarObjetoAAnki(sub);
              if (typeof mostrarToast === "function") mostrarToast("📇 ¡Tarjeta enviada directamente a Anki!");
              starBtn.title = `¡Enviada a Anki (ID: ${resId}) y guardada en tu lista!`;
            } catch (error) {
              console.warn("AnkiConnect no respondió (quedó guardada en tu lista web):", error.message);
              if (typeof mostrarToast === "function") mostrarToast("⭐ Guardada en tu lista web (Anki offline)");
              starBtn.title = "¡Añadida a tu lista de la web!";
            }
          } else {
            if (typeof mostrarToast === "function") mostrarToast("⭐ Guardada en tu lista web");
            starBtn.title = "¡Añadida a tu lista de la web!";
          }
        });
      }

      subListContainer.appendChild(lineDiv);
    });
  }

  // Sincronización continua de Video y Subtítulos + Contador de Tiempo de Estudio
  let ultimoContadorTiempo = Date.now();
  video.addEventListener("timeupdate", () => {
    // Registrar tiempo de estudio acumulado cada 5 segundos de reproducción activa
    const ahora = Date.now();
    if (!video.paused && (ahora - ultimoContadorTiempo) >= 5000) {
      if (typeof registrarTiempoEstudio === "function") {
        registrarTiempoEstudio(5);
      }
      ultimoContadorTiempo = ahora;
    }

    if (subtitulos.length === 0) return;

    const currentTime = video.currentTime;
    const subActual = subtitulos.find(s => currentTime >= (s.inicio + timeOffset) && currentTime <= (s.fin + timeOffset));

    if (overlaySub) {
      if (subActual) {
        overlaySub.innerHTML = subActual.textoFurigana || subActual.texto;
      } else if (video.getAttribute("src") && video.currentTime > 0) {
        overlaySub.innerHTML = "";
      }
    }

    if (subListContainer) {
      const activeDiv = subListContainer.querySelector(".sub-line.active");
      if (activeDiv) activeDiv.classList.remove("active");

      if (subActual) {
        const index = subtitulos.indexOf(subActual);
        const targetDiv = subListContainer.children[index];
        if (targetDiv) {
          targetDiv.classList.add("active");
          targetDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  });

  // Ajustes de Desfase de Subtítulos y Estilos de Texto
  const btnSubMinusFast = document.getElementById("btn-sub-minus-fast");
  const btnSubPlusFast = document.getElementById("btn-sub-plus-fast");

  const updateSyncOffset = (delta) => {
    timeOffset += delta;
    window.toriiTimeOffset = timeOffset;
    actualizarTiemposUI();
    const sign = timeOffset > 0 ? "+" : "";
    if (typeof mostrarToast === "function") mostrarToast(`⏱️ Desfase de Sincro: ${sign}${timeOffset.toFixed(1)}s`);
  };

  if (btnSubPlusFast) btnSubPlusFast.addEventListener("click", () => updateSyncOffset(0.5));
  if (btnSubPlus) btnSubPlus.addEventListener("click", () => updateSyncOffset(0.1));
  if (btnSubMinus) btnSubMinus.addEventListener("click", () => updateSyncOffset(-0.1));
  if (btnSubMinusFast) btnSubMinusFast.addEventListener("click", () => updateSyncOffset(-0.5));

  function actualizarTiemposUI() {
    if (!subListContainer) return;
    const lines = subListContainer.querySelectorAll(".sub-line");
    lines.forEach((line, i) => {
      const timeSpan = line.querySelector(".sub-time");
      if (timeSpan && subtitulos[i]) {
        timeSpan.innerText = formatTime(subtitulos[i].inicio + timeOffset);
      }
    });
  }

  if (btnTextPlus) btnTextPlus.addEventListener("click", () => { fontSizeOverlay += 0.2; if(overlaySub) overlaySub.style.fontSize = `${fontSizeOverlay}rem`; });
  if (btnTextMinus) btnTextMinus.addEventListener("click", () => { if (fontSizeOverlay > 0.8) fontSizeOverlay -= 0.2; if(overlaySub) overlaySub.style.fontSize = `${fontSizeOverlay}rem`; });

  // Toggle Furigana: activa/desactiva la visibilidad de los <rt> vía CSS
  const btnFurigana = document.getElementById("btn-toggle-furigana");
  if (btnFurigana) {
    btnFurigana.addEventListener("click", () => {
      // Si el diccionario no ha sido descargado aún, solicitar confirmación con modal
      if (!furiganaDictMap) {
        abrirModalFurigana();
        return;
      }

      document.body.classList.toggle("sin-furigana");
      btnFurigana.classList.toggle("active-tool");

      const isActive = !document.body.classList.contains("sin-furigana");
      if (typeof mostrarToast === "function") {
        mostrarToast(isActive ? "🌸 Furigana activado" : "Furigana desactivado");
      }
    });
  }

  // Color del furigana
  let furiganaColor = "#ff8c00";
  const furiganaColorPicker = document.getElementById("furigana-color-picker");
  if (furiganaColorPicker) {
    furiganaColorPicker.addEventListener("input", (e) => {
      furiganaColor = e.target.value;
      document.documentElement.style.setProperty("--furigana-color", furiganaColor);
    });
  }

  // Tamaño del furigana (en em, relativo al texto base)
  let furiganaSizeEm = 0.52;
  const btnFuriganaMinus = document.getElementById("btn-furigana-minus");
  const btnFuriganaPlus  = document.getElementById("btn-furigana-plus");

  function actualizarTamanioFurigana() {
    document.documentElement.style.setProperty("--furigana-size", `${furiganaSizeEm.toFixed(2)}em`);
  }

  if (btnFuriganaMinus) {
    btnFuriganaMinus.addEventListener("click", () => {
      if (furiganaSizeEm > 0.3) { furiganaSizeEm = Math.round((furiganaSizeEm - 0.06) * 100) / 100; actualizarTamanioFurigana(); }
    });
  }
  if (btnFuriganaPlus) {
    btnFuriganaPlus.addEventListener("click", () => {
      if (furiganaSizeEm < 1.0) { furiganaSizeEm = Math.round((furiganaSizeEm + 0.06) * 100) / 100; actualizarTamanioFurigana(); }
    });
  }

  if (colorPicker && overlaySub) colorPicker.addEventListener("input", (e) => overlaySub.style.color = e.target.value);
  
  if (btnToggleBg && overlaySub) {
    btnToggleBg.addEventListener("click", () => {
      overlaySub.classList.toggle("sin-fondo");
      btnToggleBg.classList.toggle("active-tool");
    });
  }
  
  if (fontSelect && overlaySub) fontSelect.addEventListener("change", (e) => overlaySub.style.fontFamily = e.target.value);
  
  if (bgColorPicker && overlaySub) {
    bgColorPicker.addEventListener("input", (e) => {
      const hex = e.target.value;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      overlaySub.style.setProperty('--bg-sub-color', `rgba(${r}, ${g}, ${b}, 0.8)`);
      overlaySub.classList.remove("sin-fondo");
      if (btnToggleBg) btnToggleBg.classList.add("active-tool");
    });
  }

  // Pantalla Completa
  function togglePantallaCompleta() {
    const contenedor = videoWrapper || video;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (contenedor.requestFullscreen) contenedor.requestFullscreen();
      else if (contenedor.webkitRequestFullscreen) contenedor.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  if (btnFullscreen) btnFullscreen.addEventListener("click", togglePantallaCompleta);
  video.addEventListener("dblclick", togglePantallaCompleta);

  // Atajos de Teclado
  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    const isEditingText = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT';

    if (isEditingText) return;

    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      togglePantallaCompleta();
    }

    if (!subtitulos || subtitulos.length === 0) return;

    const currentTime = video.currentTime;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (document.activeElement === video) video.blur();

      const nextSub = subtitulos.find(sub => (sub.inicio + timeOffset) > currentTime + 0.1);
      if (nextSub) video.currentTime = nextSub.inicio + timeOffset;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (document.activeElement === video) video.blur();

      const prevSub = subtitulos.slice().reverse().find(sub => (sub.inicio + timeOffset) < currentTime - 0.5);
      if (prevSub) {
        video.currentTime = prevSub.inicio + timeOffset;
      } else if (subtitulos.length > 0) {
        video.currentTime = subtitulos[0].inicio + timeOffset;
      }
    }
  });

  // Exportar SRT
  const btnExport = document.getElementById("btn-export-sub");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      if (subtitulos.length === 0) {
        alert("No hay subtítulos cargados para descargar.");
        return;
      }
      
      let contenidoSRT = "";
      subtitulos.forEach((s, idx) => {
        const inicio = formatSRTTime(s.inicio + timeOffset);
        const fin = formatSRTTime(s.fin + timeOffset);
        const textoLimpio = s.texto.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "");
        contenidoSRT += `${idx + 1}\n${inicio} --> ${fin}\n${textoLimpio}\n\n`;
      });

      const blob = new Blob([contenidoSRT], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subtitulos_sincronizados.srt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function formatSRTTime(sec) {
    if (sec < 0) sec = 0;
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
    return `${h}:${m}:${s},${ms}`;
  }

  // Panel Configuración Ajustes
  const btnConfig = document.getElementById('btn-toggle-config');
  const configPanel = document.getElementById('video-config-panel');

  if (btnConfig && configPanel) {
    btnConfig.addEventListener('click', (e) => {
      e.stopPropagation();
      configPanel.classList.toggle('oculto');
    });

    if (videoWrapper) {
      videoWrapper.addEventListener('click', (e) => {
        if (!configPanel.contains(e.target) && e.target !== btnConfig) {
          configPanel.classList.add('oculto');
        }
      });
    }
  }
}
