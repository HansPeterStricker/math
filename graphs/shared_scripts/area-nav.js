// Column of areas at the far left of every graph page (user, 3 November 2026): each area with three links, Concepts,
// Theorems and In theorems (concepts in theorems, the bipartite graph, since 3 November 2026); the page shown is marked. Needs shared_scripts/areas.js. Loaded as a classic script at the end of the page.
// At the top "All graphs" and "Graph of areas" (graphs/areas.html). A page directly in graphs/ (areas.html) sets
// data-nav-base="" on <html>, so that the links lead into the folders instead of one level up.
(function () {
  const app = document.querySelector(".app");
  if (!app || !window.GRAPH_AREAS) return;
  const parts = location.pathname.split("/");
  const page = parts[parts.length - 1], base = document.documentElement.dataset.navBase;
  const root = base === undefined ? "../" : base, here = base === undefined ? parts[parts.length - 2] : null;
  const nav = document.createElement("nav");
  nav.className = "gebiete";
  nav.setAttribute("aria-label", "Areas");
  const link = (a, file, label) => {
    const current = a.folder === here && page === file;
    return `<a href="${root}${a.folder}/${file}"${current ? ' class="hier" aria-current="page"' : ""}>${label}</a>`;
  };
  const onAreas = here === null && page === "areas.html";
  nav.innerHTML = `<a class="alle" href="${root}index.html">All graphs</a>` +
    `<a class="alle${onAreas ? " hier" : ""}" href="${root}areas.html"${onAreas ? ' aria-current="page"' : ""}>Graph of areas</a>` + window.GRAPH_AREAS.map((a) =>
    `<div class="gebiet${a.folder === here ? " hier" : ""}"><div class="gebiet-name" title="MSC ${a.msc}">${a.name}</div>` +
    `<div class="gebiet-links">${link(a, "concepts.html", "Concepts")}${link(a, "theorems.html", "Theorems")}${link(a, "bipartite.html", "In theorems")}</div></div>`).join("");
  app.insertBefore(nav, app.firstChild);
  app.classList.add("mit-gebieten");
})();
