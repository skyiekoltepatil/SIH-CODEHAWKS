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

    const token = body?.token;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Security token is missing.' });
    }

    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY is not configured on server.');
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

    // Check if Google verified the token and score is >= 0.5
    if (!data.success || (typeof data.score === 'number' && data.score < 0.5)) {
      console.warn(`[reCAPTCHA Blocked] Score: ${data.score}, Errors:`, data['error-codes']);
      return res.status(403).json({
        success: false,
        error: 'Automated activity detected. Access denied by security policy.',
        score: data.score || 0.0
      });
    }

    return res.status(200).json({
      success: true,
      score: data.score,
      action: data.action
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ success: false, error: 'Internal security verification error.' });
  }
}
