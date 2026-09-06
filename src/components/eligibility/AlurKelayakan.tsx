'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { InputBuktiPotong } from '@/components/eligibility/InputBuktiPotong';
import { KartuVonis } from '@/components/eligibility/KartuVonis';
import { KlasifikasiKegiatan } from '@/components/eligibility/KlasifikasiKegiatan';
import { InputRupiah } from '@/components/ui/InputRupiah';
import { Istilah } from '@/components/ui/Istilah';
import { PanelProses } from '@/components/ui/StatusProses';
import { PetunjukWaji } from '@/components/ui/PetunjukWaji';
import { auditPajakMandiri } from '@/lib/index';
import { basisAturan, daftarKlu } from '@/lib/regulasi';
import type {
  BentukKegiatan,
  HasilAuditPajak,
  JawabanKepatuhan,
  KelompokWilayahKey,
  KreditPajakItem,
  ProfilWajibPajak,
  StatusPerpajakanPasangan,
  StatusPtkp,
  TahunPajak
} from '@/types/pajak';

/** Id kolom yang divalidasi, dipakai untuk menggulir, memfokuskan, dan menandai galat. */
const KOLOM = {
  klu: 'kolom-klu',
  omzetTahunIni: 'kolom-omzet-tahun-ini',
  netoPegawai: 'kolom-neto-pegawai',
  kegiatanTambahan: 'kolom-kegiatan-tambahan'
} as const;

const profilAwal: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '',
  wilayah: 'kelompok1',
  statusPtkp: 'TK/0',
  bentukKegiatan: 'BELUM_PASTI',
  statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
  punyaLebihDariSatuKegiatan: 'tidak_yakin',
  omzetPribadiTahunPajak: 0,
  biayaOperasionalRiil: undefined,
  omzetPribadiThnSebelumnya: 0,
  omzetPasanganThnSebelumnya: 0,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: 'tidak_yakin',
  pernahPilihTarifUmum: 'tidak_yakin',
  jugaPegawaiTetap: false,
  pernahMelewatiAmbang: 'tidak_yakin'
};

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

const pilihanBentukKegiatan: Array<{ nilai: BentukKegiatan; judul: string; keterangan: string }> = [
  {
    nilai: 'PEKERJAAN_BEBAS',
    judul: 'Saya bekerja sendiri dengan keahlian saya',
    keterangan: 'Klien membayar Anda, dan Anda mengerjakannya sendiri tanpa pegawai.'
  },
  {
    nilai: 'USAHA_JASA',
    judul: 'Saya menjalankan usaha jasa dengan pegawai',
    keterangan: 'Ada orang lain yang bekerja untuk usaha Anda, misalnya studio atau kursus.'
  },
  {
    nilai: 'USAHA_DAGANG',
    judul: 'Saya berdagang atau menjual barang',
    keterangan: 'Penghasilan datang dari menjual barang, bukan dari keahlian pribadi.'
  },
  {
    nilai: 'BELUM_PASTI',
    judul: 'Belum yakin',
    keterangan: 'Kami akan menandai bagian yang perlu Anda pastikan dulu.'
  }
];

const pilihanPasangan: Array<{ nilai: StatusPerpajakanPasangan; judul: string; keterangan: string }> = [
  { nilai: 'TIDAK_ADA_PASANGAN', judul: 'Saya belum menikah', keterangan: 'Omzet pasangan tidak dihitung.' },
  { nilai: 'GABUNG', judul: 'Kami melapor pajak bersama', keterangan: 'Satu SPT untuk suami dan istri.' },
  { nilai: 'PISAH_HARTA', judul: 'Kami punya perjanjian pisah harta', keterangan: 'Harta dan penghasilan dipisahkan secara tertulis.' },
  { nilai: 'PISAH_KEWAJIBAN', judul: 'Istri melapor pajaknya sendiri', keterangan: 'Istri menjalankan hak dan kewajiban pajaknya sendiri.' },
  { nilai: 'PISAH_PUTUSAN_HAKIM', judul: 'Kami berpisah menurut putusan hakim', keterangan: 'Hanya untuk perpisahan yang sudah diputus pengadilan. Omzet pasangan tidak digabungkan.' },
  { nilai: 'TIDAK_YAKIN', judul: 'Tidak yakin', keterangan: 'Kami akan menandai bagian yang perlu dipastikan.' }
];

/**
 * Jawaban status pasangan yang masih mungkin setelah keadaan keluarga diketahui.
 *
 * Keadaan keluarga sudah ditanyakan lebih dulu, jadi menawarkan "Saya belum
 * menikah" kepada orang ber-PTKP kawin — atau sebaliknya — hanya mengundang
 * jawaban yang bertentangan. Berpisah menurut putusan hakim tetap tersedia pada
 * keduanya karena itu satu-satunya keadaan yang membatalkan penggabungan omzet.
 */
/**
 * Keadaan berpasangan yang omzetnya tidak pernah digabungkan, sehingga
 * pertanyaan lanjutan tentang penghasilan pasangan tidak relevan.
 */
function tanpaPenggabungan(status: StatusPerpajakanPasangan): boolean {
  return status === 'TIDAK_ADA_PASANGAN' || status === 'PISAH_PUTUSAN_HAKIM';
}

function pasanganMungkin(statusPtkp: StatusPtkp): StatusPerpajakanPasangan[] {
  return statusPtkp.startsWith('TK/')
    ? ['TIDAK_ADA_PASANGAN', 'PISAH_PUTUSAN_HAKIM']
    : ['GABUNG', 'PISAH_HARTA', 'PISAH_KEWAJIBAN', 'PISAH_PUTUSAN_HAKIM', 'TIDAK_YAKIN'];
}

const judulLangkah = [
  'Tahun penghasilan',
  'Pekerjaan utama',
  'Keluarga dan uang masuk',
  'Tahun sebelumnya',
  'Riwayat pilihan pajak',
  'Pajak yang sudah dipotong'
];

const jumlahLangkah = judulLangkah.length;

const petunjukLangkah = [
  { suasana: 'menyapa', judul: 'Kita mulai dari tahunnya, ya.', pesan: 'Pilih tahun saat penghasilan diterima, bukan tahun Anda mengisi laporan.' },
  { suasana: 'berpikir', judul: 'Mana yang paling menggambarkan pekerjaan Anda?', pesan: 'Baca pilihan satu per satu. Pilih “Belum yakin” jika bentuk kegiatannya masih membingungkan.' },
  { suasana: 'memeriksa', judul: 'Siapkan catatan uang masuk dan biaya.', pesan: 'Isi sesuai catatan Anda. Jika biaya belum diketahui, biarkan kosong.' },
  { suasana: 'berpikir', judul: 'Sekarang, lihat catatan tahun sebelumnya.', pesan: 'Perhatikan tahun pada kolom agar angka tahun ini tidak tertukar dengan tahun lalu.' },
  { suasana: 'memberitahu', judul: 'Tidak perlu menebak riwayat Anda.', pesan: 'Jika belum ingat atau belum punya buktinya, pilihan “Tidak yakin” boleh digunakan.' },
  { suasana: 'memeriksa', judul: 'Mari cocokkan bukti potongnya.', pesan: 'Bisa diketik manual atau dibaca dari foto. Periksa angkanya sebelum menambahkan bukti.' }
] as const;

function PilihanTiga({
  nama,
  nilai,
  onChange,
  labelYa = 'Sudah',
  labelTidak = 'Belum'
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
    { nilai: 'tidak_yakin', label: 'Tidak yakin' }
  ];
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {opsi.map((item) => {
        const aktif = nilai === item.nilai;
        return (
          <label
            key={String(item.nilai)}
            className={`choice-control flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm font-semibold ${aktif ? 'border-blue bg-blue text-white' : 'border-line bg-white hover:border-blue/60'}`}
          >
            <input className="sr-only" type="radio" name={nama} checked={aktif} onChange={() => onChange(item.nilai)} />
            <span
              className={`grid h-5 w-5 place-items-center rounded-full border ${aktif ? 'border-white' : 'border-margin'}`}
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

export function AlurKelayakan() {
  const [langkah, setLangkah] = useState(0);
  const [arah, setArah] = useState<'maju' | 'mundur'>('maju');
  const [profil, setProfil] = useState(profilAwal);
  const [kreditPajak, setKreditPajak] = useState<KreditPajakItem[]>([]);
  const [hasil, setHasil] = useState<HasilAuditPajak | null>(null);
  const [hasilSiap, setHasilSiap] = useState<HasilAuditPajak | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sudahMencoba, setSudahMencoba] = useState(false);
  const [galatKolom, setGalatKolom] = useState<Record<string, string>>({});
  const [kolomBergetar, setKolomBergetar] = useState<string | null>(null);
  const [buktiBelumDisimpan, setBuktiBelumDisimpan] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const pertama = useRef(true);
  useEffect(() => {
    if (!hasilSiap) return;
    // Transisi presentasi singkat, bukan simulasi persentase perhitungan.
    const durasi = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    const timer = window.setTimeout(() => { setHasil(hasilSiap); setHasilSiap(null); }, durasi);
    return () => window.clearTimeout(timer);
  }, [hasilSiap]);
  useEffect(() => {
    if (pertama.current) { pertama.current = false; return; }
    const judul = container.current?.querySelector<HTMLElement>('#judul-form, #judul-hasil');
    judul?.focus({ preventScroll: true });
    (hasil ? container.current : judul)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [langkah, hasil]);

  const pilihanKlu = useMemo(() => daftarKlu(), []);
  const kluTerpilih = pilihanKlu.find((item) => item.kluKode === profil.kluKode);

  const ubah = <K extends keyof ProfilWajibPajak>(kunci: K, nilai: ProfilWajibPajak[K]) =>
    setProfil((lama) => ({ ...lama, [kunci]: nilai }));

  /** Untuk jawaban yang harus berubah bersama agar tidak saling bertentangan. */
  const ubahBanyak = (bagian: Partial<ProfilWajibPajak>) =>
    setProfil((lama) => ({ ...lama, ...bagian }));

  /** Menghapus tanda galat pada satu kolom begitu pengguna memperbaikinya. */
  const bersihkanGalat = (idKolom: string) =>
    setGalatKolom((lama) => {
      if (!(idKolom in lama)) return lama;
      const baru = { ...lama };
      delete baru[idKolom];
      return baru;
    });

  /**
   * Isian yang wajib diisi pada satu langkah.
   *
   * Hanya kolom yang benar-benar tidak dapat ditebak yang diwajibkan. Kolom
   * rupiah lain boleh bernilai 0 karena nol memang jawaban yang sah di sana,
   * misalnya omzet tahun sebelumnya bagi orang yang baru mulai berusaha.
   */
  const periksaLangkah = (nomor: number): Array<{ id: string; pesan: string }> => {
    const daftar: Array<{ id: string; pesan: string }> = [];

    if (nomor === 1 && !profil.kluKode) {
      daftar.push({
        id: KOLOM.klu,
        pesan: 'Pilih satu pekerjaan agar Anda bisa melanjutkan. Bila tidak ada yang cocok, pilih “Kegiatan saya belum tersedia atau saya belum yakin”.'
      });
    }

    if (nomor === 2) {
      // Omzet Rp0 sengaja tidak ditolak: tahun tanpa pemasukan adalah jawaban
      // yang sah, dan hasilnya memang Rp0. Neto gaji yang belum diisi juga tidak
      // menghalangi langkah berikutnya; orkestrator menahan nominalnya sendiri
      // dengan alasan yang jelas, sehingga pengguna tidak perlu mengubah status
      // kepegawaiannya hanya agar bisa melanjutkan.
      const barisBelumLengkap = (profil.kegiatanTambahan ?? []).some(
        (kegiatan) => (kegiatan.kluKode.length === 0) !== (kegiatan.omzet <= 0)
      );
      if (barisBelumLengkap) {
        daftar.push({
          id: KOLOM.kegiatanTambahan,
          pesan: 'Ada kegiatan tambahan yang baru terisi sebagian. Lengkapi kegiatan dan uang masuknya, atau hapus barisnya.'
        });
      }
    }

    return daftar;
  };

  /** Menggulir ke kolom bermasalah, memfokuskannya, lalu menggetarkannya sebentar. */
  const sorotKolom = (idKolom: string) => {
    const elemen = document.getElementById(idKolom);
    elemen?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elemen?.focus({ preventScroll: true });
    setKolomBergetar(idKolom);
    window.setTimeout(() => setKolomBergetar(null), 600);
  };

  const lanjut = () => {
    setGalat(null);
    if (langkah === 5 && buktiBelumDisimpan) {
      setGalat('Ada bukti potong yang belum ditambahkan atau masih dibaca. Tekan “Tambahkan bukti potong” atau “Kosongkan isian” sebelum melihat hasil.');
      return;
    }

    setSudahMencoba(true);
    const masalah = periksaLangkah(langkah);
    if (masalah.length > 0) {
      setGalatKolom(Object.fromEntries(masalah.map((item) => [item.id, item.pesan])));
      setGalat(
        masalah.length === 1
          ? 'Ada satu isian yang belum lengkap. Kami sudah menandainya di bawah.'
          : `Ada ${masalah.length} isian yang belum lengkap. Kami sudah menandainya di bawah.`
      );
      sorotKolom(masalah[0].id);
      return;
    }

    setGalatKolom({});
    setSudahMencoba(false);

    if (langkah < jumlahLangkah - 1) {
      setArah('maju');
      setLangkah((nilai) => nilai + 1);
      return;
    }

    try {
      setHasilSiap(auditPajakMandiri({ profil, kreditPajak }));
      setGalat(null);
    } catch (kesalahan) {
      setGalat(
        kesalahan instanceof Error
          ? kesalahan.message
          : 'Data belum dapat diproses. Periksa kembali isian Anda.'
      );
    }
  };

  if (hasilSiap) {
    return <div ref={container} className="min-w-0" aria-busy="true">
      <PanelProses judul="Menyiapkan ringkasan Anda" keterangan="Hasil pemeriksaan, rincian angka, dan saran akan segera tampil." />
    </div>;
  }

  if (hasil) {
    return (
      <div ref={container} className="motion-result min-w-0 space-y-5">
        <KartuVonis hasil={hasil} />
        <button
          type="button"
          className="pressable w-full border border-line bg-white px-5 py-3.5 text-sm font-semibold hover:border-blue"
          onClick={() => setHasil(null)}
        >
          ← Ubah jawaban
        </button>
      </div>
    );
  }

  return (
    <div ref={container} className="min-w-0"><section className="overflow-hidden bg-white shadow-sheet" aria-labelledby="judul-form">
      <div className="border-b border-line px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-margin">
              Langkah {langkah + 1} dari {jumlahLangkah}
            </p>
            <h2 id="judul-form" tabIndex={-1} className="mt-1 font-display text-2xl font-semibold outline-none">
              {judulLangkah[langkah]}
            </h2>
          </div>
          <span className="font-mono text-xs font-semibold text-blue">
            {Math.round(((langkah + 1) / jumlahLangkah) * 100)}%
          </span>
        </div>
        <div className="mt-5 grid gap-1" style={{ gridTemplateColumns: `repeat(${jumlahLangkah}, minmax(0, 1fr))` }} aria-hidden="true">
          {judulLangkah.map((judul, nomor) => (
            <span key={judul} className="h-1 overflow-hidden bg-line">
              <span className={`block h-full bg-blue ${nomor <= langkah ? 'motion-progress' : 'scale-x-0'}`} />
            </span>
          ))}
        </div>
      </div>

      <div
        key={langkah}
        className={`min-h-[430px] px-5 py-7 sm:px-8 sm:py-9 ${arah === 'maju' ? 'motion-step-next' : 'motion-step-back'}`}
      >
        <PetunjukWaji {...petunjukLangkah[langkah]} />
        {langkah === 0 && (
          <fieldset>
            <legend className="text-xl font-semibold">Penghasilan tahun berapa yang ingin diperiksa?</legend>
            <p className="mt-2 text-sm leading-6 text-margin">
              Contoh: untuk laporan pajak atas penghasilan selama 2026, pilih 2026.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {basisAturan.tahunPajakDidukung.map((tahun: TahunPajak) => {
                const aktif = profil.tahunPajak === tahun;
                return (
                  <label
                    key={tahun}
                    className={`choice-control cursor-pointer border p-5 ${aktif ? 'border-blue bg-blue text-white' : 'border-line hover:border-blue/60'}`}
                  >
                    <input className="sr-only" type="radio" name="tahun-pajak" checked={aktif} onChange={() => ubah('tahunPajak', tahun)} />
                    <span className="font-display text-3xl font-semibold">{tahun}</span>
                    <span className="mt-2 block text-xs opacity-80">Tahun penghasilan</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-7 border-l-2 border-pending bg-paper px-4 py-3 text-xs leading-5 text-margin">
              <strong className="text-ink">Kenapa ditanyakan?</strong> Aturan berubah pada 22 April 2026 lewat
              PP 20/2026, dan tahun pajak 2025 punya ketentuan peralihan sendiri.
              {profil.tahunPajak === 2025 && <p className="mt-2 font-semibold">Nominal PPh Final 2025 tidak ditampilkan karena perlu pemeriksaan aturan historis. Perkiraan NPPN dan tarif umum tetap tersedia sesuai kelengkapan data.</p>}
            </div>
          </fieldset>
        )}

        {langkah === 1 && (
          <div className="space-y-7">
            <fieldset>
              <legend className="text-xl font-semibold">Dari pekerjaan apa Anda paling banyak mendapat uang?</legend>
              <p className="mt-2 text-sm leading-6 text-margin">
                Jika punya beberapa pekerjaan, pilih yang menghasilkan uang paling besar.
              </p>
              <div
                id={KOLOM.klu}
                tabIndex={-1}
                className={`mt-5 max-h-72 space-y-2 overflow-y-auto pr-1 outline-none ${kolomBergetar === KOLOM.klu ? 'motion-shake' : ''} ${galatKolom[KOLOM.klu] ? 'border-l-2 border-stamp pl-2' : ''}`}
              >
                {pilihanKlu.map((item) => {
                  const aktif = profil.kluKode === item.kluKode;
                  return (
                    <label
                      key={item.kluKode}
                      className={`choice-control flex cursor-pointer items-center justify-between gap-4 border px-4 py-3.5 ${aktif ? 'border-blue bg-blue/[0.06]' : 'border-line hover:border-blue/60'}`}
                    >
                      <input className="sr-only" type="radio" name="klu" checked={aktif} onChange={() => { ubah('kluKode', item.kluKode); bersihkanGalat(KOLOM.klu); }} />
                      <span>
                        <strong className="block text-sm font-semibold">{item.nama}</strong>
                        <span className="mt-1 block text-xs text-margin">
                          {item.alias.slice(0, 4).join(' · ')}
                        </span>
                      </span>
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-transform duration-200 ${aktif ? 'scale-110 border-blue bg-blue text-white' : 'border-line'}`}
                        aria-hidden="true"
                      >
                        {aktif ? '✓' : ''}
                      </span>
                    </label>
                  );
                })}
              </div>
              <label className={`choice-control mt-3 flex cursor-pointer items-start gap-3 border p-4 text-sm ${profil.kluKode === 'BELUM_DIDUKUNG' ? 'border-blue bg-blue/5' : 'border-line'}`}>
                <input type="radio" name="klu" className="mt-1 accent-blue" checked={profil.kluKode === 'BELUM_DIDUKUNG'} onChange={() => { ubah('kluKode', 'BELUM_DIDUKUNG'); bersihkanGalat(KOLOM.klu); }} />
                <span><strong className="block">Kegiatan saya belum tersedia atau saya belum yakin</strong><span className="mt-1 block text-xs leading-5 text-margin">Tidak perlu memilih kegiatan yang hanya mirip. Kelayakan dan Norma akan ditandai perlu dipastikan.</span></span>
              </label>
              {kluTerpilih && <KlasifikasiKegiatan klu={kluTerpilih} />}
              {sudahMencoba && galatKolom[KOLOM.klu] && (
                <p role="alert" className="motion-step-next mt-4 border-l-2 border-stamp bg-red-50 px-4 py-3 text-sm font-semibold text-stamp">
                  {galatKolom[KOLOM.klu]}
                </p>
              )}
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold">Bagaimana Anda menjalankannya?</legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                Aturan membedakan orang yang menjual keahliannya sendiri (<Istilah nama="pekerjaanBebas">pekerjaan bebas</Istilah>)
                dari orang yang menjalankan usaha dan mempekerjakan orang lain. Perbedaan ini menentukan boleh
                tidaknya <Istilah nama="pphFinal">tarif 0,5%</Istilah>.
              </p>
              <div className="space-y-2">
                {pilihanBentukKegiatan.map((item) => {
                  const aktif = profil.bentukKegiatan === item.nilai;
                  return (
                    <label
                      key={item.nilai}
                      className={`choice-control flex cursor-pointer items-start gap-3 border px-4 py-3 ${aktif ? 'border-blue bg-blue/[0.06]' : 'border-line hover:border-blue/60'}`}
                    >
                      <input className="sr-only" type="radio" name="bentuk-kegiatan" checked={aktif} onChange={() => ubah('bentukKegiatan', item.nilai)} />
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${aktif ? 'border-blue bg-blue text-white' : 'border-line'}`} aria-hidden="true">
                        {aktif && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span>
                        <strong className="block text-sm font-semibold">{item.judul}</strong>
                        <span className="mt-0.5 block text-xs leading-5 text-margin">{item.keterangan}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Di mana usaha Anda berjalan?</span>
              <span className="mb-2 block text-xs leading-5 text-margin">
                Persentase Norma berbeda menurut wilayah.
              </span>
              <select
                value={profil.wilayah}
                onChange={(e) => ubah('wilayah', e.target.value as KelompokWilayahKey)}
                className="w-full border border-line bg-white p-3.5 outline-none focus:border-blue"
              >
                {(Object.keys(basisAturan.kelompokWilayah) as KelompokWilayahKey[]).map((kunci) => (
                  <option key={kunci} value={kunci}>
                    {basisAturan.kelompokWilayah[kunci].nama}
                  </option>
                ))}
              </select>
              <span className="mt-1.5 block text-xs leading-5 text-margin">
                {basisAturan.kelompokWilayah[profil.wilayah].deskripsi}
              </span>
            </label>

            <p className="-mt-4 text-xs leading-5 text-margin">
              Penjelasan <Istilah nama="kelompokWilayah">kelompok wilayah</Istilah> dan{' '}
              <Istilah nama="norma">Norma</Istilah> tersedia bila diperlukan.
            </p>

            <fieldset>
              <legend className="text-lg font-semibold">Apakah Anda punya lebih dari satu jenis kegiatan?</legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                Misalnya jadi kreator konten sekaligus punya toko online. Bila ya, perkiraan Norma tidak bisa
                dihitung dari satu angka omzet gabungan.
              </p>
              <PilihanTiga
                nama="lebih-dari-satu"
                nilai={profil.punyaLebihDariSatuKegiatan}
                onChange={(nilai) => ubah('punyaLebihDariSatuKegiatan', nilai)}
                labelYa="Ya, lebih dari satu"
                labelTidak="Tidak, hanya satu"
              />
            </fieldset>
          </div>
        )}

        {langkah === 2 && (
          <div className="space-y-6">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Keadaan keluarga Anda</span>
              <span className="mb-2 block text-xs leading-5 text-margin">
                Dipakai untuk menentukan PTKP, yaitu bagian penghasilan yang tidak dikenai pajak.
              </span>
              <select
                value={profil.statusPtkp}
                onChange={(e) => {
                  const nilai = e.target.value as StatusPtkp;
                  // Keadaan keluarga menentukan jawaban mana yang mungkin pada
                  // langkah berikutnya. Jawaban lama yang menjadi mustahil
                  // diganti di sini, supaya pengguna tidak pernah membawa dua
                  // jawaban yang saling bertentangan ke langkah berikutnya.
                  if (pasanganMungkin(nilai).includes(profil.statusPerpajakanPasangan)) {
                    ubah('statusPtkp', nilai);
                  } else if (nilai.startsWith('TK/')) {
                    ubahBanyak({
                      statusPtkp: nilai,
                      statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
                      pasanganPunyaPenghasilan: undefined,
                      omzetPasanganThnSebelumnya: 0
                    });
                  } else {
                    ubahBanyak({
                      statusPtkp: nilai,
                      statusPerpajakanPasangan: 'TIDAK_YAKIN',
                      pasanganPunyaPenghasilan: 'tidak_yakin'
                    });
                  }
                }}
                className="w-full border border-line bg-white p-3.5 outline-none focus:border-blue"
              >
                {pilihanPtkp.map((pilihan) => (
                  <option key={pilihan.nilai} value={pilihan.nilai}>
                    {pilihan.label} ({pilihan.nilai})
                  </option>
                ))}
              </select>
            </label>

            <p className="-mt-4 text-xs leading-5 text-margin">
              Baca <Istilah nama="ptkp">PTKP</Istilah> dan <Istilah nama="tanggungan">tanggungan</Istilah> bila
              belum yakin memilih yang mana.
            </p>

            <InputRupiah
              label={`Total uang masuk dari usaha Anda selama ${profil.tahunPajak}`}
              nilai={profil.omzetPribadiTahunPajak}
              onChange={(nilai) => { ubah('omzetPribadiTahunPajak', nilai ?? 0); bersihkanGalat(KOLOM.omzetTahunIni); }}
              bantuan="Nama resminya omzet: semua uang masuk sebelum dipotong biaya usaha. Angka inilah yang dipakai menghitung pajak."
              idKolom={KOLOM.omzetTahunIni}
              galat={galatKolom[KOLOM.omzetTahunIni]}
              bergetar={kolomBergetar === KOLOM.omzetTahunIni}
            />

            <p className="-mt-4 text-xs leading-5 text-margin">
              Ini yang disebut <Istilah nama="peredaranBruto">peredaran bruto</Istilah> dalam bahasa aturan pajak.
            </p>

            {profil.punyaLebihDariSatuKegiatan === true && (
              <fieldset
                id={KOLOM.kegiatanTambahan}
                tabIndex={-1}
                className={`border border-line p-4 outline-none ${kolomBergetar === KOLOM.kegiatanTambahan ? 'motion-shake' : ''} ${galatKolom[KOLOM.kegiatanTambahan] ? 'border-stamp' : ''}`}
              >
                <legend className="px-1 text-sm font-semibold">Kegiatan Anda yang lain</legend>
                <p className="mb-4 text-xs leading-5 text-margin">
                  Persentase <Istilah nama="norma">Norma</Istilah> berbeda untuk tiap kegiatan, jadi tiap kegiatan
                  dihitung sendiri lalu dijumlahkan. Isi kegiatan selain yang sudah Anda pilih di langkah pekerjaan.
                </p>

                <div className="space-y-4">
                  {(profil.kegiatanTambahan ?? []).map((kegiatan, urutan) => (
                    <div key={urutan} className="border border-line bg-paper/60 p-3">
                      <label className="block">
                        <span className="mb-1 block text-xs font-semibold">Kegiatan {urutan + 2}</span>
                        <select
                          value={kegiatan.kluKode}
                          onChange={(e) => {
                            const daftar = [...(profil.kegiatanTambahan ?? [])];
                            daftar[urutan] = { ...daftar[urutan], kluKode: e.target.value };
                            ubah('kegiatanTambahan', daftar);
                            bersihkanGalat(KOLOM.kegiatanTambahan);
                          }}
                          className="w-full border border-line bg-white p-3 text-sm outline-none focus:border-blue"
                        >
                          <option value="">— pilih kegiatan —</option>
                          {pilihanKlu
                            .filter((item) => item.kluKode === kegiatan.kluKode || (item.kluKode !== profil.kluKode && !(profil.kegiatanTambahan ?? []).some((lain, i) => i !== urutan && lain.kluKode === item.kluKode)))
                            .map((item) => (
                              <option key={item.kluKode} value={item.kluKode}>{item.nama}</option>
                            ))}
                        </select>
                      </label>

                      <div className="mt-3">
                        <InputRupiah
                          label={`Uang masuk kegiatan ini selama ${profil.tahunPajak}`}
                          nilai={kegiatan.omzet}
                          onChange={(nilai) => {
                            const daftar = [...(profil.kegiatanTambahan ?? [])];
                            daftar[urutan] = { ...daftar[urutan], omzet: nilai ?? 0 };
                            ubah('kegiatanTambahan', daftar);
                            bersihkanGalat(KOLOM.kegiatanTambahan);
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          ubah('kegiatanTambahan', (profil.kegiatanTambahan ?? []).filter((_, i) => i !== urutan));
                          bersihkanGalat(KOLOM.kegiatanTambahan);
                        }}
                        className="mt-3 text-xs font-semibold text-stamp hover:underline"
                      >
                        Hapus kegiatan ini
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    ubah('kegiatanTambahan', [...(profil.kegiatanTambahan ?? []), { kluKode: '', omzet: 0 }]);
                    bersihkanGalat(KOLOM.kegiatanTambahan);
                  }}
                  disabled={(profil.kegiatanTambahan ?? []).length >= 9}
                  className="mt-4 border border-blue px-4 py-2.5 text-sm font-semibold text-blue hover:bg-blue/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + Tambah kegiatan
                </button>

                {galatKolom[KOLOM.kegiatanTambahan] && (
                  <p role="alert" className="mt-3 border-l-2 border-stamp bg-red-50 px-3 py-2 text-xs font-semibold text-stamp">
                    {galatKolom[KOLOM.kegiatanTambahan]}
                  </p>
                )}
              </fieldset>
            )}

            <InputRupiah
              label="Total biaya usaha selama setahun"
              nilai={profil.biayaOperasionalRiil}
              onChange={(nilai) => ubah('biayaOperasionalRiil', nilai)}
              bantuan="Sewa, bahan, listrik, alat, dan biaya lain yang benar-benar Anda keluarkan untuk usaha. Kosongkan bila belum punya catatannya."
              bolehKosong
            />

            <label className="flex cursor-pointer items-start gap-3 border border-line p-4 hover:border-blue/60">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 accent-blue"
                checked={profil.jugaPegawaiTetap}
                onChange={(e) => ubah('jugaPegawaiTetap', e.target.checked)}
              />
              <span>
                <strong className="block text-sm font-semibold">Saya juga menerima gaji sebagai pegawai tetap</strong>
                <span className="mt-1 block text-xs leading-5 text-margin">
                  Gaji dan penghasilan usaha dilaporkan bersama dalam satu SPT Tahunan.
                </span>
              </span>
            </label>
            {profil.jugaPegawaiTetap && (
              <InputRupiah
                label="Penghasilan neto gaji setahun"
                nilai={profil.penghasilanNetoPegawai}
                onChange={(nilai) => { ubah('penghasilanNetoPegawai', nilai); bersihkanGalat(KOLOM.netoPegawai); }}
                bolehKosong
                bantuan="Salin penghasilan neto dari bukti potong pegawai (A1/A2), sebelum PTKP. Jumlahkan bila ada beberapa pemberi kerja. Jangan isi gaji bruto. Kredit PPh 21 diisi pada langkah bukti potong."
                idKolom={KOLOM.netoPegawai}
                galat={galatKolom[KOLOM.netoPegawai]}
                bergetar={kolomBergetar === KOLOM.netoPegawai}
              />
            )}
            {profil.jugaPegawaiTetap && (
              <p className="-mt-4 text-xs leading-5 text-margin">
                Belum paham? Baca <Istilah nama="buktiPotongA1">bukti potong A1 dan A2</Istilah>,{' '}
                <Istilah nama="penghasilanNeto">penghasilan neto</Istilah>, serta{' '}
                <Istilah nama="pph21">PPh 21</Istilah>.
              </p>
            )}
          </div>
        )}

        {langkah === 3 && (
          <div className="space-y-6">
            <div className="border-l-2 border-blue bg-paper px-4 py-3 text-xs leading-5 text-margin">
              <strong className="text-ink">Kenapa tahun sebelumnya?</strong> Batas Rp4,8 miliar diukur dari{' '}
              <Istilah nama="peredaranBruto">peredaran bruto</Istilah> tahun pajak terakhir sebelum tahun yang
              Anda periksa, bukan tahun berjalan.
            </div>

            <InputRupiah
              label={`Total uang masuk usaha Anda selama ${profil.tahunPajak - 1}`}
              nilai={profil.omzetPribadiThnSebelumnya}
              onChange={(nilai) => ubah('omzetPribadiThnSebelumnya', nilai ?? 0)}
              bantuan="Isi 0 bila tahun itu Anda belum berusaha."
            />

            <fieldset>
              <legend className="text-lg font-semibold">
                {profil.statusPtkp.startsWith('TK/')
                  ? 'Apakah Anda pernah berpisah menurut putusan hakim?'
                  : 'Bagaimana Anda dan pasangan melapor pajak?'}
              </legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                {profil.statusPtkp.startsWith('TK/')
                  ? 'Pada langkah sebelumnya Anda menjawab belum kawin, jadi tidak ada omzet pasangan yang perlu digabungkan. Pilihan ini hanya untuk membedakan perpisahan yang sudah diputus pengadilan.'
                  : 'Pada langkah sebelumnya Anda menjawab sudah kawin. Untuk sebagian keadaan, omzet suami dan istri digabungkan saat menguji batas Rp4,8 miliar.'}{' '}
                Salah satu pilihannya disebut <Istilah nama="pisahHarta">pisah harta</Istilah>, dan batas yang
                diuji adalah <Istilah nama="ambang">batas Rp4,8 miliar</Istilah>.
              </p>
              <div className="space-y-2">
                {pilihanPasangan.filter((item) => pasanganMungkin(profil.statusPtkp).includes(item.nilai)).map((item) => {
                  const aktif = profil.statusPerpajakanPasangan === item.nilai;
                  return (
                    <label
                      key={item.nilai}
                      className={`choice-control flex cursor-pointer items-start gap-3 border px-4 py-3 ${aktif ? 'border-blue bg-blue/[0.06]' : 'border-line hover:border-blue/60'}`}
                    >
                      <input className="sr-only" type="radio" name="status-pasangan" checked={aktif} onChange={() => ubahBanyak({
                        statusPerpajakanPasangan: item.nilai,
                        // Bila omzet pasangan tidak pernah digabungkan, jawaban
                        // penghasilan pasangan dan omzetnya ikut dikosongkan agar
                        // tidak ada angka usang yang terbawa ke hasil dan PDF.
                        pasanganPunyaPenghasilan: tanpaPenggabungan(item.nilai)
                          ? undefined
                          : profil.pasanganPunyaPenghasilan ?? 'tidak_yakin',
                        omzetPasanganThnSebelumnya: tanpaPenggabungan(item.nilai) ? 0 : profil.omzetPasanganThnSebelumnya
                      })} />
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${aktif ? 'border-blue bg-blue text-white' : 'border-line'}`} aria-hidden="true">
                        {aktif && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      <span>
                        <strong className="block text-sm font-semibold">{item.judul}</strong>
                        <span className="mt-0.5 block text-xs leading-5 text-margin">{item.keterangan}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Berpisah menurut putusan hakim adalah satu-satunya keadaan berpasangan
                yang omzetnya tidak pernah digabungkan, jadi tidak perlu ditanyakan. */}
            {profil.statusPerpajakanPasangan !== 'TIDAK_ADA_PASANGAN' &&
              profil.statusPerpajakanPasangan !== 'PISAH_PUTUSAN_HAKIM' && (
              <>
                <fieldset>
                  <legend className="text-lg font-semibold">Apakah pasangan Anda punya penghasilan sendiri?</legend>
                  <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                    Termasuk gaji, usaha, maupun pekerjaan bebas. Bila pasangan tidak berpenghasilan, tidak ada
                    penghasilan yang perlu digabungkan, sehingga perkiraan pajak Anda dapat langsung dihitung.
                  </p>
                  <PilihanTiga
                    nama="penghasilan-pasangan"
                    nilai={profil.pasanganPunyaPenghasilan ?? 'tidak_yakin'}
                    onChange={(nilai) => ubahBanyak({
                      pasanganPunyaPenghasilan: nilai,
                      // Menjawab "tidak punya" sekaligus menyisakan omzet pasangan akan ditolak validasi.
                      omzetPasanganThnSebelumnya: nilai === false ? 0 : profil.omzetPasanganThnSebelumnya
                    })}
                    labelYa="Punya"
                    labelTidak="Tidak punya"
                  />
                </fieldset>

                {profil.pasanganPunyaPenghasilan !== false && (
                  <InputRupiah
                    label={`Total uang masuk usaha pasangan selama ${profil.tahunPajak - 1}`}
                    nilai={profil.omzetPasanganThnSebelumnya}
                    onChange={(nilai) => ubah('omzetPasanganThnSebelumnya', nilai ?? 0)}
                    bantuan="Isi 0 jika pasangan berpenghasilan tetapi tidak punya usaha, misalnya hanya menerima gaji."
                  />
                )}
              </>
            )}

            <div>
              <InputRupiah
                label={`Total uang masuk seluruh PT Perorangan selama ${profil.tahunPajak - 1}`}
                nilai={profil.omzetSeluruhPerseroanPeroranganThnSebelumnya}
                onChange={(nilai) => ubah('omzetSeluruhPerseroanPeroranganThnSebelumnya', nilai ?? 0)}
                bantuan="Jumlahkan semua PT Perorangan yang Anda, dan pasangan Anda, dirikan. Isi 0 bila tidak punya."
              />
              <p className="mt-1.5 text-xs leading-5 text-margin">
                Belum tahu maksudnya? Baca <Istilah nama="ptPerorangan">PT Perorangan</Istilah> dan{' '}
                <Istilah nama="ambang">batas Rp4,8 miliar</Istilah>.
              </p>
            </div>
          </div>
        )}

        {langkah === 4 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-lg font-semibold">Sebelum {profil.tahunPajak - 1}, pernahkah omzet Anda melewati Rp4,8 miliar dalam setahun?</legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">Riwayat tahun yang lebih lama dapat memengaruhi hak PPh Final. Pilih Tidak yakin bila catatannya belum lengkap.</p>
              <PilihanTiga nama="riwayat-ambang" nilai={profil.pernahMelewatiAmbang ?? 'tidak_yakin'} onChange={(nilai) => ubah('pernahMelewatiAmbang', nilai)} labelYa="Pernah" labelTidak="Belum pernah" />
            </fieldset>
            <fieldset>
              <legend className="text-lg font-semibold">
                Sudahkah Anda memberitahukan penggunaan Norma untuk tahun {profil.tahunPajak} tepat waktu?
              </legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                <Istilah nama="norma">Norma atau NPPN</Istilah> adalah cara memperkirakan penghasilan bersih memakai persentase resmi.
                Pemberitahuannya disampaikan ke <Istilah nama="djp">DJP</Istilah> lewat layanan{' '}
                {basisAturan.parameterPajak.nppn.batasWaktuPemberitahuan.layananCoretax} di{' '}
                <Istilah nama="coretax">Coretax</Istilah>, paling lambat 31 Maret tahun pajak yang bersangkutan.
                Jika baru mendengar istilah ini, pilih “Tidak yakin”.
              </p>
              <PilihanTiga
                nama="lapor-norma"
                nilai={profil.sudahMemberitahukanNppn}
                onChange={(nilai) => ubah('sudahMemberitahukanNppn', nilai)}
                labelYa="Sudah, tepat waktu"
                labelTidak="Belum / terlambat"
              />
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold">
                Pernahkah Anda memilih pajak dihitung dari keuntungan bersih sebenarnya?
              </legend>
              <p className="mb-4 mt-1 text-xs leading-5 text-margin">
                Nama resminya “tarif umum Pasal 17”. Pilihan itu wajib diberitahukan ke DJP dan menutup tarif
                0,5% untuk tahun-tahun berikutnya. Jika tidak ingat, pilih “Tidak yakin”.
              </p>
              <PilihanTiga
                nama="tarif-umum"
                nilai={profil.pernahPilihTarifUmum}
                onChange={(nilai) => ubah('pernahPilihTarifUmum', nilai)}
                labelYa="Pernah"
                labelTidak="Belum pernah"
              />
            </fieldset>
          </div>
        )}

        {langkah === 5 && <InputBuktiPotong daftar={kreditPajak} onChange={setKreditPajak} onPendingChange={setBuktiBelumDisimpan} />}
      </div>

      {galat && (
        <p role="alert" className="mx-5 mb-4 border-l-2 border-stamp bg-red-50 px-4 py-3 text-sm font-semibold text-stamp sm:mx-8">
          {galat}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-line bg-paper/60 px-5 py-5 sm:px-8">
        {langkah > 0 && (
          <button
            type="button"
            onClick={() => {
              if (buktiBelumDisimpan) { setGalat('Tambahkan atau kosongkan isian bukti potong sebelum kembali.'); return; }
              setGalat(null);
              setSudahMencoba(false);
              setArah('mundur');
              setLangkah((nilai) => nilai - 1);
            }}
            className="pressable min-h-12 border border-line bg-white px-5 text-sm font-semibold hover:border-blue"
          >
            Kembali
          </button>
        )}
        <button
          type="button"
          onClick={lanjut}
          className="pressable ml-auto min-h-12 bg-blue px-6 text-sm font-semibold text-white shadow-lift hover:bg-ink"
        >
          {langkah === jumlahLangkah - 1 ? 'Lihat hasil pengecekan' : 'Lanjutkan'}{' '}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section></div>
  );
}
