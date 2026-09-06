import { z } from 'zod';

/**
 * Skema validasi masukan. Dipakai formulir dan orkestrator
 * `auditPajakMandiri` sebelum satu pun aturan dievaluasi.
 */

const uang = z
  .number({ invalid_type_error: 'Isi dengan angka rupiah tanpa titik atau huruf.' })
  .finite('Isi dengan angka rupiah yang wajar.')
  .nonnegative('Nilai rupiah tidak boleh negatif.')
  .max(999_999_999_999_999, 'Nilai rupiah terlalu besar untuk diproses.');

const jawabanKepatuhan = z.union([z.boolean(), z.literal('tidak_yakin')], {
  errorMap: () => ({ message: 'Pilih salah satu jawaban, termasuk “Tidak yakin”.' })
});

export const profilWajibPajakSchema = z.object({
  tahunPajak: z.union([z.literal(2025), z.literal(2026)], {
    errorMap: () => ({ message: 'Pilih tahun pajak 2025 atau 2026.' })
  }),
  kluKode: z.string().min(1, 'Pilih profesi atau kegiatan usaha.'),
  wilayah: z.enum(['kelompok1', 'kelompok2', 'kelompok3'], {
    errorMap: () => ({ message: 'Pilih kelompok wilayah tempat Anda berusaha.' })
  }),
  statusPtkp: z.enum(['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'], {
    errorMap: () => ({ message: 'Pilih keadaan keluarga yang tersedia.' })
  }),
  bentukKegiatan: z.enum(['PEKERJAAN_BEBAS', 'USAHA_JASA', 'USAHA_DAGANG', 'BELUM_PASTI'], {
    errorMap: () => ({ message: 'Pilih cara Anda menjalankan kegiatan.' })
  }),
  statusPerpajakanPasangan: z.enum(
    [
      'TIDAK_ADA_PASANGAN',
      'GABUNG',
      'PISAH_HARTA',
      'PISAH_KEWAJIBAN',
      'PISAH_PUTUSAN_HAKIM',
      'TIDAK_YAKIN'
    ],
    { errorMap: () => ({ message: 'Pilih cara Anda dan pasangan melapor pajak.' }) }
  ),
  punyaLebihDariSatuKegiatan: jawabanKepatuhan,

  omzetPribadiTahunPajak: uang,
  biayaOperasionalRiil: uang.optional(),

  omzetPribadiThnSebelumnya: uang,
  omzetPasanganThnSebelumnya: uang,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: uang,

  sudahMemberitahukanNppn: jawabanKepatuhan,
  pernahPilihTarifUmum: jawabanKepatuhan,
  jugaPegawaiTetap: z.boolean(),
  penghasilanNetoPegawai: uang.optional(),
  pernahMelewatiAmbang: jawabanKepatuhan.optional(),
  pasanganPunyaPenghasilan: jawabanKepatuhan.optional(),
  pasanganHanyaGajiSatuPemberiKerja: jawabanKepatuhan.optional(),
  penghasilanNetoPasangan: uang.optional(),
  peranDalamKeluarga: z.enum(['SUAMI', 'ISTRI']).optional(),
  kegiatanTambahan: z
    .array(
      z.object({
        kluKode: z.string().min(1, 'Pilih kegiatannya atau hapus baris ini.'),
        omzet: uang
      })
    )
    .max(9, 'Maksimal sepuluh kegiatan, termasuk kegiatan utama.')
    .optional()
}).superRefine((profil, ctx) => {
  const tambahan = profil.kegiatanTambahan ?? [];

  // Menyatakan hanya satu kegiatan sambil merinci kegiatan lain adalah dua
  // jawaban yang bertentangan; uji ambang dan Norma akan memakai premis berbeda.
  if (profil.punyaLebihDariSatuKegiatan === false && tambahan.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['kegiatanTambahan'],
      message:
        'Anda menjawab hanya punya satu kegiatan, tetapi masih ada kegiatan tambahan yang terisi. Hapus kegiatan tambahannya, atau ubah jawaban menjadi lebih dari satu kegiatan.'
    });
  }

  // Kegiatan yang sama dicatat dua kali membuat omzetnya terbaca ganda.
  const kode = [profil.kluKode, ...tambahan.map((kegiatan) => kegiatan.kluKode)].filter(Boolean);
  const terlihat = new Set<string>();
  for (const [urutan, satu] of kode.entries()) {
    if (terlihat.has(satu)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['kegiatanTambahan', Math.max(0, urutan - 1), 'kluKode'],
        message: 'Kegiatan ini sudah dicatat. Jumlahkan omzetnya pada satu baris saja.'
      });
      break;
    }
    terlihat.add(satu);
  }
  // Menjawab "tidak punya" sekaligus mengisi omzet pasangan membuat uji ambang
  // Pasal 58 dan perhitungan keluarga memakai dua premis yang bertentangan.
  if (profil.pasanganPunyaPenghasilan === false && profil.omzetPasanganThnSebelumnya > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['omzetPasanganThnSebelumnya'],
      message:
        'Anda menjawab pasangan tidak punya penghasilan, tetapi omzet pasangan masih terisi. Kosongkan omzetnya, atau ubah jawaban menjadi pasangan punya penghasilan.'
    });
  }
  // Tidak ada pasangan berarti tidak ada pertanyaan penghasilan pasangan.
  if (profil.statusPerpajakanPasangan === 'TIDAK_ADA_PASANGAN' && profil.pasanganPunyaPenghasilan !== undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pasanganPunyaPenghasilan'],
      message: 'Jawaban penghasilan pasangan tidak berlaku bila Anda menjawab tidak punya pasangan.'
    });
  }
});

/**
 * Bukti potong. Berlaku sama untuk isian manual maupun hasil pembacaan OCR,
 * sehingga jalur manual tidak pernah bergantung pada layanan luar.
 */
export const kreditPajakItemSchema = z.object({
  nomorBuktiPotong: z.string().trim().max(60, 'Nomor bukti potong terlalu panjang.'),
  pemotong: z.string().trim().max(120, 'Nama pemotong terlalu panjang.'),
  penghasilanBruto: uang,
  pphDipotong: uang,
  sumber: z.enum(['MANUAL', 'OCR'])
});

const catatanInvestasi = {
  id: z.string().min(1).max(80),
  nama: z.string().trim().min(1, 'Isi nama bank, broker, atau pemberi dividen.').max(120),
  pemilik: z.enum(['ANDA', 'PASANGAN']),
  bruto: uang.optional(),
  pajakDibayar: uang.optional(),
  nomorBukti: z.string().trim().max(100).optional()
};

export const penghasilanInvestasiSchema = z.discriminatedUnion('jenis', [
  z.object({ ...catatanInvestasi, jenis: z.literal('DEPOSITO'), simpananBiasa: jawabanKepatuhan, totalSimpanan: uang.optional(), tidakDipecah: jawabanKepatuhan }),
  z.object({ ...catatanInvestasi, jenis: z.literal('SAHAM_BURSA'), sahamBursaIndonesiaNonPendiri: jawabanKepatuhan }),
  z.object({ ...catatanInvestasi, jenis: z.literal('DIVIDEN_DN'), dividenResmiDalamNegeri: jawabanKepatuhan, reinvestasi: z.enum(['TIDAK', 'MEMENUHI', 'BELUM_PASTI']), jumlahReinvestasi: uang.optional() })
]);

export const inputAuditPajakSchema = z.object({
  profil: profilWajibPajakSchema,
  kreditPajak: z.array(kreditPajakItemSchema).max(50, 'Maksimal 50 bukti potong per pemeriksaan.'),
  penghasilanInvestasi: z.array(penghasilanInvestasiSchema).max(30, 'Maksimal 30 catatan investasi.').optional()
}).superRefine(({ kreditPajak, penghasilanInvestasi }, ctx) => {
  const nomor = new Set<string>();
  kreditPajak.forEach((item, index) => {
    const kode = item.nomorBuktiPotong.replace(/\s/g, '').toUpperCase();
    if (kode && nomor.has(kode)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['kreditPajak', index, 'nomorBuktiPotong'], message: 'Bukti potong dengan nomor ini sudah ditambahkan.' });
    if (kode) nomor.add(kode);
  });
  const ids = new Set<string>();
  const buktiFinal = new Set<string>();
  (penghasilanInvestasi ?? []).forEach((item, index) => {
    const kode = item.nomorBukti?.replace(/\s/g, '').toUpperCase();
    if (ids.has(item.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['penghasilanInvestasi', index], message: 'Catatan investasi duplikat.' });
    ids.add(item.id);
    if (kode && (nomor.has(kode) || buktiFinal.has(kode))) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['penghasilanInvestasi', index, 'nomorBukti'], message: 'Bukti investasi sudah dicatat. Potongan final tidak boleh dicatat ulang sebagai kredit nonfinal.' });
    if (kode) buktiFinal.add(kode);
    if (item.jenis === 'DIVIDEN_DN' && item.reinvestasi === 'MEMENUHI' && item.bruto !== undefined && item.jumlahReinvestasi !== undefined && item.jumlahReinvestasi > item.bruto) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['penghasilanInvestasi', index, 'jumlahReinvestasi'], message: 'Bagian reinvestasi tidak boleh melebihi dividen bruto.' });
  });
});

/** Bentuk jawaban terstruktur yang boleh dikembalikan layanan OCR. */
export const hasilBupotOcrSchema = z.object({
  nomorBuktiPotong: z.string().max(60),
  pemotong: z.string().max(120),
  tanggal: z.string().max(32),
  penghasilanBruto: uang,
  pphDipotong: uang
});

export type ProfilWajibPajakInput = z.infer<typeof profilWajibPajakSchema>;
export type InputAuditPajakInput = z.infer<typeof inputAuditPajakSchema>;
export type HasilBupotOcr = z.infer<typeof hasilBupotOcrSchema>;
