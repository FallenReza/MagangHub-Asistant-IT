'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';

function DetailPesananContent() {
  const params = useParams();
  const id = params?.id;

  const [detail, setDetail] = useState(null);
  const [metode, setMetode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  const loadDetail = () => {
    if (!id) return;
    fetch(`/api/pesanan/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDetail(data.data);
        } else {
          setError(data.error);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleBayar = async (e) => {
    e.preventDefault();
    setError(''); setSukses('');

    const res = await fetch(`/api/pesanan/${id}/bayar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metode }),
    });

    const data = await res.json();
    if (res.ok) {
      setSukses(data.message);
      loadDetail();
    } else {
      setError(data.error);
    }
  };

  const handleBatal = async () => {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    setError(''); setSukses('');

    const res = await fetch(`/api/pesanan/${id}/batal`, { method: 'POST' });
    const data = await res.json();

    if (res.ok) {
      setSukses(data.message);
      loadDetail();
    } else {
      setError(data.error);
    }
  };

  if (loading) return <p className="font-bold p-6">Memuat detail pesanan...</p>;
  if (error && !detail) return <p className="text-red-500 font-bold p-6">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white border-2 border-stone-800 rounded-lg p-6 shadow-[8px_8px_0_0_rgba(28,25,23,1)]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-stone-800">Detail Pesanan #{detail.id}</h1>
          <span className={`text-xs font-black border px-3 py-1 rounded ${
            detail.status === 'Lunas' ? 'bg-green-100 text-green-800 border-green-800' :
            detail.status === 'Dibatalkan' ? 'bg-red-100 text-red-800 border-red-800' :
            'bg-amber-100 text-amber-800 border-amber-800'
          }`}>
            {detail.status}
          </span>
        </div>

        {error && <p className="bg-red-100 border-2 border-red-800 text-red-800 p-3 rounded mb-4 font-bold">{error}</p>}
        {sukses && <p className="bg-green-100 border-2 border-green-800 text-green-800 p-3 rounded mb-4 font-bold">{sukses}</p>}

        <div className="bg-stone-50 border-2 border-stone-800 p-4 rounded mb-6 flex flex-col gap-2 font-bold text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Destinasi:</span>
            <span className="text-stone-900">{detail.nama_destinasi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Jumlah Tiket:</span>
            <span className="text-stone-900">{detail.jumlah} Tiket</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Tanggal Kunjungan:</span>
            <span className="text-stone-900">{detail.tanggal_kunjungan}</span>
          </div>
          <div className="flex justify-between text-base border-t border-stone-300 pt-2 mt-1">
            <span className="text-stone-800">Total Harga:</span>
            <span className="text-orange-600 font-black">Rp {detail.total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {detail.status !== 'Menunggu Pembayaran' && (
          <div className="border-2 border-stone-800 p-4 rounded bg-stone-100 mb-6 font-bold text-sm">
            <h3 className="font-black text-stone-800 mb-2">Informasi Pembayaran</h3>
            <p>Status Pembayaran: <span className="uppercase">{detail.status_pembayaran}</span></p>
            {detail.metode && <p>Metode Pembayaran: {detail.metode}</p>}
            {detail.tanggal_bayar && <p>Waktu Pembayaran: {new Date(detail.tanggal_bayar).toLocaleString('id-ID')}</p>}
          </div>
        )}

        {detail.status === 'Menunggu Pembayaran' && (
          <div className="border-2 border-stone-800 p-5 rounded-lg bg-amber-50">
            <h2 className="text-xl font-black mb-3 text-stone-800">Simulasi Pembayaran</h2>
            <form onSubmit={handleBayar} className="flex flex-col gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Pilih Metode Pembayaran</label>
                <select
                  value={metode}
                  onChange={(e) => setMetode(e.target.value)}
                  required
                  className="w-full border-2 border-stone-800 p-2.5 rounded font-bold bg-white"
                >
                  <option value="">-- Pilih Metode --</option>
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="E-Wallet QRIS">E-Wallet QRIS</option>
                  <option value="Kartu Kredit">Kartu Kredit</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-400 text-stone-900 border-2 border-stone-800 font-black text-lg py-3 rounded shadow-[3px_3px_0_0_rgba(28,25,23,1)]"
              >
                BAYAR SEKARANG (SIMULASI)
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-amber-200">
              <button
                onClick={handleBatal}
                className="w-full bg-red-500 hover:bg-red-400 text-white border-2 border-stone-800 font-black py-2.5 rounded shadow-[3px_3px_0_0_rgba(28,25,23,1)]"
              >
                BATALKAN PESANAN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailPesananPage() {
  return (
    <Suspense fallback={<p className="font-bold p-6">Memuat detail pesanan...</p>}>
      <DetailPesananContent />
    </Suspense>
  );
}