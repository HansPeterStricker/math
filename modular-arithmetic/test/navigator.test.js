import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts(
  'js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js',
  'js/core/analysis.js', 'js/core/legendHtml.js', 'js/core/lengthFilter.js', 'js/core/geometry.js',
  'js/core/cellClassification.js', 'js/core/viewState.js', 'js/core/animation.js', 'js/core/tableLayout.js',
  'js/ui/dom.js', 'js/ui/tone.js', 'js/ui/singleView.js', 'js/ui/main.js'
)
const { createNavigator } = R.ui
const { defaultSingle } = R.core

test('navigate legt den Zustand in history.state ab, ohne die URL zu ändern, und rendert', () => {
  const calls = [], rendered = []
  const history = {
    pushState: (...a) => calls.push(['push', a]),
    replaceState: (...a) => calls.push(['replace', a])
  }
  const nav = createNavigator({ history, render: s => rendered.push(s) })
  nav.navigate({ ...defaultSingle(), n: 7 }, { replace: false })
  nav.navigate({ ...defaultSingle(), n: 8 }, { replace: true })
  assert.deepEqual(calls.map(c => c[0]), ['push', 'replace'])
  assert.equal(calls[0][1][0].ratios.n, 7)
  assert.ok(calls.every(c => c[1].length === 2), 'kein URL-Argument')
  assert.equal(rendered.length, 2)
})

test('navigate rendert trotzdem, wenn die History-API eine Ausnahme wirft', () => {
  const boom = () => { throw new Error('SecurityError') }
  const rendered = []
  const nav = createNavigator({ history: { pushState: boom, replaceState: boom }, render: s => rendered.push(s) })
  nav.navigate({ ...defaultSingle(), n: 9 }, { replace: true })
  nav.navigate({ ...defaultSingle(), n: 10 }, { replace: false })
  assert.deepEqual(rendered.map(s => s.n), [9, 10])
  assert.equal(nav.current().n, 10)
})

test('onPopState liest history.state; ohne Zustand bleibt der aktuelle Zustand', () => {
  const rendered = []
  const nav = createNavigator({ history: { pushState() {}, replaceState() {} }, render: s => rendered.push(s) })
  nav.onPopState({ state: { ratios: { ...defaultSingle(), n: 3, m: 7 } } })
  assert.equal(rendered[0].n, 3)
  nav.onPopState({ state: null })
  assert.equal(rendered[1].n, 3)
})

test('defaultState liefert die Werkseinstellungen, auch nachdem eine Ansicht gezeichnet wurde', () => {
  assert.deepEqual(R.ui.defaultState('single'), defaultSingle())
  assert.equal(R.ui.defaultState('modulus').p, 37)
  assert.equal(R.ui.defaultState('table').view, 'table')
})
