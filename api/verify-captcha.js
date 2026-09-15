// In-memory rate limiter — blocks brute-force attacks (max 5 attempts per IP per 15 min)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function isRateLimited(ip) {
  const now = Date.now();

  // Lazy cleanup of expired entries
  if (rateLimitMap.size > 200) {
    for (const [key, entry] of rateLimitMap) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return true;
  }
  return false;
}

export default async function handler(req, res) {
  // --- Security Headers ---
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // --- Origin validation (block requests from unknown domains) ---
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://sih-codehawks.vercel.app',
    'https://sih-codehawks.firebaseapp.com',
    'https://sih-codehawks.web.app'
  ];
  const origin = req.headers?.origin || req.headers?.referer || '';
  const isAllowedOrigin = allowedOrigins.some(allowed => origin.startsWith(allowed)) ||
                          origin.includes('sih-codehawks') ||
                          origin.includes('vercel.app');

  if (origin && !isAllowedOrigin) {
    console.warn(`[BLOCKED] Request from unauthorized origin: ${origin}`);
    return res.status(403).json({ success: false, error: 'Unauthorized origin.' });
  }

  // --- Rate limiting ---
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.headers['x-real-ip'] ||
                   req.socket?.remoteAddress ||
                   'unknown';

  if (isRateLimited(clientIp)) {
    console.warn(`[RATE LIMITED] IP: ${clientIp}`);
    return res.status(429).json({
      success: false,
      error: 'Too many attempts. Please wait 15 minutes before trying again.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { token } = body || {};

    // Use reCAPTCHA v2 secret key
    const secretKey = process.env.RECAPTCHA_V2_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;

    if (!token || typeof token !== 'string' || token.length < 20 || token.length > 4096) {
      return res.status(400).json({ success: false, error: 'Invalid security token.' });
    }

    if (!secretKey) {
      console.warn(`RECAPTCHA_V2_SECRET_KEY is not configured on server.`);
      // In production, block if no secret key is configured
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        return res.status(500).json({ success: false, error: 'Server security misconfiguration.' });
      }
      return res.status(200).json({ success: true, score: 1.0, note: 'Dev mode bypass' });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(clientIp)}`
    });

    const data = await response.json();

    if (!data.success) {
      console.warn(`[reCAPTCHA v2 BLOCKED] IP: ${clientIp}, Errors:`, data['error-codes']);
      return res.status(403).json({
        success: false,
        error: 'Security check failed. Please solve the captcha and try again.'
      });
    }

    console.log(`[reCAPTCHA v2 PASSED] IP: ${clientIp}, Hostname: ${data.hostname}`);

    return res.status(200).json({
      success: true,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ success: false, error: 'Internal security verification error.' });
  }
}
