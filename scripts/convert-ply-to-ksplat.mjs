import * as G from "@mkkellogg/gaussian-splats-3d";
import { readFileSync, writeFileSync, statSync } from "node:fs";

// Usage: node --max-old-space-size=8192 scripts/convert-ply-to-ksplat.mjs <in.ply> <out.ksplat>
// Env:  TARGET_SPLATS=600000   → prune to the N most important splats (0 = keep all)
//       KSPLAT_COMPRESSION=1   → 0 none / 1 float16 (default) / 2 aggressive
const inPath = process.argv[2] || "public/scans/Model.ply";
const outPath = process.argv[3] || inPath.replace(/\.ply$/i, ".ksplat");
const TARGET = Number(process.env.TARGET_SPLATS ?? 0);
const COMPRESSION_LEVEL = Number(process.env.KSPLAT_COMPRESSION ?? 1);
const MIN_ALPHA = 1;
const SH_DEGREE = 0;

const mb = (b) => (b / 1024 / 1024).toFixed(1);
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

console.log(`Reading ${inPath} (${mb(statSync(inPath).size)} MB)…`);
const buf = readFileSync(inPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

console.log("Parsing PLY → uncompressed splats…");
let splatArray = G.PlyParser.parseToUncompressedSplatArray(ab, SH_DEGREE);
const total = splatArray.splatCount;
console.log(`  splats: ${total.toLocaleString()}`);

if (TARGET > 0 && TARGET < total) {
  console.log(`Pruning to top ${TARGET.toLocaleString()} by importance…`);
  // OFFSET: SCALE0..2 = 3,4,5 ; OPACITY = 13
  const order = new Array(total);
  const score = new Float64Array(total);
  for (let i = 0; i < total; i++) {
    const s = splatArray.splats[i];
    const vol = Math.exp(s[3]) + Math.exp(s[4]) + Math.exp(s[5]);
    score[i] = sigmoid(s[13]) * vol; // opacity × size
    order[i] = i;
  }
  order.sort((a, b) => score[b] - score[a]);

  const Cls = splatArray.constructor;
  const pruned = new Cls(SH_DEGREE);
  for (let k = 0; k < TARGET; k++) pruned.addSplatFromArray(splatArray, order[k]);
  splatArray = pruned;
  console.log(`  kept: ${splatArray.splatCount.toLocaleString()}`);
}

console.log(`Generating .ksplat (compression level ${COMPRESSION_LEVEL})…`);
const generator = G.SplatBufferGenerator.getStandardGenerator(MIN_ALPHA, COMPRESSION_LEVEL);
const splatBuffer = generator.generateFromUncompressedSplatArray(splatArray);
const data = splatBuffer.bufferData;

writeFileSync(outPath, Buffer.from(data));
console.log(`\n✓ Wrote ${outPath}`);
console.log(`  ${mb(statSync(inPath).size)} MB  →  ${mb(data.byteLength)} MB  (${splatArray.splatCount.toLocaleString()} splats)`);
