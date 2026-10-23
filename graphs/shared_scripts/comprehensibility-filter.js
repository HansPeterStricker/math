// Filter by comprehensibility of the statement, shared by the views of algebraic and arithmetic
// geometry (window.VF).
//
// The ratings are in verstaendlichkeit.js of the respective folder (window.AG_COMPR or window.AR_COMPR). This
// script only reads them and does not change any data. It must be loaded before the page's script, because it removes
// the part
// „verst=…“ from the address before the page evaluates the address; at the end the page calls VF.an(…).
//
// VF.an({ name, svg, nodes, edges })
//   name "AG" or "AR": selects window.<name>_COMPR and window.<name>_CONCEPTS.
//   svg the SVG element of the graph; if it is redrawn, the filter reapplies itself automatically.
//   nodes function that returns a list [key, element]. The key is "s:<id>" for theorems, conjectures and
//           foundations (from daten.js) and "b:<id>" for concepts (from begriffe.js).
//   edges function that returns a list [element, keyA, keyB]; a key may be null.
//   legend id of the element to which the checkboxes are appended (default "legende").
// Hidden nodes are only strongly faded, so that the layout stays the same; edges to them likewise.
//
// VF.info(key) returns the section „Verständlichkeit“ for the info box: level, justification, where applicable the
// most accessible version, and the definitional depth of the statement. This is the greatest definitional depth of the
// concepts
// that occur in the statement according to begriffe.js (theoremConcepts); the depth of a concept is the length of the
// longest
// chain in the concept graph down to a basic concept.
//
// Address: „verst=1-3“ or „verst=1,3-5“ (levels shown). Without the entry all levels are shown. The entry is
// joined with the rest of the page's address state by „&“. If a page reloads itself after a switch and has
// lost the entry in the process, it is restored from sessionStorage (only on reload, not on new visits).
//
// Language: visible texts via T or F (English versions in ../../translations/ui-graph.js); without sprache.js German.
// Level labels (scaleTicks, short), justifications and concept names come from the data and are already translated.

(function () {
  "use strict";
  const LEVELS = [1, 2, 3, 4, 5];
  const COLOR = { 1: "#2f855a", 2: "#7fa34a", 3: "#c9a227", 4: "#d9822b", 5: "#b83a3a" };
  const STORAGE_KEY = "verstaendlichkeit-filter";
  const T = (s) => (window.I18N ? window.I18N.t(s) : s);
  const F = (pattern, ...values) => T(pattern).replace(/\{(\d)\}/g, (_, i) => values[i]);

  // ------------------------------------------------------------ Address
  const readIn = (s) => {
    const m = new Set();
    String(s || "").split(",").forEach((part) => {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= (b || a); i++) if (LEVELS.includes(i)) m.add(i);
    });
    return m.size ? m : new Set(LEVELS);
  };
  const serialize = (m) => {
    const l = LEVELS.filter((i) => m.has(i)), parts = [];
    for (let i = 0; i < l.length; i++) {
      let j = i;
      while (j + 1 < l.length && l[j + 1] === l[j] + 1) j++;
      parts.push(i === j ? String(l[i]) : l[i] + "-" + l[j]);
      i = j;
    }
    return parts.join(",");
  };
  const all = (m) => LEVELS.every((i) => m.has(i));
  const withoutCompr = (h) => h.replace(/^#/, "").split("&").filter((t) => t && !/^verst=/.test(t)).join("&");
  const comprFrom = (h) => { const t = h.replace(/^#/, "").split("&").find((x) => /^verst=/.test(x)); return t ? decodeURIComponent(t.slice(6)) : null; };
  const save = (value) => { try { sessionStorage.setItem(STORAGE_KEY + location.pathname, value); } catch (e) { /* without storage */ } };
  const stored = () => { try { return sessionStorage.getItem(STORAGE_KEY + location.pathname); } catch (e) { return null; } };
  const reloaded = () => { try { const n = performance.getEntriesByType("navigation")[0]; return n && n.type === "reload"; } catch (e) { return false; } };

  // On load: read the entry and remove it from the address so that the page reads its own state undisturbed
  let raw = comprFrom(location.hash);
  if (raw === null && reloaded()) raw = stored();
  let active = readIn(raw);
  if (comprFrom(location.hash) !== null) history.replaceState(null, "", location.pathname + location.search + (withoutCompr(location.hash) ? "#" + withoutCompr(location.hash) : ""));

  const setAddress = () => {
    const rest = withoutCompr(location.hash), v = all(active) ? "" : "verst=" + serialize(active);
    const h = [rest, v].filter(Boolean).join("&");
    history.replaceState(null, "", location.pathname + location.search + (h ? "#" + h : ""));
    save(all(active) ? "" : serialize(active));
  };

  // ------------------------------------------------------------ Data
  let V = null, BG = null, DEPTH = {}, DEEPEST = {};
  const entry = (cacheKey) => {
    if (!V || !cacheKey) return null;
    const [kind, id] = [cacheKey.slice(0, 2), cacheKey.slice(2)];
    return (kind === "b:" ? V.concepts : V.theorems)[id] || null;
  };
  const level = (cacheKey) => { const e = entry(cacheKey); return e ? e.level : null; };
  const hiddenNodes = (cacheKey) => { const s = level(cacheKey); return s !== null && !active.has(s); };

  function computeDepths() {
    DEPTH = {};
    if (!BG) return;
    const K = {}; BG.concepts.forEach((b) => (K[b.id] = b));
    const t = (id) => (id in DEPTH ? DEPTH[id] : (DEPTH[id] = K[id].uses.length ? 1 + Math.max(...K[id].uses.map(t)) : 0));
    BG.concepts.forEach((b) => t(b.id));
    DEEPEST = {};
    Object.entries(BG.theoremConcepts || {}).forEach(([s, list]) => {
      const valid = list.filter((b) => b in DEPTH);
      if (valid.length) DEEPEST[s] = valid.reduce((a, b) => (DEPTH[b] > DEPTH[a] ? b : a));
    });
  }
  const conceptName = (id) => { const b = BG && BG.concepts.find((x) => x.id === id); return b ? b.name : id; };

  // ------------------------------------------------------------ Display
  const styleDef = document.createElement("style");
  styleDef.textContent = `
    .vf-aus { opacity: .1 !important; }
    .knoten.vf-aus.aktiv, .knoten.vf-aus:hover, .gk.vf-aus.aktiv, .gk.vf-aus:hover { opacity: .55 !important; }
    .vf-legende { display: inline-flex; flex-wrap: wrap; gap: 4px 10px; align-items: center; }
    .vf-legende label { white-space: nowrap; cursor: pointer; }
    .vf-legende .titel { color: var(--leise, #6d655a); }
    .vf-legende .vf-zahl { color: var(--leise, #6d655a); font-size: 12.5px; }
    .vf-marke { display: inline-block; min-width: 15px; height: 15px; line-height: 15px; border-radius: 8px; color: #fff;
      font-size: 11px; font-weight: 600; text-align: center; margin-right: 3px; vertical-align: 0; }
    .vf-info { border-left: 3px solid var(--vf-farbe, #999); padding: 2px 0 2px 10px; margin: 6px 0 10px; }
    .vf-info p { margin: 4px 0; }`;
  document.head.appendChild(styleDef);
  const badge = (s) => `<span class="vf-marke" style="background:${COLOR[s]}">${s}</span>`;

  let task = null, scheduled = false, legendEl = null, legendObserver = null;

  function applyStep() {
    scheduled = false;
    if (!task) return;
    task.nodes().forEach(([cacheKey, e]) => { if (e) e.classList.toggle("vf-aus", hiddenNodes(cacheKey)); });
    task.edges().forEach(([e, a, b]) => { if (e) e.classList.toggle("vf-aus", hiddenNodes(a) || hiddenNodes(b)); });
  }
  const plan = () => { if (!scheduled) { scheduled = true; Promise.resolve().then(applyStep); } };

  function legend() {
    const box = document.getElementById(task.legend || "legende");
    if (!box || !task) return;
    const num = {}; LEVELS.forEach((s) => (num[s] = 0));
    let without = 0;
    task.nodes().forEach(([cacheKey]) => { const s = level(cacheKey); if (s) num[s]++; else without++; });
    const kinds = new Set(task.nodes().map(([cacheKey]) => cacheKey.slice(0, 2)));
    const title = kinds.size > 1 ? T("Verständlichkeit der Aussage bzw. Definition:") : kinds.has("b:") ? T("Verständlichkeit der Definition:") : T("Verständlichkeit der Aussage:");
    const html = `<span class="titel" title="${T("Welches Vorwissen braucht man, um zu verstehen, was behauptet oder definiert wird? Redaktionelle Einschätzung; zählt die zugänglichste gleichwertige Fassung.")}">${title}</span>` +
      LEVELS.map((s) => `<label title="${V.scaleTicks[s]}"><input type="checkbox" data-vf="${s}"${active.has(s) ? " checked" : ""}> ${badge(s)}${V.short[s]} <span class="vf-zahl">(${num[s]})</span></label>`).join("") +
      (without ? `<span class="vf-zahl">${F("{0} ohne Einstufung, immer gezeigt", without)}</span>` : "");
    if (!legendEl || !box.contains(legendEl)) {
      legendEl = document.createElement("span");
      legendEl.className = "vf-legende";
      const tr = document.createElement("span"); tr.className = "trenner";
      box.appendChild(tr); box.appendChild(legendEl);
      legendEl.addEventListener("change", (e) => {
        const s = Number(e.target.dataset.vf);
        if (!s) return;
        if (e.target.checked) active.add(s); else active.delete(s);
        if (!active.size) { active = new Set(LEVELS); legend(); }
        setAddress();
        applyStep();
      });
    }
    legendEl.innerHTML = html;
  }

  function data(name) {
    V = window[name + "_COMPR"] || null;
    BG = window[name + "_CONCEPTS"] || null;
    computeDepths();
  }
  // Provisional, so that VF.info already works before VF.an (the page often shows the anchor before the
  // call)
  const provisional = () => { if (!V) data(window.AR_COMPR ? "AR" : "AG"); };

  function an(opt) {
    task = opt;
    data(opt.name);
    if (!V) { console.warn("Verständlichkeit: window." + opt.name + "_COMPR fehlt"); return; }
    legend();
    applyStep();
    setAddress();
    if (opt.svg) new MutationObserver(plan).observe(opt.svg, { childList: true, subtree: true });
    // If the page rebuilds its legend, the filter is attached again
    const box = document.getElementById(opt.legend || "legende");
    if (box) {
      legendObserver = new MutationObserver(() => { if (legendEl && !box.contains(legendEl)) { legendEl = null; legend(); } });
      legendObserver.observe(box, { childList: true });
    }
    // If the page itself sets a new address, the entry is appended again
    window.addEventListener("hashchange", () => { if (comprFrom(location.hash) === null) setAddress(); });
    // If the page rewrites its address with history.replaceState (e.g. gross.html), the entry is appended as well
    const replaceAll = history.replaceState.bind(history);
    history.replaceState = function (uiState, title, url) {
      if (url !== undefined && url !== null && !all(active)) {
        const u = new URL(url, location.href);
        if (comprFrom(u.hash) === null) u.hash = [withoutCompr(u.hash), "verst=" + serialize(active)].filter(Boolean).join("&");
        url = u.href;
      }
      return replaceAll(uiState, title, url);
    };
  }

  function info(cacheKey) {
    provisional();
    const e = entry(cacheKey);
    if (!V) return "";
    const isConcept = cacheKey.slice(0, 2) === "b:", id = cacheKey.slice(2);
    let depth = "";
    if (isConcept) {
      if (id in DEPTH) depth = F("Definitorische Tiefe des Begriffs: {0}.", DEPTH[id]);
    } else if (DEEPEST[id]) {
      const b = DEEPEST[id];
      depth = F("Definitorische Tiefe der Aussage: {0} (tiefster Begriff in der Aussage: {1}).", DEPTH[b], conceptName(b));
    } else if (BG) {
      depth = T("Definitorische Tiefe der Aussage: nicht berechnet, weil dieser Aussage in begriffe.js keine Begriffe zugeordnet sind.");
    }
    const ek = DEPTH.ellkurve;
    const note = depth ? `<p class="klein">${depth} ${T("Diese Zahl hängt von der gewählten Definition ab und misst nicht dasselbe wie die Stufe:")}
      ${ek !== undefined ? F("Die elliptische Kurve hat in diesem Begriffsgraphen die Tiefe {0} (als Kurve vom Geschlecht 1 mit einem Punkt, wie bei Silverman), über die Weierstraß-Gleichung wäre sie etwa 2.", ek)
      : T("Eine elliptische Kurve hat als Kurve vom Geschlecht 1 nach Silverman eine große Tiefe, über die Weierstraß-Gleichung etwa 2.")}</p>` : "";
    if (!e) return `<h3>${T("Verständlichkeit")}</h3><p class="klein">${T("Noch nicht eingestuft.")}</p>${note}`;
    return `<h3>${isConcept ? T("Verständlichkeit der Definition") : T("Verständlichkeit der Aussage")}</h3>
      <div class="vf-info" style="--vf-farbe:${COLOR[e.level]}">
        <p>${badge(e.level)}<b>${F("Stufe {0}, {1}.", e.level, V.short[e.level])}</b> <span class="klein">${V.scaleTicks[e.level].replace(/^[^:]*:\s*/, "")}.</span></p>
        <p class="klein">${e.reason}</p>
        ${e.version ? `<p class="klein"><b>${T("Zugänglichste Fassung:")}</b> ${e.version}</p>` : ""}
      </div>${note}`;
  }

  window.VF = { an, info, level, refresh: applyStep };
})();
