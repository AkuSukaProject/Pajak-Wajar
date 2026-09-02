'use client';

import React, { useId, useState } from 'react';
import type {
  BentukKegiatan,
  DatabaseRegulasi,
  HasilAuditPajakLengkap,
  HasilRekonsiliasiBupot,
  KelompokWilayahKey,
  ProfilWajibPajak,
  StatusPerpajakanPasangan,
  StatusPtkp,
  TahunPajak,
} from '@/types/pajak';
import { auditPajakMandiri } from '@/lib/index';
import dynamic from 'next/dynamic';
import kluRulesData from '../../../data/klu_rules.json';
import { KartuVonis } from './KartuVonis';
import { ModulBupot } from '../bupot';

const TombolUnduhPdf = dynamic(
  () => import('../pdf').then((mod) => mod.TombolUnduhPdf),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-bold text-white shadow-sm opacity-70"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        <span>Memuat Modul PDF...</span>
      </button>
    ),
  }
);

type JawabanKepatuhan = boolean | 'tidak_yakin';

interface ProfilFormState {
  tahunPajak: TahunPajak;
  kluKode: string;
  bentukKegiatan: BentukKegiatan;
  wilayah: KelompokWilayahKey;
  statusPtkp: StatusPtkp;
  statusPerpajakanPasangan: StatusPerpajakanPasangan;
  punyaLebihDariSatuKegiatan: JawabanKepatuhan;
  omzetPribadiTahunPajak: number;
  biayaOperasionalRiil?: number;
  omzetPribadiThnSebelumnya: number;
  omzetPasanganThnSebelumnya: number;
  omzetSeluruhPerseroanPeroranganThnSebelumnya: number;
  sudahMemberitahukanNppn: JawabanKepatuhan;
  pernahPilihTarifUmum: JawabanKepatuhan;
  jugaPegawaiTetap: boolean;
}

const profilAwal: ProfilFormState = {
  tahunPajak: 2026,
  kluKode: '90002',
  bentukKegiatan: 'PEKERJAAN_BEBAS',
  wilayah: 'kelompok1',
  statusPtkp: 'TK/0',
  statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
  punyaLebihDariSatuKegiatan: false,
  omzetPribadiTahunPajak: 0,
  biayaOperasionalRiil: undefined,
  omzetPribadiThnSebelumnya: 0,
  omzetPasanganThnSebelumnya: 0,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: 'tidak_yakin',
  pernahPilihTarifUmum: false,
  jugaPegawaiTetap: false,
};

const pilihanKlu: Array<{
  kode: string;
  nama: string;
  jenis: string;
  bentuk: BentukKegiatan;
}> = [
  {
    kode: '90002',
    nama: 'Kreator Konten / Influencer / Selebgram',
    jenis: 'Jasa & keahlian pribadi (Pekerjaan Bebas sesuai PP 20/2026)',
    bentuk: 'PEKERJAAN_BEBAS',
  },
  {
    kode: '62019',
    nama: 'Software Engineer / Desainer / Konsultan Lepas',
    jenis: 'Keahlian pribadi independen (Pekerjaan Bebas)',
    bentuk: 'PEKERJAAN_BEBAS',
  },
  {
    kode: '47911',
    nama: 'Perdagangan E-Commerce / Toko Online / Reseller',
    jenis: 'Usaha perdagangan barang (Usaha Dagang)',
    bentuk: 'USAHA_DAGANG',
  },
  {
    kode: '56101',
    nama: 'Kuliner / Kafe / Jasa Usaha Mikro',
    jenis: 'Usaha jasa komersial & operasional (Usaha Jasa)',
    bentuk: 'USAHA_JASA',
  },
];

const pilihanPtkp: Array<{ nilai: StatusPtkp; label: string }> = [
  { nilai: 'TK/0', label: 'Belum kawin, tanpa tanggungan' },
  { nilai: 'TK/1', label: 'Belum kawin, 1 tanggungan' },
  { nilai: 'TK/2', label: 'Belum kawin, 2 tanggungan' },
  { nilai: 'TK/3', label: 'Belum kawin, 3 tanggungan' },
  { nilai: 'K/0', label: 'Sudah kawin, tanpa tanggungan' },
  { nilai: 'K/1', label: 'Sudah kawin, 1 tanggungan' },
  { nilai: 'K/2', label: 'Sudah kawin, 2 tanggungan' },
  { nilai: 'K/3', label: 'Sudah kawin, 3 tanggungan' },
];

const judulLangkah = [
  'Tahun Pajak',
  'Profesi & Pekerjaan',
  'Profil Keluarga & Omzet',
  'Riwayat Administrasi Pajak',
];

function PilihanTiga({
  nama,
  nilai,
  onChange,
  labelYa = 'Sudah / Pernah',
  labelTidak = 'Belum',
}: {
  nama: string;
  nilai: JawabanKepatuhan;
  onChange: (nilai: JawabanKepatuhan) => void;
  labelYa?: string;
  labelTidak?: string;
}) {
  const opsi: Array<{ nilai: JawabanKepatuhan; label: string }> = [
    { nilai: true, label: labelYa },
    { nilai: false, label: labelTidak },
    { nilai: 'tidak_yakin', label: 'Tidak Yakin' },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {opsi.map((item) => {
        const aktif = nilai === item.nilai;
        return (
          <label
            key={String(item.nilai)}
            className={`choice-control flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
              aktif
                ? 'border-blue bg-blue text-white shadow-sm'
                : 'border-line bg-white hover:border-blue/60 text-ink'
            }`}
          >
            <input
              className="sr-only"
              type="radio"
              name={nama}
              checked={aktif}
              onChange={() => onChange(item.nilai)}
            />
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${
                aktif ? 'border-white' : 'border-margin'
              }`}
              aria-hidden="true"
            >
              {aktif && <span className="h-2 w-2 rounded-full bg-current" />}
            </span>
            {item.label}
          </label>
        );
      })}
    </div>
  );
}

function InputRupiah({
  label,
  nilai,
  onChange,
  bantuan,
}: {
  label: string;
  nilai: number;
  onChange: (nilai: number) => void;
  bantuan: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <span className="flex rounded-lg border border-line bg-white transition-colors focus-within:border-blue focus-within:ring-1 focus-within:ring-blue overflow-hidden">
        <span className="border-r border-line bg-slate-50 px-4 py-3 font-mono text-sm text-margin">
          Rp
        </span>
        <input
          id={id}
          aria-describedby={`${id}-help`}
          inputMode="numeric"
          min="0"
          type="text"
          value={nilai ? nilai.toLocaleString('id-ID') : ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            onChange(raw ? parseInt(raw, 10) : 0);
          }}
          className="w-full min-w-0 bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none"
          placeholder="0"
          autoComplete="off"
        />
      </span>
      <span id={`${id}-help`} className="mt-1.5 block text-xs leading-5 text-margin">
        {bantuan}
      </span>
    </label>
  );
}

export function AlurKelayakan() {
  const [langkah, setLangkah] = useState(0);
  const [arah, setArah] = useState<'maju' | 'mundur'>('maju');
  const [profil, setProfil] = useState<ProfilFormState>(profilAwal);
  const [hasilAudit, setHasilAudit] = useState<HasilAuditPajakLengkap | null>(null);
  const [sudahMencoba, setSudahMencoba] = useState(false);

  const ubah = <K extends keyof ProfilFormState>(kunci: K, nilai: ProfilFormState[K]) =>
    setProfil((lama) => ({ ...lama, [kunci]: nilai }));

  const langkahValid = langkah !== 1 || Boolean(profil.kluKode);

  const jalankanAudit = () => {
    const inputProfil: ProfilWajibPajak = {
      tahunPajak: profil.tahunPajak,
      kluKode: profil.kluKode,
      wilayah: profil.wilayah,
      statusPtkp: profil.statusPtkp,
      bentukKegiatan: profil.bentukKegiatan,
      statusPerpajakanPasangan: profil.statusPerpajakanPasangan,
      punyaLebihDariSatuKegiatan: profil.punyaLebihDariSatuKegiatan,
      omzetPribadiTahunPajak: profil.omzetPribadiTahunPajak,
      biayaOperasionalRiil: profil.biayaOperasionalRiil,
      omzetPribadiThnSebelumnya:
        profil.omzetPribadiThnSebelumnya || profil.omzetPribadiTahunPajak,
      omzetPasanganThnSebelumnya: profil.omzetPasanganThnSebelumnya,
      omzetSeluruhPerseroanPeroranganThnSebelumnya:
        profil.omzetSeluruhPerseroanPeroranganThnSebelumnya,
      sudahMemberitahukanNppn: profil.sudahMemberitahukanNppn,
      pernahPilihTarifUmum: profil.pernahPilihTarifUmum,
      jugaPegawaiTetap: profil.jugaPegawaiTetap,
    };

    const hasil = auditPajakMandiri(
      { profil: inputProfil, kreditPajak: [] },
      kluRulesData as unknown as DatabaseRegulasi
    );

    setHasilAudit(hasil);
  };

  const lanjut = () => {
    setSudahMencoba(true);
    if (!langkahValid) return;
    setSudahMencoba(false);

    if (langkah < 3) {
      setArah('maju');
      setLangkah((n) => n + 1);
    } else {
      jalankanAudit();
    }
  };

  const [rekonsiliasi, setRekonsiliasi] = useState<HasilRekonsiliasiBupot | null>(null);

  if (hasilAudit) {
    // Cari skema yang BOLEH dan kalkulasinya TERSEDIA untuk menjadi dasar pemotongan kredit bupot
    let pajakTerutangDasar = 0;
    for (const skema of hasilAudit.skema) {
      if (skema.statusKelayakan === 'BOLEH' && skema.statusKalkulasi === 'TERSEDIA') {
        pajakTerutangDasar = skema.pajakTerutang;
        break;
      }
    }

    return (
      <div className="motion-result space-y-8">
        <KartuVonis hasil={hasilAudit} />

        {/* Modul Rekonsiliasi Bukti Potong */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-7 shadow-sheet">
          <ModulBupot
            pajakTerutangDasar={pajakTerutangDasar}
            onHasilChange={setRekonsiliasi}
          />
        </div>

        {/* Bagian Unduh Kertas Kerja PDF */}
        {rekonsiliasi && (
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sheet flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                Dokumen Kertas Kerja Siap Diunduh
              </h3>
              <p className="text-xs text-margin mt-1">
                Bawa ringkasan vonis, perhitungan, dan rekonsiliasi bukti potong ini sebagai panduan saat mengisi SPT di Coretax DJP.
              </p>
            </div>
            <TombolUnduhPdf
              profil={profil}
              hasilAudit={hasilAudit}
              rekonsiliasi={rekonsiliasi}
            />
          </div>
        )}

        <button
          type="button"
          className="pressable w-full rounded-xl border border-line bg-white px-5 py-3.5 text-sm font-semibold hover:border-blue transition text-ink shadow-sm"
          onClick={() => setHasilAudit(null)}
        >
          ← Ubah Jawaban Simulasi Kelayakan
        </button>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sheet border border-line" aria-labelledby="judul-form">
      <div className="border-b border-line px-5 py-5 sm:px-8 sm:py-6 bg-slate-50/50">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-margin">
              Langkah {langkah + 1} dari 4
            </p>
            <h2 id="judul-form" className="mt-1 font-display text-2xl font-semibold text-ink">
              {judulLangkah[langkah]}
            </h2>
          </div>
          <span className="font-mono text-xs font-semibold text-blue">{(langkah + 1) * 25}%</span>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((nomor) => (
            <span key={nomor} className="h-1.5 overflow-hidden rounded-full bg-line">
              <span
                className={`block h-full bg-blue transition-transform duration-300 ${
                  nomor <= langkah ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </span>
          ))}
        </div>
      </div>

      <div
        key={langkah}
        className={`min-h-[430px] px-5 py-7 sm:px-8 sm:py-9 ${
          arah === 'maju' ? 'motion-step-next' : 'motion-step-back'
        }`}
      >
        {langkah === 0 && (
          <fieldset>
            <legend className="text-xl font-semibold text-ink">
              Tahun pajak berapa yang ingin Anda simulasikan?
            </legend>
            <p className="mt-2 text-sm leading-6 text-margin">
              Pilih tahun pajak penghasilan yang akan dilaporkan.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {([2025, 2026] as TahunPajak[]).map((tahun) => {
                const aktif = profil.tahunPajak === tahun;
                return (
                  <label
                    key={tahun}
                    className={`choice-control cursor-pointer rounded-xl border p-5 transition ${
                      aktif
                        ? 'border-blue bg-blue text-white shadow-sm'
                        : 'border-line hover:border-blue/60 bg-white text-ink'
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="tahun-pajak"
                      checked={aktif}
                      onChange={() => ubah('tahunPajak', tahun)}
                    />
                    <span className="font-display text-3xl font-semibold">{tahun}</span>
                    <span className="mt-2 block text-xs opacity-90">
                      {tahun === 2026 ? 'PP 20/2026 Berlaku Penuh' : 'Tahun Pajak Transisi'}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl border-l-4 border-pending bg-amber-50/50 p-4 text-xs leading-5 text-margin border border-amber-200">
              <strong className="text-ink">Konteks Regulasi:</strong> PP No. 20 Tahun 2026 mulai berlaku 22 April 2026, mempertegas kriteria penerima PPh Final 0,5% dan penghitungan omzet konsolidasi.
            </div>
          </fieldset>
        )}

        {langkah === 1 && (
          <fieldset>
            <legend className="text-xl font-semibold text-ink">
              Apa bentuk kegiatan atau profesi utama Anda?
            </legend>
            <p className="mt-2 text-sm leading-6 text-margin">
              Pilih bidang yang paling mewakili sumber penghasilan terbesar Anda.
            </p>
            <div className="mt-6 space-y-3">
              {pilihanKlu.map((item) => {
                const aktif = profil.kluKode === item.kode;
                return (
                  <label
                    key={item.kode}
                    className={`choice-control flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-4 transition ${
                      aktif
                        ? 'border-blue bg-blue/[0.06] text-ink ring-1 ring-blue'
                        : 'border-line hover:border-blue/60 bg-white text-ink'
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="klu"
                      checked={aktif}
                      onChange={() => {
                        ubah('kluKode', item.kode);
                        ubah('bentukKegiatan', item.bentuk);
                      }}
                    />
                    <div>
                      <strong className="block text-sm font-semibold text-ink">{item.nama}</strong>
                      <span className="mt-1 block text-xs text-margin">{item.jenis}</span>
                    </div>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition duration-200 ${
                        aktif ? 'border-blue bg-blue text-white' : 'border-line'
                      }`}
                      aria-hidden="true"
                    >
                      {aktif ? '✓' : ''}
                    </span>
                  </label>
                );
              })}
            </div>
            {sudahMencoba && !profil.kluKode && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700 border border-red-200">
                Pilih salah satu profesi untuk melanjutkan.
              </p>
            )}
          </fieldset>
        )}

        {langkah === 2 && (
          <div className="space-y-6">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">
                Status PTKP (Keluarga & Tanggungan)
              </span>
              <span className="mb-2 block text-xs leading-5 text-margin">
                Penghasilan Tidak Kena Pajak untuk menentukan dasar pengenaan PPh tarif umum/NPPN.
              </span>
              <select
                value={profil.statusPtkp}
                onChange={(e) => ubah('statusPtkp', e.target.value as StatusPtkp)}
                className="w-full rounded-lg border border-line bg-white p-3 text-sm text-ink outline-none focus:border-blue focus:ring-1 focus:ring-blue"
              >
                {pilihanPtkp.map((pilihan) => (
                  <option key={pilihan.nilai} value={pilihan.nilai}>
                    {pilihan.label} ({pilihan.nilai})
                  </option>
                ))}
              </select>
            </label>

            <InputRupiah
              label="Total Omzet / Peredaran Bruto Anda (Setahun)"
              nilai={profil.omzetPribadiTahunPajak}
              onChange={(nilai) => {
                ubah('omzetPribadiTahunPajak', nilai);
                ubah('omzetPribadiThnSebelumnya', nilai);
              }}
              bantuan="Semua uang masuk kotor sebelum dikurangi biaya operasional."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <InputRupiah
                label="Omzet Usaha Pasangan (Jika ada)"
                nilai={profil.omzetPasanganThnSebelumnya}
                onChange={(nilai) => ubah('omzetPasanganThnSebelumnya', nilai)}
                bantuan="Diperhitungkan jika status perpajakan pisah harta/kewajiban."
              />
              <InputRupiah
                label="Omzet PT Perorangan (Jika ada)"
                nilai={profil.omzetSeluruhPerseroanPeroranganThnSebelumnya}
                onChange={(nilai) => ubah('omzetSeluruhPerseroanPeroranganThnSebelumnya', nilai)}
                bantuan="Omzet entitas PT Perorangan milik pribadi/keluarga."
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 hover:border-blue/60 transition bg-white">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 accent-blue"
                checked={profil.jugaPegawaiTetap}
                onChange={(e) => ubah('jugaPegawaiTetap', e.target.checked)}
              />
              <div>
                <strong className="block text-sm font-semibold text-ink">
                  Saya juga berstatus pegawai tetap / menerima gaji bulanan
                </strong>
                <span className="mt-1 block text-xs leading-5 text-margin">
                  Gaji dari pemberi kerja dan bukti potong 1721-A1 akan digabung dalam SPT Tahunan.
                </span>
              </div>
            </label>
          </div>
        )}

        {langkah === 3 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-base font-semibold text-ink">
                Pernahkah Anda menyampaikan pemberitahuan penggunaan Norma (NPPN) ke DJP?
              </legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                Pemberitahuan formulir LA.04-01 dalam 3 bulan pertama tahun pajak berjalan. Jika belum pernah atau tidak tahu, pilih &quot;Tidak Yakin&quot;.
              </p>
              <PilihanTiga
                nama="lapor-norma"
                nilai={profil.sudahMemberitahukanNppn}
                onChange={(nilai) => ubah('sudahMemberitahukanNppn', nilai)}
                labelYa="Pernah Lapor"
                labelTidak="Belum Pernah"
              />
            </fieldset>

            <fieldset>
              <legend className="text-base font-semibold text-ink">
                Pernahkah Anda secara sadar memilih pembukuan / Tarif Umum Pasal 17?
              </legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                Sesuai prinsip *Pintu Satu Arah* (PP 20/2026 Pasal 57 ayat 4), wajib pajak yang pernah memilih tarif umum tidak dapat kembali ke PPh Final UMKM.
              </p>
              <PilihanTiga
                nama="tarif-umum"
                nilai={profil.pernahPilihTarifUmum}
                onChange={(nilai) => ubah('pernahPilihTarifUmum', nilai)}
                labelYa="Pernah Pilih"
                labelTidak="Belum / Tidak"
              />
            </fieldset>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-slate-50/70 px-5 py-4 sm:px-8">
        {langkah > 0 && (
          <button
            type="button"
            onClick={() => {
              setSudahMencoba(false);
              setArah('mundur');
              setLangkah((nilai) => nilai - 1);
            }}
            className="pressable min-h-11 rounded-lg border border-line bg-white px-5 text-sm font-semibold hover:border-blue transition text-ink"
          >
            ← Kembali
          </button>
        )}
        <button
          type="button"
          onClick={lanjut}
          className="pressable ml-auto min-h-11 rounded-lg bg-blue px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue/90 transition"
        >
          {langkah === 3 ? 'Cek Kelayakan & Hitung Pajak' : 'Lanjutkan →'}
        </button>
      </div>
    </section>
  );
}
