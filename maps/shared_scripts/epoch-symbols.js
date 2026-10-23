// Buildings of three periods for the historical maps (shared since 23 October 2026, user: "Übernimm die neuen Gebäude
// für 1830 und Variante A für 1900"; taken over from the sketch maps/skizzen/gebaeude-epochen.html, which loads this file).
// A map selects a period with the setting STYLE.buildings of its scripts/map-config.js ("classicism" for the map 1830,
// "gruenderzeit" for the map 1900); maps/shared_scripts/map-page.js then draws buildings, ruins, conjectures and cities
// with EPOCH_SYMBOLS.make(STYLE.buildings) instead of window.SKETCH_SYMBOLS. A map without the setting is not affected.
// Loads after ../shared_scripts/drawing.js. Head comment of the sketch:
// Sketch (23 October 2026, user): buildings of three periods for the historical maps, in the ink style of the shared
// symbols (maps/shared_scripts/building-symbols.js), drawn finer the larger they are shown:
//   classicism    map 1830: secular town houses and a palais, no temples (no columns, no pediment over a portico):
//                 low hip roofs, rusticated ground floor, window axes, straight window cornices on the main floor,
//                 a central bay (risalit) with pilasters and an attic
//   gruenderzeit  map 1900, variant A: historicist town houses: mansard roofs with dormers, bay windows (Erker),
//                 balconies, window pediments, shop arches in the ground floor, main cornice with consoles
//   early-modern  map 1900, variant B (beginning modernism, about 1900 to 1914): plain cubic volumes, flat roofs with a
//                 thin cornice, large windows with small panes, pilaster strips, a glazed factory hall with a sawtooth roof
// Same interface as window.SKETCH_SYMBOLS (BUILDINGS.B[stage], building, unroofed, conjecture, city, topOf, D, R,
// QM_MIN) and the footprints of the hip-roof line B, so that a map could take the symbols over without a new layout.
// No towers and no domes on buildings (glossary); a city may have one or two higher buildings (towers occur only in
// cities, user 22 October 2026). Level of detail by the symbol size s: below 10 silhouette, below 26 windows, below
// 60 window surrounds, sills and cornices, from 60 glazing bars, consoles and balusters.
window.EPOCH_SYMBOLS = (function () {
  "use strict";
  const T = window.TM, { el, text, INK, PAPER } = T, LIGHT = "#efe3c2";
  const g2 = (z) => Math.round(z * 100) / 100;
  const poly = (pts, close) => "M" + pts.map((p) => g2(p[0]) + "," + g2(p[1])).join("L") + (close ? "Z" : "");
  const rectD = (x, y, w, h) => `M${g2(x)},${g2(y)}h${g2(w)}v${g2(h)}h${g2(-w)}Z`;
  const D = 0.16, R = 0.09, QM_MIN = 15;

  const STYLES = {
    classicism: { wall: "#f4ecd8", bay: "#f9f3e4", side: "#ddd0b2", roof: "#d3c8b0", glass: INK, win: { w: 0.36, h: 0.5 } },
    gruenderzeit: { wall: "#f0dfc0", bay: "#f6e9cf", side: "#d6c29d", roof: "#a9a497", glass: INK, win: { w: 0.4, h: 0.56 } },
    "early-modern": { wall: "#f8f5ec", bay: "#ffffff", side: "#dcd8cc", roof: "#cfcbc0", glass: INK, win: { w: 0.62, h: 0.52 } },
  };

  // Stages 4 (least important) to 1 with the footprints (x, w, y0) of line B. axes: window columns; base: rusticated
  // ground floor; risalit: number of axes of the central bay; erker: axes with a bay window; kind "hall": factory hall
  const MASSING = {
    classicism: {
      4: [{ x: -0.55, w: 1.05, h: 0.56, floors: 2, axes: 3, roof: "hip", rh: 0.26, door: "arch", base: true }],
      3: [{ x: -0.7, w: 0.95, h: 0.76, floors: 3, axes: 5, roof: "hip", rh: 0.24, door: "arch", base: true },
        { x: 0.25, w: 0.5, h: 0.44, floors: 2, axes: 2, roof: "hip", rh: 0.16 }],
      2: [{ x: -0.3, w: 0.8, h: 0.56, y0: 0.2, floors: 2, axes: 4, roof: "hip", rh: 0.2 },
        { x: -0.85, w: 1.3, h: 0.74, floors: 3, axes: 7, roof: "hip", rh: 0.24, door: "gate", base: true },
        { x: 0.45, w: 0.42, h: 0.46, floors: 2, axes: 2, roof: "hip", rh: 0.15 }],
      1: [{ x: -0.6, w: 1.2, h: 0.68, y0: 0.24, floors: 3, axes: 6, roof: "hip", rh: 0.2 },
        { x: -0.95, w: 1.4, h: 0.84, floors: 3, axes: 9, roof: "hip", rh: 0.24, door: "arch", base: true, risalit: 3 },
        { x: 0.45, w: 0.45, h: 0.52, floors: 2, axes: 2, roof: "hip", rh: 0.15 }],
    },
    gruenderzeit: {
      4: [{ x: -0.55, w: 1.05, h: 0.52, floors: 2, axes: 3, roof: "mansard", rh: 0.32, door: "arch", base: true }],
      3: [{ x: -0.7, w: 0.95, h: 0.72, floors: 3, axes: 4, roof: "mansard", rh: 0.3, door: "arch", base: true, erker: [1] },
        { x: 0.25, w: 0.5, h: 0.42, floors: 2, axes: 2, roof: "mansard", rh: 0.2 }],
      2: [{ x: -0.3, w: 0.8, h: 0.54, y0: 0.2, floors: 2, axes: 4, roof: "mansard", rh: 0.24 },
        { x: -0.85, w: 1.3, h: 0.72, floors: 3, axes: 6, roof: "mansard", rh: 0.3, door: "arch", base: "shops", erker: [1, 4] },
        { x: 0.45, w: 0.42, h: 0.44, floors: 2, axes: 2, roof: "mansard", rh: 0.18 }],
      1: [{ x: -0.6, w: 1.2, h: 0.66, y0: 0.24, floors: 3, axes: 6, roof: "mansard", rh: 0.24 },
        { x: -0.95, w: 1.4, h: 0.8, floors: 3, axes: 7, roof: "mansard", rh: 0.28, door: "arch", base: true, risalit: 3, erker: [1, 5] },   // rh 0.28 (sketch 0.3): not higher than line B, so that the layout of the map 1900 stays valid
        { x: 0.45, w: 0.45, h: 0.5, floors: 2, axes: 2, roof: "mansard", rh: 0.18 }],
    },
    "early-modern": {
      4: [{ x: -0.55, w: 1.05, h: 0.74, floors: 2, axes: 3, roof: "flat", door: "plain" }],
      3: [{ x: -0.7, w: 0.95, h: 0.94, floors: 3, axes: 4, roof: "flat", door: "plain", strips: true },
        { x: 0.25, w: 0.5, h: 0.5, roof: "saw", kind: "hall", rh: 0.14 }],
      2: [{ x: -0.3, w: 0.8, h: 0.66, y0: 0.2, floors: 2, axes: 4, roof: "flat" },
        { x: -0.85, w: 1.3, h: 0.9, floors: 3, axes: 6, roof: "flat", door: "plain", strips: true, stair: 3 },
        { x: 0.45, w: 0.42, h: 0.52, roof: "saw", kind: "hall", rh: 0.12 }],
      1: [{ x: -0.6, w: 1.2, h: 0.62, y0: 0.24, roof: "saw", kind: "hall", rh: 0.16 },
        { x: -0.95, w: 1.4, h: 1.0, floors: 4, axes: 7, roof: "flat", door: "plain", strips: true, stair: 3 },
        { x: 0.45, w: 0.45, h: 0.64, floors: 2, axes: 2, roof: "flat" }],
    },
  };

  function make(style) {
    const E = STYLES[style] || STYLES.classicism, M = MASSING[style] || MASSING.classicism;
    const CL = style === "classicism", GZ = style === "gruenderzeit", EM = style === "early-modern";

    // height of the roof above the body in units of s (for topOf and the question mark)
    const rise = (p) => (p.ruin ? 0 : p.roof === "flat" ? 0.07 + R : p.roof === "saw" ? (p.rh || 0.14) + R * 0.5 : (p.rh || 0.2) + R * 0.5);

    function part(g, s, p) {
      const lod = s < 10 ? 0 : s < 26 ? 1 : s < 60 ? 2 : 3;
      const sw = 0.55 + s / 60, fine = Math.max(0.3, s * 0.0055);
      const x0 = p.x * s, x1 = (p.x + p.w) * s, w = x1 - x0, xm = (x0 + x1) / 2, yb = -(p.y0 || 0) * s, hs = p.h * s, yt = yb - hs;
      const d = D * s, r = R * s, rh = (p.rh || 0.2) * s, ruin = !!p.ruin, rnd = T.random(p.seed || 7);
      const ink = { stroke: INK, "stroke-linejoin": "round", "stroke-linecap": "round" };
      const face = (pts, fill, k) => el("path", Object.assign({ d: poly(pts, true), fill, "stroke-width": sw * (k || 1) }, ink), g);
      const lines = (dd, wd, op) => dd && el("path", { d: dd, fill: "none", stroke: INK, "stroke-width": wd, opacity: op == null ? 0.8 : op, "stroke-linecap": "round" }, g);
      const fill = (dd, col, op, extra) => dd && el("path", Object.assign({ d: dd, fill: col, opacity: op == null ? 1 : op }, extra || {}), g);
      // broken upper edge of a ruin: the roof is gone, the wall top is jagged (east to west)
      const jagged = () => { const n = Math.max(4, Math.round(w / Math.max(1.6, s * 0.09))), out = [];
        for (let j = 1; j < n; j++) out.push([x1 - j * w / n, yt + (j % 2 ? 0.14 : 0.03 + 0.06 * rnd()) * hs]); return out; };

      // 1 side face (east), hatched vertically
      const sideTop = ruin ? yt + 0.18 * hs : yt;
      face([[x1, yb], [x1 + d, yb - r], [x1 + d, sideTop - r], [x1, ruin ? yt + 0.05 * hs : yt]], E.side, 0.8);
      const step = Math.max(1.1, s * 0.055), hh = [];
      for (let x = x1 + step * 0.6; x < x1 + d - 0.3; x += step) { const k = r * (x - x1) / d; hh.push(`M${g2(x)},${g2(sideTop - k + 0.6)}V${g2(yb - k - 0.4)}`); }
      lines(hh.join(""), 0.5, 0.7);

      // 2 roof
      if (!ruin) roof(g, s, p, { x0, x1, w, yt, d, r, rh, sw, lod, face, lines, fill, fine });

      // 3 front face
      face(ruin ? [[x0, yb], [x1, yb], [x1, yt + 0.05 * hs]].concat(jagged(), [[x0, yt + 0.1 * hs]]) : [[x0, yb], [x1, yb], [x1, yt], [x0, yt]], E.wall);
      if (lod === 0) return;

      if (p.kind === "hall") return hall(g, s, p, { x0, x1, w, xm, yb, yt, hs, ruin, lod, sw, fine, lines, fill, face });

      const fl = p.floors || 1, hf = hs / fl, n = p.axes || Math.max(1, Math.round(w / (0.2 * s))), mg = 0.06 * w, aw = (w - 2 * mg) / n;
      const ax = (i) => x0 + mg + (i + 0.5) * aw;
      const rs = p.risalit ? Math.floor((n - p.risalit) / 2) : -1, inRis = (i) => p.risalit && i >= rs && i < rs + p.risalit;
      const rx0 = p.risalit ? x0 + mg + rs * aw - 0.02 * s : 0, rx1 = p.risalit ? x0 + mg + (rs + p.risalit) * aw + 0.02 * s : 0;
      const rTop = yt - 0.07 * s;   // the central bay rises above the main cornice

      // central bay: lighter, slightly projecting (narrow east face), with an attic (classicism) or its own higher roof
      if (p.risalit && !ruin) {
        if (GZ) { const prh = rh * 1.25, ins = Math.min(prh * 0.5, (rx1 - rx0) * 0.25);   // pavilion roof of the bay
          face([[rx1, rTop], [rx1 - ins, rTop - prh], [rx1 - ins + d * 0.4, rTop - prh - r * 0.4], [rx1 + d * 0.4, rTop - r * 0.4]], E.roof, 0.8);
          face([[rx0, rTop], [rx0 + ins, rTop - prh], [rx1 - ins, rTop - prh], [rx1, rTop]], E.roof, 0.9); }
        face([[rx1, yb], [rx1 + 0.04 * s, yb - 0.02 * s], [rx1 + 0.04 * s, rTop - 0.02 * s], [rx1, rTop]], E.side, 0.6);
        face([[rx0, yb], [rx1, yb], [rx1, rTop], [rx0, rTop]], E.bay, 0.8);
        if (CL) {   // attic with balusters over the bay
          face([[rx0 - 0.01 * s, rTop], [rx1 + 0.01 * s, rTop], [rx1 + 0.01 * s, rTop - 0.07 * s], [rx0 - 0.01 * s, rTop - 0.07 * s]], E.bay, 0.8);
          if (lod >= 3) { const bl = []; for (let x = rx0 + 0.03 * s; x < rx1 - 0.02 * s; x += 0.025 * s) bl.push(`M${g2(x)},${g2(rTop - 0.012 * s)}V${g2(rTop - 0.05 * s)}`);
            lines(bl.join(""), fine, 0.7); }
        }
        if (lod >= 2) {   // pilasters over the upper floors at the edges of the bay
          const pl = [];
          [rx0 + 0.025 * s, rx1 - 0.025 * s].concat(lod >= 3 ? Array.from({ length: p.risalit - 1 }, (_, j) => x0 + mg + (rs + j + 1) * aw) : []).forEach((x) => {
            pl.push(`M${g2(x - 0.012 * s)},${g2(yb - hf)}V${g2(rTop + 0.01 * s)}M${g2(x + 0.012 * s)},${g2(yb - hf)}V${g2(rTop + 0.01 * s)}`); });
          lines(pl.join(""), fine, 0.75);
        }
      }

      // rusticated ground floor and string course
      if (p.base && lod >= 1 && fl > 1) {
        const rj = [], nj = lod >= 2 ? 5 : 3;
        for (let k = 1; k < nj; k++) rj.push(`M${g2(x0)},${g2(yb - k * hf / nj)}H${g2(x1)}`);
        if (lod >= 3) for (let k = 0; k < nj; k++) for (let x = x0 + (k % 2 ? 0.06 : 0.12) * s; x < x1; x += 0.12 * s) rj.push(`M${g2(x)},${g2(yb - k * hf / nj)}v${g2(-hf / nj)}`);
        if (!ruin || true) lines(rj.join(""), fine, 0.45);
      }
      if (fl > 1 && lod >= 1) lines(`M${g2(x0)},${g2(yb - hf)}H${g2(x1)}` + (lod >= 2 ? `M${g2(x0)},${g2(yb - hf - 0.012 * s)}H${g2(x1)}` : ""), lod >= 2 ? fine * 1.4 : 0.5, 0.75);
      // pilaster strips of the early modern block: light vertical bands between the axes
      if (p.strips && lod >= 1) {
        const ps = []; for (let i = 0; i <= n; i++) { const x = x0 + mg + i * aw; ps.push(rectD(x - 0.018 * s, ruin ? yt + 0.2 * hs : yt + 0.05 * s, 0.036 * s, (yb - (ruin ? yt + 0.2 * hs : yt + 0.05 * s)))); }
        fill(ps.join(""), E.bay, 1, { stroke: INK, "stroke-width": fine, "stroke-opacity": 0.6 });
      }

      // windows, bay windows (Erker), door
      const erk = new Set(p.erker || []), cut = (y) => ruin && y < yt + 0.26 * hs;
      const W = E.win, ww = Math.min(W.w * aw, (EM ? 0.12 : 0.08) * s), dark = [], frames = [], light = [], cornices = [], peds = [], sills = [];
      const doorAxis = p.door ? (n % 2 ? (n - 1) / 2 : n / 2 - 0.5) : -9, stair = p.stair != null ? p.stair : -9;
      for (let k = 0; k < fl; k++) for (let i = 0; i < n; i++) {
        if (k === 0 && Math.abs(i - doorAxis) < 0.6) continue;
        if (erk.has(i) && k >= 1 && k < fl) continue;
        const cx = ax(i), shop = k === 0 && p.base === "shops", wd = shop ? Math.min(aw * 0.75, 0.15 * s) : ww;
        const wh = i === stair && EM ? hf * 0.82 : hf * (k === 0 && p.base ? 0.42 : W.h) * (shop ? 1.35 : 1), cy = yb - k * hf - hf * (shop ? 0.42 : 0.52);
        if (cut(cy - wh / 2)) continue;
        const arch = (k === 0 && p.base && CL && lod >= 2) || shop;
        win(cx, cy, wd, wh, arch, k);
      }
      function win(cx, cy, wd, wh, arch, k) {
        const top = cy - wh / 2, x = cx - wd / 2, rr = wd / 2;
        const shape = arch ? `M${g2(x)},${g2(cy + wh / 2)}V${g2(top + rr)}A${g2(rr)},${g2(rr)} 0 0 1 ${g2(x + wd)},${g2(top + rr)}V${g2(cy + wh / 2)}Z` : rectD(x, top, wd, wh);
        if (ruin) { frames.push(shape); return; }
        if (lod >= 2 && !EM) frames.push(arch ? `M${g2(x - 0.012 * s)},${g2(cy + wh / 2)}V${g2(top + rr)}A${g2(rr + 0.012 * s)},${g2(rr + 0.012 * s)} 0 0 1 ${g2(x + wd + 0.012 * s)},${g2(top + rr)}V${g2(cy + wh / 2)}Z` : rectD(x - 0.012 * s, top - 0.012 * s, wd + 0.024 * s, wh + 0.012 * s));
        dark.push(shape);
        if (lod >= 2) sills.push(rectD(x - 0.018 * s, cy + wh / 2, wd + 0.036 * s, 0.012 * s));
        if (lod >= 3) {   // glazing bars: cross with a transom (classicism, Gründerzeit) or a grid of small panes (early modern)
          if (EM) { for (let j = 1; j < 3; j++) light.push(`M${g2(x + j * wd / 3)},${g2(top)}V${g2(cy + wh / 2)}`);
            for (let j = 1; j < 4; j++) light.push(`M${g2(x)},${g2(top + j * wh / 4)}H${g2(x + wd)}`); }
          else light.push(`M${g2(cx)},${g2(top + (arch ? rr : 0))}V${g2(cy + wh / 2)}M${g2(x)},${g2(top + wh * 0.32)}H${g2(x + wd)}`);
        }
        // window heads: straight cornice on the main floor (classicism); alternating triangular and segmental
        // pediments on the main floor, straight cornices above (Gründerzeit)
        if (lod >= 2 && k >= 1 && !arch) {
          const cw = wd + 0.05 * s, cyH = top - 0.03 * s;
          if (CL && k === 1) cornices.push(rectD(cx - cw / 2, cyH, cw, 0.016 * s));
          if (GZ && k === 1) { const ph = 0.045 * s;
            peds.push((Math.round(cx / aw) % 2) ? `M${g2(cx - cw / 2)},${g2(cyH + 0.01 * s)}L${g2(cx)},${g2(cyH - ph)}L${g2(cx + cw / 2)},${g2(cyH + 0.01 * s)}Z`
              : `M${g2(cx - cw / 2)},${g2(cyH + 0.01 * s)}Q${g2(cx)},${g2(cyH - 1.4 * ph)} ${g2(cx + cw / 2)},${g2(cyH + 0.01 * s)}Z`); }
          if (GZ && k >= 2) cornices.push(rectD(cx - cw / 2, cyH, cw, 0.014 * s));
        }
      }
      // bay windows: a projecting box over the upper floors with its own small roof or balcony, on a corbel
      if (!ruin && GZ && lod >= 1) [...erk].forEach((i) => {
        const cx = ax(i), ew = aw * 0.92, ex0 = cx - ew / 2, ey0 = yb - hf * 0.95, ey1 = yt + 0.05 * s, pr = 0.045 * s;
        face([[ex0 + ew, ey0], [ex0 + ew + pr, ey0 - pr * 0.5], [ex0 + ew + pr, ey1 - pr * 0.5], [ex0 + ew, ey1]], E.side, 0.6);
        face([[ex0, ey0], [ex0 + ew, ey0], [ex0 + ew, ey1], [ex0, ey1]], E.bay, 0.7);
        face([[ex0 + 0.1 * ew, ey0], [ex0 + 0.9 * ew, ey0], [cx, ey0 + 0.1 * s]], E.bay, 0.6);   // corbel
        face([[ex0 - 0.01 * s, ey1], [ex0 + ew + 0.01 * s, ey1], [ex0 + ew + pr, ey1 - pr * 0.5 - 0.03 * s], [ex0 + 0.02 * s, ey1 - 0.06 * s]], E.roof, 0.6);   // cap
        for (let k = 1; k < fl; k++) { const cy = yb - k * hf - hf * 0.5; win(cx, cy, Math.min(ew * 0.6, 0.09 * s), hf * 0.56, false, 0); }
        if (lod >= 3) {   // balcony with balusters on top of the bay
          const by = ey1 - 0.06 * s, bl = [`M${g2(ex0)},${g2(by)}H${g2(ex0 + ew)}`];
          for (let x = ex0 + 0.015 * s; x < ex0 + ew; x += 0.022 * s) bl.push(`M${g2(x)},${g2(by)}v${g2(0.045 * s)}`);
          lines(bl.join(""), fine, 0.8);
        }
      });
      fill(frames.join(""), ruin ? PAPER : E.bay, 1, { stroke: INK, "stroke-width": ruin ? 0.5 : fine, "stroke-opacity": ruin ? 0.8 : 0.6 });
      fill(dark.join(""), E.glass, 0.78);
      fill(light.join(""), "none", 0.85, { stroke: E.bay, "stroke-width": fine });
      fill(sills.join("") + cornices.join("") + peds.join(""), E.bay, 1, { stroke: INK, "stroke-width": fine, "stroke-opacity": 0.75 });

      // door: arched door with steps, gate passage, or a plain door with a flat canopy
      if (p.door && !ruin) {
        const cx = xm + (n % 2 ? 0 : 0), dw = p.door === "gate" ? Math.min(aw * 0.95, 0.2 * s) : Math.min(aw * 0.55, 0.11 * s), dh = Math.min(hf * 0.8, dw * (p.door === "gate" ? 1.3 : 1.9)), rr = dw / 2;
        if (p.door === "plain") {
          fill(rectD(cx - dw / 2, yb - dh, dw, dh), E.glass, 0.8);
          if (lod >= 2) fill(rectD(cx - dw * 0.8, yb - dh - 0.02 * s, dw * 1.6, 0.018 * s), E.bay, 1, { stroke: INK, "stroke-width": fine });
        } else {
          if (lod >= 2) fill(`M${g2(cx - rr - 0.02 * s)},${g2(yb)}V${g2(yb - dh + rr)}A${g2(rr + 0.02 * s)},${g2(rr + 0.02 * s)} 0 0 1 ${g2(cx + rr + 0.02 * s)},${g2(yb - dh + rr)}V${g2(yb)}Z`, E.bay, 1, { stroke: INK, "stroke-width": fine });
          fill(`M${g2(cx - rr)},${g2(yb)}V${g2(yb - dh + rr)}A${g2(rr)},${g2(rr)} 0 0 1 ${g2(cx + rr)},${g2(yb - dh + rr)}V${g2(yb)}Z`, E.glass, 0.82);
          if (lod >= 3 && p.door !== "gate") lines(`M${g2(cx)},${g2(yb)}V${g2(yb - dh + rr * 0.6)}`, fine, 0.6);
        }
        if (lod >= 2) fill(rectD(cx - dw * 0.9, yb - 0.012 * s, dw * 1.8, 0.012 * s) + rectD(cx - dw * 0.75, yb - 0.024 * s, dw * 1.5, 0.012 * s), E.bay, 1, { stroke: INK, "stroke-width": fine * 0.8 });   // steps
      }
      // main cornice: a light band under the roof, on consoles in the Gründerzeit
      if (!ruin && lod >= 1 && p.roof !== "flat") {
        fill(rectD(x0 - 0.02 * s, yt, w + 0.04 * s, 0.025 * s), E.bay, 1, { stroke: INK, "stroke-width": fine, "stroke-opacity": 0.8 });
        if (GZ && lod >= 2) { const cs = []; for (let x = x0 + 0.02 * s; x < x1 - 0.01 * s; x += 0.045 * s) cs.push(rectD(x, yt + 0.025 * s, 0.014 * s, 0.022 * s));
          fill(cs.join(""), E.bay, 1, { stroke: INK, "stroke-width": fine * 0.8 }); }
      }
    }

    function roof(g, s, p, o) {
      const { x0, x1, w, yt, d, r, rh, lod, face, lines, fill, fine } = o;
      const hatchPlane = (A, B, C) => lines([0.3, 0.65].map((t) => `M${g2(A[0] + t * (C[0] - A[0]) + 0.3)},${g2(A[1] + t * (C[1] - A[1]) + 0.6)}L${g2(B[0] + t * (C[0] - A[0]) - 0.3)},${g2(B[1] + t * (C[1] - A[1]) - 0.2)}`).join(""), 0.5, 0.6);
      const chimney = (x, base, h) => face([[x, base], [x + 0.05 * s, base], [x + 0.05 * s, base - h], [x, base - h]], E.side, 0.7);
      if (p.roof === "hip") {   // low hip roof
        const ins = Math.min(rh * 1.1, w * 0.3);
        face([[x1, yt], [x1 - ins, yt - rh], [x1 - ins + d, yt - rh - r], [x1 + d, yt - r]], E.side);
        hatchPlane([x1 - ins, yt - rh], [x1, yt], [x1 + d, yt - r]);
        face([[x0, yt], [x0 + ins, yt - rh], [x1 - ins, yt - rh], [x1, yt]], E.roof);
        if (lod >= 1 && w > 0.5 * s) { chimney(x0 + ins + 0.1 * w, yt - rh + 0.02 * s, 0.09 * s); chimney(x1 - ins - 0.1 * w - 0.05 * s, yt - rh + 0.02 * s, 0.09 * s); }
        if (lod >= 3) {   // small lying dormers (Fledermausgauben are later; here plain hatches)
          const dm = []; for (let x = x0 + ins + 0.12 * s; x < x1 - ins - 0.1 * s; x += 0.22 * s) dm.push(rectD(x, yt - rh * 0.55, 0.06 * s, 0.035 * s));
          fill(dm.join(""), INK, 0.6);
        }
      } else if (p.roof === "mansard") {   // steep lower slope with dormers, flat upper slope
        const lo = rh * 0.68, m = 0.035 * s, ins = Math.min((rh - lo) * 2.2, w * 0.3);
        face([[x1, yt], [x1 - m, yt - lo], [x1 - m + d, yt - lo - r], [x1 + d, yt - r]], E.side);
        face([[x1 - m, yt - lo], [x1 - m - ins, yt - rh], [x1 - m - ins + d, yt - rh - r], [x1 - m + d, yt - lo - r]], E.roof, 0.8);
        face([[x0, yt], [x0 + m, yt - lo], [x1 - m, yt - lo], [x1, yt]], E.roof);
        face([[x0 + m, yt - lo], [x0 + m + ins, yt - rh], [x1 - m - ins, yt - rh], [x1 - m, yt - lo]], E.side, 0.8);
        if (lod >= 1) {   // dormers on the lower slope, one per axis or every second axis
          const n = p.axes || 3, mg = 0.06 * w, aw = (w - 2 * mg) / n, dw = Math.min(aw * 0.45, 0.07 * s), dh = lo * 0.6, dms = [], win = [];
          for (let i = 0; i < n; i++) { if (lod < 2 && i % 2) continue; const cx = x0 + mg + (i + 0.5) * aw, by = yt - lo * 0.12;
            dms.push(i % 2 && lod >= 2 ? `M${g2(cx - dw / 2)},${g2(by)}V${g2(by - dh + dw / 2)}A${g2(dw / 2)},${g2(dw / 2)} 0 0 1 ${g2(cx + dw / 2)},${g2(by - dh + dw / 2)}V${g2(by)}Z`
              : `M${g2(cx - dw / 2)},${g2(by)}V${g2(by - dh * 0.75)}L${g2(cx)},${g2(by - dh * 1.05)}L${g2(cx + dw / 2)},${g2(by - dh * 0.75)}V${g2(by)}Z`);
            win.push(rectD(cx - dw * 0.28, by - dh * 0.62, dw * 0.56, dh * 0.5)); }
          fill(dms.join(""), E.bay, 1, { stroke: INK, "stroke-width": Math.max(fine, 0.4) });
          fill(win.join(""), INK, 0.75);
        }
        if (lod >= 1 && w > 0.5 * s) chimney(x1 - m - ins - 0.12 * w, yt - rh + 0.01 * s, 0.1 * s);
        if (lod >= 3) {   // cresting along the ridge
          const cr = []; for (let x = x0 + m + ins; x < x1 - m - ins; x += 0.03 * s) cr.push(`M${g2(x)},${g2(yt - rh)}v${g2(-0.025 * s)}`);
          lines(cr.join("") + `M${g2(x0 + m + ins)},${g2(yt - rh - 0.025 * s)}H${g2(x1 - m - ins)}`, fine, 0.7);
        }
      } else if (p.roof === "flat") {   // flat roof: a thin projecting cornice and the roof surface behind it
        const o2 = 0.025 * s, c = 0.05 * s;
        face([[x0 - o2, yt - c], [x1 + o2, yt - c], [x1 + o2 + d, yt - c - r], [x0 - o2 + d, yt - c - r]], E.roof, 0.8);
        face([[x1 + o2, yt], [x1 + o2 + d, yt - r], [x1 + o2 + d, yt - c - r], [x1 + o2, yt - c]], E.side, 0.7);
        face([[x0 - o2, yt], [x1 + o2, yt], [x1 + o2, yt - c], [x0 - o2, yt - c]], E.bay, 0.8);
      } else if (p.roof === "saw") {   // sawtooth roof of a factory hall: glazed steep faces towards the north (back)
        const n = Math.max(2, Math.round(w / (0.16 * s))), tw = w / n, pts = [[x0, yt]];
        for (let i = 0; i < n; i++) pts.push([x0 + i * tw, yt - rh], [x0 + (i + 1) * tw, yt]);
        face(pts.concat([[x1, yt]]), E.roof);
        // the teeth run east-west, so the east side shows only the eaves; the last tooth's ridge runs back in depth
        face([[x0 + (n - 1) * tw, yt - rh], [x0 + (n - 1) * tw + d, yt - rh - r], [x1 + d, yt - r], [x1, yt]], E.roof, 0.7);
        if (lod >= 1) { const gl = []; for (let i = 0; i < n; i++) gl.push(`M${g2(x0 + i * tw + 0.01 * s)},${g2(yt - rh * 0.15)}V${g2(yt - rh * 0.85)}`); lines(gl.join(""), Math.max(0.5, fine * 2), 0.7); }
      }
    }

    // Factory hall (early modern): one large window of small panes between two brick piers, a low door
    function hall(g, s, p, o) {
      const { x0, x1, w, xm, yb, yt, hs, ruin, lod, fine, lines, fill } = o;
      const pier = 0.07 * s, wx0 = x0 + pier, wx1 = x1 - pier, wy0 = yt + 0.08 * s, wy1 = yb - 0.08 * s;
      if (ruin) { fill(rectD(wx0, yt + 0.25 * hs, wx1 - wx0, wy1 - yt - 0.25 * hs), PAPER, 1, { stroke: INK, "stroke-width": 0.5 }); return; }
      fill(rectD(wx0, wy0, wx1 - wx0, wy1 - wy0), INK, 0.75);
      if (lod >= 2) { const gl = [], nx = Math.max(3, Math.round((wx1 - wx0) / (0.05 * s))), ny = Math.max(3, Math.round((wy1 - wy0) / (0.05 * s)));
        for (let i = 1; i < nx; i++) gl.push(`M${g2(wx0 + i * (wx1 - wx0) / nx)},${g2(wy0)}V${g2(wy1)}`);
        for (let j = 1; j < ny; j++) gl.push(`M${g2(wx0)},${g2(wy0 + j * (wy1 - wy0) / ny)}H${g2(wx1)}`);
        fill(gl.join(""), "none", 0.85, { stroke: E.bay, "stroke-width": fine * (lod >= 3 ? 1 : 0.8) }); }
      if (lod >= 2) lines(`M${g2(x0 + pier * 0.5)},${g2(yb)}V${g2(yt)}M${g2(x1 - pier * 0.5)},${g2(yb)}V${g2(yt)}`, fine, 0.5);
    }

    const ground = (g, s) => el("path", { d: `M${g2(0.15 * s)},1.5h${g2(0.8 * s)}M${g2(0.45 * s)},4h${g2(0.5 * s)}`, stroke: INK, "stroke-width": 0.6, opacity: 0.55 }, g);
    function building(g, s, parts) { parts.forEach((p) => part(g, s, p)); ground(g, s); }
    const stages = {}; [1, 2, 3, 4].forEach((k) => (stages[k] = M[k]));
    const BUILDINGS = { A: stages, B: stages };
    const unroofed = (parts) => parts.map((p, i) => Object.assign({}, p, { ruin: true, seed: 3 + i }));
    const topOf = (s, parts) => Math.max(...parts.map((p) => ((p.y0 || 0) + p.h + rise(p) + (p.risalit && GZ ? 0.12 : p.risalit ? 0.08 : 0)) * s));
    function conjecture(g, s, parts, sym) {
      building(g, s, parts);
      const fs = Math.max(0.8 * s, QM_MIN / sym);
      text("?", { x: g2(0.05 * s), y: g2(-topOf(s, parts) - 0.12 * s), "font-size": g2(fs), "text-anchor": "middle", class: "map", "font-weight": "bold",
        stroke: LIGHT, "stroke-width": g2(fs * 0.12), "paint-order": "stroke", "stroke-linejoin": "round" }, g);
    }

    // City: rows of houses of the period, staggered in depth as in the shared symbols; the higher buildings are a town
    // hall tower with a low pyramid roof (classicism), a tower with a pointed helmet (Gründerzeit), or a factory chimney
    // with a water tower (early modern)
    const CITY = { klein: { rows: 3, hw: 12, towers: [[0, 0.5]] }, mittel: { rows: 4, hw: 14, towers: [[0, 0.35], [1, 0.75]] }, gross: { rows: 5, hw: 16, towers: [[1, 0.3], [0, 0.72]] } };
    function city(g, s, size, seed) {
      const u = s / 16, c = CITY[size], rnd = T.random(seed), bs = 6.6 * u, step = bs * 0.48, foot = 8 * u, shift = 0.22 * bs;
      for (let k = 0; k < c.rows; k++) {
        const back = c.rows - 1 - k, sc = 1 - 0.05 * back, hw = c.hw * u * (0.72 + 0.28 * k / Math.max(1, c.rows - 1)), x0 = back * shift;
        const g0 = el("g", { transform: `translate(${g2(x0)} ${g2(foot - back * step)}) scale(${g2(sc)})` }, g), b = bs;
        const towers = c.towers.filter((t) => t[0] === k).map((t) => (-hw + t[1] * 2 * hw) / sc);
        let x = (-hw + (k % 2 ? 0.25 * b : 0)) / sc;
        while (x < hw / sc - 0.45 * b) {
          const tw = towers.find((t) => Math.abs(t - x) < 0.5 * b), dy = (rnd() - 0.5) * 0.08;
          let w;
          if (tw != null) { w = 0.36; tower(g0, b, x / b, w, dy); }
          else {
            w = 0.5 + 0.25 * rnd(); const fl = rnd() < 0.5 ? 2 : 3, h = 0.32 + 0.12 * fl * (0.8 + 0.3 * rnd());
            const p = EM ? (rnd() < 0.25 ? { roof: "saw", kind: "hall", rh: 0.12, h: h * 0.8 } : { roof: "flat", floors: fl, axes: 3, h: h + 0.1 })
              : { roof: GZ ? "mansard" : "hip", rh: GZ ? 0.24 : 0.2, floors: fl, axes: Math.max(2, Math.round(w / 0.2)), h, base: fl === 3 };
            part(g0, b, Object.assign({ x: x / b, w, y0: dy }, p));
          }
          x += w * b * 0.98;
        }
      }
    }
    function tower(g, s, x, w, y0) {
      if (EM) {   // factory chimney (tapering, with bands)
        const x0 = x * s, x1 = (x + w * 0.45) * s, yb = -y0 * s, yt = yb - 1.6 * s, t = 0.04 * s;
        el("path", { d: poly([[x0, yb], [x1, yb], [x1 - t, yt], [x0 + t, yt]], true), fill: "#d9c3a8", stroke: INK, "stroke-width": 0.55 + s / 60, "stroke-linejoin": "round" }, g);
        el("path", { d: `M${g2(x0 + t * 0.9)},${g2(yt + 0.1 * s)}H${g2(x1 - t * 0.9)}M${g2(x0 + t * 0.7)},${g2(yt + 0.5 * s)}H${g2(x1 - t * 0.7)}`, stroke: INK, "stroke-width": 0.5, opacity: 0.7 }, g);
        part(g, s, { x: x + w * 0.45, w: w * 0.9, h: 0.55, y0, roof: "flat", floors: 2, axes: 1 });
        return;
      }
      part(g, s, { x, w, h: 1.05, y0, roof: "hip", rh: GZ ? 0.55 : 0.22, floors: 4, axes: 1 });
    }

    return { style, D, R, QM_MIN, part, ground, building, BUILDINGS, unroofed, topOf, conjecture, CITY, city };
  }
  return { make, styles: Object.keys(STYLES) };
})();
