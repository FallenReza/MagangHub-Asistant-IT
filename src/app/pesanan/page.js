'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PesananSayaPage() {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/pesanan')
      .then((res) => {
        if (res.status === 401) {
          setError('Silakan login terlebih dahulu untuk melihat pesanan.');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setPesanan(data.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="font-bold p-6">Memuat riwayat pesanan...</p>;
  if (error) return <p className="text-red-500 font-bold p-6">{error}</p>;

  const getStatusBadge = (status) => {
    if (status === 'Lunas') return 'bg-green-100 text-green-800 border-green-800';
    if (status === 'Dibatalkan') return 'bg-red-100 text-red-800 border-red-800';
    return 'bg-amber-100 text-amber-800 border-amber-800';
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-black mb-6 text-stone-800">Riwayat Pesanan Saya</h1>

      {pesanan.length === 0 ? (
        <div className="bg-white border-2 border-stone-800 p-8 rounded-lg text-center shadow-[6px_6px_0_0_rgba(28,25,23,1)]">
          <p className="font-bold text-stone-600 mb-4">Anda belum memiliki pesanan tiket.</p>
          <Link href="/destinasi" className="inline-block bg-teal-400 border-2 border-stone-800 font-black px-6 py-2 rounded shadow-[2px_2px_0_0_rgba(28,25,23,1)]">
            Cari Wisata Sekarang
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pesanan.map((item) => (
            <div key={item.id} className="bg-white border-2 border-stone-800 p-5 rounded-lg shadow-[6px_6px_0_0_rgba(28,25,23,1)] flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-black border px-2.5 py-0.5 rounded ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-bold text-stone-500">ID Pesanan: #{item.id}</span>
                </div>
                <h2 className="text-xl font-black text-stone-800">{item.nama_destinasi}</h2>
                <p className="text-sm font-bold text-stone-600 mt-1">
                  {item.jumlah} Tiket | Tgl Kunjungan: {item.tanggal_kunjungan}
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 border-stone-200 pt-3 md:pt-0">
                <span className="text-xl font-black text-orange-600">
                  Total: Rp {item.total.toLocaleString('id-ID')}
                </span>
                <Link
                  href={`/pesanan/${item.id}`}
                  className="inline-block text-center bg-amber-400 hover:bg-amber-300 text-stone-900 border-2 border-stone-800 font-black px-4 py-2 rounded text-sm shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                >
                  {item.status === 'Menunggu Pembayaran' ? 'Bayar / Detail' : 'Lihat Detail'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}