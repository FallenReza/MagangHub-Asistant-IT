'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';

function DetailDestinasiContent() {
  const params = useParams();
  const id = params?.id;

  const [destinasi, setDestinasi] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [tanggal, setTanggal] = useState('');
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!id) return;
    fetch(`/api/destinasi/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDestinasi(data.data);
        } else {
          setError(data.error);
        }
        setLoading(false);
      });
  }, [id]);

  const handlePesan = async (e) => {
    e.preventDefault();
    setError('');
    setPesan('');

    const res = await fetch('/api/pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinasi_id: destinasi.id,
        jumlah: parseInt(jumlah),
        tanggal_kunjungan: tanggal,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setPesan('Pesanan berhasil dibuat! Mengalihkan ke riwayat pesanan...');
      setTimeout(() => {
        router.push('/pesanan');
      }, 1500);
    } else {
      if (res.status === 401) {
        setError('Anda harus login terlebih dahulu untuk memesan tiket.');
      } else {
        setError(data.error || 'Gagal membuat pesanan');
      }
    }
  };

  if (loading) return <p className="font-bold p-6">Memuat detail destinasi...</p>;
  if (error && !destinasi) return <p className="text-red-500 font-bold p-6">{error}</p>;

  const totalHarga = destinasi ? destinasi.harga * (jumlah || 1) : 0;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-white border-2 border-stone-800 rounded-lg p-6 shadow-[8px_8px_0_0_rgba(28,25,23,1)]">
        <span className="inline-block bg-teal-100 text-teal-800 border border-teal-800 text-xs font-black px-3 py-1 rounded mb-3">
          {destinasi.nama_kategori}
        </span>
        <h1 className="text-4xl font-black text-stone-800 mb-3">{destinasi.nama}</h1>
        <p className="text-stone-700 text-base mb-6 leading-relaxed">{destinasi.deskripsi}</p>

        <div className="flex justify-between items-center bg-stone-100 p-4 rounded border-2 border-stone-800 mb-6">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase">Harga Per Tiket</p>
            <p className="text-2xl font-black text-orange-600">Rp {destinasi.harga.toLocaleString('id-ID')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-stone-500 uppercase">Kuota Tersedia</p>
            <p className="text-2xl font-black text-stone-800">{destinasi.kuota} Tiket</p>
          </div>
        </div>

        <hr className="border-stone-800 border-dashed my-6" />

        <h2 className="text-2xl font-black mb-4 text-stone-800">Form Pemesanan Tiket</h2>
        {error && <p className="text-red-500 font-bold mb-4 p-3 bg-red-50 border border-red-400 rounded">{error}</p>}
        {pesan && <p className="text-green-600 font-bold mb-4 p-3 bg-green-50 border border-green-400 rounded">{pesan}</p>}

        <form onSubmit={handlePesan} className="flex flex-col gap-4">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Tanggal Kunjungan</label>
            <input
              type="date"
              min={today}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className="w-full border-2 border-stone-800 p-2.5 rounded font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Jumlah Tiket</label>
            <input
              type="number"
              min="1"
              max={destinasi.kuota}
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              required
              className="w-full border-2 border-stone-800 p-2.5 rounded font-bold"
            />
          </div>

          <div className="bg-amber-50 p-4 rounded border-2 border-stone-800 mt-2 flex justify-between items-center">
            <span className="font-bold text-stone-700">Total Pembayaran:</span>
            <span className="text-2xl font-black text-stone-900">
              Rp {totalHarga.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            type="submit"
            disabled={destinasi.kuota < 1}
            className="w-full bg-teal-400 hover:bg-teal-300 disabled:bg-stone-300 text-stone-900 border-2 border-stone-800 font-black text-lg py-3 rounded shadow-[4px_4px_0_0_rgba(28,25,23,1)] transition-all"
          >
            {destinasi.kuota < 1 ? 'KUOTA HABIS' : 'PESAN TIKET SEKARANG'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DetailDestinasiPage() {
  return (
    <Suspense fallback={<p className="font-bold p-6">Memuat detail destinasi...</p>}>
      <DetailDestinasiContent />
    </Suspense>
  );
}