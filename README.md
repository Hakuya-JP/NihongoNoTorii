# Nihongo No Torii

Sitio estatico para aprender japones con tablas kana, lectura de manga, ToriiTV y simulacros JLPT.

## Deploy en Vercel

El proyecto se publica desde la raiz del repositorio con Vercel y la integracion de GitHub. La configuracion y el comando de build estan definidos en `vercel.json`; no hace falta instalar dependencias.

El build prepara `dist/` con las paginas y recursos del sitio, incluidos ambos conjuntos de diccionarios. Mantiene sus rutas relativas y deja fuera el codigo fuente de Mokuro y los archivos locales de desarrollo.

## Desarrollo local

Abre la carpeta con una extension de servidor estatico, como Live Server, y navega a `index.html`. Algunas funciones del navegador, como la importacion remota de catalogos, necesitan servir la pagina por HTTP en lugar de abrirla con `file://`.

## Mokuro

`tools/mokuro/` contiene la herramienta Python para procesar manga localmente. El lector de la web consume archivos `.mokuro` ya generados; el procesamiento OCR no se ejecuta en Vercel.
