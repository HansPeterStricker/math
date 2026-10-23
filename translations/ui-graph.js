// English interface texts of the shared scripts of the theorem graphs: „Beispiel Algebraische
// Geometrie/graph.js“
// (window.GL), „graphs/shared_scripts/comprehensibility-filter.js“ (window.VF) and
// „graphs/arithmetic-geometry/scripts/ar.js“ (window.ARS). Loaded by all graph pages of both folders.
// Patterns with {0}, {1} … are filled with numbers, names or addresses in the scripts.
// Names of the MSC fields and classes follow the English titles of MSC 2020, insofar as the German names
// render them; keys that also occur in ui-gemeinsam.js have the same values.
window.EN_UI = Object.assign(window.EN_UI || {}, {
  // ---- graph.js: dates
  "ohne klaren Ursprung": "no clear origin",
  "ca. ": "c. ",
  // Originator in the hover box and the panel (todo B26): approximate year
  "um ": "c. ",
  "(Vermutung)": "(conjecture)",

  // ---- graph.js: top-level fields of MSC 2020 (GL.MSC)
  "Kombinatorik": "Combinatorics",
  "Zahlentheorie": "Number theory",
  "Körpertheorie und Polynome": "Field theory and polynomials",
  "Kommutative Algebra": "Commutative algebra",
  "Algebraische Geometrie": "Algebraic geometry",
  "Kategorientheorie, homologische Algebra": "Category theory, homological algebra",
  "Mehrere komplexe Variable und analytische Räume": "Several complex variables and analytic spaces",
  "Konvexe und diskrete Geometrie": "Convex and discrete geometry",
  "Differentialgeometrie": "Differential geometry",
  "Algebraische Topologie": "Algebraic topology",
  "Mannigfaltigkeiten und Zellkomplexe": "Manifolds and cell complexes",
  "Globale Analysis, Analysis auf Mannigfaltigkeiten": "Global analysis, analysis on manifolds",
  "Quantentheorie": "Quantum theory",

  // ---- graph.js: three-digit classes (GL.MSC3)
  "Algebraische Kombinatorik": "Algebraic combinatorics",
  "Arithmetische algebraische Geometrie (diophantische Geometrie)": "Arithmetic algebraic geometry (Diophantine geometry)",
  "Diophantische Approximation, transzendente Zahlen": "Diophantine approximation, transcendental numbers",
  "Algebraische Zahlentheorie: globale Körper": "Algebraic number theory: global fields",
  "Allgemeine Körpertheorie": "General field theory",
  "Allgemeine Theorie kommutativer Ringe": "General commutative ring theory",
  "Erweiterungen kommutativer Ringe": "Extensions of commutative rings",
  "Theorie der Moduln und Ideale": "Theory of modules and ideals",
  "Homologische Methoden": "Homological methods",
  "Kettenbedingungen, Endlichkeitsbedingungen": "Chain conditions, finiteness conditions",
  "Arithmetische Ringe und andere spezielle Ringe": "Arithmetic rings and other special rings",
  "Lokale und semilokale Ringe": "Local and semilocal rings",
  "Differentialalgebra": "Differential algebra",
  "Topologische Ringe und Moduln": "Topological rings and modules",
  "Grundlagen": "Foundations",
  "Lokale Theorie": "Local theory",
  "Zyklen und Unterschemata": "Cycles and subschemes",
  "Familien, Faserungen": "Families, fibrations",
  "Birationale Geometrie": "Birational geometry",
  "(Ko-)Homologietheorie": "(Co)homology theory",
  "Arithmetische Probleme, diophantische Geometrie": "Arithmetic problems, Diophantine geometry",
  "Kurven": "Curves",
  "Flächen und höherdimensionale Varietäten": "Surfaces and higher-dimensional varieties",
  "Abelsche Varietäten und Schemata": "Abelian varieties and schemes",
  "Algebraische Gruppen": "Algebraic groups",
  "Spezielle Varietäten": "Special varieties",
  "Projektive und abzählende Geometrie": "Projective and enumerative geometry",
  "Allgemeine Theorie der Kategorien und Funktoren": "General theory of categories and functors",
  "Homologische Algebra in der Kategorientheorie, abgeleitete Kategorien": "Homological algebra in category theory, derived categories",
  "Kategorien in Geometrie und Topologie (Grothendieck-Topologien, Garben, Abstieg)": "Categories in geometry and topology (Grothendieck topologies, sheaves, descent)",
  "Analytische Räume": "Analytic spaces",
  "Deformationen analytischer Strukturen": "Deformations of analytic structures",
  "Kompakte analytische Räume": "Compact analytic spaces",
  "Holomorphe Faserräume": "Holomorphic fiber spaces",
  "Komplexe Mannigfaltigkeiten": "Complex manifolds",
  "Allgemeine Konvexität": "General convexity",
  "Polytope und Polyeder": "Polytopes and polyhedra",
  "Diskrete Geometrie": "Discrete geometry",
  "Globale Differentialgeometrie": "Global differential geometry",
  "Symplektische Geometrie, Kontaktgeometrie": "Symplectic geometry, contact geometry",
  "Homologie- und Kohomologietheorien": "Homology and cohomology theories",
  "Differentialtopologie": "Differential topology",
  "Allgemeine Theorie differenzierbarer Mannigfaltigkeiten": "General theory of differentiable manifolds",
  "Quantenfeldtheorie und verwandte klassische Feldtheorien": "Quantum field theory and related classical field theories",

  // ---- graph.js: info box, fields and classes
  "Hauptgebiete": "Main fields",
  "Hauptgebiet": "Main field",
  "Klassen": "Classes",
  "Klasse": "Class",

  // ---- graph.js and ar.js: edge kinds (GL.EDGE, ARS.EDGE)
  "Beweis": "Proof",
  "Gewöhnlicher Beweis: Linien von den Voraussetzungen in einen Beweispunkt, von dort ein Pfeil zum Satz.":
    "Ordinary proof: lines run from the premises into a proof point, and from there an arrow leads to the theorem.",
  "Bedingter Beweis": "Conditional proof",
  "Beweis, unter dessen Voraussetzungen mindestens eine Vermutung ist. Die Folgerung gilt nur, wenn die Vermutung stimmt.":
    "A proof whose premises include at least one conjecture. The conclusion holds only if the conjecture is true.",
  "Teilresultat": "Partial result",
  "Ein bewiesener Spezialfall oder eine abgeschwächte Form der Vermutung. Der Satz ist keine Voraussetzung der Vermutung.":
    "A proved special case or a weaker form of the conjecture. The theorem is not a premise of the conjecture.",
  "Bewiesene Äquivalenz": "Proved equivalence",
  "Es ist bewiesen, dass beide Aussagen gleichwertig sind. Wer eine beweist, hat die andere bewiesen.":
    "It has been proved that the two statements are equivalent. Whoever proves one has proved the other.",
  "Analogie": "Analogy",
  "Übertragung zwischen zwei Gebieten oder Charakteristiken. Keine logische Abhängigkeit.":
    "Transfer between two areas of mathematics or between characteristics. No logical dependency.",
  "Übertragung zwischen zwei Gebieten, etwa von Funktionenkörpern auf ℚ. Keine logische Abhängigkeit.":
    "Transfer between two areas of mathematics, for instance from function fields to ℚ. No logical dependency.",
  "Voraussetzung der Formulierung": "Prerequisite for the formulation",
  "Der Satz muss bekannt sein, damit die Vermutung überhaupt eine sinnvolle Aussage ist.":
    "The theorem must be known for the conjecture to be a meaningful statement at all.",
  "Widerlegt": "Disproves",
  "Ein Gegenbeispiel widerlegt die Vermutung, auf die der Pfeil zeigt.":
    "A counterexample disproves the conjecture the arrow points to.",
  "Deutung": "Interpretation",
  "Der Satz zeigt, was die Aussage bedeutet, ohne sie zu beweisen oder zu widerlegen.":
    "The theorem shows what the statement means, without proving or disproving it.",
  "Der Satz zeigt, was die Aussage bedeutet, ohne sie zu beweisen oder zu widerlegen; etwa misst die Tate-Shafarevich-Gruppe das Scheitern des Hasse-Prinzips.":
    "The theorem shows what the statement means, without proving or disproving it; for instance, the Tate–Shafarevich group measures the failure of the Hasse principle.",

  // ---- graph.js and ar.js: status of the conjectures (GL.STATE_SHORT, ARS.STATE_SHORT)
  "offen": "open",
  "teilweise": "partial",
  "bedingt bewiesen": "conditionally proved",
  "teilweise bewiesen": "partially proved",
  "umstritten": "disputed",
  "widerlegt": "disproved",
  "Programm": "program",
  "beansprucht": "claimed",

  // ---- graph.js: kinds of historical events (GL.EVENT)
  "vermutet": "conjectured",
  "bewiesen": "proved",
  "verallgemeinert": "generalized",
  "übertragen": "transferred",
  "Beweis beansprucht": "proof claimed",
  "Einwand": "objection",
  "zurückgezogen": "withdrawn",

  // ---- graph.js: info box, relations and proofs
  "Teilresultate": "Partial results",
  "Teilresultat zu": "Partial result towards",
  "Bewiesen gleichwertig mit": "Proved equivalent to",
  "Setzt für die Formulierung voraus": "Presupposes for its formulation",
  "Wird für die Formulierung gebraucht von": "Needed for the formulation of",
  "Widerlegt durch": "Disproved by",
  "Zeigt die Bedeutung von": "Shows the meaning of",
  "Bedeutung gezeigt durch": "Meaning shown by",
  "bedingt: setzt {0} voraus": "conditional: assumes {0}",
  " und ": " and ",
  "Voraussetzungen:": "Premises:",
  "Methoden": "Methods",
  "Methode": "Method",
  "Klassifikation:": "Classification:",
  "Gegenbeispiel": "Counterexample",
  "Ein konkretes Objekt, das eine Aussage widerlegt; bewiesen, mit logischer Tiefe wie ein Satz":
    "A concrete object that disproves a statement; proved, with a logical depth like a theorem",

  // ---- graph.js: column headers (GL.aiColumns)
  "Tiefe {0}": "Depth {0}",
  "Beweis beansprucht (KI)": "Proof claimed (AI)",
  "Beweis beansprucht (KI), Stufe {0}": "Proof claimed (AI), level {0}",
  "Vermutungen": "Conjectures",
  "Vermutungen, Stufe {0}": "Conjectures, level {0}",

  // ---- graph.js: AI proofs. Verification statuses, Lean and share are codes in the data; here are their
  // labels.
  "KI": "AI",
  "KI-Beweis, {0}": "AI proof, {0}",
  "unbestätigt": "unconfirmed",
  "in Prüfung": "under review",
  "vom Autor geprüft": "checked by the author",
  "von Fachleuten bestätigt": "confirmed by experts",
  "vollständig": "complete",
  "wesentlich": "substantial",
  "Mithilfe": "assistance",
  "keine": "none",
  "Kein Fachmann hat den Beweis öffentlich bestätigt.": "No expert has publicly confirmed the proof.",
  "Fachleute geben öffentlich an, dass sie den Beweis prüfen; ein Ergebnis liegt noch nicht vor.":
    "Experts state publicly that they are checking the proof; there is no result yet.",
  "Ein Mathematiker hat den Beweis als Autor geprüft und übernimmt die Verantwortung dafür. Eine Begutachtung durch eine Zeitschrift gibt es noch nicht.":
    "A mathematician has checked the proof as an author and takes responsibility for it. There has been no journal review yet.",
  "Namentlich genannte Fachleute haben den Beweis gelesen und für richtig befunden.":
    "Experts, named publicly, have read the proof and found it correct.",
  "Der Urheber hat den Beweis zurückgenommen.": "The originator has withdrawn the proof.",
  "Hauptaussage in Lean formalisiert (nach Angabe der Urheber). Lean prüft, dass der formale Beweis die formale Aussage beweist, nicht, dass diese die gemeinte Aussage trifft.":
    "Main statement formalized in Lean (according to the originators). Lean checks that the formal proof proves the formal statement, not that the formal statement expresses the intended one.",
  "Nur ein Hilfssatz oder ein Teilfall ist in Lean formalisiert.": "Only a lemma or a special case is formalized in Lean.",
  "Keine Lean-Formalisierung.": "No Lean formalization.",
  "keine genannt": "none named",
  "Beanspruchter Beweis (KI)": "Claimed proof (AI)",
  "Beweis mit KI-Hilfe": "Proof with AI assistance",
  "Nicht von Fachleuten geprüft. Der Graph behandelt die Aussage nicht als bewiesen; der Beweis zählt nicht zur logischen Tiefe.":
    "Not checked by experts. The graph does not treat the statement as proved; the proof does not count towards the logical depth.",
  "Von einem Menschen als Autor geprüft, aber nicht von einer Zeitschrift begutachtet. Der Beweis zählt als gewöhnlicher Beweis.":
    "Checked by a human as author, but not reviewed by a journal. The proof counts as an ordinary proof.",
  "Firma": "Company",
  "Modell": "Model",
  "Anteil der KI": "Share of the AI",
  "Datum": "Date",
  "Beteiligte Menschen": "People involved",
  "Prüfstand": "Review status",
  "Hinweis": "Note",
  "Quelle": "Source",
  "Stand des Eintrags": "Entry as of",
  "Einordnung und Quellen:": "Context and sources:",
  "Notiz „Von KI bewiesene Sätze in algebraischer und arithmetischer Geometrie“":
    "note “Theorems proved by AI in algebraic and arithmetic geometry” (in German)",
  "KI-Beweise ({0})": "AI proofs ({0})",
  "Beweise, die nach Angabe der Beteiligten ganz oder wesentlich von einem Sprachmodell stammen. Beanspruchte Beweise (violett mit Marke „KI“) sind nicht von Fachleuten geprüft; ihre Ziele stehen als Vermutungen mit dem Stand „beansprucht“ rechts der Trennlinie oder sind vorhandene Vermutungen, deren Stand unverändert bleibt. Stand der Einträge: {0}. Ausführlich in der <a href=\"{1}\">Notiz</a>.":
    "Proofs that, according to those involved, come entirely or substantially from a language model. Claimed proofs (purple, labeled “AI”) have not been checked by experts; their targets appear as conjectures with the status “claimed” to the right of the dividing line, or they are existing conjectures whose status remains unchanged. Entries as of {0}. Details in the <a href=\"{1}\">note</a> (in German).",

  // ---- ar.js: references
  "Im Satzgraphen der algebraischen Geometrie": "In the theorem graph of algebraic geometry",
  "{0} ({1}; Stand dort: {2})": "{0} ({1}; status there: {2})",
  "In der Tabelle großer Sätze und Vermutungen": "In the table of major theorems and conjectures",
  "In der Galerie": "In the gallery",
  "Verweise": "References",

  // ---- verstaendlichkeit-filter.js
  "Verständlichkeit der Aussage bzw. Definition:": "Comprehensibility of the statement or definition:",
  "Verständlichkeit der Definition:": "Comprehensibility of the definition:",
  "Verständlichkeit der Aussage:": "Comprehensibility of the statement:",
  "Welches Vorwissen braucht man, um zu verstehen, was behauptet oder definiert wird? Redaktionelle Einschätzung; zählt die zugänglichste gleichwertige Fassung.":
    "What prior knowledge does one need to understand what is claimed or defined? Editorial assessment; the most accessible equivalent formulation counts.",
  "{0} ohne Einstufung, immer gezeigt": "{0} not rated, always shown",
  "Definitorische Tiefe des Begriffs: {0}.": "Definitional depth of the concept: {0}.",
  "Definitorische Tiefe der Aussage: {0} (tiefster Begriff in der Aussage: {1}).":
    "Definitional depth of the statement: {0} (deepest concept in the statement: {1}).",
  "Definitorische Tiefe der Aussage: nicht berechnet, weil dieser Aussage in begriffe.js keine Begriffe zugeordnet sind.":
    "Definitional depth of the statement: not computed, because no concepts are assigned to this statement in begriffe.js.",
  "Diese Zahl hängt von der gewählten Definition ab und misst nicht dasselbe wie die Stufe:":
    "This number depends on the chosen definition and does not measure the same thing as the level:",
  "Die elliptische Kurve hat in diesem Begriffsgraphen die Tiefe {0} (als Kurve vom Geschlecht 1 mit einem Punkt, wie bei Silverman), über die Weierstraß-Gleichung wäre sie etwa 2.":
    "In this concept graph the elliptic curve has depth {0} (as a curve of genus 1 with a point, as in Silverman); via the Weierstrass equation it would be about 2.",
  "Eine elliptische Kurve hat als Kurve vom Geschlecht 1 nach Silverman eine große Tiefe, über die Weierstraß-Gleichung etwa 2.":
    "As a curve of genus 1 (following Silverman), an elliptic curve has a large depth; via the Weierstrass equation, about 2.",
  "Verständlichkeit": "Comprehensibility",
  "Noch nicht eingestuft.": "Not yet rated.",
  "Verständlichkeit der Definition": "Comprehensibility of the definition",
  "Verständlichkeit der Aussage": "Comprehensibility of the statement",
  "Stufe {0}, {1}.": "Level {0}, {1}.",
  "Zugänglichste Fassung:": "Most accessible formulation:",
});
