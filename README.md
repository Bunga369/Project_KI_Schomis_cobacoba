# Cara Jalankan 

1. Install Node.js (jika belum ada): https://nodejs.org
2. Install XAMPP (jika belum ada): https://www.apachefriends.org
3. Buka XAMPP Control Panel → Start MySQL
4. Buka `http://localhost/phpmyadmin` → tab SQL → paste isi `database.sql` → Go
5. Copy `.env.example` → rename jadi `.env`
6. Buka terminal di folder project:
   ```
   npm install
   npm run dev
   ```
7. Buka browser: `http://localhost:3000`
8. Klik "Buat akun baru" untuk membuat akun pertama

## Jika "Terjadi kesalahan server"
→ MySQL belum menyala. Ulangi langkah 3.

## Jika `npm run dev` error EADDRINUSE
→ Jalankan: `taskkill /F /IM node.exe`, lalu ulangi langkah 6.

## Jika npm error "running scripts is disabled"
→ Gunakan Command Prompt, bukan PowerShell.
