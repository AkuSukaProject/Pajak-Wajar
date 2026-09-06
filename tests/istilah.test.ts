import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ISTILAH } from '../src/lib/istilah';

const berkasAntarmuka = [
  'src/components/eligibility/AlurKelayakan.tsx',
  'src/components/eligibility/KartuVonis.tsx'
].map((jalur) => readFileSync(jalur, 'utf8')).join('\n');

/**
 * Kamus istilah adalah bahan bacaan, bukan aturan. Tes ini menjaga mutunya
 * sebagai teks antarmuka: setiap entri terisi, ditulis ringkas, dan tidak
 * menyelundupkan sitasi pasal yang seharusnya datang dari mesin aturan.
 */

const entri = Object.entries(ISTILAH);

describe('kamus istilah', () => {
  it('memuat istilah yang paling sering ditanyakan pengguna', () => {
    for (const kunci of ['ptPerorangan', 'ptkp', 'peredaranBruto', 'norma', 'pphFinal', 'pekerjaanBebas']) {
      expect(Object.keys(ISTILAH)).toContain(kunci);
    }
  });

  it('setiap entri punya judul dan penjelasan yang terisi', () => {
    for (const [kunci, isi] of entri) {
      expect(isi.judul.trim().length, kunci).toBeGreaterThan(2);
      expect(isi.penjelasan.trim().length, kunci).toBeGreaterThan(30);
    }
  });

  it('penjelasannya tetap ringkas supaya muat di dalam popover', () => {
    for (const [kunci, isi] of entri) {
      expect(isi.penjelasan.length, kunci).toBeLessThan(420);
      if ('kenapaDitanya' in isi && isi.kenapaDitanya) {
        expect(isi.kenapaDitanya.length, kunci).toBeLessThan(320);
      }
    }
  });

  it('tidak menyitasi pasal, karena dasar hukum hanya boleh datang dari mesin aturan', () => {
    for (const [kunci, isi] of entri) {
      const teks = isi.penjelasan + ' ' + (('kenapaDitanya' in isi && isi.kenapaDitanya) || '');
      expect(teks, kunci).not.toMatch(/Pasal\s+\d/i);
      expect(teks, kunci).not.toMatch(/PP\s+No|Nomor\s+\d+\s+Tahun/i);
    }
  });

  it('setiap istilah benar-benar dipakai di antarmuka, tidak ada yang menganggur', () => {
    for (const kunci of Object.keys(ISTILAH)) {
      expect(berkasAntarmuka, `istilah "${kunci}" belum dipasang di mana pun`).toContain(`nama="${kunci}"`);
    }
  });

  it('tidak memakai judul yang sama dua kali', () => {
    const judul = entri.map(([, isi]) => isi.judul);
    expect(new Set(judul).size).toBe(judul.length);
  });
});
