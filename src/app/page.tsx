import { AlurKelayakan } from '@/components/eligibility/AlurKelayakan';

export default function Home() {
  return (
    <main>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="#utama" className="font-display text-xl font-bold tracking-tight">PajakWajar</a>
          <span className="rounded-full border border-line px-3 py-1 text-xs font-bold uppercase tracking-wider text-margin">Pra-lapor · data lokal</span>
        </div>
      </header>

      <section id="utama" className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-blue">Mulai dari kelayakan</p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Tahu posisi hukummu sebelum menghitung pajak.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-margin">Jawab beberapa pertanyaan untuk melihat skema yang boleh dipakai, alasannya, dan langkah berikutnya.</p>
          <ol className="mt-8 space-y-3 text-sm text-margin" aria-label="Urutan proses">
            <li><strong className="text-ink">01 Kelayakan</strong> — periksa skema yang sah</li>
            <li><strong className="text-ink">02 Perhitungan</strong> — hitung skema yang tersedia</li>
            <li><strong className="text-ink">03 Konsekuensi</strong> — pahami dampak pilihan</li>
            <li><strong className="text-ink">04 Berkas</strong> — siapkan kertas kerja</li>
          </ol>
        </div>
        <AlurKelayakan />
      </section>

      <footer className="border-t border-line bg-white px-5 py-8 text-center text-sm text-margin">
        PajakWajar adalah alat bantu simulasi pra-lapor, bukan nasihat pajak. Verifikasi hasil melalui DJP.
      </footer>
    </main>
  );
}
