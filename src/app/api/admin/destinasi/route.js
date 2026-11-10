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

export async function POST(req) {
  const auth = await getAdminUser();
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const { kategori_id, nama, deskripsi, harga, kuota } = await req.json();

    if (!kategori_id || !nama || harga == null || kuota == null) {
      return Response.json({ error: 'Semua kolom bertanda * wajib diisi' }, { status: 400 });
    }

    const insert = db.prepare(
      'INSERT INTO destinasi (kategori_id, nama, deskripsi, harga, kuota) VALUES (?, ?, ?, ?, ?)'
    );
    insert.run(kategori_id, nama, deskripsi || '', harga, kuota);

    return Response.json({ success: true, message: 'Destinasi berhasil ditambahkan' });
  } catch (error) {
    return Response.json({ error: 'Gagal menambah destinasi' }, { status: 500 });
  }
}