// 4 November 2026: all nodes with first class 12F moved to ../../galois-theory/ ("gal:"); the folder now covers 12 without 12F, and 11T.
// Data of the concept graph (concepts.html): concepts (definitions) of field theory and polynomials, MSC 2020 12
// (12D real and complex fields, 12E general field theory, 12F field extensions and Galois theory, 12G homological
// methods, 12H differential algebra, 12J topological fields and valuations, 12L connections with logic) and 11T
// (finite fields and their number-theoretic aspects). In English. Built on 3 November 2026.
//
// Moved here by rule 1 of ../../CLAUDE.md, with their ids: `field` and `algebraic-closure` from
// ../../commutative-algebra/data/concepts.js; `finite-field`, `irreducible-polynomial`, `field-extension`,
// `field-norm`, `field-trace`, `galois-extension`, `abelian-extension`, `radical-extension`, `absolute-galois-group`
// and `absolute-value` from ../../arithmetic-geometry/data/concept-graph.js.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). `area` is the
// three-character MSC class; classes with few concepts share the sector "Smaller classes". Every concept that a
// definition (name, formula, defining prose) uses explicitly is in `uses`. Polynomials are in one variable over a
// field unless said otherwise.
//
// Division of work with the neighbouring folders: rings, ideals, polynomial rings, integral extensions, valuation
// rings and Hensel's lemma belong to commutative algebra ("ca:"); number fields, cyclotomic fields over ℚ, local
// fields, p-adic numbers, Galois cohomology and the Brauer group to algebraic number theory ("ant:"); constructible
// numbers to geometry ("geo:"); symmetric polynomials as a basis of symmetric functions to combinatorics ("co:").
// References: set theory "st:", elementary number theory "ent:", group theory "gt:", commutative algebra "ca:",
// category theory "ct:", topology "top:", analysis "ana:", algebraic geometry "ag:", algebraic number theory "ant:",
// combinatorics "co:", geometry "geo:", and the planned folder logic "lo:".
// Prefix for references from other folders: "ft:<id>".
// Sources: Lang, Algebra (3rd ed. 2002); Jacobson, Basic Algebra I and II (1985, 1989); Bosch, Algebra (8th ed. 2013);
// Milne, Fields and Galois Theory (2022); Lidl and Niederreiter, Finite Fields (2nd ed. 1997); Serre, Topics in
// Galois Theory (1992); Prestel and Delzell, Positive Polynomials (2001); van der Put and Singer, Galois Theory of
// Linear Differential Equations (2003); Engler and Prestel, Valued Fields (2005); Fried and Jarden, Field Arithmetic
// (3rd ed. 2008). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.FT_CONCEPTS = {
  title: "Concepts of field theory",

  areas: {
    basic: "Defined elsewhere, no home folder yet",
    "12D": "12D Real and complex fields",
    "12E": "12E General field theory, polynomials",
    "12G": "12G Homological methods (field theory)",
    "12H": "12H Differential and difference algebra",
    "12J": "12J Topological fields, valuations, ordered fields",
    "12L": "12L Connections with logic",
    "11T": "11T Finite fields and commutative rings (number-theoretic aspects)",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 12E General field theory, polynomials
    { id: "field", name: "Field", kind: "eigenschaft", area: "12E", field: [12, 13], msc: ["12E", "13A"], msc5: "12E99", uses: ["ca:unit"], isA: ["ca:commutative-ring"],
      formula: String.raw`a \ne 0 \Rightarrow a \in R^\times`,
      text: "A commutative ring with 1 ≠ 0 in which every non-zero element is a unit: ℚ, ℝ, ℂ, 𝔽<sub>p</sub>." },
    { id: "subfield", name: "Subfield", kind: "eigenschaft", area: "12E", field: [12], msc: ["12E"], msc5: "12E99", uses: ["field", "st:subset"],
      formula: String.raw`K \subseteq L,\quad 0, 1 \in K,\quad a - b,\ ab,\ a^{-1} \in K`,
      text: "A subset K of a field L that contains 0 and 1 and is closed under subtraction, multiplication and inverses of non-zero elements; with the operations of L it is a field itself." },
    { id: "field-homomorphism", name: "Field homomorphism (embedding)", kind: "morphismus", area: "12E", field: [12], msc: ["12E"], msc5: "12E99", uses: ["field", "ca:ring-homomorphism"], isA: ["ca:ring-homomorphism"],
      formula: String.raw`\sigma : K \to L,\quad \sigma(a + b) = \sigma(a) + \sigma(b),\quad \sigma(ab) = \sigma(a)\sigma(b),\quad \sigma(1) = 1`,
      text: "A ring homomorphism between fields. It is always injective, so it identifies K with a subfield of L; therefore it is also called an embedding. A bijective one is an isomorphism, from a field to itself an automorphism." },
    { id: "prime-field", name: "Prime field", kind: "konstruktion", area: "12E", field: [12], msc: ["12E"], msc5: "12E99", uses: ["field", "subfield", "st:intersection", "ca:characteristic"],
      formula: String.raw`\bigcap_{K' \subseteq K} K' \;\cong\; \mathbb Q \ \text{or}\ \mathbb F_p`,
      text: "The smallest subfield of a field K, the intersection of all its subfields. It is isomorphic to ℚ if K has characteristic 0 and to 𝔽<sub>p</sub> = ℤ/pℤ if K has characteristic p." },
    { id: "polynomial-degree", name: "Degree of a polynomial", kind: "invariante", area: "12E", field: [12, 13], msc: ["12E", "13B"], msc5: "12E05", uses: ["ca:polynomial-ring", "ent:natural-number"],
      formula: String.raw`\deg\Big(\sum_{i=0}^n a_i x^i\Big) = n,\quad a_n \ne 0`,
      text: "The largest exponent n with non-zero coefficient a<sub>n</sub>, the leading coefficient; the polynomial is monic if a<sub>n</sub> = 1. The zero polynomial has degree −∞. Over a field deg(fg) = deg f + deg g." },
    { id: "root-of-polynomial", name: "Root of a polynomial", kind: "eigenschaft", area: "12E", field: [12], msc: ["12E"], msc5: "12E05", uses: ["ca:polynomial-ring", "field"],
      formula: String.raw`f(\alpha) = 0`,
      text: "An element α of a field L containing the coefficients of f such that substituting α for x gives 0. α is a root exactly when the linear polynomial x − α divides f in L[x]." },
    { id: "formal-derivative", name: "Formal derivative", kind: "konstruktion", area: "12E", field: [12], msc: ["12E"], msc5: "12E05", uses: ["ca:polynomial-ring"],
      formula: String.raw`\Big(\sum_i a_i x^i\Big)' = \sum_{i \ge 1} i\, a_i x^{i-1}`,
      text: "The polynomial obtained by differentiating term by term, without limits. It is additive and satisfies the product rule (fg)′ = f′g + fg′. In characteristic p the derivative of x<sup>p</sup> is 0." },
    { id: "multiple-root", name: "Multiple root", kind: "eigenschaft", area: "12E", field: [12], msc: ["12E"], msc5: "12E05", uses: ["root-of-polynomial", "ca:polynomial-ring"],
      formula: String.raw`(x - \alpha)^2 \mid f`,
      text: "A root α of f whose square (x − α)<sup>2</sup> divides f; its multiplicity is the largest m with (x − α)<sup>m</sup> dividing f. A root is multiple exactly when it is also a root of the formal derivative f′." },
    { id: "irreducible-polynomial", name: "Irreducible polynomial", kind: "eigenschaft", area: "12E", field: [12], msc: ["12E"], msc5: "12E05", uses: ["ca:polynomial-ring", "ca:irreducible-element", "field", "polynomial-degree"], isA: ["ca:irreducible-element"],
      formula: String.raw`f = gh \Rightarrow \deg g = 0 \ \text{or}\ \deg h = 0`,
      text: "An irreducible element of the polynomial ring K[x] over a field K: a non-constant polynomial that is not a product of two polynomials of smaller degree." },
    { id: "polynomial-content", name: "Content and primitive polynomial", kind: "invariante", area: "12E", field: [12, 13], msc: ["12E", "13F"], msc5: "12E05", uses: ["ca:polynomial-ring", "ca:ufd", "ent:gcd"],
      formula: String.raw`c(f) = \gcd(a_0, \dots, a_n)`,
      text: "For a polynomial f with coefficients in a factorial ring R (such as ℤ), the greatest common divisor of its coefficients, defined up to a unit; f is primitive if its content is 1. Every non-zero f is c(f) times a primitive polynomial." },
    { id: "elementary-symmetric-polynomial", name: "Elementary symmetric polynomial", kind: "konstruktion", area: "12E", field: [12, 5], msc: ["12E", "05E"], msc5: "12E05", uses: ["ca:polynomial-ring", "co:symmetric-polynomial"], isA: ["co:symmetric-polynomial"],
      formula: String.raw`\prod_{i=1}^n (t - x_i) = t^n - s_1 t^{n-1} + s_2 t^{n-2} - \dots + (-1)^n s_n`,
      text: "The symmetric polynomial s<sub>k</sub> in x<sub>1</sub>, …, x<sub>n</sub> that is the sum of all products of k distinct variables; up to sign, s<sub>k</sub> is a coefficient of the polynomial with roots x<sub>1</sub>, …, x<sub>n</sub> (Vieta's formulas)." },
    { id: "polynomial-discriminant", name: "Discriminant of a polynomial", kind: "invariante", area: "12E", field: [12], msc: ["12E"], msc5: "12E05", uses: ["root-of-polynomial", "elementary-symmetric-polynomial", "gal:splitting-field"],
      formula: String.raw`\operatorname{disc}(f) = \prod_{i < j} (\alpha_i - \alpha_j)^2`,
      text: "For a monic polynomial f with roots α<sub>1</sub>, …, α<sub>n</sub> in a splitting field, the product of the squared differences of the roots. It is symmetric in the roots, hence a polynomial in the coefficients of f, and vanishes exactly when f has a multiple root. For x<sup>2</sup> + bx + c it is b<sup>2</sup> − 4c." },
    { id: "frobenius-endomorphism", name: "Frobenius endomorphism", kind: "morphismus", area: "12E", field: [12], msc: ["12E"], msc5: "12E20", uses: ["field", "ca:characteristic", "field-homomorphism", "ent:prime-number"], isA: ["field-homomorphism"],
      formula: String.raw`\varphi(a) = a^p`,
      text: "For a field K of prime characteristic p, the map a ↦ a<sup>p</sup>. It is a field homomorphism of K to itself because (a + b)<sup>p</sup> = a<sup>p</sup> + b<sup>p</sup>." },
    { id: "finite-field", name: "Finite field", kind: "eigenschaft", area: "12E", field: [12, 11], msc: ["12E", "11T"], msc5: "12E20", uses: ["field", "st:finite-set", "ent:prime-number"], isA: ["field"],
      formula: String.raw`\mathbb F_q,\quad q = p^n`,
      text: "A field with finitely many elements, written 𝔽<sub>q</sub> with q the number of elements. q is always a power p<sup>n</sup> of a prime p, and for every prime power there is exactly one finite field up to isomorphism (Galois)." },
    { id: "hilbertian-field", name: "Hilbertian field", kind: "eigenschaft", area: "12E", field: [12], msc: ["12E"], msc5: "12E25", uses: ["field", "irreducible-polynomial", "ca:polynomial-ring", "st:subset"], isA: ["field"],
      formula: String.raw`f(t, x) \ \text{irreducible} \;\Rightarrow\; f(a, x) \ \text{irreducible for many } a \in K`,
      text: "A field K such that for every polynomial f(t, x) in two variables that is irreducible over K, the polynomial f(a, x) in x stays irreducible for all a in a subset of K that is not thin; in particular for infinitely many a. ℚ and every number field are Hilbertian (Hilbert's irreducibility theorem); finite and algebraically closed fields are not." },
    { id: "c1-field", name: "Quasi-algebraically closed field (C<sub>1</sub>)", kind: "eigenschaft", area: "12E", field: [12], msc: ["12E"], msc5: "12E99", uses: ["field", "ca:polynomial-ring", "root-of-polynomial", "polynomial-degree"], isA: ["field"],
      formula: String.raw`n > d \;\Rightarrow\; f(x_1, \dots, x_n) = 0 \ \text{has a non-zero solution}`,
      text: "A field K over which every homogeneous polynomial of degree d in n > d variables has a non-trivial zero in K<sup>n</sup>; more generally C<sub>i</sub> if this holds for n > d<sup>i</sup>. Algebraically closed fields are C<sub>0</sub>; finite fields (Chevalley) and function fields of curves over algebraically closed fields (Tsen) are C<sub>1</sub>." },

    // ------------------------------------------------------------ 12D Real and complex fields
    { id: "formally-real-field", name: "Formally real field", kind: "eigenschaft", area: "12D", field: [12], msc: ["12D"], msc5: "12D15", uses: ["field", "sum-of-squares"], isA: ["field"],
      formula: String.raw`-1 \ne a_1^2 + \dots + a_n^2`,
      text: "A field in which −1 is not a sum of squares; by Artin–Schreier these are exactly the fields that admit an ordering. ℚ and ℝ are formally real, ℂ and finite fields are not." },
    { id: "real-closed-field", name: "Real closed field", kind: "eigenschaft", area: "12D", field: [12], msc: ["12D"], msc5: "12D15", uses: ["formally-real-field", "gal:algebraic-extension"], isA: ["formally-real-field"],
      formula: String.raw`R \subsetneq L \ \text{algebraic} \;\Rightarrow\; L \ \text{not formally real}`,
      text: "A formally real field without proper formally real algebraic extensions. Equivalently, it has an ordering in which the positive elements are exactly the non-zero squares, and every polynomial of odd degree has a root; or R(√−1) is algebraically closed and R ≠ R(√−1). Examples: ℝ, the real algebraic numbers." },
    { id: "real-closure", name: "Real closure", kind: "konstruktion", area: "12D", field: [12], msc: ["12D"], msc5: "12D15", uses: ["real-closed-field", "ordered-field", "gal:algebraic-extension"],
      formula: String.raw`(K, \le) \subseteq R,\quad R \ \text{real closed, algebraic over}\ K`,
      text: "For an ordered field K, a real closed field R algebraic over K whose unique ordering extends the ordering of K. It exists and is unique up to a unique isomorphism over K (Artin–Schreier)." },
    { id: "sum-of-squares", name: "Sum of squares", kind: "eigenschaft", area: "12D", field: [12], msc: ["12D"], msc5: "12D15", uses: ["field", "ent:natural-number"],
      formula: String.raw`a = a_1^2 + \dots + a_n^2`,
      text: "An element of a field (or ring) that is a finite sum of squares. A real polynomial that is a sum of squares of polynomials is non-negative on ℝ<sup>n</sup>; the converse fails for polynomials (Hilbert 1888) but holds for rational functions (Artin 1927)." },
    { id: "sturm-sequence", name: "Sturm sequence", kind: "konstruktion", area: "12D", field: [12], msc: ["12D"], msc5: "12D10", uses: ["formal-derivative", "ca:polynomial-ring", "st:real-number"],
      formula: String.raw`f_0 = f,\quad f_1 = f',\quad f_{i+1} = -(f_{i-1} \bmod f_i)`,
      text: "For a real polynomial f, the sequence of polynomials f, f′ and then the negatives of the successive remainders of the Euclidean algorithm. The number of sign changes in the values f<sub>i</sub>(a) is denoted V(a)." },

    // ------------------------------------------------------------ 12G Homological methods
    { id: "crossed-homomorphism", name: "Crossed homomorphism (1-cocycle)", kind: "morphismus", area: "12G", field: [12, 20], msc: ["12G", "20J"], msc5: "12G05", uses: ["gt:group-action", "gt:abelian-group", "st:map"],
      formula: String.raw`a_{\sigma\tau} = a_\sigma\, \sigma(a_\tau)`,
      text: "For a group G acting on an abelian group A (written multiplicatively), a map σ ↦ a<sub>σ</sub> from G to A satisfying the cocycle condition shown. Those of the form a<sub>σ</sub> = σ(b)/b are coboundaries; the quotient is the first cohomology group H<sup>1</sup>(G, A)." },
    { id: "cohomological-dimension", name: "Cohomological dimension", kind: "invariante", area: "12G", field: [12], msc: ["12G"], msc5: "12G10", uses: ["gal:absolute-galois-group", "ant:galois-cohomology", "ent:natural-number"],
      formula: String.raw`\operatorname{cd} G_K = \min\{ n : H^{m}(G_K, A) = 0 \ \text{for}\ m > n \}`,
      text: "For a field K, the smallest n such that the Galois cohomology H<sup>m</sup>(G<sub>K</sub>, A) vanishes for all m > n and all finite torsion modules A of the absolute Galois group. Finite fields and C<sub>1</sub> fields have cohomological dimension at most 1, p-adic and totally imaginary number fields 2." },

    // ------------------------------------------------------------ 12H Differential algebra
    { id: "differential-field", name: "Differential field", kind: "objekt", area: "12H", field: [12], msc: ["12H"], msc5: "12H05", uses: ["field", "ca:derivation"],
      formula: String.raw`(K, \partial),\quad \partial(a + b) = \partial a + \partial b,\quad \partial(ab) = a\, \partial b + b\, \partial a`,
      text: "A field K with a derivation ∂, an additive map satisfying the Leibniz rule. Its constants, the a with ∂a = 0, form a subfield. Example: ℂ(x) with ∂ = d/dx." },
    { id: "elementary-extension", name: "Elementary and Liouvillian extension", kind: "eigenschaft", area: "12H", field: [12], msc: ["12H"], msc5: "12H05", uses: ["differential-field", "gal:algebraic-element", "gal:generated-extension", "ana:exponential-function", "ana:logarithm"],
      formula: String.raw`\partial t = \frac{\partial a}{a} \ \ (\log),\qquad \frac{\partial t}{t} = \partial a \ \ (\exp)`,
      text: "A tower of differential field extensions, each obtained by adjoining an element t that is algebraic, a logarithm (∂t = ∂a/a) or an exponential (∂t/t = ∂a) of an element a of the previous field. Liouvillian extensions also allow integrals (∂t = a). The elementary functions of calculus lie in elementary extensions of ℂ(x)." },
    { id: "picard-vessiot-extension", name: "Picard–Vessiot extension", kind: "konstruktion", area: "12H", field: [12], msc: ["12H"], msc5: "12H05", uses: ["differential-field", "gal:generated-extension", "la:vector-space-dimension"],
      formula: String.raw`L = K\langle y_1, \dots, y_n \rangle,\quad L(y) = y^{(n)} + a_{n-1} y^{(n-1)} + \dots + a_0 y = 0`,
      text: "For a linear differential equation of order n over a differential field K, a differential extension L generated by n solutions that are linearly independent over the constants, and with no new constants. It is the analogue of the splitting field." },
    { id: "differential-galois-group", name: "Differential Galois group", kind: "invariante", area: "12H", field: [12], msc: ["12H"], msc5: "12H05", uses: ["picard-vessiot-extension", "field-homomorphism", "gt:general-linear-group"],
      formula: String.raw`\operatorname{Gal}_\partial(L/K) \subseteq \operatorname{GL}_n(C)`,
      text: "The group of field automorphisms of a Picard–Vessiot extension L/K that fix K and commute with the derivation. It acts linearly on the n-dimensional space of solutions and is a linear algebraic group over the field C of constants." },

    // ------------------------------------------------------------ 12J Topological fields, valuations, ordered fields
    { id: "absolute-value", name: "Absolute value", kind: "invariante", area: "12J", field: [12, 11], msc: ["12J", "11R"], msc5: "12J10", uses: ["field", "st:real-number", "st:map"],
      formula: String.raw`|xy| = |x|\,|y|,\quad |x + y| \le |x| + |y|`,
      text: "A map x ↦ |x| from a field K to the non-negative real numbers with |x| = 0 only for x = 0 that is multiplicative and satisfies the triangle inequality; non-archimedean if even |x + y| ≤ max(|x|, |y|). Two absolute values are equivalent if one is a positive power of the other (they define the same topology). Example: |x|<sub>p</sub> = p<sup>−v<sub>p</sub>(x)</sup> on ℚ." },
    { id: "complete-valued-field", name: "Completion of a valued field", kind: "konstruktion", area: "12J", field: [12], msc: ["12J"], msc5: "12J10", uses: ["absolute-value", "top:cauchy-sequence", "st:equivalence-class"],
      formula: String.raw`\hat K = \{\text{Cauchy sequences}\} / \{\text{null sequences}\}`,
      text: "For a field K with an absolute value, the field of Cauchy sequences modulo sequences tending to 0, with the extended absolute value; it is complete, and K is dense in it. ℝ is the completion of ℚ for the usual absolute value, ℚ<sub>p</sub> for the p-adic one." },
    { id: "krull-valuation", name: "Valuation (Krull)", kind: "morphismus", area: "12J", field: [12], msc: ["12J"], msc5: "12J20", uses: ["field", "gt:abelian-group", "st:total-order", "gt:homomorphism"],
      formula: String.raw`v : K^\times \to \Gamma,\quad v(xy) = v(x) + v(y),\quad v(x + y) \ge \min(v(x), v(y))`,
      text: "A surjective group homomorphism v from the multiplicative group of a field K onto a totally ordered abelian group Γ, the value group, with v(x + y) ≥ min(v(x), v(y)). Its valuation ring consists of 0 and the x with v(x) ≥ 0, its residue field is that ring modulo the x with v(x) > 0. For Γ = ℤ it is a discrete valuation." },
    { id: "newton-polygon", name: "Newton polygon", kind: "konstruktion", area: "12J", field: [12], msc: ["12J"], msc5: "12J25", uses: ["krull-valuation", "ca:polynomial-ring", "st:real-number"],
      formula: String.raw`\text{lower convex hull of } \{ (i, v(a_i)) \}`,
      text: "For a polynomial Σ a<sub>i</sub>x<sup>i</sup> over a field with a valuation v, the lower boundary of the convex hull of the points (i, v(a<sub>i</sub>)) in the plane. Its slopes and their lengths give the valuations of the roots and how many roots have each valuation." },
    { id: "ordered-field", name: "Ordered field", kind: "objekt", area: "12J", field: [12], msc: ["12J"], msc5: "12J15", uses: ["field", "st:total-order"],
      formula: String.raw`a \le b \Rightarrow a + c \le b + c,\quad 0 \le a,\ 0 \le b \Rightarrow 0 \le ab`,
      text: "A field with a total order compatible with addition and with multiplication by non-negative elements. ℚ and ℝ are ordered fields; squares are non-negative in every ordering." },

    // ------------------------------------------------------------ 12L Connections with logic
    { id: "pseudo-finite-field", name: "Pseudo-finite field", kind: "eigenschaft", area: "12L", field: [12, 3], msc: ["12L", "03C"], msc5: "12L12", uses: ["field", "finite-field", "mt:model", "lo:formula"], isA: ["field"],
      formula: String.raw`K \equiv \textstyle\prod_{\mathcal U} \mathbb F_{q_i},\quad |K| = \infty`,
      text: "An infinite field that satisfies every first-order sentence true in all finite fields. Ax (1968) characterised them as the perfect fields with exactly one extension of each degree on which every absolutely irreducible variety has a point; non-principal ultraproducts of finite fields are examples." },

    // ------------------------------------------------------------ 11T Finite fields: number-theoretic aspects
    { id: "primitive-polynomial", name: "Primitive polynomial over a finite field", kind: "eigenschaft", area: "11T", field: [11, 12], msc: ["11T"], msc5: "11T06", uses: ["irreducible-polynomial", "finite-field", "gal:minimal-polynomial", "gt:cyclic-group"], isA: ["irreducible-polynomial"],
      formula: String.raw`\langle \alpha \rangle = \mathbb F_{q^n}^\times,\quad m_\alpha = f`,
      text: "A monic irreducible polynomial f of degree n over 𝔽<sub>q</sub> whose roots generate the cyclic multiplicative group of 𝔽<sub>q<sup>n</sup></sub>. Such polynomials drive linear feedback shift registers of maximal period q<sup>n</sup> − 1. Not to be confused with a primitive polynomial over ℤ (content 1)." },
    { id: "multiplicative-character", name: "Multiplicative character of a finite field", kind: "morphismus", area: "11T", field: [11], msc: ["11T"], msc5: "11T24", uses: ["finite-field", "gt:homomorphism", "st:complex-number"],
      formula: String.raw`\chi : \mathbb F_q^\times \to \mathbb C^\times,\quad \chi(ab) = \chi(a)\chi(b)`,
      text: "A group homomorphism from the multiplicative group of 𝔽<sub>q</sub> to the non-zero complex numbers, extended by χ(0) = 0 for non-trivial χ. The Legendre symbol is the character of order 2 of 𝔽<sub>p</sub>." },
    { id: "additive-character", name: "Additive character of a finite field", kind: "morphismus", area: "11T", field: [11], msc: ["11T"], msc5: "11T24", uses: ["finite-field", "gt:homomorphism", "st:complex-number", "gal:field-trace"],
      formula: String.raw`\psi(a) = e^{2\pi i \operatorname{Tr}(a)/p}`,
      text: "A group homomorphism from the additive group of 𝔽<sub>q</sub> to the complex numbers of absolute value 1. Every one has the form a ↦ ψ(ba) for the canonical character ψ shown, built from the trace to 𝔽<sub>p</sub>." },
    { id: "finite-field-gauss-sum", name: "Gauss sum over a finite field", kind: "konstruktion", area: "11T", field: [11], msc: ["11T"], msc5: "11T24", uses: ["multiplicative-character", "additive-character"],
      formula: String.raw`g(\chi, \psi) = \sum_{a \in \mathbb F_q^\times} \chi(a)\, \psi(a)`,
      text: "The sum of the products of a multiplicative character χ and an additive character ψ over the non-zero elements of 𝔽<sub>q</sub>; the finite Fourier coefficient of χ. For the quadratic character of 𝔽<sub>p</sub> it is Gauss's quadratic Gauss sum." },
    { id: "jacobi-sum", name: "Jacobi sum", kind: "konstruktion", area: "11T", field: [11], msc: ["11T"], msc5: "11T24", uses: ["multiplicative-character"],
      formula: String.raw`J(\chi_1, \chi_2) = \sum_{a + b = 1} \chi_1(a)\, \chi_2(b)`,
      text: "For two multiplicative characters of 𝔽<sub>q</sub>, the sum of χ<sub>1</sub>(a)χ<sub>2</sub>(b) over all pairs a, b in 𝔽<sub>q</sub> with a + b = 1. It counts points on curves such as x<sup>n</sup> + y<sup>n</sup> = 1 over 𝔽<sub>q</sub>." },
  ],
};
