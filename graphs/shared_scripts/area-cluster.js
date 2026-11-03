// Pairs and triples of strongly connected areas (graphs/clusters.html; user, 3 November 2026). Each area of the cluster
// is a circle; the circles touch each other. Inside a circle stand the nodes of that area that are joined with a node of
// one of the other areas of the cluster, near the point where the circles touch; a node joined with both other areas
// stands near the middle of the three circles. Lines between the circles are the single edges of the graph of the
// areas (definitional, in statements, proofs); a node that also carries an MSC class of another area of the cluster
// has a second ring in its colour. Bridges are theorems whose statement uses concepts of at least two areas of the
// cluster; they stand for correspondences, for which the data have no field yet.
//
// Counting with AREA_GRAPH_BUILD from shared_scripts/area-graph.js (loaded before this file). Address:
// #areas=ent,ant,ar (two or three prefixes) and optionally &sel=<prefix>:<id> (t: or c: before it for the type).
(function () {
  "use strict";
  const svg = document.getElementById("cluster");
  if (!svg || !window.AREA_GRAPH_BUILD) return;
  const G = window.AREA_GRAPH_BUILD(window);
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻", "−": "⁻", n: "ⁿ", i: "ⁱ", k: "ᵏ", p: "ᵖ", r: "ʳ", "*": "*" };
  const SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", "+": "₊", "-": "₋", n: "ₙ", k: "ₖ", p: "ₚ", i: "ᵢ", m: "ₘ" };
  const conv = (t, map, mark) => ([...t].every((ch) => map[ch]) ? [...t].map((ch) => map[ch]).join("") : mark + t);
  const plain = (n) => n.replace(/<sup>(.*?)<\/sup>/g, (m, t) => conv(t, SUP, "^")).replace(/<sub>(.*?)<\/sub>/g, (m, t) => conv(t, SUB, "_")).replace(/<[^>]+>/g, "");
  const KINDS = G.KINDS.filter((k) => k.key !== "msc");
  const KIND = new Map(G.KINDS.map((k) => [k.key, k]));
  const CONCEPTS = new Map(G.items.filter((it) => it.type === "c").map((it) => [it.f.prefix + ":" + it.id, it]));
  const AREAS = new Map([...G.units.areas.values()].filter((u) => !u.gray).map((u) => [u.key, u]));

  // ------------------------------------------------------------ strength of pairs and triples
  const pairKey = (a, b) => (a < b ? a + "|" + b : b + "|" + a);
  const pairN = new Map();
  G.edges.areas.forEach((e) => {
    if (e.from.gray || e.to.gray) return;
    const k = pairKey(e.from.key, e.to.key);
    pairN.set(k, (pairN.get(k) || 0) + e.singles.length);
  });
  const strength = (a, b) => pairN.get(pairKey(a, b)) || 0;
  const pairs = [...pairN.entries()].map(([k, n]) => ({ areas: k.split("|"), n })).sort((x, y) => y.n - x.n);
  const keys = [...AREAS.keys()], triples = [];
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) for (let k = j + 1; k < keys.length; k++) {
    const t = [keys[i], keys[j], keys[k]], s = [strength(t[0], t[1]), strength(t[0], t[2]), strength(t[1], t[2])];
    const min = Math.min(...s);
    if (min > 0) triples.push({ areas: t, n: s, min, sum: s[0] + s[1] + s[2] });
  }
  triples.sort((x, y) => y.min - x.min || y.sum - x.sum);

  // ------------------------------------------------------------ state
  const state = { areas: ["ent", "ant", "ar"], kinds: new Set(KINDS.map((k) => k.key)), inner: false, names: true, sel: null };
  const itemKey = (it) => it.type + ":" + it.f.prefix + ":" + it.id;
  let C = null; // the current cluster: { areas, circles, nodes, edges, bridges }

  // the cluster: nodes of the areas with a single edge to another area of the cluster
  function build() {
    const set = new Set(state.areas);
    const areaOf = (it) => it.au.key;
    const nodes = new Map(), edges = [];
    const node = (it) => {
      let n = nodes.get(it);
      if (!n) nodes.set(it, (n = { it, key: itemKey(it), area: areaOf(it), links: new Map(), msc: new Set(), bridge: null, x: 0, y: 0 }));
      return n;
    };
    G.singles.forEach((s) => {
      if (s.kind === "msc") {
        const h = G.home(s.code), to = s.to;
        if (h && set.has(h.prefix) && set.has(areaOf(to)) && h.prefix !== areaOf(to)) node(to).msc.add(h.prefix);
        return;
      }
      const a = areaOf(s.from), b = areaOf(s.to);
      if (!set.has(a) || !set.has(b)) return;
      if (a === b) { edges.push({ s, inner: true }); return; }
      const x = node(s.from), y = node(s.to);
      x.links.set(b, (x.links.get(b) || 0) + 1);
      y.links.set(a, (y.links.get(a) || 0) + 1);
      edges.push({ s, inner: false, x, y });
    });
    // nodes with only a shared classification get a link to that area for their place
    nodes.forEach((n) => n.msc.forEach((p) => { if (!n.links.has(p)) n.links.set(p, 0.5); }));
    // bridges: theorems whose statement uses concepts of at least two areas of the cluster
    const bridges = [];
    G.items.forEach((it) => {
      if (it.type !== "t" || !set.has(areaOf(it))) return;
      const used = new Map();
      (it.d.concepts || []).forEach((r) => {
        const x = CONCEPTS.get(r.includes(":") ? r : it.f.prefix + ":" + r);
        if (x && set.has(areaOf(x))) used.set(areaOf(x), (used.get(areaOf(x)) || []).concat([x]));
      });
      const others = [...used.keys()].filter((a) => a !== areaOf(it));
      if (others.length && used.size >= 2) {
        const n = node(it);
        n.bridge = [...used.keys()];
        bridges.push(n);
      }
    });
    // inner edges only between nodes shown
    const inner = edges.filter((e) => e.inner && nodes.has(e.s.from) && nodes.has(e.s.to)).map((e) => ({ ...e, x: nodes.get(e.s.from), y: nodes.get(e.s.to) }));
    return { areas: state.areas.slice(), nodes, edges: edges.filter((e) => !e.inner).concat(inner), bridges };
  }

  // ------------------------------------------------------------ geometry
  let R = 330; // radius of the circles; grows with the number of nodes of the fullest circle (place)
  function circles(list) {
    if (list.length === 2) return [{ x: -R, y: 0 }, { x: R, y: 0 }];
    // equilateral triangle of side 2R, centred on its centroid; the first area at the top
    const h = Math.sqrt(3) * R;
    return [{ x: 0, y: -(2 / 3) * h }, { x: -R, y: h / 3 }, { x: R, y: h / 3 }];
  }
  const size = (n) => 4 + 2.2 * Math.sqrt([...n.links.values()].reduce((s, v) => s + v, 0));
  // Places inside each circle: a grid of horizontal rows (so that the names never overlap), every second row shifted by
  // half a place. Each node aims at a point on the rim: the point where its circle touches the circle of its partner
  // area, or, joined with both other areas, the rim towards the middle of the three circles. The nodes take the free
  // place nearest their point in the order of their number of links, so the strongest stand nearest the other circles.
  const BOX = { w: 122, h: 27 }; // room of a node with its short name
  function place() {
    // the grid fills about 60 % of a circle; the fullest circle sets the radius of all
    const most = Math.max(...C.areas.map((a) => [...C.nodes.values()].filter((n) => n.area === a).length));
    R = Math.max(330, Math.ceil(Math.sqrt((most * BOX.w * BOX.h) / (Math.PI * 0.6))) + 16);
    C.R = R;
    const cs = circles(C.areas), at = new Map(C.areas.map((a, i) => [a, cs[i]]));
    const centroid = cs.reduce((p, c) => ({ x: p.x + c.x / cs.length, y: p.y + c.y / cs.length }), { x: 0, y: 0 });
    C.circles = C.areas.map((a, i) => ({ area: AREAS.get(a), ...cs[i] }));
    const total = (n) => [...n.links.values()].reduce((s, v) => s + v, 0);
    C.areas.forEach((area) => {
      const c = at.get(area);
      const slots = [];
      const inner = R - 16;
      for (let k = -Math.floor(inner / BOX.h); k <= Math.floor(inner / BOX.h); k++) {
        const y = k * BOX.h + 6, shift = (k & 1) * BOX.w / 2;
        for (let j = -6; j <= 6; j++) {
          const x = j * BOX.w + shift;
          // the name (about BOX.w wide) and the point must stay inside the circle
          if (Math.hypot(Math.abs(x) + BOX.w * 0.42, y) <= inner && Math.hypot(x, y - 12) <= inner) slots.push({ x: c.x + x, y: c.y + y, free: true });
        }
      }
      const list = [...C.nodes.values()].filter((n) => n.area === area);
      list.forEach((n) => {
        n.r = size(n);
        n.c = c;
        let q;
        const partners = [...n.links.keys()];
        if (partners.length > 1 && cs.length === 3) q = centroid;
        else { const o = at.get(partners.sort((x, y) => n.links.get(y) - n.links.get(x))[0]); q = { x: (c.x + o.x) / 2, y: (c.y + o.y) / 2 }; }
        const dx = q.x - c.x, dy = q.y - c.y, l = Math.hypot(dx, dy) || 1;
        n.tx = c.x + (dx / l) * R; n.ty = c.y + (dy / l) * R;
      });
      list.sort((a, b) => total(b) - total(a) || (a.it.d.name < b.it.d.name ? -1 : 1));
      list.forEach((n) => {
        let best = null, bd = Infinity;
        slots.forEach((s) => { if (!s.free) return; const d = Math.hypot(s.x - n.tx, s.y - n.ty); if (d < bd) { bd = d; best = s; } });
        if (!best) { n.x = c.x; n.y = c.y; return; }
        best.free = false;
        n.x = best.x; n.y = best.y;
      });
    });
  }

  // ------------------------------------------------------------ drawing
  const tip = document.createElement("div");
  tip.className = "knoten-tip mehrzeilig";
  tip.hidden = true;
  document.body.appendChild(tip);
  const moveTip = (ev) => { tip.style.left = ev.clientX + 14 + "px"; tip.style.top = ev.clientY + 14 + "px"; };
  const TYPE = (it) => (it.type === "c" ? "concept" : it.d.kind || "theorem");
  const shape = (n, g) => {
    const r = n.r, x = n.x, y = n.y, it = n.it;
    if (it.type === "c") return el("rect", { class: "form", x: x - r * 0.85, y: y - r * 0.85, width: 1.7 * r, height: 1.7 * r, rx: r * 0.35 }, g);
    if (it.d.kind === "conjecture") return el("polygon", { class: "form", points: `${x},${y - r * 1.2} ${x + r * 1.2},${y} ${x},${y + r * 1.2} ${x - r * 1.2},${y}` }, g);
    return el("circle", { class: "form", cx: x, cy: y, r }, g);
  };
  let view = null;
  const fit = () => {
    const cs = C.circles, pad = 60;
    const x0 = Math.min(...cs.map((c) => c.x)) - R - pad, x1 = Math.max(...cs.map((c) => c.x)) + R + pad;
    const y0 = Math.min(...cs.map((c) => c.y)) - R - pad - 30, y1 = Math.max(...cs.map((c) => c.y)) + R + pad;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };
  const applyView = () => svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  function edgePath(e) {
    const a = e.x, b = e.y;
    // a slight bend, always to the same side seen from the source, so that the two directions part
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const bend = e.inner ? 0.25 : 0.12;
    return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${(mx - dy * bend).toFixed(1)},${(my + dx * bend).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }
  function draw() {
    svg.innerHTML = "";
    svg.classList.toggle("ohne-namen", !state.names);
    const defs = el("defs", {}, svg);
    KINDS.forEach((k) => {
      const m = el("marker", { id: "pfeil-" + k.key, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0,1 L9,5 L0,9 z", fill: k.color }, m);
    });
    const gc = el("g", { class: "kreise" }, svg);
    C.circles.forEach((c) => {
      el("circle", { class: "kreis", cx: c.x, cy: c.y, r: R, fill: c.area.color, stroke: c.area.color }, gc);
      // name above the circle, for the two lower circles of a triple below it
      const below = C.circles.length === 3 && c.y > 0;
      const t = el("text", { class: "kreis-name", x: c.x, y: below ? c.y + R + 34 : c.y - R - 16, "text-anchor": "middle" }, gc);
      t.textContent = c.area.label;
    });
    // number of single edges where two circles touch
    for (let i = 0; i < C.circles.length; i++) for (let j = i + 1; j < C.circles.length; j++) {
      const a = C.circles[i], b = C.circles[j];
      const n = strength(a.area.key, b.area.key), g = el("g", { class: "beruehrung", "data-n": n }, gc);
      el("title", {}, g).textContent = `${n} single edges between ${a.area.label} and ${b.area.label} (all kinds, both directions)`;
      el("text", { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 5, "text-anchor": "middle" }, g).textContent = n;
    }
    const ge = el("g", { class: "kanten" }, svg);
    C.edges.forEach((e) => {
      if (!state.kinds.has(e.s.kind) || (e.inner && !state.inner)) return;
      const k = KIND.get(e.s.kind);
      e.el = el("path", { class: "kante" + (e.inner ? " innen" : "") + (e.s.alt ? " alt" : ""), d: edgePath(e), stroke: k.color, "marker-end": `url(#pfeil-${k.key})` }, ge);
    });
    const gn = el("g", { class: "knoten-alle" }, svg);
    [...C.nodes.values()].forEach((n) => {
      const g = el("g", { class: "knoten" + (n.bridge ? " bruecke" : ""), "data-key": n.key }, gn);
      n.el = g;
      // a second ring for each MSC class of another area of the cluster
      [...n.msc].forEach((p, i) => el("circle", { class: "ring", cx: n.x, cy: n.y, r: n.r + 3 + 2.5 * i, stroke: AREAS.get(p).color }, g));
      const s = shape(n, g);
      s.setAttribute("fill", n.it.type === "c" ? "#fff" : AREAS.get(n.area).color);
      s.setAttribute("stroke", AREAS.get(n.area).color);
      const t = el("text", { x: n.x, y: n.y - n.r - 3, "text-anchor": "middle" }, g);
      const nm = plain(n.it.d.name);
      t.textContent = nm.length > 22 ? nm.slice(0, 21).trimEnd() + "…" : nm;
      g.addEventListener("pointerenter", (ev) => { tip.textContent = tipText(n); tip.hidden = false; moveTip(ev); });
      g.addEventListener("pointermove", moveTip);
      g.addEventListener("pointerleave", () => { tip.hidden = true; });
      g.addEventListener("click", (ev) => { ev.stopPropagation(); select(n.key); });
    });
    if (!view) view = fit();
    applyView();
    mark();
  }
  const tipText = (n) => {
    const links = [...n.links.entries()].filter(([, v]) => v >= 1).map(([p, v]) => `${v} with ${AREAS.get(p).label}`);
    return `${plain(n.it.d.name)}\n${TYPE(n.it)} · ${n.it.f.name}` + (n.it.cls ? ` · ${n.it.cls}` : "") +
      (links.length ? "\n" + links.join(", ") : "") + (n.msc.size ? `\nalso classified in ${[...n.msc].map((p) => AREAS.get(p).label).join(", ")}` : "") +
      (n.bridge ? `\nbridge: its statement uses concepts of ${n.bridge.map((p) => AREAS.get(p).label).join(" and ")}` : "");
  };

  // ------------------------------------------------------------ selection
  function mark() {
    const sel = state.sel && C.nodes.get([...C.nodes.keys()].find((it) => itemKey(it) === state.sel));
    svg.classList.toggle("fokus", !!sel);
    C.nodes.forEach((n) => { n.el.classList.remove("hell", "gewaehlt"); });
    C.edges.forEach((e) => e.el && e.el.classList.remove("hell"));
    if (sel) {
      sel.el.classList.add("hell", "gewaehlt");
      C.edges.forEach((e) => {
        if (!e.el || (e.x !== sel && e.y !== sel)) return;
        e.el.classList.add("hell");
        e.x.el.classList.add("hell");
        e.y.el.classList.add("hell");
      });
    }
    panel.innerHTML = sel ? nodePanel(sel) : overview();
    writeHash();
  }
  function select(key) { state.sel = state.sel === key ? null : key; mark(); }
  function clear() { if (state.sel) { state.sel = null; mark(); } }

  // ------------------------------------------------------------ panel
  const panel = document.getElementById("panel");
  const link = (it) => `<a href="${it.f.folder}/${it.type === "c" ? "concepts" : "theorems"}.html#mark=${encodeURIComponent(it.id)}">${it.d.name}</a> <span class="meta">(${it.f.prefix})</span>`;
  const chip = (p) => `<span class="chip"><i style="background:${AREAS.get(p).color};border-color:${AREAS.get(p).color}"></i>${esc(AREAS.get(p).label)}</span>`;
  const verb = { def: "is used in the definition of", stmt: "occurs in the statement of", proof: "is a premise of" };
  function nodePanel(n) {
    const it = n.it;
    const out = C.edges.filter((e) => !e.inner && e.x === n), inc = C.edges.filter((e) => !e.inner && e.y === n);
    const li = (e, other) => `<li><i class="farbe" style="background:${KIND.get(e.s.kind).color}"></i>${link(other.it)}${e.s.alt ? ' <span class="meta">(alternative)</span>' : ""}</li>`;
    const group = (list, dir) => KINDS.map((k) => {
      const l = list.filter((e) => e.s.kind === k.key);
      if (!l.length) return "";
      const head = dir === "out" ? `${esc(plain(it.d.name))} ${verb[k.key]}` : { def: "Its definition uses", stmt: "Its statement uses", proof: "Its proof uses" }[k.key];
      return `<div class="richtung">${head}</div><ul class="einzel">${l.map((e) => li(e, dir === "out" ? e.y : e.x)).join("")}</ul>`;
    }).join("");
    return `<h2>${it.d.name}</h2><p class="meta">${TYPE(it)} · ${esc(it.f.name)}${it.cls ? " · " + it.cls : ""} · <a href="${it.f.folder}/${it.type === "c" ? "concepts" : "theorems"}.html#mark=${encodeURIComponent(it.id)}">open in its graph</a></p>` +
      (it.d.formula && window.katex ? `<div class="formel">${katex.renderToString(it.d.formula, { throwOnError: false, displayMode: true })}</div>` : "") +
      (it.d.text ? `<p>${it.d.text}</p>` : "") +
      (n.bridge ? `<p><b>Bridge:</b> its statement uses concepts of ${n.bridge.map(chip).join(" ")}</p>` : "") +
      (n.msc.size ? `<p>Also classified in ${[...n.msc].map(chip).join(" ")}</p>` : "") +
      (inc.length ? `<h3>From the other areas</h3>${group(inc, "in")}` : "") +
      (out.length ? `<h3>To the other areas</h3>${group(out, "out")}` : "");
  }
  function overview() {
    const A = C.areas.map((p) => AREAS.get(p));
    const count = (a, b, k) => C.edges.filter((e) => !e.inner && e.s.kind === k && e.x.area === a && e.y.area === b).length;
    const rows = [];
    for (const a of C.areas) for (const b of C.areas) if (a !== b) {
      const n = KINDS.map((k) => count(a, b, k.key));
      if (n.some(Boolean)) rows.push(`<tr><td>${esc(AREAS.get(a).label)} → ${esc(AREAS.get(b).label)}</td>${n.map((v) => `<td>${v || ""}</td>`).join("")}</tr>`);
    }
    const bridges = C.bridges.slice().sort((x, y) => y.bridge.length - x.bridge.length || (x.it.d.name < y.it.d.name ? -1 : 1));
    return `<h2>${A.map((a) => esc(a.label)).join(" · ")}</h2>` +
      `<p>${C.nodes.size} nodes of these areas are joined with a node of another of them.</p>` +
      `<table class="arten"><thead><tr><th></th>${KINDS.map((k) => `<th title="${esc(k.text)}"><i style="background:${k.color}"></i>${k.name}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>` +
      `<h3>Bridges (${bridges.length})</h3><p class="meta">Theorems whose statement uses concepts of two or three of these areas. They stand for correspondences between the areas, for which the data have no field yet.</p>` +
      `<ul class="einzel">${bridges.map((n) => `<li>${link(n.it)} <span class="meta">${n.bridge.map((p) => AREAS.get(p).code).join(" + ")}</span></li>`).join("")}</ul>`;
  }

  // ------------------------------------------------------------ sidebar: choice of the cluster, kinds, display
  const controls = document.getElementById("controls");
  const name = (p) => AREAS.get(p).label;
  const clusterLink = (list, n) => `<a href="#areas=${list.join(",")}" class="cluster${list.join(",") === state.areas.join(",") ? " hier" : ""}" title="${n}">${list.map(name).map(esc).join(" · ")}</a>`;
  const block = (title, items, open = true) => `<details class="block"${open ? " open" : ""}><summary class="block-titel">${title}</summary><div class="eintraege">${items.join("")}</div></details>`;
  function drawControls() {
    const opts = [...AREAS.values()].sort((a, b) => (a.label < b.label ? -1 : 1));
    const select3 = [0, 1, 2].map((i) => `<select data-i="${i}"><option value="">${i === 2 ? "(none)" : "–"}</option>${opts.map((a) => `<option value="${a.key}"${state.areas[i] === a.key ? " selected" : ""}>${esc(a.label)}</option>`).join("")}</select>`).join("");
    controls.innerHTML =
      block("Areas", [`<div class="wahl">${select3}</div>`]) +
      block("Strongest triples", triples.slice(0, 12).map((t) => clusterLink(t.areas, `weakest pair ${t.min}, pairs ${t.n.join(" / ")}`))) +
      block("Strongest pairs", pairs.slice(0, 12).map((p) => clusterLink(p.areas, `${p.n} single edges`)), false) +
      block("Kinds of edges", KINDS.map((k) => `<label class="toggle" title="${esc(k.text)}"><input type="checkbox" data-kind="${k.key}"${state.kinds.has(k.key) ? " checked" : ""}><span class="regler"></span><i class="farbe" style="background:${k.color}"></i>${k.name}</label>`)) +
      block("Display", [
        `<label class="toggle"><input type="checkbox" id="c-inner"${state.inner ? " checked" : ""}><span class="regler"></span>edges inside an area</label>`,
        `<label class="toggle"><input type="checkbox" id="c-names"${state.names ? " checked" : ""}><span class="regler"></span>names</label>`,
      ]);
  }
  controls.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.dataset.kind) { if (t.checked) state.kinds.add(t.dataset.kind); else state.kinds.delete(t.dataset.kind); draw(); }
    else if (t.id === "c-inner") { state.inner = t.checked; draw(); }
    else if (t.id === "c-names") { state.names = t.checked; draw(); }
    else if (t.dataset.i !== undefined) {
      const list = [...controls.querySelectorAll("select[data-i]")].map((s) => s.value).filter(Boolean);
      const uniq = [...new Set(list)];
      if (uniq.length >= 2) { location.hash = "areas=" + uniq.join(","); }
    }
  });

  // ------------------------------------------------------------ zoom and pan
  svg.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const f = ev.deltaY > 0 ? 1.15 : 1 / 1.15, rect = svg.getBoundingClientRect(), s = Math.max(view.w / rect.width, view.h / rect.height);
    const cx = view.x + view.w / 2 + (ev.clientX - rect.left - rect.width / 2) * s, cy = view.y + view.h / 2 + (ev.clientY - rect.top - rect.height / 2) * s;
    view = { x: cx - (cx - view.x) * f, y: cy - (cy - view.y) * f, w: view.w * f, h: view.h * f };
    applyView();
  }, { passive: false });
  let drag = null, moved = false;
  svg.addEventListener("pointerdown", (ev) => { if (ev.button === 0) { drag = { x: ev.clientX, y: ev.clientY, v: { ...view } }; moved = false; } });
  window.addEventListener("pointermove", (ev) => {
    if (!drag) return;
    const rect = svg.getBoundingClientRect(), s = Math.max(view.w / rect.width, view.h / rect.height);
    if (Math.abs(ev.clientX - drag.x) + Math.abs(ev.clientY - drag.y) > 4) moved = true;
    if (moved) { view = { ...drag.v, x: drag.v.x - (ev.clientX - drag.x) * s, y: drag.v.y - (ev.clientY - drag.y) * s }; applyView(); }
  });
  window.addEventListener("pointerup", () => { drag = null; setTimeout(() => { moved = false; }, 0); });
  svg.addEventListener("click", () => { if (!moved) clear(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") clear(); });

  // ------------------------------------------------------------ address
  function writeHash() {
    const h = "#areas=" + state.areas.join(",") + (state.sel ? "&sel=" + encodeURIComponent(state.sel) : "");
    if (location.hash !== h) history.replaceState(null, "", h);
  }
  function fromHash() {
    const q = new Map(location.hash.slice(1).split("&").filter(Boolean).map((p) => { const i = p.indexOf("="); return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))]; }));
    const list = (q.get("areas") || "").split(",").filter((p) => AREAS.has(p));
    const next = [...new Set(list)].slice(0, 3);
    if (next.length >= 2) state.areas = next;
    const changed = !C || C.areas.join(",") !== state.areas.join(",");
    if (changed) { C = build(); place(); view = null; }
    state.sel = q.get("sel") || null;
    drawControls();
    draw();
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());

  // for tests
  window.AREA_CLUSTER = { pairs, triples, strength, cluster: () => C, select, clear };
})();
