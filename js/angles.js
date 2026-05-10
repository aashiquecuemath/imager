'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   Angles Tool  —  js/angles.js
   State lives in state.js: angLines, angArcs, _defLine, _defArc.
   LaTeX arc labels reuse _renderLabel / _getMathInfo from numberLine.js.
══════════════════════════════════════════════════════════════════════════ */

// ── DOM helpers ───────────────────────────────────────────────────────────
function _aW()    { return num('ang-canvas-w') || 320; }
function _aH()    { return num('ang-canvas-h') || 320; }
function _aVx()   { return parseFloat(val('ang-vx'))  || 50; }
function _aVy()   { return parseFloat(val('ang-vy'))  || 50; }
function _aVlbl() { return val('ang-vertex-lbl'); }
function _aVdot() { return chk('ang-vertex-dot'); }
function _aFs()   { return num('ang-lbl-size')   || 14; }
function _aLc()   { return val('ang-lbl-color')  || '#1e293b'; }
function _aFw()   { return val('ang-lbl-weight') || 'normal'; }
function _aFi()   { return val('ang-lbl-fstyle') || 'normal'; }
function _aFf()   { return val('ang-lbl-family') || 'Arial,sans-serif'; }

// ── SVG generator ─────────────────────────────────────────────────────────
function generateAngle() {
  var W = _aW(), H = _aH();
  var ox = W * _aVx() / 100;
  var oy = H * _aVy() / 100;
  var fs = _aFs(), lc = _aLc(), fw = _aFw(), fi = _aFi(), ff = _aFf();
  var ta = 'font-family="' + ff + '" font-size="' + fs + '" font-weight="' + fw + '" font-style="' + fi + '"';
  var bold   = fw === 'bold';
  var italic = fi === 'italic';

  var s = svgOpen(W, H);
  var renderedFromLabels = {};

  // ── Lines / rays ──────────────────────────────────────────────────────
  for (var li = 0; li < angLines.length; li++) {
    var ln = angLines[li];
    var rad = -ln.angle * Math.PI / 180;
    var cs = Math.cos(rad), sn = Math.sin(rad);
    var x1, y1;
    if (ln.type === 'line') {
      x1 = ox - cs * ln.length; y1 = oy - sn * ln.length;
    } else if (ln.extend) {
      x1 = ox - cs * ln.length * 0.55; y1 = oy - sn * ln.length * 0.55;
    } else {
      x1 = ox; y1 = oy;
    }
    var x2 = ox + cs * ln.length, y2 = oy + sn * ln.length;
    var dash = ln.style === 'dashed' ? ' stroke-dasharray="8,4"'
             : ln.style === 'dotted' ? ' stroke-dasharray="2,4"' : '';
    // Shorten line endpoints so arrowhead tip covers the line end completely
    var AL = 10;
    var lx1 = x1, ly1 = y1, lx2 = x2, ly2 = y2;
    if (ln.arrow) {
      if (ln.type === 'ray' || ln.type === 'line') { lx2 = x2 - cs*AL; ly2 = y2 - sn*AL; }
      if (ln.type === 'line')                      { lx1 = x1 + cs*AL; ly1 = y1 + sn*AL; }
    }
    s += '\n<line data-ang-lid="' + ln.id + '" x1="' + fmt(lx1) + '" y1="' + fmt(ly1) + '" x2="' + fmt(lx2) + '" y2="' + fmt(ly2) + '" stroke="' + ln.color + '" stroke-width="' + ln.width + '"' + dash + '/>';
    if (ln.arrow) {
      if (ln.type === 'ray' || ln.type === 'line') s += _angArrow(x2, y2,  cs,  sn, ln.color);
      if (ln.type === 'line')                      s += _angArrow(x1, y1, -cs, -sn, ln.color);
    }
    if (ln.endLabel) {
      var elx = ox + cs * (ln.length + fs*0.75 + 9);
      var ely = oy + sn * (ln.length + fs*0.75 + 9);
      s += _renderLabel(ln.endLabel, elx, ely, 'middle', fs, ff, bold, italic, lc, true);
    }
    if (ln.fromLabel && !renderedFromLabels[ln.fromLabel]) {
      renderedFromLabels[ln.fromLabel] = true;
      s += _renderLabel(ln.fromLabel, ox - cs*(fs+7), oy - sn*(fs+7), 'middle', fs, ff, bold, italic, lc, true);
    }
  }

  // ── Angle arcs ────────────────────────────────────────────────────────
  for (var ai = 0; ai < angArcs.length; ai++) {
    var arc = angArcs[ai];
    // i1/i2 encoded as lineIndex*2 + dir (0=forward, 1=backward)
    var idx1 = arc.i1 >> 1, dir1 = arc.i1 & 1;
    var idx2 = arc.i2 >> 1, dir2 = arc.i2 & 1;
    var l1 = angLines[idx1], l2 = angLines[idx2];
    if (!l1 || !l2 || arc.i1 === arc.i2) continue;
    var deg1 = l1.angle - 180 * dir1;
    var deg2 = l2.angle - 180 * dir2;
    var svgA1 = -deg1 * Math.PI / 180;
    var svgA2 = -deg2 * Math.PI / 180;
    var r = arc.radius;
    var diffDeg = ((deg2 - deg1) % 360 + 360) % 360;
    if (diffDeg > 180) diffDeg = 360 - diffDeg;
    // Per-arc label settings
    var alfs = (arc.labelSize > 0) ? arc.labelSize : fs;
    var alc  = arc.labelColor || arc.color;
    var alb  = arc.labelBold   || false;
    var ali  = arc.labelItalic || false;

    if (arc.rightAngle || Math.abs(diffDeg - 90) < 1.5) {
      var sz = r * 0.55;
      var c1r = Math.cos(svgA1), s1r = Math.sin(svgA1);
      var c2r = Math.cos(svgA2), s2r = Math.sin(svgA2);
      s += '\n<polyline points="' + fmt(ox+c1r*sz) + ',' + fmt(oy+s1r*sz) + ' ' +
           fmt(ox+c1r*sz+c2r*sz) + ',' + fmt(oy+s1r*sz+s2r*sz) + ' ' +
           fmt(ox+c2r*sz) + ',' + fmt(oy+s2r*sz) + '" fill="none" stroke="' + arc.color + '" stroke-width="' + arc.width + '"/>';
      if (arc.label) {
        var midA0 = (svgA1 + svgA2) / 2;
        s += _renderLabel(arc.label, ox+Math.cos(midA0)*(r+alfs*0.8), oy+Math.sin(midA0)*(r+alfs*0.8), 'middle', alfs, ff, alb, ali, alc, true);
      }
    } else {
      var span = arc.sweep === 0
        ? (((svgA1 - svgA2) + 2*Math.PI) % (2*Math.PI))
        : (((svgA2 - svgA1) + 2*Math.PI) % (2*Math.PI));
      var large = span > Math.PI ? 1 : 0;
      var sx2 = fmt(ox + Math.cos(svgA1)*r), sy2 = fmt(oy + Math.sin(svgA1)*r);
      var ex2 = fmt(ox + Math.cos(svgA2)*r), ey2 = fmt(oy + Math.sin(svgA2)*r);
      if (arc.fill) s += '\n<path d="M' + fmt(ox) + ',' + fmt(oy) + ' L' + sx2 + ',' + sy2 + ' A' + r + ',' + r + ' 0 ' + large + ',' + arc.sweep + ' ' + ex2 + ',' + ey2 + ' Z" fill="' + arc.fill + '" fill-opacity="' + arc.fillOp + '" stroke="none"/>';
      s += '\n<path d="M' + sx2 + ',' + sy2 + ' A' + r + ',' + r + ' 0 ' + large + ',' + arc.sweep + ' ' + ex2 + ',' + ey2 + '" fill="none" stroke="' + arc.color + '" stroke-width="' + arc.width + '"/>';
      if (arc.label) {
        var midA = arc.sweep === 0 ? svgA1 - span/2 : svgA1 + span/2;
        var loff = r + alfs * 0.85 + 2;
        s += _renderLabel(arc.label, ox + Math.cos(midA)*loff, oy + Math.sin(midA)*loff, 'middle', alfs, ff, alb, ali, alc, true);
      }
    }
  }

  // ── Vertex dot and label ──────────────────────────────────────────────
  if (_aVdot()) s += '\n<circle cx="' + fmt(ox) + '" cy="' + fmt(oy) + '" r="4.5" fill="' + lc + '"/>';
  var vl = _aVlbl();
  if (vl && !renderedFromLabels[vl]) {
    var d = _bestLabelDir();
    s += _renderLabel(vl, ox + d.x*(fs+8), oy + d.y*(fs+8), 'middle', fs, ff, bold, italic, lc, true);
  }

  s += '\n</svg>';
  return s;
}

function _angArrow(x, y, cs, sn, color) {
  var AL = 10, AW = 5;
  return '\n<polygon points="' + fmt(x) + ',' + fmt(y) + ' ' +
    fmt(x-cs*AL+sn*AW) + ',' + fmt(y-sn*AL-cs*AW) + ' ' +
    fmt(x-cs*AL-sn*AW) + ',' + fmt(y-sn*AL+cs*AW) + '" fill="' + color + '"/>';
}

function _angLbl(x, y, text, ta, fill) {
  return '\n<text x="' + fmt(x) + '" y="' + fmt(y) + '" ' + ta + ' fill="' + fill + '" text-anchor="middle" dominant-baseline="central" paint-order="stroke fill" stroke="white" stroke-width="3">' + escXml(text) + '</text>';
}

function _bestLabelDir() {
  if (!angLines.length) return { x: -0.7, y: 0.7 };
  var best = { x: -0.7, y: 0.7 }, bestScore = -Infinity;
  for (var i = 0; i < 16; i++) {
    var a = i * Math.PI / 8, dx = Math.cos(a), dy = Math.sin(a), minGap = Infinity;
    for (var j = 0; j < angLines.length; j++) {
      var ra = -angLines[j].angle * Math.PI / 180;
      var ang = Math.acos(Math.max(-1, Math.min(1, dx*Math.cos(ra) + dy*Math.sin(ra))));
      if (ang < minGap) minGap = ang;
    }
    if (minGap > bestScore) { bestScore = minGap; best = { x: dx, y: dy }; }
  }
  return best;
}

// ── Drag handles (injected into SVG preview after each render) ────────────
function attachAngleDragHandles() {
  if (currentShape !== 'angle') return;
  var preview = document.getElementById('svgPreview');
  if (!preview) return;
  var svgEl = preview.querySelector('svg');
  if (!svgEl) return;

  var ns = 'http://www.w3.org/2000/svg';
  var W = _aW(), H = _aH();
  var ox = W * _aVx() / 100, oy = H * _aVy() / 100;

  for (var i = 0; i < angLines.length; i++) {
    (function(ln) {
      var rad = -ln.angle * Math.PI / 180;

      function _makeHandle(cx, cy, isBackward) {
        var c = document.createElementNS(ns, 'circle');
        c.setAttribute('cx', fmt(cx));
        c.setAttribute('cy', fmt(cy));
        c.setAttribute('r', '9');
        c.setAttribute('fill', 'rgba(74,158,255,0.2)');
        c.setAttribute('stroke', '#4A9EFF');
        c.setAttribute('stroke-width', '1.5');
        c.setAttribute('style', 'cursor:grab');
        c.setAttribute('pointer-events', 'all');
        c.setAttribute('data-ang-handle', ln.id);
        c.addEventListener('mousedown', function(e) {
          e.preventDefault(); e.stopPropagation();
          var moved = false;
          function onMove(ev) {
            moved = true;
            var cur = document.getElementById('svgPreview').querySelector('svg');
            if (!cur) return;
            var pt = svgLocalCoords(cur, ev.clientX, ev.clientY);
            var dx = pt.x - _aW() * _aVx() / 100;
            var dy = pt.y - _aH() * _aVy() / 100;
            var len = Math.sqrt(dx*dx + dy*dy);
            if (len < 20) return;
            // Backward handle: cursor is on opposite end, flip angle 180°
            ln.angle  = isBackward
              ? Math.round( Math.atan2(dy, dx) * 1800 / Math.PI) / 10
              : Math.round(-Math.atan2(dy, dx) * 1800 / Math.PI) / 10;
            ln.length = Math.round(len);
            render();
          }
          function onUp() {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            if (moved) renderAngUI();
          }
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        });
        svgEl.appendChild(c);
      }

      // Forward end handle (all types)
      _makeHandle(ox + Math.cos(rad) * ln.length, oy + Math.sin(rad) * ln.length, false);
      // Backward end handle (line type only)
      if (ln.type === 'line') {
        _makeHandle(ox - Math.cos(rad) * ln.length, oy - Math.sin(rad) * ln.length, true);
      }
    })(angLines[i]);
  }

  var vc = document.createElementNS(ns, 'circle');
  vc.setAttribute('cx', fmt(ox)); vc.setAttribute('cy', fmt(oy)); vc.setAttribute('r', '7');
  vc.setAttribute('fill', 'rgba(225,29,72,0.2)'); vc.setAttribute('stroke', '#e11d48');
  vc.setAttribute('stroke-width', '1.5'); vc.setAttribute('style', 'cursor:move');
  vc.setAttribute('pointer-events', 'all'); vc.setAttribute('data-ang-handle', 'vertex');
  vc.addEventListener('mousedown', function(e) {
    e.preventDefault(); e.stopPropagation();
    function onMove(ev) {
      var cur = document.getElementById('svgPreview').querySelector('svg');
      if (!cur) return;
      var pt = svgLocalCoords(cur, ev.clientX, ev.clientY);
      var vxEl = document.getElementById('ang-vx');
      var vyEl = document.getElementById('ang-vy');
      if (vxEl) vxEl.value = (Math.max(5, Math.min(95, pt.x / _aW() * 100))).toFixed(1);
      if (vyEl) vyEl.value = (Math.max(5, Math.min(95, pt.y / _aH() * 100))).toFixed(1);
      render();
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  svgEl.appendChild(vc);
}

// ── Dynamic UI ────────────────────────────────────────────────────────────
function renderAngUI() {
  var addRayBtn  = document.getElementById('btn-ang-add-ray');
  var addLineBtn = document.getElementById('btn-ang-add-line');
  var addArcBtn  = document.getElementById('btn-ang-add-arc');
  var DEFAULTS   = [0, 90, 180, 270];
  if (addRayBtn) addRayBtn.onclick = function() {
    angLines.push(_defLine(DEFAULTS[angLines.length % 4], 'ray'));
    renderAngUI(); render();
  };
  if (addLineBtn) addLineBtn.onclick = function() {
    angLines.push(_defLine(DEFAULTS[angLines.length % 4], 'line'));
    renderAngUI(); render();
  };
  if (addArcBtn) addArcBtn.onclick = function() {
    if (!angLines.length) return;
    angArcs.push(_defArc());
    renderAngUI(); render();
  };
  _renderAngLines();
  _renderAngArcs();
}

function _ea(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

function _sel3(opts, cur) {
  return opts.map(function(o) {
    return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>';
  }).join('');
}

function _angLineHTML(l, i) {
  return '<div class="ang-item" data-i="' + i + '">' +
    // Row 1: number + angle + length + delete
    '<div class="ang-row">' +
      '<span class="ang-num">' + (i+1) + '</span>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1">' +
        '<div><label>Angle °</label><input type="number" class="al-ang" value="' + l.angle + '" step="5" style="width:100%"></div>' +
        '<div><label>Length px</label><input type="number" class="al-len" value="' + l.length + '" min="20" max="500" style="width:100%"></div>' +
      '</div>' +
      '<button class="btn-ang-del al-del" title="Remove">✕</button>' +
    '</div>' +
    // Row 2: type + dash + width + color
    '<div style="display:grid;grid-template-columns:1fr 1fr 80px 44px;gap:6px;margin-top:5px">' +
      '<div><label>Type</label><select class="al-type" style="width:100%">' + _sel3([['ray','Ray →'],['line','Line ↔'],['segment','Segment']], l.type) + '</select></div>' +
      '<div><label>Dash</label><select class="al-style" style="width:100%">' + _sel3([['solid','Solid'],['dashed','Dashed'],['dotted','Dotted']], l.style) + '</select></div>' +
      '<div><label>Width</label><input type="number" class="al-w" value="' + l.width + '" min="0.5" max="8" step="0.5" style="width:100%"></div>' +
      '<div><label>Color</label><input type="color" class="al-color" value="' + l.color + '" style="width:100%;height:30px"></div>' +
    '</div>' +
    // Row 3: labels + checkboxes
    '<div style="display:grid;grid-template-columns:1fr 1fr auto auto;gap:6px;margin-top:5px;align-items:end">' +
      '<div><label>From label</label><input type="text" class="al-flbl" value="' + _ea(l.fromLabel) + '" placeholder="O" style="width:100%"></div>' +
      '<div><label>End label</label><input type="text" class="al-elbl" value="' + _ea(l.endLabel) + '" placeholder="A" style="width:100%"></div>' +
      '<label class="ang-chk"><input type="checkbox" class="al-ext"' + (l.extend ? ' checked' : '') + '>Both dirs</label>' +
      '<label class="ang-chk"><input type="checkbox" class="al-arrow"' + (l.arrow ? ' checked' : '') + '>Arrow</label>' +
    '</div>' +
  '</div>';
}

function _angArcHTML(a, i) {
  var lineOpts1 = '', lineOpts2 = '';
  angLines.forEach(function(l, j) {
    var base = 'Line ' + (j+1) + (l.endLabel ? ' (' + _ea(l.endLabel) + ')' : '');
    var enc0 = j * 2, enc1 = j * 2 + 1;
    if (l.type === 'line') {
      lineOpts1 += '<option value="' + enc0 + '"' + (a.i1===enc0?' selected':'') + '>' + base + ' →</option>';
      lineOpts1 += '<option value="' + enc1 + '"' + (a.i1===enc1?' selected':'') + '>' + base + ' ←</option>';
      lineOpts2 += '<option value="' + enc0 + '"' + (a.i2===enc0?' selected':'') + '>' + base + ' →</option>';
      lineOpts2 += '<option value="' + enc1 + '"' + (a.i2===enc1?' selected':'') + '>' + base + ' ←</option>';
    } else {
      lineOpts1 += '<option value="' + enc0 + '"' + (a.i1===enc0?' selected':'') + '>' + base + '</option>';
      lineOpts2 += '<option value="' + enc0 + '"' + (a.i2===enc0?' selected':'') + '>' + base + '</option>';
    }
  });
  var lblColor = a.labelColor || a.color;
  var lblSize  = a.labelSize  || '';
  return '<div class="ang-item ang-arc-item" data-i="' + i + '">' +

    // Row 1: From / To / delete
    '<div class="ang-row">' +
      '<span class="ang-num" style="color:#be123c">' + (i+1) + '</span>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1">' +
        '<div><label>From line</label><select class="aa-l1" style="width:100%">' + lineOpts1 + '</select></div>' +
        '<div><label>To line</label><select class="aa-l2" style="width:100%">'   + lineOpts2 + '</select></div>' +
      '</div>' +
      '<button class="btn-ang-del aa-del" title="Remove">✕</button>' +
    '</div>' +

    // Row 2: Radius / Thickness / Arc color / Direction
    '<div style="display:grid;grid-template-columns:1fr 1fr 44px 90px;gap:6px;margin-top:5px">' +
      '<div><label>Radius px</label><input type="number" class="aa-r" value="' + a.radius + '" min="10" max="200" style="width:100%"></div>' +
      '<div><label>Thickness</label><input type="number" class="aa-width" value="' + a.width + '" min="0.5" max="10" step="0.5" style="width:100%"></div>' +
      '<div><label>Color</label><input type="color" class="aa-color" value="' + a.color + '" style="width:100%;height:30px"></div>' +
      '<div><label>Direction</label><select class="aa-sweep" style="width:100%">' +
        '<option value="0"' + (a.sweep===0?' selected':'') + '>CCW ↶</option>' +
        '<option value="1"' + (a.sweep===1?' selected':'') + '>CW ↷</option>' +
      '</select></div>' +
    '</div>' +

    // Row 3: Right-angle / Fill / Fill color / Fill opacity
    '<div style="display:grid;grid-template-columns:auto auto 1fr 72px;gap:6px;margin-top:5px;align-items:end">' +
      '<label class="ang-chk"><input type="checkbox" class="aa-ra"' + (a.rightAngle?' checked':'') + '>90° □</label>' +
      '<label class="ang-chk"><input type="checkbox" class="aa-dofill"' + (a.fill?' checked':'') + '>Fill</label>' +
      '<div><label>Fill color</label><input type="color" class="aa-fill" value="' + (a.fill||'#e11d48') + '" style="width:100%;height:28px"></div>' +
      '<div><label>Opacity</label><input type="number" class="aa-fillop" value="' + a.fillOp + '" min="0" max="1" step="0.05" style="width:100%"></div>' +
    '</div>' +

    // Divider
    '<div style="border-top:1px solid #fecdd3;margin:7px 0 5px"></div>' +

    // Row 4: Arc label (full width)
    '<div>' +
      '<label>Arc label <span style="font-weight:400;color:#9ca3af">(plain text or $LaTeX$)</span></label>' +
      '<input type="text" class="aa-lbl" value="' + _ea(a.label) + '" placeholder="e.g. θ or $\\theta$ or $90°$" style="width:100%;box-sizing:border-box">' +
    '</div>' +

    // Row 5: Bold / Italic / Font size / Label color
    '<div style="display:grid;grid-template-columns:auto auto 1fr 44px;gap:6px;margin-top:5px;align-items:end">' +
      '<label class="ang-chk ang-fmt-btn' + (a.labelBold   ? ' ang-fmt-on' : '') + '"><input type="checkbox" class="aa-lbl-bold"'   + (a.labelBold   ? ' checked' : '') + ' style="display:none"><span style="font-weight:700">B</span></label>' +
      '<label class="ang-chk ang-fmt-btn' + (a.labelItalic ? ' ang-fmt-on' : '') + '"><input type="checkbox" class="aa-lbl-ital"' + (a.labelItalic ? ' checked' : '') + ' style="display:none"><span style="font-style:italic">I</span></label>' +
      '<div><label>Label size</label><input type="number" class="aa-lbl-size" value="' + lblSize + '" min="8" max="48" placeholder="auto" style="width:100%"></div>' +
      '<div><label>Color</label><input type="color" class="aa-lbl-color" value="' + lblColor + '" style="width:100%;height:30px"></div>' +
    '</div>' +

  '</div>';
}

function _wi(item, cls, cb) {
  var el = item.querySelector(cls);
  if (!el) return;
  el.addEventListener('input',  cb);
  el.addEventListener('change', cb);
}

function _renderAngLines() {
  var el = document.getElementById('ang-lines-list');
  if (!el) return;
  if (!angLines.length) {
    el.innerHTML = '<p class="hint" style="margin:4px 0 8px">No lines yet — click + Ray or + Line.</p>';
    return;
  }
  el.innerHTML = angLines.map(_angLineHTML).join('');
  el.querySelectorAll('.ang-item').forEach(function(item, i) {
    var l = angLines[i]; if (!l) return;
    _wi(item, '.al-ang',   function(e) { l.angle     = parseFloat(e.target.value)||0;   render(); });
    _wi(item, '.al-len',   function(e) { l.length    = parseFloat(e.target.value)||100; render(); });
    _wi(item, '.al-type',  function(e) { l.type      = e.target.value;                  render(); });
    _wi(item, '.al-flbl',  function(e) { l.fromLabel = e.target.value;                  render(); });
    _wi(item, '.al-elbl',  function(e) { l.endLabel  = e.target.value;                  render(); });
    _wi(item, '.al-color', function(e) { l.color     = e.target.value;                  render(); });
    _wi(item, '.al-w',     function(e) { l.width     = parseFloat(e.target.value)||2;   render(); });
    _wi(item, '.al-style', function(e) { l.style     = e.target.value;                  render(); });
    var extEl = item.querySelector('.al-ext');   if (extEl)  extEl.onchange  = function(e) { l.extend = e.target.checked; render(); };
    var arEl  = item.querySelector('.al-arrow'); if (arEl)   arEl.onchange   = function(e) { l.arrow  = e.target.checked; render(); };
    var delEl = item.querySelector('.al-del');   if (delEl)  delEl.onclick   = function() {
      var di = i;
      angLines.splice(di, 1);
      angArcs.forEach(function(a) {
        function fixRef(v) {
          var idx = v >> 1, side = v & 1;
          if (idx === di) { idx = Math.max(0, angLines.length - 1); side = 0; }
          else if (idx > di) { idx--; }
          return idx * 2 + side;
        }
        a.i1 = fixRef(a.i1);
        a.i2 = fixRef(a.i2);
      });
      renderAngUI(); render();
    };
  });
}

function _renderAngArcs() {
  var el = document.getElementById('ang-arcs-list');
  if (!el) return;
  if (!angLines.length) {
    el.innerHTML = '<p class="hint" style="margin:4px 0 8px">Add at least one line first.</p>';
    return;
  }
  if (!angArcs.length) {
    el.innerHTML = '<p class="hint" style="margin:4px 0 8px">No arcs yet — click + Add Arc.</p>';
    return;
  }
  el.innerHTML = angArcs.map(_angArcHTML).join('');
  el.querySelectorAll('.ang-item').forEach(function(item, i) {
    var a = angArcs[i]; if (!a) return;
    _wi(item, '.aa-l1',       function(e) { a.i1        = parseInt(e.target.value);         render(); });
    _wi(item, '.aa-l2',       function(e) { a.i2        = parseInt(e.target.value);         render(); });
    _wi(item, '.aa-lbl',      function(e) { a.label     = e.target.value;                   render(); });
    _wi(item, '.aa-r',        function(e) { a.radius    = parseFloat(e.target.value)||30;   render(); });
    _wi(item, '.aa-width',    function(e) { a.width     = parseFloat(e.target.value)||1.8;  render(); });
    _wi(item, '.aa-color',    function(e) { a.color     = e.target.value;                   render(); });
    _wi(item, '.aa-sweep',    function(e) { a.sweep     = parseInt(e.target.value);          render(); });
    _wi(item, '.aa-fill',     function(e) { if (a.fill) { a.fill = e.target.value; render(); } });
    _wi(item, '.aa-fillop',   function(e) { a.fillOp    = parseFloat(e.target.value)||0.15; render(); });
    _wi(item, '.aa-lbl-size', function(e) { a.labelSize  = parseFloat(e.target.value)||0;   render(); });
    _wi(item, '.aa-lbl-color',function(e) { a.labelColor = e.target.value;                  render(); });
    var raEl   = item.querySelector('.aa-ra');       if (raEl)   raEl.onchange   = function(e) { a.rightAngle  = e.target.checked; render(); };
    var dfEl   = item.querySelector('.aa-dofill');   if (dfEl)   dfEl.onchange   = function(e) {
      a.fill = e.target.checked ? (item.querySelector('.aa-fill').value||'#e11d48') : '';
      render();
    };
    var boldEl = item.querySelector('.aa-lbl-bold'); if (boldEl) boldEl.onchange = function(e) {
      a.labelBold = e.target.checked;
      boldEl.closest('label').classList.toggle('ang-fmt-on', a.labelBold);
      render();
    };
    var italEl = item.querySelector('.aa-lbl-ital'); if (italEl) italEl.onchange = function(e) {
      a.labelItalic = e.target.checked;
      italEl.closest('label').classList.toggle('ang-fmt-on', a.labelItalic);
      render();
    };
    var delEl  = item.querySelector('.aa-del');      if (delEl)  delEl.onclick   = function() { angArcs.splice(i,1); renderAngUI(); render(); };
  });
}
