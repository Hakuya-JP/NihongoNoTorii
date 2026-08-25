// ==========================================================================
// NIHONGO NO TORII - CARGADOR Y ARQUITECTURA MODULAR JS
// ==========================================================================
(function() {
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
    document.write(`<script src="${src}"></script>`);
  });
})();