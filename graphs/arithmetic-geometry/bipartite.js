(function () {
  "use strict";
  // Without AI results (they appear only in the theorem graph with the switch „KI-Beweise“)
  const D = GL.aiFilter(window.AR, false), BG = window.AR_CONCEPTS, { el, tex } = GL, { COLOR, DARK, STATE_SHORT, STATE_COLOR } = ARS;
  // Language: U translates interface texts, FM inserts numbers and names into a translated pattern with {0}, {1}
  // …
  const I18 = window.I18N, U = (s) => (I18 ? I18.t(s) : s);
  const FM = (pattern, ...a) => U(pattern).replace(/\{(\d)\}/g, (m, i) => a[i]);
  // State from the address as in index.html: #vermutungen=0 hides the conjectures, k=<id> selects an entry.
  const read = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h.includes("=")) return { withC: true, k: h };
    const q = new URLSearchParams(h);
    return { withC: q.get("vermutungen") !== "0", k: q.get("k") || "" };
  };
  const uiState = read(), withC = uiState.withC;
  const address = (v, k) => "#" + (v ? (k || "") : "vermutungen=0" + (k ? "&k=" + k : ""));
  if (!withC) document.querySelectorAll("nav.ansichten a:not(.fremd)").forEach((a) => (a.href = a.getAttribute("href").split("#")[0] + "#vermutungen=0"));
  const CONCEPT = {}; BG.concepts.forEach((b) => (CONCEPT[b.id] = Object.assign(b, { theorems: [] })));
  const THEOREM = {}; D.nodes.forEach((k) => (THEOREM[k.id] = k));
  const theorems = D.nodes.filter((k) => k.type === "satz" || (withC && k.type === "vermutung")).map((k) => Object.assign(k, { concepts: BG.theoremConcepts[k.id] || [] }));
  theorems.forEach((s) => s.concepts.forEach((b) => CONCEPT[b].theorems.push(s.id)));
  const links = BG.concepts.filter((b) => b.theorems.length), without = BG.concepts.filter((b) => !b.theorems.length);
  const right = theorems.filter((s) => s.concepts.length), withoutB = theorems.filter((s) => !s.concepts.length);
  const edges = right.flatMap((s) => s.concepts.map((b) => ({ b, s: s.id })));

  // ------------------------------------------------------------ Order: alternating barycenter sorting
  const areaOrder = Object.keys(BG.areas);
  const depth = {};
  const t = (id) => (id in depth ? depth[id] : (depth[id] = CONCEPT[id].uses.length ? 1 + Math.max(...CONCEPT[id].uses.map(t)) : 0));
  let L = links.map((b) => b.id).sort((a, b) => areaOrder.indexOf(CONCEPT[a].area) - areaOrder.indexOf(CONCEPT[b].area) || t(a) - t(b));
  let R = right.map((s) => s.id);
  const pos = (list) => { const p = {}; list.forEach((id, i) => (p[id] = i)); return p; };
  const crossings = (L, R) => {
    const pl = pos(L), pr = pos(R), e = edges.map((k) => [pl[k.b], pr[k.s]]);
    let n = 0;
    for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++) if ((e[i][0] - e[j][0]) * (e[i][1] - e[j][1]) < 0) n++;
    return n;
  };
  const initial = crossings(L, R);
  const partnerL = {}, partnerR = {};
  edges.forEach((k) => { (partnerL[k.b] = partnerL[k.b] || []).push(k.s); (partnerR[k.s] = partnerR[k.s] || []).push(k.b); });
  const sortIt = (list, partner, others) => {
    const pa = pos(others), n = others.length - 1 || 1, alt = pos(list);
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
  const MARGIN = 30, HEAD = 34, BWL = 250, BWR = 330, BH = 20, ZL = 25, GAP_X = 560;
  const n = Math.max(L.length, R.length), H = MARGIN * 2 + HEAD + n * ZL;
  const ZLL = (n * ZL) / L.length, ZR = (n * ZL) / R.length;
  const xL = MARGIN, xR = MARGIN + BWL + GAP_X, B = xR + BWR + MARGIN;
  const svg = document.getElementById("graph");
  if (I18 && I18.en) svg.setAttribute("aria-label", U("Bipartiter Graph aus Begriffen, Sätzen und Vermutungen"));
  svg.setAttribute("viewBox", `0 0 ${B} ${H}`); svg.setAttribute("width", B); svg.setAttribute("height", H);
  const yL = {}, yR = {};
  L.forEach((id, i) => (yL[id] = MARGIN + HEAD + i * ZLL + (ZLL - BH) / 2));
  R.forEach((id, i) => (yR[id] = MARGIN + HEAD + i * ZR + (ZR - BH) / 2));
  [[xL + BWL / 2, FM("Begriffe ({0})", L.length)], [xR + BWR / 2, FM("Sätze und Vermutungen ({0})", R.length)]].forEach(([x, s]) => {
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
  let selected = null;
  const box = (id, x, y, w, name, color, side, conj) => {
    const gr = el("g", { class: "knoten" + (conj ? " vermutung" : ""), tabindex: 0 }, nodesG);
    el("rect", { x, y, width: w, height: BH, rx: conj ? 7 : 3, fill: color }, gr);
    const tx = el("text", { x: side === "L" ? x + w - 6 : x + 6, y: y + 14, "font-size": 12, "text-anchor": side === "L" ? "end" : "start" }, gr);
    const max = side === "L" ? 38 : 50;
    tx.textContent = name.length > max ? name.slice(0, max - 1) + "…" : name;
    el("title", {}, gr).textContent = name;
    gr.addEventListener("click", () => show(side, id));
    gr.addEventListener("keydown", (e) => { if (e.key === "Enter") show(side, id); });
    gr.addEventListener("mouseenter", () => { if (!selected) mark(side, id); });
    gr.addEventListener("mouseleave", () => { if (!selected) unmark(); });
    g[side + ":" + id] = gr;
  };
  L.forEach((id) => box(id, xL, yL[id], BWL, CONCEPT[id].name + " (" + CONCEPT[id].theorems.length + ")", COLOR[CONCEPT[id].area], "L"));
  R.forEach((id) => box(id, xR, yR[id], BWR, THEOREM[id].name, COLOR[THEOREM[id].area], "R", THEOREM[id].type === "vermutung"));
  // Hover box of the theorems with the same three lines as the map (todo B26) instead of the browser tooltip
  R.forEach((id) => { const gr = g["R:" + id], t = gr.querySelector("title"); if (t) t.remove(); GL.hover(gr, THEOREM[id], D.history); });

  const areasL = Object.keys(BG.areas).filter((k) => links.some((b) => b.area === k));
  document.getElementById("legende").innerHTML = `<label class="umschalter"><input type="checkbox" id="mitV"${withC ? " checked" : ""}> <b>${U("mit Vermutungen")}</b>
      ${withC ? "" : U("(ausgeblendet; rechts stehen nur bewiesene Sätze)")}</label><span class="trenner"></span>` + areasL.map((k) => `<span><i style="background:${COLOR[k]}"></i>${BG.areas[k]}</span>`).join("") +
    `<span class="trenner"></span><span><i style="background:#fff"></i>${U("Satz")}</span><span><i class="vkasten" style="background:#fff"></i>${U("Vermutung")}</span>
     <span class="klein">${U("Begriffe sind nach ihrem Bereich gefärbt, Aussagen nach dem Bereich in daten.js; die Linien haben die Farbe des Begriffs. Die Zahl hinter einem Begriff ist die Zahl der Aussagen, in denen er vorkommt.")}</span>`;

  // ------------------------------------------------------------ Analysis
  const THRESHOLD = Math.ceil(0.15 * right.length);
  const frame = new Set(links.filter((b) => b.theorems.length >= THRESHOLD).map((b) => b.id));
  const areasOf = (s, withoutFrame) => [...new Set(s.concepts.filter((b) => !withoutFrame || !frame.has(b)).map((b) => CONCEPT[b].area))];
  const bridges = right.map((s) => ({ s, all: areasOf(s, false), core: areasOf(s, true) }))
    .sort((a, b) => b.core.length - a.core.length || b.all.length - a.all.length).slice(0, 12);
  const frequent = links.slice().sort((a, b) => b.theorems.length - a.theorems.length).slice(0, 12);
  const point = (k) => `<span class="punktfarbe" title="${BG.areas[k]}" style="background:${COLOR[k]}"></span>`;
  const chipC = (id) => `<span class="chip" data-seite="L" data-id="${id}">${CONCEPT[id].name}</span>`;
  const chipT = (id) => `<span class="chip${THEOREM[id].type === "vermutung" ? " vchip" : ""}" data-seite="R" data-id="${id}">${THEOREM[id].name}</span>`;
  const panel = document.getElementById("panel");
  panel.addEventListener("click", (e) => { const c = e.target.closest("span.chip"); if (c && c.dataset.id) show(c.dataset.seite, c.dataset.id); });
  const comparison = (type) => { const l = right.filter((s) => s.type === type); return l.length ? (l.reduce((a, s) => a + s.concepts.length, 0) / l.length).toFixed(1) : "–"; };

  function overview() {
    panel.innerHTML = `<h2>${U("Auswertung")}</h2>
      <p class="klein">${FM("{0} Begriffe mit {1} Vorkommen in {2} Aussagen.", links.length, edges.length, right.length)}
        ${withC ? FM("Im Mittel enthält die Aussage eines Satzes {0} Begriffe, die einer Vermutung {1}.", comparison("satz"), comparison("vermutung")) : FM("Im Mittel enthält die Aussage eines Satzes {0} Begriffe.", comparison("satz"))}
        ${FM("Kreuzungen: {0} nach der Sortierung, {1} vorher.", best.n, initial)}</p>
      <h3>${U("Häufigste Begriffe")}</h3>
      <table class="auswertung"><tr><th>${U("Begriff")}</th><th class="zahl">${U("Aussagen")}</th></tr>
        ${frequent.map((b) => `<tr><td>${point(b.area)} ${chipC(b.id)}</td><td class="zahl">${b.theorems.length}</td></tr>`).join("")}</table>
      <h3>${U("Aussagen, die viele Bereiche verbinden")}</h3>
      <p class="klein">${FM("Die erste Zahl zählt die Bereiche aller Begriffe der Aussage. Die zweite lässt die {0} Rahmenbegriffe weg, die in mindestens {1} Aussagen vorkommen ({2}).", frame.size, THRESHOLD, [...frame].map((b) => CONCEPT[b].name).join(", ") || U("keine"))}</p>
      <table class="auswertung"><tr><th>${U("Aussage")}</th><th class="zahl">${U("alle")}</th><th class="zahl">${U("ohne Rahmen")}</th></tr>
        ${bridges.map((r) => `<tr><td>${chipT(r.s.id)}<br>${r.core.map(point).join("")}</td><td class="zahl">${r.all.length}</td><td class="zahl">${r.core.length}</td></tr>`).join("")}</table>
      <p class="klein">${U("Das Maß ist grob. Es zählt nur Bereiche, nicht ihren Abstand. Brückensätze wie der Modularitätssatz oder die Formel von Gross-Zagier verbinden Bereiche, die hier nach Fachgebiet und nicht nach Herkunft der Begriffe getrennt sind.")}</p>
      <h3>${U("Begriffe in keiner Aussage")}</h3>
      <p class="klein">${FM("{0} Begriffe werden nur in Definitionen gebraucht und fehlen deshalb im Graphen:", without.length)}</p>
      ${without.map((b) => `<a class="chip" href="begriffe.html#${b.id}">${b.name}</a>`).join("")}
      ${withoutB.length ? `<h3>${U("Aussagen ohne eingetragene Begriffe")}</h3>${withoutB.map((s) => `<a class="chip" href="index.html#${s.id}">${s.name}</a>`).join("")}` : ""}`;
  }
  function partnerOf(side, id) { return new Set(side === "L" ? CONCEPT[id].theorems : THEOREM[id].concepts); }
  function mark(side, id) {
    const p = partnerOf(side, id), others = side === "L" ? "R" : "L";
    Object.entries(g).forEach(([k, gr]) => {
      const s = k[0], i = k.slice(2);
      gr.classList.toggle("aktiv", s === side && i === id);
      gr.classList.toggle("blass", !((s === side && i === id) || (s === others && p.has(i))));
    });
    edgeList.forEach((ka) => { const an = side === "L" ? ka.b === id : ka.s === id; ka.e.classList.toggle("an", an); ka.e.classList.toggle("blass", !an); });
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
        <h3>${FM(b.theorems.length === 1 ? "Kommt vor in {0} Aussage" : "Kommt vor in {0} Aussagen", b.theorems.length)}</h3>${b.theorems.map(chipT).join("")}
        <p><a class="chip" href="begriffe.html#${id}">${U("Im Begriffsgraphen")}</a> <span class="chip" id="zurueck">${U("Zur Auswertung")}</span></p>`;
    } else {
      const s = THEOREM[id], to = {};
      s.concepts.forEach((b) => (to[CONCEPT[b].area] = to[CONCEPT[b].area] || []).push(b));
      const kind = s.type === "vermutung" ? `${U("Vermutung")} · <b style="color:${STATE_COLOR[s.state]}">${D.statuses[s.state]}</b>` : U("Satz");
      panel.innerHTML = `<h2>${s.name}</h2>
        <div class="klein">${kind} · ${D.areas[s.area]}${GL.yearText(s, D.history) ? " · " + GL.yearText(s, D.history) : ""}</div>
        <div class="klein">${ARS.mscText(s)}</div>
        ${GL.statementHtml(s)}<p>${s.text}</p>
        ${VF.info("s:" + id)}
        <h3>${U("Begriffe der Aussage nach Bereich")}</h3>
        ${Object.entries(to).map(([k, l]) => `<p class="klein">${point(k)} ${BG.areas[k]}</p>${l.map(chipC).join("")}`).join("")}
        <p><a class="chip" href="index.html${address(withC, id)}">${U("Im Satzgraphen")}</a> <span class="chip" id="zurueck">${U("Zur Auswertung")}</span></p>`;
    }
    document.getElementById("zurueck").addEventListener("click", (e) => { e.stopPropagation(); selected = null; unmark(); overview(); });
  }

  document.getElementById("mitV").addEventListener("change", (e) => { location.hash = address(e.target.checked, selected ? selected.slice(2) : ""); });
  overview();
  const showAnchor = (a) => { if (CONCEPT[a]) show("L", a); else if (THEOREM[a]) show("R", a); };
  showAnchor(uiState.k);
  window.addEventListener("hashchange", () => { const z = read(); if (z.withC !== withC) location.reload(); else showAnchor(z.k); });
  // Filter by comprehensibility (../Beispiel Algebraische Geometrie/verstaendlichkeit-filter.js): concepts on the left,
  // theorems on the right
  const vfKey = (k) => (k[0] === "L" ? "b:" : "s:") + k.slice(2);
  VF.an({ name: "AR", svg, nodes: () => Object.entries(g).map(([k, gr]) => [vfKey(k), gr]), edges: () => edgeList.map((ka) => [ka.e, "b:" + ka.b, "s:" + ka.s]) });
})();
