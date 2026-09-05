# Deployment

Target: **Vercel**. Region disetel ke `sin1` (Singapura) pada `vercel.json` karena seluruh pengguna berada di Indonesia.

## Prasyarat

- Node.js 20 atau lebih baru (diuji pada 24.19.0).
- Akun Vercel yang terhubung ke repositori.

## Dua remote: organisasi dan pribadi

Paket Vercel Hobby (gratis) tidak dapat men-deploy repositori milik **organisasi** GitHub. Karena repositori utama berada di `AkuSukaProject`, disiapkan remote kedua ke repositori pribadi:

| Remote | URL | Peran |
|---|---|---|
| `origin` | `https://github.com/AkuSukaProject/Pajak-Wajar.git` | Repositori tim, sumber kebenaran |
| `pribadi` | `https://github.com/samythh/Pajak-Wajar.git` | Repositori pribadi (privat), khusus agar Vercel Hobby dapat men-deploy |

Kerjakan dan review kode tetap di `origin`. `pribadi` hanya cermin untuk deployment:

```bash
git push origin <cabang>     # alur kerja tim seperti biasa
git push pribadi <cabang>    # perbarui cermin deployment
```

Hubungkan **repositori pribadi** itu ke Vercel, bukan yang di organisasi. Bila nanti tim memakai paket berbayar, remote `pribadi` dapat dihapus dengan `git remote remove pribadi`.

## Langkah

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

Bila kelima perintah lulus, hubungkan repositori ke Vercel. Vercel mengenali Next.js secara otomatis; tidak ada perintah build kustom yang perlu diisi.

```bash
npx vercel        # pratinjau
npx vercel --prod # produksi
```

## Variabel lingkungan

| Nama | Wajib | Lingkup | Keterangan |
|---|---|---|---|
| `GEMINI_API_KEY` | Tidak | Server saja | Hanya untuk pembacaan foto bukti potong. Tanpa kunci ini aplikasi tetap berjalan penuh: `/api/ocr-bupot` menjawab 503 dan antarmuka mengarahkan pengguna mengetik manual. |
| `GEMINI_MODEL` | Tidak | Server saja | Bawaan `gemini-2.5-flash`. |

Isi keduanya di **Project Settings → Environment Variables** pada Vercel, bukan di berkas yang ikut ter-commit. Jangan pernah memakai awalan `NEXT_PUBLIC_` untuk kunci ini: variabel berawalan itu ikut terkirim ke peramban.

`.env.local` tidak boleh masuk ke Git. Pastikan `.gitignore` masih memuatnya sebelum melakukan push.

### Cara mendapatkan `GEMINI_API_KEY`

1. Buka **[Google AI Studio](https://aistudio.google.com/apikey)** dan masuk dengan akun Google.
2. Klik **Create API key**, pilih project Google Cloud yang ada atau biarkan AI Studio membuatkan yang baru.
3. Salin kuncinya. Kunci hanya ditampilkan penuh sekali; simpan di pengelola kata sandi, bukan di catatan yang ikut ter-commit.

Kunci itu terikat pada akun Google pribadi. Jangan bagikan di grup, jangan tempel di README, dan jangan kirim lewat chat. Bila bocor, cabut lewat halaman yang sama lalu buat yang baru.

### Cara mengisi `.env.local`

Salin templatnya, lalu isi barisnya:

```bash
cp .env.example .env.local     # PowerShell: Copy-Item .env.example .env.local
```

```env
GEMINI_API_KEY=AIza...isi-kunci-anda-di-sini
GEMINI_MODEL=
```

`GEMINI_MODEL` **boleh dikosongkan**. Bila kosong, aplikasi memakai `gemini-2.5-flash`. Isi hanya bila Anda sengaja ingin model lain.

### Memastikan kunci dan nama model benar

Nama model bisa berubah seiring waktu, jadi jangan menebak. Tanyakan langsung ke layanannya model apa yang tersedia untuk kunci Anda:

```bash
curl -s "https://generativelanguage.googleapis.com/v1beta/models" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  | grep -o '"name": "models/[^"]*"'
```

Di PowerShell:

```powershell
$k = (Select-String -Path .env.local -Pattern '^GEMINI_API_KEY=(.+)$').Matches.Groups[1].Value
(Invoke-RestMethod "https://generativelanguage.googleapis.com/v1beta/models" -Headers @{ "x-goog-api-key" = $k }).models.name
```

- Daftar keluar → kunci valid. Pastikan model yang Anda pakai ada di daftar itu.
- `API key not valid` → kunci salah salin atau sudah dicabut.
- `403` dengan pesan soal API belum aktif → aktifkan Generative Language API pada project Google Cloud yang bersangkutan.

### Menguji pembacaan bukti potong

Setelah `.env.local` terisi:

```bash
npm run test:ocr
```

Perintah itu mengirim `tests/fixtures/contoh-bupot.png` — lembar latihan berisi data karangan — ke layanan, lalu memeriksa apakah yang terbaca Rp120.000.000 dan Rp6.000.000. Hasil bacaannya dicetak ke konsol supaya dapat Anda bandingkan sendiri.

Selama `.env.local` tidak ada atau kuncinya kosong, tes itu **dilewati** dan tidak ada gambar yang dikirim ke mana pun. `tests/setup-env.ts` yang memuat berkas itu ke `process.env`, karena Vitest tidak melakukannya sendiri seperti Next.js. Variabel dari lingkungan tetap menang atas isi berkas, sehingga `GEMINI_API_KEY=... npm run test:ocr` juga berfungsi.

### Kuota dan biaya

AI Studio menyediakan kuota gratis dengan batas permintaan per menit dan per hari. Untuk demo lomba, satu bukti potong per pembacaan jelas jauh di bawah batas itu. Periksa kuota dan harga yang berlaku di halaman AI Studio sebelum memakainya di luar demo, karena ketentuannya dapat berubah.

## Yang berjalan di mana

| Bagian | Tempat eksekusi |
|---|---|
| Uji kelayakan, seluruh perhitungan pajak, pembuatan kertas kerja PDF | Peramban pengguna |
| Route `/api/ocr-bupot` | Server (Node.js runtime), hanya sebagai perantara agar kunci API tidak sampai ke peramban |

Tidak ada basis data dan tidak ada penyimpanan berkas. Foto bukti potong diteruskan sekali jalan dan tidak ditulis ke disk.

## Header keamanan

Diatur di `next.config.ts`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, dan `poweredByHeader: false`. Verifikasi setelah deploy:

```bash
curl -sI https://<domain-anda>/ | grep -i "x-content-type-options\|x-frame-options\|referrer-policy"
```

## Setelah deploy

1. Buka `/cek-kelayakan`, selesaikan enam langkah, pastikan tiga kartu vonis muncul.
2. Tekan **Simpan ringkasan sebagai PDF** dan pastikan berkas terunduh.
3. Buka panel “Lihat aturan resminya”, klik satu tautan JDIH, pastikan dokumen aslinya terbuka.
4. Bila `GEMINI_API_KEY` belum diisi, pastikan pesan yang muncul mengarahkan ke input manual, bukan pesan galat teknis.

## Catatan keamanan dependensi

`npm audit` masih melaporkan 8 temuan. Seluruhnya berasal dari dependensi transitif dan belum ada perbaikan non-breaking:

| Paket | Jalur | Perbaikan |
|---|---|---|
| `postcss` (4 advisory, high) | transitif dari `next@15.5.23` | butuh `next@16` (breaking) |
| `sharp` (high) | transitif dari `next@15.5.23` | butuh `next@16` (breaking) |
| `esbuild`, `vite`, `@vitest/mocker`, `vite-node` (moderate–high) | transitif dari `vitest@2` | butuh `vitest@5` + `vite@8` (breaking) |
| `vitest` (**critical**) | GHSA-5xrq-8626-4rwp | butuh `vitest@5` (breaking) |

Ditelusuri satu per satu, tidak ada yang dapat dieksploitasi pada aplikasi ini:

- **`vitest` critical** hanya berlaku *"when Vitest UI server is listening"*. Proyek ini tidak memakai Vitest UI: `@vitest/ui` tidak terpasang, dan skripnya hanya `vitest run` dan `vitest`.
- **`sharp`** hanya dipanggil `next/image`. Aplikasi ini tidak memakai `next/image` sama sekali.
- **`postcss`** berjalan saat build atas berkas CSS milik proyek sendiri, bukan atas masukan pengguna.
- **`esbuild` dan `vite`** menyangkut dev server, bukan build produksi maupun runtime di Vercel.

Karena tidak ada yang fatal dan perbaikannya menuntut lompatan versi mayor, pembaruan **sengaja ditunda sampai setelah tenggat lomba**. Jangan menjalankan `npm audit fix --force` menjelang submission. Setelahnya:

```bash
npm install next@16 eslint-config-next@16
npm install -D vitest@5 vite@8
npm run lint && npm run typecheck && npm test && npm run build
```
