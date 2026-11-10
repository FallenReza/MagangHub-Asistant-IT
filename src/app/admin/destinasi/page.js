'use client';
import { useState, useEffect } from 'react';

export default function AdminDestinasi() {
  const [destinasi, setDestinasi] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [form, setForm] = useState({ id: null, kategori_id: '', nama: '', deskripsi: '', harga: '', kuota: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  const loadData = () => {
    fetch('/api/destinasi').then(r => r.json()).then(d => setDestinasi(d.data || []));
    fetch('/api/kategori').then(r => r.json()).then(d => setKategori(d.data || []));
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ id: null, kategori_id: '', nama: '', deskripsi: '', harga: '', kuota: '' });
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      kategori_id: item.kategori_id,
      nama: item.nama,
      deskripsi: item.deskripsi,
      harga: item.harga,
      kuota: item.kuota
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSukses('');

    const url = isEditing ? `/api/admin/destinasi/${form.id}` : '/api/admin/destinasi';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        harga: parseInt(form.harga),
        kuota: parseInt(form.kuota),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setSukses(data.message);
      resetForm();
      loadData();
    } else {
      setError(data.error);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus destinasi ini?')) return;
    setError(''); setSukses('');

    const res = await fetch(`/api/admin/destinasi/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      setSukses(data.message);
      loadData();
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-3xl font-black mb-6 text-stone-800">Kelola Destinasi Wisata</h1>

      {error && <p className="bg-red-100 border-2 border-red-800 text-red-800 p-3 rounded mb-4 font-bold">{error}</p>}
      {sukses && <p className="bg-green-100 border-2 border-green-800 text-green-800 p-3 rounded mb-4 font-bold">{sukses}</p>}

      {/* Form Tambah / Edit */}
      <form onSubmit={handleSubmit} className="bg-white p-6 border-2 border-stone-800 rounded-lg shadow-[6px_6px_0_0_rgba(28,25,23,1)] mb-8 flex flex-col gap-4">
        <h2 className="text-xl font-black">{isEditing ? 'Ubah Destinasi' : 'Tambah Destinasi Baru'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nama Destinasi *"
            value={form.nama}
            onChange={e => setForm({...form, nama: e.target.value})}
            className="border-2 border-stone-800 p-2 rounded font-bold"
            required
          />
          <select
            value={form.kategori_id}
            onChange={e => setForm({...form, kategori_id: e.target.value})}
            className="border-2 border-stone-800 p-2 rounded font-bold"
            required
          >
            <option value="">-- Pilih Kategori * --</option>
            {kategori.map(k => (
              <option key={k.id} value={k.id}>{k.nama_kategori}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Harga Tiket (Rp) *"
            value={form.harga}
            onChange={e => setForm({...form, harga: e.target.value})}
            className="border-2 border-stone-800 p-2 rounded font-bold"
            required
          />
          <input
            type="number"
            placeholder="Kuota Tiket *"
            value={form.kuota}
            onChange={e => setForm({...form, kuota: e.target.value})}
            className="border-2 border-stone-800 p-2 rounded font-bold"
            required
          />
        </div>

        <textarea
          placeholder="Deskripsi Wisata"
          value={form.deskripsi}
          onChange={e => setForm({...form, deskripsi: e.target.value})}
          className="border-2 border-stone-800 p-2 rounded font-bold h-20"
        />

        <div className="flex gap-2">
          <button type="submit" className="bg-teal-400 hover:bg-teal-300 border-2 border-stone-800 font-black px-6 py-2 rounded shadow-[2px_2px_0_0_rgba(28,25,23,1)]">
            {isEditing ? 'SIMPAN PERUBAHAN' : 'TAMBAH DESTINASI'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="bg-stone-300 hover:bg-stone-400 border-2 border-stone-800 font-bold px-4 py-2 rounded">
              BATAL
            </button>
          )}
        </div>
      </form>

      {/* Tabel Destinasi */}
      <div className="bg-white border-2 border-stone-800 rounded-lg shadow-[6px_6px_0_0_rgba(28,25,23,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-stone-800 text-white font-black">
              <th className="p-3">Nama</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Kuota</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {destinasi.map((item) => (
              <tr key={item.id} className="border-b border-stone-300 font-bold">
                <td className="p-3">{item.nama}</td>
                <td className="p-3">{item.nama_kategori}</td>
                <td className="p-3">Rp {item.harga.toLocaleString('id-ID')}</td>
                <td className="p-3">{item.kuota}</td>
                <td className="p-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-amber-400 hover:bg-amber-300 text-stone-900 border border-stone-800 px-3 py-1 rounded text-xs font-black shadow-[2px_2px_0_0_rgba(28,25,23,1)]"
                  >
                    EDIT
                  </button>
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