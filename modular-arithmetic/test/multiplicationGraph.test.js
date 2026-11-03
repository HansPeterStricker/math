import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js')
const { buildGraph, gcd, phi, divisors, multOrder } = R.core

test('6:25', () => {
  const g = buildGraph(6, 25)
  assert.deepEqual(g.fixedPoints, [0, 5, 10, 15, 20])
  assert.deepEqual(g.cycles.map(c => c.length).sort((a, b) => a - b), [1, 1, 1, 1, 1, 5, 5, 5, 5])
  assert.equal(g.isPrimitiveRoot, false)
  assert.equal(g.imagePoints.length, 25)
})

test('4:6 (nicht teilerfremd)', () => {
  const g = buildGraph(4, 6)
  assert.deepEqual(g.image, [0, 4, 2, 0, 4, 2])
  assert.deepEqual(g.cycles, [[0], [2], [4]])
  assert.deepEqual(g.imagePoints, [0, 2, 4])
  assert.equal(g.edges.find(e => e.from === 1).cycleIndex, null)
})

test('30:25 rechnet wie 5:25, behält aber n', () => {
  const a = buildGraph(30, 25), b = buildGraph(5, 25)
  assert.equal(a.n, 30)
  assert.deepEqual(a.image, b.image)
})

test('2:11 ist Primitivwurzel', () => assert.equal(buildGraph(2, 11).isPrimitiveRoot, true))

test('dropZero nur bei teilerfremden n,m', () => {
  assert.equal(buildGraph(2, 11, { dropZero: true }).residues[0], 1)
  assert.equal(buildGraph(4, 6, { dropZero: true }).residues[0], 0)
})

test('add: 3:7 bildet a auf a+3 ab', () => {
  assert.deepEqual(buildGraph(3, 7, { op: 'add' }).image, [3, 4, 5, 6, 0, 1, 2])
})

test('Kanten: Distanz, Zyklusindex und Reihenfolge', () => {
  const g = buildGraph(2, 7)
  assert.deepEqual(g.edges.map(e => e.from), g.residues)
  assert.deepEqual(g.edges.find(e => e.from === 3), { from: 3, to: 6, distance: 3, cycleIndex: 2 })
  assert.equal(g.edges.find(e => e.from === 4).distance, 3)
})

test('Wurzeln und Einheiten', () => {
  const g = buildGraph(4, 15)
  assert.deepEqual(g.units, [1, 2, 4, 7, 8, 11, 13, 14])
  assert.deepEqual(g.squareRootsOfUnity, [1, 4, 11, 14])
  assert.deepEqual(g.squareRootsOfN, [2, 7, 8, 13])
})

test('Invarianten für alle 2 ≤ m ≤ 120, 1 ≤ n < m', () => {
  for (let m = 2; m <= 120; m++) {
    for (let n = 1; n < m; n++) {
      const g = buildGraph(n, m)
      const d = gcd(n, m)
      assert.equal(g.fixedPoints.length, gcd(n - 1, m), `Fixpunkte ${n}:${m}`)
      assert.equal(g.imagePoints.length, m / d, `Bildpunkte ${n}:${m}`)
      let sum = 0
      for (const c of g.distanceCounts.values()) sum += c
      assert.equal(sum, m, `Distanzen ${n}:${m}`)
      if (d === 1) {
        let expected = 0
        for (const e of divisors(m)) expected += phi(e) / multOrder(n, e)
        assert.equal(g.cycles.length, expected, `Zyklenzahl ${n}:${m}`)
      }
      const allowed = new Set(divisors(m).filter(e => gcd(n, e) === 1).map(e => multOrder(n, e)))
      for (const c of g.cycles) assert.ok(allowed.has(c.length), `Zyklenlänge ${n}:${m}`)
    }
  }
})
