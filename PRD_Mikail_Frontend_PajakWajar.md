# PRD — Frontend & Pengalaman Pengguna
## PajakWajar · ITechno Cup 2026

**Pemilik dokumen:** Mikail
**Peran:** Frontend & UX Owner
**Versi:** 1.0 · 24 Agustus 2026
**Tenggat:** 6 September 2026, 23.59 WIB (target internal: submit 5 September)

---

# BAGIAN I — KONTEKS GLOBAL

## 1. Apa yang kita bangun

PajakWajar menjawab satu pertanyaan yang tidak dijawab produk mana pun:

> **"Skema pajak mana yang secara hukum boleh saya pakai?"**

Semua pesaing — OnlinePajak, Pajakku, TaxCalc, bahkan kalkulator di aplikasi resmi M-Pajak DJP — langsung menghitung angka. Mereka mengasumsikan pengguna sudah tahu haknya. Padahal di situ orang salah, dan salahnya berujung denda.

Kita menempatkan **uji kelayakan di hulu**, baru menghitung.

## 2. Kenapa masalahnya nyata

**5 Juni 2026** — DJP menegaskan influencer, content creator, selebgram, blogger, dan vlogger **tidak boleh** memakai PPh Final UMKM 0,5%, karena penghasilan mereka dari jasa dan keahlian pribadi sehingga tergolong pekerjaan bebas (PP 20/2026).

Kegaduhan nasional. Menteri Keuangan sampai ikut menanggapi.

Inti perdebatannya satu kalimat: *"jadi saya berhak skema apa?"*

**PP 20/2026** berlaku 22 April 2026, merevisi PP 55/2022. Batas 7 tahun dihapus, penerima dipersempit, ambang omzet kini dihitung gabungan keluarga.

## 3. SDG (Kesesuaian Tema: 20% bobot)

- **SDG 8** — melindungi pekerja mandiri dari sanksi administrasi yang tidak perlu
- **SDG 9** — mesin aturan perpajakan deterministik berbasis web

## 4. Empat modul

| # | Modul | Penanggung jawab |
|---|---|---|
| 1 | Eligibility Gatekeeper | Sheva |
| 2 | Multi-Scheme Calculator | Sheva |
| 3 | Bupot Reconciler (OCR + manual) | Habib |
| 4 | Coretax Pre-Filing PDF | **Mikail** (tata letak) + Habib (data) |

## 5. Prinsip yang tidak boleh dilanggar

1. **Deterministik, bukan generatif** — tidak ada LLM yang memutuskan hak hukum seseorang
2. **Client-side** — data pajak tidak keluar dari peramban (kecuali OCR, dengan persetujuan eksplisit)
3. **Setiap vonis bersitasi** — selalu sebut dasar hukumnya
4. **Bukan nasihat pajak** — alat bantu simulasi pra-lapor

---

# BAGIAN II — LINGKUP KERJA MIKAIL

## 6. Misi

> Membuat vonis kelayakan yang rumit secara hukum terasa **jelas dalam tiga detik** bagi orang yang tidak paham pajak — dan membuat momen "TIDAK BERHAK" jadi hal yang diingat juri setelah presentasi selesai.

## 7. Bobot yang kamu pegang

| Kriteria | Bobot | Kaitan |
|---|---|---|
| UI/UX & Responsivitas | **15%** | Sepenuhnya kamu |
| Fungsionalitas Website | 20% | Kamu yang membuatnya terlihat berhasil |
| Live Demo (final) | 25% | Layar kamu yang dilihat juri |

---

## 8. Arah desain

**Jangan pakai estetika default AI.** Tiga yang paling mudah dikenali juri: latar krem hangat + serif kontras tinggi + aksen terakota; latar nyaris hitam + satu aksen hijau asam; tata letak koran dengan garis rambut dan sudut siku. Hindari ketiganya.

**Subjeknya: kepastian hukum, bukan keuangan.** Ini pembeda arah desain kita. Produk pajak lain memakai bahasa visual fintech — hijau, grafik naik, kesan "hemat uang". Produk kita bukan soal hemat, tapi soal **tahu posisi hukummu**.

Rujukan visualnya: dokumen resmi, stempel, berkas, sitasi. Bukan dompet digital.

### Token warna (usulan — silakan revisi asal punya alasan)

| Peran | Nilai | Kegunaan |
|---|---|---|
| Kertas | `#FBFAF7` | Latar utama |
| Tinta | `#1A1D21` | Teks utama |
| Stempel | `#8B2F2F` | Status TIDAK BERHAK |
| Verifikasi | `#1F5F4A` | Status BERHAK |
| Tertahan | `#8A6D1F` | Status PERLU DIPASTIKAN |
| Margin | `#6B7280` | Sitasi, keterangan |

Tiga status wajib **berbeda bentuk, bukan cuma warna** — ada penilai dengan buta warna, dan ini juga poin aksesibilitas.

### Tipografi

Dua peran minimum:
- **Display** — untuk vonis kelayakan. Pilih yang berkarakter, jangan Inter/Poppins.
- **Body** — untuk penjelasan dan sitasi.
- **Mono** (opsional) — untuk nominal rupiah dan nomor pasal. Angka pajak dibaca dan dibandingkan; lebar tetap membantu.

### Elemen tanda tangan

**Kartu Vonis Kelayakan.** Satu elemen yang diingat juri. Bukan kartu biasa — ini yang membedakan kita dari kalkulator.

```
┌────────────────────────────────────────────┐
│  ◆ TIDAK BERHAK                            │
│                                            │
│  PPh Final UMKM 0,5%                       │
│                                            │
│  Profesi Anda tergolong pekerjaan bebas.   │
│                                            │
│  ── Dasar hukum ──────────────────────     │
│  PP 20/2026 Pasal 57                       │
│  Penegasan DJP, 5 Juni 2026                │
│                                            │
│  [ Lihat kutipan pasal ▾ ]                 │
└────────────────────────────────────────────┘
```

Bagian sitasi itu yang menjual. Tidak ada pesaing yang menunjukkan dasar hukum.

---

## 9. Deliverable

### D1 — Kontrak data & kerangka (Hari 1) 🔴 JALUR KRITIS

**Hari pertama, sepakati bentuk keluaran `eligibility.ts` bersama Sheva dan Habib.** Setelah itu buat berkas data palsu dan **bangun seluruh UI di atasnya.**

```ts
// mock/hasilKelayakan.ts — pakai ini sampai mesin Sheva siap
export const mockHasil = {
  skema: [
    { id: 'PPH_FINAL_05', status: 'TIDAK_BOLEH',
      alasan: 'Profesi Anda tergolong pekerjaan bebas.',
      dasarHukum: 'PP 20/2026 Pasal 57' },
    { id: 'NPPN', status: 'PERLU_DIPASTIKAN',
      alasan: 'Status pemberitahuan LA.04-01 belum dipastikan.',
      dasarHukum: 'PMK 168/2023' },
    { id: 'TARIF_UMUM', status: 'BOLEH',
      alasan: 'Tersedia tanpa syarat tambahan.',
      dasarHukum: 'UU HPP Pasal 17' },
  ],
  peringatan: ['Anda juga pegawai tetap — penghasilan wajib dikonsolidasikan dalam satu SPT.'],
  langkahTindakLanjut: ['Cek status LA.04-01 di akun Coretax Anda.'],
};
```

> **Jangan menunggu Sheva.** Kalau kamu menunggu mesinnya jadi, kamu kehilangan 4–5 hari. Data palsu ini yang menyelamatkan jadwal.

### D2 — Alur formulir (Hari 2–4)

**Langkah 0 — Tahun pajak** ← sering dilupakan, tapi menentukan aturan mana yang dipakai
**Langkah 1 — Profesi/KLU** (pencarian dengan alias: "influencer", "content creator", "jualan online")
**Langkah 2 — Status & omzet**
- PTKP (TK/0 – K/3)
- Omzet pribadi
- Omzet pasangan *(kalau ada)*
- Omzet perseroan perorangan *(kalau ada)*
- Apakah juga pegawai tetap?

**Langkah 3 — Pertanyaan kepatuhan**
- Sudah mengajukan LA.04-01 sebelum 31 Maret? → **Sudah / Belum / Tidak yakin**
- Pernah memilih tarif umum? → **Pernah / Belum / Tidak yakin**

> Opsi **"Tidak yakin" wajib ada dan wajib terlihat setara** dengan dua opsi lain. Kebanyakan orang memang tidak tahu jawabannya, dan memaksa mereka menebak menghasilkan vonis yang salah.

**Penulisan yang penting:** jangan pakai istilah birokrasi sebagai label. Tulis "Apakah Anda pernah memberi tahu DJP bahwa Anda memakai Norma?" lalu keterangan kecil "(Formulir LA.04-01)". Orang tidak hafal nomor formulir.

### D3 — Kartu Vonis Kelayakan (Hari 3–5) ⭐ ELEMEN TANDA TANGAN

Tiga status, tiga perlakuan visual berbeda. Sitasi pasal bisa dibuka-tutup.

**Ini yang harus sempurna.** Kalau semua fitur lain biasa saja tapi kartu ini kuat, demo tetap berhasil.

### D4 — Panel perbandingan skema (Hari 5–6)

Hanya menampilkan skema berstatus BOLEH. Yang TIDAK BOLEH tetap terlihat tapi diredam — **jangan disembunyikan**, karena melihat apa yang ditolak justru bagian dari nilai produk.

Setiap skema: nominal pajak, dasar perhitungan singkat, dan **konsekuensi jangka panjang** kalau ada.

### D5 — Tata letak PDF Kertas Kerja (Hari 6–7)

Dokumen satu lembar, `@react-pdf/renderer`.

Isi: identitas ringkas, tahun pajak, hasil kelayakan + dasar hukum, rincian perhitungan, kredit bukti potong, **pemetaan ke kode kolom Coretax**, dan penafian.

> Juri akan mengunduh dan membukanya. PDF yang rapi memberi kesan produk jadi; PDF berantakan merusak kesan seluruh demo.

### D6 — Responsivitas (Hari 8–9)

**Uji di HP fisik, bukan DevTools.** Minimal: satu Android kelas menengah, satu iPhone kalau ada.

Titik rawan: tabel perbandingan di layar sempit, formulir angka rupiah dengan papan ketik numerik, dan pratinjau PDF di ponsel.

### D7 — Kondisi kosong, tunggu, dan gagal (Hari 9)

- **Belum diisi** — undangan untuk bertindak, bukan layar kosong
- **Sedang memproses** — kalau OCR berjalan, tampilkan status yang jujur
- **Gagal** — jelaskan apa yang salah dan langkah perbaikannya. Pesan galat tidak minta maaf dan tidak kabur.
- **OCR gagal** → tombol "isi manual" harus **menonjol**, bukan tersembunyi

### D8 — Aksesibilitas (Hari 9)

Fokus papan ketik terlihat, kontras cukup, status tidak hanya dibedakan warna, `prefers-reduced-motion` dihormati.

Ini bukan formalitas — sub-tema lomba adalah *Inclusive Society*. Kalau produk tentang inklusivitas tapi tidak bisa dipakai dengan papan ketik, juri berhak menanyakannya.

---

## 10. Jadwal

| Hari | Tanggal | Sasaran |
|---|---|---|
| 1 | 24 Ags | **Sepakati kontrak data** + setup Next.js + token desain |
| 2 | 25 Ags | Kerangka alur formulir (5 langkah) |
| 3 | 26 Ags | Kartu Vonis — versi pertama |
| 4 | 27 Ags | Formulir lengkap + validasi tampilan |
| 5 | 28 Ags | Kartu Vonis final + panel perbandingan |
| 6 | 29 Ags | Panel perbandingan selesai + mulai PDF |
| 7 | 30 Ags | Tata letak PDF selesai |
| 8 | 31 Ags | **Integrasi dengan mesin Sheva** (bersama Habib) |
| 9 | 1 Sep | Responsif + uji HP fisik + kondisi kosong/gagal |
| 10 | 2 Sep | Aksesibilitas + perbaikan |
| 11 | 3 Sep | Screenshot untuk README + polesan |
| 12 | 4 Sep | Latihan demo + latihan tanya jawab |
| 13 | 5 Sep | **Submit** |

---

## 11. Alur demo yang kamu kendalikan (10 menit final)

**Momen yang harus mendarat:** juri memilih profesi "Kreator Konten" → kartu **TIDAK BERHAK** muncul dengan sitasi PP 20/2026 → juri membuka kutipan pasalnya.

Itu tiga detik yang membedakan kita dari sepuluh kalkulator pajak lain.

Latih transisinya sampai mulus. Jangan ada jeda memuat yang canggung di momen ini.

**Rencana cadangan wajib:** rekam video demo penuh. Kalau ada yang bermasalah saat live, kamu punya penyelamat.

---

## 12. Pertanyaan juri yang akan diarahkan ke kamu

**"Kenapa web, bukan aplikasi?"**
→ Dipakai setahun sekali menjelang SPT. Tidak ada yang memasang aplikasi untuk itu. Tautan menghilangkan hambatan pemasangan, dan perhitungan di peramban berarti data pajak tidak keluar dari perangkat pengguna.

**"Orang awam pajak bisa pakai ini?"**
→ Tunjukkan penulisan label yang menghindari istilah birokrasi, dan opsi "tidak yakin".

**"Kenapa yang tidak berhak tetap ditampilkan?"**
→ Karena mengetahui apa yang **tidak** boleh dipakai justru mencegah kesalahan yang berujung denda. Menyembunyikannya menghilangkan setengah nilai produk.

**"Bagaimana aksesibilitasnya?"**
→ Fokus papan ketik, kontras, status tidak hanya dibedakan warna.

---

## 13. Definisi Selesai

- [ ] Kartu Vonis bekerja untuk tiga status dan sitasi bisa dibuka
- [ ] Opsi "Tidak yakin" ada dan setara secara visual
- [ ] Pemilih tahun pajak ada di langkah pertama
- [ ] Alur penghasilan campuran memunculkan peringatan
- [ ] PDF rapi saat diunduh dan dibuka di ponsel
- [ ] Diuji di HP fisik, bukan hanya DevTools
- [ ] Kondisi kosong, memuat, dan gagal semuanya tertangani
- [ ] Fokus papan ketik terlihat di seluruh alur
- [ ] Tombol "isi manual" menonjol saat OCR gagal
- [ ] Video demo cadangan sudah direkam
- [ ] Screenshot untuk README sudah diambil

---

## 14. Catatan penutup

Sheva memegang kebenaran hukumnya. Kamu memegang **apakah kebenaran itu sampai ke orang yang membutuhkannya.**

Vonis yang benar tapi disajikan dengan membingungkan sama tidak bergunanya dengan vonis yang salah. Dan di babak final, layar kamu yang dilihat juri selama sepuluh menit penuh.
