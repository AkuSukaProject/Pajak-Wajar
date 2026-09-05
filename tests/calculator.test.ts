import { describe, it, expect } from 'vitest';
import { hitungPphTarifUmum, hitungPphFinal, hitungTarifProgresif, hitungPphNppn } from '../src/lib/calculator';

describe('calculator', () => {
  describe('hitungTarifProgresif', () => {
    const lapisanTarif = [
      { batasBawah: 0, batasAtas: 60000000, tarif: 0.05 },
      { batasBawah: 60000000, batasAtas: 250000000, tarif: 0.15 },
      { batasBawah: 250000000, batasAtas: 500000000, tarif: 0.25 },
      { batasBawah: 500000000, batasAtas: 5000000000, tarif: 0.30 },
      { batasBawah: 5000000000, batasAtas: null, tarif: 0.35 }
    ];

    it('should correctly calculate exact boundary layer 1 (60jt)', () => {
      const tax = hitungTarifProgresif(60000000, lapisanTarif);
      expect(tax).toBe(60000000 * 0.05);
    });

    it('should correctly calculate layer 2 (100jt)', () => {
      const tax = hitungTarifProgresif(100000000, lapisanTarif);
      expect(tax).toBe((60000000 * 0.05) + (40000000 * 0.15));
    });
  });

  describe('hitungPphTarifUmum', () => {
    it('should calculate correctly when biayaOperasional is provided', () => {
      const res = hitungPphTarifUmum({
        omzetPribadiTahunPajak: 100000000,
        biayaOperasional: 20000000, // penghasilan neto 80jt
        ptkp: 54000000, // pkp 26jt
        kreditBupot: 0,
        lapisanTarif: [{ batasBawah: 0, batasAtas: null, tarif: 0.05 }]
      });
      expect(res.pajakTerutang).toBe(26000000 * 0.05);
      expect(res.rincian.penghasilanNeto).toBe(80000000);
    });
  });

  describe('hitungPphNppn', () => {
    it('should compute net income based on specific norm percentage', () => {
      const res = hitungPphNppn({
        omzetPribadiTahunPajak: 200000000,
        persenNorma: 0.45, // 45%
        ptkp: 54000000,
        kreditBupot: 0,
        lapisanTarif: [{ batasBawah: 0, batasAtas: null, tarif: 0.05 }]
      });
      expect(res.rincian.penghasilanNeto).toBe(90000000); // 200jt * 45%
      expect(res.rincian.pkp).toBe(36000000); // 90jt - 54jt
      expect(res.pajakTerutang).toBe(36000000 * 0.05); // 1.8jt
    });

    it('should deduct PPh 23 credit correctly from NPPN tax liability', () => {
      const res = hitungPphNppn({
        omzetPribadiTahunPajak: 200000000,
        persenNorma: 0.50,
        ptkp: 54000000,
        kreditBupot: 2000000, // Kredit PPh 23 = Rp 2.000.000
        lapisanTarif: [{ batasBawah: 0, batasAtas: null, tarif: 0.05 }]
      });
      // Neto: 100jt, PKP: 46jt, Pajak dasar: 46jt * 5% = 2.300.000
      // Pajak terutang setelah kredit: 2.300.000 - 2.000.000 = 300.000
      expect(res.pajakTerutang).toBe(300000);
    });
  });
});
