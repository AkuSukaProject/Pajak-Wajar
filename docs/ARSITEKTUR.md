# Arsitektur & Spesifikasi Teknis PajakWajar

## 1. Prinsip Aliran Data (Data Flow Pipeline)

PajakWajar menerapkan prinsip alur 4 tahap:

```
[01 KELAYAKAN] ───> [02 PERHITUNGAN] ───> [03 KONSEKUENSI] ───> [04 BERKAS PDF]
```

1. **Uji Kelayakan (Gatekeeper):** Menentukan skema mana yang sah secara hukum (`BOLEH`, `TIDAK_BOLEH`, `PERLU_DIPASTIKAN`) berdasarkan PP 20/2026, PER-17/PJ/2015, dan UU HPP.
2. **Kalkulator Multi-Skema:** Menghitung pajak terutang dasar untuk skema yang berhak menggunakan formula progresif Pasal 17 atau tarif final 0,5%.
3. **Rekonsiliasi Bupot:** Mengurangkan kredit pajak PPh 21 / PPh 23 dari total pajak terutang dasar, menentukan status Kurang Bayar (PPh 29), Lebih Bayar (PPh 28A), atau Nihil.
4. **Ekspor Kertas Kerja:** Mengompilasi seluruh hasil ke dalam berkas PDF A4 siap bawa (*Coretax Pre-Filing Worksheet*).

---

## 2. Struktur Modul & Batas Tanggung Jawab

* `src/types/pajak.ts`: Single Source of Truth untuk semua kontrak tipe data.
* `data/klu_rules.json`: Database parameter regulasi perpajakan yang terverifikasi.
* `src/lib/eligibility.ts`: Mesin evaluasi aturan kelayakan hukum deterministik (Sheva).
* `src/lib/calculator.ts`: Mesin penghitungan pajak dan tarif progresif (Sheva).
* `src/lib/bupot.ts`: Logika rekonsiliasi bukti potong dan penentuan status Kurang/Lebih Bayar (Habib).
* `src/lib/ocr.ts`: Client helper untuk integrasi OCR dengan persetujuan pengguna (Habib).
* `src/app/api/ocr/route.ts`: Server Route Handler relay ke Google Gemini Vision API dengan IP rate limiter (Habib).
* `src/components/eligibility/`: Komponen UI form kelayakan & kartu vonis bersitasi (Mikail + Habib).
* `src/components/bupot/`: Komponen form bupot manual, tabel, modal consent OCR, dan ringkasan rekonsiliasi (Habib).
* `src/components/pdf/`: Komponen lembar kerja A4 `@react-pdf/renderer` (Mikail + Habib).

---

## 3. Aspek Keamanan & Privasi

* **Client-Side Computation:** Seluruh penghitungan pajak dan input finansial berjalan di memori peramban pengguna.
* **Serverless OCR Relay:** Foto bukti potong hanya dikirim ke route handler setelah *consent* aktif, diproses langsung ke Gemini API tanpa disimpan di disk (*Zero Data Retention*).
* **Rate Limiting:** IP-based in-memory limiter (maks 5 request/menit) mencegah eksploitasi kuota API.
