/**
 * Executes reCAPTCHA v3 and validates the score with the backend API.
 * Rejects if score is below 0.5 (Bot detected).
 * @param {string} action - 'login' or 'register'
 * @returns {Promise<boolean>}
 */
export async function verifyRecaptcha(action = 'login') {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
        console.warn('reCAPTCHA site key missing. Proceeding in dev mode.');
        return true;
    }

    if (!window.grecaptcha) {
        console.warn('reCAPTCHA script not loaded yet.');
        return true;
    }

    return new Promise((resolve, reject) => {
        window.grecaptcha.ready(async () => {
            try {
                const token = await window.grecaptcha.execute(siteKey, { action });
                if (!token) {
                    throw new Error('Failed to generate security token.');
                }

                // Verify the token with backend API endpoint
                const res = await fetch('/api/verify-captcha', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const result = await res.json();

                if (!res.ok || !result.success) {
                    const errorMsg = result.error || 'Security check failed. Access blocked.';
                    reject(new Error(errorMsg));
                    return;
                }

                console.log(`[reCAPTCHA Verified] Action: ${action}, Score: ${result.score}`);
                resolve(true);
            } catch (err) {
                console.error('[reCAPTCHA Error]:', err);
                reject(err);
            }
        });
    });
}
