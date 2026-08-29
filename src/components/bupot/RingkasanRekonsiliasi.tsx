'use client';

import React from 'react';
import { HasilRekonsiliasiBupot } from '@/types/pajak';
import { formatRupiah } from '@/lib/bupot';

interface RingkasanRekonsiliasiProps {
  rekonsiliasi: HasilRekonsiliasiBupot;
}

export function RingkasanRekonsiliasi({ rekonsiliasi }: RingkasanRekonsiliasiProps) {
  const { pajakTerutangDasar, totalKreditBupot, sisaPajak, status, konsekuensiHukum } =
    rekonsiliasi;

  return (
    <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-ink">Hasil Rekonsiliasi & Status Akhir</h3>
          <p className="text-xs text-margin mt-0.5">
            Perhitungan pemotongan pajak terutang tahunan dengan kredit bukti potong yang sah.
          </p>
        </div>

        {status === 'KURANG_BAYAR' && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
            PPh 29 Kurang Bayar
          </span>
        )}
        {status === 'LEBIH_BAYAR' && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
            PPh 28A Lebih Bayar
          </span>
        )}
        {status === 'NIHIL' && (
          <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-bold text-blue border border-blue/20">
            SPT Tahunan Nihil
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-lg border border-line bg-slate-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-margin">Pajak Terutang Dasar</p>
          <p className="mt-1 text-lg font-bold font-mono text-ink">
            {formatRupiah(pajakTerutangDasar)}
          </p>
          <p className="text-[11px] text-margin mt-0.5">Sebelum dikurangi bukti potong</p>
        </div>

        <div className="rounded-lg border border-line bg-slate-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-margin">Total Kredit Bupot</p>
          <p className="mt-1 text-lg font-bold font-mono text-blue">
            - {formatRupiah(totalKreditBupot)}
          </p>
          <p className="text-[11px] text-margin mt-0.5">Jumlah seluruh potongan PPh 21/23</p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            status === 'KURANG_BAYAR'
              ? 'border-amber-200 bg-amber-50/60'
              : status === 'LEBIH_BAYAR'
              ? 'border-emerald-200 bg-emerald-50/60'
              : 'border-blue/20 bg-blue/5'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-margin">
            {status === 'KURANG_BAYAR'
              ? 'Pajak Yang Masih Harus Disetor'
              : status === 'LEBIH_BAYAR'
              ? 'Potensi Restitusi Lebih Bayar'
              : 'Pajak Akhir Terutang'}
          </p>
          <p
            className={`mt-1 text-xl font-extrabold font-mono ${
              status === 'KURANG_BAYAR'
                ? 'text-amber-900'
                : status === 'LEBIH_BAYAR'
                ? 'text-emerald-900'
                : 'text-ink'
            }`}
          >
            {formatRupiah(sisaPajak)}
          </p>
          <p className="text-[11px] text-margin mt-0.5">
            {status === 'KURANG_BAYAR'
              ? 'Kurang Bayar (PPh 29)'
              : status === 'LEBIH_BAYAR'
              ? 'Lebih Bayar (PPh 28A)'
              : 'Lunas / Nihil'}
          </p>
        </div>
      </div>

      <div
        className={`rounded-lg border p-4 text-xs leading-relaxed ${
          status === 'LEBIH_BAYAR'
            ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
            : status === 'KURANG_BAYAR'
            ? 'border-amber-200 bg-amber-50/40 text-amber-900'
            : 'border-slate-200 bg-slate-50 text-slate-800'
        }`}
      >
        <p className="font-bold mb-1">⚖️ Konsekuensi Perpajakan:</p>
        <p>{konsekuensiHukum}</p>
      </div>
    </div>
  );
}
