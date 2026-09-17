// ==========================================================================
// NIHONGO NO TORII - MOTOR DE LECTURA MOKURO (MOKURO WEB READER)
// ==========================================================================

(function() {
  'use strict';

  // Estado del lector Mokuro
  let mokuroState = {
    manga: null,             // Objeto con title, volume, pages
    currentPageIdx: 0,       // Índice de página actual (0-indexed)
    isR2L: true,             // Lectura tradicional de derecha a izquierda
    isDoublePage: false,     // Modo doble página (spread)
    hasCover: true,          // La primera página es portada individual
    showOcr: true,           // Capa de texto OCR activa
    showBorders: false,      // Mostrar bordes en cajas de texto
    alwaysVisibleOcr: false, // Texto OCR siempre visible
    editableText: false,     // Texto editable para corregir OCR
    fontSize: 'auto',        // 'auto' o tamaño en px
    eInkMode: false,         // Modo tinta electrónica
    imageUrls: new Map(),    // Mapa: filename -> Object URL o ruta relativa
    activeTextBoxText: '',   // Texto de la caja seleccionada actualmente
    zoomMode: 'fit-screen',  // Modo de zoom activo: 'fit-screen' | 'fit-width' | 'original'
    seriesVolumes: [],       // Lista ordenada de tomos de la serie activa (para pasar al siguiente)
    currentVolumeIndex: -1   // Índice del tomo actual dentro de seriesVolumes
  };

  let pzInstance = null;        // Instancia de panzoom
  let stageWheelHandler = null; // Referencia al listener de scroll del stage (para limpieza)

  // Cargar preferencias guardadas
  function loadSavedPreferences() {
    const saved = localStorage.getItem('torii_mokuro_prefs');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.isR2L !== undefined) mokuroState.isR2L = p.isR2L;
        if (p.isDoublePage !== undefined) mokuroState.isDoublePage = p.isDoublePage;
        if (p.hasCover !== undefined) mokuroState.hasCover = p.hasCover;
        if (p.showBorders !== undefined) mokuroState.showBorders = p.showBorders;
        if (p.alwaysVisibleOcr !== undefined) mokuroState.alwaysVisibleOcr = p.alwaysVisibleOcr;
        if (p.fontSize !== undefined) mokuroState.fontSize = p.fontSize;
      } catch (e) {
        console.warn('Error al cargar preferencias de Mokuro:', e);
      }
    }
  }

  function savePreferences() {
    localStorage.setItem('torii_mokuro_prefs', JSON.stringify({
      isR2L: mokuroState.isR2L,
      isDoublePage: mokuroState.isDoublePage,
      hasCover: mokuroState.hasCover,
      showBorders: mokuroState.showBorders,
      alwaysVisibleOcr: mokuroState.alwaysVisibleOcr,
      fontSize: mokuroState.fontSize
    }));
  }

  // Sincronizar checkboxes del menú con el estado
  function syncUIWithState() {
    const checkR2l = document.getElementById('chk-r2l');
    const checkDouble = document.getElementById('chk-double-page');
    const checkCover = document.getElementById('chk-has-cover');
    const checkOcr = document.getElementById('chk-enable-ocr');
    const checkBorders = document.getElementById('chk-show-borders');
    const checkAlwaysOcr = document.getElementById('chk-always-ocr');
    const checkEditable = document.getElementById('chk-editable-text');
    const selectFontSize = document.getElementById('select-font-size');
    const checkEInk = document.getElementById('chk-eink-mode');

    if (checkR2l) checkR2l.checked = mokuroState.isR2L;
    if (checkDouble) checkDouble.checked = mokuroState.isDoublePage;
    if (checkCover) checkCover.checked = mokuroState.hasCover;
    if (checkOcr) checkOcr.checked = mokuroState.showOcr;
    if (checkBorders) checkBorders.checked = mokuroState.showBorders;
    if (checkAlwaysOcr) checkAlwaysOcr.checked = mokuroState.alwaysVisibleOcr;
    if (checkEditable) checkEditable.checked = mokuroState.editableText;
    if (selectFontSize) selectFontSize.value = mokuroState.fontSize;
    if (checkEInk) checkEInk.checked = mokuroState.eInkMode;

    updateContainerClasses();
  }

  function updateContainerClasses() {
    const container = document.getElementById('mokuro-pages-container');
    const wrapper = document.getElementById('mokuro-reader-wrapper');
    if (!container || !wrapper) return;

    if (mokuroState.isR2L) {
      container.classList.add('r2l-view');
    } else {
      container.classList.remove('r2l-view');
    }

    if (mokuroState.showBorders) {
      container.classList.add('show-ocr-borders');
    } else {
      container.classList.remove('show-ocr-borders');
    }

    if (mokuroState.alwaysVisibleOcr) {
      container.classList.add('ocr-always-visible');
    } else {
      container.classList.remove('ocr-always-visible');
    }

    if (!mokuroState.showOcr) {
      container.classList.add('ocr-disabled');
    } else {
      container.classList.remove('ocr-disabled');
    }

    if (mokuroState.eInkMode) {
      wrapper.classList.add('e-ink-mode');
    } else {
      wrapper.classList.remove('e-ink-mode');
    }
  }

  // ========================================================================
  // INICIALIZACIÓN DEL LECTOR Y PANZOOM
  // ========================================================================
  function initPanzoom() {
    const pc = document.getElementById('mokuro-pages-container');
    const stage = document.getElementById('mokuro-stage');
    if (!pc || typeof panzoom !== 'function') return;

    // Limpiar instancia anterior
    if (pzInstance) {
      pzInstance.dispose();
      pzInstance = null;
    }

    // Eliminar listener de scroll anterior
    if (stageWheelHandler && stage) {
      stage.removeEventListener('wheel', stageWheelHandler);
      stageWheelHandler = null;
    }

    pzInstance = panzoom(pc, {
      bounds: false,
      maxZoom: 6,
      minZoom: 0.05,          // Se actualiza dinámicamente en zoomFitToScreen
      zoomDoubleClickSpeed: 1, // Desactivar zoom con doble clic
      enableTextSelection: false, // Evita que la selección de texto interfiera y congele el arrastre
      smoothScroll: false,     // Detener arrastre inmediatamente sin deslizamiento inercial fuera de bordes
      beforeMouseDown: function(e) {
        // Bloquear arrastre con clic derecho o central (el derecho abre el popup Torii)
        if (e.button !== 0) {
          return true;
        }
        // Bloquear arrastre en barras de herramientas, popups y controles
        if (e.target.closest('.mokuro-toolbar') || e.target.closest('.torii-quick-popup') || e.target.closest('.reader-bottom-scrubber')) {
          return true;
        }
        // Permitir arrastre fluido con clic izquierdo cuando hay zoom activo
        if (pzInstance) {
          const currentScale = pzInstance.getTransform().scale;
          const minZ = pzInstance.getMinZoom ? pzInstance.getMinZoom() : 0.05;
          if (currentScale > minZ + 0.005) {
            return false; // Habilitar drag suave sin trabarse
          }
        }
        // Sin zoom: la página permanece fija en pantalla
        return true;
      },
      beforeWheel: function(e) {
        // Ctrl+scroll → zoom manejado por panzoom
        // Scroll normal → manejado por handleStageScroll (bloqueamos panzoom aquí)
        return !e.ctrlKey;
      }
    });

    // Prevenir el arrastre nativo de imágenes/elementos de HTML5 que deja el cursor pegado
    if (stage) {
      stage.ondragstart = (e) => e.preventDefault();
    }

    // Limitar arrastre a los bordes del manga
    pzInstance.on('pan', clampPan);

    // Auto-centrado al alejar, actualización de clase de cursor y confinamiento a bordes en zoom
    let _autocentering = false;
    pzInstance.on('zoom', function() {
      clampPan();
      if (_autocentering) return;
      const t = pzInstance.getTransform();
      const minZ = pzInstance.getMinZoom ? pzInstance.getMinZoom() : 0.05;

      if (stage) {
        stage.classList.toggle('is-zoomed', t.scale > minZ + 0.005);
      }

      if (t.scale <= minZ + 0.002) {
        _autocentering = true;
        applyCurrentZoomMode();
        requestAnimationFrame(() => { _autocentering = false; });
      }
    });

    // Listener de scroll del stage: scroll normal = desplazarse, Ctrl+scroll = zoom (panzoom)
    stageWheelHandler = handleStageScroll;
    if (stage) {
      stage.addEventListener('wheel', stageWheelHandler, { passive: false });
    }
  }

  // ========================================================================
  // LIMITAR DESPLAZAMIENTO (PAN CLAMPING) A LOS BORDES DE LA PÁGINA DEL MANGA
  // ========================================================================
  function clampPan() {
    if (!pzInstance) return;
    const stage = document.getElementById('mokuro-stage');
    const pc = document.getElementById('mokuro-pages-container');
    if (!stage || !pc) return;

    const transform = pzInstance.getTransform();
    const scale = transform.scale;
    if (!scale) return;

    const visiblePages = pc.querySelectorAll('.mokuro-page.visible-page');
    if (visiblePages.length === 0) return;

    let totalW = 0, maxH = 0;
    visiblePages.forEach(p => {
      totalW += p.offsetWidth || parseInt(p.style.width, 10) || 800;
      maxH = Math.max(maxH, p.offsetHeight || parseInt(p.style.height, 10) || 1200);
    });
    if (totalW === 0 || maxH === 0) return;

    const scaledW = totalW * scale;
    const scaledH = maxH * scale;
    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;

    // Confinar horizontal: si cabe en pantalla se centra; si es más ancha no permite arrastrar fuera de los bordes
    if (scaledW <= stageW) {
      transform.x = (stageW - scaledW) / 2;
    } else {
      transform.x = Math.max(stageW - scaledW, Math.min(0, transform.x));
    }

    // Confinar vertical: si cabe en pantalla se centra; si es más alta no permite arrastrar fuera de los bordes
    if (scaledH <= stageH) {
      transform.y = (stageH - scaledH) / 2;
    } else {
      transform.y = Math.max(stageH - scaledH, Math.min(0, transform.y));
    }
  }

  // ========================================================================
  // SCROLL MANUAL DEL STAGE (RUEDA SIN CTRL = DESPLAZARSE POR LA PÁGINA)
  // ========================================================================
  function handleStageScroll(e) {
    // Ctrl+scroll lo maneja panzoom (zoom) — solo prevenimos el scroll de página
    if (e.ctrlKey) {
      e.preventDefault();
      return;
    }
    if (!pzInstance) return;
    e.preventDefault();

    const stage = document.getElementById('mokuro-stage');
    const pc = document.getElementById('mokuro-pages-container');
    if (!stage || !pc) return;

    const scrollSpeed = 1.2;
    const deltaX = -(e.deltaX || 0) * scrollSpeed;
    const deltaY = -(e.deltaY || 0) * scrollSpeed;

    const transform = pzInstance.getTransform();
    const scale = transform.scale;

    // Calcular dimensiones del contenido escalado
    const visiblePages = pc.querySelectorAll('.mokuro-page.visible-page');
    let totalW = 0, maxH = 0;
    visiblePages.forEach(p => {
      totalW += p.offsetWidth || parseInt(p.style.width, 10) || 800;
      maxH = Math.max(maxH, p.offsetHeight || parseInt(p.style.height, 10) || 1200);
    });

    const scaledW = totalW * scale;
    const scaledH = maxH * scale;
    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight;

    let newX = transform.x + deltaX;
    let newY = transform.y + deltaY;

    // Clamp horizontal: centrar si cabe, limitar si es más ancho que el stage
    if (scaledW <= stageW) {
      newX = (stageW - scaledW) / 2;
    } else {
      newX = Math.max(stageW - scaledW, Math.min(0, newX));
    }

    // Clamp vertical: centrar si cabe, limitar si es más alto que el stage
    if (scaledH <= stageH) {
      newY = (stageH - scaledH) / 2;
    } else {
      newY = Math.max(stageH - scaledH, Math.min(0, newY));
    }

    pzInstance.moveTo(newX, newY);
  }



  let currentMangaKey = null;

  // Resolver URL de imagen en el mapa de imágenes locales
  function getImageUrl(imgPath) {
    if (!imgPath) return '';
    if (imgPath.startsWith('blob:') || imgPath.startsWith('data:') || imgPath.startsWith('http')) {
      return imgPath;
    }

    const clean = decodeURIComponent(imgPath).replace(/\\/g, '/');
    const base = clean.split('/').pop().trim();
    const baseLower = base.toLowerCase();

    // 1. Búsqueda directa
    if (mokuroState.imageUrls.has(base)) return mokuroState.imageUrls.get(base);
    if (mokuroState.imageUrls.has(clean)) return mokuroState.imageUrls.get(clean);
    if (mokuroState.imageUrls.has(imgPath)) return mokuroState.imageUrls.get(imgPath);
    if (mokuroState.imageUrls.has(baseLower)) return mokuroState.imageUrls.get(baseLower);

    // 2. Búsqueda sin distinguir mayúsculas ni carpetas
    for (const [k, url] of mokuroState.imageUrls.entries()) {
      const kBase = k.replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
      if (kBase === baseLower) return url;
    }

    // 3. Fallback a la ruta tal cual
    return clean;
  }

  // Aplica el modo de zoom actualmente guardado (se llama al cambiar de página)
  function applyCurrentZoomMode() {
    switch (mokuroState.zoomMode) {
      case 'fit-width': _applyFitToWidth(); break;
      case 'original':  _applyOriginal();   break;
      default:          _applyFitToScreen(); break;
    }
  }

  // ── Funciones públicas (guardan el modo) ──────────────────────────────────
  function zoomFitToScreen() {
    mokuroState.zoomMode = 'fit-screen';
    _applyFitToScreen();
  }

  function zoomFitToWidth() {
    mokuroState.zoomMode = 'fit-width';
    _applyFitToWidth();
  }

  function zoomOriginal() {
    mokuroState.zoomMode = 'original';
    _applyOriginal();
  }

  // ── Implementaciones internas ─────────────────────────────────────────────
  function _applyFitToScreen() {
    const stage = document.getElementById('mokuro-stage');
    const pc = document.getElementById('mokuro-pages-container');
    if (!stage || !pc || !pzInstance) return;

    const visiblePages = pc.querySelectorAll('.mokuro-page.visible-page');
    if (visiblePages.length === 0) return;

    let totalW = 0;
    let maxH = 0;
    visiblePages.forEach(p => {
      const w = p.offsetWidth || parseInt(p.style.width, 10) || 800;
      const h = p.offsetHeight || parseInt(p.style.height, 10) || 1200;
      totalW += w;
      maxH = Math.max(maxH, h);
    });

    if (totalW === 0 || maxH === 0) return;

    const padding = 20;
    const stageW = Math.max(100, stage.clientWidth - padding);
    const stageH = Math.max(100, stage.clientHeight - padding);
    const scale = Math.min(stageW / totalW, stageH / maxH);

    // Limitar el minZoom dinámicamente: nunca más pequeño que el zoom de ajuste a pantalla
    if (pzInstance.setMinZoom) {
      pzInstance.setMinZoom(scale);
    }

    const scaledW = totalW * scale;
    const scaledH = maxH * scale;
    // Centrar horizontal y verticalmente dentro del stage
    const x = Math.max(0, (stage.clientWidth - scaledW) / 2);
    const y = Math.max(0, (stage.clientHeight - scaledH) / 2);

    pzInstance.zoomAbs(0, 0, scale);
    pzInstance.moveTo(x, y);
    stage.classList.remove('is-zoomed');
  }

  function _applyFitToWidth() {
    const stage = document.getElementById('mokuro-stage');
    const pc = document.getElementById('mokuro-pages-container');
    if (!stage || !pc || !pzInstance) return;

    const visiblePages = pc.querySelectorAll('.mokuro-page.visible-page');
    if (visiblePages.length === 0) return;

    let totalW = 0;
    let maxH = 0;
    visiblePages.forEach(p => {
      const w = p.offsetWidth || parseInt(p.style.width, 10) || 800;
      const h = p.offsetHeight || parseInt(p.style.height, 10) || 1200;
      totalW += w;
      maxH = Math.max(maxH, h);
    });
    if (totalW === 0) return;

    const stageW = Math.max(100, stage.clientWidth - 20);
    const scale = stageW / totalW;
    const scaledW = totalW * scale;
    const scaledH = maxH * scale;
    const x = Math.max(0, (stage.clientWidth - scaledW) / 2);
    // Centrar verticalmente si cabe; si no, iniciar desde arriba
    const y = scaledH < stage.clientHeight
      ? Math.max(0, (stage.clientHeight - scaledH) / 2)
      : 0;

    pzInstance.zoomAbs(0, 0, scale);
    pzInstance.moveTo(x, y);
    stage.classList.add('is-zoomed');
  }

  function _applyOriginal() {
    const stage = document.getElementById('mokuro-stage');
    const pc = document.getElementById('mokuro-pages-container');
    if (!stage || !pc || !pzInstance) return;

    const visiblePages = pc.querySelectorAll('.mokuro-page.visible-page');
    let totalW = 0;
    let maxH = 0;
    visiblePages.forEach(p => {
      totalW += p.offsetWidth || parseInt(p.style.width, 10) || 800;
      maxH = Math.max(maxH, p.offsetHeight || parseInt(p.style.height, 10) || 1200);
    });

    // Centrar horizontal y verticalmente a escala 1:1
    const x = Math.max(0, (stage.clientWidth - totalW) / 2);
    const y = Math.max(0, (stage.clientHeight - maxH) / 2);

    pzInstance.zoomAbs(0, 0, 1);
    pzInstance.moveTo(x, y);
    stage.classList.add('is-zoomed');
  }

  function toggleFullScreen() {
    const wrapper = document.getElementById('mokuro-reader-wrapper');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen().catch(err => console.warn(err));
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  // ========================================================================
  // RENDERIZADO DE PÁGINAS Y SUPERPOSICIÓN OCR
  // ========================================================================
  function renderCurrentPages() {
    const container = document.getElementById('mokuro-pages-container');
    const pageInput = document.getElementById('page-current-input');
    const pageTotal = document.getElementById('page-total-display');
    const titleLabel = document.getElementById('reader-manga-title');

    if (!container || !mokuroState.manga) return;

    // Si cambió el manga, limpiar todas las páginas anteriores del DOM
    const mangaKey = (mokuroState.manga.id || mokuroState.manga.title || '') + '_' + (mokuroState.manga.volume || '');
    if (mangaKey !== currentMangaKey) {
      container.innerHTML = '';
      currentMangaKey = mangaKey;
    }

    const pages = mokuroState.manga.pages || [];
    const total = pages.length;

    if (total === 0) return;

    // Asegurar índice dentro de los límites
    if (mokuroState.currentPageIdx < 0) mokuroState.currentPageIdx = 0;
    if (mokuroState.currentPageIdx >= total) mokuroState.currentPageIdx = total - 1;

    // Título y contadores
    if (titleLabel) {
      titleLabel.textContent = `${mokuroState.manga.title || 'Manga'} - ${mokuroState.manga.volume || 'Volumen'}`;
    }
    if (pageInput) pageInput.value = mokuroState.currentPageIdx + 1;
    if (pageTotal) pageTotal.textContent = `/ ${total}`;

    // Sincronizar barra flotante inferior de avance rápido (scrubber)
    const pageSlider = document.getElementById('reader-page-slider');
    const scrubberInfo = document.getElementById('scrubber-page-info');
    const sliderTooltip = document.getElementById('slider-tooltip');

    if (pageSlider) {
      pageSlider.min = 1;
      pageSlider.max = total;
      pageSlider.value = mokuroState.currentPageIdx + 1;
    }
    if (scrubberInfo) {
      scrubberInfo.textContent = `${mokuroState.currentPageIdx + 1} / ${total}`;
    }
    if (sliderTooltip) {
      sliderTooltip.textContent = `Pág. ${mokuroState.currentPageIdx + 1}`;
      if (pageSlider) {
        // En modo RTL el thumb está invertido: página 1 = derecha (100%), última = izquierda (0%)
        const pct = 100 - ((mokuroState.currentPageIdx) / Math.max(1, total - 1)) * 100;
        sliderTooltip.style.left = `${pct}%`;
      }
    }

    // Determinar qué páginas mostrar (individual o doble)
    let visibleIndices = [];
    if (!mokuroState.isDoublePage) {
      visibleIndices = [mokuroState.currentPageIdx];
    } else {
      // Modo doble página
      if (mokuroState.hasCover && mokuroState.currentPageIdx === 0) {
        visibleIndices = [0];
      } else {
        let first = mokuroState.currentPageIdx;
        if (mokuroState.hasCover && first % 2 === 0) {
          first = first - 1;
        } else if (!mokuroState.hasCover && first % 2 !== 0) {
          first = first - 1;
        }
        visibleIndices = [first];
        if (first + 1 < total) {
          visibleIndices.push(first + 1);
        }
      }
    }

    // Ocultar todas las páginas existentes y mostrar solo las visibles
    const existingDomPages = container.querySelectorAll('.mokuro-page');
    existingDomPages.forEach(p => p.classList.remove('visible-page'));

    visibleIndices.forEach(idx => {
      let pageEl = document.getElementById(`mokuro-page-${idx}`);
      if (!pageEl) {
        pageEl = buildPageElement(pages[idx], idx);
        container.appendChild(pageEl);
      }
      pageEl.classList.add('visible-page');
    });

    // Guardar última página leída
    try {
      const key = `torii_read_progress_${mokuroState.manga.title || 'untitled'}`;
      localStorage.setItem(key, mokuroState.currentPageIdx);
      if (mokuroState.manga.id && window.ToriiMangaDB) {
        window.ToriiMangaDB.updateProgress(mokuroState.manga.id, mokuroState.currentPageIdx);

        // Refrescar la cuadrícula de la biblioteca de forma diferida para que
        // la portada frontal refleje el tomo que se está leyendo actualmente.
        // Usamos debounce para no llamarla en cada cambio de página consecutivo.
        clearTimeout(window._mokuroGridRefreshTimer);
        window._mokuroGridRefreshTimer = setTimeout(() => {
          if (typeof window.ToriiMangaDB.renderGrid === 'function') {
            window.ToriiMangaDB.renderGrid();
          }
        }, 1500);
      }
    } catch(e) {}

    // Aplicar el modo de zoom guardado (respeta fit-width, original, etc.)
    setTimeout(applyCurrentZoomMode, 30);
  }

  // Construir nodo DOM para una página
  function buildPageElement(pageData, pageIdx) {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'mokuro-page';
    pageDiv.id = `mokuro-page-${pageIdx}`;

    const initialW = pageData.img_width || 800;
    const initialH = pageData.img_height || 1200;
    pageDiv.style.width = `${initialW}px`;
    pageDiv.style.height = `${initialH}px`;

    const imgSrc = getImageUrl(pageData.img_path);

    const img = document.createElement('img');
    img.className = 'page-img';
    img.alt = `Página ${pageIdx + 1}`;
    img.src = imgSrc || '';

    // Si la imagen carga, actualizar dimensiones reales y reajustar pantalla
    img.onload = function() {
      if (img.naturalWidth && img.naturalHeight) {
        if (!pageData.img_width || pageData.img_width === 800) {
          pageData.img_width = img.naturalWidth;
          pageData.img_height = img.naturalHeight;
        }
        pageDiv.style.width = `${pageData.img_width}px`;
        pageDiv.style.height = `${pageData.img_height}px`;
      }
      applyCurrentZoomMode(); // Respetar el modo de zoom activo al cargar la imagen
    };

    img.onerror = function() {
      console.warn(`No se pudo cargar la imagen para la página ${pageIdx + 1}: ${imgSrc}`);
      pageDiv.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #e53935; background: #fff; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">⚠️</div>
          <h4 style="margin: 0 0 8px; color: #d32f2f;">Error al cargar la imagen</h4>
          <p style="color: #666; font-size: 0.85rem; margin: 0 0 5px; word-break: break-all;">${escapeHtml(pageData.img_path || '')}</p>
        </div>
      `;
    };

    pageDiv.appendChild(img);

    // Capa OCR
    const ocrLayer = document.createElement('div');
    ocrLayer.className = 'mokuro-ocr-layer';

    const blocks = pageData.blocks || [];
    blocks.forEach((block, bIdx) => {
      const boxDiv = document.createElement('div');
      boxDiv.className = 'textBox';
      if (mokuroState.editableText) boxDiv.contentEditable = 'true';

      const [xmin, ymin, xmax, ymax] = block.box;
      const w = xmax - xmin;
      const h = ymax - ymin;

      boxDiv.style.left = `${xmin}px`;
      boxDiv.style.top = `${ymin}px`;
      boxDiv.style.width = `${w}px`;
      boxDiv.style.height = `${h}px`;
      boxDiv.style.zIndex = 10 + bIdx;

      let fSize = block.font_size || 18;
      fSize = Math.max(12, Math.min(fSize, 36));
      if (mokuroState.fontSize !== 'auto') {
        fSize = parseInt(mokuroState.fontSize, 10);
      }
      boxDiv.style.fontSize = `${fSize}px`;

      if (block.vertical) {
        boxDiv.style.writingMode = 'vertical-rl';
      }

      // Líneas de texto
      const lines = block.lines || [];
      lines.forEach(lineText => {
        const p = document.createElement('p');
        p.textContent = lineText;
        boxDiv.appendChild(p);
      });

      // Evento de clic derecho: Abrir menú Torii de minado rápido
      boxDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fullText = lines.join(' ');
        openToriiMiningPopup(fullText, e.clientX, e.clientY);
      });

      ocrLayer.appendChild(boxDiv);
    });

    pageDiv.appendChild(ocrLayer);
    return pageDiv;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // ========================================================================
  // NAVEGACIÓN ENTRE PÁGINAS
  // ========================================================================
  function nextPage() {
    if (!mokuroState.manga) return;
    const step = mokuroState.isDoublePage ? 2 : 1;
    const total = mokuroState.manga.pages.length;
    const atLastPage = mokuroState.currentPageIdx + step >= total;

    if (!atLastPage) {
      mokuroState.currentPageIdx += step;
      renderCurrentPages();
    } else {
      // Llegamos al final: aseguramos estar en la última página
      mokuroState.currentPageIdx = total - 1;
      renderCurrentPages();
      // Si hay un tomo siguiente en la serie, mostrar el overlay de continuación
      if (mokuroState.seriesVolumes.length > 0 &&
          mokuroState.currentVolumeIndex >= 0 &&
          mokuroState.currentVolumeIndex < mokuroState.seriesVolumes.length - 1) {
        showNextVolumeOverlay();
      }
    }
  }

  function prevPage() {
    if (!mokuroState.manga) return;
    const step = mokuroState.isDoublePage ? 2 : 1;
    if (mokuroState.currentPageIdx - step >= 0) {
      mokuroState.currentPageIdx -= step;
    } else {
      mokuroState.currentPageIdx = 0;
    }
    renderCurrentPages();
  }

  function firstPage() {
    mokuroState.currentPageIdx = 0;
    renderCurrentPages();
  }

  function lastPage() {
    if (!mokuroState.manga) return;
    mokuroState.currentPageIdx = mokuroState.manga.pages.length - 1;
    renderCurrentPages();
  }

  // ========================================================================
  // FIN DE TOMO: OVERLAY PARA CONTINUAR CON EL SIGUIENTE VOLUMEN
  // ========================================================================
  function showNextVolumeOverlay() {
    const nextIdx = mokuroState.currentVolumeIndex + 1;
    const nextVol = mokuroState.seriesVolumes[nextIdx];
    if (!nextVol) return;

    // Eliminar overlay anterior si existe
    const old = document.getElementById('next-volume-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'next-volume-overlay';
    overlay.className = 'next-volume-overlay';
    overlay.innerHTML = `
      <div class="next-vol-card">
        <div class="next-vol-cover-wrap">
          <img src="${nextVol.coverDataUrl || 'image/logonnt.png'}" alt="Portada siguiente tomo" class="next-vol-cover">
        </div>
        <div class="next-vol-info">
          <span class="next-vol-badge">✅ Tomo terminado</span>
          <h3 class="next-vol-title">${nextVol.title || ''}</h3>
          <p class="next-vol-subtitle">${nextVol.volume || 'Siguiente tomo'}</p>
          <button id="btn-continue-next-vol" class="btn-continue-next-vol">
            <span>▶</span> Continuar al siguiente tomo
          </button>
          <button id="btn-dismiss-next-vol" class="btn-dismiss-next-vol">
            Quedarme aquí
          </button>
        </div>
      </div>
    `;

    const wrapper = document.getElementById('mokuro-reader-wrapper');
    if (wrapper) wrapper.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('visible'));

    document.getElementById('btn-continue-next-vol').addEventListener('click', () => {
      overlay.remove();
      loadNextVolume(nextVol, nextIdx);
    });

    document.getElementById('btn-dismiss-next-vol').addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    });
  }

  function loadNextVolume(nextVol, nextIdx) {
    mokuroState.currentVolumeIndex = nextIdx;
    mokuroState.currentPageIdx = 0;
    if (window.ToriiMangaDB && nextVol.id) {
      window.ToriiMangaDB.launch(nextVol.id);
    }
  }

  function goToPage(idx1Based) {
    if (!mokuroState.manga) return;
    const idx = parseInt(idx1Based, 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < mokuroState.manga.pages.length) {
      mokuroState.currentPageIdx = idx;
      renderCurrentPages();
    }
  }

  // Clic en bordes laterales (depende de R2L / L2R)
  function handleLeftZoneClick() {
    if (mokuroState.isR2L) {
      // En lectura japonesa, el borde izquierdo avanza a la siguiente página
      nextPage();
    } else {
      prevPage();
    }
  }

  function handleRightZoneClick() {
    if (mokuroState.isR2L) {
      // En lectura japonesa, el borde derecho retrocede
      prevPage();
    } else {
      nextPage();
    }
  }

  // ========================================================================
  // POPUP DE MINADO TORII & ACCIONES RÁPIDAS
  // ========================================================================
  function openToriiMiningPopup(text, clientX, clientY) {
    const popup = document.getElementById('torii-quick-popup');
    const textEl = document.getElementById('quick-popup-text-content');
    if (!popup || !textEl) return;

    mokuroState.activeTextBoxText = text.trim();
    textEl.textContent = mokuroState.activeTextBoxText;

    // Posicionar el popup cerca del cursor sin desbordar la pantalla
    const popupW = 340;
    const popupH = 180;
    let posX = clientX + 15;
    let posY = clientY + 15;

    if (posX + popupW > window.innerWidth) posX = window.innerWidth - popupW - 20;
    if (posY + popupH > window.innerHeight) posY = window.innerHeight - popupH - 20;
    if (posX < 10) posX = 10;
    if (posY < 10) posY = 10;

    popup.style.left = `${posX}px`;
    popup.style.top = `${posY}px`;
    popup.style.display = 'block';
  }

  function closeToriiMiningPopup() {
    const popup = document.getElementById('torii-quick-popup');
    if (popup) popup.style.display = 'none';
  }

  function playPronunciation(text) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function copyCurrentMokuroText() {
    if (!mokuroState.activeTextBoxText) return;
    navigator.clipboard.writeText(mokuroState.activeTextBoxText).then(() => {
      if (typeof mostrarToast === 'function') {
        mostrarToast('📋 Texto copiado al portapapeles');
      } else {
        alert('Texto copiado: ' + mokuroState.activeTextBoxText);
      }
    });
  }

  // ========================================================================
  // MINADO A ANKI CON HERRAMIENTA DE RECORTE (SNIPPING TOOL) Y SELECCIÓN DE KANJI
  // ========================================================================
  function mineCurrentMokuroText() {
    const text = mokuroState.activeTextBoxText;
    if (!text) return;
    closeToriiMiningPopup();
    startMangaAnkiMiningFlow(text);
  }

  function startMangaAnkiMiningFlow(sentence) {
    // 1. Iniciar la herramienta de recorte de pantalla estilo Windows sobre el manga
    startMangaSnippingTool(sentence, (croppedDataUrl) => {
      // 2. Al capturar el recorte (o si se omite), abrir modal para elegir kanji y crear tarjeta Anki
      openAnkiMangaCardModal(sentence, croppedDataUrl);
    });
  }

  // Herramienta de recorte de pantalla (Snipping Tool) sobre el lector
  function startMangaSnippingTool(sentence, onDone) {
    const oldOverlay = document.getElementById('manga-snipping-overlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'manga-snipping-overlay';
    overlay.className = 'manga-snipping-overlay';
    overlay.innerHTML = `
      <div class="snipping-toolbar">
        <span>✂️ Arrastra con el cursor para recortar la viñeta del manga</span>
        <button type="button" class="btn-snip-skip" id="btn-snip-skip" title="Crear tarjeta sin imagen">Omitir recorte ⏩</button>
        <button type="button" class="btn-snip-cancel" id="btn-snip-cancel" title="Cancelar recorte">&times;</button>
      </div>
      <div id="snipping-selection-box" class="snipping-selection-box"></div>
    `;

    document.body.appendChild(overlay);

    const box = overlay.querySelector('#snipping-selection-box');
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentRect = null;

    const onMouseDown = (e) => {
      if (e.target.closest('.snipping-toolbar')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      currentRect = { left: startX, top: startY, width: 0, height: 0 };
      box.style.display = 'block';
      box.style.left = `${startX}px`;
      box.style.top = `${startY}px`;
      box.style.width = '0px';
      box.style.height = '0px';
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const x1 = Math.min(startX, e.clientX);
      const y1 = Math.min(startY, e.clientY);
      const w = Math.abs(e.clientX - startX);
      const h = Math.abs(e.clientY - startY);

      currentRect = { left: x1, top: y1, width: w, height: h };
      box.style.left = `${x1}px`;
      box.style.top = `${y1}px`;
      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;

      if (currentRect && currentRect.width > 25 && currentRect.height > 25) {
        cleanup();
        const cropped = captureMangaScreenRegion(currentRect);
        onDone(cropped);
      } else {
        box.style.display = 'none';
        currentRect = null;
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        cleanup();
      }
    };

    const cleanup = () => {
      overlay.remove();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
    };

    overlay.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);

    overlay.querySelector('#btn-snip-cancel').addEventListener('click', cleanup);
    overlay.querySelector('#btn-snip-skip').addEventListener('click', () => {
      cleanup();
      onDone(null);
    });
  }

  // Recortar la región seleccionada de las páginas visibles en alta resolución nativa
  function captureMangaScreenRegion(rect) {
    try {
      const pc = document.getElementById('mokuro-pages-container');
      if (!pc) return null;

      const visiblePages = pc.querySelectorAll('.mokuro-page.visible-page');
      if (visiblePages.length === 0) return null;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let drawn = false;
      visiblePages.forEach(p => {
        const img = p.querySelector('img.page-img');
        if (!img || !img.naturalWidth) return;

        const imgRect = img.getBoundingClientRect();
        const interLeft = Math.max(rect.left, imgRect.left);
        const interTop = Math.max(rect.top, imgRect.top);
        const interRight = Math.min(rect.left + rect.width, imgRect.right);
        const interBottom = Math.min(rect.top + rect.height, imgRect.bottom);

        if (interRight > interLeft && interBottom > interTop) {
          const interW = interRight - interLeft;
          const interH = interBottom - interTop;

          const scaleX = img.naturalWidth / imgRect.width;
          const scaleY = img.naturalHeight / imgRect.height;

          const srcX = (interLeft - imgRect.left) * scaleX;
          const srcY = (interTop - imgRect.top) * scaleY;
          const srcW = interW * scaleX;
          const srcH = interH * scaleY;

          const destX = interLeft - rect.left;
          const destY = interTop - rect.top;

          ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, interW, interH);
          drawn = true;
        }
      });

      return drawn ? canvas.toDataURL('image/jpeg', 0.92) : null;
    } catch (err) {
      console.warn('Error capturando recorte del manga:', err);
      return null;
    }
  }

  // Obtener traducción rápida automática al español
  async function translateMangaSentence(text) {
    if (!text || !text.trim()) return '';
    try {
      const clean = text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').trim();
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=es&dt=t&q=${encodeURIComponent(clean)}`;
      const res = await fetch(url);
      if (!res.ok) return '';
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        return data[0].map(item => item[0]).filter(Boolean).join(' ');
      }
    } catch(e) {
      console.warn('Aviso traducción automática:', e);
    }
    return '';
  }

  // Caché de mazos de Anki y función para sincronizar con AnkiConnect
  let cachedMangaAnkiDecks = [];

  async function loadMangaAnkiDecks(silent = false) {
    const selectDeck = document.getElementById('manga-anki-deck-select');
    const statusIndicator = document.getElementById('manga-anki-status-indicator');
    const helpInfo = document.getElementById('manga-anki-help-info');
    const btnConnect = document.getElementById('btn-manga-connect-anki');
    const settingsGroup = document.getElementById('manga-anki-settings-group');
    const toggleEnabled = document.getElementById('manga-anki-enabled-toggle');
    const inputUrl = document.getElementById('manga-anki-url-input');

    if (toggleEnabled) toggleEnabled.checked = (localStorage.getItem('anki_enabled') !== 'false');
    if (inputUrl && typeof ankiConfig !== 'undefined') inputUrl.value = ankiConfig.url || localStorage.getItem('anki_url') || 'http://127.0.0.1:8765';

    if (!selectDeck) return cachedMangaAnkiDecks;

    if (btnConnect && !silent) {
      btnConnect.innerHTML = '<span>⏳ Conectando con Anki...</span>';
    }

    if (typeof invokeAnki !== 'function') {
      if (statusIndicator) {
        statusIndicator.textContent = '● Sin módulo';
        statusIndicator.className = 'anki-status offline';
      }
      return [];
    }

    try {
      const resDecks = await invokeAnki('deckNames');
      if (resDecks.error || !resDecks.result || resDecks.result.length === 0) {
        if (statusIndicator) {
          statusIndicator.textContent = '● Desconectado';
          statusIndicator.className = 'anki-status offline';
        }
        if (btnConnect) {
          btnConnect.style.display = 'flex';
          btnConnect.innerHTML = '<span>🔗 Reintentar Conexión a Anki</span>';
        }
        if (settingsGroup) settingsGroup.style.display = 'none';
        if (helpInfo && !silent) {
          helpInfo.style.display = 'block';
          if (resDecks.errorType === 'MIXED_CONTENT') {
            helpInfo.innerHTML = `<strong>⚠️ Permiso de AnkiConnect:</strong> Si apareció una ventana emergente pidiendo permiso, pulsa <strong>Permitir</strong>.<br><br>💡 Si usas HTTPS, abre la web desde <strong>http://</strong> o permite contenido no seguro en la barra de direcciones.`;
          } else {
            helpInfo.innerHTML = `<strong>⚠️ Anki no responde:</strong><br>1. Asegúrate de tener Anki abierto.<br>2. Revisa que <strong>AnkiConnect</strong> (código: <code>2055492159</code>) esté instalado en Anki.`;
          }
        }
        return [];
      }

      // Conexión exitosa
      cachedMangaAnkiDecks = resDecks.result;
      if (statusIndicator) {
        statusIndicator.textContent = '● Conectado';
        statusIndicator.className = 'anki-status online';
      }
      if (btnConnect) btnConnect.style.display = 'none';
      if (settingsGroup) settingsGroup.style.display = 'block';
      if (helpInfo) {
        helpInfo.style.display = 'none';
        helpInfo.innerHTML = '';
      }

      // Llenar select del toolbar
      selectDeck.innerHTML = '';
      const savedDeck = localStorage.getItem('anki_deck') || (typeof ankiConfig !== 'undefined' ? ankiConfig.deck : '') || 'Default';
      
      cachedMangaAnkiDecks.forEach(deckName => {
        const opt = document.createElement('option');
        opt.value = deckName;
        opt.textContent = deckName;
        selectDeck.appendChild(opt);
      });

      if (cachedMangaAnkiDecks.includes(savedDeck)) {
        selectDeck.value = savedDeck;
      } else if (cachedMangaAnkiDecks.length > 0) {
        selectDeck.value = cachedMangaAnkiDecks[0];
      }

      return cachedMangaAnkiDecks;
    } catch(e) {
      console.warn('Error al cargar mazos de Anki:', e);
      return [];
    }
  }

  // Ventana modal para configurar el anverso (Kanji elegido) y el reverso (oración + traducción + recorte)
  function openAnkiMangaCardModal(sentence, initialCroppedDataUrl) {
    const existing = document.getElementById('modal-anki-manga-creator');
    if (existing) existing.remove();

    // Extraer kanjis individuales de la oración
    const kanjiMatches = sentence.match(/[\u4e00-\u9faf\u3400-\u4dbf]/g) || [];
    const uniqueKanjis = Array.from(new Set(kanjiMatches));
    const initialKanji = uniqueKanjis.length > 0 ? uniqueKanjis[0] : sentence.trim().split(/\s+/)[0] || sentence.trim();
    const activeSavedDeck = localStorage.getItem('anki_deck') || (typeof ankiConfig !== 'undefined' ? ankiConfig.deck : '') || 'Default';

    let activeCroppedUrl = initialCroppedDataUrl;

    const modal = document.createElement('div');
    modal.id = 'modal-anki-manga-creator';
    modal.className = 'modal-overlay-manga active';
    modal.style.zIndex = '10002';

    modal.innerHTML = `
      <div class="modal-content-manga modal-anki-manga" style="max-width: 540px; padding: 24px; border-radius: 20px;">
        <div class="modal-header-manga" style="margin-bottom: 16px;">
          <h3><span>📇</span> Minar a Anki</h3>
          <button class="modal-close-btn-manga" id="btn-close-anki-creator">&times;</button>
        </div>

        <!-- Imagen recortada del manga -->
        <div id="anki-crop-preview-wrap" style="text-align: center; margin-bottom: 16px; ${!activeCroppedUrl ? 'display:none;' : ''}">
          <div style="position: relative; display: inline-block; max-width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid rgba(19, 162, 206, 0.35); box-shadow: 0 4px 14px rgba(0,0,0,0.3);">
            <img id="anki-crop-img-el" src="${activeCroppedUrl || ''}" alt="Recorte de viñeta" style="max-height: 180px; max-width: 100%; display: block; object-fit: contain;">
            <button type="button" id="btn-recrop-action" style="position: absolute; bottom: 8px; right: 8px; background: rgba(20, 24, 33, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.4); border-radius: 6px; padding: 4px 9px; font-size: 0.76rem; font-weight: 700; cursor: pointer;">
              ✂️ Recortar de nuevo
            </button>
          </div>
        </div>

        ${!activeCroppedUrl ? `
          <div style="margin-bottom: 16px; text-align: center;">
            <button type="button" id="btn-take-crop-action" class="btn-upload-choice btn-secondary-choice" style="padding: 7px 14px; font-size: 0.85rem;">
              ✂️ Recortar imagen del manga
            </button>
          </div>
        ` : ''}

        <!-- Anverso (Kanji elegido) -->
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-weight: 700; font-size: 0.92rem; margin-bottom: 6px; color: var(--azulNa, #13a2ce);">
            🏷️ Anverso (Kanji o palabra objetivo):
          </label>
          <input type="text" id="input-anki-front-kanji" value="${escapeHtml(initialKanji)}" style="width: 100%; padding: 10px 14px; font-size: 1.5rem; font-weight: 800; text-align: center; border-radius: 10px; border: 2px solid rgba(19, 162, 206, 0.4); background: rgba(0,0,0,0.02); color: inherit; box-sizing: border-box;" placeholder="Kanji...">
          
          <div id="anki-kanji-chips-container" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center;">
            <span style="font-size: 0.8rem; color: #888;">Kanjis detectados:</span>
            ${uniqueKanjis.map(k => `
              <button type="button" class="kanji-chip-btn ${k === initialKanji ? 'active' : ''}" data-kanji="${escapeHtml(k)}">${escapeHtml(k)}</button>
            `).join('')}
            ${uniqueKanjis.length === 0 ? '<small style="color:#777; font-size:0.8rem;">(No se detectaron kanjis individuales; puedes escribir la palabra que gustes)</small>' : ''}
          </div>
        </div>

        <!-- Reverso: Oración, Furigana y Traducción -->
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 700; font-size: 0.88rem; margin-bottom: 5px; color: #999;">
            💬 Reverso — Oración completa:
          </label>
          <textarea id="input-anki-back-sentence" rows="2" style="width: 100%; padding: 9px 12px; font-size: 0.95rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.03); color: inherit; box-sizing: border-box; resize: vertical;">${escapeHtml(sentence)}</textarea>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <label for="input-anki-back-furigana" style="font-weight: 700; font-size: 0.88rem; color: #999;">
              🌸 Reverso — Furigana / Lectura:
            </label>
            <span style="font-size: 0.76rem; color: #888;">(formato Kanji[furigana] o &lt;ruby&gt;)</span>
          </div>
          <input type="text" id="input-anki-back-furigana" value="${escapeHtml(sentence)}" style="width: 100%; padding: 9px 12px; font-size: 0.92rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.03); color: inherit; box-sizing: border-box;" placeholder="Ej: 私[わたし]は 学生[がくせい]です">
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.88rem; margin-bottom: 5px; color: #999;">
            <span>🌐 Reverso — Traducción al español:</span>
            <span id="anki-trans-status" style="font-size: 0.78rem; font-weight: normal; color: var(--azulNa, #13a2ce);">Traduciendo...</span>
          </label>
          <input type="text" id="input-anki-back-trans" style="width: 100%; padding: 9px 12px; font-size: 0.92rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.03); color: inherit; box-sizing: border-box;" placeholder="Cargando traducción automática...">
        </div>

        <!-- Mazo de Anki (Deck) Destino -->
        <div style="margin-bottom: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <label for="input-anki-modal-deck" style="display: block; font-weight: 700; font-size: 0.88rem; color: #999;">
              📁 Guardar en mazo de Anki (Deck):
            </label>
            <span id="anki-modal-deck-indicator" style="font-size: 0.78rem; color: var(--azulNa, #13a2ce);">
              ${cachedMangaAnkiDecks.length > 0 ? '✓ Mazos sincronizados' : 'Buscando mazos...'}
            </span>
          </div>
          <select id="input-anki-modal-deck" style="width: 100%; padding: 9px 12px; font-size: 0.92rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.03); color: inherit; box-sizing: border-box; cursor: pointer;">
            <option value="${escapeHtml(activeSavedDeck)}">${escapeHtml(activeSavedDeck)}</option>
          </select>
        </div>

        <!-- Acciones -->
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" id="btn-anki-cancel-card" class="btn-upload-choice btn-secondary-choice" style="padding: 9px 16px;">
            Cancelar
          </button>
          <button type="button" id="btn-anki-confirm-save" class="btn-hero-lectura btn-hero-mokuro" style="padding: 9px 20px; font-size: 0.95rem;">
            <span>⚡</span> Crear Tarjeta en Anki
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const inputKanji = modal.querySelector('#input-anki-front-kanji');
    const inputSentence = modal.querySelector('#input-anki-back-sentence');
    const inputFurigana = modal.querySelector('#input-anki-back-furigana');
    const inputTrans = modal.querySelector('#input-anki-back-trans');
    const statusTrans = modal.querySelector('#anki-trans-status');
    const chips = modal.querySelectorAll('.kanji-chip-btn');
    const selectModalDeck = modal.querySelector('#input-anki-modal-deck');
    const deckIndicator = modal.querySelector('#anki-card-deck-indicator');

    // Traducir automáticamente la oración
    translateMangaSentence(sentence).then(tr => {
      if (inputTrans) inputTrans.value = tr;
      if (statusTrans) statusTrans.textContent = tr ? '✓ Traducido' : '';
    });

    // Cargar y poblar lista de mazos en el modal
    const populateModalDecks = (decks) => {
      if (!selectModalDeck || !decks || decks.length === 0) return;
      selectModalDeck.innerHTML = '';
      decks.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        selectModalDeck.appendChild(opt);
      });
      const currentDeck = localStorage.getItem('anki_deck') || (typeof ankiConfig !== 'undefined' ? ankiConfig.deck : '') || 'Default';
      if (decks.includes(currentDeck)) {
        selectModalDeck.value = currentDeck;
      } else {
        selectModalDeck.value = decks[0];
      }
      if (deckIndicator) deckIndicator.textContent = '✓ Mazos sincronizados';
    };

    if (cachedMangaAnkiDecks && cachedMangaAnkiDecks.length > 0) {
      populateModalDecks(cachedMangaAnkiDecks);
    } else {
      loadMangaAnkiDecks(true).then(decks => {
        if (decks && decks.length > 0) {
          populateModalDecks(decks);
        } else if (deckIndicator) {
          deckIndicator.textContent = '● Usando mazo predeterminado';
        }
      });
    }

    // Clic en chips de kanji para seleccionarlo en el anverso
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        inputKanji.value = chip.getAttribute('data-kanji') || '';
        inputKanji.focus();
      });
    });

    // Recortar de nuevo
    const handleReCrop = () => {
      modal.remove();
      startMangaSnippingTool(sentence, (newCrop) => {
        openAnkiMangaCardModal(sentence, newCrop || activeCroppedUrl);
      });
    };

    const btnRecrop = modal.querySelector('#btn-recrop-action');
    if (btnRecrop) btnRecrop.addEventListener('click', handleReCrop);

    const btnTakeCrop = modal.querySelector('#btn-take-crop-action');
    if (btnTakeCrop) btnTakeCrop.addEventListener('click', handleReCrop);

    // Cerrar
    const closeModal = () => modal.remove();
    modal.querySelector('#btn-close-anki-creator').addEventListener('click', closeModal);
    modal.querySelector('#btn-anki-cancel-card').addEventListener('click', closeModal);

    // Guardar tarjeta
    modal.querySelector('#btn-anki-confirm-save').addEventListener('click', async () => {
      const kanjiVal = inputKanji.value.trim() || initialKanji;
      const sentenceVal = inputSentence.value.trim() || sentence;
      const furiganaVal = (inputFurigana ? inputFurigana.value.trim() : '') || sentenceVal;
      const transVal = inputTrans.value.trim();
      const chosenDeck = (selectModalDeck && selectModalDeck.value) ? selectModalDeck.value : activeSavedDeck;

      const btnSave = modal.querySelector('#btn-anki-confirm-save');
      btnSave.disabled = true;
      btnSave.textContent = 'Guardando en Anki...';

      // Persistir preferencia de mazo seleccionada
      if (chosenDeck) {
        localStorage.setItem('anki_deck', chosenDeck);
        if (typeof ankiConfig !== 'undefined') ankiConfig.deck = chosenDeck;
        const deckSelectEl = document.getElementById('manga-anki-deck-select');
        if (deckSelectEl && deckSelectEl.value !== chosenDeck) {
          deckSelectEl.value = chosenDeck;
        }
      }

      await saveAnkiMangaNote({
        kanji: kanjiVal,
        sentence: sentenceVal,
        furigana: furiganaVal,
        translation: transVal,
        croppedDataUrl: activeCroppedUrl,
        deckName: chosenDeck
      });

      modal.remove();
    });
  }

  // Enviar a AnkiConnect y guardar en tarjetas locales de Nihongo no Torii
  async function saveAnkiMangaNote({ kanji, sentence, furigana, translation, croppedDataUrl, deckName }) {
    const timestamp = Date.now();
    const sourceTitle = (mokuroState.manga && mokuroState.manga.title) 
      ? `Manga: ${mokuroState.manga.title}${mokuroState.manga.volume ? ' - ' + mokuroState.manga.volume : ''}` 
      : 'Manga Mokuro';

    let ankiSaved = false;
    let ankiErrorMsg = null;
    let finalDeckName = (deckName || localStorage.getItem('anki_deck') || (typeof ankiConfig !== 'undefined' ? ankiConfig.deck : null) || 'Default').trim();

    // 1. Enviar directamente a Anki vía AnkiConnect usando la integración nativa
    if (typeof window.enviarMangaAAnki === 'function') {
      try {
        const resAnki = await window.enviarMangaAAnki({
          kanji,
          sentence,
          furigana,
          translation,
          croppedDataUrl,
          deckName: finalDeckName,
          sourceTitle
        });

        if (resAnki && resAnki.id) {
          ankiSaved = true;
          finalDeckName = resAnki.deck || finalDeckName;
          console.log('✅ Tarjeta de manga creada exitosamente en Anki:', resAnki);
        }
      } catch (err) {
        console.error('Error al guardar tarjeta en Anki:', err);
        ankiErrorMsg = err.message || String(err);
      }
    } else if (typeof invokeAnki === 'function') {
      // Fallback si enviarMangaAAnki estuviera en proceso de carga
      try {
        await invokeAnki('createDeck', 6, { deck: finalDeckName });
        const allModelsRes = await invokeAnki('modelNames');
        const userModels = (allModelsRes && allModelsRes.result) ? allModelsRes.result : ['Basic'];
        const modelName = userModels.find(m => ["basic", "basico", "básico"].includes(m.toLowerCase().trim())) || userModels[0];
        const fieldsRes = await invokeAnki('modelFieldNames', 6, { modelName });
        const fields = (fieldsRes && fieldsRes.result) ? fieldsRes.result : ['Front', 'Back'];
        
        const fieldsObj = {};
        fields.forEach(f => fieldsObj[f] = '');
        fieldsObj[fields[0]] = kanji;
        fieldsObj[fields[1] || fields[0]] = `<div style="font-size:1.3em; font-weight:bold;">${escapeHtml(sentence)}</div>${translation ? `<div style="color:#FFDEBD;">${escapeHtml(translation)}</div>` : ''}`;

        const payload = {
          deckName: finalDeckName,
          modelName: modelName,
          fields: fieldsObj,
          tags: ['ToriiManga'],
          options: { allowDuplicate: true }
        };

        if (croppedDataUrl) {
          let b64 = croppedDataUrl;
          if (b64.includes(',')) b64 = b64.split(',')[1];
          b64 = b64.replace(/[\r\n\s]/g, '');
          if (b64.length > 50) {
            payload.picture = [{
              data: b64,
              filename: `manga_torii_${timestamp}.jpg`,
              fields: [fields[1] || fields[0]]
            }];
          }
        }

        const res = await invokeAnki('addNote', 6, { note: payload });
        if (res && res.result) {
          ankiSaved = true;
        } else if (res && res.error) {
          ankiErrorMsg = res.error;
        }
      } catch (fallbackErr) {
        ankiErrorMsg = fallbackErr.message || String(fallbackErr);
      }
    } else {
      ankiErrorMsg = 'AnkiConnect no está disponible en la página';
    }

    // 2. Guardar en tarjetas minadas locales (torii_mined_cards)
    const localCard = {
      id: `Manga_${timestamp}`,
      palabra: kanji,
      kanji: kanji,
      oracion: sentence,
      furigana: furigana || sentence,
      traduccion: translation,
      imagen: croppedDataUrl || '',
      tipo: 'imagen',
      fuente: sourceTitle,
      mazo: finalDeckName,
      fecha: new Date().toLocaleDateString()
    };

    try {
      let list = JSON.parse(localStorage.getItem('torii_mined_cards') || '[]');
      list.unshift(localCard);
      localStorage.setItem('torii_mined_cards', JSON.stringify(list));
      if (typeof minedCardsList !== 'undefined' && Array.isArray(minedCardsList)) {
        minedCardsList.unshift(localCard);
        if (typeof renderMinedCardsUI === 'function') renderMinedCardsUI();
      }
    } catch(e) {}

    // 3. Notificación con diagnóstico claro
    if (ankiSaved) {
      if (typeof mostrarToast === 'function') {
        mostrarToast(`📇 ¡Tarjeta creada con éxito en el mazo "${finalDeckName}" de Anki!`);
      }
    } else {
      if (typeof mostrarToast === 'function') {
        if (ankiErrorMsg) {
          mostrarToast(`⚠️ Anki: ${ankiErrorMsg} (Guardada en tu lista web)`);
        } else {
          mostrarToast('⭐ Tarjeta guardada en tus Tarjetas Minadas de Torii');
        }
      }
    }
  }

  // ========================================================================
  // CARGADORES DE MANGA (DEMO, LOCAL Y CARPETA)
  // ========================================================================
  function openReaderModal() {
    const wrapper = document.getElementById('mokuro-reader-wrapper');
    const container = document.getElementById('mokuro-pages-container');
    if (wrapper) {
      wrapper.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (container) container.innerHTML = '';
      currentMangaKey = null;           // Forzar reconstrucción de páginas
      mokuroState.zoomMode = 'fit-screen'; // Reiniciar modo de zoom al abrir un nuevo manga
      initPanzoom();
      renderCurrentPages();
    }
  }

  function closeReaderModal() {
    const wrapper = document.getElementById('mokuro-reader-wrapper');
    const stage = document.getElementById('mokuro-stage');
    if (wrapper) {
      wrapper.classList.remove('active');
      document.body.style.overflow = '';
      if (pzInstance) {
        pzInstance.dispose();
        pzInstance = null;
      }
      // Limpiar listener de scroll del stage
      if (stageWheelHandler && stage) {
        stage.removeEventListener('wheel', stageWheelHandler);
        stageWheelHandler = null;
      }
      closeToriiMiningPopup();
    }
  }

  // Cargar manga de prueba incluido en Nihongo no Torii
  window.cargarMangaDemo = function() {
    const demoMokuroUrl = 'manga/demo/vol1/vol1.mokuro';
    fetch(demoMokuroUrl)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el archivo demo .mokuro');
        return res.json();
      })
      .then(data => {
        // Enlazar imágenes locales
        mokuroState.imageUrls.clear();
        mokuroState.manga = {
          title: data.title === 'test0' ? "うちの猫’ず日記 (Diario de mis gatos)" : data.title,
          volume: "Volumen 1",
          pages: data.pages.map(p => {
            const filename = p.img_path.split(/[/\\]/).pop();
            return {
              ...p,
              img_path: `manga/demo/vol1/${filename}`
            };
          })
        };
        mokuroState.currentPageIdx = 0;
        openReaderModal();
      })
      .catch(err => {
        console.error('Error cargando demo:', err);
        alert('Error al cargar el demo de Mokuro. Asegúrate de estar ejecutando en un servidor local o revisa la ruta.');
      });
  };

  // Procesar carpeta seleccionada por el usuario (webkitdirectory)
  function handleFolderSelection(files) {
    if (!files || files.length === 0) return;

    // Si es un archivo CBZ o ZIP individual
    const firstFile = files[0];
    if (files.length === 1 && /\.(cbz|zip)$/i.test(firstFile.name)) {
      if (window.ToriiMangaDB && typeof JSZip !== 'undefined') {
        if (typeof mostrarToast === 'function') {
          mostrarToast(`📦 Descomprimiendo ${firstFile.name}...`);
        }
        window.ToriiMangaDB.processCbzOrZip(firstFile, '', '', (pct, status) => {
          console.log(`[Importando CBZ/ZIP] ${pct}% - ${status}`);
        }).then(record => {
          if (typeof window.ToriiMangaDB.renderGrid === 'function') {
            window.ToriiMangaDB.renderGrid();
          }
          window.ToriiMangaDB.launchManga(record.id);
        }).catch(err => {
          console.error(err);
          alert('Error al procesar el archivo CBZ/ZIP: ' + err.message);
        });
        return;
      }
    }

    let mokuroFile = null;
    const imageFiles = new Map();
    const imageFilenames = [];

    Array.from(files).forEach(file => {
      const name = file.name;
      const lower = name.toLowerCase();
      // Omitir archivos de Mac OS, archivos ocultos y thumbnails de sistema
      if (name.startsWith('.') || lower.includes('__macosx') || /^(thumbs\.db|desktop\.ini|ehthumbs\.db|.*_thumb\..*)$/i.test(name)) {
        return;
      }
      if (lower.endsWith('.mokuro') || (lower.endsWith('.json') && !name.startsWith('.'))) {
        mokuroFile = file;
      } else if (/\.(jpe?g|png|webp|avif|gif)$/i.test(name)) {
        const url = URL.createObjectURL(file);
        imageFiles.set(name, url);
        imageFiles.set(name.toLowerCase(), url);
        imageFilenames.push(name);
      }
    });

    if (imageFilenames.length === 0 && !mokuroFile) {
      alert('No se encontraron imágenes ni archivos .mokuro válidos en la selección.');
      return;
    }

    // Ordenar imágenes de forma natural
    imageFilenames.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    // Detectar y omitir portada extra de baja calidad / miniatura redundante
    if (imageFilenames.length > 1) {
      const clean0 = imageFilenames[0].toLowerCase();
      const clean1 = imageFilenames[1].toLowerCase();
      const isCover0 = /^(!|_|000?_)?(cover|thumb|thumbnail|folder|preview|small)/i.test(clean0);
      const isNum1 = /^(000|001|01|1|p001|p01|page[_\-]?0*1)/i.test(clean1) || !isNaN(parseInt(clean1.replace(/\.[^/.]+$/, ''), 10));
      if (isCover0 && isNum1) {
        console.log(`[ToriiManga] Omitiendo portada extra en selección local: ${imageFilenames[0]}, adoptando: ${imageFilenames[1]}`);
        imageFilenames.shift();
      }
    }

    // Si ToriiMangaDB está disponible, guardar la carpeta en IndexedDB para que persista
    if (window.ToriiMangaDB && typeof JSZip !== 'undefined') {
      const folderName = (files[0].webkitRelativePath ? files[0].webkitRelativePath.split('/')[0] : 'Manga Local');
      if (typeof mostrarToast === 'function') {
        mostrarToast(`💾 Guardando "${folderName}" en tu biblioteca...`);
      }
      window.ToriiMangaDB.processFolder(files, '', '', (pct, status) => {
        console.log(`[Guardando Carpeta] ${pct}% - ${status}`);
      }).then(record => {
        if (typeof window.ToriiMangaDB.renderGrid === 'function') {
          window.ToriiMangaDB.renderGrid();
        }
        window.ToriiMangaDB.launchManga(record.id);
      }).catch(err => {
        console.warn('Error al guardar automáticamente carpeta en BD, abriendo en memoria:', err);
        // Fallback en memoria si IndexedDB fallara
        abrirEnMemoria(mokuroFile, imageFiles, imageFilenames, files);
      });
      return;
    }

    abrirEnMemoria(mokuroFile, imageFiles, imageFilenames, files);
  }

  function abrirEnMemoria(mokuroFile, imageFiles, imageFilenames, files) {
    if (mokuroFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          mokuroState.imageUrls = imageFiles;
          mokuroState.manga = {
            title: data.title || mokuroFile.name.replace(/\.[^/.]+$/, ''),
            volume: data.volume || 'Volumen 1',
            pages: data.pages || []
          };
          mokuroState.currentPageIdx = 0;
          openReaderModal();
        } catch (err) {
          console.error(err);
          alert('Error al leer el archivo .mokuro: Formato JSON inválido.');
        }
      };
      reader.readAsText(mokuroFile);
    } else {
      const pages = imageFilenames.map(name => ({
        img_path: name,
        img_width: 800,
        img_height: 1200,
        blocks: []
      }));

      const folderName = (files[0].webkitRelativePath ? files[0].webkitRelativePath.split('/')[0] : 'Manga Local');
      mokuroState.imageUrls = imageFiles;
      mokuroState.manga = {
        title: folderName,
        volume: 'Lectura Local',
        pages: pages
      };
      mokuroState.currentPageIdx = 0;
      openReaderModal();

      if (typeof mostrarToast === 'function') {
        mostrarToast('📖 Manga abierto (sin OCR de Mokuro)');
      }
    }
  }

  // Procesar archivos arrastrados o seleccionados con input múltiple
  function handleFilesSelection(files) {
    handleFolderSelection(files);
  }

  // ========================================================================
  // INICIALIZACIÓN DEL DOM & EVENT LISTENERS
  // ========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    loadSavedPreferences();
    syncUIWithState();

    // Controles de barra del lector
    const btnExit = document.getElementById('btn-exit-reader');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    const pageInput = document.getElementById('page-current-input');
    const zoneLeft = document.getElementById('nav-zone-left');
    const zoneRight = document.getElementById('nav-zone-right');

    if (btnExit) btnExit.addEventListener('click', closeReaderModal);
    if (btnPrev) btnPrev.addEventListener('click', prevPage);
    if (btnNext) btnNext.addEventListener('click', nextPage);
    if (zoneLeft) zoneLeft.addEventListener('click', handleLeftZoneClick);
    if (zoneRight) zoneRight.addEventListener('click', handleRightZoneClick);

    if (pageInput) {
      pageInput.addEventListener('change', (e) => goToPage(e.target.value));
      pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') goToPage(e.target.value);
      });
    }

    // Controles de barra inferior de avance rápido (Scrubber)
    const pageSlider = document.getElementById('reader-page-slider');
    const sliderTooltip = document.getElementById('slider-tooltip');
    const btnScrubberPrev = document.getElementById('btn-scrubber-prev');
    const btnScrubberNext = document.getElementById('btn-scrubber-next');

    if (btnScrubberPrev) btnScrubberPrev.addEventListener('click', prevPage);
    if (btnScrubberNext) btnScrubberNext.addEventListener('click', nextPage);

    if (pageSlider) {
      // Arrastrar en tiempo real el slider para previsualizar página
      pageSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (sliderTooltip) {
          sliderTooltip.textContent = `Pág. ${val}`;
          const max = parseInt(pageSlider.max, 10) || 1;
          // En modo RTL: invertir el porcentaje de posición del tooltip
          const pct = 100 - ((val - 1) / Math.max(1, max - 1)) * 100;
          sliderTooltip.style.left = `${pct}%`;
        }
      });

      // Al soltar o cambiar el slider, saltar a la página elegida
      pageSlider.addEventListener('change', (e) => {
        goToPage(e.target.value);
      });

      // Mantener visible la barra de avance mientras el usuario la está arrastrando
      const scrubberWrap = document.getElementById('reader-bottom-scrubber');
      if (scrubberWrap) {
        pageSlider.addEventListener('mousedown', () => scrubberWrap.classList.add('active-scrub'));
        pageSlider.addEventListener('touchstart', () => scrubberWrap.classList.add('active-scrub'), { passive: true });
        window.addEventListener('mouseup', () => scrubberWrap.classList.remove('active-scrub'));
        window.addEventListener('touchend', () => scrubberWrap.classList.remove('active-scrub'));
      }
    }

    // Sincronizar estado de pantalla completa y reajustar visualización del manga
    const handleFullscreenChange = () => {
      const wrapper = document.getElementById('mokuro-reader-wrapper');
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (wrapper) {
        wrapper.classList.toggle('is-fullscreen', isFs);
      }
      setTimeout(() => {
        applyCurrentZoomMode();
      }, 70);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', () => {
      const wrapper = document.getElementById('mokuro-reader-wrapper');
      if (wrapper && wrapper.classList.contains('active')) {
        clampPan();
      }
    });

    // Botones de Zoom
    const btnFitScreen = document.getElementById('btn-zoom-fit-screen');
    const btnFitWidth = document.getElementById('btn-zoom-fit-width');
    const btnZoomOriginal = document.getElementById('btn-zoom-original');
    const btnFullscreen = document.getElementById('btn-toggle-fullscreen');

    if (btnFitScreen) btnFitScreen.addEventListener('click', zoomFitToScreen);
    if (btnFitWidth) btnFitWidth.addEventListener('click', zoomFitToWidth);
    if (btnZoomOriginal) btnZoomOriginal.addEventListener('click', zoomOriginal);
    if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullScreen);

    // Menú de opciones (Dropdown)
    const btnDropdown = document.getElementById('btn-settings-dropdown');
    const dropdownWrap = document.getElementById('mokuro-settings-dropdown');
    const btnMangaAnki = document.getElementById('btn-mokuro-anki');
    const ankiDropdownWrap = document.getElementById('mokuro-anki-dropdown');

    if (btnDropdown && dropdownWrap) {
      btnDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ankiDropdownWrap) ankiDropdownWrap.classList.remove('open');
        dropdownWrap.classList.toggle('open');
      });

      // Evitar que clics dentro del menú (como en el select de fuentes o checkboxes) lo cierren
      dropdownWrap.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Cerrar solo si se hace clic afuera del menú
      document.addEventListener('click', (e) => {
        if (!dropdownWrap.contains(e.target)) {
          dropdownWrap.classList.remove('open');
        }
      });
    }

    // Configuración de Anki en la barra de lectura (estilo ToriiTV)
    if (btnMangaAnki && ankiDropdownWrap) {
      btnMangaAnki.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdownWrap) dropdownWrap.classList.remove('open');
        const opening = !ankiDropdownWrap.classList.contains('open');
        ankiDropdownWrap.classList.toggle('open');
        if (opening) {
          loadMangaAnkiDecks(true);
        }
      });

      ankiDropdownWrap.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      document.addEventListener('click', (e) => {
        if (!ankiDropdownWrap.contains(e.target)) {
          ankiDropdownWrap.classList.remove('open');
        }
      });

      const btnConnect = document.getElementById('btn-manga-connect-anki');
      if (btnConnect) {
        btnConnect.addEventListener('click', () => loadMangaAnkiDecks(false));
      }

      const btnRefresh = document.getElementById('btn-manga-refresh-decks');
      if (btnRefresh) {
        btnRefresh.addEventListener('click', () => loadMangaAnkiDecks(false));
      }

      const btnSave = document.getElementById('btn-manga-save-anki');
      if (btnSave) {
        btnSave.addEventListener('click', () => {
          const selectDeck = document.getElementById('manga-anki-deck-select');
          const inputUrl = document.getElementById('manga-anki-url-input');
          const toggleEnabled = document.getElementById('manga-anki-enabled-toggle');

          const chosenDeck = selectDeck ? selectDeck.value : 'Default';
          const chosenUrl = (inputUrl && inputUrl.value.trim()) ? inputUrl.value.trim() : 'http://127.0.0.1:8765';
          const isEnabled = toggleEnabled ? toggleEnabled.checked : true;

          localStorage.setItem('anki_deck', chosenDeck);
          localStorage.setItem('anki_url', chosenUrl);
          localStorage.setItem('anki_enabled', isEnabled);

          if (typeof ankiConfig !== 'undefined') {
            ankiConfig.deck = chosenDeck;
            ankiConfig.url = chosenUrl;
            ankiConfig.enabled = isEnabled;
          }

          ankiDropdownWrap.classList.remove('open');
          if (typeof mostrarToast === 'function') {
            mostrarToast(`📇 Mazo de Anki guardado: "${chosenDeck}"`);
          }
        });
      }

      // Prospección silenciosa al cargar para sincronizar el estado
      setTimeout(() => {
        loadMangaAnkiDecks(true);
      }, 1200);
    }

    // Opciones de configuración
    const chkR2l = document.getElementById('chk-r2l');
    const chkDouble = document.getElementById('chk-double-page');
    const chkCover = document.getElementById('chk-has-cover');
    const chkOcr = document.getElementById('chk-enable-ocr');
    const chkBorders = document.getElementById('chk-show-borders');
    const chkAlwaysOcr = document.getElementById('chk-always-ocr');
    const chkEditable = document.getElementById('chk-editable-text');
    const selectFontSize = document.getElementById('select-font-size');
    const chkEInk = document.getElementById('chk-eink-mode');

    if (chkR2l) {
      chkR2l.addEventListener('change', (e) => {
        mokuroState.isR2L = e.target.checked;
        savePreferences();
        updateContainerClasses();
        renderCurrentPages();
      });
    }

    if (chkDouble) {
      chkDouble.addEventListener('change', (e) => {
        mokuroState.isDoublePage = e.target.checked;
        savePreferences();
        renderCurrentPages();
      });
    }

    if (chkCover) {
      chkCover.addEventListener('change', (e) => {
        mokuroState.hasCover = e.target.checked;
        savePreferences();
        renderCurrentPages();
      });
    }

    if (chkOcr) {
      chkOcr.addEventListener('change', (e) => {
        mokuroState.showOcr = e.target.checked;
        updateContainerClasses();
      });
    }

    if (chkBorders) {
      chkBorders.addEventListener('change', (e) => {
        mokuroState.showBorders = e.target.checked;
        savePreferences();
        updateContainerClasses();
      });
    }

    if (chkAlwaysOcr) {
      chkAlwaysOcr.addEventListener('change', (e) => {
        mokuroState.alwaysVisibleOcr = e.target.checked;
        savePreferences();
        updateContainerClasses();
      });
    }

    if (chkEditable) {
      chkEditable.addEventListener('change', (e) => {
        mokuroState.editableText = e.target.checked;
        const boxes = document.querySelectorAll('.textBox');
        boxes.forEach(b => b.contentEditable = mokuroState.editableText ? 'true' : 'false');
      });
    }

    if (selectFontSize) {
      selectFontSize.addEventListener('change', (e) => {
        mokuroState.fontSize = e.target.value;
        savePreferences();
        const boxes = document.querySelectorAll('.textBox');
        boxes.forEach(b => {
          if (mokuroState.fontSize !== 'auto') {
            b.style.fontSize = `${mokuroState.fontSize}px`;
          } else {
            b.style.fontSize = ''; // Restaurar tamaño original calculado por Mokuro
          }
        });
      });
    }

    if (chkEInk) {
      chkEInk.addEventListener('change', (e) => {
        mokuroState.eInkMode = e.target.checked;
        updateContainerClasses();
      });
    }

    // Popup de Minado Torii
    const btnClosePopup = document.getElementById('btn-close-quick-popup');
    const btnCopyPopup = document.getElementById('btn-copy-quick-text');
    const btnSpeakPopup = document.getElementById('btn-speak-quick-text');
    const btnMinePopup = document.getElementById('btn-mine-quick-text');

    if (btnClosePopup) btnClosePopup.addEventListener('click', closeToriiMiningPopup);
    if (btnCopyPopup) btnCopyPopup.addEventListener('click', copyCurrentMokuroText);
    if (btnSpeakPopup) btnSpeakPopup.addEventListener('click', () => playPronunciation(mokuroState.activeTextBoxText));
    if (btnMinePopup) btnMinePopup.addEventListener('click', mineCurrentMokuroText);

    // Atajos de Teclado
    document.addEventListener('keydown', (e) => {
      const wrapper = document.getElementById('mokuro-reader-wrapper');
      if (!wrapper || !wrapper.classList.contains('active')) return;

      // Si el foco está en un input o editable, no interferir
      if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;

      switch (e.key) {
        case 'ArrowLeft':
          mokuroState.isR2L ? nextPage() : prevPage();
          break;
        case 'ArrowRight':
          mokuroState.isR2L ? prevPage() : nextPage();
          break;
        case 'PageDown':
        case ' ':
          nextPage();
          break;
        case 'PageUp':
          prevPage();
          break;
        case 'Home':
          firstPage();
          break;
        case 'End':
          lastPage();
          break;
        case 'Escape':
          closeToriiMiningPopup();
          break;
        case '0':
          zoomFitToScreen();
          break;
        case '1':
          zoomOriginal();
          break;
      }
    });

    // Carga de Archivos Locales y Drag & Drop
    const inputFolder = document.getElementById('input-folder-manga');
    const inputFiles = document.getElementById('input-files-manga');
    const dropzone = document.getElementById('manga-dropzone');

    if (inputFolder) {
      inputFolder.addEventListener('change', (e) => handleFolderSelection(e.target.files));
    }
    if (inputFiles) {
      inputFiles.addEventListener('change', (e) => handleFilesSelection(e.target.files));
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer && e.dataTransfer.files) {
          handleFilesSelection(e.dataTransfer.files);
        }
      });
    }

    // Copiar comandos de la guía Mokuro
    const copyBtns = document.querySelectorAll('.terminal-copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-cmd');
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = btn.textContent;
            btn.textContent = '¡Copiado!';
            setTimeout(() => btn.textContent = originalText, 1500);
          });
        }
      });
    });
  });

  // Exponer API global
  window.MokuroReader = {
    open: openReaderModal,
    close: closeReaderModal,
    cargarDemo: window.cargarMangaDemo,
    nextPage: nextPage,
    prevPage: prevPage,
    goToPage: goToPage,
    getState: () => mokuroState
  };

})();
