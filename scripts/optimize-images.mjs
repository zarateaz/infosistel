/**
 * Image optimization script for INFOSISTEL.
 * Converts all PNG images in /public/img/ to WebP with max 1200px width.
 * Uses sharp (already a project dependency).
 *
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from "sharp";
import { readdir, stat, unlink } from "fs/promises";
import { join, extname, basename } from "path";

const IMG_DIR = join(process.cwd(), "public", "img");
const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;

async function optimizeImages() {
  const files = await readdir(IMG_DIR);
  const pngFiles = files.filter(
    (f) => extname(f).toLowerCase() === ".png"
  );

  if (pngFiles.length === 0) {
    console.log("No PNG files found to optimize.");
    return;
  }

  console.log(`Found ${pngFiles.length} PNG files to optimize...\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of pngFiles) {
    const inputPath = join(IMG_DIR, file);
    const outputName = basename(file, ".png") + ".webp";
    const outputPath = join(IMG_DIR, outputName);

    const beforeStat = await stat(inputPath);
    totalBefore += beforeStat.size;

    await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    const afterStat = await stat(outputPath);
    totalAfter += afterStat.size;

    const savings = (
      ((beforeStat.size - afterStat.size) / beforeStat.size) *
      100
    ).toFixed(1);

    console.log(
      `✓ ${file} (${(beforeStat.size / 1024 / 1024).toFixed(1)}MB) → ${outputName} (${(afterStat.size / 1024 / 1024).toFixed(2)}MB) — ${savings}% smaller`
    );
  }

  console.log(
    `\n═══════════════════════════════════════`
  );
  console.log(
    `Total: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}% reduction)`
  );
  console.log(
    `═══════════════════════════════════════`
  );

  // Ask whether to delete originals
  console.log(`\nOriginal PNG files kept. Delete them manually when ready:`);
  console.log(`  rm ${IMG_DIR}/*.png`);
}

optimizeImages().catch(console.error);
