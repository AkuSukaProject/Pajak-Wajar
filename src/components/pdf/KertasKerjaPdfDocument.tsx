import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import {
  HasilAuditPajakLengkap,
  HasilRekonsiliasiBupot,
  ProfilWajibPajak,
} from '@/types/pajak';
import { formatRupiah } from '@/lib/bupot';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    paddingBottom: 10,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  brandSubtitle: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  grid2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridCol: {
    width: '48%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  label: {
    color: '#64748b',
    fontSize: 8,
  },
  value: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#0f172a',
  },
  // Table
  table: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableCellHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#475569',
  },
  tableCell: {
    fontSize: 7,
    color: '#1e293b',
  },
  // Final Box
  summaryBox: {
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 6,
  },
  summaryKurangBayar: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  summaryLebihBayar: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  summaryNihil: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 6,
    color: '#64748b',
    width: '80%',
    lineHeight: 1.3,
  },
  pageNumber: {
    fontSize: 7,
    color: '#94a3b8',
  },
});

interface KertasKerjaPdfProps {
  profil: Partial<ProfilWajibPajak>;
  hasilAudit: HasilAuditPajakLengkap;
  rekonsiliasi: HasilRekonsiliasiBupot;
}

export function KertasKerjaPdfDocument({
  profil,
  hasilAudit,
  rekonsiliasi,
}: KertasKerjaPdfProps) {
  const tanggalCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const skemaBerhak = hasilAudit.skema.find((s) => s.statusKelayakan === 'BOLEH');

  return (
    <Document title={`Kertas Kerja PajakWajar - ${profil.tahunPajak || 2026}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.brandTitle}>PajakWajar</Text>
            <Text style={styles.brandSubtitle}>
              Kertas Kerja Simulasi Pra-Lapor SPT Tahunan Orang Pribadi (Coretax Pre-Filing)
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Tahun Pajak {profil.tahunPajak || 2026}</Text>
          </View>
        </View>

        {/* 1. Identitas & Profil Wajib Pajak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Profil Wajib Pajak & Karakteristik Usaha</Text>
          <View style={styles.grid2}>
            <View style={styles.gridCol}>
              <View style={styles.row}>
                <Text style={styles.label}>Tahun Pajak:</Text>
                <Text style={styles.value}>{profil.tahunPajak || 2026}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status PTKP:</Text>
                <Text style={styles.value}>{profil.statusPtkp || 'TK/0'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Klasifikasi Profesi (KLU):</Text>
                <Text style={styles.value}>{profil.kluKode || '-'}</Text>
              </View>
            </View>
            <View style={styles.gridCol}>
              <View style={styles.row}>
                <Text style={styles.label}>Bentuk Kegiatan:</Text>
                <Text style={styles.value}>{profil.bentukKegiatan || 'Pekerjaan Bebas'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Peredaran Bruto / Omzet:</Text>
                <Text style={styles.value}>
                  {formatRupiah(profil.omzetPribadiTahunPajak || 0)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status Pegawai Tetap:</Text>
                <Text style={styles.value}>{profil.jugaPegawaiTetap ? 'Ya (Digabung)' : 'Tidak'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Vonis Kelayakan Hukum */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Vonis Kelayakan Skema Pajak (Uji Pra-Lapor)</Text>
          {hasilAudit.skema.map((skema, idx) => (
            <View key={idx} style={{ marginBottom: 4 }}>
              <View style={styles.row}>
                <Text style={{ ...styles.label, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                  {skema.id === 'PPH_FINAL_05'
                    ? 'PPh Final UMKM 0,5% (PP 20/2026)'
                    : skema.id === 'NPPN'
                    ? 'Norma NPPN (Penghasilan Neto)'
                    : 'Tarif Umum Pembukuan (Pasal 17)'}
                </Text>
                <Text
                  style={{
                    ...styles.value,
                    color:
                      skema.statusKelayakan === 'BOLEH'
                        ? '#2563eb'
                        : skema.statusKelayakan === 'TIDAK_BOLEH'
                        ? '#dc2626'
                        : '#d97706',
                  }}
                >
                  {skema.statusKelayakan === 'BOLEH'
                    ? 'BOLEH DIPAKAI'
                    : skema.statusKelayakan === 'TIDAK_BOLEH'
                    ? 'TIDAK BOLEH'
                    : 'PERLU DICEK DULU'}
                </Text>
              </View>
              {skema.alasanKelayakan.map((alasan, aIdx) => (
                <Text key={aIdx} style={{ fontSize: 7, color: '#64748b', marginLeft: 8, marginTop: 1 }}>
                  • {alasan}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* 3. Perhitungan Pajak Terutang Dasar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Rincian Pajak Terutang Tahunan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Skema Yang Diterapkan:</Text>
            <Text style={styles.value}>
              {skemaBerhak ? skemaBerhak.id : 'Belum Ditentukan'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dasar Pengenaan Pajak (DPP / Omzet):</Text>
            <Text style={styles.value}>
              {formatRupiah(profil.omzetPribadiTahunPajak || 0)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pajak Terutang Dasar (Sebelum Kredit Bupot):</Text>
            <Text style={{ ...styles.value, color: '#0f172a', fontSize: 9 }}>
              {formatRupiah(rekonsiliasi.pajakTerutangDasar)}
            </Text>
          </View>
        </View>

        {/* 4. Rekonsiliasi Bukti Potong (Kredit Pajak) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Daftar Kredit Pajak (Bukti Potong PPh 21 / PPh 23)
          </Text>
          {rekonsiliasi.daftarBupot.length === 0 ? (
            <Text style={{ fontSize: 7, color: '#64748b', fontStyle: 'italic', marginVertical: 4 }}>
              Tidak ada bukti potong yang dikreditkan.
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableCellHeader, width: '30%' }}>No. Bupot</Text>
                <Text style={{ ...styles.tableCellHeader, width: '30%' }}>Pemotong Pajak</Text>
                <Text style={{ ...styles.tableCellHeader, width: '15%' }}>Jenis</Text>
                <Text style={{ ...styles.tableCellHeader, width: '25%', textAlign: 'right' }}>
                  PPh Dipotong
                </Text>
              </View>
              {rekonsiliasi.daftarBupot.map((b, bIdx) => (
                <View key={bIdx} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, width: '30%' }}>{b.nomorBupot}</Text>
                  <Text style={{ ...styles.tableCell, width: '30%' }}>{b.namaPemotong}</Text>
                  <Text style={{ ...styles.tableCell, width: '15%' }}>
                    {b.jenisPph === 'PPH_21' ? 'PPh 21' : 'PPh 23'}
                  </Text>
                  <Text style={{ ...styles.tableCell, width: '25%', textAlign: 'right' }}>
                    {formatRupiah(b.pphDipotong)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 5. Status Pembayaran Akhir */}
        <View
          style={{
            ...styles.summaryBox,
            ...(rekonsiliasi.status === 'KURANG_BAYAR'
              ? styles.summaryKurangBayar
              : rekonsiliasi.status === 'LEBIH_BAYAR'
              ? styles.summaryLebihBayar
              : styles.summaryNihil),
          }}
        >
          <View style={styles.row}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>
              Total Pajak Terutang Dasar:
            </Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>
              {formatRupiah(rekonsiliasi.pajakTerutangDasar)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#2563eb' }}>
              Total Kredit Bukti Potong:
            </Text>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#2563eb' }}>
              - {formatRupiah(rekonsiliasi.totalKreditBupot)}
            </Text>
          </View>
          <View style={{ ...styles.row, borderBottomWidth: 0, marginTop: 4 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#0f172a' }}>
              STATUS AKHIR ({rekonsiliasi.status.replace('_', ' ')}):
            </Text>
            <Text
              style={{
                fontFamily: 'Helvetica-Bold',
                fontSize: 11,
                color:
                  rekonsiliasi.status === 'KURANG_BAYAR'
                    ? '#b45309'
                    : rekonsiliasi.status === 'LEBIH_BAYAR'
                    ? '#047857'
                    : '#1e40af',
              }}
            >
              {formatRupiah(rekonsiliasi.sisaPajak)}
            </Text>
          </View>
          <Text style={{ fontSize: 7, color: '#475569', marginTop: 4 }}>
            {rekonsiliasi.konsekuensiHukum}
          </Text>
        </View>

        {/* Footer & Disclaimer */}
        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>
            PajakWajar adalah alat bantu simulasi pra-lapor untuk keperluan edukasi. Hasil perhitungan bukan nasihat pajak dan tidak menggantikan konsultasi dengan Direktorat Jenderal Pajak (DJP) atau konsultan pajak berizin. Verifikasi seluruh angka melalui akun Coretax Anda sebelum melaporkan SPT. Dibuat pada {tanggalCetak}.
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Hal ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
