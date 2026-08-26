import React from 'react';
import './VirtualIdCard.css';

export default function VirtualIdCard() {
    const handleDownload = () => {
        alert("Downloading ID Card...");
        // In a real application, you would generate a PDF or image here.
    };

    return (
        <div className="id-card-page-container">
            <div className="id-card-wrapper">
                <div className="virtual-id-card">
                    {/* Header */}
                    <div className="id-card-header">
                        <div className="id-card-logo">
                            <i className="fa-solid fa-building-columns" style={{ color: '#6d28d9', fontSize: '24px' }}></i>
                            <div className="logo-text">
                                <span className="logo-title">ALARD</span>
                                <span className="logo-subtitle">UNIVERSITY</span>
                            </div>
                        </div>
                        <div className="id-card-address">
                            <strong>AUP</strong><br/>
                            Survey No. 47 and 50, Near Rajiv Gandhi<br/>
                            Infotech Park, Marunji Road, Hinjawadi,<br/>
                            Pune 411057.
                        </div>
                    </div>

                    {/* Body */}
                    <div className="id-card-body">
                        <div className="id-card-photo">
                            <img src="https://ui-avatars.com/api/?name=Bhushan+Kolte&background=0D8ABC&color=fff&size=120" alt="Student Photo" />
                        </div>
                        
                        <div className="id-card-details">
                            <h4 className="reg-no">Reg No: 25ET2021010</h4>
                            <h3 className="student-name">BHUSHAN ATUL KOLTE</h3>
                            <p className="course-name">UG(Engg & Tech)</p>
                        </div>
                    </div>

                    {/* Footer / Barcode */}
                    <div className="id-card-footer">
                        {/* CSS Barcode Placeholder */}
                        <div className="barcode-placeholder">
                            <div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div><div className="bar wide"></div>
                            <div className="bar narrow"></div><div className="bar wide"></div><div className="bar wide"></div><div className="bar narrow"></div>
                            <div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div><div className="bar narrow"></div>
                            <div className="bar wide"></div><div className="bar wide"></div><div className="bar narrow"></div><div className="bar wide"></div>
                            <div className="bar narrow"></div><div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div>
                            <div className="bar wide"></div><div className="bar wide"></div><div className="bar narrow"></div><div className="bar narrow"></div>
                        </div>
                        <div className="barcode-text">25ET2021010</div>
                    </div>
                </div>

                <button className="btn-primary download-btn" onClick={handleDownload}>
                    <i className="fa-solid fa-download"></i> Download ID Card
                </button>
            </div>
        </div>
    );
}
