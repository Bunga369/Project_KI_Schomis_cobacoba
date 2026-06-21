// db.js
// File ini bertugas membuat koneksi (pool) ke database MySQL
// supaya bisa dipakai di file lain (routes, dll) tanpa connect berulang-ulang

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

module.exports = pool;
