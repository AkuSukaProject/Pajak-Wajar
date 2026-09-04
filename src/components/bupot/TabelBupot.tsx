'use client';

import React from 'react';
import { BuktiPotong } from '@/types/pajak';
import { formatRupiah } from '@/lib/bupot';

interface TabelBupotProps {
  daftarBupot: BuktiPotong[];
  onHapusBupot: (id: string) => void;
  onEditBupot?: (bupot: BuktiPotong) => void;
}

export function TabelBupot({ daftarBupot, onHapusBupot, onEditBupot }: TabelBupotProps) {
  const totalDpp = daftarBupot.reduce((acc, b) => acc + (b.dpp || 0), 0);
  const totalKredit = daftarBupot.reduce((acc, b) => acc + (b.pphDipotong || 0), 0);

  if (daftarBupot.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-slate-50/50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-margin">
          📄
        </div>
        <h4 className="text-sm font-bold text-ink">Belum Ada Bukti Potong yang Ditambahkan</h4>
        <p className="mt-1 text-xs text-margin max-w-md mx-auto">
          Jika Anda telah dipotong pajak oleh klien/perusahaan (PPh 21/23), masukkan datanya untuk mengurangi pajak terutang tahunan Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-xs font-bold uppercase tracking-wider text-margin">
            <tr>
              <th className="px-4 py-3">No. Bupot & Pemotong</th>
              <th className="px-4 py-3">Jenis & Masa</th>
              <th className="px-4 py-3 text-right">DPP (Bruto)</th>
              <th className="px-4 py-3 text-right">PPh Dipotong</th>
              <th className="px-4 py-3 text-center">Sumber</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {daftarBupot.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50 transition">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{b.nomorBupot}</div>
                  <div className="text-xs text-margin">{b.namaPemotong}</div>
                  {b.npwpPemotong && (
                    <div className="text-[11px] text-margin/80">NPWP: {b.npwpPemotong}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded bg-blue/10 px-2 py-0.5 text-xs font-bold text-blue">
                    {b.jenisPph === 'PPH_21' ? 'PPh 21' : 'PPh 23'}
                  </span>
                  <div className="text-xs text-margin mt-1">{b.masaPajak || '-'}</div>
                </td>
                <td className="px-4 py-3 text-right text-ink font-mono">
                  {formatRupiah(b.dpp)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-ink font-mono">
                  {formatRupiah(b.pphDipotong)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        b.sumber === 'ocr'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.sumber === 'ocr' ? '⚡ OCR' : '✍️ Manual'}
                    </span>
                    {b.perluPemeriksaanManual && (
                      <span
                        className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
                        title="Hasil OCR memerlukan pemeriksaan manual"
                      >
                        ⚠️ Cek Ulang
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {onEditBupot && (
                    <button
                      type="button"
                      onClick={() => onEditBupot(b)}
                      className="text-xs font-semibold text-blue hover:underline mr-3"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onHapusBupot(b.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                    aria-label={`Hapus bupot ${b.nomorBupot}`}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-line bg-slate-50/80 font-bold text-ink">
            <tr>
              <td colSpan={2} className="px-4 py-3 text-xs uppercase tracking-wider text-margin">
                Total Agregasi Kredit ({daftarBupot.length} Bupot)
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs text-margin">
                {formatRupiah(totalDpp)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm text-blue">
                {formatRupiah(totalKredit)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
