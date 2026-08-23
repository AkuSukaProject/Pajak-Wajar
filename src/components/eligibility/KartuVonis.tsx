import type { HasilKelayakan, IdSkema, StatusKelayakan } from '@/types/pajak';

const namaSkema: Record<IdSkema, string> = {
  PPH_FINAL_05: 'PPh Final UMKM 0,5%',
  NPPN: 'Norma Penghitungan Penghasilan Neto',
  TARIF_UMUM: 'Tarif Umum'
};

const tampilan: Record<StatusKelayakan, { label: string; simbol: string; kelas: string }> = {
  BOLEH: { label: 'BOLEH DIGUNAKAN', simbol: '✓', kelas: 'border-verified text-verified' },
  TIDAK_BOLEH: { label: 'TIDAK BOLEH', simbol: '×', kelas: 'border-stamp text-stamp' },
  PERLU_DIPASTIKAN: { label: 'PERLU DIPASTIKAN', simbol: '?', kelas: 'border-pending text-pending' }
};

export function KartuVonis({ hasil }: { hasil: HasilKelayakan }) {
  return (
    <section className="space-y-4" aria-labelledby="judul-hasil">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue">Hasil simulasi</p>
        <h2 id="judul-hasil" className="mt-2 font-display text-3xl font-bold">Posisi skema Anda</h2>
      </div>
      {hasil.skema.map((item) => {
        const ui = tampilan[item.status];
        return (
          <article key={item.id} className={`border-l-8 bg-white p-5 shadow-sm ${ui.kelas}`}>
            <div className="flex items-center gap-3 font-bold">
              <span className="grid h-7 w-7 place-items-center border-2" aria-hidden="true">{ui.simbol}</span>
              <span className="text-xs tracking-widest">{ui.label}</span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold text-ink">{namaSkema[item.id]}</h3>
            <p className="mt-2 leading-7 text-ink">{item.alasan}</p>
            <details className="mt-5 border-t border-line pt-4 text-sm text-margin">
              <summary className="cursor-pointer font-bold text-ink">Lihat dasar hukum</summary>
              <p className="mt-3 font-mono">{item.dasarHukum}</p>
            </details>
          </article>
        );
      })}
      {hasil.peringatan.map((peringatan) => <p key={peringatan} className="border border-pending/30 bg-amber-50 p-4 text-sm">⚑ {peringatan}</p>)}
    </section>
  );
}
