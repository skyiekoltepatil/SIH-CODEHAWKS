export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
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

    // Use only reCAPTCHA v2
    const secretKey = process.env.RECAPTCHA_V2_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Security token is missing.' });
    }

    if (!secretKey) {
      console.warn(`RECAPTCHA_V2_SECRET_KEY is not configured on server.`);
      return res.status(200).json({ success: true, score: 1.0, note: 'Dev mode bypass' });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`;

    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    if (!data.success) {
      console.warn(`[reCAPTCHA v2 Blocked] Errors:`, data['error-codes']);
      return res.status(403).json({
        success: false,
        error: 'Security check failed. Please solve the captcha checkbox.'
      });
    }

    return res.status(200).json({
      success: true,
      action: data.action,
      version: 'v2'
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ success: false, error: 'Internal security verification error.' });
  }
}
