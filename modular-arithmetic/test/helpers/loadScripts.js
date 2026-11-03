import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const loaded = new Set()

/**
 * Führt klassische Skripte im aktuellen Kontext aus, in der angegebenen Reihenfolge.
 * Jede Datei wird je Prozess höchstens einmal ausgeführt.
 * @param {...string} paths Pfade relativ zum Wurzelverzeichnis des Repositorys, z. B. 'js/core/numberTheory.js'
 * @returns {any} globalThis.Ratios
 */
export function loadScripts(...paths) {
  for (const p of paths) {
    const file = resolve(root, p)
    if (loaded.has(file)) continue
    loaded.add(file)
    vm.runInThisContext(readFileSync(file, 'utf8'), { filename: file })
  }
  return globalThis.Ratios
}
