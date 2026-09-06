'use client';

import { useId } from 'react';
import type { ChangeEvent } from 'react';
import { formatRibuan, hanyaAngka, posisiSetelahDigit } from '@/lib/format';

/**
 * Isian nominal rupiah yang menyisipkan titik pemisah ribuan sambil diketik.
 *
 * Dibuat sebagai `type="text"` dengan `inputMode="numeric"`, bukan
 * `type="number"`, karena kolom angka bawaan peramban menolak menampilkan
 * pemisah ribuan. Papan ketik angka pada ponsel tetap muncul.
 *
 * Nilai yang keluar selalu berupa angka bersih, sehingga titik pemisah tidak
 * pernah ikut masuk ke perhitungan pajak.
 */

/** Rp999.999.999.999.999 sudah jauh di atas kebutuhan Wajib Pajak orang pribadi. */
const MAKS_DIGIT = 15;

export function InputRupiah({
  label,
  nilai,
  onChange,
  bantuan,
  bolehKosong = false,
  idKolom,
  galat,
  bergetar = false
}: {
  label: string;
  nilai: number | undefined;
  onChange: (nilai: number | undefined) => void;
  bantuan?: string;
  /** Bila true, kolom yang dikosongkan menghasilkan `undefined`, bukan 0. */
  bolehKosong?: boolean;
  /** Dipakai formulir untuk menggulir dan memfokuskan kolom yang belum benar. */
  idKolom?: string;
  /** Pesan yang menjelaskan apa yang kurang dan cara memperbaikinya. */
  galat?: string;
  /** Menandai kolom yang baru saja disorot karena isinya belum benar. */
  bergetar?: boolean;
}) {
  const idOtomatis = useId();
  const id = idKolom ?? idOtomatis;

  // Pada kolom wajib, nilai 0 berarti "belum diisi", jadi biarkan placeholder
  // yang tampil. Pada kolom yang boleh dikosongkan, 0 adalah jawaban yang
  // disengaja dan harus terlihat berbeda dari kolom kosong: biaya usaha Rp0
  // ikut dihitung, sedangkan biaya usaha yang dikosongkan justru memblokir
  // perhitungan tarif umum.
  const tampilkanNol = bolehKosong;
  const teks =
    nilai === undefined || (nilai === 0 && !tampilkanNol) ? '' : formatRibuan(String(nilai));

  const tangani = (peristiwa: ChangeEvent<HTMLInputElement>) => {
    const kolom = peristiwa.currentTarget;
    const karetLama = kolom.selectionStart ?? kolom.value.length;
    const digitSebelumKaret = hanyaAngka(kolom.value.slice(0, karetLama)).length;

    const digit = hanyaAngka(kolom.value).slice(0, MAKS_DIGIT);
    const teksBaru = formatRibuan(digit);

    // Rapikan isi kolom dan letak karet pada tik yang sama. Tanpa ini, mengetik
    // huruf tidak akan memicu render baru sehingga huruf itu tertinggal di layar,
    // dan karet akan melompat ke ujung setiap kali titik baru disisipkan.
    kolom.value = teksBaru;
    const karetBaru = posisiSetelahDigit(teksBaru, digitSebelumKaret);
    kolom.setSelectionRange(karetBaru, karetBaru);

    if (digit.length === 0) {
      onChange(bolehKosong ? undefined : 0);
      return;
    }
    onChange(Number(digit));
  };

  return (
    <label htmlFor={id} className={`block ${bergetar ? 'motion-shake' : ''}`}>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <span
        className={`flex border bg-white transition-colors focus-within:ring-1 ${
          galat
            ? 'border-stamp ring-1 ring-stamp focus-within:border-stamp focus-within:ring-stamp'
            : 'border-line focus-within:border-blue focus-within:ring-blue'
        }`}
      >
        <span className="border-r border-line px-4 py-3.5 font-mono text-sm text-margin">Rp</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          aria-invalid={galat ? true : undefined}
          aria-describedby={
            [galat ? `${id}-galat` : null, bantuan ? `${id}-help` : null].filter(Boolean).join(' ') || undefined
          }
          value={teks}
          onChange={tangani}
          className="w-full min-w-0 bg-transparent px-4 py-3.5 font-mono outline-none"
          placeholder="0"
          autoComplete="off"
        />
      </span>
      {galat && (
        <span id={`${id}-galat`} className="mt-1.5 block text-xs font-semibold leading-5 text-stamp">
          {galat}
        </span>
      )}
      {bantuan && (
        <span id={`${id}-help`} className="mt-1.5 block text-xs leading-5 text-margin">
          {bantuan}
        </span>
      )}
    </label>
  );
}
