// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "ANT_CONCEPTS",
  prefix: "ant",
  colors: {
    basic: "#d9d4ca", "11R04": "#4f86c6", "11R11": "#e9c46a", "11R18": "#e76f51", "11R23": "#c77dba", "11R27": "#8ab17d",
    "11R29": "#c0392b", "11R32": "#9b5de5", "11R34": "#6c8ebf", "11R37": "#2a9d8f", "11R39": "#a3b18a", "11R42": "#d4a017",
    "11R45": "#b08968", "11R52": "#7f8c3a", "11R56": "#5fa8a0", "11S": "#6d597a",
  },
  foreignArea: "basic",
  // concepts of other areas are not points on an inner circle; their arrows come from outside, shown when needed
  // (user, 3 November 2026, as in the theorem graphs)
  foreignOutside: true,
  words: { levelHint: "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside." },
  foreignLabel: "defined outside algebraic number theory",
  hubs: [],
  centre: ["number-field"],
  sources: {
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    ag: { data: "AG_CG", page: "../algebraic-geometry/concepts.html", title: "the concept graph of algebraic geometry" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    co: { data: "CO_CONCEPTS", page: "../combinatorics/concepts.html", title: "the concept graph of combinatorics" },
    rt: { data: "RT_CONCEPTS", page: "../representation-theory/concepts.html", title: "the concept graph of representation theory" },
  },
};
