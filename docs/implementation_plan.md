# Implementation Plan — PajakWajar Rule & Regulation Engine

Dokumen ini merupakan panduan implementasi komprehensif dan mandiri. Versi ini mengakomodasi seluruh penyelesaian masalah arsitektur, regulasi, struktur data, penghapusan tipe `any`, dan proteksi kalkulasi ganda untuk NPPN.

---

## 📁 Struktur Direktori Target Repository

```text
pajakwajar/
├── data/
│   ├── klu_rules.json                     # Seluruh parameter pajak, aturan kelayakan, & KLU
│   └── klu_rules.schema.json              # Schema JSON (Draft 2020-12) untuk validasi Ajv
├── docs/
│   ├── 00_CATATAN.md                      # Kompilasi riset pasal & status regulasi
│   ├── PRD_Sheva_RuleEngine_PajakWajar.md # Dokumen PRD spesifikasi teknis
│   └── implementation_plan.md             # Dokumen rencana implementasi ini
├── src/
│   ├── types/
│   │   └── pajak.ts                       # Single Source of Truth definisi tipe TypeScript
│   ├── lib/
│   │   ├── schemas.ts                     # Skema validasi Zod untuk masukan form & bupot
│   │   ├── eligibility.ts                 # Mesin saringan kelayakan hukum (Decision Tree)
│   │   ├── calculator.ts                  # Fungsi matematika murni kalkulasi multi-skema
│   │   └── index.ts                       # Orkestrator utama facade auditPajakMandiri
│   ├── components/
│   │   └── eligibility/
│   │       ├── AlurKelayakan.tsx          # Form wizard kelayakan dengan pertanyaan faktual
│   │       └── KartuVonis.tsx             # Kartu hasil vonis dengan sitasi DasarHukumDetail[]
│   └── mock/
│       └── hasilKelayakan.ts              # Data mock hasil audit untuk preview UI
├── tests/
│   ├── schema.test.ts                     # Uji Ajv, integritas data, allowlist domain, fixture angka
│   ├── eligibility.test.ts                # Uji agregasi prioritas, saringan kelayakan, branch coverage
│   ├── calculator.test.ts                 # Uji matematika murni (menerima parameter regulasi)
│   └── audit-pajak.test.ts               # Uji integrasi orkestrator auditPajakMandiri
├── package.json                           # Scripts: dev, build (next build), typecheck, test
├── tsconfig.json                          # Konfigurasi TypeScript & path alias @/*
└── vitest.config.ts                       # Konfigurasi runner test Vitest
```

---

## 🛑 Daftar Rujukan dan Status Verifikasi

Semua sitasi hukum dalam sistem mematuhi daftar ini, dikonfirmasi terhadap dokumen asli.
**Perhatian:** Pasal 59 PP 20/2026 telah dihapus dan tidak boleh direferensikan.

| Aturan | Rujukan Hukum yang Benar | Status Verifikasi |
|---|---|---|
| Larangan pekerjaan bebas | **Pasal 56 ayat (3) huruf a jo. ayat (4)** (PP 20/2026) | `TERVERIFIKASI` |
| Tarif PPh Final 0,5% | **Pasal 56 ayat (2)** (PP 20/2026) | `TERVERIFIKASI` |
| Subjek & Ambang 4,8 M | **Pasal 57 ayat (1)** (PP 20/2026) | `TERVERIFIKASI` |
| Pengecualian omzet keseluruhan | **Pasal 57 ayat (2) huruf e** (PP 20/2026) | `TERVERIFIKASI` |
| Pintu satu arah tarif umum | **Pasal 57 ayat (3) dan (4)** (PP 20/2026) | `TERVERIFIKASI` |
| Definisi peredaran bruto | **Pasal 58 ayat (1)** (PP 20/2026) | `TERVERIFIKASI` |
| Penggabungan suami–istri | **Pasal 58 ayat (2) dan (3)** (PP 20/2026) | `TERVERIFIKASI` |
| Pembebasan omzet Rp 500 Jt | **PP 55/2022 Pasal 60 jo. PP 20/2026** | `DALAM_REVIEW` |
| Ketentuan peralihan 2025 | **Pasal II** (PP 20/2026) | `DALAM_REVIEW` |
| Ambang NPPN | **Pasal 1 & 2(1)** (PER-17/PJ/2015) | `TERVERIFIKASI` |
| Pemberitahuan NPPN | **Pasal 2(1)** (PER-17/PJ/2015) | `TERVERIFIKASI` |
| Persentase KLU | **Lampiran I** (PER-17/PJ/2015) | `TERVERIFIKASI` |

---

## 🔑 Keputusan Arsitektur Utama

### 1. JSON Schema & Lingkup WP
- Menggunakan JSON Schema **Draft 2020-12** (`Ajv2020`), dengan `additionalProperties: false`.
- **Hanya melayani WP Orang Pribadi**.

### 2. Multi-Kegiatan dan Keterbatasan Kalkulasi NPPN
Versi lomba membatasi input KLU menjadi satu KLU utama. Jika pengguna memiliki lebih dari satu kegiatan, maka mengalikan total peredaran bruto dengan persentase norma dari KLU utama adalah **pelanggaran PER-17/PJ/2015 Pasal 5**.
Oleh karena itu, jika `punyaLebihDariSatuKegiatan === true` atau `'tidak_yakin'`:
- **`statusKelayakan`**: tetap diperiksa (dapat `BOLEH`).
- **`statusKalkulasi`**: dipaksa menjadi `BELUM_TERSEDIA` (kalkulator diblokir).
- **Saran**: Arahkan pengguna menghitung tiap kegiatan secara terpisah.

### 3. Pemisahan Himpunan Data Ambang Omzet
Satu field omzet tidak boleh digunakan ganda:
- **Ambang PPh Final** menggunakan himpunan `omzet*ThnSebelumnya` (Pasal 58 ayat (1)).
- **Ambang NPPN** menggunakan himpunan `omzetPribadiTahunPajak` (Pasal 1 PER-17/PJ/2015).

### 4. Logika Agregasi Prioritas (Saringan Kelayakan)
Vonis `TIDAK_BOLEH` bersifat menggugurkan secara mutlak.
1. Jika ada ≥1 syarat `TIDAK_BOLEH` → Hasil Akhir: **`TIDAK_BOLEH`**
2. Jika tidak ada `TIDAK_BOLEH`, namun ada ≥1 syarat `PERLU_DIPASTIKAN` → Hasil Akhir: **`PERLU_DIPASTIKAN`**
3. Jika seluruh syarat menghasilkan `BOLEH` → Hasil Akhir: **`BOLEH`**

### 5. Pemisahan `statusKelayakan` dan `statusKalkulasi`
Kalkulasi dipisahkan dari status legal kelayakan. Jika aturan berstatus `DALAM_REVIEW` (mis. Pembebasan 500Jt), kelayakannya tetap `BOLEH`, namun rumus diblokir dengan status kalkulasi `BELUM_TERSEDIA`.

---

## 🗄️ Struktur Tipe & Kontrak Data (`src/types/pajak.ts`)

Semua penggunaan tipe `any` telah **dilarang mutlak**. Penggunaan Discriminated Unions diimplementasikan untuk kejelasan struktural.

```ts
export type TahunPajak = 2025 | 2026;
export type KelompokWilayahKey = 'kelompok1' | 'kelompok2' | 'kelompok3';
export type StatusPtkp = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export type StatusPerpajakanPasangan =
  | 'GABUNG'
  | 'PISAH_HARTA'
  | 'PISAH_KEWAJIBAN'
  | 'TIDAK_YAKIN'
  | 'TIDAK_ADA_PASANGAN';

export type BentukKegiatan =
  | 'PEKERJAAN_BEBAS'
  | 'USAHA_JASA'
  | 'USAHA_DAGANG'
  | 'BELUM_PASTI';

export type StatusVerifikasi = 'TERVERIFIKASI' | 'DALAM_REVIEW';
export type OperatorAmbang = 'LT' | 'LTE';

export type StatusKalkulasi =
  | 'TERSEDIA'        // Rumus lengkap dan siap dihitung
  | 'BELUM_TERSEDIA'  // Parameter wajib masih dalam review / batasan sistem (multi kegiatan)
  | 'TIDAK_RELEVAN';  // Karena status kelayakan TIDAK_BOLEH / PERLU_DIPASTIKAN

export interface DasarHukumDetail {
  namaRegulasi: string;
  pasalAtauLampiran: string;
  fungsi: string;
  url: string;
  statusVerifikasi: StatusVerifikasi;
}

export interface ProfilWajibPajak {
  tahunPajak: TahunPajak;
  kluKode: string;
  wilayah: KelompokWilayahKey;
  statusPtkp: StatusPtkp;
  bentukKegiatan: BentukKegiatan;
  statusPerpajakanPasangan: StatusPerpajakanPasangan;
  punyaLebihDariSatuKegiatan: boolean | 'tidak_yakin';

  // Tahun pajak berjalan — untuk KALKULASI & Ambang NPPN
  omzetPribadiTahunPajak: number;
  biayaOperasionalRiil?: number;

  // Tahun sebelumnya — untuk UJI KELAYAKAN Ambang PPh Final
  omzetPribadiThnSebelumnya: number;
  omzetPasanganThnSebelumnya: number;
  omzetSeluruhPerseroanPeroranganThnSebelumnya: number;

  sudahMemberitahukanNppn: boolean | 'tidak_yakin';
  pernahPilihTarifUmum: boolean | 'tidak_yakin';
  jugaPegawaiTetap: boolean;
}

// --------------------------------------------------------------------------
// Rincian Kalkulasi (Discriminated Union, tanpa "any")
// --------------------------------------------------------------------------

export type RincianPphFinal = {
  skema: 'PPH_FINAL_05';
  omzetPribadi: number;
  batasPembebasan: number;
  dasarPengenaan: number;
  tarif: number;
};

export type RincianNppn = {
  skema: 'NPPN';
  omzetPribadi: number;
  persenNorma: number;
  penghasilanNeto: number;
  ptkp: number;
  pkp: number;
  kreditBupot: number;
};

export type RincianTarifUmum = {
  skema: 'TARIF_UMUM';
  omzetPribadi: number;
  biayaOperasional: number;
  penghasilanNeto: number;
  ptkp: number;
  pkp: number;
  kreditBupot: number;
};

// --------------------------------------------------------------------------
// Hasil Skema (Discriminated Union berdasarkan "id")
// --------------------------------------------------------------------------

export type BaseHasilSkema = {
  statusKelayakan: 'BOLEH' | 'TIDAK_BOLEH' | 'PERLU_DIPASTIKAN';
  alasanKelayakan: string[];
  dasarHukum: DasarHukumDetail[];
  statusKalkulasi: StatusKalkulasi;
  alasanKalkulasi?: string;
  pajakTerutang?: number;
};

export type HasilSkemaPphFinal = BaseHasilSkema & {
  id: 'PPH_FINAL_05';
  rincianKalkulasi?: RincianPphFinal;
};

export type HasilSkemaNppn = BaseHasilSkema & {
  id: 'NPPN';
  rincianKalkulasi?: RincianNppn;
};

export type HasilSkemaTarifUmum = BaseHasilSkema & {
  id: 'TARIF_UMUM';
  rincianKalkulasi?: RincianTarifUmum;
};

export type HasilSkema = HasilSkemaPphFinal | HasilSkemaNppn | HasilSkemaTarifUmum;
```

---

## 🗃️ Basis Data Regulasi (`data/klu_rules.json`)

*(Potongan di bawah diformat menggunakan komentar pseudo-code berformat `jsonc`)*

```jsonc
{
  "versiRegulasi": "PP-20-2026",
  "statusDokumen": "Dalam review (Granular per Aturan)",
  "tahunPajakDidukung": [2025, 2026],
  "lingkupWajibPajak": "ORANG_PRIBADI",

  "parameterPajak": {
    "pphFinal": {
      "tarif": { "nilai": 0.005, "statusVerifikasi": "TERVERIFIKASI", "dasarHukum": [ /* ... */ ] },
      "ambangOmzet": { "nilai": 4800000000, "operator": "LTE", "statusVerifikasi": "TERVERIFIKASI", "dasarHukum": [ /* ... */ ] },
      "pembebasanOmzetOp": {
        "nilai": 500000000,
        "statusVerifikasi": "DALAM_REVIEW", // Status ditahan sampai kepastian regulasi
        "dasarHukum": [
          {
            "namaRegulasi": "PP No. 55 Tahun 2022 jo. PP No. 20 Tahun 2026",
            "pasalAtauLampiran": "Pasal 60",
            "fungsi": "Dasar pembebasan omzet Rp 500 Juta bagi WP OP",
            "url": "https://jdih.kemenkeu.go.id/dok/pp-55-tahun-2022",
            "statusVerifikasi": "DALAM_REVIEW"
          }
        ]
      }
    },
    "nppn": {
      "ambangOmzet": {
        "nilai": 4800000000,
        "operator": "LT",
        "statusVerifikasi": "TERVERIFIKASI",
        "dasarHukum": [
          {
            "namaRegulasi": "PER-17/PJ/2015",
            "pasalAtauLampiran": "Pasal 1 dan Pasal 2 ayat (1)",
            "fungsi": "Ambang peredaran bruto NPPN tahun berjalan",
            "url": "https://pajak.go.id/sites/default/files/2019-03/PER%20-%2017.PJ_.2015.pdf",
            "statusVerifikasi": "TERVERIFIKASI"
          }
        ]
      }
      /* ... parameter nppn lainnya */
    }
    /* ... parameter tarifProgresif dan ptkp */
  },
  "aturanKelayakan": {
    /* ... definisi status & dasar hukum untuk pekerjaanBebas, ambangKonsolidasi, dll ... */
  },
  "klu": [
    {
      "kluKode": "74201",
      "dasarHukum": [{
        "namaRegulasi": "Lampiran I PER-17/PJ/2015",
        "pasalAtauLampiran": "Daftar Persentase Norma",
        "fungsi": "Persentase norma perhitungan penghasilan neto",
        "url": "https://www.pajak.go.id/sites/default/files/2019-06/Lampiran%201_PER_17_PJ_2015.pdf",
        "statusVerifikasi": "TERVERIFIKASI"
      }]
    }
  ]
}
```

---

## 🧠 Core Engine (`src/lib/`)

### `eligibility.ts` (Saringan Kelayakan)
- **Agregasi Prioritas**: `TIDAK_BOLEH > PERLU_DIPASTIKAN > BOLEH`.
- **Konsolidasi Pasangan (Ambang PPh Final)**:
  - `PISAH_HARTA` / `PISAH_KEWAJIBAN` → gabungkan omzet pribadi + pasangan + seluruh perseroan tahun sebelumnya.
  - `GABUNG` atau `TIDAK_YAKIN` → menghasilkan `PERLU_DIPASTIKAN` (menghindari asumsi tanpa verifikasi Pasal 58 ayat 3).

### `calculator.ts` (Fungsi Matematika Murni)
- Semua fungsi mengembalikan **union diskriminasi**. `hitungPphFinal` mengembalikan `RincianPphFinal`, dst.
- Tidak ada validasi hukum di dalam kalkulator. Validasi hukum adalah domain `eligibility.ts` dan orkestrator.

### `index.ts` (Orkestrator `auditPajakMandiri`)
1. Validasi schema Zod.
2. Panggil `eligibility.ts` untuk mendapatkan `statusKelayakan`.
3. Tentukan `statusKalkulasi`:
   - Jika `statusKelayakan !== 'BOLEH'` → `statusKalkulasi = 'TIDAK_RELEVAN'`.
   - **(Multi-Kegiatan)** Jika profil `punyaLebihDariSatuKegiatan === true | 'tidak_yakin'` → NPPN tidak dikalkulasi (`statusKalkulasi = 'BELUM_TERSEDIA'`).
   - Jika parameter wajib `DALAM_REVIEW` (mis. Pembebasan 500Jt) → `statusKalkulasi = 'BELUM_TERSEDIA'`.
   - Jika lulus semua blokade → `statusKalkulasi = 'TERSEDIA'`, panggil kalkulator.
4. Jangan me-downgrade `statusKelayakan` (legalitas) gara-gara `statusKalkulasi` diblokir.

---

## Guardrail Implementasi Wajib

### 1. Konsistensi Status dan Rincian Kalkulasi

Tipe hasil harus mencegah kondisi yang saling bertentangan:

- `TERSEDIA` wajib memiliki `pajakTerutang` dan `rincianKalkulasi`.
- `BELUM_TERSEDIA` wajib memiliki `alasanKalkulasi` dan tidak boleh memiliki nominal/rincian.
- `TIDAK_RELEVAN` tidak boleh memiliki nominal/rincian.

Gunakan discriminated union berdasarkan `statusKalkulasi`, bukan hanya properti opsional.

### 2. Biaya Operasional Tarif Umum

Jika `biayaOperasionalRiil` belum diisi, kalkulasi Tarif Umum harus berstatus `BELUM_TERSEDIA`. Nilai `undefined` tidak boleh otomatis dianggap Rp0 karena dapat menghasilkan pajak yang terlalu besar.

### 3. Kontrak Kredit Bukti Potong

Profil dan kredit pajak dipisahkan agar input manual/OCR dapat diintegrasikan tanpa mencampurkan bukti potong ke profil:

```ts
export type InputAuditPajak = {
  profil: ProfilWajibPajak;
  kreditPajak: KreditPajakItem[];
};
```

Mode input manual wajib berfungsi sebelum OCR diaktifkan.

### 4. Sinkronisasi Frontend dan Mock

Perubahan kontrak harus diterapkan bersama pada:

- `src/components/eligibility/AlurKelayakan.tsx`
- `src/components/eligibility/KartuVonis.tsx`
- `src/mock/hasilKelayakan.ts`
- `src/lib/schemas.ts`

Form wajib menangani bentuk kegiatan, jumlah kegiatan, status perpajakan pasangan, omzet tahun pajak, omzet tahun sebelumnya, agregat seluruh perseroan perorangan, serta biaya operasional untuk Tarif Umum.

### 5. Dokumentasi Fungsi

Setiap fungsi di `src/lib/` wajib memiliki JSDoc dengan rujukan pasal atau penjelasan bahwa fungsi tersebut murni matematis dan menerima parameter regulasi dari data.

---

## 🔍 Verification Plan & Strategi Pengujian

```powershell
npm run typecheck
npm test
npm run build
```

### `tests/schema.test.ts`
- JSON lolos `Ajv2020` (Draft 2020-12, `additionalProperties: false`).
- Sitasi Pasal 60 mengarah ke PP 55/2022.

### `tests/eligibility.test.ts`
- **Agregasi Prioritas (Wajib):** `PEKERJAAN_BEBAS` (TIDAK_BOLEH) + Pasangan `GABUNG` (PERLU_DIPASTIKAN) → **`TIDAK_BOLEH`**.
- **Agregasi Prioritas:** `pernahPilihTarifUmum` (TIDAK_BOLEH) + Pasangan `TIDAK_YAKIN` (PERLU_DIPASTIKAN) → **`TIDAK_BOLEH`**.

### `tests/calculator.test.ts`
- Rincian kalkulasi mengembalikan format yang kompatibel secara statis dengan interface `RincianPphFinal`, `RincianNppn`, atau `RincianTarifUmum`.

### `tests/audit-pajak.test.ts`
- **Multi-kegiatan NPPN**: Profil dengan `punyaLebihDariSatuKegiatan === true` dapat meraih `statusKelayakan: 'BOLEH'` untuk NPPN, tetapi `statusKalkulasi` wajib `BELUM_TERSEDIA`. Total omzet tidak boleh dikalikan dengan norma KLU tunggal.
- **Pemisahan Status:** Pembebasan 500Jt `DALAM_REVIEW` → `statusKelayakan` PPh Final `BOLEH`, tetapi `statusKalkulasi` `BELUM_TERSEDIA`.
- `rincianKalkulasi` wajib menggunakan struktur sesuai `id` skema (`PPH_FINAL_05` -> `RincianPphFinal`, dst). Tipe `any` dilarang.
- `statusKalkulasi: 'TERSEDIA'` wajib memiliki nominal dan rincian; status lain melarang keduanya.
- Tarif Umum tanpa `biayaOperasionalRiil` → `BELUM_TERSEDIA`, bukan memakai Rp0.
- `InputAuditPajak` menerima kredit pajak terpisah dari profil.
