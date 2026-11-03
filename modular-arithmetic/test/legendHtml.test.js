import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js', 'js/core/analysis.js', 'js/core/legendHtml.js')
const { analyze, buildGraph, renderLegendHtml } = R.core
const linkFor = (n, m) => `?N=${n}&M=${m}`
const opts = { showCycles: true, showUnits: true, op: 'mul', linkFor }
const legend = (n, m, over = {}, graphOpts = {}) => {
  const graph = buildGraph(n, m, graphOpts)
  return renderLegendHtml(analyze(n, m, graph), graph, { ...opts, ...over })
}

test('6:25: Zusammenfassung, Karten und Kennzahlen', () => {
  const html = legend(6, 25)
  for (const s of ['6 : 25', 'permutes the 25 residues', '<b>9 cycles</b>', '<b>5-fold</b>', 'class="card"',
    'φ(25) = 20', 'λ(25) = 20', 'Carmichael function', 'ω<sub>6</sub>(25) = 5', '6 · 21 ≡ 1 mod 25',
    'target="_blank" rel="noopener"'])
    assert.ok(html.includes(s), s)
  assert.ok(!html.includes('Charmichael'))
})

test('6:25: Zyklenliste mit Farbe und Hover-Ziel', () => {
  const html = legend(6, 25)
  assert.ok(html.includes('data-target="cyc1"'))
  assert.ok(html.includes('1 → 6 → 11 → 16 → 21'))
  assert.ok(html.includes('class="sw" style="background:#D3A029"'))
})

test('6:25: quadratischer Rest und Wurzeln der 1', () => {
  const html = legend(6, 25)
  assert.ok(html.includes('a² ≡ 6: {9, 16}'))
  assert.ok(html.includes('Quadratic_residue'))
  assert.ok(html.includes('a² ≡ 1: {1, 24}'))
  assert.ok(html.includes('a<sup>5</sup> ≡ 1: {1, 6, 11, 16, 21}'))
  const two = legend(2, 5)
  assert.ok(two.includes('a² ≡ 2 has no solution'))
  assert.ok(two.includes('<b>not</b> a'))
})

test('4:6: keine Permutation, gekürzte Form verlinkt, Nullteiler', () => {
  const html = legend(4, 6)
  assert.ok(html.includes('<b>not a permutation</b>'))
  assert.ok(html.includes('href="?N=2&amp;M=3"'))
  assert.ok(html.includes('zero divisor'))
})

test('gekürzte Form mit m = 1 (50:25 ≡ 2 : 1) steht ohne Link', () => {
  const html = legend(50, 25)
  assert.ok(html.includes('≡ 2 : 1'))
  assert.ok(!html.includes('href="?N=2&amp;M=1"'))
})

test('2:11: Primitivwurzel und Teiler von m − 1', () => {
  const html = legend(2, 11)
  assert.ok(html.includes('primitive root'))
  assert.ok(html.includes('2 is one of them'))
  assert.ok(html.includes('divisors of 11 − 1'))
})

test('6:18: keine Drehsymmetrie und keine Ordnung', () => {
  const html = legend(6, 18)
  assert.ok(html.includes('no rotational symmetry'))
  assert.ok(!html.includes('1-fold'))
  assert.ok(html.includes('n is not a unit'))
})

test('ohne showCycles keine Farbmuster und keine Hover-Ziele, aber ein Hinweis', () => {
  const html = legend(6, 25, { showCycles: false })
  assert.ok(!html.includes('class="sw"'))
  assert.ok(!html.includes('data-target="cyc'))
  assert.ok(html.includes('cycles in colour'))
  assert.ok(html.includes('#(L)'))
})

test('Hinweise auf Symbole nur mit showUnits', () => {
  assert.ok(legend(6, 25).includes('drawn as squares'))
  assert.ok(!legend(6, 25, { showUnits: false }).includes('drawn as'))
})

test('dropZero 2:11: 10 Linien, keine Zeile D = 0', () => {
  const html = legend(2, 11, {}, { dropZero: true })
  assert.ok(html.includes('permutes the 10 residues'))
  assert.ok(!html.includes('data-target="dist0"'))
  assert.match(html, /<th class="l">total<\/th><td><\/td><td>10<\/td>/)
  const full = legend(2, 11)
  assert.ok(full.includes('data-target="dist0"'))
  assert.match(full, /<th class="l">total<\/th><td><\/td><td>11<\/td>/)
})

test('lange Zyklenlisten werden gekürzt', () => {
  const html = legend(1, 100)
  assert.equal((html.match(/data-target="cyc/g) || []).length, 14)
  assert.ok(html.includes('<button type="button" class="linkBtn" data-action="cycles-all">… 86 more cycles</button>'))
  assert.ok(html.includes('<td class="cnt" rowspan="14" data-target="len1">100</td>'))
})

test('mit allCycles erscheinen alle Zyklen und ein Knopf zum Einklappen', () => {
  const html = legend(1, 100, { allCycles: true })
  assert.equal((html.match(/data-target="cyc/g) || []).length, 100)
  assert.ok(html.includes('<td class="cnt" rowspan="100" data-target="len1">100</td>'))
  assert.ok(html.includes('data-action="cycles-fewer">show fewer</button>'))
  assert.ok(!html.includes('more cycles'))
  // kurze Listen brauchen keinen der beiden Knöpfe
  assert.ok(!legend(6, 25, { allCycles: true }).includes('data-action="cycles-'))
})

test('Zyklen nach Länge sortiert, links die Anzahl je Länge', () => {
  // 7:12: 6 Fixpunkte und 3 Zyklen der Länge 2, in buildGraph nicht nach Länge geordnet
  const graph = buildGraph(7, 12)
  const html = renderLegendHtml(analyze(7, 12, graph), graph, opts)
  const lengths = [...html.matchAll(/<tr data-target="cyc\d+">(?:<td class="cnt"[^>]*>\d+<\/td>)?<td class="l">.*?<\/td><td>(\d+)<\/td>/g)].map(m => +m[1])
  assert.equal(lengths.length, graph.cycles.length)
  assert.deepEqual(lengths, [...lengths].sort((x, y) => x - y))
  for (const { length, count } of analyze(7, 12, graph).cycleLengthCounts) {
    assert.ok(html.includes(`rowspan="${count}" data-target="len${length}">${count}</td>`), `L = ${length}`)
  }
  assert.ok(html.includes('<th>#(L)</th>'))
})

test('Abschnitte merken ihren Zustand über options.open', () => {
  const closed = legend(6, 25)
  assert.match(closed, /<details data-section="cycles" open>/)
  assert.match(closed, /<details data-section="units">/)
  const open = legend(6, 25, { open: { cycles: false, units: true } })
  assert.match(open, /<details data-section="cycles">/)
  assert.match(open, /<details data-section="units" open>/)
})

test('Addition: Abbildung a ↦ n + a im Text', () => {
  const html = legend(3, 12, { op: 'add' }, { op: 'add' })
  assert.ok(html.includes('a ↦ 3 + a mod 12'))
  assert.ok(!html.includes('rotational symmetry.'))
})

test('3:7: quadratische Reziprozität mit Legendre-Symbolen', () => {
  const html = legend(3, 7)
  assert.match(html, /<details data-section="reciprocity" open>/)
  // 3 ist kein Quadrat mod 7, 7 ≡ 1 ≡ 1² ≡ 2² mod 3
  assert.ok(html.includes('3 ≢ x² mod 7'))
  assert.ok(html.includes('7 ≡ 1 ≡ 1² ≡ 2² mod 3'))
  assert.ok(html.includes('<span class="leg"><span>3</span><span>7</span></span>) = −1'))
  assert.ok(html.includes('<span class="leg"><span>7</span><span>3</span></span>) = +1'))
  assert.ok(html.includes('= (−1)<sup>1·3</sup> = −1'))
  assert.ok(html.includes('Quadratic_reciprocity'))
})

test('5:11: beide Symbole +1, weil 5 ≡ 1 mod 4', () => {
  const html = legend(5, 11)
  assert.ok(html.includes('5 ≡ 4² ≡ 7² mod 11'))
  assert.ok(html.includes('11 ≡ 1 ≡ 1² ≡ 4² mod 5'))
  assert.ok(legend(5, 37).includes('37 ≡ 2 ≢ x² mod 5'))
  assert.ok(html.includes('= (−1)<sup>2·5</sup> = +1'))
})

test('2:7: Ergänzungssatz für 2', () => {
  const html = legend(2, 7)
  assert.ok(html.includes('2 ≡ 3² ≡ 4² mod 7'))
  assert.ok(html.includes('<span class="leg"><span>2</span><span>7</span></span>) = +1'))
  assert.ok(html.includes('7 ≡ 7 mod 8'))
  assert.ok(!html.includes('<span class="leg"><span>7</span><span>2</span></span>'))
})

test('keine Reziprozität, wenn n oder m keine Primzahl ist oder m = 2', () => {
  for (const [n, m] of [[6, 25], [4, 7], [3, 9], [3, 2], [7, 7]]) {
    assert.ok(!legend(n, m).includes('data-section="reciprocity"'), `${n}:${m}`)
  }
})

test('Legendre-Symbole stimmen mit dem Euler-Kriterium überein', () => {
  const { isPrime, powMod } = R.core
  const primes = Array.from({ length: 120 }, (_, i) => i).filter(x => x > 2 && isPrime(x))
  const shown = (html, a, p) => html.includes(`<span class="leg"><span>${a}</span><span>${p}</span></span>) = +1`) ? 1 : -1
  for (const p of primes) for (const q of primes) {
    if (p === q) continue
    const html = legend(p, q)
    const euler = (a, r) => (powMod(a % r, (r - 1) / 2, r) === 1 ? 1 : -1)
    assert.equal(shown(html, p, q), euler(p, q), `(${p}/${q})`)
    assert.equal(shown(html, q, p), euler(q, p), `(${q}/${p})`)
  }
})
