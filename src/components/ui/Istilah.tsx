'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ISTILAH, type KunciIstilah } from '@/lib/istilah';

/**
 * Istilah yang dapat ditekan untuk memunculkan penjelasan singkat.
 *
 * Dipakai sebagai `<span>` agar sah dipasang di dalam paragraf, label, maupun
 * legend. Penjelasannya bahan bacaan, bukan dasar keputusan: seluruh vonis dan
 * angka tetap datang dari mesin aturan.
 */
export function Istilah({ nama, children }: { nama: KunciIstilah; children?: ReactNode }) {
  const [terbuka, setTerbuka] = useState(false);
  const wadah = useRef<HTMLSpanElement>(null);
  const id = useId();
  const entri = ISTILAH[nama];

  useEffect(() => {
    if (!terbuka) return;

    const tutupBilaDiluar = (peristiwa: MouseEvent) => {
      if (wadah.current && !wadah.current.contains(peristiwa.target as Node)) setTerbuka(false);
    };
    const tutupDenganEscape = (peristiwa: KeyboardEvent) => {
      if (peristiwa.key === 'Escape') setTerbuka(false);
    };

    document.addEventListener('mousedown', tutupBilaDiluar);
    document.addEventListener('keydown', tutupDenganEscape);
    return () => {
      document.removeEventListener('mousedown', tutupBilaDiluar);
      document.removeEventListener('keydown', tutupDenganEscape);
    };
  }, [terbuka]);

  return (
    <span className="relative inline-block" ref={wadah}>
      <button
        type="button"
        onClick={() => setTerbuka((lama) => !lama)}
        aria-expanded={terbuka}
        aria-controls={terbuka ? id : undefined}
        className="istilah-pemicu cursor-help border-b border-dashed border-blue/70 font-semibold text-blue underline-offset-2 hover:border-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {children ?? entri.judul}
        <span className="sr-only"> — tekan untuk penjelasan</span>
      </button>

      {terbuka && (
        <span
          id={id}
          role="note"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 block w-72 max-w-[calc(100vw-2.5rem)] border border-line bg-white p-4 text-left shadow-lg"
        >
          <span className="block text-sm font-semibold text-ink">{entri.judul}</span>
          <span className="mt-1 block text-xs font-normal leading-5 text-margin">{entri.penjelasan}</span>
          {'kenapaDitanya' in entri && entri.kenapaDitanya && (
            <span className="mt-2 block border-l-2 border-blue pl-2 text-xs font-normal leading-5 text-margin">
              {entri.kenapaDitanya}
            </span>
          )}
          <button
            type="button"
            onClick={() => setTerbuka(false)}
            className="mt-3 block text-xs font-semibold text-blue hover:underline"
          >
            Tutup
          </button>
        </span>
      )}
    </span>
  );
}
