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
    const list = db.prepare(`
      SELECT p.*, u.nama AS nama_user, u.email AS email_user, d.nama AS nama_destinasi, pm.metode, pm.status AS status_pembayaran
      FROM pesanan p
      JOIN users u ON p.user_id = u.id
      JOIN destinasi d ON p.destinasi_id = d.id
      LEFT JOIN pembayaran pm ON p.id = pm.pesanan_id
      ORDER BY p.id DESC
    `).all();

    return Response.json({ success: true, data: list });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil daftar semua pesanan' }, { status: 500 });
  }
}