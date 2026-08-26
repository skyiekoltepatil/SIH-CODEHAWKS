export default function Services() {
    return (
        <section className="page active">
            <div className="page-container content-page">
                <div className="page-header">
                    <h2>Platform Services</h2>
                    <p>Explore the suite of services provided by the SIH CODEHAWKS platform.</p>
                </div>
                <div className="services-grid">
                    <div className="service-card">
                        <i className="fa-solid fa-id-card service-icon"></i>
                        <h3>Document Wallet</h3>
                        <p>Securely store and share your vital documents like Aadhar, PAN, and Income Certificates directly with government departments.</p>
                    </div>
                    <div className="service-card">
                        <i className="fa-solid fa-language service-icon"></i>
                        <h3>Multilingual Support</h3>
                        <p>Access all services and scheme details in your regional language for better understanding and inclusivity.</p>
                    </div>
                    <div className="service-card">
                        <i className="fa-solid fa-bell service-icon"></i>
                        <h3>Smart Alerts</h3>
                        <p>Receive SMS and email notifications whenever a new scheme matches your profile or an application status changes.</p>
                    </div>
                    <div className="service-card">
                        <i className="fa-solid fa-headset service-icon"></i>
                        <h3>Grievance Redressal</h3>
                        <p>Lodge complaints regarding delayed applications and track the resolution process in real-time.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
