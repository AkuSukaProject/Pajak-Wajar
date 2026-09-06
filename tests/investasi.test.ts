import { describe, expect, it } from 'vitest';
import { auditPajakMandiri } from '../src/lib/index';
import { periksaInvestasi } from '../src/lib/investasi';
import { basisAturan } from '../src/lib/regulasi';
import { profilKreator } from '../src/mock/hasilKelayakan';
import type { PenghasilanInvestasi } from '../src/types/investasi';

const dasar = { id: 'INV-1', nama: 'Investasi contoh', pemilik: 'ANDA' as const, bruto: 10_000_000 };
const deposito: PenghasilanInvestasi = { ...dasar, jenis: 'DEPOSITO', simpananBiasa: true, totalSimpanan: 100_000_000, tidakDipecah: true };
const saham: PenghasilanInvestasi = { ...dasar, jenis: 'SAHAM_BURSA', sahamBursaIndonesiaNonPendiri: true, bruto: 200_000_000 };
const dividen: PenghasilanInvestasi = { ...dasar, jenis: 'DIVIDEN_DN', dividenResmiDalamNegeri: true, reinvestasi: 'TIDAK', bruto: 100_000_000 };

describe('bunga simpanan biasa OP dalam negeri', () => {
  it('bunga 10 juta dikenai 2 juta, bukan 20% dari pokok 100 juta', () => {
    expect(periksaInvestasi(deposito)).toMatchObject({ status: 'TERHITUNG', pajakTerutang: 2_000_000, dasarPengenaan: 10_000_000 });
  });
  it.each([0, 7_499_999, 7_500_000])('simpanan %i yang tidak dipecah dikecualikan dari pemotongan', totalSimpanan => {
    expect(periksaInvestasi({ ...deposito, totalSimpanan })).toMatchObject({ status: 'TERHITUNG', klasifikasi: 'TANPA_PEMOTONGAN', pajakTerutang: 0 });
  });
  it('batas pengecualian inklusif: satu rupiah di atas batas terkena tarif biasa', () => {
    expect(periksaInvestasi({ ...deposito, totalSimpanan: 7_500_001 })).toMatchObject({ pajakTerutang: 2_000_000 });
  });
  it('simpanan yang dipecah tidak mendapat pengecualian nominal kecil', () => {
    expect(periksaInvestasi({ ...deposito, totalSimpanan: 5_000_000, tidakDipecah: false })).toMatchObject({ pajakTerutang: 2_000_000 });
  });
  it('DHE atau fasilitas khusus tidak otomatis dikenai 20%', () => {
    const r = periksaInvestasi({ ...deposito, simpananBiasa: false });
    expect(r.status).toBe('PERLU_DIPASTIKAN');
    expect(r).not.toHaveProperty('pajakTerutang');
  });
  it('jumlah simpanan yang kosong ditahan, bukan dianggap nol', () => {
    expect(periksaInvestasi({ ...deposito, totalSimpanan: undefined }).status).toBe('PERLU_DIPASTIKAN');
  });
});

describe('transaksi saham dan dividen', () => {
  it('nilai jual 200 juta menghasilkan 200 ribu', () => {
    expect(periksaInvestasi(saham)).toMatchObject({ status: 'TERHITUNG', pajakTerutang: 200_000 });
  });
  it('tidak menyamakan saham pendiri atau bursa luar negeri dengan saham bursa biasa', () => {
    expect(periksaInvestasi({ ...saham, sahamBursaIndonesiaNonPendiri: false }).status).toBe('PERLU_DIPASTIKAN');
  });
  it('dividen 100 juta tanpa pengecualian menghasilkan 10 juta', () => {
    expect(periksaInvestasi(dividen)).toMatchObject({ pajakTerutang: 10_000_000, klasifikasi: 'FINAL' });
  });
  it('reinvestasi penuh yang memenuhi seluruh syarat menjadi bukan objek', () => {
    expect(periksaInvestasi({ ...dividen, reinvestasi: 'MEMENUHI', jumlahReinvestasi: 100_000_000 })).toMatchObject({ pajakTerutang: 0, bukanObjek: 100_000_000, klasifikasi: 'BUKAN_OBJEK' });
  });
  it('reinvestasi 60 juta dari 100 juta menghasilkan final 4 juta atas sisanya', () => {
    expect(periksaInvestasi({ ...dividen, reinvestasi: 'MEMENUHI', jumlahReinvestasi: 60_000_000 })).toMatchObject({ pajakTerutang: 4_000_000, bukanObjek: 60_000_000, dasarPengenaan: 40_000_000, klasifikasi: 'SEBAGIAN_FINAL' });
  });
  it('rencana investasi yang belum pasti tidak langsung dibebaskan', () => {
    const r = periksaInvestasi({ ...dividen, reinvestasi: 'BELUM_PASTI' });
    expect(r.status).toBe('PERLU_DIPASTIKAN');
    expect(r).not.toHaveProperty('pajakTerutang');
  });
  it('dividen luar negeri tidak otomatis dihitung 10%', () => {
    expect(periksaInvestasi({ ...dividen, dividenResmiDalamNegeri: false }).status).toBe('PERLU_DIPASTIKAN');
  });
});

describe('pemisahan investasi, bukti, dan pajak progresif', () => {
  const audit = (penghasilanInvestasi: PenghasilanInvestasi[]) => auditPajakMandiri({ profil: profilKreator, kreditPajak: [], penghasilanInvestasi });
  it('investasi tidak mengubah nominal usaha, ambang, rekomendasi, atau kredit', () => {
    const tanpa = audit([]);
    const dengan = audit([deposito, { ...saham, id: 'INV-2' }, { ...dividen, id: 'INV-3' }]);
    expect(dengan.skema).toEqual(tanpa.skema);
    expect(dengan.rekomendasiHemat).toEqual(tanpa.rekomendasiHemat);
    expect(dengan.totalKreditBupot).toBe(0);
  });
  it('bukti kosong tidak berarti pajak telah lunas', () => {
    expect(periksaInvestasi({ ...deposito, pajakDibayar: 2_000_000 })).not.toHaveProperty('pencocokan');
  });
  it('nominal dan referensi bukti yang lengkap menghasilkan pencocokan', () => {
    expect(periksaInvestasi({ ...deposito, pajakDibayar: 2_000_000, nomorBukti: 'BANK-1' })).toMatchObject({ pencocokan: { dibayar: 2_000_000, selisih: 0 } });
  });
  it('selisih kurang bayar dan lebih potong tidak dihilangkan', () => {
    expect(periksaInvestasi({ ...deposito, pajakDibayar: 1_000_000, nomorBukti: 'BANK-1' })).toMatchObject({ pencocokan: { selisih: 1_000_000 } });
    expect(periksaInvestasi({ ...deposito, pajakDibayar: 3_000_000, nomorBukti: 'BANK-1' })).toMatchObject({ pencocokan: { selisih: -1_000_000 } });
  });
  it('menolak nominal negatif dan reinvestasi melebihi dividen', () => {
    expect(() => audit([{ ...deposito, bruto: -1 }])).toThrow();
    expect(() => audit([{ ...dividen, reinvestasi: 'MEMENUHI', jumlahReinvestasi: 100_000_001 }])).toThrow();
  });
  it('menolak bukti final yang juga dimasukkan sebagai kredit nonfinal', () => {
    expect(() => auditPajakMandiri({ profil: profilKreator, penghasilanInvestasi: [{ ...deposito, nomorBukti: ' bank-1 ' }], kreditPajak: [{ nomorBuktiPotong: 'BANK-1', pemotong: 'Bank', penghasilanBruto: 10_000_000, pphDipotong: 2_000_000, sumber: 'MANUAL' }] })).toThrow(/final/);
  });
  it('menolak catatan atau referensi bukti investasi ganda', () => {
    expect(() => audit([deposito, deposito])).toThrow(/duplikat/);
    expect(() => audit([{ ...deposito, nomorBukti: 'A1' }, { ...saham, id: 'INV-2', nomorBukti: ' a1 ' }])).toThrow(/sudah dicatat/);
  });
  it('nilai bruto yang belum diketahui ditahan, nol eksplisit dihitung', () => {
    expect(periksaInvestasi({ ...saham, bruto: undefined }).status).toBe('PERLU_DIPASTIKAN');
    expect(periksaInvestasi({ ...saham, bruto: 0 })).toMatchObject({ pajakTerutang: 0 });
  });
  it('setiap klasifikasi membawa sumber primer dan parameter dalam review ditahan', () => {
    for (const input of [deposito, saham, dividen]) expect(periksaInvestasi(input).dasarHukum.length).toBeGreaterThan(0);
    const parameter = basisAturan.parameterPajak.investasi.tarifDeposito;
    const sebelumnya = parameter.statusVerifikasi;
    try {
      parameter.statusVerifikasi = 'DALAM_REVIEW';
      const r = periksaInvestasi(deposito);
      expect(r.status).toBe('PERLU_DIPASTIKAN');
      expect(r).not.toHaveProperty('pajakTerutang');
    } finally { parameter.statusVerifikasi = sebelumnya; }
  });
});
