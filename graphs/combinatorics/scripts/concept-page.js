// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "CO_CONCEPTS",
  prefix: "co",
  colors: {
    basic: "#d9d4ca", "05A": "#e9c46a", "05B": "#8ab17d", "05C": "#4f86c6", "05D": "#e76f51", "05E": "#9b5de5",
    "11B": "#2a9d8f", "11P": "#d4a017", "52B": "#b08968", "52C": "#c77dba",
  },
  foreignArea: "basic",
  // concepts of other areas are not points on an inner circle; their arrows come from outside, shown when needed
  // (user, 3 November 2026, as in the theorem graphs)
  foreignOutside: true,
  words: { levelHint: "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside." },
  foreignLabel: "defined outside combinatorics",
  hubs: ["graph"],
  centre: ["graph"],
  sources: {
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    ag: { data: "AG_CG", page: "../algebraic-geometry/concepts.html", title: "the concept graph of algebraic geometry" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    ant: { data: "ANT_CONCEPTS", page: "../algebraic-number-theory/concepts.html", title: "the concept graph of algebraic number theory" },
    rt: { data: "RT_CONCEPTS", page: "../representation-theory/concepts.html", title: "the concept graph of representation theory" },
  },
};
