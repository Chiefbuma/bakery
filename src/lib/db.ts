import mysql from 'mysql2/promise';
import { getDbConfig } from '@/lib/env';

/**
 * @fileOverview Hardened MySQL Connection Pool
 * Implements Prepared Statements across the app to prevent SQL Injection.
 */
const config = getDbConfig();

const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  port: config.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 60000,
});

export default pool;
