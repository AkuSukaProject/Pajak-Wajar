import type { HasilInvestasi as Hasil } from '@/types/investasi';
import { formatCurrency, formatTarif } from '@/lib/format';
import { labelKlasifikasiInvestasi as labelInvestasi } from '@/lib/label-investasi';

export function HasilInvestasi({ daftar }: { daftar: Hasil[] }) {
  if (!daftar.length) return null;
  return <section className="mt-6 border border-line bg-white p-4 sm:p-6" aria-labelledby="judul-hasil-investasi">
    <h3 id="judul-hasil-investasi" className="font-display text-2xl font-semibold">Catatan pajak investasi</h3>
    <p className="mt-2 text-xs leading-5 text-margin">Dihitung terpisah dari tiga skema usaha. Potongan final tidak mengurangi pajak progresif. Pencocokan berdasarkan catatan Anda, bukan verifikasi pembayaran oleh DJP.</p>
    <div className="mt-4 space-y-4">{daftar.map(item => <article key={item.input.id} className="border-l-2 border-blue bg-paper p-4 text-sm">
      <h4 className="break-words font-semibold">{item.input.nama} · {item.input.pemilik === 'ANDA' ? 'Anda' : 'Pasangan'}</h4>
      <p className="mt-2 font-semibold text-blue">{item.status === 'PERLU_DIPASTIKAN' ? 'Perlu dipastikan — nominal ditahan' : labelInvestasi[item.klasifikasi]}</p>
      {item.status === 'TERHITUNG' && <dl className="mt-3 space-y-2 text-xs">
        <div><dt>Dasar pengenaan × tarif {formatTarif(item.tarif)}</dt><dd className="font-mono">{formatCurrency(item.dasarPengenaan)}</dd></div>
        {item.bukanObjek > 0 && <div><dt>Bagian dividen bukan objek</dt><dd className="font-mono">{formatCurrency(item.bukanObjek)}</dd></div>}
        <div><dt>Perkiraan pajak final / pemotongan</dt><dd className="font-mono text-xl font-semibold">{formatCurrency(item.pajakTerutang)}</dd></div>
        {item.pencocokan ? <><div><dt>Potongan / setoran pada bukti {item.input.nomorBukti}</dt><dd>{formatCurrency(item.pencocokan.dibayar)}</dd></div><div><dt>Hasil pencocokan</dt><dd>{item.pencocokan.selisih === 0 ? 'Nominal sesuai catatan bukti Anda.' : item.pencocokan.selisih > 0 ? `Selisih belum tercakup bukti: ${formatCurrency(item.pencocokan.selisih)}. Periksa pembayaran atau potongannya.` : `Bukti lebih besar ${formatCurrency(-item.pencocokan.selisih)}. Periksa kembali, bukan janji pengembalian.`}</dd></div></> : <p className="text-margin">Status pembayaran belum dipastikan. Isi nominal dan referensi bukti untuk mencocokkan.</p>}
      </dl>}
      <p className="mt-3 text-xs leading-5 text-margin">{item.penjelasan}</p>
      <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold">Dasar hukum investasi</summary><ul className="mt-2 space-y-2 text-xs">{item.dasarHukum.map(d => <li key={d.namaRegulasi + d.pasalAtauLampiran}><a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue underline">{d.namaRegulasi} · {d.pasalAtauLampiran}</a><p>{d.fungsi}</p></li>)}</ul></details>
    </article>)}</div>
  </section>;
}
