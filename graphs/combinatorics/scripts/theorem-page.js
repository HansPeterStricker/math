// Settings of theorems.html for ../../shared_scripts/concept-graph.js (meaning of the fields there). Written by
// graphs/tests/make-theorem-pages.js; colours and centre may be changed by hand.
window.CONCEPT_PAGE = {
  "data": "CO_THEOREMS",
  "prefix": "co",
  "colors": {
    "basic": "#d9d4ca",
    "05A": "#e9c46a",
    "05B": "#8ab17d",
    "05C": "#4f86c6",
    "05D": "#e76f51",
    "05E": "#9b5de5",
    "11B": "#2a9d8f",
    "11P": "#d4a017",
    "52B": "#b08968",
    "52C": "#c77dba"
  },
  "foreignArea": "basic",
  "foreignLabel": "proved outside combinatorics",
  "hubs": [],
  "foreignOutside": true,
  "centre": [
    "tree-characterization"
  ],
  "sources": {
    "st": {
      "data": "ST_THEOREMS",
      "page": "../set-theory/theorems.html",
      "title": "the theorem graph of set theory"
    },
    "ent": {
      "data": "ENT_THEOREMS",
      "page": "../elementary-number-theory/theorems.html",
      "title": "the theorem graph of elementary number theory"
    },
    "gt": {
      "data": "GT_THEOREMS",
      "page": "../group-theory/theorems.html",
      "title": "the theorem graph of group theory"
    },
    "ct": {
      "data": "CT_THEOREMS",
      "page": "../category-theory/theorems.html",
      "title": "the theorem graph of category theory"
    },
    "ca": {
      "data": "CA_THEOREMS",
      "page": "../commutative-algebra/theorems.html",
      "title": "the theorem graph of commutative algebra"
    },
    "ag": {
      "data": "AG_THEOREMS",
      "page": "../algebraic-geometry/theorems.html",
      "title": "the theorem graph of algebraic geometry"
    },
    "ar": {
      "data": "AR_THEOREMS",
      "page": "../arithmetic-geometry/theorems.html",
      "title": "the theorem graph of arithmetic geometry"
    },
    "ant": {
      "data": "ANT_THEOREMS",
      "page": "../algebraic-number-theory/theorems.html",
      "title": "the theorem graph of algebraic number theory"
    },
    "rt": {
      "data": "RT_THEOREMS",
      "page": "../representation-theory/theorems.html",
      "title": "the theorem graph of representation theory"
    },
    "top": {
      "data": "TOP_THEOREMS",
      "page": "../topology/theorems.html",
      "title": "the theorem graph of topology"
    },
    "ana": {
      "data": "ANA_THEOREMS",
      "page": "../analysis/theorems.html",
      "title": "the theorem graph of analysis"
    },
    "geo": {
      "data": "GEO_THEOREMS",
      "page": "../geometry/theorems.html",
      "title": "the theorem graph of geometry"
    }
  },
  "conceptSources": {
    "": {
      "data": "CO_CONCEPTS",
      "page": "concepts.html"
    },
    "st": {
      "data": "ST_CONCEPTS",
      "page": "../set-theory/concepts.html"
    },
    "ent": {
      "data": "ENT_CONCEPTS",
      "page": "../elementary-number-theory/concepts.html"
    },
    "gt": {
      "data": "GT_CONCEPTS",
      "page": "../group-theory/concepts.html"
    },
    "ct": {
      "data": "CT_CONCEPTS",
      "page": "../category-theory/concepts.html"
    },
    "ca": {
      "data": "CA_CONCEPTS",
      "page": "../commutative-algebra/concepts.html"
    },
    "ag": {
      "data": "AG_CG",
      "page": "../algebraic-geometry/concepts.html"
    },
    "ar": {
      "data": "AR_CG",
      "page": "../arithmetic-geometry/concepts.html"
    },
    "ant": {
      "data": "ANT_CONCEPTS",
      "page": "../algebraic-number-theory/concepts.html"
    },
    "rt": {
      "data": "RT_CONCEPTS",
      "page": "../representation-theory/concepts.html"
    },
    "top": {
      "data": "TOP_CONCEPTS",
      "page": "../topology/concepts.html"
    },
    "ana": {
      "data": "ANA_CONCEPTS",
      "page": "../analysis/concepts.html"
    },
    "geo": {
      "data": "GEO_CONCEPTS",
      "page": "../geometry/concepts.html"
    }
  },
  "shapes": {
    "axiom": "konstruktion",
    "theorem": "objekt",
    "lemma": "eigenschaft",
    "corollary": "morphismus",
    "conjecture": "invariante"
  },
  "words": {
    "one": "theorem",
    "many": "theorems",
    "usingIt": "theorems using it",
    "usesHead": "The proof uses",
    "usedByHead": "Used in the proofs of",
    "edges": "proof dependencies",
    "arrow": "A → B: the proof of B uses A",
    "proofsHead": "Proofs",
    "proofWord": "Proof",
    "buildsOn": "Theorems this proof builds on",
    "homeVerb": "Proved",
    "levelHint": "Level 1: proved without other theorems of the area; level k: 1 + highest level among the theorems the proof uses. Results of other areas are not counted; their arrows come from outside."
  }
};
