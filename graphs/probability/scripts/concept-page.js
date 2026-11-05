// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there). Written by
// graphs/tests/make-concept-pages.js: data, prefix, colors, centre, hubs and sources come from
// shared_scripts/areas.js; the other settings may be changed here and are kept.
window.CONCEPT_PAGE = {
  "data": "PR_CONCEPTS",
  "prefix": "pr",
  "colors": {
    "basic": "#d9d4ca",
    "60A": "#4f86c6",
    "60B": "#9b5de5",
    "60C": "#c9a227",
    "60D": "#8ab17d",
    "60E": "#e76f51",
    "60F": "#c0392b",
    "60G": "#2a9d8f",
    "60H": "#6d597a",
    "60J": "#b08968",
    "60K": "#7f8c3a"
  },
  "centre": [
    "probability-measure"
  ],
  "hubs": [],
  "foreignArea": "basic",
  "foreignOutside": true,
  "words": {
    "levelHint": "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside."
  },
  "foreignLabel": "defined outside probability",
  "sources": {
    "lo": {
      "data": "LO_CONCEPTS",
      "page": "../logic/concepts.html",
      "title": "the concept graph of mathematical logic"
    },
    "mt": {
      "data": "MT_CONCEPTS",
      "page": "../model-theory/concepts.html",
      "title": "the concept graph of model theory"
    },
    "cc": {
      "data": "CC_CONCEPTS",
      "page": "../computability/concepts.html",
      "title": "the concept graph of computability and complexity"
    },
    "st": {
      "data": "ST_CONCEPTS",
      "page": "../set-theory/concepts.html",
      "title": "the concept graph of set theory"
    },
    "ga": {
      "data": "GA_CONCEPTS",
      "page": "../general-algebra/concepts.html",
      "title": "the concept graph of general algebra"
    },
    "ct": {
      "data": "CT_CONCEPTS",
      "page": "../category-theory/concepts.html",
      "title": "the concept graph of category theory"
    },
    "ent": {
      "data": "ENT_CONCEPTS",
      "page": "../elementary-number-theory/concepts.html",
      "title": "the concept graph of elementary number theory"
    },
    "dio": {
      "data": "DIO_CONCEPTS",
      "page": "../diophantine-number-theory/concepts.html",
      "title": "the concept graph of diophantine number theory"
    },
    "ant": {
      "data": "ANT_CONCEPTS",
      "page": "../algebraic-number-theory/concepts.html",
      "title": "the concept graph of algebraic number theory"
    },
    "ar": {
      "data": "AR_CG",
      "page": "../arithmetic-geometry/concepts.html",
      "title": "the concept graph of arithmetic geometry"
    },
    "fnt": {
      "data": "FNT_CONCEPTS",
      "page": "../further-number-theory/concepts.html",
      "title": "the concept graph of number theory: other topics"
    },
    "ft": {
      "data": "FT_CONCEPTS",
      "page": "../field-theory/concepts.html",
      "title": "the concept graph of field theory"
    },
    "gal": {
      "data": "GAL_CONCEPTS",
      "page": "../galois-theory/concepts.html",
      "title": "the concept graph of Galois theory"
    },
    "ca": {
      "data": "CA_CONCEPTS",
      "page": "../commutative-algebra/concepts.html",
      "title": "the concept graph of commutative algebra"
    },
    "la": {
      "data": "LA_CONCEPTS",
      "page": "../linear-algebra/concepts.html",
      "title": "the concept graph of linear algebra"
    },
    "aa": {
      "data": "AA_CONCEPTS",
      "page": "../associative-algebras/concepts.html",
      "title": "the concept graph of associative rings and algebras"
    },
    "lie": {
      "data": "LIE_CONCEPTS",
      "page": "../lie-theory/concepts.html",
      "title": "the concept graph of Lie theory: Lie groups, Lie algebras and nonassociative algebras"
    },
    "ha": {
      "data": "HA_CONCEPTS",
      "page": "../homological-algebra/concepts.html",
      "title": "the concept graph of homological algebra"
    },
    "kt": {
      "data": "KT_CONCEPTS",
      "page": "../k-theory/concepts.html",
      "title": "the concept graph of K-theory"
    },
    "gt": {
      "data": "GT_CONCEPTS",
      "page": "../group-theory/concepts.html",
      "title": "the concept graph of group theory"
    },
    "rt": {
      "data": "RT_CONCEPTS",
      "page": "../representation-theory/concepts.html",
      "title": "the concept graph of representation theory"
    },
    "ag": {
      "data": "AG_CG",
      "page": "../algebraic-geometry/concepts.html",
      "title": "the concept graph of algebraic geometry"
    },
    "geo": {
      "data": "GEO_CONCEPTS",
      "page": "../geometry/concepts.html",
      "title": "the concept graph of geometry"
    },
    "top": {
      "data": "TOP_CONCEPTS",
      "page": "../topology/concepts.html",
      "title": "the concept graph of topology"
    },
    "gan": {
      "data": "GAN_CONCEPTS",
      "page": "../global-analysis/concepts.html",
      "title": "the concept graph of global analysis"
    },
    "ana": {
      "data": "ANA_CONCEPTS",
      "page": "../analysis/concepts.html",
      "title": "the concept graph of real and complex analysis"
    },
    "fa": {
      "data": "FA_CONCEPTS",
      "page": "../functional-analysis/concepts.html",
      "title": "the concept graph of functional analysis"
    },
    "scv": {
      "data": "SCV_CONCEPTS",
      "page": "../several-complex-variables/concepts.html",
      "title": "the concept graph of several complex variables"
    },
    "de": {
      "data": "DE_CONCEPTS",
      "page": "../differential-equations/concepts.html",
      "title": "the concept graph of differential equations"
    },
    "ds": {
      "data": "DS_CONCEPTS",
      "page": "../dynamical-systems/concepts.html",
      "title": "the concept graph of dynamical systems"
    },
    "apt": {
      "data": "APT_CONCEPTS",
      "page": "../approximation-and-transforms/concepts.html",
      "title": "the concept graph of approximation and transforms"
    },
    "cv": {
      "data": "CV_CONCEPTS",
      "page": "../calculus-of-variations/concepts.html",
      "title": "the concept graph of calculus of variations"
    },
    "co": {
      "data": "CO_CONCEPTS",
      "page": "../combinatorics/concepts.html",
      "title": "the concept graph of combinatorics"
    },
    "gr": {
      "data": "GR_CONCEPTS",
      "page": "../graph-theory/concepts.html",
      "title": "the concept graph of graph theory"
    },
    "num": {
      "data": "NUM_CONCEPTS",
      "page": "../numerical-analysis/concepts.html",
      "title": "the concept graph of numerical analysis"
    },
    "cs": {
      "data": "CS_CONCEPTS",
      "page": "../computer-science/concepts.html",
      "title": "the concept graph of theoretical computer science"
    },
    "opt": {
      "data": "OPT_CONCEPTS",
      "page": "../optimization/concepts.html",
      "title": "the concept graph of optimization and control"
    },
    "gm": {
      "data": "GM_CONCEPTS",
      "page": "../game-theory/concepts.html",
      "title": "the concept graph of game theory"
    },
    "it": {
      "data": "IT_CONCEPTS",
      "page": "../information-theory/concepts.html",
      "title": "the concept graph of information theory and coding"
    },
    "sta": {
      "data": "STA_CONCEPTS",
      "page": "../statistics/concepts.html",
      "title": "the concept graph of statistics"
    },
    "mp": {
      "data": "MP_CONCEPTS",
      "page": "../mathematical-physics/concepts.html",
      "title": "the concept graph of mathematical physics"
    },
    "bio": {
      "data": "BIO_CONCEPTS",
      "page": "../mathematical-biology/concepts.html",
      "title": "the concept graph of mathematical biology"
    }
  }
};
// both settings of the folder, for definitions and theorems in one picture (B94)
window.CONCEPT_PAGES = Object.assign(window.CONCEPT_PAGES || {}, { concepts: window.CONCEPT_PAGE });
