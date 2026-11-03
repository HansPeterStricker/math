// Data of the concept graph (concepts.html): concepts (definitions) of differential equations, MSC 2020 34 (ordinary
// differential equations), 35 (partial differential equations) and 58J (partial differential equations on manifolds,
// index theory, spectral geometry). In English. Built on 3 November 2026. Moved here by rule 1 of ../../CLAUDE.md, with
// its id: `initial-value-problem` from ../../analysis/ (there in the area "basic").
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). `area` is the
// three-character MSC class (34A, 35J, 58J, …); classes with few concepts share the sector "Smaller classes".
// Every concept that a definition (name, formula, defining prose) uses explicitly is in `uses`.
//
// Division of work with the neighbouring folders: derivatives, Lᵖ spaces, distributions, Hilbert spaces and operators
// belong to analysis ("ana:", 26, 46, 47); harmonic functions in the plane to analysis (31); manifolds, vector bundles
// and characteristic classes to topology ("top:"); Riemannian metrics and connections to geometry ("geo:"). Sobolev
// spaces, weak derivatives, test functions and Hölder spaces have the first class 46E or 46F and therefore belong to
// analysis; analysis has no such concepts yet, so they stand here in the area "basic" until they move there.
// References: set theory "st:", commutative algebra "ca:", group theory "gt:" (matrix ring), algebraic number theory
// "ant:" (determinant), topology "top:", analysis "ana:", geometry "geo:"; planned folders: linear algebra "la:"
// (matrix, determinant, trace, eigenvalue, linear independence, matrix exponential), K-theory "kt:" (complex
// K-theory) and dynamical systems "ds:" (equilibrium point). The concepts of the qualitative theory of autonomous systems
// (flow of a vector field, orbit, ω-limit set, periodic orbit, limit cycle, stability, Lyapunov function, first
// integral) stand in ../../dynamical-systems/ (37), the Dirichlet energy and the Rayleigh quotient in
// ../../calculus-of-variations/ (49); this folder refers to them.
// Prefix for references from other folders: "de:<id>".
// Sources: Walter, Ordinary Differential Equations (1998); Hartman, Ordinary Differential Equations (1964); Coddington
// and Levinson, Theory of Ordinary Differential Equations (1955); Hirsch, Smale and Devaney, Differential Equations,
// Dynamical Systems, and an Introduction to Chaos (2004); Evans, Partial Differential Equations (2nd ed. 2010); Gilbarg
// and Trudinger, Elliptic Partial Differential Equations of Second Order (1983); John, Partial Differential Equations
// (4th ed. 1982); Lawson and Michelsohn, Spin Geometry (1989); Berline, Getzler and Vergne, Heat Kernels and Dirac
// Operators (1992). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.DE_CONCEPTS = {
  title: "Concepts of differential equations",

  areas: {
    basic: "Defined elsewhere, no home folder yet (Sobolev and Hölder spaces, 46E, 46F)",
    "34A": "34A General theory of ODEs: initial value problems, linear systems",
    "34B": "34B Boundary value problems, Sturm–Liouville theory",
    "34C": "34C Qualitative theory: equilibria, orbits, limit cycles",
    "34D": "34D Stability theory",
    "35A": "35A General topics in PDEs: operators, symbols, Cauchy problem",
    "35D": "35D Generalized solutions: weak and viscosity solutions",
    "35E": "35E Equations with constant coefficients",
    "35F": "35F First-order equations, characteristics",
    "35J": "35J Elliptic equations: Laplace and Poisson equation",
    "35K": "35K Parabolic equations: heat equation",
    "35L": "35L Hyperbolic equations: wave equation, conservation laws",
    "35P": "35P Spectral theory of PDE operators",
    "35Q": "35Q Equations of mathematical physics: Navier–Stokes, Schrödinger, KdV",
    "58J": "58J PDEs on manifolds: elliptic operators, index theory, spectral geometry",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 34A General theory of ODEs
    { id: "ordinary-differential-equation", name: "Ordinary differential equation", kind: "objekt", area: "34A", field: [34], msc: ["34A"], msc5: "34A34", uses: ["ana:derivative", "ana:continuous-function"],
      formula: String.raw`y^{(n)}(t) = f\big(t, y(t), y'(t), \dots, y^{(n-1)}(t)\big)`,
      text: "An equation for an unknown function y of one real variable t (with values in ℝ<sup>m</sup>) that relates y and its derivatives up to some order n, the order of the equation. In explicit form the highest derivative is a given continuous function f of t and the lower derivatives." },
    { id: "first-order-system", name: "First-order system", kind: "objekt", area: "34A", field: [34], msc: ["34A"], msc5: "34A34", uses: ["ana:derivative", "ana:continuous-function"], isA: ["ordinary-differential-equation"],
      formula: String.raw`y'(t) = f\big(t, y(t)\big),\quad f : D \to \mathbb R^n,\ D \subseteq \mathbb R \times \mathbb R^n \text{ open}`,
      text: "An ordinary differential equation of order 1 for a function with values in ℝ<sup>n</sup>, given by a continuous right-hand side f on an open set D of ℝ × ℝ<sup>n</sup>. Geometrically f is a time-dependent vector field, and a solution is a curve tangent to it." },
    { id: "solution-of-ode", name: "Solution of an ordinary differential equation", kind: "eigenschaft", area: "34A", field: [34], msc: ["34A"], msc5: "34A34", uses: ["ordinary-differential-equation", "ana:derivative"],
      formula: String.raw`y : J \to \mathbb R^m,\quad y^{(n)}(t) = f\big(t, y(t), \dots, y^{(n-1)}(t)\big) \ (t \in J)`,
      text: "A function y on an interval J that is n times differentiable, whose arguments (t, y(t), …, y<sup>(n−1)</sup>(t)) lie in the domain of f, and that satisfies the equation at every point of J." },
    { id: "initial-value-problem", name: "Initial value problem", kind: "konstruktion", area: "34A", field: [34], msc: ["34A"], msc5: "34A12", uses: ["first-order-system", "solution-of-ode"],
      formula: String.raw`y'(t) = f(t, y(t)),\quad y(t_0) = y_0`,
      text: "For a first-order system y′ = f(t, y) with continuous f on an open subset D of ℝ × ℝ<sup>n</sup> and a point (t<sub>0</sub>, y<sub>0</sub>) of D: the problem of finding a solution y on an interval around t<sub>0</sub> whose value at t<sub>0</sub> is y<sub>0</sub>." },
    { id: "maximal-solution", name: "Maximal solution", kind: "eigenschaft", area: "34A", field: [34], msc: ["34A"], msc5: "34A12", uses: ["initial-value-problem", "solution-of-ode"],
      formula: String.raw`y : (t_-, t_+) \to \mathbb R^n,\quad \tilde y|_{(t_-, t_+)} = y \;\Rightarrow\; \tilde y = y`,
      text: "A solution of an initial value problem that cannot be extended to a solution on a larger interval: every solution on an interval containing (t<sub>−</sub>, t<sub>+</sub>) that agrees with it there is the solution itself." },
    { id: "autonomous-system", name: "Autonomous system", kind: "eigenschaft", area: "34A", field: [34], msc: ["34A"], msc5: "34A34", uses: [], isA: ["first-order-system"],
      formula: String.raw`y' = f(y),\quad f : G \to \mathbb R^n,\ G \subseteq \mathbb R^n \text{ open}`,
      text: "A first-order system whose right-hand side does not depend on t; f is then a vector field on an open set G of ℝ<sup>n</sup>, the phase space." },
    { id: "linear-ode-system", name: "Linear system of differential equations", kind: "objekt", area: "34A", field: [34], msc: ["34A"], msc5: "34A30", uses: ["la:matrix", "ana:continuous-function"], isA: ["first-order-system"],
      formula: String.raw`y'(t) = A(t)\, y(t) + b(t)`,
      text: "A first-order system whose right-hand side is affine in y: A(t) is a continuous n × n matrix and b(t) a continuous vector on an interval J. It is homogeneous if b = 0." },
    { id: "homogeneous-linear-system", name: "Homogeneous linear system", kind: "eigenschaft", area: "34A", field: [34], msc: ["34A"], msc5: "34A30", uses: [], isA: ["linear-ode-system"],
      formula: String.raw`y' = A(t)\, y`,
      text: "A linear system without inhomogeneity, b = 0. Sums and scalar multiples of its solutions are again solutions." },
    { id: "fundamental-system", name: "Fundamental system", kind: "konstruktion", area: "34A", field: [34], msc: ["34A"], msc5: "34A30", uses: ["homogeneous-linear-system", "solution-of-ode", "la:linear-independence"],
      formula: String.raw`y_1, \dots, y_n,\quad y_i' = A(t)\, y_i`,
      text: "For a homogeneous linear system of n equations: n solutions y<sub>1</sub>, …, y<sub>n</sub> on the whole interval that are linearly independent as functions, i.e. a basis of the space of solutions." },
    { id: "fundamental-matrix", name: "Fundamental matrix", kind: "konstruktion", area: "34A", field: [34], msc: ["34A"], msc5: "34A30", uses: ["fundamental-system", "la:matrix"],
      formula: String.raw`\Phi(t) = \big(y_1(t) \mid \dots \mid y_n(t)\big),\quad \Phi' = A(t)\, \Phi`,
      text: "The n × n matrix function whose columns form a fundamental system; it solves the matrix equation Φ′ = AΦ, and every solution of the homogeneous system is Φ(t)c with a constant vector c." },
    { id: "wronskian", name: "Wronskian", kind: "invariante", area: "34A", field: [34], msc: ["34A"], msc5: "34A30", uses: ["fundamental-matrix", "la:determinant"],
      formula: String.raw`W(t) = \det \Phi(t)`,
      text: "The determinant of the matrix whose columns are n solutions of a homogeneous linear system; for a single equation of order n, the determinant of the matrix of the solutions and their first n − 1 derivatives." },
    { id: "linear-equation-constant-coefficients", name: "Linear equation with constant coefficients", kind: "objekt", area: "34A", field: [34], msc: ["34A"], msc5: "34A30", uses: ["ana:derivative", "ca:polynomial-ring"], isA: ["ordinary-differential-equation"],
      formula: String.raw`y^{(n)} + a_{n-1} y^{(n-1)} + \dots + a_0 y = 0,\quad p(\lambda) = \lambda^n + a_{n-1}\lambda^{n-1} + \dots + a_0`,
      text: "A homogeneous linear equation of order n whose coefficients a<sub>0</sub>, …, a<sub>n−1</sub> are real or complex constants; its characteristic polynomial p is obtained by inserting e<sup>λt</sup>." },

    // ------------------------------------------------------------ 34B Boundary value problems
    { id: "boundary-value-problem", name: "Boundary value problem", kind: "konstruktion", area: "34B", field: [34], msc: ["34B"], msc5: "34B05", uses: ["ordinary-differential-equation", "solution-of-ode"],
      formula: String.raw`y'' = f(t, y, y'),\quad \alpha_1 y(a) + \alpha_2 y'(a) = 0,\ \beta_1 y(b) + \beta_2 y'(b) = 0`,
      text: "The problem of finding a solution of a differential equation on an interval [a, b] that satisfies conditions at both end points, for example the separated linear conditions shown, instead of conditions at one initial point." },
    { id: "sturm-liouville-problem", name: "Sturm–Liouville problem", kind: "objekt", area: "34B", field: [34], msc: ["34B"], msc5: "34B24", uses: ["boundary-value-problem", "ana:continuously-differentiable"],
      formula: String.raw`-(p\, u')' + q\, u = \lambda\, w\, u \ \text{on } [a, b]`,
      text: "The boundary value problem for the equation shown with separated boundary conditions at a and b, where p is C<sup>1</sup> and positive, q is continuous and real, and the weight w is continuous and positive; λ is a parameter. It is regular if [a, b] is compact." },
    { id: "sturm-liouville-eigenvalue", name: "Eigenvalue of a Sturm–Liouville problem", kind: "invariante", area: "34B", field: [34], msc: ["34B"], msc5: "34B24", uses: ["sturm-liouville-problem"],
      formula: String.raw`-(p\, u')' + q\, u = \lambda\, w\, u,\quad u \ne 0`,
      text: "A number λ for which the Sturm–Liouville problem has a solution u that is not identically zero; u is an eigenfunction for λ." },
    { id: "green-function-ode", name: "Green's function of a boundary value problem", kind: "konstruktion", area: "34B", field: [34], msc: ["34B"], msc5: "34B27", uses: ["boundary-value-problem", "ana:riemann-integral"],
      formula: String.raw`u(t) = \int_a^b G(t, s)\, f(s)\, ds`,
      text: "For a linear second-order operator L with homogeneous boundary conditions at a and b: the function G on [a, b] × [a, b] such that, for every continuous f, the integral shown is the solution of Lu = f with these boundary conditions. It exists when the homogeneous problem has only the zero solution." },

    // ------------------------------------------------------------ 34C Qualitative theory
    { id: "lienard-equation", name: "Liénard equation", kind: "objekt", area: "34C", field: [34], msc: ["34C"], msc5: "34C25", uses: ["ana:derivative", "ana:continuous-function"], isA: ["ordinary-differential-equation"],
      formula: String.raw`x'' + f(x)\, x' + g(x) = 0`,
      text: "The second-order equation shown with continuous f (damping) and g (restoring force); the van der Pol equation x″ − μ(1 − x<sup>2</sup>)x′ + x = 0 is the case f(x) = −μ(1 − x<sup>2</sup>), g(x) = x." },

    // ------------------------------------------------------------ 34D Stability theory
    { id: "linearization", name: "Linearization at an equilibrium", kind: "konstruktion", area: "34D", field: [34], msc: ["34D"], msc5: "34D20", uses: ["ds:equilibrium-point", "ana:total-derivative", "linear-ode-system"],
      formula: String.raw`z' = Df(x_0)\, z`,
      text: "For an equilibrium x<sub>0</sub> of a C<sup>1</sup> autonomous system y′ = f(y): the linear system with constant coefficient matrix Df(x<sub>0</sub>), the total derivative of f at x<sub>0</sub>; it describes the deviation z = y − x<sub>0</sub> to first order." },

    // ------------------------------------------------------------ 35A General topics in PDEs
    { id: "partial-differential-equation", name: "Partial differential equation", kind: "objekt", area: "35A", field: [35], msc: ["35A"], msc5: "35A99", uses: ["ana:partial-derivative", "ana:continuous-function"],
      formula: String.raw`F\big(x, u(x), Du(x), \dots, D^k u(x)\big) = 0`,
      text: "An equation for an unknown function u of several variables x = (x<sub>1</sub>, …, x<sub>n</sub>) on an open set U ⊆ ℝ<sup>n</sup> that relates u and its partial derivatives up to some order k, the order of the equation; F is a given function. It is linear if F is affine in (u, Du, …, D<sup>k</sup>u)." },
    { id: "linear-differential-operator", name: "Linear differential operator", kind: "konstruktion", area: "35A", field: [35, 47], msc: ["35A", "47F"], msc5: "35A99", uses: ["ana:partial-derivative", "ana:continuously-differentiable"],
      formula: String.raw`L u = \sum_{|\alpha| \le k} a_\alpha(x)\, \partial^\alpha u,\quad \partial^\alpha = \partial_1^{\alpha_1} \cdots \partial_n^{\alpha_n}`,
      text: "A map of the form shown on functions on an open set U ⊆ ℝ<sup>n</sup>, with coefficient functions a<sub>α</sub> indexed by multi-indices α = (α<sub>1</sub>, …, α<sub>n</sub>) of length |α| = α<sub>1</sub> + … + α<sub>n</sub> ≤ k; it has order k if some a<sub>α</sub> with |α| = k does not vanish." },
    { id: "principal-symbol", name: "Principal symbol", kind: "konstruktion", area: "35A", field: [35], msc: ["35A"], msc5: "35A30", uses: ["linear-differential-operator"],
      formula: String.raw`\sigma_L(x, \xi) = \sum_{|\alpha| = k} a_\alpha(x)\, (i\xi)^\alpha`,
      text: "For a linear differential operator of order k: the homogeneous polynomial of degree k in ξ ∈ ℝ<sup>n</sup> obtained from the highest-order terms by replacing ∂<sub>j</sub> with iξ<sub>j</sub> (some authors omit the factor i). It transforms like a function on the cotangent bundle." },
    { id: "characteristic-surface", name: "Characteristic hypersurface", kind: "eigenschaft", area: "35A", field: [35], msc: ["35A"], msc5: "35A30", uses: ["principal-symbol", "top:submanifold"],
      formula: String.raw`\sigma_L\big(x, \nu(x)\big) = 0 \ (x \in S)`,
      text: "A hypersurface S is characteristic for L at x if the principal symbol vanishes on its normal ν(x); it is non-characteristic if this happens at no point. On a non-characteristic surface the Cauchy data determine all derivatives of a solution formally." },
    { id: "cauchy-problem", name: "Cauchy problem", kind: "konstruktion", area: "35A", field: [35], msc: ["35A"], msc5: "35A10", uses: ["partial-differential-equation", "characteristic-surface"],
      formula: String.raw`L u = f,\quad \partial_\nu^j u|_S = g_j \ (0 \le j < k)`,
      text: "The problem of finding a solution of a differential equation of order k near a hypersurface S on which u and its normal derivatives up to order k − 1 are prescribed; usually S is non-characteristic, for example S = {t = 0} for an evolution equation." },
    { id: "well-posed-problem", name: "Well-posed problem", kind: "eigenschaft", area: "35A", field: [35], msc: ["35A"], msc5: "35A01", uses: ["partial-differential-equation", "ana:banach-space", "top:continuous-map"],
      formula: String.raw`\text{data} \mapsto u \text{ exists, is unique and continuous}`,
      text: "A problem for a differential equation (with boundary or initial data in a Banach space) is well-posed in the sense of Hadamard if it has a solution for all data, the solution is unique, and it depends continuously on the data. The Cauchy problem for the Laplace equation is not well-posed." },
    { id: "classical-solution", name: "Classical solution", kind: "eigenschaft", area: "35A", field: [35], msc: ["35A"], msc5: "35A01", uses: ["partial-differential-equation", "ana:continuously-differentiable"],
      formula: String.raw`u \in C^k(U),\quad F(x, u, Du, \dots, D^k u) = 0 \text{ pointwise}`,
      text: "A function of class C<sup>k</sup> on U that satisfies the equation of order k at every point, with the derivatives in the classical sense." },
    { id: "fundamental-solution", name: "Fundamental solution", kind: "konstruktion", area: "35A", field: [35], msc: ["35A"], msc5: "35A08", uses: ["linear-differential-operator", "ana:distribution"],
      formula: String.raw`L E = \delta_0`,
      text: "For a linear differential operator L on ℝ<sup>n</sup>: a distribution E with LE = δ<sub>0</sub>, the Dirac distribution at 0. For constant coefficients the convolution E * f then solves Lu = f." },

    // ------------------------------------------------------------ 35D Generalized solutions
    { id: "distributional-solution", name: "Distributional solution", kind: "eigenschaft", area: "35D", field: [35], msc: ["35D"], msc5: "35D30", uses: ["linear-differential-operator", "ana:distribution", "ana:test-function"],
      formula: String.raw`\int u\, L^{t} \varphi \, dx = \int f\, \varphi \, dx,\quad L^t \varphi = \sum (-1)^{|\alpha|} \partial^\alpha (a_\alpha \varphi)`,
      text: "A locally integrable function (or distribution) u solves Lu = f in the sense of distributions if the identity shown, obtained by moving all derivatives to the test function φ, holds for every test function. Classical solutions are distributional solutions." },
    { id: "weak-solution", name: "Weak solution of an elliptic problem", kind: "eigenschaft", area: "35D", field: [35], msc: ["35D"], msc5: "35D30", uses: ["divergence-form-elliptic-operator", "ana:sobolev-space-zero", "ana:lebesgue-integral"],
      formula: String.raw`\int_U a^{ij}\, \partial_i u\, \partial_j v \, dx = \int_U f\, v \, dx \ \ (v \in H^1_0(U)),\quad u \in H^1_0(U)`,
      text: "For the Dirichlet problem −∂<sub>j</sub>(a<sup>ij</sup>∂<sub>i</sub>u) = f in U, u = 0 on the boundary: a function u in H<sup>1</sup><sub>0</sub>(U) that satisfies the integrated identity shown with every v in H<sup>1</sup><sub>0</sub>(U). Only first derivatives of u are needed." },
    { id: "viscosity-solution", name: "Viscosity solution", kind: "eigenschaft", area: "35D", field: [35], msc: ["35D"], msc5: "35D40", uses: ["hamilton-jacobi-equation", "ana:continuous-function", "ana:continuously-differentiable"],
      formula: String.raw`u - \varphi \text{ has a local max at } x_0 \;\Rightarrow\; F\big(x_0, u(x_0), D\varphi(x_0)\big) \le 0`,
      text: "A continuous function u is a viscosity subsolution of F(x, u, Du) = 0 if at every point where u − φ has a local maximum, for a C<sup>1</sup> function φ, the inequality shown holds; a supersolution uses minima and ≥; a viscosity solution is both. Introduced for Hamilton–Jacobi equations, whose solutions are rarely differentiable." },

    // ------------------------------------------------------------ 35E Constant coefficients
    { id: "constant-coefficient-operator", name: "Operator with constant coefficients", kind: "eigenschaft", area: "35E", field: [35], msc: ["35E"], msc5: "35E05", uses: [], isA: ["linear-differential-operator"],
      formula: String.raw`P(D) = \sum_{|\alpha| \le k} c_\alpha\, \partial^\alpha,\quad c_\alpha \in \mathbb C`,
      text: "A linear differential operator on ℝ<sup>n</sup> whose coefficients are constants; it is a polynomial P in ∂<sub>1</sub>, …, ∂<sub>n</sub>, and the Fourier transform turns it into multiplication by P(iξ)." },

    // ------------------------------------------------------------ 35F First-order equations
    { id: "transport-equation", name: "Transport equation", kind: "objekt", area: "35F", field: [35], msc: ["35F"], msc5: "35F10", uses: ["ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_t + b \cdot \nabla u = 0`,
      text: "The linear first-order equation shown for u(x, t) with a constant vector b ∈ ℝ<sup>n</sup>; u is constant along the lines x = x<sub>0</sub> + bt, so u(x, t) = g(x − bt) with the initial value g." },
    { id: "characteristic-curve", name: "Characteristic curves", kind: "konstruktion", area: "35F", field: [35], msc: ["35F"], msc5: "35F20", uses: ["partial-differential-equation", "first-order-system", "solution-of-ode"],
      formula: String.raw`\dot x = a(x, z),\quad \dot z = c(x, z)\quad \text{for } a(x, u) \cdot \nabla u = c(x, u)`,
      text: "For a first-order equation: the solutions of the associated system of ordinary differential equations (shown for a quasilinear equation) along which the equation reduces to an ordinary differential equation for the value z = u(x). For the general equation F(x, u, Du) = 0 the system also involves p = Du." },
    { id: "hamilton-jacobi-equation", name: "Hamilton–Jacobi equation", kind: "objekt", area: "35F", field: [35], msc: ["35F"], msc5: "35F21", uses: ["ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_t + H(x, \nabla u) = 0`,
      text: "The nonlinear first-order equation shown with a given Hamiltonian H(x, p); its characteristics are the solutions of Hamilton's equations. Classical solutions break down in finite time, which led to viscosity solutions." },

    // ------------------------------------------------------------ 35J Elliptic equations
    { id: "laplace-operator", name: "Laplace operator", kind: "konstruktion", area: "35J", field: [35], msc: ["35J"], msc5: "35J05", uses: ["ana:partial-derivative"], isA: ["constant-coefficient-operator"],
      formula: String.raw`\Delta u = \sum_{i=1}^n \frac{\partial^2 u}{\partial x_i^2}`,
      text: "The second-order operator on functions on open subsets of ℝ<sup>n</sup> given by the sum of the unmixed second partial derivatives, the divergence of the gradient. It commutes with translations and rotations." },
    { id: "laplace-equation", name: "Laplace equation", kind: "objekt", area: "35J", field: [35], msc: ["35J"], msc5: "35J05", uses: ["laplace-operator"], isA: ["partial-differential-equation"],
      formula: String.raw`\Delta u = 0`,
      text: "The equation Δu = 0; its C<sup>2</sup> solutions are the harmonic functions. It describes equilibrium states: steady temperatures, electrostatic potentials in charge-free regions." },
    { id: "poisson-equation", name: "Poisson equation", kind: "objekt", area: "35J", field: [35], msc: ["35J"], msc5: "35J05", uses: ["laplace-operator"], isA: ["partial-differential-equation"],
      formula: String.raw`-\Delta u = f`,
      text: "The inhomogeneous Laplace equation with a given right-hand side f, for example a charge density or heat source." },
    { id: "dirichlet-problem", name: "Dirichlet problem", kind: "konstruktion", area: "35J", field: [35], msc: ["35J"], msc5: "35J25", uses: ["poisson-equation", "ana:continuous-function", "top:closure"],
      formula: String.raw`-\Delta u = f \text{ in } U,\quad u = g \text{ on } \partial U`,
      text: "For a bounded open set U and continuous functions f on U and g on its boundary: the problem of finding u in C<sup>2</sup>(U) ∩ C(Ū), the closure Ū, that solves the Poisson equation in U and equals g on ∂U. The same name is used for general second-order elliptic operators." },
    { id: "fundamental-solution-laplace", name: "Fundamental solution of the Laplace equation", kind: "konstruktion", area: "35J", field: [35], msc: ["35J"], msc5: "35J08", uses: ["fundamental-solution", "laplace-operator", "ana:logarithm"],
      formula: String.raw`\Phi(x) = -\tfrac{1}{2\pi} \log |x| \ (n = 2),\qquad \Phi(x) = \frac{1}{n(n-2)\,\omega_n\, |x|^{n-2}} \ (n \ge 3)`,
      text: "The radial function Φ on ℝ<sup>n</sup> ∖ {0} shown, where ω<sub>n</sub> is the volume of the unit ball; −Φ is the fundamental solution of Δ. It is the Newtonian (n = 3) or logarithmic (n = 2) potential of a unit point charge." },
    { id: "green-function", name: "Green's function of a domain", kind: "konstruktion", area: "35J", field: [35], msc: ["35J"], msc5: "35J08", uses: ["fundamental-solution-laplace", "dirichlet-problem"],
      formula: String.raw`G(x, y) = \Phi(y - x) - \phi^x(y),\quad \Delta_y \phi^x = 0,\ \phi^x = \Phi(\cdot - x) \text{ on } \partial U`,
      text: "For a bounded domain U and x in U: the fundamental solution with pole at x minus the corrector φ<sup>x</sup>, the solution of the Dirichlet problem with boundary values Φ(y − x). It vanishes on the boundary, and the solution of −Δu = f, u = g on ∂U is represented by integrals of f against G and of g against its normal derivative." },
    { id: "poisson-kernel", name: "Poisson kernel", kind: "konstruktion", area: "35J", field: [35], msc: ["35J"], msc5: "35J08", uses: ["green-function"],
      formula: String.raw`K(x, y) = \frac{r^2 - |x|^2}{n\, \omega_n\, r\, |x - y|^n} \ \ (|x| < r = |y|)`,
      text: "The negative normal derivative of the Green's function on the boundary; for the ball of radius r about 0 it is the explicit function shown, and the harmonic function with boundary values g is the integral of g against K over the sphere." },
    { id: "elliptic-operator", name: "Elliptic operator", kind: "eigenschaft", area: "35J", field: [35], msc: ["35J"], msc5: "35J99", uses: ["principal-symbol"], isA: ["linear-differential-operator"],
      formula: String.raw`\sigma_L(x, \xi) \ne 0 \ (\xi \ne 0)`,
      text: "A linear differential operator whose principal symbol does not vanish for non-zero ξ; equivalently, no hypersurface is characteristic. The Laplace operator is elliptic; the heat and wave operators are not." },
    { id: "divergence-form-elliptic-operator", name: "Uniformly elliptic operator in divergence form", kind: "eigenschaft", area: "35J", field: [35], msc: ["35J"], msc5: "35J15", uses: ["ana:partial-derivative", "ana:measurable-function"],
      formula: String.raw`L u = -\partial_j\big(a^{ij}(x)\, \partial_i u\big),\quad \lambda |\xi|^2 \le a^{ij}(x)\, \xi_i \xi_j \le \Lambda |\xi|^2`,
      text: "A second-order operator of the form shown (summation over i and j) with a symmetric matrix of bounded measurable coefficients a<sup>ij</sup> that satisfies the ellipticity bounds with constants 0 < λ ≤ Λ at almost every point. For merely measurable coefficients it acts only in the weak sense." },
    { id: "coercive-bilinear-form", name: "Coercive bilinear form", kind: "eigenschaft", area: "35J", field: [35, 46], msc: ["35J", "46C"], msc5: "35J20", uses: ["ca:bilinear-map", "ana:hilbert-space"],
      formula: String.raw`|B(u, v)| \le M \|u\| \|v\|,\quad B(u, u) \ge \beta \|u\|^2`,
      text: "A bilinear form B on a real Hilbert space that is bounded and coercive with constants M and β > 0 as shown. The form a<sup>ij</sup>∂<sub>i</sub>u∂<sub>j</sub>v integrated over U is coercive on H<sup>1</sup><sub>0</sub>(U) for bounded U." },

    // ------------------------------------------------------------ 35K Parabolic equations
    { id: "heat-equation", name: "Heat equation", kind: "objekt", area: "35K", field: [35], msc: ["35K"], msc5: "35K05", uses: ["laplace-operator", "ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_t - \Delta u = 0`,
      text: "The equation for u(x, t) shown, with the Laplace operator in the space variables; it describes diffusion of heat or of a concentration. Its stationary solutions are the harmonic functions." },
    { id: "heat-kernel", name: "Heat kernel", kind: "konstruktion", area: "35K", field: [35], msc: ["35K"], msc5: "35K08", uses: ["heat-equation", "fundamental-solution", "ana:exponential-function"],
      formula: String.raw`\Phi(x, t) = (4\pi t)^{-n/2}\, e^{-|x|^2 / 4t} \ (t > 0)`,
      text: "The Gaussian shown, extended by 0 for t ≤ 0; it is the fundamental solution of the heat operator ∂<sub>t</sub> − Δ on ℝ<sup>n+1</sup>, and at each time t > 0 it has total integral 1." },
    { id: "parabolic-boundary", name: "Parabolic boundary", kind: "konstruktion", area: "35K", field: [35], msc: ["35K"], msc5: "35K20", uses: ["top:closure", "st:cartesian-product"],
      formula: String.raw`\Gamma_T = \overline{U_T} \setminus U_T,\quad U_T = U \times (0, T]`,
      text: "For a bounded open set U and T > 0: the part of the boundary of the cylinder U × (0, T] made of the bottom U × {0} and the lateral wall ∂U × [0, T]. Initial and boundary values of the heat equation are prescribed there; the top is not part of it." },
    { id: "parabolic-operator", name: "Parabolic operator", kind: "eigenschaft", area: "35K", field: [35], msc: ["35K"], msc5: "35K10", uses: ["divergence-form-elliptic-operator", "ana:partial-derivative"],
      formula: String.raw`\partial_t u + L u,\quad L \text{ uniformly elliptic in } x`,
      text: "An operator ∂<sub>t</sub> + L on functions of (x, t) where L is a second-order uniformly elliptic operator in the space variables, possibly with coefficients depending on t; the heat operator is the case L = −Δ." },

    // ------------------------------------------------------------ 35L Hyperbolic equations
    { id: "wave-equation", name: "Wave equation", kind: "objekt", area: "35L", field: [35], msc: ["35L"], msc5: "35L05", uses: ["laplace-operator", "ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_{tt} - \Delta u = 0`,
      text: "The second-order equation for u(x, t) shown (with speed of propagation 1); it describes vibrating strings and membranes, sound and, componentwise, electromagnetic waves in vacuum." },
    { id: "wave-energy", name: "Energy of a wave", kind: "invariante", area: "35L", field: [35], msc: ["35L"], msc5: "35L05", uses: ["wave-equation", "ana:lebesgue-integral"],
      formula: String.raw`E(t) = \frac12 \int_{\mathbb R^n} \big( u_t^2 + |\nabla u|^2 \big)\, dx`,
      text: "For a solution of the wave equation: the sum of kinetic and potential energy at time t, the integral shown (over a domain with suitable boundary conditions, or over ℝ<sup>n</sup> for data with compact support)." },
    { id: "domain-of-dependence", name: "Domain of dependence", kind: "konstruktion", area: "35L", field: [35], msc: ["35L"], msc5: "35L05", uses: ["wave-equation"],
      formula: String.raw`\{ (y, s) : |y - x| \le t - s,\ 0 \le s \le t \}`,
      text: "For a point (x, t) and the wave equation: the backward light cone shown, whose base, the ball of radius t about x at time 0, is the set of initial data that can influence the solution at (x, t)." },
    { id: "conservation-law", name: "Conservation law", kind: "objekt", area: "35L", field: [35], msc: ["35L"], msc5: "35L65", uses: ["ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_t + \operatorname{div} F(u) = 0`,
      text: "A first-order equation (or system) of the form shown with a flux function F; integrated over a region it says that the amount of u changes only by the flux through the boundary. Smooth solutions develop discontinuities, shocks, in finite time." },
    { id: "burgers-equation", name: "Burgers' equation", kind: "objekt", area: "35L", field: [35], msc: ["35L"], msc5: "35L65", uses: [], isA: ["conservation-law"],
      formula: String.raw`u_t + \Big(\frac{u^2}{2}\Big)_x = 0`,
      text: "The inviscid Burgers equation, the scalar conservation law in one space dimension with flux F(u) = u<sup>2</sup>/2; the model case in which characteristics cross and shocks form." },
    { id: "shock-wave", name: "Shock", kind: "konstruktion", area: "35L", field: [35], msc: ["35L"], msc5: "35L67", uses: ["conservation-law", "distributional-solution"],
      formula: String.raw`u = u_- \ (x < s(t)),\quad u = u_+ \ (x > s(t))`,
      text: "A curve x = s(t) across which a distributional solution of a conservation law is discontinuous, with limits u<sub>−</sub> and u<sub>+</sub> on the two sides; s′(t) is the speed of the shock." },
    { id: "entropy-solution", name: "Entropy solution", kind: "eigenschaft", area: "35L", field: [35], msc: ["35L"], msc5: "35L65", uses: ["conservation-law", "distributional-solution", "ana:convex-function"],
      formula: String.raw`\partial_t |u - k| + \operatorname{div}\big( \operatorname{sgn}(u - k)\,(F(u) - F(k)) \big) \le 0`,
      text: "A bounded distributional solution of a scalar conservation law that satisfies the inequality shown in the sense of distributions for every constant k (Kruzhkov's condition); equivalently η(u)<sub>t</sub> + div q(u) ≤ 0 for every convex entropy η with entropy flux q. It singles out the physically relevant weak solution." },

    // ------------------------------------------------------------ 35P Spectral theory
    { id: "dirichlet-eigenvalue", name: "Dirichlet eigenvalue", kind: "invariante", area: "35P", field: [35], msc: ["35P"], msc5: "35P15", uses: ["laplace-operator", "ana:sobolev-space-zero"],
      formula: String.raw`-\Delta u = \lambda u \text{ in } U,\quad u \in H^1_0(U),\ u \ne 0`,
      text: "For a bounded open set U ⊆ ℝ<sup>n</sup>: a number λ for which the equation shown has a non-zero weak solution u, an eigenfunction. For a planar domain they are the squares of the frequencies of a drum of shape U." },
    { id: "nodal-domain", name: "Nodal domain", kind: "konstruktion", area: "35P", field: [35], msc: ["35P"], msc5: "35P05", uses: ["dirichlet-eigenvalue", "top:connected-space"],
      formula: String.raw`U \setminus \{ u = 0 \} = \textstyle\bigsqcup_i N_i`,
      text: "A connected component of the set where an eigenfunction u does not vanish; the zero set, the nodal set, separates them. Chladni's sand figures show the nodal sets of vibrating plates." },

    // ------------------------------------------------------------ 35Q Equations of mathematical physics
    { id: "navier-stokes-equations", name: "Navier–Stokes equations", kind: "objekt", area: "35Q", field: [35, 76], msc: ["35Q", "76D"], msc5: "35Q30", uses: ["laplace-operator", "ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_t + (u \cdot \nabla) u - \nu \Delta u + \nabla p = f,\quad \operatorname{div} u = 0`,
      text: "The system for the velocity field u(x, t) ∈ ℝ<sup>3</sup> and the pressure p(x, t) of an incompressible viscous fluid with viscosity ν > 0 and external force f." },
    { id: "euler-equations", name: "Euler equations of fluid dynamics", kind: "objekt", area: "35Q", field: [35, 76], msc: ["35Q", "76B"], msc5: "35Q31", uses: ["ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_t + (u \cdot \nabla) u + \nabla p = 0,\quad \operatorname{div} u = 0`,
      text: "The equations of an incompressible ideal (inviscid) fluid, the Navier–Stokes equations with ν = 0 and without force." },
    { id: "leray-hopf-solution", name: "Leray–Hopf weak solution", kind: "eigenschaft", area: "35Q", field: [35], msc: ["35Q"], msc5: "35Q30", uses: ["navier-stokes-equations", "distributional-solution", "ana:sobolev-space", "ana:lp-space"],
      formula: String.raw`u \in L^\infty(0, T; L^2) \cap L^2(0, T; H^1),\quad \tfrac12 \|u(t)\|_2^2 + \nu \int_0^t \|\nabla u\|_2^2 \le \tfrac12 \|u_0\|_2^2`,
      text: "A divergence-free vector field u with the integrability shown that solves the Navier–Stokes equations in the sense of distributions, attains the initial value u<sub>0</sub> weakly, and satisfies the energy inequality shown (for f = 0)." },
    { id: "schrodinger-equation", name: "Schrödinger equation with a potential", kind: "objekt", area: "35Q", field: [35, 81], msc: ["35Q", "81Q"], msc5: "35Q41", uses: ["laplace-operator", "st:complex-number"], isA: ["partial-differential-equation"],
      formula: String.raw`i\, \partial_t \psi = -\Delta \psi + V \psi`,
      text: "The equation for a complex-valued wave function ψ(x, t) with a real potential V (in units with ħ = 1 and mass 1/2); the L<sup>2</sup> norm of ψ is conserved." },
    { id: "korteweg-de-vries-equation", name: "Korteweg–de Vries equation", kind: "objekt", area: "35Q", field: [35], msc: ["35Q"], msc5: "35Q53", uses: ["ana:partial-derivative"], isA: ["partial-differential-equation"],
      formula: String.raw`u_t + 6\, u\, u_x + u_{xxx} = 0`,
      text: "The third-order nonlinear equation shown for waves in shallow water in one space dimension; nonlinearity and dispersion balance each other." },
    { id: "soliton", name: "Soliton", kind: "konstruktion", area: "35Q", field: [35], msc: ["35Q"], msc5: "35Q51", uses: ["korteweg-de-vries-equation", "classical-solution"],
      formula: String.raw`u(x, t) = \phi(x - ct)`,
      text: "A solitary travelling wave: a solution of a nonlinear dispersive equation such as the Korteweg–de Vries equation of the form shown with a localized profile φ that moves with constant speed c without changing shape, and that keeps its shape after collisions with other such waves." },

    // ------------------------------------------------------------ 58J PDEs on manifolds
    { id: "differential-operator-on-bundle", name: "Differential operator between vector bundles", kind: "konstruktion", area: "58J", field: [58], msc: ["58J"], msc5: "58J05", uses: ["linear-differential-operator", "top:vector-bundle-topological", "top:manifold"],
      formula: String.raw`D : C^\infty(M; E) \to C^\infty(M; F)`,
      text: "For smooth vector bundles E and F over a smooth manifold M: a linear map of their spaces of smooth sections that in every chart and local trivializations is a linear differential operator with smooth matrix coefficients. Its principal symbol is a bundle map σ(x, ξ) : E<sub>x</sub> → F<sub>x</sub> for cotangent vectors ξ." },
    { id: "elliptic-operator-on-manifold", name: "Elliptic operator on a manifold", kind: "eigenschaft", area: "58J", field: [58], msc: ["58J"], msc5: "58J05", uses: ["principal-symbol", "top:tangent-bundle"], isA: ["differential-operator-on-bundle"],
      formula: String.raw`\sigma_D(x, \xi) : E_x \xrightarrow{\ \cong\ } F_x \ (\xi \ne 0)`,
      text: "A differential operator between vector bundles whose principal symbol is an isomorphism for every non-zero cotangent vector ξ. The Laplace–Beltrami operator, the Dirac operator and d + d* on forms are elliptic." },
    { id: "analytic-index", name: "Analytic index", kind: "invariante", area: "58J", field: [58], msc: ["58J"], msc5: "58J20", uses: ["elliptic-operator-on-manifold", "ana:fredholm-operator"],
      formula: String.raw`\operatorname{ind} D = \dim \ker D - \dim \operatorname{coker} D`,
      text: "For an elliptic operator D on a closed manifold: the difference of the dimensions of its kernel and cokernel, both finite because D is a Fredholm operator between Sobolev spaces of sections." },
    { id: "topological-index", name: "Topological index", kind: "invariante", area: "58J", field: [58], msc: ["58J"], msc5: "58J20", uses: ["principal-symbol", "kt:complex-k-theory", "top:characteristic-class", "top:integral-of-form"],
      formula: String.raw`\operatorname{t-ind} D = (-1)^n \int_{TM} \operatorname{ch}\big[\sigma(D)\big] \cup \operatorname{Td}(TM \otimes \mathbb C)`,
      text: "For an elliptic operator D on a closed n-manifold M: the integer obtained from the class of its principal symbol in the K-theory with compact supports of the tangent bundle, through the Chern character and the Todd class, as shown (sign conventions vary). Equivalently, the image of the symbol class under the topological push-forward K(TM) → K(point) = ℤ." },
    { id: "dirac-operator", name: "Dirac operator", kind: "konstruktion", area: "58J", field: [58, 53], msc: ["58J", "53C"], msc5: "58J60", uses: ["differential-operator-on-bundle", "geo:riemannian-manifold", "geo:connection-on-vector-bundle"], isA: ["elliptic-operator-on-manifold"],
      formula: String.raw`D = \sum_{i=1}^n e_i \cdot \nabla_{e_i},\quad D^2 = \nabla^* \nabla + \tfrac14 \operatorname{scal}`,
      text: "On a Riemannian spin manifold: the first-order operator on sections of the spinor bundle obtained from the Levi-Civita connection and Clifford multiplication with an orthonormal frame e<sub>i</sub>; it is a square root of a Laplace-type operator, and its square satisfies the Lichnerowicz formula shown." },
    { id: "laplace-beltrami-operator", name: "Laplace–Beltrami operator", kind: "konstruktion", area: "58J", field: [58], msc: ["58J"], msc5: "58J50", uses: ["geo:riemannian-manifold", "laplace-operator"], isA: ["elliptic-operator-on-manifold"],
      formula: String.raw`\Delta_g f = -\frac{1}{\sqrt{\det g}}\, \partial_i\big( \sqrt{\det g}\, g^{ij}\, \partial_j f \big)`,
      text: "On a Riemannian manifold (M, g): the operator −div grad on smooth functions, in local coordinates the expression shown; with this sign convention it is non-negative, and on ℝ<sup>n</sup> it is −Δ. On differential forms its analogue is the Hodge Laplacian dd* + d*d." },
    { id: "heat-kernel-manifold", name: "Heat kernel of a Riemannian manifold", kind: "konstruktion", area: "58J", field: [58], msc: ["58J"], msc5: "58J35", uses: ["heat-kernel", "laplace-beltrami-operator"],
      formula: String.raw`e^{-t\Delta_g} f(x) = \int_M k_t(x, y)\, f(y)\, d\mathrm{vol}(y),\quad k_t(x, y) = \sum_j e^{-\lambda_j t} \phi_j(x) \phi_j(y)`,
      text: "On a closed Riemannian manifold: the smooth kernel k<sub>t</sub>(x, y), t > 0, of the operator e<sup>−tΔ</sup> that solves the heat equation ∂<sub>t</sub> + Δ<sub>g</sub>; expanded in an orthonormal basis of eigenfunctions φ<sub>j</sub> with eigenvalues λ<sub>j</sub> as shown." },
    { id: "isospectral-manifolds", name: "Isospectral manifolds", kind: "eigenschaft", area: "58J", field: [58], msc: ["58J"], msc5: "58J53", uses: ["laplace-beltrami-operator", "ana:spectrum"],
      formula: String.raw`\operatorname{spec} \Delta_{g_1} = \operatorname{spec} \Delta_{g_2}`,
      text: "Two closed Riemannian manifolds (or two bounded domains with the Dirichlet Laplacian) are isospectral if their Laplace operators have the same eigenvalues with the same multiplicities. Kac's question “Can one hear the shape of a drum?” asks whether isospectral implies isometric." },
  ],
};
