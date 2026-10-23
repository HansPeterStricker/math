// Todo B74: background information of draft 11 ("About") in a dialog of its own over the map, in the style of the
// introduction (scripts/intro.js). The questions and answers stand in data/about-texts.js (window.E11_ABOUT), which is loaded before
// this file. Each question is a <details> element: a click on the question opens or closes its answer.
// Opening rules: the dialog never opens by itself; the button "About" in the toolbar opens it, and ?about=1 in the address
// opens it once the map is drawn (body[data-bereit="1"]). Closing: ×, Esc, a click beside the dialog.
// Classic script, loaded after scripts/map-page.js and scripts/intro.js; works over file:// as well.
(function () {
  "use strict";
  const ITEMS = Array.isArray(window.E11_ABOUT) ? window.E11_ABOUT : [];

  // ---------------------------------------------------------------- Dialog
  const back = document.createElement("div");
  back.className = "about-hinter";
  back.hidden = true;
  back.innerHTML =
    `<div class="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-titel">` +
    `<button type="button" class="about-zu" aria-label="Close" title="Close">×</button>` +
    `<h2 id="about-titel">About this map</h2>` +
    `<div class="about-inhalt">` +
    ITEMS.map((it, i) => `<details class="about-frage" data-i="${i}"><summary>${it.q}</summary><div class="about-antwort">${it.a}</div></details>`).join("") +
    `</div></div>`;
  document.body.appendChild(back);
  const dialog = back.querySelector(".about-dialog"), content = back.querySelector(".about-inhalt");
  const entries = [...back.querySelectorAll(".about-frage")];
  // Links in the answers open in a new tab, so that the map keeps its state
  back.querySelectorAll(".about-antwort a[href]").forEach((a) => {
    if (!/^mailto:/.test(a.getAttribute("href"))) { a.target = "_blank"; a.rel = "noopener"; }
  });
  let lastFocus = null;

  function open() {
    if (!back.hidden) return;
    lastFocus = document.activeElement;
    back.hidden = false;
    document.documentElement.classList.add("about-offen");
    content.scrollTop = 0;
    const first = back.querySelector(".about-frage summary");
    (first || back.querySelector(".about-zu")).focus();
  }
  function close() {
    if (back.hidden) return;
    back.hidden = true;
    document.documentElement.classList.remove("about-offen");
    const f = lastFocus; lastFocus = null;
    if (f && f !== document.body && document.contains(f) && typeof f.focus === "function") f.focus();
  }
  back.querySelector(".about-zu").addEventListener("click", close);
  back.addEventListener("click", (e) => { if (e.target === back) close(); });   // click on the darkened area

  // Keys: Esc closes, Tab stays in the dialog; no other key reaches the map while the dialog is open. Captured on window
  // before the map's own handler on document (as in scripts/intro.js).
  window.addEventListener("keydown", (e) => {
    if (back.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault(); e.stopPropagation(); close();
    } else if (e.key === "Tab") {
      const f = [...dialog.querySelectorAll("button, summary, [href], input, [tabindex]:not([tabindex='-1'])")].filter((x) => !x.disabled && x.offsetParent !== null &&
        (x.tagName === "SUMMARY" || !x.closest("details:not([open])")));   // links in a closed answer cannot take the focus
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (!dialog.contains(a)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    } else {
      e.stopPropagation();   // arrows, + and − and the other keys of the map do nothing while the dialog is open
    }
  }, true);

  // Button "About" in the toolbar, right of "Intro"
  const btn = document.getElementById("about-oeffnen");
  if (btn) btn.addEventListener("click", open);

  // ---------------------------------------------------------------- Opening with ?about=1
  let param = null;
  try { param = new URLSearchParams(location.search).get("about"); } catch (e) { param = null; }
  function whenReady(f) {
    if (document.body.dataset.bereit === "1") { f(); return; }
    const mo = new MutationObserver(() => { if (document.body.dataset.bereit === "1") { mo.disconnect(); f(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-bereit"] });
  }
  if (param === "1") whenReady(open);

  // Interface for tests
  window.E11_ABOUT_DIALOG = { open, close, isOpen: () => !back.hidden, count: entries.length,
    questions: () => entries.map((d) => d.querySelector("summary").textContent),
    expand: (i, on) => { if (entries[i]) entries[i].open = on !== false; } };
})();
