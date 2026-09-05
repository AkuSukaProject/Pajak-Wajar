# Arsitektur PajakWajar

## Prinsip aliran

`KELAYAKAN → PERHITUNGAN → KONSEKUENSI → BERKAS`

Urutan itu bukan sekadar susunan layar, melainkan aturan pemrograman. `auditPajakMandiri` menolak menghitung nominal untuk skema yang belum jelas haknya, dan status kalkulasi yang diblokir tidak pernah mengubah status kelayakan.

## Peta modul

```
data/klu_rules.json          parameter, aturan, sitasi — satu-satunya sumber regulasi
data/klu_rules.schema.json   kontrak bentuk berkas di atas (Draft 2020-12)
        │
src/lib/regulasi.ts          pemuat bertipe + pencarian KLU + persentase norma
        │
        ├── eligibility.ts   saringan kelayakan; tidak menghitung apa pun
        ├── calculator.ts    matematika murni; tidak menilai hukum apa pun
        ├── schemas.ts       validasi Zod untuk profil, bupot, dan masukan audit
        └── index.ts         orkestrator auditPajakMandiri
                │
                ├── components/eligibility/   formulir dan kartu vonis
                ├── components/berkas/        kertas kerja PDF
                └── lib/ocr.ts → app/api/ocr-bupot/route.ts
```

### Pembagian tanggung jawab

- **`eligibility.ts`** hanya menghasilkan `BOLEH`, `TIDAK_BOLEH`, atau `PERLU_DIPASTIKAN` beserta alasan dan sitasinya. Tidak ada satu pun operasi aritmetika pajak di dalamnya.
- **`calculator.ts`** hanya berisi fungsi murni yang menerima parameter regulasi sebagai argumen. Fungsi-fungsinya tidak pernah membaca `data/klu_rules.json` sendiri, sehingga dapat diuji dengan angka apa pun.
- **`index.ts`** memutuskan skema mana yang boleh dihitung, lalu memanggil kalkulator.

## Empat saringan kelayakan

| Saringan | Dasar | Keluaran bila ragu |
|---|---|---|
| Pekerjaan bebas | PP 20/2026 Pasal 56 ayat (3) huruf a jo. ayat (4) | `PERLU_DIPASTIKAN` untuk profesi yang tidak disebut satu per satu |
| Ambang peredaran bruto gabungan | Pasal 57 ayat (1) dan (2) huruf e jo. Pasal 58 | `PERLU_DIPASTIKAN` hanya bila penggabungan mengubah vonis |
| Pintu satu arah tarif umum | Pasal 57 ayat (2) huruf a jo. ayat (3) dan (4) | `PERLU_DIPASTIKAN` bila pengguna tidak ingat |
| Pemberitahuan dan ambang NPPN | PER-17/PJ/2015 Pasal 1 dan Pasal 2 ayat (1) | `PERLU_DIPASTIKAN` bila pengguna tidak yakin |

Agregasi berlaku `TIDAK_BOLEH > PERLU_DIPASTIKAN > BOLEH`.

## Dua himpunan omzet yang tidak boleh dicampur

| Kebutuhan | Field | Dasar |
|---|---|---|
| Menghitung pajak dan menguji ambang NPPN | `omzetPribadiTahunPajak` | PER-17/PJ/2015 Pasal 1; UU 7/2021 Pasal 7 ayat (2a) |
| Menguji ambang PPh Final Rp4,8 miliar | `omzetPribadiThnSebelumnya` + `omzetPasanganThnSebelumnya` + `omzetSeluruhPerseroanPeroranganThnSebelumnya` | PP 20/2026 Pasal 58 ayat (1) huruf a, ayat (2) dan (3) |

Omzet konsolidasi **tidak pernah** menjadi dasar perhitungan, dan pembebasan Rp500 juta **tidak pernah** dihitung dari omzet konsolidasi.

## Status kalkulasi

`statusKalkulasi` adalah discriminated union, bukan sekadar properti opsional, sehingga keadaan yang saling bertentangan mustahil disusun:

- `TERSEDIA` wajib membawa `pajakTerutang` dan `rincianKalkulasi`.
- `BELUM_TERSEDIA` dan `TIDAK_RELEVAN` wajib membawa `alasanKalkulasi` dan tidak boleh membawa nominal.

Kalkulasi diblokir bila: kelayakan bukan `BOLEH`; pengguna punya lebih dari satu kegiatan (NPPN, karena satu persentase norma tidak boleh dikalikan ke omzet gabungan); biaya usaha belum diisi (tarif umum, karena `undefined` tidak boleh dianggap Rp0); atau parameter yang dibutuhkan masih `DALAM_REVIEW`.

## Privasi

Profil, omzet, dan seluruh perhitungan hidup di state peramban. Tidak ada basis data, tidak ada penyimpanan sesi, dan kertas kerja PDF dirakit di perangkat pengguna.

Satu-satunya data yang meninggalkan perangkat adalah **foto bukti potong**, dan hanya setelah pengguna mencentang persetujuan. Foto diteruskan sekali jalan lewat `app/api/ocr-bupot/route.ts` — route itu ada semata-mata agar kunci API tidak sampai ke peramban — dan tidak ditulis ke penyimpanan mana pun. Kebijakan retensi di sisi penyedia layanan OCR berada di luar kendali proyek ini, dan hal itu dinyatakan apa adanya di antarmuka. Karena itu proyek ini tidak pernah mengklaim “zero data retention” tanpa kualifikasi.

Mode ketik manual adalah jalur utama, berfungsi penuh tanpa `GEMINI_API_KEY`, dan tidak mengirim apa pun.

## Peran AI

Model bahasa dipakai pada tepat satu titik: mengubah gambar bukti potong menjadi angka terstruktur. Model dipanggil dengan `temperature: 0` dan `responseSchema`, hasilnya divalidasi ulang dengan Zod di server dan di klien, lalu ditaruh di kolom yang sama dengan isian manual agar pengguna wajib meninjaunya. Tidak ada keputusan kelayakan maupun perhitungan pajak yang berasal dari model.
