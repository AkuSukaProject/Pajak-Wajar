# Integrasi repositori tim dan produksi

Diperiksa pada 6 September 2026. Repositori utama: **[samythh/Pajak-Wajar](https://github.com/samythh/Pajak-Wajar)**. Identitas tim tetap **AkuSukaProject**.

## Riwayat yang disatukan

- Dasar bersama: `0354cad481858dfdf0385468d487ba8061703020` (scaffold).
- Produksi sebelum integrasi: `9c48f40d724e955c4f4d000fd6338bd56c69a370` (enam PR aplikasi, OCR, PDF, maskot, dan pencocokan KBLI).
- Tim: `035cbf2` (engine v6), `2df5029` (15 skenario), dan `efd2976` (Norma per KLU/wilayah tanpa nilai bawaan 50%).

Integrasi menggunakan merge dengan dua induk, dilanjutkan PR dengan merge commit. Commit tim tetap menjadi bagian riwayat. Tidak memakai squash, penggantian seluruh riwayat, atau force push. Catatan ini menjelaskan keputusan berdasarkan perilaku kode; bukan klaim bahwa anggota tim sudah memberikan persetujuan terpisah.

## Keputusan atas 15 konflik

| Berkas | Resolusi dan alasan |
|---|---|
| `data/klu_rules.json`, `data/klu_rules.schema.json` | Pertahankan data produksi 22 kegiatan, persentase yang dikunci ke Lampiran I, sitasi, dan padanan KBLI. Data tim menggunakan kontrak dan contoh persentase lama. |
| `src/lib/index.ts` | Pertahankan orkestrator produksi yang dipakai UI/PDF/OCR. Lookup KLU dan wilayah serta penolakan Norma bawaan sudah tersedia; tujuan perubahan `efd2976` dipertahankan dan diuji pada alur audit lengkap. |
| `src/lib/eligibility.ts` | Pertahankan pemeriksaan klasifikasi, tahun sebelumnya, riwayat ambang, pasangan, gaji, serta status belum pasti. Implementasi tim belum memuat seluruh batas cakupan produksi. |
| `src/lib/calculator.ts` | Pertahankan pembulatan PKP ke ribuan, rincian lapisan, penggabungan gaji, dan pemisahan kelebihan kredit. Versi tim belum membulatkan PKP ke ribuan serta memakai nilai sisa pajak negatif untuk kelebihan kredit. |
| `src/types/pajak.ts`, `src/lib/schemas.ts` | Pertahankan kontrak produksi yang dipakai enam langkah, bukti potong terstruktur, dan rincian PDF. Persentase Norma produksi memakai satuan 50 untuk 50%; engine tim memakai 0,5. Kedua kontrak tidak boleh dicampur. |
| `src/components/eligibility/AlurKelayakan.tsx`, `src/components/eligibility/KartuVonis.tsx`, `src/mock/hasilKelayakan.ts` | Pertahankan UI produksi dan profil demo yang kompatibel; jangan mengembalikan UI ke contoh statis. |
| `tests/audit-pajak.test.ts` | Pertahankan 13 tes produksi dan tambahkan empat tes adaptasi lookup wilayah dari pekerjaan Sheva. Gunakan nilai nyata KLU 47919 (30/25/20) dan 86201 (50/50/50), bukan fixture sementara dokter 45%. |
| `tests/calculator.test.ts`, `tests/eligibility.test.ts` | Pertahankan regresi produksi. Tujuan 15 skenario tim tercakup; lihat pemetaan di bawah. |
| `vitest.config.ts` | Pertahankan konfigurasi produksi, alias, dan pemuatan lingkungan OCR opsional. |
| `docs/00_CATATAN.md` | Pertahankan konteks riset dan koreksi; perbaiki langsung badan Bagian I angka 3, serta tandai status arsip dengan rujukan ke register mutakhir. |

Penggabungan otomatis `package-lock.json` membuang metadata libc paket native; metadata produksi dipertahankan agar pilihan paket platform tidak mundur. `tsconfig.tsbuildinfo` tetap diabaikan dan tidak menjadi berkas sumber. Penghapusan `.gitkeep` kosong diterima karena folder screenshot sudah berisi gambar.

Guidebook, daftar pengumpulan regulasi, dan PRD engine Sheva dipertahankan. Dokumen perencanaan lama diberi penanda arsip agar contoh kontrak dan angka tidak dianggap sebagai aturan produksi.

## Pemetaan tujuan tes tim

| Skenario tim | Cakupan produksi |
|---|---|
| 1–4: pekerjaan bebas, usaha layak, ambang terlampaui dan tepat batas | `tests/eligibility.test.ts` |
| 5: omzet pribadi terpisah dari konsolidasi | `tests/calculator.test.ts`, `tests/eligibility.test.ts` |
| 6–7: pemberitahuan Norma dan pilihan tarif belum pasti | `tests/eligibility.test.ts` |
| 8: penghasilan campuran | `tests/eligibility.test.ts`, `tests/audit-regression.test.ts` (memeriksa hasil, bukan hanya nilai input) |
| 9–10: tahun 2025/2026 | `tests/eligibility.test.ts`, `tests/audit-regression.test.ts` (nominal final 2025 tetap ditahan sesuai cakupan) |
| 11–12: kegiatan belum pasti dan sitasi | `tests/eligibility.test.ts`, `tests/schema.test.ts`, `tests/klasifikasi.test.ts` |
| 13–15: omzet nol, penolakan negatif, dan tarif umum | `tests/calculator.test.ts`, `tests/schemas.test.ts`, `tests/audit-pajak.test.ts` |
| Lookup regional, profesi berbeda, kode tak dikenal tanpa fallback | Empat tes tambahan di `tests/audit-pajak.test.ts`; penanganan kode tak dikenal di `tests/klasifikasi.test.ts` |

## Pemeriksaan dan penggunaan selanjutnya

Jalankan lint, pemeriksaan tipe, seluruh tes, build produksi, dan audit dependensi sebelum merge. Hasil pemeriksaan ada di [TESTING.md](TESTING.md). Pertahankan pemeriksaan CI pada PR ke repo utama. Untuk salinan organisasi, buat PR sinkronisasi dari commit hasil integrasi, bukan salinan manual file.

Repositori utama yang tercantum pada README harus dapat diakses juri. Status publik situs Vercel tidak mengubah visibilitas GitHub. Langkah pengumpulan ada di [PENGUMPULAN.md](PENGUMPULAN.md).
