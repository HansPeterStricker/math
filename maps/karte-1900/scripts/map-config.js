// Settings of the map of mathematics around 1900 (plan step P4 of the map 1900, 23 October 2026), after the pattern of
// maps/karte-1830/scripts/map-config.js: everything that belongs only to this map, for the shared page code
// (maps/shared_scripts/map-page.js and map-core.js) and for the Node scripts of layout and measurement
// (maps/tools/*.js with --map karte-1900). Classic script in the browser (window.MAP_CONFIG, loaded before
// map-core.js and map-page.js) and a module in Node (require).
(function (root) {
  "use strict";
  // Fjord between geometry and algebra (plan step P5, decision of the console, report of P4 to P7): the correspondences
  // K1 to K3 (data sides elemgeo, alggeo | equations) and the coordinatisation of Hilbert 1899 (data sides geomfound,
  // projgeo | equations) connect geometry with the theory of equations. As on the map 1830 they share one fjord; its
  // geometric side is the union of the four provinces of the data (FJORD_SIDES below).
  const FJORD = "elemgeo,alggeo,geomfound,projgeo|equations";
  const GEO_SIDE = [["elemgeo", "alggeo", "geomfound", "projgeo"], ["equations"]];
  const config = {
    // ------------------------------------------------------------ Files (paths from the project folder, for the Node scripts)
    folder: "maps/karte-1900",
    page: "index.html",
    files: {
      // the data of 1900 (header, areas and foundations; parts A to E), in the order of the page
      data: ["maps/karte-1900/data/theorems.js", "maps/karte-1900/data/theorems-a.js", "maps/karte-1900/data/theorems-b.js",
        "maps/karte-1900/data/theorems-c.js", "maps/karte-1900/data/theorems-d.js", "maps/karte-1900/data/theorems-e.js"],
      // texts of the page: no descriptions of areas and subareas; the introduction and "About" of plan step P7 are loaded by
      // index.html only, not by the Node scripts
      texts: [],
      // translation (the map is shown in English only): the English texts of the map, built by
      // maps/tools/build-translations.js from translationSources (ui-1900.js after ui-e12.js replaces the texts that
      // differ), and the language switch
      language: ["maps/karte-1900/data/translations.js", "maps/shared_scripts/language.js"],
      translationSources: ["translations/en-alle.js", "translations/ui-gemeinsam.js", "translations/ui-e12.js", "translations/ui-1900.js"],
      // weights of the sizes: settings of this map (state of 1900, no editorial levels, no literature) and the formula (B49)
      weights: ["maps/karte-1900/data/weights.js", "maps/shared_scripts/size-score.js"],
      model: "maps/karte-1900/scripts/model.js",
      // layout of plan step P5, computed by the shared scripts start-layout.js, raster-layout.js and place-elements.js
      // (until P5 the provisional layout of P4 in the same file)
      layout: "maps/karte-1900/data/layout.js",
      startLayout: "maps/karte-1900/data/start-layout.json",
      routeNetwork: "maps/karte-1900/data/route-network.js",   // not computed (route network deferred, as on the map 1830)
      // no layout before plan step 1.2: the map starts with plan step P4
      oldLayout: null,
    },
    modelGlobal: "K1900_MODEL",   // window.K1900_MODEL, set by the model file
    api: "K1900",                 // window.K1900: functions for the tests

    // ------------------------------------------------------------ Data sources of the model
    // One source ("k1900") for all nodes, as on the map 1830: raw nodes, no highlights, no comprehensibility levels, the
    // proofs, no concepts and the states of the conjectures in 1900
    sources: (window, M) => ({
      side: () => "k1900",
      raw: { k1900: M.rawNodes },
      highlights: { k1900: {} },
      comprehensibility: { k1900: {} },
      specialCaseProofs: [[M.rawProofs, M.idMap]],
      concepts: null,
      statuses: Object.assign({}, (window.H1900 || {}).statuses || {}),
    }),
    // Links of the info box to the theorem graphs (section "Links", hidden by SHOW.links): no page of their own
    sourceLink: () => "",

    // ------------------------------------------------------------ Parts of the page
    // As on the map 1830 (see maps/entwurf-12/scripts/map-config.js for the meaning of every key)
    SHOW: { shownOnMap: false, proofShownNote: false, proofFrom: false, usedIn: false, relations: false, classification: false,
      links: false, whatsNew: false, showOnly: false, importance: false, flags: false, dependencies: true, definitions: false },
    TREES_ENABLED: false,
    PROGRAMMES_SHOWN: false,
    NETWORK_SHOWN: false,

    // ------------------------------------------------------------ Texts (German; translated by translations/ui-1900.js)
    ariaLabel: "Karte der Mathematik um 1900 im Meer, mit den Gebieten der Zeit und den Brücken zwischen Algebra und Geometrie",
    cartoucheTitle: ["Landkarte der", "Mathematik um 1900"],
    // no condominium (every subarea belongs to one area); the fields stay for the shared code
    condoName: "",
    condoCountries: [],
    PROVINCE_FULL: {},
    MAP_NAME_KEEP: [],
    MAP_NAME_SHORT: {},
    OPEN_PARTS: {},
    // One fjord (see FJORD above). The shared layout script (maps/tools/raster-layout.js) cuts one fjord per map; the
    // correspondences of the other groups, K4 Riemann surfaces and algebraic curves (functions, elliptic | alggeo) and K6
    // Kronecker's Jugendtraum (algnt | elliptic), stay drawn as the buildings of their theorem and conjecture until their
    // fjords are decided (as in draft 12; map-core.js, extendModel); their info boxes show the two sides.
    FJORD_SIDES: { "elemgeo,alggeo|equations": GEO_SIDE, "geomfound,projgeo|equations": GEO_SIDE },
    FJORD_GROUPS: [FJORD],
    FJORD_CONCEPTS: {},
    GEOMETRIC_NOTE: {},

    // ------------------------------------------------------------ Colours of the areas
    // Keys of the model (scripts/model.js, order of the groups in data/theorems.js): 1 arithmetic, 2 algebra, 3 number
    // theory, 4 probability, 5 analysis, 6 geometry, 7 mechanics. Rule of draft 12 (todo B69 k): no bluish or greenish hue
    // (the hue lies between 269 and 69 degrees) or a grey; neighbouring areas stay distinguishable. Plan step P6 (border
    // colouring of the 19th century, STYLE below): carmine, ochre, violet, purple, orange, rose, brown. Neighbours in the
    // layout of P5: 1-2, 1-3, 1-6, 2-3, 3-5, 3-6, 4-5, 5-6, 5-7 (2 and 6 face each other across the fjord); geometry is rose, so that it stands apart from
    // the violet of number theory
    COLOR: { 1: "#b5352d", 2: "#c99a1a", 3: "#7d4f9e", 4: "#a0479a", 5: "#d2701f", 6: "#c2567f", 7: "#8f5a2e" },
    CITY_SIZES: [0, 48, 40, 32, 26],
    CONDO_COLOR: "#cfa98c",
    DEFAULT_COLOR: "#cbbf9f",

    // ------------------------------------------------------------ Style of the 19th century (plan step P6: after the style
    // sheet maps/stile/stil-4-19-jahrhundert.html with maps/stile/style-4-19th-century.js, after Stieler's Hand-Atlas).
    // Read by maps/shared_scripts/map-page.js (see its head for the keys); the fonts of the names are set by the CSS of
    // index.html (Old Standard TT), here the fonts the page waits for before it measures the names.
    STYLE: {
      fonts: ['16px "Old Standard TT"', 'bold 16px "Old Standard TT"', 'italic 16px "Old Standard TT"'],
      halo: "#f8f6ef",          // halo of the names: the colour of the paper
      land: "#f8f6ef",          // white machine paper of the style sheet
      paper: "plain",           // paper layer: faint tone and a thin double rule as frame
      // border colouring of the lithographed atlases: a pale flat tint of the area (the style sheet: 0.3) and a band of the
      // colour inside its borders (screen px; half of it shows, the style sheet: 7 px at opacity 0.95)
      borderColouring: { wash: 0.28, band: 14, bandOpacity: 0.9 },
      borders: "atlas",         // dash-dot borders of the areas, dashed borders of the subareas
      countryName: { opacity: 0.85 },
      provinceName: { "font-style": "italic", style: "fill:#333", "letter-spacing": 0.4 },
      cartouche: { kind: "atlas", font: "'Old Standard TT', Georgia, serif" },
    },
    // Notes of the data of 1900 in the hover box and the info box (as on the map 1830; German patterns, English in
    // translations/ui-1900.js): historical name (field historicalName), recognition in 1900 (field recognition), what
    // happened after 1900 (field resolved of a conjecture), uncertain statements (field uncertain of nodes, proofs and
    // events), premises used tacitly (field tacit of a proof), unpublished events, Hilbert's problems (field sourcePlace
    // of the model, scripts/model.js)
    ERA_NOTES: {
      historicalName: "Um 1900: {0}",
      source: "Hilbert 1900, {0}",
      recognition: {
        "wenig beachtet": "Veröffentlicht, aber 1900 kaum bekannt oder nicht als Beweis anerkannt.",
        "lückenhaft": "Damals als Beweis anerkannt, nach heutigem Maßstab mit einer Lücke.",
      },
      resolved: { bewiesen: "Nach 1900 bewiesen: {0}.", widerlegt: "Nach 1900 widerlegt: {0}.", unabhaengig: "Nach 1900 als unabhängig erkannt: {0}.", teilweise: "Nach 1900 teilweise gelöst: {0}." },
      // plan step P6: entries without persons and year (the question was settled gradually), and the sentence `text` of
      // the entry below the note (keys of map-page.js since plan step P6 of the map 1900)
      resolvedBare: { bewiesen: "Nach 1900 bewiesen.", widerlegt: "Nach 1900 widerlegt.", unabhaengig: "Nach 1900 als unabhängig erkannt.", teilweise: "Nach 1900 teilweise gelöst." },
      resolvedText: true,
      // name of the kind of event "numerisch" (numerical evidence, GLOSSAR.md) in the history; the shared code has none
      eventKinds: { numerisch: "numerische Evidenz" },
      // user, 2026-10-23 (keys of map-page.js and map-core.js): the hover box shows below "Vermutet von …" who settled the
      // conjecture after 1900 and when (resolvedHover with persons and year, resolvedHoverYear with the year only); the map
      // shows a second, smaller italic line below the name (resolvedOnMap with "year, surnames"; more than two persons as
      // the first with resolvedOnMapEtAl)
      resolvedHover: { bewiesen: "Bewiesen von {0}", widerlegt: "Widerlegt von {0}", teilweise: "Teilweise bewiesen von {0}", unabhaengig: "Als unabhängig erwiesen von {0}" },
      resolvedHoverYear: { bewiesen: "Bewiesen {0}", widerlegt: "Widerlegt {0}", teilweise: "Teilweise bewiesen {0}", unabhaengig: "Als unabhängig erwiesen {0}" },
      resolvedOnMap: { bewiesen: "bewiesen {0}", widerlegt: "widerlegt {0}", teilweise: "teilweise bewiesen {0}", unabhaengig: "als unabhängig erwiesen {0}" },
      resolvedOnMapEtAl: "{0} u. a.",
      uncertain: "Unsicher: {0}",
      eventUncertain: "Unsicher: {0}",
      tacit: "stillschweigend vorausgesetzt",
      unpublished: "unveröffentlicht",
      bc: "{0} v. Chr.",
    },

    // ------------------------------------------------------------ Layout scripts (plan step P5 of the map 1900)
    // Settings of start-layout.js and raster-layout.js (maps/tools/, --map karte-1900); fields as on the map 1830
    LAYOUT: {
      // the map ellipse (the map has no layout before plan step 1.2); the same as in draft 12 and the map 1830
      mapData: { B: 1800, H: 1250, CX: 900, CY: 640, RX: 815, RY: 545 },
      // no arXiv counts for 1900: the objective is the sum of the route lengths of the shown proofs (with the small terms of
      // plan step 1.2)
      arxivWeight: 0,
      // Analysis (country 5) west, algebra (country 2) east: the fjord of the layout script opens on the south coast east of
      // the middle (10 to 40 degrees), so geometry must lie in the middle and algebra east of it. With geometry west and
      // number theory east (as on the map 1830) no run of step 0 brought geometry to the fjord (report of P4 to P7)
      orientation: { west: 5, east: 2, text: "Analysis im Westen, Algebra im Osten" },
      checkPairs: [["equations", "elemgeo"], ["equations", "alggeo"], ["elemnt", "algnt"], ["calculus", "functions"], ["functions", "elliptic"], ["diffeq", "mechanics"]],
      borderPairs: ["equations|elemgeo", "equations|alggeo", "equations|geomfound", "equations|projgeo", "foundations|equations", "foundations|elemgeo"],
      // Fjord between geometry and algebra: the inner end lies at the foundations of arithmetic (the number concept, on
      // which the coordinates of all four correspondences rest), the third province; the two sides have no land border.
      // The data have no concepts, so the depth is set by hand as on the map 1830 (650 px).
      FJORD_SETTINGS: { [FJORD]: { third: "foundations", depth: 650 } },
      svg: { round: "karte-1900-p5", roundTitle: "Karte 1900, P5", principle: "Karte der Mathematik um 1900: Startlage, Schritt 0, Rasterverfahren; Fjord zwischen Geometrie und Algebra bis zu den Grundlagen der Arithmetik." },
    },
  };
  if (typeof module === "object" && module.exports) module.exports = config;
  else root.MAP_CONFIG = config;
})(typeof window !== "undefined" ? window : this);
