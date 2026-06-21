# SCHOMIS - School Management Information System

Website Absensi & Nilai Sekolah, dibuat dengan Node.js + Express + MySQL.

## Fitur

1. **Welcome Page** (`/index.html`) - halaman pembuka, klik "Masuk" untuk ke halaman login
2. **Login** (`/login.html`) - wajib isi username & password
3. **Register** (`/register.html`) - buat akun baru, setelah berhasil otomatis login
4. **Manajemen Kelas** (`/manajemen-kelas.html`) - CRUD data kelas (tambah/edit/hapus), klik nama kelas untuk lihat siswanya
5. **Manajemen Siswa** (`/manajemen-siswa.html`) - CRUD data siswa per kelas, ubah status hadir/tidak hadir per tanggal (klik badge status)
6. **Akademik** (`/akademik.html`) - lihat & edit nilai siswa (Matematika, B.Inggris, B.Indonesia), rata-rata otomatis, ganti kelas lewat dropdown
7. **Kenaikan Kelas** (`/kenaikan-kelas.html`) - status Lulus/Tidak Lulus dihitung otomatis berdasarkan KKM (saat ini 79, bisa diubah di `routes/nilai.js`)
8. **Keluar** - logout, balik ke Welcome Page

## Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Siapkan database
Buka MySQL (lewat phpMyAdmin, Workbench, atau terminal), lalu jalankan seluruh isi file `database.sql`. Ini akan membuat database `sekolah_app` beserta semua tabelnya.

### 3. Atur file `.env`
Sesuaikan dengan kredensial MySQL kamu:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sekolah_app
PORT=3000
SESSION_SECRET=ganti_dengan_teks_acak
```

### 4. Jalankan server
```bash
npm run dev
```
Lalu buka browser ke: **http://localhost:3000**

### 5. Buat akun pertama
Klik "Masuk" di welcome page → klik "Buat akun baru" → isi form → otomatis login dan masuk ke Manajemen Kelas.

## Struktur Folder

```
PROJECT_KI_FIKS/
├── server.js              -> server utama, semua route didaftarkan di sini
├── db.js                  -> koneksi ke MySQL
├── database.sql           -> script bikin database & tabel
├── .env                   -> konfigurasi (jangan upload ke GitHub!)
├── middleware/
│   └── auth.js            -> cek status login (untuk halaman & API)
├── routes/
│   ├── auth.js             -> login, register, logout
│   ├── kelas.js             -> CRUD kelas
│   ├── siswa.js             -> CRUD siswa + absensi per tanggal
│   └── nilai.js             -> nilai per mapel + kenaikan kelas
└── public/                 -> semua yang dilihat user (HTML, CSS, JS, gambar)
    ├── index.html           -> Welcome page
    ├── login.html
    ├── register.html
    ├── manajemen-kelas.html
    ├── manajemen-siswa.html
    ├── akademik.html
    ├── kenaikan-kelas.html
    ├── css/style.css
    ├── img/logo.svg
    └── js/                  -> 1 file JS per halaman + sidebar.js (dipakai bersama)
```

