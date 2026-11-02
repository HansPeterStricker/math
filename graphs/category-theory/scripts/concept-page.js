// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "CT_CONCEPTS",
  colors: {
    basic: "#d9d4ca", "18A": "#e9c46a", "18B": "#c0392b", "18C": "#b08968", "18D": "#7f8c3a", "18E": "#8ab17d",
    "18F": "#2a9d8f", "18G": "#4f86c6", "18M": "#e76f51", "18N": "#9b5de5",
  },
  foreignArea: "basic",
  foreignLabel: "defined outside category theory",
  hubs: ["category"],
  centre: ["category"],
  sources: {
    ca: { data: "CA_CONCEPTS", page: "../commutative-algebra/concepts.html", title: "the concept graph of commutative algebra" },
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    gt: { data: "GT_CONCEPTS", page: "../group-theory/concepts.html", title: "the concept graph of group theory" },
  },
};
