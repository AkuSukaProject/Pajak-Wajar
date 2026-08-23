import {
  ProfilWajibPajak,
  DatabaseRegulasi,
  StatusKelayakan,
  DasarHukumDetail,
  StatusKalkulasi,
  HasilSkemaPphFinal,
  HasilSkemaNppn,
  HasilSkemaTarifUmum,
  HasilSkema,
} from '../types/pajak';

/**
 * Evaluasi ambang berdasarkan nilai dan operator.
 */
function evaluasiAmbang(omzet: number, ambang: { nilai: number; operator: 'LT' | 'LTE' }): boolean {
  if (ambang.operator === 'LTE') return omzet <= ambang.nilai;
  return omzet < ambang.nilai;
}

/**
 * Agregasi status kelayakan dengan prioritas: TIDAK_BOLEH > PERLU_DIPASTIKAN > BOLEH
 */
function gabungStatus(current: StatusKelayakan, next: StatusKelayakan): StatusKelayakan {
  if (current === 'TIDAK_BOLEH' || next === 'TIDAK_BOLEH') return 'TIDAK_BOLEH';
  if (current === 'PERLU_DIPASTIKAN' || next === 'PERLU_DIPASTIKAN') return 'PERLU_DIPASTIKAN';
  return 'BOLEH';
}

export function evaluasiKelayakanPphFinal(
  profil: ProfilWajibPajak,
  regulasi: DatabaseRegulasi
): { status: StatusKelayakan; alasan: string[]; dasarHukum: DasarHukumDetail[] } {
  let status: StatusKelayakan = 'BOLEH';
  const alasan: string[] = [];
  const dasarHukum: DasarHukumDetail[] = [];

  const aturan = regulasi.aturanKelayakan;

  // 1. Tahun Pajak (Peralihan) - PP 20/2026 Pasal II
  if (aturan.ketentuanPeralihan.statusVerifikasi === 'DALAM_REVIEW') {
    status = gabungStatus(status, 'PERLU_DIPASTIKAN');
    alasan.push('Ketentuan peralihan untuk tahun pajak 2025-2026 sedang diverifikasi.');
    dasarHukum.push(...aturan.ketentuanPeralihan.dasarHukum);
  }

  // 2. Pekerjaan Bebas - Pasal 56(3)a jo (4)
  if (profil.bentukKegiatan === 'PEKERJAAN_BEBAS') {
    status = gabungStatus(status, 'TIDAK_BOLEH');
    alasan.push('Penghasilan dari pekerjaan bebas tidak diperbolehkan menggunakan PPh Final.');
    dasarHukum.push(...aturan.pekerjaanBebas.dasarHukum);
  } else if (profil.bentukKegiatan === 'BELUM_PASTI') {
    status = gabungStatus(status, 'PERLU_DIPASTIKAN');
    alasan.push('Bentuk kegiatan belum dapat dipastikan apakah termasuk pekerjaan bebas atau tidak.');
    dasarHukum.push(...aturan.pekerjaanBebas.dasarHukum);
  }

  // 3. Pintu Satu Arah - Pasal 57(4)
  if (profil.pernahPilihTarifUmum === true) {
    status = gabungStatus(status, 'TIDAK_BOLEH');
    alasan.push('Wajib pajak yang telah memilih tarif umum tidak dapat kembali menggunakan PPh Final.');
    dasarHukum.push(...aturan.pilihanTarifUmum.dasarHukum);
  } else if (profil.pernahPilihTarifUmum === 'tidak_yakin') {
    status = gabungStatus(status, 'PERLU_DIPASTIKAN');
    alasan.push('Riwayat pemilihan tarif umum belum dipastikan.');
    dasarHukum.push(...aturan.pilihanTarifUmum.dasarHukum);
  }

  // 4. Ambang Konsolidasi - Pasal 57(1)-(2), Pasal 58(1)-(3)
  const ambangPphFinal = regulasi.parameterPajak.pphFinal.ambangOmzet;
  if (ambangPphFinal.statusVerifikasi === 'DALAM_REVIEW') {
    status = gabungStatus(status, 'PERLU_DIPASTIKAN');
    alasan.push('Aturan batas ambang omzet PPh Final masih dalam tahap review.');
    dasarHukum.push(...ambangPphFinal.dasarHukum);
  } else {
    // Omzet tahun sebelumnya sesuai Ps 58 ayat (1)
    let omzetKonsolidasi = 0;

    if (profil.statusPerpajakanPasangan === 'GABUNG') {
      // Ps 58 ayat (3) hanya untuk pisah harta/kewajiban
      status = gabungStatus(status, 'PERLU_DIPASTIKAN');
      alasan.push('Perlakuan omzet untuk pasangan GABUNG masih menunggu kepastian interpretasi untuk mencegah penghitungan ganda.');
      dasarHukum.push(...aturan.ambangKonsolidasi.dasarHukum);
    } else if (profil.statusPerpajakanPasangan === 'TIDAK_YAKIN') {
      status = gabungStatus(status, 'PERLU_DIPASTIKAN');
      alasan.push('Status perpajakan pasangan belum dipastikan.');
      dasarHukum.push(...aturan.ambangKonsolidasi.dasarHukum);
    } else if (
      profil.statusPerpajakanPasangan === 'PISAH_HARTA' ||
      profil.statusPerpajakanPasangan === 'PISAH_KEWAJIBAN'
    ) {
      omzetKonsolidasi =
        profil.omzetPribadiThnSebelumnya +
        profil.omzetPasanganThnSebelumnya +
        profil.omzetSeluruhPerseroanPeroranganThnSebelumnya;
      
      const lolos = evaluasiAmbang(omzetKonsolidasi, ambangPphFinal);
      if (!lolos) {
        status = gabungStatus(status, 'TIDAK_BOLEH');
        alasan.push(`Omzet gabungan tahun sebelumnya (${omzetKonsolidasi}) melebihi batas ambang PPh Final.`);
        dasarHukum.push(...ambangPphFinal.dasarHukum);
      }
    } else {
      // TIDAK_ADA_PASANGAN
      omzetKonsolidasi =
        profil.omzetPribadiThnSebelumnya +
        profil.omzetSeluruhPerseroanPeroranganThnSebelumnya;
      
      const lolos = evaluasiAmbang(omzetKonsolidasi, ambangPphFinal);
      if (!lolos) {
        status = gabungStatus(status, 'TIDAK_BOLEH');
        alasan.push(`Omzet tahun sebelumnya beserta perseroan (${omzetKonsolidasi}) melebihi batas ambang PPh Final.`);
        dasarHukum.push(...ambangPphFinal.dasarHukum);
      }
    }
  }

  // Jika tidak ada dasar hukum yang termasukkan secara spesifik, pastikan dasar hukum ambang ikut kalau lolos
  if (status === 'BOLEH' && dasarHukum.length === 0) {
    dasarHukum.push(...aturan.pekerjaanBebas.dasarHukum);
    dasarHukum.push(...aturan.pilihanTarifUmum.dasarHukum);
    dasarHukum.push(...aturan.ambangKonsolidasi.dasarHukum);
  }

  return { status, alasan, dasarHukum };
}

export function evaluasiKelayakanNppn(
  profil: ProfilWajibPajak,
  regulasi: DatabaseRegulasi
): { status: StatusKelayakan; alasan: string[]; dasarHukum: DasarHukumDetail[] } {
  let status: StatusKelayakan = 'BOLEH';
  const alasan: string[] = [];
  const dasarHukum: DasarHukumDetail[] = [];

  const aturan = regulasi.aturanKelayakan;

  // 1. Administrasi NPPN - PER-17/PJ/2015 Pasal 2(1)
  if (profil.sudahMemberitahukanNppn === false) {
    status = gabungStatus(status, 'TIDAK_BOLEH');
    alasan.push('Wajib Pajak belum memberitahukan penggunaan NPPN dalam 3 bulan pertama tahun pajak.');
    dasarHukum.push(...aturan.administrasiNppn.dasarHukum);
  } else if (profil.sudahMemberitahukanNppn === 'tidak_yakin') {
    status = gabungStatus(status, 'PERLU_DIPASTIKAN');
    alasan.push('Status pemberitahuan NPPN belum dipastikan.');
    dasarHukum.push(...aturan.administrasiNppn.dasarHukum);
  }

  // 2. Ambang Omzet NPPN - PER-17/PJ/2015 Pasal 1
  const ambangNppn = regulasi.parameterPajak.nppn.ambangOmzet;
  if (ambangNppn.statusVerifikasi === 'DALAM_REVIEW') {
    status = gabungStatus(status, 'PERLU_DIPASTIKAN');
    alasan.push('Aturan ambang omzet NPPN masih dalam review.');
    dasarHukum.push(...ambangNppn.dasarHukum);
  } else {
    // Menggunakan omzetPribadiTahunPajak
    const lolos = evaluasiAmbang(profil.omzetPribadiTahunPajak, ambangNppn);
    if (!lolos) {
      status = gabungStatus(status, 'TIDAK_BOLEH');
      alasan.push(`Omzet tahun berjalan (${profil.omzetPribadiTahunPajak}) mencapai batas wajib pembukuan.`);
      dasarHukum.push(...ambangNppn.dasarHukum);
    }
  }

  if (status === 'BOLEH' && dasarHukum.length === 0) {
    dasarHukum.push(...aturan.administrasiNppn.dasarHukum);
    dasarHukum.push(...ambangNppn.dasarHukum);
  }

  return { status, alasan, dasarHukum };
}

export function evaluasiKelayakanTarifUmum(
  profil: ProfilWajibPajak,
  regulasi: DatabaseRegulasi
): { status: StatusKelayakan; alasan: string[]; dasarHukum: DasarHukumDetail[] } {
  // Tarif umum secara umum selalu boleh (fallback)
  const dasarHukum: DasarHukumDetail[] = regulasi.parameterPajak.tarifProgresif.dasarHukum;
  return { status: 'BOLEH', alasan: [], dasarHukum };
}
