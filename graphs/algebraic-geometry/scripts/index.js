(function () {
  "use strict";
  // Language (translations/sprache.js): U translates a user-interface text, FM fills a translated pattern with {0}, {1}
  // …
  const I18 = window.I18N, U = (s) => (I18 ? I18.t(s) : s);
  const FM = (pattern, ...a) => U(pattern).replace(/\{(\d)\}/g, (m, i) => a[i]);
  // ------------------------------------------------------------ State from the address
  // Older form „#id“ (one theorem) or „#vermutungen=1&k=id“. Without conjectures the graph is exactly the
  // previous one.
  const raw = decodeURIComponent(location.hash.slice(1));
  const P = new URLSearchParams(raw.includes("=") ? raw : raw ? "k=" + raw : "");
  const anchorNode = window.AG.nodes.find((k) => k.id === P.get("k"));
  // AI proofs (ki=1) switch the conjectures on, because their targets are conjectures
  const KI = P.get("ki") === "1" || GL.isAI(anchorNode);
  const WITH_C = P.get("vermutungen") === "1" || GL.isConjecture(anchorNode) || KI;
  const AGK = GL.aiFilter(window.AG, KI);
  const D = WITH_C ? AGK : GL.withoutConjectures(AGK), { el, tex, COLOR, DARK, textLines, EDGE, STATE_SHORT, STATE_COLOR } = GL;
  const HIGHLIGHT = { staunen: "#c2410c", zusammenhang: "#7c3aed", verstehen: "#0f766e", grundlegend: "#1f2937" };
  const GLYPH = { staunen: "★", zusammenhang: "◆", verstehen: "●", grundlegend: "■" };
  const K = {}; D.nodes.forEach((k) => (K[k.id] = Object.assign(k, { proofs: [], users: [], rel: [] })));
  D.proofs.forEach((b, i) => { b.nr = i; K[b.from].proofs.push(b); b.premises.forEach((p) => K[p].users.push(b)); });
  (D.relations || []).forEach((z) => { K[z.from].rel.push(z); K[z.to].rel.push(z); });
  const isConj = (id) => GL.isConjecture(K[id]);

  // ------------------------------------------------------------ logical depth (min over proofs, max over premises)
  // Only ordinary proofs count; conjectures have no logical depth (Infinity).
  const depth = {};
  const t = (id, stack = new Set()) => {
    if (id in depth) return depth[id];
    const k = K[id];
    if (k.type === "grundlage") return (depth[id] = 0);
    stack.add(id);
    let best = Infinity;
    k.proofs.forEach((b) => { if (b.kind === "bedingt" || b.kind === "beansprucht" || b.premises.some((p) => stack.has(p))) return;
      best = Math.min(best, 1 + Math.max(...b.premises.map((p) => t(p, stack)))); });
    stack.delete(id);
    return (depth[id] = best);
  };
  D.nodes.forEach((k) => t(k.id));
  // Column: logical depth; conjectures in their own columns to the right of it (for the level see
  // GL.conjectureLevels)
  const maxT = Math.max(...D.nodes.filter((k) => !isConj(k.id)).map((k) => depth[k.id]));
  const level = WITH_C ? GL.conjectureLevels(K, D.relations) : {};
  // With AI proofs the claimed statements stand in their own columns before the other conjectures (GL.aiColumns)
  const KS = GL.aiColumns(K, level, maxT);
  const column = (id) => (isConj(id) ? KS.column(id) : depth[id]);

  // ------------------------------------------------------------ Ancestors and descendants (also via conditional
  // proofs)
  const ancestors = (id, s = new Set()) => { K[id].proofs.forEach((b) => b.premises.forEach((p) => { if (!s.has(p)) { s.add(p); ancestors(p, s); } })); return s; };
  const descendants = (id, s = new Set()) => { K[id].users.forEach((b) => { if (!s.has(b.from)) { s.add(b.from); descendants(b.from, s); } }); return s; };
  const partner = (id) => new Set(K[id].rel.map((z) => (z.from === id ? z.to : z.from)));

  // ------------------------------------------------------------ Layout (layered, with waypoints for long edges)
  // Column of a theorem = logical depth. An edge leads from a premise to the theorem that the proof shows; its end
  // lies at the proof point. The layout itself is in graph.js (GL.layers).
  // Backward edges (premise in the same or a later column) arise from proofs that are not the
  // shortest ones and from conditional proofs of proven theorems. They do not enter the layout and are
  // drawn dashed. Partial results and hypotheses of the formulation lead to the right to the conjectures and
  // enter the layout; equivalences and analogies are drawn as arcs between the boxes.
  const SP = 240, BW = 156, BH = 44, GAP_N = 18, GAP_W = 7, MARGIN = 34, HEAD = 30;
  const allEdges = D.proofs.flatMap((b) => b.premises.map((p) => ({ from: p, to: b.from, proof: b, kind: b.kind || "beweis" })));
  const relEdges = (D.relations || []).filter((z) => z.kind === "teilresultat" || z.kind === "formulierung" || z.kind === "widerlegt" || z.kind === "deutung")
    .map((z) => ({ from: z.from, to: z.to, rel: z, kind: z.kind }));
  const backEdges = allEdges.filter((ka) => column(ka.from) >= column(ka.to));
  const across = (D.relations || []).filter((z) => z.kind === "aequivalent" || z.kind === "analogie");
  const { columns, item, chains, maxH } = GL.layers(D.nodes.map((k) => k.id), column,
    allEdges.concat(relEdges).filter((ka) => column(ka.from) < column(ka.to)), { BH, GAP_N, GAP_W, MARGIN, HEAD });
  const xCol = (c) => MARGIN + c * SP;
  const xy = (id) => [xCol(item[id].c), item[id].y];
  const B = MARGIN * 2 + (columns.length - 1) * SP + BW + (WITH_C ? 80 : 0), H = MARGIN * 2 + HEAD + maxH;
  const svg = document.getElementById("graph");
  svg.setAttribute("aria-label", U("Beweisgraph"));
  svg.setAttribute("viewBox", `0 0 ${B} ${H}`); svg.setAttribute("width", B); svg.setAttribute("height", H);
  const defs = el("defs", {}, svg);
  const marker = (id, color, start) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="${start ? "auto-start-reverse" : "auto"}"><path d="M0,0L10,5L0,10Z" fill="${color}"/></marker>`;
  defs.innerHTML = marker("pfeil", "#4a4237") + (WITH_C ? marker("pfeil-bedingt", EDGE.bedingt.color) + marker("pfeil-teilresultat", EDGE.teilresultat.color) +
    marker("pfeil-formulierung", EDGE.formulierung.color) + marker("pfeil-aequivalent", EDGE.aequivalent.color, true) +
    marker("pfeil-widerlegt", EDGE.widerlegt.color) + marker("pfeil-deutung", EDGE.deutung.color) : "") + (KI ? GL.aiMarker("pfeil-ki") : "");
  const backG = el("g", {}, svg), edges = el("g", {}, svg), points = el("g", {}, svg), nodesG = el("g", {}, svg);
  // With conjectures: dividing line and shaded area for the columns of the conjectures
  if (WITH_C) {
    const xSep = xCol(maxT + 1) - (SP - BW) / 2;
    el("rect", { x: xSep, y: 0, width: B - xSep, height: H, fill: "#f3efe6" }, backG);
    el("line", { x1: xSep, y1: MARGIN - 14, x2: xSep, y2: H - MARGIN / 2, stroke: "#b9ad9a", "stroke-width": 1.5, "stroke-dasharray": "3 4" }, backG);
  }
  columns.forEach((s, c) => {
    const tx = el("text", { x: xCol(c) + BW / 2, y: MARGIN + 4, "text-anchor": "middle", "font-size": 12, fill: "#6d655a" }, svg);
    tx.textContent = KS.head(c);
  });
  const title = (e, s) => (el("title", {}, e).textContent = s);

  // Proof points to the left in front of the theorem
  D.proofs.forEach((b) => {
    const [zx, zy] = xy(b.from), alt = K[b.from].proofs.length, i = K[b.from].proofs.indexOf(b);
    b.p = [zx - 34, zy + BH / 2 + (i - (alt - 1) / 2) * 12];
  });
  // Distribute the entry points of relation edges along the left edge of the conjecture
  const inbound = {}, numerator = {};
  chains.forEach(({ edge: k }) => { if (k.rel) inbound[k.to] = (inbound[k.to] || 0) + 1; });
  // Edges: horizontal through intermediate columns, curved between the columns; light at the start, dark at
  // the end
  const edgeList = [];
  chains.forEach(({ edge: k, chain }, n) => {
    if (k.proof) {
      const [px, py] = k.proof.p, isCond = k.kind === "bedingt", ks = GL.aiStyle(k.proof);
      const stroke = ks ? ks.color : isCond ? EDGE.bedingt.color : GL.gradient(defs, "verlauf" + n, DARK[K[k.from].area], xCol(item[k.from].c) + BW, px);
      const e = el("path", Object.assign({ d: GL.path(chain, px, py, xCol, BW, BH), class: "kante" + (isCond ? " bedingt" : "") + (ks ? " ki" : ""), stroke }, ks ? { style: `stroke-dasharray:${ks.stroke || "none"}` } : {}), edges);
      title(e, ks ? FM("{0} → {1} (KI-Beweis, {2}, Beweis „{3}“)", K[k.from].name, K[k.proof.from].name, U(k.proof.ki.verification), k.proof.name)
        : FM(isCond ? "{0} → {1} (bedingter Beweis „{2}“)" : "{0} → {1} (Beweis „{2}“)", K[k.from].name, K[k.proof.from].name, k.proof.name));
      edgeList.push({ e, from: k.from, to: k.to, proof: k.proof });
    } else {
      const z = item[k.to], i = (numerator[k.to] = (numerator[k.to] || 0) + 1) - 1, m = inbound[k.to];
      const zx = xCol(z.c) - 2, zy = z.y + 8 + (m > 1 ? (i / (m - 1)) * (BH - 16) : BH / 2 - 8);
      const e = el("path", { d: GL.path(chain, zx, zy, xCol, BW, BH), class: "kante bez " + k.kind, stroke: EDGE[k.kind].color, "marker-end": `url(#pfeil-${k.kind})` }, edges);
      title(e, `${K[k.from].name} → ${K[k.to].name} (${EDGE[k.kind].name})`);
      edgeList.push({ e, from: k.from, to: k.to, rel: k.rel });
    }
  });
  // Backward edges: from the left edge of the premise in an arc that enters the proof point from the left
  // Without a gradient, so that the long dashed arc is visible at its start as well
  backEdges.forEach((k) => {
    const [px, py] = k.proof.p, [sx, sy0] = xy(k.from), sy = sy0 + BH / 2, isCond = k.kind === "bedingt";
    const hubNode = isCond ? Math.max(70, Math.abs(sx - px) * 0.18) : 70;
    const e = el("path", { d: `M${sx},${sy}C${sx - hubNode},${sy} ${px - 70},${py} ${px},${py}`, class: "kante rueck" + (isCond ? " bedingt" : ""), stroke: isCond ? EDGE.bedingt.color : DARK[K[k.from].area] }, edges);
    title(e, FM(isCond ? "{0} → {1} (bedingter Beweis „{2}“, rückwärts)" : "{0} → {1} (Beweis „{2}“, rückwärts: nicht der kürzeste Beweis)",
      K[k.from].name, K[k.proof.from].name, k.proof.name));
    edgeList.push({ e, from: k.from, to: k.to, proof: k.proof });
  });
  // Equivalences and analogies: arc between the boxes
  across.forEach((z) => {
    const [ax, ay0] = xy(z.from), [bx, by0] = xy(z.to), ay = ay0 + BH / 2, by = by0 + BH / 2;
    let d;
    if (ax === bx) { const w = 50 + Math.abs(ay - by) * 0.08; d = `M${ax + BW},${ay}C${ax + BW + w},${ay} ${bx + BW + w},${by} ${bx + BW},${by}`; }
    else { const [lx, ly, rx, ry] = ax < bx ? [ax + BW, ay, bx, by] : [bx + BW, by, ax, ay]; d = `M${lx},${ly}` + GL.arc(lx, ly, rx, ry); }
    const at = { d, class: "kante bez " + z.kind, stroke: EDGE[z.kind].color };
    if (z.kind === "aequivalent") { at["marker-end"] = "url(#pfeil-aequivalent)"; at["marker-start"] = "url(#pfeil-aequivalent)"; }
    const e = el("path", at, edges);
    title(e, `${K[z.from].name} ${z.kind === "aequivalent" ? "⇔" : "~"} ${K[z.to].name} (${EDGE[z.kind].name})`);
    edgeList.push({ e, from: z.from, to: z.to, rel: z, symmetric: true });
  });
  D.proofs.forEach((b) => {
    const [zx, zy] = xy(b.from), [px, py] = b.p, alt = K[b.from].proofs.length, isCond = b.kind === "bedingt", ks = GL.aiStyle(b);
    edgeList.push({ e: el("path", { d: `M${px},${py}L${zx - 2},${zy + BH / 2}`, class: "kante ziel" + (ks ? " zielKI" : isCond ? " zielB" : ""), "marker-end": ks ? "url(#pfeil-ki)" : isCond ? "url(#pfeil-bedingt)" : "url(#pfeil)" }, edges), from: null, to: b.from, proof: b });
    const color = ks ? ks.color : isCond ? EDGE.bedingt.color : "#4a4237";
    b.e = el("circle", { cx: px, cy: py, r: 4.5, fill: alt > 1 ? "#fff" : color, stroke: color, "stroke-width": 1.5, class: "punkt" }, points);
    title(b.e, FM(ks ? (b.kind === "beansprucht" ? "Beanspruchter KI-Beweis „{0}“ für {1}" : "Beweis mit KI-Hilfe „{0}“ für {1}")
      : isCond ? "Bedingter Beweis „{0}“ für {1}" : "Beweis „{0}“ für {1}", b.name, K[b.from].name));
    if (ks) GL.aiBadge(points, px, py);
  });

  // Nodes
  let selected = null;
  D.nodes.forEach((k) => {
    const gb = GL.isCounterexample(k);
    const [x, y] = xy(k.id), v = isConj(k.id), g = el("g", { class: "knoten" + (v ? " vermutung" : "") + (gb ? " gegenbeispiel" : ""), tabindex: 0 }, nodesG);
    const r = el("rect", { x, y, width: BW, height: BH, rx: v ? 9 : 4, fill: COLOR[k.area] }, g);
    if (v) { r.setAttribute("class", "kasten"); r.setAttribute("style", `--rand:${k.state === "beansprucht" ? GL.AI_COLOR : DARK[k.area]}`); }
    if (gb) { GL.gbPattern(defs); GL.gbBox(g, x, y, BW, BH); }
    // Two-colored border for several MSC main fields: the first field on the left, the second on
    // the right
    if (k.field && k.field.length > 1) {
      const gid = "gebiet_" + k.id, lg = el("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1: x, y1: 0, x2: x + BW, y2: 0 }, defs);
      const [fa, fb] = k.field.map((n) => GL.MSC[n].color);
      [[0, fa], [0.5, fa], [0.5, fb], [1, fb]].forEach(([o, f]) => el("stop", { offset: o, "stop-color": f }, lg));
      el("rect", { x: x + 1.75, y: y + 1.75, width: BW - 3.5, height: BH - 3.5, rx: v ? 8 : 3, fill: "none", style: `stroke:url(#${gid});stroke-width:3.5${v ? ";stroke-dasharray:6 3" : ""}` }, g);
    }
    const z = textLines(k.name);
    z.forEach((s, i) => { const tx = el("text", { x: x + 7, y: y + (z.length === 1 ? 20 : 16) + i * 15, "font-size": 12.5, "font-weight": 600 }, g); tx.textContent = s; });
    // Bottom right: year of a theorem or status of a conjecture
    const jt = v ? STATE_SHORT[k.state] : GL.yearText(k, D.history);
    if (jt) { const tj = el("text", { x: x + BW - 6, y: y + BH - 6, "font-size": 11, "text-anchor": "end", fill: v ? STATE_COLOR[k.state] : "#6d655a" }, g); if (v) tj.setAttribute("font-style", "italic"); tj.textContent = jt; }
    const hv = D.highlights[k.id];
    if (hv) {
      g.classList.add("besonders");
      el("rect", { x: x - 3, y: y - 3, width: BW + 6, height: BH + 6, rx: v ? 11 : 6, fill: "none", stroke: HIGHLIGHT[hv.kind], "stroke-width": 2.4 }, g);
      el("circle", { cx: x + BW, cy: y, r: 9, fill: HIGHLIGHT[hv.kind] }, g);
      const z2 = el("text", { x: x + BW, y: y + 4, "text-anchor": "middle", "font-size": 11, fill: "#fff" }, g);
      z2.textContent = GLYPH[hv.kind];
    }
    k.g = g;
    GL.hover(g, k, D.history);   // hover box with the same three lines as the map (todo B26)
    g.addEventListener("click", () => show(k.id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter") show(k.id); });
    g.addEventListener("mouseenter", () => { if (!selected) mark(k.id, true); });
    g.addEventListener("mouseleave", () => { if (!selected) unmark(); });
  });

  // ------------------------------------------------------------ Legend and node points
  // Edge kinds of the conjectures that occur in the data
  const KINDS_C = ["bedingt", "teilresultat", "aequivalent", "analogie", "formulierung", "widerlegt", "deutung"].filter((a) =>
    a === "bedingt" ? D.proofs.some((b) => b.kind === "bedingt") : D.relations.some((z) => z.kind === a));
  document.getElementById("legende").innerHTML =
    `<label class="umschalter" title="${U("Vermutungen, bedingte Beweise und Beziehungen zeigen")}"><input type="checkbox" id="mitV" ${WITH_C ? "checked" : ""}> ${U("mit Vermutungen")}</label>` +
    `<label class="umschalter ki" title="${U("Beweise, die ganz oder wesentlich von einem Sprachmodell stammen; schaltet die Vermutungen mit ein")}"><input type="checkbox" id="mitKI" ${KI ? "checked" : ""}> ${U("KI-Beweise")}</label>` +
    (KI ? GL.aiLegend(D.proofs) : "") +
    (D.nodes.some(GL.isCounterexample) ? GL.gbLegend() : "") +
    (WITH_C ? `<span><i style="background:#fff"></i>${U("Satz")}</span><span><i class="vkasten" style="background:#fff"></i>${U("Vermutung (unten rechts ihr Stand)")}</span>` +
      ["beweis"].concat(KINDS_C).map((a) => `<label title="${EDGE[a].text}">${a === "beweis" ? "" : `<input type="checkbox" data-art="${a}" checked> `}${GL.pattern(a)} ${EDGE[a].name}</label>`).join("") : "") +
    `<span class="trenner"></span>` + Object.entries(D.areas)
    .map(([k, v]) => `<span><i style="background:${COLOR[k]}"></i>${v}</span>`).join("") +
    `<span class="trenner"></span>` + Object.entries(D.highlightKinds)
    .map(([k, v]) => `<span><b style="color:${HIGHLIGHT[k]}">${GLYPH[k]}</b> ${v}</span>`).join("") +
    `<label class="filter"><input type="checkbox" id="nurBesondere"> ${U("nur hervorgehobene Sätze betonen")}</label>` +
    `<span class="trenner"></span>` + legendFields();
  // Main fields that occur in the data, with the number of theorems that name them
  function legendFields() {
    const theorems = D.nodes.filter((k) => k.type === "satz"), num = {};
    D.nodes.forEach((k) => (k.field || []).forEach((n) => (num[n] = (num[n] || 0) + (k.type === "satz" ? 1 : 0))));
    const multiple = theorems.filter((k) => k.field && k.field.length > 1).length;
    return `<span class="titel">${U("Hauptgebiete (MSC):")}</span>` + Object.keys(num).map(Number).sort((a, b) => a - b)
      .map((n) => `<span><i class="ring" style="border-color:${GL.MSC[n].color}"></i>${GL.mscNumber(n)} ${GL.MSC[n].name} (${num[n] || U("nur Grundlagen")})</span>`).join("") +
      `<span class="klein">${FM("Zweifarbiger Rand: zwei Hauptgebiete, links das erste, rechts das zweite ({0} Sätze).", multiple)}</span>`;
  }
  document.getElementById("nurBesondere").addEventListener("change", (e) => document.body.classList.toggle("nur-besondere", e.target.checked));
  document.querySelectorAll("#legende input[data-art]").forEach((c) => c.addEventListener("change", () =>
    document.body.classList.toggle("ohne-" + c.dataset.art, !c.checked)));
  // Switch: write the state into the address and rebuild the page
  document.getElementById("mitV").addEventListener("change", (e) => {
    const p = new URLSearchParams();
    if (e.target.checked) p.set("vermutungen", "1");
    if (e.target.checked && KI) p.set("ki", "1");
    if (selected && (e.target.checked || !isConj(selected))) p.set("k", selected);
    location.hash = p.toString();
    location.reload();
  });
  // AI proofs: on also switches the conjectures on; off leaves them switched on
  document.getElementById("mitKI").addEventListener("change", (e) => {
    const p = new URLSearchParams({ vermutungen: "1" });
    if (e.target.checked) p.set("ki", "1");
    if (selected && (e.target.checked || !GL.isAI(K[selected]))) p.set("k", selected);
    location.hash = p.toString();
    location.reload();
  });

  const chip = (id) => `<span class="chip${isConj(id) ? " vchip" : GL.isCounterexample(K[id]) ? " gbchip" : ""}" data-id="${id}">${K[id].name}</span>`;
  const panel = document.getElementById("panel");
  panel.addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c && c.dataset.id) show(c.dataset.id); });
  // Number of theorems that depend on a node (conjectures are not counted)
  const followingTheorems = (id) => [...descendants(id)].filter((x) => !isConj(x)).length;

  function overview() {
    const rank = D.nodes.filter((k) => k.type === "satz").map((k) => ({ k, n: followingTheorems(k.id) }))
      .sort((a, b) => b.n - a.n).slice(0, 10);
    const groups = Object.entries(D.highlightKinds).map(([kind, title]) => {
      const ids = Object.keys(D.highlights).filter((id) => D.highlights[id].kind === kind);
      return `<h3><span style="color:${HIGHLIGHT[kind]}">${GLYPH[kind]}</span> ${title}</h3>${ids.map(chip).join("")}`;
    }).join("");
    const nRel = (a) => D.relations.filter((z) => z.kind === a).length;
    const conjectures = WITH_C ? `<h2>${U("Vermutungen")}</h2>
      <p class="klein">${FM("{0} Vermutungen, {1} bedingte Beweise, {2} Teilresultate, {3} Analogien, {4} Äquivalenzen und {5} Voraussetzungen der Formulierung. Weitere Vermutungen mit Anschluss an Sätze des großen Graphen stehen in der Ansicht „Großer Graph“.",
        D.nodes.filter((k) => isConj(k.id)).length, D.proofs.filter((b) => b.kind === "bedingt").length,
        nRel("teilresultat"), nRel("analogie"), nRel("aequivalent"), nRel("formulierung"))}</p>
      ${GL.conjecturesByStatus(D, chip)}
      <h3>${U("Kantenarten")}</h3>
      ${["beweis"].concat(KINDS_C).map((a) => `<p class="klein">${GL.pattern(a)} <b>${EDGE[a].name}.</b> ${EDGE[a].text}</p>`).join("")}
      ${KI ? GL.aiOverview(D, chip) : ""}
      <div style="margin-top:22px"></div>` : "";
    panel.innerHTML = `${conjectures}<h2>${U("Besondere Sätze")}</h2>
      <p class="klein">${U("Redaktionelle Einschätzung nach dem Leitgedanken des Projekts, keine Messung. Ein Klick zeigt die Begründung.")}</p>
      ${groups}
      <h2 style="margin-top:22px">${U("Knotenpunkte")}</h2>
      <p class="klein">${U("Zwischenergebnisse, von denen die meisten anderen Sätze dieses Graphen abhängen (über irgendeinen Beweis).")}</p>
      <ol class="rang">${rank.map((r) => `<li>${chip(r.k.id)} ${FM("{0} Sätze", r.n)}</li>`).join("")}</ol>
      <h3>${U("Lesart")}</h3>
      <p class="klein">${U("Ausgefüllter Punkt: einziger bekannter Beweis in diesem Graphen. Hohler Punkt: einer von mehreren Beweisen. Die logische Tiefe bezieht sich nur auf diesen Graphen und hängt davon ab, wie fein er unterteilt ist.")}</p>`;
  }

  function mark(id, direct) {
    // direct: only the immediate edges (on mouse hover); otherwise all ancestors and descendants (on click)
    const vf = direct ? new Set(K[id].proofs.flatMap((b) => b.premises)) : ancestors(id);
    const nf = direct ? new Set(K[id].users.map((b) => b.from)) : descendants(id);
    const pa = partner(id);
    D.nodes.forEach((x) => {
      x.g.classList.toggle("aktiv", x.id === id);
      x.g.classList.toggle("blass", x.id !== id && !vf.has(x.id) && !nf.has(x.id) && !pa.has(x.id));
    });
    edgeList.forEach((ka) => {
      let isBefore, isAfter;
      // Relations are marked only for the node itself, not transitively; symmetric ones in blue
      if (ka.rel) { isBefore = !ka.symmetric && ka.to === id; isAfter = ka.from === id || (ka.symmetric && ka.to === id); }
      else {
        const target = ka.proof.from;
        isBefore = direct ? target === id : (target === id || vf.has(target)) && (ka.from === null || vf.has(ka.from));
        isAfter = direct ? ka.from === id || (ka.from === null && ka.proof.premises.includes(id))
          : nf.has(target) && (ka.from === null || ka.from === id || nf.has(ka.from));
      }
      ka.e.classList.toggle("vorfahr", isBefore && !isAfter);
      ka.e.classList.toggle("nachfahr", isAfter);
      ka.e.classList.toggle("blass", !isBefore && !isAfter);
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
  // Concepts that occur in the statement (from begriffe.js), as links into the concept graph
  function conceptsOfStatement(id) {
    const BG = window.AG_CONCEPTS, list = BG && BG.theoremConcepts[id];
    if (!list) return "";
    const name = {}; BG.concepts.forEach((b) => (name[b.id] = b.name));
    return `<h3>${U("Begriffe in der Aussage")}</h3>${list.map((b) => `<a class="chip" href="begriffe.html#${b}">${name[b]}</a>`).join("")}`;
  }
  // Historical events (from D.history), in chronological order
  function historyOfTheorem(id) {
    const e = (D.history || []).filter((h) => h.from === id).sort((a, b) => a.year - b.year);
    if (!e.length && !K[id].originUnclear) return "";
    return `<h3>${U("Geschichte")}</h3>${K[id].originUnclear ? `<p class="klein">${U("Ohne klaren Ursprung.")}</p>` : ""}` +
      e.map((h) => `<div class="beweis"><b>${h.circa ? U("ca. ") : ""}${h.year} · ${GL.EVENT[h.kind]}</b> · ${h.person.join(", ")}<br>
        <span class="klein">${h.text}${h.proof ? FM(" (Beweis „{0}“)", h.proof) : ""}</span></div>`).join("") +
      `<p class="klein">${U("Jahreszahlen noch nicht an Quellen geprüft.")}</p>`;
  }
  function show(id) {
    selected = id;
    const k = K[id], v = isConj(id), { vf, nf } = mark(id, false);
    const bw = k.proofs.map((b, i) => GL.proofHtml(b, k.proofs.length > 1 ? FM("Beweis {0}: ", "ABCDE"[i]) : U("Beweis: "), K, chip) + GL.aiHtml(b)).join("");
    const users = [...new Set(k.users.filter((b) => b.kind !== "bedingt" && b.kind !== "beansprucht").map((b) => b.from))];
    const usersAI = [...new Set(k.users.filter((b) => b.kind === "beansprucht").map((b) => b.from))];
    const usersB = [...new Set(k.users.filter((b) => b.kind === "bedingt").map((b) => b.from))];
    const head = k.type === "grundlage" ? U("Grundlage außerhalb des Graphen")
      : v ? `${U("Vermutung")} · <b style="color:${STATE_COLOR[k.state]}">${D.statuses[k.state]}</b> · ${D.areas[k.area]}`
      : (GL.isCounterexample(k) ? `<b style="color:${GL.GB_COLOR}">${U("Gegenbeispiel")}</b> · ` : "") + D.areas[k.area] + (GL.yearText(k, D.history) ? " · " + GL.yearText(k, D.history) : "") + " · " + FM("logische Tiefe {0}", depth[id]);
    panel.innerHTML = `<h2>${k.name}</h2>
      <div class="klein">${head}</div>
      ${GL.fieldHtml(k)}
      ${GL.statementHtml(k)}
      ${D.highlights[id] ? `<div class="hervor" style="border-color:${HIGHLIGHT[D.highlights[id].kind]}"><b>${GLYPH[D.highlights[id].kind]} ${D.highlightKinds[D.highlights[id].kind]}.</b> ${D.highlights[id].reason}</div>` : ""}
      <p>${k.text}</p>${GL.classificationHtml(k)}
      ${v ? `<p class="klein">${FM("Stand „{0}“: {1}", D.statuses[k.state], D.stateText[k.state])}</p>` : ""}
      ${historyOfTheorem(id)}
      ${conceptsOfStatement(id)}
      ${VF.info("s:" + id)}
      ${bw ? `<h3>${U("Beweise")}</h3>${bw}` : v ? `<h3>${U("Beweise")}</h3><p class="klein">${U("Kein Beweis bekannt.")}</p>` : ""}
      ${GL.relationsHtml(k, chip)}${GL.disprovedHtml(k, chip)}
      ${users.length ? `<h3>${U("Direkt gebraucht für")}</h3>${users.map(chip).join("")}` : ""}
      ${usersB.length ? `<h3>${U("Direkt gebraucht in bedingten Beweisen für")}</h3>${usersB.map(chip).join("")}` : ""}
      ${usersAI.length ? `<h3>${U("Direkt gebraucht in beanspruchten KI-Beweisen für")}</h3>${usersAI.map(chip).join("")}` : ""}
      <h3>${U("Hängt insgesamt ab von")}</h3><p class="klein">${FM(!WITH_C ? "{0} Knoten (braun markiert)" : KI ? "{0} Knoten (braun markiert), auch über bedingte und beanspruchte Beweise" : "{0} Knoten (braun markiert), auch über bedingte Beweise", vf.size)}</p>
      <h3>${U("Insgesamt gebraucht für")}</h3><p class="klein">${FM(WITH_C ? "{0} Knoten (blau markiert)" : "{0} Sätze (blau markiert)", nf.size)}</p>
      <p><span class="chip" id="zurueck">${U("Zur Übersicht")}</span></p>`;
    document.getElementById("zurueck").addEventListener("click", (e) => { e.stopPropagation(); reset(); });
  }
  function reset() {
    selected = null;
    unmark();
    overview();
  }
  overview();
  const anchor = P.get("k");
  if (K[anchor]) show(anchor);
  // Filter by comprehensibility of the statement (verstaendlichkeit-filter.js)
  VF.an({ name: "AG", svg, nodes: () => D.nodes.map((k) => ["s:" + k.id, k.g]),
    edges: () => edgeList.map((ka) => [ka.e, ka.from && "s:" + ka.from, "s:" + ka.to]).concat(D.proofs.map((b) => [b.e, null, "s:" + b.from])) });
})();
