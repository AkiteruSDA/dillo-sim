/**
 * Whether the current system is little endian.
 * @returns boolean
 */
function isLittleEndian() {
  let u16 = new Uint16Array([0x9876]);
  let u8 = new Uint8Array(u16.buffer);
  return u8[0] === 0x76;
}

/**
 * Dillo's current state in subpixels.
 * @type {Object<number>}
 */
export const Dillo = {
  X_POS: 0x14D000,
  Y_POS: 0x0A9D00,
  X_SPEED: -0x0600,
  Y_SPEED: 0
};

/**
 * 16-bit view of the current RNG state.
 * @type {Uint16Array}
 */
export const Rng16 = new Uint16Array(1);

/**
 * 8-bit view of the current RNG state.
 * @type {Uint8Array}
 */
export const Rng8 = new Uint8Array(Rng16.buffer);

/**
 * 16-bit fields for the current RNG state.
 * @type {Object<number>}
 */
export const RngFields16 = {
  LO: 0
};

/**
 * 8-bit fields for the current RNG state.
 * @type {Object<number>}
 */
export const RngFields8 = isLittleEndian() ? {
  HI: 1,
  LO: 0
} : {
  HI: 0,
  LO: 1
};
