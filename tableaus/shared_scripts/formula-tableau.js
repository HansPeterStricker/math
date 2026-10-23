// Page logic shared by the formula tableaus (Beispiel Pi, Beispiel e). The page's daten.js defines TABLEAU with
// columns, formulas, functions and methods. Panels: tableau of formula cards (one column per form, in the order of the
// data), functions whose theorems serve as premises, the graph of derivations (formula-graph.js) and explanations.
// Links between cards follow the proofs. The derivations start from one of several definitions; the buttons with
// data-ausgang (address key) and data-variant (key in variantProofs) choose it, the first button is the default.
// Panel and starting point are kept in the address (#ansicht=...&ausgang=...).
(function () {
  const { columns: COLUMNS, formulas: FORMULAS, functions: FUNCTIONS, methods: METHODS } = TABLEAU;
  const byId = new Map([...FORMULAS, ...FUNCTIONS].map(x => [x.id, x]));
  const METHOD = new Map(METHODS.map(m => [m.id, m]));
  const PANELS = ["formeln", "funktionen", "graph", "erlaeuterung"];
  const VARIANT_BUTTONS = [...document.querySelectorAll("nav.reiter button[data-ausgang]")];
  const VARIANTS = Object.fromEntries(VARIANT_BUTTONS.map(b => [b.dataset.ausgang, b.dataset.variant]));
  let panel = "formeln", variant = VARIANT_BUTTONS[0].dataset.ausgang, graphDrawn = false;

  // Proof of a statement for the current starting point (null: the statement has no premises).
  const proofOf = f => (f.variantProofs ? f.variantProofs[VARIANTS[variant]] : f.proof) || null;

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function renderFormula(target, tex) {
    if (window.katex) katex.render(tex, target, { displayMode: true, throwOnError: false });
    else target.textContent = tex;
  }

  // Link to a card or function; clicking scrolls there and highlights it briefly.
  function link(id) {
    const a = el("a", "verweis");
    a.href = "#" + id;
    a.textContent = byId.get(id).name;
    a.addEventListener("click", ev => {
      ev.preventDefault();
      showItem(id);
    });
    return a;
  }

  function writeAddress() {
    try { history.replaceState(null, "", `#ansicht=${panel}&ausgang=${variant}`); }
    catch (e) { /* not allowed for some file:// setups */ }
  }

  function showPanel(name) {
    panel = name;
    for (const p of PANELS) document.getElementById("panel-" + p).hidden = p !== name;
    document.querySelectorAll("nav.reiter button[data-panel]").forEach(b => b.classList.toggle("aktiv", b.dataset.panel === name));
    writeAddress();
    if (name === "formeln" || name === "funktionen") document.fonts.ready.then(() => fitFormulas(document.getElementById("panel-" + name)));
    if (name === "graph") sizeGraph();
    if (name === "graph" && !graphDrawn) {
      graphDrawn = true;
      FormulaGraph.draw(document.getElementById("graph"), showItem, proofOf);
    }
  }

  // Formulas wider than their card are set in a smaller font, down to MIN_FORMULA_PX; formulas that still do not fit
  // keep their scroll bar and are marked with the class zu-breit (they need a line break in the data).
  const FORMULA_PX = 14, MIN_FORMULA_PX = 9.5;
  function fitFormulas(root) {
    for (const f of root.querySelectorAll(".formel")) {
      f.style.fontSize = "";
      f.classList.remove("zu-breit");
      if (f.scrollWidth <= f.clientWidth + 1) continue;
      const px = Math.max(MIN_FORMULA_PX, Math.floor(FORMULA_PX * f.clientWidth / f.scrollWidth * 10) / 10);
      f.style.fontSize = px + "px";
      if (f.scrollWidth > f.clientWidth + 1) f.classList.add("zu-breit");
    }
  }

  // The graph frame fills the window below its top edge, so that the page needs no scrolling.
  function sizeGraph() {
    const frame = document.querySelector(".graph-rahmen");
    const top = frame.getBoundingClientRect().top + window.scrollY;
    frame.style.height = Math.max(300, window.innerHeight - top - 16) + "px";
  }
  window.addEventListener("resize", () => {
    if (panel === "formeln" || panel === "funktionen") fitFormulas(document.getElementById("panel-" + panel));
    if (panel !== "graph") return;
    sizeGraph();
    FormulaGraph.fit();
  });

  function setVariant(name) {
    variant = name;
    document.querySelectorAll("nav.reiter button[data-ausgang]").forEach(b => b.classList.toggle("aktiv", b.dataset.ausgang === name));
    renderCards();
    graphDrawn = false;
    showPanel(panel);
  }

  // Opens the panel that contains a function or card, scrolls to it and highlights it briefly.
  function showItem(id) {
    showPanel(FUNCTIONS.some(f => f.id === id) ? "funktionen" : "formeln");
    const target = document.getElementById(id);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.remove("hervor");
    void target.offsetWidth;
    target.classList.add("hervor");
  }

  function appendLinks(parent, ids) {
    ids.forEach((id, i) => {
      if (i) parent.appendChild(document.createTextNode(", "));
      parent.appendChild(link(id));
    });
  }

  // Proof idea below a card (Glossar: Beweisidee), collapsed until the reader opens it: premises, kind of method, method.
  function appendDerivation(card, f) {
    const proof = proofOf(f);
    if (proof) {
      const box = el("details", "folgt");
      box.appendChild(el("summary", "", "Beweisidee"));
      const from = el("p", "", "Folgt aus: ");
      appendLinks(from, proof.premises);
      const m = METHOD.get(proof.type);
      from.appendChild(el("span", "methode", ` – <span class="art" title="${m.name}">${m.short}</span> ${proof.method}`));
      box.appendChild(from);
      card.appendChild(box);
    } else if (f.variantProofs) {
      card.appendChild(el("p", "folgt", "Ausgangspunkt der Herleitungen, setzt nichts voraus."));
    }
  }

  function renderCards() {
    const row = document.getElementById("funktionen");
    row.innerHTML = "";
    for (const fn of FUNCTIONS) {
      const box = el("article", "karte funktion");
      box.id = fn.id;
      box.appendChild(el("h3", "", fn.name));
      const formula = el("div", "formel");
      renderFormula(formula, fn.formula);
      box.appendChild(formula);
      box.appendChild(el("p", "notiz", fn.note));
      appendDerivation(box, fn);
      row.appendChild(box);
    }

    const grid = document.getElementById("tableau");
    grid.innerHTML = "";
    for (const col of COLUMNS) {
      const column = el("section", "spalte");
      column.appendChild(el("h2", "", col.title));
      for (const f of FORMULAS.filter(x => x.column === col.id)) {
        const card = el("article", "karte");
        card.id = f.id;
        const title = el("h3");
        title.textContent = f.name;
        if (f.definition) title.appendChild(el("span", "abzeichen", "Definition"));
        card.appendChild(title);
        const meta = [f.who, f.year].filter(Boolean).join(", ");
        if (meta) {
          const who = el("div", "wer");
          who.textContent = meta;
          card.appendChild(who);
        }
        const formula = el("div", "formel");
        renderFormula(formula, f.formula);
        card.appendChild(formula);
        card.appendChild(el("p", "notiz", f.note));
        appendDerivation(card, f);
        column.appendChild(card);
      }
      grid.appendChild(column);
    }
  }

  document.querySelectorAll("nav.reiter button[data-panel]").forEach(b => b.addEventListener("click", () => showPanel(b.dataset.panel)));
  document.querySelectorAll("nav.reiter button[data-ausgang]").forEach(b => b.addEventListener("click", () => setVariant(b.dataset.ausgang)));
  const p = location.hash.match(/ansicht=(\w+)/), v = location.hash.match(/ausgang=(\w+)/);
  if (p && PANELS.includes(p[1])) panel = p[1];
  setVariant(v && VARIANTS[v[1]] ? v[1] : variant);
})();
