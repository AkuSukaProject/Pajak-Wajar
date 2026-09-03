import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PajakWajar — Cek cara hitung pajak yang boleh dipakai',
  description: 'Cek cara menghitung pajak yang boleh Anda pakai sebelum mulai menghitung.'
};

const proses = [
  { nomor: '01', judul: 'Isi Profil & Omzet', isi: 'Pilih jenis profesi/pekerjaan bebas, domisili, dan omzet tahunan tanpa perlu membuat akun.' },
  { nomor: '02', judul: 'Dapatkan Vonis Skema', isi: 'Sistem memvalidasi skema mana yang sah secara hukum (Norma/NPPN, Pembukuan, atau Tarif Umum).' },
  { nomor: '03', judul: 'Rekonsiliasi Bukti Potong', isi: 'Unggah foto bukti potong (PPh 21/23) via AI OCR atau ketik manual untuk menghitung kredit pajak.' },
  { nomor: '04', judul: 'Unduh Kertas Kerja (PDF)', isi: 'Unduh lembar kerja PDF siap pakai sebagai panduan saat mengisi SPT Tahunan di portal Coretax DJP.' }
] as const;

const pembeda = [
  { nomor: 'A', judul: 'Berdasarkan Regulasi Hukum, Bukan Asumsi', isi: 'Kalkulator biasa langsung menghitung tanpa mengecek izin hukum. PajakWajar memvalidasi syarat regulasi DJP terlebih dahulu sebelum menentukan skema yang sah bagi Anda.' },
  { nomor: 'B', judul: 'Transparan Menunjukkan Skema yang Dilarang', isi: 'Kami tidak menyembunyikan aturan. Jika Anda dilarang menggunakan suatu skema (misal: pekerja bebas dilarang pakai tarif 0,5% PPh Final), kami tampilkan alasan dan pasal resminya agar Anda terhindar dari denda.' },
  { nomor: 'C', judul: 'Jawaban "Tidak Yakin" yang Aman', isi: 'Jika Anda ragu dengan status administrasi (seperti sudah memberitahukan formulir Norma atau belum), sistem tidak memaksakan asumsi palsu, melainkan memandu langkah verifikasi yang benar.' }
] as const;

function Logo() {
  return <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center bg-blue font-display text-xl font-semibold text-white" aria-hidden="true">P</span><span className="font-display text-xl font-semibold tracking-tight">PajakWajar</span></span>;
}

export default function Home() {
  return <main id="utama" className="overflow-hidden">
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-lg">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="#utama" aria-label="PajakWajar, kembali ke atas"><Logo /></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-margin md:flex" aria-label="Navigasi utama">
          <a className="transition-colors hover:text-ink" href="#mengapa">Mengapa berbeda</a>
          <a className="transition-colors hover:text-ink" href="#cara-kerja">Cara kerja</a>
          <a className="transition-colors hover:text-ink" href="#privasi">Privasi</a>
        </nav>
        <Link href="/cek-kelayakan" className="pressable bg-blue px-4 py-2.5 text-xs font-bold text-white sm:px-5 sm:text-sm">Mulai periksa <span aria-hidden="true">→</span></Link>
      </div>
    </header>

    <section className="relative border-b border-line">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-line lg:block" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="motion-page flex flex-col justify-center px-5 py-16 sm:px-8 sm:py-24 lg:min-h-[720px] lg:pr-16">
          <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-blue"><span className="h-px w-9 bg-blue" aria-hidden="true" /> Cek pajak sebelum lapor</p>
          <h1 className="max-w-2xl font-display text-[3.25rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.2rem]">
            Jangan langsung hitung <em className="font-normal text-blue">pajak.</em>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-margin">Pajak bisa dihitung dengan beberapa cara. Tidak semua orang boleh memakai semuanya. <strong className="font-semibold text-ink">Cek dulu cara yang boleh Anda pakai.</strong></p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/cek-kelayakan" className="pressable inline-flex min-h-14 items-center justify-center gap-5 bg-blue px-6 text-sm font-bold text-white shadow-lift">Cek pajak saya <span aria-hidden="true">→</span></Link>
            <a href="#mengapa" className="pressable inline-flex min-h-14 items-center justify-center border border-line bg-white px-6 text-sm font-bold text-ink">Lihat cara kerjanya</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-6 text-xs font-semibold text-margin">
            <span className="flex items-center gap-2"><span className="text-blue" aria-hidden="true">✓</span> Tanpa akun</span>
            <span className="flex items-center gap-2"><span className="text-blue" aria-hidden="true">✓</span> Data tetap lokal</span>
            <span className="flex items-center gap-2"><span className="text-blue" aria-hidden="true">✓</span> Hasil bersitasi</span>
          </div>
        </div>

        <div className="relative flex items-center bg-[#E8EDF2] px-5 py-14 sm:px-10 lg:min-h-[720px] lg:px-14">
          <div className="absolute right-0 top-0 h-28 w-28 border-b border-l border-line/70" aria-hidden="true" />
          <div className="motion-document relative mx-auto w-full max-w-[560px] bg-white p-5 shadow-[0_28px_80px_rgba(20,32,46,0.16)] sm:p-8">
            <div className="flex items-start justify-between gap-5 border-b-2 border-ink pb-5">
              <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-margin">Contoh tampilan</p><h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Hasil pengecekan</h2></div>
              <span className="border border-line px-2 py-1 font-mono text-[9px] uppercase text-margin">PW / 2026</span>
            </div>
            <div className="py-6">
              <p className="text-xs font-semibold text-margin">Skema yang diperiksa</p>
              <h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">PPh Final UMKM 0,5%</h3>
              <div className="mt-7 inline-flex -rotate-2 items-center gap-3 border-[3px] border-stamp px-4 py-2 text-stamp">
                <span className="font-mono text-lg font-bold" aria-hidden="true">×</span><span className="text-sm font-extrabold tracking-[0.16em]">TIDAK BERHAK</span>
              </div>
              <p className="mt-7 max-w-md text-sm leading-7 text-margin">Pada contoh ini, jenis pekerjaannya tidak boleh memakai cara hitung tersebut. Kami tetap menampilkannya agar alasannya mudah dipahami.</p>
            </div>
            <div className="border-t border-line pt-5">
              <div className="flex items-center justify-between gap-4"><span className="text-xs font-bold uppercase tracking-[0.14em]">Lihat aturan resminya</span><span className="font-mono text-lg text-margin" aria-hidden="true">+</span></div>
              <p className="mt-3 font-mono text-[10px] leading-5 text-margin">Nomor pasal dan sumber resmi akan ditampilkan di sini.</p>
            </div>
            <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full border border-blue/30 bg-paper" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>

    <section id="mengapa" className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.8fr_1.2fr]">
        <div className="border-white/15 px-5 py-16 sm:px-8 sm:py-24 lg:border-r lg:pr-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Mengapa PajakWajar</p>
          <h2 className="mt-5 max-w-lg font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Alat lain mulai dari <em className="text-white/50">angka.</em><br />Kami mulai dari <em className="text-white/50">aturannya.</em></h2>
          <p className="mt-7 max-w-md text-base leading-8 text-white/65">Hasil hitungan bisa terlihat rapi, tetapi berisiko denda jika cara menghitungnya dilarang untuk profesi Anda. PajakWajar memastikan keabsahan hukumnya terlebih dahulu.</p>
        </div>
        <div className="divide-y divide-white/15 border-t border-white/15 lg:border-t-0">
          {pembeda.map((item) => <article key={item.nomor} className="group grid gap-5 px-5 py-9 transition-colors hover:bg-white/[0.04] sm:grid-cols-[48px_1fr] sm:px-10 sm:py-10"><span className="font-mono text-xs text-white/40">{item.nomor}</span><div><h3 className="font-display text-2xl font-semibold">{item.judul}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-white/60">{item.isi}</p></div></article>)}
        </div>
      </div>
    </section>

    <section id="cara-kerja" className="border-b border-line bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue">Empat langkah praktis</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight sm:text-6xl">Dari verifikasi aturan sampai kertas kerja siap lapor.</h2></div>
          <p className="max-w-sm text-sm leading-7 text-margin">Alur terstruktur yang memandu Anda langkah demi langkah tanpa perlu latar belakang perpajakan.</p>
        </div>
        <ol className="mt-14 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4 lg:border-l-0">
          {proses.map((item, index) => <li key={item.nomor} className="group relative border-b border-r border-line p-6 sm:p-8 lg:min-h-[290px]"><span className="font-mono text-xs font-bold text-blue">{item.nomor}</span><div className="mt-14 h-px w-8 bg-blue transition-all duration-300 group-hover:w-16" aria-hidden="true" /><h3 className="mt-5 font-display text-2xl font-semibold">{item.judul}</h3><p className="mt-3 text-sm leading-7 text-margin">{item.isi}</p>{index < proses.length - 1 && <span className="absolute -right-3 top-7 z-10 hidden h-6 w-6 place-items-center bg-white font-mono text-margin lg:grid" aria-hidden="true">→</span>}</li>)}
        </ol>
      </div>
    </section>

    <section className="border-b border-line bg-white pb-20 sm:pb-28" aria-labelledby="judul-kamus">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="border border-line bg-paper p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue">Kamus mini</p><h2 id="judul-kamus" className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Istilah pajak, dalam bahasa sehari-hari.</h2></div>
            <dl className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
              {[
                ['SPT', 'Laporan pajak tahunan yang wajib disampaikan ke DJP.'],
                ['Omzet', 'Total seluruh uang masuk dari pekerjaan/usaha kotor setahun.'],
                ['PTKP', 'Batas penghasilan minimal yang bebas dari pengenaan pajak.'],
                ['Bukti Potong', 'Dokumen resmi bukti pajak Anda sudah dicicil/dipotong klien.'],
                ['NPPN / Norma', 'Persentase resmi DJP untuk menentukan laba bersih tanpa pembukuan.'],
                ['Coretax DJP', 'Portal sistem perpajakan terpadu generasi baru dari pemerintah.']
              ].map(([istilah, arti]) => <div key={istilah} className="bg-white p-5"><dt className="font-mono text-xs font-bold text-blue">{istilah}</dt><dd className="mt-2 text-sm leading-6 text-margin">{arti}</dd></div>)}
            </dl>
          </div>
        </div>
      </div>
    </section>

    <section id="privasi" className="bg-paper py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue">Privasi & Keamanan Data</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-medium leading-tight tracking-tight sm:text-6xl">Data finansial Anda tidak disimpan di server kami.</h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-margin">
            Seluruh simulasi kelayakan, perhitungan tarif progresif, dan rekonsiliasi berjalan <strong>100% di memori peramban (browser)</strong> perangkat Anda. Tidak ada pendaftaran akun dan tidak ada data keuangan yang disimpan ke database kami.
          </p>
          <p className="mt-4 max-w-xl text-xs leading-6 text-margin border-l-2 border-blue/40 pl-3.5">
            <strong>Transparansi Fitur Scan Bukti Potong (OCR):</strong> Foto bukti potong hanya dikirim ke penyedia AI (Google Gemini) jika Anda memberikan persetujuan eksplisit, semata-mata untuk membaca teks secara otomatis tanpa disimpan di server kami. Anda selalu bebas memilih input manual tanpa mengunggah foto.
          </p>
        </div>
        <div className="border border-line bg-white p-6 shadow-sheet sm:p-8">
          <div className="flex items-center justify-between border-b border-line pb-5"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-margin">Alur Pemrosesan Data</span><span className="h-2.5 w-2.5 rounded-full bg-blue" aria-hidden="true" /></div>
          <div className="space-y-7 py-7">
            {[
              ['01', 'Input di Perangkat Lokal', 'Jawaban formulir dan angka omzet diproses di browser HP/laptop tanpa dikirim ke database.'],
              ['02', 'Validasi Aturan & Komputasi', 'Rumus PTKP, tarif progresif Pasal 17, dan norma dihitung langsung di perangkat Anda.'],
              ['03', 'Unduh Kertas Kerja Mandiri', 'Hasil audit siap diunduh dalam format PDF resmi untuk panduan lapor SPT di Coretax DJP.']
            ].map(([nomor, judul, isi]) => <div key={nomor} className="grid grid-cols-[36px_1fr] gap-4"><span className="font-mono text-xs text-blue">{nomor}</span><div><strong className="block text-sm">{judul}</strong><span className="mt-1 block text-xs leading-5 text-margin">{isi}</span></div></div>)}
          </div>
          <div className="border-t border-line pt-5 text-xs font-semibold text-blue">Perangkat Anda → Hasil Anda (Privat & Mandiri)</div>
        </div>
      </div>
    </section>

    <section className="border-y border-line bg-blue text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Mulai dari yang benar</p><h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight sm:text-5xl">Ketahui posisi Anda sebelum satu rupiah pun dihitung.</h2></div>
        <Link href="/cek-kelayakan" className="pressable inline-flex min-h-14 shrink-0 items-center justify-center gap-7 bg-white px-7 text-sm font-bold text-blue">Mulai pemeriksaan <span aria-hidden="true">→</span></Link>
      </div>
    </section>

    <footer className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div><Logo /><p className="mt-4 max-w-md text-xs leading-6 text-margin">Alat bantu untuk mengecek pajak sebelum mengisi laporan tahunan. Bukan nasihat pajak.</p></div>
        <div className="text-xs leading-6 text-margin md:text-right"><p>© 2026 PajakWajar</p><p>Dibuat untuk ITechno Cup 2026</p></div>
      </div>
    </footer>
  </main>;
}
