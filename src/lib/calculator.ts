import { LapisanTarif, RincianPphFinal, RincianNppn, RincianTarifUmum } from '../types/pajak';

export function hitungPphFinal({
  omzetPribadiTahunPajak,
  tarif,
  batasPembebasan,
}: {
  omzetPribadiTahunPajak: number;
  tarif: number;
  batasPembebasan: number;
}): { pajakTerutang: number; rincian: Omit<RincianPphFinal, 'skema'> } {
  const dasarPengenaan = Math.max(0, omzetPribadiTahunPajak - batasPembebasan);
  const pajakTerutang = dasarPengenaan * tarif;

  return {
    pajakTerutang,
    rincian: {
      omzetPribadi: omzetPribadiTahunPajak,
      batasPembebasan,
      dasarPengenaan,
      tarif,
    },
  };
}

export function hitungTarifProgresif(pkp: number, lapisanTarif: LapisanTarif[]): number {
  if (pkp <= 0) return 0;
  let pajak = 0;
  let sisaPkp = pkp;

  // Ensure layers are sorted by batasBawah just in case
  const sortedLayers = [...lapisanTarif].sort((a, b) => a.batasBawah - b.batasBawah);

  for (const lapisan of sortedLayers) {
    const batasAtas = lapisan.batasAtas;
    const rentang = batasAtas === null ? sisaPkp : Math.min(sisaPkp, batasAtas - lapisan.batasBawah);
    
    if (rentang > 0) {
      pajak += rentang * lapisan.tarif;
      sisaPkp -= rentang;
    }
    
    if (sisaPkp <= 0) break;
  }

  return Math.round(pajak); // round to nearest integer as tax
}

export function hitungPphNppn({
  omzetPribadiTahunPajak,
  persenNorma,
  ptkp,
  kreditBupot,
  lapisanTarif,
}: {
  omzetPribadiTahunPajak: number;
  persenNorma: number;
  ptkp: number;
  kreditBupot: number;
  lapisanTarif: LapisanTarif[];
}): { pajakTerutang: number; rincian: Omit<RincianNppn, 'skema'> } {
  const penghasilanNeto = Math.round(omzetPribadiTahunPajak * persenNorma);
  const pkp = Math.max(0, penghasilanNeto - ptkp);
  const pajakTerutangDasar = hitungTarifProgresif(pkp, lapisanTarif);
  const pajakTerutang = pajakTerutangDasar - kreditBupot;

  return {
    pajakTerutang, // can be negative (lebih bayar)
    rincian: {
      omzetPribadi: omzetPribadiTahunPajak,
      persenNorma,
      penghasilanNeto,
      ptkp,
      pkp,
      kreditBupot,
    },
  };
}

export function hitungPphTarifUmum({
  omzetPribadiTahunPajak,
  biayaOperasional,
  ptkp,
  kreditBupot,
  lapisanTarif,
}: {
  omzetPribadiTahunPajak: number;
  biayaOperasional: number;
  ptkp: number;
  kreditBupot: number;
  lapisanTarif: LapisanTarif[];
}): { pajakTerutang: number; rincian: Omit<RincianTarifUmum, 'skema'> } {
  const penghasilanNeto = Math.max(0, omzetPribadiTahunPajak - biayaOperasional);
  const pkp = Math.max(0, penghasilanNeto - ptkp);
  const pajakTerutangDasar = hitungTarifProgresif(pkp, lapisanTarif);
  const pajakTerutang = pajakTerutangDasar - kreditBupot;

  return {
    pajakTerutang, // can be negative (lebih bayar)
    rincian: {
      omzetPribadi: omzetPribadiTahunPajak,
      biayaOperasional,
      penghasilanNeto,
      ptkp,
      pkp,
      kreditBupot,
    },
  };
}
