import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as userRepository from '../repositories/user.repository.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'ulavan_santhai_jwt_super_secret_key_2026_secure_token';

/**
 * Custom Error: 401 Unauthorized
 */
export class AuthError extends Error {
  constructor(message = 'Authentication required. Invalid or missing credentials.') {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}

/**
 * Custom Error: 403 Forbidden
 */
export class ForbiddenError extends Error {
  constructor(message = 'Access denied. Insufficient permissions.') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

/**
 * Extracts and decodes the JWT token from the request headers
 * @param {object} req - Express request object
 * @returns {object} Decoded JWT payload
 */
export const extractAndVerifyToken = (req) => {
  const authHeader = req.headers?.authorization || req.headers?.['x-access-token'] || req.headers?.['x-auth-token'];

  if (!authHeader) {
    throw new AuthError('Access denied. No authorization token provided.');
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    throw new AuthError('Access denied. Malformed token format.');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthError('Token has expired. Please log in again.');
    }
    throw new AuthError('Invalid token signature or malformed credentials.');
  }
};

/**
 * Gate 2 Assertion: Re-verifies authentication inside the controller
 * Checks both req.user and directly verifies the Authorization header.
 * @param {object} req - Express request object
 * @returns {object} Verified user session payload
 */
export const assertAuthenticated = (req) => {
  if (req?.user && req.user.id) {
    return req.user;
  }

  // Dual-check: If middleware was somehow bypassed or req.user is absent, verify token directly
  const decoded = extractAndVerifyToken(req);
  if (!decoded || !decoded.id) {
    throw new AuthError('Authentication credentials invalid or missing user identifier.');
  }

  req.user = decoded;
  return req.user;
};

/**
 * Gate 2 Assertion: Re-verifies authorization (roles & onboarding prerequisites) inside the controller
 * @param {object} req - Express request object
 * @param {object} options
 * @param {string[]} [options.roles] - Allowed user roles
 * @param {boolean} [options.requireSellerOnboarded] - Whether seller onboarding is required
 * @param {boolean} [options.requireBuyerOnboarded] - Whether buyer onboarding is required
 * @returns {Promise<object>} Verified user record
 */
export const assertAuthorized = async (req, { roles = [], requireSellerOnboarded = false, requireBuyerOnboarded = false } = {}) => {
  const authUser = assertAuthenticated(req);

  // 1. Role validation (if roles specified)
  if (Array.isArray(roles) && roles.length > 0) {
    const userRole = String(authUser.role || 'USER').toUpperCase();
    const hasRole = roles.map(r => r.toUpperCase()).includes(userRole) || userRole === 'ADMIN';
    if (!hasRole) {
      throw new ForbiddenError(`Access denied. Action requires one of: ${roles.join(', ')}.`);
    }
  }

  // 2. Onboarding Lifecycle verification
  if (requireSellerOnboarded || requireBuyerOnboarded) {
    const liveUser = await userRepository.findById(authUser.id);
    if (!liveUser) {
      throw new AuthError('User account not found in database.');
    }

    if (requireSellerOnboarded && !liveUser.sellerOnboarded) {
      throw new ForbiddenError('Access Denied: Please complete seller onboarding first.');
    }

    if (requireBuyerOnboarded && !liveUser.buyerOnboarded) {
      throw new ForbiddenError('Access Denied: Please complete buyer onboarding first.');
    }

    return liveUser;
  }

  return authUser;
};

/**
 * Helper: Strictly extracts verified user ID from JWT context
 * Never trusts req.body.userId, req.body.account, or query parameters.
 * @param {object} req - Express request object
 * @returns {string} Verified user ID
 */
export const getVerifiedUserId = (req) => {
  const user = assertAuthenticated(req);
  return user.id;
};
