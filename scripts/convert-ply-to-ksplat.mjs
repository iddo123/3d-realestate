import * as G from "@mkkellogg/gaussian-splats-3d";
import { readFileSync, writeFileSync, statSync } from "node:fs";

const inPath = process.argv[2] || "public/scans/Model.ply";
const outPath = process.argv[3] || inPath.replace(/\.ply$/i, ".ksplat");

// Compression: 0 = none (float32), 1 = float16 (recommended), 2 = more aggressive
const COMPRESSION_LEVEL = Number(process.env.KSPLAT_COMPRESSION ?? 1);
const MIN_ALPHA = 1;
const SH_DEGREE = 0; // drop spherical harmonics → smaller file

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

console.log(`Reading ${inPath} (${mb(statSync(inPath).size)} MB)…`);
const buf = readFileSync(inPath);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

console.log("Parsing PLY → uncompressed splats…");
const splatArray = G.PlyParser.parseToUncompressedSplatArray(ab, SH_DEGREE);
const count = splatArray.splatCount ?? splatArray.length;
console.log(`  splats: ${count?.toLocaleString?.() ?? count}`);

console.log(`Generating .ksplat (compression level ${COMPRESSION_LEVEL})…`);
const generator = G.SplatBufferGenerator.getStandardGenerator(MIN_ALPHA, COMPRESSION_LEVEL);
const splatBuffer = generator.generateFromUncompressedSplatArray(splatArray);

const data = splatBuffer.bufferData;
if (!(data instanceof ArrayBuffer)) {
  console.error("Unexpected SplatBuffer shape:", Object.keys(splatBuffer));
  process.exit(1);
}

writeFileSync(outPath, Buffer.from(data));
console.log(`\n✓ Wrote ${outPath}`);
console.log(`  ${mb(statSync(inPath).size)} MB  →  ${mb(data.byteLength)} MB`);
