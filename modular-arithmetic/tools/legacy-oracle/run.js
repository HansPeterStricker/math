// Führt den Legacy-Code in einem vm-Kontext aus und schreibt Referenzwerte nach fixtures/legacy.json.
// Aufruf: node tools/legacy-oracle/run.js <Pfad zum Legacy-Ordner>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const legacyDir = resolve(process.argv[2] ?? '../../Mathematik/ratios')
const here = dirname(fileURLToPath(import.meta.url))

// Der Legacy-Code nutzt implizite Globals und läuft daher im Sloppy Mode.
// Fehlende Browser-Globals werden als leere Objekte bereitgestellt.
const context = vm.createContext({ window: {}, document: {}, d3: {}, console })
for (const file of ['euclid2.js', 'helpers.js']) {
  const code = readFileSync(join(legacyDir, file), 'utf8')
  vm.runInContext(code, context, { filename: file })
}

const call = vm.runInContext(
  '(function (name, args) { return globalThis[name].apply(null, args) })',
  context
)

const MAX = 100
const pairs = [] // [a, m, gcd, multOrder]
for (let m = 2; m <= MAX; m++) {
  for (let a = 1; a < m; a++) {
    pairs.push([a, m, call('gcd', [a, m]), call('multOrder', [a, m])])
  }
}
const singles = [] // Index m-1: { m, phi, charmichael, divisors }
for (let m = 1; m <= MAX; m++) {
  singles.push({
    m,
    phi: call('phi', [m]),
    charmichael: call('charmichael', [m]),
    divisors: Array.from(call('getAllDivisorsArray', [m]))
  })
}

const outDir = join(here, 'fixtures')
mkdirSync(outDir, { recursive: true })
const lines = ['{', '"pairsFormat": "[a, m, gcd, multOrder]",', '"pairs": [']
lines.push(pairs.map(p => JSON.stringify(p)).join(',\n'))
lines.push('],', '"singles": [')
lines.push(singles.map(s => JSON.stringify(s)).join(',\n'))
lines.push(']', '}')
writeFileSync(join(outDir, 'legacy.json'), lines.join('\n') + '\n')
console.log(`${pairs.length} Paare, ${singles.length} Einzelwerte`)
