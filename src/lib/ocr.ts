/**
 * Kontrak hasil pembacaan bukti potong. OCR wajib memiliki persetujuan eksplisit
 * dan selalu menyediakan jalur input manual.
 */
export type HasilBupot = {
  nomorBuktiPotong: string;
  tanggal: string;
  penghasilanBruto: number;
  pphDipotong: number;
};

export async function bacaBupotDenganPersetujuan(_file: File, setuju: boolean): Promise<HasilBupot> {
  if (!setuju) throw new Error('Persetujuan pengiriman foto diperlukan. Gunakan input manual bila tidak setuju.');
  throw new Error('OCR belum dihubungkan. Gunakan input manual.');
}
