/**
 * Executes reCAPTCHA v3 if configured, and validates with the backend API.
 * Gracefully handles v2/v3 key coexistence without blocking legitimate users.
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
                if (typeof window.grecaptcha.execute !== 'function') {
                    resolve(true);
                    return;
                }

                const token = await window.grecaptcha.execute(siteKey, { action }).catch((err) => {
                    console.warn('[reCAPTCHA v3] Key type notice (e.g. v2 checkbox key in use):', err?.message || err);
                    return null;
                });

                if (!token) {
                    // If v3 execute is bypassed for v2 keys, proceed safely
                    resolve(true);
                    return;
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
                // Fail-open on client error so legitimate users aren't locked out
                resolve(true);
            }
        });
    });
}
