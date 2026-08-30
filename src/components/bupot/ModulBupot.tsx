'use client';

import React, { useState, useMemo } from 'react';
import { BuktiPotong, HasilRekonsiliasiBupot } from '@/types/pajak';
import { hitungRekonsiliasiBupot } from '@/lib/bupot';
import { FormBupotManual } from './FormBupotManual';
import { TabelBupot } from './TabelBupot';
import { RingkasanRekonsiliasi } from './RingkasanRekonsiliasi';
import { UploadBupotModal } from './UploadBupotModal';

interface ModulBupotProps {
  pajakTerutangDasar: number;
  initialBupot?: BuktiPotong[];
  onHasilChange?: (hasil: HasilRekonsiliasiBupot) => void;
}

export function ModulBupot({
  pajakTerutangDasar,
  initialBupot = [],
  onHasilChange,
}: ModulBupotProps) {
  const [daftarBupot, setDaftarBupot] = useState<BuktiPotong[]>(initialBupot);
  const [tampilkanForm, setTampilkanForm] = useState(false);
  const [tampilkanOcrModal, setTampilkanOcrModal] = useState(false);
  const [editingBupot, setEditingBupot] = useState<Partial<BuktiPotong> | null>(null);

  const hasilRekonsiliasi = useMemo(() => {
    const hasil = hitungRekonsiliasiBupot({
      pajakTerutangDasar,
      daftarBupot,
    });
    if (onHasilChange) {
      onHasilChange(hasil);
    }
    return hasil;
  }, [pajakTerutangDasar, daftarBupot, onHasilChange]);

  const handleTambahAtauUpdate = (bupot: BuktiPotong) => {
    if (editingBupot?.id) {
      setDaftarBupot((prev) => prev.map((item) => (item.id === bupot.id ? bupot : item)));
    } else {
      setDaftarBupot((prev) => [...prev, bupot]);
    }
    setEditingBupot(null);
    setTampilkanForm(false);
  };

  const handleHapusBupot = (id: string) => {
    setDaftarBupot((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditBupot = (bupot: BuktiPotong) => {
    setEditingBupot(bupot);
    setTampilkanForm(true);
  };

  const handleHasilOcr = (hasilOcr: Omit<BuktiPotong, 'id'>) => {
    // Masukkan hasil OCR ke form manual untuk diverifikasi dan diedit oleh pengguna
    setEditingBupot({
      ...hasilOcr,
      sumber: 'ocr',
    });
    setTampilkanForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Rekonsiliasi Bukti Potong (Kredit Pajak)</h2>
          <p className="text-xs sm:text-sm text-margin mt-1">
            Kreditkan bukti potong PPh 21 / PPh 23 untuk memotong pajak terutang tahunan Anda.
          </p>
        </div>

        {!tampilkanForm && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTampilkanOcrModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-purple-700 hover:bg-purple-100 transition shadow-sm"
            >
              <span>⚡</span>
              <span>Scan Foto (OCR AI)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingBupot(null);
                setTampilkanForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue/90 transition"
            >
              <span>+</span>
              <span>Input Manual</span>
            </button>
          </div>
        )}
      </div>

      {/* Info Banner Batasan Bupot Non-Platform */}
      <div className="rounded-xl border border-line bg-slate-50/70 p-4 text-xs leading-relaxed text-margin">
        <strong className="text-ink">💡 Catatan e-Bupot Coretax:</strong> Bukti potong dari *marketplace/platform digital* terintegrasi (seperti Shopee/Tokopedia) sudah otomatis terekam di Coretax DJP. Modul ini ditujukan khusus untuk merekonsiliasi bukti potong manual dari klien B2B, perusahaan, atau instansi pemberi kerja.
      </div>

      {tampilkanForm && (
        <FormBupotManual
          onTambahBupot={handleTambahAtauUpdate}
          onBatal={() => {
            setTampilkanForm(false);
            setEditingBupot(null);
          }}
          initialData={editingBupot || undefined}
        />
      )}

      <TabelBupot
        daftarBupot={daftarBupot}
        onHapusBupot={handleHapusBupot}
        onEditBupot={handleEditBupot}
      />

      <RingkasanRekonsiliasi rekonsiliasi={hasilRekonsiliasi} />

      {/* Modal Upload & Scan OCR */}
      <UploadBupotModal
        isOpen={tampilkanOcrModal}
        onClose={() => setTampilkanOcrModal(false)}
        onHasilOcr={handleHasilOcr}
        onBeralihKeManual={() => {
          setEditingBupot(null);
          setTampilkanForm(true);
        }}
      />
    </div>
  );
}
