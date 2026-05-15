'use strict';

/* ═══════════════════════════════════════════════════
   SVG TABLE GENERATOR
   – LaTeX via KaTeX + foreignObject
   – Multi-line cells (variable row height)
   – Vertical alignment (top / middle / bottom)
   – Per-column & per-cell style/content overrides
   – Click-to-edit cells
═══════════════════════════════════════════════════ */

/* ── Override state (persists across renders) ────── */

let _stColOverrides  = [];   // [colIdx] → {bg,tc,fs,bold,italic,hAlign,vAlign,width}
let _stCellOverrides = {};   // "r,c" (r=-1 = header) → {bg,tc,fs,bold,italic,hAlign,vAlign}
let _stLastParsed    = { headers: [], rows: [], colX: [], colWidths: [], MT: 0, hdrH: 0, rowYs: [], rowHeights: [], nCols: 0 };

/* ── Parsers ────────────────────────────────────── */

function _stGetCellText(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  return clone.textContent.trim();
}

function _stParseHTML(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<html><body>${html}</body></html>`, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return { headers: [], rows: [] };

    const headers = [];
    const rows = [];

    const thead = table.querySelector('thead');
    if (thead) {
      thead.querySelectorAll('th, td').forEach(th => headers.push(_stGetCellText(th)));
    } else {
      const firstTr = table.querySelector('tr');
      if (firstTr) {
        const ths = firstTr.querySelectorAll('th');
        if (ths.length) ths.forEach(th => headers.push(_stGetCellText(th)));
      }
    }

    const tbody = table.querySelector('tbody') || table;
    tbody.querySelectorAll('tr').forEach(tr => {
      const tds = tr.querySelectorAll('td');
      if (tds.length) {
        const row = [];
        tds.forEach(td => row.push(_stGetCellText(td)));
        rows.push(row);
      }
    });

    return { headers, rows };
  } catch (_) {
    return { headers: [], rows: [] };
  }
}

function _stParseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const splitLine = l => (l.includes('\t')
    ? l.split('\t')
    : l.split(',')
  ).map(c => c.trim().replace(/\\n/g, '\n'));
  return { headers: splitLine(lines[0]), rows: lines.slice(1).map(splitLine) };
}

/* ── Mode toggle ─────────────────────────────────── */

function _stSwitchMode(mode) {
  $('st-mode').value = mode;
  document.querySelectorAll('.st-mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
  $('st-html-panel').style.display = mode === 'html' ? '' : 'none';
  $('st-csv-panel').style.display  = mode === 'csv'  ? '' : 'none';
  render();
}

/* ── LaTeX helpers ───────────────────────────────── */

function _stHasLatex(text) {
  return /\\\(|\\\[/.test(text);
}

function _stLatexHTML(text) {
  const parts = [];
  const re = /\\\((.+?)\\\)/gs;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'txt', v: text.slice(last, m.index) });
    parts.push({ t: 'math', v: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t: 'txt', v: text.slice(last) });

  return parts.map(p => {
    if (p.t === 'math') {
      try {
        // output:'html' suppresses the katex-mathml element that causes double rendering in Learnosity
        return typeof katex !== 'undefined'
          ? katex.renderToString(p.v, { throwOnError: false, displayMode: false, output: 'html' })
          : `<i>${p.v}</i>`;
      } catch (_) { return `<i>${p.v}</i>`; }
    }
    return p.v.split('\n').map(l => `<span>${l}</span>`).join('<br/>');
  }).join('');
}

function _stEstLen(text) {
  return Math.max(0, ...text.split('\n').map(line =>
    line.replace(/\\\((.+?)\\\)/g, (_, m) =>
      m.replace(/\\[a-zA-Z]+/g, 'xx').replace(/[{}^_]/g, '')).length));
}

/* ── Style merger: global → column override → cell override ── */

function _stEffStyle(r, c, globals) {
  // Column overrides never apply to the header row (r === -1)
  const co = (r >= 0 ? _stColOverrides[c] : null) || {};
  const ce = _stCellOverrides[`${r},${c}`] || {};
  return {
    bg:     ce.bg     ?? co.bg     ?? globals.bg,
    tc:     ce.tc     ?? co.tc     ?? globals.tc,
    fs:     ce.fs     ?? co.fs     ?? globals.fs,
    bold:   ce.bold   ?? co.bold   ?? globals.bold,
    italic: ce.italic ?? co.italic ?? globals.italic,
    hAlign: ce.hAlign ?? co.hAlign ?? globals.hAlign,
    vAlign: ce.vAlign ?? co.vAlign ?? globals.vAlign,
  };
}

/* ── Cell renderers ──────────────────────────────── */

function _stTextCell(text, cx, cy, cw, ch, halign, valign, pad, ff, fs, bold, italic, tc) {
  const lines  = text.split('\n');
  const lineH  = fs * 1.35;
  const n      = lines.length;

  let startCY;
  if      (valign === 'top')    startCY = cy + pad + lineH / 2;
  else if (valign === 'bottom') startCY = cy + ch - pad - lineH * (n - 1) - lineH / 2;
  else                          startCY = cy + (ch - lineH * n) / 2 + lineH / 2;

  const tx  = halign === 'left'  ? cx + pad
            : halign === 'right' ? cx + cw - pad
            : cx + cw / 2;
  const anc = halign === 'left'  ? 'start'
            : halign === 'right' ? 'end'
            : 'middle';

  return lines.map((line, i) =>
    `<text x="${fmt(tx)}" y="${fmt(startCY + i * lineH)}" font-family="${ff}" font-size="${fs}" font-weight="${bold}" font-style="${italic}" fill="${tc}" text-anchor="${anc}" dominant-baseline="central">${escXml(line)}</text>`
  ).join('\n');
}

function _stLatexCell(text, cx, cy, cw, ch, halign, valign, pad, ff, fs, bold, italic, tc) {
  const aiMap = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };
  const jcMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
  const style = [
    'display:flex', 'flex-wrap:wrap', 'gap:2px',
    `align-items:${aiMap[valign] || 'center'}`, `justify-content:${jcMap[halign] || 'center'}`,
    'width:100%', 'height:100%', 'box-sizing:border-box',
    `padding:${pad}px`,
    `font-family:${ff}`, `font-size:${fs}px`,
    `font-weight:${bold}`, `font-style:${italic}`,
    `color:${tc}`,
  ].join(';');

  return `<foreignObject x="${fmt(cx)}" y="${fmt(cy)}" width="${fmt(cw)}" height="${fmt(ch)}"><div xmlns="http://www.w3.org/1999/xhtml" style="${style}">${_stLatexHTML(text)}</div></foreignObject>`;
}

function _stRenderCell(text, cx, cy, cw, ch, halign, valign, pad, ff, fs, bold, italic, tc) {
  return _stHasLatex(text)
    ? _stLatexCell(text, cx, cy, cw, ch, halign, valign, pad, ff, fs, bold, italic, tc)
    : _stTextCell (text, cx, cy, cw, ch, halign, valign, pad, ff, fs, bold, italic, tc);
}

/* ── Main generator ──────────────────────────────── */

function generateSVGTable() {
  const mode = val('st-mode') || 'html';

  let headers = [], rows = [];
  if (mode === 'html') {
    const r = _stParseHTML(val('st-html-input') || '');
    headers = r.headers; rows = r.rows;
  } else {
    const r = _stParseCSV(val('st-csv-input') || '');
    headers = r.headers; rows = r.rows;
  }

  const nCols = headers.length || (rows[0] ? rows[0].length : 0);
  if (!nCols) return errorSVG('No table data — paste HTML or enter CSV data');

  // ── Style ───────────────────────────────────────
  const title      = (val('st-title') || '').trim();
  const ff         = val('st-font-family') || 'Arial,sans-serif';

  const hdrBg      = val('st-hdr-bg')      || '#374151';
  const hdrTc      = val('st-hdr-tc')      || '#ffffff';
  const hdrFs      = Math.max(8, num('st-hdr-fs')   || 14);
  const hdrBold    = chk('st-hdr-bold')    ? 'bold'   : 'normal';
  const hdrItalic  = chk('st-hdr-italic')  ? 'italic' : 'normal';
  const hdrAlign   = val('st-hdr-align')   || 'center';
  const hdrValign  = val('st-hdr-valign')  || 'middle';

  const rowBg      = val('st-row-bg')      || '#ffffff';
  const rowTc      = val('st-row-tc')      || '#111111';
  const rowFs      = Math.max(8, num('st-row-fs')   || 13);
  const rowBold    = chk('st-row-bold')    ? 'bold'   : 'normal';
  const rowItalic  = chk('st-row-italic')  ? 'italic' : 'normal';
  const rowAlign   = val('st-row-align')   || 'center';
  const rowValign  = val('st-row-valign')  || 'middle';
  const col0Align  = val('st-col0-align')  || 'left';
  const altRows    = chk('st-alt-rows');
  const altBg      = val('st-alt-bg')      || '#f3f4f6';
  const smartAlign = chk('st-smart-align');

  const transparentBg = chk('st-transparent-bg');
  const borderColor = val('st-border-color') || '#d1d5db';
  const borderW     = Math.max(0, num('st-border-w') || 1);
  const pad         = Math.max(2, num('st-pad')      || 10);
  const outerRx     = Math.max(0, num('st-rx')       || 4);
  const col0WInput  = Math.max(0, num('st-col0-w')   || 0);

  // ── Smart alignment ──────────────────────────────
  const colIsNumeric = Array.from({ length: nCols }, (_, c) =>
    c > 0 && rows.length > 0 &&
    rows.every(row => {
      const v = (row[c] || '').replace(/\\\(.*?\\\)/g, '').trim();
      return v !== '' && !isNaN(parseFloat(v));
    }));

  const getBaseHAlign = (c, isHdr) => {
    if (isHdr) return hdrAlign;
    if (smartAlign) return c === 0 ? 'left' : (colIsNumeric[c] ? 'center' : 'left');
    return c === 0 ? col0Align : rowAlign;
  };

  // ── Row heights ──────────────────────────────────
  const hdrLineH = hdrFs * 1.35;
  const rowLineH = rowFs * 1.35;

  const showHdr = headers.length > 0;
  const hdrLineCount = showHdr
    ? Math.max(1, ...headers.map(h => (h || '').split('\n').length))
    : 1;
  const hdrH = showHdr ? Math.ceil(hdrLineH * hdrLineCount + pad * 2) : 0;

  const rowHeights = rows.map(row =>
    Math.ceil(rowLineH * Math.max(1, ...row.map(c => (c || '').split('\n').length)) + pad * 2));

  // ── Column widths (column override width wins over auto) ─
  const colWidths = Array.from({ length: nCols }, (_, c) => {
    if (c === 0 && col0WInput > 0) return col0WInput;
    const colOv = _stColOverrides[c] || {};
    if (colOv.width > 0) return colOv.width;
    const allTexts = [headers[c] || '', ...rows.map(r => r[c] || '')];
    const maxLen = Math.max(0, ...allTexts.map(_stEstLen));
    const fs = Math.max(hdrFs, rowFs);
    return Math.max(40, Math.ceil(maxLen * fs * 0.58 + pad * 2));
  });

  // ── Dimensions ───────────────────────────────────
  const ML = 16, MR = 16, MB = 16;
  const titleH = title ? (hdrFs + 4) * 1.5 : 0;
  const MT     = 14 + titleH;
  const tableW = colWidths.reduce((a, b) => a + b, 0);
  const tableH = hdrH + rowHeights.reduce((a, b) => a + b, 0);
  const W = ML + tableW + MR;
  const H = MT + tableH + MB;

  const colX = [];
  let cx0 = ML;
  for (const w of colWidths) { colX.push(cx0); cx0 += w; }

  const rowYs = [];
  let ry = MT + hdrH;
  for (const rh of rowHeights) { rowYs.push(ry); ry += rh; }

  // Cache geometry for click-to-edit overlays
  _stLastParsed = { headers, rows, colX, colWidths, MT, hdrH, rowYs, rowHeights, nCols };

  // ── Render ───────────────────────────────────────
  let s = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  if (!transparentBg) s += `\n<rect width="${W}" height="${H}" fill="white"/>`;

  if (outerRx > 0) {
    s += `\n<defs><clipPath id="st-clip"><rect x="${fmt(ML)}" y="${fmt(MT)}" width="${fmt(tableW)}" height="${fmt(tableH)}" rx="${outerRx}" ry="${outerRx}"/></clipPath></defs>`;
    s += `\n<g clip-path="url(#st-clip)">`;
  }

  if (title) {
    s += `\n<text x="${fmt(ML + tableW / 2)}" y="${fmt(MT - 7)}" font-family="${ff}" font-size="${hdrFs + 3}" font-weight="bold" fill="#111" text-anchor="middle">${escXml(title)}</text>`;
  }

  // Header
  if (showHdr) {
    for (let c = 0; c < nCols; c++) {
      const st = _stEffStyle(-1, c, { bg: hdrBg, tc: hdrTc, fs: hdrFs, bold: hdrBold, italic: hdrItalic, hAlign: getBaseHAlign(c, true), vAlign: hdrValign });
      s += `\n<rect x="${fmt(colX[c])}" y="${fmt(MT)}" width="${fmt(colWidths[c])}" height="${fmt(hdrH)}" fill="${st.bg}"/>`;
      s += '\n' + _stRenderCell(headers[c] || '', colX[c], MT, colWidths[c], hdrH, st.hAlign, st.vAlign, pad, ff, st.fs, st.bold, st.italic, st.tc);
    }
  }

  // Body rows
  for (let r = 0; r < rows.length; r++) {
    const defaultBg = altRows && r % 2 === 1 ? altBg : rowBg;
    const ry2 = rowYs[r], rh = rowHeights[r];
    for (let c = 0; c < nCols; c++) {
      const st = _stEffStyle(r, c, { bg: defaultBg, tc: rowTc, fs: rowFs, bold: rowBold, italic: rowItalic, hAlign: getBaseHAlign(c, false), vAlign: rowValign });
      s += `\n<rect x="${fmt(colX[c])}" y="${fmt(ry2)}" width="${fmt(colWidths[c])}" height="${fmt(rh)}" fill="${st.bg}"/>`;
      s += '\n' + _stRenderCell(String(rows[r][c] ?? ''), colX[c], ry2, colWidths[c], rh, st.hAlign, st.vAlign, pad, ff, st.fs, st.bold, st.italic, st.tc);
    }
  }

  // Borders
  if (borderW > 0) {
    const bw  = fmt(borderW);
    const bwH = fmt(borderW * 1.5);
    for (let r = 1; r < rows.length; r++)
      s += `\n<line x1="${fmt(ML)}" y1="${fmt(rowYs[r])}" x2="${fmt(ML + tableW)}" y2="${fmt(rowYs[r])}" stroke="${borderColor}" stroke-width="${bw}"/>`;
    if (showHdr && rows.length > 0)
      s += `\n<line x1="${fmt(ML)}" y1="${fmt(MT + hdrH)}" x2="${fmt(ML + tableW)}" y2="${fmt(MT + hdrH)}" stroke="${borderColor}" stroke-width="${bwH}"/>`;
    for (let c = 1; c < nCols; c++)
      s += `\n<line x1="${fmt(colX[c])}" y1="${fmt(MT)}" x2="${fmt(colX[c])}" y2="${fmt(MT + tableH)}" stroke="${borderColor}" stroke-width="${bw}"/>`;
  }

  if (outerRx > 0) s += `\n</g>`;

  if (borderW > 0) {
    const bwH = fmt(borderW * 1.5);
    s += `\n<rect x="${fmt(ML)}" y="${fmt(MT)}" width="${fmt(tableW)}" height="${fmt(tableH)}" fill="none" stroke="${borderColor}" stroke-width="${bwH}" rx="${outerRx}" ry="${outerRx}"/>`;
  }

  return s + '\n</svg>';
}

/* ── Click-to-edit overlay ───────────────────────── */

function attachSTClickHandlers() {
  const svgEl = $('svgPreview').querySelector('svg');
  if (!svgEl || !_stLastParsed.nCols) return;

  _stUpdateColSel();

  const { headers, rows, colX, colWidths, MT, hdrH, rowYs, rowHeights, nCols } = _stLastParsed;
  const ns = 'http://www.w3.org/2000/svg';

  const addOverlay = (r, c, x, y, w, h) => {
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x);  rect.setAttribute('y', y);
    rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('fill', 'transparent');
    rect.setAttribute('pointer-events', 'all');
    rect.style.cursor = 'pointer';
    rect.addEventListener('click', () => _stOpenCellEditor(r, c));
    svgEl.appendChild(rect);
  };

  if (headers.length > 0) {
    for (let c = 0; c < nCols; c++) addOverlay(-1, c, colX[c], MT, colWidths[c], hdrH);
  }
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < nCols; c++) addOverlay(r, c, colX[c], rowYs[r], colWidths[c], rowHeights[r]);
  }
}

/* ── Column overrides panel ──────────────────────── */

function _stUpdateColSel() {
  const sel = $('st-col-sel');
  if (!sel) return;
  const { headers, nCols } = _stLastParsed;
  const prev = sel.value;
  sel.innerHTML = '';
  for (let c = 0; c < nCols; c++) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = (headers[c] || `Column ${c + 1}`).replace(/\n/g, ' ');
    sel.appendChild(opt);
  }
  sel.value = prev && prev < nCols ? prev : 0;
  _stLoadColOv(parseInt(sel.value) || 0);
}

function _stOnColSelChange() {
  const c = parseInt(val('st-col-sel'));
  if (!isNaN(c)) _stLoadColOv(c);
}

function _stLoadColOv(c) {
  const ov = _stColOverrides[c] || {};

  const bgEn = $('st-col-bg-en');
  const bgIn = $('st-col-bg');
  if (bgEn) { bgEn.checked = 'bg' in ov; }
  if (bgIn) { bgIn.value = ov.bg || '#ffffff'; bgIn.disabled = !bgEn?.checked; }

  const tcEn = $('st-col-tc-en');
  const tcIn = $('st-col-tc');
  if (tcEn) { tcEn.checked = 'tc' in ov; }
  if (tcIn) { tcIn.value = ov.tc || '#111111'; tcIn.disabled = !tcEn?.checked; }

  const fsEl = $('st-col-fs');   if (fsEl) fsEl.value = ov.fs || 0;
  const bEl  = $('st-col-bold'); if (bEl)  bEl.value  = ov.bold   || '';
  const iEl  = $('st-col-ital'); if (iEl)  iEl.value  = ov.italic || '';
  const hEl  = $('st-col-ha');   if (hEl)  hEl.value  = ov.hAlign || '';
  const vEl  = $('st-col-va');   if (vEl)  vEl.value  = ov.vAlign || '';
  const wEl  = $('st-col-w');    if (wEl)  wEl.value  = ov.width  || 0;
}

function _stApplyColOverride() {
  const c = parseInt(val('st-col-sel'));
  if (isNaN(c)) return;
  const ov = {};
  if ($('st-col-bg-en')?.checked) ov.bg     = val('st-col-bg');
  if ($('st-col-tc-en')?.checked) ov.tc     = val('st-col-tc');
  const fs = num('st-col-fs');   if (fs > 0)   ov.fs     = fs;
  const b  = val('st-col-bold'); if (b)         ov.bold   = b;
  const it = val('st-col-ital'); if (it)        ov.italic = it;
  const ha = val('st-col-ha');   if (ha)        ov.hAlign = ha;
  const va = val('st-col-va');   if (va)        ov.vAlign = va;
  const w  = num('st-col-w');    if (w > 0)     ov.width  = w;
  _stColOverrides[c] = ov;
  render();
}

function _stClearColOverride() {
  const c = parseInt(val('st-col-sel'));
  if (isNaN(c)) return;
  delete _stColOverrides[c];
  _stLoadColOv(c);
  render();
}

/* ── Cell editor ─────────────────────────────────── */

let _stEditCell = null;

function _stOpenCellEditor(r, c) {
  _stEditCell = { r, c };
  const { headers, rows } = _stLastParsed;
  const ov = _stCellOverrides[`${r},${c}`] || {};

  const colLabel = (headers[c] || `Col ${c + 1}`).replace(/\n/g, ' ');
  const rowLabel = r === -1 ? 'Header' : (rows[r]?.[0] || `Row ${r + 1}`);
  $('st-ce-label').textContent = `${rowLabel} / ${colLabel}`;

  const srcText = r === -1
    ? (headers[c] || '')
    : String(rows[r]?.[c] ?? '');
  $('st-ce-text').value = srcText;

  const bgEn = $('st-ce-bg-en'); const bgIn = $('st-ce-bg');
  if (bgEn) bgEn.checked = 'bg' in ov;
  if (bgIn) { bgIn.value = ov.bg || '#ffffff'; bgIn.disabled = !bgEn?.checked; }

  const tcEn = $('st-ce-tc-en'); const tcIn = $('st-ce-tc');
  if (tcEn) tcEn.checked = 'tc' in ov;
  if (tcIn) { tcIn.value = ov.tc || '#111111'; tcIn.disabled = !tcEn?.checked; }

  const fsEl = $('st-ce-fs');   if (fsEl) fsEl.value = ov.fs || 0;
  const bEl  = $('st-ce-bold'); if (bEl)  bEl.value  = ov.bold   || '';
  const iEl  = $('st-ce-ital'); if (iEl)  iEl.value  = ov.italic || '';
  const hEl  = $('st-ce-ha');   if (hEl)  hEl.value  = ov.hAlign || '';
  const vEl  = $('st-ce-va');   if (vEl)  vEl.value  = ov.vAlign || '';

  $('st-cell-editor').style.display = '';
}

function _stCloseCellEditor() {
  $('st-cell-editor').style.display = 'none';
  _stEditCell = null;
}

function _stApplyCellEdit() {
  if (!_stEditCell) return;
  const { r, c } = _stEditCell;
  const { headers, rows } = _stLastParsed;

  // Update source textarea with new content
  const srcText = r === -1 ? (headers[c] || '') : String(rows[r]?.[c] ?? '');
  const newText = $('st-ce-text').value;
  if (newText !== srcText) _stWriteBack(r, c, newText);

  // Collect style overrides (only active ones are saved)
  const ov = {};
  if ($('st-ce-bg-en')?.checked) ov.bg     = val('st-ce-bg');
  if ($('st-ce-tc-en')?.checked) ov.tc     = val('st-ce-tc');
  const fs = num('st-ce-fs');   if (fs > 0)   ov.fs     = fs;
  const b  = val('st-ce-bold'); if (b)         ov.bold   = b;
  const it = val('st-ce-ital'); if (it)        ov.italic = it;
  const ha = val('st-ce-ha');   if (ha)        ov.hAlign = ha;
  const va = val('st-ce-va');   if (va)        ov.vAlign = va;

  const key = `${r},${c}`;
  if (Object.keys(ov).length) _stCellOverrides[key] = ov;
  else delete _stCellOverrides[key];

  _stCloseCellEditor();
  render();
}

function _stClearCellEdit() {
  if (!_stEditCell) return;
  delete _stCellOverrides[`${_stEditCell.r},${_stEditCell.c}`];
  _stCloseCellEditor();
  render();
}

/* ── Write edited cell content back to source textarea ── */

function _stWriteBack(r, c, newText) {
  const mode = val('st-mode') || 'html';
  if (mode === 'csv') {
    _stWriteBackCSV(r, c, newText);
  } else {
    _stWriteBackHTML(r, c, newText);
  }
}

function _stWriteBackCSV(r, c, newText) {
  const { headers, rows } = _stLastParsed;
  if (r === -1) { if (headers) headers[c] = newText; }
  else          { if (rows[r]) rows[r][c]  = newText; }
  const allRows = [headers, ...rows];
  $('st-csv-input').value = allRows.map(row =>
    (row || []).map(cell => (cell || '').replace(/\n/g, '\\n')).join('\t')
  ).join('\n');
}

function _stWriteBackHTML(r, c, newText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<html><body>${val('st-html-input') || ''}</body></html>`, 'text/html');
    const table = doc.querySelector('table');
    if (!table) return;
    if (r === -1) {
      const cells = table.querySelectorAll('thead th, thead td');
      if (cells[c]) cells[c].textContent = newText;
    } else {
      const trs = table.querySelectorAll('tbody tr');
      if (trs[r]) {
        const tds = trs[r].querySelectorAll('td');
        if (tds[c]) tds[c].textContent = newText;
      }
    }
    $('st-html-input').value = table.outerHTML;
  } catch (_) {}
}
