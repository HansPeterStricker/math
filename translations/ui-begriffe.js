// English interface texts of the concept graphs: „graphs/algebraic-geometry/begriffe.html“ and
// „graphs/arithmetic-geometry/begriffe.html“.
// Keys "#…" belong to elements with data-t; the other keys are the German texts in the page code.
// Patterns with {0}, {1} … are filled with numbers and names in the page code.
window.EN_UI = Object.assign(window.EN_UI || {}, {
  // Page header
  "#bg-titel-ag": "Concepts of algebraic geometry",
  "#bg-titel-ar": "Concepts of arithmetic geometry",
  "#bg-nav-saetze": "Theorems",
  "#bg-nav-saetze-v": "Theorems and conjectures",
  "#bg-nav-begriffe": "Concepts",
  "#bg-nav-bipartit": "Concepts and theorems",
  "#bg-nav-gross": "Large graph",
  "#bg-nav-ag": "Concepts of algebraic geometry",
  "#bg-einleitung-ag": "Each box is a definition. An arrow from A to B means that B is defined with the help of A. The columns " +
    "order the concepts by definitional depth: basic concepts without a definition are in column 0, every other concept " +
    "one column to the right of the deepest concept its definition uses. The bottom right of a box shows the kind of " +
    "concept, the bottom left the number of theorems of the theorem graph in whose statement it occurs. Pointing the mouse " +
    "at a concept highlights its direct connections: brown, what it is defined with; blue, what it is used for. A click " +
    "shows the definition and marks all predecessors and successors.",
  "#bg-einleitung-ar": "Each box is a definition. An arrow from A to B means that B is defined with the help of A. The columns " +
    "order the concepts by definitional depth: basic concepts without a definition are in column 0, every other concept " +
    "one column to the right of the deepest concept its definition uses. The bottom right of a box shows the kind of " +
    "concept, the bottom left the number of theorems and conjectures in whose statement it occurs. Pointing the mouse " +
    "at a concept highlights its direct connections: brown, what it is defined with; blue, what it is used for. A click " +
    "shows the definition and marks all predecessors and successors.",
  "Begriffsgraph": "Concept graph",

  // Graph
  "Grundbegriffe": "Basic concepts",
  "Tiefe {0}": "Depth {0}",
  "{0} wird mit {1} definiert": "{0} is defined using {1}",
  "Objekt": "object",
  "Eigenschaft": "property",
  "Morphismus": "morphism",
  "Konstruktion": "construction",
  "Invariante": "invariant",
  "1 Satz": "1 theorem",
  "{0} Sätze": "{0} theorems",
  "1 Aussage": "1 statement",
  "{0} Aussagen": "{0} statements",

  // Legend
  "auch mittelbare Kanten zeigen ({0} Kanten, deren Begriff schon über einen anderen benutzten Begriff gebraucht wird)":
    "also show indirect edges ({0} edges whose concept is already needed via another concept that is used)",

  // Overview
  "Übersicht": "Overview",
  "{0} Begriffe, {1} definitorische Abhängigkeiten, davon {2} mittelbar.":
    "{0} concepts, {1} definitional dependencies, {2} of them indirect.",
  "Größte definitorische Tiefe: {0}.": "Greatest definitional depth: {0}.",
  "{0} Begriffe kommen auch im Begriffsgraphen der algebraischen Geometrie vor.":
    "{0} concepts also occur in the concept graph of algebraic geometry.",
  "Am häufigsten in Aussagen": "Most frequent in statements",
  "Begriffe, die in den meisten Sätzen des Satzgraphen in der Aussage vorkommen.":
    "Concepts that occur in the statements of the most theorems of the theorem graph.",
  "Begriffe, die in den meisten Sätzen und Vermutungen in der Aussage vorkommen.":
    "Concepts that occur in the statements of the most theorems and conjectures.",
  "Am meisten weiterverwendet": "Most reused",
  "Begriffe, mit deren Hilfe (mittelbar) die meisten anderen definiert werden.":
    "Concepts with whose help (indirectly) the most other concepts are defined.",
  "{0} Begriffe": "{0} concepts",
  "In keiner Aussage": "In no statement",
  "Diese {0} Begriffe werden nur gebraucht, um andere zu definieren; in den Aussagen der Sätze kommen sie nicht vor.":
    "These {0} concepts are only needed to define others; they do not occur in the statements of the theorems.",
  "Diese {0} Begriffe werden nur gebraucht, um andere zu definieren.":
    "These {0} concepts are only needed to define others.",
  "Lesart": "How to read the graph",
  "Ohne die mittelbaren Kanten zeigt der Graph die transitive Reduktion: Jede Linie ist eine Abhängigkeit, die nicht schon über einen anderen Begriff entsteht. Die Tiefe hängt davon ab, welche Definition gewählt ist und wie fein die Begriffe unterteilt sind.":
    "Without the indirect edges the graph shows the transitive reduction: every line is a dependency that does not " +
    "already arise via another concept. The depth depends on which definition is chosen and how finely the concepts " +
    "are subdivided.",
  "Ohne die mittelbaren Kanten zeigt der Graph die transitive Reduktion. Der Begriff „Körper mit einem Element“ hat keine Definition; er steht deshalb bei den Grundbegriffen, obwohl er kein Grundbegriff ist.":
    "Without the indirect edges the graph shows the transitive reduction. The concept “field with one element” has no " +
    "definition; it therefore stands among the basic concepts although it is not a basic concept.",

  // Sidebar of a concept
  "definitorische Tiefe {0}": "definitional depth {0}",
  "Verweise": "References",
  "Im Begriffsgraphen der algebraischen Geometrie: {0}": "In the concept graph of algebraic geometry: {0}",
  "Wird definiert mit": "Defined using",
  "Grundbegriff, in diesem Graphen nicht weiter definiert.": "Basic concept, not defined further in this graph.",
  "In diesem Graphen nicht weiter definiert.": "Not defined further in this graph.",
  "Wird gebraucht für": "Used to define",
  "Kommt vor in den Sätzen": "Occurs in the theorems",
  "Kommt vor in den Aussagen": "Occurs in the statements",
  "In keiner Aussage des Satzgraphen.": "In no statement of the theorem graph.",
  "Hängt insgesamt ab von": "Depends altogether on",
  "{0} Begriffen (braun markiert)": "{0} concepts (marked brown)",
  "Insgesamt gebraucht für": "Used altogether for",
  "{0} Begriffe (blau markiert)": "{0} concepts (marked blue)",
  "In der Ansicht Begriffe und Sätze": "In the view Concepts and theorems",
  "Zur Übersicht": "Back to overview",
});
