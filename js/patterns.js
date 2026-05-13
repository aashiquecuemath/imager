'use strict';

/* ═══════════════════════════════════════════════════════════════
   SVG Patterns  —  js/patterns.js
   ═══════════════════════════════════════════════════════════════ */

function _pEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── colors ── */
function _ptH2Rgb(h){
  h=(h||'#888888').replace('#','').padStart(6,'0');
  const v=parseInt(h,16);
  return [(v>>16)&255,(v>>8)&255,v&255];
}
function _ptLerpColor(c1,c2,t){
  const [r1,g1,b1]=_ptH2Rgb(c1),[r2,g2,b2]=_ptH2Rgb(c2);
  const f=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
  return '#'+f(r1+(r2-r1)*t)+f(g1+(g2-g1)*t)+f(b1+(b2-b1)*t);
}
const _PT_SEQ_COLS=['#4ECDC4','#FF6B6B','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#5DADE2'];

/* ── shape paths centered at (0,0) ── */
const _PT_SP = {
  heart:    s=>{ const h=+(s*.45).toFixed(2); return `M0,${+(h*.55).toFixed(2)} C${-h},${+(h*-.25).toFixed(2)} ${+(-h*1.2).toFixed(2)},${+(h*.7).toFixed(2)} 0,${+(h*1.1).toFixed(2)} C${+(h*1.2).toFixed(2)},${+(h*.7).toFixed(2)} ${h},${+(h*-.25).toFixed(2)} 0,${+(h*.55).toFixed(2)}`; },
  diamond:  s=>{ const h=+(s*.48).toFixed(2); return `M0,${-h} L${h},0 L0,${h} L${-h},0Z`; },
  star:     s=>{ const r1=s*.48,r2=s*.2; let d=''; for(let i=0;i<5;i++){const a1=(i*72-90)*Math.PI/180,a2=(i*72+36-90)*Math.PI/180; d+=(i?'L':'M')+`${+(r1*Math.cos(a1)).toFixed(2)},${+(r1*Math.sin(a1)).toFixed(2)}L${+(r2*Math.cos(a2)).toFixed(2)},${+(r2*Math.sin(a2)).toFixed(2)}`; } return d+'Z'; },
  circle:   s=>{ const r=+(s*.47).toFixed(2); return `M${r},0A${r},${r},0,1,1,${-r},0A${r},${r},0,1,1,${r},0Z`; },
  square:   s=>{ const h=+(s*.44).toFixed(2); return `M${-h},${-h}L${h},${-h}L${h},${h}L${-h},${h}Z`; },
  triangle: s=>{ const h=+(s*.47).toFixed(2),b=+(s*.33).toFixed(2); return `M0,${-h}L${h},${b}L${-h},${b}Z`; },
  pentagon: s=>{ const r=s*.47; let d=''; for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180; d+=(i?'L':'M')+`${+(r*Math.cos(a)).toFixed(2)},${+(r*Math.sin(a)).toFixed(2)}`;} return d+'Z'; },
  leaf:     s=>{ const h=+(s*.48).toFixed(2); return `M0,${-h}C${h},${+(h*-.4).toFixed(2)} ${h},${+(h*.4).toFixed(2)} 0,${h}C${-h},${+(h*.4).toFixed(2)} ${-h},${+(h*-.4).toFixed(2)} 0,${-h}Z`; },
  cross:    s=>{ const a=+(s*.14).toFixed(2),b=+(s*.44).toFixed(2); return `M${-a},${-b}L${a},${-b}L${a},${-a}L${b},${-a}L${b},${a}L${a},${a}L${a},${b}L${-a},${b}L${-a},${a}L${-b},${a}L${-b},${-a}L${-a},${-a}Z`; },
  arrow:    s=>{ const h=+(s*.42).toFixed(2),w=+(s*.18).toFixed(2),hw=+(s*.36).toFixed(2); return `M${-h},${-w}L${w},${-w}L${w},${-hw}L${h},0L${w},${hw}L${w},${w}L${-h},${w}Z`; },
};
function _ptShapePath(shape,size){ return (_PT_SP[shape]||_PT_SP.circle)(size); }

/* ── animation ── */
const _PT_ANIM_KF = {
  bounce:  `@keyframes pt-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`,
  pulse:   `@keyframes pt-pulse{0%,100%{opacity:1}50%{opacity:.35}}`,
  fadein:  `@keyframes pt-fadein{from{opacity:0}to{opacity:1}}`,
  spin:    `@keyframes pt-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`,
  glow:    `@keyframes pt-glow{0%,100%{filter:drop-shadow(0 0 0px rgba(255,210,60,0))}50%{filter:drop-shadow(0 0 9px rgba(255,210,60,1))}}`,
  wobble:  `@keyframes pt-wobble{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-11deg)}75%{transform:rotate(11deg)}}`,
};
/* shine is handled as an SVG overlay — not in this table */
const _PT_ANIM_PROP = {
  bounce:  'animation:pt-bounce 1s ease-in-out infinite',
  pulse:   'animation:pt-pulse 1.5s ease-in-out infinite',
  fadein:  'animation:pt-fadein .8s ease both',
  spin:    'animation:pt-spin 2s linear infinite;transform-box:fill-box;transform-origin:center',
  glow:    'animation:pt-glow 2s ease-in-out infinite',
  wobble:  'animation:pt-wobble .7s ease-in-out infinite;transform-box:fill-box;transform-origin:center',
};

/* sweeping shine streak overlay — injected at end of SVG content */
function _ptShineOverlay(totalW, totalH) {
  const sw = Math.round(totalW * 0.45);
  return (
    `<defs>` +
    `<linearGradient id="pt-shine-g" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0%" stop-color="white" stop-opacity="0"/>` +
    `<stop offset="35%" stop-color="white" stop-opacity="0"/>` +
    `<stop offset="50%" stop-color="white" stop-opacity="0.58"/>` +
    `<stop offset="65%" stop-color="white" stop-opacity="0"/>` +
    `<stop offset="100%" stop-color="white" stop-opacity="0"/>` +
    `</linearGradient>` +
    `<style>@keyframes pt-shine-sw{0%{transform:translateX(${-sw}px)}` +
    `70%{transform:translateX(${totalW + sw}px)}100%{transform:translateX(${totalW + sw}px)}}</style>` +
    `</defs>` +
    `<rect x="0" y="0" width="${sw}" height="${totalH}" fill="url(#pt-shine-g)" ` +
    `style="animation:pt-shine-sw 3s ease-in-out infinite;pointer-events:none"/>`
  );
}

/* ── arrangement positions ── */
function _ptPosns(count, step, arrange) {
  if(!count) return [];
  const P=[];
  if(arrange==='row'){
    for(let i=0;i<count;i++) P.push([i*step,0]);
  } else if(arrange==='col'){
    for(let i=0;i<count;i++) P.push([0,i*step]);
  } else if(arrange==='square'){
    const c=Math.ceil(Math.sqrt(count));
    for(let i=0;i<count;i++) P.push([(i%c)*step,Math.floor(i/c)*step]);
  } else if(arrange==='pyramid'){
    let r=1,done=0;
    while(done<count){
      const n=Math.min(r,count-done);
      for(let j=0;j<n;j++) P.push([j*step-(n-1)*step/2,(r-1)*step]);
      done+=n; r++;
    }
    const mx=Math.min(...P.map(p=>p[0]));
    for(const p of P) p[0]-=mx;
  } else if(arrange==='righttri'){
    let r=1,done=0;
    while(done<count){
      const n=Math.min(r,count-done);
      for(let j=0;j<n;j++) P.push([j*step,(r-1)*step]);
      done+=n; r++;
    }
  } else if(arrange==='invpyramid'){
    let maxR=1;
    while(maxR*(maxR+1)/2<count) maxR++;
    let rem=count;
    for(let r=0;rem>0;r++){
      const n=Math.min(maxR-r,rem);
      if(n<=0) break;
      const off=((maxR-1)-(n-1))*step/2;
      for(let j=0;j<n;j++) P.push([off+j*step,r*step]);
      rem-=n;
    }
    const mx=Math.min(...P.map(p=>p[0]));
    for(const p of P) p[0]-=mx;
  } else if(arrange==='diamond'){
    const mid=Math.ceil(Math.sqrt(count));
    let done=0;
    for(let r=0;done<count;r++){
      const n=Math.min(r<mid?r+1:2*mid-r-1,count-done);
      if(n<=0) break;
      for(let j=0;j<n;j++) P.push([j*step-(n-1)*step/2,r*step]);
      done+=n;
    }
    const mx=Math.min(...P.map(p=>p[0]));
    for(const p of P) p[0]-=mx;
  } else {
    for(let i=0;i<count;i++) P.push([i*step,0]);
  }
  return P;
}

/* ── overall label SVG helper ── */
function _ptOLblSVG(text, pos, sz, fam, bold, col, contentX, contentY, contentW, contentH, oLblW, oLblH) {
  if (!text || pos === 'none') return '';
  const fw = bold ? 'bold' : 'normal';
  function plain(x, y, anchor, rotate) {
    const xf = +x.toFixed(1), yf = +y.toFixed(1);
    const tr = rotate ? ` transform="rotate(${rotate},${xf},${yf})"` : '';
    return `<text x="${xf}" y="${yf}" text-anchor="${anchor}" font-family="${fam}" font-size="${sz}" font-weight="${fw}" fill="${col}"${tr}>${_pEsc(text)}</text>`;
  }
  function latex(x, y, anchor, rotate) {
    // _renderLabel doesn't support rotation; fall back to plain for rotated
    if (rotate) return plain(x, y, anchor, rotate);
    return _renderLabel(text, x, y, anchor, sz, fam, bold, false, col);
  }
  const render = text.includes('$') ? latex : plain;
  const cx = contentX + contentW / 2;
  const cy = contentY + contentH / 2;
  if (pos === 'above') return render(cx, sz + 4, 'middle', 0);
  if (pos === 'below') return render(cx, contentY + contentH + sz + 6, 'middle', 0);
  if (pos === 'left')  return plain(oLblW / 2, cy, 'middle', -90);
  if (pos === 'right') return plain(contentX + contentW + oLblW / 2, cy, 'middle', 90);
  return '';
}

/* ═══════════════════════════════════════════════════════════════
   Number Pattern Generator
   ═══════════════════════════════════════════════════════════════ */
function _genNumberPattern() {
  function g(id){ return $('pt-np-'+id)?.value||''; }
  function ck(id){ return !!$('pt-np-'+id)?.checked; }
  function nm(id){ return parseFloat(g(id))||0; }

  const layout      = g('layout') || 'row';
  const wCols       = Math.max(1, parseInt($('pt-np-wrap-cols')?.value)||4);
  const cellShape   = g('cell-shape') || 'rectangle';
  const cellSize    = Math.max(24, nm('cell-size') || 60);
  const cellGap     = Math.max(0,  nm('cell-gap')  || 10);
  const bRx         = Math.max(0,  nm('border-rx') || 8);
  const gFill       = g('fill-color')   || '#4ECDC4';
  const gFillOp     = parseFloat($('pt-np-fill-opacity')?.value || '1');
  const gBorderClr  = g('stroke-color') || '#2C7873';
  const gBorderW    = Math.max(0, nm('stroke-w') || 2);
  const gBorderDash = ck('stroke-dash');
  const gFontSz     = Math.max(8, nm('font-size')  || 20);
  const gFontClr    = g('font-color')   || '#1a1a2e';
  const gFontBold   = ck('font-bold');
  const gFontItal   = ck('font-italic');
  const gFontFam    = g('font-family')  || 'sans-serif';
  const anim        = g('anim')         || 'none';
  const lblText     = g('label-text')   || '';
  const lblPos      = g('label-pos')    || 'none';
  const lblSz       = Math.max(8, nm('label-size')  || 16);
  const lblCol      = g('label-color')  || '#333333';
  const lblBold     = ck('label-bold');
  const lblFam      = g('label-family') || 'sans-serif';

  // Read element cards
  const elems = [];
  for (const card of ($('pt-np-elements-list')?.querySelectorAll('.pt-el-card') || [])) {
    const fv = s => (card.querySelector(`[data-field="${s}"]`)?.value ?? '');
    const fc = s => !!(card.querySelector(`[data-field="${s}"]`)?.checked);
    const bwRaw = fv('border-w');
    elems.push({
      lbl:        fv('lbl') || String(elems.length + 1),
      lblSz:      Math.max(8, parseFloat(fv('lbl-size'))  || gFontSz),
      lblClr:     fv('lbl-color')  || gFontClr,
      lblBold:    fc('lbl-bold'),
      lblItal:    fc('lbl-italic'),
      lblFont:    fv('lbl-font')   || gFontFam,
      fill:       fv('fill-color') || gFill,
      fillOp:     parseFloat(fv('fill-opacity') || String(gFillOp)),
      borderClr:  fv('border-color') || gBorderClr,
      borderW:    bwRaw !== '' ? parseFloat(bwRaw) : gBorderW,
      borderDash: fc('border-dash') || gBorderDash,
    });
  }

  if (elems.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><text x="80" y="44" text-anchor="middle" font-size="13" fill="#aaa" font-family="sans-serif">No elements — click + Add Element</text></svg>`;
  }

  const nC = elems.length;
  const isShine  = anim === 'shine';
  const animCSS  = !isShine && _PT_ANIM_KF[anim]  ? `<style>${_PT_ANIM_KF[anim]}</style>` : '';
  const animProp = !isShine && _PT_ANIM_PROP[anim] ? _PT_ANIM_PROP[anim] : '';

  function cellSVG(i) {
    const el = elems[i], cs = cellSize, h = cs/2;
    const bw = el.borderW;
    const dash = el.borderDash ? ` stroke-dasharray="6,4"` : '';
    let bg = '';
    if (cellShape==='circle') {
      bg = `<circle cx="${h}" cy="${h}" r="${+(h-bw*.5).toFixed(1)}" fill="${el.fill}" fill-opacity="${el.fillOp}" stroke="${el.borderClr}" stroke-width="${bw}"${dash}/>`;
    } else if (cellShape==='diamond') {
      bg = `<polygon points="${h},${bw} ${cs-bw},${h} ${h},${cs-bw} ${bw},${h}" fill="${el.fill}" fill-opacity="${el.fillOp}" stroke="${el.borderClr}" stroke-width="${bw}"${dash}/>`;
    } else if (cellShape==='hexagon') {
      const r = h-bw*.5;
      const pts = Array.from({length:6},(_,k)=>{const a=(k*60-30)*Math.PI/180;return `${+(h+r*Math.cos(a)).toFixed(2)},${+(h+r*Math.sin(a)).toFixed(2)}`;}).join(' ');
      bg = `<polygon points="${pts}" fill="${el.fill}" fill-opacity="${el.fillOp}" stroke="${el.borderClr}" stroke-width="${bw}"${dash}/>`;
    } else {
      bg = `<rect x="${bw*.5}" y="${bw*.5}" width="${cs-bw}" height="${cs-bw}" rx="${bRx}" fill="${el.fill}" fill-opacity="${el.fillOp}" stroke="${el.borderClr}" stroke-width="${bw}"${dash}/>`;
    }
    const style = animProp ? ` style="${animProp};animation-delay:${(i*.08).toFixed(2)}s"` : '';
    let textSVG;
    const lbl = el.lbl;
    if (lbl.includes('$')) {
      textSVG = _renderLabel(lbl, h, h+el.lblSz*.36, 'middle', el.lblSz, el.lblFont, el.lblBold, el.lblItal, el.lblClr);
    } else {
      textSVG = `<text x="${h}" y="${+(h+el.lblSz*.36).toFixed(1)}" text-anchor="middle" font-family="${el.lblFont}" font-size="${el.lblSz}" font-weight="${el.lblBold?'bold':'normal'}" font-style="${el.lblItal?'italic':'normal'}" fill="${el.lblClr}">${_pEsc(lbl)}</text>`;
    }
    return `<g${style}>${bg}${textSVG}</g>`;
  }

  let cols, rows;
  if (layout==='row')       { cols=nC; rows=1; }
  else if (layout==='col')  { cols=1;  rows=nC; }
  else if (layout==='grid') { cols=Math.ceil(Math.sqrt(nC)); rows=Math.ceil(nC/cols); }
  else                      { cols=wCols; rows=Math.ceil(nC/cols); }

  const pad = 12;
  const cW = cols*cellSize+(cols-1)*cellGap;
  const cH = rows*cellSize+(rows-1)*cellGap;

  // Overall label space
  const showLbl = lblText && lblPos !== 'none';
  const oH = showLbl && (lblPos==='above'||lblPos==='below') ? lblSz+14 : 0;
  const oW = showLbl && (lblPos==='left'||lblPos==='right')  ? lblSz+20 : 0;

  const totalW = pad*2 + cW + oW;
  const totalH = pad*2 + cH + oH;

  const gx = pad + (lblPos==='left' ? oW : 0);
  const gy = pad + (lblPos==='above' ? oH : 0);

  let inner = '';
  for (let i=0; i<nC; i++) {
    let c, r;
    if (layout==='row')      { c=i; r=0; }
    else if (layout==='col') { c=0; r=i; }
    else                     { c=i%cols; r=Math.floor(i/cols); }
    inner += `<g transform="translate(${gx+c*(cellSize+cellGap)},${gy+r*(cellSize+cellGap)})">${cellSVG(i)}</g>`;
  }

  const lbl = showLbl ? _ptOLblSVG(lblText, lblPos, lblSz, lblFam, lblBold, lblCol, gx, gy, cW, cH, oW, oH) : '';
  const shine = isShine ? _ptShineOverlay(totalW, totalH) : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">${animCSS}${inner}${lbl}${shine}</svg>`;
}

/* ═══════════════════════════════════════════════════════════════
   Shape Pattern Generator
   ═══════════════════════════════════════════════════════════════ */
function _genShapePattern() {
  function g(id){ return $('pt-sp-'+id)?.value||''; }
  function ck(id){ return !!$('pt-sp-'+id)?.checked; }
  function nm(id){ return parseFloat(g(id))||0; }

  const shape         = g('shape')          || 'heart';
  const shapeSize     = Math.max(12, nm('size')  || 30);
  const shapePad      = Math.max(2,  nm('pad')   || 6);
  const colorMode     = g('color-mode')     || 'single';
  const col1          = g('color1')         || '#FF6B6B';
  const col2          = g('color2')         || '#45B7D1';
  const sColor        = g('stroke-color')   || 'none';
  const sW            = nm('stroke-w')      || 0;
  const termGap       = Math.max(0, nm('term-gap') || 30);
  const hasBound      = ck('boundary');
  const bndColor      = g('bound-color')    || '#006B6B';
  const bndStrkW      = Math.max(.5, nm('bound-stroke') || 1.5);
  const bndRx         = Math.max(0,  nm('bound-rx')     || 8);
  const bndPad        = Math.max(4,  nm('bound-pad')    || 10);
  const bndDash       = ck('bound-dash');
  const uniformSize   = ck('bound-uniform');
  const globalArrange = $('pt-sp-default-arrange')?.value || 'pyramid';
  const anim          = g('anim') || 'none';

  const oLblText = $('pt-sp-label-overall')?.value  || '';
  const oLblPos  = $('pt-sp-label-pos-overall')?.value || 'none';
  const oLblSz   = Math.max(8, parseFloat($('pt-sp-olbl-size')?.value)   || 16);
  const oLblCol  = $('pt-sp-olbl-color')?.value    || '#333333';
  const oLblBold = !!$('pt-sp-olbl-bold')?.checked;
  const oLblFam  = $('pt-sp-olbl-family')?.value   || 'sans-serif';

  // Read term cards
  const termCards = $('pt-sp-terms-list')?.querySelectorAll('.pt-el-card') || [];
  if (termCards.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><text x="80" y="44" text-anchor="middle" font-size="13" fill="#aaa" font-family="sans-serif">No terms — click + Add Term</text></svg>`;
  }

  const numTerms = termCards.length;
  const isShine  = anim === 'shine';
  const animCSS  = !isShine && _PT_ANIM_KF[anim]  ? `<style>${_PT_ANIM_KF[anim]}</style>` : '';
  const animProp = !isShine && _PT_ANIM_PROP[anim] ? _PT_ANIM_PROP[anim] : '';
  const bp       = hasBound ? bndPad : 0;
  const dashAttr = bndDash ? ` stroke-dasharray="8,5"` : '';

  // Parse term data
  const termData = [];
  for (const card of termCards) {
    const fv = s => (card.querySelector(`[data-field="${s}"]`)?.value ?? '');
    const fc = s => !!(card.querySelector(`[data-field="${s}"]`)?.checked);
    const arrRaw = fv('arrange');
    termData.push({
      cnt:     Math.max(1, parseInt(fv('count'))    || 1),
      arr:     arrRaw === 'global' || !arrRaw ? globalArrange : arrRaw,
      lbl:     fv('lbl'),
      lblSz:   Math.max(8, parseFloat(fv('lbl-size')) || 14),
      lblClr:  fv('lbl-color') || '#333333',
      lblBold: fc('lbl-bold'),
      lblPos:  fv('lbl-pos')  || 'below',
      lblFont: fv('lbl-font') || 'sans-serif',
    });
  }

  function shapeColor(ti) {
    if (colorMode==='gradient')    return _ptLerpColor(col1,col2,numTerms<=1?0:ti/(numTerms-1));
    if (colorMode==='alternating') return ti%2===0?col1:col2;
    if (colorMode==='sequence')    return _PT_SEQ_COLS[ti%_PT_SEQ_COLS.length];
    return col1;
  }

  const step = shapeSize + shapePad;

  // Pass 1: geometry
  const termGeom = [];
  for (let ti=0; ti<numTerms; ti++) {
    const {cnt, arr, lbl, lblSz, lblPos} = termData[ti];
    const pp   = _ptPosns(cnt, step, arr);
    const xs   = pp.length?pp.map(p=>p[0]):[0];
    const ys   = pp.length?pp.map(p=>p[1]):[0];
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const maxX = Math.max(...xs), maxY = Math.max(...ys);
    const cW   = maxX-minX+shapeSize;
    const cH   = maxY-minY+shapeSize;
    const innerW = cW+bp*2;
    const innerH = cH+bp*2;
    const lH = lbl ? lblSz+6 : 0;
    termGeom.push({cnt, pp, minX, minY, cW, cH, innerW, innerH, lH});
  }

  // Pass 2: uniform
  let uInnerW = 0, uInnerH = 0;
  if (uniformSize && hasBound) {
    uInnerW = Math.max(...termGeom.map(t=>t.innerW));
    uInnerH = Math.max(...termGeom.map(t=>t.innerH));
  }

  // Pass 3: render
  const termSVGs = [], termSizes = [];
  for (let ti=0; ti<numTerms; ti++) {
    const {cnt, pp, minX, minY, cW, cH, innerW, innerH, lH} = termGeom[ti];
    const {lbl, lblSz, lblClr, lblBold, lblPos, lblFont} = termData[ti];
    const boxW = (uniformSize && hasBound) ? uInnerW : innerW;
    const boxH = (uniformSize && hasBound) ? uInnerH : innerH;

    let svg2 = '';
    if (hasBound) {
      const bY = lblPos==='above' ? lH : 0;
      svg2 += `<rect x="0" y="${bY}" width="${boxW}" height="${boxH}" rx="${bndRx}" fill="none" stroke="${bndColor}" stroke-width="${bndStrkW}"${dashAttr}/>`;
    }

    const offX = (boxW-innerW)/2 + bp - minX;
    const offY = (boxH-innerH)/2 + bp - minY + (lblPos==='above' ? lH : 0);
    const sc = shapeColor(ti);

    for (let si=0; si<cnt; si++) {
      const [px,py] = pp[si]||[0,0];
      const cx = offX+px+shapeSize/2;
      const cy = offY+py+shapeSize/2;
      const d  = _ptShapePath(shape, shapeSize);
      const aStyle = animProp ? ` style="${animProp};animation-delay:${(ti*.2+si*.04).toFixed(2)}s"` : '';
      svg2 += `<path d="${d}" fill="${sc}" stroke="${sColor}" stroke-width="${sW}" transform="translate(${+cx.toFixed(1)},${+cy.toFixed(1)})"${aStyle}/>`;
    }

    if (lbl) {
      const lx = boxW/2;
      const lyFinal = lblPos==='above' ? lblSz : boxH+lblSz+2;
      if (lbl.includes('$')) {
        svg2 += _renderLabel(lbl, lx, lyFinal, 'middle', lblSz, lblFont, lblBold, false, lblClr);
      } else {
        svg2 += `<text x="${lx}" y="${lyFinal}" text-anchor="middle" font-family="${lblFont}" font-size="${lblSz}" font-weight="${lblBold?'bold':'normal'}" fill="${lblClr}">${_pEsc(lbl)}</text>`;
      }
    }

    termSVGs.push(svg2);
    termSizes.push({w:boxW, h:boxH+lH});
  }

  const pad  = 14;
  const maxH = Math.max(...termSizes.map(t=>t.h));
  const cW   = termSizes.reduce((a,t)=>a+t.w, 0) + (numTerms-1)*termGap + pad*2;
  const cH   = maxH + pad*2;

  // Overall label space
  const showOLbl = oLblText && oLblPos !== 'none';
  const oLH = showOLbl && (oLblPos==='above'||oLblPos==='below') ? oLblSz+14 : 0;
  const oLW = showOLbl && (oLblPos==='left'||oLblPos==='right')  ? oLblSz+20  : 0;

  const totalW = cW + oLW;
  const totalH = cH + oLH;
  const gx = oLblPos==='left' ? oLW : 0;
  const gy = oLblPos==='above' ? oLH : 0;

  let content = animCSS;
  let cx = gx + pad;
  for (let ti=0; ti<numTerms; ti++) {
    content += `<g transform="translate(${cx},${gy+pad})">${termSVGs[ti]}</g>`;
    cx += termSizes[ti].w + termGap;
  }

  const oLbl = showOLbl ? _ptOLblSVG(oLblText, oLblPos, oLblSz, oLblFam, oLblBold, oLblCol, gx+pad, gy+pad, cW-pad*2, maxH, oLW, oLH) : '';
  const shine = isShine ? _ptShineOverlay(totalW, totalH) : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">${content}${oLbl}${shine}</svg>`;
}

/* ═══════════════════════════════════════════════════════════════
   Main dispatcher
   ═══════════════════════════════════════════════════════════════ */
function generatePatterns() {
  const type = $('pt-type')?.value || 'number';
  return type==='number' ? _genNumberPattern() : _genShapePattern();
}

/* ═══════════════════════════════════════════════════════════════
   UI sync helpers
   ═══════════════════════════════════════════════════════════════ */
function _ptSwitchType(type) {
  $('pt-type').value = type;
  document.querySelectorAll('.pt-type-btn').forEach(b=>b.classList.toggle('active', b.dataset.pt===type));
  $('pt-panel-number').style.display = type==='number' ? 'block' : 'none';
  $('pt-panel-shape').style.display  = type==='shape'  ? 'block' : 'none';
  render();
}

function _ptPickShape(shape, btn) {
  $('pt-sp-shape').value = shape;
  document.querySelectorAll('.sp-shape-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function _ptSyncCellShape() {
  const s = $('pt-np-cell-shape')?.value || 'rectangle';
  const r = $('pt-np-brx-row');
  if (r) r.style.display = s==='rectangle' ? '' : 'none';
}

function _ptSyncNpLayout() {
  const l = $('pt-np-layout')?.value || 'row';
  const el = $('pt-np-wrap-extra');
  if (el) el.style.display = l==='wrap' ? '' : 'none';
}

function _ptSyncSpColorMode() {
  const m = $('pt-sp-color-mode')?.value || 'single';
  const r = $('pt-sp-col2-row');
  if (r) r.style.display = (m==='gradient'||m==='alternating') ? '' : 'none';
}

/* ── font options shared string ── */
const _PT_FONT_OPTS = `
  <option value="sans-serif">Sans-serif</option>
  <option value="serif">Serif</option>
  <option value="monospace">Monospace</option>
  <option value="Georgia, serif">Georgia</option>
  <option value="Arial, sans-serif">Arial</option>
  <option value="Nunito, sans-serif">Nunito (rounded)</option>
  <option value="Poppins, sans-serif">Poppins (rounded)</option>
  <option value="Comfortaa, cursive">Comfortaa (rounded)</option>
  <option value="Fredoka One, cursive">Fredoka One</option>`;

const _PT_FONT_OPTS_EL = `<option value="">← global</option>${_PT_FONT_OPTS}`;

const _PT_ARRANGE_OPTS = `
  <option value="global">← global</option>
  <option value="pyramid">Pyramid</option>
  <option value="row">Row</option>
  <option value="col">Column</option>
  <option value="square">Square</option>
  <option value="righttri">Right △</option>
  <option value="invpyramid">Inv △</option>
  <option value="diamond">Diamond</option>`;

/* ── Number Pattern: element management ── */
function _addNpElement(skipRender) {
  const list = $('pt-np-elements-list');
  if (!list) return;
  const i = list.children.length;
  const gFill   = $('pt-np-fill-color')?.value   || '#4ECDC4';
  const gBorder = $('pt-np-stroke-color')?.value || '#2C7873';
  const gFontSz = $('pt-np-font-size')?.value    || '20';
  const gFontCl = $('pt-np-font-color')?.value   || '#1a1a2e';
  const card = document.createElement('div');
  card.className = 'pt-el-card';
  card.innerHTML =
    `<div class="pt-el-hdr">` +
      `<span class="pt-el-badge">${i+1}</span>` +
      `<button class="pt-el-del" title="Remove" onclick="_removeNpElement(this)">×</button>` +
    `</div>` +
    `<div class="field-row" style="margin-top:5px">` +
      `<label style="min-width:38px">Label</label>` +
      `<input type="text" data-field="lbl" placeholder="Text or $LaTeX$" style="flex:1" oninput="render()">` +
    `</div>` +
    `<details class="pt-el-details"><summary>Label style</summary><div class="pt-el-sub">` +
      `<div class="field-row">` +
        `<label style="min-width:32px">Size</label>` +
        `<input type="number" data-field="lbl-size" value="${gFontSz}" min="8" max="48" style="width:52px" oninput="render()">` +
        `<label style="margin-left:8px">Color</label>` +
        `<input type="color" data-field="lbl-color" value="${gFontCl}" style="width:32px;height:24px;padding:1px" onchange="render()">` +
        `<label class="chk-lbl" style="margin-left:8px"><input type="checkbox" data-field="lbl-bold" onchange="render()"> B</label>` +
        `<label class="chk-lbl"><input type="checkbox" data-field="lbl-italic" onchange="render()"> I</label>` +
      `</div>` +
      `<div class="field-row" style="margin-top:3px">` +
        `<label style="min-width:32px">Font</label>` +
        `<select data-field="lbl-font" style="flex:1;font-size:.73rem" onchange="render()">${_PT_FONT_OPTS_EL}</select>` +
      `</div>` +
    `</div></details>` +
    `<details class="pt-el-details"><summary>Box override</summary><div class="pt-el-sub">` +
      `<div class="field-row">` +
        `<label style="min-width:32px">Fill</label>` +
        `<input type="color" data-field="fill-color" value="${gFill}" style="width:32px;height:24px;padding:1px" onchange="render()">` +
        `<label style="margin-left:8px">Opacity</label>` +
        `<input type="range" data-field="fill-opacity" min="0.05" max="1" step="0.05" value="1" style="flex:1;min-width:50px" oninput="render()">` +
      `</div>` +
      `<div class="field-row" style="margin-top:3px">` +
        `<label style="min-width:32px">Border</label>` +
        `<input type="color" data-field="border-color" value="${gBorder}" style="width:32px;height:24px;padding:1px" onchange="render()">` +
        `<label style="margin-left:8px">W</label>` +
        `<input type="number" data-field="border-w" placeholder="global" min="0" max="8" step="0.5" style="width:52px" oninput="render()">` +
        `<label class="chk-lbl" style="margin-left:8px"><input type="checkbox" data-field="border-dash" onchange="render()"> Dash</label>` +
      `</div>` +
    `</div></details>`;
  list.appendChild(card);
  _ptRenumberNpElements();
  if (!skipRender) render();
}

function _removeNpElement(btn) {
  btn.closest('.pt-el-card').remove();
  _ptRenumberNpElements();
  render();
}

function _ptRenumberNpElements() {
  ($('pt-np-elements-list')?.querySelectorAll('.pt-el-card') || []).forEach((card, i) => {
    const b = card.querySelector('.pt-el-badge');
    if (b) b.textContent = i + 1;
  });
}

/* ── Shape Pattern: term management ── */
function _addSpTerm(count, skipRender) {
  const list = $('pt-sp-terms-list');
  if (!list) return;
  const i = list.children.length;
  const cnt = count != null ? count : (i + 1);
  const card = document.createElement('div');
  card.className = 'pt-el-card';
  card.innerHTML =
    `<div class="pt-el-hdr">` +
      `<span class="pt-el-badge">T${i+1}</span>` +
      `<button class="pt-el-del" title="Remove" onclick="_removeSpTerm(this)">×</button>` +
    `</div>` +
    `<div class="field-row" style="margin-top:5px">` +
      `<label style="min-width:42px">Count</label>` +
      `<input type="number" data-field="count" value="${cnt}" min="1" max="60" style="width:56px" oninput="render()">` +
      `<label style="margin-left:8px">Arrange</label>` +
      `<select data-field="arrange" style="flex:1" onchange="render()">${_PT_ARRANGE_OPTS}</select>` +
    `</div>` +
    `<div class="field-row" style="margin-top:3px">` +
      `<label style="min-width:42px">Label</label>` +
      `<input type="text" data-field="lbl" placeholder="Text or $LaTeX$" style="flex:1" oninput="render()">` +
    `</div>` +
    `<details class="pt-el-details"><summary>Label style</summary><div class="pt-el-sub">` +
      `<div class="field-row">` +
        `<label style="min-width:32px">Size</label>` +
        `<input type="number" data-field="lbl-size" value="14" min="8" max="36" style="width:52px" oninput="render()">` +
        `<label style="margin-left:8px">Color</label>` +
        `<input type="color" data-field="lbl-color" value="#333333" style="width:32px;height:24px;padding:1px" onchange="render()">` +
        `<label class="chk-lbl" style="margin-left:8px"><input type="checkbox" data-field="lbl-bold" onchange="render()"> Bold</label>` +
      `</div>` +
      `<div class="field-row" style="margin-top:3px">` +
        `<label style="min-width:32px">Pos</label>` +
        `<select data-field="lbl-pos" style="flex:1" onchange="render()">` +
          `<option value="below">Below</option><option value="above">Above</option>` +
        `</select>` +
        `<select data-field="lbl-font" style="flex:1;margin-left:6px;font-size:.73rem" onchange="render()">` +
          `<option value="sans-serif">Sans-serif</option>` +
          `<option value="Nunito, sans-serif">Nunito</option>` +
          `<option value="Poppins, sans-serif">Poppins</option>` +
          `<option value="Comfortaa, cursive">Comfortaa</option>` +
          `<option value="Fredoka One, cursive">Fredoka One</option>` +
        `</select>` +
      `</div>` +
    `</div></details>`;
  list.appendChild(card);
  _ptRenumberSpTerms();
  if (!skipRender) render();
}

function _removeSpTerm(btn) {
  btn.closest('.pt-el-card').remove();
  _ptRenumberSpTerms();
  render();
}

function _ptRenumberSpTerms() {
  ($('pt-sp-terms-list')?.querySelectorAll('.pt-el-card') || []).forEach((card, i) => {
    const b = card.querySelector('.pt-el-badge');
    if (b) b.textContent = `T${i+1}`;
  });
}

/* ── Init default elements ── */
function _ptInitElements() {
  const npList = $('pt-np-elements-list');
  if (npList && npList.children.length === 0) {
    _addNpElement(true);
    _addNpElement(true);
  }
  const spList = $('pt-sp-terms-list');
  if (spList && spList.children.length === 0) {
    _addSpTerm(1, true);
    _addSpTerm(3, true);
    _addSpTerm(6, true);
  }
}
