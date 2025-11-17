// db.js
const mysql = require('mysql2');
// Load environment variables - try config.env first, then fallback to process.env (for Railway)
try {
  require('dotenv').config({ path: './config.env' });
} catch (e) {
  // If config.env doesn't exist (e.g., in Railway), use process.env directly
  console.log('📝 Using environment variables from process.env (Railway/Production mode)');
}

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise wrapper
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal konek ke database:', err);
    return;
  }
  console.log('✅ Terhubung ke database', process.env.DB_NAME || 'event_db');
  connection.release();
});

// Use promisePool for consistent API
module.exports = {
  pool,
  promisePool,
  query: async (sql, params) => {
    try {
      const [rows] = await promisePool.execute(sql, params);
      return [rows];
    } catch (error) {
      throw error;
    }
  }
};
