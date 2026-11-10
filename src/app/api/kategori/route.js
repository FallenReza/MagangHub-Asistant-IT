import { db } from '@/lib/db';

export async function GET() {
  try {
    const list = db.prepare('SELECT * FROM kategori').all();
    return Response.json({ success: true, data: list });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil data kategori' }, { status: 500 });
  }
}