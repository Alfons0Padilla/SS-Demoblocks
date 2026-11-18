(function () {
  "use strict";

  const welcome = document.querySelector("#jaguar-welcome");
  const spotlight = document.querySelector("#jaguar-spotlight");
  const overlayPanels = Array.from(document.querySelectorAll(".jaguar-overlay-panel"));
  const guide = document.querySelector(".jaguar-guide");
  const leftJaguar = document.querySelector(".jaguar-guide-image-left");
  const rightJaguar = document.querySelector(".jaguar-guide-image-right");
  if (!welcome || !spotlight || !guide) return;
  let mobileCard = null;
  let mobileSpotlight = null;
  let mobileSpotlightRun = 0;
  let mobileSpotlightTimers = [];
  let mobileCardTimers = [];

  function ensureMobileSpotlight() {
    if (mobileSpotlight) return mobileSpotlight;
    mobileSpotlight = document.createElement("div");
    mobileSpotlight.className = "jaguar-mobile-spotlight";
    welcome.appendChild(mobileSpotlight);
    return mobileSpotlight;
  }

  function updateMobileSpotlight(message) {
    if (window.innerWidth > 700) {
      if (mobileSpotlight) mobileSpotlight.style.display = "none";
      return;
    }
    const targetSelectors = {
      "Navega por la aventura": ".main-nav",
      "Comienza con una misión": ".home-hero .button-primary",
      "Prueba el laboratorio": ".home-hero .button-secondary",
      "Mira cómo funciona": ".demo-heading",
      "Elige tu camino": ".learning-modes",
      "Aprende el proceso": ".process-list",
      "¿Listo para crear?": ".final-actions"
    };
    const target = document.querySelector(targetSelectors[message.title]);
    if (!target) {
      if (mobileSpotlight) mobileSpotlight.style.display = "none";
      return;
    }
    const bounds = target.getBoundingClientRect();
    const padding = 7;
    const left = Math.max(8, bounds.left - padding);
    const top = Math.max(8, bounds.top - padding);
    const right = Math.min(window.innerWidth - 8, bounds.right + padding);
    const bottom = Math.min(window.innerHeight - 8, bounds.bottom + padding);
    const halo = ensureMobileSpotlight();
    halo.style.display = "block";
    halo.style.left = left + "px";
    halo.style.top = top + "px";
    halo.style.width = Math.max(0, right - left) + "px";
    halo.style.height = Math.max(0, bottom - top) + "px";
  }

  function ensureMobileCard() {
    if (mobileCard) return mobileCard;
    mobileCard = document.createElement("div");
    mobileCard.className = "jaguar-mobile-card";
    mobileCard.setAttribute("aria-hidden", "true");
    welcome.appendChild(mobileCard);
    return mobileCard;
  }

  function renderMobileCard(message, index) {
    if (window.innerWidth > 700) {
      if (mobileCard) mobileCard.style.display = "none";
      guide.style.removeProperty("display");
      return;
    }

    const card = ensureMobileCard();
    const finalStep = index === messages.length - 1;
    card.className = finalStep
      ? "jaguar-mobile-card is-final"
      : (index === 0 ? "jaguar-mobile-card is-intro" : "jaguar-mobile-card");
    card.style.display = "block";
    if (finalStep) {
      card.setAttribute("style", "position: fixed !important; top: 109px !important; right: 10px !important; bottom: auto !important; left: 10px !important; width: auto !important; height: 190px !important; transform: none !important;");
      window.requestAnimationFrame(function () {
        card.setAttribute("style", "position: fixed !important; top: 109px !important; right: 10px !important; bottom: auto !important; left: 10px !important; width: auto !important; height: 190px !important; max-height: 190px !important; transform: none !important;");
      });
      window.setTimeout(function () {
        card.setAttribute("style", "position: fixed !important; top: 109px !important; right: 10px !important; bottom: auto !important; left: 10px !important; width: auto !important; height: 190px !important; max-height: 190px !important; transform: none !important;");
      }, 50);
    } else if (index === 0) {
      card.style.top = "50%";
      card.style.bottom = "auto";
    } else {
      card.style.top = "auto";
      card.style.bottom = "12px";
    }
    card.innerHTML =
      '<div class="jaguar-mobile-speech">' +
        '<span class="jaguar-mobile-step">' + message.label + " · " + (index + 1) + " de " + messages.length + "</span>" +
        "<h2>" + message.title + "</h2>" +
        "<p>" + message.text + "</p>" +
        '<span class="jaguar-mobile-hint">Toca en cualquier parte para continuar <b aria-hidden="true">→</b></span>' +
      "</div>" +
      '<img class="jaguar-mobile-character" src="' + (message.look === "right" ? "Recursos/Jaguar Der.png" : "Recursos/Jaguar Izq.png") + '" alt="">';
    guide.style.setProperty("display", "none", "important");
    renderMobileSpotlight(message, index);
  }

  function forceMobileSpotlight(message, index) {
    if (window.innerWidth > 700) return;
    const targetSelectors = {
      "Navega por la aventura": ".main-nav",
      "Comienza con una misión": ".home-hero .button-primary",
      "Prueba el laboratorio": ".home-hero .button-secondary",
      "Mira cómo funciona": ".demo-heading",
      "Elige tu camino": ".learning-modes",
      "Aprende el proceso": ".process-list",
      "¿Listo para crear?": ".final-actions"
    };
    const target = document.querySelector(targetSelectors[message.title]);
    if (!target) {
      spotlight.style.setProperty("display", "none", "important");
      overlayPanels.forEach(function (panel) { panel.style.display = "none"; });
      if (mobileSpotlight) mobileSpotlight.style.display = "none";
      return;
    }

    const known = {
      "Navega por la aventura": { left: 18, top: 63, width: 309, height: 52 },
      "Comienza con una misión": { left: 28, top: 63, width: 289, height: 61 },
      "Prueba el laboratorio": { left: 28, top: 63, width: 289, height: 63 },
      "Mira cómo funciona": { left: 5, top: 63, width: 350, height: 300 },
      "Elige tu camino": { left: 5, top: 63, width: 350, height: 95 },
      "Aprende el proceso": { left: 30, top: 63, width: 285, height: 250 },
      "¿Listo para crear?": { left: 30, top: 260, width: 290, height: 110 }
    };
    const zone = known[message.title] || { left: 12, top: 64, width: window.innerWidth - 24, height: 55 };
    const left = zone.left;
    const visibleTop = zone.top;
    const right = left + zone.width;
    const visibleBottom = visibleTop + zone.height;
    spotlight.style.setProperty("display", "block", "important");
    spotlight.style.left = left + "px";
    spotlight.style.top = visibleTop + "px";
    spotlight.style.width = Math.max(0, right - left) + "px";
    spotlight.style.height = Math.max(0, visibleBottom - visibleTop) + "px";

    const hole = { left: left, top: visibleTop, right: right, bottom: visibleBottom };
    const panelStyles = [
      { left: 0, top: 0, width: "100%", height: hole.top + "px" },
      { left: hole.right + "px", top: hole.top + "px", width: Math.max(0, window.innerWidth - hole.right) + "px", height: Math.max(0, hole.bottom - hole.top) + "px" },
      { left: 0, top: hole.bottom + "px", width: "100%", height: Math.max(0, window.innerHeight - hole.bottom) + "px" },
      { left: 0, top: hole.top + "px", width: hole.left + "px", height: Math.max(0, hole.bottom - hole.top) + "px" }
    ];
    overlayPanels.forEach(function (panel, panelIndex) {
      panel.style.display = "block";
      Object.assign(panel.style, panelStyles[panelIndex]);
    });
  }

  function renderMobileSpotlight(message, index) {
    if (window.innerWidth > 700) return;
    const targetSelectors = {
      "Navega por la aventura": ".main-nav",
      "Comienza con una misión": ".home-hero .button-primary",
      "Prueba el laboratorio": ".home-hero .button-secondary",
      "Mira cómo funciona": ".demo-heading",
      "Elige tu camino": ".learning-modes",
      "Aprende el proceso": ".process-list",
      "¿Listo para crear?": ".final-actions"
    };
    const target = document.querySelector(targetSelectors[message.title]);
    if (!target) {
      spotlight.style.setProperty("display", "none", "important");
      overlayPanels.forEach(function (panel) { panel.style.display = "none"; });
      return;
    }

    const before = target.getBoundingClientRect();
    const appShellForPosition = document.querySelector(".app-shell");
    const targetDocumentTop = (appShellForPosition ? appShellForPosition.scrollTop : window.scrollY) + before.top;
    const desiredTop = index === messages.length - 1 ? 260 : 70;
    setMobileTourScroll(targetDocumentTop - desiredTop);
    window.requestAnimationFrame(function () {
      lockedScrollY = window.scrollY;
      isProgrammaticScroll = false;
      paintSpotlight();
    });

    const run = ++mobileSpotlightRun;
    mobileSpotlightTimers.forEach(function (timer) { window.clearTimeout(timer); });
    mobileSpotlightTimers = [];

    function paintSpotlight() {
      if (run !== mobileSpotlightRun || currentMessage !== index) return;
      const bounds = target.getBoundingClientRect();
      const padding = 7;
      const card = document.querySelector(".jaguar-mobile-card");
      const cardRect = card ? card.getBoundingClientRect() : null;
      const viewportBottom = cardRect
        ? (index === messages.length - 1 ? window.innerHeight - 12 : cardRect.top - 12)
        : window.innerHeight - 202;
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const visibleTop = Math.max(8, bounds.top - padding);
      const visibleBottom = Math.min(viewportBottom, bounds.bottom + padding);
      const left = Math.max(8, bounds.left - padding);
      const right = Math.min(window.innerWidth - 8, bounds.right + padding);
      if (visibleBottom <= visibleTop) return;

      spotlight.style.setProperty("display", "none", "important");
      overlayPanels.forEach(function (panel) { panel.style.display = "none"; });
      const halo = ensureMobileSpotlight();
      halo.setAttribute("style",
        "position:fixed!important;z-index:22!important;display:block!important;" +
        "left:" + left + "px!important;top:" + visibleTop + "px!important;" +
        "width:" + Math.max(0, right - left) + "px!important;" +
        "height:" + Math.max(0, visibleBottom - visibleTop) + "px!important;");
    }
    paintSpotlight();
    [100, 300, 600].forEach(function (delay) {
      mobileSpotlightTimers.push(window.setTimeout(paintSpotlight, delay));
    });
  }
  const jaguarTourSeenKey = "robobloques-jaguar-tour-seen";
  let jaguarTourSeen = false;
  try {
    jaguarTourSeen = localStorage.getItem(jaguarTourSeenKey) === "true";
  } catch (error) {
    jaguarTourSeen = false;
  }
  if (jaguarTourSeen) {
    welcome.remove();
    document.body.classList.remove("jaguar-tour-active");
    document.documentElement.classList.remove("jaguar-tour-active");
    return;
  }
  document.body.classList.add("jaguar-tour-active");
  document.documentElement.classList.add("jaguar-tour-active");

  const title = document.querySelector("#jaguar-guide-title");
  const text = document.querySelector("#jaguar-guide-text");
  const step = document.querySelector("#jaguar-speech-step");
  const messages = [
    {
      title: "¡Bienvenido a RoboBloques!",
      text: "Soy tu jaguar guía. Te mostraré cada parte de esta página y dónde comenzar.",
      label: "Bienvenida",
      target: null,
      place: "hero-right",
      look: "left"
    },
    {
      title: "Navega por la aventura",
      text: "Desde este menú puedes volver al inicio, entrar al Curso guiado o abrir el Laboratorio.",
      label: "Navegación",
      target: ".main-nav",
      place: "bottom-right",
      look: "left"
    },
    {
      title: "Comienza con una misión",
      text: "Este botón te lleva al Curso guiado, donde aprenderás con retos cortos paso a paso.",
      label: "Curso guiado",
      target: ".home-hero .button-primary",
      place: "bottom-right",
      look: "left"
    },
    {
      title: "Prueba el laboratorio",
      text: "Aquí puedes experimentar libremente combinando bloques y creando tus propios programas.",
      label: "Laboratorio",
      target: ".home-hero .button-secondary",
      place: "bottom-right",
      look: "left"
    },
    {
      title: "Mira cómo funciona",
      text: "Esta demostración te enseña cómo se ordenan los bloques y cómo Robotcito sigue tus instrucciones.",
      label: "Demostración",
      target: ".demo-heading",
      place: "bottom-right",
      look: "left"
    },
    {
      title: "Elige tu camino",
      text: "En estas dos tarjetas puedes volver a elegir entre la ruta paso a paso y la experimentación libre.",
      label: "Caminos de aprendizaje",
      target: ".home-paths .section-heading",
      place: "top-right",
      look: "left"
    },
    {
      title: "Aprende el proceso",
      text: "Aquí descubrirás las tres etapas: elegir bloques, organizar instrucciones y ejecutar tu idea.",
      label: "Así se aprende",
      target: ".home-process .process-intro",
      place: "top-left",
      look: "right"
    },
    {
      title: "¿Listo para crear?",
      text: "Usa estos botones finales para comenzar el curso o entrar directamente al laboratorio.",
      label: "Tu siguiente paso",
      target: ".home-final-cta .final-actions",
      place: "top-left",
      look: "right"
    }
  ];
  let currentMessage = 0;
  let positioningFrame = 0;
  let isProgrammaticScroll = false;
  let lockedScrollY = window.scrollY;
  function keepMobileGuideInside() {
    if (window.innerWidth > 700) return;
    const edge = window.innerWidth <= 360 ? 10 : 12;
    const actual = guide.getBoundingClientRect();
    if (actual.width > 0) {
      const shift = edge - actual.left;
      guide.style.setProperty("transform", "translateX(" + shift + "px)", "important");
    }
  }

  function keepTourViewport() {
    if (window.innerWidth <= 700) return;
    if (!isProgrammaticScroll && window.scrollY !== lockedScrollY) {
      window.scrollTo(0, lockedScrollY);
    }
  }

  function preventTourScroll(event) {
    if (window.innerWidth <= 700) event.preventDefault();
  }

  function preventTourKeys(event) {
    if (window.innerWidth > 700) return;
    const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (scrollKeys.includes(event.key)) event.preventDefault();
  }

  function getMobileGuideHeight() {
    return window.innerWidth <= 360 ? 190 : 220;
  }

  function enableMobileTourScroll() {
    if (window.innerWidth > 700) return;
    document.documentElement.style.setProperty("overflow-y", "auto", "important");
    document.documentElement.style.setProperty("height", "100dvh", "important");
    document.body.style.setProperty("overflow-y", "auto", "important");
    document.body.style.setProperty("height", "100dvh", "important");
  }

  function setMobileTourScroll(top) {
    if (window.innerWidth > 700) return;
    const appShell = document.querySelector(".app-shell");
    const scrollContainer = appShell || document.documentElement;
    const maxScroll = Math.max(0, scrollContainer.scrollHeight - window.innerHeight);
    const nextScroll = Math.max(0, Math.min(maxScroll, top));
    isProgrammaticScroll = true;
    lockedScrollY = nextScroll;
    scrollContainer.scrollTop = nextScroll;
    document.documentElement.scrollTop = nextScroll;
    document.body.scrollTop = nextScroll;
    window.scrollTo({ top: nextScroll, left: 0, behavior: "auto" });
  }

  window.addEventListener("scroll", keepTourViewport, { passive: true });
  window.addEventListener("wheel", preventTourScroll, { passive: false });
  window.addEventListener("touchmove", preventTourScroll, { passive: false });
  document.addEventListener("keydown", preventTourKeys);

  function positionGuide(target) {
    if (!target) return;
    isProgrammaticScroll = true;
    if (window.innerWidth <= 700) {
      const currentBounds = target.getBoundingClientRect();
      const mobileGuideHeight = getMobileGuideHeight();
      const appShellForPosition = document.querySelector(".app-shell");
      const targetDocumentTop = (appShellForPosition ? appShellForPosition.scrollTop : window.scrollY) + currentBounds.top;
      const desiredViewportTop = currentBounds.height > window.innerHeight - mobileGuideHeight - 80
        ? 12
        : 70;
      setMobileTourScroll(targetDocumentTop - desiredViewportTop);
    } else {
      target.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
    }
    if (window.innerWidth <= 700) {
      return;
    }
    window.clearTimeout(positioningFrame);
    positioningFrame = window.setTimeout(function () {
      if (window.innerWidth <= 700) {
        return;
      }
      const bounds = target.getBoundingClientRect();
      const padding = window.innerWidth <= 700 ? 6 : 9;
      const viewportTop = window.innerWidth <= 700 ? 6 : 8;
      const viewportBottom = window.innerWidth <= 700
        ? window.innerHeight - (currentMessage === messages.length - 1 ? 12 : getMobileGuideHeight() + 12)
        : window.innerHeight - 8;
      const visibleTop = Math.max(viewportTop, bounds.top - padding);
      const visibleBottom = Math.min(viewportBottom, bounds.bottom + padding);
      spotlight.style.setProperty("display", "block", "important");
      spotlight.style.left = Math.max(8, bounds.left - padding) + "px";
      spotlight.style.top = visibleTop + "px";
      spotlight.style.width = Math.max(0, Math.min(window.innerWidth - 16, bounds.width + padding * 2)) + "px";
      spotlight.style.height = Math.max(0, visibleBottom - visibleTop) + "px";
      const hole = {
        left: Math.max(8, bounds.left - padding),
        top: visibleTop,
        right: Math.min(window.innerWidth - 8, bounds.right + padding),
        bottom: visibleBottom
      };
      const panelStyles = [
        { left: 0, top: 0, width: "100%", height: hole.top + "px" },
        { left: hole.right + "px", top: hole.top + "px", width: Math.max(0, window.innerWidth - hole.right) + "px", height: Math.max(0, hole.bottom - hole.top) + "px" },
        { left: 0, top: hole.bottom + "px", width: "100%", height: Math.max(0, window.innerHeight - hole.bottom) + "px" },
        { left: 0, top: hole.top + "px", width: hole.left + "px", height: Math.max(0, hole.bottom - hole.top) + "px" }
      ];
      overlayPanels.forEach(function (panel, index) {
        Object.assign(panel.style, panelStyles[index]);
      });

      const guideWidth = Math.min(700, window.innerWidth - 28);
      const mobileGuideHeight = getMobileGuideHeight();
      const guideHeight = Math.min(window.innerWidth <= 700 ? mobileGuideHeight : 440, window.innerHeight - 28);
      guide.style.setProperty("--guide-width", guideWidth + "px");
      guide.style.height = guideHeight + "px";
      if (window.innerWidth <= 700) {
        const edge = window.innerWidth <= 360 ? 10 : 12;
        if (currentMessage === messages.length - 1) {
          guide.setAttribute("style", "position: fixed !important; left: " + edge + "px !important; right: " + edge + "px !important; top: 14px !important; bottom: auto !important; width: calc(100% - " + (edge * 2) + "px) !important; max-width: 430px !important; height: " + guideHeight + "px !important; transform: translateX(calc(" + edge + "px - 50vw)) !important;");
        } else {
          guide.setAttribute("style", "position: fixed !important; left: " + edge + "px !important; right: " + edge + "px !important; top: auto !important; bottom: 12px !important; width: calc(100% - " + (edge * 2) + "px) !important; max-width: 430px !important; height: " + guideHeight + "px !important; transform: translateX(calc(" + edge + "px - 50vw)) !important;");
        }
        window.requestAnimationFrame(function () {
          const actual = guide.getBoundingClientRect();
          const shift = edge - actual.left;
          guide.style.setProperty("transform", "translateX(" + shift + "px)", "important");
        });
        window.setTimeout(keepMobileGuideInside, 50);
        window.setTimeout(keepMobileGuideInside, 200);
        window.setTimeout(keepMobileGuideInside, 500);
      }
      const gap = 24;
      const margin = 14;
      const candidates = [
        { side: "right", left: hole.right + gap, top: hole.top + (hole.bottom - hole.top - guideHeight) / 2 },
        { side: "left", left: hole.left - guideWidth - gap, top: hole.top + (hole.bottom - hole.top - guideHeight) / 2 },
        { side: "bottom", left: hole.left + (hole.right - hole.left - guideWidth) / 2, top: hole.bottom + gap },
        { side: "top", left: hole.left + (hole.right - hole.left - guideWidth) / 2, top: hole.top - guideHeight - gap }
      ];
      const fits = function (candidate) {
        return candidate.left >= margin &&
          candidate.top >= margin &&
          candidate.left + guideWidth <= window.innerWidth - margin &&
          candidate.top + guideHeight <= window.innerHeight - margin;
      };
      const intersects = function (candidate) {
        return candidate.left < hole.right &&
          candidate.left + guideWidth > hole.left &&
          candidate.top < hole.bottom &&
          candidate.top + guideHeight > hole.top;
      };
      let placement = candidates.find(function (candidate) {
        return fits(candidate) && !intersects(candidate);
      }) || candidates.find(fits) || { side: "right", left: margin, top: margin };
      if (window.innerWidth <= 700) {
        const canPlaceBelow = hole.bottom + gap + guideHeight <= window.innerHeight - margin;
        const canPlaceAbove = hole.top - gap - guideHeight >= margin;
        if (canPlaceBelow && hole.top < window.innerHeight / 2) {
          placement = { side: "bottom", left: hole.left + (hole.right - hole.left - guideWidth) / 2, top: hole.bottom + gap };
        } else if (canPlaceAbove && hole.top >= window.innerHeight / 2) {
          placement = { side: "top", left: hole.left + (hole.right - hole.left - guideWidth) / 2, top: hole.top - guideHeight - gap };
        }
      }
      guide.style.left = Math.max(margin, Math.min(window.innerWidth - guideWidth - margin, placement.left)) + "px";
      guide.style.top = Math.max(margin, Math.min(window.innerHeight - guideHeight - margin, placement.top)) + "px";
      if (window.innerWidth <= 700 && hole.top < window.innerHeight / 2 &&
          hole.bottom + gap + guideHeight <= window.innerHeight - margin) {
        guide.style.top = Math.min(window.innerHeight - guideHeight - margin, hole.bottom + gap) + "px";
      }
      if (window.innerWidth <= 700) {
        const edge = window.innerWidth <= 360 ? 10 : 12;
        guide.style.left = edge + "px";
        guide.style.right = edge + "px";
        guide.style.width = "calc(100% - " + (edge * 2) + "px)";
        guide.style.transform = "none";
        if (currentMessage === messages.length - 1) {
          guide.style.top = "14px";
          guide.style.bottom = "auto";
        } else {
          guide.style.top = "auto";
          guide.style.bottom = "12px";
        }
      }
      guide.classList.remove("guide-side-left", "guide-side-right");
      guide.classList.add(placement.side === "left" ? "guide-side-left" : "guide-side-right");
      guide.classList.add("is-positioned");
      lockedScrollY = window.scrollY;
      isProgrammaticScroll = false;
    }, 60);
  }

  function showMessage() {
    enableMobileTourScroll();
    const message = messages[currentMessage];
    title.textContent = message.title;
    text.textContent = message.text;
    step.textContent = message.label + " · " + (currentMessage + 1) + " de " + messages.length;
    welcome.classList.toggle("is-final", currentMessage === messages.length - 1);
    welcome.classList.toggle("is-intro", currentMessage === 0);
    guide.className = "jaguar-guide " +
      (currentMessage === 0 ? "guide-welcome" : "is-positioned place-" + message.place) +
      (currentMessage === messages.length - 1 ? " guide-final" : "");
    guide.classList.toggle("looks-left", message.look === "left");
    guide.classList.toggle("looks-right", message.look === "right");
    renderMobileCard(message, currentMessage);
    if (window.innerWidth <= 700) {
      const edge = window.innerWidth <= 360 ? 10 : 12;
      const fixedHeight = getMobileGuideHeight();
      if (currentMessage === messages.length - 1) {
        guide.setAttribute("style", "position: fixed !important; left: " + edge + "px !important; right: " + edge + "px !important; top: 14px !important; bottom: auto !important; width: calc(100% - " + (edge * 2) + "px) !important; max-width: 430px !important; height: " + fixedHeight + "px !important; transform: translateX(calc(" + edge + "px - 50vw)) !important;");
      } else {
        guide.setAttribute("style", "position: fixed !important; left: " + edge + "px !important; right: " + edge + "px !important; top: auto !important; bottom: 12px !important; width: calc(100% - " + (edge * 2) + "px) !important; max-width: 430px !important; height: " + fixedHeight + "px !important; transform: translateX(calc(" + edge + "px - 50vw)) !important;");
      }
      window.setTimeout(keepMobileGuideInside, 50);
      window.setTimeout(keepMobileGuideInside, 200);
      window.setTimeout(keepMobileGuideInside, 500);
    }
    const target = document.querySelector(message.target);
    if (target) {
      positionGuide(target);
    } else {
      spotlight.style.setProperty("display", "none", "important");
      overlayPanels.forEach(function (panel) { panel.style.display = "none"; });
      guide.style.removeProperty("left");
      guide.style.removeProperty("top");
      guide.style.removeProperty("height");
      guide.style.removeProperty("--guide-width");
    }
  }

  function finish(event) {
    if (event) event.preventDefault();
    try {
      localStorage.setItem(jaguarTourSeenKey, "true");
    } catch (error) {
      // The tour can still finish when browser storage is unavailable.
    }
    welcome.classList.add("is-dismissed");
    document.body.classList.add("jaguar-tour-finished");
    document.body.classList.remove("jaguar-tour-active");
    document.documentElement.classList.remove("jaguar-tour-active");
    document.documentElement.style.removeProperty("overflow-y");
    document.documentElement.style.removeProperty("height");
    document.body.style.removeProperty("overflow-y");
    document.body.style.removeProperty("height");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.removeEventListener("scroll", keepTourViewport);
    window.removeEventListener("wheel", preventTourScroll);
    window.removeEventListener("touchmove", preventTourScroll);
    document.removeEventListener("keydown", preventTourKeys);
    window.setTimeout(function () {
      welcome.remove();
    }, 450);
  }

  function advance(event) {
    if (event.target.closest("a, button")) event.preventDefault();
    if (currentMessage < messages.length - 1) {
      currentMessage += 1;
      isProgrammaticScroll = true;
      showMessage();
      return;
    }
    finish(event);
  }

  showMessage();
  welcome.addEventListener("click", advance);
  window.addEventListener("resize", function () {
    positionGuide(document.querySelector(messages[currentMessage].target));
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") finish(event);
    if (event.key === " " || event.key === "Enter") advance(event);
  });
}());
