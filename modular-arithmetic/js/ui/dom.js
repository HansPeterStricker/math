// Hilfsfunktionen zum Erzeugen von HTML- und SVG-Elementen. Greift erst beim Aufruf auf document zu.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const ui = (R.ui ??= {})

  const SVG_NS = 'http://www.w3.org/2000/svg'

  function applyAttrs(node, attrs) {
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === undefined || value === null || value === false) continue
      if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value)
      } else if (key === 'text') {
        node.textContent = String(value)
      } else if (value === true) {
        node.setAttribute(key, '')
      } else {
        node.setAttribute(key, String(value))
      }
    }
  }

  function appendChildren(node, children) {
    for (const child of [children].flat(Infinity)) {
      if (child === undefined || child === null || child === false) continue
      node.append(typeof child === 'object' ? child : document.createTextNode(String(child)))
    }
  }

  /**
   * Erzeugt ein HTML-Element. Attribute mit Namen "onxyz" und einer Funktion werden als Event-Listener
   * registriert, "text" setzt den Textinhalt, false/null/undefined lassen das Attribut weg.
   * @param {string} tag Elementname, z. B. 'div'
   * @param {Object<string, *>} [attrs] Attribute und Event-Listener
   * @param {Array<Node|string|number>|Node|string|number} [children] Kindknoten oder Text
   * @returns {HTMLElement} das neue Element
   */
  function el(tag, attrs, children) {
    const node = document.createElement(tag)
    applyAttrs(node, attrs)
    appendChildren(node, children)
    return node
  }

  /**
   * Erzeugt ein SVG-Element im SVG-Namensraum. Attribute wie bei el.
   * @param {string} tag Elementname, z. B. 'circle'
   * @param {Object<string, *>} [attrs] Attribute und Event-Listener
   * @param {Array<Node|string|number>|Node|string|number} [children] Kindknoten oder Text
   * @returns {SVGElement} das neue Element
   */
  function svgEl(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag)
    applyAttrs(node, attrs)
    appendChildren(node, children)
    return node
  }

  const VIEWS = [['single', 'Graph N:M'], ['table', 'Table n:m'], ['modulus', 'Graphs of ℤ/p']]

  /**
   * Kopfzeile mit Titel und je einem Reiter pro Ansicht. Ein Reiter öffnet den zuletzt gezeigten Zustand
   * seiner Ansicht (ui.rememberedState aus main.js).
   * @param {'single'|'table'|'modulus'} active aktive Ansicht
   * @param {function(Object, {replace: boolean}): void} navigate Navigation
   * @returns {HTMLElement} das header-Element
   */
  function appHeader(active, navigate) {
    return el('header', { class: 'appHeader' }, [
      el('h1', {}, 'Rational Explorer'),
      el('nav', { class: 'tabs', 'aria-label': 'view' }, VIEWS.map(([view, label]) => view === active
        ? el('button', { 'data-key': `tab-${view}`, type: 'button', class: 'active', 'aria-current': 'page' }, label)
        : el('button', {
          'data-key': `tab-${view}`, type: 'button',
          onclick: () => navigate(ui.rememberedState(view), { replace: false })
        }, label))),
      el('button', {
        'data-key': 'reset', type: 'button', class: 'btn resetBtn', title: 'Reset this view to the default settings',
        onclick: () => navigate(ui.defaultState(active), { replace: false })
      }, 'reset')
    ])
  }

  Object.assign(ui, { el, svgEl, appHeader })
})()
