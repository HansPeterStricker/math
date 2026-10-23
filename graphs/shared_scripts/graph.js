// Shared code of the views index.html and begriffe.html (bipartit.html uses the colors and helper functions):
// colors of the areas, SVG helpers and the layered layout of a directed acyclic graph.
//
// Language: all visible texts of this script go through GL.T or GL.F (English versions in
// ../../translations/ui-graph.js). Without sprache.js they stay German. Tables such as GL.EDGE, GL.STATE_SHORT, GL.EVENT,
// GL.MSC
// are translated on loading, because sprache.js is loaded before this script. The keys (codes) stay German.
window.GL = (function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const T = (s) => (window.I18N ? window.I18N.t(s) : s);
  // Pattern with placeholders {0}, {1}, …: the whole pattern is translated, then the values are inserted
  const F = (pattern, ...values) => T(pattern).replace(/\{(\d)\}/g, (_, i) => values[i]);

  // Light: fill of the boxes. Dark: edges that start at a node of this area.
  const COLOR = { grundlage: "#dcd8cf", kat: "#d5d9e4", kommAlg: "#e9d8a6", schema: "#e3eab9", kohom: "#cfe0c3",
    divisor: "#f2cfcf", kurven: "#f2c9a8", rr: "#e3c3d8", komplex: "#c3d6ea", etale: "#cdc6ea", arith: "#ead0c6",
    biration: "#d6e6e0", abzaehl: "#f0e0b0" };
  const DARK = { grundlage: "#7d776b", kat: "#56607c", kommAlg: "#9a7a1e", schema: "#6f7f22", kohom: "#4f7a3a",
    divisor: "#a04848", kurven: "#b0602c", rr: "#8a4a78", komplex: "#3f6f9a", etale: "#5a4a9a", arith: "#9a5a46",
    biration: "#3f7a6a", abzaehl: "#9a7a1e" };

  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  // Formula without scroll bars (Todo B13): inline mode with \displaystyle, so that KaTeX breaks lines after relations
  // and operators; additional break points before \quad and between the words in 	ext{…}; an outer gathered
  // environment becomes rows separated by \. An aligned environment (Todo B34) stays a block: its rows are kept and
  // aligned at &, but a row cannot break, so rows in the data must be short. Against breaks at unfavourable places
  // (Todo B44) a set in braces \{…\} is kept on one line, and so is every row of at most SHORT_ROW characters of LaTeX.
  // The same function is in ../Landkarte/draft-8-zoom.js.
  const SHORT_ROW = 44;
  const keepSets = (s) => {   // {\{ … \}} for every outermost pair \{ … \}
    let out = "", i = 0;
    while (i < s.length) {
      const a = s.indexOf("\\{", i); if (a < 0) { out += s.slice(i); break; }
      let d = 0, j = a;
      for (; j < s.length; j++) { if (s.startsWith("\\{", j)) { d++; j++; } else if (s.startsWith("\\}", j)) { d--; j++; if (!d) break; } }
      if (d) { out += s.slice(i); break; }
      // After a command such as \left or \bigl the brace is a delimiter and must stay where it is
      const delimiter = /\\[a-zA-Z]+\s*$/.test(s.slice(0, a));
      out += s.slice(i, a) + (delimiter ? s.slice(a, j + 1) : "{" + s.slice(a, j + 1) + "}"); i = j + 1;
    }
    return out;
  };
  const keepShort = (row) => (row.trim().length <= SHORT_ROW && !/&|\\begin/.test(row) ? "{" + row + "}" : row);
  const wrap = (f) => {
    const inner = f.replace(/^\s*\\begin\{gathered\}([\s\S]*)\\end\{gathered\}\s*$/, "$1");
    const rows = /\\begin\{(aligned|cases|array|matrix|pmatrix)\}/.test(inner) ? [inner] : inner.split(/\\\\/);
    return rows.map((r) => keepShort(keepSets(r))).join("\\\\")
      .replace(/\\q?quad(?![a-zA-Z])/g, (m) => "\\allowbreak" + m)
      .replace(/\\text\{([^{}]*)\}/g, (m, t) => /\S \S/.test(t) ? t.split(/(?<=\S) (?=\S)/).map((w, i) => "\\text{" + (i ? " " : "") + w + "}").join("\\allowbreak ") : m);
  };
  const tex = (f) => { try { return '<span class="formel-umbruch">' + katex.renderToString("\\displaystyle " + wrap(f), { throwOnError: false }) + "</span>"; } catch (e) { return f; } };
  // Name in at most n lines of at most max characters
  const textLines = (name, max = 22, n = 2) => { const w = name.split(" "), z = [""]; w.forEach((x) => { if ((z[z.length - 1] + " " + x).trim().length > max) z.push(x); else z[z.length - 1] = (z[z.length - 1] + " " + x).trim(); }); return z.slice(0, n); };
  const arc = (x1, y1, x2, y2) => { const d = (x2 - x1) / 2; return `C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`; };

  // ------------------------------------------------------------ layered layout
  // ids: nodes in a fixed order; columnOf(id): column (depth); edges: [{from, to, ...}] with column(from) < column(to).
  // An edge spanning several columns gets a waypoint in each intermediate column, so that it runs in its own lane
  // between the boxes. The order within the columns is sorted alternately by the barycenter of the left and
  // the right neighbors (barycenter heuristic); afterwards the columns are centered vertically.
  function layers(ids, columnOf, edges, o) {
    const { BH, GAP_N, GAP_W, MARGIN, HEAD } = o, ROUNDS = o.ROUNDS || 30;
    const columns = [], item = {}, chains = [];
    const fresh = (c, obj) => { (columns[c] = columns[c] || []).push(obj); obj.c = c; return obj; };
    ids.forEach((id) => (item[id] = fresh(columnOf(id), { kind: "knoten", id, links: [], rechts: [] })));
    edges.forEach((ka) => {
      const chain = [item[ka.from]];
      for (let c = item[ka.from].c + 1; c < item[ka.to].c; c++) chain.push(fresh(c, { kind: "weg", links: [], rechts: [] }));
      chain.push(item[ka.to]);
      for (let i = 0; i + 1 < chain.length; i++) { chain[i].rechts.push(chain[i + 1]); chain[i + 1].links.push(chain[i]); }
      chains.push({ edge: ka, chain });
    });
    columns.forEach((s) => s.forEach((x, i) => (x.r = i)));
    const bz = (x, side) => { const n = x[side]; return n.length ? n.reduce((a, y) => a + y.r, 0) / n.length : x.r; };
    for (let round = 0; round < ROUNDS; round++) {
      const side = round % 2 ? "rechts" : "links", others = round % 2 ? "links" : "rechts";
      const series = round % 2 ? columns.slice().reverse() : columns;
      series.forEach((s) => {
        s.forEach((x) => (x._b = (2 * bz(x, side) + bz(x, others)) / 3));
        s.sort((a, b) => a._b - b._b).forEach((x, i) => (x.r = i));
      });
    }
    // y positions: boxes and waypoints stacked, columns centered
    const height = columns.map((s) => s.reduce((a, x) => a + (x.kind === "knoten" ? BH + GAP_N : GAP_W), 0));
    const maxH = Math.max(...height);
    columns.forEach((s, c) => {
      let y = MARGIN + HEAD + (maxH - height[c]) / 2;
      s.forEach((x) => { x.y = x.kind === "knoten" ? y : y + GAP_W / 2; y += x.kind === "knoten" ? BH + GAP_N : GAP_W; });
    });
    return { columns, item, chains, maxH };
  }

  // Path of a chain: from the right edge of the start box through the waypoints (horizontal within a column,
  // curved
  // between the columns) to the target point (zx, zy).
  function path(chain, zx, zy, xCol, BW, BH) {
    const q = chain[0];
    let x = xCol(q.c) + BW, y = q.y + BH / 2, d = `M${x},${y}`;
    chain.slice(1, -1).forEach((w) => { const xw = xCol(w.c); d += arc(x, y, xw, w.y) + `L${xw + BW},${w.y}`; x = xw + BW; y = w.y; });
    return d + arc(x, y, zx, zy);
  }

  // Gradient along the x axis: light at the start, dark at the end (shows the direction of the
  // edge)
  function gradient(defs, gid, color, x1, x2) {
    const g = el("linearGradient", { id: gid, gradientUnits: "userSpaceOnUse", x1, y1: 0, x2, y2: 0 }, defs);
    el("stop", { offset: "0", "stop-color": color, "stop-opacity": 0.18 }, g);
    el("stop", { offset: "1", "stop-color": color, "stop-opacity": 0.9 }, g);
    return `url(#${gid})`;
  }

  // Year of a theorem: the field `year`; otherwise „ohne klaren Ursprung“ or the span of the historical
  // events from `history` („ca.“ if the earliest event is only approximately dated).
  function yearText(k, history) {
    if (k.year) return String(k.year);
    if (k.originUnclear) return T("ohne klaren Ursprung");
    const e = (history || []).filter((h) => h.from === k.id);
    if (!e.length) return "";
    const a = Math.min(...e.map((h) => h.year)), b = Math.max(...e.map((h) => h.year));
    const ca = e.some((h) => h.year === a && h.circa) ? T("ca. ") : "";
    return a === b ? ca + a : `${ca}${a}–${b}`;
  }

  return { NS, COLOR, DARK, el, tex, textLines, arc, layers, path, gradient, yearText, T, F };
})();

// ------------------------------------------------------------ Additions for the large graph (gross.html)
// Appended to window.GL afterwards; the functions above remain unchanged.
(function (GL) {
  "use strict";

  // Merges window.AG with an extension. Nodes and proofs are copied so that the original data
  // remain unchanged.
  GL.merge = function (A, E) {
    return {
      title: E.title || A.title,
      areas: Object.assign({}, A.areas, E.areas),
      nodes: A.nodes.concat(E.nodes).map((k) => Object.assign({}, k)),
      proofs: A.proofs.concat(E.proofs).map((b) => Object.assign({}, b, { premises: b.premises.slice() })),
      history: (A.history || []).concat(E.history || []),
      highlightKinds: Object.assign({}, A.highlightKinds, E.highlightKinds),
      highlights: Object.assign({}, A.highlights, E.highlights),
    };
  };

  // Logical depth of all nodes: foundations 0, a theorem 1 + max. depth of the premises, for the most favorable
  // proof.
  // Computed as the least fixed point; proofs that go through a cycle therefore never yield a smaller value.
  GL.depths = function (nodes, proofs) {
    const t = {};
    nodes.forEach((k) => (t[k.id] = k.type === "grundlage" ? 0 : Infinity));
    for (let round = 0; round < nodes.length + 1; round++) {
      let changed = false;
      proofs.forEach((b) => {
        const v = 1 + Math.max(...b.premises.map((p) => t[p]));
        if (v < t[b.from]) { t[b.from] = v; changed = true; }
      });
      if (!changed) break;
    }
    return t;
  };

  // Order within columns without waypoints: each node is sorted in, alternately from left to right and from
  // right to left, by the mean relative position of its neighbors (in other columns).
  // columns: array of arrays of ids (is reordered); neighbors(id): array of ids.
  GL.arrange = function (columns, neighbors, rounds) {
    const pos = {};
    const setTo = (s) => s.forEach((id, i) => (pos[id] = s.length > 1 ? i / (s.length - 1) : 0.5));
    columns.forEach(setTo);
    for (let r = 0; r < (rounds || 24); r++) {
      const series = r % 2 ? columns.slice().reverse() : columns;
      series.forEach((s) => {
        const w = {};
        s.forEach((id) => { const n = neighbors(id).filter((x) => x in pos); w[id] = n.length ? n.reduce((a, x) => a + pos[x], 0) / n.length : pos[id]; });
        s.sort((a, b) => w[a] - w[b]);
        setTo(s);
      });
    }
    return columns;
  };

  // Force simulation without an external library (Fruchterman–Reingold with collision distance and gravity toward the
  // center).
  // points: [{x, y, r}] (are modified); edges: [[i, j, weight]].
  // o: len (spring length), rounds, distance (minimum gap between circles), gravity; optional group (array: group per
  // point) and groupForce (pull toward the centroid of the point's own group, so that areas stay together).
  GL.kraefte = function (points, edges, o) {
    const n = points.length, L = o.len || 80, R = o.rounds || 400, gap = o.distance || 6, g = o.gravity || 0.04;
    let temp = o.temperature || L * 3;
    const dx = new Float64Array(n), dy = new Float64Array(n);
    for (let it = 0; it < R; it++) {
      dx.fill(0); dy.fill(0);
      for (let i = 0; i < n; i++) {
        const a = points[i];
        for (let j = i + 1; j < n; j++) {
          const b = points[j];
          let vx = a.x - b.x, vy = a.y - b.y, d = Math.sqrt(vx * vx + vy * vy);
          if (d < 0.01) { vx = Math.cos(i + j); vy = Math.sin(i + j); d = 1; }
          const min = a.r + b.r + gap;
          let f = (L * L) / d;
          if (d < min) f += (min - d) * 4;
          vx /= d; vy /= d;
          dx[i] += vx * f; dy[i] += vy * f; dx[j] -= vx * f; dy[j] -= vy * f;
        }
      }
      edges.forEach(([i, j, w]) => {
        const a = points[i], b = points[j];
        const vx = a.x - b.x, vy = a.y - b.y, d = Math.sqrt(vx * vx + vy * vy) || 1;
        const f = ((d * d) / L) * (w == null ? 1 : w);
        dx[i] -= (vx / d) * f; dy[i] -= (vy / d) * f; dx[j] += (vx / d) * f; dy[j] += (vy / d) * f;
      });
      if (o.group) {
        const sx = {}, sy = {}, sn = {};
        points.forEach((p, i) => { const q = o.group[i]; sx[q] = (sx[q] || 0) + p.x; sy[q] = (sy[q] || 0) + p.y; sn[q] = (sn[q] || 0) + 1; });
        points.forEach((p, i) => { const q = o.group[i], k = (o.groupForce || 0.05) * L / 10; dx[i] += (sx[q] / sn[q] - p.x) * k; dy[i] += (sy[q] / sn[q] - p.y) * k; });
      }
      for (let i = 0; i < n; i++) {
        const p = points[i];
        dx[i] -= p.x * g * L / 10; dy[i] -= p.y * g * L / 10;
        const len = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]);
        if (len > 0) { const s = Math.min(len, temp) / len; p.x += dx[i] * s; p.y += dy[i] * s; }
      }
      temp = Math.max(1, temp * 0.985);
    }
    return points;
  };
})(window.GL);

// ------------------------------------------------------------ Main fields of the MSC 2020 (field `field` of the nodes)
// Appended afterwards; the functions above remain unchanged. Color for the border or ring of theorems that belong to
// more
// than one main field. The colors are strong so that they stand out from the light fill colors of the areas.
(function (GL) {
  "use strict";
  GL.MSC = {
    5: { name: "Kombinatorik", color: "#e08a1e" },
    11: { name: "Zahlentheorie", color: "#c0392b" },
    12: { name: "Körpertheorie und Polynome", color: "#a1785a" },
    13: { name: "Kommutative Algebra", color: "#c9a227" },
    14: { name: "Algebraische Geometrie", color: "#3d362d" },
    18: { name: "Kategorientheorie, homologische Algebra", color: "#7a8aa8" },
    32: { name: "Mehrere komplexe Variable und analytische Räume", color: "#1f5fbf" },
    52: { name: "Konvexe und diskrete Geometrie", color: "#16a085" },
    53: { name: "Differentialgeometrie", color: "#00a0c8" },
    55: { name: "Algebraische Topologie", color: "#b03a8c" },
    57: { name: "Mannigfaltigkeiten und Zellkomplexe", color: "#8d8d1f" },
    58: { name: "Globale Analysis, Analysis auf Mannigfaltigkeiten", color: "#5e8c31" },
    81: { name: "Quantentheorie", color: "#8e44ad" },
  };
  // Two-digit number, as usual in the MSC (05 instead of 5)
  GL.mscNumber = (n) => (n < 10 ? "0" : "") + n;
  // „14 Algebraische Geometrie, 11 Zahlentheorie“
  GL.mscText = (field) => (field || []).map((n) => GL.mscNumber(n) + " " + (GL.MSC[n] ? GL.MSC[n].name : "")).join(", ");

  // Three-digit classes (field `msc`), in German after the titles of the MSC 2020; only the classes that occur in the
  // data
  GL.MSC3 = {
    "05E": "Algebraische Kombinatorik",
    "11G": "Arithmetische algebraische Geometrie (diophantische Geometrie)",
    "11J": "Diophantische Approximation, transzendente Zahlen",
    "11R": "Algebraische Zahlentheorie: globale Körper",
    "12E": "Allgemeine Körpertheorie",
    "13A": "Allgemeine Theorie kommutativer Ringe",
    "13B": "Erweiterungen kommutativer Ringe",
    "13C": "Theorie der Moduln und Ideale",
    "13D": "Homologische Methoden",
    "13E": "Kettenbedingungen, Endlichkeitsbedingungen",
    "13F": "Arithmetische Ringe und andere spezielle Ringe",
    "13H": "Lokale und semilokale Ringe",
    "13J": "Topologische Ringe und Moduln",
    "13N": "Differentialalgebra",
    "14A": "Grundlagen",
    "14B": "Lokale Theorie",
    "14C": "Zyklen und Unterschemata",
    "14D": "Familien, Faserungen",
    "14E": "Birationale Geometrie",
    "14F": "(Ko-)Homologietheorie",
    "14G": "Arithmetische Probleme, diophantische Geometrie",
    "14H": "Kurven",
    "14J": "Flächen und höherdimensionale Varietäten",
    "14K": "Abelsche Varietäten und Schemata",
    "14L": "Algebraische Gruppen",
    "14M": "Spezielle Varietäten",
    "14N": "Projektive und abzählende Geometrie",
    "18A": "Allgemeine Theorie der Kategorien und Funktoren",
    "18G": "Homologische Algebra in der Kategorientheorie, abgeleitete Kategorien",
    "18F": "Kategorien in Geometrie und Topologie (Grothendieck-Topologien, Garben, Abstieg)",
    "32C": "Analytische Räume",
    "32G": "Deformationen analytischer Strukturen",
    "32J": "Kompakte analytische Räume",
    "32L": "Holomorphe Faserräume",
    "32Q": "Komplexe Mannigfaltigkeiten",
    "52A": "Allgemeine Konvexität",
    "52B": "Polytope und Polyeder",
    "52C": "Diskrete Geometrie",
    "53C": "Globale Differentialgeometrie",
    "53D": "Symplektische Geometrie, Kontaktgeometrie",
    "55N": "Homologie- und Kohomologietheorien",
    "57R": "Differentialtopologie",
    "58A": "Allgemeine Theorie differenzierbarer Mannigfaltigkeiten",
    "81T": "Quantenfeldtheorie und verwandte klassische Feldtheorien",
  };
  // Names in the selected language
  Object.values(GL.MSC).forEach((m) => (m.name = GL.T(m.name)));
  Object.keys(GL.MSC3).forEach((c) => (GL.MSC3[c] = GL.T(GL.MSC3[c])));

  // Rows for the info box: main fields and three-digit classes of a node
  GL.fieldHtml = (k) => {
    if (!k.field) return "";
    let s = `<div class="klein">${k.field.length > 1 ? GL.T("Hauptgebiete") : GL.T("Hauptgebiet")} (MSC): ${GL.mscText(k.field)}</div>`;
    if (k.msc) s += `<div class="klein">${k.msc.length > 1 ? GL.T("Klassen") : GL.T("Klasse")}: ${k.msc.map((c) => `<span title="${GL.MSC3[c] || ""}">${c} ${GL.MSC3[c] || ""}</span>`).join("; ")}</div>`;
    return s;
  };
})(window.GL);

// ------------------------------------------------------------ Conjectures (switch „mit Vermutungen“)
// Appended afterwards; the functions above remain unchanged. The data model and the display of the edge kinds are taken
// from
// ../Beispiel Arithmetische Geometrie (daten.js, ar.js): nodes of type "vermutung" with `state`, proofs of
// kind "bedingt", list `relations` with the kinds teilresultat, aequivalent, analogie, formulierung.
(function (GL) {
  "use strict";
  GL.EDGE = {
    beweis: { name: "Beweis", color: "#4a4237", stroke: "", width: 1.6,
      text: "Gewöhnlicher Beweis: Linien von den Voraussetzungen in einen Beweispunkt, von dort ein Pfeil zum Satz." },
    bedingt: { name: "Bedingter Beweis", color: "#b0306a", stroke: "7 4", width: 1.9,
      text: "Beweis, unter dessen Voraussetzungen mindestens eine Vermutung ist. Die Folgerung gilt nur, wenn die Vermutung stimmt." },
    teilresultat: { name: "Teilresultat", color: "#2e7d32", stroke: "2 4", width: 2.4,
      text: "Ein bewiesener Spezialfall oder eine abgeschwächte Form der Vermutung. Der Satz ist keine Voraussetzung der Vermutung." },
    aequivalent: { name: "Bewiesene Äquivalenz", color: "#6b3fa0", stroke: "", width: 2.2,
      text: "Es ist bewiesen, dass beide Aussagen gleichwertig sind. Wer eine beweist, hat die andere bewiesen." },
    analogie: { name: "Analogie", color: "#9a9080", stroke: "9 3 2 3", width: 1.4,
      text: "Übertragung zwischen zwei Gebieten oder Charakteristiken. Keine logische Abhängigkeit." },
    formulierung: { name: "Voraussetzung der Formulierung", color: "#8a8273", stroke: "1 4", width: 1.6,
      text: "Der Satz muss bekannt sein, damit die Vermutung überhaupt eine sinnvolle Aussage ist." },
  };
  GL.STATE_SHORT = { offen: "offen", teilweise: "teilweise", bedingt: "bedingt bewiesen", umstritten: "umstritten",
    widerlegt: "widerlegt", programm: "Programm" };
  GL.STATE_COLOR = { offen: "#6d655a", teilweise: "#2e7d32", bedingt: "#b0306a", umstritten: "#b45309",
    widerlegt: "#9b1c1c", programm: "#6d655a" };
  // Kinds of historical events, including the kinds for conjectures
  GL.EVENT = { vermutet: "vermutet", bewiesen: "bewiesen", teilweise: "teilweise bewiesen", bedingt: "bedingt bewiesen", verallgemeinert: "verallgemeinert",
    uebertragen: "übertragen", beansprucht: "Beweis beansprucht", einwand: "Einwand", widerlegt: "widerlegt" };
  // Labels in the selected language; the keys stay
  const { T, F } = GL;
  Object.values(GL.EDGE).forEach((k) => { k.name = T(k.name); k.text = T(k.text); });
  [GL.STATE_SHORT, GL.EVENT].forEach((tab) => Object.keys(tab).forEach((s) => (tab[s] = T(tab[s]))));

  GL.isConjecture = (k) => !!k && k.type === "vermutung";

  // Small SVG sample of an edge kind for legends
  GL.pattern = function (kind) {
    const k = GL.EDGE[kind], b = 34, h = 12;
    const arrow = kind === "analogie" ? "" : `<path d="M${b - 7},${h / 2 - 3.5}L${b},${h / 2}L${b - 7},${h / 2 + 3.5}" fill="none" stroke="${k.color}" stroke-width="1.4"/>`;
    const second = kind === "aequivalent" ? `<path d="M7,${h / 2 - 3.5}L0,${h / 2}L7,${h / 2 + 3.5}" fill="none" stroke="${k.color}" stroke-width="1.4"/>` : "";
    return `<svg width="${b}" height="${h}" viewBox="0 0 ${b} ${h}" style="vertical-align:-1px"><line x1="1" y1="${h / 2}" x2="${b - 1}" y2="${h / 2}" stroke="${k.color}" stroke-width="${k.width}" stroke-dasharray="${k.stroke}" stroke-linecap="round"/>${arrow}${second}</svg>`;
  };

  // Data without conjectures: conjectures, conditional proofs, relations and the events of the conjectures are
  // dropped.
  // The result contains the same node and proof objects as D (no copies).
  GL.withoutConjectures = function (D) {
    const v = new Set(D.nodes.filter(GL.isConjecture).map((k) => k.id));
    return Object.assign({}, D, {
      nodes: D.nodes.filter((k) => !v.has(k.id)),
      proofs: D.proofs.filter((b) => b.kind !== "bedingt" && !v.has(b.from) && !b.premises.some((p) => v.has(p))),
      relations: [],
      history: (D.history || []).filter((h) => !v.has(h.from)),
    });
  };

  // Like GL.merge, additionally with statuses and relations
  GL.mergeC = function (A, E) {
    return Object.assign(GL.merge(A, E), {
      statuses: Object.assign({}, A.statuses, E.statuses),
      stateText: Object.assign({}, A.stateText, E.stateText),
      relations: (A.relations || []).concat(E.relations || []).map((z) => Object.assign({}, z)),
    });
  };

  // Level of the conjectures: 0 if a conjecture does not follow conditionally from any other; otherwise 1 + the
  // highest level of the
  // conjectures among the hypotheses. Proven equivalent reformulations stand one level to the right of the
  // conjecture to which they are equivalent. K: id -> node with list `proofs`.
  GL.conjectureLevels = function (K, relations) {
    const level = {}, isConj = (id) => GL.isConjecture(K[id]);
    const st = (id, stack = new Set()) => {
      if (id in level) return level[id];
      stack.add(id);
      let s = 0;
      K[id].proofs.forEach((b) => b.premises.forEach((p) => { if (isConj(p) && !stack.has(p)) s = Math.max(s, 1 + st(p, stack)); }));
      stack.delete(id);
      return (level[id] = s);
    };
    Object.keys(K).filter(isConj).forEach((id) => st(id));
    (relations || []).filter((z) => z.kind === "aequivalent" && isConj(z.from) && isConj(z.to))
      .forEach((z) => (level[z.from] = Math.max(level[z.from], level[z.to] + 1)));
    return level;
  };

  // Sections of the info box: relations of a node. k.rel: all relations in which k takes part.
  GL.relationsHtml = function (k, chip) {
    const id = k.id, parts = [];
    const list = (title, arr, who) => { if (arr.length) parts.push(`<h3>${title}</h3>` + arr.map((z) =>
      `<div class="beweis">${chip(who(z))}${z.evidence ? ` <span class="klein">(${z.evidence})</span>` : ""}<br><span class="klein">${z.text}</span></div>`).join("")); };
    const rel = k.rel || [];
    list(T("Teilresultate"), rel.filter((z) => z.kind === "teilresultat" && z.to === id), (z) => z.from);
    list(T("Teilresultat zu"), rel.filter((z) => z.kind === "teilresultat" && z.from === id), (z) => z.to);
    list(T("Bewiesen gleichwertig mit"), rel.filter((z) => z.kind === "aequivalent"), (z) => (z.from === id ? z.to : z.from));
    list(T("Analogie"), rel.filter((z) => z.kind === "analogie"), (z) => (z.from === id ? z.to : z.from));
    list(T("Setzt für die Formulierung voraus"), rel.filter((z) => z.kind === "formulierung" && z.to === id), (z) => z.from);
    list(T("Wird für die Formulierung gebraucht von"), rel.filter((z) => z.kind === "formulierung" && z.from === id), (z) => z.to);
    return parts.join("");
  };

  // Proof in the info box, with a note for conditional proofs
  GL.proofHtml = function (b, title, K, chip) {
    const isCond = b.kind === "bedingt", conj = b.premises.filter((p) => GL.isConjecture(K[p]));
    return `<div class="beweis${isCond ? " bedingt" : ""}"><b>${title}${b.name}</b>` +
      (isCond ? `<br><span class="marke">${F("bedingt: setzt {0} voraus", conj.map((p) => K[p].name).join(T(" und ")))}</span>` : "") +
      `<br>${T("Voraussetzungen:")} ${b.premises.map(chip).join("")}<br><span class="klein">${b.idea}</span></div>`;
  };

  // Conjectures by status, for the overview
  GL.conjecturesByStatus = function (D, chip) {
    const conj = D.nodes.filter(GL.isConjecture);
    return Object.keys(D.statuses || {}).map((s) => {
      const l = conj.filter((k) => k.state === s);
      return l.length ? `<p class="klein"><b style="color:${GL.STATE_COLOR[s]}">${D.statuses[s]}</b> (${l.length})</p>${l.map((k) => chip(k.id)).join("")}` : "";
    }).join("");
  };
})(window.GL);

// ------------------------------------------------------------ AI proofs (switch „KI-Beweise“)
// Appended afterwards; the functions above remain unchanged. Used by index.html and gross.html in this folder
// and by ../Beispiel Arithmetische Geometrie/index.html. Data model (header comments of daten.js in both folders):
//   - Proofs with the field `ki` come entirely or substantially from a language model. Fields: company, model, share
//     ("vollständig", "wesentlich", "Mithilfe"), date, people [{name, role}], verification (key of GL.AI_CHECK),
//     lean ("vollständig", "teilweise", "keine"), source (address), state (date of the entry), optional note.
//   - Proof kind "beansprucht": proof without confirmation by experts. Like "bedingt", it does not count toward the
//   logical depth.
//   - Nodes, relations and events with `ki: true` are in the graph only because of an AI result. They appear
//     only with the switch; without it the graph is exactly the previous one.
//   - Conjectures with status "beansprucht" stand in their own columns directly to the right of the dividing line,
//   before the other
//     conjectures, because partial results lead from them to the other conjectures.
(function (GL) {
  "use strict";
  GL.AI_COLOR = "#9333ea";
  GL.AI_NOTE = "";
  // Verification status of an AI proof: dash pattern of the edges and explanation
  GL.AI_CHECK = {
    "unbestätigt": { stroke: "6 4", text: "Kein Fachmann hat den Beweis öffentlich bestätigt." },
    "in Prüfung": { stroke: "11 4", text: "Fachleute geben öffentlich an, dass sie den Beweis prüfen; ein Ergebnis liegt noch nicht vor." },
    "vom Autor geprüft": { stroke: "2 3", text: "Ein Mathematiker hat den Beweis als Autor geprüft und übernimmt die Verantwortung dafür. Eine Begutachtung durch eine Zeitschrift gibt es noch nicht." },
    "von Fachleuten bestätigt": { stroke: "", text: "Namentlich genannte Fachleute haben den Beweis gelesen und für richtig befunden." },
    "zurückgezogen": { stroke: "1 5", color: "#9a9080", text: "Der Urheber hat den Beweis zurückgenommen." },
  };
  GL.AI_LEAN = {
    "vollständig": "Hauptaussage in Lean formalisiert (nach Angabe der Urheber). Lean prüft, dass der formale Beweis die formale Aussage beweist, nicht, dass diese die gemeinte Aussage trifft.",
    "teilweise": "Nur ein Hilfssatz oder ein Teilfall ist in Lean formalisiert.",
    "keine": "Keine Lean-Formalisierung.",
  };
  // Texts in the selected language; the keys are codes from the data and stay German
  const { T, F } = GL;
  Object.values(GL.AI_CHECK).forEach((p) => (p.text = T(p.text)));
  Object.keys(GL.AI_LEAN).forEach((s) => (GL.AI_LEAN[s] = T(GL.AI_LEAN[s])));
  GL.STATE_SHORT.beansprucht = T("beansprucht");
  GL.STATE_COLOR.beansprucht = GL.AI_COLOR;
  GL.EVENT.zurueckgezogen = T("zurückgezogen");
  // Visible label of a code from the fields ki.verification, ki.lean and ki.share
  GL.aiValue = (s) => T(s);

  GL.isAI = (x) => !!(x && x.ki);

  // Data without AI content (an = false) or unchanged (an = true). Removes nodes with `ki: true` and everything
  // attached
  // to them, claimed proofs with the field `ki` (AI proofs of kind „beweis“ count as accepted and remain), and
  // relations and events with `ki: true`.
  GL.aiFilter = function (D, an) {
    if (an) return D;
    const way = new Set(D.nodes.filter(GL.isAI).map((k) => k.id));
    const hv = {};
    Object.keys(D.highlights || {}).forEach((id) => { if (!way.has(id)) hv[id] = D.highlights[id]; });
    return Object.assign({}, D, {
      nodes: D.nodes.filter((k) => !way.has(k.id)),
      proofs: D.proofs.filter((b) => !(b.ki && b.kind === "beansprucht") && !way.has(b.from) && !b.premises.some((p) => way.has(p))),
      relations: (D.relations || []).filter((z) => !z.ki && !way.has(z.from) && !way.has(z.to)),
      history: (D.history || []).filter((h) => !h.ki && !way.has(h.from)),
      highlights: hv,
    });
  };

  // Columns with AI proofs. level: levels of the conjectures (GL.conjectureLevels or equivalent); maxT: greatest
  // logical depth. Claimed nodes stand in the columns maxT + 1 + level, the other conjectures behind them.
  // Without claimed nodes the column is, as before, maxT + 1 + level.
  GL.aiColumns = function (K, level, maxT) {
    const claimed = Object.keys(K).filter((id) => GL.isConjecture(K[id]) && K[id].state === "beansprucht");
    const count = claimed.length ? 1 + Math.max(...claimed.map((id) => level[id])) : 0;
    const column = (id) => maxT + 1 + (K[id].state === "beansprucht" ? level[id] : count + level[id]);
    const head = (c) => (c === 0 ? T("Grundlagen") : c <= maxT ? F("Tiefe {0}", c)
      : c <= maxT + count ? (count > 1 ? F("Beweis beansprucht (KI), Stufe {0}", c - maxT - 1) : T("Beweis beansprucht (KI)"))
      : c === maxT + count + 1 ? T("Vermutungen") : F("Vermutungen, Stufe {0}", c - maxT - count - 1));
    return { count, column, head };
  };

  // Display of a proof edge: null for proofs without `ki`
  GL.aiStyle = function (b) {
    if (!b || !b.ki) return null;
    const p = GL.AI_CHECK[b.ki.verification] || GL.AI_CHECK["unbestätigt"];
    return { color: p.color || GL.AI_COLOR, stroke: p.stroke };
  };
  // Badge „KI“ next to a proof point (SVG); s scales the size
  GL.aiBadge = function (parent, x, y, s = 1) {
    const g = GL.el("g", { class: "kimarke" }, parent);
    GL.el("rect", { x: x - 8 * s, y: y - 17 * s, width: 16 * s, height: 10 * s, rx: 2 * s, fill: "#fff", stroke: GL.AI_COLOR, "stroke-width": 0.8 * s }, g);
    const t = GL.el("text", { x, y: y - 9.3 * s, "text-anchor": "middle", "font-size": 8 * s, "font-weight": 600, fill: GL.AI_COLOR }, g);
    t.textContent = T("KI");
    return g;
  };
  GL.aiMarker = (id) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0L10,5L0,10Z" fill="${GL.AI_COLOR}"/></marker>`;

  // Sample of an AI edge for the legend
  GL.aiPattern = function (verification) {
    const p = GL.AI_CHECK[verification], f = p.color || GL.AI_COLOR, b = 46, h = 14;
    return `<svg width="${b}" height="${h}" viewBox="0 0 ${b} ${h}" style="vertical-align:-2px"><line x1="1" y1="${h / 2 + 2}" x2="${b - 1}" y2="${h / 2 + 2}" stroke="${f}" stroke-width="2" stroke-dasharray="${p.stroke}"/>` +
      `<path d="M${b - 7},${h / 2 - 1.5}L${b},${h / 2 + 2}L${b - 7},${h / 2 + 5.5}" fill="none" stroke="${f}" stroke-width="1.4"/>` +
      `<rect x="12" y="0.5" width="15" height="9" rx="2" fill="#fff" stroke="${f}" stroke-width=".8"/><text x="19.5" y="7.7" text-anchor="middle" font-size="7.5" font-weight="600" fill="${f}">${T("KI")}</text></svg>`;
  };
  // Legend: verification statuses that occur in the data
  GL.aiLegend = function (proofs) {
    const st = [...new Set(proofs.filter(GL.isAI).map((b) => b.ki.verification))];
    return st.map((s) => `<span title="${GL.AI_CHECK[s].text}">${GL.aiPattern(s)} ${F("KI-Beweis, {0}", T(s))}</span>`).join("");
  };

  const MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  GL.aiDate = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    if (!m) return s || "";
    return window.I18N && window.I18N.en ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : `${+m[3]}. ${MONTHS_DE[+m[2] - 1]} ${m[1]}`;
  };

  // Section of the info box for a proof with the field `ki`
  GL.aiHtml = function (b) {
    if (!b.ki) return "";
    const k = b.ki, p = GL.AI_CHECK[k.verification] || {}, claimed = b.kind === "beansprucht";
    const row = (t, v) => (v ? `<tr><th>${t}</th><td>${v}</td></tr>` : "");
    const people = (k.people || []).map((m) => `${m.name} (${m.role})`).join("; ") || T("keine genannt");
    return `<div class="beweis ki"><b>${claimed ? T("Beanspruchter Beweis (KI)") : T("Beweis mit KI-Hilfe")}</b><br>
      <span class="kiwarn">${claimed ? T("Nicht von Fachleuten geprüft. Der Graph behandelt die Aussage nicht als bewiesen; der Beweis zählt nicht zur logischen Tiefe.")
        : T("Von einem Menschen als Autor geprüft, aber nicht von einer Zeitschrift begutachtet. Der Beweis zählt als gewöhnlicher Beweis.")}</span>
      <table class="auswertung kitabelle">
      ${row(T("Firma"), k.company)}${row(T("Modell"), k.model)}${row(T("Anteil der KI"), T(k.share))}${row(T("Datum"), GL.aiDate(k.date))}
      ${row(T("Beteiligte Menschen"), people)}${row(T("Prüfstand"), `<span style="color:${p.color || GL.AI_COLOR}">${T(k.verification)}</span>. ${p.text || ""}`)}
      ${row("Lean", `${T(k.lean)}. ${GL.AI_LEAN[k.lean] || ""}`)}${row(T("Hinweis"), k.note)}
      ${row(T("Quelle"), `<a href="${k.source}">${k.source.replace(/^https:\/\//, "").replace(/(.{60}).+(.{20})$/, "$1…$2")}</a>`)}
      ${row(T("Stand des Eintrags"), GL.aiDate(k.state))}</table>
      ${GL.AI_NOTE ? `<span class="klein">${T("Einordnung und Quellen:")} <a href="${GL.AI_NOTE}">${T("Notiz „Von KI bewiesene Sätze in algebraischer und arithmetischer Geometrie“")}</a></span>` : ""}</div>`;
  };

  // Section of the overview: all proofs with `ki`
  GL.aiOverview = function (D, chip) {
    const l = D.proofs.filter(GL.isAI);
    if (!l.length) return "";
    return `<h3>${F("KI-Beweise ({0})", l.length)}</h3>
      <p class="klein">${F("Beweise, die nach Angabe der Beteiligten ganz oder wesentlich von einem Sprachmodell stammen. Beanspruchte Beweise (violett mit Marke „KI“) sind nicht von Fachleuten geprüft; ihre Ziele stehen als Vermutungen mit dem Stand „beansprucht“ rechts der Trennlinie oder sind vorhandene Vermutungen, deren Stand unverändert bleibt. Stand der Einträge: {0}. Ausführlich in der <a href=\"{1}\">Notiz</a>.",
        GL.aiDate(l[0].ki.state), GL.AI_NOTE).replace(GL.AI_NOTE ? /$^/ : /\s*[^.]*<a href="">[^<]*<\/a>\./, "")}</p>` +   // without the note (AI_NOTE empty): no sentence with the link
      l.map((b) => `<p class="klein">${GL.aiPattern(b.ki.verification)} ${chip(b.from)} ${b.ki.model}, ${GL.aiDate(b.ki.date)}; ${T(b.ki.verification)}; Lean: ${T(b.ki.lean)}</p>`).join("");
  };
})(window.GL);

// ------------------------------------------------------------ Counterexamples and the relations „widerlegt“, „deutung“
// Appended afterwards; the functions above remain unchanged. Nodes of type "gegenbeispiel" are proven and have
// a logical depth like theorems. They are drawn as a box with a diamond pattern (index.html of both folders) or as a
// diamond
// (gross.html). The relation "widerlegt" leads from the counterexample to the disproved conjecture, "deutung" from
// a theorem to a statement whose meaning it shows.
(function (GL) {
  "use strict";
  const { T } = GL;
  GL.GB_COLOR = "#9b1c1c";
  GL.EDGE.widerlegt = { name: T("Widerlegt"), color: GL.GB_COLOR, stroke: "8 3 2 3", width: 2.2,
    text: T("Ein Gegenbeispiel widerlegt die Vermutung, auf die der Pfeil zeigt.") };
  GL.EDGE.deutung = { name: T("Deutung"), color: "#0f766e", stroke: "4 3", width: 1.8,
    text: T("Der Satz zeigt, was die Aussage bedeutet, ohne sie zu beweisen oder zu widerlegen.") };
  GL.isCounterexample = (k) => !!k && k.type === "gegenbeispiel";

  // Create the diamond pattern in defs (once per SVG)
  GL.gbPattern = function (defs) {
    if (defs.querySelector("#gb-raute")) return;
    const p = GL.el("pattern", { id: "gb-raute", width: 10, height: 10, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    GL.el("path", { d: "M0,0H10M0,0V10", stroke: GL.GB_COLOR, "stroke-width": 0.9, "stroke-opacity": 0.35, fill: "none" }, p);
  };
  // Diamond pattern and strong border over an already drawn box
  GL.gbBox = function (g, x, y, b, h) {
    GL.el("rect", { x, y, width: b, height: h, rx: 4, fill: "url(#gb-raute)", stroke: GL.GB_COLOR, "stroke-width": 2, class: "gbrand" }, g);
  };
  // Diamond as node shape in the large graph (center x, y; half diagonal r)
  GL.gbDiamond = function (g, x, y, r, fill) {
    return GL.el("path", { d: `M${x},${y - r}L${x + r},${y}L${x},${y + r}L${x - r},${y}Z`, fill, class: "raute" }, g);
  };
  // Legend sample of a counterexample
  GL.gbLegend = () => `<span title="${T("Ein konkretes Objekt, das eine Aussage widerlegt; bewiesen, mit logischer Tiefe wie ein Satz")}"><svg width="22" height="14" viewBox="0 0 22 14" style="vertical-align:-2px"><defs><pattern id="gb-raute-leg" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0,0H6M0,0V6" stroke="${GL.GB_COLOR}" stroke-width=".8" stroke-opacity=".5"/></pattern></defs><rect x="1" y="1" width="20" height="12" rx="2" fill="url(#gb-raute-leg)" stroke="${GL.GB_COLOR}" stroke-width="1.6"/></svg> ${T("Gegenbeispiel")}</span>`;

  // Sections of the info box for „widerlegt“ and „deutung“. k.rel: all relations in which k takes part.
  GL.disprovedHtml = function (k, chip) {
    const id = k.id, rel = k.rel || [], parts = [];
    const list = (title, arr, who) => { if (arr.length) parts.push(`<h3>${title}</h3>` + arr.map((z) =>
      `<div class="beweis">${chip(who(z))}<br><span class="klein">${z.text}</span></div>`).join("")); };
    list(T("Widerlegt"), rel.filter((z) => z.kind === "widerlegt" && z.from === id), (z) => z.to);
    list(T("Widerlegt durch"), rel.filter((z) => z.kind === "widerlegt" && z.to === id), (z) => z.from);
    list(T("Zeigt die Bedeutung von"), rel.filter((z) => z.kind === "deutung" && z.from === id), (z) => z.to);
    list(T("Bedeutung gezeigt durch"), rel.filter((z) => z.kind === "deutung" && z.to === id), (z) => z.from);
    return parts.join("");
  };
})(window.GL);

// ------------------------------------------------------------ Methods and classification theorems
// Appended afterwards; the code above remains unchanged. Data model in the header comment of daten.js (fields
// `methods` on proofs, list `methods`, field `classification` on nodes).
(function (GL) {
  "use strict";
  const withoutTags = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  // Row „Methode: …“ for a proof. list: list `methods` of the folder (default: window.AG.methods).
  GL.methodsHtml = function (b, list) {
    if (!b.methods || !b.methods.length) return "";
    const M = {};
    (list || (window.AG && window.AG.methods) || []).forEach((m) => (M[m.id] = m));
    const names = b.methods.map((id) => (M[id] ? `<span class="methode" title="${withoutTags(M[id].text)}">${M[id].name}</span>` : id));
    return `<br><span class="klein">${b.methods.length > 1 ? GL.T("Methoden") : GL.T("Methode")}: ${names.join(", ")}</span>`;
  };
  // Row „Klassifikation: …“ in the info box of a node
  GL.classificationHtml = function (k) {
    const c = k.classification;
    return c ? `<p class="klein"><b>${GL.T("Klassifikation:")}</b> ${c.objects}, ${c.classes}.</p>` : "";
  };
  // The method row appears in the box of the proof (index.html, gross.html); for this GL.proofHtml is wrapped.
  const proofHtml = GL.proofHtml;
  GL.proofHtml = function (b, title, K, chip) {
    const h = proofHtml(b, title, K, chip), m = GL.methodsHtml(b);
    return m ? h.replace(/<\/div>$/, m + "</div>") : h;
  };
})(window.GL);

// ------------------------------------------------------------ Short statement and hover box (todos B26, B44)
// Appended afterwards. The detail panels show the short statement (`short`) above the formula, in the same format as
// the info box of maps/Alte Entwürfe/entwurf-8-zoom.html; the hover box over a node has the same three lines as the hover box
// of the map: name; originator "Persons (year)" small and italic; short statement, then the formula.
(function (GL) {
  "use strict";
  const { T, tex } = GL;
  // Originator: field `credit` = { person, year, circa } of the node, otherwise from the history: theorem the first
  // event „bewiesen“, conjecture the first „vermutet“, refuted conjecture the refutation, counterexample „gefunden“,
  // else the first „bewiesen“. Empty without event.
  GL.creditLine = function (k, history) {
    let x = k.credit || null;
    if (!x) {
      const h = (history || []).filter((e) => e.from === k.id).slice().sort((a, b) => (a.year || 0) - (b.year || 0));
      const first = (kind) => { const l = h.filter((e) => e.kind === kind); return l.find((e) => e.year) || l[0] || null; };
      x = k.type === "vermutung" ? (k.state === "widerlegt" ? first("widerlegt") : first("vermutet"))
        : k.type === "gegenbeispiel" ? first("gefunden") || first("bewiesen") : first("bewiesen");
    }
    if (!x) return "";
    const who = (x.person || []).join(", "), year = x.year ? (x.circa ? T("um ") : "") + x.year : "";
    return who && year ? `${who} (${year})` : who || year;
  };
  // Statement block of a detail panel: short statement, then the formula
  GL.statementHtml = function (k) {
    return (k.short ? `<div class="kurz">${k.short}</div>` : "") + (k.formula ? `<div class="formel">${tex(k.formula)}</div>` : "");
  };
  // As in the map: a conjecture is marked after its name unless the name says so; the prefix „Vermutung:“ of the short
  // statement is not shown
  GL.hoverHtml = function (k, history) {
    const c = GL.creditLine(k, history), conj = k.type === "vermutung";
    const mark = conj && !/vermutung|conjecture/i.test(String(k.name).replace(/<[^>]+>/g, "")) ? ` <span style="font-weight:normal">${T("(Vermutung)")}</span>` : "";
    const short = conj ? String(k.short || "").replace(/^\s*(Vermutung|Conjecture)\s*:\s*/i, "") : k.short;
    return `<div class="titel">${k.name}${mark}</div>` + (c ? `<div class="zusatz">${c}</div>` : "") + (short ? `<div class="kurz">${short}</div>` : "") +
      (k.formula && window.katex ? tex(k.formula) : "");
  };
  // Hover box for the node group g of the theorem k (one box per page, fixed position next to the pointer)
  let box = null, current = null;
  GL.hover = function (g, k, history) {
    // The box replaces the browser tooltip of the node
    [...g.children].filter((c) => c.tagName === "title").forEach((c) => c.remove());
    const place = (ev) => {
      const w = box.offsetWidth, h = box.offsetHeight;
      box.style.left = (ev.clientX + 14 + w > window.innerWidth - 8 ? Math.max(8, ev.clientX - 14 - w) : ev.clientX + 14) + "px";
      box.style.top = (ev.clientY + 12 + h > window.innerHeight - 8 ? Math.max(8, ev.clientY - 12 - h) : ev.clientY + 12) + "px";
    };
    g.addEventListener("mouseenter", (ev) => {
      if (!box) { box = document.createElement("div"); box.id = "gl-zeiger"; document.body.appendChild(box); }
      if (current !== k) { box.innerHTML = GL.hoverHtml(k, history); current = k; }
      box.style.display = "block"; place(ev);
    });
    g.addEventListener("mousemove", (ev) => { if (box) place(ev); });
    g.addEventListener("mouseleave", () => { if (box) box.style.display = "none"; });
  };
})(window.GL);
