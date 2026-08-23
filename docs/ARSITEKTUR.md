# Arsitektur PajakWajar

## Prinsip aliran

`KELAYAKAN → PERHITUNGAN → KONSEKUENSI → BERKAS`

UI saat ini berjalan dengan `src/mock/hasilKelayakan.ts`. Setelah rule engine siap, adaptor UI harus mengganti mock dengan `periksaKelayakan(profil)` tanpa mengubah kontrak tipe.

## Batas modul

- `data/`: aturan regulasi yang dapat diperbarui tanpa menulis ulang logika.
- `src/types/`: kontrak bersama untuk frontend, rule engine, OCR, dan PDF.
- `src/lib/eligibility.ts`: evaluasi aturan deterministik.
- `src/lib/calculator.ts`: perhitungan deterministik dan tarif progresif berlapis.
- `src/lib/ocr.ts`: ekstraksi bukti potong dengan persetujuan eksplisit; input manual tetap wajib.
- `src/mock/`: data palsu untuk pengembangan paralel.
- `src/components/eligibility/`: alur input dan penyajian vonis.

## Privasi

Profil dan angka pajak disimpan hanya dalam state peramban. Foto bukti potong boleh keluar dari perangkat hanya setelah persetujuan eksplisit untuk OCR. Dokumentasi dan antarmuka tidak boleh mengklaim retensi data nol tanpa menjelaskan pengecualian ini.

## TODO integrasi

- [ ] Sambungkan React Hook Form dan schema Zod pada alur formulir.
- [ ] Ganti alias profesi mock dengan data KLU terverifikasi.
- [ ] Sambungkan hasil rule engine ke kartu vonis.
- [ ] Tambahkan panel perbandingan setelah kalkulator siap.
- [ ] Tambahkan input bukti potong manual sebelum OCR.
- [ ] Tambahkan dokumen satu halaman dengan `@react-pdf/renderer`.
