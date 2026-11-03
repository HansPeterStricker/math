// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "TOP_CONCEPTS",
  prefix: "top",
  colors: {
    basic: "#d9d4ca", "54A": "#e9c46a", "54B": "#d4a017", "54C": "#b08968", "54D": "#e76f51", "54E": "#c0392b",
    "55M": "#a3b18a", "55N": "#4f86c6", "55P": "#6c8ebf", "55Q": "#5fa8a0", "55R": "#2a9d8f",
    "57K": "#9b5de5", "57M": "#c77dba", "57N": "#8ab17d", "57Q": "#7f8c3a", "57R": "#6d597a", "58A": "#3d5a80",
  },
  foreignArea: "basic",
  // concepts of other areas are not points on an inner circle; their arrows come from outside, shown when needed
  // (user, 3 November 2026, as in the theorem graphs)
  foreignOutside: true,
  words: { levelHint: "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside." },
  foreignLabel: "defined outside topology",
  hubs: ["topological-space"],
  centre: ["topological-space"],
  sources: {
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    ag: { data: "AG_CG", page: "../algebraic-geometry/concepts.html", title: "the concept graph of algebraic geometry" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    ant: { data: "ANT_CONCEPTS", page: "../algebraic-number-theory/concepts.html", title: "the concept graph of algebraic number theory" },
    co: { data: "CO_CONCEPTS", page: "../combinatorics/concepts.html", title: "the concept graph of combinatorics" },
    rt: { data: "RT_CONCEPTS", page: "../representation-theory/concepts.html", title: "the concept graph of representation theory" },
    ana: { data: "ANA_CONCEPTS", page: "../analysis/concepts.html", title: "the concept graph of analysis" },
    geo: { data: "GEO_CONCEPTS", page: "../geometry/concepts.html", title: "the concept graph of geometry" },
  },
};
