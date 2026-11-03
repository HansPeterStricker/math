// Geometrie der Rasteransichten im unskalierten Maß: Tabelle n:m und alle Graphen n:p zu einem Modul p.

(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})

  /** Kantenlänge einer Zelle (Legacy defaultW). */
  const CELL_SIZE = 120
  /** Breite des Randes mit den Beschriftungen der Zeilen und Spalten in der Tabelle n:m. */
  const LABEL_SIZE = 40

  /**
   * @typedef {{n: number, m: number, row: number, col: number, x: number, y: number}} GridCell
   *   x, y = linke obere Ecke im unskalierten Maß
   * @typedef {{
   *   width: number, height: number, rows: number, cols: number, originX: number, originY: number,
   *   cells: GridCell[],
   *   rowLabels: {text: string, row: number}[], colLabels: {text: string, col: number}[],
   *   cellLabels: boolean,
   *   index: Map<string, GridCell>
   * }} GridGeometry
   *   originX, originY = linke obere Ecke der ersten Zelle; rowLabels/colLabels = Randbeschriftung;
   *   cellLabels = jede Zelle trägt ihr n als Beschriftung; index: Schlüssel "row,col"
   */

  function finish(geo) {
    geo.index = new Map(geo.cells.map(c => [`${c.row},${c.col}`, c]))
    return geo
  }

  /**
   * Tabelle n:m mit n = 1..cols (Zeilen) und m = 2..cols (Spalten), ohne die Diagonale m = n.
   * Die Spalte m = 1 entfällt, weil dort alle Graphen trivial sind.
   * @param {number} cols größtes n und m (1..60)
   * @param {boolean} [showNGreaterM] false lässt die Zellen mit n > m weg (Standard true)
   * @returns {GridGeometry} die Geometrie
   */
  function tableGeometry(cols, showNGreaterM = true) {
    const cells = []
    const nCols = Math.max(0, cols - 1)
    for (let n = 1; n <= cols; n++) {
      for (let m = 2; m <= cols; m++) {
        if (m === n || (!showNGreaterM && n > m)) continue
        const row = n - 1, col = m - 2
        cells.push({ n, m, row, col, x: LABEL_SIZE + col * CELL_SIZE, y: LABEL_SIZE + row * CELL_SIZE })
      }
    }
    return finish({
      width: LABEL_SIZE + nCols * CELL_SIZE, height: LABEL_SIZE + cols * CELL_SIZE,
      rows: cols, cols: nCols, originX: LABEL_SIZE, originY: LABEL_SIZE, cells,
      rowLabels: Array.from({ length: cols }, (_, i) => ({ text: String(i + 1), row: i })),
      colLabels: Array.from({ length: nCols }, (_, i) => ({ text: String(i + 2), col: i })),
      cellLabels: false
    })
  }

  /**
   * Alle Graphen n:p mit n = 1..p − 1 (ohne p:p) in einem möglichst quadratischen Raster:
   * c = ⌈√(p − 1)⌉ Spalten und ⌈(p − 1)/c⌉ Zeilen, zeilenweise nach n geordnet. Für p = 37 entsteht ein 6 × 6-Quadrat.
   * @param {number} p Modul ≥ 2
   * @returns {GridGeometry} die Geometrie
   */
  function modulusGeometry(p) {
    const count = Math.max(0, p - 1)
    const cols = Math.max(1, Math.ceil(Math.sqrt(count)))
    const rows = Math.ceil(count / cols)
    const cells = []
    for (let n = 1; n <= count; n++) {
      const row = Math.floor((n - 1) / cols), col = (n - 1) % cols
      cells.push({ n, m: p, row, col, x: col * CELL_SIZE, y: row * CELL_SIZE })
    }
    return finish({
      width: cols * CELL_SIZE, height: rows * CELL_SIZE, rows, cols, originX: 0, originY: 0, cells,
      rowLabels: [], colLabels: [], cellLabels: true
    })
  }

  /**
   * Bestimmt die Zelle an einer Position.
   * @param {GridGeometry} geo Geometrie aus tableGeometry oder modulusGeometry
   * @param {number} x x-Koordinate im unskalierten Maß
   * @param {number} y y-Koordinate im unskalierten Maß
   * @returns {GridCell | null} die Zelle, oder null außerhalb der Zellen
   */
  function hitTest(geo, x, y) {
    const col = Math.floor((x - geo.originX) / CELL_SIZE)
    const row = Math.floor((y - geo.originY) / CELL_SIZE)
    if (!(col >= 0) || !(row >= 0)) return null
    return geo.index.get(`${row},${col}`) ?? null
  }

  Object.assign(core, { CELL_SIZE, LABEL_SIZE, tableGeometry, modulusGeometry, hitTest })
})()
