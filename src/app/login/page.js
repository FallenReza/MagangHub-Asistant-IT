'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    
    if (res.ok) {
      router.push(data.role === 'admin' ? '/admin' : '/destinasi');
      router.refresh(); // Update state navbar server-side
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border-2 border-stone-800 shadow-[8px_8px_0_0_rgba(28,25,23,1)] rounded-lg">
      <h2 className="text-3xl font-black mb-6 text-stone-800">Masuk</h2>
      {error && <p className="text-red-500 mb-4 font-bold">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" className="border-2 border-stone-800 p-2 rounded" required onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Password" className="border-2 border-stone-800 p-2 rounded" required onChange={e => setForm({...form, password: e.target.value})} />
        <button type="submit" className="bg-pink-500 text-stone-900 border-2 border-stone-800 font-black text-lg py-2 rounded hover:bg-pink-400 mt-2">LOGIN</button>
      </form>
    </div>
  );
}