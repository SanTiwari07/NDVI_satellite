/**
 * colorUtils.js
 * Palette mapping and conversion utilities.
 */

// EOS-style diverging palette: Dark Red (bad) -> Yellow -> Dark Green (good)
const EOS_PALETTE = [
    '#ad0028', '#c5142a', '#e02d2c', '#ef4c3a', '#fe6c4a', 
    '#ff8d5a', '#ffab69', '#ffc67d', '#ffe093', '#ffefab', 
    '#fdfec2', '#eaf7ac', '#d5ef94', '#b9e383', '#9bd873', 
    '#77ca6f', '#53bd6b', '#14aa60', '#009755', '#007e47', '#007e47'
];

/** Convert NDVI/CVI/EVI value (-1 to 1) to a hex color using EOS palette */
export function ndviToColor(value) {
  if (value === null || value === undefined) return '#4b5563'; // fallback grey
  
  // Values below 0.0 usually mean no vegetation (water, bare rock)
  if (value <= 0) return EOS_PALETTE[0];
  if (value >= 1) return EOS_PALETTE[EOS_PALETTE.length - 1];

  const scaled = value * (EOS_PALETTE.length - 1);
  const idx = Math.floor(scaled);

  return EOS_PALETTE[idx] || "#007f00";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sentinel-1 Radar palettes (separate from the vegetation EOS palette)
// ─────────────────────────────────────────────────────────────────────────────

// Moisture-oriented layers (SMI, VV, VH): dry/low -> wet/high = red -> yellow -> green
const RADAR_MOISTURE_PALETTE = [
    '#b30000', '#e34a33', '#fc8d59', '#fdcc8a',
    '#ffffbf', '#c2e699', '#78c679', '#31a354', '#006837',
];

// RVI / VV-VH ratio: a distinct sequential (blue) palette so they don't read as moisture
const RADAR_SEQUENTIAL_PALETTE = [
    '#f7fbff', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c',
];

// Per-band normalisation bounds — must mirror RADAR_VIS_BOUNDS in backend/config.py.
export const RADAR_BOUNDS = {
    smi:   { min: 0.0,   max: 1.0 },
    rvi:   { min: 0.0,   max: 1.0 },
    ratio: { min: 2.0,   max: 16.0 },
    vv:    { min: -22.0, max: -6.0 },
    vh:    { min: -28.0, max: -12.0 },
};

const RADAR_MOISTURE_BANDS = ['smi', 'vv', 'vh'];

function _pickPalette(band) {
    return RADAR_MOISTURE_BANDS.includes(band)
        ? RADAR_MOISTURE_PALETTE
        : RADAR_SEQUENTIAL_PALETTE;
}

/**
 * Convert a radar band value to a hex colour.
 * Each band is normalised to 0..1 against its physical bounds, then mapped
 * onto the appropriate palette (moisture vs sequential).
 */
export function radarToColor(band, value) {
    if (value === null || value === undefined || isNaN(value)) return '#4b5563';

    const b = (band || 'smi').toLowerCase();
    const bounds = RADAR_BOUNDS[b] || { min: 0, max: 1 };
    const palette = _pickPalette(b);

    let t = (value - bounds.min) / (bounds.max - bounds.min);
    if (t <= 0) return palette[0];
    if (t >= 1) return palette[palette.length - 1];

    const idx = Math.floor(t * (palette.length - 1));
    return palette[idx] || palette[0];
}

/** Convert "rgb(r,g,b)" and "#RRGGBB" -> "rgba(r,g,b,alpha)" for canvas gradient stops */
export function _rgba(colorStr, alpha) {
  if (colorStr.startsWith('#')) {
    const c = colorStr.substring(1).split('');
    let hex = c;
    if (c.length === 3) {
      hex = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    hex = hex.join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return colorStr.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
}
