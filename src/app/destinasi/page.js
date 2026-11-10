'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DaftarDestinasi() {
  const [destinasi, setDestinasi] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState('');
  const [loading, setLoading] = useState(true);

  // Ambil daftar kategori saat pertama kali dimuat
  useEffect(() => {
    fetch('/api/kategori')
      .then((res) => res.json())
      .then((data) => setKategori(data.data || []));
  }, []);

  // Ambil data destinasi berdasarkan kategori yang dipilih
  useEffect(() => {
    setLoading(true);
    const url = selectedKategori 
      ? `/api/destinasi?kategori_id=${selectedKategori}` 
      : '/api/destinasi';
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDestinasi(data.data || []);
        setLoading(false);
      });
  }, [selectedKategori]);

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-black mb-6 text-stone-800">Katalog Destinasi Wisata</h1>

      {/* Filter Kategori */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedKategori('')}
          className={`px-4 py-2 rounded font-bold border-2 border-stone-800 ${
            selectedKategori === '' ? 'bg-orange-500 text-white shadow-[4px_4px_0_0_rgba(28,25,23,1)]' : 'bg-white hover:bg-stone-100'
          }`}
        >
          Semua
        </button>
        {kategori.map((k) => (
          <button
            key={k.id}
            onClick={() => setSelectedKategori(k.id.toString())}
            className={`px-4 py-2 rounded font-bold border-2 border-stone-800 ${
              selectedKategori === k.id.toString()
                ? 'bg-orange-500 text-white shadow-[4px_4px_0_0_rgba(28,25,23,1)]'
                : 'bg-white hover:bg-stone-100'
            }`}
          >
            {k.nama_kategori}
          </button>
        ))}
      </div>

      {/* Card Destinasi */}
      {loading ? (
        <p className="font-bold">Memuat destinasi...</p>
      ) : destinasi.length === 0 ? (
        <p className="font-bold text-stone-500">Tidak ada destinasi pada kategori ini.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinasi.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-stone-800 rounded-lg p-5 flex flex-col justify-between shadow-[6px_6px_0_0_rgba(28,25,23,1)]"
            >
              <div>
                <span className="inline-block bg-teal-100 text-teal-800 border border-teal-800 text-xs font-black px-2.5 py-1 rounded mb-3">
                  {item.nama_kategori}
                </span>
                <h2 className="text-2xl font-black text-stone-800 mb-2">{item.nama}</h2>
                <p className="text-stone-600 text-sm mb-4 line-clamp-2">{item.deskripsi}</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-lg text-orange-600">
                    Rp {item.harga.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-bold bg-stone-100 px-2 py-1 rounded border border-stone-400">
                    Kuota: {item.kuota}
                  </span>
                </div>
                <Link
                  href={`/destinasi/${item.id}`}
                  className="block text-center bg-pink-500 hover:bg-pink-400 text-stone-900 border-2 border-stone-800 font-black py-2 rounded shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                >
                  Lihat Detail & Pesan
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}