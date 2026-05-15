import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 512;

  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 80 * s);
  ctx.fill();

  // Radar circles
  const cx = 256 * s, cy = 280 * s;
  [180, 120, 60].forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
    ctx.strokeStyle = '#2d4eff';
    ctx.lineWidth = 8 * s;
    ctx.globalAlpha = [0.3, 0.5, 0.8][i];
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Radar sweep line
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(400 * s, 160 * s);
  ctx.strokeStyle = '#2d4eff';
  ctx.lineWidth = 6 * s;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Microphone body
  ctx.fillStyle = '#2d4eff';
  ctx.beginPath();
  ctx.roundRect(226 * s, 80 * s, 60 * s, 100 * s, 30 * s);
  ctx.fill();

  // Microphone arc
  ctx.beginPath();
  ctx.arc(256 * s, 180 * s, 60 * s, 0, Math.PI);
  ctx.strokeStyle = '#2d4eff';
  ctx.lineWidth = 10 * s;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Mic stand
  ctx.beginPath();
  ctx.moveTo(256 * s, 240 * s);
  ctx.lineTo(256 * s, 260 * s);
  ctx.lineWidth = 10 * s;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(226 * s, 260 * s);
  ctx.lineTo(286 * s, 260 * s);
  ctx.stroke();

  // Dot
  ctx.beginPath();
  ctx.arc(400 * s, 160 * s, 10 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#5b7fff';
  ctx.fill();

  return canvas.toBuffer('image/png');
}

writeFileSync('apps/web/public/icon-192.png', drawIcon(192));
writeFileSync('apps/web/public/icon-512.png', drawIcon(512));
console.log('Icons generated!');
