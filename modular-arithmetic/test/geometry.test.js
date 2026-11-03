import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts(
  'js/core/numberTheory.js', 'js/core/constants.js', 'js/core/multiplicationGraph.js',
  'js/core/lengthFilter.js', 'js/core/geometry.js'
)
const { buildGraph, circlePoints, graphPrimitives, pieArc, LENGTH_PRESETS, COLORS } = R.core

const style = (over = {}) => ({
  context: 'single', showCycles: true, highlightFixedPoints: false, showUnits: false,
  lengthFilter: LENGTH_PRESETS.all, showResidueLabels: false, ...over
})
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`)

test('circlePoints 1:4', () => {
  const p = circlePoints(buildGraph(1, 4))
  close(p.get(0).x, 0); close(p.get(0).y, 1)
  close(p.get(1).x, 1); close(p.get(1).y, 0)
  close(p.get(2).x, 0); close(p.get(2).y, -1)
})

test('circlePoints mit dropZero beginnt bei 1 und verschiebt um tau/(2(m-1))', () => {
  const p = circlePoints(buildGraph(2, 5, { dropZero: true }))
  assert.equal(p.has(0), false)
  const d = 2 * Math.PI / (2 * 4)
  close(p.get(1).x, Math.sin(-d)); close(p.get(1).y, Math.cos(-d))
})

test('graphPrimitives 6:25 single mit Zyklen: 25 Linien, 4 Farben für die 5er-Zyklen, Breite 30/5 = 6', () => {
  const g = buildGraph(6, 25)
  const pr = graphPrimitives(g, style())
  assert.equal(pr.lines.length, 25)
  const long = pr.lines.filter(l => g.edges[l.order].from % 5 !== 0)
  assert.equal(long.length, 20)
  assert.equal(new Set(long.map(l => l.color)).size, 4)
  assert.ok(long.every(l => l.width === 6))
  assert.ok(long.every(l => COLORS.includes(l.color)))
  const fixed = pr.lines.filter(l => g.edges[l.order].from % 5 === 0)
  assert.ok(fixed.every(l => l.width === 30 && l.x1 === l.x2 && l.y1 === l.y2))
})

test('graphPrimitives ohne Zyklen: schwarz, Breite base/2; table: 0,25', () => {
  const g = buildGraph(2, 7)
  assert.ok(graphPrimitives(g, style({ showCycles: false })).lines.every(l => l.color === 'black' && l.width === 0.5))
  assert.ok(graphPrimitives(g, style({ showCycles: false, context: 'table' })).lines.every(l => l.width === 0.25))
})

test('graphPrimitives mit Längenfilter shortest enthält keine Linie mit Distanz > 0,33·m/2', () => {
  const g = buildGraph(7, 30)
  const pr = graphPrimitives(g, style({ lengthFilter: LENGTH_PRESETS.shortest }))
  assert.ok(pr.lines.length > 0 && pr.lines.length < g.edges.length)
  for (const l of pr.lines) assert.ok(g.edges[l.order].distance <= 0.33 * 30 / 2)
})

test('graphPrimitives: nicht teilerfremde Kanten außerhalb von Zyklen sind silbern', () => {
  const g = buildGraph(4, 6)
  const l = graphPrimitives(g, style()).lines.find(x => g.edges[x.order].from === 1)
  assert.equal(l.color, 'silver')
  assert.equal(l.width, 0.5)
})

test('graphPrimitives Punkte, Ringe und Beschriftungen', () => {
  const g = buildGraph(4, 6)
  const pr = graphPrimitives(g, style({ highlightFixedPoints: true, showCycles: false, showUnits: true, showResidueLabels: true }))
  assert.equal(pr.dots.length, 6)
  const d0 = pr.dots.find(d => d.residue === 0), d1 = pr.dots.find(d => d.residue === 1)
  assert.equal(d0.r, 10)
  assert.equal(d0.fill, 'black')
  assert.equal(d0.isImagePoint, true)
  assert.equal(d1.r, 5)
  assert.equal(d1.fill, 'silver')
  assert.equal(d1.isImagePoint, false)
  assert.equal(pr.rings.filter(r => r.kind === 'unit').length, g.units.length)
  assert.equal(pr.labels.length, 6)
  assert.equal(pr.labels.find(l => l.text === '0').color, 'red')
  assert.equal(pr.labels.find(l => l.text === '3').color, 'gray')
  close(Math.hypot(pr.labels[0].x, pr.labels[0].y), 1.15)
  const t = graphPrimitives(g, style({ context: 'table', showUnits: true, showResidueLabels: true, highlightFixedPoints: true, showCycles: false }))
  assert.equal(t.rings.length, 0)
  assert.equal(t.dots.find(d => d.residue === 0).r, 3.6)
  const none = graphPrimitives(g, style({ highlightFixedPoints: false }))
  assert.ok(none.dots.every(d => d.fill === 'black' && d.r === 5))
})

test('pieArc(1, 2) und pieArc(3, 2) liefern die Werte der Legacy-Formel', () => {
  // n < m: c = pi/4; start = -pi/2 + pi/4 = -pi/4, end = pi/2 + pi/4 = 3pi/4
  const a = pieArc(1, 2)
  close(a.start, -0.7853981633974483)
  close(a.end, 2.356194490192345)
  // n > m: c = pi + pi/4 = 5pi/4; start = -2pi/3 + 5pi/4 = 7pi/12, end = 2pi/3 + 5pi/4 = 23pi/12
  const b = pieArc(3, 2)
  close(b.start, 1.8325957145940461)
  close(b.end, 6.021385919380437)
  assert.equal(pieArc(5, 5), null)
})

test('graphPrimitives single mit Zyklen: Fixpunkte groß in der Farbe ihres Zyklus, Tabelle unverändert', () => {
  const g = buildGraph(6, 25)
  const pr = graphPrimitives(g, style({ highlightFixedPoints: true, showCycles: true }))
  const d5 = pr.dots.find(d => d.residue === 5), d1 = pr.dots.find(d => d.residue === 1)
  assert.equal(d5.r, 10)
  assert.equal(d5.fill, COLORS[g.edges.find(e => e.from === 5).cycleIndex % COLORS.length])
  assert.equal(d1.r, 5)
  assert.equal(d1.fill, 'black')
  const t = graphPrimitives(g, style({ context: 'table', highlightFixedPoints: true, showCycles: true }))
  assert.ok(t.dots.every(d => d.r === 2 && (d.fill === 'black' || d.fill === 'silver')))
})

test('Punkte berühren sich nicht: Radius höchstens 45 % des Abstands benachbarter Punkte', () => {
  for (const [context, R] of [['single', 288], ['neighbour', 288], ['table', 54]]) {
    for (const m of [7, 60, 200, 500]) {
      const g = buildGraph(3, m, { op: 'mul', dropZero: false })
      const pr = graphPrimitives(g, style({ context, highlightFixedPoints: true, showCycles: false }))
      const chord = 2 * R * Math.sin(Math.PI / g.residues.length)
      assert.ok(pr.dots.every(d => 2 * d.r < chord), `${context}, m = ${m}`)
    }
  }
  // Bei kleinem m bleiben die Standardradien erhalten.
  const small = graphPrimitives(buildGraph(3, 7, { op: 'mul', dropZero: false }), style({ context: 'single' }))
  assert.ok(small.dots.every(d => d.r === 5))
})

test('Ringe um Einheiten und Wurzeln schrumpfen mit den Punkten; die äußerste Markierung berührt den Nachbarn nicht', () => {
  for (const m of [60, 200, 500]) {
    const g = buildGraph(7, m, { op: 'mul', dropZero: false })
    const pr = graphPrimitives(g, style({ context: 'single', showUnits: true, highlightFixedPoints: true }))
    const chord = 2 * 288 * Math.sin(Math.PI / g.residues.length)
    const r = new Map(pr.dots.map(d => [`${d.x},${d.y}`, d.r]))
    for (const ring of pr.rings) {
      const d = r.get(`${ring.x},${ring.y}`)
      const outer = ring.kind === 'sqrtOne' ? (d + 11 * pr.markScale) / 2 * Math.SQRT2 : d + (ring.kind === 'sqrtN' ? 8 : 3) * pr.markScale
      assert.ok(outer <= 0.45 * chord + 1e-9, `m = ${m}`)
    }
  }
  assert.equal(graphPrimitives(buildGraph(3, 7), style({ context: 'single', showUnits: true })).markScale, 1)
})
