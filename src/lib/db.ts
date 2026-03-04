
import mysql from 'mysql2/promise';

/**
 * Optimized Database connection pool for MySQL.
 * Configured for production concurrency and shared hosting stability.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 15, // Balanced for shared hosting limits
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 20000,
  timezone: '+03:00', // East Africa Time
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Immediate readiness check
pool.getConnection()
  .then(conn => {
    console.log('✅ Wamaghach Database Engine: Ready & Indexed');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Wamaghach Database Connection Error:', err.message);
  });

export default pool;
