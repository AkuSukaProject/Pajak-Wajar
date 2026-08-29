import type { Metadata } from 'next';
import Link from 'next/link';
import { AlurKelayakan } from '@/components/eligibility/AlurKelayakan';

export const metadata: Metadata = {
  title: 'Cek cara hitung pajak — PajakWajar',
  description: 'Jawab pertanyaan sederhana untuk melihat cara menghitung pajak yang mungkin boleh Anda pakai.'
};

const tahapan = [
  ['01', 'Cek aturan', 'Lihat cara yang boleh dipakai'],
  ['02', 'Hitung', 'Lihat perkiraan pajak'],
  ['03', 'Pahami', 'Ketahui akibat pilihan'],
  ['04', 'Simpan', 'Buat ringkasan hasil']
] as const;

export default function CekKelayakanPage() {
  return <main id="utama">
    <header className="border-b border-line/80 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="PajakWajar, kembali ke beranda">
          <span className="grid h-9 w-9 place-items-center bg-blue font-display text-xl font-semibold text-white" aria-hidden="true">P</span>
          <span className="font-display text-xl font-semibold tracking-tight">PajakWajar</span>
        </Link>
        <span className="flex items-center gap-2 text-xs font-semibold text-margin"><span className="h-2 w-2 rounded-full bg-blue" aria-hidden="true" />Diproses di perangkat Anda</span>
      </div>
    </header>

    <section className="motion-page mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:pb-24">
      <div className="mb-10 lg:sticky lg:top-10 lg:mb-0 lg:self-start">
        <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue"><span className="h-px w-8 bg-blue" aria-hidden="true" /> Cek sebelum lapor pajak</p>
        <h1 className="max-w-xl font-display text-[2.75rem] font-medium leading-[1.04] tracking-[-0.035em] sm:text-6xl">Cari tahu cara hitung pajak yang boleh kamu pakai.</h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-margin sm:text-lg sm:leading-8">Cukup jawab pertanyaan tentang pekerjaan dan penghasilan. Istilah pajak akan kami jelaskan saat muncul.</p>
        <ol className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-6 text-sm lg:grid-cols-1" aria-label="Urutan proses PajakWajar">
          {tahapan.map(([nomor, judul, keterangan], index) => <li key={nomor} className={`flex gap-4 ${index > 0 ? 'opacity-45' : ''}`}><span className="font-mono text-xs text-margin">{nomor}</span><span><strong className="block font-semibold">{judul}</strong><span className="mt-0.5 hidden text-xs text-margin sm:block">{keterangan}</span></span></li>)}
        </ol>
        <div className="mt-10 border-l-2 border-blue pl-4 text-xs leading-5 text-margin">Jawaban diproses langsung di HP atau laptop Anda dan tidak disimpan di server.</div>
      </div>
      <AlurKelayakan />
    </section>

    <footer className="border-t border-line bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs leading-5 text-margin sm:px-8 md:flex-row md:items-center md:justify-between"><p>© 2026 PajakWajar · Dibuat untuk ITechno Cup 2026</p><p className="max-w-xl md:text-right">Ini alat bantu, bukan nasihat pajak. Cek kembali hasilnya melalui kanal resmi DJP atau kantor pajak.</p></div></footer>
  </main>;
}
