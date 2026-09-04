import { z } from 'zod';

// ==========================================
// 1. In-Memory Bounded Rate Limiting
// ==========================================
export interface RateLimitRecord {
  count: number;
  lastReset: number;
}

export const rateLimitMap = new Map<string, RateLimitRecord>();
export const MAX_REQUESTS_PER_MINUTE = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
export const MAX_TRACKED_IPS = 1000; // Batas maksimum memori untuk mencegah memory leak

export function cleanupRateLimitMap(now: number) {
  // Hapus entri kadaluarsa
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }

  // Jika masih melebihi kapasitas maksimum, buang entri tertua
  if (rateLimitMap.size > MAX_TRACKED_IPS) {
    const excess = rateLimitMap.size - MAX_TRACKED_IPS;
    let deletedCount = 0;
    for (const key of rateLimitMap.keys()) {
      rateLimitMap.delete(key);
      deletedCount++;
      if (deletedCount >= excess) break;
    }
  }
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  cleanupRateLimitMap(now);

  const record = rateLimitMap.get(ip);
  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  record.count += 1;
  return false;
}

// ==========================================
// 2. Skema Validasi Output AI (Zod)
// ==========================================
export const ocrGeminiOutputSchema = z.object({
  nomorBupot: z
    .string()
    .max(100)
    .default('')
    .transform((v) => String(v || '').trim()),
  npwpPemotong: z
    .string()
    .max(30)
    .default('')
    .transform((v) => String(v || '').trim()),
  namaPemotong: z
    .string()
    .max(200)
    .default('')
    .transform((v) => String(v || '').trim()),
  jenisPph: z.preprocess((val) => {
    if (typeof val === 'string') {
      const clean = val.toUpperCase().replace(/[\s_-]+/g, '_');
      if (clean === 'PPH_21' || clean === 'PPH21' || clean === '21') return 'PPH_21';
      if (clean === 'PPH_23' || clean === 'PPH23' || clean === '23') return 'PPH_23';
    }
    return val;
  }, z.enum(['PPH_21', 'PPH_23'])),
  dpp: z
    .union([z.number(), z.string()])
    .default(0)
    .transform((val) => {
      const num =
        typeof val === 'number'
          ? Math.floor(val)
          : parseInt(String(val).replace(/\D/g, ''), 10);
      if (isNaN(num) || num < 0) return 0;
      return Math.min(num, 1_000_000_000_000); // Batas wajar 1 Triliun
    }),
  pphDipotong: z
    .union([z.number(), z.string()])
    .default(0)
    .transform((val) => {
      const num =
        typeof val === 'number'
          ? Math.floor(val)
          : parseInt(String(val).replace(/\D/g, ''), 10);
      if (isNaN(num) || num < 0) return 0;
      return Math.min(num, 1_000_000_000_000);
    }),
  masaPajak: z
    .string()
    .max(50)
    .default('Tahunan')
    .transform((v) => String(v || 'Tahunan').trim()),
  perluPemeriksaanManual: z
    .boolean()
    .default(false),
});

// ==========================================
// 3. Validasi Format & Magic Bytes
// ==========================================
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function isValidFileSignature(buffer: Buffer, declaredMimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return declaredMimeType === 'image/jpeg' || declaredMimeType === 'image/jpg';
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return declaredMimeType === 'image/png';
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return declaredMimeType === 'image/webp';
  }

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return declaredMimeType === 'application/pdf';
  }

  return false;
}
