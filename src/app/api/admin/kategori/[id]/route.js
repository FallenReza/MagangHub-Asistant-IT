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

export async function DELETE(req, { params }) {
  const auth = await getAdminUser();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;

    // Cek apakah kategori masih dipakai destinasi
    const cekDestinasi = db.prepare('SELECT COUNT(*) as count FROM destinasi WHERE kategori_id = ?').get(id);
    if (cekDestinasi.count > 0) {
      return Response.json({ error: 'Kategori yang masih digunakan oleh destinasi tidak dapat dihapus' }, { status: 400 });
    }

    const del = db.prepare('DELETE FROM kategori WHERE id = ?').run(id);
    if (del.changes === 0) return Response.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });

    return Response.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return Response.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}