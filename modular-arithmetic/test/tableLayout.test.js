import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/tableLayout.js')
const { CELL_SIZE, LABEL_SIZE, tableGeometry, modulusGeometry, hitTest } = R.core
const pick = c => ({ n: c.n, m: c.m, x: c.x, y: c.y })

test('tableGeometry(12): Rand für Beschriftung, keine Spalte m = 1, keine Diagonale', () => {
  const g = tableGeometry(12)
  assert.equal(CELL_SIZE, 120)
  assert.equal(LABEL_SIZE, 40)
  assert.equal(g.width, 40 + 11 * 120)
  assert.equal(g.height, 40 + 12 * 120)
  // 12 Zeilen × 11 Spalten, davon 11 auf der Diagonale
  assert.equal(g.cells.length, 121)
  assert.deepEqual(pick(g.cells[0]), { n: 1, m: 2, x: 40, y: 40 })
  assert.deepEqual(pick(g.cells.at(-1)), { n: 12, m: 11, x: 40 + 9 * 120, y: 40 + 11 * 120 })
  assert.ok(g.cells.every(c => c.n !== c.m && c.m >= 2))
  assert.deepEqual(g.rowLabels.map(l => l.text), ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  assert.deepEqual(g.colLabels.map(l => l.text), ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
  assert.equal(g.cellLabels, false)
})

test('tableGeometry ohne n > m', () => {
  const g = tableGeometry(5, false)
  assert.ok(g.cells.every(c => c.n < c.m))
  assert.equal(g.cells.length, 10)
})

test('tableGeometry(1) hat keine Zellen', () => {
  assert.deepEqual(tableGeometry(1).cells, [])
})

test('modulusGeometry(37): 6 × 6-Quadrat mit n = 1..36', () => {
  const g = modulusGeometry(37)
  assert.equal(g.cols, 6)
  assert.equal(g.rows, 6)
  assert.equal(g.width, 720)
  assert.equal(g.height, 720)
  assert.deepEqual(g.cells.map(c => c.n), Array.from({ length: 36 }, (_, i) => i + 1))
  assert.ok(g.cells.every(c => c.m === 37))
  assert.deepEqual(pick(g.cells[7]), { n: 8, m: 37, x: 120, y: 120 })
  assert.equal(g.cellLabels, true)
})

test('modulusGeometry: möglichst quadratisch', () => {
  for (const [p, cols, rows] of [[2, 1, 1], [5, 2, 2], [7, 3, 2], [11, 4, 3], [101, 10, 10], [102, 11, 10]]) {
    const g = modulusGeometry(p)
    assert.deepEqual([g.cols, g.rows, g.cells.length], [cols, rows, p - 1], `p = ${p}`)
  }
})

test('hitTest', () => {
  const t = tableGeometry(12)
  assert.deepEqual(pick(hitTest(t, 40 + 1 * 120 + 60, 40 + 1 * 120 + 60)), { n: 2, m: 3, x: 160, y: 160 })
  assert.equal(hitTest(t, 40 + 0 * 120 + 60, 40 + 1 * 120 + 60), null) // 2:2
  assert.equal(hitTest(t, 10, 100), null) // Beschriftung
  assert.equal(hitTest(t, 100, 10), null)
  assert.equal(hitTest(t, 40 + 11 * 120 + 1, 100), null)
  assert.equal(hitTest(tableGeometry(5, false), 40 + 60, 40 + 2 * 120 + 60), null) // 3:2 ausgeblendet
  const mg = modulusGeometry(37)
  assert.equal(hitTest(mg, 2 * 120 + 5, 3 * 120 + 5).n, 21)
  assert.equal(hitTest(mg, -1, 5), null)
  assert.equal(hitTest(modulusGeometry(6), 2 * 120 + 5, 1 * 120 + 5), null) // nur 5 Zellen in 3 × 2
})
