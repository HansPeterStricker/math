// Settings of the size formula of B49 (maps/shared_scripts/size-score.js) for the map of mathematics around 1900 (plan step
// P4 of the map 1900, 23 October 2026). Replaces maps/shared_data/weights.js for this map (files.weights of
// scripts/map-config.js).
//
// User, 2026-10-23 (taken over from the map 1830): the weight of a theorem follows the state of 1900, i.e. the number of its users within the data of
// 1900; literature values and today's importance do not count. Therefore only the data score a counts:
//   - weights: a = 1; the editorial score b and the literature score c have weight 0, there are no editorial levels
//     and the page loads no literature values (window.SIZE_LITERATURE);
//   - measure "nutzer" (direct users), zeroData "ignore" (a node without users gets the smallest size);
//   - no list bonus (the table of great theorems is not loaded), no override.
// The other values (p, sMin, sMax) are those of weights.js.
//
// Limits of size-score.js: its function `facts` counts the distinct conclusions that use a node, not the proofs. The
// model of 1900 (scripts/model.js) counts the proofs (field `users`), and the page draws buildings with that number
// (map-core.js, meaning). size-score.js sets on this map only the width of the bridge decks and the spacing in
// place-elements.js (as on the map 1830).
window.SIZE_SETTINGS = {
  weights: { a: 1, b: 0, c: 0 },
  p: 1.6,
  sMin: 6.5,
  sMax: 36,
  measure: "nutzer",
  zeroData: "ignore",
  listBonus: { recognised: 0, table: 0 },
  editorial: {},
  override: {},
};
