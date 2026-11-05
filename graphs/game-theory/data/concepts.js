// Data of the concept graph (concepts.html): concepts (definitions) of game theory, MSC 2020
// 91A. In English. Moved on 4 November 2026 from ../../optimization/data/concepts.js (user: game theory is
// an area of its own); all fields are unchanged, except that `area` is now one of the groupings in `groupAreas` (one sector each; the
// five-character classes of `msc5` grouped) instead of the single class 91A.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). Every concept that a
// definition (name, formula, defining prose) uses explicitly is in `uses`.
//
// References to other folders: optimization and control "opt:" (linear programming, duality), probability "pr:", topology "top:" (fixed-point theorems), computer science "cs:", computability "cc:" and others.
// Prefix for references from other folders: "gm:<id>".
// Sources: Osborne and Rubinstein, A Course in Game Theory (1994); Maschler, Solan and Zamir, Game Theory (2013); Nisan,
// Roughgarden, Tardos and Vazirani, Algorithmic Game Theory (2007); Berlekamp, Conway and Guy, Winning Ways (1982). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.GM_CONCEPTS = {
  title: "Concepts of game theory",

  areas: {
    basic: "Defined elsewhere, no home folder yet",
    strategic: "91A05, 91A10, 91A14, 91A26, 91A68 Strategic games and equilibria",
    extensive: "91A18, 91A46 Extensive-form and combinatorial games",
    dynamic: "91A15, 91A20, 91A22 Stochastic, repeated and evolutionary games",
    cooperative: "91A12 Cooperative games",
  },
  groupAreas: ["strategic", "extensive", "dynamic", "cooperative"],

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 91A05, 91A10, 91A14, 91A26, 91A68 Strategic games and equilibria
    { id: "normal-form-game", name: "Game in normal form", kind: "objekt", area: "strategic", field: [91], msc: ["91A"], msc5: "91A10", uses: ["st:finite-set", "st:cartesian-product", "st:map", "st:real-number"],
      formula: String.raw`\big(N,\ (S_i)_{i \in N},\ (u_i : S_1 \times \dots \times S_n \to \mathbb R)_{i \in N}\big)`,
      text: "A finite set N of players, for each player a set S<sub>i</sub> of strategies and a payoff function u<sub>i</sub> on the set of strategy profiles. A finite game has finitely many players and strategies; a two-player finite game is a bimatrix game." },
    { id: "mixed-strategy", name: "Mixed strategy", kind: "konstruktion", area: "strategic", field: [91], msc: ["91A"], msc5: "91A10", uses: ["normal-form-game", "st:real-number"],
      formula: String.raw`\sigma_i \in \Delta(S_i) = \{ p \in \mathbb R^{S_i}_{\ge 0} : \textstyle\sum_s p_s = 1 \}`,
      text: "A probability distribution on the finite strategy set of a player; the original strategies are the pure strategies. Payoffs of mixed profiles are the expected payoffs when the players randomize independently." },
    { id: "best-response", name: "Best response", kind: "konstruktion", area: "strategic", field: [91], msc: ["91A"], msc5: "91A10", uses: ["normal-form-game", "mixed-strategy"],
      formula: String.raw`u_i(\sigma_i, \sigma_{-i}) \ge u_i(\tau_i, \sigma_{-i})`,
      text: "A strategy σ<sub>i</sub> of player i is a best response to the strategies σ<sub>−i</sub> of the others if no other strategy τ<sub>i</sub> gives player i a higher payoff against them." },
    { id: "nash-equilibrium", name: "Nash equilibrium", kind: "eigenschaft", area: "strategic", field: [91], msc: ["91A"], msc5: "91A10", uses: ["best-response"],
      formula: String.raw`\sigma_i \in \operatorname{BR}_i(\sigma_{-i}) \quad (i \in N)`,
      text: "A strategy profile in which every player's strategy is a best response to the strategies of the others, so that no player gains by deviating alone. It is pure if all strategies are pure." },
    { id: "dominant-strategy", name: "Dominant strategy", kind: "eigenschaft", area: "strategic", field: [91], msc: ["91A"], msc5: "91A10", uses: ["normal-form-game"],
      formula: String.raw`u_i(s_i, s_{-i}) \ge u_i(t_i, s_{-i})`,
      text: "A strategy s<sub>i</sub> of player i that is a best response to every strategy profile s<sub>−i</sub> of the other players. In the prisoner's dilemma defection is dominant." },
    { id: "correlated-equilibrium", name: "Correlated equilibrium", kind: "eigenschaft", area: "strategic", field: [91], msc: ["91A"], msc5: "91A10", uses: ["normal-form-game", "pr:probability-space"],
      formula: String.raw`\sum_{s_{-i}} \pi(s_i, s_{-i}) \big( u_i(s_i, s_{-i}) - u_i(t_i, s_{-i}) \big) \ge 0`,
      text: "A probability distribution π on strategy profiles such that, if a mediator draws a profile from π and tells each player only her own strategy, no player gains by deviating from the recommendation. The conditions are linear inequalities in π (Aumann)." },
    { id: "potential-game", name: "Potential game", kind: "eigenschaft", area: "strategic", field: [91], msc: ["91A"], msc5: "91A14", uses: ["normal-form-game"],
      formula: String.raw`u_i(t_i, s_{-i}) - u_i(s_i, s_{-i}) = \Phi(t_i, s_{-i}) - \Phi(s_i, s_{-i})`,
      text: "A game with a function Φ on the strategy profiles, the exact potential, whose change under a unilateral deviation equals the change of the deviating player's payoff." },
    { id: "congestion-game", name: "Congestion game", kind: "objekt", area: "strategic", field: [91], msc: ["91A"], msc5: "91A14", uses: ["normal-form-game", "st:power-set"], isA: ["normal-form-game"],
      formula: String.raw`c_i(s) = \sum_{r \in s_i} d_r\big(n_r(s)\big)`,
      text: "A game in which each player chooses a subset of a finite set of resources and pays, for each chosen resource r, a cost d<sub>r</sub> that depends only on the number n<sub>r</sub> of players using r. Routing games, where the strategies are paths in a network, are the main example." },
    { id: "price-of-anarchy", name: "Price of anarchy", kind: "invariante", area: "strategic", field: [91], msc: ["91A"], msc5: "91A68", uses: ["nash-equilibrium", "opt:optimal-value"],
      formula: String.raw`\operatorname{PoA} = \frac{\max_{\text{equilibria}} C(s)}{\min_{s} C(s)}`,
      text: "For a class of games with a social cost C, the worst ratio between the cost of an equilibrium and the optimal cost (Koutsoupias and Papadimitriou)." },
    { id: "zero-sum-game", name: "Two-person zero-sum game", kind: "eigenschaft", area: "strategic", field: [91], msc: ["91A"], msc5: "91A05", uses: ["normal-form-game", "la:matrix"], isA: ["normal-form-game"],
      formula: String.raw`u_2 = -u_1,\quad u_1(i, j) = a_{ij}`,
      text: "A game of two players in which the payoffs add up to zero; with finite strategy sets it is a matrix game, given by the matrix A of payoffs to the row player." },
    { id: "saddle-point", name: "Saddle point", kind: "eigenschaft", area: "strategic", field: [91, 90], msc: ["91A", "90C"], msc5: "91A05", uses: ["st:map", "st:cartesian-product", "st:real-number"],
      formula: String.raw`F(x, y^*) \le F(x^*, y^*) \le F(x^*, y)`,
      text: "A point (x*, y*) of X × Y for a function F : X × Y → ℝ such that x* maximizes F(·, y*) and y* minimizes F(x*, ·). The equilibria of a zero-sum game and the optimal primal–dual pairs are saddle points of the payoff and of the Lagrangian." },
    { id: "value-of-game", name: "Value of a zero-sum game", kind: "invariante", area: "strategic", field: [91], msc: ["91A"], msc5: "91A05", uses: ["zero-sum-game", "mixed-strategy"],
      formula: String.raw`v = \max_{x} \min_{y}\ x^{\mathsf T} A y = \min_{y} \max_{x}\ x^{\mathsf T} A y`,
      text: "The common value of the max-min and the min-max of the expected payoff over mixed strategies x and y, when they agree; by the minimax theorem they always agree for matrix games." },
    { id: "common-knowledge", name: "Common knowledge", kind: "eigenschaft", area: "strategic", field: [91], msc: ["91A"], msc5: "91A26", uses: ["pr:probability-space", "st:partition"],
      formula: String.raw`E \supseteq M(\omega),\quad M = \text{meet of the partitions } \mathcal P_1, \dots, \mathcal P_n`,
      text: "In a state space with an information partition 𝒫<sub>i</sub> for each agent, an event E is common knowledge at ω if it contains the cell of ω in the finest common coarsening (the meet) of all partitions: everyone knows E, everyone knows that everyone knows it, and so on (Lewis, Aumann)." },

    // ------------------------------------------------------------ 91A18, 91A46 Extensive-form and combinatorial games
    { id: "extensive-form-game", name: "Game in extensive form", kind: "objekt", area: "extensive", field: [91], msc: ["91A"], msc5: "91A18", uses: ["gr:tree", "normal-form-game", "st:partition"],
      formula: String.raw`(T, P, (\mathcal H_i), (u_i)),\quad P : \text{internal nodes} \to N`,
      text: "A finite rooted tree T whose internal nodes are assigned to players (or to chance), with payoffs at the leaves and, for each player, a partition of her nodes into information sets that she cannot distinguish. The game has perfect information if all information sets are single nodes. Every extensive game has a normal form." },
    { id: "subgame-perfect-equilibrium", name: "Subgame-perfect equilibrium", kind: "eigenschaft", area: "extensive", field: [91], msc: ["91A"], msc5: "91A18", uses: ["extensive-form-game", "nash-equilibrium"],
      formula: String.raw`\sigma|_{\Gamma_v} \ \text{Nash equilibrium of } \Gamma_v`,
      text: "A strategy profile of a game in extensive form that induces a Nash equilibrium in every subgame Γ<sub>v</sub> (Selten). It excludes threats that would not be carried out." },
    { id: "impartial-game", name: "Impartial game", kind: "objekt", area: "extensive", field: [91], msc: ["91A"], msc5: "91A46", uses: ["gr:directed-graph"],
      formula: String.raw`G = \{ G_1, \dots, G_k \}`,
      text: "A two-player game of perfect information without chance in which both players have the same moves from every position and the player who cannot move loses (normal play); every play is finite. A position is identified with the set of positions reachable in one move." },
    { id: "nim", name: "Nim", kind: "objekt", area: "extensive", field: [91], msc: ["91A"], msc5: "91A46", uses: ["impartial-game", "ent:natural-number"], isA: ["impartial-game"],
      formula: String.raw`(n_1, \dots, n_k) \to (n_1, \dots, n_i', \dots, n_k),\quad n_i' < n_i`,
      text: "The impartial game with heaps of n<sub>1</sub>, …, n<sub>k</sub> counters in which a move removes any positive number of counters from one heap." },
    { id: "grundy-value", name: "Grundy value", kind: "invariante", area: "extensive", field: [91], msc: ["91A"], msc5: "91A46", uses: ["impartial-game", "ent:natural-number"],
      formula: String.raw`g(G) = \operatorname{mex}\{ g(G') : G' \text{ option of } G \}`,
      text: "The natural number assigned recursively to a position of an impartial game: the smallest natural number that is not the value of a position reachable in one move (minimal excluded value). The position is lost for the player to move exactly when the value is 0." },

    // ------------------------------------------------------------ 91A15, 91A20, 91A22 Stochastic, repeated and evolutionary games
    { id: "repeated-game", name: "Repeated game", kind: "konstruktion", area: "dynamic", field: [91], msc: ["91A"], msc5: "91A20", uses: ["normal-form-game", "extensive-form-game"],
      formula: String.raw`U_i = (1 - \delta) \sum_{t \ge 0} \delta^t u_i(s^t)`,
      text: "The game in which a stage game in normal form is played infinitely often, each player observing all previous actions; payoffs are discounted with a factor δ < 1 and normalized." },
    { id: "stochastic-game", name: "Stochastic game", kind: "objekt", area: "dynamic", field: [91], msc: ["91A"], msc5: "91A15", uses: ["normal-form-game", "opt:markov-decision-process"],
      formula: String.raw`(N, S, (A_i), p(s' \mid s, a), (r_i))`,
      text: "Shapley's multistage game: in each of finitely many states the players play a game in normal form; the actions determine the stage payoffs and the probabilities of the next state. A Markov decision process is the case of one player." },
    { id: "replicator-dynamics", name: "Replicator dynamics", kind: "konstruktion", area: "dynamic", field: [91], msc: ["91A"], msc5: "91A22", uses: ["mixed-strategy", "de:initial-value-problem"],
      formula: String.raw`\dot x_i = x_i \big( (Ax)_i - x^{\mathsf T} A x \big)`,
      text: "For a symmetric two-player game with payoff matrix A, the differential equation on the simplex of population shares x in which the share of a strategy grows in proportion to its payoff above the population average (Taylor and Jonker)." },
    { id: "evolutionarily-stable-strategy", name: "Evolutionarily stable strategy", kind: "eigenschaft", area: "dynamic", field: [91], msc: ["91A"], msc5: "91A22", uses: ["mixed-strategy", "nash-equilibrium"],
      formula: String.raw`x^{\mathsf T} A x \ge y^{\mathsf T} A x,\quad = \;\Rightarrow\; x^{\mathsf T} A y > y^{\mathsf T} A y`,
      text: "A mixed strategy x of a symmetric two-player game with payoff matrix A such that (x, x) is a Nash equilibrium and every alternative best reply y ≠ x does worse against itself than x does against y (Maynard Smith and Price). A population playing x cannot be invaded by a small group of mutants." },

    // ------------------------------------------------------------ 91A12 Cooperative games
    { id: "cooperative-game", name: "Cooperative game with transferable utility", kind: "objekt", area: "cooperative", field: [91], msc: ["91A"], msc5: "91A12", uses: ["st:finite-set", "st:power-set", "st:map", "st:real-number"],
      formula: String.raw`v : 2^N \to \mathbb R,\quad v(\emptyset) = 0`,
      text: "A finite set N of players and a characteristic function v assigning to each coalition S ⊆ N the total payoff v(S) that its members can secure together and divide among themselves. The game is convex if v(S ∪ T) + v(S ∩ T) ≥ v(S) + v(T)." },
    { id: "core-of-game", name: "Core", kind: "konstruktion", area: "cooperative", field: [91], msc: ["91A"], msc5: "91A12", uses: ["cooperative-game"],
      formula: String.raw`\textstyle\sum_{i \in N} x_i = v(N),\quad \sum_{i \in S} x_i \ge v(S)`,
      text: "The set of payoff vectors x that distribute v(N) among the players such that no coalition S receives less than it can secure on its own (Gillies). It is a polyhedron, possibly empty." },
    { id: "balanced-game", name: "Balanced game", kind: "eigenschaft", area: "cooperative", field: [91], msc: ["91A"], msc5: "91A12", uses: ["cooperative-game"],
      formula: String.raw`\textstyle\sum_S \lambda_S v(S) \le v(N) \ \text{if } \sum_{S \ni i} \lambda_S = 1\ (i \in N),\ \lambda \ge 0`,
      text: "A cooperative game is balanced if for every balanced family of weights λ<sub>S</sub> ≥ 0 on coalitions (each player covered with total weight 1) the weighted sum of the worths is at most v(N)." },
    { id: "shapley-value", name: "Shapley value", kind: "konstruktion", area: "cooperative", field: [91], msc: ["91A"], msc5: "91A12", uses: ["cooperative-game", "gt:permutation"],
      formula: String.raw`\phi_i(v) = \frac{1}{n!} \sum_{\pi} \big( v(P_i^\pi \cup \{ i \}) - v(P_i^\pi) \big)`,
      text: "The payoff vector that gives each player her marginal contribution v(P ∪ {i}) − v(P), averaged over all n! orders π in which the players can arrive, where P = P<sub>i</sub><sup>π</sup> is the set of players before i." },
  ],
};
