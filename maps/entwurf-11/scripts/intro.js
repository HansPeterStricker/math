// Todo B46: introduction to draft 11 as a carousel of seven cards over the map (plan in
// reports/2026-10-22 B46 Einführungskarte Plan/Plan.md, with the user's decisions: still images, no automatic paging,
// button "Intro"). Classic script, loaded after scripts/map-page.js; works over file:// as well.
// Opening rules:
//   - ?intro=1 always opens the carousel, ?intro=0 never; ?intro=auto applies the normal rule (for tests).
//   - Normal rule: open once the map is drawn (body[data-bereit="1"]) unless localStorage["e11-intro-hidden"] === "1".
//   - Under an automated browser (navigator.webdriver) the carousel does not open by itself without intro=1 or intro=auto,
//     so that the click tests of draft 11 are not covered by the dialog.
// The button "Intro" in the toolbar always opens the carousel on card 1.
(function () {
  "use strict";
  const KEY = "e11-intro-hidden";
  const IMG = "data/intro/";
  // Texts of the cards (English only, like draft 11). Each statement was checked against the page (report of B46).
  const CARDS = [
    { title: "A map of mathematics", img: "card-1.png",
      alt: "The whole map at magnification 1 with the legend beside it",
      text: "This map shows number theory and algebraic geometry as a landscape. Each coloured area is a main field of the " +
        "Mathematics Subject Classification, and the thin borders inside it mark its subareas. The fjord separates the two " +
        "sides of the Langlands correspondences." },
    { title: "Buildings, ruins, cities and bridges", img: "card-2.png",
      alt: "A part of the map at the fjord with bridges and buildings, beside it the matching rows of the legend",
      text: "Every building is a theorem; the larger the building, the more important the theorem. A building with a question " +
        "mark is an open conjecture, a ruin is a disproved one, and a city stands for a whole theory. A bridge across the " +
        "fjord is a correspondence: a finished bridge has been proved, a construction plan drawn in dashed lines is only conjectured." },
    { title: "Zoom and pan", img: "card-3.png",
      alt: "The same part of the map at magnification 1 and 4 side by side; below, the toolbar with the buttons + and − ringed",
      text: "Drag the map to move it, and zoom with the mouse wheel, two fingers or the + and − buttons. The further you zoom " +
        "in, the more buildings and names appear. Hover over anything to see its name." },
    // Two square images of the same size side by side (user, 2026-10-22)
    { title: "Premises and consequences", pair: [
        { img: "card-4-click.png", cap: "Click", alt: "Castelnuovo's rationality criterion clicked, with short routes from the theorems its proof builds on" },
        { img: "card-4-right-click.png", cap: "Right-click", alt: "The Riemann hypothesis over finite fields right-clicked, with routes to the theorems that use it" }],
      text: "Click a building to see the theorems its proof builds on; a route leads from each of them to the building. " +
        "Right-click (or long-press) it to see the theorems that use it instead. A second click of the same kind clears the selection." },
    { title: "More than one proof", img: "card-5.png",
      alt: "Quadratic reciprocity selected, with a filled and a hollow circle ringed; beside it the same after a click on the " +
        "hollow circle, with the routes of the other proof",
      text: "Some theorems have more than one proof. A filled circle beside the building marks the proof whose routes are " +
        "shown; each hollow circle stands for another proof. Click a hollow circle to show the routes of that proof instead." },
    { title: "The info box", img: "card-6.png",
      alt: "The info box of Fermat's Last Theorem with statement, proof, proof idea and history, beside a narrow strip of the map",
      text: "A click on a building also opens the info box on the right. It gives the statement, who proved it and when, " +
        "every proof with its idea and the history. The × closes the box and clears the selection." },
    { title: "Search, show all and reset", img: "card-7.png",
      alt: "The toolbar with the suggestions for “Riemann” opened; “Show all”, “Reset” and the button “Intro” are ringed",
      text: "Type a theorem, a conjecture or a person into the search field; choosing a suggestion takes the map there. The " +
        "switch “theorems” under “Show all” draws every theorem and conjecture at every magnification, and “Reset” clears " +
        "the selection and the search, sets all switches back and shows the whole map again. You can open this introduction " +
        "again with the Intro button." },
  ];

  // ---------------------------------------------------------------- Storage (every access may throw)
  let storageOk = true;
  try { const t = "__e11_test__"; window.localStorage.setItem(t, "1"); window.localStorage.removeItem(t); } catch (e) { storageOk = false; }
  let hiddenSession = false;   // used when the browser cannot store the choice
  function isHidden() {
    if (!storageOk) return hiddenSession;
    try { return window.localStorage.getItem(KEY) === "1"; } catch (e) { return hiddenSession; }
  }
  function setHidden(on) {
    hiddenSession = !!on;
    if (!storageOk) return;
    try { if (on) window.localStorage.setItem(KEY, "1"); else window.localStorage.removeItem(KEY); } catch (e) { /* not available */ }
  }

  // ---------------------------------------------------------------- Dialog
  const back = document.createElement("div");
  back.className = "intro-hinter";
  back.hidden = true;
  const dots = CARDS.map((c, i) => `<button type="button" class="intro-punkt" data-i="${i}" aria-label="Card ${i + 1}: ${c.title}"></button>`).join("");
  back.innerHTML =
    `<div class="intro-dialog" role="dialog" aria-modal="true" aria-labelledby="intro-titel">` +
    `<button type="button" class="intro-zu" aria-label="Close" title="Close">×</button>` +
    `<div class="intro-inhalt">` +
    CARDS.map((c, i) => `<section class="intro-karte" data-i="${i}" hidden>` +
      (c.pair ? `<div class="intro-paar">` + c.pair.map((q) => `<figure><figcaption>${q.cap}</figcaption>` +
        `<img src="${IMG}${q.img}" alt="${q.alt.replace(/"/g, "&quot;")}" width="600" height="600" loading="lazy"></figure>`).join("") + `</div>`
        : `<img src="${IMG}${c.img}" alt="${c.alt.replace(/"/g, "&quot;")}" width="1200" height="600"${i ? ' loading="lazy"' : ""}>`) +
      `<h2${i ? "" : ' id="intro-titel"'}>${c.title}</h2><p>${c.text}</p></section>`).join("") +
    `</div>` +
    `<div class="intro-fuss">` +
    `<div class="intro-punkte" role="group" aria-label="Cards">${dots}</div>` +
    `<label class="intro-merken"><input type="checkbox" class="intro-nicht"> Don't show again` +
    `${storageOk ? "" : ' <span class="intro-hinweis">(this browser cannot remember it)</span>'}</label>` +
    `<div class="intro-knoepfe"><button type="button" class="intro-zurueck">Back</button><button type="button" class="intro-weiter">Next</button></div>` +
    `</div></div>`;
  document.body.appendChild(back);
  const dialog = back.querySelector(".intro-dialog"), cards = [...back.querySelectorAll(".intro-karte")];
  const prevBtn = back.querySelector(".intro-zurueck"), nextBtn = back.querySelector(".intro-weiter"), box = back.querySelector(".intro-nicht");
  const dotBtns = [...back.querySelectorAll(".intro-punkt")], content = back.querySelector(".intro-inhalt");
  let index = 0, lastFocus = null;

  function show(i) {
    index = Math.max(0, Math.min(CARDS.length - 1, i));
    cards.forEach((c, j) => { c.hidden = j !== index; });
    // aria-labelledby always names the title of the shown card
    cards.forEach((c, j) => { const h = c.querySelector("h2"); if (j === index) h.id = "intro-titel"; else h.removeAttribute("id"); });
    dotBtns.forEach((d, j) => { d.classList.toggle("aktiv", j === index); if (j === index) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
    prevBtn.disabled = index === 0;
    nextBtn.textContent = index === CARDS.length - 1 ? "Start exploring" : "Next";
    content.scrollTop = 0;
  }
  function open(i) {
    if (!back.hidden) { show(i || 0); return; }
    lastFocus = document.activeElement;
    box.checked = isHidden();
    back.hidden = false;
    document.documentElement.classList.add("intro-offen");
    show(i || 0);
    nextBtn.focus();
  }
  function close() {
    if (back.hidden) return;
    back.hidden = true;
    document.documentElement.classList.remove("intro-offen");
    const f = lastFocus; lastFocus = null;
    if (f && f !== document.body && document.contains(f) && typeof f.focus === "function") f.focus();
  }
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () => { if (index === CARDS.length - 1) close(); else show(index + 1); });
  dotBtns.forEach((d) => d.addEventListener("click", () => show(+d.dataset.i)));
  back.querySelector(".intro-zu").addEventListener("click", close);
  back.addEventListener("click", (e) => { if (e.target === back) close(); });   // click on the darkened area
  box.addEventListener("change", () => setHidden(box.checked));   // stored at once, not on closing

  // Keys: arrows page, Esc closes, Tab stays in the dialog. Captured on window before the map's own handler on document,
  // which would otherwise step through the proofs of a selected theorem (todo B30).
  window.addEventListener("keydown", (e) => {
    if (back.hidden) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault(); e.stopPropagation();
      show(index + (e.key === "ArrowLeft" ? -1 : 1));
    } else if (e.key === "Escape") {
      e.preventDefault(); e.stopPropagation(); close();
    } else if (e.key === "Tab") {
      const f = [...dialog.querySelectorAll("button, input, [href], [tabindex]:not([tabindex='-1'])")].filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (!dialog.contains(a)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    } else if (!dialog.contains(e.target)) {
      e.stopPropagation();   // no other key reaches the map while the dialog is open
    }
  }, true);
  // Swipe left or right pages on touch screens
  let touch = null;
  dialog.addEventListener("touchstart", (e) => { if (e.touches.length === 1) touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  dialog.addEventListener("touchend", (e) => {
    if (!touch || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y; touch = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
  });

  // Button "Intro" in the toolbar (user, 2026-10-22: "Intro", not "?")
  const btn = document.getElementById("intro-oeffnen");
  if (btn) btn.addEventListener("click", () => open(0));

  // ---------------------------------------------------------------- Opening at start
  let param = null;
  try { param = new URLSearchParams(location.search).get("intro"); } catch (e) { param = null; }
  const automated = !!(navigator && navigator.webdriver);
  const wanted = param === "1" ? true : param === "0" ? false : (automated && param !== "auto") ? false : !isHidden();
  function whenReady(f) {
    if (document.body.dataset.bereit === "1") { f(); return; }
    const mo = new MutationObserver(() => { if (document.body.dataset.bereit === "1") { mo.disconnect(); f(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-bereit"] });
  }
  if (wanted) whenReady(() => open(0));

  // Interface for tests and the screenshot script
  window.E11_INTRO = { open: (i) => open(i || 0), close, isOpen: () => !back.hidden, index: () => index, count: CARDS.length,
    storageOk: () => storageOk, cards: CARDS.map((c) => ({ title: c.title, img: c.pair ? c.pair.map((q) => IMG + q.img) : IMG + c.img })) };
})();
