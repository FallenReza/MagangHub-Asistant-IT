import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return Response.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Buat token JWT
    const token = await signToken({ id: user.id, email: user.email, role: user.role, nama: user.nama });
    
    // Set cookie httpOnly (WAJIB pakai await cookies() di Next terbaru)
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/'
    });

    return Response.json({ success: true, role: user.role });
  } catch (error) {
    return Response.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}