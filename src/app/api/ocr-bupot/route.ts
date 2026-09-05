import { NextResponse } from 'next/server';
import { hasilBupotOcrSchema } from '@/lib/schemas';

/**
 * Route pembaca bukti potong.
 *
 * Route ini ada semata-mata agar kunci API tidak pernah dikirim ke peramban.
 * Foto diteruskan sekali jalan ke layanan OCR, tidak ditulis ke penyimpanan
 * mana pun, dan tidak ada catatan permintaan yang disimpan aplikasi ini.
 * Batas retensi di sisi penyedia layanan berada di luar kendali kami, dan hal
 * itu dinyatakan apa adanya di antarmuka.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
const BATAS_BASE64 = 6 * 1024 * 1024;
const JENIS_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'];

const INSTRUKSI = [
  'Anda membaca satu lembar bukti pemotongan Pajak Penghasilan Indonesia.',
  'Salin angka persis seperti tertulis. Jangan menghitung, menaksir, atau melengkapi angka yang tidak terbaca.',
  'Isi 0 untuk nilai uang yang tidak terbaca, dan string kosong untuk teks yang tidak terbaca.',
  'Kembalikan hanya JSON sesuai skema.'
].join(' ');

const SKEMA_JAWABAN = {
  type: 'object',
  properties: {
    nomorBuktiPotong: { type: 'string' },
    pemotong: { type: 'string' },
    tanggal: { type: 'string' },
    penghasilanBruto: { type: 'number' },
    pphDipotong: { type: 'number' }
  },
  required: ['nomorBuktiPotong', 'pemotong', 'tanggal', 'penghasilanBruto', 'pphDipotong']
};

type Permintaan = {
  persetujuan: boolean;
  mimeType: string;
  dataBase64: string;
};

function bacaPermintaan(muatan: unknown): Permintaan | null {
  if (!muatan || typeof muatan !== 'object') return null;
  const objek = muatan as Record<string, unknown>;
  if (typeof objek.mimeType !== 'string' || typeof objek.dataBase64 !== 'string') return null;
  return {
    persetujuan: objek.persetujuan === true,
    mimeType: objek.mimeType,
    dataBase64: objek.dataBase64
  };
}

function galat(pesan: string, status: number): NextResponse {
  return NextResponse.json({ pesan }, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  const kunci = process.env.GEMINI_API_KEY;
  if (!kunci) {
    return galat(
      'Pembaca otomatis belum diaktifkan di server ini. Ketik angka bukti potong secara manual.',
      503
    );
  }

  const permintaan = bacaPermintaan(await request.json().catch(() => null));
  if (!permintaan) {
    return galat('Permintaan tidak lengkap. Kirim ulang foto bukti potong.', 400);
  }
  if (!permintaan.persetujuan) {
    return galat(
      'Foto tidak diproses karena persetujuan pengiriman belum diberikan. Gunakan input manual bila tidak setuju.',
      403
    );
  }
  if (!JENIS_DIIZINKAN.includes(permintaan.mimeType)) {
    return galat('Kirim foto berformat JPG, PNG, atau WebP.', 415);
  }
  if (permintaan.dataBase64.length > BATAS_BASE64) {
    return galat('Ukuran foto melebihi batas. Perkecil dulu fotonya.', 413);
  }

  let jawaban: Response;
  try {
    jawaban = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': kunci },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: INSTRUKSI },
                { inlineData: { mimeType: permintaan.mimeType, data: permintaan.dataBase64 } }
              ]
            }
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
            responseSchema: SKEMA_JAWABAN
          }
        })
      }
    );
  } catch {
    return galat(
      'Layanan pembaca tidak dapat dihubungi. Ketik angka bukti potong secara manual.',
      502
    );
  }

  if (!jawaban.ok) {
    return galat(
      'Layanan pembaca menolak permintaan. Ketik angka bukti potong secara manual.',
      502
    );
  }

  const muatan: unknown = await jawaban.json().catch(() => null);
  const teks = ambilTeks(muatan);
  if (!teks) {
    return galat('Isi bukti potong tidak terbaca. Ketik angkanya secara manual.', 422);
  }

  let terurai: unknown;
  try {
    terurai = JSON.parse(teks);
  } catch {
    return galat('Isi bukti potong tidak terbaca utuh. Ketik angkanya secara manual.', 422);
  }

  const tervalidasi = hasilBupotOcrSchema.safeParse(terurai);
  if (!tervalidasi.success) {
    return galat('Angka pada bukti potong tidak lengkap. Periksa dan lengkapi manual.', 422);
  }

  return NextResponse.json(tervalidasi.data);
}

/** Mengambil teks jawaban model tanpa memakai tipe `any`. */
function ambilTeks(muatan: unknown): string | null {
  if (!muatan || typeof muatan !== 'object') return null;
  const kandidat = (muatan as { candidates?: unknown }).candidates;
  if (!Array.isArray(kandidat) || kandidat.length === 0) return null;
  const isi = (kandidat[0] as { content?: unknown }).content;
  if (!isi || typeof isi !== 'object') return null;
  const parts = (isi as { parts?: unknown }).parts;
  if (!Array.isArray(parts)) return null;
  const teks = parts
    .map((bagian) => (bagian && typeof bagian === 'object' ? (bagian as { text?: unknown }).text : null))
    .filter((nilai): nilai is string => typeof nilai === 'string')
    .join('');
  return teks.length > 0 ? teks : null;
}
