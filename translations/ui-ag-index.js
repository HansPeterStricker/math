// English interface texts of „graphs/algebraic-geometry/index.html“ (theorem graph).
// Keys "#…" belong to elements with data-t or data-t-title; the other keys are the German texts in the
// page code. Patterns with {0}, {1} … are filled with numbers and names in the page code. Texts from graph.js are in
// translations/ui-graph.js.
window.EN_UI = Object.assign(window.EN_UI || {}, {
  "#title": "Theorems of algebraic geometry",

  // Navigation between the views
  "#ag-nav-saetze": "Theorems",
  "#ag-nav-begriffe": "Concepts",
  "#ag-nav-bipartit": "Concepts and theorems",
  "#ag-nav-gross": "Large graph",

  // Header
  "#agi-h1": "Central theorems of algebraic geometry",
  "#agi-p1": "Each box is a theorem, each small dot a proof. The lines running into a dot are its premises; they are all " +
    "needed together. If a theorem has several dots, it has several independent proofs. The columns order the theorems " +
    "by logical depth. Logical depth is the length of the longest chain of premises in the shortest proof: within a " +
    "proof the deepest premise counts, because all of them are needed; among several proofs the one with the smallest " +
    "depth counts. The foundations have depth 0. Depth is not a property of the theorem alone. It depends on how finely " +
    "the graph is divided into intermediate results, which proofs are entered and what is counted among the " +
    "foundations; every step counts the same, however laborious it is. Comparisons therefore only make sense within " +
    "this graph. Grey boxes on the left are foundations outside the graph. Each line starts light at the theorem that " +
    "is used and becomes darker towards the proof point; from the dot an arrow leads to the proved theorem. Dashed " +
    "lines run backwards: they belong to a proof that is not the shortest one and come from a theorem in the same " +
    "column or a column further to the right. They have the color of the theorem they start from throughout. Pointing " +
    "at a theorem with the mouse brings out its direct connections: brown what it needs, blue what it is needed for. A " +
    "click shows the formula and the proofs and marks all predecessors and successors. The fill color indicates the " +
    "area within algebraic geometry. If a theorem belongs to two main areas of the Mathematics Subject Classification " +
    "(MSC 2020), for instance to algebraic geometry and to number theory, it has a two-colored border in the colors of " +
    "these areas.",
  "#agi-p2": "The toggle “with conjectures” adds open conjectures, for instance the Hodge conjecture and Grothendieck’s " +
    "standard conjectures. They have a dashed border and their status at the bottom right. Since they are unproved, " +
    "they have no logical depth; they stand in columns of their own to the right of the vertical dividing line. A " +
    "conditional proof (dashed crimson) presupposes a conjecture. Green dotted arrows lead from a theorem that proves a " +
    "special case to the conjecture; further lines show analogies and theorems without which a conjecture cannot be " +
    "formulated. The legend explains all kinds of lines.",
  "#agi-p3": "The toggle “AI proofs” (address <code>ki=1</code>, off by default) additionally shows proofs that, " +
    "according to those involved, come entirely or substantially from a language model. They are violet and carry the " +
    "mark “AI” at the proof point; dashed means that experts have not confirmed the proof. Such claimed proofs do " +
    "not count towards logical depth. Their statements appear as conjectures with the status “claimed” in a column of " +
    "their own directly to the right of the dividing line, and the status of the other conjectures remains unchanged. " +
    "Since the targets of these proofs are conjectures, “AI proofs” also switches on the conjectures.",
  "Beweisgraph": "Proof graph",

  // Titles of the edges and proof points
  "{0} → {1} (KI-Beweis, {2}, Beweis „{3}“)": "{0} → {1} (AI proof, {2}, proof “{3}”)",
  "{0} → {1} (bedingter Beweis „{2}“)": "{0} → {1} (conditional proof “{2}”)",
  "{0} → {1} (Beweis „{2}“)": "{0} → {1} (proof “{2}”)",
  "{0} → {1} (bedingter Beweis „{2}“, rückwärts)": "{0} → {1} (conditional proof “{2}”, backwards)",
  "{0} → {1} (Beweis „{2}“, rückwärts: nicht der kürzeste Beweis)": "{0} → {1} (proof “{2}”, backwards: not the shortest proof)",
  "Beanspruchter KI-Beweis „{0}“ für {1}": "Claimed AI proof “{0}” of {1}",
  "Beweis mit KI-Hilfe „{0}“ für {1}": "AI-assisted proof “{0}” of {1}",
  "Bedingter Beweis „{0}“ für {1}": "Conditional proof “{0}” of {1}",
  "Beweis „{0}“ für {1}": "Proof “{0}” of {1}",
  // Verification status of an AI proof (field ki.verification)
  "unbestätigt": "unconfirmed",
  "in Prüfung": "under review",
  "vom Autor geprüft": "checked by the author",
  "bestätigt": "confirmed",

  // Legend
  "Vermutungen, bedingte Beweise und Beziehungen zeigen": "Show conjectures, conditional proofs and relations",
  "mit Vermutungen": "with conjectures",
  "Beweise, die ganz oder wesentlich von einem Sprachmodell stammen; schaltet die Vermutungen mit ein":
    "Proofs that come entirely or substantially from a language model; also switches on the conjectures",
  "KI-Beweise": "AI proofs",
  "Satz": "Theorem",
  "Vermutung (unten rechts ihr Stand)": "Conjecture (status at the bottom right)",
  "nur hervorgehobene Sätze betonen": "emphasize highlighted theorems only",
  "Hauptgebiete (MSC):": "Main areas (MSC):",
  "nur Grundlagen": "foundations only",
  "Zweifarbiger Rand: zwei Hauptgebiete, links das erste, rechts das zweite ({0} Sätze).":
    "Two-colored border: two main areas, the first on the left, the second on the right ({0} theorems).",

  // Overview in the info box
  "Vermutungen": "Conjectures",
  "{0} Vermutungen, {1} bedingte Beweise, {2} Teilresultate, {3} Analogien, {4} Äquivalenzen und {5} Voraussetzungen der Formulierung. Weitere Vermutungen mit Anschluss an Sätze des großen Graphen stehen in der Ansicht „Großer Graph“.":
    "{0} conjectures, {1} conditional proofs, {2} partial results, {3} analogies, {4} equivalences and {5} prerequisites " +
    "of the formulation. Further conjectures connected to theorems of the large graph are shown in the view “Large graph”.",
  "Kantenarten": "Kinds of edges",
  "Besondere Sätze": "Notable theorems",
  "Redaktionelle Einschätzung nach dem Leitgedanken des Projekts, keine Messung. Ein Klick zeigt die Begründung.":
    "Editorial assessment following the guiding idea of the project, not a measurement. A click shows the reason.",
  "Knotenpunkte": "Hubs",
  "Zwischenergebnisse, von denen die meisten anderen Sätze dieses Graphen abhängen (über irgendeinen Beweis).":
    "Intermediate results on which most other theorems of this graph depend (via any proof).",
  "{0} Sätze": "{0} theorems",
  "Lesart": "How to read",
  "Ausgefüllter Punkt: einziger bekannter Beweis in diesem Graphen. Hohler Punkt: einer von mehreren Beweisen. Die logische Tiefe bezieht sich nur auf diesen Graphen und hängt davon ab, wie fein er unterteilt ist.":
    "Filled dot: the only known proof in this graph. Hollow dot: one of several proofs. Logical depth refers to this " +
    "graph only and depends on how finely it is divided.",

  // Info box of a theorem
  "Begriffe in der Aussage": "Concepts in the statement",
  "Geschichte": "History",
  "Ohne klaren Ursprung.": "No clear origin.",
  "ca. ": "c. ",
  " (Beweis „{0}“)": " (proof “{0}”)",
  "Jahreszahlen noch nicht an Quellen geprüft.": "Years not yet checked against sources.",
  "Beweis {0}: ": "Proof {0}: ",
  "Beweis: ": "Proof: ",
  "Grundlage außerhalb des Graphen": "Foundation outside the graph",
  "Vermutung": "Conjecture",
  "Gegenbeispiel": "Counterexample",
  "logische Tiefe {0}": "logical depth {0}",
  "Stand „{0}“: {1}": "Status “{0}”: {1}",
  "Beweise": "Proofs",
  "Kein Beweis bekannt.": "No proof known.",
  "Direkt gebraucht für": "Directly used for",
  "Direkt gebraucht in bedingten Beweisen für": "Directly used in conditional proofs of",
  "Direkt gebraucht in beanspruchten KI-Beweisen für": "Directly used in claimed AI proofs of",
  "Hängt insgesamt ab von": "Depends in total on",
  "{0} Knoten (braun markiert)": "{0} nodes (marked brown)",
  "{0} Knoten (braun markiert), auch über bedingte Beweise": "{0} nodes (marked brown), including via conditional proofs",
  "{0} Knoten (braun markiert), auch über bedingte und beanspruchte Beweise":
    "{0} nodes (marked brown), including via conditional and claimed proofs",
  "Insgesamt gebraucht für": "Used in total for",
  "{0} Knoten (blau markiert)": "{0} nodes (marked blue)",
  "{0} Sätze (blau markiert)": "{0} theorems (marked blue)",
  "Zur Übersicht": "Back to overview",
});
