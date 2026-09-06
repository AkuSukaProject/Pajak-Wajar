import { auditPajakMandiri } from '@/lib/index';
import type { HasilAuditPajak, InputAuditPajak, ProfilWajibPajak } from '@/types/pajak';

/**
 * Profil contoh untuk demo, tangkapan layar, dan pengujian manual.
 *
 * Sejak mesin aturan tersambung, berkas ini tidak lagi berisi vonis palsu:
 * hasilnya dihitung mesin yang sama dengan yang dipakai pengguna, sehingga
 * demo tidak pernah menampilkan angka yang tidak dapat direproduksi.
 */

const dasar: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '90002',
  wilayah: 'kelompok1',
  statusPtkp: 'TK/0',
  bentukKegiatan: 'PEKERJAAN_BEBAS',
  statusPerpajakanPasangan: 'TIDAK_ADA_PASANGAN',
  punyaLebihDariSatuKegiatan: false,
  omzetPribadiTahunPajak: 420_000_000,
  biayaOperasionalRiil: 95_000_000,
  omzetPribadiThnSebelumnya: 310_000_000,
  omzetPasanganThnSebelumnya: 0,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: true,
  pernahPilihTarifUmum: false,
  jugaPegawaiTetap: false,
  pernahMelewatiAmbang: false
};

/** Kreator konten: pekerjaan bebas, sehingga PPh Final tertutup. */
export const profilKreator: ProfilWajibPajak = dasar;

/** Pedagang daring: berhak PPh Final 0,5%. */
export const profilPedagang: ProfilWajibPajak = {
  ...dasar,
  kluKode: '47919',
  bentukKegiatan: 'USAHA_DAGANG',
  statusPtkp: 'TK/0',
  omzetPribadiTahunPajak: 900_000_000,
  biayaOperasionalRiil: 620_000_000,
  omzetPribadiThnSebelumnya: 780_000_000
};

/** Pasangan pisah harta yang gabungan omzetnya melewati ambang Rp4,8 miliar. */
export const profilLewatAmbang: ProfilWajibPajak = {
  ...profilPedagang,
  statusPerpajakanPasangan: 'PISAH_HARTA',
  pasanganPunyaPenghasilan: true,
  omzetPribadiThnSebelumnya: 3_000_000_000,
  omzetPasanganThnSebelumnya: 2_000_000_000
};

/**
 * Menikah dengan pasangan yang tidak berpenghasilan. Tidak ada penghasilan yang
 * perlu digabungkan menurut UU PPh Pasal 8 ayat (1), sehingga nominalnya keluar
 * sama seperti profil tanpa pasangan dengan PTKP yang setara.
 */
export const profilKawinPasanganTanpaPenghasilan: ProfilWajibPajak = {
  ...dasar,
  statusPtkp: 'K/2',
  statusPerpajakanPasangan: 'GABUNG',
  pasanganPunyaPenghasilan: false,
  omzetPasanganThnSebelumnya: 0
};

/**
 * Kasus yang diajukan pegawai DJP pada 6 September 2026: dokter dengan banyak
 * sumber penghasilan. Dipakai untuk memperagakan bahwa sistem menolak menebak
 * dan menyebutkan alasannya, bukan mengarang satu angka yang terlihat rapi.
 *
 * Praktik di beberapa rumah sakit, klinik di rumah, usaha jualan, istri punya
 * restoran, plus bonus distributor obat. PPh Final tertutup karena praktik dokter
 * termasuk pekerjaan bebas; Norma tertutup karena kegiatannya lebih dari satu.
 */
export const profilDokterMultiSumber: ProfilWajibPajak = {
  tahunPajak: 2026,
  kluKode: '86201',
  wilayah: 'kelompok1',
  statusPtkp: 'K/2',
  bentukKegiatan: 'PEKERJAAN_BEBAS',
  statusPerpajakanPasangan: 'GABUNG',
  pasanganPunyaPenghasilan: true,
  punyaLebihDariSatuKegiatan: true,
  omzetPribadiTahunPajak: 1_500_000_000,
  biayaOperasionalRiil: 600_000_000,
  omzetPribadiThnSebelumnya: 1_400_000_000,
  omzetPasanganThnSebelumnya: 900_000_000,
  omzetSeluruhPerseroanPeroranganThnSebelumnya: 0,
  sudahMemberitahukanNppn: false,
  pernahPilihTarifUmum: false,
  jugaPegawaiTetap: true,
  penghasilanNetoPegawai: 300_000_000,
  pernahMelewatiAmbang: false
};

export const contohInput: InputAuditPajak = {
  profil: profilKreator,
  kreditPajak: [
    {
      nomorBuktiPotong: 'BP-2026-0142',
      pemotong: 'PT Media Kreatif Nusantara',
      penghasilanBruto: 120_000_000,
      pphDipotong: 6_000_000,
      sumber: 'MANUAL'
    }
  ]
};

/** Bukti potong dokter: dua rumah sakit dan satu bonus distributor obat. */
export const contohInputDokter: InputAuditPajak = {
  profil: profilDokterMultiSumber,
  kreditPajak: [
    { nomorBuktiPotong: 'BP-2026-1001', pemotong: 'RSUD Harapan Bunda', penghasilanBruto: 400_000_000, pphDipotong: 20_000_000, sumber: 'MANUAL' },
    { nomorBuktiPotong: 'BP-2026-1002', pemotong: 'RS Siti Rahmah', penghasilanBruto: 250_000_000, pphDipotong: 12_500_000, sumber: 'MANUAL' },
    { nomorBuktiPotong: 'BP-2026-1003', pemotong: 'PT Distribusi Farma Andalas', penghasilanBruto: 80_000_000, pphDipotong: 4_000_000, sumber: 'MANUAL' }
  ]
};

/** Hasil demo yang dihitung mesin aturan sungguhan. */
export function contohHasil(): HasilAuditPajak {
  return auditPajakMandiri(contohInput);
}

/** Hasil kasus dokter, dihitung mesin yang sama dengan yang dipakai pengguna. */
export function contohHasilDokter(): HasilAuditPajak {
  return auditPajakMandiri(contohInputDokter);
}
