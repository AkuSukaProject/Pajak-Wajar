'use client';

import React from 'react';
import { HasilAuditPajakLengkap, HasilSkema, StatusKelayakan } from '@/types/pajak';
import { formatRupiah } from '@/lib/bupot';

const namaSkema: Record<string, string> = {
  PPH_FINAL_05: 'PPh Final UMKM 0,5% (PP 20/2026)',
  NPPN: 'Norma NPPN (Penghasilan Neto)',
  TARIF_UMUM: 'Tarif Umum Pembukuan (Pasal 17 UU PPh)',
};

const tampilanStatus: Record<
  StatusKelayakan,
  { label: string; simbol: string; border: string; text: string; bg: string }
> = {
  BOLEH: {
    label: 'BOLEH DIPAKAI',
    simbol: '✓',
    border: 'border-blue',
    text: 'text-blue',
    bg: 'bg-blue/10',
  },
  TIDAK_BOLEH: {
    label: 'TIDAK BOLEH DIPAKAI',
    simbol: '×',
    border: 'border-red-600',
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
  PERLU_DIPASTIKAN: {
    label: 'PERLU DICEK DULU',
    simbol: '?',
    border: 'border-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
  },
};

interface KartuVonisProps {
  hasil: HasilAuditPajakLengkap;
}

export function KartuVonis({ hasil }: KartuVonisProps) {
  return (
    <section className="bg-paper p-4 shadow-sheet sm:p-7 rounded-2xl" aria-labelledby="judul-hasil" aria-live="polite">
      <div className="mb-6 flex items-start justify-between gap-5 border-b border-line pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue">Vonis Kelayakan Hukum</p>
          <h2 id="judul-hasil" className="mt-1 font-display text-2xl sm:text-3xl font-semibold">
            Skema Pajak Yang Sah Untuk Anda
          </h2>
          {hasil.rekomendasiUtama && (
            <p className="mt-2 text-sm text-margin">{hasil.rekomendasiUtama}</p>
          )}
        </div>
        <span className="rounded-full border border-blue px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-blue bg-blue/5">
          Audit Deterministik
        </span>
      </div>

      <div className="space-y-5">
        {hasil.skema.map((item: HasilSkema, index: number) => {
          const ui = tampilanStatus[item.statusKelayakan];
          return (
            <article
              key={item.id}
              className={`motion-result relative overflow-hidden rounded-xl border-l-8 ${ui.border} bg-white p-5 sm:p-6 shadow-sm`}
              style={{ animationDelay: `${100 + index * 110}ms` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full border-2 ${ui.border} ${ui.text} font-mono text-sm font-bold`}
                    aria-hidden="true"
                  >
                    {ui.simbol}
                  </span>
                  <span className={`text-xs font-bold tracking-[0.14em] ${ui.text}`}>
                    {ui.label}
                  </span>
                </div>

                {item.statusKalkulasi === 'TERSEDIA' && (
                  <div className="text-right">
                    <span className="text-[11px] text-margin block">Estimasi Pajak Terutang:</span>
                    <span className="font-mono text-lg font-bold text-ink">
                      {formatRupiah(item.pajakTerutang)}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="mt-3 font-display text-xl sm:text-2xl font-semibold text-ink">
                {namaSkema[item.id] || item.id}
              </h3>

              {item.alasanKelayakan && item.alasanKelayakan.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-margin">
                  {item.alasanKelayakan.map((alasan, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-ink/60 mt-1">•</span>
                      <span>{alasan}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.statusKalkulasi === 'BELUM_TERSEDIA' && item.alasanKalkulasi && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-margin border border-line">
                  <strong className="text-ink">Catatan Perhitungan:</strong> {item.alasanKalkulasi}
                </div>
              )}

              {item.dasarHukum && item.dasarHukum.length > 0 && (
                <details className="detail-panel group mt-4 border-t border-line pt-3 text-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink hover:text-blue transition">
                    <span className="text-xs uppercase tracking-wider text-margin">Dasar Hukum & Sitasi Regulasi</span>
                    <span className="font-mono text-sm text-margin transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="mt-3 space-y-2 border-l-2 border-line pl-4">
                    {item.dasarHukum.map((dh, i) => (
                      <div key={i} className="text-xs text-margin">
                        <a
                          href={dh.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue hover:underline"
                        >
                          {dh.namaRegulasi} — {dh.pasalAtauLampiran}
                        </a>
                        <p className="mt-0.5">{dh.fungsi}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </article>
          );
        })}
      </div>

      {hasil.peringatanTaxLeakage && hasil.peringatanTaxLeakage.length > 0 && (
        <div className="mt-6 space-y-2">
          {hasil.peringatanTaxLeakage.map((peringatan, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 leading-relaxed"
            >
              <span className="font-bold text-amber-600" aria-hidden="true">
                ⚠️
              </span>
              <span>{peringatan}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-line bg-slate-50/80 p-4 text-xs leading-relaxed text-margin">
        <strong className="text-ink">Penafian Hukum:</strong> PajakWajar adalah alat bantu simulasi pra-lapor untuk keperluan edukasi. Hasil perhitungan bukan nasihat pajak dan tidak menggantikan konsultasi dengan Direktorat Jenderal Pajak (DJP) atau konsultan pajak berizin.
      </div>
    </section>
  );
}
