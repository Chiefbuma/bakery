import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getOptionalEnv } from '@/lib/env';

let ensured = false;

export async function ensureDevelopmentAdmin() {
  if (process.env.NODE_ENV === 'production' || ensured) {
    return;
  }

  const email = getOptionalEnv('DEV_ADMIN_EMAIL');
  const password = getOptionalEnv('DEV_ADMIN_PASSWORD');
  const name = getOptionalEnv('DEV_ADMIN_NAME') || 'Local Admin';

  if (!email || !password) {
    ensured = true;
    return;
  }

  const [rows]: any[] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    ensured = true;
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [`dev-admin-${Date.now()}`, name, email, hashedPassword, 'admin']
  );

  ensured = true;
}
