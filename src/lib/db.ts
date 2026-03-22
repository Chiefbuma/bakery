
import mysql from 'mysql2/promise';

/**
 * Optimized Database connection pool for MySQL.
 * Configured specifically for Phusion Passenger environment with provided credentials.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'gledcapi_whiskedelights',
  password: process.env.DB_PASSWORD || 'CnhXfEpdkH2nUQME6xks',
  database: process.env.DB_DATABASE || 'gledcapi_whiskedelights',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 60000,
});

export default pool;
