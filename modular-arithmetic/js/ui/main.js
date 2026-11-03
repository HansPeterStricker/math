// Einstiegspunkt: zeichnet die passende Ansicht und reagiert auf Navigation.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const ui = (R.ui ??= {})
  const core = R.core

  /**
   * Erzeugt die Navigation. Der Zustand steht nicht in der URL, sondern im Eintrag der Browser-History
   * (history.state). Zurück und Vorwärts funktionieren dadurch weiter, und die Adresse bleibt ohne Parameter.
   * Schlägt die History-API fehl (z. B. bei file:// mit undurchsichtigem Ursprung), bleibt der Zustand im Speicher.
   * @param {{history: {pushState: function, replaceState: function}, render: function(Object): void}} deps
   *   history: History-API, render: zeichnet einen Zustand
   * @returns {{navigate: function(Object, {replace: boolean}=): void, onPopState: function({state: ?Object}): void, current: function(): ?Object}}
   *   navigate setzt einen Zustand (replace true ersetzt den History-Eintrag), onPopState reagiert auf Zurück/Vorwärts,
   *   current liefert den zuletzt gezeichneten Zustand
   */
  function createNavigator({ history, render }) {
    let current = null

    function navigate(state, { replace = false } = {}) {
      current = state
      try {
        if (replace) history.replaceState({ ratios: state }, '')
        else history.pushState({ ratios: state }, '')
      } catch (e) {
        // Die History kann nicht geschrieben werden; der Zustand bleibt im Speicher.
      }
      render(state)
    }

    function onPopState(ev) {
      const state = (ev && ev.state && ev.state.ratios) || current
      if (state) {
        current = state
        render(state)
      }
    }

    return { navigate, onPopState, current: () => current }
  }

  let root = null
  let currentView = null
  let navigator = null

  function navigate(state, opts) { navigator.navigate(state, opts) }

  // Zuletzt gezeichneter Zustand je Ansicht, damit der Wechsel zwischen N:M und n:m die Einstellungen behält.
  const lastState = { single: null, table: null, modulus: null }

  /**
   * Liefert den zuletzt gezeichneten Zustand einer Ansicht, sonst deren Standardzustand.
   * @param {'single'|'table'|'modulus'} view Name der Ansicht
   * @returns {Object} der Zustand
   */
  function rememberedState(view) {
    return lastState[view] ?? defaultState(view)
  }

  /**
   * Liefert die Werkseinstellungen einer Ansicht.
   * @param {'single'|'table'|'modulus'} view Name der Ansicht
   * @returns {Object} der Standardzustand
   */
  function defaultState(view) {
    const defaults = { single: core.defaultSingle, table: core.defaultTable, modulus: core.defaultModulus }
    return defaults[view]()
  }

  function render(state) {
    // Der Fokus geht beim Neuaufbau verloren; das Bedienelement wird über data-key wiedergefunden.
    const active = typeof document !== 'undefined' ? document.activeElement : null
    const focusKey = active && root && root.contains(active) ? active.dataset?.key : null
    if (currentView) currentView.destroy()
    currentView = null
    lastState[state.view] = state
    const draw = state.view === 'single' ? ui.renderSingle : ui.renderTable
    currentView = draw(root, state, navigate)
    if (focusKey) {
      const target = Array.from(root.querySelectorAll('[data-key]')).find(e => e.dataset.key === focusKey)
      if (target) target.focus({ preventScroll: true })
    }
  }

  function start() {
    root = document.getElementById('app')
    navigator = createNavigator({ history: window.history, render })
    // Nach einem Neuladen steht der letzte Zustand noch in history.state. Parameter in der Adresse werden ignoriert und entfernt.
    let initial = null
    try { initial = window.history.state && window.history.state.ratios } catch (e) { initial = null }
    if (!initial) initial = core.defaultSingle()
    try { window.history.replaceState({ ratios: initial }, '', window.location.pathname) } catch (e) { /* file:// ohne History */ }
    navigator.navigate(initial, { replace: true })
    window.addEventListener('popstate', navigator.onPopState)
  }

  Object.assign(ui, { createNavigator, navigate, rememberedState, defaultState })

  // In Node (Tests) gibt es kein document; dort wird nur createNavigator bereitgestellt.
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
    else start()
  }
})()
