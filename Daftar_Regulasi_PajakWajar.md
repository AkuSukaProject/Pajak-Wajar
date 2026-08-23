# Daftar Regulasi yang Harus Dikumpulkan
## PajakWajar · ITechno Cup 2026

**Untuk:** Sheva (penanggung jawab) · Habib · Mikail
**Tenggat pengumpulan:** 25 Agustus 2026 (Hari 2)
**Lokasi simpan:** Google Drive → folder `PajakWajar/regulasi/`

---

## ⚠️ Tiga koreksi penting sebelum mulai

Ditemukan saat verifikasi awal. **Proposal kita masih salah di tiga titik ini:**

### Koreksi 1 — Kode formulirnya kemungkinan besar bukan LA.04-01

Proposal kita menulis **LA.04-01**. Tapi dua artikel resmi di pajak.go.id konsisten menulis:

- Jenis layanan: **AS.04** — "Pemberitahuan Penggunaan NPPN dan Pembukuan Stelsel Kas"
- Sublayanan: **AS.04-01** — "Pemberitahuan Penggunaan Norma Penghitungan Penghasilan Neto (NPPN)"

Beberapa sumber lain menulis "LA.04". **Pastikan sendiri di Coretax atau dokumen DJP.** Kalau kode di produk kita salah, pengguna akan mencari menu yang tidak ada.

### Koreksi 2 — NPPN hanya berlaku SATU tahun pajak 🔴

Ini yang paling besar dan sama sekali belum tertangkap di proposal.

Pemberitahuan penggunaan NPPN **hanya berlaku untuk 1 tahun pajak.** Wajib pajak harus mengajukan **ulang setiap tahun** sebelum 31 Maret. DJP sendiri menegaskan ini.

**Dampak ke mesin kelayakan:** pertanyaan "sudah mengajukan pemberitahuan NPPN?" bukan pertanyaan sekali seumur hidup — harus **spesifik per tahun pajak yang sedang dihitung.** Ini memperkuat kenapa pemilih tahun pajak wajib ada di langkah pertama.

Judul artikel DJP-nya bahkan tegas: *"Segera Ajukan NPPN di Coretax DJP atau Pembukuan Selamanya."*

### Koreksi 3 — Persentase norma punya tiga kelompok wilayah

Bukan satu angka nasional. Contoh untuk dokter: 50% untuk sepuluh ibukota provinsi (Medan, Palembang, Jakarta, Bandung, Semarang, Surabaya, Denpasar, Manado, Makassar, Pontianak), lalu tarif berbeda untuk ibukota provinsi lainnya, dan berbeda lagi untuk daerah lainnya.

**Struktur `klu_rules.json` wajib mengakomodasi tiga kelompok wilayah.** Dan formulir harus menanyakan domisili pengguna.

---

## TINGKAT 1 — Wajib mutlak

Tanpa kelima dokumen ini, mesin kelayakan tidak bisa dibangun.

### 1.1 · PP No. 20 Tahun 2026
**Perubahan atas PP No. 55 Tahun 2022**

- Berlaku sejak **22 April 2026**
- Lembaran Negara RI Tahun 2026 **Nomor 43**

**Cari di:** jdih.kemenkeu.go.id · peraturan.go.id · pajak.go.id

**Yang harus diambil:**
- **Pasal 57** — siapa yang berhak memakai PPh Final 0,5%
- **Pasal 59** — yang dihapus (batas waktu 7 tahun)
- **Ketentuan peralihan** — perlakuan untuk tahun pajak 2025 & 2026
- Pasal tentang **penggabungan omzet** suami-istri dan perseroan perorangan
- Pasal tentang **pengecualian pekerjaan bebas**

**❓ Pertanyaan yang harus terjawab dari dokumen ini:**
1. Pembebasan Rp500 juta dihitung dari **omzet pribadi** atau **omzet konsolidasi keluarga**?
2. Ambang Rp4,8 M — **inklusif** atau **eksklusif**? (tepat Rp4,8 M itu masih boleh atau tidak?)
3. Kalau memilih tarif umum, hak 0,5% hilang **permanen** atau **mulai tahun berikutnya**?

---

### 1.2 · PP No. 55 Tahun 2022
**Penyesuaian Pengaturan di Bidang Pajak Penghasilan**

Aturan yang direvisi. Tetap diperlukan untuk memahami **apa yang berubah** dan membaca ketentuan peralihan dengan benar.

**Cari di:** jdih.kemenkeu.go.id

---

### 1.3 · PER-17/PJ/2015
**Norma Penghitungan Penghasilan Neto** — ✅ masih berlaku

Ditetapkan 10 April 2015, berlaku sejak Tahun Pajak 2016. Mencabut KEP-536/PJ./2000.

**Tautan langsung (sudah terverifikasi):**
`pajak.go.id/sites/default/files/2019-03/PER - 17.PJ_.2015.pdf`

**Yang harus diambil:**
- **Pasal 2 ayat (1)** — kewajiban pemberitahuan paling lama 3 bulan sejak awal tahun pajak
- **Lampiran I–IV** — daftar persentase norma. Berisi sekitar **1.435 profesi dan jenis usaha**
- Petunjuk penggunaan norma (Lampiran IV)

**⚠️ Ini dokumen terbesar dan paling makan waktu.** Jangan salin semuanya. Ambil **20–30 KLU** yang paling relevan untuk pekerja lepas dan usaha mikro:
- Kegiatan pekerja seni (kreator konten)
- Jasa konsultasi manajemen, hukum, akuntansi
- Jasa perancangan (desain, arsitektur)
- Jasa komputer dan perangkat lunak
- Praktik dokter, notaris, penilai
- Perdagangan eceran (online shop)
- Jasa penyediaan makanan/minuman

---

### 1.4 · UU No. 7 Tahun 2021 (UU HPP)
**Harmonisasi Peraturan Perpajakan**

**Cari di:** jdih.kemenkeu.go.id · peraturan.go.id

**Yang harus diambil:**
- **Pasal 17** — lapisan tarif progresif PPh Orang Pribadi
- **Pasal 7** — besaran PTKP
- **Pasal 7 ayat (2a)** — pembebasan PPh untuk omzet sampai Rp500 juta bagi WP Orang Pribadi

> Catatan: satu sumber menyebut fasilitas Rp500 juta ini **hanya untuk WP Orang Pribadi**, tidak untuk badan hukum. Pastikan.

---

### 1.5 · PMK 168/PMK.03/2023
**Kriteria pekerjaan bebas & bukan pegawai**

Dirujuk sebagai dasar klasifikasi kreator konten dan afiliator sebagai "bukan pegawai yang bekerja secara bebas."

**Cari di:** jdih.kemenkeu.go.id

**Yang harus diambil:** definisi dan daftar kategori pekerjaan bebas — ini fondasi saringan KLU nomor 1.

---

## TINGKAT 2 — Penting untuk kelengkapan & jawaban juri

### 2.1 · UU No. 36 Tahun 2008 tentang PPh
Induk yang diubah UU HPP. Diperlukan saat menelusuri pasal yang dirujuk silang.

### 2.2 · UU KUP (UU No. 6 Tahun 1983 jo. UU HPP)
Dasar sanksi administrasi dan pemeriksaan.
- **Pasal 29 ayat (1)** — kewenangan pemeriksaan
- **Pasal 39** — konsekuensi ketidakpatuhan yang disengaja

Dipakai untuk bagian latar belakang "risiko SP2DK".

### 2.3 · Aturan KLU / KBLI
**⚠️ Hati-hati — sedang masa transisi.**

Peraturan BPS No. 7 Tahun 2025 menggantikan KBLI 2020, dan ada Surat Edaran Bersama tanggal 25 Maret 2026 yang mengatur mekanisme transisi KBLI 2020 → 2025.

Cek apakah kode KLU di PER-17/PJ/2015 (yang berbasis klasifikasi lama) masih cocok, atau perlu pemetaan.

**Cari di:** bps.go.id · oss.go.id · pajak.go.id

---

## TINGKAT 3 — Bukti masalah untuk README & slide

Bukan untuk kode, tapi untuk membuktikan masalahnya nyata. Simpan sebagai **tangkapan layar + tautan + tanggal akses.**

### 3.1 · Penegasan DJP soal kreator konten — 5 Juni 2026
Unggahan resmi Instagram DJP: influencer, content creator, selebgram, blogger, vlogger tidak dikenakan PPh Final UMKM 0,5%.

**Sumber sekunder yang bisa dikutip:** ortax.org, ikpi.or.id, economica.id

### 3.2 · Tanggapan Menkeu Purbaya — awal Juli 2026
"Kalau influencer, itu yang penghasilan besar. Kalau yang kecil yang masih UMKM, nggak kena."

**Sumber:** ikpi.or.id

### 3.3 · Artikel resmi DJP tentang affiliator
"Affiliator: Cuan Jalan, Pajak Aman" di pajak.go.id — menegaskan penghasilan afiliasi masuk pekerjaan bebas dan dikenai tarif progresif Pasal 17, bukan PPh final 0,5%.

Artikel ini juga menyebut bahwa **bukti potong dari platform sudah terekam otomatis di Coretax** — penting untuk membatasi klaim fitur OCR kita.

### 3.4 · Panduan NPPN di Coretax dari DJP
Dua artikel di pajak.go.id yang memuat langkah pengajuan AS.04-01. Berguna untuk fitur "langkah tindak lanjut" di produk.

---

## Struktur folder Drive

```
PajakWajar/regulasi/
├── 00_CATATAN.md              ← ringkasan pasal + jawaban 3 pertanyaan
├── tingkat-1-wajib/
│   ├── PP-20-2026.pdf
│   ├── PP-55-2022.pdf
│   ├── PER-17-PJ-2015.pdf
│   ├── UU-7-2021-HPP.pdf
│   └── PMK-168-2023.pdf
├── tingkat-2-pendukung/
│   ├── UU-36-2008-PPh.pdf
│   ├── UU-KUP.pdf
│   └── KLU-KBLI/
└── tingkat-3-bukti-masalah/
    ├── djp-penegasan-kreator-5juni2026.png
    ├── menkeu-purbaya-juli2026.png
    └── sumber.md          ← tautan + tanggal akses
```

---

## Format `00_CATATAN.md`

Untuk setiap aturan yang masuk ke kode, catat begini:

```markdown
## Kewajiban pemberitahuan NPPN

**Aturan:** Pemberitahuan disampaikan paling lama 3 bulan sejak awal
tahun pajak. Lewat tenggat → wajib pembukuan.

**Hanya berlaku 1 tahun pajak** — harus diajukan ulang setiap tahun.

**Dasar:** PER-17/PJ/2015 Pasal 2 ayat (1)

**Kode layanan Coretax:** AS.04 → sublayanan AS.04-01
(⚠️ sebagian sumber menulis LA.04 — sudah dikonfirmasi ke Coretax pada [tanggal])

**Dipakai di:** eligibility.ts → saringan 2
```

Catatan ini punya dua fungsi: rujukan saat menulis kode, **dan bahan jawaban saat juri bertanya "dari mana dasar hukumnya?"**

---

## Pembagian tugas pengumpulan

| Siapa | Tugas |
|---|---|
| **Sheva** | Tingkat 1 lengkap + isi `00_CATATAN.md` + jawab 3 pertanyaan verifikasi |
| **Habib** | Tingkat 2 + tangkapan layar Tingkat 3 |
| **Mikail** | Cek kode layanan Coretax (AS.04-01 vs LA.04-01) + kutipan pasal yang akan tampil di kartu vonis |

---

## Aturan yang tidak boleh dilanggar

**Hanya sumber primer.** jdih.kemenkeu.go.id, peraturan.go.id, pajak.go.id, atau teks PDF resmi.

**Jangan pakai blog konsultan sebagai dasar kode.** Ditemukan artikel Februari 2026 yang masih memuat batas 7 tahun — padahal ketentuan itu sudah dihapus pada April 2026. Blog boleh dipakai untuk menemukan *arah*, tapi angka dan pasal wajib dari teks asli.

**Catat tanggal akses** untuk setiap sumber. Kalau juri bertanya kapan kalian memverifikasi, ada jawabannya.

**Kalau tidak yakin, tulis tidak yakin.** Lebih baik produk berkata "verifikasi ke DJP" daripada memberi vonis pasti dari dasar yang goyah. Angka pajak yang salah membuat pengguna kurang bayar dan kena sanksi.
