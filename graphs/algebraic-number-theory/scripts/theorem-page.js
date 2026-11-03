// Settings of theorems.html for ../../shared_scripts/concept-graph.js (meaning of the fields there). Written by
// graphs/tests/make-theorem-pages.js; colours and centre may be changed by hand.
window.CONCEPT_PAGE = {
  "data": "ANT_THEOREMS",
  "prefix": "ant",
  "colors": {
    "basic": "#d9d4ca",
    "11R04": "#4f86c6",
    "11R11": "#e9c46a",
    "11R18": "#e76f51",
    "11R23": "#c77dba",
    "11R27": "#8ab17d",
    "11R29": "#c0392b",
    "11R32": "#9b5de5",
    "11R37": "#2a9d8f",
    "11R39": "#a3b18a",
    "11R42": "#d4a017",
    "11R45": "#b08968",
    "11R52": "#7f8c3a",
    "11R56": "#5fa8a0",
    "11S": "#6d597a"
  },
  "foreignArea": "basic",
  "foreignLabel": "proved outside algebraic number theory",
  "hubs": [],
  "foreignOutside": true,
  "centre": [
    "ideal-contains-integer"
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
      "data": "ANT_CONCEPTS",
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
