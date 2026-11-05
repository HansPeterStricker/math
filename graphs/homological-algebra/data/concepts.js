// Data of the concept graph (concepts.html): concepts (definitions) of homological algebra, MSC 2020
// 18G. In English. Moved on 4 November 2026 from ../../category-theory/data/concepts.js (user: homological algebra is
// an area of its own); all fields are unchanged, except that `area` is now one of the groupings in `groupAreas` (one sector each; the
// five-character classes of `msc5` grouped) instead of the single class 18G.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). Every concept that a
// definition (name, formula, defining prose) uses explicitly is in `uses`.
//
// References to other folders: category theory "ct:" (abelian categories, exact sequences, functors), commutative algebra "ca:", set theory "st:" and others.
// Prefix for references from other folders: "ha:<id>".
// Sources: Weibel, An Introduction to Homological Algebra (1994); Cartan and Eilenberg, Homological Algebra (1956); Gelfand
// and Manin, Methods of Homological Algebra (2nd ed. 2003). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.HA_CONCEPTS = {
  title: "Concepts of homological algebra",

  areas: {
    basic: "Defined elsewhere, no home folder yet",
    complexes: "18G35 Chain complexes and homology",
    derived: "18G05–18G20 Resolutions, derived functors, Ext and Tor",
    triangulated: "18G40, 18G80 Spectral sequences and derived categories",
  },
  groupAreas: ["complexes", "derived", "triangulated"],

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 18G35 Chain complexes and homology
    { id: "chain-complex", name: "Chain complex", kind: "objekt", area: "complexes", field: [18], msc: ["18G"], msc5: "18G35", uses: ["ct:abelian-category"],
      formula: String.raw`\cdots \to C_{n+1} \xrightarrow{d} C_n \xrightarrow{d} C_{n-1} \to \cdots,\quad d \circ d = 0`,
      text: "A sequence of objects of an abelian category with morphisms whose composite is zero." },
    { id: "chain-map", name: "Chain map", kind: "morphismus", area: "complexes", field: [18], msc: ["18G"], msc5: "18G35", uses: ["chain-complex"],
      formula: String.raw`f_{n-1} \circ d = d \circ f_n`,
      text: "A morphism of chain complexes: morphisms f<sub>n</sub>: C<sub>n</sub> → D<sub>n</sub> that commute with the differentials. Chain maps induce morphisms on homology." },
    { id: "homology", name: "Homology", kind: "invariante", area: "complexes", field: [18, 55], msc: ["18G", "55N"], msc5: "18G35", uses: ["chain-complex", "ct:kernel", "ct:image", "ct:cokernel"],
      formula: String.raw`H_n(C) = \ker d_n / \operatorname{im} d_{n+1}`,
      text: "The kernels of the differentials modulo the images, i.e. the cokernel of the morphism from im d<sub>n+1</sub> to ker d<sub>n</sub>; it measures how far a chain complex is from being exact." },
    { id: "chain-homotopy", name: "Chain homotopy", kind: "morphismus", area: "complexes", field: [18], msc: ["18G"], msc5: "18G35", uses: ["chain-complex", "chain-map"],
      formula: String.raw`f - g = d h + h d`,
      text: "Morphisms h: C<sub>n</sub> → D<sub>n+1</sub> relating two chain maps f and g; homotopic chain maps induce the same map on homology." },
    { id: "mapping-cone", name: "Mapping cone", kind: "konstruktion", area: "complexes", field: [18], msc: ["18G"], msc5: "18G35", uses: ["chain-map", "chain-complex"],
      formula: String.raw`\operatorname{cone}(f)_n = C_{n-1} \oplus D_n,\quad d(c, e) = (-dc,\ f(c) + de)`,
      text: "For a chain map f: C → D the chain complex with terms C<sub>n−1</sub> ⊕ D<sub>n</sub> and the differential shown. It fits into a short exact sequence 0 → D → cone(f) → C[−1] → 0 and gives the distinguished triangles of the homotopy and derived categories." },
    { id: "double-complex", name: "Double complex", kind: "objekt", area: "complexes", field: [18], msc: ["18G"], msc5: "18G35", uses: ["ct:abelian-category", "chain-complex"],
      formula: String.raw`d^{h} d^{h} = 0,\quad d^{v} d^{v} = 0,\quad d^{h} d^{v} + d^{v} d^{h} = 0,\quad \operatorname{Tot}(C)_n = \textstyle\bigoplus_{p+q=n} C_{p,q}`,
      text: "A family of objects C<sub>p,q</sub> of an abelian category with horizontal and vertical differentials that square to zero and anticommute. Its total complex has the sums along the diagonals p + q = n with the differential d<sup>h</sup> + d<sup>v</sup>; it is a chain complex." },

    // ------------------------------------------------------------ 18G05–18G20 Resolutions, derived functors, Ext and Tor
    { id: "projective-object", name: "Projective object", kind: "eigenschaft", area: "derived", field: [18], msc: ["18G"], msc5: "18G05", uses: ["ct:epimorphism", "ct:hom-functor"],
      formula: String.raw`\operatorname{Hom}(P, -) \ \text{preserves epimorphisms}`,
      text: "An object P such that every morphism from P lifts along every epimorphism, i.e. the hom functor Hom(P, −) preserves epimorphisms; free modules are projective." },
    { id: "injective-object", name: "Injective object", kind: "eigenschaft", area: "derived", field: [18], msc: ["18G"], msc5: "18G05", uses: ["ct:monomorphism", "ct:epimorphism", "ct:hom-functor"],
      formula: String.raw`\operatorname{Hom}(-, I) \ \text{turns monomorphisms into epimorphisms}`,
      text: "The dual of a projective object: every morphism into I extends along every monomorphism, i.e. the hom functor Hom(−, I) turns monomorphisms into epimorphisms. ℚ/ℤ is an injective abelian group." },
    { id: "resolution", name: "Resolution", kind: "konstruktion", area: "derived", field: [18], msc: ["18G"], msc5: "18G10", uses: ["ct:exact-sequence", "chain-complex", "injective-object", "projective-object"],
      formula: String.raw`0 \to A \to I^0 \to I^1 \to \cdots \ \text{exact}`,
      text: "An exact sequence replacing an object by a complex of injective (or projective) objects. Unique up to chain homotopy." },
    { id: "derived-functor", name: "Derived functor", kind: "konstruktion", area: "derived", field: [18], msc: ["18G"], msc5: "18G10", uses: ["ct:exact-functor", "resolution", "injective-object", "homology"],
      formula: String.raw`R^i F(A) = H^i\big(F(I^\bullet)\big)`,
      text: "For a left exact functor F the homology of F applied to an injective resolution. The long exact sequence of derived functors measures the failure of exactness; sheaf cohomology is the derived functor of global sections." },
    { id: "delta-functor", name: "δ-functor", kind: "konstruktion", area: "derived", field: [18], msc: ["18G"], msc5: "18G10", uses: ["ct:functor", "ct:additive-category", "ct:exact-sequence", "ct:natural-transformation"],
      formula: String.raw`0 \to T^0 A \to T^0 B \to T^0 C \xrightarrow{\ \delta\ } T^1 A \to \cdots`,
      text: "A cohomological δ-functor between abelian categories: additive functors T<sup>n</sup>, n ≥ 0, with connecting morphisms δ: T<sup>n</sup>C → T<sup>n+1</sup>A for every short exact sequence 0 → A → B → C → 0, natural in the sequence, such that the long sequence shown is exact. It is universal if every other δ-functor receives a unique morphism extending a given natural transformation in degree 0 (Grothendieck 1957)." },
    { id: "acyclic-object", name: "F-acyclic object", kind: "eigenschaft", area: "derived", field: [18], msc: ["18G"], msc5: "18G10", uses: ["derived-functor"],
      formula: String.raw`R^i F(A) = 0 \quad (i > 0)`,
      text: "For a left exact functor F, an object on which all higher right derived functors of F vanish. Injective objects are F-acyclic for every F; flasque sheaves are acyclic for global sections." },
    { id: "ext", name: "Ext", kind: "invariante", area: "derived", field: [18], msc: ["18G"], msc5: "18G15", uses: ["derived-functor", "ct:hom-functor"],
      formula: String.raw`\operatorname{Ext}^i(A, B) = R^i \operatorname{Hom}(A, -)(B)`,
      text: "The derived functors of Hom. Ext<sup>1</sup>(C, A) classifies the extensions 0 → A → B → C → 0." },
    { id: "tor", name: "Tor", kind: "invariante", area: "derived", field: [18], msc: ["18G", "13D"], msc5: "18G15", uses: ["derived-functor", "resolution", "projective-object", "ca:tensor-product"],
      formula: String.raw`\operatorname{Tor}_i(A, B) = L_i(A \otimes -)(B)`,
      text: "The left derived functors of the tensor product, computed with projective resolutions. Tor<sub>1</sub>(ℤ/n, B) is the n-torsion of B." },

    // ------------------------------------------------------------ 18G40, 18G80 Spectral sequences and derived categories
    { id: "spectral-sequence", name: "Spectral sequence", kind: "objekt", area: "triangulated", field: [18], msc: ["18G"], msc5: "18G40", uses: ["ct:abelian-category", "homology"],
      formula: String.raw`d_r : E_r^{p,q} \to E_r^{p+r,\,q-r+1},\quad d_r^2 = 0,\quad E_{r+1} \cong H(E_r, d_r)`,
      text: "A sequence of pages E<sub>r</sub>, r ≥ r<sub>0</sub>, of bigraded objects of an abelian category with differentials d<sub>r</sub> of bidegree (r, 1 − r) such that each page is the cohomology of the previous one. It converges to graded objects H<sup>n</sup>, written E<sub>r</sub> ⇒ H, if the pages become stationary and their limit is the associated graded object of a filtration of H<sup>n</sup>." },
    { id: "quasi-isomorphism", name: "Quasi-isomorphism", kind: "eigenschaft", area: "triangulated", field: [18], msc: ["18G"], msc5: "18G80", uses: ["chain-map", "homology", "ct:isomorphism"],
      formula: String.raw`H_n(f) : H_n(C) \xrightarrow{\ \sim\ } H_n(D)`,
      text: "A chain map that induces isomorphisms on all homology objects." },
    { id: "triangulated-category", name: "Triangulated category", kind: "objekt", area: "triangulated", field: [18], msc: ["18G"], msc5: "18G80", uses: ["ct:additive-category", "ct:functor"], isA: ["ct:additive-category"],
      formula: String.raw`X \to Y \to Z \to X[1]`,
      text: "An additive category with a shift functor and a class of distinguished triangles satisfying Verdier's axioms; it replaces short exact sequences." },
    { id: "derived-category", name: "Derived category", kind: "konstruktion", area: "triangulated", field: [18, 14], msc: ["18G", "14F"], msc5: "18G80", uses: ["ct:category", "chain-complex", "chain-map", "quasi-isomorphism"],
      formula: String.raw`D(\mathcal A) = \operatorname{Ch}(\mathcal A)[\text{qis}^{-1}]`,
      text: "The category of chain complexes and chain maps in which the quasi-isomorphisms are made invertible (Grothendieck and Verdier). Derived functors become functors between derived categories; it is a triangulated category.",
      definitionName: "Localisation at quasi-isomorphisms",
      alternativeDefinitions: [
        { name: "Verdier quotient of the homotopy category", uses: ["chain-complex", "chain-homotopy", "triangulated-category", "quasi-isomorphism"], formula: String.raw`D(\mathcal A) = K(\mathcal A) / K_{\mathrm{acyc}}(\mathcal A)`,
          text: "The Verdier quotient of the homotopy category K(A) (chain complexes, chain maps up to chain homotopy), a triangulated category, by the thick subcategory of acyclic complexes, those quasi-isomorphic to zero." },
      ], },
  ],
};
