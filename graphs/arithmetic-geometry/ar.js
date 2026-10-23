// Additional code for the three views in the arithmetic geometry example: colors of the areas, display of the edge
// kinds
// and conjectures, links to other parts of the project. The layered layout and the SVG helpers come from
// ../Beispiel Algebraische Geometrie/graph.js (window.GL).
// Language: visible texts via T or F (English versions in ../../translations/ui-graph.js); without sprache.js German.
// EDGE and STATE_SHORT are translated on load; their keys stay the same.
window.ARS = (function () {
  "use strict";
  const T = (s) => (window.I18N ? window.I18N.t(s) : s);
  const F = (pattern, ...values) => T(pattern).replace(/\{(\d)\}/g, (_, i) => values[i]);
  // Light: fill of the boxes. Dark: edges that start at a node of this area.
  const COLOR = { grundlage: "#dcd8cf", grund: "#dcd8cf", zeta: "#c3d6ea", lfkt: "#cdc6ea", algzt: "#e9d8a6",
    modular: "#e3c3d8", ell: "#f2c9a8", dioph: "#e3eab9", weil: "#cfe0c3",
    galois: "#e8cdb8", padic: "#bfe0da", gruppen: "#d9d2e9" };
  const DARK = { grundlage: "#7d776b", grund: "#7d776b", zeta: "#3f6f9a", lfkt: "#5a4a9a", algzt: "#9a7a1e",
    modular: "#8a4a78", ell: "#b0602c", dioph: "#6f7f22", weil: "#4f7a3a",
    galois: "#8f5530", padic: "#2c7a6e", gruppen: "#5b4a8a" };

  // Display of the edge kinds. `stroke`: stroke-dasharray, `arrow`: marker at the end.
  const EDGE = {
    beweis: { name: "Beweis", color: "#4a4237", stroke: "", width: 1.6,
      text: "Gewöhnlicher Beweis: Linien von den Voraussetzungen in einen Beweispunkt, von dort ein Pfeil zum Satz." },
    bedingt: { name: "Bedingter Beweis", color: "#b0306a", stroke: "7 4", width: 1.9,
      text: "Beweis, unter dessen Voraussetzungen mindestens eine Vermutung ist. Die Folgerung gilt nur, wenn die Vermutung stimmt." },
    teilresultat: { name: "Teilresultat", color: "#2e7d32", stroke: "2 4", width: 2.4,
      text: "Ein bewiesener Spezialfall oder eine abgeschwächte Form der Vermutung. Der Satz ist keine Voraussetzung der Vermutung." },
    aequivalent: { name: "Bewiesene Äquivalenz", color: "#6b3fa0", stroke: "", width: 2.2,
      text: "Es ist bewiesen, dass beide Aussagen gleichwertig sind. Wer eine beweist, hat die andere bewiesen." },
    analogie: { name: "Analogie", color: "#9a9080", stroke: "9 3 2 3", width: 1.4,
      text: "Übertragung zwischen zwei Gebieten, etwa von Funktionenkörpern auf ℚ. Keine logische Abhängigkeit." },
    formulierung: { name: "Voraussetzung der Formulierung", color: "#8a8273", stroke: "1 4", width: 1.6,
      text: "Der Satz muss bekannt sein, damit die Vermutung überhaupt eine sinnvolle Aussage ist." },
  };
  const STATE_SHORT = { offen: "offen", teilweise: "teilweise", bedingt: "bedingt bewiesen", umstritten: "umstritten",
    widerlegt: "widerlegt", programm: "Programm" };
  const STATE_COLOR = { offen: "#6d655a", teilweise: "#2e7d32", bedingt: "#b0306a", umstritten: "#b45309",
    widerlegt: "#9b1c1c", programm: "#6d655a" };
  Object.values(EDGE).forEach((k) => { k.name = T(k.name); k.text = T(k.text); });
  Object.keys(STATE_SHORT).forEach((s) => (STATE_SHORT[s] = T(STATE_SHORT[s])));

  // Small SVG sample of an edge kind for legends
  function pattern(kind) {
    const k = EDGE[kind], b = 34, h = 12;
    const arrow = kind === "analogie" ? "" : `<path d="M${b - 7},${h / 2 - 3.5}L${b},${h / 2}L${b - 7},${h / 2 + 3.5}" fill="none" stroke="${k.color}" stroke-width="1.4"/>`;
    const second = kind === "aequivalent" ? `<path d="M7,${h / 2 - 3.5}L0,${h / 2}L7,${h / 2 + 3.5}" fill="none" stroke="${k.color}" stroke-width="1.4"/>` : "";
    return `<svg width="${b}" height="${h}" viewBox="0 0 ${b} ${h}" style="vertical-align:-1px"><line x1="1" y1="${h / 2}" x2="${b - 1}" y2="${h / 2}" stroke="${k.color}" stroke-width="${k.width}" stroke-dasharray="${k.stroke}" stroke-linecap="round"/>${arrow}${second}</svg>`;
  }

  const AG_PATH = "../algebraic-geometry/";
  const LARGE_PATH = "../../playground/Gro%C3%9Fe%20S%C3%A4tze%20und%20Vermutungen/index.html";
  const GALLERY_PATH = "../../playground/Mathematical%20Wonder/index.html";

  // Links of a node to other parts of the project as HTML
  function refs(k) {
    const parts = [];
    if (k.ag) {
      const ag = window.AG && window.AG.nodes.find((x) => x.id === k.ag);
      parts.push(`<a class="chip" href="${AG_PATH}index.html#${k.ag}">${T("Im Satzgraphen der algebraischen Geometrie")}${ag ? ": " + ag.name : ""}</a>`);
    }
    if (k.large) {
      const G = window.GREAT_PROBLEMS, e = G && G.entriesList.find((x) => x.id === k.large);
      const list = e ? e.lists[0] : "";
      const info = e ? ": " + F("{0} ({1}; Stand dort: {2})", e.name, e.lists.map((l) => G.lists[l].name).join(", "), G.status[e.status].name) : "";
      parts.push(`<a class="chip" href="${LARGE_PATH}${list ? "#liste=" + list : ""}">${T("In der Tabelle großer Sätze und Vermutungen")}${info}</a>`);
    }
    if (k.gallery) parts.push(`<a class="chip" href="${GALLERY_PATH}#ansicht=verzeichnis&b=${k.gallery}">${T("In der Galerie")}</a>`);
    return parts.length ? `<h3>${T("Verweise")}</h3>${parts.join(" ")}` : "";
  }

  const mscText = (k) => k.msc ? `MSC 2020: ${k.msc.join(", ")}` : "";

  return { COLOR, DARK, EDGE, STATE_SHORT, STATE_COLOR, pattern, refs, mscText, AG_PATH, T, F };
})();

// ------------------------------------------------------------ AI proofs (switch „KI-Beweise“)
// Appended later; the code above stays unchanged. Status "beansprucht" of the conjectures whose proof a
// language model claims. The other helpers for AI proofs are in ../Beispiel Algebraische Geometrie/graph.js.
(function (ARS) {
  "use strict";
  ARS.STATE_SHORT.beansprucht = ARS.T("beansprucht");
  ARS.STATE_COLOR.beansprucht = "#9333ea";
})(window.ARS);

// ------------------------------------------------------------ Counterexamples (relations „widerlegt“ and „deutung“)
// Appended later. Display as in ../Beispiel Algebraische Geometrie/graph.js (GL.EDGE, GL.gb…).
(function (ARS) {
  "use strict";
  const { T } = ARS;
  ARS.EDGE.widerlegt = { name: T("Widerlegt"), color: "#9b1c1c", stroke: "8 3 2 3", width: 2.2,
    text: T("Ein Gegenbeispiel widerlegt die Vermutung, auf die der Pfeil zeigt.") };
  ARS.EDGE.deutung = { name: T("Deutung"), color: "#0f766e", stroke: "4 3", width: 1.8,
    text: T("Der Satz zeigt, was die Aussage bedeutet, ohne sie zu beweisen oder zu widerlegen; etwa misst die Tate-Shafarevich-Gruppe das Scheitern des Hasse-Prinzips.") };
})(window.ARS);
