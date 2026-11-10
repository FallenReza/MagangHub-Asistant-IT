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
    const pesanan = db.prepare('SELECT * FROM pesanan WHERE id = ? AND user_id = ?').get(id, user.id);

    if (!pesanan) {
      return Response.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (pesanan.status !== 'Menunggu Pembayaran') {
      return Response.json({ error: 'Pesanan yang sudah Lunas atau Dibatalkan tidak bisa dibatalkan' }, { status: 400 });
    }

    db.exec('BEGIN');

    // 1. Ubah status pesanan jadi Dibatalkan
    db.prepare("UPDATE pesanan SET status = 'Dibatalkan' WHERE id = ?").run(id);

    // 2. Ubah status pembayaran jadi Gagal
    db.prepare("UPDATE pembayaran SET status = 'Gagal' WHERE pesanan_id = ?").run(id);

    // 3. Kembalikan kuota ke destinasi
    db.prepare('UPDATE destinasi SET kuota = kuota + ? WHERE id = ?').run(pesanan.jumlah, pesanan.destinasi_id);

    db.exec('COMMIT');

    return Response.json({ success: true, message: 'Pesanan berhasil dibatalkan dan kuota dikembalikan' });
  } catch (error) {
    db.exec('ROLLBACK');
    return Response.json({ error: 'Gagal membatalkan pesanan' }, { status: 500 });
  }
}