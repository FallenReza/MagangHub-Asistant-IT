import './globals.css';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';

export const metadata = {
  title: 'Kula - Pemesanan Tiket Wisata',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-cream-50 min-h-screen text-stone-900 antialiased">
        <Suspense fallback={<nav className="bg-orange-600 p-4 text-white font-bold">KULA WISATA</nav>}>
          <Navbar />
        </Suspense>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}