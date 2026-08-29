import { HasilAuditPajakLengkap } from '../types/pajak';

export const mockHasilKelayakan: HasilAuditPajakLengkap = {
  rekomendasiUtama: 'Anda memenuhi syarat untuk menggunakan skema PPh Final UMKM 0,5%.',
  peringatanTaxLeakage: [
    'Jika omzet tahun ini membuat total tahunan melebihi Rp 4,8 Miliar, Anda wajib melakukan pembukuan di tahun pajak berikutnya.',
    'Gaji dari status pegawai tetap akan digabung dalam perhitungan SPT Tahunan.',
  ],
  skema: [
    {
      id: 'PPH_FINAL_05',
      statusKelayakan: 'BOLEH',
      alasanKelayakan: [
        'Omzet tahun sebelumnya belum melewati ambang batas Rp 4,8 Miliar.',
        'Kegiatan usaha tergolong usaha perdagangan/jasa umum, bukan pekerjaan bebas perseorangan.',
      ],
      dasarHukum: [
        {
          namaRegulasi: 'PP No. 20 Tahun 2026',
          pasalAtauLampiran: 'Pasal 56 ayat (2) & Pasal 57 ayat (1)',
          fungsi: 'Penetapan tarif 0,5% dan ambang batas peredaran bruto UMKM Rp4,8 Miliar',
          url: 'https://jdih.kemenkeu.go.id/api/download/d057ff82-50e7-4127-b66b-f704a36f071d/2026pp020.pdf',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
      statusKalkulasi: 'TERSEDIA',
      pajakTerutang: 1250000,
      rincianKalkulasi: {
        skema: 'PPH_FINAL_05',
        omzetPribadi: 750000000,
        batasPembebasan: 500000000,
        dasarPengenaan: 250000000,
        tarif: 0.005,
      },
    },
    {
      id: 'NPPN',
      statusKelayakan: 'PERLU_DIPASTIKAN',
      alasanKelayakan: [
        'Omzet tahun berjalan belum mencapai Rp 4,8 Miliar.',
        'Perlu dipastikan apakah Wajib Pajak sudah menyampaikan pemberitahuan penggunaan NPPN dalam 3 bulan pertama tahun pajak.',
      ],
      dasarHukum: [
        {
          namaRegulasi: 'PER-17/PJ/2015',
          pasalAtauLampiran: 'Pasal 2 ayat (1)',
          fungsi: 'Syarat penyampaian pemberitahuan penggunaan Norma Penghitungan Penghasilan Neto',
          url: 'https://pajak.go.id/sites/default/files/2019-03/PER%20-%2017.PJ_.2015.pdf',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Sistem memerlukan konfirmasi status pemberitahuan NPPN (Formulir LA.04-01).',
    },
    {
      id: 'TARIF_UMUM',
      statusKelayakan: 'BOLEH',
      alasanKelayakan: [
        'Wajib Pajak Orang Pribadi selalu berhak memilih pembukuan / Tarif Umum Pasal 17 UU PPh.',
      ],
      dasarHukum: [
        {
          namaRegulasi: 'UU HPP No. 7 Tahun 2021',
          pasalAtauLampiran: 'Pasal 17 ayat (1) huruf a',
          fungsi: 'Lapisan tarif progresif PPh Orang Pribadi',
          url: 'https://pajak.go.id/id/uu-nomor-7-tahun-2021-tentang-harmonisasi-peraturan-perpajakan',
          statusVerifikasi: 'TERVERIFIKASI',
        },
      ],
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Biaya operasional riil belum dimasukkan untuk menghitung laba bersih pembukuan.',
    },
  ],
};

// Alias export untuk kompatibilitas
export const mockHasil = mockHasilKelayakan;

