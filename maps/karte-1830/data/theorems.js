// Data for a historical map: mathematics as it was known in 1830 (plan step H1, 2026-10-22).
// Moved from reports/2026-10-22 Plan H1 Mathematik um 1830/ to maps/karte-1830/daten/ (user, 2026-10-22).
// Research data only, not yet used by any page. Texts are German, field names English.
//
// Files: this file holds the header, the areas, the statuses and the shared foundations. The nodes, proofs, history
// events and relations of the areas are in four parts that each define one global object with the same lists:
//   daten-1830-a.js  window.H1830_A  arithmetic (number theory), algebra and theory of equations
//   daten-1830-b.js  window.H1830_B  geometry: elementary, analytic, projective and descriptive, differential
//   daten-1830-c.js  window.H1830_C  differential and integral calculus, series, definite integrals and functions
//   daten-1830-d.js  window.H1830_D  differential equations, calculus of variations, probability, mechanics,
//                                    mathematical physics
// A page that uses the data loads all five files and concatenates the lists of window.H1830 and the four parts.
//
// Model: the theorem graphs of ../../../Beispiel Arithmetische Geometrie/daten.js (nodes, proofs, history, relations),
// with the following differences, all fixed to the state of knowledge at the end of 1830:
//   nodes type "grundlage": knowledge assumed in 1830 that is not split into theorems here (below).
//              type "satz": a published proof existed by the end of 1830 that contemporaries accepted as a proof.
//              Later proofs do not count; unpublished results (Gauß's diary and papers, letters) do not count.
//              type "vermutung": not proved by the end of 1830. `state` is the state in 1830: "offen", "teilweise"
//              (special cases proved) or "widerlegt" (disproved by 1830).
//              `area`: area of the time (key of `areas`); the id begins with the prefix of the area.
//              `field`, `msc`: MSC 2020 as the second classification (top-level numbers and three-character classes).
//              `year`, `person`: originators; for a theorem the first published proof up to 1830, for a conjecture
//              its first formulation.
//              `form`, `short`, `formula`, `text` as in the other graphs; formulas contain no quantifiers.
//              Optional `recognition` on theorems: "wenig beachtet" (published, but hardly known or not accepted in
//              1830) or "lückenhaft" (accepted then, with a gap by today's standard; the gap is named in `text`).
//              Optional `resolved: { kind: "bewiesen" | "widerlegt", year, person }` on conjectures: what happened
//              after 1830.
//              Optional `uncertain`: one sentence saying what is uncertain (year, originator, whether the proof
//              existed in 1830, assignment). Optional `circa: true` when the year is approximate.
//              Optional `historicalName: { text, source }` (step P2, todo B3): a name of its own under which the
//              statement was known by 1830, in the original language and spelling of the cited source (original
//              work or standard history from Quellen.md). Not set for names that arose after 1830, for names that
//              only name the author ("Satz von …") or for names known only from unpublished notes.
//              Optional `correspondence` (step P2, bridges K1 to K3) as in ../../../Beispiel Arithmetische
//              Geometrie/daten.js: { generality, direction, sides: [{ name, objects, provinces }], preserved:
//              { text, formula }, dictionary: [{ side1, side2 }] }. Here `provinces` are keys of `areas` (provinces
//              of this map). `generality` orders the bridges over the same fjord, 1 = narrowest (inner end).
//   proofs Hyperedges as in the other graphs, as the proofs were given at the time, with `year`, `person` and
//              `source` (original work or standard history). Kind "beweis", or "bedingt" if a premise is a
//              conjecture. Only proofs published by 1830.
//              Optional `tacit: [<premise id>, ...]`: premises the author used without proof because they were taken
//              for granted at the time and were proved only later (Euler's use of unique factorization in 1737,
//              the use of the fundamental theorem of algebra before 1799). They remain premises, because the proof
//              depends on them logically. An entry that is not a node id is a short German note on an assumption
//              without a node of its own (user's decision of 2026-10-22: assumptions used tacitly in 1830 are not
//              conjectures).
//              Optional `uncertain` as on nodes.
//   history Events up to and including 1830: { id, from, kind, year, circa, person, source, text, unpublished }.
//              Kinds: "vermutet", "bewiesen", "teilweise", "verallgemeinert", "widerlegt", "numerisch",
//              "uebertragen". `unpublished: true` for results known only from letters, diaries or papers.
//   relations As in the other graphs: "teilresultat", "aequivalent", "analogie", "formulierung", "widerlegt",
//              "deutung".
//
// Sources: Quellen.md in this folder. Uncertain entries are marked with `uncertain`; the report (reports/2026-10-22 Plan H1 Mathematik um 1830/Bericht.md) lists
// the most important ones.

window.H1830 = {
  title: "Die Mathematik um 1830",
  year: 1830,

  // Areas of the time. The division follows the textbooks and journals around 1830: Lacroix, Cours complet de
  // mathématiques (arithmetic, algebra, geometry, trigonometry, application of algebra to geometry, differential
  // and integral calculus, probability); the courses of the École polytechnique (analysis, mechanics, descriptive
  // geometry; Cauchy, Cours d'analyse 1821, Résumé 1823); Gauß, Disquisitiones arithmeticae (1801) for higher
  // arithmetic; Monge, Application de l'analyse à la géométrie; Poncelet, Traité des propriétés projectives (1822);
  // Laplace, Théorie analytique des probabilités (1812) and Mécanique céleste; Lagrange, Mécanique analytique.
  // `group` gathers the areas into the parts of the time; `msc` is the MSC 2020 counterpart (second classification).
  areas: {
    arith:     { prefix: "zt", group: "Arithmetik", name: "Höhere Arithmetik", period: "Arithmétique supérieure, Théorie des nombres (Legendre), Disquisitiones arithmeticae (Gauß)", msc: ["11"] },
    algebra:   { prefix: "al", group: "Algebra", name: "Algebra und Theorie der Gleichungen", period: "Algèbre, Théorie des équations, Analyse algébrique (Cauchy 1821)", msc: ["12", "13", "15", "20", "26C", "65H"] },
    elemgeo:   { prefix: "eg", group: "Geometrie", name: "Elementargeometrie und Trigonometrie", period: "Géométrie élémentaire (Legendre, Éléments de géométrie), Trigonométrie rectiligne et sphérique", msc: ["51M", "52B"] },
    anageo:    { prefix: "ag", group: "Geometrie", name: "Analytische Geometrie", period: "Application de l'algèbre à la géométrie (Lacroix, Biot)", msc: ["51N", "14H"] },
    projgeo:   { prefix: "pg", group: "Geometrie", name: "Darstellende und projektive Geometrie", period: "Géométrie descriptive (Monge), Propriétés projectives (Poncelet), barycentrischer Calcul (Möbius)", msc: ["51A", "51N"] },
    diffgeo:   { prefix: "dg", group: "Geometrie", name: "Anwendung der Analysis auf die Geometrie", period: "Application de l'analyse à la géométrie (Monge), Disquisitiones generales circa superficies curvas (Gauß)", msc: ["53A"] },
    diffint:   { prefix: "di", group: "Analysis", name: "Differential- und Integralrechnung und Reihen", period: "Calcul différentiel et intégral (Lacroix), Cours d'analyse und Résumé (Cauchy)", msc: ["26", "40", "41"] },
    funkt:     { prefix: "fu", group: "Analysis", name: "Bestimmte Integrale und Transzendenten", period: "Intégrales définies, fonctions elliptiques (Legendre, Abel, Jacobi), séries trigonométriques (Fourier)", msc: ["30", "33", "42"] },
    dgl:       { prefix: "de", group: "Analysis", name: "Integration der Differentialgleichungen", period: "Intégration des équations différentielles et aux différences partielles", msc: ["34", "35"] },
    variation: { prefix: "va", group: "Analysis", name: "Variationsrechnung", period: "Calcul des variations (Lagrange)", msc: ["49"] },
    wahrsch:   { prefix: "wr", group: "Wahrscheinlichkeitsrechnung", name: "Wahrscheinlichkeitsrechnung und Methode der kleinsten Quadrate", period: "Calcul des probabilités (Laplace), Theoria combinationis observationum (Gauß)", msc: ["60", "62"] },
    mechanik:  { prefix: "me", group: "Mechanik", name: "Analytische Mechanik und Himmelsmechanik", period: "Mécanique analytique (Lagrange), Mécanique céleste (Laplace)", msc: ["70", "85"] },
    physik:    { prefix: "ph", group: "Mechanik", name: "Mathematische Physik", period: "Théorie analytique de la chaleur (Fourier), Attraction und Potential (Laplace, Poisson, Green)", msc: ["31", "35", "74", "80"] },
  },

  statuses: {
    offen: "1830 offen",
    teilweise: "1830 teilweise bewiesen",
    widerlegt: "bis 1830 widerlegt",
  },
  recognitions: {
    "wenig beachtet": "Veröffentlicht, aber 1830 kaum bekannt oder nicht als Beweis anerkannt.",
    "lückenhaft": "Damals als Beweis anerkannt, nach heutigem Maßstab mit einer Lücke.",
  },

  nodes: [
    // ------------------------------------------------------------ Shared foundations (knowledge assumed in 1830)
    { id: "G_EUKLID", type: "grundlage", area: "elemgeo", field: [51], msc: ["51M"], name: "Euklids Elemente (Geometrie)",
      text: "Die Geometrie der Bücher I bis VI und XI bis XIII der Elemente in der Bearbeitung der Lehrbücher um 1830 (Legendre, Éléments de géométrie): Kongruenz, Parallelen, Ähnlichkeit, Proportionen, Kreis, Flächen- und Rauminhalte, regelmäßige Körper.",
      rangeList: ["Kongruenzsätze", "Parallelenaxiom und Winkelsumme", "Ähnlichkeit und Proportionen", "Kreis und Peripheriewinkel", "Konstruktion mit Zirkel und Lineal", "Inhaltsvergleich ebener Figuren", "Rauminhalte (Exhaustion)"] },
    { id: "G_ARITH", type: "grundlage", area: "arith", field: [11], msc: ["11A"], name: "Arithmetik der Elemente",
      text: "Die Arithmetik der Bücher VII bis IX der Elemente: Teilbarkeit, euklidischer Algorithmus, größter gemeinsamer Teiler, Primzahlen und ihre Unendlichkeit (Euklid IX.20), Lemma des Euklid (VII.30), vollkommene Zahlen der Form 2<sup>p−1</sup>(2<sup>p</sup> − 1) (IX.36). Dazu das Rechnen mit Brüchen und Dezimalbrüchen.",
      rangeList: ["Euklidischer Algorithmus", "Lemma des Euklid (VII.30)", "Unendlichkeit der Primzahlen (IX.20)", "Vollkommene Zahlen (IX.36)", "Proportionenlehre der Zahlen"] },
    { id: "G_ALGEBRA", type: "grundlage", area: "algebra", field: [12], msc: ["12D", "26C"], name: "Buchstabenrechnung und Gleichungen",
      text: "Rechnen mit Polynomen und rationalen Funktionen, Division mit Rest, binomischer Lehrsatz für ganze positive Exponenten, Gleichungen ersten und zweiten Grades, Zusammenhang zwischen Wurzeln und Koeffizienten (Vieta), Elimination, Rechnen mit imaginären Größen a + b√−1.",
      rangeList: ["Polynomdivision", "Binomischer Lehrsatz (ganze Exponenten)", "Quadratische Gleichungen", "Satz von Vieta", "Elimination", "Rechnen mit imaginären Größen"] },
    { id: "G_KALKUEL", type: "grundlage", area: "diffint", field: [26], msc: ["26A"], name: "Regeln der Differential- und Integralrechnung",
      text: "Die Rechenregeln der Infinitesimalrechnung nach Leibniz, Newton und Euler, wie sie Lacroix und Cauchy lehrten: Ableitungsregeln, Ableitungen der elementaren Funktionen, Integration durch Substitution und partielle Integration, Partialbruchzerlegung, Potenzreihen der elementaren Funktionen, Extrema mit verschwindender Ableitung. Die Sätze, deren Begründung um 1830 Gegenstand der Forschung war (Taylor, Mittelwertsatz, Hauptsatz, Zwischenwertsatz), stehen als eigene Knoten.",
      rangeList: ["Ableitungsregeln", "Ableitungen elementarer Funktionen", "Substitution und partielle Integration", "Partialbruchzerlegung", "Potenzreihen der elementaren Funktionen", "Extremwerte"] },
    { id: "G_NEWTON", type: "grundlage", area: "mechanik", field: [70], msc: ["70A", "70F"], name: "Newtons Bewegungsgesetze und Gravitationsgesetz",
      text: "Die drei Bewegungsgesetze und das Gravitationsgesetz der Principia (1687) in der analytischen Form nach Euler: Kraft gleich Masse mal Beschleunigung, Gegenwirkung, Anziehung umgekehrt proportional zum Quadrat der Entfernung. Physikalische Annahmen, keine mathematischen Sätze." },
  ],
  proofs: [],
  history: [],
  relations: [],
};
