// Variant E of the sketch graphs/skizzen/area-layouts.html (since 5 November 2026 also the layout E2 of graphs/areas.html) (todo B92, 4 November 2026): the plane is cut into cells
// without gaps, "method B" of materials/layout-gefaerbter-graphen.md, specification in
// reports/2026-11-04 Gebietsgraph Zellen Verfahren B/spec.md.
//   1. start positions of the units (given by the caller: force-directed with weak cohesion of the groups)
//   2. hexagonal grid: the k·U cells nearest to the centre (a disk with about N cells); every unit gets the same number k
//      of cells, at least 3 (user, 4 November 2026: the size of a point must not influence its place; this goes before
//      the specification, which asked for numbers proportional to r²)
//   3. assignment in two stages, each a transportation problem solved exactly (greedy start, then cancelling negative
//      cycles with Bellman-Ford): cells -> units (cost: squared distance to the start position), which gives the region
//      of every group; the groups made connected (main component: the one at the hub of the group); then the cells of
//      each group -> its units again
//   4. connectedness: a cell of a side component is handed on along a chain of neighbouring labels until a cell at the
//      border of the main component comes back; the numbers of cells stay the same
//   5. shape: swaps of two neighbouring cells of different units (simulated annealing with a fixed seed); energy
//      E = Σ_pairs w·|centroid(a) − centroid(b)|² / Σ w + λ·(length of the borders between groups)
//        + λ′·(length of the borders between units of the same group);
//      a swap is allowed only if every unit and group touched stays connected (simple point test on the hexagonal
//      grid) and no group gets an aspect ratio ρ = √(μ₁/μ₂) above ρmax (or above its present value, if that is larger)
//   6. result: position of a unit = centroid of its cells
// Classic script without dependencies (pages are opened over file://); in Node: require("./area-cells.js").
(function (root) {
  "use strict";
  const SQ3 = Math.sqrt(3);
  // axial directions in cyclic order: consecutive directions are neighbours of each other
  const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const DV = DIRS.map(([q, r]) => ({ x: q + r / 2, y: (SQ3 / 2) * r }));

  // deterministic random numbers (mulberry32)
  function random(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // hexagonal grid (distance of neighbouring centres 1): exactly the N cells nearest to the centre (a disk; equal
  // distances in a fixed order)
  // aspect (E4, user, 5 November 2026): an ellipse with the axes in the ratio aspect : 1 (wide) and the same area
  // instead of the disk; distance x²/aspect + y²·aspect
  function hexDisk(N, aspect = 1) {
    const R0 = Math.sqrt((N * SQ3) / 2 / Math.PI) + 2;
    const all = [];
    const m = Math.ceil(R0 / (SQ3 / 2)) + 2;
    for (let r = -m; r <= m; r++) for (let q = -2 * m; q <= 2 * m; q++) {
      const x = q + r / 2, y = (SQ3 / 2) * r;
      all.push({ q, r, x, y, d: Math.round((x * x / aspect + y * y * aspect) * 1e6) });
    }
    all.sort((a, b) => a.d - b.d || a.r - b.r || a.q - b.q);
    const cells = all.slice(0, N).sort((a, b) => a.r - b.r || a.q - b.q).map(({ q, r, x, y }) => ({ q, r, x, y })), index = new Map();
    cells.forEach((c, i) => index.set(c.q + "," + c.r, i));
    const R = Math.sqrt(Math.max(...cells.map((c) => c.x * c.x / aspect + c.y * c.y * aspect))) + 0.5;
    const nb = cells.map((c) => DIRS.map(([dq, dr]) => { const i = index.get(c.q + dq + "," + (c.r + dr)); return i === undefined ? -1 : i; }));
    return { cells, nb, R, index };
  }

  // numbers of cells proportional to the weights, at least `min`, sum M (largest remainder)
  function quotas(weights, M, min) {
    const U = weights.length, W = weights.reduce((a, b) => a + b, 0);
    if (min * U > M) throw new Error("too few cells for the minimum per unit");
    const raw = weights.map((w) => (M * w) / W);
    const q = raw.map((x) => Math.max(min, Math.floor(x)));
    let s = q.reduce((a, b) => a + b, 0);
    while (s < M) { let best = -1; for (let i = 0; i < U; i++) if (best < 0 || raw[i] - q[i] > raw[best] - q[best]) best = i; q[best]++; s++; }
    while (s > M) { let best = -1; for (let i = 0; i < U; i++) if (q[i] > min && (best < 0 || raw[i] - q[i] < raw[best] - q[best])) best = i; q[best]--; s--; }
    return q;
  }

  // transportation problem: every cell of `cs` to one target, target t takes exactly cap[t] cells, sum of cost minimal.
  // Greedy start (all pairs by cost), then cancelling negative cycles in the graph of the targets: an edge t -> s has the
  // cheapest change of cost of moving one cell from t to s. Without negative cycle the assignment is optimal.
  function transport(cs, T, cap, cost) {
    const n = cs.length;
    const C = cs.map((c) => { const row = new Float64Array(T); for (let t = 0; t < T; t++) row[t] = cost(c, t); return row; });
    const assign = new Int32Array(n).fill(-1), left = cap.slice();
    const order = [];
    for (let i = 0; i < n; i++) for (let t = 0; t < T; t++) order.push(i * T + t);
    order.sort((a, b) => C[(a / T) | 0][a % T] - C[(b / T) | 0][b % T] || a - b);
    for (const k of order) { const i = (k / T) | 0, t = k % T; if (assign[i] < 0 && left[t] > 0) { assign[i] = t; left[t]--; } }
    const members = Array.from({ length: T }, () => []);
    for (let i = 0; i < n; i++) members[assign[i]].push(i);
    const W = Array.from({ length: T }, () => new Float64Array(T)), A = Array.from({ length: T }, () => new Int32Array(T));
    const row = (t) => {
      for (let s = 0; s < T; s++) {
        let best = Infinity, arg = -1;
        if (s !== t) for (const i of members[t]) { const d = C[i][s] - C[i][t]; if (d < best) { best = d; arg = i; } }
        W[t][s] = best; A[t][s] = arg;
      }
    };
    for (let t = 0; t < T; t++) row(t);
    let cancelled = 0;
    const dist = new Float64Array(T), pred = new Int32Array(T);
    for (; cancelled < 50000; cancelled++) {
      dist.fill(0); pred.fill(-1);
      let x = -1;
      for (let it = 0; it < T; it++) {
        x = -1;
        for (let t = 0; t < T; t++) { const Wt = W[t], dt = dist[t]; for (let s = 0; s < T; s++) if (dt + Wt[s] < dist[s] - 1e-9) { dist[s] = dt + Wt[s]; pred[s] = t; x = s; } }
        if (x < 0) break;
      }
      if (x < 0) break;
      for (let i = 0; i < T; i++) x = pred[x];
      const cyc = [x];
      for (let y = pred[x]; y !== x; y = pred[y]) cyc.push(y);
      cyc.reverse(); // edges cyc[k] -> cyc[k+1]
      let total = 0;
      for (let k = 0; k < cyc.length; k++) total += W[cyc[k]][cyc[(k + 1) % cyc.length]];
      if (!(total < -1e-9)) break;
      const moves = cyc.map((t, k) => [A[t][cyc[(k + 1) % cyc.length]], t, cyc[(k + 1) % cyc.length]]);
      for (const [i, t, s] of moves) { members[t].splice(members[t].indexOf(i), 1); members[s].push(i); assign[i] = s; }
      for (const t of cyc) row(t);
    }
    return { assign, cancelled };
  }

  // components of the cells of every label inside a domain (mask); returns, per label, a list of components (arrays of
  // cells), the largest first
  function components(lab, nb, domain, cellsOf) {
    const seen = new Uint8Array(lab.length), out = new Map();
    for (const [L, list] of cellsOf) {
      const comps = [];
      for (const c of list) {
        if (seen[c]) continue;
        const comp = [c]; seen[c] = 1;
        for (let k = 0; k < comp.length; k++) for (const d of nb[comp[k]]) if (d >= 0 && !seen[d] && domain[d] && lab[d] === L) { seen[d] = 1; comp.push(d); }
        comps.push(comp);
      }
      comps.sort((a, b) => b.length - a.length || Math.min(...a) - Math.min(...b));
      out.set(L, comps);
    }
    return out;
  }
  const cellsByLabel = (lab, domainCells) => {
    const m = new Map();
    for (const c of domainCells) { if (!m.has(lab[c])) m.set(lab[c], []); m.get(lab[c]).push(c); }
    return new Map([...m].sort((a, b) => a[0] - b[0]));
  };
  // removing c from label L keeps the cells of L around c connected: the neighbours with label L form one arc
  function simple(c, L, lab, nb, domain) {
    let runs = 0, all = true;
    const s = nb[c].map((d) => d >= 0 && domain[d] && lab[d] === L);
    for (let k = 0; k < 6; k++) { if (s[k] && !s[(k + 5) % 6]) runs++; if (!s[k]) all = false; }
    return runs === 1 || all;
  }

  // makes every label connected inside the domain; the numbers of cells per label stay the same. A cell c of a side
  // component of label X goes to a neighbouring label Y1, Y1 hands a cell on to Y2 ... and the last one hands a cell
  // next to the main component of X to X (shortest chain in the graph of neighbouring labels).
  // anchors (optional): Map label -> cell; the component containing this cell counts as the main component of the label
  // (instead of the largest one)
  function repair(lab, nb, domainCells, domain, cellsXY, anchors, limit) {
    let rounds = 0;
    for (; rounds < (limit || 20) * domainCells.length; rounds++) {
      const byL = cellsByLabel(lab, domainCells);
      const comps = components(lab, nb, domain, byL);
      if (anchors) for (const [L, cs] of comps) {
        const k = anchors.has(L) ? cs.findIndex((comp) => comp.includes(anchors.get(L))) : -1;
        if (k > 0) cs.unshift(cs.splice(k, 1)[0]);
      }
      let X = -1, S = null;
      for (const [L, cs] of comps) if (cs.length > 1) { const side = cs[cs.length - 1]; if (!S || side.length < S.length) { X = L; S = side; } }
      if (!S) break;
      const main = new Set(comps.get(X)[0]);
      // the cell of the side component nearest to the main component
      const mc = comps.get(X)[0];
      const mx = mc.reduce((a, c) => a + cellsXY[c].x, 0) / mc.length, my = mc.reduce((a, c) => a + cellsXY[c].y, 0) / mc.length;
      // only cells at the border of the side component (with a neighbour of another label in the domain)
      const edge = S.filter((d) => nb[d].some((e) => e >= 0 && domain[e] && lab[e] !== X));
      const c = edge.sort((a, b) => Math.hypot(cellsXY[a].x - mx, cellsXY[a].y - my) - Math.hypot(cellsXY[b].x - mx, cellsXY[b].y - my) || a - b)[0];
      // no cell of the side component touches another label in the domain (the domain itself is split, possible with
      // grids of other shapes, opt.grid): nothing can be handed on; stop (never happens with the disk of the map)
      if (c === undefined) break;
      // graph of neighbouring labels (without X)
      const adj = new Map();
      for (const d of domainCells) for (const e of nb[d]) if (e >= 0 && domain[e] && lab[e] !== lab[d] && lab[d] !== X && lab[e] !== X) {
        if (!adj.has(lab[d])) adj.set(lab[d], new Set());
        adj.get(lab[d]).add(lab[e]);
      }
      const sources = [...new Set(nb[c].filter((d) => d >= 0 && domain[d] && lab[d] !== X).map((d) => lab[d]))].sort((a, b) => a - b);
      const targets = new Set();
      for (const m of main) for (const d of nb[m]) if (d >= 0 && domain[d] && lab[d] !== X) targets.add(lab[d]);
      const prev = new Map(sources.map((s) => [s, null]));
      const queue = sources.slice();
      let end = queue.find((s) => targets.has(s));
      for (let k = 0; end === undefined && k < queue.length; k++) {
        for (const z of [...(adj.get(queue[k]) || [])].sort((a, b) => a - b)) if (!prev.has(z)) {
          prev.set(z, queue[k]); queue.push(z);
          if (targets.has(z)) { end = z; break; }
        }
      }
      const chain = [];
      if (end === undefined) {
        // no chain around X (X separates the other labels): the cell goes to a label next to the main component, which
        // hands a cell next to the main component to X; that label is repaired in a later round
        if (!targets.size) break;
        chain.push([...targets].sort((a, b) => a - b)[0]);
      } else for (let y = end; y !== null; y = prev.get(y)) chain.unshift(y);
      lab[c] = chain[0];
      for (let i = 0; i < chain.length; i++) {
        const Y = chain[i], recv = i + 1 < chain.length ? chain[i + 1] : X;
        const near = (d) => nb[d].some((e) => e >= 0 && domain[e] && (recv === X ? main.has(e) : lab[e] === recv));
        const cand = domainCells.filter((d) => lab[d] === Y && near(d));
        cand.sort((a, b) => (simple(b, Y, lab, nb, domain) - simple(a, Y, lab, nb, domain)) ||
          Math.hypot(cellsXY[a].x - cellsXY[c].x, cellsXY[a].y - cellsXY[c].y) - Math.hypot(cellsXY[b].x - cellsXY[c].x, cellsXY[b].y - cellsXY[c].y) || a - b);
        lab[cand[0]] = recv;
      }
    }
    return rounds;
  }

  // groups grown from seeds (default of stage 1): every group starts at the cell nearest to its hub (the unit with the
  // largest total pair weight; for the logic group set theory) and takes, among the free cells next to it, always the
  // cheapest (cost: squared distance to the nearest unit of the group), all groups together in the order of the cost,
  // until it has its number of cells. A region is connected by construction; it grows along falling costs towards its
  // other units, so a group may become long. Free cells left at the end (enclosed by full groups) go to a neighbouring
  // group; the numbers are then made right by repair() and balance().
  // compact: a free cell is the cheaper the more of its neighbours already belong to the group (cost − compact · number
  // of such neighbours), so that a region grows broad and not as a thin corridor
  // domain (optional mask): only these cells are given out; the others keep the label -2
  function grow(cells, nb, seeds, cap, cost, nearestCell, compact, domain) {
    const M = cells.length, lab = new Int32Array(M).fill(-1), left = cap.slice();
    if (domain) for (let c = 0; c < M; c++) if (!domain[c]) lab[c] = -2;
    const heap = [];
    const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (a[1] === b[1] && a[2] < b[2])));
    const push = (x) => { heap.push(x); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } } return top; };
    const taken = new Set();
    for (let c = 0; c < M; c++) if (lab[c] === -2) taken.add(c);
    seeds.forEach((p, g) => { const c = nearestCell(p, taken); taken.add(c); push([-Infinity, c, g]); });
    while (heap.length) {
      const [, c, g] = pop();
      if (lab[c] >= 0 || left[g] <= 0) continue;
      lab[c] = g; left[g]--;
      for (const d of nb[c]) if (d >= 0 && lab[d] === -1) push([cost(cells[d], g) - compact * nb[d].filter((e) => e >= 0 && lab[e] === g).length, d, g]);
    }
    // enclosed free cells: to a neighbouring group, repeatedly
    for (let changed = true; changed;) {
      changed = false;
      for (let c = 0; c < M; c++) if (lab[c] === -1) { const d = nb[c].find((e) => e >= 0 && lab[e] >= 0); if (d !== undefined) { lab[c] = lab[d]; changed = true; } }
    }
    return lab;
  }
  // numbers of cells per label made right: a label with too many cells hands one on along a chain of neighbouring
  // labels to a label with too few (each step a simple cell at the border towards the next label)
  function balance(lab, nb, domainCells, domain, cap, cellsXY) {
    let moves = 0;
    for (let guard = 0; guard < 10 * domainCells.length; guard++) {
      const count = new Map(); domainCells.forEach((c) => count.set(lab[c], (count.get(lab[c]) || 0) + 1));
      const over = [...count.keys()].filter((L) => count.get(L) > cap[L]).sort((a, b) => a - b), under = new Set([...cap.keys()].filter((L) => (count.get(L) || 0) < cap[L]));
      if (!over.length) break;
      const X = over[0];
      const adj = new Map();
      for (const d of domainCells) for (const e of nb[d]) if (e >= 0 && domain[e] && lab[e] !== lab[d]) { if (!adj.has(lab[d])) adj.set(lab[d], new Set()); adj.get(lab[d]).add(lab[e]); }
      const prev = new Map([[X, null]]), queue = [X];
      let end;
      for (let k = 0; end === undefined && k < queue.length; k++) for (const z of [...(adj.get(queue[k]) || [])].sort((a, b) => a - b)) if (!prev.has(z)) { prev.set(z, queue[k]); queue.push(z); if (under.has(z)) { end = z; break; } }
      if (end === undefined) break;
      const chain = []; for (let y = end; y !== null; y = prev.get(y)) chain.unshift(y);
      for (let i = 0; i + 1 < chain.length; i++) {
        const Y = chain[i], Z = chain[i + 1];
        const cand = domainCells.filter((d) => lab[d] === Y && nb[d].some((e) => e >= 0 && domain[e] && lab[e] === Z));
        cand.sort((a, b) => (simple(b, Y, lab, nb, domain) - simple(a, Y, lab, nb, domain)) || a - b);
        lab[cand[0]] = Z; moves++;
      }
    }
    return moves;
  }

  // Convexity of a group on the grid (E2): κ = number of its cells / number of all cells whose centre lies in the convex
  // hull of its cells, as kappaGrid. The hull is taken over the boundary cells; the cells in the hull are counted row by
  // row of the grid. kappa(labels, g, list, extra, skip): `list` are the cells of g, `skip` left out, `extra` added.
  function kappaTools(cells, nb) {
    const rowX = new Map();
    cells.forEach((c) => { if (!rowX.has(c.y)) rowX.set(c.y, []); rowX.get(c.y).push(c.x); });
    rowX.forEach((xs) => xs.sort((p, q) => p - q));
    const rowYs = [...rowX.keys()].sort((p, q) => p - q);
    const countIn = (xs, lo, hi) => { let i = 0, j = xs.length; while (i < j) { const m = (i + j) >> 1; if (xs[m] < lo) i = m + 1; else j = m; } let k = i; j = xs.length; while (k < j) { const m = (k + j) >> 1; if (xs[m] <= hi) k = m + 1; else j = m; } return k - i; };
    const hull = (pts) => {
      const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
      if (p.length < 3) return p;
      const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
      const lo = [], up = [];
      for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    };
    const inside = (H, q) => { if (H.length < 3) return false; for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length]; if ((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x) < -1e-9) return false; } return true; };
    // cells ranked by x, then y: a hull of cells is found by sorting integers instead of comparing objects (speed)
    const order = cells.map((c, i) => i).sort((a, b) => cells[a].x - cells[b].x || cells[a].y - cells[b].y);
    const rank = new Int32Array(cells.length); order.forEach((c, k) => { rank[c] = k; });
    const buf = new Int32Array(cells.length);
    const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    // hull of the cells whose ranks are in buf[0..m): the vertex cells in order
    const hullRanked = (m) => {
      const ranks = buf.subarray(0, m).sort();
      const p = Array.from(ranks, (k) => order[k]);
      if (p.length < 3) return p;
      const lo = [], up = [];
      for (const q of p) { while (lo.length >= 2 && cr(cells[lo[lo.length - 2]], cells[lo[lo.length - 1]], cells[q]) <= 0) lo.pop(); lo.push(q); }
      for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(cells[up[up.length - 2]], cells[up[up.length - 1]], cells[q]) <= 0) up.pop(); up.push(q); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    };
    // hull of group g: { verts: Set of vertex cells, poly: their points } (the hull of all cells is the hull of the boundary)
    const hullOfGroup = (labArr, g, list) => {
      let m = 0;
      for (const c of list) { const nc = nb[c]; for (let k = 0; k < 6; k++) { const d = nc[k]; if (d < 0 || labArr[d] !== g) { buf[m++] = rank[c]; break; } } }
      const hv = hullRanked(m);
      return { verts: new Set(hv), poly: hv.map((c) => cells[c]) };
    };
    const kappa = (labArr, g, list, extra, skip) => {
      let cnt = 0, m = 0;
      const visit = (c) => {
        cnt++;
        const nc = nb[c];
        for (let k = 0; k < 6; k++) { const d = nc[k]; if (d < 0 || labArr[d] !== g) { buf[m++] = rank[c]; return; } }
      };
      for (const c of list) if (c !== skip) visit(c);
      if (extra >= 0) visit(extra);
      const H = hullRanked(m).map((c) => cells[c]);
      if (H.length < 3) return 1;
      const y0 = Math.min(...H.map((p) => p.y)) - 1e-9, y1 = Math.max(...H.map((p) => p.y)) + 1e-9;
      let n = 0;
      for (const y of rowYs) {
        if (y < y0 || y > y1) continue;
        let lo = Infinity, hi = -Infinity;
        for (let i = 0; i < H.length; i++) {
          const p = H[i], q = H[(i + 1) % H.length];
          if ((p.y - y) * (q.y - y) > 1e-12) continue;
          if (Math.abs(q.y - p.y) < 1e-12) { lo = Math.min(lo, p.x, q.x); hi = Math.max(hi, p.x, q.x); continue; }
          const x = p.x + ((y - p.y) / (q.y - p.y)) * (q.x - p.x);
          lo = Math.min(lo, x); hi = Math.max(hi, x);
        }
        if (lo <= hi) n += countIn(rowX.get(y), lo - 1e-9, hi + 1e-9);
      }
      return n ? cnt / n : 1;
    };
    return { kappa, hull, inside, hullOfGroup };
  }

  // aspect ratio from moments
  function rhoOf(m) {
    if (m.n < 2) return 1;
    const mx = m.sx / m.n, my = m.sy / m.n;
    const a = m.sxx / m.n - mx * mx, b = m.syy / m.n - my * my, c = m.sxy / m.n - mx * my;
    const h = Math.sqrt(((a - b) * (a - b)) / 4 + c * c), l1 = (a + b) / 2 + h, l2 = (a + b) / 2 - h;
    return l2 <= 1e-12 ? Infinity : Math.sqrt(l1 / l2);
  }

  // units: [{ x, y, group }] (group: any key; other fields such as r are ignored), pairs: [{ a, b, w }] with indices into units
  function layout(units, pairs, opt = {}) {
    const t0 = Date.now();
    // every unit gets the same number of cells (user, 4 November 2026: the size of a point plays no part in its place)
    const N0 = opt.N || 800, lambda = opt.lambda == null ? 0.3 : opt.lambda, lambdaUnit = opt.lambdaUnit == null ? 0.06 : opt.lambdaUnit;
    const rhoMax = opt.rhoMax || 4, minCells = opt.minCells || 3, sweeps = opt.sweeps || 800;
    const U = units.length;
    const per = Math.max(minCells, Math.round(N0 / U));
    const aspect = opt.aspect || 1;
    // opt.grid (B101, 5 November 2026; optional, default: the disk or ellipse of hexDisk): a function N -> { cells, nb, R }
    // that gives a grid of N cells of any shape, e.g. a hexagonal grid cut to a polygon (skizzen/zoom-layouts-core.js)
    const grid = opt.grid ? opt.grid(per * U) : hexDisk(per * U, aspect), cells = grid.cells, nb = grid.nb, M = cells.length;
    const quota = units.map(() => per);
    // groups as indices
    const groupKeys = [...new Set(units.map((u) => u.group))];
    const gOf = units.map((u) => groupKeys.indexOf(u.group)), Gn = groupKeys.length;
    // start positions scaled into the disk: centre = weighted centre, weighted rms radius = spread · R/√2
    const W0 = quota.reduce((a, b) => a + b, 0);
    const cx0 = units.reduce((a, u, i) => a + u.x * quota[i], 0) / W0, cy0 = units.reduce((a, u, i) => a + u.y * quota[i], 0) / W0;
    const rms = Math.sqrt(units.reduce((a, u, i) => a + quota[i] * ((u.x - cx0) ** 2 + (u.y - cy0) ** 2), 0) / W0) || 1;
    const sc = ((opt.spread || 0.75) * grid.R) / Math.SQRT2 / rms;
    // in the ellipse (E4) the start positions are stretched in the same way as the frame
    // opt.startInGrid (optional): the start positions are given in the units of the grid and are taken as they are
    const P = opt.startInGrid ? units.map((u) => ({ x: u.x, y: u.y })) : units.map((u) => ({ x: (u.x - cx0) * sc * Math.sqrt(aspect), y: (u.y - cy0) * sc / Math.sqrt(aspect) }));
    const all = cells.map((c, i) => i), full = new Uint8Array(M).fill(1);
    const d2 = (c, p) => (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
    // stage 1: cells -> units (exact, cost = squared distance to the start position); the group of a cell is the group of
    // its unit. With up to about 80 units directly; with more units cells -> groups (cost: nearest unit of the group).
    const gUnits = Array.from({ length: Gn }, (_, g) => units.map((u, i) => i).filter((i) => gOf[i] === g));
    const gCap = gUnits.map((list) => list.reduce((a, i) => a + quota[i], 0));
    const time = { start: Date.now() };
    const deg = new Float64Array(U); pairs.forEach((p) => { deg[p.a] += p.w; deg[p.b] += p.w; });
    const hubOf = gUnits.map((list) => list.slice().sort((a, b) => deg[b] - deg[a] || a - b)[0]);
    const nearestCell = (p, taken) => { let best = -1, bd = Infinity; cells.forEach((c, i) => { const d = d2(c, p); if (d < bd && !(taken && taken.has(i))) { bd = d; best = i; } }); return best; };
    const stage = opt.groupStage || "grow";
    // E′: the regions of the groups are given (convex cells of a power diagram, see convexGroups)
    const fixed = opt.fixedGroups ? opt.fixedGroups({ cells, R: grid.R, P, gUnits, gCap, Gn, pairs, gOf }) : null;
    const t1 = fixed ? { cancelled: 0, assign: fixed.glab } : stage === "grow" ? { cancelled: 0, assign: grow(cells, nb, hubOf.map((h) => P[h]), gCap, (c, g) => Math.min(...gUnits[g].map((i) => d2(c, P[i]))), nearestCell, opt.compact || 0) } :
      U <= 80 ? transport(cells, U, quota, (c, i) => d2(c, P[i])) : transport(cells, Gn, gCap, (c, g) => Math.min(...gUnits[g].map((i) => d2(c, P[i]))));
    const glab = Int32Array.from(t1.assign, (t) => (!fixed && stage !== "grow" && U <= 80 ? gOf[t] : t));
    time.groups = Date.now() - time.start;
    // main component of a group: the one at the start position of its unit with the largest total pair weight (the hub
    // of the group, for the logic group set theory), so that a group is joined to its hub and not the hub moved away
    const anchors = new Map(gUnits.map((list, g) => [g, nearestCell(P[hubOf[g]])]));
    const repG = fixed ? 0 : (balance(glab, nb, all, full, gCap, cells), repair(glab, nb, all, full, cells, opt.anchors === false ? null : anchors));
    // E2: groups below κmin after growing are improved first, on the level of the groups (before the units are placed):
    // a cell b of a neighbouring group h inside the convex hull of g and next to g goes to g, and a cell a of g next to h
    // goes to h (both groups stay connected, the numbers stay); always the pair that lowers the total shortfall of g and h
    // most (shortfall of a group in cells: max(0, κmin · cells in its hull − its cells); with equal shortfall: the one that
    // shortens the border of g most)
    const kt = kappaTools(cells, nb);
    let kappaRepair = 0, kappaChains = 0, kappaStart = null, kappaAfterRepair = null;
    if (opt.kappaMin) {
      const kMin0 = opt.kappaMin;
      const lists = () => { const L = Array.from({ length: Gn }, () => []); for (let c = 0; c < M; c++) L[glab[c]].push(c); return L; };
      let L = lists();
      kappaStart = L.map((list, g) => kt.kappa(glab, g, list, -1, -1));
      for (let guard = 0; guard < 2 * M; guard++) {
        const kap = L.map((list, g) => kt.kappa(glab, g, list, -1, -1));
        const low = kap.map((k, g) => [k, g]).filter(([k]) => k < kMin0).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
        if (!low.length) break;
        let best = null;
        for (const [k0, g] of low) {
          const HG = kt.hullOfGroup(glab, g, L[g]), H = HG.poly;
          const B = all.filter((c) => glab[c] !== g && nb[c].some((d) => d >= 0 && glab[d] === g) && kt.inside(H, cells[c]) && simple(c, glab[c], glab, nb, full));
          for (const bb of B) {
            const h = glab[bb];
            glab[bb] = g;
            for (const aa of L[g]) {
              if (aa === bb || !nb[aa].some((d) => d >= 0 && d !== bb && glab[d] === h) || !simple(aa, g, glab, nb, full)) continue;
              // border of g before and after (edges to other groups and to the rim, around aa and bb)
              const per = () => { let e = 0; for (const c of [aa, bb]) for (const d of nb[c]) if ((c === aa || d !== aa) && ((glab[c] === g) !== (d >= 0 && glab[d] === g))) e++; return e; };
              glab[bb] = h; const p0 = per(); glab[bb] = g;
              glab[aa] = h;
              const p1 = per();
              const short = (k, gg) => Math.max(0, (kMin0 * gCap[gg]) / k - gCap[gg]);
              // bb lies in the hull of g; if aa is not a vertex of it, the hull and the number of cells of g stay, so κ stays
              const kg = HG.verts.has(aa) ? kt.kappa(glab, g, L[g], bb, aa) : k0;
              // the gain cannot exceed this bound (κ of h at best unchanged below κmin): skip the second κ if it cannot win
              if (best && short(k0, g) + short(kap[h], h) - short(kg, g) < best.key[0] - 1e-12) { glab[aa] = g; continue; }
              const kh = kt.kappa(glab, h, L[h], aa, bb);
              glab[aa] = g;
              // progress: the total shortfall Σ max(0, κmin − κ) of the two groups gets smaller, or it stays and the
              // border of g gets shorter
              const gain = short(k0, g) + short(kap[h], h) - short(kg, g) - short(kh, h);
              if (gain < -1e-12 || (gain <= 1e-12 && p1 >= p0)) continue;
              const key = [gain, p0 - p1];
              if (!best || key[0] > best.key[0] + 1e-12 || (Math.abs(key[0] - best.key[0]) <= 1e-12 && key[1] > best.key[1])) best = { key, aa, bb, g, h };
            }
            glab[bb] = h;
          }
          if (best) break;
        }
        if (best) { glab[best.bb] = best.g; glab[best.aa] = best.h; kappaRepair++; L = lists(); continue; }
        kappaChains++;
        // no pair helps: a cell b next to g goes to g, a border cell a of g goes to any other neighbouring group, and the
        // numbers are made right along a chain of neighbouring groups (balance); kept if every group stays connected and
        // the total shortfall of all groups gets smaller
        const shortAll = (lab0) => { const LL = Array.from({ length: Gn }, () => []); for (let c = 0; c < M; c++) LL[lab0[c]].push(c); return LL.reduce((t, list, gg) => t + Math.max(0, (kMin0 * gCap[gg]) / kt.kappa(lab0, gg, list, -1, -1) - gCap[gg]), 0); };
        const s0 = shortAll(glab);
        let bestLab = null, bestS = s0 - 1e-9;
        for (const [, g] of low) {
          const B = all.filter((c) => glab[c] !== g && nb[c].some((d) => d >= 0 && glab[d] === g) && simple(c, glab[c], glab, nb, full));
          const A = L[g].filter((c) => nb[c].some((d) => d >= 0 && glab[d] !== g));
          for (const bb of B) for (const aa of A) {
            const h2s = [...new Set(nb[aa].filter((d) => d >= 0 && d !== bb && glab[d] !== g).map((d) => glab[d]))].sort((x, y) => x - y);
            for (const h2 of h2s) {
              if (h2 === glab[bb]) continue; // already tried as a pair
              const T = Int32Array.from(glab);
              T[bb] = g;
              if (!simple(aa, g, T, nb, full)) continue;
              T[aa] = h2;
              balance(T, nb, all, full, gCap, cells);
              const comps = components(T, nb, full, cellsByLabel(T, all));
              if ([...comps.values()].some((cs) => cs.length !== 1)) continue;
              const sNew = shortAll(T);
              if (sNew < bestS) { bestS = sNew; bestLab = T; }
            }
          }
          if (bestLab) break;
        }
        if (!bestLab) break;
        glab.set(bestLab); kappaRepair++; L = lists();
      }
      kappaAfterRepair = L.map((list, g) => kt.kappa(glab, g, list, -1, -1));
    }
    time.repairGroups = Date.now() - time.start - time.groups;
    // stage 2: the cells of each group -> its units
    const lab = new Int32Array(M);
    let cancelled = t1.cancelled, repU = 0;
    const unitWays = [];
    for (let g = 0; g < Gn; g++) {
      const cs = all.filter((c) => glab[c] === g), us = gUnits[g];
      const dom = new Uint8Array(M); cs.forEach((c) => { dom[c] = 1; });
      const caps = us.map((i) => quota[i]);
      // several ways in a fixed order; the first that leaves every unit of the group connected is kept (otherwise the one
      // with the fewest components): optimal assignment (transportation problem), or units grown from their start cells
      const tries = [["transport"], ["grow", 2], ["grow", 0], ["grow", 6]];
      let best = null;
      for (const [how, compactUnits] of tries) {
        const L = Int32Array.from(lab);
        if (how === "grow") {
          const loc = grow(cells, nb, us.map((i) => P[i]), caps, (c, k) => d2(c, P[us[k]]), nearestCell, compactUnits, dom);
          cs.forEach((c) => { L[c] = loc[c]; });
          balance(L, nb, cs, dom, caps, cells);
          cs.forEach((c) => { L[c] = us[L[c]]; });
        } else {
          const t2 = transport(cs.map((c) => cells[c]), us.length, caps, (c, k) => d2(c, P[us[k]]));
          cancelled += t2.cancelled;
          cs.forEach((c, k) => { L[c] = us[t2.assign[k]]; });
        }
        const rr = repair(L, nb, cs, dom, cells, null, 4);
        repU += rr;
        const pieces = [...components(L, nb, dom, cellsByLabel(L, cs)).values()].reduce((a, x) => a + x.length, 0) - us.length;
        if (!best || pieces < best.pieces) best = { L, pieces, how: how + (how === "grow" ? " " + compactUnits : "") };
        if (!pieces) break;
      }
      cs.forEach((c) => { lab[c] = best.L[c]; });
      unitWays.push(best.how);
    }
    time.units = Date.now() - time.start - time.groups - time.repairGroups;
    // stage 3: shape by swaps of neighbouring cells
    const G = new Int32Array(M); for (let c = 0; c < M; c++) G[c] = gOf[lab[c]];
    const n = new Float64Array(U), sx = new Float64Array(U), sy = new Float64Array(U);
    for (let c = 0; c < M; c++) { const u = lab[c]; n[u]++; sx[u] += cells[c].x; sy[u] += cells[c].y; }
    const gm = Array.from({ length: Gn }, () => ({ n: 0, sx: 0, sy: 0, sxx: 0, syy: 0, sxy: 0 }));
    const addM = (m, c, s) => { const p = cells[c]; m.n += s; m.sx += s * p.x; m.sy += s * p.y; m.sxx += s * p.x * p.x; m.syy += s * p.y * p.y; m.sxy += s * p.x * p.y; };
    for (let c = 0; c < M; c++) addM(gm[G[c]], c, 1);
    const pw = pairs.reduce((a, p) => a + p.w, 0) || 1;
    const pairsOf = Array.from({ length: U }, () => []);
    pairs.forEach((p) => { if (p.a === p.b) return; pairsOf[p.a].push([p.b, p.w / pw]); pairsOf[p.b].push([p.a, p.w / pw]); });
    const pairTerm = (u, ux, uy, v, vx, vy) => {
      // change of the pair term when the centroids of u and v move to (ux, uy) and (vx, vy)
      let d = 0;
      const cur = (i) => [sx[i] / n[i], sy[i] / n[i]];
      for (const [z, w] of pairsOf[u]) {
        const [zx, zy] = z === v ? [vx, vy] : cur(z), [ox, oy] = cur(u), [px, py] = cur(z);
        d += w * ((ux - zx) ** 2 + (uy - zy) ** 2 - (ox - px) ** 2 - (oy - py) ** 2);
      }
      for (const [z, w] of pairsOf[v]) {
        if (z === u) continue;
        const [zx, zy] = cur(z), [ox, oy] = cur(v);
        d += w * ((vx - zx) ** 2 + (vy - zy) ** 2 - (ox - zx) ** 2 - (oy - zy) ** 2);
      }
      return d;
    };
    const border = (a, b) => {
      let s = 0;
      for (const c of [a, b]) for (const d of nb[c]) {
        if (d < 0 || (c === b && d === a)) continue;
        if (lab[c] !== lab[d]) s += G[c] !== G[d] ? lambda : lambdaUnit;
      }
      return s;
    };
    const rnd = random(opt.seed || 12345);
    const steps = sweeps * M;
    let T = 0, T1 = 0, accepted = 0, tried = 0;
    const sample = [];
    // cells of every unit (for the swaps at a distance)
    const cellsOf = Array.from({ length: U }, () => []), slot = new Int32Array(M);
    for (let c = 0; c < M; c++) { slot[c] = cellsOf[lab[c]].length; cellsOf[lab[c]].push(c); }
    const has = (c, arr, L, not) => nb[c].some((e) => e >= 0 && e !== not && arr[e] === L);
    // swap of cell a (unit u) and cell b (unit v): a goes to v, b to u. The cells need not be neighbours: a lies at the
    // border towards v, b at the border towards u. Tested in the order of the change: u without a and v with a connected,
    // then v without b and u with b (simple point tests on the hexagonal grid), for units and, if they differ, groups.
    const swapTest = (a, b, arr, L1, L2) => {
      if (!simple(a, L1, arr, nb, full) || !has(a, arr, L2, b)) return false;
      arr[a] = L2;
      const ok = simple(b, L2, arr, nb, full) && has(b, arr, L1, a);
      arr[a] = L1;
      return ok;
    };
    // E2 (opt.kappaMin): κ of every group at least kMin (see kappaTools); swaps must keep it (below)
    const kMin = opt.kappaMin || 0;
    const gCells = Array.from({ length: Gn }, () => []), gSlot = new Int32Array(M);
    let kappaG = null, kOld = null, gHull = null;
    const kappaPenalty = opt.kappaPenalty == null ? 1 : opt.kappaPenalty;
    if (kMin) {
      for (let c = 0; c < M; c++) { gSlot[c] = gCells[G[c]].length; gCells[G[c]].push(c); }
      kappaG = (g, extra, skip) => kt.kappa(G, g, gCells[g], extra, skip);
      kOld = Array.from({ length: Gn }, (_, g) => kappaG(g, -1, -1));
      gHull = Array.from({ length: Gn }, (_, g) => kt.hullOfGroup(G, g, gCells[g]));
    }
    const one = (a, b) => {
      if (b < 0 || a === b) return null;
      const u = lab[a], v = lab[b];
      if (u === v) return null;
      if (fixed && G[a] !== G[b]) return null; // E′: swaps only within a group
      if (!swapTest(a, b, lab, u, v)) return null;
      const gu = G[a], gv = G[b];
      let mu = null, mv = null;
      if (gu !== gv) {
        if (!swapTest(a, b, G, gu, gv)) return null;
        mu = { ...gm[gu] }; addM(mu, a, -1); addM(mu, b, 1);
        mv = { ...gm[gv] }; addM(mv, b, -1); addM(mv, a, 1);
        const ru = rhoOf(mu), rv = rhoOf(mv);
        if ((ru > rhoMax && ru > rhoOf(gm[gu]) + 1e-12) || (rv > rhoMax && rv > rhoOf(gm[gv]) + 1e-12)) return null;
      }
      let ku = 0, kv = 0;
      if (kMin && gu !== gv) {
        // a swap may not bring a group below κmin, nor lower a group that is already below
        // unchanged hull (the cell leaving is no vertex, the cell coming lies in the hull): κ unchanged
        G[a] = gv; G[b] = gu;
        ku = !gHull[gu].verts.has(a) && kt.inside(gHull[gu].poly, cells[b]) ? kOld[gu] : kappaG(gu, b, a);
        kv = !gHull[gv].verts.has(b) && kt.inside(gHull[gv].poly, cells[a]) ? kOld[gv] : kappaG(gv, a, b);
        G[a] = gu; G[b] = gv;
        if ((ku < kMin && ku < kOld[gu] - 1e-12) || (kv < kMin && kv < kOld[gv] - 1e-12)) return null;
      }
      const ax = cells[a].x, ay = cells[a].y, bx = cells[b].x, by = cells[b].y;
      const ux = (sx[u] - ax + bx) / n[u], uy = (sy[u] - ay + by) / n[u], vx = (sx[v] - bx + ax) / n[v], vy = (sy[v] - by + ay) / n[v];
      let dE = pairTerm(u, ux, uy, v, vx, vy);
      // E2: a group below κmin pulls the annealing towards convexity (penalty on the shortfall)
      if (kMin && gu !== gv) { const sh = (k, g) => Math.max(0, (kMin * gm[g].n) / k - gm[g].n); dE += kappaPenalty * (sh(ku, gu) + sh(kv, gv) - sh(kOld[gu], gu) - sh(kOld[gv], gv)); }
      const before = border(a, b);
      lab[a] = v; lab[b] = u; G[a] = gv; G[b] = gu;
      dE += border(a, b) - before;
      lab[a] = u; lab[b] = v; G[a] = gu; G[b] = gv;
      return { b, u, v, gu, gv, mu, mv, dE, ax, ay, bx, by, ku, kv };
    };
    const move = (c, from, to) => {
      const arr = cellsOf[from], last = arr.pop();
      if (last !== c) { arr[slot[c]] = last; slot[last] = slot[c]; }
      slot[c] = cellsOf[to].length; cellsOf[to].push(c);
    };
    const apply = (s, a) => {
      lab[a] = s.v; lab[s.b] = s.u; G[a] = s.gv; G[s.b] = s.gu;
      move(a, s.u, s.v); move(s.b, s.v, s.u);
      sx[s.u] += s.bx - s.ax; sy[s.u] += s.by - s.ay; sx[s.v] += s.ax - s.bx; sy[s.v] += s.ay - s.by;
      if (s.mu) { gm[s.gu] = s.mu; gm[s.gv] = s.mv; }
      if (kMin && s.gu !== s.gv) {
        const gmove = (c, from, to) => { const arr = gCells[from], last = arr.pop(); if (last !== c) { arr[gSlot[c]] = last; gSlot[last] = gSlot[c]; } gSlot[c] = gCells[to].length; gCells[to].push(c); };
        gmove(a, s.gu, s.gv); gmove(s.b, s.gv, s.gu);
        kOld[s.gu] = s.ku; kOld[s.gv] = s.kv;
        gHull[s.gu] = kt.hullOfGroup(G, s.gu, gCells[s.gu]); gHull[s.gv] = kt.hullOfGroup(G, s.gv, gCells[s.gv]);
      }
    };
    // a proposal: half of them neighbouring cells, half at a distance (a cell b of the neighbouring unit v that touches
    // u somewhere else); the latter let a thin strip of cells retract from its tip
    const propose = () => {
      const a = (rnd() * M) | 0, k = (rnd() * 6) | 0, x = nb[a][k];
      if (x < 0 || lab[x] === lab[a]) return [a, -1];
      if (rnd() < 0.5) return [a, x];
      const u = lab[a], list = cellsOf[lab[x]];
      for (let t = 0; t < 12; t++) { const b = list[(rnd() * list.length) | 0]; if (b !== x && has(b, lab, u, a)) return [a, b]; }
      return [a, -1];
    };
    // temperature from the typical change of energy at the start
    for (let k = 0; sample.length < 400 && k < 50 * M; k++) { const [a, b] = propose(); const s = one(a, b); if (s && s.dE) sample.push(Math.abs(s.dE)); }
    sample.sort((a, b) => a - b);
    const T0 = (opt.t0 || 0.5) * (sample[sample.length >> 1] || 1e-3);
    T1 = T0 / 2000;
    for (let it = 0; it < steps; it++) {
      T = T0 * Math.pow(T1 / T0, it / steps);
      const [a, b] = propose();
      const s = one(a, b);
      if (!s) continue;
      tried++;
      if (s.dE <= 0 || rnd() < Math.exp(-s.dE / T)) { apply(s, a); accepted++; }
    }
    // greedy end: only improving swaps, in a fixed order, until none is left
    for (let round = 0, better = true; better && round < 30; round++) {
      better = false;
      for (let a = 0; a < M; a++) for (let k = 0; k < 6; k++) { const s = one(a, nb[a][k]); if (s && s.dE < -1e-12) { apply(s, a); better = true; } }
    }
    time.swaps = Date.now() - time.start - time.groups - time.repairGroups - time.units;
    delete time.start;
    // result
    const centroids = units.map((u, i) => ({ x: sx[i] / n[i], y: sy[i] / n[i] }));
    // place of the point of a unit (fix of 5 November 2026: the centroid of a bent or long set of cells can lie outside
    // the cells, even in another group, as functional analysis in E and E2): the centroid if it lies in a cell of the
    // unit, otherwise the centre of the cell of the unit nearest to the centroid, preferring cells whose six neighbours
    // all belong to the unit (so that the point keeps a distance from the border); the cells stay as they are
    const cellAt = (x, y) => {
      const rr = y / (SQ3 / 2), q = x - rr / 2, t = -q - rr;
      let a = Math.round(q), b = Math.round(rr); const c = Math.round(t);
      const dq = Math.abs(a - q), dr = Math.abs(b - rr), ds = Math.abs(c - t);
      if (dq > dr && dq > ds) a = -b - c; else if (dr > ds) b = -a - c;
      const i = grid.index.get(a + "," + b);
      return i === undefined ? -1 : i;
    };
    // Second fix (5 November 2026, statistics in E2): a centroid close to the border of its group left too little room for
    // the point, which was then drawn nearly invisible. Room of a place = the smaller of its distance from the border of
    // its group (and the rim) and half the distance to the nearest other point; it should be at least one cell. If the
    // centroid has less room, the point goes to the centre of the cell of its unit nearest to the centroid among the cells
    // with enough room; if there is none, to the cell of its unit with the most room. Two passes over all units in their
    // order (a point that moves changes the room of the others).
    const CLEAR = 1;
    const borderSegs = [];
    {
      const rc = 1 / SQ3, angs = DV.map((q) => Math.atan2(q.y, q.x));
      for (let c = 0; c < M; c++) nb[c].forEach((d, k) => {
        if (d >= 0 && (G[d] === G[c] || d < c)) return;
        const a1 = angs[k] - Math.PI / 6, a2 = angs[k] + Math.PI / 6;
        borderSegs.push([cells[c].x + rc * Math.cos(a1), cells[c].y + rc * Math.sin(a1), cells[c].x + rc * Math.cos(a2), cells[c].y + rc * Math.sin(a2)]);
      });
    }
    const clearance = (p) => {
      let best = Infinity;
      for (const [x1, y1, x2, y2] of borderSegs) { const dx = x2 - x1, dy = y2 - y1, t = Math.max(0, Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy))); best = Math.min(best, Math.hypot(p.x - x1 - t * dx, p.y - y1 - t * dy)); }
      return best;
    };
    const positions = centroids.map((p) => ({ x: p.x, y: p.y }));
    const room = (q, u) => { let r = clearance(q); positions.forEach((o, w) => { if (w !== u) r = Math.min(r, Math.hypot(o.x - q.x, o.y - q.y) / 2); }); return r; };
    const movedSet = new Set();
    for (let pass = 0; pass < 2; pass++) for (let u = 0; u < U; u++) {
      const p = centroids[u], c0 = cellAt(p.x, p.y);
      if (c0 >= 0 && lab[c0] === u && room(p, u) >= CLEAR - 1e-9) { positions[u] = { x: p.x, y: p.y }; movedSet.delete(u); continue; }
      const own = [];
      for (let c = 0; c < M; c++) if (lab[c] === u) own.push(c);
      const rm = new Map(own.map((c) => [c, room(cells[c], u)]));
      const roomy = own.filter((c) => rm.get(c) >= CLEAR - 1e-9);
      let best = -1, bd = Infinity;
      if (roomy.length) for (const c of roomy) { const dd = (cells[c].x - p.x) ** 2 + (cells[c].y - p.y) ** 2; if (dd < bd) { bd = dd; best = c; } }
      else for (const c of own) if (best < 0 || rm.get(c) > rm.get(best) + 1e-12) best = c;
      positions[u] = { x: cells[best].x, y: cells[best].y };
      movedSet.add(u);
    }
    const moved = [...movedSet].sort((a, b) => a - b);
    const stats = check(cells, nb, lab, gOf, Gn, U);
    let pairE = 0; pairs.forEach((p) => { pairE += (p.w / pw) * ((centroids[p.a].x - centroids[p.b].x) ** 2 + (centroids[p.a].y - centroids[p.b].y) ** 2); });
    let gB = 0, uB = 0;
    for (let c = 0; c < M; c++) for (const d of nb[c]) if (d > c && lab[c] !== lab[d]) { if (G[c] !== G[d]) gB++; else uB++; }
    return {
      aspect, positions, moved, kappaStart, kappaRepair, kappaChains, kappaAfterRepair, convex: fixed, cells, nb, R: grid.R, lab: Array.from(lab), group: Array.from(G), groupKeys, quota, centroids, start: P,
      stats: Object.assign(stats, { M, U, Gn, cancelled, repairG: repG, repairU: repU, unitWays, tried, accepted, T0, pairE, groupBorder: gB, unitBorder: uB, energy: pairE + lambda * gB + lambdaUnit * uB, time, ms: Date.now() - t0 }),
    };
  }

  // counts, connectedness and aspect ratios of a result (also used by the test)
  function check(cells, nb, lab, gOf, Gn, U) {
    const M = cells.length, full = new Uint8Array(M).fill(1), all = cells.map((c, i) => i);
    const G = Int32Array.from(lab, (u) => gOf[u]);
    const cu = components(lab, nb, full, cellsByLabel(lab, all)), cg = components(G, nb, full, cellsByLabel(G, all));
    const count = new Array(U).fill(0); lab.forEach((u) => count[u]++);
    const rho = [];
    for (let g = 0; g < Gn; g++) { const m = { n: 0, sx: 0, sy: 0, sxx: 0, syy: 0, sxy: 0 }; for (let c = 0; c < M; c++) if (G[c] === g) { const p = cells[c]; m.n++; m.sx += p.x; m.sy += p.y; m.sxx += p.x * p.x; m.syy += p.y * p.y; m.sxy += p.x * p.y; } rho.push(rhoOf(m)); }
    return {
      count, rho, rhoMax: Math.max(...rho),
      unitsConnected: [...cu.values()].filter((c) => c.length === 1).length,
      groupsConnected: [...cg.values()].filter((c) => c.length === 1).length,
    };
  }

  // SVG paths in a scale: per group the union of its hexagons (one path, so no seams), every edge of the grid once, the
  // borders between groups and between units of the same group
  function paths(res, scale) {
    const rc = 1 / SQ3; // circumradius
    const corner = (c, ang) => ({ x: (res.cells[c].x + rc * Math.cos(ang)) * scale, y: (res.cells[c].y + rc * Math.sin(ang)) * scale });
    const f = (p) => p.x.toFixed(1) + "," + p.y.toFixed(1);
    const dirAng = DV.map((v) => Math.atan2(v.y, v.x));
    const fill = new Map(), groupBorder = [], unitBorder = [], outline = new Map(), grid = [];
    res.cells.forEach((c, i) => {
      const g = res.group[i];
      const pts = []; for (let k = 0; k < 6; k++) pts.push(f(corner(i, Math.PI / 6 + (k * Math.PI) / 3)));
      fill.set(g, (fill.get(g) || "") + "M" + pts.join("L") + "Z");
      res.nb[i].forEach((d, k) => {
        const seg = "M" + f(corner(i, dirAng[k] - Math.PI / 6)) + "L" + f(corner(i, dirAng[k] + Math.PI / 6));
        if (d < 0 || d > i) grid.push(seg);
        if (d < 0) { outline.set(g, (outline.get(g) || "") + seg); return; }
        if (res.group[d] !== g) outline.set(g, (outline.get(g) || "") + seg);
        if (d < i) return;
        if (res.group[d] !== g) groupBorder.push(seg);
        else if (res.lab[d] !== res.lab[i]) unitBorder.push(seg);
      });
    });
    return { fill, outline, grid: grid.join(""), groupBorder: groupBorder.join(""), unitBorder: unitBorder.join("") };
  }

  // outline of every group as closed loops of points in cell units, the group always on the left (counter-clockwise in
  // coordinates with y upwards): the polygon of the power diagram (E′, E3), or the boundary of the union of its hexagons
  // (E, E2), possibly several loops (a group around another one); used for the drawing with organic borders
  function groupLoops(res) {
    if (res.convex) return res.convex.polygons.map((q) => (q.length > 2 ? [q.map((p) => ({ x: p.x, y: p.y }))] : []));
    return labelLoops(res, res.group, res.groupKeys.length);
  }
  // the same for any labelling of the cells (labels 0 … n−1), e.g. the areas (res.lab)
  function labelLoops(res, labels, n) {
    const rc = 1 / SQ3, ang = DV.map((v) => Math.atan2(v.y, v.x)), key = (p) => Math.round(p.x * 1e5) + "," + Math.round(p.y * 1e5);
    const Gn = n, out = [];
    res = { cells: res.cells, nb: res.nb, group: labels };
    for (let g = 0; g < Gn; g++) {
      // boundary edges, each from the corner at angle θ − 30° to the corner at θ + 30° of its cell (the cell on the left)
      const next = new Map();
      res.cells.forEach((c, i) => {
        if (res.group[i] !== g) return;
        res.nb[i].forEach((d, k) => {
          if (d >= 0 && res.group[d] === g) return;
          const a = { x: c.x + rc * Math.cos(ang[k] - Math.PI / 6), y: c.y + rc * Math.sin(ang[k] - Math.PI / 6) }, b = { x: c.x + rc * Math.cos(ang[k] + Math.PI / 6), y: c.y + rc * Math.sin(ang[k] + Math.PI / 6) };
          next.set(key(a), { a, b, used: false });
        });
      });
      const loops = [];
      for (const [k0, e0] of [...next].sort((p, q) => (p[0] < q[0] ? -1 : 1))) {
        if (e0.used) continue;
        const loop = [];
        let e = e0;
        while (e && !e.used) { e.used = true; loop.push(e.a); e = next.get(key(e.b)); }
        if (loop.length > 2) loops.push(loop);
      }
      out.push(loops);
    }
    return out;
  }
  // borders of the groups as segments [x1, y1, x2, y2] in cell units: the edges of the polygons (E′, E3) or the edges of
  // the hexagons between groups and at the rim (E, E2); used to keep the points drawn inside their group
  function groupBorderSegments(res) {
    const out = [];
    if (res.convex) { res.convex.polygons.forEach((q) => q.forEach((p, i) => { const r = q[(i + 1) % q.length]; out.push([p.x, p.y, r.x, r.y]); })); return out; }
    const rc = 1 / SQ3, ang = DV.map((v) => Math.atan2(v.y, v.x));
    res.cells.forEach((c, i) => res.nb[i].forEach((d, k) => {
      if (d >= 0 && (res.group[d] === res.group[i] || d < i)) return;
      const a1 = ang[k] - Math.PI / 6, a2 = ang[k] + Math.PI / 6;
      out.push([c.x + rc * Math.cos(a1), c.y + rc * Math.sin(a1), c.x + rc * Math.cos(a2), c.y + rc * Math.sin(a2)]);
    }));
    return out;
  }
  // is the point (in cell units) covered by a cell? (nearest hexagon by cube rounding)
  function covered(res, x, y) {
    if (!res._index) res._index = new Set(res.cells.map((c) => c.q + "," + c.r));
    const r = y / (SQ3 / 2), q = x - r / 2, s = -q - r;
    let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
    return res._index.has(rq + "," + rr);
  }

  // ---------------------------------------------------------------- E′: convex groups (spec, addendum)
  // convex polygon clipped to the half-plane a·x + b·y ≤ c (Sutherland–Hodgman)
  function clip(poly, a, b, c) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], fp = a * p.x + b * p.y - c, fq = a * q.x + b * q.y - c;
      if (fp <= 0) out.push(p);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { const t = fp / (fp - fq); out.push({ x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) }); }
    }
    return out;
  }
  const polyArea = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p.x * q.y - q.x * p.y; } return a / 2; };
  const polyCentroid = (P) => { let a = 0, x = 0, y = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], c = p.x * q.y - q.x * p.y; a += c; x += (p.x + q.x) * c; y += (p.y + q.y) * c; } return a ? { x: x / (3 * a), y: y / (3 * a) } : null; };
  // power diagram of the sites s with weights w, every cell clipped to the convex polygon `disk`
  function powerCells(s, w, disk) {
    return s.map((p, g) => {
      let poly = disk;
      for (let h = 0; h < s.length && poly.length; h++) if (h !== g) {
        const q = s[h];
        poly = clip(poly, 2 * (q.x - p.x), 2 * (q.y - p.y), q.x * q.x + q.y * q.y - p.x * p.x - p.y * p.y - w[h] + w[g]);
      }
      return poly;
    });
  }
  // The groups as cells of an area-weighted power diagram in the disk (method A, step 3 of the note): convex, connected,
  // without overlap and without gaps by construction.
  //   1. centres: layout of the quotient graph (one node per group, weight = single edges between the groups), started at
  //      the mean start positions of the units of the group; every group a disk of its area; the weighted sum of the
  //      distances is made small while the disks do not overlap and stay in the big disk; no rule for single groups
  //   2. weights (and, in the first half, a partial step of the sites towards the centroids of their cells, as in the
  //      capacity-constrained diagrams of Balzer et al. 2009) adjusted until every area is proportional to the number of
  //      units of the group
  //   3. hexagonal cells -> groups: transportation problem with exactly k·n cells per group and the power distance as cost;
  //      its optimum is a discrete power diagram, so the groups are convex on the grid as well
  // o.hubCentre (E3): the group of the unit with the largest weighted degree (sum of the single edges over all pairs) has
  // its centre fixed in the middle of the disk; the other centres as in E′
  function convexGroups(ctx, o = {}) {
    const { cells, R, P, gUnits, gCap, Gn, pairs, gOf } = ctx;
    let hubGroup = -1, hubUnit = -1;
    if (o.hubCentre) {
      const deg = new Float64Array(gOf.length); pairs.forEach((p) => { deg[p.a] += p.w; deg[p.b] += p.w; });
      deg.forEach((d, i) => { if (hubUnit < 0 || d > deg[hubUnit]) hubUnit = i; });
      hubGroup = gOf[hubUnit];
    }
    const disk = []; for (let i = 0; i < 180; i++) { const a = (2 * Math.PI * i) / 180; disk.push({ x: R * Math.cos(a), y: R * Math.sin(a) }); }
    const total = polyArea(disk), capSum = gCap.reduce((a, b) => a + b, 0);
    const target = gCap.map((c) => (total * c) / capSum), rad = target.map((t) => Math.sqrt(t / Math.PI));
    // quotient graph
    const W = Array.from({ length: Gn }, () => new Float64Array(Gn));
    pairs.forEach((p) => { const a = gOf[p.a], b = gOf[p.b]; if (a !== b) { W[a][b] += p.w; W[b][a] += p.w; } });
    let wMax = 0; W.forEach((r) => r.forEach((x) => { wMax = Math.max(wMax, x); }));
    const s = gUnits.map((list) => ({ x: list.reduce((a, i) => a + P[i].x, 0) / list.length, y: list.reduce((a, i) => a + P[i].y, 0) / list.length }));
    for (let it = 0, step = 0.08; it < 800; it++, step *= 0.996) {
      const D = s.map(() => ({ x: 0, y: 0 }));
      for (let g = 0; g < Gn; g++) for (let h = g + 1; h < Gn; h++) {
        let dx = s[h].x - s[g].x, dy = s[h].y - s[g].y, d = Math.hypot(dx, dy);
        if (d < 1e-9) { dx = 1e-3 * (h - g); dy = 1e-3; d = Math.hypot(dx, dy); }
        // attraction (gradient of w·d) and a strong push while the disks overlap
        const f = (wMax ? W[g][h] / wMax : 0) * R * 0.5 - Math.max(0, rad[g] + rad[h] - d) * 4;
        D[g].x += (f * dx) / d; D[g].y += (f * dy) / d; D[h].x -= (f * dx) / d; D[h].y -= (f * dy) / d;
      }
      s.forEach((p, g) => {
        p.x += D[g].x * step; p.y += D[g].y * step;
        const r = Math.hypot(p.x, p.y), lim = Math.max(0, R - rad[g]);
        if (r > lim) { p.x *= lim / r; p.y *= lim / r; }
      });
      if (hubGroup >= 0) { s[hubGroup].x = 0; s[hubGroup].y = 0; }
    }
    const quotient = s.map((p) => ({ x: p.x, y: p.y }));
    // weights and sites
    const w = new Float64Array(Gn);
    let polys = null, err = 1;
    for (let it = 0; it < 600; it++) {
      polys = powerCells(s, w, disk);
      const area = polys.map((q) => (q.length > 2 ? polyArea(q) : 0));
      err = Math.max(...area.map((a, g) => Math.abs(a - target[g]) / target[g]));
      if (it >= 300 && err < 0.002) break;
      area.forEach((a, g) => { w[g] += 0.6 * (target[g] - a); });
      if (it < 300) polys.forEach((q, g) => { const c = q.length > 2 && g !== hubGroup ? polyCentroid(q) : null; if (c) { s[g].x += 0.3 * (c.x - s[g].x); s[g].y += 0.3 * (c.y - s[g].y); } });
    }
    polys = powerCells(s, w, disk);
    // hexagonal cells -> groups with exactly the numbers asked for
    const t = transport(cells, Gn, gCap, (c, g) => (c.x - s[g].x) ** 2 + (c.y - s[g].y) ** 2 - w[g]);
    return { glab: t.assign, hubGroup, hubUnit, sites: s.map((p) => ({ x: p.x, y: p.y })), quotient, weights: Array.from(w), polygons: polys, areaError: err, target };
  }
  const layoutConvex = (units, pairs, opt = {}) => layout(units, pairs, Object.assign({}, opt, { fixedGroups: opt.hubCentre ? (ctx) => convexGroups(ctx, { hubCentre: true }) : convexGroups }));
  // convexity on a grid: number of points of a region / number of all points that lie in the convex hull of the region
  // (1 = convex). points: [{x, y}], label: label of each point (negative: no region)
  function kappaGrid(points, label) {
    const hullOf = (pts) => {
      const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
      if (p.length < 3) return p;
      const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
      const lo = [], up = [];
      for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    };
    const labels = [...new Set(label)].filter((l) => l >= 0).sort((a, b) => a - b);
    return labels.map((L) => {
      const own = points.filter((p, i) => label[i] === L), H = hullOf(own);
      if (H.length < 3) return 1;
      const inside = (q) => { for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length]; if ((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x) < -1e-9) return false; } return true; };
      let n = 0; for (const q of points) if (inside(q)) n++;
      return own.length / n;
    });
  }

  // Start layout of the cell variants (shared by the sketch and graphs/areas.html, 5 November 2026): force-directed from
  // the angles u.angle of the circle A, with a weak attraction to the centre of the own group (factor `cohesion`) and
  // the same radius for every point. Units need angle, F.key, folder (or key); pairs { a, b, w }. Exactly the steps of
  // the former function force() of the sketch with the option cohesion.
  function forceStart(units, pairs, k, steps, cohesion, radius) {
    const N = units.length, idx = new Map(units.map((u, i) => [u, i]));
    const R0 = k * Math.sqrt(N) * 0.55;
    const P = units.map((u) => ({ x: R0 * Math.cos(u.angle), y: R0 * Math.sin(u.angle), r: radius }));
    const maxW = Math.max(...pairs.map((p) => p.w));
    const E = pairs.map((p) => [idx.get(p.a), idx.get(p.b), Math.sqrt(p.w / maxW)]).filter((e) => e[0] !== undefined && e[1] !== undefined);
    const fieldIndex = units.map((u) => u.F.key), areaIndex = units.map((u) => (u.folder ? u.folder.folder : u.key));
    const coh = cohesion;
    let t = k * 0.6;
    for (let s = 0; s < steps; s++) {
      const D = P.map(() => ({ x: 0, y: 0 }));
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        let dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d2 = dx * dx + dy * dy;
        if (d2 < 1e-6) { dx = 0.1 * (i - j); dy = 0.1; d2 = dx * dx + dy * dy; }
        const d = Math.sqrt(d2);
        const f = (k * k) / d;
        D[i].x += (dx / d) * f; D[i].y += (dy / d) * f; D[j].x -= (dx / d) * f; D[j].y -= (dy / d) * f;
      }
      for (const [i, j, w] of E) {
        const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.hypot(dx, dy) || 0.01;
        const f = ((d * d) / k) * w * 1;
        D[i].x -= (dx / d) * f; D[i].y -= (dy / d) * f; D[j].x += (dx / d) * f; D[j].y += (dy / d) * f;
      }
      {
        const cen = (keys) => { const m = new Map(); P.forEach((p, i) => { const c = m.get(keys[i]) || { x: 0, y: 0, n: 0 }; c.x += p.x; c.y += p.y; c.n++; m.set(keys[i], c); }); m.forEach((c) => { c.x /= c.n; c.y /= c.n; }); return m; };
        const cf = cen(fieldIndex), ca = cen(areaIndex);
        P.forEach((p, i) => {
          const c = cf.get(fieldIndex[i]), a = ca.get(areaIndex[i]);
          D[i].x += ((c.x - p.x) * 1.6 + (a.x - p.x) * 0.5) * coh; D[i].y += ((c.y - p.y) * 1.6 + (a.y - p.y) * 0.5) * coh;
        });
      }
      P.forEach((p, i) => { D[i].x -= p.x * 0.03; D[i].y -= p.y * 0.03; });
      P.forEach((p, i) => {
        const d = Math.hypot(D[i].x, D[i].y) || 1, m = Math.min(d, t);
        p.x += (D[i].x / d) * m; p.y += (D[i].y / d) * m;
      });
      t = Math.max(k * 0.01, t * 0.985);
    }
    for (let it = 0; it < 60; it++) for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.hypot(dx, dy) || 0.01, need = P[i].r + P[j].r + k * 0.15;
      if (d < need) { const m = (need - d) / 2; P[i].x += (dx / d) * m; P[i].y += (dy / d) * m; P[j].x -= (dx / d) * m; P[j].y -= (dy / d) * m; }
    }
    {
      const cx = P.reduce((a, p) => a + p.x, 0) / N, cy = P.reduce((a, p) => a + p.y, 0) / N;
      const ds = P.map((p) => Math.hypot(p.x - cx, p.y - cy)).sort((x, y) => x - y), lim = 1.1 * ds[Math.floor(0.9 * (N - 1))];
      P.forEach((p) => { const d = Math.hypot(p.x - cx, p.y - cy); if (d > lim) { p.x = cx + ((p.x - cx) * lim) / d; p.y = cy + ((p.y - cy) * lim) / d; } });
    }
    const linked = new Set(E.flatMap((e) => [e[0], e[1]]));
    const con = P.filter((p, i) => linked.has(i));
    if (con.length < N) {
      const maxX = Math.max(...con.map((p) => p.x + p.r)), maxY = Math.max(...con.map((p) => p.y + p.r));
      let x = maxX;
      P.forEach((p, i) => { if (!linked.has(i)) { p.x = x; p.y = maxY + 20; x -= 2 * p.r + 40; } });
    }
    return P;
  }

  // Organic borders and gaps of the regions of the groups (only the drawing; sketch and graphs/areas.html): the outline
  // of every group (groupLoops), scaled, drawn in by d along the inner normals, then (organic) smoothed after Taubin
  // (removes the steps of the hexagons without shrinking) and two rounds of Chaikin; the polygons of a power diagram are
  // first given points every 6 units so that only their corners become round. Returns the path of every group and the
  // distance of a point to the nearest drawn outline.
  function organicShapes(res, scale, d, organic) {
    const norm = (p) => { const l = Math.hypot(p.x, p.y) || 1; return { x: p.x / l, y: p.y / l }; };
    const densify = (P, step) => { const Q = []; P.forEach((p, i) => { const q = P[(i + 1) % P.length], n = Math.max(1, Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / step)); for (let k = 0; k < n; k++) Q.push({ x: p.x + ((q.x - p.x) * k) / n, y: p.y + ((q.y - p.y) * k) / n }); }); return Q; };
    const loops = groupLoops(res).map((ls) => ls.map((l) => l.map((p) => ({ x: p.x * scale, y: p.y * scale }))));
    const inset = (P) => P.map((p, i) => {
      const a = P[(i - 1 + P.length) % P.length], b = P[(i + 1) % P.length];
      const n1 = norm({ x: -(p.y - a.y), y: p.x - a.x }), n2 = norm({ x: -(b.y - p.y), y: b.x - p.x });
      const m = norm({ x: n1.x + n2.x, y: n1.y + n2.y }), c = Math.max(0.5, m.x * n1.x + m.y * n1.y);
      return { x: p.x + (m.x * d) / c, y: p.y + (m.y * d) / c };
    });
    const chaikin = (P) => { const Q = []; P.forEach((p, i) => { const q = P[(i + 1) % P.length]; Q.push({ x: 0.75 * p.x + 0.25 * q.x, y: 0.75 * p.y + 0.25 * q.y }, { x: 0.25 * p.x + 0.75 * q.x, y: 0.25 * p.y + 0.75 * q.y }); }); return Q; };
    const taubin = (P, rounds) => {
      let Q = P;
      for (let k = 0; k < rounds; k++) for (const f of [0.5, -0.53]) Q = Q.map((p, i) => { const a = Q[(i - 1 + Q.length) % Q.length], b = Q[(i + 1) % Q.length]; return { x: p.x + f * ((a.x + b.x) / 2 - p.x), y: p.y + f * ((a.y + b.y) / 2 - p.y) }; });
      return Q;
    };
    const drawn = loops.map((ls) => ls.map((P) => {
      let Q = d ? inset(P) : P;
      if (organic) { Q = taubin(res.convex ? densify(Q, 6) : Q, 24); for (let k = 0; k < 2; k++) Q = chaikin(Q); }
      return Q;
    }));
    const segs = [];
    drawn.forEach((ls) => ls.forEach((P) => P.forEach((p, i) => segs.push([p, P[(i + 1) % P.length]]))));
    const dist = (q) => {
      let best = Infinity;
      for (const [a, b] of segs) { const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((q.x - a.x) * dx + (q.y - a.y) * dy) / (dx * dx + dy * dy || 1))); best = Math.min(best, Math.hypot(q.x - a.x - t * dx, q.y - a.y - t * dy)); }
      return best;
    };
    // borders between the areas (user, 5 November 2026: "just smooth the hexagonal lines"): the outline of every area follows
    // the edges of the hexagons; only the zigzag steps are softened (the midpoints of the edges, then one round of
    // Chaikin), so that the line stays close to the border of the cells; no gap. Drawn as thin lines and cut to the
    // regions of the groups by the caller
    let units = null;
    if (organic) {
      const mids = (P) => P.map((p, i) => { const q = P[(i + 1) % P.length]; return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; });
      const ul = labelLoops(res, res.lab, Math.max(...res.lab) + 1).map((ls) => ls.map((l) => chaikin(mids(l.map((p) => ({ x: p.x * scale, y: p.y * scale }))))));
      units = ul.map((ls) => ls.map((P) => "M" + P.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join("L") + "Z").join("")).join("");
    }
    return { d: drawn.map((ls) => ls.map((P) => "M" + P.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join("L") + "Z").join("")), dist, units };
  }

  const api = { forceStart, organicShapes, groupLoops, groupBorderSegments, layout, layoutConvex, convexGroups, powerCells, polyArea, kappaGrid, check, paths, covered, hexDisk, quotas, transport, rhoOf, simple, random };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AREA_CELLS = api;
})(typeof window !== "undefined" ? window : this);
