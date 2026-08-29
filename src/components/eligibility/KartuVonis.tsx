import type { HasilKelayakan, IdSkema, StatusKelayakan } from '@/types/pajak';

const namaSkema: Record<IdSkema, string> = {
  PPH_FINAL_05: 'PPh Final UMKM — pajak 0,5% dari omzet',
  NPPN: 'Norma NPPN — perkiraan penghasilan bersih',
  TARIF_UMUM: 'Tarif umum — berdasarkan keuntungan bersih'
};

const tampilan: Record<StatusKelayakan, { label: string; simbol: string; border: string; text: string; bg: string }> = {
  BOLEH: { label: 'BOLEH DIPAKAI', simbol: '✓', border: 'border-blue', text: 'text-blue', bg: 'bg-blue' },
  TIDAK_BOLEH: { label: 'TIDAK BOLEH DIPAKAI', simbol: '×', border: 'border-stamp', text: 'text-stamp', bg: 'bg-stamp' },
  PERLU_DIPASTIKAN: { label: 'PERLU DICEK DULU', simbol: '?', border: 'border-pending', text: 'text-pending', bg: 'bg-pending' }
};

export function KartuVonis({ hasil }: { hasil: HasilKelayakan }) {
  return <section className="bg-paper p-4 shadow-sheet sm:p-7" aria-labelledby="judul-hasil" aria-live="polite">
    <div className="mb-6 flex items-start justify-between gap-5 border-b border-line pb-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue">Hasil pengecekan</p><h2 id="judul-hasil" className="mt-1 font-display text-3xl font-semibold">Cara hitung pajak Anda</h2></div>
      <span className="border border-pending px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-pending">Contoh tampilan</span>
    </div>

    <div className="space-y-4">{hasil.skema.map((item, index) => {
      const ui = tampilan[item.status];
      return <article key={item.id} className={`motion-result relative overflow-hidden border-l-8 ${ui.border} bg-white px-5 py-6 sm:px-7`} style={{ animationDelay: `${100 + index * 110}ms` }}>
        <div className="flex items-center gap-3"><span className={`motion-status grid h-7 w-7 place-items-center border-2 ${ui.border} ${ui.text} font-mono text-sm font-bold`} style={{ animationDelay: `${260 + index * 110}ms` }} aria-hidden="true">{ui.simbol}</span><span className={`text-xs font-bold tracking-[0.14em] ${ui.text}`}>{ui.label}</span></div>
        <h3 className="mt-5 font-display text-2xl font-semibold text-ink sm:text-3xl">{namaSkema[item.id]}</h3>
        <p className="mt-2 leading-7 text-margin">{item.alasan}</p>
        <details className="detail-panel group mt-5 border-t border-line pt-4 text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink"><span>Lihat aturan resminya</span><span className="font-mono text-lg text-margin transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
          <div className="mt-4 border-l border-line pl-4"><p className="font-mono text-xs leading-6 text-margin">{item.dasarHukum}</p></div>
        </details>
      </article>;
    })}</div>

    {hasil.peringatan.length > 0 && <div className="mt-5 space-y-2">{hasil.peringatan.map((peringatan) => <p key={peringatan} className="flex gap-3 border border-pending/30 bg-amber-50 p-4 text-sm leading-6"><span className="font-bold text-pending" aria-hidden="true">!</span><span>{peringatan}</span></p>)}</div>}

    {hasil.langkahTindakLanjut.length > 0 && <div className="mt-6 bg-ink p-5 text-white"><p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">Langkah berikutnya</p><ul className="mt-3 space-y-2 text-sm leading-6">{hasil.langkahTindakLanjut.map((langkah) => <li key={langkah} className="flex gap-3"><span className="text-white/50" aria-hidden="true">→</span>{langkah}</li>)}</ul></div>}

    <p className="mt-5 text-xs leading-5 text-margin">Ini masih contoh tampilan dan belum tersambung ke mesin pemeriksa aturan. Jangan gunakan hasil ini untuk melapor pajak.</p>
  </section>;
}
