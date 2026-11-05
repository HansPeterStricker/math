// Data of the concept graph (concepts.html): concepts (definitions) of several complex variables and analytic spaces,
// MSC 2020 32. In English. Built on 3 November 2026. Moved here by rule 1 of ../../CLAUDE.md, with their ids:
// `analytic-space` and `kaehler-manifold` from ../../algebraic-geometry/ (data/concept-graph.js, area "basic"),
// `d-module` from ../../representation-theory/ (area "basic").
//
// Same model as ../../topology/data/concepts.js (see its header comment). `area` is the three-character MSC class
// (32A, 32B, …); classes with few concepts share the sector "Smaller classes". Every concept that a definition (name,
// formula, defining prose) uses explicitly is in `uses`.
//
// Division of work with the neighbouring folders: holomorphic functions of one variable, power series and Riemann
// surfaces belong to analysis ("ana:", 30); smooth manifolds, differential forms and vector bundles to topology ("top:");
// Riemannian metrics and curvature to geometry ("geo:", 53); schemes, coherent algebraic sheaves, sheaf cohomology and
// Hodge structures to algebraic geometry ("ag:", 14). Complex manifolds, Kähler manifolds, analytic spaces and analytic
// sheaves are here (32).
// References: set theory "st:", elementary number theory "ent:", group theory "gt:", commutative algebra "ca:",
// category theory "ct:", algebraic geometry "ag:", topology "top:", analysis "ana:", geometry "geo:".
// Prefix for references from other folders: "scv:<id>".
// Sources: Hörmander, An Introduction to Complex Analysis in Several Variables (3rd ed. 1990); Gunning and Rossi,
// Analytic Functions of Several Complex Variables (1965); Grauert and Remmert, Coherent Analytic Sheaves (1984);
// Krantz, Function Theory of Several Complex Variables (2nd ed. 1992); Griffiths and Harris, Principles of Algebraic
// Geometry (1978); Huybrechts, Complex Geometry (2005); Voisin, Hodge Theory and Complex Algebraic Geometry I (2002);
// Kobayashi, Hyperbolic Complex Spaces (1998); Milnor, Singular Points of Complex Hypersurfaces (1968).
// Not checked by a specialist. Checked by ../../tests/check-concepts.js.

window.SCV_CONCEPTS = {
  title: "Concepts of several complex variables",

  areas: {
    "32A": "32A Holomorphic functions of several complex variables",
    "32B": "32B Local analytic geometry",
    "32C": "32C Analytic spaces and analytic sheaves",
    "32D": "32D Analytic continuation",
    "32E": "32E Holomorphic convexity and Stein spaces",
    "32F": "32F Geometric convexity, invariant metrics",
    "32G": "32G Deformations of analytic structures",
    "32H": "32H Holomorphic mappings",
    "32L": "32L Holomorphic fibre spaces",
    "32Q": "32Q Complex manifolds",
    "32S": "32S Complex singularities",
    "32T": "32T Pseudoconvex domains",
    "32U": "32U Pluripotential theory",
    "32W": "32W Differential operators in several variables",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 32A Holomorphic functions
    { id: "polydisc", name: "Polydisc", kind: "objekt", area: "32A", field: [32], msc: ["32A"], msc5: "32A07", uses: ["st:complex-number", "st:real-number", "st:cartesian-product"],
      formula: String.raw`\Delta(a, r) = \{ z \in \mathbb C^n : |z_j - a_j| < r_j,\ j = 1, \dots, n \}`,
      text: "The product of n open discs in ℂ with centres a<sub>j</sub> and radii r<sub>j</sub> > 0. For n = 1 it is a disc; the unit polydisc has all centres 0 and all radii 1. Polydiscs play the role that discs play in one variable." },
    { id: "holomorphic-function-several", name: "Holomorphic function of several variables", kind: "eigenschaft", area: "32A", field: [32], msc: ["32A"], msc5: "32A10", uses: ["ana:holomorphic-function", "ana:continuous-function", "top:standard-topology-rn", "st:complex-number"],
      formula: String.raw`\frac{\partial f}{\partial \bar z_j} = 0,\quad j = 1, \dots, n`,
      text: "A complex-valued function f on an open set of ℂ<sup>n</sup> that is continuous and holomorphic in each variable z<sub>j</sub> separately when the other variables are fixed (Osgood's definition). Equivalently, f is locally the sum of a convergent power series; by Hartogs' theorem continuity can be dropped." },
    { id: "power-series-several", name: "Power series in several variables", kind: "objekt", area: "32A", field: [32], msc: ["32A"], msc5: "32A05", uses: ["ana:power-series", "st:complex-number", "ent:natural-number"],
      formula: String.raw`\sum_{\alpha \in \mathbb N^n} a_\alpha (z - a)^\alpha,\quad (z-a)^\alpha = (z_1 - a_1)^{\alpha_1} \cdots (z_n - a_n)^{\alpha_n}`,
      text: "A series indexed by multi-indices α = (α<sub>1</sub>, …, α<sub>n</sub>) of natural numbers with complex coefficients a<sub>α</sub>. Its domain of convergence is a logarithmically convex Reinhardt domain, not a ball in general." },
    { id: "reinhardt-domain", name: "Reinhardt domain", kind: "eigenschaft", area: "32A", field: [32], msc: ["32A"], msc5: "32A07", uses: ["top:connected-space", "top:standard-topology-rn", "st:complex-number"],
      formula: String.raw`(e^{i\theta_1} z_1, \dots, e^{i\theta_n} z_n) \in \Omega`,
      text: "A connected open set Ω ⊆ ℂ<sup>n</sup> that is invariant under the rotations of each coordinate: with z it contains (e<sup>iθ<sub>1</sub></sup>z<sub>1</sub>, …, e<sup>iθ<sub>n</sub></sup>z<sub>n</sub>) for all real θ<sub>j</sub>. Balls and polydiscs centred at 0 are Reinhardt domains." },
    { id: "meromorphic-function-several", name: "Meromorphic function of several variables", kind: "objekt", area: "32A", field: [32], msc: ["32A"], msc5: "32A20", uses: ["holomorphic-function-several", "ca:fraction-field"],
      formula: String.raw`f = g_U / h_U,\quad g_U h_V = g_V h_U \text{ on } U \cap V`,
      text: "A function given locally on an open cover by quotients g/h of holomorphic functions, with h not identically zero on any component, such that the quotients agree on overlaps as elements of the fraction field of the ring of germs. Unlike in one variable, the zero and pole sets can meet (points of indeterminacy, as for z<sub>1</sub>/z<sub>2</sub> at 0)." },
    { id: "bergman-kernel", name: "Bergman kernel", kind: "konstruktion", area: "32A", field: [32], msc: ["32A"], msc5: "32A25", uses: ["holomorphic-function-several", "fa:lp-space", "fa:hilbert-space"],
      formula: String.raw`f(z) = \int_\Omega K(z, w)\, f(w)\, dV(w)`,
      text: "For a domain Ω ⊆ ℂ<sup>n</sup>, the Bergman space of square-integrable holomorphic functions is a closed subspace of L<sup>2</sup>(Ω), hence a Hilbert space. Its reproducing kernel K(z, w) is the Bergman kernel; it is holomorphic in z and antiholomorphic in w and defines a biholomorphically invariant metric." },

    // ------------------------------------------------------------ 32B Local analytic geometry
    { id: "ring-of-germs", name: "Ring of germs of holomorphic functions", kind: "objekt", area: "32B", field: [32], msc: ["32B"], msc5: "32B05", uses: ["holomorphic-function-several", "power-series-several", "ca:commutative-ring"],
      formula: String.raw`\mathcal O_n = \mathbb C\{z_1, \dots, z_n\}`,
      text: "The ring 𝒪<sub>n</sub> of germs at 0 of holomorphic functions on neighbourhoods of 0 in ℂ<sup>n</sup>, two functions being identified if they agree near 0. It is the ring of convergent power series in n variables; it is local, noetherian and factorial." },
    { id: "weierstrass-polynomial", name: "Weierstrass polynomial", kind: "objekt", area: "32B", field: [32], msc: ["32B"], msc5: "32B05", uses: ["ring-of-germs", "ca:polynomial-ring"],
      formula: String.raw`W = z_n^d + a_1(z') z_n^{d-1} + \dots + a_d(z'),\quad a_j(0) = 0`,
      text: "A monic polynomial in z<sub>n</sub> of degree d whose coefficients a<sub>j</sub> are germs in 𝒪<sub>n−1</sub>, the variables z' = (z<sub>1</sub>, …, z<sub>n−1</sub>), and vanish at 0." },
    { id: "analytic-set", name: "Analytic set", kind: "objekt", area: "32B", field: [32], msc: ["32B"], msc5: "32B15", uses: ["holomorphic-function-several", "top:closed-set"],
      formula: String.raw`A \cap U = \{ f_1 = \dots = f_k = 0 \}`,
      text: "A closed subset A of an open set Ω ⊆ ℂ<sup>n</sup> such that every point of Ω has a neighbourhood U in which A is the common zero set of finitely many holomorphic functions f<sub>1</sub>, …, f<sub>k</sub> on U." },

    // ------------------------------------------------------------ 32C Analytic spaces and analytic sheaves
    { id: "sheaf-of-holomorphic-functions", name: "Sheaf of holomorphic functions", kind: "konstruktion", area: "32C", field: [32], msc: ["32C"], msc5: "32C35", uses: ["ct:sheaf", "holomorphic-function-several"],
      formula: String.raw`\mathcal O(U) = \{ f : U \to \mathbb C \text{ holomorphic} \}`,
      text: "The sheaf of rings 𝒪 on an open set of ℂ<sup>n</sup> (or a complex manifold) that assigns to every open set U the ring of holomorphic functions on U. Its stalk at a point is the ring of germs 𝒪<sub>n</sub>." },
    { id: "analytic-space", name: "Complex analytic space", kind: "objekt", area: "32C", field: [32], msc: ["32C"], msc5: "32C15", uses: ["ag:locally-ringed-space", "analytic-set", "sheaf-of-holomorphic-functions"], isA: ["ag:locally-ringed-space"],
      formula: String.raw`(X, \mathcal O_X) \cong_{\mathrm{loc}} \big(A, (\mathcal O_U / (f_1, \dots, f_k))|_A\big)`,
      text: "A Hausdorff locally ringed space (X, 𝒪<sub>X</sub>) that is locally isomorphic to a model: an analytic set A = {f<sub>1</sub> = … = f<sub>k</sub> = 0} in an open set U ⊆ ℂ<sup>n</sup> with the sheaf 𝒪<sub>U</sub>/(f<sub>1</sub>, …, f<sub>k</sub>) restricted to A. Nilpotent functions are allowed. Every complex scheme of finite type has an analytification (GAGA)." },
    { id: "analytic-sheaf", name: "Analytic sheaf", kind: "objekt", area: "32C", field: [32], msc: ["32C"], msc5: "32C35", uses: ["analytic-space", "ct:sheaf", "ca:module"],
      formula: String.raw`\mathcal F(U) \ \text{an}\ \mathcal O_X(U)\text{-module}`,
      text: "A sheaf of 𝒪<sub>X</sub>-modules on an analytic space X: a sheaf of abelian groups whose sections over each open set U form a module over 𝒪<sub>X</sub>(U), compatibly with restriction." },
    { id: "coherent-analytic-sheaf", name: "Coherent analytic sheaf", kind: "eigenschaft", area: "32C", field: [32], msc: ["32C"], msc5: "32C35", uses: ["analytic-sheaf", "ca:finitely-generated-module"], isA: ["analytic-sheaf"],
      formula: String.raw`\mathcal O_X^q|_U \to \mathcal O_X^p|_U \to \mathcal F|_U \to 0`,
      text: "An analytic sheaf ℱ that is locally finitely generated, and such that for every open U and finitely many sections s<sub>1</sub>, …, s<sub>p</sub> over U the sheaf of relations among them is again locally finitely generated. Locally such a sheaf has a finite presentation as displayed." },
    { id: "d-module", name: "D-module", kind: "objekt", area: "32C", field: [32], msc: ["32C", "14F"], msc5: "32C38", uses: ["ag:variety", "ca:module"],
      formula: String.raw`\mathcal D_X = \langle \mathcal O_X, \Theta_X \rangle`,
      text: "A module over the sheaf 𝒟<sub>X</sub> of differential operators on a smooth variety (or complex manifold) X, the sheaf of rings generated by the functions 𝒪<sub>X</sub> and the vector fields Θ<sub>X</sub>. Systems of linear partial differential equations are D-modules." },

    // ------------------------------------------------------------ 32D Analytic continuation
    { id: "domain-of-holomorphy", name: "Domain of holomorphy", kind: "eigenschaft", area: "32D", field: [32], msc: ["32D"], msc5: "32D05", uses: ["holomorphic-function-several", "top:connected-space", "top:standard-topology-rn"],
      formula: String.raw`f \in \mathcal O(\Omega) \ \text{does not extend across}\ \partial\Omega`,
      text: "A connected open set Ω ⊆ ℂ<sup>n</sup> for which there are no open sets U, V with ∅ ≠ U ⊆ Ω ∩ V, V connected and V ⊄ Ω, such that every holomorphic function on Ω agrees on U with a holomorphic function on V. In one variable every domain is a domain of holomorphy; for n ≥ 2 not (Hartogs)." },
    { id: "envelope-of-holomorphy", name: "Envelope of holomorphy", kind: "konstruktion", area: "32D", field: [32], msc: ["32D"], msc5: "32D10", uses: ["domain-of-holomorphy", "holomorphic-function-several", "top:homeomorphism"],
      formula: String.raw`\Omega \hookrightarrow E(\Omega) \xrightarrow{\ \pi\ } \mathbb C^n`,
      text: "The largest Riemann domain over ℂ<sup>n</sup> (a connected space with a local homeomorphism π to ℂ<sup>n</sup>) into which every holomorphic function on Ω extends. It need not be a subset of ℂ<sup>n</sup>; it is a domain of holomorphy over ℂ<sup>n</sup>." },

    // ------------------------------------------------------------ 32E Holomorphic convexity, Stein spaces
    { id: "holomorphic-hull", name: "Holomorphically convex hull", kind: "konstruktion", area: "32E", field: [32], msc: ["32E"], msc5: "32E01", uses: ["holomorphic-function-several", "top:compact-space"],
      formula: String.raw`\widehat K = \{ z \in X : |f(z)| \le \sup_K |f| \}`,
      text: "For a compact subset K of a complex manifold or analytic space X, the set of points z at which every holomorphic function f on X satisfies |f(z)| ≤ max<sub>K</sub>|f|. For X = ℂ<sup>n</sup> and the polynomials instead of all holomorphic functions it is the polynomially convex hull." },
    { id: "holomorphically-convex", name: "Holomorphically convex space", kind: "eigenschaft", area: "32E", field: [32], msc: ["32E"], msc5: "32E01", uses: ["holomorphic-hull", "top:compact-space"],
      formula: String.raw`K \ \text{compact} \;\Rightarrow\; \widehat K \ \text{compact}`,
      text: "A complex manifold or analytic space X in which the holomorphically convex hull of every compact subset is compact." },
    { id: "stein-space", name: "Stein space", kind: "eigenschaft", area: "32E", field: [32], msc: ["32E"], msc5: "32E10", uses: ["analytic-space", "holomorphically-convex", "holomorphic-function-several"], isA: ["analytic-space"],
      formula: String.raw`f(x) \ne f(y),\quad \widehat K \ \text{compact}`,
      text: "An analytic space X that is holomorphically convex and holomorphically separable: for distinct points x, y there is a holomorphic function f on X with f(x) ≠ f(y). Closed analytic subspaces of ℂ<sup>N</sup> and domains of holomorphy are Stein; compact positive-dimensional spaces are not." },

    // ------------------------------------------------------------ 32F Invariant metrics
    { id: "kobayashi-pseudodistance", name: "Kobayashi pseudodistance", kind: "invariante", area: "32F", field: [32], msc: ["32F"], msc5: "32F45", uses: ["holomorphic-map", "polydisc", "geo:hyperbolic-plane"],
      formula: String.raw`d_X(p, q) = \inf \sum_i \rho(a_i, b_i)`,
      text: "On a complex manifold X, the largest pseudodistance d<sub>X</sub> such that every holomorphic map from the unit disc to X decreases distances, the disc carrying the Poincaré distance ρ of the hyperbolic plane. Explicitly, the infimum of Σ ρ(a<sub>i</sub>, b<sub>i</sub>) over chains of holomorphic discs f<sub>i</sub> joining p to q with f<sub>i</sub>(b<sub>i</sub>) = f<sub>i+1</sub>(a<sub>i+1</sub>). On ℂ<sup>n</sup> it is identically zero." },

    // ------------------------------------------------------------ 32G Deformations
    { id: "deformation-of-complex-structure", name: "Deformation of a complex manifold", kind: "objekt", area: "32G", field: [32], msc: ["32G"], msc5: "32G05", uses: ["complex-manifold", "holomorphic-map"],
      formula: String.raw`\pi : \mathcal X \to B,\quad \pi^{-1}(0) \cong X`,
      text: "A proper holomorphic submersion π from a complex manifold 𝒳 onto a connected complex manifold (or analytic space) B with a base point 0, together with an isomorphism of the fibre over 0 with X. All fibres are diffeomorphic to X (Ehresmann), but their complex structures vary." },
    { id: "kodaira-spencer-map", name: "Kodaira–Spencer map", kind: "konstruktion", area: "32G", field: [32], msc: ["32G"], msc5: "32G05", uses: ["deformation-of-complex-structure", "ag:sheaf-cohomology", "top:tangent-bundle"],
      formula: String.raw`\kappa : T_0 B \to H^1(X, T_X)`,
      text: "For a deformation π : 𝒳 → B of X, the linear map that sends a tangent vector at the base point to the class in H<sup>1</sup>(X, T<sub>X</sub>) of the differences of local holomorphic lifts of it to 𝒳. It measures the first-order change of the complex structure." },

    // ------------------------------------------------------------ 32H Holomorphic mappings
    { id: "holomorphic-map", name: "Holomorphic map", kind: "morphismus", area: "32H", field: [32], msc: ["32H"], msc5: "32H02", uses: ["holomorphic-function-several"],
      formula: String.raw`F = (f_1, \dots, f_m),\quad f_j \in \mathcal O(\Omega)`,
      text: "A map F from an open set Ω ⊆ ℂ<sup>n</sup> to ℂ<sup>m</sup> whose components f<sub>j</sub> are holomorphic; between complex manifolds or analytic spaces, a continuous map that is holomorphic in local charts, equivalently pulls back holomorphic functions to holomorphic functions." },
    { id: "biholomorphic-map", name: "Biholomorphic map", kind: "morphismus", area: "32H", field: [32], msc: ["32H"], msc5: "32H02", uses: ["holomorphic-map", "st:bijection"],
      formula: String.raw`F^{-1} \ \text{holomorphic}`,
      text: "A bijective holomorphic map whose inverse is holomorphic. By Riemann's mapping theorem all simply connected proper domains of ℂ are biholomorphic; in ℂ<sup>n</sup>, n ≥ 2, the ball and the polydisc are not (Poincaré)." },

    // ------------------------------------------------------------ 32L Holomorphic fibre spaces
    { id: "holomorphic-vector-bundle", name: "Holomorphic vector bundle", kind: "objekt", area: "32L", field: [32], msc: ["32L"], msc5: "32L05", uses: ["complex-manifold", "holomorphic-map", "top:fibre-bundle"],
      formula: String.raw`g_{\alpha\beta} : U_\alpha \cap U_\beta \to \mathrm{GL}_r(\mathbb C)`,
      text: "A fibre bundle E → X over a complex manifold with fibre ℂ<sup>r</sup> whose transition functions g<sub>αβ</sub> are holomorphic maps to the group of invertible complex r × r matrices; then E is a complex manifold and the projection is holomorphic." },
    { id: "holomorphic-line-bundle", name: "Holomorphic line bundle", kind: "objekt", area: "32L", field: [32], msc: ["32L"], msc5: "32L05", uses: ["holomorphic-vector-bundle"], isA: ["holomorphic-vector-bundle"],
      formula: String.raw`g_{\alpha\beta} \in \mathcal O^*(U_\alpha \cap U_\beta)`,
      text: "A holomorphic vector bundle of rank 1. Its isomorphism classes form the group H<sup>1</sup>(X, 𝒪<sup>*</sup>) under the tensor product." },
    { id: "positive-line-bundle", name: "Positive line bundle", kind: "eigenschaft", area: "32L", field: [32], msc: ["32L"], msc5: "32L05", uses: ["holomorphic-line-bundle", "pq-form", "dbar-operator"],
      formula: String.raw`\tfrac{i}{2\pi}\Theta_h = -\tfrac{i}{2\pi}\,\partial\bar\partial \log |s|_h^2 > 0`,
      text: "A holomorphic line bundle L on a complex manifold that carries a Hermitian metric h (a smoothly varying inner product on the fibres) whose curvature form, the real (1,1)-form computed from any local non-vanishing holomorphic section s as displayed, is positive definite at every point. Its cohomology class is the first Chern class of L." },
    { id: "dolbeault-cohomology", name: "Dolbeault cohomology", kind: "invariante", area: "32L", field: [32], msc: ["32L"], msc5: "32L10", uses: ["dbar-operator", "pq-form", "ha:homology"],
      formula: String.raw`H^{p,q}_{\bar\partial}(X) = \ker \bar\partial \,/\, \operatorname{im} \bar\partial`,
      text: "The cohomology of the complex of smooth (p, q)-forms on a complex manifold X with the operator ∂̄: in degree q, the ∂̄-closed (p, q)-forms modulo the ∂̄-exact ones. With values in a holomorphic vector bundle E it is defined in the same way." },

    // ------------------------------------------------------------ 32Q Complex manifolds
    { id: "complex-manifold", name: "Complex manifold", kind: "objekt", area: "32Q", field: [32], msc: ["32Q"], msc5: "32Q99", uses: ["top:topological-manifold", "biholomorphic-map"], isA: ["top:manifold"],
      formula: String.raw`\varphi_\beta \circ \varphi_\alpha^{-1} \ \text{biholomorphic}`,
      text: "A Hausdorff, second-countable topological space with an atlas of charts to open sets of ℂ<sup>n</sup> whose transition maps are biholomorphic. It is a smooth manifold of real dimension 2n, and an analytic space that is locally isomorphic to ℂ<sup>n</sup>." },
    { id: "almost-complex-structure", name: "Almost complex structure", kind: "konstruktion", area: "32Q", field: [32], msc: ["32Q"], msc5: "32Q60", uses: ["top:tangent-bundle", "top:manifold"],
      formula: String.raw`J : TM \to TM,\quad J^2 = -\mathrm{id}`,
      text: "An endomorphism J of the tangent bundle of a smooth manifold M with J<sup>2</sup> = −id. A complex manifold has one (multiplication by i); an almost complex structure comes from a complex structure exactly when its Nijenhuis tensor vanishes (Newlander–Nirenberg)." },
    { id: "kaehler-manifold", name: "Kähler manifold", kind: "eigenschaft", area: "32Q", field: [32, 53], msc: ["32Q", "53C"], msc5: "32Q15", uses: ["complex-manifold", "almost-complex-structure", "geo:riemannian-manifold", "top:differential-form", "top:exterior-derivative"], isA: ["complex-manifold"],
      formula: String.raw`\omega = g(J\,\cdot, \cdot),\quad d\omega = 0`,
      text: "A complex manifold with a Riemannian metric g that is Hermitian (g(Jv, Jw) = g(v, w) for the complex structure J) and whose fundamental 2-form ω = g(J·, ·) is closed. ℂ<sup>n</sup>, complex tori, projective space with the Fubini–Study metric and all its complex submanifolds are Kähler." },
    { id: "hodge-numbers", name: "Hodge numbers", kind: "invariante", area: "32Q", field: [32], msc: ["32Q"], msc5: "32Q15", uses: ["dolbeault-cohomology", "la:vector-space-dimension"],
      formula: String.raw`h^{p,q}(X) = \dim_{\mathbb C} H^{p,q}_{\bar\partial}(X)`,
      text: "The dimensions of the Dolbeault cohomology groups of a compact complex manifold X; they are finite. On a compact Kähler manifold h<sup>p,q</sup> = h<sup>q,p</sup> and the Betti numbers are b<sub>k</sub> = Σ<sub>p+q=k</sub> h<sup>p,q</sup>." },
    { id: "calabi-yau-manifold", name: "Calabi–Yau manifold", kind: "eigenschaft", area: "32Q", field: [32], msc: ["32Q"], msc5: "32Q25", uses: ["kaehler-manifold", "top:characteristic-class", "top:compact-space"], isA: ["kaehler-manifold"],
      formula: String.raw`c_1(X) = 0 \in H^2(X, \mathbb R)`,
      text: "A compact Kähler manifold whose first Chern class vanishes in real cohomology. By Yau's theorem it carries a Ricci-flat Kähler metric in every Kähler class; some authors also require a trivial canonical bundle and h<sup>p,0</sup> = 0 for 0 < p < n." },
    { id: "kaehler-einstein-metric", name: "Kähler–Einstein metric", kind: "eigenschaft", area: "32Q", field: [32], msc: ["32Q"], msc5: "32Q20", uses: ["kaehler-manifold", "geo:ricci-curvature"],
      formula: String.raw`\operatorname{Ric}(\omega) = \lambda\,\omega`,
      text: "A Kähler metric whose Ricci form is a constant real multiple λ of its Kähler form. The sign of λ must agree with the sign of the first Chern class: negative (general type), zero (Calabi–Yau) or positive (Fano)." },
    { id: "stein-manifold", name: "Stein manifold", kind: "eigenschaft", area: "32Q", field: [32], msc: ["32Q"], msc5: "32Q28", uses: ["complex-manifold", "stein-space"], isA: ["complex-manifold", "stein-space"],
      formula: String.raw`X \hookrightarrow \mathbb C^N \ \text{closed}`,
      text: "A complex manifold that is a Stein space: holomorphically convex and holomorphically separable. Equivalently (Remmert, Bishop, Narasimhan) a manifold biholomorphic to a closed complex submanifold of some ℂ<sup>N</sup>. Every non-compact Riemann surface is Stein." },
    { id: "kobayashi-hyperbolic", name: "Kobayashi hyperbolic manifold", kind: "eigenschaft", area: "32Q", field: [32], msc: ["32Q"], msc5: "32Q45", uses: ["kobayashi-pseudodistance", "complex-manifold"],
      formula: String.raw`d_X(p, q) > 0,\quad p \ne q`,
      text: "A complex manifold on which the Kobayashi pseudodistance is a distance: it separates distinct points. Bounded domains and compact Riemann surfaces of genus at least 2 are hyperbolic; ℂ<sup>n</sup> and complex tori are not." },

    // ------------------------------------------------------------ 32S Singularities
    { id: "milnor-number", name: "Milnor number", kind: "invariante", area: "32S", field: [32], msc: ["32S"], msc5: "32S05", uses: ["ring-of-germs", "ca:ideal", "ca:quotient-ring", "la:vector-space-dimension"],
      formula: String.raw`\mu(f) = \dim_{\mathbb C} \mathcal O_n \big/ \big(\tfrac{\partial f}{\partial z_1}, \dots, \tfrac{\partial f}{\partial z_n}\big)`,
      text: "For a germ f in 𝒪<sub>n</sub> with an isolated critical point at 0, the dimension of the quotient of 𝒪<sub>n</sub> by the ideal generated by the partial derivatives of f (the Jacobian ideal). It is finite exactly when the critical point is isolated; for z<sub>1</sub><sup>2</sup> + … + z<sub>n</sub><sup>2</sup> it is 1." },
    { id: "milnor-fibration", name: "Milnor fibration", kind: "konstruktion", area: "32S", field: [32], msc: ["32S"], msc5: "32S55", uses: ["holomorphic-function-several", "top:fibre-bundle", "top:sphere"],
      formula: String.raw`\varphi = f/|f| : S_\varepsilon \setminus K \to S^1`,
      text: "For a holomorphic function f with f(0) = 0 and a small sphere S<sub>ε</sub> around 0 in ℂ<sup>n</sup>, with link K = S<sub>ε</sub> ∩ {f = 0}, the map φ = f/|f| from the complement of the link to the circle. Its fibres are the Milnor fibres." },

    // ------------------------------------------------------------ 32T Pseudoconvex domains
    { id: "pseudoconvex-domain", name: "Pseudoconvex domain", kind: "eigenschaft", area: "32T", field: [32], msc: ["32T"], msc5: "32T05", uses: ["plurisubharmonic-function", "top:compact-space", "top:connected-space"],
      formula: String.raw`\{ u < c \} \Subset \Omega`,
      text: "A connected open set Ω ⊆ ℂ<sup>n</sup> that has a continuous plurisubharmonic exhaustion function u: every sublevel set {u < c} has compact closure in Ω. Equivalently, −log of the distance to the boundary is plurisubharmonic; for smooth boundary, the Levi form is positive semidefinite on complex tangent vectors." },
    { id: "levi-form", name: "Levi form", kind: "konstruktion", area: "32T", field: [32], msc: ["32T"], msc5: "32T15", uses: ["ana:partial-derivative", "st:complex-number"],
      formula: String.raw`L_\rho(p; w) = \sum_{j,k} \frac{\partial^2 \rho}{\partial z_j \partial \bar z_k}(p)\, w_j \bar w_k`,
      text: "For a domain with smooth boundary given by Ω = {ρ < 0} with dρ ≠ 0 on the boundary, the Hermitian form of the complex second derivatives of ρ at a boundary point p, restricted to the complex tangent vectors w with Σ (∂ρ/∂z<sub>j</sub>)(p) w<sub>j</sub> = 0. Its signature does not depend on the choice of ρ." },
    { id: "strongly-pseudoconvex-domain", name: "Strongly pseudoconvex domain", kind: "eigenschaft", area: "32T", field: [32], msc: ["32T"], msc5: "32T15", uses: ["levi-form"],
      formula: String.raw`L_\rho(p; w) > 0,\quad w \ne 0`,
      text: "A domain with smooth boundary whose Levi form is positive definite on the complex tangent space at every boundary point. Strictly convex domains are strongly pseudoconvex, and strongly pseudoconvex domains are pseudoconvex." },

    // ------------------------------------------------------------ 32U Pluripotential theory
    { id: "plurisubharmonic-function", name: "Plurisubharmonic function", kind: "eigenschaft", area: "32U", field: [32], msc: ["32U"], msc5: "32U05", uses: ["st:real-number", "st:complex-number", "ana:riemann-integral"],
      formula: String.raw`u(a) \le \frac{1}{2\pi} \int_0^{2\pi} u(a + e^{i\theta} b)\, d\theta`,
      text: "An upper semicontinuous function u from an open set Ω ⊆ ℂ<sup>n</sup> to [−∞, ∞) such that its restriction to every complex line is subharmonic: the mean value inequality holds for every point a and vector b with the closed disc {a + ζb : |ζ| ≤ 1} in Ω. A C<sup>2</sup> function is plurisubharmonic exactly when its complex Hessian is positive semidefinite; log|f| is plurisubharmonic for holomorphic f." },

    // ------------------------------------------------------------ 32W Differential operators
    { id: "pq-form", name: "Differential form of type (p, q)", kind: "objekt", area: "32W", field: [32], msc: ["32W"], msc5: "32W05", uses: ["complex-manifold", "top:differential-form"], isA: ["top:differential-form"],
      formula: String.raw`\alpha = \sum_{|I| = p,\, |J| = q} \alpha_{IJ}\, dz_I \wedge d\bar z_J`,
      text: "A complex-valued differential form on a complex manifold that in every holomorphic chart is a sum of terms with exactly p differentials dz<sub>i</sub> and q differentials dz̄<sub>j</sub>. Every k-form splits uniquely into forms of the types (p, q) with p + q = k." },
    { id: "dbar-operator", name: "Cauchy–Riemann operator ∂̄", kind: "konstruktion", area: "32W", field: [32], msc: ["32W"], msc5: "32W05", uses: ["pq-form", "top:exterior-derivative"],
      formula: String.raw`\bar\partial \alpha = \sum_{I,J,k} \frac{\partial \alpha_{IJ}}{\partial \bar z_k}\, d\bar z_k \wedge dz_I \wedge d\bar z_J`,
      text: "The component of type (p, q+1) of the exterior derivative of a (p, q)-form; likewise ∂ is the component of type (p+1, q). A function f is holomorphic exactly when ∂̄f = 0." },
  ],
};
