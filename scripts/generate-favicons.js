/**
 * Rasterizes the brand SVG onto a square canvas and writes PNGs under public/favicon_io/
 * (matches index.html + site.webmanifest). Run: npm run generate:favicons
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const svgPath = path.join(publicDir, "images/logo/United_Properties_v2.1.svg");
const faviconDir = path.join(publicDir, "favicon_io");

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
/** Inset so the mark does not touch the square edge */
const PADDING = 0.1;

async function pngSquare(size) {
  const svg = fs.readFileSync(svgPath);
  const inner = Math.round(size * (1 - 2 * PADDING));
  const foreground = await sharp(svg)
    .resize(inner, inner, {
      fit: "contain",
      background: TRANSPARENT,
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: TRANSPARENT,
    },
  })
    .composite([{ input: foreground, gravity: "center" }])
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error("Missing SVG:", svgPath);
    process.exit(1);
  }
  fs.mkdirSync(faviconDir, { recursive: true });

  const sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
  };

  for (const [name, px] of Object.entries(sizes)) {
    const buf = await pngSquare(px);
    fs.writeFileSync(path.join(faviconDir, name), buf);
    console.log("wrote", path.join("public/favicon_io", name));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
