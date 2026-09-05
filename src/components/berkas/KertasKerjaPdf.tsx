import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatCurrency, formatPersenNorma, formatTanggalIndonesia, formatTarif } from '@/lib/format';
import { basisAturan, cariKlu } from '@/lib/regulasi';
import type { HasilAuditPajak, HasilSkema, IdSkema, StatusKelayakan } from '@/types/pajak';

/**
 * Kertas kerja satu berkas untuk disimpan pengguna.
 *
 * Berkas ini hanya menyusun ulang hasil `auditPajakMandiri`; tidak ada
 * perhitungan atau penilaian hukum baru yang terjadi di sini.
 */

const namaSkema: Record<IdSkema, string> = {
  PPH_FINAL_05: 'PPh Final UMKM 0,5%',
  NPPN: 'Norma Penghitungan Penghasilan Neto',
  TARIF_UMUM: 'Tarif umum Pasal 17'
};

const labelStatus: Record<StatusKelayakan, string> = {
  BOLEH: 'BOLEH DIPAKAI',
  TIDAK_BOLEH: 'TIDAK BOLEH DIPAKAI',
  PERLU_DIPASTIKAN: 'PERLU DIPASTIKAN'
};

const warnaStatus: Record<StatusKelayakan, string> = {
  BOLEH: '#17497D',
  TIDAK_BOLEH: '#A32E28',
  PERLU_DIPASTIKAN: '#7A5C15'
};

const s = StyleSheet.create({
  page: { padding: 42, fontSize: 9.5, color: '#14202E', fontFamily: 'Helvetica', lineHeight: 1.5 },
  judul: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subjudul: { fontSize: 9, color: '#5E6B7A', marginBottom: 14 },
  penafian: {
    borderLeftWidth: 3,
    borderLeftColor: '#A32E28',
    paddingLeft: 8,
    paddingVertical: 6,
    marginBottom: 16,
    fontSize: 8.5,
    color: '#5E6B7A'
  },
  bagian: { marginBottom: 14 },
  bagianJudul: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.1,
    color: '#5E6B7A',
    marginBottom: 6,
    borderBottomWidth: 0.7,
    borderBottomColor: '#CBD3DC',
    paddingBottom: 3
  },
  baris: { flexDirection: 'row', marginBottom: 2.5 },
  kunci: { width: '46%', color: '#5E6B7A' },
  nilai: { width: '54%' },
  kartu: {
    borderWidth: 0.7,
    borderColor: '#CBD3DC',
    borderLeftWidth: 3,
    padding: 9,
    marginBottom: 8
  },
  kartuJudul: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  status: { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 0.8, marginBottom: 4 },
  poin: { flexDirection: 'row', marginBottom: 1.5 },
  penanda: { width: 11, color: '#5E6B7A' },
  isiPoin: { flex: 1 },
  sitasi: { fontSize: 7.5, color: '#5E6B7A', marginTop: 1 },
  hitungBaris: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1.5 },
  hitungTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.7,
    borderTopColor: '#CBD3DC',
    marginTop: 3,
    paddingTop: 3,
    fontFamily: 'Helvetica-Bold'
  },
  kaki: {
    position: 'absolute',
    bottom: 24,
    left: 42,
    right: 42,
    fontSize: 7.5,
    color: '#5E6B7A',
    borderTopWidth: 0.7,
    borderTopColor: '#CBD3DC',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

function Baris({ kunci, nilai }: { kunci: string; nilai: string }) {
  return (
    <View style={s.baris}>
      <Text style={s.kunci}>{kunci}</Text>
      <Text style={s.nilai}>{nilai}</Text>
    </View>
  );
}

function Hitung({ kunci, nilai }: { kunci: string; nilai: string }) {
  return (
    <View style={s.hitungBaris}>
      <Text>{kunci}</Text>
      <Text>{nilai}</Text>
    </View>
  );
}

function RincianSkema({ skema }: { skema: HasilSkema }) {
  if (skema.statusKalkulasi !== 'TERSEDIA') {
    return <Text style={s.sitasi}>{skema.alasanKalkulasi}</Text>;
  }

  const r = skema.rincianKalkulasi;

  if (r.skema === 'PPH_FINAL_05') {
    return (
      <View style={{ marginTop: 5 }}>
        <Hitung kunci="Omzet pribadi tahun pajak" nilai={formatCurrency(r.omzetPribadi)} />
        <Hitung kunci="Bagian yang dibebaskan" nilai={`- ${formatCurrency(r.batasPembebasan)}`} />
        <Hitung kunci="Dasar pengenaan pajak" nilai={formatCurrency(r.dasarPengenaan)} />
        <Hitung kunci="Tarif" nilai={formatTarif(r.tarif)} />
        <View style={s.hitungTotal}>
          <Text>Pajak terutang</Text>
          <Text>{formatCurrency(r.pajakTerutang)}</Text>
        </View>
      </View>
    );
  }

  const dasarNeto =
    r.skema === 'NPPN'
      ? { label: `Norma ${formatPersenNorma(r.persenNorma)}`, nilai: formatCurrency(r.penghasilanNeto) }
      : { label: 'Omzet dikurangi biaya usaha', nilai: formatCurrency(r.penghasilanNeto) };

  return (
    <View style={{ marginTop: 5 }}>
      <Hitung kunci="Omzet pribadi tahun pajak" nilai={formatCurrency(r.omzetPribadi)} />
      {r.skema === 'TARIF_UMUM' && (
        <Hitung kunci="Biaya usaha" nilai={`- ${formatCurrency(r.biayaOperasional)}`} />
      )}
      <Hitung kunci={`Penghasilan neto (${dasarNeto.label})`} nilai={dasarNeto.nilai} />
      <Hitung kunci="PTKP" nilai={`- ${formatCurrency(r.ptkp)}`} />
      <Hitung kunci="Penghasilan Kena Pajak" nilai={formatCurrency(r.pkp)} />
      {r.lapisanTerpakai.map((lapis) => (
        <Hitung
          key={lapis.lapisan}
          kunci={`  Lapisan ${lapis.lapisan} · ${formatCurrency(lapis.bagianPkp)} × ${formatTarif(lapis.tarif)}`}
          nilai={formatCurrency(lapis.pajakLapisan)}
        />
      ))}
      <Hitung kunci="Pajak sebelum kredit" nilai={formatCurrency(r.pajakSebelumKredit)} />
      <Hitung kunci="Kredit bukti potong" nilai={`- ${formatCurrency(r.kreditBupot)}`} />
      <View style={s.hitungTotal}>
        <Text>Pajak terutang</Text>
        <Text>{formatCurrency(r.pajakTerutang)}</Text>
      </View>
    </View>
  );
}

export function KertasKerjaPdf({ hasil }: { hasil: HasilAuditPajak }) {
  const { profil } = hasil;
  const klu = cariKlu(profil.kluKode);

  return (
    <Document
      title={`Kertas kerja pra-lapor PajakWajar ${profil.tahunPajak}`}
      author="PajakWajar"
      subject="Ringkasan kelayakan dan perkiraan pajak"
    >
      <Page size="A4" style={s.page}>
        <Text style={s.judul}>Kertas kerja pra-lapor pajak</Text>
        <Text style={s.subjudul}>
          PajakWajar · Tahun Pajak {profil.tahunPajak} · Disusun {formatTanggalIndonesia(hasil.tanggalAudit)}
        </Text>

        <Text style={s.penafian}>
          Dokumen ini alat bantu, bukan nasihat pajak dan bukan dokumen resmi DJP. Seluruh angka
          berasal dari data yang Anda isi sendiri. Cocokkan kembali melalui akun Coretax DJP, KPP
          tempat Anda terdaftar, atau Kring Pajak 1500200 sebelum mengisi SPT Tahunan.
        </Text>

        <View style={s.bagian}>
          <Text style={s.bagianJudul}>DATA YANG ANDA ISI</Text>
          <Baris
            kunci="Kegiatan usaha (KLU)"
            nilai={klu ? `${klu.nama} (${klu.kluKode})` : profil.kluKode}
          />
          <Baris kunci="Kelompok wilayah" nilai={basisAturan.kelompokWilayah[profil.wilayah].nama} />
          <Baris kunci="Keadaan keluarga (PTKP)" nilai={profil.statusPtkp} />
          <Baris
            kunci="Omzet pribadi tahun pajak berjalan"
            nilai={formatCurrency(profil.omzetPribadiTahunPajak)}
          />
          <Baris
            kunci="Omzet pribadi tahun pajak sebelumnya"
            nilai={formatCurrency(profil.omzetPribadiThnSebelumnya)}
          />
          <Baris
            kunci="Omzet pasangan tahun pajak sebelumnya"
            nilai={formatCurrency(profil.omzetPasanganThnSebelumnya)}
          />
          <Baris
            kunci="Omzet perseroan perorangan tahun sebelumnya"
            nilai={formatCurrency(profil.omzetSeluruhPerseroanPeroranganThnSebelumnya)}
          />
          <Baris
            kunci="Biaya usaha setahun"
            nilai={
              profil.biayaOperasionalRiil === undefined
                ? 'Belum diisi'
                : formatCurrency(profil.biayaOperasionalRiil)
            }
          />
          <Baris kunci="Total kredit bukti potong" nilai={formatCurrency(hasil.totalKreditBupot)} />
        </View>

        <View style={s.bagian}>
          <Text style={s.bagianJudul}>HASIL PEMERIKSAAN KELAYAKAN</Text>
          {hasil.skema.map((skema) => (
            <View key={skema.id} style={{ ...s.kartu, borderLeftColor: warnaStatus[skema.statusKelayakan] }} wrap={false}>
              <Text style={{ ...s.status, color: warnaStatus[skema.statusKelayakan] }}>
                {labelStatus[skema.statusKelayakan]}
              </Text>
              <Text style={s.kartuJudul}>{namaSkema[skema.id]}</Text>
              {skema.alasanKelayakan.map((alasan, index) => (
                <View key={index} style={s.poin}>
                  <Text style={s.penanda}>&ndash;</Text>
                  <Text style={s.isiPoin}>{alasan}</Text>
                </View>
              ))}
              {skema.konsekuensiJangkaPanjang ? (
                <View style={s.poin}>
                  <Text style={s.penanda}>!</Text>
                  <Text style={s.isiPoin}>{skema.konsekuensiJangkaPanjang}</Text>
                </View>
              ) : null}
              <RincianSkema skema={skema} />
              <Text style={s.sitasi}>
                Dasar hukum:{' '}
                {skema.dasarHukum
                  .map((d) => `${d.namaRegulasi} ${d.pasalAtauLampiran}`)
                  .join(' · ')}
              </Text>
            </View>
          ))}
        </View>

        {hasil.peringatan.length > 0 && (
          <View style={s.bagian}>
            <Text style={s.bagianJudul}>HAL YANG PERLU ANDA PERHATIKAN</Text>
            {hasil.peringatan.map((teks, index) => (
              <View key={index} style={s.poin}>
                <Text style={s.penanda}>!</Text>
                <Text style={s.isiPoin}>{teks}</Text>
              </View>
            ))}
          </View>
        )}

        {hasil.langkahTindakLanjut.length > 0 && (
          <View style={s.bagian}>
            <Text style={s.bagianJudul}>LANGKAH BERIKUTNYA</Text>
            {hasil.langkahTindakLanjut.map((teks, index) => (
              <View key={index} style={s.poin}>
                <Text style={s.penanda}>{index + 1}.</Text>
                <Text style={s.isiPoin}>{teks}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.kaki} fixed>
          <Text>Basis aturan: {hasil.versiRegulasi}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
