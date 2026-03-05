
import mysql from 'mysql2/promise';

/**
 * Optimized Database connection pool for MySQL.
 * Configured for Next.js 15 production stability on shared hosting.
 * Connections are established lazily at runtime to prevent build-time ECONNREFUSED.
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
  timezone: '+03:00', // East Africa Time
});

export default pool;
