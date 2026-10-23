(function () {
  "use strict";
  // Language (translations/sprache.js): U translates a user-interface text, FM fills a translated pattern with {0}, {1}
  // …
  const I18 = window.I18N, U = (s) => (I18 ? I18.t(s) : s);
  const FM = (pattern, ...a) => U(pattern).replace(/\{(\d)\}/g, (m, i) => a[i]);
  // With or without conjectures (address „vermutungen=1“; a link to a conjecture switches them on).
  // Without conjectures the graph is exactly the previous one.
  // AI proofs (address „ki=1“) switch the conjectures on, because their targets are conjectures.
  const P0 = new URLSearchParams(location.hash.slice(1)), ALL0 = GL.mergeC(window.AG, window.AG_LARGE);
  const KI = P0.get("ki") === "1" || ALL0.nodes.some((k) => k.id === P0.get("k") && GL.isAI(k));
  const ALL = GL.aiFilter(ALL0, KI);
  const WITH_C = KI || P0.get("vermutungen") === "1" || ALL.nodes.some((k) => k.id === P0.get("k") && GL.isConjecture(k));
  const D = WITH_C ? ALL : GL.withoutConjectures(ALL), { el, tex, EDGE, STATE_SHORT, STATE_COLOR } = GL;
  // Colors: the shared ones from graph.js, plus the new areas of this graph
  const COLOR = Object.assign({}, GL.COLOR, { abelsch: "#f5b7b1", moduln: "#a8d8ea", torisch: "#9fd3c7" });
  const DARK = Object.assign({}, GL.DARK, { abelsch: "#b03a2e", moduln: "#1f6f8b", torisch: "#1a7f6e" });
  const HIGHLIGHT = { staunen: "#c2410c", zusammenhang: "#7c3aed", verstehen: "#0f766e", grundlegend: "#1f2937" };
  const GLYPH = { staunen: "★", zusammenhang: "◆", verstehen: "●", grundlegend: "■" };
  // Order of the areas (bands in the layout „Bereiche“, filter)
  const AREAS = ["grundlage", "kommAlg", "schema", "kohom", "kurven", "rr", "abzaehl", "komplex", "abelsch", "moduln",
    "etale", "arith", "biration", "torisch"].filter((b) => D.areas[b]);

  // ------------------------------------------------------------ Graph structure
  const K = {};
  D.nodes.forEach((k) => (K[k.id] = Object.assign(k, { proofs: [], users: [], rel: [] })));
  D.proofs.forEach((b, i) => { b.nr = i; K[b.from].proofs.push(b); b.premises.forEach((p) => K[p].users.push(b)); });
  D.relations.forEach((z) => { K[z.from].rel.push(z); K[z.to].rel.push(z); });
  const isConj = (id) => GL.isConjecture(K[id]);
  // Logical depth only via ordinary proofs; conjectures have none (Infinity) and stand in columns to the right
  const ordinary = D.proofs.filter((b) => b.kind !== "bedingt" && b.kind !== "beansprucht");
  const depth = GL.depths(D.nodes, ordinary);
  const maxT = Math.max(...D.nodes.filter((k) => !isConj(k.id)).map((k) => depth[k.id]));
  const level = WITH_C ? GL.conjectureLevels(K, D.relations) : {};
  // With AI proofs the claimed statements stand in their own columns before the other conjectures (GL.aiColumns)
  const KS = GL.aiColumns(K, level, maxT);
  const column = {}; D.nodes.forEach((k) => (column[k.id] = isConj(k.id) ? KS.column(k.id) : depth[k.id]));
  const ancestors = (id, s = new Set()) => { K[id].proofs.forEach((b) => b.premises.forEach((p) => { if (!s.has(p)) { s.add(p); ancestors(p, s); } })); return s; };
  const descendants = (id, s = new Set()) => { K[id].users.forEach((b) => { if (!s.has(b.from)) { s.add(b.from); descendants(b.from, s); } }); return s; };
  const partner = (id) => new Set(K[id].rel.map((z) => (z.from === id ? z.to : z.from)));
  // Node size: consequences only via ordinary proofs, so that conditional proofs of proven theorems change nothing
  // (claimed AI proofs do not count either)
  const chosenProof = (b) => b.kind !== "bedingt" && b.kind !== "beansprucht";
  const descendantsG = (id, s = new Set()) => { K[id].users.forEach((b) => { if (chosenProof(b) && !s.has(b.from)) { s.add(b.from); descendantsG(b.from, s); } }); return s; };
  const NF = {}, DIRECT = {};
  D.nodes.forEach((k) => { NF[k.id] = descendantsG(k.id).size; DIRECT[k.id] = new Set(k.users.filter(chosenProof).map((b) => b.from)).size; });
  const theorems = D.nodes.filter((k) => k.type === "satz");
  const NMAX = Math.max(...theorems.map((k) => NF[k.id])), DMAX = Math.max(...theorems.map((k) => DIRECT[k.id]));

  // ------------------------------------------------------------ Node size
  const RMIN = 4, RMAX = 34, SQUARE = 16;
  // f(v): radius for a numerical value v; r(id): radius of a theorem
  const region = (max) => (v) => Math.max(RMIN, RMAX * Math.sqrt(v / max));
  const SIZES = {
    transitiv: { name: U("Folgerungen (Fläche)"), f: region(NMAX), r: (id) => region(NMAX)(NF[id]),
      text: U("Die Fläche eines Kreises ist proportional zur Zahl der Sätze, die aus ihm folgen, direkt oder über Zwischenschritte, bei irgendeinem Beweis."), value: NF, max: NMAX, unit: "folgende Sätze" },
    radius: { name: U("Folgerungen (Radius)"), f: (v) => Math.max(RMIN, RMAX * v / NMAX), r: (id) => Math.max(RMIN, RMAX * NF[id] / NMAX),
      text: U("Der Radius eines Kreises ist proportional zur Zahl der Sätze, die aus ihm folgen. Große Werte wirken dadurch viel größer als bei flächentreuer Darstellung."), value: NF, max: NMAX, unit: "folgende Sätze" },
    direkt: { name: U("Direkte Nutzer"), f: region(DMAX), r: (id) => region(DMAX)(DIRECT[id]),
      text: U("Die Fläche eines Kreises ist proportional zur Zahl der Sätze, deren Beweis ihn unmittelbar als Voraussetzung nennt."), value: DIRECT, max: DMAX, unit: "direkte Nutzer" },
    gleich: { name: U("Gleich groß"), r: () => 7, text: U("Alle Sätze sind gleich groß. Die Anordnung allein trägt die Information."), value: null },
  };
  const LAYOUTS = { spalten: U("Spalten nach Tiefe"), bereiche: U("Bänder nach Bereichen"), kraefte: U("Kräfte"), kraefteBereiche: U("Kräfte mit Bereichsgruppen") };

  // ------------------------------------------------------------ State (stored in the address)
  const uiState = { anordnung: "spalten", groesse: "transitiv", k: null, aus: new Set(), mehrere: false, vermutungen: WITH_C, ki: KI };
  (function read() {
    const p = new URLSearchParams(location.hash.slice(1));
    uiState.mehrere = p.get("mehrere") === "1";
    if (LAYOUTS[p.get("anordnung")]) uiState.anordnung = p.get("anordnung");
    if (SIZES[p.get("groesse")]) uiState.groesse = p.get("groesse");
    if (K[p.get("k")]) uiState.k = p.get("k");
    (p.get("aus") || "").split(",").filter((b) => D.areas[b]).forEach((b) => uiState.aus.add(b));
  })();
  function write() {
    const p = new URLSearchParams({ anordnung: uiState.anordnung, groesse: uiState.groesse });
    if (uiState.k) p.set("k", uiState.k);
    if (uiState.aus.size) p.set("aus", [...uiState.aus].join(","));
    if (uiState.mehrere) p.set("mehrere", "1");
    if (uiState.vermutungen) p.set("vermutungen", "1");
    if (uiState.ki) p.set("ki", "1");
    history.replaceState(null, "", "#" + p.toString());
  }
  const visible = (id) => !uiState.aus.has(K[id].area);
  // Conjectures have a fixed size, because nothing proven follows from them
  const R_CONJ = 9;
  const radius = (id) => (K[id].type === "grundlage" ? SQUARE / 2 + 2 : isConj(id) ? R_CONJ : SIZES[uiState.groesse].r(id));

  // ------------------------------------------------------------ Layouts
  // Each layout returns pos[id] = {x, y} (center) and optionally labels (column headers, bands).
  const SP = 230, MARGIN = 60, GAP_X = 12;
  // Forward edges (premise in a column to the left of the conclusion), only between visible nodes. The column is the
  // logical depth, for conjectures the column to the right of it. Partial results and hypotheses of the formulation are
  // included.
  const headText = KS.head;
  function forward(ids) {
    const da = new Set(ids), nb = {};
    ids.forEach((id) => (nb[id] = []));
    D.proofs.forEach((b) => { if (!da.has(b.from)) return; b.premises.forEach((p) => { if (da.has(p) && column[p] < column[b.from]) { nb[p].push(b.from); nb[b.from].push(p); } }); });
    D.relations.forEach((z) => { if ((z.kind === "teilresultat" || z.kind === "formulierung" || z.kind === "widerlegt" || z.kind === "deutung") && da.has(z.from) && da.has(z.to) && column[z.from] < column[z.to]) { nb[z.from].push(z.to); nb[z.to].push(z.from); } });
    return nb;
  }
  function columnOrder(ids) {
    const sp = [];
    ids.forEach((id) => (sp[column[id]] = sp[column[id]] || []).push(id));
    for (let c = 0; c < sp.length; c++) sp[c] = sp[c] || [];
    sp.forEach((s) => s.sort((a, b) => AREAS.indexOf(K[a].area) - AREAS.indexOf(K[b].area) || NF[b] - NF[a]));
    const nb = forward(ids);
    return GL.arrange(sp, (id) => nb[id], 30);
  }
  function layoutColumns(ids) {
    const sp = columnOrder(ids), pos = {}, heads = [];
    const height = sp.map((s) => s.reduce((a, id) => a + 2 * radius(id) + GAP_X, 0));
    const maxH = Math.max(...height);
    sp.forEach((s, c) => {
      let y = MARGIN + 30 + (maxH - height[c]) / 2;
      const x = MARGIN + c * SP;
      s.forEach((id) => { const r = radius(id); pos[id] = { x, y: y + r }; y += 2 * r + GAP_X; });
      if (s.length) heads.push({ x, y: MARGIN, text: headText(c) });
    });
    return { pos, heads, bands: [] };
  }
  function layoutAreas(ids) {
    // Bands by area, within them columns by depth; within a cell the order of the column layout
    const rank = {}; columnOrder(ids).forEach((s) => s.forEach((id, i) => (rank[id] = i)));
    const pos = {}, bands = [], heads = [], LABEL = 210;
    const maxS = Math.max(...ids.map((id) => column[id]));
    let y = MARGIN + 30;
    AREAS.forEach((areasUsed) => {
      const inBand = ids.filter((id) => K[id].area === areasUsed);
      if (!inBand.length) return;
      const cells = {};
      inBand.forEach((id) => (cells[column[id]] = cells[column[id]] || []).push(id));
      const zh = Object.values(cells).map((z) => z.reduce((a, id) => a + 2 * radius(id) + GAP_X, 0));
      const h = Math.max(...zh) + 24;
      Object.entries(cells).forEach(([c, z]) => {
        z.sort((a, b) => rank[a] - rank[b]);
        let yy = y + 12;
        z.forEach((id) => { const r = radius(id); pos[id] = { x: MARGIN + LABEL + c * SP, y: yy + r }; yy += 2 * r + GAP_X; });
      });
      bands.push({ area: areasUsed, y, h, b: LABEL + (maxS + 1) * SP });
      y += h + 10;
    });
    for (let c = 0; c <= maxS; c++) heads.push({ x: MARGIN + LABEL + c * SP, y: MARGIN, text: headText(c) });
    return { pos, heads, bands };
  }
  function layoutForces(ids, grouped) {
    // Initial values: areas on a circle, nodes around them (deterministic). Edges premise – conclusion; edges from
    // foundations count less, because otherwise they pull everything into the center.
    const idx = {}; ids.forEach((id, i) => (idx[id] = i));
    const areasUsed = AREAS.filter((b) => ids.some((id) => K[id].area === b));
    const points = ids.map((id, i) => {
      const w = (2 * Math.PI * areasUsed.indexOf(K[id].area)) / areasUsed.length, z = (i * 2.399963) % (2 * Math.PI);
      return { x: 700 * Math.cos(w) + 90 * Math.cos(z) * (1 + (i % 5)), y: 700 * Math.sin(w) + 90 * Math.sin(z) * (1 + (i % 5)), r: radius(id) };
    });
    const edges = [];
    D.proofs.forEach((b) => { if (!(b.from in idx)) return; b.premises.forEach((p) => { if (p in idx) edges.push([idx[p], idx[b.from], K[p].type === "grundlage" ? 0.12 : 1]); }); });
    D.relations.forEach((z) => { if (z.from in idx && z.to in idx) edges.push([idx[z.from], idx[z.to], 0.6]); });
    GL.kraefte(points, edges, Object.assign({ len: 75, rounds: 450, distance: 8, gravity: 0.035 },
      grouped ? { group: ids.map((id) => K[id].area), groupForce: 0.08 } : {}));
    const pos = {}; ids.forEach((id, i) => (pos[id] = { x: points[i].x, y: points[i].y }));
    return { pos, heads: [], bands: [] };
  }
  // Edge kinds of the conjectures that occur in the data
  const KINDS_C = ["bedingt", "teilresultat", "aequivalent", "analogie", "formulierung", "widerlegt", "deutung"].filter((a) =>
    a === "bedingt" ? D.proofs.some((b) => b.kind === "bedingt") : D.relations.some((z) => z.kind === a));
  const ARRANGE = { spalten: layoutColumns, bereiche: layoutAreas, kraefte: (ids) => layoutForces(ids, false), kraefteBereiche: (ids) => layoutForces(ids, true) };

  // ------------------------------------------------------------ Drawing
  const svg = document.getElementById("graph"), stage = document.getElementById("buehne");
  let view = null, edgeList = [], pos = {}, visibleIds = [], selected = null;
  const defs = el("defs", {}, svg);
  const gmarker = (id, color, start) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="${start ? "auto-start-reverse" : "auto"}"><path d="M0,0L10,5L0,10Z" fill="${color}"/></marker>`;
  defs.innerHTML = gmarker("gpfeil", "#4a4237") + (WITH_C ? gmarker("gpfeil-bedingt", EDGE.bedingt.color) + gmarker("gpfeil-teilresultat", EDGE.teilresultat.color) +
    gmarker("gpfeil-formulierung", EDGE.formulierung.color) + gmarker("gpfeil-aequivalent", EDGE.aequivalent.color, true) +
    gmarker("gpfeil-widerlegt", EDGE.widerlegt.color) + gmarker("gpfeil-deutung", EDGE.deutung.color) : "") + (KI ? GL.aiMarker("gpfeil-ki") : "");
  const world = el("g", {}, svg);

  function draw() {
    world.innerHTML = ""; edgeList = [];
    visibleIds = D.nodes.map((k) => k.id).filter(visible);
    const placement = ARRANGE[uiState.anordnung](visibleIds);
    pos = placement.pos;
    const bandG = el("g", {}, world), edgesG = el("g", {}, world), pointG = el("g", {}, world), nodesG = el("g", {}, world);
    placement.bands.forEach((b) => {
      const g = el("g", { class: "band" }, bandG);
      el("rect", { x: MARGIN - 20, y: b.y, width: b.b + 40, height: b.h, fill: COLOR[b.area] }, g);
      const z = GL.textLines(D.areas[b.area], 24, 3);
      z.forEach((s, i) => { const t = el("text", { x: MARGIN - 8, y: b.y + 22 + i * 18 }, g); t.textContent = s; });
    });
    placement.heads.forEach((kp) => { const t = el("text", { x: kp.x, y: kp.y, "text-anchor": "middle", class: "kopf" }, bandG); t.textContent = kp.text; });

    // Proof points: on the side of the theorem where the centroid of the premises lies
    const r = {}; visibleIds.forEach((id) => (r[id] = radius(id)));
    D.proofs.forEach((b) => {
      b.p = null;
      if (!pos[b.from]) return;
      const pr = b.premises.filter((p) => pos[p]);
      if (!pr.length) return;
      const T = pos[b.from];
      let cx = pr.reduce((a, p) => a + pos[p].x, 0) / pr.length - T.x, cy = pr.reduce((a, p) => a + pos[p].y, 0) / pr.length - T.y;
      let d = Math.hypot(cx, cy);
      if (d < 1) { cx = -1; cy = 0; d = 1; }
      const all = K[b.from].proofs.filter((x) => x.premises.some((p) => pos[p])), i = all.indexOf(b);
      const w = Math.atan2(cy, cx) + (i - (all.length - 1) / 2) * 0.45;
      b.u = [Math.cos(w), Math.sin(w)];
      b.p = [T.x + b.u[0] * (r[b.from] + 16), T.y + b.u[1] * (r[b.from] + 16)];
      b.pr = pr;
    });
    D.proofs.forEach((b) => {
      if (!b.p) return;
      const [bx, by] = b.p, k = 26;
      b.pr.forEach((p) => {
        const P = pos[p], vx = bx - P.x, vy = by - P.y, d = Math.hypot(vx, vy) || 1;
        const sx = P.x + (vx / d) * r[p], sy = P.y + (vy / d) * r[p];
        const c1 = Math.min(k, d / 3);
        const isCond = b.kind === "bedingt", ks = GL.aiStyle(b), back = !isCond && !ks && column[p] >= column[b.from];
        const e = el("path", Object.assign({ d: `M${sx},${sy}Q${bx + b.u[0] * c1 * 2},${by + b.u[1] * c1 * 2} ${bx},${by}`, class: "gkante" + (back ? " rueck" : "") + (isCond ? " bedingt" : "") + (ks ? " ki" : ""), stroke: ks ? ks.color : isCond ? EDGE.bedingt.color : DARK[K[p].area] }, ks ? { style: `stroke-dasharray:${ks.stroke || "none"}` } : {}), edgesG);
        el("title", {}, e).textContent = ks ? FM("{0} → {1} (KI-Beweis, {2}: „{3}“)", K[p].name, K[b.from].name, U(b.ki.verification), b.name)
          : FM(isCond ? "{0} → {1} (bedingter Beweis „{2}“)" : back ? "{0} → {1} (Beweis „{2}“, nicht der kürzeste)" : "{0} → {1} (Beweis „{2}“)", K[p].name, K[b.from].name, b.name);
        edgeList.push({ e, from: p, to: b.from, proof: b });
      });
      const T = pos[b.from], ex = T.x + b.u[0] * (r[b.from] + 1), ey = T.y + b.u[1] * (r[b.from] + 1);
      const isCond = b.kind === "bedingt", ks = GL.aiStyle(b), color = ks ? ks.color : isCond ? EDGE.bedingt.color : "#4a4237";
      edgeList.push({ e: el("path", { d: `M${bx},${by}L${ex},${ey}`, class: "gkante ziel" + (ks ? " zielKI" : isCond ? " zielB" : ""), "marker-end": ks ? "url(#gpfeil-ki)" : isCond ? "url(#gpfeil-bedingt)" : "url(#gpfeil)" }, edgesG), from: null, to: b.from, proof: b });
      const alt = K[b.from].proofs.length;
      b.e = el("circle", { cx: bx, cy: by, r: 3.2, fill: alt > 1 ? "#fff" : color, stroke: color, "stroke-width": 1.2, class: "gpunkt" }, pointG);
      el("title", {}, b.e).textContent = FM(ks ? (b.kind === "beansprucht" ? "Beanspruchter KI-Beweis „{0}“ für {1}" : "Beweis mit KI-Hilfe „{0}“ für {1}")
        : isCond ? "Bedingter Beweis „{0}“ für {1}" : "Beweis „{0}“ für {1}", b.name, K[b.from].name);
      if (ks) GL.aiBadge(pointG, bx, by, 0.8);
    });
    // Relations (only with conjectures): slightly curved line from edge to edge; analogy and equivalence without
    // direction
    D.relations.forEach((z) => {
      if (!pos[z.from] || !pos[z.to]) return;
      const A = pos[z.from], Z = pos[z.to], vx = Z.x - A.x, vy = Z.y - A.y, d = Math.hypot(vx, vy) || 1;
      const sx = A.x + (vx / d) * (r[z.from] + 2), sy = A.y + (vy / d) * (r[z.from] + 2), ex = Z.x - (vx / d) * (r[z.to] + 2), ey = Z.y - (vy / d) * (r[z.to] + 2);
      const mx = (sx + ex) / 2 - (vy / d) * d * 0.12, my = (sy + ey) / 2 + (vx / d) * d * 0.12;
      const sym = z.kind === "aequivalent" || z.kind === "analogie";
      const at = { d: `M${sx},${sy}Q${mx},${my} ${ex},${ey}`, class: "gkante bez " + z.kind, stroke: EDGE[z.kind].color };
      if (z.kind !== "analogie") at["marker-end"] = `url(#gpfeil-${z.kind})`;
      if (z.kind === "aequivalent") at["marker-start"] = "url(#gpfeil-aequivalent)";
      const e = el("path", at, edgesG);
      el("title", {}, e).textContent = `${K[z.from].name} ${sym ? (z.kind === "aequivalent" ? "⇔" : "~") : "→"} ${K[z.to].name} (${EDGE[z.kind].name})`;
      edgeList.push({ e, from: z.from, to: z.to, rel: z, symmetric: sym });
    });

    visibleIds.forEach((id) => {
      const k = K[id], { x, y } = pos[id], g = el("g", { class: "gk", tabindex: 0 }, nodesG);
      if (k.type === "grundlage") el("rect", { x: x - SQUARE / 2, y: y - SQUARE / 2, width: SQUARE, height: SQUARE, rx: 2, fill: COLOR.grundlage }, g);
      else if (isConj(id)) { g.classList.add("verm"); el("circle", { cx: x, cy: y, r: r[id], fill: COLOR[k.area], class: "kreis", style: `--rand:${k.state === "beansprucht" ? GL.AI_COLOR : DARK[k.area]}` }, g); }
      else if (GL.isCounterexample(k)) GL.gbDiamond(g, x, y, Math.max(r[id], 8) * 1.3, COLOR[k.area]);
      else el("circle", { cx: x, cy: y, r: r[id], fill: COLOR[k.area] }, g);
      const hv = D.highlights[id];
      if (hv) el("circle", { cx: x, cy: y, r: r[id] + 3, fill: "none", stroke: HIGHLIGHT[hv.kind], "stroke-width": 1.8 }, g);
      // Two-colored ring for several MSC main fields: left half the first field, right half the second
      if (k.field && k.field.length > 1) {
        if (k.type === "satz") g.classList.add("mehrere");
        const [fa, fb] = k.field.map((n) => GL.MSC[n].color), w = 3;
        if (k.type === "grundlage") {
          const s = SQUARE / 2 + 3.5;
          el("path", { d: `M${x},${y - s}H${x - s}V${y + s}H${x}`, class: "gring", style: `stroke:${fa};stroke-width:${w}` }, g);
          el("path", { d: `M${x},${y - s}H${x + s}V${y + s}H${x}`, class: "gring", style: `stroke:${fb};stroke-width:${w}` }, g);
        } else {
          const R = r[id] + (hv ? 6.5 : 3);
          el("path", { d: `M${x},${y - R}A${R},${R} 0 0 0 ${x},${y + R}`, class: "gring", style: `stroke:${fa};stroke-width:${w}` }, g);
          el("path", { d: `M${x},${y - R}A${R},${R} 0 0 1 ${x},${y + R}`, class: "gring", style: `stroke:${fb};stroke-width:${w}` }, g);
        }
      }
      const t = el("text", { x: x + r[id] + 4, y: y + 4 }, g); t.textContent = k.name;
      el("title", {}, g).textContent = isConj(id) ? FM("{0}: Vermutung, {1}", k.name, D.statuses[k.state])
        : FM("{0}: {1} folgende Sätze, {2} direkte Nutzer, Tiefe {3}", k.name, NF[id], DIRECT[id], depth[id]);
      k.g = g;
      GL.hover(g, k, D.history);   // hover box with the same three lines as the map (todo B26)
      g.addEventListener("click", (e) => { if (dragged) return; e.stopPropagation(); show(id); });
      g.addEventListener("keydown", (e) => { if (e.key === "Enter") show(id); });
      g.addEventListener("mouseenter", () => { if (!selected) mark(id, true); });
      g.addEventListener("mouseleave", () => { if (!selected) unmark(); });
    });
    D.nodes.forEach((k) => { if (!pos[k.id]) k.g = null; });
    sizeLegend();
    if (!view) fitIn(); else zoomChanged();
    if (selected && pos[selected]) mark(selected, false);
  }

  // ------------------------------------------------------------ Zooming and panning (via the viewBox)
  function setView(v) { view = v; svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`); zoomChanged(); }
  function scaleBar() { return svg.clientWidth / view.w; }
  function fitIn() {
    const ids = visibleIds.filter((id) => pos[id]);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    ids.forEach((id) => { const p = pos[id], r = radius(id); x0 = Math.min(x0, p.x - r); y0 = Math.min(y0, p.y - r - 30); x1 = Math.max(x1, p.x + r + 150); y1 = Math.max(y1, p.y + r); });
    if (uiState.anordnung === "bereiche") x0 = Math.min(x0, MARGIN - 24);
    const W = svg.clientWidth || 1000, H = svg.clientHeight || 700, s = Math.min(W / (x1 - x0 + 40), H / (y1 - y0 + 40));
    const w = W / s, h = H / s;
    setView({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h });
  }
  function zoomTo(f, cx, cy) {
    const v = view, nw = v.w / f, nh = v.h / f;
    if (cx == null) { cx = v.x + v.w / 2; cy = v.y + v.h / 2; }
    setView({ x: cx - (cx - v.x) / f, y: cy - (cy - v.y) / f, w: nw, h: nh });
  }
  function center(id, s) {
    const p = pos[id]; if (!p) return;
    const W = svg.clientWidth, H = svg.clientHeight, m = Math.max(scaleBar(), s || 0);
    setView({ x: p.x - W / m / 2, y: p.y - H / m / 2, w: W / m, h: H / m });
  }
  // Labels always have the same size on screen; they appear when the circle is large enough
  function zoomChanged() {
    const s = scaleBar();
    svg.style.setProperty("--fs", (12.5 / s).toFixed(2) + "px");
    visibleIds.forEach((id) => { const k = K[id]; if (!k.g) return;
      const rr = k.type === "grundlage" ? 12 : radius(id);
      k.g.classList.toggle("stumm", !(rr * s >= 8.5 || s >= 1.25)); });
  }
  const pointInSvg = (e) => { const b = svg.getBoundingClientRect(); return [view.x + (e.clientX - b.left) / b.width * view.w, view.y + (e.clientY - b.top) / b.height * view.h]; };
  svg.addEventListener("wheel", (e) => { e.preventDefault(); const [x, y] = pointInSvg(e); zoomTo(e.deltaY < 0 ? 1.18 : 1 / 1.18, x, y); }, { passive: false });
  let drag = null, dragged = false;
  svg.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, v: Object.assign({}, view) }; dragged = false; });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!dragged && Math.hypot(dx, dy) > 4) { dragged = true; stage.classList.add("ziehen"); }
    if (dragged) { const s = scaleBar(); setView({ x: drag.v.x - dx / s, y: drag.v.y - dy / s, w: drag.v.w, h: drag.v.h }); }
  });
  window.addEventListener("pointerup", () => { drag = null; stage.classList.remove("ziehen"); setTimeout(() => (dragged = false), 0); });
  svg.addEventListener("click", () => { if (!dragged && selected) reset(); });
  document.getElementById("zplus").addEventListener("click", () => zoomTo(1.4));
  document.getElementById("zminus").addEventListener("click", () => zoomTo(1 / 1.4));
  document.getElementById("zalles").addEventListener("click", fitIn);
  window.addEventListener("resize", () => { if (view) zoomChanged(); });

  // ------------------------------------------------------------ Highlighting
  function mark(id, direct) {
    const vf = direct ? new Set(K[id].proofs.flatMap((b) => b.premises)) : ancestors(id);
    const nf = direct ? new Set(K[id].users.map((b) => b.from)) : descendants(id);
    const pa = partner(id);
    visibleIds.forEach((x) => { const g = K[x].g; if (!g) return;
      g.classList.toggle("aktiv", x === id);
      g.classList.toggle("vor", x !== id && vf.has(x));
      g.classList.toggle("nach", x !== id && nf.has(x) && !vf.has(x));
      g.classList.toggle("blass", x !== id && !vf.has(x) && !nf.has(x) && !pa.has(x)); });
    edgeList.forEach((ka) => {
      let isBefore, isAfter;
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
    D.proofs.forEach((b) => { if (b.e && b.p) b.e.classList.toggle("blass",
      !(b.from === id || (direct ? b.premises.includes(id) : vf.has(b.from) || nf.has(b.from)))); });
    return { vf, nf };
  }
  function unmark() {
    visibleIds.forEach((x) => K[x].g && K[x].g.classList.remove("aktiv", "vor", "nach", "blass"));
    edgeList.forEach((ka) => ka.e.classList.remove("vorfahr", "nachfahr", "blass"));
    D.proofs.forEach((b) => b.e && b.e.classList.remove("blass"));
  }

  // ------------------------------------------------------------ Info box
  const panel = document.getElementById("panel");
  const chip = (id) => `<span class="chip${isConj(id) ? " vchip" : GL.isCounterexample(K[id]) ? " gbchip" : ""}" data-id="${id}">${K[id].name}</span>`;
  panel.addEventListener("click", (e) => { const c = e.target.closest(".chip[data-id]"); if (c) { show(c.dataset.id); center(c.dataset.id); } });
  const KIND = GL.EVENT;
  function historyOfTheorem(id) {
    const e = D.history.filter((h) => h.from === id).sort((a, b) => a.year - b.year);
    if (!e.length && !K[id].originUnclear) return "";
    return `<h3>${U("Geschichte")}</h3>${K[id].originUnclear ? `<p class="klein">${U("Ohne klaren Ursprung.")}</p>` : ""}` +
      e.map((h) => `<div class="beweis"><b>${h.circa ? U("ca. ") : ""}${h.year} · ${KIND[h.kind]}</b> · ${h.person.join(", ")}<br>
        <span class="klein">${h.text}${h.proof ? FM(" (Beweis „{0}“)", h.proof) : ""}</span></div>`).join("") +
      `<p class="klein">${U("Jahreszahlen noch nicht an Quellen geprüft.")}</p>`;
  }
  function conceptsOfStatement(id) {
    const BG = window.AG_CONCEPTS, list = BG && BG.theoremConcepts[id];
    if (!list) return "";
    const name = {}; BG.concepts.forEach((b) => (name[b.id] = b.name));
    return `<h3>${U("Begriffe in der Aussage")}</h3>${list.filter((b) => name[b]).map((b) => `<a class="chip" href="begriffe.html#${b}">${name[b]}</a>`).join("")}`;
  }
  function overview() {
    const top = (value) => theorems.slice().sort((a, b) => value[b.id] - value[a.id]).slice(0, 10);
    const rankT = {}, rankD = {};
    theorems.slice().sort((a, b) => NF[b.id] - NF[a.id]).forEach((k, i) => (rankT[k.id] = i + 1));
    theorems.slice().sort((a, b) => DIRECT[b.id] - DIRECT[a.id]).forEach((k, i) => (rankD[k.id] = i + 1));
    const indirect = theorems.filter((k) => NF[k.id] >= 25).sort((a, b) => NF[b.id] / DIRECT[b.id] - NF[a.id] / DIRECT[a.id]).slice(0, 6);
    const nV = D.nodes.filter((k) => isConj(k.id)).length, nB = D.proofs.filter((b) => b.kind === "bedingt").length;
    const nEdges = D.proofs.reduce((a, b) => a + b.premises.length, 0);
    const nums = WITH_C
      ? FM("{0} Knoten ({1} Sätze, {2} Vermutungen, {3} Grundlagen), {4} Beweise und {5} bedingte Beweise mit zusammen {6} Kanten, {7} Beziehungen",
        D.nodes.length, theorems.length, nV, D.nodes.length - theorems.length - nV, D.proofs.length - nB, nB, nEdges, D.relations.length)
      : FM("{0} Knoten ({1} Sätze, {2} Grundlagen), {3} Beweise, {4} Kanten", D.nodes.length, theorems.length, D.nodes.length - theorems.length, D.proofs.length, nEdges);
    const conjectures = WITH_C ? `<h3>${U("Vermutungen nach Stand")}</h3>${GL.conjecturesByStatus(D, chip)}
      <h3>${U("Kantenarten")}</h3>${["beweis"].concat(KINDS_C).map((a) => `<p class="klein">${GL.pattern(a)} <b>${EDGE[a].name}.</b> ${EDGE[a].text}</p>`).join("")}
      ${KI ? GL.aiOverview(D, chip) : ""}` : "";
    const headFD = `<tr><th>${U("Satz")}</th><th class="zahl">${U("folgende")}</th><th class="zahl">${U("direkt")}</th></tr>`;
    panel.innerHTML = `<h2>${U("Übersicht")}</h2><p class="klein">${nums}. ${FM("Größte logische Tiefe {0}.", maxT)}</p>${conjectures}
      <h3>${U("Die meisten folgenden Sätze")}</h3>
      <table class="auswertung vergleich">${headFD}
      ${top(NF).map((k) => `<tr><td>${chip(k.id)}</td><td class="zahl">${NF[k.id]}</td><td class="zahl">${DIRECT[k.id]}</td></tr>`).join("")}</table>
      <h3>${U("Die meisten direkten Nutzer")}</h3>
      <table class="auswertung vergleich"><tr><th>${U("Satz")}</th><th class="zahl">${U("direkt")}</th><th class="zahl">${U("folgende")}</th></tr>
      ${top(DIRECT).map((k) => `<tr><td>${chip(k.id)}</td><td class="zahl">${DIRECT[k.id]}</td><td class="zahl">${NF[k.id]}</td></tr>`).join("")}</table>
      <h3>${U("Viele Folgerungen, wenige direkte Nutzer")}</h3>
      <p class="klein">${U("Sätze, deren Wirkung fast nur über Zwischenschritte geht. Bei der Größe „Folgerungen“ erscheinen sie groß, bei „Direkte Nutzer“ klein.")}</p>
      <table class="auswertung vergleich">${headFD}
      ${indirect.map((k) => `<tr><td>${chip(k.id)}</td><td class="zahl">${NF[k.id]}</td><td class="zahl">${DIRECT[k.id]}</td></tr>`).join("")}</table>
      <h3>${U("Lesart")}</h3>
      <p class="klein">${U("„Folgende Sätze“ zählt alle Sätze, die über irgendeinen Beweis von diesem Satz abhängen, auch über alternative Beweise. Die Zahl hängt davon ab, wie fein der Graph unterteilt ist: Ein Zwischenschritt, der eingefügt wird, übernimmt die Folgerungen seines Vorgängers. Ausgefüllter Beweispunkt: einziger Beweis im Graphen; hohler Punkt: einer von mehreren. Farbige Ringe markieren redaktionell hervorgehobene Sätze (siehe Ansicht „Sätze“).")}</p>`;
  }
  function show(id) {
    selected = id; uiState.k = id; write();
    const k = K[id];
    const { vf, nf } = pos[id] ? mark(id, false) : { vf: ancestors(id), nf: descendants(id) };
    const bw = k.proofs.map((b, i) => GL.proofHtml(b, k.proofs.length > 1 ? FM("Beweis {0}: ", "ABCDEFG"[i]) : U("Beweis: "), K, chip) + GL.aiHtml(b)).join("");
    const users = [...new Set(k.users.filter(chosenProof).map((b) => b.from))];
    const usersAI = [...new Set(k.users.filter((b) => b.kind === "beansprucht").map((b) => b.from))];
    const usersB = [...new Set(k.users.filter((b) => b.kind === "bedingt").map((b) => b.from))];
    const v = isConj(id);
    const hv = D.highlights[id];
    const jt = GL.yearText(k, D.history);
    panel.innerHTML = `<h2>${k.name}</h2>
      <div class="klein">${k.type === "grundlage" ? U("Grundlage außerhalb des Graphen") : v ? `${U("Vermutung")} · <b style="color:${STATE_COLOR[k.state]}">${D.statuses[k.state]}</b> · ${D.areas[k.area]}` : (GL.isCounterexample(k) ? `<b style="color:${GL.GB_COLOR}">${U("Gegenbeispiel")}</b> · ` : "") + D.areas[k.area] + (jt ? " · " + jt : "") + " · " + FM("logische Tiefe {0}", depth[id])}${pos[id] ? "" : " · " + U("zurzeit ausgeblendet")}</div>
      ${GL.fieldHtml(k)}
      ${GL.statementHtml(k)}
      ${hv ? `<div class="hervor" style="border-color:${HIGHLIGHT[hv.kind]}"><b>${GLYPH[hv.kind]} ${D.highlightKinds[hv.kind]}.</b> ${hv.reason}</div>` : ""}
      <p>${k.text}</p>${GL.classificationHtml(k)}
      ${v ? `<p class="klein">${FM("Stand „{0}“: {1}", D.statuses[k.state], D.stateText[k.state])}</p>` : ""}
      ${historyOfTheorem(id)}
      ${conceptsOfStatement(id)}
      ${VF.info("s:" + id)}
      ${bw ? `<h3>${U("Beweise")}</h3>${bw}` : v ? `<h3>${U("Beweise")}</h3><p class="klein">${U("Kein Beweis bekannt.")}</p>` : ""}
      ${GL.relationsHtml(k, chip)}${GL.disprovedHtml(k, chip)}
      ${users.length ? `<h3>${FM("Direkt gebraucht für ({0})", users.length)}</h3>${users.map(chip).join("")}` : ""}
      ${usersB.length ? `<h3>${U("Direkt gebraucht in bedingten Beweisen für")}</h3>${usersB.map(chip).join("")}` : ""}
      ${usersAI.length ? `<h3>${U("Direkt gebraucht in beanspruchten KI-Beweisen für")}</h3>${usersAI.map(chip).join("")}` : ""}
      <h3>${U("Hängt insgesamt ab von")}</h3><p class="klein">${FM(!WITH_C ? "{0} Knoten (braun markiert)" : KI ? "{0} Knoten (braun markiert), auch über bedingte und beanspruchte Beweise" : "{0} Knoten (braun markiert), auch über bedingte Beweise", vf.size)}</p>
      <h3>${U("Insgesamt gebraucht für")}</h3><p class="klein">${FM(WITH_C ? "{0} Knoten (blau markiert)" : "{0} Sätze (blau markiert)", nf.size)}</p>
      <p><span class="chip" id="zurueck">${U("Zur Übersicht")}</span></p>`;
    document.getElementById("zurueck").addEventListener("click", (e) => { e.stopPropagation(); reset(); });
  }
  function reset() { selected = null; uiState.k = null; write(); unmark(); overview(); }

  // ------------------------------------------------------------ Legend of the node size
  function sizeLegend() {
    const G = SIZES[uiState.groesse], box = document.getElementById("groessenlegende");
    let image = "";
    if (G.value) {
      const values = [...new Set([1, Math.round(G.max / 8), Math.round(G.max / 3), G.max])].filter((v) => v > 0);
      const rr = values.map((v) => G.f(v));
      let x = 6; const H = 2 * RMAX + 22, parts = [];
      values.forEach((v, i) => { const r = rr[i]; parts.push(`<circle cx="${x + r}" cy="${RMAX + 4}" r="${r}" fill="#e3dccf" stroke="#5f574b"/><text x="${x + r}" y="${H - 2}" text-anchor="middle" font-size="12">${v}</text>`); x += 2 * r + 14; });
      image = `<svg width="${x}" height="${H}" viewBox="0 0 ${x} ${H}">${parts.join("")}</svg><span class="klein">${U(G.unit === "direkte Nutzer" ? "Zahl der direkten Nutzer. Kleinster Kreis: 0 oder 1." : "Zahl der folgenden Sätze. Kleinster Kreis: 0 oder 1.")}</span>`;
    }
    box.innerHTML = `<b>${FM("Knotengröße: {0}.", G.name)}</b> ${G.text} ${U("Grundlagen (graue Quadrate) haben eine feste Größe.")}${image}
      <div class="klein" style="margin-top:4px">${U("Gestrichelt: Beweis, der nicht der kürzeste ist.")}${WITH_C ? " " + U("Vermutungen (gestrichelter Kreis) haben eine feste Größe.") : ""}
      ${U("Rote Rauten sind Gegenbeispiele; sie sind bewiesen und haben eine logische Tiefe wie Sätze.")}</div>`;
  }

  // ------------------------------------------------------------ Controls
  function buttons(target, options, key) {
    const box = document.getElementById(target);
    Object.entries(options).forEach(([value, o]) => {
      const b = document.createElement("button"); b.textContent = typeof o === "string" ? o : o.name; b.dataset.wert = value;
      b.addEventListener("click", () => { uiState[key] = value; write(); updateButtons(); view = null; draw(); });
      box.appendChild(b);
    });
  }
  function updateButtons() {
    document.querySelectorAll("#anordnung button").forEach((b) => b.classList.toggle("an", b.dataset.wert === uiState.anordnung));
    document.querySelectorAll("#groessenwahl button").forEach((b) => b.classList.toggle("an", b.dataset.wert === uiState.groesse));
  }
  buttons("anordnung", LAYOUTS, "anordnung");
  buttons("groessenwahl", SIZES, "groesse");
  updateButtons();

  const filter = document.getElementById("filter");
  filter.innerHTML = AREAS.map((b) => `<label><input type="checkbox" data-b="${b}" ${uiState.aus.has(b) ? "" : "checked"}><i style="background:${COLOR[b]}"></i>${D.areas[b]} (${D.nodes.filter((k) => k.area === b).length})</label>`).join("") +
    `<span class="knopf" id="alleAn">${U("alle")}</span><span class="knopf" id="ohneGrund">${U("ohne Grundlagen")}</span>`;
  const filterChanged = () => { filter.querySelectorAll("input").forEach((i) => (i.checked = !uiState.aus.has(i.dataset.b))); write(); view = null; draw(); };
  filter.addEventListener("change", (e) => { const b = e.target.dataset.b; if (!b) return; if (e.target.checked) uiState.aus.delete(b); else uiState.aus.add(b); filterChanged(); });
  document.getElementById("alleAn").addEventListener("click", () => { uiState.aus.clear(); filterChanged(); });
  document.getElementById("ohneGrund").addEventListener("click", () => { uiState.aus.clear(); uiState.aus.add("grundlage"); filterChanged(); });

  // Main fields (MSC): legend with the number of theorems per field and highlighting of the theorems with several
  // fields
  (function () {
    const num = {};
    D.nodes.forEach((k) => (k.field || []).forEach((n) => (num[n] = (num[n] || 0) + (k.type === "satz" ? 1 : 0))));
    const multiple = theorems.filter((k) => k.field && k.field.length > 1).length;
    const box = document.getElementById("gebiete");
    box.innerHTML = `<span class="titel">${U("Hauptgebiete (MSC):")}</span>` + Object.keys(num).map(Number).sort((a, b) => a - b)
      .map((n) => `<span><i class="ring" style="border-color:${GL.MSC[n].color}"></i>${GL.mscNumber(n)} ${GL.MSC[n].name} (${num[n] || U("nur Grundlagen")})</span>`).join("") +
      `<span class="klein">${U("Zweifarbiger Ring: zwei Hauptgebiete, links das erste, rechts das zweite.")}</span>` +
      `<label><input type="checkbox" id="nurMehrere" ${uiState.mehrere ? "checked" : ""}> ${FM("nur Sätze mit mehreren Hauptgebieten hervorheben ({0})", multiple)}</label>`;
    document.body.classList.toggle("nur-mehrere", uiState.mehrere);
    document.getElementById("nurMehrere").addEventListener("change", (e) => {
      uiState.mehrere = e.target.checked; document.body.classList.toggle("nur-mehrere", uiState.mehrere); write(); });
  })();

  // Search: name from the list or substring
  document.getElementById("namen").innerHTML = D.nodes.slice().sort((a, b) => a.name.localeCompare(b.name, I18 && I18.en ? "en" : "de")).map((k) => `<option value="${k.name}">`).join("");
  const search = document.getElementById("suche");
  search.placeholder = U("Satz suchen …"); search.setAttribute("aria-label", U("Satz suchen"));
  svg.setAttribute("aria-label", U("Großer Beweisgraph"));
  function lookup(final) {
    const q = search.value.trim().toLowerCase();
    visibleIds.forEach((id) => K[id].g && K[id].g.classList.toggle("treffer", q.length >= 3 && K[id].name.toLowerCase().includes(q)));
    if (!final || !q) return;
    const k = D.nodes.find((x) => x.name.toLowerCase() === q) || D.nodes.find((x) => x.name.toLowerCase().includes(q));
    if (!k) return;
    if (!visible(k.id)) { uiState.aus.delete(k.area); filterChanged(); }
    show(k.id); center(k.id, 1.1);
  }
  search.addEventListener("input", () => { lookup(false); if (D.nodes.some((k) => k.name === search.value)) lookup(true); });
  search.addEventListener("keydown", (e) => { if (e.key === "Enter") lookup(true); });

  // Conjectures: switch (rebuilds the page with the new state in the address) and legend of the edge kinds
  const withC = document.getElementById("mitV");
  withC.checked = WITH_C;
  withC.addEventListener("change", () => {
    uiState.vermutungen = withC.checked;
    if (!withC.checked) uiState.ki = false;
    if (!withC.checked && uiState.k && (isConj(uiState.k) || GL.isAI(K[uiState.k]))) uiState.k = null;
    write(); location.reload();
  });
  // AI proofs: on also switches the conjectures on; off leaves them switched on
  const withAI = document.getElementById("mitKI");
  withAI.checked = KI;
  withAI.addEventListener("change", () => {
    uiState.ki = withAI.checked;
    uiState.vermutungen = true;
    if (!withAI.checked && uiState.k && GL.isAI(K[uiState.k])) uiState.k = null;
    write(); location.reload();
  });
  if (WITH_C) {
    document.getElementById("vlegende").innerHTML = `<span class="titel">${U("Vermutungen:")}</span><span><i class="vkasten" style="background:#fff;border-radius:50%"></i>${U("Vermutung (gestrichelter Kreis)")}</span>` +
      ["beweis"].concat(KINDS_C).map((a) => `<label title="${EDGE[a].text}">${a === "beweis" ? "" : `<input type="checkbox" data-art="${a}" checked> `}${GL.pattern(a)} ${EDGE[a].name}</label>`).join("") +
      (KI ? GL.aiLegend(D.proofs) : "");
    document.querySelectorAll("#vlegende input[data-art]").forEach((c) => c.addEventListener("change", () =>
      document.body.classList.toggle("ohne-" + c.dataset.art, !c.checked)));
  }

  // ------------------------------------------------------------ Start
  draw();
  if (uiState.k) { show(uiState.k); center(uiState.k, 1.0); } else overview();
  // Filter by comprehensibility of the statement (verstaendlichkeit-filter.js); draw() creates new elements, the filter
  // follows
  VF.an({ name: "AG", svg, legend: "gebiete", nodes: () => D.nodes.map((k) => ["s:" + k.id, k.g]),
    edges: () => edgeList.map((ka) => [ka.e, ka.from && "s:" + ka.from, "s:" + ka.to]).concat(D.proofs.map((b) => [b.e, null, "s:" + b.from])) });
})();
