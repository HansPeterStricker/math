// Settings of the map 2020 ("Mathematics around 2020", folder map-2026-number-theory-algebraic-geometry-modern; todo B78 of
// the main folder, 23 October 2026), after the pattern of maps/entwurf-12/scripts/map-config.js: everything that belongs
// only to this map, for the shared page code (maps/shared_scripts/map-page.js and map-core.js) and for the Node scripts of
// layout and measurement (maps/tools/*.js with --map map-2026-number-theory-algebraic-geometry-modern). The map was made
// on the same day as a copy of draft 11 with its own copies of all scripts; since B78 it uses the shared map code, and
// the values below are those of draft 11 and of its former copy of the page code. Classic script in the browser
// (window.MAP_CONFIG, loaded before map-core.js and map-page.js) and a module in Node (require).
(function (root) {
  "use strict";
  const config = {
    // ------------------------------------------------------------ Files (paths from the project folder, for the Node scripts)
    folder: "maps/map-2026-number-theory-algebraic-geometry-modern",
    page: "index.html",
    files: {
      // theorem graphs of algebraic and arithmetic geometry and the concepts (copies of draft 11), in the order of the page
      data: ["maps/map-2026-number-theory-algebraic-geometry-modern/data/theorems.js", "maps/map-2026-number-theory-algebraic-geometry-modern/data/concepts.js"],
      // texts of the page: comprehensibility levels and the descriptions of countries and provinces
      texts: ["maps/map-2026-number-theory-algebraic-geometry-modern/data/comprehensibility.js", "maps/map-2026-number-theory-algebraic-geometry-modern/data/area-texts.js"],
      // translation (the map is shown in English only): the English texts of the map, built by
      // maps/tools/build-translations.js from translationSources (ui-e12.js for the texts of the shared map code, ui-e11.js
      // last, so that the texts of draft 11 that this map shows stay as they were), and the language switch
      language: ["maps/map-2026-number-theory-algebraic-geometry-modern/data/translations.js", "maps/shared_scripts/language.js"],
      translationSources: ["translations/en-alle.js", "translations/ui-gemeinsam.js", "translations/ui-e12.js", "translations/ui-e11.js"],
      // weights of the sizes (B49): the copy of draft 11 (same values as maps/shared_data/weights.js on 23 October 2026) and the formula
      weights: ["maps/map-2026-number-theory-algebraic-geometry-modern/data/weights.js", "maps/shared_scripts/size-score.js"],
      model: "maps/map-2026-number-theory-algebraic-geometry-modern/scripts/model.js",
      layout: "maps/map-2026-number-theory-algebraic-geometry-modern/data/layout.js",
      startLayout: "maps/map-2026-number-theory-algebraic-geometry-modern/data/start-layout.json",
      routeNetwork: "maps/map-2026-number-theory-algebraic-geometry-modern/data/route-network.js",
      // layout before plan step 1.2 (frozen draft 10, read only), as for draft 12
      oldLayout: "maps/entwurf-10/data/old-layout.js",
    },
    modelGlobal: "K2020_MODEL",   // window.K2020_MODEL, set by the model file (until B78 window.E11_MODEL)
    api: "K2020",                 // window.K2020: functions for the tests (until B78 window.E11)

    // ------------------------------------------------------------ Data sources of the model
    // As draft 11: side(q) "ar" (arithmetic geometry) or "ag" (algebraic geometry); raw nodes, highlights, comprehensibility
    // levels and the proof lists with `specialCaseOf` per side; the concepts whose definitional distance sets the length of
    // a fjord without a layout file; the states of conjectures
    sources: (window, M) => ({
      side: (q) => (q.source === "ar" ? "ar" : "ag"),
      raw: { ag: [].concat(window.AG.nodes, (window.AG_LARGE || { nodes: [] }).nodes), ar: window.AR.nodes },
      highlights: { ag: Object.assign({}, (window.AG_LARGE || {}).highlights || {}, window.AG.highlights || {}), ar: window.AR.highlights || {} },
      comprehensibility: { ag: (window.AG_COMPR || {}).theorems || {}, ar: (window.AR_COMPR || {}).theorems || {} },
      specialCaseProofs: [[window.AG.proofs, M.agId], [(window.AG_LARGE || { proofs: [] }).proofs, M.agId], [window.AR.proofs, M.arId]],
      concepts: window.AR_CONCEPTS,
      statuses: Object.assign({}, window.AR.statuses || {}, window.AG.statuses || {}),
    }),
    // Links of the info box to the theorem graphs (section "Links", hidden by SHOW.links)
    sourceLink: (q, U) => {
      const AG_PATH = "../../graphs/algebraic-geometry/", AR_PATH = "../../graphs/arithmetic-geometry/";
      return q.source === "ar" ? `<a href="${AR_PATH}index.html#${q.id}">${U("im Satzgraphen der arithmetischen Geometrie")}</a>`
        : q.source === "gross" ? `<a href="${AG_PATH}gross.html#k=${q.id}">${U("im großen Graphen der algebraischen Geometrie")}</a>`
        : `<a href="${AG_PATH}index.html#${q.id}">${U("im Satzgraphen der algebraischen Geometrie")}</a>`;
    },

    // ------------------------------------------------------------ Parts of the page
    // As draft 11 and draft 12 (see maps/entwurf-12/scripts/map-config.js for the meaning of every key)
    SHOW: { shownOnMap: false, proofShownNote: false, proofFrom: false, usedIn: false, relations: false, classification: false,
      links: false, whatsNew: false, showOnly: false, importance: false, flags: false, dependencies: true, definitions: false },
    TREES_ENABLED: false,
    PROGRAMMES_SHOWN: false,
    NETWORK_SHOWN: false,

    // ------------------------------------------------------------ Texts (German; translated by translations/ui-e11.js)
    ariaLabel: "Karte der Zahlentheorie und der algebraischen Geometrie im Meer, mit dem Langlands-Fjord und der Brücke im Bau",
    cartoucheTitle: ["Landschaft der", "Zahlentheorie und algebraische Geometrie"],
    condoName: "Arithmetische Geometrie",
    condoCountries: [11, 14],
    PROVINCE_FULL: { "11M": "Zeta- und L-Funktionen: analytische Theorie", "11R": "Algebraische Zahlentheorie: globale Körper",
      "11S": "Algebraische Zahlentheorie: lokale Körper" },
    MAP_NAME_KEEP: [],
    MAP_NAME_SHORT: {
      "ag:hilbert14": "Finite generation of invariant rings",   // full: "Finite generation of all invariant rings of linear groups"
      "ag:minmodverm": "General existence of minimal models",    // full: "Existence of minimal models (general)"; user, 2026-10-22
      "ag:dejong": "De Jong alterations",                        // full: "Alterations (de Jong)"; user, 2026-10-22
    },
    OPEN_PARTS: {
      "ar:langlandsrecip": [
        "Galois → automorph im allgemeinen Fall, etwa für gerade ikosaedrische zweidimensionale Artin-Darstellungen über ℚ: Ihre Automorphie (Artin-Vermutung) ist im Allgemeinen offen.",
        "Automorph → Galois für Maaß-Spitzenformen zum Eigenwert 1/4: Ihnen sollten gerade zweidimensionale Artin-Darstellungen entsprechen; das ist offen.",
        "Allgemeine reduktive Gruppen über Zahlkörpern: Die Zuordnung zwischen automorphen Darstellungen und Galois-Parametern ist im Allgemeinen offen.",
      ],
    },
    // note below the list of unproved parts in the info box (optional key of the shared page code since todo B78; default
    // the note of draft 12): the wording of draft 11 that this map showed before B78
    openPartsNote: "Die Liste der unbewiesenen Teile steht vorläufig in der Seite von Entwurf 11, nicht im Datenmodell.",
    // no FJORD_GROUPS and no FJORD_SIDES: as in draft 11 every group of bridges has its fjord, with the sides of the data
    FJORD_CONCEPTS: { "11R,11S|11F,22E": ["galoisdarst", "automorph"] },
    GEOMETRIC_NOTE: { "ar:langlandsrecip": "Die geometrische Langlands-Vermutung ist das geometrische Gegenstück dieser Korrespondenz: Statt Zahlkörpern betrachtet sie Kurven, statt Funktionen Garben. Ihr unverzweigter Fall über Körpern der Charakteristik 0 ist seit 2024 bewiesen (Gaitsgory, Raskin und andere). Sie soll später eine eigene Brücke bekommen." },

    // ------------------------------------------------------------ Colours of the countries
    // The colours are drawn opaquely (STYLE.areaFill). They are the colours of draft 11, with the violet countries 5, 18, 46,
    // 52, 53 and 81 turned towards magenta because the water is light blue (hue about 188 degrees; at least 100 degrees from
    // the water), and then made paler as in style 5 (function pale of the former copy of the page code: saturation
    // s * 0.75 + 0.05, lightness 0.82 + (l - 0.72) * 0.4, same hue). Source colours before pale: 14 #d2b783, 11 #cf9f98,
    // 13 #e6c45e, 18 #d89dd9, 55 #c9a5c6, 57 #cbc58f, 32 #dc8f9c, 53 #cb9ad6, 58 #e88a5a, 81 #dcb0da, 52 #db9bd9, 5 #e5cbe6,
    // 12 #d4b39a, 30 #e9cb5a, 42 #e7a56a, 46 #d8a1e0, 22 #d7a9b9, 68 #b9b9b9, 20 #e2cb6c; condominium #cfa98c; default #cbbf9f.
    COLOR: { 5: "#e8d4e9", 11: "#dfc4c0", 12: "#e1cfc1", 13: "#e9d9a8", 14: "#e0d2b7", 18: "#e3c1e3", 20: "#e8dcad", 22: "#e2c7d0",
      30: "#eadca6", 32: "#e5bcc3", 42: "#eac9ac", 46: "#e2c3e7", 52: "#e4c1e3", 53: "#dcc0e2", 55: "#dcc6da", 57: "#dddabd",
      58: "#eabda6", 68: "#d4cfcf", 81: "#e4c9e3" },
    CONDO_COLOR: "#dfcbbb",
    DEFAULT_COLOR: "#ddd6c3",
    CITY_SIZES: [0, 32, 30, 28, 26],   // the default of map-core.js, as in draft 11

    // ------------------------------------------------------------ Style of the 20th century (maps/stile/style-5-20th-century.js;
    // until B78 in the own copies of map-page.js, drawing.js and building-symbols.js). Read by maps/shared_scripts/map-page.js;
    // the fonts of the names are set by the CSS of index.html (Fira Sans, Fira Sans Condensed)
    STYLE: {
      palette: { ink: "#2b2d30", paper: "#ffffff", red: "#d4202c" },   // ink, white paper, signal red (routes, cartouche)
      light: "#ffffff",         // halos of the names, decks, light edges
      land: "#f6f4ee",
      sea: "#d4e9ec", bank: "#6a98b5",   // light blue water, blue shore lines
      areaFill: { opacity: 1 },
      crisp: true,              // symbols without the hand-drawn filter
      // province borders only horizontal, vertical or at 45 degrees (user, 2026-10-23: "more raster-like borders"; the
      // address parameters borderAngle and borderTol of the trial are kept), lines of style 5
      borders: "octilinear",
      countryStraight: true,    // country names straight and horizontal (user, 2026-10-23)
      provinceName: { "font-style": "italic", "font-family": "'Fira Sans', Arial, sans-serif", "font-weight": 400, style: "fill:#3d3f44", "letter-spacing": 0.2 },
      paper: "rule",            // no paper texture, a single thin grey rule
      cartouche: { kind: "modern", font: "'Fira Sans', Arial, sans-serif" },
      // modern buildings (maps/shared_scripts/modern-symbols.js), variant b (user, 2026-10-23); the address parameter
      // ?buildings=a|b|c|era shows the other variants of the proposal
      buildings: "modern-b",
      buildingsParam: { a: "modern-a", b: "modern-b", c: "modern-c", era: "modern-era" },
      fonts: ['16px "Fira Sans"', 'italic 300 16px "Fira Sans"', '600 16px "Fira Sans"', '500 16px "Fira Sans Condensed"'],
    },

    // ------------------------------------------------------------ Layout scripts (start-layout.js, raster-layout.js)
    // The values of draft 11 (the layout data/layout.js is the layout of draft 11 and is not recomputed)
    LAYOUT: {
      orientation: { west: 14, east: 11, text: "algebraische Geometrie im Westen, Zahlentheorie im Osten" },
      checkPairs: [["12F", "11R"], ["12F", "11A"], ["12F", "20D"], ["14F", "18G"], ["14F", "18A"], ["14C", "14F"], ["14E", "14F"]],
      borderPairs: ["14F|18G", "14F|18A", "14C|14F", "14E|14F", "12F|11R", "12F|11A", "11F|22E", "11R|11S"],
      condoLabel: "11G/14G",
      FJORD_SETTINGS: { "11R,11S|11F,22E": { third: "11M" } },
    },
  };
  if (typeof module === "object" && module.exports) module.exports = config;
  else root.MAP_CONFIG = config;
})(typeof window !== "undefined" ? window : this);
