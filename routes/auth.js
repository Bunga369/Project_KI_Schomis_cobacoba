// routes/auth.js
// File ini berisi semua "pintu" (endpoint) yang berhubungan dengan akun:
// - POST /api/register  -> bikin akun admin baru (sementara, untuk setup awal)
// - POST /api/login      -> proses login
// - POST /api/logout     -> proses logout
// - GET  /api/me         -> cek siapa yang sedang login

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

// ---------------------------------------------------
// REGISTER - untuk membuat akun admin/guru baru
// Setelah berhasil, user langsung di-auto-login (sesuai alur di Figma)
// ---------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        const { nama, email, username, password } = req.body;

        if (!nama || !email || !username || !password) {
            return res.status(400).json({ message: 'Semua field harus diisi.' });
        }

        // Cek apakah username atau email sudah dipakai
        const [existing] = await pool.query(
            'SELECT id FROM admin WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username atau email sudah dipakai.' });
        }

        // Hash password sebelum disimpan (JANGAN PERNAH simpan password asli ke database)
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO admin (nama, email, username, password) VALUES (?, ?, ?, ?)',
            [nama, email, username, hashedPassword]
        );

        // Auto-login: langsung buat session setelah akun berhasil dibuat
        req.session.userId = result.insertId;
        req.session.nama = nama;
        req.session.username = username;

        return res.status(201).json({ message: 'Akun berhasil dibuat.', nama });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// ---------------------------------------------------
// LOGIN
// ---------------------------------------------------
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password harus diisi.' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM admin WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const user = rows[0];
        const cocok = await bcrypt.compare(password, user.password);

        if (!cocok) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        // Simpan info login ke session
        req.session.userId = user.id;
        req.session.nama = user.nama;
        req.session.username = user.username;

        return res.status(200).json({ message: 'Login berhasil', nama: user.nama });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
});

// ---------------------------------------------------
// LOGOUT
// ---------------------------------------------------
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal logout.' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logout berhasil.' });
    });
});

// ---------------------------------------------------
// CEK SIAPA YANG SEDANG LOGIN (dipakai dashboard untuk menyapa user)
// ---------------------------------------------------
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        return res.status(200).json({
            loggedIn: true,
            nama: req.session.nama,
            username: req.session.username,
        });
    }
    return res.status(200).json({ loggedIn: false });
});

module.exports = router;
