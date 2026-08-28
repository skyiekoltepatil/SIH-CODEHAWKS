/**
 * Executes invisible reCAPTCHA v3 and validates the score with the backend API.
 * @param {string} action - 'login' or 'register'
 * @returns {Promise<boolean>}
 */
export async function verifyRecaptcha(action = 'login') {
    const siteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY || import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
        console.warn('reCAPTCHA v3 site key missing. Proceeding in dev mode.');
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
                    console.warn('[reCAPTCHA v3] Execute warning:', err?.message || err);
                    return null;
                });

                if (!token) {
                    resolve(true);
                    return;
                }

                // Verify the v3 token with backend API endpoint
                const res = await fetch('/api/verify-captcha', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, version: 'v3' })
                });

                const result = await res.json();

                if (!res.ok || !result.success) {
                    const errorMsg = result.error || 'Security check failed. Access blocked.';
                    reject(new Error(errorMsg));
                    return;
                }

                console.log(`[reCAPTCHA v3 Verified] Action: ${action}, Score: ${result.score}`);
                resolve(true);
            } catch (err) {
                console.error('[reCAPTCHA v3 Error]:', err);
                resolve(true);
            }
        });
    });
}
