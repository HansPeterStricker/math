// Theorem graph with conjectures. Presentation (to be adopted by other graphs with the same data model):
//
// Columns
//   - Logical depth only via proofs with kind "beweis" (least fixed point; foundations 0). Conditional proofs do not
//   count.
//   - Conjectures (type "vermutung") have no depth. They stand to the right of a vertical dashed separator line on a
//     gray background (#f3efe6), in column maxT + 1 + level. Level 0: the conjecture has no conditional proof from
//     another
//     conjecture; otherwise 1 + the highest level of the conjectures among the premises. If a conjecture is equivalent
//     to
//     another one via a relation "aequivalent" (from -> to), it stands at least one level to the right of `to`.
//   - Layout with GL.layers over all edges that lead to the right: proof edges (both kinds) as well as
//     relations "teilresultat" and "formulierung" (which always lead from a theorem to a conjecture).
// Nodes
//   - Theorem: box with solid border, fill by area. Conjecture: rounded box (rx 9), dashed border
//     (6 3) in the dark area color, semi-transparent fill; at the bottom left the status in italics in the color from
//     ARS.STATE_COLOR. Theorems with field `ag` carry „auch in AG“ at the bottom left.
// Edges (colors and dash patterns in ar.js, ARS.EDGE)
//   - beweis: as in the original, gradient in the area color of the premise, via a proof point to the theorem.
//   - bedingt: like beweis, but uniformly #b0306a, dashed (7 4); proof point and arrow in the same color. If
//     the edge leads backwards (for example from abc to Faltings's theorem), it is drawn as an arc from the left edge
//     of the premise
//     into the proof point.
//   - teilresultat: #2e7d32, dotted (2 4), without proof point directly to the left edge of the conjecture, with arrow.
//   - formulierung: #8a8273, finely dotted (1 4), like teilresultat.
//   - aequivalent: #6b3fa0, solid, arrows at both ends; arc between the facing edges.
//   - analogie: #9a9080, dash-dot (9 3 2 3), without arrow.
//   Every kind except beweis can be hidden in the legend (class ohne-<art> on the body).
// Switcher
//   - Address #vermutungen=0 shows the pure theorem graph: without conjectures, without conditional proofs, without
//   relations.
//     A node is selected with k=<id> (#vermutungen=0&k=pnt); the short form #<id> still works.
//   - When switching, the page is reloaded, because layout and depths depend on the state.
(function () {
  "use strict";
  const { el, tex, textLines } = GL, { COLOR, DARK, EDGE, STATE_SHORT, STATE_COLOR } = ARS;
  // Language (../../translations/sprache.js): U translates UI texts, FM inserts values into a translated pattern with {0}, {1}
  // …
  const I18 = window.I18N, U = (s) => (I18 ? I18.t(s) : s);
  const FM = (pattern, ...a) => U(pattern).replace(/\{(\d+)\}/g, (m, i) => a[i]);
  // ------------------------------------------------------------ State from the address
  // AI proofs (ki=1) switch the conjectures on, because their targets are conjectures. A reference to a node
  // that is in the graph only with AI proofs switches them on as well.
  const onlyAI = (id) => window.AR.nodes.some((k) => k.id === id && k.ki);
  const read = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h.includes("=")) return { withC: true, ki: onlyAI(h), k: h };
    const q = new URLSearchParams(h), k = q.get("k") || "", ki = q.get("ki") === "1" || onlyAI(k);
    return { withC: ki || q.get("vermutungen") !== "0", ki, k };
  };
  const uiState = read(), withC = uiState.withC, KI = uiState.ki;
  const address = (v, k, ki = KI) => "#" + (ki ? "ki=1" + (k ? "&k=" + k : "") : v ? (k || "") : "vermutungen=0" + (k ? "&k=" + k : ""));
  const A = GL.aiFilter(window.AR, KI);
  const D = withC ? A : Object.assign({}, A, {
    nodes: A.nodes.filter((k) => k.type !== "vermutung"),
    proofs: A.proofs.filter((b) => b.kind === "beweis"),
    relations: [],
  });
  if (!withC) {
    const ids = new Set(D.nodes.map((k) => k.id));
    D.history = A.history.filter((h) => ids.has(h.from));
    D.highlights = {}; Object.keys(A.highlights).forEach((id) => { if (ids.has(id)) D.highlights[id] = A.highlights[id]; });
    document.querySelectorAll("nav.ansichten a:not(.fremd)").forEach((a) => (a.href = a.getAttribute("href").split("#")[0] + "#vermutungen=0"));
  }
  const HIGHLIGHT = { staunen: "#c2410c", zusammenhang: "#7c3aed", verstehen: "#0f766e", grundlegend: "#1f2937" };
  const GLYPH = { staunen: "★", zusammenhang: "◆", verstehen: "●", grundlegend: "■" };
  const K = {}; D.nodes.forEach((k) => (K[k.id] = Object.assign(k, { proofs: [], users: [], rel: [] })));
  D.proofs.forEach((b, i) => { b.nr = i; K[b.from].proofs.push(b); b.premises.forEach((p) => K[p].users.push(b)); });
  D.relations.forEach((z) => { K[z.from].rel.push(z); K[z.to].rel.push(z); });
  const isConj = (id) => K[id].type === "vermutung";

  // ------------------------------------------------------------ logical depth, only via ordinary proofs
  const depth = {};
  D.nodes.forEach((k) => (depth[k.id] = k.type === "grundlage" ? 0 : Infinity));
  for (let r = 0; r <= D.nodes.length; r++) {
    let fresh = false;
    D.proofs.forEach((b) => {
      if (b.kind !== "beweis") return;
      const v = 1 + Math.max(...b.premises.map((p) => depth[p]));
      if (v < depth[b.from]) { depth[b.from] = v; fresh = true; }
    });
    if (!fresh) break;
  }
  const maxT = Math.max(...D.nodes.filter((k) => !isConj(k.id)).map((k) => depth[k.id]));

  // ------------------------------------------------------------ Level of the conjectures
  // 0: does not follow conditionally from any other conjecture; otherwise 1 + the highest level of the conjectures
  // among the premises.
  // Equivalent reformulations stand one level to the right of their conjecture.
  const level = {};
  const st = (id, stack = new Set()) => {
    if (id in level) return level[id];
    stack.add(id);
    let s = 0;
    K[id].proofs.forEach((b) => b.premises.forEach((p) => { if (isConj(p) && !stack.has(p)) s = Math.max(s, 1 + st(p, stack)); }));
    stack.delete(id);
    return (level[id] = s);
  };
  D.nodes.filter((k) => isConj(k.id)).forEach((k) => st(k.id));
  D.relations.filter((z) => z.kind === "aequivalent" && isConj(z.from) && isConj(z.to))
    .forEach((z) => (level[z.from] = Math.max(level[z.from], level[z.to] + 1)));
  // With AI proofs, the claimed statements stand in their own columns before the other conjectures (GL.aiColumns)
  const KS = GL.aiColumns(K, level, maxT);
  const column = (id) => (isConj(id) ? KS.column(id) : depth[id]);

  // ------------------------------------------------------------ Edges
  const proofEdges = D.proofs.flatMap((b) => b.premises.map((p) => ({ from: p, to: b.from, proof: b, kind: b.kind })));
  const relEdges = D.relations.filter((z) => z.kind === "teilresultat" || z.kind === "formulierung" || z.kind === "widerlegt" || z.kind === "deutung")
    .map((z) => ({ from: z.from, to: z.to, rel: z, kind: z.kind }));
  const forward = proofEdges.concat(relEdges).filter((ka) => column(ka.from) < column(ka.to));
  const back = proofEdges.filter((ka) => column(ka.from) >= column(ka.to));
  const across = D.relations.filter((z) => z.kind === "aequivalent" || z.kind === "analogie");

  // ------------------------------------------------------------ Layout
  const SP = 240, BW = 160, BH = 54, GAP_N = 16, GAP_W = 7, MARGIN = 34, HEAD = 34;
  const { columns, item, chains, maxH } = GL.layers(D.nodes.map((k) => k.id), column, forward, { BH, GAP_N, GAP_W, MARGIN, HEAD });
  const xCol = (c) => MARGIN + c * SP;
  const xy = (id) => [xCol(item[id].c), item[id].y];
  const B = MARGIN * 2 + (columns.length - 1) * SP + BW + 80, H = MARGIN * 2 + HEAD + maxH;
  const svg = document.getElementById("graph");
  if (I18 && I18.en) svg.setAttribute("aria-label", U("Graph der Sätze und Vermutungen"));
  svg.setAttribute("viewBox", `0 0 ${B} ${H}`); svg.setAttribute("width", B); svg.setAttribute("height", H);
  const defs = el("defs", {}, svg);
  const marker = (id, color, start) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="${start ? "auto-start-reverse" : "auto"}"><path d="M0,0L10,5L0,10Z" fill="${color}"/></marker>`;
  defs.innerHTML = marker("pfeil", "#4a4237") + marker("pfeil-bedingt", EDGE.bedingt.color) + marker("pfeil-teilresultat", EDGE.teilresultat.color) +
    marker("pfeil-formulierung", EDGE.formulierung.color) + marker("pfeil-aequivalent", EDGE.aequivalent.color, true) + GL.aiMarker("pfeil-ki") +
    marker("pfeil-widerlegt", EDGE.widerlegt.color) + marker("pfeil-deutung", EDGE.deutung.color);
  const backG = el("g", {}, svg), edgesG = el("g", {}, svg), pointsG = el("g", {}, svg), nodesG = el("g", {}, svg);

  // Separator line and column headers
  const xSep = xCol(maxT + 1) - (SP - BW) / 2;
  if (withC) {
    el("line", { x1: xSep, y1: MARGIN - 14, x2: xSep, y2: H - MARGIN / 2, stroke: "#b9ad9a", "stroke-width": 1.5, "stroke-dasharray": "3 4" }, backG);
    el("rect", { x: xSep, y: 0, width: B - xSep, height: H, fill: "#f3efe6" }, backG);
  }
  columns.forEach((s, c) => {
    const tx = el("text", { x: xCol(c) + BW / 2, y: MARGIN + 4, "text-anchor": "middle", "font-size": 12, fill: "#6d655a" }, backG);
    tx.textContent = KS.head(c);
  });

  // Proof points to the left of the node
  D.proofs.forEach((b) => {
    const [zx, zy] = xy(b.from), alt = K[b.from].proofs.length, i = K[b.from].proofs.indexOf(b);
    b.p = [zx - 34, zy + BH / 2 + (i - (alt - 1) / 2) * 13];
  });
  // Distribute the entry points of relation edges along the left edge
  const inbound = {}, numerator = {};
  chains.forEach(({ edge: k }) => { if (k.rel) inbound[k.to] = (inbound[k.to] || 0) + 1; });
  const edgeList = [];
  const title = (e, s) => (el("title", {}, e).textContent = s);
  chains.forEach(({ edge: k, chain }, n) => {
    if (k.proof) {
      const [px, py] = k.proof.p;
      const isCond = k.kind === "bedingt", ks = GL.aiStyle(k.proof);
      const stroke = ks ? ks.color : isCond ? EDGE.bedingt.color : GL.gradient(defs, "verlauf" + n, DARK[K[k.from].area], xCol(item[k.from].c) + BW, px);
      const e = el("path", Object.assign({ d: GL.path(chain, px, py, xCol, BW, BH), class: "kante" + (isCond ? " bedingt" : "") + (ks ? " ki" : ""), stroke }, ks ? { style: `stroke-dasharray:${ks.stroke || "none"}` } : {}), edgesG);
      title(e, ks ? FM("{0} → {1} (KI-Beweis, {2}, Beweis „{3}“)", K[k.from].name, K[k.to].name, U(k.proof.ki.verification), k.proof.name)
        : FM(isCond ? "{0} → {1} (bedingter Beweis „{2}“)" : "{0} → {1} (Beweis „{2}“)", K[k.from].name, K[k.to].name, k.proof.name));
      edgeList.push({ e, from: k.from, to: k.to, proof: k.proof, kind: k.kind });
    } else {
      const z = item[k.to], i = (numerator[k.to] = (numerator[k.to] || 0) + 1) - 1, m = inbound[k.to];
      const zx = xCol(z.c) - 2, zy = z.y + 8 + (m > 1 ? (i / (m - 1)) * (BH - 16) : BH / 2 - 8);
      const e = el("path", { d: GL.path(chain, zx, zy, xCol, BW, BH), class: "kante bez " + k.kind, stroke: EDGE[k.kind].color, "marker-end": `url(#pfeil-${k.kind})` }, edgesG);
      title(e, `${K[k.from].name} → ${K[k.to].name} (${EDGE[k.kind].name})`);
      edgeList.push({ e, from: k.from, to: k.to, rel: k.rel, kind: k.kind });
    }
  });
  // Proof edges leading backwards: arc from the left edge of the premise into the proof point
  back.forEach((k) => {
    const [px, py] = k.proof.p, [sx, sy0] = xy(k.from), sy = sy0 + BH / 2;
    const isCond = k.kind === "bedingt", hubNode = Math.max(70, Math.abs(sx - px) * 0.18);
    const e = el("path", { d: `M${sx},${sy}C${sx - hubNode},${sy} ${px - 70},${py} ${px},${py}`,
      class: "kante rueck" + (isCond ? " bedingt" : ""), stroke: isCond ? EDGE.bedingt.color : DARK[K[k.from].area] }, edgesG);
    title(e, FM(isCond ? "{0} → {1} (bedingter Beweis „{2}“, rückwärts)" : "{0} → {1} (Beweis „{2}“, rückwärts)", K[k.from].name, K[k.to].name, k.proof.name));
    edgeList.push({ e, from: k.from, to: k.to, proof: k.proof, kind: k.kind });
  });
  // Equivalences and analogies: arc between the boxes
  across.forEach((z) => {
    const [ax, ay0] = xy(z.from), [bx, by0] = xy(z.to), ay = ay0 + BH / 2, by = by0 + BH / 2;
    let d;
    if (ax === bx) { const w = 50 + Math.abs(ay - by) * 0.08; d = `M${ax + BW},${ay}C${ax + BW + w},${ay} ${bx + BW + w},${by} ${bx + BW},${by}`; }
    else { const [lx, ly, rx, ry] = ax < bx ? [ax + BW, ay, bx, by] : [bx + BW, by, ax, ay]; d = `M${lx},${ly}` + GL.arc(lx, ly, rx, ry); }
    const at = { d, class: "kante bez " + z.kind, stroke: EDGE[z.kind].color };
    if (z.kind === "aequivalent") { at["marker-end"] = "url(#pfeil-aequivalent)"; at["marker-start"] = "url(#pfeil-aequivalent)"; }
    const e = el("path", at, edgesG);
    title(e, `${K[z.from].name} ${z.kind === "aequivalent" ? "⇔" : "~"} ${K[z.to].name} (${EDGE[z.kind].name})`);
    edgeList.push({ e, from: z.from, to: z.to, rel: z, kind: z.kind, symmetric: true });
  });
  // Arrows from the proof point to the node, and the points themselves
  D.proofs.forEach((b) => {
    const [zx, zy] = xy(b.from), [px, py] = b.p, alt = K[b.from].proofs.length, isCond = b.kind === "bedingt", ks = GL.aiStyle(b);
    edgeList.push({ e: el("path", { d: `M${px},${py}L${zx - 2},${zy + BH / 2}`, class: "kante ziel" + (ks ? " zielKI" : isCond ? " zielB" : ""), "marker-end": ks ? "url(#pfeil-ki)" : isCond ? "url(#pfeil-bedingt)" : "url(#pfeil)" }, edgesG), from: null, to: b.from, proof: b, kind: b.kind });
    const color = ks ? ks.color : isCond ? EDGE.bedingt.color : "#4a4237";
    b.e = el("circle", { cx: px, cy: py, r: 4.5, fill: alt > 1 ? "#fff" : color, stroke: color, "stroke-width": 1.5, class: "punkt" }, pointsG);
    title(b.e, FM(ks ? (b.kind === "beansprucht" ? "Beanspruchter KI-Beweis „{0}“ für {1}" : "Beweis mit KI-Hilfe „{0}“ für {1}") : isCond ? "Bedingter Beweis „{0}“ für {1}" : "Beweis „{0}“ für {1}", b.name, K[b.from].name));
    if (ks) GL.aiBadge(pointsG, px, py);
  });

  // ------------------------------------------------------------ Nodes
  let selected = null;
  D.nodes.forEach((k) => {
    const [x, y] = xy(k.id), v = isConj(k.id);
    const gb = GL.isCounterexample(k);
    const g = el("g", { class: "knoten" + (v ? " vermutung" : "") + (gb ? " gegenbeispiel" : ""), tabindex: 0 }, nodesG);
    const r = el("rect", { x, y, width: BW, height: BH, rx: v ? 9 : 4, fill: COLOR[k.area], class: "kasten" }, g);
    if (v) r.setAttribute("style", `--rand:${k.state === "beansprucht" ? GL.AI_COLOR : DARK[k.area]}`);
    if (gb) { GL.gbPattern(defs); GL.gbBox(g, x, y, BW, BH); }
    const z = textLines(k.name, 21, 3);
    z.forEach((s, i) => { const tx = el("text", { x: x + 7, y: y + 15 + i * 13.5, "font-size": 12.3, "font-weight": 600 }, g); tx.textContent = s; });
    const jt = GL.yearText(k, D.history);
    if (jt && !v) { const tj = el("text", { x: x + BW - 6, y: y + BH - 5, "font-size": 10.5, "text-anchor": "end", fill: "#6d655a" }, g); tj.textContent = jt; }
    if (v) { const ts = el("text", { x: x + 7, y: y + BH - 5, "font-size": 10.5, "font-style": "italic", fill: STATE_COLOR[k.state] }, g); ts.textContent = STATE_SHORT[k.state]; }
    else if (gb) { const ta = el("text", { x: x + 7, y: y + BH - 5, "font-size": 10.5, "font-style": "italic", fill: GL.GB_COLOR }, g); ta.textContent = U("Gegenbeispiel"); }
    else if (k.ag) { const ta = el("text", { x: x + 7, y: y + BH - 5, "font-size": 10, fill: "#6d655a" }, g); ta.textContent = U("auch in AG"); }
    const hv = D.highlights[k.id];
    if (hv) {
      g.classList.add("besonders");
      el("rect", { x: x - 3, y: y - 3, width: BW + 6, height: BH + 6, rx: v ? 11 : 6, fill: "none", style: `stroke:${HIGHLIGHT[hv.kind]};stroke-width:2.4` }, g);
      el("circle", { cx: x + BW, cy: y, r: 9, fill: HIGHLIGHT[hv.kind] }, g);
      const z2 = el("text", { x: x + BW, y: y + 4, "text-anchor": "middle", "font-size": 11, fill: "#fff" }, g);
      z2.textContent = GLYPH[hv.kind];
    }
    title(g, k.name);
    k.g = g;
    GL.hover(g, k, D.history);   // hover box with the same three lines as the map (todo B26)
    g.addEventListener("click", () => show(k.id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter") show(k.id); });
    g.addEventListener("mouseenter", () => { if (!selected) mark(k.id, true); });
    g.addEventListener("mouseleave", () => { if (!selected) unmark(); });
  });

  // ------------------------------------------------------------ Legend
  const showable = withC ? ["bedingt", "teilresultat", "aequivalent", "analogie", "formulierung", "widerlegt", "deutung"]
    .filter((a) => a === "bedingt" || D.relations.some((z) => z.kind === a)) : [];
  document.getElementById("legende").innerHTML =
    `<label class="umschalter"><input type="checkbox" id="mitV"${withC ? " checked" : ""}> <b>${U("mit Vermutungen")}</b>
      ${withC ? "" : U("(ausgeblendet: Vermutungen, bedingte Beweise und alle Beziehungen; reiner Satzgraph)")}</label>
      <label class="umschalter ki"><input type="checkbox" id="mitKI"${KI ? " checked" : ""}> <b>${U("KI-Beweise")}</b>
      ${KI ? U("(beanspruchte Beweise sind ungeprüft; schaltet die Vermutungen mit ein)") : ""}</label>` +
    (KI ? GL.aiLegend(D.proofs) : "") + `<span class="trenner"></span>` +
    Object.entries(D.areas)
    .map(([k, v]) => `<span><i style="background:${COLOR[k]}"></i>${v}</span>`).join("") +
    `<span class="trenner"></span><span><i style="background:#fff"></i>${U("Satz")}</span>${D.nodes.some(GL.isCounterexample) ? GL.gbLegend() : ""}${withC ? `<span><i class="vkasten" style="background:#fff"></i>${U("Vermutung")}</span>` : ""}` +
    `<span class="trenner"></span>` + ["beweis"].concat(showable).map((a) =>
      `<label title="${EDGE[a].text}">${a === "beweis" ? "" : `<input type="checkbox" data-art="${a}" checked> `}${ARS.pattern(a)} ${EDGE[a].name}</label>`).join("") +
    `<span class="trenner"></span>` + Object.entries(D.highlightKinds)
    .map(([k, v]) => `<span><b style="color:${HIGHLIGHT[k]}">${GLYPH[k]}</b> ${v}</span>`).join("") +
    `<label class="filter"><input type="checkbox" id="nurBesondere"> ${U("nur hervorgehobene Knoten betonen")}</label>`;
  document.getElementById("nurBesondere").addEventListener("change", (e) => document.body.classList.toggle("nur-besondere", e.target.checked));
  document.querySelectorAll("#legende input[data-art]").forEach((c) => c.addEventListener("change", () =>
    document.body.classList.toggle("ohne-" + c.dataset.art, !c.checked)));
  // Without conjectures also without AI proofs; a selected node stays selected if it is still in the graph
  // afterwards
  const keeps = (v, ki) => (selected && K[selected] && (ki || !K[selected].ki) && (v || !isConj(selected)) ? selected : "");
  document.getElementById("mitV").addEventListener("change", (e) => { location.hash = address(e.target.checked, keeps(e.target.checked, e.target.checked && KI), e.target.checked && KI); });
  document.getElementById("mitKI").addEventListener("change", (e) => { location.hash = address(true, keeps(true, e.target.checked), e.target.checked); });

  // ------------------------------------------------------------ Sidebar
  const chip = (id) => K[id] ? `<span class="chip${isConj(id) ? " vchip" : GL.isCounterexample(K[id]) ? " gbchip" : ""}" data-id="${id}">${K[id].name}</span>` : FM("„{0}“", A.nodes.find((k) => k.id === id).name);
  const panel = document.getElementById("panel");
  panel.addEventListener("click", (e) => { const c = e.target.closest("span.chip"); if (c && c.dataset.id) show(c.dataset.id); });

  const ancestors = (id, s = new Set()) => { K[id].proofs.forEach((b) => b.premises.forEach((p) => { if (!s.has(p)) { s.add(p); ancestors(p, s); } })); return s; };
  const descendants = (id, s = new Set()) => { K[id].users.forEach((b) => { if (!s.has(b.from)) { s.add(b.from); descendants(b.from, s); } }); return s; };
  const partner = (id) => new Set(K[id].rel.map((z) => (z.from === id ? z.to : z.from)));

  function overview() {
    const num = (f) => D.proofs.filter(f).length;
    const nEdges = (a) => proofEdges.filter((k) => k.kind === a).length;
    const nRel = (a) => D.relations.filter((z) => z.kind === a).length;
    const conj = D.nodes.filter((k) => isConj(k.id));
    const byStatus = Object.keys(D.statuses).map((s) => {
      const l = conj.filter((k) => k.state === s);
      return l.length ? `<p class="klein"><b style="color:${STATE_COLOR[s]}">${D.statuses[s]}</b> (${l.length})</p>${l.map((k) => chip(k.id)).join("")}` : "";
    }).join("");
    const rank = D.nodes.filter((k) => k.type === "satz").map((k) => ({ k, n: descendants(k.id).size })).sort((a, b) => b.n - a.n).slice(0, 8);
    const groups = Object.entries(D.highlightKinds).map(([kind, t]) => {
      const ids = Object.keys(D.highlights).filter((id) => D.highlights[id].kind === kind);
      return `<h3><span style="color:${HIGHLIGHT[kind]}">${GLYPH[kind]}</span> ${t}</h3>${ids.map(chip).join("")}`;
    }).join("");
    panel.innerHTML = `<h2>${U("Übersicht")}</h2>
      <p class="klein">${FM("{0} Grundlagen, {1} Sätze, {2} Gegenbeispiele, {3} Vermutungen. {4} gewöhnliche Beweise mit {5} Voraussetzungen, " +
        "{6} bedingte Beweise mit {7} Voraussetzungen; {8} Teilresultate, {9} Äquivalenzen, {10} Analogien, " +
        "{11} Voraussetzungen der Formulierung. Größte logische Tiefe: {12}.",
        D.nodes.filter((k) => k.type === "grundlage").length, D.nodes.filter((k) => k.type === "satz").length,
        D.nodes.filter(GL.isCounterexample).length, conj.length, num((b) => b.kind === "beweis"), nEdges("beweis"),
        num((b) => b.kind === "bedingt"), nEdges("bedingt"), nRel("teilresultat"), nRel("aequivalent"), nRel("analogie"),
        nRel("formulierung"), maxT)}</p>
      <h3>${U("Kantenarten")}</h3>
      ${["beweis"].concat(showable).map((a) => `<p class="klein">${ARS.pattern(a)} <b>${EDGE[a].name}.</b> ${EDGE[a].text}</p>`).join("")}
      ${withC ? "" : `<p class="klein">${U("Vermutungen sind ausgeblendet. Der Graph enthält nur bewiesene Sätze und gewöhnliche Beweise, " +
        "wie im Beispiel Algebraische Geometrie.")}</p>`}
      ${!withC ? "" : `<h3>${U("Welche Sätze gehen sicher in einen Beweis ein?")}</h3>
      <p class="klein">${FM("Logisch lässt sich nie zeigen, dass ein bestimmter Satz in jeden künftigen Beweis einer Vermutung " +
        "eingehen muss: Ist die Vermutung beweisbar, so ist jeder bewiesene Satz eine gültige, aber überflüssige " +
        "Voraussetzung. Der Graph zeigt deshalb vier schwächere Beziehungen. " +
        "(a) Bewiesene Reduktionen erscheinen als bedingte Beweise, etwa {0} historisch aus der Modularität " +
        "oder {1} aus der abc-Vermutung. Sie zeigen einen hinreichenden Weg, keinen notwendigen; die " +
        "{2} folgt aus den {3}, wurde aber ohne sie bewiesen. " +
        "(b) Teilresultate wie {4} muss jeder Beweis als Spezialfall mitliefern, nicht aber ihren Beweis. " +
        "(c) Dass alle bekannten Ansätze einen Satz benutzen, ist eine Aussage über die Literatur und keine Kante. Am " +
        "nächsten kommt ihr die Voraussetzung der Formulierung: Ohne {5} hat die BSD-Vermutung keinen " +
        "Gegenstand. " +
        "(d) Bei bewiesenen Äquivalenzen wie {6} liefert ein Beweis der einen Aussage zusammen mit dem " +
        "Äquivalenzbeweis einen Beweis der anderen. Ausführlich in der README.",
        chip("fermat"), chip("faltings"), chip("weilrh"), chip("standard"), chip("bsdrang01"), chip("lellfort"), chip("robin"))}</p>
      <h3>${U("Vermutungen nach Stand")}</h3>${byStatus}`}
      ${KI ? GL.aiOverview(D, chip) : ""}
      <h2 style="margin-top:22px">${U("Besondere Knoten")}</h2>
      <p class="klein">${U("Redaktionelle Einschätzung nach dem Leitgedanken des Projekts, keine Messung.")}</p>
      ${groups}
      <h3>${U("Knotenpunkte")}</h3>
      <p class="klein">${U("Sätze, von denen die meisten anderen Knoten abhängen (über irgendeinen Beweis, auch bedingte).")}</p>
      <ol class="rang">${rank.map((r) => `<li>${chip(r.k.id)} ${r.n}</li>`).join("")}</ol>`;
  }

  function mark(id, direct) {
    const vf = direct ? new Set(K[id].proofs.flatMap((b) => b.premises)) : ancestors(id);
    const nf = direct ? new Set(K[id].users.map((b) => b.from)) : descendants(id);
    const pa = partner(id);
    D.nodes.forEach((x) => {
      x.g.classList.toggle("aktiv", x.id === id);
      x.g.classList.toggle("blass", x.id !== id && !vf.has(x.id) && !nf.has(x.id) && !pa.has(x.id));
    });
    edgeList.forEach((ka) => {
      let before, to;
      // Relations are marked only for the node itself, not transitively; symmetric ones in blue
      if (ka.rel) { before = !ka.symmetric && ka.to === id; to = ka.from === id || (ka.symmetric && ka.to === id); }
      else {
        const target = ka.to;
        before = direct ? target === id : (target === id || vf.has(target)) && (ka.from === null || vf.has(ka.from));
        to = direct ? ka.from === id || (ka.from === null && ka.proof.premises.includes(id))
          : nf.has(target) && (ka.from === null || ka.from === id || nf.has(ka.from));
      }
      ka.e.classList.toggle("vorfahr", before && !to);
      ka.e.classList.toggle("nachfahr", !!to);
      ka.e.classList.toggle("blass", !before && !to);
    });
    D.proofs.forEach((b) => b.e.classList.toggle("blass",
      !(b.from === id || (direct ? b.premises.includes(id) : vf.has(b.from) || nf.has(b.from)))));
    return { vf, nf };
  }
  function unmark() {
    D.nodes.forEach((x) => x.g.classList.remove("aktiv", "blass"));
    edgeList.forEach((ka) => ka.e.classList.remove("vorfahr", "nachfahr", "blass"));
    D.proofs.forEach((b) => b.e.classList.remove("blass"));
  }

  function conceptsOfStatement(id) {
    const BG = window.AR_CONCEPTS, list = BG && BG.theoremConcepts[id];
    if (!list || !list.length) return "";
    const name = {}; BG.concepts.forEach((b) => (name[b.id] = b.name));
    return `<h3>${U("Begriffe in der Aussage")}</h3>${list.map((b) => `<a class="chip" href="begriffe.html#${b}">${name[b]}</a>`).join("")}`;
  }
  const KIND = { vermutet: "vermutet", bewiesen: "bewiesen", bedingt: "bedingt bewiesen", verallgemeinert: "verallgemeinert",
    uebertragen: "übertragen", beansprucht: "Beweis beansprucht", einwand: "Einwand", widerlegt: "widerlegt", zurueckgezogen: "zurückgezogen" };
  Object.keys(KIND).forEach((a) => (KIND[a] = U(KIND[a])));
  function historyOf(id) {
    const e = D.history.filter((h) => h.from === id).sort((a, b) => a.year - b.year);
    if (!e.length) return "";
    return `<h3>${U("Geschichte")}</h3>` + e.map((h) => `<div class="beweis"><b>${h.circa ? U("ca. ") : ""}${h.year} · ${KIND[h.kind]}</b> · ${h.person.join(", ")}<br>
      <span class="klein">${h.text}${h.proof ? " " + FM("(Beweis „{0}“)", h.proof) : ""}</span></div>`).join("") +
      `<p class="klein">${U("Jahreszahlen noch nicht an Quellen geprüft.")}</p>`;
  }
  function relationsOf(id) {
    const k = K[id], parts = [];
    const list = (title, arr, who) => { if (arr.length) parts.push(`<h3>${U(title)}</h3>` + arr.map((z) =>
      `<div class="beweis">${chip(who(z))}${z.evidence ? ` <span class="klein">(${z.evidence})</span>` : ""}<br><span class="klein">${z.text}</span></div>`).join("")); };
    list("Teilresultate", k.rel.filter((z) => z.kind === "teilresultat" && z.to === id), (z) => z.from);
    list("Teilresultat zu", k.rel.filter((z) => z.kind === "teilresultat" && z.from === id), (z) => z.to);
    list("Bewiesen gleichwertig mit", k.rel.filter((z) => z.kind === "aequivalent"), (z) => (z.from === id ? z.to : z.from));
    list("Analogie", k.rel.filter((z) => z.kind === "analogie"), (z) => (z.from === id ? z.to : z.from));
    list("Setzt für die Formulierung voraus", k.rel.filter((z) => z.kind === "formulierung" && z.to === id), (z) => z.from);
    list("Wird für die Formulierung gebraucht von", k.rel.filter((z) => z.kind === "formulierung" && z.from === id), (z) => z.to);
    parts.push(GL.disprovedHtml(k, chip));
    return parts.join("");
  }
  function show(id) {
    selected = id;
    const k = K[id], { vf, nf } = mark(id, false);
    const bw = k.proofs.map((b, i) => {
      const conj = b.premises.filter(isConj);
      return `<div class="beweis${b.kind === "bedingt" ? " bedingt" : ""}"><b>${k.proofs.length > 1 ? FM("Beweis {0}: ", "ABCDE"[i]) : U("Beweis: ")}${b.name}</b>
        ${b.kind === "bedingt" ? `<br><span class="marke">${FM("bedingt: setzt {0} voraus", conj.map((p) => K[p].name).join(U(" und ")))}</span>` : ""}<br>
        ${U("Voraussetzungen:")} ${b.premises.map(chip).join("")}<br><span class="klein">${b.idea}</span>${GL.methodsHtml(b, window.AR.methods)}</div>${GL.aiHtml(b)}`;
    }).join("");
    const usersU = [...new Set(k.users.filter((b) => b.kind === "beweis").map((b) => b.from))];
    const usersB = [...new Set(k.users.filter((b) => b.kind === "bedingt").map((b) => b.from))];
    const usersAI = [...new Set(k.users.filter((b) => b.kind === "beansprucht").map((b) => b.from))];
    const jt = GL.yearText(k, D.history);
    const head = k.type === "grundlage" ? U("Grundlage außerhalb des Graphen")
      : k.type === "vermutung" ? `${U("Vermutung")} · <b style="color:${STATE_COLOR[k.state]}">${D.statuses[k.state]}</b> · ${D.areas[k.area]}`
      : `${GL.isCounterexample(k) ? `<b style="color:${GL.GB_COLOR}">${U("Gegenbeispiel")}</b>` : U("Satz")} · ${D.areas[k.area]}${jt ? " · " + jt : ""} · ${FM("logische Tiefe {0}", depth[id])}`;
    panel.innerHTML = `<h2>${k.name}</h2>
      <div class="klein">${head}</div><div class="klein">${ARS.mscText(k)}</div>
      ${GL.statementHtml(k)}
      ${D.highlights[id] ? `<div class="hervor" style="border-color:${HIGHLIGHT[D.highlights[id].kind]}"><b>${GLYPH[D.highlights[id].kind]} ${D.highlightKinds[D.highlights[id].kind]}.</b> ${D.highlights[id].reason}</div>` : ""}
      <p>${k.text}</p>${GL.classificationHtml(k)}
      ${k.type === "vermutung" ? `<p class="klein">${FM("Stand „{0}“: {1}", D.statuses[k.state], D.stateText[k.state])}</p>` : ""}
      ${ARS.refs(k)}
      ${historyOf(id)}
      ${conceptsOfStatement(id)}
      ${VF.info("s:" + id)}
      ${bw ? `<h3>${U("Beweise")}</h3>${bw}` : k.type === "vermutung" ? `<h3>${U("Beweise")}</h3><p class="klein">${U("Kein Beweis bekannt.")}</p>` : ""}
      ${relationsOf(id)}
      ${usersU.length ? `<h3>${U("Direkt gebraucht in Beweisen für")}</h3>${usersU.map(chip).join("")}` : ""}
      ${usersB.length ? `<h3>${U("Direkt gebraucht in bedingten Beweisen für")}</h3>${usersB.map(chip).join("")}` : ""}
      ${usersAI.length ? `<h3>${U("Direkt gebraucht in beanspruchten KI-Beweisen für")}</h3>${usersAI.map(chip).join("")}` : ""}
      <h3>${U("Hängt insgesamt ab von")}</h3><p class="klein">${FM(KI ? "{0} Knoten (braun markiert), auch über bedingte und beanspruchte Beweise" : "{0} Knoten (braun markiert), auch über bedingte Beweise", vf.size)}</p>
      <h3>${U("Insgesamt gebraucht für")}</h3><p class="klein">${FM("{0} Knoten (blau markiert)", nf.size)}</p>
      <p><a class="chip" href="bipartit.html${address(withC, id)}">${U("In der Ansicht Begriffe und Sätze")}</a> <span class="chip" id="zurueck">${U("Zur Übersicht")}</span></p>`;
    document.getElementById("zurueck").addEventListener("click", (e) => { e.stopPropagation(); reset(); });
  }
  function reset() { selected = null; unmark(); overview(); }
  overview();
  if (K[uiState.k]) show(uiState.k);
  // Changing the switcher reloads the page; otherwise only show the selected node
  window.addEventListener("hashchange", () => { const z = read(); if (z.withC !== withC || z.ki !== KI) location.reload(); else if (K[z.k]) show(z.k); });
  // Filter by comprehensibility of the statement (../Beispiel Algebraische
  // Geometrie/verstaendlichkeit-filter.js)
  VF.an({ name: "AR", svg, nodes: () => D.nodes.map((k) => ["s:" + k.id, k.g]),
    edges: () => edgeList.map((ka) => [ka.e, ka.from && "s:" + ka.from, "s:" + ka.to]).concat(D.proofs.map((b) => [b.e, null, "s:" + b.from])) });
})();
