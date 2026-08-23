export type TahunPajak = 2025 | 2026;
export type StatusPtkp = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
export type JawabanKepatuhan = boolean | 'tidak_yakin';
export type IdSkema = 'PPH_FINAL_05' | 'NPPN' | 'TARIF_UMUM';
export type StatusKelayakan = 'BOLEH' | 'TIDAK_BOLEH' | 'PERLU_DIPASTIKAN';

export type ProfilWajibPajak = {
  tahunPajak: TahunPajak;
  kluKode: string;
  statusPtkp: StatusPtkp;
  omzetPribadi: number;
  omzetPasangan: number;
  omzetPerseroanPerorangan: number;
  sudahLaporLA0401: JawabanKepatuhan;
  pernahPilihTarifUmum: JawabanKepatuhan;
  jugaPegawaiTetap: boolean;
};

export type HasilKelayakan = {
  skema: Array<{
    id: IdSkema;
    status: StatusKelayakan;
    alasan: string;
    dasarHukum: string;
    konsekuensiJangkaPanjang?: string;
  }>;
  peringatan: string[];
  langkahTindakLanjut: string[];
};
