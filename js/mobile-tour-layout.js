(function () {
  "use strict";

  function fitTourGuides() {
    if (window.innerWidth > 700) return;

    const small = window.innerWidth <= 360;
    const edge = small ? 10 : 12;
    const welcomeGuide = document.querySelector("#jaguar-welcome .jaguar-guide");
    const welcomeImage = document.querySelector("#jaguar-welcome .jaguar-guide-image");
    const laboratoryGuide = document.querySelector("#laboratory-tour .jaguar-guide");
    const laboratoryImage = document.querySelector("#laboratory-tour .jaguar-guide-image");

    if (welcomeGuide) {
      const positioned = welcomeGuide.classList.contains("is-positioned");
      const finalStep = welcomeGuide.classList.contains("guide-final");
      welcomeGuide.style.setProperty("width", "calc(100% - " + (edge * 2) + "px)", "important");
      welcomeGuide.style.setProperty("max-width", "430px", "important");
      welcomeGuide.style.setProperty("height", small ? "190px" : "220px", "important");
      welcomeGuide.style.setProperty("right", "auto", "important");
      welcomeGuide.style.setProperty("transform", positioned ? "none" : "translate(-50%, -50%)", "important");

      if (positioned) {
        welcomeGuide.style.setProperty("left", edge + "px", "important");
        welcomeGuide.style.setProperty("top", finalStep ? "14px" : "auto", "important");
        welcomeGuide.style.setProperty("bottom", finalStep ? "auto" : "12px", "important");
      } else {
        welcomeGuide.style.setProperty("left", "50%", "important");
        welcomeGuide.style.setProperty("top", "50%", "important");
        welcomeGuide.style.setProperty("bottom", "auto", "important");
      }
    }

    if (welcomeImage) {
      welcomeImage.style.setProperty("left", "auto", "important");
      welcomeImage.style.setProperty("right", "10px", "important");
      welcomeImage.style.setProperty("bottom", "0", "important");
      welcomeImage.style.setProperty("width", (small ? "94px" : "112px"), "important");
      welcomeImage.style.setProperty("height", (small ? "94px" : "112px"), "important");
      welcomeImage.style.setProperty("max-height", (small ? "94px" : "112px"), "important");
    }

    if (laboratoryGuide) {
      laboratoryGuide.style.setProperty("left", edge + "px", "important");
      laboratoryGuide.style.setProperty("right", edge + "px", "important");
      laboratoryGuide.style.setProperty("width", "calc(100% - " + (edge * 2) + "px)", "important");
      laboratoryGuide.style.setProperty("max-width", "430px", "important");
      laboratoryGuide.style.setProperty("height", small ? "210px" : "250px", "important");
      laboratoryGuide.style.setProperty("top", "auto", "important");
      laboratoryGuide.style.setProperty("bottom", "10px", "important");
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
