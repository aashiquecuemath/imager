'use strict';

/* ─── Graph Plot: private helpers ─── */

function _gpEval(expr, x) {
  if (!expr) return NaN;
  try {
    const e = expr
      .replace(/\^/g, '**')
      .replace(/\bsin\b/g,   'Math.sin')
      .replace(/\bcos\b/g,   'Math.cos')
      .replace(/\btan\b/g,   'Math.tan')
      .replace(/\bsqrt\b/g,  'Math.sqrt')
      .replace(/\babs\b/g,   'Math.abs')
      .replace(/\bln\b/g,    'Math.log')
      .replace(/\blog10\b/g, 'Math.log10')
      .replace(/\blog\b/g,   'Math.log')
      .replace(/\bexp\b/g,   'Math.exp')
      .replace(/\bpi\b/gi,   'Math.PI');
    // eslint-disable-next-line no-new-func
    return new Function('x', `"use strict"; return (${e})`)(x);
  } catch (_) { return NaN; }
}

function _gpParsePts(raw) {
  const pts = [];
  if (!raw) return pts;
  raw.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    const ci = line.lastIndexOf(':');
    const coords = ci > -1 ? line.slice(0, ci).trim() : line;
    const label  = ci > -1 ? line.slice(ci + 1).trim() : '';
    const parts  = coords.split(',');
    const x = parseFloat(parts[0]), y = parseFloat(parts[1]);
    if (!isNaN(x) && !isNaN(y)) pts.push({ x, y, label });
  });
  return pts;
}

function _gpTickRange(min, max, step) {
  const arr = [];
  const start = Math.ceil(min / step - 1e-9) * step;
  for (let v = start; v <= max + 1e-9; v = parseFloat((v + step).toFixed(10))) {
    arr.push(parseFloat(v.toFixed(10)));
  }
  return arr;
}

function _gpDot(cx, cy, r, fill, style, clip) {
  const ca = clip ? ` clip-path="url(#gpc)"` : '';
  if (style === 'open') {
    return `\n<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${fill}" stroke-width="1.8"${ca}/>`;
  } else if (style === 'cross') {
    const d = fmt(r * 0.9);
    return `\n<line x1="${fmt(cx - d)}" y1="${fmt(cy - d)}" x2="${fmt(cx + d)}" y2="${fmt(cy + d)}" stroke="${fill}" stroke-width="2.2"${ca}/>` +
           `\n<line x1="${fmt(cx + d)}" y1="${fmt(cy - d)}" x2="${fmt(cx - d)}" y2="${fmt(cy + d)}" stroke="${fill}" stroke-width="2.2"${ca}/>`;
  }
  return `\n<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="white" stroke-width="1.5"${ca}/>`;
}

function _gpLblOffset(pos, r) {
  const gap = r + 5;
  if (pos === 'below') return { dx: 0,        dy: gap + 10, anchor: 'middle' };
  if (pos === 'left')  return { dx: -(gap + 3), dy: 4,      anchor: 'end'    };
  if (pos === 'right') return { dx:  (gap + 3), dy: 4,      anchor: 'start'  };
  return                      { dx: 0,         dy: -(gap + 2), anchor: 'middle' }; // above
}

/* ─── Graph Plot Generator ─── */

function generateGraphPlot() {
  const firstOnly = val('gp-quadrant') === 'first';

  let xMin = firstOnly ? 0 : (num('gp-xmin') || -5);
  let xMax = num('gp-xmax') || 5;
  let yMin = firstOnly ? 0 : (num('gp-ymin') || -5);
  let yMax = num('gp-ymax') || 5;

  if (xMax <= xMin) xMax = xMin + 10;
  if (yMax <= yMin) yMax = yMin + 10;

  const UNIT      = Math.max(15, Math.min(120, num('gp-unit') || 40));
  const title     = val('gp-title').trim();
  const xLbl      = val('gp-xlabel').trim();
  const yLbl      = val('gp-ylabel').trim();
  const showGrid  = chk('gp-grid');
  const gridXStp  = Math.max(0.25, num('gp-grid-x') || 1);
  const gridYStp  = Math.max(0.25, num('gp-grid-y') || 1);
  const gridStyle = val('gp-grid-style') || 'solid';
  const gridColor = val('gp-grid-color') || '#DDDDDD';
  const showTicks = chk('gp-ticks');
  const showTkLbl = chk('gp-tick-labels');
  const tickXStep = Math.max(0.25, num('gp-tick-x-step') || 1);
  const tickYStep = Math.max(0.25, num('gp-tick-y-step') || 1);
  const tickValsRaw = val('gp-tick-vals').trim();
  const specificVals = tickValsRaw
    ? tickValsRaw.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    : null;
  const showZero  = chk('gp-show-zero');
  const showLegnd = chk('gp-legend');
  const showArrows = $('gp-axis-arrows') ? chk('gp-axis-arrows') : true;
  const axisColor  = val('gp-axis-color') || '#333333';

  // ── Style params ──────────────────────────────────────────────
  const tkSize   = Math.max(7, num('gp-tk-size')  || 11);
  const tkColor  = val('gp-tk-color')  || '#444444';
  const tkStyle  = val('gp-tk-style')  || 'normal';
  const tkWeight = chk('gp-tk-bold')   ? 'bold' : 'normal';
  const tkFont   = `font-family="Arial,sans-serif" font-size="${tkSize}" font-style="${tkStyle}" font-weight="${tkWeight}" fill="${tkColor}"`;

  const lblSize   = Math.max(8, num('gp-lbl-size')  || 13);
  const lblColor  = val('gp-lbl-color')  || '#333333';
  const lblStyle  = val('gp-lbl-style')  || 'italic';
  const lblWeight = chk('gp-lbl-bold')   ? 'bold' : 'normal';
  const lblFont   = `font-family="Arial,sans-serif" font-size="${lblSize}" font-style="${lblStyle}" font-weight="${lblWeight}" fill="${lblColor}"`;

  // ── Layout ────────────────────────────────────────────────────
  const TK   = 5;   // tick length px
  const OVER = 18;  // axes extend past plot boundary

  const yLblMargin  = yLbl ? lblSize + 10 : 0;
  const tkLblMargin = showTkLbl ? Math.round(tkSize * 4) : 22;

  const ML = yLblMargin + tkLblMargin;
  const MR = OVER + 8;
  const MT = (title ? 34 : 14) + OVER;
  const MB = (showTkLbl ? TK + 4 + tkSize + 12 : 14) + (xLbl ? lblSize + 8 : 4);

  const plotW = (xMax - xMin) * UNIT;
  const plotH = (yMax - yMin) * UNIT;

  // ── Collect enabled series ────────────────────────────────────
  const SDEFS = [
    { id: 1, def: '#0066CC' },
    { id: 2, def: '#CC3300' },
    { id: 3, def: '#009944' },
  ];

  const series = SDEFS.map(({ id, def }) => {
    if (id > 1 && !chk(`gp-s${id}-enable`)) return null;
    const dotColor    = val(`gp-s${id}-dot-color`) || def;
    const dropColorRaw = val(`gp-s${id}-drop-color`);
    return {
      id,
      color:        val(`gp-s${id}-color`) || def,
      label:        val(`gp-s${id}-label`).trim(),
      type:         val(`gp-s${id}-type`) || 'equation',
      eq:           val(`gp-s${id}-eq`).trim(),
      linePtsRaw:   (val(`gp-s${id}-line-pts`) || '').trim(),
      ptsRaw:       val(`gp-s${id}-pts`).trim(),
      dotColor,
      lineStyle:    val(`gp-s${id}-line`) || 'solid',
      lineWidth:    Math.max(0.5, num(`gp-s${id}-lw`) || 2.5),
      showDots:     chk(`gp-s${id}-dots`),
      showLbls:     chk(`gp-s${id}-pt-labels`),
      showDash:     chk(`gp-s${id}-dashes`),
      ptStyle:      val(`gp-s${id}-pt-style`) || 'filled',
      ptLblPos:     val(`gp-s${id}-pt-lbl-pos`) || 'above',
      dropStyle:    val(`gp-s${id}-drop-style`) || 'dashed',
      dropColor:    dropColorRaw || dotColor,
      callouts:     chk(`gp-s${id}-callouts`),
      calloutStyle: val(`gp-s${id}-callout-style`) || 'bold',
    };
  }).filter(Boolean);

  const hasLegend = showLegnd && series.some(s => s.label);
  const legendW   = hasLegend ? 130 : 0;

  const W = Math.ceil(plotW + ML + MR + legendW);
  const H = Math.ceil(plotH + MT + MB);

  // Math → SVG coordinate transforms
  const OX  = ML + (0 - xMin) * UNIT;
  const OY  = MT + (yMax - 0) * UNIT;
  const toX = mx => OX + mx * UNIT;
  const toY = my => OY - my * UNIT;

  // Axes positions clamped to plot area
  const axY = Math.max(MT, Math.min(MT + plotH, OY));
  const axX = Math.max(ML, Math.min(ML + plotW, OX));

  // ── SVG open + defs ───────────────────────────────────────────
  let s = svgOpen(W, H);
  s += `\n<defs>
  <clipPath id="gpc">
    <rect x="${ML}" y="${MT}" width="${plotW}" height="${plotH}"/>
  </clipPath>
  <marker id="gpa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
    <path d="M0,0 L10,5 L0,10 Z" fill="${axisColor}"/>
  </marker>
  <marker id="gpar" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 Z" fill="${axisColor}"/>
  </marker>
</defs>`;

  // ── Title ─────────────────────────────────────────────────────
  if (title) {
    s += `\n<text x="${fmt(ML + plotW / 2)}" y="20" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="#111" text-anchor="middle">${escXml(title)}</text>`;
  }

  // ── Grid lines ────────────────────────────────────────────────
  if (showGrid) {
    const gd = gridStyle === 'dashed' ? ' stroke-dasharray="6 4"'
             : gridStyle === 'dotted' ? ' stroke-dasharray="2 4"' : '';
    const gxStart = Math.ceil(xMin / gridXStp) * gridXStp;
    for (let i = 0; ; i++) {
      const gx = gxStart + i * gridXStp;
      if (gx > xMax + 1e-9) break;
      const sx = fmt(toX(gx));
      s += `\n<line x1="${sx}" y1="${MT}" x2="${sx}" y2="${MT + plotH}" stroke="${gridColor}" stroke-width="1"${gd}/>`;
    }
    const gyStart = Math.ceil(yMin / gridYStp) * gridYStp;
    for (let i = 0; ; i++) {
      const gy = gyStart + i * gridYStp;
      if (gy > yMax + 1e-9) break;
      const sy = fmt(toY(gy));
      s += `\n<line x1="${ML}" y1="${sy}" x2="${ML + plotW}" y2="${sy}" stroke="${gridColor}" stroke-width="1"${gd}/>`;
    }
  }

  // ── Tick marks & labels ───────────────────────────────────────
  if (showTicks || showTkLbl) {
    const xTickVals = specificVals
      ? specificVals.filter(v => v >= xMin - 1e-9 && v <= xMax + 1e-9)
      : _gpTickRange(xMin, xMax, tickXStep);
    const yTickVals = specificVals
      ? specificVals.filter(v => v >= yMin - 1e-9 && v <= yMax + 1e-9)
      : _gpTickRange(yMin, yMax, tickYStep);

    for (const tx of xTickVals) {
      const sx = fmt(toX(tx));
      if (showTicks) {
        s += `\n<line x1="${sx}" y1="${fmt(axY - TK)}" x2="${sx}" y2="${fmt(axY + TK)}" stroke="#555" stroke-width="1.5"/>`;
      }
      const isZero = Math.abs(tx) < 1e-9;
      // In all-quadrant mode: zero handled separately; in first-quadrant: show all including 0
      if (showTkLbl && (!isZero || firstOnly)) {
        const lbl = Number.isInteger(tx) ? tx : parseFloat(tx.toFixed(8));
        s += `\n<text x="${sx}" y="${fmt(axY + TK + 4 + tkSize)}" ${tkFont} text-anchor="middle">${lbl}</text>`;
      }
    }

    for (const ty of yTickVals) {
      const sy = fmt(toY(ty));
      if (showTicks) {
        s += `\n<line x1="${fmt(axX - TK)}" y1="${sy}" x2="${fmt(axX + TK)}" y2="${sy}" stroke="#555" stroke-width="1.5"/>`;
      }
      const isZero = Math.abs(ty) < 1e-9;
      if (showTkLbl && (!isZero || firstOnly)) {
        const lbl = Number.isInteger(ty) ? ty : parseFloat(ty.toFixed(8));
        s += `\n<text x="${fmt(axX - TK - 5)}" y="${sy}" ${tkFont} text-anchor="end" dominant-baseline="central">${lbl}</text>`;
      }
    }

    // Origin "0" label in all-quadrant mode when axes cross inside the plot
    if (showTkLbl && !firstOnly && xMin < 0 && xMax > 0 && yMin < 0 && yMax > 0) {
      if (showZero) {
        s += `\n<text x="${fmt(axX - TK - 5)}" y="${fmt(axY + TK + 4 + tkSize)}" ${tkFont} text-anchor="end">0</text>`;
      }
    }
  }

  // ── Axes with arrowheads ──────────────────────────────────────
  const mkEnd   = showArrows ? ' marker-end="url(#gpa)"'              : '';
  const mkStart = showArrows && !firstOnly ? ' marker-start="url(#gpar)"' : '';

  const xA1 = firstOnly ? ML : ML - OVER;
  const xA2 = ML + plotW + OVER;
  s += `\n<line x1="${xA1}" y1="${fmt(axY)}" x2="${xA2}" y2="${fmt(axY)}" stroke="${axisColor}" stroke-width="2.5"${mkStart}${mkEnd}/>`;

  const yA1 = firstOnly ? MT + plotH : MT + plotH + OVER;
  const yA2 = MT - OVER;
  s += `\n<line x1="${fmt(axX)}" y1="${yA1}" x2="${fmt(axX)}" y2="${yA2}" stroke="${axisColor}" stroke-width="2.5"${mkStart}${mkEnd}/>`;

  // ── Axis labels — centered relative to plot ───────────────────
  if (xLbl) {
    const xLblY = fmt(axY + TK + 4 + tkSize + 12 + lblSize);
    s += `\n<text x="${fmt(ML + plotW / 2)}" y="${xLblY}" ${lblFont} text-anchor="middle">${escXml(xLbl)}</text>`;
  }
  if (yLbl) {
    const tkMaxW = Math.ceil(tkSize * 2.5);
    const yLblCX = fmt(axX - TK - tkMaxW - 8 - Math.ceil(lblSize / 2));
    const yLblY  = fmt(MT + plotH / 2);
    s += `\n<text x="${yLblCX}" y="${yLblY}" ${lblFont} text-anchor="middle" transform="rotate(-90,${yLblCX},${yLblY})">${escXml(yLbl)}</text>`;
  }

  // ── Series ────────────────────────────────────────────────────
  for (const ser of series) {
    const col  = ser.color;
    const dotC = ser.dotColor;
    const lw   = ser.lineWidth;
    const dash = ser.lineStyle === 'dashed' ? ' stroke-dasharray="8 5"'
               : ser.lineStyle === 'dotted'  ? ' stroke-dasharray="2 5"' : '';

    // Vertical line (x = constant)
    if (ser.type === 'vertical') {
      const vx = parseFloat(ser.eq);
      if (!isNaN(vx)) {
        const sx = fmt(toX(vx));
        s += `\n<line x1="${sx}" y1="${MT}" x2="${sx}" y2="${MT + plotH}" stroke="${col}" stroke-width="${lw}" stroke-linecap="round"${dash} clip-path="url(#gpc)"/>`;
      }
    }

    // Horizontal line shortcut: if type=equation and eq is a plain number with no x
    // (users can just type "3" and it renders as y=3 automatically via eval)

    // Equation curve
    if (ser.type === 'equation' && ser.eq && ser.lineStyle !== 'none') {
      const N = 600;
      let path = '', open = false;
      for (let i = 0; i <= N; i++) {
        const mx = xMin + (xMax - xMin) * i / N;
        const my = _gpEval(ser.eq, mx);
        if (!isNaN(my) && isFinite(my)) {
          const sx = fmt(toX(mx)), sy = fmt(toY(my));
          path += open ? ` L${sx} ${sy}` : `M${sx} ${sy}`;
          open = true;
        } else { open = false; }
      }
      if (path) {
        s += `\n<path d="${path}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"${dash} clip-path="url(#gpc)"/>`;
      }
    }

    // Points mode: polyline or step function through linePtsRaw
    if (ser.type === 'points' && ser.lineStyle !== 'none') {
      const linePts = _gpParsePts(ser.linePtsRaw);
      if (linePts.length > 1) {
        let d;
        if (ser.lineStyle === 'step') {
          // Staircase: horizontal to next x, then vertical to next y
          d = `M${fmt(toX(linePts[0].x))} ${fmt(toY(linePts[0].y))}`;
          for (let i = 1; i < linePts.length; i++) {
            d += ` H${fmt(toX(linePts[i].x))} V${fmt(toY(linePts[i].y))}`;
          }
        } else {
          d = 'M' + linePts.map(p => `${fmt(toX(p.x))} ${fmt(toY(p.y))}`).join(' L');
        }
        const stepDash = ser.lineStyle === 'step' ? '' : dash;
        s += `\n<path d="${d}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"${stepDash} clip-path="url(#gpc)"/>`;
      }
    }

    // Auto integer-x dots for equation mode
    let intrinsicDots = [];
    if (ser.type === 'equation' && ser.showDots && ser.eq) {
      for (let mx = Math.ceil(xMin); mx <= Math.floor(xMax); mx++) {
        const my = _gpEval(ser.eq, mx);
        if (!isNaN(my) && isFinite(my)) intrinsicDots.push({ x: mx, y: my });
      }
    }

    // Labeled dots (from ptsRaw — both modes)
    const labeledPts = _gpParsePts(ser.ptsRaw);

    // Drop line dash style
    const dropDash = ser.dropStyle === 'dotted' ? ' stroke-dasharray="2 4"'
                   : ser.dropStyle === 'solid'  ? '' : ' stroke-dasharray="5 4"';

    // Projection lines to axes (labeled pts only)
    if (ser.showDash && labeledPts.length) {
      for (const pt of labeledPts) {
        const sx = fmt(toX(pt.x)), sy = fmt(toY(pt.y));
        if (Math.abs(toY(pt.y) - axY) > 3) {
          s += `\n<line x1="${sx}" y1="${sy}" x2="${sx}" y2="${fmt(axY)}" stroke="${ser.dropColor}" stroke-width="1.2"${dropDash} clip-path="url(#gpc)"/>`;
        }
        if (Math.abs(toX(pt.x) - axX) > 3) {
          s += `\n<line x1="${fmt(axX)}" y1="${sy}" x2="${sx}" y2="${sy}" stroke="${ser.dropColor}" stroke-width="1.2"${dropDash} clip-path="url(#gpc)"/>`;
        }
      }
    }

    // Intrinsic equation dots (series color)
    for (const pt of intrinsicDots) {
      s += _gpDot(fmt(toX(pt.x)), fmt(toY(pt.y)), 4, col, ser.ptStyle, true);
    }

    // Labeled dots (dotColor)
    for (const pt of labeledPts) {
      s += _gpDot(fmt(toX(pt.x)), fmt(toY(pt.y)), 4.5, dotC, ser.ptStyle, true);
    }

    // Point labels
    if (ser.showLbls && labeledPts.length) {
      const off = _gpLblOffset(ser.ptLblPos, 4.5);
      for (const pt of labeledPts) {
        if (!pt.label) continue;
        const px = fmt(toX(pt.x) + off.dx);
        const py = fmt(toY(pt.y) + off.dy);
        s += `\n<text x="${px}" y="${py}" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="${dotC}" text-anchor="${off.anchor}" clip-path="url(#gpc)">${escXml(pt.label)}</text>`;
      }
    }

    // Axis value callouts: show coordinates on axes at each labeled point
    if (ser.callouts && labeledPts.length) {
      const cSz = ser.calloutStyle === 'bold-lg' ? tkSize + 3 : tkSize;
      const cWt = ser.calloutStyle === 'normal'  ? 'normal'   : 'bold';
      const cFont = `font-family="Arial,sans-serif" font-size="${cSz}" font-weight="${cWt}" fill="${dotC}"`;
      for (const pt of labeledPts) {
        const xLabelVal = Number.isInteger(pt.x) ? pt.x : fmt(pt.x, 2);
        const yLabelVal = Number.isInteger(pt.y) ? pt.y : fmt(pt.y, 2);
        s += `\n<text x="${fmt(toX(pt.x))}" y="${fmt(axY + TK + 4 + cSz)}" ${cFont} text-anchor="middle">${xLabelVal}</text>`;
        s += `\n<text x="${fmt(axX - TK - 5)}" y="${fmt(toY(pt.y))}" ${cFont} text-anchor="end" dominant-baseline="central">${yLabelVal}</text>`;
      }
    }
  }

  // ── Legend ────────────────────────────────────────────────────
  if (hasLegend) {
    const lx = ML + plotW + OVER + 8;
    let ly = MT + 16;
    for (const ser of series) {
      if (!ser.label) continue;
      s += `\n<line x1="${lx}" y1="${ly}" x2="${lx + 20}" y2="${ly}" stroke="${ser.color}" stroke-width="2.5"/>`;
      s += _gpDot(lx + 10, ly, 3.5, ser.color, ser.ptStyle, false);
      s += `\n<text x="${lx + 26}" y="${ly + 4}" font-family="Arial,sans-serif" font-size="12" fill="#333">${escXml(ser.label)}</text>`;
      ly += 22;
    }
  }

  return s + '\n</svg>';
}

/* ─── Graph Plot UI wiring ─── */

function _gpSyncUI() {
  const first = $('gp-quadrant')?.value === 'first';
  const wrap = $('gp-ymin-wrap');
  if (wrap) wrap.style.display = first ? 'none' : '';
}

$('gp-quadrant')?.addEventListener('change', _gpSyncUI);
