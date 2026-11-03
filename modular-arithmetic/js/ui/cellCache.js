// Zwischenspeicher für die Zellen der Tabellenansicht: Graph, Zeichenprimitive und Klassifikation je Zelle.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const ui = (R.ui ??= {})
  const core = R.core
  const { buildGraph, graphPrimitives, classifyCell } = core

  /**
   * Erzeugt einen Zwischenspeicher mit LRU-Verdrängung (Least Recently Used).
   * Der Schlüssel ist n, m und cycles; Hervorhebung und Deckkraft gehören nicht dazu,
   * weil sie aus der Klassifikation berechnet werden.
   * @param {number} [maxEntries] höchste Anzahl gespeicherter Zellen (Standard 8000)
   * @returns {{get: function(number, number, boolean): {graph: Object, primitives: Object, cls: Object},
   *   size: function(): number, misses: number}}
   *   get liefert die Zelle (und berechnet sie bei Bedarf), size die Anzahl gespeicherter Zellen,
   *   misses zählt die Neuberechnungen
   */
  function createCellCache(maxEntries = 8000) {
    const map = new Map()
    const cache = {
      misses: 0,
      get(n, m, cycles) {
        const key = `${n}:${m}:${cycles}`
        let entry = map.get(key)
        if (entry !== undefined) {
          // Neu einfügen: Map behält die Einfügereihenfolge, der älteste Eintrag steht vorn.
          map.delete(key)
          map.set(key, entry)
          return entry
        }
        cache.misses++
        const graph = buildGraph(n, m)
        const primitives = graphPrimitives(graph, {
          context: 'table', showCycles: cycles, highlightFixedPoints: true, showUnits: false,
          lengthFilter: { min: 0, max: 1 }, showResidueLabels: false
        })
        entry = { graph, primitives, cls: classifyCell(n, m) }
        map.set(key, entry)
        while (map.size > maxEntries) map.delete(map.keys().next().value)
        return entry
      },
      size: () => map.size
    }
    return cache
  }

  Object.assign(ui, { createCellCache })
})()
