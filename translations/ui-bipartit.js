// English interface texts of the bipartite graphs of concepts and theorems:
// „graphs/algebraic-geometry/bipartit.html“ and „graphs/arithmetic-geometry/bipartit.html“.
// Keys "#…" belong to elements with data-t; the other keys are the German texts in the page code.
// Patterns with {0}, {1} … are filled with numbers and names in the page code.
window.EN_UI = Object.assign(window.EN_UI || {}, {
  // Page header
  "#bp-titel-ag": "Concepts and theorems",
  "#bp-titel-ar": "Concepts, theorems and conjectures",
  "#bp-nav-saetze": "Theorems",
  "#bp-nav-saetze-v": "Theorems and conjectures",
  "#bp-nav-begriffe": "Concepts",
  "#bp-nav-bipartit": "Concepts and theorems",
  "#bp-nav-gross": "Large graph",
  "#bp-nav-ag": "Algebraic geometry",
  "#bp-einleitung-ag": "The concepts are on the left, the theorems on the right. A line connects a concept with a theorem if " +
    "the concept occurs in the statement of the theorem, including the hypotheses; concepts that are only needed in the " +
    "proof do not count. The order on both sides is chosen so that as few lines as possible cross: each side in turn is " +
    "sorted by the average position of its partners on the other side. Concepts that occur in no statement are missing " +
    "here; they are listed in the analysis. A click on a concept or theorem marks its partners.",
  "#bp-einleitung-ar": "The concepts are on the left, the theorems and conjectures on the right; conjectures have a dashed " +
    "border. A line connects a concept with a statement if the concept occurs in it, including the hypotheses; concepts " +
    "that are only needed in the proof do not count. The order on both sides is chosen so that as few lines as possible " +
    "cross: each side in turn is sorted by the average position of its partners on the other side. A click on a concept " +
    "or a statement marks its partners.",
  "Bipartiter Graph aus Begriffen und Sätzen": "Bipartite graph of concepts and theorems",
  "Bipartiter Graph aus Begriffen, Sätzen und Vermutungen": "Bipartite graph of concepts, theorems and conjectures",

  // Graph
  "Begriffe ({0})": "Concepts ({0})",
  "Sätze ({0})": "Theorems ({0})",
  "Sätze und Vermutungen ({0})": "Theorems and conjectures ({0})",
  "{0} kommt vor in: {1}": "{0} occurs in: {1}",

  // Legend
  "Begriffe sind nach ihrem Bereich gefärbt, Sätze nach dem Bereich in daten.js; die Linien haben die Farbe des Begriffs. Die Zahl hinter einem Begriff ist die Zahl der Sätze, in denen er vorkommt.":
    "Concepts are colored by their area, theorems by the area in daten.js; the lines have the color of the concept. " +
    "The number after a concept is the number of theorems in which it occurs.",
  "mit Vermutungen": "with conjectures",
  "(ausgeblendet; rechts stehen nur bewiesene Sätze)": "(hidden; only proved theorems are shown on the right)",
  "Satz": "Theorem",
  "Vermutung": "Conjecture",
  "Begriffe sind nach ihrem Bereich gefärbt, Aussagen nach dem Bereich in daten.js; die Linien haben die Farbe des Begriffs. Die Zahl hinter einem Begriff ist die Zahl der Aussagen, in denen er vorkommt.":
    "Concepts are colored by their area, statements by the area in daten.js; the lines have the color of the concept. " +
    "The number after a concept is the number of statements in which it occurs.",

  // Analysis
  "Auswertung": "Analysis",
  "{0} Begriffe mit {1} Vorkommen in {2} Sätzen (im Mittel {3} Begriffe je Aussage).":
    "{0} concepts with {1} occurrences in {2} theorems (on average {3} concepts per statement).",
  "Kreuzungen: {0} nach der Sortierung, {1} bei Sortierung nach Bereichen.":
    "Crossings: {0} after sorting, {1} when sorted by area.",
  "{0} Begriffe mit {1} Vorkommen in {2} Aussagen.": "{0} concepts with {1} occurrences in {2} statements.",
  "Im Mittel enthält die Aussage eines Satzes {0} Begriffe, die einer Vermutung {1}.":
    "On average the statement of a theorem contains {0} concepts, that of a conjecture {1}.",
  "Im Mittel enthält die Aussage eines Satzes {0} Begriffe.":
    "On average the statement of a theorem contains {0} concepts.",
  "Kreuzungen: {0} nach der Sortierung, {1} vorher.": "Crossings: {0} after sorting, {1} before.",
  "Häufigste Begriffe": "Most frequent concepts",
  "Begriff": "Concept",
  "Sätze": "Theorems",
  "Aussagen": "Statements",
  "Aussage": "Statement",
  "alle": "all",
  "ohne Rahmen": "without framework",
  "Aussagen, die viele Bereiche verbinden": "Statements that connect many areas",
  "Kandidaten für Brückensätze: Sätze, deren Aussage Begriffe aus vielen verschiedenen Bereichen enthält. Die erste Zahl zählt alle Begriffe der Aussage. Die zweite lässt die {0} Rahmenbegriffe weg, die in mindestens {1} Sätzen vorkommen ({2}); sie stehen meist in den Voraussetzungen und machen einen Satz noch nicht zur Brücke. Sortiert nach der zweiten Zahl.":
    "Candidates for bridge theorems: theorems whose statement contains concepts from many different areas. The first " +
    "number counts all concepts of the statement. The second omits the {0} framework concepts that occur in at least " +
    "{1} theorems ({2}); they usually appear in the hypotheses and do not by themselves make a theorem a bridge. " +
    "Sorted by the second number.",
  "Das Maß ist grob. Es zählt nur Bereiche, nicht ihren Abstand, und es hängt davon ab, wie die Begriffe auf Bereiche verteilt sind. Ein Satz wie GAGA verbindet zwei Kategorien, die verschieden definiert sind; ob ein Satz eine Brücke im Sinn von maps/Konzept/05 und 09 ist, muss man inhaltlich prüfen.":
    "The measure is crude. It counts only areas, not their distance, and it depends on how the concepts are " +
    "distributed among the areas. A theorem like GAGA connects two categories that are defined differently; whether a " +
    "theorem is a bridge in the sense of maps/Konzept/05 and 09 has to be checked on the merits.",
  "Die erste Zahl zählt die Bereiche aller Begriffe der Aussage. Die zweite lässt die {0} Rahmenbegriffe weg, die in mindestens {1} Aussagen vorkommen ({2}).":
    "The first number counts the areas of all concepts of the statement. The second omits the {0} framework concepts " +
    "that occur in at least {1} statements ({2}).",
  "keine": "none",
  "Das Maß ist grob. Es zählt nur Bereiche, nicht ihren Abstand. Brückensätze wie der Modularitätssatz oder die Formel von Gross-Zagier verbinden Bereiche, die hier nach Fachgebiet und nicht nach Herkunft der Begriffe getrennt sind.":
    "The measure is crude. It counts only areas, not their distance. Bridge theorems such as the modularity theorem or " +
    "the Gross–Zagier formula connect areas that are separated here by field and not by the origin of the concepts.",
  "Begriffe in keiner Aussage": "Concepts in no statement",
  "{0} Begriffe werden nur in Definitionen gebraucht und fehlen deshalb im Graphen:":
    "{0} concepts are only needed in definitions and are therefore missing from the graph:",
  "Aussagen ohne eingetragene Begriffe": "Statements without recorded concepts",

  // Sidebar of a concept or theorem
  "Kommt vor in {0} Satz": "Occurs in {0} theorem",
  "Kommt vor in {0} Sätzen": "Occurs in {0} theorems",
  "Kommt vor in {0} Aussage": "Occurs in {0} statement",
  "Kommt vor in {0} Aussagen": "Occurs in {0} statements",
  "Im Begriffsgraphen": "In the concept graph",
  "Zur Auswertung": "Back to analysis",
  "Begriffe der Aussage nach Bereich": "Concepts of the statement by area",
  "Im Satzgraphen": "In the theorem graph",
});
