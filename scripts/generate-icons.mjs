/**
 * Generate PWA icons from SVG using sharp
 * Run: node scripts/generate-icons.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Icon SVG: Strong bookmark motif with a visible seal accent.
// The goal is to remain recognizable on Android home screens at small sizes.
const createSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F47D57"/>
      <stop offset="55%" style="stop-color:#F2724B"/>
      <stop offset="100%" style="stop-color:#D95534"/>
    </linearGradient>
    <linearGradient id="paper" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFDF9"/>
      <stop offset="100%" style="stop-color:#FFF4EA"/>
    </linearGradient>
    <linearGradient id="seal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE29D"/>
      <stop offset="100%" style="stop-color:#FFC04D"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="112" ry="112" fill="url(#bg)"/>
  <rect x="22" y="22" width="468" height="468" rx="98" ry="98" fill="none" stroke="rgba(255,255,255,0.20)" stroke-width="2"/>

  <g transform="translate(256,256)">
    <path d="M-86 -156 H82 C101 -156 116 -141 116 -122 V92 C116 108 103 122 86 122 H28 L0 154 L-28 122 H-86 C-103 122 -116 108 -116 92 V-122 C-116 -141 -101 -156 -82 -156 Z"
      fill="url(#paper)"/>
    <path d="M-40 -170 C-16 -196 24 -198 50 -175 C71 -156 76 -124 60 -101 C43 -77 11 -68 -16 -83 C-42 -98 -53 -135 -40 -170 Z"
      fill="rgba(255,255,255,0.12)"/>
    <rect x="-64" y="-86" width="124" height="18" rx="9" fill="#F2724B" opacity="0.92"/>
    <rect x="-64" y="-42" width="156" height="18" rx="9" fill="#F7A387" opacity="0.96"/>
    <rect x="-64" y="2" width="104" height="18" rx="9" fill="#FBD3BF" opacity="0.98"/>
    <circle cx="106" cy="-106" r="42" fill="url(#seal)"/>
    <circle cx="106" cy="-106" r="20" fill="#FFF7E8"/>
    <path d="M106 -124 V-88 M88 -106 H124" stroke="#F2724B" stroke-width="12" stroke-linecap="round"/>
  </g>
</svg>`;

const createMonochromeSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <g fill="#111111">
    <path d="M170 102h172c21 0 38 17 38 38v196c0 20-17 38-38 38h-59l-27 32-27-32h-59c-21 0-38-18-38-38V140c0-21 17-38 38-38Z"/>
    <circle cx="362" cy="150" r="44"/>
    <rect x="192" y="184" width="128" height="20" rx="10"/>
    <rect x="192" y="234" width="160" height="20" rx="10"/>
    <rect x="192" y="284" width="106" height="20" rx="10"/>
  </g>
</svg>`;

// Write SVG files
writeFileSync(join(publicDir, 'icon.svg'), createSvg(512));
console.log('Created icon.svg');
writeFileSync(join(publicDir, 'icon-monochrome.svg'), createMonochromeSvg(512));
console.log('Created icon-monochrome.svg');

// Try to use sharp for PNG conversion
try {
  const sharp = (await import('sharp')).default;

  const svgBuffer = Buffer.from(createSvg(512));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Favicon 32x32
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon-32x32.png'));
  console.log('Created favicon-32x32.png');

  // Favicon ICO (as 32x32 PNG - browsers accept this)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

} catch (e) {
  console.log('sharp not available, using SVG only. Install sharp: npm i -D sharp');
  console.log(e.message);
}
