import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts(
  'js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js',
  'js/core/lengthFilter.js', 'js/core/geometry.js', 'js/core/cellClassification.js',
  'js/core/viewState.js'
)
const { defaultSingle, defaultTable, parseViewState, serializeViewState } = R.core

test('Standardwerte', () => {
  assert.deepEqual(defaultSingle(), {
    view: 'single', n: 6, m: 25, a: 2, dynamic: true, speed: 1, neighbours: false, cycles: true,
    fixedPoints: true, units: true, lengthFilter: { min: 0, max: 1 }, op: 'mul', dropZero: false,
    sound: true, hideLegend: false, zoom: 1
  })
  assert.deepEqual(defaultTable(), {
    view: 'table', cols: 12, showNGreaterM: true, coprime: 'show', coprimeShifted: 'show',
    display: 'graph', highlight: 'none', cycles: false, sound: true, zoom: 'fit'
  })
})

test('Roundtrip für Standard- und geänderte Zustände', () => {
  const s1 = defaultSingle()
  const s2 = {
    ...defaultSingle(), n: 3, m: 100, a: 7, dynamic: false, speed: 0.5, neighbours: true, cycles: false,
    fixedPoints: false, units: false, lengthFilter: { min: 0.66, max: 0.33 }, op: 'add', dropZero: true,
    sound: false, hideLegend: true, zoom: 1.5
  }
  const t1 = defaultTable()
  const t2 = {
    ...defaultTable(), cols: 7, showNGreaterM: false, coprime: 'only', coprimeShifted: 'hide',
    display: 'pie', highlight: 'cycle3', cycles: true, sound: false, zoom: 2.5
  }
  for (const s of [s1, s2, t1, t2]) assert.deepEqual(parseViewState(serializeViewState(s)), s)
})

test('serialize schreibt nur Abweichungen', () => {
  assert.equal(serializeViewState(defaultSingle()), '?MODE=1&N=6&M=25')
  assert.equal(serializeViewState(defaultTable()), '?MODE=2')
  assert.equal(serializeViewState({ ...defaultSingle(), dynamic: false, sound: false }),
    '?MODE=1&N=6&M=25&dynamic=0&sound=0')
  assert.equal(serializeViewState({ ...defaultTable(), zoom: 2, cycles: true }), '?MODE=2&cycles=1&zoom=2')
})

test('Legacy-URLs', () => {
  const s = parseViewState('?MODE=1&N=3&M=10&dynamic=0')
  assert.equal(s.view, 'single')
  assert.equal(s.n, 3)
  assert.equal(s.m, 10)
  assert.equal(s.dynamic, false)
  assert.deepEqual(parseViewState('?MODE=2'), defaultTable())
  assert.deepEqual(parseViewState(''), defaultSingle())
  assert.equal(parseViewState('?MODE=7&N=2').view, 'single')
})

test('ungültige Eingaben fallen auf Standardwerte zurück', () => {
  const p = q => parseViewState(q)
  assert.equal(p('?N=abc').n, 6)
  assert.equal(p('?N=1.5').n, 6)
  assert.equal(p('?M=-5').m, 25)
  assert.equal(p('?M=0').m, 2)
  assert.equal(p('?M=1').m, 2)
  assert.equal(p('?M=5000').m, 2000)
  assert.equal(p('?N=0').n, 1)
  assert.equal(p('?a=500').a, 100)
  assert.equal(p('?a=0').a, 1)
  assert.equal(p('?MODE=2&cols=999').cols, 60)
  assert.equal(p('?MODE=2&cols=0').cols, 1)
  assert.equal(p('?MODE=2&highlight=foo').highlight, 'none')
  assert.equal(p('?MODE=2&coprime=x').coprime, 'show')
  assert.equal(p('?MODE=2&display=x').display, 'graph')
  assert.equal(p('?op=div').op, 'mul')
  assert.equal(p('?speed=3').speed, 1)
  assert.equal(p('?speed=10').speed, 10)
  assert.deepEqual(p('?min=2&max=abc').lengthFilter, { min: 0, max: 1 })
  assert.equal(p('?zoom=-1').zoom, 1)
  assert.equal(p('?MODE=2&zoom=fit').zoom, 'fit')
  assert.equal(p('?MODE=2&zoom=0').zoom, 'fit')
  assert.equal(p('?MODE=2&zoom=3').zoom, 3)
})

test('Boolesche Parameter', () => {
  assert.equal(parseViewState('?dynamic=0').dynamic, false)
  assert.equal(parseViewState('?dynamic').dynamic, true)
  assert.equal(parseViewState('?dynamic=').dynamic, true)
  assert.equal(parseViewState('?neighbours=1').neighbours, true)
  assert.equal(parseViewState('?cycles=0').cycles, false)
  assert.equal(parseViewState('?MODE=2&cycles=0').cycles, false)
  assert.equal(parseViewState('?MODE=2&cycles').cycles, true)
})

test('Ansicht ℤ/p: Standard, Roundtrip und Grenzen', () => {
  const { defaultModulus } = R.core
  assert.deepEqual(defaultModulus(), {
    view: 'modulus', p: 37, coprime: 'show', coprimeShifted: 'show', display: 'graph', highlight: 'none', cycles: true, zoom: 'fit'
  })
  assert.equal(serializeViewState(defaultModulus()), '?MODE=3&p=37')
  const s = { ...defaultModulus(), p: 11, coprime: 'only', coprimeShifted: 'hide', display: 'numbers', highlight: 'interval', cycles: false, zoom: 0.5 }
  assert.deepEqual(parseViewState(serializeViewState(s)), s)
  assert.equal(parseViewState('?MODE=3&p=9999').p, 500)
  assert.equal(parseViewState('?MODE=3&p=1').p, 2)
  assert.equal(parseViewState('?MODE=3').p, 37)
})
