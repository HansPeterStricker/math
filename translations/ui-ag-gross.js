// English interface texts of „graphs/algebraic-geometry/gross.html“ (large theorem graph).
// Keys "#…" belong to elements with data-t or data-t-title; the other keys are the German texts in the
// page code. Patterns with {0}, {1} … are filled with numbers and names in the page code. Texts from graph.js are in
// translations/ui-graph.js.
window.EN_UI = Object.assign(window.EN_UI || {}, {
  "#title": "Large graph of algebraic geometry",

  // Navigation between the views
  "#ag-nav-saetze": "Theorems",
  "#ag-nav-begriffe": "Concepts",
  "#ag-nav-bipartit": "Concepts and theorems",
  "#ag-nav-gross": "Large graph",

  // Header
  "#agg-h1": "Theorems of algebraic geometry: large graph",
  "#agg-p1": "This graph extends the view “Theorems” by about 160 further theorems and lemmas, among them foundations of " +
    "scheme theory, abelian varieties, moduli spaces and deformations, Hodge theory in families, curves and surfaces, " +
    "intersection theory, the minimal model program and toric geometry. Each circle is a theorem, each grey square a " +
    "foundation outside the graph, each small dot a proof. The lines running into a proof point are its premises; from " +
    "the dot an arrow leads to the proved theorem. Dashed lines belong to proofs that are not the shortest: their " +
    "premise has the same or a greater logical depth than the proved theorem. Logical depth is the length of the " +
    "longest chain of premises in the shortest proof; foundations have depth 0. It depends on how finely the graph is " +
    "divided, which proofs are entered and what counts as a foundation, and is therefore only comparable within this " +
    "graph. The mouse wheel zooms, dragging pans the view. Pointing at a theorem brings out its direct connections, " +
    "the premises in brown and the theorems that use it in blue. A click marks all predecessors and successors and " +
    "shows the formula, proofs and history on the right. The fill color indicates the area within algebraic geometry. " +
    "If a theorem belongs to two main areas of the Mathematics Subject Classification (MSC 2020), for instance to " +
    "algebraic geometry and to number theory, it has a two-colored ring in the colors of these areas.",
  "#agg-p2": "The toggle “with conjectures” adds open conjectures, for instance the Hodge conjecture, the abundance " +
    "conjecture and resolution of singularities in characteristic p. They are dashed circles of fixed size and, in the " +
    "layout “Columns”, stand to the right of all theorems, because they have no logical depth. Conditional proofs that " +
    "presuppose a conjecture are dashed crimson; green dotted arrows lead from a theorem that proves a special case to " +
    "the conjecture. The legend below the main areas explains all kinds of lines.",
  "#agg-p3": "The toggle “AI proofs” (address <code>ki=1</code>, off by default) additionally shows proofs that, " +
    "according to those involved, come entirely or substantially from a language model, in violet and with the mark " +
    "“AI” at the proof point. Dashed means that experts have not confirmed the proof. Such claimed proofs do not count " +
    "towards logical depth; their statements are conjectures with the status “claimed” and, in the layout “Columns”, " +
    "stand in a column of their own before the other conjectures. Since the targets of these proofs are conjectures, " +
    "“AI proofs” also switches on the conjectures.",
  "#agg-anordnung": "Layout:",
  "#agg-knotengroesse": "Node size:",
  "#agg-mitv": "with conjectures",
  "#agg-mitv-titel": "Show conjectures, conditional proofs and relations",
  "#agg-mitki": "AI proofs",
  "#agg-mitki-titel": "Proofs that come entirely or substantially from a language model; also switches on the conjectures",
  "#agg-zplus": "Zoom in",
  "#agg-zminus": "Zoom out",
  "#agg-zalles": "All",
  "#agg-zalles-titel": "Show everything",
  "Satz suchen …": "Search theorem …",
  "Satz suchen": "Search theorem",
  "Großer Beweisgraph": "Large proof graph",

  // Node size and layout
  "Folgerungen (Fläche)": "Consequences (area)",
  "Die Fläche eines Kreises ist proportional zur Zahl der Sätze, die aus ihm folgen, direkt oder über Zwischenschritte, bei irgendeinem Beweis.":
    "The area of a circle is proportional to the number of theorems that follow from it, directly or via intermediate " +
    "steps, by any proof.",
  "Folgerungen (Radius)": "Consequences (radius)",
  "Der Radius eines Kreises ist proportional zur Zahl der Sätze, die aus ihm folgen. Große Werte wirken dadurch viel größer als bei flächentreuer Darstellung.":
    "The radius of a circle is proportional to the number of theorems that follow from it. Large values therefore look " +
    "much larger than with an area-true representation.",
  "Direkte Nutzer": "Direct users",
  "Die Fläche eines Kreises ist proportional zur Zahl der Sätze, deren Beweis ihn unmittelbar als Voraussetzung nennt.":
    "The area of a circle is proportional to the number of theorems whose proof names it directly as a premise.",
  "Gleich groß": "Equal size",
  "Alle Sätze sind gleich groß. Die Anordnung allein trägt die Information.":
    "All theorems have the same size. The layout alone conveys the information.",
  "Spalten nach Tiefe": "Columns by depth",
  "Bänder nach Bereichen": "Bands by area",
  "Kräfte": "Forces",
  "Kräfte mit Bereichsgruppen": "Forces with area groups",

  // Legend of the node size
  "Zahl der folgenden Sätze. Kleinster Kreis: 0 oder 1.": "Number of subsequent theorems. Smallest circle: 0 or 1.",
  "Zahl der direkten Nutzer. Kleinster Kreis: 0 oder 1.": "Number of direct users. Smallest circle: 0 or 1.",
  "Knotengröße: {0}.": "Node size: {0}.",
  "Grundlagen (graue Quadrate) haben eine feste Größe.": "Foundations (grey squares) have a fixed size.",
  "Gestrichelt: Beweis, der nicht der kürzeste ist.": "Dashed: proof that is not the shortest.",
  "Vermutungen (gestrichelter Kreis) haben eine feste Größe.": "Conjectures (dashed circle) have a fixed size.",
  "Rote Rauten sind Gegenbeispiele; sie sind bewiesen und haben eine logische Tiefe wie Sätze.":
    "Red diamonds are counterexamples; they are proved and have a logical depth like theorems.",

  // Filters and legends
  "alle": "all",
  "ohne Grundlagen": "without foundations",
  "Hauptgebiete (MSC):": "Main areas (MSC):",
  "nur Grundlagen": "foundations only",
  "Zweifarbiger Ring: zwei Hauptgebiete, links das erste, rechts das zweite.":
    "Two-colored ring: two main areas, the first on the left, the second on the right.",
  "nur Sätze mit mehreren Hauptgebieten hervorheben ({0})": "highlight only theorems with several main areas ({0})",
  "Vermutungen:": "Conjectures:",
  "Vermutung (gestrichelter Kreis)": "Conjecture (dashed circle)",

  // Titles of the edges, proof points and nodes
  "{0} → {1} (KI-Beweis, {2}: „{3}“)": "{0} → {1} (AI proof, {2}: “{3}”)",
  "{0} → {1} (bedingter Beweis „{2}“)": "{0} → {1} (conditional proof “{2}”)",
  "{0} → {1} (Beweis „{2}“)": "{0} → {1} (proof “{2}”)",
  "{0} → {1} (Beweis „{2}“, nicht der kürzeste)": "{0} → {1} (proof “{2}”, not the shortest)",
  "Beanspruchter KI-Beweis „{0}“ für {1}": "Claimed AI proof “{0}” of {1}",
  "Beweis mit KI-Hilfe „{0}“ für {1}": "AI-assisted proof “{0}” of {1}",
  "Bedingter Beweis „{0}“ für {1}": "Conditional proof “{0}” of {1}",
  "Beweis „{0}“ für {1}": "Proof “{0}” of {1}",
  "{0}: Vermutung, {1}": "{0}: conjecture, {1}",
  "{0}: {1} folgende Sätze, {2} direkte Nutzer, Tiefe {3}": "{0}: {1} subsequent theorems, {2} direct users, depth {3}",
  // Verification status of an AI proof (field ki.verification)
  "unbestätigt": "unconfirmed",
  "in Prüfung": "under review",
  "vom Autor geprüft": "checked by the author",
  "bestätigt": "confirmed",

  // Overview in the info box
  "Übersicht": "Overview",
  "{0} Knoten ({1} Sätze, {2} Vermutungen, {3} Grundlagen), {4} Beweise und {5} bedingte Beweise mit zusammen {6} Kanten, {7} Beziehungen":
    "{0} nodes ({1} theorems, {2} conjectures, {3} foundations), {4} proofs and {5} conditional proofs with {6} edges in " +
    "total, {7} relations",
  "{0} Knoten ({1} Sätze, {2} Grundlagen), {3} Beweise, {4} Kanten": "{0} nodes ({1} theorems, {2} foundations), {3} proofs, {4} edges",
  "Größte logische Tiefe {0}.": "Greatest logical depth {0}.",
  "Vermutungen nach Stand": "Conjectures by status",
  "Kantenarten": "Kinds of edges",
  "Die meisten folgenden Sätze": "Most subsequent theorems",
  "Die meisten direkten Nutzer": "Most direct users",
  "Satz": "Theorem",
  "folgende": "subsequent",
  "direkt": "direct",
  "Viele Folgerungen, wenige direkte Nutzer": "Many consequences, few direct users",
  "Sätze, deren Wirkung fast nur über Zwischenschritte geht. Bei der Größe „Folgerungen“ erscheinen sie groß, bei „Direkte Nutzer“ klein.":
    "Theorems whose effect runs almost entirely through intermediate steps. With the size “Consequences” they appear " +
    "large, with “Direct users” small.",
  "Lesart": "How to read",
  "„Folgende Sätze“ zählt alle Sätze, die über irgendeinen Beweis von diesem Satz abhängen, auch über alternative Beweise. Die Zahl hängt davon ab, wie fein der Graph unterteilt ist: Ein Zwischenschritt, der eingefügt wird, übernimmt die Folgerungen seines Vorgängers. Ausgefüllter Beweispunkt: einziger Beweis im Graphen; hohler Punkt: einer von mehreren. Farbige Ringe markieren redaktionell hervorgehobene Sätze (siehe Ansicht „Sätze“).":
    "“Subsequent theorems” counts all theorems that depend on this theorem via any proof, including alternative " +
    "proofs. The number depends on how finely the graph is divided: an intermediate step that is inserted takes over " +
    "the consequences of its predecessor. Filled proof point: the only proof in the graph; hollow dot: one of several. " +
    "Colored rings mark editorially highlighted theorems (see the view “Theorems”).",

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
  "zurzeit ausgeblendet": "currently hidden",
  "Stand „{0}“: {1}": "Status “{0}”: {1}",
  "Beweise": "Proofs",
  "Kein Beweis bekannt.": "No proof known.",
  "Direkt gebraucht für ({0})": "Directly used for ({0})",
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
