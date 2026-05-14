'use strict';

/* ═══════════════════════════════════════════════════════
   SVG CHARACTER GENERATOR  —  Jiggi & Froggie
   Canvas: 900 × 800 viewBox units
   Jiggi transform:   translate(tx,430) scale(0.75) translate(-520,-635)
   Froggie transform: translate(tx,430) scale(0.75) translate(-503,-490)
═══════════════════════════════════════════════════════ */

// ── Jiggi base body parts ───────────────────────────────
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

const _WAVE_PIVOT = { x: 725, y: 531 };

// ── Jiggi emotions ──────────────────────────────────────
const JIGGI_EMOTIONS = {
  happy: {
    eyeRightCornea: `<circle cx="474.856" cy="383.856" r="33.8558" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="575.734" cy="383.856" r="33.8558" fill="white"/>`,
    eyeRightIris:   `<circle cx="482.5" cy="390.5" r="18.5" fill="#995200"/>`,
    eyeLeftIris:    `<circle cx="568.5" cy="390.5" r="18.5" fill="#995200"/>`,
    eyeRightExtra: '', eyeLeftExtra: '',
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
    eyeRightExtra: '', eyeLeftExtra: '',
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
    eyeRightExtra: '', eyeLeftExtra: '',
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

// ── Froggie base body parts ─────────────────────────────
// Original viewBox: 0 0 900 900  |  Pivot used: (503, 490)
const _F = {
  shadow: `<ellipse cx="503" cy="800" rx="220" ry="22" fill="#2db84a" opacity="0.4"/>`,

  // Character's LEFT leg (viewer's right side)
  leftLeg: `<path d="M659.916 635.454C655.093 636.515 646.454 640.219 635.507 650.37C623.554 661.453 604.899 660.726 593.841 648.745C582.783 636.764 583.509 618.067 595.462 606.983C614.125 589.679 635.232 578.302 656.275 576.3C678.402 574.195 701.524 583.079 712.798 606.071C722.945 626.764 719.524 651.204 709.936 673.443C706.662 681.038 702.481 688.867 697.366 696.895H742.516C747.986 696.895 753.109 698.389 757.5 700.991L792 688L769.027 713.5C769.652 714.784 770.188 716.12 770.624 717.5L810.5 726.448L769.869 737.499C768.69 740.428 767.056 743.124 765.055 745.5L777 766.5L754 753.674C750.47 755.172 746.59 756 742.516 756H634.222C622.196 756 611.375 748.679 606.877 737.499C602.38 726.32 605.107 713.523 613.77 705.161C637.284 682.464 649.932 663.62 655.805 649.998C658.815 643.017 659.715 638.306 659.916 635.454Z" fill="#149A53" stroke="#005E2C" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="781" cy="765.5" rx="11" ry="10.5" fill="#149A53" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="811" cy="727.5" rx="11" ry="10.5" fill="#149A53" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="789" cy="687.5" rx="11" ry="10.5" fill="#149A53" stroke="#005E2C" stroke-width="10"/>`,

  // Character's RIGHT leg (viewer's left side)
  rightLeg: `<path d="M347.084 635.454C351.907 636.515 360.546 640.219 371.493 650.37C383.446 661.453 402.101 660.726 413.159 648.745C424.217 636.764 423.491 618.067 411.538 606.983C392.875 589.679 371.768 578.302 350.725 576.3C328.598 574.195 305.476 583.079 294.202 606.071C284.055 626.764 287.476 651.204 297.064 673.443C300.338 681.038 304.519 688.867 309.634 696.895H264.484C259.014 696.895 253.891 698.389 249.5 700.991L215 688L237.973 713.5C237.348 714.784 236.812 716.12 236.376 717.5L196.5 726.448L237.131 737.499C238.31 740.428 239.944 743.124 241.945 745.5L230 766.5L253 753.674C256.53 755.172 260.41 756 264.484 756H372.778C384.804 756 395.625 748.679 400.123 737.499C404.62 726.32 401.893 713.523 393.23 705.161C369.716 682.464 357.068 663.62 351.195 649.998C348.185 643.017 347.285 638.306 347.084 635.454Z" fill="#149A53" stroke="#005E2C" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="11" cy="10.5" rx="11" ry="10.5" transform="matrix(-1 0 0 1 237 755)" fill="#149A53" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="11" cy="10.5" rx="11" ry="10.5" transform="matrix(-1 0 0 1 207 717)" fill="#149A53" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="11" cy="10.5" rx="11" ry="10.5" transform="matrix(-1 0 0 1 229 677)" fill="#149A53" stroke="#005E2C" stroke-width="10"/>`,

  // Body ellipse + belly highlight
  body: `<path d="M503.372 457.858C557.859 457.858 606.982 473.781 642.357 499.274C677.74 524.773 699.061 559.561 699.061 597.484C699.06 635.407 677.74 670.195 642.357 695.693C606.982 721.187 557.859 737.109 503.372 737.109C448.885 737.109 399.762 721.187 364.387 695.693C329.004 670.195 307.684 635.407 307.684 597.484C307.684 559.561 329.004 524.773 364.387 499.274C399.762 473.781 448.885 457.858 503.372 457.858Z" fill="#3DD771" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="504.186" cy="642.984" rx="136.501" ry="78.0004" fill="#AFE8C2"/>`,

  // Character's LEFT hand (viewer's right) — in front of body
  leftHand: `<path d="M629.081 494.658C644.703 500.178 652.892 517.318 647.371 532.939L571.74 746.969C570.695 749.926 569.234 752.616 567.446 754.998L570.751 793.287L553.632 765.195C549.602 766.652 545.244 767.255 540.845 766.868L521.797 798.26L526.702 761.87C523.036 759.407 520.025 756.2 517.804 752.535L486.365 763.467L513.464 735.922C513.569 732.946 514.123 729.935 515.168 726.979L590.799 512.949C596.32 497.327 613.459 489.138 629.081 494.658Z" fill="#3DD771" stroke="#005E2C" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="487.198" cy="761.11" rx="11" ry="10.5" transform="rotate(19.4618 487.198 761.11)" fill="#3DD771" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="525.182" cy="794.683" rx="11" ry="10.5" transform="rotate(19.4618 525.182 794.683)" fill="#3DD771" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="572.056" cy="791.096" rx="11" ry="10.5" transform="rotate(19.4618 572.056 791.096)" fill="#3DD771" stroke="#005E2C" stroke-width="10"/>`,

  // Character's RIGHT hand (viewer's left) — rendered BEHIND body
  rightHand: `<path d="M409.729 490.568C406.776 506.872 391.165 517.694 374.862 514.741L151.497 474.278C148.412 473.719 145.523 472.707 142.886 471.323L105.617 480.703L130.612 459.316C128.53 455.57 127.239 451.364 126.918 446.96L92.8855 433.173L129.592 432.2C131.437 428.188 134.122 424.703 137.386 421.925L121.57 392.637L153.091 414.986C156.046 414.615 159.107 414.68 162.192 415.239L385.557 455.701C401.86 458.655 412.682 474.265 409.729 490.568Z" fill="#3DD771" stroke="#005E2C" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="124.031" cy="393.082" rx="11" ry="10.5" transform="rotate(100.268 124.031 393.082)" fill="#3DD771" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="96.9569" cy="435.942" rx="11" ry="10.5" transform="rotate(100.268 96.9569 435.942)" fill="#3DD771" stroke="#005E2C" stroke-width="10"/>
<ellipse cx="107.988" cy="481.641" rx="11" ry="10.5" transform="rotate(100.268 107.988 481.641)" fill="#3DD771" stroke="#005E2C" stroke-width="10"/>`,

  // Head (complex masked shape with eye bumps)
  head: `<mask id="froggie-head-mask" fill="white">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M253.529 187.018C253.529 209.28 260.202 229.983 271.656 247.237C227.133 278.746 200.306 319.43 200.306 363.85C200.306 463.882 336.356 544.974 504.183 544.974C672.009 544.974 808.059 463.882 808.059 363.85C808.059 315.891 776.787 272.285 725.733 239.883C734.432 224.225 739.386 206.2 739.386 187.018C739.386 126.809 690.577 78 630.368 78C571.5 78 523.53 124.659 521.422 183.012C515.716 182.822 509.968 182.726 504.183 182.726C493.147 182.726 482.248 183.076 471.517 183.76C469.794 125.058 421.666 78 362.547 78C302.338 78 253.529 126.809 253.529 187.018Z"/>
</mask>
<path fill-rule="evenodd" clip-rule="evenodd" d="M253.529 187.018C253.529 209.28 260.202 229.983 271.656 247.237C227.133 278.746 200.306 319.43 200.306 363.85C200.306 463.882 336.356 544.974 504.183 544.974C672.009 544.974 808.059 463.882 808.059 363.85C808.059 315.891 776.787 272.285 725.733 239.883C734.432 224.225 739.386 206.2 739.386 187.018C739.386 126.809 690.577 78 630.368 78C571.5 78 523.53 124.659 521.422 183.012C515.716 182.822 509.968 182.726 504.183 182.726C493.147 182.726 482.248 183.076 471.517 183.76C469.794 125.058 421.666 78 362.547 78C302.338 78 253.529 126.809 253.529 187.018Z" fill="#3DD771"/>
<path d="M271.656 247.237L277.433 255.4L285.356 249.793L279.987 241.706L271.656 247.237ZM725.733 239.883L716.991 235.026L712.411 243.272L720.374 248.326L725.733 239.883ZM521.422 183.012L521.089 193.007L531.056 193.339L531.416 183.373L521.422 183.012ZM471.517 183.76L461.521 184.053L461.825 194.398L472.152 193.74L471.517 183.76ZM279.987 241.706C269.587 226.041 263.529 207.252 263.529 187.018H243.529C243.529 211.308 250.816 233.926 263.325 252.768L279.987 241.706ZM210.306 363.85C210.306 323.789 234.496 285.786 277.433 255.4L265.88 239.075C219.77 271.706 190.306 315.072 190.306 363.85H210.306ZM504.183 534.974C421.759 534.974 347.623 515.04 294.429 483.334C241.026 451.503 210.306 408.941 210.306 363.85H190.306C190.306 418.791 227.611 466.791 284.19 500.514C340.977 534.362 418.78 554.974 504.183 554.974V534.974ZM798.059 363.85C798.059 408.941 767.339 451.503 713.936 483.334C660.742 515.04 586.607 534.974 504.183 534.974V554.974C589.585 554.974 667.388 534.362 724.176 500.514C780.754 466.791 818.059 418.791 818.059 363.85H798.059ZM720.374 248.326C769.833 279.716 798.059 320.609 798.059 363.85H818.059C818.059 311.173 783.74 264.854 731.092 231.44L720.374 248.326ZM729.386 187.018C729.386 204.457 724.886 220.816 716.991 235.026L734.475 244.739C743.977 227.633 749.386 207.942 749.386 187.018H729.386ZM630.368 88C685.054 88 729.386 132.332 729.386 187.018H749.386C749.386 121.286 696.099 68 630.368 68V88ZM531.416 183.373C533.33 130.379 576.902 88 630.368 88V68C566.098 68 513.73 118.939 511.429 182.651L531.416 183.373ZM504.183 192.726C509.857 192.726 515.494 192.82 521.089 193.007L521.755 173.018C515.938 172.824 510.079 172.726 504.183 172.726V192.726ZM472.152 193.74C482.672 193.07 493.358 192.726 504.183 192.726V172.726C492.935 172.726 481.825 173.083 470.881 173.78L472.152 193.74ZM362.547 88C416.241 88 459.956 130.742 461.521 184.053L481.512 183.467C479.631 119.375 427.09 68 362.547 68V88ZM263.529 187.018C263.529 132.332 307.861 88 362.547 88V68C296.815 68 243.529 121.286 243.529 187.018H263.529Z" fill="#005E2C" mask="url(#froggie-head-mask)"/>`,
};

// Wave pivot for Froggie's left hand (shoulder attachment point)
const _FROGGIE_WAVE_PIVOT = { x: 629, y: 494 };

// ── Froggie emotions ────────────────────────────────────
const FROGGIE_EMOTIONS = {
  happy: {
    eyeRightCornea: `<circle cx="361.443" cy="180.757" r="58.1241" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="634.417" cy="180.757" r="58.1241" fill="white"/>`,
    eyeRightIris:   `<ellipse cx="360.831" cy="181.006" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeLeftIris:    `<ellipse cx="633.806" cy="181.006" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeRightExtra: '', eyeLeftExtra: '',
    eyebrows: '',
    mouth: `<path d="M618.438 291.939C618.024 338.92 564.609 376 499.132 374.761C433.656 373.521 380.913 334.431 381.327 287.45" stroke="#005E2C" stroke-width="10" stroke-linecap="round"/>`,
    extras: '',
  },
  sad: {
    eyeRightCornea: `<circle cx="361.443" cy="180.757" r="58.1241" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="634.417" cy="180.757" r="58.1241" fill="white"/>`,
    eyeRightIris:   `<ellipse cx="360.831" cy="193" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeLeftIris:    `<ellipse cx="633.806" cy="193" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeRightExtra: '', eyeLeftExtra: '',
    eyebrows: `<path d="M303 128 L419 150 M580 150 L696 128" fill="none" stroke="#005E2C" stroke-width="9" stroke-linecap="round"/>`,
    mouth: `<path d="M381 295 C381 258 499 248 618 295" fill="none" stroke="#005E2C" stroke-width="10" stroke-linecap="round"/>`,
    extras: '',
  },
  surprised: {
    eyeRightCornea: `<circle cx="361.443" cy="177" r="70" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="634.417" cy="177" r="70" fill="white"/>`,
    eyeRightIris:   `<ellipse cx="361" cy="177" rx="30" ry="30" fill="#005E2C"/>`,
    eyeLeftIris:    `<ellipse cx="634" cy="177" rx="30" ry="30" fill="#005E2C"/>`,
    eyeRightExtra: `<circle cx="350" cy="166" r="11" fill="white" opacity="0.7"/>`,
    eyeLeftExtra:  `<circle cx="623" cy="166" r="11" fill="white" opacity="0.7"/>`,
    eyebrows: '',
    mouth: `<ellipse cx="499" cy="328" rx="38" ry="45" fill="#005E2C"/>`,
    extras: '',
  },
  angry: {
    eyeRightCornea: `<circle cx="361.443" cy="183" r="54" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="634.417" cy="183" r="54" fill="white"/>`,
    eyeRightIris:   `<ellipse cx="360.831" cy="196" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeLeftIris:    `<ellipse cx="633.806" cy="196" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeRightExtra: `<line x1="303" y1="152" x2="420" y2="172" stroke="#3DD771" stroke-width="18" stroke-linecap="round"/>`,
    eyeLeftExtra:  `<line x1="580" y1="172" x2="697" y2="152" stroke="#3DD771" stroke-width="18" stroke-linecap="round"/>`,
    eyebrows: `<path d="M310 141 L419 166 M580 166 L689 141" fill="none" stroke="#005E2C" stroke-width="9" stroke-linecap="round"/>`,
    mouth: `<path d="M420 295 C420 308 499 313 578 295" fill="none" stroke="#005E2C" stroke-width="10" stroke-linecap="round"/>`,
    extras: '',
  },
  excited: {
    eyeRightCornea: `<circle cx="361.443" cy="174" r="68" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="634.417" cy="174" r="68" fill="white"/>`,
    eyeRightIris:   `<ellipse cx="361" cy="168" rx="28" ry="28" fill="#005E2C"/>`,
    eyeLeftIris:    `<ellipse cx="634" cy="168" rx="28" ry="28" fill="#005E2C"/>`,
    eyeRightExtra: `<circle cx="350" cy="158" r="11" fill="white" opacity="0.75"/>`,
    eyeLeftExtra:  `<circle cx="623" cy="158" r="11" fill="white" opacity="0.75"/>`,
    eyebrows: '',
    mouth: `<path d="M361 290 C361 392 499 418 637 290Z" fill="#005E2C"/>
<rect x="381" y="290" width="236" height="26" fill="white" rx="3"/>`,
    extras: `<path d="M208 192 L220 174 M214 204 L230 190" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/>
<path d="M796 192 L784 174 M790 204 L774 190" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round"/>`,
  },
  thinking: {
    eyeRightCornea: `<circle cx="361.443" cy="180.757" r="58.1241" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="634.417" cy="180.757" r="58.1241" fill="white"/>`,
    eyeRightIris:   `<ellipse cx="352" cy="174" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeLeftIris:    `<ellipse cx="633.806" cy="188" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeRightExtra: '', eyeLeftExtra: '',
    eyebrows: '',
    mouth: `<path d="M430 290 C460 282 525 295 565 310" fill="none" stroke="#005E2C" stroke-width="10" stroke-linecap="round"/>`,
    extras: `<circle cx="672" cy="138" r="7" fill="#005E2C" opacity="0.35"/>
<circle cx="695" cy="116" r="6" fill="#005E2C" opacity="0.3"/>
<circle cx="716" cy="96" r="5" fill="#005E2C" opacity="0.25"/>`,
  },
  winking: {
    eyeRightCornea: '',
    eyeLeftCornea:  `<circle cx="634.417" cy="180.757" r="58.1241" fill="white"/>`,
    eyeRightIris:   '',
    eyeLeftIris:    `<ellipse cx="633.806" cy="181.006" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeRightExtra: `<ellipse cx="361" cy="181" rx="62" ry="28" fill="#3DD771"/>
<path d="M303 177 Q361 201 419 177" fill="none" stroke="#005E2C" stroke-width="10" stroke-linecap="round"/>`,
    eyeLeftExtra: '',
    eyebrows: '',
    mouth: `<path d="M618.438 291.939C618.024 338.92 564.609 376 499.132 374.761C433.656 373.521 380.913 334.431 381.327 287.45" stroke="#005E2C" stroke-width="10" stroke-linecap="round"/>`,
    extras: '',
  },
  crying: {
    eyeRightCornea: `<circle cx="361.443" cy="180.757" r="58.1241" fill="white"/>`,
    eyeLeftCornea:  `<circle cx="634.417" cy="180.757" r="58.1241" fill="white"/>`,
    eyeRightIris:   `<ellipse cx="360.831" cy="193" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeLeftIris:    `<ellipse cx="633.806" cy="193" rx="26.6107" ry="25.7522" fill="#005E2C"/>`,
    eyeRightExtra: `<ellipse cx="338" cy="244" rx="9" ry="20" fill="#87CEEB" opacity="0.85"/>
<ellipse cx="344" cy="268" rx="7" ry="14" fill="#87CEEB" opacity="0.7"/>`,
    eyeLeftExtra: `<ellipse cx="658" cy="244" rx="9" ry="20" fill="#87CEEB" opacity="0.85"/>
<ellipse cx="652" cy="268" rx="7" ry="14" fill="#87CEEB" opacity="0.7"/>`,
    eyebrows: `<path d="M303 128 L419 150 M580 150 L696 128" fill="none" stroke="#005E2C" stroke-width="9" stroke-linecap="round"/>`,
    mouth: `<path d="M381 295 C381 258 499 248 618 295" fill="none" stroke="#005E2C" stroke-width="10" stroke-linecap="round"/>`,
    extras: '',
  },
};

// ── Animation durations ─────────────────────────────────
const _ANIM_DUR = { slow: 2, normal: 1, fast: 0.5 };

// ── Eye-roll animation injector ─────────────────────────
// Injects a SMIL <animate> into a self-closing iris element string.
function _addIrisAnim(irisStr, axis, delta, dur) {
  if (!irisStr) return irisStr;
  const re = new RegExp(` ${axis}="([^"]+)"`);
  const m  = irisStr.match(re);
  if (!m) return irisStr;
  const base   = parseFloat(m[1]);
  const target = parseFloat((base + delta).toFixed(3));
  const anim   = `<animate attributeName="${axis}" values="${base};${target};${base}" dur="${dur}s" repeatCount="indefinite" calcMode="ease"/>`;
  const tag    = (irisStr.match(/^<(\w+)/) || [])[1] || 'circle';
  return irisStr.replace('/>', `>${anim}</${tag}>`);
}

// ── Bubble generators ───────────────────────────────────

function _speechBubble(cx, cy, bw, bh, tailX, tailY, text, opts) {
  const r    = opts.r    || 22;
  const bg   = opts.bg   || '#FFFFFF';
  const bord = opts.bord || '#333333';
  const bsw  = opts.bsw  || 3;
  const tw   = opts.tw   || 14;
  const tc   = opts.tc   || '#333333';
  const fs   = opts.fs   || 16;
  const ff   = opts.ff   || 'Arial,sans-serif';
  const fw   = opts.fw   || 'normal';
  const fst  = opts.fst  || 'normal';

  const x = cx - bw / 2, y = cy - bh / 2;
  let s = '';

  if (tailX < x) {
    // Tail to the LEFT — side arrow on left edge (bubble right of character)
    const tyBase = Math.max(y + r, Math.min(y + bh - r, tailY));
    const tt1y = tyBase - tw, tt2y = tyBase + tw;
    s += `<polygon points="${x},${tt1y} ${x},${tt2y} ${tailX},${tailY}" fill="${bg}"/>`;
    s += `<line x1="${x}" y1="${tt1y}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
    s += `<line x1="${x}" y1="${tt2y}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;
    s += `<line x1="${x + bsw * 0.6}" y1="${tt1y}" x2="${x + bsw * 0.6}" y2="${tt2y}" stroke="${bg}" stroke-width="${bsw * 1.6}"/>`;
  } else if (tailX > x + bw) {
    // Tail to the RIGHT — side arrow on right edge (bubble left of character)
    const ex = x + bw;
    const tyBase = Math.max(y + r, Math.min(y + bh - r, tailY));
    const tt1y = tyBase - tw, tt2y = tyBase + tw;
    s += `<polygon points="${ex},${tt1y} ${ex},${tt2y} ${tailX},${tailY}" fill="${bg}"/>`;
    s += `<line x1="${ex}" y1="${tt1y}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
    s += `<line x1="${ex}" y1="${tt2y}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;
    s += `<line x1="${ex - bsw * 0.6}" y1="${tt1y}" x2="${ex - bsw * 0.6}" y2="${tt2y}" stroke="${bg}" stroke-width="${bsw * 1.6}"/>`;
  } else {
    // Tail above or below the box (top position)
    const tailBaseX = Math.max(x + r, Math.min(x + bw - r, tailX));
    const closestEdgeY = tailY < y ? y : y + bh;
    const tb1x = tailBaseX - tw, tb2x = tailBaseX + tw;
    s += `<polygon points="${tb1x},${closestEdgeY} ${tb2x},${closestEdgeY} ${tailX},${tailY}" fill="${bg}"/>`;
    s += `<line x1="${tb1x}" y1="${closestEdgeY}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
    s += `<line x1="${tb2x}" y1="${closestEdgeY}" x2="${tailX}" y2="${tailY}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;
  }

  const lines  = text ? text.split('\n') : [''];
  const lineH  = fs * 1.35;
  const totalH = lines.length * lineH;
  const startY = cy - totalH / 2 + fs * 0.5;
  lines.forEach((ln, i) => {
    s += `<text x="${cx}" y="${startY + i * lineH}" font-family="${ff}" font-size="${fs}" font-weight="${fw}" font-style="${fst}" fill="${tc}" text-anchor="middle" dominant-baseline="central">${escXml(ln)}</text>`;
  });
  return s;
}

// Guide-spec dialog box: rounded rect, drop shadow, thin border, corner arrow
function _dialogBox(cx, cy, bw, bh, tailX, tailY, text, opts) {
  const bg   = opts.bg   || '#FFFFFF';
  const bord = opts.bord || '#CCCCCC';
  const tc   = opts.tc   || '#333333';
  const fs   = opts.fs   || 40;
  const ff   = opts.ff   || "'Nunito','Arial Rounded MT Bold',Arial,sans-serif";
  const fw   = opts.fw   || '500';
  const fst  = opts.fst  || 'normal';
  const tw   = opts.tw   || 25;
  const r    = Math.max(8, Math.round(tw * 0.6));
  const bsw  = Math.max(1.5, opts.bsw * 0.5 || 2);

  const x = cx - bw / 2, y = cy - bh / 2;
  const boxBottom = y + bh;

  // Arrow: centre-bottom when tail is below the box (top position), otherwise bottom corner
  let ab1x, ab2x;
  if (tailY > boxBottom) {
    ab1x = cx - tw;
    ab2x = cx + tw;
  } else {
    const arrowAtRight = tailX > cx;
    if (arrowAtRight) {
      ab1x = x + bw - r - tw;
      ab2x = x + bw - r;
    } else {
      ab1x = x + r;
      ab2x = x + r + tw;
    }
  }

  let s = '';
  // Drop shadow (offset rect, no filter needed)
  s += `<rect x="${x + 3}" y="${y + 3}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="rgba(0,0,0,0.10)" stroke="none"/>`;
  // Arrow polygon (drawn before box so box overlaps the base)
  s += `<polygon points="${ab1x},${boxBottom} ${ab2x},${boxBottom} ${tailX},${tailY}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;
  // Seam cover line to hide arrow-box join
  s += `<line x1="${ab1x}" y1="${boxBottom - 0.5}" x2="${ab2x}" y2="${boxBottom - 0.5}" stroke="${bg}" stroke-width="${bsw + 1.5}"/>`;
  // Box
  s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;

  // Text
  const lines  = text ? text.split('\n') : [''];
  const lineH  = fs * 1.4;
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

  const rx = bw / 2, ry = bh / 2;
  // Bump radii: 5 equal bumps span the full width, slightly taller than wide
  const N = 5, brx = rx / N, bry = brx * 1.35;

  let s = '';

  // Two trailing spheres from the character toward the cloud
  const dx = tailX - cx, dy = tailY - cy;
  const dist = Math.hypot(dx, dy);
  const ux = dx / dist, uy = dy / dist;
  const r1 = Math.max(6, Math.round(bsw * 3));
  const r2 = Math.max(10, Math.round(bsw * 5));
  s += `<circle cx="${fmt(cx + ux*dist*0.90)}" cy="${fmt(cy + uy*dist*0.90)}" r="${r1}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;
  s += `<circle cx="${fmt(cx + ux*dist*0.75)}" cy="${fmt(cy + uy*dist*0.75)}" r="${r2}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}"/>`;

  // Cloud path: N bumps going left across the top, smooth arc across the bottom
  let d = `M ${fmt(cx + rx)} ${fmt(cy)} `;
  for (let i = 0; i < N; i++) {
    d += `A ${fmt(brx)} ${fmt(bry)} 0 0 1 ${fmt(cx + rx - (i + 1) * 2 * brx)} ${fmt(cy)} `;
  }
  d += `A ${fmt(rx)} ${fmt(ry * 0.72)} 0 0 0 ${fmt(cx + rx)} ${fmt(cy)} Z`;
  s += `<path d="${d}" fill="${bg}" stroke="${bord}" stroke-width="${bsw}" stroke-linejoin="round"/>`;

  // Text centred slightly into the bottom-arc half of the cloud
  const textCY  = cy + ry * 0.12;
  const lines   = text ? text.split('\n') : [''];
  const lineH   = fs * 1.35;
  const totalH  = lines.length * lineH;
  const startY  = textCY - totalH / 2 + fs * 0.5;
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
function _toCanvas(ox, oy, pivotX, pivotY, tx, ty) {
  return { x: (ox - pivotX) * 0.75 + tx, y: (oy - pivotY) * 0.75 + ty };
}

// ── Main character generator ─────────────────────────────
function generateCharacter() {
  const charName   = val('char-name')  || 'jiggi';
  const emotion    = val('char-emotion') || 'happy';
  const animated   = chk('char-animate');
  const animType   = val('char-anim-type')  || 'bounce';
  const animSpeed  = val('char-anim-speed') || 'normal';
  const bubbleType = val('char-bubble-type') || 'none';
  const bubblePos  = val('char-bubble-pos')  || 'right';
  const bubbleText = val('char-bubble-text') || '';
  const sizeName   = val('char-size')  || 'medium';
  const bgEnable   = chk('char-bg-enable');
  const bgColor    = val('char-bg-color') || '#FFFFFF';

  const isJiggi   = charName !== 'froggie';
  const EMOTIONS  = isJiggi ? JIGGI_EMOTIONS  : FROGGIE_EMOTIONS;
  const PIVOT     = isJiggi ? { x: 520, y: 635 } : { x: 503, y: 490 };
  const WPIVOT    = isJiggi ? _WAVE_PIVOT : _FROGGIE_WAVE_PIVOT;

  // Output dimensions — needed to scale bubble units
  const sizeMap = { small: 280, medium: 360, large: 470, xlarge: 580 };
  const outW = sizeMap[sizeName] || 360;
  const vx = 0, vw = 900;

  // Bubble text opts
  // char-bubble-fs is a TARGET SCREEN SIZE in px; convert to viewBox units so the
  // bubble stays proportional at every output size (medium 360, large 470, etc.)
  const targetFsPx = Math.max(6, num('char-bubble-fs') || 18);
  const scaledFs   = Math.round(targetFsPx * vw / outW);   // viewBox units
  // Stroke and tail widths also scale with the output
  const scaledBsw  = Math.max(2, Math.round(2 * vw / outW));
  const scaledTw   = Math.max(12, Math.round(10 * vw / outW)); // tail half-width

  const bOpts = {
    bg:   val('char-bubble-bg')    || '#FFFFFF',
    bord: val('char-bubble-border')|| '#333333',
    bsw:  scaledBsw,
    tw:   scaledTw,
    tc:   val('char-bubble-tc')    || '#333333',
    fs:   scaledFs,
    ff:   val('char-bubble-ff')    || 'Arial,sans-serif',
    fw:   val('char-bubble-fw')    || 'normal',
    fst:  val('char-bubble-fstyle')|| 'normal',
    r:    Math.max(14, Math.round(16 * vw / outW)),
  };

  const CHAR_CX_R = 350;
  const CHAR_CX_L = 620;
  const CHAR_CY   = 430;

  const hasBubble  = bubbleType !== 'none' && bubbleText.trim() !== '';
  const isTopPos   = bubblePos === 'top';
  const isLeftSide = bubblePos === 'left';
  const charTX = hasBubble && !isTopPos ? (isLeftSide ? CHAR_CX_L : CHAR_CX_R) : 450;
  const charTY = CHAR_CY;

  // For top bubble, expand the viewBox upward to give room above the character's head
  let vy = 0, vh = 800;
  if (hasBubble && isTopPos) {
    const headRefY   = isJiggi ? 90 : 50;
    const headTopY   = (headRefY - PIVOT.y) * 0.75 + CHAR_CY;
    const linesCount = bubbleText.split('\n').length;
    const estBh      = linesCount * (scaledFs * 1.45) + scaledFs * 1.2;
    const bubbleTop  = headTopY - 35 - estBh;
    if (bubbleTop < 10) { vy = Math.floor(bubbleTop - 10); vh = 800 - vy; }
  }
  const outH = Math.round(outW * vh / vw);

  // ── Emotion ──────────────────────────────────────────────
  const em = EMOTIONS[emotion] || EMOTIONS.happy;

  // ── Eye roll: inject SMIL animation into iris elements ──
  const isEyeRoll = animated && (animType === 'eye-roll-left' || animType === 'eye-roll-right' ||
                                  animType === 'eye-roll-up'   || animType === 'eye-roll-down');
  const dur = _ANIM_DUR[animSpeed] || 1;

  let eyeRightIris = em.eyeRightIris;
  let eyeLeftIris  = em.eyeLeftIris;
  if (isEyeRoll) {
    const axis  = (animType === 'eye-roll-left' || animType === 'eye-roll-right') ? 'cx' : 'cy';
    const delta = (animType === 'eye-roll-right' || animType === 'eye-roll-down') ? 13 : -13;
    eyeRightIris = _addIrisAnim(eyeRightIris, axis, delta, dur);
    eyeLeftIris  = _addIrisAnim(eyeLeftIris,  axis, delta, dur);
  }

  // ── Wave hand group ──────────────────────────────────────
  const doWave = animated && animType === 'wave';
  const waveAnim = doWave
    ? `<animateTransform attributeName="transform" type="rotate"
        values="0 ${WPIVOT.x} ${WPIVOT.y};-35 ${WPIVOT.x} ${WPIVOT.y};0 ${WPIVOT.x} ${WPIVOT.y}"
        dur="${_ANIM_DUR[animSpeed]}s" repeatCount="indefinite" calcMode="ease"/>`
    : '';
  const leftHandGroup = doWave
    ? `<g>${waveAnim}${isJiggi ? _J.leftHand : _F.leftHand}</g>`
    : (isJiggi ? _J.leftHand : _F.leftHand);

  // ── Assemble character inner SVG ─────────────────────────
  let charInner;
  if (isJiggi) {
    charInner = `
    ${_J.rightLeg}
    ${_J.leftLeg}
    ${_J.rightHand}
    ${leftHandGroup}
    ${_J.bodyFill}
    ${_J.bodyD1}${_J.bodyD2}${_J.bodyD3}${_J.bodyD4}
    ${_J.bodyStroke}
    ${em.eyeRightCornea}
    ${em.eyeLeftCornea}
    ${eyeRightIris}
    ${eyeLeftIris}
    ${em.eyeRightExtra}
    ${em.eyeLeftExtra}
    ${_J.eyeRightOutline}
    ${_J.eyeLeftOutline}
    ${em.eyebrows}
    ${em.mouth}
    ${em.extras}`;
  } else {
    // Froggie: rightHand rendered BEFORE body so it appears behind
    charInner = `
    ${_F.rightLeg}
    ${_F.leftLeg}
    ${_F.rightHand}
    ${_F.body}
    ${leftHandGroup}
    ${_F.head}
    ${em.eyeRightCornea}
    ${em.eyeLeftCornea}
    ${eyeRightIris}
    ${eyeLeftIris}
    ${em.eyeRightExtra}
    ${em.eyeLeftExtra}
    ${em.eyebrows}
    ${em.mouth}
    ${em.extras}`;
  }

  // ── Body animation wrapper ────────────────────────────────
  let animEl = '';
  if (animated && !isEyeRoll) {
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
    // 'wave' is handled on the leftHand subgroup; eye rolls are in the iris elements
  }

  const charTransform = `translate(${charTX}, ${charTY}) scale(0.75) translate(-${PIVOT.x}, -${PIVOT.y})`;
  const charGroup = `<g transform="${charTransform}">${animEl}${charInner}</g>`;

  // ── Bubble ───────────────────────────────────────────────
  let bubbleSVG = '';
  if (hasBubble) {
    const lines = bubbleText.split('\n');
    const maxChars = Math.max(...lines.map(l => l.length));
    // bw/bh in viewBox units — bOpts.fs is already scaled so text is targetFsPx on screen
    const bw = Math.min(520, Math.max(200, maxChars * (bOpts.fs * 0.6) + bOpts.fs * 2));
    const bh = lines.length * (bOpts.fs * 1.45) + bOpts.fs * 1.2;

    const mouthCanvas = _toCanvas(
      isJiggi ? 524 : 499,
      isJiggi ? 468 : 332,
      PIVOT.x, PIVOT.y, charTX, charTY
    );

    const bodyEdgeRightX = _toCanvas(isJiggi ? 710 : 699, 468, PIVOT.x, PIVOT.y, charTX, charTY).x;
    const bodyEdgeLeftX  = _toCanvas(isJiggi ? 338 : 307, 468, PIVOT.x, PIVOT.y, charTX, charTY).x;

    const ARROW_LEN = Math.round(30 * vw / outW); // horizontal arrow length in viewBox units

    let bcx, bcy, tailX, tailY;
    if (isTopPos) {
      const headRefY   = isJiggi ? 90 : 50;
      const headTopY   = (headRefY - PIVOT.y) * 0.75 + CHAR_CY;
      tailX = charTX;
      tailY = headTopY + 8;
      bcx   = charTX;
      bcy   = tailY - bh / 2 - 35;
    } else if (!isLeftSide) {
      tailX = bodyEdgeRightX + 10;
      tailY = mouthCanvas.y;
      bcx   = Math.min(vw - bw / 2 - 15, tailX + ARROW_LEN + bw / 2);
      bcy   = mouthCanvas.y - bh * 0.1;
    } else {
      tailX = bodyEdgeLeftX - 10;
      tailY = mouthCanvas.y;
      bcx   = Math.max(bw / 2 + 15, tailX - ARROW_LEN - bw / 2);
      bcy   = mouthCanvas.y - bh * 0.1;
    }

    if (bubbleType === 'speech') {
      bubbleSVG = _speechBubble(bcx, bcy, bw, bh, tailX, tailY, bubbleText, bOpts);
    } else if (bubbleType === 'thought') {
      bubbleSVG = _thoughtBubble(bcx, bcy, bw, bh, tailX, tailY, bubbleText, bOpts);
    } else if (bubbleType === 'shout') {
      const br = Math.max(bw, bh) / 2 + 20;
      bubbleSVG = _shoutBurst(bcx, bcy, br, bubbleText, { ...bOpts, fw: bOpts.fw === 'normal' ? 'bold' : bOpts.fw });
    } else if (bubbleType === 'dialog') {
      bubbleSVG = _dialogBox(bcx, bcy, bw, bh, tailX, tailY, bubbleText, {
        ...bOpts,
        bord: bOpts.bord === '#333333' ? '#CCCCCC' : bOpts.bord,
        fw:   bOpts.fw   === 'normal'  ? '500'     : bOpts.fw,
      });
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
