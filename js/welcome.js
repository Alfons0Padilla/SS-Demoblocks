(function () {
  "use strict";

  const welcome = document.querySelector("#jaguar-welcome");
  const spotlight = document.querySelector("#jaguar-spotlight");
  const overlayPanels = Array.from(document.querySelectorAll(".jaguar-overlay-panel"));
  const guide = document.querySelector(".jaguar-guide");
  const leftJaguar = document.querySelector(".jaguar-guide-image-left");
  const rightJaguar = document.querySelector(".jaguar-guide-image-right");
  if (!welcome || !spotlight || !guide) return;
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

  function keepTourViewport() {
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

  window.addEventListener("scroll", keepTourViewport, { passive: true });
  window.addEventListener("wheel", preventTourScroll, { passive: false });
  window.addEventListener("touchmove", preventTourScroll, { passive: false });
  document.addEventListener("keydown", preventTourKeys);

  function positionGuide(target) {
    if (!target) return;
    isProgrammaticScroll = true;
    if (window.innerWidth <= 700) {
      const currentBounds = target.getBoundingClientRect();
      const mobileTop = 14;
      const mobileGuideHeight = window.innerWidth <= 360 ? 168 : 188;
      const mobileBottom = window.innerHeight - mobileGuideHeight - 20;
      const availableHeight = Math.max(120, mobileBottom - mobileTop);
      const targetTop = currentBounds.height <= availableHeight
        ? mobileTop + (availableHeight - currentBounds.height) / 2
        : mobileTop;
      window.scrollTo(0, Math.max(0, window.scrollY + currentBounds.top - targetTop));
    } else {
      target.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
    }
    window.clearTimeout(positioningFrame);
    positioningFrame = window.setTimeout(function () {
      const bounds = target.getBoundingClientRect();
      const padding = window.innerWidth <= 700 ? 6 : 9;
      const viewportTop = window.innerWidth <= 700 ? 6 : 8;
      const viewportBottom = window.innerWidth <= 700
        ? window.innerHeight - (currentMessage === messages.length - 1 ? 12 : (window.innerWidth <= 360 ? 168 : 188) + 12)
        : window.innerHeight - 8;
      const visibleTop = Math.max(viewportTop, bounds.top - padding);
      const visibleBottom = Math.min(viewportBottom, bounds.bottom + padding);
      spotlight.style.left = Math.max(8, bounds.left - padding) + "px";
      spotlight.style.top = visibleTop + "px";
      spotlight.style.width = Math.min(window.innerWidth - 16, bounds.width + padding * 2) + "px";
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
      const mobileGuideHeight = window.innerWidth <= 360 ? 168 : 188;
      const guideHeight = Math.min(window.innerWidth <= 700 ? mobileGuideHeight : 440, window.innerHeight - 28);
      guide.style.setProperty("--guide-width", guideWidth + "px");
      guide.style.height = guideHeight + "px";
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
      guide.classList.remove("guide-side-left", "guide-side-right");
      guide.classList.add(placement.side === "left" ? "guide-side-left" : "guide-side-right");
      guide.classList.add("is-positioned");
      lockedScrollY = window.scrollY;
      isProgrammaticScroll = false;
    }, 60);
  }

  function showMessage() {
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
    const target = document.querySelector(message.target);
    if (target) {
      positionGuide(target);
    } else {
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
      window.scrollTo(0, 0);
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
