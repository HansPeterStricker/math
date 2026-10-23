// Model of the map of mathematics around 1900 (plan step P4 of the map 1900, 23 October 2026). Copy of the model of the
// map 1830 (maps/karte-1830/scripts/model.js) with the data of 1900; same interface as maps/entwurf-12/scripts/model.js
// (generate, size, conceptSize, CONDO, COUNTRIES, PROVINCES, number), so that the shared page code
// (maps/shared_scripts/map-page.js, map-core.js) and the Node scripts (maps/tools/*.js with --map karte-1900) can use
// it. Loaded by index.html (window.K1900_MODEL) and by the Node scripts and tests.
//
// Data: the six files in data/ (window.H1900 with areas, statuses and the shared foundations; window.H1900_A to
// H1900_E with the nodes, proofs, history events and relations). Rules of the data: data/theorems.js.
//
// Areas and subareas (GLOSSAR.md: country = area, province = subarea; plan step P1 of the map 1900, user 2026-10-23):
//   Country = area of the time, field `group` of the area of a node (seven, after volumes I to IV of the Encyklopädie:
//   arithmetic, algebra, number theory, probability, analysis, geometry, mechanics; keys 1 to 7 in the order of the
//   data). Province = subarea of the time, field `area` of the node (22; key = key of the area, e.g. "elemgeo"). The MSC
//   classes of the data (`field`, `msc`) decide nothing on the map; they are passed on for the info box only. There is
//   no condominium and no second country of a node.
//
// Map element per node (legend in Konzept/04 and GLOSSAR.md), as on the map 1830:
//   satz                      building (kind "berg", the key kept from the shared code)
//   vermutung, state widerlegt ruin (kind "trugbild")
//   vermutung, other states   building with a question mark (kind "gipfel"; 1900: "offen" and "teilweise")
//   grundlage                 city (kind "gebaeude"); a theory without any route is not drawn (as in draft 12)
//   field `correspondence`    bridge: map-core.js (extendModel) makes the node a bridge if its group of sides is in
//                             FJORD_GROUPS of the settings (scripts/map-config.js); the other correspondences stay
//                             buildings until their fjord is decided (as in draft 12)
// Proofs: kind "beweis" (or without kind) = route, "bedingt" = route of a conditional proof; other kinds are hidden.
//
// Weights (user, 2026-10-23, taken over from the map 1830: the state of 1900): `users` is the number of proofs of the data
// of 1900 in which the node is a premise. Literature and today's importance do not count. The page computes size and
// level from `users` (map-core.js, function meaning); the settings of the formula of B49 are in data/weights.js.
//
// Hilbert's problems (plan step P6): a conjecture with `hilbert: n` gets the note "Hilbert 1900, Problem n", one with
// `hilbertPart: n` "Hilbert 1900, part of Problem n". The shared code shows the field `sourcePlace` of a node with the
// pattern ERA_NOTES.source below the name (info box and hover box); the model writes the note into that field. Hilbert's
// lecture is the source of these conjectures in the sense of the map.
//
// Keys: the ids of the data (unique across the six files; tests/check-data.js), e.g. "zt_eindeutig", "G_EUKLID".
//
// Language: the texts copied from the map 1830 are German and translated through translations/ (by the hash of the text,
// data/translations.js); the texts added since step P2 are English (user, 2026-10-22). With language.js in English,
// generate replaces every text that has an English translation and leaves the others unchanged; unlike I18N.data it
// does not report the English texts as missing (tests/test-model.js checks that no German text stays). The German name
// stays in `name_de`. Without language.js (Node without the language files) everything stays as in the data.
(function (root) {
  "use strict";

  const PARTS = ["H1900", "H1900_A", "H1900_B", "H1900_C", "H1900_D", "H1900_E"];
  const CONDO = null;   // no condominium on this map
  const ROUTE_KINDS = { beweis: "route", bedingt: "grat" };
  const SOURCE = "k1900";

  function element(k) {
    if (k.type === "satz") return "berg";
    if (k.type === "grundlage") return "gebaeude";
    if (k.type === "vermutung") return k.state === "widerlegt" ? "trugbild" : k.state === "programm" ? "kueste" : "gipfel";
    return null;
  }

  // Translation of the data objects (once per window): only texts with an English translation are replaced
  function translate(W) {
    const SP = W.I18N;
    if (!W.H1900 || !SP || !SP.en || !SP.traverse) return;
    const tx = W.EN_TEXTS || {};
    PARTS.forEach((p) => { const D = W[p]; if (!D || D.__translated) return;
      // the value of `recognition` ("lückenhaft", "wenig beachtet") is a code for the info box (ERA_NOTES.recognition
      // in map-config.js); the German value is kept beforehand in the non-enumerable field recognitionKey
      (D.nodes || []).forEach((k) => { if (k.recognition && !k.recognitionKey) Object.defineProperty(k, "recognitionKey", { value: k.recognition }); });
      SP.traverse(D, (s, key, o, fieldKey) => {
        const x = tx[SP.hash(s)];
        if (x === undefined) return;
        if (fieldKey === "name" && !Array.isArray(o) && o.name_de === undefined) o.name_de = s;
        o[fieldKey] = x;
      });
      Object.defineProperty(D, "__translated", { value: true }); });
  }

  // Note on Hilbert's problems (see the head): English, the map is shown in English only
  function hilbertNote(k) {
    if (k.hilbert) return `Problem ${k.hilbert}`;
    if (k.hilbertPart) return `part of Problem ${k.hilbertPart}`;
    return null;
  }

  function generate(W) {
    translate(W);
    const H = W.H1900 || { areas: {}, nodes: [], proofs: [], history: [], relations: [] };
    const parts = PARTS.map((p) => W[p]).filter(Boolean);
    const all = (f) => [].concat(...parts.map((D) => D[f] || []));
    const rawNodes = all("nodes"), rawProofs = all("proofs"), rawHistory = all("history"), rawRelations = all("relations");
    const warnings = [], hiddenSet = {}, nodes = [], K = {}, idMap = {};

    // Countries: the groups of the areas in the order of the data (keys 1 to 7); provinces: the areas
    const countries = {}, provinces = {}, countryOfGroup = {};
    Object.entries(H.areas || {}).forEach(([key, a]) => {
      const g = a.group;
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
        // fields of the data of 1900 for the info box (as on the map 1830; plan step P6)
        person: k.person || null, historicalName: k.historicalName || null, recognition: k.recognitionKey || k.recognition || null,
        resolved: k.resolved || null, uncertain: k.uncertain || null, circa: !!k.circa,
        hilbert: k.hilbert || null, hilbertPart: k.hilbertPart || null, sourcePlace: hilbertNote(k) };
      nodes.push(n); K[n.key] = n; idMap[k.id] = n.key;
    });

    // Every proof of the data is kept, also a second proof of the same theorem with the same premises (different
    // historical proofs, as on the map 1830)
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
      n.users = n.usage.length;                                   // proofs with the node as a premise (state of 1900)
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
  else root.K1900_MODEL = api;
})(typeof window !== "undefined" ? window : this);
