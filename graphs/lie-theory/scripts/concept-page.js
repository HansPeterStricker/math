// Settings of concepts.html for ../../shared_scripts/concept-graph.js (meaning of the fields there). Written by
// graphs/tests/make-concept-pages.js: data, prefix, colors, centre, hubs and sources come from
// shared_scripts/areas.js; the other settings may be changed here and are kept.
window.CONCEPT_PAGE = {
  "data": "LIE_CONCEPTS",
  "prefix": "lie",
  "colors": {
    "basic": "#d9d4ca",
    "17A": "#b08968",
    "structure": "#4f86c6",
    "roots": "#2a9d8f",
    "representations": "#9b5de5",
    "infinite": "#e76f51",
    "17C": "#d4a017",
    "17D": "#8ab17d"
  },
  "centre": [
    "lie-algebra"
  ],
  "hubs": [
    "lie-algebra"
  ],
  "foreignArea": "basic",
  "foreignOutside": true,
  "words": {
    "levelHint": "Level 1: defined without other concepts of the area; level k: 1 + highest level used in the definition. Concepts of other areas are not counted; their arrows come from outside."
  },
  "foreignLabel": "defined outside lie theory and nonassociative algebras",
  "sources": {
    "lo": {
      "data": "LO_CONCEPTS",
      "page": "../logic/concepts.html",
      "title": "the concept graph of mathematical logic"
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
      "title": "the concept graph of further number theory"
    },
    "ft": {
      "data": "FT_CONCEPTS",
      "page": "../field-theory/concepts.html",
      "title": "the concept graph of field theory"
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
      "title": "the concept graph of analysis"
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
      "title": "the concept graph of optimization, games and control"
    },
    "it": {
      "data": "IT_CONCEPTS",
      "page": "../information-theory/concepts.html",
      "title": "the concept graph of information theory and coding"
    },
    "pr": {
      "data": "PR_CONCEPTS",
      "page": "../probability/concepts.html",
      "title": "the concept graph of probability"
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
