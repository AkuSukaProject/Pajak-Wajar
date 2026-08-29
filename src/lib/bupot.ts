import { BuktiPotong, HasilRekonsiliasiBupot, StatusRekonsiliasi } from '../types/pajak';

/**
 * Format string NPWP menjadi format standar (XX.XXX.XXX.X-XXX.XXX atau format 16 digit).
 */
export function formatNpwp(npwp: string): string {
  const clean = npwp.replace(/\D/g, '');
  if (clean.length === 15) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{1})(\d{3})(\d{3})/, '$1.$2.$3.$4-$5.$6');
  }
  if (clean.length === 16) {
    return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }
  return npwp;
}

/**
 * Format angka ke mata uang Rupiah (IDR).
 */
export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nominal);
}

/**
 * Menghitung rekonsiliasi bukti potong terhadap pajak terutang dasar.
 * Memastikan kasus lebih bayar tidak menghasilkan angka negatif yang membingungkan.
 */
export function hitungRekonsiliasiBupot({
  pajakTerutangDasar,
  daftarBupot,
}: {
  pajakTerutangDasar: number;
  daftarBupot: BuktiPotong[];
}): HasilRekonsiliasiBupot {
  const totalDpp = daftarBupot.reduce((acc, b) => acc + (b.dpp || 0), 0);
  const totalKreditBupot = daftarBupot.reduce((acc, b) => acc + (b.pphDipotong || 0), 0);

  const selisih = pajakTerutangDasar - totalKreditBupot;

  let status: StatusRekonsiliasi;
  let konsekuensiHukum = '';

  if (selisih > 0) {
    status = 'KURANG_BAYAR';
    konsekuensiHukum =
      'PPh Pasal 29 Kurang Bayar: Wajib dilunasi sebelum SPT Tahunan disampaikan (maksimal 31 Maret tahun berikutnya untuk WP OP).';
  } else if (selisih < 0) {
    status = 'LEBIH_BAYAR';
    konsekuensiHukum =
      'PPh Pasal 28A Lebih Bayar: Anda berhak mengajukan Pengembalian Pendahuluan Kelebihan Pajak (Restitusi) atau Pemindahbukuan sesuai UU KUP & PMK 209/2021.';
  } else {
    status = 'NIHIL';
    konsekuensiHukum =
      'SPT Nihil: Total kredit bukti potong sama persis dengan pajak terutang tahunan. Tidak ada setoran tambahan yang diperlukan.';
  }

  return {
    pajakTerutangDasar,
    totalDpp,
    totalKreditBupot,
    sisaPajak: Math.abs(selisih),
    status,
    konsekuensiHukum,
    daftarBupot,
  };
}
