import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/lengthFilter.js')
const { passesLengthFilter, LENGTH_PRESETS } = R.core

test('LENGTH_PRESETS.notMedium verwirft Distanz m/4 und behält 0 und m/2 (m = 24)', () => {
  const f = LENGTH_PRESETS.notMedium
  assert.equal(passesLengthFilter(6, 24, f), false)
  assert.equal(passesLengthFilter(0, 24, f), true)
  assert.equal(passesLengthFilter(12, 24, f), true)
})

test('LENGTH_PRESETS enthält die sieben Legacy-Voreinstellungen und ist eingefroren', () => {
  assert.deepEqual(Object.keys(LENGTH_PRESETS), ['all', 'shortest', 'longest', 'medium', 'notShortest', 'notLongest', 'notMedium'])
  assert.deepEqual({ ...LENGTH_PRESETS.shortest }, { min: 0, max: 0.33 })
  assert.deepEqual({ ...LENGTH_PRESETS.notMedium }, { min: 0.66, max: 0.33 })
  assert.equal(Object.isFrozen(LENGTH_PRESETS), true)
})

test('passesLengthFilter bei min <= max: Intervall min*h bis max*h einschließlich der Ränder', () => {
  assert.equal(passesLengthFilter(4, 24, { min: 0.33, max: 0.66 }), true) // 3,96 <= 4 <= 7,92
  assert.equal(passesLengthFilter(3, 24, { min: 0.33, max: 0.66 }), false)
  assert.equal(passesLengthFilter(8, 24, { min: 0.33, max: 0.66 }), false)
  assert.equal(passesLengthFilter(12, 24, LENGTH_PRESETS.all), true)
})
