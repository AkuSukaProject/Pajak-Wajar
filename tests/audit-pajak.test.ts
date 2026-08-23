import { describe, it, expect } from 'vitest';
import { auditPajakMandiri } from '../src/lib/index';
import { InputAuditPajak, ProfilWajibPajak, DatabaseRegulasi } from '../src/types/pajak';

const mockRegulasi: DatabaseRegulasi = {
  versiRegulasi: "test",
  statusDokumen: "test",
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
      lapisan: [{ batasBawah: 0, batasAtas: null, tarif: 0.05 }],
      statusVerifikasi: "TERVERIFIKASI",
      dasarHukum: []
    },
    ptkp: {
      nilai: { "TK/0": 54000000, "TK/1": 58500000, "TK/2": 63000000, "TK/3": 67500000, "K/0": 58500000, "K/1": 63000000, "K/2": 67500000, "K/3": 72000000 },
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
  kelompokWilayah: { kelompok1: { nama: "", deskripsi: "" }, kelompok2: { nama: "", deskripsi: "" }, kelompok3: { nama: "", deskripsi: "" } },
  klu: [{ kluKode: "74201", dasarHukum: [] }]
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
  jugaPegawaiTetap: false
};

describe('auditPajakMandiri', () => {
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
});
