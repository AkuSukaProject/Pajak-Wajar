import type { HasilKelayakan } from '@/types/pajak';

/** Data presentasi sementara. Ganti dengan hasil eligibility.ts setelah kontrak terintegrasi. */
export const mockHasil: HasilKelayakan = {
  skema: [
    {
      id: 'PPH_FINAL_05',
      status: 'TIDAK_BOLEH',
      alasan: 'Profesi Anda tergolong pekerjaan bebas.',
      dasarHukum: 'TODO: verifikasi kutipan dan nomor pasal ke JDIH'
    },
    {
      id: 'NPPN',
      status: 'PERLU_DIPASTIKAN',
      alasan: 'Status pemberitahuan penggunaan Norma belum dipastikan.',
      dasarHukum: 'TODO: verifikasi ketentuan LA.04-01 ke sumber primer'
    },
    {
      id: 'TARIF_UMUM',
      status: 'BOLEH',
      alasan: 'Skema tersedia berdasarkan data simulasi.',
      dasarHukum: 'TODO: verifikasi pasal tarif umum ke sumber primer'
    }
  ],
  peringatan: ['Jika Anda juga pegawai tetap, penghasilan perlu diperhitungkan dalam satu SPT.'],
  langkahTindakLanjut: ['Periksa status pemberitahuan Norma di akun Coretax atau hubungi DJP.']
};
