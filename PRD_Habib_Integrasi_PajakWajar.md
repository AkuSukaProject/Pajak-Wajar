# PRD — Integrasi, OCR, Dokumentasi & Deployment
## PajakWajar · ITechno Cup 2026

**Pemilik dokumen:** Habib
**Peran:** Integration, OCR & Documentation Owner
**Versi:** 1.0 · 24 Agustus 2026
**Tenggat:** 6 September 2026, 23.59 WIB (target internal: submit 5 September)

---

# BAGIAN I — KONTEKS GLOBAL

## 1. Apa yang kita bangun

PajakWajar menjawab satu pertanyaan yang tidak dijawab produk mana pun:

> **"Skema pajak mana yang secara hukum boleh saya pakai?"**

Semua pesaing — OnlinePajak, Pajakku, TaxCalc, bahkan kalkulator di aplikasi resmi M-Pajak DJP — langsung menghitung angka. Mereka mengasumsikan pengguna sudah tahu haknya. Padahal di situ orang salah, dan salahnya berujung denda.

Kita menempatkan **uji kelayakan di hulu**, baru menghitung.

Urutannya selalu: **KELAYAKAN → PERHITUNGAN → KONSEKUENSI → BERKAS**

## 2. Kenapa masalahnya nyata

**5 Juni 2026** — DJP menegaskan influencer, content creator, selebgram, blogger, dan vlogger **tidak boleh** memakai PPh Final UMKM 0,5%, karena penghasilan mereka dari jasa dan keahlian pribadi sehingga tergolong pekerjaan bebas (PP 20/2026).

Kegaduhan nasional; Menteri Keuangan sampai ikut menanggapi. Inti perdebatannya satu kalimat: *"jadi saya berhak skema apa?"*

**PP 20/2026** berlaku 22 April 2026, merevisi PP 55/2022 — batas 7 tahun dihapus, penerima dipersempit, ambang omzet dihitung gabungan keluarga.

## 3. SDG (Kesesuaian Tema: 20% bobot)

- **SDG 8** — melindungi pekerja mandiri dan usaha mikro dari sanksi administrasi yang tidak perlu
- **SDG 9** — mesin aturan perpajakan deterministik berbasis web

## 4. Empat modul & pemilik

| # | Modul | Penanggung jawab |
|---|---|---|
| 1 | Eligibility Gatekeeper | Sheva |
| 2 | Multi-Scheme Calculator | Sheva |
| 3 | Bupot Reconciler (OCR + manual) | **Habib** |
| 4 | Coretax Pre-Filing PDF | Mikail (tata letak) + **Habib** (data & integrasi) |

## 5. Prinsip yang tidak boleh dilanggar

1. **Deterministik, bukan generatif** — tidak ada LLM yang memutuskan hak hukum seseorang
2. **Client-side** — perhitungan di peramban; OCR satu-satunya pengecualian, dan wajib dengan persetujuan eksplisit
3. **Setiap vonis bersitasi** — selalu sebut dasar hukumnya
4. **Bukan nasihat pajak** — alat bantu simulasi pra-lapor

---

# BAGIAN II — LINGKUP KERJA HABIB

## 6. Misi

> Menyambungkan mesin aturan Sheva ke antarmuka Mikail sampai berjalan mulus dari ujung ke ujung, membangun rekonsiliasi bukti potong yang **tidak pernah bisa gagal total**, dan memastikan repositori serta dokumentasi bicara sendiri di hadapan juri.

## 7. Bobot yang kamu pegang

| Kriteria | Bobot | Kaitan |
|---|---|---|
| Dokumentasi & Repositori | **10%** | Sepenuhnya kamu |
| Fungsionalitas Website | 20% | Kamu yang menyambungkan agar berjalan utuh |
| Implementasi Teknologi | 15% | Struktur kode, keamanan dasar, deployment |
| Live Demo (final) | 25% | Kamu yang menjamin sistemnya tidak mati |

**Dokumentasi 10% adalah poin dengan imbal hasil tertinggi di seluruh lomba.** Bisa diamankan penuh dalam beberapa jam, dan paling sering dibuang percuma oleh tim lain.

---

## 8. Deliverable

### D1 — Kontrak data & kerangka repo (Hari 1) 🔴 JALUR KRITIS

Kamu yang memimpin kesepakatan bentuk data, karena kamu yang akan menyambungkannya.

**Yang harus selesai Hari 1:**
- Repositori dibuat, cabang disiapkan
- `.gitignore` (**pastikan `.env` masuk sebelum ada kunci apa pun**)
- `.env.example` tanpa nilai asli
- Tipe `ProfilWajibPajak` dan `HasilKelayakan` disepakati bertiga dan di-commit
- `src/mock/hasilKelayakan.ts` — supaya Mikail bisa jalan tanpa menunggu Sheva

**Struktur repo:**

```
pajakwajar/
├── README.md                 ← template resmi ITechno Cup
├── CLAUDE.md
├── .env.example
├── docs/
│   ├── ARSITEKTUR.md
│   ├── REGULASI.md           ← catatan pasal dari Sheva
│   └── screenshots/
├── data/
│   └── klu_rules.json
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── eligibility.ts    ← Sheva
│   │   ├── calculator.ts     ← Sheva
│   │   ├── schemas.ts        ← Sheva
│   │   └── ocr.ts            ← kamu
│   ├── mock/
│   └── types/
└── tests/
    └── eligibility.test.ts
```

**Alur Git:** `feat/rule-engine` (Sheva) · `feat/ui-eligibility` (Mikail) · `feat/ocr-pdf` (kamu). Jangan push langsung ke `main`; pakai PR meski tim kecil.

> Riwayat PR yang rapi terlihat profesional saat juri menelusuri repo. Dan **pastikan commit merata dari tiga akun** — kalau 90% dari satu orang, juri akan menanyakan kontribusi tim di sesi tanya jawab.

---

### D2 — Form manual bukti potong (Hari 3–4) 🔴 **BANGUN INI SEBELUM OCR**

Ini aturan yang menyelamatkan proyek: **mode manual harus berfungsi penuh sebelum satu baris OCR ditulis.**

Kalau OCR macet di Hari 9, produk tetap utuh. Kalau OCR dikerjakan duluan dan gagal, tidak ada apa pun yang bisa didemokan.

**Field yang dibutuhkan:**

```ts
type BuktiPotong = {
  nomorBupot: string;
  npwpPemotong: string;
  namaPemotong: string;
  jenisPph: 'PPH_21' | 'PPH_23';
  dpp: number;           // dasar pengenaan pajak
  pphDipotong: number;
  masaPajak: string;
  sumber: 'manual' | 'ocr';   // untuk transparansi ke pengguna
};
```

Agregasi total kredit pajak → dikirim ke `calculator.ts` untuk memotong pajak terutang.

**Kasus tepi yang harus ditangani:** kredit bupot lebih besar dari pajak terutang → status **lebih bayar**, bukan angka negatif.

---

### D3 — OCR bukti potong (Hari 7–8) ⚠️ opsional, boleh gagal

Gemini API dengan structured JSON output. Ekstraksi: nomor bupot, NPWP pemotong, DPP, PPh dipotong.

**Batasan cakupan yang harus kamu sampaikan jujur:**

Bukti potong dari platform digital **sudah terekam otomatis di Coretax** — DJP sendiri menulis pengguna tinggal cek, konfirmasi, dan mengkreditkan tanpa mengumpulkan dokumen manual. Shopee sudah terintegrasi.

**Jadi nilai OCR kita terbatas pada bupot non-platform** — klien B2B, rumah sakit untuk dokter, perusahaan untuk konsultan. Tulis batasan ini di README. Mengakuinya duluan lebih kuat daripada diketahui juri belakangan.

**Wajib:**
- Kunci API **hanya di server** (Server Action / Route Handler), tidak pernah di klien
- **Persetujuan eksplisit** sebelum berkas dikirim — pengguna harus tahu fotonya keluar dari peramban
- Berkas **tidak disimpan** setelah diproses
- Hasil OCR **dapat diedit** sebelum dipakai — jangan langsung dipercaya
- Tombol **"isi manual"** menonjol dan selalu tersedia

---

### D4 — Integrasi mesin ↔ UI (Hari 6–8)

Mengganti `mock/hasilKelayakan.ts` dengan `eligibility.ts` sungguhan, lalu memastikan alur berjalan utuh:

```
Input profil → eligibility.ts → HasilKelayakan → UI kartu vonis
                    ↓
              skema BOLEH → calculator.ts → angka pajak
                    ↓
              kredit bupot → pajak akhir
                    ↓
              generatePDF() → kertas kerja
```

**Yang harus kamu jaga:** aturan `'use client'`. Seluruh perhitungan pajak berjalan di peramban — itu klaim privasi kita. Server Action **hanya** dipakai untuk meneruskan gambar ke Gemini agar kunci API tidak bocor.

> Kalau perhitungan tidak sengaja pindah ke server, klaim "data tidak keluar dari peramban" jadi tidak benar. Juri akan menanyakan ini.

---

### D5 — Penafian hukum & penanganan persetujuan (Hari 8)

**Tiga tempat wajib:**
1. Di layar hasil — ringkas, terlihat, tidak disembunyikan
2. Di PDF kertas kerja — di setiap halaman
3. Di README — bagian tersendiri

**Isi yang benar:**

> PajakWajar adalah alat bantu simulasi pra-lapor untuk keperluan edukasi. Hasil perhitungan bukan nasihat pajak dan tidak menggantikan konsultasi dengan Direktorat Jenderal Pajak atau konsultan pajak berizin. Verifikasi seluruh angka melalui akun Coretax Anda sebelum melaporkan SPT.

**Dan koreksi klaim privasi.** Proposal sebelumnya menulis "Zero Data Retention" tanpa kualifikasi. Itu tidak akurat selama OCR aktif. Tulis begini:

> Perhitungan pajak dan data omzet diproses sepenuhnya di peramban Anda dan tidak dikirim ke server kami. Khusus untuk pembacaan otomatis bukti potong, berkas dikirim ke layanan OCR setelah Anda memberi persetujuan; berkas tidak disimpan. Anda dapat memilih memasukkan data secara manual untuk menghindari pengiriman berkas.

---

### D6 — README (Hari 10–11) ⭐ 10% bobot

**Wajib memakai template resmi ITECHNO CUP** yang ditautkan di guidebook. Unduh dulu, jangan bikin sendiri.

**Struktur wajib menurut guidebook:**
1. Penjelasan aplikasi (latar belakang + tujuan)
2. Fitur utama (pembeda & keunggulan)
3. Teknologi yang digunakan — **dengan peruntukannya**, ini eksplisit di Ketentuan Peserta poin 5
4. Cara instalasi
5. Cara penggunaan

**Yang menaikkan nilai di atas syarat minimum:**

- **Screenshot** — guidebook sendiri menyarankannya. Minimal tiga: kartu vonis "TIDAK BERHAK" dengan sitasi pasal, panel perbandingan, dan PDF kertas kerja.
- **Diagram alur** — Mermaid, ter-render langsung di GitHub
- **Bagian SDG eksplisit** — SDG 8 dan 9, target mana, fitur mana yang menjawabnya. Jangan biarkan juri menebak.
- **Bagian penggunaan AI** — Ketentuan Peserta poin 7 mewajibkan tanggung jawab penuh. Tulis jujur: bagian mana yang dibantu AI dan bagaimana kalian memverifikasinya. Ini menaikkan kredibilitas, bukan menurunkan.
- **Sebutkan `tests/eligibility.test.ts`** — adanya pengujian otomatis untuk produk yang menyentuh kewajiban hukum adalah sinyal kematangan yang jarang muncul di lomba mahasiswa.

**Contoh penjelasan peruntukan teknologi:**

> **Next.js 15** — dipilih karena seluruh perhitungan pajak berjalan di sisi klien demi menjaga data finansial tidak keluar dari peramban pengguna. App Router memberi struktur routing yang jelas untuk alur bertahap. Astro sempat dipertimbangkan, tetapi keunggulannya pada konten statis tidak relevan untuk produk yang hampir seluruhnya interaktif.

---

### D7 — Deployment & pemantauan (Hari 11–12)

- Vercel, dari cabang `main`
- Variabel lingkungan diatur di dasbor Vercel, **bukan di repo**
- **Uji tautan dari mode penyamaran dan dari jaringan lain** — bukan hanya dari laptop kamu
- Uji di ponsel dengan data seluler

**Uji instalasi dari nol.** Clone ke folder baru, ikuti README kata per kata. Kalau ada langkah yang cuma ada di kepala kalian, juri akan gagal menjalankannya.

**Guidebook eksplisit:** panitia tidak bertanggung jawab kalau proyek tidak dapat diakses karena masalah platform hosting. Pastikan tautan tetap hidup sampai penjurian selesai — dan cek ulang setelah 6 September.

---

### D8 — Materi presentasi final (Hari 12, kalau lolos)

Dikirim ke panitia **maksimal H-1** sebelum final (19 September).

Isi: latar belakang, solusi masalah, tujuan, fitur, lalu demo aplikasi.

**Rekam video demo cadangan.** Live Demo bobotnya 25%, dan koneksi Zoom bisa bermasalah kapan saja.

---

## 9. Jadwal

| Hari | Tanggal | Sasaran |
|---|---|---|
| 1 | 24 Ags | Repo, `.gitignore`, kontrak tipe, `mock/` |
| 2 | 25 Ags | Kerangka PDF + kumpulkan regulasi Tingkat 2 & 3 |
| 3 | 26 Ags | Form manual bupot — struktur data |
| 4 | 27 Ags | Form manual bupot selesai + agregasi kredit |
| 5 | 28 Ags | Dukung Sheva; siapkan kerangka integrasi |
| 6 | 29 Ags | **Integrasi mesin ↔ UI** dimulai |
| 7 | 30 Ags | Integrasi selesai; mulai OCR |
| 8 | 31 Ags | OCR + persetujuan + penafian |
| 9 | 1 Sep | Perbaikan integrasi; uji alur menyeluruh |
| 10 | 2 Sep | README — kerangka + screenshot |
| 11 | 3 Sep | README selesai + `ARSITEKTUR.md` + deployment |
| 12 | 4 Sep | Uji instalasi dari nol + latihan tanya jawab |
| 13 | 5 Sep | **Submit** |

---

## 10. Pertanyaan juri yang akan diarahkan ke kamu

**"Data pengguna disimpan di mana?"**
→ Perhitungan sepenuhnya di peramban, tidak ada basis data. Berkas bupot hanya dikirim ke layanan OCR setelah persetujuan eksplisit, tidak disimpan, dan pengguna bisa memilih input manual sepenuhnya.

**"Kalau API OCR mati saat demo?"**
→ Tunjukkan tombol input manual. Sistem dirancang agar OCR sepenuhnya opsional.

**"Bagian mana yang dibuat AI, dan bisa jelaskan kodenya?"**
→ Jawab jujur, tunjuk bagian di README, lalu jelaskan alurnya. Guidebook memperbolehkan AI tapi menuntut tanggung jawab penuh — dan **setiap anggota harus bisa menjelaskan bagian yang dia klaim.**

**"Kenapa Next.js?"**
→ Jawaban ada di D6. Sebutkan juga alternatif yang dipertimbangkan dan alasan menolaknya.

**"Kalau penggunanya 10.000 besok, apa yang pecah duluan?"**
→ Tidak ada basis data, jadi perhitungan berskala bebas. Titik tekan pertama adalah kuota API OCR — mitigasinya pembatasan laju dan input manual sebagai jalur utama.

---

## 11. Definisi Selesai

- [ ] `.env` tidak pernah masuk repo — cek riwayat commit, bukan hanya kondisi sekarang
- [ ] Form manual bupot berfungsi penuh **tanpa** OCR
- [ ] Kunci API hanya di server, tidak pernah terekspos ke klien
- [ ] Persetujuan eksplisit sebelum berkas dikirim ke OCR
- [ ] Hasil OCR bisa diedit sebelum dipakai
- [ ] Klaim privasi di README akurat — tidak menulis "zero retention" tanpa kualifikasi OCR
- [ ] Penafian ada di layar, di PDF, dan di README
- [ ] README memakai template resmi ITechno Cup
- [ ] Peruntukan setiap framework dijelaskan
- [ ] Bagian SDG eksplisit
- [ ] Minimal 3 screenshot
- [ ] Instalasi diuji dari clone kosong oleh orang yang tidak menulis README-nya
- [ ] Tautan live diuji dari mode penyamaran dan jaringan lain
- [ ] Commit merata dari tiga akun
- [ ] Video demo cadangan direkam

---

## 12. Catatan penutup

Sheva memegang kebenaran hukumnya. Mikail memegang apakah kebenaran itu sampai. **Kamu memegang apakah semuanya benar-benar berjalan saat juri membukanya.**

Dua hal yang paling sering menjatuhkan tim bagus, dan keduanya ada di wilayahmu: tautan yang mati saat dinilai, dan README yang ditulis dua jam sebelum tenggat.

Keduanya bisa dicegah, dan biayanya cuma mengerjakannya lebih awal.
