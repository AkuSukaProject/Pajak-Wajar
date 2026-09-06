# Verifikasi PH/MT dan penghasilan investasi

Tanggal pemeriksaan: 6 September 2026. Ruang lingkup: Wajib Pajak orang pribadi dalam negeri, tahun penghasilan 2025/2026. Teks aturan dibaca pada publikasi resmi DJP, bukan ringkasan konsultan. Status parameter ada di `data/klu_rules.json` dan divalidasi oleh JSON Schema.

Teks [perubahan keempat PMK 81, yaitu PMK 1/2026](https://jdih.kemenkeu.go.id/api/download/b5f99bff-f689-4e4f-ae3a-7c6a9a4cfe8a/2026pmkeuangan001.pdf) juga diperiksa: perubahannya menyangkut definisi dan penggunaan nilai buku dalam restrukturisasi usaha; tidak mengubah Pasal 244–245 atau 370–374 yang digunakan di bawah.

## PH/MT

[DJP, Kupas Tuntas Aspek Perpajakan Suami dan Istri](https://www.pajak.go.id/en/node/119134) memuat UU PPh Pasal 8 ayat (2) huruf b/c dan ayat (3): neto kedua pihak digabung, dikurangi PTKP K/I, dikenai tarif berlapis, kemudian pajak dibagi menurut neto masing-masing.

Koreksi terhadap dokumen serah terima: **gaji pasangan dari satu pemberi kerja tetap digabung pada PH/MT**. Pengecualian pada pelaporan gabung mensyaratkan gaji istri dari satu pemberi kerja, telah dipotong PPh 21, dan tidak berhubungan dengan usaha/pekerjaan bebas suami atau keluarga. Formulir menjelaskan syarat itu; jawaban gaji satu pemberi kerja tidak menghentikan PH/MT.

Fixture independen:

```text
Neto WP        = 800.000.000 × 50% = 400.000.000
Neto pasangan  = 100.000.000
PTKP K/I/2     = 67.500.000 + 54.000.000 = 121.500.000
PKP gabungan   = 500.000.000 − 121.500.000 = 378.500.000
PPh gabungan   = 3.000.000 + 28.500.000 + 32.125.000 = 63.625.000
Bagian WP      = 400/500 × 63.625.000 = 50.900.000
Bagian pasangan= 12.725.000
Kredit WP 7jt  → sisa bagian WP 43.900.000
```

Kredit dikurangkan **setelah pembagian**, hanya untuk pemilik SPT. Bagian suami dibulatkan sekali ke rupiah; bagian istri merupakan selisih dari pajak gabungan agar kedua bagian tepat menjumlah ke pajak gabungan. Ini kebijakan pembulatan penyajian aplikasi, bukan kutipan metode pembulatan khusus dari UU. Identitas suami/istri menjaga hasil konsisten ketika masing-masing mengisi.

## Bunga deposito dan tabungan

- [Teks PP 131/2000](https://pajak.go.id/en/node/57574), Pasal 3 ayat (1) huruf a: batas **tidak melebihi** Rp7.500.000 dan bukan simpanan yang dipecah-pecah. Kutipan pendek: “tidak melebihi Rp 7.500.000,00”. Batasnya inklusif, bukan sekadar di bawah.
- [Teks perubahan PP 123/2015](https://pajak.go.id/en/node/63047), Pasal I, Pasal 2 huruf c angka 1: bunga simpanan biasa WP dalam negeri dikenai final 20% dari bruto bunga.
- [PMK 212/2018](https://pajak.go.id/en/node/63169) dibaca sebagai pemeriksaan silang. Ketentuan fasilitas DHE tidak disamakan dengan simpanan biasa; DHE SDA juga mempunyai [PP 22/2024](https://www.pajak.go.id/sites/default/files/PP_22_Tahun_2024.pdf).

Pengguna mengisi bunga bruto, jumlah seluruh simpanan relevan pada saat bunga diterima, dan keadaan pemecahan simpanan. Jika kondisi berubah, pisahkan periode. Pokok simpanan tidak dihitung sebagai penghasilan. Pengecualian pemotongan tidak diberi label sembarang “bukan objek”.

## Saham bursa

[Teks PMK 81/2024](https://www.pajak.go.id/en/node/113110), Pasal 244–245 menetapkan final **0,1% dari nilai bruto transaksi penjualan**, dipotong melalui perantara pedagang efek. Kutipan pendek: “0,1 % (nol koma satu persen)”. Pasal 246–249 memuat ketentuan tambahan saham pendiri, sehingga pengguna wajib memastikan transaksi biasa di bursa Indonesia, bukan saham pendiri. Nilai portofolio atau keuntungan transaksi tidak menggantikan dasar penjualan.

## Dividen dalam negeri

- [PP 19/2009 Pasal 1](https://www.pajak.go.id/index.php/id/peraturan/pajak-penghasilan-atas-deviden-yang-diterima-atau-diperoleh-oleh-wajib-pajak-orang): tarif final **10%** untuk dividen yang tetap terutang.
- [PP 55/2022 Pasal 9 ayat (2) huruf a/j, Pasal 10–11](https://www.pajak.go.id/index.php/id/peraturan/penyesuaian-pengaturan-di-bidang-pajak-penghasilan): dividen resmi badan dalam negeri dapat dikecualikan sepanjang diinvestasikan sesuai bentuk, batas waktu, dan masa investasi. Masa minimum tiga tahun pajak sejak tahun penerimaan; penempatan paling lambat akhir bulan ketiga setelah tahun penerimaan.
- PMK 81/2024 Pasal 370–374: syarat laporan realisasi, kewajiban menyetor sendiri dividen dalam negeri yang terutang, dan laporan sampai tahun ketiga. Rujukan administrasi yang dipakai adalah PMK 81, bukan hanya PMK 18/2021 atau PMK 111/2010 yang lama.

Reinvestasi boleh sebagian: dividen Rp100 juta dengan bagian yang memenuhi syarat Rp60 juta menyisakan dasar final Rp40 juta dan pajak Rp4 juta. Pengecualian tetap bersyarat selama kewajiban masa investasi/pelaporan berjalan. Pilihan “belum pasti/masih merencanakan” menahan nominal; tidak otomatis memberi pajak nol.

## Pemisahan dan batas penerapan

Catatan investasi tidak memengaruhi omzet usaha, uji ambang NPPN/UMKM, neto progresif, rekomendasi usaha, atau kredit nonfinal. Pemilik dan referensi bukti dicatat terpisah. Kesamaan nominal dengan bukti pengguna tidak diklaim sebagai verifikasi pelunasan oleh DJP. Bukti final yang dimasukkan ulang sebagai kredit nonfinal ditolak.

Kedua batas fitur pada serah terima telah ditangani untuk PH/MT dan tiga jenis investasi di atas. Data kosong atau kondisi yang belum dipastikan tetap ditahan. Saham pendiri, bursa/dividen luar negeri, fasilitas simpanan khusus, dan kerugian fiskal yang memerlukan kompensasi bukan keadaan yang boleh dipaksakan ke tarif biasa. Perubahan ini tidak menafsirkan pembagian pembebasan Rp500 juta antar kegiatan UMKM; itu bukan bagian panel investasi.

Uji otomatis: `tests/keluarga.test.ts` dan `tests/investasi.test.ts`, termasuk hitungan tangan, kedua peran pasangan, nol, kredit sesudah pembagian, batas simpanan, reinvestasi sebagian, dan pencegahan bukti ganda. Uji peramban produksi dan PDF dicatat di `docs/TESTING.md` setelah dijalankan.
