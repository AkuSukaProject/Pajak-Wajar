import type { HasilKelayakan, ProfilWajibPajak } from '@/types/pajak';

/**
 * Menentukan kelayakan skema secara deterministik.
 * TODO: Sheva — implementasikan setelah REGULASI.md diverifikasi ke sumber primer.
 */
export function periksaKelayakan(_profil: ProfilWajibPajak): HasilKelayakan {
  throw new Error('Rule engine belum diimplementasikan. Gunakan data mock untuk pengembangan UI.');
}
