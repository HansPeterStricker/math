import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/numberTheory.js', 'js/core/constants.js')
const {
  gcd, phi, divisors, formatFactorization, multOrder, carmichael,
  modInverse, zeroDivisorPartner, isConstructiblePolygon, hasPrimitiveRoot, powMod, isPrime, factorize,
  COLORS, INTERVALS
} = R.core

const legacy = JSON.parse(readFileSync(new URL('../tools/legacy-oracle/fixtures/legacy.json', import.meta.url), 'utf8'))

test('gcd, phi, multOrder, carmichael stimmen mit Legacy überein', () => {
  assert.equal(legacy.pairs.length, 4950)
  assert.equal(legacy.singles.length, 100)
  for (const [a, m, g, ord] of legacy.pairs) {
    assert.equal(gcd(a, m), g, `gcd(${a}, ${m})`)
    assert.equal(multOrder(a, m), ord === -1 ? null : ord, `multOrder(${a}, ${m})`)
  }
  for (const s of legacy.singles) {
    assert.equal(phi(s.m), s.phi, `phi(${s.m})`)
    assert.equal(carmichael(s.m), s.charmichael, `carmichael(${s.m})`)
  }
})

test('divisors enthält 1, sonst wie Legacy', () => {
  assert.deepEqual(divisors(12), [1, 2, 3, 4, 6, 12])
  assert.deepEqual(divisors(1), [1])
  for (const s of legacy.singles.filter(x => x.m >= 2)) {
    assert.deepEqual(divisors(s.m), [1, ...s.divisors], `divisors(${s.m})`)
  }
})

test('bekannte Werte', () => {
  assert.equal(carmichael(8), 2); assert.equal(carmichael(25), 20)
  assert.equal(multOrder(6, 25), 5); assert.equal(multOrder(5, 25), null)
  assert.equal(multOrder(3, 1), 1)
  assert.equal(modInverse(6, 25), 21); assert.equal(zeroDivisorPartner(5, 25), 5)
  assert.equal(modInverse(5, 25), null); assert.equal(zeroDivisorPartner(6, 25), null)
  assert.equal(formatFactorization(12), '2·2·3')
  assert.deepEqual(factorize(12), [{ p: 2, k: 2 }, { p: 3, k: 1 }])
  assert.equal(powMod(2, 10, 1000), 24)
  assert.equal(isPrime(97), true); assert.equal(isPrime(1), false); assert.equal(isPrime(91), false)
  assert.equal(hasPrimitiveRoot(25), true); assert.equal(hasPrimitiveRoot(8), false)
  assert.equal(hasPrimitiveRoot(1), true)
})

test('konstruierbare n-Ecke entsprechen der Legacy-Liste', () => {
  const expected = [3,4,5,6,8,10,12,15,16,17,20,24,30,32,34,40,48,51,60,64,68,80,85,96,102,120,128,136,160,170,192,204,240,255,256,257,272,320,340,384,408,480,510,512,514,544,640,680,768,771,816,960,1020,1024,1028,1088,1280,1285]
  const actual = []
  for (let m = 3; m <= 1285; m++) if (isConstructiblePolygon(m)) actual.push(m)
  assert.deepEqual(actual, expected)
})

test('multOrder: a^ord ≡ 1 und ord teilt carmichael(m)', () => {
  for (let m = 2; m <= 300; m++) {
    const lambda = carmichael(m)
    for (let a = 1; a < m; a++) {
      if (gcd(a, m) !== 1) continue
      const ord = multOrder(a, m)
      assert.equal(powMod(a, ord, m), 1, `${a}^${ord} mod ${m}`)
      assert.equal(lambda % ord, 0, `ord(${a}, ${m}) teilt λ`)
    }
  }
})

test('Σ_{d|m} φ(d) = m für alle 1 ≤ m ≤ 2000', () => {
  for (let m = 1; m <= 2000; m++) {
    assert.equal(divisors(m).reduce((s, d) => s + phi(d), 0), m)
  }
})

test('Konstanten', () => {
  assert.equal(COLORS.length, 34); assert.equal(INTERVALS.length, 20)
  assert.ok(Object.isFrozen(COLORS) && Object.isFrozen(INTERVALS))
  assert.ok(Object.isFrozen(INTERVALS[8].ratios[0]))
  assert.deepEqual(INTERVALS[8], { name: 'perfect 5th', ratios: [[3, 2]] })
})
