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
 * 32-bit view of Dillo's current state.
 * @type {Uint32Array}
 */
export const Dillo = new Uint32Array(4);

/**
 * 32-bit fields for Dillo's current state.
 * @type {Object<number>}
 */
export const Fields = {
  X_POS: 0,
  Y_POS: 1,
  X_SPEED: 2,
  Y_SPEED: 3
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
