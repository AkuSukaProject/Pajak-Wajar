import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isValidFileSignature,
  isRateLimited,
  cleanupRateLimitMap,
  rateLimitMap,
  ocrGeminiOutputSchema,
} from '../src/lib/ocr-server';
import { POST } from '../src/app/api/ocr/route';
import { NextRequest } from 'next/server';

describe('OCR Endpoint & Security Validation', () => {
  beforeEach(() => {
    rateLimitMap.clear();
    vi.restoreAllMocks();
  });

  describe('1. File Signature / Magic Bytes Validation', () => {
    it('should validate valid JPEG magic bytes (FF D8 FF)', () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      expect(isValidFileSignature(jpegBuffer, 'image/jpeg')).toBe(true);
      expect(isValidFileSignature(jpegBuffer, 'image/jpg')).toBe(true);
    });

    it('should validate valid PNG magic bytes (89 50 4E 47)', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
      expect(isValidFileSignature(pngBuffer, 'image/png')).toBe(true);
    });

    it('should validate valid PDF magic bytes (%PDF)', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
      expect(isValidFileSignature(pdfBuffer, 'application/pdf')).toBe(true);
    });

    it('should validate valid WebP magic bytes (RIFF ... WEBP)', () => {
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]);
      expect(isValidFileSignature(webpBuffer, 'image/webp')).toBe(true);
    });

    it('should reject forged files with mismatched magic bytes', () => {
      const fakeBuffer = Buffer.from('Plain text disguising as image');
      expect(isValidFileSignature(fakeBuffer, 'image/jpeg')).toBe(false);
      expect(isValidFileSignature(fakeBuffer, 'image/png')).toBe(false);
      expect(isValidFileSignature(fakeBuffer, 'application/pdf')).toBe(false);
    });

    it('should reject short buffers under 4 bytes', () => {
      const shortBuffer = Buffer.from([0xff, 0xd8]);
      expect(isValidFileSignature(shortBuffer, 'image/jpeg')).toBe(false);
    });
  });

  describe('2. In-Memory Bounded Rate Limiting', () => {
    it('should allow up to 5 requests per IP in a window', () => {
      const ip = '192.168.1.100';
      for (let i = 0; i < 5; i++) {
        expect(isRateLimited(ip)).toBe(false);
      }
      // 6th request is throttled
      expect(isRateLimited(ip)).toBe(true);
    });

    it('should cleanup expired IP records', () => {
      const ip = '192.168.1.101';
      rateLimitMap.set(ip, { count: 5, lastReset: Date.now() - 70000 });
      cleanupRateLimitMap(Date.now());
      expect(rateLimitMap.has(ip)).toBe(false);
    });
  });

  describe('3. Zod Structured Output Validation', () => {
    it('should parse valid structured output from AI', () => {
      const rawAi = {
        nomorBupot: '21-001/BP/2026',
        npwpPemotong: '01.234.567.8-901.000',
        namaPemotong: 'PT Digital Inovasi',
        jenisPph: 'PPH_21',
        dpp: 50000000,
        pphDipotong: 1250000,
        masaPajak: '05-2026',
        perluPemeriksaanManual: false,
      };

      const parsed = ocrGeminiOutputSchema.safeParse(rawAi);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.nomorBupot).toBe('21-001/BP/2026');
        expect(parsed.data.jenisPph).toBe('PPH_21');
        expect(parsed.data.dpp).toBe(50000000);
        expect(parsed.data.pphDipotong).toBe(1250000);
        expect(parsed.data.perluPemeriksaanManual).toBe(false);
      }
    });

    it('should normalize jenisPph strings correctly', () => {
      const parsed1 = ocrGeminiOutputSchema.safeParse({
        nomorBupot: '123',
        npwpPemotong: '',
        namaPemotong: 'PT A',
        jenisPph: 'pph 21',
        dpp: 100,
        pphDipotong: 5,
        masaPajak: 'Tahunan',
        perluPemeriksaanManual: false,
      });
      expect(parsed1.success).toBe(true);
      if (parsed1.success) {
        expect(parsed1.data.jenisPph).toBe('PPH_21');
      }

      const parsed2 = ocrGeminiOutputSchema.safeParse({
        nomorBupot: '123',
        npwpPemotong: '',
        namaPemotong: 'PT B',
        jenisPph: 'PPH-23',
        dpp: 100,
        pphDipotong: 2,
        masaPajak: 'Tahunan',
        perluPemeriksaanManual: false,
      });
      expect(parsed2.success).toBe(true);
      if (parsed2.success) {
        expect(parsed2.data.jenisPph).toBe('PPH_23');
      }
    });

    it('should reject unrecognized jenisPph without silently fallback to PPH_21', () => {
      const parsed = ocrGeminiOutputSchema.safeParse({
        nomorBupot: '123',
        npwpPemotong: '',
        namaPemotong: 'PT X',
        jenisPph: 'PPH_BAD_VALUE',
        dpp: 100,
        pphDipotong: 5,
        masaPajak: 'Tahunan',
        perluPemeriksaanManual: false,
      });
      expect(parsed.success).toBe(false);
    });

    it('should parse formatted numbers safely', () => {
      const parsed = ocrGeminiOutputSchema.safeParse({
        nomorBupot: '123',
        npwpPemotong: '',
        namaPemotong: 'PT X',
        jenisPph: 'PPH_21',
        dpp: 'Rp 25.000.000',
        pphDipotong: '625.000',
        masaPajak: 'Tahunan',
        perluPemeriksaanManual: false,
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.dpp).toBe(25000000);
        expect(parsed.data.pphDipotong).toBe(625000);
      }
    });
  });

  describe('4. Route Handler POST Security & Protocol Checks', () => {
    it('should return 400 when consent is not given', async () => {
      const formData = new FormData();
      formData.append('consent', 'false');
      formData.append('file', new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'bupot.jpg', { type: 'image/jpeg' }));

      const req = new NextRequest('http://localhost:3000/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Persetujuan');
    });

    it('should return 400 when file is missing', async () => {
      const formData = new FormData();
      formData.append('consent', 'true');

      const req = new NextRequest('http://localhost:3000/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('tidak ditemukan');
    });

    it('should return 415 when unsupported MIME type is sent', async () => {
      const formData = new FormData();
      formData.append('consent', 'true');
      formData.append('file', new File(['exe file'], 'script.exe', { type: 'application/x-msdownload' }));

      const req = new NextRequest('http://localhost:3000/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(415);
      const json = await res.json();
      expect(json.error).toContain('Format berkas tidak didukung');
    });

    it('should return 503 when GEMINI_API_KEY is not configured', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      try {
        const formData = new FormData();
        formData.append('consent', 'true');
        formData.append('file', new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'test.jpg', { type: 'image/jpeg' }));

        const req = new NextRequest('http://localhost:3000/api/ocr', {
          method: 'POST',
          body: formData,
        });

        const res = await POST(req);
        expect(res.status).toBe(503);
        const json = await res.json();
        expect(json.error).toContain('GEMINI_API_KEY');
      } finally {
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      }
    });

    it('should successfully return parsed data and flag perluPemeriksaanManual when Gemini responds', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'test-key';

      // Mock global fetch
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      nomorBupot: '21-009/BP/2026',
                      npwpPemotong: '01.999.888.7-654.000',
                      namaPemotong: 'PT Solusi Pratama',
                      jenisPph: 'PPH_21',
                      dpp: 75000000,
                      pphDipotong: 1875000,
                      masaPajak: '06-2026',
                      perluPemeriksaanManual: false,
                    }),
                  },
                ],
              },
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      try {
        const formData = new FormData();
        formData.append('consent', 'true');
        formData.append(
          'file',
          new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])], 'valid.jpg', { type: 'image/jpeg' })
        );

        const req = new NextRequest('http://localhost:3000/api/ocr', {
          method: 'POST',
          body: formData,
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.nomorBupot).toBe('21-009/BP/2026');
        expect(json.data.jenisPph).toBe('PPH_21');
        expect(json.data.dpp).toBe(75000000);
        expect(json.data.pphDipotong).toBe(1875000);
        expect(json.data.perluPemeriksaanManual).toBe(false);
      } finally {
        if (originalKey) {
          process.env.GEMINI_API_KEY = originalKey;
        } else {
          delete process.env.GEMINI_API_KEY;
        }
      }
    });
  });
});
