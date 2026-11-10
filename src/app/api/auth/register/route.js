import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { nama, email, password, konfirmasi } = await req.json();

    if (!nama || !email || !password || !konfirmasi) {
      return Response.json({ error: 'Semua kolom wajib diisi' }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }
    if (password !== konfirmasi) {
      return Response.json({ error: 'Konfirmasi password tidak sama' }, { status: 400 });
    }

    const cekEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (cekEmail) {
      return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hash = bcrypt.hashSync(password, 10);
    const insert = db.prepare('INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)');
    insert.run(nama, email, hash, 'user');

    return Response.json({ success: true, message: 'Registrasi berhasil' });
  } catch (error) {
    return Response.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}