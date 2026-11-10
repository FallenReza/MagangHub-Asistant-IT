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

export async function PUT(req, { params }) {
  const auth = await getAdminUser();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!['Lunas', 'Dibatalkan'].includes(status)) {
      return Response.json({ error: 'Status tidak valid. Pilih Lunas atau Dibatalkan.' }, { status: 400 });
    }

    const pesanan = db.prepare('SELECT * FROM pesanan WHERE id = ?').get(id);
    if (!pesanan) {
      return Response.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // Aturan bisnis: Pesanan yang sudah Dibatalkan tidak bisa diubah lagi
    if (pesanan.status === 'Dibatalkan') {
      return Response.json({ error: 'Pesanan yang sudah Dibatalkan tidak dapat diubah lagi' }, { status: 400 });
    }

    db.exec('BEGIN');

    if (status === 'Lunas') {
      const now = new Date().toISOString();
      db.prepare("UPDATE pesanan SET status = 'Lunas' WHERE id = ?").run(id);
      db.prepare("UPDATE pembayaran SET status = 'Berhasil', tanggal_bayar = COALESCE(tanggal_bayar, ?) WHERE pesanan_id = ?").run(now, id);
    } else if (status === 'Dibatalkan') {
      // Pembatalan admin: ubah pembayaran jadi Gagal dan kembalikan kuota ke destinasi
      db.prepare("UPDATE pesanan SET status = 'Dibatalkan' WHERE id = ?").run(id);
      db.prepare("UPDATE pembayaran SET status = 'Gagal' WHERE pesanan_id = ?").run(id);
      db.prepare('UPDATE destinasi SET kuota = kuota + ? WHERE id = ?').run(pesanan.jumlah, pesanan.destinasi_id);
    }

    db.exec('COMMIT');

    return Response.json({ success: true, message: `Status pesanan berhasil diubah menjadi ${status}` });
  } catch (error) {
    db.exec('ROLLBACK');
    return Response.json({ error: 'Gagal mengubah status pesanan' }, { status: 500 });
  }
}