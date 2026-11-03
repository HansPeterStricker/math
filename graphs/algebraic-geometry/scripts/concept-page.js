// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "AG_CG",
  prefix: "ag",
  colors: {
    basic: "#d9d4ca", "14A": "#e9c46a", "14B": "#d4a017", "14C": "#e76f51", "14D": "#9b5de5", "14E": "#c0392b",
    "14F": "#4f86c6", "14G": "#7f8c3a", "14H": "#8ab17d", "14J": "#2a9d8f", "14K": "#b08968", "14L": "#6d597a",
    "14M": "#f4a261", "14N": "#5c7cfa",
  },
  foreignArea: "basic",
  // concepts of other areas are not points on an inner circle; their arrows come from outside, shown when needed
  // (user, 3 November 2026, as in the theorem graphs)
  foreignOutside: true,
  words: { levelHint: "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside." },
  foreignLabel: "defined outside algebraic geometry",
  hubs: ["scheme", "morphism"],
  centre: ["locally-ringed-space"],
  sources: {
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    ant: { data: "ANT_CONCEPTS", page: "../algebraic-number-theory/concepts.html", title: "the concept graph of algebraic number theory" },
    co: { data: "CO_CONCEPTS", page: "../combinatorics/concepts.html", title: "the concept graph of combinatorics" },
    rt: { data: "RT_CONCEPTS", page: "../representation-theory/concepts.html", title: "the concept graph of representation theory" },
    top: { data: "TOP_CONCEPTS", page: "../topology/concepts.html", title: "the concept graph of topology" },
    ana: { data: "ANA_CONCEPTS", page: "../analysis/concepts.html", title: "the concept graph of analysis" },
    geo: { data: "GEO_CONCEPTS", page: "../geometry/concepts.html", title: "the concept graph of geometry" },
  },
};
