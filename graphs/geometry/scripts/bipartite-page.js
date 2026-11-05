// Settings of bipartite.html for ../../shared_scripts/bipartite-graph.js (meaning of the fields there). Written by
// graphs/tests/make-bipartite-pages.js; changes belong there.
window.BIPARTITE_PAGE = {
  "folder": "geometry",
  "prefix": "geo",
  "name": "geometry",
  "concepts": "GEO_CONCEPTS",
  "theorems": "GEO_THEOREMS",
  "colors": {
    "basic": "#d9d4ca",
    "51A": "#9b5de5",
    "51E": "#c77dba",
    "51F": "#e76f51",
    "51M": "#4f86c6",
    "51N": "#e9c46a",
    "52A": "#8ab17d",
    "53A": "#2a9d8f",
    "53B": "#d4a017",
    "53C": "#c0392b",
    "53D": "#6d597a",
    "53E": "#b08968"
  },
  "shapes": {
    "axiom": "konstruktion",
    "theorem": "objekt",
    "lemma": "eigenschaft",
    "corollary": "morphismus",
    "conjecture": "invariante"
  },
  "foreignArea": "basic",
  "foreignLabel": "defined outside geometry",
  "sources": {
    "lo": {
      "data": "LO_CONCEPTS",
      "page": "../logic/concepts.html",
      "name": "mathematical logic"
    },
    "mt": {
      "data": "MT_CONCEPTS",
      "page": "../model-theory/concepts.html",
      "name": "model theory"
    },
    "cc": {
      "data": "CC_CONCEPTS",
      "page": "../computability/concepts.html",
      "name": "computability and complexity"
    },
    "st": {
      "data": "ST_CONCEPTS",
      "page": "../set-theory/concepts.html",
      "name": "set theory"
    },
    "ga": {
      "data": "GA_CONCEPTS",
      "page": "../general-algebra/concepts.html",
      "name": "general algebra"
    },
    "ct": {
      "data": "CT_CONCEPTS",
      "page": "../category-theory/concepts.html",
      "name": "category theory"
    },
    "ent": {
      "data": "ENT_CONCEPTS",
      "page": "../elementary-number-theory/concepts.html",
      "name": "elementary number theory"
    },
    "dio": {
      "data": "DIO_CONCEPTS",
      "page": "../diophantine-number-theory/concepts.html",
      "name": "diophantine number theory"
    },
    "ant": {
      "data": "ANT_CONCEPTS",
      "page": "../algebraic-number-theory/concepts.html",
      "name": "algebraic number theory"
    },
    "ar": {
      "data": "AR_CG",
      "page": "../arithmetic-geometry/concepts.html",
      "name": "arithmetic geometry"
    },
    "fnt": {
      "data": "FNT_CONCEPTS",
      "page": "../further-number-theory/concepts.html",
      "name": "number theory: other topics"
    },
    "ft": {
      "data": "FT_CONCEPTS",
      "page": "../field-theory/concepts.html",
      "name": "field theory"
    },
    "gal": {
      "data": "GAL_CONCEPTS",
      "page": "../galois-theory/concepts.html",
      "name": "Galois theory"
    },
    "ca": {
      "data": "CA_CONCEPTS",
      "page": "../commutative-algebra/concepts.html",
      "name": "commutative algebra"
    },
    "la": {
      "data": "LA_CONCEPTS",
      "page": "../linear-algebra/concepts.html",
      "name": "linear algebra"
    },
    "aa": {
      "data": "AA_CONCEPTS",
      "page": "../associative-algebras/concepts.html",
      "name": "associative rings and algebras"
    },
    "lie": {
      "data": "LIE_CONCEPTS",
      "page": "../lie-theory/concepts.html",
      "name": "Lie theory: Lie groups, Lie algebras and nonassociative algebras"
    },
    "ha": {
      "data": "HA_CONCEPTS",
      "page": "../homological-algebra/concepts.html",
      "name": "homological algebra"
    },
    "kt": {
      "data": "KT_CONCEPTS",
      "page": "../k-theory/concepts.html",
      "name": "K-theory"
    },
    "gt": {
      "data": "GT_CONCEPTS",
      "page": "../group-theory/concepts.html",
      "name": "group theory"
    },
    "rt": {
      "data": "RT_CONCEPTS",
      "page": "../representation-theory/concepts.html",
      "name": "representation theory"
    },
    "ag": {
      "data": "AG_CG",
      "page": "../algebraic-geometry/concepts.html",
      "name": "algebraic geometry"
    },
    "top": {
      "data": "TOP_CONCEPTS",
      "page": "../topology/concepts.html",
      "name": "topology"
    },
    "gan": {
      "data": "GAN_CONCEPTS",
      "page": "../global-analysis/concepts.html",
      "name": "global analysis"
    },
    "ana": {
      "data": "ANA_CONCEPTS",
      "page": "../analysis/concepts.html",
      "name": "real and complex analysis"
    },
    "fa": {
      "data": "FA_CONCEPTS",
      "page": "../functional-analysis/concepts.html",
      "name": "functional analysis"
    },
    "scv": {
      "data": "SCV_CONCEPTS",
      "page": "../several-complex-variables/concepts.html",
      "name": "several complex variables"
    },
    "de": {
      "data": "DE_CONCEPTS",
      "page": "../differential-equations/concepts.html",
      "name": "differential equations"
    },
    "ds": {
      "data": "DS_CONCEPTS",
      "page": "../dynamical-systems/concepts.html",
      "name": "dynamical systems"
    },
    "apt": {
      "data": "APT_CONCEPTS",
      "page": "../approximation-and-transforms/concepts.html",
      "name": "approximation and transforms"
    },
    "cv": {
      "data": "CV_CONCEPTS",
      "page": "../calculus-of-variations/concepts.html",
      "name": "calculus of variations"
    },
    "co": {
      "data": "CO_CONCEPTS",
      "page": "../combinatorics/concepts.html",
      "name": "combinatorics"
    },
    "gr": {
      "data": "GR_CONCEPTS",
      "page": "../graph-theory/concepts.html",
      "name": "graph theory"
    },
    "num": {
      "data": "NUM_CONCEPTS",
      "page": "../numerical-analysis/concepts.html",
      "name": "numerical analysis"
    },
    "cs": {
      "data": "CS_CONCEPTS",
      "page": "../computer-science/concepts.html",
      "name": "theoretical computer science"
    },
    "opt": {
      "data": "OPT_CONCEPTS",
      "page": "../optimization/concepts.html",
      "name": "optimization and control"
    },
    "gm": {
      "data": "GM_CONCEPTS",
      "page": "../game-theory/concepts.html",
      "name": "game theory"
    },
    "it": {
      "data": "IT_CONCEPTS",
      "page": "../information-theory/concepts.html",
      "name": "information theory and coding"
    },
    "pr": {
      "data": "PR_CONCEPTS",
      "page": "../probability/concepts.html",
      "name": "probability"
    },
    "sta": {
      "data": "STA_CONCEPTS",
      "page": "../statistics/concepts.html",
      "name": "statistics"
    },
    "mp": {
      "data": "MP_CONCEPTS",
      "page": "../mathematical-physics/concepts.html",
      "name": "mathematical physics"
    },
    "bio": {
      "data": "BIO_CONCEPTS",
      "page": "../mathematical-biology/concepts.html",
      "name": "mathematical biology"
    }
  }
};
