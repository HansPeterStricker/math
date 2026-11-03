// Column of areas at the far left of every graph page (user, 3 November 2026): each area with two links, Concepts and
// Theorems; the page shown is marked. Needs shared_scripts/areas.js. Loaded as a classic script at the end of the page.
(function () {
  const app = document.querySelector(".app");
  if (!app || !window.GRAPH_AREAS) return;
  const parts = location.pathname.split("/");
  const page = parts[parts.length - 1], here = parts[parts.length - 2];
  const nav = document.createElement("nav");
  nav.className = "gebiete";
  nav.setAttribute("aria-label", "Areas");
  const link = (a, file, label) => {
    const current = a.folder === here && page === file;
    return `<a href="../${a.folder}/${file}"${current ? ' class="hier" aria-current="page"' : ""}>${label}</a>`;
  };
  nav.innerHTML = `<a class="alle" href="../index.html">All graphs</a>` + window.GRAPH_AREAS.map((a) =>
    `<div class="gebiet${a.folder === here ? " hier" : ""}"><div class="gebiet-name" title="MSC ${a.msc}">${a.name}</div>` +
    `<div class="gebiet-links">${link(a, "concepts.html", "Concepts")}${link(a, "theorems.html", "Theorems")}</div></div>`).join("");
  app.insertBefore(nav, app.firstChild);
  app.classList.add("mit-gebieten");
})();
