// Data model: concepts (definitions) of elementary number theory (MSC 2020 11A) and their definitional dependencies.
//
// Same model as graphs/algebraic-geometry/data/concepts.js (see its header comment), with one addition:
//   concepts id, name, kind, area, field, msc, msc5, uses, isA, formula, text.
//            `msc5`: five-character MSC 2020 class in which the concept is defined (e.g. "11A07"); its first three
//                    characters equal the first class in `msc`. Concepts from other fields (ring, group, real number)
//                    and the basic number concepts have no `msc5`.
//            `area`: group of the concept for colour and force layout; for 11A concepts the key names the
//                    five-character class (keys in `areas`).
//            `uses`: concepts that occur explicitly in the chosen definition ("B is defined with the help of A").
//                    Where several usual definitions exist, one has been chosen and is named in `text`.
//            `isA`:  direct generalisations under the standard definitions ("every B is an A"). Properties that are
//                    theorems (the Möbius function is multiplicative) are not entered as `isA`.
//                    For number properties of the form "a natural number with …" (prime, perfect, abundant) the natural
//                    number is entered only in `isA`, not in `uses` (user, 2 November 2026). Where the natural number
//                    is a parameter of a formula (Mersenne number 2^n − 1), it stays in `uses`.
//            References to concepts of other folders carry a prefix ("gt:group"; rules in ../../CLAUDE.md).
//   theoremConcepts  Mapping theorem id (data/theorems.js, not yet written) -> concepts occurring in the statement.
//
// Prefix for references from other folders: "ent:<id>".
// Sources: Hardy and Wright, An Introduction to the Theory of Numbers (6th ed. 2008); Niven, Zuckerman and
// Montgomery, An Introduction to the Theory of Numbers (5th ed. 1991); Ireland and Rosen, A Classical Introduction to
// Modern Number Theory (2nd ed. 1990). Not checked by a specialist.
// Checked by tests/check-concepts.js.

window.ENT_CONCEPTS = {
  title: "Concepts of elementary number theory",

  areas: {
    basic: "Numbers and algebraic structures (used, defined elsewhere)",
    "11A05": "11A05 Multiplicative structure, Euclidean algorithm, gcd",
    "11A07": "11A07 Congruences, primitive roots, residue systems",
    "11A15": "11A15 Power residues, reciprocity",
    "11A25": "11A25 Arithmetic functions",
    "11A41": "11A41 Primes",
    "11A51": "11A51 Factorization, primality",
    "11A55": "11A55 Continued fractions",
    "11A63": "11A63 Radix representation, digital problems",
    "11A67": "11A67 Other number representations",
    "11B39": "11B39 Fibonacci and Lucas numbers",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ Numbers and algebraic structures
    { id: "fibonacci-number", name: "Fibonacci number", kind: "objekt", area: "11B39", field: [11], msc: ["11B"], msc5: "11B39", uses: ["st:natural-number"], isA: ["st:natural-number"],
      formula: String.raw`F_1 = F_2 = 1,\quad F_{n+1} = F_n + F_{n-1}`,
      text: "The natural numbers F<sub>n</sub> = 1, 1, 2, 3, 5, 8, 13, … in which each is the sum of the two before. MSC 11B39, not 11A, but part of elementary number theory and not a prerequisite from another area (user, 2 November 2026); used for the Zeckendorf representation." },
    { id: "integer-part", name: "Integer part", kind: "konstruktion", area: "basic", field: [11], msc: ["11A"], uses: ["st:real-number", "st:integer"],
      formula: String.raw`\lfloor x \rfloor \le x < \lfloor x \rfloor + 1`,
      text: "For a real number x the largest integer ⌊x⌋ that is at most x." },
    { id: "logarithm", name: "Natural logarithm", kind: "konstruktion", area: "basic", field: [33], msc: ["33B"], uses: ["st:real-number"],
      formula: String.raw`\log x = \int_1^x \frac{dt}{t}`,
      text: "For a positive real number x the integral of 1/t from 1 to x; the inverse of the exponential function. Placeholder until analysis has a folder of its own." },

    // ------------------------------------------------------------ 11A05 Multiplicative structure
    { id: "divisibility", name: "Divisibility", kind: "morphismus", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["st:integer"],
      formula: String.raw`a \mid b \iff b = ka,\ k \in \mathbb Z`,
      text: "An integer a divides b if b is an integer multiple of a. Then a is a divisor of b and b a multiple of a." },
    { id: "division-with-remainder", name: "Division with remainder", kind: "konstruktion", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["st:integer", "st:natural-number"],
      formula: String.raw`a = qb + r,\quad 0 \le r < b`,
      text: "For an integer a and a natural number b the quotient q and the remainder r with a = qb + r and 0 ≤ r < b. They are unique." },
    { id: "gcd", name: "Greatest common divisor", kind: "invariante", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["divisibility", "st:integer"],
      formula: String.raw`\gcd(a, b)`,
      text: "For integers a, b not both zero the largest integer that divides both. Defined here by size; the characterisation by divisibility (every common divisor divides it) is a theorem." },
    { id: "lcm", name: "Least common multiple", kind: "invariante", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["divisibility", "st:integer", "st:natural-number"],
      formula: String.raw`\operatorname{lcm}(a, b)`,
      text: "For nonzero integers a, b the smallest natural number that both divide." },
    { id: "coprime", name: "Coprime", kind: "eigenschaft", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["gcd", "st:integer"],
      formula: String.raw`\gcd(a, b) = 1`,
      text: "Two integers are coprime (relatively prime) if their greatest common divisor is 1." },
    { id: "prime-factorization", name: "Prime factorization", kind: "konstruktion", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["prime-number", "st:natural-number"],
      formula: String.raw`n = p_1^{e_1} p_2^{e_2} \cdots p_k^{e_k},\quad p_1 < \dots < p_k`,
      text: "Representation of a natural number as a product of powers of distinct primes. Existence and uniqueness are the fundamental theorem of arithmetic." },
    { id: "p-adic-valuation", name: "p-adic valuation", kind: "invariante", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["prime-number", "divisibility", "st:integer"],
      formula: String.raw`v_p(n) = \max\{e : p^e \mid n\}`,
      text: "For a prime p and a nonzero integer n the exponent of the highest power of p that divides n." },
    { id: "squarefree", name: "Squarefree number", kind: "eigenschaft", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["prime-number", "divisibility"], isA: ["st:natural-number"],
      formula: String.raw`p^2 \nmid n`,
      text: "A natural number is squarefree if no square of a prime divides it." },
    { id: "radical", name: "Radical", kind: "invariante", area: "11A05", field: [11], msc: ["11A"], msc5: "11A05", uses: ["prime-number", "divisibility", "st:natural-number"],
      formula: String.raw`\operatorname{rad}(n) = \prod_{p \mid n} p`,
      text: "For a natural number n the product of the distinct primes that divide n. It appears in the abc conjecture." },

    // ------------------------------------------------------------ 11A07 Congruences, primitive roots
    { id: "congruence", name: "Congruence modulo n", kind: "morphismus", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["divisibility", "st:integer", "st:natural-number"],
      formula: String.raw`a \equiv b \pmod n \iff n \mid a - b`,
      text: "Two integers are congruent modulo a natural number n if n divides their difference. Introduced by Gauss (1801)." },
    { id: "residue-class", name: "Residue class", kind: "objekt", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["congruence", "st:set", "st:integer"],
      formula: String.raw`\bar a = a + n\mathbb Z`,
      text: "The set of all integers congruent to a modulo n." },
    { id: "complete-residue-system", name: "Complete residue system", kind: "objekt", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["residue-class", "st:set", "st:integer"],
      formula: String.raw`\{0, 1, \dots, n-1\}`,
      text: "A set of integers containing exactly one element of every residue class modulo n." },
    { id: "reduced-residue-system", name: "Reduced residue system", kind: "objekt", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["residue-class", "coprime", "st:set", "st:integer"],
      formula: String.raw`\{a_1, \dots, a_k\},\quad \gcd(a_i, n) = 1`,
      text: "A set of integers containing exactly one element of every residue class modulo n whose elements are coprime to n. It has φ(n) elements." },
    { id: "modular-inverse", name: "Inverse modulo n", kind: "konstruktion", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["congruence", "coprime", "st:integer"],
      formula: String.raw`a\,\bar a \equiv 1 \pmod n`,
      text: "For an integer a coprime to n an integer ā with a ā ≡ 1 modulo n. It is unique modulo n and is computed with the extended Euclidean algorithm." },
    { id: "linear-congruence", name: "Linear congruence", kind: "objekt", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["congruence"],
      formula: String.raw`a x \equiv b \pmod n`,
      text: "A congruence of the form ax ≡ b modulo n with unknown x. It is solvable exactly when gcd(a, n) divides b." },
    { id: "system-of-congruences", name: "System of congruences", kind: "objekt", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["congruence"],
      formula: String.raw`x \equiv a_i \pmod{n_i},\quad i = 1, \dots, k`,
      text: "Several congruences for the same unknown x with different moduli. For pairwise coprime moduli the Chinese remainder theorem gives exactly one solution modulo n<sub>1</sub> ⋯ n<sub>k</sub>." },
    { id: "residue-class-ring", name: "Residue class ring", kind: "konstruktion", area: "11A07", field: [11], msc: ["11A", "13A"], msc5: "11A07", uses: ["residue-class", "ca:commutative-ring"], isA: ["ca:commutative-ring"],
      formula: String.raw`\mathbb Z/n\mathbb Z,\quad \bar a + \bar b = \overline{a+b},\ \ \bar a \cdot \bar b = \overline{ab}`,
      text: "The n residue classes modulo n with the addition and multiplication of representatives. It is a commutative ring." },
    { id: "unit-group-mod-n", name: "Group of units modulo n", kind: "konstruktion", area: "11A07", field: [11], msc: ["11A", "20K"], msc5: "11A07", uses: ["residue-class-ring", "ca:unit", "residue-class", "coprime", "st:integer", "gt:group"], isA: ["gt:group"],
      formula: String.raw`(\mathbb Z/n\mathbb Z)^\times = \{\bar a : \gcd(a, n) = 1\}`,
      text: "The units of the residue class ring ℤ/nℤ, i.e. the residue classes of integers coprime to n, a group under multiplication. A set of representatives is a reduced residue system." },
    { id: "multiplicative-order", name: "Multiplicative order modulo n", kind: "invariante", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["congruence", "coprime", "st:natural-number"],
      formula: String.raw`\operatorname{ord}_n(a) = \min\{k \ge 1 : a^k \equiv 1 \pmod n\}`,
      text: "For a coprime to n the smallest natural number k ≥ 1 (exponent) with a<sup>k</sup> ≡ 1 modulo n. It equals the order of the class of a in the group of units." },
    { id: "primitive-root", name: "Primitive root", kind: "eigenschaft", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["multiplicative-order", "euler-phi", "st:integer"],
      formula: String.raw`\operatorname{ord}_n(g) = \varphi(n)`,
      text: "An integer g whose multiplicative order modulo n is φ(n), the value of Euler's totient function, so that its powers run through all residue classes coprime to n. Exists exactly for n = 1, 2, 4, p<sup>k</sup>, 2p<sup>k</sup> (p an odd prime)." },
    { id: "discrete-logarithm", name: "Index (discrete logarithm)", kind: "invariante", area: "11A07", field: [11], msc: ["11A"], msc5: "11A07", uses: ["primitive-root", "congruence", "coprime", "euler-phi"],
      formula: String.raw`g^{\operatorname{ind}_g a} \equiv a \pmod n,\quad 0 \le \operatorname{ind}_g a < \varphi(n)`,
      text: "For a primitive root g modulo n and a coprime to n the exponent k with g<sup>k</sup> ≡ a modulo n and 0 ≤ k < φ(n), φ Euler's totient function. Gauss called it the index." },

    // ------------------------------------------------------------ 11A15 Power residues, reciprocity
    { id: "power-residue", name: "k-th power residue", kind: "eigenschaft", area: "11A15", field: [11], msc: ["11A"], msc5: "11A15", uses: ["congruence", "coprime", "st:integer"],
      formula: String.raw`x^k \equiv a \pmod n \text{ solvable}`,
      text: "An integer a coprime to n is a k-th power residue modulo n if the congruence x<sup>k</sup> ≡ a modulo n has a solution; otherwise a k-th power non-residue." },
    { id: "quadratic-residue", name: "Quadratic residue", kind: "eigenschaft", area: "11A15", field: [11], msc: ["11A"], msc5: "11A15", uses: ["power-residue", "coprime", "congruence"], isA: ["power-residue"],
      formula: String.raw`x^2 \equiv a \pmod n \text{ solvable}`,
      text: "Power residue of exponent 2: a coprime to n is a square modulo n, i.e. the congruence x<sup>2</sup> ≡ a modulo n is solvable." },
    { id: "legendre-symbol", name: "Legendre symbol", kind: "invariante", area: "11A15", field: [11], msc: ["11A"], msc5: "11A15", uses: ["quadratic-residue", "prime-number", "divisibility"],
      formula: String.raw`\left(\frac{a}{p}\right) \in \{1, -1, 0\}`,
      text: "For an odd prime p: 1 if a is a quadratic residue modulo p, −1 if a is a non-residue, 0 if p divides a." },
    { id: "jacobi-symbol", name: "Jacobi symbol", kind: "invariante", area: "11A15", field: [11], msc: ["11A"], msc5: "11A15", uses: ["legendre-symbol", "prime-factorization", "st:natural-number"],
      formula: String.raw`\left(\frac{a}{n}\right) = \prod_{i} \left(\frac{a}{p_i}\right)^{e_i},\quad n = \prod_i p_i^{e_i}`,
      text: "For an odd natural number n the product of the Legendre symbols over the prime factorization of n. Value 1 does not imply that a is a quadratic residue modulo n." },
    { id: "kronecker-symbol", name: "Kronecker symbol", kind: "invariante", area: "11A15", field: [11], msc: ["11A"], msc5: "11A15", uses: ["jacobi-symbol", "legendre-symbol", "prime-factorization", "congruence", "divisibility", "st:integer"],
      formula: String.raw`\left(\frac{a}{2}\right) = \begin{cases} 0 & 2 \mid a \\ 1 & a \equiv \pm 1 \pmod 8 \\ -1 & a \equiv \pm 3 \pmod 8 \end{cases}`,
      text: "Extension of the Jacobi symbol (a/n) to every integer n: over the prime factorization n = ±p<sub>1</sub><sup>e<sub>1</sub></sup> ⋯ p<sub>k</sub><sup>e<sub>k</sub></sup> it is the product of (a/±1) and the (a/p<sub>i</sub>)<sup>e<sub>i</sub></sup>, with the Legendre symbol at odd primes, the value at 2 given on the right (0 if 2 divides a, otherwise by the congruence class of a modulo 8) and (a/−1) = −1 for a < 0, 1 otherwise. It describes the splitting of primes in quadratic fields." },

    // ------------------------------------------------------------ 11A25 Arithmetic functions
    { id: "arithmetic-function", name: "Arithmetic function", kind: "objekt", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["st:map", "st:natural-number", "st:complex-number"],
      formula: String.raw`f : \mathbb N \to \mathbb C`,
      text: "A function (map) on the natural numbers with complex (often integer) values." },
    { id: "multiplicative-function", name: "Multiplicative function", kind: "eigenschaft", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["arithmetic-function", "coprime"], isA: ["arithmetic-function"],
      formula: String.raw`f(mn) = f(m)\,f(n),\quad \gcd(m, n) = 1`,
      text: "An arithmetic function f with f(1) = 1 and f(mn) = f(m)f(n) for all coprime m and n. It is determined by its values at prime powers." },
    { id: "completely-multiplicative", name: "Completely multiplicative function", kind: "eigenschaft", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["arithmetic-function"], isA: ["multiplicative-function"],
      formula: String.raw`f(mn) = f(m)\,f(n)`,
      text: "An arithmetic function with f(1) = 1 and f(mn) = f(m)f(n) for all m and n, coprime or not." },
    { id: "dirichlet-convolution", name: "Dirichlet convolution", kind: "konstruktion", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["arithmetic-function", "divisibility"],
      formula: String.raw`(f * g)(n) = \sum_{d \mid n} f(d)\, g(n/d)`,
      text: "Product of two arithmetic functions, summed over the divisors of n. With it the arithmetic functions form a commutative ring." },
    { id: "euler-phi", name: "Euler's totient function", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["coprime", "st:integer", "st:cardinality"], isA: ["arithmetic-function"],
      formula: String.raw`\varphi(n) = \#\{1 \le a \le n : \gcd(a, n) = 1\}`,
      text: "Number (cardinality of the set) of integers from 1 to n that are coprime to n; equivalently the order of the group of units modulo n." },
    { id: "divisor-count", name: "Number of divisors", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["divisibility"], isA: ["divisor-function"],
      formula: String.raw`\tau(n) = \sum_{d \mid n} 1`,
      text: "Number of positive divisors of n, also written d(n)." },
    { id: "divisor-sum", name: "Sum of divisors", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["divisibility"], isA: ["divisor-function"],
      formula: String.raw`\sigma(n) = \sum_{d \mid n} d`,
      text: "Sum of the positive divisors of n, including n itself." },
    { id: "divisor-function", name: "Divisor function", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["divisibility"], isA: ["arithmetic-function"],
      formula: String.raw`\sigma_k(n) = \sum_{d \mid n} d^k`,
      text: "Sum of the k-th powers of the positive divisors of n. The number of divisors is σ<sub>0</sub> = τ, the sum of divisors σ<sub>1</sub> = σ." },
    { id: "moebius", name: "Möbius function", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["squarefree", "prime-factorization", "prime-number", "divisibility"], isA: ["arithmetic-function"],
      formula: String.raw`\mu(n) = \begin{cases} (-1)^k & n = p_1 \cdots p_k \\ 0 & p^2 \mid n \end{cases}`,
      text: "Defined by the prime factorization: μ(n) = (−1)<sup>k</sup> if n is squarefree and the product of k distinct primes p<sub>1</sub>, …, p<sub>k</sub> (so μ(1) = 1), and μ(n) = 0 if n is not squarefree, i.e. if the square of some prime p divides n. It is the inverse of the constant function 1 under Dirichlet convolution (Möbius inversion)." },
    { id: "prime-omega", name: "Number of prime factors", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["prime-factorization"], isA: ["arithmetic-function"],
      formula: String.raw`\omega(n) = k,\quad \Omega(n) = e_1 + \dots + e_k,\quad n = p_1^{e_1} \cdots p_k^{e_k}`,
      text: "For the prime factorization of n the number ω(n) of distinct prime factors and the number Ω(n) of prime factors counted with multiplicity." },
    { id: "liouville", name: "Liouville function", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["prime-omega"], isA: ["arithmetic-function"],
      formula: String.raw`\lambda(n) = (-1)^{\Omega(n)}`,
      text: "Sign given by the number Ω(n) of prime factors of n counted with multiplicity." },
    { id: "von-mangoldt", name: "Von Mangoldt function", kind: "invariante", area: "11A25", field: [11], msc: ["11A", "11N"], msc5: "11A25", uses: ["prime-number", "logarithm"], isA: ["arithmetic-function"],
      formula: String.raw`\Lambda(n) = \begin{cases} \log p & n = p^k,\ k \ge 1 \\ 0 & \text{otherwise} \end{cases}`,
      text: "log p, the natural logarithm of p, at the powers of a prime p and 0 elsewhere. Its partial sums count primes with weights, which simplifies the prime number theorem." },
    { id: "carmichael-lambda", name: "Carmichael function", kind: "invariante", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["unit-group-mod-n", "gt:group-exponent", "congruence", "coprime"], isA: ["arithmetic-function"],
      formula: String.raw`\lambda(n) = \exp\big((\mathbb Z/n\mathbb Z)^\times\big)`,
      text: "Defined here as the exponent of the group of units modulo n: the smallest m ≥ 1 with a<sup>m</sup> ≡ 1 modulo n for every a coprime to n. It divides φ(n)." },
    { id: "perfect-number", name: "Perfect number", kind: "eigenschaft", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["divisor-sum"], isA: ["st:natural-number"],
      formula: String.raw`\sigma(n) = 2n`,
      text: "A natural number equal to the sum of its proper divisors, i.e. σ(n) = 2n for the sum of divisors σ: 6, 28, 496, 8128, …" },
    { id: "abundant-number", name: "Abundant number", kind: "eigenschaft", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["divisor-sum"], isA: ["st:natural-number"],
      formula: String.raw`\sigma(n) > 2n`,
      text: "A natural number smaller than the sum of its proper divisors, i.e. σ(n) > 2n for the sum of divisors σ: 12, 18, 20, 24, …" },
    { id: "amicable-numbers", name: "Amicable numbers", kind: "objekt", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["divisor-sum", "st:natural-number"],
      formula: String.raw`\sigma(m) - m = n,\quad \sigma(n) - n = m,\quad m \ne n`,
      text: "Two different natural numbers each of which is the sum of the proper divisors of the other (σ(m) − m = n with the sum of divisors σ), such as 220 and 284 (known to the Pythagoreans)." },
    { id: "highly-composite", name: "Highly composite number", kind: "eigenschaft", area: "11A25", field: [11], msc: ["11A"], msc5: "11A25", uses: ["divisor-count"], isA: ["st:natural-number"],
      formula: String.raw`\tau(m) < \tau(n),\quad m < n`,
      text: "A natural number n with more divisors than every smaller natural number m, i.e. τ(m) < τ(n) for the number of divisors τ: 1, 2, 4, 6, 12, 24, 36, 48, 60, … Studied by Ramanujan (1915)." },

    // ------------------------------------------------------------ 11A41 Primes
    { id: "prime-number", name: "Prime number", kind: "objekt", area: "11A41", field: [11], msc: ["11A"], msc5: "11A41", uses: ["divisibility"], isA: ["st:natural-number"],
      formula: String.raw`p > 1,\quad d \mid p \Rightarrow d \in \{1, p\}`,
      text: "A natural number greater than 1 whose only positive divisors are 1 and itself. Defined here as irreducible; that it is prime in the ring-theoretic sense (p | ab implies p | a or p | b) is Euclid's lemma." },
    { id: "composite-number", name: "Composite number", kind: "eigenschaft", area: "11A41", field: [11], msc: ["11A"], msc5: "11A41", uses: ["prime-number"], isA: ["st:natural-number"],
      formula: String.raw`n > 1,\ n \text{ not prime}`,
      text: "A natural number greater than 1 that is not prime, i.e. a product of two smaller natural numbers." },
    { id: "twin-primes", name: "Twin primes", kind: "objekt", area: "11A41", field: [11], msc: ["11A", "11N"], msc5: "11A41", uses: ["prime-number"],
      formula: String.raw`(p,\ p + 2)`,
      text: "A pair of primes with difference 2: (3, 5), (5, 7), (11, 13), …" },
    { id: "sophie-germain-prime", name: "Sophie Germain prime", kind: "eigenschaft", area: "11A41", field: [11], msc: ["11A"], msc5: "11A41", uses: ["prime-number"], isA: ["prime-number"],
      formula: String.raw`p \text{ and } 2p + 1 \text{ prime}`,
      text: "A prime p for which 2p + 1 is also prime. Sophie Germain proved the first case of Fermat's Last Theorem for such exponents." },
    { id: "mersenne-number", name: "Mersenne number", kind: "objekt", area: "11A41", field: [11], msc: ["11A"], msc5: "11A41", uses: ["st:natural-number"], isA: ["st:natural-number"],
      formula: String.raw`M_n = 2^n - 1`,
      text: "A number of the form 2<sup>n</sup> − 1 for a natural number n. It can only be prime if n is prime." },
    { id: "mersenne-prime", name: "Mersenne prime", kind: "eigenschaft", area: "11A41", field: [11], msc: ["11A"], msc5: "11A41", uses: ["mersenne-number", "prime-number"], isA: ["prime-number", "mersenne-number"],
      formula: String.raw`2^p - 1 \text{ prime}`,
      text: "A Mersenne number that is prime. The even perfect numbers are exactly 2<sup>p−1</sup>(2<sup>p</sup> − 1) with 2<sup>p</sup> − 1 a Mersenne prime." },
    { id: "wieferich-prime", name: "Wieferich prime", kind: "eigenschaft", area: "11A41", field: [11], msc: ["11A"], msc5: "11A41", uses: ["prime-number", "congruence"], isA: ["prime-number"],
      formula: String.raw`2^{p-1} \equiv 1 \pmod{p^2}`,
      text: "A prime p with the congruence 2<sup>p−1</sup> ≡ 1 modulo p<sup>2</sup>, so that Fermat's little theorem for the base 2 holds even modulo p<sup>2</sup>. Only 1093 and 3511 are known. Wieferich (1909) showed their connection with the first case of Fermat's Last Theorem." },
    { id: "fermat-number", name: "Fermat number", kind: "objekt", area: "11A41", field: [11], msc: ["11A"], msc5: "11A41", uses: ["st:natural-number"], isA: ["st:natural-number"],
      formula: String.raw`F_n = 2^{2^n} + 1`,
      text: "A number of the form 2<sup>2<sup>n</sup></sup> + 1 for a natural number n. F<sub>0</sub> to F<sub>4</sub> are prime; Euler showed that 641 divides F<sub>5</sub>." },
    { id: "prime-counting", name: "Prime-counting function", kind: "invariante", area: "11A41", field: [11], msc: ["11A", "11N"], msc5: "11A41", uses: ["prime-number", "st:real-number", "st:cardinality"],
      formula: String.raw`\pi(x) = \#\{p \le x : p \text{ prime}\}`,
      text: "For a real number x the number (cardinality of the set) of primes not exceeding x." },

    // ------------------------------------------------------------ 11A51 Factorization, primality
    { id: "fermat-pseudoprime", name: "Fermat pseudoprime", kind: "eigenschaft", area: "11A51", field: [11], msc: ["11A"], msc5: "11A51", uses: ["composite-number", "congruence", "st:integer"], isA: ["composite-number"],
      formula: String.raw`a^{n-1} \equiv 1 \pmod n,\quad n \text{ composite}`,
      text: "A composite number n with the congruence a<sup>n−1</sup> ≡ 1 modulo n for an integer a, i.e. it passes Fermat's primality test to the base a. The smallest to base 2 is 341 = 11 · 31." },
    { id: "carmichael-number", name: "Carmichael number", kind: "eigenschaft", area: "11A51", field: [11], msc: ["11A"], msc5: "11A51", uses: ["fermat-pseudoprime", "coprime"], isA: ["composite-number"],
      formula: String.raw`a^{n-1} \equiv 1 \pmod n,\quad \gcd(a, n) = 1`,
      text: "A composite number that is a Fermat pseudoprime to every base a coprime to it. The smallest is 561 = 3 · 11 · 17." },
    { id: "euler-pseudoprime", name: "Euler pseudoprime", kind: "eigenschaft", area: "11A51", field: [11], msc: ["11A"], msc5: "11A51", uses: ["composite-number", "congruence", "jacobi-symbol", "coprime"], isA: ["composite-number"],
      formula: String.raw`a^{(n-1)/2} \equiv \left(\frac{a}{n}\right) \pmod n,\quad n \text{ odd composite}`,
      text: "An odd composite number n that passes Euler's criterion to the base a coprime to n: a<sup>(n−1)/2</sup> is congruent modulo n to the Jacobi symbol (a/n). This is the test of Solovay and Strassen (1977); no composite number passes it for all bases." },
    { id: "strong-pseudoprime", name: "Strong pseudoprime", kind: "eigenschaft", area: "11A51", field: [11], msc: ["11A"], msc5: "11A51", uses: ["composite-number", "congruence"], isA: ["composite-number"],
      formula: String.raw`\begin{gathered} n - 1 = 2^s d,\ d \text{ odd} \\ a^d \equiv 1 \ \text{ or } \ a^{2^r d} \equiv -1 \pmod n,\ \ 0 \le r < s \end{gathered}`,
      text: "An odd composite number n that passes the Miller–Rabin test to the base a: with n − 1 = 2<sup>s</sup>d and d odd, either a<sup>d</sup> ≡ 1 or a<sup>2<sup>r</sup>d</sup> ≡ −1 modulo n for some r with 0 ≤ r < s. The smallest to base 2 is 2047 = 23 · 89." },

    // ------------------------------------------------------------ 11A55 Continued fractions
    { id: "continued-fraction", name: "Simple continued fraction", kind: "konstruktion", area: "11A55", field: [11], msc: ["11A"], msc5: "11A55", uses: ["st:real-number", "integer-part"],
      formula: String.raw`x = a_0 + \cfrac{1}{a_1 + \cfrac{1}{a_2 + \dotsb}},\quad a_k = \lfloor x_k \rfloor`,
      text: "Expansion of a real number x by repeatedly taking the integer part and inverting the remainder. It is finite exactly for rational x." },
    { id: "convergent", name: "Convergent", kind: "konstruktion", area: "11A55", field: [11], msc: ["11A"], msc5: "11A55", uses: ["continued-fraction", "st:rational-number"],
      formula: String.raw`\frac{p_k}{q_k} = [a_0; a_1, \dots, a_k]`,
      text: "The rational number obtained by breaking off the continued fraction after a<sub>k</sub>. The convergents are the best rational approximations of x." },
    { id: "periodic-continued-fraction", name: "Periodic continued fraction", kind: "eigenschaft", area: "11A55", field: [11], msc: ["11A"], msc5: "11A55", uses: ["continued-fraction"],
      formula: String.raw`[a_0; a_1, \dots, a_m, \overline{a_{m+1}, \dots, a_{m+\ell}}]`,
      text: "A continued fraction whose terms repeat from some point on. By Lagrange's theorem these are exactly the expansions of irrational quadratic numbers." },

    // ------------------------------------------------------------ 11A63 Radix representation
    { id: "base-representation", name: "Base-b representation", kind: "konstruktion", area: "11A63", field: [11], msc: ["11A"], msc5: "11A63", uses: ["st:natural-number"],
      formula: String.raw`n = \sum_{i=0}^{k} d_i\, b^i,\quad 0 \le d_i < b,\ d_k \ne 0`,
      text: "Representation of a natural number by digits d<sub>i</sub> in base b ≥ 2. It exists and is unique." },
    { id: "digit-sum", name: "Digit sum", kind: "invariante", area: "11A63", field: [11], msc: ["11A"], msc5: "11A63", uses: ["base-representation"], isA: ["arithmetic-function"],
      formula: String.raw`s_b(n) = \sum_{i} d_i`,
      text: "Sum of the digits of n in base b. Modulo b − 1 it is congruent to n (casting out nines)." },

    // ------------------------------------------------------------ 11A67 Other number representations
    { id: "zeckendorf-representation", name: "Zeckendorf representation", kind: "konstruktion", area: "11A67", field: [11], msc: ["11A", "11B"], msc5: "11A67", uses: ["st:natural-number", "fibonacci-number"],
      formula: String.raw`n = F_{k_1} + F_{k_2} + \dots + F_{k_r},\quad k_{i} \ge k_{i+1} + 2,\ k_r \ge 2`,
      text: "Representation of a natural number as a sum of Fibonacci numbers no two of which are consecutive. It exists and is unique (Zeckendorf 1972, Lekkerkerker 1952)." },
  ],

  // Filled with data/theorems.js (step 4 in ../CLAUDE.md).
  theoremConcepts: {},
};
