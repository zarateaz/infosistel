// One-time batch job: shrink every oversized product photo (public/uploads,
// public/img) down to a real web size and re-encode as WebP. Run with:
//   node scripts/optimize-images.mjs
//
// Originals are kept untouched — this only adds new .webp files next to them
// and repoints the DB / component references at the new files.
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { readdir, stat } from "fs/promises";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 80;
const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg"]);

async function optimizeDir(dir, { skipUnder = 0 } = {}) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (!SOURCE_EXT.has(ext)) continue;

    const srcPath = join(dir, entry.name);
    const srcStat = await stat(srcPath);
    if (srcStat.size < skipUnder) continue; // already small enough, don't touch

    const webpName = entry.name.slice(0, -ext.length) + ".webp";
    const webpPath = join(dir, webpName);

    await sharp(srcPath)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    const webpStat = await stat(webpPath);
    results.push({
      dir,
      originalName: entry.name,
      webpName,
      beforeKB: Math.round(srcStat.size / 1024),
      afterKB: Math.round(webpStat.size / 1024),
    });
  }
  return results;
}

async function main() {
  console.log("→ Optimizing public/img ...");
  const imgResults = await optimizeDir(join(ROOT, "public", "img"));

  console.log("→ Optimizing public/img/servicios (skip files already < 150KB) ...");
  const serviciosResults = await optimizeDir(join(ROOT, "public", "img", "servicios"), { skipUnder: 150 * 1024 });

  // NOTE: real uploaded product photos live in data/uploads, served via the
  // custom app/uploads/[...path]/route.ts handler — public/uploads is a
  // stale, gitignored leftover that is never actually served over HTTP.
  console.log("→ Optimizing data/uploads ...");
  const uploadsResults = await optimizeDir(join(ROOT, "data", "uploads"));

  const all = [...imgResults, ...serviciosResults, ...uploadsResults];
  let totalBefore = 0, totalAfter = 0;
  for (const r of all) {
    totalBefore += r.beforeKB;
    totalAfter += r.afterKB;
    console.log(`  ${r.originalName} → ${r.webpName}  (${r.beforeKB}KB → ${r.afterKB}KB)`);
  }
  console.log(`\n  Total: ${(totalBefore / 1024).toFixed(1)}MB → ${(totalAfter / 1024).toFixed(1)}MB (${all.length} files)`);

  // Re-point product rows in the DB from their old /uploads/xxx.png to the new .webp
  console.log("\n→ Updating Product.image paths in the database ...");
  const prisma = new PrismaClient();
  try {
    const products = await prisma.product.findMany({ select: { id: true, image: true } });
    let updated = 0;
    for (const p of products) {
      if (!p.image || !p.image.startsWith("/uploads/")) continue;
      const ext = extname(p.image).toLowerCase();
      if (!SOURCE_EXT.has(ext)) continue; // already .webp or something else
      const newPath = p.image.slice(0, -ext.length) + ".webp";
      const fileName = basename(newPath);
      const wasGenerated = uploadsResults.some((r) => r.webpName === fileName);
      if (!wasGenerated) continue;
      await prisma.product.update({ where: { id: p.id }, data: { image: newPath } });
      updated++;
    }
    console.log(`  ${updated} product(s) repointed to their .webp image.`);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\nDone. Originals were left in place — safe to delete manually once you've verified the site.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
