'use strict';

function render() {
  let svg = generateShape();

  if (currentShape === 'stage') {
    $('svgPreview').innerHTML = svg;
    $('svgCode').value = typeof getStageCleanSVG === 'function' ? getStageCleanSVG() : svg;
    if (typeof attachStageDragHandlers === 'function') attachStageDragHandlers();
    _updateDims();
    return;
  }
  if (currentShape === 'svgCharacter') {
    $('svgPreview').innerHTML = svg;
    $('svgCode').value = svg;
    _updateDims();
    return;
  }
  if (currentShape === 'svgPatterns') {
    $('svgPreview').innerHTML = svg;
    $('svgCode').value = svg;
    _updateDims();
    return;
  }

  svg = applyCanvas(svg);
  svg = applyRotation(svg);
  svg = applyBackground(svg);
  svg = addCanvasOutline(svg);
  svg = injectLineOverlays(svg);
  svg = injectTextOverlays(svg);
  svg = injectImageOverlays(svg);

  $('svgPreview').innerHTML = svg;
  $('svgCode').value = getCleanSVG();
  attachDragHandlers();
  attachImageDragHandlers();
  attachVertexHandles();
  attachAngleDragHandles();
  _updateDims();
}

function _updateDims() {
  const dimsEl = $('svg-dims');
  if (!dimsEl) return;
  const svgEl = $('svgPreview').querySelector('svg');
  if (svgEl) {
    const w = svgEl.width.baseVal.value;
    const h = svgEl.height.baseVal.value;
    if (w && h) { dimsEl.textContent = `${w}×${h} px`; return; }
  }
  dimsEl.textContent = '';
}

function getCleanSVG() {
  const svgEl = $('svgPreview').querySelector('svg');
  if (!svgEl) return '';
  const clone = svgEl.cloneNode(true);
  clone.querySelectorAll('[data-cell]').forEach(el => el.remove());
  clone.querySelectorAll('[data-canvas-outline]').forEach(el => el.remove());
  clone.querySelectorAll('[data-vertex-handle]').forEach(el => el.remove());
  clone.querySelectorAll('[data-ang-handle]').forEach(el => el.remove());
  clone.querySelectorAll('[data-ang-lid]').forEach(el => el.removeAttribute('data-ang-lid'));
  clone.querySelectorAll('[data-oid]').forEach(el => {
    el.removeAttribute('data-oid');
    el.removeAttribute('style');
  });
  clone.querySelectorAll('[data-ioid]').forEach(el => {
    el.removeAttribute('data-ioid');
    el.removeAttribute('style');
  });
  clone.querySelectorAll('[data-line-id]').forEach(el => el.removeAttribute('data-line-id'));
  clone.querySelectorAll('[style]').forEach(el => {
    const st = el.getAttribute('style') || '';
    if (/cursor|user-select/.test(st)) el.removeAttribute('style');
  });
  return clone.outerHTML;
}

/* ── Drag text overlays ── */
function svgLocalCoords(svgEl, clientX, clientY) {
  const rect = svgEl.getBoundingClientRect();
  const vb   = svgEl.viewBox.baseVal;
  return {
    x: vb.x + (clientX - rect.left) * (vb.width  / rect.width),
    y: vb.y + (clientY - rect.top)  * (vb.height / rect.height),
  };
}

function attachDragHandlers() {
  const svgEl = $('svgPreview').querySelector('svg');
  if (!svgEl) return;
  svgEl.querySelectorAll('[data-oid]').forEach(el => {
    el.addEventListener('mousedown', e => {
      if (drawMode) return;
      e.preventDefault(); e.stopPropagation();
      isDragging = false;
      const start = svgLocalCoords(svgEl, e.clientX, e.clientY);
      const sx = parseFloat(el.getAttribute('x')) || 0;
      const sy = parseFloat(el.getAttribute('y')) || 0;
      const onMove = ev => {
        isDragging = true;
        const pt = svgLocalCoords(svgEl, ev.clientX, ev.clientY);
        el.setAttribute('x', fmt(sx + (pt.x - start.x)));
        el.setAttribute('y', fmt(sy + (pt.y - start.y)));
      };
      const onUp = () => {
        if (isDragging) {
          const id = parseInt(el.getAttribute('data-oid'));
          const ov = textOverlays.find(t => t.id === id);
          if (ov) { ov.x = parseFloat(el.getAttribute('x')); ov.y = parseFloat(el.getAttribute('y')); }
          $('svgCode').value = getCleanSVG();
        }
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        setTimeout(() => { isDragging = false; }, 0);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

function attachImageDragHandlers() {
  const svgEl = $('svgPreview').querySelector('svg');
  if (!svgEl) return;
  svgEl.querySelectorAll('[data-ioid]').forEach(el => {
    el.addEventListener('mousedown', e => {
      if (drawMode) return;
      e.preventDefault(); e.stopPropagation();
      isDragging = false;
      const start = svgLocalCoords(svgEl, e.clientX, e.clientY);
      const sx = parseFloat(el.getAttribute('x')) || 0;
      const sy = parseFloat(el.getAttribute('y')) || 0;
      const onMove = ev => {
        isDragging = true;
        const pt = svgLocalCoords(svgEl, ev.clientX, ev.clientY);
        el.setAttribute('x', fmt(sx + (pt.x - start.x)));
        el.setAttribute('y', fmt(sy + (pt.y - start.y)));
      };
      const onUp = () => {
        if (isDragging) {
          const id  = parseInt(el.getAttribute('data-ioid'));
          const ov  = imageOverlays.find(i => i.id === id);
          if (ov) { ov.x = parseFloat(el.getAttribute('x')); ov.y = parseFloat(el.getAttribute('y')); }
          $('svgCode').value = getCleanSVG();
        }
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        setTimeout(() => { isDragging = false; }, 0);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

/* ── Feedback ── */
function doFeedback(msg = 'Copied!') {
  $('copyFeedback').textContent = msg;
  setTimeout(() => { $('copyFeedback').textContent = ' '; }, 2000);
}

/* ── Copy SVG / Download SVG ── */
function copyToClipboard() {
  navigator.clipboard.writeText($('svgCode').value).then(() => doFeedback());
}
function download() {
  const blob = new Blob([$('svgCode').value], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${currentShape}.svg`; a.click();
  URL.revokeObjectURL(url);
}

/* ── PNG export ── */
function _svgToPNGCanvas(cb) {
  const svgCode = $('svgCode').value;
  const svgEl   = $('svgPreview').querySelector('svg');
  if (!svgEl) return;

  const w = svgEl.width.baseVal.value  || 400;
  const h = svgEl.height.baseVal.value || 300;
  const DPR = 2; // 2× for sharp output

  const canvas = document.createElement('canvas');
  canvas.width  = w * DPR;
  canvas.height = h * DPR;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const blob = new Blob([svgCode], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const img  = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    canvas.toBlob(cb, 'image/png');
  };
  img.onerror = () => { URL.revokeObjectURL(url); doFeedback('PNG failed'); };
  img.src = url;
}

function downloadPNG() {
  _svgToPNGCanvas(pngBlob => {
    const a = document.createElement('a');
    a.href     = URL.createObjectURL(pngBlob);
    a.download = `${currentShape}.png`;
    a.click();
  });
}

function copyPNG() {
  _svgToPNGCanvas(async pngBlob => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
      doFeedback('PNG copied!');
    } catch {
      doFeedback('Copy PNG failed');
    }
  });
}
