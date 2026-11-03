// The areas with graphs, in the order of the overview (graphs/index.html) and of the column of areas on every graph
// page (shared_scripts/area-nav.js). `concepts` and `theorems`: global names of the data, for the counts on the
// overview. Add a new folder here.
window.GRAPH_AREAS = [
  { folder: "set-theory", name: "Set theory", msc: "03E, 06A", concepts: "ST_CONCEPTS", theorems: "ST_THEOREMS",
    text: "Sets, relations and maps, orders, ordinals and cardinals, forcing, and the construction of ℚ, ℝ and ℂ." },
  { folder: "elementary-number-theory", name: "Elementary number theory", msc: "11A", concepts: "ENT_CONCEPTS", theorems: "ENT_THEOREMS",
    text: "Divisibility, congruences, arithmetic functions, primes, continued fractions." },
  { folder: "group-theory", name: "Group theory", msc: "20", concepts: "GT_CONCEPTS", theorems: "GT_THEOREMS",
    text: "Groups and homomorphisms, group actions and permutations, finite and abelian groups." },
  { folder: "commutative-algebra", name: "Commutative algebra", msc: "13", concepts: "CA_CONCEPTS", theorems: "CA_THEOREMS",
    text: "Rings and ideals, localization, modules, chain conditions, special and local rings, completion." },
  { folder: "category-theory", name: "Category theory", msc: "18", concepts: "CT_CONCEPTS", theorems: "CT_THEOREMS",
    text: "Categories, functors and limits, abelian categories and homological algebra, sheaves, higher categories." },
  { folder: "algebraic-geometry", name: "Algebraic geometry", msc: "14", concepts: "AG_CG", theorems: "AG_THEOREMS",
    text: "Schemes and morphisms, sheaves and cohomology, divisors, curves, surfaces, birational geometry, moduli, abelian varieties." },
  { folder: "arithmetic-geometry", name: "Arithmetic geometry", msc: "11F, 11G, 11M, 11N", concepts: "AR_CG", theorems: "AR_THEOREMS",
    text: "L-functions, primes, modular forms, elliptic curves over number fields, and the field theory they need." },
  { folder: "algebraic-number-theory", name: "Algebraic number theory", msc: "11R, 11S", concepts: "ANT_CONCEPTS", theorems: "ANT_THEOREMS",
    text: "Number fields and rings of integers, ramification, units and class groups, cyclotomic fields, class field theory, adeles, local fields." },
];
