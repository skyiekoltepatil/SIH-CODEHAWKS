export default function AIAssistant() {
    return (
        <div className="tab-content active" id="ai-assistant">
            <div className="section-header">
                <h3>AI Assistant</h3>
            </div>
            <div className="chat-container">
                <div className="chat-messages" id="chat-messages">
                    <div className="message ai-message">
                        Hello! I am your SIH CODEHAWKS AI Assistant. How can I help you check your application status or find new schemes?
                    </div>
                </div>
                <div className="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type your message..." />
                    <button id="send-msg-btn"><i className="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    );
}
