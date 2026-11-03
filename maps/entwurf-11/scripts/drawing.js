// Own copy of maps/shared_scripts/drawing.js for the frozen draft 11 (plan step N0, 22 October 2026), so that later changes
// for draft 12 do not change draft 11. Do not change this file.
// Shared drawing functions of Terra Mathematica (from draft 2 on).
// Older drafts contain their own copies and are not converted.

window.TM = (function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#3a2a1c", PAPER = "#efe3c2", RED = "#9b2a1a";

  function random(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function el(name, attrs, parents) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parents) parents.appendChild(e);
    return e;
  }
  function text(content, attrs, parents) {
    const t = el("text", attrs, parents);
    t.textContent = content;
    return t;
  }
  const f = (z) => Math.round(z * 10) / 10;
  function line(pts, zu) {
    return "M" + pts.map((p) => f(p[0]) + "," + f(p[1])).join("L") + (zu ? "Z" : "");
  }
  function smooth(pts) {
    if (pts.length < 3) return line(pts);
    let d = "M" + f(pts[0][0]) + "," + f(pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += "C" + f(p1[0] + (p2[0] - p0[0]) / 6) + "," + f(p1[1] + (p2[1] - p0[1]) / 6) + " " +
        f(p2[0] - (p3[0] - p1[0]) / 6) + "," + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + "," + f(p2[1]);
    }
    return d;
  }
  // Points along a Catmull–Rom spline (for lines of variable width)
  function smoothPoints(pts, steps) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < steps; k++) {
        const t = k / steps, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
          (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function fractal(a, b, depth, rough, rnd) {
    if (depth === 0) return [a, b];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const v = (rnd() - 0.5) * rough * len;
    const m = [(a[0] + b[0]) / 2 - dy / len * v, (a[1] + b[1]) / 2 + dx / len * v];
    return fractal(a, m, depth - 1, rough, rnd).concat(fractal(m, b, depth - 1, rough, rnd).slice(1));
  }
  // open polyline with an irregular course (e.g. coast)
  function coastline(points, seed, rough) {
    const rnd = random(seed);
    let out = [points[0]];
    for (let i = 0; i < points.length - 1; i++) out = out.concat(fractal(points[i], points[i + 1], 5, rough || 0.45, rnd).slice(1));
    return out;
  }
  // x coordinate of a (top-to-bottom) polyline at a given y
  function xAtY(pts, y) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]);
    }
    return null;
  }

  function filter(defs, B, H) {
    defs.insertAdjacentHTML("beforeend", `
      <filter id="tm-papier" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.30  0 0 0 0 0.14  0 0 0 1.1 -0.45"/>
      </filter>
      <filter id="tm-fasern" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.9 -0.35"/>
      </filter>
      <filter id="tm-hand" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="11" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="tm-aquarell" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="5" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="24" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation="5"/>
      </filter>
      <filter id="tm-nebel" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
      <radialGradient id="tm-vignette" cx="50%" cy="50%" r="72%">
        <stop offset="62%" stop-color="#5a3c1e" stop-opacity="0"/>
        <stop offset="100%" stop-color="#5a3c1e" stop-opacity="0.5"/>
      </radialGradient>
      <clipPath id="tm-rahmen"><rect x="34" y="34" width="${B - 68}" height="${H - 68}"/></clipPath>`);
  }

  // Mountain in the manner of old maps; light from the west, hatching on the east side
  function mountain(group, x, y, s, rnd, kind) {
    const lw = s * (0.72 + 0.2 * rnd()), rw = s * (0.78 + 0.22 * rnd()), h = s * (0.95 + 0.3 * rnd());
    const px = x + (rnd() - 0.5) * s * 0.25, py = y - h;
    const L1 = [x - lw * 0.5, y - h * 0.38], L2 = [px - s * 0.14, py + h * 0.12];
    const R1 = [px + s * 0.16, py + h * 0.16], R2 = [x + rw * 0.5, y - h * 0.42], R3 = [x + rw, y];
    const outline = `M${f(x - lw)},${f(y)}C${f(L1[0])},${f(L1[1])} ${f(L2[0])},${f(L2[1])} ${f(px)},${f(py)}` +
      `C${f(R1[0])},${f(R1[1])} ${f(R2[0])},${f(R2[1])} ${f(R3[0])},${f(R3[1])}`;
    const fog = kind === "unabhaengig";
    el("path", { d: outline + "Z", fill: PAPER, stroke: "none" }, group);
    const n = Math.max(3, Math.floor(s / 3.2)), writes = [];
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), u = 1 - t;
      const rx = u * u * u * px + 3 * u * u * t * R1[0] + 3 * u * t * t * R2[0] + t * t * t * R3[0];
      const ry = u * u * u * py + 3 * u * u * t * R1[1] + 3 * u * t * t * R2[1] + t * t * t * R3[1];
      writes.push(`M${f(rx - 0.6)},${f(ry + 0.8)}L${f(rx - s * (0.2 + 0.25 * u))},${f(Math.min(y - 1, ry + (y - ry) * 0.75))}`);
    }
    el("path", { d: writes.join(""), stroke: INK, "stroke-width": 0.7, opacity: fog ? 0.35 : 0.85 }, group);
    el("path", { d: `M${f(px - s * 0.05)},${f(py + h * 0.3)}l${f(-s * 0.12)},${f(h * 0.22)}`, stroke: INK,
      "stroke-width": 0.6, opacity: 0.7 }, group);
    el("path", { d: outline, class: "berg-umriss", fill: "none", stroke: INK, "stroke-width": 1.3 + s / 40,
      "stroke-linecap": "round", "stroke-dasharray": fog ? "4 3" : "none" }, group);
    el("path", { d: `M${f(x + rw * 0.2)},${f(y + 1.5)}h${f(rw * 0.9)}M${f(x + rw * 0.55)},${f(y + 4)}h${f(rw * 0.6)}`,
      stroke: INK, "stroke-width": 0.6, opacity: 0.55 }, group);
    return { px, py, h };
  }

  // Refuted conjecture: mountain with the geometry of mountain() (fixed proportions), whose top has broken off along an
  // oblique, jagged line falling to the east; rock fragments lie at the east foot (user's decision, 20 October 2026).
  // Returns the highest remaining point as px, py.
  function brokenMountain(group, x, y, s, seed) {
    const g2 = (z) => Math.round(z * 100) / 100, poly = (pts) => "M" + pts.map((p) => g2(p[0]) + "," + g2(p[1])).join("L");
    const bez = (a, b, c, d, t) => { const u = 1 - t;
      return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]); };
    const lw = s * 0.82, rw = s * 0.89, h = s * 1.1, px = x, py = y - h;
    const L0 = [x - lw, y], L1 = [x - lw * 0.5, y - h * 0.38], L2 = [px - s * 0.14, py + h * 0.12], P = [px, py];
    const R1 = [px + s * 0.16, py + h * 0.16], R2 = [x + rw * 0.5, y - h * 0.42], R3 = [x + rw, y];
    const left = [], right = [];
    for (let i = 0; i <= 60; i++) { left.push(bez(L0, L1, L2, P, i / 60)); right.push(bez(P, R1, R2, R3, i / 60)); }
    const yl = y - h * 0.64, yr = y - h * 0.44;   // heights of the break on the west and east flank
    const cross = (pts, yy) => { for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i];
      if ((a[1] - yy) * (b[1] - yy) <= 0) { const t = (yy - a[1]) / (b[1] - a[1] || 1); return { i, p: [a[0] + t * (b[0] - a[0]), yy] }; } } };
    const A = cross(left, yl), B = cross(right, yr);
    // Jagged break line from A to B: teeth alternating into and out of the mountain
    const rnd = random(seed || 3), k = Math.max(5, Math.round(s / 1.8)), amp = s * 0.075, jag = [A.p];
    const dx = B.p[0] - A.p[0], dy = B.p[1] - A.p[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    for (let j = 1; j < k; j++) { const t = (j + (rnd() - 0.5) * 0.6) / k, d = (j % 2 ? 1 : -0.5) * amp * (0.4 + 1.2 * rnd());
      jag.push([A.p[0] + t * dx + nx * d, A.p[1] + t * dy + ny * d]); }
    jag.push(B.p);
    el("path", { d: poly(left.slice(0, A.i).concat(jag, right.slice(B.i))) + "Z", fill: PAPER, stroke: "none" }, group);
    // Hatching on the east flank as in mountain(), only below the break, and short strokes on the fracture face
    const n = Math.max(3, Math.floor(s / 3.2)), hs = [];
    for (let i = 1; i <= n; i++) { const t = i / (n + 1), u = 1 - t, [rx, ry] = bez(P, R1, R2, R3, t);
      if (ry > yr + s * 0.08) hs.push(`M${g2(rx - 0.6)},${g2(ry + 0.8)}L${g2(rx - s * (0.2 + 0.25 * u))},${g2(Math.min(y - 1, ry + (y - ry) * 0.75))}`); }
    for (let j = 1; j < jag.length - 1; j += 2) hs.push(`M${g2(jag[j][0] - 0.3)},${g2(jag[j][1] + 0.6)}l${g2(-s * 0.05)},${g2(s * 0.12)}`);
    el("path", { d: hs.join(""), stroke: INK, "stroke-width": 0.7, opacity: 0.85 }, group);
    // Flanks with the stroke of mountain(); the break line thinner, so that it reads as a fracture, not as a crest
    const flank = { fill: "none", stroke: INK, "stroke-width": 1.3 + s / 40, "stroke-linecap": "round", "stroke-linejoin": "round" };
    el("path", Object.assign({ d: poly(left.slice(0, A.i).concat([A.p])) + poly([B.p].concat(right.slice(B.i))) }, flank), group);
    el("path", Object.assign({}, flank, { d: poly(jag), "stroke-width": 0.7 + s / 50, "stroke-linecap": "butt" }), group);
    el("path", { d: `M${g2(x + rw * 0.2)},${g2(y + 1.5)}h${g2(rw * 0.9)}M${g2(x + rw * 0.55)},${g2(y + 4)}h${g2(rw * 0.6)}`,
      stroke: INK, "stroke-width": 0.6, opacity: 0.55 }, group);
    // Rock fragments at the east foot
    const r2 = random((seed || 3) + 11);
    for (let i = 0; i < 4; i++) {
      const cx = x + rw * 0.92 + s * (0.1 + 0.55 * i / 3) + s * 0.05 * (r2() - 0.5);
      const r = s * (0.075 + 0.04 * r2()) + 0.5, cy = y + 0.2 + 1.6 * r2() - r * 0.3, pts = [];
      for (let j = 0; j < 5; j++) { const a = j / 5 * 2 * Math.PI + r2() * 0.6, rr = r * (0.7 + 0.5 * r2());
        pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr * 0.8]); }
      el("path", { d: poly(pts) + "Z", fill: PAPER, stroke: INK, "stroke-width": 0.55 + s / 80, "stroke-linejoin": "round" }, group);
    }
    return { px: A.p[0], py: Math.min(...jag.map((p) => p[1])), h: y - Math.min(...jag.map((p) => p[1])) };
  }

  function flag(group, px, py, s, glyph) {
    const tall = s * 0.9 + 8;
    el("line", { x1: px, y1: py, x2: px, y2: py - tall, stroke: INK, "stroke-width": 1.1 }, group);
    el("path", { d: `M${f(px)},${f(py - tall)}l13,3.5l-13,4Z`, fill: glyph ? "#8c7a3a" : RED, stroke: INK,
      "stroke-width": 0.6 }, group);
    if (glyph) text(glyph, { x: px + 4.5, y: py - tall + 6.4, "font-size": 7, fill: "#f4e8c8" }, group);
  }

  // Cloud cap over a peak: height unknown
  function cloud(group, x, y, width) {
    const n = 5, r = width / (n + 1), parts = [];
    let d = `M${f(x - width / 2)},${f(y)}`;
    for (let i = 0; i < n; i++) {
      const cx = x - width / 2 + r * (i + 1);
      const tall = r * (i === 2 ? 1.5 : i % 2 ? 1.2 : 0.95);
      d += `A${f(r * 0.85)},${f(tall)} 0 0 1 ${f(cx + r * 0.5)},${f(y)}`;
      parts.push(cx);
    }
    d += `L${f(x + width / 2)},${f(y + 3)}Q${f(x)},${f(y + 9)} ${f(x - width / 2)},${f(y + 3)}Z`;
    el("path", { d, fill: "#f7f1df", stroke: INK, "stroke-width": 0.9, opacity: 0.97 }, group);
  }

  function tent(group, x, y, number) {
    el("path", { d: `M${f(x - 6)},${f(y)}L${f(x)},${f(y - 9)}L${f(x + 6)},${f(y)}Z`, fill: PAPER, stroke: RED,
      "stroke-width": 1.2 }, group);
    el("line", { x1: x, y1: y - 9, x2: x, y2: y, stroke: RED, "stroke-width": 0.8 }, group);
    if (number != null) text(String(number), { x: x, y: y - 11, "font-size": 9, "text-anchor": "middle", fill: RED,
      "font-weight": "bold" }, group);
  }

  function place(group, x, y) {
    el("circle", { cx: x, cy: y, r: 4.2, fill: PAPER, stroke: INK, "stroke-width": 1.2 }, group);
    el("circle", { cx: x, cy: y, r: 1.6, fill: RED }, group);
    el("path", { d: `M${x - 2.2},${y - 4}v-6h4.4v6M${x - 3},${y - 10}l3,-4l3,4Z`, fill: PAPER, stroke: INK,
      "stroke-width": 0.8 }, group);
  }

  // Lay paper texture, vignette and frame over everything
  function paperAndFrame(svg, B, H) {
    el("rect", { width: B, height: H, filter: "url(#tm-papier)", opacity: 0.5, "pointer-events": "none",
      style: "mix-blend-mode:multiply" }, svg);
    el("rect", { width: B, height: H, filter: "url(#tm-fasern)", opacity: 0.25, "pointer-events": "none",
      style: "mix-blend-mode:multiply" }, svg);
    el("rect", { width: B, height: H, fill: "url(#tm-vignette)", "pointer-events": "none" }, svg);
    const r = el("g", { fill: "none", stroke: INK, "pointer-events": "none" }, svg);
    el("rect", { x: 20, y: 20, width: B - 40, height: H - 40, "stroke-width": 2.2 }, r);
    el("rect", { x: 34, y: 34, width: B - 68, height: H - 68, "stroke-width": 1 }, r);
    for (let x = 34, i = 0; x < B - 34; x += 52, i++) {
      const w = Math.min(52, B - 34 - x);
      el("rect", { x, y: 22, width: w, height: 10, fill: i % 2 ? INK : "none", "stroke-width": 0.5 }, r);
      el("rect", { x, y: H - 32, width: w, height: 10, fill: i % 2 ? "none" : INK, "stroke-width": 0.5 }, r);
    }
    for (let y = 34, i = 0; y < H - 34; y += 52, i++) {
      const hh = Math.min(52, H - 34 - y);
      el("rect", { x: 22, y, width: 10, height: hh, fill: i % 2 ? INK : "none", "stroke-width": 0.5 }, r);
      el("rect", { x: B - 32, y, width: 10, height: hh, fill: i % 2 ? "none" : INK, "stroke-width": 0.5 }, r);
    }
  }

  // Info box: shows title, text and status when an element is pointed at or tapped
  function infoBox(div) {
    function show(title, paragraph, state) {
      div.innerHTML = "";
      const h = document.createElement("h2"); h.textContent = title; div.appendChild(h);
      if (paragraph) { const p = document.createElement("div"); p.textContent = paragraph; div.appendChild(p); }
      if (state) { const s = document.createElement("div"); s.className = "stand"; s.textContent = state; div.appendChild(s); }
      div.style.display = "block";
    }
    return function connect(group, title, paragraph, state) {
      group.style.cursor = "help";
      group.addEventListener("mouseenter", () => show(title, paragraph, state));
      group.addEventListener("click", () => show(title, paragraph, state));
      group.addEventListener("mouseleave", () => (div.style.display = "none"));
      el("title", {}, group).textContent = title;
    };
  }

  return { NS, INK, PAPER, RED, random, hash, el, text, f, line, smooth, smoothPoints, fractal, coastline, xAtY, filter,
    mountain, brokenMountain, flag, cloud, tent, place, paperAndFrame, infoBox };
})();
