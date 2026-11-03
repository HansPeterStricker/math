// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "CT_CONCEPTS",
  prefix: "ct",
  colors: {
    basic: "#d9d4ca", "18A": "#e9c46a", "18B": "#c0392b", "18C": "#b08968", "18D": "#7f8c3a", "18E": "#8ab17d",
    "18F": "#2a9d8f", "18G": "#4f86c6", "18M": "#e76f51", "18N": "#9b5de5",
  },
  foreignArea: "basic",
  // concepts of other areas are not points on an inner circle; their arrows come from outside, shown when needed
  // (user, 3 November 2026, as in the theorem graphs)
  foreignOutside: true,
  words: { levelHint: "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside." },
  foreignLabel: "defined outside category theory",
  hubs: ["category"],
  centre: ["category"],
  sources: {
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    ag: { data: "AG_CG", page: "../algebraic-geometry/concepts.html", title: "the concept graph of algebraic geometry" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ant: { data: "ANT_CONCEPTS", page: "../algebraic-number-theory/concepts.html", title: "the concept graph of algebraic number theory" },
    co: { data: "CO_CONCEPTS", page: "../combinatorics/concepts.html", title: "the concept graph of combinatorics" },
    rt: { data: "RT_CONCEPTS", page: "../representation-theory/concepts.html", title: "the concept graph of representation theory" },
    top: { data: "TOP_CONCEPTS", page: "../topology/concepts.html", title: "the concept graph of topology" },
    ana: { data: "ANA_CONCEPTS", page: "../analysis/concepts.html", title: "the concept graph of analysis" },
    geo: { data: "GEO_CONCEPTS", page: "../geometry/concepts.html", title: "the concept graph of geometry" },
  },
};
