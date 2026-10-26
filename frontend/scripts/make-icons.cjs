// Draws the app icons (a white "A" on blue) into public/. Run with: node scripts/make-icons.cjs
// It uses only Node's built-in zlib, so there is nothing extra to install.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BLUE = [37, 99, 235];
const WHITE = [255, 255, 255];

// distance from point (px, py) to the segment (ax, ay)-(bx, by)
const distance = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

// Coverage 0..1 of the letter "A" at a point, in a 0..1 square scaled around the centre by `scale`.
const letter = (x, y, scale) => {
  const sx = (x - 0.5) / scale + 0.5;
  const sy = (y - 0.5) / scale + 0.5;
  const half = 0.058 / 1; // half the stroke width
  const parts = [
    [0.5, 0.2, 0.25, 0.8],
    [0.5, 0.2, 0.75, 0.8],
    [0.355, 0.6, 0.645, 0.6],
  ];
  return parts.some(([ax, ay, bx, by]) => distance(sx, sy, ax, ay, bx, by) <= half) ? 1 : 0;
};

const render = (size, scale) => {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const samples = 3; // 3x3 supersampling smooths the edges

  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 3 + 1)] = 0; // PNG filter type: none
    for (let x = 0; x < size; x += 1) {
      let cover = 0;
      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          cover += letter((x + (sx + 0.5) / samples) / size, (y + (sy + 0.5) / samples) / size, scale);
        }
      }
      const amount = cover / (samples * samples);
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      for (let channel = 0; channel < 3; channel += 1) {
        raw[offset + channel] = Math.round(BLUE[channel] + (WHITE[channel] - BLUE[channel]) * amount);
      }
    }
  }
  return raw;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body) >>> 0);
  return Buffer.concat([length, body, crc]);
};

const png = (size, scale) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(render(size, scale), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

const out = path.join(__dirname, "..", "public");
fs.mkdirSync(out, { recursive: true });

// Maskable icons are cropped into a circle or rounded square by the phone, so the letter shrinks into the safe zone.
const files = {
  "icon-192.png": png(192, 1),
  "icon-512.png": png(512, 1),
  "icon-maskable-512.png": png(512, 0.72),
  "apple-touch-icon.png": png(180, 0.85),
};
for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(path.join(out, name), data);
  console.log(`wrote public/${name} (${data.length} bytes)`);
}
