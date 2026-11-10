import { db } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const kategoriId = searchParams.get('kategori_id');

    let query = `
      SELECT d.*, k.nama_kategori 
      FROM destinasi d 
      JOIN kategori k ON d.kategori_id = k.id
    `;
    let params = [];

    if (kategoriId) {
      query += ' WHERE d.kategori_id = ?';
      params.push(kategoriId);
    }

    const list = db.prepare(query).all(...params);
    return Response.json({ success: true, data: list });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil data destinasi' }, { status: 500 });
  }
}