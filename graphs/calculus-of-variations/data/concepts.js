// Data of the concept graph (concepts.html): concepts (definitions) of the calculus of variations and optimal control,
// MSC 2020 49 (49J existence theories, 49K optimality conditions, 49L Hamilton–Jacobi theories, 49N miscellaneous
// topics, 49Q manifolds and measure-geometric topics, 49R variational methods for eigenvalues, 49S variational
// principles of physics). In English. Built on 3 November 2026. No concept with a first class 49 stood in another folder.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment): id, name, kind, area, field,
// msc, msc5, uses, isA, formula, text. `area` is the three-character MSC class; classes with few concepts share the
// sector "Smaller classes". Every concept that a definition (name, formula, defining prose) uses explicitly is in `uses`.
// The area "basic" holds placeholders whose first class lies outside 49 and has no entry in its home folder yet:
// weak convergence, reflexive space, Fréchet derivative (46, home folder ../../analysis/) and the
// Palais–Smale condition (58E, no home folder yet). They move when their home folder takes them.
//
// References: set theory "st:", analysis "ana:", topology "top:", geometry "geo:" (surface area element), and the folders
// built at the same time: differential equations "de:" (Sobolev space, Hamilton–Jacobi equation,
// viscosity solution, Dirichlet eigenvalue), dynamical systems "ds:" (first integral), linear algebra "la:" (Rayleigh
// quotient of a matrix) and optimization "opt:" (convex conjugate,
// linear-quadratic regulator problem). These concepts are used here but defined there, to avoid duplicates.
// Prefix for references from other folders: "cv:<id>".
// Sources: Gelfand and Fomin, Calculus of Variations (1963); Giaquinta and Hildebrandt, Calculus of Variations I (1996);
// Dacorogna, Introduction to the Calculus of Variations (3rd ed. 2015) and Direct Methods in the Calculus of Variations
// (2nd ed. 2008); Struwe, Variational Methods (4th ed. 2008); Dierkes, Hildebrandt and Sauvigny, Minimal Surfaces
// (2010); Braides, Γ-convergence for Beginners (2002); Villani, Topics in Optimal Transportation (2003); Fleming and
// Rishel, Deterministic and Stochastic Optimal Control (1975); Bardi and Capuzzo-Dolcetta, Optimal Control and
// Viscosity Solutions of Hamilton–Jacobi–Bellman Equations (1997). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.CV_CONCEPTS = {
  title: "Concepts of the calculus of variations",

  areas: {
    basic: "Defined elsewhere, no home folder yet",
    "49J": "49J Existence theories: direct method, semicontinuity, relaxation",
    "49K": "49K Optimality conditions: Euler–Lagrange, Legendre, Jacobi, Weierstrass",
    "49L": "49L Hamilton–Jacobi theories, dynamic programming, viscosity solutions",
    "49N": "49N Miscellaneous: duality, linear-quadratic problems, regularity",
    "49Q": "49Q Minimal surfaces, geometric measure theory, optimal transport",
    "49R": "49R Variational methods for eigenvalues",
    "49S": "49S Variational principles of physics",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 49J Existence theories
    { id: "functional", name: "Functional", kind: "objekt", area: "49J", field: [49], msc: ["49J"], msc5: "49J27", uses: ["st:map", "st:real-number"],
      formula: String.raw`J: X \to \mathbb R \cup \{+\infty\}`,
      text: "A map from a set X of functions (or of curves, surfaces, measures) to the extended real line. The calculus of variations asks for its minima and maxima and for the equations that characterize them." },
    { id: "minimizer", name: "Minimizer", kind: "eigenschaft", area: "49J", field: [49], msc: ["49J"], msc5: "49J27", uses: ["functional", "st:infimum"],
      formula: String.raw`J(u) = \inf_{v \in X} J(v)`,
      text: "A point u of X at which a functional J attains its infimum over X. A functional bounded below need not have a minimizer: the infimum may not be attained." },
    { id: "minimizing-sequence", name: "Minimizing sequence", kind: "konstruktion", area: "49J", field: [49], msc: ["49J"], msc5: "49J45", uses: ["functional", "st:infimum", "ana:sequence-limit"],
      formula: String.raw`J(u_n) \to \inf_X J`,
      text: "A sequence (u<sub>n</sub>) in X along which the values of a functional J converge to its infimum. It always exists; the direct method extracts a minimizer from it." },
    { id: "lower-semicontinuous-functional", name: "Lower semicontinuous functional", kind: "eigenschaft", area: "49J", field: [49], msc: ["49J"], msc5: "49J45", uses: ["functional", "top:convergent-sequence", "ana:limit-superior"],
      formula: String.raw`u_n \to u \;\Rightarrow\; J(u) \le \liminf_{n \to \infty} J(u_n)`,
      text: "A functional J on a space with a notion of convergence (a topology, or weak convergence) is sequentially lower semicontinuous if its value at the limit of every convergent sequence is at most the lower limit of the values. Values may jump down in the limit, never up." },
    { id: "coercive-functional", name: "Coercive functional", kind: "eigenschaft", area: "49J", field: [49], msc: ["49J"], msc5: "49J45", uses: ["functional", "ana:normed-space"],
      formula: String.raw`\|u\| \to \infty \;\Rightarrow\; J(u) \to \infty`,
      text: "A functional J on a normed space is coercive if J(u) tends to +∞ as the norm of u tends to ∞; equivalently, all sublevel sets {J ≤ t} are bounded. With a compactness theorem for bounded sets it makes minimizing sequences precompact." },
    { id: "convex-functional", name: "Convex functional", kind: "eigenschaft", area: "49J", field: [49], msc: ["49J"], msc5: "49J27", uses: ["functional", "ana:convex-function"],
      formula: String.raw`J((1 - t)u + tv) \le (1 - t)J(u) + tJ(v),\quad 0 \le t \le 1`,
      text: "A functional J on a convex subset of a vector space is convex if the inequality shown holds, so that its restriction to every segment is a convex function; strictly convex if the inequality is strict for u ≠ v and 0 < t < 1." },
    { id: "lower-semicontinuous-envelope", name: "Relaxed functional", kind: "konstruktion", area: "49J", field: [49], msc: ["49J"], msc5: "49J45", uses: ["lower-semicontinuous-functional", "st:supremum"],
      formula: String.raw`\overline J(u) = \sup \{ G(u) : G \le J,\ G \text{ lower semicontinuous} \}`,
      text: "The relaxation of a functional J: the largest lower semicontinuous functional below J, its lower semicontinuous envelope. It has the same infimum as J and has minimizers where J may have none." },
    { id: "gamma-convergence", name: "Γ-convergence", kind: "eigenschaft", area: "49J", field: [49], msc: ["49J"], msc5: "49J45", uses: ["functional", "top:convergent-sequence", "ana:limit-superior"],
      formula: String.raw`J(u) \le \liminf J_n(u_n) \;\; (u_n \to u),\qquad J(u) \ge \limsup J_n(\bar u_n) \;\; (\text{recovery sequence } \bar u_n \to u)`,
      text: "Functionals J<sub>n</sub> on a metric space Γ-converge to J if for every u the liminf inequality holds along every sequence u<sub>n</sub> → u and there is a recovery sequence ū<sub>n</sub> → u with limsup J<sub>n</sub>(ū<sub>n</sub>) ≤ J(u). It is the convergence of functionals under which minima and minimizers converge (De Giorgi, 1975)." },
    { id: "quasiconvex-function", name: "Quasiconvex function (Morrey)", kind: "eigenschaft", area: "49J", field: [49], msc: ["49J"], msc5: "49J45", uses: ["ana:lebesgue-integral", "ana:continuously-differentiable"],
      formula: String.raw`f(A) \le \frac{1}{|D|} \int_D f(A + \nabla \varphi(x))\, dx,\quad \varphi \in C_c^\infty(D; \mathbb R^m)`,
      text: "A continuous function f on the m × n matrices is quasiconvex if for every matrix A the affine map x ↦ Ax minimizes ∫<sub>D</sub> f(∇u) among all its perturbations by smooth maps φ with compact support in a domain D: the inequality shown. Convex functions are quasiconvex; so are determinants and other minors, which are not convex." },
    { id: "rank-one-convex-function", name: "Rank-one convex function", kind: "eigenschaft", area: "49J", field: [49], msc: ["49J"], msc5: "49J45", uses: ["ana:convex-function"],
      formula: String.raw`t \mapsto f(A + t\, a \otimes b) \text{ convex},\quad a \in \mathbb R^m,\ b \in \mathbb R^n`,
      text: "A function f on the m × n matrices that is convex along every line in a rank-one direction a ⊗ b. Quasiconvex functions are rank-one convex; for smooth f, rank-one convexity is the Legendre–Hadamard condition." },
    { id: "integral-functional", name: "Integral functional", kind: "konstruktion", area: "49J", field: [49], msc: ["49J"], msc5: "49J10", uses: ["lagrangian", "ana:lebesgue-integral", "ana:partial-derivative"], isA: ["functional"],
      formula: String.raw`J[u] = \int_\Omega L(x, u(x), \nabla u(x))\, dx`,
      text: "The functional defined by integrating a Lagrangian L(x, u, ξ) along a function u on a domain Ω ⊆ ℝ<sup>n</sup> with values in ℝ<sup>m</sup>, evaluated at u and its first derivatives. For n = 1 it is the classical functional J[y] = ∫<sub>a</sub><sup>b</sup> L(x, y, y′) dx of a curve." },
    { id: "dirichlet-energy", name: "Dirichlet energy", kind: "konstruktion", area: "49J", field: [49], msc: ["49J"], msc5: "49J10", uses: ["integral-functional", "ana:partial-derivative", "ana:sobolev-space"], isA: ["integral-functional"],
      formula: String.raw`D(u) = \frac12 \int_\Omega |\nabla u|^2\, dx`,
      text: "The integral functional with Lagrangian ½|ξ|<sup>2</sup>, defined on the Sobolev space W<sup>1,2</sup>(Ω), also for maps with values in ℝ<sup>m</sup>. Its critical points are the (weakly) harmonic functions; minimizing it with prescribed boundary values is the Dirichlet principle." },
    { id: "optimal-control-problem", name: "Optimal control problem", kind: "konstruktion", area: "49J", field: [49], msc: ["49J"], msc5: "49J15", uses: ["de:initial-value-problem", "ana:measurable-function", "functional"],
      formula: String.raw`\dot x = f(x, u),\quad x(0) = x_0,\quad u(t) \in U,\quad \int_0^T L(x, u)\, dt + g(x(T)) \to \min`,
      text: "The state x(t) ∈ ℝ<sup>n</sup> follows a differential equation driven by a measurable control u(t) with values in a set U; among all controls one seeks one that minimizes a running cost plus a terminal cost. The classical problems of the calculus of variations are the case ẋ = u." },

    // ------------------------------------------------------------ 49K Optimality conditions
    { id: "lagrangian", name: "Lagrangian (integrand)", kind: "objekt", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["ana:continuously-differentiable", "st:real-number"],
      formula: String.raw`L(x, y, p),\quad (x, y, p) \in [a, b] \times \mathbb R^n \times \mathbb R^n`,
      text: "A function L(x, y, p) of the independent variable x, the position y and the slope p, usually twice continuously differentiable; the integrand of a variational problem, where p is replaced by the derivative y′. Subscripts denote partial derivatives: L<sub>y</sub>, L<sub>p</sub>, L<sub>pp</sub>." },
    { id: "admissible-curve", name: "Admissible curve", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["ana:continuously-differentiable"],
      formula: String.raw`y \in C^1([a, b]; \mathbb R^n),\quad y(a) = A,\quad y(b) = B`,
      text: "A continuously differentiable curve on [a, b] with prescribed end points A and B, the competitors in the classical problem with fixed ends. Piecewise C<sup>1</sup> curves are admitted when broken extremals are studied." },
    { id: "admissible-variation", name: "Admissible variation", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["ana:continuously-differentiable"],
      formula: String.raw`\eta \in C^1([a, b]; \mathbb R^n),\quad \eta(a) = \eta(b) = 0`,
      text: "A continuously differentiable function η on [a, b] that vanishes at both ends, so that y + εη is admissible together with y. In several variables: a smooth function with compact support." },
    { id: "first-variation", name: "First variation", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["functional", "admissible-variation", "ana:derivative"],
      formula: String.raw`\delta J(y; \eta) = \frac{d}{d\varepsilon} J[y + \varepsilon \eta] \Big|_{\varepsilon = 0}`,
      text: "The derivative of the functional J at y in the direction of an admissible variation η, its Gâteaux derivative: the derivative of the real function ε ↦ J[y + εη] at 0." },
    { id: "second-variation", name: "Second variation", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["functional", "admissible-variation", "ana:derivative"],
      formula: String.raw`\delta^2 J(y; \eta) = \frac{d^2}{d\varepsilon^2} J[y + \varepsilon \eta] \Big|_{\varepsilon = 0}`,
      text: "The second derivative of ε ↦ J[y + εη] at 0, a quadratic form in the variation η. For an integral functional it is ∫ (L<sub>pp</sub>η′<sup>2</sup> + 2L<sub>yp</sub>ηη′ + L<sub>yy</sub>η<sup>2</sup>) dx." },
    { id: "euler-lagrange-equation", name: "Euler–Lagrange equation", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["lagrangian", "ana:partial-derivative", "ana:derivative"],
      formula: String.raw`\frac{d}{dx} L_p(x, y, y') - L_y(x, y, y') = 0`,
      text: "The second-order differential equation attached to a Lagrangian L; in several variables the partial differential equation div<sub>x</sub> L<sub>ξ</sub>(x, u, ∇u) = L<sub>u</sub>(x, u, ∇u)." },
    { id: "extremal", name: "Extremal", kind: "objekt", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["euler-lagrange-equation", "ana:continuously-differentiable"],
      formula: String.raw`y \in C^2,\quad \tfrac{d}{dx} L_p - L_y = 0`,
      text: "A twice continuously differentiable curve that solves the Euler–Lagrange equation of a Lagrangian. Minimizers are extremals under mild conditions; extremals need not be minimizers." },
    { id: "broken-extremal", name: "Broken extremal", kind: "objekt", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["extremal", "admissible-curve"],
      formula: String.raw`y \in C^1 \text{ on } [c_{i-1}, c_i],\quad y'(c_i^-) \ne y'(c_i^+)`,
      text: "A continuous, piecewise continuously differentiable curve that is an extremal between finitely many corner points c<sub>i</sub>, where its slope may jump." },
    { id: "weak-local-minimum", name: "Weak local minimum", kind: "eigenschaft", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["functional", "admissible-curve"],
      formula: String.raw`J[y] \le J[\tilde y],\quad \|\tilde y - y\|_\infty + \|\tilde y' - y'\|_\infty < \varepsilon`,
      text: "An admissible curve y is a weak local minimum of J if J[y] ≤ J[ỹ] for all admissible ỹ that are close to y together with their derivatives (in the C<sup>1</sup> norm)." },
    { id: "strong-local-minimum", name: "Strong local minimum", kind: "eigenschaft", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["functional", "admissible-curve"],
      formula: String.raw`J[y] \le J[\tilde y],\quad \|\tilde y - y\|_\infty < \varepsilon`,
      text: "An admissible curve y is a strong local minimum of J if J[y] ≤ J[ỹ] for all admissible ỹ that are uniformly close to y, whatever their slopes. Every strong local minimum is a weak one." },
    { id: "legendre-condition", name: "Legendre condition", kind: "eigenschaft", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["lagrangian", "ana:partial-derivative"],
      formula: String.raw`L_{pp}(x, y(x), y'(x)) \ge 0 \quad (a \le x \le b)`,
      text: "A curve y satisfies the Legendre condition if the second derivative of the Lagrangian in the slope is non-negative along it (positive semidefinite for n > 1); the strengthened Legendre condition asks for L<sub>pp</sub> > 0." },
    { id: "jacobi-equation", name: "Jacobi equation", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["second-variation", "extremal", "euler-lagrange-equation"],
      formula: String.raw`-(P h')' + Q h = 0,\quad P = L_{pp},\quad Q = L_{yy} - \tfrac{d}{dx} L_{yp}`,
      text: "The Euler–Lagrange equation of the second variation along an extremal y, a linear second-order equation for h. Its solutions are the derivatives of families of extremals through y." },
    { id: "conjugate-point", name: "Conjugate point of an extremal", kind: "eigenschaft", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["jacobi-equation"],
      formula: String.raw`h(a) = 0,\quad h(c) = 0,\quad h \ne 0`,
      text: "A point c > a is conjugate to a along an extremal if the Jacobi equation has a solution h, not identically zero, that vanishes at a and at c. Geometrically, neighbouring extremals from the same starting point meet the extremal again near c." },
    { id: "weierstrass-excess-function", name: "Weierstrass excess function", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["lagrangian", "ana:partial-derivative"],
      formula: String.raw`E(x, y, p, q) = L(x, y, q) - L(x, y, p) - (q - p) \cdot L_p(x, y, p)`,
      text: "The amount by which L(x, y, ·) at the slope q lies above its tangent plane at the slope p. It is non-negative for all p and q exactly when L is convex in the slope." },
    { id: "field-of-extremals", name: "Field of extremals", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["extremal", "top:topological-space"],
      formula: String.raw`y' = \psi(x, y),\quad (x, y) \in G`,
      text: "A family of extremals that covers a simply connected open region G of the (x, y)-space so that through every point passes exactly one of them; the slope of that extremal at the point defines the slope function ψ of the field." },
    { id: "isoperimetric-problem", name: "Problem with an integral constraint", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["integral-functional", "admissible-curve"],
      formula: String.raw`J[y] = \int_a^b L(x, y, y')\, dx \to \min,\quad K[y] = \int_a^b M(x, y, y')\, dx = c`,
      text: "Minimize one integral functional among admissible curves on which a second integral functional has a prescribed value; called isoperimetric after its model, the curve of given length that encloses the largest area." },
    { id: "brachistochrone-problem", name: "Brachistochrone problem", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["integral-functional", "admissible-curve"],
      formula: String.raw`T[y] = \int_0^{b} \frac{\sqrt{1 + y'^2}}{\sqrt{2 g y}}\, dx \to \min`,
      text: "Find the curve joining two points in a vertical plane along which a bead sliding without friction under gravity g, starting at rest, reaches the lower point in the shortest time; y is measured downwards. Posed by Johann Bernoulli in 1696." },
    { id: "hamiltonian", name: "Hamiltonian of a Lagrangian", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K05", uses: ["lagrangian", "opt:convex-conjugate"],
      formula: String.raw`H(x, y, q) = \sup_p \big( q \cdot p - L(x, y, p) \big)`,
      text: "The Legendre transform of the Lagrangian in the slope variable: for fixed (x, y) the convex conjugate of p ↦ L(x, y, p). When L<sub>pp</sub> > 0 the supremum is attained at the p with L<sub>p</sub> = q, the momentum." },
    { id: "control-hamiltonian", name: "Pontryagin Hamiltonian", kind: "konstruktion", area: "49K", field: [49], msc: ["49K"], msc5: "49K15", uses: ["optimal-control-problem"],
      formula: String.raw`\mathcal H(x, u, \lambda, \lambda_0) = \lambda \cdot f(x, u) - \lambda_0 L(x, u)`,
      text: "For an optimal control problem with dynamics f and running cost L: the function shown of state x, control u, costate λ ∈ ℝ<sup>n</sup> and a constant λ<sub>0</sub> ≥ 0. Pontryagin's principle says that optimal controls maximize it pointwise." },

    // ------------------------------------------------------------ 49L Hamilton–Jacobi theories
    { id: "value-function", name: "Value function", kind: "konstruktion", area: "49L", field: [49], msc: ["49L"], msc5: "49L20", uses: ["optimal-control-problem", "st:infimum"],
      formula: String.raw`V(t, x) = \inf_{u} \Big( \int_t^T L(x(s), u(s))\, ds + g(x(T)) \Big),\quad x(t) = x`,
      text: "The least cost of an optimal control problem as a function of the starting time t and the starting state x, the infimum over all controls on [t, T]." },
    { id: "hjb-equation", name: "Hamilton–Jacobi–Bellman equation", kind: "konstruktion", area: "49L", field: [49], msc: ["49L"], msc5: "49L12", uses: ["optimal-control-problem", "ana:partial-derivative", "st:infimum"],
      formula: String.raw`V_t + \min_{u \in U} \big( L(x, u) + \nabla_x V \cdot f(x, u) \big) = 0,\quad V(T, x) = g(x)`,
      text: "The partial differential equation of dynamic programming for an optimal control problem with dynamics f, running cost L and terminal cost g. It is a Hamilton–Jacobi equation whose Hamiltonian is a minimum over the controls." },

    // ------------------------------------------------------------ 49Q Minimal surfaces, geometric measure theory, optimal transport
    { id: "plateau-problem", name: "Plateau problem", kind: "konstruktion", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q05", uses: ["geo:surface-area-element", "top:closed-disk", "top:continuous-map", "ana:sobolev-space"],
      formula: String.raw`A(X) = \int_D |X_u \times X_v|\, du\, dv \to \min,\quad X(\partial D) = \Gamma`,
      text: "Given a Jordan curve Γ in ℝ<sup>3</sup>, find a surface of least area spanned by it. In Douglas's and Radó's formulation: minimize the area among maps X of the closed unit disc D that are continuous, lie in W<sup>1,2</sup> and map the boundary circle monotonically onto Γ." },
    { id: "current", name: "Current", kind: "objekt", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q15", uses: ["top:differential-form", "ana:distribution"],
      formula: String.raw`T: \mathcal D^k(U) \to \mathbb R,\quad \partial T(\omega) = T(d\omega)`,
      text: "A k-dimensional current in an open set U ⊆ ℝ<sup>n</sup> is a continuous linear functional on the smooth differential k-forms with compact support, in the sense of distributions. An oriented surface defines one by integration; the boundary is defined by Stokes's formula." },
    { id: "mass-of-current", name: "Mass of a current", kind: "invariante", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q15", uses: ["current", "st:supremum"],
      formula: String.raw`\mathbf M(T) = \sup \{ T(\omega) : |\omega| \le 1 \}`,
      text: "The supremum of T(ω) over forms whose comass is at most 1 at every point. For the current of an oriented surface it is its area." },
    { id: "integral-current", name: "Integral current", kind: "objekt", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q15", uses: ["current", "mass-of-current", "ana:hausdorff-measure"], isA: ["current"],
      formula: String.raw`T(\omega) = \int_M \langle \omega, \vec\tau \rangle\, \theta\, d\mathcal H^k,\quad \mathbf M(T) + \mathbf M(\partial T) < \infty`,
      text: "A current given by integration over a countably k-rectifiable set M with an orientation τ and integer multiplicity θ, with respect to k-dimensional Hausdorff measure, such that T and its boundary have finite mass. The generalized surfaces of Federer and Fleming (1960)." },
    { id: "transport-map", name: "Transport map", kind: "morphismus", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q22", uses: ["ana:measurable-function", "ana:measure"],
      formula: String.raw`T_\# \mu = \nu,\quad \nu(B) = \mu(T^{-1}(B))`,
      text: "A measurable map T from X to Y that pushes the probability measure μ on X forward to the probability measure ν on Y: the mass ν gives to a set B is the mass μ gives to its preimage." },
    { id: "transport-plan", name: "Transport plan", kind: "objekt", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q22", uses: ["ana:measure", "ana:product-measure"],
      formula: String.raw`\pi(A \times Y) = \mu(A),\quad \pi(X \times B) = \nu(B)`,
      text: "A coupling of probability measures μ on X and ν on Y: a probability measure π on X × Y whose marginals are μ and ν. π(A × B) is the mass moved from A to B; unlike a map, a plan may split mass." },
    { id: "monge-problem", name: "Monge problem", kind: "konstruktion", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q22", uses: ["transport-map"],
      formula: String.raw`\int_X c(x, T(x))\, d\mu(x) \to \min,\quad T_\# \mu = \nu`,
      text: "Minimize the total cost of moving the mass μ onto ν by a transport map T, for a cost function c(x, y). Monge (1781) took c(x, y) = |x − y|." },
    { id: "kantorovich-problem", name: "Kantorovich problem", kind: "konstruktion", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q22", uses: ["transport-plan"],
      formula: String.raw`\int_{X \times Y} c(x, y)\, d\pi(x, y) \to \min,\quad \pi \in \Pi(\mu, \nu)`,
      text: "Minimize the total cost over all transport plans π between μ and ν. It is a linear problem on a convex set and relaxes the Monge problem (Kantorovich, 1942)." },
    { id: "wasserstein-distance", name: "Wasserstein distance", kind: "invariante", area: "49Q", field: [49], msc: ["49Q"], msc5: "49Q22", uses: ["kantorovich-problem", "top:metric-space"],
      formula: String.raw`W_p(\mu, \nu) = \Big( \min_{\pi \in \Pi(\mu, \nu)} \int d(x, y)^p\, d\pi \Big)^{1/p}`,
      text: "For 1 ≤ p < ∞ and probability measures with finite p-th moments on a metric space: the p-th root of the optimal cost of the Kantorovich problem with cost d(x, y)<sup>p</sup>." },

    // ------------------------------------------------------------ 49R Variational methods for eigenvalues
    { id: "rayleigh-quotient", name: "Rayleigh quotient of the Dirichlet Laplacian", kind: "konstruktion", area: "49R", field: [49], msc: ["49R"], msc5: "49R05", uses: ["la:rayleigh-quotient", "ana:sobolev-space-zero", "ana:lebesgue-integral"],
      formula: String.raw`R(u) = \frac{\int_\Omega |\nabla u|^2\, dx}{\int_\Omega u^2\, dx},\quad u \in W^{1,2}_0(\Omega) \setminus \{0\}`,
      text: "For a bounded domain Ω and a non-zero function u with boundary values 0 in the Sobolev space W<sub>0</sub><sup>1,2</sup>(Ω): the quotient shown, the Rayleigh quotient ⟨−Δu, u⟩/⟨u, u⟩ of the Dirichlet Laplacian written in the energy form. Its minimum and min-max values are the Dirichlet eigenvalues." },

    // ------------------------------------------------------------ 49S Variational principles of physics
    { id: "action-functional", name: "Action", kind: "konstruktion", area: "49S", field: [49], msc: ["49S"], msc5: "49S05", uses: ["integral-functional", "lagrangian"], isA: ["integral-functional"],
      formula: String.raw`S[q] = \int_{t_0}^{t_1} L(t, q(t), \dot q(t))\, dt,\quad L = T - U`,
      text: "The integral functional of a mechanical system along a path q(t) in its configuration space, with Lagrangian kinetic minus potential energy. Hamilton's principle: the motions are the extremals of the action." },
    { id: "variational-symmetry", name: "Variational symmetry", kind: "eigenschaft", area: "49S", field: [49], msc: ["49S"], msc5: "49S05", uses: ["action-functional", "ana:diffeomorphism"],
      formula: String.raw`S[\Phi_s \circ q] = S[q]`,
      text: "A one-parameter group of diffeomorphisms Φ<sub>s</sub> of the configuration space (possibly also moving time) that leaves the action of every path, over every time interval, unchanged. Translations and rotations are symmetries of the action of free particles." },
  ],
};
