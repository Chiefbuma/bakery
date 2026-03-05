
import mysql from 'mysql2/promise';

/**
 * Optimized Database connection pool for MySQL.
 * Connections are established lazily to prevent build-time ECONNREFUSED errors.
 * Configuration is prioritized for shared hosting environments.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 5, // Optimized for shared hosting limits
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 60000,
  timezone: '+03:00', // East Africa Time
});

export default pool;
