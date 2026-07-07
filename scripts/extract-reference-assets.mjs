// One-shot: pull every base64 data-URI image out of design/reference.html into
// public/home/, and write design/reference.clean.html that references the
// extracted files by path. Context (preceding 160 chars) for each image is
// printed so the generic names can be mapped to meaningful ones.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = "design/reference.html";
const OUT_DIR = "public/home";
const CLEAN = "design/reference.clean.html";

const html = readFileSync(SRC, "utf8");
mkdirSync(OUT_DIR, { recursive: true });

const re = /data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,([A-Za-z0-9+/=]+)/g;
let i = 0;
const report = [];
const clean = html.replace(re, (m, type, b64, offset) => {
  i += 1;
  const ext = type === "svg+xml" ? "svg" : type === "jpeg" || type === "jpg" ? "jpg" : type;
  const name = `img-${String(i).padStart(2, "0")}.${ext}`;
  writeFileSync(join(OUT_DIR, name), Buffer.from(b64, "base64"));
  const ctx = html
    .slice(Math.max(0, offset - 160), offset)
    .replace(/\s+/g, " ")
    .trim();
  report.push(`${name}\t${Buffer.from(b64, "base64").length}B\t…${ctx.slice(-140)}`);
  return `/home/${name}`;
});

writeFileSync(CLEAN, clean);
console.log(report.join("\n"));
console.log(`\n${i} images extracted -> ${OUT_DIR}; cleaned html -> ${CLEAN}`);
