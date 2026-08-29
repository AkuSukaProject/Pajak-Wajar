import { describe, it, expect } from 'vitest';
import { hitungRekonsiliasiBupot, formatNpwp, formatRupiah } from '../src/lib/bupot';
import { BuktiPotong } from '../src/types/pajak';

describe('Bupot Reconciler Logic (Habib - D2)', () => {
  const dummyBupot1: BuktiPotong = {
    id: 'bupot-1',
    nomorBupot: '21-001/BP/2025',
    npwpPemotong: '012345678901234',
    namaPemotong: 'PT Klien Kreatif Media',
    jenisPph: 'PPH_21',
    dpp: 100_000_000,
    pphDipotong: 2_500_000,
    masaPajak: '05-2025',
    sumber: 'manual',
  };

  const dummyBupot2: BuktiPotong = {
    id: 'bupot-2',
    nomorBupot: '23-002/BP/2025',
    npwpPemotong: '987654321098765',
    namaPemotong: 'CV Solusi Digital',
    jenisPph: 'PPH_23',
    dpp: 50_000_000,
    pphDipotong: 1_000_000,
    masaPajak: '08-2025',
    sumber: 'ocr',
  };

  it('mengagregasi total DPP dan kredit bupot dengan benar', () => {
    const hasil = hitungRekonsiliasiBupot({
      pajakTerutangDasar: 5_000_000,
      daftarBupot: [dummyBupot1, dummyBupot2],
    });

    expect(hasil.totalDpp).toBe(150_000_000);
    expect(hasil.totalKreditBupot).toBe(3_500_000);
  });

  it('menghasilkan status KURANG_BAYAR ketika kredit < pajak terutang', () => {
    const hasil = hitungRekonsiliasiBupot({
      pajakTerutangDasar: 5_000_000,
      daftarBupot: [dummyBupot1],
    });

    expect(hasil.status).toBe('KURANG_BAYAR');
    expect(hasil.sisaPajak).toBe(2_500_000);
    expect(hasil.konsekuensiHukum).toContain('PPh Pasal 29 Kurang Bayar');
  });

  it('menghasilkan status LEBIH_BAYAR dan bukan angka negatif saat kredit > pajak terutang', () => {
    const hasil = hitungRekonsiliasiBupot({
      pajakTerutangDasar: 2_000_000,
      daftarBupot: [dummyBupot1, dummyBupot2], // total kredit 3.500.000
    });

    expect(hasil.status).toBe('LEBIH_BAYAR');
    expect(hasil.sisaPajak).toBe(1_500_000); // positif!
    expect(hasil.konsekuensiHukum).toContain('PPh Pasal 28A Lebih Bayar');
  });

  it('menghasilkan status NIHIL ketika kredit sama dengan pajak terutang', () => {
    const hasil = hitungRekonsiliasiBupot({
      pajakTerutangDasar: 3_500_000,
      daftarBupot: [dummyBupot1, dummyBupot2],
    });

    expect(hasil.status).toBe('NIHIL');
    expect(hasil.sisaPajak).toBe(0);
    expect(hasil.konsekuensiHukum).toContain('SPT Nihil');
  });

  it('memformat NPWP 15 digit dan 16 digit dengan tepat', () => {
    expect(formatNpwp('012345678901234')).toBe('01.234.567.8-901.234');
    expect(formatNpwp('0123456789012345')).toBe('0123 4567 8901 2345');
  });

  it('memformat nominal ke mata uang Rupiah', () => {
    const formatted = formatRupiah(1500000);
    expect(formatted).toContain('1.500.000');
  });
});
