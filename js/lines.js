'use strict';

/* ── Line-segment / geometry helpers ── */

// Returns intersection point of two line segments, or null.
function segIntersect(ax1,ay1,ax2,ay2, bx1,by1,bx2,by2) {
  const dax=ax2-ax1, day=ay2-ay1, dbx=bx2-bx1, dby=by2-by1;
  const denom = dax*dby - day*dbx;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((bx1-ax1)*dby - (by1-ay1)*dbx) / denom;
  const u = ((bx1-ax1)*day - (by1-ay1)*dax) / denom;
  if (t<-1e-9||t>1+1e-9||u<-1e-9||u>1+1e-9) return null;
  return { x: ax1+t*dax, y: ay1+t*day };
}

// Returns up to 2 unique intersection points of a line with a rect.
function lineRectIntersections(lx1,ly1,lx2,ly2, rx,ry,rw,rh) {
  const edges = [
    [rx,ry, rx+rw,ry],          // top
    [rx+rw,ry, rx+rw,ry+rh],    // right
    [rx+rw,ry+rh, rx,ry+rh],    // bottom
    [rx,ry+rh, rx,ry],           // left
  ];
  const pts = [];
  for (const [ex1,ey1,ex2,ey2] of edges) {
    const p = segIntersect(lx1,ly1,lx2,ly2, ex1,ey1,ex2,ey2);
    if (p && !pts.some(q => Math.abs(q.x-p.x)<0.5 && Math.abs(q.y-p.y)<0.5)) {
      pts.push(p);
    }
    if (pts.length === 2) break;
  }
  return pts;
}

/* ── Polygon split: split by drawn lines using the infinite line through each segment ── */
// Returns an array of N polygons (N >= 2), or null if no valid split exists.
// Each line is extended to an infinite line and used to bisect every current region
// it passes through — this correctly handles crossing lines (N > 2 regions).
function getPolygonSplit(verts) {
  if (!lineOverlays.length || !verts || verts.length < 3) return null;

  let regions = [verts];
  let anySplit = false;

  for (const line of lineOverlays) {
    const next = [];
    for (const poly of regions) {
      const split = _splitPolyByLine(poly, line.x1, line.y1, line.x2, line.y2);
      if (split) {
        next.push(...split);
        anySplit = true;
      } else {
        next.push(poly);
      }
    }
    regions = next;
  }

  return anySplit ? regions : null;
}

// Split a polygon by the INFINITE line through (lx1,ly1)→(lx2,ly2).
// Returns [frontPoly, backPoly] or null if the line does not bisect the polygon.
function _splitPolyByLine(poly, lx1, ly1, lx2, ly2) {
  const ldx = lx2 - lx1, ldy = ly2 - ly1;
  const EPS = 0.5;

  // Signed distance of each vertex from the line
  const d = poly.map(([x, y]) => ldx * (y - ly1) - ldy * (x - lx1));

  if (!d.some(v => v > EPS) || !d.some(v => v < -EPS)) return null;

  const front = [], back = [];
  const n = poly.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const di = d[i];

    if (di >= -EPS) front.push(poly[i]);
    if (di <=  EPS) back.push(poly[i]);

    // Edge crosses the line — compute and share the intersection point
    if ((di > EPS && d[j] < -EPS) || (di < -EPS && d[j] > EPS)) {
      const t  = di / (di - d[j]);
      const ix = fmt(poly[i][0] + t * (poly[j][0] - poly[i][0]));
      const iy = fmt(poly[i][1] + t * (poly[j][1] - poly[i][1]));
      front.push([ix, iy]);
      back.push([ix, iy]);
    }
  }

  if (front.length < 3 || back.length < 3) return null;
  return [front, back];
}

/* ── Extract grid-cut positions from lines crossing a rectangle ── */
// Returns { hCuts: [y,...], vCuts: [x,...] } sorted, in rect-local space.
function getRectLineDivisions() {
  const geo = shapeGeometry.rect;
  if (!geo || !lineOverlays.length) return { hCuts: [], vCuts: [] };

  const hCuts = [], vCuts = [];
  for (const l of lineOverlays) {
    const pts = lineRectIntersections(l.x1,l.y1,l.x2,l.y2, geo.x,geo.y,geo.w,geo.h);
    if (pts.length < 2) continue;

    const dx = Math.abs(l.x2 - l.x1);
    const dy = Math.abs(l.y2 - l.y1);
    const angle = Math.atan2(dy, dx); // 0=horizontal, π/2=vertical

    if (angle < Math.PI/6) {
      // Nearly horizontal → horizontal cut at average y of intersection points
      const cy = (pts[0].y + pts[1].y) / 2;
      if (cy > geo.y + 1 && cy < geo.y + geo.h - 1) hCuts.push(fmt(cy));
    } else if (angle > Math.PI/3) {
      // Nearly vertical → vertical cut at average x
      const cx = (pts[0].x + pts[1].x) / 2;
      if (cx > geo.x + 1 && cx < geo.x + geo.w - 1) vCuts.push(fmt(cx));
    }
  }

  return {
    hCuts: [...new Set(hCuts)].sort((a,b)=>a-b),
    vCuts: [...new Set(vCuts)].sort((a,b)=>a-b),
  };
}

/* ── Inject line overlays into SVG string ── */
function injectLineOverlays(svg) {
  if (!lineOverlays.length) return svg;

  // Build arrow defs if any line needs it
  const arrowLines = lineOverlays.filter(l => l.style === 'arrow' || l.style === 'double-arrow');
  let defsInsert = '';
  if (arrowLines.length) {
    // Use first arrow line's color for marker (simplification)
    const col = arrowLines[0].color;
    defsInsert =
      `\n<defs>` +
      `<marker id="lo-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">` +
      `<path d="M0,0 L10,5 L0,10 Z" fill="${col}"/>` +
      `</marker>` +
      `<marker id="lo-arr-rev" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">` +
      `<path d="M0,0 L10,5 L0,10 Z" fill="${col}"/>` +
      `</marker>` +
      `</defs>`;
  }

  const els = lineOverlays.map(l => {
    let dash = '';
    if (l.style === 'dashed')  dash = ` stroke-dasharray="10 6"`;
    if (l.style === 'dotted')  dash = ` stroke-dasharray="2 5"`;

    let markers = '';
    if (l.style === 'arrow')        markers = ` marker-end="url(#lo-arr)"`;
    if (l.style === 'double-arrow') markers = ` marker-start="url(#lo-arr-rev)" marker-end="url(#lo-arr)"`;

    return `<line data-line-id="${l.id}"` +
      ` x1="${fmt(l.x1)}" y1="${fmt(l.y1)}" x2="${fmt(l.x2)}" y2="${fmt(l.y2)}"` +
      ` stroke="${l.color}" stroke-width="${l.width}" stroke-linecap="round"` +
      `${dash}${markers} pointer-events="none"/>`;
  }).join('\n');

  return svg.replace('</svg>', defsInsert + '\n' + els + '\n</svg>');
}

/* ── Line overlay list UI ── */
function updateLineList() {
  const list = $('line-list');
  if (!list) return;
  list.innerHTML = lineOverlays.length
    ? lineOverlays.map(l =>
        `<div class="text-item">` +
        `<span style="display:inline-block;width:20px;height:3px;background:${l.color};` +
        `${l.style==='dashed'?'border-top:2px dashed '+l.color+';background:none':''}` +
        `${l.style==='dotted'?'border-top:2px dotted '+l.color+';background:none':''}` +
        `;vertical-align:middle;margin-right:6px"></span>` +
        `<span class="text-item-label">${l.style}</span>` +
        `<button class="text-item-del" data-lid="${l.id}" title="Remove">×</button>` +
        `</div>`
      ).join('')
    : '';
}

/* ── Add line after user draws in the preview ── */
function _resetSplitShading() {
  resetShading('rectangle');
  resetShading('triangleSplit');
  resetShading('pentagonSplit');
  resetShading('hexagonSplit');
}

function commitLine(x1,y1,x2,y2) {
  const dist = Math.hypot(x2-x1, y2-y1);
  if (dist < 2) return;
  lineOverlays.push({
    id:     ++lineIdCounter,
    x1, y1, x2, y2,
    color:  val('line-color')  || '#333333',
    width:  parseFloat(val('line-width')) || 2,
    style:  val('line-style')  || 'solid',
  });
  _resetSplitShading();
  updateLineList();
  render();
}

function removeLineOverlay(id) {
  lineOverlays = lineOverlays.filter(l => l.id !== id);
  _resetSplitShading();
  updateLineList();
  render();
}

function clearAllLines() {
  lineOverlays = [];
  _resetSplitShading();
  updateLineList();
  render();
}

/* ── Draw-mode cursor handling (called from events.js) ── */
function enterDrawMode() {
  drawMode  = true;
  drawStart = null;
  $('svgPreview').classList.add('draw-mode');
  $('btn-draw-line').textContent = 'Cancel Draw';
  $('btn-draw-line').classList.add('active-draw');
}

function exitDrawMode() {
  drawMode  = false;
  drawStart = null;
  $('svgPreview').classList.remove('draw-mode');
  const btn = $('btn-draw-line');
  if (btn) { btn.textContent = '✏ Draw Line'; btn.classList.remove('active-draw'); }
  // Remove preview line if any
  const prev = $('svgPreview').querySelector('[data-draw-preview]');
  if (prev) prev.remove();
}
