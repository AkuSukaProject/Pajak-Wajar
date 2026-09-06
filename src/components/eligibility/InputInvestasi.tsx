'use client';

import { InputRupiah } from '@/components/ui/InputRupiah';
import { basisAturan } from '@/lib/regulasi';
import { namaJenisInvestasi as namaJenis } from '@/lib/label-investasi';
import type { PenghasilanInvestasi } from '@/types/investasi';
import type { JawabanKepatuhan } from '@/types/pajak';

const kolom = 'mt-1 block w-full min-w-0 border border-line bg-white p-3 text-sm outline-none focus:border-blue';

function Pertanyaan({ label, nilai, onChange }: { label: string; nilai: JawabanKepatuhan; onChange: (v: JawabanKepatuhan) => void }) {
  return <label className="block text-sm font-semibold">{label}<select className={kolom} value={String(nilai)} onChange={e => onChange(e.target.value === 'true' ? true : e.target.value === 'false' ? false : 'tidak_yakin')}><option value="tidak_yakin">Tidak yakin</option><option value="true">Ya</option><option value="false">Tidak</option></select></label>;
}

export function InputInvestasi({ daftar, onChange }: { daftar: PenghasilanInvestasi[]; onChange: (v: PenghasilanInvestasi[]) => void }) {
  const ubah = (item: PenghasilanInvestasi) => onChange(daftar.map(lama => lama.id === item.id ? item : lama));
  const tambah = (jenis: PenghasilanInvestasi['jenis']) => {
    const dasar = { id: crypto.randomUUID(), nama: `${namaJenis[jenis]} ${daftar.length + 1}`, pemilik: 'ANDA' as const };
    const item: PenghasilanInvestasi = jenis === 'DEPOSITO' ? { ...dasar, jenis, simpananBiasa: 'tidak_yakin', tidakDipecah: 'tidak_yakin' }
      : jenis === 'SAHAM_BURSA' ? { ...dasar, jenis, sahamBursaIndonesiaNonPendiri: 'tidak_yakin' }
        : { ...dasar, jenis, dividenResmiDalamNegeri: 'tidak_yakin', reinvestasi: 'BELUM_PASTI' };
    onChange([...daftar, item]);
  };
  return <section aria-labelledby="judul-investasi" className="mt-8 border-t border-line pt-6">
    <h3 id="judul-investasi" className="font-display text-xl font-semibold">Penghasilan dari investasi</h3>
    <p className="mt-2 text-xs leading-5 text-margin">Opsional. Catat bunga, penjualan saham, dan dividen secara terpisah dari omzet, neto pasangan, serta kredit pajak usaha. Nilai saham yang masih dimiliki dan pokok deposito dicatat sebagai harta dalam SPT, bukan sebagai penghasilan di sini.</p>
    <div className="mt-4 space-y-5">{daftar.map((item, index) => <fieldset key={item.id} className="min-w-0 space-y-4 border border-line bg-paper/50 p-4">
      <legend className="px-1 text-sm font-bold">Investasi {index + 1}: {namaJenis[item.jenis]}</legend>
      <label className="block text-sm font-semibold">Nama bank, broker, atau pemberi dividen<input maxLength={120} className={kolom} value={item.nama} onChange={e => ubah({ ...item, nama: e.target.value })} /></label>
      <label className="block text-sm font-semibold">Pemilik penghasilan<select className={kolom} value={item.pemilik} onChange={e => ubah({ ...item, pemilik: e.target.value as 'ANDA' | 'PASANGAN' })}><option value="ANDA">Anda</option><option value="PASANGAN">Pasangan</option></select></label>
      <InputRupiah label={item.jenis === 'DEPOSITO' ? 'Bunga bruto yang diterima' : item.jenis === 'SAHAM_BURSA' ? 'Nilai bruto penjualan saham' : 'Dividen bruto yang diterima'} nilai={item.bruto} onChange={v => ubah({ ...item, bruto: v })} bolehKosong bantuan={item.jenis === 'SAHAM_BURSA' ? 'Nilai penjualan sebelum biaya, bukan keuntungan atau nilai portofolio.' : 'Penghasilan sebelum dipotong pajak. Kosong bila belum diketahui.'} />
      {item.jenis === 'DEPOSITO' && <>
        <Pertanyaan label="Simpanan bank biasa milik OP dalam negeri, bukan DHE atau fasilitas khusus?" nilai={item.simpananBiasa} onChange={v => ubah({ ...item, simpananBiasa: v })} />
        <InputRupiah label="Jumlah seluruh deposito, tabungan, dan SBI saat bunga diterima" nilai={item.totalSimpanan} onChange={v => ubah({ ...item, totalSimpanan: v })} bolehKosong bantuan="Jumlah pokok seluruh simpanan yang relevan, bukan bunganya atau saldo satu rekening saja. Pisahkan periode bila kondisinya berubah." />
        <Pertanyaan label="Jumlah simpanan tersebut bukan hasil pemecahan simpanan?" nilai={item.tidakDipecah} onChange={v => ubah({ ...item, tidakDipecah: v })} />
      </>}
      {item.jenis === 'SAHAM_BURSA' && <Pertanyaan label="Dijual di bursa Indonesia dan bukan saham pendiri?" nilai={item.sahamBursaIndonesiaNonPendiri} onChange={v => ubah({ ...item, sahamBursaIndonesiaNonPendiri: v })} />}
      {item.jenis === 'DIVIDEN_DN' && <>
        <Pertanyaan label="Dividen dari badan dalam negeri berdasarkan RUPS atau dividen interim?" nilai={item.dividenResmiDalamNegeri} onChange={v => ubah({ ...item, dividenResmiDalamNegeri: v })} />
        <label className="block text-sm font-semibold">Apakah ada bagian dividen yang memenuhi syarat reinvestasi?<select className={kolom} value={item.reinvestasi} onChange={e => ubah({ ...item, reinvestasi: e.target.value as 'TIDAK' | 'MEMENUHI' | 'BELUM_PASTI', jumlahReinvestasi: undefined })}><option value="BELUM_PASTI">Belum pasti / masih merencanakan</option><option value="TIDAK">Tidak ada bagian yang memenuhi</option><option value="MEMENUHI">Ada bagian yang memenuhi seluruh syarat</option></select></label>
        <p className="text-xs leading-5 text-margin">Syarat mencakup bentuk investasi yang diperbolehkan di Indonesia, penempatan paling lambat akhir bulan ketiga setelah tahun penerimaan, penahanan minimal {basisAturan.parameterPajak.investasi.tahunInvestasiDividen.nilai} tahun pajak sejak tahun penerimaan, dan laporan realisasi tepat waktu sampai tahun ketiga. Kewajiban tahun berikutnya tetap harus dipenuhi.</p>
        {item.reinvestasi === 'MEMENUHI' && <InputRupiah label="Bagian dividen yang memenuhi seluruh syarat reinvestasi" nilai={item.jumlahReinvestasi} onChange={v => ubah({ ...item, jumlahReinvestasi: v })} bolehKosong bantuan="Boleh sebagian. Sisanya dikenai pajak final; jumlah ini tidak boleh melebihi dividen bruto." />}
      </>}
      <details className="detail-panel"><summary className="cursor-pointer text-sm font-semibold">Cocokkan dengan bukti pajak final (opsional)</summary><div className="mt-3 space-y-3">
        <InputRupiah label="Pajak final yang sudah dipotong atau disetor" nilai={item.pajakDibayar} onChange={v => ubah({ ...item, pajakDibayar: v })} bolehKosong bantuan="Hanya pajak untuk catatan ini. Kosong berarti belum diketahui; 0 berarti belum ada pembayaran." />
        <label className="block text-sm font-semibold">Nomor bukti atau referensi transaksi<input maxLength={100} className={kolom} value={item.nomorBukti ?? ''} onChange={e => ubah({ ...item, nomorBukti: e.target.value })} /></label>
      </div></details>
      <button type="button" className="pressable min-h-11 text-sm font-semibold text-stamp underline" onClick={() => onChange(daftar.filter(v => v.id !== item.id))}>Hapus investasi {index + 1}</button>
    </fieldset>)}</div>
    <div className="mt-4 flex flex-wrap gap-2">{(Object.keys(namaJenis) as PenghasilanInvestasi['jenis'][]).map(jenis => <button key={jenis} type="button" disabled={daftar.length >= 30} className="pressable min-h-12 border border-line bg-white px-3 py-2 text-left text-xs font-semibold hover:border-blue disabled:opacity-50" onClick={() => tambah(jenis)}>+ {namaJenis[jenis]}</button>)}</div>
  </section>;
}
