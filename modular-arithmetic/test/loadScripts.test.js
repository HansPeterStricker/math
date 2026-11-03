import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { loadScripts } from './helpers/loadScripts.js'

const CORE = ['js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js']

test('loadScripts stellt die Funktionen bereit', () => {
  const R = loadScripts(...CORE)
  assert.equal(typeof R.core.gcd, 'function')
  assert.equal(typeof R.core.buildGraph, 'function')
  assert.equal(R.core.COLORS.length, 34)
})

test('mehrfaches Laden führt eine Datei nur einmal aus', () => {
  const R1 = loadScripts(...CORE)
  const core = R1.core
  const gcd = core.gcd
  const R2 = loadScripts('js/core/numberTheory.js', ...CORE)
  assert.equal(R2, R1)
  assert.equal(R2.core, core)
  assert.equal(R2.core.gcd, gcd)
})

test('keine Datei in js/ enthält import oder export', () => {
  const jsDir = fileURLToPath(new URL('../js', import.meta.url))
  const files = readdirSync(jsDir, { recursive: true }).filter(f => f.endsWith('.js'))
  assert.ok(files.length >= 3)
  for (const f of files) {
    const text = readFileSync(join(jsDir, f), 'utf8')
    assert.doesNotMatch(text, /^\s*(import|export)\b/m, f)
  }
})
