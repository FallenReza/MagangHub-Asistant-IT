import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// Helper verifikasi admin
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
    const { nama_kategori } = await req.json();
    if (!nama_kategori) return Response.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });

    const insert = db.prepare('INSERT INTO kategori (nama_kategori) VALUES (?)');
    insert.run(nama_kategori);

    return Response.json({ success: true, message: 'Kategori berhasil ditambahkan' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return Response.json({ error: 'Nama kategori sudah ada' }, { status: 400 });
    }
    return Response.json({ error: 'Gagal menambah kategori' }, { status: 500 });
  }
}