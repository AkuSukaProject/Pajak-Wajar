# Panduan Demo PajakWajar

Tim: **AkuSukaProject** — Muhammad Habib, Mikail Samyth Habibillah, dan Sheva Ramadhan.

> [Rekaman aplikasi](./demo/pajakwajar-demo.webm) memperagakan formulir, mesin aturan, perhitungan, PDF, dan perubahan jawaban. Rekaman ini tanpa narasi dan dibuat sebelum penambahan PH/MT serta investasi; gunakan situs publik untuk memperagakan kedua fitur terbaru.

## Menjalankan demo lokal

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

Buka `http://localhost:3000`. Jangan menjalankan `next dev` bersamaan dengan proses build atau server produksi pada checkout yang sama karena keduanya memakai direktori `.next`.

Demo tidak membutuhkan `GEMINI_API_KEY`. Bila kunci itu kosong, bagian pembacaan foto akan menyatakan bahwa pembacaan otomatis belum aktif dan mengarahkan pengguna mengetik manual — dan itu memang pesan yang benar untuk diperlihatkan.

## Skenario presentasi (sekitar 3 menit)

Seluruh angka di bawah fiktif. Skenario ini memperagakan pembeda produk: vonis kelayakan lebih dulu, angka menyusul, dan angka ditahan ketika haknya belum pasti.

| Waktu | Aksi | Narasi |
|-------|------|--------|
| 00:00–00:20 | Halaman utama. | “Semua kalkulator pajak yang ada langsung menghitung. Mereka mengandaikan pengguna sudah tahu skema mana yang berhak dia pakai. PajakWajar memeriksa haknya dulu.” |
| 00:20–00:45 | **Kasus 1 — kreator konten.** Pilih 2026, `Pekerja seni, kreator konten, dan influencer`, “Saya bekerja sendiri dengan keahlian saya”, kelompok wilayah 1, satu kegiatan. | “Profesi menentukan hak. Kami juga menanyakan cara menjalankannya, karena aturan membedakan orang yang menjual keahliannya sendiri dari orang yang menjalankan usaha berpegawai.” |
| 00:45–01:10 | Isi PTKP TK/0, omzet berjalan Rp420.000.000, biaya usaha Rp95.000.000. Lanjut: omzet tahun sebelumnya Rp310.000.000, belum menikah. | “Ada dua himpunan omzet yang tidak boleh dicampur. Yang tahun berjalan dipakai menghitung. Yang tahun sebelumnya hanya dipakai menguji batas Rp4,8 miliar.” |
| 01:10–01:25 | Jawab riwayat ambang **Belum pernah**, pemberitahuan Norma **Sudah, tepat waktu**, tarif umum **Belum pernah**. Tambahkan bukti potong Rp6.000.000. Lihat hasil. | “Tidak yakin adalah jawaban yang sah, dan kami perlakukan setara.” |
| 01:25–02:00 | Tunjuk kartu PPh Final yang **TIDAK BOLEH DIPAKAI**. Buka **Lihat aturan resminya**. | “PPh Final 0,5% tertutup, dan ini alasannya: Pasal 56 ayat (4) huruf b PP 20/2026 menyebut pembuat konten daring sebagai pekerjaan bebas. Setiap vonis membawa pasalnya, dengan tautan ke JDIH Kemenkeu.” |
| 02:00–02:20 | Buka **Lihat cara menghitungnya** pada kartu Norma (Rp11.400.000). | “Tarif progresif dihitung berlapis, bukan satu tarif untuk seluruh penghasilan kena pajak. Tiap lapisan ditampilkan, jadi angkanya bisa dilacak.” |
| 02:20–02:40 | Kembali, ubah pemberitahuan Norma menjadi **Tidak yakin**, lihat hasil lagi. | “Begitu haknya tidak pasti, angkanya hilang. Sistem tidak memberi vonis pasti dari data yang tidak pasti.” |
| 02:40–03:00 | Tekan **Simpan ringkasan sebagai PDF**, buka berkasnya. | “Kertas kerja dirakit di peramban. Tidak ada angka finansial yang dikirim ke server. Ini alat bantu, bukan nasihat pajak.” |

### Kasus cadangan untuk sesi tanya jawab

| Kasus | Isian | Yang diperlihatkan |
|---|---|---|
| **Pedagang daring yang berhak** | KLU `47919`, berdagang, TK/0, belum menikah, satu kegiatan, riwayat ambang belum pernah, omzet berjalan Rp900.000.000, biaya Rp620.000.000, tahun sebelumnya Rp780.000.000 | Ketiganya BOLEH; PPh Final Rp2.000.000 dari (900jt − 500jt) × 0,5%. Memperlihatkan pembebasan Rp500 juta bekerja. |
| **Lewat ambang gabungan** | PTKP K/0, pisah harta, omzet tahun sebelumnya sendiri Rp3.000.000.000 dan pasangan Rp2.000.000.000 | PPh Final TIDAK BOLEH, plus peringatan bahwa hak itu tertutup untuk tahun-tahun berikutnya (Pasal 57 ayat (4)). Lengkapi neto pasangan bila hendak memperagakan nominal progresif. |
| **Berpisah menurut putusan hakim** | Sama, tetapi pilih "Kami berpisah menurut putusan hakim" | Omzet pasangan **tidak** digabungkan, sehingga PPh Final kembali BOLEH. UU PPh Pasal 8 ayat (2) huruf a tidak ikut disebut PP 20/2026 Pasal 58 ayat (2). |
| **Tepat di ambang** | Omzet gabungan tahun sebelumnya persis Rp4.800.000.000, syarat lainnya terpenuhi | Ambang masih terpenuhi; batas Pasal 58 ayat (1) huruf a inklusif. |
| **Profesi yang tidak disebut pasal** | KLU `62010` (programmer lepas) | PERLU DIPASTIKAN, bukan vonis pasti — profesi ini tidak disebut satu per satu di Pasal 56 ayat (4). |
| **Lebih dari satu kegiatan** | Jawab “Ya, lebih dari satu”, lengkapi jenis dan omzet tiap kegiatan | Norma dihitung per kegiatan lalu netonya dijumlahkan. Nominal ditahan bila rincian atau norma kegiatan belum lengkap. |
| **PH/MT dan investasi** | Ikuti fixture [verifikasi PH/MT dan investasi](VERIFIKASI-PH-MT-INVESTASI.md): neto WP Rp400 juta, neto pasangan Rp100 juta, K/I/2 | Pajak keluarga Rp63.625.000, bagian WP Rp50.900.000 sebelum kredit sendiri. Tambahkan deposito, saham, dan dividen pada langkah bukti potong; hasil serta PDF memisahkannya dari pajak usaha. |

## Pertanyaan juri yang perlu disiapkan

- **“Di mana AI-nya?”** Hanya pada pembacaan foto bukti potong, dengan `temperature: 0` dan skema jawaban terstruktur, hasilnya divalidasi ulang dan wajib ditinjau pengguna. Tidak ada model bahasa yang memutuskan hak hukum atau menghitung pajak. Lihat [ARSITEKTUR.md](./ARSITEKTUR.md).
- **“Dari mana angka pasalnya?”** Dari teks asli PP 20/2026 di JDIH Kemenkeu; salinan ekstraksinya ada di [`docs/sumber/pp-20-2026.txt`](./sumber/pp-20-2026.txt) dan registernya di [REGULASI.md](./REGULASI.md).
- **“Bagaimana kalau aturannya berubah?”** Seluruh angka, ambang, dan sitasi tinggal di `data/klu_rules.json`, terpisah dari logika, dan dijaga JSON Schema.
- **“Apa batas aplikasinya?”** Kondisi khusus yang belum diverifikasi dan data yang belum lengkap tetap menahan nominal. Contohnya saham pendiri, dividen luar negeri, atau kerugian fiskal yang memerlukan kompensasi. Pemetaan KLU–KBLI 2020, deployment, PH/MT, dan tiga jenis investasi sudah tersedia. Cakupan pengujian tercatat di [TESTING.md](./TESTING.md).
- **“Bagaimana kalau riset timnya salah?”** Pernah terjadi. Saat dicocokkan ke teks asli, 17 dari 20 KLU memuat persentase norma yang keliru atau kode yang tidak ada di Lampiran I, dan satu sitasi menunjuk pasal yang sudah dihapus. Seluruhnya dikoreksi dan sekarang dikunci oleh uji otomatis. Perbandingannya ada di [REGULASI.md](./REGULASI.md).

## Deployment

Situs publik: [pajak-wajar.vercel.app](https://pajak-wajar.vercel.app/). Deployment mengikuti `main` pada [samythh/Pajak-Wajar](https://github.com/samythh/Pajak-Wajar); salinan organisasi disinkronkan melalui PR. Langkah konfigurasi ada di [DEPLOYMENT.md](./DEPLOYMENT.md).

## Bahan submission

- README dan identitas anggota tim. ✅
- Lisensi proyek. ✅
- Screenshot desktop, seluler, formulir, dan kartu hasil dalam `docs/screenshots/`. ✅
- Contoh kertas kerja PDF dalam `docs/demo/`. ✅
- Rekaman demo alur dasar tersedia; PH/MT dan investasi diperagakan langsung pada situs terbaru. ✅
- URL deployment publik. ✅ https://pajak-wajar.vercel.app/
- Penjelasan batas implementasi dan hasil pemeriksaan teknis. ✅ [TESTING.md](./TESTING.md)

Gunakan [panduan pengumpulan](PENGUMPULAN.md) untuk dua tautan yang diserahkan. Pengiriman dan konfirmasi berhasil di dashboard lomba dilakukan pemilik akun; keberadaan berkas di GitHub belum berarti karya telah disubmit.
