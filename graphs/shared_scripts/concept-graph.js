// Shared page code of the concept graphs (concepts.html in the folders of graphs/): concepts drawn on rings by level
// (see the layout section); formulas with GL.tex (KaTeX) from graph.js. Edges: `uses` (arrow from the used concept to
// the defined one) and `isA` (dashed, from special to general case). Address #<concept id> selects a concept.
//
// Configuration in window.CONCEPT_PAGE (scripts/concept-page.js of the folder):
//   data          name of the global object with the concepts (e.g. "ENT_CONCEPTS"; model in its header comment)
//   colors        colour per key of `areas`
//   foreignArea   area key of concepts defined in other areas (drawn with a dashed border), e.g. "basic"
//   foreignLabel  legend text for it, e.g. "defined outside 11A"
//   hubs          own concepts used by almost everything whose outgoing edges are hidden by default (group)
//   centre        candidates for the middle of the picture (first one with level 1)
//   sources       prefix -> { data, page, title }: concept files of other folders. References "<prefix>:<id>" in
//                 `uses` and `isA` are shown as concepts of `foreignArea`, without their own dependencies (rule 2 in
//                 graphs/CLAUDE.md); the panel links to the concept in its home graph.
//
// The same code draws the theorem graphs (theorems.html, user, 3 November 2026): their data have `theorems` with
// `premises` instead of `concepts` with `uses` (model in graphs/CLAUDE.md) and are read as concepts whose `uses` are
// the premises. Further settings for them:
//   words         texts that differ from the concept graph (keys in WORDS below)
//   shapes        kind -> shape of the concept graph (objekt circle, konstruktion square, invariante diamond,
//                 eigenschaft triangle, morphismus hexagon)
//   foreignOutside  true: results of other areas are not drawn as points on an inner circle; each of their arrows
//                 comes from outside, from a small point next to the theorem it is used for, shown when that theorem
//                 is marked or with the switch (user, 3 November 2026)
//   conceptSources  "" (own folder) and prefix -> { data, page }: concept files for the field `concepts` (concepts in
//                 the statement), shown in the panel as links into the concept graphs
(function () {
  "use strict";
  const CFG = window.CONCEPT_PAGE;
  const asGraph = (d) => (!d || d.concepts ? d : { ...d, concepts: d.theorems.map((t) => ({ ...t, uses: t.premises || [] })) });
  const OWN = asGraph(window[CFG.data]);
  const WORDS = Object.assign({
    one: "concept", many: "concepts", usingIt: "concepts using it",
    usesHead: "Defined with", usedByHead: "Used in the definitions of", edges: "definitional dependencies",
    arrow: "A → B: B is defined with A", buildsOn: "Definitions this concept builds on", homeVerb: "Defined",
    levelHint: "Prerequisites: concepts from other areas. Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition.",
  }, CFG.words || {});
  const { el } = window.GL;
  // Formulas (user, 3 November 2026): no line break inside a formula; a formula with several parts separated by
  // ",\quad", "\quad", ",\;" or ",\ " at the outer level is split there, and every part is set on its own as one
  // unbreakable piece. The pieces stand side by side and wrap only between each other; the commas are dropped.
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
      const m = /^(,\s*\\q?quad(?![a-zA-Z])|\\q?quad(?![a-zA-Z])|,\s*\\;|,\s*\\ )\s*/.exec(f.slice(i));
      if (m) { parts.push(f.slice(start, i)); i += m[0].length - 1; start = i + 1; }
    }
    parts.push(f.slice(start));
    return parts.map((p) => p.trim()).filter(Boolean);
  };
  const tex = (f) => formulaParts(f).map((p) => {
    try { return '<span class="formel-teil">' + katex.renderToString("\\displaystyle " + p, { throwOnError: false }) + "</span>"; } catch (e) { return p; }
  }).join(" ");
  const svg = document.getElementById("graph");
  const panel = document.getElementById("panel");

  const COLORS = CFG.colors;
  const FOREIGN = CFG.foreignArea;

  // own concepts plus the concepts of other folders that they refer to (one step only)
  const D = { ...OWN, concepts: OWN.concepts.slice() };
  const KIND_LABEL = D.kinds;
  const refs = new Set();
  OWN.concepts.forEach((c) => (c.uses || []).concat(c.isA || []).forEach((t) => { if (t.includes(":")) refs.add(t); }));
  // a concept of another folder by its prefixed id (null if that folder's data are not loaded)
  const lookup = (ref) => {
    const [prefix, id] = ref.split(":");
    const source = (CFG.sources || {})[prefix], data = source && asGraph(window[source.data]);
    const c = data && data.concepts.find((x) => x.id === id);
    return c ? { c, prefix, source } : null;
  };
  const withPrefix = (prefix, t) => (t.includes(":") ? t : prefix + ":" + t);
  // Dependencies among the referenced concepts themselves are kept (ℕ → ℤ; user, 2 November 2026). Where the path in
  // the home graph runs through concepts that are not shown here (ideal → maximal ideal → local ring), it is followed
  // to the next referenced concept, so that the edge ideal → local ring appears.
  const reachedRefs = (prefix, list) => {
    const found = new Set(), seen = new Set(), stack = (list || []).map((t) => withPrefix(prefix, t));
    while (stack.length) {
      const t = stack.pop();
      if (seen.has(t)) continue;
      seen.add(t);
      if (refs.has(t)) { found.add(t); continue; }
      const hit = lookup(t);
      if (hit) (hit.c.uses || []).forEach((u) => stack.push(withPrefix(hit.prefix, u)));
    }
    return [...found];
  };
  refs.forEach((ref) => {
    const hit = lookup(ref);
    if (!hit) { console.error("concept graph: unknown reference " + ref); return; }
    const { c, prefix, source } = hit;
    const isA = (c.isA || []).map((t) => withPrefix(prefix, t)).filter((t) => refs.has(t));
    D.concepts.push({ ...c, id: ref, uses: reachedRefs(prefix, c.uses).filter((t) => t !== ref), isA, area: FOREIGN, foreign: { home: source.page + "#" + c.id, title: source.title, prefix } });
  });

  const concepts = D.concepts;

  // Prerequisites are coloured by their origin (user, 2 November 2026): the home folder of a referenced concept, or
  // "local" for the placeholders of this folder. Colours fixed per prefix, so that an area has the same colour in
  // every graph; the names come from the settings (title of the source).
  const ORIGIN_COLORS = { st: "#a39171", ent: "#c97b63", gt: "#6f9e6f", ct: "#6d8fc0", ca: "#c9a33e", ag: "#9d7cbf", ar: "#3f8f8a", local: "#d9d4ca" };
  const originOf = (c) => (c.foreign ? c.foreign.prefix : "local");
  const originName = (o) => (o === "local" ? CFG.foreignLabel + ", no home folder yet" : "from " + ((CFG.sources[o] || {}).title || o).replace(/^the (concept|theorem) graph of /, ""));
  const colorOf = (c) => (c.area === FOREIGN ? ORIGIN_COLORS[originOf(c)] || "#d9d4ca" : COLORS[c.area] || "#ccc");
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const usesEdges = [];
  const isaEdges = [];
  concepts.forEach((c) => {
    (c.uses || []).forEach((t) => byId.has(t) && usesEdges.push({ from: t, to: c.id, kind: "uses" }));
    (c.isA || []).forEach((t) => byId.has(t) && isaEdges.push({ from: c.id, to: t, kind: "isa" }));
  });
  const edges = usesEdges.concat(isaEdges);

  // direct neighbours along `uses`
  const usedBy = new Map(concepts.map((c) => [c.id, []]));
  usesEdges.forEach((e) => usedBy.get(e.from).push(e.to));
  const closure = (start, next) => {
    const seen = new Set(), stack = [start];
    while (stack.length) for (const x of next(stack.pop())) if (!seen.has(x)) { seen.add(x); stack.push(x); }
    return seen;
  };
  const ancestors = (id) => closure(id, (x) => (byId.get(x).uses || []).filter((t) => byId.has(t)));
  const descendants = (id) => closure(id, (x) => usedBy.get(x));

  // Level of a concept (definitional depth within the area; user, 2 November 2026): concepts from outside the area
  // (area FOREIGN: placeholders and concepts of other folders) are prerequisites with level 0 and do not count; an own
  // concept has level 1 if its definition uses no other own concept, otherwise 1 + the highest level among the own
  // concepts its definition uses.
  const isPre = (id) => byId.get(id).area === FOREIGN;
  const level = new Map();
  const levelOf = (id) => {
    if (!level.has(id)) {
      level.set(id, isPre(id) ? 0 : 1 + Math.max(0, ...(byId.get(id).uses || []).filter((t) => byId.has(t) && !isPre(t)).map(levelOf)));
    }
    return level.get(id);
  };
  concepts.forEach((c) => levelOf(c.id));

  // ------------------------------------------------------------ edges that are hidden by default
  // transitive: A → B where B also uses a concept that already depends on A (indirect dependency).
  // pre: edges from prerequisites (concepts from outside the area). hub: edges from the concepts in `hubs` (group in
  // group theory), which are used by almost everything. All three are shown for a selected concept or by switches.
  const HUBS = {};
  (CFG.hubs || []).forEach((h) => { HUBS[h] = true; });
  usesEdges.forEach((e) => {
    const uses = (byId.get(e.to).uses || []).filter((u) => byId.has(u));
    e.transitive = uses.some((u) => u !== e.from && ancestors(u).has(e.from));
    e.pre = isPre(e.from) && !isPre(e.to); // edges among the prerequisites stay visible
    e.hub = !e.pre && e.from in HUBS;
  });
  const layoutEdges = usesEdges.filter((e) => !e.transitive && !e.hub && !e.pre);

  // ------------------------------------------------------------ layout: sectors by class, rows by level within a sector
  // Radius (user, 2 November 2026): the centre concept (first of `centre` with level 1) in the middle, the
  // prerequisites on the innermost circle. In every sector the levels present form rows from the inside outward that
  // fill the whole radial range between RING.inner and the outer radius, so that sectors with few levels use their
  // space too; rows with many concepts get more room. The levels are therefore not global rings (user: the rings
  // should not dominate); within a sector a higher level always lies further out. The outer radius grows with the
  // square root of the number of concepts.
  // Angle: every MSC class gets a sector proportional to its number of concepts; the order of the sectors around the
  // circle is the one with the smallest total angle between the sectors of the two ends of the visible edges (all
  // orders tried). Within its sector and ring the concepts are sorted by the mean angle of their neighbours
  // (barycentre method, alternately from inside out and from outside in, as in layered drawings of directed graphs)
  // and spread evenly over the sector. The sectors are drawn as pale
  // wedges. The prerequisites are spread around their circle in the order of the mean angle of the concepts using
  // them. No force simulation. A dragged node stays where it is released; the other nodes do not move.
  const areaKeys = Object.keys(D.areas);
  // pre: radius of the prerequisites; inner: radius of the innermost row; spread: outer radius = inner + spread · √n
  // (n concepts on the rows); rowWeight: room of a row = 1 + (concepts in the row) · rowWeight.
  const RING = { pre: 110, inner: 210, spread: 70, rowWeight: 0.35, gap: 30, sectorGap: 0.025 };
  const rowRadius = new Map(); // "<area>|<level>" -> radius
  const TAU = 2 * Math.PI;
  const angDist = (x, y) => { const d = Math.abs(x - y) % TAU; return d > Math.PI ? TAU - d : d; };
  const circMean = (as) => {
    if (!as.length) return null;
    let x = 0, y = 0;
    as.forEach((a) => { x += Math.cos(a); y += Math.sin(a); });
    return Math.atan2(y, x);
  };

  const CENTRE_ID = (CFG.centre || []).find((id) => byId.has(id) && level.get(id) === 1);
  const ringConcepts = concepts.filter((c) => level.get(c.id) >= 1 && c.id !== CENTRE_ID);
  const count = {};
  // Small classes (fewer than CFG.minSector concepts, default 4) share one sector "other" if there are at least two of
  // them (user, 2 November 2026); its name lists the classes in a tooltip. The concepts keep the colour of their class.
  const MIN_SECTOR = CFG.minSector || 4;
  const areaCount = {};
  ringConcepts.forEach((c) => { areaCount[c.area] = (areaCount[c.area] || 0) + 1; });
  const smallAreas = Object.keys(areaCount).filter((k) => areaCount[k] < MIN_SECTOR);
  const OTHER = "other";
  const secKey = (c) => (smallAreas.length >= 2 && smallAreas.includes(c.area) ? OTHER : c.area);
  ringConcepts.forEach((c) => { count[secKey(c)] = (count[secKey(c)] || 0) + 1; });
  const sectorAreas = areaKeys.concat([OTHER]).filter((k) => count[k]);
  const START = -Math.PI / 2;
  const sectorsFor = (order) => {
    const s = {};
    let a = START;
    order.forEach((k) => { const w = (TAU * count[k]) / ringConcepts.length; s[k] = { from: a, w, mid: a + w / 2 }; a += w; });
    return s;
  };
  const crossAreaEdges = layoutEdges.map((e) => [secKey(byId.get(e.from)), secKey(byId.get(e.to))]).filter(([a, b]) => a !== b && count[a] && count[b]);
  const orderCost = (arr) => {
    const s = sectorsFor(arr);
    let c = 0;
    crossAreaEdges.forEach(([a, b]) => { c += angDist(s[a].mid, s[b].mid); });
    return c;
  };
  let bestOrder = sectorAreas.slice(), bestCost = orderCost(bestOrder);
  if (sectorAreas.length <= 9) {
    // up to 9 sectors: all orders (the first sector fixed, since turning the circle changes nothing)
    (function permute(arr, k) {
      if (k === arr.length) {
        const c = orderCost(arr);
        if (c < bestCost) { bestCost = c; bestOrder = arr.slice(); }
        return;
      }
      for (let i = k; i < arr.length; i++) {
        [arr[k], arr[i]] = [arr[i], arr[k]];
        permute(arr, k + 1);
        [arr[k], arr[i]] = [arr[i], arr[k]];
      }
    })(sectorAreas.slice(), 1);
  } else {
    // more sectors (their number grows factorially): exchange two sectors as long as that lowers the cost
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < bestOrder.length; i++) for (let j = i + 1; j < bestOrder.length; j++) {
        const arr = bestOrder.slice();
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const c = orderCost(arr);
        if (c < bestCost - 1e-9) { bestCost = c; bestOrder = arr; improved = true; }
      }
    }
  }
  const sectors = sectorsFor(bestOrder);

  const angle = new Map();
  const levelsSorted = [...new Set(level.values())].sort((a, b) => a - b);
  const conceptsAt = (l) => concepts.filter((c) => level.get(c.id) === l && c.id !== CENTRE_ID);
  // many prerequisites need a larger circle (circumference = sum of their sizes and gaps); the rows move out with it
  {
    const need = conceptsAt(0).reduce((s, c) => s + 2 * (6 + 2.4 * Math.sqrt(descendants(c.id).size)) + RING.gap, 0) / TAU;
    if (need > RING.pre) { RING.inner += need - RING.pre; RING.pre = need; }
  }
  const R_OUT = RING.inner + RING.spread * Math.sqrt(ringConcepts.length);
  sectorAreas.forEach((k) => {
    const rows = levelsSorted.filter((l) => l >= 1).map((l) => [l, conceptsAt(l).filter((c) => secKey(c) === k).length]).filter(([, n]) => n);
    const weights = rows.map(([, n]) => 1 + RING.rowWeight * n), total = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    rows.forEach(([l], j) => {
      rowRadius.set(k + "|" + l, RING.inner + ((acc + weights[j] / 2) / total) * (R_OUT - RING.inner));
      acc += weights[j];
    });
  });
  const radiusFor = (c) => (c.id === CENTRE_ID ? 0 : level.get(c.id) === 0 ? RING.pre : rowRadius.get(secKey(c) + "|" + level.get(c.id)));
  const inner = (id) => layoutEdges.filter((e) => e.to === id).map((e) => e.from);
  const outer = (id) => layoutEdges.filter((e) => e.from === id).map((e) => e.to);
  // position of an angle inside a sector, for sorting; angles outside go to the nearer end
  const keyIn = (sec, a) => {
    if (a == null) return sec.w / 2;
    const rel = (((a - sec.from) % TAU) + TAU) % TAU;
    if (rel <= sec.w) return rel;
    return rel - sec.w < TAU - rel ? sec.w + (rel - sec.w) * 1e-3 : -(TAU - rel) * 1e-3;
  };
  function placeRing(l, neighbours) {
    const nodes = conceptsAt(l);
    sectorAreas.forEach((k) => {
      const sec = sectors[k];
      const list = nodes.filter((c) => secKey(c) === k)
        .map((c) => ({ c, key: keyIn(sec, circMean(neighbours(c.id).filter((n) => angle.has(n)).map((n) => angle.get(n)))) }))
        .sort((a, b) => a.key - b.key || (a.c.id < b.c.id ? -1 : 1));
      list.forEach((x, i) => angle.set(x.c.id, sec.from + ((i + 0.5) * sec.w) / list.length));
    });
  }
  const ringLevels = levelsSorted.filter((l) => l >= 1);
  ringLevels.forEach((l) => placeRing(l, inner));
  for (let sweep = 0; sweep < 2; sweep++) {
    ringLevels.slice().reverse().forEach((l) => placeRing(l, (id) => outer(id).concat(inner(id))));
    ringLevels.forEach((l) => placeRing(l, (id) => inner(id).concat(outer(id))));
  }
  // prerequisites: evenly around their circle, so that chains among them such as ℕ → ℤ → ℚ → ℝ → ℂ stand next to each
  // other (user, 2 November 2026). Connected prerequisites form a block in the order of a depth-first walk along their
  // edges, starting from those without predecessors; blocks are ordered by the mean angle of the concepts using them.
  // Finally the whole sequence is turned (and possibly reversed) so that each prerequisite lies as close as possible
  // to the mean angle of the concepts that use it.
  const preList = conceptsAt(0);
  const preSet = new Set(preList.map((c) => c.id));
  const preEdges = usesEdges.filter((e) => preSet.has(e.from) && preSet.has(e.to));
  const userMean = new Map(preList.map((c) => [c.id, circMean(usesEdges.filter((e) => e.from === c.id && angle.has(e.to)).map((e) => angle.get(e.to)))]));
  const seen = new Set(), blocks = [];
  const sameOrigin = (a, b) => originOf(byId.get(a)) === originOf(byId.get(b));
  const walk = (id, block) => {
    if (seen.has(id)) return;
    seen.add(id); block.push(id);
    preEdges.filter((e) => e.from === id && sameOrigin(e.to, id)).forEach((e) => walk(e.to, block));
    preEdges.filter((e) => e.to === id && sameOrigin(e.from, id)).forEach((e) => walk(e.from, block));
  };
  preList.filter((c) => !preEdges.some((e) => e.to === c.id)).concat(preList).forEach((c) => {
    if (seen.has(c.id)) return;
    const block = [];
    walk(c.id, block);
    blocks.push(block);
  });
  // within a block: by depth along the edges among the prerequisites (ℕ 0, ℤ 1, ℚ 2, …), ties in the order of the walk
  const preDepth = new Map();
  const depthOfPre = (id) => {
    if (!preDepth.has(id)) preDepth.set(id, 1 + Math.max(-1, ...preEdges.filter((e) => e.to === id).map((e) => depthOfPre(e.from))));
    return preDepth.get(id);
  };
  blocks.forEach((b) => { const order = new Map(b.map((id, i) => [id, i])); b.sort((x, y) => depthOfPre(x) - depthOfPre(y) || order.get(x) - order.get(y)); });
  const blockAngle = (b) => circMean(b.map((id) => userMean.get(id)).filter((a) => a != null)) ?? 0;
  // the prerequisites of one origin stand together; origins ordered by the mean angle of their users
  const origins = [...new Set(preList.map(originOf))];
  const originAngle = (o) => blockAngle(preList.filter((c) => originOf(c) === o).map((c) => c.id));
  const sequence = origins.sort((x, y) => originAngle(x) - originAngle(y))
    .flatMap((o) => blocks.filter((b) => originOf(byId.get(b[0])) === o).sort((x, y) => blockAngle(x) - blockAngle(y)).flat());
  let bestFit = null;
  [1, -1].forEach((dir) => sequence.forEach((_, shift) => {
    const slot = (i) => START + (dir * (i + shift + 0.5) * TAU) / sequence.length;
    const cost = sequence.reduce((s, id, i) => s + (userMean.get(id) == null ? 0 : angDist(slot(i), userMean.get(id))), 0);
    if (!bestFit || cost < bestFit.cost) bestFit = { cost, slot };
  }));
  sequence.forEach((id, i) => angle.set(id, bestFit.slot(i)));

  const radiusOf = (c) => 6 + 2.4 * Math.sqrt(descendants(c.id).size);
  // Concepts stay inside their sector (user, 2 November 2026): on a ring they are already spread evenly over the
  // sector. Where the arc per concept is too short for the concepts and the gap, every second concept moves outward
  // by a part of the ring distance (staggered), instead of being pushed into the neighbouring sector.
  const radialShift = new Map();
  levelsSorted.filter((l) => l >= 1).forEach((l) => {
    sectorAreas.forEach((k) => {
      const list = conceptsAt(l).filter((c) => secKey(c) === k).sort((x, y) => angle.get(x.id) - angle.get(y.id));
      if (list.length < 2) return;
      const R = rowRadius.get(k + "|" + l);
      const others = [...rowRadius.entries()].filter(([key]) => key.startsWith(k + "|")).map(([, r]) => r).filter((r) => r !== R);
      const stepOut = Math.min(80, ...others.map((r) => Math.abs(r - R)));
      const arc = (sectors[k].w * R) / list.length;
      const need = list.reduce((sum, c) => sum + 2 * radiusOf(c), 0) / list.length + RING.gap;
      if (arc < need) list.forEach((c, j) => { if (j % 2) radialShift.set(c.id, 0.4 * stepOut); });
    });
  });
  // prerequisites (no sectors): push apart concepts that are too close on their circle (keeps the order)
  [0].filter((l) => levelsSorted.includes(l)).forEach((l) => {
    const R = RING.pre;
    const list = conceptsAt(l).map((c) => ({ id: c.id, a: angle.get(c.id), r: radiusOf(c) })).sort((x, y) => x.a - y.a);
    for (let it = 0; it < 200; it++) {
      let changed = false;
      for (let i = 0; i < list.length && list.length > 1; i++) {
        const p = list[i], q = list[(i + 1) % list.length];
        let gapA = q.a - p.a;
        if (i === list.length - 1) gapA += TAU;
        const need = (p.r + q.r + RING.gap) / R;
        if (gapA < need) { const d = (need - gapA) / 2; p.a -= d; q.a += d; changed = true; }
      }
      if (!changed) break;
    }
    list.forEach((x) => angle.set(x.id, x.a));
  });

  const points = concepts.map((c) => {
    const R = radiusFor(c) + (radialShift.get(c.id) || 0), a = angle.get(c.id) || 0;
    return { id: c.id, r: radiusOf(c), x: R * Math.cos(a), y: R * Math.sin(a) };
  });
  // Concepts of neighbouring rows in one sector can still overlap: push them apart along the circle (their radius stays),
  // without leaving the sector.
  {
    const own = points.filter((p) => level.get(p.id) >= 1 && p.id !== CENTRE_ID && sectors[secKey(byId.get(p.id))]);
    const polar = new Map(own.map((p) => [p.id, { r: Math.hypot(p.x, p.y), a: Math.atan2(p.y, p.x) }]));
    const clampA = (id, a) => {
      const sec = sectors[secKey(byId.get(id))], m = Math.min(0.02, sec.w / 4);
      const rel = (((a - sec.from) % TAU) + TAU) % TAU;
      if (rel <= sec.w - m && rel >= m) return a;
      return rel > sec.w - m && rel < sec.w + (TAU - sec.w) / 2 ? sec.from + sec.w - m : sec.from + m;
    };
    for (let round = 0; round < 100; round++) {
      let moved = false;
      for (let i = 0; i < own.length; i++) for (let j = i + 1; j < own.length; j++) {
        const p = own[i], q = own[j];
        if (secKey(byId.get(p.id)) !== secKey(byId.get(q.id))) continue;
        const P = polar.get(p.id), Q = polar.get(q.id);
        const d = Math.hypot(P.r * Math.cos(P.a) - Q.r * Math.cos(Q.a), P.r * Math.sin(P.a) - Q.r * Math.sin(Q.a)), need = p.r + q.r + 12;
        if (d >= need) continue;
        moved = true;
        const step = (need - d) / 2 / Math.max(80, (P.r + Q.r) / 2), sign = P.a <= Q.a ? 1 : -1;
        P.a = clampA(p.id, P.a - sign * step); Q.a = clampA(q.id, Q.a + sign * step);
      }
      if (!moved) break;
    }
    own.forEach((p) => { const P = polar.get(p.id); p.x = P.r * Math.cos(P.a); p.y = P.r * Math.sin(P.a); });
  }
  const pos = new Map(points.map((p) => [p.id, p]));

  // ------------------------------------------------------------ drawing
  svg.classList.add("ent-graph");
  svg.innerHTML = `<defs>
    <marker id="pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#a99e8c"/></marker>
    <marker id="pfeil-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#b5541f"/></marker>
    <marker id="pfeil-n" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#2f6f8f"/></marker>
  </defs>`;
  // sectors of the MSC classes as pale wedges with the name of the class outside the outermost ring
  const rIn = RING.inner - 50, rOut = R_OUT + 55;
  const gSectors = el("g", { class: "sektoren" }, svg);
  sectorAreas.forEach((k) => {
    const sec = sectors[k], a0 = sec.from + RING.sectorGap, a1 = sec.from + sec.w - RING.sectorGap;
    if (a1 <= a0) return;
    const P = (r, a) => `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    el("path", { d: `M${P(rIn, a0)}L${P(rOut, a0)}A${rOut},${rOut} 0 ${large} 1 ${P(rOut, a1)}L${P(rIn, a1)}A${rIn},${rIn} 0 ${large} 0 ${P(rIn, a0)}Z`, fill: k === OTHER ? "#b9ad9a" : COLORS[k] || "#ccc", class: "sektor" }, gSectors);
    const m = sec.mid, rT = rOut + 18, x = rT * Math.cos(m), y = rT * Math.sin(m);
    const t = el("text", { x: x.toFixed(1), y: (y + 4).toFixed(1), "text-anchor": Math.abs(Math.cos(m)) < 0.3 ? "middle" : Math.cos(m) > 0 ? "start" : "end", class: "sektor-name" }, gSectors);
    t.textContent = k === OTHER ? "Other classes" : D.areas[k];
    if (k === OTHER) el("title", {}, t).textContent = smallAreas.map((a) => D.areas[a]).join("\n");
  });
  // guide circle of the prerequisites (the levels have no global rings any more)
  const gRings = el("g", { class: "ringe" }, svg);
  const OUTSIDE = !!CFG.foreignOutside;
  if (levelsSorted.includes(0) && !OUTSIDE) {
    el("circle", { cx: 0, cy: 0, r: RING.pre, class: "ring" }, gRings);
    el("text", { x: 0, y: -RING.pre - 5, "text-anchor": "middle", class: "ring-name" }, gRings).textContent = "Prerequisites";
  }
  const gEdges = el("g", {}, svg), gNodes = el("g", {}, svg), gStubs = el("g", {}, svg);

  edges.forEach((e) => {
    e.line = el("line", { class: "kante " + e.kind + (e.transitive ? " transitiv" : "") + (e.pre ? " basis" : "") + (e.hub ? " hub" : ""), "marker-end": e.kind === "uses" ? "url(#pfeil)" : "" }, gEdges);
    if (OUTSIDE && e.pre && e.kind === "uses") {
      // arrow from outside: a small point in the colour of the origin next to the target, with the name of the result
      const c = byId.get(e.from);
      e.stub = el("g", { class: "stub" }, gStubs);
      e.stub.style.setProperty("--herkunft", colorOf(c));
      e.stubDot = el("circle", { r: 5 }, e.stub);
      e.stubText = el("text", {}, e.stub);
      e.stubText.textContent = c.name;
      el("title", {}, e.stub).textContent = c.name + " — " + originName(originOf(c));
      // a click keeps the point where it is and shows from there the arrows to all theorems using the result
      const stubClick = (ev) => { ev.preventDefault(); ev.stopPropagation(); anchor = { id: e.from, x: e.sx, y: e.sy, ux: e.ux, uy: e.uy }; step(e.from, "fwd"); };
      e.stub.addEventListener("click", stubClick);
      e.stub.addEventListener("contextmenu", stubClick);
    }
  });
  // position of the arrows from outside around their target (index among the arrows from outside of that target)
  const stubsOf = new Map();
  edges.filter((e) => e.stub).forEach((e) => { if (!stubsOf.has(e.to)) stubsOf.set(e.to, []); stubsOf.get(e.to).push(e); });
  let anchor = null; // { id, x, y, ux, uy }: clicked point of a result of another area
  let stubSelected = null; // selected concept, for render (which runs before the selection code is set up)
  // Arrows to other areas (user, 3 November 2026): for an own concept, the concepts of other folders (loaded through
  // `sources`) whose `uses` name it with this folder's prefix (setting `prefix`). Drawn from the concept to a small
  // point outside the circle in the colour of that area; a click opens it in its own graph.
  const outsOf = new Map();
  if (CFG.prefix) for (const [q, src] of Object.entries(CFG.sources || {})) {
    const d = asGraph(window[src.data]);
    if (!d) continue;
    d.concepts.forEach((t) => (t.uses || []).forEach((u) => {
      const [p, id] = u.split(":");
      if (p !== CFG.prefix || !byId.has(id) || isPre(id)) return;
      if (!outsOf.has(id)) outsOf.set(id, []);
      const o = { from: id, q, t, page: src.page + "#" + t.id, title: src.title };
      o.g = el("g", { class: "stub aus" }, gStubs);
      o.g.style.setProperty("--herkunft", ORIGIN_COLORS[q] || "#8a7f6e");
      o.line = el("line", { class: "kante aus-linie", "marker-end": "url(#pfeil)" }, o.g);
      o.dot = el("circle", { r: 5 }, o.g);
      o.text = el("text", {}, o.g);
      o.text.textContent = t.name;
      el("title", {}, o.g).textContent = t.name + " — " + src.title.replace(/^the /, "");
      o.g.addEventListener("click", (ev) => { ev.stopPropagation(); location.href = o.page; });
      outsOf.get(id).push(o);
    }));
  }

  const shape = (g, kind0, r, fill) => {
    const s = { class: "form", fill }, kind = (CFG.shapes || {})[kind0] || kind0;
    if (kind === "konstruktion") return el("rect", { ...s, x: -r * 0.88, y: -r * 0.88, width: r * 1.76, height: r * 1.76, rx: 2 }, g);
    if (kind === "invariante") return el("path", { ...s, d: `M0,${-r * 1.2}L${r * 1.2},0L0,${r * 1.2}L${-r * 1.2},0Z` }, g);
    if (kind === "eigenschaft") return el("path", { ...s, d: `M0,${-r * 1.2}L${r * 1.1},${r * 0.8}L${-r * 1.1},${r * 0.8}Z` }, g);
    if (kind === "morphismus") {
      const pts = [0, 1, 2, 3, 4, 5].map((i) => { const a = (Math.PI / 3) * i; return `${r * 1.05 * Math.cos(a)},${r * 1.05 * Math.sin(a)}`; });
      return el("polygon", { ...s, points: pts.join(" ") }, g);
    }
    return el("circle", { ...s, r }, g);
  };

  const nodeEls = new Map();
  let nodeDrag = null; // { p, moved }
  concepts.forEach((c) => {
    const p = pos.get(c.id);
    const g = el("g", { class: "knoten" + (c.area === FOREIGN ? " fremd" + (OUTSIDE ? " aussen" : "") : "") }, gNodes);
    // prerequisites: light fill with a thick border in the colour of their origin, unlike the filled own concepts
    shape(g, c.kind, p.r, c.area === FOREIGN ? "#fbfaf6" : colorOf(c));
    if (c.area === FOREIGN) g.style.setProperty("--herkunft", colorOf(c));
    const t = el("text", { x: 0, y: p.r + 13, "text-anchor": "middle" }, g);
    t.textContent = c.name;
    el("title", {}, g).textContent = c.name + " — " + (KIND_LABEL[c.kind] || c.kind) + ", " + (c.msc5 || c.msc.join(", "));
    g.addEventListener("mouseenter", () => { if (!nodeDrag) hover(c.id); });
    g.addEventListener("mouseleave", () => { if (!nodeDrag) hover(null); });
    g.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0) return;
      ev.stopPropagation();
      nodeDrag = { p, moved: false, x: ev.clientX, y: ev.clientY };
    });
    g.addEventListener("click", (ev) => { ev.stopPropagation(); if (justDragged) { justDragged = false; return; } if (ev.detail > 1) return; step(c.id, "back"); });
    g.addEventListener("contextmenu", (ev) => { ev.preventDefault(); ev.stopPropagation(); if (justDragged) { justDragged = false; return; } step(c.id, "fwd"); });
    nodeEls.set(c.id, g);
  });

  function render() {
    points.forEach((p) => nodeEls.get(p.id).setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`));
    outsOf.forEach((list, id) => {
      const a = pos.get(id), RS = rOut + 14, d0 = Math.hypot(a.x, a.y), base = d0 > 1 ? Math.atan2(a.y, a.x) : -Math.PI / 2;
      const before = (stubsOf.get(id) || []).length, n = before + list.length;
      list.forEach((o, j) => {
        const ang = base + (before + j - (n - 1) / 2) * (24 / RS), ux = Math.cos(ang), uy = Math.sin(ang), sx = RS * ux, sy = RS * uy;
        const lx = sx - a.x, ly = sy - a.y, ld = Math.hypot(lx, ly) || 1;
        o.dot.setAttribute("cx", sx.toFixed(1)); o.dot.setAttribute("cy", sy.toFixed(1));
        o.text.setAttribute("x", (sx + ux * 9).toFixed(1)); o.text.setAttribute("y", (sy + uy * 9 + 3).toFixed(1));
        o.text.setAttribute("text-anchor", ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle");
        o.line.setAttribute("x1", (a.x + (lx / ld) * a.r).toFixed(1)); o.line.setAttribute("y1", (a.y + (ly / ld) * a.r).toFixed(1));
        o.line.setAttribute("x2", (sx - (lx / ld) * 7).toFixed(1)); o.line.setAttribute("y2", (sy - (ly / ld) * 7).toFixed(1));
      });
    });
    edges.forEach((e) => {
      if (e.stub) {
        // outside the circle of sectors, at the angle of the target; several results of other areas used by the same
        // theorem side by side along the circle (user, 3 November 2026)
        const b = pos.get(e.to), list = stubsOf.get(e.to), k = list.indexOf(e), d0 = Math.hypot(b.x, b.y);
        const RS = rOut + 14, base = d0 > 1 ? Math.atan2(b.y, b.x) : -Math.PI / 2, ang = base + (k - (list.length - 1) / 2) * (24 / RS);
        let ux = Math.cos(ang), uy = Math.sin(ang), sx = RS * ux, sy = RS * uy;
        e.sx = sx; e.sy = sy; e.ux = ux; e.uy = uy;
        // the selected result of another area: all its arrows start at the point that was clicked
        const anchored = OUTSIDE && stubSelected === e.from;
        if (anchored) {
          const first = edges.find((x) => x.stub && x.from === e.from);
          const A = anchor && anchor.id === e.from ? anchor : { x: first.sx, y: first.sy, ux: first.ux, uy: first.uy };
          sx = A.x; sy = A.y; ux = A.ux; uy = A.uy;
          e.stub.classList.toggle("nur-linie", first !== e);
        } else e.stub.classList.remove("nur-linie");
        const lx = b.x - sx, ly = b.y - sy, ld = Math.hypot(lx, ly) || 1;
        e.stubDot.setAttribute("cx", sx.toFixed(1)); e.stubDot.setAttribute("cy", sy.toFixed(1));
        e.stubText.setAttribute("x", (sx + ux * 9).toFixed(1)); e.stubText.setAttribute("y", (sy + uy * 9 + 3).toFixed(1));
        e.stubText.setAttribute("text-anchor", ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle");
        e.line.setAttribute("x1", (sx + (lx / ld) * 5).toFixed(1)); e.line.setAttribute("y1", (sy + (ly / ld) * 5).toFixed(1));
        e.line.setAttribute("x2", (b.x - (lx / ld) * (b.r + 2)).toFixed(1)); e.line.setAttribute("y2", (b.y - (ly / ld) * (b.r + 2)).toFixed(1));
        return;
      }
      const a = pos.get(e.from), b = pos.get(e.to);
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      e.line.setAttribute("x1", (a.x + (dx / d) * a.r).toFixed(1));
      e.line.setAttribute("y1", (a.y + (dy / d) * a.r).toFixed(1));
      e.line.setAttribute("x2", (b.x - (dx / d) * (b.r + 2)).toFixed(1));
      e.line.setAttribute("y2", (b.y - (dy / d) * (b.r + 2)).toFixed(1));
    });
  }

  // ------------------------------------------------------------ view box, pan and zoom
  // The whole view shows the full circle with the names of the sectors (wider than high, because the names stand to
  // the left and right) and every concept, also one dragged outside.
  const fit = () => {
    const R = rOut + 30, side = 330, pad = 40;
    const xs = points.map((p) => p.x).concat([-R - side, R + side]), ys = points.map((p) => p.y).concat([-R - pad, R + pad]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  };
  let view = fit();
  const applyView = () => svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  applyView();
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const box = svg.parentNode;
  const scale = () => Math.max(view.w / svg.clientWidth, view.h / svg.clientHeight);
  const toGraph = (ev) => {
    const m = svg.getScreenCTM().inverse(), pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(m);
  };
  svg.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const f = ev.deltaY > 0 ? 1.15 : 1 / 1.15, rect = svg.getBoundingClientRect(), s = scale();
    const cx = view.x + view.w / 2 + (ev.clientX - rect.left - rect.width / 2) * s;
    const cy = view.y + view.h / 2 + (ev.clientY - rect.top - rect.height / 2) * s;
    view = { x: cx - (cx - view.x) * f, y: cy - (cy - view.y) * f, w: view.w * f, h: view.h * f };
    applyView();
  }, { passive: false });
  let drag = null, moved = false, justDragged = false;
  svg.addEventListener("pointerdown", (ev) => { if (ev.button === 0) { drag = { x: ev.clientX, y: ev.clientY, v: { ...view } }; moved = false; } });
  window.addEventListener("pointermove", (ev) => {
    if (nodeDrag) {
      if (Math.abs(ev.clientX - nodeDrag.x) + Math.abs(ev.clientY - nodeDrag.y) > 3) nodeDrag.moved = true;
      if (!nodeDrag.moved) return;
      const q = toGraph(ev);
      nodeDrag.p.x = q.x; nodeDrag.p.y = q.y;
      box.classList.add("dragging");
      render();
      return;
    }
    if (!drag) return;
    const s = scale(), dx = (ev.clientX - drag.x) * s, dy = (ev.clientY - drag.y) * s;
    if (Math.abs(dx) + Math.abs(dy) > 2) { moved = true; box.classList.add("dragging"); }
    if (!moved) return;
    view = { ...drag.v, x: drag.v.x - dx, y: drag.v.y - dy };
    applyView();
  });
  window.addEventListener("pointerup", () => {
    if (nodeDrag) {
      justDragged = nodeDrag.moved;
      nodeDrag = null;
    }
    drag = null;
    box.classList.remove("dragging");
  });
  svg.addEventListener("click", () => { if (justDragged) { justDragged = false; return; } if (!moved) select(null); });
  svg.addEventListener("contextmenu", (ev) => ev.preventDefault());

  render();

  // ------------------------------------------------------------ hover and selection
  let selected = null;
  function clearMarks() {
    svg.classList.remove("fokus");
    svg.querySelectorAll(".hell, .vorfahr, .nachfahr, .gewaehlt").forEach((x) => x.classList.remove("hell", "vorfahr", "nachfahr", "gewaehlt"));
    usesEdges.forEach((e) => e.line.setAttribute("marker-end", "url(#pfeil)"));
  }
  // Clicks as on the maps (user, 3 November 2026): a click shows the direct prerequisites, every further click on the
  // same point one step more (indirect prerequisites), until all are shown; the next click ends the selection. A right
  // click does the same for the consequences. Prerequisites brown, consequences blue.
  const backOf = (x) => (byId.get(x).uses || []).concat(byId.get(x).isA || []).filter((t) => byId.has(t));
  const fwdOf = (x) => usedBy.get(x).concat(isaEdges.filter((e) => e.to === x).map((e) => e.from));
  const within = (id, next, k) => {
    const seen = new Set();
    let frontier = [id];
    for (let d = 0; d < k && frontier.length; d++) {
      const nf = [];
      frontier.forEach((x) => next(x).forEach((y) => { if (y !== id && !seen.has(y)) { seen.add(y); nf.push(y); } }));
      frontier = nf;
    }
    return seen;
  };
  const maxDepth = (id, dir) => { let k = 0, n = 0; for (;;) { const m = within(id, dir === "fwd" ? fwdOf : backOf, k + 1).size; if (m === n) return k; n = m; k++; } };
  let selDir = "back", selDepth = 1;
  function step(id, dir) {
    if (OUTSIDE && isPre(id)) dir = "fwd"; // a result of another area has only consequences here
    if (id === selected && dir === selDir) {
      if (selDepth >= maxDepth(id, dir)) { select(null); return; }
      selDepth++;
    } else { selDir = dir; selDepth = Math.min(1, maxDepth(id, dir)); }
    select(id);
  }
  function mark(id, dir, depth) {
    clearMarks();
    if (!id) return;
    svg.classList.add("fokus");
    const out = dir === "fwd";
    const up = out ? new Set() : within(id, backOf, depth);
    const down = !out ? new Set() : within(id, fwdOf, depth);
    const deep = true;
    nodeEls.get(id).classList.add("hell", "gewaehlt");
    up.forEach((x) => nodeEls.get(x).classList.add("hell", "vorfahr"));
    down.forEach((x) => nodeEls.get(x).classList.add("hell", "nachfahr"));
    edges.forEach((e) => {
      const isUp = (e.to === id || up.has(e.to)) && up.has(e.from) && (deep || e.to === id || e.from === id);
      const isDown = (e.from === id || down.has(e.from)) && down.has(e.to) && (deep || e.from === id || e.to === id);
      const direct = e.from === id || e.to === id;
      // indirect dependencies stay hidden also for a selected concept (user, 3 November 2026); switch "indirect dependencies"
      if (e.kind === "uses" && e.transitive) return;
      if (e.kind === "uses" && isUp) { e.line.classList.add("hell", "vorfahr"); e.line.setAttribute("marker-end", "url(#pfeil-v)"); }
      else if (e.kind === "uses" && isDown) { e.line.classList.add("hell", "nachfahr"); e.line.setAttribute("marker-end", "url(#pfeil-n)"); }
      else if (e.kind === "isa" && (out ? e.to === id : e.from === id)) e.line.classList.add("hell");
    });
    edges.forEach((e) => { if (e.stub) ["hell", "vorfahr", "nachfahr"].forEach((k) => e.stub.classList.toggle(k, e.line.classList.contains(k))); });
    (outsOf.get(id) || []).forEach((o) => o.g.classList.add("hell"));
  }
  function hover(id) { if (id) mark(id, "back", 1); else mark(selected, selDir, selDepth); }

  const chip = (id) => `<span class="chip" data-id="${id}">${byId.get(id).name}</span>`;
  function select(id) {
    selected = id && byId.has(id) ? id : null;
    if (!selected || !anchor || anchor.id !== selected) anchor = anchor && anchor.id === selected ? anchor : null;
    stubSelected = selected;
    if (OUTSIDE) render();
    if (found && found !== selected) markFound(null);
    mark(selected, selDir, selDepth);
    applyLevels();
    if (location.hash.slice(1) !== (selected || "")) history.replaceState(null, "", selected ? "#" + selected : location.pathname + location.search);
    if (!selected) { panel.innerHTML = overview(); return; }
    const c = byId.get(selected);
    const generalisations = c.isA || [];
    const special = isaEdges.filter((e) => e.to === c.id).map((e) => e.from);
    const md = maxDepth(c.id, selDir);
    const stepNote = `<p class="meta schritt">${selDir === "fwd" ? "Consequences" : "Prerequisites"}: ${md ? `step ${selDepth} of ${md}; click again for ${selDepth < md ? "the next step" : "no selection"}` : "none in this graph"}. ${selDir === "fwd" ? "Left click: prerequisites." : "Right click: consequences."}</p>`;
    panel.innerHTML = `<h2>${c.name}</h2>${stepNote}
      <div class="meta">${KIND_LABEL[c.kind] || c.kind} · ${c.area === FOREIGN ? "MSC " + c.msc.join(", ") + " (" + CFG.foreignLabel + ")" : D.areas[c.area]}</div>
      ${c.foreign ? `<p class="meta">${WORDS.homeVerb} in <a href="${c.foreign.home}">${c.foreign.title}</a>; its own dependencies are shown there.</p>` : ""}
      ${c.formula && window.katex ? `<div class="formel">${tex(c.formula)}</div>` : ""}
      <p>${c.text || ""}</p>
      ${c.who || c.year ? `<p class="meta">${[c.who, c.year < 0 ? -c.year + " BC" : c.year].filter(Boolean).join(", ")}</p>` : ""}
      ${c.proof ? `<h3>Proof idea</h3><p>${c.proof}</p>` : ""}
      ${statementConcepts(c)}
      ${focusView(c.id)}
      <h3>${WORDS.usesHead}</h3><p>${(c.uses || []).length ? c.uses.map(chip).join("") : "—"}</p>
      <h3>${WORDS.usedByHead}</h3><p>${usedBy.get(c.id).length ? usedBy.get(c.id).map(chip).join("") : "—"}</p>
      ${(outsOf.get(c.id) || []).length ? `<h3>Used in other areas</h3><p>${outsOf.get(c.id).map((o) => `<a class="chip" href="${o.page}" title="${o.title}">${o.t.name}</a>`).join("")}</p>` : ""}
      ${generalisations.length ? `<h3>Is a special case of</h3><p>${generalisations.map(chip).join("")}</p>` : ""}
      ${special.length ? `<h3>Special cases</h3><p>${special.map(chip).join("")}</p>` : ""}
      <p class="meta">Depends on ${ancestors(c.id).size} ${WORDS.many}; ${descendants(c.id).size} ${WORDS.many} depend on it.</p>`;
  }
  // concepts occurring in the statement of a theorem, as links into the concept graphs (field `concepts`)
  function statementConcepts(c) {
    const S = CFG.conceptSources;
    if (!S || !(c.concepts || []).length) return "";
    const links = c.concepts.map((ref) => {
      const [p, id] = ref.includes(":") ? ref.split(":") : ["", ref];
      const src = S[p], data = src && window[src.data], hit = data && data.concepts.find((x) => x.id === id);
      return hit ? `<a class="chip" href="${src.page}#${id}">${hit.name}</a>` : "";
    }).join("");
    return links ? `<h3>Concepts in the statement</h3><p>${links}</p>` : "";
  }
  panel.addEventListener("click", (ev) => { const t = ev.target.closest("[data-id]"); if (t) { selected = null; step(t.dataset.id, "back"); } });

  // ------------------------------------------------------------ side view: the definitions a concept builds on
  // Small layered graph in the panel: the selected concept and all its predecessors along `uses`, one row per depth
  // within these concepts (top: concepts without predecessors, bottom: the concept); the depth counts prerequisites
  // too, unlike the level. Indirect dependencies are left out; edges from prerequisites are drawn. The order within
  // the rows comes from GL.layers (barycentre method, columns of GL.layers are the rows here); the horizontal
  // positions are computed here (see below).
  // Only predecessors (user, 2 November 2026). A click on a box selects that concept.
  function focusView(id) {
    // Only what belongs to the definition (user, 3 November 2026): the concepts of the area it builds on, and of the
    // prerequisites only those the definition itself names, not those reached through other concepts (prime ideal
    // through spectrum for points).
    const own = (byId.get(id).uses || []).filter((t) => byId.has(t));
    const ids = [...ancestors(id)].filter((x) => !isPre(x) || own.includes(x)).concat([id]);
    if (ids.length < 2) return "";
    const set = new Set(ids);
    const fEdges = usesEdges.filter((e) => set.has(e.from) && set.has(e.to) && !e.transitive);
    const depth = new Map();
    const depthOf = (x) => {
      if (!depth.has(x)) depth.set(x, Math.max(-1, ...fEdges.filter((e) => e.to === x).map((e) => depthOf(e.from))) + 1);
      return depth.get(x);
    };
    ids.forEach(depthOf);
    const rows = [...new Set(depth.values())].sort((a, b) => a - b);
    const rowOf = (x) => rows.indexOf(depth.get(x));
    const BW = 112, BH = 34, GAP = 10, ROWH = 64, M = 6;
    const lay = GL.layers(ids, rowOf, fEdges, { BH: BW, GAP_N: GAP, GAP_W: 6, MARGIN: M, HEAD: 0, ROUNDS: 40 });
    // Horizontal positions: GL.layers gives only the order within each row. Every box is placed below the mean of
    // its predecessors (waypoints of long edges straight below theirs), then boxes in a row that overlap are pushed
    // apart symmetrically, keeping the order. Rows without predecessors are centred.
    const wOf = (it) => (it.kind === "knoten" ? BW : 0);
    const sep = (a, b) => (wOf(a) + wOf(b)) / 2 + (a.kind === "knoten" && b.kind === "knoten" ? GAP : 10);
    lay.columns.forEach((row) => {
      row.forEach((it, i) => {
        it.cx = it.links.length ? it.links.reduce((a, q) => a + q.cx, 0) / it.links.length : (i - (row.length - 1) / 2) * (BW + GAP);
      });
      for (let round = 0; round < 50; round++) {
        let moved = false;
        for (let i = 1; i < row.length; i++) {
          const d = row[i - 1].cx + sep(row[i - 1], row[i]) - row[i].cx;
          if (d > 0.01) { row[i - 1].cx -= d / 2; row[i].cx += d / 2; moved = true; }
        }
        if (!moved) break;
      }
    });
    const all = lay.columns.flat();
    const minX = Math.min(...all.map((it) => it.cx - wOf(it) / 2)), maxX = Math.max(...all.map((it) => it.cx + wOf(it) / 2));
    all.forEach((it) => { it.cx += M - minX; });
    const W = maxX - minX + 2 * M, H = rows.length * ROWH - (ROWH - BH) + 2 * M;
    const yOf = (it) => M + it.c * ROWH;
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, style: "max-width:100%;height:auto", class: "fokus-ansicht", role: "img", "aria-label": WORDS.buildsOn });
    el("defs", {}, s).innerHTML = `<marker id="fpfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10Z" fill="#8a7f6e"/></marker>`;
    lay.chains.forEach(({ chain }) => {
      const pts = chain.map((it, i) => it.kind === "knoten"
        ? [it.cx, yOf(it) + (i === 0 ? BH : 0)]
        : [it.cx, yOf(it) + BH / 2]);
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], m = (y0 + y1) / 2;
        d += `C${x0},${m} ${x1},${m} ${x1},${y1 - (i === pts.length - 1 ? 2 : 0)}`;
      }
      el("path", { d, class: "fokus-kante", "marker-end": "url(#fpfeil)" }, s);
    });
    ids.forEach((x) => {
      const it = lay.item[x], c = byId.get(x);
      const g = el("g", { class: "fokus-knoten" + (x === id ? " ziel" : ""), "data-id": x, transform: `translate(${it.cx - BW / 2},${yOf(it)})` }, s);
      el("rect", c.area === FOREIGN ? { width: BW, height: BH, rx: 4, style: `fill:#fbfaf6;fill-opacity:1;stroke:${colorOf(c)};stroke-width:2.6` } : { width: BW, height: BH, rx: 4, fill: colorOf(c) }, g);
      const lines = GL.textLines(c.name, 16, 2);
      lines.forEach((t, i) => {
        el("text", { x: BW / 2, y: BH / 2 + (i - (lines.length - 1) / 2) * 12 + 4, "text-anchor": "middle" }, g).textContent = t;
      });
      el("title", {}, g).textContent = c.name + " — level " + level.get(x);
    });
    return `<h3>Builds on (${ids.length - 1} ${WORDS.many})</h3>` + s.outerHTML;
  }


  function overview() {
    const top = concepts.map((c) => [c, descendants(c.id).size]).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return `<h2>${D.title}</h2>
      <p class="meta">${concepts.length} ${WORDS.many}, ${usesEdges.length} ${WORDS.edges}${isaEdges.length ? `, ${isaEdges.length} “is a” relations` : ""}.</p>
      <h3>Most used ${WORDS.many}</h3><p>${top.map(([c, n]) => chip(c.id) + `<span class="meta">${n}</span> `).join("")}</p>
      <p class="meta">The contents were compiled with the help of a language model and have not been checked by a specialist.</p>`;
  }

  // ------------------------------------------------------------ legend and controls (sidebar, collapsible blocks)
  const kindSvg = (kind) => {
    const s = el("svg", { width: 18, height: 18, viewBox: "-9 -9 18 18", class: "form" });
    shape(s, kind, 6, "#fbfaf6").setAttribute("style", "stroke:#4b443b;stroke-width:1");
    return s.outerHTML;
  };
  const levels = [...new Set(level.values())].sort((a, b) => a - b);
  const countAt = (l) => concepts.filter((c) => level.get(c.id) === l).length;
  const lineSvg = (attrs) => `<svg width="26" height="10" class="form"><line x1="1" y1="5" x2="23" y2="5" ${attrs}/></svg>`;
  const block = (title, items, o = {}) =>
    `<details class="block"${o.closed ? "" : " open"}><summary class="block-titel">${title}</summary>` +
    `<div class="eintraege${o.cls ? " " + o.cls : ""}">${items.join("")}</div></details>`;
  document.getElementById("legend").innerHTML =
    block("Colour: MSC class", areaKeys.filter((k) => k !== FOREIGN).map((k) => `<span><i style="background:${COLORS[k]}"></i>${D.areas[k]}</span>`), { closed: true }) +
    block("Prerequisites: origin", [...new Set(concepts.filter((c) => c.area === FOREIGN).map(originOf))].map((o) => `<span><i style="background:#fbfaf6;border:3px solid ${ORIGIN_COLORS[o] || "#d9d4ca"}"></i>${originName(o)}</span>`), { closed: true }) +
    block("Shape: kind", Object.keys(D.kinds).map((k) => `<span>${kindSvg(k)}${D.kinds[k]}</span>`), { cls: "zweispaltig", closed: true }) +
    block("Lines and sizes", [
      `<span>${lineSvg('stroke="#a99e8c" stroke-width="1.3" marker-end="url(#pfeil)"')}${WORDS.arrow}</span>`,
      isaEdges.length ? `<span>${lineSvg('stroke="#7a5aa0" stroke-width="1.3" stroke-dasharray="5 4"')}B is a special case of A</span>` : "",
      `<span><svg width="26" height="14" class="form"><circle cx="13" cy="7" r="5" fill="#fbfaf6" stroke="#8a7f6e" stroke-width="2.6"/></svg>${CFG.foreignLabel}</span>`,
      `<span><svg width="26" height="14" class="form"><circle cx="6" cy="7" r="2.5" fill="#ccc" stroke="#4b443b"/><circle cx="18" cy="7" r="5.5" fill="#ccc" stroke="#4b443b"/></svg>size: ${WORDS.many} depending on it</span>`,
      `<span class="hinweis">Hidden unless selected or switched on: “is a”, indirect dependencies (A → C when C uses B and B depends on A), arrows from other areas${Object.keys(HUBS).filter((h) => byId.has(h)).map((h) => " and from " + byId.get(h).name).join("")}.</span>`,
    ], { closed: true });
  document.getElementById("controls").innerHTML =
    block("Display", [
      `<label class="toggle"${isaEdges.length ? "" : ' style="display:none"'}><input type="checkbox" id="c-isa"><span class="regler"></span>all “is a” relations</label>`,
      `<label class="toggle"><input type="checkbox" id="c-trans"><span class="regler"></span>indirect dependencies</label>`,
      `<label class="toggle"><input type="checkbox" id="c-basis"><span class="regler"></span>arrows from other areas</label>`,
      ...(outsOf.size ? [`<label class="toggle"><input type="checkbox" id="c-aus"><span class="regler"></span>arrows to other areas</label>`] : []),
      ...Object.keys(HUBS).filter((h) => byId.has(h)).map((h) => `<label class="toggle"><input type="checkbox" class="c-hub"><span class="regler"></span>edges from ${byId.get(h).name}</label>`),
      `<label class="toggle"><input type="checkbox" id="c-names" checked><span class="regler"></span>names</label>`,
      `<button id="c-home">Reset view</button>`,
    ]) +
    // levels in two columns, filled column by column (1 … 5 left, 6 … 10 right)
    block("Levels", [
      `<div class="spalten" style="grid-template-rows:repeat(${Math.ceil(levels.length / 2)},auto)">` + levels.filter((l) => !(OUTSIDE && l === 0)).map((l) =>
        `<label class="toggle" title="${countAt(l)} ${countAt(l) === 1 ? WORDS.one : WORDS.many}"><input type="checkbox" data-level="${l}" checked><span class="regler"></span>${l === 0 ? "prereq." : l} <span class="meta">(${countAt(l)})</span></label>`).join("") + "</div>",
      `<span class="hinweis">${WORDS.levelHint}</span>`,
    ]);
  const shownLevels = new Set(levels);
  // The level switches act only while nothing is selected (user, 3 November 2026)
  function applyLevels() {
    const on = (l) => !!selected || shownLevels.has(l);
    concepts.forEach((c) => { nodeEls.get(c.id).style.display = on(level.get(c.id)) ? "" : "none"; });
    edges.forEach((e) => { e.line.style.display = on(level.get(e.from)) && on(level.get(e.to)) ? "" : "none"; if (e.stub) e.stub.style.display = e.line.style.display; });
    outsOf.forEach((list, id) => list.forEach((o) => { o.g.style.display = on(level.get(id)) ? "" : "none"; }));
  }
  // Hiding a level hides all higher levels, showing a level shows all lower levels (user, 2 November 2026), so that the
  // shown levels are always 0 … k.
  const levelBoxes = [...document.querySelectorAll("#controls input[data-level]")];
  levelBoxes.forEach((box) => box.addEventListener("change", () => {
    const l = Number(box.dataset.level);
    levelBoxes.forEach((other) => {
      const m = Number(other.dataset.level);
      if (box.checked && m < l) other.checked = true;
      if (!box.checked && m > l) other.checked = false;
    });
    shownLevels.clear();
    levelBoxes.filter((b) => b.checked).forEach((b) => shownLevels.add(Number(b.dataset.level)));
    applyLevels();
  }));
  document.getElementById("c-isa").addEventListener("change", (ev) => svg.classList.toggle("zeige-isa", ev.target.checked));
  document.getElementById("c-trans").addEventListener("change", (ev) => svg.classList.toggle("zeige-transitiv", ev.target.checked));
  document.getElementById("c-basis").addEventListener("change", (ev) => svg.classList.toggle("zeige-basis", ev.target.checked));
  if (document.getElementById("c-aus")) document.getElementById("c-aus").addEventListener("change", (ev) => svg.classList.toggle("zeige-aus", ev.target.checked));
  document.querySelectorAll("#controls .c-hub").forEach((box) => box.addEventListener("change", () => svg.classList.toggle("zeige-hub", box.checked)));
  document.getElementById("c-names").addEventListener("change", (ev) => svg.classList.toggle("ohne-namen", !ev.target.checked));
  document.getElementById("c-home").addEventListener("click", () => { view = fit(); applyView(); });

  // ------------------------------------------------------------ search
  // Matches the name (case and accents ignored, every typed word must occur); hits are marked in the graph while
  // typing. Arrow keys move in the list, Enter or a click selects the concept and moves it into the middle of the view.
  const searchBox = document.getElementById("search"), resultList = document.getElementById("search-results");
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/<[^>]+>/g, "").toLowerCase();
  let hits = [], active = 0;
  function centerOn(id, zoom) {
    const p = pos.get(id);
    if (zoom) {
      // half width: farthest predecessor plus margin, at least a fifth of the whole graph
      const all = fit(), reach = Math.max(...[...ancestors(id)].map((a) => { const q = pos.get(a); return Math.max(Math.abs(q.x - p.x), Math.abs(q.y - p.y)); }), 0);
      const half = Math.max(reach + 80, Math.max(all.w, all.h) / 10);
      view = { x: p.x - half, y: p.y - half, w: 2 * half, h: 2 * half };
    } else view = { ...view, x: p.x - view.w / 2, y: p.y - view.h / 2 };
    applyView();
  }
  let found = null;
  function markFound(id) {
    if (found) { const old = nodeEls.get(found).querySelector(".halo"); if (old) old.remove(); }
    found = id;
    if (!id) return;
    const g = nodeEls.get(id);
    g.insertBefore(el("circle", { r: pos.get(id).r + 10, class: "halo" }), g.firstChild);
  }
  function showHits() {
    const words = norm(searchBox.value).split(/\s+/).filter(Boolean);
    nodeEls.forEach((g) => g.classList.remove("treffer"));
    if (!words.length) { hits = []; resultList.innerHTML = ""; svg.classList.remove("suchend"); return; }
    hits = concepts.filter((c) => { const n = norm(c.name + " " + c.id.replace(/-/g, " ")); return words.every((w) => n.includes(w)); })
      .sort((a, b) => norm(a.name).indexOf(words[0]) - norm(b.name).indexOf(words[0]) || a.name.localeCompare(b.name));
    active = 0;
    hits.forEach((c) => nodeEls.get(c.id).classList.add("treffer"));
    svg.classList.toggle("suchend", hits.length > 0);
    resultList.innerHTML = hits.length
      ? hits.slice(0, 10).map((c, i) => `<li role="option" data-id="${c.id}" class="${i === active ? "aktiv" : ""}"><i style="background:${colorOf(c)}"></i>${c.name}<span class="meta">L${level.get(c.id)}</span></li>`).join("")
      : `<li class="meta">no ${WORDS.one} found</li>`;
  }
  function choose(id) {
    if (!id) return;
    searchBox.value = "";
    showHits();
    selected = null; step(id, "back");
    markFound(id);
    centerOn(id, true);
  }
  searchBox.addEventListener("input", showHits);
  searchBox.addEventListener("keydown", (ev) => {
    const items = [...resultList.querySelectorAll("li[data-id]")];
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!items.length) return;
      active = (active + (ev.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      items.forEach((li, i) => li.classList.toggle("aktiv", i === active));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (items[active]) choose(items[active].dataset.id);
    } else if (ev.key === "Escape") {
      searchBox.value = "";
      showHits();
    }
  });
  resultList.addEventListener("mousedown", (ev) => { const li = ev.target.closest("li[data-id]"); if (li) { ev.preventDefault(); choose(li.dataset.id); } });
  searchBox.addEventListener("blur", () => setTimeout(() => { resultList.innerHTML = ""; }, 100));
  searchBox.addEventListener("focus", () => { if (searchBox.value) showHits(); });

  // ------------------------------------------------------------ explanation on demand
  const about = document.getElementById("about");
  const openAbout = () => { about.hidden = false; document.getElementById("about-close").focus(); };
  const closeAbout = () => { about.hidden = true; document.getElementById("about-open").focus(); };
  document.getElementById("about-open").addEventListener("click", openAbout);
  document.getElementById("about-close").addEventListener("click", closeAbout);
  about.addEventListener("click", (ev) => { if (ev.target === about) closeAbout(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !about.hidden) closeAbout(); });

  window.addEventListener("hashchange", () => select(decodeURIComponent(location.hash.slice(1))));
  select(decodeURIComponent(location.hash.slice(1)));
  // for tests: concepts whose angle lies outside the sector of their class (concepts of level 1 and higher)
  const outsideSectors = () => concepts.filter((c) => level.get(c.id) >= 1 && c.id !== CENTRE_ID && sectors[secKey(c)]).filter((c) => {
    const p = pos.get(c.id), sec = sectors[secKey(c)];
    const rel = (((Math.atan2(p.y, p.x) - sec.from) % TAU) + TAU) % TAU;
    return rel > sec.w;
  }).map((c) => c.id);
  const edgeLength = () => layoutEdges.reduce((sum, e) => sum + Math.hypot(pos.get(e.from).x - pos.get(e.to).x, pos.get(e.from).y - pos.get(e.to).y), 0);
  window.CONCEPT_GRAPH = { positions: pos, level, select, centerOn, outsideSectors, edgeLength, circleRadius: rOut, isSettled: () => true };
})();
