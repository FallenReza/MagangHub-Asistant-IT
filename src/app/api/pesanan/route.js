import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// Helper mengambil data user yang sedang login
async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// GET: Ambil daftar pesanan milik user sendiri
export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: 'Belum login' }, { status: 401 });

  try {
    const list = db.prepare(`
      SELECT p.*, d.nama AS nama_destinasi, d.harga 
      FROM pesanan p
      JOIN destinasi d ON p.destinasi_id = d.id
      WHERE p.user_id = ?
      ORDER BY p.id DESC
    `).all(user.id);

    return Response.json({ success: true, data: list });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

// POST: Buat pesanan baru (dengan Transaksi SQL Manual)
export async function POST(req) {
  const user = await getUser();
  if (!user) return Response.json({ error: 'Belum login' }, { status: 401 });

  try {
    const { destinasi_id, jumlah, tanggal_kunjungan } = await req.json();

    if (!destinasi_id || !jumlah || !tanggal_kunjungan) {
      return Response.json({ error: 'Semua kolom wajib diisi' }, { status: 400 });
    }

    if (jumlah < 1) {
      return Response.json({ error: 'Jumlah tiket minimal 1' }, { status: 400 });
    }

    // Validasi agar tanggal tidak boleh sebelum hari ini
    const today = new Date().toISOString().split('T')[0];
    if (tanggal_kunjungan < today) {
      return Response.json({ error: 'Tanggal kunjungan tidak boleh sebelum hari ini' }, { status: 400 });
    }

    // MULAI TRANSAKSI MANUAL
    db.exec('BEGIN');

    const destinasi = db.prepare('SELECT * FROM destinasi WHERE id = ?').get(destinasi_id);
    if (!destinasi) {
      db.exec('ROLLBACK');
      return Response.json({ error: 'Destinasi tidak ditemukan' }, { status: 404 });
    }

    if (jumlah > destinasi.kuota) {
      db.exec('ROLLBACK');
      return Response.json({ error: `Kuota tidak mencukupi. Tersisa ${destinasi.kuota} tiket.` }, { status: 400 });
    }

    const total = jumlah * destinasi.harga;

    // 1. Kurangi kuota destinasi
    db.prepare('UPDATE destinasi SET kuota = kuota - ? WHERE id = ?').run(jumlah, destinasi_id);

    // 2. Buat entri pesanan
    const resPesanan = db.prepare(`
      INSERT INTO pesanan (user_id, destinasi_id, jumlah, total, tanggal_kunjungan, status)
      VALUES (?, ?, ?, ?, ?, 'Menunggu Pembayaran')
    `).run(user.id, destinasi_id, jumlah, total, tanggal_kunjungan);

    const pesananId = resPesanan.lastInsertRowid;

    // 3. Buat entri pembayaran awal
    db.prepare(`
      INSERT INTO pembayaran (pesanan_id, status)
      VALUES (?, 'Belum Bayar')
    `).run(pesananId);

    // SIMPAN TRANSAKSI
    db.exec('COMMIT');

    return Response.json({ success: true, message: 'Pesanan berhasil dibuat', pesanan_id: pesananId });
  } catch (error) {
    db.exec('ROLLBACK');
    return Response.json({ error: 'Gagal membuat pesanan' }, { status: 500 });
  }
}