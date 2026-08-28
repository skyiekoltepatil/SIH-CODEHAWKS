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

    const { token, version = 'v3' } = body || {};

    // Select the matching Secret Key based on version (v2 or v3)
    const secretKey = version === 'v2' 
      ? (process.env.RECAPTCHA_V2_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY)
      : (process.env.RECAPTCHA_V3_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY);

    if (!token) {
      return res.status(400).json({ success: false, error: 'Security token is missing.' });
    }

    if (!secretKey) {
      console.warn(`RECAPTCHA_${version.toUpperCase()}_SECRET_KEY is not configured on server.`);
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

    // Verification check:
    // - For v3: Must be success AND score >= 0.5
    // - For v2: Must be success
    const isScoreValid = typeof data.score === 'number' ? data.score >= 0.5 : true;

    if (!data.success || !isScoreValid) {
      console.warn(`[reCAPTCHA ${version} Blocked] Score: ${data.score}, Errors:`, data['error-codes']);
      return res.status(403).json({
        success: false,
        error: version === 'v2' 
          ? 'Security check failed. Please solve the captcha checkbox.' 
          : 'Automated activity detected. Access denied.',
        score: data.score || 0.0
      });
    }

    return res.status(200).json({
      success: true,
      score: data.score,
      action: data.action,
      version
    });
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return res.status(500).json({ success: false, error: 'Internal security verification error.' });
  }
}
