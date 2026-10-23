// B49: importance and size of the map elements of draft 8, shared by the map (draft-8-zoom.js) and the settings page
// (settings.js). Classic script; works over file:// and in Node (module.exports).
//
// Inputs: the model nodes (regional-model.js), the raw data (window.AG, AG_LARGE, AR) for the field `large`, the
// table of great theorems (window.GREAT_PROBLEMS, optional), the settings (window.SIZE_SETTINGS, weights.js) and
// the literature scores (window.SIZE_LITERATURE, weights-literature.js, optional).
//
// For every node:
//   a  data score: percentile of `value` within the group (theorem, conjecture, theory); mid rank for ties.
//      theorem (mountain, monster): direct users or all following theorems (measure "nutzer" or "folgen")
//      conjecture (cloud cap, conditional land, refuted, programme): theorems proved conditionally on it (direct or
//        all following, as above) + partial results + equivalences
//      theory (hill range): theorems whose proofs presuppose it (direct or all following)
//      with zeroData "ignore" (default) a is ignored for a node whose value is 0 (end point of the graph)
//   b  editorial score: (level - 1) / 4 + list bonus, at most 1; missing level: b is ignored
//   c  literature score in [0, 1]; missing entry: c is ignored
//   x  = (wa a + wb b + wc c) / (sum of the weights of the available scores)
//   size = sMin + (sMax - sMin) x^p, or the override
//   w  = normalised size in [0, 1]: x^p, or (override - sMin) / (sMax - sMin) for an override
(function (root) {
  "use strict";
  const DEFAULTS = { weights: { a: 0.4, b: 0.4, c: 0.2 }, p: 1.6, sMin: 6.5, sMax: 36, measure: "nutzer",
    listBonus: { recognised: 0.25, table: 0.1 }, zeroData: "ignore", editorial: {}, override: {} };
  const RECOGNISED = ["hilbert", "landau", "smale", "millennium"];
  const CONJECTURE = { gipfel: 1, bedingt: 1, trugbild: 1, kueste: 1 };
  const groupOf = (n) => (n.kind === "gebaeude" ? "theorie" : CONJECTURE[n.kind] ? "vermutung" : "satz");

  // Settings completed with the defaults (deep enough for the nested objects)
  function settingsOf(s) {
    s = s || {};
    return Object.assign({}, DEFAULTS, s, {
      weights: Object.assign({}, DEFAULTS.weights, s.weights || {}),
      listBonus: Object.assign({}, DEFAULTS.listBonus, s.listBonus || {}),
      editorial: s.editorial || {}, override: s.override || {},
    });
  }

  // Lists of the table of great theorems for an entry id; without the table the prefix of the id decides
  // (h = Hilbert, l = Landau, s = Smale, m = Millennium)
  function listsOf(id, W) {
    if (!id) return [];
    const G = W && W.GREAT_PROBLEMS, e = G && (G.entriesList || []).find((x) => x.id === id);
    if (e) return e.lists || [];
    const p = { h: "hilbert", l: "landau", s: "smale", m: "millennium" }[id[0]];
    return p && /^[hlsm]\d/.test(id) ? [p] : ["tabelle"];
  }

  // Facts per node that do not depend on the settings: users, consequences, partial results, lists
  function facts(nodes, K, W) {
    const rawAG = [].concat((W.AG || { nodes: [] }).nodes, (W.AG_LARGE || { nodes: [] }).nodes), rawAR = (W.AR || { nodes: [] }).nodes;
    const raw = (q) => (q.source === "ar" ? rawAR : rawAG).find((x) => x.id === q.id);
    const F = {};
    nodes.forEach((n) => {
      const seen = new Set(), stack = [n.key];
      while (stack.length) { const m = K[stack.pop()]; if (m) m.usage.forEach((b) => { if (!seen.has(b.from)) { seen.add(b.from); stack.push(b.from); } }); }
      const largeId = n.sources.map((q) => { const k = raw(q); return k && k.large; }).find(Boolean) || null;
      F[n.key] = {
        group: groupOf(n), users: new Set(n.usage.map((b) => b.from)).size, consequences: seen.size,
        partial: n.rel.filter((r) => r.kind === "teilresultat" && r.to === n.key).length,
        equivalent: n.rel.filter((r) => r.kind === "aequivalent").length,
        largeId, lists: listsOf(largeId, W),
      };
    });
    return F;
  }

  function value(f, measure) {
    const u = measure === "folgen" ? f.consequences : f.users;
    return f.group === "vermutung" ? u + f.partial + f.equivalent : u;
  }

  // Percentile with mid rank: share of the group below the value plus half of the share with the same value
  function percentiles(keys, F, measure) {
    const P = {}, groups = {};
    keys.forEach((k) => (groups[F[k].group] = groups[F[k].group] || []).push(value(F[k], measure)));
    keys.forEach((k) => {
      const g = groups[F[k].group], v = value(F[k], measure);
      let below = 0, same = 0; g.forEach((x) => { if (x < v) below++; else if (x === v) same++; });
      P[k] = g.length > 1 ? (below + 0.5 * (same - 1)) / (g.length - 1) : 0.5;
    });
    return P;
  }

  function editorialScore(entry, f, S) {
    if (!entry || !entry.level) return null;
    let b = (Math.max(1, Math.min(5, entry.level)) - 1) / 4;
    if (f.lists.some((l) => RECOGNISED.includes(l))) b += S.listBonus.recognised;
    else if (f.largeId) b += S.listBonus.table;
    return Math.min(1, b);
  }

  // Main function: returns { [key]: { group, value, a, b, c, x, size, w, overridden, level, reason, lists } }
  function compute(nodes, K, W, settings, literature, F0) {
    const S = settingsOf(settings), L = literature || (W && W.SIZE_LITERATURE) || {};
    const F = F0 || facts(nodes, K, W), keys = nodes.map((n) => n.key), P = percentiles(keys, F, S.measure);
    const wt = S.weights, R = {};
    keys.forEach((k) => {
      const f = F[k], ed = S.editorial[k], a = P[k], b = editorialScore(ed, f, S);
      const lit = L[k], c = lit && typeof lit.score === "number" ? Math.max(0, Math.min(1, lit.score)) : null;
      // zeroData "ignore": a node without any users is an end point of the graph; the graph says nothing about its
      // importance, so a is ignored like a missing c ("count": a is the low percentile of the value 0)
      const useA = !(S.zeroData === "ignore" && value(f, S.measure) === 0);
      let num = useA ? wt.a * a : 0, den = useA ? wt.a : 0;
      if (b != null) { num += wt.b * b; den += wt.b; }
      if (c != null) { num += wt.c * c; den += wt.c; }
      const x = den > 0 ? num / den : 0, ov = S.override[k];
      const overridden = typeof ov === "number" && isFinite(ov);
      const size = overridden ? ov : S.sMin + (S.sMax - S.sMin) * Math.pow(x, S.p);
      const w = overridden ? Math.max(0, Math.min(1, (ov - S.sMin) / Math.max(1e-9, S.sMax - S.sMin))) : Math.pow(x, S.p);
      R[k] = { group: f.group, value: value(f, S.measure), a: useA ? a : null, aRaw: a, b, c, x, size, w, overridden,
        level: ed ? ed.level : null, reason: ed ? ed.reason : "", lists: f.lists, largeId: f.largeId };
    });
    return R;
  }

  const api = { DEFAULTS, RECOGNISED, settingsOf, facts, compute, groupOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SIZE_SCORE = api;
})(typeof window !== "undefined" ? window : this);
