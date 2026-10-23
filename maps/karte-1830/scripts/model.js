// Model of the map of mathematics around 1830 (plan step P4 of the map 1830, 22 October 2026). Same interface as
// maps/entwurf-12/scripts/model.js (generate, size, conceptSize, CONDO, COUNTRIES, PROVINCES, number), so that
// the shared page code (maps/shared_scripts/map-page.js, map-core.js) and the Node scripts (maps/scripts/*.js with
// --map karte-1830) can use it. Loaded by index.html (window.K1830_MODEL) and by the Node scripts and tests.
//
// Data: the five files in daten/ (window.H1830 with areas, statuses and the shared foundations; window.H1830_A to
// H1830_D with the nodes, proofs, history events and relations of the areas). Rules of the data: data/theorems.js.
//
// Areas and subareas (GLOSSAR.md: country = area, province = subarea; plan of the map 1830, user 2026-10-22):
//   Country = area of the time, field `group` of the area of a node (six: arithmetic, algebra, geometry, analysis,
//   probability, mechanics; keys 1 to 6 in the order of the data). Province = subarea of the time, field `area` of the
//   node (13; key = key of the area, e.g. "elemgeo"). The MSC classes of the data (`field`, `msc`) decide nothing on the
//   map; they are passed on for the info box only. There is no condominium and no second country of a node.
//
// Map element per node (legend in Konzept/04 and GLOSSAR.md):
//   satz                      building (kind "berg", the key kept from the shared code)
//   vermutung, state widerlegt ruin (kind "trugbild")
//   vermutung, other states   building with a question mark (kind "gipfel"; 1830: "offen" and "teilweise")
//   grundlage                 city (kind "gebaeude"); a theory without any route is not drawn (as in draft 12)
//   field `correspondence`    bridge: map-core.js (extendModel) makes the node a bridge (K1 ag_kegelschnitte,
//                             K2 eg_konstruierbarkeit, K3 al_komplexe_ebene)
// Proofs: kind "beweis" (or without kind) = route, "bedingt" = route of a conditional proof; other kinds are hidden.
//
// Weights (user, 2026-10-22: the state of 1830): `users` is the number of proofs of the data of 1830 in which the node
// is a premise. This differs from draft 12, where `users` counts the distinct conclusions; a node used by two proofs of
// the same theorem counts twice here. Literature and today's importance do not count. The page computes size and level
// from `users` (map-core.js, function meaning); the settings of the formula of B49 are in data/weights.js.
//
// Keys: the ids of the data (unique across the five files; tests/check-data.js), e.g. "zt_eindeutig", "G_EUKLID".
//
// Language: the data of 1830 are not among the data objects that sprache.js translates by itself. With sprache.js in
// English, generate translates the five data objects once (I18N.data; the German name stays in `name_de`). The countries
// are numbered in the order in which their groups first occur in the areas, which is the same in both languages.
// Without sprache.js (Node without the language files) everything stays German.
(function (root) {
  "use strict";

    const PARTS = ["H1830", "H1830_A", "H1830_B", "H1830_C", "H1830_D"];
  const CONDO = null;   // no condominium on this map
  // User, 2026-10-23: the theorem of Menelaus is a premise of many proofs of projective geometry in the data (Ceva,
  // Desargues, Pascal, Carnot), but was no landmark of its time; it keeps its routes and gets the smallest size
  const SMALL = new Set(["eg_menelaos"]);
  const ROUTE_KINDS = { beweis: "route", bedingt: "grat" };
  const SOURCE = "k1830";

  function element(k) {
    if (k.type === "satz") return "berg";
    if (k.type === "grundlage") return "gebaeude";
    if (k.type === "vermutung") return k.state === "widerlegt" ? "trugbild" : k.state === "programm" ? "kueste" : "gipfel";
    return null;
  }

  // Translation of the data objects (once per window): sprache.js translates only its own list of data objects
  function translate(W) {
    const SP = W.I18N, H = W.H1830;
    if (!H) return;
    if (!SP || !SP.en) return;
    PARTS.forEach((p) => { const D = W[p]; if (D && !D.__translated) {
      // Plan step P6: the value of `recognition` ("lückenhaft", "wenig beachtet") is a code for the info box
      // (ERA_NOTES.recognition in map-config.js), but translations/sprache.js translates it; the German value is kept beforehand in
      // the non-enumerable field recognitionKey, which the translation does not see
      (D.nodes || []).forEach((k) => { if (k.recognition && !k.recognitionKey) Object.defineProperty(k, "recognitionKey", { value: k.recognition }); });
      SP.data(D); Object.defineProperty(D, "__translated", { value: true }); } });
  }

  function generate(W) {
    translate(W);
    const H = W.H1830 || { areas: {}, nodes: [], proofs: [], history: [], relations: [] };
    const parts = PARTS.map((p) => W[p]).filter(Boolean);
    const all = (f) => [].concat(...parts.map((D) => D[f] || []));
    const rawNodes = all("nodes"), rawProofs = all("proofs"), rawHistory = all("history"), rawRelations = all("relations");
    const warnings = [], hiddenSet = {}, nodes = [], K = {}, idMap = {};

    // Countries: the groups of the areas in the order of the data (keys 1 to 6); provinces: the areas
    const countries = {}, provinces = {}, countryOfGroup = {};
    Object.entries(H.areas || {}).forEach(([key, a]) => {
      const g = a.group;   // translated with the data object
      if (!countryOfGroup[g]) {
        const c = Object.keys(countryOfGroup).length + 1;
        countryOfGroup[g] = c;
        countries[c] = { key: c, name: g, provinces: [] };
      }
      const c = countryOfGroup[g];
      countries[c].provinces.push(key);
      provinces[key] = { key, name: a.name, name_de: a.name_de || a.name, countries: [c], nodes: [], concepts: [], period: a.period || "" };
    });

    rawNodes.forEach((k) => {
      const kind = element(k);
      if (!kind) { warnings.push(`Knoten ${k.id}: unbekannter Typ „${k.type}“, nicht gezeichnet.`); return; }
      const p = provinces[k.area];
      if (!p) { warnings.push(`Knoten ${k.id}: unbekanntes Gebiet „${k.area}“, nicht gezeichnet.`); return; }
      const n = { key: k.id, kind, type: k.type, name: k.name, name_de: k.name_de || k.name, formula: k.formula || "", text: k.text || "",
        year: k.year || null, state: k.state || null, msc: k.msc || [], field: k.field || [], province: k.area, countries: p.countries.slice(),
        country2: null, sources: [{ source: SOURCE, id: k.id }], proofs: [], usage: [], rel: [], history: [], concepts: [],
        // fields of the data of 1830 for the info box (plan step P6)
        person: k.person || null, historicalName: k.historicalName || null, recognition: k.recognitionKey || k.recognition || null,
        resolved: k.resolved || null, uncertain: k.uncertain || null, circa: !!k.circa };
      nodes.push(n); K[n.key] = n; idMap[k.id] = n.key;
    });

    // Every proof of the data is kept, also a second proof of the same theorem with the same premises (16 cases, e.g. two
    // proofs of the reciprocity law by Gauss): in the data of 1830 they are different historical proofs, not duplicates
    // of merged files as in draft 12
    const proofs = [];
    rawProofs.forEach((b) => {
      const kind = b.kind || "beweis";
      if (!ROUTE_KINDS[kind]) { const t = `Beweis der Art „${kind}“`; hiddenSet[t] = (hiddenSet[t] || 0) + 1; return; }
      const from = idMap[b.from], pr = (b.premises || []).map((p) => idMap[p]);
      if (!from || pr.some((p) => !p)) { warnings.push(`Beweis „${b.name || ""}“ für ${b.from}: unbekannter Knoten, nicht gezeichnet.`); return; }
      // `source` is the family of the data as in draft 12; the source of the proof in the literature is `ref`
      const e = { from, premises: pr, kind, element: ROUTE_KINDS[kind], name: b.name || "", idea: b.idea || "", source: SOURCE,
        rangeItems: null, year: b.year || null, person: b.person || null, ref: b.source || "", tacit: b.tacit || null, uncertain: b.uncertain || null };
      proofs.push(e); K[from].proofs.push(e);
      pr.forEach((p) => K[p].usage.push(e));
    });

    // A theory without any drawn route is not drawn (as in draft 12, B42 g)
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.kind !== "gebaeude" || n.usage.length > 0) continue;
      nodes.splice(i, 1); delete K[n.key]; delete idMap[n.key];
      warnings.push(`Grundlage ${n.key}: von keinem Beweis vorausgesetzt, nicht gezeichnet.`);
    }

    const relations = [];
    rawRelations.forEach((z) => {
      const from = idMap[z.from], to = idMap[z.to];
      if (!from || !to) { warnings.push(`Beziehung ${z.kind} ${z.from} → ${z.to}: unbekannter Knoten.`); return; }
      if (relations.some((x) => x.from === from && x.to === to && x.kind === z.kind)) return;
      const e = { from, to, kind: z.kind, text: z.text || "", evidence: z.evidence || "" };
      relations.push(e); K[from].rel.push(e); K[to].rel.push(e);
    });

    rawHistory.forEach((h) => { const n = K[idMap[h.from]]; if (n && !n.history.some((x) => x.id === h.id)) n.history.push(h); });

    nodes.forEach((n) => {
      n.history.sort((a, b) => (a.year || 0) - (b.year || 0));
      // proofs with the node as a premise (state of 1830); SMALL keeps a node at the smallest size
      n.users = SMALL.has(n.key) ? 0 : n.usage.length;
      n.conclusions = new Set(n.usage.map((b) => b.from)).size;   // distinct conclusions (the measure of draft 12)
      const conjectured = n.history.find((h) => h.kind === "vermutet");
      n.flag = n.kind === "berg" && !!conjectured;
      if (n.flag) { const pe = n.history.find((h) => h.kind === "bewiesen"); n.flagYear = pe ? pe.year : n.year; }
      if (n.kind === "trugbild") { const w = n.history.find((h) => h.kind === "widerlegt"); n.disprovedYear = w ? w.year : null; }
      provinces[n.province].nodes.push(n.key);
    });

    return { nodes, K, proofs, relations, provinces, countries, warnings, hiddenSet, idMap, rawNodes, rawProofs,
      concepts: [], CK: {}, forests: [] };
  }

  const number = (l) => String(l);
  // Size of a map element as in draft 12 (the page computes the drawn size with meaning() of map-core.js; this size is
  // the estimate of the layout scripts): area proportional to 1 + users
  function size(n) {
    if (n.kind === "gebaeude") return 13;
    if (n.kind === "ungeheuer") return 10;
    const s = 6.5 * Math.sqrt(1 + n.users);
    return n.kind === "berg" ? s : Math.max(s, 6.5 * Math.SQRT2);
  }
  const conceptSize = (c) => 6.5 * Math.sqrt(1 + Math.max(c.count, 1));   // no concepts on this map
  const api = { generate, size, conceptSize, CONDO, COUNTRIES: {}, PROVINCES: {}, number, SOURCE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.K1830_MODEL = api;
})(typeof window !== "undefined" ? window : this);
