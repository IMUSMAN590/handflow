const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZES = [16, 32, 48, 128];
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const scale = size / 128;

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, size, size, size * 0.18);
  } else {
    ctx.rect(0, 0, size, size);
  }
  ctx.fill();

  ctx.strokeStyle = '#0EA5E9';
  ctx.lineWidth = Math.max(1.5, 2.4 * scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const drawLine = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1 * scale, y1 * scale);
    ctx.lineTo(x2 * scale, y2 * scale);
    ctx.stroke();
  };

  drawLine(32, 56, 32, 20);
  drawLine(42, 56, 42, 12);
  drawLine(52, 56, 52, 16);
  drawLine(62, 56, 62, 24);

  ctx.beginPath();
  ctx.moveTo(24 * scale, 56 * scale);
  ctx.lineTo(24 * scale, 92 * scale);
  ctx.quadraticCurveTo(24 * scale, 102 * scale, 36 * scale, 102 * scale);
  ctx.lineTo(66 * scale, 102 * scale);
  ctx.quadraticCurveTo(78 * scale, 102 * scale, 78 * scale, 92 * scale);
  ctx.lineTo(78 * scale, 56 * scale);
  ctx.stroke();

  drawLine(24, 72, 12, 52);

  ctx.beginPath();
  ctx.moveTo(84 * scale, 34 * scale);
  ctx.quadraticCurveTo(96 * scale, 30 * scale, 106 * scale, 22 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(86 * scale, 50 * scale);
  ctx.quadraticCurveTo(102 * scale, 46 * scale, 116 * scale, 36 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(84 * scale, 66 * scale);
  ctx.quadraticCurveTo(96 * scale, 62 * scale, 106 * scale, 54 * scale);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

for (const size of SIZES) {
  const buffer = generateIcon(size);
  const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath}`);
}

console.log('All icons generated!');
