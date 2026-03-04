
import mysql from 'mysql2/promise';

/**
 * Database connection pool for MySQL.
 * Configured for Wamaghach Kahua-ini Hotel production environment.
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
  timezone: '+03:00' 
});

// Resiliency test on startup (Logging only, doesn't crash the build)
if (process.env.NODE_ENV === 'production') {
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL Database Connected Successfully');
      conn.release();
    })
    .catch(err => {
      console.error('❌ Database Connection Failed:', err.message);
    });
}

export default pool;
