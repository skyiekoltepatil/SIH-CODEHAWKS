import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const recaptchaSecret = defineSecret('RECAPTCHA_V2_SECRET_KEY');
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export const verifyCaptcha = onRequest(
  { region: 'asia-south1', secrets: [recaptchaSecret] },
  async (req, res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const clientIp = req.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || 'unknown';
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Too many attempts. Please wait 15 minutes before trying again.'
      });
    }

    const { token } = req.body || {};
    if (!token || typeof token !== 'string' || token.length < 20 || token.length > 4096) {
      return res.status(400).json({ success: false, error: 'Invalid security token.' });
    }

    try {
      const secret = recaptchaSecret.value();
      if (!secret) {
        console.error('RECAPTCHA_V2_SECRET_KEY is not configured.');
        return res.status(500).json({ success: false, error: 'Server security misconfiguration.' });
      }

      const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token, remoteip: clientIp })
      });
      const result = await googleResponse.json();

      if (!result.success) {
        console.warn('reCAPTCHA rejected:', result['error-codes']);
        return res.status(403).json({
          success: false,
          error: 'Security check failed. Please solve the captcha and try again.'
        });
      }

      return res.status(200).json({ success: true, version: 'v2' });
    } catch (error) {
      console.error('Error verifying reCAPTCHA token:', error);
      return res.status(500).json({ success: false, error: 'Internal security verification error.' });
    }
  }
);
