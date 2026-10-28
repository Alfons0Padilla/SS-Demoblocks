(function () {
  "use strict";

  const actionCatalog = {
    forward: { label: "Avanzar", icon: "\u2B06\uFE0F", color: "movement", detail: "Mover hacia adelante", tab: "movement" },
    backward: { label: "Retroceder", icon: "\u2B07\uFE0F", color: "movement", detail: "Mover hacia atrás", tab: "movement" },
    left: { label: "Girar izquierda", icon: "\u21B6", color: "movement", detail: "Girar por grados", tab: "movement", degrees: true },
    right: { label: "Girar derecha", icon: "\u21B7", color: "movement", detail: "Girar por grados", tab: "movement", degrees: true },
    stop: { label: "Detener", icon: "\u23F9\uFE0F", color: "control", detail: "Parar el personaje", tab: "control" },
    wait: { label: "Esperar", icon: "\u23F1\uFE0F", color: "control", detail: "Esperar un momento", tab: "control", duration: true },
    loop: { label: "Repetir", icon: "\uD83D\uDD01", color: "loop", detail: "Contenedor para repetir acciones", tab: "loops", container: true },
    forwardPaint: { label: "Avanzar y pintar", icon: "\uD83D\uDD8C\uFE0F", color: "paint", detail: "Avanzar dejando una línea", tab: "paint", duration: true, thickness: true },
    say: { label: "Decir", icon: "\uD83D\uDCAC", color: "programmed", detail: "Mostrar un mensaje", tab: "programmed", duration: true },
    heart: { label: "Dibujar corazón", icon: "\u2764\uFE0F", color: "programmed", detail: "Avanzar y girar dibujando", tab: "programmed", shape: "heart", thickness: true },
    star: { label: "Dibujar estrella", icon: "\u2B50", color: "programmed", detail: "Avanzar y girar dibujando", tab: "programmed", shape: "star", thickness: true }
  };
  ["forward", "backward"].forEach(function (type) { actionCatalog[type].duration = true; });
  const characterCatalog = [
    { id: "robotcito", name: "Robotcito", image: "Recursos/robotcito.png", position: { x: 22, y: 34 } },
    { id: "gatito", name: "Gatito", image: "Recursos/Gatito.png", position: { x: 62, y: 48 } }
  ];
  const tabs = {
    characters: [],
    movement: ["forward", "backward", "left", "right"],
    paint: ["forwardPaint"],
    loops: ["loop"],
    control: ["stop", "wait"],
    programmed: ["say", "heart", "star"]
  };
  const state = { characters: [], selectedId: null, menuVisible: false, running: false, canReset: false, run: null, activeTab: "characters", openTabs: { characters: true }, draggedSequence: null, touchTargetCollection: null, touchSelectedSequence: null };
  const $ = function (selector) { return document.querySelector(selector); };
  function initCourse() {
    const picker = $("#lesson-blocks");
    const dropZone = $("#lesson-drop-zone");
    const executeButton = document.querySelector(".execute-button");
    const stopButton = document.querySelector(".stop-lesson-button");
    const restartButton = document.querySelector(".restart-lesson-button");
    const hintButton = document.querySelector(".hint-button");
    const hintBubble = document.querySelector("#lesson-hint");
    const hintText = document.querySelector("#lesson-hint-text");
    const previousMissionButton = document.querySelector("#previous-mission");
    const nextMissionButton = document.querySelector("#next-mission");
    const missionNavigationStatus = document.querySelector("#mission-navigation-status");
    const resetProgressButton = document.querySelector("#reset-course-progress");
    const character = $("#lesson-character");
    const stage = document.querySelector(".lesson-stage");
    const success = $("#lesson-success");
    const successScrim = $("#lesson-success-scrim");
    const successReplay = $("#success-replay");
    const successPrevious = $("#success-prev");
    const successNext = $("#success-next");
    const guide = $("#lesson-guide");
    const dragDemo = $("#lesson-drag-demo");
    const executeDemo = $("#lesson-execute-demo");
    let guideScrollLock = false;
    let guideLockedScrollY = window.scrollY;
    function isGuideBlockingScroll() { return window.innerWidth <= 700 && guide.classList.contains("is-visible"); }
    function keepGuideViewport() { if (isGuideBlockingScroll() && !guideScrollLock && window.scrollY !== guideLockedScrollY) window.scrollTo(0, guideLockedScrollY); }
    function preventGuideScroll(event) { if (isGuideBlockingScroll()) event.preventDefault(); }
    function preventGuideKeys(event) { if (isGuideBlockingScroll() && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].indexOf(event.key) >= 0) event.preventDefault(); }
    function replayGuideMessage() { guide.classList.remove("message-refresh"); void guide.offsetWidth; guide.classList.add("message-refresh"); }
    new MutationObserver(function (mutations) { if (mutations.some(function (mutation) { return mutation.type === "characterData" || mutation.type === "childList"; })) replayGuideMessage(); }).observe(guide, { characterData: true, childList: true, subtree: true });
    window.addEventListener("scroll", keepGuideViewport, { passive: true });
    window.addEventListener("wheel", preventGuideScroll, { passive: false });
    window.addEventListener("touchmove", preventGuideScroll, { passive: false });
    document.addEventListener("keydown", preventGuideKeys);
    const missions = [
      { module: 1, kind: "guided", name: "Primer movimiento", title: "Haz que avance", objective: "Usa una instrucción para cambiar el movimiento de Robotcito.", target: "Haz que Robotcito avance.", blocks: ["forward"], sequence: ["forward"], hint: "Observa primero el escenario: después agrega Avanzar y vuelve a ejecutar para comparar el antes y el después.", guide: [{ icon: "👀", title: "Conoce el escenario", text: "Chiapaneco te acompaña. Aquí Robotcito espera tu programa y el escenario te mostrará exactamente lo que ocurre." }, { icon: "🧩", title: "Descubre Avanzar", text: "Avanzar es una instrucción: cuando Robotcito la recibe, se mueve hacia adelante durante el tiempo indicado." }, { icon: "👆", title: "Elige la instrucción", text: "Busca el bloque Avanzar en la bandeja amarilla y tócalo. Al hacerlo aparecerá dentro de tu programa." }, { icon: "🧱", title: "Construye la secuencia", text: "Tu programa se lee de arriba hacia abajo. Por ahora tendrá una sola instrucción, así que Robotcito sabrá qué hacer primero." }, { icon: "▶️", title: "Ponlo a prueba", text: "Cuando tu bloque esté listo, pulsa Ejecutar simulación. Mira el movimiento y comprueba si llegaste al objetivo." }] },
      { module: 1, kind: "comprehension", name: "Ordena el viaje", title: "Ve y regresa", objective: "Organiza dos instrucciones para llevar a Robotcito y traerlo de vuelta.", target: "Lleva a Robotcito y tráelo de vuelta.", blocks: ["forward", "backward"], sequence: ["forward", "backward"], hint: "Cambia el orden de los bloques y predice el resultado antes de ejecutar.", guide: [{ icon: "➡️", title: "Cada bloque es un paso", text: "Un programa es como una receta: Robotcito realiza la primera instrucción y solo después pasa a la siguiente." }, { icon: "🔁", title: "Compara los dos movimientos", text: "Avanzar lo aleja de su inicio y Retroceder lo devuelve. Colócalos en ese orden para completar el viaje." }, { icon: "🧪", title: "Comprueba tu idea", text: "Agrega ambos bloques, revisa que estén ordenados y ejecuta. Si el recorrido no coincide, puedes arrastrarlos para probar otra secuencia." }] },
      { module: 1, kind: "error", name: "Corrige el rumbo", title: "Arregla el programa", objective: "Investiga una secuencia que no produce el recorrido esperado.", target: "¿Dónde está el error en el programa?", blocks: ["forward", "right"], sequence: ["forward", "right"], initialSequence: ["right", "forward"], hint: "Observa el primer movimiento: identifica qué debería ocurrir antes de girar.", guide: [{ icon: "🔎", title: "Observa antes de corregir", text: "Chiapaneco te propone investigar: ejecuta el programa inicial y mira por qué Robotcito no sigue la ruta esperada." }, { icon: "🧠", title: "Encuentra la causa", text: "El orden importa. Para avanzar hacia el destino primero necesitas Avanzar; después puedes usar Girar derecha para cambiar el rumbo." }, { icon: "🛠️", title: "Repara y vuelve a probar", text: "Quita el bloque que está fuera de lugar o arrástralo a la posición correcta. Ejecuta de nuevo y compara los dos resultados." }] },
      { module: 1, kind: "creative", name: "Tu pequeño recorrido", title: "Crea un recorrido", objective: "Diseña una ruta propia con Avanzar y giros.", target: "Crea tu propio recorrido.", blocks: ["forward", "right", "left"], creative: true, hint: "Primero imagina una ruta, después usa al menos tres bloques y comprueba cómo cambia con cada giro.", guide: [{ icon: "💡", title: "Imagina una ruta", text: "Ahora Chiapaneco te deja elegir. Piensa en un camino corto con una salida, un giro y una llegada." }, { icon: "🧱", title: "Combina instrucciones", text: "Usa Avanzar para recorrer distancia y un giro para cambiar de dirección. Puedes repetir bloques y crear tu propia idea." }, { icon: "✨", title: "Experimenta sin miedo", text: "No existe una única solución. Ejecuta, observa, cambia el orden y vuelve a intentarlo hasta que tu recorrido te guste." }] },
      { module: 1, kind: "open", name: "Reto del módulo", title: "Llega a tu destino", objective: "Construye un recorrido de al menos cuatro bloques.", target: "Construye un camino hasta tu destino.", blocks: ["forward", "backward", "right", "left"], open: true, hint: "Planifica cuatro o más pasos y utiliza la ejecución para descubrir cómo mejorar tu camino.", guide: [{ icon: "🗺️", title: "Planea tu misión", text: "Este es el gran reto del módulo. Antes de tocar bloques, decide qué camino quieres que siga Robotcito." }, { icon: "🧩", title: "Construye paso a paso", text: "Necesitas al menos cuatro bloques. Mezcla avances, retrocesos y giros; cada bloque agrega una parte nueva a tu recorrido." }, { icon: "🏆", title: "Prueba, aprende y mejora", text: "Ejecuta tu programa y no te preocupes si no sale perfecto. Los programadores observan, corrigen y vuelven a probar." }] },
      { module: 2, kind: "guided", name: "Pausa y continúa", title: "Espera un momento", objective: "Usa una pausa para cambiar el ritmo de un recorrido.", target: "Incluye una pausa en el recorrido.", blocks: ["forward", "wait"], sequence: ["forward", "wait", "forward"], hint: "Coloca Esperar entre dos movimientos y observa cómo el tiempo cambia la coreografía.", guide: [{ icon: "⏱️", title: "El tiempo también programa", text: "Chiapaneco te muestra una nueva idea: un programa no solo dice qué hacer, también puede decir cuándo hacerlo." }, { icon: "⏸️", title: "Conoce Esperar", text: "El bloque Esperar crea una pausa. Robotcito se queda quieto durante ese tiempo antes de continuar." }, { icon: "🎬", title: "Crea el ritmo", text: "Coloca Avanzar, luego Esperar y después otro Avanzar. Así la acción tendrá un momento de pausa entre sus movimientos." }, { icon: "▶️", title: "Mira la diferencia", text: "Ejecuta y observa el ritmo. Después cambia la duración de Esperar para descubrir cómo se transforma el recorrido." }] },
      { module: 2, kind: "comprehension", name: "Lee la secuencia", title: "Primero piensa", objective: "Analiza un programa que combina movimiento y tiempo.", target: "Crea un recorrido con movimiento y pausa.", blocks: ["forward", "wait"], sequence: ["forward", "wait", "forward"], hint: "Lee de arriba abajo: identifica qué sucede antes, durante y después de la pausa.", guide: [{ icon: "📖", title: "Lee como una historia", text: "Cada bloque representa una escena. Primero Robotcito avanza, después se detiene un momento y al final vuelve a avanzar." }, { icon: "🔬", title: "Predice el resultado", text: "Antes de ejecutar, imagina el recorrido completo. Explicar lo que pasará te ayuda a pensar como programador." }, { icon: "✅", title: "Comprueba tu predicción", text: "Arma la secuencia y ejecútala. Si viste algo distinto, revisa el orden y la duración de cada bloque." }] },
      { module: 2, kind: "error", name: "Repara la pausa", title: "Corrige la pausa", objective: "Investiga por qué una pausa colocada en otro lugar cambia el resultado.", target: "¿Dónde debe estar la pausa?", blocks: ["forward", "wait"], sequence: ["forward", "wait", "forward"], initialSequence: ["wait", "forward", "forward"], hint: "Observa cuándo ocurre la pausa y prueba moverla para que Robotcito espere después de avanzar.", guide: [{ icon: "🕵️", title: "Detecta el momento extraño", text: "El programa comienza con una pausa. Observa qué significa eso para Robotcito y por qué el recorrido tarda en comenzar." }, { icon: "↔️", title: "Cambia el orden", text: "Arrastra Esperar después del primer Avanzar. La misma instrucción puede producir una experiencia diferente según su posición." }, { icon: "🌟", title: "Verifica la reparación", text: "Ejecuta la nueva secuencia y explica con tus palabras qué cambió. Entender el motivo es tan importante como acertar." }] },
      { module: 2, kind: "creative", name: "Coreografía robótica", title: "Crea una coreografía", objective: "Combina avances, giros y una pausa para crear una coreografía.", target: "Crea una coreografía para Robotcito.", blocks: ["forward", "right", "left", "wait"], creative: true, hint: "Incluye un giro y una pausa para que tu coreografía tenga ritmo.", guide: [{ icon: "🎵", title: "Piensa en una coreografía", text: "Chiapaneco te invita a crear una pequeña danza: un avance, un giro y un instante de espera pueden contar una historia." }, { icon: "🎼", title: "Ordena los pasos", text: "Combina Avanzar, Girar y Esperar. El orden decide si Robotcito se mueve suave, cambia de dirección o hace una pausa sorpresa." }, { icon: "🎉", title: "Presenta tu creación", text: "Ejecuta tu coreografía, observa el resultado y ajusta la duración o el orden hasta que tenga el ritmo que imaginaste." }] },
      { module: 2, kind: "open", name: "Reto final", title: "Programa sin instrucciones", objective: "Construye un programa de cinco bloques o más.", target: "Crea un programa original con Robotcito.", blocks: ["forward", "backward", "right", "left", "wait"], open: true, hint: "Diseña un programa de cinco o más bloques, ejecútalo y explica qué hace cada parte.", guide: [{ icon: "🚀", title: "Llegaste al reto final", text: "Aquí puedes usar todo lo aprendido. Chiapaneco te acompaña, pero la solución será completamente tuya." }, { icon: "🧠", title: "Explica tu estrategia", text: "Construye cinco o más bloques y piensa qué función cumple cada uno: movimiento, dirección o tiempo." }, { icon: "🏅", title: "Celebra tu programa", text: "Ejecuta, observa y mejora. Cuando puedas contar cómo funciona tu secuencia, habrás dado un gran paso como programador." }] }
    ];
    const moduleInfo = {
      1: { name: "Fundamentos del movimiento", level: "Introductorio", focus: "Instrucciones, orden y movimiento", welcome: "Conocerás los bloques básicos, aprenderás a ordenar instrucciones y descubrirás cómo cada acción cambia el movimiento de Robotcito." },
      2: { name: "Secuencias y control del tiempo", level: "Básico", focus: "Secuencias, pausas y ritmo", welcome: "Aprenderás a combinar varios pasos, corregir el orden de una secuencia y usar pausas para crear recorridos con ritmo." }
    };
    const COURSE_TEST_MODE = false;
    if (!picker || !dropZone || !executeButton) return;
    let current = 0, currentModule = 1, actions = [], running = false, canReset = false, frame = null, started = 0, duration = 0, guideIndex = 0, positionX = 0, rotation = 0, invalidExecutions = 0, inactivityTimer = null, hintAvailable = false, selectedProgramIndex = null;
    const progressStorageKey = "robobloques-course-progress";
    const legacyStorageKey = "robobloques-course-completed";
    let progress;
    try {
      progress = JSON.parse(localStorage.getItem(progressStorageKey) || "null");
      if (!progress || !Array.isArray(progress.completedMissions)) {
        const legacyCompleted = JSON.parse(localStorage.getItem(legacyStorageKey) || "[]");
        progress = { completedMissions: Array.isArray(legacyCompleted) ? legacyCompleted : [], stars: 0, achievements: [], selectedCharacter: "robotcito", lastModule: 1 };
        localStorage.setItem(progressStorageKey, JSON.stringify(progress));
      }
    } catch (error) {
      progress = { completedMissions: [], stars: 0, achievements: [], selectedCharacter: "robotcito", lastModule: 1 };
      localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    }
    const completed = progress.completedMissions;
    const labels = { forward: ["⬆️", "Avanzar"], backward: ["⬇️", "Retroceder"], right: ["↷", "Girar derecha"], left: ["↶", "Girar izquierda"], wait: ["⏱️", "Esperar"] };
    const defaultParameters = { forward: { duration: 2 }, backward: { duration: 2 }, right: { degrees: 45 }, left: { degrees: 45 }, wait: { duration: 1 } };
    function mission() { return missions[current]; }
    function isLockedMission() { return moduleMissions(mission().module).indexOf(mission()) === 0; }
    function createAction(type) { return Object.assign({ type: type }, defaultParameters[type] || {}); }
    function parameterMarkup(entry) {
      if (isLockedMission()) {
        return entry.duration ? "<small class=\"course-locked-value\">· " + entry.duration + " s</small>" : entry.degrees ? "<small class=\"course-locked-value\">· " + entry.degrees + "°</small>" : "";
      }
      if (entry.type === "forward" || entry.type === "backward" || entry.type === "wait") return "<label>Segundos <input class=\"course-parameter\" data-parameter=\"duration\" type=\"number\" min=\"0.1\" max=\"60\" step=\"0.1\" value=\"" + entry.duration + "\"></label>";
      if (entry.type === "right" || entry.type === "left") return "<label>Grados <input class=\"course-parameter\" data-parameter=\"degrees\" type=\"number\" min=\"1\" max=\"360\" step=\"1\" value=\"" + entry.degrees + "\"></label>";
      return "";
    }
    function moduleMissions(module) { return missions.filter(function (item) { return item.module === module; }); }
    function moduleComplete(module) { return moduleMissions(module).every(function (item) { return completed.indexOf(missions.indexOf(item)) >= 0; }); }
    function saveProgress() { progress.completedMissions = completed; progress.lastModule = currentModule; localStorage.setItem(progressStorageKey, JSON.stringify(progress)); }
    function updateProgressDisplay() { const percentage = Math.round(completed.length * 100 / missions.length); document.querySelector("#course-percent").textContent = percentage + "%"; document.querySelector("#course-progress-bar").style.width = percentage + "%"; }
    function setMessage() {}
    function enableHint() {
      if (completed.indexOf(current) >= 0 || hintAvailable) return;
      hintAvailable = true;
      hintButton.disabled = false;
      hintButton.setAttribute("aria-label", "Mostrar pista");
    }
    function showHint(text) {
      if (!hintBubble || !hintText) return;
      if (completed.indexOf(current) >= 0 || !hintAvailable) return;
      hintText.textContent = text || mission().hint;
      hintBubble.classList.add("is-visible");
      hintBubble.setAttribute("aria-hidden", "false");
      hintButton.setAttribute("aria-expanded", "true");
    }
    function resetInactivity() {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(function () {
        if (completed.indexOf(current) >= 0) return;
        if (!running && !guide.classList.contains("is-visible")) {
          enableHint();
        }
      }, 18000);
    }
    function controls() { executeButton.disabled = running; if (stopButton) stopButton.disabled = !running; if (restartButton) restartButton.disabled = running || !canReset; }
    function hideSuccess() { if (success) { success.classList.remove("is-visible"); success.setAttribute("aria-hidden", "true"); } if (successScrim) { successScrim.classList.remove("is-visible"); successScrim.setAttribute("aria-hidden", "true"); } document.body.classList.remove("lesson-success-active"); }
    function showSuccess() { updateSuccessNavigation(); if (successScrim) { successScrim.classList.remove("is-visible"); void successScrim.offsetWidth; successScrim.classList.add("is-visible"); successScrim.setAttribute("aria-hidden", "false"); } if (success) { success.classList.remove("is-visible"); void success.offsetWidth; success.classList.add("is-visible"); success.setAttribute("aria-hidden", "false"); } document.body.classList.add("lesson-success-active"); }
    function updateSuccessNavigation() {
      const items = moduleMissions(currentModule);
      const position = items.indexOf(mission());
      const previous = position > 0;
      const next = position >= 0 && position < items.length - 1 && isMissionUnlocked(missions.indexOf(items[position + 1]));
      if (successPrevious) successPrevious.hidden = !previous;
      if (successNext) successNext.hidden = !next;
    }
    function completeMission() { if (completed.indexOf(current) < 0) completed.push(current); progress.stars = completed.length; saveProgress(); if (inactivityTimer) clearTimeout(inactivityTimer); hintAvailable = false; hintButton.disabled = true; if (hintBubble) { hintBubble.classList.remove("is-visible"); hintBubble.setAttribute("aria-hidden", "true"); hintButton.setAttribute("aria-expanded", "false"); } closeGuide(); renderMissionList(); renderModules(); updateMissionNavigation(); updateProgressDisplay(); }
    function isMissionUnlocked(index) { if (COURSE_TEST_MODE) return true; const item = missions[index]; const moduleIndex = moduleMissions(item.module).indexOf(item); return moduleIndex === 0 || completed.indexOf(missions.indexOf(moduleMissions(item.module)[moduleIndex - 1])) >= 0; }
    function updateMissionNavigation() { if (!previousMissionButton || !nextMissionButton || !missionNavigationStatus) return; const moduleItems = moduleMissions(currentModule); const modulePosition = moduleItems.indexOf(mission()); const previous = modulePosition > 0 ? missions.indexOf(moduleItems[modulePosition - 1]) : -1; const next = modulePosition < moduleItems.length - 1 ? missions.indexOf(moduleItems[modulePosition + 1]) : -1; previousMissionButton.disabled = previous < 0; nextMissionButton.disabled = next < 0 || !isMissionUnlocked(next); missionNavigationStatus.textContent = "Misión " + (modulePosition + 1) + " de " + moduleItems.length; previousMissionButton.setAttribute("aria-label", previous >= 0 ? "Ir a " + moduleItems[modulePosition - 1].name : "No hay misión anterior"); nextMissionButton.setAttribute("aria-label", next >= 0 ? "Ir a " + moduleItems[modulePosition + 1].name : "No hay misión siguiente"); }
    function renderModules() { const list = document.querySelector("#module-list"); if (!list) return; list.innerHTML = ""; [1, 2].forEach(function (module) { const info = moduleInfo[module]; const unlocked = COURSE_TEST_MODE || module === 1 || moduleComplete(1); const button = document.createElement("button"); button.type = "button"; button.className = "module-item " + (module === currentModule ? "is-current " : "") + (!unlocked ? "is-locked" : ""); button.disabled = !unlocked; button.innerHTML = "<span>" + module + "</span><div><strong>" + info.name + "</strong><small class=\"module-level\">" + info.level + "</small><small>" + info.focus + "</small><small>" + (moduleComplete(module) ? "Completado" : unlocked ? "Disponible" : "Bloqueado") + "</small></div><b>" + (unlocked ? "›" : "🔒") + "</b>"; button.addEventListener("click", function () { if (unlocked) loadModule(module); }); list.appendChild(button); }); }
    function renderMissionList() { const list = document.querySelector("#mission-list"); list.innerHTML = ""; missions.forEach(function (item, index) { if (item.module !== currentModule) return; const moduleIndex = moduleMissions(currentModule).indexOf(item); const unlocked = COURSE_TEST_MODE || moduleIndex === 0 || completed.indexOf(missions.indexOf(moduleMissions(currentModule)[moduleIndex - 1])) >= 0; const el = document.createElement("button"); el.type = "button"; el.className = "lesson-item " + (index === current ? "is-current " : "") + (!unlocked ? "is-locked" : ""); el.disabled = !unlocked; el.innerHTML = "<span>" + (moduleIndex + 1) + "</span><div><strong>" + item.name + "</strong><small>" + (completed.indexOf(index) >= 0 ? "Completada" : unlocked ? "Disponible" : "Bloqueada") + "</small></div><b>" + (unlocked ? "›" : "🔒") + "</b>"; el.addEventListener("click", function () { if (unlocked) loadMission(index); }); list.appendChild(el); }); }
    function loadModule(module) { currentModule = module; progress.lastModule = module; saveProgress(); const first = moduleMissions(module).find(function (item) { return completed.indexOf(missions.indexOf(item)) < 0; }) || moduleMissions(module)[0]; loadMission(missions.indexOf(first), true); }
    function renderProgram() { dropZone.innerHTML = ""; if (!actions.length) { selectedProgramIndex = null; dropZone.innerHTML = "<div class=\"empty-program\"><span class=\"plus-icon\">＋</span><p>Suelta aquí tu bloque<br><small>o tócalo para añadirlo</small></p></div>"; return; } if (selectedProgramIndex !== null && selectedProgramIndex >= actions.length) selectedProgramIndex = null; actions.forEach(function (entry, index) { const block = document.createElement("div"); block.className = "program-block block-" + (entry.type === "wait" ? "control" : "movement") + (selectedProgramIndex === index ? " is-selected" : ""); block.draggable = !running && window.innerWidth > 700; block.dataset.index = index; block.innerHTML = "<span>" + labels[entry.type][0] + "</span><strong>" + labels[entry.type][1] + "</strong>" + parameterMarkup(entry) + "<button type=\"button\" aria-label=\"Quitar bloque\">×</button>"; block.addEventListener("click", function (event) { if (running || window.innerWidth > 700 || event.target.closest("button, input")) return; if (selectedProgramIndex === null) { selectedProgramIndex = index; renderProgram(); return; } if (selectedProgramIndex === index) { selectedProgramIndex = null; renderProgram(); return; } const from = selectedProgramIndex; const targetRect = block.getBoundingClientRect(); let to = index + (event.clientY > targetRect.top + targetRect.height / 2 ? 1 : 0); const moved = actions.splice(from, 1)[0]; if (from < to) to--; actions.splice(Math.max(0, Math.min(actions.length, to)), 0, moved); selectedProgramIndex = null; renderProgram(); resetInactivity(); }); block.addEventListener("dragstart", function (event) { event.dataTransfer.setData("text/course-index", String(index)); block.classList.add("is-dragging"); }); block.addEventListener("dragend", function () { block.classList.remove("is-dragging"); }); const parameter = block.querySelector(".course-parameter"); if (parameter) parameter.addEventListener("change", function (event) { const input = event.target; const value = input.dataset.parameter === "degrees" ? Math.max(1, Math.min(360, Math.round(Number(input.value) || 45))) : Math.max(.1, Math.min(60, Number(input.value) || 1)); entry[input.dataset.parameter] = value; input.value = value; resetInactivity(); }); block.querySelector("button").addEventListener("click", function () { if (!running) { actions.splice(index, 1); selectedProgramIndex = null; renderProgram(); resetInactivity(); if (!actions.length) enableHint(); } }); dropZone.appendChild(block); }); }
    function addAction(type) { if (running || mission().blocks.indexOf(type) < 0) return; actions.push(createAction(type)); renderProgram(); resetInactivity(); }
    function renderPicker() { picker.innerHTML = ""; mission().blocks.forEach(function (type) { const button = document.createElement("button"); button.type = "button"; button.draggable = true; button.className = "visual-block block-" + (type === "wait" ? "control" : "movement"); button.innerHTML = "<span class=\"block-icon\">" + labels[type][0] + "</span><strong>" + labels[type][1] + "</strong>"; button.addEventListener("click", function () { addAction(type); }); button.addEventListener("dragstart", function (event) { event.dataTransfer.setData("text/course-action", type); }); picker.appendChild(button); }); }
    function loadMission(index, fromModule) { current = index; const item = mission(); currentModule = item.module; actions = (item.initialSequence || []).map(function (type) { return createAction(type); }); running = false; canReset = false; invalidExecutions = 0; hintAvailable = false; hintButton.disabled = true; if (frame) cancelAnimationFrame(frame); hideSuccess(); if (hintBubble) { hintBubble.classList.remove("is-visible"); hintBubble.setAttribute("aria-hidden", "true"); hintButton.setAttribute("aria-expanded", "false"); } renderPicker(); renderProgram(); renderMissionList(); renderModules(); updateMissionNavigation(); const kindNames = { guided: "guiada", comprehension: "comprensión", error: "corrección de errores", creative: "creativa", open: "reto abierto" }; const info = moduleInfo[item.module]; document.querySelector("#mission-eyebrow").textContent = "Módulo " + item.module + " · Misión " + (moduleMissions(item.module).indexOf(item) + 1); document.querySelector("#curso-title").textContent = item.name; document.querySelector("#lesson-number").textContent = "0" + (moduleMissions(item.module).indexOf(item) + 1); document.querySelector("#module-kicker").textContent = info.level + " · " + info.name + " · " + kindNames[item.kind]; document.querySelector("#lesson-title").textContent = item.title; document.querySelector("#lesson-objective").innerHTML = item.objective; document.querySelector("#lesson-target").textContent = item.target; document.querySelector("#lesson-challenge").textContent = item.target; document.querySelector("#block-note").textContent = isLockedMission() ? "Valores fijados en esta primera misión del módulo" : "Arrastra para ordenar y modifica duración o grados cuando aparezcan"; document.querySelector("#mission-progress").textContent = "⭐ Módulo " + item.module + " · " + (moduleMissions(item.module).indexOf(item) + 1) + " de " + moduleMissions(item.module).length; document.querySelector("#course-percent").textContent = Math.round(completed.length * 100 / missions.length) + "%"; document.querySelector("#course-progress-bar").style.width = (completed.length * 100 / missions.length) + "%"; character.style.transform = "translateX(0) rotate(0deg)"; controls(); guideIndex = 0; if (completed.indexOf(current) >= 0) closeGuide(); else if (moduleMissions(item.module).indexOf(item) === 0) showModuleWelcome(item.module); else showGuide(); resetInactivity(); }
    function positionGuide() {
      if (!guide || !guide.classList.contains("is-visible")) return;
      const spot = document.querySelector("#lesson-guide-spotlight");
      const card = guide.querySelector(".lesson-guide-card");
      const target = document.querySelector(guide.dataset.target || ".lesson-stage");
      const isWelcomeIntro = (guide.dataset.mode === "welcome" || guide.dataset.mode === "module-welcome") && !guide.dataset.target;
      if (!spot || !card) return;
      if (isWelcomeIntro) {
        spot.style.display = "none";
        card.style.left = "50%";
        card.style.top = "50%";
        card.style.right = "auto";
        card.style.bottom = "auto";
        card.style.transform = "translate(-50%, -50%)";
        guide.dataset.placement = "welcome";
        return;
      }
      if (!target) return;
      spot.style.display = "block";
      const mobile = window.innerWidth <= 700;
      if (mobile) {
        const current = target.getBoundingClientRect();
        const reserve = card.offsetHeight + 24;
        const safeTop = 12;
        const safeBottom = window.innerHeight - reserve;
        const available = Math.max(120, safeBottom - safeTop);
        const desired = current.height <= available ? safeTop + (available - current.height) / 2 : safeTop;
        guideScrollLock = true;
        window.scrollTo(0, Math.max(0, window.scrollY + current.top - desired));
      }
      window.setTimeout(function () {
        const b = target.getBoundingClientRect();
        const p = guide.getBoundingClientRect();
        const padding = mobile ? 6 : 8;
        const safeBottom = mobile ? window.innerHeight - card.offsetHeight - 24 : window.innerHeight - 8;
        const top = Math.max(mobile ? 6 : 8, b.top - padding);
        const bottom = Math.min(safeBottom, b.bottom + padding);
        spot.style.display = (guide.dataset.mode === "welcome" || guide.dataset.mode === "module-welcome") && !guide.dataset.target ? "none" : "block";
        spot.style.left = Math.max(8, b.left - p.left - padding) + "px";
        spot.style.top = top - p.top + "px";
        spot.style.width = Math.min(window.innerWidth - 16, b.width + padding * 2) + "px";
        spot.style.height = Math.max(0, bottom - top) + "px";
        const gap = mobile ? 18 : 22;
        const margin = 14;
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;
        const targetLeft = b.left - p.left;
        const targetTop = top - p.top;
        const targetRight = targetLeft + b.width;
        const targetBottom = bottom - p.top;
        if (mobile) {
          card.style.left = margin + "px";
          card.style.top = Math.max(margin, p.height - cardHeight - margin) + "px";
          card.style.right = "auto";
          card.style.bottom = "auto";
          card.style.transform = "none";
          guide.dataset.placement = "mobile-bottom";
        } else {
          const candidates = [
            { side: "right", left: targetRight + gap, top: targetTop + (targetBottom - targetTop - cardHeight) / 2 },
            { side: "left", left: targetLeft - cardWidth - gap, top: targetTop + (targetBottom - targetTop - cardHeight) / 2 },
            { side: "bottom", left: targetLeft + (b.width - cardWidth) / 2, top: targetBottom + gap },
            { side: "top", left: targetLeft + (b.width - cardWidth) / 2, top: targetTop - cardHeight - gap }
          ];
          const fits = function (candidate) { return candidate.left >= margin && candidate.top >= margin && candidate.left + cardWidth <= p.width - margin && candidate.top + cardHeight <= p.height - margin; };
          const overlaps = function (candidate) { return candidate.left < targetRight && candidate.left + cardWidth > targetLeft && candidate.top < targetBottom && candidate.top + cardHeight > targetTop; };
          const placement = candidates.find(function (candidate) { return fits(candidate) && !overlaps(candidate); }) || candidates.find(fits) || candidates[2];
          card.style.left = Math.max(margin, Math.min(p.width - cardWidth - margin, placement.left)) + "px";
          card.style.top = Math.max(margin, Math.min(p.height - cardHeight - margin, placement.top)) + "px";
          card.style.right = "auto";
          card.style.bottom = "auto";
          card.style.transform = "none";
          guide.dataset.placement = placement.side;
        }
        guideScrollLock = false;
      }, mobile ? 50 : 0);
    }
    function showContextHelp(type) { const item = { forward: ["⬆️", "Bloque Avanzar", "Mueve a Robotcito hacia adelante."], backward: ["⬇️", "Bloque Retroceder", "Lo hace volver sobre su camino."], right: ["↷", "Bloque Girar derecha", "Cambia el rumbo 45 grados."], left: ["↶", "Bloque Girar izquierda", "Cambia el rumbo hacia el otro lado."], wait: ["⏱️", "Bloque Esperar", "Hace una pausa antes de continuar."] }[type]; if (!item) return; guide.dataset.target = "#lesson-blocks"; guide.dataset.demo = ""; document.querySelector("#lesson-guide-step").textContent = "Nuevo bloque"; document.querySelector("#lesson-guide-icon").textContent = item[0]; document.querySelector("#lesson-guide-title").textContent = item[1]; document.querySelector("#lesson-guide-text").textContent = isLockedMission() ? item[2] + " En esta misión el valor está fijado." : item[2] + " Después puedes cambiar sus segundos o grados y arrastrarlo para ordenar tu programa."; document.querySelector("#lesson-guide-next").textContent = "¡Entendido! ✓"; guide.classList.remove("is-welcome"); guide.classList.add("is-visible"); guide.setAttribute("aria-hidden", "false"); document.documentElement.classList.add("lesson-tour-active"); document.body.classList.add("lesson-tour-active"); document.querySelector("#lesson-guide-spotlight").style.display = "block"; replayGuideMessage(); setTimeout(positionGuide, 0); }
    function showModuleHelp() { guide.dataset.mode = ""; guide.dataset.target = ".lesson-intro"; guide.dataset.demo = ""; document.querySelector("#lesson-guide-step").textContent = "Comienza el módulo"; document.querySelector("#lesson-guide-icon").textContent = "🗺️"; document.querySelector("#lesson-guide-title").textContent = "Así funciona este módulo"; document.querySelector("#lesson-guide-text").textContent = "Aprenderás con misiones distintas: algunas te guían, otras te piden pensar, corregir errores y crear tus propias soluciones."; document.querySelector("#lesson-guide-next").textContent = "¡Vamos! ➜"; guide.classList.remove("is-welcome"); guide.classList.add("is-visible"); guide.setAttribute("aria-hidden", "false"); document.documentElement.classList.add("lesson-tour-active"); document.body.classList.add("lesson-tour-active"); document.querySelector("#lesson-guide-spotlight").style.display = "block"; replayGuideMessage(); setTimeout(positionGuide, 0); }
    function showModuleWelcome(module) { const info = moduleInfo[module]; guide.dataset.mode = "module-welcome"; guide.dataset.target = ""; guide.dataset.demo = ""; document.querySelector("#lesson-guide-step").textContent = "Módulo " + module + " · Bienvenida"; document.querySelector("#lesson-guide-icon").textContent = module === 1 ? "🧭" : "⏱️"; document.querySelector("#lesson-guide-title").textContent = "¡Comienza " + info.name + "!"; document.querySelector("#lesson-guide-text").textContent = info.welcome; document.querySelector("#lesson-guide-next").textContent = "Comenzar misión ➜"; guide.classList.add("is-visible", "is-welcome"); guide.setAttribute("aria-hidden", "false"); document.documentElement.classList.add("lesson-tour-active"); document.body.classList.add("lesson-tour-active"); replayGuideMessage(); setTimeout(positionGuide, 0); }
    function showWelcome() { guide.dataset.mode = "welcome"; guide.dataset.welcomeIndex = "0"; guide.dataset.target = ""; guide.dataset.demo = ""; document.querySelector("#lesson-guide-step").textContent = "Tu aventura comienza"; document.querySelector("#lesson-guide-icon").textContent = "🌿"; document.querySelector("#lesson-guide-title").textContent = "¡Hola, explorador!"; document.querySelector("#lesson-guide-text").textContent = "Soy Chiapaneco y te acompañaré a aprender programación. En este curso conocerás las misiones, armarás programas con bloques y verás a Robotcito poner tus ideas en movimiento."; document.querySelector("#lesson-guide-next").textContent = "Conocer el curso ➜"; guide.classList.add("is-visible", "is-welcome"); guide.setAttribute("aria-hidden", "false"); document.documentElement.classList.add("lesson-tour-active"); document.body.classList.add("lesson-tour-active"); replayGuideMessage(); setTimeout(positionGuide, 0); }
    function guideSteps() { const steps = mission().guide ? mission().guide.slice() : []; if (!isLockedMission()) steps.push({ icon: "🛠️", title: "Modifica y ordena", text: "Puedes cambiar los segundos o grados de cada bloque y arrastrarlos para ordenar tu programa." }); return steps; }
    function showGuide() { const steps = guideSteps(); if (!steps.length) return; const step = steps[guideIndex]; guide.dataset.target = guideIndex === 0 ? ".lesson-stage" : guideIndex === steps.length - 1 ? "#lesson-drop-zone" : guideIndex === 1 ? "#lesson-blocks" : "#lesson-drop-zone"; guide.dataset.demo = guideIndex === 2 || guideIndex === 3 ? "drag" : guideIndex === 4 ? "execute" : ""; document.querySelector("#lesson-guide-step").textContent = guideIndex + 1 + " de " + steps.length; document.querySelector("#lesson-guide-icon").textContent = step.icon; document.querySelector("#lesson-guide-title").textContent = step.title; document.querySelector("#lesson-guide-text").textContent = step.text + (!isLockedMission() && guideIndex < steps.length - 1 ? " También puedes editar los segundos o grados y arrastrar los bloques para cambiar su orden." : ""); document.querySelector("#lesson-guide-next").textContent = guideIndex === steps.length - 1 ? "¡Entendido! ✓" : "Siguiente ➜"; guide.classList.remove("is-welcome"); guide.classList.add("is-visible"); guide.setAttribute("aria-hidden", "false"); document.documentElement.classList.add("lesson-tour-active"); document.body.classList.add("lesson-tour-active"); document.querySelector("#lesson-guide-spotlight").style.display = "block"; replayGuideMessage(); setTimeout(positionGuide, 0); }
    function closeGuide() { guide.classList.remove("is-visible", "is-welcome"); guide.setAttribute("aria-hidden", "true"); guide.dataset.demo = ""; guide.dataset.mode = ""; document.documentElement.classList.remove("lesson-tour-active"); document.body.classList.remove("lesson-tour-active"); guideScrollLock = false; guideLockedScrollY = window.scrollY; }
    document.querySelector("#lesson-guide-next").addEventListener("click", function () { if (guide.dataset.mode === "module-welcome") { closeGuide(); showGuide(); return; } if (guide.dataset.mode === "welcome") { const welcomeSteps = [{ target: ".lesson-sidebar", icon: "🗺️", title: "Elige una misión", text: "En la columna izquierda podrás ver tu progreso, cambiar de módulo y escoger la misión que quieres practicar." }, { target: "#lesson-blocks", icon: "🧩", title: "Arma tu programa", text: "Aquí encontrarás los bloques disponibles. Tócalos para agregarlos y ordénalos en el espacio de trabajo." }, { target: ".lesson-stage", icon: "🤖", title: "Observa el resultado", text: "Robotcito ejecutará tus instrucciones en este escenario. Cuando estés listo, pulsa Ejecutar simulación." }]; const welcomeIndex = Number(guide.dataset.welcomeIndex || 0) + 1; if (welcomeIndex < welcomeSteps.length) { guide.dataset.welcomeIndex = String(welcomeIndex); const step = welcomeSteps[welcomeIndex]; guide.classList.remove("is-welcome"); guide.dataset.target = step.target; document.querySelector("#lesson-guide-spotlight").style.display = "block"; document.querySelector("#lesson-guide-step").textContent = (welcomeIndex + 1) + " de " + welcomeSteps.length; document.querySelector("#lesson-guide-icon").textContent = step.icon; document.querySelector("#lesson-guide-title").textContent = step.title; document.querySelector("#lesson-guide-text").textContent = step.text; document.querySelector("#lesson-guide-next").textContent = welcomeIndex === welcomeSteps.length - 1 ? "Comenzar misión 🚀" : "Siguiente ➜"; setTimeout(positionGuide, 0); } else closeGuide(); return; } if (guideIndex < guideSteps().length - 1) { guideIndex++; showGuide(); } else closeGuide(); });
    hintButton.addEventListener("click", function () { const isVisible = hintBubble.classList.toggle("is-visible"); hintBubble.setAttribute("aria-hidden", String(!isVisible)); hintButton.setAttribute("aria-expanded", String(isVisible)); if (isVisible) hintText.textContent = mission().hint; resetInactivity(); });
    window.addEventListener("resize", positionGuide);
    dropZone.addEventListener("dragover", function (event) { if (event.dataTransfer.types.indexOf("text/course-action") >= 0 || event.dataTransfer.types.indexOf("text/course-index") >= 0) { event.preventDefault(); dropZone.classList.add("is-over"); } });
    dropZone.addEventListener("dragleave", function () { dropZone.classList.remove("is-over"); });
    dropZone.addEventListener("drop", function (event) { event.preventDefault(); dropZone.classList.remove("is-over"); const draggedIndex = event.dataTransfer.getData("text/course-index"); if (draggedIndex !== "") { const from = Number(draggedIndex); const target = event.target.closest(".program-block"); let to = target ? Number(target.dataset.index) : actions.length; if (from !== to) { const moved = actions.splice(from, 1)[0]; if (from < to) to--; actions.splice(Math.max(0, to), 0, moved); renderProgram(); resetInactivity(); } return; } addAction(event.dataTransfer.getData("text/course-action")); });
    executeButton.addEventListener("click", function () { if (running) return; resetInactivity(); const item = mission(); const actual = actions.map(function (a) { return a.type; }); if (!actions.length) { enableHint(); return; } const valid = item.creative ? actual.length >= 3 && actual.some(function (type) { return type === "right" || type === "left"; }) : item.open ? actual.length >= 4 : actual.join(",") === item.sequence.join(","); if (!valid) { invalidExecutions++; if (invalidExecutions >= 2) enableHint(); return; } invalidExecutions = 0; const expected = item.sequence || actual; hideSuccess(); running = true; canReset = false; controls(); let step = 0, stepStart = performance.now(), stepX = positionX, stepRotation = rotation; function finish() { running = false; canReset = true; controls(); completeMission(); showSuccess(); } function animate(now) { if (!running) return; const type = expected[step], entry = actions[step] || createAction(type); const stepDuration = entry.duration ? entry.duration * 1000 : 500; const progress = Math.min(1, (now - stepStart) / stepDuration); const limit = Math.max(120, (stage ? stage.clientWidth : 400) - 150); let targetX = stepX, targetRotation = stepRotation; if (type === "forward") targetX = Math.min(limit, stepX + 110); if (type === "backward") targetX = Math.max(0, stepX - 110); if (type === "right") targetRotation = stepRotation + (entry.degrees || 45); if (type === "left") targetRotation = stepRotation - (entry.degrees || 45); positionX = stepX + (targetX - stepX) * progress; rotation = stepRotation + (targetRotation - stepRotation) * progress; character.style.transform = "translateX(" + positionX + "px) rotate(" + rotation + "deg)"; if (progress < 1) { frame = requestAnimationFrame(animate); return; } positionX = targetX; rotation = targetRotation; step++; if (step >= expected.length) { finish(); return; } stepStart = now; stepX = positionX; stepRotation = rotation; frame = requestAnimationFrame(animate); } frame = requestAnimationFrame(animate); });
    stopButton.addEventListener("click", function () { if (!running) return; running = false; if (frame) cancelAnimationFrame(frame); canReset = true; controls(); resetInactivity(); });
    restartButton.addEventListener("click", function () { if (running || !canReset) return; if (frame) cancelAnimationFrame(frame); positionX = 0; rotation = 0; character.style.transform = "translateX(0) rotate(0deg)"; hideSuccess(); running = false; canReset = false; controls(); resetInactivity(); });
    successReplay.addEventListener("click", function () { hideSuccess(); loadMission(current); });
    successPrevious.addEventListener("click", function () { const items = moduleMissions(currentModule), position = items.indexOf(mission()); if (position > 0) { hideSuccess(); loadMission(missions.indexOf(items[position - 1])); } });
    successNext.addEventListener("click", function () { const items = moduleMissions(currentModule), position = items.indexOf(mission()), next = position + 1 < items.length ? missions.indexOf(items[position + 1]) : -1; if (next >= 0 && isMissionUnlocked(next)) { hideSuccess(); loadMission(next); } });
    previousMissionButton.addEventListener("click", function () { const items = moduleMissions(currentModule), position = items.indexOf(mission()); if (position > 0) loadMission(missions.indexOf(items[position - 1])); });
    nextMissionButton.addEventListener("click", function () { const items = moduleMissions(currentModule), position = items.indexOf(mission()), next = position + 1 < items.length ? missions.indexOf(items[position + 1]) : -1; if (next >= 0 && isMissionUnlocked(next)) loadMission(next); });
    resetProgressButton.addEventListener("click", function () { if (!window.confirm("¿Quieres borrar tu progreso del curso?")) return; completed.splice(0, completed.length); progress.stars = 0; progress.achievements = []; progress.lastModule = 1; saveProgress(); renderMissionList(); renderModules(); updateMissionNavigation(); updateProgressDisplay(); loadMission(0); });
    renderMissionList(); updateProgressDisplay(); loadMission(0);
  }  const stage = document.getElementById("escenario");
  if (!stage) { initCourse(); return; }
  const selectedCharacter = function () { return state.characters.find(function (character) { return character.id === state.selectedId; }); };
  function hideCharacterMenu() {
    state.menuVisible = false;
    const menu = stage.querySelector(".stage-action-menu");
    if (menu) menu.remove();
    document.documentElement.classList.remove("mobile-program-open");
  }
  function setExecutionControls(running) {
    $("#execute-program").disabled = running;
    $("#stop-program").disabled = !running;
    $("#restart-program").disabled = running || !state.canReset;
  }
  function resetExecution(character) {
    state.running = false;
    if (state.run) {
      state.run.cancelled = true;
      Object.keys(state.run.frames).forEach(function (id) {
        if (state.run.frames[id]) cancelAnimationFrame(state.run.frames[id]);
      });
      Object.keys(state.run.speechTimers || {}).forEach(function (id) {
        clearTimeout(state.run.speechTimers[id]);
      });
      state.run = null;
    }
    stage.querySelectorAll(".speech-bubble").forEach(function (bubble) { bubble.remove(); });
    state.characters.forEach(function (item) {
      item.position = Object.assign({}, item.initialPosition);
      item.direction = item.initialDirection;
    });
    document.getElementById("paint-layer").innerHTML = "";
    setExecutionControls(false);
    renderCharacters();
  }

  function renderCharacters() {
    stage.querySelectorAll(".stage-character").forEach(function (element) { element.remove(); });
    state.characters.forEach(function (character) {
      const actor = document.createElement("button");
      actor.className = "stage-character" + (character.id === state.selectedId ? " is-selected" : "");
      actor.type = "button";
      actor.setAttribute("aria-label", character.name);
      actor.dataset.characterId = character.id;
      actor.style.left = character.position.x + "%";
      actor.style.top = character.position.y + "%";
      actor.classList.toggle("is-running", state.running);
      actor.innerHTML = "<img style=\"transform: rotate(" + character.direction + "deg)\" src=\"" + character.image + "\" alt=\"" + character.name + "\">";
      actor.addEventListener("click", function () { selectCharacter(character.id, true); });
      addDragBehavior(actor, character);
      stage.appendChild(actor);
    });
    $("#stage-counter").textContent = state.characters.length + (state.characters.length === 1 ? " personaje" : " personajes");
    const sequenceCharacter = $("#sequence-character");
    if (sequenceCharacter) sequenceCharacter.textContent = selectedCharacter() ? "Programando a " + selectedCharacter().name : "Selecciona un personaje";
    const deleteCharacterButton = $("#delete-character");
    if (deleteCharacterButton) deleteCharacterButton.disabled = !selectedCharacter() || state.running;
  }

  function addDragBehavior(actor, character) {
    let dragging = false;
    let grabOffsetX = 0;
    let grabOffsetY = 0;
    actor.addEventListener("pointerdown", function (event) {
      if (state.running) return;
      dragging = true;
      const actorBounds = actor.getBoundingClientRect();
      grabOffsetX = event.clientX - actorBounds.left;
      grabOffsetY = event.clientY - actorBounds.top;
      actor.setPointerCapture(event.pointerId);
      actor.classList.add("is-dragging");
      event.preventDefault();
    });
    actor.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      const bounds = stage.getBoundingClientRect();
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      const left = event.clientX - bounds.left - stage.clientLeft - grabOffsetX;
      const top = event.clientY - bounds.top - stage.clientTop - grabOffsetY;
      const maxLeft = Math.max(0, stageWidth - actor.offsetWidth);
      const maxTop = Math.max(0, stageHeight - actor.offsetHeight);
      character.position.x = Math.max(0, Math.min(maxLeft, left)) / stageWidth * 100;
      character.position.y = Math.max(0, Math.min(maxTop, top)) / stageHeight * 100;
      character.initialPosition = { x: character.position.x, y: character.position.y };
      actor.style.left = character.position.x + "%";
      actor.style.top = character.position.y + "%";
      if (character.id === state.selectedId && state.menuVisible) updateStageMenuPosition(character);
    });
    actor.addEventListener("pointerup", function (event) {
      dragging = false;
      actor.classList.remove("is-dragging");
      actor.releasePointerCapture(event.pointerId);
    });
  }

  function selectCharacter(id, showMenu) {
    state.selectedId = id;
    renderCharacters();
    renderSequence();
    if (showMenu) {
      state.menuVisible = true;
      document.documentElement.classList.add("mobile-program-open");
      if (mobileSequenceMenuToggle) mobileSequenceMenuToggle.setAttribute("aria-expanded", "true");
      renderStageMenu();
    }
    $("#stage-status").textContent = "Programando a " + selectedCharacter().name;
  }

  function addCharacter(templateId, x, y) {
    const template = characterCatalog.find(function (item) { return item.id === templateId; });
    if (!template) return;
    const sameCharacters = state.characters.filter(function (item) { return item.templateId === template.id; });
    const character = Object.assign({}, template, { id: template.id + "-" + Date.now(), templateId: template.id, name: template.name + " " + (sameCharacters.length + 1), position: { x: x, y: y }, initialPosition: { x: x, y: y }, direction: 0, initialDirection: 0, actions: [] });
    state.characters.push(character);
    state.selectedId = character.id;
    renderCharacters();
    renderSequence();
    $("#stage-status").textContent = "Haz clic sobre " + character.name + " para agregar acciones";
  }

  function deleteSelectedCharacter() {
    const character = selectedCharacter();
    if (!character || state.running) return;
    state.characters = state.characters.filter(function (item) { return item.id !== character.id; });
    state.selectedId = state.characters.length ? state.characters[state.characters.length - 1].id : null;
    renderCharacters();
    renderSequence();
    $("#stage-status").textContent = state.selectedId
      ? "Programando a " + selectedCharacter().name
      : "Escenario vacío: arrastra un personaje para comenzar";
    $("#simulation-message").textContent = "Personaje eliminado.";
  }

  function renderStageMenu() {
    const character = selectedCharacter();
    if (!character) return;
    const currentMenu = stage.querySelector(".stage-action-menu");
    if (currentMenu) currentMenu.remove();
    const menu = document.createElement("div");
    menu.className = "stage-action-menu";
    menu.style.left = Math.min(73, Math.max(7, character.position.x + 7)) + "%";
    menu.style.top = Math.min(70, Math.max(7, character.position.y - 10)) + "%";
    menu.innerHTML = "<div class=\"stage-menu-header\"><strong>Acciones de " + character.name + "</strong><button class=\"delete-character-button\" type=\"button\" aria-label=\"Eliminar " + character.name + "\">\uD83D\uDDD1\uFE0F</button></div><div class=\"stage-menu-drop\" id=\"stage-menu-drop\">＋</div><div class=\"stage-menu-actions\"></div>";
    stage.appendChild(menu);
    menu.querySelector(".delete-character-button").addEventListener("click", function () {
      resetExecution(character);
      state.characters = state.characters.filter(function (item) { return item.id !== character.id; });
      state.selectedId = null;
      state.menuVisible = false;
      menu.remove();
      renderCharacters();
      renderSequence();
      $("#stage-status").textContent = "Personaje eliminado: arrastra otro para comenzar";
    });
    const drop = menu.querySelector(".stage-menu-drop");
    drop.addEventListener("dragover", function (event) { event.preventDefault(); drop.classList.add("is-over"); });
    drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
    drop.addEventListener("drop", function (event) {
      event.preventDefault();
      drop.classList.remove("is-over");
      const type = event.dataTransfer.getData("text/action");
      if (type) addAction(type);
    });
    renderStageMenuActions();
    updateStageMenuPosition(character);
  }

  function updateStageMenuPosition(character) {
    const menu = stage.querySelector(".stage-action-menu");
    if (!menu) return;
    menu.style.left = Math.min(73, Math.max(7, character.position.x + 7)) + "%";
    menu.style.top = Math.min(70, Math.max(7, character.position.y - 10)) + "%";
  }

  function renderStageMenuActions() {
    const character = selectedCharacter();
    const container = stage.querySelector(".stage-menu-actions");
    if (!character || !container) return;
    container.innerHTML = "";
    character.actions.forEach(function (entry, index) {
      const action = actionCatalog[entry.type];
      const item = document.createElement("div");
      item.className = "stage-menu-action";
      const parameters = [];
      if (action.duration) parameters.push("<label>Segundos <input class=\"action-parameter\" data-parameter=\"duration\" type=\"number\" min=\"0.1\" max=\"60\" step=\"0.1\" value=\"" + (entry.duration || 1) + "\"></label>");
      if (action.degrees) parameters.push("<label>Grados <input class=\"action-parameter\" data-parameter=\"degrees\" type=\"number\" min=\"1\" max=\"360\" step=\"1\" value=\"" + (entry.degrees || 90) + "\"></label>");
      if (action.thickness) parameters.push("<label>Grosor <input class=\"action-parameter\" data-parameter=\"thickness\" type=\"number\" min=\"1\" max=\"30\" step=\"1\" value=\"" + (entry.thickness || 4) + "\"></label>");
      if (entry.type === "loop") parameters.push("<label>Veces <input class=\"action-parameter\" data-parameter=\"repetitions\" type=\"number\" min=\"1\" max=\"99\" step=\"1\" value=\"" + (entry.repetitions || 2) + "\"></label>");
      const parameter = parameters.join("");
      item.innerHTML = "<span class=\"stage-menu-action-number\">" + (index + 1) + "</span><span class=\"stage-menu-action-icon block-" + action.color + "\">" + action.icon + "</span><span class=\"stage-menu-action-copy\"><strong>" + action.label + "</strong><small>" + action.detail + "</small>" + parameter + "</span><button type=\"button\" aria-label=\"Quitar " + action.label + "\">×</button>";
      item.querySelectorAll(".action-parameter").forEach(function (input) {
        input.addEventListener("change", function () {
          const value = input.dataset.parameter === "duration"
            ? Math.max(.1, Math.min(60, Number(input.value) || 1))
            : input.dataset.parameter === "degrees"
              ? Math.max(1, Math.min(360, Math.round(Number(input.value) || 90)))
            : input.dataset.parameter === "thickness"
              ? Math.max(1, Math.min(30, Math.round(Number(input.value) || 4)))
              : Math.max(1, Math.min(99, Math.round(Number(input.value) || 2)));
          entry[input.dataset.parameter] = value;
          input.value = value;
        });
      });
      item.querySelector("button").addEventListener("click", function () {
        character.actions.splice(index, 1);
        renderCharacters();
        renderSequence();
      });
      container.appendChild(item);
    });
  }

  function renderLibrary() {
    const container = $("#action-buttons");
    container.innerHTML = "";
    const categories = ["characters", "movement", "paint", "loops", "control", "programmed"];
    function completedCourseModule(module) {
      if (module === 0) return true;
      try {
        const progress = JSON.parse(localStorage.getItem("robobloques-course-progress") || "null") || {};
        const completed = Array.isArray(progress.completedMissions) ? progress.completedMissions : [];
        const start = module === 1 ? 0 : 5;
        return completed.filter(function (index) {
          return Number.isInteger(index) && index >= start && index < start + 5;
        }).length >= 5;
      } catch (error) {
        return false;
      }
    }
    const requiredModule = { characters: 0, movement: 1, paint: 2, loops: 2, control: 2, programmed: 2 };
    categories.forEach(function (tabName) {
      const unlocked = completedCourseModule(requiredModule[tabName]);
      const section = document.createElement("section");
      section.className = "library-section" + (unlocked && state.openTabs[tabName] ? " is-open" : "") + (unlocked ? "" : " is-locked");
      section.dataset.tab = tabName;
      const toggle = document.createElement("button");
      toggle.className = "library-section-toggle";
      toggle.type = "button";
      toggle.disabled = !unlocked;
      toggle.setAttribute("aria-expanded", unlocked && state.openTabs[tabName] ? "true" : "false");
      toggle.setAttribute("aria-disabled", String(!unlocked));
      toggle.innerHTML = "<span>" + ({ characters: "\uD83D\uDC65", movement: "\u2195\uFE0F", paint: "\uD83D\uDD8C\uFE0F", loops: "\uD83D\uDD01", control: "\u2699\uFE0F", programmed: "\uD83D\uDCAC" }[tabName]) + "</span><strong>" + ({ characters: "Personajes", movement: "Movimiento", paint: "Pintar", loops: "Bucles", control: "Control", programmed: "Programadas" }[tabName]) + "</strong>" + (unlocked ? "<b>\u2304</b>" : "<span class=\"library-lock-icon\" aria-hidden=\"true\">\uD83D\uDD12</span>");
      toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        if (!unlocked) return;
        state.openTabs[tabName] = !state.openTabs[tabName];
        state.activeTab = tabName;
        renderLibrary();
      });
      section.appendChild(toggle);
      const content = document.createElement("div");
      content.className = "library-section-content";
      if (tabName === "characters") {
      characterCatalog.forEach(function (template) {
        const item = document.createElement("button");
        item.className = "character-item character-template";
        item.type = "button";
        item.draggable = true;
        let touchMoved = false;
        item.innerHTML = "<img src=\"" + template.image + "\" alt=\"\"><span><strong>" + template.name + "</strong><small>Arrastra o toca para agregar</small></span><b>＋</b>";
        item.addEventListener("dragstart", function (event) {
          event.dataTransfer.setData("text/character", template.id);
          event.dataTransfer.effectAllowed = "copy";
        });
        item.addEventListener("click", function () {
          if (item.dataset.touchHandled === "true") {
            delete item.dataset.touchHandled;
            return;
          }
          addCharacter(template.id, 22 + (state.characters.length % 3) * 25, 34 + (state.characters.length % 2) * 25);
        });
        item.addEventListener("pointerdown", function (event) {
          if (event.pointerType !== "mouse") touchMoved = false;
        });
        item.addEventListener("pointermove", function (event) {
          if (event.pointerType !== "mouse") touchMoved = true;
        });
        item.addEventListener("pointerup", function (event) {
          if (event.pointerType !== "mouse" && !touchMoved) {
            item.dataset.touchHandled = "true";
            addCharacter(template.id, 22 + (state.characters.length % 3) * 25, 34 + (state.characters.length % 2) * 25);
          }
        });
        addTouchDrag(item, function (event) {
          const target = document.elementFromPoint(event.clientX, event.clientY);
          if (!target || !target.closest("#escenario")) return;
          const bounds = stage.getBoundingClientRect();
          addCharacter(template.id, Math.max(7, Math.min(93, ((event.clientX - bounds.left) / bounds.width) * 100)), Math.max(12, Math.min(86, ((event.clientY - bounds.top) / bounds.height) * 100)));
        });
        content.appendChild(item);
      });
      } else tabs[tabName].forEach(function (type) {
      const action = actionCatalog[type];
      const button = document.createElement("button");
      button.className = "action-button block-" + action.color + (action.container ? " is-container" : "");
      button.type = "button";
      button.draggable = true;
      button.innerHTML = "<span>" + action.icon + "</span><strong>" + action.label + "</strong>";
      button.addEventListener("dragstart", function (event) { event.dataTransfer.setData("text/action", type); event.dataTransfer.effectAllowed = "copy"; });
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        if (button.dataset.touchDragged === "true") {
          delete button.dataset.touchDragged;
          return;
        }
        if (state.touchTargetCollection) {
          addActionToCollection(type, state.touchTargetCollection);
          state.touchTargetCollection = null;
        } else {
          addAction(type);
        }
        $("#simulation-message").textContent = "Bloque " + action.label + " agregado a " + (selectedCharacter() ? selectedCharacter().name : "la secuencia") + ".";
      });
      content.appendChild(button);
    });
      section.appendChild(content);
      container.appendChild(section);
    });
  }

  function addTouchDrag(element, onDrop) {
    let startX = 0;
    let startY = 0;
    let dragging = false;
    let pointerId = null;
    function moveDrag(event) {
      if (event.pointerId !== pointerId) return;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 8) {
        dragging = true;
        event.preventDefault();
      }
    }
    function finishDrag(event) {
      if (event.pointerId !== pointerId) return;
      document.removeEventListener("pointermove", moveDrag);
      document.removeEventListener("pointerup", finishDrag);
      document.removeEventListener("pointercancel", finishDrag);
      if (dragging) {
        element.dataset.touchDragged = "true";
        onDrop(event);
        event.preventDefault();
      }
      dragging = false;
      pointerId = null;
    }
    element.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse") return;
      if (event.target.closest("button, input")) return;
      startX = event.clientX;
      startY = event.clientY;
      dragging = false;
      pointerId = event.pointerId;
      document.addEventListener("pointermove", moveDrag, { passive: false });
      document.addEventListener("pointerup", finishDrag, { passive: false });
      document.addEventListener("pointercancel", finishDrag, { passive: false });
    });
  }

  function addActionToCollection(type, collection) {
    const character = selectedCharacter();
    if (!character || state.running || !actionCatalog[type] || !collection) return;
    const entry = { type: type, children: [] };
    if (actionCatalog[type].duration) entry.duration = 1;
    if (actionCatalog[type].degrees) entry.degrees = 90;
    if (type === "forwardPaint") entry.thickness = 4;
    if (type === "loop") entry.repetitions = 2;
    if (type === "say") entry.message = "";
    if (type === "say") entry.duration = 2;
    if (type === "heart") { entry.size = 18; entry.thickness = 4; }
    if (type === "star") { entry.size = 18; entry.thickness = 4; }
    collection.push(entry);
    renderCharacters();
    renderSequence();
    $("#simulation-message").textContent = "Bloque " + actionCatalog[type].label + " agregado dentro del bloque.";
  }

  function addAction(type, parent) {
    const character = selectedCharacter();
    if (!character || state.running || !actionCatalog[type]) return;
    const entry = { type: type, children: [] };
    if (actionCatalog[type].duration) entry.duration = 1;
    if (actionCatalog[type].degrees) entry.degrees = 90;
    if (type === "forwardPaint") entry.thickness = 4;
    if (type === "loop") entry.repetitions = 2;
    if (type === "say") entry.message = "";
    if (type === "say") entry.duration = 2;
    if (type === "heart") { entry.size = 18; entry.thickness = 4; }
    if (type === "star") { entry.size = 18; entry.thickness = 4; }
    (parent ? parent.children : character.actions).push(entry);
    renderCharacters();
    renderSequence();
  }

  function containsCollection(entry, collection) {
    if (entry.children === collection) return true;
    return entry.children.some(function (child) { return containsCollection(child, collection); });
  }

  function moveSequenceEntry(entry, sourceCollection, targetCollection, targetIndex) {
    if (!entry || !sourceCollection || !targetCollection || containsCollection(entry, targetCollection)) return;
    const sourceIndex = sourceCollection.indexOf(entry);
    if (sourceIndex === -1) return;
    sourceCollection.splice(sourceIndex, 1);
    if (sourceCollection === targetCollection && sourceIndex < targetIndex) targetIndex -= 1;
    targetCollection.splice(Math.max(0, Math.min(targetIndex, targetCollection.length)), 0, entry);
    state.touchSelectedSequence = null;
    renderCharacters();
    renderSequence();
  }

  function prepareSequenceDrop(targetCollection, targetIndex, event) {
    const sequenceType = event.dataTransfer.getData("text/sequence");
    if (sequenceType === "move" && state.draggedSequence) {
      event.preventDefault();
      event.stopPropagation();
      moveSequenceEntry(state.draggedSequence.entry, state.draggedSequence.collection, targetCollection, targetIndex);
      state.draggedSequence = null;
      return true;
    }
    const type = event.dataTransfer.getData("text/action");
    if (type && actionCatalog[type]) {
      event.preventDefault();
      event.stopPropagation();
      const entry = { type: type, children: [] };
      if (actionCatalog[type].duration) entry.duration = 1;
      if (actionCatalog[type].degrees) entry.degrees = 90;
      if (type === "forwardPaint") entry.thickness = 4;
      if (type === "loop") entry.repetitions = 2;
      if (type === "say") entry.message = "";
      if (type === "say") entry.duration = 2;
      if (type === "heart") { entry.size = 18; entry.thickness = 4; }
      if (type === "star") { entry.size = 18; entry.thickness = 4; }
      targetCollection.splice(Math.max(0, Math.min(targetIndex, targetCollection.length)), 0, entry);
      renderCharacters();
      renderSequence();
      return true;
    }
    return false;
  }

  function renderSequence() {
    const character = selectedCharacter();
    const sequence = $("#sequence");
    const mobileSequenceInteraction = window.matchMedia("(max-width: 700px), (orientation: landscape) and (max-height: 700px)").matches;
    renderStageMenuActions();
    if (!sequence) return;
    sequence.innerHTML = "";
    sequence.classList.remove("is-empty");
    if (!character) {
      sequence.classList.add("is-empty");
      sequence.innerHTML = "<div class=\"sequence-empty\"><span>\uD83E\uDDE9</span><strong>Arrastra un personaje al escenario</strong><small>" + (mobileSequenceInteraction ? "Después toca los bloques y las posiciones para ordenarlos." : "Después podrás arrastrar bloques a esta secuencia.") + "</small></div>";
      return;
    }
    if (!character.actions.length) {
      sequence.classList.add("is-empty");
      sequence.innerHTML = "<div class=\"sequence-empty\"><span>🎯</span><strong>La secuencia de " + character.name + " está vacía</strong><small>" + (mobileSequenceInteraction ? "Toca un bloque en la biblioteca para agregarlo." : "Arrastra un bloque desde la biblioteca hacia esta zona.") + "</small></div>";
      return;
    }
    character.actions.forEach(function (entry, index) {
      sequence.appendChild(createSequenceInsertZone(character.actions, index));
      sequence.appendChild(createSequenceItem(entry, character.actions, index));
    });
    sequence.appendChild(createSequenceInsertZone(character.actions, character.actions.length));
  }

  function createSequenceInsertZone(collection, index) {
    const zone = document.createElement("div");
    zone.className = "sequence-insert-zone";
    zone.sequenceCollection = collection;
    zone.sequenceIndex = index;
    zone.setAttribute("aria-label", "Soltar acción aquí");
    zone.addEventListener("dragover", function (event) {
      if (event.dataTransfer.types.indexOf("text/sequence") !== -1 || event.dataTransfer.types.indexOf("text/action") !== -1) {
        event.preventDefault();
        event.stopPropagation();
        zone.classList.add("is-over");
      }
    });
    zone.addEventListener("dragleave", function () { zone.classList.remove("is-over"); });
    zone.addEventListener("drop", function (event) {
      zone.classList.remove("is-over");
      prepareSequenceDrop(collection, index, event);
    });
    zone.addEventListener("click", function (event) {
      if (!state.touchSelectedSequence) return;
      event.stopPropagation();
      moveSequenceEntry(state.touchSelectedSequence.entry, state.touchSelectedSequence.collection, collection, index);
    });
    return zone;
  }

  function createSequenceItem(entry, collection, index) {
    const action = actionCatalog[entry.type];
    const row = document.createElement("div");
    const mobileSequenceInteraction = window.matchMedia("(max-width: 700px), (orientation: landscape) and (max-height: 700px)").matches;
    row.className = "sequence-item" + (action.container ? " sequence-container" : "");
    row.draggable = !mobileSequenceInteraction;
    row.addEventListener("dragstart", function (event) {
      event.stopPropagation();
      state.draggedSequence = { entry: entry, collection: collection };
      event.dataTransfer.setData("text/sequence", "move");
      event.dataTransfer.effectAllowed = "move";
      row.classList.add("is-dragging");
    });
    row.addEventListener("dragend", function (event) {
      event.stopPropagation();
      state.draggedSequence = null;
      row.classList.remove("is-dragging");
    });
    row.addEventListener("dragover", function (event) {
      if (event.dataTransfer.types.indexOf("text/sequence") !== -1 || event.dataTransfer.types.indexOf("text/action") !== -1) {
        event.preventDefault();
        event.stopPropagation();
        row.classList.add("is-drop-target");
      }
    });
    row.addEventListener("dragleave", function (event) {
      if (!row.contains(event.relatedTarget)) row.classList.remove("is-drop-target");
    });
    row.addEventListener("drop", function (event) {
      row.classList.remove("is-drop-target");
      const bounds = row.getBoundingClientRect();
      const targetIndex = collection.indexOf(entry) + (event.clientY >= bounds.top + bounds.height / 2 ? 1 : 0);
      prepareSequenceDrop(collection, targetIndex, event);
    });
    row.addEventListener("pointerup", function (event) {
      if (event.pointerType !== "mouse" && !event.target.closest("button, input, .nested-drop-zone")) {
        if (event.target.closest(".sequence-item") !== row) return;
        if (state.touchSelectedSequence && state.touchSelectedSequence.entry !== entry) {
          const bounds = row.getBoundingClientRect();
          const targetIndex = collection.indexOf(entry) + (event.clientY >= bounds.top + bounds.height / 2 ? 1 : 0);
          event.stopPropagation();
          moveSequenceEntry(state.touchSelectedSequence.entry, state.touchSelectedSequence.collection, collection, targetIndex);
          return;
        }
        state.touchSelectedSequence = { entry: entry, collection: collection };
        document.querySelectorAll(".sequence-item.is-touch-selected").forEach(function (item) {
          item.classList.remove("is-touch-selected");
        });
        row.classList.add("is-touch-selected");
        $("#simulation-message").textContent = "Bloque seleccionado. Toca una posición o un bloque contenedor para moverlo.";
      }
    });
    row.innerHTML = "<span class=\"sequence-number\">" + (index + 1) + "</span><span class=\"sequence-icon block-" + action.color + "\">" + action.icon + "</span><div class=\"sequence-item-copy\"><strong>" + action.label + "</strong><small>" + action.detail + "</small></div><button type=\"button\" aria-label=\"Quitar " + action.label + "\">×</button>";
    const copy = row.querySelector(".sequence-item-copy");
    const parameters = [];
    if (action.duration) parameters.push(["Segundos", "duration", "number", ".1", "60", ".1", entry.duration || 1]);
    if (action.degrees) parameters.push(["Grados", "degrees", "number", "1", "360", "1", entry.degrees || 90]);
    if (action.thickness) parameters.push(["Grosor", "thickness", "number", "1", "30", "1", entry.thickness || 4]);
    if (entry.type === "loop") parameters.push(["Veces", "repetitions", "number", "1", "99", "1", entry.repetitions || 2]);
    if (entry.type === "heart" || entry.type === "star") parameters.push(["Tamaño", "size", "number", "6", "35", "1", entry.size || 18]);
    if (parameters.length) {
      const controls = document.createElement("div");
      controls.className = "sequence-parameters";
      parameters.forEach(function (parameter) {
        const label = document.createElement("label");
        label.textContent = parameter[0];
        const input = document.createElement("input");
        input.className = "sequence-parameter";
        input.type = parameter[2];
        input.min = parameter[3];
        input.max = parameter[4];
        input.step = parameter[5];
        input.value = parameter[6];
        input.setAttribute("aria-label", parameter[0]);
        input.addEventListener("change", function () {
          const raw = Number(input.value);
          const value = parameter[1] === "duration"
            ? Math.max(.1, Math.min(60, raw || 1))
            : parameter[1] === "degrees"
              ? Math.max(1, Math.min(360, Math.round(raw || 90)))
              : parameter[1] === "thickness"
                ? Math.max(1, Math.min(30, Math.round(raw || 4)))
                : parameter[1] === "size"
                  ? Math.max(6, Math.min(35, Math.round(raw || 18)))
                : Math.max(1, Math.min(99, Math.round(raw || 2)));
          entry[parameter[1]] = value;
          input.value = value;
        });
        label.appendChild(input);
        controls.appendChild(label);
      });
      copy.appendChild(controls);
    }
    if (entry.type === "say") {
      const controls = document.createElement("div");
      controls.className = "sequence-parameters";
      const label = document.createElement("label");
      label.textContent = "Texto";
      const input = document.createElement("input");
      input.className = "sequence-parameter sequence-text-parameter";
      input.type = "text";
      input.maxLength = 20;
      input.value = String(entry.message || "").slice(0, 20);
      input.placeholder = "Escribe un mensaje";
      input.setAttribute("aria-label", "Texto");
      input.addEventListener("input", function () {
        entry.message = input.value.slice(0, 20);
        input.value = entry.message;
      });
      label.appendChild(input);
      controls.appendChild(label);
      copy.appendChild(controls);
    }
    row.querySelector("button").addEventListener("click", function () { collection.splice(index, 1); renderCharacters(); renderSequence(); });
    if (action.container) {
      const inner = document.createElement("div");
      inner.className = "nested-drop-zone";
      inner.sequenceCollection = entry.children;
      inner.innerHTML = "<span>" + (mobileSequenceInteraction ? "Toca aquí para mover bloques dentro" : "Arrastra acciones dentro de este bloque") + "</span>";
      inner.addEventListener("click", function (event) {
        if (event.target.closest(".sequence-insert-zone, .sequence-item")) return;
        if (state.touchSelectedSequence) {
          const selected = state.touchSelectedSequence;
          moveSequenceEntry(selected.entry, selected.collection, entry.children, entry.children.length);
          return;
        }
        state.touchTargetCollection = entry.children;
        inner.classList.add("is-selected");
        $("#simulation-message").textContent = "Zona interna seleccionada. Toca un bloque para agregarlo aquí.";
      });
      inner.addEventListener("dragover", function (event) {
        if (event.dataTransfer.types.indexOf("text/sequence") !== -1 || event.dataTransfer.types.indexOf("text/action") !== -1) {
          event.preventDefault();
          event.stopPropagation();
          inner.classList.add("is-over");
        }
      });
      inner.addEventListener("dragleave", function () { inner.classList.remove("is-over"); });
      inner.addEventListener("drop", function (event) {
        inner.classList.remove("is-over");
        prepareSequenceDrop(entry.children, entry.children.length, event);
      });
      entry.children.forEach(function (child, childIndex) {
        inner.appendChild(createSequenceInsertZone(entry.children, childIndex));
        inner.appendChild(createSequenceItem(child, entry.children, childIndex));
      });
      inner.appendChild(createSequenceInsertZone(entry.children, entry.children.length));
      row.appendChild(inner);
    }
    return row;
  }

  stage.addEventListener("dragover", function (event) { if (event.dataTransfer.types.indexOf("text/character") !== -1) { event.preventDefault(); stage.classList.add("is-over"); } });
  stage.addEventListener("dragleave", function () { stage.classList.remove("is-over"); });
  stage.addEventListener("drop", function (event) {
    event.preventDefault();
    stage.classList.remove("is-over");
    const templateId = event.dataTransfer.getData("text/character");
    if (!templateId) return;
    const bounds = stage.getBoundingClientRect();
    addCharacter(templateId, Math.max(7, Math.min(93, ((event.clientX - bounds.left) / bounds.width) * 100)), Math.max(12, Math.min(86, ((event.clientY - bounds.top) / bounds.height) * 100)));
  });
  $("#sequence").addEventListener("dragover", function (event) {
    if (event.dataTransfer.types.indexOf("text/action") !== -1 || event.dataTransfer.types.indexOf("text/sequence") !== -1) event.preventDefault();
  });
  $("#sequence").addEventListener("drop", function (event) {
    prepareSequenceDrop(selectedCharacter() ? selectedCharacter().actions : [], selectedCharacter() ? selectedCharacter().actions.length : 0, event);
  });
  document.addEventListener("click", function (event) {
    if (window.innerWidth > 700 && window.innerHeight > 700 &&
        !event.target.closest("#escenario") &&
        !event.target.closest(".stage-action-menu") &&
        !event.target.closest(".stage-character")) hideCharacterMenu();
  });
  $("#execute-program").addEventListener("click", function () {
    hideCharacterMenu();
    const programmedCharacters = state.characters.filter(function (character) { return character.actions.length; });
    if (!programmedCharacters.length) { $("#simulation-message").textContent = "Agrega acciones antes de ejecutar."; return; }
    if (state.running) resetExecution();
    state.canReset = false;
    document.getElementById("paint-layer").innerHTML = "";
    state.characters.forEach(function (character) {
      character.position = Object.assign({}, character.initialPosition);
      character.direction = character.initialDirection;
    });
    state.running = true;
    state.run = { cancelled: false, remaining: programmedCharacters.length, frames: {}, speechTimers: {}, finished: {} };
    setExecutionControls(true);
    renderCharacters();
    function flatten(entries, actions) {
      entries.forEach(function (entry) {
        if (entry.type === "loop") {
          for (let count = 0; count < (entry.repetitions || 2); count += 1) flatten(entry.children, actions);
        } else actions.push(entry);
      });
    }
    function finishCharacter(character, stoppedByBlock) {
      if (!state.run || state.run.finished[character.id]) return;
      state.run.finished[character.id] = true;
      state.run.remaining -= 1;
      if (state.run.remaining === 0) {
        state.running = false;
        state.run = null;
        state.canReset = true;
        setExecutionControls(false);
        renderCharacters();
        $("#simulation-message").textContent = stoppedByBlock
          ? "\u23F9\uFE0F Un programa terminó con el bloque Detener."
          : "\u2705 Todos los programas terminaron.";
      }
    }
    function startCharacter(character) {
      const actions = [];
      flatten(character.actions, actions);
      let index = 0;
      function step() {
        if (!state.running || !state.run || state.run.cancelled) return;
        const entry = actions[index];
        if (!entry) {
          finishCharacter(character, false);
          return;
        }
        if (entry.type === "stop") {
          finishCharacter(character, true);
          return;
        }
        if (entry.type === "say") {
          animateSpeech(character, entry, state.run);
          index += 1;
          step();
          return;
        }
        if (entry.type === "heart" || entry.type === "star") {
          animateShape(character, entry, function () {
            index += 1;
            step();
          }, state.run);
          return;
        }
        animateAction(entry, character, function () {
          index += 1;
          step();
        }, state.run);
      }
      step();
    }
    $("#simulation-message").textContent = "\u2728 Ejecutando todos los personajes...";
    programmedCharacters.forEach(startCharacter);
  });
  $("#stop-program").addEventListener("click", function () {
    hideCharacterMenu();
    state.running = false;
    if (state.run) {
      state.run.cancelled = true;
      Object.keys(state.run.frames).forEach(function (id) {
        if (state.run.frames[id]) cancelAnimationFrame(state.run.frames[id]);
      });
      Object.keys(state.run.speechTimers || {}).forEach(function (id) {
        clearTimeout(state.run.speechTimers[id]);
      });
      state.run = null;
    }
    state.canReset = true;
    setExecutionControls(false);
    renderCharacters();
    $("#simulation-message").textContent = "\u23F9\uFE0F Simulación detenida.";
  });
  $("#restart-program").addEventListener("click", function () {
    if (state.running || !state.canReset) return;
    resetExecution();
    state.canReset = false;
    setExecutionControls(false);
    $("#simulation-message").textContent = "\u21BB Personajes reiniciados.";
  });
  function updateCharacterVisual(character) {
    const actor = stage.querySelector("[data-character-id=\"" + character.id + "\"]");
    if (!actor) return;
    actor.style.left = character.position.x + "%";
    actor.style.top = character.position.y + "%";
    const image = actor.querySelector("img");
    if (image) image.style.transform = "rotate(" + character.direction + "deg)";
    updateSpeechBubblePosition(character);
    if (state.menuVisible && character.id === state.selectedId) updateStageMenuPosition(character);
  }

  function updateSpeechBubblePosition(character) {
    const bubble = stage.querySelector(".speech-bubble[data-character-id=\"" + character.id + "\"]");
    const actor = stage.querySelector("[data-character-id=\"" + character.id + "\"]");
    if (!bubble || !actor) return;
    bubble.style.left = (character.position.x + 5) + "%";
    bubble.style.top = (character.position.y - 4) + "%";
  }

  function animateSpeech(character, entry, run) {
    if (run.speechTimers[character.id]) {
      clearTimeout(run.speechTimers[character.id]);
      delete run.speechTimers[character.id];
    }
    const previousBubble = stage.querySelector(".speech-bubble[data-character-id=\"" + character.id + "\"]");
    if (previousBubble) previousBubble.remove();
    const bubble = document.createElement("div");
    bubble.className = "speech-bubble";
    bubble.dataset.characterId = character.id;
    bubble.textContent = String(entry.message || "Â¡Hola!").slice(0, 20);
    stage.appendChild(bubble);
    updateSpeechBubblePosition(character);
    const duration = Math.max(.5, Math.min(60, Number(entry.duration) || 2)) * 1000;
    const timerId = setTimeout(function () {
      bubble.remove();
      delete run.speechTimers[character.id];
    }, duration);
    run.speechTimers[character.id] = timerId;
  }

  function normalizeDirection(direction) {
    return ((direction % 360) + 360) % 360;
  }

  function animateAction(entry, character, done, run) {
    const isTurn = entry.type === "left" || entry.type === "right";
    const isMovement = entry.type === "forward" || entry.type === "backward" || entry.type === "forwardPaint";
    const turnDegrees = Math.max(1, Math.min(360, Number(entry.degrees) || 90));
    const movementDuration = Math.max(0.08, Number(entry.duration) || 0.5) * 1000;
    const duration = isTurn
      ? Math.max(180, Math.min(700, turnDegrees * 2.5))
      : movementDuration;
    const start = performance.now();
    const startX = character.position.x;
    const startY = character.position.y;
    const startDirection = character.direction || 0;
    const radians = startDirection * Math.PI / 180;
    const configuredSeconds = Math.max(0.08, Number(entry.duration) || 0.5);
    const distancePerSecond = 5;
    const distance = (entry.type === "backward" ? -1 : 1) * distancePerSecond * configuredSeconds;
    const actor = stage.querySelector("[data-character-id=\"" + character.id + "\"]");
    const limits = actor
      ? { maxX: Math.max(0, stage.clientWidth - actor.offsetWidth) / stage.clientWidth * 100, maxY: Math.max(0, stage.clientHeight - actor.offsetHeight) / stage.clientHeight * 100 }
      : { maxX: 100, maxY: 100 };
    const targetX = isMovement ? Math.max(0, Math.min(limits.maxX, startX + Math.cos(radians) * distance)) : startX;
    const targetY = isMovement ? Math.max(0, Math.min(limits.maxY, startY + Math.sin(radians) * distance)) : startY;
    const rotation = entry.type === "left" ? -turnDegrees : entry.type === "right" ? turnDegrees : 0;
    const paintCenter = entry.type === "forwardPaint" ? getCharacterCenter(character) : null;
    const paintLine = entry.type === "forwardPaint" ? createPaintLine(paintCenter, entry.thickness || 4) : null;
    const paintStartX = paintCenter ? paintCenter.x : character.position.x;
    const paintStartY = paintCenter ? paintCenter.y : character.position.y;
    const movementDeltaX = targetX - startX;
    const movementDeltaY = targetY - startY;
    const paintEndX = paintCenter ? paintStartX + movementDeltaX : paintStartX;
    const paintEndY = paintCenter ? paintStartY + movementDeltaY : paintStartY;
    function frame(now) {
      if (!state.running || !run || run.cancelled) return;
      const progress = Math.min(1, (now - start) / duration);
      character.position.x = startX + (targetX - startX) * progress;
      character.position.y = startY + (targetY - startY) * progress;
      character.direction = normalizeDirection(startDirection + rotation * progress);
      if (paintLine && isMovement) {
        // El trazo acompaña al desplazamiento; no tiene una duración propia.
        paintLine.setAttribute("x2", String(paintStartX + (paintEndX - paintStartX) * progress));
        paintLine.setAttribute("y2", String(paintStartY + (paintEndY - paintStartY) * progress));
      }
      updateCharacterVisual(character);
      if (progress < 1) {
        run.frames[character.id] = requestAnimationFrame(frame);
      }
      else done();
    }
    run.frames[character.id] = requestAnimationFrame(frame);
  }

  function animateShape(character, entry, done, run) {
    const size = Math.max(6, Math.min(35, Number(entry.size) || 18));
    const thickness = Math.max(1, Math.min(30, Number(entry.thickness) || 4));
    const center = getCharacterCenter(character);
    const points = [];
    if (entry.type === "heart") {
      const pointCount = 24;
      for (let index = 0; index <= pointCount; index += 1) {
        const angle = Math.PI * 2 - (Math.PI * 2 * index / pointCount);
        const x = 16 * Math.pow(Math.sin(angle), 3);
        const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
        points.push({ x: center.x + x * size / 32, y: center.y + y * size / 32 });
      }
    } else {
      const pointCount = 10;
      for (let index = 0; index < pointCount; index += 1) {
        const angle = -Math.PI / 2 + Math.PI * index / 5;
        const radius = index % 2 === 0 ? size / 2 : size * .225;
        points.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius });
      }
      points.push({ x: points[0].x, y: points[0].y });
    }
    const origin = points[0];
    const offsetX = center.x - origin.x;
    const offsetY = center.y - origin.y;
    points.forEach(function (point) {
      point.x += offsetX;
      point.y += offsetY;
    });
    let segmentIndex = 0;
    function drawSegment() {
      if (!state.running || !run || run.cancelled) return;
      if (segmentIndex >= points.length - 1) {
        done();
        return;
      }
      const start = points[segmentIndex];
      const end = points[segmentIndex + 1];
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const distance = Math.hypot(deltaX, deltaY);
      const targetDirection = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      const startDirection = character.direction || 0;
      const line = createPaintLine(start, thickness);
      const startTime = performance.now();
      const duration = Math.max(90, distance * 35);
      function frame(now) {
        if (!state.running || !run || run.cancelled) return;
        const progress = Math.min(1, (now - startTime) / duration);
        character.position.x = start.x + deltaX * progress;
        character.position.y = start.y + deltaY * progress;
        character.direction = normalizeDirection(startDirection + (targetDirection - startDirection) * progress);
        line.setAttribute("x2", String(character.position.x));
        line.setAttribute("y2", String(character.position.y));
        updateCharacterVisual(character);
        if (progress < 1) {
          run.frames[character.id] = requestAnimationFrame(frame);
        } else {
          character.position.x = end.x;
          character.position.y = end.y;
          line.setAttribute("x2", String(end.x));
          line.setAttribute("y2", String(end.y));
          segmentIndex += 1;
          drawSegment();
        }
      }
      run.frames[character.id] = requestAnimationFrame(frame);
    }
    drawSegment();
  }

  function getCharacterCenter(character) {
    const actor = stage.querySelector("[data-character-id=\"" + character.id + "\"]");
    const bounds = stage.getBoundingClientRect();
    if (!actor) return { x: character.position.x, y: character.position.y };
    const actorBounds = actor.getBoundingClientRect();
    return {
      x: ((actorBounds.left + actorBounds.width / 2 - bounds.left - stage.clientLeft) / stage.clientWidth) * 100,
      y: ((actorBounds.top + actorBounds.height / 2 - bounds.top - stage.clientTop) / stage.clientHeight) * 100
    };
  }

  function createPaintLine(center, thickness) {
    const layer = document.getElementById("paint-layer");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(center.x));
    line.setAttribute("y1", String(center.y));
    line.setAttribute("x2", String(center.x));
    line.setAttribute("y2", String(center.y));
    line.setAttribute("stroke", "#5b5ce2");
    line.setAttribute("stroke-width", String(thickness));
    line.setAttribute("vector-effect", "non-scaling-stroke");
    line.setAttribute("class", "paint-stroke");
    line.setAttribute("stroke-linecap", "round");
    layer.appendChild(line);
    return line;
  }
  $("#delete-character").addEventListener("click", deleteSelectedCharacter);
  const mobileBlockMenuToggle = $("#mobile-block-menu-toggle");
  const mobileSequenceMenuToggle = $("#mobile-sequence-menu-toggle");
  const mobileNavigationToggle = $("#mobile-navigation-toggle");
  const mobileNavigationClose = $("#mobile-navigation-close");
  const mobileLibraryClose = $("#mobile-library-close");
  const mobileExecutionToggle = $("#mobile-execution-toggle");
  const mobileSequenceClose = $("#mobile-sequence-close");
  function updateExecutionToggle(isOpen) {
    if (!mobileExecutionToggle) return;
    mobileExecutionToggle.setAttribute("aria-expanded", String(isOpen));
    mobileExecutionToggle.setAttribute("aria-label", isOpen ? "Cerrar controles de ejecución" : "Abrir controles de ejecución");
  }
  if (mobileNavigationToggle) {
    mobileNavigationToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const isOpen = document.documentElement.classList.toggle("mobile-navigation-open");
      mobileNavigationToggle.querySelector("[aria-hidden='true']").textContent = isOpen ? "×" : "⌂";
      mobileNavigationToggle.setAttribute("aria-expanded", String(isOpen));
      mobileNavigationToggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
      if (isOpen) {
        document.documentElement.classList.remove("mobile-blocks-open", "mobile-program-open");
        if (mobileBlockMenuToggle) mobileBlockMenuToggle.setAttribute("aria-expanded", "false");
        if (mobileSequenceMenuToggle) mobileSequenceMenuToggle.setAttribute("aria-expanded", "false");
      }
      if (mobileNavigationClose) {
        mobileNavigationClose.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          document.documentElement.classList.remove("mobile-navigation-open");
          mobileNavigationClose.blur();
          if (mobileNavigationToggle) {
            mobileNavigationToggle.querySelector("[aria-hidden='true']").textContent = "⌂";
            mobileNavigationToggle.setAttribute("aria-expanded", "false");
            mobileNavigationToggle.setAttribute("aria-label", "Abrir menú de navegación");
          }
        });
      }
    });
  }
  if (mobileBlockMenuToggle) {
    mobileBlockMenuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const isOpen = document.documentElement.classList.toggle("mobile-blocks-open");
      mobileBlockMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
  if (mobileSequenceMenuToggle) {
    mobileSequenceMenuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const isOpen = document.documentElement.classList.toggle("mobile-program-open");
      mobileSequenceMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
  if (mobileExecutionToggle) {
    mobileExecutionToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const isOpen = document.documentElement.classList.toggle("mobile-execution-open");
      updateExecutionToggle(isOpen);
    });
  }
  if (mobileSequenceClose) {
    mobileSequenceClose.addEventListener("click", function (event) {
      event.stopPropagation();
      document.documentElement.classList.remove("mobile-program-open");
      if (mobileSequenceMenuToggle) mobileSequenceMenuToggle.setAttribute("aria-expanded", "false");
    });
  }
  if (mobileLibraryClose) {
    mobileLibraryClose.addEventListener("click", function (event) {
      event.stopPropagation();
      document.documentElement.classList.remove("mobile-blocks-open");
      if (mobileBlockMenuToggle) mobileBlockMenuToggle.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("click", function (event) {
    if (!event.target.closest("#workspace-execution-menu") && !event.target.closest("#mobile-execution-toggle")) {
      document.documentElement.classList.remove("mobile-execution-open");
      updateExecutionToggle(false);
    }
    if (!event.target.closest("#laboratory-navigation") && !event.target.closest("#mobile-navigation-toggle")) {
      document.documentElement.classList.remove("mobile-navigation-open");
      if (mobileNavigationToggle) {
        mobileNavigationToggle.querySelector("[aria-hidden='true']").textContent = "⌂";
        mobileNavigationToggle.setAttribute("aria-expanded", "false");
        mobileNavigationToggle.setAttribute("aria-label", "Abrir menú de navegación");
      }
    }
    if (!event.target.closest("#biblioteca") &&
        !event.target.closest(".mobile-panel-toggle")) {
      document.documentElement.classList.remove("mobile-blocks-open");
      if (mobileBlockMenuToggle) mobileBlockMenuToggle.setAttribute("aria-expanded", "false");
    }
    if (!event.target.closest("#programa") &&
        !event.target.closest(".stage-character") &&
        !event.target.closest("#mobile-sequence-menu-toggle") &&
        !event.target.closest(".mobile-sequence-close")) {
      document.documentElement.classList.remove("mobile-program-open");
      if (mobileSequenceMenuToggle) mobileSequenceMenuToggle.setAttribute("aria-expanded", "false");
    }
  });
  setExecutionControls(false);
  renderLibrary();
  renderCharacters();
  renderSequence();
}());
