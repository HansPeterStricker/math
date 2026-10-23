// Settings of the map of mathematics around 1830 (plan step P4 of the map 1830, 22 October 2026), after the pattern of
// maps/entwurf-12/scripts/map-config.js: everything that belongs only to this map, for the shared page code
// (maps/shared_scripts/map-page.js and map-core.js) and for the Node scripts of layout and measurement
// (maps/scripts/*.js with --map karte-1830). Classic script in the browser (window.MAP_CONFIG, loaded before
// map-core.js and map-page.js) and a module in Node (require).
(function (root) {
  "use strict";
  const config = {
    // ------------------------------------------------------------ Files (paths from the project folder, for the Node scripts)
    folder: "maps/karte-1830",
    page: "index.html",
    files: {
      // the data of 1830 (header, areas and foundations; parts A to D), in the order of the page
      data: ["maps/karte-1830/data/theorems.js", "maps/karte-1830/data/theorems-a.js", "maps/karte-1830/data/theorems-b.js",
        "maps/karte-1830/data/theorems-c.js", "maps/karte-1830/data/theorems-d.js"],
      // texts of the page: no descriptions of areas and subareas; the introduction (scripts/intro.js) and "About"
      // (data/about-texts.js, scripts/about.js) of plan step P7 are loaded by index.html only, not by the Node scripts
      texts: [],
      // translation (the map is shown in English only): the English texts of the map, built by
      // maps/tools/build-translations.js from translationSources (ui-1830.js after ui-e12.js replaces the texts that
      // differ), and the language switch
      language: ["maps/karte-1830/data/translations.js", "maps/shared_scripts/language.js"],
      translationSources: ["translations/en-alle.js", "translations/ui-gemeinsam.js", "translations/ui-e12.js", "translations/ui-1830.js"],
      // weights of the sizes: settings of this map (state of 1830, no editorial levels, no literature) and the formula (B49)
      weights: ["maps/karte-1830/data/weights.js", "maps/shared_scripts/size-score.js"],
      model: "maps/karte-1830/scripts/model.js",
      // layout of plan step P5, computed by the shared scripts start-layout.js, raster-layout.js and place-elements.js
      // (until P5 the provisional layout of P4 in the same file)
      layout: "maps/karte-1830/data/layout.js",
      startLayout: "maps/karte-1830/data/start-layout.json",
      routeNetwork: "maps/karte-1830/data/route-network.js",   // not computed (route network deferred)
      // no layout before plan step 1.2: the map starts with plan step P4
      oldLayout: null,
    },
    modelGlobal: "K1830_MODEL",   // window.K1830_MODEL, set by the model file
    api: "K1830",                 // window.K1830: functions for the tests

    // ------------------------------------------------------------ Data sources of the model
    // One source ("k1830") for all nodes: raw nodes, no highlights, no comprehensibility levels, the proofs (no proof of
    // 1830 has `specialCaseOf`), no concepts (the length of the fjord falls back to the default of map-core.js) and the
    // states of the conjectures in 1830
    sources: (window, M) => ({
      side: () => "k1830",
      raw: { k1830: M.rawNodes },
      highlights: { k1830: {} },
      comprehensibility: { k1830: {} },
      specialCaseProofs: [[M.rawProofs, M.idMap]],
      concepts: null,
      statuses: Object.assign({}, (window.H1830 || {}).statuses || {}),
    }),
    // Links of the info box to the theorem graphs (section "Links", hidden by SHOW.links): the data of 1830 have no
    // page of their own
    sourceLink: () => "",

    // ------------------------------------------------------------ Parts of the page
    // As in draft 12 (see its scripts/map-config.js for the meaning of every key)
    SHOW: { shownOnMap: false, proofShownNote: false, proofFrom: false, usedIn: false, relations: false, classification: false,
      links: false, whatsNew: false, showOnly: false, importance: false, flags: false, dependencies: true, definitions: false },
    // No trees, no programmes, no route network (as in draft 12; plan of the map 1830)
    TREES_ENABLED: false,
    PROGRAMMES_SHOWN: false,
    NETWORK_SHOWN: false,

    // ------------------------------------------------------------ Texts (German; translated by translations/ui-1830.js)
    ariaLabel: "Karte der Mathematik um 1830 im Meer, mit den Gebieten der Zeit und den Brücken zwischen Algebra und Geometrie",
    // Two lines of the cartouche (plan step P6: the first in spaced capitals, the second in copperplate script, see STYLE)
    cartoucheTitle: ["Landkarte der", "Mathematik um 1830"],
    // The map of 1830 has no condominium (every subarea belongs to one area); the fields stay for the shared code
    condoName: "",
    condoCountries: [],
    PROVINCE_FULL: {},
    MAP_NAME_KEEP: [],
    MAP_NAME_SHORT: {},
    OPEN_PARTS: {},
    // The three correspondences K1 to K3 (plan step P1) share the sides geometry (elemgeo, anageo) and algebra; they get
    // one fjord. Without a fjord in the layout file map-core.js computes it from the cells of the two sides.
    FJORD_GROUPS: ["elemgeo,anageo|algebra"],
    FJORD_CONCEPTS: {},
    GEOMETRIC_NOTE: {},

    // ------------------------------------------------------------ Colours of the areas
    // Keys of the model (scripts/model.js): 1 arithmetic, 2 algebra, 3 geometry, 4 analysis, 5 probability,
    // 6 mechanics. Rule of draft 12 (todo B69 k): no bluish or greenish hue (the hue lies between 269 and 69 degrees) or
    // a grey; neighbouring areas stay distinguishable. Plan step P6 (border colouring of the 18th century, STYLE below):
    // stronger colours, because they stand only in the band along the borders: carmine, ochre, violet, orange, purple,
    // rose. Neighbours in the layout of P5: 1-2, 1-3, 1-4, 1-5, 2-5, 3-4, 3-6, 4-6.
    COLOR: { 1: "#b5352d", 2: "#c99a1a", 3: "#7d4f9e", 4: "#d2701f", 5: "#a0479a", 6: "#c2567f" },
    CITY_SIZES: [0, 48, 40, 32, 26],
    CONDO_COLOR: "#cfa98c",
    DEFAULT_COLOR: "#cbbf9f",

    // ------------------------------------------------------------ Style of the 18th century (plan step P6, user 2026-10-23:
    // completely after the style sheet maps/stile/stil-3-18-jahrhundert.html, maps/stile/style-3-18th-century.js). Read
    // by maps/shared_scripts/map-page.js; a map without this block is drawn as draft 12. The fonts of the names are set by
    // the CSS of index.html (Cormorant Garamond); here the fonts the page waits for before it measures the names.
    STYLE: {
      fonts: ['600 16px "Cormorant Garamond"', '700 16px "Cormorant Garamond"', 'italic 600 16px "Cormorant Garamond"', '16px "Pinyon Script"'],
      halo: "#f5efdf",          // halo of the names: the colour of the paper
      land: "#f5efdf",          // white laid paper instead of parchment
      paper: "laid",            // paper layer: laid lines and a plain double rule (no checkered frame)
      // border colouring: the area almost unwashed, the colour as a band inside the borders (screen px; half of it shows)
      borderColouring: { wash: 0.1, band: 12, bandOpacity: 0.75 },
      borders: "dotted",        // dotted borders of areas and subareas
      countryName: { "font-weight": 600 },
      provinceName: { "font-style": "italic", "font-weight": 600, style: "fill:#3b3226", "letter-spacing": 0.5 },
      cartouche: { script: "'Pinyon Script', 'Cormorant Garamond', serif", font: "'Cormorant Garamond', Georgia, serif" },
    },
    // Notes of the data of 1830 in the hover box and the info box (plan step P6; German patterns, English in
    // translations/ui-1830.js): historical name (field historicalName), recognition in 1830 (field recognition, the sentences of
    // `recognitions` in data/theorems.js), what happened after 1830 (field resolved of a conjecture), uncertain statements
    // (field uncertain of nodes and proofs), premises used tacitly (field tacit of a proof), unpublished events
    ERA_NOTES: {
      historicalName: "Um 1830: {0}",
      recognition: {
        "wenig beachtet": "Veröffentlicht, aber 1830 kaum bekannt oder nicht als Beweis anerkannt.",
        "lückenhaft": "Damals als Beweis anerkannt, nach heutigem Maßstab mit einer Lücke.",
      },
      resolved: { bewiesen: "Nach 1830 bewiesen: {0}.", widerlegt: "Nach 1830 widerlegt: {0}." },
      uncertain: "Unsicher: {0}",
      tacit: "stillschweigend vorausgesetzt",
      unpublished: "unveröffentlicht",
    },

    // ------------------------------------------------------------ Layout scripts (plan step P5 of the map 1830)
    // Settings of start-layout.js and raster-layout.js (maps/scripts/, --map karte-1830); draft 12 has the same fields
    LAYOUT: {
      // the map ellipse (the map has no layout before plan step 1.2); the same as in draft 12
      mapData: { B: 1800, H: 1250, CX: 900, CY: 640, RX: 815, RY: 545 },
      // no arXiv counts for 1830: the objective is the sum of the route lengths of the shown proofs as in plan 1 (with the
      // small terms of plan step 1.2, of which only the analogies and formulation prerequisites occur in these data)
      arxivWeight: 0,
      // provisional (the user decides at the acceptance of P5): geometry (country 3) west, arithmetic (country 1) east,
      // as in draft 12 algebraic geometry west and number theory east
      orientation: { west: 3, east: 1, text: "Geometrie im Westen, Arithmetik im Osten (vorläufig)" },
      checkPairs: [["algebra", "anageo"], ["algebra", "elemgeo"], ["algebra", "arith"], ["arith", "elemgeo"], ["diffint", "mechanik"], ["diffint", "diffgeo"]],
      borderPairs: ["algebra|anageo", "algebra|elemgeo", "algebra|arith", "arith|elemgeo", "anageo|arith"],
      // Fjord between algebra and geometry (decision of the user in P1): the inner end lies at the arithmetic, the
      // third province; the two sides have no land border. The data of 1830 have no concepts, so the definitional
      // distance of the sides (depth rule of plan 1.5) cannot be computed: the depth is set by hand. First 344 px (the
      // Langlands fjord of draft 12); the user asked for a deeper fjord reaching about the middle of the land, so 650 px
      // (2026-10-22; a variant with 500 px is in the report of P5)
      FJORD_SETTINGS: { "elemgeo,anageo|algebra": { third: "arith", depth: 650 } },
      svg: { round: "karte-1830-p5", roundTitle: "Karte 1830, P5", principle: "Karte der Mathematik um 1830: Startlage, Schritt 0, Rasterverfahren; Fjord zwischen Algebra und Geometrie bis zur Arithmetik." },
    },
  };
  if (typeof module === "object" && module.exports) module.exports = config;
  else root.MAP_CONFIG = config;
})(typeof window !== "undefined" ? window : this);
