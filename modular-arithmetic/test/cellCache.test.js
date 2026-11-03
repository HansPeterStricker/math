import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts(
  'js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js', 'js/core/analysis.js',
  'js/core/legendHtml.js', 'js/core/lengthFilter.js', 'js/core/geometry.js', 'js/core/cellClassification.js',
  'js/core/viewState.js', 'js/core/animation.js', 'js/core/tableLayout.js',
  'js/ui/cellCache.js'
)
const { createCellCache } = R.ui
const { tableGeometry, cellOpacity } = R.core

test('Cache: zweiter Zugriff auf dieselbe Zelle berechnet nicht neu', () => {
  const cache = createCellCache()
  const a = cache.get(2, 5, false)
  assert.equal(cache.misses, 1)
  const b = cache.get(2, 5, false)
  assert.equal(cache.misses, 1)
  assert.equal(a, b)
  assert.equal(a.graph.n, 2)
  assert.equal(a.graph.m, 5)
  assert.ok(Array.isArray(a.primitives.lines))
  assert.equal(a.cls.gcd, 1)
})

test('Cache: Wechsel der Hervorhebung erzeugt keine Neuberechnung', () => {
  const cache = createCellCache()
  const cells = tableGeometry(12).cells
  for (const c of cells) cache.get(c.n, c.m, false)
  const before = cache.misses
  assert.equal(before, cells.length)
  for (const c of cells) {
    const { cls } = cache.get(c.n, c.m, false)
    cellOpacity(cls, { coprime: 'show', coprimeShifted: 'show', highlight: 'cycle3' })
  }
  assert.equal(cache.misses, before)
})

test('Cache: cycles true/false sind getrennte Einträge', () => {
  const cache = createCellCache()
  const a = cache.get(3, 7, false)
  const b = cache.get(3, 7, true)
  assert.equal(cache.misses, 2)
  assert.notEqual(a, b)
  assert.notDeepEqual(a.primitives.lines.map(l => l.color), b.primitives.lines.map(l => l.color))
})

test('Cache: maxEntries wird eingehalten (LRU)', () => {
  const cache = createCellCache(3)
  cache.get(2, 3, false) // A
  cache.get(2, 5, false) // B
  cache.get(2, 7, false) // C
  cache.get(2, 3, false) // A zuletzt benutzt
  assert.equal(cache.misses, 3)
  cache.get(3, 5, false) // D verdrängt B
  assert.equal(cache.misses, 4)
  cache.get(2, 3, false) // A noch vorhanden
  assert.equal(cache.misses, 4)
  cache.get(2, 5, false) // B wurde verdrängt
  assert.equal(cache.misses, 5)
  assert.ok(cache.size() <= 3)
})

test('Cache: Standardgröße fasst alle Zellen von cols=60 mit und ohne cycles', () => {
  const cache = createCellCache()
  const cells = tableGeometry(60).cells
  for (const c of cells) { cache.get(c.n, c.m, false); cache.get(c.n, c.m, true) }
  const before = cache.misses
  for (const c of cells) { cache.get(c.n, c.m, false); cache.get(c.n, c.m, true) }
  assert.equal(cache.misses, before)
})
