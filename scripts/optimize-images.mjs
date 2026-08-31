import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assetsDir = path.resolve('src/assets');
const sourceExtensions = new Set(['.png', '.jpg', '.jpeg']);
const files = await readdir(assetsDir);

for (const file of files) {
  const extension = path.extname(file).toLowerCase();
  if (!sourceExtensions.has(extension)) continue;

  const input = path.join(assetsDir, file);
  const output = path.join(assetsDir, `${path.basename(file, extension)}.webp`);

  await sharp(input)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 76, effort: 5 })
    .toFile(output);

  console.log(`${file} -> ${path.basename(output)}`);
}
