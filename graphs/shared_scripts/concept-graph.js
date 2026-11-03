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
  // Theorems: `premises` and `proof` are the standard proof (name in `proofName`), `alternativeProofs` further proofs
  // ({ name, premises, idea, year, who }), as on the maps (user, 3 November 2026). The graph uses the standard proof.
  const asGraph = (d) => (!d || d.concepts ? d : { ...d, concepts: d.theorems.map((t) => ({ ...t, uses: t.premises || [] })) });
  // Concepts likewise (user, 3 November 2026): `uses` is the standard definition (name in `definitionName`),
  // `alternativeDefinitions` further equivalent definitions ({ name, uses, formula, text }).
  const proofsOf = (c) => {
    if ((c.alternativeDefinitions || []).length || c.definitionName)
      return [{ name: c.definitionName || "Standard definition", premises: c.uses || [], idea: "" }]
        .concat((c.alternativeDefinitions || []).map((d) => ({ name: d.name, premises: d.uses || [], idea: d.text || "", formula: d.formula })));
    return c.premises || c.proof || (c.alternativeProofs || []).length
      ? [{ name: c.proofName || "Standard proof", premises: c.premises || [], idea: c.proof || "", year: c.proofYear, who: c.proofWho }].concat(c.alternativeProofs || [])
      : [];
  };
  const OWN = asGraph(window[CFG.data]);
  // names for SVG text: <sup>/<sub> as Unicode superscripts and subscripts where they exist, other tags removed
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻", "−": "⁻", n: "ⁿ", i: "ⁱ", d: "ᵈ", k: "ᵏ", m: "ᵐ", p: "ᵖ", e: "ᵉ", r: "ʳ", x: "ˣ", "*": "*" };
  const SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", "+": "₊", "-": "₋", "−": "₋", n: "ₙ", k: "ₖ", p: "ₚ", i: "ᵢ", m: "ₘ", e: "ₑ", x: "ₓ" };
  const conv = (t, map, mark) => ([...t].every((ch) => map[ch]) ? [...t].map((ch) => map[ch]).join("") : mark + t);
  const plainName = (n) => n.replace(/<sup>(.*?)<\/sup>/g, (m, t) => conv(t, SUP, "^")).replace(/<sub>(.*?)<\/sub>/g, (m, t) => conv(t, SUB, "_")).replace(/<[^>]+>/g, "");
  const WORDS = Object.assign({
    one: "concept", many: "concepts", usingIt: "concepts using it",
    usesHead: "Defined with", usedByHead: "Used in the definitions of", edges: "definitional dependencies",
    arrow: "A → B: B is defined with A", proofsHead: "Definitions", proofWord: "Definition", buildsOn: "Definitions this concept builds on", homeVerb: "Defined",
    levelHint: "Prerequisites: concepts from other areas. Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition.",
  }, CFG.words || {});
  const { el } = window.GL;
  // Formulas (user, 3 November 2026): no line break inside a formula; a formula with several parts separated by
  // ",\quad", "\quad", ",\;" or ",\ \ " at the outer level is split there, and every part is set on its own as one
  // unbreakable piece (one per line in the panel); the commas are dropped.
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
      // a single ",\ " joins the pieces of one condition (a \le b,\ b \le a \Rightarrow a = b) and is not split
      // (user, 3 November 2026); ",\ \ " separates parts
      const m = /^(,\s*\\q?quad(?![a-zA-Z])|\\q?quad(?![a-zA-Z])|,\s*\\;|,\s*\\ \s*\\ )\s*/.exec(f.slice(i));
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
  OWN.concepts.forEach((c) => (c.uses || []).concat(c.isA || [], ...(c.alternativeProofs || []).map((b) => b.premises || []), ...(c.alternativeDefinitions || []).map((d) => d.uses || [])).forEach((t) => { if (t.includes(":")) refs.add(t); }));
  // a concept of another folder by its prefixed id (null if that folder's data are not loaded)
  const lookup = (ref) => {
    const [prefix, id] = ref.split(":");
    const source = (CFG.sources || {})[prefix], data = source && asGraph(window[source.data]);
    const c = data && data.concepts.find((x) => x.id === id);
    return c ? { c, prefix, source } : null;
  };
  const withPrefix = (prefix, t) => (t.includes(":") ? t : prefix + ":" + t);
  // Shared nodes (user, 3 November 2026): a concept or theorem that is equally important in two areas keeps its one home
  // folder (definition, proofs, dependencies), but a second folder lists it in `shared` ({ ref, area }) and shows it as
  // one of its own nodes: in the sector of `area`, filled, with its level, its edges and its card. The nodes its
  // definition or proof uses are referenced as well.
  const SHARED = new Map((OWN.shared || []).map((s) => [s.ref, s]));
  SHARED.forEach((s, ref) => {
    refs.add(ref);
    const hit = lookup(ref);
    if (hit) (hit.c.uses || hit.c.premises || []).map((u) => withPrefix(hit.prefix, u)).filter((u) => !(CFG.prefix && u.startsWith(CFG.prefix + ":"))).forEach((u) => refs.add(u));
  });
  // Dependencies among the referenced concepts themselves are kept (ℕ → ℤ; user, 2 November 2026). Where the path in
  // the home graph runs through concepts that are not shown here (ideal → maximal ideal → local ring), it is followed
  // to the next referenced concept, so that the edge ideal → local ring appears.
  const reachedRefs = (prefix, list) => {
    const found = new Set(), seen = new Set(), stack = (list || []).map((t) => withPrefix(prefix, t));
    while (stack.length) {
      const t = stack.pop();
      if (seen.has(t)) continue;
      seen.add(t);
      // a reference back into this folder (a shared node defined with concepts of this area) is an own concept
      if (CFG.prefix && t.startsWith(CFG.prefix + ":") && OWN.concepts.some((x) => x.id === t.slice(CFG.prefix.length + 1))) { found.add(t.slice(CFG.prefix.length + 1)); continue; }
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
    const shared = SHARED.get(ref);
    // the alternative definitions and proofs refer to the nodes shown here as well
    const alt = (list, key) => list && list.map((b) => ({ ...b, [key]: reachedRefs(prefix, b[key]).filter((t) => t !== ref) }));
    D.concepts.push({ ...c, id: ref, uses: reachedRefs(prefix, c.uses).filter((t) => t !== ref), isA, area: shared ? shared.area : FOREIGN,
      alternativeDefinitions: alt(c.alternativeDefinitions, "uses"), alternativeProofs: alt(c.alternativeProofs, "premises"),
      shared: !!shared, foreign: { home: source.page + "#mark=" + c.id, title: source.title, prefix } });
  });

  const concepts = D.concepts;

  // Prerequisites are coloured by their origin (user, 2 November 2026): the home folder of a referenced concept, or
  // "local" for the placeholders of this folder. Colours fixed per prefix, so that an area has the same colour in
  // every graph; the names come from the settings (title of the source).
  const ORIGIN_COLORS = { st: "#a39171", ent: "#c97b63", gt: "#6f9e6f", ct: "#6d8fc0", ca: "#c9a33e", ag: "#9d7cbf", ar: "#3f8f8a", ant: "#b5651d", co: "#c77dba", rt: "#7a6fb0", top: "#4f7f9f", ana: "#b04a5a", geo: "#8a9a3a", local: "#d9d4ca" };
  const originOf = (c) => (c.foreign ? c.foreign.prefix : "local");
  const originName = (o) => (o === "local" ? CFG.foreignLabel + ", no home folder yet" : "from " + ((CFG.sources[o] || {}).title || o).replace(/^the (concept|theorem) graph of /, ""));
  const colorOf = (c) => (c.area === FOREIGN ? ORIGIN_COLORS[originOf(c)] || "#d9d4ca" : COLORS[c.area] || "#ccc");
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const usesEdges = [];
  const isaEdges = [];
  // The whole graph shows "is used in some proof" (user, 3 November 2026): edges of all proofs; edges only of
  // alternative proofs are marked `alt` (drawn lighter). For concepts there is only one "proof", the definition.
  const premiseSets = (c) => {
    const P = proofsOf(c);
    return (P.length ? P.map((b) => b.premises || []) : [c.uses || []]).map((S) => S.filter((t) => byId.has(t)));
  };
  const allUses = new Map();
  concepts.forEach((c) => {
    const all = [...new Set(premiseSets(c).flat())];
    allUses.set(c.id, all);
    all.forEach((t) => usesEdges.push({ from: t, to: c.id, kind: "uses", alt: !(c.uses || []).includes(t),
      // essential: every proof of the target uses it
      essential: premiseSets(c).every((S) => S.includes(t)) }));
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
  const ancestors = (id) => closure(id, (x) => allUses.get(x));
  const descendants = (id) => closure(id, (x) => usedBy.get(x));

  // Level of a concept (definitional depth within the area; user, 2 November 2026): concepts from outside the area
  // (area FOREIGN: placeholders and concepts of other folders) are prerequisites with level 0 and do not count; an own
  // concept has level 1 if its definition uses no other own concept, otherwise 1 + the highest level among the own
  // concepts its definition uses.
  const isPre = (id) => byId.get(id).area === FOREIGN;
  // With several proofs the level is the depth of the shortest proof (user, 3 November 2026): the smallest level any
  // proof gives, 1 + the highest level among the own theorems it uses. Well defined also where proofs go round in a
  // circle (axiom of choice, Zorn, well-ordering): computed outward from the nodes without own premises.
  const level = new Map();
  concepts.forEach((c) => level.set(c.id, isPre(c.id) ? 0 : Infinity));
  for (let changed = true; changed;) {
    changed = false;
    concepts.forEach((c) => {
      if (isPre(c.id)) return;
      const v = Math.min(...premiseSets(c).map((S) => 1 + Math.max(0, ...S.filter((t) => !isPre(t)).map((t) => level.get(t)))));
      if (v < level.get(c.id)) { level.set(c.id, v); changed = true; }
    });
  }
  const finite = [...level.values()].filter(Number.isFinite);
  concepts.forEach((c) => { if (!Number.isFinite(level.get(c.id))) level.set(c.id, Math.max(1, ...finite) + 1); });
  const levelOf = (id) => level.get(id);

  // ------------------------------------------------------------ edges that are hidden by default
  // transitive: A → B where B also uses a concept that already depends on A (indirect dependency).
  // pre: edges from prerequisites (concepts from outside the area). hub: edges from the concepts in `hubs` (group in
  // group theory), which are used by almost everything. All three are shown for a selected concept or by switches.
  const HUBS = {};
  (CFG.hubs || []).forEach((h) => { HUBS[h] = true; });
  usesEdges.forEach((e) => {
    const uses = allUses.get(e.to);
    e.transitive = uses.some((u) => u !== e.from && ancestors(u).has(e.from) && !ancestors(e.from).has(u));
    // edges among the prerequisites stay visible on the inner circle; on the outer ring (foreignOutside) they are
    // hidden like the other edges from other areas
    e.pre = isPre(e.from) && (!isPre(e.to) || !!CFG.foreignOutside);
    e.hub = !e.pre && e.from in HUBS;
  });
  // edges only of alternative proofs or definitions are hidden by default and do not shape the layout (user,
  // 3 November 2026: fewer crossings); a switch shows them, a selection shows those of its card
  const layoutEdges = usesEdges.filter((e) => !e.transitive && !e.hub && !e.pre && !e.alt);

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
  // the white inner circle only holds the centre node (an axiom or a theorem from the definitions alone in the theorem
  // graphs): small with one node, smaller still without (user, 3 November 2026)
  if (CFG.foreignOutside) RING.inner = CENTRE_ID ? 130 : 95;
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
  // the best few orders by angle are candidates; among them the one with the fewest crossings is chosen below
  const CANDIDATES = 12, candidates = [];
  const offer = (arr, c) => {
    if (candidates.length === CANDIDATES && c >= candidates[CANDIDATES - 1].c) return;
    candidates.push({ order: arr.slice(), c });
    candidates.sort((x, y) => x.c - y.c);
    if (candidates.length > CANDIDATES) candidates.pop();
  };
  if (sectorAreas.length <= 9) {
    // up to 9 sectors: all orders (the first sector fixed, since turning the circle changes nothing)
    (function permute(arr, k) {
      if (k === arr.length) {
        const c = orderCost(arr);
        offer(arr, c);
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
    // candidates: the result and every order one exchange of two sectors away from it
    offer(bestOrder, bestCost);
    for (let i = 1; i < bestOrder.length; i++) for (let j = i + 1; j < bestOrder.length; j++) {
      const arr = bestOrder.slice();
      [arr[i], arr[j]] = [arr[j], arr[i]];
      offer(arr, orderCost(arr));
    }
  }
  if (!candidates.length) offer(bestOrder, bestCost);
  let sectors = sectorsFor(bestOrder);

  const angle = new Map();
  const levelsSorted = [...new Set(level.values())].sort((a, b) => a - b);
  const conceptsAt = (l) => concepts.filter((c) => level.get(c.id) === l && c.id !== CENTRE_ID);
  // many prerequisites need a larger circle (circumference = sum of their sizes and gaps); the rows move out with it
  {
    const need = conceptsAt(0).reduce((s, c) => s + 2 * (6 + 2.4 * Math.sqrt(descendants(c.id).size)) + RING.gap, 0) / TAU;
    if (need > RING.pre && !CFG.foreignOutside) { RING.inner += need - RING.pre; RING.pre = need; }
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
  // foreignOutside (user, 3 November 2026): results and concepts of other areas always visible on a ring outside the
  // sectors, each near the nodes that use it; their arrows hidden until selected or switched on
  const R_FOREIGN = R_OUT + 175;
  const radiusFor = (c) => (c.id === CENTRE_ID ? 0 : level.get(c.id) === 0 ? (CFG.foreignOutside ? R_FOREIGN : RING.pre) : rowRadius.get(secKey(c) + "|" + level.get(c.id)));
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
  // Fewer crossings (user, 3 November 2026). Crossings are counted between the straight edges of the layout among
  // own concepts, at the radius of their row (before the small shifts below); edges with a common end do not count.
  const optEdges = layoutEdges.filter((e) => level.get(e.from) >= 1 && level.get(e.to) >= 1);
  // numbers instead of maps, since this runs often: node index, coordinates, edge ends, edges at each node
  const optIds = [...new Set(optEdges.flatMap((e) => [e.from, e.to]))], idx = new Map(optIds.map((id, i) => [id, i]));
  const X = new Float64Array(optIds.length), Y = new Float64Array(optIds.length);
  const EA = Int32Array.from(optEdges, (e) => idx.get(e.from)), EB = Int32Array.from(optEdges, (e) => idx.get(e.to));
  const incident = optIds.map(() => []);
  optEdges.forEach((e, k) => { incident[EA[k]].push(k); incident[EB[k]].push(k); });
  const place = (i) => { const id = optIds[i], R = radiusFor(byId.get(id)), a = angle.get(id) || 0; X[i] = R * Math.cos(a); Y[i] = R * Math.sin(a); };
  const orient = (p, q, r) => Math.sign((X[q] - X[p]) * (Y[r] - Y[p]) - (Y[q] - Y[p]) * (X[r] - X[p]));
  const crosses = (e, f) => {
    const a = EA[e], b = EB[e], c = EA[f], d = EB[f];
    if (a === c || a === d || b === c || b === d) return false;
    if (Math.max(X[a], X[b]) < Math.min(X[c], X[d]) || Math.max(X[c], X[d]) < Math.min(X[a], X[b])
      || Math.max(Y[a], Y[b]) < Math.min(Y[c], Y[d]) || Math.max(Y[c], Y[d]) < Math.min(Y[a], Y[b])) return false;
    return orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0;
  };
  const crossingsAt = (list) => { let n = 0; for (const e of list) for (let f = 0; f < EA.length; f++) if (e !== f && crosses(e, f)) n++; return n; };
  const totalCrossings = () => { let n = 0; for (let e = 0; e < EA.length; e++) for (let f = e + 1; f < EA.length; f++) if (crosses(e, f)) n++; return n; };
  // after the barycentre sweeps: exchange two concepts of the same row of a sector (their places on the row) as long
  // as that lowers the number of crossings of their edges
  const rows = [];
  sectorAreas.forEach((k) => ringLevels.forEach((l) => {
    const row = conceptsAt(l).filter((c) => secKey(c) === k && idx.has(c.id)).map((c) => idx.get(c.id));
    if (row.length > 1) rows.push(row);
  }));
  function untangle() {
    optIds.forEach((_, i) => place(i));
    for (let round = 0; round < 8; round++) {
      let improved = false;
      rows.forEach((row) => {
        for (let i = 0; i < row.length; i++) for (let j = i + 1; j < row.length; j++) {
          const u = row[i], v = row[j], S = [...new Set(incident[u].concat(incident[v]))];
          const before = crossingsAt(S);
          if (!before) continue;
          const U = optIds[u], V = optIds[v], au = angle.get(U);
          angle.set(U, angle.get(V)); angle.set(V, au); place(u); place(v);
          if (crossingsAt(S) < before) improved = true;
          else { angle.set(V, angle.get(U)); angle.set(U, au); place(u); place(v); }
        }
      });
      if (!improved) break;
    }
    return totalCrossings();
  }
  function placeAll(order) {
    sectors = sectorsFor(order);
    angle.clear();
    ringLevels.forEach((l) => placeRing(l, inner));
    for (let sweep = 0; sweep < 2; sweep++) {
      ringLevels.slice().reverse().forEach((l) => placeRing(l, (id) => outer(id).concat(inner(id))));
      ringLevels.forEach((l) => placeRing(l, (id) => inner(id).concat(outer(id))));
    }
    return untangle();
  }
  // order of the sectors: among the candidates by angle the one with the fewest crossings
  let best = null;
  candidates.forEach((cand) => {
    const n = placeAll(cand.order);
    if (!best || n < best.n) best = { n, order: cand.order, angle: new Map(angle) };
  });
  sectors = sectorsFor(best.order);
  angle.clear();
  best.angle.forEach((a, id) => angle.set(id, a));
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
  // on the outer ring each stands at the mean angle of its users (pushed apart below)
  if (CFG.foreignOutside) sequence.forEach((id) => { if (userMean.get(id) != null) angle.set(id, userMean.get(id)); });

  // on the outer ring the points of other areas are small: their size would only repeat how much uses them here
  const radiusOf = (c) => (CFG.foreignOutside && isPre(c.id) ? 6 : 6 + 2.4 * Math.sqrt(descendants(c.id).size));
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
  // prerequisites (no sectors): push apart concepts that are too close on their circle (keeps the order). On the outer
  // ring the names (horizontal) need room where the ring runs horizontally (top and bottom); where one ring is too
  // narrow for all of them, they are dealt out to up to three rings further out (55 apart), counted per ring.
  [0].filter((l) => levelsSorted.includes(l)).forEach((l) => {
    const R = CFG.foreignOutside ? R_FOREIGN : RING.pre;
    const list = conceptsAt(l).map((c) => ({ id: c.id, a: angle.get(c.id), r: radiusOf(c) })).sort((x, y) => x.a - y.a);
    const wid = (x) => 6.2 * plainName(byId.get(x.id).name).length;
    const needOf = (p, q) => (CFG.foreignOutside
      ? Math.max(p.r + q.r + 14, ((wid(p) + wid(q)) / 2 + 8) * Math.abs(Math.sin((p.a + q.a) / 2)), 22) / R
      : (p.r + q.r + RING.gap) / R);
    const total = list.reduce((sum, p, i) => sum + needOf(p, list[(i + 1) % list.length]), 0);
    const rows = CFG.foreignOutside ? Math.min(3, Math.max(1, Math.ceil(total / (0.9 * TAU)))) : 1;
    const STEP = 55;
    if (rows > 1) list.forEach((x, i) => { if (i % rows) radialShift.set(x.id, STEP * (i % rows)); });
    for (let it = 0; it < 400; it++) {
      let changed = false;
      for (let i = 0; i < list.length && list.length > rows; i++) {
        for (let k = 1; k <= rows; k++) {
          const j = (i + k) % list.length, p = list[i], q = list[j];
          let gapA = q.a - p.a;
          if (j <= i) gapA += TAU;
          const dr = STEP * Math.abs((i % rows) - (j % rows));
          // same ring: room for the names; other ring: only the points must not overlap
          const need = dr === 0 ? needOf(p, q) : Math.sqrt(Math.max(0, (p.r + q.r + 6) ** 2 - dr * dr)) / R;
          if (gapA < need) { const d = (need - gapA) / 2; p.a -= d; q.a += d; changed = true; }
        }
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
    // the name follows the circle (user, 3 November 2026): on an arc around the middle of the sector, upright in the
    // upper half (clockwise, letters outside the arc) and in the lower half (anticlockwise, the arc further out so that
    // the letters hang down to the circle)
    const m = sec.mid, low = Math.sin(m) > 0, rT = rOut + (low ? 30 : 12), half = Math.PI / 2;
    const arcId = "sektor-bogen-" + String(k).replace(/[^\w-]/g, "_");
    const b0 = low ? m + half : m - half, b1 = low ? m - half : m + half;
    el("path", { id: arcId, d: `M${P(rT, b0)}A${rT},${rT} 0 0 ${low ? 0 : 1} ${P(rT, b1)}`, fill: "none", stroke: "none" }, gSectors);
    const t = el("text", { class: "sektor-name" }, gSectors);
    const tp = el("textPath", { href: "#" + arcId, startOffset: "50%", "text-anchor": "middle" }, t);
    // as long as the arc of the sector allows (about 11.5 units per letter at this size); the full name in a tooltip
    const full = k === OTHER ? "Smaller classes" : D.areas[k], room = Math.max(4, Math.floor((sec.w * rT) / 11.5));
    tp.textContent = full.length <= room ? full : full.slice(0, room - 1).replace(/[\s,;]+\S*$/, "") + " …";
    el("title", {}, t).textContent = k === OTHER ? smallAreas.map((a) => D.areas[a]).join("\n") : full;
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
    e.line = el("line", { class: "kante " + e.kind + (e.transitive ? " transitiv" : "") + (e.pre ? " basis" : "") + (e.hub ? " hub" : "") + (e.alt ? " alternativ" : ""), "marker-end": e.kind === "uses" ? "url(#pfeil)" : "" }, gEdges);
  });
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
      const o = { from: id, q, t, page: src.page + "#mark=" + t.id, title: src.title };
      o.g = el("g", { class: "stub aus" }, gStubs);
      o.g.style.setProperty("--herkunft", ORIGIN_COLORS[q] || "#8a7f6e");
      o.line = el("line", { class: "kante aus-linie", "marker-end": "url(#pfeil)" }, o.g);
      o.dot = el("circle", { r: 5 }, o.g);
      o.text = el("text", {}, o.g);
      o.text.textContent = plainName(t.name);
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
  let hoverTimer = null;
  const tip = document.createElement("div");
  tip.className = "knoten-tip";
  tip.hidden = true;
  document.body.appendChild(tip);
  const moveTip = (ev) => { tip.style.left = ev.clientX + 14 + "px"; tip.style.top = ev.clientY + 14 + "px"; };
  const showTip = (text, ev) => { tip.textContent = text; tip.hidden = false; moveTip(ev); };
  const hideTip = () => { tip.hidden = true; };
  let nodeDrag = null; // { p, moved }
  concepts.forEach((c) => {
    const p = pos.get(c.id);
    const g = el("g", { class: "knoten" + (c.area === FOREIGN ? " fremd" : ""), "data-id": c.id }, gNodes);
    // prerequisites: light fill with a thick border in the colour of their origin, unlike the filled own concepts
    shape(g, c.kind, p.r, c.area === FOREIGN ? "#fbfaf6" : colorOf(c));
    if (c.area === FOREIGN) g.style.setProperty("--herkunft", colorOf(c));
    const t = el("text", { x: 0, y: p.r + 13, "text-anchor": "middle" }, g);
    t.textContent = plainName(c.name);
    // tooltip of its own (appears at once), not the slow one of the browser (user, 3 November 2026)
    g.dataset.tip = plainName(c.name) + " — " + (KIND_LABEL[c.kind] || c.kind) + ", " + (c.msc5 || c.msc.join(", "))
      + (c.fromDefinitions ? "; proof from the definitions alone" : c.foundation && !(c.uses || []).length ? "; foundation, proof outside these graphs" : "");
    // pointing: the node is lit only after half a second; leaving it ends that at once (user, 3 November 2026)
    g.addEventListener("mouseenter", (ev) => { clearTimeout(hoverTimer); if (nodeDrag) return; showTip(g.dataset.tip, ev); hoverTimer = setTimeout(() => hover(c.id), 500); });
    g.addEventListener("mousemove", (ev) => moveTip(ev));
    g.addEventListener("mouseleave", () => { clearTimeout(hoverTimer); hideTip(); if (!nodeDrag) hover(null); });
    g.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0) return;
      ev.stopPropagation();
      nodeDrag = { p, moved: false, x: ev.clientX, y: ev.clientY };
    });
    g.addEventListener("click", (ev) => { ev.stopPropagation(); if (justDragged) { justDragged = false; return; } if (ev.detail > 1 && clickMode !== "graph") return;
      // a node of another area (outer ring): a left click only opens its home graph with it selected (user, 3 November 2026)
      if (c.foreign && !c.shared && CFG.foreignOutside) { location.href = c.foreign.home; return; }
      step(c.id, "back"); });
    g.addEventListener("contextmenu", (ev) => { ev.preventDefault(); ev.stopPropagation(); if (justDragged) { justDragged = false; return; } step(c.id, "fwd"); });
    nodeEls.set(c.id, g);
  });

  function render() {
    points.forEach((p) => nodeEls.get(p.id).setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`));
    outsOf.forEach((list, id) => {
      const a = pos.get(id), RS = rOut + 14, d0 = Math.hypot(a.x, a.y), base = d0 > 1 ? Math.atan2(a.y, a.x) : -Math.PI / 2;
      const n = list.length;
      list.forEach((o, j) => {
        const ang = base + (j - (n - 1) / 2) * (24 / RS), ux = Math.cos(ang), uy = Math.sin(ang), sx = RS * ux, sy = RS * uy;
        const lx = sx - a.x, ly = sy - a.y, ld = Math.hypot(lx, ly) || 1;
        o.dot.setAttribute("cx", sx.toFixed(1)); o.dot.setAttribute("cy", sy.toFixed(1));
        o.text.setAttribute("x", (sx + ux * 9).toFixed(1)); o.text.setAttribute("y", (sy + uy * 9 + 3).toFixed(1));
        o.text.setAttribute("text-anchor", ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle");
        o.line.setAttribute("x1", (a.x + (lx / ld) * a.r).toFixed(1)); o.line.setAttribute("y1", (a.y + (ly / ld) * a.r).toFixed(1));
        o.line.setAttribute("x2", (sx - (lx / ld) * 7).toFixed(1)); o.line.setAttribute("y2", (sy - (ly / ld) * 7).toFixed(1));
      });
    });
    edges.forEach((e) => {
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
    if (typeof hoverLayer !== "undefined" && hoverLayer) hoverLayer.innerHTML = "";
    svg.querySelectorAll(".knoten.zeiger").forEach((g) => { g.classList.remove("zeiger"); const t = g.querySelector("text"); t.style.fontSize = ""; t.removeAttribute("dominant-baseline"); if (t.dataset.y) t.setAttribute("y", t.dataset.y); });
    svg.querySelectorAll(".hell, .vorfahr, .nachfahr, .gewaehlt").forEach((x) => x.classList.remove("hell", "vorfahr", "nachfahr", "gewaehlt"));
    usesEdges.forEach((e) => e.line.setAttribute("marker-end", "url(#pfeil)"));
  }
  // Selection (user, 3 November 2026): the whole graph is the view without a selection. A click lays the card of the
  // proof over the dimmed graph: the theorem at the bottom, above it the theorems its proof uses, one proof chosen at
  // every node (standard proof unless switched). A right click lays the card of the consequences: the theorem at the
  // top, below it the theorems that use it in some proof (solid: every proof uses it; dashed: only some). Further
  // clicks of the same kind add one step; the card stays when all is shown and closes with × or a click outside.
  // proof shown for a theorem (index into proofsOf; default 0, the standard proof)
  const proofChoice = new Map();
  const usesOf = (x) => {
    const c = byId.get(x), k = proofChoice.get(x) || 0;
    return (k ? proofsOf(c)[k].premises || [] : c.uses || []).filter((t) => byId.has(t));
  };
  const backOf = (x) => usesOf(x).concat((byId.get(x).isA || []).filter((t) => byId.has(t)));
  // In the proof card and the side view, foundations (`foundation: true`, e.g. Bézout's identity) are shown but not
  // expanded further (user, 3 November 2026)
  // Nodes of other areas are not expanded either (user, 3 November 2026): their premises are shown in their own graph.
  const backFrom = (root) => (x) => (x !== root && (byId.get(x).foundation || isPre(x)) ? [] : backOf(x));
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
  // marking in the graph, like the card: nodes of other areas are shown where a node of this area uses them, but their
  // own premises are not followed (they are not drawn here; user, 3 November 2026)
  const backLocal = (root) => (x) => (x !== root && isPre(x) ? [] : backFrom(root)(x));
  const maxDepth = (id, dir) => { let k = 0, n = 0; for (;;) { const m = within(id, dir === "fwd" ? fwdOf : backLocal(id), k + 1).size; if (m === n) return k; n = m; k++; } };
  // Each box of a card shows and hides its own prerequisites (proof card) or consequences (card of the consequences)
  // with a click; nothing jumps to another card (user, 3 November 2026). `expanded`: boxes whose neighbours are shown.
  let cardMode = "back", cardDepth = 1, expanded = new Set(), cardIds = null, cardShown = null;
  const cardNext = (root, x) => (cardMode === "fwd" ? fwdOf(x) : backFrom(root)(x)).filter((y) => !cardIds || cardIds.has(y));
  function computeShown(root) {
    const shown = new Set([root]), queue = [root];
    while (queue.length) {
      const x = queue.shift();
      if (!expanded.has(x)) continue;
      cardNext(root, x).forEach((y) => { if (!shown.has(y)) { shown.add(y); queue.push(y); } });
    }
    return shown;
  }
  // Two modes for the click (user, 3 November 2026): "card" lays the card over the graph (above); "graph" marks in the
  // graph itself, one step per click: the first click marks the direct premises (right click: the direct consequences),
  // every further click on the same node one step more. Foundations are not expanded, as on the card.
  let clickMode = "card", graphDepth = 1, graphFor = null;
  try { if (localStorage.getItem("concept-graph-click") === "graph") clickMode = "graph"; } catch (err) { /* no storage */ }
  function step(id, dir) {
    if (clickMode === "graph") {
      if (id === selected && dir === cardMode && graphFor === id) graphDepth = Math.min(graphDepth + 1, Math.max(1, maxDepth(id, dir)));
      else { cardMode = dir; graphDepth = 1; graphFor = id; proofChoice.clear(); }
      select(id);
      return;
    }
    if (id === selected && dir === cardMode && cardFor === id) toggle(id);
    else { cardMode = dir; expanded = new Set([id]); proofChoice.clear(); cardFor = null; select(id); }
  }
  function toggle(x) {
    // a closed subtree keeps its opened boxes: opened again, it appears as far as before (user, 3 November 2026)
    if (expanded.has(x)) expanded.delete(x); else expanded.add(x);
    showCard(selected);
    mark(selected);
  }
  function mark(id) {
    clearMarks();
    if (!id) return;
    svg.classList.add("fokus");
    const back = cardMode === "back";
    const set = new Set(cardShown || []);
    set.delete(id);
    nodeEls.get(id).classList.add("hell", "gewaehlt");
    set.forEach((x) => nodeEls.get(x).classList.add("hell", back ? "vorfahr" : "nachfahr"));
    const inSet = (x) => x === id || set.has(x);
    const light = (e) => {
      // premises of nodes of other areas are not followed, as on the card (user, 3 November 2026)
      if (e.kind === "uses" && back && e.to !== id && isPre(e.to)) return false;
      if (e.kind === "uses" && back && usesOf(e.to).includes(e.from)) { e.line.classList.add("hell", "vorfahr"); e.line.setAttribute("marker-end", "url(#pfeil-v)"); return true; }
      if (e.kind === "uses" && !back) { e.line.classList.add("hell", "nachfahr"); e.line.setAttribute("marker-end", "url(#pfeil-n)"); return true; }
      if (e.kind === "isa") e.line.classList.add("hell");
      return false;
    };
    const lit = new Map(); // from -> [to] along the lit uses edges
    edges.forEach((e) => {
      if (e.kind === "uses" && e.transitive) return;
      if (!inSet(e.from) || !inSet(e.to)) return;
      if (light(e)) { if (!lit.has(e.from)) lit.set(e.from, []); lit.get(e.from).push(e.to); }
    });
    // an indirect edge is lit where no path along the lit edges replaces it (user, 3 November 2026: otherwise a marked
    // node may have no edge at all)
    const reaches = (a, x) => { const seen = new Set([a]), st = [a]; while (st.length) for (const y of lit.get(st.pop()) || []) { if (y === x) return true; if (!seen.has(y)) { seen.add(y); st.push(y); } } return false; };
    edges.filter((e) => e.kind === "uses" && e.transitive && inSet(e.from) && inSet(e.to) && !reaches(e.from, e.to)).forEach(light);
    if (!back) (outsOf.get(id) || []).forEach((o) => o.g.classList.add("hell"));
  }
  // pointing at a node (user, 3 November 2026): after half a second only the node itself is lit, all else dimmed; its
  // name and kind in a tooltip that appears at once
  var hoverLayer = null; // kept for clearMarks
  function hover(id) {
    if (selected) return;
    clearMarks();
    if (!id) return;
    svg.classList.add("fokus");
    nodeEls.get(id).classList.add("hell", "zeiger");
  }
  const chip = (id) => (byId.has(id) ? `<span class="chip" data-id="${id}">${byId.get(id).name}</span>` : "");
  function select(id) {
    selected = id && byId.has(id) ? id : null;
    if (OUTSIDE) render();
    if (found && found !== selected) markFound(null);
    // a card opened otherwise than by a click (address #id, search, panel): the node's first step is shown
    if (selected && cardFor !== selected && !expanded.has(selected)) { expanded = new Set([selected]); if (!proofChoice.has(selected)) proofChoice.clear(); }
    showCard(selected);
    mark(selected);
    applyLevels();
    if (location.hash.slice(1) !== (selected || "")) history.replaceState(null, "", selected ? "#" + selected : location.pathname + location.search);
    if (!selected) { panel.innerHTML = overview(); return; }
    const c = byId.get(selected);
    const generalisations = c.isA || [];
    const special = isaEdges.filter((e) => e.to === c.id).map((e) => e.from);
    const stepNote = ""; // no step line (user, 3 November 2026)
    panel.innerHTML = `<h2>${c.name}</h2>${stepNote}
      <div class="meta">${KIND_LABEL[c.kind] || c.kind} · ${c.area === FOREIGN ? "MSC " + c.msc.join(", ") + " (" + CFG.foreignLabel + ")" : D.areas[c.area]}</div>
      ${c.shared ? `<p class="meta">Equally important here and in <a href="${c.foreign.home}">${c.foreign.title}</a>, where it is ${WORDS.homeVerb.toLowerCase()}.</p>`
        : c.foreign ? `<p class="meta">${WORDS.homeVerb} in <a href="${c.foreign.home}">${c.foreign.title}</a>; its own dependencies are shown there.</p>` : ""}
      ${c.formula && window.katex ? `<div class="formel">${tex(c.formula)}</div>` : ""}
      <p>${c.text || ""}</p>
      ${c.who || c.year ? `<p class="meta">${[c.who, c.year < 0 ? -c.year + " BC" : c.year].filter(Boolean).join(", ")}</p>` : ""}
      ${c.proof && proofsOf(c).length <= 1 ? `<h3>Proof idea</h3><p>${c.proof}</p>` : ""}
      ${statementConcepts(c)}
      ${focusView(c.id)}
      ${proofList(c)}
      <h3>${WORDS.usedByHead}</h3><p>${usedBy.get(c.id).length ? usedBy.get(c.id).map(chip).join("") : "—"}</p>
      ${(outsOf.get(c.id) || []).length ? `<h3>Used in other areas</h3><p>${outsOf.get(c.id).map((o) => `<a class="chip" href="${o.page}" title="${o.title}">${o.t.name}</a>`).join("")}</p>` : ""}
      ${generalisations.length ? `<h3>Is a special case of</h3><p>${generalisations.map(chip).join("")}</p>` : ""}
      ${special.length ? `<h3>Special cases</h3><p>${special.map(chip).join("")}</p>` : ""}
      <p class="meta">Depends on ${ancestors(c.id).size} ${WORDS.many}; ${descendants(c.id).size} ${WORDS.many} depend on it.</p>`;
  }
  // Why the standard proof has no premises (user, 3 November 2026): `fromDefinitions` (it works with the definitions
  // only) or `foundation` (it rests on methods outside these graphs, named in the proof idea)
  const noPremiseReason = (c) => c.fromDefinitions
    ? `No premises: the ${WORDS.proofWord.toLowerCase()} uses no other ${WORDS.one}; it works directly with the definitions of the concepts in the statement.`
    : c.foundation ? `No premises here: a foundation of this graph, whose ${WORDS.proofWord.toLowerCase()} rests on methods outside these graphs (see the idea).` : "";
  const noPremises = (c) => `<p class="ohne-praemissen">${noPremiseReason(c) || "—"}</p>`;
  function proofList(c) {
    const P = proofsOf(c);
    if (P.length <= 1) return `<h3>${WORDS.usesHead}</h3>${(c.uses || []).length ? `<p>${c.uses.map(chip).join("")}</p>` : noPremises(c)}`;
    const k = proofChoice.get(c.id) || 0;
    return `<h3>${WORDS.proofsHead} (${P.length})</h3>` + P.map((b, i) => `<div class="beweis${i === k ? " gezeigt" : ""}" data-proof="${i}">
      <div class="beweis-name">${b.name}${b.who || b.year ? ` <span class="meta">${[b.who, b.year].filter(Boolean).join(", ")}</span>` : ""}${i === k ? ' <span class="meta">(shown)</span>' : ""}</div>
      ${b.formula && window.katex ? `<div class="formel">${tex(b.formula)}</div>` : ""}${b.idea ? `<p>${b.idea}</p>` : ""}${(b.premises || []).filter((t) => byId.has(t)).length ? `<p>${b.premises.filter((t) => byId.has(t)).map(chip).join("")}</p>` : i === 0 ? noPremises(c) : "<p>—</p>"}</div>`).join("");
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
  panel.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-id]");
    if (t) { if (selected && clickMode === "card") jump(t.dataset.id); else { selected = null; step(t.dataset.id, "back"); } return; }
    const b = ev.target.closest("[data-proof]");
    if (b && selected) showProof(selected, Number(b.dataset.proof));
  });
  // Jumps between cards (user, 3 November 2026): "↗" on a box or a box of the side view opens the card of that node;
  // "‹ Back" in the head of the card and the back button of the browser return to the previous card as it was.
  const jumpStack = [];
  let restoring = 0; // time of the last return by the history; the hashchange that follows it is not handled again
  function jump(target) {
    const c = byId.get(target);
    if (!c) return;
    if (c.foreign && !c.shared && CFG.foreignOutside) { location.href = c.foreign.home; return; }
    if (selected && clickMode === "card") jumpStack.push({ id: selected, mode: cardMode, expanded: new Set(expanded), choice: new Map(proofChoice) });
    history.pushState(null, "", "#" + target);
    const keep = jumpStack.slice();
    selected = null;
    step(target, "back");
    jumpStack.length = 0; jumpStack.push(...keep);
    cardFor = null; showCard(target); mark(target);
  }
  window.addEventListener("popstate", () => {
    const h = decodeURIComponent(location.hash.slice(1)), top = jumpStack[jumpStack.length - 1];
    restoring = Date.now();
    if (top && top.id === h) {
      jumpStack.pop();
      const keep = jumpStack.slice();
      cardMode = top.mode; expanded = top.expanded; proofChoice.clear(); top.choice.forEach((v, k) => proofChoice.set(k, v));
      cardFor = null; selected = null;
      select(h);
      jumpStack.length = 0; jumpStack.push(...keep);
      cardFor = null; showCard(h); mark(h);
    } else { jumpStack.length = 0; fromHash(); }
  });
  // another proof of the selected theorem: the card is drawn anew, the steps start again
  function showProof(id, k) {
    if (id === selected && cardMode === "back" && clickMode === "card") { switchProof(id, k); return; }
    proofChoice.set(id, k);
    cardMode = "back"; expanded = new Set([id]);
    cardFor = null;
    select(id);
  }
  // Another proof or definition at a box (user, 3 November 2026, for quick comparisons): it is opened at least as far
  // as the previous one (the same number of levels above the box), and completely if the previous one was opened
  // completely.
  function switchProof(x, k) {
    const root = selected, next = (y) => backFrom(root)(y);
    let depth = 0, full = true, frontier = [x];
    const seen = new Set([x]);
    while (frontier.length) {
      const nf = [];
      let opened = false;
      frontier.forEach((y) => {
        const ch = next(y);
        if (!ch.length) return;
        if (!expanded.has(y)) { full = false; return; }
        opened = true;
        ch.forEach((z) => { if (!seen.has(z)) { seen.add(z); nf.push(z); } });
      });
      if (opened) depth++;
      frontier = nf;
    }
    const old = closure(x, next);
    proofChoice.set(x, k);
    expanded = new Set([...expanded].filter((y) => !old.has(y)));
    const limit = full ? Infinity : Math.max(1, depth);
    let fr = [x], d = 0;
    const seen2 = new Set([x]);
    while (fr.length && d < limit) {
      const nf = [];
      fr.forEach((y) => { const ch = next(y); if (ch.length) expanded.add(y); ch.forEach((z) => { if (!seen2.has(z)) { seen2.add(z); nf.push(z); } }); });
      fr = nf; d++;
    }
    // the side view in the panel shows the chosen proofs as well
    cardFor = null; select(root);
  }


  // ------------------------------------------------------------ layered drawings: the card and the side view
  // One row per depth within the shown nodes (top: nodes without predecessors among them), so that every arrow points
  // down; the selected node lies between its prerequisites (above) and its consequences (below). Indirect dependencies
  // are left out. The order within the rows comes from GL.layers (barycentre method, columns of GL.layers are the rows
  // here); every box is placed below the mean of its predecessors, then overlapping boxes in a row are pushed apart.
  // Nodes of other areas appear when a shown node of this area uses them directly; chains among them are not followed.
  // nodes of a card: the selected node and its prerequisites (proof card) or consequences (card of the consequences);
  // nodes of other areas only where a shown node of this area uses them directly
  const localIds = (id, mode, depth) => {
    if (mode === "fwd") return [id, ...within(id, fwdOf, depth)];
    const up = [...within(id, backFrom(id), depth)];
    const keep = (x) => !isPre(x) || [id, ...up].some((y) => !isPre(y) && backOf(y).includes(x));
    return [...up.filter(keep), id];
  };
  // Horizontal positions in a layered drawing after Brandes and Köpf, "Fast and simple horizontal coordinate
  // assignment" (2001), used for the cards (user, 3 November 2026: no needless bends). Each node is aligned with a median
  // neighbour in the row above or below; segments between two waypoints of a long edge take precedence, so that a long
  // edge runs as one vertical line. Four alignments (up/down × left/right) are compacted to the left, aligned to the
  // narrowest and combined as the mean of the two middle values. layersIn: rows from top to bottom, each in its order,
  // items with `links` (neighbours in the row above), `rechts` (below) and `kind` ("weg" for waypoints); sep(a, b):
  // least distance between the centres of neighbours a, b. Returns a Map item -> x.
  function placeBK(layersIn, sep) {
    const flat = layersIn.flat();
    flat.forEach((v, i) => { v.__n = i; });
    const results = [];
    for (const vdir of ["down", "up"]) for (const hdir of ["left", "right"]) {
      let L = layersIn.map((l) => (hdir === "left" ? l.slice() : l.slice().reverse()));
      if (vdir === "up") L = L.reverse();
      const upper = (v) => (vdir === "down" ? v.links : v.rechts);
      const pos = new Map(), row = new Map();
      L.forEach((l, i) => l.forEach((v, k) => { pos.set(v, k); row.set(v, i); }));
      const key = (u, v) => u.__n + "|" + v.__n;
      // type 1 conflicts: segments that cross a segment between two waypoints are not used for alignment
      const marked = new Set();
      for (let i = 1; i < L.length; i++) {
        const up = L[i - 1], low = L[i];
        let k0 = 0, l = 0;
        for (let l1 = 0; l1 < low.length; l1++) {
          const v = low[l1], inner = v.kind === "weg" ? upper(v).find((u) => u.kind === "weg") : null;
          if (l1 === low.length - 1 || inner) {
            const k1 = inner ? pos.get(inner) : up.length - 1;
            for (; l <= l1; l++) upper(low[l]).forEach((u) => { const k = pos.get(u); if (k < k0 || k > k1) marked.add(key(u, low[l])); });
            k0 = k1;
          }
        }
      }
      // vertical alignment with the median neighbours
      const root = new Map(flat.map((v) => [v, v])), align = new Map(flat.map((v) => [v, v]));
      for (let i = 1; i < L.length; i++) {
        let r = -1;
        for (const v of L[i]) {
          const U = upper(v).slice().sort((a, b) => pos.get(a) - pos.get(b)), d = U.length;
          if (!d) continue;
          for (const m of [...new Set([Math.floor((d - 1) / 2), Math.ceil((d - 1) / 2)])]) {
            if (align.get(v) !== v) continue;
            const u = U[m];
            if (!marked.has(key(u, v)) && r < pos.get(u)) { align.set(u, v); root.set(v, root.get(u)); align.set(v, root.get(v)); r = pos.get(u); }
          }
        }
      }
      // horizontal compaction of the blocks
      const sink = new Map(flat.map((v) => [v, v])), shift = new Map(flat.map((v) => [v, Infinity])), x = new Map();
      const place = (v) => {
        if (x.has(v)) return;
        x.set(v, 0);
        let w = v;
        do {
          const k = pos.get(w);
          if (k > 0) {
            const p = L[row.get(w)][k - 1], u = root.get(p);
            place(u);
            if (sink.get(v) === v) sink.set(v, sink.get(u));
            if (sink.get(v) !== sink.get(u)) shift.set(sink.get(u), Math.min(shift.get(sink.get(u)), x.get(v) - x.get(u) - sep(p, w)));
            else x.set(v, Math.max(x.get(v), x.get(u) + sep(p, w)));
          }
          w = align.get(w);
        } while (w !== v);
      };
      flat.forEach((v) => { if (root.get(v) === v) place(v); });
      const X = new Map();
      flat.forEach((v) => {
        const r0 = root.get(v), s = shift.get(sink.get(r0));
        const xv = x.get(r0) + (s < Infinity ? s : 0);
        X.set(v, hdir === "left" ? xv : -xv);
      });
      results.push({ X, hdir });
    }
    // align the four results to the narrowest one and take the mean of the two middle values
    const span = (r) => { const xs = [...r.X.values()]; return { min: Math.min(...xs), max: Math.max(...xs) }; };
    const spans = results.map(span), narrow = spans.reduce((b, s, i) => (s.max - s.min < spans[b].max - spans[b].min ? i : b), 0);
    results.forEach((r, i) => { r.d = r.hdir === "left" ? spans[narrow].min - spans[i].min : spans[narrow].max - spans[i].max; });
    const out = new Map();
    flat.forEach((v) => {
      const xs = results.map((r) => r.X.get(v) + r.d).sort((a, b) => a - b);
      out.set(v, (xs[1] + xs[2]) / 2);
    });
    // the balanced result and the four single alignments (in each of them every aligned block is vertical)
    return [out, ...results.map((r) => new Map([...r.X].map(([v, x]) => [v, x + r.d])))];
  }
  function layered(ids, id, o) {
    const set = new Set(ids), back = o.mode !== "fwd";
    // edges: proof card along the chosen proofs, card of the consequences along all proofs (dashed unless essential);
    // "is a" like a use (general above special)
    // foundations and nodes of other areas: no edges into them (their premises are not followed here)
    const prem = (x) => (back ? (x !== id && (byId.get(x).foundation || isPre(x)) ? [] : usesOf(x)) : allUses.get(x)).filter((a) => set.has(a));
    const anc = (x) => closure(x, (y) => (back ? usesOf(y) : allUses.get(y)));
    let fEdges = ids.flatMap((x) => {
      const P = prem(x);
      // indirect edges are kept with the intermediate premises (`via`): the card hides them only while a path through
      // such a premise is visible, so that no box is left without its edge (user, 3 November 2026)
      return P.map((a) => ({ from: a, to: x, kind: "uses", via: P.filter((b) => b !== a && anc(b).has(a) && !anc(a).has(b)),
        dashed: !back && !usesEdges.some((e) => e.from === a && e.to === x && e.essential) }));
    });
    // "is a" only where no use already joins the two
    fEdges = fEdges.concat(isaEdges.filter((e) => set.has(e.from) && set.has(e.to) && !fEdges.some((u) => u.from === e.to && u.to === e.from)
      && !(back && e.from !== id && (isPre(e.from) || byId.get(e.from).foundation))).map((e) => ({ from: e.to, to: e.from, kind: "isa" })));
    // the card lays out only the edges it shows (user, 3 November 2026: direct premises directly above)
    if (o.edgeOk) fEdges = fEdges.filter((e) => o.edgeOk(e.from, e.to, e.via || []));
    // rows: longest path from the selected node (cycles of alternative proofs broken by leaving out back edges)
    const out = new Map(ids.map((x) => [x, []]));
    fEdges.forEach((e) => (back ? out.get(e.to).push(e) : out.get(e.from).push(e)));
    const state = new Map(), keepE = new Set();
    const dfs = (x) => { state.set(x, 1); out.get(x).forEach((e) => { const y = back ? e.from : e.to; if (state.get(y) === 1) return; keepE.add(e); if (!state.has(y)) dfs(y); }); state.set(x, 2); };
    dfs(id);
    fEdges = fEdges.filter((e) => keepE.has(e));
    const dist = new Map([[id, 0]]);
    for (let changed = true, round = 0; changed && round < ids.length + 2; round++) {
      changed = false;
      fEdges.forEach((e) => { const [a, b] = back ? [e.to, e.from] : [e.from, e.to]; if (dist.has(a) && (dist.get(b) || -1) < dist.get(a) + 1) { dist.set(b, dist.get(a) + 1); changed = true; } });
    }
    ids.forEach((x) => { if (!dist.has(x)) dist.set(x, 1); });
    const maxD = Math.max(...dist.values());
    // the tree grows from the top downwards in both cards (user, 3 November 2026): the selected node in the top row; on
    // the proof card the arrows point upwards, from each premise to the node that uses it
    let rowOf = (x) => dist.get(x);
    // A card that is redrawn after a click (user, 3 November 2026: much calmer): the boxes shown before keep their row
    // and place (o.keep: id -> { r, cx }); a new box goes into the row below the box it was opened from.
    const keep = o.keep && o.keep.has(id) ? o.keep : null;
    if (keep) {
      const r = new Map(ids.filter((x) => keep.has(x)).map((x) => [x, keep.get(x).r]));
      const upperOf = (x) => fEdges.filter((e) => (back ? e.from === x : e.to === x)).map((e) => (back ? e.to : e.from));
      for (let changed = true, round = 0; changed && round < ids.length + 2; round++) {
        changed = false;
        ids.forEach((x) => {
          if (r.has(x) && keep.has(x)) return;
          const up = upperOf(x).filter((u) => r.has(u));
          if (!up.length) return;
          const v = 1 + Math.max(...up.map((u) => r.get(u)));
          if (r.get(x) !== v) { r.set(x, v); changed = true; }
        });
      }
      ids.forEach((x) => { if (!r.has(x)) r.set(x, (dist.get(x) || 1)); });
      rowOf = (x) => r.get(x);
    }
    const rows = [...new Set(ids.map(rowOf))].sort((a, b) => a - b);
    const { BW, BH, GAP, ROWH, M, chars, font } = o;
    // the layout runs from the upper row to the lower one; on the proof card that is against the direction of the edges
    const layEdges = back ? fEdges.map((e) => ({ from: e.to, to: e.from, orig: e })) : fEdges;
    const lay = GL.layers(ids, (x) => rows.indexOf(rowOf(x)), layEdges, { BH: BW, GAP_N: GAP, GAP_W: 6, MARGIN: M, HEAD: 0, ROUNDS: 40 });
    const wOf = (it) => (it.kind === "knoten" ? BW : 0);
    const sep = (a, b) => (wOf(a) + wOf(b)) / 2 + (a.kind === "knoten" && b.kind === "knoten" ? GAP : 10);
    // positions after Brandes and Köpf; afterwards, only as a safeguard, neighbours that are too close are pushed apart
    // of the five results the one with the fewest offsets along the edges: between two waypoints (a bend in the
    // middle of an edge) counts ten times as much as at the boxes at the ends
    const offsets = (X) => lay.chains.reduce((sum, { chain }) => sum + chain.slice(1).reduce((s, it, i) => {
      const prev = chain[i];
      if (Math.abs(X.get(it) - X.get(prev)) < 0.5) return s;
      return s + (it.kind === "weg" && prev.kind === "weg" ? 10 : 1);
    }, 0), 0);
    if (keep) {
      // boxes shown before stay where they were; new boxes below the boxes they were opened from, as a group in the
      // order of their upper neighbours, each moved only as far as needed to the nearest free place in its row
      const step = BW + GAP;
      const placed = new Map(); // row index -> [cx of the boxes]
      const put = (it, x) => { it.cx = x; if (!placed.has(it.c)) placed.set(it.c, []); placed.get(it.c).push(x); };
      lay.columns.forEach((row) => row.forEach((it) => { if (it.kind === "knoten" && keep.has(it.id)) put(it, keep.get(it.id).cx); }));
      const free = (c, x) => !(placed.get(c) || []).some((q) => Math.abs(q - x) < step - 0.5);
      lay.columns.forEach((row) => {
        const fresh = row.filter((it) => it.kind === "knoten" && !keep.has(it.id));
        const target = (it) => { const up = it.links.filter((q) => q.cx != null); return up.length ? up.reduce((a, q) => a + q.cx, 0) / up.length : 0; };
        // groups under the same upper neighbours, spread around their mean
        const groups = new Map();
        fresh.forEach((it) => { const k = it.links.map((q) => q.id || "").sort().join(" "); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); });
        [...groups.values()].sort((a, b) => target(a[0]) - target(b[0])).forEach((g) => {
          g.forEach((it, i) => {
            const want = target(it) + (i - (g.length - 1) / 2) * step;
            const cands = [want, ...(placed.get(it.c) || []).flatMap((q) => [q - step, q + step])].filter((x) => free(it.c, x));
            put(it, cands.sort((a, b) => Math.abs(a - want) - Math.abs(b - want))[0] ?? want);
          });
        });
      });
      // waypoints of long edges: one free vertical lane, as near as possible below the lower box
      const lanes = new Map(); // row index -> [x]
      lay.chains.forEach(({ chain }) => {
        const ways = chain.slice(1, -1);
        if (!ways.length) return;
        const goal = chain[chain.length - 1].cx;
        const ok = (x) => ways.every((it) => !(placed.get(it.c) || []).some((q) => Math.abs(q - x) < BW / 2 + 8) && !(lanes.get(it.c) || []).some((q) => Math.abs(q - x) < 8));
        let x = goal;
        for (let k = 1; !ok(x) && k < 400; k++) x = goal + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 10;
        ways.forEach((it) => { it.cx = x; if (!lanes.has(it.c)) lanes.set(it.c, []); lanes.get(it.c).push(x); });
      });
    }
    const bk = keep ? null : placeBK(lay.columns.filter(Boolean), sep).map((X) => ({ X, n: offsets(X) })).reduce((b, c) => (c.n < b.n ? c : b)).X;
    if (!keep) lay.columns.forEach((row) => {
      row.forEach((it) => { it.cx = bk.get(it); });
      for (let round = 0; round < 50; round++) {
        let moved = false;
        for (let i = 1; i < row.length; i++) {
          const d = row[i - 1].cx + sep(row[i - 1], row[i]) - row[i].cx;
          if (d > 0.01) { row[i - 1].cx -= d / 2; row[i].cx += d / 2; moved = true; }
        }
        if (!moved) break;
      }
    });
    // one vertical line for all waypoints of an edge wherever every row has room for it between the neighbours of the
    // waypoint; preferably at the target, else at the source
    if (!keep) for (let round = 0; round < 3; round++) lay.chains.forEach(({ chain }) => {
      const ways = chain.slice(1, -1);
      if (!ways.length) return;
      let lo = -Infinity, hi = Infinity;
      ways.forEach((it) => {
        const row = lay.columns[it.c], k = row.indexOf(it);
        if (k > 0) lo = Math.max(lo, row[k - 1].cx + sep(row[k - 1], it));
        if (k < row.length - 1) hi = Math.min(hi, row[k + 1].cx - sep(it, row[k + 1]));
      });
      if (lo > hi) return;
      const a = chain[0], b = chain[chain.length - 1];
      const x = [b.cx, a.cx].find((v) => v >= lo && v <= hi) ?? Math.max(lo, Math.min(hi, b.cx));
      ways.forEach((it) => { it.cx = x; });
    });
    const all = lay.columns.flat();
    const minX = Math.min(...all.map((it) => it.cx - wOf(it) / 2)), maxX = Math.max(...all.map((it) => it.cx + wOf(it) / 2));
    all.forEach((it) => { it.cx += M - minX; });
    let W = maxX - minX + 2 * M;
    if (o.centre && !keep) { const cx = lay.item[id].cx, half = Math.max(cx, W - cx); all.forEach((it) => { it.cx += half - cx; }); W = 2 * half; }
    const H = rows.length * ROWH - (ROWH - BH) + 2 * M, offY = 0;
    const yOf = (it) => offY + M + it.c * ROWH;
    const s = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, style: o.fit ? "max-width:100%;height:auto" : "", class: "fokus-ansicht " + o.cls, role: "img", "aria-label": o.label });
    const mk = "fp-" + o.cls;
    el("defs", {}, s).innerHTML = `<marker id="${mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10Z" fill="#8a7f6e"/></marker>`;
    // Edges with right angles (user, 3 November 2026), at most one horizontal piece above the first and one below the
    // last waypoint. The edges of a box leave it at points of its lower side in the order of their directions (the one
    // nearest below the box from its middle); they end at the middle of the upper side of their target. Every
    // horizontal piece has its own height in the gap between two rows; only pieces into the same box share one.
    const outOf = new Map();
    lay.chains.forEach((ch) => { const a = ch.chain[0]; if (!outOf.has(a)) outOf.set(a, []); outOf.get(a).push(ch); });
    outOf.forEach((list, a) => {
      list.sort((p, q) => p.chain[1].cx - q.chain[1].cx);
      const n = list.length, step = n > 1 ? Math.min(14, (BW - 24) / (n - 1)) : 0;
      let j = 0;
      list.forEach((ch, i) => { if (Math.abs(ch.chain[1].cx - a.cx) < Math.abs(list[j].chain[1].cx - a.cx)) j = i; });
      // the points as a group inside the box: shifted, not cut off at its sides
      const left = a.cx + (0 - j) * step, right = a.cx + (n - 1 - j) * step;
      const d = Math.max(0, a.cx - BW / 2 + 10 - left) - Math.max(0, right - (a.cx + BW / 2 - 10));
      list.forEach((ch, i) => { ch.port = a.cx + (i - j) * step + d; });
    });
    const yBottom = (it) => yOf(it) + BH;
    const pieces = new Map(); // gap (row above) -> Map key -> { kind, x }
    lay.chains.forEach((ch, ci) => {
      const pts = ch.chain.map((it, i) => [i === 0 ? ch.port : it.cx, it]);
      ch.pts = pts;
      for (let i = 1; i < pts.length; i++) {
        if (Math.abs(pts[i][0] - pts[i - 1][0]) < 0.5) continue;
        const gap = pts[i - 1][1].c, last = i === pts.length - 1;
        const k = last ? "t:" + pts[i][1].id : "e:" + ci + ":" + i;
        if (!pieces.has(gap)) pieces.set(gap, new Map());
        const g = pieces.get(gap);
        if (!g.has(k)) g.set(k, { order: i === 1 ? 0 : last ? 2 : 1, x: Math.min(pts[i][0], pts[i - 1][0]) });
        else g.get(k).x = Math.min(g.get(k).x, pts[i][0], pts[i - 1][0]);
      }
    });
    const level = new Map(); // gap|key -> y
    pieces.forEach((g, gap) => {
      const list = [...g.entries()].sort((p, q) => p[1].order - q[1].order || p[1].x - q[1].x);
      const top = M + offY + gap * ROWH + BH, bottom = M + offY + (gap + 1) * ROWH;
      list.forEach(([k], i) => level.set(gap + "|" + k, top + ((i + 1) * (bottom - top)) / (list.length + 1)));
    });
    lay.chains.forEach((ch, ci) => {
      const { edge, pts } = ch;
      // the arrow head at the user of a premise: at the start on the proof card (pointing up), else at the end
      const yAt = (i) => (i === 0 ? yBottom(pts[0][1]) + (back ? 2 : 0) : i === pts.length - 1 ? yOf(pts[i][1]) - (back ? 0 : 2) : yOf(pts[i][1]) + BH / 2);
      let d = `M${pts[0][0]},${yAt(0)}`;
      for (let i = 1; i < pts.length; i++) {
        if (Math.abs(pts[i][0] - pts[i - 1][0]) < 0.5) { d += `V${yAt(i)}`; continue; }
        const last = i === pts.length - 1, k = last ? "t:" + pts[i][1].id : "e:" + ci + ":" + i;
        d += `V${level.get(pts[i - 1][1].c + "|" + k)}H${pts[i][0]}V${yAt(i)}`;
      }
      const E = edge.orig || edge;
      el("path", { d, class: "fokus-kante" + (E.dashed ? " gestrichelt" : ""), [back ? "marker-start" : "marker-end"]: `url(#${mk})`, "data-from": E.from, "data-to": E.to, "data-via": (E.via || []).join(" ") }, s);
    });
    ids.forEach((x) => {
      const it = lay.item[x], c = byId.get(x);
      const g = el("g", { class: "fokus-knoten" + (x === id ? " ziel" : back ? " oben" : " unten") + (back && x !== id && c.foundation ? " grundlage" : ""), "data-id": x, transform: `translate(${it.cx - BW / 2},${yOf(it)})` }, s);
      el("rect", c.area === FOREIGN ? { width: BW, height: BH, rx: 4, style: `fill:#fbfaf6;fill-opacity:1;stroke:${colorOf(c)};stroke-width:2.6` } : { width: BW, height: BH, rx: 4, fill: colorOf(c) }, g);
      const lines = GL.textLines(plainName(c.name), chars, 2);
      lines.forEach((t, i) => {
        el("text", { x: BW / 2, y: BH / 2 + (i - (lines.length - 1) / 2) * (font + 2) + font / 3, "text-anchor": "middle", style: `font-size:${font}px` }, g).textContent = t;
      });
      // proof card: a theorem with several proofs gets a small switch "1/3" (user, 3 November 2026)
      const P = proofsOf(c);
      // jump to the card of this node, or for a node of another area to its home graph (user, 3 November 2026)
      if (o.switches && x !== id) {
        const j = el("g", { class: "sprung", "data-jump": x, transform: `translate(3,${BH - 14})` }, g);
        el("rect", { width: 17, height: 12, rx: 3 }, j);
        el("text", { x: 8.5, y: 9.5, "text-anchor": "middle" }, j).textContent = "↗";
        el("title", {}, j).textContent = c.foreign && !c.shared ? "Open " + plainName(c.name) + " in " + c.foreign.title.replace(/^the /, "") : "Open the card of " + plainName(c.name);
      }
      // not on nodes of other areas: their premises are not followed here, a switch would show nothing (user, 3 November 2026)
      if (back && o.switches && P.length > 1 && x !== id && !c.foundation && c.area !== FOREIGN) {
        const k = proofChoice.get(x) || 0;
        const b = el("g", { class: "beweis-wahl", "data-proof-of": x, transform: `translate(${BW - 30},${BH - 11})` }, g);
        el("rect", { width: 28, height: 13, rx: 3 }, b);
        el("text", { x: 14, y: 10, "text-anchor": "middle" }, b).textContent = `${k + 1}/${P.length} ›`;
        el("title", {}, b).textContent = `${WORDS.proofWord} ${k + 1} of ${P.length}: ${P[k].name}. Click for the next one.`;
      }
      el("title", {}, g).textContent = plainName(c.name) + (c.area === FOREIGN ? " — " + originName(originOf(c)) : "");
    });
    return s;
  }
  // side view in the panel: all prerequisites, fully expanded (user, 3 November 2026: looks like the card)
  function focusView(id) {
    const ids = localIds(id, "back", Infinity);
    if (ids.length < 2) return "";
    return `<h3>Builds on (${ids.length - 1} ${WORDS.many})</h3>` + layered(ids, id, { mode: "back", BW: 112, BH: 34, GAP: 10, ROWH: 64, M: 6, chars: 16, font: 10, fit: true, cls: "seite", label: WORDS.buildsOn }).outerHTML;
  }
  const stepText = (id) => {
    const m = maxDepth(id, cardMode);
    if (cardMode === "fwd") return (m ? `Consequences (used in some proof; dashed: not in every proof): step ${cardDepth} of ${m}` : "No consequences in this graph") + ". Right click: one step more; click: the proof; × or a click outside closes the card.";
    return (m ? `Proof: step ${cardDepth} of ${m}` : "No prerequisites in this graph") + ". Click: one step more; right click: the consequences; × or a click outside closes the card.";
  };
  // the card over the dimmed graph
  const card = document.createElement("div");
  card.className = "karte";
  card.hidden = true;
  svg.parentNode.appendChild(card);
  // The card opens at once in the size of the fully expanded neighbourhood (all prerequisites above, all consequences
  // below) with the selected node in the horizontal middle; it stays where it is. Only one step in each direction is
  // shown at first; clicks and right clicks show further boxes at their fixed places (user, 3 November 2026).
  let cardFor = null, cardMoved = false; // cardMoved: the card was moved by hand
  function showCard(id) {
    const box = svg.parentNode;
    // closing a card, however, resets it completely (user, 3 November 2026): opened again it starts from scratch
    if (!id) { card.hidden = true; box.classList.remove("mit-karte"); cardFor = null; cardShown = null; cardIds = null; expanded = new Set(); proofChoice.clear(); graphFor = null; jumpStack.length = 0; cardMoved = false; return; }
    if (clickMode === "graph") {
      card.hidden = true; box.classList.remove("mit-karte"); cardFor = null; cardIds = null;
      if (graphFor !== id) { graphFor = id; graphDepth = 1; }
      cardShown = new Set([id, ...within(id, cardMode === "fwd" ? fwdOf : backLocal(id), graphDepth)]);
      return;
    }
    const c = byId.get(id);
    if (cardFor !== id) {
      cardFor = id;
      const P = proofsOf(c), pk = proofChoice.get(id) || 0;
      // the formula of the shown definition, so that two definitions with the same premises can be told apart
      // (user, 3 November 2026: the two definitions of a partial order)
      const shownFormula = pk === 0 ? c.formula : P[pk].formula;
      const switcher = cardMode === "back" && P.length > 1 ? `<div class="karte-beweise">${WORDS.proofWord} ${pk + 1} of ${P.length}: <b>${P[pk].name}</b> <button class="klein-knopf" data-step="-1">‹</button><button class="klein-knopf" data-step="1">›</button>` +
        `${shownFormula && window.katex ? `<div class="karte-formel">${tex(shownFormula)}</div>` : ""}</div>` : "";
      const backBtn = jumpStack.length ? `<button class="klein-knopf karte-zurueck" title="Back to ${plainName(byId.get(jumpStack[jumpStack.length - 1].id).name)}">‹ Back</button> ` : "";
      card.innerHTML = `<div class="karte-kopf">${backBtn}<b>${c.name}</b> <button class="karte-zu" aria-label="Close">×</button>${switcher}</div>`;
      card.querySelectorAll("[data-step]").forEach((bt) => bt.addEventListener("click", (ev) => { ev.stopPropagation(); showProof(id, (pk + Number(bt.dataset.step) + P.length) % P.length); }));
      const body = document.createElement("div");
      body.className = "karte-inhalt";
      // a proof (or definition) that uses nothing of this graph: say so instead of an empty card
      if (cardMode === "back" && P.length && !usesOf(id).length) {
        const note = document.createElement("div");
        note.className = "karte-hinweis";
        note.innerHTML = ((pk === 0 && noPremiseReason(c)) || `This ${WORDS.proofWord.toLowerCase()} uses no other ${WORDS.one} of this graph.`) + (P[pk].idea ? ` <span>${P[pk].idea}</span>` : "");
        card.appendChild(note);
      }
      cardIds = new Set(localIds(id, cardMode, Infinity));
      card.appendChild(body);
      drawCard(id);
      card.hidden = false;
      box.classList.add("mit-karte");
      card.querySelector(".karte-zu").addEventListener("click", (ev) => { ev.stopPropagation(); select(null); });
      // the card as large as the drawing needs (at most the picture), over the node; scrolled so that the node is visible
      // a card moved by hand keeps its place for the following cards until it is closed
      if (!cardMoved) {
        card.style.left = "10px"; card.style.top = "10px";
        const r = box.getBoundingClientRect(), n = nodeEls.get(id).getBoundingClientRect();
        const w = Math.min(card.offsetWidth, r.width - 20), h = Math.min(card.offsetHeight, r.height - 20);
        const x = Math.max(10, Math.min(r.width - w - 10, n.left + n.width / 2 - r.left - w / 2));
        const y = Math.max(10, Math.min(r.height - h - 10, n.top + n.height / 2 - r.top - h / 2));
        card.style.left = x + "px"; card.style.top = y + "px";
      }
      const z = card.querySelector(".fokus-knoten.ziel").getBoundingClientRect(), k = card.getBoundingClientRect();
      card.scrollLeft += z.left + z.width / 2 - (k.left + k.width / 2);
      card.scrollTop += z.top + z.height / 2 - (k.top + k.height / 2);
    }
    else drawCard(id);
  }
  // The card shows only the boxes that are open or opened from (user, 3 November 2026): drawn anew at every click, the
  // direct premises in the row directly above; only the selected node keeps its place.
  const CARD_BOX = { switches: true, BW: 150, BH: 42, GAP: 14, ROWH: 78, M: 10, chars: 22, font: 12, cls: "karte-bild", centre: true };
  let cardLayout = new Map(), cardLayoutFor = null; // places of the boxes of the card shown last
  const boxAt = (g) => { const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(g.getAttribute("transform")); return { x: +m[1], y: +m[2] }; };
  function drawCard(id) {
    const shown = (cardShown = computeShown(id));
    // only edges of opened boxes: into an opened box (proof) or out of an opened box (consequences)
    // every direct use by an opened box is shown, also where a longer way leads there too, as in the side view
    // (user, 3 November 2026)
    const edgeOk = (a, x) => (cardMode === "fwd" ? expanded.has(a) : expanded.has(x));
    const body = card.querySelector(".karte-inhalt"), keep = { left: card.scrollLeft, top: card.scrollTop };
    // the card grows with its content (user, 3 November 2026); the selected node keeps its place on the screen
    // place of the selected box on the screen before redrawing (its rectangle, not the whole group)
    const rootRect = () => { const r = body.querySelector(".fokus-knoten.ziel rect"); return r ? r.getBoundingClientRect() : null; };
    const before = rootRect(), had = new Set([...body.querySelectorAll(".fokus-knoten")].map((g) => g.dataset.id));
    body.innerHTML = "";
    // the places of the boxes are kept while the card belongs to the same node and mode (also when a proof is switched)
    if (cardLayoutFor !== id + "|" + cardMode) { cardLayout = new Map(); cardLayoutFor = id + "|" + cardMode; }
    body.appendChild(layered([...shown], id, { ...CARD_BOX, mode: cardMode, label: byId.get(id).name, edgeOk, keep: cardLayout.size ? cardLayout : null }));
    cardLayout = new Map([...body.querySelectorAll(".fokus-knoten")].map((g) => { const p = boxAt(g); return [g.dataset.id, { r: Math.round((p.y - CARD_BOX.M) / CARD_BOX.ROWH), cx: p.x + CARD_BOX.BW / 2 }]; }));
    card.scrollLeft = keep.left; card.scrollTop = keep.top;
    // the selected box keeps its place on the screen: the card is moved back by the shift measured on the screen; where
    // the card would leave the picture, it is scrolled instead
    const after = rootRect();
    if (before && after) {
      const dx = after.left - before.left, dy = after.top - before.top;
      const left = card.offsetLeft - dx, top = card.offsetTop - dy;
      card.style.left = Math.max(10, left) + "px"; card.style.top = Math.max(10, top) + "px";
      if (left < 10) card.scrollLeft += 10 - left;
      if (top < 10) card.scrollTop += 10 - top;
    }
    // no movement; new boxes and the edges fade in (user, 3 November 2026: calm cards, fading in is fine)
    if (had.size) {
      body.querySelectorAll(".fokus-knoten").forEach((g) => { if (had.has(g.dataset.id)) return; g.style.opacity = "0"; g.style.transition = "opacity .3s"; });
      body.querySelectorAll(".fokus-kante").forEach((p) => { p.style.opacity = "0"; p.style.transition = "opacity .3s"; });
      requestAnimationFrame(() => requestAnimationFrame(() => body.querySelectorAll(".fokus-knoten, .fokus-kante").forEach((x) => { x.style.opacity = ""; })));
    }
    // a box that can still be opened has a small mark
    card.querySelectorAll(".karte-bild .fokus-knoten").forEach((g) => {
      g.classList.toggle("offen", expanded.has(g.dataset.id));
      g.classList.toggle("hat-mehr", !expanded.has(g.dataset.id) && cardNext(id, g.dataset.id).length > 0);
    });
  }
  card.addEventListener("click", (ev) => { ev.stopPropagation();
    const jb = ev.target.closest("[data-jump]");
    if (jb) { jump(jb.dataset.jump); return; }
    if (ev.target.closest(".karte-zurueck")) { history.back(); return; }
    const w = ev.target.closest("[data-proof-of]");
    // another proof at a box: opened as far as the previous one (switchProof)
    if (w) {
      const x = w.dataset.proofOf, n = proofsOf(byId.get(x)).length;
      switchProof(x, ((proofChoice.get(x) || 0) + 1) % n);
      return;
    }
    const t = ev.target.closest("[data-id]"); if (t) toggle(t.dataset.id); });
  card.addEventListener("contextmenu", (ev) => { ev.preventDefault(); ev.stopPropagation(); const t = ev.target.closest("[data-id]"); if (t) toggle(t.dataset.id); });
  card.addEventListener("pointerdown", (ev) => ev.stopPropagation());
  // the card can be moved by its head (user, 3 November 2026)
  let cardDrag = null;
  card.addEventListener("pointerdown", (ev) => {
    const head = ev.target.closest(".karte-kopf");
    if (!head || ev.target.closest("button") || ev.button !== 0) return;
    cardDrag = { x: ev.clientX, y: ev.clientY, left: card.offsetLeft, top: card.offsetTop };
    head.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  card.addEventListener("pointermove", (ev) => {
    if (!cardDrag) return;
    card.style.left = cardDrag.left + ev.clientX - cardDrag.x + "px";
    card.style.top = cardDrag.top + ev.clientY - cardDrag.y + "px";
    cardMoved = true;
  });
  card.addEventListener("pointerup", () => { cardDrag = null; });
  card.addEventListener("wheel", (ev) => ev.stopPropagation());
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && selected) select(null); });


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
      `<span class="hinweis">Hidden unless selected or switched on: “is a”, indirect dependencies (A → C when C uses B and B depends on A), edges only of other ${WORDS.proofWord.toLowerCase()}s (dashed), arrows from other areas${Object.keys(HUBS).filter((h) => byId.has(h)).map((h) => " and from " + byId.get(h).name).join("")}.</span>`,
    ], { closed: true });
  // the mode of the click always visible, outside the collapsed blocks (user, 3 November 2026)
  document.getElementById("controls").innerHTML =
    `<label class="toggle immer" title="On: a click opens the card of the ${WORDS.proofWord.toLowerCase()}, a right click the card of the consequences. Off: a click marks in the graph itself the ${WORDS.many} it builds on, a right click those building on it; each further click on it one step more."><input type="checkbox" id="c-mark"${clickMode === "card" ? " checked" : ""}><span class="regler"></span>click opens a card</label>` +
    block("Display", [
      `<label class="toggle"${isaEdges.length ? "" : ' style="display:none"'}><input type="checkbox" id="c-isa"><span class="regler"></span>all “is a” relations</label>`,
      `<label class="toggle"><input type="checkbox" id="c-trans"><span class="regler"></span>indirect dependencies</label>`,
      ...(usesEdges.some((e) => e.alt) ? [`<label class="toggle"><input type="checkbox" id="c-alt"><span class="regler"></span>edges of other ${WORDS.proofWord.toLowerCase()}s</label>`] : []),
      `<label class="toggle"><input type="checkbox" id="c-basis"><span class="regler"></span>arrows from other areas</label>`,
      ...(outsOf.size ? [`<label class="toggle"><input type="checkbox" id="c-aus"><span class="regler"></span>arrows to other areas</label>`] : []),
      ...Object.keys(HUBS).filter((h) => byId.has(h)).map((h) => `<label class="toggle"><input type="checkbox" class="c-hub"><span class="regler"></span>edges from ${byId.get(h).name}</label>`),
      `<label class="toggle"><input type="checkbox" id="c-names" checked><span class="regler"></span>names</label>`,
      `<button id="c-home">Reset view</button>`,
    ], { closed: true }) +
    // levels in two columns, filled column by column (1 … 5 left, 6 … 10 right)
    block("Levels", [
      `<div class="spalten" style="grid-template-rows:repeat(${Math.ceil(levels.length / 2)},auto)">` + levels.filter((l) => !(OUTSIDE && l === 0)).map((l) =>
        `<label class="toggle" title="${countAt(l)} ${countAt(l) === 1 ? WORDS.one : WORDS.many}"><input type="checkbox" data-level="${l}" checked><span class="regler"></span>${l === 0 ? "prereq." : l} <span class="meta">(${countAt(l)})</span></label>`).join("") + "</div>",
      `<span class="hinweis">${WORDS.levelHint}</span>`,
    ], { closed: true });
  const shownLevels = new Set(levels);
  // The level switches act only while nothing is selected (user, 3 November 2026)
  function applyLevels() {
    const on = (l) => !!selected || shownLevels.has(l);
    concepts.forEach((c) => { nodeEls.get(c.id).style.display = on(level.get(c.id)) ? "" : "none"; });
    edges.forEach((e) => { e.line.style.display = on(level.get(e.from)) && on(level.get(e.to)) ? "" : "none"; });
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
  if (document.getElementById("c-alt")) document.getElementById("c-alt").addEventListener("change", (ev) => svg.classList.toggle("zeige-alt", ev.target.checked));
  document.getElementById("c-basis").addEventListener("change", (ev) => svg.classList.toggle("zeige-basis", ev.target.checked));
  if (document.getElementById("c-aus")) document.getElementById("c-aus").addEventListener("change", (ev) => svg.classList.toggle("zeige-aus", ev.target.checked));
  document.querySelectorAll("#controls .c-hub").forEach((box) => box.addEventListener("change", () => svg.classList.toggle("zeige-hub", box.checked)));
  document.getElementById("c-names").addEventListener("change", (ev) => svg.classList.toggle("ohne-namen", !ev.target.checked));
  document.getElementById("c-mark").addEventListener("change", (ev) => {
    clickMode = ev.target.checked ? "card" : "graph";
    try { localStorage.setItem("concept-graph-click", clickMode); } catch (err) { /* no storage */ }
    const id = selected;
    select(null);
    if (id) step(id, cardMode);
  });
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
  // the button "About this graph" was removed (user, 3 November 2026); the explanation opens only where a page has it
  const about = document.getElementById("about"), aboutOpen = document.getElementById("about-open");
  if (about && aboutOpen) {
    const openAbout = () => { about.hidden = false; document.getElementById("about-close").focus(); };
    const closeAbout = () => { about.hidden = true; aboutOpen.focus(); };
    aboutOpen.addEventListener("click", openAbout);
    document.getElementById("about-close").addEventListener("click", closeAbout);
    about.addEventListener("click", (ev) => { if (ev.target === about) closeAbout(); });
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !about.hidden) closeAbout(); });
  }

  // address #mark=<id> (from a click on a node of this area in another graph): the node is only marked, lit in the
  // dimmed graph, with its panel, the whole graph in view; no card and no premises (user, 3 November 2026)
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h.startsWith("mark=")) { select(h); return; }
    const id = h.slice(5);
    if (!byId.has(id)) { select(null); return; }
    const mode = clickMode;
    clickMode = "graph"; cardMode = "back"; graphFor = id; graphDepth = 0;
    select(id);
    clickMode = mode;
    // the whole graph stays in view, centred as usual (user, 3 November 2026: not the node in the middle)
  }
  window.addEventListener("hashchange", () => { if (Date.now() - restoring < 400) return; fromHash(); });
  fromHash();
  // for tests: concepts whose angle lies outside the sector of their class (concepts of level 1 and higher)
  const outsideSectors = () => concepts.filter((c) => level.get(c.id) >= 1 && c.id !== CENTRE_ID && sectors[secKey(c)]).filter((c) => {
    const p = pos.get(c.id), sec = sectors[secKey(c)];
    const rel = (((Math.atan2(p.y, p.x) - sec.from) % TAU) + TAU) % TAU;
    return rel > sec.w;
  }).map((c) => c.id);
  const edgeLength = () => layoutEdges.reduce((sum, e) => sum + Math.hypot(pos.get(e.from).x - pos.get(e.to).x, pos.get(e.from).y - pos.get(e.to).y), 0);
  // for tests: the fully expanded card of a node (mode "back": proof or definition, "fwd": consequences)
  const cardSvg = (x, mode) => layered(localIds(x, mode, Infinity), x, { ...CARD_BOX, mode, label: x });
  window.CONCEPT_GRAPH = { positions: pos, level, select, centerOn, outsideSectors, edgeLength, circleRadius: rOut, isSettled: () => true, cardSvg, ids: () => concepts.filter((c) => !isPre(c.id)).map((c) => c.id) };
})();
