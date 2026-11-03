// HTML der Analysespalte zu n:m. Reine Textausgabe, keine Browser-APIs.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})
  const { COLORS, isPrime } = core

  const WIKI = 'https://en.wikipedia.org/wiki/'
  const MAX_CYCLE_ROWS = 14
  const DEFAULT_OPEN = { cycles: true, reciprocity: true, units: false, lengths: false, divisors: false, factors: false }

  /**
   * Maskiert Zeichen, die in HTML-Text oder Attributwerten Bedeutung haben.
   * @param {*} value beliebiger Wert, wird in Text umgewandelt
   * @returns {string} der maskierte Text
   */
  function esc(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return String(value).replace(/[&<>"']/g, c => map[c])
  }

  const zx = m => `ℤ<sub>${esc(m)}</sub><sup>×</sup>`
  const wiki = (page, text) => `<a href="${WIKI}${page}" target="_blank" rel="noopener">${text}</a>`
  const list = (xs, max = 12) => esc(xs.length > max ? `${xs.slice(0, max).join(', ')}, … (${xs.length})` : xs.join(', '))
  const fact = (formula, definition) =>
    `<div class="fact"><span class="f">${formula}</span>${definition ? `<span class="d">${definition}</span>` : ''}</div>`

  function section(key, title, note, body, open) {
    return `<details data-section="${key}"${open ? ' open' : ''}><summary>${title}<small>${note}</small></summary>${body}</details>`
  }

  function headerHtml(a, linkFor) {
    let html = `<h2 class="anTitle">${esc(a.n)} : ${esc(a.m)}</h2>`
    if (a.reduced) {
      const text = `${esc(a.reduced.n)} : ${esc(a.reduced.m)}`
      // Die Ansicht kennt nur m ≥ 2; bei m = 1 (z. B. 50:25 ≡ 2 : 1) steht die gekürzte Form ohne Link.
      const shown = a.reduced.m >= 2 ? `<a href="${esc(linkFor(a.reduced.n, a.reduced.m))}">${text}</a>` : text
      html += `<div class="anReduced">≡ ${shown} after dividing by gcd ${esc(a.gcd)}</div>`
    }
    return html
  }

  function mapping(n, m, op) {
    return op === 'add' ? `a ↦ ${esc(n)} + a mod ${esc(m)}` : `a ↦ ${esc(n)}·a mod ${esc(m)}`
  }

  function summaryHtml(a, graph, op) {
    const count = graph.residues.length
    const lengths = a.cycleLengthCounts.map(c => c.length)
    const isPermutation = graph.imagePoints.length === count
    let text
    if (isPermutation) {
      text = `${mapping(a.n, a.m, op)} permutes the ${esc(count)} residues. They fall into <b>${esc(a.totalCycles)} cycles</b> of length ${esc(lengths.join(' and '))}.`
    } else {
      const toZero = graph.edges.filter(e => e.to === 0 && e.from !== 0).length
      text = `${mapping(a.n, a.m, op)} is <b>not a permutation</b>, because gcd(${esc(a.n)}, ${esc(a.m)}) = ${esc(a.gcd)}. `
        + `It maps the ${esc(count)} residues onto ${esc(graph.imagePoints.length)} image points; ${esc(toZero)} non-zero residues are sent to 0. `
        + `The lines eventually end in ${esc(a.totalCycles)} ${a.totalCycles === 1 ? 'cycle' : 'cycles'}.`
    }
    if (op !== 'add') {
      const sym = a.fixedPointCount
      text += sym > 1 ? ` The figure has <b>${esc(sym)}-fold</b> rotational symmetry.` : ' The figure has no rotational symmetry.'
    }
    return `<p class="anSummary">${text}</p>`
  }

  function cardsHtml(a, graph) {
    const sym = a.fixedPointCount
    const lengths = a.cycleLengthCounts.map(c => c.length)
    const cards = [
      [a.gcd, a.gcd === 1 ? 'gcd(n, m), coprime' : 'gcd(n, m)'],
      [a.order ?? '–', a.order !== null ? `order ω, ${esc(a.n % a.m)}<sup>${esc(a.order)}</sup> ≡ 1` : 'order ω, n is not a unit'],
      [a.totalCycles, `cycles, lengths ${list(lengths, 6)}`],
      [graph.fixedPoints.length, 'fixed points, n·a ≡ a'],
      [sym > 1 ? `${sym}×` : 'none', 'rotational symmetry'],
      [a.phi, `units, φ(${esc(a.m)})`]
    ]
    return `<div class="cards">${cards.map(([v, k]) =>
      `<div class="card"><div class="v">${esc(v)}</div><div class="k">${k}</div></div>`).join('')}</div>`
  }

  function cyclesSection(a, graph, { showCycles, allCycles }, open) {
    const intro = showCycles
      ? 'Following the lines from any residue ends in a closed loop. Each colour is one loop; hover a row to see it in the graph.'
      : 'Following the lines from any residue ends in a closed loop. Turn on “cycles in colour” to see the loops in the graph.'
    // Nach Länge sortiert; der Index i bleibt erhalten, weil Farbe und Hover-Ziel davon abhängen.
    const sorted = graph.cycles.map((c, i) => ({ c, i })).sort((x, y) => x.c.length - y.c.length || x.i - y.i)
    const shown = allCycles ? sorted : sorted.slice(0, MAX_CYCLE_ROWS)
    const totalByLength = new Map(a.cycleLengthCounts.map(c => [c.length, c.count]))
    const shownByLength = new Map()
    for (const { c } of shown) shownByLength.set(c.length, (shownByLength.get(c.length) ?? 0) + 1)
    const rows = shown.map(({ c, i }, k) => {
      const swatch = showCycles ? `<span class="sw" style="background:${COLORS[i % COLORS.length]}"></span>` : ''
      const target = showCycles ? ` data-target="cyc${i}"` : ''
      const first = k === 0 || shown[k - 1].c.length !== c.length
      const count = first
        ? `<td class="cnt" rowspan="${esc(shownByLength.get(c.length))}"${showCycles ? ` data-target="len${esc(c.length)}"` : ''}>${esc(totalByLength.get(c.length))}</td>`
        : ''
      return `<tr${target}>${count}<td class="l">${swatch}</td><td>${esc(c.length)}</td><td class="members">${esc(c.join(' → '))}</td></tr>`
    }).join('')
    // Die Knöpfe werten die Ansicht über data-action aus (cycles-all bzw. cycles-fewer).
    let more = ''
    if (graph.cycles.length > MAX_CYCLE_ROWS) {
      const btn = allCycles
        ? '<button type="button" class="linkBtn" data-action="cycles-fewer">show fewer</button>'
        : `<button type="button" class="linkBtn" data-action="cycles-all">… ${esc(graph.cycles.length - MAX_CYCLE_ROWS)} more ${graph.cycles.length - MAX_CYCLE_ROWS === 1 ? 'cycle' : 'cycles'}</button>`
      more = `<tr><td colspan="4" class="l">${btn}</td></tr>`
    }
    const body = `<p class="intro">${intro}</p>`
      + `<table class="t"><tr><th>#(L)</th><th class="l"></th><th>length L</th><th class="l">residues</th></tr>${rows}${more}</table>`
    return section('cycles', 'Cycles', `${esc(a.totalCycles)} cycles`, body, open)
  }

  function unitsSection(a, graph, { showUnits, linkFor }, open) {
    const { n, m } = a
    const nm = n % m
    const drawn = text => showUnits ? `; ${text}` : ''
    let body = fact(`φ(${esc(m)}) = ${esc(a.phi)}`,
      `${wiki('Euler%27s_totient_function', "Euler's totient function")}: number of residues coprime to ${esc(m)}, the units of ${zx(m)}${drawn('drawn with a ring')}`)
    if (a.inverse !== null) {
      body += fact(`<a href="${esc(linkFor(a.inverse, m))}">${esc(n)} · ${esc(a.inverse)} ≡ 1 mod ${esc(m)}</a>`,
        `${esc(n)} is a ${wiki('Unit_(ring_theory)', 'unit')}, its inverse is ${esc(a.inverse)}`)
    } else if (a.zeroDivisorPartner !== null) {
      body += fact(`${esc(n)} · ${esc(a.zeroDivisorPartner)} ≡ 0 mod ${esc(m)}`, `${esc(n)} is a ${wiki('Zero_divisor', 'zero divisor')}`)
    }
    if (a.order !== null) {
      body += fact(`ω<sub>${esc(n)}</sub>(${esc(m)}) = ${esc(a.order)}`,
        `${wiki('Multiplicative_order', 'multiplicative order')}: smallest k with ${esc(n)}<sup>k</sup> ≡ 1; the length of the cycle through 1`)
    }
    body += fact(`λ(${esc(m)}) = ${esc(a.carmichael)}`,
      `${wiki('Carmichael_function', 'Carmichael function')}: smallest k with a<sup>k</sup> ≡ 1 for every unit a`)
    body += fact(a.primitiveRootCount !== null ? `${esc(a.primitiveRootCount)} primitive roots` : 'no primitive roots',
      `${wiki('Primitive_root_modulo_n', 'primitive root')}: a unit whose powers give all units${a.isPrimitiveRoot ? `; ${esc(n)} is one of them` : ''}`)
    body += fact(`a² ≡ 1: {${list(graph.squareRootsOfUnity)}}`, `square ${wiki('Root_of_unity', 'roots of unity')}${drawn('drawn as squares')}`)
    const roots = graph.squareRootsOfN
    body += fact(roots.length ? `a² ≡ ${esc(nm)}: {${list(roots)}}` : `a² ≡ ${esc(nm)} has no solution`,
      `${esc(nm)} is ${roots.length ? '' : '<b>not</b> '}a ${wiki('Quadratic_residue', 'quadratic residue')} mod ${esc(m)}${roots.length ? drawn('drawn with a dashed ring') : ''}`)
    for (const r of a.rootsOfUnity) {
      if (r.k !== 2 && r.roots.length > 1) {
        body += fact(`a<sup>${esc(r.k)}</sup> ≡ 1: {${list(r.roots)}}`, `${r.k === 3 ? 'third' : 'fifth'} roots of unity`)
      }
    }
    return section('units', 'Units and roots', `φ = ${esc(a.phi)}`, body, open)
  }

  // Legendre-Symbol (a/p) als zweizeilige Schreibweise in Klammern.
  const legendre = (a, p) => `(<span class="leg"><span>${esc(a)}</span><span>${esc(p)}</span></span>)`
  const signText = s => (s === 1 ? '+1' : '−1')

  // Quadratwurzeln von a mod p (aufsteigend), durch Ausprobieren; p ≤ 2000.
  function squareRoots(a, p) {
    const r = []
    for (let x = 1; x < p; x++) if ((x * x) % p === a % p) r.push(x)
    return r
  }

  // Zeile „a ≡ x² ≡ y² mod p“ bzw. „a ≢ x² mod p“; bei a ≥ p steht der Rest a mod p dazwischen.
  function residueFact(a, p) {
    const roots = squareRoots(a, p)
    const reduced = a >= p ? ` ≡ ${esc(a % p)}` : ''
    const symbol = roots.length ? 1 : -1
    const formula = roots.length
      ? `${esc(a)}${reduced} ≡ ${roots.map(x => `${esc(x)}²`).join(' ≡ ')} mod ${esc(p)}`
      : `${esc(a)}${reduced} ≢ x² mod ${esc(p)}`
    const text = roots.length
      ? `${esc(a)} is a quadratic residue mod ${esc(p)}`
      : `no x solves it, ${esc(a)} is a quadratic non-residue mod ${esc(p)}`
    return { symbol, html: fact(formula, `${legendre(a, p)} = ${signText(symbol)}: ${text}`) }
  }

  function reciprocitySection(a, open) {
    const p = a.n, q = a.m
    if (p === q || q === 2 || !isPrime(p) || !isPrime(q)) return ''
    let body
    let note
    if (p === 2) {
      const r = residueFact(2, q)
      const r8 = q % 8
      body = `<p class="intro">${esc(q)} is an odd prime. The ${wiki('Legendre_symbol', 'Legendre symbol')} (a/p) is +1 if a is a square mod p and −1 otherwise.</p>`
        + r.html
        + fact(`${legendre(2, q)} = ${signText(r.symbol)}, since ${esc(q)} ≡ ${esc(r8)} mod 8`,
          `${wiki('Quadratic_reciprocity#Supplements_to_Quadratic_Reciprocity', 'second supplement')}: (2/p) = +1 exactly when p ≡ ±1 mod 8`)
      note = `(2/${esc(q)}) = ${signText(r.symbol)}`
    } else {
      const r1 = residueFact(p, q)
      const r2 = residueFact(q, p)
      const e1 = (p - 1) / 2, e2 = (q - 1) / 2
      const law = (e1 * e2) % 2 === 0 ? 1 : -1
      const why = law === 1
        ? `at least one of ${esc(p)} and ${esc(q)} is ≡ 1 mod 4`
        : `${esc(p)} ≡ ${esc(q)} ≡ 3 mod 4`
      body = `<p class="intro">${esc(p)} and ${esc(q)} are odd primes. The ${wiki('Legendre_symbol', 'Legendre symbol')} (a/p) is +1 if a is a square mod p and −1 otherwise.</p>`
        + r1.html + r2.html
        + fact(`${legendre(p, q)}·${legendre(q, p)} = (−1)<sup>${esc(e1)}·${esc(e2)}</sup> = ${signText(law)}`,
          `${wiki('Quadratic_reciprocity', 'law of quadratic reciprocity')}; the product is ${signText(law)} because ${why}`)
      note = `(${esc(p)}/${esc(q)}) = ${signText(r1.symbol)}, (${esc(q)}/${esc(p)}) = ${signText(r2.symbol)}`
    }
    return section('reciprocity', 'Quadratic reciprocity', note, body, open)
  }

  function lengthsSection(a, open) {
    const rows = a.distanceTable
    const step = a.fixedPointCount
    const total = rows.reduce((s, r) => s + r.count, 0)
    const body = `<p class="intro">The length D of a line is the shorter distance of its ends on the circle. Every D is a multiple of gcd(n − 1, m) = ${esc(step)}. Hover a row to see the lines.</p>`
      + `<table class="t"><tr><th>k</th><th>D = k·${esc(step)}</th><th>lines #(D)</th></tr>`
      + rows.map(r => `<tr data-target="dist${esc(r.distance)}"><td>${esc(r.k)}</td><td>${esc(r.distance)}</td><td>${esc(r.count)}</td></tr>`).join('')
      + `<tr><th class="l">total</th><td></td><td>${esc(total)}</td></tr></table>`
    return section('lengths', 'Line lengths', `${esc(rows.length)} different lengths`, body, open)
  }

  function divisorsSection(a, open) {
    const rows = a.divisorTable
    const m = esc(a.m)
    const body = `<p class="intro">Each divisor d of ${m} collects the φ(d) residues a with gcd(a, ${m}) = ${m}/d. Within that class every cycle has length ω<sub>d</sub>(n), so the class forms φ(d)/ω<sub>d</sub>(n) cycles.</p>`
      + '<table class="t">'
      + `<tr><th class="l">d | ${m}</th>${rows.map(r => `<td>${esc(r.d)}</td>`).join('')}<th>Σ = ${esc(a.sigma1)}</th></tr>`
      + `<tr><th class="l">φ(d)</th>${rows.map(r => `<td>${esc(r.phi)}</td>`).join('')}<th>${esc(rows.reduce((s, r) => s + r.phi, 0))}</th></tr>`
      + `<tr><th class="l">ω<sub>d</sub>(n)</th>${rows.map(r => `<td>${r.order === null ? '' : esc(r.order)}</td>`).join('')}<th></th></tr>`
      + `<tr><th class="l">cycles</th>${rows.map(r => `<td>${r.cyclesFromD === null ? '' : esc(r.cyclesFromD)}</td>`).join('')}<th>${esc(rows.reduce((s, r) => s + (r.cyclesFromD ?? 0), 0))}</th></tr>`
      + '</table>'
    return section('divisors', 'Cycles by divisor', `σ<sub>1</sub>(${m}) = ${esc(a.sigma1)}`, body, open)
  }

  function factorsSection(a, open) {
    const prime = ` (${wiki('Prime_number', 'prime')})`
    let body = fact(`${esc(a.n)} = ${esc(a.factorN)}`, `divisors {${list(a.divisorsN)}}${a.nIsPrime ? prime : ''}`)
    body += fact(`${esc(a.m)} = ${esc(a.factorM)}`, `divisors {${list(a.divisorsM)}}${a.mIsPrime ? prime : ''}`)
    if (a.mIsPrime) body += fact(`divisors of ${esc(a.m)} − 1 = {${list(a.divisorsMMinus1)}}`, 'the possible cycle lengths ω<sub>d</sub>(n)')
    body += fact(`gcd(${esc(a.n)}, ${esc(a.m)}) = ${esc(a.gcd)}`, wiki('Greatest_common_divisor', 'greatest common divisor'))
    body += fact(`${esc(a.zeroDivisorCount)} zero divisors`, `non-zero a with n·a ≡ 0; equals gcd(n, m) − 1`)
    body += fact(`${esc(a.fixedPointCount)} fixed points`, `${wiki('Fixed_point_(mathematics)', 'fixed points')} a with n·a ≡ a; equals gcd(n − 1, m)`)
    body += fact(`${esc(a.imageSize)} image points`, `${wiki('Image_(mathematics)', 'image points')}: residues reached by some line; equals m / gcd(n, m)`)
    body += fact(`translation period ${esc(a.translationPeriod)}`, 'smallest b with n·(a + b) ≡ n·a + b for all a; equals m / gcd(n − 1, m)')
    return section('factors', 'Factors and counts', '', body, open)
  }

  /**
   * Erzeugt den HTML-Text der Analysespalte: Titel, Zusammenfassung, Kennzahlen und aufklappbare Abschnitte.
   * @param {import('./analysis.js').Analysis} analysis Ergebnis von analyze
   * @param {import('./multiplicationGraph.js').MultiplicationGraph} graph das zugehörige Graphmodell
   * @param {{showCycles: boolean, showUnits: boolean, op: 'mul'|'add', linkFor: function(number, number): string,
   *   open?: Object<string, boolean>, allCycles?: boolean}} options
   *   Anzeigeoptionen; linkFor(n, m) liefert die URL der Ansicht n:m; open gibt je Abschnitt
   *   (cycles, units, reciprocity, lengths, divisors, factors) an, ob er aufgeklappt ist; allCycles zeigt alle Zyklen statt der ersten 14
   * @returns {string} HTML; Zeilen mit data-target="cycI", "lenL" bzw. "distD" verweisen auf Elemente im Graphen;
   *   Knöpfe mit data-action="cycles-all" bzw. "cycles-fewer" schalten allCycles um
   */
  function renderLegendHtml(analysis, graph, options) {
    const open = { ...DEFAULT_OPEN, ...(options.open || {}) }
    return headerHtml(analysis, options.linkFor)
      + summaryHtml(analysis, graph, options.op)
      + cardsHtml(analysis, graph)
      + cyclesSection(analysis, graph, options, open.cycles)
      + unitsSection(analysis, graph, options, open.units)
      + reciprocitySection(analysis, open.reciprocity)
      + lengthsSection(analysis, open.lengths)
      + divisorsSection(analysis, open.divisors)
      + factorsSection(analysis, open.factors)
  }

  Object.assign(core, { renderLegendHtml })
})()
