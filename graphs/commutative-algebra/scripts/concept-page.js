// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "CA_CONCEPTS",
  prefix: "ca",
  colors: {
    basic: "#d9d4ca", "13A": "#e9c46a", "13B": "#8ab17d", "13C": "#4f86c6", "13D": "#9b5de5", "13E": "#2a9d8f",
    "13F": "#e76f51", "13H": "#c0392b", "13J": "#b08968", "13N": "#7f8c3a", "12E": "#d4a017", "12F": "#f4a261",
  },
  foreignArea: "basic",
  // concepts of other areas are not points on an inner circle; their arrows come from outside, shown when needed
  // (user, 3 November 2026, as in the theorem graphs)
  foreignOutside: true,
  words: { levelHint: "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside." },
  foreignLabel: "defined outside commutative algebra",
  hubs: ["commutative-ring"],
  centre: ["commutative-ring"],
  sources: {
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    ag: { data: "AG_CG", page: "../algebraic-geometry/concepts.html", title: "the concept graph of algebraic geometry" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ant: { data: "ANT_CONCEPTS", page: "../algebraic-number-theory/concepts.html", title: "the concept graph of algebraic number theory" },
    co: { data: "CO_CONCEPTS", page: "../combinatorics/concepts.html", title: "the concept graph of combinatorics" },
    rt: { data: "RT_CONCEPTS", page: "../representation-theory/concepts.html", title: "the concept graph of representation theory" },
    top: { data: "TOP_CONCEPTS", page: "../topology/concepts.html", title: "the concept graph of topology" },
    ana: { data: "ANA_CONCEPTS", page: "../analysis/concepts.html", title: "the concept graph of analysis" },
    geo: { data: "GEO_CONCEPTS", page: "../geometry/concepts.html", title: "the concept graph of geometry" },
  },
};
