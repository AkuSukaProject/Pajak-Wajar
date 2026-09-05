import { hitungNppn, hitungPphFinal, hitungTarifUmum, totalKreditBupot } from '@/lib/calculator';
import { periksaKelayakan } from '@/lib/eligibility';
import type { KelayakanSkema } from '@/lib/eligibility';
import { basisAturan, cariKlu, persenNorma } from '@/lib/regulasi';
import { inputAuditPajakSchema } from '@/lib/schemas';
import type {
  HasilAuditPajak,
  HasilSkema,
  HasilSkemaNppn,
  HasilSkemaPphFinal,
  HasilSkemaTarifUmum,
  IdSkema,
  InputAuditPajak
} from '@/types/pajak';

/**
 * Orkestrator tunggal: validasi masukan, uji kelayakan, lalu hitung hanya untuk
 * skema yang berhak dan yang seluruh parameternya sudah terverifikasi.
 *
 * Status kelayakan (legal) tidak pernah diturunkan gara-gara kalkulasi diblokir.
 */

const PARAMETER = basisAturan.parameterPajak;

class GalatMasukan extends Error {
  constructor(pesan: string) {
    super(pesan);
    this.name = 'GalatMasukan';
  }
}

function kelayakanDari(daftar: KelayakanSkema[], id: IdSkema): KelayakanSkema {
  const ditemukan = daftar.find((item) => item.id === id);
  if (!ditemukan) throw new GalatMasukan(`Skema ${id} tidak dihasilkan mesin kelayakan.`);
  return ditemukan;
}

function bagianKelayakan(skema: KelayakanSkema) {
  return {
    statusKelayakan: skema.statusKelayakan,
    syarat: skema.syarat,
    alasanKelayakan: skema.alasanKelayakan,
    dasarHukum: skema.dasarHukum,
    konsekuensiJangkaPanjang: skema.konsekuensiJangkaPanjang
  };
}

const ALASAN_TIDAK_RELEVAN =
  'Perkiraan nominal tidak ditampilkan karena hak memakai skema ini belum pasti. Selesaikan dulu bagian yang perlu dipastikan.';

/**
 * Menjalankan pemeriksaan penuh untuk satu profil Wajib Pajak orang pribadi.
 *
 * @throws {GalatMasukan} bila masukan tidak lolos skema Zod.
 */
export function auditPajakMandiri(input: InputAuditPajak): HasilAuditPajak {
  const tervalidasi = inputAuditPajakSchema.safeParse(input);
  if (!tervalidasi.success) {
    const rincian = tervalidasi.error.issues
      .map((issue) => `${issue.path.join('.') || 'masukan'}: ${issue.message}`)
      .join('; ');
    throw new GalatMasukan(`Masukan belum lengkap atau tidak wajar. ${rincian}`);
  }

  const { profil, kreditPajak } = input;
  const kelayakan = periksaKelayakan(profil);
  const klu = cariKlu(profil.kluKode);
  const kreditBupot = totalKreditBupot(kreditPajak);

  // ----- PPh Final 0,5% -----
  const kelayakanFinal = kelayakanDari(kelayakan.skema, 'PPH_FINAL_05');
  const pembebasan = PARAMETER.pphFinal.pembebasanOmzetOp;
  let skemaFinal: HasilSkemaPphFinal;

  if (kelayakanFinal.statusKelayakan !== 'BOLEH') {
    skemaFinal = {
      id: 'PPH_FINAL_05',
      ...bagianKelayakan(kelayakanFinal),
      statusKalkulasi: 'TIDAK_RELEVAN',
      alasanKalkulasi: ALASAN_TIDAK_RELEVAN
    };
  } else if (pembebasan.statusVerifikasi === 'DALAM_REVIEW') {
    skemaFinal = {
      id: 'PPH_FINAL_05',
      ...bagianKelayakan(kelayakanFinal),
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi:
        'Dasar pembebasan Rp500 juta masih dalam pemeriksaan ke teks asli, sehingga nominalnya belum kami tampilkan.'
    };
  } else {
    const rincian = hitungPphFinal({
      omzetPribadi: profil.omzetPribadiTahunPajak,
      batasPembebasan: pembebasan.nilai,
      tarif: PARAMETER.pphFinal.tarif.nilai
    });
    skemaFinal = {
      id: 'PPH_FINAL_05',
      ...bagianKelayakan(kelayakanFinal),
      statusKalkulasi: 'TERSEDIA',
      pajakTerutang: rincian.pajakTerutang,
      rincianKalkulasi: rincian
    };
  }

  // ----- Norma NPPN -----
  const kelayakanNppn = kelayakanDari(kelayakan.skema, 'NPPN');
  let skemaNppn: HasilSkemaNppn;

  if (kelayakanNppn.statusKelayakan !== 'BOLEH') {
    skemaNppn = {
      id: 'NPPN',
      ...bagianKelayakan(kelayakanNppn),
      statusKalkulasi: 'TIDAK_RELEVAN',
      alasanKalkulasi: ALASAN_TIDAK_RELEVAN
    };
  } else if (!klu) {
    skemaNppn = {
      id: 'NPPN',
      ...bagianKelayakan(kelayakanNppn),
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi: 'Persentase Norma belum tersedia untuk pekerjaan yang Anda pilih.'
    };
  } else if (profil.punyaLebihDariSatuKegiatan !== false) {
    skemaNppn = {
      id: 'NPPN',
      ...bagianKelayakan(kelayakanNppn),
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi:
        'Persentase Norma berbeda untuk tiap kegiatan, jadi omzet gabungan tidak boleh dikalikan satu persentase saja. Hitung tiap kegiatan secara terpisah.'
    };
  } else {
    const rincian = hitungNppn({
      omzetPribadi: profil.omzetPribadiTahunPajak,
      persenNorma: persenNorma(klu, profil.wilayah),
      ptkp: PARAMETER.ptkp.nilai[profil.statusPtkp],
      kreditBupot,
      lapisan: PARAMETER.tarifProgresif.lapisan
    });
    skemaNppn = {
      id: 'NPPN',
      ...bagianKelayakan(kelayakanNppn),
      statusKalkulasi: 'TERSEDIA',
      pajakTerutang: rincian.pajakTerutang,
      rincianKalkulasi: rincian
    };
  }

  // ----- Tarif umum -----
  const kelayakanTarifUmum = kelayakanDari(kelayakan.skema, 'TARIF_UMUM');
  let skemaTarifUmum: HasilSkemaTarifUmum;

  if (kelayakanTarifUmum.statusKelayakan !== 'BOLEH') {
    skemaTarifUmum = {
      id: 'TARIF_UMUM',
      ...bagianKelayakan(kelayakanTarifUmum),
      statusKalkulasi: 'TIDAK_RELEVAN',
      alasanKalkulasi: ALASAN_TIDAK_RELEVAN
    };
  } else if (profil.biayaOperasionalRiil === undefined) {
    skemaTarifUmum = {
      id: 'TARIF_UMUM',
      ...bagianKelayakan(kelayakanTarifUmum),
      statusKalkulasi: 'BELUM_TERSEDIA',
      alasanKalkulasi:
        'Isi dulu total biaya usaha setahun. Biaya yang dikosongkan tidak boleh dianggap Rp0 karena membuat pajaknya terlihat jauh lebih besar dari seharusnya.'
    };
  } else {
    const rincian = hitungTarifUmum({
      omzetPribadi: profil.omzetPribadiTahunPajak,
      biayaOperasional: profil.biayaOperasionalRiil,
      ptkp: PARAMETER.ptkp.nilai[profil.statusPtkp],
      kreditBupot,
      lapisan: PARAMETER.tarifProgresif.lapisan
    });
    skemaTarifUmum = {
      id: 'TARIF_UMUM',
      ...bagianKelayakan(kelayakanTarifUmum),
      statusKalkulasi: 'TERSEDIA',
      pajakTerutang: rincian.pajakTerutang,
      rincianKalkulasi: rincian
    };
  }

  const skema: HasilSkema[] = [skemaFinal, skemaNppn, skemaTarifUmum];

  const terhitung = skema.filter(
    (item): item is HasilSkema & { statusKalkulasi: 'TERSEDIA'; pajakTerutang: number } =>
      item.statusKalkulasi === 'TERSEDIA'
  );

  const rekomendasiHemat = terhitung.length
    ? terhitung.reduce((termurah, kandidat) =>
        kandidat.pajakTerutang < termurah.pajakTerutang ? kandidat : termurah
      )
    : undefined;

  return {
    versiRegulasi: basisAturan.versiRegulasi,
    tanggalAudit: new Date().toISOString().slice(0, 10),
    profil,
    totalKreditBupot: kreditBupot,
    skema,
    peringatan: kelayakan.peringatan,
    langkahTindakLanjut: kelayakan.langkahTindakLanjut,
    rekomendasiHemat: rekomendasiHemat
      ? { id: rekomendasiHemat.id, pajakTerutang: rekomendasiHemat.pajakTerutang }
      : undefined
  };
}

export { GalatMasukan };
export { periksaKelayakan } from '@/lib/eligibility';
export { basisAturan, cariKlu, daftarKlu } from '@/lib/regulasi';
