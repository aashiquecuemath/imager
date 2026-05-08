'use strict';

/* ─── Number Line ─── */

function _nlStepStr(step) {
  return step % 1 === 0 ? String(Math.round(step)) : String(parseFloat(step.toFixed(6)));
}

function generateNumberLine() {
  const count = Math.max(1, Math.min(4, int('nl-count') || 1));
  const gap   = Math.max(0, num('nl-gap') || 30);
  if (count === 1) return (_genNL0() || {svgStr: errorSVG('Error')}).svgStr;
  const withPos = (s, x, y) => s.replace('<svg ', `<svg x="${x}" y="${y}" `);
  const lines = [_genNL0()];
  for (let i = 1; i < count; i++) lines.push(_genNLi(i));
  const validLines = lines.filter(Boolean);
  const W = Math.max(...validLines.map(l => l.width));
  const H = validLines.reduce((s, l) => s + l.height, 0) + gap * (validLines.length - 1);
  let s = svgOpen(W, H);
  let y = 0;
  for (const l of validLines) {
    s += '\n' + withPos(l.svgStr, Math.round((W - l.width) / 2), y);
    y += l.height + gap;
  }
  return s + '\n</svg>';
}

function _genNL0() {
  const start = parseFloat(val('nl-start')) || 0;
  const end   = parseFloat(val('nl-end'))   || 10;
  if (end <= start) return { svgStr: errorSVG('End must be greater than Start'), width: 340, height: 40 };

  // ── Line style ──────────────────────────────────────────────
  const lineColor = val('nl-color')      || '#000000';
  const lineWidth = Math.max(0.5, num('nl-line-width') || 3);
  const totalW    = Math.max(200, num('nl-length') || 700);

  const PAD   = 18;
  const EXT   = Math.max(30, Math.round(totalW * 0.092));
  const SCALE = (totalW - 2 * PAD - 2 * EXT) / (end - start);
  const tx    = n => PAD + EXT + (n - start) * SCALE;

  // ── Integer labels ──────────────────────────────────────────
  const showIntLbl  = chk('nl-labels');
  const lblInterval = Math.max(1, int('nl-lbl-interval') || 1);
  const lblSpecRaw  = val('nl-lbl-specific').trim();
  const lblSpecific = lblSpecRaw
    ? lblSpecRaw.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    : null;
  const intLblSz    = Math.max(8, num('nl-int-lbl-size')   || 14);
  const intLblColor = val('nl-int-lbl-color') || '#111111';
  const intLblBold  = chk('nl-int-lbl-bold') ? 'bold' : 'normal';

  // ── Subdivisions ────────────────────────────────────────────
  const subs         = Math.max(1, int('nl-subs'));
  const showSubLbl   = chk('nl-sub-labels');
  const subLblInterv = Math.max(1, int('nl-sub-lbl-interval') || 1);
  const subLblSpecRaw = val('nl-sub-lbl-specific').trim();
  const subLblSpec   = subLblSpecRaw
    ? subLblSpecRaw.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
    : null;
  const subLblSz     = Math.max(7, num('nl-sub-lbl-size')   || 11);
  const subLblColor  = val('nl-sub-lbl-color') || '#555555';

  // ── Point markers ───────────────────────────────────────────
  const ptDefColor = val('nl-pt-color')    || '#FF0000';
  const ptR        = Math.max(2, num('nl-pt-radius') || 6);
  const ptDefPos   = val('nl-pt-pos')      || 'above';
  const ptLblSz    = Math.max(8, num('nl-pt-lbl-size')  || 16);
  const ptLblColor = val('nl-pt-lbl-color') || '#000000';

  const points = [];
  (val('nl-points') || '').trim().split('\n').forEach(line => {
    line = line.trim(); if (!line) return;
    const parts = line.split(':');
    const vs    = parts[0].trim();
    const lbl   = parts[1]?.trim() ?? '';
    const rawC  = parts[2]?.trim() ?? '';
    const color = /^#[0-9a-fA-F]{3,6}$/.test(rawC) ? rawC : ptDefColor;
    const pos   = parts[3]?.trim() || ptDefPos;
    let v;
    if (vs.includes('/')) { const [a, b] = vs.split('/'); v = parseFloat(a) / parseFloat(b); }
    else v = parseFloat(vs);
    if (isNaN(v)) return;
    points.push({ v, lbl, color, pos });
  });

  // ── Jump arrows ─────────────────────────────────────────────
  const jumpHeight   = Math.max(10, num('nl-jump-height') || 35);
  const jumpColor    = val('nl-jump-color')    || '#0066CC';
  const showUniform  = chk('nl-uniform-enable');
  const uniformDir   = val('nl-uniform-dir')   || 'right';
  const uniformFrom  = parseFloat(val('nl-uniform-from'));
  const uniformTo    = parseFloat(val('nl-uniform-to'));
  const uniformStep  = Math.max(0.01, num('nl-uniform-step') || 1);
  const uniformLbls  = chk('nl-uniform-labels');
  const uniformColor = val('nl-uniform-color') || '#CC6600';

  // Parse specific jumps: dir:from:to:label[:color]
  const specificJumps = [];
  (val('nl-jumps') || '').trim().split('\n').forEach(line => {
    line = line.trim(); if (!line) return;
    const parts = line.split(':');
    if (parts.length < 3) return;
    const dir   = parts[0].toLowerCase().trim();
    const from  = parseFloat(parts[1]);
    const to    = parseFloat(parts[2]);
    const lblRaw = parts[3]?.trim() ?? 'y';
    const rawC   = parts[4]?.trim() ?? '';
    const color  = /^#[0-9a-fA-F]{3,6}$/.test(rawC) ? rawC : jumpColor;
    if (isNaN(from) || isNaN(to) || (dir !== 'right' && dir !== 'left')) return;
    const mag = _nlStepStr(Math.abs(to - from));
    const lbl = lblRaw === 'n' ? '' : lblRaw === 'y' ? (dir === 'left' ? `-${mag}` : mag) : lblRaw;
    specificJumps.push({ from, to, lbl, color });
  });

  // Generate uniform jump sequence
  const uniformJumps = [];
  if (showUniform && !isNaN(uniformFrom) && !isNaN(uniformTo) && uniformStep > 0) {
    const stepStr = _nlStepStr(uniformStep);
    const autoLbl = uniformLbls ? (uniformDir === 'left' ? `-${stepStr}` : stepStr) : '';
    if (uniformDir === 'right' && uniformFrom < uniformTo) {
      for (let cur = uniformFrom; cur + uniformStep <= uniformTo + 1e-9; cur = parseFloat((cur + uniformStep).toFixed(10))) {
        uniformJumps.push({ from: cur, to: parseFloat((cur + uniformStep).toFixed(10)), lbl: autoLbl, color: uniformColor });
      }
    } else if (uniformDir === 'left' && uniformFrom > uniformTo) {
      for (let cur = uniformFrom; cur - uniformStep >= uniformTo - 1e-9; cur = parseFloat((cur - uniformStep).toFixed(10))) {
        uniformJumps.push({ from: cur, to: parseFloat((cur - uniformStep).toFixed(10)), lbl: autoLbl, color: uniformColor });
      }
    }
  }

  const allJumps = [...uniformJumps, ...specificJumps];

  // ── SVG dimensions ───────────────────────────────────────────
  const hasJumps   = allJumps.length > 0;
  const hasJumpLbl = allJumps.some(j => j.lbl);
  const hasPtAbove = points.some(p => p.pos !== 'below' && p.lbl);
  const hasPtBelow = points.some(p => p.pos === 'below' && p.lbl);

  const LIFT = 5; // px gap between arc base and the number line
  const topSpace = hasJumps
    ? LIFT + jumpHeight + (hasJumpLbl ? 22 : 10) + 8
    : hasPtAbove ? ptLblSz + ptR + 14 : 20;
  const LINE_Y = topSpace;

  const subLblH = (showSubLbl && subs > 1) ? subLblSz + 8 : 0;
  const intLblH = showIntLbl ? intLblSz + 8 : 0;
  const ptBotH  = hasPtBelow ? ptLblSz + ptR + 8 : 0;
  const botSpace = Math.max(8, subLblH, intLblH, ptBotH) + 10;
  const H = LINE_Y + botSpace;

  // ── Arrowhead markers ────────────────────────────────────────
  // Main axis arrows (standard refX for clean flush tips)
  const lcId = 'nl' + lineColor.replace(/[^a-zA-Z0-9]/g, '');
  // Jump arrow markers use refX="0" so the arrowhead tip extends exactly
  // LIFT px past the arc endpoint, landing precisely on the number line.
  const jumpMarkerColors = new Set(allJumps.map(j => j.color));

  let s = svgOpen(totalW, H);
  s += '\n<defs>';
  s += `\n  <marker id="${lcId}f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
    <path d="M0,0 L10,5 L0,10 Z" fill="${lineColor}"/>
  </marker>
  <marker id="${lcId}r" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 Z" fill="${lineColor}"/>
  </marker>`;
  for (const c of jumpMarkerColors) {
    const jid = 'nlj' + c.replace(/[^a-zA-Z0-9]/g, '');
    s += `\n  <marker id="${jid}" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="5" markerHeight="5" orient="auto">
    <path d="M0,0 L10,5 L0,10 Z" fill="${c}"/>
  </marker>`;
  }
  s += '\n</defs>';

  // Main axis line
  s += `\n<line x1="${PAD}" y1="${LINE_Y}" x2="${totalW - PAD}" y2="${LINE_Y}" stroke="${lineColor}" stroke-width="${lineWidth}" marker-start="url(#${lcId}r)" marker-end="url(#${lcId}f)"/>`;

  // Major ticks + integer labels
  for (let n = start; n <= end; n++) {
    const x = fmt(tx(n));
    s += `\n<line x1="${x}" y1="${fmt(LINE_Y - 8)}" x2="${x}" y2="${fmt(LINE_Y + 8)}" stroke="${lineColor}" stroke-width="2"/>`;
    let show = false;
    if (showIntLbl) {
      if (lblSpecific) show = lblSpecific.some(v => Math.abs(v - n) < 1e-9);
      else show = ((n - start) % lblInterval === 0);
    }
    if (show) {
      s += `\n<text x="${x}" y="${fmt(LINE_Y + 8 + 4 + intLblSz)}" font-family="Arial,sans-serif" font-size="${intLblSz}" font-weight="${intLblBold}" fill="${intLblColor}" text-anchor="middle">${n}</text>`;
    }
  }

  // Subdivision ticks + labels
  if (subs > 1) {
    let subIdx = 0;
    for (let n = start; n < end; n++) {
      for (let i = 1; i < subs; i++) {
        subIdx++;
        const sv = parseFloat((n + i / subs).toFixed(10));
        const x  = fmt(tx(sv));
        s += `\n<line x1="${x}" y1="${fmt(LINE_Y - 5)}" x2="${x}" y2="${fmt(LINE_Y + 5)}" stroke="${lineColor}" stroke-width="1.5"/>`;
        let showS = false;
        if (showSubLbl) {
          if (subLblSpec) showS = subLblSpec.some(v => Math.abs(v - sv) < 1e-9);
          else showS = (subIdx % subLblInterv === 0);
        }
        if (showS) {
          const svLbl = sv % 1 === 0 ? Math.round(sv) : parseFloat(sv.toFixed(4));
          s += `\n<text x="${x}" y="${fmt(LINE_Y + 5 + 3 + subLblSz)}" font-family="Arial,sans-serif" font-size="${subLblSz}" fill="${subLblColor}" text-anchor="middle">${svLbl}</text>`;
        }
      }
    }
  }

  // Jump arcs — elliptical bezier (κ ≈ 0.5523) for circular shape.
  // Arc endpoints sit LIFT px above the line; arrowhead marker (refX=0)
  // extends exactly LIFT px forward so its tip lands on the number line.
  const K = 0.5523;
  for (const j of allJumps) {
    const x1  = tx(j.from);
    const x2  = tx(j.to);
    const mid = (x1 + x2) / 2;
    const a   = Math.abs(x2 - x1) / 2; // horizontal semi-axis
    const b   = jumpHeight;             // vertical semi-axis
    const baseY = LINE_Y - LIFT;        // arc endpoints, lifted above line

    // Two-segment ellipse approximation. The inner control point offset flips
    // sign with direction so the dome stays convex upward for both left and right arrows.
    const dir = x2 > x1 ? 1 : -1;
    const d = `M${fmt(x1)} ${fmt(baseY)} ` +
      `C${fmt(x1)} ${fmt(baseY - b * K)} ${fmt(mid - dir * a * K)} ${fmt(baseY - b)} ${fmt(mid)} ${fmt(baseY - b)} ` +
      `S${fmt(x2)} ${fmt(baseY - b * K)} ${fmt(x2)} ${fmt(baseY)}`;

    const jid = 'nlj' + j.color.replace(/[^a-zA-Z0-9]/g, '');
    s += `\n<path d="${d}" fill="none" stroke="${j.color}" stroke-width="2" marker-end="url(#${jid})"/>`;

    if (j.lbl) {
      const lblX = fmt(mid);
      const lblY = fmt(baseY - b - 7); // just above the arc peak
      s += `\n<text x="${lblX}" y="${lblY}" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="${j.color}" text-anchor="middle">${escXml(j.lbl)}</text>`;
    }
  }

  // Point markers
  for (const pt of points) {
    const x = fmt(tx(pt.v));
    s += `\n<circle cx="${x}" cy="${LINE_Y}" r="${ptR}" fill="${pt.color}"/>`;
    if (pt.lbl) {
      const ly = pt.pos === 'below'
        ? fmt(LINE_Y + ptR + 4 + ptLblSz)
        : fmt(LINE_Y - ptR - 6);
      s += `\n<text x="${x}" y="${ly}" font-family="Arial,sans-serif" font-size="${ptLblSz}" font-weight="bold" fill="${ptLblColor}" text-anchor="middle">${escXml(pt.lbl)}</text>`;
    }
  }

  return { svgStr: s + '\n</svg>', width: totalW, height: H };
}

function _genNLi(i) {
  const start = parseFloat(val(`nl-start-${i}`));
  const end   = parseFloat(val(`nl-end-${i}`));
  if (isNaN(start) || isNaN(end) || end <= start) return null;

  // Inherit styling from Line 1 controls
  const lineColor = val('nl-color')      || '#000000';
  const lineWidth = Math.max(0.5, num('nl-line-width') || 3);
  const totalW    = Math.max(200, num('nl-length') || 700);
  const PAD   = 18;
  const EXT   = Math.max(30, Math.round(totalW * 0.092));
  const SCALE = (totalW - 2 * PAD - 2 * EXT) / (end - start);
  const tx    = n => PAD + EXT + (n - start) * SCALE;

  const showIntLbl  = chk(`nl-labels-${i}`);
  const intLblSz    = Math.max(8, num('nl-int-lbl-size')  || 14);
  const intLblColor = val('nl-int-lbl-color') || '#111111';
  const intLblBold  = chk('nl-int-lbl-bold') ? 'bold' : 'normal';

  const subs        = Math.max(1, parseInt(val(`nl-subs-${i}`)) || 1);
  const subLblSz    = Math.max(7, num('nl-sub-lbl-size')  || 11);
  const subLblColor = val('nl-sub-lbl-color') || '#555555';

  const ptDefColor = val('nl-pt-color')    || '#FF0000';
  const ptR        = Math.max(2, num('nl-pt-radius') || 6);
  const ptDefPos   = val('nl-pt-pos')      || 'above';
  const ptLblSz    = Math.max(8, num('nl-pt-lbl-size')  || 16);
  const ptLblColor = val('nl-pt-lbl-color') || '#000000';

  const points = [];
  (val(`nl-points-${i}`) || '').trim().split('\n').forEach(line => {
    line = line.trim(); if (!line) return;
    const parts = line.split(':');
    const vs = parts[0].trim(), lbl = parts[1]?.trim() ?? '';
    const rawC = parts[2]?.trim() ?? '';
    const color = /^#[0-9a-fA-F]{3,6}$/.test(rawC) ? rawC : ptDefColor;
    const pos = parts[3]?.trim() || ptDefPos;
    let v;
    if (vs.includes('/')) { const [a, b] = vs.split('/'); v = parseFloat(a) / parseFloat(b); }
    else v = parseFloat(vs);
    if (isNaN(v)) return;
    points.push({ v, lbl, color, pos });
  });

  const jumpHeight = Math.max(10, num('nl-jump-height') || 35);
  const jumpColor  = val('nl-jump-color') || '#0066CC';
  const jumps = [];
  (val(`nl-jumps-${i}`) || '').trim().split('\n').forEach(line => {
    line = line.trim(); if (!line) return;
    const parts = line.split(':');
    if (parts.length < 3) return;
    const dir = parts[0].toLowerCase().trim();
    const from = parseFloat(parts[1]), to = parseFloat(parts[2]);
    const lblRaw = parts[3]?.trim() ?? 'y';
    const rawC = parts[4]?.trim() ?? '';
    const color = /^#[0-9a-fA-F]{3,6}$/.test(rawC) ? rawC : jumpColor;
    if (isNaN(from) || isNaN(to) || (dir !== 'right' && dir !== 'left')) return;
    const mag = _nlStepStr(Math.abs(to - from));
    const lbl = lblRaw === 'n' ? '' : lblRaw === 'y' ? (dir === 'left' ? `-${mag}` : mag) : lblRaw;
    jumps.push({ from, to, lbl, color });
  });

  const hasJumps   = jumps.length > 0;
  const hasJumpLbl = jumps.some(j => j.lbl);
  const hasPtAbove = points.some(p => p.pos !== 'below' && p.lbl);
  const hasPtBelow = points.some(p => p.pos === 'below' && p.lbl);
  const LIFT = 5;
  const topSpace = hasJumps
    ? LIFT + jumpHeight + (hasJumpLbl ? 22 : 10) + 8
    : hasPtAbove ? ptLblSz + ptR + 14 : 20;
  const LINE_Y = topSpace;
  const intLblH  = showIntLbl ? intLblSz + 8 : 0;
  const ptBotH   = hasPtBelow ? ptLblSz + ptR + 8 : 0;
  const H = LINE_Y + Math.max(8, intLblH, ptBotH) + 10;

  const lcId = 'nl' + i + lineColor.replace(/[^a-zA-Z0-9]/g, '');
  const jumpMarkerColors = new Set(jumps.map(j => j.color));
  let s = svgOpen(totalW, H);
  s += '\n<defs>';
  s += `\n  <marker id="${lcId}f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${lineColor}"/></marker>`;
  s += `\n  <marker id="${lcId}r" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${lineColor}"/></marker>`;
  for (const c of jumpMarkerColors) {
    const jid = 'nlj' + i + c.replace(/[^a-zA-Z0-9]/g, '');
    s += `\n  <marker id="${jid}" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${c}"/></marker>`;
  }
  s += '\n</defs>';
  s += `\n<line x1="${PAD}" y1="${LINE_Y}" x2="${totalW - PAD}" y2="${LINE_Y}" stroke="${lineColor}" stroke-width="${lineWidth}" marker-start="url(#${lcId}r)" marker-end="url(#${lcId}f)"/>`;

  for (let n = Math.ceil(start); n <= Math.floor(end); n++) {
    const x = fmt(tx(n));
    s += `\n<line x1="${x}" y1="${fmt(LINE_Y-8)}" x2="${x}" y2="${fmt(LINE_Y+8)}" stroke="${lineColor}" stroke-width="2"/>`;
    if (showIntLbl) s += `\n<text x="${x}" y="${fmt(LINE_Y+8+4+intLblSz)}" font-family="Arial,sans-serif" font-size="${intLblSz}" font-weight="${intLblBold}" fill="${intLblColor}" text-anchor="middle">${n}</text>`;
  }

  if (subs > 1) {
    for (let n = Math.floor(start); n < Math.ceil(end); n++) {
      for (let k = 1; k < subs; k++) {
        const sv = parseFloat((n + k / subs).toFixed(10));
        if (sv <= start || sv >= end) continue;
        const x = fmt(tx(sv));
        s += `\n<line x1="${x}" y1="${fmt(LINE_Y-5)}" x2="${x}" y2="${fmt(LINE_Y+5)}" stroke="${lineColor}" stroke-width="1.5"/>`;
        const svLbl = sv % 1 === 0 ? Math.round(sv) : parseFloat(sv.toFixed(4));
        s += `\n<text x="${x}" y="${fmt(LINE_Y+5+3+subLblSz)}" font-family="Arial,sans-serif" font-size="${subLblSz}" fill="${subLblColor}" text-anchor="middle">${svLbl}</text>`;
      }
    }
  }

  const K = 0.5523;
  for (const j of jumps) {
    const x1 = tx(j.from), x2 = tx(j.to), mid = (x1+x2)/2;
    const a = Math.abs(x2-x1)/2, b = jumpHeight, baseY = LINE_Y - LIFT;
    const dir = x2 > x1 ? 1 : -1;
    const d = `M${fmt(x1)} ${fmt(baseY)} C${fmt(x1)} ${fmt(baseY-b*K)} ${fmt(mid-dir*a*K)} ${fmt(baseY-b)} ${fmt(mid)} ${fmt(baseY-b)} S${fmt(x2)} ${fmt(baseY-b*K)} ${fmt(x2)} ${fmt(baseY)}`;
    const jid = 'nlj' + i + j.color.replace(/[^a-zA-Z0-9]/g, '');
    s += `\n<path d="${d}" fill="none" stroke="${j.color}" stroke-width="2" marker-end="url(#${jid})"/>`;
    if (j.lbl) s += `\n<text x="${fmt(mid)}" y="${fmt(baseY-b-7)}" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="${j.color}" text-anchor="middle">${escXml(j.lbl)}</text>`;
  }
  for (const pt of points) {
    const x = fmt(tx(pt.v));
    s += `\n<circle cx="${x}" cy="${LINE_Y}" r="${ptR}" fill="${pt.color}"/>`;
    if (pt.lbl) {
      const ly = pt.pos === 'below' ? fmt(LINE_Y+ptR+4+ptLblSz) : fmt(LINE_Y-ptR-6);
      s += `\n<text x="${x}" y="${ly}" font-family="Arial,sans-serif" font-size="${ptLblSz}" font-weight="bold" fill="${ptLblColor}" text-anchor="middle">${escXml(pt.lbl)}</text>`;
    }
  }
  return { svgStr: s + '\n</svg>', width: totalW, height: H };
}

/* ─── Fraction (unified: rectangle, circle, grid, triangle, hexagon, pentagon, parallelogram) ─── */
function generateFraction() {
  const c       = SCHEMES[currentScheme];
  const count   = Math.max(1, Math.min(4, int('frac-count') || 1));
  const layout  = val('frac-layout') || 'row';
  const gap     = Math.max(0, num('frac-gap') || 20);
  const lblSize = Math.max(8, num('frac-lbl-size') || 20);
  const lblColor= val('frac-lbl-color') || '#000000';
  const lblWt   = chk('frac-lbl-bold') ? 'bold' : 'normal';
  const cellSize= Math.max(6, num('frac-cell-size') || 13);
  const cellClr = val('frac-cell-color') || '#666666';
  const cellWt  = chk('frac-cell-bold') ? 'bold' : 'normal';

  const elems = [];
  for (let ei = 0; ei < count; ei++)
    elems.push(_genFracEl(ei, c, lblSize, lblColor, lblWt, cellSize, cellClr, cellWt));

  if (count === 1) return elems[0].svgStr;

  const withPos = (s, x, y) => s.replace('<svg ', `<svg x="${x}" y="${y}" `);
  if (layout === 'row') {
    const W = elems.reduce((s, e) => s + e.width, 0) + gap * (count - 1);
    const H = Math.max(...elems.map(e => e.height));
    let s = svgOpen(W, H);
    let x = 0;
    for (const e of elems) {
      s += '\n' + withPos(e.svgStr, x, Math.round((H - e.height) / 2));
      x += e.width + gap;
    }
    return s + '\n</svg>';
  } else {
    const W = Math.max(...elems.map(e => e.width));
    const H = elems.reduce((s, e) => s + e.height, 0) + gap * (count - 1);
    let s = svgOpen(W, H);
    let y = 0;
    for (const e of elems) {
      s += '\n' + withPos(e.svgStr, Math.round((W - e.width) / 2), y);
      y += e.height + gap;
    }
    return s + '\n</svg>';
  }
}

function _genFracEl(elIdx, c, lblSize, lblColor, lblWt, cellSize, cellClr, cellWt) {
  const sfx     = `-${elIdx}`;
  const shape   = val('frac-shape' + sfx) || 'rectangle';
  const den     = Math.max(1, Math.min(24, int('frac-den' + sfx)));
  const numN    = Math.max(0, Math.min(den, int('frac-num' + sfx)));
  const showLbl = chk('frac-label' + sfx);
  const cellNums= chk('frac-cellnums' + sfx);

  const cells  = getShading('fraction-' + elIdx, den, i => i < numN);
  const shaded = countShaded('fraction-' + elIdx);
  const lblH   = showLbl ? lblSize * 2 + 14 : 0;

  // Stacked a/b fraction label centred at (cx, topY)
  function lblSVG(cx, topY) {
    if (!showLbl) return '';
    const lineW = (Math.max(String(shaded).length, String(den).length) * lblSize * 0.62 + lblSize * 0.5);
    const lw    = Math.max(1, Math.round(lblSize * 0.07));
    const lineY = topY + lblSize + 3;
    const denY  = lineY + 3 + Math.round(lblSize * 0.72);
    return `\n<text x="${fmt(cx)}" y="${fmt(topY + lblSize)}" font-family="Arial,sans-serif" font-size="${lblSize}" font-weight="${lblWt}" fill="${lblColor}" text-anchor="middle">${shaded}</text>` +
           `\n<line x1="${fmt(cx - lineW/2)}" y1="${fmt(lineY)}" x2="${fmt(cx + lineW/2)}" y2="${fmt(lineY)}" stroke="${lblColor}" stroke-width="${lw}"/>` +
           `\n<text x="${fmt(cx)}" y="${fmt(denY)}" font-family="Arial,sans-serif" font-size="${lblSize}" font-weight="${lblWt}" fill="${lblColor}" text-anchor="middle">${den}</text>`;
  }

  const de = `data-el="${elIdx}"`;  // shorthand for hit area attribute
  let s = '', _W = 0, _H = 0;

  // ── Rectangle ──────────────────────────────────────────────────────────────
  if (shape === 'rectangle') {
    const cW = 60, cH = 60, x0 = 10, y0 = 10;
    _W = den * cW + 20;
    _H = y0 + cH + (showLbl ? 16 + lblH : 12);
    const shpCx = x0 + (den * cW) / 2;
    s = svgOpen(_W, _H);
    for (let i = 0; i < den; i++)
      if (cells[i]) s += `\n<rect x="${x0 + i*cW}" y="${y0}" width="${cW}" height="${cH}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
    for (let i = 1; i < den; i++)
      s += `\n<line x1="${x0 + i*cW}" y1="${y0}" x2="${x0 + i*cW}" y2="${y0 + cH}" stroke="${c.dark}" stroke-width="1.2"/>`;
    if (cellNums) for (let i = 0; i < den; i++)
      s += `\n<text x="${x0 + i*cW + cW/2}" y="${y0 + cH/2}" font-family="Arial,sans-serif" font-size="${cellSize}" font-weight="${cellWt}" fill="${cells[i] ? cellClr : '#ccc'}" text-anchor="middle" dominant-baseline="central">${i+1}</text>`;
    for (let i = 0; i < den; i++)
      s += `\n<rect ${de} data-cell="${i}" x="${x0 + i*cW}" y="${y0}" width="${cW}" height="${cH}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`;
    s += `\n<rect x="${x0}" y="${y0}" width="${den * cW}" height="${cH}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
    s += lblSVG(shpCx, y0 + cH + 14);

  // ── Circle ─────────────────────────────────────────────────────────────────
  } else if (shape === 'circle') {
    const cx = 110, cy = 110, r = 90;
    _W = 220; _H = _W + (showLbl ? 14 + lblH : 6);
    s = svgOpen(_W, _H);
    const pt = deg => { const rad = (90 - deg) * Math.PI / 180; return [fmt(cx + r * Math.cos(rad)), fmt(cy - r * Math.sin(rad))]; };
    if (den === 1) {
      if (cells[0]) s += `\n<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
      s += `\n<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
      s += `\n<circle ${de} data-cell="0" cx="${cx}" cy="${cy}" r="${r}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`;
      if (cellNums) s += `\n<text x="${cx}" y="${cy}" font-family="Arial,sans-serif" font-size="${cellSize}" font-weight="${cellWt}" fill="${cells[0] ? cellClr : '#ccc'}" text-anchor="middle" dominant-baseline="central">1</text>`;
    } else {
      const step = 360 / den;
      const arc = i => { const [x1,y1] = pt(i*step), [x2,y2] = pt((i+1)*step); return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${step>180?1:0} 1 ${x2} ${y2} Z`; };
      for (let i = 0; i < den; i++) if (cells[i]) s += `\n<path d="${arc(i)}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
      for (let i = 0; i < den; i++) s += `\n<path d="${arc(i)}" fill="none" stroke="${c.dark}" stroke-width="1.2"/>`;
      s += `\n<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
      for (let i = 0; i < den; i++) s += `\n<path ${de} data-cell="${i}" d="${arc(i)}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`;
      if (cellNums) for (let i = 0; i < den; i++) {
        const mid = (90 - (i + 0.5) * step) * Math.PI / 180;
        s += `\n<text x="${fmt(cx + r*0.6*Math.cos(mid))}" y="${fmt(cy - r*0.6*Math.sin(mid))}" font-family="Arial,sans-serif" font-size="${cellSize}" font-weight="${cellWt}" fill="${cells[i] ? cellClr : '#ccc'}" text-anchor="middle" dominant-baseline="central">${i+1}</text>`;
      }
    }
    s += lblSVG(cx, _W + 10);

  // ── Grid ───────────────────────────────────────────────────────────────────
  } else if (shape === 'grid') {
    let rows = Math.floor(Math.sqrt(den));
    while (rows > 1 && den % rows !== 0) rows--;
    const cols = den / rows;
    const cell = 60, x0 = 10, y0 = 10;
    _W = cols * cell + 20;
    _H = y0 + rows * cell + (showLbl ? 16 + lblH : 12);
    const shpCx = x0 + (cols * cell) / 2;
    s = svgOpen(_W, _H);
    let idx = 0;
    for (let r = 0; r < rows; r++) for (let cj = 0; cj < cols; cj++) {
      if (cells[idx]) s += `\n<rect x="${x0+cj*cell}" y="${y0+r*cell}" width="${cell}" height="${cell}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
      idx++;
    }
    for (let r = 0; r <= rows; r++) s += `\n<line x1="${x0}" y1="${y0+r*cell}" x2="${x0+cols*cell}" y2="${y0+r*cell}" stroke="${c.dark}" stroke-width="${(r===0||r===rows)?2.5:1.2}"/>`;
    for (let cj = 0; cj <= cols; cj++) s += `\n<line x1="${x0+cj*cell}" y1="${y0}" x2="${x0+cj*cell}" y2="${y0+rows*cell}" stroke="${c.dark}" stroke-width="${(cj===0||cj===cols)?2.5:1.2}"/>`;
    if (cellNums) { idx=0; for (let r=0;r<rows;r++) for (let cj=0;cj<cols;cj++) { s+=`\n<text x="${x0+cj*cell+cell/2}" y="${y0+r*cell+cell/2}" font-family="Arial,sans-serif" font-size="${cellSize}" font-weight="${cellWt}" fill="${cells[idx]?cellClr:'#ccc'}" text-anchor="middle" dominant-baseline="central">${idx+1}</text>`; idx++; } }
    idx=0; for (let r=0;r<rows;r++) for (let cj=0;cj<cols;cj++) { s+=`\n<rect ${de} data-cell="${idx}" x="${x0+cj*cell}" y="${y0+r*cell}" width="${cell}" height="${cell}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`; idx++; }
    s += lblSVG(shpCx, y0 + rows * cell + 14);

  // ── Triangle / Hexagon / Pentagon (radial sectors, clipped to polygon) ─────
  } else if (shape === 'triangle' || shape === 'hexagon' || shape === 'pentagon') {
    const pCx = 130, pCy = 120, pR = 108;
    const nSides = shape === 'triangle' ? 3 : shape === 'pentagon' ? 5 : 6;
    const polyPts = [];
    for (let i = 0; i < nSides; i++) {
      const a = (-90 + i * 360/nSides) * Math.PI/180;
      polyPts.push([fmt(pCx + pR*Math.cos(a)), fmt(pCy + pR*Math.sin(a))]);
    }
    const ptStr = polyPts.map(p => p.join(',')).join(' ');
    _W = 260; _H = 240 + (showLbl ? 14 + lblH : 6);
    const clipId = `fpc_${shape}_${elIdx}`;
    s = svgOpen(_W, _H);
    s += `\n<defs><clipPath id="${clipId}"><polygon points="${ptStr}"/></clipPath></defs>`;
    const clip = `clip-path="url(#${clipId})"`;
    if (den === 1) {
      if (cells[0]) s += `\n<polygon points="${ptStr}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
    } else {
      const step = 360 / den;
      const bigR = pR * 1.7;
      for (let i = 0; i < den; i++) {
        const a1 = (-90 + i * step) * Math.PI/180;
        const a2 = (-90 + (i+1) * step) * Math.PI/180;
        const x1 = fmt(pCx + bigR*Math.cos(a1)), y1 = fmt(pCy + bigR*Math.sin(a1));
        const x2 = fmt(pCx + bigR*Math.cos(a2)), y2 = fmt(pCy + bigR*Math.sin(a2));
        const d = `M ${pCx} ${pCy} L ${x1} ${y1} A ${bigR} ${bigR} 0 ${step>180?1:0} 1 ${x2} ${y2} Z`;
        if (cells[i]) s += `\n<path d="${d}" fill="${c.light}" fill-opacity="0.6" stroke="none" ${clip}/>`;
        s += `\n<line x1="${pCx}" y1="${pCy}" x2="${x1}" y2="${y1}" stroke="${c.dark}" stroke-width="1.2" ${clip}/>`;
      }
      if (cellNums) for (let i = 0; i < den; i++) {
        const mid = (-90 + (i+0.5) * step) * Math.PI/180;
        s += `\n<text x="${fmt(pCx + pR*0.57*Math.cos(mid))}" y="${fmt(pCy + pR*0.57*Math.sin(mid))}" font-family="Arial,sans-serif" font-size="${cellSize}" font-weight="${cellWt}" fill="${cells[i]?cellClr:'#ccc'}" text-anchor="middle" dominant-baseline="central">${i+1}</text>`;
      }
    }
    s += `\n<polygon points="${ptStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
    if (den === 1) {
      s += `\n<polygon ${de} data-cell="0" points="${ptStr}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`;
      if (cellNums) s += `\n<text x="${pCx}" y="${pCy}" font-family="Arial,sans-serif" font-size="${cellSize}" font-weight="${cellWt}" fill="${cells[0]?cellClr:'#ccc'}" text-anchor="middle" dominant-baseline="central">1</text>`;
    } else {
      const step = 360 / den;
      const bigR = pR * 1.7;
      for (let i = 0; i < den; i++) {
        const a1 = (-90 + i * step) * Math.PI/180;
        const a2 = (-90 + (i+1) * step) * Math.PI/180;
        const x1 = fmt(pCx + bigR*Math.cos(a1)), y1 = fmt(pCy + bigR*Math.sin(a1));
        const x2 = fmt(pCx + bigR*Math.cos(a2)), y2 = fmt(pCy + bigR*Math.sin(a2));
        const d = `M ${pCx} ${pCy} L ${x1} ${y1} A ${bigR} ${bigR} 0 ${step>180?1:0} 1 ${x2} ${y2} Z`;
        s += `\n<path ${de} data-cell="${i}" d="${d}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer" ${clip}/>`;
      }
    }
    s += lblSVG(pCx, 240 + 10);

  // ── Parallelogram (vertical strips) ────────────────────────────────────────
  } else if (shape === 'parallelogram') {
    const skew = 36, pW = 240, pH = 80, x0 = 20, y0 = 20;
    _W = x0 + pW + skew + x0;
    _H = y0 + pH + (showLbl ? 16 + lblH : 12);
    const shpCx = x0 + skew/2 + pW/2;
    const paraStr = `${x0+skew},${y0} ${x0+skew+pW},${y0} ${x0+pW},${y0+pH} ${x0},${y0+pH}`;
    s = svgOpen(_W, _H);
    const stripW = pW / den;
    for (let i = 0; i < den; i++) {
      const bx1 = x0 + i*stripW, bx2 = x0 + (i+1)*stripW;
      if (cells[i]) s += `\n<polygon points="${bx1+skew},${y0} ${bx2+skew},${y0} ${bx2},${y0+pH} ${bx1},${y0+pH}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
    }
    for (let i = 1; i < den; i++) {
      const bx = x0 + i*stripW;
      s += `\n<line x1="${fmt(bx+skew)}" y1="${y0}" x2="${fmt(bx)}" y2="${y0+pH}" stroke="${c.dark}" stroke-width="1.2"/>`;
    }
    if (cellNums) for (let i = 0; i < den; i++) {
      const bx1 = x0 + i*stripW, bx2 = x0 + (i+1)*stripW;
      s += `\n<text x="${fmt((bx1+bx2)/2 + skew/2)}" y="${fmt(y0+pH/2)}" font-family="Arial,sans-serif" font-size="${cellSize}" font-weight="${cellWt}" fill="${cells[i]?cellClr:'#ccc'}" text-anchor="middle" dominant-baseline="central">${i+1}</text>`;
    }
    for (let i = 0; i < den; i++) {
      const bx1 = x0 + i*stripW, bx2 = x0 + (i+1)*stripW;
      s += `\n<polygon ${de} data-cell="${i}" points="${bx1+skew},${y0} ${bx2+skew},${y0} ${bx2},${y0+pH} ${bx1},${y0+pH}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`;
    }
    s += `\n<polygon points="${paraStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
    s += lblSVG(shpCx, y0 + pH + 14);
  }

  return { svgStr: s + '\n</svg>', width: _W, height: _H };
}

/* ─── Rectangle (with adaptive line subdivision) ─── */
function generateRectangle() {
  const c=SCHEMES[currentScheme];
  const wv=Math.max(0.5,num('rect-w'));
  const hv=Math.max(0.5,num('rect-h'));
  const wl=val('rect-wl')||String(wv);
  const hl=val('rect-hl')||String(hv);
  const filled=chk('rect-fill');

  const scale=Math.min(50,Math.max(12,240/Math.max(wv,hv)));
  const rW=fmt(wv*scale), rH=fmt(hv*scale);
  const W=rW+140, H=rH+110;
  const rx=70, ry=40;

  // Store bounds for line intersection detection
  shapeGeometry.rect = { x: rx, y: ry, w: rW, h: rH };

  // Get grid divisions from drawn lines
  const { hCuts, vCuts } = getRectLineDivisions();
  const hasGrid = hCuts.length > 0 || vCuts.length > 0;

  let s=svgOpen(W,H);

  if (hasGrid) {
    // Build row/col boundary arrays
    const ys = [ry,    ...hCuts, ry+rH];
    const xs = [rx,    ...vCuts, rx+rW];
    const rows = ys.length-1;
    const cols = xs.length-1;
    const total = rows*cols;

    const cells = getShading('rectangle', total, ()=>false);

    // Fills
    let idx=0;
    for (let r=0;r<rows;r++) for (let c2=0;c2<cols;c2++) {
      const cx_=xs[c2], cy_=ys[r], cw=xs[c2+1]-xs[c2], ch=ys[r+1]-ys[r];
      if (cells[idx]) s+=`\n<rect x="${cx_}" y="${cy_}" width="${cw}" height="${ch}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
      idx++;
    }
    // Grid lines
    for (const y of ys) s+=`\n<line x1="${rx}" y1="${y}" x2="${rx+rW}" y2="${y}" stroke="${c.dark}" stroke-width="${(y===ry||y===ry+rH)?2.5:1.2}"/>`;
    for (const x of xs) s+=`\n<line x1="${x}" y1="${ry}" x2="${x}" y2="${ry+rH}" stroke="${c.dark}" stroke-width="${(x===rx||x===rx+rW)?2.5:1.2}"/>`;
    // Hit areas
    idx=0;
    for (let r=0;r<rows;r++) for (let c2=0;c2<cols;c2++) {
      const cx_=xs[c2], cy_=ys[r], cw=xs[c2+1]-xs[c2], ch=ys[r+1]-ys[r];
      s+=`\n<rect data-cell="${idx}" x="${cx_}" y="${cy_}" width="${cw}" height="${ch}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`;
      idx++;
    }
  } else {
    // Plain rectangle
    if (filled) s+=`\n<rect x="${rx}" y="${ry}" width="${rW}" height="${rH}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
    s+=`\n<rect x="${rx}" y="${ry}" width="${rW}" height="${rH}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
  }

  // Dimension lines
  const wy=ry+rH+28;
  s+=`\n<line x1="${rx}" y1="${wy-5}" x2="${rx}" y2="${wy+5}" stroke="${c.dark}" stroke-width="1.5"/>`;
  s+=`\n<line x1="${rx+rW}" y1="${wy-5}" x2="${rx+rW}" y2="${wy+5}" stroke="${c.dark}" stroke-width="1.5"/>`;
  s+=`\n<line x1="${rx}" y1="${wy}" x2="${rx+rW}" y2="${wy}" stroke="${c.dark}" stroke-width="1.2"/>`;
  s+=`\n<text x="${rx+rW/2}" y="${wy+15}" font-family="Arial,sans-serif" font-size="13" fill="#000000" text-anchor="middle">${escXml(wl)}</text>`;
  const dx=rx-32, ty=ry+rH/2;
  s+=`\n<line x1="${dx-5}" y1="${ry}" x2="${dx+5}" y2="${ry}" stroke="${c.dark}" stroke-width="1.5"/>`;
  s+=`\n<line x1="${dx-5}" y1="${ry+rH}" x2="${dx+5}" y2="${ry+rH}" stroke="${c.dark}" stroke-width="1.5"/>`;
  s+=`\n<line x1="${dx}" y1="${ry}" x2="${dx}" y2="${ry+rH}" stroke="${c.dark}" stroke-width="1.2"/>`;
  s+=`\n<text x="${dx-16}" y="${ty}" font-family="Arial,sans-serif" font-size="13" fill="#000000" text-anchor="middle" dominant-baseline="central" transform="rotate(-90,${dx-16},${ty})">${escXml(hl)}</text>`;

  return s+'\n</svg>';
}

/* ─── Circle ─── */
function generateCircle() {
  const c=SCHEMES[currentScheme];
  const rl=val('circ-rlabel');
  const showDiam=chk('circ-diameter'), showCenter=chk('circ-center'), filled=chk('circ-fill');
  const cx=130,cy=130,r=100,W=260,H=260;
  let s=svgOpen(W,H);
  s+=`\n<circle cx="${cx}" cy="${cy}" r="${r}" fill="${filled?c.pale:'none'}" ${filled?'fill-opacity="0.4"':''} stroke="${c.dark}" stroke-width="2.5"/>`;
  if (showDiam) {
    s+=`\n<line x1="${cx-r}" y1="${cy}" x2="${cx+r}" y2="${cy}" stroke="${c.dark}" stroke-width="1.5" stroke-dasharray="6,4"/>`;
    if (rl) s+=`\n<text x="${cx}" y="${cy-12}" font-family="Arial,sans-serif" font-size="14" fill="#000000" text-anchor="middle">2${escXml(rl)}</text>`;
  } else if (rl) {
    s+=`\n<line x1="${cx}" y1="${cy}" x2="${cx+r}" y2="${cy}" stroke="${c.dark}" stroke-width="1.5"/>`;
    s+=`\n<text x="${cx+r/2}" y="${cy-12}" font-family="Arial,sans-serif" font-size="14" fill="#000000" text-anchor="middle">${escXml(rl)}</text>`;
  }
  if (showCenter) s+=`\n<circle cx="${cx}" cy="${cy}" r="4" fill="${c.dark}"/>`;
  return s+'\n</svg>';
}

/* ─── Equilateral Triangle ─── */
function generateTriangle() {
  const c=SCHEMES[currentScheme];
  const sideVal=val('tri-side')||'6';
  const sideLabel=val('tri-side-label')||sideVal;
  const filled=chk('tri-fill');
  const showH=chk('tri-height');
  const s_=Math.max(0.5,parseFloat(sideVal));
  const scale=Math.min(55,Math.max(15,240/s_));
  const base=fmt(s_*scale);
  const height=fmt(base*Math.sqrt(3)/2);
  const W=base+80, H=height+80;
  const ax=40+base/2, ay=30;
  const bx=40, by=fmt(30+height);
  const cx_=40+base, cy_=fmt(30+height);

  const verts=[[ax,ay],[bx,by],[cx_,cy_]];
  shapeGeometry.polygon=verts;

  const regions=getPolygonSplit(verts);
  const ptStr=`${ax},${ay} ${bx},${by} ${cx_},${cy_}`;

  let s=svgOpen(W,H);
  if (regions) {
    const cells=getShading('triangleSplit',regions.length,()=>false);
    const tp=p=>'M'+p.map(v=>v.join(',')).join(' L')+'Z';
    regions.forEach((poly,i)=>{ if(cells[i]) s+=`\n<path d="${tp(poly)}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`; });
    s+=`\n<polygon points="${ptStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
    regions.forEach((poly,i)=>{ s+=`\n<path data-cell="${i}" d="${tp(poly)}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`; });
  } else {
    if (filled) s+=`\n<polygon points="${ptStr}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
    s+=`\n<polygon points="${ptStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
  }

  s+=`\n<text x="${(bx+cx_)/2}" y="${by+18}" font-family="Arial,sans-serif" font-size="13" fill="#000000" text-anchor="middle">${escXml(sideLabel)}</text>`;
  if (showH && !split) {
    const hx=ax;
    s+=`\n<line x1="${hx}" y1="${ay}" x2="${hx}" y2="${by}" stroke="${c.dark}" stroke-width="1.2" stroke-dasharray="5,4"/>`;
    const hLabel=val('tri-height-label')||'h';
    s+=`\n<text x="${hx+12}" y="${(ay+by)/2}" font-family="Arial,sans-serif" font-size="12" fill="#000000" dominant-baseline="central">${escXml(hLabel)}</text>`;
  }
  return s+'\n</svg>';
}

/* ─── Right Triangle ─── */
function generateRightTriangle() {
  const c=SCHEMES[currentScheme];
  const bv=Math.max(0.5,num('rtri-b'));
  const hv=Math.max(0.5,num('rtri-h'));
  const bl=val('rtri-bl')||String(bv);
  const hl_=val('rtri-hl')||String(hv);
  const filled=chk('rtri-fill');
  const scale=Math.min(50,Math.max(12,200/Math.max(bv,hv)));
  const bpx=fmt(bv*scale), hpx=fmt(hv*scale);
  const W=bpx+100, H=hpx+80;
  const ax=60, ay=30;           // top (right angle corner top)
  const bx=60, by_=fmt(30+hpx); // bottom-left
  const cx_=fmt(60+bpx), cy__=fmt(30+hpx); // bottom-right

  let s=svgOpen(W,H);
  if (filled) s+=`\n<polygon points="${ax},${ay} ${bx},${by_} ${cx_},${cy__}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
  s+=`\n<polygon points="${ax},${ay} ${bx},${by_} ${cx_},${cy__}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
  // Right angle marker
  const m=14;
  s+=`\n<path d="M ${ax+m},${ay} L ${ax+m},${ay+m} L ${ax},${ay+m}" fill="none" stroke="${c.dark}" stroke-width="1.5"/>`;
  // Labels
  s+=`\n<text x="${(bx+cx_)/2}" y="${by_+16}" font-family="Arial,sans-serif" font-size="13" fill="#000000" text-anchor="middle">${escXml(bl)}</text>`;
  s+=`\n<text x="${ax-16}" y="${(ay+by_)/2}" font-family="Arial,sans-serif" font-size="13" fill="#000000" text-anchor="middle" dominant-baseline="central" transform="rotate(-90,${ax-16},${(ay+by_)/2})">${escXml(hl_)}</text>`;
  return s+'\n</svg>';
}

/* ─── Regular Polygon helper ─── */
function regularPolygon(n, cx, cy, r, startAngleDeg) {
  const pts = [];
  for (let i=0; i<n; i++) {
    const a=(startAngleDeg + i*360/n)*Math.PI/180;
    pts.push([fmt(cx+r*Math.cos(a)), fmt(cy+r*Math.sin(a))]);
  }
  return pts;
}

/* ─── Pentagon ─── */
function generatePentagon() {
  const c=SCHEMES[currentScheme];
  const filled=chk('pent-fill');
  const lbl=val('pent-label')||'';
  const cx=130, cy=125, r=100, W=260, H=260;
  const pts=regularPolygon(5,cx,cy,r,-90);
  shapeGeometry.polygon=pts;
  const regions=getPolygonSplit(pts);
  const ptStr=pts.map(p=>p.join(',')).join(' ');
  let s=svgOpen(W,H);
  if (regions) {
    const cells=getShading('pentagonSplit',regions.length,()=>false);
    const tp=p=>'M'+p.map(v=>v.join(',')).join(' L')+'Z';
    regions.forEach((poly,i)=>{ if(cells[i]) s+=`\n<path d="${tp(poly)}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`; });
    s+=`\n<polygon points="${ptStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
    regions.forEach((poly,i)=>{ s+=`\n<path data-cell="${i}" d="${tp(poly)}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`; });
  } else {
    if (filled) s+=`\n<polygon points="${ptStr}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
    s+=`\n<polygon points="${ptStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
  }
  if (lbl) s+=`\n<text x="${cx}" y="${cy+4}" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="#000000" text-anchor="middle" dominant-baseline="central">${escXml(lbl)}</text>`;
  return s+'\n</svg>';
}

/* ─── Hexagon ─── */
function generateHexagon() {
  const c=SCHEMES[currentScheme];
  const filled=chk('hex-fill');
  const lbl=val('hex-label')||'';
  const flat=chk('hex-flat');
  const cx=130, cy=130, r=100, W=260, H=260;
  const startAngle=flat?0:-30;
  const pts=regularPolygon(6,cx,cy,r,startAngle);
  shapeGeometry.polygon=pts;
  const regions=getPolygonSplit(pts);
  const ptStr=pts.map(p=>p.join(',')).join(' ');
  let s=svgOpen(W,H);
  if (regions) {
    const cells=getShading('hexagonSplit',regions.length,()=>false);
    const tp=p=>'M'+p.map(v=>v.join(',')).join(' L')+'Z';
    regions.forEach((poly,i)=>{ if(cells[i]) s+=`\n<path d="${tp(poly)}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`; });
    s+=`\n<polygon points="${ptStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
    regions.forEach((poly,i)=>{ s+=`\n<path data-cell="${i}" d="${tp(poly)}" fill="transparent" stroke="none" pointer-events="fill" style="cursor:pointer"/>`; });
  } else {
    if (filled) s+=`\n<polygon points="${ptStr}" fill="${c.light}" fill-opacity="0.6" stroke="none"/>`;
    s+=`\n<polygon points="${ptStr}" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`;
  }
  if (lbl) s+=`\n<text x="${cx}" y="${cy+4}" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="#000000" text-anchor="middle" dominant-baseline="central">${escXml(lbl)}</text>`;
  return s+'\n</svg>';
}

/* ─── Line shapes ─── */
function generateLineShape() {
  const style   = val('lshape-style') || 'solid';
  const color   = val('lshape-color') || '#333333';
  const width   = Math.max(1, parseFloat(val('lshape-width')) || 2);
  const length  = Math.max(40, int('lshape-length') || 200);
  const cap     = 'round';
  const W=length+60, H=60;
  const y=30, x1=30, x2=30+length;

  let dash='', markerDefs='', markers='';
  if (style==='dashed')       dash=` stroke-dasharray="10 6"`;
  if (style==='dotted')       dash=` stroke-dasharray="3 5"`;
  if (style==='arrow'||style==='double-arrow') {
    markerDefs=`<defs>
  <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
    <path d="M0,0 L10,5 L0,10 Z" fill="${color}"/>
  </marker>
  <marker id="a-rev" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 Z" fill="${color}"/>
  </marker>
</defs>`;
    markers=` marker-end="url(#a)"`;
    if (style==='double-arrow') markers=` marker-start="url(#a-rev)" marker-end="url(#a)"`;
  }

  let s=svgOpen(W,H);
  if (markerDefs) s+='\n'+markerDefs;
  s+=`\n<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="${width}" stroke-linecap="${cap}"${dash}${markers}/>`;
  return s+'\n</svg>';
}

/* ─── Geometry (multi-element, unified) ─── */

function generateGeometry() {
  const count  = Math.max(1, Math.min(4, int('geo-count') || 1));
  const layout = val('geo-layout') || 'row';
  const gap    = Math.max(0, num('geo-gap') || 20);
  const elems  = [];
  for (let ei = 0; ei < count; ei++) { const r = _genGeoEl(ei); if (r) elems.push(r); }
  if (!elems.length) return errorSVG('No shapes');
  if (elems.length === 1) return elems[0].svgStr;
  const wp = (s, x, y) => s.replace('<svg ', `<svg x="${x}" y="${y}" `);
  if (layout === 'row') {
    const W = elems.reduce((a, e) => a + e.width, 0) + gap * (elems.length - 1);
    const H = Math.max(...elems.map(e => e.height));
    let s = svgOpen(W, H); let x = 0;
    for (const e of elems) { s += '\n' + wp(e.svgStr, x, Math.round((H-e.height)/2)); x += e.width + gap; }
    return s + '\n</svg>';
  } else {
    const W = Math.max(...elems.map(e => e.width));
    const H = elems.reduce((a, e) => a + e.height, 0) + gap * (elems.length - 1);
    let s = svgOpen(W, H); let y = 0;
    for (const e of elems) { s += '\n' + wp(e.svgStr, Math.round((W-e.width)/2), y); y += e.height + gap; }
    return s + '\n</svg>';
  }
}

function _genGeoEl(n) {
  const type = val(`geo-type-${n}`) || 'rectangle';
  const m = { rectangle:_geoRect, square:_geoSquare, circle:_geoCircle, ellipse:_geoEllipse,
              triangle:_geoTriangle, parallelogram:_geoParallelogram, rhombus:_geoRhombus,
              trapezoid:_geoTrapezoid, pentagon:_geoPentagon, hexagon:_geoHexagon,
              octagon:_geoOctagon, sector:_geoSector };
  return (m[type] || _geoRect)(n);
}

/* ── geometry shared helpers ── */
function _txtAttr(st = {}) {
  const ff = st.ff || 'Arial,sans-serif';
  const fw = st.fw || 'normal';
  const fst = st.fstyle || 'normal';
  return `font-family="${ff}" font-weight="${fw}" font-style="${fst}"`;
}

function _gst(n) {
  const c = SCHEMES[currentScheme];
  return {
    fill:    val(`geo-fill-color-${n}`)   || c.pale,
    stroke:  val(`geo-stroke-color-${n}`) || c.dark,
    sw:      Math.max(0.5, num(`geo-stroke-width-${n}`) || 2.5),
    filled:  chk(`geo-fill-${n}`),
    fillOp:  Math.min(1, Math.max(0, num(`geo-fill-opacity-${n}`) || 0.45)),
    arrows:  chk(`geo-arrows-${n}`),
    labels:  chk(`geo-show-labels-${n}`),
    lc:     val(`geo-lbl-color-${n}`)  || '#333333',
    fs:     Math.max(6, num(`geo-lbl-size-${n}`) || 13),
    fw:     val(`geo-lbl-weight-${n}`) || 'normal',
    fstyle: val(`geo-lbl-fstyle-${n}`) || 'normal',
    ff:     val(`geo-lbl-family-${n}`) || 'Arial,sans-serif',
    loff:   num(`geo-lbl-offset-${n}`) || 0,
  };
}

function _dimArr(x1, y1, x2, y2, lbl, clr, fs, st = {}) {
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy); if (len<2) return '';
  const nx=dx/len, ny=dy/len, ah=7, aw=3.5;
  const p1=`${fmt(x1+ny*aw)},${fmt(y1-nx*aw)} ${fmt(x1-nx*ah)},${fmt(y1-ny*ah)} ${fmt(x1-ny*aw)},${fmt(y1+nx*aw)}`;
  const p2=`${fmt(x2+ny*aw)},${fmt(y2-nx*aw)} ${fmt(x2+nx*ah)},${fmt(y2+ny*ah)} ${fmt(x2-ny*aw)},${fmt(y2+nx*aw)}`;
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  let ang=Math.atan2(dy,dx)*180/Math.PI; if (ang>90||ang<-90) ang+=180;
  let s=`\n<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" stroke="${clr}" stroke-width="1.2"/>`;
  s+=`\n<polygon points="${p1}" fill="${clr}" stroke="none"/>`;
  s+=`\n<polygon points="${p2}" fill="${clr}" stroke="none"/>`;
  if (lbl) s+=`\n<text x="${fmt(mx)}" y="${fmt(my)}" ${_txtAttr(st)} font-size="${fs||13}" fill="${clr}" text-anchor="middle" dominant-baseline="central" transform="rotate(${fmt(ang,1)},${fmt(mx)},${fmt(my)})">${escXml(lbl)}</text>`;
  return s;
}

function _sideLbl(x1, y1, x2, y2, lbl, clr, fs, flip, st = {}) {
  if (!lbl) return '';
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
  const nx=-dy/len, ny=dx/len, sign=flip?-1:1, OFF=17+(st.loff||0);
  return `\n<text x="${fmt(mx+sign*nx*OFF)}" y="${fmt(my+sign*ny*OFF)}" ${_txtAttr(st)} font-size="${fs||13}" fill="${clr}" text-anchor="middle" dominant-baseline="central">${escXml(lbl)}</text>`;
}

function _raMark(px, py, d1x, d1y, d2x, d2y, sz, clr) {
  const q1x=px+sz*d1x, q1y=py+sz*d1y, q2x=px+sz*d2x, q2y=py+sz*d2y;
  const q3x=px+sz*(d1x+d2x), q3y=py+sz*(d1y+d2y);
  return `\n<path d="M${fmt(q1x)},${fmt(q1y)} L${fmt(q3x)},${fmt(q3y)} L${fmt(q2x)},${fmt(q2y)}" fill="none" stroke="${clr}" stroke-width="1.5"/>`;
}

function _angArc(p, a, b, r, lbl, clr) {
  const a1d=Math.atan2(a[1]-p[1],a[0]-p[0])*180/Math.PI;
  const a2d=Math.atan2(b[1]-p[1],b[0]-p[0])*180/Math.PI;
  let diff=((a2d-a1d)%360+360)%360; if (diff>180) diff-=360;
  const sweep=diff>0?1:0, a1r=a1d*Math.PI/180, a2r=(a1d+diff)*Math.PI/180;
  const x1=fmt(p[0]+r*Math.cos(a1r)), y1=fmt(p[1]+r*Math.sin(a1r));
  const x2=fmt(p[0]+r*Math.cos(a2r)), y2=fmt(p[1]+r*Math.sin(a2r));
  let s=`\n<path d="M${x1},${y1} A${r},${r} 0 0,${sweep} ${x2},${y2}" fill="none" stroke="${clr}" stroke-width="1.2"/>`;
  if (lbl) {
    const am=(a1d+diff/2)*Math.PI/180;
    s+=`\n<text x="${fmt(p[0]+(r+13)*Math.cos(am))}" y="${fmt(p[1]+(r+13)*Math.sin(am))}" font-family="Arial,sans-serif" font-size="10" fill="${clr}" text-anchor="middle" dominant-baseline="central">${escXml(lbl)}</text>`;
  }
  return s;
}

function _geoErr(msg) { return { svgStr: errorSVG(msg), width: 340, height: 40 }; }

/* ── Rectangle ── */
function _geoRect(n) {
  const wv=Math.max(0.5,num(`geo-rect-w-${n}`)||6), hv=Math.max(0.5,num(`geo-rect-h-${n}`)||4);
  const cr=Math.max(0,num(`geo-rect-corner-${n}`)||0), diag=val(`geo-rect-diag-${n}`)||'none';
  const showRA=chk(`geo-rect-ra-${n}`), wlbl=val(`geo-rect-wlbl-${n}`), hlbl=val(`geo-rect-hlbl-${n}`);
  const st=_gst(n);
  const sc=Math.min(50,Math.max(10,240/Math.max(wv,hv)));
  const rW=fmt(wv*sc), rH=fmt(hv*sc);
  const LP=50,RP=20,TP=20,BP=st.labels?48:22;
  const W=LP+rW+RP, H=TP+rH+BP, rx=LP, ry=TP;
  let s=svgOpen(W,H);
  if (st.filled) s+=`\n<rect x="${rx}" y="${ry}" width="${rW}" height="${rH}" rx="${cr}" fill="${st.fill}" fill-opacity="${st.fillOp}"/>`;
  if (diag==='one'||diag==='both') s+=`\n<line x1="${rx}" y1="${ry}" x2="${fmt(rx+rW)}" y2="${fmt(ry+rH)}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
  if (diag==='both') s+=`\n<line x1="${fmt(rx+rW)}" y1="${ry}" x2="${rx}" y2="${fmt(ry+rH)}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
  s+=`\n<rect x="${rx}" y="${ry}" width="${rW}" height="${rH}" rx="${cr}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (showRA&&cr===0) {
    const m=10;
    s+=_raMark(rx,ry,1,0,0,1,m,st.stroke)+_raMark(rx+rW,ry,-1,0,0,1,m,st.stroke);
    s+=_raMark(rx,ry+rH,1,0,0,-1,m,st.stroke)+_raMark(rx+rW,ry+rH,-1,0,0,-1,m,st.stroke);
  }
  if (st.labels) {
    const wt=wlbl||String(wv), ht=hlbl||String(hv);
    if (st.arrows) {
      s+=_dimArr(rx,ry+rH+28,rx+rW,ry+rH+28,wt,st.lc,st.fs,st);
      s+=_dimArr(rx-32,ry+rH,rx-32,ry,ht,st.lc,st.fs,st);
    } else {
      s+=`\n<text x="${fmt(rx+rW/2)}" y="${fmt(ry+rH+18)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(wt)}</text>`;
      s+=`\n<text x="${fmt(rx-18)}" y="${fmt(ry+rH/2)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle" dominant-baseline="central" transform="rotate(-90,${fmt(rx-18)},${fmt(ry+rH/2)})">${escXml(ht)}</text>`;
    }
  }
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Square ── */
function _geoSquare(n) {
  const sv=Math.max(0.5,num(`geo-sq-side-${n}`)||5), showDiag=chk(`geo-sq-diag-${n}`), lbl=val(`geo-sq-lbl-${n}`), st=_gst(n);
  const sc=Math.min(50,Math.max(10,240/sv)), side=fmt(sv*sc);
  const LP=42, W=LP+side+20, H=46+side+(st.labels?40:20), rx=LP, ry=46;
  let s=svgOpen(W,H);
  if (st.filled) s+=`\n<rect x="${rx}" y="${ry}" width="${side}" height="${side}" fill="${st.fill}" fill-opacity="${st.fillOp}"/>`;
  if (showDiag) {
    s+=`\n<line x1="${rx}" y1="${ry}" x2="${fmt(rx+side)}" y2="${fmt(ry+side)}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
    s+=`\n<line x1="${fmt(rx+side)}" y1="${ry}" x2="${rx}" y2="${fmt(ry+side)}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
  }
  s+=`\n<rect x="${rx}" y="${ry}" width="${side}" height="${side}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  const m=10;
  s+=_raMark(rx,ry,1,0,0,1,m,st.stroke)+_raMark(rx+side,ry,-1,0,0,1,m,st.stroke);
  s+=_raMark(rx,ry+side,1,0,0,-1,m,st.stroke)+_raMark(rx+side,ry+side,-1,0,0,-1,m,st.stroke);
  if (st.labels) {
    const text=lbl||String(sv);
    if (st.arrows) s+=_dimArr(rx,ry+side+28,rx+side,ry+side+28,text,st.lc,st.fs,st);
    else s+=`\n<text x="${fmt(rx+side/2)}" y="${fmt(ry+side+18)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(text)}</text>`;
  }
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Circle ── */
function _geoCircle(n) {
  const rv=Math.max(0.5,num(`geo-circ-r-${n}`)||5), rlbl=val(`geo-circ-rlbl-${n}`), dlbl=val(`geo-circ-dlbl-${n}`);
  const showCtr=chk(`geo-circ-center-${n}`), showRL=chk(`geo-circ-rl-${n}`), showDiam=chk(`geo-circ-diam-${n}`), st=_gst(n);
  const sc=Math.min(50,Math.max(10,110/rv)), r=fmt(rv*sc), PAD=40;
  const W=r*2+PAD*2, H=r*2+PAD*2, cx=PAD+r, cy=PAD+r;
  let s=svgOpen(W,H);
  s+=`\n<circle cx="${cx}" cy="${cy}" r="${r}" fill="${st.filled?st.fill:'none'}" fill-opacity="${st.filled?st.fillOp:0}" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (showDiam) {
    s+=`\n<line x1="${fmt(cx-r)}" y1="${cy}" x2="${fmt(cx+r)}" y2="${cy}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
    if (st.labels) { const t=dlbl||(rlbl?`2${rlbl}`:''); if (t) s+=`\n<text x="${cx}" y="${fmt(cy-r-12)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(t)}</text>`; }
  } else if (showRL) {
    s+=`\n<line x1="${cx}" y1="${cy}" x2="${fmt(cx+r)}" y2="${cy}" stroke="${st.stroke}" stroke-width="1.2"/>`;
    if (st.labels&&rlbl) { if (st.arrows) s+=_dimArr(cx,cy,cx+r,cy,rlbl,st.lc,st.fs,st); else s+=`\n<text x="${fmt(cx+r/2)}" y="${fmt(cy-10)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(rlbl)}</text>`; }
  }
  if (showCtr) s+=`\n<circle cx="${cx}" cy="${cy}" r="4" fill="${st.stroke}" stroke="none"/>`;
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Ellipse ── */
function _geoEllipse(n) {
  const av=Math.max(0.5,num(`geo-ellip-a-${n}`)||6), bv=Math.max(0.5,num(`geo-ellip-b-${n}`)||4);
  const albl=val(`geo-ellip-albl-${n}`), blbl=val(`geo-ellip-blbl-${n}`), showAxes=chk(`geo-ellip-axes-${n}`), st=_gst(n);
  const sc=Math.min(50,Math.max(10,120/Math.max(av,bv))), re=fmt(av*sc), rye=fmt(bv*sc), PAD=40;
  const W=re*2+PAD*2, H=rye*2+PAD*2, cx=PAD+re, cy=PAD+rye;
  let s=svgOpen(W,H);
  s+=`\n<ellipse cx="${cx}" cy="${cy}" rx="${re}" ry="${rye}" fill="${st.filled?st.fill:'none'}" fill-opacity="${st.filled?st.fillOp:0}" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (showAxes) {
    s+=`\n<line x1="${fmt(cx-re)}" y1="${cy}" x2="${fmt(cx+re)}" y2="${cy}" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="5,3"/>`;
    s+=`\n<line x1="${cx}" y1="${fmt(cy-rye)}" x2="${cx}" y2="${fmt(cy+rye)}" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="5,3"/>`;
  }
  if (st.labels) {
    const at=albl||String(av), bt=blbl||String(bv);
    if (st.arrows) { s+=_dimArr(cx,cy,cx+re,cy,at,st.lc,st.fs,st); s+=_dimArr(cx,cy,cx,cy-rye,bt,st.lc,st.fs,st); }
    else { s+=`\n<text x="${fmt(cx+re/2)}" y="${fmt(cy-11)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(at)}</text>`; s+=`\n<text x="${fmt(cx+re+16)}" y="${fmt(cy-rye/2)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="start" dominant-baseline="central">${escXml(bt)}</text>`; }
  }
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Triangle ── */
function _geoTriangle(n) {
  const type=val(`geo-tri-type-${n}`)||'equilateral', showH=chk(`geo-tri-height-${n}`), showAng=chk(`geo-tri-angles-${n}`);
  const lblA=val(`geo-tri-lbla-${n}`), lblB=val(`geo-tri-lblb-${n}`), lblC=val(`geo-tri-lblc-${n}`);
  const hlbl=val(`geo-tri-hlbl-${n}`)||'h', st=_gst(n);
  let verts, sA, sB, sC;
  if (type==='equilateral') {
    const sv=Math.max(0.5,num(`geo-tri-eq-side-${n}`)||6), sc=Math.min(55,Math.max(12,240/sv)), base=sv*sc;
    sA=sB=sC=sv; verts=[[base/2,0],[0,base*Math.sqrt(3)/2],[base,base*Math.sqrt(3)/2]];
  } else if (type==='isosceles') {
    const base=Math.max(0.5,num(`geo-tri-iso-base-${n}`)||4), leg=Math.max(0.5,num(`geo-tri-iso-leg-${n}`)||5);
    if (leg<=base/2) return _geoErr('Leg must be > base/2');
    const sc=Math.min(55,Math.max(12,200/Math.max(base,leg))), bpx=base*sc, lpx=leg*sc;
    sA=base; sB=sC=leg; verts=[[bpx/2,0],[0,Math.sqrt(lpx*lpx-bpx*bpx/4)],[bpx,Math.sqrt(lpx*lpx-bpx*bpx/4)]];
  } else if (type==='scalene') {
    const a=Math.max(0.5,num(`geo-tri-sc-a-${n}`)||5), b=Math.max(0.5,num(`geo-tri-sc-b-${n}`)||7), c=Math.max(0.5,num(`geo-tri-sc-c-${n}`)||6);
    if (a+b<=c||a+c<=b||b+c<=a) return _geoErr('Invalid triangle sides');
    const sc=Math.min(55,Math.max(12,200/Math.max(a,b,c))), apx=a*sc, bpx=b*sc, cpx=c*sc;
    const Ax=(apx*apx+cpx*cpx-bpx*bpx)/(2*apx), Ay=Math.sqrt(Math.max(0,cpx*cpx-Ax*Ax));
    sA=a; sB=b; sC=c; verts=[[Ax,0],[0,Ay],[apx,Ay]];
  } else {
    const base=Math.max(0.5,num(`geo-tri-rt-base-${n}`)||5), h=Math.max(0.5,num(`geo-tri-rt-height-${n}`)||4);
    const sc=Math.min(50,Math.max(12,200/Math.max(base,h))), bpx=base*sc, hpx=h*sc;
    sA=base; sB=Math.hypot(base,h); sC=h; verts=[[0,0],[0,hpx],[bpx,hpx]];
  }
  const minX=Math.min(...verts.map(v=>v[0])), minY=Math.min(...verts.map(v=>v[1]));
  const maxX=Math.max(...verts.map(v=>v[0])), maxY=Math.max(...verts.map(v=>v[1]));
  const LP=52,RP=22,TP=24,BP=st.labels?48:26;
  const W=LP+(maxX-minX)+RP, H=TP+(maxY-minY)+BP, ox=LP-minX, oy=TP-minY;
  const tv=verts.map(v=>[fmt(v[0]+ox),fmt(v[1]+oy)]);
  const ptStr=tv.map(v=>v.join(',')).join(' ');
  let s=svgOpen(W,H);
  if (st.filled) s+=`\n<polygon points="${ptStr}" fill="${st.fill}" fill-opacity="${st.fillOp}" stroke="none"/>`;
  s+=`\n<polygon points="${ptStr}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (type==='right') s+=_raMark(tv[0][0],tv[0][1],0,1,1,0,12,st.stroke);
  if (showH) {
    const ax=tv[0][0],ay=tv[0][1],b1=tv[1],b2=tv[2];
    const dx=b2[0]-b1[0],dy=b2[1]-b1[1],t=((ax-b1[0])*dx+(ay-b1[1])*dy)/(dx*dx+dy*dy);
    const fx=fmt(b1[0]+t*dx),fy=fmt(b1[1]+t*dy);
    s+=`\n<line x1="${ax}" y1="${ay}" x2="${fx}" y2="${fy}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="5,3"/>`;
    const al=Math.hypot(ax-fx,ay-fy)||1, ua=[(ax-fx)/al,(ay-fy)/al], ub=[dx/Math.hypot(dx,dy),dy/Math.hypot(dx,dy)];
    s+=_raMark(fx,fy,ua[0],ua[1],ub[0],ub[1],10,st.stroke);
    s+=`\n<text x="${fmt((ax+fx)/2+12)}" y="${fmt((ay+fy)/2)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" dominant-baseline="central">${escXml(hlbl)}</text>`;
  }
  if (showAng) {
    for (let i=0;i<3;i++) {
      const p=tv[i],prev=tv[(i+2)%3],next=tv[(i+1)%3];
      const dx1=prev[0]-p[0],dy1=prev[1]-p[1],dx2=next[0]-p[0],dy2=next[1]-p[1];
      const cosA=(dx1*dx2+dy1*dy2)/(Math.hypot(dx1,dy1)*Math.hypot(dx2,dy2));
      const deg=Math.round(Math.acos(Math.max(-1,Math.min(1,cosA)))*180/Math.PI);
      s+=_angArc(p,prev,next,20,`${deg}°`,st.lc);
    }
  }
  if (st.labels) {
    const sides=[[tv[1],tv[2],lblA,sA],[tv[0],tv[2],lblB,sB],[tv[0],tv[1],lblC,sC]];
    for (const [p1,p2,lbl,sv2] of sides) {
      const text=lbl||(sv2?String(fmt(sv2,1)):'');
      if (!text) continue;
      if (st.arrows) s+=_dimArr(p1[0],p1[1],p2[0],p2[1],text,st.lc,st.fs,st);
      else s+=_sideLbl(p1[0],p1[1],p2[0],p2[1],text,st.lc,st.fs,true,st);
    }
  }
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Parallelogram ── */
function _geoParallelogram(n) {
  const bv=Math.max(0.5,num(`geo-para-base-${n}`)||7), hv=Math.max(0.5,num(`geo-para-height-${n}`)||4);
  const ang=Math.max(20,Math.min(85,num(`geo-para-angle-${n}`)||60));
  const showDiag=chk(`geo-para-diag-${n}`), showHline=chk(`geo-para-hline-${n}`);
  const blbl=val(`geo-para-blbl-${n}`), hlbl=val(`geo-para-hlbl-${n}`), st=_gst(n);
  const sc=Math.min(50,Math.max(10,200/Math.max(bv,hv))), bpx=bv*sc, hpx=hv*sc;
  const skew=fmt(hpx/Math.tan(ang*Math.PI/180)), ox=40, oy=20;
  const pts=[[ox,oy+hpx],[ox+bpx,oy+hpx],[ox+bpx+skew,oy],[ox+skew,oy]];
  const W=bpx+skew+80, H=hpx+80, ptStr=pts.map(p=>`${fmt(p[0])},${fmt(p[1])}`).join(' ');
  let s=svgOpen(W,H);
  if (st.filled) s+=`\n<polygon points="${ptStr}" fill="${st.fill}" fill-opacity="${st.fillOp}" stroke="none"/>`;
  if (showDiag) {
    s+=`\n<line x1="${fmt(pts[0][0])}" y1="${fmt(pts[0][1])}" x2="${fmt(pts[2][0])}" y2="${fmt(pts[2][1])}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
    s+=`\n<line x1="${fmt(pts[1][0])}" y1="${fmt(pts[1][1])}" x2="${fmt(pts[3][0])}" y2="${fmt(pts[3][1])}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
  }
  s+=`\n<polygon points="${ptStr}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (showHline) {
    s+=`\n<line x1="${fmt(pts[3][0])}" y1="${fmt(pts[3][1])}" x2="${fmt(pts[3][0])}" y2="${fmt(pts[0][1])}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="5,3"/>`;
    s+=_raMark(pts[3][0],pts[0][1],1,0,0,-1,10,st.stroke);
    if (hlbl||hv) { const hy=fmt((pts[3][1]+pts[0][1])/2); s+=`\n<text x="${fmt(pts[3][0]-14)}" y="${hy}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle" dominant-baseline="central" transform="rotate(-90,${fmt(pts[3][0]-14)},${hy})">${escXml(hlbl||String(hv))}</text>`; }
  }
  if (st.labels) {
    const bt=blbl||String(bv);
    if (st.arrows) s+=_dimArr(pts[0][0],pts[0][1]+25,pts[1][0],pts[1][1]+25,bt,st.lc,st.fs,st);
    else s+=`\n<text x="${fmt((pts[0][0]+pts[1][0])/2)}" y="${fmt(pts[0][1]+18)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(bt)}</text>`;
  }
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Rhombus ── */
function _geoRhombus(n) {
  const sv=Math.max(0.5,num(`geo-rhom-side-${n}`)||5), ang=Math.max(20,Math.min(85,num(`geo-rhom-angle-${n}`)||60));
  const showDiag=chk(`geo-rhom-diag-${n}`), lbl=val(`geo-rhom-lbl-${n}`), st=_gst(n);
  const sc=Math.min(55,Math.max(12,200/sv)), spx=sv*sc, ar=ang*Math.PI/180;
  const a=spx*Math.cos(ar/2), b=spx*Math.sin(ar/2), PAD=40;
  const cx=PAD+a, cy=PAD+b, W=2*a+PAD*2, H=2*b+PAD*2;
  const pts=[[cx,cy-b],[cx+a,cy],[cx,cy+b],[cx-a,cy]];
  const ptStr=pts.map(p=>`${fmt(p[0])},${fmt(p[1])}`).join(' ');
  let s=svgOpen(W,H);
  if (st.filled) s+=`\n<polygon points="${ptStr}" fill="${st.fill}" fill-opacity="${st.fillOp}" stroke="none"/>`;
  if (showDiag) {
    s+=`\n<line x1="${fmt(pts[0][0])}" y1="${fmt(pts[0][1])}" x2="${fmt(pts[2][0])}" y2="${fmt(pts[2][1])}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
    s+=`\n<line x1="${fmt(pts[1][0])}" y1="${fmt(pts[1][1])}" x2="${fmt(pts[3][0])}" y2="${fmt(pts[3][1])}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
    s+=_raMark(cx,cy,0,-1,1,0,9,st.stroke);
  }
  s+=`\n<polygon points="${ptStr}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (st.labels&&lbl) s+=_sideLbl(pts[0][0],pts[0][1],pts[1][0],pts[1][1],lbl,st.lc,st.fs,false,st);
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Trapezoid ── */
function _geoTrapezoid(n) {
  const top=Math.max(0.5,num(`geo-trap-top-${n}`)||3), bot=Math.max(0.5,num(`geo-trap-bottom-${n}`)||6);
  const hv=Math.max(0.5,num(`geo-trap-height-${n}`)||4), type=val(`geo-trap-type-${n}`)||'isosceles';
  const showDiag=chk(`geo-trap-diag-${n}`), tlbl=val(`geo-trap-tlbl-${n}`), blbl=val(`geo-trap-blbl-${n}`), st=_gst(n);
  const sc=Math.min(50,Math.max(10,200/Math.max(top,bot,hv))), tpx=top*sc, bpx=bot*sc, hpx=hv*sc, PAD=45;
  let pts;
  if (type==='right') pts=[[PAD,PAD],[PAD+tpx,PAD],[PAD+bpx,PAD+hpx],[PAD,PAD+hpx]];
  else { const off=(bpx-tpx)/2; pts=[[PAD+off,PAD],[PAD+off+tpx,PAD],[PAD+bpx,PAD+hpx],[PAD,PAD+hpx]]; }
  const W=Math.max(...pts.map(p=>p[0]))+PAD, H=PAD+hpx+(st.labels?48:26);
  const ptStr=pts.map(p=>`${fmt(p[0])},${fmt(p[1])}`).join(' ');
  let s=svgOpen(W,H);
  if (st.filled) s+=`\n<polygon points="${ptStr}" fill="${st.fill}" fill-opacity="${st.fillOp}" stroke="none"/>`;
  if (showDiag) {
    s+=`\n<line x1="${fmt(pts[0][0])}" y1="${fmt(pts[0][1])}" x2="${fmt(pts[2][0])}" y2="${fmt(pts[2][1])}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
    s+=`\n<line x1="${fmt(pts[1][0])}" y1="${fmt(pts[1][1])}" x2="${fmt(pts[3][0])}" y2="${fmt(pts[3][1])}" stroke="${st.stroke}" stroke-width="1.2" stroke-dasharray="6,3"/>`;
  }
  if (type==='right') { s+=_raMark(pts[0][0],pts[0][1],1,0,0,1,10,st.stroke); s+=_raMark(pts[3][0],pts[3][1],1,0,0,-1,10,st.stroke); }
  s+=`\n<polygon points="${ptStr}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (st.labels) {
    const tt=tlbl||String(top), bt=blbl||String(bot);
    if (st.arrows) { s+=_dimArr(pts[0][0],pts[0][1]-24,pts[1][0],pts[1][1]-24,tt,st.lc,st.fs,st); s+=_dimArr(pts[3][0],pts[3][1]+24,pts[2][0],pts[2][1]+24,bt,st.lc,st.fs,st); }
    else { s+=`\n<text x="${fmt((pts[0][0]+pts[1][0])/2)}" y="${fmt(pts[0][1]-14)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(tt)}</text>`; s+=`\n<text x="${fmt((pts[2][0]+pts[3][0])/2)}" y="${fmt(pts[2][1]+16)}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle">${escXml(bt)}</text>`; }
  }
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ── Regular polygons (pentagon/hexagon/octagon) ── */
function _geoRegPoly(n, sides) {
  const sv=Math.max(0.5,num(`geo-poly-side-${n}`)||5), orient=val(`geo-poly-orient-${n}`)||'pointy';
  const lbl=val(`geo-poly-lbl-${n}`), showDiag=chk(`geo-poly-diag-${n}`), st=_gst(n);
  const R=sv/(2*Math.sin(Math.PI/sides)), sc=Math.min(55,Math.max(10,110/R)), Rpx=R*sc, PAD=40;
  const W=Rpx*2+PAD*2, H=Rpx*2+PAD*2, cx=PAD+Rpx, cy=PAD+Rpx;
  const startA=(orient==='flat'?0:-90), pts=[];
  for (let i=0;i<sides;i++) { const a=(startA+i*360/sides)*Math.PI/180; pts.push([fmt(cx+Rpx*Math.cos(a)),fmt(cy+Rpx*Math.sin(a))]); }
  const ptStr=pts.map(p=>p.join(',')).join(' ');
  let s=svgOpen(W,H);
  if (st.filled) s+=`\n<polygon points="${ptStr}" fill="${st.fill}" fill-opacity="${st.fillOp}" stroke="none"/>`;
  if (showDiag) { for (let i=0;i<sides;i++) for (let j=i+2;j<sides;j++) { if (i===0&&j===sides-1) continue; s+=`\n<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}" stroke="${st.stroke}" stroke-width="1" stroke-dasharray="5,3"/>`; } }
  s+=`\n<polygon points="${ptStr}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  if (lbl) s+=`\n<text x="${cx}" y="${cy}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle" dominant-baseline="central">${escXml(lbl)}</text>`;
  if (st.labels) { const p1=pts[0],p2=pts[1]; s+=_sideLbl(p1[0],p1[1],p2[0],p2[1],String(sv),st.lc,st.fs,false,st); }
  return { svgStr:s+'\n</svg>', width:W, height:H };
}
function _geoPentagon(n) { return _geoRegPoly(n,5); }
function _geoHexagon(n)  { return _geoRegPoly(n,6); }
function _geoOctagon(n)  { return _geoRegPoly(n,8); }

/* ── Sector / Arc ── */
function _geoSector(n) {
  const rv=Math.max(0.5,num(`geo-sec-r-${n}`)||5), arc=Math.max(5,Math.min(359,num(`geo-sec-arc-${n}`)||90));
  const startDeg=num(`geo-sec-start-${n}`)||(-90), arcOnly=val(`geo-sec-type-${n}`)==='arc';
  const lbl=val(`geo-sec-lbl-${n}`), st=_gst(n);
  const sc=Math.min(50,Math.max(10,110/rv)), r=rv*sc, PAD=40;
  const W=r*2+PAD*2, H=r*2+PAD*2, cx=PAD+r, cy=PAD+r;
  const a1=startDeg*Math.PI/180, a2=(startDeg+arc)*Math.PI/180, large=arc>180?1:0;
  const x1=fmt(cx+r*Math.cos(a1)),y1=fmt(cy+r*Math.sin(a1)),x2=fmt(cx+r*Math.cos(a2)),y2=fmt(cy+r*Math.sin(a2));
  let s=svgOpen(W,H);
  if (arcOnly) {
    s+=`\n<path d="M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  } else {
    const d=`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
    if (st.filled) s+=`\n<path d="${d}" fill="${st.fill}" fill-opacity="${st.fillOp}" stroke="none"/>`;
    s+=`\n<path d="${d}" fill="none" stroke="${st.stroke}" stroke-width="${st.sw}"/>`;
  }
  if (lbl) { const am=(a1+a2)/2; s+=`\n<text x="${fmt(cx+r*0.6*Math.cos(am))}" y="${fmt(cy+r*0.6*Math.sin(am))}" ${_txtAttr(st)} font-size="${st.fs}" fill="${st.lc}" text-anchor="middle" dominant-baseline="central">${escXml(lbl)}</text>`; }
  if (st.labels&&rv) s+=_dimArr(cx,cy,x1,y1,String(rv),st.lc,st.fs,st);
  return { svgStr:s+'\n</svg>', width:W, height:H };
}

/* ─── Router ─── */
function generateShape() {
  const map = {
    numberLine:      generateNumberLine,
    fraction:        generateFraction,
    geometry:        generateGeometry,
    rectangle:       generateRectangle,
    circle:          generateCircle,
    triangle:        generateTriangle,
    rightTriangle:   generateRightTriangle,
    pentagon:        generatePentagon,
    hexagon:         generateHexagon,
    lineShape:       generateLineShape,
    graphPlot:       generateGraphPlot,
    stage:           generateStage,
    svgCharacter:    generateCharacter,
  };
  return (map[currentShape] || (() => ''))();
}
