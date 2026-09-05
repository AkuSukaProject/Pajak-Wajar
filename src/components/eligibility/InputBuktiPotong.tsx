'use client';

import { useRef, useState } from 'react';
import { InputRupiah } from '@/components/ui/InputRupiah';
import { formatCurrency } from '@/lib/format';
import { GalatBerkas, GalatPersetujuan, bacaBupotDenganPersetujuan } from '@/lib/ocr';
import type { KreditPajakItem } from '@/types/pajak';

/**
 * Isian bukti potong.
 *
 * Mode ketik manual adalah jalur utama dan selalu berfungsi tanpa layanan luar.
 * Pembacaan foto hanya berjalan setelah pengguna mencentang persetujuan, dan
 * hasilnya masuk ke kolom yang sama supaya wajib ditinjau sebelum disimpan.
 */

const kosong = {
  nomorBuktiPotong: '',
  pemotong: '',
  penghasilanBruto: undefined as number | undefined,
  pphDipotong: undefined as number | undefined
};

export function InputBuktiPotong({
  daftar,
  onChange
}: {
  daftar: KreditPajakItem[];
  onChange: (daftar: KreditPajakItem[]) => void;
}) {
  const [isian, setIsian] = useState(kosong);
  const [sumber, setSumber] = useState<'MANUAL' | 'OCR'>('MANUAL');
  const [setujuKirimFoto, setSetujuKirimFoto] = useState(false);
  const [sedangMembaca, setSedangMembaca] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const inputBerkas = useRef<HTMLInputElement>(null);

  const total = daftar.reduce((jumlah, item) => jumlah + item.pphDipotong, 0);

  const tambah = () => {
    const pphDipotong = isian.pphDipotong ?? 0;
    if (pphDipotong <= 0) {
      setPesan('Isi jumlah pajak yang sudah dipotong terlebih dahulu.');
      return;
    }
    onChange([
      ...daftar,
      {
        nomorBuktiPotong: isian.nomorBuktiPotong.trim(),
        pemotong: isian.pemotong.trim(),
        penghasilanBruto: isian.penghasilanBruto ?? 0,
        pphDipotong,
        sumber
      }
    ]);
    setIsian(kosong);
    setSumber('MANUAL');
    setPesan(null);
  };

  const hapus = (indeks: number) => {
    onChange(daftar.filter((_, posisi) => posisi !== indeks));
  };

  const bacaFoto = async (file: File) => {
    setSedangMembaca(true);
    setPesan(null);
    try {
      const hasil = await bacaBupotDenganPersetujuan(file, setujuKirimFoto);
      setIsian({
        nomorBuktiPotong: hasil.nomorBuktiPotong,
        pemotong: hasil.pemotong,
        penghasilanBruto: hasil.penghasilanBruto,
        pphDipotong: hasil.pphDipotong
      });
      setSumber('OCR');
      setPesan('Angka sudah diisi dari foto. Periksa dan perbaiki bila ada yang salah baca.');
    } catch (kesalahan) {
      if (kesalahan instanceof GalatPersetujuan || kesalahan instanceof GalatBerkas) {
        setPesan(kesalahan.message);
      } else if (kesalahan instanceof Error) {
        setPesan(kesalahan.message);
      } else {
        setPesan('Foto gagal dibaca. Ketik angkanya secara manual.');
      }
    } finally {
      setSedangMembaca(false);
      if (inputBerkas.current) inputBerkas.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Pajak yang sudah dipotong pihak lain</h3>
        <p className="mt-1 text-xs leading-5 text-margin">
          Kalau klien atau perusahaan sudah memotong pajak dari bayaran Anda, mereka memberi bukti
          potong. Angka itu mengurangi pajak yang masih harus Anda bayar. Lewati bagian ini bila
          tidak punya.
        </p>
      </div>

      {daftar.length > 0 && (
        <ul className="space-y-2">
          {daftar.map((item, indeks) => (
            <li
              key={`${item.nomorBuktiPotong}-${indeks}`}
              className="flex items-start justify-between gap-4 border border-line bg-white px-4 py-3 text-sm"
            >
              <span>
                <strong className="block font-semibold">
                  {item.pemotong || 'Pemotong tidak dicatat'}
                </strong>
                <span className="mt-0.5 block text-xs text-margin">
                  {item.nomorBuktiPotong || 'Nomor tidak dicatat'} · dipotong{' '}
                  {formatCurrency(item.pphDipotong)}
                  {item.sumber === 'OCR' ? ' · dari foto' : ''}
                </span>
              </span>
              <button
                type="button"
                onClick={() => hapus(indeks)}
                className="shrink-0 text-xs font-semibold text-stamp underline underline-offset-2"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold">Nama pemotong</span>
          <input
            type="text"
            value={isian.pemotong}
            onChange={(e) => setIsian({ ...isian, pemotong: e.target.value })}
            placeholder="Nama klien atau perusahaan"
            className="w-full border border-line bg-white px-3 py-2.5 outline-none focus:border-blue"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold">Nomor bukti potong</span>
          <input
            type="text"
            value={isian.nomorBuktiPotong}
            onChange={(e) => setIsian({ ...isian, nomorBuktiPotong: e.target.value })}
            placeholder="Tertulis di lembar bukti potong"
            className="w-full border border-line bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-blue"
            autoComplete="off"
          />
        </label>
        <InputRupiah
          label="Penghasilan bruto"
          nilai={isian.penghasilanBruto}
          onChange={(nilai) => setIsian({ ...isian, penghasilanBruto: nilai })}
          bolehKosong
        />
        <InputRupiah
          label="Pajak yang sudah dipotong"
          nilai={isian.pphDipotong}
          onChange={(nilai) => setIsian({ ...isian, pphDipotong: nilai })}
          bolehKosong
        />
      </div>

      <button
        type="button"
        onClick={tambah}
        className="pressable min-h-11 border border-line bg-white px-5 text-sm font-semibold hover:border-blue"
      >
        Tambahkan bukti potong
      </button>

      <details className="detail-panel border border-line bg-paper/70 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold">
          Punya fotonya? Biarkan sistem membaca angkanya <span aria-hidden="true">(opsional)</span>
        </summary>
        <div className="mt-4 space-y-3 text-xs leading-5 text-margin">
          <p>
            Foto akan dikirim ke layanan pembaca otomatis di luar perangkat Anda untuk diubah
            menjadi angka. Data lain pada halaman ini tidak ikut dikirim. Kami tidak menyimpan foto
            tersebut, tetapi kami tidak dapat menjamin kebijakan penyimpanan di sisi penyedia
            layanan. Mengetik manual selalu bisa dan tidak mengirim apa pun.
          </p>
          <label className="flex cursor-pointer items-start gap-3 border border-line bg-white p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-blue"
              checked={setujuKirimFoto}
              onChange={(e) => setSetujuKirimFoto(e.target.checked)}
            />
            <span className="text-ink">
              Saya setuju foto bukti potong ini dikirim ke layanan pembaca otomatis.
            </span>
          </label>
          <input
            ref={inputBerkas}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={!setujuKirimFoto || sedangMembaca}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void bacaFoto(file);
            }}
            className="block w-full text-xs file:mr-3 file:border file:border-line file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold disabled:opacity-50"
          />
          {sedangMembaca && <p className="font-semibold text-blue">Membaca foto…</p>}
        </div>
      </details>

      <p aria-live="polite" className="text-xs leading-5 text-margin">
        {pesan ?? `Total pajak yang sudah dipotong: ${formatCurrency(total)}`}
      </p>
    </div>
  );
}
