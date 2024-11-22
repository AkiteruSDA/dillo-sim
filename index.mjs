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
  Dillo.X_POS = 0x14D000 | xSubpixel;
  Dillo.Y_POS = (ySubpixel >= 0x86 ? 0x0A9C00 : 0x0A9D00) | ySubpixel;
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
  const RIGHT_RESET = 0x14E000;
  const RIGHT_THRESHOLD = 0x14E100;
  const BOTTOM_RESET = 0x0AA200;
  const BOTTOM_THRESHOLD = 0x0A9F00;

  // Update Dillo's position
  Dillo.X_POS += Dillo.X_SPEED;
  Dillo.Y_POS += Dillo.Y_SPEED;

  // Flags for RNG rolls and checks
  let collision = false;
  let endCheck = false;
  let initial = false;

  // Check collision
  if (Dillo.X_POS < LEFT_THRESHOLD) {
    collision = true;
    Dillo.X_POS = LEFT_THRESHOLD | (Dillo.X_POS & 0xFF);
    Dillo.X_SPEED = SPEED;
    if (Dillo.Y_SPEED === 0) {
      // Initial left wall hit
      Dillo.Y_SPEED = -SPEED;
      initial = true;
      endCheck = true;
    }
  } else if (Dillo.Y_POS < TOP_THRESHOLD) {
    collision = true;
    Dillo.Y_POS = TOP_THRESHOLD | (Dillo.Y_POS & 0xFF);
    Dillo.Y_SPEED = SPEED;
  } else if (Dillo.X_POS >= RIGHT_THRESHOLD) {
    collision = true;
    Dillo.X_POS = RIGHT_RESET | (Dillo.X_POS & 0xFF);
    Dillo.X_SPEED = -SPEED;
  } else if (Dillo.Y_POS >= BOTTOM_THRESHOLD) {
    collision = true;
    endCheck = true;
    Dillo.Y_POS = BOTTOM_RESET | (Dillo.Y_POS & 0xFF);
    Dillo.Y_SPEED = -SPEED;
  }

  let result = false;

  // Roll the RNG and check if his rolling is over
  rollRng();
  if (collision) {
    if (initial) {
      rollRng(9);
    }
    if (endCheck) {
      rollRng();
      result = (Rng8[RngFields8.LO] & 0x0F) < 6;
    }
    if (!initial) {
      rollRng(9);
    }
  }

  return result;
}

// Initialize the RNG value.
Rng16[RngFields16.LO] = 0xD5C1;

// The initial RNG value for all of the simulations.
const INITIAL_RNG = Rng16[RngFields16.LO];

// The results for the longest roll
let maxX = 0;
let maxY = 0;
let maxCount = 0;
let maxRng = 0;

// Run simulations until every RNG value has been exhausted.
do {
  // The initial RNG value for this set of simulations.
  const INITIAL_RNG_THIS = Rng16[RngFields16.LO];

  for (let xSub = 0; xSub <= 0xFF; xSub++) {
    for (let ySub = 0; ySub <= 0xFF; ySub++) {
      // The state update count for this simulation.
      let count = 0;

      // Reset Dillo's state.
      resetDillo(xSub, ySub);

      // Dillo's starting position
      let startX = Dillo.X_POS;
      let startY = Dillo.Y_POS;

      // Update Dillo's state until he stops rolling.
      while (!updateState()) {
        count++;
      }

      // If a new longest roll occured, update the results
      if (count > maxCount) {
        maxX = startX;
        maxY = startY;
        maxCount = count;
        maxRng = INITIAL_RNG_THIS;
      }

      // Reset the RNG for the next set of subpixels.
      Rng16[RngFields16.LO] = INITIAL_RNG_THIS;
    }
  }

  console.log(`Finished RNG value 0x${Rng16[RngFields16.LO].toString(16).padStart(4, "0")} at ${new Date().toISOString()}`);

  // Increment the RNG for the next inital RNG value.
  rollRng();
} while (Rng16[RngFields16.LO] !== INITIAL_RNG)

// Print the longest simulation to the console.
console.log(`Start X Position: 0x${maxX.toString(16).padStart(6, "0")}`);
console.log(`Start Y Position: 0x${maxY.toString(16).padStart(6, "0")}`);
console.log(`RNG: 0x${maxRng.toString(16).padStart(4, "0")}`);
console.log(`Time: ${maxCount} frames or ${maxCount / 60.099} seconds`);
console.log();
console.log("To recreate in-game, find the frame where Dillo's state first changes to 8 at 0x0e6b and plug these values in (little endian) on that frame.");
console.log("RNG Address: 0x0ba6");
console.log("Dillo X Position Address: 0x0e6c");
console.log("Dillo Y Position Address: 0x0e6f");
