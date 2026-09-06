import { describe, expect, it } from 'vitest';
import {
  bacaNominal,
  formatCurrency,
  formatRibuan,
  hanyaAngka,
  posisiSetelahDigit
} from '../src/lib/format';

/**
 * Pemisah ribuan hanya urusan tampilan. Uji di sini menjaga agar titik itu
 * tidak pernah bocor ke angka yang dipakai menghitung pajak.
 */

describe('pemisah ribuan', () => {
  it('menyisipkan titik setiap tiga digit', () => {
    expect(formatRibuan('1000000')).toBe('1.000.000');
    expect(formatRibuan('50000000')).toBe('50.000.000');
    expect(formatRibuan('999999999999999')).toBe('999.999.999.999.999');
  });

  it('tidak menyentuh angka di bawah seribu', () => {
    expect(formatRibuan('0')).toBe('0');
    expect(formatRibuan('7')).toBe('7');
    expect(formatRibuan('999')).toBe('999');
  });

  it('membuang digit nol di depan', () => {
    expect(formatRibuan('007')).toBe('7');
    expect(formatRibuan('0001000')).toBe('1.000');
  });

  it('mengabaikan karakter selain angka', () => {
    expect(formatRibuan('Rp 1.000.000')).toBe('1.000.000');
    expect(formatRibuan('1a2b3c')).toBe('123');
    expect(formatRibuan('')).toBe('');
  });

  it('menjaga ketepatan angka besar tanpa melewati tipe number', () => {
    // 15 digit masih aman dijadikan Number, tetapi formatnya tetap dihitung
    // dari teks supaya tidak pernah bergantung pada presisi titik mengambang.
    expect(formatRibuan('123456789012345')).toBe('123.456.789.012.345');
  });
});

describe('penyaringan angka', () => {
  it('menyisakan digit saja', () => {
    expect(hanyaAngka('1.500.000')).toBe('1500000');
    expect(hanyaAngka('Rp2,5 juta')).toBe('25');
    expect(hanyaAngka('abc')).toBe('');
  });

  it('bacaNominal membaca angka dari teks berpemisah', () => {
    expect(bacaNominal('1.500.000')).toBe(1_500_000);
    expect(bacaNominal('')).toBeUndefined();
    expect(bacaNominal('   ')).toBeUndefined();
  });

  it('nilai yang diformat lalu dibaca ulang tetap sama', () => {
    for (const angka of [0, 7, 999, 1_000, 500_000_000, 4_800_000_000, 999_999_999_999_999]) {
      expect(bacaNominal(formatRibuan(String(angka)))).toBe(angka === 0 ? 0 : angka);
    }
  });
});

describe('letak karet setelah pemformatan', () => {
  it('menempatkan karet setelah digit ke-n, bukan di ujung teks', () => {
    // "50.000.000": digit ke-2 adalah "0" pertama, yang berada di indeks 1.
    expect(posisiSetelahDigit('50.000.000', 2)).toBe(2);
    // Digit ke-3 berada tepat setelah titik pertama.
    expect(posisiSetelahDigit('50.000.000', 3)).toBe(4);
  });

  it('karet di awal tetap di awal', () => {
    expect(posisiSetelahDigit('1.000', 0)).toBe(0);
  });

  it('jumlah digit melebihi isi teks menghasilkan posisi akhir', () => {
    expect(posisiSetelahDigit('1.000', 99)).toBe(5);
  });

  it('mengetik satu digit di depan tidak menggeser karet ke ujung', () => {
    // Pengguna mengetik "1" di depan "50.000.000" sehingga menjadi "150.000.000".
    // Karet harus berada setelah digit pertama, yaitu indeks 1, bukan 11.
    expect(posisiSetelahDigit(formatRibuan('150000000'), 1)).toBe(1);
  });
});

describe('tampilan mata uang', () => {
  it('memakai awalan tanpa spasi agar seragam dengan kalimat mesin aturan', () => {
    expect(formatCurrency(1_500_000)).toBe('Rp1.500.000');
    expect(formatCurrency(0)).toBe('Rp0');
  });
});
