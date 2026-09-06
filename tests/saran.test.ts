import { describe, expect, it } from 'vitest';
import { auditPajakMandiri } from '../src/lib/index';
import { contohInput, profilPedagang } from '../src/mock/hasilKelayakan';

describe('saran akhir berdasarkan jawaban', () => {
  it('memberi kreator perbandingan NPPN dan tarif umum dengan basis setara', () => {
    const hasil = auditPajakMandiri(contohInput);
    expect(hasil.langkahTindakLanjut[0]).toContain('pertimbangkan Norma NPPN');
    expect(hasil.langkahTindakLanjut[0]).toContain('Rp19.350.000');
    expect(hasil.langkahTindakLanjut[0]).toContain('sebelum kredit');
    expect(hasil.langkahTindakLanjut.some(s => s.includes('nomor, tahun pajak'))).toBe(true);
  });
  it('menyebut skema paling rendah ketika ketiga skema dapat dibandingkan', () => {
    const hasil = auditPajakMandiri({ profil: profilPedagang, kreditPajak: [] });
    expect(hasil.langkahTindakLanjut[0]).toContain('PPh Final UMKM 0,5%');
    expect(hasil.langkahTindakLanjut[0]).toContain('paling rendah');
    expect(hasil.langkahTindakLanjut[0]).toContain('3 skema');
    expect(hasil.langkahTindakLanjut.some(s => s.includes('setoran final yang sudah dibayar'))).toBe(true);
  });

  it('tetap membandingkan ketika hanya dua skema yang terhitung', () => {
    // Tanpa pemberitahuan Norma, NPPN tertutup sehingga hanya PPh Final dan
    // tarif umum yang terhitung. Perbandingan tetap setara karena tidak ada
    // kredit bupot dan penghasilan pegawai.
    const hasil = auditPajakMandiri({
      profil: { ...profilPedagang, sudahMemberitahukanNppn: false },
      kreditPajak: []
    });
    const terhitung = hasil.skema.filter((s) => s.statusKalkulasi === 'TERSEDIA');
    expect(terhitung).toHaveLength(2);
    expect(hasil.rekomendasiHemat?.id).toBe('PPH_FINAL_05');
    expect(hasil.langkahTindakLanjut[0]).toContain('2 skema');
    expect(hasil.langkahTindakLanjut[0]).toContain('lebih rendah daripada');
  });

  it('tidak membandingkan bila ada kredit bupot, karena basis angkanya tidak setara', () => {
    const hasil = auditPajakMandiri({
      profil: profilPedagang,
      kreditPajak: [{ nomorBuktiPotong: 'BP-1', pemotong: 'PT Contoh', penghasilanBruto: 50_000_000, pphDipotong: 2_500_000, sumber: 'MANUAL' }]
    });
    expect(hasil.rekomendasiHemat).toBeUndefined();
  });
  it('tidak menyarankan Norma ketika pemberitahuannya belum pasti', () => {
    const hasil = auditPajakMandiri({ ...contohInput, profil: { ...contohInput.profil, sudahMemberitahukanNppn: 'tidak_yakin' } });
    expect(hasil.langkahTindakLanjut[0]).toContain('tarif umum berdasarkan pembukuan sudah dapat dihitung');
    expect(hasil.langkahTindakLanjut[0]).not.toContain('pertimbangkan Norma');
  });
  it('meminta data keluarga ketika belum ada perhitungan yang tersedia', () => {
    const hasil = auditPajakMandiri({ ...contohInput, profil: { ...contohInput.profil, statusPerpajakanPasangan: 'PISAH_HARTA' } });
    expect(hasil.langkahTindakLanjut[0]).toContain('belum ada nominal');
    expect(hasil.langkahTindakLanjut.some(s => s.includes('penghasilan neto pasangan'))).toBe(true);
  });
  it('tidak membuat peringkat semu ketika pajak kedua skema sama', () => {
    const hasil = auditPajakMandiri({ ...contohInput, profil: { ...contohInput.profil, biayaOperasionalRiil: 210_000_000 } });
    expect(hasil.langkahTindakLanjut[0]).toContain('pajak sebelum kredit yang sama');
  });
});
