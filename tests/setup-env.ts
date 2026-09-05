import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Memuat `.env.local` lalu `.env` ke `process.env` sebelum tes berjalan.
 *
 * Next.js melakukan ini sendiri, tetapi Vitest tidak. Tanpa berkas ini,
 * `npm run test:ocr` tidak akan menemukan `GEMINI_API_KEY` yang sudah diisi
 * pengguna di `.env.local`, dan uji terhadap layanan sungguhan akan dilewati
 * tanpa penjelasan.
 *
 * Nilai yang sudah ada di lingkungan tidak pernah ditimpa, sehingga
 * `GEMINI_API_KEY=... npm run test:ocr` tetap menang atas isi berkas.
 */

const BERKAS = ['.env.local', '.env'];

function muat(namaBerkas: string): void {
  const jalur = fileURLToPath(new URL(`../${namaBerkas}`, import.meta.url));
  if (!existsSync(jalur)) return;

  for (const baris of readFileSync(jalur, 'utf8').split('\n')) {
    const bersih = baris.trim();
    if (bersih.length === 0 || bersih.startsWith('#')) continue;

    const pemisah = bersih.indexOf('=');
    if (pemisah <= 0) continue;

    const kunci = bersih.slice(0, pemisah).trim();
    let nilai = bersih.slice(pemisah + 1).trim();

    // Buang tanda kutip pembungkus bila ada.
    const kutip = nilai[0];
    if (nilai.length >= 2 && (kutip === '"' || kutip === "'") && nilai.endsWith(kutip)) {
      nilai = nilai.slice(1, -1);
    }

    if (nilai.length > 0 && process.env[kunci] === undefined) process.env[kunci] = nilai;
  }
}

for (const berkas of BERKAS) muat(berkas);
