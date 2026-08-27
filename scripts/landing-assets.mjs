/**
 * Landing-page artwork pipeline.
 *
 *   node scripts/landing-assets.mjs generate   # calls Nano Banana Pro, writes .assets-src/*.png
 *   node scripts/landing-assets.mjs optimize   # writes public/landing/*.webp + public/og.png
 *
 * "generate" needs NANO_BANANA_API_KEY in the environment and costs money, so the
 * full-resolution PNGs it produces are kept under .assets-src/ and the optimize step
 * can be re-run offline. Pass asset names after "generate" to re-roll just those.
 */
import { writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const MODEL = "gemini-3-pro-image"; // Nano Banana Pro
const SRC = ".assets-src";
const DEST = "public/landing";

/* ------------------------------------------------------------------ prompts */

// Shared art direction, so every asset reads as one commissioned set.
const PALETTE = `Strict palette: near-black background #0B0B10 to #121218, warm off-white paper
#F7F6F3, soft periwinkle accent #A6A9EB and #C4C6F2, faint indigo #6366F1 for glow only.
No other hues. No teal, no orange, no green.`;

const STYLE = `Style: premium editorial fintech product photography meets clean 3D render.
Physically-based soft studio lighting, gentle falloff, shallow depth of field, subtle film grain.
Minimal, calm, expensive-looking, lots of negative space. Nothing cartoonish, no clipart,
no glossy plastic, no lens flares, no confetti, no floating UI chrome.`;

// Non-negotiable: this product must never depict real-company receipts.
const NOBRAND = `Absolutely no real company logos, brand marks, trademarks or recognisable brand
names anywhere. No readable words or sentences: any text on the paper must be abstract illegible
micro-typography, thin grey lines and blurred numeric rows only.`;

// Assets that sit on the cream band need an even, edge-to-edge background — the
// model adds a heavy vignette by default, which shows up as dark corners.
const FLAT = `CRITICAL: the warm off-white #F7F6F3 background must fill the entire frame right to
all four edges, perfectly even and uniform in tone. Absolutely no vignette, no darkened corners,
no black edges, no spotlight falloff. Bright, flat, evenly diffused studio lighting like a high-key
catalogue photograph. Only the subject itself casts a soft shadow.
Style: premium editorial product photography, minimal, calm, expensive, generous negative space.
Palette limited to warm off-white #F7F6F3, soft greys, and a periwinkle #A6A9EB accent.`;

const ASSETS = [
  {
    name: "hero",
    aspectRatio: "16:9",
    imageSize: "2K",
    prompt: `A cinematic hero image for a receipt-making web app, shot on a seamless near-black
background. Three or four blank thermal-paper receipts and one crisp matte invoice card float in
dark space at slightly different depths, gently curling with soft realistic paper physics. The
paper is warm off-white. A wide soft periwinkle light wash falls from the upper centre, catching
the top edges of the paper and fading into pure darkness at the frame edges. The lower third of
the frame is almost entirely empty dark space. Centred, symmetrical, generous margins.
${PALETTE} ${STYLE} ${NOBRAND}`,
  },
  {
    name: "step-01",
    aspectRatio: "4:3",
    imageSize: "1K",
    prompt: `A neat fanned stack of four blank receipt-paper cards of slightly different widths,
arranged like template swatches on a warm off-white surface, casting soft realistic shadows. The
top card is lifted slightly, suggesting choosing one. Three-quarter overhead view, subject centred
and small in frame. ${FLAT} ${NOBRAND}`,
  },
  {
    name: "step-02",
    aspectRatio: "4:3",
    imageSize: "1K",
    prompt: `One blank receipt-paper card lying flat on a warm off-white surface, with a slim matte
periwinkle stylus resting diagonally across it, and soft abstract grey lines on the card suggesting
form fields being filled in. Three-quarter overhead view, subject centred and small in frame.
${FLAT} ${NOBRAND}`,
  },
  {
    name: "step-03",
    aspectRatio: "4:3",
    imageSize: "1K",
    prompt: `A single finished receipt-paper card lifting and curling upward as if being exported,
with a soft periwinkle glow beneath it and a crisp shadow on the surface below, on a warm off-white
surface. Sense of weightless motion. Three-quarter overhead view, subject centred and small in
frame. ${FLAT} ${NOBRAND}`,
  },
  {
    name: "cta",
    aspectRatio: "21:9",
    imageSize: "1K",
    prompt: `An extremely dark, ultra-wide abstract ambient texture for the background of a website
section. Almost entirely near-black #0B0B10. In the lower left and lower right quadrants only, two
very faint, very diffuse periwinkle light blooms, barely visible, like distant light pollution at
night. The whole centre and upper half of the frame must remain almost pure near-black so that
white headline text placed on top stays perfectly readable. No subject, no paper, no object, no
focal point whatsoever — pure dark atmospheric gradient with subtle film grain. Very low contrast,
very low brightness. ${NOBRAND}`,
  },
  {
    name: "og",
    aspectRatio: "16:9",
    imageSize: "2K",
    prompt: `A social share card background: near-black #0B0B10 field, with a small cluster of blank
warm off-white receipt papers floating in the right third of the frame, softly lit with a periwinkle
rim light. The entire left two-thirds is clean empty dark space reserved for a headline to be added
later. Balanced, premium, editorial. ${PALETTE} ${STYLE} ${NOBRAND}`,
  },
];

/* ----------------------------------------------------------------- generate */

async function generate() {
  const key = process.env.NANO_BANANA_API_KEY;
  if (!key) throw new Error("NANO_BANANA_API_KEY is not set");
  mkdirSync(SRC, { recursive: true });

  const only = process.argv.slice(3);
  const list = only.length ? ASSETS.filter((a) => only.includes(a.name)) : ASSETS;

  for (const asset of list) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: asset.prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: { aspectRatio: asset.aspectRatio, imageSize: asset.imageSize },
          },
        }),
      },
    );
    const json = await res.json();
    const img = (json?.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData?.data);
    if (!img) {
      console.log(`x ${asset.name}: ${JSON.stringify(json).slice(0, 300)}`);
      continue;
    }
    const buf = Buffer.from(img.inlineData.data, "base64");
    writeFileSync(join(SRC, `${asset.name}.png`), buf);
    console.log(`ok ${asset.name} ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
  }
}

/* ----------------------------------------------------------------- optimize */

const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`;

// Responsive WebP pairs. Dark, low-detail art compresses hard.
const WEBP = [
  { src: "hero", widths: [1200, 2000], quality: 74 },
  { src: "step-01", widths: [400, 800], quality: 80 },
  { src: "step-02", widths: [400, 800], quality: 80 },
  { src: "step-03", widths: [400, 800], quality: 80 },
  { src: "cta", widths: [1600], quality: 70 },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const FONT = "Segoe UI, Selawik, Arial, sans-serif";

const ogOverlay = () =>
  Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0B0B10" stop-opacity="0.97"/>
      <stop offset="55%"  stop-color="#0B0B10" stop-opacity="0.80"/>
      <stop offset="100%" stop-color="#0B0B10" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#scrim)"/>
  <rect x="72" y="86" width="30" height="30" rx="9" fill="#A6A9EB"/>
  <text x="116" y="109" font-family="${FONT}" font-size="25" font-weight="700" fill="#FFFFFF">Receipt<tspan fill="#A6A9EB">Expenses</tspan></text>
  <text x="72" y="248" font-family="${FONT}" font-size="72" font-weight="700" fill="#FFFFFF">Free online</text>
  <text x="72" y="330" font-family="${FONT}" font-size="72" font-weight="700" fill="#C4C6F2">receipt maker</text>
  <text x="72" y="398" font-family="${FONT}" font-size="26" fill="#94A3B8">${esc("24+ templates · live preview · PDF & PNG")}</text>
  <text x="72" y="438" font-family="${FONT}" font-size="26" fill="#94A3B8">Runs entirely in your browser</text>
  <rect x="72" y="492" width="196" height="46" rx="23" fill="#FFFFFF" fill-opacity="0.08"/>
  <text x="96" y="522" font-family="${FONT}" font-size="21" font-weight="600" fill="#DDDEF9">No watermark</text>
  <text x="300" y="522" font-family="${FONT}" font-size="21" font-weight="600" fill="#64748B">receiptexpenses.com</text>
</svg>`);

async function optimize() {
  mkdirSync(DEST, { recursive: true });

  for (const job of WEBP) {
    for (const w of job.widths) {
      const out = `${DEST}/${job.src}-${w}.webp`;
      await sharp(`${SRC}/${job.src}.png`)
        .resize(w)
        .webp({ quality: job.quality, effort: 6 })
        .toFile(out);
      console.log(`  ${job.src}-${w}.webp  ${kb(out)}`);
    }
  }

  await sharp(`${SRC}/og.png`)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .composite([{ input: ogOverlay(), top: 0, left: 0 }])
    .png({ compressionLevel: 9, palette: true })
    .toFile("public/og.png");
  console.log(`  og.png  ${kb("public/og.png")}`);
}

const cmd = process.argv[2];
if (cmd === "generate") await generate();
else if (cmd === "optimize") await optimize();
else console.log("usage: node scripts/landing-assets.mjs generate|optimize [names...]");
