import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { loadScripts } from './helpers/loadScripts.js'

const ORDER = [
  'js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js',
  'js/core/analysis.js', 'js/core/legendHtml.js', 'js/core/lengthFilter.js', 'js/core/geometry.js',
  'js/core/cellClassification.js', 'js/core/viewState.js', 'js/core/animation.js', 'js/core/tableLayout.js',
  'js/ui/dom.js', 'js/ui/tone.js', 'js/ui/singleView.js', 'js/ui/drawCell.js', 'js/ui/cellCache.js',
  'js/ui/tableView.js', 'js/ui/main.js'
]

test('dom.js, tone.js und singleView.js laden ohne window und document', () => {
  assert.equal(typeof globalThis.window, 'undefined')
  assert.equal(typeof globalThis.document, 'undefined')
  const R = loadScripts(...ORDER.filter(p => p.startsWith('js/core/')), 'js/ui/dom.js', 'js/ui/tone.js', 'js/ui/singleView.js')
  assert.equal(typeof R.ui.renderSingle, 'function')
  assert.equal(typeof R.ui.playRatio, 'function')
  assert.equal(typeof R.ui.el, 'function')
  assert.equal(typeof R.ui.svgEl, 'function')
})

test('index.html lädt die vorhandenen Skripte in der verbindlichen Reihenfolge, main.js zuletzt', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const srcs = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1])
  const expected = ORDER.filter(p => existsSync(new URL('../' + p, import.meta.url)))
  assert.deepEqual(srcs, expected)
  assert.equal(srcs.at(-1), 'js/ui/main.js')
  assert.ok(!/type="module"/.test(html))
})

test('alle 18 Skripte laden in der Reihenfolge von index.html ohne DOM und exportieren ihre Funktionen', () => {
  assert.equal(ORDER.length, 18)
  const R = loadScripts(...ORDER)
  for (const name of ['renderSingle', 'renderTable', 'drawCell', 'createCellCache', 'createNavigator', 'navigate', 'rememberedState', 'el', 'svgEl', 'playRatio'])
    assert.equal(typeof R.ui[name], 'function', name)
  assert.equal(R.ui.rememberedState('table').view, 'table')
  assert.equal(R.ui.rememberedState('single').view, 'single')
  assert.equal(R.ui.rememberedState('modulus').view, 'modulus')
})
