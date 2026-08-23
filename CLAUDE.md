# CLAUDE.md

Panduan konteks untuk asisten AI yang bekerja di repositori ini.

---

## Proyek

**PajakWajar** — platform web pra-lapor pajak untuk pekerja lepas, kreator konten, dan pelaku usaha mikro di Indonesia.

Dibuat untuk **ITechno Cup 2026** (Web Development, tingkat mahasiswa nasional). Tenggat pengumpulan **6 September 2026, 23.59 WIB**; target internal submit 5 September.

**Tim:** Sheva (rule engine) · Mikail (frontend) · Habib (integrasi, OCR, dokumentasi)

---

## Yang membedakan produk ini

Semua kalkulator pajak yang ada — OnlinePajak, Pajakku, TaxCalc, bahkan aplikasi resmi M-Pajak DJP — langsung menghitung angka. Mereka mengasumsikan pengguna sudah tahu skema mana yang berhak dia pakai.

PajakWajar menempatkan **uji kelayakan di hulu**: memeriksa dulu skema apa yang sah secara hukum, baru menghitung.

Urutannya selalu:

```
KELAYAKAN → PERHITUNGAN → KONSEKUENSI → BERKAS
```

Kalau ada usulan perubahan yang membalik urutan ini, tolak.

---

## Aturan yang tidak boleh dilanggar

### 1. Deterministik, bukan generatif

**Tidak ada LLM yang boleh memutuskan hak hukum seseorang.** Seluruh keputusan kelayakan dan seluruh perhitungan pajak lahir dari aturan yang ditulis eksplisit di kode dan data.

AI hanya boleh dipakai untuk satu hal: **OCR bukti potong** (mengubah gambar jadi angka terstruktur). Bahkan di situ pun wajib ada mode input manual.

Kalau diminta "pakai AI untuk menentukan skema terbaik" — jangan. Jelaskan kenapa.

### 2. Setiap vonis wajib bersitasi

Setiap keputusan kelayakan menyertakan dasar hukumnya. Tidak ada keluaran tanpa `dasarHukum`.

### 3. Jangan mengarang regulasi

Kalau tidak yakin isi suatu pasal, **jangan tebak.** Tandai `TODO: verifikasi ke JDIH` dan beri tahu manusianya.

Angka pajak yang salah menyebabkan pengguna kurang bayar dan kena sanksi. Ini bukan risiko nilai lomba — ini kerugian nyata orang lain.

### 4. Client-side

Perhitungan berjalan di peramban. Tidak ada data finansial atau identitas yang disimpan di server.

**Satu pengecualian:** foto bukti potong dikirim ke layanan OCR, dan itu **wajib** dengan persetujuan eksplisit pengguna. Jangan menulis klaim "zero data retention" tanpa kualifikasi ini — klaim itu tidak akurat selama OCR aktif.

### 5. Ini bukan nasihat pajak

Penafian tampil di layar dan di PDF. Sistem selalu mengarahkan verifikasi ke DJP.

---

## Konteks regulasi

Aturan berubah pada **22 April 2026** lewat **PP No. 20 Tahun 2026** (merevisi PP 55/2022). Banyak artikel dan blog konsultan **masih memuat ketentuan lama** — jangan pernah memakainya sebagai sumber.

Perubahan pokok:
- Batas waktu 7 tahun untuk WP Orang Pribadi **dihapus**
- Penerima fasilitas dipersempit: WP orang pribadi, PT Perorangan, koperasi
- Ambang Rp4,8 miliar dihitung **gabungan** suami, istri, dan perseroan perorangan mereka
- Pekerjaan bebas (termasuk kreator konten) **dilarang** memakai PPh Final 0,5% — ditegaskan DJP 5 Juni 2026

**Sumber yang boleh dipakai:** jdih.kemenkeu.go.id, pajak.go.id, teks PP/PMK/PER langsung.
**Sumber yang tidak boleh:** blog konsultan, artikel media, ringkasan pihak ketiga.

### Empat hal yang masih harus diverifikasi

Jangan tulis kode final untuk bagian ini sebelum ada konfirmasi dari teks asli:

1. **Dasar pengenaan pembebasan Rp500 juta** — dari omzet pribadi atau omzet konsolidasi? (Dugaan: omzet pribadi. Konsolidasi hanya untuk uji ambang.)
2. **Konsekuensi memilih tarif umum** — hak 0,5% hilang permanen, atau hanya mulai tahun berikutnya? **Jangan tulis kata "permanen" sebelum terbukti.**
3. **Daftar KLU pekerjaan bebas** — profesi mana persisnya.
4. **Ketentuan peralihan** — perbedaan aturan tahun pajak 2025 vs 2026.

---

## Tumpukan teknologi

- **Next.js 15** (App Router, React 19, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **React Hook Form** + **Zod**
- **@react-pdf/renderer** untuk kertas kerja
- **Gemini API** (structured JSON) — hanya untuk OCR bupot, dengan mode manual
- **Vercel** untuk deployment

Tidak ada basis data. Tidak ada backend. Semua state di memori peramban.

---

## Struktur repo

```
pajakwajar/
├── README.md                 ← template resmi ITechno Cup
├── CLAUDE.md
├── .env.example              ← tanpa nilai asli
├── docs/
│   ├── ARSITEKTUR.md
│   ├── REGULASI.md           ← kutipan pasal + nomornya
│   └── screenshots/
├── data/
│   └── klu_rules.json        ← aturan terpisah dari kode
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── eligibility.ts    ← Sheva
│   │   ├── calculator.ts     ← Sheva
│   │   ├── schemas.ts        ← Zod
│   │   └── ocr.ts            ← Habib
│   ├── mock/                 ← data palsu untuk kerja paralel
│   └── types/
└── tests/
    └── eligibility.test.ts   ← minimal 15 kasus
```

**Aturan penting:** aturan perpajakan tinggal di `data/klu_rules.json`, **bukan** di dalam kode. Regulasi berubah; logika tidak.

---

## Kontrak tipe

```ts
type ProfilWajibPajak = {
  tahunPajak: 2025 | 2026;
  kluKode: string;
  statusPtkp: 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3'
            | 'K/0'  | 'K/1'  | 'K/2'  | 'K/3';
  omzetPribadi: number;              // dasar PERHITUNGAN
  omzetPasangan: number;             // hanya untuk uji AMBANG
  omzetPerseroanPerorangan: number;  // hanya untuk uji AMBANG
  sudahLaporLA0401: boolean | 'tidak_yakin';
  pernahPilihTarifUmum: boolean | 'tidak_yakin';
  jugaPegawaiTetap: boolean;
};

type HasilKelayakan = {
  skema: Array<{
    id: 'PPH_FINAL_05' | 'NPPN' | 'TARIF_UMUM';
    status: 'BOLEH' | 'TIDAK_BOLEH' | 'PERLU_DIPASTIKAN';
    alasan: string;
    dasarHukum: string;
    konsekuensiJangkaPanjang?: string;
  }>;
  peringatan: string[];
  langkahTindakLanjut: string[];
};
```

**`omzetPribadi` dan omzet konsolidasi punya fungsi berbeda.** Jangan pernah mencampurnya:
- Perhitungan pajak → `omzetPribadi`
- Uji ambang Rp4,8 M → jumlah ketiganya

Status **`PERLU_DIPASTIKAN`** dipakai saat pengguna menjawab "tidak yakin". Sistem tidak boleh memberi vonis pasti dari data yang tidak pasti.

---

## Rumus

**PPh Final UMKM**
```
dasar = max(0, omzetPribadi − 500_000_000)
pajak = dasar × 0,005
```

**Norma NPPN**
```
netto = omzetPribadi × persenNorma(klu, wilayah)
pkp   = max(0, netto − ptkp)
pajak = tarifProgresifBerlapis(pkp) − kreditBupot
```

**Tarif Umum**
```
netto = omzetPribadi − biayaOperasional
pkp   = max(0, netto − ptkp)
pajak = tarifProgresifBerlapis(pkp) − kreditBupot
```

**Tarif progresif dihitung berlapis**, bukan satu tarif untuk seluruh PKP. Ini kesalahan paling umum. Contoh: PKP Rp337 juta melewati tiga lapisan, bukan langsung dikalikan 25%.

Persentase norma **berbeda per wilayah**. Struktur data harus mengakomodasi.

---

## Gaya kode

- Bahasa Indonesia untuk nama domain (`omzetPribadi`, `hitungPajakFinal`)
- Bahasa Inggris untuk istilah teknis umum (`useState`, `formatCurrency`)
- Pesan commit bahasa Inggris, format konsisten: `feat:`, `fix:`, `docs:`
- Tidak ada `any`
- Setiap fungsi di `lib/` punya JSDoc dengan rujukan pasalnya

Bekerja di cabang: `feat/rule-engine` (Sheva), `feat/ui-eligibility` (Mikail), `feat/ocr-pdf` (Habib). Jangan push langsung ke `main`.

---

## Penulisan antarmuka

- **Hindari istilah birokrasi sebagai label.** Tulis "Apakah Anda pernah memberi tahu DJP bahwa Anda memakai Norma?" dengan keterangan kecil "(Formulir LA.04-01)".
- **Kata kerja aktif.** "Hitung pajak saya", bukan "Submit".
- **Nama tindakan konsisten** dari tombol sampai hasilnya.
- **Pesan galat menjelaskan** apa yang salah dan cara memperbaikinya. Tidak minta maaf, tidak kabur.
- Opsi **"Tidak yakin" harus terlihat setara** dengan opsi lain, bukan disembunyikan.

---

## Yang tidak boleh dilakukan

- ❌ Memakai LLM untuk memutuskan kelayakan atau menghitung pajak
- ❌ Mengarang isi pasal atau nomor regulasi
- ❌ Menulis "permanen" untuk konsekuensi tarif umum sebelum terverifikasi
- ❌ Memakai omzet konsolidasi sebagai dasar perhitungan
- ❌ Menghitung tarif progresif dengan satu tarif tunggal
- ❌ Meng-commit `.env` atau kunci API
- ❌ Menyembunyikan skema yang TIDAK BOLEH — tetap tampilkan, redam saja
- ❌ Membangun OCR sebelum mode manual berfungsi
- ❌ Mengklaim "zero data retention" tanpa kualifikasi soal OCR

---

## Konteks lomba

**Bobot penyisihan:** Kesesuaian Tema 20% · Inovasi 20% · Fungsionalitas 20% · UI/UX 15% · Implementasi Teknologi 15% · Dokumentasi 10%

**Bobot final:** Presentasi 25% · Live Demo 25% · Inovasi & Dampak 20% · Aspek Teknis 20% · Tanya Jawab 10%

**SDG:** 8 (Pekerjaan Layak — melindungi pekerja mandiri dari sanksi yang tidak perlu) dan 9 (Infrastruktur — mesin aturan perpajakan deterministik).

**Guidebook:** template instan dilarang; framework boleh tapi peruntukannya wajib dijelaskan di dokumentasi; penggunaan AI diizinkan dengan tanggung jawab penuh atas etika, perlindungan data, privasi, dan hak cipta.

Di babak final, juri berhak menanyai anggota mana pun soal bagian mana pun. **Kode yang tidak bisa dijelaskan pemiliknya adalah kewajiban, bukan aset.**
