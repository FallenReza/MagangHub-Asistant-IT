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
    const totalUser = db.prepare("SELECT COUNT(*) as total FROM users WHERE role = 'user'").get().total;
    const totalDestinasi = db.prepare("SELECT COUNT(*) as total FROM destinasi").get().total;
    const totalPesanan = db.prepare("SELECT COUNT(*) as total FROM pesanan").get().total;
    const totalPendapatan = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM pesanan WHERE status = 'Lunas'").get().total;

    return Response.json({
      success: true,
      data: { totalUser, totalDestinasi, totalPesanan, totalPendapatan }
    });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil summary admin' }, { status: 500 });
  }
}