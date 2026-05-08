'use strict';

const SCHEMES = {
  ocean:   { dark: '#006B6B', mid: '#0080C7', light: '#87CEEB', pale: '#B0E0E6' },
  forest:  { dark: '#1B5E20', mid: '#4CAF50', light: '#A5D6A7', pale: '#E8F5E8' },
  magenta: { dark: '#8B008B', mid: '#C71585', light: '#FF69B4', pale: '#FFB6C1' },
  golden:  { dark: '#664400', mid: '#FF8C00', light: '#FFDB58', pale: '#FFFDD0' },
};

let currentShape  = 'numberLine';
let currentScheme = 'ocean';
let textOverlays  = [];
let oidCounter    = 0;
let isDragging    = false;

// Shading for fraction/grid shapes
const shading = {
  'fraction-0':     null,
  'fraction-1':     null,
  'fraction-2':     null,
  'fraction-3':     null,
  rectangle:        null,   // grid cells created by drawn lines
  triangleSplit:    null,   // equilateral triangle split by a drawn line
  pentagonSplit:    null,
  hexagonSplit:     null,
};

// Line drawing tool
let lineOverlays  = [];
let lineIdCounter = 0;
let drawMode      = false;
let drawStart     = null;   // {x,y} in SVG coords, set on first click

// After each rectangle render, store its SVG-space bounds for line intersection
const shapeGeometry = { rect: null, polygon: null };

// Options for current line being drawn (read from UI at draw time)
const lineDefaults = { color: '#333333', width: 2, style: 'solid' };

// Image overlays
let imageOverlays = [];
let imgIdCounter  = 0;
