// Data of the concept graph (concepts.html): concepts (definitions) of model theory, MSC 2020
// 03C. In English. Moved on 4 November 2026 from ../../logic/data/concepts.js (user: model theory is
// an area of its own); all fields are unchanged, except that `area` is now one of the groupings in `groupAreas` (one sector each; the
// five-character classes of `msc5` grouped) instead of the single class 03C.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). Every concept that a
// definition (name, formula, defining prose) uses explicitly is in `uses`.
//
// References to other folders: logic "lo:", computability "cc:", set theory "st:", field theory "ft:", Galois theory "gal:" and others.
// Prefix for references from other folders: "mt:<id>".
// Sources: Marker, Model Theory: An Introduction (2002); Hodges, Model Theory (1993); Tent and Ziegler, A Course in Model
// Theory (2012); Enderton, A Mathematical Introduction to Logic (2nd ed. 2001). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.MT_CONCEPTS = {
  title: "Concepts of model theory",

  areas: {
    basic: "Defined elsewhere, no home folder yet",
    basics: "03C07, 03C13, 03C40, 03C62, 03C95 Structures, theories and models",
    classification: "03C15–03C50 Ultraproducts, categoricity, stability and saturation",
    tame: "03C10, 03C60, 03C64 Quantifier elimination, algebraic and o-minimal structures",
  },
  groupAreas: ["basics", "classification", "tame"],

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 03C07, 03C13, 03C40, 03C62, 03C95 Structures, theories and models
    { id: "structure", name: "Structure", kind: "objekt", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["lo:signature", "st:set", "st:relation", "st:map"],
      formula: String.raw`\mathcal M = (M;\ c^{\mathcal M},\ f^{\mathcal M},\ R^{\mathcal M})`,
      text: "For a signature L, a non-empty set M (the domain) with an element for each constant symbol, an n-ary map on M for each n-ary function symbol and an n-ary relation on M for each n-ary relation symbol. Groups, rings, ordered fields and graphs are structures." },
    { id: "satisfaction", name: "Satisfaction", kind: "morphismus", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "lo:formula", "st:map"],
      formula: String.raw`\mathcal M \models \varphi[a_1, \dots, a_n]`,
      text: "Tarski's definition (1933) of truth by recursion on formulas: an atomic formula holds if the values of its terms stand in the relation, ¬ and ∧ are read as not and and, and ∃x φ holds under an assignment of elements to the free variables if φ holds after changing the value of x to some element of M." },
    { id: "model", name: "Model of a theory", kind: "objekt", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "lo:theory", "lo:sentence", "satisfaction"], isA: ["structure"],
      formula: String.raw`\mathcal M \models T`,
      text: "A structure (a set with relations and maps on it) in which all sentences of the theory T hold. The models of the group axioms are the groups." },
    { id: "complete-theory", name: "Complete theory", kind: "eigenschaft", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["lo:theory", "lo:sentence", "lo:provability"],
      formula: String.raw`T \vdash \sigma \ \text{or}\ T \vdash \neg\sigma`,
      text: "A consistent theory that proves σ or ¬σ for every sentence σ of its signature; equivalently, all its models are elementarily equivalent." },
    { id: "substructure", name: "Substructure", kind: "eigenschaft", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "st:subset"], isA: ["structure"],
      formula: String.raw`A \subseteq M,\quad f^{\mathcal A} = f^{\mathcal M}|_{A}`,
      text: "A structure 𝒜 whose domain is a subset A of the domain of ℳ, closed under the functions of ℳ and containing its constants, with the restricted functions and relations (subgroups, subrings)." },
    { id: "isomorphism-of-structures", name: "Isomorphism of structures", kind: "morphismus", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "st:bijection"],
      formula: String.raw`h(f^{\mathcal M}(a)) = f^{\mathcal N}(h(a)),\quad R^{\mathcal M}(a) \iff R^{\mathcal N}(h(a))`,
      text: "A bijection between the domains of two structures of the same signature that preserves constants, functions and relations in both directions." },
    { id: "elementary-equivalence", name: "Elementary equivalence", kind: "morphismus", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "lo:sentence", "satisfaction"],
      formula: String.raw`\mathcal M \equiv \mathcal N`,
      text: "Two structures of the same signature are elementarily equivalent if exactly the same sentences hold in them. (ℚ, <) and (ℝ, <) are elementarily equivalent but not isomorphic." },
    { id: "elementary-embedding", name: "Elementary embedding", kind: "morphismus", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "lo:formula", "satisfaction", "st:injective"],
      formula: String.raw`\mathcal M \models \varphi[\bar a] \iff \mathcal N \models \varphi[h(\bar a)]`,
      text: "An injective map h from the domain of ℳ to the domain of 𝒩 such that every formula φ holds of a tuple ā in ℳ exactly when it holds of h(ā) in 𝒩." },
    { id: "elementary-substructure", name: "Elementary substructure", kind: "eigenschaft", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["substructure", "elementary-embedding"], isA: ["substructure"],
      formula: String.raw`\mathcal A \preceq \mathcal M`,
      text: "A substructure 𝒜 of ℳ for which the inclusion map is an elementary embedding: formulas with parameters from A hold in 𝒜 exactly when they hold in ℳ." },
    { id: "theory-of-structure", name: "Theory of a structure", kind: "konstruktion", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "lo:sentence", "satisfaction"], isA: ["lo:theory"],
      formula: String.raw`\operatorname{Th}(\mathcal M) = \{ \sigma : \mathcal M \models \sigma \}`,
      text: "The set of all sentences true in a structure ℳ; it is a complete theory." },
    { id: "definable-set", name: "Definable set", kind: "eigenschaft", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "lo:formula", "satisfaction", "st:subset", "st:cartesian-product"],
      formula: String.raw`\varphi(\mathcal M, \bar b) = \{ \bar a \in M^n : \mathcal M \models \varphi[\bar a, \bar b] \}`,
      text: "A subset of M<sup>n</sup> of the form shown, defined by a formula φ with parameters b̄ from M. In (ℝ; +, ·) the non-negative reals are definable as the squares." },
    { id: "skolem-function", name: "Skolem function", kind: "konstruktion", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["structure", "lo:formula", "satisfaction", "st:map"],
      formula: String.raw`\mathcal M \models \varphi[\bar a, b] \;\Rightarrow\; \mathcal M \models \varphi[\bar a, f(\bar a)]`,
      text: "For a formula φ(x̄, y) and a structure ℳ, a map f : M<sup>n</sup> → M that picks, whenever some y satisfies φ(ā, y), such a witness f(ā). Its existence in general uses the axiom of choice." },
    { id: "type", name: "Complete type", kind: "objekt", area: "basics", field: [3], msc: ["03C"], msc5: "03C07", uses: ["lo:formula", "theory-of-structure", "st:subset"],
      formula: String.raw`p(\bar x) \subseteq \{ \varphi(\bar x, \bar a) : \bar a \subseteq A \}`,
      text: "For a structure ℳ and a subset A of M, a maximal set p of formulas in the variables x̄ with parameters from A that is consistent with the theory of ℳ with names for the elements of A. A tuple realizes p if it satisfies all formulas of p; p is isolated if one formula of p implies all others." },
    { id: "standard-model-of-arithmetic", name: "Standard model of arithmetic", kind: "objekt", area: "basics", field: [3], msc: ["03C"], msc5: "03C62", uses: ["structure", "ent:natural-number", "lo:peano-arithmetic"], isA: ["model"],
      formula: String.raw`\mathbb N = (\mathbb N;\ 0, S, +, \cdot, <)`,
      text: "The natural numbers with zero, successor, addition, multiplication and order, as a structure for the language of arithmetic; it is a model of Peano arithmetic." },
    { id: "nonstandard-model", name: "Nonstandard model of arithmetic", kind: "objekt", area: "basics", field: [3], msc: ["03C"], msc5: "03C62", uses: ["model", "lo:peano-arithmetic", "standard-model-of-arithmetic", "isomorphism-of-structures"],
      formula: String.raw`\mathcal M \models \mathrm{PA},\quad \mathcal M \not\cong \mathbb N`,
      text: "A model of Peano arithmetic that is not isomorphic to the standard model; it contains an initial copy of ℕ followed by infinite elements. Every countable one has order type ω + (ω* + ω)·η." },

    // ------------------------------------------------------------ 03C15–03C50 Ultraproducts, categoricity, stability and saturation
    { id: "ultraproduct", name: "Ultraproduct", kind: "konstruktion", area: "classification", field: [3], msc: ["03C"], msc5: "03C20", uses: ["structure", "st:ultrafilter", "st:cartesian-product", "st:equivalence-relation"],
      formula: String.raw`\textstyle\prod_i \mathcal M_i / U,\quad (a_i) \sim (b_i) \iff \{ i : a_i = b_i \} \in U`,
      text: "For structures ℳ<sub>i</sub> indexed by a set I and an ultrafilter U on I, the Cartesian product of the domains modulo the equivalence relation of agreement on a set in U, with relations holding when they hold for a set of indices in U. If all ℳ<sub>i</sub> are equal it is an ultrapower." },
    { id: "saturated-model", name: "Saturated model", kind: "eigenschaft", area: "classification", field: [3], msc: ["03C"], msc5: "03C50", uses: ["model", "type", "st:cardinality", "st:cardinal-number"],
      formula: String.raw`|A| < |M| \;\Rightarrow\; \text{every type over } A \text{ realized in } \mathcal M`,
      text: "A model ℳ of cardinality κ is saturated if every complete type over a subset A of M with fewer than κ elements is realized in ℳ. Two saturated, elementarily equivalent models of the same cardinality are isomorphic." },
    { id: "prime-model", name: "Prime model", kind: "eigenschaft", area: "classification", field: [3], msc: ["03C"], msc5: "03C50", uses: ["model", "elementary-embedding"],
      formula: String.raw`\mathcal M_0 \preceq \mathcal N \ \ (\mathcal N \models T)`,
      text: "A model of a complete theory T that embeds elementarily into every model of T; the real algebraic numbers are the prime model of RCF, the algebraic closure of ℚ that of ACF<sub>0</sub>." },
    { id: "kappa-categorical", name: "κ-categorical theory", kind: "eigenschaft", area: "classification", field: [3], msc: ["03C"], msc5: "03C35", uses: ["lo:theory", "model", "isomorphism-of-structures", "st:cardinal-number", "st:cardinality"],
      formula: String.raw`\mathcal M, \mathcal N \models T,\quad |M| = |N| = \kappa \;\Rightarrow\; \mathcal M \cong \mathcal N`,
      text: "A theory with exactly one model of cardinality κ up to isomorphism. Dense linear orders without endpoints are ℵ<sub>0</sub>-categorical; algebraically closed fields of fixed characteristic are κ-categorical for every uncountable κ." },
    { id: "stable-theory", name: "Stable theory", kind: "eigenschaft", area: "classification", field: [3], msc: ["03C"], msc5: "03C45", uses: ["lo:theory", "type", "st:cardinal-number", "st:cardinality"],
      formula: String.raw`|S_1(A)| \le \kappa \ \ (|A| \le \kappa)`,
      text: "A complete countable theory is κ-stable if over every set A of parameters of cardinality at most κ there are at most κ complete 1-types; it is stable if it is κ-stable for some infinite κ (Shelah). Stable theories admit a good notion of independence (forking)." },
    { id: "omega-stable", name: "ω-stable theory", kind: "eigenschaft", area: "classification", field: [3], msc: ["03C"], msc5: "03C45", uses: ["lo:theory", "type", "st:countable-set"], isA: ["stable-theory"],
      formula: String.raw`|S_1(A)| \le \aleph_0 \ \ (A \text{ countable})`,
      text: "A complete theory in a countable signature over each countable parameter set of which there are only countably many complete 1-types. Algebraically closed fields and differentially closed fields are ω-stable." },
    { id: "morley-rank", name: "Morley rank", kind: "invariante", area: "classification", field: [3], msc: ["03C"], msc5: "03C45", uses: ["definable-set", "st:ordinal", "saturated-model"],
      formula: String.raw`\operatorname{RM}(X) \ge \alpha + 1 \iff X \supseteq X_1, X_2, \dots \text{ disjoint},\ \operatorname{RM}(X_i) \ge \alpha`,
      text: "An ordinal-valued dimension of definable sets in a saturated model: every non-empty set has rank ≥ 0, rank ≥ α + 1 if it contains infinitely many pairwise disjoint definable subsets of rank ≥ α, and rank ≥ λ at limits λ if ≥ α for all α < λ. In algebraically closed fields it equals the Krull dimension of the Zariski closure." },

    // ------------------------------------------------------------ 03C10, 03C60, 03C64 Quantifier elimination, algebraic and o-minimal structures
    { id: "quantifier-elimination", name: "Quantifier elimination", kind: "eigenschaft", area: "tame", field: [3], msc: ["03C"], msc5: "03C10", uses: ["lo:theory", "lo:formula", "lo:quantifier-free-formula", "lo:provability"],
      formula: String.raw`T \vdash \varphi(\bar x) \leftrightarrow \psi(\bar x),\quad \psi \text{ quantifier-free}`,
      text: "A theory T has quantifier elimination if every formula is equivalent modulo T to a quantifier-free formula in the same free variables." },
    { id: "theory-acf", name: "Theory of algebraically closed fields", kind: "objekt", area: "tame", field: [3], msc: ["03C"], msc5: "03C60", uses: ["gal:algebraically-closed-field", "ca:characteristic"], isA: ["lo:theory"],
      formula: String.raw`\mathrm{ACF}_p`,
      text: "The field axioms together with, for each n ≥ 1, the sentence that every monic polynomial of degree n has a root; ACF<sub>p</sub> adds the sentences fixing the characteristic p (a prime or 0)." },
    { id: "theory-rcf", name: "Theory of real closed fields", kind: "objekt", area: "tame", field: [3], msc: ["03C"], msc5: "03C64", uses: ["ft:real-closed-field"], isA: ["lo:theory"],
      formula: String.raw`\mathrm{RCF}`,
      text: "In the language of ordered rings: the ordered field axioms, every positive element is a square, and every polynomial of odd degree has a root. Its models are the real closed fields, ℝ and the real algebraic numbers among them." },
    { id: "o-minimal-structure", name: "O-minimal structure", kind: "eigenschaft", area: "tame", field: [3], msc: ["03C"], msc5: "03C64", uses: ["structure", "definable-set", "st:total-order"], isA: ["structure"],
      formula: String.raw`X \subseteq M \text{ definable} \;\Rightarrow\; X = \text{finite union of points and intervals}`,
      text: "A structure (M; <, …) with a dense total order without endpoints in which every definable subset of M is a finite union of points and open intervals with endpoints in M ∪ {±∞}. The real field (ℝ; +, ·, <) and the real exponential field are o-minimal (van den Dries, Pillay, Steinhorn 1984–86)." },
  ],
};
