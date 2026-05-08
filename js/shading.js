'use strict';

// Returns the shading boolean array for `key`, initialising from defaultFn
// when the array is null (reset) or the total has changed.
function getShading(key, total, defaultFn) {
  if (!shading[key] || shading[key].length !== total) {
    shading[key] = Array.from({ length: total }, (_, i) => defaultFn(i));
  }
  return shading[key];
}

// Force re-initialisation on next getShading call (used when numerator changes).
function resetShading(key) {
  shading[key] = null;
}

function countShaded(key) {
  return shading[key] ? shading[key].filter(Boolean).length : 0;
}
