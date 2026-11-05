// 4 November 2026: all nodes with first class 68Q moved to ../../computability/ ("cc:"); the folder now covers 68P, 68R and 68W.
// Data of the concept graph (concepts.html): concepts (definitions) of theoretical computer science, MSC 2020 68
// (68P theory of data, 68Q theory of computing, 68R discrete mathematics in computer science, 68W algorithms). In
// English. Built on 3 November 2026.
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). `area` is the
// five-character MSC class (68Q45, 68Q15, …), because almost everything lies in 68Q; classes with few concepts share
// the sector "Smaller classes". Every concept that a definition (name, formula, defining prose) uses explicitly is in
// `uses`.
//
// Division of work with the neighbouring folders (order of 3 November 2026): computability itself (Turing machine,
// oracle machine, computable functions, decidable and computably enumerable sets, the halting problem) and
// propositional formulas belong to logic ("lo:", 03B, 03D); the variants of the Turing machine used to measure
// resources (multitape, nondeterministic, probabilistic) and everything about time, space and circuits are here.
// Cryptography as such is 94A60 (information theory, "it:", planned); the complexity-theoretic foundations (one-way
// functions, pseudorandomness, zero knowledge) are here as 68P25 and 68Q.
// References: set theory "st:", elementary number theory "ent:", group theory "gt:", commutative algebra "ca:",
// combinatorics "co:" (graphs, probability placeholders), analysis "ana:" (asymptotic notation, logarithm, Hilbert
// space), and the folders built at the same time: logic "lo:", linear algebra "la:", general algebra "ga:" (monoid).
// Prefix for references from other folders: "cs:<id>".
// Sources: Sipser, Introduction to the Theory of Computation (3rd ed. 2012); Hopcroft, Motwani, Ullman, Introduction to
// Automata Theory, Languages, and Computation (3rd ed. 2006); Arora and Barak, Computational Complexity: A Modern
// Approach (2009); Goldreich, Foundations of Cryptography I (2001); Cormen, Leiserson, Rivest, Stein, Introduction to
// Algorithms (3rd ed. 2009); Li and Vitányi, An Introduction to Kolmogorov Complexity (3rd ed. 2008); Pin, Varieties of
// Formal Languages (1986). Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.CS_CONCEPTS = {
  title: "Concepts of theoretical computer science",

  areas: {
    "68P10": "68P10 Searching and sorting",
    "68P25": "68P25 Foundations of cryptography",
    "68W25": "68W25 Approximation algorithms",
    "68W40": "68W40 Analysis of algorithms",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 68Q25 / 68W40 / 68P10 Analysis of algorithms
    { id: "divide-and-conquer-recurrence", name: "Divide-and-conquer recurrence", kind: "konstruktion", area: "68W40", field: [68], msc: ["68W"], msc5: "68W40", uses: ["ana:asymptotic-notation", "st:map", "ent:natural-number"],
      formula: String.raw`T(n) = a\, T(n/b) + f(n)`,
      text: "The recurrence for the running time T(n) of an algorithm that splits a problem of size n into a subproblems of size n/b and spends f(n) on splitting and combining." },
    { id: "comparison-sort", name: "Comparison sort", kind: "konstruktion", area: "68P10", field: [68], msc: ["68P"], msc5: "68P10", uses: ["gr:tree", "gt:permutation", "st:total-order"],
      formula: String.raw`a_i \le a_j\,?`,
      text: "A sorting algorithm that accesses the elements of a totally ordered input only through comparisons a<sub>i</sub> ≤ a<sub>j</sub>. On inputs of size n it is modelled by a binary decision tree whose leaves are permutations." },

    // ------------------------------------------------------------ 68W25 Approximation
    { id: "approximation-algorithm", name: "Approximation algorithm", kind: "eigenschaft", area: "68W25", field: [68], msc: ["68W"], msc5: "68W25", uses: ["cc:running-time"],
      formula: String.raw`\mathrm{OPT} \le \mathrm{ALG} \le \rho\, \mathrm{OPT}`,
      text: "A polynomial-time algorithm for an optimization problem whose solution is within a factor ρ of the optimum on every instance (for minimization ALG ≤ ρ·OPT, for maximization ALG ≥ OPT/ρ)." },
    { id: "ptas", name: "Polynomial-time approximation scheme", kind: "eigenschaft", area: "68W25", field: [68], msc: ["68W"], msc5: "68W25", uses: ["approximation-algorithm"],
      formula: String.raw`\rho = 1 + \varepsilon,\quad \text{time } n^{f(1/\varepsilon)}`,
      text: "A family of (1 + ε)-approximation algorithms, one for each ε > 0, each running in polynomial time; fully polynomial (FPTAS) if the time is polynomial in n and 1/ε." },

    // ------------------------------------------------------------ 68P25 Foundations of cryptography
    { id: "negligible-function", name: "Negligible function", kind: "eigenschaft", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["st:map", "ent:natural-number", "ana:asymptotic-notation"],
      formula: String.raw`\mu(n) = n^{-\omega(1)}`,
      text: "A function μ from the natural numbers to the non-negative reals that eventually becomes smaller than 1/p(n) for every polynomial p." },
    { id: "one-way-function", name: "One-way function", kind: "objekt", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["negligible-function", "cc:probabilistic-turing-machine", "cc:running-time", "st:map"],
      formula: String.raw`\Pr_x[\,f(A(f(x))) = f(x)\,] = \mathrm{negl}(n)`,
      text: "A map f on binary words computable in polynomial time such that every probabilistic polynomial-time algorithm A, given f(x) for a uniformly random x of length n, finds a preimage only with negligible probability." },
    { id: "one-way-permutation", name: "One-way permutation", kind: "objekt", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["st:bijection"], isA: ["one-way-function"],
      formula: String.raw`f|_{\{0,1\}^n} \text{ bijective}`,
      text: "A one-way function that permutes the words of each length n." },
    { id: "hard-core-predicate", name: "Hard-core predicate", kind: "eigenschaft", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["one-way-function", "cc:boolean-function", "negligible-function"],
      formula: String.raw`\Pr_x[\,A(f(x)) = b(x)\,] \le \tfrac12 + \mathrm{negl}(n)`,
      text: "A polynomial-time predicate b of x that no probabilistic polynomial-time algorithm can guess from f(x) noticeably better than by tossing a coin." },
    { id: "computational-indistinguishability", name: "Computational indistinguishability", kind: "morphismus", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["negligible-function", "cc:probabilistic-turing-machine", "pr:probability-space"],
      formula: String.raw`\big|\Pr[D(X_n) = 1] - \Pr[D(Y_n) = 1]\big| = \mathrm{negl}(n)`,
      text: "Two sequences of probability distributions X<sub>n</sub>, Y<sub>n</sub> on words are computationally indistinguishable if every probabilistic polynomial-time distinguisher D has only negligible advantage in telling them apart." },
    { id: "pseudorandom-generator", name: "Pseudorandom generator", kind: "objekt", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["computational-indistinguishability", "cc:running-time"],
      formula: String.raw`G : \{0,1\}^n \to \{0,1\}^{\ell(n)},\quad G(U_n) \approx_c U_{\ell(n)}`,
      text: "A polynomial-time map G stretching n bits to ℓ(n) > n bits such that G applied to a uniform seed is computationally indistinguishable from uniform ℓ(n)-bit strings." },
    { id: "pseudorandom-function", name: "Pseudorandom function family", kind: "objekt", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["computational-indistinguishability", "cc:oracle-turing-machine"],
      formula: String.raw`\{F_k\}_{k \in \{0,1\}^n} \approx_c \text{random functions}`,
      text: "A family of efficiently computable functions F<sub>k</sub> indexed by a key k such that no probabilistic polynomial-time machine with oracle access can distinguish F<sub>k</sub> for random k from a truly random function, except with negligible advantage." },
    { id: "commitment-scheme", name: "Commitment scheme", kind: "objekt", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["computational-indistinguishability"],
      formula: String.raw`\mathrm{Com}(b; r) \approx_c \mathrm{Com}(b'; r')`,
      text: "A two-phase protocol in which a sender fixes a bit b in a commitment without revealing it (hiding: commitments to 0 and 1 are computationally indistinguishable) and later opens it; no sender can open a commitment to both values (binding)." },
    { id: "zero-knowledge-proof", name: "Zero-knowledge proof", kind: "eigenschaft", area: "68P25", field: [68], msc: ["68P"], msc5: "68P25", uses: ["cc:interactive-proof-system", "computational-indistinguishability"], isA: ["cc:interactive-proof-system"],
      formula: String.raw`\mathrm{view}_{V^*}\langle P, V^*\rangle(x) \approx_c S(x)`,
      text: "An interactive proof for L in which every probabilistic polynomial-time verifier V* learns nothing beyond x ∈ L: for x in L a polynomial-time simulator S produces a transcript indistinguishable from V*'s view of the interaction." },
  ],
};
