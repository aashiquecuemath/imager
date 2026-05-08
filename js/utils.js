'use strict';

const $ = id => document.getElementById(id);
const val = id => $(id)?.value ?? '';
const num = id => parseFloat($(id)?.value) || 0;
const int = id => parseInt($(id)?.value)   || 0;
const chk = id => $(id)?.checked ?? false;
const fmt = (n, d = 2) => parseFloat(n.toFixed(d));

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svgOpen(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
}

function errorSVG(msg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 40" width="340" height="40">` +
    `<text x="10" y="24" font-family="Arial" font-size="13" fill="red">${escXml(msg)}</text></svg>`;
}
