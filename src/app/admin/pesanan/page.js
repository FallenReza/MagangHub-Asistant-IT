'use client';
import { useState, useEffect } from 'react';

export default function AdminPesananPage() {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  const loadPesanan = () => {
    fetch('/api/admin/pesanan')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPesanan(data.data);
        } else {
          setError(data.error);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPesanan();
  }, []);

  const handleUbahStatus = async (id, statusBaru) => {
    setError(''); setSukses('');

    const res = await fetch(`/api/admin/pesanan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusBaru }),
    });

    const data = await res.json();
    if (res.ok) {
      setSukses(data.message);
      loadPesanan();
    } else {
      setError(data.error);
    }
  };

  if (loading) return <p className="font-bold p-6">Memuat daftar semua pesanan...</p>;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-black mb-6 text-stone-800">Kelola Semua Pesanan Tiket</h1>

      {error && <p className="bg-red-100 border-2 border-red-800 text-red-800 p-3 rounded mb-4 font-bold">{error}</p>}
      {sukses && <p className="bg-green-100 border-2 border-green-800 text-green-800 p-3 rounded mb-4 font-bold">{sukses}</p>}

      <div className="bg-white border-2 border-stone-800 rounded-lg shadow-[6px_6px_0_0_rgba(28,25,23,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-stone-800 text-white font-black">
              <th className="p-3">ID</th>
              <th className="p-3">Pemesan</th>
              <th className="p-3">Destinasi</th>
              <th className="p-3">Jumlah & Total</th>
              <th className="p-3">Status Pesanan</th>
              <th className="p-3 text-right">Ubah Status</th>
            </tr>
          </thead>
          <tbody>
            {pesanan.map((item) => (
              <tr key={item.id} className="border-b border-stone-300 font-bold">
                <td className="p-3">#{item.id}</td>
                <td className="p-3">
                  <p className="font-black text-stone-900">{item.nama_user}</p>
                  <p className="text-xs text-stone-500">{item.email_user}</p>
                </td>
                <td className="p-3">{item.nama_destinasi}</td>
                <td className="p-3">
                  <p>{item.jumlah} Tiket</p>
                  <p className="text-xs text-orange-600 font-black">Rp {item.total.toLocaleString('id-ID')}</p>
                </td>
                <td className="p-3">
                  <span className={`text-xs font-black border px-2.5 py-1 rounded ${
                    item.status === 'Lunas' ? 'bg-green-100 text-green-800 border-green-800' :
                    item.status === 'Dibatalkan' ? 'bg-red-100 text-red-800 border-red-800' :
                    'bg-amber-100 text-amber-800 border-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {item.status === 'Dibatalkan' ? (
                    <span className="text-xs text-stone-400 italic">Final (Terkunci)</span>
                  ) : (
                    <div className="flex justify-end gap-1">
                      {item.status !== 'Lunas' && (
                        <button
                          onClick={() => handleUbahStatus(item.id, 'Lunas')}
                          className="bg-green-500 hover:bg-green-400 text-stone-900 border border-stone-800 px-2.5 py-1 rounded text-xs font-black shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                        >
                          SET LUNAS
                        </button>
                      )}
                      <button
                        onClick={() => handleUbahStatus(item.id, 'Dibatalkan')}
                        className="bg-red-500 hover:bg-red-400 text-white border border-stone-800 px-2.5 py-1 rounded text-xs font-black shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                      >
                        BATALKAN
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}