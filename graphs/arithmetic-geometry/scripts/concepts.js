(function () {
  "use strict";
  // Without AI results (they appear only in the theorem graph with the switch „KI-Beweise“)
  const D = GL.aiFilter(window.AR, false), BG = window.AR_CONCEPTS, { el, tex, textLines } = GL, { COLOR, DARK } = ARS;
  // Language: U translates interface texts, FM inserts numbers and names into a translated pattern with {0}, {1}
  // …
  const I18 = window.I18N, U = (s) => (I18 ? I18.t(s) : s);
  const FM = (pattern, ...a) => U(pattern).replace(/\{(\d)\}/g, (m, i) => a[i]);
  const K = {}; BG.concepts.forEach((b) => (K[b.id] = Object.assign(b, { users: [], theorems: [] })));
  BG.concepts.forEach((b) => b.uses.forEach((n) => K[n].users.push(b.id)));
  const THEOREM = {}; D.nodes.forEach((k) => (THEOREM[k.id] = k));
  Object.entries(BG.theoremConcepts).filter(([s]) => THEOREM[s]).forEach(([s, list]) => list.forEach((b) => K[b].theorems.push(s)));
  const AGL = {}; (window.AG_CONCEPTS ? window.AG_CONCEPTS.concepts : []).forEach((b) => (AGL[b.id] = b));

  // ------------------------------------------------------------ definitional depth
  const depth = {};
  const t = (id) => (id in depth ? depth[id] : (depth[id] = K[id].uses.length ? 1 + Math.max(...K[id].uses.map(t)) : 0));
  BG.concepts.forEach((b) => t(b.id));
  const ancestors = (id, s = new Set()) => { K[id].uses.forEach((n) => { if (!s.has(n)) { s.add(n); ancestors(n, s); } }); return s; };
  const descendants = (id, s = new Set()) => { K[id].users.forEach((n) => { if (!s.has(n)) { s.add(n); descendants(n, s); } }); return s; };
  // indirect: A -> B is indirect if A is already an ancestor of another concept that B uses
  const indirectly = (from, to) => K[to].uses.some((m) => m !== from && ancestors(m).has(from));
  const allEdges = BG.concepts.flatMap((b) => b.uses.map((n) => ({ from: n, to: b.id, indirectly: indirectly(n, b.id) })));

  const KIND_SHORT = { objekt: U("Objekt"), eigenschaft: U("Eigenschaft"), morphismus: U("Morphismus"), konstruktion: U("Konstruktion"), invariante: U("Invariante") };
  const SP = 236, BW = 166, BH = 60, GAP_N = 14, GAP_W = 7, MARGIN = 34, HEAD = 30;
  const svg = document.getElementById("graph");
  if (I18 && I18.en) svg.setAttribute("aria-label", U("Begriffsgraph"));
  let edgeList = [], selected = null, withIndirect = false;

  function draw() {
    svg.innerHTML = "";
    const edges = allEdges.filter((k) => withIndirect || !k.indirectly);
    const { columns, item, chains, maxH } = GL.layers(BG.concepts.map((b) => b.id), (id) => depth[id], edges, { BH, GAP_N, GAP_W, MARGIN, HEAD });
    const xCol = (c) => MARGIN + c * SP;
    const B = MARGIN * 2 + (columns.length - 1) * SP + BW, H = MARGIN * 2 + HEAD + maxH;
    svg.setAttribute("viewBox", `0 0 ${B} ${H}`); svg.setAttribute("width", B); svg.setAttribute("height", H);
    const defs = el("defs", {}, svg);
    defs.innerHTML = `<marker id="pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#4a4237"/></marker>`;
    const edgesG = el("g", {}, svg), nodesG = el("g", {}, svg);
    columns.forEach((s, c) => {
      const tx = el("text", { x: xCol(c) + BW / 2, y: MARGIN + 4, "text-anchor": "middle", "font-size": 12, fill: "#6d655a" }, svg);
      tx.textContent = c === 0 ? U("Grundbegriffe") : FM("Tiefe {0}", c);
    });
    const inbound = {}, numerator = {};
    chains.forEach(({ edge: k }) => (inbound[k.to] = (inbound[k.to] || 0) + 1));
    edgeList = [];
    chains.forEach(({ edge: k, chain }, n) => {
      const z = item[k.to], i = (numerator[k.to] = (numerator[k.to] || 0) + 1) - 1, m = inbound[k.to];
      const zx = xCol(z.c) - 2, zy = z.y + BH / 2 + (m > 1 ? (i - (m - 1) / 2) * Math.min(6, (BH - 10) / (m - 1)) : 0);
      const stroke = GL.gradient(defs, "verlauf" + n, DARK[K[k.from].area], xCol(item[k.from].c) + BW, zx);
      const e = el("path", { d: GL.path(chain, zx, zy, xCol, BW, BH), class: "kante", stroke, "marker-end": "url(#pfeil)" }, edgesG);
      el("title", {}, e).textContent = FM("{0} wird mit {1} definiert", K[k.to].name, K[k.from].name);
      edgeList.push({ e, from: k.from, to: k.to });
    });
    BG.concepts.forEach((b) => {
      const x = xCol(item[b.id].c), y = item[b.id].y, g = el("g", { class: "knoten", tabindex: 0 }, nodesG);
      el("rect", { x, y, width: BW, height: BH, rx: 4, fill: COLOR[b.area] }, g);
      const z = textLines(b.name, 22, 3);
      z.forEach((s, i) => { const tx = el("text", { x: x + 7, y: y + 15 + i * 13.5, "font-size": 12.3, "font-weight": 600 }, g); tx.textContent = s; });
      const ta = el("text", { x: x + BW - 6, y: y + BH - 5, "font-size": 10.5, "text-anchor": "end", fill: "#6d655a" }, g);
      ta.textContent = KIND_SHORT[b.kind];
      if (b.theorems.length) {
        const ts = el("text", { x: x + 7, y: y + BH - 5, "font-size": 10.5, fill: "#6d655a" }, g);
        ts.textContent = b.theorems.length === 1 ? U("1 Aussage") : FM("{0} Aussagen", b.theorems.length);
      }
      el("title", {}, g).textContent = b.name;
      b.g = g;
      g.addEventListener("click", () => show(b.id));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter") show(b.id); });
      g.addEventListener("mouseenter", () => { if (!selected) mark(b.id, true); });
      g.addEventListener("mouseleave", () => { if (!selected) unmark(); });
    });
    if (selected) mark(selected, false);
  }

  const used = Object.keys(BG.areas).filter((k) => BG.concepts.some((b) => b.area === k));
  document.getElementById("legende").innerHTML = used
    .map((k) => `<span><i style="background:${COLOR[k]}"></i>${BG.areas[k]}</span>`).join("") +
    `<span class="trenner"></span><label><input type="checkbox" id="mittelbar"> ${FM("auch mittelbare Kanten zeigen ({0} Kanten, deren Begriff schon über einen anderen benutzten Begriff gebraucht wird)", allEdges.filter((k) => k.indirectly).length)}</label>`;
  document.getElementById("mittelbar").addEventListener("change", (e) => { withIndirect = e.target.checked; draw(); });

  const chip = (id) => `<span class="chip" data-id="${id}">${K[id].name}</span>`;
  const theoremLink = (s) => `<a class="chip${THEOREM[s].type === "vermutung" ? " vchip" : ""}" href="index.html#${s}">${THEOREM[s].name}</a>`;
  const panel = document.getElementById("panel");
  panel.addEventListener("click", (e) => { const c = e.target.closest("span.chip"); if (c && c.dataset.id) show(c.dataset.id); });

  function overview() {
    const frequent = BG.concepts.slice().sort((a, b) => b.theorems.length - a.theorems.length).slice(0, 10);
    const basis = BG.concepts.map((b) => ({ b, n: descendants(b.id).size })).sort((a, b) => b.n - a.n).slice(0, 10);
    const without = BG.concepts.filter((b) => !b.theorems.length);
    const kinds = Object.entries(BG.kinds).map(([a, name]) => `${name}: ${BG.concepts.filter((b) => b.kind === a).length}`).join(" · ");
    const nMid = allEdges.filter((k) => k.indirectly).length;
    panel.innerHTML = `<h2>${U("Übersicht")}</h2>
      <p class="klein">${FM("{0} Begriffe, {1} definitorische Abhängigkeiten, davon {2} mittelbar.", BG.concepts.length, allEdges.length, nMid)}
        ${FM("Größte definitorische Tiefe: {0}.", Math.max(...Object.values(depth)))} ${kinds}.
        ${FM("{0} Begriffe kommen auch im Begriffsgraphen der algebraischen Geometrie vor.", BG.concepts.filter((b) => b.ag).length)}</p>
      <h3>${U("Am häufigsten in Aussagen")}</h3>
      <p class="klein">${U("Begriffe, die in den meisten Sätzen und Vermutungen in der Aussage vorkommen.")}</p>
      <ol class="rang">${frequent.map((b) => `<li>${chip(b.id)} ${b.theorems.length}</li>`).join("")}</ol>
      <h3>${U("Am meisten weiterverwendet")}</h3>
      <p class="klein">${U("Begriffe, mit deren Hilfe (mittelbar) die meisten anderen definiert werden.")}</p>
      <ol class="rang">${basis.map((r) => `<li>${chip(r.b.id)} ${FM("{0} Begriffe", r.n)}</li>`).join("")}</ol>
      <h3>${U("In keiner Aussage")}</h3>
      <p class="klein">${FM("Diese {0} Begriffe werden nur gebraucht, um andere zu definieren.", without.length)}</p>${without.map((b) => chip(b.id)).join("")}
      <h3>${U("Lesart")}</h3>
      <p class="klein">${U("Ohne die mittelbaren Kanten zeigt der Graph die transitive Reduktion. Der Begriff „Körper mit einem Element“ hat keine Definition; er steht deshalb bei den Grundbegriffen, obwohl er kein Grundbegriff ist.")}</p>`;
  }
  function mark(id, direct) {
    const vf = direct ? new Set(K[id].uses) : ancestors(id);
    const nf = direct ? new Set(K[id].users) : descendants(id);
    BG.concepts.forEach((x) => {
      x.g.classList.toggle("aktiv", x.id === id);
      x.g.classList.toggle("blass", x.id !== id && !vf.has(x.id) && !nf.has(x.id));
    });
    edgeList.forEach((ka) => {
      const isBefore = direct ? ka.to === id : (ka.to === id || vf.has(ka.to)) && vf.has(ka.from);
      const isAfter = direct ? ka.from === id : (ka.from === id || nf.has(ka.from)) && nf.has(ka.to);
      ka.e.classList.toggle("vorfahr", isBefore);
      ka.e.classList.toggle("nachfahr", isAfter);
      ka.e.classList.toggle("blass", !isBefore && !isAfter);
    });
    return { vf, nf };
  }
  function unmark() {
    BG.concepts.forEach((x) => x.g.classList.remove("aktiv", "blass"));
    edgeList.forEach((ka) => ka.e.classList.remove("vorfahr", "nachfahr", "blass"));
  }
  function show(id) {
    selected = id;
    const b = K[id], { vf, nf } = mark(id, false);
    const ag = b.ag && AGL[b.ag] ? `<h3>${U("Verweise")}</h3><a class="chip" href="${ARS.AG_PATH}begriffe.html#${b.ag}">${FM("Im Begriffsgraphen der algebraischen Geometrie: {0}", AGL[b.ag].name)}</a>` : "";
    panel.innerHTML = `<h2>${b.name}</h2>
      <div class="klein">${BG.kinds[b.kind]} · ${BG.areas[b.area]} · ${FM("definitorische Tiefe {0}", depth[id])}</div>
      <div class="formel">${tex(b.formula)}</div>
      <p>${b.text}</p>${ag}
      ${VF.info("b:" + id)}
      <h3>${U("Wird definiert mit")}</h3>${b.uses.length ? b.uses.map(chip).join("") : `<p class="klein">${U("In diesem Graphen nicht weiter definiert.")}</p>`}
      ${b.users.length ? `<h3>${U("Wird gebraucht für")}</h3>${b.users.map(chip).join("")}` : ""}
      <h3>${U("Kommt vor in den Aussagen")}</h3>${b.theorems.length ? b.theorems.map(theoremLink).join("") : `<p class="klein">${U("In keiner Aussage des Satzgraphen.")}</p>`}
      <h3>${U("Hängt insgesamt ab von")}</h3><p class="klein">${FM("{0} Begriffen (braun markiert)", vf.size)}</p>
      <h3>${U("Insgesamt gebraucht für")}</h3><p class="klein">${FM("{0} Begriffe (blau markiert)", nf.size)}</p>
      <p><a class="chip" href="bipartit.html#${id}">${U("In der Ansicht Begriffe und Sätze")}</a> <span class="chip" id="zurueck">${U("Zur Übersicht")}</span></p>`;
    document.getElementById("zurueck").addEventListener("click", (e) => { e.stopPropagation(); reset(); });
  }
  function reset() { selected = null; unmark(); overview(); }

  draw();
  overview();
  const anchor = decodeURIComponent(location.hash.slice(1));
  if (K[anchor]) show(anchor);
  window.addEventListener("hashchange", () => { const a = decodeURIComponent(location.hash.slice(1)); if (K[a]) show(a); });
  // Filter by comprehensibility of the definition (../Beispiel Algebraische
  // Geometrie/verstaendlichkeit-filter.js)
  VF.an({ name: "AR", svg, nodes: () => BG.concepts.map((b) => ["b:" + b.id, b.g]), edges: () => edgeList.map((ka) => [ka.e, "b:" + ka.from, "b:" + ka.to]) });
})();
