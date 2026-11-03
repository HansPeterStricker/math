// Graph of the areas (G3, graphs/areas.html; user, 3 November 2026). Computed in the browser from the concept and
// theorem data of all folders of graphs/ (list in shared_scripts/areas.js); there is no data file of its own.
//
// Nodes. Level "areas": one node per folder, plus a grey node per two-digit MSC class for nodes without a home folder
// (area "basic" whose first MSC class has no folder, e.g. "15 Linear and multilinear algebra"). Level "classes": one
// node per folder and three-digit MSC class (the first entry of `msc`), grouped by folder in sectors, and the same grey
// nodes in a sector of their own. A node belongs to the folder of its file; a node with area "basic" whose class does
// have a home folder (13A, 52B, 14M …) counts for that folder. The home folder of a class is the folder with nodes of
// that class whose MSC list in areas.js names it most precisely (then: most nodes); a class without nodes belongs to
// the folder whose MSC list names it (13P -> 13), else to no folder (grey).
//
// Edges, from X to Y (Y uses X); between two nodes at most one edge per kind and direction, its strength the number of
// single edges:
//   def    a concept of X is in `uses` or `isA` of a concept of Y (also in alternative definitions)
//   stmt   a concept of X is in `concepts` of a theorem of Y
//   proof  a theorem of X is a premise of a proof of a theorem of Y (`premises`; `alternativeProofs` counted apart)
//   msc    a node of Y has, not in the first place, an MSC class whose home is X (stands in for "correspondence" and
//          "analogy", which have no fields in the data yet)
// References with a prefix (top:manifold) point to the node in the folder of the prefix (prefixes in the settings of
// the bipartite pages, scripts/bipartite-page.js of each folder, collected in window.AREA_CFG by areas.html).
//
// Layout: the nodes on a circle; the order makes the sum of strength × angular distance small (pairs exchanged as long
// as the sum falls; deterministic). At the level of classes the folders keep the order of the level of areas and only
// the classes within a sector are exchanged. Edges are bands curved towards the centre, wide at X and narrow at Y.
// Address: #level=areas|classes, &min=<n>, &sel=<node key> or &pair=<from key>><to key>.
(function () {
  "use strict";
  const KINDS = [
    { key: "def", name: "Definitional", text: "a concept of X is used in a definition in Y", color: "#d08a2c" },
    { key: "stmt", name: "In statements", text: "a concept of X occurs in the statement of a theorem of Y", color: "#3f7fbf" },
    { key: "proof", name: "Proofs", text: "a theorem of X is a premise of a proof of a theorem of Y", color: "#b03a48" },
    { key: "msc", name: "Shared classification", text: "a node of Y also carries an MSC class whose home is X", color: "#5f9a3a" },
  ];
  // colours of the folders: the colours of origin of the circle graphs (concept-graph.js)
  const ORIGIN_COLORS = { st: "#a39171", ent: "#c97b63", gt: "#6f9e6f", ct: "#6d8fc0", ca: "#c9a33e", ag: "#9d7cbf", ar: "#3f8f8a", ant: "#b5651d", co: "#c77dba", rt: "#7a6fb0", top: "#4f7f9f", ana: "#b04a5a", geo: "#8a9a3a" };
  // MSC 2020, two-digit classes
  const MAIN = {
    "00": "General and overarching topics", "01": "History and biography", "03": "Mathematical logic and foundations", "05": "Combinatorics",
    "06": "Order, lattices, ordered algebraic structures", "08": "General algebraic systems", "11": "Number theory", "12": "Field theory and polynomials",
    "13": "Commutative algebra", "14": "Algebraic geometry", "15": "Linear and multilinear algebra; matrix theory", "16": "Associative rings and algebras",
    "17": "Nonassociative rings and algebras", "18": "Category theory; homological algebra", "19": "K-theory", "20": "Group theory and generalizations",
    "22": "Topological groups, Lie groups", "26": "Real functions", "28": "Measure and integration", "30": "Functions of a complex variable",
    "31": "Potential theory", "32": "Several complex variables and analytic spaces", "33": "Special functions", "34": "Ordinary differential equations",
    "35": "Partial differential equations", "37": "Dynamical systems and ergodic theory", "39": "Difference and functional equations",
    "40": "Sequences, series, summability", "41": "Approximations and expansions", "42": "Harmonic analysis on Euclidean spaces",
    "43": "Abstract harmonic analysis", "44": "Integral transforms, operational calculus", "45": "Integral equations", "46": "Functional analysis",
    "47": "Operator theory", "49": "Calculus of variations and optimal control; optimization", "51": "Geometry", "52": "Convex and discrete geometry",
    "53": "Differential geometry", "54": "General topology", "55": "Algebraic topology", "57": "Manifolds and cell complexes",
    "58": "Global analysis, analysis on manifolds", "60": "Probability theory and stochastic processes", "62": "Statistics", "65": "Numerical analysis",
    "68": "Computer science", "70": "Mechanics of particles and systems", "74": "Mechanics of deformable solids", "76": "Fluid mechanics",
    "78": "Optics, electromagnetic theory", "80": "Classical thermodynamics, heat transfer", "81": "Quantum theory",
    "82": "Statistical mechanics, structure of matter", "83": "Relativity and gravitational theory", "85": "Astronomy and astrophysics",
    "86": "Geophysics", "90": "Operations research, mathematical programming", "91": "Game theory, economics, social and behavioral sciences",
    "92": "Biology and other natural sciences", "93": "Systems theory; control", "94": "Information and communication theory, circuits", "97": "Mathematics education",
  };
  // MSC 2020, three-digit classes whose names are not in the data (the data name a class by a five-digit key or by a
  // group of classes)
  const CLASS_NAMES = {
    "03B": "General logic", "03C": "Model theory", "03E": "Set theory", "03F": "Proof theory and constructive mathematics",
    "11A": "Elementary number theory", "11B": "Sequences and sets", "11H": "Geometry of numbers", "11J": "Diophantine approximation, transcendental number theory",
    "11L": "Exponential sums and character sums", "11R": "Algebraic number theory: global fields", "12D": "Real and complex fields",
    "12F": "Field extensions", "13P": "Computational aspects and applications of commutative rings", "15A": "Basic linear algebra", "15B": "Special matrices",
    "16B": "General and miscellaneous", "16D": "Modules, bimodules and ideals", "16K": "Division rings and semisimple Artin rings", "16S": "Rings and algebras arising under various constructions",
    "26A": "Functions of one variable", "26B": "Functions of several variables", "26D": "Inequalities", "28A": "Classical measure theory",
    "28C": "Set functions and measures on spaces with additional structure", "30A": "General properties of functions of one complex variable",
    "30B": "Series expansions", "30C": "Geometric function theory", "30D": "Entire and meromorphic functions", "30E": "Miscellaneous topics of analysis in the complex plane",
    "30F": "Riemann surfaces", "31A": "Two-dimensional potential theory", "32C": "Analytic spaces", "32Q": "Complex manifolds", "33B": "Elementary classical functions",
    "34A": "General theory for ordinary differential equations", "40A": "Convergence and divergence of infinite limiting processes", "40G": "Special methods of summability",
    "41A": "Approximations and expansions", "42A": "Harmonic analysis in one variable", "42B": "Harmonic analysis in several variables", "43A": "Abstract harmonic analysis",
    "46A": "Topological linear spaces", "46B": "Normed linear spaces and Banach spaces", "46C": "Inner product and Hilbert spaces", "46E": "Linear function spaces and their duals",
    "46F": "Distributions, generalized functions", "46H": "Topological algebras, Banach algebras", "46L": "Selfadjoint operator algebras",
    "47A": "General theory of linear operators", "47B": "Special classes of linear operators", "47H": "Nonlinear operators",
    "60A": "Foundations of probability theory", "60E": "Distribution theory", "60J": "Markov processes", "81T": "Quantum field theory",
  };

  // ------------------------------------------------------------ data
  function build(W) {
    const missing = [];
    const folders = W.GRAPH_AREAS.map((a, i) => {
      const cfg = (W.AREA_CFG || []).find((c) => c.folder === a.folder) || {};
      return { i, folder: a.folder, name: a.name, msc: a.msc, codes: a.msc.split(/,\s*/), prefix: cfg.prefix, colors: cfg.colors || {}, C: W[a.concepts], T: W[a.theorems], color: ORIGIN_COLORS[cfg.prefix] || "#8a7f6e" };
    });
    const items = [], cIndex = new Map(), tIndex = new Map();
    folders.forEach((f) => {
      (f.C ? f.C.concepts : []).forEach((d) => { if (d.id.includes(":")) return; const it = { type: "c", id: d.id, d, f }; items.push(it); cIndex.set(f.prefix + ":" + d.id, it); });
      (f.T ? f.T.theorems : []).forEach((d) => { if (d.id.includes(":")) return; const it = { type: "t", id: d.id, d, f }; items.push(it); tIndex.set(f.prefix + ":" + d.id, it); });
    });
    const clsOf = (d) => (d.msc && d.msc[0]) || (/^\d\d[A-Z]/.test(d.area) ? d.area.slice(0, 3) : "00A");
    // home folder of a class
    const counts = new Map();
    items.forEach((it) => {
      if (it.d.area === "basic") return;
      const c = clsOf(it.d), m = counts.get(c) || new Map();
      m.set(it.f, (m.get(it.f) || 0) + 1);
      counts.set(c, m);
    });
    const listed = (f, cls) => Math.max(0, ...f.codes.filter((code) => cls.startsWith(code)).map((code) => code.length));
    const homes = new Map();
    function home(cls) {
      if (homes.has(cls)) return homes.get(cls);
      const m = counts.get(cls);
      const cands = (m ? [...m.keys()] : folders).map((f) => ({ f, s: listed(f, cls), n: m ? m.get(f) : 0 })).filter((x) => m || x.s > 0)
        .sort((a, b) => b.s - a.s || b.n - a.n || a.f.i - b.f.i);
      const h = cands.length ? cands[0].f : null;
      homes.set(cls, h);
      return h;
    }
    // nodes of the graph ("units")
    const units = { areas: new Map(), classes: new Map() };
    const unit = (level, key, make) => {
      let u = units[level].get(key);
      if (!u) { u = Object.assign(make(), { key, level, items: [] }); units[level].set(key, u); }
      return u;
    };
    const mainName = (m) => MAIN[m] || "MSC " + m;
    const grayUnit = (level, m) => unit(level, "msc." + m, () => ({ gray: true, main: m, code: m, areaKey: "msc." + m, label: m + " " + mainName(m).split(";")[0], name: m + " " + mainName(m), color: "#9a9286" }));
    const otherUnit = (level) => unit(level, "msc.other", () => ({ gray: true, other: true, main: "other", code: "oth", areaKey: "msc.other", label: "Other MSC classes", name: "Other MSC classes without a folder and without nodes", color: "#9a9286", codes: new Set() }));
    const areaUnit = (f) => unit("areas", f.prefix, () => ({ folder: f, code: f.prefix, areaKey: f.prefix, label: f.name, name: f.name, color: f.color }));
    const className = (f, cls) => {
      for (const g of [f].concat(folders)) for (const A of [g.C && g.C.areas, g.T && g.T.areas]) if (A && A[cls]) return A[cls].replace(/^\S+\s+/, "");
      return CLASS_NAMES[cls] || mainName(cls.slice(0, 2));
    };
    const classUnit = (f, cls) => unit("classes", f.prefix + "." + cls, () => ({ folder: f, cls, code: cls, areaKey: f.prefix, label: cls + " " + className(f, cls), name: cls + " " + className(f, cls) + " (" + f.name + ")", color: f.color }));
    items.forEach((it) => {
      const cls = clsOf(it.d);
      const f = it.d.area === "basic" ? home(cls) : it.f;
      it.cls = cls;
      it.moved = it.d.area === "basic" && !!f;
      it.au = f ? areaUnit(f) : grayUnit("areas", cls.slice(0, 2));
      it.cu = f ? classUnit(f, cls) : grayUnit("classes", cls.slice(0, 2));
      it.au.items.push(it);
      it.cu.items.push(it);
    });
    // colour of a class: the colour its folder gives to the most frequent area key of its nodes
    units.classes.forEach((u) => {
      if (u.gray) return;
      const n = new Map();
      u.items.forEach((it) => { if (it.d.area !== "basic") n.set(it.d.area, (n.get(it.d.area) || 0) + 1); });
      const k = [...n.entries()].sort((a, b) => b[1] - a[1])[0];
      u.color = (k && u.folder.colors[k[0]]) || u.folder.colors[u.cls] || u.folder.color;
    });
    // single edges
    const singles = [];
    const resolve = (index, ref, it) => {
      const key = ref.includes(":") ? ref : it.f.prefix + ":" + ref, x = index.get(key);
      if (!x) missing.push(it.f.prefix + ":" + it.id + " -> " + ref);
      return x;
    };
    const collect = (index, it, std, alt, kind) => {
      const seen = new Map();
      std.forEach((r) => { const x = resolve(index, r, it); if (x && x !== it) seen.set(x, false); });
      alt.forEach((r) => { const x = resolve(index, r, it); if (x && x !== it && !seen.has(x)) seen.set(x, true); });
      seen.forEach((a, x) => singles.push({ kind, from: x, to: it, alt: a }));
    };
    items.forEach((it) => {
      const d = it.d;
      if (it.type === "c") {
        collect(cIndex, it, (d.uses || []).concat(d.isA || []), (d.alternativeDefinitions || []).flatMap((a) => (a.uses || []).concat(a.isA || [])), "def");
      } else {
        collect(cIndex, it, d.concepts || [], [], "stmt");
        collect(tIndex, it, d.premises || [], (d.alternativeProofs || []).flatMap((p) => p.premises || []), "proof");
      }
      [...new Set((d.msc || []).slice(1))].filter((c) => c !== it.cls).forEach((c) => singles.push({ kind: "msc", code: c, to: it }));
    });
    // edges per level
    const edges = { areas: new Map(), classes: new Map() };
    const source = (level, s) => {
      if (s.kind !== "msc") return level === "areas" ? s.from.au : s.from.cu;
      const h = home(s.code);
      // a class without folder and without nodes: one grey node "other MSC classes" for all of them
      if (!h) return units[level].has("msc." + s.code.slice(0, 2)) ? grayUnit(level, s.code.slice(0, 2)) : otherUnit(level);
      return level === "areas" ? areaUnit(h) : classUnit(h, s.code);
    };
    singles.forEach((s) => ["areas", "classes"].forEach((level) => {
      const a = source(level, s), b = level === "areas" ? s.to.au : s.to.cu;
      if (a === b) return;
      const k = s.kind + "|" + a.key + "|" + b.key;
      let e = edges[level].get(k);
      if (!e) edges[level].set(k, (e = { kind: s.kind, from: a, to: b, singles: [], alt: 0 }));
      e.singles.push(s);
      if (s.alt) e.alt++;
      if (a.other) a.codes.add(s.code);
    }));
    return { folders, items, units, edges, singles, home, missing, KINDS };
  }
  window.AREA_GRAPH_BUILD = build;
  if (typeof document === "undefined" || !document.getElementById("areas")) return;

  // ------------------------------------------------------------ page
  const G = build(window);
  if (G.missing.length) console.warn("graph of areas: unknown references\n" + G.missing.join("\n"));
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻", "−": "⁻", n: "ⁿ", i: "ⁱ", d: "ᵈ", k: "ᵏ", m: "ᵐ", p: "ᵖ", e: "ᵉ", r: "ʳ", x: "ˣ", "*": "*" };
  const SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", "+": "₊", "-": "₋", "−": "₋", n: "ₙ", k: "ₖ", p: "ₚ", i: "ᵢ", m: "ₘ", e: "ₑ", x: "ₓ" };
  const conv = (t, map, mark) => ([...t].every((ch) => map[ch]) ? [...t].map((ch) => map[ch]).join("") : mark + t);
  const plain = (n) => n.replace(/<sup>(.*?)<\/sup>/g, (m, t) => conv(t, SUP, "^")).replace(/<sub>(.*?)<\/sub>/g, (m, t) => conv(t, SUB, "_")).replace(/<[^>]+>/g, "");
  const KIND = new Map(G.KINDS.map((k, i) => [k.key, Object.assign(k, { i })]));

  const state = { level: "areas", min: { areas: 3, classes: 2 }, kinds: new Set(G.KINDS.map((k) => k.key)), alt: true, sel: null, pair: null };
  const strength = (e) => e.singles.length - (state.alt ? 0 : e.alt);
  const shown = (e) => state.kinds.has(e.kind) && strength(e) > 0 && strength(e) >= state.min[state.level];

  // ------------------------------------------------------------ order on the circle
  const GAP = { areas: 1, classes: 1.6 }; // empty slots between the sectors and before the grey nodes
  function slots(level, groups) {
    // groups: arrays of units; angle of each unit from its slot, a gap between the groups
    // at the level of areas a grey node takes less than half the room of an area
    const room = (u) => (u.gray && level === "areas" ? 0.38 : 1);
    const total = groups.reduce((s, g) => s + g.reduce((t, u) => t + room(u), 0), 0) + GAP[level] * groups.length;
    let pos = GAP[level] / 2;
    groups.forEach((g) => {
      g.from = pos;
      g.forEach((u) => { u.angle = -Math.PI / 2 + (2 * Math.PI * (pos + room(u) / 2)) / total; pos += room(u); });
      g.to = pos;
      pos += GAP[level];
    });
    groups.total = total;
  }
  function optimise(level, groups) {
    const w = new Map();
    G.edges[level].forEach((e) => { const k = e.from.key < e.to.key ? e.from.key + "\n" + e.to.key : e.to.key + "\n" + e.from.key; w.set(k, (w.get(k) || 0) + e.singles.length); });
    const pairs = [...w.entries()].map(([k, n]) => { const [a, b] = k.split("\n"); return [G.units[level].get(a), G.units[level].get(b), n]; });
    const cost = () => {
      slots(level, groups);
      let s = 0;
      for (const [a, b, n] of pairs) { let d = Math.abs(a.angle - b.angle); if (d > Math.PI) d = 2 * Math.PI - d; s += n * d; }
      return s;
    };
    let best = cost();
    for (let improved = true, rounds = 0; improved && rounds < 50; rounds++) {
      improved = false;
      groups.forEach((g) => {
        if (g.fixed) return;
        for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
          [g[i], g[j]] = [g[j], g[i]];
          const c = cost();
          if (c < best - 1e-9) { best = c; improved = true; } else [g[i], g[j]] = [g[j], g[i]];
        }
      });
    }
    slots(level, groups);
    return best;
  }
  const byCode = (a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
  const grayList = (level) => [...G.units[level].values()].filter((u) => u.gray).sort(byCode);
  // level of areas: the folders in one group (exchanged among themselves), the grey nodes in a second one
  const areaGroups = [G.folders.map((f) => G.units.areas.get(f.prefix)).filter(Boolean), grayList("areas")].filter((g) => g.length);
  optimise("areas", areaGroups.length > 1 ? areaGroups : areaGroups);
  // with the folders as one group, the order is a single sequence; turned so that the grey block is at the bottom left
  const folderOrder = areaGroups[0].map((u) => u.folder);
  // level of classes: one sector per folder in the order of the level of areas, the grey nodes last
  const classGroups = folderOrder.map((f) => {
    const g = [...G.units.classes.values()].filter((u) => u.folder === f).sort(byCode);
    g.folder = f;
    return g;
  }).filter((g) => g.length);
  const grayClasses = grayList("classes");
  if (grayClasses.length) { grayClasses.gray = true; classGroups.push(grayClasses); }
  optimise("classes", classGroups);
  const GROUPS = { areas: areaGroups, classes: classGroups };

  // ------------------------------------------------------------ drawing
  const svg = document.getElementById("areas");
  const box = svg.parentNode;
  svg.classList.add("area-graph");
  const GEO = {
    areas: { R: 300, r: (n) => 5 + 2.2 * Math.sqrt(n), w: (n) => 1 + 1.25 * Math.sqrt(n), side: 330, pad: 70 },
    classes: { R: 470, r: (n) => 2.5 + 1.15 * Math.sqrt(n), w: (n) => 0.7 + 0.9 * Math.sqrt(n), side: 250, pad: 245 },
  };
  const tip = document.createElement("div");
  tip.className = "knoten-tip mehrzeilig";
  tip.hidden = true;
  document.body.appendChild(tip);
  const moveTip = (ev) => { tip.style.left = ev.clientX + 14 + "px"; tip.style.top = ev.clientY + 14 + "px"; };
  let hoverTimer = null;
  const layers = {};
  const P = (r, a) => ({ x: r * Math.cos(a), y: r * Math.sin(a) });
  const fmt = (p) => p.x.toFixed(1) + "," + p.y.toFixed(1);

  // a band from a to b: quadratic curve bent towards the centre, wide at a, narrow at b; the two directions between two
  // nodes and the four kinds bend a little apart
  function band(e, geo) {
    const a = e.from, b = e.to, k = KIND.get(e.kind).i;
    const p0 = P(geo.R - a.r - 1, a.angle), p2 = P(geo.R - b.r - 1, b.angle);
    const dx = p2.x - p0.x, dy = p2.y - p0.y, len = Math.hypot(dx, dy) || 1;
    const beta = 0.62 - 0.08 * k;
    const off = (state.level === "areas" ? 9 : 5) * (1 + k * 0.6);
    const c = { x: ((p0.x + p2.x) / 2) * beta - (dy / len) * off, y: ((p0.y + p2.y) / 2) * beta + (dx / len) * off };
    const w0 = geo.w(strength(e)), N = 28, left = [], right = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, u = 1 - t;
      const x = u * u * p0.x + 2 * u * t * c.x + t * t * p2.x, y = u * u * p0.y + 2 * u * t * c.y + t * t * p2.y;
      let tx = 2 * u * (c.x - p0.x) + 2 * t * (p2.x - c.x), ty = 2 * u * (c.y - p0.y) + 2 * t * (p2.y - c.y);
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      const h = Math.max(0.35, w0 * (1 - 0.8 * t)) / 2;
      left.push({ x: x - ty * h, y: y + tx * h });
      right.push({ x: x + ty * h, y: y - tx * h });
    }
    return "M" + left.map(fmt).join("L") + "L" + right.reverse().map(fmt).join("L") + "Z";
  }

  function draw() {
    const level = state.level, geo = GEO[level], R = geo.R;
    svg.innerHTML = "";
    svg.classList.toggle("klassen", level === "classes");
    const gSectors = el("g", { class: "sektoren" }, svg), gEdges = el("g", { class: "kanten" }, svg), gNodes = el("g", { class: "knoten-alle" }, svg);
    Object.assign(layers, { gEdges, gNodes });
    const units = GROUPS[level].flat();
    units.forEach((u) => { u.r = geo.r(Math.max(1, u.items.length)); const p = P(R, u.angle); u.x = p.x; u.y = p.y; });
    // sectors (level of classes): pale wedges in the colour of the folder, the name on an arc outside the names
    if (level === "classes") {
      const step = (2 * Math.PI) / GROUPS.classes.total;
      GROUPS.classes.forEach((g, gi) => {
        const a0 = -Math.PI / 2 + (g.from - 0.35) * step, a1 = -Math.PI / 2 + (g.to + 0.35) * step;
        const rIn = R - 40, rOut = R + 195, large = a1 - a0 > Math.PI ? 1 : 0;
        el("path", { d: `M${fmt(P(rIn, a0))}L${fmt(P(rOut, a0))}A${rOut},${rOut} 0 ${large} 1 ${fmt(P(rOut, a1))}L${fmt(P(rIn, a1))}A${rIn},${rIn} 0 ${large} 0 ${fmt(P(rIn, a0))}Z`, class: "sektor" + (g.gray ? " grau" : ""), fill: g.gray ? "#b9ad9a" : g.folder.color }, gSectors);
        const m = (a0 + a1) / 2, low = Math.sin(m) > 0, rT = rOut + (low ? 26 : 10), half = Math.PI / 2;
        const id = "sektor-" + gi;
        el("path", { id, d: `M${fmt(P(rT, low ? m + half : m - half))}A${rT},${rT} 0 0 ${low ? 0 : 1} ${fmt(P(rT, low ? m - half : m + half))}`, fill: "none", stroke: "none" }, gSectors);
        const t = el("text", { class: "sektor-name" }, gSectors);
        const full = g.gray ? "No folder yet" : g.folder.name, room = Math.max(3, Math.floor(((a1 - a0) * rT) / 9.5));
        el("textPath", { href: "#" + id, startOffset: "50%", "text-anchor": "middle" }, t).textContent = full.length <= room ? full : full.slice(0, room - 1).replace(/[\s,;]+\S*$/, "") + " …";
        el("title", {}, t).textContent = full;
      });
    }
    // bands, the widest first so that thin ones stay visible on top
    G.edges[level].forEach((e) => { e.path = null; });
    [...G.edges[level].values()].filter(shown).sort((x, y) => strength(y) - strength(x)).forEach((e) => {
      e.path = el("path", { class: "band k-" + e.kind, d: band(e, geo), fill: KIND.get(e.kind).color }, gEdges);
      e.path.addEventListener("mouseenter", (ev) => { tip.textContent = edgeTip(e); tip.hidden = false; moveTip(ev); });
      e.path.addEventListener("mousemove", moveTip);
      e.path.addEventListener("mouseleave", () => { tip.hidden = true; });
      e.path.addEventListener("click", (ev) => { ev.stopPropagation(); if (dragged()) return; selectPair(e.from.key, e.to.key); });
    });
    // nodes and names
    units.forEach((u) => {
      const g = el("g", { class: "knoten" + (u.gray ? " grau" : "") + (u.items.length ? "" : " leer"), "data-key": u.key, transform: `translate(${u.x.toFixed(1)},${u.y.toFixed(1)})` }, gNodes);
      el("circle", { r: u.r, class: "form", fill: u.gray || !u.items.length ? "#fbfaf6" : u.color }, g);
      const deg = (u.angle * 180) / Math.PI, c = Math.cos(u.angle), s = Math.sin(u.angle);
      let t;
      if (level === "areas") {
        const d = u.r + 7, anchor = c > 0.25 ? "start" : c < -0.25 ? "end" : "middle";
        t = el("text", { x: c * d, y: s * d + (Math.abs(c) <= 0.25 ? (s > 0 ? 12 : -4) : 4), "text-anchor": anchor }, g);
        t.textContent = u.label;
      } else {
        const flip = c < 0, d = u.r + 5;
        t = el("text", { x: flip ? -d : d, y: 0, dy: ".35em", "text-anchor": flip ? "end" : "start", transform: `rotate(${flip ? deg + 180 : deg})` }, g);
        t.textContent = u.label.length > 31 ? u.label.slice(0, 30).replace(/[\s,;:]+\S*$/, "") + " …" : u.label;
      }
      u.g = g;
      g.addEventListener("mouseenter", (ev) => { tip.textContent = unitTip(u); tip.hidden = false; moveTip(ev); clearTimeout(hoverTimer); hoverTimer = setTimeout(() => hover(u), 500); });
      g.addEventListener("mousemove", moveTip);
      g.addEventListener("mouseleave", () => { tip.hidden = true; clearTimeout(hoverTimer); hover(null); });
      g.addEventListener("click", (ev) => { ev.stopPropagation(); if (dragged()) return; select(state.sel === u.key ? null : u.key); });
    });
    view = fit();
    applyView();
    mark();
  }

  // ------------------------------------------------------------ view box, pan and zoom (as in the circle graphs)
  let view = null;
  const fit = () => { const g = GEO[state.level], R = g.R; return { x: -R - g.side, y: -R - g.pad, w: 2 * (R + g.side), h: 2 * (R + g.pad) }; };
  const applyView = () => svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const scale = () => Math.max(view.w / svg.clientWidth, view.h / svg.clientHeight);
  svg.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const f = ev.deltaY > 0 ? 1.15 : 1 / 1.15, rect = svg.getBoundingClientRect(), s = scale();
    const cx = view.x + view.w / 2 + (ev.clientX - rect.left - rect.width / 2) * s;
    const cy = view.y + view.h / 2 + (ev.clientY - rect.top - rect.height / 2) * s;
    view = { x: cx - (cx - view.x) * f, y: cy - (cy - view.y) * f, w: view.w * f, h: view.h * f };
    applyView();
  }, { passive: false });
  let drag = null, moved = false;
  const dragged = () => moved;
  svg.addEventListener("pointerdown", (ev) => { if (ev.button === 0) { drag = { x: ev.clientX, y: ev.clientY, v: { ...view } }; moved = false; } });
  window.addEventListener("pointermove", (ev) => {
    if (!drag) return;
    const s = scale(), dx = (ev.clientX - drag.x) * s, dy = (ev.clientY - drag.y) * s;
    if (Math.abs(ev.clientX - drag.x) + Math.abs(ev.clientY - drag.y) > 4) { moved = true; box.classList.add("dragging"); }
    if (!moved) return;
    view = { ...drag.v, x: drag.v.x - dx, y: drag.v.y - dy };
    applyView();
  });
  window.addEventListener("pointerup", () => { drag = null; box.classList.remove("dragging"); setTimeout(() => { moved = false; }, 0); });
  svg.addEventListener("click", () => { if (!moved) clear(); });

  // ------------------------------------------------------------ counts
  const visibleEdges = () => [...G.edges[state.level].values()].filter((e) => state.kinds.has(e.kind) && strength(e) > 0);
  // the strongest partners of a node (all kinds switched on, both directions)
  function partners(u) {
    const m = new Map();
    visibleEdges().forEach((e) => {
      const o = e.from === u ? e.to : e.to === u ? e.from : null;
      if (!o) return;
      const x = m.get(o) || { u: o, out: 0, in: 0 };
      if (e.from === u) x.out += strength(e); else x.in += strength(e);
      m.set(o, x);
    });
    return [...m.values()].sort((a, b) => b.out + b.in - a.out - a.in || byCode(a.u, b.u));
  }
  const itemCount = (u) => {
    const c = u.items.filter((it) => it.type === "c").length, t = u.items.length - c;
    return `${c} concept${c === 1 ? "" : "s"}, ${t} theorem${t === 1 ? "" : "s"}`;
  };
  function unitTip(u) {
    const top = partners(u).slice(0, 3).map((p) => `  ${p.u.label}: ${p.in} in, ${p.out} out`);
    return [u.name, itemCount(u) + (u.gray ? " without a home folder" : ""), top.length ? "Strongest connections:" : "No connections of the kinds shown"].concat(top).join("\n");
  }
  const edgeTip = (e) => `${KIND.get(e.kind).name}: ${e.from.label} → ${e.to.label}, ${strength(e)}` + (e.kind === "proof" && e.alt ? ` (${e.singles.length - e.alt} standard, ${e.alt} alternative only)` : "");

  // ------------------------------------------------------------ selection
  function hover(u) {
    if (state.sel || state.pair) return;
    svg.classList.toggle("fokus", !!u);
    svg.querySelectorAll(".hell").forEach((x) => x.classList.remove("hell"));
    if (u) u.g.classList.add("hell");
  }
  const pairMatch = (e) => {
    const p = state.pair;
    if (!p) return false;
    const exact = G.units[state.level].has(p.from) && G.units[state.level].has(p.to);
    return exact ? e.from.key === p.from && e.to.key === p.to : e.from.areaKey === p.from && e.to.areaKey === p.to;
  };
  function mark() {
    svg.querySelectorAll(".hell, .gewaehlt").forEach((x) => x.classList.remove("hell", "gewaehlt"));
    const u = state.sel && G.units[state.level].get(state.sel);
    const on = !!(u || state.pair);
    svg.classList.toggle("fokus", on);
    if (!on) return;
    G.edges[state.level].forEach((e) => {
      if (!e.path) return;
      const lit = u ? e.from === u || e.to === u : pairMatch(e);
      if (!lit) return;
      e.path.classList.add("hell");
      e.from.g.classList.add("hell");
      e.to.g.classList.add("hell");
      layers.gEdges.appendChild(e.path);
    });
    if (u) u.g.classList.add("hell", "gewaehlt");
    else GROUPS[state.level].flat().forEach((x) => { if (x.key === state.pair.from || x.key === state.pair.to || x.areaKey === state.pair.from || x.areaKey === state.pair.to) x.g.classList.add("hell"); });
  }
  function select(key) {
    state.sel = key && G.units[state.level].has(key) ? key : null;
    state.pair = null;
    update();
  }
  function selectPair(from, to) {
    state.sel = null;
    state.pair = { from, to };
    update();
  }
  function clear() { state.sel = null; state.pair = null; update(); }
  function update() { mark(); panel.innerHTML = state.sel ? unitPanel(G.units[state.level].get(state.sel)) : state.pair ? pairPanel() : overview(); writeHash(); }

  // ------------------------------------------------------------ panel
  const panel = document.getElementById("panel");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const chip = (u) => `<span class="chip" data-unit="${u.key}"><i style="background:${u.gray || !u.items.length ? "#fbfaf6" : u.color};border-color:${u.gray ? "#9a9286" : u.color}"></i>${esc(u.label)}</span>`;
  const link = (it) => `<a href="${it.f.folder}/${it.type === "c" ? "concepts" : "theorems"}.html#mark=${encodeURIComponent(it.id)}">${it.d.name}</a> <span class="meta">(${it.f.prefix})</span>`;
  const VERB = { def: "in the definition of", stmt: "in the statement of", proof: "in a proof of" };
  const singleText = (s) => s.kind === "msc"
    ? `${link(s.to)} is also classified under ${s.code}`
    : `${link(s.from)} → ${VERB[s.kind]} ${link(s.to)}${s.alt ? (s.kind === "proof" ? " <span class=\"meta\">(alternative proof only)</span>" : " <span class=\"meta\">(alternative definition only)</span>") : ""}`;
  const countText = (e) => {
    const n = strength(e);
    if (!e.alt) return String(n);
    return `${n} <span class="meta">(${e.singles.length - e.alt} ${e.kind === "proof" ? "standard proofs" : "standard definitions"}, ${e.alt} alternative only${state.alt ? "" : ", not counted"})</span>`;
  };
  const singlesList = (e) => `<ul class="einzel">${e.singles.filter((s) => state.alt || !s.alt).map((s) => `<li>${singleText(s)}</li>`).join("")}</ul>`;
  const kindHead = (k) => `<h3 class="art"><i style="background:${k.color}"></i>${k.name}</h3>`;
  function unitPanel(u) {
    let html = `<h2>${esc(u.name)}</h2><div class="meta">${u.other ? "MSC " + [...u.codes].sort().join(", ") + "; classes named only in the MSC lists of other nodes. " : u.gray ? "MSC " + u.main + "; no folder of these graphs yet. " : u.level === "classes" ? "MSC " + u.cls + " in " + esc(u.folder.name) + ". " : "MSC " + esc(u.folder.msc) + ". "}${itemCount(u)}.</div>`;
    if (!u.gray && u.level === "areas") html += `<p class="meta"><a href="${u.folder.folder}/concepts.html">Concepts</a> · <a href="${u.folder.folder}/theorems.html">Theorems</a> · <a href="${u.folder.folder}/bipartite.html">In theorems</a></p>`;
    if (u.gray || u.items.some((it) => it.moved)) {
      const list = u.items.filter((it) => u.gray || it.moved);
      html += `<details class="liste"><summary>${u.gray ? "Nodes of this class, provisionally in other folders" : "Nodes counted here from other folders (area “basic”)"} (${list.length})</summary><ul class="einzel">${list.map((it) => `<li>${link(it)} <span class="meta">MSC ${(it.d.msc || []).join(", ")}</span></li>`).join("")}</ul></details>`;
    }
    G.KINDS.filter((k) => state.kinds.has(k.key)).forEach((k) => {
      const es = visibleEdges().filter((e) => e.kind === k.key && (e.from === u || e.to === u));
      if (!es.length) return;
      html += kindHead(k);
      [["Uses (from → here)", (e) => e.to === u, (e) => e.from], ["Used by (here → to)", (e) => e.from === u, (e) => e.to]].forEach(([title, f, other]) => {
        const rows = es.filter(f).sort((a, b) => strength(b) - strength(a) || byCode(other(a), other(b)));
        if (!rows.length) return;
        const sum = rows.reduce((s, e) => s + strength(e), 0);
        html += `<div class="richtung">${title}: ${sum}</div>` + rows.map((e) => `<details class="zeile${strength(e) < state.min[state.level] ? " schwach" : ""}"><summary>${chip(other(e))} ${countText(e)}</summary>${singlesList(e)}</details>`).join("");
      });
    });
    return html;
  }
  function pairPanel() {
    const p = state.pair, U = G.units[state.level];
    const label = (k) => (U.get(k) || G.units.areas.get(k) || { label: k }).label;
    let html = `<h2>${esc(label(p.from))} → ${esc(label(p.to))}</h2><p class="meta">What ${esc(label(p.to))} uses from ${esc(label(p.from))}. <a href="#" data-swap="1">Other direction</a></p>`;
    let any = false;
    G.KINDS.filter((k) => state.kinds.has(k.key)).forEach((k) => {
      const es = visibleEdges().filter((e) => e.kind === k.key && pairMatch(e));
      if (!es.length) return;
      any = true;
      const sum = es.reduce((s, e) => s + strength(e), 0);
      html += kindHead(k) + `<div class="richtung">${sum}</div>`;
      html += es.length === 1 ? `<details class="zeile" open><summary>${countText(es[0])}</summary>${singlesList(es[0])}</details>`
        : es.sort((a, b) => strength(b) - strength(a)).map((e) => `<details class="zeile"><summary>${chip(e.from)} → ${chip(e.to)} ${countText(e)}</summary>${singlesList(e)}</details>`).join("");
    });
    return html + (any ? "" : `<p>No edges of the kinds shown.</p>`);
  }
  // table of the areas: row X, column Y, number of single edges from X to Y of the kinds shown
  function overview() {
    const A = GROUPS.areas.flat(), m = new Map();
    let max = 1;
    [...G.edges.areas.values()].filter((e) => state.kinds.has(e.kind)).forEach((e) => {
      const k = e.from.key + ">" + e.to.key, v = (m.get(k) || 0) + strength(e);
      m.set(k, v);
      max = Math.max(max, v);
    });
    const used = A.filter((u) => A.some((v) => m.get(u.key + ">" + v.key) || m.get(v.key + ">" + u.key)));
    const head = (u) => `<th title="${esc(u.name)}" data-unit="${u.key}"><span>${esc(u.code)}</span></th>`;
    const rows = used.map((x) => `<tr>${head(x)}${used.map((y) => {
      const v = m.get(x.key + ">" + y.key) || 0;
      return x === y ? `<td class="leer"></td>` : `<td${v ? ` data-from="${x.key}" data-to="${y.key}" title="${esc(x.label)} → ${esc(y.label)}: ${v}" style="background:rgba(120,90,50,${(0.08 + 0.75 * Math.log(1 + v) / Math.log(1 + max)).toFixed(2)})${Math.log(1 + v) / Math.log(1 + max) > 0.55 ? ";color:#fff" : ""}"` : ""}>${v || ""}</td>`;
    }).join("")}</tr>`).join("");
    const totals = G.KINDS.filter((k) => state.kinds.has(k.key)).map((k) => {
      const n = [...G.edges.areas.values()].filter((e) => e.kind === k.key).reduce((s, e) => s + strength(e), 0);
      return `<span class="summe"><i style="background:${k.color}"></i>${k.name}: ${n}</span>`;
    }).join("");
    return `<h2>Graph of the areas</h2>
      <p class="meta">${G.folders.length} areas, ${grayList("areas").length} MSC classes without a folder (grey). Single edges between different areas of the kinds shown:</p><p>${totals}</p>
      <h3>From row to column</h3>
      <p class="meta">Row X, column Y: how often Y uses X. A click on a number marks these edges; a click on a name selects the area.</p>
      <div class="matrix-box"><table class="matrix"><thead><tr><th></th>${used.map(head).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
      <p class="meta">${used.map((u) => (u.gray ? esc(u.label) : `<b>${esc(u.code)}</b> ${esc(u.label)}`)).join(" · ")}</p>
      <p class="meta">The contents were compiled with the help of a language model and have not been checked by a specialist.</p>`;
  }
  panel.addEventListener("click", (ev) => {
    const sw = ev.target.closest("[data-swap]");
    if (sw) { ev.preventDefault(); selectPair(state.pair.to, state.pair.from); return; }
    const cell = ev.target.closest("[data-from]");
    if (cell) { selectPair(cell.dataset.from, cell.dataset.to); return; }
    const c = ev.target.closest("[data-unit]");
    if (!c || ev.target.closest("a")) return;
    ev.preventDefault();
    const key = c.dataset.unit;
    if (G.units[state.level].has(key)) select(key);
    else if (state.level === "classes" && G.units.areas.has(key)) { setLevel("areas"); select(key); }
  });
  box.addEventListener("click", (ev) => { if (ev.target === box) clear(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && ev.target !== searchBox) clear(); });

  // ------------------------------------------------------------ sidebar: level, kinds, threshold, legend
  const block = (title, items, o = {}) =>
    `<details class="block"${o.closed ? "" : " open"}><summary class="block-titel">${title}</summary><div class="eintraege">${items.join("")}</div></details>`;
  const controls = document.getElementById("controls");
  function drawControls() {
    const total = (k) => [...G.edges[state.level].values()].filter((e) => e.kind === k).reduce((s, e) => s + strength(e), 0);
    controls.innerHTML =
      `<div class="stufen" role="group" aria-label="Level"><button data-level="areas" class="${state.level === "areas" ? "an" : ""}">Areas</button><button data-level="classes" class="${state.level === "classes" ? "an" : ""}">MSC classes</button></div>` +
      block("Kinds of edges", G.KINDS.map((k) => `<label class="toggle" title="${esc(k.text)}"><input type="checkbox" data-kind="${k.key}"${state.kinds.has(k.key) ? " checked" : ""}><span class="regler"></span><i class="farbe" style="background:${k.color}"></i>${k.name} <span class="meta">${total(k.key)}</span></label>`).concat([
        `<label class="toggle"><input type="checkbox" id="c-alt"${state.alt ? " checked" : ""}><span class="regler"></span>alternative proofs and definitions</label>`,
      ])) +
      block("Display", [
        `<label class="schwelle">at least <input type="range" id="c-min" min="1" max="20" value="${state.min[state.level]}"> <b id="c-min-wert">${state.min[state.level]}</b> single edges</label>`,
        `<label class="toggle"><input type="checkbox" id="c-names"${svg.classList.contains("ohne-namen") ? "" : " checked"}><span class="regler"></span>names</label>`,
      ]);
  }
  controls.addEventListener("click", (ev) => { const b = ev.target.closest("button[data-level]"); if (b) setLevel(b.dataset.level); });
  controls.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.dataset.kind) { if (t.checked) state.kinds.add(t.dataset.kind); else state.kinds.delete(t.dataset.kind); redraw(); }
    else if (t.id === "c-alt") { state.alt = t.checked; redraw(); }
    else if (t.id === "c-names") svg.classList.toggle("ohne-namen", !t.checked);
  });
  controls.addEventListener("input", (ev) => {
    if (ev.target.id !== "c-min") return;
    state.min[state.level] = +ev.target.value;
    document.getElementById("c-min-wert").textContent = ev.target.value;
    draw();
    update();
  });
  function redraw() { draw(); drawControls(); update(); }
  function setLevel(level) {
    if (level !== "areas" && level !== "classes") level = "areas";
    if (level === state.level) return;
    state.level = level;
    state.sel = null;
    if (state.pair && !(G.units.areas.has(state.pair.from) && G.units.areas.has(state.pair.to))) state.pair = null;
    redraw();
  }
  document.getElementById("legend").innerHTML =
    block("Meaning of the kinds", G.KINDS.map((k) => `<span><i style="background:${k.color}"></i><b>${k.name}:</b> ${k.text}</span>`), { closed: true }) +
    block("Points, bands and colours", [
      `<span class="hinweis">Each point is an area of these graphs or, at the level of MSC classes, one of its classes (the first MSC class of a concept or theorem); its size grows with the number of its concepts and theorems.</span>`,
      `<span class="hinweis">A band leads from X to Y when Y uses X. It is wide at X and narrow at Y; its width grows with the number of single edges (square root).</span>`,
      `<span><i style="background:#fbfaf6;border:2px dashed #9a9286"></i>Grey, dashed: an MSC main class without a folder of these graphs; its concepts and theorems stand provisionally in other folders. They show where folders are missing.</span>`,
      `<span class="hinweis">A click on a point marks it with its neighbours and lists the connections in the panel, each with its single edges. A click on a band or on a number of the table marks that connection. Escape or a click beside the points clears the marking.</span>`,
    ], { closed: true });

  // ------------------------------------------------------------ search
  const searchBox = document.getElementById("search"), resultList = document.getElementById("search-results");
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let active = 0;
  function showHits() {
    const words = norm(searchBox.value).split(/\s+/).filter(Boolean);
    if (!words.length) { resultList.innerHTML = ""; return; }
    const hits = GROUPS[state.level].flat().filter((u) => { const s = norm(u.name + " " + u.code); return words.every((w) => s.includes(w)); }).slice(0, 10);
    active = 0;
    resultList.innerHTML = hits.length ? hits.map((u, i) => `<li role="option" data-key="${u.key}" class="${i ? "" : "aktiv"}"><i style="background:${u.gray ? "#fbfaf6" : u.color}"></i>${esc(u.label)}</li>`).join("") : `<li class="meta">nothing found</li>`;
  }
  function choose(key) { searchBox.value = ""; showHits(); select(key); }
  searchBox.addEventListener("input", showHits);
  searchBox.addEventListener("keydown", (ev) => {
    const items = [...resultList.querySelectorAll("li[data-key]")];
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!items.length) return;
      active = (active + (ev.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      items.forEach((li, i) => li.classList.toggle("aktiv", i === active));
    } else if (ev.key === "Enter") { ev.preventDefault(); if (items[active]) choose(items[active].dataset.key); }
    else if (ev.key === "Escape") { searchBox.value = ""; showHits(); }
  });
  resultList.addEventListener("mousedown", (ev) => { const li = ev.target.closest("li[data-key]"); if (li) { ev.preventDefault(); choose(li.dataset.key); } });
  searchBox.addEventListener("blur", () => setTimeout(() => { resultList.innerHTML = ""; }, 100));

  // ------------------------------------------------------------ address
  function writeHash() {
    const parts = ["level=" + state.level];
    if (state.min[state.level] !== (state.level === "areas" ? 3 : 2)) parts.push("min=" + state.min[state.level]);
    if (state.sel) parts.push("sel=" + encodeURIComponent(state.sel));
    else if (state.pair) parts.push("pair=" + encodeURIComponent(state.pair.from + ">" + state.pair.to));
    const h = "#" + parts.join("&");
    if (location.hash !== h) history.replaceState(null, "", h);
  }
  function fromHash() {
    const q = new Map(location.hash.slice(1).split("&").filter(Boolean).map((p) => { const i = p.indexOf("="); return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))]; }));
    const level = q.get("level") === "classes" ? "classes" : "areas";
    state.level = level;
    if (q.has("min")) state.min[level] = Math.max(1, Math.min(20, +q.get("min") || 1));
    state.sel = q.has("sel") && G.units[level].has(q.get("sel")) ? q.get("sel") : null;
    const p = q.has("pair") ? q.get("pair").split(">") : null;
    state.pair = !state.sel && p && p.length === 2 ? { from: p[0], to: p[1] } : null;
    draw();
    drawControls();
    update();
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());

  // for tests and preview images
  window.AREA_GRAPH = {
    data: G, state, select, selectPair, clear, setLevel,
    level: () => state.level,
    // strength of the edge of a kind between two nodes of the current level (0 if none)
    count: (kind, from, to) => { const e = G.edges[state.level].get(kind + "|" + from + "|" + to); return e ? e.singles.length : 0; },
    edges: (level) => [...G.edges[level || state.level].values()].map((e) => ({ kind: e.kind, from: e.from.key, to: e.to.key, n: e.singles.length, alt: e.alt })),
    units: (level) => GROUPS[level || state.level].flat().map((u) => ({ key: u.key, label: u.label, n: u.items.length, gray: !!u.gray })),
    // square picture without names and sidebars (preview images)
    preview() { svg.classList.add("ohne-namen", "vorschau"); const R = GEO[state.level].R + (state.level === "classes" ? 30 : 50); view = { x: -R, y: -R, w: 2 * R, h: 2 * R }; applyView(); },
  };
})();
