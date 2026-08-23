# PajakWajar

Platform web pra-lapor yang memeriksa kelayakan skema sebelum menghitung pajak untuk pekerja mandiri Indonesia.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Antarmuka saat ini memakai data mock agar pekerjaan frontend dapat berjalan tanpa menunggu rule engine.

## Status

- [x] Kontrak data bersama
- [x] Kerangka formulir empat langkah
- [x] Kartu vonis tiga status dan sitasi yang dapat dibuka
- [x] Struktur data aturan KLU
- [ ] Verifikasi regulasi primer
- [ ] Rule engine dan kalkulator
- [ ] Input bukti potong manual, lalu OCR opsional
- [ ] PDF kertas kerja

## Batasan

PajakWajar adalah alat bantu simulasi pra-lapor, bukan nasihat pajak. Verifikasi hasil dengan Direktorat Jenderal Pajak. Data finansial diproses di peramban; foto bukti potong hanya boleh dikirim ke layanan OCR setelah persetujuan eksplisit pengguna.
