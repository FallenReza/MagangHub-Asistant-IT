'use client';
import { useState, useEffect } from 'react';

export default function AdminKategori() {
  const [list, setList] = useState([]);
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  const loadKategori = () => {
    fetch('/api/kategori')
      .then((res) => res.json())
      .then((data) => setList(data.data || []));
  };

  useEffect(() => {
    loadKategori();
  }, []);

  const handleTambah = async (e) => {
    e.preventDefault();
    setError(''); setSukses('');

    const res = await fetch('/api/admin/kategori', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_kategori: nama }),
    });

    const data = await res.json();
    if (res.ok) {
      setSukses(data.message);
      setNama('');
      loadKategori();
    } else {
      setError(data.error);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    setError(''); setSukses('');

    const res = await fetch(`/api/admin/kategori/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      setSukses(data.message);
      loadKategori();
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-black mb-6 text-stone-800">Kelola Kategori Wisata</h1>

      {error && <p className="bg-red-100 border-2 border-red-800 text-red-800 p-3 rounded mb-4 font-bold">{error}</p>}
      {sukses && <p className="bg-green-100 border-2 border-green-800 text-green-800 p-3 rounded mb-4 font-bold">{sukses}</p>}

      {/* Form Tambah Kategori */}
      <form onSubmit={handleTambah} className="bg-white p-5 border-2 border-stone-800 rounded-lg shadow-[6px_6px_0_0_rgba(28,25,23,1)] mb-8 flex gap-3">
        <input
          type="text"
          placeholder="Nama Kategori Baru"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="border-2 border-stone-800 p-2.5 rounded font-bold flex-1"
          required
        />
        <button type="submit" className="bg-teal-400 hover:bg-teal-300 border-2 border-stone-800 font-black px-6 py-2 rounded shadow-[2px_2px_0_0_rgba(28,25,23,1)]">
          TAMBAH
        </button>
      </form>

      {/* Tabel Kategori */}
      <div className="bg-white border-2 border-stone-800 rounded-lg shadow-[6px_6px_0_0_rgba(28,25,23,1)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-800 text-white font-black">
              <th className="p-3">ID</th>
              <th className="p-3">Nama Kategori</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id} className="border-b border-stone-300 font-bold">
                <td className="p-3">{item.id}</td>
                <td className="p-3">{item.nama_kategori}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleHapus(item.id)}
                    className="bg-red-500 hover:bg-red-400 text-white border border-stone-800 px-3 py-1 rounded text-xs font-black shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                  >
                    HAPUS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}