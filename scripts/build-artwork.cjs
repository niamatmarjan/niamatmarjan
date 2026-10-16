// Optional artwork authoring tool: npm install --no-save fontkit
// node scripts/build-artwork.cjs <Archivo-Condensed-ExtraBold.ttf> <Archivo-SemiBold.ttf>
// Fonts are converted to vector paths; readers do not download a font.
const fs = require('node:fs');
const path = require('node:path');
const fontkit = require('fontkit');
const display = fontkit.openSync(process.argv[2]);
const body = fontkit.openSync(process.argv[3]);
const out = path.join(__dirname, '..', 'assets');
const C = { maroon: '#7a1712', deep: '#5e110d', chalk: '#edefea', yellow: '#ffc20e', ink: '#141210', muted: '#e0bcb0' };

function type(value, x, y, size, fill, maxWidth = Infinity, font = display) {
  const run = font.layout(value);
  const scale = size / font.unitsPerEm;
  const width = run.positions.reduce((sum, position) => sum + position.xAdvance, 0) * scale;
  const fit = Math.min(1, maxWidth / width);
  let cursor = 0;
  let shapes = '';
  run.glyphs.forEach((glyph, index) => {
    const position = run.positions[index];
    shapes += `<path transform="translate(${cursor + position.xOffset} ${position.yOffset})" d="${glyph.path.toSVG()}"/>`;
    cursor += position.xAdvance;
  });
  return `<g fill="${fill}" transform="translate(${x} ${y}) scale(${scale * fit} ${-scale})">${shapes}</g>`;
}

function svg(width, height, label, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${label}</title><desc id="desc">Custom Route Board artwork for Niamat Marjan, software engineer in Sri Lanka working worldwide. Archivo lettering outlined under the SIL Open Font License.</desc><style>.journey{animation:journey 4s cubic-bezier(.16,1,.3,1) 1}@keyframes journey{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@media(prefers-reduced-motion:reduce){.journey{animation:none}}</style>${content}</svg>\n`;
}

function header(mobile) {
  const w = mobile ? 520 : 1080;
  const h = mobile ? 554 : 480;
  const p = mobile ? 28 : 40;
  let s = `<rect width="${w}" height="${h}" fill="${C.maroon}"/>`;
  s += `<rect x="${p}" y="28" width="${mobile ? 119 : 148}" height="52" fill="${C.yellow}"/>`;
  s += type('niamat.', p + 12, 66, mobile ? 40 : 47, C.ink, mobile ? 95 : 124);
  s += type('SOFTWARE ENGINEER', mobile ? 284 : 768, 48, mobile ? 15 : 21, C.chalk, mobile ? 208 : 272, body);
  s += type('SRI LANKA / WORLDWIDE', mobile ? 284 : 768, 71, mobile ? 13 : 17, C.muted, mobile ? 208 : 272, body);
  s += `<path d="M${p} 105H${w - p}" stroke="${C.muted}" opacity=".45"/>`;
  if (mobile) {
    s += type('FROM FIRST', p - 3, 210, 114, C.chalk, w - p * 2);
    s += type('COMMIT.', p - 3, 327, 139, C.chalk, w - p * 2);
    s += type('TO PRODUCTION.', p - 2, 418, 88, C.yellow, w - p * 2);
    s += `<path d="M${p} 465H${w - p}" stroke="${C.muted}" opacity=".4"/>`;
    s += type('WEB / MOBILE / SAAS / AI', p, 499, 20, C.chalk, w - 2 * p, body);
    s += type('THE IDEA IS ONLY THE BEGINNING.', p, 530, 14, C.muted, w - 2 * p, body);
  } else {
    s += type('FROM FIRST COMMIT.', p - 4, 236, 144, C.chalk, w - p * 2);
    s += type('TO PRODUCTION.', p - 4, 361, 164, C.yellow, w - p * 2);
    s += `<path d="M${p} 416H${w - p}" stroke="${C.muted}" opacity=".4"/><path class="journey" d="M${p} 416H${w - p}" stroke="${C.yellow}" stroke-width="3" stroke-dasharray="1000"/>`;
    ['SCOPE', 'ARCHITECT', 'BUILD', 'SHIP'].forEach((label, i) => {
      const x = p + i * (w - p * 2 - 83) / 3;
      s += `<rect x="${x}" y="410" width="12" height="12" fill="${i === 3 ? C.yellow : C.maroon}" stroke="${i === 3 ? C.yellow : C.muted}" stroke-width="2"/>`;
      s += type(label, x, 455, 18, i === 3 ? C.yellow : C.chalk, 100, body);
    });
  }
  return svg(w, h, 'Niamat Marjan — From first commit to production.', s);
}

let footer = `<rect width="1080" height="106" fill="${C.ink}"/><path d="M0 0H1080" stroke="${C.yellow}" stroke-width="4"/>`;
footer += type('niamat.', 32, 73, 54, C.yellow, 190);
footer += type('ENGINEERED IN SRI LANKA.', 330, 47, 19, C.chalk, 700, body);
footer += type('SHIPPED WORLDWIDE.', 330, 76, 19, C.chalk, 700, body);
footer += `<path d="M978 53h57m-17-17 17 17-17 17" fill="none" stroke="${C.yellow}" stroke-width="4"/>`;
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'header.svg'), header(false));
fs.writeFileSync(path.join(out, 'header-mobile.svg'), header(true));
fs.writeFileSync(path.join(out, 'footer.svg'), svg(1080, 106, 'niamat. — Engineered in Sri Lanka. Shipped worldwide.', footer));
console.log('Created outlined header, mobile header, and footer artwork.');
