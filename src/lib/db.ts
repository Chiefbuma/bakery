
import mysql from 'mysql2/promise';

/**
 * Optimized Database connection pool for MySQL.
 * Configured for Next.js 15 production stability on shared hosting.
 * Uses credentials from the Node.js server panel.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 30000,
  timezone: '+03:00', // Matches East Africa Time
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Build-safe connectivity test
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  pool.getConnection()
    .then(conn => {
      console.log('✅ Wamaghach Database Engine: Ready');
      conn.release();
    })
    .catch(err => {
      // Log failure but don't crash process during build
      console.error('❌ Wamaghach Database Connection Error:', err.message);
    });
}

export default pool;
