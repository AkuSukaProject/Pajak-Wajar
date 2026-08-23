import { HasilAuditPajakLengkap } from '../types/pajak';

export const mockHasilKelayakan: HasilAuditPajakLengkap = {
  rekomendasiUtama: "Anda dapat menggunakan skema PPh Final 0,5%.",
  peringatanTaxLeakage: [
    "Jika omzet bulan ini membuat total tahunan melebihi Rp 4,8 Miliar, Anda wajib melakukan pembukuan di tahun depan."
  ],
  skema: [
    {
      id: "PPH_FINAL_05",
      statusKelayakan: "BOLEH",
      alasanKelayakan: [
        "Omzet tahun sebelumnya belum melewati ambang batas Rp 4,8 Miliar."
      ],
      dasarHukum: [
        {
          namaRegulasi: "PP No. 20 Tahun 2026",
          pasalAtauLampiran: "Pasal 57 ayat (1) dan ayat (2) huruf e",
          fungsi: "Subjek, ambang Rp 4,8 M, dan pengecualian omzet keseluruhan",
          url: "https://jdih.kemenkeu.go.id/api/download/d057ff82-50e7-4127-b66b-f704a36f071d/2026pp020.pdf",
          statusVerifikasi: "TERVERIFIKASI"
        }
      ],
      statusKalkulasi: "TERSEDIA",
      pajakTerutang: 1250000,
      rincianKalkulasi: {
        skema: "PPH_FINAL_05",
        omzetPribadi: 750000000,
        batasPembebasan: 500000000,
        dasarPengenaan: 250000000,
        tarif: 0.005
      }
    },
    {
      id: "NPPN",
      statusKelayakan: "BOLEH",
      alasanKelayakan: [
        "Omzet tahun berjalan belum mencapai Rp 4,8 Miliar."
      ],
      dasarHukum: [],
      statusKalkulasi: "BELUM_TERSEDIA",
      alasanKalkulasi: "Sistem hanya menghitung NPPN untuk satu jenis kegiatan usaha/pekerjaan bebas."
    },
    {
      id: "TARIF_UMUM",
      statusKelayakan: "BOLEH",
      alasanKelayakan: [],
      dasarHukum: [],
      statusKalkulasi: "TIDAK_RELEVAN"
    }
  ]
};
