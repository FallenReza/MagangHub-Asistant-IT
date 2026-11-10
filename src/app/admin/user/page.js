'use client';
import { useState, useEffect } from 'react';

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.error);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="font-bold p-6">Memuat daftar pengguna...</p>;
  if (error) return <p className="text-red-500 font-bold p-6">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-black mb-6 text-stone-800">Daftar Pengguna Terdaftar</h1>

      <div className="bg-white border-2 border-stone-800 rounded-lg shadow-[6px_6px_0_0_rgba(28,25,23,1)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-800 text-white font-black">
              <th className="p-3">ID</th>
              <th className="p-3">Nama Lengkap</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id} className="border-b border-stone-300 font-bold">
                <td className="p-3">{item.id}</td>
                <td className="p-3">{item.nama}</td>
                <td className="p-3">{item.email}</td>
                <td className="p-3">
                  <span className={`text-xs font-black border px-2.5 py-0.5 rounded ${
                    item.role === 'admin' ? 'bg-pink-100 text-pink-800 border-pink-800' : 'bg-teal-100 text-teal-800 border-teal-800'
                  }`}>
                    {item.role.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}