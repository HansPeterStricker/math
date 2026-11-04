// Data of the concept graph (concepts.html): concepts (definitions) of global analysis, MSC 2020 58 without 58A (smooth
// manifolds and differential forms, in ../../topology/) and without 58J (index theory, in ../../differential-equations/):
// 58B (infinite-dimensional manifolds), 58C (calculus on manifolds), 58D (spaces of maps), 58E (variational problems
// on manifolds: Morse theory, Lusternik–Schnirelmann, Palais–Smale, closed geodesics, Floer theory) and 58K
// (singularities of smooth maps). In English. Built on 3 November 2026.
//
// Moved here by rule 1 of ../../CLAUDE.md, with its id: `palais-smale-condition` from ../../calculus-of-variations/
// (there under area "basic"). Smooth manifolds, tangent spaces, regular values and Morse functions stay in topology
// (57R, 58A) and are referenced with "top:".
//
// Same model as ../../topology/data/concepts.js: `area` is the three-character MSC class; "basic" holds placeholders for
// concepts whose home folder exists but does not have them yet (Fréchet space 46A, jet bundle 58A, residual set 54E,
// Hamiltonian diffeomorphism 53D); they move there when the folders are merged.
// References: "top:" (topology), "ana:" (analysis), "geo:" (geometry), "la:" (linear algebra), "cv:" (calculus of
// variations: Fréchet derivative, functional), "ds:" (dynamical systems: flows, stable manifolds), "de:" (Sobolev
// spaces), "ct:" (chain complexes), "ca:" (ideals), "st:", "gt:".
// Prefix for references from other folders: "gan:<id>".
// Sources: Lang, Fundamentals of Differential Geometry (1999); Hamilton, The inverse function theorem of Nash and Moser
// (Bull. AMS 1982); Palais, Morse theory on Hilbert manifolds (1963); Milnor, Morse Theory (1963); Klingenberg, Lectures
// on Closed Geodesics (1978); Mawhin and Willem, Critical Point Theory and Hamiltonian Systems (1989); Cornea, Lupton,
// Oprea and Tanré, Lusternik–Schnirelmann Category (2003); Golubitsky and Guillemin, Stable Mappings and Their
// Singularities (1973); Arnold, Gusein-Zade and Varchenko, Singularities of Differentiable Maps I (1985); McDuff and
// Salamon, J-holomorphic Curves and Symplectic Topology (2004). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.GAN_CONCEPTS = {
  title: "Concepts of global analysis",

  areas: {
    basic: "Defined elsewhere, not yet in the home folder",
    "58B": "58B Infinite-dimensional manifolds",
    "58C": "58C Calculus on manifolds: immersions, submersions, transversality",
    "58D": "58D Spaces and manifolds of mappings",
    "58E": "58E Variational problems on manifolds: critical point theory, Morse theory, closed geodesics",
    "58K": "58K Singularities of smooth mappings",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 58B Infinite-dimensional manifolds
    { id: "banach-manifold", name: "Banach manifold", kind: "objekt", area: "58B", field: [58], msc: ["58B"], msc5: "58B10", uses: ["ana:banach-space", "top:hausdorff-space", "top:homeomorphism", "ana:frechet-derivative"],
      formula: String.raw`\varphi_i : U_i \xrightarrow{\ \sim\ } \varphi_i(U_i) \subseteq E,\quad \varphi_j \circ \varphi_i^{-1} \in C^\infty`,
      text: "A Hausdorff space covered by open sets U<sub>i</sub> with homeomorphisms φ<sub>i</sub> onto open subsets of a Banach space E whose transition maps are smooth, that is, infinitely often Fréchet differentiable. Tangent spaces are copies of E; finite-dimensional manifolds are the case E = ℝ<sup>n</sup>." },
    { id: "hilbert-manifold", name: "Hilbert manifold", kind: "objekt", area: "58B", field: [58], msc: ["58B"], msc5: "58B10", uses: ["banach-manifold", "ana:hilbert-space"], isA: ["banach-manifold"],
      formula: String.raw`\varphi_i(U_i) \subseteq H`,
      text: "A Banach manifold modelled on a Hilbert space H. Hilbert manifolds have smooth partitions of unity and Riemannian metrics when they are separable, so gradients of functions exist; spaces of H<sup>1</sup> paths and loops in a Riemannian manifold are the main examples." },
    { id: "frechet-manifold", name: "Fréchet manifold", kind: "objekt", area: "58B", field: [58], msc: ["58B"], msc5: "58B10", uses: ["ana:frechet-space", "top:hausdorff-space", "top:homeomorphism"],
      formula: String.raw`\varphi_i(U_i) \subseteq F \text{ Fréchet},\quad \varphi_j \circ \varphi_i^{-1} \in C^\infty`,
      text: "A Hausdorff space with charts onto open subsets of a Fréchet space F whose transition maps are smooth in the sense of directional derivatives that are continuous jointly in point and direction. The space of smooth maps between manifolds and the diffeomorphism group of a compact manifold are Fréchet manifolds; the inverse function theorem fails on them." },
    { id: "tame-frechet-space", name: "Tame Fréchet space", kind: "eigenschaft", area: "58B", field: [58, 46], msc: ["58B"], msc5: "58B10", uses: ["ana:frechet-space", "ana:banach-space"],
      formula: String.raw`\|x\|_0 \le \|x\|_1 \le \|x\|_2 \le \dots,\quad F \oplus G \cong \Sigma(B),\quad \|(x_k)\|_n = \textstyle\sum_k e^{nk} \|x_k\|_B`,
      text: "A Fréchet space with an increasing sequence of norms (a grading) that is, with tame maps in both directions, a direct summand of the space Σ(B) of exponentially decreasing sequences in a Banach space B with the norms shown. C<sup>∞</sup>(M) of a compact manifold is tame (Hamilton)." },
    { id: "tame-map", name: "Smooth tame map", kind: "morphismus", area: "58B", field: [58], msc: ["58B"], msc5: "58B10", uses: ["tame-frechet-space", "st:map"],
      formula: String.raw`\|P(f)\|_n \le C_n \big(1 + \|f\|_{n + r}\big)`,
      text: "A map P between tame Fréchet spaces is tame if near each point it satisfies estimates of the form shown with a fixed loss of r derivatives and constants C<sub>n</sub>; it is smooth tame if it and all its derivatives are tame. Nonlinear differential operators are smooth tame." },
    { id: "fredholm-map", name: "Fredholm map", kind: "morphismus", area: "58B", field: [58, 47], msc: ["58B"], msc5: "58B15", uses: ["banach-manifold", "ana:fredholm-operator", "ana:frechet-derivative"],
      formula: String.raw`\operatorname{ind} f = \dim \ker df_x - \dim \operatorname{coker} df_x`,
      text: "A smooth map f : X → Y between Banach manifolds whose differential df<sub>x</sub> is a Fredholm operator (finite-dimensional kernel and cokernel, closed image) at every point. On a connected X the index is constant; it is the expected dimension of the preimage of a regular value." },

    // ------------------------------------------------------------ 58C Calculus on manifolds
    { id: "submersion", name: "Submersion", kind: "morphismus", area: "58C", field: [58, 57], msc: ["58C", "57R"], msc5: "58C25", uses: ["top:smooth-map", "top:differential"], isA: ["top:smooth-map"],
      formula: String.raw`df_p : T_p M \to T_{f(p)} N \text{ surjective}`,
      text: "A smooth map whose differential is surjective at every point; every point of the target is a regular value, and locally the map is a projection ℝ<sup>m</sup> → ℝ<sup>n</sup>." },

    // ------------------------------------------------------------ 58D Spaces of maps
    { id: "whitney-topology", name: "Whitney C^∞ topology", kind: "konstruktion", area: "58D", field: [58], msc: ["58D"], msc5: "58D15", uses: ["top:jet-bundle", "top:smooth-map", "top:topological-space"],
      formula: String.raw`M(U) = \{ f \in C^\infty(M, N) : j^k f(M) \subseteq U \}`,
      text: "The topology on the set C<sup>∞</sup>(M, N) of smooth maps generated by the sets M(U), for open subsets U of the jet bundles J<sup>k</sup>(M, N) and all k. Two maps are close if their derivatives up to order k are close everywhere, with a tolerance that may shrink towards infinity; for compact M it is the C<sup>∞</sup> topology of uniform convergence of all derivatives." },
    { id: "mapping-space", name: "Manifold of smooth maps", kind: "objekt", area: "58D", field: [58], msc: ["58D"], msc5: "58D15", uses: ["frechet-manifold", "top:smooth-map", "top:compact-space"],
      formula: String.raw`C^\infty(M, N),\quad T_f C^\infty(M, N) = \Gamma(f^* TN)`,
      text: "For a compact manifold M and a manifold N, the set C<sup>∞</sup>(M, N) of smooth maps with the structure of a Fréchet manifold; the tangent space at f is the space of smooth vector fields along f, that is, sections of the pulled-back tangent bundle." },
    { id: "diffeomorphism-group", name: "Diffeomorphism group", kind: "objekt", area: "58D", field: [58], msc: ["58D"], msc5: "58D05", uses: ["mapping-space", "top:diffeomorphism", "gt:group"],
      formula: String.raw`\operatorname{Diff}(M) \subseteq C^\infty(M, M),\quad \mathfrak{g} = \mathfrak X(M)`,
      text: "The group Diff(M) of diffeomorphisms of a compact manifold M under composition, an open subset of C<sup>∞</sup>(M, M) and a Fréchet Lie group; its Lie algebra is the space of vector fields with the negative of the Lie bracket." },
    { id: "path-space", name: "Hilbert manifold of paths", kind: "objekt", area: "58D", field: [58], msc: ["58D"], msc5: "58D15", uses: ["hilbert-manifold", "ana:sobolev-space", "geo:riemannian-manifold"],
      formula: String.raw`\Omega_{pq} = \{ \gamma \in H^1([0, 1], M) : \gamma(0) = p,\ \gamma(1) = q \}`,
      text: "For a Riemannian manifold M and points p, q, the absolutely continuous paths γ : [0, 1] → M from p to q with square-integrable velocity (Sobolev class H<sup>1</sup>), a Hilbert manifold. It is homotopy equivalent to the space of continuous paths, so its topology is that of the loop space ΩM." },
    { id: "free-loop-space", name: "Free loop space", kind: "objekt", area: "58D", field: [58], msc: ["58D"], msc5: "58D15", uses: ["hilbert-manifold", "ana:sobolev-space", "top:sphere"],
      formula: String.raw`\Lambda M = H^1(S^1, M)`,
      text: "The Hilbert manifold of closed loops γ : S<sup>1</sup> → M of Sobolev class H<sup>1</sup> in a manifold M, without a base point. The circle acts on it by rotating the parameter; closed geodesics and periodic orbits of Hamiltonian systems are critical points of functionals on it." },

    // ------------------------------------------------------------ 58E Variational problems on manifolds
    { id: "hessian", name: "Hessian at a critical point", kind: "konstruktion", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["critical-point", "la:symmetric-bilinear-form", "top:tangent-space"],
      formula: String.raw`d^2 f_p(v, w) = \frac{\partial^2}{\partial s\, \partial t} f\big(c(s, t)\big)\Big|_{0},\quad \partial_s c = v,\ \partial_t c = w`,
      text: "At a critical point p of a smooth function f the second derivative in charts is a symmetric bilinear form on the tangent space T<sub>p</sub>M that does not depend on the chart, because the first derivative vanishes. On a Hilbert manifold it is represented by a bounded self-adjoint operator." },
    { id: "nondegenerate-critical-point", name: "Non-degenerate critical point", kind: "eigenschaft", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["hessian", "la:nondegenerate-form"],
      formula: String.raw`\ker d^2 f_p = 0`,
      text: "A critical point whose Hessian is non-degenerate; on a Hilbert manifold one asks that the self-adjoint operator of the Hessian is invertible. Non-degenerate critical points are isolated." },
    { id: "morse-index", name: "Morse index", kind: "invariante", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["hessian", "la:vector-space-dimension"],
      formula: String.raw`\operatorname{ind}(p) = \max \{ \dim V : d^2 f_p|_{V} \text{ negative definite} \}`,
      text: "The largest dimension of a subspace of T<sub>p</sub>M on which the Hessian at the critical point p is negative definite, possibly infinite on a Hilbert manifold. It counts the independent directions in which f decreases to second order." },
    { id: "morse-bott-function", name: "Morse–Bott function", kind: "eigenschaft", area: "58E", field: [58, 57], msc: ["58E"], msc5: "58E05", uses: ["critical-point", "hessian", "top:submanifold"],
      formula: String.raw`\ker d^2 f_p = T_p C`,
      text: "A smooth function whose critical set is a union of submanifolds C such that at every critical point the kernel of the Hessian is exactly the tangent space of C: the function is non-degenerate in the directions normal to C. The energy on paths in a compact Lie group or a symmetric space is Morse–Bott." },
    { id: "gradient-flow", name: "Negative gradient flow", kind: "konstruktion", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["geo:riemannian-manifold", "top:vector-field", "ds:flow-of-vector-field"],
      formula: String.raw`\dot x = -\nabla f(x),\quad g(\nabla f, v) = df(v)`,
      text: "For a smooth function f on a Riemannian manifold, the flow of the vector field −∇f, the negative gradient defined by the metric g. Along its flow lines f decreases, strictly away from critical points; the stable and unstable manifolds of a critical point consist of the flow lines that converge to it." },
    { id: "pseudo-gradient-vector-field", name: "Pseudo-gradient vector field", kind: "konstruktion", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["banach-manifold", "ana:frechet-derivative", "ana:lipschitz-continuity"],
      formula: String.raw`\|V(u)\| \le 2 \|DJ(u)\|,\quad DJ(u)\, V(u) \ge \|DJ(u)\|^2`,
      text: "For a continuously differentiable functional J on a Banach manifold, a locally Lipschitz vector field V on the set of regular points satisfying the two inequalities shown (Palais 1966). It replaces the gradient where there is no inner product; its flow decreases J at a definite rate." },
    { id: "palais-smale-sequence", name: "Palais–Smale sequence", kind: "eigenschaft", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["cv:functional", "ana:frechet-derivative", "ana:sequence-limit", "ana:dual-space"],
      formula: String.raw`J(u_n) \to c,\quad \|DJ(u_n)\|_{X^*} \to 0`,
      text: "A sequence (u<sub>n</sub>) in a Banach space (or Banach manifold) along which a continuously differentiable functional J converges to a value c and its derivative tends to 0 in the dual space: a sequence of almost critical points at level c." },
    { id: "palais-smale-condition", name: "Palais–Smale condition", kind: "eigenschaft", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["palais-smale-sequence", "ana:banach-space", "cv:functional"],
      formula: String.raw`J(u_n) \text{ bounded},\quad DJ(u_n) \to 0 \;\Rightarrow\; (u_n) \text{ has a convergent subsequence}`,
      text: "A continuously Fréchet differentiable functional J on a Banach space satisfies the Palais–Smale condition if every sequence (u<sub>n</sub>) along which J is bounded and DJ tends to 0 in the dual space has a convergent subsequence; the local form (PS)<sub>c</sub> asks this only for Palais–Smale sequences at level c. It replaces compactness in infinite dimensions (Palais and Smale 1964)." },
    { id: "minimax-value", name: "Minimax value", kind: "konstruktion", area: "58E", field: [58], msc: ["58E"], msc5: "58E05", uses: ["cv:functional", "st:infimum", "st:supremum"],
      formula: String.raw`c = \inf_{A \in \mathcal F} \sup_{u \in A} J(u)`,
      text: "For a functional J and a family 𝓕 of subsets of its domain, the infimum over the sets A in 𝓕 of the supremum of J on A. If 𝓕 is invariant under the deformations that decrease J, the minimax value is a candidate for a critical value; minimization is the case where 𝓕 consists of points." },
    { id: "lusternik-schnirelmann-category", name: "Lusternik–Schnirelmann category", kind: "invariante", area: "58E", field: [58, 55], msc: ["58E", "55M"], msc5: "58E05", uses: ["top:open-cover", "top:homotopy", "top:topological-space"],
      formula: String.raw`\operatorname{cat}(X) = \min \{ k : X = U_1 \cup \dots \cup U_k,\ U_i \hookrightarrow X \text{ null-homotopic} \}`,
      text: "The smallest number k of open sets that cover a space X and are each contractible in X, that is, whose inclusion into X is homotopic to a constant map (unnormalized convention: cat of a point is 1, cat(S<sup>n</sup>) = 2, cat(T<sup>n</sup>) = cat(ℝP<sup>n</sup>) = n + 1). It is a homotopy invariant and a lower bound for the number of critical points of a smooth function on a closed manifold." },
    { id: "cup-length", name: "Cup length", kind: "invariante", area: "58E", field: [58, 55], msc: ["58E", "55M"], msc5: "58E05", uses: ["top:cup-product", "top:singular-cohomology"],
      formula: String.raw`\operatorname{cl}(X) = \max \{ k : \alpha_1 \smile \dots \smile \alpha_k \ne 0,\ \deg \alpha_i \ge 1 \}`,
      text: "The largest number k of cohomology classes of positive degree whose cup product is not zero (for a chosen coefficient ring). The cup length of the n-torus is n, that of ℝP<sup>n</sup> with coefficients ℤ/2 is n." },
    { id: "morse-smale-pair", name: "Morse–Smale pair", kind: "eigenschaft", area: "58E", field: [58, 37], msc: ["58E"], msc5: "58E05", uses: ["gradient-flow", "ds:stable-manifold", "top:transversality", "top:morse-function"],
      formula: String.raw`W^u(p) \pitchfork W^s(q)`,
      text: "A Morse function f and a Riemannian metric on a closed manifold such that for all critical points p and q the unstable manifold of p and the stable manifold of q of the negative gradient flow intersect transversally. Then the flow lines from p to q form a manifold of dimension ind(p) − ind(q)." },
    { id: "morse-complex", name: "Morse complex", kind: "konstruktion", area: "58E", field: [58, 57], msc: ["58E"], msc5: "58E05", uses: ["morse-smale-pair", "morse-index", "ct:chain-complex"],
      formula: String.raw`C_k = \bigoplus_{\operatorname{ind}(p) = k} \mathbb Z\, p,\quad \partial p = \sum_{\operatorname{ind}(q) = k - 1} n(p, q)\, q`,
      text: "For a Morse–Smale pair on a closed manifold, the chain complex generated in degree k by the critical points of index k, whose differential counts with signs the flow lines n(p, q) of the negative gradient from p to q (Thom, Smale, Milnor, Witten 1982)." },
    { id: "energy-functional", name: "Energy of a path", kind: "konstruktion", area: "58E", field: [58, 53], msc: ["58E"], msc5: "58E10", uses: ["path-space", "geo:riemannian-manifold", "cv:functional"],
      formula: String.raw`E(\gamma) = \frac12 \int_0^1 |\dot\gamma(t)|^2\, dt`,
      text: "The functional on the Hilbert manifold of H<sup>1</sup> paths (or loops) in a Riemannian manifold given by half the integral of the squared speed. Its critical points are the geodesics, parametrized proportionally to arc length; E ≥ L<sup>2</sup>/2 with equality exactly for such parametrizations." },
    { id: "closed-geodesic", name: "Closed geodesic", kind: "objekt", area: "58E", field: [58, 53], msc: ["58E", "53C"], msc5: "58E10", uses: ["geo:geodesic"],
      formula: String.raw`\gamma(t + 1) = \gamma(t),\quad \dot\gamma \ne 0`,
      text: "A non-constant periodic geodesic of a Riemannian manifold. Two closed geodesics are geometrically distinct if their images differ; the iterates γ(kt) of a closed geodesic are again closed geodesics and are not counted as new ones." },
    { id: "action-functional", name: "Symplectic action functional", kind: "konstruktion", area: "58E", field: [58, 53], msc: ["58E", "53D"], msc5: "58E05", uses: ["free-loop-space", "geo:symplectic-manifold", "cv:functional"],
      formula: String.raw`\mathcal A_H(x) = -\int_{D^2} u^*\omega + \int_0^1 H_t\big(x(t)\big)\, dt,\quad u|_{\partial D^2} = x`,
      text: "For a time-dependent Hamiltonian H on a symplectic manifold (M, ω), the functional on contractible loops x with a capping disc u shown. Its critical points are the 1-periodic orbits of the Hamiltonian flow, which correspond to the fixed points of the time-1 map. It is unbounded above and below and its critical points have infinite Morse index, so classical Morse theory does not apply." },
    { id: "floer-homology", name: "Hamiltonian Floer homology", kind: "invariante", area: "58E", field: [58, 53, 57], msc: ["58E", "53D", "57R"], msc5: "58E05", uses: ["action-functional", "morse-complex", "geo:hamiltonian-diffeomorphism"],
      formula: String.raw`\partial x = \sum_y n(x, y)\, y,\quad \partial_s u + J(u)\big(\partial_t u - X_{H_t}(u)\big) = 0`,
      text: "For a non-degenerate Hamiltonian on a closed symplectic manifold, the homology of the complex generated by the 1-periodic orbits whose differential counts the finite-energy solutions u(s, t) of Floer's equation shown (negative gradient lines of the action functional for an L<sup>2</sup> metric, perturbed J-holomorphic cylinders) between orbits whose Conley–Zehnder indices differ by one (Floer 1988)." },

    // ------------------------------------------------------------ 58K Singularities of smooth maps
    { id: "critical-point", name: "Critical point and critical value", kind: "eigenschaft", area: "58K", field: [58], msc: ["58K"], msc5: "58K05", uses: ["top:smooth-map", "top:differential"],
      formula: String.raw`\operatorname{rank} df_p < \dim N,\qquad df_p = 0 \text{ when } N = \mathbb R`,
      text: "A point p is a critical point of a smooth map f : M → N if its differential at p is not surjective; its image f(p) is a critical value. For a real-valued function the critical points are the zeros of df. The values that are not critical are the regular values." },
    { id: "map-germ", name: "Germ of a smooth map", kind: "konstruktion", area: "58K", field: [58], msc: ["58K"], msc5: "58K40", uses: ["top:smooth-map", "top:neighbourhood", "st:equivalence-class"],
      formula: String.raw`f \sim g \iff f|_U = g|_U,\quad p \in U`,
      text: "The class of a smooth map defined near a point p under the relation 'agrees with it on some neighbourhood of p', written f : (ℝ<sup>n</sup>, 0) → (ℝ<sup>p</sup>, 0). Function germs at 0 form a local ring 𝓔<sub>n</sub> with maximal ideal 𝔪 of germs vanishing at 0." },
    { id: "right-equivalence", name: "Right equivalence of function germs", kind: "morphismus", area: "58K", field: [58], msc: ["58K"], msc5: "58K40", uses: ["map-germ", "top:diffeomorphism"],
      formula: String.raw`g = f \circ \varphi,\quad \varphi : (\mathbb R^n, 0) \to (\mathbb R^n, 0) \text{ diffeomorphism germ}`,
      text: "Two function germs f and g are right equivalent (R-equivalent) if g = f ∘ φ for a germ of a diffeomorphism φ fixing 0: they differ by a change of coordinates in the source. The Morse lemma says that a non-degenerate critical point is R-equivalent to a quadratic form." },
    { id: "left-right-equivalence", name: "Left-right equivalence", kind: "morphismus", area: "58K", field: [58], msc: ["58K"], msc5: "58K40", uses: ["map-germ", "top:diffeomorphism"],
      formula: String.raw`g = \psi \circ f \circ \varphi^{-1}`,
      text: "Two map germs (or maps) f and g are left-right equivalent (A-equivalent) if g = ψ ∘ f ∘ φ<sup>−1</sup> for diffeomorphisms (germs) φ of the source and ψ of the target." },
    { id: "jacobian-ideal", name: "Jacobian ideal and local algebra", kind: "konstruktion", area: "58K", field: [58, 32], msc: ["58K"], msc5: "58K20", uses: ["map-germ", "ca:ideal", "ca:quotient-ring", "ana:partial-derivative"],
      formula: String.raw`J_f = \Big(\frac{\partial f}{\partial x_1}, \dots, \frac{\partial f}{\partial x_n}\Big) \subseteq \mathcal E_n,\quad Q_f = \mathcal E_n / J_f`,
      text: "For a function germ f in the ring 𝓔<sub>n</sub> of smooth germs at 0, the ideal generated by its partial derivatives and the quotient Q<sub>f</sub>, the local algebra of f. Its dimension as a real vector space is the multiplicity (Milnor number) μ(f); μ = 1 exactly for a non-degenerate critical point." },
    { id: "finitely-determined-germ", name: "Finitely determined germ", kind: "eigenschaft", area: "58K", field: [58], msc: ["58K"], msc5: "58K40", uses: ["map-germ", "top:jet-bundle", "right-equivalence"],
      formula: String.raw`j^k g(0) = j^k f(0) \;\Rightarrow\; g \sim_R f`,
      text: "A function germ f is k-determined if every germ with the same k-jet at 0 is right equivalent to f; it is finitely determined if it is k-determined for some k. Then f is equivalent to its Taylor polynomial of degree k." },
    { id: "stable-map", name: "Stable smooth map", kind: "eigenschaft", area: "58K", field: [58], msc: ["58K"], msc5: "58K25", uses: ["whitney-topology", "left-right-equivalence", "top:smooth-map"],
      formula: String.raw`g \in \mathcal U \;\Rightarrow\; g = \psi \circ f \circ \varphi^{-1}`,
      text: "A smooth map f : N → P is stable if it has a neighbourhood 𝓤 in the Whitney C<sup>∞</sup> topology all of whose members are left-right equivalent to f by diffeomorphisms φ of N and ψ of P: small perturbations do not change it up to coordinate changes. A Morse function with distinct critical values is stable." },
    { id: "infinitesimally-stable-map", name: "Infinitesimally stable map", kind: "eigenschaft", area: "58K", field: [58], msc: ["58K"], msc5: "58K25", uses: ["top:vector-field", "top:smooth-map", "top:differential"],
      formula: String.raw`w = df \circ \xi + \eta \circ f`,
      text: "A smooth map f : N → P is infinitesimally stable if every vector field w along f (a section of f<sup>*</sup>TP) can be written as shown with a vector field ξ on N and a vector field η on P: every infinitesimal deformation of f is induced by infinitesimal coordinate changes." },
    { id: "fold-singularity", name: "Fold", kind: "eigenschaft", area: "58K", field: [58], msc: ["58K"], msc5: "58K05", uses: ["critical-point", "left-right-equivalence"],
      formula: String.raw`(x, y) \mapsto (x, y^2)`,
      text: "A critical point of a map between surfaces at which the map is left-right equivalent to the germ shown: the surface folds over a curve of critical points, like the projection of a sphere to a plane along its equator." },
    { id: "cusp-singularity", name: "Cusp", kind: "eigenschaft", area: "58K", field: [58], msc: ["58K"], msc5: "58K05", uses: ["critical-point", "left-right-equivalence"],
      formula: String.raw`(x, y) \mapsto (x, y^3 + xy)`,
      text: "A critical point of a map between surfaces at which the map is left-right equivalent to the germ shown; the critical values form a curve with a cusp (semicubical parabola) at the image point." },
    { id: "unfolding", name: "Unfolding", kind: "konstruktion", area: "58K", field: [58], msc: ["58K"], msc5: "58K60", uses: ["map-germ"],
      formula: String.raw`F : (\mathbb R^n \times \mathbb R^k, 0) \to \mathbb R,\quad F(x, 0) = f(x)`,
      text: "A k-parameter unfolding of a function germ f is a germ F(x, u) with F(x, 0) = f(x): a family of functions depending on k parameters that contains f. Another unfolding is induced from F by a change of parameters u = h(v), a parameter-dependent change of coordinates in x and the addition of a function of the parameters." },
    { id: "versal-unfolding", name: "Versal unfolding", kind: "eigenschaft", area: "58K", field: [58], msc: ["58K"], msc5: "58K60", uses: ["unfolding", "right-equivalence"], isA: ["unfolding"],
      formula: String.raw`\mathcal E_n = J_f + \mathbb R \cdot 1 + \mathbb R \cdot \partial_{u_1} F|_{u=0} + \dots + \mathbb R \cdot \partial_{u_k} F|_{u=0}`,
      text: "An unfolding of f from which every other unfolding of f is induced; universal if the number k of parameters is minimal, k = codimension of f. By the versality theorem, F is versal exactly when the condition shown holds." },
    { id: "elementary-catastrophe", name: "Elementary catastrophe", kind: "objekt", area: "58K", field: [58], msc: ["58K"], msc5: "58K35", uses: ["versal-unfolding", "finitely-determined-germ"],
      formula: String.raw`x^3 + u x,\quad x^4 + u_2 x^2 + u_1 x,\quad x^3 \pm x y^2 + \dots`,
      text: "The universal unfolding of one of the function germs of codimension at most 4 (Thom's seven: fold x<sup>3</sup>, cusp x<sup>4</sup>, swallowtail x<sup>5</sup>, butterfly x<sup>6</sup>, hyperbolic and elliptic umbilic x<sup>3</sup> ± xy<sup>2</sup>, parabolic umbilic x<sup>2</sup>y + y<sup>4</sup>), together with its catastrophe set, the parameters at which the minimum changes type." },
    { id: "simple-singularity", name: "Simple singularity", kind: "eigenschaft", area: "58K", field: [58, 14, 32], msc: ["58K"], msc5: "58K40", uses: ["right-equivalence", "top:jet-bundle", "critical-point"],
      formula: String.raw`A_k : x^{k+1},\quad D_k : x^2 y + y^{k-1},\quad E_6 : x^3 + y^4,\quad E_7 : x^3 + x y^3,\quad E_8 : x^3 + y^5`,
      text: "A function germ with a critical point at 0 is simple if a neighbourhood of it (in a jet space of high order) meets only finitely many right equivalence classes: it has no moduli. Arnold's list of simple germs is shown, in two variables, up to adding a non-degenerate quadratic form in further variables." },
  ],
};
