// Todo B74, part 1: texts of the overlay "About" of draft 11 (questions and answers, English only like the map).
// Assignment: reports/2026-10-22 B74 Hintergrundinformationen/Auftrag.md; German reading version with the same sources:
// reports/2026-10-22 B74 Hintergrundinformationen/Texte.md.
// Format: window.E11_ABOUT = [{ q, a }], `a` is simple HTML (paragraphs only). The comment above each entry names the
// files and reports every statement rests on. Numbers counted on 22 October 2026 from what draft 11 draws
// (window.E11.symbols() in index.html: 404 elements) and from scripts/model.js (proofs, concepts, hidden
// nodes); recount them when the theorem graphs change.
// Classic script; loaded before scripts/about.js (part 2).
(function () {
  "use strict";
  window.E11_ABOUT = [
    // Sources: CLAUDE.md (project idea, working title); counts from window.E11.symbols(): 312 theorems (kind berg),
    // 42 open conjectures (gipfel 38 + bedingt 4), 6 refuted conjectures (trugbild), 31 theories (gebaeude), 13 bridges;
    // countries and provinces: data/layout.js (62 provinces in 20 MSC main fields); glossary (GLOSSAR.md,
    // translations/GLOSSAR.md: area, subarea); scripts/intro.js, card 1 and 4.
    {
      q: "What is this map?",
      a: "<p>This map shows a part of mathematics as a landscape: number theory, algebraic geometry and some neighbouring " +
        "fields that occur in their proofs. It contains 312 theorems, 42 open conjectures, 6 disproved conjectures, 31 theories " +
        "and 13 correspondences.</p>" +
        "<p>The coloured areas are main fields of the Mathematics Subject Classification (MSC 2020), the classification that " +
        "journals and databases use for mathematical papers. The map has 20 of these areas, divided into 62 subareas. " +
        "A click on a theorem shows which other theorems its proof uses.</p>",
    },
    // Sources: GLOSSAR.md, section 2 (building, building with a question mark, ruin, city, bridge, fjord, route);
    // GLOSSAR.md, section 1 (theory, correspondence); scripts/map-page.js (counterexample of a ruin shown in its info box,
    // plan 4.5 follow-up 3; bridge stages fertig/bauplan); graphs/arithmetic-geometry/daten.js, header comment on
    // `correspondence` (Galois side 11R, 11S; automorphic side 11F, 22E); city names: theories of type "grundlage" drawn
    // on the map (ag:G_KOH sheaf cohomology, ar:G_IWA Iwasawa theory).
    {
      q: "What do the buildings, ruins, cities and bridges mean?",
      a: "<p>Every building is a theorem, that is, a proved statement. A building with a question mark is a conjecture that " +
        "has been neither proved nor disproved; its info box says how far it has got, for example whether some cases are " +
        "proved. A ruin is a conjecture that has been disproved; its info box names the counterexample.</p>" +
        "<p>A city stands for a whole theory with its own concepts and theorems, such as sheaf cohomology or Iwasawa theory. " +
        "Proofs on the map use such a theory as a whole, without naming its single theorems.</p>" +
        "<p>A bridge across the fjord is a correspondence: a theorem or conjecture that matches the objects of two " +
        "independently defined sides. The fjord separates the two sides of the Langlands correspondences, Galois " +
        "representations on one bank and automorphic forms on the other. A finished bridge has been proved; a construction " +
        "plan in dashed lines is only conjectured.</p>",
    },
    // Sources: graphs/algebraic-geometry/daten.js, comment "Granularity" before window.AG; daten-gross.js, header
    // (168 nodes, same granularity); graphs/arithmetic-geometry/README.md and daten.js, header (three conjectures);
    // reports reports/2026-10-20 B41 Klassenkörpertheorie and reports/2026-10-20 B24 Langlands-Brücke (added parts);
    // sources lists in the headers of daten.js and daten-gross.js; READMEs of both folders, section "Hinweis" /
    // "Fachliche Unsicherheiten" (compiled with a language model, not reviewed); git log: every commit of the project
    // is co-authored by Claude.
    {
      q: "How were the theorems chosen?",
      a: "<p>The theorems come from three data files of the project. The first holds central theorems of algebraic geometry, " +
        "the second extends it by about 170 further entries, and the third covers arithmetic geometry and analytic number " +
        "theory around three famous conjectures: the Riemann hypothesis, the Birch and Swinnerton-Dyer conjecture and the abc " +
        "conjecture.</p>" +
        "<p>The rule was to include theorems that the literature regards as central, together with the intermediate results " +
        "through which several of them are connected. Some parts were added later on purpose, such as the main theorems of " +
        "class field theory and the bridges of the Langlands correspondences.</p>" +
        "<p>The selection was compiled with Claude, an AI model made by Anthropic, guided by standard textbooks such as " +
        "Hartshorne's <i>Algebraic Geometry</i> and Silverman's <i>The Arithmetic of Elliptic Curves</i>. It is a first " +
        "selection for a draft, neither complete nor balanced, and no expert has reviewed it yet.</p>",
    },
    // Sources: header comments of graphs/algebraic-geometry/daten.js ("proofs": hyperedges, AND/OR; "Granularity":
    // only premises actually used, the rest in a foundation node or the proof idea) and daten-gross.js; GLOSSAR.md
    // (Beweis, Prämisse, Bedingter Beweis, Beweispunkt); scripts/map-page.js (shown proof: first in historical order,
    // function baseShown; hollow proof points); scripts/model.js: 398 proofs, 21 of kind "bedingt"; test-b52a.js
    // (a conditional proof is drawn like every other route); graphs/arithmetic-geometry/README.md, section
    // "Quellen" (compiled from memory, not checked against the sources one by one).
    {
      q: "How were the dependencies between proofs determined?",
      a: "<p>For every theorem the data record at least one proof. A proof lists as its premises only the theorems on the map " +
        "that it really uses, and all of them are needed together. Anything else the proof needs is either a whole theory " +
        "(a city) or is mentioned in the short description of the proof idea.</p>" +
        "<p>If a theorem has several proofs, they are alternatives. The map first shows the earliest one and marks each " +
        "other proof with a hollow circle. Of the 398 proofs, 21 are conditional: they assume a conjecture that has not been " +
        "proved.</p>" +
        "<p>The proofs were written down with Claude from the standard literature named in the data files. For the part on " +
        "arithmetic geometry the data state that the details were compiled from memory and not checked against these sources " +
        "one by one.</p>",
    },
    // Wording of the question fixed by the user (22 October 2026, via the coordinator). Sources: scripts/map-page.js,
    // function meaning() (weight = direct users, n.users in scripts/model.js; raised by `highlights` and `large`;
    // level 1 to 4) and the drawing of the building levels (plan step 4.5, scripts/building-symbols.js); Große Sätze und
    // Vermutungen/ (table referenced by the field `large`); GLOSSAR.md, Gebäude (storeys, annexes, wings by level).
    // Details of the computation are left out on purpose (user, via the coordinator).
    {
      q: "What does the size of the buildings mean and how was it determined?",
      a: "<p>The size of a building shows how important the theorem is for the other theorems on this map. The more theorems " +
        "on the map use it in their proofs, the larger its building.</p>" +
        "<p>A few famous theorems and conjectures from the project's table of great theorems and conjectures (it includes " +
        "Hilbert's problems and the Millennium Prize Problems), and some results marked as especially remarkable, are raised so that they stand " +
        "out. Larger buildings also have more storeys, annexes and wings.</p>" +
        "<p>Because only proofs on this map are counted, the size depends on which theorems the map contains.</p>",
    },
    // Sources: scripts/model.js, header (province = first MSC class, condominium 11G/14G); daten.js headers (MSC
    // classes are estimates, not taken from zbMATH); PLAN.html, theme 1 (objective: sum of route lengths, small terms,
    // hard conditions, decision E1 on orientation); maps/tools/start-layout.js and raster-layout.js, header
    // comments (method; target area per province from its elements); Plan 1.6 report and B70 report (11M at the inner
    // end of the fjord); maps/tools/place-elements.js, header (positions inside a province: short routes, even
    // spacing).
    {
      q: "How were the areas arranged?",
      a: "<p>Each theorem lies, with few exceptions, in the subarea of its first MSC class. Theorems of arithmetic geometry " +
        "lie in a subarea that number theory and algebraic geometry share. The MSC classes were assigned with Claude as an " +
        "estimate; they were not taken from databases such as zbMATH.</p>" +
        "<p>A computer program then arranged the areas and subareas so that the routes of all proofs are as short as " +
        "possible in total: subareas with many proofs between them should be neighbours. Shared concepts, analogies and how " +
        "often two fields appear together in papers on the preprint server arXiv count a little as well. The program keeps " +
        "every area and subarea in one piece, gives each subarea room for its elements, and puts the two sides of the " +
        "Langlands correspondences on opposite banks of the fjord.</p>" +
        "<p>Some decisions were made by hand: algebraic geometry lies in the west, number theory in the east, and the " +
        "subarea of zeta and L-functions lies at the inner end of the fjord. Inside each subarea a second program placed the " +
        "buildings so that the routes are short and the buildings are evenly spread.</p>",
    },
    // Sources: scripts/intro.js, card 6 (contents of the info box); maps/entwurf-10/data/area-texts.js, header (descriptions of
    // areas and subareas, one well-known example), tests/test-area-hover.js (shown when hovering over a subarea);
    // GLOSSAR.md (Kurzfassung, Formel) and CLAUDE.md (formulas without quantifiers, todo B26); translations/README.md
    // (data stay German and are translated to English); git log (every commit co-authored by Claude); daten.js headers
    // (years not checked).
    {
      q: "How were the explanatory texts written?",
      a: "<p>The texts in the info box (the statement in words, who proved it and when, the idea of each proof and the " +
        "history) and the short descriptions that appear when you hover over an area were written in German by Claude and " +
        "then translated into English, also with Claude.</p>" +
        "<p>The statements follow fixed rules. Conditions and phrases such as “for every” stand in the sentence, while the " +
        "formula contains only the core of the statement. The descriptions of the areas follow the meaning of the MSC " +
        "classes and give one well-known example where possible.</p>" +
        "<p>The texts have not been checked systematically by an expert. In particular, the years in the histories were " +
        "taken from general knowledge and have not yet been checked against sources.</p>",
    },
    // Sources: graphs/algebraic-geometry/README.md, section "Hinweis"; graphs/arithmetic-geometry/README.md,
    // sections "Fachliche Unsicherheiten" and "Quellen"; daten.js headers (years, MSC estimates; AI proofs: kind
    // "beansprucht", nodes with `ki`); scripts/model.js, header and hiddenSet (5 AI nodes, 4 claimed proofs hidden).
    {
      q: "How reliable is the content?",
      a: "<p>The content was compiled with the help of an AI model and has not yet been reviewed by an expert. This applies to " +
        "the choice of theorems, the premises of the proofs, the MSC classes and the texts. The years have not been checked " +
        "against sources. The data files name points where the content is particularly uncertain, for example the exact " +
        "premises of some proofs.</p>" +
        "<p>Proofs that are only claimed are not drawn. This concerns in particular proofs said to come from an AI that " +
        "experts have not confirmed; the results concerned are left out of the map.</p>" +
        "<p>Before the map is used as a reference, people with expert knowledge of these fields should review the data.</p>",
    },
    // Sources: data/layout.js (20 main fields: 11, 14 and 18 others); PLAN.html (theme 2, trees and
    // definitions deferred, step 2.3 resting; steps 3.2 and 3.3 deferred, todo B72; step 3.1 accepted);
    // test-concepts-model.js (269 concepts); scripts/map-page.js (TREES_ENABLED, NETWORK_SHOWN, PROGRAMMES_SHOWN false;
    // programme "Geometrie über dem Körper mit einem Element" not drawn); READMEs of the example folders (review).
    {
      q: "What is still missing?",
      a: "<p>The map covers only number theory, algebraic geometry and the parts of 18 further main fields that occur in their " +
        "proofs and definitions. Most of mathematics is not on it yet.</p>" +
        "<p>The definitions are prepared in the data (269 concepts, to be drawn as trees and forests) but are not shown yet. " +
        "A view of all proof routes at once has been computed but is not shown yet either. Research programmes without a " +
        "single precise statement, such as geometry over the field with one element, are not drawn.</p>" +
        "<p>Above all, a review of the content by experts is still missing.</p>",
    },
    // Sources: CLAUDE.md, sections "Projektidee" and "Hintergrund" (working title; exchange with Andreas Holmstrom,
    // PeakMath, March 2024; prototype landscape.peakmath.org); README.md (written for Andreas Holmstrom); git log (all
    // commits co-authored by Claude); PLAN.html and GLOSSAR.md (decisions recorded as the user's). Author, e-mail address
    // and the naming of Andreas Holmstrom and PeakMath: user's decision of 22 October 2026 (via the coordinator, B74).
    {
      q: "Who made this map?",
      a: "<p>The map was created by Hans-Peter Stricker, with Claude (Anthropic). " +
        "The data, the program code and the texts of this draft were produced with Claude, an AI model made by Anthropic; " +
        "the author decides what the map shows and how.</p>" +
        "<p>The idea goes back to an e-mail exchange in March 2024 with Andreas Holmstrom of PeakMath " +
        "(<a href=\"https://peakmath.org\" target=\"_blank\" rel=\"noopener\">peakmath.org</a>), which had begun an interactive " +
        "prototype of a map of mathematics at landscape.peakmath.org.</p>" +
        "<p>Feedback is welcome at <a href=\"mailto:stricker@syspedia.de\">stricker@syspedia.de</a>.</p>",
    },
  ];
})();
