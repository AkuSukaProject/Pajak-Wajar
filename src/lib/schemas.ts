import { z } from 'zod';
import {
  StatusPerpajakanPasangan,
  BentukKegiatan,
  StatusPtkp,
  KelompokWilayahKey,
  TahunPajak,
} from '../types/pajak';

export const profilWajibPajakSchema = z.object({
  tahunPajak: z.union([z.literal(2025), z.literal(2026)]),
  kluKode: z.string().min(1),
  wilayah: z.enum(['kelompok1', 'kelompok2', 'kelompok3'] as [KelompokWilayahKey, ...KelompokWilayahKey[]]),
  statusPtkp: z.enum([
    'TK/0', 'TK/1', 'TK/2', 'TK/3',
    'K/0', 'K/1', 'K/2', 'K/3'
  ] as [StatusPtkp, ...StatusPtkp[]]),
  bentukKegiatan: z.enum([
    'PEKERJAAN_BEBAS',
    'USAHA_JASA',
    'USAHA_DAGANG',
    'BELUM_PASTI'
  ] as [BentukKegiatan, ...BentukKegiatan[]]),
  statusPerpajakanPasangan: z.enum([
    'GABUNG',
    'PISAH_HARTA',
    'PISAH_KEWAJIBAN',
    'TIDAK_YAKIN',
    'TIDAK_ADA_PASANGAN'
  ] as [StatusPerpajakanPasangan, ...StatusPerpajakanPasangan[]]),
  punyaLebihDariSatuKegiatan: z.union([z.boolean(), z.literal('tidak_yakin')]),

  omzetPribadiTahunPajak: z.number().min(0),
  biayaOperasionalRiil: z.number().min(0).optional(),

  omzetPribadiThnSebelumnya: z.number().min(0),
  omzetPasanganThnSebelumnya: z.number().min(0),
  omzetSeluruhPerseroanPeroranganThnSebelumnya: z.number().min(0),

  sudahMemberitahukanNppn: z.union([z.boolean(), z.literal('tidak_yakin')]),
  pernahPilihTarifUmum: z.union([z.boolean(), z.literal('tidak_yakin')]),
  jugaPegawaiTetap: z.boolean(),
});

export const kreditPajakItemSchema = z.object({
  jenis: z.string().min(1),
  nominal: z.number().min(0),
});

export const inputAuditPajakSchema = z.object({
  profil: profilWajibPajakSchema,
  kreditPajak: z.array(kreditPajakItemSchema),
});
