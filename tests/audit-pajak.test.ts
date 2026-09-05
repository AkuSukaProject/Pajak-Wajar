import { describe, it, expect } from 'vitest';
import { auditPajakMandiri } from '../src/lib/index';
import { InputAuditPajak, ProfilWajibPajak, DatabaseRegulasi } from '../src/types/pajak';

const mockRegulasi: DatabaseRegulasi = {
  versiRegulasi: "PP-20-2026",
  statusDokumen: "TERVERIFIKASI",
  tahunPajakDidukung: [2025, 2026],
  lingkupWajibPajak: "ORANG_PRIBADI",
  parameterPajak: {
    pphFinal: {
      tarif: { nilai: 0.005, statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
      ambangOmzet: { nilai: 4800000000, operator: "LTE", statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
      pembebasanOmzetOp: { nilai: 500000000, statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
    },
    nppn: {
      ambangOmzet: { nilai: 4800000000, operator: "LT", statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
      batasPemberitahuanBulan: { nilai: 3, statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
    },
    tarifProgresif: {
      lapisan: [
        { batasBawah: 0, batasAtas: 60000000, tarif: 0.05 },
        { batasBawah: 60000000, batasAtas: 250000000, tarif: 0.15 },
        { batasBawah: 250000000, batasAtas: 500000000, tarif: 0.25 },
        { batasBawah: 500000000, batasAtas: 5000000000, tarif: 0.30 },
        { batasBawah: 5000000000, batasAtas: null, tarif: 0.35 }
      ],
      statusVerifikasi: "TERVERIFIKASI",
      dasarHukum: []
    },
    ptkp: {
      nilai: {
        "TK/0": 54000000, "TK/1": 58500000, "TK/2": 63000000, "TK/3": 67500000,
        "K/0": 58500000, "K/1": 63000000, "K/2": 67500000, "K/3": 72000000
      },
      statusVerifikasi: "TERVERIFIKASI",
      dasarHukum: []
    }
  },
  aturanKelayakan: {
    pekerjaanBebas: { statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
    ambangKonsolidasi: { statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
    pilihanTarifUmum: { statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
    administrasiNppn: { statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
    ketentuanPeralihan: { statusVerifikasi: "TERVERIFIKASI", dasarHukum: [] },
  },
  kelompokWilayah: {
    kelompok1: { nama: "10 Ibukota Provinsi", deskripsi: "Jakarta, Surabaya, Medan, dll." },
    kelompok2: { nama: "Ibukota Provinsi Lainnya", deskripsi: "Ibukota provinsi lainnya" },
    kelompok3: { nama: "Daerah Lainnya", deskripsi: "Kabupaten/kota non-ibukota" }
  },
  klu: [
    {
      kluKode: "74201",
      nama: "Aktivitas Desain Komunikasi Visual / Desain Grafis",
      kategori: "Jasa Kreatif",
      pekerjaanBebas: true,
      persenNorma: {
        kelompok1: 0.50,
        kelompok2: 0.50,
        kelompok3: 0.475
      },
      dasarHukum: []
    },
    {
      kluKode: "86201",
      nama: "Aktivitas Praktik Dokter",
      kategori: "Kesehatan",
      pekerjaanBebas: true,
      persenNorma: {
        kelompok1: 0.50,
        kelompok2: 0.50,
        kelompok3: 0.45
      },
      dasarHukum: []
    },
    {
      kluKode: "47911",
      nama: "Perdagangan Eceran Melalui Media Internet",
      kategori: "Perdagangan",
      pekerjaanBebas: false,
      persenNorma: {
        kelompok1: 0.30,
        kelompok2: 0.25,
        kelompok3: 0.20
      },
      dasarHukum: []
    }
  ]
};

const baseProfil: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '74201',
  wilayah: 'kelompok1',
  statusPtkp: 'TK/0',
  bentukKegiatan: 'USAHA_DAGANG',
  statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
  punyaLebihDariSatuKegiatan: false,
  omzetPribadiTahunPajak: 300000000,
  omzetPribadiThnSebelumnya: 300000000,
  omzetPasanganThnSebelumnya: 0,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: true,
  pernahPilihTarifUmum: false,
  jugaPegawaiTetap: false
};

describe('auditPajakMandiri & Kalkulasi Norma Dinamis', () => {
  it('should set Tarif Umum statusKalkulasi to BELUM_TERSEDIA if biayaOperasionalRiil is undefined', () => {
    const input: InputAuditPajak = {
      profil: { ...baseProfil, biayaOperasionalRiil: undefined },
      kreditPajak: []
    };
    const result = auditPajakMandiri(input, mockRegulasi);
    
    const tarifUmum = result.skema.find(s => s.id === 'TARIF_UMUM');
    expect(tarifUmum?.statusKelayakan).toBe('BOLEH');
    expect(tarifUmum?.statusKalkulasi).toBe('BELUM_TERSEDIA');
    expect((tarifUmum as any).pajakTerutang).toBeUndefined();
  });

  it('should block NPPN calculation if punyaLebihDariSatuKegiatan is true', () => {
    const input: InputAuditPajak = {
      profil: { ...baseProfil, punyaLebihDariSatuKegiatan: true },
      kreditPajak: []
    };
    const result = auditPajakMandiri(input, mockRegulasi);
    
    const nppn = result.skema.find(s => s.id === 'NPPN');
    expect(nppn?.statusKelayakan).toBe('BOLEH');
    expect(nppn?.statusKalkulasi).toBe('BELUM_TERSEDIA');
  });

  it('should block NPPN calculation if punyaLebihDariSatuKegiatan is tidak_yakin', () => {
    const input: InputAuditPajak = {
      profil: { ...baseProfil, punyaLebihDariSatuKegiatan: 'tidak_yakin' },
      kreditPajak: []
    };
    const result = auditPajakMandiri(input, mockRegulasi);
    
    const nppn = result.skema.find(s => s.id === 'NPPN');
    expect(nppn?.statusKalkulasi).toBe('BELUM_TERSEDIA');
  });

  it('should calculate distinct NPPN percentage and tax for different regions of the same KLU', () => {
    // Dokter di Kelompok 1 (10 Ibukota Provinsi) -> 50%
    const inputKelompok1: InputAuditPajak = {
      profil: {
        ...baseProfil,
        kluKode: '86201',
        wilayah: 'kelompok1',
        omzetPribadiTahunPajak: 400000000,
        statusPtkp: 'TK/0'
      },
      kreditPajak: []
    };
    const resultKel1 = auditPajakMandiri(inputKelompok1, mockRegulasi);
    const nppnKel1 = resultKel1.skema.find(s => s.id === 'NPPN');
    expect(nppnKel1?.statusKalkulasi).toBe('TERSEDIA');
    if (nppnKel1?.statusKalkulasi === 'TERSEDIA') {
      expect(nppnKel1.rincianKalkulasi.persenNorma).toBe(0.50);
      expect(nppnKel1.rincianKalkulasi.penghasilanNeto).toBe(200000000); // 400jt * 50%
      // PKP = 200jt - 54jt = 146jt
      // Pajak: (60jt * 5%) + (86jt * 15%) = 3jt + 12.9jt = 15.9jt
      expect(nppnKel1.pajakTerutang).toBe(15900000);
    }

    // Dokter di Kelompok 3 (Daerah Lainnya) -> 45%
    const inputKelompok3: InputAuditPajak = {
      profil: {
        ...baseProfil,
        kluKode: '86201',
        wilayah: 'kelompok3',
        omzetPribadiTahunPajak: 400000000,
        statusPtkp: 'TK/0'
      },
      kreditPajak: []
    };
    const resultKel3 = auditPajakMandiri(inputKelompok3, mockRegulasi);
    const nppnKel3 = resultKel3.skema.find(s => s.id === 'NPPN');
    expect(nppnKel3?.statusKalkulasi).toBe('TERSEDIA');
    if (nppnKel3?.statusKalkulasi === 'TERSEDIA') {
      expect(nppnKel3.rincianKalkulasi.persenNorma).toBe(0.45);
      expect(nppnKel3.rincianKalkulasi.penghasilanNeto).toBe(180000000); // 400jt * 45%
      // PKP = 180jt - 54jt = 126jt
      // Pajak: (60jt * 5%) + (66jt * 15%) = 3jt + 9.9jt = 12.9jt
      expect(nppnKel3.pajakTerutang).toBe(12900000);
      expect(nppnKel3.pajakTerutang).not.toBe(nppnKel1 && 'pajakTerutang' in nppnKel1 ? nppnKel1.pajakTerutang : 0);
    }
  });

  it('should calculate distinct percentage for trade/online shop vs professional services', () => {
    const inputOnlineShop: InputAuditPajak = {
      profil: {
        ...baseProfil,
        kluKode: '47911',
        wilayah: 'kelompok1',
        omzetPribadiTahunPajak: 500000000,
        statusPtkp: 'TK/0'
      },
      kreditPajak: []
    };
    const res = auditPajakMandiri(inputOnlineShop, mockRegulasi);
    const nppn = res.skema.find(s => s.id === 'NPPN');
    expect(nppn?.statusKalkulasi).toBe('TERSEDIA');
    if (nppn?.statusKalkulasi === 'TERSEDIA') {
      expect(nppn.rincianKalkulasi.persenNorma).toBe(0.30); // Online shop 30% in Kel 1
      expect(nppn.rincianKalkulasi.penghasilanNeto).toBe(150000000); // 500jt * 30%
    }
  });

  it('should return BELUM_TERSEDIA when KLU is not in database (no arbitrary fallback)', () => {
    const inputUnrecognizedKlu: InputAuditPajak = {
      profil: {
        ...baseProfil,
        kluKode: '99999', // Unknown KLU
        wilayah: 'kelompok1',
      },
      kreditPajak: []
    };
    const res = auditPajakMandiri(inputUnrecognizedKlu, mockRegulasi);
    const nppn = res.skema.find(s => s.id === 'NPPN');
    expect(nppn?.statusKelayakan).toBe('BOLEH');
    expect(nppn?.statusKalkulasi).toBe('BELUM_TERSEDIA');
    expect(nppn?.alasanKalkulasi).toContain('Data persentase norma untuk KLU atau kelompok wilayah yang dipilih belum tersedia');
    expect((nppn as any).pajakTerutang).toBeUndefined();
  });
});
