// Settings of theorems.html for ../../shared_scripts/concept-graph.js (meaning of the fields there). Written by
// graphs/tests/make-theorem-pages.js; colours and centre may be changed by hand.
window.CONCEPT_PAGE = {
  "data": "ENT_THEOREMS",
  "prefix": "ent",
  "colors": {
    "basic": "#d9d4ca",
    "11A05": "#e9c46a",
    "11A07": "#8ab17d",
    "11A15": "#2a9d8f",
    "11A25": "#e76f51",
    "11A41": "#c0392b",
    "11A51": "#9b5de5",
    "11A55": "#4f86c6",
    "11A63": "#b08968",
    "11A67": "#7f8c3a",
    "11B39": "#d4a017"
  },
  "foreignArea": "basic",
  "foreignLabel": "proved outside elementary number theory",
  "hubs": [],
  "foreignOutside": true,
  "centre": [
    "division-with-remainder"
  ],
  "sources": {
    "st": {
      "data": "ST_THEOREMS",
      "page": "../set-theory/theorems.html",
      "title": "the theorem graph of set theory"
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
    "co": {
      "data": "CO_THEOREMS",
      "page": "../combinatorics/theorems.html",
      "title": "the theorem graph of combinatorics"
    },
    "rt": {
      "data": "RT_THEOREMS",
      "page": "../representation-theory/theorems.html",
      "title": "the theorem graph of representation theory"
    }
  },
  "conceptSources": {
    "": {
      "data": "ENT_CONCEPTS",
      "page": "concepts.html"
    },
    "st": {
      "data": "ST_CONCEPTS",
      "page": "../set-theory/concepts.html"
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
    "co": {
      "data": "CO_CONCEPTS",
      "page": "../combinatorics/concepts.html"
    },
    "rt": {
      "data": "RT_CONCEPTS",
      "page": "../representation-theory/concepts.html"
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
