'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ISTILAH, type KunciIstilah } from '@/lib/istilah';

const LEBAR_PANEL = 288;
const JARAK = 8;
const TEPI = 12;

/**
 * Istilah yang dapat ditekan untuk memunculkan penjelasan singkat.
 *
 * Panelnya dipasang lewat portal ke `document.body`, bukan sebagai anak dari
 * pemicunya. Kartu formulir memakai `overflow-hidden` dan daftar pekerjaan
 * memakai `overflow-y-auto`; panel yang diposisikan biasa akan terpotong oleh
 * keduanya. Posisinya dihitung dari letak tombol dan dibalik ke atas bila ruang
 * di bawah tidak cukup.
 */
export function Istilah({ nama, children }: { nama: KunciIstilah; children?: ReactNode }) {
  const [terbuka, setTerbuka] = useState(false);
  const [posisi, setPosisi] = useState<{ top: number; left: number } | null>(null);
  const pemicu = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const entri = ISTILAH[nama];

  useLayoutEffect(() => {
    if (!terbuka) return;

    const hitungPosisi = () => {
      const kotakPemicu = pemicu.current?.getBoundingClientRect();
      if (!kotakPemicu) return;

      const tinggiPanel = panel.current?.offsetHeight ?? 200;
      const lebarPanel = panel.current?.offsetWidth ?? LEBAR_PANEL;
      const ruangBawah = window.innerHeight - kotakPemicu.bottom;
      const cukupDiBawah = ruangBawah >= tinggiPanel + JARAK + TEPI;
      const cukupDiAtas = kotakPemicu.top >= tinggiPanel + JARAK + TEPI;

      const top = cukupDiBawah || !cukupDiAtas
        ? Math.min(kotakPemicu.bottom + JARAK, window.innerHeight - tinggiPanel - TEPI)
        : kotakPemicu.top - tinggiPanel - JARAK;

      const left = Math.min(
        Math.max(TEPI, kotakPemicu.left),
        Math.max(TEPI, window.innerWidth - lebarPanel - TEPI)
      );

      setPosisi({ top: Math.max(TEPI, top), left });
    };

    hitungPosisi();
    // Dua kali: sesudah panel benar-benar terukur, tingginya baru diketahui.
    const bingkai = window.requestAnimationFrame(hitungPosisi);
    window.addEventListener('scroll', hitungPosisi, true);
    window.addEventListener('resize', hitungPosisi);
    return () => {
      window.cancelAnimationFrame(bingkai);
      window.removeEventListener('scroll', hitungPosisi, true);
      window.removeEventListener('resize', hitungPosisi);
    };
  }, [terbuka]);

  useEffect(() => {
    if (!terbuka) return;

    const tutupBilaDiluar = (peristiwa: MouseEvent) => {
      const sasaran = peristiwa.target as Node;
      if (pemicu.current?.contains(sasaran) || panel.current?.contains(sasaran)) return;
      setTerbuka(false);
    };
    const tutupDenganEscape = (peristiwa: KeyboardEvent) => {
      if (peristiwa.key === 'Escape') {
        setTerbuka(false);
        pemicu.current?.focus();
      }
    };

    document.addEventListener('mousedown', tutupBilaDiluar);
    document.addEventListener('keydown', tutupDenganEscape);
    return () => {
      document.removeEventListener('mousedown', tutupBilaDiluar);
      document.removeEventListener('keydown', tutupDenganEscape);
    };
  }, [terbuka]);

  const kenapa = 'kenapaDitanya' in entri ? entri.kenapaDitanya : undefined;

  return (
    <>
      <button
        ref={pemicu}
        type="button"
        onClick={() => setTerbuka((lama) => !lama)}
        aria-expanded={terbuka}
        aria-controls={terbuka ? id : undefined}
        className="istilah-pemicu cursor-help border-b border-dashed border-blue/70 font-semibold text-blue hover:border-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {children ?? entri.judul}
        <span className="sr-only"> — tekan untuk penjelasan</span>
      </button>

      {terbuka && typeof document !== 'undefined' && createPortal(
        <div
          ref={panel}
          id={id}
          role="note"
          style={{
            position: 'fixed',
            top: posisi?.top ?? -9999,
            left: posisi?.left ?? -9999,
            width: `min(${LEBAR_PANEL}px, calc(100vw - ${TEPI * 2}px))`,
            visibility: posisi ? 'visible' : 'hidden'
          }}
          className="z-50 border border-line bg-white p-4 text-left shadow-lg"
        >
          <p className="text-sm font-semibold text-ink">{entri.judul}</p>
          <p className="mt-1 text-xs leading-5 text-margin">{entri.penjelasan}</p>
          {kenapa && (
            <p className="mt-2 border-l-2 border-blue pl-2 text-xs leading-5 text-margin">{kenapa}</p>
          )}
          <button
            type="button"
            onClick={() => {
              setTerbuka(false);
              pemicu.current?.focus();
            }}
            className="mt-3 text-xs font-semibold text-blue hover:underline"
          >
            Tutup
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
