import dotenv from 'dotenv';

dotenv.config();

/**
 * Dynamic CORS Configuration
 * 1. Reads explicit frontend origins from .env (CLIENT_URL).
 * 2. Dynamically permits ANY local network IP (192.168.x.x, 10.x.x.x, localhost)
 *    so changing Wi-Fi IPs never cause CORS failures.
 */

// Parse allowed origins from .env (comma-separated)
const parseAllowedOrigins = () => {
  const rawUrls = process.env.CLIENT_URL || '';
  return rawUrls
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

// Regex matching any local network IP / localhost on any port
const DYNAMIC_LOCAL_NETWORK_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

export const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow server-to-server requests or tools like Postman/mobile native (no origin header)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/+$/, '');
    const allowedEnvOrigins = parseAllowedOrigins();

    // 2. Check if explicitly defined in .env CLIENT_URL
    if (allowedEnvOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // 3. Dynamic match: Automatically allow ANY local Wi-Fi / LAN IP (192.168.x.x, 10.x.x.x, localhost)
    if (DYNAMIC_LOCAL_NETWORK_REGEX.test(cleanOrigin)) {
      return callback(null, true);
    }

    // 4. In development mode, permit all origins with dynamic reflection
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Reject unapproved external origins in strict production
    return callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
