// Zoom into an area in the graph of the areas (graphs/areas.html, layout "Map"; todo B101 step 1, user, 5 November
// 2026; specification in reports/2026-11-05 B101 Gemeinsame Geographie/spec.md).
//   - Pointing at the region of an area (its cells, outside its point) lights its outline; a click zooms into it
//     (about 0.6 s): the map is moved and enlarged, and the outline of the area turns into an ellipse 1.7 : 1 that fills
//     about 70 % of the width or height of the picture; the other areas give way radially and keep their points and
//     names; the bands are hidden (user, 5 November 2026; details at "the region becomes an ellipse" below).
//   - In the ellipse the own nodes of the area appear with their edges inside the area, laid out exactly as in the
//     reference graphs (<folder>/concepts.html, theorems.html), read out by tests/make-area-interiors.js into
//     shared_scripts/area-interiors.js; turned as a whole so that the edges to other areas are short, then stretched
//     horizontally by 1.7. Switch "concepts | theorems" in the toolbar.
//   - An edge between an own node and a node of another area ends at the point of that area if the point is in the
//     picture, else at a mark at the border of the picture in its direction (an arc in the colour of its group with its
//     name and the number of edges; one mark per area, marks do not overlap). A click on a mark zooms into that area.
//   - A click on an own node marks it with its direct neighbours in the area; "open detailed graph" opens the reference
//     page (with #mark=<id> when a node is marked).
//   - Back out: Escape, "‹ All areas", a click on an empty place outside the regions, the back button of the browser.
//     Address #…&zoom=<folder>[&inner=theorems].
// Loaded before shared_scripts/area-graph.js, which calls window.AREA_ZOOM(api) and uses the hooks returned. The
// reference graphs themselves are not changed.
(function () {
  "use strict";
  window.AREA_ZOOM = function (api) {
    const { svg, state, G, allAreas } = api;
    const NS = "http://www.w3.org/2000/svg";
    const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const INTER = window.AREA_INTERIORS || {};
    // Variant "the area keeps its shape" (graphs/areas-shape.html, user, 5 November 2026): window.AREA_ZOOM_SHAPE = "keep".
    // The map is only enlarged and moved; the outline of the area stays its smoothed shape, the neighbours stay in their
    // places; the contents are mapped radially into the shape; the rings of the neighbours follow the shape.
    const KEEP = window.AREA_ZOOM_SHAPE === "keep";
    const TAU = 2 * Math.PI;
    const angDist = (x, y) => { const d = Math.abs(x - y) % TAU; return d > Math.PI ? TAU - d : d; };
    // duration of the change region ⇄ ellipse (zoom in and out, the neighbours giving way), in ms (user, 5 November 2026:
    // clearly slower than the first 0.6 s); a way through another area (out, then in) takes CHAIN for each half
    const FILL = 0.7, DURATION = 1600, CHAIN = 1200;
    const hsl = (h, sat, l) => `hsl(${h},${sat}%,${l.toFixed(1)}%)`;
    const hexHsl = (c) => {
      if (!/^#[0-9a-f]{6}$/i.test(c)) { const m = /hsl\((\d+),\s*(\d+)%/.exec(c); return m ? { h: +m[1], s: +m[2] } : { h: 30, s: 30 }; }
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
      let h = 0, sat = 0;
      if (d) { sat = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
      return { h: Math.round(h), s: Math.round(100 * sat) };
    };
    // state of the zoom: the area zoomed into (folder), the kind of nodes inside, the marked node, a running animation
    const Z = { folder: null, inner: "concepts", marked: null, anim: null, first: true, geo: null, e: 0 };
    const unitOf = (folder) => allAreas.find((u) => u.folder.folder === folder);
    const nameOf = (folder) => { const u = unitOf(folder); return u ? u.label : folder; };

    // ------------------------------------------------------------ regions of the areas (cells of layout E2)
    const SQ3 = Math.sqrt(3), RC = 1 / SQ3;
    const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
    const DANG = DIRS.map(([q, r]) => Math.atan2((SQ3 / 2) * r, q + r / 2));
    let regionCache = null;
    function regions() {
      const EL = api.layoutE();
      if (!EL) return null;
      if (regionCache && regionCache.EL === EL) return regionCache.list;
      const { res, scale } = EL, f = (x) => (x * scale).toFixed(1);
      const corner = (c, a) => f(res.cells[c].x + RC * Math.cos(a)) + "," + f(res.cells[c].y + RC * Math.sin(a));
      const list = allAreas.map(() => ({ fill: "", outline: "", cells: [], segs: [] }));
      const cxy = (c, a) => [(res.cells[c].x + RC * Math.cos(a)) * scale, (res.cells[c].y + RC * Math.sin(a)) * scale];
      res.cells.forEach((c, i) => {
        const R = list[res.lab[i]];
        R.cells.push(c);
        R.group = res.group[i];
        const pts = [];
        for (let k = 0; k < 6; k++) pts.push(corner(i, Math.PI / 6 + (k * Math.PI) / 3));
        R.fill += "M" + pts.join("L") + "Z";
        res.nb[i].forEach((d, k) => {
          if (d >= 0 && res.lab[d] === res.lab[i]) return;
          R.outline += "M" + corner(i, DANG[k] - Math.PI / 6) + "L" + corner(i, DANG[k] + Math.PI / 6);
          R.segs.push(cxy(i, DANG[k] - Math.PI / 6).concat(cxy(i, DANG[k] + Math.PI / 6)));
        });
      });
      list.forEach((R) => {
        const xs = R.cells.map((c) => c.x * scale), ys = R.cells.map((c) => c.y * scale), m = RC * scale;
        R.box = { x0: Math.min(...xs) - m, x1: Math.max(...xs) + m, y0: Math.min(...ys) - m, y1: Math.max(...ys) + m };
        // radius of the disk of the contents: a circle with the area of the cells (hexagon area √3/2)
        R.disk = Math.sqrt((R.cells.length * SQ3) / 2 / Math.PI) * scale;
      });
      regionCache = { EL, list };
      return list;
    }
    // the view that shows the region of an area at about 70 % of the smaller side of the picture
    function targetView(folder) {
      const i = allAreas.indexOf(unitOf(folder)), R = regions()[i], u = allAreas[i];
      const S = Math.max(R.box.x1 - R.box.x0, R.box.y1 - R.box.y0, 2 * R.disk) / FILL;
      const a = (svg.clientWidth || 1600) / (svg.clientHeight || 900);
      const w = a >= 1 ? S * a : S, h = a >= 1 ? S : S / a;
      return { x: u.x - w / 2, y: u.y - h / 2, w, h };
    }

    // ------------------------------------------------------------ the region becomes an ellipse (user, 5 November 2026)
    // While zooming in, the outline of the area turns steadily into an ellipse 1.7 : 1 (wide, like the frame of the map)
    // that fills about 70 % of the width or the height of the picture, whichever limits first. Both outlines are
    // sequences of N points matched by their angle around the centre of the area (its point = centroid of its cells) and
    // blended linearly. The other areas give way: every point of the map is moved radially away from the centre, by the
    // same amount as the outline in its direction (inside the outline in proportion), so that nothing covers the
    // ellipse and the order along every ray stays. Zooming out runs everything backwards.
    const ASPECT = 1.7, N = 180;
    function geoFor(folder) {
      const u = unitOf(folder), R = regions()[allAreas.indexOf(u)], tv = targetView(folder), c = { x: u.x, y: u.y };
      const A = Math.min(0.35 * tv.w, 0.35 * tv.h * ASPECT), B = A / ASPECT;
      // extent of the region from the centre in each of N directions (farthest crossing of the ray with its outline)
      const rreg = new Float64Array(N);
      for (let k = 0; k < N; k++) {
        const t = (k * TAU) / N, dx = Math.cos(t), dy = Math.sin(t);
        let best = 0;
        R.segs.forEach(([x1, y1, x2, y2]) => {
          const ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-12) return;
          const qx = x1 - c.x, qy = y1 - c.y, tt = (qx * ey - qy * ex) / den, v = (qx * dy - qy * dx) / den;
          if (tt > best && v >= -1e-9 && v <= 1 + 1e-9) best = tt;
        });
        rreg[k] = best || RC * api.layoutE().scale;
      }
      // fixed phases of the soft waves of the outline, from the name of the folder (the same at every drawing)
      let h = 2166136261;
      for (const ch of folder) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
      const ph = [0, 1, 2].map((i) => (((h >>> (i * 9)) & 511) / 512) * TAU);
      const g = { folder, u, c, A, B, rreg, tv, tv0: tv, ph };
      if (KEEP) keepShape(g);
      return g;
    }
    // The shape of the area for the variant "keep": its largest smoothed outline loop; in each of NK directions from the
    // centre the first crossing of the ray with the outline (rin; the contents are mapped up to 94 % of it) and the
    // farthest crossing (rout); the rings follow curves parallel to the convex hull of the shape (offsetR). A direction with
    // several crossings makes the area not star-shaped seen from its centre.
    const NK = 360;
    function keepShape(g) {
      smoothUnits(api.layoutE());
      const loops = softCache.pts[allAreas.indexOf(g.u)] || [];
      const areaOf = (P) => Math.abs(P.reduce((t, p, i) => { const q = P[(i + 1) % P.length]; return t + p.x * q.y - q.x * p.y; }, 0)) / 2;
      const P = loops.slice().sort((a, b) => areaOf(b) - areaOf(a))[0] || [];
      const rin = new Float64Array(NK), rout = new Float64Array(NK);
      let multi = 0;
      for (let k = 0; k < NK; k++) {
        const t = (k * TAU) / NK, dx = Math.cos(t), dy = Math.sin(t), hits = [];
        P.forEach((p, i) => {
          const q = P[(i + 1) % P.length], ex = q.x - p.x, ey = q.y - p.y, den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-12) return;
          const qx = p.x - g.c.x, qy = p.y - g.c.y, tt = (qx * ey - qy * ex) / den, v = (qx * dy - qy * dx) / den;
          if (tt > 1e-9 && v >= 0 && v < 1) hits.push(tt);
        });
        hits.sort((a, b) => a - b);
        rin[k] = hits.length ? hits[0] : 1;
        rout[k] = hits.length ? hits[hits.length - 1] : 1;
        if (hits.length > 1) multi++;
      }
      const inside = (x, y) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) r = !r; } return r; };
      const xs = P.map((p) => p.x), ys = P.map((p) => p.y);
      // the rings follow the convex hull of the shape, moved outward by a distance D in every direction (Minkowski sum
      // with a disk: a curve parallel to the hull, smooth); its distance from the centre in each of NK directions
      const hullOf = (Q) => {
        const S = Q.slice().sort((a, b) => a.x - b.x || a.y - b.y), cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x), lo = [], hi = [];
        S.forEach((q) => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
        S.slice().reverse().forEach((q) => { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
        return lo.slice(0, -1).concat(hi.slice(0, -1));
      };
      const hull = hullOf(P), cache = new Map();
      const offsetR = (D) => {
        const key = D.toFixed(2);
        if (cache.has(key)) return cache.get(key);
        const Q = hullOf(D > 0 ? hull.flatMap((p) => [...Array(16)].map((_, i) => ({ x: p.x + D * Math.cos((i * TAU) / 16), y: p.y + D * Math.sin((i * TAU) / 16) }))) : hull);
        const r = new Float64Array(NK);
        for (let k = 0; k < NK; k++) {
          const t = (k * TAU) / NK, dx = Math.cos(t), dy = Math.sin(t);
          let best = 0;
          Q.forEach((p, i) => {
            const q = Q[(i + 1) % Q.length], ex = q.x - p.x, ey = q.y - p.y, den = dx * ey - dy * ex;
            if (Math.abs(den) < 1e-12) return;
            const qx = p.x - g.c.x, qy = p.y - g.c.y, tt = (qx * ey - qy * ex) / den, v = (qx * dy - qy * dx) / den;
            if (tt > best && v >= 0 && v <= 1) best = tt;
          });
          r[k] = best;
        }
        if (cache.size > 60) cache.clear();
        cache.set(key, r);
        return r;
      };
      Object.assign(g, { offsetR, poly: P, rin, rout, ringR: offsetR(0), nonStar: multi, centreInside: inside(g.c.x, g.c.y), inside, moved: 0,
        outlineD: "M" + P.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join("L") + "Z",
        A: (Math.max(...xs) - Math.min(...xs)) / 2, B: (Math.max(...ys) - Math.min(...ys)) / 2 });
    }
    const atK = (arr, t) => { const f = ((((t % TAU) + TAU) % TAU) / TAU) * NK, k = Math.floor(f) % NK, w = f - Math.floor(f); return arr[k] * (1 - w) + arr[(k + 1) % NK] * w; };
    const KEEP_MARGIN = 0.94;
    // Organic outline (user, 5 November 2026): the ellipse with soft, slightly irregular waves, in the style of the
    // organic borders of the map; fixed per area. A point of the ellipse is given by its angle b in the unstretched disk
    // (x = A cos b, y = B sin b) and the radius fraction rho; the waves scale it radially by wob(b) (± about 2.5 %).
    const AMP = 0.025;
    const wob = (g, b) => 1 + AMP * (0.55 * Math.sin(3 * b + g.ph[0]) + 0.3 * Math.sin(5 * b + g.ph[1]) + 0.15 * Math.sin(8 * b + g.ph[2]));
    const diskPt = (g, rho, b) => {
      if (KEEP) {
        // radially into the shape: radius fraction rho of the first crossing in the direction b (with a margin inside); a
        // point that would still lie outside the region (centre outside the region) goes inward along its ray to the
        // nearest point inside
        const r = rho * KEEP_MARGIN * atK(g.rin, b);
        let x = g.c.x + r * Math.cos(b), y = g.c.y + r * Math.sin(b);
        if (!g.inside(x, y)) {
          for (let f = 0.95; f > 0.04; f -= 0.05) { const xx = g.c.x + f * r * Math.cos(b), yy = g.c.y + f * r * Math.sin(b); if (g.inside(xx, yy)) { x = xx; y = yy; break; } }
          g.moved++;
        }
        return { x, y };
      }
      const f = rho * wob(g, b); return { x: g.c.x + f * g.A * Math.cos(b), y: g.c.y + f * g.B * Math.sin(b) };
    };
    // radius of the organic outline in the direction t (angle on the screen)
    const rEll = (g, t) => { const b = Math.atan2(g.A * Math.sin(t), g.B * Math.cos(t)); return wob(g, b) * Math.hypot(g.A * Math.cos(b), g.B * Math.sin(b)); };
    const rReg = (g, t) => { const f = ((((t % TAU) + TAU) % TAU) / TAU) * N, k = Math.floor(f) % N, w = f - Math.floor(f); return g.rreg[k] * (1 - w) + g.rreg[(k + 1) % N] * w; };
    const rAt = (g, t, e) => rReg(g, t) * (1 - e) + rEll(g, t) * e;
    function warp(g, e, x, y) {
      if (KEEP) return { x, y };
      const dx = x - g.c.x, dy = y - g.c.y, d = Math.hypot(dx, dy);
      if (d < 1e-9 || e <= 0) return { x, y };
      const t = Math.atan2(dy, dx), R0 = rReg(g, t), R1 = rAt(g, t, e), d2 = d <= R0 ? (d * R1) / R0 : d + R1 - R0;
      return { x: g.c.x + (dx / d) * d2, y: g.c.y + (dy / d) * d2 };
    }
    // the elements of the map that are moved, collected after every drawing (original coordinates kept)
    let mapEls = null, gMorph = null;
    function collectMap() {
      mapEls = {
        paths: [...svg.querySelectorAll("g.sektoren path, g.zoom-regionen path")].filter((p) => p.getAttribute("d")).map((p) => [p, p.getAttribute("d")]),
        texts: [...svg.querySelectorAll("g.sektoren text.gruppe-name")].filter((t) => t.hasAttribute("x")).map((t) => [t, +t.getAttribute("x"), +t.getAttribute("y")]),
      };
    }
    // position of the point of an area after giving way
    const wpos = (u) => (Z.geo && u !== Z.geo.u ? warp(Z.geo, Z.e, u.x, u.y) : { x: u.x, y: u.y });
    function applyWarp() {
      if (!mapEls) return;
      const g = Z.geo, e = g ? Z.e : 0, NUM = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
      if (KEEP) {
        // the map stays as it is; the outline of the area (its smoothed shape) is filled lightly as the background
        if (gMorph) { gMorph.remove(); gMorph = null; }
        if (g && e > 0) {
          gMorph = el("g", { class: "zoom-morph" });
          svg.insertBefore(gMorph, svg.querySelector("g.kanten"));
          el("path", { d: g.outlineD, class: "zoom-umriss-ellipse", stroke: g.u.F.color, "fill-opacity": (0.95 * e).toFixed(3) }, gMorph);
          gMorph.addEventListener("click", (ev) => ev.stopPropagation());
        }
        return;
      }
      mapEls.paths.forEach(([p, d]) => p.setAttribute("d", e > 0 ? d.replace(NUM, (m, x, y) => { const q = warp(g, e, +x, +y); return q.x.toFixed(1) + "," + q.y.toFixed(1); }) : d));
      mapEls.texts.forEach(([t, x, y]) => { const q = e > 0 ? warp(g, e, x, y) : { x, y }; t.setAttribute("x", q.x.toFixed(1)); t.setAttribute("y", q.y.toFixed(1)); });
      allAreas.forEach((u) => { if (!u.g) return; const q = wpos(u); u.g.setAttribute("transform", `translate(${q.x.toFixed(1)},${q.y.toFixed(1)})`); });
      // the outline of the area: from its region (e = 0) to the ellipse (e = 1)
      if (gMorph) { gMorph.remove(); gMorph = null; }
      if (g && e > 0) {
        gMorph = el("g", { class: "zoom-morph" });
        svg.insertBefore(gMorph, svg.querySelector("g.kanten"));
        const pts = [];
        for (let k = 0; k < N; k++) { const t = (k * TAU) / N, r = rAt(g, t, e); pts.push((g.c.x + r * Math.cos(t)).toFixed(2) + "," + (g.c.y + r * Math.sin(t)).toFixed(2)); }
        el("path", { d: "M" + pts.join("L") + "Z", class: "zoom-umriss-ellipse", stroke: g.u.F.color }, gMorph);
        gMorph.addEventListener("click", (ev) => ev.stopPropagation());
      }
    }

    // ------------------------------------------------------------ layers drawn after every drawing of the page
    let gHit = null, gZoom = null;
    function drawRegions() {
      gHit = null;
      if (!api.isMap()) return;
      const list = regions();
      if (!list) return;
      const before = svg.querySelector("g.kanten");
      gHit = el("g", { class: "zoom-regionen" });
      svg.insertBefore(gHit, before);
      // the regions end where the drawn regions of the groups end (organic borders and the gap between the groups), so
      // that a click into the white gap counts as a click on an empty place
      const EL = api.layoutE(), shapes = state.organic || state.gap > 0 ? window.AREA_CELLS.organicShapes(EL.res, EL.scale, state.gap / 2, state.organic) : null;
      const defs = el("defs", {}, gHit);
      if (shapes) shapes.d.forEach((d, g) => el("path", { d, "clip-rule": "evenodd" }, el("clipPath", { id: "zoom-clip-" + g }, defs)));
      // the smoothed outline of every area exactly as the borders of the areas are drawn (organicShapes in
      // area-cells.js: midpoints of the hexagon edges, one round of Chaikin), so that the lit outline and the area that
      // takes the click are the visible ones (user's report, 5 November 2026: a jagged outline was lit)
      const soft = shapes && shapes.units ? smoothUnits(EL) : null;
      list.forEach((R, i) => {
        const u = allAreas[i], folder = u.folder.folder;
        if (!INTER[folder]) return;
        const g = el("g", Object.assign({ class: "zoom-region", "data-folder": folder }, shapes ? { "clip-path": `url(#zoom-clip-${R.group})` } : {}), gHit);
        el("path", { d: soft ? soft[i] : R.fill, class: "zoom-flaeche", "fill-rule": "evenodd" }, g);
        el("path", { d: soft ? soft[i] : R.outline, class: "zoom-umriss", stroke: u.F.color }, g);
        g.addEventListener("mouseenter", (ev) => { if (Z.folder === folder) return; g.classList.add("zeige"); api.tip.textContent = u.name; api.tip.hidden = false; api.moveTip(ev); });
        g.addEventListener("mousemove", api.moveTip);
        g.addEventListener("mouseleave", () => { g.classList.remove("zeige"); api.tip.hidden = true; });
        g.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (api.dragged() || Z.folder === folder) return;
          api.tip.hidden = true;
          zoomTo(folder, true);
        });
      });
    }
    let softCache = null;
    function smoothUnits(EL) {
      if (softCache && softCache.EL === EL) return softCache.list;
      const { res, scale } = EL, C0 = window.AREA_CELLS;
      const mids = (P) => P.map((p, i) => { const q = P[(i + 1) % P.length]; return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; });
      const chaikin = (P) => { const Q = []; P.forEach((p, i) => { const q = P[(i + 1) % P.length]; Q.push({ x: 0.75 * p.x + 0.25 * q.x, y: 0.75 * p.y + 0.25 * q.y }, { x: 0.25 * p.x + 0.75 * q.x, y: 0.25 * p.y + 0.75 * q.y }); }); return Q; };
      // groupLoops with the areas as labels gives the outline loops of every area (labelLoops of area-cells.js)
      const loops = C0.groupLoops({ cells: res.cells, nb: res.nb, group: res.lab, groupKeys: { length: allAreas.length } });
      const pts = loops.map((ls) => ls.map((l) => chaikin(mids(l.map((p) => ({ x: p.x * scale, y: p.y * scale }))))));
      const list = pts.map((ls) => ls.map((P) => "M" + P.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join("L") + "Z").join(""));
      softCache = { EL, list, pts };
      return list;
    }
    function markOwnPoint() {
      allAreas.forEach((u) => { if (u.g) u.g.classList.toggle("zoom-eigen", !!Z.geo && u === Z.geo.u); });
    }

    // ------------------------------------------------------------ zoom in and out
    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    function animate(target, frame, done, dur = DURATION) {
      if (Z.anim) cancelAnimationFrame(Z.anim);
      const from = api.getView(), t0 = performance.now();
      const fc = { x: from.x + from.w / 2, y: from.y + from.h / 2 }, tc = { x: target.x + target.w / 2, y: target.y + target.h / 2 };
      svg.classList.add("unterwegs", "zoom-unterwegs");
      const step = (now) => {
        const x = Math.min(1, (now - t0) / dur), e = ease(x);
        // geometric change of the size, the centre in proportion to the size, so that the move looks even
        const w = from.w * Math.pow(target.w / from.w, e), h = from.h * Math.pow(target.h / from.h, e);
        const s = Math.abs(target.w - from.w) > 1e-6 ? (w - from.w) / (target.w - from.w) : e;
        const cx = fc.x + (tc.x - fc.x) * s, cy = fc.y + (tc.y - fc.y) * s;
        api.setView({ x: cx - w / 2, y: cy - h / 2, w, h });
        frame(e);
        if (x < 1) { Z.anim = requestAnimationFrame(step); return; }
        Z.anim = null;
        svg.classList.remove("unterwegs", "zoom-unterwegs");
        done();
        api.setView(api.getView());
      };
      Z.anim = requestAnimationFrame(step);
    }
    // user: a new entry in the history of the browser, so that its back button returns to the previous state
    function remember() { try { history.pushState(null, "", location.href); } catch (e) { /* file:// in some browsers */ } }
    function removeInterior() { if (gZoom) gZoom.remove(); gZoom = null; C = null; }
    function zoomTo(folder, user, instant, dur = DURATION) {
      if (!api.isMap() || !INTER[folder] || !unitOf(folder) || Z.folder === folder) return;
      if (Z.anim) { cancelAnimationFrame(Z.anim); Z.anim = null; svg.classList.remove("unterwegs", "zoom-unterwegs"); }
      if (user) remember();
      // from one area into another: out of the first, then into the second
      if (Z.geo) { zoomOut(false, instant, () => zoomTo(folder, false, instant, CHAIN), CHAIN); return; }
      api.clear();
      Z.folder = folder; Z.marked = null; Z.geo = geoFor(folder); Z.e = 0; Z.shifted = false;
      svg.classList.add("gezoomt");
      removeInterior();
      markOwnPoint();
      api.drawControls(); api.update();
      const finish = () => { Z.e = 1; applyWarp(); buildInterior(); api.update(); };
      if (instant) { api.setView(Z.geo.tv); finish(); }
      else animate(Z.geo.tv, (e) => { Z.e = e; applyWarp(); }, finish, dur);
    }
    // The view after zooming out (user, 5 November 2026): the area just left stays as near the middle of the picture as
    // possible, the map is moved instead of jumping back to the whole view; at most a quarter of the width and of the
    // height of the map may stand outside the picture. A click on an empty place or on the title brings the whole map
    // back (recentre).
    function outView(g) {
      const f = api.fit(), cw = svg.clientWidth || 1, ch = svg.clientHeight || 1, s = Math.max(f.w / cw, f.h / ch), W = cw * s, H = ch * s;
      const EL = api.layoutE(), xs = EL.res.cells.map((c) => c.x * EL.scale), ys = EL.res.cells.map((c) => c.y * EL.scale);
      const mx0 = Math.min(...xs), mx1 = Math.max(...xs), my0 = Math.min(...ys), my1 = Math.max(...ys), MW = mx1 - mx0, MH = my1 - my0;
      const mcx = (mx0 + mx1) / 2, mcy = (my0 + my1) / 2, fcx = f.x + f.w / 2, fcy = f.y + f.h / 2;
      const lx = Math.max(0, (W - MW) / 2 + MW / 4), ly = Math.max(0, (H - MH) / 2 + MH / 4);
      const clamp = (v, l) => Math.max(-l, Math.min(l, v));
      // centre of the picture: the area, moved back towards the middle of the map as far as the limit asks
      const cx = mcx + clamp(g.c.x - mcx, lx), cy = mcy + clamp(g.c.y - mcy, ly);
      return { x: f.x + (cx - fcx), y: f.y + (cy - fcy), w: f.w, h: f.h };
    }
    function recentre() {
      if (Z.folder || Z.anim || !Z.shifted) return;
      Z.shifted = false;
      updateTitle();
      animate(api.fit(), () => {}, () => { svg.classList.remove("unterwegs", "zoom-unterwegs"); });
    }
    function zoomOut(user, instant, then, dur = DURATION) {
      if (!Z.geo) { if (then) then(); return; }
      if (Z.anim) { cancelAnimationFrame(Z.anim); Z.anim = null; svg.classList.remove("unterwegs", "zoom-unterwegs"); }
      if (user) remember();
      Z.folder = null; Z.marked = null;
      removeInterior();
      api.drawControls(); api.update();
      const target = !instant && api.isMap() && !then ? outView(Z.geo) : api.fit();
      const finish = () => { Z.geo = null; Z.e = 0; applyWarp(); markOwnPoint(); svg.classList.remove("gezoomt"); Z.shifted = target !== api.fit() && !then && !instant; updateTitle(); api.update(); if (then) then(); };
      if (instant || !api.isMap()) { api.setView(api.fit()); finish(); }
      else { const e0 = Z.e; animate(target, (e) => { Z.e = e0 * (1 - e); applyWarp(); }, finish, dur); }
    }
    function setInner(inner, user) {
      if (inner === Z.inner) return;
      if (user) remember();
      Z.inner = inner; Z.marked = null;
      if (Z.folder && !Z.anim) buildInterior();
      api.drawControls(); api.update();
    }

    // ------------------------------------------------------------ contents of the area
    // The contents of an area for "concepts", "theorems" or "both": the nodes of one view per folder
    // (concepts.html?theorems=all, see tests/make-area-interiors.js), so that the sectors and the places stay the same
    // when switching (user, 5 November 2026); theorems have ids "t.<id>"
    const viewCache = new Map();
    const isT = (id) => id.startsWith("t.");
    function interior(folder, inner) {
      const key = folder + "|" + inner;
      if (!viewCache.has(key)) {
        const I = INTER[folder];
        viewCache.set(key, I && { R: I.R, sectors: I.sectors, nodes: I.nodes.filter((n) => inner === "both" || (inner === "theorems") === isT(n[0])) });
      }
      return viewCache.get(key);
    }
    const edgeCache = new Map();
    // edges of the nodes inside: between two of them (inside) and to the areas of other nodes (outside: unit -> list)
    function edgesOf(folder, inner) {
      const key = folder + "|" + inner + "|" + state.alt;
      if (edgeCache.has(key)) return edgeCache.get(key);
      const I = interior(folder, inner), f = G.folders.find((x) => x.folder === folder);
      // a node by kind and prefixed id (a concept and a theorem may have the same id)
      const keyN = (id) => { const t = isT(id), raw = t ? id.slice(2) : id; return (t ? "t|" : "c|") + (raw.includes(":") ? raw : f.prefix + ":" + raw); };
      const idx = new Map(I.nodes.map((n, i) => [keyN(n[0]), i]));
      const kinds = inner === "concepts" ? ["def"] : inner === "theorems" ? ["proof"] : ["def", "proof", "stmt"], keyOf = (it) => it.type + "|" + it.f.prefix + ":" + it.id;
      const inside = [], outside = new Map(), seen = new Set();
      G.singles.forEach((s) => {
        if (!kinds.includes(s.kind) || (s.alt && !state.alt)) return;
        const a = idx.get(keyOf(s.from)), b = idx.get(keyOf(s.to));
        if (a != null && b != null) { if (a !== b && !seen.has(a + ">" + b)) { seen.add(a + ">" + b); inside.push([a, b]); } return; }
        const i = a != null ? a : b;
        if (i == null) return;
        const other = a != null ? s.to : s.from, ou = other.au;
        if (!ou || ou.gray || !ou.folder || ou.folder.folder === folder) return;
        if (!outside.has(ou)) outside.set(ou, []);
        outside.get(ou).push({ node: i, other, out: a != null });
      });
      const res = { inside, outside };
      edgeCache.set(key, res);
      return res;
    }
    let C = null; // the contents drawn: centre, radius, scale, rotation, node positions, edges
    function shape(g, kind, r, fill) {
      const s = { class: "form", fill };
      if (kind === "star") {
        const pts = [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + (Math.PI / 5) * i, q = (i % 2 ? 0.5 : 1.25) * r; return `${(q * Math.cos(a)).toFixed(2)},${(q * Math.sin(a)).toFixed(2)}`; });
        return el("polygon", { ...s, points: pts.join(" ") }, g);
      }
      if (kind === "square") return el("rect", { ...s, x: -r * 0.88, y: -r * 0.88, width: r * 1.76, height: r * 1.76 }, g);
      if (kind === "diamond") return el("path", { ...s, d: `M0,${-r * 1.2}L${r * 1.2},0L0,${r * 1.2}L${-r * 1.2},0Z` }, g);
      if (kind === "triangle") return el("path", { ...s, d: `M0,${-r * 1.2}L${r * 1.1},${r * 0.8}L${-r * 1.1},${r * 0.8}Z` }, g);
      if (kind === "hexagon") return el("polygon", { ...s, points: [0, 1, 2, 3, 4, 5].map((i) => { const a = (Math.PI / 3) * i; return `${(r * 1.05 * Math.cos(a)).toFixed(2)},${(r * 1.05 * Math.sin(a)).toFixed(2)}`; }).join(" ") }, g);
      return el("circle", { ...s, r }, g);
    }
    function buildInterior() {
      removeInterior();
      if (!Z.folder || !Z.geo || !api.isMap()) return;
      const I = interior(Z.folder, Z.inner);
      if (!I) return;
      // the layout of the reference page (a disk of radius I.R) mapped into the ellipse: turned first, then stretched
      // (horizontally 1.7 times the vertical scale) and scaled by the waves of the outline in its direction, so that a
      // node inside the disk stays inside the outline; the points keep their shape at the vertical scale
      const g0 = Z.geo, u = g0.u, cx = g0.c.x, cy = g0.c.y, sy = g0.B / I.R;
      const E = edgesOf(Z.folder, Z.inner);
      const place = (x, y, t) => { const ct = Math.cos(t), st = Math.sin(t), xr = x * ct - y * st, yr = x * st + y * ct; return diskPt(g0, Math.hypot(xr, yr) / I.R, Math.atan2(yr, xr)); };
      // the turn makes the edges to other areas short: weighted sum of the angles between each own node (seen from the
      // centre, after stretching) and the direction of the other area, the weight growing with the distance of the node
      // from the centre (5° steps)
      let theta = 0, best = Infinity;
      for (let step = 0; step < 72; step++) {
        const t = (step * TAU) / 72;
        let cost = 0;
        E.outside.forEach((list, ou) => {
          const q = wpos(ou), phi = Math.atan2(q.y - cy, q.x - cx);
          list.forEach((e) => { const n = I.nodes[e.node], rho = Math.hypot(n[1], n[2]) / I.R, p = place(n[1], n[2], t); cost += rho * angDist(Math.atan2(p.y - cy, p.x - cx), phi); });
        });
        if (cost < best - 1e-9) { best = cost; theta = t; }
      }
      // Sectors (MSC classes) in shades of the colour of the group of the area, as on the map (user, 5 November 2026):
      // lightness levels from dark to light dealt out alternately (0, k/2, 1, k/2 + 1, …), so that neighbouring sectors
      // differ clearly. The angles of each sector are read from its path in the reference page.
      const secs = I.sectors.map(([d, , name]) => {
        const nums = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
        // M p0 L p1 A rx ry rot large sweep p2 L p3 A …: p0, p3 inner, p1, p2 outer
        const p0 = [nums[0], nums[1]], p1 = [nums[2], nums[3]], p3 = [nums[11], nums[12]];
        return { name, a0: Math.atan2(p0[1], p0[0]), a1: Math.atan2(p3[1], p3[0]), rin: Math.hypot(...p0) / I.R, rout: Math.hypot(...p1) / I.R };
      });
      const base = hexHsl(u.F.color), k = secs.length, half = Math.ceil(k / 2);
      const levels = secs.map((_, i) => (k === 1 ? 62 : 40 + (i * 40) / (k - 1)));
      secs.forEach((sec, i) => {
        const L = levels[i % 2 ? half + (i - 1) / 2 : i / 2];
        sec.fill = hsl(base.h, Math.min(70, base.s), L);
        sec.node = hsl(base.h, Math.min(85, base.s + 10), Math.max(22, L - 16));
      });
      // the sector of a node by its angle in the reference page (between two sectors: the nearer one)
      const sectorOf = (x, y) => {
        if (Math.hypot(x, y) < 1e-6 || !secs.length) return null;
        const a = Math.atan2(y, x);
        let bestS = null, bestD = Infinity;
        secs.forEach((sec) => {
          const w = ((sec.a1 - sec.a0) % TAU + TAU) % TAU, rel = ((a - sec.a0) % TAU + TAU) % TAU;
          const d = rel <= w ? 0 : Math.min(rel - w, TAU - rel);
          if (d < bestD) { bestD = d; bestS = sec; }
        });
        return bestS;
      };
      g0.moved = 0;
      const P = I.nodes.map((n) => { const q = place(n[1], n[2], theta), sec = sectorOf(n[1], n[2]); return { x: q.x, y: q.y, r: Math.max(0.6, n[3] * sy), n, fill: sec ? sec.node : u.F.color }; });
      // degree of each node: its edges inside the area and to other areas (both directions), for the order of the names
      const deg = P.map(() => 0);
      E.inside.forEach(([a, b]) => { deg[a]++; deg[b]++; });
      E.outside.forEach((list) => list.forEach((e) => { deg[e.node]++; }));
      C = { cx, cy, A: g0.A, B: g0.B, theta, P, E, I, u, secs, deg };
      gZoom = el("g", { class: "zoom-ebene" }, svg);
      // organic borders between the sectors: each border bends a little to one side and back (a soft wave that vanishes
      // at both ends), its phase fixed by its angle; the outer edge follows the outline
      const gs = el("g", { class: "zoom-sektoren" }, gZoom);
      const border = (a, inward) => {
        const pts = [], ph = g0.ph[0] + 7.3 * a;
        for (let j = 0; j <= 12; j++) {
          const v = j / 12, sec = 0.026 * Math.sin(Math.PI * v) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 1.3 * v + ph));
          pts.push([v, a + sec]);
        }
        return inward ? pts.reverse() : pts;
      };
      secs.forEach((sec) => {
        const b0 = sec.a0 + theta, w = ((sec.a1 - sec.a0) % TAU + TAU) % TAU, b1 = b0 + w, r0 = sec.rin, pts = [];
        const at = (rho, b) => diskPt(g0, rho, b);
        border(b0, false).forEach(([v, b]) => pts.push(at(r0 + (1 - r0) * v, b)));
        const steps = Math.max(2, Math.ceil(w / 0.03));
        for (let j = 1; j < steps; j++) pts.push(at(1, b0 + (w * j) / steps));
        border(b1, true).forEach(([v, b]) => pts.push(at(r0 + (1 - r0) * v, b)));
        for (let j = steps - 1; j > 0; j--) pts.push(at(r0, b0 + (w * j) / steps));
        const path = el("path", { d: "M" + pts.map((q) => q.x.toFixed(2) + "," + q.y.toFixed(2)).join("L") + "Z", fill: sec.fill, class: "zoom-sektor" }, gs);
        el("title", {}, path).textContent = sec.name;
      });
      C.gOut = el("g", { class: "zoom-aussen" }, gZoom);
      const gIn = el("g", { class: "zoom-innen" }, gZoom);
      C.lines = E.inside.map(([a, b]) => {
        const A = P[a], B = P[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
        return { a, b, line: el("line", { x1: (A.x + (dx / d) * A.r).toFixed(2), y1: (A.y + (dy / d) * A.r).toFixed(2), x2: (B.x - (dx / d) * B.r).toFixed(2), y2: (B.y - (dy / d) * B.r).toFixed(2), class: "zoom-kante" }, gIn) };
      });
      const gN = el("g", { class: "zoom-knoten" }, gZoom);
      C.nodeEls = P.map((p, i) => {
        const g = el("g", { class: "zknoten", "data-id": p.n[0], transform: `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})` }, gN);
        shape(g, p.n[4], p.r, p.fill);
        const t = el("text", { class: "zname", "text-anchor": "middle" }, g);
        t.textContent = p.n[6];
        g.addEventListener("mouseenter", (ev) => { api.tip.textContent = p.n[6]; api.tip.hidden = false; api.moveTip(ev); });
        g.addEventListener("mousemove", api.moveTip);
        g.addEventListener("mouseleave", () => { api.tip.hidden = true; });
        g.addEventListener("click", (ev) => { ev.stopPropagation(); if (api.dragged()) return; Z.marked = Z.marked === i ? null : i; markInside(); api.drawControls(); api.update(); });
        return g;
      });
      C.gMarks = el("g", { class: "zoom-marken" }, gZoom);
      gZoom.addEventListener("click", (ev) => { ev.stopPropagation(); if (api.dragged() || ev.target.closest(".zmarke")) return; if (Z.marked != null) { Z.marked = null; markInside(); api.drawControls(); api.update(); } });
      // at the view of the area: start again from its first view, then widen it as far as the rings need
      if (Math.abs(api.getView().w - g0.tv.w) < 1e-6 * g0.tv.w) { g0.tv = g0.tv0; api.setView(g0.tv0); }
      placeOutside();
      fitRings();
      markInside();
    }
    function markInside() {
      if (!C || !gZoom) return;
      const m = Z.marked, near = new Set(m == null ? [] : [m]);
      if (m != null) C.E.inside.forEach(([a, b]) => { if (a === m) near.add(b); if (b === m) near.add(a); });
      gZoom.classList.toggle("fokus", m != null);
      C.nodeEls.forEach((g, i) => { g.classList.toggle("zhell", near.has(i)); g.classList.toggle("zwahl", i === m); });
      C.lines.forEach((l) => l.line.classList.toggle("zhell", m != null && (l.a === m || l.b === m)));
      (C.outLines || []).forEach((l) => l.el.classList.toggle("zhell", m != null && l.node === m));
      labelInside();
    }

    // ------------------------------------------------------------ names inside
    // Names by zoom level, as on the maps and on the map of the areas (user, 5 November 2026): constant size on the screen;
    // the nodes with most edges (in both directions, also to other areas) are named first, a marked node and its
    // neighbours before all; a name is placed below, above, right or left of its point where it overlaps no name, no
    // point and no name of a mark; otherwise it is hidden. Again at every change of the view; the points always stay.
    function labelInside() {
      if (!C || !gZoom) return;
      const s = api.scale(), fs = 11 * s, taken = [], V = visible();
      const lit = (i) => C.nodeEls[i].classList.contains("zhell");
      const order = C.P.map((p, i) => i).sort((a, b) => lit(b) - lit(a) || C.deg[b] - C.deg[a] || C.P[b].r - C.P[a].r || a - b);
      // the points grow less than the view: radius × f^-0.75 at the zoom factor f (1 … 6), so that they stay points
      const f = Z.geo ? Math.max(1, Z.geo.tv.w / api.getView().w) : 1, kz = Math.pow(f, -0.75);
      if (C.kz !== kz) {
        C.kz = kz;
        C.nodeEls.forEach((g) => { const sh = g.querySelector(".form"); if (sh) sh.setAttribute("transform", kz === 1 ? "" : `scale(${kz.toFixed(4)})`); });
        C.lines.forEach((l) => {
          const A = C.P[l.a], B = C.P[l.b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
          l.line.setAttribute("x1", (A.x + (dx / d) * A.r * kz).toFixed(2)); l.line.setAttribute("y1", (A.y + (dy / d) * A.r * kz).toFixed(2));
          l.line.setAttribute("x2", (B.x - (dx / d) * B.r * kz).toFixed(2)); l.line.setAttribute("y2", (B.y - (dy / d) * B.r * kz).toFixed(2));
        });
      }
      const rr = (p) => p.r * kz;
      const pts = C.P.map((p, i) => ({ i, x0: p.x - rr(p), x1: p.x + rr(p), y0: p.y - rr(p), y1: p.y + rr(p) }));
      // the names and circles of the marks are obstacles as well (their screen boxes in graph units)
      const inv = svg.getScreenCTM().inverse(), toG = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(inv); };
      const boxOf = (e) => { const b = e.getBoundingClientRect(), a = toG(b.left, b.top), c = toG(b.right, b.bottom); return { x0: a.x, y0: a.y, x1: c.x, y1: c.y }; };
      const fixed = [...gZoom.querySelectorAll(".zmarke-name, .zkreis")].map(boxOf);
      const meets = (r, t) => r.x0 < t.x1 && t.x0 < r.x1 && r.y0 < t.y1 && t.y0 < r.y1;
      const free = (r, i) => !taken.some((t) => meets(r, t)) && !fixed.some((t) => meets(r, t)) && !pts.some((t) => t.i !== i && meets(r, t));
      order.forEach((i) => {
        const p = C.P[i], t = C.nodeEls[i].querySelector("text"), name = p.n[6];
        const shown = name.length > 26 ? name.slice(0, 25).replace(/[\s,;:]+\S*$/, "") + " …" : name;
        if (t.textContent !== shown) t.textContent = shown;
        t.style.fontSize = fs.toFixed(4) + "px";
        t.style.strokeWidth = (3 * s).toFixed(4) + "px";
        // outside the visible part: hidden (no room needed)
        if (p.x < V.x || p.x > V.x + V.w || p.y < V.y || p.y > V.y + V.h) { t.style.visibility = "hidden"; return; }
        // the measured width of the name (graph units; the group of the node is only moved, not scaled)
        const w = (t.getComputedTextLength() || shown.length * fs * 0.55) + s, g = 2 * s;
        const places = [
          { anchor: "middle", x: 0, y: rr(p) + fs * 1.0, r: { x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y + rr(p) + g * 0.5, y1: p.y + rr(p) + fs * 1.25 } },
          { anchor: "middle", x: 0, y: -rr(p) - fs * 0.3, r: { x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y - rr(p) - fs * 1.2, y1: p.y - rr(p) - g * 0.5 } },
          { anchor: "start", x: rr(p) + g, y: fs * 0.35, r: { x0: p.x + rr(p) + g, x1: p.x + rr(p) + g + w, y0: p.y - fs * 0.6, y1: p.y + fs * 0.55 } },
          { anchor: "end", x: -rr(p) - g, y: fs * 0.35, r: { x0: p.x - rr(p) - g - w, x1: p.x - rr(p) - g, y0: p.y - fs * 0.6, y1: p.y + fs * 0.55 } },
        ];
        // each place is tried with the real box of the text there (getBBox in the coordinates of the node)
        const pad = s;
        const boxAt = (q) => {
          t.setAttribute("x", q.x.toFixed(3)); t.setAttribute("y", q.y.toFixed(3)); t.setAttribute("text-anchor", q.anchor);
          const bb = t.getBBox();
          return { x0: p.x + bb.x - pad, x1: p.x + bb.x + bb.width + pad, y0: p.y + bb.y, y1: p.y + bb.y + bb.height };
        };
        let pick = null;
        for (const q of places) { const r = boxAt(q); if (free(r, i)) { pick = { ...q, r }; break; } }
        if (!pick && C.nodeEls[i].classList.contains("zwahl")) pick = { ...places[0], r: boxAt(places[0]) };
        t.style.visibility = pick ? "" : "hidden";
        if (!pick) return;
        t.setAttribute("x", pick.x.toFixed(3)); t.setAttribute("y", pick.y.toFixed(3)); t.setAttribute("text-anchor", pick.anchor);
        taken.push(pick.r);
      });
    }

    // ------------------------------------------------------------ edges to other areas: to their point or to a mark
    // the part of the picture that is visible (the view box widened to the shape of the picture)
    function visible() {
      const v = api.getView(), s = api.scale(), w = (svg.clientWidth || 1) * s, h = (svg.clientHeight || 1) * s;
      return { x: v.x + v.w / 2 - w / 2, y: v.y + v.h / 2 - h / 2, w, h, s };
    }
    // sizes of the marks on the rings in screen pixels: radius of a circle, size of the names, gap between the outline and
    // the first ring, distance of the rings
    const RINGS = { KR: 10, FS: 11, GAPPX: 14, RINGPX: 2 * 10 + 11 + 18 };
    // The rings with their circles and names lie wholly in the picture (user, 5 November 2026): with more rings the
    // ellipse appears smaller, i.e. the view of the area is widened until the outermost ring with its names and a margin
    // fits into the visible part below the toolbar. Only at the view of the area itself (zoom factor 1); a few rounds,
    // since the number of rings depends on the room on the screen.
    function fitRings() {
      if (!C || !Z.geo) return;
      for (let round = 0; round < 4; round++) {
        const rings = 1 + Math.max(0, ...C.marks.map((m) => m.ring));
        if (!C.marks.length) return;
        const { KR, FS, GAPPX, RINGPX } = RINGS, margin = 14;
        const E = GAPPX + (rings - 1) * RINGPX + 2 * KR + 3 + FS * 1.3 + margin;
        const W = svg.clientWidth || 1, H = svg.clientHeight || 1, f = 1 + AMP * 1.2;
        let need = Math.max((C.A * f) / Math.max(10, W / 2 - E), (C.B * f) / Math.max(10, H / 2 - E));
        // variant "keep": the ring curve follows the shape; in every direction its point plus the room of the names must
        // fit into the half width and half height of the picture (centred on the centre of the area)
        if (KEEP) {
          need = 0;
          for (let k = 0; k < NK; k += 4) {
            const t = (k * TAU) / NK, R = Z.geo.ringR[k], cs = Math.abs(Math.cos(t)), sn = Math.abs(Math.sin(t));
            need = Math.max(need, (cs * R) / Math.max(10, W / 2 - cs * E), (sn * R) / Math.max(10, H / 2 - sn * E));
          }
        }
        const s0 = api.scale();
        if (need <= s0 * 1.002) return;
        const v = api.getView(), k = need / s0, cx = v.x + v.w / 2, cy = v.y + v.h / 2;
        const nv = { x: cx - (v.w * k) / 2, y: cy - (v.h * k) / 2, w: v.w * k, h: v.h * k };
        Z.geo.tv = nv;
        api.setView(nv);
        placeOutside();
      }
    }
    function placeOutside() {
      if (!C) return;
      const V = visible(), s = V.s;
      C.gOut.innerHTML = ""; C.gMarks.innerHTML = "";
      C.outLines = []; C.marks = [];
      // every neighbour with edges to the area is a mark on the ring, also one whose region is in the picture (user,
      // 5 November 2026); the neighbouring regions are drawn pale, without points and names, and only show the lay of the
      // land
      const toMark = [];
      C.E.outside.forEach((list, ou) => toMark.push({ ou, list }));
      // Marks (user, 5 November 2026): small circles with the symbol of the area, all of the same size, in the colour of
      // its group, on an ellipse concentric with the outline and a little larger (parallel to it), in the direction of the
      // area seen from the centre; with many marks on further rings. Name and number of edges run along the ring on the
      // outer side of the circle, readable from left to right (on the lower half the path runs the other way and lies
      // further out, so that the letters hang down to the circle).
      const { KR, FS, GAPPX, RINGPX } = RINGS, BAR = 2 * KR * s, GAP0 = GAPPX * s + (KEEP ? 0 : AMP * 1.2 * C.A), RING = RINGPX * s;
      const ringAxes = (ring) => [C.A + GAP0 + ring * RING, C.B + GAP0 + ring * RING];
      const onRing = (t, ring, extra = 0) => {
        // variant "keep": the smooth curve around the shape, moved outward by the gap and the rings
        if (KEEP) { const r = atK(Z.geo.offsetR(GAP0 + ring * RING + extra), t); return { x: C.cx + r * Math.cos(t), y: C.cy + r * Math.sin(t), d: r }; }
        const [a, b] = ringAxes(ring), A2 = a + extra, B2 = b + extra, r = (A2 * B2) / Math.hypot(B2 * Math.cos(t), A2 * Math.sin(t));
        return { x: C.cx + r * Math.cos(t), y: C.cy + r * Math.sin(t), d: r };
      };
      const marks = toMark.map(({ ou, list }) => {
        const q = wpos(ou), phi = Math.atan2(q.y - C.cy, q.x - C.cx);
        return { ou, list, phi, a: phi, ring: 0, full: ou.label, n: list.length, arc: 2 * KR + 4 };
      }).sort((p, q) => p.phi - q.phi);
      // half the room of a mark along its ring, as an angle: the arc or the name, whichever is longer, and a gap
      // (the length along the ring per angle is measured on the ring itself, which matters where the curve of the variant
      // "keep" runs steeply)
      const speed = (a, ring) => { const p = onRing(a - 0.01, ring), q = onRing(a + 0.01, ring); return Math.max(onRing(a, ring).d, Math.hypot(q.x - p.x, q.y - p.y) / 0.02); };
      const halfOf = (m) => ((Math.max(m.arc, m.label.length * FS * 0.54) / 2 + 7) * s) / speed(m.a, m.ring);
      const signed = (x, y) => ((((y - x) % TAU) + 3 * Math.PI) % TAU) - Math.PI;
      const clash = (p, q) => p.ring === q.ring && Math.abs(signed(p.a, q.a)) < halfOf(p) + halfOf(q);
      // the rings first: all marks on the inner ring if they fit there (with some room to spare), else alternately on two
      // (or three) rings in the order of their directions, so that neighbours do not compete for room; then
      // marks of one ring that still overlap are pushed apart along it (their order stays)
      const spread = (extra = 0) => {
        marks.forEach((m) => { m.a = m.phi; m.ring = 0; });
        // as few rings as fit (at most four; more than two only for very many marks, such as set theory with about 40, on a
        // small screen)
        const total = marks.reduce((sum, m) => sum + 2 * halfOf(m), 0), rings = Math.min(4, Math.max(1, Math.ceil(total / (0.85 * TAU))) + extra);
        marks.forEach((m, i) => { m.ring = i % rings; });
        // On each ring: the circle is cut at the largest gap between the wanted directions; then, from there on, every
        // mark is a block of its room, and blocks that overlap are merged into one, placed so that the mean distance of
        // its marks from their directions is zero (exact, no iteration; three rounds because the room depends on the
        // place). Fits only if all rooms together are less than the full circle.
        let ok = true;
        [0, 1, 2, 3, 4].forEach((ring) => {
          const list = marks.filter((m) => m.ring === ring).sort((p, q) => p.phi - q.phi);
          if (list.length < 2) return;
          let cut = 0, gapMax = -1;
          list.forEach((m, i) => { const q = list[(i + 1) % list.length], g = (((q.phi - m.phi) % TAU) + TAU) % TAU; if (g > gapMax) { gapMax = g; cut = (i + 1) % list.length; } });
          const seq = list.slice(cut).concat(list.slice(0, cut));
          const want = []; let prev = null;
          seq.forEach((m) => { let w = m.phi; if (prev != null) while (w < prev) w += TAU; want.push(w); prev = w; });
          for (let round = 0; round < 8; round++) {
            const width = seq.map((m) => 2.1 * halfOf(m)), blocks = [];
            seq.forEach((m, i) => {
              let blk = { items: [i], width: width[i] };
              const place = (bk) => { let off = 0, sum = 0; bk.items.forEach((j) => { sum += want[j] - (off + width[j] / 2); off += width[j]; }); bk.start = sum / bk.items.length; };
              place(blk);
              while (blocks.length && blocks[blocks.length - 1].start + blocks[blocks.length - 1].width > blk.start) {
                const pb = blocks.pop();
                blk = { items: pb.items.concat(blk.items), width: pb.width + blk.width };
                place(blk);
              }
              blocks.push(blk);
            });
            blocks.forEach((bk) => { let off = bk.start; bk.items.forEach((j) => { seq[j].a = off + width[j] / 2; off += width[j]; }); });
          }
          const sumW = seq.reduce((t, m) => t + 2 * halfOf(m), 0), first = seq[0], last = seq[seq.length - 1];
          if (sumW > TAU || last.a + halfOf(last) > first.a - halfOf(first) + TAU + 1e-9) ok = false;
          // the rooms at the final places (they depend on the place along the ring) must not overlap
          for (let i = 0; i + 1 < seq.length; i++) if (seq[i + 1].a - seq[i].a < halfOf(seq[i]) + halfOf(seq[i + 1]) - 1e-9) ok = false;
        });
        return ok;
      };
      const deviation = () => Math.max(0, ...marks.map((m) => angDist(m.a, m.phi)));
      const shorten = (t, n) => (t.length <= n ? t : t.slice(0, n - 1).replace(/[\s,;:]+\S*$/, "") + "…");
      let bestTry = null;
      // first shorter names, then (if still not fitting within 30°) one more ring
      search: for (const extra of [0, 1]) for (const n of [99, 24, 18, 13, 10, 8]) {
        marks.forEach((m) => { m.label = shorten(m.full, n) + " (" + m.n + ")"; });
        const ok = spread(extra), dev = deviation();
        if (!bestTry || (ok && !bestTry.ok) || (ok === bestTry.ok && dev < bestTry.dev - 1e-6)) bestTry = { ok, dev, state: marks.map((m) => [m.a, m.ring, m.label]) };
        if (ok && dev <= (29 * Math.PI) / 180) break search;
      }
      marks.forEach((m, i) => { [m.a, m.ring, m.label] = bestTry.state[i]; });
      const arcPath = (a0, a1, ring, extra) => { const pts = []; for (let j = 0; j <= 16; j++) { const Q = onRing(a0 + ((a1 - a0) * j) / 16, ring, extra); pts.push(Q.x.toFixed(2) + "," + Q.y.toFixed(2)); } return "M" + pts.join("L"); };
      marks.forEach((m, mi) => {
        const P = onRing(m.a, m.ring), g = el("g", { class: "zmarke", "data-folder": m.ou.folder.folder }, C.gMarks);
        m.x = P.x; m.y = P.y; m.h = halfOf(m);
        const kreis = el("g", { class: "zkreis", transform: `translate(${P.x.toFixed(2)},${P.y.toFixed(2)})` }, g), AL0 = window.AREA_LAYOUT;
        el("circle", { r: (KR * s).toFixed(3), fill: m.ou.F.color, class: "zkreis-form" }, kreis);
        if (AL0) el("g", { class: "symbol-mark" }, kreis).innerHTML = AL0.symbolMarkup(AL0.SYMBOL[m.ou.folder.folder], KR * s, m.ou.F.color);
        // the path of the name: on the upper half clockwise (left to right), on the lower half anticlockwise and further
        // out by the height of the letters
        const low = Math.sin(m.a) > 0, extra = BAR / 2 + 3 * s + (low ? FS * 0.8 * s : 0), dl = m.h * 1.3;
        const id = "zm-" + Z.folder + "-" + mi;
        el("path", { id, d: low ? arcPath(m.a + dl, m.a - dl, m.ring, extra) : arcPath(m.a - dl, m.a + dl, m.ring, extra), fill: "none", stroke: "none" }, g);
        // The light halo is a text of its own underneath: with a text path the browser paints stroke and fill glyph by
        // glyph, so a halo in the same text (paint-order: stroke) covers the neighbouring letters (user's report,
        // 5 November 2026: names not readable). No textLength: the name keeps its natural width; its path is longer.
        ["zmarke-halo", "zmarke-name"].forEach((cls) => {
          const t = el("text", { class: cls }, g);
          t.style.fontSize = (FS * s).toFixed(4) + "px";
          if (cls === "zmarke-halo") t.style.strokeWidth = (3 * s).toFixed(4) + "px";
          el("textPath", { href: "#" + id, startOffset: "50%", "text-anchor": "middle" }, t).textContent = m.label;
        });
        el("title", {}, g).textContent = m.ou.name + ": " + m.list.length + " edge" + (m.list.length === 1 ? "" : "s") + " — click to zoom in";
        g.addEventListener("click", (ev) => { ev.stopPropagation(); if (api.dragged()) return; zoomTo(m.ou.folder.folder, true); });
        g.addEventListener("mouseenter", () => { C.gOut.classList.add("fokus"); C.outLines.forEach((l) => l.el.classList.toggle("zhell", l.ou === m.ou)); });
        g.addEventListener("mouseleave", () => { C.gOut.classList.remove("fokus"); C.outLines.forEach((l) => l.el.classList.remove("zhell")); markInside(); });
        m.g = g;
        C.marks.push(m);
      });
      // the lines: from the own node to the border of the point, or to the mark
      const line = (p, x, y, ou, stop, node) => {
        const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy) || 1;
        const l = el("line", { x1: (p.x + (dx / d) * p.r).toFixed(2), y1: (p.y + (dy / d) * p.r).toFixed(2), x2: (x - (dx / d) * stop).toFixed(2), y2: (y - (dy / d) * stop).toFixed(2), class: "zoom-aussen-kante", stroke: ou.F.color }, C.gOut);
        C.outLines.push({ el: l, ou, node });
      };
      marks.forEach((m) => m.list.forEach((e) => line(C.P[e.node], m.x, m.y, m.ou, (KR + 1.5) * s, e.node)));
      C.toPoint = [];
    }

    // ------------------------------------------------------------ size of the points of the other areas while zoomed
    // the points would grow with the zoom; they keep about the size they have on the whole map
    const pointScale = () => { const zf = parseFloat(svg.style.getPropertyValue("--zf")) || 1; return Math.min(1, zf); };
    let viewPending = false;
    function onView() {
      svg.style.setProperty("--zp", pointScale().toFixed(4));
      if (!C || Z.anim || viewPending) return;
      viewPending = true;
      requestAnimationFrame(() => { viewPending = false; if (C) { placeOutside(); if (Z.geo && Math.abs(api.getView().w - Z.geo.tv.w) < 1e-6 * Z.geo.tv.w) fitRings(); labelInside(); markInside(); } });
    }

    // ------------------------------------------------------------ toolbar and panel while zoomed
    // The path in the heading (user, 5 November 2026): "Graph of the areas › <group> › <area>" in the font of the title;
    // "Graph of the areas" stays the title and leads back to the map as a link while zoomed (or brings the moved map back
    // into view); the group without its MSC classes, in its colour; the ⓘ stays behind the title
    let titleLink = null, titlePath = null;
    function setupTitle() {
      const h1 = document.querySelector("header.leiste h1");
      if (!h1) return;
      const tn = [...h1.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      if (!tn) return;
      titleLink = document.createElement("a");
      titleLink.className = "zoom-titel-link";
      titleLink.textContent = tn.textContent.trim();
      titleLink.title = "back to the whole map (Escape)";
      h1.replaceChild(titleLink, tn);
      h1.insertBefore(document.createTextNode(" "), titleLink.nextSibling);
      titlePath = document.createElement("span");
      titlePath.className = "zoom-titel-pfad";
      h1.appendChild(titlePath);
      titleLink.addEventListener("click", (ev) => { ev.preventDefault(); if (Z.folder) zoomOut(true); else recentre(); });
      // the two variants of the zoom side by side (user, 5 November 2026): a small link to the other page, with the
      // address (area, kind of nodes) carried over
      const v = document.createElement("span");
      v.className = "zoom-variante";
      v.innerHTML = KEEP ? `variant: area keeps its shape · <a href="areas.html">other version</a>` : `<a href="areas-shape.html">variant: shape kept</a>`;
      v.querySelector("a").addEventListener("click", (ev) => { ev.preventDefault(); location.href = (KEEP ? "areas.html" : "areas-shape.html") + location.hash; });
      h1.appendChild(v);
    }
    function updateTitle() {
      if (!titleLink) return;
      titleLink.classList.toggle("aktiv", !!Z.folder || !!Z.shifted);
      if (!Z.folder) { titlePath.innerHTML = ""; return; }
      const zu = unitOf(Z.folder), group = zu.F.name.replace(/\s*\([^)]*\)\s*$/, "");
      titlePath.innerHTML = ` › <span class="zoom-gruppe" style="color:${zu.F.color}">${esc(group)}</span> › <span class="zoom-gebiet">${esc(zu.label)}</span>`;
    }
    setupTitle();
    function afterControls() {
      updateTitle();
      if (!Z.folder) return;
      const btn = (attr, val, on, label, title) => `<button ${attr}="${val}" class="${on ? "an" : ""}" title="${esc(title)}">${label}</button>`;
      const div = document.createElement("div");
      div.className = "leiste-gruppe zoom-leiste";
      div.innerHTML = `<div class="stufen">${btn("data-zoom-inner", "concepts", Z.inner === "concepts", "concepts", "the concepts of the area; concepts and theorems keep their places and sectors when switching")}${btn("data-zoom-inner", "theorems", Z.inner === "theorems", "theorems", "the theorems of the area")}${btn("data-zoom-inner", "both", Z.inner === "both", "both", "concepts and theorems together")}</div>` +
        `<button data-zoom-open title="the ${Z.inner === "concepts" ? "concept graph" : Z.inner === "theorems" ? "theorem graph" : "concept graph with the theorems"} of this area on its own page">open detailed graph</button>`;
      api.controls.insertBefore(div, api.controls.firstChild);
    }
    api.controls.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-zoom-inner]");
      if (b) { setInner(b.dataset.zoomInner, true); return; }
      if (ev.target.closest("[data-zoom-open]")) location.href = detailHref();
    });
    function detailHref() {
      // concepts and theorems: their own graphs; both: the concept graph with the theorems shown (same layout as here)
      const id = C && Z.marked != null ? C.P[Z.marked].n[0] : null;
      const page = Z.inner === "both" ? "concepts.html?theorems=all" : Z.inner + ".html", mark = id && Z.inner === "theorems" ? id.slice(2) : id;
      return Z.folder + "/" + page + (mark ? "#mark=" + encodeURIComponent(mark) : "");
    }
    function panelHtml() {
      if (!Z.folder) return null;
      const u = unitOf(Z.folder), I = interior(Z.folder, Z.inner), E = edgesOf(Z.folder, Z.inner);
      const what = Z.inner === "both" ? "concepts and theorems" : Z.inner, kinds = Z.inner === "concepts" ? "definitions" : Z.inner === "theorems" ? "proofs" : "definitions, statements and proofs";
      const rows = [...E.outside.entries()].sort((a, b) => b[1].length - a[1].length)
        .map(([ou, list]) => `<li><a href="#" data-zoom-to="${esc(ou.folder.folder)}"><i class="farbe" style="background:${ou.F.color}"></i>${esc(ou.label)}</a> <span class="meta">${list.length}</span></li>`).join("");
      let marked = "";
      if (C && Z.marked != null) {
        const p = C.P[Z.marked], near = C.E.inside.filter(([a, b]) => a === Z.marked || b === Z.marked).map(([a, b]) => C.P[a === Z.marked ? b : a].n[6]);
        marked = `<h3>${esc(p.n[6])}</h3><p class="meta">${near.length ? "Connected inside the area: " + near.map(esc).join(", ") : "No edges inside the area."}</p>`;
      }
      return `<div class="kopf"><h2>${esc(u.name)}</h2><p class="meta">${I.nodes.length} ${what}, laid out as in the concept graph of the area with the theorems shown; lines are ${kinds} inside the area and edges to other areas.</p></div>` +
        marked + `<p><a href="${esc(detailHref())}">open detailed graph</a></p>` +
        (rows ? `<h3>Edges to other areas (${kinds})</h3><ul class="zoom-liste">${rows}</ul>` : "");
    }
    api.panel.addEventListener("click", (ev) => {
      const a = ev.target.closest("[data-zoom-to]");
      if (!a) return;
      ev.preventDefault();
      zoomTo(a.dataset.zoomTo, true);
    });

    // ------------------------------------------------------------ zooming within an area (user, 5 November 2026)
    // Mouse wheel and dragging (dragging is the page's own) move and enlarge the view continuously, from the view of the
    // area (factor 1) up to 6 times; the names are placed again at every step (labelInside)
    const MAXZOOM = 6;
    function zoomView(f, cx, cy, minF = 1) {
      const tv = Z.geo.tv, v = api.getView(), w = Math.min(tv.w / minF, Math.max(tv.w / MAXZOOM, v.w * f)), k = w / v.w;
      api.setView({ x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k, w, h: v.h * k });
    }
    // Back to the map by the wheel (user, 5 November 2026): below the view of the area the picture gets visibly smaller,
    // down to 0.85 times; a wheel movement that would go below that leaves the area with the same animated change as
    // "Graph of the areas" (address and back button as there). One small turn of the wheel (one step, 0.87) does not leave;
    // released between 0.85 and 1, the picture returns softly to 1 after a moment.
    const OUT_LIMIT = 0.85;
    let springTimer = null, springAnim = null;
    function springBack() {
      if (!Z.folder || Z.anim || !Z.geo) return;
      const from = api.getView(), to = Z.geo.tv;
      if (from.w <= to.w * 1.0001) return;
      const t0 = performance.now();
      const step = (now) => {
        const x = Math.min(1, (now - t0) / 280), e = 1 - Math.pow(1 - x, 3);
        const w = from.w + (to.w - from.w) * e, h = from.h + (to.h - from.h) * e;
        const cx = from.x + from.w / 2 + (to.x + to.w / 2 - from.x - from.w / 2) * e, cy = from.y + from.h / 2 + (to.y + to.h / 2 - from.y - from.h / 2) * e;
        api.setView({ x: cx - w / 2, y: cy - h / 2, w, h });
        springAnim = x < 1 && Z.folder ? requestAnimationFrame(step) : null;
      };
      springAnim = requestAnimationFrame(step);
    }
    // factor of one wheel event, weighted by its size: one notch of a mouse wheel (deltaY 100) is 1.15, the many small
    // events of a touchpad count by their size (for zooming in and out alike)
    const stepFactor = (ev) => {
      const d = ev.deltaY * (ev.deltaMode === 1 ? 33 : ev.deltaMode === 2 ? 400 : 1);
      return Math.exp((Math.max(-300, Math.min(300, d)) * Math.log(1.15)) / 100);
    };
    // Into an area by the wheel on the map (user, 5 November 2026): up to 2.5 times the whole view the wheel only enlarges
    // the map; from 2.0 times the outline of the area under the mouse is lit as an announcement, and beyond 2.5 times the
    // same change as a click on its region starts. Only over the region of an area: over gaps, bands, points or outside
    // the map the map is enlarged further without leaving. Not in "Circle".
    const IN_ANNOUNCE = 2.0, IN_LIMIT = 2.5;
    let announced = null;
    const announce = (g) => { if (announced && announced !== g) announced.classList.remove("ankuendigung"); announced = g; if (g) g.classList.add("ankuendigung"); };
    svg.addEventListener("wheel", (ev) => {
      if (Z.folder || Z.anim || !api.isMap()) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      const v = api.getView(), f = stepFactor(ev), rect = svg.getBoundingClientRect(), s = api.scale(), fit = api.fit();
      const after = fit.w / (v.w * f), hit = document.elementFromPoint(ev.clientX, ev.clientY), region = hit && hit.closest(".zoom-region");
      if (f < 1 && region && after > IN_LIMIT) { announce(null); zoomTo(region.dataset.folder, true); return; }
      announce(f < 1 && region && after >= IN_ANNOUNCE ? region : after >= IN_ANNOUNCE && region === announced ? region : null);
      // the map itself, around the mouse (as the page's own wheel)
      const cx = v.x + v.w / 2 + (ev.clientX - rect.left - rect.width / 2) * s, cy = v.y + v.h / 2 + (ev.clientY - rect.top - rect.height / 2) * s;
      api.setView({ x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f, w: v.w * f, h: v.h * f });
    }, { capture: true, passive: false });
    svg.addEventListener("wheel", (ev) => {
      if (!Z.folder || Z.anim || !C) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      clearTimeout(springTimer);
      if (springAnim) { cancelAnimationFrame(springAnim); springAnim = null; }
      const v = api.getView(), rect = svg.getBoundingClientRect(), s = api.scale(), f = stepFactor(ev);
      // the factor the view would have after this step: below the limit the area is left
      if (Z.geo.tv.w / (v.w * f) < OUT_LIMIT - 1e-9) { zoomOut(true); return; }
      const cx = v.x + v.w / 2 + (ev.clientX - rect.left - rect.width / 2) * s, cy = v.y + v.h / 2 + (ev.clientY - rect.top - rect.height / 2) * s;
      zoomView(f, cx, cy, OUT_LIMIT);
      if (api.getView().w > Z.geo.tv.w * 1.0001) springTimer = setTimeout(springBack, 450);
    }, { capture: true, passive: false });

    // ------------------------------------------------------------ leaving the zoom; address; history
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && Z.folder && !(ev.target && ev.target.id === "search")) zoomOut(true); });
    svg.addEventListener("click", (ev) => {
      if (api.dragged() || Z.anim) return;
      if (ev.target.closest(".zoom-region, .zoom-ebene, .knoten, .band")) return;
      if (Z.folder) zoomOut(true);
      else if (Z.shifted) recentre();
    });
    function fromAddress(q) {
      const want = q.get("zoom"), inner = ["theorems", "both"].includes(q.get("inner")) ? q.get("inner") : "concepts";
      const instant = Z.first;
      Z.first = false;
      if (inner !== Z.inner) { Z.inner = inner; Z.marked = null; if (Z.folder && want === Z.folder && !Z.anim) { buildInterior(); api.drawControls(); api.update(); } }
      if (want && INTER[want] && api.isMap()) { if (want !== Z.folder) zoomTo(want, false, instant); }
      else if (Z.folder) zoomOut(false, instant);
    }
    // the back button: hashchange (handled by the page, which calls fromHash) and popstate (also without hashchange)
    window.addEventListener("popstate", () => {
      const q = new Map(location.hash.slice(1).split("&").filter(Boolean).map((p) => { const i = p.indexOf("="); return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))]; }));
      fromAddress(q);
    });

    // for tests
    window.AREA_ZOOM_STATE = {
      get folder() { return Z.folder; }, get inner() { return Z.inner; }, get animating() { return !!Z.anim; },
      mapFactor: () => api.fit().w / api.getView().w,
      variant: () => (KEEP ? "keep" : "ellipse"),
      // variant "keep": the outline drawn, the outline of the area, and whether the area is star-shaped seen from its centre
      shapeInfo: () => (Z.geo && KEEP ? { drawn: gMorph ? gMorph.querySelector("path").getAttribute("d") : null, outline: Z.geo.outlineD, soft: smoothUnits(api.layoutE())[allAreas.indexOf(Z.geo.u)], nonStar: Z.geo.nonStar, centreInside: Z.geo.centreInside, moved: Z.geo.moved } : null),
      // the shape of every area (variant "keep"): directions with several crossings, centre inside
      allShapes: () => (KEEP ? allAreas.filter((u) => INTER[u.folder.folder]).map((u) => { const g = { folder: u.folder.folder, u, c: { x: u.x, y: u.y } }; keepShape(g); return { folder: g.folder, nonStar: g.nonStar, centreInside: g.centreInside, aspect: g.A / g.B }; }) : []),
      announced: () => (announced ? announced.dataset.folder : null),
      zoomTo: (f) => zoomTo(f, true), zoomOut: () => zoomOut(true), setInner: (i) => setInner(i, true),
      // the view of the area enlarged by a factor (1 … 6) around a point (default: the centre of the area)
      setZoom: (f, x, y) => { if (!Z.geo) return; const tv = Z.geo.tv; api.setView(tv); zoomView(1 / f, x == null ? Z.geo.c.x : x, y == null ? Z.geo.c.y : y); },
      zoomFactor: () => (Z.geo ? Z.geo.tv.w / api.getView().w : 1),
      // nodes with their drawn position and the position mapped back into the unstretched disk without the waves
      // (inverse of diskPt), for the comparison with the reference page
      // the map after zooming out: moved or not, distance of the area from the middle of the picture (now and in the
      // whole view), and the parts of the width and height of the map that stand outside the picture
      mapInfo: (folder) => {
        const f = api.fit(), v = api.getView(), cw = svg.clientWidth || 1, ch = svg.clientHeight || 1;
        const vis = (q) => { const s = Math.max(q.w / cw, q.h / ch), W = cw * s, H = ch * s; return { x0: q.x + q.w / 2 - W / 2, x1: q.x + q.w / 2 + W / 2, y0: q.y + q.h / 2 - H / 2, y1: q.y + q.h / 2 + H / 2 }; };
        const EL = api.layoutE(), xs = EL.res.cells.map((c) => c.x * EL.scale), ys = EL.res.cells.map((c) => c.y * EL.scale);
        const m = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }, u = unitOf(folder);
        const V = vis(v), F = vis(f), dist = (R) => Math.hypot(u.x - (R.x0 + R.x1) / 2, u.y - (R.y0 + R.y1) / 2);
        return { shifted: !!Z.shifted, dist: dist(V), fitDist: dist(F), outX: (Math.max(0, V.x0 - m.x0) + Math.max(0, m.x1 - V.x1)) / (m.x1 - m.x0), outY: (Math.max(0, V.y0 - m.y0) + Math.max(0, m.y1 - V.y1)) / (m.y1 - m.y0), isFit: Math.abs(v.x - f.x) + Math.abs(v.y - f.y) < 1e-3 * f.w };
      },
      contents: () => (C ? { cx: C.cx, cy: C.cy, A: C.A, B: C.B, R: C.I.R, theta: C.theta, sectors: C.secs.map((x) => [x.name, +x.a0.toFixed(4), +x.a1.toFixed(4)]), nodes: C.P.map((p) => {
        if (KEEP) { const b = Math.atan2(p.y - C.cy, p.x - C.cx), rho = Math.hypot(p.x - C.cx, p.y - C.cy) / (KEEP_MARGIN * atK(Z.geo.rin, b)); return { id: p.n[0], x: p.x, y: p.y, r: p.r, rx: p.n[1], ry: p.n[2], dx: rho * Math.cos(b), dy: rho * Math.sin(b) }; }
        const X = (p.x - C.cx) / C.A, Y = (p.y - C.cy) / C.B, b = Math.atan2(Y, X), rho = Math.hypot(X, Y) / wob(Z.geo, b);
        return { id: p.n[0], x: p.x, y: p.y, r: p.r, rx: p.n[1], ry: p.n[2], dx: rho * Math.cos(b), dy: rho * Math.sin(b) };
      }),
        outline: gMorph ? gMorph.querySelector("path").getAttribute("d").slice(1, -1).split("L").map((q) => q.split(",").map(Number)) : [] } : null),
      marks: () => (C ? C.marks.map((m) => ({ folder: m.ou.folder.folder, phi: m.phi, a: m.a, h: m.h, ring: m.ring, x: m.x, y: m.y, n: m.list.length, label: m.label })) : []),
      toPoint: () => (C ? C.toPoint.slice() : []),
      // the lit outline of an area and the drawn borders of the areas (for the test: the outline is part of them)
      outlineOf: (folder) => { const g = svg.querySelector(`.zoom-region[data-folder="${folder}"] .zoom-umriss`); return g ? g.getAttribute("d") : null; },
      drawnBorders: () => { const p = svg.querySelector("path.zell-grenze"); return p ? p.getAttribute("d") : null; },
      regionPoints: (folder) => {
        // the cells of the region, the farthest from the point of the area first (for clicks in tests)
        const i = allAreas.indexOf(unitOf(folder)), R = regions()[i], u = allAreas[i], sc = api.layoutE().scale;
        return R.cells.map((c) => ({ x: c.x * sc, y: c.y * sc })).sort((a, b) => Math.hypot(b.x - u.x, b.y - u.y) - Math.hypot(a.x - u.x, a.y - u.y));
      },
    };

    return {
      afterDraw() {
        gZoom = null; C = null; gMorph = null;
        drawRegions();
        collectMap();
        if (Z.geo && !api.isMap()) {
          if (Z.anim) { cancelAnimationFrame(Z.anim); Z.anim = null; svg.classList.remove("unterwegs", "zoom-unterwegs"); }
          Z.folder = null; Z.geo = null; Z.e = 0; Z.marked = null; svg.classList.remove("gezoomt"); api.drawControls();
        }
        markOwnPoint();
        if (!Z.geo) return;
        if (Z.folder && !Z.anim) api.setView(Z.geo.tv);
        applyWarp();
        if (Z.folder && !Z.anim) buildInterior();
      },
      onView,
      afterControls,
      hashParts: () => (Z.folder ? ["zoom=" + Z.folder].concat(Z.inner !== "concepts" ? ["inner=" + Z.inner] : []) : []),
      fromHash: fromAddress,
      panel: panelHtml,
    };
  };
})();
