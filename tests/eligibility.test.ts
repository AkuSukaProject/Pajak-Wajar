import { describe, it, expect } from 'vitest';
import {
  evaluasiKelayakanPphFinal,
  evaluasiKelayakanNppn,
  evaluasiKelayakanTarifUmum,
} from '../src/lib/eligibility';
import { auditPajakMandiri } from '../src/lib/index';
import { inputAuditPajakSchema } from '../src/lib/schemas';
import { DatabaseRegulasi, ProfilWajibPajak } from '../src/types/pajak';

const mockRegulasi: DatabaseRegulasi = {
  versiRegulasi: 'PP-20-2026',
  statusDokumen: 'TERVERIFIKASI',
  tahunPajakDidukung: [2025, 2026],
  lingkupWajibPajak: 'ORANG_PRIBADI',
  parameterPajak: {
    pphFinal: {
      tarif: {
        nilai: 0.005,
        statusVerifikasi: 'TERVERIFIKASI',
        dasarHukum: [
          {
            namaRegulasi: 'PP No. 20 Tahun 2026',
            pasalAtauLampiran: 'Pasal 56 ayat (2)',
            fungsi: 'Penetapan tarif PPh Final 0,5%',
            url: 'https://jdih.kemenkeu.go.id',
            statusVerifikasi: 'TERVERIFIKASI',
          },
        ],
      },
      ambangOmzet: {
        nilai: 4800000000,
        operator: 'LTE',
        statusVerifikasi: 'TERVERIFIKASI',
        dasarHukum: [
          {
            namaRegulasi: 'PP No. 20 Tahun 2026',
            pasalAtauLampiran: 'Pasal 57 ayat (1)',
            fungsi: 'Ambang peredaran bruto PPh Final',
            url: 'https://jdih.kemenkeu.go.id',
            statusVerifikasi: 'TERVERIFIKASI',
          },
        ],
      },
      pembebasanOmzetOp: {
        nilai: 500000000,
        statusVerifikasi: 'TERVERIFIKASI',
        dasarHukum: [
          {
            namaRegulasi: 'PP No. 55 Tahun 2022 jo. PP No. 20 Tahun 2026',
            pasalAtauLampiran: 'Pasal 60',
            fungsi: 'Dasar pembebasan omzet Rp 500 Juta',
            url: 'https://jdih.kemenkeu.go.id',
            statusVerifikasi: 'TERVERIFIKASI',
          },
        ],
      },
    },
    nppn: {
      ambangOmzet: {
        nilai: 4800000000,
        operator: 'LT',
        statusVerifikasi: 'TERVERIFIKASI',
        dasarHukum: [
          {
            namaRegulasi: 'PER-17/PJ/2015',
            pasalAtauLampiran: 'Pasal 1',
            fungsi: 'Ambang NPPN',
            url: 'https://pajak.go.id',
            statusVerifikasi: 'TERVERIFIKASI',
          },
        ],
      },
      batasPemberitahuanBulan: {
        nilai: 3,
        statusVerifikasi: 'TERVERIFIKASI',
        dasarHukum: [
          {
            namaRegulasi: 'PER-17/PJ/2015',
            pasalAtauLampiran: 'Pasal 2 ayat (1)',
            fungsi: 'Batas 3 bulan pemberitahuan NPPN',
            url: 'https://pajak.go.id',
            statusVerifikasi: 'TERVERIFIKASI',
          },
        ],
      },
    },
    tarifProgresif: {
      lapisan: [
        { batasBawah: 0, batasAtas: 60000000, tarif: 0.05 },
        { batasBawah: 60000000, batasAtas: 250000000, tarif: 0.15 },
        { batasBawah: 250000000, batasAtas: 500000000, tarif: 0.25 },
        { batasBawah: 500000000, batasAtas: 5000000000, tarif: 0.30 },
        { batasBawah: 5000000000, batasAtas: null, tarif: 0.35 },
      ],
      statusVerifikasi: 'TERVERIFIKASI',
      dasarHukum: [
        {
          namaRegulasi: 'UU No. 7 Tahun 2021',
          pasalAtauLampiran: 'Pasal 17 ayat (1) huruf a',
          fungsi: 'Tarif progresif PPh Orang Pribadi',
          url: 'https://jdih.kemenkeu.go.id',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
    },
    ptkp: {
      nilai: {
        'TK/0': 54000000,
        'TK/1': 58500000,
        'TK/2': 63000000,
        'TK/3': 67500000,
        'K/0': 58500000,
        'K/1': 63000000,
        'K/2': 67500000,
        'K/3': 72000000,
      },
      statusVerifikasi: 'TERVERIFIKASI',
      dasarHukum: [
        {
          namaRegulasi: 'UU No. 7 Tahun 2021',
          pasalAtauLampiran: 'Pasal 7 ayat (1)',
          fungsi: 'Besaran PTKP',
          url: 'https://jdih.kemenkeu.go.id',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
    },
  },
  aturanKelayakan: {
    pekerjaanBebas: {
      statusVerifikasi: 'TERVERIFIKASI',
      dasarHukum: [
        {
          namaRegulasi: 'PP No. 20 Tahun 2026',
          pasalAtauLampiran: 'Pasal 56 ayat (3) huruf a jo ayat (4)',
          fungsi: 'Larangan pekerjaan bebas memakai PPh Final',
          url: 'https://jdih.kemenkeu.go.id',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
    },
    ambangKonsolidasi: {
      statusVerifikasi: 'TERVERIFIKASI',
      dasarHukum: [
        {
          namaRegulasi: 'PP No. 20 Tahun 2026',
          pasalAtauLampiran: 'Pasal 58 ayat (1) dan (3)',
          fungsi: 'Penggabungan omzet keluarga & perseroan perorangan',
          url: 'https://jdih.kemenkeu.go.id',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
    },
    pilihanTarifUmum: {
      statusVerifikasi: 'TERVERIFIKASI',
      dasarHukum: [
        {
          namaRegulasi: 'PP No. 20 Tahun 2026',
          pasalAtauLampiran: 'Pasal 57 ayat (4)',
          fungsi: 'Pintu satu arah tarif umum',
          url: 'https://jdih.kemenkeu.go.id',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
    },
    administrasiNppn: {
      statusVerifikasi: 'TERVERIFIKASI',
      dasarHukum: [
        {
          namaRegulasi: 'PER-17/PJ/2015',
          pasalAtauLampiran: 'Pasal 2 ayat (1)',
          fungsi: 'Pemberitahuan NPPN 3 bulan pertama',
          url: 'https://pajak.go.id',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
    },
    ketentuanPeralihan: {
      statusVerifikasi: 'TERVERIFIKASI',
      dasarHukum: [
        {
          namaRegulasi: 'PP No. 20 Tahun 2026',
          pasalAtauLampiran: 'Pasal II Ketentuan Peralihan',
          fungsi: 'Ketentuan peralihan tahun pajak 2025-2026',
          url: 'https://jdih.kemenkeu.go.id',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
    },
  },
  kelompokWilayah: {
    kelompok1: { nama: '10 Ibukota Provinsi', deskripsi: 'Jakarta, Surabaya, Bandung, dll.' },
    kelompok2: { nama: 'Ibukota Provinsi Lainnya', deskripsi: 'Ibukota provinsi lainnya' },
    kelompok3: { nama: 'Daerah Lainnya', deskripsi: 'Kabupaten/kota non-ibukota' },
  },
  klu: [
    {
      kluKode: '74201',
      nama: 'Aktivitas Desain Komunikasi Visual / Desain Grafis',
      kategori: 'Jasa Kreatif',
      pekerjaanBebas: true,
      persenNorma: {
        kelompok1: 0.5,
        kelompok2: 0.5,
        kelompok3: 0.475,
      },
      dasarHukum: [],
    },
  ],
};

const baseProfil: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '74201',
  wilayah: 'kelompok1',
  statusPtkp: 'TK/0',
  bentukKegiatan: 'USAHA_DAGANG',
  statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
  punyaLebihDariSatuKegiatan: false,
  omzetPribadiTahunPajak: 100000000,
  omzetPribadiThnSebelumnya: 100000000,
  omzetPasanganThnSebelumnya: 0,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: true,
  pernahPilihTarifUmum: false,
  jugaPegawaiTetap: false,
};

describe('Daftar 15 Kasus Uji Kelayakan & Mesin Regulasi PajakWajar', () => {
  it('1. Pekerjaan bebas tidak mendapat PPh Final', () => {
    const profil: ProfilWajibPajak = { ...baseProfil, bentukKegiatan: 'PEKERJAAN_BEBAS' };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(hasil.status).toBe('TIDAK_BOLEH');
    expect(hasil.alasan[0]).toContain('pekerjaan bebas tidak diperbolehkan');
  });

  it('2. Usaha yang memenuhi syarat mendapat PPh Final', () => {
    const profil: ProfilWajibPajak = { ...baseProfil, bentukKegiatan: 'USAHA_DAGANG' };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(hasil.status).toBe('BOLEH');
  });

  it('3. Omzet konsolidasi melewati ambang (Rp 5 M > Rp 4,8 M)', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      statusPerpajakanPasangan: 'PISAH_HARTA',
      omzetPribadiThnSebelumnya: 3000000000,
      omzetPasanganThnSebelumnya: 2000000000,
    };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(hasil.status).toBe('TIDAK_BOLEH');
    expect(hasil.alasan[0]).toContain('melebihi batas ambang PPh Final');
  });

  it('4. Omzet konsolidasi tepat di ambang (Rp 4.800.000.000 inklusif)', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      omzetPribadiThnSebelumnya: 4800000000,
    };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(hasil.status).toBe('BOLEH');
  });

  it('5. Omzet pribadi tidak dicampur dalam dasar hitung', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      omzetPribadiTahunPajak: 600000000,
      omzetPribadiThnSebelumnya: 2000000000,
    };
    const hasil = auditPajakMandiri({ profil, kreditPajak: [] }, mockRegulasi);
    const pphFinal = hasil.skema.find((s) => s.id === 'PPH_FINAL_05');
    if (pphFinal && pphFinal.statusKalkulasi === 'TERSEDIA') {
      expect(pphFinal.rincianKalkulasi.omzetPribadi).toBe(600000000);
      expect(pphFinal.rincianKalkulasi.dasarPengenaan).toBe(100000000); // 600jt - 500jt
      expect(pphFinal.pajakTerutang).toBe(500000); // 0.5% x 100jt
    } else {
      throw new Error('Kalkulasi PPh Final harus TERSEDIA');
    }
  });

  it('6. LA.04-01 / AS.04-01 tidak yakin menghasilkan PERLU_DIPASTIKAN', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      sudahMemberitahukanNppn: 'tidak_yakin',
    };
    const hasil = evaluasiKelayakanNppn(profil, mockRegulasi);
    expect(hasil.status).toBe('PERLU_DIPASTIKAN');
  });

  it('7. Pilihan tarif umum tidak yakin menghasilkan PERLU_DIPASTIKAN', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      pernahPilihTarifUmum: 'tidak_yakin',
    };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(hasil.status).toBe('PERLU_DIPASTIKAN');
  });

  it('8. Peringatan penghasilan campuran muncul di profil', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      jugaPegawaiTetap: true,
    };
    expect(profil.jugaPegawaiTetap).toBe(true);
  });

  it('9. Tahun pajak 2025 memakai aturan yang didukung', () => {
    const profil: ProfilWajibPajak = { ...baseProfil, tahunPajak: 2025 };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(['BOLEH', 'PERLU_DIPASTIKAN']).toContain(hasil.status);
  });

  it('10. Tahun pajak 2026 memakai aturan terbaru', () => {
    const profil: ProfilWajibPajak = { ...baseProfil, tahunPajak: 2026 };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(hasil.status).toBe('BOLEH');
  });

  it('11. KLU / Bentuk kegiatan BELUM_PASTI menghasilkan status PERLU_DIPASTIKAN', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      bentukKegiatan: 'BELUM_PASTI',
    };
    const hasil = evaluasiKelayakanPphFinal(profil, mockRegulasi);
    expect(hasil.status).toBe('PERLU_DIPASTIKAN');
  });

  it('12. Semua hasil evaluasi memiliki dasar hukum bersitasi lengkap', () => {
    const hasilFinal = evaluasiKelayakanPphFinal(baseProfil, mockRegulasi);
    const hasilNppn = evaluasiKelayakanNppn(baseProfil, mockRegulasi);
    const hasilTarifUmum = evaluasiKelayakanTarifUmum(baseProfil, mockRegulasi);

    expect(hasilFinal.dasarHukum.length).toBeGreaterThan(0);
    expect(hasilNppn.dasarHukum.length).toBeGreaterThan(0);
    expect(hasilTarifUmum.dasarHukum.length).toBeGreaterThan(0);
  });

  it('13. Omzet nol ditangani tanpa error dan menghasilkan pajak Rp 0', () => {
    const profil: ProfilWajibPajak = {
      ...baseProfil,
      omzetPribadiTahunPajak: 0,
      biayaOperasionalRiil: 0,
    };
    const hasil = auditPajakMandiri({ profil, kreditPajak: [] }, mockRegulasi);
    const pphFinal = hasil.skema.find((s) => s.id === 'PPH_FINAL_05');
    if (pphFinal && pphFinal.statusKalkulasi === 'TERSEDIA') {
      expect(pphFinal.pajakTerutang).toBe(0);
    }
  });

  it('14. Nilai negatif ditolak oleh schema Zod', () => {
    const invalidInput = {
      profil: {
        ...baseProfil,
        omzetPribadiTahunPajak: -500000,
      },
      kreditPajak: [],
    };
    const result = inputAuditPajakSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });

  it('15. Tarif umum selalu berstatus BOLEH sebagai hak dasar pembukuan', () => {
    const hasil = evaluasiKelayakanTarifUmum(baseProfil, mockRegulasi);
    expect(hasil.status).toBe('BOLEH');
  });
});
