// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "CA_CONCEPTS",
  colors: {
    basic: "#d9d4ca", "13A": "#e9c46a", "13B": "#8ab17d", "13C": "#4f86c6", "13D": "#9b5de5", "13E": "#2a9d8f",
    "13F": "#e76f51", "13H": "#c0392b", "13J": "#b08968", "13N": "#7f8c3a", "12E": "#d4a017",
  },
  foreignArea: "basic",
  foreignLabel: "defined outside commutative algebra",
  hubs: ["commutative-ring"],
  centre: ["commutative-ring"],
  sources: {
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
    ct: { data: "CT_CONCEPTS", page: "../category-theory/concepts.html", title: "the concept graph of category theory" },
  },
};
