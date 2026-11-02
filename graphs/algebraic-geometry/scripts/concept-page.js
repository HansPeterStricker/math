// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "AG_CG",
  colors: {
    basic: "#d9d4ca", "14A": "#e9c46a", "14B": "#d4a017", "14C": "#e76f51", "14D": "#9b5de5", "14E": "#c0392b",
    "14F": "#4f86c6", "14G": "#7f8c3a", "14H": "#8ab17d", "14J": "#2a9d8f", "14K": "#b08968", "14L": "#6d597a",
    "14M": "#f4a261", "14N": "#5c7cfa",
  },
  foreignArea: "basic",
  foreignLabel: "defined outside algebraic geometry",
  hubs: ["scheme", "morphism"],
  centre: ["locally-ringed-space"],
  sources: {
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
  },
};
