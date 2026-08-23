import { describe, it, expect } from 'vitest';
import { hitungPphTarifUmum, hitungPphFinal, hitungTarifProgresif } from '../src/lib/calculator';

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
});
