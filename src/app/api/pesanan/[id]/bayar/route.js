import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return Response.json({ error: 'Belum login' }, { status: 401 });

  const user = await verifyToken(token);
  if (!user) return Response.json({ error: 'Belum login' }, { status: 401 });

  const { id } = await params;

  try {
    const { metode } = await req.json();
    if (!metode) {
      return Response.json({ error: 'Metode pembayaran wajib dipilih' }, { status: 400 });
    }

    const pesanan = db.prepare('SELECT * FROM pesanan WHERE id = ? AND user_id = ?').get(id, user.id);

    if (!pesanan) {
      return Response.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (pesanan.status !== 'Menunggu Pembayaran') {
      return Response.json({ error: 'Pesanan ini tidak dapat dibayar' }, { status: 400 });
    }

    const now = new Date().toISOString();

    db.exec('BEGIN');

    // Update status pesanan jadi Lunas
    db.prepare("UPDATE pesanan SET status = 'Lunas' WHERE id = ?").run(id);

    // Update status pembayaran jadi Berhasil
    db.prepare(`
      UPDATE pembayaran 
      SET metode = ?, jumlah_bayar = ?, status = 'Berhasil', tanggal_bayar = ?
      WHERE pesanan_id = ?
    `).run(metode, pesanan.total, now, id);

    db.exec('COMMIT');

    return Response.json({ success: true, message: 'Pembayaran berhasil dikonfirmasi!' });
  } catch (error) {
    db.exec('ROLLBACK');
    return Response.json({ error: 'Gagal memproses pembayaran' }, { status: 500 });
  }
}