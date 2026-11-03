// Rasteransichten: Tabelle n:m (Zeile = n, Spalte = m) und alle Graphen n:p zu einem Modul p.
// Beide bestehen aus Kopfzeile, Bedienspalte und einem Canvas mit einer Zelle je Verhältnis.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const ui = (R.ui ??= {})
  const core = R.core
  const { el, drawCell, createCellCache } = ui
  const { COLORS, INTERVALS, CELL_SIZE, P_MAX, tableGeometry, modulusGeometry, hitTest, cellOpacity, matchesHighlight, isPrime } = core

  const MAX_ZOOM_FIT = 1.5
  const MAX_BACKING_PX = 16000 // Grenze für die Pixelzahl einer Canvas-Seite
  const MAX_BACKING_AREA = 64e6 // Grenze für die Gesamtzahl der Pixel des Zeichenpuffers
  const LONG_PRESS_MS = 500
  const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
  const COLS_MAX = 60

  // Ein Zwischenspeicher je Seite, damit Ansichtswechsel die berechneten Zellen weiterverwenden.
  const cache = createCellCache()
  // Zuletzt fokussierte Zelle je Ansicht; bleibt beim Neuzeichnen erhalten.
  const lastFocus = { table: null, modulus: null }
  // Die Zeitmessung wird nur beim ersten Zeichnen nach dem Laden der Seite ausgegeben.
  let timingLogged = false

  const HIGHLIGHT_CHOICES = [
    ['none', 'none'], ['gcd', 'gcd(n, m)'], ['gcdShifted', 'gcd(n − 1, m), symmetry'],
    ['primitiveRoot', 'n is a primitive root mod m'], ['interval', 'musical intervals'],
    ['constructible', 'regular m-gon constructible'],
    ['cycle2', 'has cycles of length 2'], ['cycle3', 'has cycles of length 3'], ['cycle4', 'has cycles of length 4'],
    ['cycle5', 'has cycles of length 5'], ['cycle6', 'has cycles of length 6'], ['cycle7', 'has cycles of length 7']
  ]
  const DIM_CHOICES = [['show', 'off'], ['hide', 'these'], ['only', 'the others']]
  const DISPLAY_CHOICES = [['graph', 'graph'], ['numbers', 'numbers'], ['pie', 'pie']]

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
  const color = i => COLORS[i % COLORS.length]

  /**
   * Wert einer Zelle für die Zeichenerklärung der Hervorhebung.
   * @param {Object} cls Klassifikation aus classifyCell
   * @param {string} highlight gewählte Hervorhebung
   * @returns {number|string|null} gcd, gcd(n − 1, m) bzw. Index des Intervalls; 'yes' bei den übrigen Hervorhebungen; null, wenn die Zelle nicht hervorgehoben ist
   */
  function keyValue(cls, highlight) {
    switch (highlight) {
      case 'none': return null
      case 'gcd': return cls.gcd > 1 ? cls.gcd : null
      case 'gcdShifted': return cls.gcdShifted > 1 ? cls.gcdShifted : null
      case 'interval': return cls.intervalIndex
      default: return matchesHighlight(cls, highlight) ? 'yes' : null
    }
  }

  function keyEntry(value, count, highlight) {
    if (highlight === 'gcd') return { value, count, label: `gcd = ${value}`, swatch: color(value - 1) }
    if (highlight === 'gcdShifted') return { value, count, label: `gcd(n − 1, m) = ${value}`, swatch: color(value - 1) }
    if (highlight === 'interval') return { value, count, label: INTERVALS[value].name, swatch: color(value) }
    return { value, count, label: HIGHLIGHT_CHOICES.find(h => h[0] === highlight)[1], swatch: null }
  }

  /**
   * Zeigt die Tabelle n:m (state.view 'table') oder die Graphen zu ℤ/p (state.view 'modulus') in root.
   * @param {HTMLElement} root Wurzelelement, sein Inhalt wird ersetzt
   * @param {Object} state Ansichtszustand (TableState oder ModulusState)
   * @param {function(Object, {replace: boolean}): void} navigate Funktion, die einen neuen Zustand setzt und neu zeichnet
   * @returns {{destroy: function(): void}} Objekt zum Aufräumen; destroy entfernt die Listener auf window und die Timer
   */
  function renderTable(root, state, navigate) {
    const isTable = state.view === 'table'
    const geometry = isTable ? tableGeometry(state.cols, state.showNGreaterM) : modulusGeometry(state.p)
    const pieColor = COLORS[Math.floor(Math.random() * COLORS.length)]
    const set = patch => navigate({ ...state, ...patch }, { replace: true })
    let destroyed = false
    let zoom = 1
    let pointerFocus = false
    let resizeFrame = null
    let pressTimer = null
    let tipTimer = null
    let suppressClick = false
    let keyFocus = null // Wert aus der Zeichenerklärung, auf den die Hervorhebung beschränkt ist

    // ---------- Bausteine der Bedienspalte ----------
    function seg(key, options, current, onPick, cls = '') {
      return el('div', { class: `seg ${cls}`, role: 'group' }, options.map(([value, text]) =>
        el('button', {
          'data-key': `${key}-${value}`, type: 'button', class: value === current ? 'on' : '',
          'aria-pressed': String(value === current), onclick: () => onPick(value)
        }, text)))
    }
    function check(key, label, checked, onChange, disabled) {
      return el('label', { class: 'opt' + (disabled ? ' disabled' : '') }, [
        el('input', { 'data-key': key, type: 'checkbox', checked, disabled, onchange: ev => onChange(ev.target.checked) }),
        el('span', {}, label)
      ])
    }
    function stepper(key, label, value, min, max, onValue, extra) {
      const input = el('input', {
        'data-key': key, type: 'number', min, max, step: 1, value, class: 'num', 'aria-label': label,
        onchange: ev => {
          const v = Number(ev.target.value)
          if (ev.target.value.trim() === '' || !Number.isFinite(v)) { set({}); return }
          onValue(clamp(Math.round(v), min, max))
        }
      })
      return el('div', { class: 'colsRow' }, [
        el('span', { class: 'inlineLabel' }, label),
        el('button', { 'data-key': `${key}-down`, type: 'button', class: 'step', title: `${label} − 1`, disabled: value <= min, onclick: () => onValue(value - 1) }, '‹'),
        input,
        el('button', { 'data-key': `${key}-up`, type: 'button', class: 'step', title: `${label} + 1`, disabled: value >= max, onclick: () => onValue(value + 1) }, '›'),
        extra
      ])
    }

    function nextPrime(p, dir) {
      for (let q = p + dir; q >= 2 && q <= P_MAX; q += dir) if (isPrime(q)) return q
      return null
    }

    // ---------- Bedienspalte ----------
    const cells = geometry.cells
    const counts = new Map()
    for (const c of cells) {
      const v = keyValue(cache.get(c.n, c.m, state.cycles).cls, state.highlight)
      if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1)
    }
    const entries = [...counts].map(([v, count]) => keyEntry(v, count, state.highlight))
      .sort((a, b) => (typeof a.value === 'number' ? a.value - b.value : 0))
    const matching = entries.reduce((s, e) => s + e.count, 0)

    let sizeSection
    if (isTable) {
      sizeSection = [
        el('h3', {}, 'Size'),
        stepper('cols', 'n, m up to', state.cols, 2, COLS_MAX, v => set({ cols: v }))
        // Vorerst ausgeblendet, für später aufgehoben:
        // check('nGreaterM', 'also n > m (below the diagonal)', state.showNGreaterM, v => set({ showNGreaterM: v }))
      ]
    } else {
      const p = state.p
      const down = nextPrime(p, -1), up = nextPrime(p, 1)
      sizeSection = [
        el('h3', {}, 'Modulus'),
        stepper('p', 'p', p, 2, P_MAX, v => set({ p: v })),
        el('div', { class: 'row' }, [
          el('button', { 'data-key': 'prime-down', type: 'button', class: 'btn', disabled: down === null, onclick: () => set({ p: down }) }, '‹ prime'),
          el('button', { 'data-key': 'prime-up', type: 'button', class: 'btn', disabled: up === null, onclick: () => set({ p: up }) }, 'prime ›')
        ])
        /* Vorerst ausgeblendet, für später aufgehoben.
        el('p', { class: 'hint' }, isPrime(p)
          ? `${p} is prime. The ${p - 1} graphs n:${p} with n = 1 … ${p - 1} are the multiplications of the field ℤ/${p}.`
          : `${p} is not prime. The ${p - 1} graphs n:${p} with n = 1 … ${p - 1}.`)
        */
      ]
    }

    const zoomRow = el('div', { class: 'opt' }, [
      el('span', { class: 'inlineLabel' }, 'zoom'),
      el('div', { class: 'seg small' }, [
        el('button', { 'data-key': 'fit', type: 'button', class: state.zoom === 'fit' ? 'on' : '', title: isTable ? 'Fit to the width of the window' : 'Fit into the window', onclick: () => set({ zoom: 'fit' }) }, 'fit'),
        el('button', { 'data-key': 'fitHeight', type: 'button', title: 'Fit to the height of the window', onclick: () => fitHeight() }, 'fit height'),
        el('button', { 'data-key': 'zoom100', type: 'button', class: state.zoom === 1 ? 'on' : '', onclick: () => set({ zoom: 1 }) }, '100 %')
      ])
    ])

    const keyList = entries.length > 1 || (entries.length === 1 && entries[0].swatch)
      ? el('div', { class: 'hlKey' }, entries.map(e => el('span', {
        class: 'keyItem',
        onmouseenter: () => { keyFocus = e.value; drawAll() },
        onmouseleave: () => { keyFocus = null; drawAll() }
      }, [e.swatch ? el('span', { class: 'swatch', style: `background:${e.swatch}` }) : null, e.label, el('span', { class: 'cnt' }, String(e.count))])))
      : null

    const controls = el('aside', { class: 'panel controls tableControls' }, [
      // Zoom-Auswahl, Darstellung (graph/numbers/pie), Highlight und Dim cells sind vorerst ausgeblendet und für später aufgehoben.
      el('section', {}, [...sizeSection /* , zoomRow */]),
      el('section', {}, [
        el('h3', {}, 'Show'),
        // seg('display', DISPLAY_CHOICES, state.display, v => set({ display: v })),
        check('cycles', 'cycles in colour', state.cycles, v => set({ cycles: v }), state.display !== 'graph')
      ]),
      /*
      el('section', {}, [
        el('h3', {}, 'Highlight'),
        el('select', { 'data-key': 'highlight', 'aria-label': 'highlight', onchange: ev => set({ highlight: ev.target.value }) },
          HIGHLIGHT_CHOICES.map(([value, text]) => el('option', { value, selected: value === state.highlight }, text))),
        state.highlight === 'none' ? null : el('div', { class: 'hlCount' }, `${matching} of ${cells.length} cells`),
        keyList
      ]),
      el('section', {}, [
        el('h3', {}, 'Dim cells'),
        el('div', { class: 'dimRow' }, [el('span', {}, 'gcd(n, m) = 1'),
          seg('coprime', DIM_CHOICES, state.coprime, v => set({ coprime: v }), 'small')]),
        el('div', { class: 'dimRow' }, [el('span', {}, 'gcd(n − 1, m) = 1'),
          seg('coprimeShifted', DIM_CHOICES, state.coprimeShifted, v => set({ coprimeShifted: v }), 'small')])
      ]),
      */
      el('p', { class: 'hint' }, 'Hover a cell for details. Click a cell to open it as graph N:M.')
    ])

    // ---------- Canvas, Markierungen, Tooltip ----------
    const canvas = el('canvas', {
      class: 'tableCanvas', 'data-key': 'table-canvas', tabindex: 0, role: 'application',
      'aria-label': isTable
        ? 'Table of the multiplication graphs n:m. Use the arrow keys to move between cells and Enter to open a cell.'
        : `The multiplication graphs n:${state.p}. Use the arrow keys to move between cells and Enter to open a cell.`
    })
    const focusBox = el('div', { class: 'tableFocus' })
    const cellBox = el('div', { class: 'cellBox' })
    const colBand = el('div', { class: 'band' })
    const rowBand = el('div', { class: 'band' })
    const stage = el('div', { class: 'tableStage' }, [canvas, colBand, rowBand, cellBox, focusBox])
    const wrap = el('div', { class: 'tableWrap' }, [stage])
    const tip = el('div', { class: 'richTip', role: 'tooltip' })
    const status = el('div', { class: 'srOnly', 'aria-live': 'polite' })
    const box = el('section', { class: 'panel tableBox' }, [wrap, status])
    const page = el('div', { class: 'page tablePage' }, [controls, box])
    root.replaceChildren(ui.appHeader(state.view, navigate), page, tip)

    function describe(n, m) {
      const { graph, cls } = cache.get(n, m, state.cycles)
      const cyc = graph.cycles.length
      const parts = [`${n}:${m}`,
        cls.coprime ? `permutation, ${cyc} ${cyc === 1 ? 'cycle' : 'cycles'}` : 'not a permutation',
        `gcd(n, m) = ${cls.gcd}`, `gcd(n − 1, m) = ${cls.gcdShifted}`]
      if (cls.primitiveRoot) parts.push(`${n % m} is a primitive root mod ${m}`)
      if (cls.interval) parts.push(cls.interval)
      return parts.join(' · ')
    }

    function tipHtml(n, m) {
      const { graph, cls } = cache.get(n, m, state.cycles)
      const cyc = graph.cycles.length
      const rows = [
        `<b>${n} : ${m}</b> <span class="muted">a ↦ ${n % m}·a mod ${m}</span>`,
        cls.coprime
          ? `permutation · ${cyc} ${cyc === 1 ? 'cycle' : 'cycles'}`
          : `not a permutation · ${graph.imagePoints.length} of ${m} residues hit`,
        `gcd(n, m) = ${cls.gcd} · gcd(n − 1, m) = ${cls.gcdShifted}`
      ]
      if (cls.primitiveRoot) rows.push(`${n % m} is a primitive root mod ${m}`)
      if (cls.interval) rows.push(`interval: ${cls.interval}`)
      rows.push('<span class="muted">click to open</span>')
      return rows.join('<br>')
    }

    function place(node, x, y, w, h) {
      Object.assign(node.style, { display: 'block', left: `${x * zoom}px`, top: `${y * zoom}px`, width: `${w * zoom}px`, height: `${h * zoom}px` })
    }

    function showHover(cell, clientX, clientY) {
      place(cellBox, cell.x, cell.y, CELL_SIZE, CELL_SIZE)
      if (isTable) {
        place(colBand, cell.x, 0, CELL_SIZE, geometry.originY)
        place(rowBand, 0, cell.y, geometry.originX, CELL_SIZE)
      }
      tip.innerHTML = tipHtml(cell.n, cell.m)
      tip.style.display = 'block'
      const left = Math.max(4, Math.min(clientX + 16, window.innerWidth - tip.offsetWidth - 8))
      const below = clientY + 18 + tip.offsetHeight <= window.innerHeight
      tip.style.left = `${left}px`
      tip.style.top = `${below ? clientY + 18 : Math.max(4, clientY - tip.offsetHeight - 12)}px`
    }
    function hideHover() {
      for (const node of [tip, cellBox, colBand, rowBand]) node.style.display = 'none'
      clearTimeout(tipTimer)
    }

    // ---------- Zeichnen ----------
    // Höhe des Fensters unterhalb des oberen Rands der Tabelle, gemessen bei nicht gescrollter Seite
    function availableHeight() {
      const top = wrap.getBoundingClientRect().top + window.scrollY
      return Math.max(100, window.innerHeight - top - 24)
    }
    function fitZoom() {
      const byWidth = (wrap.clientWidth - 1) / geometry.width
      const z = isTable ? byWidth : Math.min(byWidth, availableHeight() / geometry.height)
      return clamp(z, 0.05, MAX_ZOOM_FIT)
    }

    // Setzt Zoom und Größe des Canvas und liefert den Maßstab zwischen logischen Koordinaten und Pixeln des Zeichenpuffers.
    function sizeCanvas() {
      zoom = state.zoom === 'fit' ? fitZoom() : state.zoom
      const apply = () => {
        const dpr = window.devicePixelRatio || 1
        const scale = Math.min(
          zoom * dpr,
          MAX_BACKING_PX / Math.max(geometry.width, geometry.height, 1),
          Math.sqrt(MAX_BACKING_AREA / Math.max(1, geometry.width * geometry.height))
        )
        canvas.style.width = `${geometry.width * zoom}px`
        canvas.style.height = `${geometry.height * zoom}px`
        canvas.width = Math.max(1, Math.ceil(geometry.width * scale))
        canvas.height = Math.max(1, Math.ceil(geometry.height * scale))
        return scale
      }
      let scale = apply()
      // Erscheint durch die Höhe eine Bildlaufleiste, ist die verfügbare Breite kleiner als angenommen.
      if (state.zoom === 'fit' && wrap.scrollWidth > wrap.clientWidth + 1) {
        zoom = fitZoom()
        scale = apply()
      }
      return scale
    }

    function drawAll() {
      const t0 = window.performance.now()
      const scale = sizeCanvas()
      const ctx = canvas.getContext('2d')
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.clearRect(0, 0, geometry.width, geometry.height)

      // Beschriftung der Zeilen (n) und Spalten (m)
      ctx.fillStyle = '#6b6b6b'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `600 20px ${FONT}`
      for (const l of geometry.colLabels) ctx.fillText(l.text, geometry.originX + (l.col + 0.5) * CELL_SIZE, geometry.originY / 2)
      for (const l of geometry.rowLabels) ctx.fillText(l.text, geometry.originX / 2, geometry.originY + (l.row + 0.5) * CELL_SIZE)
      if (isTable) {
        ctx.font = `italic 15px ${FONT}`
        ctx.fillText('n\\m', geometry.originX / 2, geometry.originY / 2)
      }

      for (const pos of geometry.cells) {
        const entry = cache.get(pos.n, pos.m, state.cycles)
        let opacity = cellOpacity(entry.cls, state)
        if (keyFocus !== null && keyValue(entry.cls, state.highlight) !== keyFocus) opacity = Math.min(opacity, 0.12)
        drawCell(ctx, { ...pos, ...entry }, { display: state.display, highlight: state.highlight, opacity, size: CELL_SIZE, pieColor })
        if (geometry.cellLabels && state.display !== 'numbers') {
          ctx.save()
          ctx.globalAlpha = Math.max(opacity, 0.4)
          ctx.fillStyle = '#6b6b6b'
          ctx.font = `600 15px ${FONT}`
          ctx.textAlign = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(String(pos.n), pos.x + 3, pos.y + 2)
          ctx.restore()
        }
      }
      updateFocusBox()
      if (!timingLogged) {
        timingLogged = true
        console.info('[ratios] table draw', (window.performance.now() - t0).toFixed(0), 'ms')
      }
    }

    // ---------- Fokus und Tastatur ----------
    const findCell = (n, m) => geometry.cells.find(c => c.n === n && c.m === m) ?? null
    const remembered = lastFocus[state.view]
    let focus = remembered ? findCell(remembered.n, remembered.m) : null

    function setFocus(cell) {
      focus = cell
      lastFocus[state.view] = { n: cell.n, m: cell.m }
      updateFocusBox()
    }

    function updateFocusBox() {
      if (!focus || document.activeElement !== canvas) { focusBox.style.display = 'none'; return }
      place(focusBox, focus.x, focus.y, CELL_SIZE, CELL_SIZE)
    }

    function moveFocus(dr, dc) {
      let next = focus
      if (!focus) {
        next = geometry.cells[0] ?? null
      } else {
        // Diagonale und ausgeblendete Zellen überspringen
        let row = focus.row + dr, col = focus.col + dc
        next = null
        while (row >= 0 && col >= 0 && row < geometry.rows && col < geometry.cols) {
          next = geometry.index.get(`${row},${col}`) ?? null
          if (next) break
          row += dr; col += dc
        }
      }
      if (!next) return
      setFocus(next)
      status.textContent = describe(next.n, next.m)
      if (focusBox.scrollIntoView) focusBox.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }

    // Ein Klick öffnet die Zelle in der Einzelansicht; deren übrige Einstellungen bleiben erhalten.
    // Der Ton beim Klick ist abgeschaltet:
    // if (state.sound && (state.display === 'pie' || state.highlight !== 'none')) playRatio(n, m, { duration: 0.5, volume: 0.5 })
    function activate(cell) {
      navigate({ ...ui.rememberedState('single'), n: cell.n, m: cell.m }, { replace: false })
    }

    const ARROWS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    canvas.addEventListener('keydown', ev => {
      if (ARROWS[ev.key]) {
        ev.preventDefault()
        moveFocus(...ARROWS[ev.key])
      } else if ((ev.key === 'Enter' || ev.key === ' ') && focus) {
        ev.preventDefault()
        activate(focus)
      }
    })
    canvas.addEventListener('focus', () => {
      // Kommt der Fokus von einer Zeigeraktion, bleibt die Ansicht unverändert (kein Bildlauf vor dem Klick).
      if (pointerFocus) pointerFocus = false
      else if (!focus) moveFocus(0, 0)
      updateFocusBox()
    })
    canvas.addEventListener('blur', () => { pointerFocus = false; updateFocusBox() })

    // ---------- Zeiger ----------
    function cellAt(ev) {
      const rect = canvas.getBoundingClientRect()
      return hitTest(geometry, (ev.clientX - rect.left) / zoom, (ev.clientY - rect.top) / zoom)
    }

    canvas.addEventListener('click', ev => {
      if (suppressClick) { suppressClick = false; return }
      const hit = cellAt(ev)
      if (hit) { setFocus(hit); activate(hit) }
    })
    canvas.addEventListener('pointermove', ev => {
      if (ev.pointerType === 'touch') return
      const hit = cellAt(ev)
      canvas.style.cursor = hit ? 'pointer' : 'default'
      if (hit) showHover(hit, ev.clientX, ev.clientY)
      else hideHover()
    })
    canvas.addEventListener('pointerleave', ev => { if (ev.pointerType !== 'touch') hideHover() })
    canvas.addEventListener('pointerdown', ev => {
      clearTimeout(pressTimer)
      hideHover()
      suppressClick = false
      pointerFocus = true
      const pressed = cellAt(ev)
      if (pressed) setFocus(pressed)
      if (ev.pointerType !== 'touch') return
      const { clientX, clientY } = ev
      pressTimer = setTimeout(() => {
        const hit = cellAt({ clientX, clientY })
        if (!hit) return
        suppressClick = true
        showHover(hit, clientX, clientY)
        tipTimer = setTimeout(hideHover, 2500)
      }, LONG_PRESS_MS)
    })
    const cancelPress = () => clearTimeout(pressTimer)
    canvas.addEventListener('pointerup', cancelPress)
    canvas.addEventListener('pointercancel', cancelPress)

    // ---------- Zoom ----------
    function fitHeight() {
      set({ zoom: Math.max(0.05, Math.floor((availableHeight() / geometry.height) * 100) / 100) })
    }

    function onResize() {
      if (state.zoom !== 'fit' || resizeFrame !== null) return
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null
        if (destroyed) return
        if (Math.abs(fitZoom() - zoom) > 0.001) drawAll()
      })
    }

    drawAll()
    window.addEventListener('resize', onResize)

    return {
      destroy() {
        if (destroyed) return
        destroyed = true
        window.removeEventListener('resize', onResize)
        if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame)
        clearTimeout(pressTimer)
        clearTimeout(tipTimer)
      }
    }
  }

  Object.assign(ui, { renderTable })
})()
