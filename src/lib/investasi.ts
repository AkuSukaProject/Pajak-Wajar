import { basisAturan } from '@/lib/regulasi';
import type { HasilInvestasi, PenghasilanInvestasi } from '@/types/investasi';

/**
 * Klasifikasi terpisah dari omzet, neto Pasal 17, dan kredit bukti potong.
 * PP 131/2000 jo. PP 123/2015; PP 19/2009; PP 55/2022 Pasal 9–11;
 * PMK 81/2024 Pasal 244–249 dan 370–374. Hanya OP dalam negeri.
 */
export function periksaInvestasi(input: PenghasilanInvestasi): HasilInvestasi {
  const aturan = basisAturan.parameterPajak.investasi;
  const parameter = input.jenis === 'DEPOSITO' ? aturan.tarifDeposito
    : input.jenis === 'SAHAM_BURSA' ? aturan.tarifPenjualanSaham : aturan.tarifDividenDalamNegeri;
  const dasarHukum = parameter.dasarHukum;
  const tunda = (penjelasan: string): HasilInvestasi => ({ input, dasarHukum, penjelasan, status: 'PERLU_DIPASTIKAN' });
  if (parameter.statusVerifikasi !== 'TERVERIFIKASI' || dasarHukum.some(d => d.statusVerifikasi !== 'TERVERIFIKASI')) {
    return tunda('Parameter hukum sedang diperiksa. Nominal tidak ditampilkan sampai sumber terverifikasi.');
  }
  if (input.bruto === undefined) return tunda('Isi jumlah bruto penghasilan atau transaksi. Pokok investasi dan nilai saham yang masih dimiliki bukan penghasilan ini.');
  let dasarPengenaan = input.bruto;
  let bukanObjek = 0;
  let klasifikasi: Extract<HasilInvestasi, { status: 'TERHITUNG' }>['klasifikasi'] = 'FINAL';
  let penjelasan: string;
  if (input.jenis === 'DEPOSITO') {
    if (input.simpananBiasa !== true) return tunda('Pastikan ini simpanan bank biasa milik OP dalam negeri. Fasilitas DHE, simpanan luar negeri langsung, dan simpanan khusus memerlukan ketentuan tersendiri.');
    if (input.totalSimpanan === undefined || input.tidakDipecah === 'tidak_yakin') return tunda('Isi jumlah seluruh simpanan saat bunga diterima dan pastikan apakah simpanan dipecah-pecah. Batas diuji dari pokok simpanan, bukan bunganya.');
    if (aturan.batasSimpananTanpaPotongan.statusVerifikasi !== 'TERVERIFIKASI') return tunda('Batas pengecualian pemotongan masih diperiksa.');
    if (input.totalSimpanan <= aturan.batasSimpananTanpaPotongan.nilai && input.tidakDipecah === true) {
      dasarPengenaan = 0;
      klasifikasi = 'TANPA_PEMOTONGAN';
    }
    penjelasan = klasifikasi === 'TANPA_PEMOTONGAN'
      ? 'Memenuhi pengecualian pemotongan berdasarkan jumlah simpanan dan jawaban tidak dipecah-pecah. Tidak digabungkan ke omzet usaha atau kredit nonfinal.'
      : 'PPh final dihitung dari bunga bruto, bukan pokok deposito. Cocokkan dengan bukti bank; potongan ini tidak menjadi kredit Pasal 17.';
  } else if (input.jenis === 'SAHAM_BURSA') {
    if (input.sahamBursaIndonesiaNonPendiri !== true) return tunda('Pastikan transaksi dilakukan di bursa Indonesia dan bukan saham pendiri. Saham pendiri, penjualan di luar bursa, dan saham luar negeri memerlukan pemeriksaan tersendiri.');
    penjelasan = 'PPh final dikenakan atas nilai bruto PENJUALAN, termasuk saat rugi, bukan laba atau nilai saham yang masih dimiliki. Cocokkan potongannya dengan laporan broker.';
  } else {
    if (input.dividenResmiDalamNegeri !== true) return tunda('Pastikan dividen berasal dari badan dalam negeri berdasarkan RUPS atau dividen interim. Dividen luar negeri memerlukan aturan berbeda.');
    if (input.reinvestasi === 'BELUM_PASTI') return tunda('Pastikan jumlah reinvestasi, bentuk investasi, batas waktu, masa penahanan, dan kewajiban laporan realisasinya. Niat berinvestasi saja belum cukup untuk memberi pengecualian.');
    if (input.reinvestasi === 'MEMENUHI') {
      if (aturan.tahunInvestasiDividen.statusVerifikasi !== 'TERVERIFIKASI') return tunda('Jangka waktu investasi masih diperiksa.');
      if (input.jumlahReinvestasi === undefined) return tunda('Isi bagian dividen yang memenuhi seluruh persyaratan reinvestasi.');
      if (input.jumlahReinvestasi > input.bruto) return tunda('Reinvestasi dari dividen ini tidak boleh melebihi dividen yang diterima.');
      bukanObjek = input.jumlahReinvestasi;
      dasarPengenaan -= bukanObjek;
      klasifikasi = dasarPengenaan === 0 ? 'BUKAN_OBJEK' : bukanObjek > 0 ? 'SEBAGIAN_FINAL' : 'FINAL';
    }
    penjelasan = 'Bagian dividen yang memenuhi investasi dan pelaporan dikecualikan; sisanya dikenai PPh final yang disetor sendiri. Pengecualian tetap bersyarat selama masa investasi dan pelaporan, bukan otomatis karena memiliki saham.';
  }
  const pajakTerutang = Math.round(dasarPengenaan * parameter.nilai);
  return {
    input, dasarHukum, penjelasan, status: 'TERHITUNG', klasifikasi,
    dasarPengenaan, bukanObjek, tarif: parameter.nilai, pajakTerutang,
    ...(input.pajakDibayar !== undefined && input.nomorBukti?.trim()
      ? { pencocokan: { dibayar: input.pajakDibayar, selisih: pajakTerutang - input.pajakDibayar } } : {})
  };
}
