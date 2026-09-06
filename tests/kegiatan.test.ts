import { describe, expect, it } from 'vitest';
import { auditPajakMandiri } from '../src/lib/index';
import { profilWajibPajakSchema } from '../src/lib/schemas';
import type { HasilAuditPajak, HasilSkema, IdSkema, ProfilWajibPajak } from '../src/types/pajak';

/**
 * Norma untuk lebih dari satu kegiatan.
 *
 * PER-17/PJ/2015 Pasal 5 menghitung penghasilan neto per kegiatan memakai
 * persentase Norma masing-masing, lalu menjumlahkannya. Mengalikan omzet
 * gabungan dengan satu persentase adalah kesalahan yang tes ini jaga.
 *
 * Fixture memakai kelompok wilayah 1: KLU 47919 bernorma 30% dan 56101 bernorma 25%.
 */

const dasar: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '47919',
  wilayah: 'kelompok1',
  statusPtkp: 'TK/0',
  bentukKegiatan: 'USAHA_DAGANG',
  statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
  punyaLebihDariSatuKegiatan: true,
  kegiatanTambahan: [{ kluKode: '56101', omzet: 200_000_000 }],
  omzetPribadiTahunPajak: 400_000_000,
  biayaOperasionalRiil: 150_000_000,
  omzetPribadiThnSebelumnya: 300_000_000,
  omzetPasanganThnSebelumnya: 0,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: true,
  pernahPilihTarifUmum: false,
  jugaPegawaiTetap: false,
  pernahMelewatiAmbang: false
};

function skemaDari<T extends IdSkema>(hasil: HasilAuditPajak, id: T): Extract<HasilSkema, { id: T }> {
  const ditemukan = hasil.skema.find((item): item is Extract<HasilSkema, { id: T }> => item.id === id);
  if (!ditemukan) throw new Error(`Skema ${id} tidak ada`);
  return ditemukan;
}

const audit = (profil: ProfilWajibPajak) => auditPajakMandiri({ profil, kreditPajak: [] });

function nppnTerhitung(profil: ProfilWajibPajak) {
  const skema = skemaDari(audit(profil), 'NPPN');
  if (skema.statusKalkulasi !== 'TERSEDIA') {
    throw new Error(`NPPN tidak terhitung: ${skema.statusKalkulasi}`);
  }
  return skema;
}

describe('Norma dihitung per kegiatan lalu dijumlahkan', () => {
  it('menjumlahkan neto tiap kegiatan, bukan mengalikan omzet gabungan', () => {
    const { rincianKalkulasi } = nppnTerhitung(dasar);

    // 400 juta × 30% = 120 juta; 200 juta × 25% = 50 juta; jumlahnya 170 juta.
    expect(rincianKalkulasi.penghasilanNetoUsaha).toBe(170_000_000);
    expect(rincianKalkulasi.omzetPribadi).toBe(600_000_000);
  });

  it('menghasilkan pajak yang berbeda dari cara keliru satu persentase untuk semua', () => {
    const { pajakTerutang } = nppnTerhitung(dasar);

    // PKP = 170 juta − PTKP 54 juta = 116 juta.
    // Lapisan: 60 juta × 5% = 3 juta, sisa 56 juta × 15% = 8,4 juta.
    expect(pajakTerutang).toBe(11_400_000);

    // Bila omzet gabungan 600 juta dikalikan 30% saja, hasilnya 12,9 juta.
    // Angka itu harus berbeda, kalau sama berarti perhitungannya kembali keliru.
    expect(pajakTerutang).not.toBe(12_900_000);
  });

  it('membawa rincian tiap kegiatan agar dapat ditelusuri', () => {
    const { rincianKalkulasi } = nppnTerhitung(dasar);
    const baris = rincianKalkulasi.rincianKegiatan;

    expect(baris).toHaveLength(2);
    expect(baris?.[0]).toMatchObject({ kluKode: '47919', omzet: 400_000_000, persenNorma: 30, netoKegiatan: 120_000_000 });
    expect(baris?.[1]).toMatchObject({ kluKode: '56101', omzet: 200_000_000, persenNorma: 25, netoKegiatan: 50_000_000 });
  });

  it('menampilkan persentase gabungan efektif, bukan persentase salah satu kegiatan', () => {
    const { rincianKalkulasi } = nppnTerhitung(dasar);
    // 170 juta / 600 juta = 28,33%; berada di antara 25% dan 30%.
    expect(rincianKalkulasi.persenNorma).toBeCloseTo(28.333, 2);
  });

  it('tidak membawa rincian kegiatan bila kegiatannya hanya satu', () => {
    const satu: ProfilWajibPajak = { ...dasar, punyaLebihDariSatuKegiatan: false, kegiatanTambahan: undefined };
    expect(nppnTerhitung(satu).rincianKalkulasi.rincianKegiatan).toBeUndefined();
  });
});

describe('ambang dan dasar perhitungan memakai seluruh kegiatan', () => {
  it('menutup Norma ketika gabungan kegiatan mencapai batas, walau tiap kegiatan di bawahnya', () => {
    const besar: ProfilWajibPajak = {
      ...dasar,
      omzetPribadiTahunPajak: 3_000_000_000,
      kegiatanTambahan: [{ kluKode: '56101', omzet: 2_000_000_000 }]
    };
    const skema = skemaDari(audit(besar), 'NPPN');
    expect(skema.statusKelayakan).toBe('TIDAK_BOLEH');
    expect(skema.alasanKelayakan.join(' ')).toContain('Rp5.000.000.000');
  });

  it('memakai omzet seluruh kegiatan sebagai dasar tarif umum', () => {
    const skema = skemaDari(audit(dasar), 'TARIF_UMUM');
    if (skema.statusKalkulasi !== 'TERSEDIA') throw new Error('tarif umum seharusnya terhitung');
    expect(skema.rincianKalkulasi.omzetPribadi).toBe(600_000_000);
  });
});

describe('kegiatan yang belum dirinci tetap ditahan', () => {
  it('menahan Norma ketika kegiatannya lebih dari satu tetapi belum dirinci', () => {
    const belum: ProfilWajibPajak = { ...dasar, kegiatanTambahan: [] };
    const skema = skemaDari(audit(belum), 'NPPN');
    expect(skema.statusKalkulasi).toBe('BELUM_TERSEDIA');
    if (skema.statusKalkulasi !== 'BELUM_TERSEDIA') throw new Error('tidak mungkin');
    expect(skema.alasanKalkulasi).toContain('Rinci tiap kegiatan');
  });

  it('menahan Norma ketika pengguna belum yakin jumlah kegiatannya', () => {
    const raguRagu: ProfilWajibPajak = { ...dasar, punyaLebihDariSatuKegiatan: 'tidak_yakin', kegiatanTambahan: undefined };
    const skema = skemaDari(audit(raguRagu), 'NPPN');
    expect(skema.statusKalkulasi).toBe('BELUM_TERSEDIA');
    if (skema.statusKalkulasi !== 'BELUM_TERSEDIA') throw new Error('tidak mungkin');
    expect(skema.alasanKalkulasi).toContain('belum memastikan');
  });

  it('menahan Norma ketika ada kegiatan yang persentasenya belum tersedia', () => {
    const takDikenal: ProfilWajibPajak = { ...dasar, kegiatanTambahan: [{ kluKode: 'BELUM_DIDUKUNG', omzet: 100_000_000 }] };
    const skema = skemaDari(audit(takDikenal), 'NPPN');
    expect(skema.statusKalkulasi).toBe('BELUM_TERSEDIA');
  });

  it('berhenti memperingatkan multi-kegiatan setelah kegiatannya dirinci', () => {
    expect(audit(dasar).peringatan.join(' ')).not.toContain('tidak dapat dihitung dari satu angka omzet gabungan');
  });
});

describe('vonis tidak boleh terbaca sebagai keputusan atas seluruh penghasilan', () => {
  it('menyatakan bahwa vonis dinilai dari kegiatan utama ketika kegiatannya lebih dari satu', () => {
    const peringatan = audit(dasar).peringatan.join(' ');
    expect(peringatan).toContain('dinilai dari kegiatan utama');
    expect(peringatan).toContain('melekat pada penghasilannya, bukan pada orangnya');
  });

  it('tidak memunculkan peringatan itu bagi pemilik satu kegiatan', () => {
    const satu: ProfilWajibPajak = { ...dasar, punyaLebihDariSatuKegiatan: false, kegiatanTambahan: undefined };
    expect(audit(satu).peringatan.join(' ')).not.toContain('dinilai dari kegiatan utama');
  });

  it('tetap memunculkannya bagi dokter yang juga berdagang, karena larangan Final melekat pada penghasilan', () => {
    const dokterBerdagang: ProfilWajibPajak = {
      ...dasar,
      kluKode: '86201',
      bentukKegiatan: 'PEKERJAAN_BEBAS',
      kegiatanTambahan: [{ kluKode: '47919', omzet: 200_000_000 }]
    };
    const hasil = audit(dokterBerdagang);
    expect(skemaDari(hasil, 'PPH_FINAL_05').statusKelayakan).toBe('TIDAK_BOLEH');
    expect(hasil.peringatan.join(' ')).toContain('perlu diperiksa tersendiri');
  });
});

describe('jawaban kegiatan yang bertentangan ditolak sejak validasi', () => {
  it('menolak jawaban satu kegiatan yang masih menyisakan kegiatan tambahan', () => {
    const hasil = profilWajibPajakSchema.safeParse({ ...dasar, punyaLebihDariSatuKegiatan: false });
    expect(hasil.success).toBe(false);
  });

  it('menolak kegiatan yang sama dicatat dua kali', () => {
    const hasil = profilWajibPajakSchema.safeParse({
      ...dasar,
      kegiatanTambahan: [{ kluKode: '47919', omzet: 100_000_000 }]
    });
    expect(hasil.success).toBe(false);
  });

  it('menerima profil multi-kegiatan yang sudah dirinci dengan benar', () => {
    expect(profilWajibPajakSchema.safeParse(dasar).success).toBe(true);
  });
});
