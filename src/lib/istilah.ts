/**
 * Kamus istilah untuk antarmuka.
 *
 * Ini bahan bacaan, bukan aturan. Tidak ada keputusan kelayakan atau perhitungan
 * yang diambil dari berkas ini; aturan perpajakan tetap tinggal di
 * `data/klu_rules.json`. Karena itu isinya penjelasan sehari-hari, bukan kutipan
 * pasal. Bila sebuah istilah memang menentukan hak pajak, penjelasannya menunjuk
 * ke kartu vonis yang membawa dasar hukumnya, bukan menerangkan hukum sendiri.
 */

export type EntriIstilah = {
  /** Judul yang muncul di kepala penjelasan. */
  judul: string;
  /** Satu sampai tiga kalimat, bahasa sehari-hari. */
  penjelasan: string;
  /** Kalimat penutup opsional: kenapa hal ini ditanyakan di formulir. */
  kenapaDitanya?: string;
};

export const ISTILAH = {
  ptPerorangan: {
    judul: 'PT Perorangan',
    penjelasan:
      'PT yang pemiliknya hanya satu orang. Didaftarkan lewat internet, tanpa notaris dan tanpa modal minimum, khusus untuk usaha mikro dan kecil. Bedanya dengan usaha atas nama pribadi: PT Perorangan berdiri sebagai badan hukum sendiri, terpisah dari orangnya.',
    kenapaDitanya:
      'Omzet PT Perorangan milik Anda dijumlahkan dengan omzet pribadi saat menguji batas Rp4,8 miliar, supaya usaha tidak bisa dipecah-pecah agar terlihat kecil. Isi 0 bila Anda tidak punya.'
  },
  peredaranBruto: {
    judul: 'Peredaran bruto (omzet)',
    penjelasan:
      'Seluruh uang yang masuk dari usaha selama setahun, sebelum dipotong biaya apa pun. Bukan keuntungan. Kalau Anda menjual barang seharga Rp10 juta dan modalnya Rp7 juta, peredaran brutonya Rp10 juta, bukan Rp3 juta.'
  },
  ptkp: {
    judul: 'PTKP',
    penjelasan:
      'Penghasilan Tidak Kena Pajak. Sebagian penghasilan yang dibebaskan lebih dulu karena dianggap untuk kebutuhan hidup. Jumlahnya bertambah bila Anda menikah dan bila punya tanggungan.',
    kenapaDitanya: 'PTKP dikurangkan sebelum tarif pajak dihitung, jadi keadaan keluarga Anda memengaruhi hasilnya.'
  },
  norma: {
    judul: 'Norma (NPPN)',
    penjelasan:
      'Cara menghitung untung tanpa pembukuan lengkap. Pemerintah menetapkan persentase untuk tiap jenis pekerjaan, lalu omzet Anda dikalikan persentase itu untuk memperkirakan keuntungan. Persentasenya berbeda antar pekerjaan dan antar wilayah.',
    kenapaDitanya: 'Norma hanya boleh dipakai bila Anda sudah memberi tahu DJP lebih dulu, paling lama tiga bulan sejak awal tahun pajak.'
  },
  pphFinal: {
    judul: 'PPh Final 0,5%',
    penjelasan:
      'Cara menghitung pajak yang paling sederhana: omzet dikali 0,5%, tanpa menghitung untung rugi. Disebut final karena setelah dibayar, penghasilan itu tidak dihitung lagi di akhir tahun.',
    kenapaDitanya: 'Tidak semua orang boleh memakainya. Syaratnya diperiksa di halaman hasil beserta dasar hukumnya.'
  },
  tarifUmum: {
    judul: 'Tarif umum',
    penjelasan:
      'Cara menghitung pajak dari keuntungan bersih: omzet dikurangi biaya usaha, dikurangi PTKP, lalu dikenai tarif bertingkat. Perlu pembukuan yang rapi, tetapi memperhitungkan biaya Anda yang sebenarnya.',
    kenapaDitanya: 'Cara ini selalu boleh dipakai siapa saja, jadi ia tampil sebagai pembanding.'
  },
  pembukuan: {
    judul: 'Pembukuan',
    penjelasan:
      'Catatan keuangan lengkap: pemasukan, pengeluaran, harta, dan utang. Lebih rinci daripada sekadar mencatat uang masuk.'
  },
  buktiPotong: {
    judul: 'Bukti potong',
    penjelasan:
      'Surat dari pihak yang membayar Anda, yang menyatakan pajak Anda sudah dipotong sebagian dan disetorkan atas nama Anda. Misalnya dari rumah sakit, kantor, atau perusahaan yang memakai jasa Anda.',
    kenapaDitanya: 'Pajak yang sudah dipotong itu mengurangi pajak yang perlu Anda bayar di akhir tahun, jadi jangan sampai terlewat.'
  },
  klu: {
    judul: 'KLU',
    penjelasan:
      'Klasifikasi Lapangan Usaha. Kode yang dipakai DJP untuk menandai jenis pekerjaan Anda. Kode ini menentukan persentase Norma yang berlaku.'
  },
  coretax: {
    judul: 'Coretax',
    penjelasan: 'Sistem daring DJP tempat Anda mengurus pajak: mendaftar, melapor, membayar, dan mengecek data Anda.'
  },
  pekerjaanBebas: {
    judul: 'Pekerjaan bebas',
    penjelasan:
      'Menjual keahlian diri sendiri tanpa terikat sebagai pegawai — misalnya dokter, pengacara, akuntan, atau kreator konten. Berbeda dari usaha, yang menjual barang atau jasa dengan modal dan biasanya mempekerjakan orang lain.',
    kenapaDitanya: 'Perbedaan ini menentukan skema mana yang boleh Anda pakai.'
  },
  kreditPajak: {
    judul: 'Kredit pajak',
    penjelasan:
      'Pajak Anda yang sudah dipotong atau dibayar lebih dulu selama tahun berjalan. Jumlahnya mengurangi pajak yang masih harus Anda bayar di akhir tahun.'
  },
  penghasilanNeto: {
    judul: 'Penghasilan neto',
    penjelasan: 'Perkiraan keuntungan Anda: uang masuk dikurangi biaya, sebelum dikurangi PTKP.'
  },
  pkp: {
    judul: 'PKP',
    penjelasan:
      'Penghasilan Kena Pajak. Sisa penghasilan yang benar-benar dikenai tarif, yaitu penghasilan neto setelah dikurangi PTKP.'
  },
  tarifProgresif: {
    judul: 'Tarif bertingkat',
    penjelasan:
      'Pajak tidak dihitung dengan satu tarif untuk seluruh penghasilan. Penghasilan dipotong berlapis: lapisan pertama kena tarif terkecil, lapisan berikutnya kena tarif lebih besar, dan seterusnya. Jadi naik ke lapisan atas tidak membuat seluruh penghasilan Anda kena tarif tinggi.'
  },
  tahunPajak: {
    judul: 'Tahun pajak',
    penjelasan: 'Periode satu tahun penghasilan yang dilaporkan, biasanya sama dengan tahun kalender.'
  },
  pisahHarta: {
    judul: 'Pisah harta',
    penjelasan:
      'Perjanjian tertulis antara suami dan istri untuk memisahkan harta dan penghasilan masing-masing.',
    kenapaDitanya: 'Cara suami istri melapor memengaruhi bagaimana penghasilan dijumlahkan dan bagaimana pajaknya dibagi.'
  },
  sptTahunan: {
    judul: 'SPT Tahunan',
    penjelasan: 'Laporan pajak yang Anda sampaikan sekali setahun, berisi seluruh penghasilan dan pajak Anda selama tahun itu.'
  },
  pegawaiTetap: {
    judul: 'Pegawai tetap',
    penjelasan:
      'Orang yang menerima gaji rutin dari pemberi kerja secara berkesinambungan, bukan dibayar per pekerjaan atau per proyek.',
    kenapaDitanya: 'Gaji Anda digabung dengan penghasilan usaha saat menghitung pajak setahun, dan PTKP hanya dikurangkan satu kali.'
  },
  ambang: {
    judul: 'Batas Rp4,8 miliar',
    penjelasan:
      'Batas omzet setahun yang memisahkan usaha kecil dari yang bukan. Diukur dari tahun pajak sebelumnya, bukan tahun berjalan, dan dihitung gabungan dengan omzet pasangan serta PT Perorangan Anda.'
  },
  wajibPajak: {
    judul: 'Wajib Pajak',
    penjelasan: 'Sebutan resmi untuk orang atau badan yang punya hak dan kewajiban pajak. Dalam aplikasi ini, berarti Anda.'
  }
} as const satisfies Record<string, EntriIstilah>;

export type KunciIstilah = keyof typeof ISTILAH;
