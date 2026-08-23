'use client';

import { useState } from 'react';
import { mockHasil } from '@/mock/hasilKelayakan';
import type { JawabanKepatuhan, ProfilWajibPajak, StatusPtkp, TahunPajak } from '@/types/pajak';
import { KartuVonis } from './KartuVonis';

const profilAwal: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '',
  statusPtkp: 'TK/0',
  omzetPribadi: 0,
  omzetPasangan: 0,
  omzetPerseroanPerorangan: 0,
  sudahLaporLA0401: 'tidak_yakin',
  pernahPilihTarifUmum: 'tidak_yakin',
  jugaPegawaiTetap: false
};

const pilihanKlu = [
  { kode: 'MOCK-KREATOR', nama: 'Kreator konten / influencer' },
  { kode: 'MOCK-FREELANCE', nama: 'Pekerja lepas profesional' },
  { kode: 'MOCK-DAGANG', nama: 'Perdagangan / jualan online' },
  { kode: 'LAINNYA', nama: 'Lainnya — isi kode KLU nanti' }
];

function PilihanTiga({ nilai, onChange }: { nilai: JawabanKepatuhan; onChange: (nilai: JawabanKepatuhan) => void }) {
  const opsi: Array<{ nilai: JawabanKepatuhan; label: string }> = [
    { nilai: true, label: 'Sudah' }, { nilai: false, label: 'Belum' }, { nilai: 'tidak_yakin', label: 'Tidak yakin' }
  ];
  return <div className="grid grid-cols-3 gap-2">{opsi.map((opsi) => <button type="button" key={String(opsi.nilai)} onClick={() => onChange(opsi.nilai)} className={`min-h-12 border px-2 text-sm font-bold ${nilai === opsi.nilai ? 'border-blue bg-blue text-white' : 'border-line bg-white'}`}>{opsi.label}</button>)}</div>;
}

function InputRupiah({ label, nilai, onChange, bantuan }: { label: string; nilai: number; onChange: (nilai: number) => void; bantuan?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><div className="flex border border-line bg-white focus-within:border-blue"><span className="px-3 py-3 text-margin">Rp</span><input inputMode="numeric" min="0" type="number" value={nilai || ''} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-3 outline-none" placeholder="0" /></div>{bantuan && <span className="mt-1 block text-xs leading-5 text-margin">{bantuan}</span>}</label>;
}

export function AlurKelayakan() {
  const [langkah, setLangkah] = useState(0);
  const [profil, setProfil] = useState(profilAwal);
  const [tampilkanHasil, setTampilkanHasil] = useState(false);
  const ubah = <K extends keyof ProfilWajibPajak>(kunci: K, nilai: ProfilWajibPajak[K]) => setProfil((lama) => ({ ...lama, [kunci]: nilai }));

  if (tampilkanHasil) return <div><KartuVonis hasil={mockHasil} /><button className="mt-6 w-full border border-line bg-white px-5 py-3 font-bold" onClick={() => setTampilkanHasil(false)}>Ubah jawaban</button></div>;

  return (
    <section className="bg-white p-5 shadow-sheet sm:p-8" aria-labelledby="judul-form">
      <div className="mb-8 flex items-start justify-between gap-4 border-b border-line pb-5">
        <div><p className="text-xs font-bold uppercase tracking-widest text-margin">Langkah {langkah + 1} dari 4</p><h2 id="judul-form" className="mt-2 font-display text-2xl font-bold">Cek kelayakan</h2></div>
        <span className="font-mono text-sm text-blue">{Math.round(((langkah + 1) / 4) * 100)}%</span>
      </div>

      <div className="min-h-[360px]">
        {langkah === 0 && <fieldset><legend className="mb-5 text-lg font-bold">Tahun pajak yang ingin diperiksa</legend><div className="grid grid-cols-2 gap-3">{([2025, 2026] as TahunPajak[]).map((tahun) => <button type="button" key={tahun} onClick={() => ubah('tahunPajak', tahun)} className={`border p-5 text-xl font-bold ${profil.tahunPajak === tahun ? 'border-blue bg-blue text-white' : 'border-line'}`}>{tahun}</button>)}</div><p className="mt-5 text-sm leading-6 text-margin">Aturan dapat berbeda antartahun. Pastikan tahun sesuai SPT yang akan dilaporkan.</p></fieldset>}

        {langkah === 1 && <label className="block"><span className="mb-2 block text-lg font-bold">Apa pekerjaan atau kegiatan utama Anda?</span><span className="mb-4 block text-sm text-margin">Pilihan ini masih berupa alias untuk pengembangan UI. Kode KLU final menunggu data terverifikasi.</span><select value={profil.kluKode} onChange={(e) => ubah('kluKode', e.target.value)} className="w-full border border-line bg-white p-4"><option value="">Pilih profesi atau usaha</option>{pilihanKlu.map((item) => <option value={item.kode} key={item.kode}>{item.nama}</option>)}</select></label>}

        {langkah === 2 && <div className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold">Status keluarga untuk PTKP</span><select value={profil.statusPtkp} onChange={(e) => ubah('statusPtkp', e.target.value as StatusPtkp)} className="w-full border border-line bg-white p-3">{['TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3'].map((status) => <option key={status}>{status}</option>)}</select></label><InputRupiah label="Omzet pribadi setahun" nilai={profil.omzetPribadi} onChange={(v) => ubah('omzetPribadi', v)} bantuan="Dipakai sebagai dasar perhitungan pajak." /><InputRupiah label="Omzet pasangan setahun" nilai={profil.omzetPasangan} onChange={(v) => ubah('omzetPasangan', v)} bantuan="Dipakai hanya untuk uji ambang gabungan." /><InputRupiah label="Omzet perseroan perorangan" nilai={profil.omzetPerseroanPerorangan} onChange={(v) => ubah('omzetPerseroanPerorangan', v)} bantuan="Dipakai hanya untuk uji ambang gabungan." /><label className="flex items-start gap-3 border border-line p-4"><input type="checkbox" className="mt-1 h-5 w-5" checked={profil.jugaPegawaiTetap} onChange={(e) => ubah('jugaPegawaiTetap', e.target.checked)} /><span><strong className="block">Saya juga pegawai tetap</strong><span className="text-sm text-margin">Penghasilan campuran dapat memengaruhi pelaporan SPT.</span></span></label></div>}

        {langkah === 3 && <div className="space-y-8"><fieldset><legend className="mb-1 text-lg font-bold">Apakah Anda sudah memberi tahu DJP bahwa Anda memakai Norma?</legend><p className="mb-4 text-sm text-margin">Formulir LA.04-01</p><PilihanTiga nilai={profil.sudahLaporLA0401} onChange={(v) => ubah('sudahLaporLA0401', v)} /></fieldset><fieldset><legend className="mb-4 text-lg font-bold">Apakah Anda pernah memilih memakai tarif umum?</legend><PilihanTiga nilai={profil.pernahPilihTarifUmum} onChange={(v) => ubah('pernahPilihTarifUmum', v)} /></fieldset></div>}
      </div>

      {langkah === 1 && !profil.kluKode && <p role="alert" className="mb-4 text-sm font-bold text-stamp">Pilih satu profesi atau kegiatan untuk melanjutkan.</p>}
      <div className="mt-8 flex gap-3 border-t border-line pt-5">
        {langkah > 0 && <button type="button" onClick={() => setLangkah((n) => n - 1)} className="border border-line px-5 py-3 font-bold">Kembali</button>}
        <button type="button" disabled={langkah === 1 && !profil.kluKode} onClick={() => langkah < 3 ? setLangkah((n) => n + 1) : setTampilkanHasil(true)} className="ml-auto bg-blue px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{langkah === 3 ? 'Periksa kelayakan saya' : 'Lanjutkan'}</button>
      </div>
    </section>
  );
}
