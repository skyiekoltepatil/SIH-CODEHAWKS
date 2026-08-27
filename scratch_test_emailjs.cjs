
async function testEmailJS() {
    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_id: 'service_r1pmbbd',
                template_id: 'template_1zfdogr',
                user_id: 'BStdIXMxI7ovax1Aj', // public key
                template_params: {
                    to_email: 'test@example.com',
                    to_name: 'Test User',
                    otp: '123456',
                    document_type: 'Aadhaar'
                }
            })
        });

        const data = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (err) {
        console.error("Error:", err);
    }
}

testEmailJS();
