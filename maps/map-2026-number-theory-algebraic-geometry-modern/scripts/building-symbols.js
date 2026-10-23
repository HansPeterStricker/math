// Buildings of the modern map (map-2026-number-theory-algebraic-geometry-modern, 23 October 2026), in the manner of
// the style preview maps/stile/style-5-20th-century.js (Swiss topographic maps, Imhof). Same interface as the copy of
// draft 11 (window.SKETCH_SYMBOLS), so that the page code places and measures the symbols unchanged: a building is a
// list of parts { x, w, h, y0, floors } in units of the symbol size s, foot at y = 0, x from about -0.95 s to 0.9 s.
// The parts keep the footprint and roughly the height of the buildings of draft 11, so the layout stays valid.
// Three variants for the proposal (?buildings=a|b|c, default b):
//   a  flat-roofed blocks in ink lines (classic modernism): white front, grey side, ribbon windows
//   b  volumes in flat colours without hatching, lit from the north-west like the mountains of style 5
//   c  plan pictograms as on topographic maps: the footprint filled dark; a ruin is the footprint outline only
// Historic styles (user, 23 October 2026: buildings in at least three styles after the period of the theorem):
//   medieval   before 1700: steep tiled roofs, half-timbering on a stone ground floor, stepped gables, arcades
//   classical  1700 to 1899: secular buildings only (user, 23 October 2026: no temples): low slate hip roofs, cornice,
//              tall windows in rows, rusticated ground floor, a raised central bay (risalit) with pilasters
//   (modern    from 1900: variant b)
//   era        trial (?buildings=era): each building in the style of its year (forYear), cities as well; the map
//              uses variant b for every building (user, 23 October 2026)
// No towers and no domes in any style (glossary). make(v) returns the symbols of one variant (the sketch page
// skizzen/gebaeude-modern.html shows all of them).
(function () {
  "use strict";
  const T = window.TM, { el, text, f, INK, PAPER } = T, LIGHT = "#ffffff";
  const g2 = (z) => Math.round(z * 100) / 100;
  const poly = (pts, close) => "M" + pts.map((p) => g2(p[0]) + "," + g2(p[1])).join("L") + (close ? "Z" : "");
  const D = 0.16, R = 0.09;   // depth and rise of the side face (as in draft 11, so the boxes stay the same)
  const SANS = "'Fira Sans', 'Segoe UI', Arial, sans-serif";

  const STYLES = {
    a: { front: "#ffffff", side: "#d3d7de", top: "#eef0f3", line: INK, win: INK, winOp: 0.62, sideWin: "#7b8291", glass: "#c9d6e3", outline: true },
    b: { front: "#f7f3ea", side: "#8f95ad", top: "#fff2cf", line: "#5b6075", win: "#5d6884", winOp: 0.85, sideWin: "#5f6580", glass: "#b9c7d8", outline: false },
  };

  // Stages 4 (least important) to 1. Each stage adds floors, a wing or a slab instead of scaling. Parts are drawn in
  // order: rear parts first (y0 > 0), then from west to east, so that every side face lies behind the next front.
  // kind: "ribbon" (horizontal window bands), "grid" (slab with a window grid), "pilotis" (raised on columns)
  const MASSING = {
    4: [{ x: -0.52, w: 1.0, h: 0.72, floors: 2 }],
    3: [{ x: -0.72, w: 0.9, h: 0.98, floors: 3 },
      { x: 0.18, w: 0.62, h: 0.48, floors: 1 }],
    2: [{ x: -0.35, w: 0.95, h: 0.62, y0: 0.2, floors: 2 },
      { x: -0.9, w: 0.42, h: 1.12, floors: 4, kind: "grid" },
      { x: -0.48, w: 1.32, h: 0.55, floors: 2, kind: "pilotis" }],
    1: [{ x: -0.5, w: 0.82, h: 1.12, y0: 0.2, floors: 6, kind: "grid" },
      { x: -0.95, w: 1.4, h: 0.48, floors: 2, kind: "pilotis" },
      { x: 0.45, w: 0.45, h: 0.74, floors: 3 }],
  };
  // Plan pictograms (variant c): footprint polygons in units of s, foot at y = 0; the parts give the box
  const PLANS = {
    4: [[-0.42, 0], [0.42, 0], [0.42, -0.62], [-0.42, -0.62]],
    3: [[-0.7, 0], [0.7, 0], [0.7, -0.42], [-0.18, -0.42], [-0.18, -0.92], [-0.7, -0.92]],
    2: [[-0.85, 0], [-0.4, 0], [-0.4, -0.55], [0.4, -0.55], [0.4, 0], [0.85, 0], [0.85, -1.0], [-0.85, -1.0]],
    1: [[-0.95, 0], [0.75, 0], [0.75, -1.15], [-0.95, -1.15], [-0.95, 0], [-0.6, -0.3], [-0.6, -0.85], [0.4, -0.85], [0.4, -0.3], [-0.6, -0.3]],
  };
  const PLAN_ANNEX = { 1: [[0.75, -0.18], [0.95, -0.18], [0.95, -0.7], [0.75, -0.7]] };

  // Historic styles: flat colours as variant b, lit from the north-west; the line colour is a dark tone of the material
  const ERA = {
    medieval: { wall: "#f4ead3", side: "#c9b893", stone: "#d6cfc0", stoneSide: "#a39b8a", timber: "#76563a", roof: "#bd5c3e", roofSide: "#8e3f2b",
      win: "#4a3c30", line: "#5c4733" },
    classical: { wall: "#efe2c2", side: "#bcaa86", col: "#fcf9f1", bay: "#f7eed9", roof: "#7a8494", roofSide: "#555e6d", win: "#4f5a72",
      line: "#5d5f6c" },
  };
  // Same footprints (x, w, y0) as MASSING, so that the layout stays valid; the body is lower and the roof (rh, in units
  // of s) brings the total height back to that of the modern blocks. kind: "gable" (gable to the front), "arcade"
  // (open arches in the ground floor), "risalit" (raised central bay with pilasters and a door); default: eaves to the
  // front (medieval) or hip roof (classical).
  const ERA_MASSING = {
    medieval: {
      4: [{ x: -0.52, w: 1.0, h: 0.42, floors: 1, rh: 0.3 }],
      3: [{ x: -0.72, w: 0.9, h: 0.58, floors: 2, kind: "gable", rh: 0.44 },
        { x: 0.18, w: 0.62, h: 0.34, floors: 1, rh: 0.24 }],
      2: [{ x: -0.35, w: 0.95, h: 0.46, y0: 0.2, floors: 2, rh: 0.3 },
        { x: -0.9, w: 0.42, h: 0.62, floors: 2, kind: "gable", rh: 0.4 },
        { x: -0.48, w: 1.32, h: 0.44, floors: 2, kind: "arcade", rh: 0.26 }],
      1: [{ x: -0.5, w: 0.82, h: 0.66, y0: 0.2, floors: 3, kind: "gable", rh: 0.5 },
        { x: -0.95, w: 1.4, h: 0.44, floors: 2, kind: "arcade", rh: 0.26 },
        { x: 0.45, w: 0.45, h: 0.5, floors: 2, kind: "gable", rh: 0.36 }],
    },
    classical: {
      4: [{ x: -0.52, w: 1.0, h: 0.56, floors: 2, rh: 0.15 }],
      3: [{ x: -0.72, w: 0.9, h: 0.72, floors: 3, kind: "risalit", rh: 0.15 },
        { x: 0.18, w: 0.62, h: 0.42, floors: 1, rh: 0.12 }],
      2: [{ x: -0.35, w: 0.95, h: 0.6, y0: 0.2, floors: 2, rh: 0.14 },
        { x: -0.9, w: 0.42, h: 0.82, floors: 3, rh: 0.14 },
        { x: -0.48, w: 1.32, h: 0.5, floors: 2, kind: "risalit", rh: 0.15 }],
      1: [{ x: -0.5, w: 0.82, h: 0.9, y0: 0.2, floors: 3, rh: 0.16 },
        { x: -0.95, w: 1.4, h: 0.52, floors: 2, kind: "risalit", rh: 0.15 },
        { x: 0.45, w: 0.45, h: 0.62, floors: 2, rh: 0.14 }],
    },
  };
  const ERA_OF = (year) => (year < 1700 ? "medieval" : year < 1900 ? "classical" : "b");

  function make(variant) {
    const V = ["a", "c", "medieval", "classical"].includes(variant) ? variant : "b", S = STYLES[V === "c" ? "a" : V] || STYLES.b;
    const HIST = !!ERA[V], E = ERA[V];
    const sw = (s) => 0.5 + s / 70;

    // ---------------------------------------------------------- Block in oblique view (variants a and b)
    function block(g, s, p) {
      if (HIST) return eraBlock(g, s, p);
      const x0 = p.x * s, x1 = (p.x + p.w) * s, yb = -(p.y0 || 0) * s, yt = yb - p.h * s, d = D * s, r = R * s;
      const ruin = !!p.ruin, rnd = T.random(p.seed || 5), lw = sw(s);
      const st = S.outline || V === "b" ? { stroke: S.line, "stroke-width": V === "b" ? lw * 0.55 : lw, "stroke-linejoin": "round" } : {};
      const face = (pts, fill) => el("path", Object.assign({ d: poly(pts, true), fill }, st), g);
      // a ruin has lost its roof slab: the upper edge is broken, the top face is missing
      const jag = (a, b, n) => { const out = []; for (let j = 1; j < n; j++) { const t = j / n;
        out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]) + (j % 2 ? 0.18 : 0.04 + 0.08 * rnd()) * p.h * s]); } return out; };
      const nj = Math.max(4, Math.round((x1 - x0) / Math.max(1.6, s * 0.1)));
      const hf = (yb - yt) / (p.floors || 1), pil = p.kind === "pilotis" ? hf * 0.55 : 0;
      // side face (east), lit less
      face(ruin ? [[x1, yb], [x1 + d, yb - r], [x1 + d, yt - r + p.h * s * 0.2], [x1, yt + p.h * s * 0.06]] : [[x1, yb], [x1 + d, yb - r], [x1 + d, yt - r], [x1, yt]], S.side);
      if (!ruin) face([[x0, yt], [x1, yt], [x1 + d, yt - r], [x0 + d, yt - r]], S.top);
      // front face; pilotis: the ground storey is recessed into shadow, columns stand in front
      const front = ruin ? [[x0, yb], [x1, yb], [x1, yt + p.h * s * 0.06]].concat(jag([x1, yt], [x0, yt], nj), [[x0, yt + p.h * s * 0.1]]) :
        [[x0, yb - pil], [x1, yb - pil], [x1, yt], [x0, yt]];
      face(front, S.front);
      if (pil && !ruin) {
        el("path", { d: poly([[x0 + 0.04 * s, yb], [x1 - 0.02 * s, yb], [x1 - 0.02 * s, yb - pil], [x0 + 0.04 * s, yb - pil]], true), fill: S.side, opacity: 0.9 }, g);
        const n = Math.max(2, Math.round((x1 - x0) / (0.28 * s))), cols = [];
        for (let i = 0; i <= n; i++) { const cx = x0 + 0.06 * s + i * ((x1 - x0) - 0.12 * s) / n; cols.push(`M${g2(cx)},${g2(yb)}V${g2(yb - pil)}`); }
        el("path", { d: cols.join(""), stroke: S.line, "stroke-width": Math.max(0.6, 0.045 * s), "stroke-linecap": "butt" }, g);
      }
      // windows: ribbons (one band per floor) or a grid; on a ruin the openings are empty frames
      const mx = 0.07 * s, bh = Math.max(0.5, hf * 0.22), wins = [];
      if (s >= 6) for (let k = pil ? 1 : 0; k < (p.floors || 1); k++) {
        const cy = yb - k * hf - hf * 0.52 - (pil && k === 0 ? 0 : 0);
        if (ruin && cy - bh / 2 < yt + p.h * s * 0.2) continue;
        if (p.kind === "grid") {
          const n = Math.max(2, Math.round((x1 - x0) / (0.14 * s))), ww = ((x1 - x0) - 2 * mx) / n;
          for (let i = 0; i < n; i++) wins.push(`M${g2(x0 + mx + i * ww + ww * 0.15)},${g2(cy - bh * 0.7)}h${g2(ww * 0.7)}v${g2(bh * 1.4)}h${g2(-ww * 0.7)}Z`);
        } else wins.push(`M${g2(x0 + mx)},${g2(cy - bh / 2)}H${g2(x1 - mx)}v${g2(bh)}H${g2(x0 + mx)}Z`);
      }
      if (wins.length) el("path", ruin ? { d: wins.join(""), fill: "none", stroke: S.win, "stroke-width": 0.5, opacity: S.winOp } :
        { d: wins.join(""), fill: S.win, opacity: S.winOp }, g);
      // ribbons continue round the corner on the side face (parallelograms), only from a readable size on
      if (!ruin && s >= 14 && p.kind !== "grid") {
        const sd = [];
        for (let k = pil ? 1 : 0; k < (p.floors || 1); k++) { const cy = yb - k * hf - hf * 0.52;
          sd.push(`M${g2(x1 + d * 0.2)},${g2(cy - bh / 2 - r * 0.2)}L${g2(x1 + d * 0.8)},${g2(cy - bh / 2 - r * 0.8)}v${g2(bh)}L${g2(x1 + d * 0.2)},${g2(cy + bh / 2 - r * 0.2)}Z`); }
        el("path", { d: sd.join(""), fill: S.sideWin, opacity: 0.8 }, g);
      }
    }

    // ---------------------------------------------------------- Historic styles (medieval, classical)
    // The kinds of the modern massing are mapped, so that cities and old data can be drawn in every style
    const eraKind = (p) => (p.kind === "grid" ? (V === "medieval" ? "gable" : "risalit") : p.kind === "pilotis" ? (V === "medieval" ? "arcade" : "risalit") : p.kind);
    const gableH = (p) => (p.rh != null ? p.rh : Math.min(0.55, 0.55 * p.w));   // medieval gable
    // height of the roof or gable above the body, in units of s (for topOf)
    function rise(p) {
      const k = eraKind(p);
      if (V === "medieval") { if (k === "gable") return p.ruin ? 0.4 * gableH(p) : gableH(p); return p.ruin ? 0 : R * 0.5 + (p.rh != null ? p.rh : 0.3); }
      return p.ruin ? 0 : R * 0.5 + (p.rh != null ? p.rh : 0.15);
    }
    function eraBlock(g, s, p) {
      const k = eraKind(p), x0 = p.x * s, x1 = (p.x + p.w) * s, xm = (x0 + x1) / 2, w = x1 - x0, yb = -(p.y0 || 0) * s, yt = yb - p.h * s;
      const d = D * s, r = R * s, ruin = !!p.ruin, rnd = T.random(p.seed || 5), lw = sw(s) * 0.55, hs = p.h * s;
      const fl = p.floors || 1, hf = hs / fl, detail = s >= 6, fine = s >= 12;
      const st = { stroke: E.line, "stroke-width": lw, "stroke-linejoin": "round" };
      const face = (pts, fill) => el("path", Object.assign({ d: poly(pts, true), fill }, st), g);
      const marks = (dd, attrs) => dd && el("path", Object.assign({ d: dd }, attrs), g);
      const rect = (x, y, ww, hh) => `M${g2(x)},${g2(y)}h${g2(ww)}v${g2(hh)}h${g2(-ww)}Z`;
      const jag = (a, b, n) => { const out = []; for (let j = 1; j < n; j++) { const t = j / n;
        out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]) + (j % 2 ? 0.16 : 0.03 + 0.07 * rnd()) * hs]); } return out; };
      const nj = Math.max(4, Math.round(w / Math.max(1.6, s * 0.1)));
      const gh = V === "medieval" && k === "gable" ? gableH(p) * s : 0;
      const stub = gh && V === "medieval";
      // broken upper edge of a ruin (from east to west); a gable keeps a stub on its west half
      const brokenTop = () => [[x1, yt + 0.06 * hs]].concat(jag([x1, yt], stub ? [x0, yt - 0.4 * gh] : [x0, yt], nj), [[x0, yt + (stub ? -0.3 * gh : 0.1 * hs)]]);

      // 1 side wall (east)
      face(ruin ? [[x1, yb], [x1 + d, yb - r], [x1 + d, yt - r + 0.22 * hs], [x1, yt + 0.06 * hs]] : [[x1, yb], [x1 + d, yb - r], [x1 + d, yt - r], [x1, yt]],
        V === "medieval" && k === "gable" ? E.stoneSide : E.side);

      // 2 roof behind the front
      if (!ruin) {
        if (gh) {   // roof plane behind a front gable, seen on its east slope
          face([[xm, yt - gh], [x1, yt], [x1 + d, yt - r], [xm + d, yt - gh - r]], E.roof);
        } else if (V === "medieval") {   // steep saddle roof with the eaves to the front; gable triangle on the east
          const H = (p.rh != null ? p.rh : 0.3) * s, ry = yt - r / 2 - H, o = 0.035 * s;
          face([[x1, yt], [x1 + d, yt - r], [x1 + d / 2, ry]], E.side);
          face([[x0 - o, yt + 0.4 * o], [x1 + o * 0.3, yt + 0.4 * o], [x1 + d / 2, ry], [x0 + d / 2 - o, ry]], E.roof);
          if (fine && w > 0.6 * s) { const cx = x0 + 0.22 * w;   // chimney
            face([[cx, ry + 0.25 * H], [cx + 0.07 * s, ry + 0.25 * H], [cx + 0.07 * s, ry - 0.12 * s], [cx, ry - 0.12 * s]], E.roofSide); }
        } else {   // low hip roof in slate
          const H = (p.rh != null ? p.rh : 0.15) * s, ry = yt - r / 2 - H, inset = Math.min(1.3 * H, 0.3 * w), o = 0.03 * s;
          face([[x1 + o, yt], [x1 + d + o, yt - r], [x1 + d / 2 - inset, ry]], E.roofSide);
          face([[x0 - o, yt], [x1 + o, yt], [x1 + d / 2 - inset, ry], [x0 + d / 2 + inset, ry]], E.roof);
        }
      }

      // 3 front wall
      if (V === "medieval" && k === "gable") {
        let gp;
        if (ruin) gp = brokenTop().reverse();
        else if (w >= 9 && fine) {   // stepped gable
          const n = 3, sw2 = (w / 2) / (n + 0.5), sh = gh / (n + 1);
          gp = [[x0, yt]];
          for (let j = 1; j <= n; j++) gp.push([x0 + (j - 1) * sw2, yt - j * sh], [x0 + j * sw2, yt - j * sh]);
          gp.push([x0 + n * sw2, yt - (n + 1) * sh], [x1 - n * sw2, yt - (n + 1) * sh]);
          for (let j = n; j >= 1; j--) gp.push([x1 - j * sw2, yt - j * sh], [x1 - (j - 1) * sw2, yt - j * sh]);
          gp.push([x1, yt]);
        } else gp = [[x0, yt], [xm, yt - gh], [x1, yt]];
        face([[x1, yb], [x0, yb]].concat(gp), E.stone);
      } else {
        face(ruin ? [[x0, yb], [x1, yb]].concat(brokenTop()) : [[x0, yb], [x1, yb], [x1, yt], [x0, yt]], E.wall);
      }
      if (!detail) return;
      const cut = (y) => ruin && y < yt + 0.24 * hs;   // openings above the broken edge are gone
      const open = ruin ? { fill: "none", stroke: E.win, "stroke-width": 0.5 } : { fill: E.win, opacity: 0.85 };

      if (V === "medieval") {
        const wins = [], tim = [], firstUpper = k === "arcade" ? 1 : 0;
        // stone ground floor under the timber of an eaves house with several floors
        if (k !== "gable" && (fl >= 2 || k === "arcade")) face([[x0, yb], [x1, yb], [x1, yb - hf], [x0, yb - hf]], E.stone);
        if (k === "arcade") {   // open round arches in the ground floor
          const n = Math.max(2, Math.round(w / (0.24 * s))), aw = w / n, rr = aw * 0.32, ah = hf * 0.78, arc = [];
          for (let i = 0; i < n; i++) { const a = x0 + i * aw + aw / 2 - rr;
            arc.push(`M${g2(a)},${g2(yb)}V${g2(yb - ah + rr)}A${g2(rr)},${g2(rr)} 0 0 1 ${g2(a + 2 * rr)},${g2(yb - ah + rr)}V${g2(yb)}Z`); }
          marks(arc.join(""), { fill: E.win, opacity: 0.8 });
        }
        const bay = k === "gable" ? 0.13 * s : 0.17 * s, nb = Math.max(2, Math.round(w / bay)), bw = w / nb;
        for (let f0 = 0; f0 < fl; f0++) {
          const fy = yb - f0 * hf, cy = fy - hf * 0.55;
          if (f0 < firstUpper || cut(cy)) continue;
          const tw = k === "gable" ? 0.045 * s : 0.06 * s, th = hf * (k === "gable" ? 0.5 : 0.38);
          for (let i = 0; i < nb; i++) if (k === "gable" || (i + f0) % 2 === 0 || nb <= 3) wins.push(rect(x0 + i * bw + bw / 2 - tw / 2, cy - th / 2, tw, th));
          // half-timbering: posts, rails and braces on the upper floors of eaves houses
          if (fine && k !== "gable" && (f0 >= 1 || fl === 1) && !ruin) {
            tim.push(`M${g2(x0)},${g2(fy)}H${g2(x1)}`);
            for (let i = 0; i <= nb; i++) tim.push(`M${g2(x0 + i * bw)},${g2(fy)}V${g2(fy - hf)}`);
            for (let i = 0; i < nb; i += 2) tim.push(`M${g2(x0 + i * bw)},${g2(fy)}L${g2(x0 + (i + 0.5) * bw)},${g2(fy - hf)}`);
          }
        }
        if (k === "gable" && fine && !ruin) wins.push(rect(xm - 0.03 * s, yt - gh * 0.45, 0.06 * s, 0.09 * s));   // loft hatch in the gable
        marks(tim.join(""), { fill: "none", stroke: E.timber, "stroke-width": Math.max(0.5, 0.03 * s) });
        marks(wins.join(""), open);
        return;
      }

      // classical: raised central bay (risalit) in a lighter tone, with pilasters at its edges, a cornice and an arched
      // door; the bay rises a little above the cornice of the wings, its roof is part of the hip roof behind it
      const bw2 = k === "risalit" ? Math.max(0.26 * s, 0.3 * w) / 2 : 0, ry = yt - 0.07 * s;
      if (k === "risalit" && !ruin) {
        face([[xm - bw2, yb], [xm + bw2, yb], [xm + bw2, ry], [xm - bw2, ry]], E.bay);
        if (fine) marks(`M${g2(xm - bw2 + 0.035 * s)},${g2(yb)}V${g2(ry)}M${g2(xm + bw2 - 0.035 * s)},${g2(yb)}V${g2(ry)}`, { stroke: E.line, "stroke-width": lw * 0.8, opacity: 0.7 });
      }
      // rusticated ground floor: horizontal joints
      if (fine && fl > 1 && !ruin) { const j = [];
        for (let i = 1; i < 4; i++) j.push(`M${g2(x0)},${g2(yb - i * hf / 4)}H${g2(x1)}`);
        marks(j.join(""), { stroke: E.line, "stroke-width": lw * 0.5, opacity: 0.45 }); }
      const wins = [], n = Math.max(2, Math.round(w / (0.15 * s))), bw = (w - 0.08 * s) / n, ww = Math.min(0.06 * s, bw * 0.5);
      for (let f0 = 0; f0 < fl; f0++) {
        const cy = yb - f0 * hf - hf * 0.5, wh = hf * (f0 === 0 && fl > 1 ? 0.42 : 0.55);
        if (cut(cy)) continue;
        for (let i = 0; i < n; i++) { const cx = x0 + 0.04 * s + i * bw + bw / 2;
          if (bw2 && f0 === 0 && Math.abs(cx - xm) < bw / 2) continue;   // the door takes the middle of the ground floor
          wins.push(rect(cx - ww / 2, cy - wh / 2, ww, wh)); }
      }
      if (bw2 && !ruin) { const dw = Math.min(0.1 * s, bw2), dh = hf * 0.72, rr = dw / 2;   // arched door
        wins.push(`M${g2(xm - rr)},${g2(yb)}V${g2(yb - dh + rr)}A${g2(rr)},${g2(rr)} 0 0 1 ${g2(xm + rr)},${g2(yb - dh + rr)}V${g2(yb)}Z`); }
      marks(wins.join(""), open);
      if (fl > 1 && fine) marks(`M${g2(x0)},${g2(yb - hf)}H${g2(x1)}`, { stroke: E.line, "stroke-width": lw * 0.8, opacity: 0.7 });   // string course
      if (!ruin) face([[x0 - 0.03 * s, yt], [x1 + 0.03 * s, yt], [x1 + 0.03 * s, yt + 0.045 * s], [x0 - 0.03 * s, yt + 0.045 * s]], E.col);   // cornice
      if (bw2 && !ruin) face([[xm - bw2 - 0.02 * s, ry], [xm + bw2 + 0.02 * s, ry], [xm + bw2 + 0.02 * s, ry + 0.045 * s], [xm - bw2 - 0.02 * s, ry + 0.045 * s]], E.col);   // cornice of the bay
    }

    // ---------------------------------------------------------- Plan pictogram (variant c)
    function plan(g, s, p) {
      const sc = (pts) => pts.map((q) => [q[0] * s, q[1] * s]);
      const d = poly(sc(p.plan), true) + (p.annex ? poly(sc(p.annex), true) : "");
      if (p.ruin) {
        el("path", { d, fill: "none", stroke: INK, "stroke-width": Math.max(1, 0.07 * s), "stroke-dasharray": `${g2(0.22 * s)} ${g2(0.09 * s)}`, "fill-rule": "evenodd" }, g);
      } else {
        el("path", { d, fill: INK, stroke: LIGHT, "stroke-width": Math.max(0.8, 0.05 * s), "paint-order": "stroke", "fill-rule": "evenodd", "stroke-linejoin": "miter" }, g);
      }
    }

    const part = (g, s, p) => (p.plan ? plan(g, s, p) : block(g, s, p));
    const ground = () => {};   // no ground lines: modern maps draw the building alone
    function building(g, s, parts) { parts.forEach((p) => part(g, s, p)); ground(g, s); }

    // The page reads BUILDINGS.B[stage]; both lines A and B are the same in the modern map
    const stages = {};
    [1, 2, 3, 4].forEach((k) => {
      if (V === "c") { const xs = PLANS[k].concat(PLAN_ANNEX[k] || []).map((q) => q[0]), ys = PLANS[k].map((q) => -q[1]);
        stages[k] = [{ x: Math.min(...xs), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys), plan: PLANS[k], annex: PLAN_ANNEX[k] }]; }
      else if (HIST) stages[k] = ERA_MASSING[V][k].map((p) => Object.assign({}, p, { rise: rise(p) }));
      else stages[k] = MASSING[k];
    });
    const BUILDINGS = { A: stages, B: stages };
    const unroofed = (parts) => parts.map((p, i) => { const q = Object.assign({}, p, { ruin: true, seed: 3 + i }); if (HIST) q.rise = rise(q); return q; });
    const RUINS = { A: (g, s) => building(g, s, unroofed(stages[3])), B: (g, s) => building(g, s, unroofed(stages[3])) };
    const topOf = (s, parts) => Math.max(...parts.map((p) => ((p.y0 || 0) + p.h + (p.plan ? 0 : p.rise != null ? p.rise + R : R * 0.5 + R)) * s));

    // Open conjecture: the same building with a question mark above it (glossary), in the sans-serif of the map
    const QM_MIN = 15;
    function conjecture(g, s, parts, sym) {
      building(g, s, parts);
      const fs = Math.max(0.8 * s, QM_MIN / sym);
      text("?", { x: g2(0.05 * s), y: g2(-topOf(s, parts) - 0.12 * s), "font-size": g2(fs), "text-anchor": "middle", class: "map", "font-weight": 700,
        "font-family": SANS, fill: INK, stroke: LIGHT, "stroke-width": g2(fs * 0.14), "paint-order": "stroke", "stroke-linejoin": "round" }, g);
    }

    // ---------------------------------------------------------- City (theory)
    // Same unit and rows as in draft 11 (u = s / 16, foot of the front row at y = 8 u). Variants a and b: rows of flat
    // blocks staggered in depth with one or two high-rise slabs; variant c: footprints in street blocks.
    const CITY = {
      klein: { rows: 3, hw: 12, towers: [[0, 0.5]] },
      mittel: { rows: 4, hw: 14, towers: [[0, 0.35], [1, 0.75]] },
      gross: { rows: 5, hw: 16, towers: [[1, 0.3], [0, 0.72]] },
    };
    function city(g, s, size, seed) {
      const u = s / 16, c = CITY[size], rnd = T.random(seed);
      if (V === "c") {
        // street grid: blocks of 2 x 2 cells, each filled with one to three footprints
        const cols = c.rows + 2, rows = c.rows, cw = (2 * c.hw * u) / cols, ch = cw * 0.8, street = cw * 0.18, y0 = 8 * u - rows * ch;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const bx = -c.hw * u + i * cw + street / 2, by = y0 + j * ch + street / 2, bw = cw - street, bh = ch - street;
          if (rnd() < 0.12 && (i === 0 || i === cols - 1)) continue;
          const split = rnd(), pts = split < 0.4 ? [[bx, by, bw, bh]] : split < 0.75 ? [[bx, by, bw * 0.48, bh], [bx + bw * 0.56, by, bw * 0.44, bh]] :
            [[bx, by, bw, bh * 0.45], [bx, by + bh * 0.55, bw * 0.5, bh * 0.45], [bx + bw * 0.6, by + bh * 0.55, bw * 0.4, bh * 0.45]];
          pts.forEach(([x, y, w, h]) => el("rect", { x: g2(x), y: g2(y), width: g2(w), height: g2(h), fill: INK }, g));
        }
        return;
      }
      const bs = 6.6 * u, step = bs * 0.48, foot = 8 * u, shift = 0.22 * bs;
      for (let k = 0; k < c.rows; k++) {
        const back = c.rows - 1 - k, sc = 1 - 0.05 * back, hw = c.hw * u * (0.72 + 0.28 * k / Math.max(1, c.rows - 1)), x0 = back * shift;
        const g0 = el("g", { transform: `translate(${g2(x0)} ${g2(foot - back * step)}) scale(${g2(sc)})` }, g), b = bs;
        const towers = c.towers.filter((t) => t[0] === k).map((t) => (-hw + t[1] * 2 * hw) / sc);
        let x = (-hw + (k % 2 ? 0.25 * b : 0)) / sc;
        while (x < hw / sc - 0.45 * b) {
          const tw = towers.find((t) => Math.abs(t - x) < 0.5 * b), dy = (rnd() - 0.5) * 0.06;
          let w;
          if (V === "medieval") {   // narrow gabled houses and eaves houses; the tower is a tall gabled hall
            if (tw != null) { w = 0.5; block(g0, b, { x: x / b, w, h: 0.78, y0: dy, floors: 3, kind: "gable", rh: 0.5 }); }
            else { const gab = rnd() < 0.55; w = gab ? 0.34 + 0.12 * rnd() : 0.5 + 0.25 * rnd();
              block(g0, b, { x: x / b, w, h: 0.32 + 0.2 * rnd(), y0: dy, floors: rnd() < 0.5 ? 1 : 2, kind: gab ? "gable" : undefined, rh: gab ? 0.3 : 0.26 }); }
          } else if (V === "classical") {   // rows of hip-roofed houses; the tall building has a central bay
            if (tw != null) { w = 0.7; block(g0, b, { x: x / b, w, h: 0.72, y0: dy, floors: 3, kind: "risalit", rh: 0.15 }); }
            else { w = 0.55 + 0.3 * rnd(); block(g0, b, { x: x / b, w, h: 0.4 + 0.22 * rnd(), y0: dy, floors: 2, rh: 0.12 }); }
          } else if (tw != null) { w = 0.42; block(g0, b, { x: x / b, w, h: 1.55, y0: dy, floors: 7, kind: "grid" }); }
          else { w = 0.55 + 0.3 * rnd(); block(g0, b, { x: x / b, w, h: 0.42 + 0.28 * rnd(), y0: dy, floors: rnd() < 0.5 ? 1 : 2 }); }
          x += w * b * 1.0;
        }
      }
    }

    // Programme and tree as in draft 11 (programme: dashed outline; tree: provisional, trees are not shown)
    function programme(g, s) {
      el("path", { d: T.smooth([[-s * 1.8, 0], [-s, -s * 0.9], [s * 0.4, -s * 0.8], [s * 1.8, -s * 0.1], [s * 1.1, s * 0.8], [-s * 0.6, s * 0.7], [-s * 1.8, 0]]),
        fill: "none", stroke: INK, "stroke-width": 1.3, "stroke-dasharray": "5 3" }, g);
    }
    function tree(g, s) {
      const w = 0.8 + s / 40;
      el("path", { d: `M0,0V${g2(-0.5 * s)}`, stroke: INK, "stroke-width": w, "stroke-linecap": "round" }, g);
      el("circle", { cx: 0, cy: g2(-0.8 * s), r: g2(0.38 * s), fill: "#9fb58a", stroke: INK, "stroke-width": w * 0.6 }, g);
    }
    const hills = () => {};

    return { variant: V, D, R, QM_MIN, part, ground, building, BUILDINGS, unroofed, RUINS, topOf, conjecture, CITY, city, hills, programme, tree };
  }

  // Default b: one modern style for every building (user, 2026-10-23, after trying the styles by period). Mode "era"
  // (?buildings=era) keeps that trial: the symbols of variant b, and forYear(y) gives the symbols of the style of year y
  let chosen = "b";
  try { chosen = new URLSearchParams(location.search).get("buildings") || window.BUILDING_VARIANT || "b"; } catch (e) { /* default */ }
  const cache = {}, sym = (v) => cache[v] || (cache[v] = make(v));
  const forYear = chosen === "era" ? (year) => sym(ERA_OF(year == null ? 9999 : year)) : null;
  window.SKETCH_SYMBOLS = Object.assign({}, sym(chosen === "era" ? "b" : chosen), { make, forYear, eraOf: ERA_OF, mode: chosen });
})();
