import type { Metadata } from 'next';
import { Libre_Franklin, Newsreader } from 'next/font/google';
import './globals.css';

const body = Libre_Franklin({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const display = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'PajakWajar — Cek cara hitung pajak',
  description: 'Alat bantu untuk mengecek pajak sebelum mengisi laporan tahunan.',
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" data-scroll-behavior="smooth" className={`${body.variable} ${display.variable}`}><body>{children}</body></html>;
}
