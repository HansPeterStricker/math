// Copy of 22 October 2026 for draft 11 (since plan step N0 draft 12, draft 11 has its own copy) and place-elements.js (plan step 4.5, decision of the user): the source is the
// sketch maps/skizzen/building-symbols.js (sketches of plan step 4.3); changes to the sketch no longer affect the
// map. Change the drawings of the map here. Original head comment:
// Shared symbols of the sketches for plan step 4.3 (drafts only, decisions 4.1 pending): buildings in four stages,
// ruin, open conjecture (building with a question mark), city, hill range and programme of draft 10, provisional
// tree. Used by buildings-and-cities.js and bridges.js; exposes window.SKETCH_SYMBOLS. Loads after ../shared_scripts/drawing.js.
window.SKETCH_SYMBOLS = (function () {
  "use strict";
  const T = window.TM, { el, text, f, INK, PAPER } = T, LIGHT = "#efe3c2";
  const g2 = (z) => Math.round(z * 100) / 100;
  const poly = (pts, close) => "M" + pts.map((p) => g2(p[0]) + "," + g2(p[1])).join("L") + (close ? "Z" : "");
  // ------------------------------------------------------------ Building parts
  // A part is a block in oblique view: front face, east side face (hatched, light from the west) and a roof. Units are
  // multiples of s; the foot of the building lies at y = 0, x runs from about -0.85 s to 0.9 s like a mountain.
  const D = 0.16, R = 0.09;   // depth and rise of the side face
  function part(g, s, p) {
    const sw = 0.55 + s / 60, x0 = p.x * s, x1 = (p.x + p.w) * s, xm = (x0 + x1) / 2, yb = -(p.y0 || 0) * s, yt = yb - p.h * s;
    const d = D * s, r = R * s, rh = (p.rh || 0) * s, ink = { stroke: INK, "stroke-linejoin": "round", "stroke-linecap": "round" };
    const face = (pts, extra) => el("path", Object.assign({ d: poly(pts, true), fill: PAPER, "stroke-width": sw }, ink, extra || {}), g);
    const hatch = (segs, op) => { if (segs.length) el("path", { d: segs.join(""), stroke: INK, "stroke-width": 0.5, opacity: op || 0.8, fill: "none" }, g); };
    const step = Math.max(1.1, s * 0.055);
    // side face with vertical hatching
    face([[x1, yb], [x1 + d, yb - r], [x1 + d, yt - r], [x1, yt]], { "stroke-width": sw * 0.8 });
    const hs = [];
    for (let x = x1 + step * 0.6; x < x1 + d - 0.3; x += step) { const k = r * (x - x1) / d; hs.push(`M${g2(x)},${g2(yt - k + 0.5)}V${g2(yb - k - 0.4)}`); }
    hatch(hs);
    face([[x0, yb], [x1, yb], [x1, yt], [x0, yt]]);
    // storeys, windows and door
    const floors = p.floors || 1, hf = (yb - yt) / floors, ww = 0.075 * s, wh = 0.11 * s;
    for (let k = 1; k < floors; k++) el("path", { d: `M${g2(x0)},${g2(yb - k * hf)}H${g2(x1)}`, stroke: INK, "stroke-width": 0.5, opacity: 0.7 }, g);
    if (p.win && ww >= 0.8) {
      const wins = [];
      for (let k = 0; k < floors; k++) for (let i = 0; i < p.win; i++) {
        const cx = x0 + (i + 0.5) * (x1 - x0) / p.win, cy = yb - k * hf - hf * 0.55;
        if (k === 0 && p.door && Math.abs(cx - xm) < ww * 1.5) continue;
        wins.push(`M${g2(cx - ww / 2)},${g2(cy + wh / 2)}v${g2(-wh)}h${g2(ww)}v${g2(wh)}Z`);
      }
      el("path", { d: wins.join(""), fill: INK, opacity: 0.8 }, g);
    }
    if (p.door) {
      const dw = Math.min(0.16 * s, (x1 - x0) * 0.3), dh = dw * 1.5;
      if (dw >= 1.1) el("path", { d: `M${g2(xm - dw / 2)},${g2(yb)}V${g2(yb - dh + dw / 2)}A${g2(dw / 2)},${g2(dw / 2)} 0 0 1 ${g2(xm + dw / 2)},${g2(yb - dh + dw / 2)}V${g2(yb)}Z`, fill: INK, opacity: 0.85 }, g);
    }
    // roof
    if (p.roof === "gable") {
      const A = [xm, yt - rh];
      face([[x1, yt], A, [A[0] + d, A[1] - r], [x1 + d, yt - r]]);
      hatch([0.3, 0.65].map((t) => `M${g2(A[0] + t * d + 0.4)},${g2(A[1] - t * r + 0.6)}L${g2(x1 + t * d - 0.3)},${g2(yt - t * r - 0.2)}`), 0.7);
      face([[x0, yt], A, [x1, yt]]);
    } else if (p.roof === "hip") {   // hipped roof: trapezoid in front, east roof plane hatched
      const ins = Math.min(rh, (x1 - x0) * 0.35);
      face([[x1, yt], [x1 - ins, yt - rh], [x1 - ins + d, yt - rh - r], [x1 + d, yt - r]]);
      hatch([0.3, 0.65].map((t) => `M${g2(x1 - ins + t * d + 0.3)},${g2(yt - rh - t * r + 0.6)}L${g2(x1 + t * d - 0.3)},${g2(yt - t * r - 0.2)}`), 0.7);
      face([[x0, yt], [x0 + ins, yt - rh], [x1 - ins, yt - rh], [x1, yt]]);
    } else if (p.roof === "broken") {   // refuted conjecture: the roof has broken off, low jagged remains of the gable
      const rem = rh * 0.5, rnd = T.random(p.seed || 3), k = Math.max(4, Math.round((x1 - x0) / Math.max(1.6, s * 0.09))), pts = [[x0, yt]];
      for (let j = 1; j < k; j++) { const t = j / k, full = rh * (1 - Math.abs(2 * t - 1));
        pts.push([x0 + t * (x1 - x0), yt - Math.min(full, rem) * (j % 2 ? 1 : 0.3) * (0.7 + 0.5 * rnd())]); }
      pts.push([x1, yt]);
      face(pts);
      el("path", { d: `M${g2(xm - (x1 - x0) * 0.2)},${g2(yt - rem * 0.4)}l${g2(-0.05 * s)},${g2(-0.2 * s)}M${g2(xm + (x1 - x0) * 0.15)},${g2(yt - rem * 0.4)}l${g2(0.04 * s)},${g2(-0.17 * s)}`,
        stroke: INK, "stroke-width": sw * 0.7, "stroke-linecap": "round" }, g);
    } else if (p.roof === "pyramid") {   // only for the towers of a city
      const A = [xm + d / 2, yt - rh - r / 2];
      face([[x0, yt], A, [x1, yt]]);
      face([[x1, yt], [x1 + d, yt - r], A]);
      hatch([`M${g2(A[0] + 0.2)},${g2(A[1] + 1)}L${g2(x1 + d * 0.5)},${g2(yt - r * 0.5 - 0.3)}`], 0.75);

    }
  }
  const ground = (g, s) => el("path", { d: `M${g2(0.15 * s)},1.5h${g2(0.8 * s)}M${g2(0.45 * s)},4h${g2(0.5 * s)}`, stroke: INK, "stroke-width": 0.6, opacity: 0.55 }, g);
  function building(g, s, parts) { parts.forEach((p) => part(g, s, p)); ground(g, s); }

  // Two lines of buildings without towers or domes (user, 22 October 2026); each stage adds storeys, an annex, side
  // wings or a rear wing instead of scaling. A rear wing is drawn first and stands higher in the picture (y0 > 0).
  const BUILDINGS = {
    A: {   // gable line: house, two storeys with annex, two side wings, three storeys with wings and rear wing
      4: [{ x: -0.6, w: 1.1, h: 0.5, roof: "gable", rh: 0.42, door: true }],
      3: [{ x: -0.75, w: 0.85, h: 0.72, roof: "gable", rh: 0.38, floors: 2, win: 2, door: true },
        { x: 0.1, w: 0.6, h: 0.42, roof: "gable", rh: 0.28, win: 1 }],
      2: [{ x: -0.88, w: 0.42, h: 0.45, roof: "gable", rh: 0.26, win: 1 },
        { x: -0.46, w: 0.86, h: 0.76, roof: "gable", rh: 0.4, floors: 2, win: 3, door: true },
        { x: 0.4, w: 0.46, h: 0.45, roof: "gable", rh: 0.26, win: 1 }],
      1: [{ x: -0.25, w: 0.95, h: 0.62, y0: 0.24, roof: "gable", rh: 0.3, floors: 2, win: 3 },
        { x: -0.95, w: 0.45, h: 0.6, roof: "gable", rh: 0.28, floors: 2, win: 1 },
        { x: -0.5, w: 0.95, h: 0.85, roof: "gable", rh: 0.36, floors: 3, win: 3, door: true },
        { x: 0.45, w: 0.45, h: 0.6, roof: "gable", rh: 0.28, floors: 2, win: 1 }],
    },
    B: {   // hip roof line: house, two storeys with annex, long house with rear wing and annex, three storeys
      4: [{ x: -0.55, w: 1.05, h: 0.5, roof: "hip", rh: 0.36, door: true }],
      3: [{ x: -0.7, w: 0.95, h: 0.7, roof: "hip", rh: 0.34, floors: 2, win: 3, door: true },
        { x: 0.25, w: 0.5, h: 0.4, roof: "hip", rh: 0.22, win: 1 }],
      2: [{ x: -0.3, w: 0.8, h: 0.5, y0: 0.2, roof: "hip", rh: 0.26, win: 2 },
        { x: -0.85, w: 1.3, h: 0.7, roof: "hip", rh: 0.34, floors: 2, win: 4, door: true },
        { x: 0.45, w: 0.42, h: 0.42, roof: "hip", rh: 0.2, win: 1 }],
      1: [{ x: -0.6, w: 1.2, h: 0.62, y0: 0.24, roof: "hip", rh: 0.3, floors: 2, win: 4 },
        { x: -0.95, w: 1.4, h: 0.86, roof: "hip", rh: 0.34, floors: 3, win: 5, door: true },
        { x: 0.45, w: 0.45, h: 0.48, roof: "hip", rh: 0.22, win: 1 }],
    },
  };
  const mountain = (g, s) => T.mountain(g, 0, 0, s, () => 0.5, "offen");

  // ------------------------------------------------------------ Ruins (refuted conjecture)
  // User, 22 October 2026: the building stands complete, only the roof has broken off; no rubble. A counterexample has
  // no symbol of its own (user, 22 October 2026: a refuted conjecture X is the theorem not-X), so there is no cairn.
  const unroofed = (parts) => parts.map((p, i) => Object.assign({}, p, { roof: "broken", seed: 3 + i }));
  const RUINS = {
    A: (g, s) => building(g, s, unroofed(BUILDINGS.A[3])),   // gable house of stage 3 without roof
    B: (g, s) => building(g, s, unroofed(BUILDINGS.B[3])),   // hip-roofed house of stage 3 without roof
  };

  // ------------------------------------------------------------ Open conjecture (T4.3): a building of the same stages
  // with a question mark above it (user, 22 October 2026; replaces the dashed ground plan). The question mark has at
  // least QM_MIN screen pixels, so it stays readable at magnification 1; sym is the scale at which the symbol is drawn.
  const QM_MIN = 15;
  const topOf = (s, parts) => Math.max(...parts.map((p) => ((p.y0 || 0) + p.h + (p.rh || 0) + R * 0.5) * s));
  function conjecture(g, s, parts, sym) {
    building(g, s, parts);
    const fs = Math.max(0.8 * s, QM_MIN / sym);
    text("?", { x: g2(0.05 * s), y: g2(-topOf(s, parts) - 0.12 * s), "font-size": g2(fs), "text-anchor": "middle", class: "map", "font-weight": "bold",
      stroke: LIGHT, "stroke-width": g2(fs * 0.12), "paint-order": "stroke", "stroke-linejoin": "round" }, g);
  }

  // ------------------------------------------------------------ City (theory): small houses staggered in depth
  // Drawn for unit u = s / 16 like the hill range of draft 10 (foot of the front row at y = 8 u). Oblique view: each
  // row further back stands higher in the picture, is shifted a little to the east, slightly smaller and partly hidden
  // by the rows in front (user, 22 October 2026: narrower, deeper, houses with roofs in every row, one or two towers;
  // towers occur only in cities). Larger cities have more rows.
  const CITY = {
    klein: { rows: 3, hw: 12, towers: [[0, 0.5]] },
    mittel: { rows: 4, hw: 14, towers: [[0, 0.35], [1, 0.75]] },
    gross: { rows: 5, hw: 16, towers: [[1, 0.3], [0, 0.72]] },
  };
  function city(g, s, size, seed, withWall) {
    const u = s / 16, c = CITY[size], rnd = T.random(seed), bs = 6.6 * u, step = bs * 0.48, foot = 8 * u, shift = 0.22 * bs;
    const depth = (c.rows - 1) * step, ecx = (c.rows - 1) * shift / 2, ex = c.hw * u + ecx + 4 * u, ey = depth / 2 + 4 * u, ecy = foot - depth / 2 - 1.2 * u;
    if (withWall) {   // variant: low ring wall, back half drawn behind the buildings
      el("path", { d: `M${g2(ecx - ex)},${g2(ecy)}A${g2(ex)},${g2(ey)} 0 0 1 ${g2(ecx + ex)},${g2(ecy)}`, fill: "none", stroke: INK, "stroke-width": 1.2 * u, opacity: 0.9 }, g);
    }
    for (let k = 0; k < c.rows; k++) {
      const back = c.rows - 1 - k, sc = 1 - 0.05 * back, hw = c.hw * u * (0.72 + 0.28 * k / Math.max(1, c.rows - 1)), x0 = back * shift;
      const g0 = el("g", { transform: `translate(${g2(x0)} ${g2(foot - back * step)}) scale(${g2(sc)})` }, g), b = bs;
      const towers = c.towers.filter((t) => t[0] === k).map((t) => (-hw + t[1] * 2 * hw) / sc);
      let x = (-hw + (k % 2 ? 0.25 * b : 0)) / sc;
      while (x < hw / sc - 0.45 * b) {
        const tw = towers.find((t) => Math.abs(t - x) < 0.5 * b), dy = (rnd() - 0.5) * 0.08;
        let w;
        if (tw != null) { w = 0.4; part(g0, b, { x: x / b, w, h: 1.25, y0: dy, roof: "pyramid", rh: 0.5 }); }
        else { w = 0.55 + 0.25 * rnd(); part(g0, b, { x: x / b, w, h: 0.45 + 0.25 * rnd(), y0: dy, roof: rnd() < 0.7 ? "gable" : "hip", rh: 0.3 + 0.14 * rnd() }); }
        x += w * b * 0.98;
      }
    }
    if (withWall) {   // front half of the ring wall, in front of the buildings
      const pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * i / 40; pts.push([ecx - ex * Math.cos(a), ecy + ey * Math.sin(a)]); }
      const wh = 2 * u, top = pts.map((p) => [p[0], p[1] - wh]);
      el("path", { d: poly(pts.concat(top.slice().reverse()), true), fill: PAPER, stroke: INK, "stroke-width": 0.55 + s / 60, "stroke-linejoin": "round" }, g);
      el("path", { d: `M${g2(ecx - 1.2 * u)},${g2(ecy + ey)}v${g2(-wh + 0.3 * u)}a${g2(1.2 * u)},${g2(1.2 * u)} 0 0 1 ${g2(2.4 * u)},0v${g2(wh - 0.3 * u)}Z`, fill: INK, opacity: 0.85 }, g);
    }
  }
  // Hill range of draft 10 for comparison: copied from draft-10-bridge.js (hills), unit 16, scaled by sc = s / 16
  function hills(g, sc) {
    const h = el("g", { transform: `scale(${f(sc)})` }, g);
    const ridge = (x0, x1, bumps, base) => { const pts = []; pts.base = base;
      for (let x = x0; x <= x1 + 1e-9; x += 0.5) {
        let y = 0; bumps.forEach(([c, ht, w, skew]) => { const u = (x - c) / (x < c ? w * (1 - skew) : w * (1 + skew)); y += ht * Math.exp(-u * u); });
        pts.push([x, base - y * Math.min(1, (x - x0) / 3, (x1 - x) / 3)]); }
      return pts; };
    const pathOf = (pts) => "M" + pts.map((q) => f(q[0]) + "," + f(q[1])).join("L");
    const row = (pts, sw, op) => {
      el("path", { d: pathOf(pts) + "Z", fill: PAPER, stroke: "none" }, h);
      const hs = [];
      for (let i = 2; i < pts.length - 2; i++) { const [x, y] = pts[i], dy = pts[i + 1][1] - pts[i - 1][1];
        if (dy > 0.3 && i % 2 === 0 && pts.base - y > 2.5) hs.push(`M${f(x - 0.3)},${f(y + 0.7)}l${f(-0.9 - dy)},${f(Math.min(pts.base - y - 1.2, 4, 1.5 + dy * 2.2))}`); }
      el("path", { d: hs.join(""), stroke: INK, "stroke-width": 0.45, opacity: 0.75 * op }, h);
      el("path", { d: pathOf(pts), fill: "none", stroke: INK, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: op }, h);
    };
    row(ridge(-20, 21, [[-7, 12, 7.5, 0.2], [9, 12.5, 7, 0.25]], 3), 0.8, 0.7);
    row(ridge(-26, 26, [[-15, 8, 6, 0.3], [0, 16, 9, 0.2], [15, 9, 6, 0.3]], 8), 1.2, 1);
    el("path", { d: "M-10,9.5h32M-2,12h19", stroke: INK, "stroke-width": 0.5, opacity: 0.55 }, h);
  }
  // Programme: only the dashed outline of draft 10 (key "kueste"), without wall or buildings (user, 22 October 2026)
  function programme(g, s) {
    el("path", { d: T.smooth([[-s * 1.8, 0], [-s, -s * 0.9], [s * 0.4, -s * 0.8], [s * 1.8, -s * 0.1], [s * 1.1, s * 0.8], [-s * 0.6, s * 0.7], [-s * 1.8, 0]]),
      fill: "none", stroke: INK, "stroke-width": 1.3, "stroke-dasharray": "5 3" }, g);
  }
  // Tree (concept): provisional drawing, plan step 2.2 has not drawn trees yet
  function tree(g, s) {
    const sw = 0.8 + s / 40;
    el("path", { d: `M0,0V${g2(-0.5 * s)}`, stroke: INK, "stroke-width": sw, "stroke-linecap": "round" }, g);
    el("path", { d: T.smooth([[0, -0.38 * s], [-0.36 * s, -0.55 * s], [-0.4 * s, -0.95 * s], [-0.05 * s, -1.2 * s], [0.35 * s, -1.05 * s], [0.38 * s, -0.6 * s], [0, -0.38 * s]]) + "Z",
      fill: PAPER, stroke: INK, "stroke-width": sw, "stroke-linejoin": "round" }, g);
    el("path", { d: `M${g2(0.22 * s)},${g2(-0.95 * s)}l${g2(-0.06 * s)},${g2(0.2 * s)}M${g2(0.28 * s)},${g2(-0.75 * s)}l${g2(-0.07 * s)},${g2(0.18 * s)}`, stroke: INK, "stroke-width": 0.5, opacity: 0.8 }, g);
  }

  return { D, R, QM_MIN, part, ground, building, BUILDINGS, mountain, unroofed, RUINS, topOf,
    conjecture, CITY, city, hills, programme, tree };
})();
