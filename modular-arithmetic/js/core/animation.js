// Zeitsteuerung des Linienaufbaus. Zeitgeber und Frame-Funktionen werden übergeben, damit kein Browser nötig ist.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})

  /**
   * Verzögerung in Millisekunden, nach der die Linie mit dem Index index sichtbar wird.
   * @param {number} index Index der Linie (0-basiert)
   * @param {number} m Modul
   * @param {number} speed Geschwindigkeitsfaktor (0.1, 0.5, 1, 2 oder 10)
   * @returns {number} Verzögerung in Millisekunden: 5000·index / max(50, m) · speed
   */
  function lineDelayMs(index, m, speed) {
    return ((5000 * index) / Math.max(50, m)) * speed
  }

  /**
   * Anzahl der Linien, deren Verzögerung höchstens der verstrichenen Zeit entspricht.
   * @param {number} elapsedMs verstrichene Zeit seit dem Start in Millisekunden
   * @param {number} lineCount Gesamtzahl der Linien
   * @param {number} m Modul
   * @param {number} speed Geschwindigkeitsfaktor
   * @returns {number} sichtbare Linien, 0..lineCount
   */
  function visibleLineCount(elapsedMs, lineCount, m, speed) {
    let count = 0
    for (let i = 0; i < lineCount; i++) {
      if (lineDelayMs(i, m, speed) <= elapsedMs) count++
      else break
    }
    return count
  }

  /**
   * Startet eine Animation, die je Frame die Zahl der sichtbaren Linien meldet, bis alle sichtbar sind.
   * @param {{lineCount: number, m: number, speed: number, onFrame: (visibleCount: number) => void,
   *   now: () => number, requestFrame: (cb: () => void) => any, cancelFrame: (id: any) => void}} options
   *   Linienzahl, Modul, Geschwindigkeit, Rückruf je Frame sowie Zeitgeber und Frame-Funktionen
   * @returns {{cancel: () => void}} Objekt zum Abbrechen; danach erfolgt kein onFrame-Aufruf mehr
   */
  function createAnimation({ lineCount, m, speed, onFrame, now, requestFrame, cancelFrame }) {
    const start = now()
    let cancelled = false
    let pending = null

    function tick() {
      pending = null
      if (cancelled) return
      const visible = visibleLineCount(now() - start, lineCount, m, speed)
      onFrame(visible)
      if (cancelled) return
      if (visible < lineCount) pending = requestFrame(tick)
    }

    pending = requestFrame(tick)

    return {
      cancel() {
        cancelled = true
        if (pending !== null) cancelFrame(pending)
        pending = null
      }
    }
  }

  Object.assign(core, { lineDelayMs, visibleLineCount, createAnimation })
})()
