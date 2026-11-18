(function () {
  "use strict";

  let lastWelcomeTitle = "";

  function fitTourGuides() {
    if (window.innerWidth > 700) return;

    const small = window.innerWidth <= 360;
    const edge = small ? 10 : 12;
    const welcomeGuide = document.querySelector("#jaguar-welcome .jaguar-guide");
    const welcomeImage = document.querySelector("#jaguar-welcome .jaguar-guide-image");
    const laboratoryGuide = document.querySelector("#laboratory-tour .jaguar-guide");
    const laboratoryImage = document.querySelector("#laboratory-tour .jaguar-guide-image");

    // El tour de Inicio lo controla exclusivamente welcome.js.

    if (welcomeImage) {
      welcomeImage.style.setProperty("left", "auto", "important");
      welcomeImage.style.setProperty("right", "10px", "important");
      welcomeImage.style.setProperty("bottom", "0", "important");
      welcomeImage.style.setProperty("width", (small ? "94px" : "112px"), "important");
      welcomeImage.style.setProperty("height", (small ? "94px" : "112px"), "important");
      welcomeImage.style.setProperty("max-height", (small ? "94px" : "112px"), "important");
    }

    if (laboratoryGuide) {
      const topPosition = laboratoryGuide.classList.contains("tour-guide-top");
      laboratoryGuide.style.setProperty("left", edge + "px", "important");
      laboratoryGuide.style.setProperty("right", edge + "px", "important");
      laboratoryGuide.style.setProperty("width", "calc(100% - " + (edge * 2) + "px)", "important");
      laboratoryGuide.style.setProperty("max-width", "430px", "important");
      laboratoryGuide.style.setProperty("height", small ? "210px" : "250px", "important");
      laboratoryGuide.style.setProperty("top", topPosition ? "10px" : "auto", "important");
      laboratoryGuide.style.setProperty("bottom", topPosition ? "auto" : "10px", "important");
      laboratoryGuide.style.setProperty("transform", "none", "important");
    }

    if (laboratoryImage) {
      laboratoryImage.style.setProperty("left", "auto", "important");
      laboratoryImage.style.setProperty("right", "10px", "important");
      laboratoryImage.style.setProperty("bottom", "0", "important");
      laboratoryImage.style.setProperty("width", (small ? "94px" : "112px"), "important");
      laboratoryImage.style.setProperty("height", (small ? "94px" : "112px"), "important");
      laboratoryImage.style.setProperty("max-height", (small ? "94px" : "112px"), "important");
    }

    document.querySelectorAll(".jaguar-welcome .jaguar-speech, .laboratory-tour .jaguar-speech").forEach(function (speech) {
      speech.style.setProperty("top", "0", "important");
      speech.style.setProperty("left", "0", "important");
      speech.style.setProperty("width", "100%", "important");
      speech.style.setProperty("max-height", "none", "important");
      speech.style.setProperty("height", "auto", "important");
      speech.style.setProperty("overflow", "visible", "important");
    });
  }

  let frame = 0;
  function schedule() {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(fitTourGuides);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style"]
  });

  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", schedule);
  fitTourGuides();
  window.setInterval(fitTourGuides, 500);
}());
