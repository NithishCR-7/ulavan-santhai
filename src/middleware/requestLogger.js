/**
 * Universal Request Logger Middleware
 * Displays incoming client IP, origin, route, and response code in terminal
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const origin = req.headers.origin || 'Direct (No Origin)';
  const method = req.method;
  const url = req.originalUrl || req.url;

  // Extract client remote IP address
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'Unknown IP';

  // Log incoming request
  console.log(`\n[REQUEST] ${method} ${url}`);
  console.log(`   Client IP: ${clientIp}`);
  console.log(`   Origin:    ${origin}`);

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (req.body && Object.keys(req.body).length > 0) {
      const sanitized = { ...req.body };
      if (sanitized.password) sanitized.password = '********';
      console.log(`   Payload:   ${JSON.stringify(sanitized)}`);
    }
  }

  // Log response when completed
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusLabel = statusCode >= 400 ? 'FAILED' : 'SUCCESS';

    console.log(`[RESPONSE] [${statusLabel}] ${method} ${url} -> ${statusCode} (${duration}ms)`);
    console.log(`--------------------------------------------------`);
  });

  next();
};
