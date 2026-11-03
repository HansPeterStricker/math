// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "ST_CONCEPTS",
  prefix: "st",
  colors: {
    basic: "#d9d4ca", "03E20": "#e9c46a", "06A": "#8ab17d", "06B": "#2a9d8f", "03E10": "#4f86c6", "03E25": "#e76f51",
    "03E30": "#b08968", numbers: "#c0392b", "03E40": "#9b5de5", "03E35": "#7f8c3a", "06E": "#5c7cfa",
  },
  foreignArea: "basic",
  foreignLabel: "defined outside set theory",
  hubs: ["set"],
  centre: ["set"],
  sources: {
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    ag: { data: "AG_CG", page: "../algebraic-geometry/concepts.html", title: "the concept graph of algebraic geometry" },
    ar: { data: "AR_CG", page: "../arithmetic-geometry/concepts.html", title: "the concept graph of arithmetic geometry" },
    ant: { data: "ANT_CONCEPTS", page: "../algebraic-number-theory/concepts.html", title: "the concept graph of algebraic number theory" },
  },
};
