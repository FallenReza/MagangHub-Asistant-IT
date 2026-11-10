'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState({ totalUser: 0, totalDestinasi: 0, totalPesanan: 0, totalPendapatan: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummary(data.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="font-bold p-6">Memuat dashboard admin...</p>;

  return (
    <div className="max-w-5xl mx-auto py-6">
      <h1 className="text-3xl font-black mb-6 text-stone-800">Dashboard Admin</h1>

      {/* Grid Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-stone-800 p-5 rounded-lg shadow-[4px_4px_0_0_rgba(28,25,23,1)]">
          <p className="text-xs font-bold text-stone-500 uppercase mb-1">Total Pengguna</p>
          <p className="text-3xl font-black text-stone-800">{summary.totalUser}</p>
        </div>
        <div className="bg-white border-2 border-stone-800 p-5 rounded-lg shadow-[4px_4px_0_0_rgba(28,25,23,1)]">
          <p className="text-xs font-bold text-stone-500 uppercase mb-1">Total Destinasi</p>
          <p className="text-3xl font-black text-teal-600">{summary.totalDestinasi}</p>
        </div>
        <div className="bg-white border-2 border-stone-800 p-5 rounded-lg shadow-[4px_4px_0_0_rgba(28,25,23,1)]">
          <p className="text-xs font-bold text-stone-500 uppercase mb-1">Total Pesanan</p>
          <p className="text-3xl font-black text-amber-600">{summary.totalPesanan}</p>
        </div>
        <div className="bg-white border-2 border-stone-800 p-5 rounded-lg shadow-[4px_4px_0_0_rgba(28,25,23,1)]">
          <p className="text-xs font-bold text-stone-500 uppercase mb-1">Pendapatan Lunas</p>
          <p className="text-2xl font-black text-green-600">Rp {summary.totalPendapatan.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Grid Navigasi Admin */}
      <h2 className="text-2xl font-black mb-4 text-stone-800">Menu Pengelolaan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/kategori"
          className="bg-teal-400 hover:bg-teal-300 border-2 border-stone-800 p-5 rounded-lg font-black text-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all flex flex-col justify-between"
        >
          <span className="text-xl">📁 Kategori</span>
          <span className="text-xs font-bold mt-4 text-stone-800">Kelola Kategori Wisata</span>
        </Link>

        <Link
          href="/admin/destinasi"
          className="bg-pink-400 hover:bg-pink-300 border-2 border-stone-800 p-5 rounded-lg font-black text-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all flex flex-col justify-between"
        >
          <span className="text-xl">🏝️ Destinasi</span>
          <span className="text-xs font-bold mt-4 text-stone-800">Kelola Data Destinasi</span>
        </Link>

        <Link
          href="/admin/pesanan"
          className="bg-amber-400 hover:bg-amber-300 border-2 border-stone-800 p-5 rounded-lg font-black text-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all flex flex-col justify-between"
        >
          <span className="text-xl">🎟️ Semua Pesanan</span>
          <span className="text-xs font-bold mt-4 text-stone-800">Ubah Status & Pembatalan</span>
        </Link>

        <Link
          href="/admin/user"
          className="bg-orange-400 hover:bg-orange-300 border-2 border-stone-800 p-5 rounded-lg font-black text-stone-900 shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all flex flex-col justify-between"
        >
          <span className="text-xl">👥 Daftar User</span>
          <span className="text-xs font-bold mt-4 text-stone-800">Lihat Akun Terdaftar</span>
        </Link>
      </div>
    </div>
  );
}