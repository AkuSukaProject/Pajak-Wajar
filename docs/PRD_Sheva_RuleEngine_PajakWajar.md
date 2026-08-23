# PRD — Rule & Regulation Engine
## PajakWajar · ITechno Cup 2026

**Pemilik dokumen:** Sheva
**Peran:** Rule & Regulation Engine Owner
**Versi:** 1.0 · 24 Agustus 2026
**Tenggat proyek:** 6 September 2026, 23.59 WIB (target internal: submit 5 September)

---

# BAGIAN I — KONTEKS GLOBAL

## 1. Apa yang sedang kita bangun

PajakWajar adalah platform web yang menjawab satu pertanyaan yang tidak dijawab siapa pun:

> **"Skema pajak mana yang secara hukum boleh saya pakai?"**

Semua produk yang ada — OnlinePajak, Pajakku, TaxCalc, bahkan kalkulator di aplikasi resmi M-Pajak DJP — langsung menghitung angka. Mereka **mengasumsikan** pengguna sudah tahu haknya. Padahal justru di situ orang salah, dan kesalahannya berujung denda.

PajakWajar menempatkan **uji kelayakan di hulu**, baru menghitung.

## 2. Kenapa masalah ini nyata

**5 Juni 2026** — DJP menegaskan lewat kanal resminya bahwa influencer, content creator, selebgram, blogger, dan vlogger **tidak dapat memakai PPh Final UMKM 0,5%**, karena penghasilan mereka berasal dari jasa dan keahlian pribadi sehingga tergolong pekerjaan bebas (PP 20/2026).

Penegasan ini memicu kegaduhan nasional sampai Menteri Keuangan ikut menanggapi.

Inti dari seluruh perdebatan itu satu kalimat: *"jadi saya berhak skema apa?"* — dan itu persis produk kita.

**Peraturan Pemerintah Nomor 20 Tahun 2026** berlaku sejak 22 April 2026, merevisi PP 55/2022. Perubahannya mendasar: batas waktu 7 tahun dihapus, penerima fasilitas dipersempit, dan ambang omzet kini dihitung gabungan keluarga.

Aturan berubah empat bulan lalu, dan sebagian artikel konsultan pajak **masih memuat ketentuan lama.** Kalau konsultan saja masih salah kutip, pekerja lepas biasa tidak punya harapan.

## 3. Target pengguna

Pekerja lepas, kreator konten digital, dan pelaku usaha mikro orang pribadi yang wajib melapor SPT tapi tidak punya konsultan pajak.

## 4. Pemetaan SDG (bobot Kesesuaian Tema: 20%)

- **SDG 8** — Pekerjaan Layak & Pertumbuhan Ekonomi: melindungi pekerja mandiri dan usaha mikro dari sanksi administrasi yang tidak perlu, serta memastikan hak fasilitas pengurangan pajak terakomodasi.
- **SDG 9** — Industri, Inovasi & Infrastruktur: membangun mesin aturan perpajakan berbasis web yang deterministik dan transparan, tanpa ketergantungan pemrosesan server pihak ketiga.

## 5. Empat modul sistem

| # | Modul | Penanggung jawab |
|---|---|---|
| 1 | Eligibility Gatekeeper | **Sheva** |
| 2 | Multi-Scheme Calculator | **Sheva** |
| 3 | Bupot Reconciler (OCR + manual) | Habib |
| 4 | Coretax Pre-Filing PDF | Mikail (tata letak) + Habib (integrasi) |

**Modul 1 dan 2 adalah jantung produk.** Tanpa keduanya, tiga modul lain tidak punya arti.

## 6. Tim

| Anggota | Peran | Tanggung jawab |
|---|---|---|
| **Sheva** | Rule & Regulation Engine | Riset regulasi, `klu_rules.json`, eligibility engine, tax calculator, validasi Zod, kasus tepi |
| **Mikail** | Frontend & UX | UI saringan kelayakan, formulir reaktif, panel perbandingan, tata letak PDF, responsivitas |
| **Habib** | Integrasi, OCR & Dokumentasi | Penyambungan mesin↔UI, bupot scanner + mode manual, penafian hukum, README, deployment |

**Tanggung jawab bersama:** setiap anggota wajib memahami keseluruhan arsitektur. Di babak final, juri berhak mengajukan pertanyaan teknis kepada siapa pun (Aspek Teknis 20% + Tanya Jawab 10%).

## 7. Prinsip arsitektur yang tidak boleh dilanggar

1. **Deterministik, bukan generatif.** Setiap vonis kelayakan dan setiap angka pajak lahir dari aturan yang bisa ditelusuri. Tidak ada LLM yang memutuskan hak hukum seseorang.
2. **Client-side.** Perhitungan berjalan di peramban. Tidak ada data finansial yang disimpan di server kita.
3. **Setiap vonis wajib bersitasi.** Setiap keputusan menyebut dasar hukumnya.
4. **Bukan nasihat pajak.** Sistem ini alat bantu simulasi pra-lapor. Penafian tampil di layar dan di PDF.

---

# BAGIAN II — LINGKUP KERJA SHEVA

## 8. Misi

> Membangun mesin yang memutuskan **skema pajak mana yang sah dipakai seorang pengguna**, lalu menghitung beban pajak hanya untuk skema yang sah — secara deterministik, bersitasi, dan bisa dipertanggungjawabkan di depan juri baris per baris.

## 9. Kenapa bagian ini yang paling menentukan

Kalau `klu_rules.json` salah, **setiap vonis yang keluar salah.** Yang dirugikan bukan nilai lomba — tapi orang yang memakai produk ini lalu kurang bayar dan kena sanksi.

Ini alasan bagian ini dipegang orang paling teliti di tim.

---

## 10. Deliverable

### D1 — `regulasi/` (Hari 1–2) 🔴 JALUR KRITIS

Kumpulan sumber primer yang diunduh dan dibaca sendiri, **bukan dari blog konsultan.**

**Sumber wajib:**

| Regulasi | Untuk apa | Sumber |
|---|---|---|
| PP No. 20 Tahun 2026 | Kelayakan PPh Final 0,5%, ambang Rp4,8 M, konsolidasi keluarga | jdih.kemenkeu.go.id / pajak.go.id |
| PP No. 55 Tahun 2022 | Aturan yang direvisi — untuk memahami ketentuan peralihan | JDIH |
| PER-17/PJ/2015 | Persentase Norma per KLU | pajak.go.id |
| UU No. 7 Tahun 2021 (HPP) | Tarif progresif Pasal 17, PTKP | JDIH |
| PMK 168/PMK.03/2023 | Kriteria pekerjaan bebas & penggunaan NPPN | JDIH |

**Keluaran:** file `regulasi/CATATAN.md` berisi kutipan pasal relevan + nomor pasalnya, sebagai rujukan saat menulis kode dan saat menjawab juri.

**⚠️ Empat hal yang WAJIB diverifikasi ke teks asli:**

1. **Dasar pengenaan pembebasan Rp500 juta** — apakah dihitung dari omzet pribadi wajib pajak, atau dari omzet konsolidasi keluarga? *(Dugaan tim: omzet pribadi. Konsolidasi hanya untuk uji ambang Rp4,8 M. HARUS dipastikan.)*
2. **Konsekuensi memilih tarif umum** — apakah hak 0,5% hilang **permanen**, atau hanya **mulai tahun pajak berikutnya**? *(Jangan tulis kata "permanen" sebelum ini terbukti.)*
3. **Daftar KLU pekerjaan bebas** — profesi mana persisnya yang dilarang memakai 0,5%.
4. **Ketentuan peralihan** — aturan tahun pajak 2025 vs 2026 vs 2027.

---

### D2 — `data/klu_rules.json` (Hari 2–3) 🔴 JALUR KRITIS

Basis data aturan. Semua orang menunggu bentuk file ini, jadi **strukturnya harus disepakati di Hari 1** meski isinya belum lengkap.

**Struktur yang diusulkan:**

```json
{
  "versi_regulasi": "PP-20-2026",
  "berlaku_sejak": "2026-04-22",
  "tahun_pajak_didukung": [2025, 2026],
  "klu": [
    {
      "kode": "90002",
      "nama": "Kegiatan Pekerja Seni",
      "alias": ["content creator", "influencer", "selebgram", "youtuber"],
      "pekerjaan_bebas": true,
      "norma_persen": { "kelompok_1": 50, "kelompok_2": 50, "kelompok_3": 50 },
      "boleh_pph_final": false,
      "dasar_hukum": "PP 20/2026 Pasal 57; PER-17/PJ/2015"
    }
  ],
  "ptkp": {
    "TK/0": 54000000, "TK/1": 58500000, "TK/2": 63000000, "TK/3": 67500000,
    "K/0": 58500000, "K/1": 63000000, "K/2": 67500000, "K/3": 72000000
  },
  "tarif_progresif": [
    { "batas_atas": 60000000,  "tarif": 0.05 },
    { "batas_atas": 250000000, "tarif": 0.15 },
    { "batas_atas": 500000000, "tarif": 0.25 },
    { "batas_atas": 5000000000, "tarif": 0.30 },
    { "batas_atas": null, "tarif": 0.35 }
  ]
}
```

**Catatan penting:** persentase norma **berbeda per wilayah** (kelompok kota). Ini sering dilupakan — pastikan strukturnya mengakomodasi.

**Angka di atas adalah rancangan awal.** Setiap nilai wajib dicocokkan ke teks regulasi sebelum dipakai.

**Cakupan minimum:** 20–30 KLU yang paling relevan untuk pekerja lepas dan usaha mikro. Tidak perlu 1.773 kode.

---

### D3 — `lib/eligibility.ts` (Hari 3–4) 🔴 JALUR KRITIS

Pohon keputusan kelayakan. **Ini fitur pembeda utama produk.**

**Masukan:**

```ts
type ProfilWajibPajak = {
  tahunPajak: 2025 | 2026;           // WAJIB — aturan berbeda per tahun
  kluKode: string;
  statusPtkp: 'TK/0' | 'TK/1' | ... | 'K/3';
  omzetPribadi: number;              // dasar perhitungan
  omzetPasangan: number;             // untuk uji ambang
  omzetPerseroanPerorangan: number;  // untuk uji ambang
  sudahLaporLA0401: boolean | 'tidak_yakin';
  pernahPilihTarifUmum: boolean | 'tidak_yakin';
  jugaPegawaiTetap: boolean;         // penghasilan campuran
};
```

**Keluaran:**

```ts
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

**Empat saringan:**

| # | Saringan | Logika |
|---|---|---|
| 1 | **KLU** | Kalau `pekerjaan_bebas: true` → PPh Final 0,5% ditolak. Sitasi PP 20/2026 + penegasan DJP 5 Juni 2026. |
| 2 | **Administrasi** | LA.04-01 belum diajukan sebelum 31 Maret → NPPN tidak tersedia, wajib pembukuan. |
| 3 | **Ambang omzet** | `omzetPribadi + omzetPasangan + omzetPerseroan > 4.8M` → PPh Final 0,5% ditolak. |
| 4 | **Pintu satu arah** | Pernah memilih tarif umum → hak 0,5% hilang. **Tulis konsekuensi sesuai temuan D1, jangan mengarang.** |

**Wajib ada — status ketiga `PERLU_DIPASTIKAN`.** Kalau pengguna menjawab "tidak yakin", sistem **tidak boleh memberi vonis pasti.** Keluarkan hasil bersyarat plus arahan cara mengeceknya di Coretax.

> Ini bukan kelemahan. Sistem yang berani bilang "kami belum yakin, cek dulu di Coretax" lebih tepercaya daripada sistem yang menebak. Ini juga jawaban siap pakai kalau juri menanyakan reliabilitas.

**Penghasilan campuran:** kalau `jugaPegawaiTetap: true`, munculkan peringatan bahwa seluruh penghasilan wajib dikonsolidasikan dalam satu SPT.

---

### D4 — `lib/calculator.ts` (Hari 4–5)

Menghitung **hanya** skema berstatus `BOLEH`.

**Skema A — PPh Final UMKM**
```
dasar = max(0, omzetPribadi − 500.000.000)
pajak = dasar × 0,5%
```
> ⚠️ Perhatikan: memakai `omzetPribadi`, **bukan** omzet konsolidasi. Konsolidasi hanya untuk uji ambang di D3. Pastikan ke teks PP.

**Skema B — Norma NPPN**
```
netto = omzetPribadi × persenNorma(klu, wilayah)
pkp   = max(0, netto − ptkp)
pajak = tarifProgresif(pkp) − kreditBupot
```

**Skema C — Tarif Umum**
```
netto = omzetPribadi − biayaOperasional
pkp   = max(0, netto − ptkp)
pajak = tarifProgresif(pkp) − kreditBupot
```

**Tarif progresif berlapis** — hitung per lapisan, bukan satu tarif untuk seluruh PKP. Ini kesalahan paling umum.

---

### D5 — Validasi Zod (Hari 5)

Skema validasi untuk seluruh masukan. Tolak nilai negatif, tangani format rupiah, batasi rentang wajar.

---

### D6 — Uji Kasus Tepi (Hari 9–10)

Minimal 15 kasus uji. Ini yang membedakan produk yang terlihat jalan dari produk yang benar-benar jalan.

| # | Kasus | Yang diharapkan |
|---|---|---|
| 1 | Kreator konten, omzet Rp200 jt | 0,5% ditolak, NPPN/umum |
| 2 | Pedagang online, omzet Rp300 jt | 0,5% boleh, pajak = 0 (di bawah Rp500 jt) |
| 3 | Omzet pribadi Rp600 jt | Dasar = Rp100 jt, pajak Rp500 rb |
| 4 | Omzet pribadi Rp3 M + pasangan Rp2 M | Gabungan Rp5 M > ambang → 0,5% ditolak |
| 5 | Tepat Rp4.800.000.000 | Batas inklusif atau eksklusif? Cek regulasi |
| 6 | Belum lapor LA.04-01 | NPPN dinonaktifkan |
| 7 | "Tidak yakin" LA.04-01 | Status PERLU_DIPASTIKAN, bukan vonis |
| 8 | Omzet Rp0 | Tidak error, pajak 0 |
| 9 | PKP di bawah PTKP | Pajak 0, bukan negatif |
| 10 | Kredit bupot > pajak terutang | Status lebih bayar |
| 11 | PKP tepat Rp60 jt | Perpindahan lapisan benar |
| 12 | PKP Rp337 jt | Berlapis 3 tingkat, bukan satu tarif |
| 13 | Tahun pajak 2025 vs 2026, profil sama | Hasil bisa berbeda |
| 14 | Pegawai tetap + freelance | Peringatan konsolidasi muncul |
| 15 | KLU tidak dikenali | Pesan jelas, tidak crash |

---

## 11. Jadwal

| Hari | Tanggal | Sasaran |
|---|---|---|
| 1 | 24 Ags | Riset regulasi + **sepakati bentuk JSON dengan Mikail & Habib** |
| 2 | 25 Ags | `CATATAN.md` selesai + kerangka `klu_rules.json` |
| 3 | 26 Ags | `klu_rules.json` terisi 20–30 KLU |
| 4 | 27 Ags | `eligibility.ts` — 4 saringan berjalan |
| 5 | 28 Ags | `calculator.ts` + validasi Zod |
| 6–7 | 29–30 Ags | Dukung Habib mengintegrasikan ke UI |
| 8 | 31 Ags | Varian per tahun pajak + alur penghasilan campuran |
| 9–10 | 1–2 Sep | 15 kasus uji + perbaikan |
| 11 | 3 Sep | Dokumentasi teknis mesin aturan untuk README |
| 12 | 4 Sep | Latihan tanya jawab teknis |
| 13 | 5 Sep | **Submit** |

**🔴 Hari 1 adalah jalur kritis.** Mikail dan Habib bisa bekerja paralel dengan data palsu, **asalkan bentuk JSON-nya sudah disepakati hari itu juga.** Kalau bentuknya baru jadi Hari 3, tim kehilangan dua hari.

---

## 12. Pertanyaan juri yang akan diarahkan ke Sheva

**"Kalau sistem kalian salah dan pengguna kena denda, siapa bertanggung jawab?"**
→ Deterministic rule engine, bukan penalaran generatif. Setiap vonis menyebut dasar hukumnya dan bisa ditelusuri. Sistem diposisikan sebagai alat bantu simulasi pra-lapor dengan penafian eksplisit, dan mengarahkan verifikasi ke DJP.

**"Regulasi berubah terus. Bagaimana sistem kalian mengikuti?"**
→ Aturan dipisahkan dari kode dalam berkas JSON bersama nomor regulasinya. Memperbarui aturan tidak menyentuh logika. Struktur mendukung banyak tahun pajak.

**"Dari mana daftar KLU dan persentase norma kalian?"**
→ Sebut regulasinya. Siapkan `CATATAN.md` untuk ditunjukkan.

**"Kenapa tidak pakai AI untuk menentukan kelayakan?"**
→ Hak hukum seseorang tidak boleh ditentukan model probabilistik. Deterministik memberi hasil yang sama setiap kali dijalankan dan bisa diaudit.

**"Bagaimana kalau pengguna salah memasukkan datanya?"**
→ Validasi Zod di semua masukan, plus opsi "tidak yakin" yang menghasilkan vonis bersyarat.

---

## 13. Definisi Selesai

- [ ] Setiap aturan bisa ditunjuk pasalnya di `CATATAN.md`
- [ ] Empat pertanyaan verifikasi di D1 sudah terjawab dari teks asli
- [ ] Kata "permanen" hanya dipakai kalau terbukti di regulasi
- [ ] `omzetPribadi` dan `omzetKonsolidasi` terpisah jelas di kode
- [ ] Pemilih tahun pajak berfungsi dan menghasilkan aturan berbeda
- [ ] Status `PERLU_DIPASTIKAN` bekerja
- [ ] 15 kasus uji lolos
- [ ] Tidak ada nilai pajak negatif dalam kondisi apa pun
- [ ] Sheva bisa menjelaskan setiap keputusan tanpa membuka catatan

---

## 14. Peringatan penutup

Bagian ini menyentuh uang dan kewajiban hukum orang sungguhan. Kalau daftar KLU salah atau rumusnya keliru, konsekuensinya bukan nilai lomba yang turun — tapi pengguna yang kurang bayar dan kena sanksi.

**Kalau ragu, tulis apa adanya.** Sistem yang berkata "kami belum bisa memastikan, verifikasi ke DJP" jauh lebih baik daripada sistem yang memberi vonis pasti dari dasar yang goyah.
