// Einzelansicht n:m: Kopfzeile, Bedienspalte, SVG-Graph (oder 3x3-Raster der Nachbarn) mit Zeichenerklärung
// und Analysespalte.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const ui = (R.ui ??= {})
  const core = R.core
  const { el, svgEl, playRatio } = ui
  const {
    gcd, buildGraph, analyze, renderLegendHtml, LENGTH_PRESETS, graphPrimitives, createAnimation,
    parseViewState, serializeViewState, RING_UNIT, RING_SQRT_N
  } = core

  const N_MAX = 2000
  const M_MIN = 2
  const SIZE = 640 // Seitenlänge des Koordinatensystems im SVG; Linienbreiten und Radien beziehen sich darauf
  const PAD = 0.05 // Rand der SVG-Fläche als Anteil der Seitenlänge
  const ZOOM_STEP = 1.25

  // Einstellungen, die nicht in der URL stehen und das Neuzeichnen überdauern.
  const local = {
    duration: 0.5, volume: 0.5, playOnce: false, allCycles: false,
    panels: { highlight: true, lengths: true, animation: false, view: false },
    sections: {}
  }

  // Automatisches Zählen von N oder M (immer nur eines von beiden). Der Zeitgeber überdauert das Neuzeichnen;
  // jede Darstellung trägt sich als aktuelle Ansicht ein, damit ein Schritt den neuesten Zustand verwendet.
  // Ist keine Einzelansicht mehr aktiv, hält das Zählen an.
  const AUTO_SPEEDS = [['1 / s', 1], ['2 / s', 2], ['5 / s', 5], ['10 / s', 10]]
  const AUTO_BOUNDS = { n: [1, N_MAX], m: [M_MIN, N_MAX] }
  const auto = { key: 'm', dir: 0, perSecond: 2, timer: null, view: null }

  function stopAuto() {
    clearTimeout(auto.timer)
    auto.timer = null
    auto.dir = 0
  }

  function scheduleAuto() {
    clearTimeout(auto.timer)
    auto.timer = setTimeout(() => {
      auto.timer = null
      const v = auto.view
      if (!v || auto.dir === 0) { stopAuto(); return }
      const [lo, hi] = AUTO_BOUNDS[auto.key]
      const next = v.state[auto.key] + auto.dir
      if (next < lo || next > hi) { stopAuto(); v.refresh(); return }
      v.navigate({ ...v.state, [auto.key]: next }, { replace: true })
    }, 1000 / auto.perSecond)
  }

  // Beschriftung und zugehöriger speed-Wert der Tempoauswahl (speed ist ein Zeitfaktor, größer = langsamer).
  const SPEED_CHOICES = [['10×', 0.1], ['2×', 0.5], ['1×', 1], ['½×', 2], ['⅒×', 10]]
  const PRESET_LABELS = [
    ['all', 'all lengths'], ['shortest', 'shortest third'], ['medium', 'medium third'], ['longest', 'longest third'],
    ['notShortest', 'not shortest'], ['notMedium', 'not medium'], ['notLongest', 'not longest']
  ]

  // Kleine SVG-Symbole für Bedienspalte und Zeichenerklärung; sie entsprechen der Darstellung im Graphen.
  const GLYPHS = {
    fixed: () => [svgEl('circle', { cx: 9, cy: 9, r: 7, fill: '#1a1a1a' })],
    nonimage: () => [svgEl('circle', { cx: 9, cy: 9, r: 4, fill: 'silver' })],
    zero: () => [svgEl('line', { x1: 2, y1: 16, x2: 15, y2: 3, stroke: 'silver', 'stroke-width': 2 }), svgEl('circle', { cx: 15, cy: 3, r: 2.5, fill: '#c81e1e' })],
    unit: () => [svgEl('circle', { cx: 9, cy: 9, r: 3.5 }), svgEl('circle', { cx: 9, cy: 9, r: 7, fill: 'none', stroke: '#1a1a1a' })],
    sqrt1: () => [svgEl('circle', { cx: 9, cy: 9, r: 3.5 }), svgEl('rect', { x: 2, y: 2, width: 14, height: 14, fill: 'none', stroke: '#1a1a1a' })],
    sqrtN: () => [svgEl('circle', { cx: 9, cy: 9, r: 3.5 }), svgEl('circle', { cx: 9, cy: 9, r: 7.5, fill: 'none', stroke: '#1a1a1a', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' })]
  }
  const glyph = kind => svgEl('svg', { width: 18, height: 18, class: 'glyph', 'aria-hidden': 'true' }, GLYPHS[kind]())

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

  /**
   * Zeichnet einen Graphen als SVG. Linien, Punkte und Ringe tragen CSS-Klassen, über die die Zeichenerklärung
   * und die Analysespalte sie hervorheben: cycI (Zyklus I), tail (nicht auf einem Zyklus), distD (Länge D),
   * zero (Linie nach 0), fixed, nonimage, unit, sqrt1, sqrtN.
   * @param {Object} graph Graphmodell von buildGraph
   * @param {Object} prim Zeichenprimitive von graphPrimitives
   * @param {{dynamic: boolean, caption: ?string, onClick: ?function}} o
   *   dynamic: Linien zunächst verbergen, caption: Beschriftung unten rechts oder null
   * @returns {{svg: SVGElement, showUpTo: function(number): void}} das SVG und eine Funktion, die alle Linien mit order < count einblendet
   */
  function drawGraph(graph, prim, { dynamic, caption, onClick }) {
    const pad = PAD * SIZE // Rand, damit Beschriftungen bei Radius 1,15 nicht abgeschnitten werden
    const total = SIZE + 2 * pad
    const c = SIZE / 2
    const radius = 0.45 * SIZE
    const px = x => c + radius * x
    const py = y => c + radius * y
    const svg = svgEl('svg', {
      viewBox: `${-pad} ${-pad} ${total} ${total}`, class: 'graphSvg', role: 'img',
      'aria-label': `graph of a ↦ ${graph.n}·a mod ${graph.m}`,
      style: onClick ? 'cursor:pointer' : null, onclick: onClick
    })
    svg.append(svgEl('circle', { cx: c, cy: c, r: radius, fill: 'none', stroke: '#c9c7c0' }))

    const fixedSet = new Set(graph.fixedPoints)
    const lineGroup = svgEl('g', { 'stroke-linecap': 'round' })
    const lineEls = prim.lines.map(l => {
      const e = graph.edges[l.order]
      const cyc = e.cycleIndex !== null ? `cyc${e.cycleIndex} len${graph.cycles[e.cycleIndex].length}` : 'tail'
      const cls = `el ${cyc} dist${e.distance}${e.to === 0 && e.from !== 0 ? ' zero' : ''}`
      const hidden = dynamic ? { display: 'none' } : {}
      if (l.x1 === l.x2 && l.y1 === l.y2) {
        // Linie der Länge 0 (Fixpunkt): als Punkt mit Durchmesser = Linienbreite zeichnen
        return svgEl('circle', { cx: px(l.x1), cy: py(l.y1), r: l.width / 2, fill: l.color, class: cls, ...hidden })
      }
      return svgEl('line', {
        x1: px(l.x1), y1: py(l.y1), x2: px(l.x2), y2: py(l.y2), stroke: l.color,
        'stroke-width': l.width, class: cls, ...hidden
      })
    })
    lineGroup.append(...lineEls)
    svg.append(lineGroup)

    const cycleOf = new Map(graph.edges.map(e => [e.from, e.cycleIndex]))
    const dotGroup = svgEl('g')
    const dotByResidue = new Map()
    const radiusAt = new Map()
    for (const d of prim.dots) {
      const silverStart = dynamic && d.isImagePoint
      const ci = cycleOf.get(d.residue)
      let cls = 'el'
      if (fixedSet.has(d.residue)) cls += ' fixed dist0'
      if (d.fill === 'silver') cls += ' nonimage'
      if (ci !== null && ci !== undefined) cls += ` cyc${ci} len${graph.cycles[ci].length}`
      const dotEl = svgEl('circle', { cx: px(d.x), cy: py(d.y), r: d.r, fill: silverStart ? 'silver' : d.fill, class: cls })
      dotByResidue.set(d.residue, { el: dotEl, fill: d.fill })
      radiusAt.set(`${d.x},${d.y}`, d.r)
      dotGroup.append(dotEl)
    }
    svg.append(dotGroup)

    for (const ring of prim.rings) {
      const r = radiusAt.get(`${ring.x},${ring.y}`) ?? 5
      const k = prim.markScale ?? 1
      const x = px(ring.x), y = py(ring.y)
      const common = { fill: 'none', stroke: '#1a1a1a', 'stroke-width': k, class: `el ${ring.kind === 'sqrtOne' ? 'sqrt1' : ring.kind}` }
      if (ring.kind === 'sqrtOne') {
        const side = r + 11 * k
        svg.append(svgEl('rect', { x: x - side / 2, y: y - side / 2, width: side, height: side, ...common }))
      } else if (ring.kind === 'sqrtN') {
        svg.append(svgEl('circle', { cx: x, cy: y, r: r + RING_SQRT_N * k, ...common, 'stroke-width': 1.4 * k, 'stroke-dasharray': `${3 * k} ${2 * k}` }))
      } else {
        svg.append(svgEl('circle', { cx: x, cy: y, r: r + RING_UNIT * k, ...common }))
      }
    }

    for (const lb of prim.labels) {
      svg.append(svgEl('text', {
        x: px(lb.x), y: py(lb.y), 'text-anchor': 'middle', dy: '0.35em', 'font-size': graph.m > 60 ? 11 : 14,
        fill: lb.color === 'red' ? '#c81e1e' : '#555', class: 'el'
      }, lb.text))
    }

    if (caption) {
      svg.append(svgEl('text', {
        x: SIZE + pad - 6, y: SIZE + pad - 10, 'text-anchor': 'end', 'font-size': 64, fill: '#1a1a1a'
      }, caption))
    }

    let shown = 0
    function showUpTo(count) {
      if (count >= graph.edges.length) {
        // Ende der Animation: alle Punkte erhalten ihre endgültige Farbe, auch wenn Linien gefiltert wurden
        for (const d of dotByResidue.values()) d.el.setAttribute('fill', d.fill)
      }
      while (shown < prim.lines.length && prim.lines[shown].order < count) {
        lineEls[shown].removeAttribute('display')
        const target = dotByResidue.get(graph.edges[prim.lines[shown].order].to)
        if (target) target.el.setAttribute('fill', target.fill)
        shown++
      }
    }
    return { svg, showUpTo }
  }

  /**
   * Hebt beim Überfahren eines Elements mit data-target die gleichnamigen Elemente im Graphen hervor.
   * @param {HTMLElement} source Element, das Einträge mit data-target enthält
   * @param {function(): ?SVGElement} getSvg liefert das SVG des Graphen
   */
  function linkHover(source, getSvg) {
    source.addEventListener('mouseover', ev => {
      const t = ev.target.closest ? ev.target.closest('[data-target]') : null
      const svg = getSvg()
      if (!t || !svg) return
      svg.querySelectorAll('.hi').forEach(e => e.classList.remove('hi'))
      svg.querySelectorAll('.' + t.dataset.target).forEach(e => e.classList.add('hi'))
      svg.classList.add('focus')
    })
    source.addEventListener('mouseout', ev => {
      const svg = getSvg()
      const next = ev.relatedTarget && ev.relatedTarget.closest ? ev.relatedTarget.closest('[data-target]') : null
      if (svg && !next) svg.classList.remove('focus')
    })
  }

  /**
   * Zeigt die Einzelansicht n:m in root.
   * @param {HTMLElement} root Wurzelelement, sein Inhalt wird ersetzt
   * @param {Object} state Ansichtszustand (SingleState)
   * @param {function(Object, {replace: boolean}): void} navigate Funktion, die einen neuen Zustand setzt und neu zeichnet
   * @returns {{destroy: function(): void}} Objekt zum Aufräumen; destroy bricht laufende Animationen ab
   */
  function renderSingle(root, state, navigate) {
    let animation = null
    let destroyed = false

    const set = patch => navigate({ ...state, ...patch }, { replace: true })

    // ---------- Bausteine der Bedienspalte ----------
    function numberInput(key, value, min, max, onValue, cls, label) {
      return el('input', {
        'data-key': key, type: 'number', min, max, step: 1, value, class: cls, 'aria-label': label,
        onchange: ev => {
          const v = Number(ev.target.value)
          if (ev.target.value.trim() === '' || !Number.isFinite(v)) { set({}); return }
          onValue(clamp(Math.round(v), min, max))
        }
      })
    }

    function stepButton(key, text, title, disabled, onClick) {
      return el('button', { 'data-key': key, type: 'button', class: 'step', title, 'aria-label': title, disabled, onclick: onClick }, text)
    }

    function button(key, text, title, disabled, onClick) {
      return el('button', { 'data-key': key, type: 'button', class: 'btn', title, disabled, onclick: onClick }, text)
    }

    function check(key, label, checked, onChange, disabled, glyphKind) {
      return el('label', { class: 'opt' + (disabled ? ' disabled' : '') }, [
        el('input', { 'data-key': key, type: 'checkbox', checked, disabled, onchange: ev => onChange(ev.target.checked) }),
        el('span', {}, label),
        glyphKind ? glyph(glyphKind) : null
      ])
    }

    function select(key, options, current, onChange, label) {
      return el('select', { 'data-key': key, 'aria-label': label, onchange: ev => onChange(ev.target.value) },
        options.map(([value, text]) => el('option', { value, selected: String(value) === String(current) }, text)))
    }

    function slider(key, label, value, onCommit) {
      const out = el('small', { class: 'sliderValue' }, value.toFixed(2))
      const input = el('input', {
        'data-key': key, type: 'range', min: 0, max: 1, step: 0.01, value, 'aria-label': `line length ${label}`,
        oninput: ev => { out.textContent = Number(ev.target.value).toFixed(2) },
        onchange: ev => onCommit(Number(ev.target.value))
      })
      return el('label', { class: 'opt' }, [el('small', {}, label), input, out])
    }

    function panel(key, title, children) {
      return el('details', {
        'data-key': `panel-${key}`, open: local.panels[key],
        ontoggle: ev => { local.panels[key] = ev.target.open }
      }, [el('summary', {}, title), ...children])
    }

    // Zeile mit ◀ ■ ▶ zum automatischen Zählen von N bzw. M; extra steht am Ende der Zeile.
    function autoRow(key, label, value, extra) {
      const [lo, hi] = AUTO_BOUNDS[key]
      const running = auto.dir !== 0 && auto.key === key
      // Während des Zählens wird die Ansicht ständig neu aufgebaut. Ein click entsteht aber nur, wenn
      // Drücken und Loslassen auf demselben Element stattfinden. Deshalb reagieren die Knöpfe schon auf
      // pointerdown; click bleibt für die Bedienung per Tastatur (detail = 0) erhalten.
      const start = dir => () => { auto.key = key; auto.dir = dir; set({}) }
      const stop = () => { stopAuto(); set({}) }
      const onPress = fn => ({
        onpointerdown: ev => { if (ev.button === 0) { ev.preventDefault(); fn() } },
        onclick: ev => { if (ev.detail === 0) fn() }
      })
      return el('div', { class: 'row autoRow' }, [
        el('small', { class: 'inlineLabel' }, `${label} auto`),
        el('button', {
          'data-key': `auto-${key}-down`, type: 'button', class: 'btn' + (running && auto.dir < 0 ? ' on' : ''),
          title: `Count ${label} down automatically`, 'aria-pressed': String(running && auto.dir < 0), disabled: value - 1 < lo,
          ...onPress(start(-1))
        }, '◀'),
        el('button', {
          'data-key': `auto-${key}-stop`, type: 'button', class: 'btn', title: 'Stop counting', disabled: !running,
          ...onPress(stop)
        }, '■'),
        el('button', {
          'data-key': `auto-${key}-up`, type: 'button', class: 'btn' + (running && auto.dir > 0 ? ' on' : ''),
          title: `Count ${label} up automatically`, 'aria-pressed': String(running && auto.dir > 0), disabled: value + 1 > hi,
          ...onPress(start(1))
        }, '▶'),
        extra
      ])
    }

    // ---------- Kopfzeile ----------
    const header = ui.appHeader('single', navigate)

    // ---------- Bedienspalte ----------
    const { n, m, a } = state
    const g = gcd(n, m)
    const isMul = state.op === 'mul'
    const activePreset = PRESET_LABELS.find(([key]) => {
      const p = LENGTH_PRESETS[key]
      return p.min === state.lengthFilter.min && p.max === state.lengthFilter.max
    })

    const controls = el('aside', { class: 'panel controls' }, [
      el('div', { class: 'fraction' }, [
        stepButton('N-', '‹', 'N − 1', n - 1 < 1, () => set({ n: n - 1 })),
        numberInput('N', n, 1, N_MAX, v => set({ n: v }), 'val', 'N'),
        stepButton('N+', '›', 'N + 1', n + 1 > N_MAX, () => set({ n: n + 1 })),
        el('div', { class: 'bar' }),
        stepButton('M-', '‹', 'M − 1', m - 1 < M_MIN, () => set({ m: m - 1 })),
        numberInput('M', m, M_MIN, N_MAX, v => set({ m: v }), 'val', 'M'),
        stepButton('M+', '›', 'M + 1', m + 1 > N_MAX, () => set({ m: m + 1 }))
      ]),
      el('div', { class: 'mapping' }, isMul ? `a ↦ ${n}·a mod ${m}` : `a ↦ ${n} + a mod ${m}`),
      autoRow('n', 'N', n),
      autoRow('m', 'M', m, select('autoSpeed', AUTO_SPEEDS.map(([text, v]) => [v, text]), auto.perSecond, v => {
        auto.perSecond = Number(v)
        if (auto.dir !== 0) scheduleAuto()
      }, 'counting speed')),
      el('div', { class: 'row' }, [
        button('NM-', 'both −1', 'N − 1 and M − 1', n - 1 < 1 || m - 1 < M_MIN, () => set({ n: n - 1, m: m - 1 })),
        button('NM+', 'both +1', 'N + 1 and M + 1', n + 1 > N_MAX || m + 1 > N_MAX, () => set({ n: n + 1, m: m + 1 })),
        button('shorten', '÷ gcd', 'Divide N and M by gcd(N, M)', g === 1 || m / g < M_MIN, () => set({ n: n / g, m: m / g }))
      ]),
      el('div', { class: 'row' }, [
        button('expand', `× ${a}`, `Multiply N and M by ${a}`, Math.max(n, m) * a > N_MAX, () => set({ n: n * a, m: m * a })),
        el('label', { class: 'inline' }, [el('small', {}, 'factor'), numberInput('A', a, 1, 100, v => set({ a: v }), 'num', 'factor A')])
      ]),
      /* Auswahl der Operation vorerst ausgeblendet; es gibt nur a ↦ n·a.
      el('div', { class: 'row' }, [
        el('span', { class: 'seg', role: 'group', 'aria-label': 'operation' }, [
          el('button', { 'data-key': 'op-mul', type: 'button', class: isMul ? 'on' : '', 'aria-pressed': String(isMul), onclick: () => set({ op: 'mul' }) }, 'a ↦ n·a'),
          el('button', { 'data-key': 'op-add', type: 'button', class: isMul ? '' : 'on', 'aria-pressed': String(!isMul), onclick: () => set({ op: 'add' }) }, 'a ↦ n+a')
        ])
      ]),
      */
      /* Vorerst ausgeblendet, für später aufgehoben.
      check('dropZero', ['without 0 (only ', 'ℤ', el('sub', {}, 'M'), el('sup', {}, '×'), ')'], state.dropZero, v => set({ dropZero: v }), !isMul),
      */

      panel('highlight', 'Highlight', [
        check('cycles', 'cycles in colour', state.cycles, v => set({ cycles: v })),
        check('fixedPoints', 'fixed points, non-image points grey', state.fixedPoints, v => set({ fixedPoints: v }), false, 'fixed'),
        check('units', 'units and square roots', state.units, v => set({ units: v }), false, 'unit')
      ]),
      /* Vorerst ausgeblendet, für später aufgehoben.
      panel('lengths', 'Line lengths', [
        el('label', { class: 'opt' }, [
          select('preset', [...(activePreset ? [] : [['', 'custom']]), ...PRESET_LABELS], activePreset ? activePreset[0] : '', v => {
            if (v && LENGTH_PRESETS[v]) set({ lengthFilter: { ...LENGTH_PRESETS[v] } })
          }, 'line length preset')
        ]),
        slider('min', 'from', state.lengthFilter.min, v => set({ lengthFilter: { ...state.lengthFilter, min: v } })),
        slider('max', 'to', state.lengthFilter.max, v => set({ lengthFilter: { ...state.lengthFilter, max: v } }))
      ]),
      */
      /* Animation und Ton sind vorerst abgeschaltet.
      panel('animation', 'Animation and sound', [
        el('div', { class: 'row' }, [
          button('play', '▶ play', 'Draw the lines one after another', state.neighbours, () => { local.playOnce = true; set({}) }),
          select('speed', SPEED_CHOICES.map(([text, speed]) => [speed, text]), state.speed, v => set({ speed: Number(v) }), 'tempo')
        ]),
        check('dynamic', 'animate on every change', state.dynamic, v => set({ dynamic: v })),
        check('sound', 'play n:m as interval on click', state.sound, v => set({ sound: v })),
        el('label', { class: 'opt' }, [el('small', {}, 'duration'),
          el('input', { 'data-key': 'duration', type: 'range', min: 0.1, max: 2, step: 0.05, value: local.duration, 'aria-label': 'tone duration', oninput: ev => { local.duration = Number(ev.target.value) } })]),
        el('label', { class: 'opt' }, [el('small', {}, 'volume'),
          el('input', { 'data-key': 'volume', type: 'range', min: 0, max: 1, step: 0.05, value: local.volume, 'aria-label': 'tone volume', oninput: ev => { local.volume = Number(ev.target.value) } })])
      ]),
      */
      panel('view', 'View', [
        // Vorerst ausgeblendet, für später aufgehoben:
        // check('neighbours', 'show the 8 neighbours', state.neighbours, v => set({ neighbours: v })),
        check('hideLegend', 'show analysis and numbers', !state.hideLegend, v => set({ hideLegend: !v })),
        el('div', { class: 'row' }, [
          el('small', { class: 'inlineLabel' }, 'zoom'),
          button('zoomOut', '−', 'Zoom out', false, () => set({ zoom: Math.max(0.1, Math.round(state.zoom / ZOOM_STEP * 100) / 100) })),
          button('zoomFit', 'fit', 'Fit to the column', state.zoom === 1, () => set({ zoom: 1 })),
          button('zoomIn', '+', 'Zoom in', false, () => set({ zoom: Math.min(8, Math.round(state.zoom * ZOOM_STEP * 100) / 100) }))
        ])
      ])
    ])

    // ---------- Graph bzw. Raster ----------
    const style = {
      context: 'single', showCycles: state.cycles, highlightFixedPoints: state.fixedPoints,
      showUnits: state.units, lengthFilter: state.lengthFilter, showResidueLabels: !state.hideLegend
    }
    const graphOpts = { op: state.op, dropZero: state.dropZero }
    const zoom = typeof state.zoom === 'number' && state.zoom > 0 ? state.zoom : 1
    const content = el('div', { class: 'graphContent' + (zoom === 1 ? ' fit' : ''), style: `width:${zoom * 100}%` })
    // Animation vorerst abgeschaltet. Zum Wiedereinschalten diese Zeile verwenden:
    // const animate = !state.neighbours && (state.dynamic || local.playOnce)
    const animate = false
    local.playOnce = false

    let main = null
    if (state.neighbours) {
      const grid = el('div', { class: 'neighbourGrid' })
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nn = n + dy, mm = m + dx
          const cell = el('div', { class: 'neighbourCell' + (dx === 0 && dy === 0 ? ' centre' : '') })
          if (nn >= 1 && nn <= N_MAX && mm >= M_MIN && mm <= N_MAX) {
            const graph = buildGraph(nn, mm, graphOpts)
            const prim = graphPrimitives(graph, { ...style, context: 'neighbour', showResidueLabels: false, showUnits: false })
            const drawn = drawGraph(graph, prim, { dynamic: false, caption: `${nn}:${mm}`, onClick: null })
            cell.append(el('a', { href: serializeViewState({ ...state, n: nn, m: mm, neighbours: false }), class: 'neighbourLink', title: `open ${nn}:${mm}`,
              onclick: ev => { ev.preventDefault(); navigate({ ...state, n: nn, m: mm, neighbours: false }, { replace: false }) } }, [drawn.svg]))
          }
          grid.append(cell)
        }
      }
      content.append(grid)
    } else {
      const graph = buildGraph(n, m, graphOpts)
      const prim = graphPrimitives(graph, style)
      const drawn = drawGraph(graph, prim, {
        dynamic: animate, caption: null,
        // Ton vorerst abgeschaltet:
        // onClick: state.sound ? () => playRatio(n, m, { duration: local.duration, volume: local.volume }) : null
        onClick: null
      })
      content.append(drawn.svg)
      main = { graph, drawn }
    }

    // ---------- Zeichenerklärung ----------
    let key = null
    if (main) {
      const gr = main.graph
      const item = (target, kind, text, count, on) =>
        el('span', { class: 'keyItem' + (on ? '' : ' off'), 'data-target': target }, [glyph(kind), text, el('span', { class: 'countBox' }, String(count))])
      const nm = isMul ? n % m : null
      key = el('div', { class: 'key' }, [
        item('fixed', 'fixed', 'fixed points', gr.fixedPoints.length, state.fixedPoints),
        item('nonimage', 'nonimage', 'not in image', gr.residues.length - gr.imagePoints.length, state.fixedPoints),
        item('zero', 'zero', 'lines into 0', gr.edges.filter(e => e.to === 0 && e.from !== 0).length, true),
        item('unit', 'unit', 'units', gr.units.length, state.units),
        item('sqrt1', 'sqrt1', 'a² ≡ 1', gr.squareRootsOfUnity.length, state.units),
        nm === null ? null : item('sqrtN', 'sqrtN', `a² ≡ ${nm}`, gr.squareRootsOfN.length, state.units)
      ])
      linkHover(key, () => main.drawn.svg)
    }

    const wrap = el('div', { class: 'graphWrap' }, [content])
    const stage = el('section', { class: 'panel stage' }, [wrap, key])

    // ---------- Analysespalte ----------
    let analysis = null
    if (main && !state.hideLegend) {
      analysis = el('section', { class: 'panel analysis', 'aria-label': 'analysis' })
      const linkFor = (nn, mm) => serializeViewState({ ...state, n: nn, m: mm })
      // Einziger Einsatz von innerHTML: Der Text wird in core ausschließlich aus Zahlen erzeugt und maskiert.
      analysis.innerHTML = renderLegendHtml(analyze(n, m, main.graph), main.graph, {
        showCycles: state.cycles, showUnits: state.units, op: state.op, linkFor, open: local.sections,
        allCycles: local.allCycles
      })
      analysis.addEventListener('toggle', ev => {
        const s = ev.target.dataset && ev.target.dataset.section
        if (s) local.sections[s] = ev.target.open
      }, true)
      analysis.addEventListener('click', ev => {
        const action = ev.target.closest ? ev.target.closest('[data-action]') : null
        if (action && (action.dataset.action === 'cycles-all' || action.dataset.action === 'cycles-fewer')) {
          local.allCycles = action.dataset.action === 'cycles-all'
          set({})
          return
        }
        const link = ev.target.closest ? ev.target.closest('a') : null
        const href = link && link.getAttribute('href')
        if (href && href.startsWith('?')) {
          ev.preventDefault()
          navigate(parseViewState(href), { replace: false })
        }
      })
      linkHover(analysis, () => main.drawn.svg)
    }

    const page = el('div', { class: 'page' + (analysis ? '' : ' noAnalysis') }, [controls, stage, analysis])
    root.replaceChildren(header, page)

    // ---------- Animation ----------
    if (main && animate) {
      animation = createAnimation({
        lineCount: main.graph.edges.length, m: main.graph.m, speed: state.speed,
        onFrame: count => main.drawn.showUpTo(count),
        now: () => window.performance.now(),
        requestFrame: cb => window.requestAnimationFrame(cb),
        cancelFrame: id => window.cancelAnimationFrame(id)
      })
    }

    // ---------- Automatisches Zählen von M ----------
    const self = { state, navigate, refresh: () => navigate(state, { replace: true }) }
    auto.view = self
    if (auto.dir !== 0) scheduleAuto()

    return {
      destroy() {
        if (destroyed) return
        destroyed = true
        if (auto.view === self) auto.view = null
        if (animation) animation.cancel()
        animation = null
      }
    }
  }

  Object.assign(ui, { renderSingle })
})()
