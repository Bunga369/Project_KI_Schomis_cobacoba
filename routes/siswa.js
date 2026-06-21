// routes/siswa.js
// Endpoint untuk Manajemen Siswa & Absensi:
// - GET    /api/siswa/kelas/:kelasId?tanggal=YYYY-MM-DD  -> daftar siswa di kelas + status absen tanggal itu
// - POST   /api/siswa                                     -> tambah siswa baru
// - PUT    /api/siswa/:id                                  -> edit data siswa
// - DELETE /api/siswa/:id                                  -> hapus siswa
// - PUT    /api/siswa/:id/absensi                          -> ubah status hadir/tidak hadir untuk tanggal tertentu

const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ambil semua siswa dalam 1 kelas, lengkap dengan status absensi pada tanggal tertentu
// Kalau belum ada data absensi di tanggal itu, statusnya dianggap "Hadir" (default)
router.get('/kelas/:kelasId', async (req, res) => {
    try {
        const { kelasId } = req.params;
        const tanggal = req.query.tanggal || new Date().toISOString().slice(0, 10);

        const [rows] = await pool.query(`
            SELECT s.id, s.nis, s.nama, s.tanggal_lahir, s.jenis_kelamin,
                   COALESCE(a.status, 'Hadir') AS status
            FROM siswa s
            LEFT JOIN absensi a ON a.siswa_id = s.id AND a.tanggal = ?
            WHERE s.kelas_id = ?
            ORDER BY s.nis ASC
        `, [tanggal, kelasId]);

        return res.status(200).json({ tanggal, siswa: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// Tambah siswa baru ke sebuah kelas
router.post('/', async (req, res) => {
    try {
        const { kelas_id, nis, nama, tanggal_lahir, jenis_kelamin } = req.body;

        if (!kelas_id || !nis || !nama || !jenis_kelamin) {
            return res.status(400).json({ message: 'NIS, nama, dan jenis kelamin harus diisi.' });
        }

        const [existing] = await pool.query('SELECT id FROM siswa WHERE nis = ?', [nis]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'NIS sudah dipakai siswa lain.' });
        }

        const [result] = await pool.query(
            'INSERT INTO siswa (kelas_id, nis, nama, tanggal_lahir, jenis_kelamin) VALUES (?, ?, ?, ?, ?)',
            [kelas_id, nis, nama, tanggal_lahir || null, jenis_kelamin]
        );

        // Otomatis buat baris nilai kosong untuk siswa baru, supaya langsung muncul di halaman Akademik
        await pool.query('INSERT INTO nilai (siswa_id) VALUES (?)', [result.insertId]);

        return res.status(201).json({ message: 'Siswa berhasil ditambahkan.', id: result.insertId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// Edit data siswa (NIS, nama, tanggal lahir, jenis kelamin)
router.put('/:id', async (req, res) => {
    try {
        const { nis, nama, tanggal_lahir, jenis_kelamin } = req.body;

        if (!nis || !nama || !jenis_kelamin) {
            return res.status(400).json({ message: 'NIS, nama, dan jenis kelamin harus diisi.' });
        }

        await pool.query(
            'UPDATE siswa SET nis = ?, nama = ?, tanggal_lahir = ?, jenis_kelamin = ? WHERE id = ?',
            [nis, nama, tanggal_lahir || null, jenis_kelamin, req.params.id]
        );

        return res.status(200).json({ message: 'Data siswa berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// Hapus siswa
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM siswa WHERE id = ?', [req.params.id]);
        return res.status(200).json({ message: 'Siswa berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// Ubah status absensi siswa pada tanggal tertentu
// Pakai "INSERT ... ON DUPLICATE KEY UPDATE" supaya:
// - kalau belum ada data di tanggal itu -> dibuat baru
// - kalau sudah ada -> tinggal di-update statusnya
router.put('/:id/absensi', async (req, res) => {
    try {
        const { tanggal, status } = req.body;
        const siswaId = req.params.id;

        if (!tanggal || !status) {
            return res.status(400).json({ message: 'Tanggal dan status harus diisi.' });
        }

        await pool.query(`
            INSERT INTO absensi (siswa_id, tanggal, status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE status = ?
        `, [siswaId, tanggal, status, status]);

        return res.status(200).json({ message: 'Status absensi berhasil diperbarui.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
