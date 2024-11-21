import {
  Dillo,
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
  for (let i = 0; i < rolls; i++) {
    let nextHi = (Rng16[RngFields16.LO] * 3) >> 8;
    let nextLo = Math.floor(Rng16[RngFields16.LO] * 3 / 256) + Rng16[RngFields16.LO];
    Rng8[RngFields8.HI] = nextHi;
    Rng8[RngFields8.LO] = nextLo;
  }
}

/**
 * Reset Dillo to his initial position/speed with the given subpixels.
 * @param {number=} xSubpixel
 * @param {number=} ySubpixel
 */
function resetDillo(xSubpixel = 0, ySubpixel = 0) {
  Dillo.X_POS = 0x14AC00 | xSubpixel;
  Dillo.Y_POS = 0x0A9D00 | ySubpixel;
  Dillo.X_SPEED = -0x0600;
  Dillo.Y_SPEED = 0;
}

/**
 * Update Dillo's state and the RNG.
 * Returns true if Dillo has stopped rolling.
 * @returns {boolean}
 */
function updateState() {
  const SPEED = 0x043B;

  const LEFT_THRESHOLD = 0x141F00;
  const TOP_THRESHOLD = 0x0A1D00;
  const RIGHT_THRESHOLD = 0x14E000;
  const BOTTOM_THRESHOLD = 0x0AA200;

  // Update Dillo's position
  Dillo.X_POS += Dillo.X_SPEED;
  Dillo.Y_POS += Dillo.Y_SPEED;

  // Flags for RNG rolls and checks
  let collision = false;
  let endCheck = false;

  // Check collision
  if (Dillo.X_POS < LEFT_THRESHOLD) {
    collision = true;
    Dillo.X_POS = LEFT_THRESHOLD | (Dillo.X_POS & 0xFF);
    Dillo.X_SPEED = SPEED;
    if (Dillo.Y_SPEED === 0) {
      // Initial left wall hit
      Dillo.Y_SPEED = -SPEED;
      endCheck = true;
    }
  } else if (Dillo.Y_POS < TOP_THRESHOLD) {
    collision = true;
    Dillo.Y_POS = TOP_THRESHOLD | (Dillo.Y_POS & 0xFF);
    Dillo.Y_SPEED = SPEED;
  } else if (Dillo.X_POS > RIGHT_THRESHOLD) {
    collision = true;
    Dillo.X_POS = RIGHT_THRESHOLD | (Dillo.X_POS & 0xFF);
    Dillo.X_SPEED = -SPEED;
  } else if (Dillo.Y_POS > BOTTOM_THRESHOLD) {
    collision = true;
    endCheck = true;
    Dillo.Y_POS = BOTTOM_THRESHOLD | (Dillo.Y_POS & 0xFF);
    Dillo.Y_SPEED = -SPEED;
  }

  // Roll the RNG and check if his rolling is over
  rollRng();
  if (collision) {
    rollRng(9);
    if (endCheck) {
      rollRng();
    }
  }

  return false;
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
let longestSim = Object.keys(Results).reduce((prev, curr) => {
  return Results[curr] > Results[prev] ? curr : prev;
}, INITIAL_RNG);

// Print the longest simulation to the console.
console.log(`Longest simulation at RNG value 0x${Number(longestSim).toString(16).padStart(4, "0")}`);
