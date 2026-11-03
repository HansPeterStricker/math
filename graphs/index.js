// Overview of all graphs (graphs/index.html): the list of the areas on the left and one entry per area with small
// previews of the concept graph and the theorem graph, both from shared_scripts/areas.js.
(function () {
  const own = (list) => list.filter((x) => x.area !== "basic");
  const concepts = (a) => {
    const d = window[a.concepts];
    if (!d) return "";
    return own(d.concepts).length + " concepts, " + d.concepts.reduce((s, c) => s + (c.uses || []).length, 0) + " definitional dependencies";
  };
  const theorems = (a) => {
    const d = window[a.theorems];
    if (!d) return "";
    return own(d.theorems).length + " theorems, " + d.theorems.reduce((s, t) => s + (t.premises || []).length, 0) + " premises";
  };
  document.getElementById("gebiete").insertAdjacentHTML("beforeend", window.GRAPH_AREAS.map((a) =>
    `<div class="gebiet"><div class="gebiet-name"><a href="#${a.folder}">${a.name}</a></div>` +
    `<div class="gebiet-links"><a href="${a.folder}/concepts.html">Concepts</a><a href="${a.folder}/theorems.html">Theorems</a></div></div>`).join(""));
  document.getElementById("liste").innerHTML = window.GRAPH_AREAS.map((a) => `
    <section class="eintrag" id="${a.folder}">
      <div class="msc">MSC ${a.msc}</div>
      <h2>${a.name}</h2>
      <p>${a.text}</p>
      <div class="paar">
        <a href="${a.folder}/concepts.html"><img src="previews/${a.folder}.jpg" alt="" loading="lazy"><div class="art">Concepts</div><div class="zahlen">${concepts(a)}</div></a>
        <a href="${a.folder}/theorems.html"><img src="previews/${a.folder}-theorems.jpg" alt="" loading="lazy"><div class="art">Theorems</div><div class="zahlen">${theorems(a)}</div></a>
      </div>
    </section>`).join("");
})();
