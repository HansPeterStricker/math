// Zeichnet eine einzelne Zelle der Tabellenansicht auf einen Canvas-Kontext.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const ui = (R.ui ??= {})
  const core = R.core
  const { COLORS, pieArc } = core

  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

  function drawGraphPart(ctx, cell, cx, cy, radius) {
    const { primitives: prim } = cell
    const px = x => cx + radius * x
    const py = y => cy + radius * y

    ctx.lineWidth = 0.5
    ctx.strokeStyle = 'black'
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.stroke()

    ctx.lineCap = 'round'
    for (const l of prim.lines) {
      if (l.x1 === l.x2 && l.y1 === l.y2) {
        // Linie der Länge 0 (Fixpunkt): gefüllter Kreis mit Durchmesser = Linienbreite
        ctx.fillStyle = l.color
        ctx.beginPath()
        ctx.arc(px(l.x1), py(l.y1), l.width / 2, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        ctx.strokeStyle = l.color
        ctx.lineWidth = l.width
        ctx.beginPath()
        ctx.moveTo(px(l.x1), py(l.y1))
        ctx.lineTo(px(l.x2), py(l.y2))
        ctx.stroke()
      }
    }
    for (const d of prim.dots) {
      ctx.fillStyle = d.fill
      ctx.beginPath()
      ctx.arc(px(d.x), py(d.y), d.r, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  // Kreisscheibe mit Beschriftung über dem Graphen; ohne Wert (null) nur ein silberner Rand.
  function drawOverlay(ctx, cx, cy, radius, color, text, opacity) {
    if (color === null) {
      ctx.strokeStyle = 'silver'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
      ctx.stroke()
      return
    }
    ctx.globalAlpha = opacity * 0.8
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.globalAlpha = opacity
    ctx.fillStyle = 'white'
    ctx.font = `bold 13px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, cx, cy)
  }

  function drawPie(ctx, cell, cx, cy, radius, pieColor) {
    const inner = radius / 2
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.moveTo(cx + inner, cy)
    ctx.arc(cx, cy, inner, 0, 2 * Math.PI, true)
    ctx.fill('evenodd')
    ctx.stroke()
    const arc = pieArc(cell.n, cell.m)
    if (!arc) return
    // pieArc misst Winkel ab 12 Uhr im Uhrzeigersinn; der Canvas misst ab 3 Uhr, ebenfalls im Uhrzeigersinn.
    const s = arc.start - Math.PI / 2
    const e = arc.end - Math.PI / 2
    ctx.fillStyle = pieColor
    ctx.beginPath()
    ctx.arc(cx, cy, radius, s, e)
    ctx.arc(cx, cy, inner, e, s, true)
    ctx.closePath()
    ctx.fill()
  }

  /**
   * Zeichnet eine Tabellenzelle. Der Graph füllt einen Kreis mit Radius 0,45·size um die Mitte der Zelle.
   * @param {CanvasRenderingContext2D} ctx Zeichenkontext; Transformation und Zoom sind bereits gesetzt
   * @param {{n: number, m: number, x: number, y: number, graph: Object, primitives: Object, cls: Object}} cell
   *   Zelle: n, m, linke obere Ecke (x, y) und die Daten aus dem Zwischenspeicher (graph, primitives, cls)
   * @param {{display: 'graph'|'numbers'|'pie', highlight: string, opacity: number, size: number, pieColor: string}} o
   *   display: Darstellungsart, highlight: Hervorhebung (gcd, gcdShifted und interval legen eine Beschriftung über den Graphen),
   *   opacity: Deckkraft 0..1, size: Kantenlänge der Zelle, pieColor: Farbe des Tortenstücks
   * @returns {void}
   */
  function drawCell(ctx, cell, { display, highlight, opacity, size, pieColor }) {
    const cx = cell.x + size / 2
    const cy = cell.y + size / 2
    const radius = 0.45 * size
    const { cls } = cell
    ctx.save()
    ctx.globalAlpha = opacity
    if (display === 'numbers') {
      ctx.fillStyle = 'black'
      ctx.font = `${Math.min(100, (0.9 * size) / 5)}px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${cell.n}:${cell.m}`, cx, cy)
    } else if (display === 'pie') {
      drawPie(ctx, cell, cx, cy, radius, pieColor)
    } else {
      drawGraphPart(ctx, cell, cx, cy, radius)
      const color = i => COLORS[i % COLORS.length]
      if (highlight === 'gcd') {
        drawOverlay(ctx, cx, cy, radius, cls.gcd === 1 ? null : color(cls.gcd - 1), String(cls.gcd), opacity)
      } else if (highlight === 'gcdShifted') {
        drawOverlay(ctx, cx, cy, radius, cls.gcdShifted === 1 ? null : color(cls.gcdShifted - 1), String(cls.gcdShifted), opacity)
      } else if (highlight === 'interval') {
        drawOverlay(ctx, cx, cy, radius, cls.intervalIndex === null ? null : color(cls.intervalIndex), cls.interval, opacity)
      }
    }
    ctx.restore()
  }

  Object.assign(ui, { drawCell })
})()
