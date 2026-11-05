// Box behind the small (i) next to a title or an area name (user, 5 November 2026). Opens on hover or keyboard focus,
// is placed at the symbol with getBoundingClientRect (below it, or above it where there is no room; to the left where
// it would pass the right edge) and has position: fixed, so scrolling containers do not clip it. Closes on leaving,
// on focus loss, on Escape and on scrolling. Classic script (the pages also open over file://).
(function () {
  "use strict";
  let current = null;
  function close() {
    if (!current) return;
    current.classList.remove("open");
    current = null;
  }
  function open(info) {
    if (current === info) return;
    close();
    const box = info.querySelector(".info-text");
    if (!box) return;
    box.style.visibility = "hidden";
    info.classList.add("open");
    const r = info.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight, m = 8;
    let left = r.left, top = r.bottom;
    if (left + w > window.innerWidth - m) left = r.right - w;
    left = Math.max(m, Math.min(left, window.innerWidth - m - w));
    if (top + h > window.innerHeight - m) top = r.top - h;
    top = Math.max(m, top);
    box.style.left = left + "px";
    box.style.top = top + "px";
    box.style.visibility = "";
    current = info;
  }
  const infoOf = (ev) => ev.target.closest ? ev.target.closest(".info") : null;
  document.addEventListener("mouseover", (ev) => { const i = infoOf(ev); if (i) open(i); else if (current && !current.contains(ev.target)) close(); });
  document.addEventListener("focusin", (ev) => { const i = infoOf(ev); if (i) open(i); else close(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") close(); });
  window.addEventListener("scroll", close, true);
  document.addEventListener("mouseleave", close);
})();
