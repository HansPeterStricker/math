import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/numberTheory.js', 'js/core/constants.js', 'js/core/cellClassification.js')
const { classifyCell, matchesHighlight, cellOpacity } = R.core

test('classifyCell', () => {
  assert.equal(classifyCell(3, 2).interval, 'perfect 5th')
  assert.equal(classifyCell(2, 4).interval, 'perfect octave')
  assert.equal(classifyCell(128, 125).interval, 'dim. 2nd')
  assert.equal(classifyCell(11, 7).interval, null)
  assert.equal(classifyCell(11, 7).intervalIndex, null)
  assert.equal(matchesHighlight(classifyCell(6, 25), 'cycle5'), true)
  assert.equal(matchesHighlight(classifyCell(6, 25), 'cycle4'), false)
  assert.equal(classifyCell(2, 17).constructible, true)
})

test('classifyCell Felder', () => {
  const c = classifyCell(2, 11)
  assert.equal(c.coprime, true)
  assert.equal(c.coprimeShifted, true)
  assert.equal(c.nGreaterM, false)
  assert.equal(c.gcd, 1)
  assert.equal(c.gcdShifted, 1)
  assert.equal(c.primitiveRoot, true)
  assert.deepEqual([...c.cycleLengths], [10])
  const d = classifyCell(4, 6)
  assert.equal(d.gcd, 2)
  assert.equal(d.coprime, false)
  assert.equal(d.primitiveRoot, false)
  assert.equal(classifyCell(7, 5).nGreaterM, true)
  assert.equal(classifyCell(7, 5).gcd, 1) // 7 mod 5 = 2
  assert.equal(classifyCell(3, 2).intervalIndex, 8)
})

test('matchesHighlight', () => {
  assert.equal(matchesHighlight(classifyCell(4, 6), 'none'), true)
  assert.equal(matchesHighlight(classifyCell(4, 6), 'gcd'), true)
  assert.equal(matchesHighlight(classifyCell(5, 6), 'gcd'), false)
  assert.equal(matchesHighlight(classifyCell(3, 7), 'gcdShifted'), false) // gcd(2, 7) = 1
  assert.equal(matchesHighlight(classifyCell(3, 8), 'gcdShifted'), true) // gcd(2, 8) = 2
  assert.equal(matchesHighlight(classifyCell(2, 11), 'primitiveRoot'), true)
  assert.equal(matchesHighlight(classifyCell(3, 2), 'interval'), true)
  assert.equal(matchesHighlight(classifyCell(11, 7), 'interval'), false)
  assert.equal(matchesHighlight(classifyCell(2, 17), 'constructible'), true)
})

test('cellOpacity', () => {
  const st = (o = {}) => ({ coprime: 'off', coprimeShifted: 'off', highlight: 'none', ...o })
  assert.equal(cellOpacity(classifyCell(2, 4), st({ coprime: 'only' })), 0.3)
  assert.equal(cellOpacity(classifyCell(3, 4), st({ coprime: 'hide' })), 0.3)
  assert.equal(cellOpacity(classifyCell(3, 4), st({ coprime: 'only' })), 1)
  assert.equal(cellOpacity(classifyCell(6, 25), st({ highlight: 'cycle5' })), 1)
  assert.equal(cellOpacity(classifyCell(6, 25), st({ highlight: 'cycle4' })), 0.2)
  assert.equal(cellOpacity(classifyCell(2, 4), st({ coprime: 'only', highlight: 'cycle4' })), 0.2)
  assert.equal(cellOpacity(classifyCell(3, 5), st({ coprimeShifted: 'hide' })), 0.3) // gcd(2, 5) = 1
})
