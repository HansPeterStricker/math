// Settings of theorems.html for ../../shared_scripts/concept-graph.js (meaning of the fields there). Written by
// graphs/tests/make-theorem-pages.js; colours and centre may be changed by hand.
window.CONCEPT_PAGE = {
  "data": "CA_THEOREMS",
  "prefix": "ca",
  "colors": {
    "basic": "#d9d4ca",
    "13A": "#e9c46a",
    "13B": "#8ab17d",
    "13C": "#4f86c6",
    "13D": "#9b5de5",
    "13E": "#2a9d8f",
    "13F": "#e76f51",
    "13H": "#c0392b",
    "13J": "#b08968"
  },
  "foreignArea": "basic",
  "foreignLabel": "proved outside commutative algebra",
  "hubs": [],
  "foreignOutside": true,
  "centre": [
    "determinant-trick"
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
    "ag": {
      "data": "AG_THEOREMS",
      "page": "../algebraic-geometry/theorems.html",
      "title": "the theorem graph of algebraic geometry"
    },
    "ar": {
      "data": "AR_THEOREMS",
      "page": "../arithmetic-geometry/theorems.html",
      "title": "the theorem graph of arithmetic geometry"
    }
  },
  "conceptSources": {
    "": {
      "data": "CA_CONCEPTS",
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
    "ag": {
      "data": "AG_CG",
      "page": "../algebraic-geometry/concepts.html"
    },
    "ar": {
      "data": "AR_CG",
      "page": "../arithmetic-geometry/concepts.html"
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
    "buildsOn": "Theorems this proof builds on",
    "homeVerb": "Proved",
    "levelHint": "Level 1: proved without other theorems of the area; level k: 1 + highest level among the theorems the proof uses. Results of other areas are not counted; their arrows come from outside."
  }
};
