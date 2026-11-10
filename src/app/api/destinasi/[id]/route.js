import { db } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    // Di Next.js terbaru wajib menggunakan await params
    const { id } = await params;
    
    const item = db.prepare(`
      SELECT d.*, k.nama_kategori 
      FROM destinasi d 
      JOIN kategori k ON d.kategori_id = k.id
      WHERE d.id = ?
    `).get(id);

    if (!item) {
      return Response.json({ error: 'Destinasi tidak ditemukan' }, { status: 404 });
    }

    return Response.json({ success: true, data: item });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil detail destinasi' }, { status: 500 });
  }
}