// Data model of the concept graph (concepts.html): concepts (definitions) of representation theory, MSC 2020 20C
// (representations of groups), 22 (topological and Lie groups) and, provisionally, 17B (Lie algebras; no folder of
// its own yet, rule 1 of ../../CLAUDE.md). In English. Built on 3 November 2026 for the statements of
// data/theorem-graph.js.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). `area` is the three-character
// MSC class (20C, 17B, 22A, 22D, 22E). Concepts used here without a home folder (associative algebra, trace of an
// endomorphism, Hilbert space, Haar measure, flag variety, affine Grassmannian, perverse sheaf, D-module) have the area
// "basic" and their own MSC class. Concepts with first class 20D, 20F or 20G (Coxeter group, Bruhat order, Chevalley
// group, finite group of Lie type, Monster) live in ../../group-theory/data/concepts.js and are referred to with "gt:".
// Every concept that a definition (name, formula, defining prose) uses explicitly is in `uses`.
//
// References: set theory "st:", elementary number theory "ent:", group theory "gt:", commutative algebra "ca:",
// category theory "ct:", algebraic geometry "ag:", arithmetic geometry "ar:", algebraic number theory "ant:",
// combinatorics "co:" (partitions, Young tableaux, symmetric functions).
// Prefix for references from other folders: "rt:<id>".
// Sources: Serre, Linear Representations of Finite Groups (1977); Isaacs, Character Theory of Finite Groups (1976);
// Humphreys, Introduction to Lie Algebras and Representation Theory (1972); Humphreys, Representations of Semisimple Lie
// Algebras in the BGG Category O (2008); Kac, Infinite Dimensional Lie Algebras (3rd ed. 1990); Knapp, Representation
// Theory of Semisimple Groups (1986); Bump, Lie Groups (2nd ed. 2013). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.
// Merged on 3 November 2026: the Lie algebras (17B) now live in ../../lie-theory/ ("lie:"), the Oppenheim conjecture in
// ../../diophantine-number-theory/ ("dio:"); the former placeholders of the area "basic" moved to their home folders
// (linear algebra "la:", associative algebras "aa:", several complex variables "scv:", mathematical physics "mp:", algebraic
// geometry "ag:"). Report: reports/2026-11-03 Zusammenfuehren Daten/bericht.md.

window.RT_CONCEPTS = {
  title: "Concepts of representation theory",

  areas: {
    basic: "Defined elsewhere, no home folder yet",
    "20C": "20C Representation theory of groups",
    "22A": "22A Topological groups",
    "22B": "22B Locally compact abelian groups",
    "22D": "22D Locally compact groups and their representations",
    "22E": "22E Lie groups",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 20C Representations of finite groups
    { id: "group-representation", name: "Representation of a group", kind: "objekt", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["gt:group", "gt:homomorphism", "gt:general-linear-group", "ca:module", "ft:field"],
      formula: String.raw`\rho : G \to \mathrm{GL}(V)`,
      text: "A group homomorphism ρ from a group G to the general linear group of a vector space V over a field k (a k-module); equivalently, a linear action of G on V. Its degree is the dimension of V." },
    { id: "subrepresentation", name: "Subrepresentation", kind: "konstruktion", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["group-representation", "ca:submodule"], isA: ["group-representation"],
      formula: String.raw`\rho(g)W \subseteq W`,
      text: "A subspace W of V (a submodule) that is mapped into itself by every ρ(g), with the restricted action." },
    { id: "intertwining-map", name: "Intertwining map", kind: "morphismus", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["group-representation", "ca:module-homomorphism"],
      formula: String.raw`f \circ \rho(g) = \sigma(g) \circ f`,
      text: "A linear map f : V → W between representations ρ and σ of the same group with f ρ(g) = σ(g) f for every g; also called a G-homomorphism. An isomorphism of representations is a bijective intertwining map." },
    { id: "irreducible-representation", name: "Irreducible representation", kind: "eigenschaft", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["subrepresentation"], isA: ["group-representation"],
      formula: String.raw`W \subseteq V \text{ invariant} \;\Rightarrow\; W = 0 \text{ or } W = V`,
      text: "A representation V ≠ 0 whose only subrepresentations are 0 and V." },
    { id: "completely-reducible", name: "Completely reducible representation", kind: "eigenschaft", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["irreducible-representation", "ca:direct-sum"], isA: ["group-representation"],
      formula: String.raw`V = V_1 \oplus \dots \oplus V_k`,
      text: "A representation that is the direct sum of irreducible subrepresentations; also called semisimple." },
    { id: "regular-representation", name: "Regular representation", kind: "konstruktion", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["group-representation", "aa:group-ring"], isA: ["group-representation"],
      formula: String.raw`\rho(g)\, e_h = e_{gh}`,
      text: "The representation of a finite group G on its group algebra k[G], with basis e<sub>h</sub> (h ∈ G), by left multiplication." },
    { id: "character", name: "Character", kind: "invariante", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["group-representation", "la:trace-of-endomorphism"],
      formula: String.raw`\chi_\rho(g) = \operatorname{tr} \rho(g)`,
      text: "For a finite-dimensional representation ρ, the function χ<sub>ρ</sub> on G whose value at g is the trace of ρ(g). Its degree χ(1) is the degree of ρ." },
    { id: "linear-character", name: "Linear character", kind: "objekt", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["character"], isA: ["character"],
      formula: String.raw`\lambda : G \to \mathbb C^\times,\quad \lambda(gh) = \lambda(g)\lambda(h)`,
      text: "The character of a representation of degree 1, that is, a homomorphism from G to the multiplicative group of the field." },
    { id: "class-function", name: "Class function", kind: "objekt", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["gt:conjugacy-class", "st:map", "st:complex-number"],
      formula: String.raw`f(hgh^{-1}) = f(g)`,
      text: "A map f from a group G to the complex numbers that is constant on every conjugacy class. Characters are class functions." },
    { id: "character-inner-product", name: "Inner product of class functions", kind: "konstruktion", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["class-function", "gt:finite-group"],
      formula: String.raw`\langle f_1, f_2 \rangle = \frac{1}{|G|} \sum_{g \in G} f_1(g)\, \overline{f_2(g)}`,
      text: "On the class functions of a finite group G, the Hermitian inner product given by the average of f<sub>1</sub>(g) times the complex conjugate of f<sub>2</sub>(g) over G." },
    { id: "irreducible-character", name: "Irreducible character", kind: "objekt", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["character", "irreducible-representation"], isA: ["character"],
      formula: String.raw`\chi \in \operatorname{Irr}(G)`,
      text: "The character of an irreducible representation over ℂ; Irr(G) is the set of these characters." },
    { id: "central-character", name: "Central character", kind: "invariante", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["irreducible-character", "gt:conjugacy-class", "aa:group-ring"],
      formula: String.raw`\omega_\chi(\hat K) = \frac{|K|\, \chi(g)}{\chi(1)},\quad g \in K`,
      text: "For an irreducible character χ, the homomorphism ω<sub>χ</sub> from the centre of the group algebra ℂ[G] to ℂ by which the centre acts on the representation; on the class sum K̂ of a conjugacy class K it is |K|χ(g)/χ(1)." },
    { id: "induced-representation", name: "Induced representation", kind: "konstruktion", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["group-representation", "gt:subgroup", "gt:coset", "ca:direct-sum"], isA: ["group-representation"],
      formula: String.raw`\operatorname{Ind}_H^G W = \bigoplus_{i} g_i W`,
      text: "For a representation W of a subgroup H of finite index and representatives g<sub>1</sub>, …, g<sub>r</sub> of the cosets g<sub>i</sub>H, the direct sum of copies g<sub>i</sub>W of W, on which g acts by g g<sub>i</sub>w = g<sub>j</sub>(hw) when gg<sub>i</sub> = g<sub>j</sub>h. Its character is Ind ψ(g) = (1/|H|) Σ<sub>x</sub> ψ(x<sup>−1</sup>gx), the sum over x in G with x<sup>−1</sup>gx in H." },
    { id: "restricted-representation", name: "Restriction of a representation", kind: "konstruktion", area: "20C", field: [20], msc: ["20C"], msc5: "20C15", uses: ["group-representation", "gt:subgroup"], isA: ["group-representation"],
      formula: String.raw`\operatorname{Res}^G_H \rho = \rho|_H`,
      text: "For a representation ρ of G and a subgroup H, the representation ρ restricted to H." },
    { id: "brauer-character", name: "Brauer character", kind: "invariante", area: "20C", field: [20], msc: ["20C"], msc5: "20C20", uses: ["group-representation", "ft:finite-field", "ant:root-of-unity", "ent:prime-number"],
      formula: String.raw`\varphi(g) = \sum_i \tilde\lambda_i`,
      text: "For a representation of a finite group over an algebraically closed field of prime characteristic p (containing a finite field), the function on the p-regular elements g (order prime to p) that sums the complex roots of unity λ̃<sub>i</sub> lifting the eigenvalues λ<sub>i</sub> of g, under a fixed isomorphism of the groups of roots of unity of order prime to p." },
    { id: "block-of-group-algebra", name: "Block of a group algebra", kind: "konstruktion", area: "20C", field: [20], msc: ["20C"], msc5: "20C20", uses: ["aa:group-ring", "ft:finite-field", "gt:finite-group"],
      formula: String.raw`kG = B_1 \times \dots \times B_s`,
      text: "For a finite group G and a field k of characteristic p, one of the indecomposable two-sided ideals B<sub>i</sub> in the unique decomposition of the group algebra kG into a product of indecomposable algebras. Each irreducible character and each simple module belongs to exactly one block." },
    { id: "defect-group", name: "Defect group", kind: "invariante", area: "20C", field: [20], msc: ["20C"], msc5: "20C20", uses: ["block-of-group-algebra", "gt:p-group", "gt:subgroup"],
      formula: String.raw`D \le G,\quad |D| = p^{d(B)}`,
      text: "For a block B of kG, a p-subgroup D of G, minimal such that B is a direct summand of kG induced as a module over k[G × G] from the diagonal copy of D; it is unique up to conjugation and p<sup>d(B)</sup> = |D|, where d(B) is the defect of B." },
    { id: "character-height", name: "Height of a character", kind: "invariante", area: "20C", field: [20], msc: ["20C"], msc5: "20C20", uses: ["defect-group", "irreducible-character", "ent:p-adic-valuation"],
      formula: String.raw`\nu_p(\chi(1)) = \nu_p(|G|) - d(B) + \operatorname{ht}(\chi)`,
      text: "For an irreducible character χ in a block B with defect d(B), the non-negative integer ht(χ) defined by the p-adic valuation of its degree: ν<sub>p</sub>(χ(1)) = ν<sub>p</sub>(|G|) − d(B) + ht(χ)." },
    { id: "iwahori-hecke-algebra", name: "Iwahori–Hecke algebra", kind: "konstruktion", area: "20C", field: [20], msc: ["20C"], msc5: "20C08", uses: ["gt:coxeter-group", "aa:associative-algebra", "ent:integer"], isA: ["aa:associative-algebra"],
      formula: String.raw`(T_s - q)(T_s + 1) = 0,\quad T_s T_t T_s \cdots = T_t T_s T_t \cdots`,
      text: "For a Coxeter group (W, S), the algebra over ℤ[q<sup>±1/2</sup>] (integer Laurent polynomials) generated by elements T<sub>s</sub> (s ∈ S) with the quadratic relations (T<sub>s</sub> − q)(T<sub>s</sub> + 1) = 0 and the braid relations of W, with m<sub>st</sub> factors on each side. For q = 1 it is the group algebra of W." },
    { id: "kazhdan-lusztig-polynomial", name: "Kazhdan–Lusztig polynomial", kind: "invariante", area: "20C", field: [20], msc: ["20C", "20F"], msc5: "20C08", uses: ["iwahori-hecke-algebra", "gt:bruhat-order", "ca:polynomial-ring"],
      formula: String.raw`C'_w = q^{-\ell(w)/2} \sum_{y \le w} P_{y,w}(q)\, T_y`,
      text: "For elements y ≤ w of a Coxeter group in the Bruhat order, the polynomial P<sub>y,w</sub>(q) with integer coefficients that is the coefficient of T<sub>y</sub> in the Kazhdan–Lusztig basis element C′<sub>w</sub> of the Iwahori–Hecke algebra, the unique bar-invariant element of this form with P<sub>w,w</sub> = 1 and deg P<sub>y,w</sub> ≤ (ℓ(w) − ℓ(y) − 1)/2 for y < w." },
    { id: "soergel-bimodule", name: "Soergel bimodule", kind: "objekt", area: "20C", field: [20], msc: ["20C", "20F"], msc5: "20C08", uses: ["gt:coxeter-group", "ca:polynomial-ring", "ca:tensor-product", "ca:graded-ring"],
      formula: String.raw`B_s = R \otimes_{R^s} R(1)`,
      text: "For a Coxeter group W acting on a polynomial ring R (graded, functions on a reflection representation), a graded R-bimodule that is a direct summand of a shift of a tensor product B<sub>s<sub>1</sub></sub> ⊗<sub>R</sub> … ⊗<sub>R</sub> B<sub>s<sub>k</sub></sub>, where B<sub>s</sub> = R ⊗<sub>R<sup>s</sup></sub> R(1) and R<sup>s</sup> are the s-invariants." },
    { id: "specht-module", name: "Specht module", kind: "konstruktion", area: "20C", field: [20], msc: ["20C", "05E"], msc5: "20C30", uses: ["gt:symmetric-group", "co:young-tableau", "co:integer-partition", "group-representation"], isA: ["group-representation"],
      formula: String.raw`S^\lambda = \operatorname{span}\{ e_t : t \text{ a } \lambda\text{-tableau} \}`,
      text: "For a partition λ of n, the representation of the symmetric group S<sub>n</sub> spanned by the polytabloids e<sub>t</sub> = Σ<sub>σ</sub> sgn(σ) σ{t}, one for each Young tableau t of shape λ, where σ runs through the permutations preserving the columns of t and {t} is the row class of t." },
    { id: "deligne-lusztig-character", name: "Deligne–Lusztig character", kind: "konstruktion", area: "20C", field: [20], msc: ["20C", "20G"], msc5: "20C33", uses: ["gt:finite-group-of-lie-type", "ag:l-adic-cohomology", "linear-character", "ag:algebraic-torus"],
      formula: String.raw`R_T^\theta(g) = \sum_i (-1)^i \operatorname{tr}\bigl(g \mid H^i_c(\tilde X_T, \overline{\mathbb Q}_\ell)_\theta\bigr)`,
      text: "For a finite group of Lie type G<sup>F</sup>, an F-stable maximal torus T and a linear character θ of T<sup>F</sup>, the virtual character of G<sup>F</sup> given by the alternating sum of the θ-parts of the ℓ-adic cohomology with compact support of the Deligne–Lusztig variety X̃<sub>T</sub>." },
    { id: "unipotent-character", name: "Unipotent character", kind: "eigenschaft", area: "20C", field: [20], msc: ["20C", "20G"], msc5: "20C33", uses: ["deligne-lusztig-character", "irreducible-character"], isA: ["irreducible-character"],
      formula: String.raw`\langle \chi, R_T^{1} \rangle \ne 0`,
      text: "An irreducible character χ of a finite group of Lie type that occurs in a Deligne–Lusztig character R<sub>T</sub><sup>1</sup> with trivial θ for some maximal torus T." },

    // ------------------------------------------------------------ 22A, 22D Topological and locally compact groups
    { id: "topological-group", name: "Topological group", kind: "objekt", area: "22A", field: [22], msc: ["22A"], msc5: "22A05", uses: ["gt:group", "top:topological-space"], isA: ["gt:group"],
      formula: String.raw`(g, h) \mapsto g h^{-1} \text{ continuous}`,
      text: "A group with a topology in which multiplication and inversion are continuous." },
    { id: "locally-compact-group", name: "Locally compact group", kind: "eigenschaft", area: "22D", field: [22], msc: ["22D"], msc5: "22D05", uses: ["topological-group"], isA: ["topological-group"],
      formula: String.raw`1 \in U \subseteq \overline U \text{ compact}`,
      text: "A Hausdorff topological group in which the identity has a neighbourhood with compact closure." },
    { id: "unitary-representation", name: "Unitary representation", kind: "objekt", area: "22D", field: [22], msc: ["22D"], msc5: "22D10", uses: ["locally-compact-group", "ana:hilbert-space", "group-representation"], isA: ["group-representation"],
      formula: String.raw`\langle \pi(g) v, \pi(g) w \rangle = \langle v, w \rangle`,
      text: "A representation π of a locally compact group G on a Hilbert space by unitary operators such that g ↦ π(g)v is continuous for every vector v." },
    { id: "matrix-coefficient", name: "Matrix coefficient", kind: "konstruktion", area: "22D", field: [22], msc: ["22D"], msc5: "22D10", uses: ["unitary-representation", "ana:hilbert-space"],
      formula: String.raw`c_{v,w}(g) = \langle \pi(g) v, w \rangle`,
      text: "For a unitary representation π and vectors v, w, the continuous function g ↦ ⟨π(g)v, w⟩ on the group." },
    { id: "property-t", name: "Kazhdan's property (T)", kind: "eigenschaft", area: "22D", field: [22], msc: ["22D"], msc5: "22D10", uses: ["unitary-representation", "locally-compact-group"],
      formula: String.raw`\sup_{s \in Q} \|\pi(s)v - v\| < \varepsilon \|v\| \;\Rightarrow\; \pi \text{ has a nonzero invariant vector}`,
      text: "A locally compact group G has property (T) if there are a compact set Q and ε > 0 such that every unitary representation with a (Q, ε)-invariant unit vector has a nonzero invariant vector; equivalently, the trivial representation is isolated in the unitary dual." },

    // ------------------------------------------------------------ 22E Lie groups
    { id: "lie-group", name: "Lie group", kind: "objekt", area: "22E", field: [22], msc: ["22E"], msc5: "22E15", uses: ["top:manifold", "topological-group"], isA: ["topological-group"],
      formula: String.raw`G \times G \to G,\; (g, h) \mapsto g h^{-1} \text{ smooth}`,
      text: "A group that is a differentiable manifold such that multiplication and inversion are smooth maps." },
    { id: "lie-algebra-of-lie-group", name: "Lie algebra of a Lie group", kind: "konstruktion", area: "22E", field: [22, 17], msc: ["22E", "17B"], msc5: "22E60", uses: ["lie-group", "lie:lie-algebra"],
      formula: String.raw`\mathfrak g = T_e G,\quad [X, Y] = XY - YX`,
      text: "The tangent space of a Lie group G at the identity, identified with the left-invariant vector fields on G, with the commutator of vector fields as bracket; a Lie algebra Lie(G)." },
    { id: "exponential-map", name: "Exponential map", kind: "morphismus", area: "22E", field: [22], msc: ["22E"], msc5: "22E60", uses: ["lie-algebra-of-lie-group"],
      formula: String.raw`\exp(X) = \gamma_X(1),\quad \gamma_X(s + t) = \gamma_X(s)\gamma_X(t)`,
      text: "The map from the Lie algebra 𝔤 of a Lie group G to G that sends X to γ<sub>X</sub>(1), where γ<sub>X</sub> is the one-parameter subgroup with derivative X at 0; for matrix groups it is the matrix exponential." },
    { id: "compact-lie-group", name: "Compact Lie group", kind: "eigenschaft", area: "22E", field: [22], msc: ["22E", "22C"], msc5: "22E15", uses: ["lie-group"], isA: ["lie-group"],
      formula: String.raw`G \text{ compact}`,
      text: "A Lie group that is compact as a topological space, such as U(n), SO(n) and SU(n)." },
    { id: "maximal-torus", name: "Maximal torus", kind: "objekt", area: "22E", field: [22], msc: ["22E"], msc5: "22E15", uses: ["compact-lie-group", "gt:subgroup"],
      formula: String.raw`T \cong (S^1)^r`,
      text: "A connected abelian closed subgroup T ≅ (S<sup>1</sup>)<sup>r</sup> of a compact connected Lie group that is maximal with this property; r is the rank." },
    { id: "real-reductive-group", name: "Real reductive group", kind: "objekt", area: "22E", field: [22], msc: ["22E"], msc5: "22E46", uses: ["lie-group", "ag:reductive-group", "st:real-number"], isA: ["lie-group"],
      formula: String.raw`G = \mathbf G(\mathbb R),\quad K \subseteq G \text{ maximal compact}`,
      text: "The group G = 𝐆(ℝ) of real points of a connected reductive algebraic group 𝐆 over the real numbers, a Lie group with a maximal compact subgroup K, unique up to conjugation (for example SL<sub>n</sub>(ℝ), SO(p, q), Sp<sub>2n</sub>(ℝ))." },
    { id: "harish-chandra-character", name: "Distribution character", kind: "invariante", area: "22E", field: [22], msc: ["22E"], msc5: "22E45", uses: ["unitary-representation", "la:trace-of-endomorphism", "ana:haar-measure", "real-reductive-group"],
      formula: String.raw`\Theta_\pi(f) = \operatorname{tr} \int_G f(g)\, \pi(g)\, dg`,
      text: "For an irreducible unitary (more generally admissible) representation π of a real reductive group, the distribution on G that maps a smooth compactly supported function f to the trace of the trace-class operator ∫ f(g)π(g) dg (Harish-Chandra)." },
    { id: "discrete-series", name: "Discrete series representation", kind: "eigenschaft", area: "22E", field: [22], msc: ["22E"], msc5: "22E46", uses: ["unitary-representation", "matrix-coefficient", "ana:haar-measure", "real-reductive-group"], isA: ["unitary-representation"],
      formula: String.raw`\int_G |\langle \pi(g) v, w \rangle|^2\, dg < \infty`,
      text: "An irreducible unitary representation of a real reductive group G (with compact centre) whose matrix coefficients are square integrable for the Haar measure; equivalently, a direct summand of L<sup>2</sup>(G)." },
    { id: "tempered-representation", name: "Tempered representation", kind: "eigenschaft", area: "22E", field: [22], msc: ["22E"], msc5: "22E46", uses: ["unitary-representation", "matrix-coefficient", "real-reductive-group"], isA: ["unitary-representation"],
      formula: String.raw`c_{v,w} \in L^{2+\varepsilon}(G)`,
      text: "An irreducible unitary representation of a reductive group whose matrix coefficients lie in L<sup>2+ε</sup>(G) for every ε > 0; these are the representations that occur in the Plancherel decomposition of L<sup>2</sup>(G)." },
    { id: "lattice-in-lie-group", name: "Lattice in a Lie group", kind: "objekt", area: "22E", field: [22], msc: ["22E"], msc5: "22E40", uses: ["lie-group", "ana:haar-measure", "gt:subgroup"],
      formula: String.raw`\Gamma \le G \text{ discrete},\quad \operatorname{vol}(G/\Gamma) < \infty`,
      text: "A discrete subgroup Γ of a Lie group G such that G/Γ carries a finite G-invariant measure induced by the Haar measure; it is uniform if G/Γ is compact. Example: SL<sub>n</sub>(ℤ) in SL<sub>n</sub>(ℝ)." },
    { id: "arithmetic-subgroup", name: "Arithmetic subgroup", kind: "objekt", area: "22E", field: [22, 11], msc: ["22E", "11F"], msc5: "22E40", uses: ["lie-group", "ag:group-scheme", "ent:integer", "gt:subgroup", "gt:index"],
      formula: String.raw`[\Gamma : \Gamma \cap \mathbf G(\mathbb Z)] < \infty,\quad [\mathbf G(\mathbb Z) : \Gamma \cap \mathbf G(\mathbb Z)] < \infty`,
      text: "For a linear algebraic group 𝐆 over ℚ (a group scheme with an embedding in GL<sub>n</sub>), a subgroup Γ of 𝐆(ℚ) commensurable with 𝐆(ℤ), the integer points: both intersections have finite index. More generally, the image of such a group under a surjective homomorphism with compact kernel of Lie groups." },
    { id: "langlands-dual-group", name: "Langlands dual group", kind: "konstruktion", area: "22E", field: [22, 11], msc: ["22E", "11F"], msc5: "22E50", uses: ["ag:reductive-group"],
      formula: String.raw`(X^*, \Phi, X_*, \Phi^\vee) \;\mapsto\; (X_*, \Phi^\vee, X^*, \Phi)`,
      text: "For a connected reductive group G, the complex reductive group Ǧ whose root datum is obtained from that of G by exchanging characters with cocharacters and roots with coroots; for GL<sub>n</sub> it is GL<sub>n</sub>(ℂ), for SO<sub>2n+1</sub> it is Sp<sub>2n</sub>(ℂ). With the Galois action it gives the L-group <sup>L</sup>G." },
    { id: "langlands-parameter", name: "Langlands parameter", kind: "morphismus", area: "22E", field: [22, 11], msc: ["22E", "11F"], msc5: "22E50", uses: ["langlands-dual-group", "ft:absolute-galois-group"],
      formula: String.raw`\varphi : W_F \to {}^L G`,
      text: "For a reductive group G over a local field F, a continuous homomorphism from the Weil group W<sub>F</sub> (for p-adic F the Weil–Deligne group), a dense subgroup of the absolute Galois group with a modified topology, to the L-group, compatible with the projections to the Galois group and semisimple, up to conjugation by Ǧ." },
    { id: "spherical-hecke-algebra", name: "Spherical Hecke algebra", kind: "konstruktion", area: "22E", field: [22], msc: ["22E", "20C"], msc5: "22E50", uses: ["ag:reductive-group", "ant:local-field", "ana:haar-measure", "aa:associative-algebra"], isA: ["aa:associative-algebra"],
      formula: String.raw`\mathcal H(G, K) = C_c(K\backslash G/K),\quad (f_1 * f_2)(g) = \int_G f_1(h) f_2(h^{-1}g)\, dh`,
      text: "For a reductive group G over a non-archimedean local field F with ring of integers 𝒪 and K = G(𝒪), the algebra of compactly supported functions on G(F) that are invariant under K on both sides, with convolution for the Haar measure giving K volume 1." },
    { id: "lca-group", name: "Locally compact abelian group", kind: "eigenschaft", area: "22B", field: [22], msc: ["22B"], msc5: "22B05", uses: ["locally-compact-group", "gt:abelian-group"], isA: ["locally-compact-group"],
      formula: String.raw`xy = yx`,
      text: "A locally compact Hausdorff topological group whose operation is commutative. Examples: ℝ<sup>n</sup>, ℤ, the circle group 𝕋, finite abelian groups, the p-adic numbers ℚ<sub>p</sub> and the adeles." },
    { id: "circle-group", name: "Circle group", kind: "objekt", area: "22B", field: [22], msc: ["22B"], msc5: "22B05", uses: ["st:complex-number", "topological-group"],
      formula: String.raw`\mathbb T = \{ z \in \mathbb C : |z| = 1 \}`,
      text: "The complex numbers of absolute value 1 with multiplication and the topology of ℂ, a compact abelian group; t ↦ e<sup>2πit</sup> identifies it with ℝ/ℤ." },
  ],
};
