/** Pembantu tampilan. Tidak memuat aturan perpajakan apa pun. */

const formatterRupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/**
 * Contoh: 1_500_000 → "Rp1.500.000".
 *
 * Awalan ditulis manual, bukan lewat `style: 'currency'`, supaya tidak ada
 * spasi tak terputus di antara "Rp" dan angkanya. Bentuk ini sama dengan yang
 * dipakai mesin aturan saat menyusun kalimat alasan.
 */
export function formatCurrency(nilai: number): string {
  return `Rp${formatterRupiah.format(Math.round(nilai))}`;
}

/** Contoh: 0.005 → "0,5%"; 47.5 (persen norma) → gunakan `formatPersenNorma`. */
export function formatTarif(tarif: number): string {
  return `${(tarif * 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`;
}

/** Persentase norma sudah dalam satuan persen pada basis aturan. */
export function formatPersenNorma(persen: number): string {
  return `${persen.toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`;
}

/** Mengubah masukan bebas menjadi angka rupiah; string kosong menjadi `undefined`. */
export function bacaNominal(teks: string): number | undefined {
  const bersih = hanyaAngka(teks);
  if (bersih.length === 0) return undefined;
  return Number(bersih);
}

/** Menyisakan digit saja dari masukan bebas. */
export function hanyaAngka(teks: string): string {
  return teks.replace(/[^0-9]/g, '');
}

/**
 * Menyisipkan titik pemisah ribuan pada rangkaian digit, tanpa mengubahnya
 * menjadi angka lebih dulu supaya nilai sepanjang apa pun tetap utuh.
 * Contoh: "50000000" menjadi "50.000.000".
 */
export function formatRibuan(digit: string): string {
  const bersih = hanyaAngka(digit).replace(/^0+(?=[0-9])/, '');
  return bersih.replace(/\B(?=([0-9]{3})+(?![0-9]))/g, '.');
}

/**
 * Letak karet setelah sejumlah digit tertentu pada teks yang sudah berpemisah.
 * Dipakai agar kursor tidak melompat ke ujung saat teks diformat ulang.
 */
export function posisiSetelahDigit(teks: string, jumlahDigit: number): number {
  if (jumlahDigit <= 0) return 0;
  let terhitung = 0;
  for (let i = 0; i < teks.length; i += 1) {
    if (teks[i] >= '0' && teks[i] <= '9') {
      terhitung += 1;
      if (terhitung === jumlahDigit) return i + 1;
    }
  }
  return teks.length;
}

export function formatTanggalIndonesia(iso: string): string {
  const tanggal = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(tanggal.getTime())) return iso;
  return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
