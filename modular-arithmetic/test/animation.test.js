import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadScripts } from './helpers/loadScripts.js'

const R = loadScripts('js/core/animation.js')
const { lineDelayMs, visibleLineCount, createAnimation } = R.core

function fakeEnv() {
  const env = { t: 0, queue: new Map(), nextId: 1, cancelled: [] }
  env.now = () => env.t
  env.requestFrame = cb => { const id = env.nextId++; env.queue.set(id, cb); return id }
  env.cancelFrame = id => { env.cancelled.push(id); env.queue.delete(id) }
  env.runFrame = () => { const [id, cb] = env.queue.entries().next().value; env.queue.delete(id); cb() }
  return env
}

function start(env, over = {}) {
  const seen = []
  const anim = createAnimation({
    lineCount: 25, m: 25, speed: 1, onFrame: c => seen.push(c),
    now: env.now, requestFrame: env.requestFrame, cancelFrame: env.cancelFrame, ...over
  })
  return { seen, anim }
}

test('lineDelayMs', () => {
  assert.equal(lineDelayMs(0, 25, 1), 0)
  assert.equal(lineDelayMs(10, 25, 1), 1000)
  assert.equal(lineDelayMs(10, 100, 2), 1000)
})

test('visibleLineCount m=25 speed=1', () => {
  assert.equal(visibleLineCount(0, 25, 25, 1), 1)
  assert.equal(visibleLineCount(2000, 25, 25, 1), 21)
  assert.equal(visibleLineCount(5000, 25, 25, 1), 25)
  assert.equal(visibleLineCount(0, 0, 25, 1), 0)
  assert.equal(visibleLineCount(99999, 25, 25, 1), 25)
})

test('createAnimation: Frames bis alle Linien sichtbar sind', () => {
  const env = fakeEnv()
  const { seen } = start(env)
  assert.equal(env.queue.size, 1)
  assert.deepEqual(seen, [])
  env.runFrame()
  env.t = 2000; env.runFrame()
  env.t = 6000; env.runFrame()
  assert.deepEqual(seen, [1, 21, 25])
  assert.equal(env.queue.size, 0)
})

test('createAnimation: Startzeit wird bei der Erzeugung erfasst', () => {
  const env = fakeEnv()
  env.t = 1000
  const { seen } = start(env)
  env.t = 3000; env.runFrame()
  assert.deepEqual(seen, [21])
})

test('createAnimation: cancel verhindert weitere onFrame-Aufrufe', () => {
  const env = fakeEnv()
  const { seen, anim } = start(env)
  env.runFrame()
  assert.equal(seen.length, 1)
  const queuedTick = env.queue.values().next().value
  anim.cancel()
  assert.equal(env.cancelled.length, 1)
  assert.equal(env.queue.size, 0)
  queuedTick() // bereits eingereihter Tick läuft nachträglich
  assert.equal(seen.length, 1)
  assert.equal(env.queue.size, 0)
})

test('createAnimation: lineCount 0 meldet 0 und endet', () => {
  const env = fakeEnv()
  const { seen } = start(env, { lineCount: 0 })
  env.runFrame()
  assert.deepEqual(seen, [0])
  assert.equal(env.queue.size, 0)
})
