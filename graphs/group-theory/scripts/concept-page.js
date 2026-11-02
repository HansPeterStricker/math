// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there).
window.CONCEPT_PAGE = {
  data: "GT_CONCEPTS",
  colors: {
    basic: "#d9d4ca", "20A": "#e9c46a", "20B": "#8ab17d", "20D": "#c0392b", "20E": "#4f86c6", "20F": "#9b5de5", "20K": "#e76f51",
  },
  foreignArea: "basic",
  foreignLabel: "defined outside group theory",
  hubs: ["group"],
  centre: ["group"],
  sources: {
    st: { data: "ST_CONCEPTS", page: "../set-theory/concepts.html", title: "the concept graph of set theory" },
    ent: { data: "ENT_CONCEPTS", page: "../elementary-number-theory/concepts.html", title: "the concept graph of elementary number theory" },
  },
};
