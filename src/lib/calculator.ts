import type { LapisanTarif } from '@/lib/regulasi';
import type {
  BarisKegiatanNorma,
  LapisanTerpakai,
  RincianNppn,
  RincianPphFinal,
  RincianTarifUmum
} from '@/types/pajak';

/**
 * Fungsi matematika murni. Berkas ini sengaja tidak memuat penilaian hukum:
 * seluruh parameter regulasi (tarif, ambang, PTKP, norma) diterima sebagai
 * argumen dari `data/klu_rules.json`. Keputusan boleh atau tidaknya sebuah
 * skema adalah urusan `eligibility.ts`.
 */

/** Membulatkan ke rupiah penuh. Pajak terutang tidak mengenal pecahan sen. */
function bulatkanRupiah(nilai: number): number {
  return Math.round(nilai);
}

/** PKP dibulatkan ke bawah ke ribuan penuh, UU PPh Pasal 17 ayat (4). */
export function bulatkanPkp(nilai: number): number {
  return Math.floor(Math.max(0, nilai) / 1000) * 1000;
}

/**
 * Menghitung pajak progresif secara BERLAPIS: setiap lapisan hanya dikenakan
 * pada bagian PKP yang jatuh di dalamnya, bukan satu tarif untuk seluruh PKP.
 *
 * @param pkp Penghasilan Kena Pajak yang sudah dibulatkan ke bawah.
 * @param lapisan Lapisan tarif dari `parameterPajak.tarifProgresif.lapisan`
 *   (UU No. 7 Tahun 2021, Pasal 17 ayat (1) huruf a UU PPh).
 */
export function hitungTarifProgresifBerlapis(
  pkp: number,
  lapisan: LapisanTarif[]
): { pajak: number; lapisanTerpakai: LapisanTerpakai[] } {
  const sisaAwal = bulatkanPkp(pkp);
  const lapisanTerpakai: LapisanTerpakai[] = [];
  let pajak = 0;

  for (const baris of lapisan) {
    const batasAtas = baris.batasAtas ?? Number.POSITIVE_INFINITY;
    if (sisaAwal <= baris.batasBawah) break;

    const bagianPkp = Math.min(sisaAwal, batasAtas) - baris.batasBawah;
    if (bagianPkp <= 0) continue;

    const pajakLapisan = bagianPkp * baris.tarif;
    pajak += pajakLapisan;
    lapisanTerpakai.push({
      lapisan: baris.lapisan,
      batasBawah: baris.batasBawah,
      batasAtas: baris.batasAtas,
      tarif: baris.tarif,
      bagianPkp,
      pajakLapisan: bulatkanRupiah(pajakLapisan)
    });
  }

  return { pajak: bulatkanRupiah(pajak), lapisanTerpakai };
}

/**
 * PPh Final UMKM 0,5%.
 *
 * Dasar pengenaan memakai omzet PRIBADI tahun pajak berjalan dikurangi bagian
 * peredaran bruto yang dibebaskan. Omzet pasangan dan perseroan perorangan
 * hanya dipakai untuk uji ambang di `eligibility.ts`, tidak pernah di sini.
 *
 * Rujukan: PP 20/2026 Pasal 56 ayat (2) untuk tarif; UU No. 7 Tahun 2021
 * Pasal 7 ayat (2a) UU PPh jo. PP 55/2022 Pasal 60 untuk pembebasan Rp500 juta.
 */
export function hitungPphFinal(params: {
  omzetPribadi: number;
  batasPembebasan: number;
  tarif: number;
}): RincianPphFinal {
  const omzetPribadi = Math.max(0, params.omzetPribadi);
  const dasarPengenaan = Math.max(0, omzetPribadi - params.batasPembebasan);
  return {
    skema: 'PPH_FINAL_05',
    omzetPribadi,
    batasPembebasan: params.batasPembebasan,
    dasarPengenaan,
    tarif: params.tarif,
    pajakTerutang: bulatkanRupiah(dasarPengenaan * params.tarif)
  };
}

/**
 * Norma Penghitungan Penghasilan Neto (NPPN).
 *
 * Penghasilan neto diperkirakan dari persentase norma menurut KLU dan kelompok
 * wilayah, lalu dikurangi PTKP dan dikenai tarif progresif berlapis. Kredit
 * bukti potong mengurangi pajak terutang, dan hasilnya tidak dibuat negatif
 * karena lebih bayar ditangani lewat SPT, bukan lewat alat bantu ini.
 *
 * Rujukan: PER-17/PJ/2015 Lampiran I untuk persentase norma;
 * UU No. 7 Tahun 2021 Pasal 7 ayat (1) dan Pasal 17 ayat (1) huruf a UU PPh.
 */
export function hitungNppn(params: {
  omzetPribadi: number;
  persenNorma: number;
  ptkp: number;
  kreditBupot: number;
  lapisan: LapisanTarif[];
  penghasilanNetoPegawai?: number;
  /**
   * Neto pasangan yang digabungkan menurut UU PPh Pasal 8 ayat (1). Pemanggil
   * wajib memastikan penggabungan itu memang berlaku; fungsi ini tidak menilai.
   */
  penghasilanNetoPasangan?: number;
  /**
   * Bila diisi lebih dari satu baris, neto usaha dihitung per kegiatan memakai
   * persentase Norma masing-masing lalu dijumlahkan, sesuai PER-17/PJ/2015
   * Pasal 5. Omzet gabungan tidak pernah dikalikan satu persentase.
   */
  kegiatan?: BarisKegiatanNorma[];
}): RincianNppn {
  const kegiatan = params.kegiatan && params.kegiatan.length > 1 ? params.kegiatan : undefined;

  const omzetPribadi = kegiatan
    ? kegiatan.reduce((jumlah, baris) => jumlah + Math.max(0, baris.omzet), 0)
    : Math.max(0, params.omzetPribadi);

  const penghasilanNetoUsaha = kegiatan
    ? kegiatan.reduce((jumlah, baris) => jumlah + baris.netoKegiatan, 0)
    : omzetPribadi * (params.persenNorma / 100);

  // Untuk beberapa kegiatan, persentase yang ditampilkan adalah gabungan
  // efektif; angka aslinya per kegiatan tetap dibawa pada `rincianKegiatan`.
  const persenTampil = kegiatan
    ? (omzetPribadi > 0 ? (penghasilanNetoUsaha / omzetPribadi) * 100 : 0)
    : params.persenNorma;

  const penghasilanNetoPegawai = Math.max(0, params.penghasilanNetoPegawai ?? 0);
  const penghasilanNetoPasangan = Math.max(0, params.penghasilanNetoPasangan ?? 0);
  const penghasilanNeto = penghasilanNetoUsaha + penghasilanNetoPegawai + penghasilanNetoPasangan;
  const pkp = bulatkanPkp(penghasilanNeto - params.ptkp);
  const { pajak, lapisanTerpakai } = hitungTarifProgresifBerlapis(pkp, params.lapisan);
  const kreditBupot = Math.max(0, params.kreditBupot);

  return {
    skema: 'NPPN',
    omzetPribadi,
    persenNorma: persenTampil,
    ...(kegiatan ? { rincianKegiatan: kegiatan } : {}),
    penghasilanNeto,
    penghasilanNetoUsaha,
    penghasilanNetoPegawai,
    penghasilanNetoPasangan,
    ptkp: params.ptkp,
    pkp,
    pajakSebelumKredit: pajak,
    kreditBupot,
    pajakTerutang: Math.max(0, pajak - kreditBupot),
    kelebihanKredit: Math.max(0, kreditBupot - pajak),
    lapisanTerpakai
  };
}

/**
 * Tarif umum Pasal 17 atas dasar pembukuan.
 *
 * Biaya operasional wajib diisi pemanggil. Nilai `undefined` tidak boleh
 * diperlakukan sebagai Rp0 karena akan melambungkan pajak; pemblokiran itu
 * ditangani orkestrator sebelum fungsi ini dipanggil.
 *
 * Rujukan: UU No. 7 Tahun 2021 Pasal 7 ayat (1) dan Pasal 17 ayat (1) huruf a UU PPh.
 */
export function hitungTarifUmum(params: {
  omzetPribadi: number;
  biayaOperasional: number;
  ptkp: number;
  kreditBupot: number;
  lapisan: LapisanTarif[];
  penghasilanNetoPegawai?: number;
  /** Neto pasangan yang digabungkan menurut UU PPh Pasal 8 ayat (1). */
  penghasilanNetoPasangan?: number;
}): RincianTarifUmum {
  const omzetPribadi = Math.max(0, params.omzetPribadi);
  const biayaOperasional = Math.max(0, params.biayaOperasional);
  const penghasilanNetoUsaha = Math.max(0, omzetPribadi - biayaOperasional);
  const penghasilanNetoPegawai = Math.max(0, params.penghasilanNetoPegawai ?? 0);
  const penghasilanNetoPasangan = Math.max(0, params.penghasilanNetoPasangan ?? 0);
  const penghasilanNeto = penghasilanNetoUsaha + penghasilanNetoPegawai + penghasilanNetoPasangan;
  const pkp = bulatkanPkp(penghasilanNeto - params.ptkp);
  const { pajak, lapisanTerpakai } = hitungTarifProgresifBerlapis(pkp, params.lapisan);
  const kreditBupot = Math.max(0, params.kreditBupot);

  return {
    skema: 'TARIF_UMUM',
    omzetPribadi,
    biayaOperasional,
    penghasilanNeto,
    penghasilanNetoUsaha,
    penghasilanNetoPegawai,
    penghasilanNetoPasangan,
    ptkp: params.ptkp,
    pkp,
    pajakSebelumKredit: pajak,
    kreditBupot,
    pajakTerutang: Math.max(0, pajak - kreditBupot),
    kelebihanKredit: Math.max(0, kreditBupot - pajak),
    lapisanTerpakai
  };
}

/**
 * Menjumlahkan PPh yang sudah dipotong pihak lain untuk dikreditkan.
 * Rujukan: UU PPh Pasal 28 ayat (1).
 */
export function totalKreditBupot(daftar: Array<{ pphDipotong: number }>): number {
  return daftar.reduce((jumlah, item) => jumlah + Math.max(0, item.pphDipotong), 0);
}

/**
 * UU PPh Pasal 8 ayat (3): bagi pajak gabungan menurut neto SEBELUM kredit.
 * Bagian suami dibulatkan sekali; bagian istri adalah selisihnya. Pemilihan
 * pemilik SPT tidak mengubah jumlah pajak keluarga, termasuk pada pecahan rupiah.
 */
export function bagiPajakKeluarga<T extends RincianNppn | RincianTarifUmum>(
  rincian: T, peran: 'SUAMI' | 'ISTRI'
): T {
  const netoWajibPajak = rincian.penghasilanNetoUsaha + rincian.penghasilanNetoPegawai;
  const netoGabungan = rincian.penghasilanNeto;
  const pajakGabungan = rincian.pajakSebelumKredit;
  const netoSuami = peran === 'SUAMI' ? netoWajibPajak : rincian.penghasilanNetoPasangan;
  const bagianSuami = netoGabungan > 0 ? Math.round(pajakGabungan * (netoSuami / netoGabungan)) : 0;
  const bagianIstri = pajakGabungan - bagianSuami;
  const bagianWajibPajak = peran === 'SUAMI' ? bagianSuami : bagianIstri;
  return {
    ...rincian,
    pajakSebelumKredit: bagianWajibPajak,
    pajakTerutang: Math.max(0, bagianWajibPajak - rincian.kreditBupot),
    kelebihanKredit: Math.max(0, rincian.kreditBupot - bagianWajibPajak),
    pembagianProporsional: {
      netoGabungan, netoWajibPajak, pajakGabungan,
      porsi: netoGabungan > 0 ? netoWajibPajak / netoGabungan : 0,
      bagianWajibPajak, bagianPasangan: pajakGabungan - bagianWajibPajak
    }
  };
}
