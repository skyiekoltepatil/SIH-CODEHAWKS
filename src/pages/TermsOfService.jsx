import React from 'react';

export default function TermsOfService() {
  return (
    <div className="policy-page" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h1 style={{ marginBottom: '20px', color: '#2563eb' }}>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginTop: '30px' }}>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using the SIH CODEHAWKS platform, you agree to be bound by these Terms of Service. If you do not agree with any part of the terms, you may not access the service.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>2. User Responsibilities</h3>
        <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>3. Prohibited Activities</h3>
        <p>You may not use the service for any illegal or unauthorized purpose. You agree not to attempt to interfere with the proper working of the service, or bypass any measures we may use to prevent or restrict access to the service.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>4. Modifications to Service</h3>
        <p>We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.</p>
      </section>
    </div>
  );
}
