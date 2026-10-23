// Shared map code (plan step P3 of the map 1830, 22 October 2026): the parts of the map page that the Node scripts for
// layout and measurement (start-layout.js, raster-layout.js, place-elements.js, route-network.js, measure-layout.js)
// compute in the same way as the page. Before P3 these scripts cut the pieces out of draft-12-map.js; now the page
// (map-page.js) and the scripts call the same functions here. Everything that belongs to one map comes from the settings
// of that map (maps/<map>/map-config.js, window.MAP_CONFIG): data sources, open parts and fjord concepts.
// Classic script in the browser (window.MAP_CORE, no type="module", so that the pages also work over file://) and a
// module in Node (require).
(function (root, factory) {
  const core = factory();
  if (typeof module === "object" && module.exports) module.exports = core; else root.MAP_CORE = core;
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // Constants of the map page: paper colour of the names, font size of reference, growth of the symbols with the zoom,
  // bounds of the magnification, level of detail, margin of the frame (screen px)
  const LIGHT = "#efe3c2", REF = 10, P = 0.45, Z_MIN = 0.02, Z_MAX = 16, Z_ZERO = 8, N_TOTAL = 30, MARGIN = 34;
  // Label boxes (todo B12): per line from cap height above the baseline to the descender below it, in em of the font
  // (IM Fell English); LH is the line spacing of names with several lines.
  const ASC = 0.75, DESC = 0.25, LH = 1.1;
  // Long names (todo B12 b): a name wider than WRAP (in em) is broken at word boundaries into balanced lines, at most
  // three. Breaks before a parenthesis or after a colon or dash are preferred.
  const WRAP = 11;
  // Font size and weight of the names per level
  const FS = { 1: [16, "bold"], 2: [13.5, "bold"], 3: [12.5, "normal"], 4: [11.5, "normal"] };

  function inPolygon(zz, x, y) {
    let inner = false;
    for (let i = 0, j = zz.length - 1; i < zz.length; j = i++) {
      const a = zz[i], b = zz[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inner = !inner;
    }
    return inner;
  }
  // Line 2 of the hover box and the info box (todo B26, B44): "Persons (year)". Theorem: the first event „bewiesen“;
  // conjecture: the first „vermutet“; refuted conjecture (mirage): the refutation; counterexample: „gefunden“, else the
  // first „bewiesen“. A field `credit` = { person, year, circa } of the raw node takes precedence. Empty without event.
  // Plan step P6 of the map 1830: events with `unpublished: true` (results known only from letters, diaries or papers)
  // are skipped, because the originator is the first published proof (user, 2026-10-22). Only if every event of the
  // kind is unpublished (Goldbach's conjecture, known from letters) the first of them is taken. The data of draft 12 have
  // no field `unpublished`, so its line 2 is unchanged.
  function creditEvent(n) {
    if (n.credit) return n.credit;
    const first = (kind) => { const all = n.history.filter((x) => x.kind === kind), pub = all.filter((x) => !x.unpublished), h = pub.length ? pub : all;
      return h.find((x) => x.year) || h[0] || null; };
    if (n.kind === "trugbild") return first("widerlegt");
    if (n.type === "vermutung") return first("vermutet");
    if (n.type === "gegenbeispiel") return first("gefunden") || first("bewiesen");
    return first("bewiesen");
  }
  // Additions to the model, bridges, placement, trees, fjords and bridges of the map page. o: { window, L (layout,
  // window.E7_LAYOUT), M (generated model), CONDO, model (the model module), cfg (settings of the map), U (translation of
  // user-interface texts), FM (pattern with {0} …) }. Returns every name the page declares in this part.
  function extendModel(o) {
    const { window, L, M, CONDO, model, cfg, U, FM } = o, T = window.TM;
    // ------------------------------------------------------------ Additions to the model (only for draft 8)
    // Sources of the raw data per side of the model (settings of the map, `sources`): raw nodes, highlights and
    // comprehensibility levels; side(q) is the side of a source entry q of a node
    const SRC = cfg.sources(window, M), side = SRC.side, HV = SRC.highlights, VS = SRC.comprehensibility;
    const raw = (q) => SRC.raw[side(q)].find((x) => x.id === q.id);
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
    SRC.specialCaseProofs.forEach(([list, map]) => (list || []).forEach((b) => {
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
      // Settings of the map, BRIDGE_GENERALITY: rank by generality of a bridge whose data have none yet (the raw data stay
      // unchanged; draft 12, plan step P7)
      const g = (cfg.BRIDGE_GENERALITY || {})[n.key];
      n.correspondence = g != null && c.generality == null ? Object.assign({}, c, { generality: g }) : c;
      // Settings of the map, FJORD_SIDES (optional): provinces of the two sides of a group of bridges ("a,b|c,d" as below)
      // that the map uses instead of those of the data (draft 12, plan step P7a: the Langlands fjord separates 11R/11S
      // from 11F; 22E, Lie groups, is not a side on the map)
      const rawKey = (c.sides || []).map((s) => (s.provinces || []).join(",")).join("|");
      const over = (cfg.FJORD_SIDES || {})[rawKey];
      if (over) n.correspondence = Object.assign({}, n.correspondence, { sides: n.correspondence.sides.map((s, i) => Object.assign({}, s, { provinces: over[i] })) });
      // Settings of the map, FJORD_GROUPS (optional): the groups of bridges (sides "a,b|c,d" as below) that have a fjord.
      // A correspondence of another group stays drawn as the building of its theorem or conjecture until the user has
      // decided on its fjord (draft 12, plan step P7); its info box still shows the two sides
      const sidesKey = (n.correspondence.sides || []).map((s) => (s.provinces || []).join(",")).join("|");
      if (cfg.FJORD_GROUPS && !cfg.FJORD_GROUPS.includes(sidesKey)) { n.awaitingFjord = sidesKey; return; }
      n.kind = "bruecke";
      n.stage = n.type === "satz" ? "fertig" : n.state === "teilweise" ? "imbau" : "bauplan";
    });
    // Page-local data until the data model has them (draft 10, provisional): the unproved parts of the general
    // correspondence (listed in its info box) and the key concepts of the two sides of a fjord, whose distance in the
    // concept graph would set the length of the fjord (B24 report, section 5.2, step 4).
    const OPEN_PARTS = cfg.OPEN_PARTS || {};   // settings of the map
    const FJORD_CONCEPTS = cfg.FJORD_CONCEPTS || {};   // settings of the map
    // The measure from the concept graph gives only about a third of the border today (4 of 11 steps); the user wants a
    // clearly deeper fjord, so the depth is at least FJORD_MIN of the border (provisional, user 2026-10-20)
    const FJORD_MIN = 0.8;
    const GEOMETRIC_NOTE = cfg.GEOMETRIC_NOTE || {};   // settings of the map

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
    const TREES = M.concepts.filter((c) => CPL[c.key]).map((c) => ({ c, key: "tree:" + c.key, ckey: c.key, x: CPL[c.key][0], y: CPL[c.key][1], s: model.conceptSize(c) }));
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
      const C = SRC.concepts; if (!C || !pair) return { frac: 0.5, d: null, dMax: null };
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
    return { SRC, side, HV, VS, raw, hasFlag, BRIDGE_DIRECTIONS, OPEN_PARTS, FJORD_CONCEPTS, FJORD_MIN, GEOMETRIC_NOTE, PZ, missing, placement, moments, nodes, CPL, N_TREES, TREE_BOX, TREES, TK, MAX_W, pt, dist, ckey, coastCorner, defFraction, yearOf, FJ, BR, groups, FILE_FJ, FJ_BANK_A, fjordBank, fileFjord, bankHalf, placeBridges, nearCentre, sideOf, inFjord };
  }

  // Names with HTML tags (user, 2026-10-23: "2<sup>2<sup>n</sup></sup> + 1" showed its tags on the map): the tags <sup>,
  // <sub>, <i> and <b>, also nested, split a name into runs of plain text; level is the number of enclosing <sup> and
  // <sub> (0 = baseline). The page draws each level RICH_SCALE times smaller than the one below it (map-page.js, font),
  // the scripts count the width of a run with the same factor. Other tags stay as they are. A name without these tags is
  // one run of level 0.
  const RICH_SPLIT = /(<\/?(?:sup|sub|i|b)>)/i, RICH_TAG = /^<(\/?)(sup|sub|i|b)>$/i, RICH_SCALE = 0.7;
  function richRuns(t) {
    const runs = [], stack = [];
    String(t).split(RICH_SPLIT).forEach((part) => {
      if (!part) return;
      const m = RICH_TAG.exec(part);
      if (!m) { runs.push({ text: part, level: stack.filter((x) => x === "sup" || x === "sub").length, tags: stack.slice() }); return; }
      if (!m[1]) stack.push(m[2].toLowerCase());
      else if (stack.length) stack.pop();
    });
    return runs;
  }
  // Width of a name with tags from the width of plain text (plainWidth(text) at font size REF)
  const richWidth = (t, plainWidth) => richRuns(t).reduce((w, r) => w + plainWidth(r.text) * Math.pow(RICH_SCALE, r.level), 0);

  // Second line below the name of a conjecture of a historical map that was settled after the year of the map (user,
  // 2026-10-23; only for a map whose ERA_NOTES has resolvedOnMap, patterns per kind of the field `resolved`, e.g.
  // "bewiesen {0}" with {0} = "1896, Hadamard, de la Vallée Poussin"). Persons by surname, more than two as the first one
  // with resolvedOnMapEtAl ("{0} u. a."). No line without year and persons. FM translates the pattern and inserts {0}.
  // RESOLVED_LINE: font size of the line relative to the name, and the distance of its baseline from the last baseline of
  // the name in line spacings LH (the name block grows by this many lines: page and place-elements.js add it to nl).
  const RESOLVED_LINE = { size: 0.72, step: 0.85 };
  // Surname: the last word, or from the first particle on ("Charles-Jean de la Vallée Poussin" -> "de la Vallée Poussin",
  // "Ennio De Giorgi" -> "De Giorgi"); "von" is dropped as usual in English ("Ferdinand von Lindemann" -> "Lindemann"), and
  // so is a lone lower-case "de" before the last word ("Adhémar Barré de Saint-Venant" -> "Saint-Venant")
  const PARTICLE = /^(de|la|le|du|des|van|der|den|te|ten|di|da|del|d')$/i;
  function surname(p) {
    const w = String(p || "").trim().split(/\s+/).filter(Boolean);
    for (let j = 1; j < w.length - 1; j++) if (PARTICLE.test(w[j])) return w.slice(w[j] === "de" && j === w.length - 2 ? j + 1 : j).join(" ");
    return w.length ? w[w.length - 1] : "";
  }
  function resolvedLine(n, era, FM) {
    const r = n && n.resolved, pat = r && era && era.resolvedOnMap && era.resolvedOnMap[r.kind];
    if (!pat) return "";
    const names = (r.person || []).map(surname).filter(Boolean);
    const who = names.length > 2 ? FM(era.resolvedOnMapEtAl || "{0} et al.", names[0]) : names.join(", ");
    const core = [r.year ? String(r.year) : "", who].filter(Boolean).join(", ");
    return core ? FM(pat, core) : "";
  }

  // Line breaks of mountain names; measureText(t, attrs) is the width of t at font size REF (the page measures in the
  // browser, the scripts use the widths of font-widths.json)
  function nameWrapping(measureText) {
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
    return { wordWidth, breakLines, wrapName };
  }

  // ------------------------------------------------------------ Importance, size, level of detail
  // Sizes of the cities (theories) per level 1 to 4 (index 0 unused). Default: the sizes since plan 1.4, round 4; a map can
  // set its own in CITY_SIZES of its settings (draft 12 keeps the default, as draft 11: user, 2026-10-23, plan step P7; the
  // sizes before plan 1.4, round 4, 48/40/32/26, made the map too crowded). citySize(s, sizes): the drawing of a city of size s (three sizes: level 1 large, levels 2 and 3
  // middle, level 4 small); the same for the page and the scripts.
  const CITY_SIZES = [0, 32, 30, 28, 26];
  const citySize = (s, sizes) => { const S = sizes || CITY_SIZES; return s >= S[1] - 1e-9 ? "gross" : s > S[4] + 1e-9 ? "mittel" : "klein"; };
  // MEASURES, quantile and meaning(m) for the elements `nodes` at the places `placement`; cfg: settings of the map (optional,
  // for CITY_SIZES)
  function measures(nodes, placement, U, cfg) {
    const CS = (cfg && cfg.CITY_SIZES) || CITY_SIZES;
    const MEASURES = { nutzer: { name: U("direkte Nutzer"), value: (n) => n.users }, folgen: { name: U("alle folgenden Sätze"), value: (n) => n.consequences } };
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
        // User, 2026-10-23 (plan step P7): the cities keep these sizes (CITY_SIZES); the larger sizes 48/40/32/26 were dropped
        if (n.kind === "gebaeude") s = CS[level]; else if (n.kind === "ungeheuer") s = 10;   // key kept from the model: the counterexample (cairn)
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
    return { MEASURES, quantile, meaning };
  }

  return { CONST: { LIGHT, REF, P, Z_MIN, Z_MAX, Z_ZERO, N_TOTAL, MARGIN }, LIGHT, REF, P, Z_MIN, Z_MAX, Z_ZERO, N_TOTAL, MARGIN,
    ASC, DESC, LH, WRAP, FS, CITY_SIZES, citySize, clamp, inPolygon, creditEvent, extendModel, nameWrapping, measures,
    RICH_SCALE, richRuns, richWidth, RESOLVED_LINE, surname, resolvedLine };
});
