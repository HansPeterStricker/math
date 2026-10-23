// Graph view of a formula tableau (shared by Beispiel Pi and Beispiel e): functions and formulas in columns by the length of their derivation from the
// statements without pi (left), arrows from premises to the statements that follow from them (field proof in
// daten.js). Hovering an arrow shows the proof it belongs to: premises, kind of method (TABLEAU.methods) and method.
const FormulaGraph = (function () {
  const NODE_W = 230, NODE_H = 96, HEAD_H = 19;
  const COL_GAP = 120, ROW_GAP = 14, PAD = 24;
  const WAY_H = 10;                // height reserved for an arrow passing through a column

  function buildModel(proofOf) {
    const nodes = [
      ...TABLEAU.functions.map(f => ({ ...f, kind: "function", proof: proofOf(f) })),
      ...TABLEAU.formulas.map(f => ({ ...f, kind: "formula", proof: proofOf(f) })),
    ];
    const byId = new Map(nodes.map(n => [n.id, n]));
    const method = new Map(TABLEAU.methods.map(m => [m.id, m]));
    const edges = [];
    for (const n of nodes) {
      if (!n.proof) continue;
      for (const p of n.proof.premises) {
        edges.push({ from: byId.get(p), to: n, method: n.proof.method, type: method.get(n.proof.type), all: byId });
      }
    }
    // Column = length of the longest derivation chain from a statement without premises.
    const depth = n => {
      if (n.col !== undefined) return n.col;
      const premises = n.proof ? n.proof.premises.map(id => byId.get(id)) : [];
      return (n.col = premises.length ? 1 + Math.max(...premises.map(depth)) : 0);
    };
    nodes.forEach(depth);
    // Statements without premises stand one column before the first statement that uses them.
    for (const n of nodes) {
      if (n.proof) continue;
      const used = nodes.filter(m => m.proof && m.proof.premises.includes(n.id)).map(m => m.col);
      if (used.length) n.col = Math.min(...used) - 1;
    }
    const colCount = Math.max(...nodes.map(n => n.col)) + 1;

    // An arrow that skips columns gets a waypoint in every column it crosses. The waypoints take part in the layout,
    // so the arrow runs in a free channel between the nodes instead of behind them.
    for (const n of nodes) { n.h = NODE_H; n.neighbors = []; }
    const waypoints = [];
    for (const e of edges) {
      e.points = [];
      let prev = e.from;
      for (let c = e.from.col + 1; c < e.to.col; c++) {
        const w = { col: c, h: WAY_H, neighbors: [prev] };
        prev.neighbors.push(w);
        waypoints.push(w);
        e.points.push(w);
        prev = w;
      }
      prev.neighbors.push(e.to);
      e.to.neighbors.push(prev);
    }
    const all = [...nodes, ...waypoints];
    const columns = Array.from({ length: colCount }, (_, c) => all.filter(n => n.col === c));
    return { nodes, edges, columns, all };
  }

  // Places the items of one column (nodes and waypoints, y = centre) as close as possible to their desired centres
  // without overlap; clusters of overlapping items are placed at the mean of their desired positions.
  function resolveColumn(col) {
    const items = col.slice().sort((a, b) => a.want - b.want || a.order - b.order);
    const clusters = [];
    for (const it of items) {
      clusters.push({ items: [it], sum: it.want - it.h / 2, count: 1, size: it.h, top: it.want - it.h / 2 });
      while (clusters.length > 1) {
        const b = clusters[clusters.length - 1], a = clusters[clusters.length - 2];
        if (a.top + a.size + ROW_GAP <= b.top) break;
        clusters.pop();
        for (const x of b.items) {
          const offset = a.size + ROW_GAP;
          a.items.push(x);
          a.sum += x.want - x.h / 2 - offset;
          a.count++;
          a.size = offset + x.h;
        }
        a.top = a.sum / a.count;
      }
    }
    for (const c of clusters) {
      let top = c.top;
      for (const x of c.items) { x.y = top + x.h / 2; top += x.h + ROW_GAP; }
    }
    items.forEach((x, i) => { x.order = i; });
  }

  // Repeatedly moves every item towards the mean height of its neighbours. Afterwards cy is the centre and
  // y the top edge of an item.
  function layout(model) {
    const { columns, all } = model;
    columns.forEach(col => {
      let top = 0;
      col.forEach((n, i) => { n.order = i; n.y = top + n.h / 2; top += n.h + ROW_GAP; });
    });
    for (let round = 0; round < 80; round++) {
      const order = round % 2 ? columns.slice().reverse() : columns;
      for (const col of order) {
        for (const n of col) n.want = n.neighbors.reduce((s, m) => s + m.y, 0) / Math.max(1, n.neighbors.length);
        resolveColumn(col);
      }
    }
    const minY = Math.min(...all.map(n => n.y - n.h / 2));
    all.forEach(n => {
      n.cy = Math.round(n.y - minY + PAD);
      n.y = n.cy - n.h / 2;
      n.x = PAD + n.col * (NODE_W + COL_GAP);
    });
  }

  // Tooltip of an arrow: the whole proof of its target.
  function tooltip(e) {
    const plain = html => html.replace(/<sup>/g, "^").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    const premises = e.to.proof.premises.map(id => e.all.get(id).name).join(" und ");
    return [
      `${e.from.name} → ${e.to.name}`,
      `Beweis von „${e.to.name}“ aus ${premises}`,
      `Art der Methode: ${e.type.name}`,
      `Methode: ${plain(e.method)}`,
    ].join("\n");
  }

  function renderTex(target, tex) {
    // Inline mode with \displaystyle: the rendered span then has the true width of the formula.
    if (window.katex) katex.render("\\displaystyle " + tex, target, { throwOnError: false });
    else target.textContent = tex;
  }

  // Renders all formulas once off screen so that the KaTeX fonts are requested, then draws the graph
  // after the fonts have loaded; otherwise the formulas would be measured with a fallback font.
  // Pan by dragging and zoom with the mouse wheel around the pointer; buttons with data-zoom next to the frame.
  // The state lives here so that a redraw (other starting point) keeps the listeners and only refits the view.
  const view = { scale: 1, tx: 0, ty: 0, width: 0, height: 0, surface: null, frame: null, drag: null, moved: false };
  const MIN_ZOOM = 0.1, MAX_ZOOM = 3;

  function applyView() {
    view.surface.style.transform = `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`;
  }

  function fitView() {
    const r = view.frame.getBoundingClientRect();
    view.scale = Math.min(1, (r.width - 20) / view.width, (r.height - 20) / view.height);
    view.tx = (r.width - view.width * view.scale) / 2;
    view.ty = (r.height - view.height * view.scale) / 2;
    applyView();
  }

  function zoomAt(factor, cx, cy) {
    const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.scale * factor));
    view.tx = cx - (cx - view.tx) * s / view.scale;
    view.ty = cy - (cy - view.ty) * s / view.scale;
    view.scale = s;
    applyView();
  }

  function panZoom(surface, width, height) {
    Object.assign(view, { surface, width, height });
    if (!view.frame) {
      const frame = view.frame = surface.parentElement;
      frame.addEventListener("wheel", ev => {
        ev.preventDefault();
        const r = frame.getBoundingClientRect();
        zoomAt(Math.exp(-ev.deltaY * 0.0015), ev.clientX - r.left, ev.clientY - r.top);
      }, { passive: false });
      frame.addEventListener("pointerdown", ev => {
        if (ev.button !== 0 || ev.target.closest(".legende")) return;
        view.drag = { x: ev.clientX, y: ev.clientY, tx: view.tx, ty: view.ty };
        view.moved = false;
      });
      window.addEventListener("pointermove", ev => {
        if (!view.drag) return;
        const dx = ev.clientX - view.drag.x, dy = ev.clientY - view.drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) { view.moved = true; frame.classList.add("zieht"); }
        if (!view.moved) return;
        view.tx = view.drag.tx + dx;
        view.ty = view.drag.ty + dy;
        applyView();
      });
      window.addEventListener("pointerup", () => { view.drag = null; frame.classList.remove("zieht"); });
      // A drag must not count as a click on the node where it ended.
      frame.addEventListener("click", ev => {
        if (view.moved) { ev.stopPropagation(); view.moved = false; }
      }, true);
      document.querySelectorAll("[data-zoom]").forEach(b => b.addEventListener("click", () => {
        const r = frame.getBoundingClientRect();
        if (b.dataset.zoom === "fit") fitView();
        else if (b.dataset.zoom === "1") zoomAt(1 / view.scale, r.width / 2, r.height / 2);
        else zoomAt(b.dataset.zoom === "in" ? 1.25 : 0.8, r.width / 2, r.height / 2);
      }));
    }
    fitView();
  }

  function draw(container, onSelect, proofOf) {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute; left:-9999px; top:0; visibility:hidden";
    for (const f of [...TABLEAU.functions, ...TABLEAU.formulas]) {
      const span = document.createElement("span");
      renderTex(span, f.compactFormula || f.formula);
      probe.appendChild(span);
    }
    document.body.appendChild(probe);
    void probe.offsetWidth;
    document.fonts.ready.then(() => {
      probe.remove();
      drawGraph(container, onSelect, proofOf);
    });
  }

  function drawGraph(container, onSelect, proofOf) {
    const model = buildModel(proofOf);
    layout(model);
    const { nodes, edges, columns, all } = model;
    const width = PAD * 2 + columns.length * NODE_W + (columns.length - 1) * COL_GAP;
    const height = Math.max(...all.map(n => n.y + n.h)) + PAD;
    container.innerHTML = "";
    Object.assign(container.style, { width: width + "px", height: height + "px" });

    // Nodes: name and formula, the formula scaled down until it fits.
    for (const n of nodes) {
      const box = document.createElement("div");
      box.className = "gknoten" + (n.kind === "function" ? " funktion" : "") + (n.definition ? " definition" : "");
      Object.assign(box.style, { left: n.x + "px", top: n.y + "px", width: NODE_W + "px", height: NODE_H + "px" });
      const name = document.createElement("div");
      name.className = "gname";
      name.textContent = n.name;
      name.title = n.name;
      box.appendChild(name);
      const area = document.createElement("div");
      area.className = "gformel";
      const span = document.createElement("span");
      area.appendChild(span);
      box.appendChild(area);
      container.appendChild(box);
      renderTex(span, n.compactFormula || n.formula);
      const s = Math.min(1, (NODE_W - 10) / span.offsetWidth, (NODE_H - HEAD_H - 6) / span.offsetHeight);
      span.style.transform = `translate(-50%, -50%) scale(${s})`;
      box.addEventListener("mouseenter", () => mark(n, true));
      box.addEventListener("mouseleave", () => mark(n, false));
      box.addEventListener("click", () => onSelect(n.id));
      n.box = box;
    }

    // Arrows with the short name of the method near the target.
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.innerHTML = `<defs>
      <marker id="gpfeil" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#8f8577"/></marker>
      <marker id="gpfeil-f" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#b5541f"/></marker></defs>`;
    for (const e of edges) {
      // Curves in the gaps between columns, straight through the waypoints.
      let x = e.from.x + NODE_W, y = e.from.cy, d = `M${x},${y}`;
      const curveTo = (x2, y2) => {
        const dx = (x2 - x) / 2;
        d += ` C${x + dx},${y} ${x2 - dx},${y2} ${x2},${y2}`;
        x = x2; y = y2;
      };
      for (const w of e.points) {
        curveTo(w.x, w.cy);
        d += ` L${w.x + NODE_W},${w.cy}`;
        x = w.x + NODE_W;
      }
      curveTo(e.to.x - 2, e.to.cy);
      const fromFunction = e.from.kind === "function";
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "gkante" + (fromFunction ? " vonfunktion" : ""));
      const p = document.createElementNS(NS, "path");
      p.setAttribute("marker-end", fromFunction ? "url(#gpfeil-f)" : "url(#gpfeil)");
      p.setAttribute("d", d);
      g.appendChild(p);
      // A wide invisible copy of the path makes the arrow easy to hover.
      const hit = document.createElementNS(NS, "path");
      hit.setAttribute("class", "treffer");
      hit.setAttribute("d", d);
      g.appendChild(hit);
      const title = document.createElementNS(NS, "title");
      title.textContent = tooltip(e);
      g.appendChild(title);
      svg.appendChild(g);
      e.path = g;
    }
    container.insertBefore(svg, container.firstChild);
    panZoom(container, width, height);

    function mark(n, on) {
      for (const e of edges) if (e.from === n || e.to === n) {
        e.path.classList.toggle("markiert", on);
        (e.from === n ? e.to : e.from).box.classList.toggle("markiert", on);
      }
    }
  }

  return { draw, fit: () => { if (view.frame) fitView(); } };
})();
