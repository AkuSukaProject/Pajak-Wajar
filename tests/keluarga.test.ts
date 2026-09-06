import { describe, expect, it } from 'vitest';
import { auditPajakMandiri } from '../src/lib/index';
import { profilWajibPajakSchema } from '../src/lib/schemas';
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
      nama: 'gabung dengan pasangan berpenghasilan',
      profil: keluarga('GABUNG', true),
      kata: 'Neto pasangan'
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
      nama: 'pisah harta walau pasangan tanpa penghasilan',
      profil: keluarga('PISAH_HARTA', false),
      kata: 'perbandingan neto'
    },
    {
      nama: 'pisah kewajiban walau pasangan tanpa penghasilan',
      profil: keluarga('PISAH_KEWAJIBAN', false),
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
