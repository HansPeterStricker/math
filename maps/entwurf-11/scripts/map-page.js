// Draft 11: copy of draft-10-bridge.js of draft 10 (22 October 2026, user's decision; draft 10 stays unchanged as a
// reference). Draft 10 was the map of draft 8 in the sea, with an irregular coast, a fjord between the two sides of the
// Langlands correspondence and bridges over it (todo B24 b); additions of draft 10 to draft 8 are marked "draft 10".
// Layout: data/layout.js (plan steps 1.3 to 1.5); the layout before plan step 1.2 is not offered any more.
(function () {
  "use strict";
  const T = window.TM, { el, text, f, INK, PAPER, RED } = T, L = window.E7_LAYOUT, K0 = L.mapData;
  const M = window.E11_MODEL.generate(window), CONDO = window.E11_MODEL.CONDO;
  // Parts of the page that are not rendered (user, 2026-10-22, plan step F): with false the part is not in the DOM; the
  // code that builds it is kept and only skipped, so that setting true brings it back. Info box (todo B44): shownOnMap
  // (section "Shown on the map" with stages and proof choice), proofShownNote (the note "(shown)" after the shown proof,
  // which is bold anyway), proofFrom (the line "from …" under each proof), usedIn, relations, classification, links
  // (sections "Used in the proof of", "Relations", "Classification and measures", "Links"). Page: whatsNew (section
  // below the map, todo B69 h; new entries are still added). Toolbar: showOnly (todo B69 d), importance and flags
  // (choices hidden since draft 8), dependencies (also needs NETWORK_SHOWN), definitions (also needs TREES_ENABLED).
  // Static HTML of these parts stands in <template data-show="key"> in the page and is inserted here when the key is on.
  const SHOW = { shownOnMap: false, proofShownNote: false, proofFrom: false, usedIn: false, relations: false, classification: false,
    links: false, whatsNew: false, showOnly: false, importance: false, flags: false, dependencies: true, definitions: false };   // dependencies: straight lines, user 2026-10-22
  document.querySelectorAll("template[data-show]").forEach((tp) => { if (SHOW[tp.dataset.show]) tp.replaceWith(tp.content.cloneNode(true)); else tp.remove(); });
  const byId = (id) => document.getElementById(id);   // null for a control that is not rendered
  // Plan 4.5, follow-up 3: trees and definitions deferred by the user, 2026-10-22. With TREES_ENABLED false the switch
  // "definitions" and the legend rows of the concepts are hidden and no tree or forest is drawn, whatever the address
  // says; the code of the trees is kept.
  const TREES_ENABLED = false;
  // Plan 4.5, follow-up 3: the dashed outline of a programme (state "programm" without a correspondence; the construction
  // plan of a correspondence is a bridge and stays) is suspended by the user, 2026-10-22, todo B66: no symbol, no name,
  // no legend row, no route to or from it; also the dashed outline of the programme around the fjord of the Langlands
  // correspondences (the bridge itself, its construction plan, stays); the code is kept.
  const PROGRAMMES_SHOWN = false;
  const hiddenNode = (k) => !!M.K[k] && (M.K[k].kind === "ungeheuer" || (M.K[k].kind === "kueste" && !PROGRAMMES_SHOWN));
  // Colours of the proofs of the selected mountain under "alle Beweise" (todo B30, entered in Konzept/04), in
  // historical order
  const PROOF_COLORS = [RED, "#2d6e2d", "#6b3f99", "#b07a00"];
  // Plan step 3.2 (todo B67): whole route network under the switch "dependencies": largest class shown at magnification
  // zz (class 1: at least 20 chains … class 4), stroke width by class (screen px), opacity of the overview
  const NET_CLASS_MAX = (zz) => (zz >= 4 ? 4 : zz >= 2 ? 3 : 2);
  const NET_WIDTH = [0, 2.6, 1.9, 1.35, 1], NET_OPACITY = 0.45;
  // Route network deferred by the user, 2026-10-22 (plan step 3.2 cancelled, topic 3 deferred): with NETWORK_SHOWN false the
  // switch "dependencies" is hidden and off, an=netz in the address is ignored, there is no legend row, and the page does
  // not load data/route-network.js; the code that draws the whole network is kept.
  const NETWORK_SHOWN = false;
  const LIGHT = "#efe3c2", REF = 10, P = 0.45, Z_MIN = 0.02, Z_MAX = 16, Z_ZERO = 8, N_TOTAL = 30, MARGIN = 34;
  const stage = document.getElementById("buehne"), svg = document.getElementById("karte"), paper = document.getElementById("papier");
  const pointer = document.getElementById("zeiger"), info = document.getElementById("info");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // Language: U translates user-interface texts, FM inserts numbers and names into a translated pattern with {0},
  // {1} …
  const SP = window.I18N, EN = !!(SP && SP.en), U = (s) => (SP ? SP.t(s) : s);
  const FM = (pattern, ...a) => U(pattern).replace(/\{(\d)\}/g, (m, i) => a[i]);
  const decimal = (x, n) => (EN ? x.toFixed(n) : x.toFixed(n).replace(".", ","));
  if (EN) svg.setAttribute("aria-label", U("Karte der Zahlentheorie und der algebraischen Geometrie im Meer, mit dem Langlands-Fjord und der Brücke im Bau"));

  // ------------------------------------------------------------ Additions to the model (only for draft 8)
  const rawAG = [].concat(window.AG.nodes, (window.AG_LARGE || { nodes: [] }).nodes), rawAR = window.AR.nodes;
  const HV = { ag: Object.assign({}, (window.AG_LARGE || {}).highlights || {}, window.AG.highlights || {}), ar: window.AR.highlights || {} };
  const VS = { ag: (window.AG_COMPR || {}).theorems || {}, ar: (window.AR_COMPR || {}).theorems || {} };
  const raw = (q) => (q.source === "ar" ? rawAR : rawAG).find((x) => x.id === q.id);
  const side = (q) => (q.source === "ar" ? "ar" : "ag");
  // Plan 4.5, follow-up 3 (user, 2026-10-22): the ruin of a refuted conjecture X stands for the theorem not-X. Every proof
  // of a counterexample G to X (relation "widerlegt" from G to X) is drawn as a proof of the ruin: its conclusion becomes
  // X, the field `counterexample` keeps G (shown with the proof in the info box). The data of the theorem graphs and the
  // model stay unchanged; G keeps no proofs on the map (it has no symbol since plan step 4.5).
  M.nodes.filter((g) => g.kind === "ungeheuer").forEach((g) => {
    const X = g.rel.filter((z) => z.kind === "widerlegt" && z.from === g.key && M.K[z.to] && M.K[z.to].kind === "trugbild").map((z) => M.K[z.to]);
    if (X.length !== 1) return;   // not the case in the data (2026-10-22); tests/test-symbols.js checks all six
    g.proofs.forEach((b) => { b.from = X[0].key; b.counterexample = g.key; X[0].proofs.push(b); });
    g.proofs = [];
  });
  M.nodes.forEach((n) => {
    n.large = n.sources.some((q) => { const k = raw(q); return k && k.large; });
    n.highlight = new Set(n.sources.map((q) => HV[side(q)][q.id]).filter(Boolean).map((h) => h.kind));
    const st = n.sources.map((q) => VS[side(q)][q.id]).filter(Boolean).map((v) => v.level);
    n.compr = st.length ? Math.min(...st) : null;
    const kl = n.sources.map((q) => { const k = raw(q); return k && k.classification; }).find(Boolean);
    n.classification = n.type === "satz" && kl ? kl : null;   // classification theorem: drawn as a mountain, selectable as a flag
    const s = new Set(), stack = [n.key];
    while (stack.length) M.K[stack.pop()].usage.forEach((b) => { if (!s.has(b.from)) { s.add(b.from); stack.push(b.from); } });
    n.consequences = s.size;
    // Fields of the raw nodes that the model does not pass on: statement in words (todo B26), explicit credit for
    // line 2 (overrides the history), entry in the table of major theorems, card in the gallery
    const first = (field) => n.sources.map((q) => { const k = raw(q); return k && k[field]; }).find(Boolean) || null;
    n.short = first("short"); n.credit = first("credit"); n.largeId = first("large"); n.gallery = first("gallery");
    n.containsSpecial = [];
  });
  // Later special case (todo B31): a proof of A with `specialCaseOf: B` derives A as a special case of the later
  // theorem B. The model does not pass the field on, so it is looked up in the raw proofs and attached to the merged
  // proof with the same conclusion and the same premises.
  [[window.AG.proofs, M.agId], [(window.AG_LARGE || { proofs: [] }).proofs, M.agId], [window.AR.proofs, M.arId]].forEach(([list, map]) => (list || []).forEach((b) => {
    if (!b.specialCaseOf) return;
    const from = map[b.from], target = map[b.specialCaseOf];
    if (!from || !target || !M.K[from] || !M.K[target]) return;
    const sig = b.premises.map((p) => map[p]).sort().join(",");
    const e = M.K[from].proofs.find((x) => x.premises.slice().sort().join(",") === sig);
    if (!e || e.specialCaseOf) return;
    e.specialCaseOf = target;
    if (!M.K[target].containsSpecial.includes(from)) M.K[target].containsSpecial.push(from);
  }));
  const hasFlag = (n, kind) => !kind ? false : kind === "einfach" ? n.compr != null && n.compr <= 2 : kind === "klassifikation" ? !!n.classification : n.highlight.has(kind);

  // ------------------------------------------------------------ Bridges (draft 10, todo B24 b, option 1)
  // Every node with the field `correspondence` is a bridge of its own, not a mountain (glossary: Brücke; user,
  // 20 October 2026): proved correspondences and their proved special cases, and constructions in one direction with
  // preserved L-function, are finished bridges; a general correspondence that is proved only in special cases is a
  // construction plan (Bauplan) over the same fjord. Stage: fertig (theorem), im Bau (conjecture with state
  // "teilweise"), Bauplan (other conjectures).
  const BRIDGE_DIRECTIONS = { both: "in beide Richtungen", "galois-to-automorphic": "von der Galois-Seite zur automorphen Seite",
    "automorphic-to-galois": "von der automorphen Seite zur Galois-Seite" };
  M.nodes.forEach((n) => {
    const c = n.sources.map((q) => { const k = raw(q); return k && k.correspondence; }).find(Boolean);
    if (!c) return;
    n.correspondence = c; n.kind = "bruecke";
    n.stage = n.type === "satz" ? "fertig" : n.state === "teilweise" ? "imbau" : "bauplan";
  });
  // Page-local data until the data model has them (draft 10, provisional): the unproved parts of the general
  // correspondence (listed in its info box) and the key concepts of the two sides of a fjord, whose distance in the
  // concept graph would set the length of the fjord (B24 report, section 5.2, step 4).
  const OPEN_PARTS = {
    "ar:langlandsrecip": [
      "Galois → automorph im allgemeinen Fall, etwa für gerade ikosaedrische zweidimensionale Artin-Darstellungen über ℚ: Ihre Automorphie (Artin-Vermutung) ist im Allgemeinen offen.",
      "Automorph → Galois für Maaß-Spitzenformen zum Eigenwert 1/4: Ihnen sollten gerade zweidimensionale Artin-Darstellungen entsprechen; das ist offen.",
      "Allgemeine reduktive Gruppen über Zahlkörpern: Die Zuordnung zwischen automorphen Darstellungen und Galois-Parametern ist im Allgemeinen offen.",
    ],
  };
  const FJORD_CONCEPTS = { "11R,11S|11F,22E": ["galoisdarst", "automorph"] };
  // The measure from the concept graph gives only about a third of the border today (4 of 11 steps); the user wants a
  // clearly deeper fjord, so the depth is at least FJORD_MIN of the border (provisional, user 2026-10-20)
  const FJORD_MIN = 0.8;
  const GEOMETRIC_NOTE = { "ar:langlandsrecip": "Die geometrische Langlands-Vermutung ist das geometrische Gegenstück dieser Korrespondenz: Statt Zahlkörpern betrachtet sie Kurven, statt Funktionen Garben. Ihr unverzweigter Fall über Körpern der Charakteristik 0 ist seit 2024 bewiesen (Gaitsgory, Raskin und andere). Sie soll später eine eigene Brücke bekommen." };

  // ------------------------------------------------------------ Placement (fixed, taken from draft
  // 7)
  const PZ = {}; L.provinces.forEach((p) => (PZ[p.key] = p));
  const missing = [], placement = {};
  function moments(z) {   // area, centroid and second moments of a polygon
    let A = 0, x = 0, y = 0, xx = 0, yy = 0, xy = 0;
    z.forEach((a, i) => { const b = z[(i + 1) % z.length], c = a[0] * b[1] - b[0] * a[1];
      A += c; x += (a[0] + b[0]) * c; y += (a[1] + b[1]) * c;
      xx += c * (a[0] * a[0] + a[0] * b[0] + b[0] * b[0]); yy += c * (a[1] * a[1] + a[1] * b[1] + b[1] * b[1]);
      xy += c * (a[0] * b[1] + 2 * a[0] * a[1] + 2 * b[0] * b[1] + b[0] * a[1]); });
    const sg = A < 0 ? -1 : 1;
    return { A: sg * A / 2, x: sg * x / 6, y: sg * y / 6, xx: sg * xx / 12, yy: sg * yy / 12, xy: sg * xy / 24 };
  }
  M.nodes.forEach((n) => {
    if (L.placement[n.key]) { placement[n.key] = { x: L.placement[n.key][0], y: L.placement[n.key][1] }; return; }
    const p = PZ[n.province];
    if (!p) { missing.push(FM("{0} (Provinz fehlt)", n.name)); return; }
    const m = moments(p.cell), r = T.random(T.hash(n.key));
    placement[n.key] = { x: m.x / m.A + (r() - 0.5) * 40, y: m.y / m.A + 30 + (r() - 0.5) * 30 };
    missing.push(FM("{0} (vorläufig in die Mitte der Provinz „{1}“ gestellt)", n.name, (M.provinces[n.province] || {}).name));
  });
  const nodes = M.nodes.filter((n) => placement[n.key]);
  // Plan step 2.2: trees (concepts, glossary: Baum) at the place of the layout (conceptPlacement, plan step 1.4; layouts
  // without it, such as the layout before plan step 1.2, have no trees). Size after the model (conceptSize). Level of detail as for the mountains: the
  // N_TREES trees with the most statements are visible in the whole map, the others from a magnification that grows as
  // their number of statements falls (a tree with none or one statement appears at about Z_ZERO). The layout keeps every
  // tree box (TREE_BOX, the box that place-elements.js assumed) clear of the mountains and of the other trees at
  // magnification 1, so there is no overlap at any magnification.
  const CPL = L.conceptPlacement || {}, N_TREES = 24, TREE_BOX = { x0: -0.6, x1: 0.6, y0: -1.12, y1: 0.28 };
  const TREES = M.concepts.filter((c) => CPL[c.key]).map((c) => ({ c, key: "tree:" + c.key, ckey: c.key, x: CPL[c.key][0], y: CPL[c.key][1], s: window.E11_MODEL.conceptSize(c) }));
  {
    const byCount = TREES.map((t) => t.c.count).sort((a, b) => b - a), w1 = byCount.length ? byCount[Math.min(N_TREES, byCount.length) - 1] : 1;
    const gamma = Math.log(8) / Math.log(Math.max(2, w1 + 1));
    TREES.forEach((t) => { t.zA = t.c.count >= w1 ? 1 : clamp(Math.pow((w1 + 1) / (t.c.count + 1), gamma), 1, 16 * 0.85); });
  }
  const TK = {}; TREES.forEach((t) => (TK[t.ckey] = t));   // by concept key; t.key ("tree:" + concept key) is the key of its boxes

  // ------------------------------------------------------------ Fjords and bridges (draft 10; algorithm of the B24
  // report, section 5.2)
  // 1. Bridges whose two sides have the same provinces (correspondence.sides[].provinces) share one fjord. 2. The cell
  // edges between a province of one side and a province of the other are chained into lines. 3. A line that touches
  // the coast is oriented from the coast inward. 4. Length of the fjord: definitional distance of the key concepts of
  // the two sides divided by the largest distance in the concept graph, at least FJORD_MIN and at most 0.9 of the
  // border (land remains at the inner end). 5. The fjord is a strip around the first part of the border, narrowing
  // toward its tip. 6. The bridges are ordered by generality (field `generality`, 1 = narrowest; user, 2026-10-20):
  // narrow correspondences stand near the inner end, where the fjord is narrow, general ones further out, the most
  // general (the construction plan of the Langlands correspondence) at the mouth. Each bridge spans the fjord at its
  // place, so a more general bridge spans wider water.
  const MAX_W = 110;
  const pt = (v) => ({ x: v[0], y: v[1] }), dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ckey = (v) => v[0].toFixed(1) + "," + v[1].toFixed(1);
  const coastCorner = new Set();
  L.provinces.forEach((p) => p.cell.forEach((v, i) => { const prev = p.cell[(i - 1 + p.cell.length) % p.cell.length]; if (v[2] === null || prev[2] === null) coastCorner.add(ckey(v)); }));
  // Definitional distance (B24 report, section 5.2, step 4): shortest connection of two concepts through a common
  // ancestor via `uses`, normalized by the largest such distance in the concept graph
  function defFraction(pair) {
    const C = window.AR_CONCEPTS; if (!C || !pair) return { frac: 0.5, d: null, dMax: null };
    const concepts = {}; C.concepts.forEach((k) => (concepts[k.id] = k));
    const memo = {};
    const ancestors = (id) => { if (memo[id]) return memo[id]; const d = { [id]: 0 }, q = [id];
      while (q.length) { const c = q.shift(); ((concepts[c] || {}).uses || []).forEach((u) => { if (concepts[u] && d[u] == null) { d[u] = d[c] + 1; q.push(u); } }); }
      return (memo[id] = d); };
    const dd = (a, b) => { const da = ancestors(a), db = ancestors(b); let best = Infinity; for (const c in da) if (db[c] != null) best = Math.min(best, da[c] + db[c]); return best; };
    const ids = Object.keys(concepts); let dMax = 0;
    ids.forEach((a, i) => { for (let j = i + 1; j < ids.length; j++) { const d = dd(a, ids[j]); if (isFinite(d) && d > dMax) dMax = d; } });
    const d = concepts[pair[0]] && concepts[pair[1]] ? dd(pair[0], pair[1]) : Infinity;
    return { frac: isFinite(d) && dMax ? clamp(d / dMax, 0.25, 0.9) : 0.5, d: isFinite(d) ? d : null, dMax };
  }
  const yearOf = (n) => { const x = creditEvent(n); return (x && x.year) || n.year || 9999; };
  const FJ = [], BR = [];   // fjords { key, sides, centre, width, FL, bl, df, bridges }; bridges { n, F, c, w, nA, bankA, bankB, ramp }
  const groups = {};
  nodes.filter((n) => n.kind === "bruecke").forEach((n) => {
    const sides = n.correspondence.sides.map((s) => s.provinces || []);
    if (sides.length !== 2) return;
    const key = sides.map((s) => s.join(",")).join("|");
    (groups[key] = groups[key] || { sides, members: [] }).members.push(n);
  });
  // Plan step 1.5: a fjord of the layout file (field water.fjords, written by raster-layout.js with its half width) is
  // taken as it is: centre line and width of the water cells of the raster. Older layouts without it (the layout before plan step 1.2, read by tests/measure-layout.js) keep
  // the fjord computed from the cells as before.
  const FILE_FJ = {}; ((L.water && L.water.fjords) || []).forEach((q) => { if (q.halfWidth && q.centre && q.centre.length > 2) FILE_FJ[q.key] = q; });
  // Plan 4.5, follow-up 2 (user, 2026-10-22): the two banks of a fjord are irregular lines with small bays and headlands
  // of several sizes (sum of sines of four wavelengths with fixed random phases). Drawing only, without a meaning of its
  // own (Konzept/04: coast); deterministic, the same at every load. Each bank lies between the edge of the water of the
  // layout (half width `width(s) / 2`) and FJ_BANK_A px beyond it, so the water never gets narrower than in the layout
  // (nor below its width at the inner end) and covers the province cells up to the bank. The banks are independent, so
  // the width of the fjord varies. The amplitude falls to zero over the last 40 px before the inner end.
  // raster-layout.js reads FJ_BANK_A and fjordBank (bridges on land).
  const FJ_BANK_A = 9;
  function fjordBank(key, side, FL) {
    const rnd = T.random(T.hash("fjord-bank-" + key + "-" + side));
    const waves = [[70, 1], [33, 0.6], [17, 0.35], [9, 0.2]].map(([l, a]) => [2 * Math.PI / (l * (0.85 + 0.3 * rnd())), a, 2 * Math.PI * rnd()]);
    const sum = waves.reduce((t, w) => t + w[1], 0);
    return (s) => FJ_BANK_A * clamp((FL - s) / 40, 0, 1) * (0.5 + 0.5 * waves.reduce((t, [k, a, ph]) => t + a * Math.sin(k * s + ph), 0) / sum);
  }
  function fileFjord(q) {
    const raw = q.centre.map((v) => ({ x: v[0], y: v[1], s: v[2] })), FL = q.length, hw = q.halfWidth;
    raw.forEach((c, i) => { const a = raw[Math.max(0, i - 1)], b = raw[Math.min(raw.length - 1, i + 1)], l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      c.tx = (b.x - a.x) / l; c.ty = (b.y - a.y) / l; c.nx = -c.ty; c.ny = c.tx; });
    // Plan 4.5, follow-up 2: the centre line is refined to steps of about 2 px (positions linear, normals interpolated),
    // so that the irregular banks are drawn smoothly; the samples of the layout (and so the places of the bridges) remain
    const pts = [];
    raw.forEach((a, i) => { const b = raw[i + 1]; if (!b) { pts.push(a); return; }
      const m = Math.max(1, Math.round((b.s - a.s) / 2));
      for (let j = 0; j < m; j++) { const t = j / m; if (!j) { pts.push(a); continue; }
        let nx = a.nx + (b.nx - a.nx) * t, ny = a.ny + (b.ny - a.ny) * t; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
        pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: a.s + (b.s - a.s) * t, nx, ny, tx: ny, ty: -nx }); } });
    const banks = [fjordBank(q.key, 1, FL), fjordBank(q.key, -1, FL)];
    pts.forEach((c) => (c.off = [banks[0](c.s), banks[1](c.s)]));   // bank beyond the water of the layout: [+n side, -n side]
    const width = (s) => 2 * (hw.mouth * Math.pow(Math.max(0, 1 - Math.max(0, s) / FL), hw.exp) + hw.min);
    // plan 1.5, round 2: the places of the bridges along the centre line (s in px), if the layout has them
    const bridgeS = q.bridges ? Object.fromEntries(q.bridges.map((b) => [b.key, b.s])) : null;
    return { centre: pts, width, FL, bl: FL, bridgeS, df: { frac: null, d: q.rule ? q.rule.definitionalDistance : null, dMax: null } };
  }
  // Half width of the water at the sample c on the side sg (1: +n, -1: -n), up to the drawn bank
  const bankHalf = (F, c, sg) => F.width(c.s) / 2 + (c.off ? c.off[sg > 0 ? 0 : 1] : 0);
  Object.entries(groups).forEach(([key, { sides, members }]) => {
    if (FILE_FJ[key]) { const F = Object.assign({ key, sides, bridges: [] }, fileFjord(FILE_FJ[key])); FJ.push(F); placeBridges(F, members); return; }
    const segs = [];
    sides[0].forEach((pa) => { const z = PZ[pa] && PZ[pa].cell; if (z) z.forEach((v, i) => { if (sides[1].includes(v[2])) segs.push([v, z[(i + 1) % z.length]]); }); });
    const lines = [], rest = segs.slice();
    while (rest.length) {
      const line = [rest[0][0], rest[0][1]]; rest.splice(0, 1);
      for (let grown = true; grown;) { grown = false;
        for (let i = 0; i < rest.length; i++) { const [a, b] = rest[i];
          if (ckey(a) === ckey(line[line.length - 1])) { line.push(b); rest.splice(i, 1); grown = true; break; }
          if (ckey(b) === ckey(line[0])) { line.unshift(a); rest.splice(i, 1); grown = true; break; } } }
      lines.push(line);
    }
    const len = (l) => l.reduce((s, v, i) => s + (i ? dist(pt(l[i - 1]), pt(v)) : 0), 0);
    const cands = [];
    lines.forEach((l) => { if (coastCorner.has(ckey(l[0]))) cands.push(l); else if (coastCorner.has(ckey(l[l.length - 1]))) cands.push(l.slice().reverse()); });
    if (!cands.length) { members.forEach((n) => missing.push(FM("{0}: Die beiden Seiten grenzen nicht an der Küste aneinander; kein Fjord", n.name))); return; }
    const border = cands.sort((a, b) => len(b) - len(a))[0].map(pt), bl = len(border.map((p) => [p.x, p.y]));
    const df = defFraction(FJORD_CONCEPTS[key]), FL = clamp(Math.max(df.frac, FJORD_MIN), 0.25, 0.9) * bl;
    const centre = [];
    for (let s = 0, i = 1, acc = 0; s <= FL && i < border.length;) {
      const a = border[i - 1], b = border[i], l = dist(a, b);
      if (s > acc + l) { acc += l; i++; continue; }
      const t = (s - acc) / l, nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l, wig = 4 * Math.sin(s / 23) * Math.min(1, s / 30);
      centre.push({ x: a.x + t * (b.x - a.x) + nx * wig, y: a.y + t * (b.y - a.y) + ny * wig, s, nx, ny, tx: (b.x - a.x) / l, ty: (b.y - a.y) / l });
      s += 3;
    }
    if (centre.length < 3) return;
    const width = (s) => MAX_W * Math.pow(Math.max(0, 1 - s / FL), 0.6) + 2;
    const F = { key, sides, centre, width, FL, bl, df, bridges: [] };
    FJ.push(F);
    placeBridges(F, members);
  });
  function placeBridges(F, members) {
    const { sides, centre, width, FL } = F;
    // Order: from the most general (at the mouth) to the narrowest (inner end); without a rank by year, the later
    // after the earlier
    const gen = (n) => (n.correspondence.generality != null ? n.correspondence.generality : 1000 - yearOf(n) / 10);
    const order = members.slice().sort((a, b) => gen(b) - gen(a) || (a.key < b.key ? -1 : 1));
    const at = (s) => centre.reduce((m, c) => (Math.abs(c.s - s) < Math.abs(m.s - s) ? c : m), centre[0]);
    // The bridges stand where both banks belong to the two sides (near the mouth the fjord may border a third
    // province): from the first such place on, over a little more than half of the remaining length
    const inSide = (side, x, y) => sides[side].some((k) => PZ[k] && inPolygon(PZ[k].cell, x, y));
    const valid = centre.filter((c) => { const r = width(c.s) * 0.62 + 18; return [1, -1].every((sg) => [0, 1].some((side) => inSide(side, c.x + c.nx * sg * r, c.y + c.ny * sg * r))) &&
      inSide(0, c.x + c.nx * r, c.y + c.ny * r) !== inSide(0, c.x - c.nx * r, c.y - c.ny * r); });
    const sStart = valid.length ? valid[0].s + 4 : 0.06 * FL, s0 = sStart, s1 = sStart + 0.82 * (FL - sStart);
    const place = (n, s) => {
      const c = at(s), w0 = width(c.s);
      const sg = inSide(0, c.x + c.nx * (w0 / 2 + 12), c.y + c.ny * (w0 / 2 + 12)) ? 1 : -1;
      const nA = { x: c.nx * sg, y: c.ny * sg };
      // Plan 4.5, follow-up 2: the bridge ends exactly at the drawn (irregular) banks
      const hA = bankHalf(F, c, sg), hB = bankHalf(F, c, -sg), w = hA + hB;
      const B = { n, F, c, w, nA, bankA: { x: c.x + nA.x * hA, y: c.y + nA.y * hA }, bankB: { x: c.x - nA.x * hB, y: c.y - nA.y * hB },
        ramp: Math.max(6, 0.12 * w), toSea: { x: -c.tx, y: -c.ty } };
      BR.push(B); F.bridges.push(B);
      // routes to and from the correspondence meet in the middle of the bridge (user); on the centre line of the fjord,
      // at most FJ_BANK_A / 2 from the middle between the irregular banks
      placement[n.key] = { x: c.x, y: c.y };
    };
    // Plan step 1.5, round 2: a fjord of the layout file brings the places of its bridges (raster-layout.js keeps them
    // clear of the cartouche); they are taken as they are
    if (F.bridgeS && order.every((n) => F.bridgeS[n.key] != null)) { order.forEach((n) => place(n, F.bridgeS[n.key])); return; }
    order.forEach((n, i) => place(n, order.length > 1 ? s0 + (s1 - s0) * i / (order.length - 1) : (s0 + s1) / 2));
  }
  // Distance of a point to the centre line of a fjord: { d, c } with the nearest sample c
  const nearCentre = (F, x, y) => { let m = { d: Infinity, c: null }; F.centre.forEach((c) => { const d = Math.hypot(c.x - x, c.y - y); if (d < m.d) m = { d, c }; }); return m; };
  // side of a point relative to the centre line at the sample c: 1 on the +n side, -1 on the other
  const sideOf = (c, x, y) => ((x - c.x) * c.nx + (y - c.y) * c.ny >= 0 ? 1 : -1);
  const inFjord = (x, y, margin) => FJ.some((F) => { const m = nearCentre(F, x, y); return m.c && m.c.s < F.FL + 6 && m.d < bankHalf(F, m.c, sideOf(m.c, x, y)) + (margin || 0); });
  // Elements in the water of a fjord, or on the ramps of its bridges, are pushed onto the nearer bank
  // Plan step 2.2: the trees too (the layout of plan step 1.4 kept them away from the bridges of the fjord that draft 10
  // computed before plan step 1.5; the layout is not recomputed in step 2.2)
  nodes.filter((n) => n.kind !== "bruecke").map((n) => [placement[n.key], n.kind]).concat(TREES.map((t) => [t, "baum"])).forEach(([p, kind]) => {
    FJ.forEach((F) => {
      const m = nearCentre(F, p.x, p.y); if (!m.c || m.c.s >= F.FL) return;
      const sMax = Math.max(...F.bridges.map((B) => B.c.s)) + 10;
      const ramp = m.c.s <= sMax ? Math.max(6, 0.12 * F.width(m.c.s)) + 14 : 0;
      const sgn = sideOf(m.c, p.x, p.y);
      const need = bankHalf(F, m.c, sgn) + 16 + ramp + (ramp && kind === "gebaeude" ? 40 : 0) + (ramp && kind === "baum" ? 0.7 * p.s : 0); if (m.d >= need) return;
      p.x = m.c.x + m.c.nx * sgn * need; p.y = m.c.y + m.c.ny * sgn * need;
    });
  });
  // ------------------------------------------------------------ Irregular coast (draft 10)
  // The coast is the border of the ellipse of drafts 7 and 8 with a deterministic irregular radius (sum of sines). It
  // never cuts off an element or the anchor of a name, and it meets the mouth of a fjord exactly at the old border.
  // Coastal cells are extended outward so that land fills the coast where it lies outside the ellipse.
  const EXT = 1.16, NC = 720;
  const ellR = (x, y) => Math.hypot((x - K0.CX) / K0.RX, (y - K0.CY) / K0.RY);
  const ellA = (x, y) => Math.atan2((y - K0.CY) / K0.RY, (x - K0.CX) / K0.RX);
  const coastR = (() => {
    const rnd = T.random(T.hash("coast-e10")), waves = [];
    for (let k = 3; k <= 44; k++) waves.push([k, 0.055 / Math.pow(k, 0.85) * (0.5 + rnd()), 2 * Math.PI * rnd()]);
    // Plan 4.5, follow-up 2 (user, 2026-10-22): a finer irregularity in addition to the waves above, restrained (about
    // 3 px on average), with a seed of its own so that the waves above stay as they were; drawing only, no meaning
    const rndF = T.random(T.hash("coast-e11-fine"));
    for (let k = 45; k <= 120; k++) waves.push([k, 0.0012 * Math.sqrt(45 / k) * (0.5 + rndF()), 2 * Math.PI * rndF()]);
    const r = [], lb = new Array(NC).fill(0), idx = (a) => ((Math.round(a / (2 * Math.PI) * NC) % NC) + NC) % NC;
    for (let i = 0; i < NC; i++) { const a = 2 * Math.PI * i / NC; r.push(1 + waves.reduce((s, [k, am, ph]) => s + am * Math.sin(k * a + ph), 0)); }
    const need = (x, y, m) => { const rr = ellR(x, y), i0 = idx(ellA(x, y)); for (let d = -9; d <= 9; d++) { const i = (i0 + d + NC) % NC; lb[i] = Math.max(lb[i], rr + m); } };
    Object.values(placement).forEach((p) => need(p.x, p.y, 0.05));
    TREES.forEach((t) => need(t.x, t.y, 0.05));   // plan step 2.2
    L.provinces.forEach((p) => need(p.text[0], p.text[1], 0.05));
    Object.values(L.countries || {}).forEach((c) => need(c.x, c.y, 0.05));
    // Plan 4.5, follow-up 2: both ends of every bridge with ramps and wing walls (as at magnification 1, deck half width
    // at most BRIDGE_HD screen px) stay on land, with BRIDGE_COAST map units to the coast (raster-layout.js places the
    // bridges so that this holds for the ellipse; here the coast is kept from cutting into it)
    { const kk = L.cartouche ? L.cartouche.k : 0.643, hd = 11.5 / kk, rm = 17.9 / K0.RY;
      BR.forEach((B) => { const u = { x: B.bankB.x - B.bankA.x, y: B.bankB.y - B.bankA.y }, l = Math.hypot(u.x, u.y) || 1; u.x /= l; u.y /= l;
        const ext = (B.n.stage === "bauplan" ? 0 : B.ramp + 1.2 * hd) + 1.5 * hd;
        [[B.bankA, -1], [B.bankB, 1]].forEach(([q, sg]) => [-2.1, 0, 2.1].forEach((o) => [0, ext].forEach((t) =>
          need(q.x + sg * u.x * t - u.y * o * hd, q.y + sg * u.y * t + u.x * o * hd, rm)))); }); }
    // At the mouth of every fjord the coast stays on the old border
    const fixed = FJ.map((F) => idx(ellA(F.centre[0].x, F.centre[0].y)));
    for (let i = 0; i < NC; i++) r[i] = clamp(Math.max(r[i], lb[i]), 0.9, EXT - 0.04);
    fixed.forEach((i0) => { for (let d = -14; d <= 14; d++) { const i = (i0 + d + NC) % NC, t = Math.abs(d) / 14; r[i] = 1 * (1 - t * t) + r[i] * t * t; } });
    for (let pass = 0; pass < 2; pass++) { const s = r.slice(); for (let i = 0; i < NC; i++) r[i] = Math.max((s[(i - 1 + NC) % NC] + 2 * s[i] + s[(i + 1) % NC]) / 4, Math.min(lb[i], EXT - 0.04)); }
    fixed.forEach((i0) => (r[i0] = 1));
    // Plan step 1.5, round 2: the title cartouche is an obstacle for the land; a layout of raster-layout.js gives its box
    // in map coordinates at magnification 1 (test viewport), and the coast stays CART_GAP px outside it; the limit is
    // smoothed (slope at most 0.0025 per step of the angle), so that the coast bends around the cartouche
    const CB = L.cartouche, CART_GAP = 10;
    if (CB) { const cap = new Array(NC).fill(Infinity);
      for (let i = 0; i < NC; i++) { const a = 2 * Math.PI * i / NC, ca = Math.cos(a), sa = Math.sin(a);
        for (let t = 0.85; t <= EXT; t += 0.005) { const x = K0.CX + K0.RX * t * ca, y = K0.CY + K0.RY * t * sa;
          if (x > CB.x0 - CART_GAP && x < CB.x1 + CART_GAP && y > CB.y0 - CART_GAP && y < CB.y1 + CART_GAP) { cap[i] = Math.max(0.85, t - 0.005); break; } } }
      for (let i = 0; i < NC; i++) { let m = Infinity; for (let d = -40; d <= 40; d++) m = Math.min(m, cap[(i + d + NC) % NC] + 0.0025 * Math.abs(d)); r[i] = Math.min(r[i], m); } }
    return r;
  })();
  const coastPoly = coastR.map((r, i) => { const a = 2 * Math.PI * i / NC; return [K0.CX + K0.RX * r * Math.cos(a), K0.CY + K0.RY * r * Math.sin(a)]; });
  const onLand = (x, y) => inPolygon(coastPoly, x, y) && !inFjord(x, y, 0);
  // Cells extended beyond the ellipse: coast corners move outward by EXT; a corner where a border meets the coast gets
  // a radial spike, so that the border continues to the new coast
  const out = (v) => [K0.CX + (v[0] - K0.CX) * EXT, K0.CY + (v[1] - K0.CY) * EXT, null];
  // Plan 1.5, round 2: an edge at the water of a fjord is no coast and is not extended (before, the banks of the fjord
  // were moved outward with the coast, which left a strip without province on one bank and covered the water on the other)
  function extendCell(z) {
    const o = [];
    const coastEdge = (i) => { const a = z[i], b = z[(i + 1) % z.length]; return a[2] === null && !inFjord((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 8); };
    z.forEach((v, i) => { const prevNull = coastEdge((i - 1 + z.length) % z.length), nextNull = coastEdge(i);
      if (!prevNull && !nextNull) o.push(v); else if (prevNull && nextNull) o.push(out(v));
      else if (nextNull) { o.push([v[0], v[1], null]); o.push(out(v)); } else { o.push(out(v)); o.push(v); } });
    return o;
  }

  // ------------------------------------------------------------ Basic structure
  const defs = el("defs", {}, svg);
  defs.insertAdjacentHTML("beforeend", `
    <filter id="e8-hand" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <clipPath id="e8-ausschnitt"><rect id="e8-clip" x="34" y="34" width="10" height="10"/></clipPath>`);
  const paths = el("g", {}, defs);
  // User, 2026-10-22: zooming out below magnification 1 ("just for fun"). clipOuter holds the sea (screen coordinates, so
  // that it fills the window at every magnification), the map (clipView) and the cartouche, which stays in the corner.
  // Below 1 the map is drawn exactly as at magnification 1 for the whole map and clipView shrinks it (see draw).
  const clipOuter = el("g", { "clip-path": "url(#e8-ausschnitt)" }, svg);
  const seaFill = el("rect", { x: 0, y: 0, width: 10, height: 10 }, clipOuter);
  const clipView = el("g", { id: "e11-view" }, clipOuter);
  const worldBottom = el("g", { id: "e8-land" }, clipView);
  const layerNames = el("g", { id: "e8-flaechennamen" }, clipView);
  const worldTop = el("g", { id: "e8-routen" }, clipView);
  // Routes appear only for the proof chain of the selected mountain (user's decision, 20 October 2026).
  // Draft 10: bridges (screen coordinates, recomputed for each frame), below the routes and the mountains
  const layerBridge = el("g", { id: "e11-bruecken" }, clipView);
  const dirSel = el("g", { id: "e8-routen-auswahl" }, clipView);
  const layerSymbols = el("g", { id: "e8-symbole", filter: "url(#e8-hand)" }, clipView);
  // Proof points above the symbols: they lie just outside the mountain, inside its (transparent) click area
  const pointsSel = el("g", {}, clipView);
  const layerGuide = el("g", { id: "e8-fuehrung", "pointer-events": "none" }, clipView);
  const layerCNames = el("g", { id: "e8-bergnamen" }, clipView);
  // Analogy line and dove: drawn above the symbols but transparent for the pointer, so that they neither cover the
  // selected mountain nor take its clicks (todo B44, P14)
  const layerExtra = el("g", { id: "e8-extra", "pointer-events": "none" }, clipView);
  // Plan 1.5, round 3 (decision of the user, 2026-10-21): the title cartouche is drawn in map coordinates, with the box
  // that raster-layout.js keeps free of land, fjord, bridges and names (L.cartouche: magnification 1 at the test viewport
  // 1600 x 1000). Since the addendum "water" the cartouche itself is fixed in the corner of the frame (placeCartouche);
  // the box still sets its size and keeps the whole map clear of it. Layouts without the box (the layout before plan step 1.2) get the same box
  // computed here. Inside the clip of the frame, above everything else.
  const CART = L.cartouche || (() => {
    const W = 1216, H = 904, kk = Math.min((W - 2 * MARGIN - 16) / (2 * K0.RX * 1.08), (H - 2 * MARGIN - 16) / (2 * K0.RY * 1.08));
    const tx = W / 2 - K0.CX * kk, ty = H / 2 - K0.CY * kk, x0 = MARGIN + 14, y0 = MARGIN + 14;
    return { x0: (x0 - tx) / kk, y0: (y0 - ty) / kk, x1: (x0 + 400 - tx) / kk, y1: (y0 + 62 - ty) / kk };
  })();
  const cartouche = el("g", { id: "e11-cartouche", "pointer-events": "none" }, clipOuter);
  const font = (t, a, g) => text(t, Object.assign({ "paint-order": "stroke", stroke: LIGHT, "stroke-linejoin": "round" }, a), g);

  // Countries and provinces (areas in world coordinates)
  // Colours of the countries; a province takes the colour of its country. Plan 1.5, addendum "water" (user,
  // 2026-10-21) and todo B69 k (user, 2026-10-22: "no light blue areas, they look like lakes"): no country has a bluish
  // or greenish colour, at the water or inland, so that land is not mistaken for water. Rule: the hue differs by at
  // least 100 degrees from the hue of the water (SEA, about 169 degrees), so it lies between 269 and 69 degrees (violet,
  // red, orange, ochre, yellow), or the colour is a grey (saturation below 0.1). Checked by tests/test-water-colours.js,
  // which also checks that neighbouring areas stay distinguishable. Until B69 k the rule held only at the water (the
  // former COAST_COLOR); 46, 58 and 81 were changed with B69 k.
  const COLOR = { 14: "#d2b783", 11: "#cf9f98", 13: "#e6c45e", 18: "#c49dd9", 55: "#c9a5c6", 57: "#cbc58f", 32: "#dc8f9c",
    53: "#c69ad6", 58: "#e88a5a", 81: "#cfb0dc", 52: "#c79bdb", 5: "#dccbe6", 12: "#d4b39a", 30: "#e9cb5a", 42: "#e7a56a",
    46: "#c1a1e0", 22: "#d7a9b9", 68: "#b9b9b9", 20: "#e2cb6c" };
  const countryColour = (c) => COLOR[c] || "#cbbf9f";
  const outline = (z) => "M" + z.map((v) => f(v[0]) + "," + f(v[1])).join("L") + "Z";
  // Draft 10: sea below everything, the land within the irregular coast, the fjords cut into it
  const SEA = "#b9cfcb", BANK = "#3f5753";
  seaFill.setAttribute("fill", SEA);
  defs.insertAdjacentHTML("beforeend", `<clipPath id="e11-kueste" clipPathUnits="userSpaceOnUse"><path d="${outline(coastPoly)}"/></clipPath>`);
  el("rect", { x: K0.CX - 6 * K0.RX, y: K0.CY - 6 * K0.RY, width: 12 * K0.RX, height: 12 * K0.RY, fill: SEA }, worldBottom);
  // Plan 1.5, addendum "water" (user, 2026-10-21): coast hatching of old maps, part of the drawing of the water (sea and
  // fjord) and without a meaning of its own (Konzept/04). Fine lines parallel to the coast that fade with the distance
  // from the land: HATCH gives distance (map units), opacity of each line; outward they get paler and further apart.
  // The lines lie in map coordinates (so they move apart when the map is magnified) with a stroke of constant width.
  // They are drawn below the land, the names, the bridges and the cartouche; at the coast they keep clear of the
  // cartouche, in a fjord each bank uses at most HATCH_FJ of the half width, so the lines of the two banks never meet
  // and run out toward the narrow inner end. No wave signs (Konzept/04, 4.8).
  const HATCH = [[4.5, 0.6], [10.5, 0.45], [18, 0.32], [27.5, 0.2]], HATCH_FJ = 0.46;
  const nskH = { "vector-effect": "non-scaling-stroke", fill: "none" };
  const hatchG = el("g", { id: "e11-coast-hatching", "pointer-events": "none" }, worldBottom);
  const hatchLine = (runs, op) => { const d = runs.filter((r) => r.length > 2).map((r) => "M" + r.map((v) => f(v[0]) + "," + f(v[1])).join("L")).join("");
    if (d) el("path", Object.assign({ d, stroke: BANK, "stroke-width": 0.8, opacity: op, "stroke-linejoin": "round", "stroke-linecap": "round" }, nskH), hatchG); };
  const nearCart = (x, y) => x > CART.x0 - 6 && x < CART.x1 + 6 && y > CART.y0 - 6 && y < CART.y1 + 6;
  // With exactly one fjord the hatching is drawn further below along one shoreline (coast and banks together); this
  // block draws the coast alone (layouts without a fjord or with several)
  if (FJ.length !== 1) {
    // outward normals of the coast, averaged over a few neighbouring samples so that the lines stay calm
    const n = coastPoly.length, raw = coastPoly.map((v, i) => { const a = coastPoly[(i - 1 + n) % n], b = coastPoly[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      if (nx * (v[0] - K0.CX) + ny * (v[1] - K0.CY) < 0) { nx = -nx; ny = -ny; } return [nx, ny]; });
    const nrm = raw.map((_, i) => { let x = 0, y = 0; for (let d = -4; d <= 4; d++) { const q = raw[(i + d + n) % n]; x += q[0]; y += q[1]; } const l = Math.hypot(x, y) || 1; return [x / l, y / l]; });
    HATCH.forEach(([off, op]) => {
      const runs = []; let cur = [];
      for (let i = 0; i <= n; i++) { const v = coastPoly[i % n], q = nrm[i % n], x = v[0] + q[0] * off, y = v[1] + q[1] * off;
        if (nearCart(x, y)) { if (cur.length) runs.push(cur); cur = []; } else cur.push([x, y]); }
      if (cur.length) runs.push(cur);
      hatchLine(runs, op);
    });
  }
  el("path", { d: outline(coastPoly), fill: "#f1e7cc", stroke: "none" }, worldBottom);
  const landG = el("g", { "clip-path": "url(#e11-kueste)" }, worldBottom);
  L.provinces.forEach((p) => el("path", { d: outline(extendCell(p.cell)), fill: p.countries.length > 1 ? "#cfa98c" : countryColour(p.countries[0]), opacity: 0.5 }, landG));
  const sameCountries = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  const prov = [], country = [];
  L.provinces.forEach((p) => p.cell.forEach((v, i) => {
    const w = p.cell[(i + 1) % p.cell.length], nb = v[2];
    // Draft 10: a border that meets the coast continues radially to the new coast (the clip path ends it there)
    const prevNb = p.cell[(i - 1 + p.cell.length) % p.cell.length][2];
    const atFjord = inFjord(v[0], v[1], 8);   // plan 1.5, round 2: no radial line from a corner at the fjord
    if (nb === null && !atFjord && prevNb && PZ[prevNb] && prevNb > p.key) { const o = out(v);
      (sameCountries(p.countries, PZ[prevNb].countries) ? prov : country).push(`M${f(v[0])},${f(v[1])}L${f(o[0])},${f(o[1])}`); }
    if (nb !== null && !atFjord && prevNb === null && PZ[nb] && nb > p.key) { const o = out(v);
      (sameCountries(p.countries, PZ[nb].countries) ? prov : country).push(`M${f(v[0])},${f(v[1])}L${f(o[0])},${f(o[1])}`); }
    if (!nb || !PZ[nb] || nb < p.key) return;
    (sameCountries(p.countries, PZ[nb].countries) ? prov : country).push(`M${f(v[0])},${f(v[1])}L${f(w[0])},${f(w[1])}`);
  }));
  const nsk = { "vector-effect": "non-scaling-stroke", fill: "none" };
  const provLine = el("path", Object.assign({ d: prov.join(""), stroke: INK, "stroke-width": 1.1, "stroke-dasharray": "1.5 3.5", "stroke-linecap": "round", opacity: 0.75 }, nsk), landG);
  el("path", Object.assign({ d: country.join(""), stroke: "#8a3a2a", "stroke-width": 5, opacity: 0.18 }, nsk), landG);
  el("path", Object.assign({ d: country.join(""), stroke: INK, "stroke-width": 1.8, "stroke-dasharray": "9 3 2 3", opacity: 0.9 }, nsk), landG);
  // Coast: only the border of land at water (Konzept/04, 4.1); no wave signs (4.8)
  el("path", Object.assign({ d: outline(coastPoly), stroke: BANK, "stroke-width": 1.5, opacity: 0.9 }, nsk), worldBottom);
  // Fjords: water strip along the border of the two sides, open toward the sea; the banks are coast
  FJ.forEach((B) => {
    // plan 4.5, follow-up 2: wd is the half width of the layout, wl and wr reach to the irregular banks
    const C = B.centre, wd = (c) => B.width(c.s) / 2, wl = (c) => bankHalf(B, c, 1), wr = (c) => bankHalf(B, c, -1);
    const left = C.map((c) => [c.x + c.nx * wl(c), c.y + c.ny * wl(c)]), right = C.map((c) => [c.x - c.nx * wr(c), c.y - c.ny * wr(c)]);
    const m = C[0], ox = -m.tx * 40, oy = -m.ty * 40, last = C[C.length - 1], tip = [last.x + last.tx * 3, last.y + last.ty * 3];
    const water = [[left[0][0] + ox, left[0][1] + oy]].concat(left, [tip], right.slice().reverse(), [[right[0][0] + ox, right[0][1] + oy]]);
    el("path", { d: outline(water), fill: SEA, stroke: "none" }, worldBottom);
    // The banks end at the coast: the first samples outside the coast polygon are left out
    const onBank = (v) => inPolygon(coastPoly, v[0], v[1]) || ellR(v[0], v[1]) <= 1.0005;
    const bank = left.concat([tip], right.slice().reverse()).filter(onBank);
    // Coast hatching on both banks (plan 1.5, addendum "water"): parallel to the bank, inside the water, only where the
    // bank lies on land and the line keeps within HATCH_FJ of the half width
    if (FJ.length === 1) {
      // User, 2026-10-22 (gaps in the hatching at the mouth): before, the sea and the two banks had separate lines, and the
      // water of the fjord, which reaches 40 units into the sea, covered the sea lines at the mouth, so neither covered
      // the corners. Now one closed shoreline (the coast up to the mouth, the left bank inward, round the inner end, the
      // right bank outward, the coast again) gets the offset lines, so they turn the corners at the mouth. In the fjord
      // each bank keeps the limit HATCH_FJ of the half width. The lines lie above the water of the fjord and are clipped
      // to the water (outside the coast or inside the fjord).
      const iNear = (p) => { let bi = 0, bd = Infinity; coastPoly.forEach((v, i) => { const d = Math.hypot(v[0] - p[0], v[1] - p[1]); if (d < bd) { bd = d; bi = i; } }); return bi; };
      const lIn = C.map((c, i) => ({ p: left[i], w: wd(c) })).filter((q) => onBank(q.p));
      const rIn = C.map((c, i) => ({ p: right[i], w: wd(c) })).filter((q) => onBank(q.p));
      if (lIn.length > 2 && rIn.length > 2) {
        const n = coastPoly.length, iL = iNear(lIn[0].p), iR = iNear(rIn[0].p), fwd = (iL - iR + n) % n > n / 2;
        const shore = [];   // { p, w (half width of the fjord, Infinity on the coast) }
        for (let k = iR; ; k = fwd ? (k + 1) % n : (k - 1 + n) % n) { shore.push({ p: coastPoly[k], w: Infinity }); if (k === iL) break; }
        lIn.forEach((q) => shore.push(q)); shore.push({ p: tip, w: 0 }); rIn.slice().reverse().forEach((q) => shore.push(q));
        const N = shore.length, area = shore.reduce((s, q, i) => { const r = shore[(i + 1) % N].p; return s + q.p[0] * r[1] - r[0] * q.p[1]; }, 0);
        // Normals away from the land (the shoreline runs round the land), averaged over neighbouring samples
        const raw = shore.map((q, i) => { const a = shore[(i - 1 + N) % N].p, b = shore[(i + 1) % N].p;
          let nx = b[1] - a[1], ny = a[0] - b[0]; const l = Math.hypot(nx, ny) || 1; return area > 0 ? [nx / l, ny / l] : [-nx / l, -ny / l]; });
        const nrm = raw.map((_, i) => { let x = 0, y = 0; for (let d = -4; d <= 4; d++) { const q = raw[(i + d + N) % N]; x += q[0]; y += q[1]; } const l = Math.hypot(x, y) || 1; return [x / l, y / l]; });
        const waterPath = outline(water);
        defs.insertAdjacentHTML("beforeend", `<clipPath id="e11-water" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="M${f(K0.CX - 6 * K0.RX)},${f(K0.CY - 6 * K0.RY)}h${f(12 * K0.RX)}v${f(12 * K0.RY)}h${f(-12 * K0.RX)}Z${outline(coastPoly)}"/><path d="${waterPath}"/></clipPath>`);
        const shoreHatch = el("g", { id: "e11-coast-hatching", class: "e11-fjord-hatching", "pointer-events": "none", "clip-path": "url(#e11-water)" }, worldBottom);
        HATCH.forEach(([off, op]) => {
          const runs = []; let cur = [];
          for (let i = 0; i <= N; i++) { const q = shore[i % N], v = nrm[i % N], x = q.p[0] + v[0] * off, y = q.p[1] + v[1] * off;
            if (off > HATCH_FJ * q.w || nearCart(x, y)) { if (cur.length) runs.push(cur); cur = []; } else cur.push([x, y]); }
          if (cur.length) runs.push(cur);
          const d = runs.filter((r) => r.length > 2).map((r) => T.smooth(r)).join("");
          if (d) el("path", Object.assign({ d, stroke: BANK, "stroke-width": 0.8, opacity: op, "stroke-linecap": "round", "stroke-linejoin": "round" }, nskH), shoreHatch);
        });
      }
    }
    el("path", Object.assign({ d: "M" + bank.map((v) => f(v[0]) + "," + f(v[1])).join("L"), stroke: BANK, "stroke-width": 1.5, opacity: 0.9, "stroke-linejoin": "round" }, nsk), worldBottom);
    // Programme (a bridge of a conjecture with state "programm", here the Langlands correspondence): its dashed outline
    // (glossary: Gestrichelter Umriss) around the whole fjord region with the bridges and both bridgeheads
    // plan 4.5, follow-up 3: suspended with the other dashed outlines of programmes (B66); the construction plan stays
    if (PROGRAMMES_SHOWN && B.bridges.some((x) => x.n.state === "programm")) {
      const pad = 34, pts = [];
      C.forEach((c, i) => { if (i % 2) return; const r = Math.max(wl(c), wr(c)) + pad + (B.bridges.some((x) => Math.abs(x.c.s - c.s) < 12) ? 0.12 * B.width(c.s) + 14 : 0);
        pts.push([c.x + c.nx * r, c.y + c.ny * r], [c.x - c.nx * r, c.y - c.ny * r]); });
      pts.push([tip[0] + last.tx * pad, tip[1] + last.ty * pad], [m.x - m.tx * 18, m.y - m.ty * 18]);
      // Convex hull (monotone chain), then a smooth closed line through it
      const P2 = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], hi = [];
      P2.forEach((p) => { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
      P2.slice().reverse().forEach((p) => { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); });
      const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
      B.outline = el("path", Object.assign({ d: T.smooth(hull.concat([hull[0]])), stroke: INK, "stroke-width": 1.5, "stroke-dasharray": "7 4", opacity: 0.85, "pointer-events": "none" }, nsk), worldBottom);
    }
  });

  // ------------------------------------------------------------ Names of countries and provinces (curved)
  // Direction: principal axis of the area (tilted at most 26°, horizontal for roundish areas); length: chord through
  // the area
  function axis(ms) {
    const A = ms.reduce((s, m) => s + m.A, 0), cx = ms.reduce((s, m) => s + m.x, 0) / A, cy = ms.reduce((s, m) => s + m.y, 0) / A;
    const xx = ms.reduce((s, m) => s + m.xx, 0) / A - cx * cx, yy = ms.reduce((s, m) => s + m.yy, 0) / A - cy * cy, xy = ms.reduce((s, m) => s + m.xy, 0) / A - cx * cy;
    let th = 0.5 * Math.atan2(2 * xy, xx - yy);
    const tr = (xx + yy) / 2, d = Math.sqrt(((xx - yy) / 2) ** 2 + xy * xy), lang = Math.sqrt((tr + d) / Math.max(1e-9, tr - d));
    if (th > Math.PI / 2) th -= Math.PI; if (th < -Math.PI / 2) th += Math.PI;
    th = clamp(th, -0.32, 0.32) * clamp((lang - 1.2) / 0.8, 0, 1);
    return { A, x: cx, y: cy, th };
  }
  function chord(cells, px, py, dx, dy) {   // parameter range of the line p + t·d inside the (convex) cells
    let t0 = Infinity, t1 = -Infinity;
    cells.forEach((z) => {
      const ts = [];
      z.forEach((a, i) => { const b = z[(i + 1) % z.length], ex = b[0] - a[0], ey = b[1] - a[1], den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-9) return;
        const t = ((a[0] - px) * ey - (a[1] - py) * ex) / den, u = ((a[0] - px) * dy - (a[1] - py) * dx) / den;
        if (u >= -1e-9 && u <= 1 + 1e-9) ts.push(t); });
      if (ts.length >= 2) { t0 = Math.min(t0, ...ts); t1 = Math.max(t1, ...ts); }
    });
    return t1 > t0 ? [t0, t1] : [0, 0];
  }
  const measureG = el("g", { opacity: 0 }, svg);
  function measureText(t, a) { const e = text(t, Object.assign({ "font-size": REF }, a), measureG); const w = e.getComputedTextLength(); e.remove(); return w; }
  let pathNo = 0;
  function arcPath(th, len, dev, off) {
    const c = Math.cos(th), s = Math.sin(th), ux = s, uy = -c, mx = -ux * off, my = -uy * off;
    return `M${f(mx - c * len / 2)},${f(my - s * len / 2)}Q${f(mx + ux * 2 * dev)},${f(my + uy * 2 * dev)} ${f(mx + c * len / 2)},${f(my + s * len / 2)}`;
  }
  // Label boxes (todo B12): per line from cap height above the baseline to the descender below it, in em of the font
  // (IM Fell English); LH is the line spacing of names with several lines.
  const ASC = 0.75, DESC = 0.25, LH = 1.1;
  // Long names (todo B12 b): a name wider than WRAP (in em) is broken at word boundaries into balanced lines, at most
  // three. Breaks before a parenthesis or after a colon or dash are preferred.
  const WRAP = 11;
  const wordMemo = new Map();
  function wordWidth(w, a) {
    const key = JSON.stringify(a) + "|" + w;
    if (!wordMemo.has(key)) wordMemo.set(key, w === " " ? measureText("x x", a) - 2 * measureText("x", a) : measureText(w, a));
    return wordMemo.get(key);
  }
  function breakLines(t, a, n) {   // best split of t into n lines; null if t has fewer than n words
    const words = t.split(" "); if (words.length < n) return null;
    const ww = words.map((w) => wordWidth(w, a)), sp = wordWidth(" ", a);
    const lineW = (i, j) => ww.slice(i, j).reduce((s, x) => s + x, 0) + (j - i - 1) * sp;
    const preferred = (i) => /^[(„“"]/.test(words[i]) || /[:–—]$/.test(words[i - 1]);
    let best = null;
    (function split(start, left, cuts) {
      if (left === 1) {
        const all = cuts.concat([words.length]);
        let from = 0, wmax = 0, bonus = 0;
        all.forEach((j) => { wmax = Math.max(wmax, lineW(from, j)); if (j < words.length && preferred(j)) bonus += 0.6 * REF; from = j; });
        if (!best || wmax - bonus < best.cost) best = { cost: wmax - bonus, cuts: all };
        return;
      }
      for (let j = start + 1; j <= words.length - left + 1; j++) split(j, left - 1, cuts.concat([j]));
    })(0, n, []);
    let from = 0;
    return best.cuts.map((j) => { const l = words.slice(from, j).join(" "); from = j; return l; });
  }
  function wrapName(t, a) {   // lines of a mountain name
    const w = measureText(t, a), n = Math.min(3, Math.ceil(w / (WRAP * REF)));
    for (let m = n; m > 1; m--) { const z = breakLines(t, a, m); if (z) return z; }
    return [t];
  }
  // Axis-parallel boxes along the lines of an area name (local coordinates of the name at font size REF): the name
  // is tilted and curved, so one box around it would block much free space. Each line is cut into at most 12 pieces.
  function curvedBoxes(o, textLines, widths) {
    const c = Math.cos(o.th), s = Math.sin(o.th), boxes = [];
    textLines.forEach((z, i) => {
      const w = widths[i], len = w * 1.2 + 2 * REF, dev = o.says * len, off = (i - (textLines.length - 1) / 2) * 1.2 * REF + 0.35 * REF;
      const k = clamp(Math.ceil(w / (2 * REF)), 1, 12);
      const at = (x) => {   // point of the baseline at chord position x and the local "up" direction
        const t = 0.5 + x / len, h = 4 * t * (1 - t) * dev - off, slope = 4 * dev * (1 - 2 * t) / len;
        const dx = c + s * slope, dy = s - c * slope, l = Math.hypot(dx, dy);
        return { x: c * x + s * h, y: s * x - c * h, ux: dy / l, uy: -dx / l };
      };
      for (let j = 0; j < k; j++) {
        const pts = [];
        [-w / 2 + j * w / k, -w / 2 + (j + 1) * w / k].forEach((x) => { const p = at(x);
          pts.push([p.x + p.ux * ASC * REF, p.y + p.uy * ASC * REF], [p.x - p.ux * DESC * REF, p.y - p.uy * DESC * REF]); });
        boxes.push({ x0: Math.min(...pts.map((q) => q[0])), x1: Math.max(...pts.map((q) => q[0])), y0: Math.min(...pts.map((q) => q[1])), y1: Math.max(...pts.map((q) => q[1])) });
      }
    });
    const all = { x0: Math.min(...boxes.map((b) => b.x0)), x1: Math.max(...boxes.map((b) => b.x1)), y0: Math.min(...boxes.map((b) => b.y0)), y1: Math.max(...boxes.map((b) => b.y1)) };
    return { boxes, all };
  }
  const regions = [];
  const PROVINCE_INK = "#6e4626";   // colour of the province names (todo B63)
  function regionName(o) {   // o: { text, attrs, th, x, y, len, height, fs0, fsMin, fsMax, country, says }
    const g = el("g", { class: "fname aus" }, layerNames);
    o.g = g; o.variants = [];
    const seen = new Set();
    // Variants with one, two and three lines (todo B12 b); the placement chooses the largest one that finds space
    [1, 2, 3].filter((n) => n <= (o.maxLines || 3)).map((n) => (n === 1 ? [o.text] : breakLines(o.text, o.attrs, n))).filter(Boolean).forEach((textLines) => {
      if (seen.has(textLines.join("\n"))) return; seen.add(textLines.join("\n"));
      const vg = el("g", { display: "none" }, g), widths = textLines.map((z) => measureText(z, o.attrs)), wmax = Math.max(...widths);
      textLines.forEach((z, i) => {
        const len = widths[i] * 1.2 + 2 * REF, off = (i - (textLines.length - 1) / 2) * 1.2 * REF + 0.35 * REF, id = "e8-pf" + (pathNo++);
        el("path", { id, d: arcPath(o.th, len, o.says * len, off) }, paths);
        const t = el("text", Object.assign({ "font-size": REF, "text-anchor": "middle", "paint-order": "stroke", stroke: LIGHT,
          "stroke-width": 0.3 * REF, "stroke-linejoin": "round" }, o.attrs), vg);
        const tp = el("textPath", { href: "#" + id, startOffset: "50%" }, t); tp.textContent = z;
      });
      o.variants.push(Object.assign({ g: vg, w: wmax, n: textLines.length }, curvedBoxes(o, textLines, widths)));
    });
    // Further candidate points for the name (todo B12 a): a grid of about 80 points inside the area, in world
    // coordinates; they are used when there is no room near the anchor
    const xs = o.cells.flat().map((v) => v[0]), ys = o.cells.flat().map((v) => v[1]);
    const gx0 = Math.min(...xs), gx1 = Math.max(...xs), gy0 = Math.min(...ys), gy1 = Math.max(...ys), gd = Math.sqrt((gx1 - gx0) * (gy1 - gy0) / 80) || 1;
    o.grid = []; o.bb = { x0: gx0, x1: gx1, y0: gy0, y1: gy1 };
    for (let gx = gx0 + gd / 2; gx < gx1; gx += gd) for (let gy = gy0 + gd / 2; gy < gy1; gy += gd)
      if (o.cells.some((zz) => inPolygon(zz, gx, gy)) && onLand(gx, gy)) o.grid.push([gx, gy]);   // draft 10: not in the water
    o.active = -1;
    // Hover box of the name (todo B40): key of the area in AREA_TEXTS
    hint.set(g, o.forest != null ? { forest: o.forest } : { area: o.areaKey, country: o.country && o.areaKey !== CONDO });
    g.setAttribute("data-area", o.areaKey);
    regions.push(o);
  }
  function buildAreaNames() {
    const ms = {}; L.provinces.forEach((p) => (ms[p.key] = moments(p.cell)));
    // Countries: arithmetic geometry as a country of its own; otherwise all provinces with exactly
    // this country
    const countries = {};
    L.provinces.forEach((p) => { const k = p.countries.length > 1 ? CONDO : String(p.countries[0]); (countries[k] = countries[k] || []).push(p); });
    Object.entries(countries).forEach(([k, ps]) => {
      const name = k === CONDO ? U("Arithmetische Geometrie") : (M.countries[k] ? M.countries[k].name : "");
      if (!name) return;
      const a = axis(ps.map((p) => ms[p.key])), large = ps.length >= 3;
      let x = a.x, y = a.y;
      if (L.countries && L.countries[k]) { x = L.countries[k].x; y = L.countries[k].y; }
      // plan 1.5: the layout file gives the anchor of every country name (field lines); older layouts only for large countries
      if (ps.length === 1 && !(L.countries && L.countries[k] && L.countries[k].lines)) { x = ps[0].text[0]; y = ps[0].text[1]; }
      const c = Math.cos(a.th), s = Math.sin(a.th), [t0, t1] = chord(ps.map((p) => p.cell), x, y, c, s);
      const [u0, u1] = chord(ps.map((p) => p.cell), x, y, s, -c);
      const fs0 = clamp(Math.sqrt(a.A) * 0.052, 13, 32);
      regionName({ cells: ps.map((p) => p.cell), text: name.toUpperCase(), attrs: { class: "sc", "letter-spacing": (large ? 0.22 : 0.08) * REF }, th: a.th,
        x: x + c * (t0 + t1) / 2, y: y + s * (t0 + t1) / 2, len: t1 - t0, height: u1 - u0, fs0, fsMin: 11, fsMax: large ? 44 : 22,
        country: true, areaKey: k, says: 0.045, provKey: ps.length === 1 ? ps[0].key : null, opacityOf: large ? 0.6 : 0.8 });
    });
    L.provinces.forEach((p) => {
      if (p.countries.length > 1) return;   // arithmetic geometry: country name suffices
      // Country with only one province: no province name, the country name suffices (user's decision, 20 October 2026)
      if (regions.some((q) => q.country && q.provKey === p.key)) return;
      const P0 = M.provinces[p.key]; if (!P0 || !P0.nodes.length || !P0.name) return;
      // Province names are straight and horizontal again, not curved (user, 2026-10-20)
      const a = Object.assign(axis([ms[p.key]]), { th: 0 }), c = 1, s = 0;
      const [t0, t1] = chord([p.cell], p.text[0], p.text[1], c, s), [u0, u1] = chord([p.cell], p.text[0], p.text[1], s, -c);
      // Todo B63 (user, 2026-10-21): province names upright instead of italic, which was hard to read; a sepia colour and
      // a slight letter spacing keep them apart from the country names (small capitals, ink) and the mountain names (ink)
      const o = { cells: [p.cell], text: P0.name, attrs: { "font-style": "normal", style: "fill:" + PROVINCE_INK, "letter-spacing": 0.04 * REF }, th: a.th, x: p.text[0] + c * (t0 + t1) / 2, y: p.text[1] + s * (t0 + t1) / 2,
        len: t1 - t0, height: u1 - u0, fs0: 13.5, fsMin: 10.5, fsMax: 19, country: false, areaKey: p.key, says: 0, opacityOf: 0.92 };
      regionName(o);
    });
    // Plan step 2.2: names of the forests (names of the model, FOREST_NAMES, approved by the user on 22 October 2026), placed like area names inside the
    // ground of the forest; italic and dark green, so that they differ from the names of countries, provinces and mountains
    FORESTS.forEach((F) => {
      if (!F.label) return;
      const [t0, t1] = chord([F.hull], F.cx, F.cy, 1, 0), [u0, u1] = chord([F.hull], F.cx, F.cy, 0, -1);
      regionName({ cells: [F.hull], text: F.label, attrs: { "font-style": "italic", style: "fill:" + FOREST_INK, "letter-spacing": 0.03 * REF }, th: 0,
        x: F.cx + (t0 + t1) / 2, y: F.cy, len: t1 - t0, height: u1 - u0, fs0: 12.5, fsMin: 10.5, fsMax: 15, maxLines: 2, country: false, forest: F.index,
        areaKey: "forest:" + F.index, says: 0, opacityOf: 0.95 });
    });
  }

  // ------------------------------------------------------------ Importance, size, level of detail
  const MEASURES = { nutzer: { name: U("direkte Nutzer"), value: (n) => n.users }, folgen: { name: U("alle folgenden Sätze"), value: (n) => n.consequences } };
  let measure = "nutzer", flagKind = "";
  // Filter "Nur zeigen" (user, 2026-10-20): only theorems that are easy to understand as statements (comprehensibility
  // level 1 or 2) or only the great theorems and conjectures (field `large`). Matching elements are shown at every
  // zoom level, the others are hidden; theories (hill ranges) and the selected chain stay as usual.
  let filterKind = "";
  const FILTERS = { einfach: (n) => n.compr != null && n.compr <= 2, gross: (n) => !!n.large };
  // Turning labels on and off (todo B17 and B20): provinces together with their borders; the names of the
  // selected
  // proof chain remain visible even when mountain names are turned off.
  // Todo B62 (user, 2026-10-21): names of hill ranges have a switch of their own ("Hill ranges"), off by default; the
  // names of the hill ranges in a selected chain are shown in any case
  // Plan step 2.2: switch "Definitions" (trees, forests and their names; named after the mathematical object, user 2026-10-22), on by default
  // Plan step 4.5 (user, 2026-10-22): a city (theory) has no name on the map, its name appears only in the hover box;
  // the switch "Hill ranges" is gone, and the switch "Mountains" is now called "Theorems"
  // Switch "all theorems" (alle, user 2026-10-22): every theorem and conjecture as its symbol at every magnification,
  // without its name; off by default
  // Plan step 3.2 (todo B67): group "Show all" with theorems (alle), dependencies (netz: the whole route network) and
  // analogies (analogien), all off by default
  const SHOWN_DEFAULT = { laender: true, provinzen: true, berge: true, alle: false, netz: false, analogien: false, baeume: false };   // trees off by default (user, 2026-10-22)
  const SINGLE = new Set(["berg", "gipfel", "bedingt", "trugbild"]);   // kinds drawn as a single building
  const shown = Object.assign({}, SHOWN_DEFAULT);
  // Whether the name of an element may be placed without a selection: never for a city, the others by "Theorems"
  const nameSwitch = (e) => (e.n.kind === "gebaeude" ? false : shown.berge);
  const E = [], EK = {};
  const quantile = (arr, p) => { const a = arr.slice().sort((x, y) => x - y); return a[Math.floor(p * (a.length - 1))]; };
  // Returns { w, we, s, zA, level } per key. Todo B73: zA from the formula below (N_TOTAL, Z_ZERO and the covering rule) is
  // only the threshold of the bridges and the estimate that maps/tools/place-elements.js uses for the layout; the
  // page replaces it for every other element by computeThresholds (as early as there is room for symbol and name)
  function meaning(m) {
    const value = MEASURES[m].value, raw = nodes.map(value), q75 = quantile(raw, 0.75), q90 = quantile(raw, 0.9), q97 = quantile(raw, 0.97);
    const differs = MEASURES[m === "nutzer" ? "folgen" : "nutzer"].value, aMax = Math.max(...nodes.map(differs)) + 1;
    const R = {};
    nodes.forEach((n) => {
      let w = value(n);
      if (n.highlight.size) w = Math.max(w, q90);
      if (n.large) w = Math.max(w, q97);
      const s0 = 6.5 * Math.sqrt(1 + w * 9 / Math.max(1, q97));
      let s = Math.min(36, s0);
      const level = w >= q97 ? 1 : w >= q90 ? 2 : w >= q75 ? 3 : 4;
      // Hill ranges: larger name, larger symbol (user, 2026-10-20); level 1 to 4 of the name size
      // Plan 1.4, round 4 (user, 2026-10-21): hill ranges of levels 1 and 2 about two thirds of their former size (48 -> 32,
      // 40 -> 30); level 3 goes from 32 to 28 so that the order of the levels is kept
      if (n.kind === "gebaeude") s = [0, 32, 30, 28, 26][level]; else if (n.kind === "ungeheuer") s = 10;   // key kept from the model: the counterexample (cairn)
      else if (n.kind !== "berg" && n.kind !== "trugbild") s = Math.max(s, 6.5 * Math.SQRT2);
      // (Plan 1.4, round 4 drew large single buildings smaller above the size 13; removed with todo B73, user 2026-10-22:
      // "no building is made additionally smaller")
      R[n.key] = { w, we: w + 0.9 * differs(n) / aMax, s, level };
      // Draft 10: a bridge is a landmark, visible from the overview on; its symbol size only sets where routes end
      if (n.kind === "bruecke" && n.state === "programm") Object.assign(R[n.key], { level: 1, w: Math.max(w, q97), we: Infinity });
    });
    const sequence = nodes.slice().sort((a, b) => R[b.key].we - R[a.key].we || (a.key < b.key ? -1 : 1));
    const w1 = R[sequence[Math.min(N_TOTAL, sequence.length) - 1].key].we, gamma = Math.log(Z_ZERO) / Math.log(w1 + 1);
    const previous = [];
    sequence.forEach((n) => {
      const r = R[n.key], p = placement[n.key];
      let zA = r.we >= w1 ? 1 : Math.pow((w1 + 1) / (r.we + 1), gamma);
      previous.forEach((o) => {   // visible only once it does not cover a more important element
        const d = Math.hypot(p.x - o.x, p.y - o.y), needed = 0.95 * (r.s + o.s) / Math.max(d, 0.5);
        if (needed > 1) zA = Math.max(zA, Math.pow(needed, 1 / (1 - P)));
      });
      r.zA = clamp(zA, 1, Z_MAX * 0.85);
      previous.push({ x: p.x, y: p.y, s: r.s });
    });
    return { R, q: [q75, q90, q97] };
  }
  // Todo B32: threshold, no fade depending on the zoom; the change is soft only in time (CSS, class "aus")
  const visibility = (zA, z) => (z >= zA ? 1 : 0);

  // ------------------------------------------------------------ Map elements (symbols in their own coordinates, center
  // 0,0)
  // Kind and state of an element in one line of the info box, without the name of the symbol (todo B44, F1); the
  // state of an open conjecture comes from the field `state`
  const KIND = { berg: "Bewiesener Satz", bedingt: "Vermutung, bedingt bewiesen", trugbild: "Widerlegte Vermutung",
    kueste: "Programm", gebaeude: "Theorie", ungeheuer: "Gegenbeispiel" };
  // Draft 10: stages of a bridge (glossary: Brücke)
  const BRIDGE_STAGE = { fertig: "Korrespondenz, bewiesen (Brücke)", imbau: "Korrespondenz, teilweise bewiesen (Brücke im Bau)", bauplan: "Korrespondenz, vermutet (Bauplan)" };
  Object.keys(BRIDGE_STAGE).forEach((a) => (BRIDGE_STAGE[a] = U(BRIDGE_STAGE[a])));
  Object.keys(KIND).forEach((a) => (KIND[a] = U(KIND[a])));
  // Todo B69 j (user, 2026-10-22): on the map a theorem stands without additions: a trailing parenthesis
  // ("Faltings's theorem (Mordell conjecture)" -> "Faltings's theorem") and the part after a colon are dropped. The hover
  // box, the info box and the search keep the full name. Exceptions keep the full name where the short one would be
  // ambiguous or misleading (MAP_NAME_KEEP).
  // User, 2026-10-22: every trailing parenthesis is dropped on the map ("Alle Klammern weg"), no exceptions any more
  const MAP_NAME_KEEP = new Set([]);
  const mapName = (name) => {
    let t = String(name || "");
    const colon = t.replace(/<[^>]+>/g, "").indexOf(": ");
    if (colon > 0 && !/<[^>]+>/.test(t)) t = t.slice(0, colon);
    const m = /^(.*\S)\s+\([^()]*\)$/.exec(t);
    return m ? m[1] : t;
  };
  // Names on the map given by hand where the rule cannot shorten a long name
  const MAP_NAME_SHORT = {
    "ag:hilbert14": "Finite generation of invariant rings",   // full: "Finite generation of all invariant rings of linear groups"
    "ag:minmodverm": "General existence of minimal models",    // full: "Existence of minimal models (general)"; user, 2026-10-22
    "ag:dejong": "De Jong alterations",                        // full: "Alterations (de Jong)"; user, 2026-10-22
  };
  const shortName = (n) => MAP_NAME_SHORT[n.key] || (MAP_NAME_KEEP.has(n.key) ? n.name : mapName(n.name));
  const hint = new WeakMap(), selectable = new WeakMap();
  // Plan step 4.5 (user, 2026-10-22): buildings, ruins and cities after the approved sketches; the drawings are those
  // of maps/shared_scripts/building-symbols.js (window.SKETCH_SYMBOLS, hip-roof line B; copy of the sketch of 22 October 2026). A theorem is a building of its stage
  // (levels 4 to 1: storeys, annex, side and rear wings; thin lines, no towers, no domes), an open conjecture (every state
  // except "widerlegt" and "programm") the same building with a question mark above it, a refuted conjecture a ruin (the
  // roof has broken off, no rubble, no cairn), a theory a city (small houses staggered in depth, one or two towers; the
  // houses of a city are not nodes). A counterexample has no symbol of its own (a refuted conjecture X is the theorem
  // not-X); it appears in the info box of the ruin. The foot of a building lies where the foot of the mountain lay
  // (0.45 s below the centre), so that the symbol stays at its place of plan step 1.4.
  const SY = window.SKETCH_SYMBOLS, BUILDING_FOOT = 0.45;
  // Scale of the symbols at magnification 1 in the test window (as in place-elements.js): the question mark has at least
  // SY.QM_MIN screen pixels there, so that it is readable at magnification 1
  const SYM_REF = (L.elementLayout && L.elementLayout.constants && L.elementLayout.constants.K0) || 0.643;
  const stageOf = (level) => clamp(level || 4, 1, 4);
  const isConjecture = (n) => n.kind === "gipfel" || n.kind === "bedingt";
  const partsOf = (n, level) => (n.kind === "trugbild" ? SY.unroofed(SY.BUILDINGS.B[stageOf(level)]) : SY.BUILDINGS.B[stageOf(level)]);
  // Box of a building in units of the symbol (foot at y = foot), with the ground lines; the question mark of a conjecture
  // and its light halo are added (baseline 0.12 s above the top, cap height about 0.75 of the font size)
  function buildingBox(n, parts, s, foot) {
    const b = { x0: Math.min(...parts.map((p) => p.x)) * s - 1, x1: Math.max(...parts.map((p) => p.x + p.w)) * s + SY.D * s + 1,
      y0: foot - SY.topOf(s, parts) - 1, y1: foot + 4.5 };
    if (isConjecture(n)) {
      const fs = Math.max(0.8 * s, SY.QM_MIN / SYM_REF), base = foot - SY.topOf(s, parts) - 0.12 * s;
      b.y0 = Math.min(b.y0, base - 0.8 * fs); b.x0 = Math.min(b.x0, 0.05 * s - 0.36 * fs); b.x1 = Math.max(b.x1, 0.05 * s + 0.36 * fs);
    }
    return b;
  }
  // City: three sizes after the size of the former hill range (32 large, 30 and 28 middle, 26 small); the box is measured
  // once per city in the hidden measuring group
  const citySize = (s) => (s >= 31 ? "gross" : s >= 28 ? "mittel" : "klein");
  const citySeed = (n) => (T.hash(n.key) % 997) + 1;
  function cityBox(s, size, seed) {
    const g = el("g", {}, measureG);
    SY.city(g, s, size, seed, false);
    const r = g.getBBox(); g.remove();
    return { x0: r.x - 0.5, x1: r.x + r.width + 0.5, y0: r.y - 0.5, y1: r.y + r.height + 0.5 };
  }
  // Analogy as a dove seen from the side, body centre at (0, 0), about 20 units wide, flying east (candidate A of the
  // same sketch); the colour is that of the dashed analogy line
  const DOVE_COLOR = "#2f5566";
  function dove(g) {
    const dl = (extra) => Object.assign({ stroke: DOVE_COLOR, "stroke-linecap": "round", "stroke-linejoin": "round" }, extra);
    el("path", dl({ d: "M-0.4,-0.8Q-1.2,-6 -5.6,-9L-6.4,-7.4L-7.6,-7.4L-7.4,-5.6L-8.4,-5Q-6.4,-2.4 -4.2,-0.4Z", fill: PAPER, "stroke-width": 0.8, opacity: 0.9 }), g);
    el("path", dl({ d: "M-6.5,0.4L-10.8,-1.4L-11.2,0.9L-10.6,2.8L-6.5,1.6Z", fill: PAPER, "stroke-width": 0.9 }), g);
    el("path", dl({ d: "M-7,0.2Q-1.5,-1.2 3.6,-0.8Q5,-2.4 6.6,-2Q7.9,-1.6 7.8,-0.6L9.4,-0.1L7.6,0.4Q6.2,2.2 3,2.6Q-2,3.4 -7,1.6Z", fill: PAPER, "stroke-width": 1 }), g);
    el("path", dl({ d: "M3.4,-0.8Q3.6,-6.6 -0.6,-10.6L-1.6,-8.8L-2.9,-9L-3.2,-7L-4.5,-6.9L-4.3,-4.9L-5.4,-4.3Q-3.2,-1.6 -0.8,-0.6Z", fill: PAPER, "stroke-width": 1 }), g);
    el("path", dl({ d: "M2.4,-2.6Q1.6,-5.6 -0.6,-8M0.8,-1.6Q-0.6,-4.2 -2.8,-6", fill: "none", "stroke-width": 0.5, opacity: 0.8 }), g);
    el("circle", { cx: 6.4, cy: -1.1, r: 0.45, fill: DOVE_COLOR }, g);
  }
  // Size of the dove on the map (screen units; the dove sketch was drawn at 1.5 times) and radius of the gap in the line
  const DOVE_SCALE = 1.5, DOVE_GAP = 20;
  // Plan step 4.5: drawing of a bridge after the approved sketch skizzen/bridges.js (user, 2026-10-22). Plan view of the
  // deck as before (any direction), filled opaquely in the colour of the buildings; from magnification Z_ARCH on also the
  // south face seen obliquely, with nearly semicircular arches over the water: the face reaches at most FACE_MAX deck
  // widths below the deck, the arches are as many as needed for that (at least three), the piers have a flat foot a
  // little wider than the pier. The deck is straight; the near wing wall flares outwards, the far wing wall runs parallel
  // to it. A large bridge (half deck width from BRIDGE_LARGE on) has a double parapet and blunt cutwaters on the far side.
  // A bridge under construction has both ends finished up to a pier and only the piers and a dashed outline in the middle
  // field; a construction plan is dashed throughout, without fill and without arches. Drawn in screen coordinates from
  // the bank point A to the bank point Z; o: { stage, hw (half deck width), large, ramp (beyond the banks), arches, sw }.
  // Returns the depth of the face below the deck (0 without arches) and the side on which it is seen.
  const Z_ARCH = 2, BRIDGE_LARGE = 7.75, ARCHES = false;   // ARCHES: arches off for now (user, 2026-10-22, todo B61)
  function bridgeArt(g, A, Z, o) {
    const hw = o.hw, sw = o.sw, water = Math.max(1, Math.hypot(Z.x - A.x, Z.y - A.y));
    const u = { x: (Z.x - A.x) / water, y: (Z.y - A.y) / water }, d = { x: -u.y, y: u.x };
    const low = d.y >= 0 ? 1 : -1;   // side of the deck that lies lower in the picture: its face is visible
    const ramp = o.ramp, pw = hw * 0.32, ext = hw * 0.55;   // ramp beyond the banks, half width of a pier, cutwater
    const SPRING = 0.75, CROWN = 0.12, FACE_MAX = 1.25, halfMax = FACE_MAX * 2 * hw * (SPRING - CROWN);
    const spans = Math.max(3, Math.ceil(water / (2 * halfMax + 2 * pw))), half = (water / spans - 2 * pw) / 2;
    const v = { x: 0, y: Math.max(hw * 0.85, half / (SPRING - CROWN)) };
    const P = (t, off, dv) => ({ x: A.x + u.x * t + d.x * off + (dv ? v.x * dv : 0), y: A.y + u.y * t + d.y * off + (dv ? v.y * dv : 0) });
    const xy = (q) => f(q.x) + "," + f(q.y);
    const seg = (a, b, off, dv) => { const m = Math.max(2, Math.ceil((b - a) / 5)), out = []; for (let i = 0; i <= m; i++) out.push(P(a + (b - a) * i / m, off, dv)); return out; };
    const path = (pts, close) => "M" + pts.map(xy).join("L") + (close ? "Z" : "");
    const t0 = -ramp, t1 = water + ramp, n = spans - 1, sup = [];
    for (let k = 1; k <= n; k++) sup.push(water * k / (n + 1));   // piers along the water
    const supports = [0].concat(sup, [water]);
    const mid = Math.floor((n - 2) / 2);   // the open field of a bridge under construction lies between the piers mid and mid + 1
    const built = o.stage === "fertig" ? [[t0, t1]] : o.stage === "imbau" ? [[t0, sup[mid]], [sup[mid + 1], t1]] : [];
    const gaps = o.stage === "imbau" ? [[sup[mid], sup[mid + 1]]] : o.stage === "bauplan" ? [[t0, t1]] : [];
    const ink = (extra) => Object.assign({ stroke: INK, "stroke-width": sw, "stroke-linejoin": "round", "stroke-linecap": "round" }, extra);
    const dash = { "stroke-dasharray": "3 2.5", "stroke-linecap": "butt" };
    const plan = o.stage === "bauplan", arches = !!o.arches && !plan && half > 1;
    // 1 light halo under the deck of the built parts only
    built.forEach(([a, b]) => el("path", { d: path(seg(a - hw, b + hw, -hw * 1.3).concat(seg(a - hw, b + hw, hw * 1.3).reverse()), true), fill: LIGHT, opacity: 0.8 }, g));
    // 2 cutwaters of the piers on the far side, blunt, pointing up and down the water
    const cut = (t, side) => [P(t - pw, side * hw), P(t - pw * 0.45, side * (hw + ext)), P(t + pw * 0.45, side * (hw + ext)), P(t + pw, side * hw)];
    if (o.large) sup.forEach((t) => el("path", ink(Object.assign({ d: path(cut(t, -low), true), fill: plan ? "none" : PAPER }, plan ? dash : {})), g));
    if (!plan && !arches) gaps.forEach(([a, b]) => sup.filter((t) => t >= a - 0.1 && t <= b + 0.1).forEach((t) =>
      el("path", ink({ d: path([P(t - pw, -hw), P(t + pw, -hw), P(t + pw, hw), P(t - pw, hw)], true), fill: PAPER }), g)));
    if (arches) {
      // 3 south face, opaque in the colour of the buildings; the arch openings show the water
      const fw = pw * 1.35, rise = (r0, r1) => (r1 - r0) / 2 / v.y * 4 / 3;   // pier foot; control height of a semicircle
      built.forEach(([a, b]) => {
        let dd = path([P(a, low * hw), P(a, low * hw, 1)]) + path([P(b, low * hw), P(b, low * hw, 1)]), holes = "";
        for (let k = 0; k < supports.length - 1; k++) {
          const l = supports[k] + (k ? pw : 0), r = supports[k + 1] - (k + 1 < supports.length - 1 ? pw : 0);
          if (l < a - 0.1 || r > b + 0.1) continue;
          const L0 = P(l, low * hw, 1), Ls = P(l, low * hw, SPRING), Rs = P(r, low * hw, SPRING), R0 = P(r, low * hw, 1), kc = rise(l, r);
          const arch = `M${xy(L0)}L${xy(Ls)}C${xy(P(l, low * hw, SPRING - kc))} ${xy(P(r, low * hw, SPRING - kc))} ${xy(Rs)}L${xy(R0)}`;
          dd += arch; holes += arch + "Z";
        }
        el("path", { d: path(seg(a, b, low * hw).concat(seg(a, b, low * hw, 1).reverse()), true) + holes, fill: PAPER, "fill-rule": "evenodd" }, g);
        sup.filter((t) => t > a && t < b).forEach((t) => (dd += path([P(t - fw, low * hw, 1), P(t + fw, low * hw, 1)])));
        [[a, a === t0 ? 0 : a + pw], [b === t1 ? water : b - pw, b]].forEach(([x0, x1]) => (dd += path([P(Math.min(x0, x1), low * hw, 1), P(Math.max(x0, x1), low * hw, 1)])));
        el("path", ink({ d: dd, fill: "none", "stroke-width": sw * 0.8 }), g);
      });
      gaps.forEach(([a, b]) => sup.filter((t) => t >= a - 0.1 && t <= b + 0.1).forEach((t) => {
        el("path", { d: path([P(t - pw, low * hw), P(t + pw, low * hw), P(t + pw, low * hw, 1), P(t - pw, low * hw, 1)], true), fill: PAPER }, g);
        el("path", ink({ d: path([P(t - pw, low * hw), P(t - pw, low * hw, 1)]) + path([P(t + pw, low * hw), P(t + pw, low * hw, 1)]) + path([P(t - fw, low * hw, 1), P(t + fw, low * hw, 1)]), fill: "none", "stroke-width": sw * 0.8 }), g);
        el("path", ink({ d: path([P(t - pw, -hw), P(t + pw, -hw), P(t + pw, hw), P(t - pw, hw)], true), fill: PAPER }), g);
      }));
    }
    // 4 deck of the built parts, parapets, wing walls at the banks
    const wings = (t, sg, extra) => {
      const nearStart = P(t, low * hw), nearEnd = P(t + sg * hw * 1.4, low * hw * 2), farStart = P(t, -low * hw);
      const farEnd = { x: farStart.x + nearEnd.x - nearStart.x, y: farStart.y + nearEnd.y - nearStart.y };
      [[nearStart, nearEnd], [farStart, farEnd]].forEach((q) => el("path", ink(Object.assign({ d: path(q), fill: "none" }, extra || {})), g)); };
    built.forEach(([a, b]) => {
      el("path", { d: path(seg(a, b, -hw).concat(seg(a, b, hw).reverse()), true), fill: PAPER }, g);
      const lines = [[-hw, hw]].concat(o.large ? [[-hw + 1.8, hw - 1.8]] : []);
      lines.forEach(([p0, q0], i) => el("path", ink({ d: path(seg(a, b, p0)) + path(seg(a, b, q0)), fill: "none", "stroke-width": i ? sw * 0.6 : sw }), g));
      if (a === t0) wings(t0, -1); if (b === t1) wings(t1, 1);
    });
    // 5 dashed outline of the parts not built
    gaps.forEach(([a, b]) => el("path", ink(Object.assign({ d: path(seg(a, b, -hw)) + path(seg(a, b, hw)), fill: "none" }, dash)), g));
    if (plan) { wings(t0, -1, dash); wings(t1, 1, dash); }
    return { depth: arches ? v.y : 0, low, spans };
  }
  // Water strip for the rows of the bridges in the legend
  function legendWater(g) {
    el("rect", { x: -23, y: -16, width: 46, height: 32, fill: "#f1e7cc" }, g); el("rect", { x: -12, y: -16, width: 24, height: 32, fill: SEA }, g);
    el("path", { d: "M-12,-16V16M12,-16V16", stroke: BANK, "stroke-width": 1, fill: "none" }, g);
  }
  function drawFlag(e) {
    if (e.flagG) { e.flagG.remove(); e.flagG = null; }
    if (!hasFlag(e.n, flagKind)) { e.withFlag = false; return; }
    e.withFlag = true;
    const g = el("g", {}, e.g), sp = e.tip, tall = 16;
    el("line", { x1: sp.x, y1: sp.y, x2: sp.x, y2: sp.y - tall, stroke: INK, "stroke-width": 1.1 }, g);
    el("path", { d: `M${f(sp.x)},${f(sp.y - tall)}l11,3l-11,3.5Z`, fill: RED, stroke: INK, "stroke-width": 0.6 }, g);
    e.flagG = g;
  }
  function drawSymbol(e) {
    const n = e.n, s = e.s, g = el("g", { class: "element" }, layerSymbols);
    g.style.display = "none"; g.classList.add("aus"); e.g = g; e.uiState = 0;
    g.addEventListener("transitionend", (ev) => { if (ev.target === g && e.uiState === 2) { g.style.display = "none"; e.uiState = 0; } });
    el("ellipse", { cx: 0, cy: 0, rx: s * 1.1 + 3, ry: s * 0.85 + 3, fill: "transparent", stroke: "none" }, g);
    let tip = { x: 0, y: -s }, box = { x0: -s * 1.1, x1: s * 1.1, y0: -s, y1: s * 0.45 + 3 };
    if (n.kind === "bruecke") {
      // Draft 10: the bridge itself is drawn in screen coordinates for each frame (updateBridges); here only the
      // element for selection and the name
      tip = { x: 0, y: -s }; box = { x0: -s, x1: s, y0: -s, y1: s };
    } else if (n.kind === "gebaeude") {   // theory: city (plan step 4.5); its name appears only in the hover box
      const size = citySize(s), seed = citySeed(n), cb = cityBox(s, size, seed);
      el("rect", { x: cb.x0, y: cb.y0, width: cb.x1 - cb.x0, height: cb.y1 - cb.y0, fill: "transparent", stroke: "none" }, g);   // click area
      SY.city(g, s, size, seed, false);
      g.setAttribute("data-symbol", "city"); g.setAttribute("data-size", size);
      tip = { x: 0, y: cb.y0 }; box = cb;
    } else if (n.kind === "kueste") {   // programme: dashed outline (the key "kueste" is kept from the model)
      el("path", { d: T.smooth([[-s * 1.8, 0], [-s, -s * 0.9], [s * 0.4, -s * 0.8], [s * 1.8, -s * 0.1], [s * 1.1, s * 0.8], [-s * 0.6, s * 0.7], [-s * 1.8, 0]]),
        fill: "none", stroke: INK, "stroke-width": 1.3, "stroke-dasharray": "5 3" }, g);
      g.setAttribute("data-symbol", "programme");
      tip = { x: 0, y: -s * 0.9 }; box = { x0: -s * 1.8, x1: s * 1.8, y0: -s * 0.9, y1: s * 0.8 };
    } else {   // theorem, open conjecture, refuted conjecture: building of the stage of its level (plan step 4.5)
      const parts = partsOf(n, e.level), bg = el("g", { transform: `translate(0 ${f(BUILDING_FOOT * s)})` }, g);
      if (isConjecture(n)) SY.conjecture(bg, s, parts, SYM_REF); else SY.building(bg, s, parts);
      box = buildingBox(n, parts, s, BUILDING_FOOT * s);
      e.body0 = isConjecture(n) ? buildingBox({ kind: "berg" }, parts, s, BUILDING_FOOT * s) : box;   // todo B73: without the question mark
      g.setAttribute("data-symbol", isConjecture(n) ? "conjecture" : n.kind === "trugbild" ? "ruin" : "building");
      g.setAttribute("data-stage", stageOf(e.level));
      tip = { x: 0, y: box.y0 + 1 };
    }
    e.tip = tip; e.box0 = box;
    hint.set(g, { key: n.key });
    selectable.set(g, n.key);
    // No tents for partial results any more (Konzept/04 dropped the high camp, todo B43.2): a partial result is a
    // building of its own, listed under "Beziehungen" in the info box and shown as a member of the chain.
    drawFlag(e);
  }
  const FS = { 1: [16, "bold"], 2: [13.5, "bold"], 3: [12.5, "normal"], 4: [11.5, "normal"] };
  function drawName(e) {
    const n = e.n, [fs, w0] = FS[e.level];
    // Names of theories (hill ranges) are never bold (user, 2026-10-20)
    const weight = n.kind === "gebaeude" ? "normal" : w0;
    // Names upright for all kinds: the cloud cap already marks a conjecture (user's decision, 20 October 2026)
    const attrs = { "font-weight": weight, "font-style": "normal" };
    const g = el("g", { class: "bname aus", "data-k": n.key }, layerCNames);
    // Long names in several lines (todo B12 b); the first baseline lies at y = 0
    const textLines = wrapName(shortName(n), attrs);
    textLines.forEach((z, i) => font(z, Object.assign({ x: 0, y: f(i * LH * REF), "font-size": REF, "text-anchor": "middle", "stroke-width": 0.3 * REF }, attrs), g));
    e.lab = g; e.fs = fs; e.lw = Math.max(...textLines.map((z) => measureText(z, attrs))); e.nl = textLines.length; e.labAt = false;
    e.lead = el("line", { stroke: INK, "stroke-width": 1, opacity: 0.75, display: "none" }, layerGuide); e.leadAt = false;
    hint.set(g, { key: n.key });
    selectable.set(g, n.key);
  }
  // ------------------------------------------------------------ Trees and forests (plan step 2.2)
  // Tree (concept): a round crown of ink scallops on a short trunk, in pen and ink like the mountains, hatched on the east
  // side, with a short ground line; drawn inside TREE_BOX for size s with the foot at (0, 0). The lobes of the crown are
  // turned a little per tree (seed), so that a forest does not look stamped.
  const TREE_INK = "#2f4a24", FOREST_INK = "#2f4a24", FOREST_GROUND = "#6f8a4a";
  function treeSymbol(g, s, seed) {
    const rnd = T.random(seed || 7), cyc = -0.7 * s, rx = 0.47 * s, ry = 0.33 * s, n = 9, a0 = rnd() * 2 * Math.PI / n, bulge = 1.2;
    const pts = []; for (let i = 0; i < n; i++) { const a = a0 + i * 2 * Math.PI / n, k = 0.94 + 0.1 * rnd(); pts.push([Math.cos(a) * rx * k, cyc + Math.sin(a) * ry * k, a]); }
    let d = "M" + f(pts[0][0]) + "," + f(pts[0][1]);
    pts.forEach((q, i) => { const r = pts[(i + 1) % n], am = q[2] + Math.PI / n;
      d += "Q" + f(Math.cos(am) * rx * bulge) + "," + f(cyc + Math.sin(am) * ry * bulge) + " " + f(r[0]) + "," + f(r[1]); });
    const sw = 0.7 + s / 60;
    el("path", { d: `M${f(-0.45 * s)},${f(0.22 * s)}h${f(0.9 * s)}`, stroke: INK, "stroke-width": 0.6, opacity: 0.5 }, g);
    el("path", { d: `M${f(-0.07 * s)},${f(0.2 * s)}L${f(-0.045 * s)},${f(-0.4 * s)}L${f(0.045 * s)},${f(-0.4 * s)}L${f(0.07 * s)},${f(0.2 * s)}Z`, fill: PAPER, stroke: INK, "stroke-width": sw * 0.8, "stroke-linejoin": "round" }, g);
    el("path", { d: d + "Z", fill: PAPER, stroke: INK, "stroke-width": sw, "stroke-linejoin": "round" }, g);
    // hatching on the east side of the crown, as on the east slopes of the mountains
    let h = ""; [[0.12, 0.05], [0.24, 0.0], [0.33, -0.08]].forEach(([x, dy]) => { h += `M${f(x * s)},${f(cyc + (0.02 + dy) * s)}l${f(0.05 * s)},${f(0.17 * s)}`; });
    el("path", { d: h, stroke: INK, "stroke-width": 0.5, opacity: 0.75, "stroke-linecap": "round" }, g);
  }
  const treeOf = new WeakMap();
  const plainName = (t) => String(t || "").replace(/<[^>]+>/g, "");
  function buildTrees() {
    TREES.forEach((t) => {
      const g = el("g", { class: "element baum", "data-tree": t.ckey }, layerSymbols);
      g.style.display = "none"; g.classList.add("aus"); t.g = g; t.uiState = 0;
      g.addEventListener("transitionend", (ev) => { if (ev.target === g && t.uiState === 2) { g.style.display = "none"; t.uiState = 0; } });
      const s = t.s;
      el("rect", { x: TREE_BOX.x0 * s, y: TREE_BOX.y0 * s, width: (TREE_BOX.x1 - TREE_BOX.x0) * s, height: (TREE_BOX.y1 - TREE_BOX.y0) * s, fill: "transparent", stroke: "none" }, g);
      treeSymbol(g, s, T.hash(t.ckey));
      t.box0 = { x0: TREE_BOX.x0 * s, x1: TREE_BOX.x1 * s, y0: TREE_BOX.y0 * s, y1: TREE_BOX.y1 * s };
      hint.set(g, { concept: t.ckey }); treeOf.set(g, t.ckey);
      // Name (only from a magnification at which it finds room, placed like the names of the mountains, close to the symbol)
      t.n = { kind: "baum", name: plainName(t.c.name) }; t.level = 4;
      const attrs = { "font-weight": "normal", "font-style": "normal", style: "fill:" + TREE_INK };
      const lg = el("g", { class: "bname aus", "data-k": t.key }, layerCNames);
      const lines = wrapName(t.n.name, attrs);
      lines.forEach((z, i) => font(z, Object.assign({ x: 0, y: f(i * LH * REF), "font-size": REF, "text-anchor": "middle", "stroke-width": 0.3 * REF }, attrs), lg));
      t.lab = lg; t.lw = Math.max(...lines.map((z) => measureText(z, attrs))); t.nl = lines.length; t.labAt = false;
      t.lead = el("line", { stroke: INK, "stroke-width": 1, opacity: 0.75, display: "none" }, layerGuide); t.leadAt = false;
      hint.set(lg, { concept: t.ckey }); treeOf.set(lg, t.ckey);
    });
  }
  // Names of the trees appear only from this magnification on (and from 1.25 times the magnification of the symbol)
  const TREE_NAME_Z = 2, TREE_FS = 11;

  // ------------------------------------------------------------ Legend to the right of the map (todo B14)
  // Per entry: symbol and meaning; the name in the list only serves the readability of the code. The symbols are
  // drawn with the same functions as the map. The meanings follow Konzept/04; the status
  // of the decisions is shown below the map.
  function legendSide() {
    const target = document.getElementById("legende-seite");
    const nsk = { "vector-effect": "non-scaling-stroke", fill: "none" };
    const stroke = (g, attrs) => el("path", Object.assign({ fill: "none", "stroke-linecap": "round" }, attrs), g);
    const route = (g, red) => {
      stroke(g, { d: "M-19,4Q-4,-6 13,0", stroke: LIGHT, "stroke-width": 4.6, opacity: 0.8 });
      stroke(g, { d: "M-19,4Q-4,-6 13,0", stroke: red, "stroke-width": 2 });
      stroke(g, { d: "M-14.6,-1.4L-11.6,0.6L-14.0,3.4", stroke: red, "stroke-width": 1.4, "stroke-linejoin": "round" });
      el("path", { d: "M19,2L12.6,-3.1L14.0,0.2L11.6,3.3Z", fill: red, stroke: LIGHT, "stroke-width": 0.6, "paint-order": "stroke" }, g);
    };
    const region = (g, color, frame) => el("rect", { x: -20, y: -11, width: 40, height: 22, fill: color, opacity: color === PAPER ? 1 : 0.5, stroke: frame || "none", "stroke-width": 0.8, "stroke-dasharray": frame ? "2 2" : "none" }, g);
    const groups = [
      ["Gebiete", [
        // Plan 4.5, follow-up 3 (user, 2026-10-22, todo B68): the rows "Land" (main area of the MSC) and "Weißer Fleck"
        // (no data) are left out; the subarea border without the note on the three-character MSC classes
        [(g) => { stroke(g, Object.assign({ d: "M-20,0H20", stroke: "#8a3a2a", "stroke-width": 5, opacity: 0.18 }, nsk)); stroke(g, { d: "M-20,0H20", stroke: INK, "stroke-width": 1.8, "stroke-dasharray": "9 3 2 3", "stroke-linecap": "butt", opacity: 0.9 }); }, "Grenze", "Grenze zwischen zwei Ländern"],
        [(g) => stroke(g, { d: "M-20,0H20", stroke: INK, "stroke-width": 1.1, "stroke-dasharray": "1.5 3.5", opacity: 0.75 }), "Provinz", "Grenze zwischen Provinzen"],
      ]],
      ["Sätze und Vermutungen", [
        // Plan step 4.5 (user, 2026-10-22): building, building with a question mark, ruin, programme, city, bridges
        [(g) => SY.building(el("g", { transform: "translate(-1 10)" }, g), 16, SY.BUILDINGS.B[2]), "Gebäude", "bewiesener Satz; Größe nach Bedeutung"],
        [(g) => SY.conjecture(el("g", { transform: "translate(-1 13)" }, g), 13, SY.BUILDINGS.B[3], 1.6), "Gebäude mit Fragezeichen", "offene Vermutung"],
        [(g) => SY.building(el("g", { transform: "translate(-1 9)" }, g), 16, SY.unroofed(SY.BUILDINGS.B[3])), "Ruine", "widerlegte Vermutung"],
        ...(PROGRAMMES_SHOWN ? [[(g) => el("path", { d: T.smooth([[-19, 2], [-11, -7], [3, -7], [19, -1], [12, 7], [-6, 7], [-19, 2]]), fill: "none", stroke: INK, "stroke-width": 1.3, "stroke-dasharray": "5 3" }, g), "Gestrichelter Umriss", "Programm: Forschungsprogramm ohne einzelne präzise Aussage"]] : []),
        [(g) => SY.city(el("g", { transform: "translate(-2 -2)" }, g), 26, "klein", 7, false), "Stadt", "Theorie, die in Beweisen als Ganzes vorausgesetzt wird; ihr Name erscheint beim Überfahren"],
        // Bridge and construction plan, drawn with the function of the map (without arches, as on the map)
        [(g) => { legendWater(g); bridgeArt(g, { x: -12, y: 0 }, { x: 12, y: 0 }, { stage: "fertig", hw: 4.2, large: false, ramp: 2.5, arches: ARCHES, sw: 0.8 }); }, "Brücke", "Bewiesene Korrespondenz"],
        [(g) => { legendWater(g); bridgeArt(g, { x: -12, y: 0 }, { x: 12, y: 0 }, { stage: "bauplan", hw: 4.2, large: false, ramp: 2.5, arches: false, sw: 0.8 }); }, "Bauplan", "Vermutete Korrespondenz(en)"],   // todo B68
      ]],
      // Plan step 2.2: concepts (hidden with TREES_ENABLED false, plan 4.5, follow-up 3; see the filter below)
      ["Begriffe", [
        [(g) => treeSymbol(el("g", { transform: "translate(0 9)" }, g), 18, 3), "Baum", "Begriff (Definition); Größe nach der Zahl der Sätze, in deren Aussage er vorkommt"],
        [(g) => { el("ellipse", { cx: 0, cy: 0, rx: 21, ry: 14, fill: FOREST_GROUND, opacity: 0.3 }, g);
          [[-10, 6, 11, 1], [3, 3, 13, 2], [12, 9, 10, 4], [-2, 13, 9, 5]].forEach(([x, y, sz, sd]) => treeSymbol(el("g", { transform: `translate(${x} ${y})` }, g), sz, sd)); },
          "Wald", "Wald: mindestens fünf Begriffe einer Provinz, die über Definitionen zusammenhängen"],
      ]],
      ["Beim gewählten Satz", [
        [(g) => el("circle", { cx: 0, cy: 0, r: 4.2, fill: RED, stroke: LIGHT, "stroke-width": 1 }, g), "Beweispunkt, gefüllt", "gezeigter Beweis eines Satzes (fehlt bei einem einzigen Beweis mit einer Voraussetzung)"],
        [(g) => el("circle", { cx: 0, cy: 0, r: 4.2, fill: PAPER, stroke: RED, "stroke-width": 1.6 }, g), "Beweispunkt, hohl", "weiterer Beweis; ein Klick zeigt ihn"],
        [(g) => route(g, RED), "Route", "im Beweis verwendet"],   // todo B68: after the proof points
        [(g) => { const n = (x) => el("path", { d: x, stroke: DOVE_COLOR, "stroke-width": 1.6, "stroke-dasharray": "1.5 5", "stroke-linecap": "round", fill: "none" }, g);
          n("M-22,0H-13"); n("M13,0H22"); dove(el("g", { transform: "scale(0.9)" }, g)); }, "Taube", "Analogie ohne logische Abhängigkeit"],
      ]],
      // Plan step 3.2 (todo B67, Konzept/04): the whole route network under the switch "dependencies", pale, width by class
      ["Alle Abhängigkeiten", [
        [(g) => { const n = el("g", { opacity: NET_OPACITY, fill: "none", stroke: RED, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
          stroke(n, { d: "M-21,-8H-8L2,2H21", "stroke-width": NET_WIDTH[1], stroke: RED });
          stroke(n, { d: "M-21,9H-12L-2,2", "stroke-width": NET_WIDTH[3], stroke: RED });
          stroke(n, { d: "M10,2L18,-8", "stroke-width": NET_WIDTH[4], stroke: RED }); },
          "Wegenetz", "alle Routen der gezeigten Beweise, gebündelt; Strichstärke nach der Zahl der Beweisketten. Ein durchgehender Weg ist keine Beweiskette"],
      ]],
    ];
    target.innerHTML = `<h2>${U("Legende")}</h2>`;
    groups.filter(([title]) => (TREES_ENABLED || title !== "Begriffe") && (NETWORK_SHOWN || title !== "Alle Abhängigkeiten")).forEach(([title, entriesList]) => {   // follow-up 3: no concepts while deferred
      const h = document.createElement("h3"); h.textContent = U(title); target.appendChild(h);
      entriesList.forEach(([drawIt, name, isCond]) => {
        const row = document.createElement("div"); row.className = "eintrag"; row.setAttribute("data-name", name === "Taube" ? U(name) : name);   // names of the symbols are not shown, only for tests
        const sv = document.createElementNS(T.NS, "svg"); sv.setAttribute("viewBox", "-23 -16 46 32"); sv.setAttribute("class", "karte-e8"); sv.setAttribute("aria-hidden", "true");
        drawIt(sv); row.appendChild(sv);
        // Only the meaning, no name of the symbol (user's decision, 20 October 2026)
        const t = document.createElement("div"); t.className = "bed"; t.textContent = U(isCond); row.appendChild(t);
        target.appendChild(row);
      });
    });
  }
  legendSide();

  let scaleTicks = null;
  // Todo B73 (user, 2026-10-22: "as early as possible, without guessing"): every building (theorem, conjecture, ruin) and
  // every city appears at the smallest magnification of the sequence 1, Z_STEP, Z_STEP^2 … at which (1) its symbol covers
  // no symbol shown and no bridge with its name on the deck, (2) a single building stands at least one building width from
  // every other single building (as in the layout), and (3) its name finds a place directly at the symbol, without a
  // leader line, with the rules of draw (placeMountain, names of countries and provinces, cartouche at magnification 1;
  // the probe lays out the whole map centred, for magnifications above 1 without the frame of the window). A city has no
  // name; for it only the symbol counts. The weight only sets the order when space is short: at each magnification the
  // hidden elements are tried in the order of weight, and a hidden element keeps its place free from the lighter ones. An
  // element whose name finds no place gets room once by letting the lighter new elements near it wait; if that does not
  // help, a new element waits with them (for an element already shown they come back). Bridges keep their threshold from
  // meaning(). Computed once per measure and window size (k0); elements without a place up to Z_CAP appear at Z_CAP.
  const Z_STEP = 1.1, Z_CAP = Z_MAX * 0.85;
  let thresholdStats = null, thresholdTimer = 0;
  function computeThresholds() {
    if (!Wv || !E.length) return;
    const t0 = performance.now();
    if (BR.some((B) => !B.g)) BR.slice().sort((a, b) => a.c.y - b.c.y).forEach((B) => { if (!B.g) buildBridge(B); });   // name widths of the decks
    const saved = { z, cx, cy, chain, shown: Object.assign({}, shown), filterKind };
    chain = null; filterKind = ""; Object.assign(shown, SHOWN_DEFAULT); cx = K0.CX; cy = K0.CY;
    const houses = E.filter((e) => e.n.kind !== "bruecke").sort((a, b) => b.we - a.we || (a.key < b.key ? -1 : 1));
    const bridges = E.filter((e) => e.n.kind === "bruecke");
    houses.forEach((e) => { e.zA = Infinity; e.wait = ""; });   // wait: why the element was not shown one step earlier
    const named = (e) => e.n.kind !== "gebaeude", single = (e) => SINGLE.has(e.n.kind);
    const nameOk = (e) => e.slot && !e.guide;
    let draws = 0;
    for (let zz = 1, i = 0; zz <= Z_CAP + 1e-9; zz = Math.pow(Z_STEP, ++i)) {
      const pending = houses.filter((e) => e.zA === Infinity);
      if (!pending.length) break;
      z = zz;
      const k = k0 * zz, sym = k0 * Math.pow(zz, P), tx = Wv / 2 - cx * k, ty = Hv / 2 - cy * k;
      const image = zz === 1 ? null : { x0: Wv / 2 - K0.RX * 1.3 * k, x1: Wv / 2 + K0.RX * 1.3 * k, y0: Hv / 2 - K0.RY * 1.3 * k, y1: Hv / 2 + K0.RY * 1.3 * k };
      const boxAt = (e, b) => { const X = e.x * k + tx, Y = e.y * k + ty; return { x0: X + b.x0 * sym, x1: X + b.x1 * sym, y0: Y + b.y0 * sym, y1: Y + b.y1 * sym, e }; };
      // 1 Symbols: the boxes of the visible bridges (with the name on the deck) and of the elements shown so far; then the
      // hidden elements in the order of weight, each if it covers none of these boxes and none of the new ones before it
      const fixed = [];
      bridges.filter((e) => e.zA <= zz + 1e-9).forEach((e) => { const B = BR.find((q) => q.n.key === e.key); if (!B) return;
        const G = bridgeGeometry(B, k, tx, ty), xs = G.pts.map((q) => q.x), ys = G.pts.map((q) => q.y);
        fixed.push({ x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }, deckNameBox(B, G.hw, G.u, G.E0, G.E1)); });
      const old = houses.filter((e) => e.zA <= zz);
      const symbolsFit = (excluded) => {
        // a hidden element keeps its place free for the lighter ones: they may not take it before it appears
        const placed = boxIndex(fixed), bare = boxIndex([]), trial = [];
        const add = (e) => { placed.push(boxAt(e, e.box0)); if (single(e)) bare.push(boxAt(e, e.body0 || e.box0)); };
        old.forEach(add);
        pending.forEach((e) => {
          if (excluded.has(e)) { add(e); return; }
          const b = boxAt(e, e.box0), hit = placed.near(b)[0];
          if (hit) { e.wait = "covers " + (hit.e ? hit.e.key : "a bridge"); add(e); return; }
          if (single(e)) { const q = boxAt(e, e.body0 || e.box0), wq = q.x1 - q.x0;
            // a conflicting box lies closer than wq, so it meets q widened by wq
            const near = bare.near({ x0: q.x0 - wq, x1: q.x1 + wq, y0: q.y0 - wq, y1: q.y1 + wq }).find((o) => gapOf(q, o) < Math.min(wq, o.x1 - o.x0));
            if (near) { e.wait = "closer than a building width to " + near.e.key; add(e); return; } }
          trial.push(e); add(e);
        });
        return trial;
      };
      // 2 Names: lay out the map with the old and the new elements. An element without a name next to its symbol (new, or
      // old and lost) first gets room once: the lighter new elements whose symbols lie where its name could stand wait.
      // If that does not help, a new element waits for the next magnification and the lighter ones wait with it (at the
      // next magnification they are tried again); for an old element they come back.
      const excluded = new Map(), helped = new Map(), oldNamed = old.filter(named);
      let trial = [];
      for (let it = 0; it < 8; it++) {
        trial = symbolsFit(excluded);
        if (!trial.length) break;
        const set = new Set(trial);
        draw({ visible: (e) => (e.n.kind === "bruecke" ? e.zA <= zz + 1e-9 : e.zA <= zz || set.has(e)), image, cartouche: zz === 1 }); draws++;
        const failing = oldNamed.filter((e) => e.inImage && !nameOk(e)).concat(trial.filter((e) => named(e) && !nameOk(e))).sort((a, b) => b.we - a.we);
        if (!failing.length) break;
        let changed = false;
        failing.forEach((f) => {
          if (excluded.has(f)) return;
          if (!helped.has(f)) {
            // the area in which the name of f could stand next to its symbol
            const fs = FS[f.level][0] * clamp(1 + 0.1 * Math.log2(zz), 1, 1.35), w = f.lw * fs / REF, h = (ASC + (f.nl - 1) * LH + DESC) * fs;
            const kb = f.box, zone = kb && { x0: kb.x0 - w - 6, x1: kb.x1 + w + 6, y0: kb.y0 - h - 6, y1: kb.y1 + h + 6 };
            const lighter = zone ? trial.filter((t) => t !== f && !excluded.has(t) && t.we < f.we && t.box && intersects(zone, t.box)) : [];
            helped.set(f, lighter);
            if (lighter.length) { lighter.forEach((t) => { excluded.set(t, f); t.wait = "makes room for the name of " + f.key; }); changed = true; return; }
          } else if (!set.has(f)) helped.get(f).forEach((t) => { if (excluded.get(t) === f) { excluded.delete(t); changed = true; } });
          if (set.has(f)) { excluded.set(f, null); f.wait = "no place for the name"; changed = true; }
        });
        if (!changed) break;
      }
      trial.filter((e) => !named(e) || nameOk(e)).forEach((e) => (e.zA = zz));
    }
    houses.forEach((e) => { if (e.zA === Infinity) e.zA = Z_CAP; });
    z = saved.z; cx = saved.cx; cy = saved.cy; chain = saved.chain; filterKind = saved.filterKind; Object.assign(shown, saved.shown);
    E.rank = E.slice().sort((a, b) => b.w - a.w || a.zA - b.zA);
    thresholdStats = { ms: Math.round(performance.now() - t0), draws, k0, capped: houses.filter((e) => e.zA >= Z_CAP).length };
  }
  function setMeasure(m) {
    measure = MEASURES[m] ? m : "nutzer";
    if (byId("mass")) byId("mass").value = measure;
    const B = meaning(measure); scaleTicks = B;
    layerSymbols.innerHTML = ""; layerCNames.innerHTML = ""; layerGuide.innerHTML = ""; E.length = 0;
    // Plan step 4.5: a counterexample has no symbol and is no element of the map (it stays in the computation of the
    // thresholds, as in the layout of plan step 1.4); it appears in the info box of the refuted conjecture
    nodes.slice().sort((a, b) => placement[a.key].y - placement[b.key].y).forEach((n) => {
      if (n.kind === "ungeheuer") return;
      if (n.kind === "kueste" && !PROGRAMMES_SHOWN) return;   // plan 4.5, follow-up 3: programmes suspended (B66)
      const r = B.R[n.key], e = { n, key: n.key, x: placement[n.key].x, y: placement[n.key].y, w: r.w, we: r.we, s: r.s, zA: r.zA, level: r.level };
      E.push(e); EK[n.key] = e;
      drawSymbol(e); drawName(e);
    });
    E.rank = E.slice().sort((a, b) => b.w - a.w || a.zA - b.zA);
    computeThresholds();   // todo B73
    buildTrees();   // plan step 2.2: the layers were cleared above
    if (selected) rebuild(); else request();
  }
  function setShown(fresh) {
    Object.keys(fresh).forEach((a) => { if (a in SHOWN_DEFAULT) shown[a] = !!fresh[a]; });   // plan 4.5: unknown switches (huegel) are ignored
    if (!TREES_ENABLED || !SHOW.definitions) shown.baeume = false;   // follow-up 3; the switch is rendered only with SHOW.definitions
    if (!SHOW.dependencies) shown.netz = false;   // since 2026-10-22 straight lines (updateDeps); the bundled network stays deferred
    Object.keys(shown).forEach((a) => { if (byId("an-" + a)) byId("an-" + a).checked = shown[a]; });
    // Todo B64 (user, 2026-10-22): the switch "subareas" hides only the names of the provinces; the borders stay visible
    forestLayer.setAttribute("display", shown.baeume ? "inline" : "none");
    request(); remember();
  }
  function setFlags(kind) {
    flagKind = kind || "";
    if (byId("fahne")) byId("fahne").value = flagKind;
    E.forEach(drawFlag);
    request(); remember();
  }

  // ------------------------------------------------------------ Routes with direction and proof points
  // Each proof leads from its premises to a proof point (crossroads) at the foot of the theorem's mountain, like the
  // hyperedges of the theorem graphs; a single proof with a single premise is a direct route (todo B29). Lines,
  // direction chevrons, arrowheads and proof points are computed in screen coordinates for each frame, so that points
  // and arrows keep the same size and distance from the mountain at every zoom level.
  // Plan step 3.2: bundled route network of plan step 3.1 (data/route-network.js, variant 4: no rule for pairs,
  // lines in opposite directions bundled as well), drawn only as a whole under the switch "dependencies". With a selected
  // theorem the routes stay direct, slightly curved lines as before (user, 2026-10-22) and the network is hidden.
  const NET = window.E11_ROUTE_NETWORK || { nodes: [], pieces: [], lines: [] };
  const quad = (a, b, kr) => { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y; return { x: mx - dy * kr, y: my + dx * kr }; };
  // Filled proof points (shown proof): point -> proof
  const proofOf = new WeakMap();
  // Hollow proof points (further proofs of a theorem, todo B29): point -> { key, b }
  const altOf = new WeakMap();
  const PR = 4.2;   // radius of a proof point in screen pixels
  // A segment: line, direction chevrons and optional arrowhead, all in screen coordinates (recomputed for each frame).
  // Lines in world coordinates with vector-effect="non-scaling-stroke" were sometimes not drawn at double pixel
  // density. lineColor: colour of the line when all proofs are shown at once (todo B30); color: colour of chevrons and
  // arrowhead.
  function segment(sg, strength, faded, withArrow, color, lineColor) {
    const sgg = el("g", {}, sg), lines = [];
    const lin = (attrs) => lines.push(el("path", Object.assign({ fill: "none" }, attrs), sgg));
    if (!faded || strength > 1) lin({ stroke: LIGHT, "stroke-width": strength + 2.6, opacity: faded ? 0.35 : 0.8, "stroke-linecap": "round" });
    lin({ stroke: lineColor || RED, "stroke-width": strength, opacity: faded ? 0.6 : 1, "stroke-linecap": "round" });
    const col = color || RED;
    const chev = el("path", { fill: "none", stroke: col, "stroke-width": faded ? 1 : 1.4, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: faded ? 0.8 : 1 }, sgg);
    const arrow = withArrow ? el("path", { fill: col, stroke: LIGHT, "stroke-width": 0.6, "paint-order": "stroke" }, sgg) : null;
    return { sgg, chev, arrow, lines };
  }
  // Cubic curve A, C1, C2, B in screen coordinates; chevrons and arrowhead are placed on the visible part between
  // r0 (from A) and r1 (before B).
  function curve(st, A, C1, C2, B, r0, r1) {
    const N = 24, pts = [], len = [0];
    for (let i = 0; i <= N; i++) { const t = i / N, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      pts.push({ x: a * A.x + b * C1.x + c * C2.x + d * B.x, y: a * A.y + b * C1.y + c * C2.y + d * B.y }); if (i) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); }
    const dl = `M${f(A.x)},${f(A.y)}C${f(C1.x)},${f(C1.y)} ${f(C2.x)},${f(C2.y)} ${f(B.x)},${f(B.y)}`;
    st.lines.forEach((p) => p.setAttribute("d", dl));
    const L = len[N], at = (s) => { let i = 1; while (i < N && len[i] < s) i++; const t = (s - len[i - 1]) / ((len[i] - len[i - 1]) || 1), p = pts[i - 1], r = pts[i], l = Math.hypot(r.x - p.x, r.y - p.y) || 1;
      return { x: p.x + (r.x - p.x) * t, y: p.y + (r.y - p.y) * t, ux: (r.x - p.x) / l, uy: (r.y - p.y) / l }; };
    const s0 = r0, s1 = L - r1;
    // Direction chevrons only at the start and the end of the segment (not at the end if the arrowhead is there);
    // on short segments one in the middle.
    let d = "";
    const angle = (s) => { const p = at(s), h = 3.4;
      d += `M${f(p.x - p.ux * h + p.uy * h)},${f(p.y - p.uy * h - p.ux * h)}L${f(p.x)},${f(p.y)}L${f(p.x - p.ux * h - p.uy * h)},${f(p.y - p.uy * h + p.ux * h)}`; };
    if (s1 - s0 >= 60) { angle(s0 + 16); if (!st.arrow) angle(s1 - 16); }
    else if (s1 - s0 >= 24 && !st.arrow) angle((s0 + s1) / 2);
    st.chev.setAttribute("d", d);
    if (st.arrow) {
      if (s1 - s0 < 8) { st.arrow.setAttribute("d", ""); return; }
      const p = at(s1), h = 7, w = 3.6;
      st.arrow.setAttribute("d", `M${f(p.x)},${f(p.y)}L${f(p.x - p.ux * h + p.uy * w)},${f(p.y - p.uy * h - p.ux * w)}L${f(p.x - p.ux * h * 0.7)},${f(p.y - p.uy * h * 0.7)}L${f(p.x - p.ux * h - p.uy * w)},${f(p.y - p.uy * h + p.ux * w)}Z`);
    }
  }
  // Proof point at the foot of the mountain t: filled = shown proof, hollow = further proof (todo B29)
  function proofPoint(b, t, filled, faded, colorOf) {
    const unique = M.K[t].proofs.length === 1, color = colorOf || RED, name = M.K[t].name;
    const pk = el("g", { class: "element" }, pointsSel);
    el("circle", { cx: 0, cy: 0, r: 9, fill: "transparent" }, pk);
    el("circle", { cx: 0, cy: 0, r: filled && faded ? 3.2 : PR, fill: filled ? color : PAPER, stroke: filled ? LIGHT : color, "stroke-width": filled ? 1 : 1.6 }, pk);
    // Hover box of every proof point (todo B52): name of the proof, persons and year (proofCredits), role
    const who = proofCredits(M.K[t]).get(b);
    hint.set(pk, { title: b.name || U("Beweis"), who: who ? personsAnd(who) : U("Personen und Jahr nicht erfasst"), extra: unique ? FM("Einziger Beweis von {0}", name) : filled ? FM("Gezeigter Beweis von {0}", name) : FM("Weiterer Beweis von {0} – Klick zeigt ihn", name) });
    if (filled) proofOf.set(pk, b); else altOf.set(pk, { key: t, b });
    return pk;
  }
  // A drawn proof b of the theorem t. Without a point (one proof with one premise) the route runs directly to the
  // mountain; otherwise each premise leads to the point and a short stub leads from the point to the mountain.
  // Lines from premises that are not members of the chain (other premises of a consequence) are faded.
  // colorOf: colour of the proof when all proofs of the selected mountain are shown at once (todo B30)
  // from: if given, only the routes from these premises are drawn (view of the consequences: only the lines along
  // which the selected theorem contributes, from it or from one of its shown consequences; user's decision of
  // 20 October 2026)
  function proofItem(b, t, strong, kind, colorOf, from) {
    const w = strong ? 2.6 : 1.4, color = colorOf || RED, it = { b, kind, ins: [], stub: null, pk: null };
    if (kind) it.pk = proofPoint(b, t, kind === "filled", !strong, colorOf);
    if (kind === "hollow") return it;
    b.premises.filter((p) => placement[p] && !hiddenNode(p) && (!from || from.has(p))).forEach((p) => {
      const member = chain.has(p);
      it.ins.push({ p, kr: T.hash(p + b.from) % 2 ? 0.12 : -0.12, st: segment(dirSel, member ? w : 1.2, member ? !strong : true, true, color, colorOf) });
    });
    if (kind) it.stub = el("path", { fill: "none", stroke: color, "stroke-width": w, opacity: strong ? 1 : 0.6, "stroke-linecap": "round" }, dirSel);
    return it;
  }
  // Angles of several points of one mountain: sorted and pushed apart to at least d (radians)
  function spread(items, d) {
    const n = items.length; if (n < 2) return;
    items.sort((a, b) => a.a - b.a);
    if (n * d >= 2 * Math.PI) { items.forEach((it, i) => (it.a = items[0].a + i * 2 * Math.PI / n)); return; }
    for (let r = 0; r < 40; r++) { let moved = false;
      for (let i = 0; i < n; i++) { const A = items[i], B = items[(i + 1) % n], gap = B.a - A.a + (i === n - 1 ? 2 * Math.PI : 0);
        if (gap < d - 1e-6) { const m = (d - gap) / 2; A.a -= m; B.a += m; moved = true; } }
      if (!moved) break; }
  }
  // Arrival fan: sorted natural angles r (relative to the direction away from the mountain, within ±90°) spread so that
  // neighbours are at least 25° apart (at most 180° in total), as close as possible to the natural angles
  // (isotonic regression of r_i − i·g by pooling adjacent violators, then clamped into the half plane).
  function fan(r) {
    const n = r.length, g = n > 1 ? Math.min(25 * Math.PI / 180, Math.PI / (n - 1)) : 0, lo = -Math.PI / 2, hi = Math.PI / 2 - (n - 1) * g, bl = [];
    r.forEach((v, i) => { bl.push({ s: v - i * g, c: 1 });
      while (bl.length > 1 && bl[bl.length - 2].s / bl[bl.length - 2].c > bl[bl.length - 1].s / bl[bl.length - 1].c) { const q = bl.pop(); bl[bl.length - 1].s += q.s; bl[bl.length - 1].c += q.c; } });
    const y = []; bl.forEach((q) => { for (let j = 0; j < q.c; j++) y.push(q.s / q.c); });
    return y.map((v, i) => clamp(v, lo, hi) + i * g);
  }
  const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  // Per frame: positions of the points of a mountain, curves of the incoming lines, stubs
  function updateGroup(G, k, tx, ty, sym) {
    const S = (key) => ({ x: placement[key].x * k + tx, y: placement[key].y * k + ty }), C = S(G.key), rT = EK[G.key].n.kind === "bruecke" ? 3 : EK[G.key].s * sym * 0.85, R = rT + 9;
    const rad = (key) => (EK[key] ? (EK[key].n.kind === "bruecke" ? 4 : EK[key].s * sym * 0.85 + 3) : 6);
    const pts = G.items.filter((it) => it.pk);
    pts.forEach((it) => { const pr = it.b.premises.filter((p) => placement[p]).map(S);
      it.a = pr.length ? Math.atan2(pr.reduce((s, p) => s + p.y, 0) / pr.length - C.y, pr.reduce((s, p) => s + p.x, 0) / pr.length - C.x) : Math.PI / 2; });
    spread(pts, (2 * PR + 4) / R);
    pts.forEach((it) => { it.J = { x: C.x + Math.cos(it.a) * R, y: C.y + Math.sin(it.a) * R }; it.pk.setAttribute("transform", `translate(${it.J.x.toFixed(1)} ${it.J.y.toFixed(1)})`); });
    G.items.forEach((it) => {
      if (it.kind === "hollow") return;
      if (!it.pk) {   // direct route from the only premise to the mountain
        it.ins.forEach((s) => { const A = S(s.p), q = quad(A, C, s.kr);
          curve(s.st, A, { x: A.x + (q.x - A.x) * 2 / 3, y: A.y + (q.y - A.y) * 2 / 3 }, { x: C.x + (q.x - C.x) * 2 / 3, y: C.y + (q.y - C.y) * 2 / 3 }, C, rad(s.p), rad(G.key)); });
        return;
      }
      const J = it.J, a0 = it.a;
      const rel = it.ins.map((s) => { const P = S(s.p); return { s, P, r: clamp(wrapAngle(Math.atan2(P.y - J.y, P.x - J.x) - a0), -Math.PI / 2, Math.PI / 2) }; }).sort((u, v) => u.r - v.r);
      const xs = fan(rel.map((u) => u.r));
      rel.forEach((u, i) => { const P = u.P, dir = a0 + xs[i], L = Math.hypot(J.x - P.x, J.y - P.y);
        curve(u.s.st, P, { x: P.x + (J.x - P.x) / 3, y: P.y + (J.y - P.y) / 3 }, { x: J.x + Math.cos(dir) * L / 3, y: J.y + Math.sin(dir) * L / 3 }, J, rad(u.s.p), PR + 1); });
      it.stub.setAttribute("d", `M${f(J.x)},${f(J.y)}L${f(C.x + Math.cos(a0) * rT)},${f(C.y + Math.sin(a0) * rT)}`);
    });
  }
  // ------------------------------------------------------------ Route network (plan step 3.2)
  // Switch "dependencies" (todo B67): the whole route network, as an overview paler than the routes of a selection, only
  // while no theorem is selected (user, 2026-10-22). Every line of the network is drawn over its pieces, every piece once,
  // in world coordinates. Classes by magnification (class 1: at least 20 chains … class 4), stroke width by class (screen
  // px); NET_CLASS_MAX, NET_WIDTH and NET_OPACITY are at the top of the file.
  const layerNet = el("g", { id: "e11-wegenetz", "pointer-events": "none", opacity: NET_OPACITY, display: "none" }, worldTop);
  const netClass = [];
  function updateNet(k) {
    const on = NETWORK_SHOWN && shown.netz && !selected;
    layerNet.setAttribute("display", on ? "inline" : "none");
    if (!on) return;
    if (!netClass.length) {   // built on first use; thin classes below the thick ones
      [4, 3, 2, 1].forEach((c) => (netClass[c] = el("g", { "data-class": c, fill: "none", stroke: RED, "stroke-linecap": "round", "stroke-linejoin": "round" }, layerNet)));
      NET.pieces.forEach((q) => el("path", { d: "M" + q.points.map(([x, y]) => x.toFixed(1) + "," + y.toFixed(1)).join("L"), "data-piece": q.id }, netClass[q.cls]));
    }
    const cm = NET_CLASS_MAX(z);
    for (let c = 1; c <= 4; c++) { netClass[c].setAttribute("display", c <= cm ? "inline" : "none"); netClass[c].setAttribute("stroke-width", (NET_WIDTH[c] / k).toFixed(5)); }
  }
  // Switch "dependencies" (user, 2026-10-22): not the route network, but every dependency as a straight line from each
  // premise of the first proof (historical order, as a click shows it) to its theorem, thin and pale, for an impression
  // of the whole; only without a selection and only between elements that are shown
  const layerDeps = el("g", { id: "e11-abhaengigkeiten", "pointer-events": "none", display: "none", fill: "none", stroke: RED, opacity: 0.35, "stroke-linecap": "round" }, worldTop);
  let depsBuilt = false;
  function updateDeps(k) {
    const on = !NETWORK_SHOWN && shown.netz && !selected;
    layerDeps.setAttribute("display", on ? "inline" : "none");
    if (!on) return;
    if (!depsBuilt) {
      depsBuilt = true; const d = [];
      nodes.forEach((n) => { if (!EK[n.key] || hiddenNode(n.key) || !n.proofs.length) return; const b = ordered(n.key)[0], t = placement[n.key];
        b.premises.forEach((pk) => { const q = placement[pk]; if (!q || !EK[pk] || hiddenNode(pk) || pk === n.key) return; d.push(`M${f(q.x)},${f(q.y)}L${f(t.x)},${f(t.y)}`); }); });
      el("path", { d: d.join("") }, layerDeps);
    }
    layerDeps.setAttribute("stroke-width", (0.9 / k).toFixed(5));
  }
  // Switch "analogies" (todo B67): every analogy as a broken line with a dove, also without a selection; only where both
  // symbols are shown, and not twice for an analogy of the selected element
  // User, 2026-10-22: the doves lie above everything (buildings, names), below the cartouche; a click on a dove rings the
  // two theorems it connects and shows their names, a second click or a click on free ground ends that
  const layerAnalogies = el("g", { id: "e11-analogien", "pointer-events": "none", display: "none" }, clipView);
  let doveLit = null;
  const DOVE_RING = 17;
  // User, 2026-10-22: a click on a dove also opens a small card with the two ends of the analogy and the text of the
  // analogy (field `text` of the relation, translated on loading like all data texts). The card stands next to the
  // dove (it moves with the dove); ×, Esc and a click beside it close it together with the highlight.
  const doveCard = document.createElement("div");
  doveCard.className = "taube-karte"; doveCard.hidden = true;
  doveCard.setAttribute("role", "dialog"); doveCard.setAttribute("aria-label", U("Analogie"));
  document.body.appendChild(doveCard);
  function showDoveCard(b, ev) {
    const r = b.rel, A = M.K[r.from], B = M.K[r.to];
    doveCard.innerHTML = `<button type="button" class="zu" aria-label="Close" title="Close">×</button>` +
      `<div class="art">${U("Analogie")}</div>` +
      `<div class="enden">${FM("zwischen {0} und {1}", `<b>${A.name}</b>`, `<b>${B.name}</b>`)}</div>` +
      (r.text ? `<div class="erlaeuterung">${r.text}</div>` : "");
    doveCard.querySelector(".zu").addEventListener("click", (e) => { e.stopPropagation(); lightDove(null); });
    doveCard.hidden = false; pointer.style.display = "none";   // the hover box of the dove would lie under the card
    const g = b.g.getBoundingClientRect();
    placeDoveCard(g.width ? g.left + g.width / 2 : ev ? ev.clientX : innerWidth / 2, g.height ? g.top + g.height / 2 : ev ? ev.clientY : innerHeight / 2);
  }
  // The card stands beside the dove and moves with it when the map is moved or zoomed (user, 2026-10-22)
  function placeDoveCard(x0, y0) {
    const w = doveCard.offsetWidth, h = doveCard.offsetHeight;
    let x = x0 + 18, y = y0 - h / 2;
    if (x + w > innerWidth - 8) x = x0 - 18 - w;
    doveCard.style.left = clamp(x, 8, Math.max(8, innerWidth - w - 8)) + "px";
    doveCard.style.top = clamp(y, 8, Math.max(8, innerHeight - h - 8)) + "px";
  }
  function lightDove(b, ev) {
    const next = b && doveLit !== b ? b : null;   // a second click on the same dove ends the highlight
    if (doveLit) doveLit.lit.setAttribute("display", "none");
    doveLit = next;
    if (doveLit) { doveLit.lit.setAttribute("display", "inline"); showDoveCard(doveLit, ev); } else doveCard.hidden = true;
    request();
  }
  window.addEventListener("keydown", (e) => {
    if (doveCard.hidden || e.key !== "Escape") return;
    e.preventDefault(); e.stopPropagation(); lightDove(null);
  }, true);
  // a click outside the map and outside the card closes the card (clicks on the map are handled by its own handler)
  document.addEventListener("click", (e) => { if (!doveCard.hidden && !doveCard.contains(e.target) && !svg.contains(e.target)) lightDove(null); });
  let allDoves = null;
  const ANALOGY_ENDS = new Set();
  nodes.forEach((n) => n.rel.forEach((r) => { if (r.kind === "analogie" && placement[r.from] && placement[r.to] && !hiddenNode(r.from) && !hiddenNode(r.to)) { ANALOGY_ENDS.add(r.from); ANALOGY_ENDS.add(r.to); } }));
  function placeDove(b, k, tx, ty) {
    const mx = (b.a.x + b.b.x) / 2 * k + tx, my = (b.a.y + b.b.y) / 2 * k + ty;
    const ax = b.a.x * k + tx, ay = b.a.y * k + ty, bx = b.b.x * k + tx, by = b.b.y * k + ty, len = Math.hypot(bx - ax, by - ay);
    b.g.setAttribute("transform", `translate(${mx.toFixed(1)} ${my.toFixed(1)}) scale(${DOVE_SCALE})`);
    if (b.lit && b === doveLit) {   // rings and names of the two theorems of a clicked dove
      [[ax, ay], [bx, by]].forEach((q, i) => { b.rings[i].setAttribute("cx", f(q[0])); b.rings[i].setAttribute("cy", f(q[1]));
        b.names[i].setAttribute("x", f(q[0])); b.names[i].setAttribute("y", f(q[1] - DOVE_RING - 5)); });
      if (!doveCard.hidden) { const r = b.g.getBoundingClientRect(); placeDoveCard(r.left + r.width / 2, r.top + r.height / 2); }
    }
    if (len <= 2 * DOVE_GAP) { b.line.setAttribute("d", ""); return; }
    const ux = (bx - ax) / len, uy = (by - ay) / len;
    b.line.setAttribute("d", `M${f(ax)},${f(ay)}L${f(mx - ux * DOVE_GAP)},${f(my - uy * DOVE_GAP)}M${f(mx + ux * DOVE_GAP)},${f(my + uy * DOVE_GAP)}L${f(bx)},${f(by)}`);
  }
  const symbolShown = (key) => { const e = EK[key]; return !!e && !e.hidden && (e.visible || (shown.alle && SINGLE.has(e.n.kind)) || ANALOGY_ENDS.has(key)); };
  function updateAnalogies(k, tx, ty) {
    layerAnalogies.setAttribute("display", shown.analogien ? "inline" : "none");
    if (!shown.analogien) { if (doveLit) { doveLit.lit.setAttribute("display", "none"); doveLit = null; doveCard.hidden = true; } return; }
    if (!allDoves) {
      allDoves = []; const seen = new Set();
      nodes.forEach((n) => n.rel.forEach((r) => {
        if (r.kind !== "analogie" || !placement[r.from] || !placement[r.to] || hiddenNode(r.from) || hiddenNode(r.to)) return;
        const id = [r.from, r.to].sort().join("\n"); if (seen.has(id)) return; seen.add(id);
        const line = el("path", { fill: "none", stroke: DOVE_COLOR, "stroke-width": 1.6, "stroke-dasharray": "1.5 5", "stroke-linecap": "round" }, layerAnalogies);
        const g = el("g", { class: "taube", "pointer-events": "all", cursor: "pointer" }, layerAnalogies);
        el("circle", { cx: 0, cy: 0, r: 11, fill: "transparent" }, g); dove(g);
        const lit = el("g", { class: "taube-hervor", display: "none", "pointer-events": "none" }, layerAnalogies);
        const rings = [0, 1].map(() => el("circle", { r: DOVE_RING, fill: "none", stroke: DOVE_COLOR, "stroke-width": 2.4, opacity: 0.9 }, lit));
        const names = [r.from, r.to].map((key) => font(shortName(M.K[key]), { "text-anchor": "middle", "font-size": 13, fill: DOVE_COLOR, "stroke-width": 3.5, "font-style": "italic" }, lit));
        const D = { ka: r.from, kb: r.to, a: placement[r.from], b: placement[r.to], line, g, on: true, lit, rings, names, rel: r };
        hint.set(g, { title: U("Analogie"), who: FM("zwischen {0} und {1}", M.K[r.from].name, M.K[r.to].name) });   // user, 2026-10-22
        g.addEventListener("click", (ev) => { ev.stopPropagation(); if (!dragged) lightDove(D, ev); });
        allDoves.push(D);
      }));
    }
    allDoves.forEach((b) => {
      const on = symbolShown(b.ka) && symbolShown(b.kb) && !(selected && (b.ka === selected || b.kb === selected));
      if (on !== b.on) { b.line.setAttribute("display", on ? "inline" : "none"); b.g.setAttribute("display", on ? "inline" : "none"); b.on = on;
        if (!on && b === doveLit) { b.lit.setAttribute("display", "none"); doveLit = null; doveCard.hidden = true; } }
      if (on) placeDove(b, k, tx, ty);
    });
  }
  const selG = el("g", {}, worldTop);

  // ------------------------------------------------------------ Drawing of the bridges (draft 10)
  // Plan view as on old maps: a deck of two parallel lines with flared wing walls on both banks, across the fjord at
  // the place of the bridge. A finished bridge has a solid deck, a construction plan (Bauplan) only a dashed outline
  // without fill, a bridge under construction solid ends and a dashed middle. The width of the deck and of the wing
  // walls grows with the importance of the correspondence (the same size as its mountain would have); like mountains,
  // bridges appear from the zoom level that their importance gives. Drawn in screen coordinates for each frame.
  // Width of the deck by importance (user, 2026-10-20): the B49 size measure (scripts/size-score.js with data/weights.js, as for
  // the mountains of draft 8), normalised weight w in [0, 1], gives a deck of 11 to 20 px; a construction plan is
  // somewhat wider than the widest finished bridge, so that the names on the decks stay readable
  const DECK_MIN = 5.5, DECK_MAX = 10;
  const deckHalf = (() => {
    const SZ = window.SIZE_SCORE, out = {};
    let sc = {};
    try { if (SZ) sc = SZ.compute(nodes, M.K, window, window.SIZE_SETTINGS || {}, window.SIZE_LITERATURE || {}); } catch (err) { sc = {}; }
    BR.forEach((B) => { const r = sc[B.n.key]; out[B.n.key] = DECK_MIN + (DECK_MAX - DECK_MIN) * clamp(r ? r.w : 0.3, 0, 1); });
    // plan 1.5, round 3 (user): wider than the widest finished bridge (stage "fertig")
    const widest = Math.max(DECK_MIN, ...BR.filter((B) => B.n.stage === "fertig").map((B) => out[B.n.key]));
    BR.forEach((B) => { if (B.n.stage === "bauplan") out[B.n.key] = widest + 1.5; });
    return out;
  })();
  // Plan step 2.2: a tree whose box (magnification 1) meets the box of a bridge at magnification 1 (deck, ramps and wing
  // walls, as updateBridges computes it) moves by the shortest way out of it, to a place in its own province outside the
  // fjord. The layout of plan step 1.4 is not recomputed in this step; bridges have kept their place since plan step 1.5.
  {
    const kk = (L.elementLayout && L.elementLayout.constants && L.elementLayout.constants.K0) || 0.64, hwOf = (B) => deckHalf[B.n.key] / kk;
    // boxes at magnification z (screen parts of the bridge shrink with 1/z in map units, the tree with z^(P - 1)); a tree is
    // compared at its own magnification, the worst case for it
    const bridgeBoxes = (z) => BR.map((B) => { const hw = hwOf(B) / z;
      const A = B.bankA, Z = B.bankB, l = Math.max(1e-6, dist(A, Z)), u = { x: (Z.x - A.x) / l, y: (Z.y - A.y) / l }, d = { x: -u.y, y: u.x };
      const ramp = B.n.stage === "bauplan" ? 0 : B.ramp + hw * 1.2, P = (q, t, o) => ({ x: q.x + u.x * t + d.x * o, y: q.y + u.y * t + d.y * o });
      const pts = [P(A, -ramp - hw * 1.5, -hw * 2.1), P(A, -ramp - hw * 1.5, hw * 2.1), P(Z, ramp + hw * 1.5, -hw * 2.1), P(Z, ramp + hw * 1.5, hw * 2.1)];
      return { x0: Math.min(...pts.map((q) => q.x)), x1: Math.max(...pts.map((q) => q.x)), y0: Math.min(...pts.map((q) => q.y)), y1: Math.max(...pts.map((q) => q.y)) };
    });
    TREES.forEach((t) => {
      const BB = bridgeBoxes(t.zA), sc = t.s * Math.pow(t.zA, P - 1);
      const box = (x, y) => ({ x0: x + TREE_BOX.x0 * sc - 2, x1: x + TREE_BOX.x1 * sc + 2, y0: y + TREE_BOX.y0 * sc - 2, y1: y + TREE_BOX.y1 * sc + 2 });
      const meets = (b, q) => b.x0 < q.x1 && q.x0 < b.x1 && b.y0 < q.y1 && q.y0 < b.y1;
      // plan 4.5, follow-up 2: the new place also keeps clear of the other trees (at the magnification from which both are shown)
      const treeBox = (u, x, y, z) => { const su = u.s * Math.pow(z, P - 1); return { x0: x + TREE_BOX.x0 * su, x1: x + TREE_BOX.x1 * su, y0: y + TREE_BOX.y0 * su, y1: y + TREE_BOX.y1 * su }; };
      const clearOfTrees = (x, y) => TREES.every((u) => u === t || !meets(treeBox(t, x, y, Math.max(t.zA, u.zA)), treeBox(u, u.x, u.y, Math.max(t.zA, u.zA))));
      const ok = (x, y) => !BB.some((q) => meets(box(x, y), q)) && PZ[t.c.province] && inPolygon(PZ[t.c.province].cell, x, y) && !inFjord(x, y, 0.7 * sc) && clearOfTrees(x, y);
      if (ok(t.x, t.y)) return;
      // nearest free place: rings of 3 map units around the old place, 24 directions each
      for (let r = 3; r <= 240; r += 3) {
        let best = null;
        for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, x = t.x + r * Math.cos(a), y = t.y + r * Math.sin(a); if (ok(x, y)) { best = [x, y]; break; } }
        if (best) { t.x = best[0]; t.y = best[1]; t.moved = true; break; }
      }
    });
  }
  // Forests of the model: ground (a soft common area below the trees, clipped to the province) and name. The ground is the
  // convex hull of the tree boxes at magnification 1 with a margin; it has no meaning beyond the group (Konzept/04, 4.3a).
  const forestLayer = el("g", { id: "e11-forests", "pointer-events": "none" }, worldBottom);
  const FORESTS = M.forests.map((F) => {
    const pts = []; F.concepts.forEach((k) => { const t = TK[k]; if (!t) return; const m = 7;
      [[TREE_BOX.x0, TREE_BOX.y0], [TREE_BOX.x1, TREE_BOX.y0], [TREE_BOX.x1, TREE_BOX.y1], [TREE_BOX.x0, TREE_BOX.y1]].forEach(([bx, by]) =>
        pts.push([t.x + bx * t.s + Math.sign(bx) * m, t.y + by * t.s + Math.sign(by) * m])); });
    if (pts.length < 3) return { index: F.index, F, hull: null };
    const P2 = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    P2.forEach((q) => { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    P2.slice().reverse().forEach((q) => { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
    const hull = lo.slice(0, -1).concat(hi.slice(0, -1)), mo = moments(hull);
    const label = EN ? F.name_en || F.name : F.name;
    return { index: F.index, F, hull, cx: mo.x / mo.A, cy: mo.y / mo.A, label: label || null };
  });
  FORESTS.forEach((Q) => {
    if (!Q.hull || !PZ[Q.F.province]) return;
    const id = "e11-forest-clip-" + Q.index;
    defs.insertAdjacentHTML("beforeend", `<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${outline(extendCell(PZ[Q.F.province].cell))}"/></clipPath>`);
    Q.g = el("path", { d: T.smooth(Q.hull.concat([Q.hull[0]])), fill: FOREST_GROUND, opacity: 0.17, stroke: "none", "clip-path": `url(#${id})`, "data-forest": Q.index }, forestLayer);
  });
  function buildBridge(B) {
    B.g = el("g", { class: "bruecke", display: "none" }, layerBridge);
    B.art = el("g", { "data-stage": B.n.stage }, B.g);   // plan step 4.5: redrawn for each frame by bridgeArt
    B.hit = el("path", { fill: "transparent", stroke: "none", cursor: "pointer" }, B.g);
    hint.set(B.hit, { key: B.n.key }); selectable.set(B.hit, B.n.key);
    // The name stands on the deck (user, 2026-10-20), along the bridge
    B.nameText = shortName(B.n).replace(/<[^>]+>/g, "");   // todo B69 j
    B.nameW = measureText(B.nameText, {});
    B.label = font(B.nameText, { x: 0, y: 0, "font-size": REF, "text-anchor": "middle", "stroke-width": 0.25 * REF, "pointer-events": "none", display: "none" }, B.g);
    B.shown = false;
  }
  // Screen geometry of a bridge at scale k: banks, direction, half deck width, ramps, ends and the corners of its box
  // without the face below the deck (todo B73: also used by computeThresholds)
  function bridgeGeometry(B, k, tx, ty) {
    const S = (p) => ({ x: p.x * k + tx, y: p.y * k + ty });
    const A = S(B.bankA), Z = S(B.bankB), water = Math.max(1, dist(A, Z)), u = { x: (Z.x - A.x) / water, y: (Z.y - A.y) / water };
    const d = { x: -u.y, y: u.x };
    // plan 1.5, round 3 (user): a construction plan lies over the water of the mouth, its ends on the banks (no ramps)
    const hw = deckHalf[B.n.key], ramp = B.n.stage === "bauplan" ? 0 : B.ramp * k + hw * 1.2;
    const P = (q, t, off) => ({ x: q.x + u.x * t + d.x * off, y: q.y + u.y * t + d.y * off });
    const E0 = P(A, -ramp, 0), E1 = P(Z, ramp, 0);
    const pts = [P(E0, -hw * 1.5, -hw * 2.1), P(E0, -hw * 1.5, hw * 2.1), P(E1, hw * 1.5, -hw * 2.1), P(E1, hw * 1.5, hw * 2.1)];
    return { A, Z, water, u, d, hw, ramp, P, E0, E1, pts };
  }
  // Name on the deck: centred, turned with the deck (never upside down); where the deck is shorter than the name, the
  // name continues over the banks with a light halo. Its box is kept free of other names
  function deckNameBox(B, hw, u, E0, E1) {
    const fs = clamp(hw * 1.45, 9.5, 14), mid = { x: (E0.x + E1.x) / 2, y: (E0.y + E1.y) / 2 };
    let ang = Math.atan2(u.y, u.x) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
    const tl = B.nameW * fs / REF, c0 = Math.cos(ang * Math.PI / 180), s0 = Math.sin(ang * Math.PI / 180);
    const bw = Math.abs(c0) * tl / 2 + Math.abs(s0) * fs * 0.6, bh = Math.abs(s0) * tl / 2 + Math.abs(c0) * fs * 0.6;
    return { x0: mid.x - bw, x1: mid.x + bw, y0: mid.y - bh, y1: mid.y + bh, key: "", fs, mid, ang };
  }
  function updateBridges(k, tx, ty, obstacles, probe) {
    // Plan step 4.5: bridges further south (lower in the picture) are drawn later, so that their deck lies in front of
    // the south face of the bridges behind them, as in the oblique view of the buildings
    if (BR.some((B) => !B.g)) BR.slice().sort((a, b) => a.c.y - b.c.y).forEach((B) => { if (!B.g) buildBridge(B); });
    BR.forEach((B) => {
      const e = EK[B.n.key];
      const show = !!e && e.visible && !e.hidden && e.inImage;
      if (!probe && show !== B.shown) { B.g.setAttribute("display", show ? "inline" : "none"); B.shown = show; }
      if (!show) return;
      const { A, Z, water, u, hw, ramp, P, E0, E1, pts } = bridgeGeometry(B, k, tx, ty);
      // Todo B73, probe of computeThresholds: only the boxes, nothing is drawn (without arches the face has no depth)
      const boxOf = (q) => ({ x0: Math.min(...q.map((v) => v.x)), x1: Math.max(...q.map((v) => v.x)), y0: Math.min(...q.map((v) => v.y)), y1: Math.max(...q.map((v) => v.y)), key: B.n.key });
      if (probe) { e.box = boxOf(pts); obstacles.push(e.box, deckNameBox(B, hw, u, E0, E1)); return; }
      const xy = (q) => f(q.x) + "," + f(q.y);
      const quad = (a, b, o0, o1) => `M${xy(P(a, 0, o0))}L${xy(P(b, 0, o0))}L${xy(P(b, 0, o1))}L${xy(P(a, 0, o1))}Z`;
      // Plan step 4.5: the drawing of the approved sketch, with arches from magnification Z_ARCH on
      while (B.art.firstChild) B.art.firstChild.remove();
      const large = hw >= BRIDGE_LARGE;
      // User, 2026-10-22: the arches are left out for now at every magnification (at the fjord the south faces of the
      // bridges touched each other); only deck and ramps (wing walls) are drawn. Todo B61
      const art = bridgeArt(B.art, A, Z, { stage: B.n.stage, hw, large, ramp, arches: ARCHES && z >= Z_ARCH, sw: large ? 1.1 : 0.9 });
      B.arches = art.depth > 0;
      // The face below the deck belongs to the area of the bridge (hit area and box)
      const face = art.depth, fx = (q) => ({ x: q.x, y: q.y + face });
      B.hit.setAttribute("d", quad(P(E0, -hw * 1.5, 0), P(E1, hw * 1.5, 0), -hw * 2.3 - 2, hw * 2.3 + 2) +
        (face ? `M${xy(P(E0, 0, art.low * hw))}L${xy(P(E1, 0, art.low * hw))}L${xy(fx(P(E1, 0, art.low * hw)))}L${xy(fx(P(E0, 0, art.low * hw)))}Z` : ""));
      // Box of the bridge (for the placement of its name and of the other names)
      if (face) pts.push(fx(P(A, 0, art.low * hw)), fx(P(Z, 0, art.low * hw)));
      e.box = boxOf(pts);
      const nb = deckNameBox(B, hw, u, E0, E1), { fs, mid, ang } = nb;
      obstacles.push(e.box, nb);
      B.screen = { water, box: e.box };
      const fits = true;
      B.label.setAttribute("display", fits ? "inline" : "none");
      if (fits) B.label.setAttribute("transform", `translate(${f(mid.x)} ${f(mid.y)}) rotate(${f(ang)}) translate(0 ${f(fs * 0.33)}) scale(${(fs / REF).toFixed(4)})`);
      B.nameShown = fits;
    });
    // The water of the fjords is kept free of names, so that the fjords stay visible in the overview
    FJ.forEach((F) => F.centre.forEach((c, i) => { if (i % 12) return; const r = F.width(c.s) / 2 * k * 0.75, x = c.x * k + tx, y = c.y * k + ty;
      if (r > 3) obstacles.push({ x0: x - r, x1: x + r, y0: y - r, y1: y + r, key: "" }); }));
  }

  // ------------------------------------------------------------ View
  let cartoucheBox = null, Wv = 0, Hv = 0, k0 = 1, z = 1, cx = K0.CX, cy = K0.CY, scheduled = false;
  const request = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => draw()); } };
  function clampView() {
    z = clamp(z, Z_MIN, Z_MAX);
    cx = clamp(cx, K0.CX - K0.RX, K0.CX + K0.RX); cy = clamp(cy, K0.CY - K0.RY, K0.CY + K0.RY);
  }
  function drawPaper() {
    paper.innerHTML = ""; paper.setAttribute("viewBox", `0 0 ${Wv} ${Hv}`); svg.setAttribute("viewBox", `0 0 ${Wv} ${Hv}`);
    T.filter(el("defs", {}, paper), Wv, Hv);
    T.paperAndFrame(paper, Wv, Hv);
    seaFill.setAttribute("width", Wv); seaFill.setAttribute("height", Hv);
    const c = document.getElementById("e8-clip");
    c.setAttribute("width", Math.max(0, Wv - 2 * MARGIN)); c.setAttribute("height", Math.max(0, Hv - 2 * MARGIN));
    // plan 1.5, round 2 (user, 2026-10-21): the cartouche stands top left (before: bottom right); since the addendum
    // "water" fixed in the corner of the frame (see placeCartouche), drawn once here
    if (!cartouche.firstChild) {
      // User, 2026-10-22: two lines "Landscape of" / "Number theory and algebraic geometry", without "Draft 11 · Langlands bridge".
      // Same day: style of a copperplate frame (proposal 5 of skizzen/kartusche.html): concave corners, double rule, the first
      // line between two ornamental rules, the title in large italic. The first rect is the box of the cartouche
      // (test-cartouche.js); it is not painted.
      el("rect", { width: 400, height: 62, fill: "none", stroke: "none" }, cartouche);
      const r = 10;
      el("path", { d: `M${r},0H${400 - r}A${r},${r} 0 0 0 400,${r}V${62 - r}A${r},${r} 0 0 0 ${400 - r},62H${r}A${r},${r} 0 0 0 0,${62 - r}V${r}A${r},${r} 0 0 0 ${r},0Z`,
        fill: "#faf5e8", stroke: INK, "stroke-width": 1.3 }, cartouche);
      el("rect", { x: 7, y: 5, width: 386, height: 52, fill: "none", stroke: INK, "stroke-width": 0.5 }, cartouche);
      el("path", { d: "M112,16.5H158M242,16.5H288", stroke: INK, "stroke-width": 0.6 }, cartouche);
      [[109, 16.5], [291, 16.5], [7, 31], [393, 31]].forEach(([x, y]) =>
        el("path", { d: `M${x - 3},${y}L${x},${y - 2.2}L${x + 3},${y}L${x},${y + 2.2}Z`, fill: INK }, cartouche));
      text(U("Landschaft der"), { x: 200, y: 20.5, "font-size": 12.5, "font-style": "italic", "text-anchor": "middle" }, cartouche);
      // title case for the italic title, except the conjunction
      const title = U("Zahlentheorie und algebraische Geometrie").replace(/\b(?!and\b|und\b)\p{Ll}/gu, (c) => c.toUpperCase());
      text(title, { x: 200, y: 46, "font-size": 22, "font-style": "italic", "text-anchor": "middle" }, cartouche);
    }
  }
  // Screen box of the cartouche (plan 1.5, addendum "water", user 2026-10-21): it sits flush in the top left corner of the
  // frame (inside the clip of the frame, no gap) and stays there when the map is zoomed or moved. Its size is the size
  // of the box CART at the scale k0 of the whole map in this window, so it changes only with the window. In the whole map
  // it lies within the box that the layout keeps free of land, fjord, bridges and names, moved up and left into the
  // corner (k0 keeps that box at least 14 px from the frame, see resizeToFit); test-cartouche.js checks this.
  // Todo B65 (user, 2026-10-22): a small gap to the frame
  const CART_INSET = 12;   // user, 2026-10-22: larger gap to the frame
  function placeCartouche() {
    const sc = (CART.x1 - CART.x0) * k0 / 400, x0 = MARGIN + CART_INSET, y0 = MARGIN + CART_INSET;
    cartouche.setAttribute("transform", `translate(${f(x0)} ${f(y0)}) scale(${sc.toFixed(5)})`);
    cartoucheBox = { x0, y0, x1: x0 + 400 * sc, y1: y0 + 62 * sc, key: "" };
  }
  function resizeToFit() {
    const r = stage.getBoundingClientRect();
    if (r.width === Wv && r.height === Hv) return;
    Wv = r.width; Hv = r.height;
    k0 = Math.min((Wv - 2 * MARGIN - 16) / (2 * K0.RX * 1.08), (Hv - 2 * MARGIN - 16) / (2 * K0.RY * 1.08));   // draft 10: coast beyond the ellipse
    // plan 1.5, round 3: the cartouche (map coordinates) also lies inside the frame, at least 14 px from it, in every window
    k0 = Math.min(k0, (Wv / 2 - MARGIN - 14) / Math.max(1, K0.CX - CART.x0), (Hv / 2 - MARGIN - 14) / Math.max(1, K0.CY - CART.y0));
    drawPaper(); request();
    // Todo B73: the thresholds depend on k0 (names keep their size in screen pixels); recomputed once the window rests
    if (E.length) { clearTimeout(thresholdTimer); thresholdTimer = setTimeout(() => { computeThresholds(); request(); }, 200); }
  }
  function inPolygon(zz, x, y) {
    let inner = false;
    for (let i = 0, j = zz.length - 1; i < zz.length; j = i++) {
      const a = zz[i], b = zz[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inner = !inner;
    }
    return inner;
  }
  const intersects = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  // Spatial index of boxes in screen coordinates (cells of 48 px): a collision test only looks at nearby boxes
  function boxIndex(list) {
    const C = 48, cells = new Map(), all = [];
    const span = (b, fn) => { for (let i = Math.floor(b.x0 / C); i <= Math.floor(b.x1 / C); i++) for (let j = Math.floor(b.y0 / C); j <= Math.floor(b.y1 / C); j++) fn((i + 1000) * 10000 + j + 1000); };
    const idx = {
      all,
      push(...bs) { bs.forEach((b) => { all.push(b); span(b, (key) => { let a = cells.get(key); if (!a) cells.set(key, (a = [])); a.push(b); }); }); },
      near(q) {   // plain loops; a box in several cells is listed once
        const out = [];
        for (let i = Math.floor(q.x0 / C), i1 = Math.floor(q.x1 / C); i <= i1; i++) for (let j = Math.floor(q.y0 / C), j1 = Math.floor(q.y1 / C); j <= j1; j++) {
          const a = cells.get((i + 1000) * 10000 + j + 1000);
          if (a) for (let m = 0; m < a.length; m++) { const b = a[m]; if (q.x0 < b.x1 && b.x0 < q.x1 && q.y0 < b.y1 && b.y0 < q.y1 && out.indexOf(b) < 0) out.push(b); }
        }
        return out;
      },
      some(q, pred) {   // plain loops with an early return (todo B73: called very often by computeThresholds)
        for (let i = Math.floor(q.x0 / C), i1 = Math.floor(q.x1 / C); i <= i1; i++) for (let j = Math.floor(q.y0 / C), j1 = Math.floor(q.y1 / C); j <= j1; j++) {
          const a = cells.get((i + 1000) * 10000 + j + 1000);
          if (a) for (let m = 0; m < a.length; m++) { const b = a[m]; if (q.x0 < b.x1 && b.x0 < q.x1 && q.y0 < b.y1 && b.y0 < q.y1 && (!pred || pred(b))) return true; }
        }
        return false;
      },
    };
    idx.push(...list);
    return idx;
  }
  // Names are tested and placed with their box plus 0.75 px on each side, so that the estimated boxes keep a small distance
  const pad = (b) => ({ x0: b.x0 - 0.75, x1: b.x1 + 0.75, y0: b.y0 - 0.75, y1: b.y1 + 0.75 });
  const gapOf = (q, r) => Math.hypot(Math.max(0, q.x0 - r.x1, r.x0 - q.x1), Math.max(0, q.y0 - r.y1, r.y0 - q.y1));   // distance of two boxes
  const overlap = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

  let selected = null, chain = null;   // chain: key -> distance in the proof chain of the selected mountain
  // Shown state of a symbol (element or tree). uiState: 0 not drawn (display none), 1 shown, 2 fading out (class "aus",
  // display none after the transition)
  function symbolState(e, show, inImage, X, Y, sym, now) {
    if (!inImage) { if (e.uiState) { e.g.style.display = "none"; e.g.classList.add("aus"); e.uiState = 0; } return; }
    if (!show) {
      if (e.uiState === 1) { e.g.classList.add("aus"); e.uiState = 2; e.fadeT = now; }
      // Fallback if no transitionend arrives (e.g. no frame between showing and hiding)
      else if (e.uiState === 2 && now - e.fadeT > 400) { e.g.style.display = "none"; e.uiState = 0; }
      if (e.uiState !== 2) return;
    } else if (e.uiState !== 1) {
      // From display none the CSS animation fades in; while fading out the transition reverses
      if (!e.uiState) e.g.style.display = "";
      e.g.classList.remove("aus"); e.uiState = 1;
    }
    e.g.setAttribute("transform", `translate(${X.toFixed(1)} ${Y.toFixed(1)}) scale(${sym.toFixed(4)})`);
  }
  // probe (todo B73, computeThresholds): lay out symbols and names without drawing anything. probe.visible(e) says which
  // elements are visible, probe.image replaces the image (null: the window), probe.cartouche whether the cartouche counts
  // Below magnification 1 (user, 2026-10-22) the map is laid out as the whole map at magnification 1 (same names, symbols
  // and levels) and clipView scales that picture by z, so that a world point lands where k0 * z puts it; screen-to-map
  // conversions elsewhere keep using k0 * z.
  // Lines with vector-effect="non-scaling-stroke" (coast hatching, borders) keep their screen width; below magnification 1
  // they shrink with the island instead (user, 2026-10-22): the width in world units is chosen so that it equals the
  // screen width at z = 1 (scale k0) and then scales with z
  function scaleFixedLines(on) {
    clipView.querySelectorAll("[vector-effect]").forEach((e) => {
      if (!on) { e.style.removeProperty("vector-effect"); e.style.removeProperty("stroke-width"); return; }
      const sw = parseFloat(e.getAttribute("stroke-width") || getComputedStyle(e.parentNode).strokeWidth) || 1;
      e.style.setProperty("vector-effect", "none"); e.style.setProperty("stroke-width", (sw / k0).toFixed(3));
    });
  }
  let linesScaled = false;
  function draw(probe) {
    if (!probe && z < 1) {
      const zv = z, x = cx, y = cy;
      z = 1; cx = K0.CX; cy = K0.CY;
      try { drawAt(probe); } finally { z = zv; cx = x; cy = y; }
      scaleFixedLines(true); linesScaled = true;
      clipView.setAttribute("transform", `matrix(${z.toFixed(5)} 0 0 ${z.toFixed(5)} ${(Wv / 2 * (1 - z) + z * k0 * (K0.CX - cx)).toFixed(2)} ${(Hv / 2 * (1 - z) + z * k0 * (K0.CY - cy)).toFixed(2)})`);
      document.getElementById("stufe").textContent = FM("Vergrößerung {0}×", decimal(z, z < 0.1 ? 3 : 2));
      return;
    }
    if (!probe) { clipView.removeAttribute("transform"); if (linesScaled) { scaleFixedLines(false); linesScaled = false; } }
    drawAt(probe);
  }
  function drawAt(probe) {
    if (!probe) scheduled = false;
    const k = k0 * z, tx = Wv / 2 - cx * k, ty = Hv / 2 - cy * k, sym = k0 * Math.pow(z, P);
    if (!probe) {
      const mat = `matrix(${k.toFixed(5)} 0 0 ${k.toFixed(5)} ${tx.toFixed(2)} ${ty.toFixed(2)})`;
      worldBottom.setAttribute("transform", mat); worldTop.setAttribute("transform", mat);
      placeCartouche();
      document.getElementById("stufe").textContent = FM("Vergrößerung {0}×", decimal(z, 1));
    }
    const image = (probe && probe.image) || { x0: MARGIN, y0: MARGIN, x1: Wv - MARGIN, y1: Hv - MARGIN };
    const cart = cartoucheBox && (!probe || probe.cartouche) ? [cartoucheBox] : [];
    const obstacles = boxIndex(cart), now = performance.now();
    // Symbols
    E.forEach((e) => {
      const X = e.x * k + tx, Y = e.y * k + ty, r = e.s * sym * 2 + 40;
      const inImage = X > image.x0 - r && X < image.x1 + r && Y > image.y0 - r && Y < image.y1 + r;
      const v = probe ? (probe.visible(e) ? 1 : 0) : chain && chain.has(e.key) ? 1 : visibility(e.zA, z);
      e.X = X; e.Y = Y; e.sym = sym; e.visible = v === 1; e.inImage = inImage;
      // Filter "Nur zeigen": a plain filter on what the zoom level shows. Hidden elements keep their place in the
      // label layout (box and name are computed as without the filter), so the other names do not move.
      // Draft 10: the bridge is never filtered out.
      e.hidden = !!filterKind && e.n.kind !== "gebaeude" && e.n.kind !== "bruecke" && !(chain && chain.has(e.key)) && !FILTERS[filterKind](e.n);
      // Switch "all theorems": the symbol is drawn below its level of detail as well, but it gets no name and is no
      // obstacle for the names, so that the names stay as without the switch
      // Plan step 3.2: the switch "analogies" also draws the two symbols of every analogy, like the switch "theorems"
      const forced = ((shown.alle && SINGLE.has(e.n.kind)) || (shown.analogien && ANALOGY_ENDS.has(e.key))) && !e.visible;
      const show = (e.visible || forced) && !e.hidden;
      if (e.visible && inImage && e.n.kind !== "bruecke") {
        const b = e.box0, upper = e.withFlag ? Math.min(b.y0, e.tip.y - 18) : b.y0, right = e.withFlag ? Math.max(b.x1, e.tip.x + 12) : b.x1;
        e.box = { x0: X + b.x0 * sym, x1: X + right * sym, y0: Y + upper * sym, y1: Y + b.y1 * sym, key: e.key };
        obstacles.push(e.box);
      }
      if (!probe) symbolState(e, show, inImage, X, Y, sym, now);
    });
    // Plan step 2.2: trees, after the elements of the theorem part; their boxes are obstacles for all names
    if (!probe) TREES.forEach((t) => {
      const X = t.x * k + tx, Y = t.y * k + ty, r = t.s * sym * 1.5 + 40;
      const inImage = X > image.x0 - r && X < image.x1 + r && Y > image.y0 - r && Y < image.y1 + r;
      t.X = X; t.Y = Y; t.sym = sym; t.inImage = inImage; t.visible = shown.baeume && z >= t.zA; t.box = null;
      if (t.visible && inImage) { const b = t.box0; t.box = { x0: X + b.x0 * sym, x1: X + b.x1 * sym, y0: Y + b.y0 * sym, y1: Y + b.y1 * sym, key: t.key }; obstacles.push(t.box); }
      symbolState(t, t.visible, inImage, X, Y, sym, now);
    });
    updateBridges(k, tx, ty, obstacles, !!probe);   // draft 10
    if (!probe) {
      selGroups.forEach((G) => updateGroup(G, k, tx, ty, sym));
      updateNet(k);   // plan step 3.2
      updateDeps(k);
      // Proof points (filled and hollow) are obstacles for every name, also for the name of their own mountain: a name
      // never covers a proof point (user's decision, 20 October 2026)
      selGroups.forEach((G) => G.items.forEach((it) => { if (it.pk && it.J) obstacles.push({ x0: it.J.x - PR - 3, x1: it.J.x + PR + 3, y0: it.J.y - PR - 3, y1: it.J.y + PR + 3, key: "", point: true }); }));
      if (pointerStale) { pointerStale = false; refreshPointer(); }
      // Doves on the analogy lines: upright, in the middle of the line, which has a gap there; the size stays the same
      // in screen coordinates
      selDoves.forEach((b) => placeDove(b, k, tx, ty));
      updateAnalogies(k, tx, ty);   // plan step 3.2, todo B67
    }

    // Names (todo B12 a), in the order of priority: the selected chain, countries, the mountains of level 1, then of
    // level 2 (todo B50), provinces, the remaining mountains. All names share one index of occupied boxes; every name also avoids the
    // visible symbols (except its own) and the cartouche. A name without free space is left out and appears only at a
    // larger magnification. Country names therefore never lie under a mountain name or a symbol; they come before the
    // mountain names because they give the orientation in the overview, and they shrink, break into lines or move
    // within their country before they are left out.
    let occupied = boxIndex(cart);
    const grow = clamp(1 + 0.1 * Math.log2(z), 1, 1.35);
    const inner = (q) => q.x0 >= image.x0 && q.x1 <= image.x1 && q.y0 >= image.y0 && q.y1 <= image.y1;
    E.forEach((e) => { e.slot = false; e.guide = null; e.nameBox = null; });
    TREES.forEach((t) => { t.slot = false; t.guide = null; t.nameBox = null; });
    function placeMountain(e, fs, forced, dry, wide) {   // dry: only return the box the name would take; wide: also places further away
      if (!e.visible || !e.inImage || !e.box) return;
      if (e.n.kind === "bruecke") return;   // draft 10: the name of a bridge stands on its deck (updateBridges)
      // The block of all lines: the first baseline lies ASC * fs below its top edge
      const sc = fs / REF, w = e.lw * sc, h = (ASC + (e.nl - 1) * LH + DESC) * fs, kb = e.box, X = e.X, Y = e.Y, gap = fs * 0.08;
      const below = kb.y1 + gap + h / 2, above = kb.y0 - gap - h / 2, right = kb.x1 + 4 + w / 2, left = kb.x0 - 4 - w / 2;
      const far = fs * 1.6;
      // Plan 1.5, round 2 (user, 2026-10-21: every name directly at its object): more places touching the symbol, then
      // places 0.6 em away, before the places further away
      const near = fs * 0.6;
      let cand = [[X, below], [X, above], [right, Y], [left, Y],
        [X + (kb.x1 - X) * 0.6 + w / 2, below], [X - (X - kb.x0) * 0.6 - w / 2, below],
        [X + (kb.x1 - X) * 0.6 + w / 2, above], [X - (X - kb.x0) * 0.6 - w / 2, above],
        [right, Y + h / 2 - (Y - kb.y0)], [left, Y + h / 2 - (Y - kb.y0)], [right, Y - h / 2 + (kb.y1 - Y)], [left, Y - h / 2 + (kb.y1 - Y)],
        [right, below], [left, below], [right, above], [left, above]];
      // User, 2026-10-22 ("once and for all": a name stood far away with a leader line although there was room next to its
      // symbol): before any place further away, the name slides along each side of the symbol, still touching it, below
      // and above in steps of a tenth of its width, right and left in steps of a fifth of its height
      for (let t = 0.1; t <= 0.51; t += 0.1) cand.push([X + t * w, below], [X - t * w, below], [X + t * w, above], [X - t * w, above]);
      for (let t = 0.2; t <= 1.01; t += 0.2) cand.push([right, Y + t * h], [right, Y - t * h], [left, Y + t * h], [left, Y - t * h]);
      cand.push(
        [X, below + near], [X, above - near], [right + near, Y], [left - near, Y],
        [X, below + far], [X, above - far], [right + far * 1.5, Y], [left - far * 1.5, Y],
        [right, below + far * 0.5], [left, below + far * 0.5]);
      // Near the edge of the image: the name below or above the symbol, shifted sideways into the image (todo B50)
      const xin = clamp(X, image.x0 + w / 2 + 2, image.x1 - w / 2 - 2);
      if (Math.abs(xin - X) > 0.5 && Math.abs(xin - X) < w / 2) cand.splice(4, 0, [xin, below], [xin, above]);
      // A hill range (theory, todo B50, user 2026-10-20): its name stands uniformly half on the symbol, centred, with the
      // middle of the text block on the foot line of the front row of hills. If that place is taken, the name moves only
      // sideways at the same height in steps of 0.6 em; only then the other places follow. Its own
      // symbol is no obstacle, proof points and foreign symbols are.
      const row = [];
      if (e.n.kind === "gebaeude") {
        // Sideways at most so far that the name still overlaps the symbol by a third of the symbol's width
        const foot = Y + 8 * (e.s / 16) * e.sym, step = fs * 0.6, lim = (kb.x1 - kb.x0) / 6 + w / 2;
        row.push([X, foot]);
        for (let i = 1; i * step <= lim; i++) row.push([X + i * step, foot], [X - i * step, foot]);
        cand.unshift(...row);
      }
      const box = ([px, py]) => ({ x0: px - w / 2, x1: px + w / 2, y0: py - h / 2, y1: py + h / 2, px, py: py - h / 2 + ASC * fs });
      // wide (todo B50): only places further away on a ring around the symbol, for the most important names that found
      // no place nearby; such a name is joined to its symbol by a leader line. Places where no foreign symbol lies
      // closer to the name than its own come first, so that the name is not read as the name of a neighbour.
      if (wide === "row") cand = row.map(box);   // only the place on the foot line and its sideways shifts
      else if (wide) {
        const ring = [];
        // Eight distances, sixteen directions each (below, above, right and left first)
        const dirs = [4, 12, 0, 8, 2, 6, 14, 10, 3, 5, 13, 11, 1, 7, 15, 9].map((i) => [Math.cos(i * Math.PI / 8), Math.sin(i * Math.PI / 8)]);
        [1.5, 2.5, 3.5, 4.5, 6, 7.5, 9.5, 12].forEach((m) => dirs.forEach(([dx, dy]) =>
          ring.push(box([X + dx * ((kb.x1 - kb.x0) / 2 + w / 2 + 4 + fs * m), (kb.y0 + kb.y1) / 2 + dy * ((kb.y1 - kb.y0) / 2 + h / 2 + gap + fs * m * 0.6)]))));
        const misleading = (q) => { const own = gapOf(q, kb);
          return obstacles.near({ x0: q.x0 - own, x1: q.x1 + own, y0: q.y0 - own, y1: q.y1 + own }).some((b) => b.key && b.key !== e.key && gapOf(q, b) < own); };
        cand = ring.filter((q) => !misleading(q)).concat(ring.filter(misleading));
      } else cand = cand.map(box);
      let choice = null;
      for (const q of cand) {
        if (!inner(q)) continue;
        const pq = pad(q);
        if (occupied.some(pq) || obstacles.some(pq, (b) => b.key !== e.key)) continue;
        choice = q; break;
      }
      // Only the selected mountain and its direct neighbours in the chain are named even without free space
      if (!choice && forced) {
        // Covering a proof point costs much more than covering another name or symbol
        const cost = (q) => (inner(q) ? 0 : 1e9) + occupied.all.reduce((s, b) => s + overlap(q, b), 0) + obstacles.all.reduce((s, b) => s + (b.key === e.key ? 0 : overlap(q, b) * (b.point ? 1e4 : 1)), 0);
        const free = cand.filter((q) => inner(q) && !obstacles.some(pad(q), (b) => b.point));
        choice = (free.length ? free.slice(0, 6) : cand.slice(0, 6)).reduce((a, b) => (cost(b) < cost(a) ? b : a));
      }
      if (!choice || dry) return choice && pad(choice);
      e.nameBox = pad(choice); occupied.push(e.nameBox); e.slot = true;
      // Leader line if the name is far away or another element lies closer to the name than its own
      const ab = gapOf, own = ab(choice, kb), width = kb.x1 - kb.x0;
      // (only boxes within the distance own can be closer; the index finds them faster than a test of all boxes)
      const foreign = obstacles.near({ x0: choice.x0 - own, x1: choice.x1 + own, y0: choice.y0 - own, y1: choice.y1 + own }).some((h) => h.key && h.key !== e.key && ab(choice, h) + 2 < own);
      if (own > Math.max(8, width * 0.6) || foreign) {
        const lx = clamp((kb.x0 + kb.x1) / 2, choice.x0, choice.x1), ly = clamp((kb.y0 + kb.y1) / 2, choice.y0, choice.y1);
        // The line ends clearly inside the symbol: from the edge of its box halfway to its centre (user, 2026-10-20)
        const ex = clamp(lx, kb.x0, kb.x1), ey = clamp(ly, kb.y0, kb.y1), cx = (kb.x0 + kb.x1) / 2, cy = (kb.y0 + kb.y1) / 2;
        // Draft 10: the leader line of a bridge ends on the middle of its deck
        e.guide = e.n.kind === "bruecke" ? [lx, ly, e.X, e.Y] : [lx, ly, ex + (cx - ex) * 0.5, ey + (cy - ey) * 0.5];
      }
      if (!probe) e.lab.setAttribute("transform", `translate(${choice.px.toFixed(1)} ${choice.py.toFixed(1)}) scale(${sc.toFixed(4)})`);
    }
    // Area name: options (variant with one to three lines, scale) from large to small; for each option candidate
    // points around the anchor of the area and around the anchor moved into the view, nearest first. A point other
    // than the anchor must lie inside the area.
    function placeRegion(o, extra) {   // extra: further boxes to avoid
      const X = o.x * k + tx, Y = o.y * k + ty;
      // Area outside the view: no name
      if (!intersects({ x0: o.bb.x0 * k + tx, x1: o.bb.x1 * k + tx, y0: o.bb.y0 * k + ty, y1: o.bb.y1 * k + ty }, image)) return null;
      // Grid points in the view, nearest first; they are tried after the points near the anchor
      const grid = o.grid.map(([gx, gy]) => ({ px: gx * k + tx, py: gy * k + ty, middle: false })).filter((g) => g.px > image.x0 && g.px < image.x1 && g.py > image.y0 && g.py < image.y1);
      grid.forEach((g) => (g.d = Math.hypot(g.px - X, g.py - Y))); grid.sort((p, q) => p.d - q.d);
      const fsW = o.country ? Math.min(o.fsMax, o.fs0 * Math.pow(z, 0.3)) : Math.min(o.fsMax, o.fs0 * Math.pow(z, 0.2));
      const options = [];
      o.variants.forEach((v, i) => {
        // Six sizes from the largest one that fits the area down to the smallest admissible one; more lines are
        // preferred only when they allow a clearly larger name
        const sMax = Math.min(fsW / REF, o.len * k * 0.9 / v.w, o.height * k * 0.85 / (v.n * 1.25 * REF)), sMin = o.fsMin / REF;
        if (sMax < sMin) return;
        for (let j = 0; j <= 5; j++) { const sc = sMax * Math.pow(sMin / sMax, j / 5); options.push({ i, sc, rank: sc / Math.pow(1.15, v.n - 1) }); }
      });
      options.sort((a, b) => b.rank - a.rank);
      const c = Math.cos(o.th), s = Math.sin(o.th), ux = s, uy = -c;
      for (const { i, sc } of options) {
        const v = o.variants[i], A = v.all, hx = Math.max(-A.x0, A.x1) * sc, hy = Math.max(-A.y0, A.y1) * sc, step = v.n * LH * REF * sc;
        const ix = clamp(X, image.x0 + hx + 6, image.x1 - hx - 6), iy = clamp(Y, image.y0 + hy + 6, image.y1 - hy - 6);
        const bases = [[X, Y]]; if (Math.abs(ix - X) > 1 || Math.abs(iy - Y) > 1) bases.push([ix, iy]);
        const cand = [];
        bases.forEach(([bx, by], bi) => [0, -0.2, 0.2, -0.38, 0.38].forEach((a) => [0, -0.75, 0.75, -1.5, 1.5, -2.5, 2.5].forEach((m) => {
          const px = bx + c * a * v.w * sc + ux * step * m, py = by + s * a * v.w * sc + uy * step * m;
          cand.push({ px, py, middle: bi === 0 && !a && !m, d: Math.hypot(px - X, py - Y) });
        })));
        cand.sort((p, q) => p.d - q.d);
        for (const { px, py, middle } of cand.concat(grid)) {
          if (px + A.x0 * sc < image.x0 || px + A.x1 * sc > image.x1 || py + A.y0 * sc < image.y0 || py + A.y1 * sc > image.y1) continue;
          const q = pad({ x0: px + A.x0 * sc, x1: px + A.x1 * sc, y0: py + A.y0 * sc, y1: py + A.y1 * sc });
          // Coarse test with the box around the whole name, fine test with the boxes along its lines
          const near = occupied.near(q).concat(obstacles.near(q), extra.filter((b) => intersects(q, b)));
          const parts = v.boxes.map((b) => pad({ x0: px + b.x0 * sc, x1: px + b.x1 * sc, y0: py + b.y0 * sc, y1: py + b.y1 * sc }));
          if (near.length && parts.some((p) => near.some((b) => intersects(p, b)))) continue;
          // Away from the anchor the whole name must lie in its area: the center of every piece lies inside
          if (!middle && !parts.every((p) => o.cells.some((zz) => inPolygon(zz, ((p.x0 + p.x1) / 2 - tx) / k, ((p.y0 + p.y1) / 2 - ty) / k)))) continue;
          return { X: px, Y: py, sc, v: i, box: q, parts };
        }
      }
      return null;
    }
    // Places the name of area o; returns whether it is shown
    function setRegion(o, r) { if (r) Object.assign(o, r); else { o.box = null; o.parts = null; } return !!r; }
    function showRegion(o, an, dy) {
      if (!an) { if (o.an) { o.g.classList.add("aus"); o.an = false; } return; }
      if (o.active !== o.v) { o.variants.forEach((v, i) => v.g.setAttribute("display", i === o.v ? "inline" : "none")); o.active = o.v; }
      const op = (o.country ? clamp(o.opacityOf - 0.08 * Math.log2(z), 0.32, o.opacityOf) : o.opacityOf) * (chain ? 0.55 : 1);
      o.g.style.opacity = op.toFixed(2);
      o.g.setAttribute("transform", `translate(${o.X.toFixed(1)} ${(o.Y + dy).toFixed(1)}) scale(${o.sc.toFixed(4)})`);
      if (!o.an) { o.g.classList.remove("aus"); o.an = true; }
    }
    if (chain) {
      // Selection: only the chain is named, close members larger
      const terms = [...chain.entries()].sort((a, b) => a[1] - b[1] || EK[b[0]].w - EK[a[0]].w);
      terms.forEach(([key, d]) => { const e = EK[key]; if (!e) return;
        const fs = d === 0 ? 17 : d === 1 ? Math.max(13, FS[e.level][0]) : d === 2 ? 12 : 11;
        // Draft 10: with a bridge selected, its many partial results are named only where there is room
        // Todo B62: the names of the hill ranges of the chain (premises, or the selected theory) appear in any case
        // Plan step 4.5: a city has no name on the map; but in a selected chain (premise of the selected theorem or of its
        // shown proof) it is named like every other member (user, 2026-10-22)
        placeMountain(e, fs * grow, d === 0 || (d === 1 && M.K[selected].kind !== "bruecke")); });
    }
    // Todo B62 (user, 2026-10-21): with a selection only the countries and provinces from which an element of the shown
    // chain comes keep their names; all other names of countries and provinces are hidden while the selection lasts
    const chainAreas = new Set();
    if (chain) [...chain.keys()].forEach((key) => { const n = M.K[key]; if (!n) return;
      if (n.province === CONDO) chainAreas.add(CONDO); else { chainAreas.add(n.province); (n.countries || []).forEach((c) => chainAreas.add(String(c))); } });
    const areaAllowed = (o) => !chain || chainAreas.has(o.areaKey);
    const outcome = new Map();
    // Labels that are turned off (todo B17/B20) are not placed and therefore occupy no space.
    // Countries first try to leave free the place that the most important mountains would take for their names
    const reserved = [];
    if (!chain) E.rank.forEach((e) => { if (e.level === 1 && e.visible && nameSwitch(e)) { const q = placeMountain(e, FS[1][0] * grow, false, true); if (q) reserved.push(q); } });
    // (unless the name would then be much smaller)
    regions.filter((o) => o.country).forEach((o) => {
      let r = null;
      if (shown.laender && areaAllowed(o)) {
        const free = placeRegion(o, []), conflict = free && free.parts.some((p) => reserved.some((b) => intersects(p, b)));
        const polite = conflict ? placeRegion(o, reserved) : null;
        // User, 2026-10-22 (BSD): the name of a country gives way to a name of level 1 unless it would shrink below half
        // its size (before: three quarters, so "Arithmetic geometry" took the place above the BSD conjecture)
        r = polite && polite.sc >= 0.5 * free.sc ? polite : free;
      }
      const an = setRegion(o, r); if (an) occupied.push(...o.parts); outcome.set(o, an); });
    // Level 1, then level 2 before the provinces (todo B50): a province name gives way or is left out rather than the
    // name of one of the most important mountains. Per level first all names near their symbols, then the names
    // without such a place further away, so that a far name does not take the near place of another one.
    // A name of level 1 that still has no place: a neighbouring name of level 1 makes room if both then find a place.
    // nearOnly (user, 2026-10-22, BSD): the name e may only take a place next to its symbol, not one further away
    function makeRoom(e, fs, nearOnly) {
      const kb = e.box, near = E.filter((n) => n.slot && n !== e && n.level === 1 && n.nameBox && gapOf(n.nameBox, kb) < 6 * fs)
        .sort((a, b) => gapOf(a.nameBox, kb) - gapOf(b.nameBox, kb));
      for (const n of near) {
        const before = occupied.all.slice(), keep = { nameBox: n.nameBox, guide: n.guide }, t = n.lab.getAttribute("transform");
        occupied = boxIndex(before.filter((b) => b !== n.nameBox)); n.slot = false; n.guide = null;
        (nearOnly ? [false] : [false, true]).forEach((wide) => { if (!e.slot) placeMountain(e, fs, false, false, wide); });
        if (e.slot) [false, true].forEach((wide) => { if (!n.slot) placeMountain(n, fs, false, false, wide); });
        if (e.slot && n.slot) return;
        occupied = boxIndex(before); Object.assign(e, { slot: false, guide: null, nameBox: null });
        Object.assign(n, keep, { slot: true }); if (!probe) n.lab.setAttribute("transform", t);
      }
    }
    if (!chain) [1, 2].forEach((l) => {
      const fsL = FS[l][0] * grow, mine = E.rank.filter((e) => e.level === l && e.visible && nameSwitch(e));
      mine.forEach((e) => { if (!e.slot) placeMountain(e, fsL, false, false, false); });
      // A name of level 1 without a place next to its symbol first asks a neighbour of level 1 to move (which may itself
      // go further away), before it would take a place further away with a leader line (user, 2026-10-22: "once and for all")
      if (l === 1) mine.forEach((e) => { if (!e.slot && e.inImage && e.box) makeRoom(e, fsL, true); });
      mine.forEach((e) => { if (!e.slot) placeMountain(e, fsL, false, false, true); });
      if (l === 1) mine.forEach((e) => { if (!e.slot && e.inImage && e.box) makeRoom(e, fsL); });
      // (Until plan step 4.5 the hill ranges took their place on the foot line of their symbol here; cities have no name.)
    });
    regions.filter((o) => !o.country && o.forest == null).forEach((o) => { const an = setRegion(o, shown.provinzen && areaAllowed(o) && placeRegion(o, [])); if (an) occupied.push(...o.parts); outcome.set(o, an); });
    // Plan step 2.2: names of the forests after the provinces, only with the trees shown and without a selection
    regions.filter((o) => o.forest != null).forEach((o) => { const an = setRegion(o, shown.baeume && !chain && placeRegion(o, [])); if (an) occupied.push(...o.parts); outcome.set(o, an); });
    if (!chain) E.rank.forEach((e) => {
      if (e.slot || e.level <= 2 || !nameSwitch(e)) return;
      placeMountain(e, FS[e.level][0] * grow, false);
    });
    // Plan step 2.2: names of the trees last, from TREE_NAME_Z on and only where there is room; larger trees first
    if (probe) return;
    if (!chain && shown.baeume && z >= TREE_NAME_Z) TREES.slice().sort((a, b) => b.s - a.s || (a.key < b.key ? -1 : 1)).forEach((t) => {
      if (z < t.zA * 1.25) return;
      placeMountain(t, TREE_FS * grow, false);
    });
    outcome.forEach((an, o) => showRegion(o, an, 0));
    E.concat(TREES).forEach((e) => {
      const on = e.slot && !e.hidden;
      if (on !== e.labAt) { e.lab.classList.toggle("aus", !on); e.labAt = on; }
      const fa = !!e.guide && !e.hidden;
      if (fa) { const [a, b, c, d] = e.guide; e.lead.setAttribute("x1", f(a)); e.lead.setAttribute("y1", f(b)); e.lead.setAttribute("x2", f(c)); e.lead.setAttribute("y2", f(d)); }
      if (fa !== e.leadAt) { e.lead.setAttribute("display", fa ? "inline" : "none"); e.leadAt = fa; }
    });
  }

  // ------------------------------------------------------------ Selection and info box
  const selDoves = [], selGroups = [];
  // Formula without scroll bars (todo B13): inline mode with \displaystyle so that KaTeX breaks lines after relations
  // and operators; additional break points before \quad and between the words in \text{…}; an outer gathered
  // environment is turned into lines with \\. An aligned environment (todo B34) stays a block: its rows are kept and
  // aligned at &, but a row cannot break, so rows in the data must be short. Against breaks at unfavourable places
  // (todo B44, P21) a set in braces \{…\} is kept on one line, and so is every row of at most SHORT_ROW characters of
  // LaTeX (for example "\operatorname{Re}\rho = \tfrac12" no longer breaks after the equals sign); a row that is still
  // too wide scrolls. The same function exists in ../Beispiel Algebraische Geometrie/graph.js.
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
  const tex = (s) => { try { return '<span class="formel-umbruch">' + katex.renderToString("\\displaystyle " + wrap(s), { throwOnError: false }) + "</span>"; } catch (e) { return ""; } };
  // Plan step 4.5: an element without a symbol on the map (a counterexample) is named without a link
  const choiceLink = (k) => !M.K[k] ? k : EK[k] ? `<span class="wahl" data-k="${k}">${M.K[k].name}</span>` : `<span class="ohne-symbol">${M.K[k].name}</span>`;
  const STATE = Object.assign({}, window.AR.statuses || {}, window.AG.statuses || {});
  const EVENT = { vermutet: "vermutet", bewiesen: "bewiesen", teilweise: "teilweise bewiesen", bedingt: "bedingt bewiesen", verallgemeinert: "verallgemeinert",
    uebertragen: "übertragen", widerlegt: "widerlegt", beansprucht: "Beweis beansprucht", einwand: "Einwand", gefunden: "gefunden" };
  Object.keys(EVENT).forEach((a) => (EVENT[a] = U(EVENT[a])));
  // Relations in the info box, grouped by kind in a fixed order (todo B44, P19); per kind the heading for relations
  // that start at the element and for relations that end there. Symmetric kinds have one heading.
  const REL_GROUPS = [["teilresultat", "Teilresultat zu", "Teilresultate"], ["aequivalent", "Bewiesen äquivalent zu", "Bewiesen äquivalent zu"],
    ["widerlegt", "Widerlegt", "Gegenbeispiele"], ["analogie", "Analog zu", "Analog zu"], ["deutung", "Zeigt die Bedeutung von", "Deutungen"],
    ["formulierung", "Nötig für die Formulierung von", "Voraussetzungen der Formulierung"]].map(([kind, out, inc]) => ({ kind, out: U(out), inc: U(inc) }));
  const FLAGS = { grundlegend: "besonders wichtig", staunen: "erstaunlich", zusammenhang: "schön", verstehen: "erst nach dem Verstehen erstaunlich", einfach: "einfach zu verstehen",
    klassifikation: "Klassifikationssatz" };
  Object.keys(FLAGS).forEach((a) => (FLAGS[a] = U(FLAGS[a])));
  const AG_PATH = "../../graphs/algebraic-geometry/", AR_PATH = "../../graphs/arithmetic-geometry/";
  const LARGE_PATH = "../../playground/Gro%C3%9Fe%20S%C3%A4tze%20und%20Vermutungen/index.html", GALLERY_PATH = "../../playground/Mathematical%20Wonder/index.html";

  // ------------------------------------------------------------ Proof order and stages (todos B21 and B30)
  // Proofs of a theorem in historical order: the year of a proof is the earliest year of a history event that names
  // it in the field `proof`; proofs without a year follow in data order.
  // plan 4.5, follow-up 3: a proof of a ruin that comes from a counterexample has its dates in the history of the counterexample
  const proofHistory = (n, b) => (b.counterexample && M.K[b.counterexample] ? M.K[b.counterexample].history : n.history);
  const orderMemo = new Map();
  function ordered(key) {
    if (orderMemo.has(key)) return orderMemo.get(key);
    const n = M.K[key], year = (b) => { const y = proofHistory(n, b).filter((h) => h.proof && h.proof === b.name && h.year).map((h) => h.year); return y.length ? Math.min(...y) : Infinity; };
    const r = n.proofs.map((b, i) => ({ b, i, y: year(b) })).sort((a, b) => (a.y - b.y) || a.i - b.i).map((x) => x.b);
    orderMemo.set(key, r); return r;
  }
  const shownProof = new Map();   // key -> proof shown for this mountain (default: the first in historical order)
  const baseShown = (key) => shownProof.get(key) || ordered(key)[0] || null;
  // While the pointer rests on an entry of the proof list in the info box, that proof of the selected mountain is
  // drawn as a preview (todo B30); the shown proof and the address stay unchanged.
  let preview = null;
  const shownOf = (key) => (preview && key === selected ? preview : baseShown(key));
  // Switch "alle Beweise" (todo B30): all proofs of the selected mountain at once, each in its own colour, only stage 1.
  // At most four colours (PROOF_COLORS); further proofs remain hollow points.
  let allMode = false;
  const multi = (key) => !!key && M.K[key].proofs.length > 1;
  // Stages of the selected mountain: P[d] premises of the shown proofs of P[d-1] that are not yet shown, C[d] theorems
  // whose proofs use a member of C[d-1]; via: consequence -> its first proof (historical order) using such a member.
  function stages(key) {
    const P = [[key]], C = [[key]], seen = new Set([key]), seenC = new Set([key]), via = new Map();
    for (;;) { const next = [];
      P[P.length - 1].forEach((k) => { const b = shownOf(k); if (b) b.premises.forEach((p) => { if (!seen.has(p) && EK[p]) { seen.add(p); next.push(p); } }); });
      if (!next.length) break; P.push(next); }
    for (;;) { const prev = new Set(C[C.length - 1]), next = [];
      prev.forEach((m) => M.K[m].usage.forEach((b) => { const t = b.from; if (seenC.has(t) || !EK[t]) return;
        seenC.add(t); next.push(t); via.set(t, ordered(t).find((x) => x.premises.some((p) => prev.has(p)))); }));
      if (!next.length) break; C.push(next); }
    return { P, C, via, maxBack: P.length - 1, maxFwd: C.length - 1 };
  }
  let back = 0, fwd = 0, stg = null, startView = null, pointerStale = false;   // shown stages of premises and consequences; view before the selection

  function select(key, memorize, b0, f0) {
    const n = M.K[key];
    if (!n || !EK[key]) return;
    if (!selected) startView = { z, cx, cy };   // switching from one mountain to another keeps the original view
    if (key !== selected) allMode = false;
    preview = null;
    selected = key; back = b0 == null ? 1 : b0; fwd = f0 || 0;
    rebuild();
    if (memorize !== false) remember();
  }
  // Draws the stages of the selected mountain (counts are clamped to the available depth) and fills the info box.
  // mapOnly: only the map is redrawn (preview of a proof while the pointer is over the proof list).
  function rebuild(mapOnly) {
    const key = selected, n = M.K[key];
    selG.innerHTML = ""; dirSel.innerHTML = ""; pointsSel.innerHTML = ""; layerExtra.innerHTML = ""; selDoves.length = 0; selGroups.length = 0;
    // The stage counts belong to the shown proof; a preview uses them without changing them
    const st = stages(key);
    if (!preview) { stg = st; back = clamp(back, 0, st.maxBack); fwd = clamp(fwd, 0, st.maxFwd); }
    const all = allMode && !preview && multi(key), bk = all ? 1 : clamp(back, 0, st.maxBack), fw = all ? 0 : clamp(fwd, 0, st.maxFwd);
    const allProofs = all ? ordered(key) : [];
    chain = new Map([[key, 0]]);
    if (all) allProofs.slice(0, PROOF_COLORS.length).forEach((b) => b.premises.forEach((p) => { if (EK[p] && !chain.has(p)) chain.set(p, 1); }));
    for (let d = 1; d <= bk && !all; d++) st.P[d].forEach((k) => chain.set(k, d));
    for (let d = 1; d <= fw; d++) st.C[d].forEach((k) => { if (!chain.has(k)) chain.set(k, d); });
    // Partners of analogies (ferries) and partial results belong to the shown chain at distance 1, without being a stage
    // Todo B69 g (user, 2026-10-22): a selected construction plan does not highlight its partial results (the proved bridges
    // of the fjord); the info box still lists them
    const plan = n.kind === "bruecke" && n.stage === "bauplan";
    n.rel.filter((r) => (r.kind === "teilresultat" && !plan) || r.kind === "analogie").forEach((r) => { const o = r.from === key ? r.to : r.from; if (!chain.has(o) && EK[o]) chain.set(o, 1); });
    // Drawn proofs: the shown proof of each member of the premise stages 0 … back−1 (with hollow points for the
    // other proofs), the connecting proof of each consequence; the newest stage of each direction strong, drawn last
    pointerStale = true;
    const list = [];
    // A consequence of stage d is drawn only with the routes from the selected theorem and from consequences of the
    // stages 1 … d−1 (todo B52 b). Other premises of its proof, also those that are themselves shown consequences of
    // the same or a later stage (e.g. for the Artin reciprocity law), are foreign premises and are left out.
    const earlier = [new Set([key])];
    for (let d = 1; d <= fw; d++) earlier[d] = new Set([...earlier[d - 1], ...st.C[d]]);
    if (all) {   // one group: every proof of the selected mountain with its own colour, beyond four colours hollow points
      const G = { key, items: allProofs.map((b, i) => proofItem(b, key, true, i < PROOF_COLORS.length ? "filled" : "hollow", PROOF_COLORS[i])) };
      selGroups.push(G);
    }
    for (let d = 0; d < bk && !all; d++) st.P[d].forEach((k) => { const b = shownOf(k); if (b) list.push([k, b, d === bk - 1, true]); });
    for (let d = 1; d <= fw; d++) st.C[d].forEach((t) => { const b = st.via.get(t); if (b) list.push([t, b, d === fw, false, earlier[d - 1]]); });
    list.sort((a, b) => a[2] - b[2]).forEach(([t, b, strong, alts, from]) => {
      const all = M.K[t].proofs, G = { key: t, items: [] };
      const point = all.length > 1 || b.premises.filter((p) => placement[p] && !hiddenNode(p)).length > 1;
      G.items.push(proofItem(b, t, strong, point ? "filled" : null, null, alts ? null : from));
      if (alts && all.length > 1) ordered(t).forEach((x) => { if (x !== b) G.items.push(proofItem(x, t, false, "hollow")); });
      selGroups.push(G);
    });
    n.rel.filter((z) => z.kind === "analogie").forEach((z) => {
      const o = z.from === key ? z.to : z.from; if (!placement[o]) return;
      const a = placement[key], b = placement[o];
      const line = el("path", { fill: "none", stroke: "#2f5566", "stroke-width": 1.6, "stroke-dasharray": "1.5 5", "stroke-linecap": "round" }, layerExtra);
      const g = el("g", {}, layerExtra);
      g.setAttribute("class", "taube"); dove(g);
      selDoves.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, g, line, a, b });
    });
    if (!mapOnly) showInfo(n);
    request();
  }
  // Click (dir "back") or right-click (dir "fwd") on a theorem (todo B69 c, user 2026-10-22): a click shows the
  // immediate premises of its first proof, a right click its immediate consequences; there are no further stages. A
  // second click of the same kind on the selected theorem ends the selection and returns to the view before it; a
  // click of the other kind switches between premises and consequences.
  // User, 2026-10-22 (one rule for theorems, conjectures and theories): a click shows the premises, a right click the
  // consequences; if there are none on the map, nothing happens on the map (see inert)
  function step(key, dir) {
    if (!M.K[key] || !EK[key]) return;
    const b0 = dir === "back" ? 1 : 0, f0 = dir === "fwd" ? 1 : 0;
    if (key !== selected) { select(key, true, b0, f0); fit(); return; }
    if (allMode || (back === b0 && fwd === f0)) {
      const v = startView; deselect();
      if (v) travel(v.z, v.cx, v.cy);
      return;
    }
    back = b0; fwd = f0;
    rebuild(); remember(); fit();
  }
  // Another proof of the mountain key becomes the shown one; the chain is recomputed with the same stage counts
  function showOther(key, b) {
    shownProof.set(key, b);
    preview = null;
    if (key === selected) allMode = false;
    if (!selected) return;
    rebuild(); remember(); fit();
  }
  // Previous (d = -1) or next (d = 1) proof of the selected mountain, cyclically (arrow buttons and arrow keys)
  function cycle(d) {
    if (!multi(selected)) return;
    const o = ordered(selected), i = o.indexOf(baseShown(selected));
    showOther(selected, o[(i + d + o.length) % o.length]);
  }
  function setAll(on) {
    if (!multi(selected)) return;
    allMode = !!on; preview = null;
    rebuild(); remember(); fit();
  }
  // Preview of the proof b of the selected mountain (null ends the preview); only the map is redrawn
  function showPreview(b) {
    if (!selected) return;
    const v = b && (allMode || b !== baseShown(selected)) ? b : null;
    if (v === preview) return;
    preview = v; rebuild(true);
  }
  // If not all members of the chain lie in the view (with a margin), move to the center of their bounding box and
  // zoom out as far as needed; never zoom in.
  // The usable area keeps 80 px from the frame, so that names and proof points stay clear. The cartouche (fixed in the
  // corner of the frame since the addendum "water") is at most about 62 px high, so it lies above the usable area.
  function fit(instant) {
    if (!chain) return;
    const keys = [...chain.keys()], xs = keys.map((q) => placement[q].x), ys = keys.map((q) => placement[q].y), k = k0 * z, mg = 80;
    const A = { x0: MARGIN + mg, x1: Wv - MARGIN - mg, y0: MARGIN + mg, y1: Hv - MARGIN - mg };
    if (keys.every((q) => { const X = (placement[q].x - cx) * k + Wv / 2, Y = (placement[q].y - cy) * k + Hv / 2;
      return X >= A.x0 && X <= A.x1 && Y >= A.y0 && Y <= A.y1; })) return;
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const zf = Math.min((A.x1 - A.x0) / Math.max(1e-6, (x1 - x0) * k0), (A.y1 - A.y0) / Math.max(1e-6, (y1 - y0) * k0));
    const z1 = clamp(Math.min(z, zf), 1, Z_MAX), k1 = k0 * z1;
    // the center of the bounding box goes to the center of the usable area
    const x = (x0 + x1) / 2 - ((A.x0 + A.x1) / 2 - Wv / 2) / k1, y = (y0 + y1) / 2 - ((A.y0 + A.y1) / 2 - Hv / 2) / k1;
    if (instant) { z = z1; cx = x; cy = y; clampView(); request(); } else travel(z1, x, y);
  }
  // Selection from a link in the info box: like a click on a mountain that is not selected
  // An element without a proof on the map only shows its info box, as on a click on the map (user, 2026-10-22)
  function choose(key) { if (key === selected || (inert(key, "back") && M.K[key].kind !== "bruecke")) showInfo(M.K[key]); else step(key, "back"); }
  // Line 2 of the hover box and the info box (todo B26, B44): "Persons (year)". Theorem: the first event „bewiesen“;
  // conjecture: the first „vermutet“; refuted conjecture (mirage): the refutation; counterexample: „gefunden“, else the
  // first „bewiesen“. A field `credit` = { person, year, circa } of the raw node takes precedence. Empty without event.
  function creditEvent(n) {
    if (n.credit) return n.credit;
    const first = (kind) => { const h = n.history.filter((x) => x.kind === kind); return h.find((x) => x.year) || h[0] || null; };
    if (n.kind === "trugbild") return first("widerlegt");
    if (n.type === "vermutung") return first("vermutet");
    if (n.type === "gegenbeispiel") return first("gefunden") || first("bewiesen");
    return first("bewiesen");
  }
  const personsYear = (x) => {
    const who = (x.person || []).join(", "), year = x.year ? (x.circa ? U("um ") : "") + x.year : "";
    return who && year ? `${who} (${year})` : who || year;
  };
  // "A, B und C (year)": persons of one proof joined with "und", so that the entries of line 2 stay apart (todo B52)
  const personsAnd = (x) => {
    const p = x.person || [], who = p.length > 1 ? p.slice(0, -1).join(", ") + U(" und ") + p[p.length - 1] : p.join("");
    return personsYear(Object.assign({}, x, { person: who ? [who] : [] }));
  };
  // Persons and year of every proof of n (todo B52), as a map proof -> event: the earliest event of the history that
  // names the proof in the field `proof`. The first proof in historical order without such an event gets the first
  // event "bewiesen" (for a conjecture "bedingt") that names no other proof. Proofs without data: null.
  const proofCreditMemo = new Map();
  function proofCredits(n) {
    if (proofCreditMemo.has(n.key)) return proofCreditMemo.get(n.key);
    const o = ordered(n.key), R = new Map(), names = new Set(n.proofs.map((b) => b.name).filter(Boolean));
    const earliest = (hs) => hs.reduce((a, h) => (!a || (h.year && (!a.year || h.year < a.year)) ? h : a), null);
    let used = false;
    o.forEach((b) => {
      // plan 4.5, follow-up 3: a proof that comes from a counterexample is credited from the history of the counterexample
      if (b.counterexample) { const hs = proofHistory(n, b), x = earliest(hs.filter((h) => b.name && h.proof === b.name)) || earliest(hs.filter((h) => h.kind === "gefunden" || h.kind === "bewiesen"));
        R.set(b, x && ((x.person && x.person.length) || x.year) ? x : null); return; }
      let x = b.name ? earliest(n.history.filter((h) => h.proof === b.name && h.kind !== "numerisch")) : null;
      if (!x && !used) {
        x = earliest(n.history.filter((h) => (h.kind === "bewiesen" || h.kind === "bedingt") && !(h.proof && names.has(h.proof))));
        used = true;
      }
      R.set(b, x && ((x.person && x.person.length) || x.year) ? x : null);
    });
    proofCreditMemo.set(n.key, R); return R;
  }
  // Line 2 for the search suggestions: only the first originator (creditEvent), "Persons (year)"
  function creditShort(n) { const x = creditEvent(n); return x ? personsYear(x) : ""; }
  // Line 2 of the hover box and the info box (todo B52). Theorem: "Bewiesen von X (year), Y (year), ...", one entry per
  // proof in historical order (proofCredits); a field `credit` replaces the first entry; equal entries once, entries
  // without persons are left out. Conjecture: "Vermutet von X (year)". Refuted conjecture (user's feedback,
  // 20 October 2026): "Persons (year), widerlegt durch X (year)". Counterexample, theory, bridge: "Persons (year)".
  function creditLine(n) {
    if (n.kind === "trugbild" && !n.credit) {
      const h = n.history, c = h.find((x) => x.kind === "vermutet"), w = h.find((x) => x.kind === "widerlegt");
      const a = c ? personsYear(c) : "", b = w ? personsYear(w) : "";
      return a && b ? FM("{0}, widerlegt durch {1}", a, b) : a || (b ? FM("Widerlegt durch {0}", b) : "");
    }
    if (n.type === "satz") {
      const entries = ordered(n.key).map((b) => proofCredits(n).get(b));
      if (n.credit) entries[0] = n.credit;
      // Historical order of the entries: an event that names no proof (first fallback) may be older than a proof with a year
      entries.map((x, i) => [x, i]).sort((a, b) => ((a[0] && a[0].year) || Infinity) - ((b[0] && b[0].year) || Infinity) || a[1] - b[1]).forEach((e, i) => (entries[i] = e[0]));
      if (!entries.length) { const x = creditEvent(n); if (x) entries.push(x); }
      const parts = [...new Set(entries.filter((x) => x && x.person && x.person.length).map(personsAnd))];
      return parts.length ? FM("Bewiesen von {0}", parts.join(", ")) : "";
    }
    const x = creditEvent(n);
    if (!x) return "";
    if (n.type === "vermutung" && x.person && x.person.length) return FM("Vermutet von {0}", personsAnd(x));
    return personsYear(x);
  }
  // Statement in words (field `short`, todo B26); theories and elements without it: the first sentence of `text`
  function firstSentence(h) {
    if (!h) return "";
    let t = h.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„(])/)[0];
    if (t.replace(/<[^>]+>/g, "").length > 220) {
      t = t.slice(0, 240).replace(/<[^>]*$/, "").replace(/\s+\S*$/, "");
      ["sub", "sup", "i", "b"].forEach((tag) => { const up = (t.match(new RegExp("<" + tag + ">", "g")) || []).length, zu = (t.match(new RegExp("</" + tag + ">", "g")) || []).length; for (let i = zu; i < up; i++) t += "</" + tag + ">"; });
      t += " …";
    }
    return t;
  }
  // The prefix „Vermutung:“ of the short statement of a conjecture is not shown (user's feedback, 20 October 2026); the
  // hover box marks a conjecture after its name instead, unless the name already says so
  const stripConj = (t) => String(t || "").replace(/^\s*(Vermutung|Conjecture)\s*:\s*/i, "");
  const shortOf = (n) => (n.short && n.type === "vermutung" ? stripConj(n.short) : n.short);
  const statement = (n) => shortOf(n) || firstSentence(n.text);
  function kindLine(n) {
    if (n.kind === "bruecke") return BRIDGE_STAGE[n.stage] || "";
    if (n.kind !== "gipfel") return KIND[n.kind] || "";
    return !n.state || n.state === "offen" ? U("Offene Vermutung") : U("Vermutung") + ", " + (STATE[n.state] || n.state);
  }
  // Long lists (todo B44): from LONG entries on only the first SHOWN are visible, a button shows the rest
  const LONG = 6, SHOWN = 4;
  function longList(items, tag, attrs, keep) {   // keep: index that must stay visible (e.g. the highlighted proof)
    const cut = items.length >= LONG && !(keep >= SHOWN) ? SHOWN : items.length;
    const more = items.length - cut;
    if (tag === "span") return items.slice(0, cut).join(", ") + (more ? `<span class="mehr" hidden>, ${items.slice(cut).join(", ")}</span> <button class="alle-zeigen">${FM("alle {0} zeigen", items.length)}</button>` : "");
    return `<ul${attrs || ""}>${items.map((x, i) => (i < cut ? x : x.replace(/^<li/, '<li class="mehr" hidden'))).join("")}</ul>` +
      (more ? `<button class="alle-zeigen">${FM("alle {0} zeigen", items.length)}</button>` : "");
  }
  // Year of a proof: the earliest event of the history that names it in the field `proof`
  const proofYear = (n, b) => { const hs = proofHistory(n, b), y = hs.filter((h) => h.proof && h.proof === b.name && h.year);
    // plan 4.5, follow-up 3: the proof of a counterexample without an event naming it takes the year the counterexample was found or proved
    const z = y.length ? y : b.counterexample ? hs.filter((h) => (h.kind === "gefunden" || h.kind === "bewiesen") && h.year) : [];
    return z.length ? z.reduce((a, h) => (h.year < a.year ? h : a)) : null; };
  // Info box of a theorem, conjecture, counterexample or theory (todo B44, decisions of 20 October 2026), in this
  // order: 1 head (name, line 2 as in the hover box, kind and state in one line), 2 statement (`short` with formula,
  // then `text` as explanation), 3 „In der Karte gezeigt“ (stages and proof choice), 4 proofs, 5 used in the proof of,
  // 6 relations grouped by kind, 7 history, 8 classification (collapsed), 9 links. Ideas of the proofs and explanations
  // of the relations are collapsed, long lists show their first entries. mark: proof to highlight (a click on a proof
  // point shows the info box of its theorem with this proof highlighted; there is no info box of a proof).
  function showInfo(n, mark) {
    const ctry = (l) => (M.countries[l] ? M.countries[l].name : "");
    const p = M.provinces[n.province], e = EK[n.key], isSel = n.key === selected;
    const all = allMode && isSel && multi(n.key), many = n.proofs.length > 1, sp = baseShown(n.key), o = ordered(n.key);
    const allCond = n.proofs.length > 0 && n.proofs.every((b) => b.element === "grat");
    // 1 Head
    let h = `<button class="zu" title="${U("Schließen")}">×</button><h2>${n.name}</h2>`;
    const credit = creditLine(n);
    if (credit) h += `<div class="zeile2">${credit}</div>`;
    // Todo B69 o (user, 2026-10-22): a proved theorem whose line 2 already says "Proved by ..." gets no line with its kind
    if (!(credit && n.kind === "berg" && n.type === "satz")) h += `<div class="art">${kindLine(n)}</div>`;
    // 2 Statement: the same words as line 3 of the hover box, then the text as explanation
    if (n.short) h += `<div class="kurz">${shortOf(n)}</div>`;
    if (n.formula) h += tex(n.formula);
    if (n.classification) h += `<div class="klein">${U("Klassifikation")}: ${n.classification.objects || ""} – ${n.classification.classes || ""}</div>`;
    if (n.text) h += `<div class="erlaeuterung">${n.text}</div>`;
    // Draft 10: correspondence (bridge): the two sides, the preserved quantity, the dictionary, the arches with years
    // and persons, the unproved parts (gaps)
    if (n.correspondence) {
      const c = n.correspondence, sd = c.sides || [];
      h += `<h3>${U("Die beiden Seiten")}</h3><ul class="klein">${sd.map((s) => `<li><b>${s.name}</b>: ${s.objects || ""}${s.provinces ? ` <i>(${s.provinces.join(", ")})</i>` : ""}</li>`).join("")}</ul>`;
      if (c.direction && BRIDGE_DIRECTIONS[c.direction]) h += `<div class="klein">${U("Bewiesene Richtung")}: ${U(BRIDGE_DIRECTIONS[c.direction])}</div>`;
      if (c.mapping) h += `<div class="klein">${U("Zuordnung")}: ${c.mapping}</div>`;
      if (c.preserved) h += `<h3>${U("Erhaltene Größe")}</h3><div class="klein">${c.preserved.text || ""}</div>` + (c.preserved.formula ? tex(c.preserved.formula) : "");
      if (c.dictionary && c.dictionary.length) h += `<h3>${U("Wörterbuch")}</h3><table class="woerterbuch"><tr><th>${(sd[0] || {}).name || ""}</th><th>${(sd[1] || {}).name || ""}</th></tr>` +
        c.dictionary.map((x) => `<tr><td>${x.side1 || x.a || ""}</td><td>${x.side2 || x.b || ""}</td></tr>`).join("") + `</table>`;
      // Proved cases that are bridges of their own over the same fjord (relation "teilresultat" from a bridge)
      const cases = n.rel.filter((z) => z.kind === "teilresultat" && z.to === n.key && M.K[z.from] && M.K[z.from].kind === "bruecke").map((z) => z.from)
        .sort((a, b) => yearOf(M.K[a]) - yearOf(M.K[b]));
      if (cases.length) h += `<h3>${FM("Bewiesene Fälle: {0} eigene Brücken", cases.length)}</h3><ul class="klein">` + cases.map((k) => {
        const r = n.rel.find((z) => z.kind === "teilresultat" && z.from === k), cr = creditLine(M.K[k]);
        return `<li>${choiceLink(k)}${cr ? `<br><i>${cr}</i>` : ""}${r && r.text ? `<details class="erl"><summary>${U("Erläuterung")}</summary>${r.text}</details>` : ""}</li>`;
      }).join("") + `</ul>`;
      const open = n.stage === "fertig" ? [] : OPEN_PARTS[n.key] || [];
      if (open.length) h += `<h3>${U("Unbewiesene Teile")}</h3><ul class="klein">${open.map((t) => `<li>${U(t)}</li>`).join("")}</ul><div class="klein"><i>${U("Die Liste der unbewiesenen Teile steht vorläufig in der Seite von Entwurf 11, nicht im Datenmodell.")}</i></div>`;
      if (GEOMETRIC_NOTE[n.key]) h += `<div class="klein" style="margin-top:6px">${U(GEOMETRIC_NOTE[n.key])}</div>`;
      const B = BR.find((x) => x.n === n);
      if (B && n.state === "programm") h += `<div class="klein" style="margin-top:6px"><i>${FM("Länge des Fjords (vorläufig): {0} % der Grenze zwischen den Seiten. Der definitorische Abstand im Begriffsgraphen der arithmetischen Geometrie ({1} von {2} Schritten) ergäbe {3} %; auf Wunsch des Nutzers ist der Fjord mindestens {4} % lang.", Math.round(B.F.FL / B.F.bl * 100), B.F.df.d == null ? "?" : B.F.df.d, B.F.df.dMax == null ? "?" : B.F.df.dMax, Math.round(B.F.df.frac * 100), Math.round(FJORD_MIN * 100))}</i></div>`;
    }
    // 3 Shown in the map: stages (todo B21) and choice of the proof (todo B30); only for the selected element and only
    // if there is something to show
    if (isSel && stg) {
      const parts = [];
      if (all) parts.push(U("Voraussetzungen aller Beweise: Stufe 1"));
      else if (stg.maxBack || stg.maxFwd) {
        if (!stg.maxBack) parts.push(U("Voraussetzungen: keine")); else if (back) parts.push(FM("Voraussetzungen: Stufe {0} von {1}", back, stg.maxBack));
        if (fwd) parts.push(FM("Folgerungen: Stufe {0} von {1}", fwd, stg.maxFwd)); else if (!back && !stg.maxFwd) parts.push(U("Folgerungen: keine"));
      }
      let block = parts.length ? `<div class="klein stufen">${parts.join(" · ")}</div>` : "";
      if (multi(n.key)) {
        const i = o.indexOf(sp);
        block += `<div class="beweiswahl"><button class="bw-vor" title="${U("Vorheriger Beweis (Pfeiltaste links)")}">‹</button>` +
          `<span class="bw-stand">${all ? FM(allCond ? "Alle {0} bedingten Beweise" : "Alle {0} Beweise", o.length) : FM(allCond ? "Bedingter Beweis {0} von {1}" : "Beweis {0} von {1}", i + 1, o.length)}</span>` +
          `<button class="bw-nach" title="${U("Nächster Beweis (Pfeiltaste rechts)")}">›</button>` +
          `<label><input type="checkbox" class="bw-alle"${all ? " checked" : ""}> ${U("alle Beweise")}</label></div>`;
      }
      // Todo B44 (user, 2026-10-22): the section is rendered only with SHOW.shownOnMap
      if (block && SHOW.shownOnMap) h += `<h3>${U("In der Karte gezeigt")}</h3>${block}`;
    }
    // 4 Proofs in historical order; with several proofs the shown one is marked, the others switch the shown proof
    // (todo B30). With all proofs shown each entry carries the colour of its routes.
    if (n.proofs.length) {
      const swatch = (i) => (all && i < PROOF_COLORS.length ? `<span class="bw-farbe" style="background:${PROOF_COLORS[i]}"></span>` : "");
      const head = many ? (allCond ? "Bedingte Beweise" : "Beweise") : (allCond ? "Bedingter Beweis" : "Beweis");
      const items = o.map((b, i) => {
        const name = b.name || U("Beweis"), y = proofYear(n, b);
        // todo B44 (user, 2026-10-22): the note "(gezeigt)" (SHOW.proofShownNote) and the line "aus …" (SHOW.proofFrom)
        // are not rendered; the shown proof is bold
        const title = !many || (b === sp && !all) ? `<b>${name}</b>${many && isSel && !all && SHOW.proofShownNote ? " " + U("(gezeigt)") : ""}` : `<span class="wahl" data-b="${i}">${name}</span>`;
        return `<li data-pv="${i}"${b === mark ? ' class="hervor"' : ""}>${swatch(i)}${title}${y ? ` (${y.circa ? U("um ") : ""}${y.year})` : ""}${b.element === "grat" && !allCond ? U(", bedingt") : ""}` +
          (SHOW.proofFrom ? `<br><span class="klein">${U("aus")} ${b.premises.map(choiceLink).join(", ")}</span>` : "") +
          (b.specialCaseOf ? `<div class="klein">${FM("als Spezialfall von {0}", choiceLink(b.specialCaseOf))}</div>` : "") +
          (b.counterexample ? `<div class="klein">${U("Gegenbeispiel")}: ${choiceLink(b.counterexample)}</div>` : "") +   // plan 4.5, follow-up 3
          (b.idea ? `<details class="idee klein"><summary>${U("Beweisidee")}</summary>${b.idea}</details>` : "") + `</li>`;
      });
      h += `<h3>${U(head)}</h3>` + longList(items, "ul", ' class="beweisliste"', mark ? o.indexOf(mark) : -1);
    }
    // 5 Used in the proof of; first the theorems that this one contains as a later special case (todo B31)
    const users = [...new Set(n.usage.map((b) => b.from))];
    // Sections 5, 6, 8 and 9 are rendered only with their setting in SHOW (todo B44, user 2026-10-22)
    if (SHOW.usedIn && (users.length || n.containsSpecial.length)) {
      h += `<h3>${U("Verwendet im Beweis von")}</h3>`;
      if (n.containsSpecial.length) h += `<div class="klein spezialfall">${U("enthält als Spezialfall")}: ${n.containsSpecial.map(choiceLink).join(", ")}</div>`;
      if (users.length) h += `<div class="klein">${longList(users.map(choiceLink), "span")}</div>`;
    }
    // 6 Relations, grouped by kind; per entry the link, the explanation collapsed
    const groups = [];
    // Plan step 4.5: a counterexample has no symbol; under "Gegenbeispiele" of the ruin it is named with its year and its
    // statement in words
    const cex = (k) => (M.K[k] && M.K[k].kind === "ungeheuer" && !EK[k] ? M.K[k] : null);
    const entry = (z, other) => { const c = cex(other);
      return `<li>${choiceLink(other)}${c && c.year ? ` (${c.year})` : ""}${c && c.short ? `<div class="klein">${c.short}</div>` : ""}${z.kind === "aequivalent" && z.evidence ? `<div class="klein">${FM("Bewiesen von {0}", z.evidence)}</div>` : ""}${z.text ? `<details class="erl"><summary>${U("Erläuterung")}</summary>${z.text}</details>` : ""}</li>`; };
    REL_GROUPS.forEach((g) => {
      const outs = n.rel.filter((z) => z.kind === g.kind && z.from === n.key);
      // Draft 10: the partial results of a bridge are listed above as its arches
      const ins = n.rel.filter((z) => z.kind === g.kind && z.to === n.key && !(n.correspondence && g.kind === "teilresultat" && M.K[z.from] && M.K[z.from].kind === "bruecke"));
      if (g.out === g.inc) { const zs = outs.map((z) => entry(z, z.to)).concat(ins.map((z) => entry(z, z.from))); if (zs.length) groups.push([g.out, zs, g.kind]); return; }
      if (outs.length) groups.push([g.out, outs.map((z) => entry(z, z.to)), g.kind]);
      if (ins.length) groups.push([g.inc, ins.map((z) => entry(z, z.from)), g.kind]);
    });
    n.rel.filter((z) => !REL_GROUPS.some((g) => g.kind === z.kind)).forEach((z) => groups.push([z.kind, [entry(z, z.from === n.key ? z.to : z.from)], z.kind]));
    if (SHOW.relations && groups.length) h += `<h3>${U("Beziehungen")}</h3>` + groups.map(([title, zs]) => `<h4>${title}</h4>${longList(zs, "ul", ' class="klein"')}`).join("");
    // User, 2026-10-22: proved equivalences do not appear on the map; without the section "Relations" the info box still
    // names them, with the partner and the proof (field `evidence`)
    else groups.filter((g) => g[2] === "aequivalent").forEach(([title, zs]) => (h += `<h3>${title}</h3>${longList(zs, "ul", ' class="klein"')}`));
    // 7 History (open)
    const hist = n.history.filter((x) => x.year);
    if (hist.length) h += `<h3>${U("Geschichte")}</h3><ul class="klein">${hist.map((x) => `<li>${x.circa ? U("um ") : ""}${x.year}, ${EVENT[x.kind] || x.kind}${x.person ? ": " + x.person.join(", ") : ""}</li>`).join("")}</ul>`;
    // 8 Classification (collapsed): location, measures, flags, magnification
    const flags = Object.keys(FLAGS).filter((a) => hasFlag(n, a)).map((a) => FLAGS[a]);
    let cl = `${U("Land")}: ${n.province === CONDO ? U("Arithmetische Geometrie") : n.countries.map(ctry).join(U(" und "))}`;
    if (n.province !== CONDO) cl += `<br>${U("Provinz")}: ${p ? p.name : ""}`;
    if (n.country2 != null) cl += `<br>${U("Grenzt an")}: ${ctry(n.country2)}`;
    cl += `<br>${U("MSC-Klassen")}: ${n.msc.join(", ")}`;
    cl += `<br>${n.kind === "gebaeude" ? FM("Vorausgesetzt in Beweisen von {0} Sätzen", n.users) : FM("Direkte Nutzer: {0}", n.users)}<br>${U("Alle folgenden Sätze")}: ${n.consequences}`;
    if (flags.length) cl += `<br>${U("Fahne bei")}: ${flags.join(", ")}`;
    cl += `<br>${FM("Erscheint ab Vergrößerung {0} (Maß: {1})", decimal(e.zA, 1), MEASURES[measure].name)}`;
    if (SHOW.classification) h += `<details class="einordnung"><summary>${U("Einordnung")}</summary><div class="klein">${cl}</div></details>`;
    // 9 Links: theorem graphs, table of major theorems, gallery
    const links = n.sources.map((q) => q.source === "ar" ? `<a href="${AR_PATH}index.html#${q.id}">${U("im Satzgraphen der arithmetischen Geometrie")}</a>`
      : q.source === "gross" ? `<a href="${AG_PATH}gross.html#k=${q.id}">${U("im großen Graphen der algebraischen Geometrie")}</a>`
      : `<a href="${AG_PATH}index.html#${q.id}">${U("im Satzgraphen der algebraischen Geometrie")}</a>`);
    if (n.largeId) links.push(`<a href="${LARGE_PATH}${EN ? "?lang=en" : ""}">${U("in der Tabelle großer Sätze und Vermutungen")}</a>`);
    if (n.gallery) links.push(`<a href="${GALLERY_PATH}${EN ? "?lang=en" : ""}#ansicht=art&amp;b=${encodeURIComponent(n.gallery)}">${U("in der Galerie")}</a>`);
    if (SHOW.links) h += `<h3>${U("Verweise")}</h3><div class="klein">${links.join("<br>")}</div>`;
    info.innerHTML = h; info.style.display = "block"; info.scrollTop = 0;
    info.querySelector(".zu").addEventListener("click", deselect);
    info.querySelectorAll(".wahl[data-k]").forEach((s) => s.addEventListener("click", () => choose(s.dataset.k)));
    info.querySelectorAll(".wahl[data-b]").forEach((s) => s.addEventListener("click", () => showOther(n.key, o[+s.dataset.b])));
    info.querySelectorAll(".alle-zeigen").forEach((bt) => bt.addEventListener("click", () => {
      const box = bt.previousElementSibling && bt.previousElementSibling.tagName === "UL" ? bt.previousElementSibling : bt.parentNode;
      box.querySelectorAll(".mehr").forEach((x) => (x.hidden = false)); bt.remove();
    }));
    if (isSel && many) {
      info.querySelectorAll(".beweisliste > li").forEach((li) => {
        li.addEventListener("mouseenter", () => showPreview(o[+li.dataset.pv]));
        li.addEventListener("mouseleave", () => showPreview(null));
      });
      const q = (c) => info.querySelector(c);
      if (q(".bw-vor")) { q(".bw-vor").addEventListener("click", () => cycle(-1)); q(".bw-nach").addEventListener("click", () => cycle(1));
        q(".bw-alle").addEventListener("change", (ev) => setAll(ev.target.checked)); }
    }
    const hl = info.querySelector(".beweisliste > li.hervor");
    if (hl) hl.scrollIntoView({ block: "nearest" });
  }
  function deselect() {
    selected = null; chain = null; stg = null; startView = null; shownProof.clear(); allMode = false; preview = null;
    selG.innerHTML = ""; dirSel.innerHTML = ""; pointsSel.innerHTML = ""; layerExtra.innerHTML = ""; selDoves.length = 0; selGroups.length = 0;
    info.style.display = "none"; remember(); request();
  }

  // ------------------------------------------------------------ Movement: mouse wheel, dragging, two fingers, buttons
  let flight = null, movingTimer = null, rememberTimer = null;
  function moving() {
    svg.classList.add("bewegt"); clearTimeout(movingTimer);
    movingTimer = setTimeout(() => svg.classList.remove("bewegt"), 220);
    remember();
  }
  function remember() {
    clearTimeout(rememberTimer);
    rememberTimer = setTimeout(() => {
      const q = [];
      if (selected) {   // view and shown proof only when they differ from the defaults
        q.push("k=" + encodeURIComponent(selected));
        if (fwd) q.push("folge=1");   // todo B69 c: consequences instead of premises (one stage only)
        const i = ordered(selected).indexOf(baseShown(selected));
        if (i > 0) q.push("beweis=" + (i + 1));
        if (allMode) q.push("alle=1");
      }
      q.push("z=" + z.toFixed(z < 1 ? 3 : 2), "x=" + Math.round(cx), "y=" + Math.round(cy));
      if (measure !== "nutzer") q.push("m=" + measure);
      if (flagKind) q.push("fahne=" + flagKind);
      if (filterKind) q.push("nur=" + filterKind);
      // switches that differ from their default: "aus" for those that are on by default, "an" for those that are off
      const off = Object.keys(shown).filter((a) => SHOWN_DEFAULT[a] && !shown[a]), on = Object.keys(shown).filter((a) => !SHOWN_DEFAULT[a] && shown[a]);
      if (off.length) q.push("aus=" + off.join(","));
      if (on.length) q.push("an=" + on.join(","));
      // Reset (user, 2026-10-22): the default state (whole map, no selection, default switches) has no parameters at all
      const atDefault = !selected && Math.abs(z - 1) < 0.005 && Math.abs(cx - K0.CX) < 1 && Math.abs(cy - K0.CY) < 1 && q.length === 3;
      history.replaceState(null, "", atDefault ? location.pathname : "#" + q.join("&"));
    }, 250);
  }
  function zoomAround(factor, sx, sy) {
    const k = k0 * z, wx = cx + (sx - Wv / 2) / k, wy = cy + (sy - Hv / 2) / k;
    z = clamp(z * factor, Z_MIN, Z_MAX);
    const k2 = k0 * z; cx = wx - (sx - Wv / 2) / k2; cy = wy - (sy - Hv / 2) / k2;
    clampView(); moving(); request();
  }
  function travel(z1, x1, y1) {
    const z0 = z, x0 = cx, y0 = cy, t0 = performance.now(), duration = 380;
    // A new flight replaces a running one; the old one stops at its next frame
    const me = (now) => {
      if (flight !== me) return;
      const t = clamp((now - t0) / duration, 0, 1), u = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      z = z0 * Math.pow(z1 / z0, u); cx = x0 + (x1 - x0) * u; cy = y0 + (y1 - y0) * u;
      clampView(); moving(); draw();
      if (t < 1) requestAnimationFrame(me); else flight = null;
    };
    flight = me;
    requestAnimationFrame(flight);
  }
  stage.addEventListener("wheel", (e) => {
    e.preventDefault(); flight = null;
    const r = stage.getBoundingClientRect(), d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    zoomAround(Math.exp(-clamp(d, -300, 300) * 0.0018), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  const fingers = new Map();
  let gesture = null, dragged = false;
  function startGesture() {
    const p = [...fingers.values()], r = stage.getBoundingClientRect();
    if (p.length === 1) gesture = { kind: 1, x: p[0].x, y: p[0].y, cx, cy };
    else if (p.length >= 2) {
      const mx = (p[0].x + p[1].x) / 2 - r.left, my = (p[0].y + p[1].y) / 2 - r.top, k = k0 * z;
      gesture = { kind: 2, d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, z, wx: cx + (mx - Wv / 2) / k, wy: cy + (my - Hv / 2) / k };
    } else gesture = null;
  }
  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    flight = null; fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (fingers.size === 1) dragged = false;
    startGesture();
  });
  window.addEventListener("pointermove", (e) => {
    if (!fingers.has(e.pointerId) || !gesture) return;
    fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = [...fingers.values()], r = stage.getBoundingClientRect();
    if (gesture.kind === 1) {
      if (!dragged && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 4) { dragged = true; stage.classList.add("zieht"); pointer.style.display = "none"; }
      if (dragged) { cx = gesture.cx - (e.clientX - gesture.x) / (k0 * z); cy = gesture.cy - (e.clientY - gesture.y) / (k0 * z); clampView(); moving(); request(); }
    } else if (p.length >= 2) {
      dragged = true;
      const mx = (p[0].x + p[1].x) / 2 - r.left, my = (p[0].y + p[1].y) / 2 - r.top;
      z = clamp(gesture.z * Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) / gesture.d, Z_MIN, Z_MAX);
      cx = gesture.wx - (mx - Wv / 2) / (k0 * z); cy = gesture.wy - (my - Hv / 2) / (k0 * z);
      clampView(); moving(); request();
    }
  });
  const release = (e) => {
    if (!fingers.has(e.pointerId)) return;
    fingers.delete(e.pointerId); startGesture();
    if (!fingers.size) { stage.classList.remove("zieht"); setTimeout(() => (dragged = false), 0); }
  };
  window.addEventListener("pointerup", release); window.addEventListener("pointercancel", release);
  // Box shown on mouse hover (todos B11, B26): exactly three lines, name; "Persons (year)" small and italic
  // (creditLine); the statement in words (`short`), then the formula. It repeats no information from the legend.
  // Proof points and names of areas keep their own format.
  let pointerContent = null;
  function shortCard(n) {
    const conj = n.type === "vermutung" && !/vermutung|conjecture/i.test(n.name.replace(/<[^>]+>/g, ""));
    // the kind after the name, not bold: a theory (city) says "(Theorie)" (user, 2026-10-22)
    const kind = n.kind === "gebaeude" ? U("(Theorie)") : conj ? U("(Vermutung)") : "";
    let h = `<div class="titel">${n.name}${kind ? ` <span class="msc">${kind}</span>` : ""}</div>`;
    // Todo B69 b (user, 2026-10-22): a theory shows its country (area) above its name, in italics, as a province does
    if (n.kind === "gebaeude") {
      const land = n.countries.map((l) => (M.countries[l] ? M.countries[l].name : "")).filter(Boolean).join(U(" und "));
      if (land) h = `<div class="land">${land}</div>` + h;
    }
    const j = creditLine(n); if (j) h += `<div class="zusatz">${j}</div>`;
    const k = statement(n); if (k) h += `<div class="kurz">${k}</div>`;
    if (n.formula && window.katex) h += tex(n.formula);
    return h;
  }
  // Box for a country or province (todos B40, B60): summary from data/area-texts.js, no MSC codes (todo B60). A country name
  // shows the name of the country; a province (its name or its free ground) shows the country above, a little smaller
  // (both countries for the condominium), then the name of the province.
  const AT = window.AREA_TEXTS || { countries: {}, provinces: {} };
  // Full names of the provinces whose name on the map was shortened (todo B69 e); translations in translations/ui-gemeinsam.js
  const PROVINCE_FULL = { "11M": "Zeta- und L-Funktionen: analytische Theorie", "11R": "Algebraische Zahlentheorie: globale Körper",
    "11S": "Algebraische Zahlentheorie: lokale Körper" };
  function areaCard(t) {
    const key = t.area, condo = key === CONDO;
    const entry = (condo || !t.country ? AT.provinces : AT.countries)[key];
    const box = document.createElement("div");
    const add = (cls, s, kind) => { const d = document.createElement("div"); d.className = cls; d.textContent = s;
      if (kind) { const k = document.createElement("span"); k.className = "msc"; k.textContent = " " + kind; d.appendChild(k); }   // the kind, not bold
      box.appendChild(d); };
    if (t.country) add("titel", (M.countries[key] || {}).name || "", U("(Gebiet)"));
    else {
      const P = L.provinces.find((p) => p.key === key), ls = P ? P.countries : condo ? [11, 14] : [];
      add("land", ls.map((l) => (M.countries[l] ? M.countries[l].name : "")).filter(Boolean).join(U(" und ")));
      // Todo B69 e (user, 2026-10-22): the map shows the short name, the hover box the full name with the colon
      add("titel", condo ? U("Arithmetische Geometrie") : PROVINCE_FULL[key] ? U(PROVINCE_FULL[key]) : (M.provinces[key] || {}).name || "", U("(Teilgebiet)"));
    }
    if (entry && entry.summary) add("kurz", entry.summary);
    return box.innerHTML;
  }
  // Todo B60: the free ground of a province shows the box of the province. A pointer whose target has no box of its own
  // (land, border, coast hatching, forest ground, route) is located in the world: on land inside the frame it gets the
  // box of the province under it, over sea and fjord none.
  const groundHints = L.provinces.map((p) => ({ poly: extendCell(p.cell), hint: { area: p.key, country: false, ground: true } }));
  function groundHint(clientX, clientY) {
    const r = stage.getBoundingClientRect(), sx = clientX - r.left, sy = clientY - r.top;
    if (sx < MARGIN || sy < MARGIN || sx > Wv - MARGIN || sy > Hv - MARGIN) return null;
    const k = k0 * z, x = cx + (sx - Wv / 2) / k, y = cy + (sy - Hv / 2) / k;
    if (!onLand(x, y)) return null;
    const q = groundHints.find((g) => inPolygon(g.poly, x, y));
    // User, 2026-10-23: a province whose name is shown has its box only on the name, not on its ground. Its name is the
    // name of the province, or the country name of a country with only this province, or the name of the condominium.
    const named = (o) => o.an && o.forest == null && (o.country ? o.provKey === q.hint.area || o.areaKey === q.hint.area : o.areaKey === q.hint.area);
    if (!q || regions.some(named)) return null;
    return q.hint;
  }
  const hintAt = (target, x, y) => { const t = search(hint, target); return t || (target && svg.contains(target) ? groundHint(x, y) : null); };
  // Plan step 2.2: hover box of a tree: name, the province (and forest), the definition in one sentence
  const provinceName = (key) => (key === CONDO ? U("Arithmetische Geometrie") : (M.provinces[key] || {}).name || key);
  const forestName = (i) => { const Q = FORESTS[i]; return Q ? Q.label || FM("Wald {0}", i + 1) : ""; };
  // Definition in one sentence: the first sentence of the text, after a leading reference such as "Scholze (2012)."
  const definitionSentence = (h) => { const parts = String(h || "").split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„(])/);
    while (parts.length > 1 && parts[0].replace(/<[^>]+>/g, "").length < 30 && /\(\d{4}\)\.$/.test(parts[0])) parts.shift();
    return firstSentence(parts.join(" ")); };
  function conceptCard(c) {
    let h = `<div class="titel">${c.name}</div><div class="zusatz">${provinceName(c.province)}${c.forest != null ? " · " + FM("Wald „{0}“", forestName(c.forest)) : ""}</div>`;
    const d = definitionSentence(c.text); if (d) h += `<div class="kurz">${d}</div>`;
    return h;
  }
  function forestCard(i) {
    const Q = FORESTS[i]; if (!Q) return "";
    return `<div class="titel">${forestName(i)}</div><div class="zusatz">${FM("Wald aus {0} Begriffen in der Provinz {1}", Q.F.concepts.length, provinceName(Q.F.province))}</div>`;   // the names are approved (user, 2026-10-22)
  }
  // Info box of a concept: name, kind (concept, forest), definition (formula and text), the concepts it is defined with, the
  // concepts defined with it, the theorems and conjectures whose statement names it, classification. Roads and concept
  // paths themselves are plan step 2.3.
  let conceptShown = null;
  function showConceptInfo(c) {
    conceptShown = c.key;
    const link = (k) => (M.CK[k] ? `<span class="wahl" data-c="${k}">${M.CK[k].name}</span>` : k);
    let h = `<button class="zu" title="${U("Schließen")}">×</button><h2>${c.name}</h2>`;
    h += `<div class="art">${U("Begriff (Definition)")}${c.forest != null ? ", " + FM("Wald „{0}“", forestName(c.forest)) : ""}</div>`;
    h += `<h3>${U("Definition")}</h3>`;
    if (c.formula) h += tex(c.formula);
    if (c.text) h += `<div class="erlaeuterung">${c.text}</div>`;
    if (c.uses.length) h += `<h3>${U("Definiert mit")}</h3><div class="klein">${longList(c.uses.map(link), "span")}</div>`;
    if (c.isA.length) h += `<h3>${U("Ist ein Fall von")}</h3><div class="klein">${c.isA.map(link).join(", ")}</div>`;
    const usedBy = M.concepts.filter((x) => x.uses.includes(c.key)).map((x) => x.key);
    if (usedBy.length) h += `<h3>${U("Verwendet in der Definition von")}</h3><div class="klein">${longList(usedBy.map(link), "span")}</div>`;
    const st = c.statements.filter((k) => EK[k]);
    if (st.length) h += `<h3>${st.length === 1 ? U("In der Aussage eines Satzes oder einer Vermutung") : FM("In der Aussage von {0} Sätzen und Vermutungen", st.length)}</h3><div class="klein">${longList(st.map(choiceLink), "span")}</div>`;
    else h += `<h3>${U("In keiner Aussage der Karte")}</h3>`;
    const t = TK[c.key];
    let cl = `${U("Land")}: ${c.province === CONDO ? U("Arithmetische Geometrie") : c.countries.map((l) => (M.countries[l] ? M.countries[l].name : "")).join(U(" und "))}`;
    if (c.province !== CONDO) cl += `<br>${U("Provinz")}: ${provinceName(c.province)}`;
    cl += `<br>${U("MSC-Klassen")}: ${c.msc.join(", ")}`;
    if (t) cl += `<br>${FM("Erscheint ab Vergrößerung {0}", decimal(t.zA, 1))}`;
    h += `<details class="einordnung"><summary>${U("Einordnung")}</summary><div class="klein">${cl}</div></details>`;
    info.innerHTML = h; info.style.display = "block"; info.scrollTop = 0;
    info.querySelector(".zu").addEventListener("click", () => { conceptShown = null; info.style.display = "none"; });
    info.querySelectorAll(".wahl[data-c]").forEach((x) => x.addEventListener("click", () => showConceptInfo(M.CK[x.dataset.c])));
    info.querySelectorAll(".wahl[data-k]").forEach((x) => x.addEventListener("click", () => { conceptShown = null; choose(x.dataset.k); }));
    info.querySelectorAll(".alle-zeigen").forEach((bt) => bt.addEventListener("click", () => { bt.parentNode.querySelectorAll(".mehr").forEach((x) => (x.hidden = false)); bt.remove(); }));
  }
  // User, 2026-10-22: a click on a construction plan (Langlands correspondences) does nothing for now; before, it hid
  // every name of the map and the names did not come back. The hover box stays.
  // User, 2026-10-22: one rule for every element: a click (dir "back") without a proof whose premises are on the map, or a
  // right click (dir "fwd") without a consequence on the map, does nothing on the map (no highlight, no dimming); the
  // info box appears and a selection that was shown before stays
  const inert = (key, dir) => { const n = M.K[key]; if (!n) return false;
    if (n.kind === "bruecke" && n.stage === "bauplan") return true;
    const s = stages(key); return dir === "fwd" ? !s.maxFwd : !s.maxBack; };
  const quiet = (key) => { if (M.K[key].kind !== "bruecke") showInfo(M.K[key]); };
  function search(map, t) { while (t && t !== svg) { if (map.has(t)) return map.get(t); t = t.parentNode; } return null; }
  svg.addEventListener("click", (e) => {
    if (dragged) return;
    if (doveLit) { lightDove(null); return; }   // a click beside a lit dove only ends its highlight
    // Todo B69 c: the second click of a double click is ignored, so a double click acts like a single click
    if (e.detail > 1) return;
    // Plan step 2.2: a click on a tree shows the info box of its concept (a selected chain ends)
    const tk = search(treeOf, e.target);
    if (tk) { if (selected) deselect(); showConceptInfo(TK[tk].c); return; }
    const bw = search(proofOf, e.target);
    // A filled proof point shows the info box of its theorem with this proof highlighted (todo B44, F4)
    if (bw) { showInfo(M.K[bw.from], bw); return; }
    const alt = search(altOf, e.target);
    if (alt) { showOther(alt.key, alt.b); return; }
    const key = search(selectable, e.target);
    if (key && inert(key, "back")) { quiet(key); return; }   // a construction plan, an element without a proof (user, 2026-10-22)
    // free ground ends a selection and closes an info box that was opened without one
    if (key) step(key, "back"); else if (selected || info.style.display === "block") deselect();
  });
  // Right-click (on touch devices a long press) shows the immediate consequences; no context menu on the map
  stage.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (dragged) return;
    const key = search(selectable, e.target);
    if (key && inert(key, "fwd")) { quiet(key); return; }
    if (key) step(key, "fwd");
  });
  // A double click on a theorem acts like a single click (todo B69 c); on free ground it zooms in
  svg.addEventListener("dblclick", (e) => { const r = stage.getBoundingClientRect(); if (!search(selectable, e.target) && !search(proofOf, e.target) && !search(altOf, e.target)) zoomAround(2, e.clientX - r.left, e.clientY - r.top); });
  let lastPointer = null;
  function hover(t, x, y) {
    if (!t) { pointer.style.display = "none"; pointerContent = null; return; }
    if (t !== pointerContent) { pointer.innerHTML = t.concept ? conceptCard(M.CK[t.concept]) : t.forest != null ? forestCard(t.forest) : t.area ? areaCard(t) : t.key ? shortCard(M.K[t.key]) : `<div class="titel"></div>${t.who ? '<div class="zusatz wer"></div>' : ""}${t.extra ? '<div class="zusatz rolle"></div>' : ""}`;
      if (!t.key && !t.area && !t.concept && t.forest == null) { pointer.querySelector(".titel").textContent = t.title; if (t.who) pointer.querySelector(".wer").textContent = t.who; if (t.extra) pointer.querySelector(".rolle").textContent = t.extra; }
      pointerContent = t; pointer.style.display = "block"; }
    // Box to the lower right of the pointer; at the right or bottom edge on the other side. Horizontally it stays on
    // the map, so that it never covers the info box beside it (todo B44, P24).
    const zw = pointer.offsetWidth, zh = pointer.offsetHeight, R = stage.getBoundingClientRect();
    pointer.style.left = Math.max(R.left + 4, x + 14 + zw > Math.min(window.innerWidth, R.right) - 4 ? x - 14 - zw : x + 14) + "px";
    pointer.style.top = (y + 12 + zh > window.innerHeight - 8 ? Math.max(8, y - 12 - zh) : y + 12) + "px";
  }
  // After the selection was redrawn (e.g. another proof shown) the hint under the pointer may have changed its role
  function refreshPointer() {
    if (!lastPointer || pointer.style.display !== "block") return;
    pointerContent = null;
    hover(hintAt(document.elementFromPoint(lastPointer.x, lastPointer.y), lastPointer.x, lastPointer.y), lastPointer.x, lastPointer.y);
  }
  svg.addEventListener("pointermove", (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };
    hover(fingers.size ? null : hintAt(e.target, e.clientX, e.clientY), e.clientX, e.clientY);
  });
  svg.addEventListener("pointerleave", () => { pointer.style.display = "none"; pointerContent = null; });
  document.getElementById("plus").addEventListener("click", () => travel(clamp(z * 1.8, Z_MIN, Z_MAX), cx, cy));
  document.getElementById("minus").addEventListener("click", () => travel(clamp(z / 1.8, Z_MIN, Z_MAX), cx, cy));
  // Button "Reset" (user, 2026-10-22; before: "Whole map"): ends a selection, sets every switch and selection of the toolbar
  // to its default, clears the search field and flies to the whole map; the address then has no parameters (remember)
  document.getElementById("ganz").addEventListener("click", () => {
    if (selected) deselect();
    setShown(Object.assign({}, SHOWN_DEFAULT));
    if (measure !== "nutzer") setMeasure("nutzer");
    if (flagKind) setFlags("");
    filterKind = "";
    ["mass", "fahne", "filter"].forEach((id) => { const el = byId(id); if (el) el.selectedIndex = 0; });
    if (searchField) { searchField.value = ""; if (suggestions) suggestions.hidden = true; }
    travel(1, K0.CX, K0.CY);
    remember();
  });
  if (byId("mass")) byId("mass").addEventListener("change", (e) => { setMeasure(e.target.value); remember(); });
  if (byId("fahne")) byId("fahne").addEventListener("change", (e) => setFlags(e.target.value));
  if (byId("filter")) byId("filter").addEventListener("change", (e) => { filterKind = FILTERS[e.target.value] ? e.target.value : ""; request(); remember(); });
  Object.keys(shown).forEach((a) => { if (byId("an-" + a)) byId("an-" + a).addEventListener("change", (e) => setShown({ [a]: e.target.checked })); });
  window.addEventListener("resize", resizeToFit);
  // Arrow keys left and right step through the proofs of the selected mountain (todo B30); not while typing
  document.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    const t = e.target, tag = t && t.tagName;
    if (tag === "SELECT" || tag === "TEXTAREA" || (tag === "INPUT" && !/^(checkbox|radio|button)$/.test(t.type)) || (t && t.isContentEditable)) return;
    if (!multi(selected)) return;
    e.preventDefault(); cycle(e.key === "ArrowLeft" ? -1 : 1);
  });

  // ------------------------------------------------------------ Search field with suggestions (todo B35)
  // Searched are the names in both languages, then persons and years of the history, then the text. Case and accents
  // do not matter. Hidden elements are found as well; choosing one selects it like a click and moves the map to it.
  const norm = (t) => String(t || "").replace(/<[^>]+>/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/ß/g, "ss").replace(/[\u2010-\u2015\u2212]/g, "-").replace(/[\u2018\u2019\u02bc]/g, "'").replace(/\s+/g, " ").trim();
  let searchIndex = null;
  function buildSearchIndex() {
    const enTexts = window.EN_TEXTS || {}, hashOf = SP && SP.hash;
    searchIndex = nodes.filter((n) => EK[n.key]).map((n) => {
      const names = new Set([n.name]);
      n.sources.forEach((q) => { const k = raw(q); if (k) { if (k.name) names.add(k.name); if (k.name_de) names.add(k.name_de); } });
      // The other language: German names are translated via the hash of the text
      if (hashOf) [...names].forEach((x) => { const y = enTexts[hashOf(x)]; if (y) names.add(y); });
      const persons = n.history.map((h) => [].concat(h.person || [], h.year ? [String(h.year)] : []).join(" ")).join(" ");
      return { n, names: [...names].map(norm), persons: norm(persons), text: norm(n.text) };
    });
  }
  // Rank of an entry for the normalized query (lower is better), or null: the name or a part of a word of the name (after a
  // space, a hyphen or a slash; user, 2026-10-22: "Riemann" finds "Quasi-Riemann theorem") begins with the query, the
  // name contains it, the name contains all words; persons and years; text
  function rank(x, q, words) {
    const all = (t) => words.every((w) => t.includes(w));
    let r = null;
    x.names.forEach((t) => {
      const v = t.startsWith(q) ? 0 : (" " + t).includes(" " + q) || t.includes("-" + q) || t.includes("/" + q) ? 1 : t.includes(q) ? 2 : all(t) ? 3 : null;
      if (v != null && (r == null || v < r)) r = v;
    });
    if (r != null) return r;
    if (all(x.names.join(" ") + " " + x.persons)) return 4;
    return all(x.text) ? 5 : null;
  }
  // User, 2026-10-22: hits in the name (rank 0 to 3) and hits in the full text (persons, years, text; rank 4 and 5) are
  // listed separately, each group with up to max entries
  function findTheoremsRanked(text, max) {
    const q = norm(text); if (!q) return [];
    if (!searchIndex) buildSearchIndex();
    const words = q.split(" ");
    const all = searchIndex.map((x) => ({ x, r: rank(x, q, words) })).filter((h) => h.r != null)
      .sort((a, b) => a.r - b.r || EK[b.x.n.key].w - EK[a.x.n.key].w || (a.x.n.name < b.x.n.name ? -1 : 1));
    const inName = all.filter((h) => h.r <= 3).slice(0, max || 8), inText = all.filter((h) => h.r > 3).slice(0, max || 8);
    return inName.concat(inText).map((h) => ({ key: h.x.n.key, inName: h.r <= 3 }));
  }
  const findTheorems = (text, max) => findTheoremsRanked(text, max).map((h) => h.key);
  // Choosing a suggestion: selection with stage 1 (also for the mountain already selected); the map moves to the
  // element, magnifies until it would be visible by its importance, and then zooms out as far as the chain needs.
  function goTo(key) {
    const e = EK[key]; if (!e) return;
    allMode = false;
    select(key, true, 1, 0);
    const before = { z, cx, cy };
    z = clamp(Math.max(z, e.zA * 1.05), 1, Z_MAX); cx = e.x; cy = e.y; clampView();
    fit(true);
    const target = { z, cx, cy };
    z = before.z; cx = before.cx; cy = before.cy;
    travel(target.z, target.cx, target.cy);
  }
  const searchField = document.getElementById("suche"), suggestions = document.getElementById("vorschlaege");
  const SUGGESTIONS = 20;   // the list scrolls; 8 cut off "Quasi-Riemann theorem" among 17 names with "Riemann" (user, 2026-10-22)
  let hits = [], active = -1;
  searchField.placeholder = U("Satz suchen …");
  searchField.setAttribute("aria-label", U("Satz, Vermutung oder Person suchen"));
  function placeName(n) {
    const where = n.province === CONDO ? U("Arithmetische Geometrie") : (M.provinces[n.province] || {}).name || "";
    return [where, creditShort(n)].filter(Boolean).join(" · ");
  }
  function showSuggestions() {
    const ranked = findTheoremsRanked(searchField.value, SUGGESTIONS);
    hits = ranked.map((h) => h.key); active = hits.length ? 0 : -1;
    suggestions.innerHTML = "";
    ranked.forEach((h, i) => {
      if (i === 0 || h.inName !== ranked[i - 1].inName) {   // heading of the group
        const head = document.createElement("li"); head.className = "kopf"; head.setAttribute("role", "presentation");
        head.textContent = h.inName ? U("Treffer im Namen") : U("Treffer im Volltext"); suggestions.appendChild(head);
      }
      const key = h.key, n = M.K[key], li = document.createElement("li");
      li.id = "vorschlag-" + i; li.setAttribute("role", "option"); li.dataset.k = key;
      li.innerHTML = `<div class="vname">${n.name}</div><div class="vort">${placeName(n)}</div>`;
      li.addEventListener("mousedown", (ev) => { ev.preventDefault(); take(i); });
      li.addEventListener("mousemove", () => { if (active !== i) { active = i; mark(); } });
      suggestions.appendChild(li);
    });
    if (searchField.value.trim() && !hits.length) {
      const li = document.createElement("li"); li.className = "leer"; li.textContent = U("Keine Treffer"); suggestions.appendChild(li);
    }
    const open = !!searchField.value.trim();
    suggestions.hidden = !open; searchField.setAttribute("aria-expanded", open ? "true" : "false");
    mark();
  }
  function mark() {
    [...suggestions.querySelectorAll("li[data-k]")].forEach((li, i) => li.classList.toggle("aktiv", i === active));
    if (active >= 0) { searchField.setAttribute("aria-activedescendant", "vorschlag-" + active); const li = document.getElementById("vorschlag-" + active); if (li) li.scrollIntoView({ block: "nearest" }); }
    else searchField.removeAttribute("aria-activedescendant");
  }
  function closeSuggestions() { suggestions.hidden = true; searchField.setAttribute("aria-expanded", "false"); }
  function take(i) {
    const key = hits[i]; if (!key) return;
    searchField.value = M.K[key].name.replace(/<[^>]+>/g, "");
    closeSuggestions(); searchField.blur();
    goTo(key);
  }
  searchField.addEventListener("input", showSuggestions);
  searchField.addEventListener("focus", () => { if (searchField.value.trim()) showSuggestions(); });
  searchField.addEventListener("blur", closeSuggestions);
  searchField.addEventListener("keydown", (e) => {
    const open = !suggestions.hidden && hits.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { showSuggestions(); return; }
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; mark();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open) take(active >= 0 ? active : 0);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!suggestions.hidden) closeSuggestions(); else { searchField.value = ""; searchField.blur(); }
    }
  });

  // ------------------------------------------------------------ Data warnings (console only)
  const msgs = M.warnings.slice();
  Object.entries(M.hiddenSet).forEach(([a, n]) => msgs.push(FM("Ausgeblendet: {0} × {1}.", n, a)));
  if (missing.length) msgs.push(FM("Ohne berechnete Lage (Skript entwurf-7-anordnung.js neu ausführen): {0}.", missing.join("; ")));
  if (msgs.length) console.warn(msgs.join(" "));   // data warnings of the model (formerly shown below the map)

  // ------------------------------------------------------------ Start (after the fonts have loaded, because the names
  // are measured)
  function start() {
    resizeToFit();
    buildAreaNames();
    const Q = new URLSearchParams(location.hash.slice(1));
    flagKind = FLAGS[Q.get("fahne")] ? Q.get("fahne") : "";
    if (byId("fahne")) byId("fahne").value = flagKind;
    // Plan step 3.2 (todo B69 d): the choice "Show only" is hidden; an old parameter "nur" in the address is ignored
    filterKind = "";
    if (byId("filter")) byId("filter").value = filterKind;
    const off = (Q.get("aus") || "").split(","), on = (Q.get("an") || "").split(",");
    setShown(Object.fromEntries(Object.keys(SHOWN_DEFAULT).map((a) => [a, SHOWN_DEFAULT[a] ? !off.includes(a) : on.includes(a)])));
    if (Q.get("z")) z = parseFloat(Q.get("z")) || 1;
    if (Q.get("x")) cx = parseFloat(Q.get("x"));
    if (Q.get("y")) cy = parseFloat(Q.get("y"));
    clampView();
    setMeasure(Q.get("m") || "nutzer");
    const k = Q.get("k");
    if (k && EK[k]) {
      const pb = ordered(k)[(parseInt(Q.get("beweis"), 10) || 1) - 1]; if (pb) shownProof.set(k, pb);
      // Todo B69 c: one stage only; "folge" > 0 shows the consequences, otherwise the premises (an old "stufe" is ignored;
      // since 2026-10-22 a theory and a conjecture follow the same rule)
      const cons = (parseInt(Q.get("folge"), 10) || 0) > 0;
      select(k, false, cons ? 0 : 1, cons ? 1 : 0);
      if (Q.get("alle") === "1" && multi(k)) { allMode = true; rebuild(); }
      if (!Q.get("z")) { const e = EK[k]; z = clamp(Math.max(e.zA * 1.15, 2.5), 1, Z_MAX); cx = e.x; cy = e.y; clampView();
        fit(true); }   // the whole shown chain in view (stage 1 is the default and is omitted from the address)
      startView = { z, cx, cy };
    }
    draw();
    window.E11 = { setTo(zz, x, y) { z = zz; if (x != null) { cx = x; cy = y; } clampView(); draw(); }, select: (k) => { select(k); draw(); },
      step: (k, dir) => { step(k, dir || "back"); draw(); }, stages: (k, b, fw) => { select(k, true, b, fw); draw(); }, other: (k, i) => { showOther(k, ordered(k)[i - 1]); draw(); },
      // Search (todo B35) and proofs (todo B30)
      find: (t, max) => findTheorems(t, max || SUGGESTIONS), go: (k) => goTo(k), all: (on) => { setAll(on); draw(); }, cycle: (d) => { cycle(d); draw(); },
      preview: (i) => { showPreview(i ? ordered(selected)[i - 1] : null); draw(); }, proofColors: PROOF_COLORS.slice(),
      // Kinds of all elements and their analogy partners (test of the symbols)
      kinds: () => nodes.map((n) => ({ key: n.key, kind: n.kind, analogies: n.rel.filter((z) => z.kind === "analogie").map((z) => (z.from === n.key ? z.to : z.from)).filter((o) => placement[o]) })),
      // Line 2 of the hover box (todo B52) and persons/year of every proof of every element (test-credit.js)
      credit: (k) => creditLine(M.K[k]), creditShort: (k) => creditShort(M.K[k]),
      // Name on the map (todo B69 j)
      mapName: (k) => shortName(M.K[k]),
      proofCreditList: () => nodes.map((n) => ({ key: n.key, type: n.type, kind: n.kind, hasCredit: !!n.credit, line: creditLine(n),
        proofs: ordered(n.key).map((b) => { const x = proofCredits(n).get(b); return { name: b.name || "", who: x ? personsAnd(x) : "" }; }) })),
      multiProofs: () => nodes.filter((n) => n.proofs.length > 1).map((n) => [n.key, n.proofs.length]),
      stage: () => ({ selected, all: allMode, previewing: preview ? ordered(selected).indexOf(preview) + 1 : 0, back, fwd, maxBack: stg ? stg.maxBack : 0, maxFwd: stg ? stg.maxFwd : 0, proof: selected ? ordered(selected).indexOf(baseShown(selected)) + 1 : 0,
        chain: chain ? [...chain.entries()] : [], points: pointsSel.childNodes.length,
        outside: chain ? [...chain.keys()].filter((q) => { const X = (placement[q].x - cx) * k0 * z + Wv / 2, Y = (placement[q].y - cy) * k0 * z + Hv / 2; return X < MARGIN || X > Wv - MARGIN || Y < MARGIN || Y > Hv - MARGIN; }).length : 0 }),
      // Boxes of the visible symbols in map coordinates (test of the labels, todo B12)
      // Draft 10: computed bridges (world and screen geometry) for tests and screenshots
      bridges: () => BR.map((B) => ({ key: B.n.key, stage: B.n.stage, year: yearOf(B.n), generality: B.n.correspondence.generality, nameOnDeck: !!B.nameShown, deck: 2 * deckHalf[B.n.key], c: { x: B.c.x, y: B.c.y }, width: B.w, s: B.c.s,
        bankA: Object.assign({}, B.bankA), bankB: Object.assign({}, B.bankB), ramp: B.ramp,   // plan 4.5, follow-up 2
        fjordLength: B.F.FL, borderLength: B.F.bl, fraction: B.F.df.frac, zA: EK[B.n.key] ? EK[B.n.key].zA : null, shown: !!B.shown,
        screen: B.screen && B.shown ? { box: B.screen.box, water: B.screen.water } : null })),
      placement: (k) => placement[k] && { x: placement[k].x, y: placement[k].y },
      onLand: (x, y) => onLand(x, y),
      // Plan 4.5, follow-up 2: distance of a map point to the drawn coast (map units, negative outside the coast polygon)
      coastDist: (x, y) => { let m = Infinity; coastPoly.forEach((a, i) => { const b = coastPoly[(i + 1) % coastPoly.length], ex = b[0] - a[0], ey = b[1] - a[1];
        const t = clamp(((x - a[0]) * ex + (y - a[1]) * ey) / (ex * ex + ey * ey || 1), 0, 1); m = Math.min(m, Math.hypot(a[0] + t * ex - x, a[1] + t * ey - y)); });
        return inPolygon(coastPoly, x, y) ? m : -m; },
      inFjord: (x, y, margin) => inFjord(x, y, margin || 0), k0: () => k0,
      // Todo B60: client coordinates of a world point and the province whose ground box a client point gets
      screenOf: (x, y) => { const r = stage.getBoundingClientRect(); return [r.left + (x - cx) * k0 * z + Wv / 2, r.top + (y - cy) * k0 * z + Hv / 2]; },
      groundAt: (x, y) => { const t = groundHint(x, y); return t ? t.area : null; },
      symbolBoxes: () => E.concat(TREES).filter((e) => e.visible && e.inImage && e.box).map((e) => Object.assign({}, e.box)),
      // All elements with world position and threshold of visibility (test of the proof points, todo B44)
      elements: () => E.map((e) => [e.key, e.x, e.y, e.zA]),
      // Weights of all elements (list for the user, tests/list-weights.js): direct users, all following theorems, `large`,
      // highlights, normalised weight w as meaning() computes it, level, the magnification from which the element appears and
      // why it did not appear one step earlier (todo B73)
      weights: () => E.map((e) => ({ key: e.key, name: e.n.name, kind: e.n.kind, type: e.n.type, state: e.n.state || null, users: e.n.users,
        consequences: e.n.consequences, large: !!e.n.large, highlight: [...e.n.highlight], w: e.w, level: e.level, zA: e.zA, wait: e.wait || "" })),
      // Plan step 4.5: symbol of every element (test-buildings.js): kind of the node, drawn symbol, stage, size, place,
      // threshold, box in units of the symbol, scale of the symbols at magnification 1, province
      thresholdStats: () => thresholdStats, recomputeThresholds: () => { computeThresholds(); draw(); return thresholdStats; },
      symbols: () => ({ k0, P, elements: E.map((e) => ({ key: e.key, kind: e.n.kind, type: e.n.type, state: e.n.state || null, level: e.level,
        symbol: e.g ? e.g.getAttribute("data-symbol") : null, stage: e.g && e.g.getAttribute("data-stage") ? +e.g.getAttribute("data-stage") : null,
        question: !!(e.g && [...e.g.querySelectorAll("text")].some((t) => t.textContent === "?")), x: e.x, y: e.y, s: e.s, zA: e.zA,
        box0: Object.assign({}, e.box0), province: e.n.province })) }),
      // Names (todo B50): [key, name, level, kind, symbol centre in the image, name shown, leader line, box of the name,
      // box of the symbol, foot line of a hill range] of all visible elements
      labels: () => E.filter((e) => e.visible).map((e) => [e.key, e.n.name, e.level, e.n.kind, e.X >= MARGIN && e.X <= Wv - MARGIN && e.Y >= MARGIN && e.Y <= Hv - MARGIN, !!e.slot && !e.hidden, !!e.guide,
        e.slot ? Object.assign({}, e.nameBox) : null, e.box ? Object.assign({}, e.box) : null, e.n.kind === "gebaeude" ? e.Y + 8 * (e.s / 16) * e.sym : null]),
      // Drawn routes of the selection as [premise, theorem] (test of the view of the consequences)
      routes: () => selGroups.flatMap((G) => G.items.flatMap((it) => it.ins.map((x) => [x.p, G.key]))),
      // Plan step 3.2: the whole route network as drawn: layer shown, largest class shown, drawn pieces [id, class] of the
      // shown classes; doves of the switch "analogies" shown and in total
      network: () => {
        const on = layerNet.getAttribute("display") !== "none";
        const pieces = on ? [...layerNet.querySelectorAll("g[data-class]")].filter((g) => g.getAttribute("display") !== "none")
          .flatMap((g) => [...g.childNodes].map((p) => [+p.getAttribute("data-piece"), +g.getAttribute("data-class"), (p.getAttribute("d") || "").length])) : [];
        return { on, classMax: NET_CLASS_MAX(z), pieces, opacity: +layerNet.getAttribute("opacity"),
          analogies: allDoves && shown.analogien ? allDoves.filter((b) => b.on).length : 0, analogiesTotal: allDoves ? allDoves.length : null };
      },
      // Shown names of countries and provinces (key of the area), todo B62
      areaNames: () => regions.filter((o) => o.an).map((o) => o.areaKey),
      // Plan step 2.2: trees [key, name, zA, visible, in image, name shown, screen box, name box, forest, size, screen position,
      // moved away from a bridge]
      trees: () => TREES.map((t) => [t.ckey, t.n ? t.n.name : t.c.name, t.zA, !!t.visible, !!t.inImage, !!t.slot, t.box ? Object.assign({}, t.box) : null,
        t.slot ? Object.assign({}, t.nameBox) : null, t.c.forest, t.s, [t.X, t.Y], !!t.moved]),
      forests: () => FORESTS.map((Q) => ({ index: Q.index, province: Q.F.province, concepts: Q.F.concepts.length, name: Q.label, approved: !!Q.F.approved, nameBy: Q.F.nameBy,
        named: regions.some((o) => o.forest === Q.index && o.an), ground: !!Q.g })),
      concept: (k) => { if (M.CK[k]) showConceptInfo(M.CK[k]); return conceptShown; }, conceptShown: () => conceptShown,
      deselect: () => { deselect(); draw(); }, measure: (m) => { setMeasure(m); draw(); }, flag: (a) => { setFlags(a); draw(); }, shown: (o) => { setShown(o); draw(); },
      uiState: () => ({ z, cx, cy, symbols: E.filter((e) => e.visible).length, inImage: E.filter((e) => e.visible && e.inImage).length,
        names: E.filter((e) => e.slot).map((e) => [e.key, e.lab.getAttribute("transform")]), regions: regions.filter((o) => o.an).length,
        selectionProofs: selGroups.reduce((s, G) => s + G.items.filter((it) => it.kind !== "hollow").length, 0), flags: E.filter((e) => e.withFlag).length }) };
    document.body.dataset.bereit = "1";
  }
  const fonts = Promise.all(['16px "IM Fell English"', 'italic 16px "IM Fell English"', '16px "IM Fell English SC"'].map((s) => document.fonts.load(s).catch(() => null)));
  Promise.race([fonts.then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 2500))]).then(start);
})();
