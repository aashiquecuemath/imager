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
  geometry:         null,   // geometry-tool shapes split by drawn lines
};

// Line drawing tool
let lineOverlays  = [];
let lineIdCounter = 0;
let drawMode      = false;
let drawStart     = null;   // {x,y} in SVG coords, set on first click

// After each rectangle render, store its SVG-space bounds for line intersection
const shapeGeometry = { rect: null, polygon: null, handles: [] };

// Options for current line being drawn (read from UI at draw time)
const lineDefaults = { color: '#333333', width: 2, style: 'solid' };

// Image overlays
let imageOverlays = [];
let imgIdCounter  = 0;

// Angles tool state
let angLines = [];
let angArcs  = [];
let _angLid  = 0;
let _angAid  = 0;

function _defLine(angle, type) {
  if (angle === undefined) angle = 0;
  if (type  === undefined) type  = 'ray';
  return {
    id:        ++_angLid,
    angle:     angle,
    length:    110,
    type:      type,    // 'ray' | 'line' | 'segment'
    extend:    false,
    arrow:     true,
    color:     '#1e293b',
    width:     2.5,
    style:     'solid',
    endLabel:  '',
    fromLabel: '',
  };
}

function _defArc() {
  var n = angLines.length;
  // i1/i2 are encoded as lineIndex*2 + dir (0=forward end, 1=backward end)
  return {
    id:         ++_angAid,
    i1:         n >= 2 ? (n - 2) * 2 : 0,
    i2:         n >= 2 ? (n - 1) * 2 : (n === 1 ? 1 : 0),
    label:       '',
    labelBold:   false,
    labelItalic: false,
    labelSize:   0,     // 0 = inherit global font size
    labelColor:  '',    // '' = use arc color
    radius:      40,
    rightAngle:  false,
    color:       '#e11d48',
    width:       1.8,
    sweep:       0,
    fill:        '',
    fillOp:      0.15,
  };
}
