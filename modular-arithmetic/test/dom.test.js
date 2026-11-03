import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

class FakeNode {
  constructor(tag) { this.tag = tag; this.attrs = {}; this.kids = [] }
  setAttribute(k, v) { this.attrs[k] = v }
  addEventListener() {}
  append(...c) { this.kids.push(...c) }
}
globalThis.document = {
  createElement: t => new FakeNode(t),
  createElementNS: (ns, t) => new FakeNode(t),
  createTextNode: s => ({ text: s })
}
const { el } = loadScripts('js/ui/dom.js').ui

test('el flacht verschachtelte Kind-Arrays rekursiv ab und überspringt leere Werte', () => {
  const sub = el('sub', {}, 'M')
  const node = el('label', {}, [el('input'), ' ', ['ℤ', sub, [null, false, undefined, 3]]])
  assert.deepEqual(node.kids.map(k => k.text ?? k.tag), ['input', ' ', 'ℤ', 'sub', 3 + ''])
})

test('el akzeptiert ein einzelnes Kind ohne Array', () => {
  assert.equal(el('p', {}, 'x').kids[0].text, 'x')
  assert.equal(el('p').kids.length, 0)
})
