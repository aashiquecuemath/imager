'use strict';

function injectTextOverlays(svg) {
  if (!textOverlays.length) return svg;
  const els = textOverlays.map(t =>
    `<text data-oid="${t.id}" x="${fmt(t.x)}" y="${fmt(t.y)}" ` +
    `font-family="Arial,sans-serif" font-size="${t.size}" fill="${t.color}" ` +
    `${t.bold ? 'font-weight="bold" ' : ''}` +
    `style="cursor:move;user-select:none">${escXml(t.text)}</text>`
  ).join('\n');
  return svg.replace('</svg>', els + '\n</svg>');
}

function updateTextList() {
  $('text-list').innerHTML = textOverlays.length
    ? textOverlays.map(t =>
        `<div class="text-item">` +
        `<span class="text-item-label">${escXml(t.text)}</span>` +
        `<button class="text-item-del" data-id="${t.id}" title="Remove">×</button>` +
        `</div>`
      ).join('')
    : '';
}

function addTextOverlay() {
  const text = val('text-content').trim();
  if (!text) return;

  // Default position: 10% in from the top-left of the current viewBox
  const svgEl = $('svgPreview').querySelector('svg');
  let cx = 20, cy = 30;
  if (svgEl) {
    const vb = svgEl.viewBox.baseVal;
    cx = vb.x + vb.width  * 0.10;
    cy = vb.y + vb.height * 0.18;
  }

  textOverlays.push({
    id:    ++oidCounter,
    text,
    x: cx, y: cy,
    size:  int('text-size')  || 16,
    color: val('text-color') || '#000000',
    bold:  chk('text-bold'),
  });
  updateTextList();
  render();
}

function removeTextOverlay(id) {
  textOverlays = textOverlays.filter(t => t.id !== id);
  updateTextList();
  render();
}

/* ── Image overlays ── */

function injectImageOverlays(svg) {
  if (!imageOverlays.length) return svg;
  const els = imageOverlays.map(img =>
    `<image data-ioid="${img.id}" href="${escXml(img.src)}" ` +
    `x="${fmt(img.x)}" y="${fmt(img.y)}" ` +
    `width="${img.w}" height="${img.h}" ` +
    `opacity="${img.opacity}" preserveAspectRatio="xMidYMid meet" ` +
    `style="cursor:move;user-select:none"/>`
  ).join('\n');
  return svg.replace('</svg>', els + '\n</svg>');
}

function updateImageList() {
  const list = $('image-list');
  if (!list) return;
  list.innerHTML = imageOverlays.length
    ? imageOverlays.map(img => {
        const label = img.src.startsWith('data:')
          ? '[embedded image]'
          : img.src.length > 38 ? '…' + img.src.slice(-38) : img.src;
        return `<div class="text-item">` +
          `<span class="text-item-label">${escXml(label)}</span>` +
          `<button class="text-item-del" data-iid="${img.id}" title="Remove">×</button>` +
          `</div>`;
      }).join('')
    : '';
}

function addImageOverlay() {
  const src = val('img-src').trim();
  if (!src) return;

  const svgEl = $('svgPreview').querySelector('svg');
  let cx = 0, cy = 0;
  if (svgEl) {
    const vb = svgEl.viewBox.baseVal;
    cx = vb.x + vb.width  * 0.1;
    cy = vb.y + vb.height * 0.1;
  }

  const w       = Math.max(10, parseInt(val('img-w'))       || 100);
  const h       = Math.max(10, parseInt(val('img-h'))       || 100);
  const opacity = Math.min(1, Math.max(0, parseFloat(val('img-opacity')) || 1));

  imageOverlays.push({ id: ++imgIdCounter, src, x: cx, y: cy, w, h, opacity });
  updateImageList();
  render();
}

function removeImageOverlay(id) {
  imageOverlays = imageOverlays.filter(i => i.id !== id);
  updateImageList();
  render();
}
