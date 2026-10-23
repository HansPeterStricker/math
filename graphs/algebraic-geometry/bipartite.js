(function () {
  "use strict";
  const D = window.AG, BG = window.AG_CONCEPTS, { el, tex, COLOR, DARK } = GL;
  // Language: U translates interface texts, FM inserts numbers and names into a translated pattern with {0}, {1}
  // …
  const I18 = window.I18N, U = (s) => (I18 ? I18.t(s) : s);
  const FM = (pattern, ...a) => U(pattern).replace(/\{(\d)\}/g, (m, i) => a[i]);
  const CONCEPT = {}; BG.concepts.forEach((b) => (CONCEPT[b.id] = Object.assign(b, { theorems: [] })));
  // Conjectures (type "vermutung") do not belong in this view
  const THEOREM = {}; D.nodes.filter((k) => k.type !== "vermutung").forEach((k) => (THEOREM[k.id] = k));
  const theorems = D.nodes.filter((k) => k.type === "satz").map((k) => Object.assign(k, { concepts: BG.theoremConcepts[k.id] || [] }));
  theorems.forEach((s) => s.concepts.forEach((b) => CONCEPT[b].theorems.push(s.id)));
  const links = BG.concepts.filter((b) => b.theorems.length), without = BG.concepts.filter((b) => !b.theorems.length);
  const edges = theorems.flatMap((s) => s.concepts.map((b) => ({ b, s: s.id })));
  const areaName = (k) => BG.areas[k] || D.areas[k];

  // ------------------------------------------------------------ Order: alternating barycenter sorting
  const areaOrder = Object.keys(BG.areas);
  const depth = {};
  const t = (id) => (id in depth ? depth[id] : (depth[id] = CONCEPT[id].uses.length ? 1 + Math.max(...CONCEPT[id].uses.map(t)) : 0));
  let L = links.map((b) => b.id).sort((a, b) => areaOrder.indexOf(CONCEPT[a].area) - areaOrder.indexOf(CONCEPT[b].area) || t(a) - t(b));
  let R = theorems.map((s) => s.id);
  const pos = (list) => { const p = {}; list.forEach((id, i) => (p[id] = i)); return p; };
  const crossings = (L, R) => {
    const pl = pos(L), pr = pos(R), e = edges.map((k) => [pl[k.b], pr[k.s]]);
    let n = 0;
    for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++)
      if ((e[i][0] - e[j][0]) * (e[i][1] - e[j][1]) < 0) n++;
    return n;
  };
  const initial = crossings(L, R);
  const partnerL = {}, partnerR = {};
  edges.forEach((k) => { (partnerL[k.b] = partnerL[k.b] || []).push(k.s); (partnerR[k.s] = partnerR[k.s] || []).push(k.b); });
  // Bring positions to a common scale [0, 1], because the two sides have different numbers of entries
  const sortIt = (list, partner, others) => {
    const pa = pos(others), n = others.length - 1 || 1, m = list.length - 1 || 1, alt = pos(list);
    const s = {}; list.forEach((id) => { const p = partner[id]; s[id] = p.reduce((a, x) => a + pa[x] / n, 0) / p.length; });
    return list.slice().sort((a, b) => s[a] - s[b] || alt[a] - alt[b]);
  };
  let best = { L, R, n: initial };
  for (let round = 0; round < 40; round++) {
    if (round % 2 === 0) R = sortIt(R, partnerR, L); else L = sortIt(L, partnerL, R);
    const n = crossings(L, R);
    if (n < best.n) best = { L: L.slice(), R: R.slice(), n };
  }
  ({ L, R } = best);

  // ------------------------------------------------------------ Drawing
  const MARGIN = 30, HEAD = 34, BWL = 230, BWR = 300, BH = 20, ZL = 25, GAP_X = 620;
  const H = MARGIN * 2 + HEAD + L.length * ZL, ZR = (L.length * ZL) / R.length;
  const xL = MARGIN, xR = MARGIN + BWL + GAP_X, B = xR + BWR + MARGIN;
  const svg = document.getElementById("graph");
  if (I18 && I18.en) svg.setAttribute("aria-label", U("Bipartiter Graph aus Begriffen und Sätzen"));
  svg.setAttribute("viewBox", `0 0 ${B} ${H}`); svg.setAttribute("width", B); svg.setAttribute("height", H);
  const yL = {}, yR = {};
  L.forEach((id, i) => (yL[id] = MARGIN + HEAD + i * ZL + (ZL - BH) / 2));
  R.forEach((id, i) => (yR[id] = MARGIN + HEAD + i * ZR + (ZR - BH) / 2));
  [[xL + BWL / 2, FM("Begriffe ({0})", L.length)], [xR + BWR / 2, FM("Sätze ({0})", R.length)]].forEach(([x, s]) => {
    el("text", { x, y: MARGIN + 8, "text-anchor": "middle", "font-size": 14, "font-weight": 600, fill: "#6d655a" }, svg).textContent = s;
  });
  const edgesG = el("g", {}, svg), nodesG = el("g", {}, svg);
  const edgeList = edges.map((k) => {
    const x1 = xL + BWL, y1 = yL[k.b] + BH / 2, x2 = xR, y2 = yR[k.s] + BH / 2;
    const e = el("path", { d: `M${x1},${y1}` + GL.arc(x1, y1, x2, y2), class: "bkante", stroke: DARK[CONCEPT[k.b].area] }, edgesG);
    el("title", {}, e).textContent = FM("{0} kommt vor in: {1}", CONCEPT[k.b].name, THEOREM[k.s].name);
    return Object.assign({ e }, k);
  });
  const g = {};
  const box = (id, x, y, w, name, color, side) => {
    const gr = el("g", { class: "knoten", tabindex: 0 }, nodesG);
    el("rect", { x, y, width: w, height: BH, rx: 3, fill: color }, gr);
    const tx = el("text", { x: side === "L" ? x + w - 6 : x + 6, y: y + 14, "font-size": 12, "text-anchor": side === "L" ? "end" : "start" }, gr);
    tx.textContent = name.length > (side === "L" ? 34 : 46) ? name.slice(0, side === "L" ? 33 : 45) + "…" : name;
    el("title", {}, gr).textContent = name;
    gr.addEventListener("click", () => show(side, id));
    gr.addEventListener("keydown", (e) => { if (e.key === "Enter") show(side, id); });
    gr.addEventListener("mouseenter", () => { if (!selected) mark(side, id); });
    gr.addEventListener("mouseleave", () => { if (!selected) unmark(); });
    g[side + ":" + id] = gr;
  };
  L.forEach((id) => box(id, xL, yL[id], BWL, CONCEPT[id].name + " (" + CONCEPT[id].theorems.length + ")", COLOR[CONCEPT[id].area], "L"));
  R.forEach((id) => box(id, xR, yR[id], BWR, THEOREM[id].name, COLOR[THEOREM[id].area], "R"));
  // Hover box of the theorems with the same three lines as the map (todo B26) instead of the browser tooltip
  R.forEach((id) => { const gr = g["R:" + id], t = gr.querySelector("title"); if (t) t.remove(); GL.hover(gr, THEOREM[id], D.history); });

  // ------------------------------------------------------------ Legend
  const areasL = Object.keys(BG.areas).filter((k) => links.some((b) => b.area === k));
  document.getElementById("legende").innerHTML = areasL.map((k) => `<span><i style="background:${COLOR[k]}"></i>${BG.areas[k]}</span>`).join("") +
    `<span class="trenner"></span><span class="klein">${U("Begriffe sind nach ihrem Bereich gefärbt, Sätze nach dem Bereich in daten.js; die Linien haben die Farbe des Begriffs. Die Zahl hinter einem Begriff ist die Zahl der Sätze, in denen er vorkommt.")}</span>`;

  // ------------------------------------------------------------ Analysis
  // Framework concepts: concepts that occur in at least 15 % of the theorems. They mostly appear in the hypotheses
  // ("smooth projective over a field") and would otherwise make every theorem look like a connection of many areas.
  const THRESHOLD = Math.ceil(0.15 * theorems.length);
  const frame = new Set(links.filter((b) => b.theorems.length >= THRESHOLD).map((b) => b.id));
  const areasOf = (s, withoutFrame) => [...new Set(s.concepts.filter((b) => !withoutFrame || !frame.has(b)).map((b) => CONCEPT[b].area))];
  const bridges = theorems.map((s) => ({ s, all: areasOf(s, false), core: areasOf(s, true) }))
    .sort((a, b) => b.core.length - a.core.length || b.all.length - a.all.length).slice(0, 12);
  const frequent = links.slice().sort((a, b) => b.theorems.length - a.theorems.length).slice(0, 12);
  const point = (k) => `<span class="punktfarbe" title="${areaName(k)}" style="background:${COLOR[k]}"></span>`;
  const chipC = (id) => `<span class="chip" data-seite="L" data-id="${id}">${CONCEPT[id].name}</span>`;
  const chipT = (id) => `<span class="chip" data-seite="R" data-id="${id}">${THEOREM[id].name}</span>`;
  const panel = document.getElementById("panel");
  panel.addEventListener("click", (e) => { const c = e.target.closest("span.chip"); if (c && c.dataset.id) show(c.dataset.seite, c.dataset.id); });

  function overview() {
    panel.innerHTML = `<h2>${U("Auswertung")}</h2>
      <p class="klein">${FM("{0} Begriffe mit {1} Vorkommen in {2} Sätzen (im Mittel {3} Begriffe je Aussage).", links.length, edges.length, theorems.length, (edges.length / theorems.length).toFixed(1))}
        ${FM("Kreuzungen: {0} nach der Sortierung, {1} bei Sortierung nach Bereichen.", best.n, initial)}</p>
      <h3>${U("Häufigste Begriffe")}</h3>
      <table class="auswertung"><tr><th>${U("Begriff")}</th><th class="zahl">${U("Sätze")}</th></tr>
        ${frequent.map((b) => `<tr><td>${point(b.area)} ${chipC(b.id)}</td><td class="zahl">${b.theorems.length}</td></tr>`).join("")}</table>
      <h3>${U("Aussagen, die viele Bereiche verbinden")}</h3>
      <p class="klein">${FM("Kandidaten für Brückensätze: Sätze, deren Aussage Begriffe aus vielen verschiedenen Bereichen enthält. Die erste Zahl zählt alle Begriffe der Aussage. Die zweite lässt die {0} Rahmenbegriffe weg, die in mindestens {1} Sätzen vorkommen ({2}); sie stehen meist in den Voraussetzungen und machen einen Satz noch nicht zur Brücke. Sortiert nach der zweiten Zahl.", frame.size, THRESHOLD, [...frame].map((b) => CONCEPT[b].name).join(", "))}</p>
      <table class="auswertung"><tr><th>${U("Satz")}</th><th class="zahl">${U("alle")}</th><th class="zahl">${U("ohne Rahmen")}</th></tr>
        ${bridges.map((r) => `<tr><td>${chipT(r.s.id)}<br>${r.core.map(point).join("")}</td><td class="zahl">${r.all.length}</td><td class="zahl">${r.core.length}</td></tr>`).join("")}</table>
      <p class="klein">${U("Das Maß ist grob. Es zählt nur Bereiche, nicht ihren Abstand, und es hängt davon ab, wie die Begriffe auf Bereiche verteilt sind. Ein Satz wie GAGA verbindet zwei Kategorien, die verschieden definiert sind; ob ein Satz eine Brücke im Sinn von maps/Konzept/05 und 09 ist, muss man inhaltlich prüfen.")}</p>
      <h3>${U("Begriffe in keiner Aussage")}</h3>
      <p class="klein">${FM("{0} Begriffe werden nur in Definitionen gebraucht und fehlen deshalb im Graphen:", without.length)}</p>
      ${without.map((b) => `<a class="chip" href="begriffe.html#${b.id}">${b.name}</a>`).join("")}`;
  }

  let selected = null;
  function partnerOf(side, id) { return new Set(side === "L" ? CONCEPT[id].theorems : THEOREM[id].concepts); }
  function mark(side, id) {
    const p = partnerOf(side, id), others = side === "L" ? "R" : "L";
    Object.entries(g).forEach(([k, gr]) => {
      const [s, i] = [k[0], k.slice(2)];
      gr.classList.toggle("aktiv", s === side && i === id);
      gr.classList.toggle("blass", !((s === side && i === id) || (s === others && p.has(i))));
    });
    edgeList.forEach((ka) => {
      const an = side === "L" ? ka.b === id : ka.s === id;
      ka.e.classList.toggle("an", an); ka.e.classList.toggle("blass", !an);
    });
  }
  function unmark() {
    Object.values(g).forEach((gr) => gr.classList.remove("aktiv", "blass"));
    edgeList.forEach((ka) => ka.e.classList.remove("an", "blass"));
  }
  function show(side, id) {
    if (!g[side + ":" + id]) return;
    selected = side + ":" + id;
    mark(side, id);
    if (side === "L") {
      const b = CONCEPT[id];
      panel.innerHTML = `<h2>${b.name}</h2>
        <div class="klein">${BG.kinds[b.kind]} · ${BG.areas[b.area]}</div>
        <div class="formel">${tex(b.formula)}</div><p>${b.text}</p>
        ${VF.info("b:" + id)}
        <h3>${FM(b.theorems.length === 1 ? "Kommt vor in {0} Satz" : "Kommt vor in {0} Sätzen", b.theorems.length)}</h3>${b.theorems.map(chipT).join("")}
        <p><a class="chip" href="begriffe.html#${id}">${U("Im Begriffsgraphen")}</a> <span class="chip" id="zurueck">${U("Zur Auswertung")}</span></p>`;
    } else {
      const s = THEOREM[id], to = {};
      s.concepts.forEach((b) => (to[CONCEPT[b].area] = to[CONCEPT[b].area] || []).push(b));
      panel.innerHTML = `<h2>${s.name}</h2>
        <div class="klein">${D.areas[s.area]}${GL.yearText(s, D.history) ? " · " + GL.yearText(s, D.history) : ""}</div>
        ${GL.statementHtml(s)}<p>${s.text}</p>
        ${VF.info("s:" + id)}
        <h3>${U("Begriffe der Aussage nach Bereich")}</h3>
        ${Object.entries(to).map(([k, l]) => `<p class="klein">${point(k)} ${BG.areas[k]}</p>${l.map(chipC).join("")}`).join("")}
        <p><a class="chip" href="index.html#${id}">${U("Im Satzgraphen")}</a> <span class="chip" id="zurueck">${U("Zur Auswertung")}</span></p>`;
    }
    document.getElementById("zurueck").addEventListener("click", (e) => { e.stopPropagation(); selected = null; unmark(); overview(); });
  }

  overview();
  const anchor = decodeURIComponent(location.hash.slice(1));
  if (CONCEPT[anchor]) show("L", anchor); else if (THEOREM[anchor]) show("R", anchor);
  // Filter by comprehensibility (verstaendlichkeit-filter.js): concepts on the left, theorems on
  // the right
  const vfKey = (k) => (k[0] === "L" ? "b:" : "s:") + k.slice(2);
  VF.an({ name: "AG", svg, nodes: () => Object.entries(g).map(([k, gr]) => [vfKey(k), gr]), edges: () => edgeList.map((ka) => [ka.e, "b:" + ka.b, "s:" + ka.s]) });
})();
