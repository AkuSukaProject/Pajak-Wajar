'use client';

import React, { useState, useMemo } from 'react';
import { BuktiPotong, HasilRekonsiliasiBupot } from '@/types/pajak';
import { hitungRekonsiliasiBupot } from '@/lib/bupot';
import { FormBupotManual } from './FormBupotManual';
import { TabelBupot } from './TabelBupot';
import { RingkasanRekonsiliasi } from './RingkasanRekonsiliasi';

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
  const [editingBupot, setEditingBupot] = useState<BuktiPotong | null>(null);

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
    if (editingBupot) {
      setDaftarBupot((prev) => prev.map((item) => (item.id === bupot.id ? bupot : item)));
      setEditingBupot(null);
    } else {
      setDaftarBupot((prev) => [...prev, bupot]);
    }
    setTampilkanForm(false);
  };

  const handleHapusBupot = (id: string) => {
    setDaftarBupot((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditBupot = (bupot: BuktiPotong) => {
    setEditingBupot(bupot);
    setTampilkanForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Rekonsiliasi Bukti Potong (Kredit Pajak)</h2>
          <p className="text-sm text-margin mt-1">
            Kreditkan bukti potong PPh 21 / PPh 23 untuk memotong pajak terutang tahunan Anda.
          </p>
        </div>

        {!tampilkanForm && (
          <button
            type="button"
            onClick={() => {
              setEditingBupot(null);
              setTampilkanForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue/90 transition"
          >
            <span>+</span>
            <span>Tambah Bukti Potong</span>
          </button>
        )}
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
    </div>
  );
}
