// Draft 11 (copy of entwurf-10-modell.js of draft 10, 22 October 2026). Draft 10: model of the map (own copy of
// regional-model.js, plan step 2.1, user's decision of 2026-10-21).
// Drafts 7 and 8 are frozen and keep loading regional-model.js, which stays unchanged. This copy is loaded by
// index.html (window.E11_MODEL) and by the Node scripts for draft 11 (tests/measure-layout.js,
// tests/test-concepts-model.js). Map 2020 (todo B78, 23 October 2026): unchanged copy of the model of draft 11, now under the
// name window.K2020_MODEL (modelGlobal of scripts/map-config.js), loaded by index.html and by maps/tools/map-context.js. Differences from regional-model.js: the concepts (definitions) are merged into the
// model, the provinces of concepts without a province of their own are added, and the forests are computed (see the
// section "Concepts" below). The theorem part is the same code, so the elements and their keys are the same as in
// draft 7.
//
// This file merges the three theorem graphs into a list of map elements. The graphs themselves are not copied but read:
//   ../Beispiel Algebraische Geometrie/daten.js window.AG
//   ../Beispiel Algebraische Geometrie/daten-gross.js window.AG_LARGE
//   ../Beispiel Arithmetische Geometrie/daten.js window.AR
// and the three concept files (optional; without them the model has no concepts):
//   ../Beispiel Algebraische Geometrie/begriffe.js window.AG_CONCEPTS
//   ../Beispiel Algebraische Geometrie/begriffe-gross.js window.AG_CONCEPTS_LARGE
//   ../Beispiel Arithmetische Geometrie/begriffe.js window.AR_CONCEPTS
//
// Keys: "ag:<id>" for nodes of algebraic geometry (daten.js and daten-gross.js share the ids),
// "ar:<id>" for nodes of arithmetic geometry. A node of arithmetic geometry is identified with a node of algebraic
// geometry if its field `ag` refers to it, if id and name agree, or (only for
// foundations) if the first MSC class agrees and one name begins with the other.
//
// Assignment (Konzept/14, decisions F14.1 to F14.4):
//   Country = MSC main number. Province = first three-character class of the field `msc`.
//   11G and 14G together form the province "11G/14G" (arithmetic geometry), a condominium of the countries 11 and 14.
//   If a node has a class from a second main field that does not already belong to its province, it lies at the
//   border with that country (field `country2`).
//   Countries that occur only as a second main field get one province: their most frequently named class.
//
// Map element per node type (legend in Konzept/04):
//   satz hill, mountain (fixed); with a flag if the history contains an event „vermutet“
//   vermutung, state offen,
//     teilweise, umstritten peak without flag with cloud cap (fixed)
//   vermutung, state bedingt peak without flag on conditional land (candidate, Konzept/07)
//   vermutung, state widerlegt illusion (candidate)
//   vermutung, state programm conjectured coast (candidate)
//   grundlage building = theory (candidate; provisional decision on F14.2, see README); not drawn without a drawn route
//   gegenbeispiel monster (candidate)
//   unknown type is not drawn and is reported in `warnings`
// Nodes with `ki: true` (results whose proof is claimed by an AI) do not belong to G1 and are hidden,
// as are all proofs and relations that touch them.
// Proofs: kind "beweis" (or without kind) = route; "bedingt" = ridge; every other kind (such as "beansprucht" for
// AI proofs) is hidden. Proofs with `shortcut: true` (abbreviations in the graph of algebraic geometry whose full proof
// stands in the graph of arithmetic geometry) are skipped. The field `rangeItems` of a proof (results of a presupposed
// theory that the proof uses) is passed on unchanged.
//
// Language: names of countries and provinces, warnings and reasons for hiding are output via I18N.t
// (English versions in translations/ui-gemeinsam.js); without sprache.js (for instance in the Node script) they stay German.
// sprache.js translates the theorem graphs before this script and keeps the German name in `name_de`. Nodes are
// therefore merged via the German name, so that the result is the same in both languages.

(function (root) {
  "use strict";

  const T = (s) => (root && root.I18N ? root.I18N.t(s) : s);
  // Pattern with placeholders {0}, {1}, …: the whole pattern is translated, then the values are inserted
  const F = (pattern, ...values) => T(pattern).replace(/\{(\d)\}/g, (_, i) => values[i]);
  const deName = (k) => k.name_de || k.name;

  const COUNTRIES = {
    5: "Kombinatorik",
    11: "Zahlentheorie",
    12: "Körpertheorie und Polynome",
    13: "Kommutative Algebra",
    14: "Algebraische Geometrie",
    18: "Kategorientheorie, homologische Algebra",
    20: "Gruppentheorie und Verallgemeinerungen",
    22: "Topologische Gruppen, Lie-Gruppen",
    30: "Funktionentheorie",
    32: "Mehrere komplexe Variable und analytische Räume",
    42: "Harmonische Analysis auf euklidischen Räumen",
    46: "Funktionalanalysis",
    52: "Konvexe und diskrete Geometrie",
    53: "Differentialgeometrie",
    55: "Algebraische Topologie",
    57: "Mannigfaltigkeiten und Zellkomplexe",
    58: "Globale Analysis, Analysis auf Mannigfaltigkeiten",
    68: "Informatik",
    54: "Allgemeine Topologie",
    81: "Quantentheorie",
  };

  // Titles of the three-character classes of MSC 2020, German
  const PROVINCES = {
    "05A": "Abzählende Kombinatorik",
    "05B": "Designs und Konfigurationen",
    "05C": "Graphentheorie",
    "05D": "Extremale Kombinatorik",
    "05E": "Algebraische Kombinatorik",
    "11A": "Elementare Zahlentheorie",
    "11B": "Folgen und Mengen",
    "11C": "Polynome und Matrizen",
    "11D": "Diophantische Gleichungen",
    "11E": "Formen und lineare algebraische Gruppen",
    "11F": "Diskontinuierliche Gruppen und automorphe Formen",
    "11G/14G": "Arithmetische Geometrie",
    "11H": "Geometrie der Zahlen",
    "11J": "Diophantische Approximation, transzendente Zahlen",
    "11K": "Wahrscheinlichkeitstheorie und Gleichverteilung in der Zahlentheorie",
    "11L": "Exponential- und Charaktersummen",
    "11M": "Zeta- und L-Funktionen",
    "11N": "Multiplikative Zahlentheorie",
    "11P": "Additive Zahlentheorie, Partitionen",
    "11R": "Globale Körper",
    "11S": "Lokale Körper",
    "11T": "Endliche Körper und kommutative Ringe",
    "11Y": "Algorithmische Zahlentheorie",
    "12E": "Allgemeine Körpertheorie",
    "12F": "Körpererweiterungen",
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
    "14H": "Kurven",
    "14J": "Flächen und höherdimensionale Varietäten",
    "14K": "Abelsche Varietäten und Schemata",
    "14L": "Algebraische Gruppen",
    "14M": "Spezielle Varietäten",
    "14N": "Projektive und abzählende Geometrie",
    "14P": "Reelle algebraische und reell-analytische Geometrie",
    "14Q": "Algorithmische Aspekte der algebraischen Geometrie",
    "14R": "Affine Geometrie",
    "14T": "Tropische Geometrie",
    "18A": "Allgemeine Theorie der Kategorien und Funktoren",
    "18E": "Kategorielle Algebra",
    "18F": "Kategorien in Geometrie und Topologie",
    "18G": "Homologische Algebra, abgeleitete Kategorien",
    "20D": "Abstrakte endliche Gruppen",
    "20F": "Spezielle Aspekte unendlicher oder endlicher Gruppen",
    "22E": "Lie-Gruppen",
    "30B": "Reihenentwicklungen von Funktionen einer komplexen Variablen",
    "30D": "Ganze und meromorphe Funktionen",
    "30F": "Riemannsche Flächen",
    "32C": "Analytische Räume",
    "32G": "Deformationen analytischer Strukturen",
    "32J": "Kompakte analytische Räume",
    "32L": "Holomorphe Faserräume",
    "32Q": "Komplexe Mannigfaltigkeiten",
    "42A": "Harmonische Analysis in einer Variablen",
    "46E": "Lineare Funktionenräume und ihre Dualräume",
    "52A": "Allgemeine Konvexität",
    "52B": "Polytope und Polyeder",
    "52C": "Diskrete Geometrie",
    "53C": "Globale Differentialgeometrie",
    "53D": "Symplektische Geometrie, Kontaktgeometrie",
    "54A": "Allgemeines zur Topologie",
    "55N": "Homologie- und Kohomologietheorien",
    "57R": "Differentialtopologie",
    "58A": "Allgemeine Theorie differenzierbarer Mannigfaltigkeiten",
    "68Q": "Theorie des Rechnens",
    "81T": "Quantenfeldtheorie",
  };

  const CONDO = "11G/14G";
  const provinceOf = (cls) => (cls === "11G" || cls === "14G" ? CONDO : cls);
  const countriesOfProvince = (p) => (p === CONDO ? [11, 14] : [parseInt(p, 10)]);
  const ROUTE_KINDS = { beweis: "route", bedingt: "grat" };

  function element(k) {
    if (k.type === "satz") return "berg";
    if (k.type === "grundlage") return "gebaeude";
    if (k.type === "gegenbeispiel") return "ungeheuer";
    if (k.type === "vermutung") {
      if (k.state === "widerlegt") return "trugbild";
      if (k.state === "programm") return "kueste";
      if (k.state === "bedingt") return "bedingt";
      return "gipfel";
    }
    return null;
  }

  function generate(W) {
    const warnings = [], nodes = [], K = {};
    const AG = W.AG || { nodes: [], proofs: [] }, GR = W.AG_LARGE || { nodes: [], proofs: [] }, AR = W.AR || { nodes: [], proofs: [] };
    const agId = {}, arId = {}, hiddenNodes = { ag: new Set(), ar: new Set() }, hiddenSet = {};

    function fresh(k, key, source) {
      if (k.ki) { const g = T("KI-Knoten"); hiddenNodes[source === "ar" ? "ar" : "ag"].add(k.id); hiddenSet[g] = (hiddenSet[g] || 0) + 1; return null; }
      const kind = element(k);
      if (!kind) { warnings.push(F("Knoten {0}: unbekannter Typ „{1}“, nicht gezeichnet.", key, k.type)); return null; }
      const msc = (k.msc && k.msc.length) ? k.msc : null;
      if (!msc) { warnings.push(F("Knoten {0}: kein Feld msc, nicht gezeichnet.", key)); return null; }
      // Field `province`: map location that differs from the first MSC class (for instance a building in the country
      // that the theory presupposes)
      const province = provinceOf(k.province || msc[0]), countries = countriesOfProvince(province);
      const fields = (k.field || []).concat(msc.map((c) => parseInt(c, 10)));
      const country2 = fields.find((g) => !countries.includes(g)) || null;
      const n = { key: key, kind, type: k.type, name: k.name, name_de: deName(k), formula: k.formula || "", text: k.text || "", year: k.year || null,
        state: k.state || null, msc, field: k.field || [], province, countries, country2, sources: [{ source, id: k.id }],
        proofs: [], usage: [], rel: [], history: [] };
      nodes.push(n); K[key] = n;
      return n;
    }

    AG.nodes.forEach((k) => { if (fresh(k, "ag:" + k.id, "ag")) agId[k.id] = "ag:" + k.id; });
    GR.nodes.forEach((k) => {
      if (agId[k.id]) return;
      if (fresh(k, "ag:" + k.id, "gross")) agId[k.id] = "ag:" + k.id;
    });
    const agList = nodes.slice();
    AR.nodes.forEach((k) => {
      let target = null;
      if (k.ag && agId[k.ag]) target = agId[k.ag];
      else if (agId[k.id] && K[agId[k.id]].name_de === deName(k)) target = agId[k.id];
      else if (k.type === "grundlage" && k.msc) {
        const t = agList.find((n) => n.type === "grundlage" && n.msc[0] === k.msc[0] &&
          (n.name_de.startsWith(deName(k)) || deName(k).startsWith(n.name_de)));
        if (t) target = t.key;
      }
      if (target) { arId[k.id] = target; K[target].sources.push({ source: "ar", id: k.id }); return; }
      if (fresh(k, "ar:" + k.id, "ar")) arId[k.id] = "ar:" + k.id;
    });

    // Proofs: route (beweis) or ridge (bedingt); duplicate proofs of merged nodes only once. When a proof from the
    // arithmetic geometry meets a proof of the same theorem from the algebraic geometry with the same premises or the
    // same name, a warning names the pair (todo B44, F8): the duplicate is to be removed in the data, not merged silently.
    const proofs = [], seen = new Map();
    const family = (src) => (src === "ar" ? "ar" : "ag");
    function proof(b, map, source) {
      if (b.shortcut) return;
      const kind = b.kind || "beweis";
      if (!ROUTE_KINDS[kind]) { const t = F("Beweis der Art „{0}“", T(kind)); hiddenSet[t] = (hiddenSet[t] || 0) + 1; return; }
      const v = hiddenNodes[source === "ar" ? "ar" : "ag"];
      if (v.has(b.from) || (b.premises || []).some((p) => v.has(p))) { const g = T("Beweis mit KI-Knoten"); hiddenSet[g] = (hiddenSet[g] || 0) + 1; return; }
      const from = map[b.from], pr = (b.premises || []).map((p) => map[p]);
      if (!from || pr.some((p) => !p)) { warnings.push(F("Beweis „{0}“ für {1} ({2}): unbekannter Knoten, nicht gezeichnet.", b.name || "", b.from, source)); return; }
      const sig = from + "<" + pr.slice().sort().join(",") + "|" + kind;
      if (seen.has(sig)) {
        const o = seen.get(sig);
        if (family(o.source) !== family(source)) warnings.push(F("Satz {0}: Beweis „{1}“ ({2}) hat dieselben Voraussetzungen wie „{3}“ ({4}) und wird nur einmal gezeigt; Doppel in den Daten entfernen.", from, b.name || "", source, o.name, o.source));
        return;
      }
      const twin = K[from].proofs.find((x) => b.name && x.name === b.name && family(x.source) !== family(source));
      if (twin) warnings.push(F("Satz {0}: zwei Beweise mit dem Namen „{1}“ ({2} und {3}) mit verschiedenen Voraussetzungen; Doppel in den Daten prüfen.", from, b.name, twin.source, source));
      const e = { from, premises: pr, kind, element: ROUTE_KINDS[kind], name: b.name || "", idea: b.idea || "", source,
        rangeItems: b.rangeItems ? Object.fromEntries(Object.entries(b.rangeItems).map(([p, list]) => [map[p], list])) : null };
      seen.set(sig, e);
      proofs.push(e);
      K[from].proofs.push(e);
      pr.forEach((p) => K[p].usage.push(e));
    }
    AG.proofs.forEach((b) => proof(b, agId, "ag"));
    GR.proofs.forEach((b) => proof(b, agId, "gross"));
    AR.proofs.forEach((b) => proof(b, arId, "ar"));

    // A theory without any drawn route (every proof that names it is an abbreviation with `shortcut: true`) is not
    // drawn (B42 g, user's decision 2026-10-20: the theory „Algebraische Geometrie“ of the arithmetic graph disappears
    // once no proof presupposes it as a whole any more).
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.kind !== "gebaeude" || n.usage.length > 0) continue;
      nodes.splice(i, 1); delete K[n.key];
      // drop the id mappings as well, so that a relation naming the theory is reported as unknown instead of failing
      for (const map of [agId, arId]) for (const id of Object.keys(map)) if (map[id] === n.key) delete map[id];
    }

    const relations = [];
    function rel(z, map, source) {
      if (hiddenNodes[source].has(z.from) || hiddenNodes[source].has(z.to)) return;
      const from = map[z.from], to = map[z.to];
      if (!from || !to) { warnings.push(F("Beziehung {0} {1} → {2}: unbekannter Knoten.", z.kind, z.from, z.to)); return; }
      if (relations.some((x) => x.from === from && x.to === to && x.kind === z.kind)) return;
      const e = { from, to, kind: z.kind, text: z.text || "", evidence: z.evidence || "" };
      relations.push(e); K[from].rel.push(e); K[to].rel.push(e);
    }
    (AG.relations || []).forEach((z) => rel(z, agId, "ag"));
    (GR.relations || []).forEach((z) => rel(z, agId, "ag"));
    (AR.relations || []).forEach((z) => rel(z, arId, "ar"));

    [[AG, agId], [GR, agId], [AR, arId]].forEach(([D, map]) => (D.history || []).forEach((h) => {
      const k = K[map[h.from]];
      if (k && !k.history.some((x) => x.id === h.id)) k.history.push(h);
    }));

    // Derived quantities
    nodes.forEach((n) => {
      n.history.sort((a, b) => (a.year || 0) - (b.year || 0));
      n.users = new Set(n.usage.map((b) => b.from)).size;      // direct users: distinct conclusions
      const conjectured = n.history.find((h) => h.kind === "vermutet");
      n.flag = n.kind === "berg" && !!conjectured;
      if (n.flag) {
        const provedEvent = n.history.find((h) => h.kind === "bewiesen");
        n.flagYear = provedEvent ? provedEvent.year : n.year;
      }
      if (n.kind === "trugbild") { const w = n.history.find((h) => h.kind === "widerlegt"); n.disprovedYear = w ? w.year : null; }
    });

    // Provinces: first classes; countries that occur only as a second field get their most frequent class
    const provinces = {};
    const pv = (p) => (provinces[p] = provinces[p] || { key: p, name: PROVINCES[p] ? T(PROVINCES[p]) : "", countries: countriesOfProvince(p), nodes: [] });
    nodes.forEach((n) => pv(n.province).nodes.push(n.key));
    const withProvince = new Set(); Object.values(provinces).forEach((p) => p.countries.forEach((l) => withProvince.add(l)));
    const frequent = {};
    nodes.forEach((n) => n.msc.forEach((c) => { const l = parseInt(c, 10); if (!withProvince.has(l)) { frequent[l] = frequent[l] || {}; frequent[l][c] = (frequent[l][c] || 0) + 1; } }));
    nodes.forEach((n) => { if (n.country2 != null && !withProvince.has(n.country2) && !frequent[n.country2]) frequent[n.country2] = { [String(n.country2).padStart(2, "0") + "?"]: 1 }; });
    Object.keys(frequent).forEach((l) => {
      const c = Object.entries(frequent[l]).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
      pv(provinceOf(c));
    });
    // Concepts (plan step 2.1). They are added after the provinces of the theorems, so that the provinces, countries
    // and their order from the theorem part stay as in draft 7; provinces that only concepts need are appended.
    const C = concepts(W, { K, agId, arId, warnings });
    Object.values(provinces).forEach((p) => (p.concepts = []));
    C.list.forEach((c) => { const p = pv(c.province); if (!p.concepts) p.concepts = []; p.concepts.push(c.key); });
    Object.values(provinces).forEach((p) => { if (!p.name) warnings.push(F("Provinz {0}: kein Name in der Tabelle.", p.key)); });
    const countries = {};
    Object.values(provinces).forEach((p) => p.countries.forEach((l) => {
      countries[l] = countries[l] || { key: l, name: COUNTRIES[l] ? T(COUNTRIES[l]) : "MSC " + l, provinces: [] };
      countries[l].provinces.push(p.key);
    }));

    const forests = computeForests(C.list, C.CK);
    return { nodes, K, proofs, relations, provinces, countries, warnings, hiddenSet, agId, arId,
      concepts: C.list, CK: C.CK, forests };
  }

  // ------------------------------------------------------------ Concepts (plan step 2.1)
  // One entry per concept (map element: tree, Konzept/04 and GLOSSAR.md). Keys: "ag:<id>" for the concepts of
  // algebraic geometry (begriffe.js and begriffe-gross.js have no common id), "ar:<id>" for those of arithmetic
  // geometry. The prefix keeps apart concepts with the same id in different folders (`zeta`: zeta function of a
  // variety and Riemann zeta function; `reduktion`: good and semistable reduction and reduction modulo p).
  // A concept of arithmetic geometry with a field `ag` is merged into the concept of algebraic geometry it refers to;
  // CONCEPT_MERGE lists further merges of the same concept under different ids (user's decision of 2026-10-21).
  // Merged entries keep name, text, formula and MSC classes of the concept of algebraic geometry and take the union
  // of `uses`, `isA` and the statements.
  //   key, name, name_de, kind, formula, text, msc, field, province (first MSC class, 11G and 14G: 11G/14G),
  //   countries, sources [{ source: "ag" | "gross" | "ar", id }], uses and isA (keys of concepts), statements (keys of
  //   model elements whose statement names the concept, from `theoremConcepts`), count (number of these statements
  //   that are theorems or conjectures; counterexamples do not count, user's decision of 2026-10-21), forest (index
  //   into `forests` or null).
  // Model elements get a field `concepts` (keys of the concepts in their statement).
  //
  // Reductive group: `redgroup` (arithmetic geometry, 22E) and `reduktiv` (begriffe-gross.js, 14L) are one concept.
  // The first class is 14L (algebraic groups): both definitions describe a connected affine (linear) algebraic group
  // over a field with trivial unipotent radical, an object of the theory of algebraic groups. 22E (Lie groups) is the
  // class of real and complex Lie groups; in the Langlands programme the reductive group is an algebraic group over a
  // number field or a local field, not a Lie group. The class 20G (linear algebraic groups), which both entries name
  // second, has no province on the map.
  const CONCEPT_MERGE = { "ar:redgroup": "ag:reduktiv" };

  function concepts(W, ctx) {
    const { K, agId, arId, warnings } = ctx;
    const FILES = [["ag", W.AG_CONCEPTS], ["gross", W.AG_CONCEPTS_LARGE], ["ar", W.AR_CONCEPTS]].filter((x) => x[1]);
    const list = [], CK = {}, alias = { ag: {}, gross: {}, ar: {} };
    const add = (c, key, source) => {
      const msc = c.msc && c.msc.length ? c.msc : null;
      if (!msc) { warnings.push(F("Begriff {0}: kein Feld msc, nicht aufgenommen.", key)); return; }
      const province = provinceOf(msc[0]);
      const e = { key, name: c.name, name_de: deName(c), kind: c.kind || "", formula: c.formula || "", text: c.text || "",
        msc, field: c.field || [], province, countries: countriesOfProvince(province), sources: [{ source, id: c.id }],
        uses: [], isA: [], statements: [], count: 0, forest: null };
      list.push(e); CK[key] = e;
    };
    // algebraic geometry: begriffe.js first, then begriffe-gross.js (same key space "ag:")
    FILES.filter(([s]) => s !== "ar").forEach(([s, D]) => D.concepts.forEach((c) => {
      const key = "ag:" + c.id;
      if (CK[key]) { CK[key].sources.push({ source: s, id: c.id }); alias[s][c.id] = key; return; }
      add(c, key, s); if (CK[key]) alias[s][c.id] = key;
    }));
    FILES.filter(([s]) => s === "ar").forEach(([s, D]) => D.concepts.forEach((c) => {
      const target = CONCEPT_MERGE["ar:" + c.id] || (c.ag ? "ag:" + c.ag : null);
      if (target && CK[target]) {
        CK[target].sources.push({ source: s, id: c.id }); alias.ar[c.id] = target;
        if (c.msc && c.msc[0] && provinceOf(c.msc[0]) !== CK[target].province && !CONCEPT_MERGE["ar:" + c.id])
          warnings.push(F("Begriff ar:{0}: erste Klasse {1} weicht von {2} ab.", c.id, c.msc[0], target));
        return;
      }
      if (target) warnings.push(F("Begriff ar:{0}: Verweis auf {1} ohne Eintrag.", c.id, target));
      add(c, "ar:" + c.id, s); if (CK["ar:" + c.id]) alias.ar[c.id] = "ar:" + c.id;
    }));
    // a concept id named in file s: own file first, then the other file of the same folder
    const resolve = (s, id) => alias[s][id] || (s === "ag" ? alias.gross[id] : s === "gross" ? alias.ag[id] : undefined);
    FILES.forEach(([s, D]) => D.concepts.forEach((c) => {
      const from = resolve(s, c.id); if (!from) return;
      ["uses", "isA"].forEach((f) => (c[f] || []).forEach((u) => {
        const to = resolve(s, u);
        if (!to) { warnings.push(F("Begriff {0}: {1} nennt unbekannten Begriff {2}.", from, f, u)); return; }
        if (to !== from && !CK[from][f].includes(to)) CK[from][f].push(to);
      }));
    }));
    // statements: theoremConcepts maps ids of daten.js (begriffe.js), daten-gross.js (begriffe-gross.js) or the
    // arithmetic daten.js to concept ids of the same file; ids of hidden elements (AI results) are skipped
    FILES.forEach(([s, D]) => Object.entries(D.theoremConcepts || {}).forEach(([tid, ids]) => {
      const nk = (s === "ar" ? arId : agId)[tid];
      if (!nk || !K[nk]) return;
      const n = K[nk]; if (!n.concepts) n.concepts = [];
      ids.forEach((id) => {
        const ck = resolve(s, id);
        if (!ck) { warnings.push(F("Satz {0}: unbekannter Begriff {1}.", nk, id)); return; }
        if (!n.concepts.includes(ck)) n.concepts.push(ck);
        if (!CK[ck].statements.includes(nk)) CK[ck].statements.push(nk);
      });
    }));
    Object.values(K).forEach((n) => { if (!n.concepts) n.concepts = []; });
    list.forEach((c) => { c.count = c.statements.filter((k) => K[k].type === "satz" || K[k].type === "vermutung").length; });
    return { list, CK };
  }

  // Forests (decision recorded in GLOSSAR.md and Konzept/04, 4.3a): at least FOREST_MIN concepts of one province that
  // are connected via `uses` (without direction) within the province. Order: larger forests first, then province and
  // key of the first concept. Every forest: province, concepts (keys, in the order of the concept list), roads
  // (number of `uses` pairs inside the forest), name and name_en (names from FOREST_NAMES, approved by the user on 22 October 2026; null without an
// entry), approved, nameBy (concept that gives the name).
  const FOREST_MIN = 5;
  // Names of the forests (plan step 2.2), after the proposal in section 4 of the report
  // reports/2026-10-21 Plan 2.1 Begriffsdaten/Bericht Datenteil.md; approved by the user on 22 October 2026. A name is given
  // via one concept of the forest (the index of a forest changes when forests grow or new ones appear): the forest that
  // contains the concept gets the name. de: German name (data language), en: English name (draft 11 is English only).
  const FOREST_NAMES = {
    "ag:geradenbuendel": { de: "Divisoren und Geradenbündel", en: "Divisors and line bundles" },
    "ar:zahlkoerper": { de: "Zahlkörper und Klassenkörper", en: "Number fields and class fields" },
    "ag:schema": { de: "Schemata und Morphismen", en: "Schemes and morphisms" },
    "ag:kohaerent": { de: "Garben und Kohomologie", en: "Sheaves and cohomology" },
    "ag:kurve": { de: "Kurven und Geschlecht", en: "Curves and genus" },
    "ar:teilbarkeit": { de: "Teilbarkeit und Kongruenzen", en: "Divisibility and congruences" },
    "ag:punkte": { de: "Rationale Punkte und Höhen", en: "Rational points and heights" },
    "ar:modulform": { de: "Modulformen und automorphe Darstellungen", en: "Modular forms and automorphic representations" },
    "ar:zeta": { de: "Zetafunktion und L-Funktionen", en: "Zeta function and L-functions" },
    "ag:birational": { de: "Birationale Abbildungen und minimale Modelle", en: "Birational maps and minimal models" },
    "ag:abvar": { de: "Abelsche Varietäten", en: "Abelian varieties" },
    "ar:reduktion": { de: "L-Funktionen elliptischer Kurven", en: "L-functions of elliptic curves" },
    "ar:kippung": { de: "Perfektoide Räume", en: "Perfectoid spaces" },
    "ar:brauergroup": { de: "Lokale Körper und Brauer-Gruppe", en: "Local fields and the Brauer group" },
  };
  function computeForests(list, CK) {
    const nb = {}; list.forEach((c) => (nb[c.key] = new Set()));
    list.forEach((c) => c.uses.forEach((u) => { if (CK[u].province === c.province) { nb[c.key].add(u); nb[u].add(c.key); } }));
    const seen = new Set(), order = {}, out = [];
    list.forEach((c, i) => (order[c.key] = i));
    list.forEach((c) => {
      if (seen.has(c.key)) return;
      const comp = [], q = [c.key]; seen.add(c.key);
      while (q.length) { const v = q.shift(); comp.push(v); nb[v].forEach((w) => { if (!seen.has(w)) { seen.add(w); q.push(w); } }); }
      if (comp.length < FOREST_MIN) return;
      comp.sort((a, b) => order[a] - order[b]);
      const inside = new Set(comp);
      const roads = comp.reduce((s, k) => s + CK[k].uses.filter((u) => inside.has(u)).length, 0);
      out.push({ province: c.province, concepts: comp, roads, name: null });
    });
    out.sort((a, b) => b.concepts.length - a.concepts.length || (a.province < b.province ? -1 : a.province > b.province ? 1 : 0) ||
      order[a.concepts[0]] - order[b.concepts[0]]);
    out.forEach((f, i) => { f.index = i; f.concepts.forEach((k) => (CK[k].forest = i));
      const by = Object.keys(FOREST_NAMES).find((k) => f.concepts.includes(k));   // approved names, see FOREST_NAMES
      if (by) { f.name = FOREST_NAMES[by].de; f.name_en = FOREST_NAMES[by].en; f.nameBy = by; f.approved = true; } });
    return out;
  }

  const number = (l) => (l < 10 ? "0" : "") + l;
  // Size s of a map element (provisional decision on G2.1): the area of a mountain is proportional to
  // 1 + number of direct users (distinct theorems in whose proof it appears as a premise). Conjectures are at least
  // as large as a mountain with one user, so that cloud cap and high camp remain recognizable. Buildings and monsters
  // have
  // a fixed size.
  function size(n) {
    if (n.kind === "gebaeude") return 13;
    if (n.kind === "ungeheuer") return 10;
    const s = 6.5 * Math.sqrt(1 + n.users);
    return n.kind === "berg" ? s : Math.max(s, 6.5 * Math.SQRT2);
  }
  // Size of a tree (user's decision of 2026-10-21): like a mountain, the area is proportional to 1 + n, here n = number
  // of theorems and conjectures whose statement names the concept; minimum size as for n = 1.
  const conceptSize = (c) => 6.5 * Math.sqrt(1 + Math.max(c.count, 1));
  const api = { generate, size, conceptSize, COUNTRIES, PROVINCES, CONDO, number, CONCEPT_MERGE, FOREST_MIN, FOREST_NAMES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.K2020_MODEL = api;
})(typeof window !== "undefined" ? window : this);
