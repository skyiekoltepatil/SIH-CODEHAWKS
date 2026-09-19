import React, { useState } from 'react';
import './Faq.css';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I track my application status?",
      answer: "You can track your application status by navigating to the 'My Applications' section in your dashboard. It will show real-time updates for each scheme you've applied to."
    },
    {
      question: "How can I update my profile details?",
      answer: "Go to the 'Profile' section from the sidebar. Here you can edit your personal details, academic information, and upload necessary documents. Click 'Save Profile' when you're done."
    },
    {
      question: "Where can I find new schemes?",
      answer: "The 'All Schemes' tab in the navigation bar or the recommended schemes section in your dashboard overview will show you the latest government initiatives and scholarships available."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! Your data is securely encrypted and stored using standard security protocols. We only share necessary details with relevant authorities when you explicitly apply for a scheme."
    },
    {
      question: "How do I download my Virtual ID Card?",
      answer: "Click on 'Virtual ID Card' in the dashboard sidebar. You will see your real-time generated ID card. You can download it directly to your device by clicking the 'Download' button."
    },
    {
      question: "The Chatbot isn't answering my questions.",
      answer: "Our AI Assistant is currently in the learning phase. For now, it only has a user interface. It will be fully functional and ready to assist you in upcoming updates!"
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="section-header">
        <h3>Frequently Asked Questions</h3>
        <p>Find answers to common questions about SIH CODEHAWKS and scheme applications.</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div 
            className={`faq-item ${openIndex === index ? 'active' : ''}`} 
            key={index}
            onClick={() => toggleAccordion(index)}
          >
            <div className="faq-question">
              <h4>{faq.question}</h4>
              <i className={`fa-solid ${openIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
