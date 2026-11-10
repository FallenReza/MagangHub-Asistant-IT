import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Memastikan folder 'data' ada sebelum membuat file database
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Menggunakan globalThis agar koneksi tidak berlipat ganda saat Next.js hot reload
if (!globalThis.db) {
  globalThis.db = new DatabaseSync(path.join(dataDir, 'tiket.db'));
  
  // Mengaktifkan pengecekan foreign key
  globalThis.db.exec('PRAGMA foreign_keys = ON;');

  // Membuat tabel-tabel sesuai spesifikasi
  globalThis.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('user', 'admin')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kategori (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kategori TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS destinasi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kategori_id INTEGER NOT NULL,
      nama TEXT NOT NULL,
      deskripsi TEXT,
      harga INTEGER NOT NULL,
      kuota INTEGER NOT NULL,
      FOREIGN KEY(kategori_id) REFERENCES kategori(id)
    );

    CREATE TABLE IF NOT EXISTS pesanan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      destinasi_id INTEGER NOT NULL,
      jumlah INTEGER NOT NULL,
      total INTEGER NOT NULL,
      tanggal_kunjungan TEXT NOT NULL,
      status TEXT CHECK(status IN ('Menunggu Pembayaran', 'Lunas', 'Dibatalkan')) NOT NULL,
      dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(destinasi_id) REFERENCES destinasi(id)
    );

    CREATE TABLE IF NOT EXISTS pembayaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pesanan_id INTEGER UNIQUE NOT NULL,
      metode TEXT,
      jumlah_bayar INTEGER,
      status TEXT CHECK(status IN ('Belum Bayar', 'Berhasil', 'Gagal')) NOT NULL,
      tanggal_bayar TEXT,
      FOREIGN KEY(pesanan_id) REFERENCES pesanan(id)
    );
  `);

  // Seeding otomatis jika tabel users kosong
  const cekUser = globalThis.db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (cekUser.count === 0) {
    globalThis.db.exec('BEGIN'); // Mulai transaksi manual
    try {
      const insertUser = globalThis.db.prepare('INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)');
      insertUser.run('Admin', 'admin@wisata.test', bcrypt.hashSync('admin123', 10), 'admin');
      insertUser.run('User Biasa', 'user@wisata.test', bcrypt.hashSync('user123', 10), 'user');

      const insertKat = globalThis.db.prepare('INSERT INTO kategori (nama_kategori) VALUES (?)');
      const alam = insertKat.run('Wisata Alam').lastInsertRowid;
      const budaya = insertKat.run('Wisata Budaya').lastInsertRowid;
      const edukasi = insertKat.run('Wisata Edukasi').lastInsertRowid;

      const insertDest = globalThis.db.prepare('INSERT INTO destinasi (kategori_id, nama, deskripsi, harga, kuota) VALUES (?, ?, ?, ?, ?)');
      insertDest.run(alam, 'Gunung Bromo', 'Wisata alam pegunungan', 35000, 100);
      insertDest.run(alam, 'Coban Rondo', 'Wisata air terjun', 25000, 80);
      insertDest.run(budaya, 'Kampung Warna-Warni Jodipan', 'Kampung tematik', 10000, 150);
      insertDest.run(budaya, 'Candi Singosari', 'Wisata sejarah candi', 8000, 60);
      insertDest.run(edukasi, 'Museum Angkut', 'Museum transportasi', 100000, 120);
      insertDest.run(edukasi, 'Batu Secret Zoo', 'Kebun binatang modern', 120000, 90);

      globalThis.db.exec('COMMIT'); // Simpan jika sukses
      console.log('Seeding data awal berhasil!');
    } catch (error) {
      globalThis.db.exec('ROLLBACK'); // Batalkan jika ada error
      console.error('Seeding gagal:', error);
    }
  }
}

export const db = globalThis.db;