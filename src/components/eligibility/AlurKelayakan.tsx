'use client';

import { useId, useState } from 'react';
import { mockHasil } from '@/mock/hasilKelayakan';
import type { JawabanKepatuhan, ProfilWajibPajak, StatusPtkp, TahunPajak } from '@/types/pajak';
import { KartuVonis } from './KartuVonis';

const profilAwal: ProfilWajibPajak = {
  tahunPajak: 2026, kluKode: '', statusPtkp: 'TK/0', omzetPribadi: 0,
  omzetPasangan: 0, omzetPerseroanPerorangan: 0, sudahLaporLA0401: 'tidak_yakin',
  pernahPilihTarifUmum: 'tidak_yakin', jugaPegawaiTetap: false
};

const pilihanKlu = [
  { kode: 'MOCK-KREATOR', nama: 'Kreator konten / influencer', jenis: 'Menghasilkan uang dari konten atau promosi' },
  { kode: 'MOCK-FREELANCE', nama: 'Pekerja lepas profesional', jenis: 'Menjual jasa atau keahlian pribadi' },
  { kode: 'MOCK-DAGANG', nama: 'Perdagangan / jualan online', jenis: 'Usaha dagang' },
  { kode: 'LAINNYA', nama: 'Profesi atau usaha lainnya', jenis: 'Pilih ini jika pekerjaan Anda belum ada di daftar' }
];

const pilihanPtkp: Array<{ nilai: StatusPtkp; label: string }> = [
  { nilai: 'TK/0', label: 'Belum kawin, tanpa tanggungan' },
  { nilai: 'TK/1', label: 'Belum kawin, 1 tanggungan' },
  { nilai: 'TK/2', label: 'Belum kawin, 2 tanggungan' },
  { nilai: 'TK/3', label: 'Belum kawin, 3 tanggungan' },
  { nilai: 'K/0', label: 'Sudah kawin, tanpa tanggungan' },
  { nilai: 'K/1', label: 'Sudah kawin, 1 tanggungan' },
  { nilai: 'K/2', label: 'Sudah kawin, 2 tanggungan' },
  { nilai: 'K/3', label: 'Sudah kawin, 3 tanggungan' }
];

const judulLangkah = ['Tahun penghasilan', 'Pekerjaan utama', 'Keluarga dan uang masuk', 'Pertanyaan terakhir'];

function PilihanTiga({ nama, nilai, onChange, labelYa = 'Sudah', labelTidak = 'Belum' }: { nama: string; nilai: JawabanKepatuhan; onChange: (nilai: JawabanKepatuhan) => void; labelYa?: string; labelTidak?: string }) {
  const opsi: Array<{ nilai: JawabanKepatuhan; label: string }> = [
    { nilai: true, label: labelYa }, { nilai: false, label: labelTidak }, { nilai: 'tidak_yakin', label: 'Tidak yakin' }
  ];
  return <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{opsi.map((opsi) => {
    const aktif = nilai === opsi.nilai;
    return <label key={String(opsi.nilai)} className={`choice-control flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm font-semibold ${aktif ? 'border-blue bg-blue text-white' : 'border-line bg-white hover:border-blue/60'}`}>
      <input className="sr-only" type="radio" name={nama} checked={aktif} onChange={() => onChange(opsi.nilai)} />
      <span className={`grid h-5 w-5 place-items-center rounded-full border ${aktif ? 'border-white' : 'border-margin'}`} aria-hidden="true">{aktif && <span className="h-2 w-2 rounded-full bg-current" />}</span>{opsi.label}
    </label>;
  })}</div>;
}

function InputRupiah({ label, nilai, onChange, bantuan }: { label: string; nilai: number; onChange: (nilai: number) => void; bantuan: string }) {
  const id = useId();
  return <label htmlFor={id} className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>
    <span className="flex border border-line bg-white transition-colors focus-within:border-blue focus-within:ring-1 focus-within:ring-blue"><span className="border-r border-line px-4 py-3.5 font-mono text-sm text-margin">Rp</span><input id={id} aria-describedby={`${id}-help`} inputMode="numeric" min="0" max="999999999999999" type="number" value={nilai || ''} onChange={(e) => onChange(Math.max(0, Math.min(Number(e.target.value), 999_999_999_999_999)))} className="w-full min-w-0 bg-transparent px-4 py-3.5 font-mono outline-none" placeholder="0" autoComplete="off" /></span>
    <span id={`${id}-help`} className="mt-1.5 block text-xs leading-5 text-margin">{bantuan}</span></label>;
}

export function AlurKelayakan() {
  const [langkah, setLangkah] = useState(0);
  const [arah, setArah] = useState<'maju' | 'mundur'>('maju');
  const [profil, setProfil] = useState(profilAwal);
  const [tampilkanHasil, setTampilkanHasil] = useState(false);
  const [sudahMencoba, setSudahMencoba] = useState(false);
  const ubah = <K extends keyof ProfilWajibPajak>(kunci: K, nilai: ProfilWajibPajak[K]) => setProfil((lama) => ({ ...lama, [kunci]: nilai }));
  const langkahValid = langkah !== 1 || Boolean(profil.kluKode);
  const lanjut = () => {
    setSudahMencoba(true);
    if (!langkahValid) return;
    setSudahMencoba(false);
    if (langkah < 3) {
      setArah('maju');
      setLangkah((nilai) => nilai + 1);
    } else setTampilkanHasil(true);
  };

  if (tampilkanHasil) return <div className="motion-result space-y-5"><KartuVonis hasil={mockHasil} /><button type="button" className="pressable w-full border border-line bg-white px-5 py-3.5 text-sm font-semibold hover:border-blue" onClick={() => setTampilkanHasil(false)}>← Ubah jawaban</button></div>;

  return <section className="overflow-hidden bg-white shadow-sheet" aria-labelledby="judul-form">
    <div className="border-b border-line px-5 py-5 sm:px-8 sm:py-6"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-margin">Langkah {langkah + 1} dari 4</p><h2 id="judul-form" className="mt-1 font-display text-2xl font-semibold">{judulLangkah[langkah]}</h2></div><span className="font-mono text-xs font-semibold text-blue">{(langkah + 1) * 25}%</span></div><div className="mt-5 grid grid-cols-4 gap-1" aria-hidden="true">{[0, 1, 2, 3].map((nomor) => <span key={nomor} className="h-1 overflow-hidden bg-line"><span className={`block h-full bg-blue ${nomor <= langkah ? 'motion-progress' : 'scale-x-0'}`} /></span>)}</div></div>

    <div key={langkah} className={`min-h-[430px] px-5 py-7 sm:px-8 sm:py-9 ${arah === 'maju' ? 'motion-step-next' : 'motion-step-back'}`}>
      {langkah === 0 && <fieldset><legend className="text-xl font-semibold">Penghasilan tahun berapa yang ingin diperiksa?</legend><p className="mt-2 text-sm leading-6 text-margin">Contoh: untuk laporan pajak atas penghasilan selama 2026, pilih 2026.</p><div className="mt-7 grid grid-cols-2 gap-3">{([2025, 2026] as TahunPajak[]).map((tahun) => { const aktif = profil.tahunPajak === tahun; return <label key={tahun} className={`choice-control cursor-pointer border p-5 ${aktif ? 'border-blue bg-blue text-white' : 'border-line hover:border-blue/60'}`}><input className="sr-only" type="radio" name="tahun-pajak" checked={aktif} onChange={() => ubah('tahunPajak', tahun)} /><span className="font-display text-3xl font-semibold">{tahun}</span><span className="mt-2 block text-xs opacity-80">Tahun penghasilan</span></label>; })}</div><div className="mt-7 border-l-2 border-pending bg-paper px-4 py-3 text-xs leading-5 text-margin"><strong className="text-ink">Kenapa ditanyakan?</strong> Aturan pajak bisa berubah dari satu tahun ke tahun berikutnya.</div></fieldset>}

      {langkah === 1 && <fieldset><legend className="text-xl font-semibold">Dari pekerjaan apa Anda paling banyak mendapat uang?</legend><p className="mt-2 text-sm leading-6 text-margin">Jika punya beberapa pekerjaan, pilih yang menghasilkan uang paling besar.</p><div className="mt-6 space-y-2">{pilihanKlu.map((item) => { const aktif = profil.kluKode === item.kode; return <label key={item.kode} className={`choice-control flex cursor-pointer items-center justify-between gap-4 border px-4 py-4 ${aktif ? 'border-blue bg-blue/[0.06]' : 'border-line hover:border-blue/60'}`}><input className="sr-only" type="radio" name="klu" checked={aktif} onChange={() => ubah('kluKode', item.kode)} /><span><strong className="block text-sm font-semibold">{item.nama}</strong><span className="mt-1 block text-xs text-margin">{item.jenis}</span></span><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-transform duration-200 ${aktif ? 'scale-110 border-blue bg-blue text-white' : 'border-line'}`} aria-hidden="true">{aktif ? '✓' : ''}</span></label>; })}</div>{sudahMencoba && !profil.kluKode && <p role="alert" className="motion-step-next mt-4 border-l-2 border-stamp bg-red-50 px-4 py-3 text-sm font-semibold text-stamp">Pilih satu pekerjaan agar Anda bisa melanjutkan.</p>}<p className="mt-4 text-xs leading-5 text-margin">Pilihan pekerjaan masih terbatas karena daftar lengkapnya sedang diperiksa dengan aturan resmi.</p></fieldset>}

      {langkah === 2 && <div className="space-y-6"><label className="block"><span className="mb-1 block text-sm font-semibold">Keadaan keluarga Anda</span><span className="mb-2 block text-xs leading-5 text-margin">Dipakai untuk menentukan PTKP, yaitu bagian penghasilan yang tidak dikenai pajak.</span><select value={profil.statusPtkp} onChange={(e) => ubah('statusPtkp', e.target.value as StatusPtkp)} className="w-full border border-line bg-white p-3.5 outline-none focus:border-blue">{pilihanPtkp.map((pilihan) => <option key={pilihan.nilai} value={pilihan.nilai}>{pilihan.label} ({pilihan.nilai})</option>)}</select></label><InputRupiah label="Total uang masuk dari usaha Anda selama setahun" nilai={profil.omzetPribadi} onChange={(nilai) => ubah('omzetPribadi', nilai)} bantuan="Nama resminya omzet: semua uang masuk sebelum dipotong biaya usaha." /><div className="grid gap-5 sm:grid-cols-2"><InputRupiah label="Total uang masuk dari usaha pasangan" nilai={profil.omzetPasangan} onChange={(nilai) => ubah('omzetPasangan', nilai)} bantuan="Isi 0 jika pasangan tidak punya usaha." /><InputRupiah label="Total uang masuk dari PT Perorangan" nilai={profil.omzetPerseroanPerorangan} onChange={(nilai) => ubah('omzetPerseroanPerorangan', nilai)} bantuan="Isi 0 jika Anda dan pasangan tidak punya PT Perorangan." /></div><label className="flex cursor-pointer items-start gap-3 border border-line p-4 hover:border-blue/60"><input type="checkbox" className="mt-0.5 h-5 w-5 accent-blue" checked={profil.jugaPegawaiTetap} onChange={(e) => ubah('jugaPegawaiTetap', e.target.checked)} /><span><strong className="block text-sm font-semibold">Saya juga menerima gaji sebagai pegawai tetap</strong><span className="mt-1 block text-xs leading-5 text-margin">Gaji dan penghasilan usaha biasanya dilaporkan bersama dalam SPT atau laporan pajak tahunan.</span></span></label></div>}

      {langkah === 3 && <div className="space-y-8"><fieldset><legend className="text-lg font-semibold">Pernahkah Anda memberi tahu kantor pajak bahwa Anda ingin memakai cara “Norma”?</legend><p className="mb-4 mt-1 text-xs leading-5 text-margin">Norma atau NPPN adalah cara memperkirakan penghasilan bersih memakai persentase resmi. Pemberitahuannya memakai Formulir LA.04-01. Jika baru mendengar istilah ini, pilih “Tidak yakin”.</p><PilihanTiga nama="lapor-norma" nilai={profil.sudahLaporLA0401} onChange={(nilai) => ubah('sudahLaporLA0401', nilai)} labelYa="Pernah" labelTidak="Belum pernah" /></fieldset><fieldset><legend className="text-lg font-semibold">Pernahkah Anda memilih pajak dihitung dari keuntungan bersih sebenarnya?</legend><p className="mb-4 mt-1 text-xs leading-5 text-margin">Nama resminya “tarif umum”. Keuntungan bersih berarti uang masuk dikurangi biaya usaha. Jika tidak ingat, pilih “Tidak yakin”.</p><PilihanTiga nama="tarif-umum" nilai={profil.pernahPilihTarifUmum} onChange={(nilai) => ubah('pernahPilihTarifUmum', nilai)} labelYa="Pernah" labelTidak="Belum pernah" /></fieldset><div className="border border-line bg-paper p-4 text-xs leading-5 text-margin"><strong className="text-ink">Catatan:</strong> hasil yang tampil saat ini masih memakai data contoh untuk menguji tampilan. Jangan dipakai untuk melapor pajak.</div></div>}
    </div>

    <div className="flex items-center gap-3 border-t border-line bg-paper/60 px-5 py-5 sm:px-8">{langkah > 0 && <button type="button" onClick={() => { setSudahMencoba(false); setArah('mundur'); setLangkah((nilai) => nilai - 1); }} className="pressable min-h-12 border border-line bg-white px-5 text-sm font-semibold hover:border-blue">Kembali</button>}<button type="button" onClick={lanjut} className="pressable ml-auto min-h-12 bg-blue px-6 text-sm font-semibold text-white shadow-lift hover:bg-ink">{langkah === 3 ? 'Lihat hasil pengecekan' : 'Lanjutkan'} <span aria-hidden="true">→</span></button></div>
  </section>;
}
