// Tonausgabe für ein Verhältnis n:m. Der AudioContext entsteht erst beim ersten Aufruf von playRatio.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const ui = (R.ui ??= {})

  let audioContext = null

  /**
   * Spielt zwei Sinustöne mit 250 Hz und 250·m/n Hz.
   * @param {number} n Zähler, größer als 0
   * @param {number} m Nenner
   * @param {{duration?: number, volume?: number}} [opts] duration: Faktor, Dauer = 2000·duration ms (Standard 0,5);
   *   volume: Faktor, Lautstärken 0,6·volume und 0,2·volume (Standard 0,5)
   * @returns {void}
   */
  function playRatio(n, m, { duration = 0.5, volume = 0.5 } = {}) {
    const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext
    if (!Ctor) return
    try {
      audioContext ??= new Ctor()
      if (audioContext.state === 'suspended') Promise.resolve(audioContext.resume()).catch(() => {})
      const seconds = (2000 * duration) / 1000
      const start = audioContext.currentTime
      const tone = (freq, level) => {
        const osc = audioContext.createOscillator()
        const gain = audioContext.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(level, start)
        gain.gain.linearRampToValueAtTime(0, start + seconds)
        osc.connect(gain)
        gain.connect(audioContext.destination)
        osc.start(start)
        osc.stop(start + seconds)
      }
      tone(250, 0.6 * volume)
      tone((250 * m) / n, 0.2 * volume)
    } catch (e) {
      // Ton ist optional; Fehler der Audio-API werden ignoriert.
    }
  }

  Object.assign(ui, { playRatio })
})()
