// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "GT_CONCEPTS",
  prefix: "gt",
  colors: {
    basic: "#d9d4ca", "20A": "#e9c46a", "20B": "#8ab17d", "20D": "#c0392b", "20E": "#4f86c6", "20F": "#9b5de5", "20K": "#e76f51", "20G": "#2a9d8f",
  },
  foreignArea: "basic",
  // concepts of other areas are not points on an inner circle; their arrows come from outside, shown when needed
  // (user, 3 November 2026, as in the theorem graphs)
  foreignOutside: true,
  words: { levelHint: "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside." },
  foreignLabel: "defined outside group theory",
  hubs: ["group"],
  centre: ["group"],
  sources: {
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ag: { data: "AG_CG", page: "../algebraic-geometry/concepts.html", title: "the concept graph of algebraic geometry" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    ant: { data: "ANT_CONCEPTS", page: "../algebraic-number-theory/concepts.html", title: "the concept graph of algebraic number theory" },
  },
};
