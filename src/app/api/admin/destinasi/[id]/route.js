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

// Edit Destinasi
export async function PUT(req, { params }) {
  const auth = await getAdminUser();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const { kategori_id, nama, deskripsi, harga, kuota } = await req.json();

    const update = db.prepare(
      'UPDATE destinasi SET kategori_id = ?, nama = ?, deskripsi = ?, harga = ?, kuota = ? WHERE id = ?'
    );
    const result = update.run(kategori_id, nama, deskripsi, harga, kuota, id);

    if (result.changes === 0) return Response.json({ error: 'Destinasi tidak ditemukan' }, { status: 404 });

    return Response.json({ success: true, message: 'Destinasi berhasil diperbarui' });
  } catch (error) {
    return Response.json({ error: 'Gagal memperbarui destinasi' }, { status: 500 });
  }
}

// Hapus Destinasi (Aturan: tidak bisa jika sudah punya pesanan)
export async function DELETE(req, { params }) {
  const auth = await getAdminUser();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;

    // Cek apakah destinasi sudah memiliki pesanan
    const cekPesanan = db.prepare('SELECT COUNT(*) as count FROM pesanan WHERE destinasi_id = ?').get(id);
    if (cekPesanan.count > 0) {
      return Response.json({ error: 'Destinasi yang sudah memiliki pesanan tidak dapat dihapus' }, { status: 400 });
    }

    const del = db.prepare('DELETE FROM destinasi WHERE id = ?').run(id);
    if (del.changes === 0) return Response.json({ error: 'Destinasi tidak ditemukan' }, { status: 404 });

    return Response.json({ success: true, message: 'Destinasi berhasil dihapus' });
  } catch (error) {
    return Response.json({ error: 'Gagal menghapus destinasi' }, { status: 500 });
  }
}