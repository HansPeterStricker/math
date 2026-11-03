(function () {
  'use strict'
  const R = (globalThis.Ratios ??= {})
  const core = (R.core ??= {})

  /**
   * Farbpalette der Legacy-Anwendung (34 Einträge, gleiche Reihenfolge).
   * @type {readonly string[]}
   */
  const COLORS = Object.freeze([
    '#EB1C2D',
    '#D3A029',
    '#279B48',
    '#00AED9',
    '#C31F33',
    '#EF402B',
    '#FDB713',
    '#8F1838',
    '#F36D25',
    '#E11484',
    '#F99D26',
    '#CF8D2A',
    '#48773E',
    '#007DBC',
    '#3EB049',
    '#02558B',
    '#183668',
    '#EB1C2D',
    '#D3A029',
    '#279B48',
    '#C31F33',
    '#EF402B',
    '#00AED9',
    '#FDB713',
    '#8F1838',
    '#F36D25',
    '#E11484',
    '#F99D26',
    '#CF8D2A',
    '#48773E',
    '#007DBC',
    '#3EB049',
    '#02558B',
    '#183668'
  ])

  /**
   * Musikalische Intervalle der Legacy-Anwendung. `ratios` enthält [Zähler, Nenner]-Paare.
   * @type {readonly {name: string, ratios: readonly (readonly [number, number])[]}[]}
   */
  const INTERVALS = Object.freeze([
    Object.freeze({ name: 'dim. 2nd', ratios: Object.freeze([Object.freeze([128, 125])]) }),
    Object.freeze({ name: 'minor 2nd', ratios: Object.freeze([Object.freeze([16, 15])]) }),
    Object.freeze({ name: 'major 2nd', ratios: Object.freeze([Object.freeze([9, 8])]) }),
    Object.freeze({ name: 'dim. 3rd', ratios: Object.freeze([Object.freeze([144, 125])]) }),
    Object.freeze({ name: 'minor 3rd', ratios: Object.freeze([Object.freeze([6, 5])]) }),
    Object.freeze({ name: 'major 3rd', ratios: Object.freeze([Object.freeze([5, 4])]) }),
    Object.freeze({ name: 'perfect 4th', ratios: Object.freeze([Object.freeze([4, 3])]) }),
    Object.freeze({ name: 'tritone', ratios: Object.freeze([Object.freeze([7, 5])]) }),
    Object.freeze({ name: 'perfect 5th', ratios: Object.freeze([Object.freeze([3, 2])]) }),
    Object.freeze({ name: 'augmented 5th', ratios: Object.freeze([Object.freeze([25, 16])]) }),
    Object.freeze({ name: 'dim. 6th', ratios: Object.freeze([Object.freeze([32, 21])]) }),
    Object.freeze({ name: 'minor 6th', ratios: Object.freeze([Object.freeze([8, 5])]) }),
    Object.freeze({ name: 'major 6th', ratios: Object.freeze([Object.freeze([5, 3])]) }),
    Object.freeze({ name: 'aug. 6th', ratios: Object.freeze([Object.freeze([7, 4])]) }),
    Object.freeze({ name: 'dim. 7th', ratios: Object.freeze([Object.freeze([128, 75])]) }),
    Object.freeze({ name: 'minor 7th', ratios: Object.freeze([Object.freeze([9, 5])]) }),
    Object.freeze({ name: 'major 7th', ratios: Object.freeze([Object.freeze([15, 8])]) }),
    Object.freeze({ name: 'aug. 7th', ratios: Object.freeze([Object.freeze([125, 64])]) }),
    Object.freeze({ name: 'dim. octave', ratios: Object.freeze([Object.freeze([48, 25])]) }),
    Object.freeze({ name: 'perfect octave', ratios: Object.freeze([Object.freeze([2, 1])]) })
  ])

  Object.assign(core, { COLORS, INTERVALS })
})()
