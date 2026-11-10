import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Belum login', status: 401 };
  const user = await verifyToken(token);
  if (!user || user.role !== 'admin') return { error: 'Akses ditolak. Khusus Admin.', status: 403 };
  return { user };
}

export async function GET() {
  const auth = await getAdminUser();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const list = db.prepare('SELECT id, nama, email, role FROM users ORDER BY id DESC').all();
    return Response.json({ success: true, data: list });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil daftar pengguna' }, { status: 500 });
  }
}