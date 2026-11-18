(function () {
  "use strict";
  // Los tours de Inicio, Curso y Laboratorio controlan sus propios destinos.
  // Este archivo solo conserva compatibilidad con páginas antiguas.
  window.addEventListener("orientationchange", function () {
    window.setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 100);
  });
}());
