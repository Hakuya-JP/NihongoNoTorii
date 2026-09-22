// ==========================================================================
// NIHONGO NO TORII - GESTOR DE BIBLIOTECA DE MANGAS E INDEXEDDB (CBZ/ZIP)
// ==========================================================================

(function() {
  'use strict';

  const DB_NAME = 'ToriiMangaLibraryDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'mangas';

  let dbInstance = null;

  // Inicializar IndexedDB
  function openDB() {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('addedAt', 'addedAt', { unique: false });
        }
      };

      request.onsuccess = function(e) {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = function(e) {
        console.error('Error al abrir IndexedDB:', e);
        reject(e);
      };
    });
  }

  // Guardar un manga en IndexedDB
  function saveMangaToDB(mangaData) {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(mangaData);

        req.onsuccess = () => resolve(mangaData);
        req.onerror = (e) => reject(e);
      });
    });
  }

  // Obtener todos los mangas guardados
  function getAllMangasFromDB() {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = (e) => reject(e);
      });
    });
  }

  // Obtener un manga por ID
  function getMangaById(id) {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e);
      });
    });
  }

  // Actualizar progreso de lectura
  function updateMangaProgress(id, pageIndex) {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const item = getReq.result;
          if (item) {
            item.lastPageRead = pageIndex;
            item.lastReadAt = Date.now();
            store.put(item);
            resolve(item);
          } else {
            resolve(null);
          }
        };
        getReq.onerror = (e) => reject(e);
      });
    });
  }

  // Eliminar un manga
  function deleteMangaFromDB(id) {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e);
      });
    });
  }

  // Actualizar portada personalizada de un manga en IndexedDB
  function updateMangaCover(id, coverDataUrl) {
    return openDB().then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const item = getReq.result;
          if (item) {
            item.coverDataUrl = coverDataUrl;
            store.put(item);
            resolve(item);
          } else {
            resolve(null);
          }
        };
        getReq.onerror = (e) => reject(e);
      });
    });
  }

  // ========================================================================
  // PROCESAMIENTO DE ARCHIVOS CBZ Y ZIP CON JSZIP
  // ========================================================================

  // Orden natural de nombres de archivos (1, 2, 10 en lugar de 1, 10, 2)
  function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }

  // Verificar si un archivo es imagen soportada y no basura de sistema / miniaturas
  function isImageFile(filename) {
    if (!/\.(jpe?g|png|webp|avif|gif)$/i.test(filename)) return false;
    const clean = filename.replace(/\\/g, '/');
    const parts = clean.split('/');
    // Descartar si alguna parte de la ruta empieza con '.' o pertenece a Mac OS / carpetas de miniaturas
    for (const part of parts) {
      if (part.startsWith('.') || part.toUpperCase() === '__MACOSX') return false;
      if (/^(\.thumbnails|thumbnails|thumbs|\.thumbs|metadata)$/i.test(part)) return false;
    }
    const baseName = parts[parts.length - 1].toLowerCase();
    if (/^(thumbs\.db|desktop\.ini|ehthumbs\.db|cover_thumb\..*|.*_thumb\..*)$/i.test(baseName)) return false;
    return true;
  }

  // Obtener dimensiones reales y peso de un Blob de imagen
  function getImageDimensions(blob) {
    return new Promise((resolve) => {
      if (!blob) return resolve({ width: 0, height: 0, size: 0 });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h, size: blob.size || 0 });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0, size: blob.size || 0 });
      };
      img.src = url;
    });
  }

  // Detectar si la primera imagen es una portada extra de baja calidad / miniatura redundante
  function isExtraLowQualityCover(info0, name0, info1, name1, mokuroJson = null) {
    const clean0 = (name0 || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
    const clean1 = (name1 || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();

    // 1. Si hay archivo .mokuro: Mokuro ya procesó y ordenó la lista exacta de páginas reales
    if (mokuroJson && Array.isArray(mokuroJson.pages) && mokuroJson.pages.length > 0) {
      const mokuroFirst = (mokuroJson.pages[0].img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
      const inMokuro0 = mokuroJson.pages.some(p => (p.img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase() === clean0);
      const isMokuroFirst1 = clean1 === mokuroFirst;

      // Si la primera imagen no estaba en Mokuro y la segunda es la verdadera primera página de Mokuro
      if (!inMokuro0 && isMokuroFirst1) {
        return true;
      }
    }

    // 2. Comprobar nombres típicos de portada extra / miniatura
    const isCoverOrThumbName0 = /^(!|_|000?_)?(cover|thumb|thumbnail|folder|preview|small)/i.test(clean0);
    const isNumberedPage1 = /^(000|001|01|1|p001|p01|page[_\-]?0*1)/i.test(clean1) || !isNaN(parseInt(clean1.replace(/\.[^/.]+$/, ''), 10));

    if (isCoverOrThumbName0 && isNumberedPage1) {
      if (info0 && info1 && info0.width > 0 && info1.width > 0) {
        // Descartar si la primera es notablemente más pequeña en resolución o tamaño
        if (info0.width < info1.width * 0.85 || info0.size < info1.size * 0.5) {
          return true;
        }
      } else {
        return true;
      }
    }

    // 3. Comprobar por resolución y peso incluso sin nombre "cover" explícito (ej: thumbnail 000.jpg de 300x450 frente a 001.jpg de 1400x2000)
    if (info0 && info1 && info0.width > 0 && info1.width > 0) {
      const isMuchLowerRes = info0.width < 750 && info1.width >= 950 && (info0.width * info0.height < (info1.width * info1.height) * 0.55);
      const isMuchSmallerSize = info0.size > 0 && info1.size > 0 && (info0.size < info1.size * 0.35);

      if (isMuchLowerRes && (isCoverOrThumbName0 || isMuchSmallerSize)) {
        return true;
      }
    }

    return false;
  }

  // Descomprimir y procesar un archivo CBZ o ZIP
  async function processCbzOrZipFile(file, customTitle = '', customVolume = '', progressCallback, externalMokuroJson = null) {
    if (typeof JSZip === 'undefined') {
      throw new Error('La librería JSZip no está disponible. Asegúrate de que js/jszip.min.js esté cargada.');
    }

    if (progressCallback) progressCallback(5, 'Leyendo archivo comprimido...');

    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);

    if (progressCallback) progressCallback(25, 'Explorando páginas e información OCR...');

    let mokuroJson = externalMokuroJson || null;
    let mokuroFilename = null;
    const imageEntries = [];

    // Buscar archivos de imagen y archivos .mokuro / json dentro del zip
    zipData.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;

      const lower = relativePath.toLowerCase();
      if ((lower.endsWith('.mokuro') || lower.endsWith('.json')) && !lower.includes('__macosx')) {
        mokuroFilename = relativePath;
      } else if (isImageFile(relativePath)) {
        imageEntries.push(relativePath);
      }
    });

    if (imageEntries.length === 0) {
      throw new Error('El archivo CBZ/ZIP no contiene imágenes legibles.');
    }

    // Ordenar páginas numéricamente
    imageEntries.sort(naturalSort);

    // Si tiene archivo mokuro interno y no se pasó uno externo, leerlo
    if (mokuroFilename && !mokuroJson) {
      try {
        const mokuroText = await zipData.file(mokuroFilename).async('string');
        mokuroJson = JSON.parse(mokuroText);
      } catch (e) {
        console.warn('No se pudo parsear el archivo mokuro interno:', e);
      }
    }

    // Detectar y descartar portada redundante de baja calidad si existe
    if (imageEntries.length > 1) {
      try {
        const entry0 = imageEntries[0];
        const entry1 = imageEntries[1];
        const blob0 = await zipData.file(entry0).async('blob');
        const blob1 = await zipData.file(entry1).async('blob');
        const dim0 = await getImageDimensions(blob0);
        const dim1 = await getImageDimensions(blob1);

        if (isExtraLowQualityCover(dim0, entry0, dim1, entry1, mokuroJson)) {
          console.log(`[ToriiManga] Portada extra de baja calidad omitida: ${entry0} (${dim0.width}x${dim0.height}). Portada real de alta calidad adoptada: ${entry1} (${dim1.width}x${dim1.height})`);
          imageEntries.shift();
        }
      } catch (errCover) {
        console.warn('Aviso comprobando dimensiones de portada inicial:', errCover);
      }
    }

    if (progressCallback) progressCallback(45, 'Extrayendo páginas del manga...');

    // Convertir imágenes en Blobs y URLs
    const pages = [];
    const imageBlobs = new Map();
    let coverDataUrl = '';

    const totalImages = imageEntries.length;
    for (let i = 0; i < totalImages; i++) {
      const entryName = imageEntries[i];
      const blob = await zipData.file(entryName).async('blob');
      const filename = entryName.replace(/\\/g, '/').split('/').pop().trim();
      imageBlobs.set(filename, blob);

      // Si es la primera imagen, guardarla como portada
      if (i === 0) {
        coverDataUrl = await blobToDataUrl(blob);
      }

      // Si tenemos datos de Mokuro para esta página, buscarlos
      let pageData = null;
      if (mokuroJson && mokuroJson.pages) {
        const fnLower = filename.toLowerCase();
        pageData = mokuroJson.pages.find(p => {
          const pName = (p.img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
          return pName === fnLower;
        });
      }

      if (pageData) {
        pages.push({
          img_path: filename,
          img_width: pageData.img_width || 800,
          img_height: pageData.img_height || 1200,
          blocks: pageData.blocks || []
        });
      } else {
        // Página sin datos OCR (manga normal)
        pages.push({
          img_path: filename,
          img_width: 800,
          img_height: 1200,
          blocks: []
        });
      }

      if (progressCallback && i % 5 === 0) {
        const pct = 45 + Math.round((i / totalImages) * 45);
        progressCallback(pct, `Cargando página ${i + 1} de ${totalImages}...`);
      }
    }

    const defaultTitle = file.name.replace(/\.(cbz|zip)$/i, '');
    const mangaId = 'manga_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const mangaRecord = {
      id: mangaId,
      title: customTitle.trim() || (mokuroJson && mokuroJson.title) || defaultTitle,
      volume: customVolume.trim() || (mokuroJson && mokuroJson.volume) || 'Volumen 1',
      format: file.name.toLowerCase().endsWith('.cbz') ? 'CBZ' : 'ZIP',
      hasOcr: !!mokuroJson,
      totalPages: pages.length,
      lastPageRead: 0,
      addedAt: Date.now(),
      coverDataUrl: coverDataUrl,
      pages: pages,
      // Almacenamos ArrayBuffer para compatibilidad total con IndexedDB en todos los navegadores
      fileBlob: await file.arrayBuffer()
    };

    if (progressCallback) progressCallback(95, 'Guardando en tu biblioteca local...');

    await saveMangaToDB(mangaRecord);

    const sessionUrls = new Map();
    for (const [fn, blob] of imageBlobs.entries()) {
      const url = URL.createObjectURL(blob);
      sessionUrls.set(fn, url);
      sessionUrls.set(fn.toLowerCase(), url);
    }
    loadedSessionMangaUrls.set(mangaId, sessionUrls);

    if (progressCallback) progressCallback(100, '¡Manga añadido con éxito!');

    return mangaRecord;
  }

  // Convertir Blob a DataURL (para portadas en miniaturas)
  function blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // Cuadro de diálogo para cambiar la portada por una imagen personalizada
  function promptChangeCover(mangaId, onDone) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp, image/avif';
    input.style.display = 'none';

    input.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        if (typeof mostrarToast === 'function') {
          mostrarToast('🖼️ Actualizando portada...');
        }
        const dataUrl = await blobToDataUrl(file);
        await updateMangaCover(mangaId, dataUrl);
        if (typeof onDone === 'function') {
          onDone(dataUrl);
        }
        if (typeof mostrarToast === 'function') {
          mostrarToast('✅ Portada personalizada actualizada con éxito');
        }
      } catch (err) {
        console.error('Error al actualizar portada:', err);
        alert('Error al actualizar la portada: ' + err.message);
      }
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => input.remove(), 60000);
  }

  // Caché en memoria para mangas abiertos en esta sesión
  const loadedSessionMangaUrls = new Map();

  // Cargar un manga guardado directamente en MokuroReader
  async function launchMangaFromDB(mangaId, seriesContext = null) {
    const manga = await getMangaById(mangaId);
    if (!manga) {
      alert('No se encontró el manga solicitado en la base de datos.');
      return;
    }

    // Comprobar y sanear portada extra de baja calidad en mangas ya guardados
    if (manga.pages && manga.pages.length > 1) {
      const p0Name = (manga.pages[0].img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
      const p1Name = (manga.pages[1].img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
      const p0IsCover = /^(!|_|000?_)?(cover|thumb|thumbnail|folder|preview|small)/i.test(p0Name);
      const p1IsFirstPage = /^(000|001|01|1|p001|p01|page[_\-]?0*1)/i.test(p1Name) || !isNaN(parseInt(p1Name.replace(/\.[^/.]+$/, ''), 10));
      const p0NoOcrP1HasOcr = (!manga.pages[0].blocks || manga.pages[0].blocks.length === 0) && (manga.pages[1].blocks && manga.pages[1].blocks.length > 0);
      const p0SmallRes = manga.pages[0].img_width && manga.pages[1].img_width && (manga.pages[0].img_width < manga.pages[1].img_width * 0.75);

      if ((p0IsCover && p1IsFirstPage) || (p0IsCover && p0NoOcrP1HasOcr) || (p0SmallRes && p0IsCover)) {
        console.log(`[ToriiManga] Saneando portada extra de baja calidad en manga abierto: ${p0Name}`);
        manga.pages.shift();
        manga.totalPages = manga.pages.length;
        if (manga.lastPageRead > 0) manga.lastPageRead = Math.max(0, manga.lastPageRead - 1);
        saveMangaToDB(manga).catch(console.warn);
      }
    }

    // Helper: inyectar contexto de serie en el estado del lector
    function applySeriesContext(state) {
      if (seriesContext && seriesContext.volumes && seriesContext.volumes.length > 1) {
        state.seriesVolumes = seriesContext.volumes;
        state.currentVolumeIndex = seriesContext.volumes.findIndex(v => v.id === mangaId);
      } else {
        // Si no se pasa contexto, limpiar cualquier serie anterior
        state.seriesVolumes = [];
        state.currentVolumeIndex = -1;
      }
    }

    // Si ya tenemos las URLs en memoria de esta sesión, abrir al instante
    if (loadedSessionMangaUrls.has(mangaId)) {
      const state = MokuroReader.getState();
      state.imageUrls = loadedSessionMangaUrls.get(mangaId);
      state.manga = {
        id: manga.id,
        title: manga.title,
        volume: manga.volume,
        pages: manga.pages
      };
      state.currentPageIdx = manga.lastPageRead || 0;
      applySeriesContext(state);
      MokuroReader.open();
      return;
    }

    // Si tiene fileBlob (CBZ/ZIP), re-extraer los Object URLs de las imágenes
    if (manga.fileBlob && typeof JSZip !== 'undefined') {
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(manga.fileBlob);
        const imageUrls = new Map();

        // Mapear todas las entradas del zip en un solo recorrido O(N)
        const entryMap = new Map();
        zipData.forEach((path, entry) => {
          if (entry.dir) return;
          const clean = path.replace(/\\/g, '/');
          const base = clean.split('/').pop().trim().toLowerCase();
          entryMap.set(base, entry);
          entryMap.set(clean.toLowerCase(), entry);
        });

        for (let i = 0; i < manga.pages.length; i++) {
          const p = manga.pages[i];
          const rawName = p.img_path || '';
          const baseName = rawName.replace(/\\/g, '/').split('/').pop().trim();
          const baseLower = baseName.toLowerCase();

          const entry = entryMap.get(baseLower) || entryMap.get(rawName.toLowerCase());
          if (entry) {
            const blob = await entry.async('blob');
            const url = URL.createObjectURL(blob);
            imageUrls.set(rawName, url);
            imageUrls.set(baseName, url);
            imageUrls.set(baseLower, url);
          } else {
            console.warn(`No se encontró entrada en zip para: ${rawName}`);
          }
        }

        // Pasar al lector Mokuro
        const state = MokuroReader.getState();
        state.imageUrls = imageUrls;
        state.manga = {
          id: manga.id,
          title: manga.title,
          volume: manga.volume,
          pages: manga.pages
        };
        state.currentPageIdx = manga.lastPageRead || 0;
        applySeriesContext(state);
        MokuroReader.open();
        return;
      } catch (e) {
        console.error('Error al descomprimir manga para lectura:', e);
        alert('Error al abrir el manga: ' + e.message);
      }
    }

    // Si es demo o ya tiene URLs directas
    const state = MokuroReader.getState();
    state.manga = manga;
    state.currentPageIdx = manga.lastPageRead || 0;
    applySeriesContext(state);
    MokuroReader.open();
  }


  // ========================================================================
  // RENDERIZADO DE LA BIBLIOTECA PERSONAL EN LA PÁGINA
  // ========================================================================
  // ========================================================================
  // PROCESAMIENTO Y GUARDADO DE IMÁGENES SUELTAS O CARPETAS EN INDEXEDDB
  // ========================================================================
  async function processImageFiles(files, customTitle = '', customVolume = '', progressCallback, externalMokuroJson = null) {
    if (typeof JSZip === 'undefined') {
      throw new Error('La librería JSZip no está disponible.');
    }

    if (progressCallback) progressCallback(5, 'Analizando archivos...');

    const fileList = Array.from(files);
    let mokuroJson = externalMokuroJson || null;
    let detectedMokuroFilename = '';
    const imageFiles = [];

    // Detectar imágenes y archivos mokuro / json si vienen en el lote
    for (const f of fileList) {
      const name = f.name;
      const lower = name.toLowerCase();
      if ((lower.endsWith('.mokuro') || lower.endsWith('.json')) && !lower.includes('__macosx') && !name.startsWith('.')) {
        if (!mokuroJson) {
          try {
            const text = await f.text();
            mokuroJson = JSON.parse(text);
            detectedMokuroFilename = name;
          } catch (err) {
            console.warn('No se pudo parsear el archivo mokuro:', err);
          }
        }
      } else if (isImageFile(name)) {
        imageFiles.push(f);
      }
    }

    if (imageFiles.length === 0) {
      throw new Error('No se encontraron imágenes válidas (.jpg, .png, .webp, .avif).');
    }

    // Ordenar imágenes naturalmente
    imageFiles.sort((a, b) => naturalSort(a.name, b.name));

    // Detectar y descartar portada redundante de baja calidad si existe
    if (imageFiles.length > 1) {
      try {
        const f0 = imageFiles[0];
        const f1 = imageFiles[1];
        const dim0 = await getImageDimensions(f0);
        const dim1 = await getImageDimensions(f1);

        if (isExtraLowQualityCover(dim0, f0.name, dim1, f1.name, mokuroJson)) {
          console.log(`[ToriiManga] Portada extra de baja calidad omitida: ${f0.name} (${dim0.width}x${dim0.height}). Portada real adoptada: ${f1.name} (${dim1.width}x${dim1.height})`);
          imageFiles.shift();
        }
      } catch (errCover) {
        console.warn('Aviso comprobando dimensiones de portada inicial en imágenes sueltas:', errCover);
      }
    }

    if (progressCallback) progressCallback(20, 'Empaquetando imágenes para almacenamiento local...');

    // Empaquetar en un zip interno para almacenamiento consistente y eficiente en IndexedDB
    const zip = new JSZip();
    const pages = [];
    const imageBlobs = new Map();
    let coverDataUrl = '';

    const totalImages = imageFiles.length;
    for (let i = 0; i < totalImages; i++) {
      const imgFile = imageFiles[i];
      const filename = imgFile.name.replace(/\\/g, '/').split('/').pop().trim();
      const blob = imgFile;
      zip.file(filename, blob);
      imageBlobs.set(filename, blob);

      if (i === 0) {
        coverDataUrl = await blobToDataUrl(blob);
      }

      // Asociar datos de Mokuro si existen
      let pageData = null;
      if (mokuroJson && mokuroJson.pages) {
        const fnLower = filename.toLowerCase();
        pageData = mokuroJson.pages.find(p => {
          const pName = (p.img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
          return pName === fnLower;
        });
      }

      if (pageData) {
        pages.push({
          img_path: filename,
          img_width: pageData.img_width || 800,
          img_height: pageData.img_height || 1200,
          blocks: pageData.blocks || []
        });
      } else {
        pages.push({
          img_path: filename,
          img_width: 800,
          img_height: 1200,
          blocks: []
        });
      }

      if (progressCallback && i % 5 === 0) {
        const pct = 20 + Math.round((i / totalImages) * 45);
        progressCallback(pct, `Cargando imagen ${i + 1} de ${totalImages}...`);
      }
    }

    if (mokuroJson) {
      zip.file(detectedMokuroFilename || 'manga.mokuro', JSON.stringify(mokuroJson));
    }

    if (progressCallback) progressCallback(70, 'Comprimiendo tomo en almacenamiento local...');
    const zipBlob = await zip.generateAsync({ type: 'arraybuffer', compression: 'STORE' }, (meta) => {
      if (progressCallback) progressCallback(70 + Math.round(meta.percent * 0.2), 'Guardando manga local...');
    });

    // Determinar nombre predeterminado
    let defaultName = 'Manga Local';
    if (fileList[0].webkitRelativePath) {
      defaultName = fileList[0].webkitRelativePath.split('/')[0];
    } else if (imageFiles[0]) {
      defaultName = imageFiles[0].name.replace(/\.[^/.]+$/, '').replace(/[\-_0-9]+$/, '').trim() || 'Manga';
    }

    const mangaId = 'manga_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const mangaRecord = {
      id: mangaId,
      title: customTitle.trim() || (mokuroJson && mokuroJson.title) || defaultName,
      volume: customVolume.trim() || (mokuroJson && mokuroJson.volume) || 'Tomo 1',
      format: 'Imágenes',
      hasOcr: !!mokuroJson,
      totalPages: pages.length,
      lastPageRead: 0,
      addedAt: Date.now(),
      coverDataUrl: coverDataUrl,
      pages: pages,
      fileBlob: zipBlob
    };

    if (progressCallback) progressCallback(95, 'Guardando en tu biblioteca local...');
    await saveMangaToDB(mangaRecord);

    // Guardar URLs de sesión
    const sessionUrls = new Map();
    for (const [fn, blob] of imageBlobs.entries()) {
      const url = URL.createObjectURL(blob);
      sessionUrls.set(fn, url);
      sessionUrls.set(fn.toLowerCase(), url);
    }
    loadedSessionMangaUrls.set(mangaId, sessionUrls);

    if (progressCallback) progressCallback(100, '¡Carpeta guardada en biblioteca con éxito!');
    return mangaRecord;
  }

  // ========================================================================
  // SUBIR Y VINCULAR ARCHIVO .MOKURO A UN MANGA YA GUARDADO
  // ========================================================================
  async function attachMokuroToManga(mangaId, mokuroFile) {
    const manga = await getMangaById(mangaId);
    if (!manga) {
      alert('No se encontró el manga en la biblioteca.');
      return false;
    }

    try {
      const text = await mokuroFile.text();
      const mokuroJson = JSON.parse(text);

      if (!mokuroJson.pages || !Array.isArray(mokuroJson.pages)) {
        throw new Error('El archivo .mokuro no contiene una lista válida de páginas.');
      }

      // Vincular bloques a cada página existente
      let matchedPages = 0;
      manga.pages.forEach(p => {
        const pFile = (p.img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
        const mPage = mokuroJson.pages.find(mp => {
          const mpFile = (mp.img_path || '').replace(/\\/g, '/').split('/').pop().trim().toLowerCase();
          return mpFile === pFile;
        });

        if (mPage) {
          p.blocks = mPage.blocks || [];
          p.img_width = mPage.img_width || p.img_width || 800;
          p.img_height = mPage.img_height || p.img_height || 1200;
          matchedPages++;
        }
      });

      manga.hasOcr = true;
      if (mokuroJson.title && (!manga.title || manga.title === 'Manga Local')) {
        manga.title = mokuroJson.title;
      }
      if (mokuroJson.volume && (!manga.volume || manga.volume === 'Tomo 1')) {
        manga.volume = mokuroJson.volume;
      }

      await saveMangaToDB(manga);
      renderMyMangasGrid();

      if (typeof mostrarToast === 'function') {
        mostrarToast(`✨ ¡OCR vinculado con éxito! (${matchedPages} páginas sincronizadas)`);
      }
      return true;
    } catch (e) {
      console.error('Error al vincular Mokuro:', e);
      alert('Error al leer el archivo .mokuro: ' + e.message);
      return false;
    }
  }

  // ========================================================================
  // AYUDA PARA GENERAR .MOKURO CON EL SCRIPT / CLI
  // ========================================================================
  function showGenerateMokuroModal(mangaTitle = '') {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay-manga active';
    modal.innerHTML = `
      <div class="modal-content-manga" style="max-width: 580px;">
        <div class="modal-header-manga">
          <h3><span>⚡</span> Generar archivo .mokuro con OCR</h3>
          <button class="modal-close-btn-manga" onclick="this.closest('.modal-overlay-manga').remove()">&times;</button>
        </div>
        <p style="font-size:0.92rem; color:#666; line-height:1.5; margin:0 0 16px;">
          Para extraer globos de diálogo y texto en japonés de <strong>${escapeHtml(mangaTitle || 'tu manga')}</strong>, ejecuta el motor de <strong>Mokuro</strong> incluido en este proyecto:
        </p>
        
        <div style="background: rgba(0,0,0,0.03); border-radius:12px; padding:15px; border:1px solid var(--mokuro-border); margin-bottom:15px;">
          <h4 style="margin:0 0 8px; font-size:0.95rem;">Opción 1: Ejecutar con Python (Terminal)</h4>
          <div class="terminal-box" style="margin-bottom:8px;">
            <code>mokuro "C:\\Ruta\\A\\Tu\\Manga"</code>
            <button class="terminal-copy-btn" data-cmd='mokuro "C:\\Ruta\\A\\Tu\\Manga"'>Copiar</button>
          </div>
          <small style="color:#777; font-size:0.8rem;">
            Se generará automáticamente un archivo <code>.mokuro</code> dentro de la carpeta del tomo.
          </small>
        </div>

        <div style="background: rgba(19, 162, 206, 0.08); border-left:4px solid var(--azulNa, #13a2ce); padding:12px 16px; border-radius:8px; margin-bottom:20px;">
          <p style="margin:0; font-size:0.88rem; line-height:1.5;">
            <strong>💡 Una vez generado:</strong> Haz clic en el botón <strong>"📎 Vincular .mokuro"</strong> en la tarjeta de este manga para cargar el archivo y activar la selección interactiva con Yomitan y Anki.
          </p>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn-upload-choice" onclick="this.closest('.modal-overlay-manga').remove()">
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const copyBtn = modal.querySelector('.terminal-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const cmd = copyBtn.getAttribute('data-cmd');
        navigator.clipboard.writeText(cmd).then(() => {
          copyBtn.textContent = '¡Copiado!';
          setTimeout(() => copyBtn.textContent = 'Copiar', 2000);
        });
      });
    }
  }

  // Extraer nombre limpio y unificado de la serie (ej: 'Naruto 01', 'Naruto v02', 'Naruto - Tomo 3' -> 'Naruto')
  function getSeriesKey(title) {
    if (!title) return 'Manga';
    let clean = String(title).trim();

    // 1. Quitar tags de scanlation/edición al inicio o final: [ScanGroup], (Digital), [1080p], etc.
    clean = clean.replace(/^\[[^\]]+\]\s*/g, '');
    clean = clean.replace(/\s*\[(?:digital|official|scan|raw|jp|esp|español|eng|english|c2c|1080p|720p)[^\]]*\]/gi, '');
    clean = clean.replace(/\s*\((?:digital|official|scan|raw|jp|esp|español|eng|english|c2c)[^\)]*\)/gi, '');

    // 2. Quitar extensiones si estuvieran presentes
    clean = clean.replace(/\.(cbz|zip|pdf|cbr|rar)$/i, '');

    // 3. Quitar patrones con palabras de volumen/capítulo: 'vol. 1', 'v01', 'tomo 2', 'volume 3', 'ch. 4', 'cap 5', etc.
    clean = clean.replace(/[-_–—]\s*(?:tomo|volumen|volume|vol|v|ch|cap|chapter|capitulo)\.?\s*#?\d+/gi, '');
    clean = clean.replace(/\b(?:tomo|volumen|volume|vol|v|ch|cap|chapter|capitulo)\.?\s*#?\d+\b/gi, '');

    // 4. Quitar números entre corchetes o paréntesis: [01], (01), [#01], (v01)
    clean = clean.replace(/\[\s*(?:tomo|vol|volume|v)?\.?\s*#?\d+\s*\]/gi, '');
    clean = clean.replace(/\(\s*(?:tomo|vol|volume|v)?\.?\s*#?\d+\s*\)/gi, '');

    // 5. Quitar números sueltos precedidos de guion, guion bajo o espacio al final (ej: 'Naruto - 01', 'Naruto_01', 'Naruto 01')
    clean = clean.replace(/[-_–—]\s*#?\d+\s*$/g, '');
    clean = clean.replace(/\s+#?\d+\s*$/g, '');

    // 6. Limpiar separadores sobrantes al final
    clean = clean.replace(/[-_–—\s:#]+$/g, '').trim();

    return clean || title.trim();
  }

  // Deducir etiqueta legible de volumen (ej: 'Tomo 1', 'Tomo 2') para ordenar y mostrar
  function extractVolumeLabel(manga) {
    if (!manga) return 'Tomo 1';
    if (manga.volume && manga.volume !== 'Volumen 1' && manga.volume !== 'Tomo 1' && manga.volume !== 'Manga') {
      return manga.volume;
    }
    const title = manga.title || '';
    const match = title.match(/(?:tomo|volumen|volume|vol|v|ch|cap)\.?\s*#?(\d+)/i) ||
                  title.match(/[\[\(]\s*(?:tomo|vol|v)?\.?\s*#?(\d+)\s*[\]\)]/i) ||
                  title.match(/[-_–—\s]#?(\d+)\s*$/) ||
                  title.match(/\b#?(\d+)\b$/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      return `Tomo ${num}`;
    }
    return manga.volume || 'Tomo 1';
  }

  // ========================================================================
  // RENDERIZADO DE LA BIBLIOTECA PERSONAL EN LA PÁGINA (AGRUPADA POR SERIE)
  // ========================================================================
  async function renderMyMangasGrid() {
    const grid = document.getElementById('my-mangas-grid');
    const emptyNotice = document.getElementById('empty-mangas-notice');
    if (!grid) return;

    const mangas = await getAllMangasFromDB();

    // Limpiar cuadrícula
    const existingCards = grid.querySelectorAll('.manga-card-user');
    existingCards.forEach(c => c.remove());

    if (mangas.length === 0) {
      if (emptyNotice) emptyNotice.style.display = 'block';
      return;
    } else {
      if (emptyNotice) emptyNotice.style.display = 'none';
    }

    // Agrupar mangas por serie (clave insensible a mayúsculas y espacios duplicados)
    const seriesMap = new Map();
    mangas.forEach(m => {
      const seriesTitle = getSeriesKey(m.title);
      const groupKey = seriesTitle.toLowerCase().replace(/\s+/g, ' ');
      if (!seriesMap.has(groupKey)) {
        seriesMap.set(groupKey, {
          seriesTitle: seriesTitle,
          volumes: []
        });
      }
      seriesMap.get(groupKey).volumes.push(m);
    });

    // Ordenar los volúmenes dentro de cada serie
    for (const group of seriesMap.values()) {
      group.volumes.sort((a, b) => {
        const volA = extractVolumeLabel(a);
        const volB = extractVolumeLabel(b);
        return naturalSort(volA, volB) || naturalSort(a.title, b.title);
      });
    }

    // Convertir a array de series y ordenar por actividad más reciente
    const seriesList = Array.from(seriesMap.values()).map(group => {
      const { seriesTitle, volumes } = group;
      const latestActivity = Math.max(...volumes.map(v => v.lastReadAt || v.addedAt || 0));
      return {
        seriesTitle,
        volumes,
        latestActivity
      };
    });

    seriesList.sort((a, b) => b.latestActivity - a.latestActivity);

    // Renderizar cada serie
    seriesList.forEach(series => {
      const { seriesTitle, volumes } = series;
      const volCount = volumes.length;
      const firstVol = volumes[0];

      // Calcular páginas totales y progreso combinado de la serie
      const totalPagesAll = volumes.reduce((acc, v) => acc + (v.totalPages || 0), 0);
      const totalPagesRead = volumes.reduce((acc, v) => acc + (v.lastPageRead || 0), 0);
      const readPct = totalPagesAll > 0 ? Math.round((totalPagesRead / totalPagesAll) * 100) : 0;

      // Portada al frente = el tomo más recientemente leído (lastReadAt)
      // Si ninguno se ha leído aún, usar el primero de la lista
      const currentVol = volumes.reduce((best, v) =>
        (v.lastReadAt || 0) > (best.lastReadAt || 0) ? v : best
      , volumes[0]);

      // Los demás tomos van detrás, en orden de volumen pero sin el actual
      const otherVols = volumes.filter(v => v.id !== currentVol.id);
      const fallback = 'image/logonnt.png';

      // Generar capas para la presentación en pila / abanico
      let stackHtml = '';
      if (volCount >= 3) {
        stackHtml = `
          <img src="${(otherVols[1] || otherVols[0] || currentVol).coverDataUrl || fallback}" alt="Tomo" class="manga-stack-layer layer-2">
          <img src="${(otherVols[0] || currentVol).coverDataUrl || fallback}" alt="Tomo" class="manga-stack-layer layer-1">
          <img src="${currentVol.coverDataUrl || fallback}" alt="${extractVolumeLabel(currentVol)}" class="manga-stack-layer layer-0">
        `;
      } else if (volCount === 2) {
        stackHtml = `
          <img src="${otherVols[0].coverDataUrl || fallback}" alt="Tomo" class="manga-stack-layer layer-1">
          <img src="${currentVol.coverDataUrl || fallback}" alt="${extractVolumeLabel(currentVol)}" class="manga-stack-layer layer-0">
        `;
      } else {
        stackHtml = `
          <img src="${currentVol.coverDataUrl || fallback}" alt="Portada" class="manga-stack-layer layer-0">
        `;
      }

      // Tomo objetivo para continuar y texto del botón
      const targetVol = currentVol || firstVol;
      const targetVolLabel = extractVolumeLabel(targetVol);
      const isStarted = (targetVol.lastPageRead || 0) > 0;
      const btnIcon = isStarted ? '▶️' : '📖';
      const btnText = isStarted 
        ? (volCount > 1 ? `Continuar ${escapeHtml(targetVolLabel)}` : 'Continuar leyendo')
        : (volCount > 1 ? `Leer ${escapeHtml(targetVolLabel)}` : 'Leer manga');

      const card = document.createElement('div');
      card.className = 'manga-card manga-card-user';

      card.innerHTML = `
        <div class="manga-stack-container" title="Haz clic en la portada para ver los tomos de ${escapeHtml(seriesTitle)}">
          ${stackHtml}
        </div>

        <div class="manga-body">
          <h3 class="manga-card-title">${escapeHtml(seriesTitle)}</h3>
          <span class="manga-card-jp-title btn-trigger-series" style="${volCount > 1 ? 'cursor:pointer; text-decoration:underline;' : ''}" title="${volCount > 1 ? 'Ver todos los tomos' : ''}">${volCount > 1 ? `📚 ${volCount} tomos guardados (ver lista)` : escapeHtml(targetVolLabel)}</span>

          <div style="margin: 6px 0 12px;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#777; margin-bottom:4px;">
              <span>${volCount > 1 ? 'Lectura total de la serie' : `Pág. ${firstVol.lastPageRead + 1} de ${firstVol.totalPages}`}</span>
              <span><strong>${readPct}%</strong></span>
            </div>
            <div style="height:6px; background:rgba(0,0,0,0.1); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${readPct}%; background:var(--azulNa, #13a2ce); border-radius:3px;"></div>
            </div>
          </div>

          <div style="display:flex; gap:8px; margin-top:auto;">
            <button class="manga-btn-read btn-continue-manga" style="flex:1;" title="Abrir y continuar leyendo">
              <span>${btnIcon} ${btnText}</span>
            </button>
            <button class="btn-delete-manga btn-delete-series" title="Eliminar serie completa" aria-label="Eliminar serie">
              🗑️
            </button>
          </div>
        </div>
      `;

      // Clic en la portada apilada o en el texto de tomos abre el modal de volúmenes
      const stackCover = card.querySelector('.manga-stack-container');
      const seriesTrigger = card.querySelector('.btn-trigger-series');
      const handleOpenSeries = () => openSeriesVolumesModal(seriesTitle, volumes);
      if (stackCover) stackCover.addEventListener('click', handleOpenSeries);
      if (seriesTrigger && volCount > 1) seriesTrigger.addEventListener('click', handleOpenSeries);

      // Botón principal: abre directamente el último manga leído para continuar la lectura
      const btnContinue = card.querySelector('.btn-continue-manga');
      if (btnContinue) {
        btnContinue.addEventListener('click', (e) => {
          e.stopPropagation();
          launchMangaFromDB(targetVol.id, { volumes });
        });
      }

      // Eliminar toda la serie o sus tomos
      const btnDeleteSeries = card.querySelector('.btn-delete-series');
      if (btnDeleteSeries) {
        btnDeleteSeries.addEventListener('click', async (e) => {
          e.stopPropagation();
          const confirmMsg = volCount > 1 
            ? `¿Eliminar la serie "${seriesTitle}" y sus ${volCount} volúmenes de tu biblioteca?`
            : `¿Eliminar "${seriesTitle}" de tu biblioteca?`;

          if (confirm(confirmMsg)) {
            for (const v of volumes) {
              await deleteMangaFromDB(v.id);
            }
            renderMyMangasGrid();
            if (typeof mostrarToast === 'function') mostrarToast('🗑️ Manga eliminado de la biblioteca');
          }
        });
      }

      grid.appendChild(card);
    });
  }

  // ========================================================================
  // MODAL DE SELECCIÓN DE VOLÚMENES / TOMOS DE UNA SERIE
  // ========================================================================
  function openSeriesVolumesModal(seriesTitle, volumes) {
    const modal = document.getElementById('modal-select-volume');
    const titleEl = document.getElementById('modal-series-title');
    const countEl = document.getElementById('modal-series-count');
    const gridEl = document.getElementById('series-volumes-grid');
    const btnClose = document.getElementById('btn-close-volume-modal');

    if (!modal || !gridEl) return;

    if (titleEl) titleEl.innerHTML = `<span>📚</span> ${escapeHtml(seriesTitle)}`;
    if (countEl) countEl.textContent = `${volumes.length} ${volumes.length === 1 ? 'volumen disponible' : 'volúmenes disponibles'}`;

    gridEl.innerHTML = '';

    volumes.forEach(vol => {
      const volCard = document.createElement('div');
      volCard.className = 'volume-card-item';

      const readPct = vol.totalPages > 0 
        ? Math.round(((vol.lastPageRead + 1) / vol.totalPages) * 100) 
        : 0;

      volCard.innerHTML = `
        <div class="volume-thumb-wrap" title="Cambiar portada de este volumen">
          <img src="${vol.coverDataUrl || 'image/logonnt.png'}" alt="${escapeHtml(extractVolumeLabel(vol))}" class="volume-thumb">
          <button class="btn-cover-thumb-overlay" title="Cambiar portada">📷</button>
        </div>
        <div class="volume-body">
          <h4 class="volume-title">${escapeHtml(extractVolumeLabel(vol))}</h4>
          <span class="volume-meta">Progreso: Pág. ${vol.lastPageRead + 1} de ${vol.totalPages} (${readPct}%)</span>

          <div style="height:5px; background:rgba(0,0,0,0.1); border-radius:3px; overflow:hidden; margin-bottom:12px;">
            <div style="height:100%; width:${readPct}%; background:var(--azulNa, #13a2ce); border-radius:3px;"></div>
          </div>

          ${!vol.hasOcr ? `
            <div style="display:flex; gap:6px; margin-bottom:10px;">
              <button class="btn-attach-mokuro-vol" data-id="${vol.id}" title="Vincular archivo .mokuro" style="flex:1; padding:5px 8px; font-size:0.78rem; background:rgba(19,162,206,0.1); border:1px solid rgba(19,162,206,0.3); border-radius:6px; cursor:pointer; color:var(--azulNa, #13a2ce); font-weight:700;">
                📎 .mokuro
              </button>
              <button class="btn-gen-mokuro-vol" data-title="${escapeHtml(vol.title)}" title="Generar OCR" style="padding:5px 8px; font-size:0.78rem; background:rgba(229,57,53,0.08); border:1px solid rgba(229,57,53,0.25); border-radius:6px; cursor:pointer; color:#e53935; font-weight:700;">
                ⚡ Guía
              </button>
            </div>
          ` : ''}

          <div style="display:flex; gap:6px; margin-top:auto;">
            <button class="manga-btn-read btn-read-volume" style="flex:1; padding:8px 12px; font-size:0.88rem;">
              <span>${vol.lastPageRead > 0 ? '▶️ Continuar' : '📖 Leer'}</span>
            </button>
            <button class="btn-delete-manga btn-delete-single-vol" data-id="${vol.id}" title="Eliminar este volumen" style="width:34px; height:34px;">
              🗑️
            </button>
          </div>
        </div>
      `;

      // Evento cambiar portada de este tomo específico con el botón de cámara
      const handleVolCoverChange = (e) => {
        e.stopPropagation();
        promptChangeCover(vol.id, (newDataUrl) => {
          vol.coverDataUrl = newDataUrl;
          const imgThumb = volCard.querySelector('.volume-thumb');
          if (imgThumb) imgThumb.src = newDataUrl;
          renderMyMangasGrid();
        });
      };

      const btnCamera = volCard.querySelector('.btn-cover-thumb-overlay');
      if (btnCamera) btnCamera.addEventListener('click', handleVolCoverChange);

      // Clic en la portada → abrir el manga directamente
      const thumbWrap = volCard.querySelector('.volume-thumb-wrap');
      if (thumbWrap) {
        thumbWrap.style.cursor = 'pointer';
        thumbWrap.title = 'Clic para leer este volumen';
        thumbWrap.addEventListener('click', (e) => {
          // Si el clic fue en el botón de cámara, no abrir el lector
          if (e.target.closest('.btn-cover-thumb-overlay')) return;
          modal.classList.remove('active');
          launchMangaFromDB(vol.id, { volumes });
        });
      }

      // Evento leer este volumen específico
      const btnRead = volCard.querySelector('.btn-read-volume');
      btnRead.addEventListener('click', () => {
        modal.classList.remove('active');
        launchMangaFromDB(vol.id, { volumes });
      });

      // Evento vincular mokuro a este tomo
      const btnAttach = volCard.querySelector('.btn-attach-mokuro-vol');
      if (btnAttach) {
        btnAttach.addEventListener('click', (e) => {
          e.stopPropagation();
          const inputAttach = document.getElementById('input-attach-mokuro');
          if (inputAttach) {
            inputAttach.onchange = async (ev) => {
              const file = ev.target.files[0];
              if (file) {
                await attachMokuroToManga(vol.id, file);
                modal.classList.remove('active');
                renderMyMangasGrid();
              }
              inputAttach.value = '';
            };
            inputAttach.click();
          }
        });
      }

      // Evento de ayuda mokuro
      const btnGen = volCard.querySelector('.btn-gen-mokuro-vol');
      if (btnGen) {
        btnGen.addEventListener('click', (e) => {
          e.stopPropagation();
          showGenerateMokuroModal(vol.title);
        });
      }

      // Evento eliminar tomo individual
      const btnDelVol = volCard.querySelector('.btn-delete-single-vol');
      btnDelVol.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`¿Eliminar "${vol.volume || vol.title}" de tu biblioteca?`)) {
          await deleteMangaFromDB(vol.id);
          const updatedVolumes = volumes.filter(v => v.id !== vol.id);
          if (updatedVolumes.length > 0) {
            openSeriesVolumesModal(seriesTitle, updatedVolumes);
          } else {
            modal.classList.remove('active');
          }
          renderMyMangasGrid();
          if (typeof mostrarToast === 'function') mostrarToast('🗑️ Volumen eliminado');
        }
      });

      gridEl.appendChild(volCard);
    });

    modal.classList.add('active');

    if (btnClose) {
      btnClose.onclick = () => modal.classList.remove('active');
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // ========================================================================
  // INICIALIZACIÓN DE MODAL DE CARGA UNIFICADO (CBZ, ZIP, CARPETA)
  // ========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    renderMyMangasGrid();

    // Sincronizar progreso cuando se cambia de página en el visor
    window.addEventListener('beforeunload', () => {
      if (window.MokuroReader) {
        const s = window.MokuroReader.getState();
        if (s.manga && s.manga.id) {
          updateMangaProgress(s.manga.id, s.currentPageIdx);
        }
      }
    });

    // Elementos del Modal
    const modalAdd = document.getElementById('modal-add-manga');
    const btnHeroUpload = document.getElementById('btn-hero-upload-manga');
    const btnOpenAdd = document.getElementById('btn-open-add-manga-modal');
    const btnCloseAdd = document.getElementById('btn-close-add-modal');
    const trustNotice = document.getElementById('manga-trust-notice');
    const chkTrustSite = document.getElementById('chk-trust-site');
    const inputMedia = document.getElementById('input-manga-media');
    const inputMokuro = document.getElementById('input-manga-mokuro');
    const labelMediaCount = document.getElementById('manga-media-file-count');
    const labelMokuroName = document.getElementById('manga-mokuro-file-name');
    const inputTitle = document.getElementById('input-manga-custom-title');
    const inputVolume = document.getElementById('input-manga-custom-volume');
    const noticeMokuro = document.getElementById('manga-mokuro-status-notice');
    const btnSubmitAdd = document.getElementById('btn-submit-add-manga');
    const progressWrap = document.getElementById('manga-import-progress-wrap');
    const progressBar = document.getElementById('manga-import-progress-bar');
    const progressStatus = document.getElementById('manga-import-status-text');

    const openModal = () => {
      if (modalAdd) {
        // Comprobar si ya confía en la página para el almacenamiento local
        const isTrusted = localStorage.getItem('torii_manga_trusted') === 'true';
        if (trustNotice) {
          trustNotice.style.display = isTrusted ? 'none' : 'block';
        }
        modalAdd.classList.add('active');
      }
    };

    if (btnHeroUpload) btnHeroUpload.addEventListener('click', openModal);
    if (btnOpenAdd) btnOpenAdd.addEventListener('click', openModal);
    if (btnCloseAdd && modalAdd) {
      btnCloseAdd.addEventListener('click', () => modalAdd.classList.remove('active'));
    }

    // Actualizar indicador al elegir archivos de manga (CBZ, ZIP o Imágenes)
    if (inputMedia) {
      inputMedia.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) {
          if (labelMediaCount) labelMediaCount.textContent = '';
          return;
        }

        if (files.length === 1) {
          const f = files[0];
          if (labelMediaCount) labelMediaCount.textContent = f.name;
          if (inputTitle && !inputTitle.value) {
            inputTitle.value = f.name.replace(/\.(cbz|zip|jpe?g|png|webp|avif)$/i, '');
          }
        } else {
          if (labelMediaCount) labelMediaCount.textContent = `(${files.length} imágenes seleccionadas)`;
          if (inputTitle && !inputTitle.value) {
            // Deducir título a partir del primer nombre de archivo
            const baseName = files[0].name.replace(/\.[^/.]+$/, '').replace(/[\-_0-9]+$/, '').trim();
            if (baseName) inputTitle.value = baseName;
          }
        }

        updateOcrNotice();
      });
    }

    // Actualizar indicador al elegir archivo .mokuro
    if (inputMokuro) {
      inputMokuro.addEventListener('change', (e) => {
        const file = (e.target.files || [])[0];
        if (file) {
          if (labelMokuroName) labelMokuroName.textContent = `✓ ${file.name}`;
        } else {
          if (labelMokuroName) labelMokuroName.textContent = '';
        }
        updateOcrNotice();
      });
    }

    function updateOcrNotice() {
      if (!noticeMokuro) return;
      const hasMokuroFile = inputMokuro && inputMokuro.files && inputMokuro.files.length > 0;
      const mediaFiles = inputMedia ? Array.from(inputMedia.files || []) : [];

      // Verificar si hay algún .cbz/.zip o si ya seleccionó mokuro
      const isZip = mediaFiles.length === 1 && /\.(cbz|zip)$/i.test(mediaFiles[0].name);

      if (hasMokuroFile) {
        noticeMokuro.style.display = 'block';
        noticeMokuro.style.background = 'rgba(46, 125, 50, 0.12)';
        noticeMokuro.style.border = '1px solid rgba(46, 125, 50, 0.3)';
        noticeMokuro.style.color = '#2e7d32';
        noticeMokuro.innerHTML = '⚡ <strong>¡Archivo .mokuro OCR listo!</strong> Se activará la selección interactiva de texto y búsqueda en Yomitan.';
      } else if (isZip) {
        noticeMokuro.style.display = 'block';
        noticeMokuro.style.background = 'rgba(19, 162, 206, 0.1)';
        noticeMokuro.style.border = '1px solid rgba(19, 162, 206, 0.3)';
        noticeMokuro.style.color = 'var(--azulNa, #13a2ce)';
        noticeMokuro.innerHTML = 'ℹ️ Si tu archivo .cbz/.zip ya contiene su archivo .mokuro dentro, se detectará automáticamente.';
      } else if (mediaFiles.length > 0) {
        noticeMokuro.style.display = 'block';
        noticeMokuro.style.background = 'rgba(230, 81, 0, 0.1)';
        noticeMokuro.style.border = '1px solid rgba(230, 81, 0, 0.3)';
        noticeMokuro.style.color = '#e65100';
        noticeMokuro.innerHTML = '📖 <strong>Sin archivo .mokuro:</strong> El manga se guardará y podrás leerlo perfectamente. Podrás vincular o generar su OCR en cualquier momento.';
      } else {
        noticeMokuro.style.display = 'none';
      }
    }

    // Botón de guardar manga
    if (btnSubmitAdd) {
      btnSubmitAdd.addEventListener('click', async () => {
        const mediaFiles = inputMedia ? Array.from(inputMedia.files || []) : [];
        if (mediaFiles.length === 0) {
          alert('Por favor selecciona al menos un archivo de manga (.cbz, .zip o imágenes).');
          return;
        }

        // Si el usuario marcó confiar en la página o ya confía, guardar en localStorage
        if (chkTrustSite && chkTrustSite.checked) {
          localStorage.setItem('torii_manga_trusted', 'true');
        }

        const customTitle = inputTitle ? inputTitle.value : '';
        const customVolume = inputVolume ? inputVolume.value : '';

        // Leer archivo .mokuro si se proporcionó
        let externalMokuroJson = null;
        if (inputMokuro && inputMokuro.files && inputMokuro.files.length > 0) {
          try {
            const mokuroFile = inputMokuro.files[0];
            const mokuroText = await mokuroFile.text();
            externalMokuroJson = JSON.parse(mokuroText);
          } catch (mErr) {
            console.warn('Error al procesar el archivo .mokuro externo:', mErr);
            alert('Aviso: No se pudo leer el archivo .mokuro seleccionado. El manga se procesará sin OCR.');
          }
        }

        btnSubmitAdd.disabled = true;
        if (progressWrap) progressWrap.style.display = 'block';

        try {
          const isSingleArchive = mediaFiles.length === 1 && /\.(cbz|zip)$/i.test(mediaFiles[0].name);

          if (isSingleArchive) {
            await processCbzOrZipFile(mediaFiles[0], customTitle, customVolume, (pct, status) => {
              if (progressBar) progressBar.style.width = `${pct}%`;
              if (progressStatus) progressStatus.textContent = status;
            }, externalMokuroJson);
          } else {
            // Múltiples imágenes o imágenes sueltas
            await processImageFiles(mediaFiles, customTitle, customVolume, (pct, status) => {
              if (progressBar) progressBar.style.width = `${pct}%`;
              if (progressStatus) progressStatus.textContent = status;
            }, externalMokuroJson);
          }

          setTimeout(() => {
            if (modalAdd) modalAdd.classList.remove('active');
            btnSubmitAdd.disabled = false;
            if (progressWrap) progressWrap.style.display = 'none';
            if (inputMedia) inputMedia.value = '';
            if (inputMokuro) inputMokuro.value = '';
            if (labelMediaCount) labelMediaCount.textContent = '';
            if (labelMokuroName) labelMokuroName.textContent = '';
            if (inputTitle) inputTitle.value = '';
            if (inputVolume) inputVolume.value = '';
            if (noticeMokuro) noticeMokuro.style.display = 'none';
            renderMyMangasGrid();
            if (typeof mostrarToast === 'function') {
              mostrarToast('✨ ¡Manga añadido exitosamente a tu biblioteca!');
            }
          }, 600);

        } catch (err) {
          console.error(err);
          alert('Error al guardar el manga: ' + err.message);
          btnSubmitAdd.disabled = false;
          if (progressWrap) progressWrap.style.display = 'none';
        }
      });
    }
  });

  // Exponer API global
  window.ToriiMangaDB = {
    saveManga: saveMangaToDB,
    getAllMangas: getAllMangasFromDB,
    getManga: getMangaById,
    updateProgress: updateMangaProgress,
    deleteManga: deleteMangaFromDB,
    processCbzOrZip: processCbzOrZipFile,
    processImageFiles: processImageFiles,
    processFolder: processImageFiles, // retrocompatibilidad
    attachMokuro: attachMokuroToManga,
    showGenerateHelp: showGenerateMokuroModal,
    openSeriesVolumes: openSeriesVolumesModal,
    launchManga: launchMangaFromDB,
    renderGrid: renderMyMangasGrid,
    updateCover: updateMangaCover,
    promptChangeCover: promptChangeCover,
    // Usado por el lector para continuar al siguiente tomo (preserva el contexto de serie)
    launch: function(mangaId) {
      const state = window.MokuroReader ? window.MokuroReader.getState() : null;
      const seriesCtx = (state && state.seriesVolumes && state.seriesVolumes.length > 1)
        ? { volumes: state.seriesVolumes }
        : null;
      launchMangaFromDB(mangaId, seriesCtx);
    }
  };

})();
