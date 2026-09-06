import type { DasarHukumDetail, JawabanKepatuhan } from '@/types/pajak';

type CatatanInvestasi = {
  id: string;
  nama: string;
  pemilik: 'ANDA' | 'PASANGAN';
  bruto?: number;
  pajakDibayar?: number;
  nomorBukti?: string;
};

export type PenghasilanInvestasi = CatatanInvestasi & (
  | { jenis: 'DEPOSITO'; simpananBiasa: JawabanKepatuhan; totalSimpanan?: number; tidakDipecah: JawabanKepatuhan }
  | { jenis: 'SAHAM_BURSA'; sahamBursaIndonesiaNonPendiri: JawabanKepatuhan }
  | { jenis: 'DIVIDEN_DN'; dividenResmiDalamNegeri: JawabanKepatuhan; reinvestasi: 'TIDAK' | 'MEMENUHI' | 'BELUM_PASTI'; jumlahReinvestasi?: number }
);

export type HasilInvestasi = {
  input: PenghasilanInvestasi;
  dasarHukum: DasarHukumDetail[];
  penjelasan: string;
} & (
  | { status: 'PERLU_DIPASTIKAN' }
  | {
      status: 'TERHITUNG';
      klasifikasi: 'FINAL' | 'TANPA_PEMOTONGAN' | 'BUKAN_OBJEK' | 'SEBAGIAN_FINAL';
      dasarPengenaan: number;
      bukanObjek: number;
      tarif: number;
      pajakTerutang: number;
      /** Kosong berarti bukti belum lengkap, bukan belum membayar. */
      pencocokan?: { dibayar: number; selisih: number };
    }
);
