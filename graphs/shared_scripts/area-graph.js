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
// References with a prefix (top:manifold) point to the node in the folder of the prefix (prefixes in the register,
// shared_scripts/areas.js; colours of the classes from scripts/bipartite-page.js of each folder, collected in
// window.AREA_CFG by areas.html).
//
// Layout: the nodes on a circle; the order makes the sum of strength × angular distance small (pairs exchanged as long
// as the sum falls; deterministic). At the level of classes the folders keep the order of the level of areas and only
// the classes within a sector are exchanged. Edges are bands curved towards the centre, wide at X and narrow at Y.
// Address: #level=areas|classes, &layout=force, &min=<n>, &sel=<node key> or &pair=<from key>><to key>.
// Since 4 November 2026 (todo B92) the level of areas uses shared_scripts/area-layout.js: seven groups with colours,
// layout A (circle sorted by group) and C₃ (force-directed), switched with an animated change.
(function () {
  "use strict";
  const KINDS = [
    { key: "def", name: "Definitional", text: "a concept of X is used in a definition in Y", color: "#d08a2c" },
    { key: "stmt", name: "In statements", text: "a concept of X occurs in the statement of a theorem of Y", color: "#3f7fbf" },
    { key: "proof", name: "Proofs", text: "a theorem of X is a premise of a proof of a theorem of Y", color: "#b03a48" },
    { key: "msc", name: "Shared classification", text: "a node of Y also carries an MSC class whose home is X", color: "#5f9a3a" },
  ];
  // colour of each area from the register (shared_scripts/areas.js, field `color`)
  const ORIGIN_COLORS = Object.assign({}, ...(window.GRAPH_AREAS || []).map((a) => ({ [a.prefix]: a.color })));
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
    // the folders of the register whose data the page has loaded; colours of the classes from the bipartite page (concept
    // and theorem classes), else from the register
    const folders = W.GRAPH_AREAS.filter((a) => W[a.concepts] && W[a.theorems]).map((a, i) => {
      const cfg = (W.AREA_CFG || []).find((c) => c.folder === a.folder) || {};
      return { i, folder: a.folder, name: a.name, msc: a.msc, codes: a.msc.split(/,\s*/), prefix: a.prefix, note: a.note, colors: cfg.colors || a.colors || {}, C: W[a.concepts], T: W[a.theorems], color: ORIGIN_COLORS[a.prefix] || "#8a7f6e" };
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
    const areaUnit = (f) => unit("areas", f.prefix, () => ({ folder: f, code: f.prefix, areaKey: f.prefix, label: f.name, name: f.name, note: f.note, color: f.color }));
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

  const state = { level: "areas", min: { areas: 3, classes: 2 }, kinds: new Set(G.KINDS.map((k) => k.key)), alt: false, sel: null, pair: null, layout: "e2", mix: 1, marks: "symbols", bysize: true, scale: 1, frame: "ellipse", organic: true, gap: 20 };
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
  // level of areas (todo B92, user, 4 November 2026): with shared_scripts/area-layout.js the areas stand in seven
  // groups, each a shade of the colour of its group, on the circle sorted by group (layout A); a switch moves them to
  // the force-directed layout C₃ and back. Without that file the old order (one group, arc length only) stays.
  const AL = window.AREA_LAYOUT;
  const pairsAreas = (() => {
    const w = new Map();
    G.edges.areas.forEach((e) => { const [a, b] = e.from.key < e.to.key ? [e.from, e.to] : [e.to, e.from], k = a.key + "\n" + b.key; const x = w.get(k) || { a, b, w: 0 }; x.w += e.singles.length; w.set(k, x); });
    return [...w.values()];
  })();
  let areaGroups;
  // The layouts are computed exactly as in the sketch (skizzen/area-layouts.js; user, 4 November 2026: "do it just like
  // the sketch"): without the grey points (they are not drawn at all; their edges stay in the data), the start of C
  // from the angles of A as the sketch computes them.
  const allAreas = [...G.units.areas.values()].filter((u) => !u.gray);
  const pairsColoured = pairsAreas.filter((p) => !p.a.gray && !p.b.gray);
  if (AL) {
    G.units.areas.forEach((u) => { u.F = u.gray ? AL.GRAY : AL.groupOf(u.folder.folder); const c = !u.gray && AL.shade(u.folder.folder); if (c) u.color = c; });
    areaGroups = AL.circleSorted(allAreas, pairsColoured);
    areaGroups.forEach((g) => { g.F = g[0].F; });
    slots("areas", areaGroups);
  } else {
    areaGroups = [G.folders.map((f) => G.units.areas.get(f.prefix)).filter(Boolean), grayList("areas")].filter((g) => g.length);
    optimise("areas", areaGroups);
  }
  const folderOrder = areaGroups.flat().filter((u) => !u.gray).map((u) => u.folder);
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
  // size of a point (level of areas: switches "point size" and "size by number", as in the sketch; user, 4 November
  // 2026): by the number of concepts and theorems, or the same for all (larger with symbols, which need room)
  const R0 = { areas: GEO.areas.R, classes: GEO.classes.R };
  const radius = (u, level) => {
    const g = GEO[level];
    if (level !== "areas") return g.r(Math.max(1, u.items.length));
    return state.scale * (state.bysize ? g.r(Math.max(1, u.items.length)) : state.marks === "symbols" ? 20 : 13);
  };
  // more than thirty areas (3 November 2026): the circle of each level grows until neighbouring points no longer
  // overlap (with 13 areas the fixed radii were large enough and stay as they were); again after a change of size
  function growCircles() {
    for (const [level, g] of Object.entries(GEO)) {
      g.R = R0[level];
      const units = GROUPS[level].flat().slice().sort((a, b) => a.angle - b.angle), gap = level === "areas" ? 6 : 1.5;
      units.forEach((u, i) => {
        const v = units[(i + 1) % units.length];
        if (v === u) return;
        let d = Math.abs(v.angle - u.angle);
        if (d > Math.PI) d = 2 * Math.PI - d;
        const need = (radius(u, level) + radius(v, level) + gap) / (2 * Math.sin(d / 2) || 1e-9);
        if (need > g.R) g.R = Math.ceil(need);
      });
    }
  }
  growCircles();
  // Layout E2 (user, 5 November 2026: the default of this page; C₃ is no longer offered here): cells without gaps,
  // every group with κ ≥ 0.8, computed exactly as E2 of the sketch skizzen/area-layouts.html (shared_scripts/area-cells.js:
  // the same start from the angles of A with a gap of 1.2 between the groups, the same parameters), so that the
  // measures agree. Frame "circle" (default) or "ellipse" (1.7 : 1, as E4 of the sketch). Scaled so that the disk has
  // 1.2 times the radius of the circle A. Computed once per frame (again after a change of the size of the points, which
  // changes only the scale).
  let posE = {};
  const startAngles = (() => {
    const gap = 1.2, total = areaGroups.reduce((s, g) => s + g.length, 0) + gap * areaGroups.length, m = new Map();
    let pos = gap / 2;
    areaGroups.forEach((g) => { g.forEach((u) => { m.set(u, -Math.PI / 2 + (2 * Math.PI * (pos + 0.5)) / total); pos += 1; }); pos += gap; });
    return m;
  })();
  const layoutE = () => {
    const key = state.frame;
    if (!posE[key] && window.AREA_CELLS && AL) {
      const C = window.AREA_CELLS, keep = allAreas.map((u) => u.angle);
      allAreas.forEach((u) => { u.angle = startAngles.get(u); });
      const S = C.forceStart(allAreas, pairsColoured, 150, 700, 0.25, 10);
      allAreas.forEach((u, i) => { u.angle = keep[i]; });
      const idx = new Map(allAreas.map((u, i) => [u, i]));
      const pairs = pairsColoured.map((p) => ({ a: idx.get(p.a), b: idx.get(p.b), w: p.w }));
      const res = C.layout(allAreas.map((u, i) => ({ x: S[i].x, y: S[i].y, group: u.F.key, key: u.key })), pairs,
        Object.assign({ N: 800, lambda: 0.3, lambdaUnit: 0.06, spread: 0.75, compact: 0, sweeps: 800, kappaMin: 0.8 }, key === "ellipse" ? { aspect: 1.7 } : {}));
      const scale = (GEO.areas.R * 1.2) / res.R;
      const pos = new Map(allAreas.map((u, i) => [u, { x: res.positions[i].x * scale, y: res.positions[i].y * scale }]));
      posE[key] = { res, scale, pos, segs: C.groupBorderSegments(res).map((s) => s.map((x) => x * scale)) };
    }
    return posE[key];
  };
  // largest drawn radius of a point in E2 (only the drawing): neighbouring points and the borders of the groups stay
  // free, but never below 40 % of the intended radius (as in the sketch)
  const segDist = (p, [x1, y1, x2, y2]) => { const dx = x2 - x1, dy = y2 - y1, t = Math.max(0, Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(p.x - x1 - t * dx, p.y - y1 - t * dy); };
  function capsE(EL, shapes) {
    const caps = new Map();
    EL.pos.forEach((p, u) => {
      let d = Infinity;
      EL.pos.forEach((q, w) => { if (w !== u) d = Math.min(d, Math.hypot(p.x - q.x, p.y - q.y) / 2); });
      EL.segs.forEach((s) => { d = Math.min(d, segDist(p, s)); });
      if (shapes) d = Math.min(d, shapes.dist(p));
      const full = radius(u, "areas");
      caps.set(u, Math.max(0.4 * full, Math.min(full, d - 2)));
    });
    return caps;
  }
  // functions of the zoom into an area (shared_scripts/area-zoom.js), set at the end
  const hooks = {};
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
    let p0 = P(geo.R - a.r - 1, a.angle), p2 = P(geo.R - b.r - 1, b.angle);
    const dx = p2.x - p0.x, dy = p2.y - p0.y, len = Math.hypot(dx, dy) || 1;
    const beta = 0.62 - 0.08 * k;
    const off = (state.level === "areas" ? 9 : 5) * (1 + k * 0.6);
    let c = { x: ((p0.x + p2.x) / 2) * beta - (dy / len) * off, y: ((p0.y + p2.y) / 2) * beta + (dx / len) * off };
    // between the circle (A) and the force-directed layout (C): ends at the border of the points, slightly bent
    if (state.level === "areas" && state.mix) {
      const m = state.mix, ddx = b.x - a.x, ddy = b.y - a.y, L = Math.hypot(ddx, ddy) || 1, ux = ddx / L, uy = ddy / L, bend = L * 0.08 + off * 0.4;
      const q0 = { x: a.x + ux * (a.r + 1), y: a.y + uy * (a.r + 1) }, q2 = { x: b.x - ux * (b.r + 1), y: b.y - uy * (b.r + 1) };
      const qc = { x: (q0.x + q2.x) / 2 - uy * bend, y: (q0.y + q2.y) / 2 + ux * bend };
      const lerp = (u, v) => ({ x: u.x + (v.x - u.x) * m, y: u.y + (v.y - u.y) * m });
      p0 = lerp(p0, q0); p2 = lerp(p2, q2); c = lerp(c, qc);
    }
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
    const EL = level === "areas" && AL && state.mix ? layoutE() : null, C = EL && EL.pos;
    const shapes = EL && (state.organic || state.gap > 0) ? window.AREA_CELLS.organicShapes(EL.res, EL.scale, state.gap / 2, state.organic) : null;
    const caps = EL ? capsE(EL, shapes) : null;
    units.forEach((u) => {
      u.r = radius(u, level);
      if (caps && caps.has(u)) u.r += (caps.get(u) - u.r) * state.mix;
      const p = P(R, u.angle), q = C && C.get(u);
      u.x = q ? p.x + (q.x - p.x) * state.mix : p.x; u.y = q ? p.y + (q.y - p.y) * state.mix : p.y;
    });
    // groups (level of areas): pale arcs on the circle (A), fading into pale areas around the points (C)
    if (level === "areas" && AL) {
      const step = (2 * Math.PI) / GROUPS.areas.total, fadeA = 1 - state.mix;
      GROUPS.areas.forEach((g) => {
        if (!g.F || g.F.gray || fadeA < 0.02) return;
        const a0 = -Math.PI / 2 + (g.from - 0.4) * step, a1 = -Math.PI / 2 + (g.to + 0.4) * step, rIn = R - 26, rOut = R + 24, large = a1 - a0 > Math.PI ? 1 : 0;
        const path = el("path", { class: "gruppe-flaeche", d: `M${fmt(P(rIn, a0))}L${fmt(P(rOut, a0))}A${rOut},${rOut} 0 ${large} 1 ${fmt(P(rOut, a1))}L${fmt(P(rIn, a1))}A${rIn},${rIn} 0 ${large} 0 ${fmt(P(rIn, a0))}Z`, fill: g.F.pale, "fill-opacity": (0.16 * fadeA).toFixed(3) }, gSectors);
        groupTip(path, g.F);
        const m = (a0 + a1) / 2, t = el("text", { class: "gruppe-name", x: (R * 0.8 * Math.cos(m)).toFixed(1), y: (R * 0.8 * Math.sin(m)).toFixed(1), "text-anchor": "middle", opacity: fadeA.toFixed(3) }, gSectors);
        t.textContent = g.F.name;
      });
      // E2: the regions of the groups from the cells, with organic borders and gaps as in the sketch (only the drawing)
      if (EL && state.mix > 0.02) {
        const ps = window.AREA_CELLS.paths(EL.res, EL.scale), r = EL.res;
        AL.GROUPS.forEach((F) => {
          const g = r.groupKeys.indexOf(F.key);
          if (g < 0) return;
          groupTip(el("path", { class: "gruppe-flaeche", d: shapes ? shapes.d[g] : ps.fill.get(g), "fill-rule": "evenodd", fill: F.pale, "fill-opacity": (0.16 * state.mix).toFixed(3) }, gSectors), F);
        });
        // borders between the areas: organic with "organic borders", cut to the drawn regions of the groups
        let clip = null;
        if (shapes) { const id = "e2-clip"; const cp = el("clipPath", { id }, el("defs", {}, gSectors)); el("path", { d: shapes.d.join(""), "clip-rule": "evenodd" }, cp); clip = `url(#${id})`; }
        el("path", Object.assign({ class: "zell-grenze", d: shapes && shapes.units ? shapes.units : ps.unitBorder, opacity: state.mix.toFixed(3) }, clip ? { "clip-path": clip } : {}), gSectors);
        el("path", { class: "gruppe-rand", d: shapes ? shapes.d.join("") : ps.groupBorder, opacity: state.mix.toFixed(3) }, gSectors);
      }
    }
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
    const drawn = new Set(units);
    [...G.edges[level].values()].filter((e) => shown(e) && drawn.has(e.from) && drawn.has(e.to)).sort((x, y) => strength(y) - strength(x)).forEach((e) => {
      e.path = el("path", { class: "band k-" + e.kind, d: band(e, geo), fill: KIND.get(e.kind).color }, gEdges);
      e.path.addEventListener("mouseenter", (ev) => { tip.textContent = edgeTip(e); tip.hidden = false; moveTip(ev); });
      e.path.addEventListener("mousemove", moveTip);
      e.path.addEventListener("mouseleave", () => { tip.hidden = true; });
      e.path.addEventListener("click", (ev) => { ev.stopPropagation(); if (dragged()) return; selectPair(e.from.key, e.to.key); });
    });
    // nodes and names
    units.forEach((u) => {
      const g = el("g", { class: "knoten" + (u.gray ? " grau" : "") + (u.items.length ? "" : " leer"), "data-key": u.key, transform: `translate(${u.x.toFixed(1)},${u.y.toFixed(1)})` }, gNodes);
      const folder = u.folder && u.folder.folder;
      if (level === "areas" && AL && !u.gray && state.marks === "shapes") el("path", { d: AL.shapePath(AL.shapeOf(folder), u.r), class: "form", fill: u.F.color }, g);
      else if (level === "areas" && AL && !u.gray && state.marks === "symbols") {
        el("circle", { r: u.r, class: "form", fill: u.F.color }, g);
        // a text or a drawing (AL.symbolMarkup)
        const gs = el("g", { class: "symbol-mark" }, g);
        gs.innerHTML = AL.symbolMarkup(AL.SYMBOL[folder], u.r, u.F.color);
      } else el("circle", { r: u.r, class: "form", fill: u.gray || !u.items.length ? "#fbfaf6" : u.color }, g);
      // names point away from the middle: on the circle by the angle, in the force-directed layout by the position
      const la = level === "areas" && state.mix > 0.5 ? Math.atan2(u.y, u.x) : u.angle;
      const deg = (la * 180) / Math.PI, c = Math.cos(la), s = Math.sin(la);
      let t;
      if (level === "areas") {
        // names centred only at the very top and bottom, so that the names of neighbouring points do not run into
        // each other when there are many areas
        const d = u.r + 7, mid = 0.05, anchor = c > mid ? "start" : c < -mid ? "end" : "middle";
        t = el("text", { x: c * d, y: s * d + (Math.abs(c) <= mid ? (s > 0 ? 12 : -4) : 4), "text-anchor": anchor }, g);
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
      // a click stops the pending highlight of the hover, which would otherwise light the point again after Escape
      g.addEventListener("click", (ev) => { ev.stopPropagation(); clearTimeout(hoverTimer); if (dragged()) return; select(state.sel === u.key ? null : u.key); });
    });
    if (EL && state.mix > 0.02) groupNames(EL, gSectors);
    view = fit();
    applyView();
    mark();
    if (hooks.afterDraw) hooks.afterDraw();
  }

  // ------------------------------------------------------------ names of the groups on the map (E2)
  // User, 5 November 2026: a group whose region touches the border of the map (the ellipse of the cells) has its name
  // outside the map, on an arc parallel to the border (a text path on a slightly larger concentric ellipse), centred
  // over its stretch of the border; small capitals, slightly spaced, in a dark shade of the colour of the group; always
  // readable from left to right (on the lower half the path runs the other way and lies further out). A group inside
  // has its name in its region along its main axis, slightly bent, pale and behind the points, if it fits (wholly in the
  // region, over no name of an area and at most two points); otherwise a thin line leads from inside the region to the
  // border and the name stands outside there. Names outside do not overlap: blocks along the border, overlapping blocks
  // merged and centred on their wishes.
  const TAU = 2 * Math.PI;
  const darkOf = (c) => {
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
    if (!m) return "#4b3f33";
    const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, sat = 0;
    if (d) { sat = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return `hsl(${Math.round(h)},${Math.round(Math.min(60, 100 * sat))}%,26%)`;
  };
  let groupLabelInfo = [];
  function groupNames(EL, layer) {
    const r = EL.res, sc = EL.scale, asp = r.aspect || 1, FS = 17, FI = 19, op = state.mix.toFixed(3);
    // the border of the map: ellipse of the cells (distance x²/aspect + y²·aspect = R², in cell units)
    const ea = r.R * Math.sqrt(asp) * sc, eb = (r.R / Math.sqrt(asp)) * sc;
    const ray = (t, extra) => { const a = ea + extra, b = eb + extra, d = (a * b) / Math.hypot(b * Math.cos(t), a * Math.sin(t)); return { x: d * Math.cos(t), y: d * Math.sin(t), d }; };
    const nodeBoxes = [], nameBoxes = [];
    GROUPS.areas.flat().forEach((u) => {
      if (!u.g) return;
      nodeBoxes.push({ x0: u.x - u.r, x1: u.x + u.r, y0: u.y - u.r, y1: u.y + u.r });
      const t = u.g.querySelector("text:not(.symbol)");
      if (t) { const b = t.getBBox(); nameBoxes.push({ x0: u.x + b.x, x1: u.x + b.x + b.width, y0: u.y + b.y, y1: u.y + b.y + b.height }); }
    });
    const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    const outside = [];
    groupLabelInfo = [];
    AL.GROUPS.forEach((F) => {
      const g = r.groupKeys.indexOf(F.key);
      if (g < 0) return;
      const idx = r.cells.map((c, i) => i).filter((i) => r.group[i] === g);
      const pts = idx.map((i) => ({ x: r.cells[i].x * sc, y: r.cells[i].y * sc }));
      const cx = pts.reduce((t, p) => t + p.x, 0) / pts.length, cy = pts.reduce((t, p) => t + p.y, 0) / pts.length;
      const info = { key: F.key, name: F.name, cx, cy, cells: pts };
      groupLabelInfo.push(info);
      // stretches of the border: the border cells of the group by angle, in clusters; the largest one
      const border = idx.filter((i) => r.nb[i].some((d) => d < 0)).map((i) => Math.atan2(r.cells[i].y, r.cells[i].x)).sort((a, b) => a - b);
      if (border.length) {
        let cut = 0, gmax = -1;
        border.forEach((a, i) => { const nx = border[(i + 1) % border.length], gp = (((nx - a) % TAU) + TAU) % TAU || TAU; if (gp > gmax) { gmax = gp; cut = (i + 1) % border.length; } });
        const seq = border.slice(cut).concat(border.slice(0, cut)), runs = [[seq[0]]];
        for (let i = 1; i < seq.length; i++) { const gp = (((seq[i] - seq[i - 1]) % TAU) + TAU) % TAU; if (gp > 0.3) runs.push([seq[i]]); else runs[runs.length - 1].push(seq[i]); }
        const run = runs.sort((a, b) => b.length - a.length)[0], a0 = run[0];
        const span = (((run[run.length - 1] - a0) % TAU) + TAU) % TAU;
        outside.push({ F, info, want: a0 + span / 2, kind: "outer" });
        return;
      }
      // inside: along the main axis (principal component of the cells), slightly bent
      let sxx = 0, syy = 0, sxy = 0;
      pts.forEach((p) => { sxx += (p.x - cx) ** 2; syy += (p.y - cy) ** 2; sxy += (p.x - cx) * (p.y - cy); });
      let ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
      if (Math.cos(ang) < 0) ang += Math.PI;
      if (ang > Math.PI) ang -= TAU;
      if (Math.abs(ang) > Math.PI / 3) ang = 0; // nearly upright regions: the name stays horizontal
      const ux = Math.cos(ang), uy = Math.sin(ang), proj = pts.map((p) => (p.x - cx) * ux + (p.y - cy) * uy), across = pts.map((p) => -(p.x - cx) * uy + (p.y - cy) * ux);
      const len = Math.max(...proj) - Math.min(...proj) + sc, wid = Math.max(...across) - Math.min(...across) + sc;
      const tw = F.name.length * FI * 0.62, half = tw / 2 + 6, bend = 0.06 * tw;
      const id = "gruppe-bahn-" + g, p0 = { x: cx - ux * half, y: cy - uy * half }, p1 = { x: cx + ux * half, y: cy + uy * half };
      const box = { x0: Math.min(p0.x, p1.x) - FI * 0.6, x1: Math.max(p0.x, p1.x) + FI * 0.6, y0: Math.min(p0.y, p1.y) - FI * 0.9, y1: Math.max(p0.y, p1.y) + FI * 0.5 };
      const inRegion = [p0, p1, { x: cx, y: cy }].every((q) => pts.some((p) => Math.hypot(p.x - q.x, p.y - q.y) < sc * 0.75));
      const fits = tw <= 0.9 * len && wid >= 1.6 * FI && inRegion && !nameBoxes.some((b) => hit(b, box)) && nodeBoxes.filter((b) => hit(b, box)).length <= 2;
      if (fits) {
        el("path", { id, d: `M${p0.x.toFixed(1)},${p0.y.toFixed(1)}Q${(cx + uy * bend).toFixed(1)},${(cy - ux * bend).toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`, fill: "none", stroke: "none" }, layer);
        const t = el("text", { class: "gruppe-name innen", opacity: op }, layer);
        t.style.fill = darkOf(F.color);
        el("textPath", { href: "#" + id, startOffset: "50%", "text-anchor": "middle" }, t).textContent = F.name;
        Object.assign(info, { kind: "inner", x: cx, y: cy });
        return;
      }
      // a thin line to the nearest stretch of the border, the name outside there
      let best = Infinity, tb = 0;
      for (let k = 0; k < 360; k++) { const t = (k * TAU) / 360, q = ray(t, 0), d = Math.hypot(q.x - cx, q.y - cy); if (d < best) { best = d; tb = t; } }
      outside.push({ F, info, want: tb, kind: "leader", from: { x: cx, y: cy } });
    });
    // names outside: room along the label ellipse, blocks merged where they overlap (as the marks of the zoom)
    const OFF = 16, halfOf = (o) => ((o.F.name.length * FS * 0.62) / 2 + 14) / ray(o.want, OFF).d;
    const list = outside.sort((a, b) => a.want - b.want);
    if (list.length) {
      let cut = 0, gmax = -1;
      list.forEach((o, i) => { const nx = list[(i + 1) % list.length], gp = list.length === 1 ? TAU : (((nx.want - o.want) % TAU) + TAU) % TAU; if (gp > gmax) { gmax = gp; cut = (i + 1) % list.length; } });
      const seq = list.slice(cut).concat(list.slice(0, cut)), want = [];
      let prev = null;
      seq.forEach((o) => { let w = o.want; if (prev != null) while (w < prev) w += TAU; want.push(w); prev = w; });
      const width = seq.map((o) => 2 * halfOf(o)), blocks = [];
      const place = (bk) => { let off = 0, sum = 0; bk.items.forEach((j) => { sum += want[j] - (off + width[j] / 2); off += width[j]; }); bk.start = sum / bk.items.length; };
      seq.forEach((o, i) => {
        let blk = { items: [i], width: width[i] };
        place(blk);
        while (blocks.length && blocks[blocks.length - 1].start + blocks[blocks.length - 1].width > blk.start) { const pb = blocks.pop(); blk = { items: pb.items.concat(blk.items), width: pb.width + blk.width }; place(blk); }
        blocks.push(blk);
      });
      blocks.forEach((bk) => { let off = bk.start; bk.items.forEach((j) => { seq[j].a = off + width[j] / 2; off += width[j]; }); });
    }
    list.forEach((o, k) => {
      const low = Math.sin(o.a) > 0, extra = OFF + (low ? FS * 0.75 : 0), dl = halfOf(o) * 1.4, pts = [];
      for (let j = 0; j <= 24; j++) { const t = low ? o.a + dl - (2 * dl * j) / 24 : o.a - dl + (2 * dl * j) / 24, q = ray(t, extra); pts.push(q.x.toFixed(1) + "," + q.y.toFixed(1)); }
      const id = "gruppe-rand-bahn-" + k;
      el("path", { id, d: "M" + pts.join("L"), fill: "none", stroke: "none" }, layer);
      const t = el("text", { class: "gruppe-name aussen", opacity: op }, layer);
        t.style.fill = darkOf(o.F.color);
      el("textPath", { href: "#" + id, startOffset: "50%", "text-anchor": "middle" }, t).textContent = o.F.name;
      const at = ray(o.a, OFF);
      Object.assign(o.info, { kind: o.kind, x: at.x, y: at.y, a: o.a, want: o.want, from: o.from });
      if (o.kind === "leader") { const q = ray(o.a, 4); el("path", { class: "gruppe-linie", d: `M${o.from.x.toFixed(1)},${o.from.y.toFixed(1)}L${q.x.toFixed(1)},${q.y.toFixed(1)}`, stroke: darkOf(o.F.color), opacity: op }, layer); }
    });
  }

  // ------------------------------------------------------------ view box, pan and zoom (as in the circle graphs)
  let view = null;
  const fit = () => {
    const g = GEO[state.level], R = g.R, b = { x: -R - g.side, y: -R - g.pad, w: 2 * (R + g.side), h: 2 * (R + g.pad) };
    // E2 (above all in the ellipse) can be wider than the circle
    const EL = state.level === "areas" && state.mix > 0 && posE[state.frame];
    if (EL) {
      const ps = [...EL.pos.values()], ex = Math.max(...ps.map((p) => Math.abs(p.x))) + g.side, ey = Math.max(...ps.map((p) => Math.abs(p.y))) + g.pad;
      if (ex > -b.x) { b.x = -ex; b.w = 2 * ex; }
      if (ey > -b.y) { b.y = -ey; b.h = 2 * ey; }
    }
    return b;
  };
  // Names by zoom level, as on the maps (user, 4 November 2026): names keep their size on the screen; a name is shown
  // only where it has room, the names of the groups first, then the larger points; the points are always shown
  let declutterPending = false;
  function declutter() {
    declutterPending = false;
    if (svg.classList.contains("ohne-namen") || svg.classList.contains("unterwegs")) return;
    const taken = [], free = (r) => taken.every((t) => r.right < t.left || r.left > t.right || r.bottom < t.top || r.top > t.bottom);
    const groups = [...svg.querySelectorAll("text.gruppe-name")].filter((t) => +(t.getAttribute("opacity") || 1) > 0.5);
    const names = GROUPS[state.level].flat().filter((u) => u.g).sort((a, b) => b.items.length - a.items.length).map((u) => [u, u.g.querySelector("text:not(.symbol)")]).filter(([, t]) => t);
    groups.concat(names.map(([, t]) => t)).forEach((t) => { t.style.visibility = ""; });
    groups.forEach((t) => { const r = t.getBoundingClientRect(); if (r.width && free(r)) taken.push(r); else t.style.visibility = "hidden"; });
    names.forEach(([u, t]) => {
      if (u.g.classList.contains("hell")) { taken.push(t.getBoundingClientRect()); return; } // marked points keep their names
      const r = t.getBoundingClientRect();
      if (!r.width) return;
      const q = { left: r.left - 2, right: r.right + 2, top: r.top - 1, bottom: r.bottom + 1 };
      if (free(q)) taken.push(q); else t.style.visibility = "hidden";
    });
  }
  const applyView = () => {
    svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
    const f = fit();
    svg.style.setProperty("--zf", (view.w / f.w).toFixed(4));
    if (hooks.onView) hooks.onView();
    if (!declutterPending) { declutterPending = true; requestAnimationFrame(declutter); }
  };
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
  // tooltip of a node: only its name (user, 5 November 2026)
  function unitTip(u) { return u.name; }
  // remark `note` of the register after the name of an area ("without graph theory"), small and grey
  const noteOf = (u) => (u.note ? ` <span class="note">(${esc(u.note)})</span>` : "");
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
  function clear() { clearTimeout(hoverTimer); state.sel = null; state.pair = null; update(); }
  function update() { mark(); if (!declutterPending) { declutterPending = true; requestAnimationFrame(declutter); } panel.innerHTML = (hooks.panel && hooks.panel()) || (state.sel ? unitPanel(G.units[state.level].get(state.sel)) : state.pair ? pairPanel() : overview()); writeHash(); }

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
    let html = `<h2>${esc(u.name)}${noteOf(u)}</h2><div class="meta">${u.other ? "MSC " + [...u.codes].sort().join(", ") + "; classes named only in the MSC lists of other nodes. " : u.gray ? "MSC " + u.main + "; no folder of these graphs yet. " : u.level === "classes" ? "MSC " + u.cls + " in " + esc(u.folder.name) + ". " : "MSC " + esc(u.folder.msc) + ". "}${itemCount(u)}.</div>`;
    if (!u.gray && u.level === "areas") html += `<p class="meta"><a href="${u.folder.folder}/concepts.html">Concepts</a> · <a href="${u.folder.folder}/theorems.html">Theorems</a> · <a href="${u.folder.folder}/bipartite.html">Concepts in theorems</a></p>`;
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
    const head = (u) => `<th title="${esc(u.name)}${u.note ? "&#10;" + esc(u.note) : ""}" data-unit="${u.key}"><span>${esc(u.code)}</span></th>`;
    const rows = used.map((x) => `<tr>${head(x)}${used.map((y) => {
      const v = m.get(x.key + ">" + y.key) || 0;
      return x === y ? `<td class="leer"></td>` : `<td${v ? ` data-from="${x.key}" data-to="${y.key}" title="${esc(x.label)} → ${esc(y.label)}: ${v}" style="background:rgba(120,90,50,${(0.08 + 0.75 * Math.log(1 + v) / Math.log(1 + max)).toFixed(2)})${Math.log(1 + v) / Math.log(1 + max) > 0.55 ? ";color:#fff" : ""}"` : ""}>${v || ""}</td>`;
    }).join("")}</tr>`).join("");
    const totals = G.KINDS.filter((k) => state.kinds.has(k.key)).map((k) => {
      const n = [...G.edges.areas.values()].filter((e) => e.kind === k.key).reduce((s, e) => s + strength(e), 0);
      return `<span class="summe"><i style="background:${k.color}"></i>${k.name}: ${n}</span>`;
    }).join("");
    return `<h2>Graph of the areas</h2>
      <p class="meta">${G.folders.length} areas${AL ? "" : `, ${grayList("areas").length} MSC classes without a folder (grey)`}. Single edges between different areas of the kinds shown:</p><p>${totals}</p>
      <h3>From row to column</h3>
      <p class="meta">Row X, column Y: how often Y uses X. A click on a number marks these edges; a click on a name selects the area.</p>
      <div class="matrix-box"><table class="matrix"><thead><tr><th></th>${used.map(head).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
      <p class="meta">${used.map((u) => (u.gray ? esc(u.label) : `<b>${esc(u.code)}</b> ${esc(u.label)}${noteOf(u)}`)).join(" · ")}</p>
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
  // Toolbar (user, 5 November 2026): layout, grouping, display, threshold, the overview; seldom used things in "More ▾"
  // Simplified toolbar (user, 5 November 2026): layout (Circle | Map), grouping, the names of the groups and of the
  // areas, the threshold, the kinds of edges, "More ▾" (size of the points). Fixed: organic borders, gap 20, frame
  // ellipse 1.7 : 1, one colour per group, symbols, level of areas, without alternative proofs and definitions.
  const GROUPINGS = [
    ["msc", "MSC (7)", "Main groups of the MSC; number theory together with combinatorics and graph theory"],
    ["msc8", "MSC (8)", "As before, but number theory and discrete mathematics (combinatorics, graph theory, computer science) as separate groups"],
    ["themes", "By subject (8)", "Foundations, numbers, structures, space, change, chance, discrete and computation, applications"],
  ];
  let moreOpen = false, morePos = null;
  function drawControls() {
    const total = (k) => [...G.edges[state.level].values()].filter((e) => e.kind === k).reduce((s, e) => s + strength(e), 0);
    const seg = (items) => `<div class="stufen">${items.join("")}</div>`;
    const btn = (attr, val, on, label, title) => `<button ${attr}="${val}" class="${on ? "an" : ""}"${title ? ` title="${esc(title)}"` : ""}>${label}</button>`;
    const sw = (id, on, label, title) => `<label class="toggle"${title ? ` title="${esc(title)}"` : ""}><input type="checkbox" id="${id}"${on ? " checked" : ""}><span class="regler"></span>${label}</label>`;
    controls.innerHTML =
      (AL ? `<div class="leiste-gruppe">${seg([btn("data-layout", "circle", state.layout === "circle", "Circle", "the areas on a circle, sorted by group"), btn("data-layout", "e2", state.layout === "e2", "Map", "a map: every group a region without gaps (layout E2 of the sketch)")])}</div>` : "") +
      (AL ? `<div class="leiste-gruppe">${seg(GROUPINGS.map(([k, label, t]) => btn("data-fields", k, AL.GROUPING === k, label, t)))}</div>` : "") +
      `<div class="leiste-gruppe">${sw("c-groupnames", !svg.classList.contains("ohne-gruppennamen"), "group names", "names of the regions of the groups")}${sw("c-names", !svg.classList.contains("ohne-namen"), "area names", "names of the areas at the points")}</div>` +
      // the slider of the gap between the groups of the map (user, 5 November 2026: wanted back); only the drawing changes
      `<div class="leiste-gruppe"><label class="schwelle" title="white space between the groups of the map (0: none)">gap <input type="range" id="c-gap" min="0" max="40" step="1" value="${state.gap}"> <b id="c-gap-wert">${state.gap}</b></label></div>` +
      `<div class="leiste-gruppe"><label class="schwelle" title="bands with at least this number of single edges">at least <input type="range" id="c-min" min="1" max="20" value="${state.min[state.level]}"> <b id="c-min-wert">${state.min[state.level]}</b> edges</label></div>` +
      `<div class="leiste-gruppe">` + G.KINDS.map((k) => `<label class="toggle" title="${esc(k.name + ": " + k.text)}"><input type="checkbox" data-kind="${k.key}"${state.kinds.has(k.key) ? " checked" : ""}><span class="regler"></span><i class="farbe" style="background:${k.color}"></i>${esc(k.short || k.name)}</label>`).join("") + `</div>` +
      `<details class="mehr"${moreOpen ? " open" : ""}><summary>More ▾</summary><div class="mehr-inhalt"${morePos ? ` style="left:${morePos.x}px;top:${morePos.y}px"` : ""}>` +
      `<div class="mehr-kopf" title="drag to move">More</div>` +
      `<div class="leiste-gruppe"><span class="leiste-titel">Points</span>` +
      `<label class="toggle"><input type="checkbox" id="c-bysize"${state.bysize ? " checked" : ""}><span class="regler"></span>size by number of concepts and theorems</label>` +
      `<label class="schwelle">point size <input type="range" id="c-scale" min="0.4" max="1.8" step="0.1" value="${state.scale}"> <b id="c-scale-wert">${state.scale.toFixed(1)}</b></label></div>` +
      `</div></details>`;
    if (hooks.afterControls) hooks.afterControls();
    const det = controls.querySelector("details.mehr");
    // closing the menu forgets where it was dragged
    det.addEventListener("toggle", () => { moreOpen = det.open; if (!det.open) morePos = null; });
    // the panel of "More" can be dragged at its head (user, 5 November 2026)
    const box = det.querySelector(".mehr-inhalt"), head = det.querySelector(".mehr-kopf");
    head.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      const x0 = ev.clientX, y0 = ev.clientY, l0 = box.offsetLeft, t0 = box.offsetTop;
      const move = (e) => { morePos = { x: l0 + e.clientX - x0, y: t0 + e.clientY - y0 }; box.style.left = morePos.x + "px"; box.style.top = morePos.y + "px"; };
      const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }
  controls.addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-level]");
    if (b) { setLevel(b.dataset.level); return; }
    const l = ev.target.closest("button[data-layout]");
    if (l) { setLayout(l.dataset.layout); return; }
    // grouping and colours: the page reloads (shared_scripts/area-layout.js reads them from the address)
    const f = ev.target.closest("button[data-fields]");
    if (f) { writeHash(); location.hash = location.hash.replace(/&?fields=\w+/, "") + (f.dataset.fields === "msc" ? "" : "&fields=" + f.dataset.fields); location.reload(); return; }

    const m = ev.target.closest("button[data-marks]");
    if (m) { state.marks = m.dataset.marks; resize(); }
  });
  // animated change between A and C (about 1.4 seconds); the picture is drawn again for every frame
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  let animating = false;
  function setLayout(layout, instant) {
    if (!AL || animating || layout === state.layout) return;
    state.layout = layout;
    const from = state.mix, to = layout === "e2" ? 1 : 0;
    if (instant) { state.mix = to; redraw(); return; }
    layoutE();
    animating = true;
    svg.classList.add("unterwegs");
    const t0 = performance.now();
    const step = (now) => {
      const x = Math.min(1, (now - t0) / 1400);
      state.mix = from + (to - from) * ease(x);
      draw();
      if (x < 1) { requestAnimationFrame(step); return; }
      animating = false;
      svg.classList.remove("unterwegs");
      redraw();
    };
    requestAnimationFrame(step);
  }
  // tooltip on the pale area of a group
  function groupTip(path, F) {
    // only the name of the group (user, 5 November 2026)
    path.addEventListener("mouseenter", (ev) => { tip.textContent = F.name; tip.hidden = false; moveTip(ev); });
    path.addEventListener("mousemove", moveTip);
    path.addEventListener("mouseleave", () => { tip.hidden = true; });
  }
  controls.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.dataset.kind) { if (t.checked) state.kinds.add(t.dataset.kind); else state.kinds.delete(t.dataset.kind); redraw(); }
    else if (t.id === "c-alt") { state.alt = t.checked; redraw(); }
    else if (t.id === "c-names") { svg.classList.toggle("ohne-namen", !t.checked); writeHash(); }
    else if (t.id === "c-groupnames") { svg.classList.toggle("ohne-gruppennamen", !t.checked); writeHash(); }
    else if (t.id === "c-gap") { state.gap = +t.value; draw(); update(); }
    else if (t.id === "c-bysize") { state.bysize = t.checked; resize(); }
    else if (t.id === "c-scale") { state.scale = +t.value; resize(); }
  });
  // a change of the size of the points: circle and force-directed layout are computed again
  function resize() { growCircles(); posE = {}; redraw(); }
  controls.addEventListener("input", (ev) => {
    if (ev.target.id === "c-scale") { const w = document.getElementById("c-scale-wert"); if (w) w.textContent = (+ev.target.value).toFixed(1); return; }
    if (ev.target.id === "c-gap") { const w = document.getElementById("c-gap-wert"); if (w) w.textContent = ev.target.value; return; }
    if (ev.target.id !== "c-min") return;
    state.min[state.level] = +ev.target.value;
    document.getElementById("c-min-wert").textContent = ev.target.value;
    draw();
    update();
  });
  function redraw() {
    document.body.classList.remove("marken-shades", "marken-shapes", "marken-symbols");
    document.body.classList.add("marken-" + state.marks);
    draw(); drawControls(); update();
  }
  function setLevel(level) {
    if (level !== "areas" && level !== "classes") level = "areas";
    if (level === state.level) return;
    state.level = level;
    state.sel = null;
    if (state.pair && !(G.units.areas.has(state.pair.from) && G.units.areas.has(state.pair.to))) state.pair = null;
    redraw();
  }
  document.getElementById("legend").innerHTML =
    (AL ? block("Groups", AL.GROUPS.map((F) => `<span class="gruppe-legende"><i style="background:${F.color}"></i><b>${esc(F.name)}</b></span>` + F.folders.map((f) => {
      const a = (window.GRAPH_AREAS || []).find((x) => x.folder === f) || { name: f };
      const mark = `<svg class="mini" viewBox="-12 -12 24 24"><circle r="10" fill="${AL.shade(f)}" class="m-shades"/><path d="${AL.shapePath(AL.shapeOf(f), 7)}" fill="${F.color}" class="m-shapes"/><circle r="11" fill="${F.color}" class="m-symbols"/>${typeof AL.SYMBOL[f] === "object" ? `<g class="m-symbols">${AL.symbolMarkup(AL.SYMBOL[f], 11, F.color)}</g>` : `<text class="symbol m-symbols" style="font-size:${(AL.SYMBOL[f] || "").length > 2 ? 9 : (AL.SYMBOL[f] || "").length > 1 ? 11 : 14}px">${AL.SYMBOL[f] || ""}</text>`}</svg>`;
      return `<span class="gebiet-legende">${mark}${esc(a.name)} <span class="msc">${esc(a.msc || "")}</span></span>`;
    }).join("")), { closed: true }) : "") +
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
    if (AL && AL.GROUPING !== "msc") parts.push("fields=" + AL.GROUPING);
    if (state.layout === "circle") parts.push("layout=circle");
    if (svg.classList.contains("ohne-gruppennamen")) parts.push("groupnames=0");
    if (svg.classList.contains("ohne-namen")) parts.push("names=0");
    if (state.gap !== 20) parts.push("gap=" + state.gap);
    if (!state.bysize) parts.push("size=same");
    if (state.scale !== 1) parts.push("scale=" + state.scale);
    if (state.min[state.level] !== (state.level === "areas" ? 3 : 2)) parts.push("min=" + state.min[state.level]);
    if (hooks.hashParts) parts.push(...hooks.hashParts());
    if (state.sel) parts.push("sel=" + encodeURIComponent(state.sel));
    else if (state.pair) parts.push("pair=" + encodeURIComponent(state.pair.from + ">" + state.pair.to));
    const h = "#" + parts.join("&");
    if (location.hash !== h) history.replaceState(null, "", h);
  }
  function fromHash() {
    const q = new Map(location.hash.slice(1).split("&").filter(Boolean).map((p) => { const i = p.indexOf("="); return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))]; }));
    // the level of MSC classes is no longer offered on this page (user, 5 November 2026); #level=classes is ignored
    const level = "areas";
    state.level = level;
    if (AL) {
      state.layout = q.get("layout") === "circle" ? "circle" : "e2"; state.mix = state.layout === "e2" ? 1 : 0;
      svg.classList.toggle("ohne-gruppennamen", q.get("groupnames") === "0");
      svg.classList.toggle("ohne-namen", q.get("names") === "0");
      state.gap = q.has("gap") ? Math.max(0, Math.min(40, Math.round(+q.get("gap")) || 0)) : 20;
      const marks = "symbols", bysize = q.get("size") !== "same", scale = Math.max(0.4, Math.min(1.8, +q.get("scale") || 1));
      if (marks !== state.marks || bysize !== state.bysize || scale !== state.scale) { Object.assign(state, { marks, bysize, scale }); growCircles(); posE = {}; }
    }
    if (q.has("min")) state.min[level] = Math.max(1, Math.min(20, +q.get("min") || 1));
    state.sel = q.has("sel") && G.units[level].has(q.get("sel")) ? q.get("sel") : null;
    const p = q.has("pair") ? q.get("pair").split(">") : null;
    state.pair = !state.sel && p && p.length === 2 ? { from: p[0], to: p[1] } : null;
    draw();
    drawControls();
    update();
    if (hooks.fromHash) hooks.fromHash(q);
  }
  // Zoom into an area (todo B101 step 1, user, 5 November 2026): shared_scripts/area-zoom.js, loaded before this file,
  // defines window.AREA_ZOOM; it gets the parts of this page it needs and returns its hooks (afterDraw, onView,
  // afterControls, hashParts, fromHash)
  if (window.AREA_ZOOM && AL && window.AREA_CELLS) Object.assign(hooks, window.AREA_ZOOM({
    svg, state, G, allAreas, layoutE, tip, moveTip, select, clear, writeHash, draw, drawControls, update,
    dragged, fit, scale, getView: () => view, setView: (v) => { view = v; applyView(); }, controls, panel,
    isMap: () => state.level === "areas" && state.layout === "e2" && state.mix === 1 && !animating,
  }));
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
    preview() {
      svg.classList.add("ohne-namen", "vorschau");
      let R = GEO[state.level].R + (state.level === "classes" ? 30 : 50);
      const EL = state.level === "areas" && state.mix > 0 && posE[state.frame];
      if (EL) R = Math.max(...EL.res.cells.map((c) => Math.hypot(c.x, c.y))) * EL.scale + 30;
      view = { x: -R, y: -R, w: 2 * R, h: 2 * R }; applyView();
    },
    // names of the groups on the map: kind (outer, inner, leader), place, centre and cells of the group
    groupLabels: () => groupLabelInfo.map((g) => ({ key: g.key, name: g.name, kind: g.kind, x: g.x, y: g.y, cx: g.cx, cy: g.cy, from: g.from, cells: g.cells })),
    // E2 for tests: positions (unscaled cell units) and the measures' inputs
    e2: () => { const EL = layoutE(); return EL ? { positions: EL.res.positions, keys: allAreas.map((u) => u.key), stats: { groupsConnected: EL.res.stats.groupsConnected, unitsConnected: EL.res.stats.unitsConnected } } : null; },
  };
})();
