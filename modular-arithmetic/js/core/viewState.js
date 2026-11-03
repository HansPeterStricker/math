// Ansichtszustand (Einzelansicht und Tabelle) und seine Abbildung auf den URL-Query-String.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})

  const SPEEDS = [0.1, 0.5, 1, 2, 10]
  const OPS = ['mul', 'add']
  const COPRIME = ['show', 'hide', 'only']
  const DISPLAYS = ['graph', 'numbers', 'pie']
  const HIGHLIGHTS = [
    'none', 'gcd', 'gcdShifted', 'primitiveRoot', 'interval', 'constructible',
    'cycle2', 'cycle3', 'cycle4', 'cycle5', 'cycle6', 'cycle7'
  ]

  /**
   * @typedef {{view: 'single', n: number, m: number, a: number, dynamic: boolean, speed: number,
   *   neighbours: boolean, cycles: boolean, fixedPoints: boolean, units: boolean,
   *   lengthFilter: {min: number, max: number}, op: 'mul'|'add', dropZero: boolean, sound: boolean,
   *   hideLegend: boolean, zoom: number}} SingleState
   * @typedef {{view: 'table', cols: number, showNGreaterM: boolean, coprime: 'show'|'hide'|'only',
   *   coprimeShifted: 'show'|'hide'|'only', display: 'graph'|'numbers'|'pie', highlight: string,
   *   cycles: boolean, sound: boolean, zoom: number|'fit'}} TableState
   * @typedef {{view: 'modulus', p: number, coprime: 'show'|'hide'|'only', coprimeShifted: 'show'|'hide'|'only', display: 'graph'|'numbers'|'pie',
   *   highlight: string, cycles: boolean, zoom: number|'fit'}} ModulusState
   */

  /** Größter Modul p der Ansicht „Graphs of ℤ/p“. */
  const P_MAX = 500

  /**
   * Standardzustand der Einzelansicht.
   * @returns {SingleState} neuer Standardzustand
   */
  function defaultSingle() {
    return {
      view: 'single', n: 6, m: 25, a: 2, dynamic: true, speed: 1, neighbours: false, cycles: true,
      fixedPoints: true, units: true, lengthFilter: { min: 0, max: 1 }, op: 'mul', dropZero: false,
      sound: true, hideLegend: false, zoom: 1
    }
  }

  /**
   * Standardzustand der Tabellenansicht.
   * @returns {TableState} neuer Standardzustand
   */
  function defaultTable() {
    return {
      view: 'table', cols: 12, showNGreaterM: true, coprime: 'show', coprimeShifted: 'show',
      display: 'graph', highlight: 'none', cycles: false, sound: true, zoom: 'fit'
    }
  }

  /**
   * Standardzustand der Ansicht „Graphs of ℤ/p“ (alle Graphen n:p, n = 1..p − 1).
   * @returns {ModulusState} neuer Standardzustand
   */
  function defaultModulus() {
    return { view: 'modulus', p: 37, coprime: 'show', coprimeShifted: 'show', display: 'graph', highlight: 'none', cycles: true, zoom: 'fit' }
  }

  function boolParam(params, key, def) {
    if (!params.has(key)) return def
    return params.get(key) !== '0'
  }

  function intParam(params, key, def, min, max) {
    if (!params.has(key)) return def
    const raw = params.get(key)
    if (raw.trim() === '') return def
    const v = Number(raw)
    if (!Number.isInteger(v) || v < 0) return def
    return Math.min(max, Math.max(min, v))
  }

  function enumParam(params, key, def, allowed) {
    const v = params.get(key)
    return allowed.includes(v) ? v : def
  }

  function unitParam(params, key, def) {
    const raw = params.get(key)
    if (raw === null || raw.trim() === '') return def
    const v = Number(raw)
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : def
  }

  function zoomParam(params, def) {
    const raw = params.get('zoom')
    if (raw === null) return def
    if (def === 'fit' && raw === 'fit') return 'fit'
    const v = Number(raw)
    return raw.trim() !== '' && Number.isFinite(v) && v > 0 ? v : def
  }

  /**
   * Liest den Ansichtszustand aus einem Query-String. MODE=2 liefert die Tabelle, MODE=3 die Graphen zu ℤ/p, alles andere die Einzelansicht.
   * Ungültige Werte fallen auf den Standard zurück, Zahlen außerhalb des Bereichs werden begrenzt.
   * @param {string} search Query-String, mit oder ohne führendes '?'
   * @returns {SingleState | TableState | ModulusState} der gelesene Zustand
   */
  function parseViewState(search) {
    const params = new URLSearchParams(search)
    if (params.get('MODE') === '3') {
      const d = defaultModulus()
      return {
        view: 'modulus',
        p: intParam(params, 'p', d.p, 2, P_MAX),
        coprime: enumParam(params, 'coprime', d.coprime, COPRIME),
        coprimeShifted: enumParam(params, 'coprime2', d.coprimeShifted, COPRIME),
        display: enumParam(params, 'display', d.display, DISPLAYS),
        highlight: enumParam(params, 'highlight', d.highlight, HIGHLIGHTS),
        cycles: boolParam(params, 'cycles', d.cycles),
        zoom: zoomParam(params, d.zoom)
      }
    }
    if (params.get('MODE') === '2') {
      const d = defaultTable()
      return {
        view: 'table',
        cols: intParam(params, 'cols', d.cols, 1, 60),
        showNGreaterM: boolParam(params, 'ngtm', d.showNGreaterM),
        coprime: enumParam(params, 'coprime', d.coprime, COPRIME),
        coprimeShifted: enumParam(params, 'coprime2', d.coprimeShifted, COPRIME),
        display: enumParam(params, 'display', d.display, DISPLAYS),
        highlight: enumParam(params, 'highlight', d.highlight, HIGHLIGHTS),
        cycles: boolParam(params, 'cycles', d.cycles),
        sound: boolParam(params, 'sound', d.sound),
        zoom: zoomParam(params, d.zoom)
      }
    }
    const d = defaultSingle()
    const speed = Number(params.get('speed'))
    return {
      view: 'single',
      n: intParam(params, 'N', d.n, 1, 2000),
      m: intParam(params, 'M', d.m, 2, 2000),
      a: intParam(params, 'a', d.a, 1, 100),
      dynamic: boolParam(params, 'dynamic', d.dynamic),
      speed: params.has('speed') && SPEEDS.includes(speed) ? speed : d.speed,
      neighbours: boolParam(params, 'neighbours', d.neighbours),
      cycles: boolParam(params, 'cycles', d.cycles),
      fixedPoints: boolParam(params, 'fixed', d.fixedPoints),
      units: boolParam(params, 'units', d.units),
      lengthFilter: { min: unitParam(params, 'min', d.lengthFilter.min), max: unitParam(params, 'max', d.lengthFilter.max) },
      op: enumParam(params, 'op', d.op, OPS),
      dropZero: boolParam(params, 'dropzero', d.dropZero),
      sound: boolParam(params, 'sound', d.sound),
      hideLegend: boolParam(params, 'hidelegend', d.hideLegend),
      zoom: zoomParam(params, d.zoom)
    }
  }

  /**
   * Schreibt den Ansichtszustand als Query-String. Geschrieben werden immer MODE (bei der Einzelansicht
   * zusätzlich N und M, bei ℤ/p zusätzlich p) und sonst nur Werte, die vom Standard abweichen. Boolesche Werte stehen als 1 oder 0.
   * @param {SingleState | TableState | ModulusState} state Ansichtszustand
   * @returns {string} Query-String mit führendem '?'
   */
  function serializeViewState(state) {
    const parts = []
    const put = (key, value) => parts.push(`${key}=${encodeURIComponent(String(value))}`)
    const bool = v => (v ? 1 : 0)
    // schreibt key, falls der Wert vom Standard abweicht
    const diff = (key, value, def, conv = v => v) => { if (value !== def) put(key, conv(value)) }

    if (state.view === 'modulus') {
      const d = defaultModulus()
      put('MODE', 3)
      put('p', state.p)
      diff('coprime', state.coprime, d.coprime)
      diff('coprime2', state.coprimeShifted, d.coprimeShifted)
      diff('display', state.display, d.display)
      diff('highlight', state.highlight, d.highlight)
      diff('cycles', state.cycles, d.cycles, bool)
      diff('zoom', state.zoom, d.zoom)
    } else if (state.view === 'table') {
      const d = defaultTable()
      put('MODE', 2)
      diff('cols', state.cols, d.cols)
      diff('ngtm', state.showNGreaterM, d.showNGreaterM, bool)
      diff('coprime', state.coprime, d.coprime)
      diff('coprime2', state.coprimeShifted, d.coprimeShifted)
      diff('display', state.display, d.display)
      diff('highlight', state.highlight, d.highlight)
      diff('cycles', state.cycles, d.cycles, bool)
      diff('sound', state.sound, d.sound, bool)
      diff('zoom', state.zoom, d.zoom)
    } else {
      const d = defaultSingle()
      put('MODE', 1)
      put('N', state.n)
      put('M', state.m)
      diff('a', state.a, d.a)
      diff('dynamic', state.dynamic, d.dynamic, bool)
      diff('speed', state.speed, d.speed)
      diff('neighbours', state.neighbours, d.neighbours, bool)
      diff('cycles', state.cycles, d.cycles, bool)
      diff('fixed', state.fixedPoints, d.fixedPoints, bool)
      diff('units', state.units, d.units, bool)
      diff('min', state.lengthFilter.min, d.lengthFilter.min)
      diff('max', state.lengthFilter.max, d.lengthFilter.max)
      diff('op', state.op, d.op)
      diff('dropzero', state.dropZero, d.dropZero, bool)
      diff('sound', state.sound, d.sound, bool)
      diff('hidelegend', state.hideLegend, d.hideLegend, bool)
      diff('zoom', state.zoom, d.zoom)
    }
    return '?' + parts.join('&')
  }

  Object.assign(core, { P_MAX, defaultSingle, defaultTable, defaultModulus, parseViewState, serializeViewState })
})()
