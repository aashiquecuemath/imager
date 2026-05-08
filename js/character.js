'use strict';

/* ═══════════════════════════════════════════════════════
   SVG CHARACTER GENERATOR  —  Jiggi and friends
   Canvas: 900 × 800 viewBox units
   Character transform: translate(280,430) scale(0.75) translate(-520,-635)
   For left-side bubble: translate(620,430) scale(0.75) translate(-520,-635)
═══════════════════════════════════════════════════════ */

// ── Jiggi base body parts (never change) ───────────────
const _J = {
  shadow: `<ellipse cx="585.7" cy="1055" rx="181.15" ry="22" fill="#FFDC83" opacity="0.6"/>`,
  leftLeg: `<path fill-rule="evenodd" clip-rule="evenodd" d="M580.172 644.72C587.505 639.779 597.455 641.717 602.396 649.049C614.983 667.726 638.529 703.867 645.855 750.684C652.617 793.896 645.38 844.932 606.275 898.582L636.391 911.61C644.506 915.121 648.239 924.545 644.728 932.661C641.218 940.776 631.793 944.509 623.678 940.998L574.474 919.713C569.82 917.699 566.394 913.6 565.241 908.662C564.087 903.723 565.341 898.53 568.621 894.663C613.286 842.002 620.245 794.136 614.22 755.635C608.057 716.251 588.072 685.09 575.843 666.944C570.902 659.612 572.84 649.662 580.172 644.72Z" fill="#FFBA07" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  rightLeg: `<path fill-rule="evenodd" clip-rule="evenodd" d="M489.679 622.419C481.967 618.094 472.209 620.839 467.884 628.551C423.436 707.802 416.581 788.831 427.869 856.353C436.144 905.852 454.344 948.991 475.463 979.2L455.211 979.84C446.374 980.119 439.435 987.51 439.714 996.347C439.993 1005.19 447.384 1012.12 456.222 1011.84L509.805 1010.15C516.322 1009.95 522.064 1005.81 524.321 999.692C526.577 993.574 524.899 986.699 520.077 982.31C496.644 960.982 469.809 913.032 459.451 851.073C449.195 789.728 455.405 716.259 495.811 644.214C500.137 636.502 497.391 626.744 489.679 622.419Z" fill="#FFBA07" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  leftHand: `<path fill-rule="evenodd" clip-rule="evenodd" d="M724.826 531.168C727.566 521.82 737.366 516.463 746.714 519.203C806.007 536.582 834.151 584.114 844.515 630.51C854.684 676.035 848.772 724.358 836.085 750.261C831.8 759.009 821.235 762.628 812.486 758.343C803.738 754.058 800.119 743.492 804.404 734.743C812.884 717.431 818.878 677.561 810.086 638.2C801.488 599.71 779.802 565.663 736.791 553.056C727.443 550.316 722.086 540.517 724.826 531.168Z" fill="#FFBA07" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  rightHand: `<path fill-rule="evenodd" clip-rule="evenodd" d="M317.856 531.168C315.116 521.82 305.316 516.463 295.968 519.203C236.674 536.582 208.531 584.114 198.167 630.51C187.998 676.035 193.909 724.358 206.596 750.261C210.881 759.009 221.447 762.628 230.196 758.343C238.944 754.058 242.563 743.492 238.278 734.743C229.798 717.431 223.804 677.561 232.596 638.2C241.194 599.71 262.88 565.663 305.89 553.056C315.239 550.316 320.596 540.517 317.856 531.168Z" fill="#FFBA07" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  bodyFill: `<path d="M405.956 349.208C458.612 258.004 590.253 258.004 642.909 349.207L753.607 540.941C806.263 632.145 740.443 746.149 635.13 746.149H413.735C308.422 746.149 242.602 632.145 295.258 540.941L405.956 349.208Z" fill="#FFBA07"/>`,
  bodyD1: `<path d="M585.5 560L582.5 675.5C609.053 672.779 622.941 672.745 625.5 705C614.466 722.429 607.308 729.541 585.5 718L582.5 745.5H660.5C718.566 723.683 750.935 711.139 770.5 627C773.627 590.259 779.14 591.029 761 560H697.5C703.519 532.719 695.064 525.653 674.5 519.5C654.476 524.217 653.875 532.844 657 560H585.5Z" fill="#FFDC83"/>`,
  bodyD2: `<path d="M475.5 561H291C276.577 575.562 281.321 570.28 272.5 603C286.725 695.503 317.519 719.719 385.5 747H583V718C607.563 726.101 617.646 723.747 624 698C618.477 675.333 610.264 670.102 586 676.5V561H516C522.743 586.697 519.439 597.43 497.5 603C466.464 596.48 468.031 582.487 475.5 561Z" fill="#FFBA07"/>`,
  bodyD3: `<path d="M401 560H284.5L401 356V470.5C377.315 463.52 363.967 463.998 358.5 493.5C366.237 518.499 376.558 520.046 401 509V560Z" fill="#FFDC83"/>`,
  bodyD4: `<path d="M401.47 361.5V475.846C396.995 471.02 390.6 468 383.5 468C369.969 468 359 478.969 359 492.5C359 506.031 369.969 517 383.5 517C390.068 517 396.032 514.416 400.431 510.209L399.5 562M399.5 562H285.5M399.5 562H477.525C474.072 566.223 472 571.619 472 577.5C472 591.031 482.969 602 496.5 602C510.031 602 521 591.031 521 577.5C521 571.619 518.928 566.223 515.475 562H584.25M761.5 562H695.475C698.928 557.777 701 552.381 701 546.5C701 532.969 690.031 522 676.5 522C662.969 522 652 532.969 652 546.5C652 552.381 654.072 557.777 657.525 562H584.25M584.25 562V680.164C588.574 676.329 594.265 674 600.5 674C614.031 674 625 684.969 625 698.5C625 712.031 614.031 723 600.5 723C594.265 723 588.574 720.671 584.25 716.836V745.5" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
  bodyStroke: `<path d="M405.956 349.208C458.612 258.004 590.253 258.004 642.909 349.207L753.607 540.941C806.263 632.145 740.443 746.149 635.13 746.149H413.735C308.422 746.149 242.602 632.145 295.258 540.941L405.956 349.208Z" fill="none" stroke="#995200" stroke-width="10.5298"/>`,
  eyeRightOutline: `<ellipse cx="472" cy="381.5" rx="53.5" ry="51.5" fill="none" stroke="#995200" stroke-width="10"/>`,
  eyeLeftOutline:  `<ellipse cx="586" cy="381.5" rx="53.5" ry="51.5" fill="none" stroke="#995200" stroke-width="10"/>`,
};

// ── Waving left-hand group pivot (in original coords) ──
const _WAVE_PIVOT = { x: 725, y: 531 };

// ── Emotion definitions ─────────────────────────────────
const JIGGI_EMOTIONS = {
  happy: {
    eyeRightCornea: `<circle cx="474.856" cy="383.856" r="33.8558" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="383.856" r="33.8558" fill="white"/>`,
    eyeRightIris:   `<circle cx="482.5" cy="390.5" r="18.5" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="568.5" cy="390.5" r="18.5" fill="#995200"/>`,
    eyeRightExtra: '',
    eyeLeftExtra: '',
    eyebrows: `<path d="M418 381L369 385.5M642 381L676.5 385.5" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<path d="M473.251 455H579.714C585.395 455 587.903 462.186 583.425 465.682C562.357 482.129 548.659 490.532 524.614 490.532C501.348 490.532 487.163 480.216 469.419 465.846C464.999 462.266 467.564 455 473.251 455Z" fill="#995200" transform="translate(-1.5,-1.5)"/>
    <path d="M501.008 450.465H550.008V460.465C550.008 464.883 546.426 468.465 542.008 468.465H509.008C504.59 468.465 501.008 464.883 501.008 460.465V450.465Z" fill="white" transform="translate(-1.5,6.1)"/>`,
    extras: '',
  },
  sad: {
    eyeRightCornea: `<circle cx="474.856" cy="383.856" r="33.8558" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="383.856" r="33.8558" fill="white"/>`,
    eyeRightIris:   `<circle cx="481" cy="395" r="18.5" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="570" cy="395" r="18.5" fill="#995200"/>`,
    eyeRightExtra: '',
    eyeLeftExtra: '',
    eyebrows: `<path d="M418 381L369 397M642 381L676.5 397" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<path d="M477 486 Q524 455 571 486" fill="none" stroke="#995200" stroke-width="11" stroke-linecap="round"/>`,
    extras: '',
  },
  surprised: {
    eyeRightCornea: `<circle cx="474.856" cy="379" r="40" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="379" r="40" fill="white"/>`,
    eyeRightIris:   `<circle cx="474.856" cy="379" r="23" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="575.734" cy="379" r="23" fill="#995200"/>`,
    eyeRightExtra: `<circle cx="465" cy="369" r="9" fill="white" opacity="0.75"/>`,
    eyeLeftExtra:  `<circle cx="566" cy="369" r="9" fill="white" opacity="0.75"/>`,
    eyebrows: `<path d="M418 360L369 364M642 360L676.5 364" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<ellipse cx="524" cy="472" rx="25" ry="28" fill="#5a2d00"/>`,
    extras: '',
  },
  angry: {
    eyeRightCornea: `<circle cx="474.856" cy="386" r="33.8558" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="386" r="33.8558" fill="white"/>`,
    eyeRightIris:   `<circle cx="480" cy="396" r="16" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="571" cy="396" r="16" fill="#995200"/>`,
    eyeRightExtra: `<line x1="424" y1="380" x2="522" y2="380" stroke="#FFBA07" stroke-width="20" stroke-linecap="round"/>`,
    eyeLeftExtra:  `<line x1="536" y1="380" x2="636" y2="380" stroke="#FFBA07" stroke-width="20" stroke-linecap="round"/>`,
    eyebrows: `<path d="M440 360L369 394M618 360L677 394" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<path d="M480 479 Q502 469 524 465 Q546 461 568 479" fill="none" stroke="#995200" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`,
    extras: `<path d="M335 308L346 284L352 310" stroke="#995200" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M696 308L707 284L713 310" stroke="#995200" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  excited: {
    eyeRightCornea: `<circle cx="474.856" cy="377" r="39" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="377" r="39" fill="white"/>`,
    eyeRightIris:   `<circle cx="474.856" cy="377" r="23" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="575.734" cy="377" r="23" fill="#995200"/>`,
    eyeRightExtra: `<circle cx="464" cy="366" r="10" fill="white" opacity="0.8"/>`,
    eyeLeftExtra:  `<circle cx="565" cy="366" r="10" fill="white" opacity="0.8"/>`,
    eyebrows: `<path d="M418 355L369 359M642 355L676.5 359" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<path d="M464 455 Q524 514 584 455Z" fill="#995200"/>
<rect x="475" y="455" width="98" height="24" fill="white" rx="4"/>`,
    extras: `<path d="M345 308 L360 288 M350 320 L370 304" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/>
<path d="M694 308 L709 288 M699 320 L719 304" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/>`,
  },
  thinking: {
    eyeRightCornea: `<circle cx="474.856" cy="383.856" r="33.8558" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="383.856" r="33.8558" fill="white"/>`,
    eyeRightIris:   `<circle cx="476" cy="379" r="18.5" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="568.5" cy="390.5" r="18.5" fill="#995200"/>`,
    eyeRightExtra: '',
    eyeLeftExtra: '',
    eyebrows: `<path d="M418 373L369 377M642 379L676.5 387" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<path d="M492 462 Q513 478 550 460" fill="none" stroke="#995200" stroke-width="11" stroke-linecap="round"/>`,
    extras: `<circle cx="582" cy="368" r="7" fill="#995200" opacity="0.35"/>
<circle cx="602" cy="352" r="6" fill="#995200" opacity="0.3"/>
<circle cx="620" cy="338" r="5" fill="#995200" opacity="0.25"/>`,
  },
  winking: {
    eyeRightCornea: '',
    eyeLeftCornea:  `<circle cx="575.734" cy="383.856" r="33.8558" fill="white"/>`,
    eyeRightIris:   '',
    eyeLeftIris:    `<circle cx="568.5" cy="390.5" r="18.5" fill="#995200"/>`,
    eyeRightExtra: `<ellipse cx="472" cy="390" rx="53.5" ry="22" fill="#FFBA07"/>
<path d="M422 386 Q472 407 522 386" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round"/>`,
    eyeLeftExtra: '',
    eyebrows: `<path d="M418 381L369 385.5M642 381L676.5 385.5" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<path d="M473.251 455H579.714C585.395 455 587.903 462.186 583.425 465.682C562.357 482.129 548.659 490.532 524.614 490.532C501.348 490.532 487.163 480.216 469.419 465.846C464.999 462.266 467.564 455 473.251 455Z" fill="#995200" transform="translate(-1.5,-1.5)"/>
<path d="M501.008 450.465H550.008V460.465C550.008 464.883 546.426 468.465 542.008 468.465H509.008C504.59 468.465 501.008 464.883 501.008 460.465V450.465Z" fill="white" transform="translate(-1.5,6.1)"/>`,
    extras: '',
  },
  crying: {
    eyeRightCornea: `<circle cx="474.856" cy="383.856" r="33.8558" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="383.856" r="33.8558" fill="white"/>`,
    eyeRightIris:   `<circle cx="481" cy="395" r="18.5" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="570" cy="395" r="18.5" fill="#995200"/>`,
    eyeRightExtra: `<ellipse cx="452" cy="426" rx="9" ry="19" fill="#87CEEB" opacity="0.85"/>
<ellipse cx="458" cy="446" rx="7" ry="13" fill="#87CEEB" opacity="0.7"/>`,
    eyeLeftExtra: `<ellipse cx="597" cy="426" rx="9" ry="19" fill="#87CEEB" opacity="0.85"/>
<ellipse cx="591" cy="446" rx="7" ry="13" fill="#87CEEB" opacity="0.7"/>`,
    eyebrows: `<path d="M418 381L369 397M642 381L676.5 397" fill="none" stroke="#995200" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    mouth: `<path d="M471 492 Q524 450 577 492" fill="none" stroke="#995200" stroke-width="12" stroke-linecap="round"/>`,
    extras: '',
  },
};

// ── Animation durations ─────────────────────────────────
const _ANIM_DUR = { slow: 2, normal: 1, fast: 0.5 };

// ── Bubble generators ───────────────────────────────────

function _speechBubble(cx, cy, bw, bh, tailX, tailY, text, opts) {
  const r    = opts.r    || 22;
  const bg   = opts.bg   || '#FFFFFF';
  const bord = opts.bord || '#333333';
  const bsw  = opts.bsw  || 3;
  const tc   = opts.tc   || '#333333';
  const fs   = opts.fs   || 16;
  const ff   = opts.ff   || 'Arial,sans-serif';
  const fw   = opts.fw   || 'normal';
  const fst  = opts.fst  || 'normal';

  const x = cx - bw / 2, y = cy - bh / 2;

  // Find closest bubble edge point to tail tip for tail attachment
  const tailBaseX = Math.max(x + r, Math.min(x + bw - r, tailX));
  const closestEdgeY = tailY < y ? y : y + bh;
  const tb1x = tailBaseX - 14, tb2x = tailBaseX + 14;
  const tby  = closestEdgeY;

  let s = '';
  // Draw tail first so bubble rect overlaps its base
  s += `<polygon points="${tb1x},${tby} ${tb2x},${tby} ${tailX},${tailY}" fill="${bg}"/>`;
  s += `<line x1="${tb1x}" y1="${tby}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
  s += `<line x1="${tb2x}" y1="${tby}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
  // Bubble body
  s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;

  // Text
  const lines  = text ? text.split('\n') : [''];
  const lineH  = fs * 1.35;
  const totalH = lines.length * lineH;
  const startY = cy - totalH / 2 + fs * 0.5;
  lines.forEach((ln, i) => {
    s += `<text x="${cx}" y="${startY + i * lineH}" font-family="${ff}" font-size="${fs}" font-weight="${fw}" font-style="${fst}" fill="${tc}" text-anchor="middle" dominant-baseline="central">${escXml(ln)}</text>`;
  });
  return s;
}

function _thoughtBubble(cx, cy, bw, bh, tailX, tailY, text, opts) {
  const bg  = opts.bg  || '#FFFFFF';
  const bord= opts.bord|| '#333333';
  const bsw = opts.bsw || 3;
  const tc  = opts.tc  || '#333333';
  const fs  = opts.fs  || 16;
  const ff  = opts.ff  || 'Arial,sans-serif';
  const fw  = opts.fw  || 'normal';
  const fst = opts.fst || 'normal';

  // Cloud shape: main ellipse + smaller lobes
  const rx = bw / 2, ry = bh / 2;
  let s = '';
  // Thought trail circles
  const dx = tailX - cx, dy = tailY - cy;
  const dist = Math.hypot(dx, dy);
  const ux = dx / dist, uy = dy / dist;
  [[0.72, 12], [0.85, 8], [0.94, 5]].forEach(([t, r]) => {
    const px = cx + ux * dist * t, py = cy + uy * dist * t;
    s += `<circle cx="${fmt(px)}" cy="${fmt(py)}" r="${r}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;
  });
  // Cloud lobes (decorative bumps around ellipse)
  const lobes = 6;
  for (let i = 0; i < lobes; i++) {
    const ang = (i / lobes) * Math.PI * 2;
    const lx = cx + Math.cos(ang) * (rx * 0.78), ly = cy + Math.sin(ang) * (ry * 0.78);
    const lr = Math.min(rx, ry) * 0.42;
    s += `<circle cx="${fmt(lx)}" cy="${fmt(ly)}" r="${fmt(lr)}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;
  }
  // Main ellipse
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;
  // Text
  const lines  = text ? text.split('\n') : [''];
  const lineH  = fs * 1.35;
  const totalH = lines.length * lineH;
  const startY = cy - totalH / 2 + fs * 0.5;
  lines.forEach((ln, i) => {
    s += `<text x="${cx}" y="${startY + i * lineH}" font-family="${ff}" font-size="${fs}" font-weight="${fw}" font-style="${fst}" fill="${tc}" text-anchor="middle" dominant-baseline="central">${escXml(ln)}</text>`;
  });
  return s;
}

function _shoutBurst(cx, cy, r, text, opts) {
  const bg  = opts.bg  || '#FFF176';
  const bord= opts.bord|| '#333333';
  const bsw = opts.bsw || 3;
  const tc  = opts.tc  || '#333333';
  const fs  = opts.fs  || 16;
  const ff  = opts.ff  || 'Arial,sans-serif';
  const fw  = opts.fw  || 'bold';
  const fst = opts.fst || 'normal';
  const spikes = 12;
  const innerR = r * 0.65;

  let pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : innerR;
    pts.push(`${fmt(cx + Math.cos(ang) * rad)},${fmt(cy + Math.sin(ang) * rad)}`);
  }
  let s = `<polygon points="${pts.join(' ')}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
  const lines  = text ? text.split('\n') : [''];
  const lineH  = fs * 1.35;
  const totalH = lines.length * lineH;
  const startY = cy - totalH / 2 + fs * 0.5;
  lines.forEach((ln, i) => {
    s += `<text x="${cx}" y="${startY + i * lineH}" font-family="${ff}" font-size="${fs}" font-weight="${fw}" font-style="${fst}" fill="${tc}" text-anchor="middle" dominant-baseline="central">${escXml(ln)}</text>`;
  });
  return s;
}

// ── Convert original char coords → canvas coords ────────
function _toCanvas(ox, oy, tx, ty) {
  return { x: (ox - 520) * 0.75 + tx, y: (oy - 635) * 0.75 + ty };
}

// ── Main character generator ─────────────────────────────
function generateCharacter() {
  const emotion    = val('char-emotion') || 'happy';
  const animated   = chk('char-animate');
  const animType   = val('char-anim-type')  || 'bounce';
  const animSpeed  = val('char-anim-speed') || 'normal';
  const bubbleType = val('char-bubble-type') || 'none';
  const bubblePos  = val('char-bubble-pos')  || 'top-right';
  const bubbleText = val('char-bubble-text') || '';
  const sizeName   = val('char-size')  || 'medium';
  const bgEnable   = chk('char-bg-enable');
  const bgColor    = val('char-bg-color') || '#FFFFFF';

  // Bubble text opts
  const bOpts = {
    bg:   val('char-bubble-bg')    || '#FFFFFF',
    bord: val('char-bubble-border')|| '#333333',
    bsw:  3,
    tc:   val('char-bubble-tc')    || '#333333',
    fs:   Math.max(8, num('char-bubble-fs') || 16),
    ff:   val('char-bubble-ff')    || 'Arial,sans-serif',
    fw:   val('char-bubble-fw')    || 'normal',
    fst:  val('char-bubble-fstyle')|| 'normal',
    r:    22,
  };

  // Output dimensions
  const sizeMap = { small: 280, medium: 360, large: 470, xlarge: 580 };
  const outW = sizeMap[sizeName] || 360;

  // Canvas viewBox: 900 × 800 for all positions
  const vx = 0, vy = 0, vw = 900, vh = 800;
  const outH = Math.round(outW * vh / vw);

  // Character positioning — shift to make room for bubble
  const CHAR_CX_R = 280; // char center-x when bubble on right
  const CHAR_CX_L = 620; // char center-x when bubble on left
  const CHAR_CY   = 430;

  const hasBubble  = bubbleType !== 'none' && bubbleText.trim() !== '';
  const isLeftSide = bubblePos === 'left' || bubblePos === 'top-left';
  const charTX = hasBubble ? (isLeftSide ? CHAR_CX_L : CHAR_CX_R) : 450;
  const charTY = CHAR_CY;

  // ── Build character inner SVG ───────────────────────────
  const em = JIGGI_EMOTIONS[emotion] || JIGGI_EMOTIONS.happy;

  // Left hand: normal or waving
  const doWave = animated && animType === 'wave';
  const leftHandGroup = doWave
    ? `<g>
        <animateTransform attributeName="transform" type="rotate"
          values="0 ${_WAVE_PIVOT.x} ${_WAVE_PIVOT.y};-35 ${_WAVE_PIVOT.x} ${_WAVE_PIVOT.y};0 ${_WAVE_PIVOT.x} ${_WAVE_PIVOT.y}"
          dur="${_ANIM_DUR[animSpeed]}s" repeatCount="indefinite" calcMode="ease"/>
        ${_J.leftHand}
      </g>`
    : _J.leftHand;

  const charInner = `
    ${_J.rightLeg}
    ${_J.leftLeg}
    ${_J.rightHand}
    ${leftHandGroup}
    ${_J.bodyFill}
    ${_J.bodyD1}${_J.bodyD2}${_J.bodyD3}${_J.bodyD4}
    ${_J.bodyStroke}
    ${em.eyeRightCornea}
    ${em.eyeLeftCornea}
    ${em.eyeRightIris}
    ${em.eyeLeftIris}
    ${em.eyeRightExtra}
    ${em.eyeLeftExtra}
    ${_J.eyeRightOutline}
    ${_J.eyeLeftOutline}
    ${em.eyebrows}
    ${em.mouth}
    ${em.extras}`;

  // ── Animation wrapper ────────────────────────────────────
  const dur = _ANIM_DUR[animSpeed] || 1;
  let animEl = '';
  if (animated) {
    if (animType === 'bounce') {
      animEl = `<animateTransform attributeName="transform" type="translate"
        values="0 0;0 -35;0 0" dur="${dur}s" repeatCount="indefinite" additive="sum" calcMode="ease"/>`;
    } else if (animType === 'float') {
      animEl = `<animateTransform attributeName="transform" type="translate"
        values="0 0;0 -18;0 0" dur="${dur * 2}s" repeatCount="indefinite" additive="sum" calcMode="ease"/>`;
    } else if (animType === 'shake') {
      animEl = `<animateTransform attributeName="transform" type="translate"
        values="0 0;-12 0;12 0;-12 0;0 0" dur="${dur * 0.5}s" repeatCount="indefinite" additive="sum"/>`;
    }
    // 'wave' is handled above on the leftHand subgroup
  }

  const charTransform = `translate(${charTX}, ${charTY}) scale(0.75) translate(-520, -635)`;
  const charGroup = `<g transform="${charTransform}">${animEl}${charInner}</g>`;

  // ── Bubble ───────────────────────────────────────────────
  let bubbleSVG = '';
  if (bubbleType !== 'none' && bubbleText.trim() !== '') {
    // Estimate lines to size the bubble
    const lines = bubbleText.split('\n');
    const maxChars = Math.max(...lines.map(l => l.length));
    const bw = Math.min(420, Math.max(160, maxChars * (bOpts.fs * 0.62) + 40));
    const bh = lines.length * (bOpts.fs * 1.4) + 36;

    // Bubble placement — all positions at mouth height, to the side of the character
    const mouthCanvas = _toCanvas(524, 468, charTX, charTY);

    // Approx character body edge at mouth level (original x ≈ 710 right, 338 left)
    const bodyEdgeRightX = _toCanvas(710, 468, charTX, charTY).x;
    const bodyEdgeLeftX  = _toCanvas(338, 468, charTX, charTY).x;

    // Bubble center slightly above mouth; arrow tip stops short of touching character
    const bcy    = mouthCanvas.y - 25;
    const ARROW_GAP = 20;

    let bcx, tailX, tailY;

    if (!isLeftSide) {
      // Bubble on right side
      tailX = bodyEdgeRightX + ARROW_GAP;
      tailY = mouthCanvas.y;
      bcx   = Math.min(vw - bw / 2 - 15, bodyEdgeRightX + bw / 2 + 35);
    } else {
      // Bubble on left side
      tailX = bodyEdgeLeftX - ARROW_GAP;
      tailY = mouthCanvas.y;
      bcx   = Math.max(bw / 2 + 15, bodyEdgeLeftX - bw / 2 - 35);
    }

    if (bubbleType === 'speech') {
      bubbleSVG = _speechBubble(bcx, bcy, bw, bh, tailX, tailY, bubbleText, bOpts);
    } else if (bubbleType === 'thought') {
      bubbleSVG = _thoughtBubble(bcx, bcy, bw, bh, tailX, tailY, bubbleText, bOpts);
    } else if (bubbleType === 'shout') {
      const br = Math.max(bw, bh) / 2 + 20;
      bubbleSVG = _shoutBurst(bcx, bcy, br, bubbleText, { ...bOpts, fw: bOpts.fw === 'normal' ? 'bold' : bOpts.fw });
    }
  }

  // ── Assemble output SVG ──────────────────────────────────
  const bgRect = bgEnable
    ? `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bgColor}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${outW}" height="${outH}">
  ${bgRect}
  ${charGroup}
  ${bubbleSVG}
</svg>`;
}
