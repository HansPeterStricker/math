// English interface texts of „graphs/arithmetic-geometry/index.html“ (theorem graph with conjectures).
// Keys "#ari-…" belong to elements with data-t; the other keys are the German texts in the page code.
// Patterns with {0}, {1} … are filled with numbers, names and chips in the page code.
// Texts from graph.js, ar.js and verstaendlichkeit-filter.js are in ui-graph.js.
window.EN_UI = Object.assign(window.EN_UI || {}, {
  "#title": "Theorems and conjectures of arithmetic geometry",

  // Page header
  "#ari-nav-saetze": "Theorems and conjectures",
  "#ari-nav-begriffe": "Concepts",
  "#ari-nav-bipartit": "Concepts and theorems",
  "#ari-nav-ag": "Algebraic geometry",
  "#ari-h1": "Theorems and conjectures of arithmetic geometry",
  "#ari-p1": `The graph connects proved theorems and open conjectures around the Riemann hypothesis, the Birch and
    Swinnerton-Dyer conjecture and the abc conjecture. Every box with a solid border is a theorem, every box with a
    dashed border a conjecture; its status is shown at the bottom left. Every small dot is a proof: the lines leading
    into it are its premises, which are all needed together; if a theorem has several dots, it has several proofs.`,
  "#ari-p2": `The columns on the left order foundations and theorems by logical depth. It is computed only via ordinary
    proofs: 1 plus the largest depth of the premises, taking the shortest proof. Conjectures have no logical depth.
    They therefore stand in separate columns to the right of the vertical dividing line. The first of these columns
    contains conjectures that do not follow conditionally from any other conjecture. If a conjecture follows
    conditionally from another one, it stands one column further to the right. Reformulations proved to be equivalent
    stand one column to the right of the conjecture they are equivalent to. Conditional proofs that lead back to an
    already proved theorem are dashed arcs pointing to the left.`,
  "#ari-p3": `Pointing at a node with the mouse highlights its direct connections: brown for what it needs, blue for
    what it is needed for. A click shows the formula, proofs and relations and marks all predecessors and successors.
    The toggle “with conjectures” in the legend hides conjectures, conditional proofs and all relations; what remains
    is a pure theorem graph as in the example Algebraic geometry (address <code>#vermutungen=0</code>).`,
  "#ari-p4": `The toggle “AI proofs” (address <code>#ki=1</code>, off by default) additionally shows a small selection
    of proofs that, according to those involved, come entirely or substantially from a language model. They are
    violet, carry the mark “AI” at the proof point, and their dash pattern shows the review status. Most of them are
    only claimed and have not been checked by experts. They therefore do not count towards logical depth, and their
    statements stand as conjectures with the status “claimed” in separate columns directly to the right of the
    dividing line; the status of the other conjectures remains unchanged. Because the targets of these proofs are
    conjectures, “AI proofs” also switches the conjectures on.`,
  "#ari-p5": `Boxes with a diamond pattern and a red border are counterexamples: concrete objects that refute a
    statement, such as Selmer's cubic for the Hasse principle for curves of genus 1. A counterexample is proved and,
    like a theorem, stands in the column of its logical depth. A red dashed arrow leads from it to the disproved
    conjecture. A blue-green dashed arrow (“interpretation”) leads from a theorem to a statement whose meaning it
    shows; thus the Tate–Shafarevich group measures how strongly the Hasse principle fails for curves of genus 1.`,
  "Graph der Sätze und Vermutungen": "Graph of the theorems and conjectures",

  // Tooltips of the edges and proof points
  "{0} → {1} (KI-Beweis, {2}, Beweis „{3}“)": "{0} → {1} (AI proof, {2}, proof “{3}”)",
  "{0} → {1} (bedingter Beweis „{2}“)": "{0} → {1} (conditional proof “{2}”)",
  "{0} → {1} (Beweis „{2}“)": "{0} → {1} (proof “{2}”)",
  "{0} → {1} (bedingter Beweis „{2}“, rückwärts)": "{0} → {1} (conditional proof “{2}”, backwards)",
  "{0} → {1} (Beweis „{2}“, rückwärts)": "{0} → {1} (proof “{2}”, backwards)",
  "Beanspruchter KI-Beweis „{0}“ für {1}": "Claimed AI proof “{0}” of {1}",
  "Beweis mit KI-Hilfe „{0}“ für {1}": "AI-assisted proof “{0}” of {1}",
  "Bedingter Beweis „{0}“ für {1}": "Conditional proof “{0}” of {1}",
  "Beweis „{0}“ für {1}": "Proof “{0}” of {1}",
  "„{0}“": "“{0}”",

  // Nodes
  "Gegenbeispiel": "Counterexample",
  "auch in AG": "also in AG",

  // Legend
  "mit Vermutungen": "with conjectures",
  "(ausgeblendet: Vermutungen, bedingte Beweise und alle Beziehungen; reiner Satzgraph)":
    "(hidden: conjectures, conditional proofs and all relations; pure theorem graph)",
  "KI-Beweise": "AI proofs",
  "(beanspruchte Beweise sind ungeprüft; schaltet die Vermutungen mit ein)":
    "(claimed proofs are unchecked; also switches the conjectures on)",
  "Satz": "Theorem",
  "Vermutung": "Conjecture",
  "nur hervorgehobene Knoten betonen": "emphasize highlighted nodes only",

  // Overview
  "Übersicht": "Overview",
  "{0} Grundlagen, {1} Sätze, {2} Gegenbeispiele, {3} Vermutungen. {4} gewöhnliche Beweise mit {5} Voraussetzungen, {6} bedingte Beweise mit {7} Voraussetzungen; {8} Teilresultate, {9} Äquivalenzen, {10} Analogien, {11} Voraussetzungen der Formulierung. Größte logische Tiefe: {12}.":
    "{0} foundations, {1} theorems, {2} counterexamples, {3} conjectures. {4} ordinary proofs with {5} premises, {6} conditional proofs with {7} premises; {8} partial results, {9} equivalences, {10} analogies, {11} prerequisites of formulation. Greatest logical depth: {12}.",
  "Kantenarten": "Kinds of edges",
  "Vermutungen sind ausgeblendet. Der Graph enthält nur bewiesene Sätze und gewöhnliche Beweise, wie im Beispiel Algebraische Geometrie.":
    "Conjectures are hidden. The graph contains only proved theorems and ordinary proofs, as in the example Algebraic geometry.",
  "Welche Sätze gehen sicher in einen Beweis ein?": "Which theorems are certain to enter a proof?",
  "Logisch lässt sich nie zeigen, dass ein bestimmter Satz in jeden künftigen Beweis einer Vermutung eingehen muss: Ist die Vermutung beweisbar, so ist jeder bewiesene Satz eine gültige, aber überflüssige Voraussetzung. Der Graph zeigt deshalb vier schwächere Beziehungen. (a) Bewiesene Reduktionen erscheinen als bedingte Beweise, etwa {0} historisch aus der Modularität oder {1} aus der abc-Vermutung. Sie zeigen einen hinreichenden Weg, keinen notwendigen; die {2} folgt aus den {3}, wurde aber ohne sie bewiesen. (b) Teilresultate wie {4} muss jeder Beweis als Spezialfall mitliefern, nicht aber ihren Beweis. (c) Dass alle bekannten Ansätze einen Satz benutzen, ist eine Aussage über die Literatur und keine Kante. Am nächsten kommt ihr die Voraussetzung der Formulierung: Ohne {5} hat die BSD-Vermutung keinen Gegenstand. (d) Bei bewiesenen Äquivalenzen wie {6} liefert ein Beweis der einen Aussage zusammen mit dem Äquivalenzbeweis einen Beweis der anderen. Ausführlich in der README.":
    "Logic can never show that a particular theorem must enter every future proof of a conjecture: if the conjecture is provable, every proved theorem is a valid but superfluous premise. The graph therefore shows four weaker relations. (a) Proved reductions appear as conditional proofs, for example {0}, historically from modularity, or {1} from the abc conjecture. They show a sufficient route, not a necessary one; the {2} follows from the {3} but was proved without them. (b) Partial results such as {4} must be delivered by every proof as a special case, but not their proof. (c) That all known approaches use a theorem is a statement about the literature and not an edge. The closest to it is the prerequisite of formulation: without {5} the BSD conjecture has no subject. (d) For proved equivalences such as {6}, a proof of one statement together with the proof of the equivalence yields a proof of the other. Details in the README.",
  "Vermutungen nach Stand": "Conjectures by status",
  "Besondere Knoten": "Special nodes",
  "Redaktionelle Einschätzung nach dem Leitgedanken des Projekts, keine Messung.":
    "Editorial assessment following the guiding idea of the project, not a measurement.",
  "Knotenpunkte": "Hubs",
  "Sätze, von denen die meisten anderen Knoten abhängen (über irgendeinen Beweis, auch bedingte).":
    "Theorems on which the most other nodes depend (via any proof, including conditional ones).",

  // Info box of a node
  "Begriffe in der Aussage": "Concepts in the statement",
  "vermutet": "conjectured",
  "bewiesen": "proved",
  "bedingt bewiesen": "conditionally proved",
  "verallgemeinert": "generalized",
  "übertragen": "transferred",
  "Beweis beansprucht": "proof claimed",
  "Einwand": "objection",
  "widerlegt": "disproved",
  "zurückgezogen": "withdrawn",
  "Geschichte": "History",
  "ca. ": "c. ",
  "(Beweis „{0}“)": "(proof “{0}”)",
  "Jahreszahlen noch nicht an Quellen geprüft.": "Years not yet checked against sources.",
  "Teilresultate": "Partial results",
  "Teilresultat zu": "Partial result towards",
  "Bewiesen gleichwertig mit": "Proved equivalent to",
  "Analogie": "Analogy",
  "Setzt für die Formulierung voraus": "Presupposes for its formulation",
  "Wird für die Formulierung gebraucht von": "Needed for the formulation of",
  "Beweis {0}: ": "Proof {0}: ",
  "Beweis: ": "Proof: ",
  "bedingt: setzt {0} voraus": "conditional: assumes {0}",
  " und ": " and ",
  "Voraussetzungen:": "Premises:",
  "Grundlage außerhalb des Graphen": "Foundation outside the graph",
  "logische Tiefe {0}": "logical depth {0}",
  "Stand „{0}“: {1}": "Status “{0}”: {1}",
  "Beweise": "Proofs",
  "Kein Beweis bekannt.": "No proof known.",
  "Direkt gebraucht in Beweisen für": "Used directly in proofs of",
  "Direkt gebraucht in bedingten Beweisen für": "Used directly in conditional proofs of",
  "Direkt gebraucht in beanspruchten KI-Beweisen für": "Used directly in claimed AI proofs of",
  "Hängt insgesamt ab von": "Depends in total on",
  "{0} Knoten (braun markiert), auch über bedingte Beweise": "{0} nodes (marked brown), including via conditional proofs",
  "{0} Knoten (braun markiert), auch über bedingte und beanspruchte Beweise":
    "{0} nodes (marked brown), including via conditional and claimed proofs",
  "Insgesamt gebraucht für": "Needed in total for",
  "{0} Knoten (blau markiert)": "{0} nodes (marked blue)",
  "In der Ansicht Begriffe und Sätze": "In the view Concepts and theorems",
  "Zur Übersicht": "Back to overview",
});

// Verification statuses of the AI proofs (values of ki.verification) also appear in the tooltips of this page.
// They belong to
// graph.js; listed here only as a fallback in case ui-graph.js does not contain them.
(function () {
  const replacement = {
    "unbestätigt": "unconfirmed",
    "in Prüfung": "under review",
    "vom Autor geprüft": "checked by the author",
    "von Fachleuten bestätigt": "confirmed by experts",
  };
  Object.keys(replacement).forEach((k) => { if (!(k in window.EN_UI)) window.EN_UI[k] = replacement[k]; });
})();
