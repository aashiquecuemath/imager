'use strict';

const SHAPE_SHADING_KEY = {
  rectangle:  'rectangle',
  triangle:   'triangleSplit',
  pentagon:   'pentagonSplit',
  hexagon:    'hexagonSplit',
};

const SHADING_RESET_INPUTS = {
  'frac-num-0': 'fraction-0',
  'frac-num-1': 'fraction-1',
  'frac-num-2': 'fraction-2',
  'frac-num-3': 'fraction-3',
};

function _activateTab(tab) {
  document.querySelectorAll('.tab-content, .editor-panel').forEach(p => p.classList.remove('active'));
  $(`tab-${tab}`)?.classList.add('active');

  const appWrapper   = document.getElementById('app-wrapper');
  const stageRow     = $('stage-action-row');
  const stageDivider = $('stage-action-divider');

  if (tab === 'editor' || tab === 'cube3d') {
    // Full-width iframe tools: hide normal columns, span the grid
    appWrapper?.classList.add('editor-active');
    return;
  }

  appWrapper?.classList.remove('editor-active');

  if (tab === 'grapher') {
    currentShape = 'graphPlot';
    if (stageRow) stageRow.style.display = 'none';
    if (stageDivider) stageDivider.style.display = 'none';
  } else if (tab === 'character') {
    currentShape = 'svgCharacter';
    if (stageRow) stageRow.style.display = 'none';
    if (stageDivider) stageDivider.style.display = 'none';
  } else {
    if (currentShape === 'graphPlot' || currentShape === 'svgCharacter') {
      currentShape = 'numberLine';
      document.querySelectorAll('.param-section').forEach(s => s.classList.remove('visible'));
      $('params-numberLine')?.classList.add('visible');
      document.querySelectorAll('.shape-card').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-shape="numberLine"]')?.classList.add('active');
    }
    if (stageRow) stageRow.style.display = '';
    if (stageDivider) stageDivider.style.display = '';
  }
  render();
}

function wireAll() {

  /* ── Collapsible cards ── */
  document.querySelectorAll('.card.collapsible .card-title').forEach(btn => {
    btn.addEventListener('click', () => {
      const card      = btn.closest('.card.collapsible');
      const collapsed = card.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  });

  /* ── Collapsible sub-groups ── */
  document.querySelectorAll('.sub-group.collapsible .sub-group-title').forEach(titleEl => {
    titleEl.addEventListener('click', e => {
      // Don't collapse when the user clicks the enable checkbox or its label
      if (e.target.closest('input[type=checkbox], label')) return;
      titleEl.closest('.sub-group.collapsible').classList.toggle('collapsed');
    });
  });

  /* ── Graph series auto-show/hide body ── */
  function syncSeriesBody(n) {
    const cb   = $(`gp-s${n}-enable`);
    const body = $(`gp-s${n}-body`);
    if (cb && body) body.style.display = cb.checked ? '' : 'none';
  }
  [2, 3].forEach(n => {
    $(`gp-s${n}-enable`)?.addEventListener('change', () => syncSeriesBody(n));
    syncSeriesBody(n);
  });

  /* ── Graph series input type toggle (equation / points / vertical) ── */
  function syncSeriesType(n) {
    const type   = $(`gp-s${n}-type`)?.value;
    const eqRow  = $(`gp-s${n}-eq-row`);
    const lpRow  = $(`gp-s${n}-lpts-row`);
    const eqIn   = $(`gp-s${n}-eq`);
    const eqLbl  = $(`gp-s${n}-eq-lbl`);
    const lineRow = $(`gp-s${n}-line-row`);
    const isEq   = type === 'equation' || type === 'vertical';
    if (eqRow)  eqRow.style.display  = isEq      ? '' : 'none';
    if (lpRow)  lpRow.style.display  = (type === 'points') ? '' : 'none';
    if (lineRow) lineRow.style.display = (type === 'vertical') ? 'none' : '';
    if (eqIn)  eqIn.placeholder = type === 'vertical' ? 'x-value (e.g. 3)' : 'e.g. x^2 - 2';
    if (eqLbl) eqLbl.textContent = type === 'vertical' ? 'x = (constant)' : 'Equation y = f(x)';
  }
  [1, 2, 3].forEach(n => {
    $(`gp-s${n}-type`)?.addEventListener('change', () => { syncSeriesType(n); render(); });
    syncSeriesType(n);
  });

  /* ── Shape cards ── */
  document.querySelectorAll('.shape-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shape-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentShape = btn.dataset.shape;
      document.querySelectorAll('.param-section').forEach(s => s.classList.remove('visible'));
      $(`params-${currentShape}`)?.classList.add('visible');
      resetShading('rectangle');
      shapeGeometry.polygon = null;
      render();
    });
  });

  /* ── Color scheme ── */
  document.querySelectorAll('.scheme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scheme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScheme = btn.dataset.scheme;
      render();
    });
  });

  /* ── Canvas sliders ── */
  $('canvas-pad')?.addEventListener('input', () => {
    $('canvas-pad-val').textContent = val('canvas-pad');
    render();
  });
  $('canvas-scale')?.addEventListener('input', () => {
    $('canvas-scale-val').textContent = val('canvas-scale');
    render();
  });
  $('canvas-rotate')?.addEventListener('input', () => {
    $('canvas-rotate-val').textContent = val('canvas-rotate');
    render();
  });

  /* ── Background colour ── */
  $('bg-enable')?.addEventListener('change', () => {
    const c = $('bg-color');
    if (c) c.disabled = !$('bg-enable').checked;
    render();
  });
  $('bg-color')?.addEventListener('input', render);

  /* ── Shading-reset inputs ── */
  Object.entries(SHADING_RESET_INPUTS).forEach(([id, key]) => {
    $(id)?.addEventListener('input', () => { resetShading(key); render(); });
  });

  /* ── All other inputs ── */
  const handled = new Set([
    'canvas-pad', 'canvas-scale', 'canvas-rotate',
    'bg-enable', 'bg-color',
    ...Object.keys(SHADING_RESET_INPUTS),
  ]);
  document.querySelectorAll('input:not([type=color]):not([type=file]), select, textarea').forEach(el => {
    if (handled.has(el.id)) return;
    el.addEventListener('input',  render);
    el.addEventListener('change', render);
  });
  document.querySelectorAll('input[type=color]').forEach(el => el.addEventListener('input', render));

  /* ── Click-to-toggle shading ── */
  $('svgPreview').addEventListener('click', e => {
    if (drawMode) return;
    if (isDragging) return;
    const el = e.target.closest('[data-cell]');
    if (!el) return;
    let key;
    if (currentShape === 'fraction') {
      const elIdx = parseInt(el.getAttribute('data-el') ?? '0');
      key = `fraction-${elIdx}`;
    } else {
      key = SHAPE_SHADING_KEY[currentShape];
    }
    if (!key || !shading[key]) return;
    const idx = parseInt(el.getAttribute('data-cell'));
    if (idx >= 0 && idx < shading[key].length) {
      shading[key][idx] = !shading[key][idx];
      render();
    }
  });

  /* ── Line draw mode ── */
  $('btn-draw-line')?.addEventListener('click', () => {
    if (drawMode) { exitDrawMode(); } else { enterDrawMode(); }
  });
  $('btn-clear-lines')?.addEventListener('click', clearAllLines);
  $('line-list')?.addEventListener('click', e => {
    const btn = e.target.closest('.text-item-del');
    if (!btn) return;
    removeLineOverlay(parseInt(btn.dataset.lid));
  });

  /* ── Draw-mode preview line (mousemove) and commit (click) ── */
  function _snapVertex(pt) {
    const verts = shapeGeometry.polygon;
    if (!verts) return pt;
    const VTOL = 22;
    let best = null, bestD = VTOL;
    for (const v of verts) {
      const d = Math.hypot(v[0] - pt.x, v[1] - pt.y);
      if (d < bestD) { bestD = d; best = v; }
    }
    return best ? { x: best[0], y: best[1] } : pt;
  }

  $('svgPreview').addEventListener('mousemove', e => {
    if (!drawMode) return;
    const svgEl = $('svgPreview').querySelector('svg');
    if (!svgEl) return;
    const raw = svgLocalCoords(svgEl, e.clientX, e.clientY);
    const pt  = _snapVertex(raw);

    svgEl.querySelector('[data-draw-preview]')?.remove();
    if (!drawStart) return;

    const ns   = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('data-draw-preview', '1');
    line.setAttribute('x1', drawStart.x); line.setAttribute('y1', drawStart.y);
    line.setAttribute('x2', pt.x);        line.setAttribute('y2', pt.y);
    line.setAttribute('stroke', val('line-color') || '#333');
    line.setAttribute('stroke-width', val('line-width') || '2');
    line.setAttribute('stroke-dasharray', '6 4');
    line.setAttribute('opacity', '0.6');
    line.setAttribute('pointer-events', 'none');
    svgEl.appendChild(line);

    if (shapeGeometry.polygon && (pt.x !== raw.x || pt.y !== raw.y)) {
      const snap = document.createElementNS(ns, 'circle');
      snap.setAttribute('data-draw-preview', '1');
      snap.setAttribute('cx', pt.x); snap.setAttribute('cy', pt.y);
      snap.setAttribute('r', '6');
      snap.setAttribute('fill', 'none');
      snap.setAttribute('stroke', val('line-color') || '#333');
      snap.setAttribute('stroke-width', '2');
      snap.setAttribute('pointer-events', 'none');
      svgEl.appendChild(snap);
    }
  });

  $('svgPreview').addEventListener('click', e => {
    if (!drawMode) return;
    const svgEl = $('svgPreview').querySelector('svg');
    if (!svgEl) return;
    const pt = _snapVertex(svgLocalCoords(svgEl, e.clientX, e.clientY));

    if (!drawStart) {
      drawStart = pt;
      const ns  = 'http://www.w3.org/2000/svg';
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('data-draw-preview', '1');
      dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', val('line-color') || '#333');
      dot.setAttribute('pointer-events', 'none');
      svgEl.appendChild(dot);
    } else {
      commitLine(drawStart.x, drawStart.y, pt.x, pt.y);
      exitDrawMode();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawMode) exitDrawMode();
  });

  /* ── Text overlay ── */
  $('btn-add-text')?.addEventListener('click', addTextOverlay);
  $('text-content')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTextOverlay(); }
  });
  $('text-list')?.addEventListener('click', e => {
    const btn = e.target.closest('.text-item-del');
    if (!btn) return;
    removeTextOverlay(parseInt(btn.dataset.id));
  });

  /* ── Image overlay ── */
  $('btn-add-image')?.addEventListener('click', addImageOverlay);
  $('img-src')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addImageOverlay(); }
  });
  $('image-list')?.addEventListener('click', e => {
    const btn = e.target.closest('.text-item-del');
    if (!btn) return;
    removeImageOverlay(parseInt(btn.dataset.iid));
  });
  $('img-file')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = $('img-src');
      if (src) src.value = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  /* ── Stage ── */
  $('btn-add-to-stage')?.addEventListener('click', addToStage);
  $('btn-clear-stage')?.addEventListener('click', clearStage);
  $('stage-el-list')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-stid]');
    if (btn) removeStageEl(parseInt(btn.dataset.stid));
  });

  /* ── Count buttons — fraction ── */
  document.querySelectorAll('#frac-count-btns .count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#frac-count-btns .count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.count);
      const ci = $('frac-count'); if (ci) ci.value = count;
      for (let i = 0; i < 4; i++) {
        const p = $(`frac-el-${i}`); if (p) p.style.display = i < count ? '' : 'none';
      }
      render();
    });
  });

  /* ── Count buttons — geometry ── */
  document.querySelectorAll('#geo-count-btns .count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#geo-count-btns .count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.count);
      const ci = $('geo-count'); if (ci) ci.value = count;
      for (let i = 0; i < 4; i++) {
        const p = $(`geo-el-${i}`); if (p) p.style.display = i < count ? '' : 'none';
      }
      render();
    });
  });

  /* ── Count buttons — number line ── */
  document.querySelectorAll('#nl-count-btns .count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#nl-count-btns .count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.count);
      const ci = $('nl-count'); if (ci) ci.value = count;
      for (let i = 1; i < 4; i++) {
        const p = $(`nl-el-${i}`); if (p) p.style.display = i < count ? '' : 'none';
      }
      render();
    });
  });

  /* ── Geometry shape type sync ── */
  function syncGeoType(n) {
    const type = val(`geo-type-${n}`) || 'rectangle';
    const divMap = {
      rectangle: 'rect', square: 'sq', circle: 'circ', ellipse: 'ellip',
      triangle: 'tri', parallelogram: 'para', rhombus: 'rhom',
      trapezoid: 'trap', pentagon: 'poly', hexagon: 'poly', octagon: 'poly', sector: 'sec',
    };
    const allKeys = ['rect','sq','circ','ellip','tri','para','rhom','trap','poly','sec'];
    const active = divMap[type] || 'rect';
    allKeys.forEach(k => {
      const el = $(`geo-${k}-${n}`);
      if (el) el.style.display = k === active ? '' : 'none';
    });
  }

  function syncGeoTriType(n) {
    const type = val(`geo-tri-type-${n}`) || 'equilateral';
    const map = { equilateral: 'eq', isosceles: 'iso', scalene: 'sc', right: 'rt' };
    ['eq','iso','sc','rt'].forEach(t => {
      const el = $(`geo-tri-${t}-${n}`); if (el) el.style.display = 'none';
    });
    const div = $(`geo-tri-${map[type] || 'eq'}-${n}`); if (div) div.style.display = '';
  }

  [0, 1, 2, 3].forEach(n => {
    $(`geo-type-${n}`)?.addEventListener('change', () => { syncGeoType(n); render(); });
    $(`geo-tri-type-${n}`)?.addEventListener('change', () => { syncGeoTriType(n); render(); });
    syncGeoType(n);
    syncGeoTriType(n);
  });

  /* ── Character: emotion buttons ── */
  document.querySelectorAll('.emotion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const ei = $('char-emotion'); if (ei) ei.value = btn.dataset.emotion;
      render();
    });
  });

  /* ── Character: character cards ── */
  document.querySelectorAll('.char-card:not(.char-soon)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.char-card').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  /* ── Character: animation toggle ── */
  $('char-animate')?.addEventListener('change', () => {
    const opts = $('char-anim-opts');
    if (opts) opts.style.display = $('char-animate').checked ? '' : 'none';
    render();
  });

  /* ── Character: background toggle ── */
  $('char-bg-enable')?.addEventListener('change', () => {
    const c = $('char-bg-color');
    if (c) c.disabled = !$('char-bg-enable').checked;
    render();
  });

  /* ── Home screen navigation ── */
  document.querySelectorAll('.home-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const tool = tile.dataset.tool;
      const homeScreen = document.getElementById('home-screen');
      const appWrapper = document.getElementById('app-wrapper');
      const btnHome    = $('btn-home');
      if (homeScreen) homeScreen.style.display = 'none';
      if (appWrapper) appWrapper.style.display = '';
      if (btnHome)    btnHome.style.display = '';
      _activateTab(tool);
    });
  });

  $('btn-home')?.addEventListener('click', () => {
    const homeScreen = document.getElementById('home-screen');
    const appWrapper = document.getElementById('app-wrapper');
    const btnHome    = $('btn-home');
    if (homeScreen) homeScreen.style.display = '';
    if (appWrapper) { appWrapper.style.display = 'none'; appWrapper.classList.remove('editor-active'); }
    if (btnHome)    btnHome.style.display = 'none';
  });

  /* ── Copy / Download ── */
  $('btnCopy')?.addEventListener('click',         copyToClipboard);
  $('btnCopy2')?.addEventListener('click',        copyToClipboard);
  $('btnDownload')?.addEventListener('click',     download);
  $('btnDownloadPNG')?.addEventListener('click',  downloadPNG);
  $('btnCopyPNG')?.addEventListener('click',      copyPNG);
}
