import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="policy-page" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-main)' }}>
      <h1 style={{ marginBottom: '20px', color: '#2563eb' }}>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginTop: '30px' }}>
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us when you create an account, apply for schemes, or communicate with us. This may include your name, email address, phone number, and any government documents you choose to upload for verification.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect to provide, maintain, and improve our services. Specifically, your data is used to match you with eligible government schemes, process applications, and generate your Virtual ID card.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>3. Data Security</h3>
        <p>Your privacy is important to us. We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. We do not sell your personal information to third parties.</p>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h3>4. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact our support team at support@sihcodehawks.gov.in.</p>
      </section>
    </div>
  );
}
