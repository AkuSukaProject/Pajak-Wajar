import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';
import basisAturan from '../data/klu_rules.json';
import skema from '../data/klu_rules.schema.json';

/**
 * Integritas basis aturan. Berkas JSON adalah sumber kebenaran regulasi,
 * sehingga bentuknya diperiksa lebih ketat daripada kode yang membacanya.
 */

const DOMAIN_PRIMER = ['jdih.kemenkeu.go.id', 'pajak.go.id', 'www.pajak.go.id'];

type DasarHukum = {
  namaRegulasi: string;
  pasalAtauLampiran: string;
  fungsi: string;
  url: string;
  statusVerifikasi: string;
};

/** Menelusuri seluruh entri dasar hukum di mana pun letaknya dalam berkas. */
function semuaDasarHukum(nilai: unknown, kumpulan: DasarHukum[] = []): DasarHukum[] {
  if (Array.isArray(nilai)) {
    for (const anak of nilai) semuaDasarHukum(anak, kumpulan);
    return kumpulan;
  }
  if (nilai && typeof nilai === 'object') {
    const objek = nilai as Record<string, unknown>;
    if (typeof objek.namaRegulasi === 'string' && typeof objek.url === 'string') {
      kumpulan.push(objek as unknown as DasarHukum);
    }
    for (const anak of Object.values(objek)) semuaDasarHukum(anak, kumpulan);
  }
  return kumpulan;
}

describe('bentuk berkas aturan', () => {
  it('lolos validasi JSON Schema Draft 2020-12', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validasi = ajv.compile(skema);
    const lolos = validasi(basisAturan);
    expect(validasi.errors ?? []).toEqual([]);
    expect(lolos).toBe(true);
  });

  it('menolak berkas dengan properti tak dikenal', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validasi = ajv.compile(skema);
    expect(validasi({ ...basisAturan, propertiSelundupan: true })).toBe(false);
  });
});

describe('integritas isi aturan', () => {
  it('setiap dasar hukum menunjuk domain sumber primer', () => {
    const daftar = semuaDasarHukum(basisAturan);
    expect(daftar.length).toBeGreaterThan(10);
    for (const dasar of daftar) {
      const host = new URL(dasar.url).host;
      expect(DOMAIN_PRIMER, `${dasar.namaRegulasi} ${dasar.pasalAtauLampiran}`).toContain(host);
    }
  });

  it('tidak ada sitasi ke Pasal 59 PP 20/2026 yang sudah dihapus', () => {
    const daftar = semuaDasarHukum(basisAturan);
    const menyebutPasal59 = daftar.filter(
      (dasar) =>
        dasar.namaRegulasi.includes('20 Tahun 2026') && /Pasal 59\b/.test(dasar.pasalAtauLampiran)
    );
    expect(menyebutPasal59).toEqual([]);
  });

  it('pembebasan Rp500 juta dirujuk ke UU HPP dan PP 55/2022, bukan PP 20/2026', () => {
    const pembebasan = basisAturan.parameterPajak.pphFinal.pembebasanOmzetOp;
    expect(pembebasan.nilai).toBe(500_000_000);
    expect(pembebasan.basisTahun).toBe('TAHUN_PAJAK_BERJALAN');
    const regulasi = pembebasan.dasarHukum.map((dasar) => dasar.namaRegulasi);
    expect(regulasi.some((nama) => nama.includes('7 Tahun 2021'))).toBe(true);
    expect(regulasi.some((nama) => nama.includes('55 Tahun 2022'))).toBe(true);
    expect(regulasi.some((nama) => nama.includes('20 Tahun 2026'))).toBe(false);
  });

  it('kode KLU unik dan setiap KLU memiliki norma untuk tiga kelompok wilayah', () => {
    const kode = basisAturan.klu.map((entri) => entri.kluKode);
    expect(new Set(kode).size).toBe(kode.length);
    for (const entri of basisAturan.klu) {
      expect(Object.keys(entri.normaPersen).sort()).toEqual(['kelompok1', 'kelompok2', 'kelompok3']);
    }
  });

  it('KLU pekerjaan bebas selalu menyebut huruf Pasal 56 ayat (4) yang dirujuk', () => {
    for (const entri of basisAturan.klu) {
      if (entri.pekerjaanBebas === 'TIDAK') {
        expect(entri.rujukanPasal56Ayat4).toBeNull();
      } else {
        expect(entri.rujukanPasal56Ayat4).toBeTruthy();
      }
    }
  });

  it('lapisan tarif progresif bersambung tanpa celah dan berakhir terbuka', () => {
    const lapisan = basisAturan.parameterPajak.tarifProgresif.lapisan;
    expect(lapisan[0].batasBawah).toBe(0);
    for (let i = 1; i < lapisan.length; i += 1) {
      expect(lapisan[i].batasBawah).toBe(lapisan[i - 1].batasAtas);
    }
    expect(lapisan[lapisan.length - 1].batasAtas).toBeNull();
  });

  it('persentase norma cocok dengan Lampiran I PER-17/PJ/2015', () => {
    // Fixture ini disalin baris per baris dari Lampiran I. Bila ada yang
    // berubah, lampirannya harus dibaca ulang sebelum angkanya diubah.
    const fixture: Record<string, [number, number, number]> = {
      '90002': [50, 50, 50],
      '90005': [35, 32.5, 31.5],
      '62010': [50, 50, 50],
      '74100': [32, 31, 29],
      '74201': [50, 50, 50],
      '70209': [50, 50, 50],
      '69100': [51, 50, 50],
      '69200': [50, 50, 50],
      '86201': [50, 50, 50],
      '86202': [50, 50, 50],
      '71100': [50, 50, 50],
      '85499': [30, 27.5, 25],
      '47919': [30, 25, 20],
      '47711': [30, 25, 20],
      '47111': [30, 25, 20],
      '56101': [25, 20, 20],
      '96111': [30, 28, 27],
      '96112': [30, 28, 27],
      '96200': [40, 38, 36],
      '45407': [20, 18.5, 17.5],
      '14111': [13.5, 13, 12.5],
      '10710': [15, 12.5, 10]
    };
    expect(basisAturan.klu.map((entri) => entri.kluKode).sort()).toEqual(
      Object.keys(fixture).sort()
    );
    for (const entri of basisAturan.klu) {
      const harapan = fixture[entri.kluKode];
      expect(
        [entri.normaPersen.kelompok1, entri.normaPersen.kelompok2, entri.normaPersen.kelompok3],
        `${entri.kluKode} ${entri.uraianLampiran}`
      ).toEqual(harapan);
    }
  });

  it('persentase norma tidak pernah naik dari kelompok 1 ke kelompok 3', () => {
    for (const entri of basisAturan.klu) {
      expect(entri.normaPersen.kelompok1).toBeGreaterThanOrEqual(entri.normaPersen.kelompok2);
      expect(entri.normaPersen.kelompok2).toBeGreaterThanOrEqual(entri.normaPersen.kelompok3);
    }
  });

  it('angka kunci sesuai fixture yang diperiksa manusia', () => {
    expect(basisAturan.parameterPajak.pphFinal.tarif.nilai).toBe(0.005);
    expect(basisAturan.parameterPajak.pphFinal.ambangPeredaranBruto.nilai).toBe(4_800_000_000);
    expect(basisAturan.parameterPajak.pphFinal.ambangPeredaranBruto.operator).toBe('LTE');
    expect(basisAturan.parameterPajak.pphFinal.ambangPeredaranBruto.basisTahun).toBe(
      'TAHUN_PAJAK_SEBELUMNYA'
    );
    expect(basisAturan.parameterPajak.nppn.ambangPeredaranBruto.operator).toBe('LT');
    expect(basisAturan.parameterPajak.ptkp.nilai['TK/0']).toBe(54_000_000);
    expect(basisAturan.parameterPajak.ptkp.nilai['K/3']).toBe(72_000_000);
  });
});
