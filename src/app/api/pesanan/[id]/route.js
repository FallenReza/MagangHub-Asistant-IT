import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return Response.json({ error: 'Belum login' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user) return Response.json({ error: 'Belum login' }, { status: 401 });

  const { id } = await params;

  try {
    const detail = db.prepare(`
      SELECT p.*, d.nama AS nama_destinasi, d.harga, d.deskripsi,
             pm.metode, pm.status AS status_pembayaran, pm.tanggal_bayar, pm.jumlah_bayar
      FROM pesanan p
      JOIN destinasi d ON p.destinasi_id = d.id
      LEFT JOIN pembayaran pm ON p.id = pm.pesanan_id
      WHERE p.id = ? AND p.user_id = ?
    `).get(id, user.id);

    if (!detail) {
      return Response.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return Response.json({ success: true, data: detail });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil detail pesanan' }, { status: 500 });
  }
}