export default function About() {
    return (
        <section className="page active">
            <div className="page-container content-page">
                <div className="page-header text-center">
                    <h2>About SIH CODEHAWKS</h2>
                    <p>Empowering citizens through seamless access to government services.</p>
                </div>
                <div className="about-content">
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&h=400" alt="About Us Banner" className="about-banner" />
                    
                    <h3>Our Mission</h3>
                    <p>SIH CODEHAWKS is a unified digital platform designed to bridge the gap between the government and its citizens. Our mission is to make the discovery, application, and tracking of government schemes and services completely transparent, accessible, and hassle-free for every individual across the nation.</p>
                    
                    <h3>What We Do</h3>
                    <ul>
                        <li><strong>Unified Dashboard:</strong> A single portal to manage all your government interactions.</li>
                        <li><strong>AI-Powered Assistance:</strong> Smart chatbots to guide you through application processes in multiple languages.</li>
                        <li><strong>Real-time Tracking:</strong> Transparent status updates for all your submitted applications.</li>
                        <li><strong>Secure Data Management:</strong> End-to-end encryption ensuring your documents and personal details are always safe.</li>
                    </ul>

                    <h3>Why Choose Us?</h3>
                    <p>Developed as part of the Smart India Hackathon (SIH), CODEHAWKS focuses on citizen-centric design. We eliminate bureaucratic hurdles by auto-filling forms using secure data integration, proactively notifying you about eligible schemes, and providing 24/7 support.</p>
                </div>
            </div>
        </section>
    );
}
