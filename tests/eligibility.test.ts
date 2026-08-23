import { describe, it } from 'vitest';

describe.todo('periksaKelayakan — minimal 15 kasus setelah regulasi terverifikasi');

describe('daftar kasus yang wajib diisi', () => {
  it.todo('pekerjaan bebas tidak mendapat PPh Final');
  it.todo('usaha yang memenuhi syarat mendapat PPh Final');
  it.todo('omzet konsolidasi melewati ambang');
  it.todo('omzet konsolidasi tepat di ambang');
  it.todo('omzet pribadi tidak dicampur dalam dasar hitung');
  it.todo('LA.04-01 tidak yakin menghasilkan PERLU_DIPASTIKAN');
  it.todo('pilihan tarif umum tidak yakin menghasilkan PERLU_DIPASTIKAN');
  it.todo('peringatan penghasilan campuran muncul');
  it.todo('tahun pajak 2025 memakai aturan transisi');
  it.todo('tahun pajak 2026 memakai aturan terbaru');
  it.todo('KLU yang belum dikenal tidak menghasilkan vonis pasti');
  it.todo('semua hasil memiliki dasar hukum');
  it.todo('omzet nol ditangani');
  it.todo('nilai negatif ditolak schema');
  it.todo('tarif umum tetap ditampilkan');
});
