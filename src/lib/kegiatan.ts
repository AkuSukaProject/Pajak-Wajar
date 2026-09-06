import { cariKlu, persenNorma } from '@/lib/regulasi';
import type { BarisKegiatanNorma, ProfilWajibPajak } from '@/types/pajak';

/**
 * Kegiatan usaha Wajib Pajak sebagai satu daftar.
 *
 * PER-17/PJ/2015 Pasal 5 menghitung penghasilan neto per kegiatan memakai
 * persentase Norma masing-masing, lalu menjumlahkannya. Berkas ini menyediakan
 * bentuk daftar itu; keputusan boleh atau tidaknya tetap di `eligibility.ts`
 * dan aritmetikanya tetap di `calculator.ts`.
 */

export type KegiatanTerpakai = { kluKode: string; omzet: number };

/** Kegiatan tambahan yang benar-benar terisi; baris kosong diabaikan. */
function tambahanTerisi(profil: ProfilWajibPajak): KegiatanTerpakai[] {
  return (profil.kegiatanTambahan ?? [])
    .filter((kegiatan) => kegiatan.kluKode.length > 0 && kegiatan.omzet > 0)
    .map((kegiatan) => ({ kluKode: kegiatan.kluKode, omzet: Math.max(0, kegiatan.omzet) }));
}

/** Kegiatan utama diikuti kegiatan tambahan yang sudah terisi. */
export function daftarKegiatan(profil: ProfilWajibPajak): KegiatanTerpakai[] {
  return [
    { kluKode: profil.kluKode, omzet: Math.max(0, profil.omzetPribadiTahunPajak) },
    ...tambahanTerisi(profil)
  ];
}

/**
 * Peredaran bruto tahun berjalan dari seluruh kegiatan.
 *
 * Dipakai uji ambang Norma dan dasar tarif umum. Memakai omzet kegiatan utama
 * saja akan membuat ambang dapat dihindari dengan memecah kegiatan.
 */
export function omzetSeluruhKegiatan(profil: ProfilWajibPajak): number {
  return daftarKegiatan(profil).reduce((jumlah, kegiatan) => jumlah + kegiatan.omzet, 0);
}

/**
 * Benar bila pengguna menyatakan punya lebih dari satu kegiatan **dan** sudah
 * merincinya. Selama belum dirinci, Norma tetap ditahan karena satu persentase
 * tidak boleh dikalikan ke omzet gabungan.
 */
export function kegiatanSudahDirinci(profil: ProfilWajibPajak): boolean {
  return profil.punyaLebihDariSatuKegiatan === true && tambahanTerisi(profil).length > 0;
}

/**
 * Baris Norma per kegiatan.
 *
 * Mengembalikan `null` bila ada kegiatan yang kodenya tidak dikenal atau belum
 * punya persentase Norma; dalam keadaan itu perkiraan tidak boleh ditebak.
 */
export function barisNormaPerKegiatan(
  profil: ProfilWajibPajak
): BarisKegiatanNorma[] | null {
  const baris: BarisKegiatanNorma[] = [];

  for (const kegiatan of daftarKegiatan(profil)) {
    const klu = cariKlu(kegiatan.kluKode);
    if (!klu) return null;

    const persen = persenNorma(klu, profil.wilayah);
    if (typeof persen !== 'number' || Number.isNaN(persen)) return null;

    baris.push({
      kluKode: klu.kluKode,
      nama: klu.nama,
      omzet: kegiatan.omzet,
      persenNorma: persen,
      netoKegiatan: kegiatan.omzet * (persen / 100)
    });
  }

  return baris;
}
