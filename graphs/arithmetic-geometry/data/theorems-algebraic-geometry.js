// Theorems of the theorem graph of algebraic geometry (window.AG), which this graph links to. Copy of
// graphs/algebraic-geometry/data/theorems.js made on 2026-10-23, so that the graph loads only files of its own folder.
// Data model: central theorems of algebraic geometry and their connections through proofs.
//
// Same model as in the group theory example:
//   nodes type "grundlage": prerequisite knowledge outside this graph (source).
//            type "satz": theorem or lemma. `formula` is a compact formulation in LaTeX, `text` explains it.
//            `area` assigns the theorem to a part of algebraic geometry (for the color).
//            `field` names the top-level fields of the Mathematics Subject Classification (MSC 2020) to which the
//            theorem
//            belongs, as a list of top-level numbers (numbers, so 05 Combinatorics as 5), the most important first (14
//            algebraic
//            geometry, 13 commutative algebra, 11 number theory, 32 several complex variables etc.; names in graph.js,
//            GL.MSC).
//            A second number appears only if the literature clearly also classifies the theorem there. For
//            foundations it is the field of origin.
//            `msc` names the three-character MSC 2020 classes (e.g. "14F", "11G"), the most important first. Their
//            top-level numbers are exactly the numbers in `field`, and the first class belongs to the first field.
//            Both assignments are estimates and have not been checked against zbMATH.
//            Optional `province`: location on the map (maps/scripts/entwurf-7-modell.js) when it differs from the first
//            class in `msc`. Set explicitly on the Henselsches Lemma, whose place in 11S the user fixed (todo B42).
//   proofs Hyperedges: premises (needed jointly, AND) -> conclusion. Several proofs of the same statement are
//            alternatives (OR). `idea` describes the proof step in one sentence.
//            Optional `rangeItems: { <premise id>: ["short name", ...] }`: for premises that point to a foundation, the
//            results of that theory the proof actually uses (same field as in ../Beispiel Arithmetische
//            Geometrie/daten.js, TODO B37, B41).
//            Optional `shortcut: true`: abbreviated proof of a theorem whose full proof uses theorems that stand only
//            in the graph of arithmetic geometry (node there with field `ag` pointing here). This graph shows the
//            abbreviation so that the theorem has a logical depth; the map (maps/scripts/entwurf-7-modell.js) skips it
//            and draws the full proof from the other folder.
//
// Conjectures (model taken from ../Beispiel Arithmetische Geometrie/daten.js):
//   nodes type "vermutung": unproven statement with field `state` (key from `statuses`). Optional `large`
//                (id in ../Große Sätze und Vermutungen/daten.js).
//   proofs Field `kind`: "beweis" (ordinary proof, default; the field may be missing) or "bedingt" (at least one
//                premise is a conjecture; the conclusion is proved only under this conjecture or, for an already
//                proved theorem, by a second route).
//   relations Binary relations that are not proofs, with `from`, `to`, `kind`, `text` and optionally `evidence`:
//                "teilresultat" `from` (theorem) is a proved special case or a weakened form of `to`.
//                "aequivalent" It has been proved that `from` and `to` are equivalent.
//                "analogie" Transfer between two fields, no logical dependency.
//                "formulierung" `from` must be known for the statement `to` to make sense at all.
//                "widerlegt" `from` (counterexample) disproves `to` (a conjecture with status "widerlegt").
//                "deutung" `from` (theorem) shows what the statement `to` means, without proving it.
//
// Counterexamples (model as in ../Beispiel Arithmetische Geometrie/daten.js; display in graph.js, GL.gb…):
//   nodes type "gegenbeispiel": a concrete object that disproves a statement, together with the proof that
//                it does so. It is proved and, like a theorem, has a logical depth; its proofs are ordinary
//                proofs. Every counterexample has at least one relation "widerlegt". Example: Nagata's counterexample
//                to Hilbert's 14th problem in daten-gross.js.
//   The logical depth is computed only over ordinary proofs. Conjectures have no logical depth; the
//   views show them in separate columns on the right and only when the switch „mit Vermutungen“ is on. Without
//   conjectures, all conjectures, conditional proofs and relations are dropped (GL.withoutConjectures in graph.js).
//   Further conjectures attached to nodes of the large graph are in daten-gross.js.
//
// AI proofs (model as in ../Beispiel Arithmetische Geometrie/daten.js; display in graph.js, GL.ai…):
//   proofs Optional field `ki`: according to those involved, the proof comes entirely or substantially from a
//                language model. { company, model, share ("vollständig" | "wesentlich" | "Mithilfe"), date (of the
//                manuscript),
//                people: [{ name, role }], verification ("unbestätigt" | "in Prüfung" | "vom Autor geprüft" |
//                "von Fachleuten bestätigt" | "zurückgezogen"), lean ("vollständig" | "teilweise" | "keine"),
//                source (URL), state (date of the entry), note (optional) }.
//                Proof kind "beansprucht": proof with field `ki` that no experts have confirmed. Like
//                "bedingt", it does not count toward the logical depth. Its premises are theorems, foundations or nodes
//                with
//                status "beansprucht". An AI proof that a mathematician has checked as author is an ordinary proof with
//                `ki`.
//   nodes Status "beansprucht" for a statement whose proof is only claimed; it is a node of type
//                "vermutung" and has no logical depth. The statuses of existing conjectures remain unchanged.
//                `ki: true` on nodes, relations and events: in the graph only because of an AI result; they
//                appear only with the switch „KI-Beweise“ (address ki=1), which also switches on the conjectures.
//   relations "teilresultat" may also start from a node with status "beansprucht".
//   history Events "beansprucht" (manuscript submitted) and "zurueckgezogen" (withdrawn by the originator).
//   Sources and context: ../Materialsammlung/Von KI bewiesene Sätze in algebraischer und arithmetischer Geometrie.md.
//
// Methods (same model in ../Beispiel Arithmetische Geometrie/daten.js; map draft: canals, see maps/Konzept/09):
//   methods A method is a reusable procedure that makes a certain kind of proof step routinely possible,
//                where it previously required an idea of its own (examples: sieve methods, deformation theory,
//                point counting with the Lefschetz trace formula). It is not a theorem: a theorem enters a proof as a
//                premise and is listed in `premises`; a method describes how the proof proceeds.
//                Nor is it a whole theory with its own concepts and theorems; such theories appear as
//                foundations or areas in the graph. A theorem can be a premise and at the same time underlie a method
//                (modularity lifting, Lefschetz trace formula).
//                { id ("M_…"), name, text, source, sourceFolder, year, circa (optional, year approximate), person:
//                [...],
//                msc (optional, MSC 2020 classes) }. `source` is the id of the node in which the method originated, if
//                it occurs in one of the two graphs, otherwise null. `sourceFolder` states in which graph this
//                node is: "AG" (../Beispiel Algebraische Geometrie, daten.js and daten-gross.js) or "AR"
//                (../Beispiel Arithmetische Geometrie); if source is null, it is null as well. A method that occurs in
//                both
//                folders has the same id and the same entry there, so that the map can merge them.
//                Each folder lists only the methods its proofs use. Included are only methods
//                used by at least two proofs of the two graphs together; a proof that appears identically in both
//                folders (node with field `ag`) counts once.
//   proofs Optional field `methods: [<id>, ...]`: methods the proof uses. The basis is the proof idea
//                (`idea`) and the literature cited there. If the field is missing, no method is entered; this does
//                not mean that the proof uses none.
//   The list `methods` is only in this file; the proofs in daten-gross.js refer to it.
//
// Classification theorems (same model in ../Beispiel Arithmetische Geometrie/daten.js):
//   nodes Optional field `classification: { objects, classes }` on theorems that completely divide all objects of a
//                kind into classes or determine them up to isomorphism by invariants (example: the Enriques–Kodaira
//                classification; objects "minimale glatte projektive Flächen über ℂ", classes "nach der
//                Kodaira-Dimension …"). Both fields are HTML text. A criterion for a single property, an
//                equivalence of categories or the existence of a moduli space does not count as a classification here.
//                The map displays classification theorems as a tree (decision of the user of 20 October 2026).
//                The field also appears on nodes in daten-gross.js. Display in the info box: graph.js
//                (GL.classificationHtml).
//
// Granularity: only theorems regarded as central in the literature are included, and only the intermediate results
// through which several of them are connected. A proof lists as premises only the theorems of this graph that it
// actually uses; whatever else it needs is placed in a foundation node or in the proof idea.
// Sources for the proof paths: Hartshorne, Algebraic Geometry (1977), chapters I to V; Serre, FAC (1955) and GAGA
// (1956); SGA 1, 4, 4½, 7; Deligne, La conjecture de Weil I (1974) and II (1980); Deligne–Illusie (1987);
// Fulton, Intersection Theory (1984).

window.AG = {
  title: "Zentrale Sätze der algebraischen Geometrie",

  areas: {
    grundlage: "Grundlagen außerhalb des Graphen",
    kommAlg: "Kommutative Algebra",
    kohom: "Kohomologie kohärenter Garben",
    kurven: "Kurven und Flächen",
    rr: "Riemann-Roch und Schnitttheorie",
    komplex: "Komplexe Geometrie und Hodge-Theorie",
    etale: "Étale Kohomologie und Weil-Vermutungen",
    arith: "Arithmetische Geometrie",
    biration: "Birationale Geometrie",
    abzaehl: "Abzählende Geometrie",
  },

  // Status of a conjecture (as in ../Beispiel Arithmetische Geometrie/daten.js)
  statuses: {
    offen: "offen",
    teilweise: "teilweise bewiesen",
    bedingt: "bedingt bewiesen",
    umstritten: "Beweis beansprucht, nicht anerkannt",
    widerlegt: "widerlegt",
    programm: "Programm ohne präzise Aussage",
    beansprucht: "Beweis von einer KI beansprucht, ungeprüft",
  },
  stateText: {
    beansprucht: "Ein Sprachmodell hat einen Beweis vorgelegt, den Fachleute noch nicht bestätigt haben. Die Aussage steht deshalb bei den Vermutungen und hat keine logische Tiefe. Sie erscheint nur mit dem Schalter „KI-Beweise“.",
    offen: "Weder bewiesen noch widerlegt.",
    teilweise: "Ein Teil der Aussage oder wichtige Spezialfälle sind bewiesen, die volle Aussage nicht.",
    bedingt: "Bewiesen unter der Annahme einer anderen Vermutung; ohne diese Annahme offen.",
    umstritten: "Ein Beweis wurde vorgelegt, wird aber von großen Teilen der Fachwelt nicht als vollständig anerkannt.",
    widerlegt: "Durch ein Gegenbeispiel oder einen Beweis des Gegenteils als falsch erwiesen.",
    programm: "Eine Leitidee mit vielen Teilansätzen, aber ohne einzelne präzise Aussage, die man beweisen könnte.",
  },

  // Methods (canals of the map): see the header comment. Same id and same entry as in the other folder.
  methods: [
    { id: "M_ABSTIEG", name: "Abstieg", source: "mordellweil", sourceFolder: "AG", year: 1922, person: ["Pierre de Fermat", "Louis Mordell", "André Weil"], msc: ["11G", "14G"],
      text: "Man ordnet jedem rationalen Punkt eine Klasse in einer endlichen Kohomologiegruppe (Selmer-Gruppe) zu und zeigt so, dass die Punktgruppe modulo m endlich ist; oder man führt eine Gleichung auf Gleichungen über Erweiterungskörpern beziehungsweise auf Überlagerungen und Torsoren zurück. Das Verfahren geht auf Fermats unendlichen Abstieg zurück; für elliptische Kurven Mordell (1922), für abelsche Varietäten Weil (1928)." },
    { id: "M_HOEHEN", name: "Höhenmaschine", source: "hoehen", sourceFolder: "AG", year: 1929, person: ["André Weil", "Douglas Northcott", "André Néron", "John Tate"], msc: ["11G", "14G"],
      text: "Man misst die arithmetische Größe eines Punktes mit einer Höhe, die jedem Geradenbündel bis auf eine beschränkte Funktion zugeordnet ist (Weil), und macht sie auf abelschen Varietäten durch einen Grenzwert exakt quadratisch (Néron, Tate). Endlichkeitsaussagen folgen, weil es nur endlich viele Punkte beschränkter Höhe gibt (Northcott). Weil (1929), Néron und Tate (1965)." },
    { id: "M_DIOPH", name: "Diophantische Approximation mit Hilfsfunktionen", source: null, sourceFolder: null, year: 1909, person: ["Axel Thue", "Carl Ludwig Siegel", "Klaus Roth", "Alan Baker", "Paul Vojta"], msc: ["11J"],
      text: "Man konstruiert mit dem Siegel-Lemma ein Hilfspolynom mit ganzzahligen Koeffizienten, das in vorgegebenen Punkten mit hoher Ordnung verschwindet, und zeigt mit einer Nullstellenabschätzung, dass es nicht zu stark verschwinden kann. Daraus folgen Schranken für die Güte rationaler Approximationen oder für Linearformen in Logarithmen. Thue (1909), Siegel (1929), Roth (1955), Baker (1966); Vojta überträgt das Verfahren auf Punkte von Kurven." },
    { id: "M_SPUR", name: "Punktzählen mit der Lefschetz-Spurformel", source: "spur", sourceFolder: "AG", year: 1964, person: ["André Weil", "Alexander Grothendieck", "Pierre Deligne"], msc: ["14F", "14G"],
      text: "Man zählt die Punkte einer Varietät über 𝔽<sub>q</sub> als Fixpunkte des Frobenius und drückt ihre Zahl mit der Lefschetz-Spurformel durch Spuren des Frobenius auf der ℓ-adischen Kohomologie aus. Aussagen über die Zetafunktion werden so zu Aussagen über Eigenwerte. Vorgeschlagen von Weil (1949), ausgeführt von Grothendieck (1964)." },
    { id: "M_KURVEN", name: "Faserung in Kurven", source: null, sourceFolder: null, year: 1924, person: ["Solomon Lefschetz", "Michael Artin", "Alexander Grothendieck"], msc: ["14D", "14F"],
      text: "Man stellt eine Varietät, gegebenenfalls nach Aufblasen oder Verkleinern, als Familie von Kurven über einer Basis kleinerer Dimension dar, beweist die Aussage für Kurven und schließt durch Induktion über die Dimension. Lefschetz (1924) untersuchte die Topologie algebraischer Varietäten mit Büscheln von Hyperebenenschnitten; Artin und Grothendieck (SGA 4, 1964) machten daraus mit elementaren Faserungen ein Standardverfahren der étalen Kohomologie." },
    { id: "M_HARMONISCH", name: "Harmonische Formen", source: "hodgezerl", sourceFolder: "AG", year: 1941, person: ["W. V. D. Hodge", "Kunihiko Kodaira"], msc: ["58A", "32Q"],
      text: "Man wählt in jeder Kohomologieklasse den eindeutigen harmonischen Vertreter bezüglich einer Kähler-Metrik und rechnet punktweise mit ihm: mit der Zerlegung nach Typen (p, q), den Kähler-Identitäten und der Bochner-Technik. Hodge (1941); Kodaira (1953) für Verschwindungssätze." },
    { id: "M_MODP", name: "Reduktion nach Charakteristik p", source: null, sourceFolder: null, year: 1968, circa: true, person: ["Alexander Grothendieck", "Shigefumi Mori", "Pierre Deligne", "Luc Illusie"], msc: ["14G", "14F"],
      text: "Man definiert eine komplexe Varietät über einem endlich erzeugten Ring, reduziert sie modulo vieler Primzahlen und benutzt dort den Frobenius, etwa für Hebungen nach W<sub>2</sub> oder um Gradbedingungen beliebig groß zu machen. Was für fast alle Primzahlen gilt, überträgt man zurück nach Charakteristik 0. Grothendieck für den Monodromiesatz (um 1968), Mori (1979) für rationale Kurven, Deligne und Illusie (1987) für die Hodge-Theorie." },
    { id: "M_VERSCHW", name: "Verschwindungssätze zum Fortsetzen von Schnitten", source: "kodaira", sourceFolder: "AG", year: 1953, person: ["Kunihiko Kodaira", "Yujiro Kawamata", "Vyacheslav Shokurov", "Christopher Hacon", "James McKernan"], msc: ["14F", "14E"],
      text: "Um zu zeigen, dass ein lineares System genug Schnitte hat, verschafft man sich einen Schnitt auf einer Untervarietät oder Aufblasung und setzt ihn fort. Das Hindernis liegt in einer Kohomologiegruppe H<sup>1</sup>, die ein Verschwindungssatz (Kodaira, Kawamata-Viehweg) beseitigt. Kodaira (1953/54) für den Einbettungssatz; in der birationalen Geometrie die X-Methode von Kawamata, Reid und Shokurov und die Fortsetzungssätze von Hacon und McKernan." },
    { id: "M_DEFORM", name: "Deformationstheorie", source: "defglatt", sourceFolder: "AG", year: 1958, person: ["Kunihiko Kodaira", "Donald Spencer", "Alexander Grothendieck", "Michael Schlessinger", "Barry Mazur"], msc: ["14D", "32G"],
      text: "Man untersucht, wie sich ein Objekt über k[ε] und anderen artinschen lokalen Ringen abändern lässt. Deformationen erster Ordnung und Hindernisse werden durch Kohomologiegruppen beschrieben (Tangentialraum H<sup>1</sup>, Hindernisse in H<sup>2</sup>), und man setzt Hebungen schrittweise fort. Kodaira und Spencer (1958) für komplexe Mannigfaltigkeiten, Grothendieck und Schlessinger allgemein, Mazur (1989) für Galois-Darstellungen." },
    { id: "M_DEGEN", name: "Degeneration und Spezialisierung", source: null, sourceFolder: null, year: 1889, person: ["Guido Castelnuovo", "Phillip Griffiths", "Joe Harris", "David Eisenbud"], msc: ["14D", "14H"],
      text: "Man lässt das Objekt in einer Familie zu einem einfacheren, meist singulären Objekt ausarten, rechnet dort und überträgt das Ergebnis mit Halbstetigkeit auf das allgemeine Objekt. Castelnuovo (1889) zählte lineare Systeme auf Kurven durch Ausartung zu einer rationalen Kurve mit Doppelpunkten; Griffiths und Harris (1980) sowie Eisenbud und Harris (1986) machten das Verfahren streng." },
    { id: "M_SCHNITT", name: "Abzählen mit Schnittzahlen", source: "schubert", sourceFolder: "AG", year: 1879, person: ["Hermann Schubert", "William Fulton"], msc: ["14N", "14C"],
      text: "Eine Anzahlfrage (wie viele Geraden, Kegelschnitte oder Kurven erfüllen gegebene Bedingungen) wird zu einem Produkt von Klassen in einem Chow-Ring oder Kohomologiering, oft ausgedrückt durch Chern-Klassen und Schubert-Klassen. Damit das Produkt die gesuchte Zahl ist, braucht man einen kompakten Parameterraum ohne überzählige Lösungen. Schubert (1879); streng begründet durch die Schnitttheorie (Fulton 1984)." },
  ],

  nodes: [
    // ------------------------------------------------------------ Foundations
    // Commutative algebra as four hill ranges (todo B42 e): G_KA, G_INTEXT, G_LOCALRINGS and G_DIFF (daten-gross.js)
    { id: "G_KA", type: "grundlage", area: "grundlage", field: [13], msc: ["13A", "13C", "13E"], name: "Grundlagen der kommutativen Algebra",
      text: "Noethersche und artinsche Ringe und Moduln, Lokalisierung, Primärzerlegung und symbolische Potenzen, graduierte Ringe und Moduln, endlich erzeugte Algebren und Invariantenringe, flache und treuflache Moduln, Resultante. Das Lemma von Nakayama, Hilberts Basissatz und der Nullstellensatz werden als eigene Sätze geführt." },
    { id: "G_INTEXT", type: "grundlage", area: "grundlage", field: [13], msc: ["13B", "13F", "13A"], name: "Ganze Erweiterungen und Bewertungsringe",
      text: "Ganze Erweiterungen und ganzer Abschluss, normale Ringe, Bewertungen und Bewertungsringe, faktorielle Ringe. Die Sätze von Cohen-Seidenberg werden als eigener Satz geführt." },
    { id: "G_LOCALRINGS", type: "grundlage", area: "grundlage", field: [13], msc: ["13H", "13D", "13J"], name: "Lokale Ringe und Vervollständigung",
      text: "Noethersche lokale Ringe, Dimensionstheorie lokaler Ringe, reguläre lokale Ringe und Parametersysteme, Koszul-Komplex und endliche freie Auflösungen, Vervollständigung, Koeffizientenkörper, henselsche Ringe, Weierstraß-Vorbereitung. Das Lemma von Nakayama, das Henselsche Lemma, Krulls Durchschnittssatz und das Artin-Rees-Lemma werden als eigene Sätze geführt." },
    { id: "G_ELLIPTIC", type: "grundlage", area: "grundlage", field: [11, 14], msc: ["11G", "14H"], name: "Elliptische Kurven",
      text: "Weierstraß-Gleichungen, Gruppengesetz nach Sekanten und Tangenten, invariantes Differential, Isogenien und ihr Grad, Reduktion modulo eines Primideals, Kurven vom Geschlecht 1 als Torsoren, Abstieg (Silverman, The Arithmetic of Elliptic Curves). Der Satz von Hasse, der Satz von Mordell-Weil, die duale Isogenie und die Punktzahl als Grad werden als eigene Sätze geführt." },
    { id: "G_KOH", type: "grundlage", area: "grundlage", field: [18, 55], msc: ["18G", "55N"], name: "Garbenkohomologie",
      text: "Kohomologie von Garben abelscher Gruppen auf topologischen Räumen: lange exakte Kohomologiesequenz, Čech-Kohomologie und ihr Vergleich mit der Kohomologie als abgeleitetem Funktor (Serre, FAC 1955; Grothendieck, Tôhoku 1957). Die allgemeine Theorie der abgeleiteten Funktoren gehört zur Grundlage „Kategorientheorie und homologische Algebra“." },
    { id: "G_KAT", type: "grundlage", area: "grundlage", field: [18], msc: ["18A", "18G", "18F"], name: "Kategorientheorie und homologische Algebra",
      text: "Yoneda-Lemma und darstellbare Funktoren; abgeleitete Funktoren und Ext (Grothendieck, Tôhoku 1957: genügend injektive Objekte); abgeleitete Kategorien und Spektralsequenzen; Grothendieck-Topologien und Topoi (SGA 4); Abstiegstheorie (SGA 1); Koszul-Komplexe; Brownscher Darstellbarkeitssatz." },
    { id: "G_AN", type: "grundlage", area: "grundlage", field: [32, 58], msc: ["32C", "58A"], name: "Komplexe Analysis",
      text: "Harmonische Formen und Hodge-Theorie elliptischer Operatoren; Endlichkeitssatz von Cartan-Serre für kohärente analytische Garben; Kähler-Identitäten." },
    { id: "G_TOP", type: "grundlage", area: "grundlage", field: [55, 57], msc: ["55N", "57R"], name: "Algebraische Topologie",
      text: "Morse-Theorie (Andreotti-Frankel 1959); Thoms Kobordismustheorie (für Hirzebruchs Beweis)." },
    { id: "G_ZT", type: "grundlage", area: "grundlage", field: [11], msc: ["11R"], name: "Algebraische Zahlentheorie",
      text: "Endlichkeit der Klassenzahl, Dirichlets Einheitensatz, Satz von Hermite-Minkowski." },
    { id: "G_DIOPH", type: "grundlage", area: "grundlage", field: [11], msc: ["11J"], name: "Diophantische Approximation",
      text: "Siegel-Lemma, Arakelov-Theorie und arithmetischer Riemann-Roch (Gillet-Soulé); benutzt in Vojtas Beweis." },

    // ------------------------------------------------------------ Commutative algebra
    { id: "basis", type: "satz", area: "kommAlg", field: [13], msc: ["13E"], name: "Hilberts Basissatz", year: 1890,
      form: "general", short: "Für jeden noetherschen Ring A gilt:",
      formula: String.raw`A[x] \text{ noethersch}`,
      text: "Insbesondere ist jedes Ideal in k[x₁, …, xₙ] endlich erzeugt; jede algebraische Menge ist durch endlich viele Gleichungen bestimmt." },
    { id: "noethnorm", type: "satz", area: "kommAlg", field: [13], msc: ["13B"], name: "Noether-Normalisierung", year: 1926,
      form: "existence", short: "Zu jedem Körper k und jeder endlich erzeugten k-Algebra A gibt es über k algebraisch unabhängige y<sub>1</sub>, …, y<sub>d</sub> ∈ A mit:",
      formula: String.raw`k[y_1,\dots,y_d] \subseteq A \text{ endlich}`,
      text: "Jede affine Varietät ist eine endliche Überlagerung eines affinen Raumes." },
    { id: "zariskilemma", type: "satz", area: "kommAlg", field: [13], msc: ["13B"], name: "Zariski-Lemma", year: 1947,
      form: "general", short: "Für jeden Körper k und jeden Erweiterungskörper K von k, der als k-Algebra endlich erzeugt ist, gilt:",
      formula: String.raw`[K:k] < \infty`,
      text: "Schwache Form des Nullstellensatzes." },
    { id: "nullst", type: "satz", area: "kommAlg", field: [13, 14], msc: ["13A", "14A"], name: "Hilberts Nullstellensatz", year: 1893,
      form: "general", short: "Für jeden algebraisch abgeschlossenen Körper k und jedes Ideal J ⊆ k[x<sub>1</sub>, …, x<sub>n</sub>] gilt:",
      formula: String.raw`I\big(V(J)\big) = \sqrt{J}`,
      text: "Wörterbuch zwischen Geometrie und Algebra: algebraische Mengen entsprechen Radikalidealen, Punkte entsprechen maximalen Idealen (x₁ − a₁, …, xₙ − aₙ)." },
    { id: "dim", type: "satz", area: "kommAlg", field: [13], msc: ["13C"], name: "Dimensionssatz",
      form: "general", short: "Für jeden Körper k und jede endlich erzeugte k-Algebra A, die ein Integritätsbereich ist, gilt:",
      formula: String.raw`\dim A = \operatorname{trdeg}_k \operatorname{Frac}(A)`,
      text: "Für einen endlich erzeugten k-Integritätsbereich A; alle maximalen Primidealketten haben diese Länge. Die Krull-Dimension einer Varietät ist ihr Transzendenzgrad." },
    { id: "krull", type: "satz", area: "kommAlg", field: [13], msc: ["13C"], name: "Krulls Hauptidealsatz", year: 1928,
      form: "general", short: "Für jeden noetherschen Ring A, jedes f ∈ A und jedes über (f) minimale Primideal 𝔭 von A gilt:",
      formula: String.raw`\operatorname{ht}\mathfrak p \le 1`,
      text: "In einem noetherschen Ring. Geometrisch: Eine Hyperfläche schneidet eine Varietät V in Komponenten der Dimension mindestens dim V − 1." },
    { id: "artinrees", type: "satz", area: "kommAlg", field: [13], msc: ["13A"], name: "Artin-Rees-Lemma", year: 1956,
      credit: { person: ["Emil Artin", "David Rees"], year: 1956 },
      form: "existence", short: "Zu jedem Ideal I eines noetherschen Rings und jedem Untermodul N eines endlich erzeugten Moduls M gibt es ein c, sodass für n ≥ c gilt:",
      formula: String.raw`I^n M \cap N = I^{\,n-c}\,(I^c M \cap N)`,
      text: "Für einen endlich erzeugten Modul M über einem noetherschen Ring, einen Untermodul N und ein Ideal I. Grundlage für Vervollständigungen." },
    { id: "nakayama", type: "satz", area: "kommAlg", field: [13], msc: ["13C"], name: "Lemma von Nakayama", year: 1951,
      form: "general", short: "Für jeden kommutativen Ring A, jedes Ideal I im Jacobson-Radikal von A und jeden endlich erzeugten A-Modul M gilt:",
      formula: String.raw`IM = M \;\Longrightarrow\; M = 0`,
      text: "Meist benutzt in der Form: Erzeugen Elemente von M den Modul M/IM, so erzeugen sie schon M. Bei einem lokalen Ring wählt man für I das maximale Ideal." },
    { id: "cohenseidenberg", type: "satz", area: "kommAlg", field: [13], msc: ["13B"], name: "Sätze von Cohen-Seidenberg", year: 1946,
      form: "existence", short: "Zu jeder ganzen Ringerweiterung A ⊆ B, Primidealen 𝔭 ⊆ 𝔭′ von A und jedem Primideal 𝔮 von B über 𝔭 gibt es ein Primideal 𝔮′ ⊇ 𝔮 mit:",
      formula: String.raw`\mathfrak q' \cap A = \mathfrak p'`,
      text: "Die Formel ist Going up. Dazu gehören: Über jedem Primideal von A liegt ein Primideal von B (Lying over), und verschiedene Primideale über demselben 𝔭 sind nicht ineinander enthalten (Unvergleichbarkeit). Ist A ein ganz abgeschlossener Integritätsbereich und B ein Integritätsbereich, so lassen sich Ketten von Primidealen auch nach unten fortsetzen (Going down)." },
    // One mountain in province 11S (decision of the user, todo B42). The same node (same id, name and statement) will
    // also be defined in ../Beispiel Arithmetische Geometrie/daten.js; the map model merges both by id and name.
    { id: "hensel", type: "satz", area: "kommAlg", field: [11, 13], msc: ["11S", "13J"], province: "11S", name: "Henselsches Lemma", year: 1904,
      form: "existence_unique", short: "Zu jedem Polynom f über dem Bewertungsring 𝒪<sub>K</sub> eines lokalen Körpers und jedem a mit f(a) ≡ 0, f′(a) ≢ 0 mod 𝔭 gibt es genau ein α ∈ 𝒪<sub>K</sub> mit:",
      formula: String.raw`f(\alpha) = 0, \qquad \alpha \equiv a \bmod \mathfrak p`,
      text: "Für jeden nichtarchimedischen lokalen Körper K mit Bewertungsring 𝒪<sub>K</sub> und maximalem Ideal 𝔭, etwa K = ℚ<sub>p</sub> mit 𝒪<sub>K</sub> = ℤ<sub>p</sub>. Eine einfache Nullstelle modulo 𝔭 hebt sich also eindeutig zu einer Nullstelle in 𝒪<sub>K</sub>. Lokale Lösbarkeit einer Gleichung lässt sich deshalb meist durch eine Rechnung modulo p entscheiden. Die Aussage gilt für jeden vollständigen diskret bewerteten Ring; lokale Ringe, in denen sie gilt, heißen henselsch." },
    { id: "hilbpol", type: "satz", area: "kommAlg", field: [13], msc: ["13D"], name: "Hilbert-Polynom", year: 1890,
      form: "existence_unique", short: "Zu jedem endlich erzeugten graduierten Modul M über k[x<sub>0</sub>, …, x<sub>n</sub>], k ein Körper, gibt es genau ein Polynom P<sub>M</sub> mit:",
      formula: String.raw`\begin{gathered} \dim_k M_m = P_M(m) \;\;(m \gg 0) \\ \deg P_M = \dim V(\operatorname{Ann} M) \end{gathered}`,
      text: "Für einen endlich erzeugten graduierten Modul M über k[x₀, …, xₙ]. Der Leitkoeffizient von P mal (dim)! ist der Grad der projektiven Varietät." },

    // ------------------------------------------------------------ Cohomology
    { id: "pncoh", type: "satz", area: "kohom", field: [14], msc: ["14F"], name: "Kohomologie von ℙⁿ", year: 1955,
      form: "equation", short: "Für jeden noetherschen Ring A, jedes n ≥ 1 und jedes m ∈ ℤ gilt:",
      formula: String.raw`H^i(\mathbb P^n_A, \mathcal O(m)) = \begin{cases} A[x_0,\dots,x_n]_m & i = 0\\ 0 & 0<i<n\\ \big(A[x_0,\dots,x_n]_{-m-n-1}\big)^\vee & i = n \end{cases}`,
      text: "Die einzige wirklich ausgerechnete Kohomologie; fast alles Weitere wird auf sie zurückgeführt." },
    { id: "serreendl", type: "satz", area: "kohom", field: [14], msc: ["14F"], name: "Serres Endlichkeits- und Verschwindungssatz", year: 1955,
      form: "general", short: "Für jedes projektive Schema X über einem noetherschen Ring A, jede kohärente Garbe F auf X und jedes i ≥ 0 gilt:",
      formula: String.raw`\begin{gathered} H^i(X,\mathcal F) \text{ endlich erzeugter } A\text{-Modul} \\ i > 0 \;\Rightarrow\; H^i\big(X,\mathcal F(m)\big) = 0 \;\; (m \gg 0) \end{gathered}`,
      text: "Für X projektiv über einem noetherschen Ring A und F kohärent." },
    { id: "serredual", type: "satz", area: "kohom", field: [14], msc: ["14F"], name: "Serre-Dualität", year: 1955,
      form: "general", short: "Für jede glatte projektive Varietät X der Dimension n über einem Körper, jedes lokal freie E auf X und jedes i gilt:",
      formula: String.raw`H^i(X,\mathcal E)^\vee \;\cong\; H^{\,n-i}(X,\mathcal E^\vee \otimes \omega_X)`,
      text: "Für X glatt projektiv der Dimension n über einem Körper und E lokal frei." },
    { id: "formfunk", type: "satz", area: "kohom", field: [14], msc: ["14F", "14B"], name: "Satz über formale Funktionen", year: 1961,
      form: "general", short: "Für jeden projektiven Morphismus f: X → Y, Y noethersch, jede kohärente Garbe F auf X, jedes y ∈ Y und jedes i gilt:",
      formula: String.raw`\big(R^i f_* \mathcal F\big)^{\wedge}_y \;\cong\; \varprojlim_n H^i\big(X_n, \mathcal F_n\big)`,
      text: "Für f: X → Y projektiv, Y noethersch, F kohärent; Xₙ ist die n-te infinitesimale Umgebung der Faser über y." },

    // ------------------------------------------------------------ Curves and surfaces
    { id: "bezout", type: "satz", area: "kurven", field: [14], msc: ["14C", "14H"], name: "Satz von Bézout", year: 1779,
      form: "general", short: "Für je zwei ebene projektive Kurven C, D ohne gemeinsame Komponente über einem algebraisch abgeschlossenen Körper gilt:",
      formula: String.raw`\sum_{P \in C \cap D} I_P(C,D) = \deg C \cdot \deg D`,
      text: "Für ebene projektive Kurven ohne gemeinsame Komponente über einem algebraisch abgeschlossenen Körper; allgemein für eine Varietät Y ⊆ ℙⁿ und eine Hyperfläche H: Σ i(Y,H;Zⱼ)·deg Zⱼ = deg Y · deg H." },
    { id: "bertini", type: "satz", area: "kurven", field: [14], msc: ["14C"], name: "Satz von Bertini",
      form: "general", short: "Für jede glatte projektive Varietät X ⊆ ℙ<sup>n</sup> über einem algebraisch abgeschlossenen Körper und fast alle Hyperebenen H gilt:",
      formula: String.raw`X \cap H \text{ glatt}`,
      text: "Über einem algebraisch abgeschlossenen Körper; „fast alle“ heißt: für H in einer dichten offenen Teilmenge des dualen projektiven Raums." },
    { id: "rrcurve", type: "satz", area: "kurven", field: [14], msc: ["14H", "14C"], name: "Riemann-Roch für Kurven", year: 1865,
      credit: { person: ["Bernhard Riemann", "Gustav Roch"], year: 1865 },
      form: "general", short: "Für jede glatte projektive Kurve C vom Geschlecht g mit kanonischem Divisor K und jeden Divisor D auf C gilt:",
      formula: String.raw`\ell(D) - \ell(K - D) = \deg D + 1 - g`,
      text: "Für einen Divisor D auf einer glatten projektiven Kurve vom Geschlecht g mit kanonischem Divisor K." },
    { id: "canon", type: "satz", area: "kurven", field: [14], msc: ["14H"], name: "Kanonischer Divisor",
      form: "general", short: "Für jede glatte projektive Kurve C vom Geschlecht g mit kanonischem Divisor K gilt:",
      formula: String.raw`\begin{aligned} \deg K &= 2g - 2 \\ \ell(K) &= g \end{aligned}`,
      text: "Korollar zu Riemann-Roch." },
    { id: "hurwitz", type: "satz", area: "kurven", field: [14], msc: ["14H"], name: "Riemann-Hurwitz-Formel",
      credit: { person: ["Bernhard Riemann", "Adolf Hurwitz"], year: 1891 },
      form: "general", short: "Für jeden endlichen separablen Morphismus f: X → Y glatter projektiver Kurven vom Grad n mit Verzweigungsdivisor R gilt:",
      formula: String.raw`2g_X - 2 = n\,(2g_Y - 2) + \deg R`,
      text: "Für einen endlichen separablen Morphismus f: X → Y glatter projektiver Kurven vom Grad n mit Verzweigungsdivisor R; bei zahmer Verzweigung ist deg R = Σ (e<sub>P</sub> − 1)." },
    { id: "adjunktion", type: "satz", area: "kurven", field: [14], msc: ["14J"], name: "Adjunktionsformel", originUnclear: true,
      form: "general", short: "Für jede glatte irreduzible Kurve C auf einer glatten projektiven Fläche X mit kanonischem Divisor K<sub>X</sub> gilt:",
      formula: String.raw`2g(C) - 2 = C \cdot (C + K_X)`,
      text: "Für eine glatte Kurve C auf einer glatten projektiven Fläche X." },
    { id: "rrsurface", type: "satz", area: "kurven", field: [14], msc: ["14J", "14C"], name: "Riemann-Roch für Flächen",
      form: "general", short: "Für jede glatte projektive Fläche X mit kanonischem Divisor K und jeden Divisor D auf X gilt:",
      formula: String.raw`\chi\big(\mathcal O_X(D)\big) = \tfrac12\, D\cdot(D - K) + \chi(\mathcal O_X)`,
      text: "Für einen Divisor D auf einer glatten projektiven Fläche X." },
    { id: "hodgeindex", type: "satz", area: "kurven", field: [14], msc: ["14J", "14C"], name: "Hodge-Indexsatz",
      form: "general", short: "Für jede glatte projektive Fläche, jeden amplen Divisor H und jeden Divisor D mit D · H = 0, der nicht numerisch äquivalent zu 0 ist, gilt:",
      formula: String.raw`D^2 < 0`,
      text: "Auf einer glatten projektiven Fläche: Die Schnittform auf der Néron-Severi-Gruppe hat Signatur (1, ρ − 1)." },

    // ------------------------------------------------------------ Riemann–Roch and intersection
    // theory
    { id: "chow", type: "satz", area: "rr", field: [14], msc: ["14C"], name: "Existenz des Schnittprodukts (Chow-Ring)",
      form: "existence", short: "Zu jeder glatten quasiprojektiven Varietät X gibt es ein kommutatives graduiertes Produkt auf A<sup>*</sup>(X), sodass für eigentlich schneidende V, W gilt:",
      formula: String.raw`[V]\cdot[W] = \textstyle\sum_Z i(Z; V \cdot W)\,[Z]`,
      text: "Für eine glatte quasiprojektive Varietät X gibt es ein Schnittprodukt, das die Chow-Gruppe A<sup>*</sup>(X) = ⊕ A<sup>k</sup>(X) zu einem kommutativen graduierten Ring macht. Schneiden sich die Untervarietäten V und W eigentlich, so ist [V]·[W] der Zyklus von V ∩ W mit den Schnittvielfachheiten: Z durchläuft die Komponenten von V ∩ W, und i(Z; V·W) ist die Schnittvielfachheit entlang Z." },
    { id: "grr", type: "satz", area: "rr", field: [14], msc: ["14C"], name: "Grothendieck-Riemann-Roch", year: 1957,
      form: "general", short: "Für jeden eigentlichen Morphismus f: X → Y glatter quasiprojektiver Varietäten und jedes x ∈ K(X) gilt in A(Y) ⊗ ℚ:",
      formula: String.raw`\operatorname{ch}(f_! x)\cdot\operatorname{td}(T_Y) = f_*\big(\operatorname{ch}(x)\cdot\operatorname{td}(T_X)\big)`,
      text: "Für einen eigentlichen Morphismus f: X → Y glatter quasiprojektiver Varietäten und x ∈ K(X), in A(Y)⊗ℚ." },
    { id: "hrr", type: "satz", area: "rr", field: [14], msc: ["14C"], name: "Hirzebruch-Riemann-Roch", year: 1954,
      form: "general", short: "Für jedes Vektorbündel E auf einer glatten projektiven Varietät X gilt:",
      formula: String.raw`\chi(X,\mathcal E) = \int_X \operatorname{ch}(\mathcal E)\,\operatorname{td}(T_X)`,
      text: "Für ein Vektorbündel E auf einer glatten projektiven Varietät X." },

    // ------------------------------------------------------------ Complex geometry
    { id: "gaga", type: "satz", area: "komplex", field: [14, 32], msc: ["14F", "32C"], name: "GAGA", year: 1956,
      form: "general", short: "Für jedes projektive Schema X über ℂ, jede kohärente Garbe F auf X und jedes i gilt, mit der Analytisierung F ↦ F<sup>an</sup>:",
      formula: String.raw`\begin{gathered} \operatorname{Coh}(X) \simeq \operatorname{Coh}(X^{\mathrm{an}}) \\ H^i(X,\mathcal F) \cong H^i(X^{\mathrm{an}},\mathcal F^{\mathrm{an}}) \end{gathered}`,
      text: "Für X projektiv über ℂ: Kohärente algebraische und kohärente analytische Garben entsprechen einander, mit derselben Kohomologie." },
    { id: "chowthm", type: "satz", area: "komplex", field: [14, 32], msc: ["14A", "32C"], name: "Satz von Chow", year: 1949,
      form: "general", short: "Für jede abgeschlossene analytische Teilmenge Z des komplexen projektiven Raums ℙ<sup>n</sup>(ℂ) gilt:",
      formula: String.raw`Z \text{ algebraisch}`,
      text: "Eine Teilmenge, die lokal durch holomorphe Gleichungen gegeben und abgeschlossen ist, ist schon die Nullstellenmenge endlich vieler homogener Polynome." },
    { id: "hodgezerl", type: "satz", area: "komplex", field: [32, 14], msc: ["32Q", "14C"], name: "Hodge-Zerlegung", year: 1941,
      form: "general", short: "Für jede kompakte Kähler-Mannigfaltigkeit X, etwa eine glatte projektive Varietät über ℂ, und alle k, p, q ≥ 0 gilt:",
      formula: String.raw`\begin{gathered} H^k(X,\mathbb C) = \bigoplus_{p+q=k} H^{p,q} \\ \overline{H^{p,q}} = H^{q,p} \\ H^{p,q} \cong H^q(X,\Omega^p) \end{gathered}`,
      text: "Für X kompakt Kähler, insbesondere glatt projektiv über ℂ." },
    { id: "degen", type: "satz", area: "komplex", field: [14], msc: ["14F"], name: "Entartung von Hodge nach de Rham",
      form: "general", short: "Für jede glatte projektive Varietät X über einem Körper k der Charakteristik 0 gilt:",
      formula: String.raw`E_1^{p,q} = H^q(X,\Omega^p_X) \;\Longrightarrow\; H^{p+q}_{\mathrm{dR}}(X/k) \text{ entartet bei } E_1`,
      text: "Für X glatt projektiv über einem Körper der Charakteristik 0. Rein algebraische Aussage." },
    { id: "deligneillusie", type: "satz", area: "komplex", field: [14], msc: ["14F"], name: "Zerlegung von Deligne-Illusie", year: 1987,
      form: "general", short: "Für jede glatte Varietät X über einem perfekten Körper k der Charakteristik p mit Hebung nach W<sub>2</sub>(k) gilt, mit dem Frobenius F: X → X′:",
      formula: String.raw`\tau_{<p} F_* \Omega^\bullet_{X} \;\simeq\; \textstyle\bigoplus_{i<p} \Omega^i_{X'}[-i]`,
      text: "Für X glatt über einem perfekten Körper der Charakteristik p mit Hebung nach W₂(k); X′ ist der Frobenius-Twist." },
    { id: "kodaira", type: "satz", area: "komplex", field: [14, 32], msc: ["14F", "32L"], name: "Kodaira-Verschwindungssatz", year: 1953,
      form: "general", short: "Für jede glatte projektive Varietät X über einem Körper der Charakteristik 0, jedes ample Geradenbündel L auf X und jedes i > 0 gilt:",
      formula: String.raw`H^i(X, \omega_X \otimes L) = 0`,
      text: "Für X glatt projektiv über ℂ (oder über einem Körper der Charakteristik 0)." },
    { id: "lefschetzhyper", type: "satz", area: "komplex", field: [14, 55], msc: ["14F", "55N"], name: "Lefschetz-Hyperebenensatz",
      form: "general", short: "Für jede glatte projektive Varietät X der Dimension n über ℂ, jeden glatten Hyperebenenschnitt Y und jedes i ≤ n − 1 gilt:",
      formula: String.raw`H^i(X,\mathbb Z) \to H^i(Y,\mathbb Z) \text{ ist } \begin{cases} \text{ein Isomorphismus} & i < n-1 \\ \text{injektiv} & i = n-1 \end{cases}`,
      text: "Für X glatt projektiv über ℂ der Dimension n und einen glatten Hyperebenenschnitt Y." },
    { id: "hardlef", type: "satz", area: "komplex", field: [14, 32], msc: ["14C", "32Q"], name: "Harter Lefschetz-Satz",
      credit: { person: ["Solomon Lefschetz"], year: 1924 },
      form: "general", short: "Für jede n-dimensionale glatte projektive Varietät X über ℂ, das Produkt L mit der Klasse eines Hyperebenenschnitts und jedes k ≤ n gilt:",
      formula: String.raw`L^k : H^{n-k}(X,\mathbb Q) \xrightarrow{\;\sim\;} H^{n+k}(X,\mathbb Q)`,
      text: "L ist das Produkt mit der Klasse eines Hyperebenenschnitts; X glatt projektiv der Dimension n. In der ℓ-adischen Fassung auch über endlichen Körpern." },

    // ------------------------------------------------------------ Étale cohomology and the Weil
    // conjectures
    { id: "eigbw", type: "satz", area: "etale", field: [14], msc: ["14F"], name: "Eigentlicher Basiswechsel", year: 1964,
      form: "general", short: "Für jeden eigentlichen Morphismus f: X → S, jede étale Torsionsgarbe F auf X, jeden geometrischen Punkt s̄ von S und jedes i gilt:",
      formula: String.raw`\big(R^i f_* \mathcal F\big)_{\bar s} \;\cong\; H^i\big(X_{\bar s}, \mathcal F\big)`,
      text: "Für f: X → S eigentlich und F eine Torsionsgarbe in der étalen Topologie." },
    { id: "poincare", type: "satz", area: "etale", field: [14], msc: ["14F"], name: "Poincaré-Dualität (étale)", year: 1964,
      form: "general", short: "Für jede n-dimensionale glatte eigentliche Varietät X über einem algebraisch abgeschlossenen Körper k, jede Primzahl ℓ ≠ char k und alle i, m gilt:",
      formula: String.raw`H^i(X,\mathbb Z/\ell^m) \times H^{2n-i}\big(X,\mathbb Z/\ell^m(n)\big) \to \mathbb Z/\ell^m \text{ perfekt}`,
      text: "Für X glatt eigentlich der Dimension n über einem algebraisch abgeschlossenen Körper, ℓ verschieden von der Charakteristik." },
    { id: "riemexist", type: "satz", area: "etale", field: [14], msc: ["14F"], name: "Riemannscher Existenzsatz", year: 1961,
      form: "general", short: "Für jedes zusammenhängende Schema X von endlichem Typ über ℂ gilt:",
      formula: String.raw`\begin{gathered} \operatorname{F\acute Et}(X) \simeq \operatorname{FCov}\big(X(\mathbb C)\big) \\ \pi_1^{\mathrm{\acute et}}(X) \cong \widehat{\pi_1\big(X(\mathbb C)\big)} \end{gathered}`,
      text: "Für X von endlichem Typ über ℂ (SGA 1, Exposé XII): Endliche étale Überlagerungen entsprechen endlichen topologischen Überlagerungen." },
    { id: "vergleich", type: "satz", area: "etale", field: [14], msc: ["14F"], name: "Vergleichssatz", year: 1964,
      form: "general", short: "Für jedes Schema X von endlichem Typ über ℂ und alle i ≥ 0, n ≥ 1 gilt:",
      formula: String.raw`H^i_{\mathrm{\acute et}}(X,\mathbb Z/n) \;\cong\; H^i\big(X(\mathbb C),\mathbb Z/n\big)`,
      text: "Für X von endlichem Typ über ℂ stimmt die étale Kohomologie mit endlichen Koeffizienten mit der singulären Kohomologie des komplexen Raums X(ℂ) überein." },
    { id: "spur", type: "satz", area: "etale", field: [14], msc: ["14F", "14G"], name: "Lefschetz-Spurformel", year: 1964,
      form: "general", short: "Für jedes separierte Schema X von endlichem Typ über 𝔽<sub>q</sub>, jede Primzahl ℓ ∤ q und jedes m ≥ 1 gilt, mit dem Frobenius F:",
      formula: String.raw`\#X(\mathbb F_{q^m}) = \sum_i (-1)^i \operatorname{Tr}\big(F^m \mid H^i_c(X_{\bar{\mathbb F}_q},\mathbb Q_\ell)\big)`,
      text: "Punkte zählen heißt Spuren des Frobenius berechnen." },
    { id: "lefbuschel", type: "satz", area: "etale", field: [14], msc: ["14D", "14F"], name: "Lefschetz-Büschel und Picard-Lefschetz-Formel",
      credit: { person: ["Émile Picard", "Solomon Lefschetz"], year: 1924 },
      form: "general", short: "Für jedes Lefschetz-Büschel, jeden verschwindenden Zyklus δ mit Monodromie σ und jede Klasse x der mittleren Kohomologie gilt:",
      formula: String.raw`\sigma(x) = x \pm (x,\delta)\,\delta`,
      text: "Die Monodromie eines Lefschetz-Büschels wirkt auf der mittleren Kohomologie durch Transvektionen an den verschwindenden Zyklen δ." },
    { id: "weilrat", type: "satz", area: "etale", field: [14, 11], msc: ["14G", "11G"], name: "Rationalität und Funktionalgleichung der Zetafunktion",
      form: "existence", short: "Zu jeder glatten projektiven Varietät X der Dimension n über 𝔽<sub>q</sub> mit Euler-Charakteristik χ gibt es Polynome P<sub>i</sub> mit:",
      formula: String.raw`\begin{aligned} Z(X,t) &= \prod_{i=0}^{2n} P_i(t)^{(-1)^{i+1}} \\ Z\!\left(\tfrac{1}{q^n t}\right) &= \pm\, q^{n\chi/2}\, t^{\chi}\, Z(t) \end{aligned}`,
      text: "Für X glatt projektiv der Dimension n über 𝔽<sub>q</sub>. P<sub>i</sub> ist das charakteristische Polynom des Frobenius auf der étalen Kohomologie H<sup>i</sup>(X̄, ℚ<sub>ℓ</sub>) und hat zunächst Koeffizienten in ℚ<sub>ℓ</sub>. Dass die P<sub>i</sub> ganzzahlige Koeffizienten haben und nicht von ℓ abhängen, folgt erst aus Delignes Beweis der Riemannschen Vermutung (1974). Teil der Weil-Vermutungen." },
    { id: "weilrh", type: "satz", area: "etale", field: [14, 11], msc: ["14G", "11G"], name: "Riemannsche Vermutung über endlichen Körpern", year: 1974,
      form: "general", short: "Für jede glatte projektive Varietät X über 𝔽<sub>q</sub>, die Polynome P<sub>i</sub> ihrer Zetafunktion und jede Einbettung der α<sub>ij</sub> in ℂ gilt:",
      formula: String.raw`\begin{gathered} P_i(t) = \prod_j (1 - \alpha_{ij} t) \\ |\alpha_{ij}| = q^{i/2} \end{gathered}`,
      text: "Der schwierigste Teil der Weil-Vermutungen, für alle komplexen Einbettungen der α." },
    { id: "weilcurves", type: "satz", area: "etale", field: [14, 11], msc: ["14G", "11G"], name: "Hasse-Weil-Schranke", year: 1948,
      form: "general", short: "Für jede glatte projektive, geometrisch irreduzible Kurve C vom Geschlecht g über 𝔽<sub>q</sub> gilt:",
      formula: String.raw`\big|\#C(\mathbb F_q) - (q+1)\big| \le 2g\sqrt q`,
      text: "Riemannsche Vermutung für Kurven über endlichen Körpern. Verallgemeinert den Satz von Hasse (1933) von Geschlecht 1 auf beliebiges Geschlecht." },
    { id: "dualisog", type: "satz", area: "arith", field: [14], msc: ["14H"], name: "Duale Isogenie",
      form: "existence_unique", short: "Zu jeder Isogenie φ: E → E′ elliptischer Kurven gibt es genau ein φ̂: E′ → E mit der ersten Gleichung; die zweite gilt für α, β ∈ End(E):",
      formula: String.raw`\begin{aligned} \hat\varphi \circ \varphi &= [\deg \varphi] \\ \deg(\alpha + \beta) + \deg(\alpha - \beta) &= 2\deg\alpha + 2\deg\beta \end{aligned}`,
      text: "Zu jeder Isogenie φ einer elliptischen Kurve gibt es eine duale Isogenie φ̂. Daraus folgt: Der Grad ist eine positiv definite quadratische Form auf dem Endomorphismenring End(E)." },
    { id: "frobpunkt", type: "satz", area: "arith", field: [14, 11], msc: ["14H", "11G"], name: "Punktzahl als Grad",
      form: "general", short: "Für jede elliptische Kurve E über 𝔽<sub>q</sub> mit Frobenius-Endomorphismus φ<sub>q</sub> gilt:",
      formula: String.raw`\#E(\mathbb F_q) = \deg(1 - \varphi_q)`,
      text: "φ<sub>q</sub> ist der Frobenius-Endomorphismus (x, y) ↦ (x<sup>q</sup>, y<sup>q</sup>). Die Punkte über 𝔽<sub>q</sub> sind genau seine Fixpunkte, also der Kern von 1 − φ<sub>q</sub>; weil 1 − φ<sub>q</sub> separabel ist, ist die Größe des Kerns gleich dem Grad." },
    { id: "hasse", type: "satz", area: "arith", field: [11, 14], msc: ["11G", "14H"], name: "Satz von Hasse", year: 1933,
      form: "general", short: "Für jede elliptische Kurve E über einem endlichen Körper 𝔽<sub>q</sub> gilt:",
      formula: String.raw`\big|\#E(\mathbb F_q) - (q+1)\big| \le 2\sqrt q`,
      text: "Für eine elliptische Kurve E über 𝔽<sub>q</sub>. Der Fall g = 1 der Hasse-Weil-Schranke." },

    // ------------------------------------------------------------ Birational geometry
    { id: "zmt", type: "satz", area: "biration", field: [14], msc: ["14E"], name: "Zariskis Hauptsatz", year: 1943,
      form: "general", short: "Für jeden birationalen projektiven Morphismus f: X → Y von Varietäten mit Y normal und jeden Punkt y ∈ Y gilt:",
      formula: String.raw`f^{-1}(y) \text{ zusammenhängend}`,
      text: "Zariski (1943); in Grothendiecks Fassung: Ein quasi-endlicher birationaler Morphismus in eine normale Varietät ist eine offene Immersion." },
    { id: "hironaka", type: "satz", area: "biration", field: [14], msc: ["14E"], name: "Auflösung der Singularitäten", year: 1964,
      form: "existence", short: "Zu jeder Varietät X über einem Körper der Charakteristik 0 gibt es einen Morphismus π: X̃ → X mit:",
      formula: String.raw`\pi \text{ eigentlich, birational},\; \tilde X \text{ glatt}`,
      text: "Für jede Varietät über einem Körper der Charakteristik 0; π ist ein Isomorphismus über dem glatten Ort." },

    // ------------------------------------------------------------ Enumerative geometry
    { id: "geraden27", type: "satz", area: "abzaehl", field: [14], msc: ["14N", "14J"], name: "27 Geraden auf der kubischen Fläche", year: 1849,
      form: "general", short: "Für jede glatte kubische Fläche S im komplexen projektiven Raum ℙ<sup>3</sup> gilt:",
      formula: String.raw`\#\{\text{Geraden } \ell \subset S\} = 27`,
      text: "Über ℝ enthält eine glatte kubische Fläche 27, 15, 7 oder 3 reelle Geraden (Schläfli 1858)." },
    { id: "kegel3264", type: "satz", area: "abzaehl", field: [14], msc: ["14N"], name: "3264 Kegelschnitte", year: 1864,
      form: "equation", short: "Für je fünf Kegelschnitte C<sub>1</sub>, …, C<sub>5</sub> in allgemeiner Lage in der komplexen projektiven Ebene gilt:",
      formula: String.raw`\#\{\text{Kegelschnitte, die } C_1, \dots, C_5 \text{ berühren}\} = 3264`,
      text: "Steiner hatte 1848 die Zahl 6⁵ = 7776 angegeben. Die strenge Begründung solcher Zählungen war Hilberts 15. Problem." },
    { id: "quintik", type: "satz", area: "abzaehl", field: [14, 81], msc: ["14N", "14J", "81T"], name: "Kurvenzahlen der Quintik", year: 1996,
      form: "equation", short: "Für die Instantonzahlen n<sub>d</sub> der rationalen Kurven vom Grad d auf einer allgemeinen quintischen Dreifaltigkeit im ℙ<sup>4</sup> gilt:",
      formula: String.raw`\begin{aligned} n_1 &= 2875 \\ n_2 &= 609\,250 \\ n_3 &= 317\,206\,375 \\ &\;\;\vdots \end{aligned}`,
      text: "Die Instantonzahlen n<sub>d</sub> gewinnt man aus den Gromov-Witten-Invarianten der Quintik, indem man die Beiträge mehrfacher Überlagerungen abzieht. Dass n<sub>d</sub> die tatsächliche Anzahl rationaler Kurven vom Grad d ist, ist nur für kleine Grade bewiesen (Clemens-Vermutung); für d = 1 ist es klassisch, für d = 2 bewies es Katz (1986), für d = 3 Ellingsrud und Strømme (1995)." },

    // ------------------------------------------------------------ Arithmetic geometry
    { id: "hoehen", type: "satz", area: "arith", field: [11, 14], msc: ["11G", "14G"], name: "Höhentheorie",
      form: "finitely_many", short: "Für jede abelsche Varietät A über einem Zahlkörper K mit kanonischer Höhe ĥ und alle d, B gilt:",
      formula: String.raw`\#\{P \in A(\bar K) : [K(P):K] \le d,\ \hat h(P) \le B\} < \infty`,
      text: "Die kanonische Höhe ĥ ist eine quadratische Form auf A(K̄); Punkte beschränkten Grades und beschränkter Höhe sind endlich viele." },
    { id: "mordellweil", type: "satz", area: "arith", field: [11, 14], msc: ["11G", "14K"], name: "Satz von Mordell-Weil", year: 1928,
      credit: { person: ["Louis Mordell", "André Weil"], year: 1928 },
      classification: { objects: "Gruppen A(K) der rationalen Punkte einer abelschen Varietät A über einem Zahlkörper K", classes: "bis auf Isomorphie bestimmt durch den Rang r und die endliche Torsionsgruppe: ℤ<sup>r</sup> ⊕ A(K)<sub>tors</sub>" },
      form: "existence", short: "Zu jeder abelschen Varietät A über einem Zahlkörper K gibt es ein r ≥ 0 und eine endliche abelsche Gruppe T mit:",
      formula: String.raw`A(K) \cong \mathbb Z^r \oplus T`,
      text: "Die Gruppe A(K) der rationalen Punkte ist endlich erzeugt; T ist ihre Torsionsgruppe A(K)<sub>tors</sub>, r ihr Rang." },
    // Class field theory is resolved into theorems in ../Beispiel Arithmetische Geometrie (B41); only the density
    // theorem is needed here, for Faltings' proof.
    { id: "chebotarev", type: "satz", area: "arith", field: [11], msc: ["11R"], name: "Dichtesatz von Tschebotarjow", year: 1926,
      form: "density", short: "Für jede endliche Galois-Erweiterung L/K von Zahlkörpern mit Galois-Gruppe G und jede Konjugationsklasse C von G gilt:",
      formula: String.raw`\delta\bigl(\{\mathfrak p : \operatorname{Frob}_{\mathfrak p} \in C\}\bigr) = \frac{\lvert C \rvert}{\lvert G \rvert}`,
      text: "Für jede endliche Galois-Erweiterung L/K von Zahlkörpern mit Galois-Gruppe G und jede Konjugationsklasse C von G. Die Menge besteht aus den in L unverzweigten Primidealen 𝔭 von K, deren Frobenius-Klasse C ist; δ ist ihre Dichte unter allen Primidealen von K. Jede Konjugationsklasse kommt also als Frobenius-Klasse vor, und zwar mit dem Anteil, den sie an der Gruppe hat. Für K = ℚ und L = ℚ(ζ<sub>q</sub>) ergibt sich der Satz von Dirichlet über Primzahlen in Restklassen." },
    { id: "shafarevich", type: "satz", area: "arith", field: [11, 14], msc: ["11G", "14K"], name: "Shafarevich-Vermutung (Faltings)", year: 1983,
      form: "finitely_many", short: "Für jeden Zahlkörper K, jede endliche Menge S von Stellen von K und jedes g ≥ 1 gilt:",
      formula: String.raw`\#\{A/K \text{ abelsch},\, \dim A = g,\, \text{gute Reduktion außerhalb } S\}/\!\cong \;<\; \infty`,
      text: "Faltings bewies die Aussage zusammen mit der Tate-Vermutung für Isogenien abelscher Varietäten über Zahlkörpern." },
    { id: "faltings", type: "satz", area: "arith", field: [11, 14], msc: ["11G", "14G"], name: "Satz von Faltings (Mordell-Vermutung)", year: 1983,
      form: "finitely_many", short: "Für jede glatte projektive Kurve C vom Geschlecht g ≥ 2 über einem Zahlkörper K gilt:",
      formula: String.raw`\#C(K) < \infty`,
      text: "Für eine glatte projektive Kurve C über einem Zahlkörper K." },

    // ------------------------------------------------------------ Conjectures (only with the switch „mit Vermutungen“)
    { id: "hodgeverm", type: "vermutung", state: "teilweise", area: "komplex", field: [14], msc: ["14C"], name: "Hodge-Vermutung", large: "m2",
      form: "general", short: "Vermutung: Für jede glatte projektive Varietät X über ℂ und jedes p ≥ 0 gilt, wobei Z die algebraischen Untervarietäten von X durchläuft:",
      formula: String.raw`H^{2p}(X,\mathbb Q) \cap H^{p,p}(X) \;=\; \operatorname{span}_{\mathbb Q}\big\{[Z] : \operatorname{codim} Z = p\big\}`,
      text: "Für X glatt projektiv über ℂ. Jede rationale Kohomologieklasse vom Typ (p, p) soll eine rationale Linearkombination von Klassen algebraischer Untervarietäten sein; die umgekehrte Inklusion ist leicht. Bewiesen ist der Fall p = 1 (Lefschetz-(1,1)-Satz) und mit dem harten Lefschetz-Satz der Fall p = n − 1; damit gilt die Vermutung für alle Varietäten bis zur Dimension 3. Mit ganzzahligen statt rationalen Koeffizienten ist die Aussage falsch (Atiyah und Hirzebruch 1962). Millennium-Problem (2000)." },
    { id: "tateverm", type: "vermutung", state: "teilweise", area: "etale", field: [14, 11], msc: ["14C", "11G"], name: "Tate-Vermutung",
      form: "general", short: "Vermutung: Für jede glatte projektive Varietät X über einem endlich erzeugten Körper k, jede Primzahl ℓ ≠ char k und jedes p gilt:",
      formula: String.raw`\operatorname{cl}: \mathcal Z^p(X) \otimes \mathbb Q_\ell \;\twoheadrightarrow\; H^{2p}\big(X_{\bar k}, \mathbb Q_\ell(p)\big)^{\operatorname{Gal}(\bar k/k)}`,
      text: "Für X glatt projektiv über einem endlich erzeugten Körper k und eine Primzahl ℓ, die von der Charakteristik verschieden ist. Jede ℓ-adische Kohomologieklasse, die unter der Galois-Gruppe invariant ist, soll von algebraischen Zyklen auf X kommen. Bewiesen unter anderem für Divisoren auf abelschen Varietäten (Tate 1966 über endlichen Körpern, Faltings 1983 über Zahlkörpern) und für K3-Flächen." },
    { id: "stdlef", type: "vermutung", state: "teilweise", area: "etale", field: [14], msc: ["14C", "14F"], name: "Standardvermutung vom Lefschetz-Typ",
      form: "general", short: "Vermutung: Für jede n-dimensionale glatte projektive Varietät X über einem algebraisch abgeschlossenen Körper und jedes i ≤ n/2 gilt:",
      formula: String.raw`L^{\,n-2i}: A^i(X) \xrightarrow{\;\sim\;} A^{n-i}(X)`,
      text: "Für X glatt projektiv der Dimension n über einem algebraisch abgeschlossenen Körper. A<sup>i</sup>(X) sind die algebraischen Zyklen der Kodimension i mit rationalen Koeffizienten modulo homologischer Äquivalenz, L ist der Schnitt mit einem Hyperebenenschnitt. Gleichwertig: Der Umkehroperator Λ aus dem harten Lefschetz-Satz wird von einem algebraischen Zyklus auf X × X induziert. Bewiesen für Kurven, Flächen und abelsche Varietäten (Lieberman, Kleiman 1968). In Charakteristik 0 folgt sie aus der Hodge-Vermutung." },
    { id: "stdhodge", type: "vermutung", state: "teilweise", area: "etale", field: [14], msc: ["14C", "14F"], name: "Standardvermutung vom Hodge-Typ",
      form: "general", short: "Vermutung: Für jede n-dimensionale glatte projektive Varietät X, jedes i ≤ n/2 und jede primitive Klasse x ≠ 0 in A<sup>i</sup>(X) gilt:",
      formula: String.raw`(-1)^i \,\big\langle x,\; L^{\,n-2i} x \big\rangle > 0`,
      text: "Die Schnittform auf den primitiven algebraischen Klassen soll ein festes Vorzeichen haben, so wie es die Hodge-Riemann-Bilinearrelationen für komplexe Varietäten verlangen. Für Flächen ist sie der Hodge-Indexsatz, in jeder Charakteristik. In Charakteristik 0 folgt sie aus der Hodge-Theorie. In positiver Charakteristik ist sie nur in Spezialfällen bekannt." },
    { id: "auflp", type: "vermutung", state: "teilweise", area: "biration", field: [14], msc: ["14E", "14B"], name: "Auflösung der Singularitäten in Charakteristik p",
      form: "existence", short: "Vermutung: Zu jeder Varietät X über einem Körper der Charakteristik p > 0 gibt es einen Morphismus π: X̃ → X mit:",
      formula: String.raw`\pi \text{ eigentlich, birational},\; \tilde X \text{ glatt}`,
      text: "Für jede Varietät X über einem Körper positiver Charakteristik. Bewiesen für Flächen (Abhyankar 1956) und für Dreifaltigkeiten (Abhyankar 1966 für p > 5; Cossart und Piltant 2008 und 2009 für alle p). Hironakas Verfahren lässt sich nicht übertragen, weil es in Charakteristik p keine Hyperflächen maximalen Kontakts geben muss. Eine schwächere Aussage bewies de Jong (1996): Es gibt eine generisch endliche statt einer birationalen Abbildung von einer glatten Varietät auf X (Alteration)." },
    { id: "bombierilang", type: "vermutung", state: "teilweise", area: "arith", field: [11, 14], msc: ["11G", "14G"], name: "Vermutung von Bombieri und Lang",
      form: "general", short: "Vermutung: Für jede Varietät X von allgemeinem Typ über einem Zahlkörper K gilt, mit dem Zariski-Abschluss:",
      formula: String.raw`\overline{X(K)} \neq X`,
      text: "Die rationalen Punkte sollen nicht Zariski-dicht in X liegen. Eine Kurve ist genau dann von allgemeinem Typ, wenn ihr Geschlecht mindestens 2 ist. Für Kurven ist die Vermutung deshalb der Satz von Faltings. Für Untervarietäten abelscher Varietäten folgt sie aus einem weiteren Satz von Faltings (1991)." },
    { id: "uniform", type: "vermutung", state: "bedingt", area: "arith", field: [11, 14], msc: ["11G", "14H"], name: "Gleichmäßige Schranke für rationale Punkte",
      form: "existence", short: "Vermutung: Zu jedem Zahlkörper K und jedem g ≥ 2 gibt es eine Zahl B(g, K), sodass für jede Kurve C vom Geschlecht g über K gilt:",
      formula: String.raw`\#C(K) \le B(g, K)`,
      text: "Die Zahl der rationalen Punkte soll nur vom Geschlecht und vom Zahlkörper abhängen, nicht von der Kurve. Bedingt bewiesen ist sie unter der Annahme der Vermutung von Bombieri und Lang. Ohne diese Annahme bewiesen Dimitrov, Gao und Habegger (2021) und Kühne (2021) eine Schranke, die zusätzlich vom Rang der Mordell-Weil-Gruppe der Jacobi-Varietät abhängt." },
    { id: "bsd", type: "vermutung", state: "teilweise", area: "arith", field: [11], msc: ["11G"], name: "Vermutung von Birch und Swinnerton-Dyer", large: "m6",
      form: "general", short: "Vermutung: Für jede elliptische Kurve E über ℚ, mit r dem Rang von E(ℚ), gilt:",
      formula: String.raw`\begin{gathered} \operatorname{rk} E(\mathbb Q) = \operatorname{ord}_{s=1} L(E,s) \\ \lim_{s\to1} \frac{L(E,s)}{(s-1)^{r}} = \frac{\#\text{Ш}\; \Omega_E\, R_E \prod_p c_p}{\#E(\mathbb Q)_{\mathrm{tors}}^2} \end{gathered}`,
      text: "Für eine elliptische Kurve E über ℚ vom Rang r. Die erste Zeile ist die Rangvermutung, die zweite die Formel für den Leitkoeffizienten. Bewiesen ist die Rangvermutung für analytischen Rang 0 und 1 (Gross-Zagier, Kolyvagin). Millennium-Problem (2000). Ausführlich mit Teilresultaten im <a href=\"../arithmetic-geometry/index.html#bsd\">Beispiel Arithmetische Geometrie</a>." },
    // Only with the switch „KI-Beweise“: proof claimed by OpenAI (family 032)
    { id: "hodgecm", type: "vermutung", state: "beansprucht", ki: true, area: "komplex", field: [14], msc: ["14C", "14K"], name: "Hodge-Vermutung für CM-abelsche Varietäten",
      form: "general", short: "Vermutung: Für jede komplexe abelsche Varietät A mit komplexer Multiplikation und jedes p ≥ 0 gilt:",
      formula: String.raw`\operatorname{cl}: \operatorname{CH}^p(A)_{\mathbb Q} \;\twoheadrightarrow\; H^{2p}(A,\mathbb Q) \cap H^{p,p}(A)`,
      text: "Für jede komplexe abelsche Varietät A mit komplexer Multiplikation, das heißt: End(A) ⊗ ℚ enthält eine kommutative halbeinfache ℚ-Algebra der Dimension 2 dim A. Jede rationale Hodge-Klasse soll eine rationale Linearkombination von Klassen algebraischer Zyklen sein. Das ist ein Spezialfall der Hodge-Vermutung. Deligne (1982) hatte gezeigt, dass jede Hodge-Klasse auf einer abelschen Varietät absolut Hodge ist; algebraische Zyklen liefert das nicht. Mit Sätzen von Milne (1999, 2002) folgten daraus die Tate-Vermutung für alle abelschen Varietäten über endlichen Körpern und die Standardvermutung vom Hodge-Typ für abelsche Varietäten in jeder Charakteristik." },
  ],

  // Highlights: theorems regarded as particularly beautiful, interesting or important. The classification is
  // an
  // editorial judgement based on the guiding idea of the project (wonder), not a measurement.
  //   staunen astonishing even without expert knowledge
  //   zusammenhang beautiful because different things fit together
  //   verstehen astonishing only after one has understood it
  //   grundlegend particularly important because much builds on it
  highlightKinds: {
    staunen: "Erstaunlich auch ohne Fachwissen",
    zusammenhang: "Schön, weil Verschiedenes zusammenpasst",
    verstehen: "Erst nach dem Verstehen erstaunlich",
    grundlegend: "Grundlegend: vieles baut darauf auf",
  },
  highlights: {
    geraden27: { kind: "staunen", reason: "Jede glatte kubische Fläche enthält genau 27 Geraden, wie auch immer sie aussieht. Eine feste Zahl, wo man eine Antwort erwarten würde, die von der Fläche abhängt." },
    kegel3264: { kind: "staunen", reason: "Eine konkrete Zahl, an der die erste naheliegende Rechnung (7776) scheiterte. Der Fehler zeigte, warum die abzählende Geometrie eine strenge Grundlage brauchte." },
    quintik: { kind: "staunen", reason: "Die Physik sagte unendlich viele konkrete Zahlen voraus, die Mathematiker erst Jahre später beweisen konnten." },
    hasse: { kind: "staunen", reason: "Man kann sie selbst nachprüfen: Für jede Primzahl liegt die Punktzahl im Streifen p + 1 ± 2√p (siehe Beispiel Hasse-Weil)." },
    weilrh: { kind: "zusammenhang", reason: "Die Zahl der Lösungen modulo p kennt die Topologie der komplexen Mannigfaltigkeit. Zählen und Gestalt hängen zusammen." },
    weilrat: { kind: "zusammenhang", reason: "Die Grade der Polynome in der Zetafunktion sind Betti-Zahlen, wenn die Varietät aus Charakteristik 0 stammt." },
    faltings: { kind: "zusammenhang", reason: "Das Geschlecht, die Zahl der Löcher einer Fläche, entscheidet über die Zahl der rationalen Lösungen: g = 0 keine oder unendlich viele, g = 1 eine endlich erzeugte Gruppe, g ≥ 2 endlich viele." },
    rrcurve: { kind: "zusammenhang", reason: "Verbindet die Zahl der Funktionen mit vorgegebenen Polen (Analysis) mit dem Geschlecht (Topologie); dreimal verallgemeinert (Hirzebruch, Grothendieck, Atiyah-Singer)." },
    bezout: { kind: "zusammenhang", reason: "Die Formel gilt ohne Ausnahme erst, wenn man projektiv, komplex und mit Vielfachheit zählt; jede dieser Erweiterungen ist nötig." },
    gaga: { kind: "zusammenhang", reason: "Auf projektiven Varietäten ist alles Analytische schon algebraisch; zwei verschieden definierte Welten stimmen überein." },
    chowthm: { kind: "zusammenhang", reason: "Eine Teilmenge, die nur durch lokale analytische Gleichungen gegeben ist, ist schon durch Polynome bestimmt." },
    hodgezerl: { kind: "zusammenhang", reason: "Die Topologie einer projektiven Varietät trägt eine zusätzliche starre Struktur; daraus folgt zum Beispiel, dass ungerade Betti-Zahlen gerade sind." },
    deligneillusie: { kind: "verstehen", reason: "Eine Aussage über komplexe Varietäten (Kodaira-Verschwinden) wird bewiesen, indem man in Charakteristik p rechnet." },
    weilcurves: { kind: "verstehen", reason: "Weils Beweis macht aus der Schranke eine Positivitätsaussage über eine Schnittform auf C × C; dieselbe Idee wie bei Hasse, eine Dimension höher." },
    riemexist: { kind: "verstehen", reason: "Endliche Überlagerungen sind algebraisch; im allgemeinen Fall braucht der Beweis die Auflösung der Singularitäten." },
    nullst: { kind: "grundlegend", reason: "Das Wörterbuch zwischen Geometrie und Algebra." },
    pncoh: { kind: "grundlegend", reason: "Fast die gesamte kohärente Theorie geht auf diese eine Rechnung zurück." },
    serredual: { kind: "grundlegend", reason: "Ohne sie gibt es weder Riemann-Roch in der heutigen Form noch die Rechnung mit dem kanonischen Bündel." },
    hironaka: { kind: "grundlegend", reason: "Erlaubt es, in Charakteristik 0 fast immer glatte Varietäten anzunehmen (Fields-Medaille 1970)." },
    spur: { kind: "grundlegend", reason: "Grundlage der étalen Kohomologie, der Weil-Vermutungen und des Langlands-Programms in seiner heutigen Form." },
    kodaira: { kind: "grundlegend", reason: "Wird in birationaler Geometrie, bei Modulräumen und in der komplexen Geometrie ständig benutzt." },
  },

  // Historical events (schema from materials/Entdeckungspfade im Datenmodell.md) for theorems that cannot be
  // assigned to a single year. kind: vermutet, bewiesen, verallgemeinert, uebertragen. `proof` gives the
  // name of a proof of the same theorem in `proofs`. A theorem with `originUnclear: true` has no clear origin.
  // The years come from secondary knowledge and have not yet been checked against sources.
  history: [
    // Events of the new mountains of todo B42 e (2026-10-20); the ids of the Hensel events are shared with the planned
    // node in ../Beispiel Arithmetische Geometrie/daten.js, so that the map shows each event once.
    { id: "h_nak_1951", from: "nakayama", kind: "bewiesen", year: 1951, person: ["Gorō Azumaya", "Tadashi Nakayama"],
      source: "Nakayama, A remark on finitely generated modules, Nagoya Math. J. 3 (1951), 139–140; Azumaya, On maximally central algebras, Nagoya Math. J. 2 (1951)",
      text: "Nakayama stellt einen Satz aus Azumayas Arbeit desselben Jahres als Spezialfall einer allgemeineren Aussage dar. Den Fall von Idealen eines kommutativen Rings kannte schon Krull." },
    { id: "h_cs_1946", from: "cohenseidenberg", kind: "bewiesen", year: 1946, person: ["Irvin S. Cohen", "Abraham Seidenberg"],
      source: "Cohen, Seidenberg, Prime ideals and integral dependence, Bull. Amer. Math. Soc. 52 (1946), 252–261",
      text: "Krull hatte die Sätze für Ringe ohne Nullteiler bewiesen. Cohen und Seidenberg geben einfachere Beweise ohne diese Voraussetzung und Gegenbeispiele zu Going down ohne Normalität." },
    { id: "h_he_hensel04", from: "hensel", kind: "bewiesen", year: 1904, person: ["Kurt Hensel"],
      source: "Hensel, Neue Grundlagen der Arithmetik, J. reine angew. Math. 127 (1904), 51–84",
      text: "Fassung für normierte Polynome über den ganzen p-adischen Zahlen als Aussage über Faktorisierungen (nach Brink, Expositiones Math. 24, 2006)." },
    { id: "h_he_hensel08", from: "hensel", kind: "verallgemeinert", year: 1908, person: ["Kurt Hensel"],
      source: "Hensel, Theorie der algebraischen Zahlen, Teubner, Leipzig 1908",
      text: "Fassung ohne die Voraussetzung, dass das Polynom normiert ist." },
    { id: "h_dim_krull", from: "dim", kind: "bewiesen", year: 1937, circa: true, person: ["Wolfgang Krull"],
      text: "Krulls Dimensionstheorie noetherscher Ringe. Dass die Dimension einer Varietät ihr Transzendenzgrad ist, war in der Schule von Emmy Noether schon vorher geläufig." },

    { id: "h_bertini_1882", from: "bertini", kind: "bewiesen", year: 1882, person: ["Eugenio Bertini"],
      text: "Über den komplexen Zahlen, für lineare Systeme ohne Basispunkte." },
    { id: "h_bertini_zariski", from: "bertini", kind: "verallgemeinert", year: 1944, person: ["Oscar Zariski"],
      text: "Zariski untersucht, welche Fassungen in Charakteristik p gelten. Einige klassische Fassungen werden dort falsch, die Fassung für Hyperebenenschnitte bleibt richtig." },
    { id: "h_bertini_jouanolou", from: "bertini", kind: "verallgemeinert", year: 1983, person: ["Jean-Pierre Jouanolou"],
      text: "„Théorèmes de Bertini et applications“: systematische Darstellung für Schemata." },

    { id: "h_canon_riemann", from: "canon", kind: "bewiesen", year: 1857, person: ["Bernhard Riemann"],
      text: "Riemann zählt die Differentiale erster Gattung (es sind g) und ihre Nullstellen (2g − 2)." },
    { id: "h_canon_roch", from: "canon", kind: "bewiesen", year: 1865, person: ["Gustav Roch"], proof: "Einsetzen",
      text: "Mit dem vollständigen Satz von Riemann-Roch folgen beide Aussagen durch Einsetzen von D = K." },

    { id: "h_hurwitz_riemann", from: "hurwitz", kind: "bewiesen", year: 1857, person: ["Bernhard Riemann"],
      text: "Für Überlagerungen der Zahlenkugel: Das Geschlecht ergibt sich aus der Zahl der Verzweigungspunkte." },
    { id: "h_hurwitz_hurwitz", from: "hurwitz", kind: "verallgemeinert", year: 1891, person: ["Adolf Hurwitz"],
      text: "Für Überlagerungen beliebiger Riemannscher Flächen." },

    { id: "h_adj_brillnoether", from: "adjunktion", kind: "uebertragen", year: 1874, circa: true, person: ["Alexander von Brill", "Max Noether"],
      text: "Adjungierte Kurven als Hilfsmittel der Kurventheorie. Die Formel in ihrer heutigen Gestalt entsteht danach schrittweise in der italienischen Schule; ein einzelner Urheber lässt sich nicht angeben." },

    { id: "h_rrs_noether", from: "rrsurface", kind: "vermutet", year: 1886, person: ["Max Noether"],
      text: "Noether gibt eine Ungleichung für die Dimension linearer Systeme auf Flächen an." },
    { id: "h_rrs_ce", from: "rrsurface", kind: "bewiesen", year: 1896, circa: true, person: ["Guido Castelnuovo", "Federigo Enriques"], proof: "Über Kurven",
      text: "Beweis der Gleichung mit Hilfe von Kurven auf der Fläche, in der Sprache der italienischen Schule." },
    { id: "h_rrs_zariski", from: "rrsurface", kind: "verallgemeinert", year: 1952, person: ["Oscar Zariski"],
      text: "Strenger algebraischer Beweis, auch in Charakteristik p." },

    { id: "h_hi_hodge", from: "hodgeindex", kind: "bewiesen", year: 1937, person: ["W. V. D. Hodge"],
      text: "Analytischer Beweis über harmonische Formen." },
    { id: "h_hi_segre", from: "hodgeindex", kind: "bewiesen", year: 1937, person: ["Beniamino Segre"],
      text: "Algebraischer Beweis, unabhängig von Hodge; Bronowski folgt 1938." },
    { id: "h_hi_groth", from: "hodgeindex", kind: "bewiesen", year: 1958, person: ["Alexander Grothendieck"], proof: "Über Riemann-Roch",
      text: "Kurzer Beweis mit Riemann-Roch für Flächen, in beliebiger Charakteristik." },

    { id: "h_chow_chow", from: "chow", kind: "bewiesen", year: 1956, person: ["Wei-Liang Chow"],
      text: "Chow zeigt mit dem Verschiebungslemma, dass das Schnittprodukt auf Klassen rational äquivalenter Zyklen wohldefiniert ist." },
    { id: "h_chow_fulton", from: "chow", kind: "verallgemeinert", year: 1984, person: ["William Fulton", "Robert MacPherson"], proof: "Fulton",
      text: "Fultons „Intersection Theory“ begründet den Chow-Ring über Deformation zum Normalenkegel, ohne Verschiebungslemma." },

    { id: "h_degen_froehlicher", from: "degen", kind: "bewiesen", year: 1955, person: ["Alfred Frölicher"], proof: "Analytisch",
      text: "Frölicher führt die Spektralsequenz ein; für kompakte Kähler-Mannigfaltigkeiten entartet sie nach der Hodge-Theorie." },
    { id: "h_degen_groth", from: "degen", kind: "uebertragen", year: 1966, person: ["Alexander Grothendieck"],
      text: "Algebraische de-Rham-Kohomologie; mit GAGA wird die Entartung zu einer Aussage über jeden Körper der Charakteristik 0." },
    { id: "h_degen_di", from: "degen", kind: "bewiesen", year: 1987, person: ["Pierre Deligne", "Luc Illusie"], proof: "Deligne-Illusie",
      text: "Erster rein algebraischer Beweis, über Reduktion modulo p." },

    { id: "h_lh_lefschetz", from: "lefschetzhyper", kind: "bewiesen", year: 1924, person: ["Solomon Lefschetz"],
      text: "„L'analysis situs et la géométrie algébrique“. Der topologische Beweis hat Lücken." },
    { id: "h_lh_af", from: "lefschetzhyper", kind: "bewiesen", year: 1959, person: ["Aldo Andreotti", "Theodore Frankel"], proof: "Morse-Theorie",
      text: "Strenger Beweis mit Morse-Theorie; Bott gibt im selben Jahr einen weiteren." },

    { id: "h_hl_lefschetz", from: "hardlef", kind: "vermutet", year: 1924, person: ["Solomon Lefschetz"],
      text: "Lefschetz formuliert den Satz; sein Beweis ist nicht vollständig." },
    { id: "h_hl_hodge", from: "hardlef", kind: "bewiesen", year: 1941, person: ["W. V. D. Hodge"], proof: "Hodge-Theorie",
      text: "Beweis über harmonische Formen auf Kähler-Mannigfaltigkeiten." },
    { id: "h_hl_deligne", from: "hardlef", kind: "verallgemeinert", year: 1980, person: ["Pierre Deligne"], proof: "Weil II (ℓ-adisch)",
      text: "ℓ-adische Fassung über endlichen Körpern (Weil II)." },

    { id: "h_pl_picard", from: "lefbuschel", kind: "bewiesen", year: 1897, circa: true, person: ["Émile Picard", "Georges Simart"],
      text: "Picard-Formel für die Monodromie in Familien von Kurven auf Flächen." },
    { id: "h_pl_lefschetz", from: "lefbuschel", kind: "verallgemeinert", year: 1924, person: ["Solomon Lefschetz"],
      text: "Büschel von Hyperebenenschnitten in beliebiger Dimension." },
    { id: "h_pl_sga7", from: "lefbuschel", kind: "uebertragen", year: 1969, person: ["Pierre Deligne", "Nicholas Katz"], proof: "SGA 7",
      text: "SGA 7 (Seminar 1967 bis 1969): Übertragung in die étale Kohomologie, über beliebigen Körpern." },

    { id: "h_wr_weil", from: "weilrat", kind: "vermutet", year: 1949, person: ["André Weil"],
      text: "Teil der Weil-Vermutungen, gestützt auf Fermat-Hyperflächen, die Weil explizit ausrechnete." },
    { id: "h_wr_dwork", from: "weilrat", kind: "bewiesen", year: 1960, person: ["Bernard Dwork"], proof: "Dwork (p-adisch)",
      text: "Rationalität mit p-adischer Analysis." },
    { id: "h_wr_groth", from: "weilrat", kind: "bewiesen", year: 1964, person: ["Alexander Grothendieck"], proof: "Grothendieck",
      text: "Rationalität und Funktionalgleichung über die Spurformel und Poincaré-Dualität der étalen Kohomologie." },

    { id: "h_di_hasse", from: "dualisog", kind: "bewiesen", year: 1936, person: ["Helmut Hasse"],
      text: "Teil von Hasses Beweis seines Satzes, für elliptische Kurven über beliebigen Körpern. Über ℂ war der Sachverhalt aus der Theorie der elliptischen Funktionen bekannt." },
    { id: "h_di_weil", from: "dualisog", kind: "verallgemeinert", year: 1948, person: ["André Weil"],
      text: "Duale abelsche Varietät und duale Isogenie in beliebiger Dimension." },

    { id: "h_fp_hasse33", from: "frobpunkt", kind: "bewiesen", year: 1933, person: ["Helmut Hasse"],
      text: "Hasse kündigt den Beweis seines Satzes an; der Frobenius-Endomorphismus ist das zentrale Hilfsmittel." },
    { id: "h_fp_hasse36", from: "frobpunkt", kind: "bewiesen", year: 1936, person: ["Helmut Hasse"], proof: "Invariantes Differential",
      text: "Vollständige Veröffentlichung in drei Arbeiten im Crelle-Journal." },

    { id: "h_hoehen_weil", from: "hoehen", kind: "bewiesen", year: 1928, person: ["André Weil"],
      text: "Weils Dissertation: Höhen als Hilfsmittel beim Beweis des Satzes von Mordell-Weil." },
    { id: "h_hoehen_northcott", from: "hoehen", kind: "bewiesen", year: 1949, person: ["D. G. Northcott"],
      text: "Endlichkeit der Punkte beschränkten Grades und beschränkter Höhe." },
    { id: "h_hoehen_nt", from: "hoehen", kind: "verallgemeinert", year: 1965, person: ["André Néron", "John Tate"], proof: "Weil, Néron-Tate",
      text: "Die kanonische Höhe ist eine quadratische Form (Tate um 1962 unveröffentlicht, Néron 1965)." },

    // Former conjectures that are theorems today
    { id: "h_wrh_weil", from: "weilrh", kind: "vermutet", year: 1949, person: ["André Weil"],
      text: "Teil der Weil-Vermutungen: Die Eigenwerte des Frobenius auf der i-ten Kohomologie haben den Betrag q<sup>i/2</sup>. Für Kurven hatte Weil dies 1948 bewiesen." },
    { id: "h_wrh_deligne", from: "weilrh", kind: "bewiesen", year: 1974, person: ["Pierre Deligne"], proof: "Deligne (Weil I)",
      text: "„La conjecture de Weil I“. Der Beweis benutzt die Standardvermutungen nicht." },
    { id: "h_falt_mordell", from: "faltings", kind: "vermutet", year: 1922, person: ["Louis Mordell"],
      text: "Mordell vermutet in derselben Arbeit, in der er die endliche Erzeugtheit für elliptische Kurven beweist, dass Kurven vom Geschlecht mindestens 2 nur endlich viele rationale Punkte haben." },
    { id: "h_falt_faltings", from: "faltings", kind: "bewiesen", year: 1983, person: ["Gerd Faltings"], proof: "Faltings (über Parshin)",
      text: "Über die Shafarevich-Vermutung und Parshins Konstruktion." },
    { id: "h_falt_vojta", from: "faltings", kind: "bewiesen", year: 1991, person: ["Paul Vojta", "Enrico Bombieri"], proof: "Vojta, Bombieri",
      text: "Zweiter Beweis mit diophantischer Approximation." },
    { id: "h_sha_shaf", from: "shafarevich", kind: "vermutet", year: 1962, person: ["Igor Shafarevich"],
      text: "Vortrag auf dem Internationalen Mathematikerkongress in Stockholm, zunächst für Kurven." },
    { id: "h_sha_faltings", from: "shafarevich", kind: "bewiesen", year: 1983, person: ["Gerd Faltings"], proof: "Faltings",
      text: "Zusammen mit der Tate-Vermutung für Isogenien abelscher Varietäten über Zahlkörpern." },

    // Conjectures
    { id: "h_hodge_hodge", from: "hodgeverm", kind: "vermutet", year: 1950, person: ["W. V. D. Hodge"],
      text: "Vortrag auf dem Internationalen Mathematikerkongress in Cambridge (Massachusetts), zunächst mit ganzzahligen Koeffizienten. Atiyah und Hirzebruch zeigten 1962, dass diese Fassung falsch ist." },
    { id: "h_tate_tate", from: "tateverm", kind: "vermutet", year: 1964, person: ["John Tate"],
      text: "„Algebraic cycles and poles of zeta functions“, Vortrag in Woods Hole, veröffentlicht 1965." },
    { id: "h_stdlef_groth", from: "stdlef", kind: "vermutet", year: 1968, person: ["Alexander Grothendieck"],
      text: "„Standard conjectures on algebraic cycles“, Kolloquium in Bombay, veröffentlicht 1969. Kleiman arbeitet die Folgerungen im selben Jahr aus." },
    { id: "h_stdhodge_groth", from: "stdhodge", kind: "vermutet", year: 1968, person: ["Alexander Grothendieck"],
      text: "Zusammen mit der Vermutung vom Lefschetz-Typ. Für Flächen ist sie Grothendiecks eigene Fassung des Hodge-Indexsatzes von 1958." },
    { id: "h_bl_bombieri", from: "bombierilang", kind: "vermutet", year: 1980, circa: true, person: ["Enrico Bombieri", "Serge Lang"],
      text: "Bombieri für Flächen von allgemeinem Typ, Lang in beliebiger Dimension und mit weiteren Fassungen über die Ausnahmemenge." },
    { id: "h_uni_chm", from: "uniform", kind: "bedingt", year: 1997, person: ["Lucia Caporaso", "Joe Harris", "Barry Mazur"], proof: "Caporaso, Harris, Mazur",
      text: "„Uniformity of rational points“: Die Schranke folgt aus der Vermutung von Bombieri und Lang." },
    { id: "h_bsd_bsd", from: "bsd", kind: "vermutet", year: 1965, circa: true, person: ["Bryan Birch", "Peter Swinnerton-Dyer"],
      text: "Nach Rechnungen am EDSAC-Rechner in Cambridge." },
    // AI results (only with the switch „KI-Beweise“); checked against the repository github.com/openai/math, 19 October
    // 2026
    { id: "h_hodgecm_oai", from: "hodgecm", kind: "beansprucht", year: 2026, person: ["OpenAI (internes Modell)"], ki: true,
      text: "Manuskript „The rational Hodge conjecture for CM abelian varieties“ vom 6. Oktober 2026 in der Sammlung github.com/openai/math, Familie 032. Keine Lean-Formalisierung, keine öffentliche Prüfung (Stand 19. Oktober 2026). Drei andere Manuskripte zur Hodge-Theorie derselben Sammlung wurden am 7. Oktober zurückgezogen; dieses gehört nicht dazu und zitiert sie nicht." },

    // Added in todo B26, round 2 (2026-10-20); sources in reports/2026-10-20 Gruppe 6/Bericht B26 Runde 2 AG daten.md
    { id: "h_basis_hilbert", from: "basis", kind: "bewiesen", year: 1890, person: ["David Hilbert"], proof: "Leitkoeffizienten",
      text: "„Über die Theorie der algebraischen Formen“, Mathematische Annalen 36: Jedes Ideal eines Polynomrings in endlich vielen Variablen über einem Körper oder über ℤ ist endlich erzeugt." },
    { id: "h_nn_noether", from: "noethnorm", kind: "bewiesen", year: 1926, person: ["Emmy Noether"],
      text: "„Der Endlichkeitssatz der Invarianten endlicher linearer Gruppen der Charakteristik p“, Nachrichten der Gesellschaft der Wissenschaften zu Göttingen; für unendliche Grundkörper. Der Fall endlicher Körper kam später hinzu." },
    { id: "h_zl_zariski", from: "zariskilemma", kind: "bewiesen", year: 1947, person: ["Oscar Zariski"], proof: "Über Normalisierung",
      text: "„A new proof of Hilbert's Nullstellensatz“, Bulletin of the American Mathematical Society 53." },
    { id: "h_ns_hilbert", from: "nullst", kind: "bewiesen", year: 1893, person: ["David Hilbert"],
      text: "„Über die vollen Invariantensysteme“, Mathematische Annalen 42." },
    { id: "h_krull_krull", from: "krull", kind: "bewiesen", year: 1928, person: ["Wolfgang Krull"],
      text: "„Primidealketten in allgemeinen Ringbereichen“, Sitzungsberichte der Heidelberger Akademie der Wissenschaften." },
    { id: "h_ar_rees", from: "artinrees", kind: "bewiesen", year: 1956, person: ["David Rees"],
      text: "„Two classical theorems of ideal theory“, Proceedings of the Cambridge Philosophical Society 52. Emil Artin fand das Lemma unabhängig; einen Spezialfall kannte Zariski schon vorher." },
    { id: "h_hp_hilbert", from: "hilbpol", kind: "bewiesen", year: 1890, person: ["David Hilbert"],
      text: "In derselben Arbeit wie der Basissatz: Die Hilbert-Funktion eines endlich erzeugten graduierten Moduls ist für große Grade ein Polynom." },
    { id: "h_pn_serre", from: "pncoh", kind: "bewiesen", year: 1955, person: ["Jean-Pierre Serre"], proof: "Čech-Komplex",
      text: "„Faisceaux algébriques cohérents“ (FAC), Annals of Mathematics 61." },
    { id: "h_se_serre", from: "serreendl", kind: "bewiesen", year: 1955, person: ["Jean-Pierre Serre"], proof: "Absteigende Induktion",
      text: "„Faisceaux algébriques cohérents“ (FAC), Annals of Mathematics 61." },
    { id: "h_sd_serre", from: "serredual", kind: "bewiesen", year: 1955, person: ["Jean-Pierre Serre"],
      text: "Für Vektorbündel auf glatten projektiven Varietäten über einem algebraisch abgeschlossenen Körper; das analytische Gegenstück für komplexe Mannigfaltigkeiten in „Un théorème de dualité“, Commentarii Mathematici Helvetici 29." },
    { id: "h_sd_groth", from: "serredual", kind: "verallgemeinert", year: 1957, person: ["Alexander Grothendieck"],
      text: "„Théorèmes de dualité pour les faisceaux algébriques cohérents“, Séminaire Bourbaki: Dualität für beliebige projektive Schemata mit der dualisierenden Garbe." },
    { id: "h_ff_zariski", from: "formfunk", kind: "bewiesen", year: 1951, person: ["Oscar Zariski"],
      text: "„Theory and applications of holomorphic functions on algebraic varieties over arbitrary ground fields“, Memoirs of the American Mathematical Society 5: der Fall i = 0." },
    { id: "h_ff_groth", from: "formfunk", kind: "verallgemeinert", year: 1961, person: ["Alexander Grothendieck"], proof: "Grothendieck",
      text: "EGA III: für alle höheren direkten Bilder Rⁱf<sub>*</sub>." },
    { id: "h_bez_bezout", from: "bezout", kind: "bewiesen", year: 1779, person: ["Étienne Bézout"],
      text: "„Théorie générale des équations algébriques“, für Gleichungen in allgemeiner Lage. Newton hatte die Aussage für ebene Kurven schon 1687 in den Principia (Buch I, Lemma 28) benutzt. Eine genaue Definition der Schnittvielfachheit gab es erst später." },
    { id: "h_rr_riemann", from: "rrcurve", kind: "bewiesen", year: 1857, person: ["Bernhard Riemann"],
      text: "„Theorie der Abel'schen Functionen“, Journal für die reine und angewandte Mathematik 54: die Ungleichung ℓ(D) ≥ deg D + 1 − g." },
    { id: "h_rr_roch", from: "rrcurve", kind: "bewiesen", year: 1865, person: ["Gustav Roch"],
      text: "„Ueber die Anzahl der willkürlichen Constanten in algebraischen Functionen“, Journal für die reine und angewandte Mathematik 64: der Korrekturterm ℓ(K − D) und damit die Gleichung." },
    { id: "h_grr_groth", from: "grr", kind: "bewiesen", year: 1957, person: ["Alexander Grothendieck"], proof: "Zerlegung von f",
      text: "Veröffentlicht von Armand Borel und Jean-Pierre Serre: „Le théorème de Riemann-Roch“, Bulletin de la Société Mathématique de France 86 (1958)." },
    { id: "h_hrr_hirzebruch", from: "hrr", kind: "bewiesen", year: 1954, person: ["Friedrich Hirzebruch"], proof: "Kobordismus",
      text: "„Arithmetic genera and the theorem of Riemann-Roch for algebraic varieties“, Proceedings of the National Academy of Sciences 40; ausführlich in „Neue topologische Methoden in der algebraischen Geometrie“ (1956)." },
    { id: "h_gaga_serre", from: "gaga", kind: "bewiesen", year: 1956, person: ["Jean-Pierre Serre"], proof: "Über ℙⁿ",
      text: "„Géométrie algébrique et géométrie analytique“, Annales de l'Institut Fourier 6." },
    { id: "h_chowthm_chow", from: "chowthm", kind: "bewiesen", year: 1949, person: ["Wei-Liang Chow"], proof: "Analytisch",
      text: "„On compact complex analytic varieties“, American Journal of Mathematics 71." },
    { id: "h_hz_hodge", from: "hodgezerl", kind: "bewiesen", year: 1941, person: ["W. V. D. Hodge"], proof: "Harmonische Formen",
      text: "„The Theory and Applications of Harmonic Integrals“ (Cambridge 1941). Eine Lücke im Existenzbeweis harmonischer Formen schlossen später Weyl und Kodaira." },
    { id: "h_di_di", from: "deligneillusie", kind: "bewiesen", year: 1987, person: ["Pierre Deligne", "Luc Illusie"], proof: "Hebung des Frobenius",
      text: "„Relèvements modulo p² et décomposition du complexe de de Rham“, Inventiones Mathematicae 89." },
    { id: "h_kod_kodaira", from: "kodaira", kind: "bewiesen", year: 1953, person: ["Kunihiko Kodaira"],
      text: "„On a differential-geometric method in the theory of analytic stacks“, Proceedings of the National Academy of Sciences 39." },
    { id: "h_ebw_sga4", from: "eigbw", kind: "bewiesen", year: 1964, person: ["Michael Artin", "Alexander Grothendieck"], proof: "SGA 4",
      text: "SGA 4, Exposés XII und XIII (Seminar 1963/64, veröffentlicht 1973)." },
    { id: "h_pd_sga4", from: "poincare", kind: "bewiesen", year: 1964, person: ["Alexander Grothendieck"], proof: "SGA 4",
      text: "SGA 4 (Seminar 1963/64); ausgearbeitet von Pierre Deligne in Exposé XVIII (veröffentlicht 1973)." },
    { id: "h_vgl_artin", from: "vergleich", kind: "bewiesen", year: 1964, person: ["Michael Artin"], proof: "Artin",
      text: "SGA 4, Exposé XVI (Seminar 1963/64, veröffentlicht 1973)." },
    { id: "h_spur_groth", from: "spur", kind: "bewiesen", year: 1964, person: ["Alexander Grothendieck"],
      text: "„Formule de Lefschetz et rationalité des fonctions L“, Séminaire Bourbaki, Exposé 279 (Dezember 1964); ausführlich in SGA 5. Deligne gab in SGA 4½ (1977) eine vereinfachte Darstellung." },
    { id: "h_hw_weil", from: "weilcurves", kind: "bewiesen", year: 1948, person: ["André Weil"], proof: "Weil (über Hodge-Index)",
      text: "„Sur les courbes algébriques et les variétés qui s'en déduisent“ (Paris 1948); angekündigt 1940 in den Comptes rendus." },
    { id: "h_hw_bombieri", from: "weilcurves", kind: "bewiesen", year: 1974, person: ["Sergei Stepanov", "Enrico Bombieri"], proof: "Stepanov-Bombieri",
      text: "Elementarer Beweis: Stepanov (1969) für hyperelliptische Kurven, Bombieri (1974, Séminaire Bourbaki) für alle Kurven." },
    { id: "h_hasse_artin", from: "hasse", kind: "vermutet", year: 1924, person: ["Emil Artin"],
      text: "Artins Dissertation „Quadratische Körper im Gebiete der höheren Kongruenzen“, Mathematische Zeitschrift 19: das Analogon der Riemannschen Vermutung für quadratische Funktionenkörper." },
    { id: "h_hasse_hasse", from: "hasse", kind: "bewiesen", year: 1933, person: ["Helmut Hasse"],
      text: "Angekündigt 1933 in den Nachrichten der Gesellschaft der Wissenschaften zu Göttingen; vollständig 1936 in drei Arbeiten im Journal für die reine und angewandte Mathematik 175, dort mit dem Frobenius-Endomorphismus." },
    { id: "h_hir_hironaka", from: "hironaka", kind: "bewiesen", year: 1964, person: ["Heisuke Hironaka"], proof: "Maximaler Kontakt",
      text: "„Resolution of singularities of an algebraic variety over a field of characteristic zero I, II“, Annals of Mathematics 79." },
    { id: "h_g27_cayley", from: "geraden27", kind: "bewiesen", year: 1849, person: ["Arthur Cayley", "George Salmon"],
      text: "Cayley, „On the triple tangent planes of surfaces of the third order“, Cambridge and Dublin Mathematical Journal 4; die Zahl 27 fand Salmon, Cayley bewies die Endlichkeit." },
    { id: "h_k3264_chasles", from: "kegel3264", kind: "bewiesen", year: 1864, person: ["Michel Chasles"],
      text: "„Construction des coniques qui satisfont à cinq conditions“, Comptes rendus 58, mit der Methode der Charakteristiken; nach heutigen Maßstäben nicht streng." },
    { id: "h_q5_cogp", from: "quintik", kind: "vermutet", year: 1991, person: ["Philip Candelas", "Xenia de la Ossa", "Paul Green", "Linda Parkes"],
      text: "„A pair of Calabi-Yau manifolds as an exactly soluble superconformal theory“, Nuclear Physics B 359: Vorhersage aller n<sub>d</sub> mit Spiegelsymmetrie." },
    { id: "h_q5_givental", from: "quintik", kind: "bewiesen", year: 1996, person: ["Alexander Givental"], proof: "Lokalisierung (Givental; Lian, Liu, Yau)",
      text: "„Equivariant Gromov-Witten invariants“, International Mathematics Research Notices 1996." },
    { id: "h_q5_lly", from: "quintik", kind: "bewiesen", year: 1997, person: ["Bong Lian", "Kefeng Liu", "Shing-Tung Yau"], proof: "Lokalisierung (Givental; Lian, Liu, Yau)",
      text: "„Mirror principle I“, Asian Journal of Mathematics 1; unabhängiger Beweis." },
    { id: "h_mw_mordell", from: "mordellweil", kind: "bewiesen", year: 1922, person: ["Louis Mordell"],
      text: "„On the rational solutions of the indeterminate equations of the third and fourth degrees“, Proceedings of the Cambridge Philosophical Society 21: für elliptische Kurven über ℚ." },
    { id: "h_mw_weil", from: "mordellweil", kind: "verallgemeinert", year: 1928, person: ["André Weil"], proof: "Abstieg",
      text: "Weils Dissertation „L'arithmétique sur les courbes algébriques“, Acta Mathematica 52 (1929): für Jacobi-Varietäten von Kurven über Zahlkörpern." },
    { id: "h_ch_cheb", from: "chebotarev", kind: "bewiesen", year: 1922, person: ["Nikolai Tschebotarjow"],
      text: "Beweis 1922; veröffentlicht als „Die Bestimmung der Dichtigkeit einer Menge von Primzahlen, welche zu einer gegebenen Substitutionsklasse gehören“, Mathematische Annalen 95 (1926)." },
    { id: "h_hodgecm_hodge", from: "hodgecm", kind: "vermutet", year: 1950, person: ["W. V. D. Hodge"],
      text: "Als Spezialfall der Hodge-Vermutung." },
  ],

  proofs: [
    { from: "basis", name: "Leitkoeffizienten", premises: ["G_KA"],
      rangeItems: { G_KA: ["Noethersche Ringe (aufsteigende Kettenbedingung)"] },
      idea: "Ist I ⊆ A[x] ein Ideal, so bilden die Leitkoeffizienten der Elemente festen Grades aufsteigende Ideale in A; ihre Stabilisierung liefert endlich viele Erzeuger." },
    { from: "nakayama", name: "Determinantentrick", premises: ["G_KA"],
      rangeItems: { G_KA: ["Determinantentrick (Cayley-Hamilton für Moduln)"] },
      idea: "Sind m<sub>1</sub>, …, m<sub>n</sub> Erzeuger von M und ist IM = M, so ist m<sub>i</sub> = Σ a<sub>ij</sub>m<sub>j</sub> mit a<sub>ij</sub> ∈ I. Die Determinante d = det(1 − (a<sub>ij</sub>)) annulliert M, und wegen d ≡ 1 modulo I ist d eine Einheit, weil I im Jacobson-Radikal liegt. Also ist M = 0." },
    { from: "cohenseidenberg", name: "Lokalisierung", premises: ["G_INTEXT"],
      rangeItems: { G_INTEXT: ["Ganzheit bleibt bei Lokalisierung und Restklassenbildung erhalten", "Ganze Erweiterungen von Körpern und maximale Ideale", "Ganzer Abschluss eines Ideals"] },
      idea: "Lying over: Man lokalisiert an 𝔭; B<sub>𝔭</sub> ist ganz über dem lokalen Ring A<sub>𝔭</sub>, und jedes maximale Ideal von B<sub>𝔭</sub> liegt über 𝔭A<sub>𝔭</sub>, weil bei einer ganzen Erweiterung ein Primideal genau dann maximal ist, wenn sein Urbild maximal ist. Going up folgt durch Übergang zu A/𝔭 ⊆ B/𝔮. Going down beweist man mit dem ganzen Abschluss eines Ideals und dem Minimalpolynom eines Elements über dem Quotientenkörper von A." },
    { from: "hensel", name: "Newton-Verfahren", premises: ["G_LOCALRINGS"],
      rangeItems: { G_LOCALRINGS: ["Vollständige lokale Ringe"] },
      idea: "Ist f(a) ≡ 0 mod 𝔭<sup>k</sup> und f′(a) eine Einheit, so ist a′ = a − f(a)/f′(a) eine Nullstelle modulo 𝔭<sup>k+1</sup> (sogar modulo 𝔭<sup>2k</sup>), und a′ ≡ a mod 𝔭<sup>k</sup>; das zeigt die Taylor-Entwicklung von f um a. Die so gebildete Folge ist eine Cauchy-Folge; ihr Grenzwert im vollständigen Ring 𝒪<sub>K</sub> ist die gesuchte Nullstelle. Die Eindeutigkeit folgt, weil f′ in der Nähe von a eine Einheit bleibt." },
    { from: "noethnorm", name: "Koordinatenwechsel", premises: ["G_INTEXT"],
      rangeItems: { G_INTEXT: ["Ganze Erweiterungen (Transitivität der Ganzheit)"] },
      idea: "Ist A nicht endlich über k[x₁, …, xₙ₋₁], ersetzt man xᵢ durch xᵢ − xₙ<sup>rⁱ</sup> (Nagatas Trick), bis eine Relation ganz über den übrigen Variablen wird; Induktion über n." },
    { from: "zariskilemma", name: "Über Normalisierung", premises: ["noethnorm"],
      idea: "Ist K endlich über k[y₁, …, y<sub>d</sub>], so ist auch k[y₁, …, y<sub>d</sub>] ein Körper; das geht nur für d = 0." },
    { from: "nullst", name: "Rabinowitsch-Trick", premises: ["zariskilemma"],
      idea: "Aus dem Zariski-Lemma folgt, dass maximale Ideale Punkten entsprechen. Verschwindet f auf V(J), so hat J + (1 − yf) keine Nullstelle, enthält also 1; daraus folgt fʳ ∈ J." },
    { from: "dim", name: "Über Normalisierung", premises: ["noethnorm", "cohenseidenberg"],
      idea: "Ganze Erweiterungen erhalten die Krull-Dimension (Going up, Going down); der Polynomring in d Variablen hat Dimension d." },
    { from: "krull", name: "Artinsche Ringe", premises: ["nakayama", "G_KA"],
      rangeItems: { G_KA: ["Artinsche Ringe", "Lokalisierung", "Symbolische Potenzen"] },
      idea: "Lokalisiert man an 𝔭, so ist A/(f) artinsch; die absteigende Kette symbolischer Potenzen von 𝔮 ⊊ 𝔭 stabilisiert sich, und Nakayamas Lemma zeigt, dass 𝔮 minimal ist." },
    { from: "artinrees", name: "Rees-Algebra", premises: ["basis"],
      idea: "Die Rees-Algebra ⊕ Iⁿ ist nach dem Basissatz noethersch; der Untermodul ⊕ (IⁿM ∩ N) ist daher endlich erzeugt." },
    { from: "hilbpol", name: "Filtration nach Primidealen", premises: ["basis", "dim", "krull"],
      idea: "M besitzt eine Filtration mit Quotienten (S/𝔭)(l); für S/𝔭 zeigt Induktion mit einer Linearform, die nicht in 𝔭 liegt (Hauptidealsatz: Dimension sinkt um 1), dass die Hilbert-Funktion ein Polynom vom Grad dim V(𝔭) ist." },
    { from: "bezout", name: "Hilbert-Polynome", premises: ["hilbpol", "krull"],
      idea: "Aus 0 → S/I<sub>Y</sub>(−d) → S/I<sub>Y</sub> → S/(I<sub>Y</sub> + (f)) → 0 folgt, dass sich die Leitkoeffizienten um den Faktor d = deg H unterscheiden; die Komponenten des Schnitts haben nach Krull die Dimension dim Y − 1." },
    { from: "bezout", name: "Resultante", premises: ["G_KA"],
      rangeItems: { G_KA: ["Resultante"] },
      idea: "Klassischer Beweis für ebene Kurven: Die Resultante von f und g bezüglich einer Variablen ist ein homogenes Polynom vom Grad deg f · deg g, dessen Nullstellen die Schnittpunkte mit Vielfachheit zählen." },
    { from: "pncoh", name: "Čech-Komplex", premises: ["G_KOH"],
      idea: "Man rechnet die Čech-Kohomologie für die Überdeckung durch die n + 1 Standardkarten aus; sie ist ein Komplex von Laurent-Monomen." },
    { from: "serreendl", name: "Absteigende Induktion", premises: ["pncoh", "G_KOH"],
      idea: "F ist Quotient einer Summe von Garben O(−q); die lange exakte Sequenz und die Kohomologie von ℙⁿ liefern beide Aussagen durch absteigende Induktion über i." },
    { from: "serredual", name: "Über ℙᴺ", premises: ["pncoh", "serreendl", "G_KAT"],
      idea: "Auf ℙᴺ liefert die Rechnung eine perfekte Paarung H⁰(O(m)) × Hᴺ(O(−m−N−1)) → k; für X ⊆ ℙᴺ führt man die Dualität mit Ext-Funktoren und der dualisierenden Garbe ω<sub>X</sub> auf ℙᴺ zurück." },
    { from: "formfunk", name: "Grothendieck", premises: ["serreendl", "artinrees"],
      idea: "Man vergleicht die Vervollständigung der endlich erzeugten Moduln Rⁱf<sub>*</sub>F mit dem inversen Limes; das Artin-Rees-Lemma sorgt dafür, dass die beiden Filtrationen dieselbe Topologie definieren." },
    { from: "rrcurve", name: "Über Serre-Dualität", premises: ["serredual", "serreendl", "G_KOH"],
      idea: "Aus 0 → O(D − P) → O(D) → k(P) → 0 folgt χ(O(D)) = deg D + χ(O) durch Induktion; Serre-Dualität liefert h¹(O(D)) = ℓ(K − D) und h¹(O) = g." },
    { from: "rrcurve", name: "Spezialfall von HRR", premises: ["hrr"], specialCaseOf: "hrr",
      idea: "Für eine Kurve ist ch(O(D)) = 1 + D und td(T<sub>C</sub>) = 1 − K/2; der Grad-1-Anteil ergibt deg D + 1 − g." },
    { from: "canon", name: "Einsetzen", premises: ["rrcurve"],
      idea: "D = 0 liefert ℓ(K) = g; D = K liefert deg K = 2g − 2." },
    { from: "hurwitz", name: "Vergleich der Differentiale", premises: ["canon"],
      idea: "Lokal gilt K<sub>X</sub> = f*K<sub>Y</sub> + R; man nimmt den Grad und setzt deg K = 2g − 2 ein." },
    { from: "adjunktion", name: "Adjunktion", premises: ["canon"],
      idea: "ω<sub>C</sub> ≅ ω<sub>X</sub> ⊗ O<sub>X</sub>(C)|<sub>C</sub>; der Grad dieser Einschränkung ist C·(C + K<sub>X</sub>), der Grad von ω<sub>C</sub> ist 2g − 2." },
    { from: "bertini", name: "Dimensionszählung", premises: ["dim"],
      idea: "Die Hyperebenen, die X in einem singulären Punkt berühren, bilden in der Inzidenzvarietät eine Teilmenge der Dimension höchstens N − 1 im dualen ℙᴺ." },
    { from: "rrsurface", name: "Über Kurven", premises: ["rrcurve", "adjunktion", "bertini"],
      idea: "Man schreibt D = C − E mit glatten Kurven C, E (Bertini) und wendet Riemann-Roch auf C und E sowie die Adjunktionsformel an." },
    { from: "rrsurface", name: "Spezialfall von HRR", premises: ["hrr"], specialCaseOf: "hrr",
      idea: "Grad-2-Anteil von ch(O(D))·td(T<sub>X</sub>) mit td = 1 − K/2 + (K² + c₂)/12 und der Noether-Formel." },
    { from: "hodgeindex", name: "Über Riemann-Roch", premises: ["rrsurface", "serredual"],
      idea: "Wäre D² > 0, so wüchse h⁰(nD) + h⁰(K − nD) nach Riemann-Roch quadratisch; also wäre nD oder −nD effektiv, im Widerspruch zu D·H = 0." },
    { from: "chow", name: "Fulton", premises: ["dim", "krull"],
      idea: "Zyklen modulo rationaler Äquivalenz; das Produkt wird über die Deformation zum Normalenkegel definiert, die Dimensionsaussagen kommen aus dem Hauptidealsatz." },
    { from: "grr", name: "Zerlegung von f", premises: ["pncoh", "chow"],
      idea: "f wird als abgeschlossene Einbettung gefolgt von einer Projektion ℙⁿ × Y → Y geschrieben. Für die Projektion folgt die Formel aus der Kohomologie von ℙⁿ, für die Einbettung über die Deformation zum Normalenkegel (Borel-Serre)." },
    { from: "hrr", name: "Kobordismus", premises: ["G_TOP"],
      idea: "Hirzebruch (1954): Beide Seiten sind multiplikativ und kobordismusinvariant; Thoms Berechnung des Kobordismusrings reduziert auf Produkte projektiver Räume." },
    { from: "hrr", name: "Spezialfall von GRR", premises: ["grr"], specialCaseOf: "grr",
      idea: "GRR für den Morphismus X → Punkt." },
    { from: "gaga", name: "Über ℙⁿ", premises: ["pncoh", "serreendl", "G_AN"],
      idea: "Man vergleicht zuerst die Kohomologie von O(m) auf ℙⁿ algebraisch und analytisch; mit Serres Verschwindungssatz und dem Endlichkeitssatz von Cartan-Serre überträgt sich der Vergleich auf alle kohärenten Garben." },
    { from: "chowthm", name: "Analytisch", premises: ["G_AN"],
      idea: "Chow (1949), mit Methoden der Funktionentheorie mehrerer Veränderlicher." },
    { from: "chowthm", name: "Korollar von GAGA", premises: ["gaga"], specialCaseOf: "gaga",
      idea: "Die Idealgarbe von Z ist kohärent analytisch, nach GAGA also algebraisch; Z ist ihr Nullstellengebilde." },
    { from: "hodgezerl", name: "Harmonische Formen", methods: ["M_HARMONISCH"], premises: ["G_AN"],
      idea: "Jede Klasse hat einen eindeutigen harmonischen Vertreter; auf Kähler-Mannigfaltigkeiten vertauscht der Laplace-Operator mit der Zerlegung nach Typen (p, q)." },
    { from: "degen", name: "Analytisch", premises: ["hodgezerl", "gaga"],
      idea: "Die Hodge-Zerlegung liefert dim H<sup>k</sup> = Σ h<sup>p,q</sup>; GAGA identifiziert die algebraischen mit den analytischen Gruppen. Gleichheit der Dimensionen erzwingt die Entartung." },
    { from: "degen", name: "Deligne-Illusie", methods: ["M_MODP"], premises: ["deligneillusie"],
      idea: "Man reduziert auf Charakteristik p > dim X mit Hebung nach W₂; dort zerfällt der de-Rham-Komplex, und die Dimensionen stimmen überein." },
    { from: "deligneillusie", name: "Hebung des Frobenius", premises: ["G_KOH"],
      idea: "Eine Hebung von X nach W₂(k) liefert lokal Hebungen des Frobenius; deren Ableitungen geteilt durch p ergeben den Cartier-Quasi-Isomorphismus in Grad 1, der sich multiplikativ fortsetzt." },
    { from: "kodaira", name: "Analytisch", methods: ["M_HARMONISCH"], premises: ["hodgezerl", "gaga", "G_AN"],
      idea: "Bochner-Technik: Mit der Krümmungsform einer positiven Metrik auf L zeigen die Kähler-Identitäten, dass harmonische (n, q)-Formen mit Werten in L für q > 0 verschwinden; GAGA überträgt das ins Algebraische." },
    { from: "kodaira", name: "Deligne-Illusie", methods: ["M_MODP"], premises: ["deligneillusie", "serreendl", "serredual"],
      idea: "In Charakteristik p liefert die Zerlegung Hⁱ(Ω ⊗ L⁻¹) ↪ Hⁱ(Ω ⊗ L<sup>−p</sup>); iteriert, mit Serre-Dualität und Serres Verschwindungssatz folgt das Verschwinden, dann Übergang zu Charakteristik 0." },
    { from: "lefschetzhyper", name: "Morse-Theorie", premises: ["G_TOP"],
      idea: "X ∖ Y ist eine affine Varietät der Dimension n und hat den Homotopietyp eines CW-Komplexes der Dimension höchstens n (Andreotti-Frankel); daraus folgt die Aussage mit der langen exakten Sequenz des Paares." },
    { from: "hardlef", name: "Hodge-Theorie", methods: ["M_HARMONISCH"], premises: ["hodgezerl", "G_AN"],
      idea: "Die Operatoren L, Λ und ihr Kommutator bilden eine Darstellung von sl₂ auf den harmonischen Formen; daraus folgt die Isomorphie." },
    { from: "hardlef", name: "Weil II (ℓ-adisch)", premises: ["weilrh", "lefbuschel"],
      idea: "Deligne (1980): Aus der Reinheit der Gewichte und der Theorie der Lefschetz-Büschel folgt der harte Lefschetz-Satz auch in positiver Charakteristik." },
    { from: "eigbw", name: "SGA 4", methods: ["M_KURVEN"], premises: ["G_KOH", "G_KAT"],
      idea: "Rückführung auf relative Kurven; für Kurven folgt die Aussage aus der Kummer-Sequenz und der Theorie des Picard-Funktors." },
    { from: "poincare", name: "SGA 4", methods: ["M_KURVEN"], premises: ["eigbw", "G_KOH", "G_KAT"],
      idea: "Man konstruiert die Spurabbildung und zeigt die Perfektheit durch Rückführung auf Kurven mit dem eigentlichen Basiswechsel." },
    { from: "riemexist", name: "SGA 1", premises: ["gaga", "hironaka", "G_KAT"],
      idea: "Für projektive X folgt die Aussage aus GAGA (Grauert-Remmert); allgemein kompaktifiziert man mit einem Divisor mit normalen Überkreuzungen, wozu man die Auflösung der Singularitäten braucht." },
    { from: "vergleich", name: "Artin", methods: ["M_KURVEN"], premises: ["eigbw", "riemexist"],
      idea: "Für H¹ ist der Vergleich der Riemannsche Existenzsatz; höhere Grade werden durch Fasern in Kurven und den eigentlichen Basiswechsel auf diesen Fall zurückgeführt." },
    { from: "spur", name: "SGA 4½", methods: ["M_KURVEN"], premises: ["eigbw", "poincare", "G_KAT"],
      idea: "Man zeigt die Formel für Kurven und führt den allgemeinen Fall durch Fasern auf Kurven zurück (Dévissage)." },
    { from: "lefbuschel", name: "SGA 7", premises: ["bertini", "eigbw"],
      idea: "Ein allgemeines Büschel von Hyperebenenschnitten hat nur Fasern mit einem gewöhnlichen Doppelpunkt (Bertini); die lokale Monodromie um einen solchen Punkt ist eine Transvektion." },
    { from: "weilrat", name: "Dwork (p-adisch)", premises: ["G_AN"],
      idea: "Dwork (1960) zeigte die Rationalität mit p-adischer Analysis, ohne Kohomologie." },
    { from: "weilrat", name: "Grothendieck", methods: ["M_SPUR"], premises: ["spur", "poincare"],
      idea: "Die Spurformel drückt log Z(X, t) durch Spuren aus, was die Rationalität ergibt; die Poincaré-Dualität liefert die Funktionalgleichung." },
    { from: "weilrh", name: "Deligne (Weil I)", methods: ["M_SPUR", "M_KURVEN"], premises: ["spur", "poincare", "lefbuschel"],
      idea: "Mit der Spurformel für eine Familie in einem Lefschetz-Büschel, der Irreduzibilität der Monodromie und einem Trick mit Tensorpotenzen (nach Rankin) zeigt Deligne |α| ≤ q<sup>i/2 + 1/2</sup> und verbessert die Schranke durch Potenzieren auf q<sup>i/2</sup>." },
    { from: "weilcurves", name: "Weil (über Hodge-Index)", premises: ["hodgeindex", "adjunktion"],
      idea: "Auf der Fläche C × C wendet man die Castelnuovo-Severi-Ungleichung, eine Folgerung des Hodge-Indexsatzes, auf den Graphen des Frobenius und die Diagonale an." },
    { from: "weilcurves", name: "Stepanov-Bombieri", premises: ["rrcurve"],
      idea: "Elementarer Beweis (Stepanov 1969, Bombieri 1974): Mit Riemann-Roch konstruiert man eine Funktion mit Nullstellen hoher Ordnung in allen rationalen Punkten und schätzt ihren Grad ab." },
    { from: "weilcurves", name: "Spezialfall von Weil I", methods: ["M_SPUR"], premises: ["weilrh", "spur"], specialCaseOf: "weilrh",
      idea: "Für eine Kurve ist #C(𝔽<sub>q</sub>) = q + 1 − Σ α<sub>j</sub> mit 2g Eigenwerten α<sub>j</sub> vom Betrag √q." },
    { from: "dualisog", name: "Über Divisoren", premises: ["rrcurve"],
      idea: "Mit Riemann-Roch identifiziert man E mit der Gruppe Pic⁰(E) der Divisorenklassen vom Grad 0; φ̂ ist der Rückzug von Divisoren. Die Parallelogrammgleichung für deg folgt aus φ̂ ∘ φ = [deg φ] und der Additivität von φ ↦ φ̂ (Silverman, Kapitel III.6)." },
    { from: "frobpunkt", name: "Invariantes Differential", premises: ["G_ELLIPTIC"],
      rangeItems: { G_ELLIPTIC: ["Invariantes Differential", "Isogenien und ihr Grad"] },
      idea: "Der Frobenius zieht das invariante Differential ω auf 0 zurück; deshalb zieht 1 − φ<sub>q</sub> es auf ω zurück und ist separabel. Bei separablen Isogenien ist die Zahl der Punkte im Kern gleich dem Grad (Silverman, Kapitel III.4 und III.5)." },
    { from: "hasse", name: "Hasse (Diskriminante)", premises: ["dualisog", "frobpunkt"],
      idea: "deg(m − nφ) = m² − a·mn + q·n² mit a = q + 1 − #E(𝔽<sub>q</sub>) ist für alle ganzen m, n nicht negativ. Eine solche quadratische Form hat eine nicht positive Diskriminante: a² − 4q ≤ 0." },
    { from: "hasse", name: "Spezialfall Hasse-Weil", premises: ["weilcurves"], specialCaseOf: "weilcurves",
      idea: "Für eine Kurve vom Geschlecht g = 1 ist die Hasse-Weil-Schranke genau der Satz von Hasse." },
    { from: "geraden27", name: "Aufblasung von ℙ² in sechs Punkten", premises: ["adjunktion", "bezout"],
      idea: "Eine glatte kubische Fläche ist ℙ², aufgeblasen in sechs Punkten in allgemeiner Lage (Clebsch). Geraden auf ihr sind genau die Kurven E mit E² = E·K = −1 (Adjunktion): 6 Ausnahmekurven, 15 Geraden durch je zwei der Punkte und 6 Kegelschnitte durch je fünf Punkte, zusammen 27." },
    { from: "kegel3264", name: "Vollständige Kegelschnitte", methods: ["M_SCHNITT"], premises: ["chow", "bezout"],
      idea: "Im ℙ⁵ aller Kegelschnitte ist „berührt C“ eine Hyperfläche vom Grad 6; Bézout ergäbe 6⁵ = 7776, zählt aber die doppelten Geraden mit, die jede Bedingung erfüllen. Auf dem Raum der vollständigen Kegelschnitte (Aufblasung entlang der Veronese-Fläche) rechnet man im Chow-Ring und erhält 3264." },
    { from: "quintik", name: "Lokalisierung (Givental; Lian, Liu, Yau)", methods: ["M_SCHNITT"], premises: ["chow", "G_TOP"],
      idea: "Man berechnet Integrale über Kontsevichs Modulraum stabiler Abbildungen mit der Lokalisierungsformel von Atiyah und Bott (äquivariante Kohomologie) und zeigt, dass ihre Erzeugende Funktion die von der Physik vorhergesagte Formel erfüllt." },
    { from: "zmt", name: "Formale Funktionen", premises: ["formfunk"],
      idea: "Für Y normal ist f<sub>*</sub>O<sub>X</sub> = O<sub>Y</sub>; der Satz über formale Funktionen zeigt, dass H⁰ der formalen Faser lokal ist, also ist die Faser zusammenhängend (Zariskis Zusammenhangssatz)." },
    { from: "zmt", name: "Zariski (Bewertungstheorie)", premises: ["G_INTEXT"],
      rangeItems: { G_INTEXT: ["Bewertungsringe", "Ganzer Abschluss"] },
      idea: "Zariskis ursprünglicher Beweis (1943) mit Methoden der Bewertungstheorie und der ganzen Abschlüsse." },
    { from: "hironaka", name: "Maximaler Kontakt", premises: ["G_LOCALRINGS"],
      rangeItems: { G_LOCALRINGS: ["Vervollständigung", "Weierstraß-Vorbereitung"] },
      idea: "Induktion über die Dimension: Man wählt Hyperflächen maximalen Kontakts und bläst entlang geeignet gewählter glatter Zentren auf, bis eine Invariante der Singularität sinkt. Benutzt keine weiteren Sätze dieses Graphen." },
    { from: "hoehen", name: "Weil, Néron-Tate", premises: ["G_ZT"],
      idea: "Weils Höhenmaschine ordnet jedem Geradenbündel eine Höhe bis auf beschränkte Funktionen zu; Tates Limes ĥ(P) = lim h(2ⁿP)/4ⁿ ergibt eine quadratische Form; Northcott zählt Punkte beschränkter Höhe." },
    { from: "mordellweil", name: "Abstieg", methods: ["M_ABSTIEG", "M_HOEHEN"], premises: ["hoehen", "G_ZT"],
      idea: "Schwacher Mordell-Weil: A(K)/mA(K) ist endlich (Kummer-Theorie, Endlichkeit der Klassenzahl, Einheitensatz). Mit der Höhe folgt daraus durch Abstieg die endliche Erzeugtheit." },
    { from: "chebotarev", name: "Über das Artinsche Reziprozitätsgesetz", shortcut: true, premises: ["G_ZT"],
      rangeItems: { G_ZT: ["Artinsches Reziprozitätsgesetz", "Hecke-L-Funktionen von Strahlklassencharakteren, L(1, χ) ≠ 0"] },
      idea: "Abgekürzt; ausgeführt in Beispiel Arithmetische Geometrie. Man geht zum Fixkörper der von σ erzeugten Untergruppe über, wo die Erweiterung zyklisch ist; dort folgt die Dichte aus dem Reziprozitätsgesetz und der Gleichverteilung der Primideale auf die Strahlklassen." },
    { from: "shafarevich", name: "Faltings", methods: ["M_HOEHEN"], premises: ["hoehen", "G_ZT", "chebotarev"],
      rangeItems: { G_ZT: ["Satz von Hermite-Minkowski"] },
      idea: "Faltings führt eine Höhe für abelsche Varietäten ein, zeigt, dass sie in einer Isogenieklasse nur endlich viele Werte annimmt, und beweist damit die Tate-Vermutung für Isogenien und die Shafarevich-Vermutung. Für die Endlichkeit der Isogenieklassen braucht er, dass eine halbeinfache ℓ-adische Darstellung durch die Spuren der Frobenius-Elemente an endlich vielen Primstellen bestimmt ist; das folgt aus dem Dichtesatz von Tschebotarjow und dem Satz von Hermite-Minkowski." },
    { from: "faltings", name: "Faltings (über Parshin)", premises: ["shafarevich", "hurwitz"],
      idea: "Parshins Konstruktion (1968) ordnet jedem rationalen Punkt eine verzweigte Überlagerung von C zu, deren Geschlecht mit Riemann-Hurwitz kontrolliert wird; die zugehörigen Jacobi-Varietäten haben gute Reduktion außerhalb einer festen Menge S. Nach Shafarevich gibt es davon nur endlich viele." },
    { from: "faltings", name: "Vojta, Bombieri", methods: ["M_HOEHEN", "M_DIOPH"], premises: ["hoehen", "mordellweil", "G_DIOPH"],
      idea: "Vojta (1991), vereinfacht von Bombieri (1990): Man schätzt die Höhen von Punkten der Kurve in der Jacobi-Varietät mit diophantischer Approximation ab; Punkte großer Höhe liegen weit auseinander, und der Mordell-Weil-Gitterpunktzähler lässt nur endlich viele zu." },

    // ------------------------------------------------------------ Conditional proofs (only with
    // conjectures)
    { from: "weilrh", kind: "bedingt", name: "Grothendiecks Weg", methods: ["M_SPUR"], premises: ["stdlef", "stdhodge", "spur"],
      idea: "Kleiman (1968), nach Serres Kähler-Analogon: Mit der Standardvermutung vom Lefschetz-Typ werden die Projektionen auf die Kohomologiegrade und der Operator Λ algebraisch; mit der vom Hodge-Typ ist die Form (x, y) ↦ Spur(x ∘ y′) auf den algebraischen Korrespondenzen von X × X positiv definit. Auf jedem Kohomologiegrad ist der Frobenius bezüglich dieser Form bis auf einen Faktor eine Isometrie; daraus folgt |α| = q<sup>i/2</sup>." },
    // AI proof (only with the switch „KI-Beweise“). The proof idea is taken from the abstract and introduction
    // of the
    // manuscript; the proof itself has not been checked.
    { from: "hodgecm", kind: "beansprucht", name: "OpenAI 2026 (Weil-Klassen und Thetaformen)", premises: ["hodgezerl", "G_AN", "G_ZT"],
      idea: "Nach der Einleitung des Manuskripts: Die Reduktionen von Deligne und André drücken jede Hodge-Klasse auf einer CM-abelschen Varietät durch zerfallende Weil-Klassen auf CM-Hilfsvarietäten aus, und Hazamas Rechnung führt sie auf Relationen zwischen je vier Faktoren zurück. Für die zugehörigen Tensoren konstruiert die Arbeit algebraische Zyklen mit Thetaformen auf Quotienten der komplexen Einheitskugel und setzt sie als Korrespondenzen zusammen.",
      ki: { company: "OpenAI", model: "internes Modell (nicht benannt)", share: "vollständig", date: "2026-10-06", people: [],
        verification: "unbestätigt", lean: "keine", state: "2026-10-19",
        source: "https://github.com/openai/math/blob/main/preprints/The-rational-Hodge-conjecture-for-CM-abelian-varieties-October-6-2026/paper.pdf",
        note: "Familie 032. Das README nennt den Beweis der Hodge-Vermutung für CM-abelsche Varietäten als Ausnahme vom festen Verfahren der Sammlung, ohne zu sagen, worin die Ausnahme besteht. Am 7. Oktober 2026 wurden drei andere Manuskripte zur Hodge-Theorie wegen eines Vorzeichenfehlers zurückgezogen (Weil-Klassen auf zerfallenden abelschen Achtfaltigkeiten, Kuga-Satake-Korrespondenzen für K3-Flächen, Hodge-Vermutung für Produkte von K3-Flächen). Dieses Manuskript zitiert keines davon und wurde weder zurückgezogen noch überarbeitet (Stand 19. Oktober)." } },
    { from: "uniform", kind: "bedingt", name: "Caporaso, Harris, Mazur", premises: ["bombierilang"],
      idea: "Satz über gefaserte Potenzen: Für eine Familie von Kurven vom Geschlecht g ≥ 2 erlaubt die n-fache gefaserte Potenz für großes n eine dominante rationale Abbildung auf eine Varietät von allgemeinem Typ. Nach Bombieri-Lang liegen deren rationale Punkte in einer echten abgeschlossenen Teilmenge; noethersche Induktion über die Basis der Familie ergibt eine Schranke, die nur von g und K abhängt." },
  ],

  // Relations that are not proofs (only with conjectures). For the kinds see the header comment.
  relations: [
    { from: "hodgezerl", to: "hodgeverm", kind: "formulierung", text: "Hodge-Klassen sind die rationalen Klassen, die im Summanden H<sup>p,p</sup> liegen. Diesen Summanden definiert erst die Hodge-Zerlegung." },
    { from: "hardlef", to: "stdlef", kind: "teilresultat", text: "Auf der ganzen Kohomologie ist L<sup>n−2i</sup> ein Isomorphismus. Eingeschränkt auf die algebraischen Klassen ist die Abbildung deshalb injektiv; offen ist, ob sie surjektiv ist." },
    { from: "hodgeindex", to: "stdhodge", kind: "teilresultat", text: "Der Fall der Flächen, in jeder Charakteristik. Auf genau diesem Fall beruht Weils Beweis der Riemannschen Vermutung für Kurven." },
    { from: "hironaka", to: "auflp", kind: "analogie", text: "In Charakteristik 0 bewiesen. Hironakas Induktion über Hyperflächen maximalen Kontakts funktioniert in Charakteristik p nicht, weil solche Hyperflächen fehlen können." },
    { from: "faltings", to: "bombierilang", kind: "teilresultat", text: "Der Fall der Kurven: Kurven vom Geschlecht mindestens 2 sind genau die Kurven von allgemeinem Typ, und eine endliche Menge ist nicht Zariski-dicht." },
    { from: "hodgeverm", to: "tateverm", kind: "analogie", text: "Die Tate-Vermutung ersetzt die Hodge-Struktur durch die Wirkung der Galois-Gruppe auf der ℓ-adischen Kohomologie. Galois-invariante Klassen übernehmen die Rolle der Klassen vom Typ (p, p)." },
    { from: "mordellweil", to: "bsd", kind: "formulierung", text: "Der Rang ist erst definiert, wenn E(ℚ) endlich erzeugt ist." },
    { from: "hoehen", to: "bsd", kind: "formulierung", text: "Der Regulator R<sub>E</sub> in der Formel ist die Determinante der Néron-Tate-Höhenpaarung." },
    // Partial results whose proof is claimed by an AI (only with the switch „KI-Beweise“)
    { from: "hodgecm", to: "hodgeverm", kind: "teilresultat", ki: true, text: "Beansprucht, ungeprüft: der Fall der CM-abelschen Varietäten, in jeder Dimension und Kodimension." },
    { from: "hodgecm", to: "tateverm", kind: "teilresultat", ki: true, text: "Beansprucht, ungeprüft. Kein Spezialfall im engen Sinn, sondern eine Folgerung: Nach einem Satz von Milne (1999) folgt aus der Hodge-Vermutung für CM-abelsche Varietäten die Tate-Vermutung für alle abelschen Varietäten über endlichen Körpern, und das ist ein Spezialfall der Tate-Vermutung." },
    { from: "hodgecm", to: "stdhodge", kind: "teilresultat", ki: true, text: "Beansprucht, ungeprüft. Folgerung über einen Satz von Milne (2002): die Standardvermutung vom Hodge-Typ für abelsche Varietäten in jeder Charakteristik." },
  ],
};
