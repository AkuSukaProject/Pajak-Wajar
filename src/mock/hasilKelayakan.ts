import type { HasilKelayakan } from '@/types/pajak';

/** Data presentasi sementara. Ganti dengan hasil eligibility.ts setelah kontrak terintegrasi. */
export const mockHasil: HasilKelayakan = {
  skema: [
    {
      id: 'PPH_FINAL_05',
      status: 'TIDAK_BOLEH',
      alasan: 'Pekerjaan Anda mengandalkan keahlian pribadi. Dalam aturan pajak, ini disebut pekerjaan bebas.',
      dasarHukum: 'Aturan resmi untuk hasil contoh ini masih sedang diperiksa.'
    },
    {
      id: 'NPPN',
      status: 'PERLU_DIPASTIKAN',
      alasan: 'Kami belum tahu apakah Anda pernah memberi tahu kantor pajak bahwa Anda ingin memakai cara Norma.',
      dasarHukum: 'Aturan resmi untuk pemberitahuan Norma masih sedang diperiksa.'
    },
    {
      id: 'TARIF_UMUM',
      status: 'BOLEH',
      alasan: 'Berdasarkan data contoh, cara menghitung dari keuntungan bersih dapat digunakan.',
      dasarHukum: 'Aturan resmi untuk tarif umum masih sedang diperiksa.'
    }
  ],
  peringatan: ['Jika Anda juga menerima gaji sebagai pegawai, gaji dan penghasilan usaha biasanya dilaporkan bersama dalam satu laporan pajak tahunan (SPT).'],
  langkahTindakLanjut: ['Cek di akun Coretax apakah Anda pernah memberitahukan penggunaan Norma, atau tanyakan ke kantor pajak.']
};
