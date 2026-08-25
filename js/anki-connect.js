// ==========================================================================
// SECCIÓN 5: MÓDULO INTEGRACIÓN ANKI Y CAPTURA
// ==========================================================================
async function invokeAnki(action, version = 6, params = {}) {
  const isHttpsSite = window.location.protocol === "https:";
  const targetUrl = (ankiConfig.url || "http://127.0.0.1:8765").trim();

  // Lista de URLs candidatas a intentar (URL configurada + fallbacks locales)
  const candidateUrls = [targetUrl];
  if (targetUrl.includes("127.0.0.1") && !candidateUrls.includes(targetUrl.replace("127.0.0.1", "localhost"))) {
    candidateUrls.push(targetUrl.replace("127.0.0.1", "localhost"));
  } else if (targetUrl.includes("localhost") && !candidateUrls.includes(targetUrl.replace("localhost", "127.0.0.1"))) {
    candidateUrls.push(targetUrl.replace("localhost", "127.0.0.1"));
  }

  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, version, params }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      lastError = err;
      if (err.name === "AbortError") {
        console.warn(`AnkiConnect: Tiempo de espera agotado (3s) en ${url}`);
      } else {
        console.warn(`AnkiConnect: Error al conectar con ${url}:`, err);
      }
    }
  }

  let errorType = "OFFLINE";
  let mensajeError = "No se pudo conectar con Anki. Asegúrate de que Anki esté abierto y AnkiConnect (puerto 8765) activo.";

  if (lastError && lastError.name === "AbortError") {
    errorType = "TIMEOUT";
    mensajeError = "Tiempo de espera agotado (3s) al intentar conectar con Anki.";
  } else if (isHttpsSite) {
    errorType = "MIXED_CONTENT";
    mensajeError = "No se pudo conectar con Anki. Es posible que el navegador haya bloqueado la solicitud o estés esperando permitir el permiso.";
  }

  return {
    error: mensajeError,
    errorType: errorType,
    details: lastError ? lastError.message : undefined
  };
}

function initAnkiConfigModule() {
  const btnToggleAnki = document.getElementById("btn-toggle-anki-config");
  const panelAnki = document.getElementById("anki-config-panel");
  const btnConnectAnki = document.getElementById("btn-connect-anki");
  const settingsGroup = document.getElementById("anki-settings-group");
  const btnSaveAnki = document.getElementById("btn-save-anki");
  const btnRefreshDecks = document.getElementById("btn-refresh-decks");
  const toggleEnabled = document.getElementById("anki-enabled-toggle");
  const inputUrl = document.getElementById("anki-url-input");
  const selectModel = document.getElementById("anki-model-select");

  if (toggleEnabled) toggleEnabled.checked = ankiConfig.enabled;
  if (inputUrl) inputUrl.value = ankiConfig.url || "http://127.0.0.1:8765";
  if (selectModel && ankiConfig.model) selectModel.value = ankiConfig.model;

  // Botón de Conexión Inicial (Desencadena el cartel emergente de permiso)
  if (btnConnectAnki) {
    btnConnectAnki.addEventListener("click", async () => {
      btnConnectAnki.innerHTML = "<span>⏳ Solicitando conexión con Anki...</span>";
      await cargarMazosAnki();
    });
  }

  if (btnRefreshDecks) {
    btnRefreshDecks.addEventListener("click", cargarMazosAnki);
  }

  if (btnToggleAnki && panelAnki) {
    btnToggleAnki.addEventListener("click", (e) => {
      e.stopPropagation();
      panelAnki.classList.toggle("oculto");
    });

    document.addEventListener("click", (e) => {
      if (!panelAnki.contains(e.target) && e.target !== btnToggleAnki) {
        panelAnki.classList.add("oculto");
      }
    });
  }

  if (btnSaveAnki) {
    btnSaveAnki.addEventListener("click", () => {
      const selectDeck = document.getElementById("anki-deck-select");

      ankiConfig.enabled = toggleEnabled ? toggleEnabled.checked : true;
      ankiConfig.deck = selectDeck ? selectDeck.value : "Default";
      ankiConfig.model = selectModel ? selectModel.value : "ToriiDeck";
      ankiConfig.url = inputUrl && inputUrl.value.trim() ? inputUrl.value.trim() : "http://127.0.0.1:8765";

      localStorage.setItem("anki_enabled", ankiConfig.enabled);
      localStorage.setItem("anki_deck", ankiConfig.deck);
      localStorage.setItem("anki_model", ankiConfig.model);
      localStorage.setItem("anki_url", ankiConfig.url);

      if (panelAnki) panelAnki.classList.add("oculto");
      if (typeof mostrarToast === "function") mostrarToast("⚙️ Ajustes de Anki guardados");
    });
  }
}

async function cargarMazosAnki() {
  const selectDeck = document.getElementById("anki-deck-select");
  const statusIndicator = document.getElementById("anki-status-indicator");
  const helpInfo = document.getElementById("anki-help-info");
  const btnConnectAnki = document.getElementById("btn-connect-anki");
  const settingsGroup = document.getElementById("anki-settings-group");

  if (!selectDeck) return;

  const resDecks = await invokeAnki("deckNames");

  if (resDecks.error || !resDecks.result) {
    selectDeck.innerHTML = '<option value="Default">Default (Offline)</option>';

    if (statusIndicator) {
      statusIndicator.textContent = "● Desconectado";
      statusIndicator.className = "anki-status offline";
    }

    if (btnConnectAnki) {
      btnConnectAnki.style.display = "flex";
      btnConnectAnki.innerHTML = "<span>🔗 Reintentar Conexión a Anki</span>";
    }

    if (settingsGroup) settingsGroup.style.display = "none";

    if (helpInfo) {
      helpInfo.style.display = "block";
      if (resDecks.errorType === "MIXED_CONTENT") {
        helpInfo.innerHTML = `<strong>⚠️ Solicitud de Permiso / Conexión:</strong> Si el navegador o Anki abrió una ventana emergente pidiendo permiso, haz clic en <strong>Permitir</strong>.<br><br>💡 Si usas HTTPS, abre la app desde <strong>http://</strong> o permite contenido no seguro en los ajustes de URL.`;
      } else {
        helpInfo.innerHTML = `<strong>⚠️ Anki no responde:</strong><br>1. Asegúrate de tener Anki abierto.<br>2. Revisa que el complemento <strong>AnkiConnect</strong> (código: <code>2055492159</code>) esté instalado.`;
      }
    }
    return;
  }

  // Conexión exitosa
  if (statusIndicator) {
    statusIndicator.textContent = "● Conectado";
    statusIndicator.className = "anki-status online";
  }

  if (btnConnectAnki) {
    btnConnectAnki.style.display = "none";
  }

  if (settingsGroup) {
    settingsGroup.style.display = "block";
  }

  if (helpInfo) {
    helpInfo.style.display = "none";
    helpInfo.innerHTML = "";
  }

  // Cargar Mazos detectados de Anki
  selectDeck.innerHTML = "";
  resDecks.result.forEach((deckName) => {
    const option = document.createElement("option");
    option.value = deckName;
    option.textContent = deckName;
    selectDeck.appendChild(option);
  });
  if (ankiConfig.deck && resDecks.result.includes(ankiConfig.deck)) {
    selectDeck.value = ankiConfig.deck;
  }
}

// Captura de fotograma
function capturarFotogramaVideo() {
  const videoEl = document.getElementById("main-video");
  if (!videoEl || videoEl.readyState < 2 || !videoEl.videoWidth) {
    console.warn("El video no está listo para captura de fotograma.");
    return null;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 360;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg", 0.85);
    return dataURL.replace(/^data:image\/jpeg;base64,/, "");
  } catch (err) {
    console.warn("No se pudo capturar el fotograma (posible bloqueo CORS o lienzo sucio):", err);
    return null;
  }
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return window.btoa(binary);
}

async function capturarAudioConMediaRecorder(videoSource, startSec, durationSec) {
  return new Promise((resolve) => {
    try {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "auto";
      tempVideo.muted = false;
      tempVideo.volume = 0.0001;

      const objectUrl = (videoSource instanceof File || videoSource instanceof Blob) 
        ? URL.createObjectURL(videoSource) 
        : videoSource;
      
      tempVideo.src = objectUrl;

      const cleanup = () => {
        try {
          tempVideo.pause();
          tempVideo.removeAttribute("src");
          tempVideo.load();
          if (typeof objectUrl === "string" && objectUrl.startsWith("blob:")) {
            URL.revokeObjectURL(objectUrl);
          }
        } catch (e) {}
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, Math.max(6000, (durationSec + 4) * 1000));

      tempVideo.addEventListener("loadedmetadata", () => {
        tempVideo.currentTime = Math.max(0, startSec);
      });

      tempVideo.addEventListener("seeked", () => {
        try {
          const stream = tempVideo.captureStream ? tempVideo.captureStream() : (tempVideo.mozCaptureStream ? tempVideo.mozCaptureStream() : null);
          if (!stream || stream.getAudioTracks().length === 0) {
            clearTimeout(timeout);
            cleanup();
            resolve(null);
            return;
          }

          const audioStream = new MediaStream(stream.getAudioTracks());
          let mimeType = "";
          if (MediaRecorder.isTypeSupported("audio/webm")) mimeType = "audio/webm";
          else if (MediaRecorder.isTypeSupported("audio/ogg")) mimeType = "audio/ogg";
          else if (MediaRecorder.isTypeSupported("audio/mp4")) mimeType = "audio/mp4";

          const recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
          const chunks = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = async () => {
            clearTimeout(timeout);
            cleanup();
            if (chunks.length === 0) {
              resolve(null);
              return;
            }
            const audioBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const base64 = arrayBufferToBase64(arrayBuffer);
            const ext = (recorder.mimeType || "").includes("ogg") ? "ogg" : ((recorder.mimeType || "").includes("mp4") ? "m4a" : "webm");
            resolve({ base64, ext });
          };

          recorder.start();
          tempVideo.play().catch(() => {});

          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, Math.max(500, durationSec * 1000));

        } catch (errCapture) {
          clearTimeout(timeout);
          cleanup();
          resolve(null);
        }
      }, { once: true });

    } catch (errSetup) {
      resolve(null);
    }
  });
}

// Recorte de fragmentos de Audio (Intento 1: WebAudio API / Intento 2: MediaRecorder captureStream)
async function extraerAudioSubtitulo(file, inicioSec, finSec) {
  if (!file || typeof inicioSec !== "number" || typeof finSec !== "number" || finSec <= inicioSec) return null;
  
  const padding = 0.25;
  const startReal = Math.max(0, inicioSec - padding);
  const endReal = finSec + padding;
  const durationSec = endReal - startReal;

  // Intento 1: Decodificación directa de AudioContext
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") await audioCtx.resume();

    const audioBuffer = await new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(arrayBuffer.slice(0), resolve, err => reject(err));
    });

    if (audioBuffer) {
      const sampleRate = audioBuffer.sampleRate;
      const channels = audioBuffer.numberOfChannels;
      const startSample = Math.max(0, Math.floor(startReal * sampleRate));
      const endSample = Math.min(audioBuffer.length, Math.ceil(endReal * sampleRate));
      const frameCount = endSample - startSample;

      if (frameCount > 0) {
        const bytesPerSample = 2;
        const blockAlign = channels * bytesPerSample;
        const dataSize = frameCount * blockAlign;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        const writeString = (v, offset, str) => {
          for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i));
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        let offset = 44;
        const channelData = [];
        for (let c = 0; c < channels; c++) channelData.push(audioBuffer.getChannelData(c));

        for (let i = 0; i < frameCount; i++) {
          for (let c = 0; c < channels; c++) {
            const sample = Math.max(-1, Math.min(1, channelData[c][startSample + i] || 0));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
          }
        }
        return { base64: arrayBufferToBase64(buffer), ext: "wav" };
      }
    }
  } catch (errDecode) {
    console.warn("Intento 1 (decodeAudioData) omitido por formato de contenedor video. Ejecutando Intento 2 (MediaRecorder capture)...");
  }

  // Intento 2: Captura en segundo plano con MediaRecorder
  try {
    const resCapture = await capturarAudioConMediaRecorder(file, startReal, durationSec);
    if (resCapture && resCapture.base64) {
      return resCapture;
    }
  } catch (errCap) {
    console.warn("Fallo en Intento 2 de captura de audio:", errCap);
  }

  return null;
}

// Expuesto globalmente para exportar a AnkiConnect
async function asegurarModeloToriiTVEnAnki(userModels) {
  const yaExiste = userModels.some(m => m.toLowerCase().replace(/[\s_]/g, "") === "toriitv");
  if (yaExiste) return "ToriiTV";

  try {
    const resCreate = await invokeAnki("createModel", 6, {
      modelName: "ToriiTV",
      inOrderFields: ["Indice", "Instrucciones", "Oracion", "Furigana", "Audio", "Imagen", "Traduccion"],
      css: `.card { font-family: "Segoe UI", "Noto Sans JP", sans-serif; background-color: #0b2f3a; color: #ffffff; text-align: center; }\n.flashcard { max-width: 100%; margin: 0 auto; background: #103f4f; border-radius: 28px; padding: 35px; box-shadow: 0 10px 20px rgba(0,0,0,.35); position: relative; box-sizing: border-box; }\n.instructions { font-size: 20px; margin-bottom: 20px; padding: 12px 18px; background: rgba(255, 255, 255, 0.08); border-radius: 14px; line-height: 1.5; color: #FFDEBD; font-weight: 600; }\n.sentence-front { font-size: 42px; line-height: 1.7; font-weight: bold; color: #ffffff; margin: 20px 0; }\nimg { max-width: 75%; max-height: 420px; object-fit: contain; border-radius: 16px; margin: 20px auto; display: block; box-shadow: 0 6px 16px rgba(0,0,0,0.3); }\n.sentenceBox { position: relative; margin-top: 24px; padding: 10px 60px 18px; }\n.sentence { font-size: 38px; line-height: 1.8; text-align: center; word-break: keep-all; }\nruby rt { font-size: 20px; color: #FFDEBD; }\n.buttonsColumn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 12px; }\n.icon { width: 38px; height: 38px; border-radius: 50%; background: #146482; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; transition: transform 0.2s ease, background 0.2s ease; }\n.icon:hover { background: #ff9447; transform: scale(1.08); }\n.audio-hidden { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; overflow: hidden; }\n.translation { font-size: 24px; line-height: 1.6; color: #FFDEBD; margin-top: 16px; }\n.hidden { display: none !important; }\n.card-index-badge { position: absolute; bottom: 12px; left: 20px; font-size: 13px; opacity: 0.5; color: #93c0de; }\n@media (max-width: 750px) { .flashcard { padding: 20px; } .instructions { font-size: 16px; } .sentence-front { font-size: 26px; } .sentenceBox { padding: 5px; } .sentence { font-size: 22px; line-height: 1.7; white-space: normal; word-break: keep-all; } ruby rt { font-size: 11px; } .buttonsColumn { position: static; transform: none; flex-direction: row; justify-content: center; margin-top: 16px; } .icon { width: 36px; height: 36px; } .translation { font-size: 18px; } }`,
      cardTemplates: [
        {
          Name: "ToriiTV",
          Front: `<div class="flashcard">\n  {{#Instrucciones}}\n  <div class="instructions">\n    {{Instrucciones}}\n  </div>\n  {{/Instrucciones}}\n  <div class="front">\n    <div class="sentence-front">{{Oracion}}</div>\n  </div>\n</div>`,
          Back: `<div class="flashcard">\n  <div class="front">\n    <div class="sentence-front">{{Oracion}}</div>\n  </div>\n  <div class="back">\n    {{#Imagen}}\n    <div class="imageBox">\n      {{Imagen}}\n    </div>\n    {{/Imagen}}\n    <div class="sentenceBox">\n      <div id="sentencePlain" class="sentence">\n        {{Oracion}}\n      </div>\n      <div id="sentenceFuri" class="sentence hidden">\n        {{furigana:Furigana}}\n      </div>\n      <div class="buttonsColumn">\n        <div class="icon" onclick="toggleFuri()" title="Mostrar/Ocultar Furigana">👁</div>\n        {{#Audio}}<div class="icon" onclick="playAudio()" title="Reproducir Audio">▶</div>{{/Audio}}\n        {{#Traduccion}}<div class="icon" onclick="toggleTrad()" title="Mostrar Traducción">ES</div>{{/Traduccion}}\n      </div>\n    </div>\n    {{#Audio}}\n    <div id="audio" class="audio-hidden">\n      {{Audio}}\n    </div>\n    {{/Audio}}\n    {{#Traduccion}}\n    <div id="trad" class="translation hidden">\n      {{Traduccion}}\n    </div>\n    {{/Traduccion}}\n    {{#Indice}}\n    <div class="card-index-badge">#{{Indice}}</div>\n    {{/Indice}}\n  </div>\n</div>\n<script>\nfunction toggleFuri() { var plain = document.getElementById("sentencePlain"); var furi = document.getElementById("sentenceFuri"); if (plain && furi) { var estaOculto = furi.classList.contains("hidden"); plain.classList.toggle("hidden", estaOculto); furi.classList.toggle("hidden", !estaOculto); } }\nfunction playAudio() { var btn = document.querySelector("#audio .soundLink, #audio .replaybutton, #audio .replay-button, #audio a"); if (btn) { btn.click(); } }\nfunction toggleTrad() { var t = document.getElementById("trad"); if (t) { t.classList.toggle("hidden"); } }\n</script>`
        }
      ]
    });
    if (resCreate && !resCreate.error) {
      console.log("¡Modelo ToriiTV creado automáticamente en Anki!");
      return "ToriiTV";
    }
  } catch (err) {
    console.warn("No se pudo auto-crear el modelo ToriiTV en Anki:", err);
  }
  return null;
}

window.enviarObjetoAAnki = async function(sub) {
  if (!ankiConfig || !ankiConfig.enabled) {
    throw new Error("La función de Anki está desactivada en los ajustes.");
  }

  let selectedPreset = ankiConfig.model || "ToriiTV";
  
  // Obtener todos los modelos existentes en el Anki del usuario
  const allModelsRes = await invokeAnki("modelNames");
  if (allModelsRes.error || !allModelsRes.result || allModelsRes.result.length === 0) {
    throw new Error("No se pudieron consultar los tipos de tarjeta en Anki.");
  }

  const userModels = allModelsRes.result;
  
  // Intentar asegurar/crear automáticamente el modelo ToriiTV en Anki si no existe
  let realModelName = await asegurarModeloToriiTVEnAnki(userModels);

  if (!realModelName) {
    realModelName = userModels.find(m => 
      m.toLowerCase().replace(/[\s_]/g, "") === selectedPreset.toLowerCase().replace(/[\s_]/g, "")
    );
  }

  // Si el preestablecido no existe exactamente con ese nombre, buscar alternativos estándar
  if (!realModelName) {
    if (selectedPreset === "ToriiTV" || selectedPreset === "ToriiDeck") {
      realModelName = userModels.find(m => ["toriitv", "toriideck", "basic", "basico", "básico"].includes(m.toLowerCase()));
    } else if (selectedPreset === "Basic" || selectedPreset === "BasicImage") {
      realModelName = userModels.find(m => ["basic", "basico", "básico"].includes(m.toLowerCase()));
    } else if (selectedPreset === "Japanese") {
      realModelName = userModels.find(m => ["japanese", "japones", "japonés"].includes(m.toLowerCase()));
    }
  }

  // Si aún no se encuentra, usar el primer modelo disponible en Anki
  if (!realModelName) {
    realModelName = userModels[0];
  }

  // Obtener la lista real de campos del modelo elegido
  const modelFieldsRes = await invokeAnki("modelFieldNames", 6, { modelName: realModelName });
  if (modelFieldsRes.error || !modelFieldsRes.result) {
    throw new Error(`Error al leer los campos del modelo "${realModelName}": ${modelFieldsRes.error}`);
  }

  const camposReales = modelFieldsRes.result;
  let fieldsObj = {};

  camposReales.forEach((campo) => { fieldsObj[campo] = ""; });

  const fraseLimpia = sub.texto.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
  const timestamp = Date.now();
  const numeroIndice = (typeof minedCardsList !== "undefined" && minedCardsList ? minedCardsList.length + 1 : 1);

  const encontrarCampo = (posiblesNombres) => {
    return camposReales.find((c) =>
      posiblesNombres.some((p) =>
        c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]/g, "") ===
        p.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_]/g, "")
      )
    );
  };

  const campoIndice = encontrarCampo(["Indice", "Index", "ID", "Counter", "Numero"]);
  const campoInstrucciones = encontrarCampo(["Instrucciones", "Instructions", "Instruccion", "Indicacion"]);
  const campoOracion = encontrarCampo(["Oracion", "Sentence", "Expression", "Texto", "Japones", "Japanese", "Front", "Pregunta", "Frente"]);
  const campoFurigana = encontrarCampo(["Furigana", "Reading", "Lectura", "Back", "Respuesta", "Meaning", "Traduccion", "Reverso"]);
  const campoImagen = encontrarCampo(["Imagen", "Image", "Picture", "Snapshot", "Screenshot", "Fotograma", "Captura", "Media"]);
  const campoAudio = encontrarCampo(["Audio", "Sonido", "Sound"]);
  const campoTraduccion = encontrarCampo(["Traduccion", "Translation", "Significado", "Español", "Spanish"]);

  if (campoIndice) fieldsObj[campoIndice] = `${numeroIndice}`;
  if (campoInstrucciones) fieldsObj[campoInstrucciones] = "¿Qué significa la siguiente palabra o frase?";
  if (campoOracion) fieldsObj[campoOracion] = fraseLimpia;
  if (campoFurigana) fieldsObj[campoFurigana] = sub.texto;
  if (campoTraduccion && sub.traduccion) fieldsObj[campoTraduccion] = sub.traduccion;

  // Fallbacks si los nombres no coincidieron exactamente
  if (camposReales[0] && !fieldsObj[camposReales[0]]) {
    fieldsObj[camposReales[0]] = fraseLimpia;
  }
  // Extracción del fragmento de Audio del video en tiempo real (aplicando desfase de sincronización)
  const videoEl = document.getElementById("main-video");
  let videoSource = window.currentVideoFile;
  if (!videoSource && videoEl && videoEl.src && videoEl.src.startsWith("blob:")) {
    try {
      const resp = await fetch(videoEl.src);
      videoSource = await resp.blob();
    } catch (errBlob) {
      console.warn("No se pudo obtener el blob del video para la extracción de audio:", errBlob);
    }
  }

  const destinoAudioCampo = campoAudio || campoFurigana || campoOracion || (camposReales[1] || camposReales[0]);

  if (videoSource && destinoAudioCampo && typeof sub.inicio === "number" && typeof sub.fin === "number") {
    try {
      const currentOffset = window.toriiTimeOffset || 0;
      const audioRes = await extraerAudioSubtitulo(videoSource, sub.inicio + currentOffset, sub.fin + currentOffset);
      if (audioRes && audioRes.base64) {
        const ext = audioRes.ext || "wav";
        const audioFilename = `toriitv_audio_${timestamp}.${ext}`;
        const resAudio = await invokeAnki("storeMediaFile", 6, {
          filename: audioFilename,
          data: audioRes.base64
        });
        if (resAudio && !resAudio.error) {
          const soundTag = `[sound:${audioFilename}]`;
          if (campoAudio) {
            fieldsObj[campoAudio] = soundTag;
          } else {
            fieldsObj[destinoAudioCampo] = fieldsObj[destinoAudioCampo] ? `${fieldsObj[destinoAudioCampo]}<br>${soundTag}` : soundTag;
          }
          console.log(`🔊 Audio recortado adjuntado exitosamente en el campo "${destinoAudioCampo}": ${soundTag}`);
        } else {
          console.warn("AnkiConnect devolvió error al guardar archivo de medio audio:", resAudio ? resAudio.error : "Sin respuesta");
        }
      } else {
        console.warn("extraerAudioSubtitulo devolvió null (fallo de decodificación de audio)");
      }
    } catch (errAudio) {
      console.warn("No se pudo extraer o guardar el audio del subtítulo:", errAudio);
    }
  } else {
    console.warn("No se inició la extracción de audio:", {
      tieneVideoSource: !!videoSource,
      destinoAudioCampo: destinoAudioCampo,
      subInicio: sub.inicio,
      subFin: sub.fin
    });
  }

  const notePayload = {
    deckName: ankiConfig.deck || "Default",
    modelName: realModelName,
    fields: fieldsObj,
    tags: ["ToriiTV"],
    options: { allowDuplicate: true }
  };

  const imgBase64 = capturarFotogramaVideo();
  if (imgBase64 && campoImagen) {
    notePayload.picture = [{
      data: imgBase64,
      filename: `toriitv_${timestamp}.jpg`,
      fields: [campoImagen]
    }];
  }

  const res = await invokeAnki("addNote", 6, { note: notePayload });

  if (res.error) {
    console.error("Error devuelto por AnkiConnect:", res.error);
    throw new Error(res.error);
  }

  return res.result;
};
