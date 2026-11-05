// Column of areas at the far left of every graph page (user, 3 November 2026). Needs shared_scripts/areas.js. Loaded as
// a classic script at the end of the page.
// At the top "All graphs", "Graph of areas" (graphs/areas.html) and "Pairs and triples" (graphs/clusters.html). Below, the areas of the register in its groups
// (GRAPH_AREA_GROUPS), each group under a small heading. Since there are more than thirty areas, every area takes one
// line: its name leads to the page of the same kind (concept graph, theorem graph, concepts in theorems) of that area;
// only the area shown has its three links Concepts, Theorems and Concepts in theorems below its name, the page shown is marked.
// On graphs/areas.html the names lead to the concept graphs. Areas whose concept data the page has not loaded (folders
// without data yet) are left out. A page directly in graphs/ (areas.html) sets data-nav-base="" on <html>, so that the
// links lead into the folders instead of one level up.
(function () {
  const app = document.querySelector(".app");
  if (!app || !window.GRAPH_AREAS) return;
  const parts = location.pathname.split("/");
  const page = parts[parts.length - 1], base = document.documentElement.dataset.navBase;
  const root = base === undefined ? "../" : base, here = base === undefined ? parts[parts.length - 2] : null;
  const kind = ["concepts.html", "theorems.html", "bipartite.html"].includes(page) ? page : "concepts.html";
  const loaded = window.GRAPH_AREAS.filter((a) => window[a.concepts] || a.folder === here);
  const areas = loaded.length ? loaded : window.GRAPH_AREAS;
  const nav = document.createElement("nav");
  nav.className = "gebiete";
  nav.setAttribute("aria-label", "Areas");
  const link = (a, file, label) => {
    const current = a.folder === here && page === file;
    return `<a href="${root}${a.folder}/${file}"${current ? ' class="hier" aria-current="page"' : ""}>${label}</a>`;
  };
  // remark `note` of the register ("without graph theory"): small and grey after the name, its own line in the tooltip
  const tipOf = (a) => `MSC ${a.msc}` + (a.note ? `&#10;${a.note}` : "");
  const nameOf = (a) => a.name + (a.note ? ` <span class="note">(${a.note})</span>` : "");
  const entry = (a) => a.folder === here
    ? `<div class="gebiet hier"><div class="gebiet-name" title="${tipOf(a)}">${nameOf(a)}</div>` +
      `<div class="gebiet-links">${link(a, "concepts.html", "Concepts")}${link(a, "theorems.html", "Theorems")}${link(a, "bipartite.html", "Concepts in theorems")}</div></div>`
    : `<div class="gebiet"><a class="gebiet-name" href="${root}${a.folder}/${kind}" title="${tipOf(a)}">${nameOf(a)}</a></div>`;
  const groups = window.GRAPH_AREA_GROUPS || [{ key: undefined, name: "" }];
  const html = groups.map((g) => {
    const list = areas.filter((a) => a.group === g.key || (!window.GRAPH_AREA_GROUPS));
    return list.length ? `<div class="gruppe">${g.name ? `<div class="gruppe-name">${g.name}</div>` : ""}${list.map(entry).join("")}</div>` : "";
  }).join("");
  const onAreas = here === null && page === "areas.html", onClusters = here === null && page === "clusters.html";
  // link to the local overview of the project, only on local pages (user, 4 November 2026)
  nav.innerHTML = (location.protocol === "file:" ? `<a class="alle" href="${root}../index.html" title="Local overview of all pages of the project">⌂ Overview</a>` : "") +
    `<a class="alle" href="${root}index.html">All graphs</a>` +
    `<a class="alle${onAreas ? " hier" : ""}" href="${root}areas.html"${onAreas ? ' aria-current="page"' : ""}>Graph of areas</a>` +
    // the pairs and triples are not published (user, 4 November 2026): the link only on local pages (file://)
    (location.protocol === "file:" || onClusters ? `<a class="alle${onClusters ? " hier" : ""}" href="${root}clusters.html"${onClusters ? ' aria-current="page"' : ""}>Pairs and triples</a>` : "") + html;
  app.insertBefore(nav, app.firstChild);
  app.classList.add("mit-gebieten");
  // keep the area shown in view when the column scrolls
  const current = nav.querySelector(".gebiet.hier");
  const reveal = () => {
    if (!current) return;
    const top = current.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
    if (top + current.offsetHeight > nav.clientHeight) nav.scrollTop = top - nav.clientHeight / 3;
  };
  reveal();
  // once more when the web fonts have changed the heights of the lines
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reveal);
})();
