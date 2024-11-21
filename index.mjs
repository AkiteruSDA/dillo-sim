import {
  Dillo,
  Fields,
  Rng16,
  Rng8,
  RngFields16,
  RngFields8
} from "./state.mjs";

/**
 * Increment the RNG value using the algorithm.
 * @param {number=} rolls
 */
function rollRng(rolls = 1) {

}

/**
 * Reset Dillo to his initial position/speed.
 */
function resetDillo() {
  Dillo[Fields.X_POS] = 0x14AC41;
  Dillo[Fields.Y_POS] = 0x0A9D5D;
  Dillo[Fields.X_SPEED] = 0xFA00;
  Dillo[Fields.Y_SPEED] = 0x0000;
}

/**
 * Update Dillo's state and the RNG.
 * Returns true if Dillo has stopped rolling.
 * @returns {boolean}
 */
function updateState() {
  
}

// Initialize the RNG value.
Rng16[RngFields16.LO] = 0x3959;

// The number of state updates for each starting RNG value.
const Results = {};

// The initial RNG value for all of the simulations.
const INITIAL_RNG = Rng16[RngFields16.LO];

// Run simulations until every RNG value has been exhausted.
do {
  // The initial RNG value for this simulation.
  const INITIAL_RNG_THIS = Rng16[RngFields16.LO];

  // The state update count for this simulation.
  let count = 0;

  // Reset Dillo's state.
  resetDillo();

  // Update Dillo's state until he stops rolling.
  while (!updateState()) {
    count++;
  }

  // Add the result of this simulation to the results.
  Results[INITIAL_RNG_THIS] = count;

  // Reset and increment the RNG for the next simulation.
  Rng16[RngFields16.LO] = INITIAL_RNG_THIS;
  rollRng();
} while (Rng16[RngFields16.LO] !== INITIAL_RNG)

// Get the RNG value with the longest simulation.
let longest = Object.keys(Results).reduce((prev, curr) => {
  return Results[curr] > Results[prev] ? curr : prev;
}, INITIAL_RNG);

// Print the longest simulation to the console.
console.log(`Longest simulation at RNG value ${longest}`);
