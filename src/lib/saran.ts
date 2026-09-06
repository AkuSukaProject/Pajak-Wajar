import { formatCurrency } from '@/lib/format';
import type { HasilAuditPajak, HasilSkema } from '@/types/pajak';

const nama = {
  PPH_FINAL_05: 'PPh Final UMKM 0,5%',
  NPPN: 'Norma NPPN',
  TARIF_UMUM: 'tarif umum berdasarkan pembukuan'
};

/** Menyusun tindak lanjut dari hasil terverifikasi, tanpa menetapkan hak pajak baru. */
export function susunSaran(hasil: HasilAuditPajak): string[] {
  const saran: string[] = [];
  const pisah = ['PISAH_HARTA', 'PISAH_KEWAJIBAN'].includes(hasil.profil.statusPerpajakanPasangan);
  const terhitung = hasil.skema.filter(s => s.statusKalkulasi === 'TERSEDIA');
  const nppn = hasil.skema.find(s => s.id === 'NPPN');
  const umum = hasil.skema.find(s => s.id === 'TARIF_UMUM');

  if (hasil.rekomendasiHemat) {
    const termahal = terhitung.reduce((tertinggi, kandidat) =>
      kandidat.statusKalkulasi === 'TERSEDIA' && tertinggi.statusKalkulasi === 'TERSEDIA' &&
      kandidat.pajakTerutang > tertinggi.pajakTerutang ? kandidat : tertinggi
    );
    const selisihTerjauh = termahal.statusKalkulasi === 'TERSEDIA'
      ? termahal.pajakTerutang - hasil.rekomendasiHemat.pajakTerutang
      : 0;
    const pembanding = selisihTerjauh > 0
      ? ` Itu ${formatCurrency(selisihTerjauh)} lebih rendah daripada ${nama[termahal.id]}, yang perkiraannya paling tinggi di antara yang terhitung.`
      : '';
    saran.push(`Dari ${terhitung.length} skema yang boleh Anda pakai dan sudah dihitung, ${nama[hasil.rekomendasiHemat.id]} menghasilkan perkiraan pajak paling rendah (${formatCurrency(hasil.rekomendasiHemat.pajakTerutang)}).${pembanding} Angka terendah bukan satu-satunya pertimbangan: pastikan syarat pencatatan dan riwayat pilihan pajak Anda sesuai.`);
  } else if (nppn?.statusKalkulasi === 'TERSEDIA' && umum?.statusKalkulasi === 'TERSEDIA') {
    const selisih = umum.rincianKalkulasi.pajakSebelumKredit - nppn.rincianKalkulasi.pajakSebelumKredit;
    if (selisih === 0) {
      saran.push('Norma NPPN dan tarif umum menghasilkan pajak sebelum kredit yang sama. Periksa kesesuaian pemberitahuan Norma dan pembukuan Anda sebelum menentukan cara pelaporan.');
    } else {
      saran.push(`Untuk penghasilan nonfinal, pertimbangkan ${nama[selisih > 0 ? 'NPPN' : 'TARIF_UMUM']}: perkiraan pajak sebelum kredit lebih rendah ${formatCurrency(Math.abs(selisih))} dibanding ${nama[selisih > 0 ? 'TARIF_UMUM' : 'NPPN']}. Perbandingan ini hanya mencakup kedua skema tersebut; pastikan pemberitahuan Norma atau pembukuan Anda sesuai sebelum melapor.`);
    }
  } else if (terhitung.length > 0) {
    saran.push(`${terhitung.map(s => nama[s.id]).join(' dan ')} sudah dapat dihitung dari jawaban Anda. Gunakan rinciannya untuk menyiapkan pelaporan; skema yang nominalnya belum tersedia belum dapat dibandingkan.`);
  } else {
    saran.push('Lengkapi bagian yang ditandai belum pasti sebelum memilih skema. Saat ini belum ada nominal yang cukup lengkap untuk dijadikan dasar perbandingan.');
  }

  if (pisah) saran.push('Pada PH/MT, perbandingan berikut memakai bagian pajak Anda. Pajak keluarga dihitung dari neto gabungan lalu dibagi sebelum kredit masing-masing dikurangkan. Cocokkan bagian pasangan dengan SPT pasangan.');

  if (hasil.profil.jugaPegawaiTetap && hasil.profil.penghasilanNetoPegawai === undefined) {
    saran.push('Salin penghasilan neto gaji sebelum PTKP dari bukti potong pegawai, lalu perbarui jawaban agar gabungan gaji dan usaha dapat dihitung.');
  }
  // Tidak relevan bila pasangan memang tidak berpenghasilan dan pelaporannya gabung:
  // tidak ada neto pasangan yang perlu disiapkan maupun pajak yang perlu dibagi.
  const adaPasangan = !['TIDAK_ADA_PASANGAN', 'PISAH_PUTUSAN_HAKIM'].includes(hasil.profil.statusPerpajakanPasangan);
  const gabungTanpaPenghasilanPasangan =
    hasil.profil.statusPerpajakanPasangan === 'GABUNG' && hasil.profil.pasanganPunyaPenghasilan === false;
  if (adaPasangan && !gabungTanpaPenghasilanPasangan) {
    saran.push('Siapkan data penghasilan neto pasangan dan status pelaporan keluarga. Bawa ringkasan ini ke KPP untuk memeriksa penggabungan penghasilan atau pembagian pajak keluarga.');
  }
  if (hasil.totalKreditBupot > 0) {
    saran.push('Cocokkan nomor, tahun pajak, dan nominal setiap bukti potong dengan Coretax. Pastikan tidak ada bukti ganda atau potongan final yang dimasukkan sebagai kredit nonfinal.');
  }
  const final = hasil.skema.find(s => s.id === 'PPH_FINAL_05');
  if (final?.statusKalkulasi === 'TERSEDIA') {
    saran.push('Untuk PPh Final, cocokkan pajak usaha dengan setoran final yang sudah dibayar. Nominal pada kartu belum dikurangi setoran tersebut.');
  }
  if (hasil.skema.some(adaKelebihanKredit)) {
    saran.push('Periksa selisih kredit yang melebihi perkiraan pajak beserta dokumen pendukungnya sebelum mengisi SPT. Selisih tersebut belum memastikan adanya pengembalian pajak.');
  }
  if (hasil.investasi?.length) {
    saran.push('Laporkan penghasilan investasi sesuai klasifikasinya. Jangan masukkan bunga deposito, penjualan saham bursa, atau dividen final ke omzet maupun kredit nonfinal; pokok simpanan dan saham yang masih dimiliki dicatat sebagai harta.');
    if (hasil.investasi.some(item => item.status === 'PERLU_DIPASTIKAN')) saran.push('Ada catatan investasi yang belum dapat dihitung. Lengkapi syarat dan nominalnya; hasil usaha tidak berarti seluruh penghasilan investasi sudah selesai diperiksa.');
    if (hasil.investasi.some(item => item.input.jenis === 'DIVIDEN_DN' && item.input.reinvestasi === 'MEMENUHI')) saran.push('Simpan bukti reinvestasi dividen dan penuhi laporan realisasi serta masa penahanan investasi. Pengecualian dapat gugur bila syarat berikutnya tidak dipenuhi.');
  }
  return [...new Set([...saran, ...hasil.langkahTindakLanjut])];
}

function adaKelebihanKredit(skema: HasilSkema): boolean {
  return skema.statusKalkulasi === 'TERSEDIA' &&
    skema.rincianKalkulasi.skema !== 'PPH_FINAL_05' &&
    skema.rincianKalkulasi.kelebihanKredit > 0;
}
