// Data model of the concept graph (concepts.html): concepts (definitions) of graph theory, MSC 2020 05C. In English.
// Moved on 4 November 2026 from ../../combinatorics/data/concepts.js (user: graph theory is an area of its own); the
// definitions, `uses`, `isA` and all other fields are unchanged, except that `area` is now one of the groupings in
// `groupAreas` (one sector each; the five-character classes of `msc5` grouped) instead of the single class 05C.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). Every concept that a
// definition (name, formula, defining prose) uses explicitly is in `uses`.
//
// References: combinatorics "co:" (concepts that stayed there), set theory "st:", elementary number theory "ent:",
// group theory "gt:", linear algebra "la:", field theory "ft:", probability "pr:".
// Prefix for references from other folders: "gr:<id>".
// Sources: Diestel, Graph Theory (5th ed. 2017); Bollobás, Modern Graph Theory (1998); Alon and Spencer, The
// Probabilistic Method (4th ed. 2016). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.GR_CONCEPTS = {
  title: "Concepts of graph theory",

  areas: {
    basic: "Defined elsewhere, no home folder yet",
    basics: "05C05–05C60 Graphs, paths, trees and connectivity",
    planarity: "05C10–05C83 Planarity, minors and colouring",
    matchings: "05C69, 05C70 Matchings, covers and cliques",
    extremal: "05C35, 05C80 Extremal and random graphs",
    spectral: "05C25–05C50 Spectra, expanders and Cayley graphs",
  },
  groupAreas: ["basics", "planarity", "matchings", "extremal", "spectral"],

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 05C05–05C60 Graphs, paths, trees and connectivity
    { id: "graph", name: "Graph", kind: "objekt", area: "basics", field: [5], msc: ["05C"], msc5: "05C99", uses: ["st:finite-set", "st:subset"],
      formula: String.raw`G = (V, E),\quad E \subseteq \tbinom{V}{2}`,
      text: "A finite set V of vertices with a set E of edges, each edge a set of two vertices; two vertices are adjacent if they form an edge. A subgraph has a subset of the vertices and edges; it is induced if it contains all edges of G between its vertices. The complement Ḡ has the same vertices and exactly the pairs that are not edges of G." },
    { id: "directed-graph", name: "Directed graph", kind: "objekt", area: "basics", field: [5], msc: ["05C"], msc5: "05C20", uses: ["st:finite-set", "st:ordered-pair"],
      formula: String.raw`D = (V, A),\quad A \subseteq V \times V`,
      text: "A finite set V of vertices with a set A of arcs, each an ordered pair (u, v) of vertices, directed from u to v. It is acyclic if no directed cycle exists." },
    { id: "vertex-degree", name: "Degree of a vertex", kind: "invariante", area: "basics", field: [5], msc: ["05C"], msc5: "05C07", uses: ["graph", "st:cardinality"],
      formula: String.raw`\deg v = \#\{e \in E : v \in e\}`,
      text: "The number of edges of a graph that contain the vertex v; Δ(G) is the largest degree." },
    { id: "regular-graph", name: "Regular graph", kind: "eigenschaft", area: "basics", field: [5], msc: ["05C"], msc5: "05C07", uses: ["vertex-degree"], isA: ["graph"],
      formula: String.raw`\deg v = d`,
      text: "A graph in which every vertex has the same degree d (d-regular)." },
    { id: "complete-graph", name: "Complete graph", kind: "objekt", area: "basics", field: [5], msc: ["05C"], msc5: "05C99", uses: ["graph"], isA: ["graph"],
      formula: String.raw`K_n,\quad K_{m,n}`,
      text: "The graph K<sub>n</sub> on n vertices in which any two vertices are adjacent; the complete bipartite graph K<sub>m,n</sub> has two sides of m and n vertices and all edges between them." },
    { id: "graph-path", name: "Path and cycle in a graph", kind: "konstruktion", area: "basics", field: [5], msc: ["05C"], msc5: "05C38", uses: ["graph"],
      formula: String.raw`v_0 v_1 \cdots v_k,\quad \{v_{i-1}, v_i\} \in E`,
      text: "A walk in a graph is a sequence of vertices in which consecutive vertices are adjacent; a path is a walk without repeated vertices, a cycle a closed walk of length at least 3 without repeated vertices apart from the end. A trail uses no edge twice." },
    { id: "connected-graph", name: "Connected graph", kind: "eigenschaft", area: "basics", field: [5], msc: ["05C"], msc5: "05C40", uses: ["graph-path"], isA: ["graph"],
      formula: String.raw`u \sim v \iff \text{a path joins } u \text{ and } v`,
      text: "A graph in which any two vertices are joined by a path; the maximal connected subgraphs are the components. A set X of vertices separates A from B if every A–B path meets X." },
    { id: "eulerian-circuit", name: "Eulerian circuit", kind: "konstruktion", area: "basics", field: [5], msc: ["05C"], msc5: "05C45", uses: ["graph-path"],
      formula: String.raw`v_0 v_1 \cdots v_{|E|} = v_0`,
      text: "A closed trail in a graph that uses every edge exactly once." },
    { id: "tree", name: "Tree", kind: "objekt", area: "basics", field: [5], msc: ["05C"], msc5: "05C05", uses: ["connected-graph", "graph-path"], isA: ["connected-graph"],
      formula: String.raw`G \ \text{connected, without cycles}`,
      text: "A connected graph without cycles; a forest is a graph without cycles. A leaf is a vertex of degree 1." },
    { id: "spanning-tree", name: "Spanning tree", kind: "konstruktion", area: "basics", field: [5], msc: ["05C"], msc5: "05C05", uses: ["tree", "graph"],
      formula: String.raw`T \subseteq G,\quad V(T) = V(G)`,
      text: "A subgraph of a graph that is a tree and contains all vertices; τ(G) denotes the number of spanning trees." },
    { id: "bipartite-graph", name: "Bipartite graph", kind: "eigenschaft", area: "basics", field: [5], msc: ["05C"], msc5: "05C99", uses: ["graph", "st:partition"], isA: ["graph"],
      formula: String.raw`V = X \sqcup Y,\quad e \cap X \ne \emptyset \ne e \cap Y`,
      text: "A graph whose vertex set is partitioned into two sides X and Y such that every edge has one end in each side." },
    { id: "hypercube-graph", name: "Hypercube graph", kind: "objekt", area: "basics", field: [5], msc: ["05C"], msc5: "05C99", uses: ["graph", "st:cartesian-product"], isA: ["graph"],
      formula: String.raw`Q_n:\ V = \{0, 1\}^n,\quad x \sim y \iff x, y \ \text{differ in one coordinate}`,
      text: "The graph on the 2<sup>n</sup> words of length n over {0, 1} in which two words are adjacent if they differ in exactly one coordinate." },
    { id: "graph-isomorphism", name: "Isomorphism of graphs", kind: "morphismus", area: "basics", field: [5], msc: ["05C"], msc5: "05C60", uses: ["graph", "st:bijection"],
      formula: String.raw`\varphi : V(G) \to V(H),\quad \{u, v\} \in E(G) \iff \{\varphi u, \varphi v\} \in E(H)`,
      text: "A bijection between the vertex sets of two graphs that maps edges exactly to edges." },

    // ------------------------------------------------------------ 05C10–05C83 Planarity, minors and colouring
    { id: "graph-colouring", name: "Proper colouring and chromatic number", kind: "invariante", area: "planarity", field: [5], msc: ["05C"], msc5: "05C15", uses: ["graph", "st:map"],
      formula: String.raw`c : V \to \{1, \dots, k\},\quad c(u) \ne c(v) \ \text{for}\ \{u, v\} \in E,\qquad \chi(G) = \min k`,
      text: "A proper k-colouring of a graph assigns to every vertex one of k colours so that adjacent vertices get different colours; the chromatic number χ(G) is the least such k. The chromatic number of a surface is the largest chromatic number of a graph embedded in it." },
    { id: "perfect-graph", name: "Perfect graph", kind: "eigenschaft", area: "planarity", field: [5], msc: ["05C"], msc5: "05C17", uses: ["graph-colouring", "clique"], isA: ["graph"],
      formula: String.raw`\chi(H) = \omega(H)`,
      text: "A graph G such that every induced subgraph H, including G itself, has chromatic number equal to the size of its largest clique." },
    { id: "planar-graph", name: "Planar graph", kind: "eigenschaft", area: "planarity", field: [5], msc: ["05C"], msc5: "05C10", uses: ["graph", "st:real-number", "top:topological-space"], isA: ["graph"],
      formula: String.raw`G \hookrightarrow \mathbb R^2`,
      text: "A graph that can be drawn in the plane ℝ<sup>2</sup> with vertices as points and edges as arcs that meet only at common end vertices; such a drawing is a plane graph, and the connected regions of the complement of the drawing are its faces. Drawing on another closed surface is an embedding into that surface." },
    { id: "crossing-number", name: "Crossing number", kind: "invariante", area: "planarity", field: [5], msc: ["05C"], msc5: "05C10", uses: ["graph", "st:real-number"],
      formula: String.raw`\operatorname{cr}(G) = \min \#\{\text{crossings of a drawing of } G\}`,
      text: "The least number of crossing points of edges in a drawing of the graph in the plane in which edges are arcs between their end vertices; planar graphs are those with crossing number 0." },
    { id: "graph-minor", name: "Minor and subdivision", kind: "morphismus", area: "planarity", field: [5], msc: ["05C"], msc5: "05C83", uses: ["graph", "graph-path"],
      formula: String.raw`H \preceq G`,
      text: "A graph H is a minor of G if it can be obtained from a subgraph of G by contracting edges (merging their two ends); a subdivision of H replaces the edges of H by paths with new inner vertices. A subdivision of H in G gives H as a minor." },
    { id: "kneser-graph", name: "Kneser graph", kind: "objekt", area: "planarity", field: [5], msc: ["05C"], msc5: "05C15", uses: ["graph", "st:subset", "st:intersection"], isA: ["graph"],
      formula: String.raw`KG(n, k):\ A \sim B \iff A \cap B = \emptyset`,
      text: "The graph whose vertices are the k-element subsets of {1, …, n}, two of them adjacent if they are disjoint." },

    // ------------------------------------------------------------ 05C69, 05C70 Matchings, covers and cliques
    { id: "matching", name: "Matching", kind: "konstruktion", area: "matchings", field: [5], msc: ["05C"], msc5: "05C70", uses: ["graph"],
      formula: String.raw`M \subseteq E,\quad e \cap f = \emptyset \ (e \ne f \in M)`,
      text: "A set of pairwise disjoint edges of a graph; ν(G) is the largest size of a matching. A path is alternating for M if its edges lie alternately outside and inside M, and augmenting if moreover its two ends are covered by no edge of M." },
    { id: "perfect-matching", name: "Perfect matching", kind: "eigenschaft", area: "matchings", field: [5], msc: ["05C"], msc5: "05C70", uses: ["matching"], isA: ["matching"],
      formula: String.raw`\bigcup M = V`,
      text: "A matching that covers every vertex of the graph." },
    { id: "vertex-cover", name: "Vertex cover", kind: "konstruktion", area: "matchings", field: [5], msc: ["05C"], msc5: "05C70", uses: ["graph"],
      formula: String.raw`e \cap C \ne \emptyset \quad (e \in E)`,
      text: "A set C of vertices of a graph that meets every edge; τ(G) is the smallest size of a vertex cover." },
    { id: "clique", name: "Clique and independent set", kind: "konstruktion", area: "matchings", field: [5], msc: ["05C"], msc5: "05C69", uses: ["graph", "complete-graph"],
      formula: String.raw`\omega(G),\quad \alpha(G) = \omega(\overline G)`,
      text: "A clique of a graph is a set of pairwise adjacent vertices, so that it spans a complete graph; an independent set is a set of pairwise non-adjacent vertices. ω(G) and α(G) are their largest sizes." },

    // ------------------------------------------------------------ 05C35, 05C80 Extremal and random graphs
    { id: "moore-graph", name: "Moore graph", kind: "objekt", area: "extremal", field: [5], msc: ["05C"], msc5: "05C35", uses: ["regular-graph", "graph-path"], isA: ["regular-graph"],
      formula: String.raw`|V| = d^2 + 1,\quad \operatorname{diam} G = 2`,
      text: "A d-regular graph of diameter 2 with the largest possible number d<sup>2</sup> + 1 of vertices; the diameter is the largest distance, measured by the length of a shortest path." },
    { id: "random-graph", name: "Random graph G(n, p)", kind: "konstruktion", area: "extremal", field: [5, 60], msc: ["05C"], msc5: "05C80", uses: ["graph", "pr:probability-space"],
      formula: String.raw`\Pr(G) = p^{|E(G)|} (1 - p)^{\binom n2 - |E(G)|}`,
      text: "The probability space on the graphs with vertex set {1, …, n} in which every pair is an edge independently with probability p. A property holds with high probability if its probability tends to 1 as n grows; for a monotone property 𝓕 the threshold p<sub>c</sub> is the p at which it holds with probability ½." },
    { id: "extremal-number", name: "Extremal number", kind: "invariante", area: "extremal", field: [5], msc: ["05C"], msc5: "05C35", uses: ["graph", "st:cardinality"],
      formula: String.raw`\operatorname{ex}(n, H) = \max\{|E(G)| : |V(G)| = n,\ H \not\subseteq G\}`,
      text: "The largest number of edges of a graph on n vertices that contains no subgraph isomorphic to H." },
    { id: "regular-pair", name: "ε-regular pair", kind: "eigenschaft", area: "extremal", field: [5], msc: ["05C"], msc5: "05C35", uses: ["graph", "st:real-number"],
      formula: String.raw`|d(X', Y') - d(X, Y)| \le \varepsilon`,
      text: "Two disjoint vertex sets X and Y of a graph form an ε-regular pair if the edge density d(X′, Y′) of every pair of subsets X′ ⊆ X and Y′ ⊆ Y with |X′| ≥ ε|X| and |Y′| ≥ ε|Y| differs by at most ε from d(X, Y)." },

    // ------------------------------------------------------------ 05C25–05C50 Spectra, expanders and Cayley graphs
    { id: "adjacency-matrix", name: "Adjacency matrix", kind: "konstruktion", area: "spectral", field: [5], msc: ["05C"], msc5: "05C50", uses: ["graph", "la:matrix-ring"],
      formula: String.raw`A_{uv} = \begin{cases} 1, & \{u, v\} \in E \\ 0, & \text{otherwise} \end{cases}`,
      text: "The symmetric 0–1 matrix indexed by the vertices of a graph with entry 1 exactly for adjacent pairs; its eigenvalues are the eigenvalues of the graph." },
    { id: "graph-eigenvalue", name: "Eigenvalues of a graph", kind: "invariante", area: "spectral", field: [5], msc: ["05C"], msc5: "05C50", uses: ["adjacency-matrix", "la:matrix-eigenvalue"],
      formula: String.raw`\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_n`,
      text: "The eigenvalues of the adjacency matrix, real because it is symmetric, listed in decreasing order; for a d-regular graph λ<sub>1</sub> = d." },
    { id: "laplacian-matrix", name: "Laplacian matrix", kind: "konstruktion", area: "spectral", field: [5], msc: ["05C"], msc5: "05C50", uses: ["adjacency-matrix", "vertex-degree"],
      formula: String.raw`L = D - A,\quad D = \operatorname{diag}(\deg v)`,
      text: "The matrix of vertex degrees on the diagonal minus the adjacency matrix; L<sup>(i)</sup> denotes L with the row and column of the vertex i removed." },
    { id: "edge-expansion", name: "Edge expansion (Cheeger constant)", kind: "invariante", area: "spectral", field: [5], msc: ["05C"], msc5: "05C48", uses: ["graph", "st:cardinality"],
      formula: String.raw`h(G) = \min_{0 < |S| \le |V|/2} \frac{|E(S, V \setminus S)|}{|S|}`,
      text: "The least ratio of the number of edges leaving a set S of at most half the vertices to the size of S; a family of d-regular graphs with h bounded away from 0 is a family of expanders." },
    { id: "ramanujan-graph", name: "Ramanujan graph", kind: "eigenschaft", area: "spectral", field: [5], msc: ["05C"], msc5: "05C48", uses: ["graph-eigenvalue", "regular-graph"], isA: ["regular-graph"],
      formula: String.raw`|\lambda| \le 2\sqrt{d - 1} \quad (\lambda \ne \pm d)`,
      text: "A connected d-regular graph all of whose eigenvalues other than ±d have absolute value at most 2√(d − 1), the spectral radius of the infinite d-regular tree." },
    { id: "cayley-graph", name: "Cayley graph", kind: "konstruktion", area: "spectral", field: [5, 20], msc: ["05C"], msc5: "05C25", uses: ["gt:group", "graph"],
      formula: String.raw`\operatorname{Cay}(\Gamma, S):\ g \sim gs \quad (s \in S)`,
      text: "For a group Γ with a finite symmetric generating set S, the graph on the elements of Γ in which g and gs are adjacent for every s in S." },
    { id: "ihara-zeta", name: "Ihara zeta function", kind: "konstruktion", area: "spectral", field: [5, 11], msc: ["05C"], msc5: "05C50", uses: ["graph-path", "ca:formal-power-series"],
      formula: String.raw`Z_X(u) = \prod_{[P]} \big(1 - u^{\ell(P)}\big)^{-1}`,
      text: "For a finite graph X, the product over the equivalence classes of primitive closed walks P without backtracking and without tail (prime cycles) of the factors shown, ℓ(P) the length." },

  ],
};
