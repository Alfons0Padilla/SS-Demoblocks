(function () {
  "use strict";

  const tour = document.querySelector("#laboratory-tour");
  if (!tour) return;
  if (document.body.classList.contains("laboratory-locked")) {
    document.addEventListener("laboratory-unlocked", function () {
      window.location.reload();
    }, { once: true });
    return;
  }
  const key = "robobloques-laboratory-tour-seen-v2";
  let seen = false;
  try { seen = localStorage.getItem(key) === "true"; } catch (error) { seen = false; }
  if (seen) { tour.remove(); return; }

  const steps = [
    { title: "Crea tu propia aventura", text: "Selecciona un personaje, agrega acciones y observa cómo las realiza en el escenario. En celular puedes tocar los personajes y bloques para agregarlos.", target: null },
    { title: "Biblioteca", text: "Aquí están tus bloques. Toca un personaje para agregarlo al escenario y toca una acción para agregarla a la secuencia.", target: "#mobile-block-menu-toggle", open: "blocks" },
    { title: "Bloques", text: "La biblioteca contiene Personajes, Movimiento, Pintar, Bucles, Control y Programadas. Las secciones disponibles dependen de tu progreso.", target: "#biblioteca", open: "blocks" },
    { title: "Selecciona un personaje para comenzar", text: "Toca un personaje en el escenario para programarlo. Verás el aviso de programación y sus acciones en la secuencia.", target: "#escenario" },
    { title: "Secuencia de acciones", text: "Este menú muestra las instrucciones del personaje seleccionado. Puedes abrirlo sin cerrar la biblioteca.", target: "#programa", open: "sequence" },
    { title: "Ordena las acciones", text: "Toca un bloque para seleccionarlo y luego toca otro bloque o una posición para moverlo. En mobile los bloques no se arrastran.", target: "#programa", open: "sequence" },
    { title: "Controles de ejecución", text: "Toca el control para desplegar Ejecutar, Detener y Reiniciar. Si no hay acciones, el laboratorio mostrará: “Agrega acciones antes de ejecutar.”", target: "#workspace-execution-menu", open: "execution" }
  ];
  let index = 0;
  let renderId = 0;
  const title = document.querySelector("#laboratory-tour-title");
  const text = document.querySelector("#laboratory-tour-text");
  const step = document.querySelector("#laboratory-tour-step");
  const guide = tour.querySelector(".jaguar-guide");
  const spotlight = document.querySelector("#laboratory-tour-spotlight");
  const panels = Array.from(tour.querySelectorAll(".jaguar-overlay-panel"));

  function setMenu(name, open) {
    const root = document.documentElement;
    if (name === "blocks") root.classList.toggle("mobile-blocks-open", open);
    if (name === "sequence") root.classList.toggle("mobile-program-open", open);
    if (name === "execution") {
      root.classList.toggle("mobile-execution-open", open);
      if (open) {
        root.classList.remove("mobile-blocks-open", "mobile-program-open");
      }
    }
    const button = name === "blocks" ? document.querySelector("#mobile-block-menu-toggle")
      : name === "sequence" ? document.querySelector("#mobile-sequence-menu-toggle")
        : document.querySelector("#mobile-execution-toggle");
    if (button) button.setAttribute("aria-expanded", String(open));
  }

  function position(target) {
    const mobile = window.innerWidth <= 700;
    const bounds = target ? target.getBoundingClientRect() : null;
    const padding = 8;
    const hole = bounds ? {
      left: Math.max(8, bounds.left - padding),
      top: Math.max(8, bounds.top - padding),
      right: Math.min(window.innerWidth - 8, bounds.right + padding),
      bottom: Math.min(window.innerHeight - 8, bounds.bottom + padding)
    } : null;
    if (!hole) {
      spotlight.style.display = "none";
      panels.forEach(function (panel) { panel.style.display = "none"; });
    } else {
      spotlight.style.display = "block";
      panels.forEach(function (panel) { panel.style.display = "block"; });
    }
    if (hole) {
    spotlight.style.left = hole.left + "px";
    spotlight.style.top = hole.top + "px";
    spotlight.style.width = Math.max(0, hole.right - hole.left) + "px";
    spotlight.style.height = Math.max(0, hole.bottom - hole.top) + "px";
      const styles = [
        { left: 0, top: 0, width: "100%", height: hole.top + "px" },
        { left: hole.right + "px", top: hole.top + "px", width: Math.max(0, window.innerWidth - hole.right) + "px", height: Math.max(0, hole.bottom - hole.top) + "px" },
        { left: 0, top: hole.bottom + "px", width: "100%", height: Math.max(0, window.innerHeight - hole.bottom) + "px" },
        { left: 0, top: hole.top + "px", width: hole.left + "px", height: Math.max(0, hole.bottom - hole.top) + "px" }
      ];
      panels.forEach(function (panel, panelIndex) { Object.assign(panel.style, styles[panelIndex]); });
    }
    const landscape = mobile && window.matchMedia("(orientation: landscape) and (max-height: 700px)").matches;
    const edge = window.innerWidth <= 360 ? 10 : 12;
    guide.style.left = mobile ? edge + "px" : "50%";
    if (mobile) {
      guide.style.setProperty("left", edge + "px", "important");
      guide.style.setProperty("right", edge + "px", "important");
      guide.style.setProperty("width", "calc(100% - " + (edge * 2) + "px)", "important");
      guide.style.setProperty("top", index === 0 || landscape ? "12px" : "auto", "important");
      guide.style.setProperty("bottom", index === 0 || landscape ? "auto" : "12px", "important");
      guide.style.setProperty("height", "min(220px, 30dvh)", "important");
      guide.style.setProperty("transform", "none", "important");
    } else {
      guide.style.setProperty("right", "auto", "important");
      guide.style.setProperty("top", "50%", "important");
      guide.style.setProperty("bottom", "auto", "important");
      guide.style.width = "min(700px, calc(100% - 28px))";
      guide.style.height = "min(440px, calc(100% - 28px))";
      guide.style.transform = "translate(-50%, -50%)";
    }
    guide.classList.add("is-positioned", mobile ? "guide-side-left" : "guide-side-right");
  }

  let currentStepTarget = null;

  function render() {
    const current = steps[index];
    const currentRender = ++renderId;
    if (current.open) setMenu(current.open, true);
    if (current.open === "sequence") setMenu("blocks", true);
    title.textContent = current.title;
    text.textContent = current.text;
    step.textContent = "Laboratorio · " + (index + 1) + " de " + steps.length;
    currentStepTarget = current.target;
    const target = current.target ? document.querySelector(current.target) : null;
    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
    }
    const finishRender = function () {
      if (currentRender !== renderId) return;
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
      }
      position(target);
      guide.classList.remove("message-refresh");
      void guide.offsetWidth;
      guide.classList.add("message-refresh");
      tour.classList.add("is-ready");
    };
    if (current.open && target) window.setTimeout(finishRender, 220);
    else finishRender();
  }

  function finish() {
    try { localStorage.setItem(key, "true"); } catch (error) {}
    ["mobile-blocks-open", "mobile-program-open", "mobile-execution-open"].forEach(function (name) { document.documentElement.classList.remove(name); });
    tour.classList.add("is-dismissed");
    document.documentElement.classList.remove("jaguar-tour-active");
    document.body.classList.remove("jaguar-tour-active");
    window.setTimeout(function () { tour.remove(); }, 420);
  }

  document.documentElement.classList.add("jaguar-tour-active");
  document.body.classList.add("jaguar-tour-active");
  tour.addEventListener("click", function (event) {
    event.stopPropagation();
    index += 1;
    if (index >= steps.length) finish(); else render();
  });
  window.addEventListener("resize", function () { if (document.body.contains(tour)) render(); });
  render();
}());
