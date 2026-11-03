// Zahlentheoretische Kennzahlen für die Legende zu n:m.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})
  const { gcd, phi, divisors, formatFactorization, isPrime, multOrder, carmichael, modInverse, zeroDivisorPartner, hasPrimitiveRoot, buildGraph } = core

  /**
   * @typedef {{d: number, phi: number, order: number|null, cyclesFromD: number|null}} DivisorRow
   *   cyclesFromD = φ(d)/ω_d(n), null falls order null
   * @typedef {{k: 2|3|5, roots: number[], sum: number}} RootsOfUnity
   * @typedef {{
   *   n: number, m: number, gcd: number, reduced: {n: number, m: number}|null,
   *   factorN: string, factorM: string, divisorsN: number[], divisorsM: number[],
   *   nIsPrime: boolean, mIsPrime: boolean, divisorsMMinus1: number[]|null,
   *   phi: number, order: number|null, carmichael: number,
   *   primitiveRootCount: number|null,
   *   inverse: number|null, zeroDivisorPartner: number|null,
   *   isPrimitiveRoot: boolean,
   *   zeroDivisorCount: number, fixedPointCount: number, imageSize: number,
   *   rootsOfUnity: RootsOfUnity[],
   *   translationPeriod: number,
   *   divisorTable: DivisorRow[],
   *   sigma1: number,
   *   cycleLengthCounts: {length: number, count: number}[],
   *   totalCycles: number,
   *   distanceTable: {k: number, distance: number, count: number}[]
   * }} Analysis
   */

  /**
   * Bestimmt alle r in 1..m-1 mit r^k ≡ 1 (mod m).
   * @param {number} m Modul, ganze Zahl ≥ 2
   * @param {number} k Exponent
   * @returns {RootsOfUnity} die Lösungen aufsteigend (beginnt mit 1) und ihre Summe
   */
  function rootsOfUnityFor(m, k) {
    const roots = []
    for (let r = 1; r < m; r++) {
      let p = 1
      for (let i = 0; i < k; i++) p = (p * r) % m
      if (p === 1) roots.push(r)
    }
    return { k, roots, sum: roots.reduce((s, r) => s + r, 0) }
  }

  /**
   * Berechnet alle Kennzahlen, die die Legende zu n:m anzeigt.
   * @param {number} n ganze Zahl 1..2000 (wird unverändert verwendet)
   * @param {number} m ganze Zahl 2..2000
   * @param {import('./multiplicationGraph.js').MultiplicationGraph} [graph] bereits gebautes Graphmodell, Standard buildGraph(n, m)
   * @returns {Analysis} die Kennzahlen
   */
  function analyze(n, m, graph = buildGraph(n, m)) {
    const g = gcd(n, m)
    const f = phi(m)
    const lambda = carmichael(m)
    const mIsPrime = isPrime(m)
    const divisorsM = divisors(m)

    const divisorTable = divisorsM.map(d => {
      const order = d === 1 ? 1 : multOrder(n, d)
      return { d, phi: phi(d), order, cyclesFromD: order === null ? null : phi(d) / order }
    })

    const lengthCounts = new Map()
    for (const c of graph.cycles) lengthCounts.set(c.length, (lengthCounts.get(c.length) ?? 0) + 1)
    const cycleLengthCounts = [...lengthCounts].map(([length, count]) => ({ length, count })).sort((a, b) => a.length - b.length)

    const distanceTable = [...graph.distanceCounts]
      .filter(([, count]) => count > 0)
      .sort((a, b) => a[0] - b[0])
      .map(([distance, count], k) => ({ k, distance, count }))

    const fixed = gcd(n - 1, m)

    return {
      n,
      m,
      gcd: g,
      reduced: g > 1 ? { n: n / g, m: m / g } : null,
      factorN: formatFactorization(n),
      factorM: formatFactorization(m),
      divisorsN: divisors(n),
      divisorsM,
      nIsPrime: isPrime(n),
      mIsPrime,
      divisorsMMinus1: mIsPrime ? divisors(m - 1) : null,
      phi: f,
      order: multOrder(n, m),
      carmichael: lambda,
      primitiveRootCount: hasPrimitiveRoot(m) ? phi(f) : null,
      inverse: modInverse(n, m),
      zeroDivisorPartner: zeroDivisorPartner(n, m),
      isPrimitiveRoot: graph.isPrimitiveRoot,
      zeroDivisorCount: g - 1,
      fixedPointCount: fixed,
      imageSize: m / g,
      rootsOfUnity: [2, 3, 5].map(k => rootsOfUnityFor(m, k)),
      translationPeriod: m / fixed,
      divisorTable,
      sigma1: divisorsM.reduce((s, d) => s + d, 0),
      cycleLengthCounts,
      totalCycles: graph.cycles.length,
      distanceTable
    }
  }

  Object.assign(core, { analyze })
})()
