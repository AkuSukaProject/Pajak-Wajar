> ## ⚠️ KOREKSI 5 SEPTEMBER 2026 — BACA SEBELUM MEMAKAI DOKUMEN INI
>
> Dokumen ini dicocokkan ke teks asli PP 20/2026 yang diunduh dari JDIH Kemenkeu. Sebagian besar isinya terbukti benar, tetapi **dua hal memerlukan koreksi; Bagian I angka 3 telah diperbaiki pada 6 September 2026**:
>
> 1. **Rujukan lama pada Bagian I angka 3 sudah diganti.** Teks asli PP 20/2026 angka 6 berbunyi **"Pasal 59 dihapus."** Dasar pintu satu arah yang benar adalah **Pasal 57 ayat (2) huruf a jo. ayat (3) dan ayat (4)**. Ada uji otomatis yang menolak sitasi ke Pasal 59.
> 2. **Bagian I angka 2 dan III kurang lengkap soal dasar pengukuran ambang.** Pasal 58 ayat (1) huruf a mengukur peredaran bruto dari **Tahun Pajak terakhir sebelum Tahun Pajak bersangkutan**, bukan tahun berjalan.
>
> Selain itu, **persentase norma dan sebagian kode KLU** yang diturunkan dari dokumen ini ternyata tidak cocok dengan Lampiran I PER-17/PJ/2015; 17 dari 20 KLU sudah dikoreksi. Rinciannya di [REGULASI.md](REGULASI.md).
>
> Yang **terkonfirmasi benar** dari dokumen ini: pembebasan Rp500 juta dari omzet pribadi (UU PPh Pasal 7 ayat (2a)), ambang Rp4,8 miliar yang inklusif, tarif progresif, PTKP, tiga kelompok wilayah, dan kode layanan Coretax AS.04-01.

# 00_CATATAN.md — Riset & Kompilasi Regulasi Perpajakan
## PajakWajar · ITechno Cup 2026

**Pemilik Dokumen:** Sheva (Rule & Regulation Engine Owner)  
**Versi:** 1.0  
**Tanggal Verifikasi:** 24 Agustus 2026  
**Status:** Arsip riset awal dengan koreksi. Untuk status implementasi dan verifikasi terbaru, gunakan [REGULASI.md](REGULASI.md) dan data aturan aplikasi.

---

## 📌 BAGIAN I: JAWABAN EMPAT PERTANYAAN VERIFIKASI KRITIS (JALUR KRITIS D1)

Berikut adalah jawaban pasti yang diekstrak langsung dari teks undang-undang dan peraturan pemerintah resmi:

### 1. Dasar Pengenaan Pembebasan Omzet Rp 500 Juta
* **Pertanyaan:** Apakah pembebasan Rp 500 juta dihitung dari omzet pribadi Wajib Pajak, atau dari omzet konsolidasi keluarga?
* **Jawaban:** **Dihitung dari OMZET PRIBADI Wajib Pajak itu sendiri.**
* **Dasar Hukum:** 
  * **UU No. 7 Tahun 2021 (UU HPP) Pasal 7 ayat (2a):** *"Wajib Pajak orang pribadi yang memiliki peredaran bruto tertentu sebagaimana dimaksud dalam Pasal 4 ayat (2) huruf e tidak dikenai Pajak Penghasilan atas bagian peredaran bruto sampai dengan Rp500.000.000,00 (lima ratus juta rupiah) dalam 1 (satu) Tahun Pajak."*
  * **PP No. 55 Tahun 2022 jo. PP No. 20 Tahun 2026 Pasal 60:** Bagian peredaran bruto dari usaha sampai dengan Rp 500.000.000 dalam 1 Tahun Pajak tidak dikenai PPh Final 0,5% bagi WP Orang Pribadi.
* **Catatan Implementasi Kode (`calculator.ts`):**
  * `dasarPengenaanPajak = Math.max(0, omzetPribadi - 500000000)`
  * Konsolidasi keluarga (omzet pasangan/perseroan) **HANYA** digunakan pada Saringan Ambang Batas Rp 4,8 Miliar di `eligibility.ts`, **TIDAK** mengurangi kuota Rp 500 juta milik pribadi.

---

### 2. Ambang Batas Fasilitas Rp 4,8 Miliar: Inklusif atau Eksklusif?
* **Pertanyaan:** Tepat Rp 4.800.000.000 apakah masih berhak menggunakan PPh Final 0,5%?
* **Jawaban:** **MASIH BERHAK (Inklusif: $\le$ Rp 4.800.000.000).**
* **Dasar Hukum:**
  * **PP No. 55 Tahun 2022 jo. PP No. 20 Tahun 2026 Pasal 56 & 57:** *"Wajib Pajak dalam negeri yang memiliki peredaran bruto dari usaha **tidak melebihi Rp4.800.000.000,00** (empat miliar delapan ratus juta rupiah) dalam 1 (satu) Tahun Pajak..."*
* **Catatan Implementasi Kode (`eligibility.ts`):**
  * Jika `omzetKonsolidasi <= 4800000000` ➔ Status `BOLEH` (lolos saringan ambang).
  * Jika `omzetKonsolidasi > 4800000000` ➔ Status `TIDAK_BOLEH` (wajib pembukuan/tarif umum Pasal 17).

---

### 3. Konsekuensi Memilih Tarif Umum (Pintu Satu Arah)

Pilihan untuk memakai ketentuan umum diatur dalam **PP 55/2022 sebagaimana diubah dengan PP 20/2026, Pasal 57 ayat (2) huruf a dan ayat (3)**. **Pasal 57 ayat (4)** mengatur bahwa pada tahun-tahun pajak berikutnya wajib pajak yang dimaksud tidak dapat dikenai PPh berdasarkan bagian fasilitas final ini.

Aplikasi memeriksa `pernahPilihTarifUmum`. Jawaban `true` menutup PPh Final untuk tahun setelah pilihan tersebut; jawaban belum yakin menghasilkan `PERLU_DIPASTIKAN`. Tahun mulai pilihan perlu dicocokkan dengan pemberitahuan wajib pajak. Rujukan lama ke pasal yang dihapus tidak digunakan.

Sumber: [teks asli PP 20/2026, Pasal I angka 4](https://jdih.kemenkeu.go.id/dok/pp-20-tahun-2026). Uraian ini merupakan parafrasa, bukan kutipan langsung.

---

### 4. Daftar Pekerjaan Bebas yang Dilarang Memakai PPh Final 0,5%
* **Pertanyaan:** Siapa saja yang diklasifikasikan sebagai pekerjaan bebas dan dilarang memakai tarif 0,5%?
* **Jawaban:** Wajib Pajak yang memperoleh penghasilan dari jasa sehubungan dengan pekerjaan bebas tidak boleh memakai PPh Final 0,5%, melainkan wajib menggunakan **NPPN (Norma)** atau **Tarif Umum Pasal 17**.
* **Dasar Hukum & Penegasan Resmi:**
  * **PMK No. 168/PMK.03/2023 Pasal 1 angka 16:** Definisi pekerjaan bebas (tenaga ahli, pemain musik, pembawa acara, penyanyi, pelawak, bintang film/sinetron, perancang busana, olahragawan, penasihat, pengajar, pengarang, agen iklan, perantara).
  * **Penegasan DJP 5 Juni 2026:** *Influencer, Content Creator, Selebgram, Blogger, Vlogger, dan Affiliator* diklasifikasikan sebagai pekerjaan bebas bidang seni/keahlian pribadi, sehingga **TIDAK DAPAT** menggunakan PPh Final UMKM 0,5%.
* **Catatan Implementasi Kode (`klu_rules.json`):**
  * KLU dengan `pekerjaan_bebas: true` (seperti KLU 90002, 62010, 74100) otomatis mengunci `boleh_pph_final: false`.

---

## 🏛️ BAGIAN II: KOMPILASI PASAL-PASAL KUNCI PER REGULASI

### 1. PP No. 20 Tahun 2026 (Revisi PP 55/2022)
* **Status:** Berlaku sejak 22 April 2026 (LN Tahun 2026 No. 43).
* **Poin Kunci:**
  * **Pasal 57:** Subjek pajak yang berhak memakai tarif PPh Final 0,5% adalah WP Orang Pribadi dan Badan tertentu dengan omzet $\le$ Rp 4,8 Miliar yang bukan berasal dari pekerjaan bebas.
  * **Pasal 58:** Penggabungan peredaran bruto usaha keluarga (suami + istri) dan perseroan perorangan untuk menguji ambang batas fasilitas Rp 4,8 Miliar.
  * **Pasal 60:** Pembebasan omzet tidak kena pajak Rp 500 juta per tahun pajak bagi WP Orang Pribadi.

---

### 2. PER-17/PJ/2015 (Norma Penghitungan Penghasilan Neto - NPPN)
* **Status:** Masih berlaku resmi sebagai acuan persentase norma KLU.
* **Poin Kunci:**
  * **Pasal 2 ayat (1):** Wajib Pajak orang pribadi yang melakukan kegiatan usaha atau pekerjaan bebas yang peredaran brutonya dalam 1 tahun kurang dari Rp 4.800.000.000 wajib memberitahukan kepada Direktur Jenderal Pajak dalam jangka waktu **3 (tiga) bulan pertama dari Tahun Pajak yang bersangkutan (paling lambat 31 Maret)**.
  * **Masa Berlaku:** **Hanya berlaku untuk 1 (satu) Tahun Pajak**. Wajib diajukan ulang setiap tahun.
  * **3 Kelompok Wilayah Persentase Norma (Lampiran I):**
    * **Kelompok 1 (10 Ibukota Provinsi):** Medan, Palembang, Jakarta, Bandung, Semarang, Surabaya, Denpasar, Manado, Makassar, Pontianak.
    * **Kelompok 2:** Ibukota Provinsi lainnya di seluruh Indonesia.
    * **Kelompok 3:** Daerah / Kabupaten / Kota lainnya.

---

### 3. UU No. 7 Tahun 2021 (UU Harmonisasi Peraturan Perpajakan / HPP)
* **Poin Kunci:**
  * **Pasal 17 ayat (1) huruf a — Bracket Tarif Progresif PPh Orang Pribadi:**
    * Lapisan I: $0 \text{ s.d. } \text{Rp } 60.000.000 \rightarrow 5\%$
    * Lapisan II: $> \text{Rp } 60.000.000 \text{ s.d. } \text{Rp } 250.000.000 \rightarrow 15\%$
    * Lapisan III: $> \text{Rp } 250.000.000 \text{ s.d. } \text{Rp } 500.000.000 \rightarrow 25\%$
    * Lapisan IV: $> \text{Rp } 500.000.000 \text{ s.d. } \text{Rp } 5.000.000.000 \rightarrow 30\%$
    * Lapisan V: $> \text{Rp } 5.000.000.000 \rightarrow 35\%$
  * **Pasal 7 ayat (1) — Besaran PTKP Tahunan:**
    * `TK/0` = Rp 54.000.000
    * `TK/1` = Rp 58.500.000 | `TK/2` = Rp 63.000.000 | `TK/3` = Rp 67.500.000
    * `K/0` = Rp 58.500.000 | `K/1` = Rp 63.000.000 | `K/2` = Rp 67.500.000 | `K/3` = Rp 72.000.000

---

### 4. UU PPh (UU No. 36 Tahun 2008 jo. UU HPP) Pasal 23 & Pasal 28
* **Poin Kunci:**
  * **Pasal 23 ayat (1) huruf c:** Pemotongan PPh 23 sebesar 2% atas imbalan sehubungan dengan jasa teknik, jasa manajemen, jasa konstruksi, jasa konsultan, dan jasa lain selain jasa yang telah dipotong PPh Pasal 21.
  * **Pasal 28 ayat (1) huruf b:** Pajak yang telah dipotong pihak lain (PPh 23) **dikreditkan terhadap Pajak Penghasilan yang terutang** untuk Tahun Pajak yang bersangkutan pada SPT Tahunan.

---

### 5. Kode Layanan Coretax DJP
* **Layanan Utama:** **AS.04** (*Pemberitahuan Penggunaan NPPN dan Pembukuan Stelsel Kas*)
* **Sublayanan:** **AS.04-01** (*Pemberitahuan Penggunaan Norma Penghitungan Penghasilan Neto (NPPN)*)
* **Kanal Akses:** Portal Coretax DJP (Menu Layanan Perpajakan $\rightarrow$ Permohonan / Pemberitahuan).

---

## 🛠️ BAGIAN III: MAPPING STRUKTUR UNTUK KODE `klu_rules.json` & `eligibility.ts`

### 1. Struktur Keputusan 4 Saringan:
1. **Saringan 1 (KLU):** Cek apakah profesi/KLU merupakan `pekerjaan_bebas`. Jika ya, PPh Final 0,5% otomatis `TIDAK_BOLEH`.
2. **Saringan 2 (Administrasi AS.04-01):** Cek apakah pemberitahuan NPPN diajukan $\le$ 31 Maret tahun berjalan. Jika tidak, NPPN `TIDAK_BOLEH` (wajib tarif umum pembukuan). Jika user pilih "tidak yakin", status = `PERLU_DIPASTIKAN`.
3. **Saringan 3 (Ambang Konsolidasi):** Cek `omzetPribadi + omzetPasangan + omzetPerseroan <= 4800000000`. Jika lewat, PPh Final 0,5% `TIDAK_BOLEH`.
4. **Saringan 4 (Pintu Satu Arah):** Cek `pernahPilihTarifUmum`. Jika pernah, PPh Final 0,5% `TIDAK_BOLEH` permanen.

---

*Dokumen ini menjadi rujukan hukum mutlak saat memprogram `lib/eligibility.ts` dan `lib/calculator.ts`, serta saat sesi tanya jawab dewan juri ITechno Cup 2026.*
