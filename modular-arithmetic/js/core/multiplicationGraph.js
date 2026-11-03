// Graphmodell für Multiplikationsgraphen n:m. Die Punkte 0..m-1 liegen auf einem Kreis,
// jeder Punkt a wird mit n·a mod m (Operation 'mul') bzw. (n + a) mod m (Operation 'add') verbunden.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})
  const { gcd, phi, multOrder } = core

  /**
   * @typedef {{op: 'mul'|'add', dropZero: boolean}} GraphOptions
   * @typedef {{from: number, to: number, distance: number, cycleIndex: number|null}} Edge
   * @typedef {{
   *   n: number, m: number,
   *   residues: number[],
   *   image: number[],
   *   edges: Edge[],
   *   cycles: number[][],
   *   fixedPoints: number[],
   *   imagePoints: number[],
   *   units: number[],
   *   squareRootsOfUnity: number[],
   *   squareRootsOfN: number[],
   *   distanceCounts: Map<number, number>,
   *   isPrimitiveRoot: boolean
   * }} MultiplicationGraph
   */

  /**
   * Bestimmt alle periodischen Bahnen einer Abbildung auf den Restklassen.
   * Dreizustandsverfahren (unbesucht, aktiv, fertig) mit Laufzeit O(m).
   * @param {number[]} residues Menge der betrachteten Reste, aufsteigend
   * @param {number[]} image image[a] ist das Bild von a; Bilder liegen in residues
   * @returns {number[][]} Zyklen, jeder beginnt bei seinem kleinsten Element, aufsteigend nach erstem Element
   */
  function findCycles(residues, image) {
    const state = new Uint8Array(image.length) // 0 unbesucht, 1 aktiv, 2 fertig
    const cycles = []
    for (const start of residues) {
      if (state[start] !== 0) continue
      const path = []
      let a = start
      while (state[a] === 0) {
        state[a] = 1
        path.push(a)
        a = image[a]
      }
      if (state[a] === 1) {
        const cycle = path.slice(path.indexOf(a))
        const k = cycle.indexOf(Math.min(...cycle))
        cycles.push(cycle.slice(k).concat(cycle.slice(0, k)))
      }
      for (const p of path) state[p] = 2
    }
    return cycles.sort((x, y) => x[0] - y[0])
  }

  /**
   * Baut das Graphmodell für n:m.
   * Für n ≥ m wird mit n mod m gerechnet, das Ergebnis behält aber n unverändert.
   * @param {number} n ganze Zahl 1..2000
   * @param {number} m ganze Zahl 2..2000
   * @param {Partial<GraphOptions>} [opts] Standard: {op: 'mul', dropZero: false}; dropZero wirkt nur bei op 'mul'
   * @returns {MultiplicationGraph} das Graphmodell
   */
  function buildGraph(n, m, opts = {}) {
    const op = opts.op ?? 'mul'
    const dropZero = opts.dropZero ?? false
    const nm = n % m
    const coprime = gcd(nm, m) === 1

    const all = Array.from({ length: m }, (_, a) => a)
    const residues = op === 'mul' && dropZero && coprime ? all.slice(1) : all
    const image = all.map(a => (op === 'mul' ? (nm * a) % m : (nm + a) % m))

    const cycles = findCycles(residues, image)
    const cycleOf = new Int32Array(m).fill(-1)
    cycles.forEach((c, i) => c.forEach(a => { cycleOf[a] = i }))

    const distanceCounts = new Map()
    const edges = residues.map(from => {
      const to = image[from]
      const diff = Math.abs(from - to)
      const distance = Math.min(diff, m - diff)
      distanceCounts.set(distance, (distanceCounts.get(distance) ?? 0) + 1)
      return { from, to, distance, cycleIndex: cycleOf[from] >= 0 ? cycleOf[from] : null }
    })

    const hasPreimage = new Uint8Array(m)
    for (const a of residues) hasPreimage[image[a]] = 1

    return {
      n,
      m,
      residues,
      image,
      edges,
      cycles,
      fixedPoints: residues.filter(a => image[a] === a),
      imagePoints: residues.filter(b => hasPreimage[b] === 1),
      units: residues.filter(a => gcd(a, m) === 1),
      squareRootsOfUnity: residues.filter(a => (a * a) % m === 1 % m),
      squareRootsOfN: residues.filter(a => (a * a) % m === nm),
      distanceCounts,
      isPrimitiveRoot: coprime && multOrder(nm, m) === phi(m)
    }
  }

  Object.assign(core, { buildGraph })
})()
