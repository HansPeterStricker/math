// Geometrie der Graphdarstellung: Punkte auf dem Einheitskreis, Zeichenprimitive und Tortenbogen.
// Koordinaten: Ursprung in der Mitte, Radius 1, Bildschirmorientierung (y nach unten), 0 liegt unten.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})
  const { gcd, COLORS, passesLengthFilter } = core

  const TAU = 2 * Math.PI

  /**
   * @typedef {{
   *   context: 'single'|'neighbour'|'table',
   *   showCycles: boolean,
   *   highlightFixedPoints: boolean,
   *   showUnits: boolean,
   *   lengthFilter: {min: number, max: number},
   *   showResidueLabels: boolean
   * }} StyleOptions
   * @typedef {{
   *   lines: {x1: number, y1: number, x2: number, y2: number, color: string, width: number, order: number}[],
   *   dots: {x: number, y: number, r: number, fill: string, isImagePoint: boolean, residue: number}[],
   *     fill: 'black', 'silver' oder bei Fixpunkten in der Einzelansicht mit Zyklen die Farbe des Zyklus
   *   rings: {x: number, y: number, kind: 'unit'|'sqrtOne'|'sqrtN'}[],
   *   labels: {x: number, y: number, text: string, color: 'red'|'gray'}[]
   * }} Primitives
   */

  /**
   * Berechnet die Lage jedes Residuums auf dem Einheitskreis.
   * Punkt a hat die Koordinaten (sin(τ·i/k − dA), cos(τ·i/k − dA)), i = Position von a in residues,
   * k = Anzahl der Residuen, dA = τ/(2(m−1)), falls residues mit 1 beginnt, sonst 0.
   * @param {import('./multiplicationGraph.js').MultiplicationGraph} graph Graphmodell
   * @returns {Map<number, {x: number, y: number}>} Koordinaten je Residuum
   */
  /** Abstand der Ringe vom Punkt in Pixeln bei markScale = 1: Einheit, Wurzel aus n; Seitenlänge des Quadrats um eine Wurzel aus 1. */
  const RING_UNIT = 3
  const RING_SQRT_N = 8
  const RING_SQRT_ONE_SIDE = r => r + 11

  function circlePoints(graph) {
    const { residues, m } = graph
    const k = residues.length
    const dA = residues[0] === 1 ? TAU / (2 * (m - 1)) : 0
    const points = new Map()
    residues.forEach((a, i) => {
      const angle = (TAU * i) / k - dA
      points.set(a, { x: Math.sin(angle), y: Math.cos(angle) })
    })
    return points
  }

  /**
   * Erzeugt alle Zeichenprimitive (Linien, Punkte, Ringe, Beschriftungen) eines Graphen.
   * Linien und Punkte tragen Breiten bzw. Radien in CSS-Pixeln, Positionen liegen im Einheitskreis-Maß.
   * @param {import('./multiplicationGraph.js').MultiplicationGraph} graph Graphmodell
   * @param {StyleOptions} style Darstellungsoptionen
   * @returns {Primitives} die Zeichenprimitive
   */
  function graphPrimitives(graph, style) {
    const { n, m, edges, cycles } = graph
    const { context, showCycles, highlightFixedPoints, showUnits, lengthFilter, showResidueLabels } = style
    const pts = circlePoints(graph)
    const isTable = context === 'table'

    const base = isTable ? (showCycles ? 1 : 0.5) : (m >= 500 ? 0.5 : 1)
    const w0 = isTable ? base : 3 * base
    const sc = context === 'single' ? 10 : context === 'neighbour' ? 5 : 7
    const otherColor = gcd(n, m) > 1 ? 'silver' : 'black'

    const lines = []
    edges.forEach((e, order) => {
      if (!passesLengthFilter(e.distance, m, lengthFilter)) return
      let color = 'black'
      let width = base / 2
      if (showCycles) {
        if (e.cycleIndex !== null) {
          const len = cycles[e.cycleIndex].length
          color = COLORS[e.cycleIndex % COLORS.length]
          width = Math.max(0.5, (sc * w0) / len)
          if (len === 1 && m >= 500) width *= 2
        } else {
          color = otherColor
        }
      }
      const p = pts.get(e.from), q = pts.get(e.to)
      lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y, color, width, order, fixed: e.from === e.to })
    })
    // Fixpunkte höchstens so dick wie die dickste Zyklenlinie (Nutzer, 3. November 2026; nicht in der Tabelle): Der Durchmesser eines
    // Fixpunkts (Linie der Länge 0 und hervorgehobener Punkt) ist höchstens die Breite der dicksten Linie eines Zyklus
    // mit mindestens zwei Elementen; ohne solchen Zyklus die Breite, die ein Zyklus der Länge 2 hätte. Der Punkt einer
    // Linie der Länge 0 ist zudem nie kleiner als ein gewöhnlicher Punkt.
    const cycleWidths = lines.filter((l) => !l.fixed && graph.edges[l.order].cycleIndex !== null && showCycles).map((l) => l.width)
    const maxFixedD = cycleWidths.length ? Math.max(...cycleWidths) : (sc * w0) / 2
    const minFixedD = 2 * (context === 'single' ? 5 : 2)
    if (!isTable) lines.forEach((l) => { if (l.fixed) l.width = Math.max(Math.min(l.width, minFixedD), Math.min(l.width, maxFixedD)) })
    lines.forEach((l) => { delete l.fixed })

    const imageSet = new Set(graph.imagePoints)
    const fixedSet = new Set(graph.fixedPoints)
    // Radius des Kreises in denselben Pixeln wie die Punktradien: 0,45 · 640 im SVG, 0,45 · 120 in der Tabellenzelle.
    const circleR = isTable ? 0.45 * 120 : 0.45 * 640
    const baseR = context === 'single' ? 5 : 2
    // höchstens so dick wie die dickste Zyklenlinie, aber nie kleiner als ein gewöhnlicher Punkt
    const fixedR = isTable ? 3.6 : Math.max(baseR, Math.min(context === 'single' ? 10 : 8, maxFixedD / 2))
    // In der Einzelansicht bleiben Fixpunkte auch bei farbigen Zyklen groß und tragen die Farbe ihres Zyklus.
    const cycleOfFixed = new Map()
    if (context === 'single' && showCycles) {
      for (const e of edges) if (e.from === e.to && e.cycleIndex !== null) cycleOfFixed.set(e.from, e.cycleIndex)
    }
    const dots = graph.residues.map(a => {
      const p = pts.get(a)
      const isImagePoint = imageSet.has(a)
      const big = highlightFixedPoints && fixedSet.has(a) && (!showCycles || context === 'single')
      let fill = !highlightFixedPoints || isImagePoint || a === 0 ? 'black' : 'silver'
      if (big && cycleOfFixed.has(a)) fill = COLORS[cycleOfFixed.get(a) % COLORS.length]
      return { x: p.x, y: p.y, r: big ? fixedR : baseR, fill, isImagePoint, residue: a }
    })

    const rings = []
    if (context === 'single' && showUnits) {
      const add = (list, kind) => list.forEach(a => rings.push({ x: pts.get(a).x, y: pts.get(a).y, kind }))
      add(graph.units, 'unit')
      add(graph.squareRootsOfUnity, 'sqrtOne')
      add(graph.squareRootsOfN, 'sqrtN')
    }

    // Benachbarte Punkte haben den Abstand 2R·sin(π/k). Jede Markierung (Punkt samt Ring) reicht höchstens 45 % davon
    // um ihren Mittelpunkt, sodass zwischen zwei Markierungen immer eine Lücke von 10 % des Abstands bleibt.
    // Reicht der Platz nicht, werden Punkte und Ringe gemeinsam mit dem Faktor markScale verkleinert.
    const k = graph.residues.length
    const maxExtent = k > 1 ? 0.45 * 2 * circleR * Math.sin(Math.PI / k) : Infinity
    const dotR = new Map(dots.map(d => [d.residue, d.r]))
    const extent = new Map(dotR)
    const ringIndex = new Map(graph.residues.map(a => [`${pts.get(a).x},${pts.get(a).y}`, a]))
    for (const ring of rings) {
      const a = ringIndex.get(`${ring.x},${ring.y}`)
      const r = dotR.get(a)
      const e = ring.kind === 'sqrtOne' ? RING_SQRT_ONE_SIDE(r) / 2 * Math.SQRT2 : r + (ring.kind === 'sqrtN' ? RING_SQRT_N : RING_UNIT)
      extent.set(a, Math.max(extent.get(a), e))
    }
    const largest = Math.max(0, ...extent.values())
    const markScale = largest > maxExtent ? maxExtent / largest : 1
    if (markScale < 1) for (const d of dots) d.r *= markScale

    const labels = []
    if (showResidueLabels && m < 100) {
      for (const a of graph.residues) {
        const p = pts.get(a)
        labels.push({ x: 1.15 * p.x, y: 1.15 * p.y, text: String(a), color: a === 0 ? 'red' : 'gray' })
      }
    }

    return { lines, dots, rings, labels, markScale }
  }

  /**
   * Bogen der Torte, die das Verhältnis n/m in der Zelle anzeigt (Formeln aus Legacy graph.js).
   * @param {number} n Zähler
   * @param {number} m Nenner
   * @returns {{start: number, end: number} | null} Anfangs- und Endwinkel im Bogenmaß; null, falls n === m
   */
  function pieArc(n, m) {
    if (n < m) {
      const c = (Math.PI / 4) * (1 + (1 - n / (m - 1)))
      return { start: (-Math.PI * n) / m + c, end: (Math.PI * n) / m + c }
    }
    if (n > m) {
      const c = Math.PI + (Math.PI / 4) * (1 - (1 - m / (n - 1)))
      return { start: (-Math.PI * m) / n + c, end: (Math.PI * m) / n + c }
    }
    return null
  }

  Object.assign(core, { RING_UNIT, RING_SQRT_N, RING_SQRT_ONE_SIDE, circlePoints, graphPrimitives, pieArc })
})()
