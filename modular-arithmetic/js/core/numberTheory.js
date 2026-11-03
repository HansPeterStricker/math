// Zahlentheorie für modulare Arithmetik. Alle Zwischenprodukte bleiben für Parameter bis 2000
// unter 2000² und sind damit als number exakt darstellbar.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})

  /**
   * Größter gemeinsamer Teiler.
   * @param {number} a erste nichtnegative ganze Zahl
   * @param {number} b zweite nichtnegative ganze Zahl
   * @returns {number} ggT(a, b)
   */
  function gcd(a, b) {
    while (b !== 0) [a, b] = [b, a % b]
    return a
  }

  /**
   * Primfaktorzerlegung.
   * @param {number} n ganze Zahl ≥ 1
   * @returns {{p: number, k: number}[]} Primfaktoren p mit Vielfachheit k, aufsteigend
   */
  function factorize(n) {
    const result = []
    for (let p = 2; p * p <= n; p++) {
      if (n % p !== 0) continue
      let k = 0
      while (n % p === 0) { n /= p; k++ }
      result.push({ p, k })
    }
    if (n > 1) result.push({ p: n, k: 1 })
    return result
  }

  /**
   * Formatiert die Primfaktorzerlegung, z. B. "2·2·3" für 12.
   * @param {number} n ganze Zahl ≥ 1
   * @returns {string} Primfaktoren mit Vielfachheit, getrennt durch "·"; für 1 der Text "1"
   */
  function formatFactorization(n) {
    if (n === 1) return '1'
    return factorize(n).flatMap(({ p, k }) => Array(k).fill(p)).join('·')
  }

  /**
   * Eulersche Phi-Funktion.
   * @param {number} n ganze Zahl ≥ 1
   * @returns {number} Anzahl der zu n teilerfremden Zahlen in 1..n
   */
  function phi(n) {
    return factorize(n).reduce((r, { p, k }) => r * (p - 1) * p ** (k - 1), 1)
  }

  /**
   * Alle positiven Teiler.
   * @param {number} n ganze Zahl ≥ 1
   * @returns {number[]} Teiler aufsteigend, enthält 1 und n
   */
  function divisors(n) {
    const small = []
    const large = []
    for (let d = 1; d * d <= n; d++) {
      if (n % d !== 0) continue
      small.push(d)
      if (d * d !== n) large.push(n / d)
    }
    return small.concat(large.reverse())
  }

  /**
   * Primzahltest.
   * @param {number} n ganze Zahl
   * @returns {boolean} true, falls n prim ist
   */
  function isPrime(n) {
    if (n < 2) return false
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
    return true
  }

  /**
   * Modulare Potenz base^exp mod m durch wiederholtes Quadrieren.
   * @param {number} base Basis, 0 ≤ base
   * @param {number} exp Exponent, ganze Zahl ≥ 0
   * @param {number} m Modul, ganze Zahl ≥ 1 (Produkte bleiben unter m²)
   * @returns {number} base^exp mod m
   */
  function powMod(base, exp, m) {
    let result = 1 % m
    let b = base % m
    while (exp > 0) {
      if (exp & 1) result = (result * b) % m
      b = (b * b) % m
      exp = Math.floor(exp / 2)
    }
    return result
  }

  /**
   * Kleinstes gemeinsames Vielfaches.
   * @param {number} a ganze Zahl ≥ 1
   * @param {number} b ganze Zahl ≥ 1
   * @returns {number} kgV(a, b)
   */
  function lcm(a, b) {
    return (a / gcd(a, b)) * b
  }

  /**
   * Carmichael-Funktion λ(n), Exponent der primen Restklassengruppe modulo n.
   * @param {number} n ganze Zahl ≥ 1
   * @returns {number} λ(n)
   */
  function carmichael(n) {
    return factorize(n).reduce((l, { p, k }) => {
      const value = p === 2 && k >= 3 ? 2 ** (k - 2) : (p - 1) * p ** (k - 1)
      return lcm(l, value)
    }, 1)
  }

  /**
   * Multiplikative Ordnung von a modulo m.
   * @param {number} a ganze Zahl ≥ 0
   * @param {number} m Modul, ganze Zahl ≥ 1
   * @returns {number | null} kleinstes k ≥ 1 mit a^k ≡ 1 (mod m); null, falls gcd(a, m) ≠ 1
   */
  function multOrder(a, m) {
    if (gcd(a, m) !== 1) return null
    for (const d of divisors(carmichael(m))) {
      if (powMod(a, d, m) === 1 % m) return d
    }
    return null
  }

  /**
   * Multiplikatives Inverses von a modulo m (erweiterter euklidischer Algorithmus).
   * @param {number} a ganze Zahl ≥ 0
   * @param {number} m Modul, ganze Zahl ≥ 1
   * @returns {number | null} x in 0..m-1 mit a·x ≡ 1 (mod m); null, falls gcd(a, m) ≠ 1
   */
  function modInverse(a, m) {
    if (gcd(a, m) !== 1) return null
    let [r0, r1] = [m, a % m]
    let [t0, t1] = [0, 1]
    while (r1 !== 0) {
      const q = Math.floor(r0 / r1);
      [r0, r1] = [r1, r0 - q * r1];
      [t0, t1] = [t1, t0 - q * t1]
    }
    return ((t0 % m) + m) % m
  }

  /**
   * Kleinster Nullteiler-Partner von a modulo m.
   * @param {number} a ganze Zahl ≥ 0
   * @param {number} m Modul, ganze Zahl ≥ 1
   * @returns {number | null} kleinstes b ≥ 2 mit a·b ≡ 0 (mod m); null, falls gcd(a, m) = 1
   */
  function zeroDivisorPartner(a, m) {
    if (gcd(a, m) === 1) return null
    for (let b = 2; b <= m; b++) if ((a * b) % m === 0) return b
    return null
  }

  /**
   * Prüft, ob modulo m eine Primitivwurzel existiert.
   * @param {number} m ganze Zahl ≥ 1
   * @returns {boolean} true genau dann, wenn λ(m) = φ(m)
   */
  function hasPrimitiveRoot(m) {
    return carmichael(m) === phi(m)
  }

  /**
   * Prüft, ob das regelmäßige m-Eck mit Zirkel und Lineal konstruierbar ist.
   * @param {number} m ganze Zahl
   * @returns {boolean} true, falls m ≥ 3 und φ(m) eine Zweierpotenz ist
   */
  function isConstructiblePolygon(m) {
    if (m < 3) return false
    const f = phi(m)
    return (f & (f - 1)) === 0
  }

  Object.assign(core, { gcd, factorize, formatFactorization, phi, divisors, isPrime, powMod, carmichael, multOrder, modInverse, zeroDivisorPartner, hasPrimitiveRoot, isConstructiblePolygon })
})()
