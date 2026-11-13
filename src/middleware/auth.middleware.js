import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'ulavan_santhai_jwt_super_secret_key_2026_secure_token';

/**
 * Middleware: Verify Standard JWT Bearer Token
 * Validates 'Authorization: Bearer <token>' header on protected routes.
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-access-token'] || req.headers['x-auth-token'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    // Extract Bearer token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed token format.',
      });
    }

    // Verify signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token has expired. Please log in again.' : 'Invalid token signature.',
    });
  }
};

/**
 * Middleware: Optional JWT Bearer Token
 * Attaches req.user if a valid token is provided, but allows the request through if absent.
 */
export const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-access-token'] || req.headers['x-auth-token'];
  if (authHeader) {
    try {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      }
    } catch {
      // Ignored: fallback to body account or payload
    }
  }
  return next();
};
