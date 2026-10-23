// Data for a historical map: mathematics as it was known in 1900 (map 1900, plan step P2, 2026-10-23).
// Copied from the map 1830 (maps/karte-1830/data/) and extended. Texts copied from 1830 are German and translated
// through translations/; new texts are English (user, 2026-10-22). Field names English.
//
// Files: this file holds the header, the areas, the statuses and the shared foundations. The nodes, proofs, history
// events and relations are in four parts that each define one global object with the same lists:
//   theorems-a.js  window.H1900_A  number theory, algebra (copied from the map 1830, part A)
//   theorems-b.js  window.H1900_B  geometry (copied from part B)
//   theorems-c.js  window.H1900_C  calculus, series, functions (copied from part C)
//   theorems-d.js  window.H1900_D  differential equations, calculus of variations, probability, mechanics,
//                                  mathematical physics (copied from part D)
//   theorems-e.js  window.H1900_E  additions of step P3 to arithmetic (foundations, sets), algebra (equations,
//                                  invariants, groups) and number theory, because part A had reached about 200 KB
// The additions of step P3 to the other areas stand at the end of the lists of parts B, C and D.
// The ids of the nodes copied from 1830 are kept; their prefix need not match the province of 1900.
// A page that uses the data loads all six files and concatenates the lists of window.H1900 and the five parts.
//
// Model: the theorem graphs of ../../../Beispiel Arithmetische Geometrie/daten.js (nodes, proofs, history, relations),
// with the following differences, all fixed to the state of knowledge at the end of 1900:
//   nodes type "grundlage": knowledge assumed in 1900 that is not split into theorems here (below).
//              type "satz": a published proof existed by the end of 1900 that contemporaries accepted as a proof.
//              Later proofs do not count; unpublished results (Gauß's diary and papers, letters) do not count.
//              type "vermutung": not proved by the end of 1900. `state` is the state in 1900: "offen", "teilweise"
//              (special cases proved) or "widerlegt" (disproved by 1900).
//              `area`: area of the time (key of `areas`); the id begins with the prefix of the area.
//              `field`, `msc`: MSC 2020 as the second classification (top-level numbers and three-character classes).
//              `year`, `person`: originators; for a theorem the first published proof up to 1900, for a conjecture
//              its first formulation.
//              `form`, `short`, `formula`, `text` as in the other graphs; formulas contain no quantifiers.
//              Optional `recognition` on theorems: "wenig beachtet" (published, but hardly known or not accepted in
//              1900) or "lückenhaft" (accepted then, with a gap by today's standard; the gap is named in `text`).
//              Optional `resolved: { kind, year, person, text }` on conjectures: what happened after 1900. `kind` is
//              "bewiesen", "widerlegt", "unabhaengig" (neither provable nor refutable from the usual axioms) or
//              "teilweise" (only partly settled up to today); `year` and `person` may be missing when the question
//              was settled gradually, `text` is an optional sentence (step P3).
//              Optional `hilbert: n` (step P3) on conjectures: the conjecture is problem n (1 to 23) of Hilbert's
//              lecture "Mathematische Probleme" at the International Congress of Mathematicians in Paris, August
//              1900 (Nachr. Ges. Wiss. Göttingen 1900, 253–297). The info panel shows "Hilbert 1900, Problem n".
//              Every number occurs at most once. Problem 23 (further development of the calculus of variations) is
//              a call for work and has no node. Hilbert's questions are stated as the conjecture he expected; where a
//              problem asks for a possibility (problems 2, 4, 6, 15), the conjecture is that it is possible.
//              Optional `hilbertPart: n` (step P3): the conjecture is named by Hilbert as a part of problem n whose
//              main node carries `hilbert: n` (Goldbach and twin primes in problem 8, Kepler's conjecture in
//              problem 18, the well-ordering of the continuum in problem 1). The info panel shows "Hilbert 1900,
//              part of Problem n".
//              Optional `uncertain`: one sentence saying what is uncertain (year, originator, whether the proof
//              existed in 1900, assignment). Optional `circa: true` when the year is approximate.
//              Optional `historicalName: { text, source }` (step P2, todo B3): a name of its own under which the
//              statement was known by 1900, in the original language and spelling of the cited source (original
//              work or standard history from Quellen.md). Not set for names that arose after 1900, for names that
//              only name the author ("Satz von …") or for names known only from unpublished notes.
//              Optional `correspondence` (step P2, bridges K1 to K3) as in ../../../Beispiel Arithmetische
//              Geometrie/daten.js: { generality, direction, sides: [{ name, objects, provinces }], preserved:
//              { text, formula }, dictionary: [{ side1, side2 }] }. Here `provinces` are keys of `areas` (provinces
//              of this map). `generality` orders the bridges over the same fjord, 1 = narrowest (inner end).
//   proofs Hyperedges as in the other graphs, as the proofs were given at the time, with `year`, `person` and
//              `source` (original work or standard history). Kind "beweis", or "bedingt" if a premise is a
//              conjecture. Only proofs published by 1900.
//              Optional `tacit: [<premise id>, ...]`: premises the author used without proof because they were taken
//              for granted at the time and were proved only later (Euler's use of unique factorization in 1737,
//              the use of the fundamental theorem of algebra before 1799). They remain premises, because the proof
//              depends on them logically. An entry that is not a node id is a short German note on an assumption
//              without a node of its own (user's decision of 2026-10-22: assumptions used tacitly in 1900 are not
//              conjectures).
//              Optional `uncertain` as on nodes.
//   history Events up to and including 1900: { id, from, kind, year, circa, person, source, text, unpublished }.
//              Kinds: "vermutet", "bewiesen", "teilweise", "verallgemeinert", "widerlegt", "numerisch",
//              "uebertragen"; since step P3 also "beansprucht" (a proof was claimed and accepted for a time, as
//              Kempe's proof of the four colour conjecture) and "einwand" (an error in a proof was pointed out),
//              both kinds of the glossary. `unpublished: true` for results known only from letters, diaries or papers.
//   relations As in the other graphs: "teilresultat", "aequivalent", "analogie", "formulierung", "widerlegt",
//              "deutung".
//
// Sources: Quellen.md in this folder. Uncertain entries are marked with `uncertain`; the report (reports/2026-10-22 Plan H1 Mathematik um 1900/Bericht.md) lists
// the most important ones.

window.H1900 = {
  title: "Mathematics around 1900",
  year: 1900,

  // Areas of the time (step P1, user, 2026-10-23). The groups follow volumes I to IV of the Encyklopädie der
  // mathematischen Wissenschaften (Teubner, from 1898; plan of the work fixed in 1897), the provinces its sections and
  // articles (`period`: section or article of the Encyklopädie, in its German original). Mathematical physics (volume
  // V) stays a province of mechanics as on the map 1830. Group theory is one province of algebra; mathematical logic
  // belongs to the foundations of arithmetic. Report: reports/2026-10-23 Karte 1900 P1 Gliederung und Brücken/.
  // `prefix` is the prefix of new ids; `msc` is the MSC 2020 counterpart (second classification).
  areas: {
    foundations: { prefix: "fa", group: "Arithmetic", name: "Foundations of arithmetic", period: "I A 1 Grundlagen der Arithmetik, I A 3 Irrationalzahlen und Konvergenz unendlicher Prozesse", msc: ["03", "11A", "26A"] },
    sets:        { prefix: "st", group: "Arithmetic", name: "Theory of sets", period: "I A 5 Mengenlehre", msc: ["03E", "54"] },
    equations:   { prefix: "al", group: "Algebra", name: "Theory of equations and Galois theory", period: "I B 1 Rationale Funktionen, Determinanten; I B 3 Algebraische Gleichungen, Galois'sche Theorie", msc: ["12", "13", "15", "26C", "65H"] },
    invariants:  { prefix: "iv", group: "Algebra", name: "Theory of invariants", period: "I B 2 Invariantentheorie", msc: ["13A", "15A", "14L"] },
    groups:      { prefix: "gp", group: "Algebra", name: "Groups", period: "I A 6 Endliche diskrete Gruppen, I B 3 f Endliche Gruppen linearer Substitutionen, II A 6 Kontinuierliche Transformationsgruppen", msc: ["20", "22"] },
    elemnt:      { prefix: "zt", group: "Number theory", name: "Elementary number theory and theory of forms", period: "I C 1 Niedere Zahlentheorie, I C 2 Arithmetische Theorie der Formen", msc: ["11A", "11D", "11E", "11J", "11P"] },
    algnt:       { prefix: "nf", group: "Number theory", name: "Algebraic number theory", period: "I C 4 a Theorie der algebraischen Zahlkörper, I C 4 b Theorie des Kreiskörpers, I C 6 Komplexe Multiplikation", msc: ["11R", "11S", "11G"] },
    analnt:      { prefix: "an", group: "Number theory", name: "Analytic number theory", period: "I C 3 Analytische Zahlentheorie", msc: ["11M", "11N"] },
    probability: { prefix: "wr", group: "Probability", name: "Probability and the method of least squares", period: "I D Wahrscheinlichkeits- und Ausgleichsrechnung", msc: ["60", "62"] },
    calculus:    { prefix: "di", group: "Analysis", name: "Foundations of analysis and series", period: "II A Analysis der reellen Größen: Grundlagen, Differential- und Integralrechnung, bestimmte Integrale, trigonometrische Reihen", msc: ["26", "33", "40", "41", "42"] },
    diffeq:      { prefix: "de", group: "Analysis", name: "Differential equations", period: "II A 4, II A 5 Gewöhnliche und partielle Differentialgleichungen", msc: ["34", "35"] },
    variation:   { prefix: "va", group: "Analysis", name: "Calculus of variations", period: "II A 8 Variationsrechnung", msc: ["49"] },
    functions:   { prefix: "ft", group: "Analysis", name: "Theory of functions of a complex variable", period: "II B 1 Allgemeine Theorie der analytischen Funktionen einer komplexen Größe", msc: ["30"] },
    elliptic:    { prefix: "ef", group: "Analysis", name: "Elliptic, Abelian and automorphic functions", period: "II B 2 Algebraische Funktionen und ihre Integrale, II B 3 Elliptische Funktionen, II B 4 Automorphe Funktionen, II B 7 Abelsche Funktionen", msc: ["14H", "14K", "30F", "33E", "11F"] },
    geomfound:   { prefix: "ng", group: "Geometry", name: "Foundations of geometry and non-Euclidean geometry", period: "III 1 Prinzipien der Geometrie, III 2 Begründung der Geometrie, III 9 Elementargeometrie und nicht-euklidische Geometrie", msc: ["51F", "51M"] },
    elemgeo:     { prefix: "eg", group: "Geometry", name: "Elementary geometry and trigonometry", period: "III 9 Elementargeometrie", msc: ["51M", "52B"] },
    projgeo:     { prefix: "pg", group: "Geometry", name: "Projective and descriptive geometry", period: "III A, B Rein geometrische Theorien (projektive und darstellende Geometrie)", msc: ["51A", "51N"] },
    alggeo:      { prefix: "ag", group: "Geometry", name: "Algebraic geometry", period: "III C Algebraische Geometrie", msc: ["14", "51N"] },
    diffgeo:     { prefix: "dg", group: "Geometry", name: "Differential geometry", period: "III D Differentialgeometrie", msc: ["53"] },
    situs:       { prefix: "as", group: "Geometry", name: "Analysis situs", period: "III 3 Analysis situs", msc: ["55", "57", "52B"] },
    mechanics:   { prefix: "me", group: "Mechanics", name: "Analytical and celestial mechanics", period: "IV A Grundlegung, IV B Mechanik der Punkte und starren Systeme; VI 2 Astronomie", msc: ["70", "85"] },
    physics:     { prefix: "ph", group: "Mechanics", name: "Mathematical physics", period: "IV C Mechanik der deformierbaren Körper; V Physik", msc: ["31", "35", "74", "76", "80"] },
  },

  statuses: {
    offen: "open in 1900",
    teilweise: "partly proved in 1900",
    widerlegt: "disproved by 1900",
  },
  recognitions: {
    "wenig beachtet": "Published, but hardly known or not accepted as a proof in 1900.",
    "lückenhaft": "Accepted as a proof at the time, with a gap by today's standard.",
  },

  nodes: [
    // ------------------------------------------------------------ Shared foundations (knowledge assumed in 1830)
    { id: "G_EUKLID", type: "grundlage", area: "elemgeo", field: [51], msc: ["51M"], name: "Euklids Elemente (Geometrie)",
      text: "Die Geometrie der Bücher I bis VI und XI bis XIII der Elemente in der Bearbeitung der Lehrbücher um 1830 (Legendre, Éléments de géométrie): Kongruenz, Parallelen, Ähnlichkeit, Proportionen, Kreis, Flächen- und Rauminhalte, regelmäßige Körper.",
      rangeList: ["Kongruenzsätze", "Parallelenaxiom und Winkelsumme", "Ähnlichkeit und Proportionen", "Kreis und Peripheriewinkel", "Konstruktion mit Zirkel und Lineal", "Inhaltsvergleich ebener Figuren", "Rauminhalte (Exhaustion)"] },
    { id: "G_ARITH", type: "grundlage", area: "elemnt", field: [11], msc: ["11A"], name: "Arithmetik der Elemente",
      text: "Die Arithmetik der Bücher VII bis IX der Elemente: Teilbarkeit, euklidischer Algorithmus, größter gemeinsamer Teiler, Primzahlen und ihre Unendlichkeit (Euklid IX.20), Lemma des Euklid (VII.30), vollkommene Zahlen der Form 2<sup>p−1</sup>(2<sup>p</sup> − 1) (IX.36). Dazu das Rechnen mit Brüchen und Dezimalbrüchen.",
      rangeList: ["Euklidischer Algorithmus", "Lemma des Euklid (VII.30)", "Unendlichkeit der Primzahlen (IX.20)", "Vollkommene Zahlen (IX.36)", "Proportionenlehre der Zahlen"] },
    { id: "G_ALGEBRA", type: "grundlage", area: "equations", field: [12], msc: ["12D", "26C"], name: "Buchstabenrechnung und Gleichungen",
      text: "Rechnen mit Polynomen und rationalen Funktionen, Division mit Rest, binomischer Lehrsatz für ganze positive Exponenten, Gleichungen ersten und zweiten Grades, Zusammenhang zwischen Wurzeln und Koeffizienten (Vieta), Elimination, Rechnen mit imaginären Größen a + b√−1.",
      rangeList: ["Polynomdivision", "Binomischer Lehrsatz (ganze Exponenten)", "Quadratische Gleichungen", "Satz von Vieta", "Elimination", "Rechnen mit imaginären Größen"] },
    { id: "G_KALKUEL", type: "grundlage", area: "calculus", field: [26], msc: ["26A"], name: "Regeln der Differential- und Integralrechnung",
      text: "Die Rechenregeln der Infinitesimalrechnung nach Leibniz, Newton und Euler, wie sie Lacroix und Cauchy lehrten: Ableitungsregeln, Ableitungen der elementaren Funktionen, Integration durch Substitution und partielle Integration, Partialbruchzerlegung, Potenzreihen der elementaren Funktionen, Extrema mit verschwindender Ableitung. Die Sätze, deren Begründung um 1830 Gegenstand der Forschung war (Taylor, Mittelwertsatz, Hauptsatz, Zwischenwertsatz), stehen als eigene Knoten.",
      rangeList: ["Ableitungsregeln", "Ableitungen elementarer Funktionen", "Substitution und partielle Integration", "Partialbruchzerlegung", "Potenzreihen der elementaren Funktionen", "Extremwerte"] },
    { id: "G_NEWTON", type: "grundlage", area: "mechanics", field: [70], msc: ["70A", "70F"], name: "Newtons Bewegungsgesetze und Gravitationsgesetz",
      text: "Die drei Bewegungsgesetze und das Gravitationsgesetz der Principia (1687) in der analytischen Form nach Euler: Kraft gleich Masse mal Beschleunigung, Gegenwirkung, Anziehung umgekehrt proportional zum Quadrat der Entfernung. Physikalische Annahmen, keine mathematischen Sätze." },
  ],
  proofs: [],
  history: [],
  relations: [],
};
