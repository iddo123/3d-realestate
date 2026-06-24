import * as G from "@mkkellogg/gaussian-splats-3d";
import { readFileSync, statSync } from "node:fs";

const path = process.argv[2] || "public/scans/Model.ksplat";
const buf = readFileSync(path);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const header = G.SplatBuffer.parseHeader(ab);
console.log(`file: ${path} (${(statSync(path).size / 1024 / 1024).toFixed(1)} MB)`);
console.log("version:", `${header.versionMajor}.${header.versionMinor}`);
console.log("maxSplatCount:", header.maxSplatCount?.toLocaleString?.());
console.log("compressionLevel:", header.compressionLevel);
console.log("sections:", header.maxSectionCount);
console.log("valid header:", header.maxSplatCount > 0 ? "YES" : "NO");
