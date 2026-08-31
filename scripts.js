// ==========================================================================
// NIHONGO NO TORII - CARGADOR Y ARQUITECTURA MODULAR JS
// ==========================================================================
(function() {
  // Detectar la ruta base relativa según la ubicación del script actual
  let basePath = "";
  if (document.currentScript) {
    const srcAttr = document.currentScript.getAttribute("src") || "";
    const lastSlash = srcAttr.lastIndexOf("/");
    if (lastSlash !== -1) {
      basePath = srcAttr.substring(0, lastSlash + 1);
    }
  }

  // Exponer basePath globalmente para recursos (audios BGM, imágenes, etc.)
  window.TORII_BASE_PATH = basePath;

  const modules = [
    "js/config-global.js",
    "js/interfaz-biblioteca.js",
    "js/toriitv-player.js",
    "js/anki-connect.js",
    "js/tarjetas-minadas.js",
    "js/rpg-system.js",
    "js/perfil-usuario.js",
    "js/certificados-jlpt.js",
    "js/kana-interactivo.js"
  ];

  modules.forEach(src => {
    const script = document.createElement("script");
    script.src = `${basePath}${src}`;
    script.async = false; // Descarga en paralelo y ejecuta en orden sin bloquear el DOM
    document.head.appendChild(script);
  });
})();