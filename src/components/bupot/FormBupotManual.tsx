'use client';

import React, { useState } from 'react';
import { BuktiPotong, JenisBupot } from '@/types/pajak';
import { formatNpwp } from '@/lib/bupot';

interface FormBupotManualProps {
  onTambahBupot: (bupot: BuktiPotong) => void;
  onBatal?: () => void;
  initialData?: Partial<BuktiPotong>;
}

export function FormBupotManual({ onTambahBupot, onBatal, initialData }: FormBupotManualProps) {
  const [nomorBupot, setNomorBupot] = useState(initialData?.nomorBupot || '');
  const [npwpPemotong, setNpwpPemotong] = useState(initialData?.npwpPemotong || '');
  const [namaPemotong, setNamaPemotong] = useState(initialData?.namaPemotong || '');
  const [jenisPph, setJenisPph] = useState<JenisBupot>(initialData?.jenisPph || 'PPH_21');
  const [dpp, setDpp] = useState<string>(initialData?.dpp ? String(initialData.dpp) : '');
  const [pphDipotong, setPphDipotong] = useState<string>(
    initialData?.pphDipotong ? String(initialData.pphDipotong) : ''
  );
  const [masaPajak, setMasaPajak] = useState(initialData?.masaPajak || 'Tahunan');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedDpp = parseFloat(dpp.replace(/\D/g, '')) || 0;
    const parsedPph = parseFloat(pphDipotong.replace(/\D/g, '')) || 0;

    if (!nomorBupot.trim()) {
      setErrorMsg('Nomor Bukti Potong wajib diisi.');
      return;
    }
    if (!namaPemotong.trim()) {
      setErrorMsg('Nama Pihak Pemotong wajib diisi.');
      return;
    }
    if (parsedPph <= 0) {
      setErrorMsg('Nominal PPh yang dipotong harus lebih besar dari Rp0.');
      return;
    }

    const bupotBaru: BuktiPotong = {
      id: initialData?.id || `bupot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nomorBupot: nomorBupot.trim(),
      npwpPemotong: formatNpwp(npwpPemotong.trim()),
      namaPemotong: namaPemotong.trim(),
      jenisPph,
      dpp: parsedDpp,
      pphDipotong: parsedPph,
      masaPajak: masaPajak.trim(),
      sumber: initialData?.sumber || 'manual',
      perluPemeriksaanManual: initialData?.perluPemeriksaanManual,
    };

    onTambahBupot(bupotBaru);

    // Reset form jika bukan edit
    if (!initialData?.id) {
      setNomorBupot('');
      setNpwpPemotong('');
      setNamaPemotong('');
      setDpp('');
      setPphDipotong('');
      setMasaPajak('Tahunan');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-ink">
            {initialData?.id ? 'Edit Bukti Potong' : 'Input Manual Bukti Potong'}
          </h3>
          <p className="text-xs text-margin mt-0.5">
            Masukkan rincian bukti pemotongan PPh 21 atau PPh 23 dari klien/pemberi kerja.
          </p>
        </div>
        <span className="rounded-full bg-blue/10 px-2.5 py-1 text-xs font-semibold text-blue">
          {initialData?.sumber === 'ocr' ? '⚡ Verifikasi OCR' : 'Mode Manual'}
        </span>
      </div>

      {initialData?.perluPemeriksaanManual && (
        <div className="mb-4 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-900 border border-amber-200 flex items-start gap-2.5">
          <span className="text-base">⚠️</span>
          <div>
            <strong className="font-bold">Perlu Pemeriksaan Manual:</strong> Beberapa teks atau nominal pada foto bukti potong mungkin kurang jelas/buram. Mohon periksa kembali kolom nomor bupot, nama pemotong, dan nominal di bawah sebelum menyimpan.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
            Nomor Bukti Potong <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nomorBupot}
            onChange={(e) => setNomorBupot(e.target.value)}
            placeholder="Contoh: 21-001/BP/2025"
            className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink placeholder:text-margin/60 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
            Jenis PPh <span className="text-red-500">*</span>
          </label>
          <select
            value={jenisPph}
            onChange={(e) => setJenisPph(e.target.value as JenisBupot)}
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2 text-sm text-ink focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
          >
            <option value="PPH_21">PPh Pasal 21 (Jasa / Pekerjaan Bebas / Pegawai)</option>
            <option value="PPH_23">PPh Pasal 23 (Jasa Teknik/Manajemen/Sewa)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
            Nama Pemotong (Klien / Perusahaan) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={namaPemotong}
            onChange={(e) => setNamaPemotong(e.target.value)}
            placeholder="Contoh: PT Klien Media Kreasi"
            className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink placeholder:text-margin/60 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
            NPWP / NIK Pemotong (Opsional)
          </label>
          <input
            type="text"
            value={npwpPemotong}
            onChange={(e) => setNpwpPemotong(e.target.value)}
            placeholder="Contoh: 01.234.567.8-901.000"
            className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink placeholder:text-margin/60 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
            Dasar Pengenaan Pajak (DPP / Bruto)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2 text-sm text-margin">Rp</span>
            <input
              type="text"
              value={dpp ? Number(dpp.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
              onChange={(e) => setDpp(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-line pl-10 pr-3.5 py-2 text-sm text-ink placeholder:text-margin/60 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
            PPh yang Dipotong (Kredit Pajak) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2 text-sm text-margin">Rp</span>
            <input
              type="text"
              value={pphDipotong ? Number(pphDipotong.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
              onChange={(e) => setPphDipotong(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-line pl-10 pr-3.5 py-2 text-sm font-semibold text-ink placeholder:text-margin/60 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
            Masa / Tahun Pajak
          </label>
          <input
            type="text"
            value={masaPajak}
            onChange={(e) => setMasaPajak(e.target.value)}
            placeholder="Contoh: 01-2025 atau Tahunan"
            className="w-full rounded-lg border border-line px-3.5 py-2 text-sm text-ink placeholder:text-margin/60 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
        {onBatal && (
          <button
            type="button"
            onClick={onBatal}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-margin hover:bg-slate-50 transition"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-blue px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue/90 transition"
        >
          {initialData?.id ? 'Simpan Perubahan' : '+ Tambah ke Kredit Pajak'}
        </button>
      </div>
    </form>
  );
}
