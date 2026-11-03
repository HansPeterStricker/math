// Data of the concept graph (concepts.html): concepts (definitions) of further number theory, MSC 2020 11C
// (polynomials and matrices over ℤ), 11K (probabilistic number theory: distribution modulo 1, discrepancy, normal
// numbers, metric theory of continued fractions, additive functions), 11L (exponential sums and character sums) and
// 11Y (computational number theory: primality tests, factorization, discrete logarithms). In English. Built on
// 3 November 2026. Moved here by rule 1 of ../../CLAUDE.md, with its id: `gauss-sum` from
// ../../algebraic-number-theory/ (there a placeholder in "basic" with class 11L).
//
// Same model as ../../elementary-number-theory/data/concepts.js (see its header comment). `area` is the
// three-character MSC class (11C, 11K, 11L, 11Y); "basic" holds two placeholders from real analysis (26A, 26B) that the
// analysis folder does not have yet. Every concept that a definition (name, formula, defining prose) uses explicitly
// is in `uses`.
//
// Division of work with the neighbouring folders: congruences, pseudoprimes, continued fractions and base-b digits
// stay in elementary number theory ("ent:", 11A); Dirichlet characters and smooth-number counts belong to analytic
// number theory in arithmetic geometry ("ar:", 11M, 11N); Gauss sums over finite fields and Weil's bound for
// multiplicative character sums belong to field theory ("ft:", 11T); irrational numbers, approximation and the height
// of an algebraic number to Diophantine number theory ("dio:", 11J); cyclotomic polynomials and roots of unity to
// algebraic number theory ("ant:", 11R); the discrete logarithm problem as a cryptographic assumption to information
// theory ("it:", 94A); complexity classes to computer science ("cs:", 68Q).
// References: "st:", "ent:", "gt:", "ca:", "ant:", "ar:", "ag:", "ana:", "dio:", "ft:", "la:", "pr:", "ds:", "cs:",
// "it:", "num:".
// Prefix for references from other folders: "fnt:<id>".
// Sources: Kuipers and Niederreiter, Uniform Distribution of Sequences (1974); Drmota and Tichy, Sequences,
// Discrepancies and Applications (LNM 1651, 1997); Iwaniec and Kowalski, Analytic Number Theory (2004); Montgomery,
// Ten Lectures on the Interface between Analytic Number Theory and Harmonic Analysis (1994); Graham and Kolesnik, Van
// der Corput's Method of Exponential Sums (1991); Tenenbaum, Introduction to Analytic and Probabilistic Number Theory
// (3rd ed. 2015); Khinchin, Continued Fractions (1964); Crandall and Pomerance, Prime Numbers: A Computational
// Perspective (2nd ed. 2005); Cohen, A Course in Computational Algebraic Number Theory (1993); Borwein and Erdélyi,
// Polynomials and Polynomial Inequalities (1995); Smyth, The Mahler measure of algebraic numbers: a survey (2008).
// Not checked by a specialist.
// Checked by ../../tests/check-concepts.js.

window.FNT_CONCEPTS = {
  title: "Concepts of further number theory",

  areas: {
    basic: "Defined elsewhere, no home folder entry yet",
    "11C": "11C Polynomials and matrices over ℤ",
    "11K": "11K Probabilistic number theory: distribution modulo 1, normal numbers",
    "11L": "11L Exponential sums and character sums",
    "11Y": "11Y Computational number theory",
  },

  kinds: {
    objekt: "Object",
    eigenschaft: "Property",
    morphismus: "Relation or morphism",
    konstruktion: "Construction",
    invariante: "Invariant",
  },

  concepts: [
    // ------------------------------------------------------------ 11K Distribution modulo 1, discrepancy
    { id: "fractional-part", name: "Fractional part", kind: "konstruktion", area: "11K", field: [11], msc: ["11K"], msc5: "11K06", uses: ["ent:integer-part", "st:real-number"],
      formula: String.raw`\{x\} = x - \lfloor x \rfloor \in [0, 1)`,
      text: "For a real number x the difference between x and its integer part. Reducing modulo 1 means passing from x to {x}; for vectors it is taken in each coordinate, which identifies ℝ<sup>d</sup>/ℤ<sup>d</sup> with the unit cube [0, 1)<sup>d</sup>." },
    { id: "equidistributed-sequence", name: "Sequence equidistributed modulo 1", kind: "eigenschaft", area: "11K", field: [11], msc: ["11K"], msc5: "11K06", uses: ["fractional-part", "ana:sequence-limit"],
      formula: String.raw`\lim_{N\to\infty} \frac{\#\{n \le N : \{x_n\} \in [a, b)\}}{N} = b - a`,
      text: "A sequence (x<sub>n</sub>) of real numbers is equidistributed (uniformly distributed) modulo 1 if for every interval [a, b) in [0, 1) the proportion of n ≤ N with {x<sub>n</sub>} in [a, b) tends to its length b − a. For sequences in ℝ<sup>d</sup> the intervals are replaced by boxes and the length by the volume." },
    { id: "kronecker-sequence", name: "Kronecker sequence", kind: "objekt", area: "11K", field: [11], msc: ["11K"], msc5: "11K06", uses: ["fractional-part", "dio:irrational-number"],
      formula: String.raw`x_n = \big(\{n\alpha_1\}, \dots, \{n\alpha_d\}\big)`,
      text: "For real numbers α<sub>1</sub>, …, α<sub>d</sub>, usually irrational, the sequence of the fractional parts of the multiples nα. In dimension 1 it is the orbit of 0 under the rotation of the circle by α." },
    { id: "discrepancy", name: "Discrepancy", kind: "invariante", area: "11K", field: [11], msc: ["11K"], msc5: "11K38", uses: ["fractional-part", "st:supremum"],
      formula: String.raw`D_N = \sup_{0 \le a < b \le 1} \left| \frac{\#\{n \le N : \{x_n\} \in [a, b)\}}{N} - (b - a) \right|`,
      text: "For the first N terms of a sequence, the largest deviation, over all intervals [a, b) of [0, 1), of the proportion of terms in the interval from its length. A sequence is equidistributed modulo 1 if and only if D<sub>N</sub> tends to 0." },
    { id: "star-discrepancy", name: "Star discrepancy", kind: "invariante", area: "11K", field: [11], msc: ["11K"], msc5: "11K38", uses: ["fractional-part", "st:supremum"],
      formula: String.raw`D_N^* = \sup_{t \in [0,1]^d} \left| \frac{\#\{n \le N : \{x_n\} \in [0, t)\}}{N} - t_1 \cdots t_d \right|`,
      text: "The discrepancy restricted to boxes [0, t) = [0, t<sub>1</sub>) × … × [0, t<sub>d</sub>) anchored at the origin. In dimension d it lies between D<sub>N</sub>/2<sup>d</sup> and D<sub>N</sub>; it is the quantity in the Koksma–Hlawka inequality." },
    { id: "low-discrepancy-sequence", name: "Low-discrepancy sequence", kind: "eigenschaft", area: "11K", field: [11], msc: ["11K"], msc5: "11K38", uses: ["star-discrepancy", "ana:asymptotic-notation"],
      formula: String.raw`D_N^* = O\!\left(\frac{(\log N)^d}{N}\right)`,
      text: "A sequence in [0, 1)<sup>d</sup> whose star discrepancy is O((log N)<sup>d</sup>/N), the best order known. Random points only reach about N<sup>−1/2</sup>. Van der Corput, Halton, Sobol' and Niederreiter sequences are examples." },
    { id: "van-der-corput-sequence", name: "Van der Corput sequence", kind: "objekt", area: "11K", field: [11], msc: ["11K"], msc5: "11K38", uses: ["ent:base-representation"],
      formula: String.raw`\phi_b\Big(\sum_{j \ge 0} a_j b^j\Big) = \sum_{j \ge 0} a_j b^{-j-1}`,
      text: "For a base b ≥ 2 the sequence φ<sub>b</sub>(0), φ<sub>b</sub>(1), φ<sub>b</sub>(2), … of radical inverses: the base-b digits of n are mirrored at the point. For b = 2 it begins 0, 1/2, 1/4, 3/4, 1/8, 5/8." },
    { id: "halton-sequence", name: "Halton sequence", kind: "objekt", area: "11K", field: [11], msc: ["11K"], msc5: "11K38", uses: ["van-der-corput-sequence", "ent:coprime"],
      formula: String.raw`x_n = \big(\phi_{b_1}(n), \dots, \phi_{b_d}(n)\big)`,
      text: "For pairwise coprime bases b<sub>1</sub>, …, b<sub>d</sub> (usually the first d primes) the sequence of vectors whose coordinates are the van der Corput sequences in these bases." },
    { id: "quasi-monte-carlo-method", name: "Quasi-Monte Carlo method", kind: "konstruktion", area: "11K", field: [11, 65], msc: ["11K", "65D"], msc5: "11K45", uses: ["low-discrepancy-sequence", "ana:riemann-integral", "num:monte-carlo-integration"],
      formula: String.raw`\int_{[0,1]^d} f \approx \frac{1}{N} \sum_{n=1}^{N} f(x_n)`,
      text: "Numerical integration over the unit cube by the average of f at the first N points of a low-discrepancy sequence instead of random points as in the Monte Carlo method. The Koksma–Hlawka inequality bounds the error." },
    { id: "normal-number", name: "Normal number", kind: "eigenschaft", area: "11K", field: [11], msc: ["11K"], msc5: "11K16", uses: ["ent:base-representation", "st:real-number"],
      formula: String.raw`\lim_{N\to\infty} \frac{\#\{n \le N : a_n a_{n+1} \cdots a_{n+k-1} = w\}}{N} = b^{-k}`,
      text: "A real number is normal in base b if in its base-b expansion a<sub>1</sub>a<sub>2</sub>a<sub>3</sub>… after the point every block w of k digits occurs with limiting frequency b<sup>−k</sup>, for every k ≥ 1. For k = 1 alone the number is called simply normal." },
    { id: "absolutely-normal-number", name: "Absolutely normal number", kind: "eigenschaft", area: "11K", field: [11], msc: ["11K"], msc5: "11K16", uses: ["normal-number"],
      text: "A real number that is normal in every base b ≥ 2. Almost every real number is absolutely normal (Borel), but no classical constant such as √2, π or e is known to be normal in any base." },
    { id: "champernowne-constant", name: "Champernowne constant", kind: "objekt", area: "11K", field: [11], msc: ["11K"], msc5: "11K16", uses: ["ent:base-representation", "ent:natural-number"],
      formula: String.raw`C_{10} = 0.123456789101112131415\ldots`,
      text: "The number whose decimal expansion after the point is the concatenation of the decimal expansions of 1, 2, 3, …. The same construction works in every base b." },
    { id: "gauss-map", name: "Gauss map of continued fractions", kind: "morphismus", area: "11K", field: [11, 37], msc: ["11K", "37A"], msc5: "11K50", uses: ["fractional-part", "ent:continued-fraction"],
      formula: String.raw`T(x) = \left\{\frac{1}{x}\right\},\quad T(0) = 0`,
      text: "The map of [0, 1) to itself that sends x ≠ 0 to the fractional part of 1/x. It shifts the continued fraction expansion: if x = [0; a<sub>1</sub>, a<sub>2</sub>, …] then T(x) = [0; a<sub>2</sub>, a<sub>3</sub>, …] and a<sub>1</sub> = ⌊1/x⌋." },
    { id: "gauss-measure", name: "Gauss measure", kind: "konstruktion", area: "11K", field: [11], msc: ["11K"], msc5: "11K50", uses: ["ana:lebesgue-measure", "ana:logarithm"],
      formula: String.raw`\mu(A) = \frac{1}{\log 2} \int_A \frac{dx}{1 + x}`,
      text: "The probability measure on [0, 1) with density 1/((1 + x) log 2) with respect to Lebesgue measure. It is invariant under the Gauss map." },
    { id: "additive-function", name: "Additive arithmetic function", kind: "eigenschaft", area: "11K", field: [11], msc: ["11K", "11A"], msc5: "11K65", uses: ["ent:arithmetic-function", "ent:coprime"],
      formula: String.raw`f(mn) = f(m) + f(n),\quad \gcd(m, n) = 1`,
      text: "An arithmetic function f with f(mn) = f(m) + f(n) whenever m and n are coprime; it is strongly additive if moreover f(p<sup>k</sup>) = f(p) for every prime power. The number ω(n) of distinct prime factors is strongly additive, Ω(n) is completely additive." },
    { id: "normal-order", name: "Normal order", kind: "morphismus", area: "11K", field: [11], msc: ["11K"], msc5: "11K65", uses: ["ent:arithmetic-function", "ana:asymptotic-notation"],
      formula: String.raw`(1 - \varepsilon)\, g(n) \le f(n) \le (1 + \varepsilon)\, g(n)`,
      text: "An arithmetic function f has normal order g if for every ε > 0 the inequality shown holds for almost all n, that is, for all n outside a set of natural density 0. Usually g is a simple increasing function such as log log n." },

    // ------------------------------------------------------------ 11L Exponential sums and character sums
    { id: "exponential-sum", name: "Exponential sum", kind: "konstruktion", area: "11L", field: [11], msc: ["11L"], msc5: "11L03", uses: ["ana:exponential-function", "st:complex-number"],
      formula: String.raw`S = \sum_{M < n \le M + N} e\big(f(n)\big),\quad e(x) = e^{2\pi i x}`,
      text: "A sum of complex numbers of absolute value 1 of the form e(f(n)) with a real function f, over an interval of integers or over residue classes. Estimates |S| = o(N) express cancellation; the trivial bound is N." },
    { id: "weyl-sum", name: "Weyl sum", kind: "konstruktion", area: "11L", field: [11], msc: ["11L"], msc5: "11L15", uses: ["exponential-sum", "ca:polynomial-ring"], isA: ["exponential-sum"],
      formula: String.raw`\sum_{n \le N} e\big(\alpha_k n^k + \dots + \alpha_1 n\big)`,
      text: "An exponential sum whose phase f is a real polynomial. Weyl sums with f(n) = αn<sup>k</sup> appear in the circle method for Waring's problem." },
    { id: "gauss-sum", name: "Gauss sum", kind: "konstruktion", area: "11L", field: [11], msc: ["11L"], msc5: "11L05", uses: ["ar:dirichlet-character", "ant:root-of-unity", "ent:residue-class", "st:complex-number"],
      formula: String.raw`\tau(\chi) = \sum_{a \bmod q} \chi(a)\, e(a/q)`,
      text: "For a Dirichlet character χ modulo q, the sum of χ(a)ζ<sub>q</sub><sup>a</sup> over the residue classes a modulo q, where ζ<sub>q</sub> = e(1/q) = e<sup>2πi/q</sup> is a primitive q-th root of unity in ℂ. For primitive χ its absolute value is √q; for the Legendre symbol modulo an odd prime p its square is ±p." },
    { id: "quadratic-gauss-sum", name: "Quadratic Gauss sum", kind: "konstruktion", area: "11L", field: [11], msc: ["11L"], msc5: "11L05", uses: ["exponential-sum", "ent:residue-class"],
      formula: String.raw`G(a; q) = \sum_{n \bmod q} e\!\left(\frac{a n^2}{q}\right)`,
      text: "For integers a and q ≥ 1 the sum of e(an<sup>2</sup>/q) over the residue classes n modulo q. For an odd prime q and q ∤ a it equals the Gauss sum of the Legendre symbol times (a/q)." },
    { id: "kloosterman-sum", name: "Kloosterman sum", kind: "konstruktion", area: "11L", field: [11], msc: ["11L"], msc5: "11L05", uses: ["exponential-sum", "ent:reduced-residue-system", "ent:modular-inverse"],
      formula: String.raw`S(a, b; q) = \sum_{\substack{x \bmod q \\ \gcd(x, q) = 1}} e\!\left(\frac{a x + b \bar{x}}{q}\right)`,
      text: "For integers a, b and q ≥ 1 the sum over the reduced residue classes x modulo q, where x̄ is the inverse of x modulo q. It is a real number and occurs in the Fourier coefficients of Poincaré series and in the spectral theory of automorphic forms." },
    { id: "character-sum", name: "Character sum", kind: "konstruktion", area: "11L", field: [11], msc: ["11L"], msc5: "11L40", uses: ["ar:dirichlet-character"],
      formula: String.raw`S_\chi(M, N) = \sum_{M < n \le M + N} \chi(n)`,
      text: "For a Dirichlet character χ modulo q the sum of its values over an interval of N consecutive integers. For a non-principal χ the sum over a full period vanishes, so the question is the size of incomplete sums with N < q." },
    { id: "ramanujan-sum", name: "Ramanujan sum", kind: "konstruktion", area: "11L", field: [11], msc: ["11L", "11A"], msc5: "11L03", uses: ["exponential-sum", "ent:reduced-residue-system"],
      formula: String.raw`c_q(n) = \sum_{\substack{a \bmod q \\ \gcd(a, q) = 1}} e\!\left(\frac{a n}{q}\right)`,
      text: "For integers q ≥ 1 and n the sum of the n-th powers of the primitive q-th roots of unity. It is an integer; c<sub>q</sub>(1) = μ(q)." },
    { id: "prime-exponential-sum", name: "Exponential sum over primes", kind: "konstruktion", area: "11L", field: [11], msc: ["11L"], msc5: "11L20", uses: ["exponential-sum", "ent:von-mangoldt"],
      formula: String.raw`S(\alpha) = \sum_{n \le N} \Lambda(n)\, e(n\alpha)`,
      text: "The exponential sum of the linear phase nα weighted by the von Mangoldt function, so that essentially it runs over the primes. It is the generating function of the circle method for the ternary Goldbach problem." },
    { id: "exponent-pair", name: "Exponent pair", kind: "eigenschaft", area: "11L", field: [11], msc: ["11L"], msc5: "11L07", uses: ["exponential-sum", "ana:asymptotic-notation"],
      formula: String.raw`\sum_{N < n \le 2N} e\big(f(n)\big) \ll \Big(\frac{F}{N}\Big)^{\kappa} N^{\lambda}`,
      text: "A pair (κ, λ) with 0 ≤ κ ≤ 1/2 ≤ λ ≤ 1 such that the bound holds for every phase f in a standard class of smooth functions on [N, 2N] whose derivatives behave like those of F·(x/N)<sup>−s</sup>, with F ≥ N. The trivial pair is (0, 1)." },

    // ------------------------------------------------------------ 11Y Computational number theory
    { id: "modular-exponentiation", name: "Modular exponentiation (square and multiply)", kind: "konstruktion", area: "11Y", field: [11, 68], msc: ["11Y"], msc5: "11Y16", uses: ["ent:residue-class-ring", "ent:base-representation"],
      formula: String.raw`a^{e} = \prod_{j : e_j = 1} a^{2^j},\quad e = \sum_j e_j 2^j`,
      text: "The algorithm that computes a<sup>e</sup> modulo n from the binary digits of e by repeated squaring and multiplication, with at most 2 log<sub>2</sub> e multiplications modulo n." },
    { id: "primality-test", name: "Primality test", kind: "konstruktion", area: "11Y", field: [11, 68], msc: ["11Y"], msc5: "11Y11", uses: ["ent:prime-number", "cs:running-time"],
      text: "An algorithm that decides for a given natural number n whether it is prime. A probabilistic test may declare a composite number prime with small probability (a probable prime); a deterministic test makes no error; a primality proof outputs a certificate that can be checked quickly." },
    { id: "fermat-test", name: "Fermat primality test", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y11", uses: ["primality-test", "ent:fermat-pseudoprime", "modular-exponentiation"], isA: ["primality-test"],
      formula: String.raw`a^{n-1} \not\equiv 1 \pmod n \;\Rightarrow\; n \text{ composite}`,
      text: "The probabilistic test that chooses bases a coprime to n and checks a<sup>n−1</sup> ≡ 1 modulo n. A base for which the congruence fails is a Fermat witness; a composite n that passes for the base a is a Fermat pseudoprime to base a. Carmichael numbers pass for every base." },
    { id: "miller-rabin-test", name: "Miller–Rabin test", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y11", uses: ["primality-test", "ent:strong-pseudoprime", "modular-exponentiation"], isA: ["primality-test"],
      formula: String.raw`n - 1 = 2^s d,\quad a^d \equiv 1 \ \text{or}\ a^{2^r d} \equiv -1 \pmod n`,
      text: "The probabilistic test that writes n − 1 = 2<sup>s</sup>d with d odd and checks for random bases a whether a<sup>d</sup> ≡ 1 or a<sup>2<sup>r</sup>d</sup> ≡ −1 modulo n for some 0 ≤ r < s. A base for which this fails is a strong witness and proves n composite; a composite n that passes is a strong pseudoprime to base a." },
    { id: "solovay-strassen-test", name: "Solovay–Strassen test", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y11", uses: ["primality-test", "ent:jacobi-symbol", "ent:euler-pseudoprime", "modular-exponentiation"], isA: ["primality-test"],
      formula: String.raw`a^{(n-1)/2} \equiv \left(\frac{a}{n}\right) \pmod n`,
      text: "The probabilistic test for odd n that checks for random bases a whether a<sup>(n−1)/2</sup> is congruent to the Jacobi symbol (a/n) modulo n, which holds for every a when n is prime (Euler's criterion). A composite n that passes is an Euler pseudoprime to base a." },
    { id: "aks-test", name: "AKS primality test", kind: "konstruktion", area: "11Y", field: [11, 68], msc: ["11Y"], msc5: "11Y11", uses: ["primality-test", "ca:polynomial-ring", "ent:residue-class-ring", "ent:multiplicative-order"], isA: ["primality-test"],
      formula: String.raw`(X + a)^n \equiv X^n + a \pmod{X^r - 1,\ n}`,
      text: "The deterministic test of Agrawal, Kayal and Saxena: rule out perfect powers, find the least r with ord<sub>r</sub>(n) > (log<sub>2</sub> n)<sup>2</sup>, check that n has no factor up to r, and verify the congruence shown in the ring (ℤ/nℤ)[X]/(X<sup>r</sup> − 1) for a = 1, …, ⌊√φ(r) log<sub>2</sub> n⌋." },
    { id: "integer-factorization-problem", name: "Integer factorization problem", kind: "konstruktion", area: "11Y", field: [11, 68], msc: ["11Y"], msc5: "11Y05", uses: ["ent:prime-factorization", "cs:running-time"],
      text: "The computational problem to find, for a given composite natural number n, a non-trivial divisor, and by repetition the prime factorization of n. Running times are measured in the number of digits log n; the best known algorithms are subexponential." },
    { id: "smooth-number", name: "Smooth number", kind: "eigenschaft", area: "11Y", field: [11], msc: ["11Y", "11N"], msc5: "11Y05", uses: ["ent:prime-factorization"],
      formula: String.raw`p \mid n \;\Rightarrow\; p \le B`,
      text: "A natural number n is B-smooth if all its prime factors are at most B, and B-powersmooth if all prime powers dividing it are at most B. Ψ(x, y) counts the y-smooth numbers up to x. Smooth numbers are the raw material of all subexponential factoring and discrete logarithm algorithms." },
    { id: "factor-base", name: "Factor base", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y05", uses: ["ent:prime-number", "smooth-number"],
      text: "The finite set of primes up to a bound B (sometimes with −1, or restricted to primes with a given property) over which smooth values are factored. Each B-smooth value gives a vector of exponents, its relation." },
    { id: "congruence-of-squares", name: "Congruence of squares", kind: "morphismus", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y05", uses: ["ent:congruence"],
      formula: String.raw`x^2 \equiv y^2 \pmod n,\quad x \not\equiv \pm y \pmod n`,
      text: "A pair of integers x, y whose squares are congruent modulo n while x is congruent neither to y nor to −y. Fermat, Kraitchik and all sieve methods factor n by finding such a pair." },
    { id: "pollard-rho-method", name: "Pollard's rho method", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y05", uses: ["integer-factorization-problem", "ent:gcd", "ent:residue-class-ring"],
      formula: String.raw`x_{i+1} = x_i^2 + c \bmod n,\quad d = \gcd(x_{2i} - x_i, n)`,
      text: "The factoring method that iterates a polynomial map modulo n and compares x<sub>i</sub> with x<sub>2i</sub> (Floyd's cycle detection); as soon as the sequence modulo an unknown prime p | n repeats, gcd(x<sub>2i</sub> − x<sub>i</sub>, n) is divisible by p. Pollard's rho method for discrete logarithms uses the same idea in a group." },
    { id: "pollard-p-minus-1-method", name: "Pollard's p − 1 method", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y05", uses: ["integer-factorization-problem", "smooth-number", "ent:gcd", "modular-exponentiation"],
      formula: String.raw`d = \gcd\big(a^{M} - 1, n\big),\quad M = \operatorname{lcm}(1, \dots, B)`,
      text: "The factoring method that computes a<sup>M</sup> modulo n for M = lcm(1, …, B) and takes the greatest common divisor of a<sup>M</sup> − 1 with n. It finds prime factors p of n for which p − 1 is B-powersmooth." },
    { id: "quadratic-sieve", name: "Quadratic sieve", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y05", uses: ["integer-factorization-problem", "factor-base", "congruence-of-squares"],
      formula: String.raw`Q(x) = \big(x + \lfloor\sqrt n\rfloor\big)^2 - n`,
      text: "The factoring method of Pomerance (1981): sieve the values Q(x) for small x to find those that are smooth over the factor base, combine relations whose exponent vectors add up to zero modulo 2 into a congruence of squares, and take a greatest common divisor." },
    { id: "number-field-sieve", name: "Number field sieve", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y", "11R"], msc5: "11Y05", uses: ["integer-factorization-problem", "factor-base", "congruence-of-squares", "ant:number-field", "ant:ring-of-integers"],
      formula: String.raw`\varphi : \mathbb{Z}[\theta] \to \mathbb{Z}/n\mathbb{Z},\quad \theta \mapsto m,\quad f(m) \equiv 0 \pmod n`,
      text: "The factoring method of Pollard, Lenstra, Lenstra and Manasse (1990): choose an irreducible polynomial f with a root m modulo n, find pairs (a, b) for which both a − bm and the norm of a − bθ in ℚ(θ) are smooth, and combine them into a square in ℤ and a square in ℤ[θ] that map to a congruence of squares modulo n." },
    { id: "elliptic-curve-method", name: "Elliptic curve method (Lenstra)", kind: "konstruktion", area: "11Y", field: [11, 14], msc: ["11Y", "11G"], msc5: "11Y05", uses: ["integer-factorization-problem", "ag:elliptic-curve", "smooth-number", "ent:residue-class-ring"],
      formula: String.raw`[M]P \ \text{on}\ E(\mathbb{Z}/n\mathbb{Z}),\quad M = \operatorname{lcm}(1, \dots, B)`,
      text: "Lenstra's factoring method (1987): choose random elliptic curves E with a point P modulo n and compute [M]P with the addition formulas; when a denominator is not invertible modulo n, its greatest common divisor with n is usually a proper factor. It finds p | n for which #E(𝔽<sub>p</sub>) is B-smooth, and its running time depends on the size of p, not of n." },
    { id: "baby-step-giant-step", name: "Baby-step giant-step algorithm", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y16", uses: ["gt:cyclic-group", "ent:discrete-logarithm", "it:discrete-logarithm-problem"],
      formula: String.raw`h \cdot (g^{-m})^{i} = g^{j},\quad x = i m + j,\quad m = \lceil \sqrt{N}\, \rceil`,
      text: "Shanks's algorithm for the discrete logarithm x with g<sup>x</sup> = h in a cyclic group of order N: store the baby steps g<sup>j</sup> for 0 ≤ j < m, then compute the giant steps h·g<sup>−im</sup> until one of them is in the table." },
    { id: "pohlig-hellman-algorithm", name: "Pohlig–Hellman algorithm", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y16", uses: ["gt:cyclic-group", "gt:element-order", "it:discrete-logarithm-problem", "ent:system-of-congruences"],
      text: "The algorithm that reduces a discrete logarithm in a cyclic group of order N = ∏ p<sup>e</sup> to discrete logarithms in the subgroups of prime order p, determines x modulo each p<sup>e</sup> digit by digit, and combines the results with the Chinese remainder theorem." },
    { id: "index-calculus", name: "Index calculus", kind: "konstruktion", area: "11Y", field: [11], msc: ["11Y"], msc5: "11Y16", uses: ["factor-base", "smooth-number", "ent:discrete-logarithm", "ent:primitive-root"],
      formula: String.raw`g^{k} \equiv \prod_{p \le B} p^{e_p} \;\Rightarrow\; k \equiv \sum_{p \le B} e_p \log_g p \pmod{q - 1}`,
      text: "The subexponential method for discrete logarithms modulo a prime q with primitive root g: collect powers g<sup>k</sup> that are smooth over the factor base, solve the resulting linear system for the logarithms of the primes p ≤ B, and finally find one smooth h·g<sup>k</sup>." },

    // ------------------------------------------------------------ 11C Polynomials and matrices over ℤ
    { id: "integer-polynomial", name: "Integer polynomial", kind: "objekt", area: "11C", field: [11], msc: ["11C"], msc5: "11C08", uses: ["ca:polynomial-ring", "ent:integer"],
      formula: String.raw`f = a_d x^d + \dots + a_1 x + a_0 \in \mathbb{Z}[x]`,
      text: "A polynomial in one variable with integer coefficients; it is monic if a<sub>d</sub> = 1. Over ℂ it factors as a<sub>d</sub>(x − α<sub>1</sub>)⋯(x − α<sub>d</sub>), and the roots of a monic integer polynomial are algebraic integers." },
    { id: "mahler-measure", name: "Mahler measure", kind: "invariante", area: "11C", field: [11], msc: ["11C", "11R"], msc5: "11C08", uses: ["integer-polynomial", "st:complex-number"],
      formula: String.raw`M(f) = |a_d| \prod_{i=1}^{d} \max\big(1, |\alpha_i|\big)`,
      text: "For a polynomial f = a<sub>d</sub>(x − α<sub>1</sub>)⋯(x − α<sub>d</sub>) with complex coefficients, the absolute value of the leading coefficient times the product of the absolute values of the roots outside the unit circle. The Mahler measure of an algebraic number is that of its minimal polynomial over ℤ. By Jensen's formula M(f) = exp ∫<sub>0</sub><sup>1</sup> log |f(e<sup>2πit</sup>)| dt, which also defines it in several variables." },
    { id: "polynomial-height", name: "Height and length of a polynomial", kind: "invariante", area: "11C", field: [11], msc: ["11C"], msc5: "11C08", uses: ["integer-polynomial"],
      formula: String.raw`H(f) = \max_i |a_i|,\quad L(f) = \sum_i |a_i|`,
      text: "For a polynomial with coefficients a<sub>0</sub>, …, a<sub>d</sub> the largest absolute value of a coefficient (height) and the sum of their absolute values (length). Both are comparable with the Mahler measure up to factors that depend only on d." },
    { id: "reciprocal-polynomial", name: "Reciprocal polynomial", kind: "eigenschaft", area: "11C", field: [11], msc: ["11C"], msc5: "11C08", uses: ["integer-polynomial", "ft:polynomial-degree"],
      formula: String.raw`x^{d} f(1/x) = \pm f(x)`,
      text: "A polynomial f of degree d is reciprocal (self-reciprocal) if reversing the order of its coefficients gives ±f; then with every root α also 1/α is a root. Cyclotomic polynomials Φ<sub>n</sub> with n ≥ 2 and Lehmer's polynomial are reciprocal." },
    { id: "integer-matrix", name: "Integer matrix", kind: "objekt", area: "11C", field: [11], msc: ["11C"], msc5: "11C20", uses: ["la:matrix", "ent:integer"],
      text: "A matrix with integer entries. Its rows generate a subgroup of ℤ<sup>n</sup> (a lattice), and row operations with integer multipliers do not change this subgroup." },
    { id: "unimodular-matrix", name: "Unimodular matrix", kind: "eigenschaft", area: "11C", field: [11], msc: ["11C"], msc5: "11C20", uses: ["integer-matrix", "la:determinant"], isA: ["integer-matrix"],
      formula: String.raw`\det U = \pm 1`,
      text: "A square integer matrix with determinant ±1; equivalently, an integer matrix whose inverse is again an integer matrix (by the adjugate formula). These matrices form the group GL<sub>n</sub>(ℤ)." },
    { id: "hermite-normal-form", name: "Hermite normal form", kind: "konstruktion", area: "11C", field: [11], msc: ["11C"], msc5: "11C20", uses: ["integer-matrix", "unimodular-matrix"],
      formula: String.raw`H = U A,\quad 0 \le h_{ij} < h_{jj}\ (i < j)`,
      text: "For a non-singular square integer matrix A the upper triangular matrix H = UA with U unimodular, positive diagonal entries h<sub>jj</sub> and the entries above each diagonal entry reduced modulo it. More generally every integer matrix has an echelon form of this kind. It describes the lattice generated by the rows of A by a canonical basis." },
  ],
};
