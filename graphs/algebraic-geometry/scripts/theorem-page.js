// Settings of theorems.html for ../../shared_scripts/concept-graph.js (meaning of the fields there). Written by
// graphs/tests/make-theorem-pages.js; colours and centre may be changed by hand.
window.CONCEPT_PAGE = {
  "data": "AG_THEOREMS",
  "prefix": "ag",
  "colors": {
    "basic": "#d9d4ca",
    "14A": "#e9c46a",
    "14B": "#d4a017",
    "14C": "#e76f51",
    "14D": "#9b5de5",
    "14E": "#c0392b",
    "14F": "#4f86c6",
    "14G": "#7f8c3a",
    "14H": "#8ab17d",
    "14J": "#2a9d8f",
    "14K": "#b08968",
    "14L": "#6d597a",
    "14M": "#f4a261",
    "14N": "#5c7cfa"
  },
  "foreignArea": "basic",
  "foreignLabel": "proved outside algebraic geometry",
  "hubs": [],
  "foreignOutside": true,
  "centre": [
    "affine-schemes-and-rings"
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
    "ar": {
      "data": "AR_THEOREMS",
      "page": "../arithmetic-geometry/theorems.html",
      "title": "the theorem graph of arithmetic geometry"
    }
  },
  "conceptSources": {
    "": {
      "data": "AG_CG",
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
    "proofsHead": "Proofs",
    "proofWord": "Proof",
    "buildsOn": "Theorems this proof builds on",
    "homeVerb": "Proved",
    "levelHint": "Level 1: proved without other theorems of the area; level k: 1 + highest level among the theorems the proof uses. Results of other areas are not counted; their arrows come from outside."
  }
};
