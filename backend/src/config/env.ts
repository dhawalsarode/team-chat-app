import dotenv from 'dotenv';

dotenv.config();

// Small helper to avoid silent mistakes
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const PORT = parseInt(getEnv('PORT', '4000'), 10);
const CLIENT_ORIGIN = getEnv('CLIENT_ORIGIN', 'http://localhost:5173');

export const config = {
  port: PORT,
  clientOrigin: CLIENT_ORIGIN
};
