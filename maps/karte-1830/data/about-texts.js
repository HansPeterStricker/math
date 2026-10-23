// Plan step P7 of the map 1830 (23 October 2026): texts of the overlay "About" of the map of mathematics around 1830
// (questions and answers, English only like the map), after the pattern of maps/entwurf-12/data/about-texts.js (todo B74).
// Assignment and report: reports/2026-10-23 Karte 1830 P7 Abschluss/ (Auftrag.md, Bericht.md).
// Format: window.K1830_ABOUT = [{ q, a }], `a` is simple HTML (paragraphs only). The comment above each entry names the
// files and reports every statement rests on. Numbers counted on 23 October 2026 from the five data files (theorems.js,
// theorems-a.js to -d.js) and from what the page draws (window.K1830.symbols(): 367 elements); recount them when the data
// change.
// Classic script; loaded before scripts/about.js.
(function () {
  "use strict";
  window.K1830_ABOUT = [
    // Sources: maps/karte-1830/PLAN.html (goal of the map: areas of the time, areas not yet developed in 1830 do not
    // appear); data/theorems.js, header (state of knowledge at the end of 1830; types satz, vermutung, grundlage); counts
    // from the data: 327 theorems (3 of them with `correspondence`), 31 conjectures (21 "offen", 6 "teilweise",
    // 4 "widerlegt"), 9 foundations, 391 proofs; window.K1830.symbols(): 324 buildings (berg), 27 buildings with a question
    // mark (gipfel), 4 ruins (trugbild), 9 cities (gebaeude), 3 bridges.
    {
      q: "What is this map?",
      a: "<p>This map shows mathematics as it was known at the end of 1830, in the areas of that time. Fields that did not " +
        "yet exist in 1830 do not appear.</p>" +
        "<p>The map contains 327 theorems, three of which are correspondences drawn as bridges, 27 conjectures that were " +
        "still open in 1830, 4 conjectures that had been disproved by then, and 9 theories that the proofs of the time used " +
        "as a whole. It records 391 proofs. A click on a building shows which other theorems its proof uses.</p>",
    },
    // Sources: GLOSSAR.md, section 2 (building, building with a question mark, ruin, city, bridge, fjord, route); legend of
    // the page; data/theorems.js, header (type grundlage: knowledge assumed in 1830 that is not split into theorems; state
    // of a conjecture in 1830); city names from the data (Euclid's Elements, rules of the differential and integral
    // calculus); the three nodes with `correspondence` (K1 classification of curves of the second order, K2
    // constructibility with straightedge and compass, K3 geometric representation of imaginary quantities), all drawn as
    // finished bridges (window.K1830.bridges(): stage "fertig"); PLAN.html, decision on P1 (fjord between algebra and
    // geometry).
    {
      q: "What do the buildings, ruins, cities and bridges mean?",
      a: "<p>Every building is a theorem, that is, a statement with a proof published by 1830. A building with a question " +
        "mark is a conjecture that was not proved by the end of 1830; its info box says whether special cases were proved " +
        "and what happened after 1830. A ruin is a conjecture that had been disproved by then.</p>" +
        "<p>A city stands for knowledge that the proofs of the time took for granted as a whole, such as Euclid's " +
        "Elements or the rules of the differential and integral calculus. The single theorems of a city are not on the map.</p>" +
        "<p>A bridge across the fjord is a correspondence: a theorem that matches the objects of two independently defined " +
        "sides. The fjord separates algebra from geometry. The three bridges are the classification of curves of the second " +
        "order, constructibility with straightedge and compass, and the geometric representation of imaginary quantities.</p>",
    },
    // Sources: data/theorems.js, comment before `areas` (textbooks and journals around 1830; works named there) and the
    // fields `group` (six areas), `area` (13 subareas), `period` and `msc` (second classification); scripts/model.js,
    // header (country = group, province = area; the MSC classes decide nothing on the map); PLAN.html (decision of the
    // user, 22 October 2026: six areas of the time, 13 subareas).
    {
      q: "Why are the areas not today's?",
      a: "<p>The map divides mathematics as it was divided around 1830, into six areas: arithmetic, algebra, geometry, " +
        "analysis, probability and mechanics. They are split into 13 subareas, for example descriptive and projective " +
        "geometry or the integration of differential equations.</p>" +
        "<p>The division follows the textbooks and works of the time: Lacroix's <i>Cours complet de mathématiques</i>, " +
        "Cauchy's <i>Cours d'analyse</i> (1821), Gauss's <i>Disquisitiones arithmeticae</i> (1801), Monge's application of " +
        "analysis to geometry, Poncelet's <i>Traité des propriétés projectives</i> (1822), Laplace's <i>Théorie analytique " +
        "des probabilités</i> (1812) and Lagrange's <i>Mécanique analytique</i>. The data also give each theorem its class in " +
        "today's Mathematics Subject Classification (MSC 2020), but this does not decide where it lies on the map.</p>",
    },
    // Sources: data/theorems.js, header (rules: satz = published proof by the end of 1830; the header adds "accepted by
    // contemporaries", but `recognition` "wenig beachtet" marks theorems whose proof was not accepted, so the text leaves it out;
    // unpublished results do not count; years of academy volumes); data/Quellen.md (four parts A to D, literature per area,
    // standard histories such as Dickson, Kline, Boyer, Grattan-Guinness, Bottazzini, Crowe; part D: none of the works
    // checked in the original; checks on the web: Wikisource, MacTutor); reports/2026-10-22 Plan H1 Mathematik um 1830/
    // (compiled by research agents, i.e. with Claude); git log (every commit co-authored by Claude).
    {
      q: "How were the theorems chosen and dated?",
      a: "<p>The data were compiled with Claude, an AI model made by Anthropic, in four parts: arithmetic and algebra, " +
        "geometry, the calculus and its functions, and differential equations, probability and mechanics. The aim was to " +
        "include the theorems that the histories of mathematics treat as the main results known by 1830, with the results " +
        "through which they are connected.</p>" +
        "<p>A statement counts as a theorem if a proof had been published by the end of 1830. Results known only from " +
        "letters, diaries or papers, such as many of Gauss's, do not count. For a paper in " +
        "the proceedings of an academy the year is that of the volume, as it is usually cited.</p>" +
        "<p>Years, titles and originators come mostly from standard histories, such as Dickson's <i>History of the Theory " +
        "of Numbers</i>, Kline's <i>Mathematical Thought from Ancient to Modern Times</i> and Grattan-Guinness's and " +
        "Bottazzini's histories of analysis. Some points were checked on the web against the MacTutor archive and editions " +
        "of the original works on Wikisource; most entries have not been checked against the original works.</p>",
    },
    // Sources: data/theorems.js, header ("proofs": hyperedges as the proofs were given at the time, with year, person and
    // source; kind "bedingt"; only proofs published by 1830; `tacit` remain premises); counts from the data: 391 proofs,
    // 3 of kind "bedingt", 17 with `tacit`; GLOSSAR.md (Beweis, Prämisse, Bedingter Beweis, Beweispunkt); the page shows
    // the earliest proof first and marks the others with a hollow circle (legend "further proof; a click shows it").
    {
      q: "How were the dependencies between proofs determined?",
      a: "<p>For every theorem the data record the proofs published by 1830, as they were given at the time, with author, " +
        "year and source. A proof lists as its premises the theorems on the map that it uses; all of them are needed " +
        "together. If a theorem has several proofs, they are alternatives: the map first shows one and marks each other " +
        "with a hollow circle.</p>" +
        "<p>Some proofs used statements that were taken for granted then and proved only later, such as unique prime " +
        "factorization in Euler's work or the fundamental theorem of algebra before 1799. They remain premises, because " +
        "the proof depends on them, and the info box marks them as “assumed tacitly”. This applies to 17 of the 391 " +
        "proofs. Three proofs are conditional: they assume a statement that was still a conjecture in 1830.</p>",
    },
    // Wording of the question as in draft 12 (fixed by the user for draft 12, 22 October 2026).
    // Sources: scripts/model.js, header ("Weights": users = number of proofs of the data of 1830 in which the node is a
    // premise; literature and today's importance do not count); data/weights.js; PLAN.html (decision of the user,
    // 22 October 2026: the weight follows the state of 1830); map-core.js, function meaning() (size and level from users).
    {
      q: "What does the size of the buildings mean and how was it determined?",
      a: "<p>The size of a building shows how often the theorem was used in the proofs on this map: the more proofs of the " +
        "data of 1830 use it as a premise, the larger its building. Larger buildings have more storeys, annexes and wings.</p>" +
        "<p>Only the state of 1830 counts. How important a theorem became later, or how often it is cited today, plays no " +
        "part. Because only proofs on this map are counted, the size also depends on which theorems the map contains.</p>",
    },
    // Sources: maps/karte-1830/scripts/map-config.js, LAYOUT (no arXiv counts, arxivWeight 0; orientation; fjord with third
    // province arith, depth 650 px set by hand because the data have no concepts); PLAN.html (P1: fjord between algebra and
    // geometry with inner end at the arithmetic; P5: orientation kept by the user, deeper fjord); reports/2026-10-22 Karte
    // 1830 P5 Lage/Bericht.md (same scripts as draft 12: start layout, raster method, placement of the elements; hard
    // conditions); maps/tools/start-layout.js, raster-layout.js and place-elements.js, header comments.
    {
      q: "How were the areas arranged?",
      a: "<p>A computer program arranged the areas and subareas so that the routes of all proofs are as short as possible " +
        "in total: subareas with many proofs between them should be neighbours. It keeps every area and subarea in one " +
        "piece and gives each subarea room for its buildings. A second program then placed the buildings inside each " +
        "subarea so that the routes are short and the buildings are evenly spread.</p>" +
        "<p>Some decisions were made by hand: geometry lies in the south-west, arithmetic in the east and analysis in " +
        "the north. The fjord runs between algebra and geometry, which the three bridges connect, and reaches " +
        "inland as far as arithmetic, which borders on both sides. Its depth was set by hand.</p>",
    },
    // Sources: maps/shared_scripts/map-page.js and scripts/map-config.js, ERA_NOTES (historical name, recognition, resolved,
    // uncertain, tacit, unpublished); data/theorems.js, header (fields historicalName, recognition, resolved, uncertain,
    // unpublished); counts from the data: 10 historical names (9 theorems, 1 conjecture eg_wuerfel), recognition 8 "wenig beachtet" and 31 "lückenhaft",
    // 25 conjectures with `resolved`, 97 nodes and 5 proofs with `uncertain`, 51 of 718 events unpublished;
    // PLAN.html (decision on P6: the source of the historical name is shown with author and year only).
    {
      q: "What does the info box say about 1830?",
      a: "<p>Where a theorem had a name of its own by 1830, the info box gives it below today's name, in the wording of the " +
        "source, such as <i>Theorema fundamentale</i> for quadratic reciprocity in Gauss's <i>Disquisitiones</i>. Nine " +
        "theorems and one conjecture, the duplication of the cube (<i>problème déliaque</i>), have such a name. Names that only name the author, and names that arose after 1830, are not given.</p>" +
        "<p>Short notes say whether a proof was published but hardly known in 1830, or was accepted then but has a gap by " +
        "today's standards, which premises were assumed tacitly, what happened to a conjecture after 1830 and what is " +
        "uncertain about an entry. In the history, events known only from letters or papers are marked “unpublished”. They " +
        "are not used for the line “Proved by …” unless all events of that kind are unpublished.</p>",
    },
    // Sources: as for "How were the theorems chosen and dated?"; data/theorems.js, header (field `uncertain`); counts:
    // 97 nodes and 5 proofs with `uncertain`; reports/2026-10-22 Karte 1830 P2 Datenaufbereitung/ (translation of all
    // German texts with Claude); translations/README.md (data stay German and are translated to English); CLAUDE.md
    // (mathematical content must be correct; no expert review so far).
    {
      q: "How reliable is the content?",
      a: "<p>The content was compiled with the help of an AI model and has not yet been reviewed by a historian of " +
        "mathematics. This applies to the choice of theorems, the premises of the proofs, the years and the assignment to " +
        "areas. The texts were written in German and translated into English, both with Claude.</p>" +
        "<p>The data mark what is uncertain: 97 entries and 5 proofs carry a note, for example when the year, the " +
        "originator or the existence of a proof by 1830 is not certain. The info box shows these notes.</p>",
    },
    // Sources: PLAN.html (route network, trees and programmes deferred; time as a slider, todo B2, not part of the plan);
    // scripts/map-config.js (TREES_ENABLED, NETWORK_SHOWN, PROGRAMMES_SHOWN false; texts: no descriptions of areas);
    // data/theorems.js (no concepts in the data of 1830); Quellen.md, sections "Bewusst nicht aufgenommen".
    {
      q: "What is still missing?",
      a: "<p>The map shows a selection of about 330 theorems, not all mathematics known in 1830. The definitions of the " +
        "time are not part of the data, so the map has no trees for concepts. A view of the state in other years is not " +
        "available.</p>" +
        "<p>Above all, a review of the content by historians of mathematics is still missing.</p>",
    },
    // Sources: as the entry "Who made this map?" of maps/entwurf-12/data/about-texts.js (author, e-mail address and the
    // naming of Andreas Holmstrom and PeakMath: user's decision of 22 October 2026 for draft 12, todo B74); CLAUDE.md,
    // sections "Projektidee" and "Hintergrund".
    {
      q: "Who made this map?",
      a: "<p>The map was created by Hans-Peter Stricker, with Claude (Anthropic). " +
        "The data, the program code and the texts of this map were produced with Claude, an AI model made by Anthropic; " +
        "the author decides what the map shows and how.</p>" +
        "<p>The idea goes back to an e-mail exchange in March 2024 with Andreas Holmstrom of PeakMath " +
        "(<a href=\"https://peakmath.org\" target=\"_blank\" rel=\"noopener\">peakmath.org</a>), which had begun an interactive " +
        "prototype of a map of mathematics at landscape.peakmath.org.</p>" +
        "<p>Feedback is welcome at <a href=\"mailto:stricker@syspedia.de\">stricker@syspedia.de</a>.</p>",
    },
  ];
})();
