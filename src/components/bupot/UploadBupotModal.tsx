'use client';

import React, { useState, useRef } from 'react';
import { BuktiPotong } from '@/types/pajak';
import { prosesOcrBuktiPotong } from '@/lib/ocr';

interface UploadBupotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHasilOcr: (hasil: Omit<BuktiPotong, 'id'>) => void;
  onBeralihKeManual: () => void;
}

export function UploadBupotModal({
  isOpen,
  onClose,
  onHasilOcr,
  onBeralihKeManual,
}: UploadBupotModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/') && selected.type !== 'application/pdf') {
      setErrorMsg('Format berkas harus berupa gambar (JPG, PNG, WebP) atau PDF.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran berkas maksimal 5MB.');
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!file) {
      setErrorMsg('Pilih foto atau dokumen bukti potong terlebih dahulu.');
      return;
    }
    if (!consent) {
      setErrorMsg('Anda wajib menyetujui pemrosesan berkas sebelum melanjutkan.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const dataEkstraksi = await prosesOcrBuktiPotong(file, consent);
      onHasilOcr(dataEkstraksi);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal memproses berkas. Silakan coba lagi atau gunakan input manual.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ocr-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-line">
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                ⚡ Pembacaan Otomatis (OCR AI)
              </span>
            </div>
            <h3 id="modal-ocr-title" className="mt-2 text-xl font-bold text-ink">
              Scan Bukti Potong
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-margin hover:bg-slate-100 transition"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Notifikasi Transparansi & Privasi */}
        <div className="mt-4 rounded-xl border border-blue/20 bg-blue/5 p-4 text-xs leading-relaxed text-slate-700">
          <p className="font-bold text-blue flex items-center gap-1.5 mb-1">
            🔒 Prinsip Privasi & Penggunaan AI:
          </p>
          <p>
            Foto bukti potong dikirim ke layanan AI (Google Gemini) untuk membaca angka secara otomatis. <strong>Berkas tidak disimpan di server kami</strong> (Zero Retention). Hasil ekstraksi dapat Anda tinjau dan edit sebelum disimpan.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <p className="font-bold mb-1">⚠️ Terjadi Kendala:</p>
            <p>{errorMsg}</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBeralihKeManual();
              }}
              className="mt-2 inline-block font-bold text-blue underline hover:text-ink"
            >
              → Beralih ke Form Input Manual (Tanpa Upload)
            </button>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Area File Input / Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
              file
                ? 'border-blue bg-blue/[0.02]'
                : 'border-line bg-slate-50/60 hover:border-blue/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Preview Bukti Potong"
                  className="max-h-40 rounded-lg object-contain mx-auto border border-line"
                />
                <p className="text-xs font-semibold text-ink">{file?.name}</p>
                <span className="text-[11px] text-blue underline">Ganti foto berkas</span>
              </div>
            ) : file ? (
              <div>
                <p className="text-sm font-bold text-ink">📄 {file.name}</p>
                <p className="text-xs text-margin mt-1">
                  {(file.size / 1024).toFixed(0)} KB · Siap diproses
                </p>
                <span className="mt-2 inline-block text-xs text-blue underline">Ganti berkas</span>
              </div>
            ) : (
              <div>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue font-bold">
                  📷
                </div>
                <p className="text-sm font-semibold text-ink">
                  Klik untuk memilih foto / seret berkas ke sini
                </p>
                <p className="text-xs text-margin mt-1">
                  Mendukung foto formulir Bukti Potong PPh 21 / PPh 23 (JPG, PNG, PDF max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Persetujuan Eksplisit */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-blue"
            />
            <span className="text-xs leading-relaxed text-ink">
              Saya menyetujui pengiriman foto bukti potong ini ke model AI untuk diekstraksi secara instan dan memahami bahwa data tidak disimpan.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onBeralihKeManual();
            }}
            className="text-xs font-semibold text-margin hover:text-ink underline"
          >
            ✍️ Beralih ke Input Manual
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-margin hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleUploadAndProcess}
              disabled={!file || !consent || isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue/90 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Mengekstrak Data...</span>
                </>
              ) : (
                <span>Mulai Ekstraksi AI →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
