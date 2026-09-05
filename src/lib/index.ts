import {
  InputAuditPajak,
  DatabaseRegulasi,
  HasilSkemaPphFinal,
  HasilSkemaNppn,
  HasilSkemaTarifUmum,
  HasilAuditPajakLengkap,
} from '../types/pajak';
import { inputAuditPajakSchema } from './schemas';
import { evaluasiKelayakanPphFinal, evaluasiKelayakanNppn, evaluasiKelayakanTarifUmum } from './eligibility';
import { hitungPphFinal, hitungPphNppn, hitungPphTarifUmum } from './calculator';

export function auditPajakMandiri(input: InputAuditPajak, regulasi: DatabaseRegulasi): HasilAuditPajakLengkap {
  // 1. Validasi Input Zod
  const parsed = inputAuditPajakSchema.parse(input);
  const profil = parsed.profil;
  const kreditPajak = parsed.kreditPajak;

  const totalKreditPajak = kreditPajak.reduce((sum, item) => sum + item.nominal, 0);

  // 2. Evaluasi Kelayakan Masing-Masing Skema
  const kelayakanPphFinal = evaluasiKelayakanPphFinal(profil, regulasi);
  const kelayakanNppn = evaluasiKelayakanNppn(profil, regulasi);
  const kelayakanTarifUmum = evaluasiKelayakanTarifUmum(profil, regulasi);

  // 3. Menghitung PPh Final (jika kelayakan BOLEH dan param TERVERIFIKASI)
  let hasilPphFinal: HasilSkemaPphFinal;
  const pphFinalParam = regulasi.parameterPajak.pphFinal;

  if (kelayakanPphFinal.status !== 'BOLEH') {
    hasilPphFinal = {
      id: 'PPH_FINAL_05',
      statusKelayakan: kelayakanPphFinal.status,
      alasanKelayakan: kelayakanPphFinal.alasan,
      dasarHukum: kelayakanPphFinal.dasarHukum,
      statusKalkulasi: 'TIDAK_RELEVAN',
    };
  } else if (
    pphFinalParam.tarif.statusVerifikasi === 'DALAM_REVIEW' ||
    pphFinalParam.ambangOmzet.statusVerifikasi === 'DALAM_REVIEW' ||
    pphFinalParam.pembebasanOmzetOp.statusVerifikasi === 'DALAM_REVIEW'
  ) {
    hasilPphFinal = {
      id: 'PPH_FINAL_05',
      statusKelayakan: kelayakanPphFinal.status,
      alasanKelayakan: kelayakanPphFinal.alasan,
      dasarHukum: kelayakanPphFinal.dasarHukum,
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Parameter pembebasan omzet/tarif sedang diverifikasi tim legal.',
    };
  } else {
    const { pajakTerutang, rincian } = hitungPphFinal({
      omzetPribadiTahunPajak: profil.omzetPribadiTahunPajak,
      tarif: pphFinalParam.tarif.nilai,
      batasPembebasan: pphFinalParam.pembebasanOmzetOp.nilai,
    });
    
    hasilPphFinal = {
      id: 'PPH_FINAL_05',
      statusKelayakan: kelayakanPphFinal.status,
      alasanKelayakan: kelayakanPphFinal.alasan,
      dasarHukum: kelayakanPphFinal.dasarHukum,
      statusKalkulasi: 'TERSEDIA',
      pajakTerutang,
      rincianKalkulasi: {
        skema: 'PPH_FINAL_05',
        ...rincian
      }
    };
  }

  // 4. Menghitung NPPN
  let hasilNppn: HasilSkemaNppn;
  const nppnParam = regulasi.parameterPajak.nppn;
  const ptkpParam = regulasi.parameterPajak.ptkp;
  const tarifProgresifParam = regulasi.parameterPajak.tarifProgresif;

  // Dapatkan persen norma dari KLU dan wilayah Wajib Pajak
  const kluTerkait = regulasi.klu?.find((k) => k.kluKode === profil.kluKode);
  const persenNorma = kluTerkait?.persenNorma?.[profil.wilayah];

  if (kelayakanNppn.status !== 'BOLEH') {
    hasilNppn = {
      id: 'NPPN',
      statusKelayakan: kelayakanNppn.status,
      alasanKelayakan: kelayakanNppn.alasan,
      dasarHukum: kelayakanNppn.dasarHukum,
      statusKalkulasi: 'TIDAK_RELEVAN',
    };
  } else if (
    profil.punyaLebihDariSatuKegiatan === true ||
    profil.punyaLebihDariSatuKegiatan === 'tidak_yakin'
  ) {
    hasilNppn = {
      id: 'NPPN',
      statusKelayakan: kelayakanNppn.status,
      alasanKelayakan: kelayakanNppn.alasan,
      dasarHukum: kelayakanNppn.dasarHukum,
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Sistem hanya menghitung NPPN untuk satu jenis kegiatan usaha/pekerjaan bebas. Hitung manual untuk multi-kegiatan.',
    };
  } else if (persenNorma === undefined) {
    hasilNppn = {
      id: 'NPPN',
      statusKelayakan: kelayakanNppn.status,
      alasanKelayakan: kelayakanNppn.alasan,
      dasarHukum: kelayakanNppn.dasarHukum,
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Data persentase norma untuk KLU atau kelompok wilayah yang dipilih belum tersedia dalam database regulasi.',
    };
  } else if (
    ptkpParam.statusVerifikasi === 'DALAM_REVIEW' ||
    tarifProgresifParam.statusVerifikasi === 'DALAM_REVIEW'
  ) {
    hasilNppn = {
      id: 'NPPN',
      statusKelayakan: kelayakanNppn.status,
      alasanKelayakan: kelayakanNppn.alasan,
      dasarHukum: kelayakanNppn.dasarHukum,
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Parameter PTKP atau tarif progresif sedang diverifikasi.',
    };
  } else {
    const ptkpNilai = ptkpParam.nilai[profil.statusPtkp];
    
    const { pajakTerutang, rincian } = hitungPphNppn({
      omzetPribadiTahunPajak: profil.omzetPribadiTahunPajak,
      persenNorma,
      ptkp: ptkpNilai,
      kreditBupot: totalKreditPajak,
      lapisanTarif: tarifProgresifParam.lapisan,
    });

    const dasarHukumNppn = [...kelayakanNppn.dasarHukum];
    if (kluTerkait?.dasarHukum) {
      dasarHukumNppn.push(...kluTerkait.dasarHukum);
    }

    hasilNppn = {
      id: 'NPPN',
      statusKelayakan: kelayakanNppn.status,
      alasanKelayakan: kelayakanNppn.alasan,
      dasarHukum: dasarHukumNppn,
      statusKalkulasi: 'TERSEDIA',
      pajakTerutang,
      rincianKalkulasi: {
        skema: 'NPPN',
        ...rincian
      }
    };
  }

  // 5. Menghitung Tarif Umum
  let hasilTarifUmum: HasilSkemaTarifUmum;

  if (kelayakanTarifUmum.status !== 'BOLEH') {
    hasilTarifUmum = {
      id: 'TARIF_UMUM',
      statusKelayakan: kelayakanTarifUmum.status,
      alasanKelayakan: kelayakanTarifUmum.alasan,
      dasarHukum: kelayakanTarifUmum.dasarHukum,
      statusKalkulasi: 'TIDAK_RELEVAN',
    };
  } else if (profil.biayaOperasionalRiil === undefined) {
    // Sesuai point ke-2 dari guardrail: biayaOperasional kosong jangan dianggap nol
    hasilTarifUmum = {
      id: 'TARIF_UMUM',
      statusKelayakan: kelayakanTarifUmum.status,
      alasanKelayakan: kelayakanTarifUmum.alasan,
      dasarHukum: kelayakanTarifUmum.dasarHukum,
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Biaya operasional riil belum diisi. Silakan lengkapi untuk menghitung Tarif Umum.',
    };
  } else if (
    ptkpParam.statusVerifikasi === 'DALAM_REVIEW' ||
    tarifProgresifParam.statusVerifikasi === 'DALAM_REVIEW'
  ) {
    hasilTarifUmum = {
      id: 'TARIF_UMUM',
      statusKelayakan: kelayakanTarifUmum.status,
      alasanKelayakan: kelayakanTarifUmum.alasan,
      dasarHukum: kelayakanTarifUmum.dasarHukum,
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Parameter PTKP atau tarif progresif sedang diverifikasi.',
    };
  } else {
    const ptkpNilai = ptkpParam.nilai[profil.statusPtkp];
    
    const { pajakTerutang, rincian } = hitungPphTarifUmum({
      omzetPribadiTahunPajak: profil.omzetPribadiTahunPajak,
      biayaOperasional: profil.biayaOperasionalRiil,
      ptkp: ptkpNilai,
      kreditBupot: totalKreditPajak,
      lapisanTarif: tarifProgresifParam.lapisan,
    });

    hasilTarifUmum = {
      id: 'TARIF_UMUM',
      statusKelayakan: kelayakanTarifUmum.status,
      alasanKelayakan: kelayakanTarifUmum.alasan,
      dasarHukum: kelayakanTarifUmum.dasarHukum,
      statusKalkulasi: 'TERSEDIA',
      pajakTerutang,
      rincianKalkulasi: {
        skema: 'TARIF_UMUM',
        ...rincian
      }
    };
  }

  return {
    skema: [hasilPphFinal, hasilNppn, hasilTarifUmum],
  };
}
