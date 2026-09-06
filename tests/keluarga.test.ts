import { describe, expect, it } from 'vitest';
import { auditPajakMandiri } from '../src/lib/index';
import { profilWajibPajakSchema } from '../src/lib/schemas';
import { basisAturan } from '../src/lib/regulasi';
import { contohHasilDokter } from '../src/mock/hasilKelayakan';
import type {
  HasilAuditPajak,
  HasilSkema,
  IdSkema,
  JawabanKepatuhan,
  ProfilWajibPajak,
  StatusPerpajakanPasangan
} from '../src/types/pajak';

/**
 * Perhitungan keluarga.
 *
 * UU PPh Pasal 8 ayat (1) menggabungkan penghasilan istri ke suami sebagai satu
 * kesatuan. Bila pasangan tidak berpenghasilan, tidak ada yang perlu digabungkan,
 * sehingga perhitungan tidak boleh ditahan. Setiap keadaan lain tetap ditahan,
 * tetapi wajib menyebut alasannya sendiri.
 */

/** Satu kegiatan, sudah memberitahukan Norma, sehingga NPPN dan tarif umum terbuka. */
const dasarLajang: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '86201',
  wilayah: 'kelompok1',
  statusPtkp: 'K/2',
  bentukKegiatan: 'PEKERJAAN_BEBAS',
  statusPerpajakanPasangan: 'PISAH_PUTUSAN_HAKIM',
  punyaLebihDariSatuKegiatan: false,
  omzetPribadiTahunPajak: 800_000_000,
  biayaOperasionalRiil: 300_000_000,
  omzetPribadiThnSebelumnya: 700_000_000,
  omzetPasanganThnSebelumnya: 0,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: true,
  pernahPilihTarifUmum: false,
  jugaPegawaiTetap: false,
  pernahMelewatiAmbang: false
};

function skemaDari<T extends IdSkema>(hasil: HasilAuditPajak, id: T): Extract<HasilSkema, { id: T }> {
  const ditemukan = hasil.skema.find(
    (item): item is Extract<HasilSkema, { id: T }> => item.id === id
  );
  if (!ditemukan) throw new Error(`Skema ${id} tidak ada`);
  return ditemukan;
}

function audit(profil: ProfilWajibPajak): HasilAuditPajak {
  return auditPajakMandiri({ profil, kreditPajak: [] });
}

function keluarga(
  statusPerpajakanPasangan: StatusPerpajakanPasangan,
  pasanganPunyaPenghasilan?: JawabanKepatuhan
): ProfilWajibPajak {
  return { ...dasarLajang, statusPerpajakanPasangan, pasanganPunyaPenghasilan };
}

describe('perhitungan saat pasangan tidak berpenghasilan', () => {
  it('menghitung nominal untuk pelaporan gabung dengan pasangan tanpa penghasilan', () => {
    const hasil = audit(keluarga('GABUNG', false));
    expect(skemaDari(hasil, 'NPPN').statusKalkulasi).toBe('TERSEDIA');
    expect(skemaDari(hasil, 'TARIF_UMUM').statusKalkulasi).toBe('TERSEDIA');
  });

  it('menghasilkan nominal yang sama dengan profil tanpa penggabungan pada PTKP yang sama', () => {
    const kawin = audit(keluarga('GABUNG', false));
    const pembanding = audit(dasarLajang);

    for (const id of ['NPPN', 'TARIF_UMUM'] as const) {
      const a = skemaDari(kawin, id);
      const b = skemaDari(pembanding, id);
      if (a.statusKalkulasi !== 'TERSEDIA' || b.statusKalkulasi !== 'TERSEDIA') {
        throw new Error(`Skema ${id} seharusnya terhitung pada kedua profil`);
      }
      expect(a.pajakTerutang).toBe(b.pajakTerutang);
    }
  });

  it('tidak lagi menyuruh menyiapkan neto pasangan yang tidak ada', () => {
    const hasil = audit(keluarga('GABUNG', false));
    expect(hasil.langkahTindakLanjut.some((baris) => baris.includes('neto pasangan'))).toBe(false);
  });

  it('tetap mempertahankan vonis kelayakan yang sama, karena kalkulasi bukan urusan hukum', () => {
    const kawin = audit(keluarga('GABUNG', false));
    const pembanding = audit(dasarLajang);
    for (const id of ['PPH_FINAL_05', 'NPPN', 'TARIF_UMUM'] as const) {
      expect(skemaDari(kawin, id).statusKelayakan).toBe(skemaDari(pembanding, id).statusKelayakan);
    }
  });
});

describe('keadaan keluarga yang tetap ditahan', () => {
  const ditahan: Array<{ nama: string; profil: ProfilWajibPajak; kata: string }> = [
    {
      nama: 'gabung dengan pasangan berpenghasilan yang belum dirinci',
      profil: keluarga('GABUNG', true),
      kata: 'gaji dari satu pemberi kerja'
    },
    {
      nama: 'gabung, penghasilan pasangan digabung, tetapi netonya belum diisi',
      profil: { ...keluarga('GABUNG', true), pasanganHanyaGajiSatuPemberiKerja: false },
      kata: 'Isi penghasilan neto pasangan'
    },
    {
      nama: 'gabung tetapi belum yakin',
      profil: keluarga('GABUNG', 'tidak_yakin'),
      kata: 'belum yakin'
    },
    {
      nama: 'gabung tanpa jawaban',
      profil: keluarga('GABUNG', undefined),
      kata: 'Jawab dulu'
    },
    {
      nama: 'pisah harta dengan neto pasangan belum diisi',
      profil: keluarga('PISAH_HARTA', true),
      kata: 'perbandingan neto'
    },
    {
      nama: 'pisah kewajiban dengan neto pasangan belum diisi',
      profil: keluarga('PISAH_KEWAJIBAN', true),
      kata: 'perbandingan neto'
    },
    {
      nama: 'status pelaporan belum dipastikan',
      profil: keluarga('TIDAK_YAKIN', false),
      kata: 'belum dipastikan'
    }
  ];

  for (const kasus of ditahan) {
    it(`menahan nominal dan menyebut alasannya: ${kasus.nama}`, () => {
      const hasil = audit(kasus.profil);
      for (const id of ['NPPN', 'TARIF_UMUM'] as const) {
        const skema = skemaDari(hasil, id);
        expect(skema.statusKalkulasi).toBe('BELUM_TERSEDIA');
        if (skema.statusKalkulasi !== 'BELUM_TERSEDIA') throw new Error('tidak mungkin');
        expect(skema.alasanKalkulasi).toContain(kasus.kata);
        expect(skema).not.toHaveProperty('pajakTerutang');
      }
    });
  }

  it('tidak menyisakan satu pun keadaan keluarga tanpa alasan yang dapat ditindaklanjuti', () => {
    const semuaStatus: StatusPerpajakanPasangan[] = [
      'TIDAK_ADA_PASANGAN',
      'GABUNG',
      'PISAH_HARTA',
      'PISAH_KEWAJIBAN',
      'PISAH_PUTUSAN_HAKIM',
      'TIDAK_YAKIN'
    ];
    const semuaJawaban: Array<JawabanKepatuhan | undefined> = [true, false, 'tidak_yakin', undefined];

    for (const status of semuaStatus) {
      for (const jawaban of semuaJawaban) {
        // Kombinasi yang memang ditolak skema tidak perlu menghasilkan vonis.
        const profil = keluarga(status, status === 'TIDAK_ADA_PASANGAN' ? undefined : jawaban);
        if (!profilWajibPajakSchema.safeParse(profil).success) continue;

        const skema = skemaDari(audit(profil), 'TARIF_UMUM');
        if (skema.statusKalkulasi === 'BELUM_TERSEDIA') {
          expect(skema.alasanKalkulasi.length).toBeGreaterThan(40);
        } else {
          expect(skema.statusKalkulasi).toBe('TERSEDIA');
        }
      }
    }
  });
});

describe('penggabungan penghasilan pasangan menurut UU PPh Pasal 8 ayat (1)', () => {
  /** Gabung, pasangan berpenghasilan selain gaji satu pemberi kerja, neto diisi. */
  const digabung: ProfilWajibPajak = {
    ...keluarga('GABUNG', true),
    pasanganHanyaGajiSatuPemberiKerja: false,
    penghasilanNetoPasangan: 100_000_000
  };

  it('menambahkan neto pasangan ke penghasilan neto', () => {
    const skema = skemaDari(audit(digabung), 'NPPN');
    if (skema.statusKalkulasi !== 'TERSEDIA') throw new Error('seharusnya terhitung');
    // Neto usaha 800 juta × Norma 50% = 400 juta, ditambah neto pasangan 100 juta.
    expect(skema.rincianKalkulasi.penghasilanNetoUsaha).toBe(400_000_000);
    expect(skema.rincianKalkulasi.penghasilanNetoPasangan).toBe(100_000_000);
    expect(skema.rincianKalkulasi.penghasilanNeto).toBe(500_000_000);
  });

  it('menambah PTKP sebesar tambahan istri yang penghasilannya digabung', () => {
    const skema = skemaDari(audit(digabung), 'NPPN');
    if (skema.statusKalkulasi !== 'TERSEDIA') throw new Error('seharusnya terhitung');
    // PTKP K/2 Rp67.500.000 ditambah Rp54.000.000 menurut PMK 101/PMK.010/2016 Pasal 1 huruf c.
    expect(skema.rincianKalkulasi.ptkp).toBe(121_500_000);
  });

  it('menghasilkan pajak yang cocok dengan hitungan berlapis', () => {
    const skema = skemaDari(audit(digabung), 'NPPN');
    if (skema.statusKalkulasi !== 'TERSEDIA') throw new Error('seharusnya terhitung');
    // PKP = 500.000.000 − 121.500.000 = 378.500.000.
    // 60 juta × 5% = 3.000.000; 190 juta × 15% = 28.500.000; 128,5 juta × 25% = 32.125.000.
    expect(skema.rincianKalkulasi.pkp).toBe(378_500_000);
    expect(skema.pajakTerutang).toBe(63_625_000);
  });

  it('tidak menggabungkan gaji pasangan dari satu pemberi kerja, dan PTKP tetap tanpa tambahan', () => {
    const gajiSaja: ProfilWajibPajak = {
      ...keluarga('GABUNG', true),
      pasanganHanyaGajiSatuPemberiKerja: true,
      penghasilanNetoPasangan: 100_000_000
    };
    const skema = skemaDari(audit(gajiSaja), 'NPPN');
    if (skema.statusKalkulasi !== 'TERSEDIA') throw new Error('seharusnya terhitung');
    expect(skema.rincianKalkulasi.penghasilanNetoPasangan).toBe(0);
    expect(skema.rincianKalkulasi.ptkp).toBe(67_500_000);
  });

  it('menghasilkan angka yang sama dengan profil tanpa pasangan berpenghasilan pada kasus gaji satu pemberi kerja', () => {
    const gajiSaja: ProfilWajibPajak = {
      ...keluarga('GABUNG', true),
      pasanganHanyaGajiSatuPemberiKerja: true
    };
    const tanpa = skemaDari(audit(keluarga('GABUNG', false)), 'NPPN');
    const dengan = skemaDari(audit(gajiSaja), 'NPPN');
    if (tanpa.statusKalkulasi !== 'TERSEDIA' || dengan.statusKalkulasi !== 'TERSEDIA') {
      throw new Error('keduanya seharusnya terhitung');
    }
    expect(dengan.pajakTerutang).toBe(tanpa.pajakTerutang);
  });

  it('menaikkan pajak dibanding pasangan tanpa penghasilan, karena netonya bertambah', () => {
    const tanpa = skemaDari(audit(keluarga('GABUNG', false)), 'NPPN');
    const dengan = skemaDari(audit(digabung), 'NPPN');
    if (tanpa.statusKalkulasi !== 'TERSEDIA' || dengan.statusKalkulasi !== 'TERSEDIA') {
      throw new Error('keduanya seharusnya terhitung');
    }
    expect(dengan.pajakTerutang).toBeGreaterThan(tanpa.pajakTerutang);
  });

  it('menghitung pisah harta setelah neto pasangan diisi', () => {
    const pisah: ProfilWajibPajak = { ...digabung, statusPerpajakanPasangan: 'PISAH_HARTA' };
    expect(skemaDari(audit(pisah), 'NPPN').statusKalkulasi).toBe('TERSEDIA');
  });
});

describe('kasus dokter multi-sumber yang diajukan pegawai DJP', () => {
  it('menolak PPh Final karena praktik dokter termasuk pekerjaan bebas', () => {
    const skema = skemaDari(contohHasilDokter(), 'PPH_FINAL_05');
    expect(skema.statusKelayakan).toBe('TIDAK_BOLEH');
    expect(skema.alasanKelayakan.join(' ')).toContain('pekerjaan bebas');
    expect(skema).not.toHaveProperty('pajakTerutang');
  });

  it('menahan Norma karena kegiatannya lebih dari satu', () => {
    const hasil = contohHasilDokter();
    expect(skemaDari(hasil, 'NPPN').statusKalkulasi).not.toBe('TERSEDIA');
    expect(hasil.peringatan.join(' ')).toContain('lebih dari satu jenis kegiatan');
  });

  it('tidak pernah menampilkan nominal apa pun untuk profil ini', () => {
    for (const skema of contohHasilDokter().skema) {
      expect(skema).not.toHaveProperty('pajakTerutang');
    }
  });

  it('tetap menjelaskan tiap penolakan dengan dasar hukum', () => {
    for (const skema of contohHasilDokter().skema) {
      expect(skema.dasarHukum.length).toBeGreaterThan(0);
    }
  });
});

describe('jawaban yang saling bertentangan ditolak sejak validasi', () => {
  it('menolak pasangan tanpa penghasilan yang omzetnya masih terisi', () => {
    const hasil = profilWajibPajakSchema.safeParse({
      ...keluarga('GABUNG', false),
      omzetPasanganThnSebelumnya: 250_000_000
    });
    expect(hasil.success).toBe(false);
  });

  it('menolak jawaban penghasilan pasangan ketika pengguna menjawab tidak punya pasangan', () => {
    const hasil = profilWajibPajakSchema.safeParse({
      ...dasarLajang,
      statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
      statusPtkp: 'TK/0',
      pasanganPunyaPenghasilan: false
    });
    expect(hasil.success).toBe(false);
  });

  it('menerima profil gabung tanpa penghasilan pasangan yang omzetnya nol', () => {
    expect(profilWajibPajakSchema.safeParse(keluarga('GABUNG', false)).success).toBe(true);
  });
});


describe('pembagian PH/MT berdasarkan hitungan tangan', () => {
  const profil = (status: 'PISAH_HARTA' | 'PISAH_KEWAJIBAN'): ProfilWajibPajak => ({
    ...dasarLajang, statusPerpajakanPasangan: status, pasanganPunyaPenghasilan: true,
    pasanganHanyaGajiSatuPemberiKerja: false, penghasilanNetoPasangan: 100_000_000
  });
  it('menahan nominal jika parameter tambahan PTKP kembali dalam review', () => {
    const aturan = basisAturan.parameterPajak.ptkp.tambahanIstriDigabung;
    const status = aturan.statusVerifikasi;
    try {
      aturan.statusVerifikasi = 'DALAM_REVIEW';
      for (const id of ['NPPN', 'TARIF_UMUM'] as const) {
        const s = skemaDari(audit(profil('PISAH_HARTA')), id);
        expect(s.statusKalkulasi).toBe('BELUM_TERSEDIA');
        expect(s).not.toHaveProperty('pajakTerutang');
      }
    } finally { aturan.statusVerifikasi = status; }
  });
  for (const status of ['PISAH_HARTA', 'PISAH_KEWAJIBAN'] as const) {
    it(`${status}: neto 400 + 100 juta menghasilkan bagian WP 50,9 juta`, () => {
      const s = skemaDari(audit(profil(status)), 'NPPN');
      if (s.statusKalkulasi !== 'TERSEDIA') throw Error('Nominal harus tersedia');
      expect(s.rincianKalkulasi.ptkp).toBe(121_500_000);
      expect(s.rincianKalkulasi.pkp).toBe(378_500_000);
      expect(s.rincianKalkulasi.pembagianProporsional).toEqual({
        netoGabungan: 500_000_000, netoWajibPajak: 400_000_000, porsi: 0.8,
        pajakGabungan: 63_625_000, bagianWajibPajak: 50_900_000, bagianPasangan: 12_725_000
      });
      expect(s.pajakTerutang).toBe(50_900_000);
      expect(s.dasarHukum.some(d => d.pasalAtauLampiran.includes('ayat (3)'))).toBe(true);
    });
    it(`${status}: pembukuan neto 500 + 100 juta menghasilkan bagian WP 73.854.167`, () => {
      const s = skemaDari(audit(profil(status)), 'TARIF_UMUM');
      if (s.statusKalkulasi !== 'TERSEDIA') throw Error('Nominal harus tersedia');
      expect(s.rincianKalkulasi.pembagianProporsional?.pajakGabungan).toBe(88_625_000);
      expect(s.pajakTerutang).toBe(73_854_167);
    });
    it(`${status}: gaji pasangan satu pemberi kerja tetap digabung`, () => {
      const a = audit(profil(status));
      const b = audit({ ...profil(status), pasanganHanyaGajiSatuPemberiKerja: true });
      expect(b.skema).toEqual(a.skema);
    });
    it(`${status}: mengurangi kredit WP setelah pembagian`, () => {
      const hasil = auditPajakMandiri({ profil: profil(status), kreditPajak: [{ nomorBuktiPotong: 'WP-1', pemotong: 'RS', penghasilanBruto: 100_000_000, pphDipotong: 7_000_000, sumber: 'MANUAL' }] });
      const s = skemaDari(hasil, 'NPPN');
      expect(s.statusKalkulasi === 'TERSEDIA' && s.pajakTerutang).toBe(43_900_000);
    });
    it(`${status}: kedua SPT mempunyai jumlah bagian yang tepat sama tanpa selisih pembulatan`, () => {
      const suami = { ...profil(status), peranDalamKeluarga: 'SUAMI' as const, biayaOperasionalRiil: 400_000_003, penghasilanNetoPasangan: 111_111_111 };
      const istri = { ...suami, peranDalamKeluarga: 'ISTRI' as const, omzetPribadiTahunPajak: 111_111_111, biayaOperasionalRiil: 0, penghasilanNetoPasangan: 399_999_997 };
      const a = skemaDari(audit(suami), 'TARIF_UMUM');
      const b = skemaDari(audit(istri), 'TARIF_UMUM');
      if (a.statusKalkulasi !== 'TERSEDIA' || b.statusKalkulasi !== 'TERSEDIA') throw Error('Kedua SPT harus terhitung');
      expect(a.pajakTerutang + b.pajakTerutang).toBe(a.rincianKalkulasi.pembagianProporsional?.pajakGabungan);
      expect(a.rincianKalkulasi.pembagianProporsional?.bagianPasangan).toBe(b.pajakTerutang);
    });
  }
  it('neto keduanya nol menghasilkan porsi nol tanpa NaN', () => {
    const s = skemaDari(audit({ ...profil('PISAH_HARTA'), omzetPribadiTahunPajak: 0, biayaOperasionalRiil: 0, penghasilanNetoPasangan: 0 }), 'NPPN');
    if (s.statusKalkulasi !== 'TERSEDIA') throw Error('Nol tetap dapat dihitung');
    expect(s.pajakTerutang).toBe(0);
    expect(s.rincianKalkulasi.pembagianProporsional?.porsi).toBe(0);
  });
  it('neto pasangan nol menghasilkan porsi WP satu', () => {
    const s = skemaDari(audit({ ...profil('PISAH_HARTA'), penghasilanNetoPasangan: 0 }), 'NPPN');
    if (s.statusKalkulasi !== 'TERSEDIA') throw Error('Nol tetap dapat dihitung');
    expect(s.rincianKalkulasi.pembagianProporsional?.porsi).toBe(1);
  });
  it('pasangan tidak berpenghasilan dapat dihitung tanpa memaksa isian neto', () => {
    expect(skemaDari(audit(keluarga('PISAH_HARTA', false)), 'NPPN').statusKalkulasi).toBe('TERSEDIA');
  });
  it('gabung tidak dibagi proporsional', () => {
    const s = skemaDari(audit({ ...profil('PISAH_HARTA'), statusPerpajakanPasangan: 'GABUNG' }), 'NPPN');
    if (s.statusKalkulasi !== 'TERSEDIA') throw Error('Nominal harus tersedia');
    expect(s.pajakTerutang).toBe(63_625_000);
    expect(s.rincianKalkulasi.pembagianProporsional).toBeUndefined();
  });
});
