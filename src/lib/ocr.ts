import { BuktiPotong } from '@/types/pajak';

export interface HasilOcrResponse {
  success: boolean;
  data?: Omit<BuktiPotong, 'id'>;
  error?: string;
}

/**
 * Mengirim berkas bukti potong ke route handler OCR dengan persetujuan eksplisit.
 * Memastikan prinsip privasi: foto tidak disimpan dan hanya diolah saat user setuju.
 */
export async function prosesOcrBuktiPotong(
  file: File,
  setuju: boolean
): Promise<Omit<BuktiPotong, 'id'>> {
  if (!setuju) {
    throw new Error(
      'Persetujuan pengiriman berkas diperlukan untuk menggunakan fitur OCR. Silakan gunakan form input manual.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('consent', 'true');

  const res = await fetch('/api/ocr', {
    method: 'POST',
    body: formData,
  });

  const json: HasilOcrResponse = await res.json();

  if (!res.ok || !json.success || !json.data) {
    throw new Error(
      json.error ||
        'Gagal membaca berkas bukti potong. Silakan gunakan form input manual.'
    );
  }

  return json.data;
}
