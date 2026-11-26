import { spawnSync } from 'child_process';
import fs from 'fs';

const inputPath = 'public/assets/sairat-couture-crest-source.jpg';
const outputPath = 'public/assets/sairat-couture-logo.png';

// Crop coordinates for the insignia and text
const cropWidth = 2580;
const cropHeight = 880;
const cropX = 520;
const cropY = 160;

const outWidth = 1400;
const outHeight = Math.round((cropHeight / cropWidth) * outWidth);

console.log(`Extracting raw RGBA from ${inputPath}...`);
const convertRes = spawnSync(
  'convert',
  [
    inputPath,
    '-crop',
    `${cropWidth}x${cropHeight}+${cropX}+${cropY}`,
    '+repage',
    '-resize',
    `${outWidth}x${outHeight}!`,
    'rgba:-'
  ],
  { maxBuffer: 50 * 1024 * 1024 }
);

if (convertRes.error || convertRes.status !== 0) {
  console.error('Convert failed:', convertRes.stderr?.toString());
  process.exit(1);
}

const buffer = Buffer.from(convertRes.stdout);

// Process each pixel with advanced chromatic keying
for (let i = 0; i < buffer.length; i += 4) {
  let r = buffer[i];
  let g = buffer[i + 1];
  let b = buffer[i + 2];

  // Perceptual luminance
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  // Gold chromatic warmth: Red & Green are both much higher than Blue
  const yellowPurity = (r + g) / 2 - b;
  const redPurity = r - b;

  let alpha = 0;

  // Background is dark slate/charcoal (lum ~ 30-45, yellowPurity < 10)
  // Dark aura/bokeh around sparkles has lum ~ 45-85, but lacks true gold brilliance
  // True gold elements have either:
  // - High luminance (lum > 115)
  // - Strong golden warmth (yellowPurity > 30 and lum > 80)
  // - Or bright metallic crest lines (r > 120, g > 90)

  if (lum < 55) {
    alpha = 0;
  } else if (lum < 95 && yellowPurity < 24) {
    // Dark brown/slate halo around sparkles
    alpha = 0;
  } else if (lum >= 120 || (lum >= 85 && yellowPurity >= 35)) {
    alpha = 255;
  } else {
    // Smooth transition curve
    const t = Math.max(0, Math.min(1, (lum - 70) / (120 - 70)));
    const smoothT = t * t * (3 - 2 * t);
    alpha = Math.round(smoothT * 255);
  }

  if (alpha > 0) {
    // If edge pixel, clean up any dark fringing by ensuring it keeps warm golden tones
    if (alpha < 255) {
      const aNorm = alpha / 255;
      // Background reference
      const bgR = 34, bgG = 36, bgB = 44;
      let newR = (r - bgR * (1 - aNorm)) / aNorm;
      let newG = (g - bgG * (1 - aNorm)) / aNorm;
      let newB = (b - bgB * (1 - aNorm)) / aNorm;

      // Ensure warm gold hue
      newR = Math.max(newR, 160);
      newG = Math.max(newG, 130);
      newB = Math.min(newB, 90);

      buffer[i] = Math.max(0, Math.min(255, Math.round(newR)));
      buffer[i + 1] = Math.max(0, Math.min(255, Math.round(newG)));
      buffer[i + 2] = Math.max(0, Math.min(255, Math.round(newB)));
      buffer[i + 3] = alpha;
    } else {
      buffer[i + 3] = 255;
    }
  } else {
    buffer[i] = 0;
    buffer[i + 1] = 0;
    buffer[i + 2] = 0;
    buffer[i + 3] = 0;
  }
}

console.log('Writing transparent PNG and auto-trimming...');
const tempPath = 'public/assets/sairat-couture-logo-raw.png';
spawnSync('convert', ['-size', `${outWidth}x${outHeight}`, '-depth', '8', 'rgba:-', tempPath], {
  input: buffer
});

// Auto-trim transparent borders so the logo has precise bounding box
spawnSync('convert', [tempPath, '-trim', '+repage', outputPath]);

if (fs.existsSync(tempPath)) {
  fs.unlinkSync(tempPath);
}

console.log(`Successfully generated clean transparent logo at ${outputPath}`);
