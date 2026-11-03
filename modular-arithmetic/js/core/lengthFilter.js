// Längenfilter für Kanten: Eine Kante wird nur gezeichnet, wenn ihre Distanz im gewählten Bereich liegt.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})

  /**
   * Prüft, ob eine Kante mit der gegebenen Distanz sichtbar bleibt.
   * Mit h = m/2 gilt bei min ≤ max: min·h ≤ d ≤ max·h.
   * Bei min > max gilt: nicht (d ≤ min·h und d ≥ max·h).
   * @param {number} distance Distanz der Kante auf dem Kreis, 0..m/2
   * @param {number} m Modul
   * @param {{min: number, max: number}} filter Grenzen als Anteil von m/2
   * @returns {boolean} true, falls die Kante gezeichnet wird
   */
  function passesLengthFilter(distance, m, { min, max }) {
    const h = m / 2
    if (min <= max) return distance >= min * h && distance <= max * h
    return !(distance <= min * h && distance >= max * h)
  }

  const preset = (min, max) => Object.freeze({ min, max })

  /** Voreinstellungen wie Legacy `setFilter`. */
  const LENGTH_PRESETS = Object.freeze({
    all: preset(0, 1),
    shortest: preset(0, 0.33),
    longest: preset(0.66, 1),
    medium: preset(0.33, 0.66),
    notShortest: preset(0.33, 1),
    notLongest: preset(0, 0.66),
    notMedium: preset(0.66, 0.33)
  })

  Object.assign(core, { passesLengthFilter, LENGTH_PRESETS })
})()
