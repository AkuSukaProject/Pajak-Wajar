'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  HasilAuditPajakLengkap,
  HasilRekonsiliasiBupot,
  ProfilWajibPajak,
} from '@/types/pajak';
import { KertasKerjaPdfDocument } from './KertasKerjaPdfDocument';

interface TombolUnduhPdfProps {
  profil: Partial<ProfilWajibPajak>;
  hasilAudit: HasilAuditPajakLengkap;
  rekonsiliasi: HasilRekonsiliasiBupot;
}

export function TombolUnduhPdf({
  profil,
  hasilAudit,
  rekonsiliasi,
}: TombolUnduhPdfProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-bold text-white shadow-sm opacity-60"
      >
        <span>📄</span>
        <span>Menyiapkan Dokumen PDF...</span>
      </button>
    );
  }

  const fileName = `Kertas_Kerja_PajakWajar_${profil.tahunPajak || 2026}_${
    profil.statusPtkp || 'TK0'
  }.pdf`;

  return (
    <PDFDownloadLink
      document={
        <KertasKerjaPdfDocument
          profil={profil}
          hasilAudit={hasilAudit}
          rekonsiliasi={rekonsiliasi}
        />
      }
      fileName={fileName}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-bold text-white shadow-lift hover:bg-slate-800 transition text-center"
    >
      {({ loading }) =>
        loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Membuat Lembar Kerja PDF...</span>
          </>
        ) : (
          <>
            <span>📥</span>
            <span>Unduh Kertas Kerja Pra-Lapor (PDF)</span>
          </>
        )
      }
    </PDFDownloadLink>
  );
}
