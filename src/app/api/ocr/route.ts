import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ==========================================
// 1. In-Memory Bounded Rate Limiting
// ==========================================
interface RateLimitRecord {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_REQUESTS_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_TRACKED_IPS = 1000; // Batas maksimum memori untuk mencegah memory leak

function cleanupRateLimitMap(now: number) {
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

function isRateLimited(ip: string): boolean {
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
const ocrGeminiOutputSchema = z.object({
  nomorBupot: z
    .string()
    .max(100)
    .catch('')
    .transform((v) => String(v || '').trim()),
  npwpPemotong: z
    .string()
    .max(30)
    .catch('')
    .transform((v) => String(v || '').trim()),
  namaPemotong: z
    .string()
    .max(200)
    .catch('')
    .transform((v) => String(v || '').trim()),
  jenisPph: z
    .enum(['PPH_21', 'PPH_23'])
    .catch('PPH_21'),
  dpp: z
    .union([z.number(), z.string()])
    .catch(0)
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
    .catch(0)
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
    .catch('Tahunan')
    .transform((v) => String(v || 'Tahunan').trim()),
  perluPemeriksaanManual: z
    .boolean()
    .catch(false)
    .default(false),
});

// ==========================================
// 3. Validasi Format & Magic Bytes
// ==========================================
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function isValidFileSignature(buffer: Buffer, declaredMimeType: string): boolean {
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

/**
 * Route Handler untuk ekstraksi data Bukti Pemotongan Pajak via Gemini API.
 * Sesuai prinsip privasi, keandalan & keamanan:
 * 1. Proteksi kuota & memory: Bounded Rate Limiting berbasis IP (maks 5 req/menit).
 * 2. Transparansi privasi: Berkas tidak disimpan di database/server aplikasi kami,
 *    melainkan diteruskan ke Google Gemini API hanya setelah pengguna memberikan persetujuan eksplisit.
 * 3. Keamanan API key: Dikirim melalui HTTP header `x-goog-api-key`, bukan melalui parameter query URL.
 * 4. Validasi server berlapis: MIME allowlist, magic bytes, batas ukuran 5MB, dan validasi skema Zod.
 * 5. Prompt presisi: Jika angka buram, wajib mengembalikan 0 dan meminta pemeriksaan manual (tanpa menebak).
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Pembatasan frekuensi permintaan berbasis IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error:
            'Batas frekuensi permintaan tercapai (maksimal 5 kali per menit). Demi penghematan kuota, silakan tunggu sebentar atau gunakan input manual.',
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const consent = formData.get('consent');

    if (consent !== 'true') {
      return NextResponse.json(
        {
          error:
            'Persetujuan pengunggahan berkas diperlukan. Silakan gunakan fitur input manual jika tidak ingin mengirim foto.',
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'Berkas bukti potong tidak ditemukan dalam permintaan.' },
        { status: 400 }
      );
    }

    // 2. Validasi ukuran berkas di sisi server (maks 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Ukuran berkas melebihi batas 5MB. Silakan kompres foto atau gunakan input manual.' },
        { status: 413 }
      );
    }

    // 3. Validasi MIME Type
    const mimeType = (file.type || 'image/jpeg').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: 'Format berkas tidak didukung. Harap unggah berkas JPG, PNG, WebP, atau PDF.' },
        { status: 415 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Layanan OCR AI belum dikonfigurasi (GEMINI_API_KEY tidak ditemukan). Silakan gunakan mode input manual.',
        },
        { status: 503 }
      );
    }

    // 4. Validasi Magic Bytes / File Signature
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidFileSignature(buffer, mimeType)) {
      return NextResponse.json(
        {
          error:
            'Integritas berkas tidak valid atau format berkas tidak sesuai dengan ekstensinya.',
        },
        { status: 400 }
      );
    }

    const base64Data = buffer.toString('base64');

    const systemPrompt = `Anda adalah asisten ekstraksi data Bukti Pemotongan Pajak Indonesia (Formulir Bukti Potong PPh Pasal 21 / PPh Pasal 23 / e-Bupot DJP).
Tugas Anda adalah membaca gambar/dokumen bukti potong dan mengekstrak informasi berikut dengan presisi tinggi ke dalam format JSON:

Field yang diekstrak:
1. "nomorBupot": Nomor Bukti Pemotongan (misal: "1.1-2.1-0123456789" atau "21-001/BP/2025"). Jika tidak ditemukan atau tidak terbaca jelas, isi string kosong "".
2. "npwpPemotong": NPWP Pemotong Pajak (15 digit atau 16 digit). Jika tidak ada atau tidak jelas, isi "".
3. "namaPemotong": Nama Badan / Perusahaan / Pihak Pemotong Pajak. Jika tidak jelas, isi "".
4. "jenisPph": Harus bernilai "PPH_21" atau "PPH_23".
5. "dpp": Jumlah Penghasilan Bruto / Dasar Pengenaan Pajak (dalam angka integer rupiah murni, tanpa simbol Rp/titik). Jika tidak ada atau tidak terbaca jelas, wajib isi 0.
6. "pphDipotong": Jumlah PPh yang Dipotong / Dipungut (dalam angka integer rupiah murni, tanpa simbol Rp/titik). Jika tidak ada atau tidak terbaca jelas, wajib isi 0.
7. "masaPajak": Masa/Tahun Pajak (misal: "01-2025", "12-2025", atau "2025"). Jika tidak jelas, isi "Tahunan".
8. "perluPemeriksaanManual": boolean (true/false). Berikan nilai true jika ada angka nominal atau teks penting yang buram, terpotong, atau meragukan sehingga wajib diperiksa ulang oleh pengguna.

PENTING:
- Keluarkan HANYA objek JSON murni tanpa format markdown \`\`\`json.
- Jangan mengarang data dan JANGAN menggunakan instruksi menebak angka yang paling mendekati.
- Jika nominal atau angka tidak terbaca jelas, WAJIB mengembalikan 0 dan set "perluPemeriksaanManual": true.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
      },
    };

    // 5. Pengiriman API Key melalui Header x-goog-api-key (Bukan query URL)
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json(
        {
          error:
            'Gagal memproses gambar melalui layanan AI. Kuota mungkin habis atau gambar kurang jelas. Silakan gunakan input manual.',
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let rawParsed;
    try {
      rawParsed = JSON.parse(candidateText);
    } catch {
      return NextResponse.json(
        {
          error:
            'Gagal mengurai respons terstruktur dari AI. Silakan gunakan input manual.',
        },
        { status: 500 }
      );
    }

    // 6. Validasi Skema Zod
    const validated = ocrGeminiOutputSchema.safeParse(rawParsed);
    if (!validated.success) {
      return NextResponse.json(
        {
          error:
            'Format hasil analisis AI tidak memenuhi standar validasi data perpajakan. Silakan gunakan form manual.',
        },
        { status: 422 }
      );
    }

    const hasil = {
      nomorBupot: validated.data.nomorBupot,
      npwpPemotong: validated.data.npwpPemotong,
      namaPemotong: validated.data.namaPemotong,
      jenisPph: validated.data.jenisPph,
      dpp: validated.data.dpp,
      pphDipotong: validated.data.pphDipotong,
      masaPajak: validated.data.masaPajak,
      perluPemeriksaanManual: validated.data.perluPemeriksaanManual,
      sumber: 'ocr' as const,
    };

    return NextResponse.json({ success: true, data: hasil });
  } catch (error) {
    console.error('OCR Route Handler Error:', error);
    return NextResponse.json(
      {
        error:
          'Terjadi kesalahan saat memproses bukti potong. Silakan gunakan form manual.',
      },
      { status: 500 }
    );
  }
}
