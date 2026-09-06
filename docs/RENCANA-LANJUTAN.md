# Perintah kerja lanjutan — batas 2 dan batas 3

Ditulis 6 September 2026, 22.55 WIB, sebagai serah terima ke sesi berikutnya.
Basis kode: commit `c6f9b64` (main), 209 tes lulus, lint dan build bersih, live di
https://pajak-wajar.vercel.app/

Dokumen ini memuat **hasil verifikasi yang sudah dilakukan** dan **apa yang masih
harus diverifikasi sebelum menulis kode**. Jangan melewati bagian verifikasi.

---

## Aturan yang mengikat (jangan dilanggar walau terburu)

1. Setiap angka pajak lahir dari parameter di `data/klu_rules.json`, bukan dari ingatan.
2. Parameter baru wajib membawa `dasarHukum` berisi nama regulasi, pasal, fungsi, URL, dan `statusVerifikasi`.
3. Sumber yang boleh: `jdih.kemenkeu.go.id`, `pajak.go.id`, teks PP/PMK/PER langsung. Blog konsultan dan ringkasan pihak ketiga **tidak boleh**.
4. Bila teks aslinya tidak dapat dibaca (PDF JDIH sering berupa pindaian `/DCTDecode`), **tandai `DALAM_REVIEW` dan tahan perhitungannya** — jangan menebak.
5. `data/klu_rules.schema.json` memakai `additionalProperties: false`. Parameter baru harus ditambahkan ke skema juga, kalau tidak `tests/schema.test.ts` gagal.

---

## Tugas A — Batas 2: pisah harta (PH) dan pisah kewajiban (MT)

**Status: rumus sudah terverifikasi. Siap dikerjakan.**

### Yang sudah terverifikasi

Sumber: halaman DJP "Kupas Tuntas Aspek Perpajakan Suami dan Istri",
https://www.pajak.go.id/en/node/119134 — merujuk **UU PPh Pasal 8 ayat (2) huruf b dan c serta ayat (3)**.

```
PKP        = (neto suami + neto istri) − PTKP status K/I/(tanggungan, maks 3)
PPh gabung = tarif progresif berlapis atas PKP
PPh Anda   = (neto Anda ÷ neto gabungan) × PPh gabung
```

### Yang sudah tersedia di kode, jangan dibuat ulang

| Kebutuhan | Sudah ada di |
|---|---|
| Neto pasangan dari pengguna | `ProfilWajibPajak.penghasilanNetoPasangan` |
| Tambahan PTKP K/I sebesar Rp54.000.000 | `parameterPajak.ptkp.tambahanIstriDigabung` (terverifikasi, PMK 101/PMK.010/2016 Pasal 1 huruf c) |
| Tarif progresif berlapis | `hitungTarifProgresifBerlapis` di `src/lib/calculator.ts` |
| Penggabungan neto ke perhitungan | parameter `penghasilanNetoPasangan` pada `hitungNppn` dan `hitungTarifUmum` |

### Yang perlu dibuat

1. **`src/lib/index.ts`** — cabang baru untuk `PISAH_HARTA` dan `PISAH_KEWAJIBAN`:
   syaratnya sama dengan `GABUNG` (pasangan berpenghasilan, bukan gaji satu pemberi
   kerja, neto pasangan terisi), lalu hasilnya **dibagi proporsional**.
2. **`src/types/pajak.ts`** — tambahkan pada `RincianNppn` dan `RincianTarifUmum`:
   ```ts
   /** Terisi hanya pada pisah harta / pisah kewajiban. */
   pembagianProporsional?: {
     netoGabungan: number;
     netoWajibPajak: number;
     porsi: number;          // netoWajibPajak / netoGabungan
     pajakGabungan: number;  // sebelum dibagi
   };
   ```
3. **`src/components/eligibility/AlurKelayakan.tsx`** — tampilkan pertanyaan
   "hanya gaji satu pemberi kerja" dan kolom neto pasangan juga untuk PH/MT.
   Sekarang kondisinya `statusPerpajakanPasangan === 'GABUNG'`; longgarkan.
4. **Kartu hasil dan PDF** — wajib menampilkan baris pembagiannya.

### ⚠️ Peringatan label — ini bagian paling berbahaya

Pada PH/MT, angka yang tampil **berubah makna**: dari "pajak atas seluruh
penghasilan" menjadi "**bagian pajak Anda**". Label yang tidak diubah akan
membuat pengguna mengira itu pajak seluruh keluarga. Ganti judul nominalnya,
misalnya "Perkiraan bagian pajak Anda", dan tampilkan `pajakGabungan` beserta
porsinya agar dapat ditelusuri.

### Tes yang wajib ditulis (`tests/keluarga.test.ts`)

- Fixture hitung tangan. Contoh yang dapat dipakai, memakai `dasarLajang` yang ada
  (KLU 86201, kelompok1, Norma 50%, omzet 800 juta, PTKP K/2):
  neto WP 400 juta, neto pasangan 100 juta, neto gabungan 500 juta,
  PTKP 121.500.000, PKP 378.500.000, PPh gabung **63.625.000**,
  porsi WP 400/500 = 0,8 → **bagian WP 50.900.000**. Hitung ulang sendiri sebelum dipakai.
- Porsi suami + porsi istri harus sama dengan pajak gabungan (tanpa kebocoran pembulatan).
- Neto pasangan 0 tidak boleh menghasilkan pembagian nol per nol.
- `GABUNG` tidak boleh ikut terbawa cabang pembagian ini.

---

## Tugas B — Batas 3: penghasilan final di luar usaha

**Status: verifikasi belum lengkap. JANGAN menulis kode sebelum bagian ini tuntas.**

### Yang sudah terverifikasi sebagian

| Jenis | Temuan | Status |
|---|---|---|
| Bunga deposito dan tabungan | final **20%** dari jumlah bruto; deposito di bawah Rp7.500.000 tidak dipotong | perlu dikonfirmasi ke teks PP-nya |
| Dividen dalam negeri | dikecualikan dari objek PPh bila diinvestasikan di dalam negeri dalam jangka waktu tertentu; rujukan yang muncul PMK 18/PMK.03/2021 dan UU HPP | perlu dikonfirmasi |
| Penjualan saham di bursa | **belum ditemukan** angkanya pada sumber yang diizinkan | belum terverifikasi |

Halaman rujukan yang perlu dibuka satu per satu:
- https://pajak.go.id/en/node/57574 — PPh atas bunga deposito dan tabungan
- https://pajak.go.id/en/node/63169 — pemotongan PPh atas bunga deposito
- https://pajak.go.id/en/node/34297 — PPh Pasal 4 ayat (2)

### Langkah wajib sebelum menulis kode

1. Buka tiap halaman di atas, salin bunyi pasalnya, catat nomor PP/PMK-nya.
2. Bila teks aslinya tidak terbaca, **hentikan** untuk jenis penghasilan itu dan tandai `DALAM_REVIEW`.
3. Masukkan tiap tarif sebagai parameter tersendiri di `data/klu_rules.json`, lengkap dengan `dasarHukum`, lalu perbarui `klu_rules.schema.json`.

### Bentuk fitur yang disarankan

Penghasilan final **tidak masuk** perhitungan progresif. Karena itu fitur ini
**bukan** menambah aritmetika ke tiga skema yang ada, melainkan panel
klasifikasi: pengguna mencatat sumber penghasilannya, sistem menyatakan mana
yang sudah selesai dipotong pihak lain dan mana yang masuk SPT sebagai
penghasilan final, masing-masing dengan dasar hukumnya. Kesalahan di sini tidak
akan merusak angka ketiga skema — itu sebabnya panel klasifikasi lebih aman
daripada mengubah kalkulator.

### Bagian yang BUKAN soal sumber, melainkan penafsiran — hati-hati

Pembagian pembebasan **Rp500 juta** antar beberapa kegiatan yang sama-sama
berhak PPh Final. UU HPP Pasal 7 ayat (2a) menyebut "dalam 1 Tahun Pajak" tanpa
mengatur pembagian antar kegiatan. Pembacaan yang paling masuk akal: pembebasan
itu melekat pada Wajib Pajak, jadi diterapkan **sekali** atas jumlah peredaran
bruto seluruh kegiatan yang berhak final — bukan sekali per kegiatan.

**Itu tetap penafsiran, bukan kutipan.** Bila hendak dipakai, tandai
`DALAM_REVIEW`, tulis alasannya di `docs/REGULASI.md`, dan tampilkan status itu
di antarmuka. Jangan menyajikannya sebagai vonis pasti.

---

## Cara kerja yang diminta pemilik repo

- **Gabungkan kedua tugas dalam satu perubahan.** Jangan membuat PR terpisah per langkah; CI dan merge berulang memakan waktu.
- Kerjakan sampai kode siap dan hijau lebih dulu; urusan PR, merge, dan sinkronisasi ke `origin` boleh menyusul.
- Remote: `pribadi` = `samythh/Pajak-Wajar` (repo utama, sumber deployment Vercel), `origin` = `AkuSukaProject/Pajak-Wajar` (salinan tim). Jangan commit langsung ke `main`; pakai cabang.

## Pemeriksaan sebelum menyatakan selesai

```bash
npm run lint          # bersih, --max-warnings 0
npm run typecheck     # tanpa any
npm test              # 209 tes lama tetap lulus + tes baru
npm run build
```

Lalu jalankan alurnya di peramban terhadap build produksi (`npx next start -p 3100`),
bukan hanya mengandalkan tes. Dua kali dalam sesi sebelumnya, kesalahan justru ada
pada skrip uji yang menyasar kolom yang salah — periksa dengan `getByLabel`, bukan
`.last()`.

## Yang sudah selesai dan tidak perlu diulang

- Norma dihitung per kegiatan lalu dijumlahkan (PER-17/PJ/2015 Pasal 5) — `src/lib/kegiatan.ts`
- Uji ambang Norma dan dasar tarif umum memakai omzet seluruh kegiatan
- Perhitungan keluarga untuk pelaporan **gabung**, termasuk pengecualian gaji satu pemberi kerja
- Tambahan PTKP K/I terverifikasi dan masuk data aturan
- Pilihan status pasangan menyesuaikan keadaan keluarga
- Kamus 29 istilah, penanda isian belum lengkap, tangkapan layar dan video demo terkini
