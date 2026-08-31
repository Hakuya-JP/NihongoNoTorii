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
  // FURIGANA: ANÁLISIS MORFOLÓGICO KUROMOJI CON CACHÉ PERSISTENTE (INDEXEDDB)
  // ------------------------------------------------------------------
  let kuromojiTokenizer = null;
  let isDownloadingFurigana = false;

  const DB_NAME = "ToriiKuromojiCache";
  const DB_VERSION = 1;
  const STORE_NAME = "dict_files";

  function abrirDBCache() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  function guardarEnCache(nombreArchivo, buffer) {
    return new Promise((resolve) => {
      abrirDBCache().then(db => {
        if (!db) { resolve(false); return; }
        try {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.put(buffer, nombreArchivo);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (err) {
          resolve(false);
        }
      });
    });
  }

  function obtenerDeCache(nombreArchivo) {
    return new Promise((resolve) => {
      abrirDBCache().then(db => {
        if (!db) { resolve(null); return; }
        try {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(nombreArchivo);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (err) {
          resolve(null);
        }
      });
    });
  }

  function verificarSiDiccionarioEstaCacheado() {
    return new Promise((resolve) => {
      abrirDBCache().then(db => {
        if (!db) { resolve(false); return; }
        try {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.count();
          req.onsuccess = () => {
            // El diccionario de Kuromoji tiene 10 o más archivos .dat.gz
            resolve(req.result >= 10);
          };
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    });
  }

  function configurarInterceptoresKuromoji() {
    if (typeof kuromoji === "undefined" || !kuromoji.DictionaryLoader) return;
    if (kuromoji.DictionaryLoader.prototype._cacheConfigurado) return;

    const originalLoad = kuromoji.DictionaryLoader.prototype.loadArrayBuffer;
    kuromoji.DictionaryLoader.prototype.loadArrayBuffer = function(url, callback) {
      const filename = url.split("/").pop().split("?")[0];

      obtenerDeCache(filename).then(cachedBuffer => {
        if (cachedBuffer) {
          callback(null, cachedBuffer);
        } else {
          originalLoad.call(this, url, (err, buffer) => {
            if (!err && buffer) {
              guardarEnCache(filename, buffer);
            }
            callback(err, buffer);
          });
        }
      });
    };

    kuromoji.DictionaryLoader.prototype._cacheConfigurado = true;
  }

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

  async function iniciarDescargaFurigana(desdeCache = false) {
    if (isDownloadingFurigana || kuromojiTokenizer) return;
    isDownloadingFurigana = true;
    cerrarModalFurigana();

    actualizarProgresoFurigana(
      20,
      desdeCache ? "⚡ Recuperando diccionario local..." : "📥 Descargando diccionario...",
      desdeCache ? "Cargando desde almacenamiento persistente (IndexedDB)..." : "Descargando archivos y guardando en tu navegador..."
    );

    // 1. Asegurar script Kuromoji disponible
    if (typeof kuromoji === "undefined") {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("No se pudo cargar el script de Kuromoji"));
          document.head.appendChild(script);
        });
      } catch (err) {
        console.error("Error al cargar Kuromoji script:", err);
        actualizarProgresoFurigana(100, "⚠️ Error de red", "No se pudo cargar el script base.");
        isDownloadingFurigana = false;
        ocultarProgresoFurigana(3500);
        if (typeof mostrarToast === "function") mostrarToast("⚠️ Error al cargar librería Kuromoji");
        return;
      }
    }

    configurarInterceptoresKuromoji();

    const basePath = window.TORII_BASE_PATH || "";
    const dictPath = `${basePath}dict/`;

    // Animación de avance suave mientras se construyen las tablas
    let progresoActual = 40;
    const progressInterval = setInterval(() => {
      if (progresoActual < 90) {
        progresoActual += Math.floor(Math.random() * 12) + 6;
        actualizarProgresoFurigana(
          progresoActual,
          desdeCache ? "⚡ Indexando desde almacenamiento local..." : "Indexando diccionario Kuromoji...",
          `Construyendo árbol morfológico (${Math.round(progresoActual)}%)...`
        );
      }
    }, desdeCache ? 150 : 280);

    try {
      kuromoji
        .builder({ dicPath: dictPath })
        .build((err, tokenizer) => {
          clearInterval(progressInterval);
          isDownloadingFurigana = false;

          if (err || !tokenizer) {
            console.error("Error al construir Kuromoji desde dict/:", err);
            actualizarProgresoFurigana(100, "⚠️ Error al cargar dict/", (err && err.message) || "No se encontraron los archivos en dict/");
            ocultarProgresoFurigana(4000);
            if (typeof mostrarToast === "function") mostrarToast("⚠️ Error al inicializar diccionario");
            return;
          }

          kuromojiTokenizer = tokenizer;
          actualizarProgresoFurigana(
            100,
            "✅ ¡Kuromoji listo!",
            desdeCache ? "Recuperado instantáneamente desde almacenamiento persistente." : "Guardado en almacenamiento para próximas sesiones."
          );
          ocultarProgresoFurigana(2200);

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
          if (typeof mostrarToast === "function") {
            mostrarToast(desdeCache ? "⚡ Furigana cargado desde memoria local" : "🌸 ¡Furigana descargado y guardado permanentemente!");
          }
        });
    } catch (e) {
      clearInterval(progressInterval);
      isDownloadingFurigana = false;
      console.error("Excepción al inicializar Kuromoji:", e);
      actualizarProgresoFurigana(100, "⚠️ Error de inicialización", e.message || "Error desconocido");
      ocultarProgresoFurigana(3500);
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

  /** Convierte katakana a hiragana (Kuromoji devuelve lecturas en katakana) */
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
   * Dado un token de Kuromoji, devuelve HTML con <ruby> SOLO sobre la parte kanji.
   * Para tokens mixtos (kanji + okurigana, ej: 住んで → すんで) recorta el sufijo
   * kana compartido entre surface_form y reading, y solo wrappea la parte kanji.
   */
  function tokenToRuby(surface, reading) {
    if (!reading || reading === "*") return surface;

    const hReading = katakanaToHiragana(reading);
    const chars = [...surface];

    // Sin kanji → texto plano
    if (!chars.some(esKanji)) return surface;

    // Todo kanji → wrap completo
    if (chars.every(esKanji)) {
      return `<ruby>${surface}<rt>${hReading}</rt></ruby>`;
    }

    // Mixto: recortar okurigana sufijo coincidente
    const readingChars = [...hReading];
    let sufijo = 0;
    while (
      sufijo < chars.length &&
      sufijo < readingChars.length &&
      !esKanji(chars[chars.length - 1 - sufijo]) &&
      chars[chars.length - 1 - sufijo] === readingChars[readingChars.length - 1 - sufijo]
    ) {
      sufijo++;
    }

    const parteKanji  = chars.slice(0, chars.length - sufijo).join("");
    const parteOkuri  = chars.slice(chars.length - sufijo).join("");
    const lecturaKanji = readingChars.slice(0, readingChars.length - sufijo).join("");

    if (!parteKanji || ![...parteKanji].some(esKanji)) return surface;

    return `<ruby>${parteKanji}<rt>${lecturaKanji}</rt></ruby>${parteOkuri}`;
  }

  /**
   * Procesa el texto de un subtítulo y devuelve HTML con <ruby> sobre cada kanji.
   * Preserva los saltos de línea (<br>) y el resto del HTML intacto.
   */
  function agregarFurigana(texto) {
    if (!kuromojiTokenizer || !texto) return texto;

    // Si ya contiene etiquetas <ruby>, respetarlas
    if (texto.includes("<ruby") || texto.includes("<rt>")) {
      return texto;
    }

    const partes = texto.split(/(<[^>]+>)/g);

    const resultado = partes.map(parte => {
      if (parte.startsWith("<") && parte.endsWith(">")) {
        return parte;
      }
      if (!parte.trim()) return parte;

      const tokens = kuromojiTokenizer.tokenize(parte);
      return tokens.map(t => tokenToRuby(t.surface_form, t.reading)).join("");
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
    btnFurigana.addEventListener("click", async () => {
      // 1. Si el tokenizer ya está listo en memoria, alternar visibilidad
      if (kuromojiTokenizer) {
        document.body.classList.toggle("sin-furigana");
        btnFurigana.classList.toggle("active-tool");

        const isActive = !document.body.classList.contains("sin-furigana");
        if (typeof mostrarToast === "function") {
          mostrarToast(isActive ? "🌸 Furigana activado" : "Furigana desactivado");
        }
        return;
      }

      // 2. Si no está en memoria, revisar si ya se guardó previamente en IndexedDB
      const estaEnCache = await verificarSiDiccionarioEstaCacheado();
      if (estaEnCache) {
        // Ya está guardado en el navegador: cargar de inmediato sin mostrar modal
        iniciarDescargaFurigana(true);
      } else {
        // Primera vez absoluta: solicitar confirmación de descarga inicial
        abrirModalFurigana();
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
