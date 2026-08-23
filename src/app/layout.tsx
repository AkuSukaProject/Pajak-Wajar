import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PajakWajar — Cek kelayakan skema pajak',
  description: 'Alat bantu pra-lapor pajak untuk pekerja mandiri Indonesia.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
