export type TahunPajak = 2025 | 2026;
export type KelompokWilayahKey = 'kelompok1' | 'kelompok2' | 'kelompok3';
export type StatusPtkp = 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export type StatusPerpajakanPasangan =
  | 'GABUNG'
  | 'PISAH_HARTA'
  | 'PISAH_KEWAJIBAN'
  | 'TIDAK_YAKIN'
  | 'TIDAK_ADA_PASANGAN';

export type BentukKegiatan =
  | 'PEKERJAAN_BEBAS'
  | 'USAHA_JASA'
  | 'USAHA_DAGANG'
  | 'BELUM_PASTI';

export type StatusVerifikasi = 'TERVERIFIKASI' | 'DALAM_REVIEW';
export type OperatorAmbang = 'LT' | 'LTE';

export type StatusKalkulasi =
  | 'TERSEDIA'
  | 'BELUM_TERSEDIA'
  | 'TIDAK_RELEVAN';

export interface DasarHukumDetail {
  namaRegulasi: string;
  pasalAtauLampiran: string;
  fungsi: string;
  url: string;
  statusVerifikasi: StatusVerifikasi;
}

export interface ParameterBerStatus<T> {
  nilai: T;
  statusVerifikasi: StatusVerifikasi;
  dasarHukum: DasarHukumDetail[];
}

export interface ParameterAmbang {
  nilai: number;
  operator: OperatorAmbang;
  statusVerifikasi: StatusVerifikasi;
  dasarHukum: DasarHukumDetail[];
}

export interface AturanPajak {
  statusVerifikasi: StatusVerifikasi;
  dasarHukum: DasarHukumDetail[];
}

export interface LapisanTarif {
  batasBawah: number;
  batasAtas: number | null;
  tarif: number;
}

export interface ParameterTarifProgresif {
  lapisan: LapisanTarif[];
  statusVerifikasi: StatusVerifikasi;
  dasarHukum: DasarHukumDetail[];
}

export interface ParameterPtkp {
  nilai: Record<StatusPtkp, number>;
  statusVerifikasi: StatusVerifikasi;
  dasarHukum: DasarHukumDetail[];
}

export interface KluItem {
  kluKode: string;
  nama?: string;
  persenNorma?: Partial<Record<KelompokWilayahKey, number>>;
  dasarHukum: DasarHukumDetail[];
}

export interface DatabaseRegulasi {
  versiRegulasi: string;
  statusDokumen: string;
  tahunPajakDidukung: number[];
  lingkupWajibPajak: string;
  parameterPajak: {
    pphFinal: {
      tarif: ParameterBerStatus<number>;
      ambangOmzet: ParameterAmbang;
      pembebasanOmzetOp: ParameterBerStatus<number>;
    };
    nppn: {
      ambangOmzet: ParameterAmbang;
      batasPemberitahuanBulan: ParameterBerStatus<number>;
    };
    tarifProgresif: ParameterTarifProgresif;
    ptkp: ParameterPtkp;
  };
  aturanKelayakan: {
    pekerjaanBebas: AturanPajak;
    ambangKonsolidasi: AturanPajak;
    pilihanTarifUmum: AturanPajak;
    administrasiNppn: AturanPajak;
    ketentuanPeralihan: AturanPajak & { catatanReview?: string };
  };
  kelompokWilayah: Record<KelompokWilayahKey, { nama: string; deskripsi: string }>;
  klu: KluItem[];
}

export interface ProfilWajibPajak {
  tahunPajak: TahunPajak;
  kluKode: string;
  wilayah: KelompokWilayahKey;
  statusPtkp: StatusPtkp;
  bentukKegiatan: BentukKegiatan;
  statusPerpajakanPasangan: StatusPerpajakanPasangan;
  punyaLebihDariSatuKegiatan: boolean | 'tidak_yakin';

  // Tahun pajak berjalan
  omzetPribadiTahunPajak: number;
  biayaOperasionalRiil?: number;

  // Tahun sebelumnya
  omzetPribadiThnSebelumnya: number;
  omzetPasanganThnSebelumnya: number;
  omzetSeluruhPerseroanPeroranganThnSebelumnya: number;

  sudahMemberitahukanNppn: boolean | 'tidak_yakin';
  pernahPilihTarifUmum: boolean | 'tidak_yakin';
  jugaPegawaiTetap: boolean;
}

export interface KreditPajakItem {
  jenis: string;
  nominal: number;
}

export interface InputAuditPajak {
  profil: ProfilWajibPajak;
  kreditPajak: KreditPajakItem[];
}

export type RincianPphFinal = {
  skema: 'PPH_FINAL_05';
  omzetPribadi: number;
  batasPembebasan: number;
  dasarPengenaan: number;
  tarif: number;
};

export type RincianNppn = {
  skema: 'NPPN';
  omzetPribadi: number;
  persenNorma: number;
  penghasilanNeto: number;
  ptkp: number;
  pkp: number;
  kreditBupot: number;
};

export type RincianTarifUmum = {
  skema: 'TARIF_UMUM';
  omzetPribadi: number;
  biayaOperasional: number;
  penghasilanNeto: number;
  ptkp: number;
  pkp: number;
  kreditBupot: number;
};

export type StatusKelayakan = 'BOLEH' | 'TIDAK_BOLEH' | 'PERLU_DIPASTIKAN';

export type BaseHasilSkema = {
  statusKelayakan: StatusKelayakan;
  alasanKelayakan: string[];
  dasarHukum: DasarHukumDetail[];
};

export type HasilSkemaTersedia<T extends RincianPphFinal | RincianNppn | RincianTarifUmum> = BaseHasilSkema & {
  statusKalkulasi: 'TERSEDIA';
  pajakTerutang: number;
  rincianKalkulasi: T;
};

export type HasilSkemaTidakTersedia = BaseHasilSkema & {
  statusKalkulasi: 'BELUM_TERSEDIA' | 'TIDAK_RELEVAN';
  alasanKalkulasi?: string;
  // pajakTerutang dan rincianKalkulasi tidak boleh ada di sini
};

export type HasilSkemaPphFinal = (BaseHasilSkema & { id: 'PPH_FINAL_05' }) &
  (HasilSkemaTersedia<RincianPphFinal> | HasilSkemaTidakTersedia);

export type HasilSkemaNppn = (BaseHasilSkema & { id: 'NPPN' }) &
  (HasilSkemaTersedia<RincianNppn> | HasilSkemaTidakTersedia);

export type HasilSkemaTarifUmum = (BaseHasilSkema & { id: 'TARIF_UMUM' }) &
  (HasilSkemaTersedia<RincianTarifUmum> | HasilSkemaTidakTersedia);

export type HasilSkema = HasilSkemaPphFinal | HasilSkemaNppn | HasilSkemaTarifUmum;

export interface HasilAuditPajakLengkap {
  rekomendasiUtama?: string;
  skema: HasilSkema[];
  peringatanTaxLeakage?: string[];
}

export type JenisBupot = 'PPH_21' | 'PPH_23';
export type SumberBupot = 'manual' | 'ocr';
export type StatusRekonsiliasi = 'KURANG_BAYAR' | 'NIHIL' | 'LEBIH_BAYAR';

export interface BuktiPotong {
  id: string;
  nomorBupot: string;
  npwpPemotong: string;
  namaPemotong: string;
  jenisPph: JenisBupot;
  dpp: number;           // Dasar Pengenaan Pajak
  pphDipotong: number;   // PPh yang dipotong
  masaPajak: string;     // format MM-YYYY atau keterangan masa
  sumber: SumberBupot;   // transparansi sumber data
  perluPemeriksaanManual?: boolean; // penanda jika data buram atau perlu verifikasi ekstra
}

export interface HasilRekonsiliasiBupot {
  pajakTerutangDasar: number;
  totalDpp: number;
  totalKreditBupot: number;
  sisaPajak: number; // nilai selisih absolut untuk display
  status: StatusRekonsiliasi;
  konsekuensiHukum: string;
  daftarBupot: BuktiPotong[];
}

