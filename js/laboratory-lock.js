(function () {
  "use strict";

  const lock = document.querySelector("#laboratory-lock");
  const courseButton = document.querySelector("#laboratory-lock-course");
  if (!lock || !courseButton) return;

  const moduleOneMissionCount = 5;
  const moduleTwoStart = 5;
  const moduleTwoMissionCount = 5;
  const progressKey = "robobloques-course-progress";
  const noticeKey = "robobloques-laboratory-unlock-notices";
  const moduleUnlocks = {
    1: {
      step: "Laboratorio desbloqueado · Módulo 1",
      icon: "🧩",
      title: "¡Ya puedes experimentar!",
      text: "Completaste el módulo 1. Ahora puedes usar los personajes y los bloques de movimiento para crear tus primeros recorridos en el laboratorio."
    },
    2: {
      step: "Nuevos bloques desbloqueados · Módulo 2",
      icon: "✨",
      title: "¡Tu laboratorio creció!",
      text: "Completaste el módulo 2. Ahora también puedes usar controles, pausas, pintura, bucles y bloques programados para crear experiencias más completas."
    }
  };
  let lockedScrollY = window.scrollY;

  function readProgress() {
    try {
      const progress = JSON.parse(localStorage.getItem(progressKey) || "null") || {};
      return Array.isArray(progress.completedMissions) ? progress.completedMissions : [];
    } catch (error) {
      return [];
    }
  }

  function completedModules() {
    const completed = readProgress();
    const modules = [];
    if (completed.filter(function (index) { return Number.isInteger(index) && index >= 0 && index < moduleOneMissionCount; }).length >= moduleOneMissionCount) modules.push(1);
    if (completed.filter(function (index) { return Number.isInteger(index) && index >= moduleTwoStart && index < moduleTwoStart + moduleTwoMissionCount; }).length >= moduleTwoMissionCount) modules.push(2);
    return modules;
  }

  function readSeenNotices() {
    try {
      const notices = JSON.parse(localStorage.getItem(noticeKey) || "[]");
      return Array.isArray(notices) ? notices : [];
    } catch (error) {
      return [];
    }
  }

  function setMessage(module) {
    const message = moduleUnlocks[module];
    document.querySelector("#laboratory-lock-step").textContent = message.step;
    document.querySelector("#laboratory-lock-icon").textContent = message.icon;
    document.querySelector("#laboratory-lock-title").textContent = message.title;
    document.querySelector("#laboratory-lock-text").textContent = message.text;
    courseButton.innerHTML = "Explorar laboratorio <span aria-hidden=\"true\">→</span>";
    lock.classList.add("is-unlocked-message");
  }

  function markNoticeSeen(module) {
    const seen = readSeenNotices();
    if (seen.indexOf(module) < 0) seen.push(module);
    localStorage.setItem(noticeKey, JSON.stringify(seen));
  }

  function unlockBlocks() {
    const completed = completedModules();
    const moduleBySection = { movement: 1, paint: 2, loops: 2, control: 2, programmed: 2 };
    document.querySelectorAll(".library-section").forEach(function (section) {
      const requiredModule = moduleBySection[section.dataset.tab] || 1;
      const unlocked = completed.indexOf(requiredModule) >= 0;
      section.classList.toggle("is-locked", !unlocked);
      const toggle = section.querySelector(".library-section-toggle");
      if (toggle) {
        toggle.disabled = !unlocked;
        toggle.setAttribute("aria-disabled", String(!unlocked));
      }
      section.querySelectorAll(".action-button").forEach(function (button) {
        button.disabled = !unlocked;
        button.draggable = unlocked;
        button.setAttribute("aria-disabled", String(!unlocked));
        button.title = unlocked ? "" : "Completa el módulo " + requiredModule + " para desbloquear este apartado.";
      });
    });
  }

  const library = document.querySelector("#action-buttons");
  if (library) {
    new MutationObserver(unlockBlocks).observe(library, { childList: true, subtree: true });
  }

  function keepLockedViewport() {
    if (window.scrollY !== lockedScrollY) window.scrollTo(0, lockedScrollY);
  }

  function preventScroll(event) {
    event.preventDefault();
  }

  function releaseLock() {
    document.body.classList.remove("laboratory-locked");
    document.documentElement.classList.remove("laboratory-locked");
    window.removeEventListener("scroll", keepLockedViewport);
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    document.removeEventListener("keydown", preventKeys);
    lock.remove();
  }

  function preventKeys(event) {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].indexOf(event.key) >= 0) {
      event.preventDefault();
    }
  }

  const completed = completedModules();
  if (completed.indexOf(1) >= 0) {
    unlockBlocks();
    const seen = readSeenNotices();
    const pendingNotices = completed.filter(function (module) { return seen.indexOf(module) < 0; });
    let noticeIndex = 0;
    if (pendingNotices.length) {
      setMessage(pendingNotices[noticeIndex]);
      courseButton.addEventListener("click", function () {
        markNoticeSeen(pendingNotices[noticeIndex]);
        noticeIndex += 1;
        if (noticeIndex < pendingNotices.length) {
          setMessage(pendingNotices[noticeIndex]);
        } else {
          releaseLock();
        }
      });
    } else {
      releaseLock();
    }
    return;
  }

  lockedScrollY = window.scrollY;
  document.body.classList.add("laboratory-locked");
  document.documentElement.classList.add("laboratory-locked");
  window.addEventListener("scroll", keepLockedViewport, { passive: true });
  window.addEventListener("wheel", preventScroll, { passive: false });
  window.addEventListener("touchmove", preventScroll, { passive: false });
  document.addEventListener("keydown", preventKeys);
  courseButton.addEventListener("click", function () {
    window.location.href = "curso.html";
  });
}());
