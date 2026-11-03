// Klassifikation einer Tabellenzelle n:m für Hervorhebung und Abblendung.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})
  const { gcd, phi, divisors, multOrder, isConstructiblePolygon, INTERVALS } = core

  /**
   * @typedef {'none'|'gcd'|'gcdShifted'|'primitiveRoot'|'interval'|'constructible'
   *   |'cycle2'|'cycle3'|'cycle4'|'cycle5'|'cycle6'|'cycle7'} Highlight
   * @typedef {{
   *   coprime: boolean, coprimeShifted: boolean, nGreaterM: boolean,
   *   gcd: number, gcdShifted: number,
   *   interval: string|null, intervalIndex: number|null,
   *   constructible: boolean, primitiveRoot: boolean, cycleLengths: Set<number>
   * }} CellClass
   */

  /**
   * Sucht das musikalische Intervall zum gekürzten Verhältnis n:m (in beiden Orientierungen).
   * @param {number} n Zähler
   * @param {number} m Nenner
   * @returns {number|null} Index in INTERVALS oder null
   */
  function findInterval(n, m) {
    const g = gcd(n, m)
    const a = n / g, b = m / g
    const i = INTERVALS.findIndex(iv => iv.ratios.some(([p, q]) => (p === a && q === b) || (p === b && q === a)))
    return i < 0 ? null : i
  }

  /**
   * Klassifiziert die Zelle n:m. Die Zahlentheorie rechnet mit n mod m;
   * das Intervall wird dagegen aus dem unveränderten Verhältnis n:m bestimmt.
   * @param {number} n ganze Zahl 1..2000
   * @param {number} m ganze Zahl 2..2000
   * @returns {CellClass} die Klassifikation
   */
  function classifyCell(n, m) {
    const nm = n % m
    const shifted = (nm - 1 + m) % m
    const g = gcd(nm, m)
    const gShifted = gcd(shifted, m)
    const intervalIndex = findInterval(n, m)
    const cycleLengths = new Set()
    for (const d of divisors(m)) {
      if (d > 1 && gcd(nm, d) === 1) cycleLengths.add(multOrder(nm, d))
    }
    return {
      coprime: g === 1,
      coprimeShifted: gShifted === 1,
      nGreaterM: n > m,
      gcd: g,
      gcdShifted: gShifted,
      interval: intervalIndex === null ? null : INTERVALS[intervalIndex].name,
      intervalIndex,
      constructible: isConstructiblePolygon(m),
      primitiveRoot: g === 1 && multOrder(nm, m) === phi(m),
      cycleLengths
    }
  }

  /**
   * Prüft, ob die Zelle zur gewählten Hervorhebung gehört.
   * @param {CellClass} cls Klassifikation aus classifyCell
   * @param {Highlight} highlight gewählte Hervorhebung
   * @returns {boolean} true, falls die Zelle hervorgehoben wird; bei 'none' immer true
   */
  function matchesHighlight(cls, highlight) {
    switch (highlight) {
      case 'none': return true
      case 'gcd': return cls.gcd > 1
      case 'gcdShifted': return cls.gcdShifted > 1
      case 'primitiveRoot': return cls.primitiveRoot
      case 'interval': return cls.interval !== null
      case 'constructible': return cls.constructible
      default: {
        const k = /^cycle(\d+)$/.exec(highlight)
        return k !== null && cls.cycleLengths.has(Number(k[1]))
      }
    }
  }

  /**
   * Deckkraft einer Zelle abhängig von Coprime-Filtern und Hervorhebung.
   * @param {CellClass} cls Klassifikation aus classifyCell
   * @param {{coprime: string, coprimeShifted: string, highlight: Highlight}} tableState Filter- und Hervorhebungszustand; 'hide' und 'only' sind die wirksamen Coprime-Werte
   * @returns {number} 0,2 bei nicht passender Hervorhebung, sonst 0,3 bei ausgeblendeter Coprime-Zelle, sonst 1
   */
  function cellOpacity(cls, tableState) {
    const { coprime, coprimeShifted, highlight } = tableState
    if (highlight !== 'none' && !matchesHighlight(cls, highlight)) return 0.2
    const hidden = (mode, isCoprime) => (mode === 'hide' && isCoprime) || (mode === 'only' && !isCoprime)
    if (hidden(coprime, cls.coprime) || hidden(coprimeShifted, cls.coprimeShifted)) return 0.3
    return 1
  }

  Object.assign(core, { classifyCell, matchesHighlight, cellOpacity })
})()
