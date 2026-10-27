(function () {
  "use strict";

  const tour = document.querySelector("#laboratory-tour");
  if (!tour) return;
  if (document.body.classList.contains("laboratory-locked")) {
    tour.remove();
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
    { title: "Controles de ejecución", text: "Toca el control para desplegar Ejecutar, Detener y Reiniciar. Si no hay acciones, el laboratorio mostrará: “Agrega acciones antes de ejecutar.”", target: "#mobile-execution-toggle", open: "execution" }
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
    if (name === "execution") root.classList.toggle("mobile-execution-open", open);
    const button = name === "blocks" ? document.querySelector("#mobile-block-menu-toggle")
      : name === "sequence" ? document.querySelector("#mobile-sequence-menu-toggle")
        : document.querySelector("#mobile-execution-toggle");
    if (button) button.setAttribute("aria-expanded", String(open));
  }

  function position(target) {
    if (!target) {
      spotlight.style.display = "none";
      panels.forEach(function (panel) { panel.style.display = "none"; });
    } else {
      spotlight.style.display = "block";
      panels.forEach(function (panel) { panel.style.display = "block"; });
    }
    const bounds = target ? target.getBoundingClientRect() : null;
    const padding = 7;
    const bottom = window.innerHeight - (window.innerWidth <= 700 ? 202 : 18);
    const hole = bounds ? {
      left: Math.max(8, bounds.left - padding),
      top: Math.max(8, bounds.top - padding),
      right: Math.min(window.innerWidth - 8, bounds.right + padding),
      bottom: Math.min(bottom, bounds.bottom + padding)
    } : { left: 8, top: 8, right: window.innerWidth - 8, bottom: Math.max(8, bottom) };
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
    const mobile = window.innerWidth <= 700 || (window.matchMedia("(orientation: landscape) and (max-height: 700px)").matches);
    const landscape = window.matchMedia("(orientation: landscape) and (max-height: 700px)").matches;
    const executionTarget = currentStepTarget === "#mobile-execution-toggle";
    guide.classList.toggle("tour-guide-top", landscape || executionTarget);
    guide.classList.toggle("tour-guide-bottom", !landscape && !executionTarget);
    guide.style.left = mobile ? (landscape ? "12px" : "14px") : "50%";
    guide.style.setProperty("top", mobile ? (landscape || executionTarget ? "10px" : "auto") : "50%", "important");
    guide.style.right = mobile ? (landscape ? "auto" : "14px") : "auto";
    guide.style.setProperty("bottom", mobile ? (landscape || executionTarget ? "auto" : "10px") : "auto", "important");
    guide.style.width = mobile ? (landscape ? "min(430px, 52vw)" : "calc(100% - 28px)") : "min(700px, calc(100% - 28px))";
    guide.style.height = mobile
      ? (window.matchMedia("(orientation: landscape) and (max-height: 700px)").matches ? "188px" : "280px")
      : "min(440px, calc(100% - 28px))";
    if (mobile && !landscape) guide.style.height = "360px";
    guide.style.transform = mobile ? "none" : "translate(-50%, -50%)";
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
    const finishRender = function () {
      if (currentRender !== renderId) return;
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
