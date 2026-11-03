import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js', 'js/core/analysis.js')
const { analyze, buildGraph, gcd } = R.core

test('analyze 6:25', () => {
  const a = analyze(6, 25)
  assert.equal(a.gcd, 1)
  assert.equal(a.reduced, null)
  assert.equal(a.phi, 20)
  assert.equal(a.order, 5)
  assert.equal(a.carmichael, 20)
  assert.equal(a.primitiveRootCount, 8)
  assert.equal(a.inverse, 21)
  assert.equal(a.zeroDivisorPartner, null)
  assert.equal(a.isPrimitiveRoot, false)
  assert.equal(a.zeroDivisorCount, 0)
  assert.equal(a.fixedPointCount, 5)
  assert.equal(a.imageSize, 25)
  assert.equal(a.translationPeriod, 5)
  assert.equal(a.totalCycles, 9)
  assert.equal(a.sigma1, 31)
  assert.equal(a.nIsPrime, false)
  assert.equal(a.mIsPrime, false)
  assert.equal(a.divisorsMMinus1, null)
  assert.deepEqual(a.cycleLengthCounts, [{ length: 1, count: 5 }, { length: 5, count: 4 }])
  assert.deepEqual(a.divisorTable[0], { d: 1, phi: 1, order: 1, cyclesFromD: 1 })
  assert.deepEqual(a.rootsOfUnity.map(r => r.k), [2, 3, 5])
  assert.deepEqual(a.rootsOfUnity[0].roots, [1, 24])
  assert.equal(a.rootsOfUnity[0].sum, 25)
  assert.equal(a.distanceTable[0].k, 0)
  assert.equal(a.distanceTable[0].distance, 0)
})

test('analyze 4:6', () => {
  const a = analyze(4, 6)
  assert.equal(a.inverse, null)
  assert.equal(a.order, null)
  assert.equal(a.zeroDivisorPartner, 3)
  assert.equal(a.zeroDivisorCount, 1)
  assert.deepEqual(a.reduced, { n: 2, m: 3 })
  assert.equal(a.imageSize, 3)
  assert.equal(a.divisorTable.find(r => r.d === 2).order, null)
  assert.equal(a.divisorTable.find(r => r.d === 2).cyclesFromD, null)
})

test('analyze 30:25 verwendet n unverändert', () => {
  const a = analyze(30, 25)
  assert.equal(a.n, 30)
  assert.equal(a.gcd, 5)
  assert.deepEqual(a.reduced, { n: 6, m: 5 })
})

test('analyze 3:7 (m prim)', () => {
  const a = analyze(3, 7)
  assert.equal(a.mIsPrime, true)
  assert.equal(a.nIsPrime, true)
  assert.deepEqual(a.divisorsMMinus1, [1, 2, 3, 6])
  assert.equal(a.isPrimitiveRoot, true)
})

test('totalCycles = Σ cyclesFromD für alle teilerfremden n < m ≤ 120', () => {
  for (let m = 2; m <= 120; m++) {
    for (let n = 1; n < m; n++) {
      if (gcd(n, m) !== 1) continue
      const a = analyze(n, m)
      const sum = a.divisorTable.reduce((s, r) => s + r.cyclesFromD, 0)
      assert.equal(a.totalCycles, sum, `${n}:${m}`)
    }
  }
})

test('Laufzeit: buildGraph + analyze für 1999:2000 unter 200 ms', () => {
  const t0 = performance.now()
  analyze(1999, 2000, buildGraph(1999, 2000))
  assert.ok(performance.now() - t0 < 200)
})
