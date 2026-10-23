// Plan step P7 of the map 1900 (23 October 2026): texts of the overlay "About" of the map of mathematics around 1900
// (questions and answers, English only like the map), after the pattern of maps/karte-1830/data/about-texts.js and
// maps/entwurf-12/data/about-texts.js (todo B74). Assignment and report: reports/2026-10-23 Karte 1900 P4-P7 Karte bauen/.
// Format: window.K1900_ABOUT = [{ q, a }], `a` is simple HTML (paragraphs only). The comment above each entry names the
// files and reports every statement rests on. Numbers counted on 23 October 2026 from the six data files (theorems.js,
// theorems-a.js to -e.js) and from what the page draws (window.K1900.symbols(): 519 elements); recount them when the data
// change.
// Classic script; loaded before scripts/about.js.
(function () {
  "use strict";
  window.K1900_ABOUT = [
    // Sources: maps/karte-1900/PLAN.html (user, 23 October 2026: deadline 1900, Hilbert's lecture; about 500 nodes; the data
    // of the map 1830 copied and extended; areas of the time after the Encyklopädie); data/theorems.js, header (state of
    // knowledge at the end of 1900; types satz, vermutung, grundlage); counts from the data: 465 theorems (5 of them with
    // `correspondence`), 44 conjectures (22 "offen", 13 "teilweise", 9 "widerlegt"; one with `correspondence`),
    // 10 foundations, 558 proofs; window.K1900.symbols(): 461 buildings, 35 buildings with a question mark, 9 ruins,
    // 10 cities, 4 bridges.
    {
      q: "What is this map?",
      a: "<p>This map shows mathematics as it was known at the end of 1900, the year in which David Hilbert presented his " +
        "mathematical problems at the International Congress of Mathematicians in Paris. It uses the areas of that time. " +
        "Fields that did not yet exist in 1900 do not appear.</p>" +
        "<p>The map contains 465 theorems, four of which are correspondences drawn as bridges, 35 conjectures that were " +
        "still open in 1900, 9 conjectures that had been disproved by then, and 10 theories that the proofs of the time used " +
        "as a whole. It records 558 proofs. It continues the map of mathematics around 1830: its data were copied and " +
        "brought to the state of 1900, and about 150 theorems and conjectures of the years 1830 to 1900 were added.</p>",
    },
    // Sources: GLOSSAR.md, section 2 (building, building with a question mark, ruin, city, bridge, fjord); legend of the
    // page; data/theorems.js, header; the six nodes with `correspondence`; scripts/map-config.js, FJORD_GROUPS and
    // FJORD_SIDES (one fjord between geometry and algebra with K1 ag_kegelschnitte, K2 eg_konstruierbarkeit, K3
    // al_komplexe_ebene, K5 ng_hilbert_coordinatization; ef_riemann_existence and nf_jugendtraum drawn as buildings);
    // report of P4 to P7, section P4 "Brücken".
    {
      q: "What do the buildings, ruins, cities and bridges mean?",
      a: "<p>Every building is a theorem, that is, a statement with a proof published by 1900. A building with a question " +
        "mark is a conjecture that was not proved by the end of 1900; its info box says whether special cases were proved " +
        "and what happened after 1900. A ruin is a conjecture that had been disproved by then.</p>" +
        "<p>A city stands for knowledge that the proofs of the time took for granted as a whole, such as Euclid's " +
        "Elements or the rules of the differential and integral calculus. The single theorems of a city are not on the map.</p>" +
        "<p>A bridge across the fjord is a correspondence: a theorem that matches the objects of two independently defined " +
        "sides. The fjord separates geometry from the theory of equations. Its four bridges are the classification of " +
        "curves of the second order, constructibility with straightedge and compass, the geometric representation of " +
        "imaginary quantities and Hilbert's coordinates from the theorems of Desargues and Pascal (1899). Two further " +
        "correspondences of the time, between Riemann surfaces and algebraic curves and Kronecker's <i>Jugendtraum</i>, " +
        "join other areas; they are drawn as buildings for now, and their info boxes name the two sides.</p>",
    },
    // Sources: data/theorems.js, comment before `areas` (Encyklopädie der mathematischen Wissenschaften, from 1898, plan
    // fixed in 1897; volumes I to IV; field `period` with the sections) and the fields `group` (seven areas), `area`
    // (22 subareas) and `msc`; scripts/model.js, header; PLAN.html (decisions of P1: seven areas after volumes I to IV, group
    // theory one subarea of algebra, logic in the foundations of arithmetic).
    {
      q: "Why are the areas not today's?",
      a: "<p>The map divides mathematics as it was divided around 1900, into seven areas: arithmetic, algebra, number " +
        "theory, probability, analysis, geometry and mechanics. They are split into 22 subareas, for example the theory " +
        "of invariants, analysis situs or elliptic, Abelian and automorphic functions.</p>" +
        "<p>The division follows the first four volumes of the <i>Encyklopädie der mathematischen Wissenschaften</i>, which " +
        "began to appear in 1898 and which divided the whole of mathematics in the manner of its time. Group theory is a " +
        "subarea of algebra, and mathematical logic belongs to the foundations of arithmetic. The data also give each " +
        "theorem its class in today's Mathematics Subject Classification (MSC 2020), but this does not decide where it lies " +
        "on the map.</p>",
    },
    // Sources: data/theorems.js, header (rules: satz = published proof by the end of 1900; unpublished results do not
    // count); data/Quellen.md (P2: standard histories such as Dickson, Bonola, Narkiewicz; P3: Ferreirós, Hilbert's
    // lecture; no original work consulted in P2 and P3); maps/karte-1830/data/Quellen.md for the nodes copied from 1830;
    // reports of P2 and P3 of the map 1900 (compiled by research agents, i.e. with Claude).
    {
      q: "How were the theorems chosen and dated?",
      a: "<p>The data were compiled with Claude, an AI model made by Anthropic. The theorems of the map of 1830 were copied " +
        "and brought to the state of 1900: conjectures proved by then became theorems, with their proofs. Then the main " +
        "results of the years 1830 to 1900 were added in every area, with the results through which they are connected.</p>" +
        "<p>A statement counts as a theorem if a proof had been published by the end of 1900. Results known only from " +
        "letters, diaries or papers do not count.</p>" +
        "<p>Years, titles and originators come mostly from standard histories, such as Dickson's <i>History of the Theory " +
        "of Numbers</i>, Bonola's <i>Non-Euclidean Geometry</i>, Narkiewicz's <i>The Development of Prime Number Theory</i> " +
        "and Ferreirós's <i>Labyrinth of Thought</i>. The entries added for 1900 have not been checked against the original " +
        "works.</p>",
    },
    // Sources: data/theorems.js, header (field `hilbert`, `hilbertPart`; problem 23 has no node; problems stated as the
    // conjecture Hilbert expected); counts: 22 nodes with `hilbert`, 4 with `hilbertPart`; PLAN.html (user, 23 October 2026:
    // Hilbert's problems are conjectures without a mark of their own, with the note in the info box; decision of P3: state
    // of his lecture, so problem 3 stays a conjecture); scripts/model.js (note "Hilbert 1900, Problem n").
    {
      q: "Where are Hilbert's problems?",
      a: "<p>Hilbert's 23 problems of 1900 are on the map as conjectures, in the subareas they belong to, without a sign of " +
        "their own. Their info box carries the line “Hilbert 1900, Problem n”. Where Hilbert named an older conjecture as " +
        "part of a problem, such as Goldbach's conjecture in problem 8, the line reads “part of Problem n”.</p>" +
        "<p>The problems are shown as they stood at the time of the lecture. Problem 3 therefore stays a conjecture, " +
        "although Max Dehn solved it later in 1900. Problem 23, a call for the further development of the calculus of " +
        "variations, is not a statement and has no building. What became of each problem is noted in its info box.</p>",
    },
    // Sources: data/theorems.js, header ("proofs"; kind "bedingt"; `tacit`); counts from the data: 558 proofs, 1 of kind
    // "bedingt", 21 with `tacit`; GLOSSAR.md (Beweis, Prämisse, Bedingter Beweis, Beweispunkt).
    {
      q: "How were the dependencies between proofs determined?",
      a: "<p>For every theorem the data record the proofs published by 1900, as they were given at the time, with author, " +
        "year and source. A proof lists as its premises the theorems on the map that it uses; all of them are needed " +
        "together. If a theorem has several proofs, they are alternatives: the map first shows one and marks each other " +
        "with a hollow circle.</p>" +
        "<p>Some proofs used statements that were taken for granted then and proved only later. They remain premises, " +
        "because the proof depends on them, and the info box marks them as “assumed tacitly”. This applies to 21 of the " +
        "558 proofs. One proof is conditional: it assumes a statement that was still a conjecture in 1900.</p>",
    },
    // Wording of the question as in draft 12 and the map 1830.
    // Sources: scripts/model.js, header ("Weights"); data/weights.js; PLAN.html (taken over from the map 1830: the weight
    // follows the state of 1900); map-core.js, function meaning().
    {
      q: "What does the size of the buildings mean and how was it determined?",
      a: "<p>The size of a building shows how often the theorem was used in the proofs on this map: the more proofs of the " +
        "data of 1900 use it as a premise, the larger its building. Larger buildings have more storeys, annexes and wings.</p>" +
        "<p>Only the state of 1900 counts. How important a theorem became later, or how often it is cited today, plays no " +
        "part. Because only proofs on this map are counted, the size also depends on which theorems the map contains.</p>",
    },
    // Sources: scripts/map-config.js, LAYOUT (arxivWeight 0; orientation analysis west, algebra east; fjord with third
    // province foundations, depth 650 px set by hand); report of P4 to P7, section P5 (same scripts as draft 12 and the map
    // 1830; one point of step 0 moved by hand); maps/tools/start-layout.js, raster-layout.js, place-elements.js.
    {
      q: "How were the areas arranged?",
      a: "<p>A computer program arranged the areas and subareas so that the routes of all proofs are as short as possible " +
        "in total: subareas with many proofs between them should be neighbours. It keeps every area and subarea in one " +
        "piece and gives each subarea room for its buildings. A second program then placed the buildings inside each " +
        "subarea so that the routes are short and the buildings are evenly spread.</p>" +
        "<p>Some decisions were made by hand: analysis lies in the west and algebra in the east. The fjord runs between " +
        "algebra and geometry, which its bridges connect, and reaches inland as far as the foundations of arithmetic, " +
        "which border on both sides. Its depth was set by hand.</p>",
    },
    // Sources: maps/shared_scripts/map-page.js and scripts/map-config.js, ERA_NOTES; data/theorems.js, header; counts from the
    // data: 12 historical names (all theorems), recognition 3 "wenig beachtet" and 16 "lückenhaft", 29 conjectures with
    // `resolved`, 117 nodes, 20 proofs and 8 events with `uncertain`, 64 of 984 events unpublished.
    {
      q: "What does the info box say about 1900?",
      a: "<p>Where a theorem had a name of its own by 1900, the info box gives it below today's name, in the wording of the " +
        "source, such as <i>Theorema fundamentale</i> for quadratic reciprocity in Gauss's <i>Disquisitiones</i>. Twelve " +
        "theorems have such a name. Names that only name the author, and names that arose after 1900, are not given.</p>" +
        "<p>Short notes say whether a proof was published but hardly known in 1900, or was accepted then but has a gap by " +
        "today's standards, which premises were assumed tacitly, what happened to a conjecture after 1900 and what is " +
        "uncertain about an entry. In the history, events known only from letters or papers are marked “unpublished”, and " +
        "years before Christ are written “BC”.</p>",
    },
    // Sources: as for "How were the theorems chosen and dated?"; counts: 117 nodes, 20 proofs and 8 events with
    // `uncertain`; translations/README.md (the texts copied from 1830 stay German and are translated); CLAUDE.md (new texts
    // English since 22 October 2026; no expert review so far).
    {
      q: "How reliable is the content?",
      a: "<p>The content was compiled with the help of an AI model and has not yet been reviewed by a historian of " +
        "mathematics. This applies to the choice of theorems, the premises of the proofs, the years and the assignment to " +
        "areas. The texts taken over from the map of 1830 were written in German and translated into English, the new " +
        "ones were written in English, all with Claude.</p>" +
        "<p>The data mark what is uncertain: 117 entries, 20 proofs and 8 events carry a note, for example when the year, " +
        "the originator or the existence of a proof by 1900 is not certain. The info box shows these notes.</p>",
    },
    // Sources: PLAN.html (route network, trees and programmes deferred); scripts/map-config.js (TREES_ENABLED,
    // NETWORK_SHOWN, PROGRAMMES_SHOWN false; one fjord); report of P4 to P7 (K4 and K6 without a fjord).
    {
      q: "What is still missing?",
      a: "<p>The map shows a selection of about 500 theorems and conjectures, not all mathematics known in 1900. The " +
        "definitions of the time are not part of the data, so the map has no trees for concepts. Two correspondences, " +
        "between analysis and geometry and between number theory and analysis, still wait for a fjord and their bridges.</p>" +
        "<p>Above all, a review of the content by historians of mathematics is still missing.</p>",
    },
    // Sources: as the entry "Who made this map?" of maps/karte-1830/data/about-texts.js and maps/entwurf-12/data/about-texts.js.
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
