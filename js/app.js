(function () {
  "use strict";

  const actionCatalog = {
    forward: { label: "Avanzar", icon: "⬆️", color: "movement", detail: "Mover hacia adelante", tab: "movement" },
    backward: { label: "Retroceder", icon: "⬇️", color: "movement", detail: "Mover hacia atrás", tab: "movement" },
    left: { label: "Girar izquierda", icon: "↶", color: "movement", detail: "Girar por grados", tab: "movement", degrees: true },
    right: { label: "Girar derecha", icon: "↷", color: "movement", detail: "Girar por grados", tab: "movement", degrees: true },
    stop: { label: "Detener", icon: "⏹️", color: "control", detail: "Parar el personaje", tab: "control" },
    wait: { label: "Esperar", icon: "⏱️", color: "control", detail: "Esperar un momento", tab: "control", duration: true },
    loop: { label: "Repetir", icon: "🔁", color: "loop", detail: "Contenedor para repetir acciones", tab: "loops", container: true },
    forwardPaint: { label: "Avanzar y pintar", icon: "🖌️", color: "paint", detail: "Avanzar dejando una línea", tab: "paint", duration: true, thickness: true },
    condition: { label: "Si", icon: "🔀", color: "condition", detail: "Comprobar una condición", tab: "conditions", container: true },
    say: { label: "Decir", icon: "💬", color: "programmed", detail: "Mostrar un mensaje", tab: "programmed", duration: true },
    heart: { label: "Dibujar corazón", icon: "❤️", color: "programmed", detail: "Avanzar y girar dibujando", tab: "programmed", shape: "heart", thickness: true },
    star: { label: "Dibujar estrella", icon: "⭐", color: "programmed", detail: "Avanzar y girar dibujando", tab: "programmed", shape: "star", thickness: true }
  };
  ["forward", "backward"].forEach(function (type) { actionCatalog[type].duration = true; });
  const characterCatalog = [
    { id: "robotcito", name: "Robotcito", image: "Recursos/robotcito.png", position: { x: 22, y: 34 } }
  ];
  const tabs = {
    characters: [],
    movement: ["forward", "backward", "left", "right"],
    paint: ["forwardPaint"],
    loops: ["loop"],
    control: ["stop", "wait"],
    conditions: ["condition"],
    programmed: ["say", "heart", "star"]
  };
  const state = { characters: [], selectedId: null, menuVisible: false, running: false, canReset: false, run: null, activeTab: "characters", openTabs: { characters: true }, draggedSequence: null, touchTargetCollection: null, touchSelectedSequence: null };
  const stage = document.getElementById("escenario");
  if (!stage) return;
  const $ = function (selector) { return document.querySelector(selector); };
  const selectedCharacter = function () { return state.characters.find(function (character) { return character.id === state.selectedId; }); };
  function hideCharacterMenu() {
    state.menuVisible = false;
    const menu = stage.querySelector(".stage-action-menu");
    if (menu) menu.remove();
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
    menu.innerHTML = "<div class=\"stage-menu-header\"><strong>Acciones de " + character.name + "</strong><button class=\"delete-character-button\" type=\"button\" aria-label=\"Eliminar " + character.name + "\">🗑</button></div><div class=\"stage-menu-drop\" id=\"stage-menu-drop\">＋</div><div class=\"stage-menu-actions\"></div>";
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
    const categories = ["characters", "movement", "paint", "loops", "control", "conditions", "programmed"];
    categories.forEach(function (tabName) {
      const section = document.createElement("section");
      section.className = "library-section" + (state.openTabs[tabName] ? " is-open" : "");
      section.dataset.tab = tabName;
      const toggle = document.createElement("button");
      toggle.className = "library-section-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", state.openTabs[tabName] ? "true" : "false");
      toggle.innerHTML = "<span>" + ({ characters: "👥", movement: "↕️", paint: "🖌️", loops: "🔁", control: "⚙️", conditions: "🔀", programmed: "💬" }[tabName]) + "</span><strong>" + ({ characters: "Personajes", movement: "Movimiento", paint: "Pintar", loops: "Bucles", control: "Control", conditions: "Condiciones", programmed: "Programadas" }[tabName]) + "</strong><b>⌄</b>";
      toggle.addEventListener("click", function () {
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
      button.addEventListener("click", function () {
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
    renderStageMenuActions();
    if (!sequence) return;
    sequence.innerHTML = "";
    sequence.classList.remove("is-empty");
    if (!character) {
      sequence.classList.add("is-empty");
      sequence.innerHTML = "<div class=\"sequence-empty\"><span>🧩</span><strong>Arrastra un personaje al escenario</strong><small>Después podrás arrastrar bloques a esta secuencia.</small></div>";
      return;
    }
    if (!character.actions.length) {
      sequence.classList.add("is-empty");
      sequence.innerHTML = "<div class=\"sequence-empty\"><span>🎯</span><strong>La secuencia de " + character.name + " está vacía</strong><small>Arrastra un bloque desde la biblioteca hacia esta zona.</small></div>";
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
    row.className = "sequence-item" + (action.container ? " sequence-container" : "");
    row.draggable = true;
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
      inner.innerHTML = "<span>Arrastra acciones dentro de este bloque</span>";
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
    if (!event.target.closest("#escenario") && !event.target.closest(".stage-action-menu")) hideCharacterMenu();
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
        if (entry.type === "loop" || entry.type === "condition") {
          for (let count = 0; count < (entry.type === "loop" ? (entry.repetitions || 2) : 1); count += 1) flatten(entry.children, actions);
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
          ? "⏹ Un programa terminó con el bloque Detener."
          : "✅ Todos los programas terminaron.";
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
    $("#simulation-message").textContent = "✨ Ejecutando todos los personajes...";
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
    $("#simulation-message").textContent = "⏹ Simulación detenida.";
  });
  $("#restart-program").addEventListener("click", function () {
    if (state.running || !state.canReset) return;
    resetExecution();
    state.canReset = false;
    setExecutionControls(false);
    $("#simulation-message").textContent = "↻ Personajes reiniciados.";
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
    bubble.textContent = String(entry.message || "¡Hola!").slice(0, 20);
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
  setExecutionControls(false);
  renderLibrary();
  renderCharacters();
  renderSequence();
}());
