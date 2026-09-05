import { describe, expect, it } from 'vitest';
import {
  hitungNppn,
  hitungPphFinal,
  hitungTarifProgresifBerlapis,
  hitungTarifUmum,
  totalKreditBupot
} from '../src/lib/calculator';
import { basisAturan } from '../src/lib/regulasi';

const LAPISAN = basisAturan.parameterPajak.tarifProgresif.lapisan;

describe('tarif progresif berlapis', () => {
  it('menghitung PKP Rp337 juta melewati tiga lapisan, bukan satu tarif tunggal', () => {
    const { pajak, lapisanTerpakai } = hitungTarifProgresifBerlapis(337_000_000, LAPISAN);
    // 60jt x 5% + 190jt x 15% + 87jt x 25%
    expect(pajak).toBe(3_000_000 + 28_500_000 + 21_750_000);
    expect(pajak).not.toBe(337_000_000 * 0.25);
    expect(lapisanTerpakai.map((l) => l.lapisan)).toEqual([1, 2, 3]);
  });

  it('PKP tepat di batas lapisan tidak menyentuh lapisan berikutnya', () => {
    const { pajak, lapisanTerpakai } = hitungTarifProgresifBerlapis(60_000_000, LAPISAN);
    expect(pajak).toBe(3_000_000);
    expect(lapisanTerpakai).toHaveLength(1);
  });

  it('PKP nol dan negatif menghasilkan pajak nol', () => {
    expect(hitungTarifProgresifBerlapis(0, LAPISAN).pajak).toBe(0);
    expect(hitungTarifProgresifBerlapis(-5_000_000, LAPISAN).pajak).toBe(0);
  });

  it('cocok dengan contoh resmi penjelasan Pasal 17 ayat (1) huruf a UU HPP', () => {
    // Penjelasan UU No. 7 Tahun 2021 atas Pasal 17 ayat (1) huruf a UU PPh:
    // PKP Rp6.000.000.000 menghasilkan PPh terutang Rp1.794.000.000.
    const { pajak } = hitungTarifProgresifBerlapis(6_000_000_000, LAPISAN);
    expect(pajak).toBe(1_794_000_000);
  });

  it('lapisan teratas tanpa batas atas tetap terhitung', () => {
    const { pajak, lapisanTerpakai } = hitungTarifProgresifBerlapis(6_000_000_000, LAPISAN);
    const empatLapisPertama = 3_000_000 + 28_500_000 + 62_500_000 + 1_350_000_000;
    expect(pajak).toBe(empatLapisPertama + 1_000_000_000 * 0.35);
    expect(lapisanTerpakai).toHaveLength(5);
  });
});

describe('PPh Final 0,5%', () => {
  it('mengurangi pembebasan Rp500 juta dari omzet pribadi', () => {
    const hasil = hitungPphFinal({
      omzetPribadi: 900_000_000,
      batasPembebasan: 500_000_000,
      tarif: 0.005
    });
    expect(hasil.dasarPengenaan).toBe(400_000_000);
    expect(hasil.pajakTerutang).toBe(2_000_000);
  });

  it('omzet di bawah pembebasan menghasilkan pajak nol, bukan angka negatif', () => {
    const hasil = hitungPphFinal({
      omzetPribadi: 180_000_000,
      batasPembebasan: 500_000_000,
      tarif: 0.005
    });
    expect(hasil.dasarPengenaan).toBe(0);
    expect(hasil.pajakTerutang).toBe(0);
  });
});

describe('Norma NPPN', () => {
  it('memakai persentase norma dan tarif berlapis, lalu mengurangi kredit bupot', () => {
    const hasil = hitungNppn({
      omzetPribadi: 420_000_000,
      persenNorma: 50,
      ptkp: 54_000_000,
      kreditBupot: 6_000_000,
      lapisan: LAPISAN
    });
    expect(hasil.penghasilanNeto).toBe(210_000_000);
    expect(hasil.pkp).toBe(156_000_000);
    expect(hasil.pajakSebelumKredit).toBe(3_000_000 + 96_000_000 * 0.15);
    expect(hasil.pajakTerutang).toBe(hasil.pajakSebelumKredit - 6_000_000);
  });

  it('persentase norma pecahan tetap terhitung', () => {
    const hasil = hitungNppn({
      omzetPribadi: 200_000_000,
      persenNorma: 47.5,
      ptkp: 54_000_000,
      kreditBupot: 0,
      lapisan: LAPISAN
    });
    expect(hasil.penghasilanNeto).toBe(95_000_000);
    expect(hasil.pkp).toBe(41_000_000);
  });

  it('kredit bupot lebih besar dari pajak tidak menghasilkan nilai negatif', () => {
    const hasil = hitungNppn({
      omzetPribadi: 120_000_000,
      persenNorma: 50,
      ptkp: 54_000_000,
      kreditBupot: 90_000_000,
      lapisan: LAPISAN
    });
    expect(hasil.pajakTerutang).toBe(0);
  });
});

describe('tarif umum', () => {
  it('menghitung dari keuntungan bersih dan tarif berlapis', () => {
    const hasil = hitungTarifUmum({
      omzetPribadi: 420_000_000,
      biayaOperasional: 95_000_000,
      ptkp: 54_000_000,
      kreditBupot: 6_000_000,
      lapisan: LAPISAN
    });
    expect(hasil.penghasilanNeto).toBe(325_000_000);
    expect(hasil.pkp).toBe(271_000_000);
    expect(hasil.pajakSebelumKredit).toBe(3_000_000 + 28_500_000 + 21_000_000 * 0.25);
    expect(hasil.pajakTerutang).toBe(hasil.pajakSebelumKredit - 6_000_000);
  });

  it('biaya melebihi omzet menghasilkan penghasilan neto nol', () => {
    const hasil = hitungTarifUmum({
      omzetPribadi: 100_000_000,
      biayaOperasional: 150_000_000,
      ptkp: 54_000_000,
      kreditBupot: 0,
      lapisan: LAPISAN
    });
    expect(hasil.penghasilanNeto).toBe(0);
    expect(hasil.pajakTerutang).toBe(0);
  });
});

describe('kredit bukti potong', () => {
  it('menjumlahkan seluruh pemotongan', () => {
    expect(totalKreditBupot([{ pphDipotong: 1_500_000 }, { pphDipotong: 2_500_000 }])).toBe(
      4_000_000
    );
  });

  it('daftar kosong menghasilkan nol', () => {
    expect(totalKreditBupot([])).toBe(0);
  });
});
