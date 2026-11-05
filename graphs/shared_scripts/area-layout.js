// Layouts of the graph of the areas (graphs/areas.html), taken over from the sketch graphs/skizzen/area-layouts.js
// (todo B92; user, 4 November 2026: "take C₃ into the real graph of the areas, for A ⇄ C"):
//   - the seven groups of the areas (main groups of the MSC, 05–22 split into number theory with discrete mathematics
//     and algebra, algebra split into classical structures and higher algebra), each with a base colour; the areas of a
//     group ordered from elementary to "higher" and coloured as shades of the base colour;
//   - A: the circle sorted by group; the order of the groups and of the areas within a group makes the arc lengths and
//     the crossings of the bands small;
//   - C₃: force-directed with the groups held together, groups moved as wished (GROUP_PULLS), even spacing, groups
//     that overlap turned or pulled apart.
// Pure functions without drawing; units are objects with r (radius), F (group), folder; pairs are { a, b, w } with the
// number w of single edges between the units a and b (both directions, all kinds).
(function () {
  "use strict";
  const hsl = (h, s, l) => `hsl(${h},${s}%,${l.toFixed(1)}%)`;
  // three groupings as in the sketch (user, 5 November 2026), chosen with #fields=msc|msc8|themes (the page reloads):
  // the seven main groups of the MSC (default), the same with number theory and discrete mathematics separate, or eight
  // groups by subject
  const fieldsAsked = (location.hash.match(/fields=(\w+)/) || [])[1];
  const GROUPING = ["msc8", "themes"].includes(fieldsAsked) ? fieldsAsked : "msc";
  const MSC7 = [
    { key: "foundations", name: "Logic and foundations (03)", hue: 30, sat: 22, from: 3, to: 4 },
    { key: "discrete", name: "Number theory and discrete mathematics (11, 05)", hue: 2, sat: 62, codes: [11, 5] },
    { key: "algebra", name: "Algebra: classical structures (06–20)", hue: 212, sat: 52, list: ["general-algebra", "linear-algebra", "group-theory", "field-theory", "galois-theory", "commutative-algebra", "associative-algebras"] },
    { key: "higher-algebra", name: "Higher algebra (14, 17–19, 20C, 22)", hue: 184, sat: 58, list: ["algebraic-geometry", "lie-theory", "representation-theory", "category-theory", "homological-algebra", "k-theory"] },
    { key: "analysis", name: "Analysis (26–49)", hue: 272, sat: 40, from: 26, to: 50 },
    { key: "geometry", name: "Geometry and topology (51–58)", hue: 128, sat: 40, from: 51, to: 59 },
    { key: "applied", name: "Applied mathematics (60–97)", hue: 38, sat: 68, from: 60, to: 99 },
  ];
  const MSC8 = MSC7.flatMap((F) => (F.key === "discrete"
    ? [{ key: "discrete", name: "Number theory (11)", hue: 2, sat: 62, codes: [11] },
      { key: "discrete-math", name: "Discrete mathematics (05, 68)", hue: 322, sat: 58, list: ["combinatorics", "graph-theory", "computer-science"] }]
    : [F.key === "applied" ? Object.assign({}, F, { except: ["computer-science"] }) : Object.assign({}, F)]));
  const THEMES = [
    { key: "foundations", name: "Foundations", hue: 30, sat: 16, folders: ["logic", "model-theory", "set-theory", "category-theory"] },
    { key: "numbers", name: "Numbers", hue: 4, sat: 62, folders: ["elementary-number-theory", "diophantine-number-theory", "algebraic-number-theory", "arithmetic-geometry", "further-number-theory"] },
    { key: "structures", name: "Structures", hue: 212, sat: 52, folders: ["general-algebra", "group-theory", "field-theory", "galois-theory", "commutative-algebra", "linear-algebra", "associative-algebras", "lie-theory", "representation-theory", "k-theory", "homological-algebra"] },
    { key: "space", name: "Space", hue: 128, sat: 38, folders: ["geometry", "topology", "algebraic-geometry", "global-analysis"] },
    { key: "change", name: "Change", hue: 278, sat: 36, folders: ["analysis", "functional-analysis", "several-complex-variables", "differential-equations", "dynamical-systems", "approximation-and-transforms", "calculus-of-variations"] },
    { key: "chance", name: "Chance", hue: 42, sat: 70, folders: ["probability", "statistics"] },
    { key: "discrete", name: "Discrete and computation", hue: 176, sat: 48, folders: ["combinatorics", "graph-theory", "computer-science", "computability", "game-theory", "information-theory", "numerical-analysis", "optimization"] },
    { key: "applications", name: "Applications", hue: 330, sat: 50, folders: ["mathematical-physics", "mathematical-biology"] },
  ];
  const GROUPS = GROUPING === "themes" ? THEMES : GROUPING === "msc8" ? MSC8 : MSC7;
  // colours "one per group" (default, user, 5 November 2026: every area in the colour of its group; the base colours from
  // area-colours.js, chosen for the largest contrast between neighbouring groups) or "graded by order" (#colours=graded,
  // the shades as before); the groups by subject keep their base colours
  // since 5 November 2026 the page shows always one colour per group (user); #colours is ignored
  const GRADED = false;
  // base colours per grouping (fixed palette assigned by meaning, area-colours.js; user, 5 November 2026)
  const CONTRAST = !GRADED && window.AREA_COLOURS && window.AREA_COLOURS.groups[GROUPING] ? window.AREA_COLOURS.groups[GROUPING] : null;
  const hexToHsl = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let hh = 0, sat = 0; if (d) { sat = d / (1 - Math.abs(2 * l - 1)); hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; } return { h: Math.round(hh), s: Math.round(100 * sat) }; };
  const GRAY = { key: "none", name: "MSC classes without a folder", gray: true, folders: [] };
  // within each group from elementary to "higher" (user, 4 November 2026)
  const ELEMENTARY_FIRST = [
    "set-theory", "logic", "computability", "model-theory",
    "elementary-number-theory", "combinatorics", "graph-theory", "diophantine-number-theory", "further-number-theory", "algebraic-number-theory", "arithmetic-geometry",
    "linear-algebra", "group-theory", "field-theory", "galois-theory", "commutative-algebra", "associative-algebras", "general-algebra",
    "category-theory", "representation-theory", "lie-theory", "homological-algebra", "algebraic-geometry", "k-theory",
    "analysis", "differential-equations", "approximation-and-transforms", "calculus-of-variations", "dynamical-systems", "functional-analysis", "several-complex-variables",
    "geometry", "topology", "global-analysis",
    "probability", "statistics", "numerical-analysis", "optimization", "information-theory", "game-theory", "computer-science", "mathematical-biology", "mathematical-physics",
  ];
  const rank = (f) => { const i = ELEMENTARY_FIRST.indexOf(f); return i < 0 ? 999 : i; };
  GROUPS.forEach((F) => {
    F.folders = (F.folders ? (window.GRAPH_AREAS || []).filter((a) => F.folders.includes(a.folder)) : (window.GRAPH_AREAS || []).filter((a) => { const m = parseInt(a.msc, 10); return !(F.except || []).includes(a.folder) && (F.list ? F.list.includes(a.folder) : F.codes ? F.codes.includes(m) : m >= F.from && m < F.to); }))
      .map((a) => a.folder).sort((a, b) => rank(a) - rank(b));
    if (CONTRAST && CONTRAST[F.key]) { const q = hexToHsl(CONTRAST[F.key]); F.hue = q.h; F.sat = q.s; F.color = CONTRAST[F.key]; }
    else F.color = hsl(F.hue, Math.min(80, F.sat + 8), F.key === "applied" || F.key === "chance" ? 48 : 42);
    F.pale = hsl(F.hue, F.sat + 10, 50);
  });
  const groupOf = new Map(), shade = new Map();
  GROUPS.forEach((F) => F.folders.forEach((f, i) => {
    groupOf.set(f, F);
    const m = F.folders.length, L0 = m === 1 ? 45 : 28 + (46 * i) / (m - 1);
    shade.set(f, GRADED ? hsl(F.hue, F.sat, L0) : F.color);
  }));

  // ------------------------------------------------------------ marks of the areas (shapes and symbols)
  // one symbol per area, a sign characteristic of it (user, 4 November 2026)
  const SYMBOL = {
    "logic": "⊢", "set-theory": "∈", "category-theory": "→",
    "elementary-number-theory": "≡", "diophantine-number-theory": "√2", "algebraic-number-theory": "𝒪", "arithmetic-geometry": "ζ", "further-number-theory": "∑",
    "general-algebra": "∨", "group-theory": "G", "field-theory": "𝔽", "commutative-algebra": "𝔭", "linear-algebra": "▦", "associative-algebras": "⊕", "lie-theory": "𝔤", "representation-theory": "ρ", "k-theory": "K",
    "geometry": "△", "topology": "π₁", "algebraic-geometry": "ℙ", "global-analysis": "∇",
    "analysis": "∫", "several-complex-variables": "ℂⁿ", "differential-equations": "y′", "dynamical-systems": "↻", "approximation-and-transforms": "≈", "calculus-of-variations": "δ",
    "probability": "P", "statistics": "x̄",
    "combinatorics": "n!", "graph-theory": { draw: "graph", text: "three joined circles" }, "computer-science": "λ", "information-theory": "H", "numerical-analysis": "Δx", "optimization": "max",
    "mathematical-physics": "ℏ", "mathematical-biology": "R₀",
    "model-theory": "⊨", "galois-theory": "Gal", "computability": "NP", "homological-algebra": "Ext", "game-theory": "♠", "functional-analysis": "ℋ",
  };
  // A symbol is a text or a drawing ({ draw: <name of a function in SYMBOL_DRAW>, text: <description> }; user,
  // 4 November 2026: graph theory as three empty circles joined by fine lines). symbolMarkup gives the SVG markup of a
  // symbol for a point of radius r with fill colour `fill`, centred at 0,0; texts scale with r as before.
  const SYMBOL_DRAW = {
    // three empty circles in a triangle, joined by three thin lines
    graph: (r, fill) => {
      const p = [-90, 30, 150].map((a) => [0.5 * r * Math.cos((a * Math.PI) / 180), 0.5 * r * Math.sin((a * Math.PI) / 180)]), f = (x) => x.toFixed(2);
      const lines = [[0, 1], [1, 2], [2, 0]].map(([i, j]) => `M${f(p[i][0])},${f(p[i][1])}L${f(p[j][0])},${f(p[j][1])}`).join("");
      return `<g class="symbol-drawing"><path d="${lines}" fill="none" stroke="#fff" stroke-width="${f(0.06 * r)}" opacity=".85"/>` +
        p.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.2 * r)}" fill="${fill}" stroke="#fff" stroke-width="${f(0.09 * r)}"/>`).join("") + "</g>";
    },
  };
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function symbolMarkup(sym, r, fill) {
    if (sym && typeof sym === "object") return SYMBOL_DRAW[sym.draw] ? SYMBOL_DRAW[sym.draw](r, fill) : "";
    const t = sym || "";
    return `<text class="symbol" style="font-size:${(r * (t.length > 2 ? 0.8 : t.length > 1 ? 1.0 : 1.35)).toFixed(1)}px">${esc(t)}</text>`;
  }
  // one shape per area within its group, in the order of the group
  const SHAPES = ["circle", "square", "triangle", "diamond", "pentagon", "star", "hexagon", "triangle-down", "cross", "ring", "half", "bar"];
  const shapeOf = (folder) => { const F = groupOf.get(folder); return F ? SHAPES[F.folders.indexOf(folder) % SHAPES.length] : "circle"; };
  function shapePath(shape, r) {
    const poly = (n, rot, rr) => { const pts = []; for (let i = 0; i < n; i++) { const a = rot + (2 * Math.PI * i) / n; pts.push((rr * Math.cos(a)).toFixed(2) + "," + (rr * Math.sin(a)).toFixed(2)); } return "M" + pts.join("L") + "Z"; };
    switch (shape) {
      case "square": return poly(4, Math.PI / 4, r * 1.2);
      case "triangle": return poly(3, -Math.PI / 2, r * 1.35);
      case "triangle-down": return poly(3, Math.PI / 2, r * 1.35);
      case "diamond": return poly(4, 0, r * 1.25);
      case "pentagon": return poly(5, -Math.PI / 2, r * 1.1);
      case "hexagon": return poly(6, 0, r * 1.08);
      case "star": { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 5, rr = i % 2 ? r * 0.6 : r * 1.4; pts.push((rr * Math.cos(a)).toFixed(2) + "," + (rr * Math.sin(a)).toFixed(2)); } return "M" + pts.join("L") + "Z"; }
      case "ring": return `M${r * 1.1},0A${r * 1.1},${r * 1.1} 0 1 1 ${-r * 1.1},0A${r * 1.1},${r * 1.1} 0 1 1 ${r * 1.1},0ZM${r * 0.5},0A${r * 0.5},${r * 0.5} 0 1 0 ${-r * 0.5},0A${r * 0.5},${r * 0.5} 0 1 0 ${r * 0.5},0Z`;
      case "half": return `M${-r * 1.2},${r * 0.55}A${r * 1.2},${r * 1.2} 0 0 1 ${r * 1.2},${r * 0.55}Z`;
      case "bar": return `M${-r * 1.3},${-r * 0.55}H${r * 1.3}V${r * 0.55}H${-r * 1.3}Z`;
      case "cross": { const a = r * 1.15, b = r * 0.42; return `M${-b},${-a}H${b}V${-b}H${a}V${b}H${b}V${a}H${-b}V${b}H${-a}V${-b}H${-b}Z`; }
      default: return `M${r},0A${r},${r} 0 1 1 ${-r},0A${r},${r} 0 1 1 ${r},0Z`;
    }
  }

  // ------------------------------------------------------------ A: circle sorted by group
  const angDist = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };
  function slots(groups, gap) {
    const total = groups.reduce((s, g) => s + g.length, 0) + gap * groups.length;
    let pos = gap / 2;
    groups.forEach((g) => { g.forEach((u) => { u.angle = -Math.PI / 2 + (2 * Math.PI * (pos + 0.5)) / total; u.pos = pos; pos += 1; }); pos += gap; });
  }
  function crossings(list) {
    let wx = 0;
    for (let i = 0; i < list.length; i++) {
      const p = list[i], a = Math.min(p.a.pos, p.b.pos), b = Math.max(p.a.pos, p.b.pos);
      for (let j = i + 1; j < list.length; j++) {
        const q = list[j], c = q.a.pos, d = q.b.pos;
        if (c === a || c === b || d === a || d === b) continue;
        if ((a < c && c < b) !== (a < d && d < b)) wx += Math.sqrt(p.w * q.w);
      }
    }
    return wx;
  }
  const arcLength = (pairs) => pairs.reduce((s, p) => s + p.w * angDist(p.a.angle, p.b.angle), 0);
  // local search: move one unit within its group, reverse a group, move whole groups; cost = arc length + mu ×
  // weighted crossings (pairs with at least 3 single edges), mu chosen so that both parts weigh the same at the start
  function circleSorted(units, pairs, gap = 1.2) {
    const groups = GROUPS.concat([GRAY]).map((F) => units.filter((u) => u.F === F).sort((a, b) => rank(a.folder ? a.folder.folder : "") - rank(b.folder ? b.folder.folder : "") || (a.code < b.code ? -1 : 1))).filter((g) => g.length);
    const cross = pairs.filter((p) => p.w >= 3);
    slots(groups, gap);
    const L0 = arcLength(pairs), X0 = crossings(cross), mu = X0 ? L0 / X0 : 0;
    const cost = () => { slots(groups, gap); return arcLength(pairs) + mu * crossings(cross); };
    let best = cost();
    const tryMove = (arr, i, j) => {
      const [x] = arr.splice(i, 1); arr.splice(j, 0, x);
      const c = cost();
      if (c < best - 1e-9) { best = c; return true; }
      arr.splice(j, 1); arr.splice(i, 0, x);
      return false;
    };
    for (let round = 0, improved = true; improved && round < 12; round++) {
      improved = false;
      groups.forEach((g) => {
        for (let i = 0; i < g.length; i++) for (let j = 0; j < g.length; j++) if (i !== j && tryMove(g, i, j)) improved = true;
        if (g.length > 2) { g.reverse(); const c = cost(); if (c < best - 1e-9) { best = c; improved = true; } else g.reverse(); }
      });
      for (let i = 0; i < groups.length; i++) for (let j = 0; j < groups.length; j++) if (i !== j && tryMove(groups, i, j)) improved = true;
    }
    slots(groups, gap);
    // the angles of A as the sketch computes them (gap 1.2, all points the same room): the start of C₃
    groups.flat().forEach((u) => { u.angleA = u.angle; });
    return groups;
  }

  // ------------------------------------------------------------ C₃
  function force(units, pairs, k, steps) {
    const N = units.length, idx = new Map(units.map((u, i) => [u, i]));
    const R0 = k * Math.sqrt(N) * 0.55;
    const P = units.map((u) => { const a = u.angleA !== undefined ? u.angleA : u.angle; return { x: R0 * Math.cos(a), y: R0 * Math.sin(a), r: u.r }; });
    const maxW = Math.max(1, ...pairs.map((p) => p.w));
    const E = pairs.map((p) => [idx.get(p.a), idx.get(p.b), Math.sqrt(p.w / maxW)]).filter((e) => e[0] !== undefined && e[1] !== undefined);
    const fk = units.map((u) => u.F.key), ak = units.map((u) => (u.folder ? u.folder.folder : u.key));
    let t = k * 0.6;
    for (let s = 0; s < steps; s++) {
      const D = P.map(() => ({ x: 0, y: 0 }));
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        let dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d2 = dx * dx + dy * dy;
        if (d2 < 1e-6) { dx = 0.1 * (i - j); dy = 0.1; d2 = dx * dx + dy * dy; }
        const d = Math.sqrt(d2);
        let f = (k * k) / d;
        if (fk[i] !== fk[j] && d < 2.2 * k) f *= 3;
        D[i].x += (dx / d) * f; D[i].y += (dy / d) * f; D[j].x -= (dx / d) * f; D[j].y -= (dy / d) * f;
      }
      for (const [i, j, w] of E) {
        const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.hypot(dx, dy) || 0.01, f = ((d * d) / k) * w * (fk[i] !== fk[j] ? 0.45 : 1);
        D[i].x -= (dx / d) * f; D[i].y -= (dy / d) * f; D[j].x += (dx / d) * f; D[j].y += (dy / d) * f;
      }
      const cen = (keys) => { const m = new Map(); P.forEach((p, i) => { const c = m.get(keys[i]) || { x: 0, y: 0, n: 0 }; c.x += p.x; c.y += p.y; c.n++; m.set(keys[i], c); }); m.forEach((c) => { c.x /= c.n; c.y /= c.n; }); return m; };
      const cf = cen(fk), ca = cen(ak);
      P.forEach((p, i) => { const c = cf.get(fk[i]), a = ca.get(ak[i]); D[i].x += (c.x - p.x) * 1.6 + (a.x - p.x) * 0.5; D[i].y += (c.y - p.y) * 1.6 + (a.y - p.y) * 0.5; });
      P.forEach((p, i) => { D[i].x -= p.x * 0.03; D[i].y -= p.y * 0.03; });
      P.forEach((p, i) => { const d = Math.hypot(D[i].x, D[i].y) || 1, m = Math.min(d, t); p.x += (D[i].x / d) * m; p.y += (D[i].y / d) * m; });
      t = Math.max(k * 0.01, t * 0.985);
    }
    for (let it = 0; it < 60; it++) for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.hypot(dx, dy) || 0.01, need = P[i].r + P[j].r + k * 0.15;
      if (d < need) { const m = (need - d) / 2; P[i].x += (dx / d) * m; P[i].y += (dy / d) * m; P[j].x -= (dx / d) * m; P[j].y -= (dy / d) * m; }
    }
    const cx = P.reduce((a, p) => a + p.x, 0) / N, cy = P.reduce((a, p) => a + p.y, 0) / N;
    const ds = P.map((p) => Math.hypot(p.x - cx, p.y - cy)).sort((x, y) => x - y), lim = 1.1 * ds[Math.floor(0.9 * (N - 1))];
    P.forEach((p) => { const d = Math.hypot(p.x - cx, p.y - cy); if (d > lim) { p.x = cx + ((p.x - cx) * lim) / d; p.y = cy + ((p.y - cy) * lim) / d; } });
    return P;
  }
  // wishes for the places of groups (user, 4 November 2026, screenshots/10.PNG)
  const GROUP_PULLS = [
    { group: "higher-algebra", towards: ["algebra", "geometry"], share: 0.55 },
    { group: "foundations", towards: ["applied"], share: 0.4 },
  ];
  function pullGroups(units, P) {
    const idx = (key) => units.map((u, i) => (u.F.key === key ? i : -1)).filter((i) => i >= 0);
    const centre = (ix) => ({ x: ix.reduce((a, i) => a + P[i].x, 0) / ix.length, y: ix.reduce((a, i) => a + P[i].y, 0) / ix.length });
    GROUP_PULLS.forEach((w) => {
      const own = idx(w.group), targets = w.towards.map(idx).filter((ix) => ix.length);
      if (!own.length || !targets.length) return;
      const c = centre(own), ts = targets.map(centre), t = { x: ts.reduce((a, q) => a + q.x, 0) / ts.length, y: ts.reduce((a, q) => a + q.y, 0) / ts.length };
      own.forEach((i) => { P[i] = { ...P[i], x: P[i].x + (t.x - c.x) * w.share, y: P[i].y + (t.y - c.y) * w.share }; });
    });
    return P;
  }
  // even spacing: points towards the centre of their group, groups towards the middle, no two points closer than the
  // median gap (between groups 1.6 times as much)
  function compact(units, P, pad, opt = {}) {
    const CENTRE = opt.centre || 0.012, INTER = opt.inter || 1.6, IT = opt.it || 160;
    const N = P.length;
    const gaps = P.map((p, i) => Math.min(...P.map((q, j) => (i === j ? Infinity : Math.hypot(p.x - q.x, p.y - q.y) - p.r - q.r))));
    const gap = Math.max(pad * 1.2, gaps.slice().sort((a, b) => a - b)[Math.floor(N / 2)]);
    const keys = units.map((u) => u.F.key);
    for (let it = 0; it < IT; it++) {
      const cen = new Map();
      P.forEach((p, i) => { const c = cen.get(keys[i]) || { x: 0, y: 0, n: 0 }; c.x += p.x; c.y += p.y; c.n++; cen.set(keys[i], c); });
      cen.forEach((c) => { c.x /= c.n; c.y /= c.n; });
      const mx = P.reduce((a, p) => a + p.x, 0) / N, my = P.reduce((a, p) => a + p.y, 0) / N;
      P.forEach((p, i) => { const c = cen.get(keys[i]); p.x += (c.x - p.x) * 0.03 + (mx - c.x) * CENTRE; p.y += (c.y - p.y) * 0.03 + (my - c.y) * CENTRE; });
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.hypot(dx, dy) || 0.01, need = P[i].r + P[j].r + gap * (keys[i] === keys[j] ? 1 : INTER);
        if (d < need) { const h = (need - d) / 2; P[i].x += (dx / d) * h; P[i].y += (dy / d) * h; P[j].x -= (dx / d) * h; P[j].y -= (dy / d) * h; }
      }
    }
    return P;
  }
  function hull(points) {
    const p = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    if (p.length < 3) return p;
    const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  const ringOf = (pts, pad) => { const ring = []; pts.forEach((p) => { for (let i = 0; i < 12; i++) { const a = (i / 12) * 2 * Math.PI; ring.push({ x: p.x + (p.r + pad) * Math.cos(a), y: p.y + (p.r + pad) * Math.sin(a) }); } }); return hull(ring); };
  // groups whose pale areas overlap: turned about the middle (smallest angle, counter-clockwise first), then drawn
  // together and pushed apart until they no longer meet
  function separateFields(units, P, pad) {
    const overlap = (A, B) => {
      for (const poly of [A, B]) for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length], nx = q.y - p.y, ny = p.x - q.x;
        const pa = A.map((v) => v.x * nx + v.y * ny), pb = B.map((v) => v.x * nx + v.y * ny);
        if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false;
      }
      return true;
    };
    const ring = (ix, Q) => ringOf(ix.map((i) => Q[i]), pad);
    const groups = [...new Set(units.map((u) => u.F))].map((F) => ({ F, idx: units.map((u, i) => (u.F === F ? i : -1)).filter((i) => i >= 0) }));
    const cx = P.reduce((a, q) => a + q.x, 0) / P.length, cy = P.reduce((a, q) => a + q.y, 0) / P.length;
    const count = (g, Q) => { const h = ring(g.idx, Q); return groups.filter((o) => o !== g && overlap(h, ring(o.idx, Q))).length; };
    for (let round = 0; round < 3; round++) groups.forEach((g) => {
      if (!count(g, P)) return;
      let best = null;
      for (let deg = 1; deg <= 90 && !best; deg++) for (const sign of [-1, 1]) {
        const a = (sign * deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
        const Q = P.map((q, i) => (g.idx.includes(i) ? { x: cx + (q.x - cx) * c - (q.y - cy) * s, y: cy + (q.x - cx) * s + (q.y - cy) * c, r: q.r } : q));
        if (!count(g, Q)) { best = Q; break; }
      }
      if (best) best.forEach((q, i) => { P[i] = q; });
    });
    const centre = (g) => ({ x: g.idx.reduce((a, i) => a + P[i].x, 0) / g.idx.length, y: g.idx.reduce((a, i) => a + P[i].y, 0) / g.idx.length });
    for (let it = 0; it < 120; it++) {
      let any = false;
      for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++) {
        const A = groups[a], B = groups[b];
        if (!overlap(ring(A.idx, P), ring(B.idx, P))) continue;
        any = true;
        const ca = centre(A), cb = centre(B);
        let dx = cb.x - ca.x, dy = cb.y - ca.y, d = Math.hypot(dx, dy) || 1;
        dx /= d; dy /= d;
        const push = pad * 0.4;
        A.idx.forEach((i) => { P[i] = { x: P[i].x + (ca.x - P[i].x) * 0.06 - dx * push, y: P[i].y + (ca.y - P[i].y) * 0.06 - dy * push, r: P[i].r }; });
        B.idx.forEach((i) => { P[i] = { x: P[i].x + (cb.x - P[i].x) * 0.06 + dx * push, y: P[i].y + (cb.y - P[i].y) * 0.06 + dy * push, r: P[i].r }; });
      }
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.hypot(dx, dy) || 0.01, need = P[i].r + P[j].r + pad * 0.6;
        if (d < need) { const h = (need - d) / 2; P[i] = { ...P[i], x: P[i].x + (dx / d) * h, y: P[i].y + (dy / d) * h }; P[j] = { ...P[j], x: P[j].x - (dx / d) * h, y: P[j].y - (dy / d) * h }; }
      }
      if (!any) break;
    }
    return P;
  }
  // C₃ for units whose angle is set by A; result: positions { x, y } centred at 0, scaled so that the larger side is
  // `size`
  function layoutC3(units, pairs, k, steps, pad, size) {
    const copy = (P) => P.map((q) => ({ ...q }));
    const F0 = force(units, pairs, k, steps);
    // C₃ exactly as in the sketch (skizzen/area-layouts.js, variant C₃; user, 4 November 2026: the good version with
    // set theory in the middle, no overlaps and balanced distances); the variant "middle filled" is not used here
    const P = separateFields(units, compact(units, pullGroups(units, copy(F0)), pad), pad);
    const minX = Math.min(...P.map((q) => q.x)), maxX = Math.max(...P.map((q) => q.x)), minY = Math.min(...P.map((q) => q.y)), maxY = Math.max(...P.map((q) => q.y));
    const sc = size / Math.max(maxX - minX, maxY - minY), mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
    return new Map(units.map((u, i) => [u, { x: (P[i].x - mx) * sc, y: (P[i].y - my) * sc }]));
  }
  // the pale area of a group: hull of small circles around its points (path)
  const areaPath = (pts, pad) => "M" + ringOf(pts, pad).map((q) => q.x.toFixed(1) + "," + q.y.toFixed(1)).join("L") + "Z";

  window.AREA_LAYOUT = {
    GROUPS, GRAY, GROUPING, GRADED,
    groupOf: (folder) => groupOf.get(folder) || GRAY,
    shade: (folder) => shade.get(folder),
    circleSorted, layoutC3, areaPath, hull, SYMBOL, SYMBOL_DRAW, symbolMarkup, shapeOf, shapePath,
  };
})();
