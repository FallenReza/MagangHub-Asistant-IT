import { db } from '@/lib/db';

export async function GET() {
  try {
    // Mengambil semua data dari tabel destinasi
    const destinasi = db.prepare(`
      SELECT d.*, k.nama_kategori 
      FROM destinasi d 
      JOIN kategori k ON d.kategori_id = k.id
    `).all();
    
    return Response.json({ success: true, data: destinasi });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}