/**
 * Generate PWA icons from SVG using sharp
 * Run: node scripts/generate-icons.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Icon SVG: A bookmark/leaf motif with seasonal warmth
// Design: Rounded square background with a stylized leaf-bookmark
const createSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F2724B"/>
      <stop offset="100%" style="stop-color:#E85D3A"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95"/>
      <stop offset="100%" style="stop-color:#FFF5F0;stop-opacity:0.9"/>
    </linearGradient>
  </defs>
  <!-- Background rounded square -->
  <rect width="512" height="512" rx="112" ry="112" fill="url(#bg)"/>
  <!-- Subtle inner shadow -->
  <rect width="512" height="512" rx="112" ry="112" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2"/>
  <!-- Leaf/Bookmark shape -->
  <g transform="translate(256,256)">
    <!-- Main leaf body -->
    <path d="M0,-140 C60,-140 110,-100 110,-20 C110,40 80,100 0,160 C-80,100 -110,40 -110,-20 C-110,-100 -60,-140 0,-140 Z"
          fill="url(#leaf)" opacity="0.95"/>
    <!-- Center vein -->
    <line x1="0" y1="-110" x2="0" y2="130" stroke="#F2724B" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
    <!-- Side veins -->
    <line x1="0" y1="-60" x2="-45" y2="-20" stroke="#F2724B" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
    <line x1="0" y1="-60" x2="45" y2="-20" stroke="#F2724B" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
    <line x1="0" y1="-10" x2="-55" y2="30" stroke="#F2724B" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
    <line x1="0" y1="-10" x2="55" y2="30" stroke="#F2724B" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
    <line x1="0" y1="40" x2="-40" y2="75" stroke="#F2724B" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
    <line x1="0" y1="40" x2="40" y2="75" stroke="#F2724B" stroke-width="2" stroke-linecap="round" opacity="0.25"/>
  </g>
</svg>`;

// Write SVG files
writeFileSync(join(publicDir, 'icon.svg'), createSvg(512));
console.log('Created icon.svg');

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
