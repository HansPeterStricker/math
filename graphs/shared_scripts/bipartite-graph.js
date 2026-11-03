// Shared page code of the bipartite graphs (bipartite.html in the folders of graphs/; user, 3 November 2026): the
// concepts of an area in a column on the left, its theorems, lemmas and conjectures in a column on the right, and a line
// from concept c to theorem t when c occurs in the statement of t (field `concepts` of the theorem). Both columns are
// grouped in blocks by MSC class; concepts of other areas form a block of their own at the bottom of the left column,
// grouped by their home area. Colours, shapes, panel, tooltip and the column of areas are those of the circle graphs
// (concept-graph.js); the click marks in the graph, as in the mode "click opens a card" switched off.
//
// Order of the blocks and of the nodes within the blocks: as few crossing lines as possible. Starting from the order
// of the data, the two columns are sorted alternately by the mean position of the partners (barycentre method; blocks
// by the mean over all their lines), the order with the fewest crossings is kept, and then two neighbouring nodes of
// a block or two neighbouring blocks are exchanged as long as that lowers the number of crossings. The classes have
// the same order in both columns and face each other in one band (two neighbouring classes change places in both
// columns at once). The block of the concepts of other areas stays at the bottom; only its sub-blocks are ordered.
// The result is fixed and deterministic.
//
// Configuration in window.BIPARTITE_PAGE (scripts/bipartite-page.js of the folder, written by
// graphs/tests/make-bipartite-pages.js):
//   folder, prefix, name   folder, prefix of references to it ("ent"), name of the area in running text
//   concepts, theorems     global names of the concept data and of the theorem data
//   colors                 colour per key of `areas` (classes of concepts and theorems)
//   shapes                 kind of theorem -> shape of the concept graph (as in theorem-page.js)
//   foreignArea            area key of concepts without a home folder yet ("basic")
//   foreignLabel           text for them ("defined outside 11A")
//   sources                prefix -> { data, page, name }: concept data of the other folders
// Address: #c=<concept id> or #t=<theorem id> selects a node (concept and theorem ids may coincide).
(function () {
  "use strict";
  const CFG = window.BIPARTITE_PAGE;
  const C = window[CFG.concepts], T = window[CFG.theorems];
  const FA = CFG.foreignArea || "basic";
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

  // names for SVG text and formulas: the same rules as in concept-graph.js (copied, so that the circle graphs stay
  // untouched)
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻", "−": "⁻", n: "ⁿ", i: "ⁱ", d: "ᵈ", k: "ᵏ", m: "ᵐ", p: "ᵖ", e: "ᵉ", r: "ʳ", x: "ˣ", "*": "*" };
  const SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", "+": "₊", "-": "₋", "−": "₋", n: "ₙ", k: "ₖ", p: "ₚ", i: "ᵢ", m: "ₘ", e: "ₑ", x: "ₓ" };
  const conv = (t, map, mark) => ([...t].every((ch) => map[ch]) ? [...t].map((ch) => map[ch]).join("") : mark + t);
  const plainName = (n) => n.replace(/<sup>(.*?)<\/sup>/g, (m, t) => conv(t, SUP, "^")).replace(/<sub>(.*?)<\/sub>/g, (m, t) => conv(t, SUB, "_")).replace(/<[^>]+>/g, "");
  const formulaParts = (f) => {
    if (/\\begin\{/.test(f)) return [f];
    const parts = [];
    let depth = 0, start = 0;
    for (let i = 0; i < f.length; i++) {
      const ch = f[i];
      if (ch === "\\" && (f[i + 1] === "{" || f[i + 1] === "}")) { i++; continue; }
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      if (depth) continue;
      const m = /^(,\s*\\q?quad(?![a-zA-Z])|\\q?quad(?![a-zA-Z])|,\s*\\;|,\s*\\ \s*\\ )\s*/.exec(f.slice(i));
      if (m) { parts.push(f.slice(start, i)); i += m[0].length - 1; start = i + 1; }
    }
    parts.push(f.slice(start));
    return parts.map((p) => p.trim()).filter(Boolean);
  };
  const tex = (f) => formulaParts(f).map((p) => {
    try { return '<span class="formel-teil">' + katex.renderToString("\\displaystyle " + p, { throwOnError: false }) + "</span>"; } catch (e) { return p; }
  }).join(" ");
  // colours of the home areas of concepts of other folders: the same fixed colours as in concept-graph.js
  // colour of each area from the register (shared_scripts/areas.js, field `color`), "local" for placeholders of this folder
  const ORIGIN_COLORS = Object.assign({ local: "#d9d4ca" }, ...(window.GRAPH_AREAS || []).map((a) => ({ [a.prefix]: a.color })));
  const originColor = (o) => ORIGIN_COLORS[o] || "#8a7f6e";
  const originName = (o) => (o === "local" ? CFG.foreignLabel + ", no home folder yet" : "from " + ((CFG.sources[o] || {}).name || o));

  // ------------------------------------------------------------ nodes and lines
  const cById = new Map(C.concepts.map((c) => [c.id, c]));
  const shared = new Map((C.shared || []).map((s) => [s.ref, s]));
  const nodes = new Map(); // "c:<id>" or "t:<id>" -> node
  const edges = [];
  const conceptOrder = new Map(C.concepts.map((c, i) => [c.id, i]));
  let firstSeen = 0;
  function conceptNode(ref) {
    let id = ref;
    if (ref.includes(":") && ref.split(":")[0] === CFG.prefix) id = ref.slice(CFG.prefix.length + 1);
    const key = "c:" + id;
    if (nodes.has(key)) return nodes.get(key);
    let node;
    if (!id.includes(":")) {
      const c = cById.get(id);
      if (!c) { console.error("bipartite graph: unknown concept " + ref); return null; }
      node = { key, id, side: "L", d: c, area: c.area === FA ? null : c.area, origin: c.area === FA ? "local" : null, rank: conceptOrder.get(id) };
    } else {
      const [p, cid] = id.split(":"), src = CFG.sources[p], data = src && window[src.data], c = data && data.concepts.find((x) => x.id === cid);
      if (!c) { console.error("bipartite graph: unknown concept " + ref); return null; }
      const s = shared.get(id);
      node = { key, id, side: "L", d: c, area: s ? s.area : null, origin: p, shared: !!s, home: src.page + "#mark=" + cid, homeName: src.name, rank: 1e6 + firstSeen++ };
    }
    node.partners = [];
    nodes.set(key, node);
    return node;
  }
  const theorems = T.theorems.filter((t) => t.area !== FA && !t.id.includes(":"));
  theorems.forEach((t, i) => {
    const tn = { key: "t:" + t.id, id: t.id, side: "R", d: t, area: t.area, rank: i, partners: [] };
    nodes.set(tn.key, tn);
    [...new Set(t.concepts || [])].forEach((ref) => {
      const cn = conceptNode(ref);
      if (!cn || tn.partners.includes(cn)) return;
      tn.partners.push(cn); cn.partners.push(tn);
      edges.push({ c: cn, t: tn });
    });
  });
  const ownConcepts = C.concepts.filter((c) => c.area !== FA && !c.id.includes(":"));
  const unused = ownConcepts.filter((c) => !nodes.has("c:" + c.id));
  const areaName = (k) => (C.areas || {})[k] || (T.areas || {})[k] || k;
  const kindName = (n) => (n.side === "R" ? T.kinds : C.kinds)[n.d.kind] || n.d.kind;
  const colorOf = (n) => (n.area ? CFG.colors[n.area] || "#ccc" : originColor(n.origin));

  // ------------------------------------------------------------ blocks
  // A column is a list of groups, a group a list of blocks, a block a list of nodes. Blocks move only within their
  // group: the own classes form one group, the concepts of other areas a second one, always below it.
  const byRank = (a, b) => a.rank - b.rank;
  const blocksOf = (list, keyOf, keys) => keys.map((k) => ({ key: k, nodes: list.filter((n) => keyOf(n) === k).sort(byRank) })).filter((b) => b.nodes.length);
  const leftNodes = [...nodes.values()].filter((n) => n.side === "L"), rightNodes = [...nodes.values()].filter((n) => n.side === "R");
  const ownKeys = [...new Set(Object.keys(C.areas || {}).concat(leftNodes.filter((n) => n.area).map((n) => n.area)))];
  const originKeys = ["local"].concat(Object.keys(CFG.sources));
  const L = [blocksOf(leftNodes.filter((n) => n.area), (n) => n.area, ownKeys), blocksOf(leftNodes.filter((n) => !n.area), (n) => n.origin, originKeys)].filter((g) => g.length);
  const R = [blocksOf(rightNodes, (n) => n.area, [...new Set(Object.keys(T.areas || {}).concat(rightNodes.map((n) => n.area)))])];
  L.forEach((g, i) => g.forEach((b) => { b.foreign = i === 1 || !b.nodes[0].area; }));
  const flat = (col) => col.flat().flatMap((b) => b.nodes);
  const index = () => { flat(L).forEach((n, i) => { n.pos = i; }); flat(R).forEach((n, i) => { n.pos = i; }); };
  const crossings = () => {
    index();
    const E = edges.map((e) => [e.c.pos, e.t.pos]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let n = 0;
    for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) if (E[i][0] < E[j][0] && E[i][1] > E[j][1]) n++;
    return n;
  };
  // Classes face each other (user, 3 November 2026): the blocks of the own classes have the same order in both columns,
  // so that each class gets one horizontal band with its concepts on the left and its theorems on the right.
  const isOwn = (g) => g.length && !g[0].foreign;
  let order = [...new Set([...(isOwn(L[0]) ? L[0] : []), ...R[0]].map((b) => b.key))];
  const applyOrder = () => {
    const ix = new Map(order.map((k, i) => [k, i]));
    [L, R].forEach((col) => { if (isOwn(col[0])) col[0].sort((x, y) => ix.get(x.key) - ix.get(y.key)); });
  };
  applyOrder();
  const snapshot = (col) => col.map((g) => g.map((b) => ({ b, nodes: b.nodes.slice() })));
  const restore = (col, snap) => snap.forEach((g, i) => { col[i] = g.map((x) => { x.b.nodes = x.nodes.slice(); return x.b; }); });
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
  function sweep(col) {
    index();
    const other = col === L ? R : L;
    col.forEach((g, gi) => {
      g.forEach((b) => {
        b.nodes.forEach((n) => { n.bary = mean(n.partners.map((p) => p.pos)) ?? n.pos; });
        b.nodes.sort((x, y) => x.bary - y.bary || x.pos - y.pos);
        b.bary = mean(b.nodes.flatMap((n) => n.partners.map((p) => p.pos))) ?? b.nodes[0].pos;
        b.first = b.nodes[0].pos;
      });
      if (!isOwn(g)) { col[gi] = g.slice().sort((x, y) => x.bary - y.bary || x.first - y.first); return; }
      // a class without a block in this column keeps the mean place of its block in the other column (same scale)
      const bary = new Map(g.map((b) => [b.key, b.bary]));
      if (isOwn(other[0])) other[0].forEach((b) => { if (!bary.has(b.key)) bary.set(b.key, mean(b.nodes.map((n) => n.pos))); });
      order = order.slice().sort((x, y) => bary.get(x) - bary.get(y) || order.indexOf(x) - order.indexOf(y));
      applyOrder();
    });
  }
  const before = crossings();
  let best = before, bestL = snapshot(L), bestR = snapshot(R), bestOrder = order.slice();
  for (let it = 0; it < 30; it++) {
    for (const col of [R, L]) {
      sweep(col);
      const n = crossings();
      if (n < best) { best = n; bestL = snapshot(L); bestR = snapshot(R); bestOrder = order.slice(); }
    }
  }
  restore(L, bestL); restore(R, bestR); order = bestOrder; applyOrder();
  // exchanges of neighbours as long as the number of crossings falls
  // pair(u, v): crossings among the lines of u and v when u stands above v
  const pair = (u, v) => { let n = 0; for (const p of u.partners) for (const q of v.partners) if (p.pos > q.pos) n++; return n; };
  let current = crossings();
  for (let improved = true; improved;) {
    improved = false;
    for (const col of [L, R]) {
      for (const g of col) {
        index();
        for (const b of g) for (let i = 0; i + 1 < b.nodes.length; i++) {
          const u = b.nodes[i], v = b.nodes[i + 1], d = pair(v, u) - pair(u, v);
          if (d < 0) { b.nodes[i] = v; b.nodes[i + 1] = u; [u.pos, v.pos] = [v.pos, u.pos]; current += d; improved = true; }
        }
        if (isOwn(g)) continue;
        for (let i = 0; i + 1 < g.length; i++) {
          [g[i], g[i + 1]] = [g[i + 1], g[i]];
          const n = crossings();
          if (n < current) { current = n; improved = true; } else [g[i], g[i + 1]] = [g[i + 1], g[i]];
        }
      }
    }
    // neighbouring classes change places in both columns at once
    for (let i = 0; i + 1 < order.length; i++) {
      [order[i], order[i + 1]] = [order[i + 1], order[i]];
      applyOrder();
      const n = crossings();
      if (n < current) { current = n; improved = true; } else { [order[i], order[i + 1]] = [order[i + 1], order[i]]; applyOrder(); }
    }
  }
  index();

  // ------------------------------------------------------------ drawing
  const svg = document.getElementById("bipartite");
  const box = svg.parentNode;
  svg.classList.add("bip-graph");
  const gBands = el("g", { class: "baender" }, svg), gEdges = el("g", {}, svg), gNodes = el("g", {}, svg);
  const radius = (n) => Math.min(8.5, 3.5 + Math.sqrt(n.partners.length));
  const shape = (g, n, r) => {
    const kind = n.side === "R" ? (CFG.shapes || {})[n.d.kind] || "objekt" : n.d.kind;
    const s = { class: "form", fill: n.area ? colorOf(n) : "#fbfaf6" };
    if (kind === "konstruktion") return el("rect", { ...s, x: -r * 0.88, y: -r * 0.88, width: r * 1.76, height: r * 1.76, rx: 2 }, g);
    if (kind === "invariante") return el("path", { ...s, d: `M0,${-r * 1.2}L${r * 1.2},0L0,${r * 1.2}L${-r * 1.2},0Z` }, g);
    if (kind === "eigenschaft") return el("path", { ...s, d: `M0,${-r * 1.2}L${r * 1.1},${r * 0.8}L${-r * 1.1},${r * 0.8}Z` }, g);
    if (kind === "morphismus") return el("polygon", { ...s, points: [0, 1, 2, 3, 4, 5].map((i) => { const a = (Math.PI / 3) * i; return `${r * 1.05 * Math.cos(a)},${r * 1.05 * Math.sin(a)}`; }).join(" ") }, g);
    return el("circle", { ...s, r }, g);
  };
  const MAXLEN = 44; // longer names are shortened in the picture; the tooltip has the full name
  const short = (s) => (s.length <= MAXLEN ? s : s.slice(0, MAXLEN - 1).replace(/\s+\S*$/, "") + " …");
  const tip = document.createElement("div");
  tip.className = "knoten-tip";
  tip.hidden = true;
  document.body.appendChild(tip);
  const moveTip = (ev) => { tip.style.left = ev.clientX + 14 + "px"; tip.style.top = ev.clientY + 14 + "px"; };
  let hoverTimer = null;
  const nodeEls = new Map();
  [...nodes.values()].forEach((n) => {
    n.r = radius(n);
    const g = el("g", { class: "knoten" + (n.area ? "" : " fremd") + (n.side === "R" ? " satz" : " begriff"), "data-key": n.key }, gNodes);
    shape(g, n, n.r);
    if (!n.area) g.style.setProperty("--herkunft", colorOf(n));
    const t = el("text", { x: n.side === "L" ? -(n.r + 5) : n.r + 5, y: 0, dy: ".35em", "text-anchor": n.side === "L" ? "end" : "start" }, g);
    t.textContent = short(plainName(n.d.name));
    n.label = t;
    n.tipText = plainName(n.d.name) + " — " + kindName(n) + ", " + (n.area ? (n.d.msc5 || (n.side === "R" ? areaName(n.area) : areaName(n.area).split(" ")[0])) : "MSC " + (n.d.msc || []).join(", ") + " (" + originName(n.origin) + ")");
    g.addEventListener("mouseenter", (ev) => { tip.textContent = n.tipText; tip.hidden = false; moveTip(ev); clearTimeout(hoverTimer); hoverTimer = setTimeout(() => hover(n.key), 500); });
    g.addEventListener("mousemove", moveTip);
    g.addEventListener("mouseleave", () => { tip.hidden = true; clearTimeout(hoverTimer); hover(null); });
    g.addEventListener("click", (ev) => { ev.stopPropagation(); select(n.key === selected ? null : n.key); });
    nodeEls.set(n.key, g);
  });
  edges.forEach((e) => { e.path = el("path", { class: "kante" }, gEdges); });

  // block bands and names
  const bandEls = [];
  const groupTitle = el("text", { class: "gruppe-name" }, gBands);
  groupTitle.textContent = "Concepts of other areas";
  [[L, "L"], [R, "R"]].forEach(([col, side]) => col.forEach((g) => g.forEach((b) => {
    const fill = b.foreign ? originColor(b.key) : CFG.colors[b.key] || "#ccc";
    const rect = el("rect", { class: "band", fill, rx: 4 }, gBands);
    const name = el("text", { class: b.foreign ? "block-name unter" : "block-name", "text-anchor": side === "L" ? "start" : "end" }, gBands);
    const full = b.foreign ? originName(b.key).replace(/^from /, "From ") : areaName(b.key);
    el("title", {}, name).textContent = full;
    name.appendChild(document.createTextNode(full));
    bandEls.push({ b, side, rect, name, full });
  })));

  // Layout (user, 3 November 2026): every own class has one horizontal band, as high as the higher of its two blocks;
  // the block of concepts and the block of theorems stand in the middle of the band, opposite each other, so that the
  // lines within a class run nearly straight. The concepts of other areas follow below the bands on the left. The
  // columns stand so far apart that the names on both sides fit (the picture scrolls sideways when the window is too
  // narrow).
  const ROW = 20, HEAD = 34, SUBHEAD = 26, GROUPHEAD = 26, PAD = 12, MINGAP = 200;
  function placeBlock(b, y, head, row) {
    b.top = y + head;
    b.nodes.forEach((nd, i) => { nd.y = b.top + (i + 0.5) * row; });
    b.bottom = b.top + b.nodes.length * row;
  }
  function placeAll(o) {
    let y = o.top;
    const own = (col) => new Map((isOwn(col[0]) ? col[0] : []).map((b) => [b.key, b]));
    const bl = own(L), br = own(R);
    const h = (b) => (b ? o.head + b.nodes.length * o.row : 0);
    order.forEach((k) => {
      const H = Math.max(h(bl.get(k)), h(br.get(k)));
      [bl.get(k), br.get(k)].forEach((b) => { if (b) placeBlock(b, y + (H - h(b)) / 2, o.head, o.row); });
      y += H;
    });
    L.forEach((g) => {
      if (isOwn(g)) return;
      g.groupY = y + o.group - 8; y += o.group;
      g.forEach((b) => { placeBlock(b, y, o.sub, o.row); y = b.bottom; });
    });
    return y - o.top;
  }
  let preview = null;
  function layout() {
    const o = preview
      ? { row: 6, head: 6, sub: 4, group: 6, top: 4 }
      : { row: ROW, head: HEAD, sub: SUBHEAD, group: GROUPHEAD, top: 4 };
    let H = placeAll(o);
    if (preview) {
      // the preview is a square: scale all heights to fit
      const f = (preview - 2 * o.top) / H;
      H = placeAll({ row: o.row * f, head: o.head * f, sub: o.sub * f, group: o.group * f, top: o.top });
    }
    let xL, xR, W;
    if (preview) { W = preview; xL = W * 0.22; xR = W * 0.78; }
    else {
      const wL = Math.max(60, ...flat(L).map((n) => n.label.getComputedTextLength() + n.r + 5));
      const wR = Math.max(60, ...flat(R).map((n) => n.label.getComputedTextLength() + n.r + 5));
      const avail = box.clientWidth - 2;
      xL = PAD + wL + 2;
      xR = Math.max(xL + MINGAP, avail - PAD - wR - 2);
      W = xR + wR + PAD + 2;
    }
    const height = H + 2 * o.top + (preview ? 0 : 10);
    svg.setAttribute("width", W); svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${W} ${height}`);
    flat(L).forEach((n) => { n.x = xL; }); flat(R).forEach((n) => { n.x = xR; });
    nodes.forEach((n) => {
      const r = preview ? Math.min(n.r, 2.6) : n.r;
      const g = nodeEls.get(n.key);
      g.setAttribute("transform", `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})` + (preview ? ` scale(${(r / n.r).toFixed(3)})` : ""));
    });
    edges.forEach((e) => {
      const x1 = e.c.x + (preview ? 2 : e.c.r), x2 = e.t.x - (preview ? 2 : e.t.r), m = (x1 + x2) / 2;
      e.path.setAttribute("d", `M${x1.toFixed(1)},${e.c.y.toFixed(1)}C${m.toFixed(1)},${e.c.y.toFixed(1)} ${m.toFixed(1)},${e.t.y.toFixed(1)} ${x2.toFixed(1)},${e.t.y.toFixed(1)}`);
    });
    // a name of a block reaches at most to the middle between the columns
    const room = (xR - xL) / 2 + (preview ? 0 : Math.min(xL, W - xR)) - 10;
    bandEls.forEach(({ b, side, rect, name, full }) => {
      const x0 = side === "L" ? 2 : xR - 14, x1 = side === "L" ? xL + 14 : W - 2;
      rect.setAttribute("x", x0); rect.setAttribute("width", x1 - x0);
      rect.setAttribute("y", b.top - 2); rect.setAttribute("height", b.bottom - b.top + 4);
      name.setAttribute("x", side === "L" ? 6 : W - 6); name.setAttribute("y", b.top - 8);
      name.lastChild.textContent = full;
      if (!preview && name.getComputedTextLength() > room) {
        let s = full;
        while (s.length > 4 && name.getComputedTextLength() > room) { s = s.slice(0, -2); name.lastChild.textContent = s.replace(/[\s,;]+$/, "") + " …"; }
      }
    });
    if (L[1]) { groupTitle.setAttribute("x", 6); groupTitle.setAttribute("y", L[1].groupY); groupTitle.style.display = ""; }
    else groupTitle.style.display = "none";
  }
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!preview) layout(); });
  window.addEventListener("resize", () => { if (!preview) layout(); });

  // ------------------------------------------------------------ selection
  let selected = null;
  function clearMarks() {
    svg.classList.remove("fokus");
    svg.querySelectorAll(".hell, .vorfahr, .nachfahr, .gewaehlt, .zeiger").forEach((x) => x.classList.remove("hell", "vorfahr", "nachfahr", "gewaehlt", "zeiger"));
  }
  // pointing at a node: after half a second only the node itself is lit, as in the circle graphs
  function hover(key) {
    if (selected) return;
    clearMarks();
    if (!key) return;
    svg.classList.add("fokus");
    nodeEls.get(key).classList.add("hell", "zeiger");
  }
  // A selected theorem marks the concepts of its statement (brown, like the premises in the circle graphs); a selected
  // concept marks the theorems whose statement uses it (blue, like the consequences).
  function mark(key) {
    clearMarks();
    if (!key) return;
    const n = nodes.get(key), cls = n.side === "R" ? "vorfahr" : "nachfahr";
    svg.classList.add("fokus");
    nodeEls.get(key).classList.add("hell", "gewaehlt");
    n.partners.forEach((p) => nodeEls.get(p.key).classList.add("hell", cls));
    edges.forEach((e) => { if (e.c === n || e.t === n) e.path.classList.add("hell", cls); });
    // lit lines above the others
    edges.forEach((e) => { if (e.c === n || e.t === n) gEdges.appendChild(e.path); });
  }
  const hashOf = (key) => (key ? key.replace(":", "=") : "");
  const chip = (p) => `<span class="chip" data-key="${p.key}"><i style="background:${p.area ? colorOf(p) : "#fbfaf6"};border-color:${colorOf(p)}"></i>${p.d.name}</span>`;
  const inColumn = (list) => list.slice().sort((a, b) => a.pos - b.pos);
  function select(key) {
    selected = key && nodes.has(key) ? key : null;
    mark(selected);
    if (location.hash.slice(1) !== hashOf(selected)) history.replaceState(null, "", selected ? "#" + hashOf(selected) : location.pathname + location.search);
    if (!selected) { panel.innerHTML = overview(); return; }
    const n = nodes.get(selected), d = n.d;
    const where = n.area ? areaName(n.area) : "MSC " + (d.msc || []).join(", ") + " (" + (n.origin === "local" ? CFG.foreignLabel : "defined in " + n.homeName) + ")";
    let home;
    if (n.side === "R") home = `<p class="meta"><a href="theorems.html#mark=${d.id}">Show in the theorem graph</a> (its proof and the theorems it builds on)</p>`;
    else if (n.origin === "local") home = `<p class="meta">${CFG.foreignLabel[0].toUpperCase() + CFG.foreignLabel.slice(1)}; no area of these graphs is its home yet.</p>`;
    else if (n.home) home = `<p class="meta">${n.shared ? "Equally important here; defined" : "Defined"} in <a href="${n.home}">the concept graph of ${n.homeName}</a>.</p>`;
    else home = `<p class="meta"><a href="concepts.html#mark=${d.id}">Show in the concept graph</a> (the concepts its definition uses)</p>`;
    panel.innerHTML = `<h2>${d.name}</h2>
      <div class="meta">${kindName(n)} · ${where}</div>
      ${d.formula && window.katex ? `<div class="formel">${tex(d.formula)}</div>` : ""}
      <p>${d.text || ""}</p>
      ${d.who || d.year ? `<p class="meta">${[d.who, d.year < 0 ? -d.year + " BC" : d.year].filter(Boolean).join(", ")}</p>` : ""}
      <h3>${n.side === "R" ? "Concepts in the statement" : "Statements using it"} (${n.partners.length})</h3>
      <p>${inColumn(n.partners).map(chip).join("")}</p>
      ${home}`;
  }
  function overview() {
    const top = (side, k) => [...nodes.values()].filter((n) => n.side === side).sort((a, b) => b.partners.length - a.partners.length || a.pos - b.pos).slice(0, k);
    const foreign = leftNodes.filter((n) => !n.area).length;
    return `<h2>Concepts in theorems of ${CFG.name}</h2>
      <p class="meta">${rightNodes.length} theorems, lemmas and conjectures; ${leftNodes.length} concepts (${foreign} of them from other areas); ${edges.length} lines.</p>
      <h3>Concepts in most statements</h3><p>${top("L", 8).map((n) => chip(n) + `<span class="meta">${n.partners.length}</span> `).join("")}</p>
      <h3>Statements with most concepts</h3><p>${top("R", 5).map((n) => chip(n) + `<span class="meta">${n.partners.length}</span> `).join("")}</p>
      ${unused.length ? `<h3>Concepts in no statement (${unused.length})</h3><p>${unused.map((c) => `<a class="chip" href="concepts.html#mark=${c.id}">${c.name}</a>`).join("")}</p>` : ""}
      <p class="meta">The contents were compiled with the help of a language model and have not been checked by a specialist.</p>`;
  }
  const panel = document.getElementById("panel");
  panel.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-key]");
    if (!t) return;
    select(t.dataset.key);
    const g = nodeEls.get(t.dataset.key), r = g.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (r.top < b.top || r.bottom > b.bottom) g.scrollIntoView({ block: "center", inline: "nearest" });
  });
  box.addEventListener("click", (ev) => { if (!ev.target.closest(".knoten")) select(null); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && ev.target !== searchBox) select(null); });

  // ------------------------------------------------------------ legend and switches (sidebar, as in the circle graphs)
  const kindSvg = (kind) => {
    const s = el("svg", { width: 18, height: 18, viewBox: "-9 -9 18 18", class: "form" });
    shape(s, { side: "L", d: { kind }, area: "x" }, 6).setAttribute("style", "stroke:#4b443b;stroke-width:1;fill:#fbfaf6");
    return s.outerHTML;
  };
  const block = (title, items, o = {}) =>
    `<details class="block"${o.closed ? "" : " open"}><summary class="block-titel">${title}</summary>` +
    `<div class="eintraege${o.cls ? " " + o.cls : ""}">${items.join("")}</div></details>`;
  const usedClasses = [...new Set(L.flat().concat(R.flat()).filter((b) => !b.foreign).map((b) => b.key))];
  const usedOrigins = L[1] ? L[1].map((b) => b.key) : [];
  const theoremKinds = [...new Set(rightNodes.map((n) => n.d.kind))];
  document.getElementById("legend").innerHTML =
    block("Colour: MSC class", usedClasses.map((k) => `<span><i style="background:${CFG.colors[k] || "#ccc"}"></i>${areaName(k)}</span>`), { closed: true }) +
    (usedOrigins.length ? block("Concepts of other areas", usedOrigins.map((o) => `<span><i style="background:#fbfaf6;border:2px dashed ${originColor(o)}"></i>${originName(o)}</span>`), { closed: true }) : "") +
    block("Shape: kind", Object.keys(C.kinds).map((k) => `<span>${kindSvg(k)}${C.kinds[k]}</span>`)
      .concat(theoremKinds.map((k) => `<span>${kindSvg((CFG.shapes || {})[k] || "objekt")}${T.kinds[k] || k}</span>`)), { cls: "zweispaltig", closed: true }) +
    block("Lines and sizes", [
      `<span class="hinweis">Left the concepts, right the theorems. A line joins a concept to a theorem whose statement uses it. Larger points have more lines.</span>`,
      `<span class="hinweis">A click on a point marks its lines and partners: for a theorem the concepts of its statement (brown), for a concept the theorems using it (blue). Escape or a click beside the points clears the marking.</span>`,
    ], { closed: true });
  document.getElementById("controls").innerHTML = block("Display", [
    `<label class="toggle"><input type="checkbox" id="c-names" checked><span class="regler"></span>names</label>`,
  ], { closed: true });
  document.getElementById("c-names").addEventListener("change", (ev) => svg.classList.toggle("ohne-namen", !ev.target.checked));
  const missing = document.getElementById("b-missing");
  if (missing) missing.textContent = unused.length ? `${unused.length} concept${unused.length === 1 ? "" : "s"} of the area occur${unused.length === 1 ? "s" : ""} in no statement and ${unused.length === 1 ? "is" : "are"} not shown (list in the panel on the right).` : "Every concept of the area occurs in some statement.";

  // ------------------------------------------------------------ search
  const searchBox = document.getElementById("search"), resultList = document.getElementById("search-results");
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/<[^>]+>/g, "").toLowerCase();
  let hits = [], active = 0;
  function showHits() {
    const words = norm(searchBox.value).split(/\s+/).filter(Boolean);
    nodeEls.forEach((g) => g.classList.remove("treffer"));
    if (!words.length) { hits = []; resultList.innerHTML = ""; svg.classList.remove("suchend"); return; }
    hits = [...nodes.values()].filter((n) => { const s = norm(n.d.name + " " + n.id.replace(/-/g, " ")); return words.every((w) => s.includes(w)); })
      .sort((a, b) => norm(a.d.name).indexOf(words[0]) - norm(b.d.name).indexOf(words[0]) || a.d.name.localeCompare(b.d.name));
    active = 0;
    hits.forEach((n) => nodeEls.get(n.key).classList.add("treffer"));
    svg.classList.toggle("suchend", hits.length > 0);
    resultList.innerHTML = hits.length
      ? hits.slice(0, 10).map((n, i) => `<li role="option" data-key="${n.key}" class="${i === active ? "aktiv" : ""}"><i style="background:${n.area ? colorOf(n) : "#fbfaf6"}"></i>${n.d.name}<span class="meta">${n.side === "R" ? "theorem" : "concept"}</span></li>`).join("")
      : `<li class="meta">nothing found</li>`;
  }
  function choose(key) {
    searchBox.value = "";
    showHits();
    select(key);
    nodeEls.get(key).scrollIntoView({ block: "center", inline: "nearest" });
  }
  searchBox.addEventListener("input", showHits);
  searchBox.addEventListener("keydown", (ev) => {
    const items = [...resultList.querySelectorAll("li[data-key]")];
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!items.length) return;
      active = (active + (ev.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      items.forEach((li, i) => li.classList.toggle("aktiv", i === active));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (items[active]) choose(items[active].dataset.key);
    } else if (ev.key === "Escape") { searchBox.value = ""; showHits(); }
  });
  resultList.addEventListener("mousedown", (ev) => { const li = ev.target.closest("li[data-key]"); if (li) { ev.preventDefault(); choose(li.dataset.key); } });
  searchBox.addEventListener("blur", () => setTimeout(() => { resultList.innerHTML = ""; }, 100));

  // ------------------------------------------------------------ address
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1)), m = /^([ct])=(.+)$/.exec(h);
    select(m ? m[1] + ":" + m[2] : null);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
  if (selected) nodeEls.get(selected).scrollIntoView({ block: "center", inline: "nearest" });

  // for tests and preview images
  window.BIPARTITE = {
    crossings: { before, after: crossings() },
    edges: edges.length, select, selected: () => selected,
    partners: (key) => nodes.get(key).partners.map((p) => p.key),
    keys: () => [...nodes.keys()],
    // square picture without names (preview images of graphs/index.html)
    preview(size) { preview = size; svg.classList.add("ohne-namen", "vorschau"); layout(); },
  };
})();
