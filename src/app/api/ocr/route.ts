import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting tracker (IP -> { count, lastReset })
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const MAX_REQUESTS_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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

/**
 * Route Handler untuk ekstraksi data Bukti Potong (PPh 21 / PPh 23) via Gemini API.
 * Sesuai prinsip privasi & keamanan PajakWajar:
 * 1. Proteksi kuota & billing: Rate Limiting berbasis IP (maks 5 req/menit).
 * 2. Berkas hanya diproses dalam memori dan TIDAK disimpan ke server/disk (Zero Retention).
 * 3. Kunci API (GEMINI_API_KEY) tersimpan aman di server, tidak terekspos ke browser.
 * 4. Wajib ada persetujuan eksplisit (consent) dari pengguna.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Dapatkan IP klien untuk pembatasan laju
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

    // Validasi ukuran berkas di sisi server (maks 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran berkas melebihi batas 4MB. Silakan kompres foto atau gunakan input manual.' },
        { status: 413 }
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

    // Konversi file ke base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const systemPrompt = `Anda adalah asisten ekstraksi data Bukti Pemotongan Pajak Indonesia (Formulir Bukti Potong PPh Pasal 21 / PPh Pasal 23 / e-Bupot DJP).
Tugas Anda adalah membaca gambar/dokumen bukti potong dan mengekstrak informasi berikut dengan presisi tinggi ke dalam format JSON:

Field yang diekstrak:
1. "nomorBupot": Nomor Bukti Pemotongan (misal: "1.1-2.1-0123456789" atau "21-001/BP/2025"). Jika tidak ditemukan, isi string kosong "".
2. "npwpPemotong": NPWP Pemotong Pajak (15 digit atau 16 digit). Jika tidak ada, isi "".
3. "namaPemotong": Nama Badan / Perusahaan / Pihak Pemotong Pajak.
4. "jenisPph": Harus bernilai "PPH_21" atau "PPH_23".
5. "dpp": Jumlah Penghasilan Bruto / Dasar Pengenaan Pajak (dalam angka integer rupiah murni, tanpa simbol Rp/titik). Jika tidak ada, 0.
6. "pphDipotong": Jumlah PPh yang Dipotong / Dipungut (dalam angka integer rupiah murni, tanpa simbol Rp/titik). Jika tidak ada, 0.
7. "masaPajak": Masa/Tahun Pajak (misal: "01-2025", "12-2025", atau "2025").

PENTING:
- Keluarkan HANYA objek JSON murni tanpa format markdown \`\`\`json.
- Jangan mengarang data. Jika nominal atau nomor tidak terbaca jelas, prioritaskan angka yang paling mendekati atau 0.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    let parsedResult;
    try {
      parsedResult = JSON.parse(candidateText);
    } catch {
      return NextResponse.json(
        {
          error:
            'Gagal mengurai respons terstruktur dari AI. Silakan gunakan input manual.',
        },
        { status: 500 }
      );
    }

    // Normalisasi & Fallback
    const hasil = {
      nomorBupot: String(parsedResult.nomorBupot || '').trim(),
      npwpPemotong: String(parsedResult.npwpPemotong || '').trim(),
      namaPemotong: String(parsedResult.namaPemotong || '').trim(),
      jenisPph:
        parsedResult.jenisPph === 'PPH_23' ? 'PPH_23' : 'PPH_21',
      dpp: Math.max(0, parseInt(String(parsedResult.dpp || 0).replace(/\D/g, ''), 10) || 0),
      pphDipotong: Math.max(
        0,
        parseInt(String(parsedResult.pphDipotong || 0).replace(/\D/g, ''), 10) || 0
      ),
      masaPajak: String(parsedResult.masaPajak || 'Tahunan').trim(),
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
