import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const isContoh = process.argv.includes('--contoh');
let db;

if (isContoh) {
  console.log('\n==================================================');
  console.log('  MENJALANKAN ANALISIS DATASET CONTOH (DATA DUMMY)');
  console.log('==================================================\n');
  db = new DatabaseSync(':memory:');
  
  // Skema Tabel
  db.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, email TEXT, password TEXT, role TEXT);
    CREATE TABLE kategori (id INTEGER PRIMARY KEY AUTOINCREMENT, nama_kategori TEXT);
    CREATE TABLE destinasi (id INTEGER PRIMARY KEY AUTOINCREMENT, kategori_id INTEGER, nama TEXT, deskripsi TEXT, harga INTEGER, kuota INTEGER);
    CREATE TABLE pesanan (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, destinasi_id INTEGER, jumlah INTEGER, total INTEGER, tanggal_kunjungan TEXT, status TEXT);
    CREATE TABLE pembayaran (id INTEGER PRIMARY KEY AUTOINCREMENT, pesanan_id INTEGER, metode TEXT, jumlah_bayar INTEGER, status TEXT, tanggal_bayar TEXT);
  `);

  // Data Awal Kategori & Destinasi
  db.exec(`
    INSERT INTO kategori (id, nama_kategori) VALUES (1, 'Wisata Alam'), (2, 'Wisata Budaya'), (3, 'Wisata Edukasi');
    INSERT INTO destinasi (id, kategori_id, nama, harga, kuota) VALUES 
      (1, 1, 'Gunung Bromo', 35000, 89),
      (2, 1, 'Coban Rondo', 25000, 58),
      (3, 2, 'Kampung Warna-Warni Jodipan', 10000, 134),
      (4, 2, 'Candi Singosari', 15000, 60),
      (5, 3, 'Museum Angkut', 100000, 94),
      (6, 3, 'Batu Secret Zoo', 120000, 82);

    INSERT INTO users (id, nama, email, role) VALUES 
      (1, 'Eko Wijaya', 'eko@test.com', 'user'),
      (2, 'Hana Putri', 'hana@test.com', 'user'),
      (3, 'Budi Santoso', 'budi@test.com', 'user'),
      (4, 'Dewi Anggraini', 'dewi@test.com', 'user'),
      (5, 'Gilang Ramadhan', 'gilang@test.com', 'user'),
      (6, 'Citra Lestari', 'citra@test.com', 'user'),
      (7, 'Fajar Pratama', 'fajar@test.com', 'user'),
      (8, 'Anisa Rahma', 'anisa@test.com', 'user');
  `);

  // Isi Data Transaksi Dummy (Presisi 40 Pesanan Sesuai Dokumen Laporan)
  const insertPesanan = db.prepare(`INSERT INTO pesanan (id, user_id, destinasi_id, jumlah, total, tanggal_kunjungan, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertBayar = db.prepare(`INSERT INTO pembayaran (pesanan_id, metode, jumlah_bayar, status, tanggal_bayar) VALUES (?, ?, ?, ?, ?)`);

  let pid = 1;
  const addOrder = (uid, did, qty, price, date, status, method = null) => {
    const total = qty * price;
    insertPesanan.run(pid, uid, did, qty, total, date, status);
    if (status === 'Lunas') {
      insertBayar.run(pid, method, total, 'Berhasil', `${date} 10:00:00`);
    } else if (status === 'Dibatalkan') {
      insertBayar.run(pid, null, 0, 'Gagal', null);
    } else {
      insertBayar.run(pid, null, 0, 'Belum Bayar', null);
    }
    pid++;
  };

  // Q1 & Q9 Transaction Baseline
  addOrder(4, 2, 4, 25000, '2026-11-10', 'Lunas', 'E-Wallet');
  addOrder(5, 2, 1, 25000, '2026-11-12', 'Lunas', 'Transfer Bank');
  addOrder(3, 2, 3, 25000, '2026-11-15', 'Dibatalkan');
  addOrder(3, 2, 4, 25000, '2026-11-18', 'Dibatalkan');
  addOrder(6, 2, 3, 25000, '2026-11-20', 'Lunas', 'Transfer Bank');

  // Coban Rondo
  addOrder(4, 2, 2, 25000, '2026-12-01', 'Lunas', 'Transfer Bank');
  addOrder(5, 2, 2, 25000, '2026-12-05', 'Lunas', 'E-Wallet');
  addOrder(6, 2, 2, 25000, '2026-12-10', 'Lunas', 'QRIS');
  addOrder(7, 2, 2, 25000, '2026-12-15', 'Lunas', 'Transfer Bank');

  // Museum Angkut
  addOrder(1, 5, 5, 100000, '2026-12-01', 'Lunas', 'Transfer Bank');
  addOrder(1, 5, 5, 100000, '2026-12-10', 'Lunas', 'Transfer Bank');
  addOrder(2, 5, 4, 100000, '2026-12-15', 'Lunas', 'E-Wallet');
  addOrder(2, 5, 3, 100000, '2026-12-20', 'Lunas', 'E-Wallet');
  addOrder(2, 5, 3, 100000, '2026-12-25', 'Lunas', 'Transfer Bank');
  addOrder(4, 5, 3, 100000, '2027-01-05', 'Lunas', 'QRIS');
  addOrder(8, 5, 3, 100000, '2027-01-10', 'Lunas', 'Transfer Bank');

  // Gunung Bromo
  addOrder(3, 1, 3, 35000, '2026-11-05', 'Lunas', 'Transfer Bank');
  addOrder(3, 1, 2, 35000, '2026-11-25', 'Lunas', 'E-Wallet');
  addOrder(7, 1, 2, 35000, '2026-12-02', 'Lunas', 'QRIS');
  addOrder(8, 1, 2, 35000, '2027-01-12', 'Lunas', 'Transfer Bank');
  addOrder(2, 1, 2, 35000, '2027-01-20', 'Lunas', 'E-Wallet');

  // Kampung Warna-Warni
  addOrder(2, 3, 5, 10000, '2026-11-15', 'Lunas', 'QRIS');
  addOrder(2, 3, 3, 10000, '2026-12-18', 'Lunas', 'E-Wallet');
  addOrder(2, 3, 3, 10000, '2027-01-15', 'Lunas', 'E-Wallet');

  // Batu Secret Zoo
  addOrder(3, 6, 2, 120000, '2026-11-20', 'Lunas', 'Transfer Bank');
  addOrder(7, 6, 1, 120000, '2027-01-22', 'Lunas', 'Transfer Bank');
  addOrder(8, 6, 1, 120000, '2027-01-25', 'Lunas', 'QRIS');

  // Menunggu Pembayaran (5)
  addOrder(5, 2, 6, 25000, '2026-11-28', 'Menunggu Pembayaran');
  addOrder(6, 1, 3, 35000, '2026-12-28', 'Menunggu Pembayaran');
  addOrder(7, 3, 5, 10000, '2026-12-29', 'Menunggu Pembayaran');
  addOrder(8, 6, 4, 120000, '2027-01-28', 'Menunggu Pembayaran');
  addOrder(4, 5, 2, 100000, '2027-01-29', 'Menunggu Pembayaran');

  // Sisa Dibatalkan (8)
  for (let i = 0; i < 8; i++) {
    addOrder((i % 8) + 1, (i % 6) + 1, 2, 25000, '2026-11-01', 'Dibatalkan');
  }

} else {
  console.log('\n==================================================');
  console.log('  MENJALANKAN ANALISIS DATABASE ASLI (data/tiket.db)');
  console.log('==================================================\n');
  const dbPath = path.resolve(process.cwd(), 'data', 'tiket.db');
  db = new DatabaseSync(dbPath);
}

// Fungsi Cetak Tabel Query
function runQuery(title, sql) {
  console.log(`--------------------------------------------------`);
  console.log(`${title}`);
  console.log(`--------------------------------------------------`);
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all();
    console.table(rows);
  } catch (err) {
    console.error(`Gagal mengeksekusi query: ${err.message}`);
  }
  console.log('\n');
}

// Eksekusi 9 Query Analisis
runQuery('Q1. Penjualan per destinasi', `
SELECT d.nama AS destinasi, k.nama_kategori AS kategori,
       COUNT(p.id) AS jumlah_pesanan,
       COALESCE(SUM(p.jumlah), 0) AS tiket_terjual,
       COALESCE(SUM(p.total), 0) AS pendapatan
FROM destinasi d
JOIN kategori k ON k.id = d.kategori_id
LEFT JOIN pesanan p ON p.destinasi_id = d.id AND p.status = 'Lunas'
GROUP BY d.id
ORDER BY tiket_terjual DESC;
`);

runQuery('Q2. Ringkasan pendapatan', `
SELECT COUNT(*) AS transaksi_berhasil,
       COALESCE(SUM(jumlah_bayar), 0) AS total_pendapatan,
       CAST(COALESCE(AVG(jumlah_bayar), 0) AS INTEGER) AS rata_rata_transaksi
FROM pembayaran
WHERE status = 'Berhasil';
`);

runQuery('Q3. Distribusi status pesanan', `
SELECT status,
       COUNT(*) AS jumlah,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM pesanan), 1) AS persen
FROM pesanan
GROUP BY status
ORDER BY jumlah DESC;
`);

runQuery('Q4. Pendapatan per kategori', `
SELECT k.nama_kategori AS kategori,
       SUM(p.jumlah) AS tiket_terjual,
       SUM(p.total) AS pendapatan
FROM pesanan p
JOIN destinasi d ON d.id = p.destinasi_id
JOIN kategori k ON k.id = d.kategori_id
WHERE p.status = 'Lunas'
GROUP BY k.id
ORDER BY pendapatan DESC;
`);

runQuery('Q5. Metode pembayaran', `
SELECT metode,
       COUNT(*) AS jumlah_transaksi,
       SUM(jumlah_bayar) AS nilai_transaksi
FROM pembayaran
WHERE status = 'Berhasil'
GROUP BY metode
ORDER BY jumlah_transaksi DESC;
`);

runQuery('Q6. Pelanggan dengan belanja terbesar', `
SELECT u.nama AS pelanggan,
       COUNT(p.id) AS jumlah_pesanan,
       SUM(p.total) AS total_belanja
FROM pesanan p
JOIN users u ON u.id = p.user_id
WHERE p.status = 'Lunas'
GROUP BY u.id
ORDER BY total_belanja DESC
LIMIT 3;
`);

runQuery('Q7. Pesanan per bulan kunjungan', `
SELECT substr(tanggal_kunjungan, 1, 7) AS bulan_kunjungan,
       COUNT(*) AS jumlah_pesanan,
       SUM(jumlah) AS jumlah_tiket
FROM pesanan
WHERE status <> 'Dibatalkan'
GROUP BY bulan_kunjungan
ORDER BY bulan_kunjungan;
`);

runQuery('Q8. Perkiraan tingkat keterisian kuota', `
SELECT d.nama AS destinasi,
       d.kuota AS sisa_kuota,
       COALESCE(SUM(CASE WHEN p.status IN ('Menunggu Pembayaran','Lunas') THEN p.jumlah END), 0) AS tiket_terpesan,
       ROUND(100.0 * COALESCE(SUM(CASE WHEN p.status IN ('Menunggu Pembayaran','Lunas') THEN p.jumlah END), 0)
         / (d.kuota + COALESCE(SUM(CASE WHEN p.status IN ('Menunggu Pembayaran','Lunas') THEN p.jumlah END), 0)), 1) AS keterisian_persen
FROM destinasi d
LEFT JOIN pesanan p ON p.destinasi_id = d.id
GROUP BY d.id
ORDER BY keterisian_persen DESC;
`);

runQuery('Q9. Laporan transaksi lengkap (gabungan 5 tabel)', `
SELECT p.id AS no_pesanan, u.nama AS pemesan, d.nama AS destinasi,
       k.nama_kategori AS kategori, p.jumlah, p.total,
       p.status AS status_pesanan, pb.metode, pb.status AS status_bayar
FROM pesanan p
JOIN users u ON u.id = p.user_id
JOIN destinasi d ON d.id = p.destinasi_id
JOIN kategori k ON k.id = d.kategori_id
JOIN pembayaran pb ON pb.pesanan_id = p.id
ORDER BY p.id
LIMIT 5;
`);