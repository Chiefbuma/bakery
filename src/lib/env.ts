function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function getDbConfig() {
  const port = Number.parseInt(process.env.DB_PORT || '3306', 10);
  return {
    host: requireEnv('DB_HOST'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_DATABASE'),
    port: Number.isNaN(port) ? 3306 : port,
  };
}

export function getJwtSecret() {
  const secret = requireEnv('JWT_SECRET');
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
}

export function getAllowedOrigins() {
  const configured = process.env.ALLOWED_ORIGINS;
  if (configured && configured.trim().length > 0) {
    return configured
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);
  }

  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }

  return [];
}

export function getOptionalEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : null;
}
