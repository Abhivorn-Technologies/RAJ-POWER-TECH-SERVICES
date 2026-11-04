import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read demo-data.ts and satyajan-products-data.ts
const satyajanPath = path.join(rootDir, 'lib', 'satyajan-products-data.ts');
const satyajanContent = fs.readFileSync(satyajanPath, 'utf8');

// Parse SATYAJAN_PRODUCTS JSON array
const satyajanMatch = satyajanContent.match(/export const SATYAJAN_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/);
let satyajanProducts = [];
if (satyajanMatch) {
  try {
    satyajanProducts = JSON.parse(satyajanMatch[1]);
  } catch (e) {
    console.error('Failed to parse satyajan products:', e);
  }
}

// Read base products from demo-data
const demoDataPath = path.join(rootDir, 'lib', 'demo-data.ts');
const demoDataContent = fs.readFileSync(demoDataPath, 'utf8');

// Extract all imageUrl and names
const baseProductMatches = [...demoDataContent.matchAll(/name:\s*'([^']+)'[\s\S]*?brand:\s*'([^']+)'[\s\S]*?imageUrl:\s*'([^']+)'/g)];
const baseProducts = baseProductMatches.map((m) => ({
  name: m[1],
  brand: m[2],
  imageUrl: m[3],
}));

const allProducts = [
  ...baseProducts,
  ...satyajanProducts.map((p) => ({
    name: p.name,
    brand: p.brand || 'Microtek',
    imageUrl: p.imageUrl,
  })),
];

console.log(`Total catalog products found: ${allProducts.length}`);

const outDir = path.join(rootDir, 'all-product-images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Function to sanitize filename for Windows
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim().slice(0, 100);
}

// Helper to determine extension
function getExtension(url, contentType) {
  if (url.includes('.png')) return '.png';
  if (url.includes('.webp')) return '.webp';
  if (url.includes('.svg')) return '.svg';
  if (url.includes('.jpg') || url.includes('.jpeg')) return '.jpg';
  if (contentType?.includes('image/png')) return '.png';
  if (contentType?.includes('image/webp')) return '.webp';
  if (contentType?.includes('image/jpeg')) return '.jpg';
  return '.jpg';
}

async function run() {
  const downloadedFiles = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const prefix = `${String(i + 1).padStart(2, '0')}`;
    const cleanBrand = sanitizeFilename(p.brand || 'Equipment');
    const cleanName = sanitizeFilename(p.name);

    if (p.imageUrl.startsWith('/')) {
      // Local file
      const localRelPath = p.imageUrl.startsWith('/') ? p.imageUrl.slice(1) : p.imageUrl;
      const localAbsPath = path.join(rootDir, 'public', localRelPath);
      const ext = path.extname(localAbsPath) || '.png';
      const targetFileName = `${prefix} - [${cleanBrand}] ${cleanName}${ext}`;
      const targetAbsPath = path.join(outDir, targetFileName);

      if (fs.existsSync(localAbsPath)) {
        fs.copyFileSync(localAbsPath, targetAbsPath);
        downloadedFiles.push({ name: p.name, brand: p.brand, file: targetFileName, source: 'local' });
        successCount++;
        console.log(`[${i + 1}/${allProducts.length}] Copied local: ${targetFileName}`);
      } else {
        console.warn(`[${i + 1}/${allProducts.length}] Local image not found: ${localAbsPath}`);
        failCount++;
      }
    } else if (p.imageUrl.startsWith('http')) {
      // Remote URL
      try {
        const res = await fetch(p.imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get('content-type');
        const ext = getExtension(p.imageUrl, contentType);
        const targetFileName = `${prefix} - [${cleanBrand}] ${cleanName}${ext}`;
        const targetAbsPath = path.join(outDir, targetFileName);

        fs.writeFileSync(targetAbsPath, buffer);
        downloadedFiles.push({ name: p.name, brand: p.brand, file: targetFileName, source: p.imageUrl });
        successCount++;
        console.log(`[${i + 1}/${allProducts.length}] Downloaded remote: ${targetFileName}`);
      } catch (err) {
        console.error(`[${i + 1}/${allProducts.length}] Failed to download ${p.imageUrl}: ${err.message}`);
        failCount++;
      }
    }
  }

  // Also write an INDEX.md inside all-product-images
  let indexMd = `# RAJ POWER TECH SERVICES (RPS) - Complete Equipment Image Catalog\n\n`;
  indexMd += `Total Catalog Products: **${allProducts.length}**\n`;
  indexMd += `Successfully Packaged: **${successCount}**\n\n`;
  indexMd += `| # | Brand | Product Equipment Name | Image File |\n`;
  indexMd += `|---|---|---|---|\n`;

  for (let i = 0; i < downloadedFiles.length; i++) {
    const item = downloadedFiles[i];
    indexMd += `| ${i + 1} | ${item.brand} | ${item.name} | \`${item.file}\` |\n`;
  }

  fs.writeFileSync(path.join(outDir, 'IMAGE_CATALOG_INDEX.md'), indexMd, 'utf8');

  console.log(`\nCompleted! Successfully saved ${successCount} images. Failed: ${failCount}`);
}

run();

