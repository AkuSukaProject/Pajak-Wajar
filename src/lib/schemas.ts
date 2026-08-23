import { z } from 'zod';

export const profilWajibPajakSchema = z.object({
  tahunPajak: z.union([z.literal(2025), z.literal(2026)]),
  kluKode: z.string().min(1, 'Pilih profesi atau kegiatan usaha.'),
  statusPtkp: z.enum(['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3']),
  omzetPribadi: z.number().nonnegative(),
  omzetPasangan: z.number().nonnegative(),
  omzetPerseroanPerorangan: z.number().nonnegative(),
  sudahLaporLA0401: z.union([z.boolean(), z.literal('tidak_yakin')]),
  pernahPilihTarifUmum: z.union([z.boolean(), z.literal('tidak_yakin')]),
  jugaPegawaiTetap: z.boolean()
});
