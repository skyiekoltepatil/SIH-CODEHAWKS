import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './SchemeApplication.css';

export default function SchemeApplication() {
    const { schemeId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        aadhaar: '',
        documents: []
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user?.uid) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData(prev => ({
                            ...prev,
                            firstName: data.personalDetails?.firstName || '',
                            lastName: data.personalDetails?.lastName || '',
                            email: data.personalDetails?.officialEmail || user.email || '',
                            phone: data.contactDetails?.phoneNumber || '',
                            aadhaar: data.identityDetails?.aadhaarNumber || '',
                        }));
                    }
                } catch (err) {
                    console.error("Error prefilling form:", err);
                }
            }
        };
        fetchProfileData();
    }, [user]);

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handlePrev = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call for application submission
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="application-success">
                <div className="success-icon-wrapper">
                    <i className="fa-solid fa-check"></i>
                </div>
                <h2>Application Submitted!</h2>
                <p>Your application has been successfully submitted. You can track its status in the Applications tab.</p>
                <button className="btn-primary" onClick={() => navigate('/dashboard/applications')}>View My Applications</button>
            </div>
        );
    }

    return (
        <div className="scheme-application-container">
            <div className="application-header">
                <button className="back-btn" onClick={() => navigate('/schemes')}><i className="fa-solid fa-arrow-left"></i> Back to Schemes</button>
                <h2>Apply for Scheme</h2>
                <p>Complete the steps below to submit your application.</p>
            </div>

            <div className="stepper-ui">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                    <div className="step-circle">1</div>
                    <span>Basic Details</span>
                </div>
                <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                    <div className="step-circle">2</div>
                    <span>Documents</span>
                </div>
                <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-circle">3</div>
                    <span>Review & Submit</span>
                </div>
            </div>

            <div className="application-card">
                {currentStep === 1 && (
                    <div className="step-content form-slide-in">
                        <h3>Personal Information</h3>
                        <p className="step-desc">Verify your pre-filled details from your profile.</p>
                        <div className="app-form-grid">
                            <div className="app-floating-input">
                                <input type="text" id="fname" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder=" " />
                                <label htmlFor="fname">First Name</label>
                            </div>
                            <div className="app-floating-input">
                                <input type="text" id="lname" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder=" " />
                                <label htmlFor="lname">Last Name</label>
                            </div>
                            <div className="app-floating-input">
                                <input type="email" id="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder=" " />
                                <label htmlFor="email">Email Address</label>
                            </div>
                            <div className="app-floating-input">
                                <input type="tel" id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder=" " />
                                <label htmlFor="phone">Phone Number</label>
                            </div>
                            <div className="app-floating-input" style={{ gridColumn: '1 / -1' }}>
                                <input type="text" id="aadhaar" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} placeholder=" " />
                                <label htmlFor="aadhaar">Aadhaar Number</label>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="step-content form-slide-in">
                        <h3>Upload Documents</h3>
                        <p className="step-desc">Please upload the required documents for verification.</p>
                        <div className="upload-zone">
                            <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                            <h4>Drag & drop files here</h4>
                            <p>or click to browse (PDF, JPG, PNG)</p>
                            <input type="file" multiple className="file-input-hidden" />
                            <button className="btn-outline">Browse Files</button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="step-content form-slide-in">
                        <h3>Review Application</h3>
                        <p className="step-desc">Please review your details before final submission.</p>
                        <div className="review-box">
                            <div className="review-item">
                                <span className="review-label">Name:</span>
                                <strong>{formData.firstName} {formData.lastName}</strong>
                            </div>
                            <div className="review-item">
                                <span className="review-label">Email:</span>
                                <strong>{formData.email}</strong>
                            </div>
                            <div className="review-item">
                                <span className="review-label">Phone:</span>
                                <strong>{formData.phone || 'Not provided'}</strong>
                            </div>
                            <div className="review-item">
                                <span className="review-label">Aadhaar:</span>
                                <strong>{formData.aadhaar || 'Not provided'}</strong>
                            </div>
                        </div>
                        <div className="declaration-box">
                            <input type="checkbox" id="declare" required />
                            <label htmlFor="declare">I declare that all the information provided is correct to the best of my knowledge.</label>
                        </div>
                    </div>
                )}

                <div className="step-footer">
                    {currentStep > 1 ? (
                        <button className="btn-outline" onClick={handlePrev}>Back</button>
                    ) : <div></div>}
                    
                    {currentStep < 3 ? (
                        <button className="btn-primary" onClick={handleNext}>Next Step</button>
                    ) : (
                        <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
